"use client";
import { jsx as wt } from "react/jsx-runtime";
import { useState as Q, useRef as Y, useEffect as ct, useLayoutEffect as it, useMemo as Nt, createElement as dt, useSyncExternalStore as Ct, startTransition as Pt, useCallback as vt } from "react";
import { transformStateFunc as _t, isDeepEqual as H, isFunction as J, getNestedValue as B, getDifferences as yt, debounce as Ot } from "./utility.js";
import { pushFunc as ht, updateFn as et, cutFunc as st, ValidationWrapper as Mt, FormControlComponent as jt } from "./Functions.jsx";
import Rt from "superjson";
import { v4 as It } from "uuid";
import "zod";
import { getGlobalStore as n, formRefStore as Et } from "./store.js";
import { useCogsConfig as xt } from "./CogsStateClient.jsx";
import { applyPatch as Ut } from "fast-json-patch";
function $t(t, s) {
  const v = n.getState().getInitialOptions, g = n.getState().setInitialStateOptions, h = v(t) || {};
  g(t, {
    ...h,
    ...s
  });
}
function Tt({
  stateKey: t,
  options: s,
  initialOptionsPart: v
}) {
  const g = K(t) || {}, h = v[t] || {}, V = n.getState().setInitialStateOptions, $ = { ...h, ...g };
  let I = !1;
  if (s)
    for (const i in s)
      $.hasOwnProperty(i) ? (i == "localStorage" && s[i] && $[i].key !== s[i]?.key && (I = !0, $[i] = s[i]), i == "initialState" && s[i] && $[i] !== s[i] && // Different references
      !H($[i], s[i]) && (I = !0, $[i] = s[i])) : (I = !0, $[i] = s[i]);
  I && V(t, $);
}
function oe(t, { formElements: s, validation: v }) {
  return { initialState: t, formElements: s, validation: v };
}
const ae = (t, s) => {
  let v = t;
  const [g, h] = _t(v);
  (Object.keys(h).length > 0 || s && Object.keys(s).length > 0) && Object.keys(h).forEach((I) => {
    h[I] = h[I] || {}, h[I].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...h[I].formElements || {}
      // State-specific overrides
    }, K(I) || n.getState().setInitialStateOptions(I, h[I]);
  }), n.getState().setInitialStates(g), n.getState().setCreatedState(g);
  const V = (I, i) => {
    const [y] = Q(i?.componentId ?? It());
    Tt({
      stateKey: I,
      options: i,
      initialOptionsPart: h
    });
    const o = n.getState().cogsStateStore[I] || g[I], S = i?.modifyState ? i.modifyState(o) : o, [G, M] = Bt(
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
  function $(I, i) {
    Tt({ stateKey: I, options: i, initialOptionsPart: h }), i.localStorage && Lt(I, i), gt(I);
  }
  return { useCogsState: V, setCogsOptions: $ };
}, {
  setUpdaterState: lt,
  setState: Z,
  getInitialOptions: K,
  getKeyState: Vt,
  getValidationErrors: Ft,
  setStateLog: Dt,
  updateInitialStateGlobal: pt,
  addValidationError: Wt,
  removeValidationError: z,
  setServerSyncActions: Gt
} = n.getState(), bt = (t, s, v, g, h) => {
  v?.log && console.log(
    "saving to localstorage",
    s,
    v.localStorage?.key,
    g
  );
  const V = J(v?.localStorage?.key) ? v.localStorage?.key(t) : v?.localStorage?.key;
  if (V && g) {
    const $ = `${g}-${s}-${V}`;
    let I;
    try {
      I = ut($)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: h ?? I
    }, y = Rt.serialize(i);
    window.localStorage.setItem(
      $,
      JSON.stringify(y.json)
    );
  }
}, ut = (t) => {
  if (!t) return null;
  try {
    const s = window.localStorage.getItem(t);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, Lt = (t, s) => {
  const v = n.getState().cogsStateStore[t], { sessionId: g } = xt(), h = J(s?.localStorage?.key) ? s.localStorage.key(v) : s?.localStorage?.key;
  if (h && g) {
    const V = ut(
      `${g}-${t}-${h}`
    );
    if (V && V.lastUpdated > (V.lastSyncedWithServer || 0))
      return Z(t, V.state), gt(t), !0;
  }
  return !1;
}, At = (t, s, v, g, h, V) => {
  const $ = {
    initialState: s,
    updaterState: nt(
      t,
      g,
      h,
      V
    ),
    state: v
  };
  pt(t, $.initialState), lt(t, $.updaterState), Z(t, $.state);
}, gt = (t) => {
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
    const g = `${t}////${s}`, h = v.components.get(g);
    if ((h ? Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"] : null)?.includes("none"))
      return;
    h && h.forceUpdate();
  }
}, Ht = (t, s, v, g) => {
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
function Bt(t, {
  stateKey: s,
  serverSync: v,
  localStorage: g,
  formElements: h,
  reactiveDeps: V,
  reactiveType: $,
  componentId: I,
  initialState: i,
  syncUpdate: y,
  dependencies: o,
  serverState: S
} = {}) {
  const [G, M] = Q({}), { sessionId: j } = xt();
  let L = !s;
  const [m] = Q(s ?? It()), l = n.getState().stateLog[m], rt = Y(/* @__PURE__ */ new Set()), q = Y(I ?? It()), _ = Y(
    null
  );
  _.current = K(m) ?? null, ct(() => {
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
  }, [y]), ct(() => {
    if (i) {
      $t(m, {
        initialState: i
      });
      const e = _.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = n.getState().initialStateGlobal[m];
      if (!(c && !H(c, i) || !c) && !a)
        return;
      let u = null;
      const k = J(e?.localStorage?.key) ? e?.localStorage?.key(i) : e?.localStorage?.key;
      k && j && (u = ut(`${j}-${m}-${k}`));
      let p = i, w = !1;
      const C = a ? Date.now() : 0, A = u?.lastUpdated || 0, N = u?.lastSyncedWithServer || 0;
      a && C > A ? (p = e.serverState.data, w = !0) : u && A > N && (p = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), At(
        m,
        i,
        p,
        tt,
        q.current,
        j
      ), w && k && j && bt(p, m, e, j, Date.now()), gt(m), (Array.isArray($) ? $ : [$ || "component"]).includes("none") || M({});
    }
  }, [
    i,
    S?.status,
    S?.data,
    ...o || []
  ]), it(() => {
    L && $t(m, {
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
      reactiveType: $ ?? ["component", "deps"]
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
          const O = r.slice(0, -1), D = B(u, O);
          if (Array.isArray(D)) {
            R = !0;
            const T = `${m}-${O.join(".")}`;
            x = n.getState().signalDomElements.get(T);
          }
        }
        if (x) {
          const O = R ? B(u, r.slice(0, -1)) : B(u, r);
          x.forEach(({ parentId: D, position: T, effect: E }) => {
            const b = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (b) {
              const U = Array.from(b.childNodes);
              if (U[T]) {
                const P = E ? new Function("state", `return (${E})(state)`)(O) : O;
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
        const R = yt(f, u), x = new Set(R), O = a.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          D,
          T
        ] of w.components.entries()) {
          let E = !1;
          const b = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
          if (console.log("component", T), !b.includes("none")) {
            if (b.includes("all")) {
              T.forceUpdate();
              continue;
            }
            if (b.includes("component") && ((T.paths.has(O) || T.paths.has("")) && (E = !0), !E))
              for (const U of x) {
                let P = U;
                for (; ; ) {
                  if (T.paths.has(P)) {
                    E = !0;
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
                      E = !0;
                      break;
                    }
                    P = X;
                  } else
                    P = "";
                  if (P === "")
                    break;
                }
                if (E) break;
              }
            if (!E && b.includes("deps") && T.depsFunction) {
              const U = T.depsFunction(u);
              let P = !1;
              typeof U == "boolean" ? U && (P = !0) : H(T.deps, U) || (T.deps = U, P = !0), P && (E = !0);
            }
            E && T.forceUpdate();
          }
        }
      }
      const C = Date.now();
      r = r.map((R, x) => {
        const O = r.slice(0, -1), D = B(u, O);
        return x === r.length - 1 && ["insert", "cut"].includes(a.updateType) ? (D.length - 1).toString() : R;
      });
      const { oldValue: A, newValue: N } = Ht(
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
          const E = `${T.stateKey}:${JSON.stringify(T.path)}`, b = D.get(E);
          return b ? (b.timeStamp = Math.max(b.timeStamp, T.timeStamp), b.newValue = T.newValue, b.oldValue = b.oldValue ?? T.oldValue, b.updateType = T.updateType) : D.set(E, { ...T }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), bt(
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
  n.getState().updaterState[m] || (lt(
    m,
    nt(
      m,
      tt,
      q.current,
      j
    )
  ), n.getState().cogsStateStore[m] || Z(m, t), n.getState().initialStateGlobal[m] || pt(m, t));
  const d = Nt(() => nt(
    m,
    tt,
    q.current,
    j
  ), [m, j]);
  return [Vt(m), d];
}
function nt(t, s, v, g) {
  const h = /* @__PURE__ */ new Map();
  let V = 0;
  const $ = (y) => {
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
      const G = i(S, []), M = K(t), j = J(M?.localStorage?.key) ? M?.localStorage?.key(S) : M?.localStorage?.key, L = `${g}-${t}-${j}`;
      L && localStorage.removeItem(L), lt(t, G), Z(t, S);
      const m = n.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (y) => {
      h.clear(), V++;
      const o = nt(
        t,
        s,
        v,
        g
      ), S = n.getState().initialStateGlobal[t], G = K(t), M = J(G?.localStorage?.key) ? G?.localStorage?.key(S) : G?.localStorage?.key, j = `${g}-${t}-${M}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), Pt(() => {
        pt(t, y), lt(t, o), Z(t, y);
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
      return !!(y && H(y, Vt(t)));
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
      apply(m, l, rt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${o.join(".")}`
        ), console.trace("Apply trap stack trace"), n().getNestedState(t, o);
      },
      get(m, l) {
        S?.validIndices && !Array.isArray(y) && (S = { ...S, validIndices: void 0 });
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
          return () => yt(
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
              const f = Y(null), u = Y(!0), [k, p] = Q({
                startIndex: 0,
                endIndex: 10
              }), w = Y(
                `${t}-virtual-${o.join(".")}-${Math.random()}`
              ).current, [, C] = Q({}), A = n().getNestedState(
                t,
                o
              ), N = A.length, W = N * r;
              it(() => {
                const E = A.slice(
                  k.startIndex,
                  k.endIndex
                );
                n.getState().setState(w, E), n.getState().updaterState[w] || n.getState().setUpdaterState(
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
              }, []), ct(() => {
                const E = A.slice(
                  k.startIndex,
                  k.endIndex
                );
                n.getState().setState(w, E);
              }, [
                k.startIndex,
                k.endIndex,
                w,
                A.length
              ]), it(() => {
                const E = f.current;
                if (!E) return;
                const b = () => {
                  if (!E) return;
                  const F = E.scrollTop, X = E.clientHeight;
                  E.scrollHeight;
                  const ft = Math.floor(F / r), St = Math.ceil(
                    (F + X) / r
                  );
                  let ot = Math.max(0, ft - a), at = Math.min(N, St + a);
                  at - ot < 1 && N > 0 && (at = Math.min(ot + 10, N)), p((mt) => mt.startIndex === ot && mt.endIndex === at ? mt : { startIndex: ot, endIndex: at });
                }, U = () => {
                  const F = f.current;
                  if (!F) return;
                  const X = F.scrollTop, ft = F.scrollHeight, St = F.clientHeight;
                  u.current = ft - X - St < 1, b();
                };
                b(), E.addEventListener("scroll", U, {
                  passive: !0
                });
                const P = new ResizeObserver(() => {
                  b();
                });
                return P.observe(E), c && u.current && N > 0 && setTimeout(() => {
                  E && (E.scrollTop = E.scrollHeight);
                }, 0), () => {
                  E.removeEventListener("scroll", U), P.disconnect();
                };
              }, [N, r, a, c]);
              const R = n.getState().updaterState[w], x = vt(
                (E, b = "auto") => {
                  f.current?.scrollTo({ top: E, behavior: b });
                },
                []
              ), O = vt(
                (E = "smooth") => {
                  const b = f.current;
                  b && b.scrollTo({
                    top: b.scrollHeight,
                    behavior: E
                  });
                },
                []
              ), D = vt(
                (E, b = "smooth") => {
                  x(E * r, b);
                },
                [x, r]
              ), T = {
                outer: {
                  ref: f,
                  style: {
                    overflowY: "auto",
                    position: "relative",
                    height: "100%",
                    width: "100%"
                  }
                },
                inner: {
                  style: {
                    position: "relative",
                    height: `${W}px`,
                    width: "100%",
                    pointerEvents: "none"
                    // Prevent inner from interfering
                  }
                },
                list: {
                  style: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    transform: `translateY(${k.startIndex * r}px)`,
                    pointerEvents: "auto"
                    // Re-enable for list items
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
                    it(() => {
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
            return (e) => dt(qt, {
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
            return (e) => ($(o), ht(s, e, o, t), i(
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
                    (A) => H(p[A], f[A])
                  );
                  return C && (u = p), C;
                }
                const w = H(p, f);
                return w && (u = p), w;
              }))
                $(o), ht(s, f, o, t);
              else if (a && u) {
                const p = a(u), w = c.map(
                  (C) => H(C, u) ? p : C
                );
                $(o), et(s, w, o);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return $(o), st(s, o, t, e), i(
                  n.getState().getNestedState(t, o),
                  o
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < y.length; r++)
                y[r] === e && st(s, o, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = y.findIndex((a) => a === e);
              r > -1 ? st(s, o, t, r) : ht(s, e, o, t);
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
            return () => st(
              s,
              d,
              t,
              Number(q)
            );
        }
        if (l === "get")
          return () => n.getState().getNestedState(t, o);
        if (l === "$derive")
          return (d) => kt({
            _stateKey: t,
            _path: o,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => kt({
            _stateKey: t,
            _path: o
          });
        if (l === "lastSynced") {
          const d = `${t}:${o.join(".")}`;
          return n.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => ut(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = o.slice(0, -1), e = d.join("."), r = n.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(o[o.length - 1]) === n.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = o.slice(0, -1), r = Number(o[o.length - 1]), a = e.join(".");
            d ? n.getState().setSelectedIndex(t, a, r) : n.getState().setSelectedIndex(t, a, void 0);
            const c = n.getState().getNestedState(t, [...e]);
            et(s, c, e), $(e);
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
            et(s, c, d), $(d);
          };
        if (o.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = n.getState().cogsStateStore[t], a = Ut(e, d).newDocument;
              At(
                t,
                n.getState().initialStateGlobal[t],
                a,
                s,
                v,
                g
              );
              const c = n.getState().stateComponents.get(t);
              if (c) {
                const f = yt(e, a), u = new Set(f);
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
                      typeof A == "boolean" ? A && (N = !0) : H(p.deps, A) || (p.deps = A, N = !0), N && (w = !0);
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
                }), gt(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return v;
          if (l === "getComponents")
            return () => n().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => Et.getState().getFormRefsByStateKey(t);
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
          return () => Et.getState().getFormRef(t + "." + o.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ wt(
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
              Ot(() => {
                et(s, d, o, "");
                const r = n.getState().getNestedState(t, o);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              et(s, d, o, "");
              const r = n.getState().getNestedState(t, o);
              e?.afterUpdate && e.afterUpdate(r);
            }
            $(o);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ wt(
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
    return h.set(G, {
      proxy: L,
      stateVersion: V
    }), L;
  }
  return i(
    n.getState().getNestedState(t, [])
  );
}
function kt(t) {
  return dt(zt, { proxy: t });
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
    (h, V, $, I, i) => t._mapFn(h, V, $, I, i)
  ) : null;
}
function zt({
  proxy: t
}) {
  const s = Y(null), v = `${t._stateKey}-${t._path.join(".")}`;
  return ct(() => {
    const g = s.current;
    if (!g || !g.parentElement) return;
    const h = g.parentElement, $ = Array.from(h.childNodes).indexOf(g);
    let I = h.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, h.setAttribute("data-parent-id", I));
    const y = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: $,
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
  }, [t._stateKey, t._path.join("."), t._effect]), dt("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": v
  });
}
function ie(t) {
  const s = Ct(
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
  return dt("text", {}, String(s));
}
export {
  kt as $cogsSignal,
  ie as $cogsSignalStore,
  oe as addStateOptions,
  ae as createCogsState,
  se as notifyComponent,
  Bt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
