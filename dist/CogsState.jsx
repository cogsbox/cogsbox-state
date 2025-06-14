"use client";
import { jsx as It } from "react/jsx-runtime";
import { useState as X, useRef as Y, useEffect as st, useLayoutEffect as at, useMemo as Vt, createElement as ct, useSyncExternalStore as At, startTransition as Nt, useCallback as gt } from "react";
import { transformStateFunc as Ct, isDeepEqual as H, isFunction as J, getNestedValue as B, getDifferences as St, debounce as Pt } from "./utility.js";
import { pushFunc as ft, updateFn as tt, cutFunc as ot, ValidationWrapper as _t, FormControlComponent as Ot } from "./Functions.jsx";
import Mt from "superjson";
import { v4 as mt } from "uuid";
import "zod";
import { getGlobalStore as n, formRefStore as pt } from "./store.js";
import { useCogsConfig as bt } from "./CogsStateClient.jsx";
import { applyPatch as jt } from "fast-json-patch";
function wt(t, s) {
  const v = n.getState().getInitialOptions, g = n.getState().setInitialStateOptions, h = v(t) || {};
  g(t, {
    ...h,
    ...s
  });
}
function Et({
  stateKey: t,
  options: s,
  initialOptionsPart: v
}) {
  const g = Q(t) || {}, h = v[t] || {}, V = n.getState().setInitialStateOptions, E = { ...h, ...g };
  let I = !1;
  if (s)
    for (const i in s)
      E.hasOwnProperty(i) ? (i == "localStorage" && s[i] && E[i].key !== s[i]?.key && (I = !0, E[i] = s[i]), i == "initialState" && s[i] && E[i] !== s[i] && // Different references
      !H(E[i], s[i]) && (I = !0, E[i] = s[i])) : (I = !0, E[i] = s[i]);
  I && V(t, E);
}
function ne(t, { formElements: s, validation: v }) {
  return { initialState: t, formElements: s, validation: v };
}
const re = (t, s) => {
  let v = t;
  const [g, h] = Ct(v);
  (Object.keys(h).length > 0 || s && Object.keys(s).length > 0) && Object.keys(h).forEach((I) => {
    h[I] = h[I] || {}, h[I].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...h[I].formElements || {}
      // State-specific overrides
    }, Q(I) || n.getState().setInitialStateOptions(I, h[I]);
  }), n.getState().setInitialStates(g), n.getState().setCreatedState(g);
  const V = (I, i) => {
    const [y] = X(i?.componentId ?? mt());
    Et({
      stateKey: I,
      options: i,
      initialOptionsPart: h
    });
    const o = n.getState().cogsStateStore[I] || g[I], S = i?.modifyState ? i.modifyState(o) : o, [G, M] = Lt(
      S,
      {
        stateKey: I,
        syncUpdate: i?.syncUpdate,
        componentId: y,
        localStorage: i?.localStorage,
        middleware: i?.middleware,
        enabledSync: i?.enabledSync,
        reactiveType: i?.reactiveType,
        reactiveDeps: i?.reactiveDeps,
        initialState: i?.initialState,
        dependencies: i?.dependencies,
        serverState: i?.serverState
      }
    );
    return M;
  };
  function E(I, i) {
    Et({ stateKey: I, options: i, initialOptionsPart: h }), i.localStorage && Wt(I, i), dt(I);
  }
  return { useCogsState: V, setCogsOptions: E };
}, {
  setUpdaterState: it,
  setState: Z,
  getInitialOptions: Q,
  getKeyState: kt,
  getValidationErrors: Rt,
  setStateLog: Ut,
  updateInitialStateGlobal: vt,
  addValidationError: Ft,
  removeValidationError: z,
  setServerSyncActions: Dt
} = n.getState(), $t = (t, s, v, g, h) => {
  v?.log && console.log(
    "saving to localstorage",
    s,
    v.localStorage?.key,
    g
  );
  const V = J(v?.localStorage?.key) ? v.localStorage?.key(t) : v?.localStorage?.key;
  if (V && g) {
    const E = `${g}-${s}-${V}`;
    let I;
    try {
      I = lt(E)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: h ?? I
    }, y = Mt.serialize(i);
    window.localStorage.setItem(
      E,
      JSON.stringify(y.json)
    );
  }
}, lt = (t) => {
  if (!t) return null;
  try {
    const s = window.localStorage.getItem(t);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, Wt = (t, s) => {
  const v = n.getState().cogsStateStore[t], { sessionId: g } = bt(), h = J(s?.localStorage?.key) ? s.localStorage.key(v) : s?.localStorage?.key;
  if (h && g) {
    const V = lt(
      `${g}-${t}-${h}`
    );
    if (V && V.lastUpdated > (V.lastSyncedWithServer || 0))
      return Z(t, V.state), dt(t), !0;
  }
  return !1;
}, xt = (t, s, v, g, h, V) => {
  const E = {
    initialState: s,
    updaterState: et(
      t,
      g,
      h,
      V
    ),
    state: v
  };
  vt(t, E.initialState), it(t, E.updaterState), Z(t, E.state);
}, dt = (t) => {
  const s = n.getState().stateComponents.get(t);
  if (!s) return;
  const v = /* @__PURE__ */ new Set();
  s.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || v.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    v.forEach((g) => g());
  });
}, oe = (t, s) => {
  const v = n.getState().stateComponents.get(t);
  if (v) {
    const g = `${t}////${s}`, h = v.components.get(g);
    if ((h ? Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"] : null)?.includes("none"))
      return;
    h && h.forceUpdate();
  }
}, Gt = (t, s, v, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: B(s, g),
        newValue: B(v, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: B(v, g)
      };
    case "cut":
      return {
        oldValue: B(s, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Lt(t, {
  stateKey: s,
  serverSync: v,
  localStorage: g,
  formElements: h,
  reactiveDeps: V,
  reactiveType: E,
  componentId: I,
  initialState: i,
  syncUpdate: y,
  dependencies: o,
  serverState: S
} = {}) {
  const [G, M] = X({}), { sessionId: j } = bt();
  let L = !s;
  const [m] = X(s ?? mt()), l = n.getState().stateLog[m], nt = Y(/* @__PURE__ */ new Set()), q = Y(I ?? mt()), _ = Y(
    null
  );
  _.current = Q(m) ?? null, st(() => {
    if (y && y.stateKey === m && y.path?.[0]) {
      Z(m, (r) => ({
        ...r,
        [y.path[0]]: y.newValue
      }));
      const e = `${y.stateKey}:${y.path.join(".")}`;
      n.getState().setSyncInfo(e, {
        timeStamp: y.timeStamp,
        userId: y.userId
      });
    }
  }, [y]), st(() => {
    if (i) {
      wt(m, {
        initialState: i
      });
      const e = _.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = n.getState().initialStateGlobal[m];
      if (!(c && !H(c, i) || !c) && !a)
        return;
      let u = null;
      const k = J(e?.localStorage?.key) ? e?.localStorage?.key(i) : e?.localStorage?.key;
      k && j && (u = lt(`${j}-${m}-${k}`));
      let p = i, w = !1;
      const N = a ? Date.now() : 0, A = u?.lastUpdated || 0, C = u?.lastSyncedWithServer || 0;
      a && N > A ? (p = e.serverState.data, w = !0) : u && A > C && (p = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), xt(
        m,
        i,
        p,
        K,
        q.current,
        j
      ), w && k && j && $t(p, m, e, j, Date.now()), dt(m), (Array.isArray(E) ? E : [E || "component"]).includes("none") || M({});
    }
  }, [
    i,
    S?.status,
    S?.data,
    ...o || []
  ]), at(() => {
    L && wt(m, {
      serverSync: v,
      formElements: h,
      initialState: i,
      localStorage: g,
      middleware: _.current?.middleware
    });
    const e = `${m}////${q.current}`, r = n.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => M({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: V || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), n.getState().stateComponents.set(m, r), M({}), () => {
      const a = `${m}////${q.current}`;
      r && (r.components.delete(a), r.components.size === 0 && n.getState().stateComponents.delete(m));
    };
  }, []);
  const K = (e, r, a, c) => {
    if (Array.isArray(r)) {
      const f = `${m}-${r.join(".")}`;
      nt.current.add(f);
    }
    Z(m, (f) => {
      const u = J(e) ? e(f) : e, k = `${m}-${r.join(".")}`;
      if (k) {
        let U = !1, x = n.getState().signalDomElements.get(k);
        if ((!x || x.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const O = r.slice(0, -1), D = B(u, O);
          if (Array.isArray(D)) {
            U = !0;
            const T = `${m}-${O.join(".")}`;
            x = n.getState().signalDomElements.get(T);
          }
        }
        if (x) {
          const O = U ? B(u, r.slice(0, -1)) : B(u, r);
          x.forEach(({ parentId: D, position: T, effect: $ }) => {
            const b = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (b) {
              const F = Array.from(b.childNodes);
              if (F[T]) {
                const P = $ ? new Function("state", `return (${$})(state)`)(O) : O;
                F[T].textContent = String(P);
              }
            }
          });
        }
      }
      a.updateType === "update" && (c || _.current?.validation?.key) && r && z(
        (c || _.current?.validation?.key) + "." + r.join(".")
      );
      const p = r.slice(0, r.length - 1);
      a.updateType === "cut" && _.current?.validation?.key && z(
        _.current?.validation?.key + "." + p.join(".")
      ), a.updateType === "insert" && _.current?.validation?.key && Rt(
        _.current?.validation?.key + "." + p.join(".")
      ).filter(([x, O]) => {
        let D = x?.split(".").length;
        if (x == p.join(".") && D == p.length - 1) {
          let T = x + "." + p;
          z(x), Ft(T, O);
        }
      });
      const w = n.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", w), w) {
        const U = St(f, u), x = new Set(U), O = a.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          D,
          T
        ] of w.components.entries()) {
          let $ = !1;
          const b = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
          if (console.log("component", T), !b.includes("none")) {
            if (b.includes("all")) {
              T.forceUpdate();
              continue;
            }
            if (b.includes("component") && ((T.paths.has(O) || T.paths.has("")) && ($ = !0), !$))
              for (const F of x) {
                let P = F;
                for (; ; ) {
                  if (T.paths.has(P)) {
                    $ = !0;
                    break;
                  }
                  const R = P.lastIndexOf(".");
                  if (R !== -1) {
                    const rt = P.substring(
                      0,
                      R
                    );
                    if (!isNaN(
                      Number(P.substring(R + 1))
                    ) && T.paths.has(rt)) {
                      $ = !0;
                      break;
                    }
                    P = rt;
                  } else
                    P = "";
                  if (P === "")
                    break;
                }
                if ($) break;
              }
            if (!$ && b.includes("deps") && T.depsFunction) {
              const F = T.depsFunction(u);
              let P = !1;
              typeof F == "boolean" ? F && (P = !0) : H(T.deps, F) || (T.deps = F, P = !0), P && ($ = !0);
            }
            $ && T.forceUpdate();
          }
        }
      }
      const N = Date.now();
      r = r.map((U, x) => {
        const O = r.slice(0, -1), D = B(u, O);
        return x === r.length - 1 && ["insert", "cut"].includes(a.updateType) ? (D.length - 1).toString() : U;
      });
      const { oldValue: A, newValue: C } = Gt(
        a.updateType,
        f,
        u,
        r
      ), W = {
        timeStamp: N,
        stateKey: m,
        path: r,
        updateType: a.updateType,
        status: "new",
        oldValue: A,
        newValue: C
      };
      if (Ut(m, (U) => {
        const O = [...U ?? [], W].reduce((D, T) => {
          const $ = `${T.stateKey}:${JSON.stringify(T.path)}`, b = D.get($);
          return b ? (b.timeStamp = Math.max(b.timeStamp, T.timeStamp), b.newValue = T.newValue, b.oldValue = b.oldValue ?? T.oldValue, b.updateType = T.updateType) : D.set($, { ...T }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), $t(
        u,
        m,
        _.current,
        j
      ), _.current?.middleware && _.current.middleware({
        updateLog: l,
        update: W
      }), _.current?.serverSync) {
        const U = n.getState().serverState[m], x = _.current?.serverSync;
        Dt(m, {
          syncKey: typeof x.syncKey == "string" ? x.syncKey : x.syncKey({ state: u }),
          rollBackState: U,
          actionTimeStamp: Date.now() + (x.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return u;
    });
  };
  n.getState().updaterState[m] || (it(
    m,
    et(
      m,
      K,
      q.current,
      j
    )
  ), n.getState().cogsStateStore[m] || Z(m, t), n.getState().initialStateGlobal[m] || vt(m, t));
  const d = Vt(() => et(
    m,
    K,
    q.current,
    j
  ), [m, j]);
  return [kt(m), d];
}
function et(t, s, v, g) {
  const h = /* @__PURE__ */ new Map();
  let V = 0;
  const E = (y) => {
    const o = y.join(".");
    for (const [S] of h)
      (S === o || S.startsWith(o + ".")) && h.delete(S);
    V++;
  }, I = {
    removeValidation: (y) => {
      y?.validationKey && z(y.validationKey);
    },
    revertToInitialState: (y) => {
      const o = n.getState().getInitialOptions(t)?.validation;
      o?.key && z(o?.key), y?.validationKey && z(y.validationKey);
      const S = n.getState().initialStateGlobal[t];
      n.getState().clearSelectedIndexesForState(t), h.clear(), V++;
      const G = i(S, []), M = Q(t), j = J(M?.localStorage?.key) ? M?.localStorage?.key(S) : M?.localStorage?.key, L = `${g}-${t}-${j}`;
      L && localStorage.removeItem(L), it(t, G), Z(t, S);
      const m = n.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (y) => {
      h.clear(), V++;
      const o = et(
        t,
        s,
        v,
        g
      ), S = n.getState().initialStateGlobal[t], G = Q(t), M = J(G?.localStorage?.key) ? G?.localStorage?.key(S) : G?.localStorage?.key, j = `${g}-${t}-${M}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), Nt(() => {
        vt(t, y), it(t, o), Z(t, y);
        const L = n.getState().stateComponents.get(t);
        L && L.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (L) => o.get()[L]
      };
    },
    _initialState: n.getState().initialStateGlobal[t],
    _serverState: n.getState().serverState[t],
    _isLoading: n.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const y = n.getState().serverState[t];
      return !!(y && H(y, kt(t)));
    }
  };
  function i(y, o = [], S) {
    const G = o.map(String).join(".");
    h.get(G);
    const M = function() {
      return n().getNestedState(t, o);
    };
    Object.keys(I).forEach((m) => {
      M[m] = I[m];
    });
    const j = {
      apply(m, l, nt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${o.join(".")}`
        ), console.trace("Apply trap stack trace"), n().getNestedState(t, o);
      },
      get(m, l) {
        S?.validIndices && !Array.isArray(y) && (S = { ...S, validIndices: void 0 });
        const nt = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !nt.has(l)) {
          const d = `${t}////${v}`, e = n.getState().stateComponents.get(t);
          if (e) {
            const r = e.components.get(d);
            if (r && !r.paths.has("")) {
              const a = o.join(".");
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
          return () => St(
            n.getState().cogsStateStore[t],
            n.getState().initialStateGlobal[t]
          );
        if (l === "sync" && o.length === 0)
          return async function() {
            const d = n.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const r = n.getState().getNestedState(t, []), a = d?.validation?.key;
            try {
              const c = await e.action(r);
              if (c && !c.success && c.errors && a) {
                n.getState().removeValidationError(a), c.errors.forEach((u) => {
                  const k = [a, ...u.path].join(".");
                  n.getState().addValidationError(k, u.message);
                });
                const f = n.getState().stateComponents.get(t);
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
          const d = n.getState().getNestedState(t, o), e = n.getState().initialStateGlobal[t], r = B(e, o);
          return H(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = n().getNestedState(
              t,
              o
            ), e = n.getState().initialStateGlobal[t], r = B(e, o);
            return H(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = n.getState().initialStateGlobal[t], e = Q(t), r = J(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${g}-${t}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = n.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return n.getState().getValidationErrors(d.key + "." + o.join("."));
          };
        if (Array.isArray(y)) {
          const d = () => S?.validIndices ? y.map((r, a) => ({
            item: r,
            originalIndex: S.validIndices[a]
          })) : n.getState().getNestedState(t, o).map((r, a) => ({
            item: r,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const e = n.getState().getSelectedIndex(t, o.join("."));
              if (e !== void 0)
                return i(
                  y[e],
                  [...o, e.toString()],
                  S
                );
            };
          if (l === "clearSelected")
            return () => {
              n.getState().clearSelectedIndex({ stateKey: t, path: o });
            };
          if (l === "getSelectedIndex")
            return () => n.getState().getSelectedIndex(t, o.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (e) => {
              const {
                itemHeight: r,
                overscan: a = 5,
                stickToBottom: c = !1
              } = e;
              if (typeof r != "number" || r <= 0)
                throw new Error(
                  "[cogs-state] `useVirtualView` requires a positive number for `itemHeight` option."
                );
              const f = Y(null), u = Y(!0), [k, p] = X({
                startIndex: 0,
                endIndex: 10
              }), w = Y(
                `${t}-virtual-${o.join(".")}-${Math.random()}`
              ).current, [, N] = X({}), A = n().getNestedState(
                t,
                o
              ), C = A.length, W = C * r;
              at(() => {
                const $ = A.slice(
                  k.startIndex,
                  k.endIndex
                );
                n.getState().setState(w, $), n.getState().updaterState[w] || n.getState().setUpdaterState(
                  w,
                  et(
                    w,
                    s,
                    v,
                    g
                  )
                );
                const b = `${t}////${v}-virtual`, F = n.getState().stateComponents.get(t) || {
                  components: /* @__PURE__ */ new Map()
                };
                return F.components.set(b, {
                  forceUpdate: () => N({}),
                  paths: /* @__PURE__ */ new Set([o.join(".")]),
                  reactiveType: ["component"]
                }), n.getState().stateComponents.set(t, F), () => {
                  const P = n.getState().stateComponents.get(t);
                  P && P.components.delete(b);
                  const R = n.getState();
                  delete R.cogsStateStore[w], delete R.updaterState[w], R.stateComponents.delete(w);
                };
              }, []), st(() => {
                const $ = A.slice(
                  k.startIndex,
                  k.endIndex
                );
                n.getState().setState(w, $);
              }, [
                k.startIndex,
                k.endIndex,
                w,
                A.length
              ]), at(() => {
                const $ = f.current;
                if (!$) return;
                const b = () => {
                  const R = $.scrollTop, rt = $.clientHeight, ht = Math.max(
                    0,
                    Math.floor(R / r) - a
                  ), yt = Math.min(
                    C,
                    Math.ceil((R + rt) / r) + a
                  );
                  p((ut) => ut.startIndex === ht && ut.endIndex === yt ? ut : { startIndex: ht, endIndex: yt });
                }, F = () => {
                  const R = f.current;
                  R && (u.current = R.scrollHeight > 0 && Math.abs(
                    R.scrollHeight - R.scrollTop - R.clientHeight
                  ) < 1, b());
                };
                b(), $.addEventListener("scroll", F, {
                  passive: !0
                });
                const P = new ResizeObserver(b);
                return P.observe($), c && u.current && $.scrollTo({
                  top: $.scrollHeight,
                  behavior: "auto"
                }), () => {
                  $.removeEventListener("scroll", F), P.disconnect();
                };
              }, [C, r, a, c]);
              const U = n.getState().updaterState[w], x = gt(
                ($, b = "auto") => {
                  f.current?.scrollTo({ top: $, behavior: b });
                },
                []
              ), O = gt(
                ($ = "smooth") => {
                  const b = f.current;
                  b && b.scrollTo({
                    top: b.scrollHeight,
                    behavior: $
                  });
                },
                []
              ), D = gt(
                ($, b = "smooth") => {
                  x($ * r, b);
                },
                [x, r]
              ), T = {
                outer: {
                  ref: f,
                  style: {
                    overflowY: "auto",
                    position: "relative",
                    height: "100%"
                  }
                },
                inner: {
                  style: {
                    position: "relative",
                    height: `${W}px`,
                    width: "100%"
                  }
                },
                list: {
                  style: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    transform: `translateY(${k.startIndex * r}px)`
                  }
                }
              };
              return {
                virtualState: U,
                virtualizerProps: T,
                scrollToBottom: O,
                scrollToIndex: D
              };
            };
          if (l === "stateSort")
            return (e) => {
              const a = [...d()].sort(
                (u, k) => e(u.item, k.item)
              ), c = a.map(({ item: u }) => u), f = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return i(c, o, f);
            };
          if (l === "stateFilter")
            return (e) => {
              const a = d().filter(
                ({ item: u }, k) => e(u, k)
              ), c = a.map(({ item: u }) => u), f = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return i(c, o, f);
            };
          if (l === "stateMap")
            return (e) => {
              const r = n.getState().getNestedState(t, o);
              return Array.isArray(r) ? r.map((a, c) => {
                let f;
                S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
                const u = [...o, f.toString()], k = i(a, u, S);
                return e(a, k, {
                  register: () => {
                    const [, w] = X({}), N = `${v}-${o.join(".")}-${f}`;
                    at(() => {
                      const A = `${t}////${N}`, C = n.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return C.components.set(A, {
                        forceUpdate: () => w({}),
                        paths: /* @__PURE__ */ new Set([u.join(".")])
                        // ATOMIC: Subscribes only to this item's path.
                      }), n.getState().stateComponents.set(t, C), () => {
                        const W = n.getState().stateComponents.get(t);
                        W && W.components.delete(A);
                      };
                    }, [t, N]);
                  },
                  index: c,
                  originalIndex: f
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${o.join(".")}. The current value is:`,
                r
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => y.map((a, c) => {
              let f;
              S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
              const u = [...o, f.toString()], k = i(a, u, S);
              return e(
                a,
                k,
                c,
                y,
                i(y, o, S)
              );
            });
          if (l === "$stateMap")
            return (e) => ct(Ht, {
              proxy: {
                _stateKey: t,
                _path: o,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: i
            });
          if (l === "stateFlattenOn")
            return (e) => {
              const r = y;
              h.clear(), V++;
              const a = r.flatMap(
                (c) => c[e] ?? []
              );
              return i(
                a,
                [...o, "[*]", e],
                S
              );
            };
          if (l === "index")
            return (e) => {
              const r = y[e];
              return i(r, [...o, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = n.getState().getNestedState(t, o);
              if (e.length === 0) return;
              const r = e.length - 1, a = e[r], c = [...o, r.toString()];
              return i(a, c);
            };
          if (l === "insert")
            return (e) => (E(o), ft(s, e, o, t), i(
              n.getState().getNestedState(t, o),
              o
            ));
          if (l === "uniqueInsert")
            return (e, r, a) => {
              const c = n.getState().getNestedState(t, o), f = J(e) ? e(c) : e;
              let u = null;
              if (!c.some((p) => {
                if (r) {
                  const N = r.every(
                    (A) => H(p[A], f[A])
                  );
                  return N && (u = p), N;
                }
                const w = H(p, f);
                return w && (u = p), w;
              }))
                E(o), ft(s, f, o, t);
              else if (a && u) {
                const p = a(u), w = c.map(
                  (N) => H(N, u) ? p : N
                );
                E(o), tt(s, w, o);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return E(o), ot(s, o, t, e), i(
                  n.getState().getNestedState(t, o),
                  o
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < y.length; r++)
                y[r] === e && ot(s, o, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = y.findIndex((a) => a === e);
              r > -1 ? ot(s, o, t, r) : ft(s, e, o, t);
            };
          if (l === "stateFind")
            return (e) => {
              const a = d().find(
                ({ item: f }, u) => e(f, u)
              );
              if (!a) return;
              const c = [...o, a.originalIndex.toString()];
              return i(a.item, c, S);
            };
          if (l === "findWith")
            return (e, r) => {
              const c = d().find(
                ({ item: u }) => u[e] === r
              );
              if (!c) return;
              const f = [...o, c.originalIndex.toString()];
              return i(c.item, f, S);
            };
        }
        const q = o[o.length - 1];
        if (!isNaN(Number(q))) {
          const d = o.slice(0, -1), e = n.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => ot(
              s,
              d,
              t,
              Number(q)
            );
        }
        if (l === "get")
          return () => n.getState().getNestedState(t, o);
        if (l === "$derive")
          return (d) => Tt({
            _stateKey: t,
            _path: o,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Tt({
            _stateKey: t,
            _path: o
          });
        if (l === "lastSynced") {
          const d = `${t}:${o.join(".")}`;
          return n.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => lt(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = o.slice(0, -1), e = d.join("."), r = n.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(o[o.length - 1]) === n.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = o.slice(0, -1), r = Number(o[o.length - 1]), a = e.join(".");
            d ? n.getState().setSelectedIndex(t, a, r) : n.getState().setSelectedIndex(t, a, void 0);
            const c = n.getState().getNestedState(t, [...e]);
            tt(s, c, e), E(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = o.slice(0, -1), e = Number(o[o.length - 1]), r = d.join("."), a = n.getState().getSelectedIndex(t, r);
            n.getState().setSelectedIndex(
              t,
              r,
              a === e ? void 0 : e
            );
            const c = n.getState().getNestedState(t, [...d]);
            tt(s, c, d), E(d);
          };
        if (o.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = n.getState().cogsStateStore[t], a = jt(e, d).newDocument;
              xt(
                t,
                n.getState().initialStateGlobal[t],
                a,
                s,
                v,
                g
              );
              const c = n.getState().stateComponents.get(t);
              if (c) {
                const f = St(e, a), u = new Set(f);
                for (const [
                  k,
                  p
                ] of c.components.entries()) {
                  let w = !1;
                  const N = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!N.includes("none")) {
                    if (N.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (N.includes("component") && (p.paths.has("") && (w = !0), !w))
                      for (const A of u) {
                        if (p.paths.has(A)) {
                          w = !0;
                          break;
                        }
                        let C = A.lastIndexOf(".");
                        for (; C !== -1; ) {
                          const W = A.substring(0, C);
                          if (p.paths.has(W)) {
                            w = !0;
                            break;
                          }
                          const U = A.substring(
                            C + 1
                          );
                          if (!isNaN(Number(U))) {
                            const x = W.lastIndexOf(".");
                            if (x !== -1) {
                              const O = W.substring(
                                0,
                                x
                              );
                              if (p.paths.has(O)) {
                                w = !0;
                                break;
                              }
                            }
                          }
                          C = W.lastIndexOf(".");
                        }
                        if (w) break;
                      }
                    if (!w && N.includes("deps") && p.depsFunction) {
                      const A = p.depsFunction(a);
                      let C = !1;
                      typeof A == "boolean" ? A && (C = !0) : H(p.deps, A) || (p.deps = A, C = !0), C && (w = !0);
                    }
                    w && p.forceUpdate();
                  }
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const d = n.getState().getInitialOptions(t)?.validation, e = n.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              z(d.key);
              const r = n.getState().cogsStateStore[t];
              try {
                const a = n.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([f]) => {
                  f && f.startsWith(d.key) && z(f);
                });
                const c = d.zodSchema.safeParse(r);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const k = u.path, p = u.message, w = [d.key, ...k].join(".");
                  e(w, p);
                }), dt(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return v;
          if (l === "getComponents")
            return () => n().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => pt.getState().getFormRefsByStateKey(t);
          if (l === "_initialState")
            return n.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return n.getState().serverState[t];
          if (l === "_isLoading")
            return n.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return I.revertToInitialState;
          if (l === "updateInitialState") return I.updateInitialState;
          if (l === "removeValidation") return I.removeValidation;
        }
        if (l === "getFormRef")
          return () => pt.getState().getFormRef(t + "." + o.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ It(
            _t,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: o,
              validationKey: n.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: S?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return o;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Pt(() => {
                tt(s, d, o, "");
                const r = n.getState().getNestedState(t, o);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              tt(s, d, o, "");
              const r = n.getState().getNestedState(t, o);
              e?.afterUpdate && e.afterUpdate(r);
            }
            E(o);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ It(
            Ot,
            {
              setState: s,
              stateKey: t,
              path: o,
              child: d,
              formOpts: e
            }
          );
        const _ = [...o, l], K = n.getState().getNestedState(t, _);
        return i(K, _, S);
      }
    }, L = new Proxy(M, j);
    return h.set(G, {
      proxy: L,
      stateVersion: V
    }), L;
  }
  return i(
    n.getState().getNestedState(t, [])
  );
}
function Tt(t) {
  return ct(Bt, { proxy: t });
}
function Ht({
  proxy: t,
  rebuildStateShape: s
}) {
  const v = n().getNestedState(t._stateKey, t._path);
  return Array.isArray(v) ? s(
    v,
    t._path
  ).stateMapNoRender(
    (h, V, E, I, i) => t._mapFn(h, V, E, I, i)
  ) : null;
}
function Bt({
  proxy: t
}) {
  const s = Y(null), v = `${t._stateKey}-${t._path.join(".")}`;
  return st(() => {
    const g = s.current;
    if (!g || !g.parentElement) return;
    const h = g.parentElement, E = Array.from(h.childNodes).indexOf(g);
    let I = h.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, h.setAttribute("data-parent-id", I));
    const y = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: E,
      effect: t._effect
    };
    n.getState().addSignalElement(v, y);
    const o = n.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(o);
      } catch (M) {
        console.error("Error evaluating effect function during mount:", M), S = o;
      }
    else
      S = o;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const G = document.createTextNode(String(S));
    g.replaceWith(G);
  }, [t._stateKey, t._path.join("."), t._effect]), ct("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": v
  });
}
function ae(t) {
  const s = At(
    (v) => {
      const g = n.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: v,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => n.getState().getNestedState(t._stateKey, t._path)
  );
  return ct("text", {}, String(s));
}
export {
  Tt as $cogsSignal,
  ae as $cogsSignalStore,
  ne as addStateOptions,
  re as createCogsState,
  oe as notifyComponent,
  Lt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
