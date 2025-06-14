"use client";
import { jsx as vt } from "react/jsx-runtime";
import { useState as et, useRef as X, useEffect as ft, useLayoutEffect as ot, useMemo as at, createElement as ct, useSyncExternalStore as bt, startTransition as At, useCallback as ut } from "react";
import { transformStateFunc as Nt, isDeepEqual as H, isFunction as Y, getNestedValue as B, getDifferences as St, debounce as Pt } from "./utility.js";
import { pushFunc as gt, updateFn as tt, cutFunc as rt, ValidationWrapper as Ct, FormControlComponent as xt } from "./Functions.jsx";
import _t from "superjson";
import { v4 as mt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as ht } from "./store.js";
import { useCogsConfig as $t } from "./CogsStateClient.jsx";
import { applyPatch as Ot } from "fast-json-patch";
function It(t, s) {
  const v = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, y = v(t) || {};
  g(t, {
    ...y,
    ...s
  });
}
function pt({
  stateKey: t,
  options: s,
  initialOptionsPart: v
}) {
  const g = Q(t) || {}, y = v[t] || {}, A = o.getState().setInitialStateOptions, w = { ...y, ...g };
  let I = !1;
  if (s)
    for (const i in s)
      w.hasOwnProperty(i) ? (i == "localStorage" && s[i] && w[i].key !== s[i]?.key && (I = !0, w[i] = s[i]), i == "initialState" && s[i] && w[i] !== s[i] && // Different references
      !H(w[i], s[i]) && (I = !0, w[i] = s[i])) : (I = !0, w[i] = s[i]);
  I && A(t, w);
}
function te(t, { formElements: s, validation: v }) {
  return { initialState: t, formElements: s, validation: v };
}
const ee = (t, s) => {
  let v = t;
  const [g, y] = Nt(v);
  (Object.keys(y).length > 0 || s && Object.keys(s).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, Q(I) || o.getState().setInitialStateOptions(I, y[I]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const A = (I, i) => {
    const [h] = et(i?.componentId ?? mt());
    pt({
      stateKey: I,
      options: i,
      initialOptionsPart: y
    });
    const r = o.getState().cogsStateStore[I] || g[I], f = i?.modifyState ? i.modifyState(r) : r, [G, R] = Wt(
      f,
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
    return R;
  };
  function w(I, i) {
    pt({ stateKey: I, options: i, initialOptionsPart: y }), i.localStorage && Ut(I, i), dt(I);
  }
  return { useCogsState: A, setCogsOptions: w };
}, {
  setUpdaterState: it,
  setState: Z,
  getInitialOptions: Q,
  getKeyState: Tt,
  getValidationErrors: Rt,
  setStateLog: Mt,
  updateInitialStateGlobal: yt,
  addValidationError: jt,
  removeValidationError: J,
  setServerSyncActions: Ft
} = o.getState(), wt = (t, s, v, g, y) => {
  v?.log && console.log(
    "saving to localstorage",
    s,
    v.localStorage?.key,
    g
  );
  const A = Y(v?.localStorage?.key) ? v.localStorage?.key(t) : v?.localStorage?.key;
  if (A && g) {
    const w = `${g}-${s}-${A}`;
    let I;
    try {
      I = lt(w)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, h = _t.serialize(i);
    window.localStorage.setItem(
      w,
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
}, Ut = (t, s) => {
  const v = o.getState().cogsStateStore[t], { sessionId: g } = $t(), y = Y(s?.localStorage?.key) ? s.localStorage.key(v) : s?.localStorage?.key;
  if (y && g) {
    const A = lt(
      `${g}-${t}-${y}`
    );
    if (A && A.lastUpdated > (A.lastSyncedWithServer || 0))
      return Z(t, A.state), dt(t), !0;
  }
  return !1;
}, Vt = (t, s, v, g, y, A) => {
  const w = {
    initialState: s,
    updaterState: st(
      t,
      g,
      y,
      A
    ),
    state: v
  };
  yt(t, w.initialState), it(t, w.updaterState), Z(t, w.state);
}, dt = (t) => {
  const s = o.getState().stateComponents.get(t);
  if (!s) return;
  const v = /* @__PURE__ */ new Set();
  s.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || v.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    v.forEach((g) => g());
  });
}, ne = (t, s) => {
  const v = o.getState().stateComponents.get(t);
  if (v) {
    const g = `${t}////${s}`, y = v.components.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Dt = (t, s, v, g) => {
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
function Wt(t, {
  stateKey: s,
  serverSync: v,
  localStorage: g,
  formElements: y,
  reactiveDeps: A,
  reactiveType: w,
  componentId: I,
  initialState: i,
  syncUpdate: h,
  dependencies: r,
  serverState: f
} = {}) {
  const [G, R] = et({}), { sessionId: M } = $t();
  let L = !s;
  const [m] = et(s ?? mt()), l = o.getState().stateLog[m], nt = X(/* @__PURE__ */ new Set()), q = X(I ?? mt()), O = X(
    null
  );
  O.current = Q(m) ?? null, ft(() => {
    if (h && h.stateKey === m && h.path?.[0]) {
      Z(m, (n) => ({
        ...n,
        [h.path[0]]: h.newValue
      }));
      const e = `${h.stateKey}:${h.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: h.timeStamp,
        userId: h.userId
      });
    }
  }, [h]), ft(() => {
    if (i) {
      It(m, {
        initialState: i
      });
      const e = O.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = o.getState().initialStateGlobal[m];
      if (!(c && !H(c, i) || !c) && !a)
        return;
      let u = null;
      const b = Y(e?.localStorage?.key) ? e?.localStorage?.key(i) : e?.localStorage?.key;
      b && M && (u = lt(`${M}-${m}-${b}`));
      let p = i, T = !1;
      const P = a ? Date.now() : 0, N = u?.lastUpdated || 0, C = u?.lastSyncedWithServer || 0;
      a && P > N ? (p = e.serverState.data, T = !0) : u && N > C && (p = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), Vt(
        m,
        i,
        p,
        K,
        q.current,
        M
      ), T && b && M && wt(p, m, e, M, Date.now()), dt(m), (Array.isArray(w) ? w : [w || "component"]).includes("none") || R({});
    }
  }, [
    i,
    f?.status,
    f?.data,
    ...r || []
  ]), ot(() => {
    L && It(m, {
      serverSync: v,
      formElements: y,
      initialState: i,
      localStorage: g,
      middleware: O.current?.middleware
    });
    const e = `${m}////${q.current}`, n = o.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(e, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: A || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), o.getState().stateComponents.set(m, n), R({}), () => {
      const a = `${m}////${q.current}`;
      n && (n.components.delete(a), n.components.size === 0 && o.getState().stateComponents.delete(m));
    };
  }, []);
  const K = (e, n, a, c) => {
    if (Array.isArray(n)) {
      const S = `${m}-${n.join(".")}`;
      nt.current.add(S);
    }
    Z(m, (S) => {
      const u = Y(e) ? e(S) : e, b = `${m}-${n.join(".")}`;
      if (b) {
        let j = !1, V = o.getState().signalDomElements.get(b);
        if ((!V || V.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const _ = n.slice(0, -1), U = B(u, _);
          if (Array.isArray(U)) {
            j = !0;
            const $ = `${m}-${_.join(".")}`;
            V = o.getState().signalDomElements.get($);
          }
        }
        if (V) {
          const _ = j ? B(u, n.slice(0, -1)) : B(u, n);
          V.forEach(({ parentId: U, position: $, effect: E }) => {
            const k = document.querySelector(
              `[data-parent-id="${U}"]`
            );
            if (k) {
              const W = Array.from(k.childNodes);
              if (W[$]) {
                const x = E ? new Function("state", `return (${E})(state)`)(_) : _;
                W[$].textContent = String(x);
              }
            }
          });
        }
      }
      a.updateType === "update" && (c || O.current?.validation?.key) && n && J(
        (c || O.current?.validation?.key) + "." + n.join(".")
      );
      const p = n.slice(0, n.length - 1);
      a.updateType === "cut" && O.current?.validation?.key && J(
        O.current?.validation?.key + "." + p.join(".")
      ), a.updateType === "insert" && O.current?.validation?.key && Rt(
        O.current?.validation?.key + "." + p.join(".")
      ).filter(([V, _]) => {
        let U = V?.split(".").length;
        if (V == p.join(".") && U == p.length - 1) {
          let $ = V + "." + p;
          J(V), jt($, _);
        }
      });
      const T = o.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", T), T) {
        const j = St(S, u), V = new Set(j), _ = a.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          U,
          $
        ] of T.components.entries()) {
          let E = !1;
          const k = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !k.includes("none")) {
            if (k.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (k.includes("component") && (($.paths.has(_) || $.paths.has("")) && (E = !0), !E))
              for (const W of V) {
                let x = W;
                for (; ; ) {
                  if ($.paths.has(x)) {
                    E = !0;
                    break;
                  }
                  const D = x.lastIndexOf(".");
                  if (D !== -1) {
                    const z = x.substring(
                      0,
                      D
                    );
                    if (!isNaN(
                      Number(x.substring(D + 1))
                    ) && $.paths.has(z)) {
                      E = !0;
                      break;
                    }
                    x = z;
                  } else
                    x = "";
                  if (x === "")
                    break;
                }
                if (E) break;
              }
            if (!E && k.includes("deps") && $.depsFunction) {
              const W = $.depsFunction(u);
              let x = !1;
              typeof W == "boolean" ? W && (x = !0) : H($.deps, W) || ($.deps = W, x = !0), x && (E = !0);
            }
            E && $.forceUpdate();
          }
        }
      }
      const P = Date.now();
      n = n.map((j, V) => {
        const _ = n.slice(0, -1), U = B(u, _);
        return V === n.length - 1 && ["insert", "cut"].includes(a.updateType) ? (U.length - 1).toString() : j;
      });
      const { oldValue: N, newValue: C } = Dt(
        a.updateType,
        S,
        u,
        n
      ), F = {
        timeStamp: P,
        stateKey: m,
        path: n,
        updateType: a.updateType,
        status: "new",
        oldValue: N,
        newValue: C
      };
      if (Mt(m, (j) => {
        const _ = [...j ?? [], F].reduce((U, $) => {
          const E = `${$.stateKey}:${JSON.stringify($.path)}`, k = U.get(E);
          return k ? (k.timeStamp = Math.max(k.timeStamp, $.timeStamp), k.newValue = $.newValue, k.oldValue = k.oldValue ?? $.oldValue, k.updateType = $.updateType) : U.set(E, { ...$ }), U;
        }, /* @__PURE__ */ new Map());
        return Array.from(_.values());
      }), wt(
        u,
        m,
        O.current,
        M
      ), O.current?.middleware && O.current.middleware({
        updateLog: l,
        update: F
      }), O.current?.serverSync) {
        const j = o.getState().serverState[m], V = O.current?.serverSync;
        Ft(m, {
          syncKey: typeof V.syncKey == "string" ? V.syncKey : V.syncKey({ state: u }),
          rollBackState: j,
          actionTimeStamp: Date.now() + (V.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return u;
    });
  };
  o.getState().updaterState[m] || (it(
    m,
    st(
      m,
      K,
      q.current,
      M
    )
  ), o.getState().cogsStateStore[m] || Z(m, t), o.getState().initialStateGlobal[m] || yt(m, t));
  const d = at(() => st(
    m,
    K,
    q.current,
    M
  ), [m, M]);
  return [Tt(m), d];
}
function st(t, s, v, g) {
  const y = /* @__PURE__ */ new Map();
  let A = 0;
  const w = (h) => {
    const r = h.join(".");
    for (const [f] of y)
      (f === r || f.startsWith(r + ".")) && y.delete(f);
    A++;
  }, I = {
    removeValidation: (h) => {
      h?.validationKey && J(h.validationKey);
    },
    revertToInitialState: (h) => {
      const r = o.getState().getInitialOptions(t)?.validation;
      r?.key && J(r?.key), h?.validationKey && J(h.validationKey);
      const f = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), A++;
      const G = i(f, []), R = Q(t), M = Y(R?.localStorage?.key) ? R?.localStorage?.key(f) : R?.localStorage?.key, L = `${g}-${t}-${M}`;
      L && localStorage.removeItem(L), it(t, G), Z(t, f);
      const m = o.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), f;
    },
    updateInitialState: (h) => {
      y.clear(), A++;
      const r = st(
        t,
        s,
        v,
        g
      ), f = o.getState().initialStateGlobal[t], G = Q(t), R = Y(G?.localStorage?.key) ? G?.localStorage?.key(f) : G?.localStorage?.key, M = `${g}-${t}-${R}`;
      return localStorage.getItem(M) && localStorage.removeItem(M), At(() => {
        yt(t, h), it(t, r), Z(t, h);
        const L = o.getState().stateComponents.get(t);
        L && L.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (L) => r.get()[L]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const h = o.getState().serverState[t];
      return !!(h && H(h, Tt(t)));
    }
  };
  function i(h, r = [], f) {
    const G = r.map(String).join(".");
    y.get(G);
    const R = function() {
      return o().getNestedState(t, r);
    };
    Object.keys(I).forEach((m) => {
      R[m] = I[m];
    });
    const M = {
      apply(m, l, nt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${r.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, r);
      },
      get(m, l) {
        f?.validIndices && !Array.isArray(h) && (f = { ...f, validIndices: void 0 });
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
          const d = `${t}////${v}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const n = e.components.get(d);
            if (n && !n.paths.has("")) {
              const a = r.join(".");
              let c = !0;
              for (const S of n.paths)
                if (a.startsWith(S) && (a === S || a[S.length] === ".")) {
                  c = !1;
                  break;
                }
              c && n.paths.add(a);
            }
          }
        }
        if (l === "getDifferences")
          return () => St(
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
              const c = await e.action(n);
              if (c && !c.success && c.errors && a) {
                o.getState().removeValidationError(a), c.errors.forEach((u) => {
                  const b = [a, ...u.path].join(".");
                  o.getState().addValidationError(b, u.message);
                });
                const S = o.getState().stateComponents.get(t);
                S && S.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return c?.success && e.onSuccess ? e.onSuccess(c.data) : !c?.success && e.onError && e.onError(c.error), c;
            } catch (c) {
              return e.onError && e.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = o.getState().getNestedState(t, r), e = o.getState().initialStateGlobal[t], n = B(e, r);
          return H(d, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              r
            ), e = o.getState().initialStateGlobal[t], n = B(e, r);
            return H(d, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = Q(t), n = Y(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${g}-${t}-${n}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + r.join("."));
          };
        if (Array.isArray(h)) {
          const d = () => f?.validIndices ? h.map((n, a) => ({
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
                return i(
                  h[e],
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
                itemHeight: n,
                overscan: a = 5,
                stickToBottom: c = !1
              } = e;
              if (typeof n != "number" || n <= 0)
                throw new Error(
                  "[cogs-state] `useVirtualView` requires a positive number for `itemHeight` option."
                );
              const S = X(null), u = X(!0), [b, p] = et({
                scrollPosition: 0,
                containerHeight: 0
              }), T = o.getState().getNestedState(t, r) || [], P = T.length, N = P * n, { startIndex: C, endIndex: F } = at(() => {
                const E = Math.max(
                  0,
                  Math.floor(b.scrollPosition / n) - a
                ), k = Math.min(
                  P,
                  Math.ceil(
                    (b.scrollPosition + b.containerHeight) / n
                  ) + a
                );
                return { startIndex: E, endIndex: k };
              }, [
                b.scrollPosition,
                b.containerHeight,
                P,
                n,
                a
              ]), j = at(
                () => ({
                  stateMap: (E) => {
                    if (P === 0) return [];
                    const k = F - C;
                    return k <= 0 ? [] : T.slice(C, k).map((x, D) => {
                      const z = C + D, kt = i(
                        x,
                        [...r, z.toString()],
                        f
                      );
                      return E(x, kt, D);
                    });
                  }
                }),
                [C, F, T, r.join("."), t]
              ), V = ut(
                (E, k = "auto") => {
                  S.current?.scrollTo({ top: E, behavior: k });
                },
                []
              ), _ = ut(
                (E = "smooth") => {
                  S.current && V(S.current.scrollHeight, E);
                },
                [V]
              ), U = ut(
                (E, k = "smooth") => {
                  V(E * n, k);
                },
                [V, n]
              );
              ot(() => {
                const E = S.current;
                if (!E) return;
                const k = () => {
                  const x = E.scrollTop;
                  u.current = E.scrollHeight > 0 && E.scrollHeight - x - E.clientHeight < 1, p(
                    (D) => D.scrollPosition === x ? D : { ...D, scrollPosition: x }
                  );
                };
                k(), E.addEventListener("scroll", k, {
                  passive: !0
                });
                const W = new ResizeObserver((x) => {
                  const D = x[0];
                  D && p(
                    (z) => z.containerHeight === D.contentRect.height ? z : { ...z, containerHeight: D.contentRect.height }
                  );
                });
                return W.observe(E), () => {
                  E.removeEventListener("scroll", k), W.disconnect();
                };
              }, []), ot(() => {
                c && u.current && _("auto");
              }, [T, c, _]);
              const $ = at(
                () => ({
                  outer: {
                    ref: S,
                    style: { overflowY: "auto", position: "relative" }
                  },
                  inner: {
                    style: {
                      position: "relative",
                      height: `${N}px`,
                      width: "100%"
                    }
                  },
                  list: {
                    style: {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${C * n}px)`
                    }
                  }
                }),
                [N, C, n]
              );
              return {
                virtualView: j,
                virtualizerProps: $,
                scrollToBottom: _,
                scrollToIndex: U
              };
            };
          if (l === "stateSort")
            return (e) => {
              const a = [...d()].sort(
                (u, b) => e(u.item, b.item)
              ), c = a.map(({ item: u }) => u), S = {
                ...f,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return i(c, r, S);
            };
          if (l === "stateFilter")
            return (e) => {
              const a = d().filter(
                ({ item: u }, b) => e(u, b)
              ), c = a.map(({ item: u }) => u), S = {
                ...f,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return i(c, r, S);
            };
          if (l === "stateMap")
            return (e) => {
              const n = o.getState().getNestedState(t, r);
              return Array.isArray(n) ? n.map((a, c) => {
                let S;
                f?.validIndices && f.validIndices[c] !== void 0 ? S = f.validIndices[c] : S = c;
                const u = [...r, S.toString()], b = i(a, u, f);
                return e(a, b, {
                  register: () => {
                    const [, T] = et({}), P = `${v}-${r.join(".")}-${S}`;
                    ot(() => {
                      const N = `${t}////${P}`, C = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return C.components.set(N, {
                        forceUpdate: () => T({}),
                        paths: /* @__PURE__ */ new Set([u.join(".")])
                        // ATOMIC: Subscribes only to this item's path.
                      }), o.getState().stateComponents.set(t, C), () => {
                        const F = o.getState().stateComponents.get(t);
                        F && F.components.delete(N);
                      };
                    }, [t, P]);
                  },
                  index: c,
                  originalIndex: S
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${r.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => h.map((a, c) => {
              let S;
              f?.validIndices && f.validIndices[c] !== void 0 ? S = f.validIndices[c] : S = c;
              const u = [...r, S.toString()], b = i(a, u, f);
              return e(
                a,
                b,
                c,
                h,
                i(h, r, f)
              );
            });
          if (l === "$stateMap")
            return (e) => ct(Gt, {
              proxy: {
                _stateKey: t,
                _path: r,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: i
            });
          if (l === "stateFlattenOn")
            return (e) => {
              const n = h;
              y.clear(), A++;
              const a = n.flatMap(
                (c) => c[e] ?? []
              );
              return i(
                a,
                [...r, "[*]", e],
                f
              );
            };
          if (l === "index")
            return (e) => {
              const n = h[e];
              return i(n, [...r, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = o.getState().getNestedState(t, r);
              if (e.length === 0) return;
              const n = e.length - 1, a = e[n], c = [...r, n.toString()];
              return i(a, c);
            };
          if (l === "insert")
            return (e) => (w(r), gt(s, e, r, t), i(
              o.getState().getNestedState(t, r),
              r
            ));
          if (l === "uniqueInsert")
            return (e, n, a) => {
              const c = o.getState().getNestedState(t, r), S = Y(e) ? e(c) : e;
              let u = null;
              if (!c.some((p) => {
                if (n) {
                  const P = n.every(
                    (N) => H(p[N], S[N])
                  );
                  return P && (u = p), P;
                }
                const T = H(p, S);
                return T && (u = p), T;
              }))
                w(r), gt(s, S, r, t);
              else if (a && u) {
                const p = a(u), T = c.map(
                  (P) => H(P, u) ? p : P
                );
                w(r), tt(s, T, r);
              }
            };
          if (l === "cut")
            return (e, n) => {
              if (!n?.waitForSync)
                return w(r), rt(s, r, t, e), i(
                  o.getState().getNestedState(t, r),
                  r
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let n = 0; n < h.length; n++)
                h[n] === e && rt(s, r, t, n);
            };
          if (l === "toggleByValue")
            return (e) => {
              const n = h.findIndex((a) => a === e);
              n > -1 ? rt(s, r, t, n) : gt(s, e, r, t);
            };
          if (l === "stateFind")
            return (e) => {
              const a = d().find(
                ({ item: S }, u) => e(S, u)
              );
              if (!a) return;
              const c = [...r, a.originalIndex.toString()];
              return i(a.item, c, f);
            };
          if (l === "findWith")
            return (e, n) => {
              const c = d().find(
                ({ item: u }) => u[e] === n
              );
              if (!c) return;
              const S = [...r, c.originalIndex.toString()];
              return i(c.item, S, f);
            };
        }
        const q = r[r.length - 1];
        if (!isNaN(Number(q))) {
          const d = r.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => rt(
              s,
              d,
              t,
              Number(q)
            );
        }
        if (l === "get")
          return () => o.getState().getNestedState(t, r);
        if (l === "$derive")
          return (d) => Et({
            _stateKey: t,
            _path: r,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Et({
            _stateKey: t,
            _path: r
          });
        if (l === "lastSynced") {
          const d = `${t}:${r.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => lt(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = r.slice(0, -1), e = d.join("."), n = o.getState().getNestedState(t, d);
          return Array.isArray(n) ? Number(r[r.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = r.slice(0, -1), n = Number(r[r.length - 1]), a = e.join(".");
            d ? o.getState().setSelectedIndex(t, a, n) : o.getState().setSelectedIndex(t, a, void 0);
            const c = o.getState().getNestedState(t, [...e]);
            tt(s, c, e), w(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = r.slice(0, -1), e = Number(r[r.length - 1]), n = d.join("."), a = o.getState().getSelectedIndex(t, n);
            o.getState().setSelectedIndex(
              t,
              n,
              a === e ? void 0 : e
            );
            const c = o.getState().getNestedState(t, [...d]);
            tt(s, c, d), w(d);
          };
        if (r.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], a = Ot(e, d).newDocument;
              Vt(
                t,
                o.getState().initialStateGlobal[t],
                a,
                s,
                v,
                g
              );
              const c = o.getState().stateComponents.get(t);
              if (c) {
                const S = St(e, a), u = new Set(S);
                for (const [
                  b,
                  p
                ] of c.components.entries()) {
                  let T = !1;
                  const P = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!P.includes("none")) {
                    if (P.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (P.includes("component") && (p.paths.has("") && (T = !0), !T))
                      for (const N of u) {
                        if (p.paths.has(N)) {
                          T = !0;
                          break;
                        }
                        let C = N.lastIndexOf(".");
                        for (; C !== -1; ) {
                          const F = N.substring(0, C);
                          if (p.paths.has(F)) {
                            T = !0;
                            break;
                          }
                          const j = N.substring(
                            C + 1
                          );
                          if (!isNaN(Number(j))) {
                            const V = F.lastIndexOf(".");
                            if (V !== -1) {
                              const _ = F.substring(
                                0,
                                V
                              );
                              if (p.paths.has(_)) {
                                T = !0;
                                break;
                              }
                            }
                          }
                          C = F.lastIndexOf(".");
                        }
                        if (T) break;
                      }
                    if (!T && P.includes("deps") && p.depsFunction) {
                      const N = p.depsFunction(a);
                      let C = !1;
                      typeof N == "boolean" ? N && (C = !0) : H(p.deps, N) || (p.deps = N, C = !0), C && (T = !0);
                    }
                    T && p.forceUpdate();
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
              J(d.key);
              const n = o.getState().cogsStateStore[t];
              try {
                const a = o.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([S]) => {
                  S && S.startsWith(d.key) && J(S);
                });
                const c = d.zodSchema.safeParse(n);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const b = u.path, p = u.message, T = [d.key, ...b].join(".");
                  e(T, p);
                }), dt(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return v;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => ht.getState().getFormRefsByStateKey(t);
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
          return () => ht.getState().getFormRef(t + "." + r.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ vt(
            Ct,
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
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Pt(() => {
                tt(s, d, r, "");
                const n = o.getState().getNestedState(t, r);
                e?.afterUpdate && e.afterUpdate(n);
              }, e.debounce);
            else {
              tt(s, d, r, "");
              const n = o.getState().getNestedState(t, r);
              e?.afterUpdate && e.afterUpdate(n);
            }
            w(r);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ vt(
            xt,
            {
              setState: s,
              stateKey: t,
              path: r,
              child: d,
              formOpts: e
            }
          );
        const O = [...r, l], K = o.getState().getNestedState(t, O);
        return i(K, O, f);
      }
    }, L = new Proxy(R, M);
    return y.set(G, {
      proxy: L,
      stateVersion: A
    }), L;
  }
  return i(
    o.getState().getNestedState(t, [])
  );
}
function Et(t) {
  return ct(Lt, { proxy: t });
}
function Gt({
  proxy: t,
  rebuildStateShape: s
}) {
  const v = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(v) ? s(
    v,
    t._path
  ).stateMapNoRender(
    (y, A, w, I, i) => t._mapFn(y, A, w, I, i)
  ) : null;
}
function Lt({
  proxy: t
}) {
  const s = X(null), v = `${t._stateKey}-${t._path.join(".")}`;
  return ft(() => {
    const g = s.current;
    if (!g || !g.parentElement) return;
    const y = g.parentElement, w = Array.from(y.childNodes).indexOf(g);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const h = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: w,
      effect: t._effect
    };
    o.getState().addSignalElement(v, h);
    const r = o.getState().getNestedState(t._stateKey, t._path);
    let f;
    if (t._effect)
      try {
        f = new Function(
          "state",
          `return (${t._effect})(state)`
        )(r);
      } catch (R) {
        console.error("Error evaluating effect function during mount:", R), f = r;
      }
    else
      f = r;
    f !== null && typeof f == "object" && (f = JSON.stringify(f));
    const G = document.createTextNode(String(f));
    g.replaceWith(G);
  }, [t._stateKey, t._path.join("."), t._effect]), ct("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": v
  });
}
function re(t) {
  const s = bt(
    (v) => {
      const g = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: v,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return ct("text", {}, String(s));
}
export {
  Et as $cogsSignal,
  re as $cogsSignalStore,
  te as addStateOptions,
  ee as createCogsState,
  ne as notifyComponent,
  Wt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
