"use client";
import { jsx as mt } from "react/jsx-runtime";
import { useState as tt, useRef as J, useEffect as rt, useLayoutEffect as dt, useMemo as At, createElement as st, useSyncExternalStore as kt, startTransition as xt, useCallback as yt } from "react";
import { transformStateFunc as Nt, isDeepEqual as L, isFunction as z, getNestedValue as B, getDifferences as ut, debounce as Vt } from "./utility.js";
import { pushFunc as lt, updateFn as K, cutFunc as nt, ValidationWrapper as Ct, FormControlComponent as bt } from "./Functions.jsx";
import Pt from "superjson";
import { v4 as gt } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as vt } from "./store.js";
import { useCogsConfig as Et } from "./CogsStateClient.jsx";
import { applyPatch as _t } from "fast-json-patch";
function ht(t, i) {
  const h = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, y = h(t) || {};
  g(t, {
    ...y,
    ...i
  });
}
function It({
  stateKey: t,
  options: i,
  initialOptionsPart: h
}) {
  const g = Y(t) || {}, y = h[t] || {}, k = r.getState().setInitialStateOptions, A = { ...y, ...g };
  let I = !1;
  if (i)
    for (const s in i)
      A.hasOwnProperty(s) ? (s == "localStorage" && i[s] && A[s].key !== i[s]?.key && (I = !0, A[s] = i[s]), s == "initialState" && i[s] && A[s] !== i[s] && // Different references
      !L(A[s], i[s]) && (I = !0, A[s] = i[s])) : (I = !0, A[s] = i[s]);
  I && k(t, A);
}
function Kt(t, { formElements: i, validation: h }) {
  return { initialState: t, formElements: i, validation: h };
}
const te = (t, i) => {
  let h = t;
  const [g, y] = Nt(h);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, Y(I) || r.getState().setInitialStateOptions(I, y[I]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const k = (I, s) => {
    const [v] = tt(s?.componentId ?? gt());
    It({
      stateKey: I,
      options: s,
      initialOptionsPart: y
    });
    const a = r.getState().cogsStateStore[I] || g[I], S = s?.modifyState ? s.modifyState(a) : a, [D, R] = Dt(
      S,
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
    return R;
  };
  function A(I, s) {
    It({ stateKey: I, options: s, initialOptionsPart: y }), s.localStorage && Ft(I, s), ct(I);
  }
  return { useCogsState: k, setCogsOptions: A };
}, {
  setUpdaterState: at,
  setState: Z,
  getInitialOptions: Y,
  getKeyState: Tt,
  getValidationErrors: Mt,
  setStateLog: Ot,
  updateInitialStateGlobal: ft,
  addValidationError: Rt,
  removeValidationError: q,
  setServerSyncActions: jt
} = r.getState(), pt = (t, i, h, g, y) => {
  h?.log && console.log(
    "saving to localstorage",
    i,
    h.localStorage?.key,
    g
  );
  const k = z(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if (k && g) {
    const A = `${g}-${i}-${k}`;
    let I;
    try {
      I = it(A)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Pt.serialize(s);
    window.localStorage.setItem(
      A,
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
}, Ft = (t, i) => {
  const h = r.getState().cogsStateStore[t], { sessionId: g } = Et(), y = z(i?.localStorage?.key) ? i.localStorage.key(h) : i?.localStorage?.key;
  if (y && g) {
    const k = it(
      `${g}-${t}-${y}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return Z(t, k.state), ct(t), !0;
  }
  return !1;
}, $t = (t, i, h, g, y, k) => {
  const A = {
    initialState: i,
    updaterState: ot(
      t,
      g,
      y,
      k
    ),
    state: h
  };
  ft(t, A.initialState), at(t, A.updaterState), Z(t, A.state);
}, ct = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const h = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || h.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((g) => g());
  });
}, ee = (t, i) => {
  const h = r.getState().stateComponents.get(t);
  if (h) {
    const g = `${t}////${i}`, y = h.components.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Ut = (t, i, h, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: B(i, g),
        newValue: B(h, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: B(h, g)
      };
    case "cut":
      return {
        oldValue: B(i, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Dt(t, {
  stateKey: i,
  serverSync: h,
  localStorage: g,
  formElements: y,
  reactiveDeps: k,
  reactiveType: A,
  componentId: I,
  initialState: s,
  syncUpdate: v,
  dependencies: a,
  serverState: S
} = {}) {
  const [D, R] = tt({}), { sessionId: j } = Et();
  let W = !i;
  const [m] = tt(i ?? gt()), l = r.getState().stateLog[m], et = J(/* @__PURE__ */ new Set()), H = J(I ?? gt()), M = J(
    null
  );
  M.current = Y(m) ?? null, rt(() => {
    if (v && v.stateKey === m && v.path?.[0]) {
      Z(m, (n) => ({
        ...n,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), rt(() => {
    if (s) {
      ht(m, {
        initialState: s
      });
      const e = M.current, o = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = r.getState().initialStateGlobal[m];
      if (!(c && !L(c, s) || !c) && !o)
        return;
      let d = null;
      const V = z(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      V && j && (d = it(`${j}-${m}-${V}`));
      let p = s, $ = !1;
      const C = o ? Date.now() : 0, T = d?.lastUpdated || 0, P = d?.lastSyncedWithServer || 0;
      o && C > T ? (p = e.serverState.data, $ = !0) : d && T > P && (p = d.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), $t(
        m,
        s,
        p,
        X,
        H.current,
        j
      ), $ && V && j && pt(p, m, e, j, Date.now()), ct(m), (Array.isArray(A) ? A : [A || "component"]).includes("none") || R({});
    }
  }, [
    s,
    S?.status,
    S?.data,
    ...a || []
  ]), dt(() => {
    W && ht(m, {
      serverSync: h,
      formElements: y,
      initialState: s,
      localStorage: g,
      middleware: M.current?.middleware
    });
    const e = `${m}////${H.current}`, n = r.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(e, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: A ?? ["component", "deps"]
    }), r.getState().stateComponents.set(m, n), R({}), () => {
      const o = `${m}////${H.current}`;
      n && (n.components.delete(o), n.components.size === 0 && r.getState().stateComponents.delete(m));
    };
  }, []);
  const X = (e, n, o, c) => {
    if (Array.isArray(n)) {
      const f = `${m}-${n.join(".")}`;
      et.current.add(f);
    }
    Z(m, (f) => {
      const d = z(e) ? e(f) : e, V = `${m}-${n.join(".")}`;
      if (V) {
        let _ = !1, x = r.getState().signalDomElements.get(V);
        if ((!x || x.size === 0) && (o.updateType === "insert" || o.updateType === "cut")) {
          const O = n.slice(0, -1), E = B(d, O);
          if (Array.isArray(E)) {
            _ = !0;
            const w = `${m}-${O.join(".")}`;
            x = r.getState().signalDomElements.get(w);
          }
        }
        if (x) {
          const O = _ ? B(d, n.slice(0, -1)) : B(d, n);
          x.forEach(({ parentId: E, position: w, effect: N }) => {
            const b = document.querySelector(
              `[data-parent-id="${E}"]`
            );
            if (b) {
              const G = Array.from(b.childNodes);
              if (G[w]) {
                const F = N ? new Function("state", `return (${N})(state)`)(O) : O;
                G[w].textContent = String(F);
              }
            }
          });
        }
      }
      o.updateType === "update" && (c || M.current?.validation?.key) && n && q(
        (c || M.current?.validation?.key) + "." + n.join(".")
      );
      const p = n.slice(0, n.length - 1);
      o.updateType === "cut" && M.current?.validation?.key && q(
        M.current?.validation?.key + "." + p.join(".")
      ), o.updateType === "insert" && M.current?.validation?.key && Mt(
        M.current?.validation?.key + "." + p.join(".")
      ).filter(([x, O]) => {
        let E = x?.split(".").length;
        if (x == p.join(".") && E == p.length - 1) {
          let w = x + "." + p;
          q(x), Rt(w, O);
        }
      });
      const $ = r.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", $), $) {
        const _ = ut(f, d), x = new Set(_), O = o.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          E,
          w
        ] of $.components.entries()) {
          let N = !1;
          const b = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
          if (console.log("component", w), !b.includes("none")) {
            if (b.includes("all")) {
              w.forceUpdate();
              continue;
            }
            if (b.includes("component") && ((w.paths.has(O) || w.paths.has("")) && (N = !0), !N))
              for (const G of x) {
                let F = G;
                for (; ; ) {
                  if (w.paths.has(F)) {
                    N = !0;
                    break;
                  }
                  const Q = F.lastIndexOf(".");
                  if (Q !== -1) {
                    const St = F.substring(
                      0,
                      Q
                    );
                    if (!isNaN(
                      Number(F.substring(Q + 1))
                    ) && w.paths.has(St)) {
                      N = !0;
                      break;
                    }
                    F = St;
                  } else
                    F = "";
                  if (F === "")
                    break;
                }
                if (N) break;
              }
            if (!N && b.includes("deps") && w.depsFunction) {
              const G = w.depsFunction(d);
              let F = !1;
              typeof G == "boolean" ? G && (F = !0) : L(w.deps, G) || (w.deps = G, F = !0), F && (N = !0);
            }
            N && w.forceUpdate();
          }
        }
      }
      const C = Date.now();
      n = n.map((_, x) => {
        const O = n.slice(0, -1), E = B(d, O);
        return x === n.length - 1 && ["insert", "cut"].includes(o.updateType) ? (E.length - 1).toString() : _;
      });
      const { oldValue: T, newValue: P } = Ut(
        o.updateType,
        f,
        d,
        n
      ), U = {
        timeStamp: C,
        stateKey: m,
        path: n,
        updateType: o.updateType,
        status: "new",
        oldValue: T,
        newValue: P
      };
      if (Ot(m, (_) => {
        const O = [..._ ?? [], U].reduce((E, w) => {
          const N = `${w.stateKey}:${JSON.stringify(w.path)}`, b = E.get(N);
          return b ? (b.timeStamp = Math.max(b.timeStamp, w.timeStamp), b.newValue = w.newValue, b.oldValue = b.oldValue ?? w.oldValue, b.updateType = w.updateType) : E.set(N, { ...w }), E;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), pt(
        d,
        m,
        M.current,
        j
      ), M.current?.middleware && M.current.middleware({
        updateLog: l,
        update: U
      }), M.current?.serverSync) {
        const _ = r.getState().serverState[m], x = M.current?.serverSync;
        jt(m, {
          syncKey: typeof x.syncKey == "string" ? x.syncKey : x.syncKey({ state: d }),
          rollBackState: _,
          actionTimeStamp: Date.now() + (x.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return d;
    });
  };
  r.getState().updaterState[m] || (at(
    m,
    ot(
      m,
      X,
      H.current,
      j
    )
  ), r.getState().cogsStateStore[m] || Z(m, t), r.getState().initialStateGlobal[m] || ft(m, t));
  const u = At(() => ot(
    m,
    X,
    H.current,
    j
  ), [m, j]);
  return [Tt(m), u];
}
function ot(t, i, h, g) {
  const y = /* @__PURE__ */ new Map();
  let k = 0;
  const A = (v) => {
    const a = v.join(".");
    for (const [S] of y)
      (S === a || S.startsWith(a + ".")) && y.delete(S);
    k++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && q(v.validationKey);
    },
    revertToInitialState: (v) => {
      const a = r.getState().getInitialOptions(t)?.validation;
      a?.key && q(a?.key), v?.validationKey && q(v.validationKey);
      const S = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), y.clear(), k++;
      const D = s(S, []), R = Y(t), j = z(R?.localStorage?.key) ? R?.localStorage?.key(S) : R?.localStorage?.key, W = `${g}-${t}-${j}`;
      W && localStorage.removeItem(W), at(t, D), Z(t, S);
      const m = r.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), k++;
      const a = ot(
        t,
        i,
        h,
        g
      ), S = r.getState().initialStateGlobal[t], D = Y(t), R = z(D?.localStorage?.key) ? D?.localStorage?.key(S) : D?.localStorage?.key, j = `${g}-${t}-${R}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), xt(() => {
        ft(t, v), at(t, a), Z(t, v);
        const W = r.getState().stateComponents.get(t);
        W && W.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (W) => a.get()[W]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const v = r.getState().serverState[t];
      return !!(v && L(v, Tt(t)));
    }
  };
  function s(v, a = [], S) {
    const D = a.map(String).join(".");
    y.get(D);
    const R = function() {
      return r().getNestedState(t, a);
    };
    Object.keys(I).forEach((m) => {
      R[m] = I[m];
    });
    const j = {
      apply(m, l, et) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${a.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, a);
      },
      get(m, l) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
        const et = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !et.has(l)) {
          const u = `${t}////${h}`, e = r.getState().stateComponents.get(t);
          if (e) {
            const n = e.components.get(u);
            if (n && !n.paths.has("")) {
              const o = a.join(".");
              let c = !0;
              for (const f of n.paths)
                if (o.startsWith(f) && (o === f || o[f.length] === ".")) {
                  c = !1;
                  break;
                }
              c && n.paths.add(o);
            }
          }
        }
        if (l === "getDifferences")
          return () => ut(
            r.getState().cogsStateStore[t],
            r.getState().initialStateGlobal[t]
          );
        if (l === "sync" && a.length === 0)
          return async function() {
            const u = r.getState().getInitialOptions(t), e = u?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const n = r.getState().getNestedState(t, []), o = u?.validation?.key;
            try {
              const c = await e.action(n);
              if (c && !c.success && c.errors && o) {
                r.getState().removeValidationError(o), c.errors.forEach((d) => {
                  const V = [o, ...d.path].join(".");
                  r.getState().addValidationError(V, d.message);
                });
                const f = r.getState().stateComponents.get(t);
                f && f.components.forEach((d) => {
                  d.forceUpdate();
                });
              }
              return c?.success && e.onSuccess ? e.onSuccess(c.data) : !c?.success && e.onError && e.onError(c.error), c;
            } catch (c) {
              return e.onError && e.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const u = r.getState().getNestedState(t, a), e = r.getState().initialStateGlobal[t], n = B(e, a);
          return L(u, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const u = r().getNestedState(
              t,
              a
            ), e = r.getState().initialStateGlobal[t], n = B(e, a);
            return L(u, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const u = r.getState().initialStateGlobal[t], e = Y(t), n = z(e?.localStorage?.key) ? e?.localStorage?.key(u) : e?.localStorage?.key, o = `${g}-${t}-${n}`;
            o && localStorage.removeItem(o);
          };
        if (l === "showValidationErrors")
          return () => {
            const u = r.getState().getInitialOptions(t)?.validation;
            if (!u?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(u.key + "." + a.join("."));
          };
        if (Array.isArray(v)) {
          const u = () => S?.validIndices ? v.map((n, o) => ({
            item: n,
            originalIndex: S.validIndices[o]
          })) : r.getState().getNestedState(t, a).map((n, o) => ({
            item: n,
            originalIndex: o
          }));
          if (l === "getSelected")
            return () => {
              const e = r.getState().getSelectedIndex(t, a.join("."));
              if (e !== void 0)
                return s(
                  v[e],
                  [...a, e.toString()],
                  S
                );
            };
          if (l === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: t, path: a });
            };
          if (l === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(t, a.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (e) => {
              const {
                itemHeight: n,
                overscan: o = 5,
                stickToBottom: c = !1
              } = e, f = J(null), [d, V] = tt({
                startIndex: 0,
                endIndex: 50
              }), p = J(!0), $ = J(), C = r().getNestedState(
                t,
                a
              ), T = C.length, P = $.current !== C;
              P && ($.current = C);
              const U = At(() => {
                const E = Array.from(
                  { length: d.endIndex - d.startIndex },
                  (N, b) => d.startIndex + b
                ).filter((N) => N < T), w = E.map((N) => C[N]);
                return s(w, a, {
                  ...S,
                  validIndices: E
                });
              }, [d.startIndex, d.endIndex, C]);
              dt(() => {
                const E = f.current;
                if (!E) return;
                const w = () => {
                  const { scrollTop: N, clientHeight: b, scrollHeight: G } = E;
                  p.current = G - N - b < 10;
                  const F = Math.max(
                    0,
                    Math.floor(N / n) - o
                  ), Q = Math.min(
                    T,
                    Math.ceil((N + b) / n) + o
                  );
                  V({ startIndex: F, endIndex: Q });
                };
                if (E.addEventListener("scroll", w, {
                  passive: !0
                }), P && c && T > 0) {
                  const N = Math.ceil(
                    E.clientHeight / n
                  ), b = Math.max(
                    0,
                    T - N - o
                  );
                  V({ startIndex: b, endIndex: T }), E.scrollTop = E.scrollHeight, p.current = !0;
                } else
                  w();
                return () => E.removeEventListener("scroll", w);
              }, [
                C,
                T,
                n,
                o,
                c
              ]), rt(() => {
                if (c && f.current) {
                  const E = f.current;
                  E.scrollHeight - E.scrollTop - E.clientHeight < 10 && !P && requestAnimationFrame(() => {
                    E.scrollTop = E.scrollHeight;
                  });
                }
              }, [T, P]);
              const _ = yt(
                (E = "smooth") => {
                  f.current && f.current.scrollTo({
                    top: f.current.scrollHeight,
                    behavior: E
                  });
                },
                []
              ), x = yt(
                (E, w = "smooth") => {
                  f.current && f.current.scrollTo({
                    top: E * n,
                    behavior: w
                  });
                },
                [n]
              ), O = {
                outer: {
                  ref: f,
                  style: {
                    overflowY: "auto",
                    height: "100%"
                  }
                },
                inner: {
                  style: {
                    height: `${T * n}px`
                  }
                },
                list: {
                  style: {
                    paddingTop: `${d.startIndex * n}px`
                  }
                }
              };
              return {
                virtualState: U,
                virtualizerProps: O,
                scrollToBottom: _,
                scrollToIndex: x
              };
            };
          if (l === "stateSort")
            return (e) => {
              const o = [...u()].sort(
                (d, V) => e(d.item, V.item)
              ), c = o.map(({ item: d }) => d), f = {
                ...S,
                validIndices: o.map(
                  ({ originalIndex: d }) => d
                )
              };
              return s(c, a, f);
            };
          if (l === "stateFilter")
            return (e) => {
              const o = u().filter(
                ({ item: d }, V) => e(d, V)
              ), c = o.map(({ item: d }) => d), f = {
                ...S,
                validIndices: o.map(
                  ({ originalIndex: d }) => d
                )
              };
              return s(c, a, f);
            };
          if (l === "stateMap")
            return (e) => {
              const n = r.getState().getNestedState(t, a);
              return Array.isArray(n) ? (S?.validIndices || Array.from({ length: n.length }, (c, f) => f)).map((c, f) => {
                const d = n[c], V = [...a, c.toString()], p = s(d, V, S);
                return e(d, p, {
                  register: () => {
                    const [, C] = tt({}), T = `${h}-${a.join(".")}-${c}`;
                    dt(() => {
                      const P = `${t}////${T}`, U = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return U.components.set(P, {
                        forceUpdate: () => C({}),
                        paths: /* @__PURE__ */ new Set([V.join(".")])
                      }), r.getState().stateComponents.set(t, U), () => {
                        const _ = r.getState().stateComponents.get(t);
                        _ && _.components.delete(P);
                      };
                    }, [t, T]);
                  },
                  index: f,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${a.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => v.map((o, c) => {
              let f;
              S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
              const d = [...a, f.toString()], V = s(o, d, S);
              return e(
                o,
                V,
                c,
                v,
                s(v, a, S)
              );
            });
          if (l === "$stateMap")
            return (e) => st(Wt, {
              proxy: {
                _stateKey: t,
                _path: a,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateFlattenOn")
            return (e) => {
              const n = v;
              y.clear(), k++;
              const o = n.flatMap(
                (c) => c[e] ?? []
              );
              return s(
                o,
                [...a, "[*]", e],
                S
              );
            };
          if (l === "index")
            return (e) => {
              const n = v[e];
              return s(n, [...a, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = r.getState().getNestedState(t, a);
              if (e.length === 0) return;
              const n = e.length - 1, o = e[n], c = [...a, n.toString()];
              return s(o, c);
            };
          if (l === "insert")
            return (e) => (A(a), lt(i, e, a, t), s(
              r.getState().getNestedState(t, a),
              a
            ));
          if (l === "uniqueInsert")
            return (e, n, o) => {
              const c = r.getState().getNestedState(t, a), f = z(e) ? e(c) : e;
              let d = null;
              if (!c.some((p) => {
                if (n) {
                  const C = n.every(
                    (T) => L(p[T], f[T])
                  );
                  return C && (d = p), C;
                }
                const $ = L(p, f);
                return $ && (d = p), $;
              }))
                A(a), lt(i, f, a, t);
              else if (o && d) {
                const p = o(d), $ = c.map(
                  (C) => L(C, d) ? p : C
                );
                A(a), K(i, $, a);
              }
            };
          if (l === "cut")
            return (e, n) => {
              if (!n?.waitForSync)
                return A(a), nt(i, a, t, e), s(
                  r.getState().getNestedState(t, a),
                  a
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let n = 0; n < v.length; n++)
                v[n] === e && nt(i, a, t, n);
            };
          if (l === "toggleByValue")
            return (e) => {
              const n = v.findIndex((o) => o === e);
              n > -1 ? nt(i, a, t, n) : lt(i, e, a, t);
            };
          if (l === "stateFind")
            return (e) => {
              const o = u().find(
                ({ item: f }, d) => e(f, d)
              );
              if (!o) return;
              const c = [...a, o.originalIndex.toString()];
              return s(o.item, c, S);
            };
          if (l === "findWith")
            return (e, n) => {
              const c = u().find(
                ({ item: d }) => d[e] === n
              );
              if (!c) return;
              const f = [...a, c.originalIndex.toString()];
              return s(c.item, f, S);
            };
        }
        const H = a[a.length - 1];
        if (!isNaN(Number(H))) {
          const u = a.slice(0, -1), e = r.getState().getNestedState(t, u);
          if (Array.isArray(e) && l === "cut")
            return () => nt(
              i,
              u,
              t,
              Number(H)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(v)) {
              const u = r.getState().getNestedState(t, a);
              return S.validIndices.map((e) => u[e]);
            }
            return r.getState().getNestedState(t, a);
          };
        if (l === "$derive")
          return (u) => wt({
            _stateKey: t,
            _path: a,
            _effect: u.toString()
          });
        if (l === "$get")
          return () => wt({
            _stateKey: t,
            _path: a
          });
        if (l === "lastSynced") {
          const u = `${t}:${a.join(".")}`;
          return r.getState().getSyncInfo(u);
        }
        if (l == "getLocalStorage")
          return (u) => it(g + "-" + t + "-" + u);
        if (l === "_selected") {
          const u = a.slice(0, -1), e = u.join("."), n = r.getState().getNestedState(t, u);
          return Array.isArray(n) ? Number(a[a.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (u) => {
            const e = a.slice(0, -1), n = Number(a[a.length - 1]), o = e.join(".");
            u ? r.getState().setSelectedIndex(t, o, n) : r.getState().setSelectedIndex(t, o, void 0);
            const c = r.getState().getNestedState(t, [...e]);
            K(i, c, e), A(e);
          };
        if (l === "toggleSelected")
          return () => {
            const u = a.slice(0, -1), e = Number(a[a.length - 1]), n = u.join("."), o = r.getState().getSelectedIndex(t, n);
            r.getState().setSelectedIndex(
              t,
              n,
              o === e ? void 0 : e
            );
            const c = r.getState().getNestedState(t, [...u]);
            K(i, c, u), A(u);
          };
        if (a.length == 0) {
          if (l === "applyJsonPatch")
            return (u) => {
              const e = r.getState().cogsStateStore[t], o = _t(e, u).newDocument;
              $t(
                t,
                r.getState().initialStateGlobal[t],
                o,
                i,
                h,
                g
              );
              const c = r.getState().stateComponents.get(t);
              if (c) {
                const f = ut(e, o), d = new Set(f);
                for (const [
                  V,
                  p
                ] of c.components.entries()) {
                  let $ = !1;
                  const C = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!C.includes("none")) {
                    if (C.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (C.includes("component") && (p.paths.has("") && ($ = !0), !$))
                      for (const T of d) {
                        if (p.paths.has(T)) {
                          $ = !0;
                          break;
                        }
                        let P = T.lastIndexOf(".");
                        for (; P !== -1; ) {
                          const U = T.substring(0, P);
                          if (p.paths.has(U)) {
                            $ = !0;
                            break;
                          }
                          const _ = T.substring(
                            P + 1
                          );
                          if (!isNaN(Number(_))) {
                            const x = U.lastIndexOf(".");
                            if (x !== -1) {
                              const O = U.substring(
                                0,
                                x
                              );
                              if (p.paths.has(O)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          P = U.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && C.includes("deps") && p.depsFunction) {
                      const T = p.depsFunction(o);
                      let P = !1;
                      typeof T == "boolean" ? T && (P = !0) : L(p.deps, T) || (p.deps = T, P = !0), P && ($ = !0);
                    }
                    $ && p.forceUpdate();
                  }
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const u = r.getState().getInitialOptions(t)?.validation, e = r.getState().addValidationError;
              if (!u?.zodSchema)
                throw new Error("Zod schema not found");
              if (!u?.key)
                throw new Error("Validation key not found");
              q(u.key);
              const n = r.getState().cogsStateStore[t];
              try {
                const o = r.getState().getValidationErrors(u.key);
                o && o.length > 0 && o.forEach(([f]) => {
                  f && f.startsWith(u.key) && q(f);
                });
                const c = u.zodSchema.safeParse(n);
                return c.success ? !0 : (c.error.errors.forEach((d) => {
                  const V = d.path, p = d.message, $ = [u.key, ...V].join(".");
                  e($, p);
                }), ct(t), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (l === "_componentId") return h;
          if (l === "getComponents")
            return () => r().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => vt.getState().getFormRefsByStateKey(t);
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
          return () => vt.getState().getFormRef(t + "." + a.join("."));
        if (l === "validationWrapper")
          return ({
            children: u,
            hideMessage: e
          }) => /* @__PURE__ */ mt(
            Ct,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: a,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: S?.validIndices,
              children: u
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return a;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (u, e) => {
            if (e?.debounce)
              Vt(() => {
                K(i, u, a, "");
                const n = r.getState().getNestedState(t, a);
                e?.afterUpdate && e.afterUpdate(n);
              }, e.debounce);
            else {
              K(i, u, a, "");
              const n = r.getState().getNestedState(t, a);
              e?.afterUpdate && e.afterUpdate(n);
            }
            A(a);
          };
        if (l === "formElement")
          return (u, e) => /* @__PURE__ */ mt(
            bt,
            {
              setState: i,
              stateKey: t,
              path: a,
              child: u,
              formOpts: e
            }
          );
        const M = [...a, l], X = r.getState().getNestedState(t, M);
        return s(X, M, S);
      }
    }, W = new Proxy(R, j);
    return y.set(D, {
      proxy: W,
      stateVersion: k
    }), W;
  }
  return s(
    r.getState().getNestedState(t, [])
  );
}
function wt(t) {
  return st(Gt, { proxy: t });
}
function Wt({
  proxy: t,
  rebuildStateShape: i
}) {
  const h = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(h) ? i(
    h,
    t._path
  ).stateMapNoRender(
    (y, k, A, I, s) => t._mapFn(y, k, A, I, s)
  ) : null;
}
function Gt({
  proxy: t
}) {
  const i = J(null), h = `${t._stateKey}-${t._path.join(".")}`;
  return rt(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const y = g.parentElement, A = Array.from(y.childNodes).indexOf(g);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: A,
      effect: t._effect
    };
    r.getState().addSignalElement(h, v);
    const a = r.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(a);
      } catch (R) {
        console.error("Error evaluating effect function during mount:", R), S = a;
      }
    else
      S = a;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const D = document.createTextNode(String(S));
    g.replaceWith(D);
  }, [t._stateKey, t._path.join("."), t._effect]), st("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function ne(t) {
  const i = kt(
    (h) => {
      const g = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: h,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return st("text", {}, String(i));
}
export {
  wt as $cogsSignal,
  ne as $cogsSignalStore,
  Kt as addStateOptions,
  te as createCogsState,
  ee as notifyComponent,
  Dt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
