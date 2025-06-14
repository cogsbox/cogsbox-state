"use client";
import { jsx as It } from "react/jsx-runtime";
import { useState as et, useRef as Y, useEffect as it, useLayoutEffect as mt, useMemo as $t, createElement as dt, useSyncExternalStore as Ct, startTransition as _t, useCallback as gt } from "react";
import { transformStateFunc as Ot, isDeepEqual as L, isFunction as z, getNestedValue as H, getDifferences as vt, debounce as Mt } from "./utility.js";
import { pushFunc as St, updateFn as tt, cutFunc as st, ValidationWrapper as jt, FormControlComponent as Ft } from "./Functions.jsx";
import Rt from "superjson";
import { v4 as yt } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as pt } from "./store.js";
import { useCogsConfig as xt } from "./CogsStateClient.jsx";
import { applyPatch as Ut } from "fast-json-patch";
function wt(t, i) {
  const h = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, y = h(t) || {};
  g(t, {
    ...y,
    ...i
  });
}
function Tt({
  stateKey: t,
  options: i,
  initialOptionsPart: h
}) {
  const g = Z(t) || {}, y = h[t] || {}, x = r.getState().setInitialStateOptions, T = { ...y, ...g };
  let p = !1;
  if (i)
    for (const s in i)
      T.hasOwnProperty(s) ? (s == "localStorage" && i[s] && T[s].key !== i[s]?.key && (p = !0, T[s] = i[s]), s == "initialState" && i[s] && T[s] !== i[s] && // Different references
      !L(T[s], i[s]) && (p = !0, T[s] = i[s])) : (p = !0, T[s] = i[s]);
  p && x(t, T);
}
function ae(t, { formElements: i, validation: h }) {
  return { initialState: t, formElements: i, validation: h };
}
const se = (t, i) => {
  let h = t;
  const [g, y] = Ot(h);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((p) => {
    y[p] = y[p] || {}, y[p].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[p].formElements || {}
      // State-specific overrides
    }, Z(p) || r.getState().setInitialStateOptions(p, y[p]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const x = (p, s) => {
    const [v] = et(s?.componentId ?? yt());
    Tt({
      stateKey: p,
      options: s,
      initialOptionsPart: y
    });
    const o = r.getState().cogsStateStore[p] || g[p], S = s?.modifyState ? s.modifyState(o) : o, [D, j] = qt(
      S,
      {
        stateKey: p,
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
  function T(p, s) {
    Tt({ stateKey: p, options: s, initialOptionsPart: y }), s.localStorage && Ht(p, s), ft(p);
  }
  return { useCogsState: x, setCogsOptions: T };
}, {
  setUpdaterState: ct,
  setState: J,
  getInitialOptions: Z,
  getKeyState: Vt,
  getValidationErrors: Dt,
  setStateLog: Wt,
  updateInitialStateGlobal: ht,
  addValidationError: Gt,
  removeValidationError: q,
  setServerSyncActions: Lt
} = r.getState(), Et = (t, i, h, g, y) => {
  h?.log && console.log(
    "saving to localstorage",
    i,
    h.localStorage?.key,
    g
  );
  const x = z(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if (x && g) {
    const T = `${g}-${i}-${x}`;
    let p;
    try {
      p = ut(T)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? p
    }, v = Rt.serialize(s);
    window.localStorage.setItem(
      T,
      JSON.stringify(v.json)
    );
  }
}, ut = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Ht = (t, i) => {
  const h = r.getState().cogsStateStore[t], { sessionId: g } = xt(), y = z(i?.localStorage?.key) ? i.localStorage.key(h) : i?.localStorage?.key;
  if (y && g) {
    const x = ut(
      `${g}-${t}-${y}`
    );
    if (x && x.lastUpdated > (x.lastSyncedWithServer || 0))
      return J(t, x.state), ft(t), !0;
  }
  return !1;
}, kt = (t, i, h, g, y, x) => {
  const T = {
    initialState: i,
    updaterState: lt(
      t,
      g,
      y,
      x
    ),
    state: h
  };
  ht(t, T.initialState), ct(t, T.updaterState), J(t, T.state);
}, ft = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const h = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || h.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((g) => g());
  });
}, ie = (t, i) => {
  const h = r.getState().stateComponents.get(t);
  if (h) {
    const g = `${t}////${i}`, y = h.components.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Bt = (t, i, h, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: H(i, g),
        newValue: H(h, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: H(h, g)
      };
    case "cut":
      return {
        oldValue: H(i, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function qt(t, {
  stateKey: i,
  serverSync: h,
  localStorage: g,
  formElements: y,
  reactiveDeps: x,
  reactiveType: T,
  componentId: p,
  initialState: s,
  syncUpdate: v,
  dependencies: o,
  serverState: S
} = {}) {
  const [D, j] = et({}), { sessionId: F } = xt();
  let W = !i;
  const [m] = et(i ?? yt()), l = r.getState().stateLog[m], nt = Y(/* @__PURE__ */ new Set()), B = Y(p ?? yt()), _ = Y(
    null
  );
  _.current = Z(m) ?? null, it(() => {
    if (v && v.stateKey === m && v.path?.[0]) {
      J(m, (n) => ({
        ...n,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), it(() => {
    if (s) {
      wt(m, {
        initialState: s
      });
      const e = _.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = r.getState().initialStateGlobal[m];
      if (!(c && !L(c, s) || !c) && !a)
        return;
      let u = null;
      const b = z(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      b && F && (u = ut(`${F}-${m}-${b}`));
      let w = s, $ = !1;
      const V = a ? Date.now() : 0, A = u?.lastUpdated || 0, O = u?.lastSyncedWithServer || 0;
      a && V > A ? (w = e.serverState.data, $ = !0) : u && A > O && (w = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), kt(
        m,
        s,
        w,
        X,
        B.current,
        F
      ), $ && b && F && Et(w, m, e, F, Date.now()), ft(m), (Array.isArray(T) ? T : [T || "component"]).includes("none") || j({});
    }
  }, [
    s,
    S?.status,
    S?.data,
    ...o || []
  ]), mt(() => {
    W && wt(m, {
      serverSync: h,
      formElements: y,
      initialState: s,
      localStorage: g,
      middleware: _.current?.middleware
    });
    const e = `${m}////${B.current}`, n = r.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(e, {
      forceUpdate: () => j({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: x || void 0,
      reactiveType: T ?? ["component", "deps"]
    }), r.getState().stateComponents.set(m, n), j({}), () => {
      const a = `${m}////${B.current}`;
      n && (n.components.delete(a), n.components.size === 0 && r.getState().stateComponents.delete(m));
    };
  }, []);
  const X = (e, n, a, c) => {
    if (Array.isArray(n)) {
      const f = `${m}-${n.join(".")}`;
      nt.current.add(f);
    }
    J(m, (f) => {
      const u = z(e) ? e(f) : e, b = `${m}-${n.join(".")}`;
      if (b) {
        let R = !1, k = r.getState().signalDomElements.get(b);
        if ((!k || k.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const M = n.slice(0, -1), E = H(u, M);
          if (Array.isArray(E)) {
            R = !0;
            const I = `${m}-${M.join(".")}`;
            k = r.getState().signalDomElements.get(I);
          }
        }
        if (k) {
          const M = R ? H(u, n.slice(0, -1)) : H(u, n);
          k.forEach(({ parentId: E, position: I, effect: N }) => {
            const C = document.querySelector(
              `[data-parent-id="${E}"]`
            );
            if (C) {
              const G = Array.from(C.childNodes);
              if (G[I]) {
                const P = N ? new Function("state", `return (${N})(state)`)(M) : M;
                G[I].textContent = String(P);
              }
            }
          });
        }
      }
      a.updateType === "update" && (c || _.current?.validation?.key) && n && q(
        (c || _.current?.validation?.key) + "." + n.join(".")
      );
      const w = n.slice(0, n.length - 1);
      a.updateType === "cut" && _.current?.validation?.key && q(
        _.current?.validation?.key + "." + w.join(".")
      ), a.updateType === "insert" && _.current?.validation?.key && Dt(
        _.current?.validation?.key + "." + w.join(".")
      ).filter(([k, M]) => {
        let E = k?.split(".").length;
        if (k == w.join(".") && E == w.length - 1) {
          let I = k + "." + w;
          q(k), Gt(I, M);
        }
      });
      const $ = r.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", $), $) {
        const R = vt(f, u), k = new Set(R), M = a.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          E,
          I
        ] of $.components.entries()) {
          let N = !1;
          const C = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (console.log("component", I), !C.includes("none")) {
            if (C.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if (C.includes("component") && ((I.paths.has(M) || I.paths.has("")) && (N = !0), !N))
              for (const G of k) {
                let P = G;
                for (; ; ) {
                  if (I.paths.has(P)) {
                    N = !0;
                    break;
                  }
                  const Q = P.lastIndexOf(".");
                  if (Q !== -1) {
                    const rt = P.substring(
                      0,
                      Q
                    );
                    if (!isNaN(
                      Number(P.substring(Q + 1))
                    ) && I.paths.has(rt)) {
                      N = !0;
                      break;
                    }
                    P = rt;
                  } else
                    P = "";
                  if (P === "")
                    break;
                }
                if (N) break;
              }
            if (!N && C.includes("deps") && I.depsFunction) {
              const G = I.depsFunction(u);
              let P = !1;
              typeof G == "boolean" ? G && (P = !0) : L(I.deps, G) || (I.deps = G, P = !0), P && (N = !0);
            }
            N && I.forceUpdate();
          }
        }
      }
      const V = Date.now();
      n = n.map((R, k) => {
        const M = n.slice(0, -1), E = H(u, M);
        return k === n.length - 1 && ["insert", "cut"].includes(a.updateType) ? (E.length - 1).toString() : R;
      });
      const { oldValue: A, newValue: O } = Bt(
        a.updateType,
        f,
        u,
        n
      ), U = {
        timeStamp: V,
        stateKey: m,
        path: n,
        updateType: a.updateType,
        status: "new",
        oldValue: A,
        newValue: O
      };
      if (Wt(m, (R) => {
        const M = [...R ?? [], U].reduce((E, I) => {
          const N = `${I.stateKey}:${JSON.stringify(I.path)}`, C = E.get(N);
          return C ? (C.timeStamp = Math.max(C.timeStamp, I.timeStamp), C.newValue = I.newValue, C.oldValue = C.oldValue ?? I.oldValue, C.updateType = I.updateType) : E.set(N, { ...I }), E;
        }, /* @__PURE__ */ new Map());
        return Array.from(M.values());
      }), Et(
        u,
        m,
        _.current,
        F
      ), _.current?.middleware && _.current.middleware({
        updateLog: l,
        update: U
      }), _.current?.serverSync) {
        const R = r.getState().serverState[m], k = _.current?.serverSync;
        Lt(m, {
          syncKey: typeof k.syncKey == "string" ? k.syncKey : k.syncKey({ state: u }),
          rollBackState: R,
          actionTimeStamp: Date.now() + (k.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return u;
    });
  };
  r.getState().updaterState[m] || (ct(
    m,
    lt(
      m,
      X,
      B.current,
      F
    )
  ), r.getState().cogsStateStore[m] || J(m, t), r.getState().initialStateGlobal[m] || ht(m, t));
  const d = $t(() => lt(
    m,
    X,
    B.current,
    F
  ), [m, F]);
  return [Vt(m), d];
}
function lt(t, i, h, g) {
  const y = /* @__PURE__ */ new Map();
  let x = 0;
  const T = (v) => {
    const o = v.join(".");
    for (const [S] of y)
      (S === o || S.startsWith(o + ".")) && y.delete(S);
    x++;
  }, p = {
    removeValidation: (v) => {
      v?.validationKey && q(v.validationKey);
    },
    revertToInitialState: (v) => {
      const o = r.getState().getInitialOptions(t)?.validation;
      o?.key && q(o?.key), v?.validationKey && q(v.validationKey);
      const S = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), y.clear(), x++;
      const D = s(S, []), j = Z(t), F = z(j?.localStorage?.key) ? j?.localStorage?.key(S) : j?.localStorage?.key, W = `${g}-${t}-${F}`;
      W && localStorage.removeItem(W), ct(t, D), J(t, S);
      const m = r.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), x++;
      const o = lt(
        t,
        i,
        h,
        g
      ), S = r.getState().initialStateGlobal[t], D = Z(t), j = z(D?.localStorage?.key) ? D?.localStorage?.key(S) : D?.localStorage?.key, F = `${g}-${t}-${j}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), _t(() => {
        ht(t, v), ct(t, o), J(t, v);
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
      return !!(v && L(v, Vt(t)));
    }
  };
  function s(v, o = [], S) {
    const D = o.map(String).join(".");
    y.get(D);
    const j = function() {
      return r().getNestedState(t, o);
    };
    Object.keys(p).forEach((m) => {
      j[m] = p[m];
    });
    const F = {
      apply(m, l, nt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${o.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, o);
      },
      get(m, l) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
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
              for (const f of n.paths)
                if (a.startsWith(f) && (a === f || a[f.length] === ".")) {
                  c = !1;
                  break;
                }
              c && n.paths.add(a);
            }
          }
        }
        if (l === "getDifferences")
          return () => vt(
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
                  const b = [a, ...u.path].join(".");
                  r.getState().addValidationError(b, u.message);
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
          const d = r.getState().getNestedState(t, o), e = r.getState().initialStateGlobal[t], n = H(e, o);
          return L(d, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              t,
              o
            ), e = r.getState().initialStateGlobal[t], n = H(e, o);
            return L(d, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[t], e = Z(t), n = z(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${g}-${t}-${n}`;
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
          const d = () => S?.validIndices ? v.map((n, a) => ({
            item: n,
            originalIndex: S.validIndices[a]
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
                  S
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
              } = e;
              if (typeof n != "number" || n <= 0)
                throw new Error(
                  "[cogs-state] `useVirtualView` requires a positive number for `itemHeight` option."
                );
              const f = Y(null), u = Y(!0), [b, w] = et({
                startIndex: 0,
                endIndex: Math.min(20, v.length)
              }), V = r().getNestedState(
                t,
                o
              ).length, A = V * n, O = $t(() => s(v, o, S).stateFilter((I, N) => N >= b.startIndex && N < b.endIndex), [b.startIndex, b.endIndex, V]);
              mt(() => {
                const E = f.current;
                if (!E) return;
                let I;
                const N = () => {
                  if (!E) return;
                  const P = E.scrollTop, Q = E.clientHeight, rt = Math.floor(P / n), At = Math.ceil(
                    (P + Q) / n
                  ), ot = Math.max(0, rt - a), at = Math.min(V, At + a);
                  w((K) => {
                    const Nt = Math.abs(K.startIndex - ot), Pt = Math.abs(K.endIndex - at);
                    return Nt > a / 2 || Pt > a / 2 ? { startIndex: ot, endIndex: at } : ot === 0 && K.startIndex !== 0 || at === V && K.endIndex !== V ? { startIndex: ot, endIndex: at } : K;
                  });
                }, C = () => {
                  const P = f.current;
                  P && (clearTimeout(I), u.current = P.scrollHeight - P.scrollTop - P.clientHeight < 1, I = setTimeout(N, 10));
                };
                N(), c && (E.scrollTop = E.scrollHeight), E.addEventListener("scroll", C, {
                  passive: !0
                });
                const G = new ResizeObserver(() => {
                  N(), c && u.current && (E.scrollTop = E.scrollHeight);
                });
                return G.observe(E), () => {
                  clearTimeout(I), E.removeEventListener("scroll", C), G.disconnect();
                };
              }, [V, n, a, c]), it(() => {
                c && u.current && f.current && (f.current.scrollTop = f.current.scrollHeight);
              }, [V]);
              const U = gt(
                (E, I = "auto") => {
                  f.current?.scrollTo({ top: E, behavior: I });
                },
                []
              ), R = gt(
                (E = "smooth") => {
                  const I = f.current;
                  I && I.scrollTo({
                    top: I.scrollHeight,
                    behavior: E
                  });
                },
                []
              ), k = gt(
                (E, I = "smooth") => {
                  U(E * n, I);
                },
                [U, n]
              ), M = {
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
                    height: `${A}px`,
                    width: "100%"
                  }
                },
                list: {
                  style: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    transform: `translateY(${b.startIndex * n}px)`
                  }
                }
              };
              return {
                virtualState: O,
                virtualizerProps: M,
                scrollToBottom: R,
                scrollToIndex: k
              };
            };
          if (l === "stateSort")
            return (e) => {
              const a = [...d()].sort(
                (u, b) => e(u.item, b.item)
              ), c = a.map(({ item: u }) => u), f = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, o, f);
            };
          if (l === "stateFilter")
            return (e) => {
              const a = d().filter(
                ({ item: u }, b) => e(u, b)
              ), c = a.map(({ item: u }) => u), f = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, o, f);
            };
          if (l === "stateMap")
            return (e) => {
              const n = r.getState().getNestedState(t, o);
              return Array.isArray(n) ? n.map((a, c) => {
                let f;
                S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
                const u = [...o, f.toString()], b = s(a, u, S);
                return e(a, b, {
                  register: () => {
                    const [, $] = et({}), V = `${h}-${o.join(".")}-${f}`;
                    mt(() => {
                      const A = `${t}////${V}`, O = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return O.components.set(A, {
                        forceUpdate: () => $({}),
                        paths: /* @__PURE__ */ new Set([u.join(".")])
                        // ATOMIC: Subscribes only to this item's path.
                      }), r.getState().stateComponents.set(t, O), () => {
                        const U = r.getState().stateComponents.get(t);
                        U && U.components.delete(A);
                      };
                    }, [t, V]);
                  },
                  index: c,
                  originalIndex: f
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${o.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => v.map((a, c) => {
              let f;
              S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
              const u = [...o, f.toString()], b = s(a, u, S);
              return e(
                a,
                b,
                c,
                v,
                s(v, o, S)
              );
            });
          if (l === "$stateMap")
            return (e) => dt(zt, {
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
              y.clear(), x++;
              const a = n.flatMap(
                (c) => c[e] ?? []
              );
              return s(
                a,
                [...o, "[*]", e],
                S
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
            return (e) => (T(o), St(i, e, o, t), s(
              r.getState().getNestedState(t, o),
              o
            ));
          if (l === "uniqueInsert")
            return (e, n, a) => {
              const c = r.getState().getNestedState(t, o), f = z(e) ? e(c) : e;
              let u = null;
              if (!c.some((w) => {
                if (n) {
                  const V = n.every(
                    (A) => L(w[A], f[A])
                  );
                  return V && (u = w), V;
                }
                const $ = L(w, f);
                return $ && (u = w), $;
              }))
                T(o), St(i, f, o, t);
              else if (a && u) {
                const w = a(u), $ = c.map(
                  (V) => L(V, u) ? w : V
                );
                T(o), tt(i, $, o);
              }
            };
          if (l === "cut")
            return (e, n) => {
              if (!n?.waitForSync)
                return T(o), st(i, o, t, e), s(
                  r.getState().getNestedState(t, o),
                  o
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let n = 0; n < v.length; n++)
                v[n] === e && st(i, o, t, n);
            };
          if (l === "toggleByValue")
            return (e) => {
              const n = v.findIndex((a) => a === e);
              n > -1 ? st(i, o, t, n) : St(i, e, o, t);
            };
          if (l === "stateFind")
            return (e) => {
              const a = d().find(
                ({ item: f }, u) => e(f, u)
              );
              if (!a) return;
              const c = [...o, a.originalIndex.toString()];
              return s(a.item, c, S);
            };
          if (l === "findWith")
            return (e, n) => {
              const c = d().find(
                ({ item: u }) => u[e] === n
              );
              if (!c) return;
              const f = [...o, c.originalIndex.toString()];
              return s(c.item, f, S);
            };
        }
        const B = o[o.length - 1];
        if (!isNaN(Number(B))) {
          const d = o.slice(0, -1), e = r.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => st(
              i,
              d,
              t,
              Number(B)
            );
        }
        if (l === "get")
          return () => r.getState().getNestedState(t, o);
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
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => ut(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = o.slice(0, -1), e = d.join("."), n = r.getState().getNestedState(t, d);
          return Array.isArray(n) ? Number(o[o.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = o.slice(0, -1), n = Number(o[o.length - 1]), a = e.join(".");
            d ? r.getState().setSelectedIndex(t, a, n) : r.getState().setSelectedIndex(t, a, void 0);
            const c = r.getState().getNestedState(t, [...e]);
            tt(i, c, e), T(e);
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
            tt(i, c, d), T(d);
          };
        if (o.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = r.getState().cogsStateStore[t], a = Ut(e, d).newDocument;
              kt(
                t,
                r.getState().initialStateGlobal[t],
                a,
                i,
                h,
                g
              );
              const c = r.getState().stateComponents.get(t);
              if (c) {
                const f = vt(e, a), u = new Set(f);
                for (const [
                  b,
                  w
                ] of c.components.entries()) {
                  let $ = !1;
                  const V = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!V.includes("none")) {
                    if (V.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (V.includes("component") && (w.paths.has("") && ($ = !0), !$))
                      for (const A of u) {
                        if (w.paths.has(A)) {
                          $ = !0;
                          break;
                        }
                        let O = A.lastIndexOf(".");
                        for (; O !== -1; ) {
                          const U = A.substring(0, O);
                          if (w.paths.has(U)) {
                            $ = !0;
                            break;
                          }
                          const R = A.substring(
                            O + 1
                          );
                          if (!isNaN(Number(R))) {
                            const k = U.lastIndexOf(".");
                            if (k !== -1) {
                              const M = U.substring(
                                0,
                                k
                              );
                              if (w.paths.has(M)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          O = U.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && V.includes("deps") && w.depsFunction) {
                      const A = w.depsFunction(a);
                      let O = !1;
                      typeof A == "boolean" ? A && (O = !0) : L(w.deps, A) || (w.deps = A, O = !0), O && ($ = !0);
                    }
                    $ && w.forceUpdate();
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
              q(d.key);
              const n = r.getState().cogsStateStore[t];
              try {
                const a = r.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([f]) => {
                  f && f.startsWith(d.key) && q(f);
                });
                const c = d.zodSchema.safeParse(n);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const b = u.path, w = u.message, $ = [d.key, ...b].join(".");
                  e($, w);
                }), ft(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return h;
          if (l === "getComponents")
            return () => r().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => pt.getState().getFormRefsByStateKey(t);
          if (l === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return r.getState().serverState[t];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return p.revertToInitialState;
          if (l === "updateInitialState") return p.updateInitialState;
          if (l === "removeValidation") return p.removeValidation;
        }
        if (l === "getFormRef")
          return () => pt.getState().getFormRef(t + "." + o.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ It(
            jt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: o,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: S?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return o;
        if (l === "_isServerSynced") return p._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Mt(() => {
                tt(i, d, o, "");
                const n = r.getState().getNestedState(t, o);
                e?.afterUpdate && e.afterUpdate(n);
              }, e.debounce);
            else {
              tt(i, d, o, "");
              const n = r.getState().getNestedState(t, o);
              e?.afterUpdate && e.afterUpdate(n);
            }
            T(o);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ It(
            Ft,
            {
              setState: i,
              stateKey: t,
              path: o,
              child: d,
              formOpts: e
            }
          );
        const _ = [...o, l], X = r.getState().getNestedState(t, _);
        return s(X, _, S);
      }
    }, W = new Proxy(j, F);
    return y.set(D, {
      proxy: W,
      stateVersion: x
    }), W;
  }
  return s(
    r.getState().getNestedState(t, [])
  );
}
function bt(t) {
  return dt(Jt, { proxy: t });
}
function zt({
  proxy: t,
  rebuildStateShape: i
}) {
  const h = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(h) ? i(
    h,
    t._path
  ).stateMapNoRender(
    (y, x, T, p, s) => t._mapFn(y, x, T, p, s)
  ) : null;
}
function Jt({
  proxy: t
}) {
  const i = Y(null), h = `${t._stateKey}-${t._path.join(".")}`;
  return it(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const y = g.parentElement, T = Array.from(y.childNodes).indexOf(g);
    let p = y.getAttribute("data-parent-id");
    p || (p = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", p));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: p,
      position: T,
      effect: t._effect
    };
    r.getState().addSignalElement(h, v);
    const o = r.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(o);
      } catch (j) {
        console.error("Error evaluating effect function during mount:", j), S = o;
      }
    else
      S = o;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const D = document.createTextNode(String(S));
    g.replaceWith(D);
  }, [t._stateKey, t._path.join("."), t._effect]), dt("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function ce(t) {
  const i = Ct(
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
  return dt("text", {}, String(i));
}
export {
  bt as $cogsSignal,
  ce as $cogsSignalStore,
  ae as addStateOptions,
  se as createCogsState,
  ie as notifyComponent,
  qt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
