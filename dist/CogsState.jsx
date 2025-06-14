"use client";
import { jsx as yt } from "react/jsx-runtime";
import { useState as et, useRef as Z, useEffect as ft, useLayoutEffect as ot, useMemo as Tt, createElement as st, useSyncExternalStore as kt, startTransition as At, useCallback as ut } from "react";
import { transformStateFunc as Vt, isDeepEqual as L, isFunction as z, getNestedValue as H, getDifferences as St, debounce as Nt } from "./utility.js";
import { pushFunc as gt, updateFn as tt, cutFunc as rt, ValidationWrapper as Ct, FormControlComponent as Pt } from "./Functions.jsx";
import _t from "superjson";
import { v4 as mt } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as ht } from "./store.js";
import { useCogsConfig as $t } from "./CogsStateClient.jsx";
import { applyPatch as Ot } from "fast-json-patch";
function It(t, s) {
  const y = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, v = y(t) || {};
  g(t, {
    ...v,
    ...s
  });
}
function pt({
  stateKey: t,
  options: s,
  initialOptionsPart: y
}) {
  const g = X(t) || {}, v = y[t] || {}, x = r.getState().setInitialStateOptions, E = { ...v, ...g };
  let p = !1;
  if (s)
    for (const i in s)
      E.hasOwnProperty(i) ? (i == "localStorage" && s[i] && E[i].key !== s[i]?.key && (p = !0, E[i] = s[i]), i == "initialState" && s[i] && E[i] !== s[i] && // Different references
      !L(E[i], s[i]) && (p = !0, E[i] = s[i])) : (p = !0, E[i] = s[i]);
  p && x(t, E);
}
function te(t, { formElements: s, validation: y }) {
  return { initialState: t, formElements: s, validation: y };
}
const ee = (t, s) => {
  let y = t;
  const [g, v] = Vt(y);
  (Object.keys(v).length > 0 || s && Object.keys(s).length > 0) && Object.keys(v).forEach((p) => {
    v[p] = v[p] || {}, v[p].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...v[p].formElements || {}
      // State-specific overrides
    }, X(p) || r.getState().setInitialStateOptions(p, v[p]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const x = (p, i) => {
    const [h] = et(i?.componentId ?? mt());
    pt({
      stateKey: p,
      options: i,
      initialOptionsPart: v
    });
    const o = r.getState().cogsStateStore[p] || g[p], S = i?.modifyState ? i.modifyState(o) : o, [W, j] = Wt(
      S,
      {
        stateKey: p,
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
    return j;
  };
  function E(p, i) {
    pt({ stateKey: p, options: i, initialOptionsPart: v }), i.localStorage && Ut(p, i), lt(p);
  }
  return { useCogsState: x, setCogsOptions: E };
}, {
  setUpdaterState: at,
  setState: J,
  getInitialOptions: X,
  getKeyState: bt,
  getValidationErrors: Mt,
  setStateLog: Rt,
  updateInitialStateGlobal: vt,
  addValidationError: jt,
  removeValidationError: q,
  setServerSyncActions: Ft
} = r.getState(), wt = (t, s, y, g, v) => {
  y?.log && console.log(
    "saving to localstorage",
    s,
    y.localStorage?.key,
    g
  );
  const x = z(y?.localStorage?.key) ? y.localStorage?.key(t) : y?.localStorage?.key;
  if (x && g) {
    const E = `${g}-${s}-${x}`;
    let p;
    try {
      p = ct(E)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: v ?? p
    }, h = _t.serialize(i);
    window.localStorage.setItem(
      E,
      JSON.stringify(h.json)
    );
  }
}, ct = (t) => {
  if (!t) return null;
  try {
    const s = window.localStorage.getItem(t);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, Ut = (t, s) => {
  const y = r.getState().cogsStateStore[t], { sessionId: g } = $t(), v = z(s?.localStorage?.key) ? s.localStorage.key(y) : s?.localStorage?.key;
  if (v && g) {
    const x = ct(
      `${g}-${t}-${v}`
    );
    if (x && x.lastUpdated > (x.lastSyncedWithServer || 0))
      return J(t, x.state), lt(t), !0;
  }
  return !1;
}, xt = (t, s, y, g, v, x) => {
  const E = {
    initialState: s,
    updaterState: it(
      t,
      g,
      v,
      x
    ),
    state: y
  };
  vt(t, E.initialState), at(t, E.updaterState), J(t, E.state);
}, lt = (t) => {
  const s = r.getState().stateComponents.get(t);
  if (!s) return;
  const y = /* @__PURE__ */ new Set();
  s.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || y.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    y.forEach((g) => g());
  });
}, ne = (t, s) => {
  const y = r.getState().stateComponents.get(t);
  if (y) {
    const g = `${t}////${s}`, v = y.components.get(g);
    if ((v ? Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"] : null)?.includes("none"))
      return;
    v && v.forceUpdate();
  }
}, Dt = (t, s, y, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: H(s, g),
        newValue: H(y, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: H(y, g)
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
function Wt(t, {
  stateKey: s,
  serverSync: y,
  localStorage: g,
  formElements: v,
  reactiveDeps: x,
  reactiveType: E,
  componentId: p,
  initialState: i,
  syncUpdate: h,
  dependencies: o,
  serverState: S
} = {}) {
  const [W, j] = et({}), { sessionId: F } = $t();
  let G = !s;
  const [m] = et(s ?? mt()), l = r.getState().stateLog[m], nt = Z(/* @__PURE__ */ new Set()), B = Z(p ?? mt()), _ = Z(
    null
  );
  _.current = X(m) ?? null, ft(() => {
    if (h && h.stateKey === m && h.path?.[0]) {
      J(m, (n) => ({
        ...n,
        [h.path[0]]: h.newValue
      }));
      const e = `${h.stateKey}:${h.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: h.timeStamp,
        userId: h.userId
      });
    }
  }, [h]), ft(() => {
    if (i) {
      It(m, {
        initialState: i
      });
      const e = _.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = r.getState().initialStateGlobal[m];
      if (!(c && !L(c, i) || !c) && !a)
        return;
      let u = null;
      const T = z(e?.localStorage?.key) ? e?.localStorage?.key(i) : e?.localStorage?.key;
      T && F && (u = ct(`${F}-${m}-${T}`));
      let w = i, $ = !1;
      const A = a ? Date.now() : 0, V = u?.lastUpdated || 0, O = u?.lastSyncedWithServer || 0;
      a && A > V ? (w = e.serverState.data, $ = !0) : u && V > O && (w = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), xt(
        m,
        i,
        w,
        Q,
        B.current,
        F
      ), $ && T && F && wt(w, m, e, F, Date.now()), lt(m), (Array.isArray(E) ? E : [E || "component"]).includes("none") || j({});
    }
  }, [
    i,
    S?.status,
    S?.data,
    ...o || []
  ]), ot(() => {
    G && It(m, {
      serverSync: y,
      formElements: v,
      initialState: i,
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
      reactiveType: E ?? ["component", "deps"]
    }), r.getState().stateComponents.set(m, n), j({}), () => {
      const a = `${m}////${B.current}`;
      n && (n.components.delete(a), n.components.size === 0 && r.getState().stateComponents.delete(m));
    };
  }, []);
  const Q = (e, n, a, c) => {
    if (Array.isArray(n)) {
      const f = `${m}-${n.join(".")}`;
      nt.current.add(f);
    }
    J(m, (f) => {
      const u = z(e) ? e(f) : e, T = `${m}-${n.join(".")}`;
      if (T) {
        let M = !1, k = r.getState().signalDomElements.get(T);
        if ((!k || k.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const R = n.slice(0, -1), b = H(u, R);
          if (Array.isArray(b)) {
            M = !0;
            const I = `${m}-${R.join(".")}`;
            k = r.getState().signalDomElements.get(I);
          }
        }
        if (k) {
          const R = M ? H(u, n.slice(0, -1)) : H(u, n);
          k.forEach(({ parentId: b, position: I, effect: C }) => {
            const N = document.querySelector(
              `[data-parent-id="${b}"]`
            );
            if (N) {
              const P = Array.from(N.childNodes);
              if (P[I]) {
                const U = C ? new Function("state", `return (${C})(state)`)(R) : R;
                P[I].textContent = String(U);
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
      ), a.updateType === "insert" && _.current?.validation?.key && Mt(
        _.current?.validation?.key + "." + w.join(".")
      ).filter(([k, R]) => {
        let b = k?.split(".").length;
        if (k == w.join(".") && b == w.length - 1) {
          let I = k + "." + w;
          q(k), jt(I, R);
        }
      });
      const $ = r.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", $), $) {
        const M = St(f, u), k = new Set(M), R = a.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          b,
          I
        ] of $.components.entries()) {
          let C = !1;
          const N = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (console.log("component", I), !N.includes("none")) {
            if (N.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if (N.includes("component") && ((I.paths.has(R) || I.paths.has("")) && (C = !0), !C))
              for (const P of k) {
                let U = P;
                for (; ; ) {
                  if (I.paths.has(U)) {
                    C = !0;
                    break;
                  }
                  const Y = U.lastIndexOf(".");
                  if (Y !== -1) {
                    const K = U.substring(
                      0,
                      Y
                    );
                    if (!isNaN(
                      Number(U.substring(Y + 1))
                    ) && I.paths.has(K)) {
                      C = !0;
                      break;
                    }
                    U = K;
                  } else
                    U = "";
                  if (U === "")
                    break;
                }
                if (C) break;
              }
            if (!C && N.includes("deps") && I.depsFunction) {
              const P = I.depsFunction(u);
              let U = !1;
              typeof P == "boolean" ? P && (U = !0) : L(I.deps, P) || (I.deps = P, U = !0), U && (C = !0);
            }
            C && I.forceUpdate();
          }
        }
      }
      const A = Date.now();
      n = n.map((M, k) => {
        const R = n.slice(0, -1), b = H(u, R);
        return k === n.length - 1 && ["insert", "cut"].includes(a.updateType) ? (b.length - 1).toString() : M;
      });
      const { oldValue: V, newValue: O } = Dt(
        a.updateType,
        f,
        u,
        n
      ), D = {
        timeStamp: A,
        stateKey: m,
        path: n,
        updateType: a.updateType,
        status: "new",
        oldValue: V,
        newValue: O
      };
      if (Rt(m, (M) => {
        const R = [...M ?? [], D].reduce((b, I) => {
          const C = `${I.stateKey}:${JSON.stringify(I.path)}`, N = b.get(C);
          return N ? (N.timeStamp = Math.max(N.timeStamp, I.timeStamp), N.newValue = I.newValue, N.oldValue = N.oldValue ?? I.oldValue, N.updateType = I.updateType) : b.set(C, { ...I }), b;
        }, /* @__PURE__ */ new Map());
        return Array.from(R.values());
      }), wt(
        u,
        m,
        _.current,
        F
      ), _.current?.middleware && _.current.middleware({
        updateLog: l,
        update: D
      }), _.current?.serverSync) {
        const M = r.getState().serverState[m], k = _.current?.serverSync;
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
  r.getState().updaterState[m] || (at(
    m,
    it(
      m,
      Q,
      B.current,
      F
    )
  ), r.getState().cogsStateStore[m] || J(m, t), r.getState().initialStateGlobal[m] || vt(m, t));
  const d = Tt(() => it(
    m,
    Q,
    B.current,
    F
  ), [m, F]);
  return [bt(m), d];
}
function it(t, s, y, g) {
  const v = /* @__PURE__ */ new Map();
  let x = 0;
  const E = (h) => {
    const o = h.join(".");
    for (const [S] of v)
      (S === o || S.startsWith(o + ".")) && v.delete(S);
    x++;
  }, p = {
    removeValidation: (h) => {
      h?.validationKey && q(h.validationKey);
    },
    revertToInitialState: (h) => {
      const o = r.getState().getInitialOptions(t)?.validation;
      o?.key && q(o?.key), h?.validationKey && q(h.validationKey);
      const S = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), v.clear(), x++;
      const W = i(S, []), j = X(t), F = z(j?.localStorage?.key) ? j?.localStorage?.key(S) : j?.localStorage?.key, G = `${g}-${t}-${F}`;
      G && localStorage.removeItem(G), at(t, W), J(t, S);
      const m = r.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (h) => {
      v.clear(), x++;
      const o = it(
        t,
        s,
        y,
        g
      ), S = r.getState().initialStateGlobal[t], W = X(t), j = z(W?.localStorage?.key) ? W?.localStorage?.key(S) : W?.localStorage?.key, F = `${g}-${t}-${j}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), At(() => {
        vt(t, h), at(t, o), J(t, h);
        const G = r.getState().stateComponents.get(t);
        G && G.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (G) => o.get()[G]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const h = r.getState().serverState[t];
      return !!(h && L(h, bt(t)));
    }
  };
  function i(h, o = [], S) {
    const W = o.map(String).join(".");
    v.get(W);
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
        S?.validIndices && !Array.isArray(h) && (S = { ...S, validIndices: void 0 });
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
          const d = `${t}////${y}`, e = r.getState().stateComponents.get(t);
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
          return () => St(
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
                  const T = [a, ...u.path].join(".");
                  r.getState().addValidationError(T, u.message);
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
            const d = r.getState().initialStateGlobal[t], e = X(t), n = z(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${g}-${t}-${n}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = r.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(d.key + "." + o.join("."));
          };
        if (Array.isArray(h)) {
          const d = () => S?.validIndices ? h.map((n, a) => ({
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
                return i(
                  h[e],
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
              const f = Z(null), u = Z(!0), [T, w] = et({
                startIndex: 0,
                endIndex: 10
                // Start with some visible items
              }), $ = r().getNestedState(
                t,
                o
              ), A = $.length, V = A * n, O = Tt(() => {
                const b = $.slice(
                  T.startIndex,
                  T.endIndex
                ), I = {
                  validIndices: Array.from(
                    { length: T.endIndex - T.startIndex },
                    (C, N) => T.startIndex + N
                  )
                };
                return i(
                  b,
                  o,
                  I
                );
              }, [T.startIndex, T.endIndex, A]);
              ot(() => {
                const b = f.current;
                if (!b) return;
                const I = () => {
                  const P = b.scrollTop, U = b.clientHeight, Y = Math.max(
                    0,
                    Math.floor(P / n) - a
                  ), K = Math.min(
                    A,
                    Math.ceil((P + U) / n) + a
                  );
                  w((dt) => dt.startIndex === Y && dt.endIndex === K ? dt : { startIndex: Y, endIndex: K });
                }, C = () => {
                  const P = f.current;
                  P && (u.current = P.scrollHeight > 0 && Math.abs(
                    P.scrollHeight - P.scrollTop - P.clientHeight
                  ) < 1, I());
                };
                I(), b.addEventListener("scroll", C, {
                  passive: !0
                });
                const N = new ResizeObserver(() => {
                  I();
                });
                return N.observe(b), () => {
                  b.removeEventListener("scroll", C), N.disconnect();
                };
              }, [A, n, a]);
              const D = ut(
                (b, I = "auto") => {
                  f.current?.scrollTo({ top: b, behavior: I });
                },
                []
              ), M = ut(
                (b = "smooth") => {
                  const I = f.current;
                  I && I.scrollTo({
                    top: I.scrollHeight,
                    behavior: b
                  });
                },
                []
              ), k = ut(
                (b, I = "smooth") => {
                  D(b * n, I);
                },
                [D, n]
              );
              ot(() => {
                c && u.current && M("auto");
              }, [A, c, M]);
              const R = {
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
                    height: `${V}px`,
                    width: "100%"
                  }
                },
                list: {
                  style: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    transform: `translateY(${T.startIndex * n}px)`
                  }
                }
              };
              return {
                virtualState: O,
                virtualizerProps: R,
                scrollToBottom: M,
                scrollToIndex: k
              };
            };
          if (l === "stateSort")
            return (e) => {
              const a = [...d()].sort(
                (u, T) => e(u.item, T.item)
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
                ({ item: u }, T) => e(u, T)
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
              const n = r.getState().getNestedState(t, o);
              return Array.isArray(n) ? n.map((a, c) => {
                let f;
                S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
                const u = [...o, f.toString()], T = i(a, u, S);
                return e(a, T, {
                  register: () => {
                    const [, $] = et({}), A = `${y}-${o.join(".")}-${f}`;
                    ot(() => {
                      const V = `${t}////${A}`, O = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return O.components.set(V, {
                        forceUpdate: () => $({}),
                        paths: /* @__PURE__ */ new Set([u.join(".")])
                        // ATOMIC: Subscribes only to this item's path.
                      }), r.getState().stateComponents.set(t, O), () => {
                        const D = r.getState().stateComponents.get(t);
                        D && D.components.delete(V);
                      };
                    }, [t, A]);
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
            return (e) => h.map((a, c) => {
              let f;
              S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
              const u = [...o, f.toString()], T = i(a, u, S);
              return e(
                a,
                T,
                c,
                h,
                i(h, o, S)
              );
            });
          if (l === "$stateMap")
            return (e) => st(Gt, {
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
              const n = h;
              v.clear(), x++;
              const a = n.flatMap(
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
              const n = h[e];
              return i(n, [...o, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = r.getState().getNestedState(t, o);
              if (e.length === 0) return;
              const n = e.length - 1, a = e[n], c = [...o, n.toString()];
              return i(a, c);
            };
          if (l === "insert")
            return (e) => (E(o), gt(s, e, o, t), i(
              r.getState().getNestedState(t, o),
              o
            ));
          if (l === "uniqueInsert")
            return (e, n, a) => {
              const c = r.getState().getNestedState(t, o), f = z(e) ? e(c) : e;
              let u = null;
              if (!c.some((w) => {
                if (n) {
                  const A = n.every(
                    (V) => L(w[V], f[V])
                  );
                  return A && (u = w), A;
                }
                const $ = L(w, f);
                return $ && (u = w), $;
              }))
                E(o), gt(s, f, o, t);
              else if (a && u) {
                const w = a(u), $ = c.map(
                  (A) => L(A, u) ? w : A
                );
                E(o), tt(s, $, o);
              }
            };
          if (l === "cut")
            return (e, n) => {
              if (!n?.waitForSync)
                return E(o), rt(s, o, t, e), i(
                  r.getState().getNestedState(t, o),
                  o
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let n = 0; n < h.length; n++)
                h[n] === e && rt(s, o, t, n);
            };
          if (l === "toggleByValue")
            return (e) => {
              const n = h.findIndex((a) => a === e);
              n > -1 ? rt(s, o, t, n) : gt(s, e, o, t);
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
            return (e, n) => {
              const c = d().find(
                ({ item: u }) => u[e] === n
              );
              if (!c) return;
              const f = [...o, c.originalIndex.toString()];
              return i(c.item, f, S);
            };
        }
        const B = o[o.length - 1];
        if (!isNaN(Number(B))) {
          const d = o.slice(0, -1), e = r.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => rt(
              s,
              d,
              t,
              Number(B)
            );
        }
        if (l === "get")
          return () => r.getState().getNestedState(t, o);
        if (l === "$derive")
          return (d) => Et({
            _stateKey: t,
            _path: o,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Et({
            _stateKey: t,
            _path: o
          });
        if (l === "lastSynced") {
          const d = `${t}:${o.join(".")}`;
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => ct(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = o.slice(0, -1), e = d.join("."), n = r.getState().getNestedState(t, d);
          return Array.isArray(n) ? Number(o[o.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = o.slice(0, -1), n = Number(o[o.length - 1]), a = e.join(".");
            d ? r.getState().setSelectedIndex(t, a, n) : r.getState().setSelectedIndex(t, a, void 0);
            const c = r.getState().getNestedState(t, [...e]);
            tt(s, c, e), E(e);
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
            tt(s, c, d), E(d);
          };
        if (o.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = r.getState().cogsStateStore[t], a = Ot(e, d).newDocument;
              xt(
                t,
                r.getState().initialStateGlobal[t],
                a,
                s,
                y,
                g
              );
              const c = r.getState().stateComponents.get(t);
              if (c) {
                const f = St(e, a), u = new Set(f);
                for (const [
                  T,
                  w
                ] of c.components.entries()) {
                  let $ = !1;
                  const A = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!A.includes("none")) {
                    if (A.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (A.includes("component") && (w.paths.has("") && ($ = !0), !$))
                      for (const V of u) {
                        if (w.paths.has(V)) {
                          $ = !0;
                          break;
                        }
                        let O = V.lastIndexOf(".");
                        for (; O !== -1; ) {
                          const D = V.substring(0, O);
                          if (w.paths.has(D)) {
                            $ = !0;
                            break;
                          }
                          const M = V.substring(
                            O + 1
                          );
                          if (!isNaN(Number(M))) {
                            const k = D.lastIndexOf(".");
                            if (k !== -1) {
                              const R = D.substring(
                                0,
                                k
                              );
                              if (w.paths.has(R)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          O = D.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && A.includes("deps") && w.depsFunction) {
                      const V = w.depsFunction(a);
                      let O = !1;
                      typeof V == "boolean" ? V && (O = !0) : L(w.deps, V) || (w.deps = V, O = !0), O && ($ = !0);
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
                  const T = u.path, w = u.message, $ = [d.key, ...T].join(".");
                  e($, w);
                }), lt(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return y;
          if (l === "getComponents")
            return () => r().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => ht.getState().getFormRefsByStateKey(t);
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
          return () => ht.getState().getFormRef(t + "." + o.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ yt(
            Ct,
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
              Nt(() => {
                tt(s, d, o, "");
                const n = r.getState().getNestedState(t, o);
                e?.afterUpdate && e.afterUpdate(n);
              }, e.debounce);
            else {
              tt(s, d, o, "");
              const n = r.getState().getNestedState(t, o);
              e?.afterUpdate && e.afterUpdate(n);
            }
            E(o);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ yt(
            Pt,
            {
              setState: s,
              stateKey: t,
              path: o,
              child: d,
              formOpts: e
            }
          );
        const _ = [...o, l], Q = r.getState().getNestedState(t, _);
        return i(Q, _, S);
      }
    }, G = new Proxy(j, F);
    return v.set(W, {
      proxy: G,
      stateVersion: x
    }), G;
  }
  return i(
    r.getState().getNestedState(t, [])
  );
}
function Et(t) {
  return st(Lt, { proxy: t });
}
function Gt({
  proxy: t,
  rebuildStateShape: s
}) {
  const y = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(y) ? s(
    y,
    t._path
  ).stateMapNoRender(
    (v, x, E, p, i) => t._mapFn(v, x, E, p, i)
  ) : null;
}
function Lt({
  proxy: t
}) {
  const s = Z(null), y = `${t._stateKey}-${t._path.join(".")}`;
  return ft(() => {
    const g = s.current;
    if (!g || !g.parentElement) return;
    const v = g.parentElement, E = Array.from(v.childNodes).indexOf(g);
    let p = v.getAttribute("data-parent-id");
    p || (p = `parent-${crypto.randomUUID()}`, v.setAttribute("data-parent-id", p));
    const h = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: p,
      position: E,
      effect: t._effect
    };
    r.getState().addSignalElement(y, h);
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
    const W = document.createTextNode(String(S));
    g.replaceWith(W);
  }, [t._stateKey, t._path.join("."), t._effect]), st("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": y
  });
}
function re(t) {
  const s = kt(
    (y) => {
      const g = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: y,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return st("text", {}, String(s));
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
