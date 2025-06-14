"use client";
import { jsx as vt } from "react/jsx-runtime";
import { useState as nt, useRef as X, useEffect as St, useLayoutEffect as at, useMemo as it, createElement as lt, useSyncExternalStore as bt, startTransition as At, useCallback as gt } from "react";
import { transformStateFunc as Pt, isDeepEqual as z, isFunction as Y, getNestedValue as B, getDifferences as mt, debounce as Nt } from "./utility.js";
import { pushFunc as ft, updateFn as et, cutFunc as ot, ValidationWrapper as xt, FormControlComponent as Ct } from "./Functions.jsx";
import _t from "superjson";
import { v4 as ht } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as It } from "./store.js";
import { useCogsConfig as Tt } from "./CogsStateClient.jsx";
import { applyPatch as Ot } from "fast-json-patch";
function pt(t, s) {
  const y = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, h = y(t) || {};
  g(t, {
    ...h,
    ...s
  });
}
function wt({
  stateKey: t,
  options: s,
  initialOptionsPart: y
}) {
  const g = Q(t) || {}, h = y[t] || {}, A = o.getState().setInitialStateOptions, w = { ...h, ...g };
  let I = !1;
  if (s)
    for (const i in s)
      w.hasOwnProperty(i) ? (i == "localStorage" && s[i] && w[i].key !== s[i]?.key && (I = !0, w[i] = s[i]), i == "initialState" && s[i] && w[i] !== s[i] && // Different references
      !z(w[i], s[i]) && (I = !0, w[i] = s[i])) : (I = !0, w[i] = s[i]);
  I && A(t, w);
}
function te(t, { formElements: s, validation: y }) {
  return { initialState: t, formElements: s, validation: y };
}
const ee = (t, s) => {
  let y = t;
  const [g, h] = Pt(y);
  (Object.keys(h).length > 0 || s && Object.keys(s).length > 0) && Object.keys(h).forEach((I) => {
    h[I] = h[I] || {}, h[I].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...h[I].formElements || {}
      // State-specific overrides
    }, Q(I) || o.getState().setInitialStateOptions(I, h[I]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const A = (I, i) => {
    const [v] = nt(i?.componentId ?? ht());
    wt({
      stateKey: I,
      options: i,
      initialOptionsPart: h
    });
    const r = o.getState().cogsStateStore[I] || g[I], f = i?.modifyState ? i.modifyState(r) : r, [G, R] = Wt(
      f,
      {
        stateKey: I,
        syncUpdate: i?.syncUpdate,
        componentId: v,
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
    wt({ stateKey: I, options: i, initialOptionsPart: h }), i.localStorage && Ut(I, i), ut(I);
  }
  return { useCogsState: A, setCogsOptions: w };
}, {
  setUpdaterState: st,
  setState: Z,
  getInitialOptions: Q,
  getKeyState: kt,
  getValidationErrors: Rt,
  setStateLog: jt,
  updateInitialStateGlobal: yt,
  addValidationError: Mt,
  removeValidationError: J,
  setServerSyncActions: Ft
} = o.getState(), Et = (t, s, y, g, h) => {
  y?.log && console.log(
    "saving to localstorage",
    s,
    y.localStorage?.key,
    g
  );
  const A = Y(y?.localStorage?.key) ? y.localStorage?.key(t) : y?.localStorage?.key;
  if (A && g) {
    const w = `${g}-${s}-${A}`;
    let I;
    try {
      I = dt(w)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: h ?? I
    }, v = _t.serialize(i);
    window.localStorage.setItem(
      w,
      JSON.stringify(v.json)
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
}, Ut = (t, s) => {
  const y = o.getState().cogsStateStore[t], { sessionId: g } = Tt(), h = Y(s?.localStorage?.key) ? s.localStorage.key(y) : s?.localStorage?.key;
  if (h && g) {
    const A = dt(
      `${g}-${t}-${h}`
    );
    if (A && A.lastUpdated > (A.lastSyncedWithServer || 0))
      return Z(t, A.state), ut(t), !0;
  }
  return !1;
}, Vt = (t, s, y, g, h, A) => {
  const w = {
    initialState: s,
    updaterState: ct(
      t,
      g,
      h,
      A
    ),
    state: y
  };
  yt(t, w.initialState), st(t, w.updaterState), Z(t, w.state);
}, ut = (t) => {
  const s = o.getState().stateComponents.get(t);
  if (!s) return;
  const y = /* @__PURE__ */ new Set();
  s.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || y.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    y.forEach((g) => g());
  });
}, ne = (t, s) => {
  const y = o.getState().stateComponents.get(t);
  if (y) {
    const g = `${t}////${s}`, h = y.components.get(g);
    if ((h ? Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"] : null)?.includes("none"))
      return;
    h && h.forceUpdate();
  }
}, Dt = (t, s, y, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: B(s, g),
        newValue: B(y, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: B(y, g)
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
  serverSync: y,
  localStorage: g,
  formElements: h,
  reactiveDeps: A,
  reactiveType: w,
  componentId: I,
  initialState: i,
  syncUpdate: v,
  dependencies: r,
  serverState: f
} = {}) {
  const [G, R] = nt({}), { sessionId: j } = Tt();
  let L = !s;
  const [m] = nt(s ?? ht()), l = o.getState().stateLog[m], rt = X(/* @__PURE__ */ new Set()), q = X(I ?? ht()), O = X(
    null
  );
  O.current = Q(m) ?? null, St(() => {
    if (v && v.stateKey === m && v.path?.[0]) {
      Z(m, (n) => ({
        ...n,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), St(() => {
    if (i) {
      pt(m, {
        initialState: i
      });
      const e = O.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = o.getState().initialStateGlobal[m];
      if (!(c && !z(c, i) || !c) && !a)
        return;
      let u = null;
      const V = Y(e?.localStorage?.key) ? e?.localStorage?.key(i) : e?.localStorage?.key;
      V && j && (u = dt(`${j}-${m}-${V}`));
      let p = i, T = !1;
      const P = a ? Date.now() : 0, N = u?.lastUpdated || 0, x = u?.lastSyncedWithServer || 0;
      a && P > N ? (p = e.serverState.data, T = !0) : u && N > x && (p = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), Vt(
        m,
        i,
        p,
        K,
        q.current,
        j
      ), T && V && j && Et(p, m, e, j, Date.now()), ut(m), (Array.isArray(w) ? w : [w || "component"]).includes("none") || R({});
    }
  }, [
    i,
    f?.status,
    f?.data,
    ...r || []
  ]), at(() => {
    L && pt(m, {
      serverSync: y,
      formElements: h,
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
      rt.current.add(S);
    }
    Z(m, (S) => {
      const u = Y(e) ? e(S) : e, V = `${m}-${n.join(".")}`;
      if (V) {
        let M = !1, k = o.getState().signalDomElements.get(V);
        if ((!k || k.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const _ = n.slice(0, -1), D = B(u, _);
          if (Array.isArray(D)) {
            M = !0;
            const $ = `${m}-${_.join(".")}`;
            k = o.getState().signalDomElements.get($);
          }
        }
        if (k) {
          const _ = M ? B(u, n.slice(0, -1)) : B(u, n);
          k.forEach(({ parentId: D, position: $, effect: E }) => {
            const b = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (b) {
              const F = Array.from(b.childNodes);
              if (F[$]) {
                const C = E ? new Function("state", `return (${E})(state)`)(_) : _;
                F[$].textContent = String(C);
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
      ).filter(([k, _]) => {
        let D = k?.split(".").length;
        if (k == p.join(".") && D == p.length - 1) {
          let $ = k + "." + p;
          J(k), Mt($, _);
        }
      });
      const T = o.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", T), T) {
        const M = mt(S, u), k = new Set(M), _ = a.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          D,
          $
        ] of T.components.entries()) {
          let E = !1;
          const b = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !b.includes("none")) {
            if (b.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (b.includes("component") && (($.paths.has(_) || $.paths.has("")) && (E = !0), !E))
              for (const F of k) {
                let C = F;
                for (; ; ) {
                  if ($.paths.has(C)) {
                    E = !0;
                    break;
                  }
                  const W = C.lastIndexOf(".");
                  if (W !== -1) {
                    const H = C.substring(
                      0,
                      W
                    );
                    if (!isNaN(
                      Number(C.substring(W + 1))
                    ) && $.paths.has(H)) {
                      E = !0;
                      break;
                    }
                    C = H;
                  } else
                    C = "";
                  if (C === "")
                    break;
                }
                if (E) break;
              }
            if (!E && b.includes("deps") && $.depsFunction) {
              const F = $.depsFunction(u);
              let C = !1;
              typeof F == "boolean" ? F && (C = !0) : z($.deps, F) || ($.deps = F, C = !0), C && (E = !0);
            }
            E && $.forceUpdate();
          }
        }
      }
      const P = Date.now();
      n = n.map((M, k) => {
        const _ = n.slice(0, -1), D = B(u, _);
        return k === n.length - 1 && ["insert", "cut"].includes(a.updateType) ? (D.length - 1).toString() : M;
      });
      const { oldValue: N, newValue: x } = Dt(
        a.updateType,
        S,
        u,
        n
      ), U = {
        timeStamp: P,
        stateKey: m,
        path: n,
        updateType: a.updateType,
        status: "new",
        oldValue: N,
        newValue: x
      };
      if (jt(m, (M) => {
        const _ = [...M ?? [], U].reduce((D, $) => {
          const E = `${$.stateKey}:${JSON.stringify($.path)}`, b = D.get(E);
          return b ? (b.timeStamp = Math.max(b.timeStamp, $.timeStamp), b.newValue = $.newValue, b.oldValue = b.oldValue ?? $.oldValue, b.updateType = $.updateType) : D.set(E, { ...$ }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(_.values());
      }), Et(
        u,
        m,
        O.current,
        j
      ), O.current?.middleware && O.current.middleware({
        updateLog: l,
        update: U
      }), O.current?.serverSync) {
        const M = o.getState().serverState[m], k = O.current?.serverSync;
        Ft(m, {
          syncKey: typeof k.syncKey == "string" ? k.syncKey : k.syncKey({ state: u }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (k.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return u;
    });
  };
  o.getState().updaterState[m] || (st(
    m,
    ct(
      m,
      K,
      q.current,
      j
    )
  ), o.getState().cogsStateStore[m] || Z(m, t), o.getState().initialStateGlobal[m] || yt(m, t));
  const d = it(() => ct(
    m,
    K,
    q.current,
    j
  ), [m, j]);
  return [kt(m), d];
}
function ct(t, s, y, g) {
  const h = /* @__PURE__ */ new Map();
  let A = 0;
  const w = (v) => {
    const r = v.join(".");
    for (const [f] of h)
      (f === r || f.startsWith(r + ".")) && h.delete(f);
    A++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && J(v.validationKey);
    },
    revertToInitialState: (v) => {
      const r = o.getState().getInitialOptions(t)?.validation;
      r?.key && J(r?.key), v?.validationKey && J(v.validationKey);
      const f = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), h.clear(), A++;
      const G = i(f, []), R = Q(t), j = Y(R?.localStorage?.key) ? R?.localStorage?.key(f) : R?.localStorage?.key, L = `${g}-${t}-${j}`;
      L && localStorage.removeItem(L), st(t, G), Z(t, f);
      const m = o.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), f;
    },
    updateInitialState: (v) => {
      h.clear(), A++;
      const r = ct(
        t,
        s,
        y,
        g
      ), f = o.getState().initialStateGlobal[t], G = Q(t), R = Y(G?.localStorage?.key) ? G?.localStorage?.key(f) : G?.localStorage?.key, j = `${g}-${t}-${R}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), At(() => {
        yt(t, v), st(t, r), Z(t, v);
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
      const v = o.getState().serverState[t];
      return !!(v && z(v, kt(t)));
    }
  };
  function i(v, r = [], f) {
    const G = r.map(String).join(".");
    h.get(G);
    const R = function() {
      return o().getNestedState(t, r);
    };
    Object.keys(I).forEach((m) => {
      R[m] = I[m];
    });
    const j = {
      apply(m, l, rt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${r.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, r);
      },
      get(m, l) {
        f?.validIndices && !Array.isArray(v) && (f = { ...f, validIndices: void 0 });
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
          const d = `${t}////${y}`, e = o.getState().stateComponents.get(t);
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
          return () => mt(
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
                  const V = [a, ...u.path].join(".");
                  o.getState().addValidationError(V, u.message);
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
          return z(d, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              r
            ), e = o.getState().initialStateGlobal[t], n = B(e, r);
            return z(d, n) ? "fresh" : "stale";
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
        if (Array.isArray(v)) {
          const d = () => f?.validIndices ? v.map((n, a) => ({
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
                  v[e],
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
          if (l === "useVirtualizer")
            return (e) => {
              const {
                itemHeight: n,
                overscan: a = 5,
                stickToBottom: c = !1
              } = e;
              if (typeof n != "number" || n <= 0)
                throw new Error(
                  "[cogs-state] `useVirtualizer` requires a positive number for the `itemHeight` option."
                );
              const S = X(null), u = X(!0), [V, p] = nt({
                scrollPosition: 0,
                containerHeight: 0
              }), T = o.getState().getNestedState(t, r) || [], P = T.length, N = P * n, { startIndex: x, endIndex: U } = it(() => {
                const E = Math.max(
                  0,
                  Math.floor(V.scrollPosition / n) - a
                ), b = Math.min(
                  P,
                  Math.ceil(
                    (V.scrollPosition + V.containerHeight) / n
                  ) + a
                );
                return { startIndex: E, endIndex: b };
              }, [
                V.scrollPosition,
                V.containerHeight,
                P,
                n,
                a
              ]), M = it(() => {
                if (P === 0) return [];
                const E = U - x;
                return E <= 0 ? [] : T.slice(x, E).map((F, C) => {
                  const W = x + C, H = [...r, W.toString()], tt = i(F, H, f);
                  return {
                    value: F,
                    setter: tt,
                    originalIndex: W
                  };
                });
              }, [x, U, T, r.join("."), t]), k = gt(
                (E, b = "auto") => {
                  S.current?.scrollTo({ top: E, behavior: b });
                },
                []
              ), _ = gt(
                (E = "smooth") => {
                  S.current && k(S.current.scrollHeight, E);
                },
                [k]
              ), D = gt(
                (E, b = "smooth") => {
                  k(E * n, b);
                },
                [k, n]
              );
              at(() => {
                const E = S.current;
                if (!E) return;
                const b = () => {
                  const C = E.scrollTop, W = E.scrollHeight, H = E.clientHeight;
                  u.current = W > 0 && W - C - H < 1, p(
                    (tt) => tt.scrollPosition === C ? tt : { ...tt, scrollPosition: C }
                  );
                };
                b(), E.addEventListener("scroll", b, {
                  passive: !0
                });
                const F = new ResizeObserver((C) => {
                  const W = C[0];
                  W && p(
                    (H) => H.containerHeight === W.contentRect.height ? H : { ...H, containerHeight: W.contentRect.height }
                  );
                });
                return F.observe(E), () => {
                  E.removeEventListener("scroll", b), F.disconnect();
                };
              }, []), at(() => {
                c && u.current && _("auto");
              }, [P, c, _]);
              const $ = it(
                () => ({
                  outer: {
                    ref: S,
                    style: {
                      overflowY: "auto",
                      position: "relative"
                    }
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
                      transform: `translateY(${x * n}px)`
                    }
                  }
                }),
                [N, x, n]
              );
              return {
                virtualItems: M,
                virtualizerProps: $,
                scrollToBottom: _,
                scrollToIndex: D,
                scrollTo: k
              };
            };
          if (l === "stateSort")
            return (e) => {
              const a = [...d()].sort(
                (u, V) => e(u.item, V.item)
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
                ({ item: u }, V) => e(u, V)
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
                const u = [...r, S.toString()], V = i(a, u, f);
                return e(a, V, {
                  register: () => {
                    const [, T] = nt({}), P = `${y}-${r.join(".")}-${S}`;
                    at(() => {
                      const N = `${t}////${P}`, x = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return x.components.set(N, {
                        forceUpdate: () => T({}),
                        paths: /* @__PURE__ */ new Set([u.join(".")])
                        // ATOMIC: Subscribes only to this item's path.
                      }), o.getState().stateComponents.set(t, x), () => {
                        const U = o.getState().stateComponents.get(t);
                        U && U.components.delete(N);
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
            return (e) => v.map((a, c) => {
              let S;
              f?.validIndices && f.validIndices[c] !== void 0 ? S = f.validIndices[c] : S = c;
              const u = [...r, S.toString()], V = i(a, u, f);
              return e(
                a,
                V,
                c,
                v,
                i(v, r, f)
              );
            });
          if (l === "$stateMap")
            return (e) => lt(Gt, {
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
              const n = v;
              h.clear(), A++;
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
              const n = v[e];
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
            return (e) => (w(r), ft(s, e, r, t), i(
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
                    (N) => z(p[N], S[N])
                  );
                  return P && (u = p), P;
                }
                const T = z(p, S);
                return T && (u = p), T;
              }))
                w(r), ft(s, S, r, t);
              else if (a && u) {
                const p = a(u), T = c.map(
                  (P) => z(P, u) ? p : P
                );
                w(r), et(s, T, r);
              }
            };
          if (l === "cut")
            return (e, n) => {
              if (!n?.waitForSync)
                return w(r), ot(s, r, t, e), i(
                  o.getState().getNestedState(t, r),
                  r
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let n = 0; n < v.length; n++)
                v[n] === e && ot(s, r, t, n);
            };
          if (l === "toggleByValue")
            return (e) => {
              const n = v.findIndex((a) => a === e);
              n > -1 ? ot(s, r, t, n) : ft(s, e, r, t);
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
            return () => ot(
              s,
              d,
              t,
              Number(q)
            );
        }
        if (l === "get")
          return () => o.getState().getNestedState(t, r);
        if (l === "$derive")
          return (d) => $t({
            _stateKey: t,
            _path: r,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => $t({
            _stateKey: t,
            _path: r
          });
        if (l === "lastSynced") {
          const d = `${t}:${r.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => dt(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = r.slice(0, -1), e = d.join("."), n = o.getState().getNestedState(t, d);
          return Array.isArray(n) ? Number(r[r.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = r.slice(0, -1), n = Number(r[r.length - 1]), a = e.join(".");
            d ? o.getState().setSelectedIndex(t, a, n) : o.getState().setSelectedIndex(t, a, void 0);
            const c = o.getState().getNestedState(t, [...e]);
            et(s, c, e), w(e);
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
            et(s, c, d), w(d);
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
                y,
                g
              );
              const c = o.getState().stateComponents.get(t);
              if (c) {
                const S = mt(e, a), u = new Set(S);
                for (const [
                  V,
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
                        let x = N.lastIndexOf(".");
                        for (; x !== -1; ) {
                          const U = N.substring(0, x);
                          if (p.paths.has(U)) {
                            T = !0;
                            break;
                          }
                          const M = N.substring(
                            x + 1
                          );
                          if (!isNaN(Number(M))) {
                            const k = U.lastIndexOf(".");
                            if (k !== -1) {
                              const _ = U.substring(
                                0,
                                k
                              );
                              if (p.paths.has(_)) {
                                T = !0;
                                break;
                              }
                            }
                          }
                          x = U.lastIndexOf(".");
                        }
                        if (T) break;
                      }
                    if (!T && P.includes("deps") && p.depsFunction) {
                      const N = p.depsFunction(a);
                      let x = !1;
                      typeof N == "boolean" ? N && (x = !0) : z(p.deps, N) || (p.deps = N, x = !0), x && (T = !0);
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
                  const V = u.path, p = u.message, T = [d.key, ...V].join(".");
                  e(T, p);
                }), ut(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return y;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => It.getState().getFormRefsByStateKey(t);
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
          return () => It.getState().getFormRef(t + "." + r.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ vt(
            xt,
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
              Nt(() => {
                et(s, d, r, "");
                const n = o.getState().getNestedState(t, r);
                e?.afterUpdate && e.afterUpdate(n);
              }, e.debounce);
            else {
              et(s, d, r, "");
              const n = o.getState().getNestedState(t, r);
              e?.afterUpdate && e.afterUpdate(n);
            }
            w(r);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ vt(
            Ct,
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
    }, L = new Proxy(R, j);
    return h.set(G, {
      proxy: L,
      stateVersion: A
    }), L;
  }
  return i(
    o.getState().getNestedState(t, [])
  );
}
function $t(t) {
  return lt(Lt, { proxy: t });
}
function Gt({
  proxy: t,
  rebuildStateShape: s
}) {
  const y = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(y) ? s(
    y,
    t._path
  ).stateMapNoRender(
    (h, A, w, I, i) => t._mapFn(h, A, w, I, i)
  ) : null;
}
function Lt({
  proxy: t
}) {
  const s = X(null), y = `${t._stateKey}-${t._path.join(".")}`;
  return St(() => {
    const g = s.current;
    if (!g || !g.parentElement) return;
    const h = g.parentElement, w = Array.from(h.childNodes).indexOf(g);
    let I = h.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, h.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: w,
      effect: t._effect
    };
    o.getState().addSignalElement(y, v);
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
  }, [t._stateKey, t._path.join("."), t._effect]), lt("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": y
  });
}
function re(t) {
  const s = bt(
    (y) => {
      const g = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: y,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return lt("text", {}, String(s));
}
export {
  $t as $cogsSignal,
  re as $cogsSignalStore,
  te as addStateOptions,
  ee as createCogsState,
  ne as notifyComponent,
  Wt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
