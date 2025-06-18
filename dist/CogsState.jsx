"use client";
import { jsx as Ot } from "react/jsx-runtime";
import { useState as K, useRef as J, useEffect as st, useLayoutEffect as dt, useMemo as _t, createElement as ut, useSyncExternalStore as Dt, startTransition as Ut, useCallback as $t } from "react";
import { transformStateFunc as jt, isDeepEqual as q, isFunction as tt, getNestedValue as Z, getDifferences as At, debounce as Ht } from "./utility.js";
import { pushFunc as wt, updateFn as lt, cutFunc as It, ValidationWrapper as Ft, FormControlComponent as Bt } from "./Functions.jsx";
import Wt from "superjson";
import { v4 as Nt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as bt } from "./store.js";
import { useCogsConfig as Vt } from "./CogsStateClient.jsx";
import { applyPatch as zt } from "fast-json-patch";
import qt from "react-use-measure";
function kt(t, i) {
  const m = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, v = m(t) || {};
  g(t, {
    ...v,
    ...i
  });
}
function xt({
  stateKey: t,
  options: i,
  initialOptionsPart: m
}) {
  const g = at(t) || {}, v = m[t] || {}, A = o.getState().setInitialStateOptions, E = { ...v, ...g };
  let y = !1;
  if (i)
    for (const s in i)
      E.hasOwnProperty(s) ? (s == "localStorage" && i[s] && E[s].key !== i[s]?.key && (y = !0, E[s] = i[s]), s == "initialState" && i[s] && E[s] !== i[s] && // Different references
      !q(E[s], i[s]) && (y = !0, E[s] = i[s])) : (y = !0, E[s] = i[s]);
  y && A(t, E);
}
function me(t, { formElements: i, validation: m }) {
  return { initialState: t, formElements: i, validation: m };
}
const he = (t, i) => {
  let m = t;
  const [g, v] = jt(m);
  (Object.keys(v).length > 0 || i && Object.keys(i).length > 0) && Object.keys(v).forEach((y) => {
    v[y] = v[y] || {}, v[y].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...v[y].formElements || {}
      // State-specific overrides
    }, at(y) || o.getState().setInitialStateOptions(y, v[y]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const A = (y, s) => {
    const [I] = K(s?.componentId ?? Nt());
    xt({
      stateKey: y,
      options: s,
      initialOptionsPart: v
    });
    const n = o.getState().cogsStateStore[y] || g[y], S = s?.modifyState ? s.modifyState(n) : n, [F, G] = te(
      S,
      {
        stateKey: y,
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
    return G;
  };
  function E(y, s) {
    xt({ stateKey: y, options: s, initialOptionsPart: v }), s.localStorage && Qt(y, s), pt(y);
  }
  return { useCogsState: A, setCogsOptions: E };
}, {
  setUpdaterState: Tt,
  setState: rt,
  getInitialOptions: at,
  getKeyState: Gt,
  getValidationErrors: Jt,
  setStateLog: Yt,
  updateInitialStateGlobal: Ct,
  addValidationError: Zt,
  removeValidationError: Q,
  setServerSyncActions: Xt
} = o.getState(), Mt = (t, i, m, g, v) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    g
  );
  const A = tt(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (A && g) {
    const E = `${g}-${i}-${A}`;
    let y;
    try {
      y = yt(E)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: v ?? y
    }, I = Wt.serialize(s);
    window.localStorage.setItem(
      E,
      JSON.stringify(I.json)
    );
  }
}, yt = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Qt = (t, i) => {
  const m = o.getState().cogsStateStore[t], { sessionId: g } = Vt(), v = tt(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (v && g) {
    const A = yt(
      `${g}-${t}-${v}`
    );
    if (A && A.lastUpdated > (A.lastSyncedWithServer || 0))
      return rt(t, A.state), pt(t), !0;
  }
  return !1;
}, Lt = (t, i, m, g, v, A) => {
  const E = {
    initialState: i,
    updaterState: vt(
      t,
      g,
      v,
      A
    ),
    state: m
  };
  Ct(t, E.initialState), Tt(t, E.updaterState), rt(t, E.state);
}, pt = (t) => {
  const i = o.getState().stateComponents.get(t);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, Ie = (t, i) => {
  const m = o.getState().stateComponents.get(t);
  if (m) {
    const g = `${t}////${i}`, v = m.components.get(g);
    if ((v ? Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"] : null)?.includes("none"))
      return;
    v && v.forceUpdate();
  }
}, Kt = (t, i, m, g) => {
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
function te(t, {
  stateKey: i,
  serverSync: m,
  localStorage: g,
  formElements: v,
  reactiveDeps: A,
  reactiveType: E,
  componentId: y,
  initialState: s,
  syncUpdate: I,
  dependencies: n,
  serverState: S
} = {}) {
  const [F, G] = K({}), { sessionId: L } = Vt();
  let B = !i;
  const [h] = K(i ?? Nt()), l = o.getState().stateLog[h], gt = J(/* @__PURE__ */ new Set()), et = J(y ?? Nt()), P = J(
    null
  );
  P.current = at(h) ?? null, st(() => {
    if (I && I.stateKey === h && I.path?.[0]) {
      rt(h, (r) => ({
        ...r,
        [I.path[0]]: I.newValue
      }));
      const e = `${I.stateKey}:${I.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: I.timeStamp,
        userId: I.userId
      });
    }
  }, [I]), st(() => {
    if (s) {
      kt(h, {
        initialState: s
      });
      const e = P.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = o.getState().initialStateGlobal[h];
      if (!(c && !q(c, s) || !c) && !a)
        return;
      let u = null;
      const w = tt(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      w && L && (u = yt(`${L}-${h}-${w}`));
      let p = s, O = !1;
      const $ = a ? Date.now() : 0, _ = u?.lastUpdated || 0, x = u?.lastSyncedWithServer || 0;
      a && $ > _ ? (p = e.serverState.data, O = !0) : u && _ > x && (p = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), o.getState().initializeShadowState(h, s), Lt(
        h,
        s,
        p,
        it,
        et.current,
        L
      ), O && w && L && Mt(p, h, e, L, Date.now()), pt(h), (Array.isArray(E) ? E : [E || "component"]).includes("none") || G({});
    }
  }, [
    s,
    S?.status,
    S?.data,
    ...n || []
  ]), dt(() => {
    B && kt(h, {
      serverSync: m,
      formElements: v,
      initialState: s,
      localStorage: g,
      middleware: P.current?.middleware
    });
    const e = `${h}////${et.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => G({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: A || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), G({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const it = (e, r, a, c) => {
    if (Array.isArray(r)) {
      const u = `${h}-${r.join(".")}`;
      gt.current.add(u);
    }
    const f = o.getState();
    rt(h, (u) => {
      const w = tt(e) ? e(u) : e, p = `${h}-${r.join(".")}`;
      if (p) {
        let M = !1, N = f.signalDomElements.get(p);
        if ((!N || N.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const V = r.slice(0, -1), D = Z(w, V);
          if (Array.isArray(D)) {
            M = !0;
            const T = `${h}-${V.join(".")}`;
            N = f.signalDomElements.get(T);
          }
        }
        if (N) {
          const V = M ? Z(w, r.slice(0, -1)) : Z(w, r);
          N.forEach(({ parentId: D, position: T, effect: U }) => {
            const C = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (C) {
              const z = Array.from(C.childNodes);
              if (z[T]) {
                const j = U ? new Function("state", `return (${U})(state)`)(V) : V;
                z[T].textContent = String(j);
              }
            }
          });
        }
      }
      console.log("shadowState", f.shadowStateStore), a.updateType === "update" && (c || P.current?.validation?.key) && r && Q(
        (c || P.current?.validation?.key) + "." + r.join(".")
      );
      const O = r.slice(0, r.length - 1);
      a.updateType === "cut" && P.current?.validation?.key && Q(
        P.current?.validation?.key + "." + O.join(".")
      ), a.updateType === "insert" && P.current?.validation?.key && Jt(
        P.current?.validation?.key + "." + O.join(".")
      ).filter(([N, V]) => {
        let D = N?.split(".").length;
        if (N == O.join(".") && D == O.length - 1) {
          let T = N + "." + O;
          Q(N), Zt(T, V);
        }
      });
      const $ = f.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", $), $) {
        const M = At(u, w), N = new Set(M), V = a.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          D,
          T
        ] of $.components.entries()) {
          let U = !1;
          const C = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
          if (console.log("component", T), !C.includes("none")) {
            if (C.includes("all")) {
              T.forceUpdate();
              continue;
            }
            if (C.includes("component") && ((T.paths.has(V) || T.paths.has("")) && (U = !0), !U))
              for (const z of N) {
                let j = z;
                for (; ; ) {
                  if (T.paths.has(j)) {
                    U = !0;
                    break;
                  }
                  const ct = j.lastIndexOf(".");
                  if (ct !== -1) {
                    const ft = j.substring(
                      0,
                      ct
                    );
                    if (!isNaN(
                      Number(j.substring(ct + 1))
                    ) && T.paths.has(ft)) {
                      U = !0;
                      break;
                    }
                    j = ft;
                  } else
                    j = "";
                  if (j === "")
                    break;
                }
                if (U) break;
              }
            if (!U && C.includes("deps") && T.depsFunction) {
              const z = T.depsFunction(w);
              let j = !1;
              typeof z == "boolean" ? z && (j = !0) : q(T.deps, z) || (T.deps = z, j = !0), j && (U = !0);
            }
            U && T.forceUpdate();
          }
        }
      }
      const _ = Date.now();
      r = r.map((M, N) => {
        const V = r.slice(0, -1), D = Z(w, V);
        return N === r.length - 1 && ["insert", "cut"].includes(a.updateType) ? (D.length - 1).toString() : M;
      });
      const { oldValue: x, newValue: R } = Kt(
        a.updateType,
        u,
        w,
        r
      ), Y = {
        timeStamp: _,
        stateKey: h,
        path: r,
        updateType: a.updateType,
        status: "new",
        oldValue: x,
        newValue: R
      };
      switch (a.updateType) {
        case "update":
          f.updateShadowAtPath(h, r, w);
          break;
        case "insert":
          const M = r.slice(0, -1);
          f.insertShadowArrayElement(h, M, R);
          break;
        case "cut":
          const N = r.slice(0, -1), V = parseInt(r[r.length - 1]);
          f.removeShadowArrayElement(h, N, V);
          break;
      }
      if (Yt(h, (M) => {
        const V = [...M ?? [], Y].reduce((D, T) => {
          const U = `${T.stateKey}:${JSON.stringify(T.path)}`, C = D.get(U);
          return C ? (C.timeStamp = Math.max(C.timeStamp, T.timeStamp), C.newValue = T.newValue, C.oldValue = C.oldValue ?? T.oldValue, C.updateType = T.updateType) : D.set(U, { ...T }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), Mt(
        w,
        h,
        P.current,
        L
      ), P.current?.middleware && P.current.middleware({
        updateLog: l,
        update: Y
      }), P.current?.serverSync) {
        const M = f.serverState[h], N = P.current?.serverSync;
        Xt(h, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: w }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return w;
    });
  };
  o.getState().updaterState[h] || (Tt(
    h,
    vt(
      h,
      it,
      et.current,
      L
    )
  ), o.getState().cogsStateStore[h] || rt(h, t), o.getState().initialStateGlobal[h] || Ct(h, t));
  const d = _t(() => vt(
    h,
    it,
    et.current,
    L
  ), [h, L]);
  return [Gt(h), d];
}
function vt(t, i, m, g) {
  const v = /* @__PURE__ */ new Map();
  let A = 0;
  const E = (I) => {
    const n = I.join(".");
    for (const [S] of v)
      (S === n || S.startsWith(n + ".")) && v.delete(S);
    A++;
  }, y = {
    removeValidation: (I) => {
      I?.validationKey && Q(I.validationKey);
    },
    revertToInitialState: (I) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && Q(n?.key), I?.validationKey && Q(I.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), v.clear(), A++;
      const F = s(S, []), G = at(t), L = tt(G?.localStorage?.key) ? G?.localStorage?.key(S) : G?.localStorage?.key, B = `${g}-${t}-${L}`;
      B && localStorage.removeItem(B), Tt(t, F), rt(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (I) => {
      v.clear(), A++;
      const n = vt(
        t,
        i,
        m,
        g
      ), S = o.getState().initialStateGlobal[t], F = at(t), G = tt(F?.localStorage?.key) ? F?.localStorage?.key(S) : F?.localStorage?.key, L = `${g}-${t}-${G}`;
      return localStorage.getItem(L) && localStorage.removeItem(L), Ut(() => {
        Ct(t, I), o.getState().initializeShadowState(t, I), Tt(t, n), rt(t, I);
        const B = o.getState().stateComponents.get(t);
        B && B.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (B) => n.get()[B]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const I = o.getState().serverState[t];
      return !!(I && q(I, Gt(t)));
    }
  };
  function s(I, n = [], S) {
    const F = n.map(String).join(".");
    v.get(F);
    const G = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(y).forEach((h) => {
      G[h] = y[h];
    });
    const L = {
      apply(h, l, gt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(I) && (S = { ...S, validIndices: void 0 });
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
            const r = e.components.get(d);
            if (r && !r.paths.has("")) {
              const a = n.join(".");
              let c = !0;
              for (const f of r.paths)
                if (a.startsWith(f) && (a === f || a[f.length] === ".")) {
                  c = !1;
                  break;
                }
              c && r.paths.add(a);
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
            const r = o.getState().getNestedState(t, []), a = d?.validation?.key;
            try {
              const c = await e.action(r);
              if (c && !c.success && c.errors && a) {
                o.getState().removeValidationError(a), c.errors.forEach((u) => {
                  const w = [a, ...u.path].join(".");
                  o.getState().addValidationError(w, u.message);
                });
                const f = o.getState().stateComponents.get(t);
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
          const d = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = Z(e, n);
          return q(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = Z(e, n);
            return q(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = at(t), r = tt(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${g}-${t}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(I)) {
          const d = () => S?.validIndices ? I.map((r, a) => ({
            item: r,
            originalIndex: S.validIndices[a]
          })) : o.getState().getNestedState(t, n).map((r, a) => ({
            item: r,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const e = o.getState().getSelectedIndex(t, n.join("."));
              if (e !== void 0)
                return s(
                  I[e],
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
                overscan: a = 6,
                stickToBottom: c = !1,
                dependencies: f = []
              } = e, u = J(!1), w = J(null), [p, O] = K({
                startIndex: 0,
                endIndex: 10
              }), [$, _] = K("IDLE_AT_TOP"), x = J(!1), R = J(0), Y = J(f), M = J(0), [N, V] = K(0);
              st(() => o.getState().subscribeToShadowState(t, () => {
                V((k) => k + 1);
              }), [t]);
              const D = o().getNestedState(
                t,
                n
              ), T = D.length, { totalHeight: U, positions: C } = _t(() => {
                const b = o.getState().getShadowMetadata(t, n) || [];
                let k = 0;
                const W = [];
                for (let H = 0; H < T; H++) {
                  W[H] = k;
                  const nt = b[H]?.virtualizer?.itemHeight;
                  k += nt || r;
                }
                return { totalHeight: k, positions: W };
              }, [
                T,
                t,
                n.join("."),
                r,
                N
              ]), z = _t(() => {
                const b = Math.max(0, p.startIndex), k = Math.min(T, p.endIndex), W = Array.from(
                  { length: k - b },
                  (nt, X) => b + X
                ), H = W.map((nt) => D[nt]);
                return s(H, n, {
                  ...S,
                  validIndices: W
                });
              }, [p.startIndex, p.endIndex, D, T]);
              dt(() => {
                const b = !q(
                  f,
                  Y.current
                ), k = T > R.current;
                if (b) {
                  console.log("TRANSITION: Deps changed -> IDLE_AT_TOP"), _("IDLE_AT_TOP");
                  return;
                }
                k && $ === "LOCKED_AT_BOTTOM" && c && (console.log(
                  "TRANSITION: New items arrived while locked -> GETTING_HEIGHTS"
                ), _("GETTING_HEIGHTS")), R.current = T, Y.current = f;
              }, [T, ...f]), dt(() => {
                const b = w.current;
                if (b) {
                  if ($ === "IDLE_AT_TOP" && c && T > 0)
                    console.log(
                      "ACTION (IDLE_AT_TOP): Data has arrived -> GETTING_HEIGHTS"
                    ), _("GETTING_HEIGHTS");
                  else if ($ === "GETTING_HEIGHTS") {
                    console.log(
                      "ACTION (GETTING_HEIGHTS): Setting range to end and starting loop."
                    ), O({
                      startIndex: Math.max(0, T - 10 - a),
                      endIndex: T
                    });
                    let k;
                    return k = setInterval(() => {
                      const W = T - 1;
                      if (((o.getState().getShadowMetadata(t, n) || [])[W]?.virtualizer?.itemHeight || 0) > 0 && (clearInterval(k), !u.current)) {
                        const X = R.current, ot = T - X;
                        if (ot > 0 && ot <= 3) {
                          const St = C[T - 1] - (C[X] ?? 0);
                          b.scrollBy({
                            top: St,
                            behavior: "smooth"
                          }), console.log(
                            "ACTION (GETTING_HEIGHTS): Small addition -> LOCKED_AT_BOTTOM"
                          ), _("LOCKED_AT_BOTTOM");
                        } else
                          console.log(
                            "ACTION (GETTING_HEIGHTS): Large change -> SCROLLING_TO_BOTTOM"
                          ), _("SCROLLING_TO_BOTTOM");
                      }
                    }, 100), () => clearInterval(k);
                  } else if ($ === "SCROLLING_TO_BOTTOM") {
                    console.log(
                      "ACTION (SCROLLING_TO_BOTTOM): Executing scroll."
                    ), x.current = !0;
                    const k = R.current === 0 ? "auto" : "smooth";
                    b.scrollTo({
                      top: b.scrollHeight,
                      behavior: k
                    });
                    const W = setTimeout(
                      () => {
                        console.log(
                          "ACTION (SCROLLING_TO_BOTTOM): Scroll finished -> LOCKED_AT_BOTTOM"
                        ), x.current = !1, u.current = !1, _("LOCKED_AT_BOTTOM");
                      },
                      k === "smooth" ? 500 : 50
                    );
                    return () => clearTimeout(W);
                  }
                  return () => {
                  };
                }
              }, [$, T, C]), st(() => {
                const b = w.current;
                if (!b) return;
                const k = r, W = () => {
                  if (x.current)
                    return;
                  const H = b.scrollTop;
                  if (Math.abs(H - M.current) < k)
                    return;
                  console.log(
                    `Threshold passed at ${H}px. Recalculating range...`
                  );
                  const { clientHeight: nt } = b;
                  let X = T - 1, ot = 0, Et = 0;
                  for (; ot <= X; ) {
                    const ht = Math.floor((ot + X) / 2);
                    C[ht] < H ? (Et = ht, ot = ht + 1) : X = ht - 1;
                  }
                  const St = Math.max(0, Et - a);
                  let mt = St;
                  const Rt = H + nt;
                  for (; mt < T && C[mt] < Rt; )
                    mt++;
                  O({
                    startIndex: St,
                    endIndex: Math.min(T, mt + a)
                  }), M.current = H;
                };
                return b.addEventListener("scroll", W, {
                  passive: !0
                }), () => b.removeEventListener("scroll", W);
              }, [T, C, r, a, $]);
              const j = $t(() => {
                console.log(
                  "USER ACTION: Clicked scroll button -> SCROLLING_TO_BOTTOM"
                ), _("SCROLLING_TO_BOTTOM");
              }, []), ct = $t(
                (b, k = "smooth") => {
                  w.current && C[b] !== void 0 && (_("IDLE_NOT_AT_BOTTOM"), w.current.scrollTo({
                    top: C[b],
                    behavior: k
                  }));
                },
                [C]
              ), ft = {
                outer: {
                  ref: w,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${U}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${C[p.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: z,
                virtualizerProps: ft,
                scrollToBottom: j,
                scrollToIndex: ct
              };
            };
          if (l === "stateSort")
            return (e) => {
              const a = [...d()].sort(
                (u, w) => e(u.item, w.item)
              ), c = a.map(({ item: u }) => u), f = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, n, f);
            };
          if (l === "stateFilter")
            return (e) => {
              const a = d().filter(
                ({ item: u }, w) => e(u, w)
              ), c = a.map(({ item: u }) => u), f = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, n, f);
            };
          if (l === "stateMap")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (c, f) => f)).map((c, f) => {
                const u = r[c], w = [...n, c.toString()], p = s(u, w, S);
                return e(u, p, {
                  register: () => {
                    const [, $] = K({}), _ = `${m}-${n.join(".")}-${c}`;
                    dt(() => {
                      const x = `${t}////${_}`, R = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return R.components.set(x, {
                        forceUpdate: () => $({}),
                        paths: /* @__PURE__ */ new Set([w.join(".")])
                      }), o.getState().stateComponents.set(t, R), () => {
                        const Y = o.getState().stateComponents.get(t);
                        Y && Y.components.delete(x);
                      };
                    }, [t, _]);
                  },
                  index: f,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                r
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => I.map((a, c) => {
              let f;
              S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
              const u = [...n, f.toString()], w = s(a, u, S);
              return e(
                a,
                w,
                c,
                I,
                s(I, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => ut(ee, {
              proxy: {
                _stateKey: t,
                _path: n,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateList")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (c, f) => f)).map((c, f) => {
                const u = r[c], w = [...n, c.toString()], p = s(u, w, S), O = `${m}-${n.join(".")}-${c}`;
                return ut(re, {
                  key: c,
                  stateKey: t,
                  itemComponentId: O,
                  itemPath: w,
                  children: e(
                    u,
                    p,
                    f,
                    r,
                    s(r, n, S)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const r = I;
              v.clear(), A++;
              const a = r.flatMap(
                (c) => c[e] ?? []
              );
              return s(
                a,
                [...n, "[*]", e],
                S
              );
            };
          if (l === "index")
            return (e) => {
              const r = I[e];
              return s(r, [...n, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = o.getState().getNestedState(t, n);
              if (e.length === 0) return;
              const r = e.length - 1, a = e[r], c = [...n, r.toString()];
              return s(a, c);
            };
          if (l === "insert")
            return (e) => (E(n), wt(i, e, n, t), s(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, a) => {
              const c = o.getState().getNestedState(t, n), f = tt(e) ? e(c) : e;
              let u = null;
              if (!c.some((p) => {
                if (r) {
                  const $ = r.every(
                    (_) => q(p[_], f[_])
                  );
                  return $ && (u = p), $;
                }
                const O = q(p, f);
                return O && (u = p), O;
              }))
                E(n), wt(i, f, n, t);
              else if (a && u) {
                const p = a(u), O = c.map(
                  ($) => q($, u) ? p : $
                );
                E(n), lt(i, O, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return E(n), It(i, n, t, e), s(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < I.length; r++)
                I[r] === e && It(i, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = I.findIndex((a) => a === e);
              r > -1 ? It(i, n, t, r) : wt(i, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const a = d().find(
                ({ item: f }, u) => e(f, u)
              );
              if (!a) return;
              const c = [...n, a.originalIndex.toString()];
              return s(a.item, c, S);
            };
          if (l === "findWith")
            return (e, r) => {
              const c = d().find(
                ({ item: u }) => u[e] === r
              );
              if (!c) return;
              const f = [...n, c.originalIndex.toString()];
              return s(c.item, f, S);
            };
        }
        const et = n[n.length - 1];
        if (!isNaN(Number(et))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => It(
              i,
              d,
              t,
              Number(et)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(I)) {
              const d = o.getState().getNestedState(t, n);
              return S.validIndices.map((e) => d[e]);
            }
            return o.getState().getNestedState(t, n);
          };
        if (l === "$derive")
          return (d) => Pt({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Pt({
            _stateKey: t,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${t}:${n.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => yt(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), a = e.join(".");
            d ? o.getState().setSelectedIndex(t, a, r) : o.getState().setSelectedIndex(t, a, void 0);
            const c = o.getState().getNestedState(t, [...e]);
            lt(i, c, e), E(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), e = Number(n[n.length - 1]), r = d.join("."), a = o.getState().getSelectedIndex(t, r);
            o.getState().setSelectedIndex(
              t,
              r,
              a === e ? void 0 : e
            );
            const c = o.getState().getNestedState(t, [...d]);
            lt(i, c, d), E(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], a = zt(e, d).newDocument;
              Lt(
                t,
                o.getState().initialStateGlobal[t],
                a,
                i,
                m,
                g
              );
              const c = o.getState().stateComponents.get(t);
              if (c) {
                const f = At(e, a), u = new Set(f);
                for (const [
                  w,
                  p
                ] of c.components.entries()) {
                  let O = !1;
                  const $ = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!$.includes("none")) {
                    if ($.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if ($.includes("component") && (p.paths.has("") && (O = !0), !O))
                      for (const _ of u) {
                        if (p.paths.has(_)) {
                          O = !0;
                          break;
                        }
                        let x = _.lastIndexOf(".");
                        for (; x !== -1; ) {
                          const R = _.substring(0, x);
                          if (p.paths.has(R)) {
                            O = !0;
                            break;
                          }
                          const Y = _.substring(
                            x + 1
                          );
                          if (!isNaN(Number(Y))) {
                            const M = R.lastIndexOf(".");
                            if (M !== -1) {
                              const N = R.substring(
                                0,
                                M
                              );
                              if (p.paths.has(N)) {
                                O = !0;
                                break;
                              }
                            }
                          }
                          x = R.lastIndexOf(".");
                        }
                        if (O) break;
                      }
                    if (!O && $.includes("deps") && p.depsFunction) {
                      const _ = p.depsFunction(a);
                      let x = !1;
                      typeof _ == "boolean" ? _ && (x = !0) : q(p.deps, _) || (p.deps = _, x = !0), x && (O = !0);
                    }
                    O && p.forceUpdate();
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
              const r = o.getState().cogsStateStore[t];
              try {
                const a = o.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([f]) => {
                  f && f.startsWith(d.key) && Q(f);
                });
                const c = d.zodSchema.safeParse(r);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const w = u.path, p = u.message, O = [d.key, ...w].join(".");
                  e(O, p);
                }), pt(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
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
            return y.revertToInitialState;
          if (l === "updateInitialState") return y.updateInitialState;
          if (l === "removeValidation") return y.removeValidation;
        }
        if (l === "getFormRef")
          return () => bt.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ Ot(
            Ft,
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
        if (l === "_isServerSynced") return y._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Ht(() => {
                lt(i, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              lt(i, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            E(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ Ot(
            Bt,
            {
              setState: i,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const P = [...n, l], it = o.getState().getNestedState(t, P);
        return s(it, P, S);
      }
    }, B = new Proxy(G, L);
    return v.set(F, {
      proxy: B,
      stateVersion: A
    }), B;
  }
  return s(
    o.getState().getNestedState(t, [])
  );
}
function Pt(t) {
  return ut(ne, { proxy: t });
}
function ee({
  proxy: t,
  rebuildStateShape: i
}) {
  const m = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? i(
    m,
    t._path
  ).stateMapNoRender(
    (v, A, E, y, s) => t._mapFn(v, A, E, y, s)
  ) : null;
}
function ne({
  proxy: t
}) {
  const i = J(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return st(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const v = g.parentElement, E = Array.from(v.childNodes).indexOf(g);
    let y = v.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, v.setAttribute("data-parent-id", y));
    const I = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: E,
      effect: t._effect
    };
    o.getState().addSignalElement(m, I);
    const n = o.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (G) {
        console.error("Error evaluating effect function during mount:", G), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const F = document.createTextNode(String(S));
    g.replaceWith(F);
  }, [t._stateKey, t._path.join("."), t._effect]), ut("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function Te(t) {
  const i = Dt(
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
  return ut("text", {}, String(i));
}
function re({
  stateKey: t,
  itemComponentId: i,
  itemPath: m,
  children: g
}) {
  const [, v] = K({}), [A, E] = qt(), y = J(null);
  return st(() => {
    E.height > 0 && E.height !== y.current && (y.current = E.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: E.height
      }
    }));
  }, [E.height, t, m]), dt(() => {
    const s = `${t}////${i}`, I = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return I.components.set(s, {
      forceUpdate: () => v({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), o.getState().stateComponents.set(t, I), () => {
      const n = o.getState().stateComponents.get(t);
      n && n.components.delete(s);
    };
  }, [t, i, m.join(".")]), /* @__PURE__ */ Ot("div", { ref: A, children: g });
}
export {
  Pt as $cogsSignal,
  Te as $cogsSignalStore,
  me as addStateOptions,
  he as createCogsState,
  Ie as notifyComponent,
  te as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
