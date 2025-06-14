"use client";
import { jsx as It } from "react/jsx-runtime";
import { useState as Q, useRef as Y, useEffect as st, useLayoutEffect as at, useMemo as Ct, createElement as ct, useSyncExternalStore as Pt, startTransition as _t, useCallback as gt } from "react";
import { transformStateFunc as Ot, isDeepEqual as B, isFunction as J, getNestedValue as H, getDifferences as St, debounce as pt } from "./utility.js";
import { pushFunc as ft, updateFn as et, cutFunc as ot, ValidationWrapper as Mt, FormControlComponent as jt } from "./Functions.jsx";
import Rt from "superjson";
import { v4 as mt } from "uuid";
import "zod";
import { getGlobalStore as n, formRefStore as wt } from "./store.js";
import { useCogsConfig as kt } from "./CogsStateClient.jsx";
import { applyPatch as Ut } from "fast-json-patch";
function Et(t, s) {
  const v = n.getState().getInitialOptions, g = n.getState().setInitialStateOptions, y = v(t) || {};
  g(t, {
    ...y,
    ...s
  });
}
function $t({
  stateKey: t,
  options: s,
  initialOptionsPart: v
}) {
  const g = K(t) || {}, y = v[t] || {}, V = n.getState().setInitialStateOptions, E = { ...y, ...g };
  let I = !1;
  if (s)
    for (const i in s)
      E.hasOwnProperty(i) ? (i == "localStorage" && s[i] && E[i].key !== s[i]?.key && (I = !0, E[i] = s[i]), i == "initialState" && s[i] && E[i] !== s[i] && // Different references
      !B(E[i], s[i]) && (I = !0, E[i] = s[i])) : (I = !0, E[i] = s[i]);
  I && V(t, E);
}
function oe(t, { formElements: s, validation: v }) {
  return { initialState: t, formElements: s, validation: v };
}
const ae = (t, s) => {
  let v = t;
  const [g, y] = Ot(v);
  (Object.keys(y).length > 0 || s && Object.keys(s).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, K(I) || n.getState().setInitialStateOptions(I, y[I]);
  }), n.getState().setInitialStates(g), n.getState().setCreatedState(g);
  const V = (I, i) => {
    const [h] = Q(i?.componentId ?? mt());
    $t({
      stateKey: I,
      options: i,
      initialOptionsPart: y
    });
    const o = n.getState().cogsStateStore[I] || g[I], S = i?.modifyState ? i.modifyState(o) : o, [G, M] = Ht(
      S,
      {
        stateKey: I,
        syncUpdate: i?.syncUpdate,
        componentId: h,
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
    $t({ stateKey: I, options: i, initialOptionsPart: y }), i.localStorage && Lt(I, i), dt(I);
  }
  return { useCogsState: V, setCogsOptions: E };
}, {
  setUpdaterState: it,
  setState: Z,
  getInitialOptions: K,
  getKeyState: xt,
  getValidationErrors: Ft,
  setStateLog: Dt,
  updateInitialStateGlobal: vt,
  addValidationError: Wt,
  removeValidationError: z,
  setServerSyncActions: Gt
} = n.getState(), Tt = (t, s, v, g, y) => {
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
      lastSyncedWithServer: y ?? I
    }, h = Rt.serialize(i);
    window.localStorage.setItem(
      E,
      JSON.stringify(h.json)
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
}, Lt = (t, s) => {
  const v = n.getState().cogsStateStore[t], { sessionId: g } = kt(), y = J(s?.localStorage?.key) ? s.localStorage.key(v) : s?.localStorage?.key;
  if (y && g) {
    const V = lt(
      `${g}-${t}-${y}`
    );
    if (V && V.lastUpdated > (V.lastSyncedWithServer || 0))
      return Z(t, V.state), dt(t), !0;
  }
  return !1;
}, Vt = (t, s, v, g, y, V) => {
  const E = {
    initialState: s,
    updaterState: nt(
      t,
      g,
      y,
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
}, se = (t, s) => {
  const v = n.getState().stateComponents.get(t);
  if (v) {
    const g = `${t}////${s}`, y = v.components.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Bt = (t, s, v, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: H(s, g),
        newValue: H(v, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: H(v, g)
      };
    case "cut":
      return {
        oldValue: H(s, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Ht(t, {
  stateKey: s,
  serverSync: v,
  localStorage: g,
  formElements: y,
  reactiveDeps: V,
  reactiveType: E,
  componentId: I,
  initialState: i,
  syncUpdate: h,
  dependencies: o,
  serverState: S
} = {}) {
  const [G, M] = Q({}), { sessionId: j } = kt();
  let L = !s;
  const [m] = Q(s ?? mt()), l = n.getState().stateLog[m], rt = Y(/* @__PURE__ */ new Set()), q = Y(I ?? mt()), _ = Y(
    null
  );
  _.current = K(m) ?? null, st(() => {
    if (h && h.stateKey === m && h.path?.[0]) {
      Z(m, (r) => ({
        ...r,
        [h.path[0]]: h.newValue
      }));
      const e = `${h.stateKey}:${h.path.join(".")}`;
      n.getState().setSyncInfo(e, {
        timeStamp: h.timeStamp,
        userId: h.userId
      });
    }
  }, [h]), st(() => {
    if (i) {
      Et(m, {
        initialState: i
      });
      const e = _.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = n.getState().initialStateGlobal[m];
      if (!(c && !B(c, i) || !c) && !a)
        return;
      let u = null;
      const k = J(e?.localStorage?.key) ? e?.localStorage?.key(i) : e?.localStorage?.key;
      k && j && (u = lt(`${j}-${m}-${k}`));
      let p = i, w = !1;
      const C = a ? Date.now() : 0, A = u?.lastUpdated || 0, N = u?.lastSyncedWithServer || 0;
      a && C > A ? (p = e.serverState.data, w = !0) : u && A > N && (p = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), Vt(
        m,
        i,
        p,
        tt,
        q.current,
        j
      ), w && k && j && Tt(p, m, e, j, Date.now()), dt(m), (Array.isArray(E) ? E : [E || "component"]).includes("none") || M({});
    }
  }, [
    i,
    S?.status,
    S?.data,
    ...o || []
  ]), at(() => {
    L && Et(m, {
      serverSync: v,
      formElements: y,
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
  const tt = (e, r, a, c) => {
    if (Array.isArray(r)) {
      const f = `${m}-${r.join(".")}`;
      rt.current.add(f);
    }
    Z(m, (f) => {
      const u = J(e) ? e(f) : e, k = `${m}-${r.join(".")}`;
      if (k) {
        let R = !1, x = n.getState().signalDomElements.get(k);
        if ((!x || x.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const O = r.slice(0, -1), D = H(u, O);
          if (Array.isArray(D)) {
            R = !0;
            const T = `${m}-${O.join(".")}`;
            x = n.getState().signalDomElements.get(T);
          }
        }
        if (x) {
          const O = R ? H(u, r.slice(0, -1)) : H(u, r);
          x.forEach(({ parentId: D, position: T, effect: $ }) => {
            const b = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (b) {
              const U = Array.from(b.childNodes);
              if (U[T]) {
                const P = $ ? new Function("state", `return (${$})(state)`)(O) : O;
                U[T].textContent = String(P);
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
      ), a.updateType === "insert" && _.current?.validation?.key && Ft(
        _.current?.validation?.key + "." + p.join(".")
      ).filter(([x, O]) => {
        let D = x?.split(".").length;
        if (x == p.join(".") && D == p.length - 1) {
          let T = x + "." + p;
          z(x), Wt(T, O);
        }
      });
      const w = n.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", w), w) {
        const R = St(f, u), x = new Set(R), O = a.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
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
              for (const U of x) {
                let P = U;
                for (; ; ) {
                  if (T.paths.has(P)) {
                    $ = !0;
                    break;
                  }
                  const F = P.lastIndexOf(".");
                  if (F !== -1) {
                    const X = P.substring(
                      0,
                      F
                    );
                    if (!isNaN(
                      Number(P.substring(F + 1))
                    ) && T.paths.has(X)) {
                      $ = !0;
                      break;
                    }
                    P = X;
                  } else
                    P = "";
                  if (P === "")
                    break;
                }
                if ($) break;
              }
            if (!$ && b.includes("deps") && T.depsFunction) {
              const U = T.depsFunction(u);
              let P = !1;
              typeof U == "boolean" ? U && (P = !0) : B(T.deps, U) || (T.deps = U, P = !0), P && ($ = !0);
            }
            $ && T.forceUpdate();
          }
        }
      }
      const C = Date.now();
      r = r.map((R, x) => {
        const O = r.slice(0, -1), D = H(u, O);
        return x === r.length - 1 && ["insert", "cut"].includes(a.updateType) ? (D.length - 1).toString() : R;
      });
      const { oldValue: A, newValue: N } = Bt(
        a.updateType,
        f,
        u,
        r
      ), W = {
        timeStamp: C,
        stateKey: m,
        path: r,
        updateType: a.updateType,
        status: "new",
        oldValue: A,
        newValue: N
      };
      if (Dt(m, (R) => {
        const O = [...R ?? [], W].reduce((D, T) => {
          const $ = `${T.stateKey}:${JSON.stringify(T.path)}`, b = D.get($);
          return b ? (b.timeStamp = Math.max(b.timeStamp, T.timeStamp), b.newValue = T.newValue, b.oldValue = b.oldValue ?? T.oldValue, b.updateType = T.updateType) : D.set($, { ...T }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), Tt(
        u,
        m,
        _.current,
        j
      ), _.current?.middleware && _.current.middleware({
        updateLog: l,
        update: W
      }), _.current?.serverSync) {
        const R = n.getState().serverState[m], x = _.current?.serverSync;
        Gt(m, {
          syncKey: typeof x.syncKey == "string" ? x.syncKey : x.syncKey({ state: u }),
          rollBackState: R,
          actionTimeStamp: Date.now() + (x.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return u;
    });
  };
  n.getState().updaterState[m] || (it(
    m,
    nt(
      m,
      tt,
      q.current,
      j
    )
  ), n.getState().cogsStateStore[m] || Z(m, t), n.getState().initialStateGlobal[m] || vt(m, t));
  const d = Ct(() => nt(
    m,
    tt,
    q.current,
    j
  ), [m, j]);
  return [xt(m), d];
}
function nt(t, s, v, g) {
  const y = /* @__PURE__ */ new Map();
  let V = 0;
  const E = (h) => {
    const o = h.join(".");
    for (const [S] of y)
      (S === o || S.startsWith(o + ".")) && y.delete(S);
    V++;
  }, I = {
    removeValidation: (h) => {
      h?.validationKey && z(h.validationKey);
    },
    revertToInitialState: (h) => {
      const o = n.getState().getInitialOptions(t)?.validation;
      o?.key && z(o?.key), h?.validationKey && z(h.validationKey);
      const S = n.getState().initialStateGlobal[t];
      n.getState().clearSelectedIndexesForState(t), y.clear(), V++;
      const G = i(S, []), M = K(t), j = J(M?.localStorage?.key) ? M?.localStorage?.key(S) : M?.localStorage?.key, L = `${g}-${t}-${j}`;
      L && localStorage.removeItem(L), it(t, G), Z(t, S);
      const m = n.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (h) => {
      y.clear(), V++;
      const o = nt(
        t,
        s,
        v,
        g
      ), S = n.getState().initialStateGlobal[t], G = K(t), M = J(G?.localStorage?.key) ? G?.localStorage?.key(S) : G?.localStorage?.key, j = `${g}-${t}-${M}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), _t(() => {
        vt(t, h), it(t, o), Z(t, h);
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
      const h = n.getState().serverState[t];
      return !!(h && B(h, xt(t)));
    }
  };
  function i(h, o = [], S) {
    const G = o.map(String).join(".");
    y.get(G);
    const M = function() {
      return n().getNestedState(t, o);
    };
    Object.keys(I).forEach((m) => {
      M[m] = I[m];
    });
    const j = {
      apply(m, l, rt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${o.join(".")}`
        ), console.trace("Apply trap stack trace"), n().getNestedState(t, o);
      },
      get(m, l) {
        S?.validIndices && !Array.isArray(h) && (S = { ...S, validIndices: void 0 });
        const rt = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !rt.has(l)) {
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
          const d = n.getState().getNestedState(t, o), e = n.getState().initialStateGlobal[t], r = H(e, o);
          return B(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = n().getNestedState(
              t,
              o
            ), e = n.getState().initialStateGlobal[t], r = H(e, o);
            return B(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = n.getState().initialStateGlobal[t], e = K(t), r = J(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${g}-${t}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = n.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return n.getState().getValidationErrors(d.key + "." + o.join("."));
          };
        if (Array.isArray(h)) {
          const d = () => S?.validIndices ? h.map((r, a) => ({
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
                  h[e],
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
              const f = Y(null), u = Y(!0), [k, p] = Q({
                startIndex: 0,
                endIndex: 10
              }), w = Y(
                `${t}-virtual-${o.join(".")}-${Math.random()}`
              ).current, [, C] = Q({}), A = n().getNestedState(
                t,
                o
              ), N = A.length, W = N * r;
              at(() => {
                const $ = A.slice(
                  k.startIndex,
                  k.endIndex
                );
                n.getState().setState(w, $), n.getState().updaterState[w] || n.getState().setUpdaterState(
                  w,
                  nt(
                    w,
                    s,
                    v,
                    g
                  )
                );
                const b = `${t}////${v}-virtual`, U = n.getState().stateComponents.get(t) || {
                  components: /* @__PURE__ */ new Map()
                };
                return U.components.set(b, {
                  forceUpdate: () => C({}),
                  paths: /* @__PURE__ */ new Set([o.join(".")]),
                  reactiveType: ["component"]
                }), n.getState().stateComponents.set(t, U), () => {
                  const P = n.getState().stateComponents.get(t);
                  P && P.components.delete(b);
                  const F = n.getState();
                  delete F.cogsStateStore[w], delete F.updaterState[w], F.stateComponents.delete(w);
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
                  if (!$) return;
                  const F = $.scrollTop, X = $.clientHeight, At = Math.floor(F / r), Nt = Math.ceil(
                    (F + X) / r
                  ), yt = Math.max(0, At - a), ht = Math.min(N, Nt + a);
                  p((ut) => ut.startIndex === yt && ut.endIndex === ht ? ut : { startIndex: yt, endIndex: ht });
                }, U = pt(() => {
                  const F = f.current;
                  if (!F) return;
                  const X = F.scrollHeight - F.scrollTop - F.clientHeight < 1;
                  u.current = X, b();
                }, 10);
                b(), $.addEventListener("scroll", U, {
                  passive: !0
                });
                const P = new ResizeObserver(() => {
                  b();
                });
                return P.observe($), c && u.current && N > 0 && requestAnimationFrame(() => {
                  $.scrollTo({
                    top: $.scrollHeight,
                    behavior: "auto"
                  });
                }), () => {
                  $.removeEventListener("scroll", U), P.disconnect();
                };
              }, [N, r, a, c]);
              const R = n.getState().updaterState[w], x = gt(
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
                virtualState: R,
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
                    const [, w] = Q({}), C = `${v}-${o.join(".")}-${f}`;
                    at(() => {
                      const A = `${t}////${C}`, N = n.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return N.components.set(A, {
                        forceUpdate: () => w({}),
                        paths: /* @__PURE__ */ new Set([u.join(".")])
                        // ATOMIC: Subscribes only to this item's path.
                      }), n.getState().stateComponents.set(t, N), () => {
                        const W = n.getState().stateComponents.get(t);
                        W && W.components.delete(A);
                      };
                    }, [t, C]);
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
            return (e) => h.map((a, c) => {
              let f;
              S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
              const u = [...o, f.toString()], k = i(a, u, S);
              return e(
                a,
                k,
                c,
                h,
                i(h, o, S)
              );
            });
          if (l === "$stateMap")
            return (e) => ct(qt, {
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
              const r = h;
              y.clear(), V++;
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
              const r = h[e];
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
                  const C = r.every(
                    (A) => B(p[A], f[A])
                  );
                  return C && (u = p), C;
                }
                const w = B(p, f);
                return w && (u = p), w;
              }))
                E(o), ft(s, f, o, t);
              else if (a && u) {
                const p = a(u), w = c.map(
                  (C) => B(C, u) ? p : C
                );
                E(o), et(s, w, o);
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
              for (let r = 0; r < h.length; r++)
                h[r] === e && ot(s, o, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = h.findIndex((a) => a === e);
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
          return (d) => bt({
            _stateKey: t,
            _path: o,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => bt({
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
            et(s, c, e), E(e);
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
            et(s, c, d), E(d);
          };
        if (o.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = n.getState().cogsStateStore[t], a = Ut(e, d).newDocument;
              Vt(
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
                  const C = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!C.includes("none")) {
                    if (C.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (C.includes("component") && (p.paths.has("") && (w = !0), !w))
                      for (const A of u) {
                        if (p.paths.has(A)) {
                          w = !0;
                          break;
                        }
                        let N = A.lastIndexOf(".");
                        for (; N !== -1; ) {
                          const W = A.substring(0, N);
                          if (p.paths.has(W)) {
                            w = !0;
                            break;
                          }
                          const R = A.substring(
                            N + 1
                          );
                          if (!isNaN(Number(R))) {
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
                          N = W.lastIndexOf(".");
                        }
                        if (w) break;
                      }
                    if (!w && C.includes("deps") && p.depsFunction) {
                      const A = p.depsFunction(a);
                      let N = !1;
                      typeof A == "boolean" ? A && (N = !0) : B(p.deps, A) || (p.deps = A, N = !0), N && (w = !0);
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
            return () => wt.getState().getFormRefsByStateKey(t);
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
          return () => wt.getState().getFormRef(t + "." + o.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ It(
            Mt,
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
              pt(() => {
                et(s, d, o, "");
                const r = n.getState().getNestedState(t, o);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              et(s, d, o, "");
              const r = n.getState().getNestedState(t, o);
              e?.afterUpdate && e.afterUpdate(r);
            }
            E(o);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ It(
            jt,
            {
              setState: s,
              stateKey: t,
              path: o,
              child: d,
              formOpts: e
            }
          );
        const _ = [...o, l], tt = n.getState().getNestedState(t, _);
        return i(tt, _, S);
      }
    }, L = new Proxy(M, j);
    return y.set(G, {
      proxy: L,
      stateVersion: V
    }), L;
  }
  return i(
    n.getState().getNestedState(t, [])
  );
}
function bt(t) {
  return ct(zt, { proxy: t });
}
function qt({
  proxy: t,
  rebuildStateShape: s
}) {
  const v = n().getNestedState(t._stateKey, t._path);
  return Array.isArray(v) ? s(
    v,
    t._path
  ).stateMapNoRender(
    (y, V, E, I, i) => t._mapFn(y, V, E, I, i)
  ) : null;
}
function zt({
  proxy: t
}) {
  const s = Y(null), v = `${t._stateKey}-${t._path.join(".")}`;
  return st(() => {
    const g = s.current;
    if (!g || !g.parentElement) return;
    const y = g.parentElement, E = Array.from(y.childNodes).indexOf(g);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const h = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: E,
      effect: t._effect
    };
    n.getState().addSignalElement(v, h);
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
function ie(t) {
  const s = Pt(
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
  bt as $cogsSignal,
  ie as $cogsSignalStore,
  oe as addStateOptions,
  ae as createCogsState,
  se as notifyComponent,
  Ht as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
