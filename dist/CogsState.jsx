"use client";
import { jsx as vt } from "react/jsx-runtime";
import { useState as et, useRef as H, useEffect as ut, useLayoutEffect as ft, useMemo as At, createElement as st, useSyncExternalStore as Nt, startTransition as Vt, useCallback as ht } from "react";
import { transformStateFunc as bt, isDeepEqual as L, isFunction as J, getNestedValue as B, getDifferences as gt, debounce as Ct } from "./utility.js";
import { pushFunc as dt, updateFn as tt, cutFunc as rt, ValidationWrapper as Pt, FormControlComponent as _t } from "./Functions.jsx";
import Mt from "superjson";
import { v4 as St } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as It } from "./store.js";
import { useCogsConfig as $t } from "./CogsStateClient.jsx";
import { applyPatch as Ot } from "fast-json-patch";
function pt(t, i) {
  const h = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, y = h(t) || {};
  f(t, {
    ...y,
    ...i
  });
}
function wt({
  stateKey: t,
  options: i,
  initialOptionsPart: h
}) {
  const f = Z(t) || {}, y = h[t] || {}, $ = r.getState().setInitialStateOptions, E = { ...y, ...f };
  let I = !1;
  if (i)
    for (const s in i)
      E.hasOwnProperty(s) ? (s == "localStorage" && i[s] && E[s].key !== i[s]?.key && (I = !0, E[s] = i[s]), s == "initialState" && i[s] && E[s] !== i[s] && // Different references
      !L(E[s], i[s]) && (I = !0, E[s] = i[s])) : (I = !0, E[s] = i[s]);
  I && $(t, E);
}
function ee(t, { formElements: i, validation: h }) {
  return { initialState: t, formElements: i, validation: h };
}
const ne = (t, i) => {
  let h = t;
  const [f, y] = bt(h);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, Z(I) || r.getState().setInitialStateOptions(I, y[I]);
  }), r.getState().setInitialStates(f), r.getState().setCreatedState(f);
  const $ = (I, s) => {
    const [v] = et(s?.componentId ?? St());
    wt({
      stateKey: I,
      options: s,
      initialOptionsPart: y
    });
    const o = r.getState().cogsStateStore[I] || f[I], g = s?.modifyState ? s.modifyState(o) : o, [G, j] = Wt(
      g,
      {
        stateKey: I,
        syncUpdate: s?.syncUpdate,
        componentId: v,
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
  function E(I, s) {
    wt({ stateKey: I, options: s, initialOptionsPart: y }), s.localStorage && Dt(I, s), ct(I);
  }
  return { useCogsState: $, setCogsOptions: E };
}, {
  setUpdaterState: ot,
  setState: Y,
  getInitialOptions: Z,
  getKeyState: kt,
  getValidationErrors: Rt,
  setStateLog: jt,
  updateInitialStateGlobal: mt,
  addValidationError: Ft,
  removeValidationError: z,
  setServerSyncActions: Ut
} = r.getState(), Et = (t, i, h, f, y) => {
  h?.log && console.log(
    "saving to localstorage",
    i,
    h.localStorage?.key,
    f
  );
  const $ = J(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if ($ && f) {
    const E = `${f}-${i}-${$}`;
    let I;
    try {
      I = it(E)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Mt.serialize(s);
    window.localStorage.setItem(
      E,
      JSON.stringify(v.json)
    );
  }
}, it = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Dt = (t, i) => {
  const h = r.getState().cogsStateStore[t], { sessionId: f } = $t(), y = J(i?.localStorage?.key) ? i.localStorage.key(h) : i?.localStorage?.key;
  if (y && f) {
    const $ = it(
      `${f}-${t}-${y}`
    );
    if ($ && $.lastUpdated > ($.lastSyncedWithServer || 0))
      return Y(t, $.state), ct(t), !0;
  }
  return !1;
}, xt = (t, i, h, f, y, $) => {
  const E = {
    initialState: i,
    updaterState: at(
      t,
      f,
      y,
      $
    ),
    state: h
  };
  mt(t, E.initialState), ot(t, E.updaterState), Y(t, E.state);
}, ct = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const h = /* @__PURE__ */ new Set();
  i.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || h.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((f) => f());
  });
}, re = (t, i) => {
  const h = r.getState().stateComponents.get(t);
  if (h) {
    const f = `${t}////${i}`, y = h.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Gt = (t, i, h, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: B(i, f),
        newValue: B(h, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: B(h, f)
      };
    case "cut":
      return {
        oldValue: B(i, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Wt(t, {
  stateKey: i,
  serverSync: h,
  localStorage: f,
  formElements: y,
  reactiveDeps: $,
  reactiveType: E,
  componentId: I,
  initialState: s,
  syncUpdate: v,
  dependencies: o,
  serverState: g
} = {}) {
  const [G, j] = et({}), { sessionId: F } = $t();
  let W = !i;
  const [m] = et(i ?? St()), l = r.getState().stateLog[m], nt = H(/* @__PURE__ */ new Set()), q = H(I ?? St()), O = H(
    null
  );
  O.current = Z(m) ?? null, ut(() => {
    if (v && v.stateKey === m && v.path?.[0]) {
      Y(m, (n) => ({
        ...n,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), ut(() => {
    if (s) {
      pt(m, {
        initialState: s
      });
      const e = O.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = r.getState().initialStateGlobal[m];
      if (!(c && !L(c, s) || !c) && !a)
        return;
      let u = null;
      const N = J(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      N && F && (u = it(`${F}-${m}-${N}`));
      let p = s, A = !1;
      const C = a ? Date.now() : 0, x = u?.lastUpdated || 0, V = u?.lastSyncedWithServer || 0;
      a && C > x ? (p = e.serverState.data, A = !0) : u && x > V && (p = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), xt(
        m,
        s,
        p,
        X,
        q.current,
        F
      ), A && N && F && Et(p, m, e, F, Date.now()), ct(m), (Array.isArray(E) ? E : [E || "component"]).includes("none") || j({});
    }
  }, [
    s,
    g?.status,
    g?.data,
    ...o || []
  ]), ft(() => {
    W && pt(m, {
      serverSync: h,
      formElements: y,
      initialState: s,
      localStorage: f,
      middleware: O.current?.middleware
    });
    const e = `${m}////${q.current}`, n = r.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(e, {
      forceUpdate: () => j({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: $ || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), r.getState().stateComponents.set(m, n), j({}), () => {
      const a = `${m}////${q.current}`;
      n && (n.components.delete(a), n.components.size === 0 && r.getState().stateComponents.delete(m));
    };
  }, []);
  const X = (e, n, a, c) => {
    if (Array.isArray(n)) {
      const S = `${m}-${n.join(".")}`;
      nt.current.add(S);
    }
    Y(m, (S) => {
      const u = J(e) ? e(S) : e, N = `${m}-${n.join(".")}`;
      if (N) {
        let _ = !1, k = r.getState().signalDomElements.get(N);
        if ((!k || k.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const R = n.slice(0, -1), T = B(u, R);
          if (Array.isArray(T)) {
            _ = !0;
            const w = `${m}-${R.join(".")}`;
            k = r.getState().signalDomElements.get(w);
          }
        }
        if (k) {
          const R = _ ? B(u, n.slice(0, -1)) : B(u, n);
          k.forEach(({ parentId: T, position: w, effect: P }) => {
            const b = document.querySelector(
              `[data-parent-id="${T}"]`
            );
            if (b) {
              const U = Array.from(b.childNodes);
              if (U[w]) {
                const M = P ? new Function("state", `return (${P})(state)`)(R) : R;
                U[w].textContent = String(M);
              }
            }
          });
        }
      }
      a.updateType === "update" && (c || O.current?.validation?.key) && n && z(
        (c || O.current?.validation?.key) + "." + n.join(".")
      );
      const p = n.slice(0, n.length - 1);
      a.updateType === "cut" && O.current?.validation?.key && z(
        O.current?.validation?.key + "." + p.join(".")
      ), a.updateType === "insert" && O.current?.validation?.key && Rt(
        O.current?.validation?.key + "." + p.join(".")
      ).filter(([k, R]) => {
        let T = k?.split(".").length;
        if (k == p.join(".") && T == p.length - 1) {
          let w = k + "." + p;
          z(k), Ft(w, R);
        }
      });
      const A = r.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", A), A) {
        const _ = gt(S, u), k = new Set(_), R = a.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          T,
          w
        ] of A.components.entries()) {
          let P = !1;
          const b = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
          if (console.log("component", w), !b.includes("none")) {
            if (b.includes("all")) {
              w.forceUpdate();
              continue;
            }
            if (b.includes("component") && ((w.paths.has(R) || w.paths.has("")) && (P = !0), !P))
              for (const U of k) {
                let M = U;
                for (; ; ) {
                  if (w.paths.has(M)) {
                    P = !0;
                    break;
                  }
                  const Q = M.lastIndexOf(".");
                  if (Q !== -1) {
                    const K = M.substring(
                      0,
                      Q
                    );
                    if (!isNaN(
                      Number(M.substring(Q + 1))
                    ) && w.paths.has(K)) {
                      P = !0;
                      break;
                    }
                    M = K;
                  } else
                    M = "";
                  if (M === "")
                    break;
                }
                if (P) break;
              }
            if (!P && b.includes("deps") && w.depsFunction) {
              const U = w.depsFunction(u);
              let M = !1;
              typeof U == "boolean" ? U && (M = !0) : L(w.deps, U) || (w.deps = U, M = !0), M && (P = !0);
            }
            P && w.forceUpdate();
          }
        }
      }
      const C = Date.now();
      n = n.map((_, k) => {
        const R = n.slice(0, -1), T = B(u, R);
        return k === n.length - 1 && ["insert", "cut"].includes(a.updateType) ? (T.length - 1).toString() : _;
      });
      const { oldValue: x, newValue: V } = Gt(
        a.updateType,
        S,
        u,
        n
      ), D = {
        timeStamp: C,
        stateKey: m,
        path: n,
        updateType: a.updateType,
        status: "new",
        oldValue: x,
        newValue: V
      };
      if (jt(m, (_) => {
        const R = [..._ ?? [], D].reduce((T, w) => {
          const P = `${w.stateKey}:${JSON.stringify(w.path)}`, b = T.get(P);
          return b ? (b.timeStamp = Math.max(b.timeStamp, w.timeStamp), b.newValue = w.newValue, b.oldValue = b.oldValue ?? w.oldValue, b.updateType = w.updateType) : T.set(P, { ...w }), T;
        }, /* @__PURE__ */ new Map());
        return Array.from(R.values());
      }), Et(
        u,
        m,
        O.current,
        F
      ), O.current?.middleware && O.current.middleware({
        updateLog: l,
        update: D
      }), O.current?.serverSync) {
        const _ = r.getState().serverState[m], k = O.current?.serverSync;
        Ut(m, {
          syncKey: typeof k.syncKey == "string" ? k.syncKey : k.syncKey({ state: u }),
          rollBackState: _,
          actionTimeStamp: Date.now() + (k.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return u;
    });
  };
  r.getState().updaterState[m] || (ot(
    m,
    at(
      m,
      X,
      q.current,
      F
    )
  ), r.getState().cogsStateStore[m] || Y(m, t), r.getState().initialStateGlobal[m] || mt(m, t));
  const d = At(() => at(
    m,
    X,
    q.current,
    F
  ), [m, F]);
  return [kt(m), d];
}
function at(t, i, h, f) {
  const y = /* @__PURE__ */ new Map();
  let $ = 0;
  const E = (v) => {
    const o = v.join(".");
    for (const [g] of y)
      (g === o || g.startsWith(o + ".")) && y.delete(g);
    $++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && z(v.validationKey);
    },
    revertToInitialState: (v) => {
      const o = r.getState().getInitialOptions(t)?.validation;
      o?.key && z(o?.key), v?.validationKey && z(v.validationKey);
      const g = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), y.clear(), $++;
      const G = s(g, []), j = Z(t), F = J(j?.localStorage?.key) ? j?.localStorage?.key(g) : j?.localStorage?.key, W = `${f}-${t}-${F}`;
      W && localStorage.removeItem(W), ot(t, G), Y(t, g);
      const m = r.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), g;
    },
    updateInitialState: (v) => {
      y.clear(), $++;
      const o = at(
        t,
        i,
        h,
        f
      ), g = r.getState().initialStateGlobal[t], G = Z(t), j = J(G?.localStorage?.key) ? G?.localStorage?.key(g) : G?.localStorage?.key, F = `${f}-${t}-${j}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), Vt(() => {
        mt(t, v), ot(t, o), Y(t, v);
        const W = r.getState().stateComponents.get(t);
        W && W.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (W) => o.get()[W]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const v = r.getState().serverState[t];
      return !!(v && L(v, kt(t)));
    }
  };
  function s(v, o = [], g) {
    const G = o.map(String).join(".");
    y.get(G);
    const j = function() {
      return r().getNestedState(t, o);
    };
    Object.keys(I).forEach((m) => {
      j[m] = I[m];
    });
    const F = {
      apply(m, l, nt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${o.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, o);
      },
      get(m, l) {
        g?.validIndices && !Array.isArray(v) && (g = { ...g, validIndices: void 0 });
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
          const d = `${t}////${h}`, e = r.getState().stateComponents.get(t);
          if (e) {
            const n = e.components.get(d);
            if (n && !n.paths.has("")) {
              const a = o.join(".");
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
          return () => gt(
            r.getState().cogsStateStore[t],
            r.getState().initialStateGlobal[t]
          );
        if (l === "sync" && o.length === 0)
          return async function() {
            const d = r.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const n = r.getState().getNestedState(t, []), a = d?.validation?.key;
            try {
              const c = await e.action(n);
              if (c && !c.success && c.errors && a) {
                r.getState().removeValidationError(a), c.errors.forEach((u) => {
                  const N = [a, ...u.path].join(".");
                  r.getState().addValidationError(N, u.message);
                });
                const S = r.getState().stateComponents.get(t);
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
          const d = r.getState().getNestedState(t, o), e = r.getState().initialStateGlobal[t], n = B(e, o);
          return L(d, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              t,
              o
            ), e = r.getState().initialStateGlobal[t], n = B(e, o);
            return L(d, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[t], e = Z(t), n = J(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${f}-${t}-${n}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = r.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(d.key + "." + o.join("."));
          };
        if (Array.isArray(v)) {
          const d = () => g?.validIndices ? v.map((n, a) => ({
            item: n,
            originalIndex: g.validIndices[a]
          })) : r.getState().getNestedState(t, o).map((n, a) => ({
            item: n,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const e = r.getState().getSelectedIndex(t, o.join("."));
              if (e !== void 0)
                return s(
                  v[e],
                  [...o, e.toString()],
                  g
                );
            };
          if (l === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: t, path: o });
            };
          if (l === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(t, o.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (e) => {
              const {
                itemHeight: n,
                overscan: a = 5,
                stickToBottom: c = !1
              } = e, S = H(null), [u, N] = et({
                startIndex: 0,
                endIndex: 10
              }), p = H(c), A = H(0), C = H(!0), x = r().getNestedState(
                t,
                o
              ), V = x.length, D = At(() => {
                const T = Math.max(0, u.startIndex), w = Math.min(V, u.endIndex), P = Array.from(
                  { length: w - T },
                  (U, M) => T + M
                ), b = P.map((U) => x[U]);
                return s(b, o, {
                  ...g,
                  validIndices: P
                });
              }, [u.startIndex, u.endIndex, x, V]);
              ft(() => {
                const T = S.current;
                if (!T) return;
                const w = p.current, P = V > A.current;
                A.current = V;
                const b = () => {
                  const { scrollTop: U, clientHeight: M, scrollHeight: Q } = T;
                  p.current = Q - U - M < 10;
                  const K = Math.max(
                    0,
                    Math.floor(U / n) - a
                  ), yt = Math.min(
                    V,
                    Math.ceil((U + M) / n) + a
                  );
                  N((lt) => lt.startIndex !== K || lt.endIndex !== yt ? { startIndex: K, endIndex: yt } : lt);
                };
                return T.addEventListener("scroll", b, {
                  passive: !0
                }), c && (C.current ? T.scrollTo({
                  top: T.scrollHeight,
                  behavior: "auto"
                }) : w && P && requestAnimationFrame(() => {
                  T.scrollTo({
                    top: T.scrollHeight,
                    behavior: "smooth"
                  });
                })), C.current = !1, b(), () => T.removeEventListener("scroll", b);
              }, [V, n, a, c]);
              const _ = ht(
                (T = "smooth") => {
                  S.current && S.current.scrollTo({
                    top: S.current.scrollHeight,
                    behavior: T
                  });
                },
                []
              ), k = ht(
                (T, w = "smooth") => {
                  S.current && S.current.scrollTo({
                    top: T * n,
                    behavior: w
                  });
                },
                [n]
              ), R = {
                outer: {
                  ref: S,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${V * n}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${u.startIndex * n}px)`
                  }
                }
              };
              return {
                virtualState: D,
                virtualizerProps: R,
                scrollToBottom: _,
                scrollToIndex: k
              };
            };
          if (l === "stateSort")
            return (e) => {
              const a = [...d()].sort(
                (u, N) => e(u.item, N.item)
              ), c = a.map(({ item: u }) => u), S = {
                ...g,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, o, S);
            };
          if (l === "stateFilter")
            return (e) => {
              const a = d().filter(
                ({ item: u }, N) => e(u, N)
              ), c = a.map(({ item: u }) => u), S = {
                ...g,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, o, S);
            };
          if (l === "stateMap")
            return (e) => {
              const n = r.getState().getNestedState(t, o);
              return Array.isArray(n) ? (g?.validIndices || Array.from({ length: n.length }, (c, S) => S)).map((c, S) => {
                const u = n[c], N = [...o, c.toString()], p = s(u, N, g);
                return e(u, p, {
                  register: () => {
                    const [, C] = et({}), x = `${h}-${o.join(".")}-${c}`;
                    ft(() => {
                      const V = `${t}////${x}`, D = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set(V, {
                        forceUpdate: () => C({}),
                        paths: /* @__PURE__ */ new Set([N.join(".")])
                      }), r.getState().stateComponents.set(t, D), () => {
                        const _ = r.getState().stateComponents.get(t);
                        _ && _.components.delete(V);
                      };
                    }, [t, x]);
                  },
                  index: S,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${o.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => v.map((a, c) => {
              let S;
              g?.validIndices && g.validIndices[c] !== void 0 ? S = g.validIndices[c] : S = c;
              const u = [...o, S.toString()], N = s(a, u, g);
              return e(
                a,
                N,
                c,
                v,
                s(v, o, g)
              );
            });
          if (l === "$stateMap")
            return (e) => st(Lt, {
              proxy: {
                _stateKey: t,
                _path: o,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateFlattenOn")
            return (e) => {
              const n = v;
              y.clear(), $++;
              const a = n.flatMap(
                (c) => c[e] ?? []
              );
              return s(
                a,
                [...o, "[*]", e],
                g
              );
            };
          if (l === "index")
            return (e) => {
              const n = v[e];
              return s(n, [...o, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = r.getState().getNestedState(t, o);
              if (e.length === 0) return;
              const n = e.length - 1, a = e[n], c = [...o, n.toString()];
              return s(a, c);
            };
          if (l === "insert")
            return (e) => (E(o), dt(i, e, o, t), s(
              r.getState().getNestedState(t, o),
              o
            ));
          if (l === "uniqueInsert")
            return (e, n, a) => {
              const c = r.getState().getNestedState(t, o), S = J(e) ? e(c) : e;
              let u = null;
              if (!c.some((p) => {
                if (n) {
                  const C = n.every(
                    (x) => L(p[x], S[x])
                  );
                  return C && (u = p), C;
                }
                const A = L(p, S);
                return A && (u = p), A;
              }))
                E(o), dt(i, S, o, t);
              else if (a && u) {
                const p = a(u), A = c.map(
                  (C) => L(C, u) ? p : C
                );
                E(o), tt(i, A, o);
              }
            };
          if (l === "cut")
            return (e, n) => {
              if (!n?.waitForSync)
                return E(o), rt(i, o, t, e), s(
                  r.getState().getNestedState(t, o),
                  o
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let n = 0; n < v.length; n++)
                v[n] === e && rt(i, o, t, n);
            };
          if (l === "toggleByValue")
            return (e) => {
              const n = v.findIndex((a) => a === e);
              n > -1 ? rt(i, o, t, n) : dt(i, e, o, t);
            };
          if (l === "stateFind")
            return (e) => {
              const a = d().find(
                ({ item: S }, u) => e(S, u)
              );
              if (!a) return;
              const c = [...o, a.originalIndex.toString()];
              return s(a.item, c, g);
            };
          if (l === "findWith")
            return (e, n) => {
              const c = d().find(
                ({ item: u }) => u[e] === n
              );
              if (!c) return;
              const S = [...o, c.originalIndex.toString()];
              return s(c.item, S, g);
            };
        }
        const q = o[o.length - 1];
        if (!isNaN(Number(q))) {
          const d = o.slice(0, -1), e = r.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => rt(
              i,
              d,
              t,
              Number(q)
            );
        }
        if (l === "get")
          return () => {
            if (g?.validIndices && Array.isArray(v)) {
              const d = r.getState().getNestedState(t, o);
              return g.validIndices.map((e) => d[e]);
            }
            return r.getState().getNestedState(t, o);
          };
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
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => it(f + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = o.slice(0, -1), e = d.join("."), n = r.getState().getNestedState(t, d);
          return Array.isArray(n) ? Number(o[o.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = o.slice(0, -1), n = Number(o[o.length - 1]), a = e.join(".");
            d ? r.getState().setSelectedIndex(t, a, n) : r.getState().setSelectedIndex(t, a, void 0);
            const c = r.getState().getNestedState(t, [...e]);
            tt(i, c, e), E(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = o.slice(0, -1), e = Number(o[o.length - 1]), n = d.join("."), a = r.getState().getSelectedIndex(t, n);
            r.getState().setSelectedIndex(
              t,
              n,
              a === e ? void 0 : e
            );
            const c = r.getState().getNestedState(t, [...d]);
            tt(i, c, d), E(d);
          };
        if (o.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = r.getState().cogsStateStore[t], a = Ot(e, d).newDocument;
              xt(
                t,
                r.getState().initialStateGlobal[t],
                a,
                i,
                h,
                f
              );
              const c = r.getState().stateComponents.get(t);
              if (c) {
                const S = gt(e, a), u = new Set(S);
                for (const [
                  N,
                  p
                ] of c.components.entries()) {
                  let A = !1;
                  const C = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!C.includes("none")) {
                    if (C.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (C.includes("component") && (p.paths.has("") && (A = !0), !A))
                      for (const x of u) {
                        if (p.paths.has(x)) {
                          A = !0;
                          break;
                        }
                        let V = x.lastIndexOf(".");
                        for (; V !== -1; ) {
                          const D = x.substring(0, V);
                          if (p.paths.has(D)) {
                            A = !0;
                            break;
                          }
                          const _ = x.substring(
                            V + 1
                          );
                          if (!isNaN(Number(_))) {
                            const k = D.lastIndexOf(".");
                            if (k !== -1) {
                              const R = D.substring(
                                0,
                                k
                              );
                              if (p.paths.has(R)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          V = D.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && C.includes("deps") && p.depsFunction) {
                      const x = p.depsFunction(a);
                      let V = !1;
                      typeof x == "boolean" ? x && (V = !0) : L(p.deps, x) || (p.deps = x, V = !0), V && (A = !0);
                    }
                    A && p.forceUpdate();
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
              z(d.key);
              const n = r.getState().cogsStateStore[t];
              try {
                const a = r.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([S]) => {
                  S && S.startsWith(d.key) && z(S);
                });
                const c = d.zodSchema.safeParse(n);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const N = u.path, p = u.message, A = [d.key, ...N].join(".");
                  e(A, p);
                }), ct(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return h;
          if (l === "getComponents")
            return () => r().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => It.getState().getFormRefsByStateKey(t);
          if (l === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return r.getState().serverState[t];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return I.revertToInitialState;
          if (l === "updateInitialState") return I.updateInitialState;
          if (l === "removeValidation") return I.removeValidation;
        }
        if (l === "getFormRef")
          return () => It.getState().getFormRef(t + "." + o.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ vt(
            Pt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: o,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: g?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return o;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Ct(() => {
                tt(i, d, o, "");
                const n = r.getState().getNestedState(t, o);
                e?.afterUpdate && e.afterUpdate(n);
              }, e.debounce);
            else {
              tt(i, d, o, "");
              const n = r.getState().getNestedState(t, o);
              e?.afterUpdate && e.afterUpdate(n);
            }
            E(o);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ vt(
            _t,
            {
              setState: i,
              stateKey: t,
              path: o,
              child: d,
              formOpts: e
            }
          );
        const O = [...o, l], X = r.getState().getNestedState(t, O);
        return s(X, O, g);
      }
    }, W = new Proxy(j, F);
    return y.set(G, {
      proxy: W,
      stateVersion: $
    }), W;
  }
  return s(
    r.getState().getNestedState(t, [])
  );
}
function Tt(t) {
  return st(Bt, { proxy: t });
}
function Lt({
  proxy: t,
  rebuildStateShape: i
}) {
  const h = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(h) ? i(
    h,
    t._path
  ).stateMapNoRender(
    (y, $, E, I, s) => t._mapFn(y, $, E, I, s)
  ) : null;
}
function Bt({
  proxy: t
}) {
  const i = H(null), h = `${t._stateKey}-${t._path.join(".")}`;
  return ut(() => {
    const f = i.current;
    if (!f || !f.parentElement) return;
    const y = f.parentElement, E = Array.from(y.childNodes).indexOf(f);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: E,
      effect: t._effect
    };
    r.getState().addSignalElement(h, v);
    const o = r.getState().getNestedState(t._stateKey, t._path);
    let g;
    if (t._effect)
      try {
        g = new Function(
          "state",
          `return (${t._effect})(state)`
        )(o);
      } catch (j) {
        console.error("Error evaluating effect function during mount:", j), g = o;
      }
    else
      g = o;
    g !== null && typeof g == "object" && (g = JSON.stringify(g));
    const G = document.createTextNode(String(g));
    f.replaceWith(G);
  }, [t._stateKey, t._path.join("."), t._effect]), st("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function oe(t) {
  const i = Nt(
    (h) => {
      const f = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(t._stateKey, {
        forceUpdate: h,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => f.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return st("text", {}, String(i));
}
export {
  Tt as $cogsSignal,
  oe as $cogsSignalStore,
  ee as addStateOptions,
  ne as createCogsState,
  re as notifyComponent,
  Wt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
