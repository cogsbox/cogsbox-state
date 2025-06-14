"use client";
import { jsx as ht } from "react/jsx-runtime";
import { useState as at, useRef as Y, useEffect as st, useLayoutEffect as nt, useMemo as Tt, createElement as ct, useSyncExternalStore as xt, startTransition as At, useCallback as gt } from "react";
import { transformStateFunc as Nt, isDeepEqual as L, isFunction as z, getNestedValue as H, getDifferences as St, debounce as Ct } from "./utility.js";
import { pushFunc as ft, updateFn as et, cutFunc as it, ValidationWrapper as Pt, FormControlComponent as _t } from "./Functions.jsx";
import Ot from "superjson";
import { v4 as mt } from "uuid";
import "zod";
import { getGlobalStore as n, formRefStore as It } from "./store.js";
import { useCogsConfig as bt } from "./CogsStateClient.jsx";
import { applyPatch as Mt } from "fast-json-patch";
function pt(t, i) {
  const y = n.getState().getInitialOptions, g = n.getState().setInitialStateOptions, h = y(t) || {};
  g(t, {
    ...h,
    ...i
  });
}
function wt({
  stateKey: t,
  options: i,
  initialOptionsPart: y
}) {
  const g = Z(t) || {}, h = y[t] || {}, V = n.getState().setInitialStateOptions, $ = { ...h, ...g };
  let p = !1;
  if (i)
    for (const s in i)
      $.hasOwnProperty(s) ? (s == "localStorage" && i[s] && $[s].key !== i[s]?.key && (p = !0, $[s] = i[s]), s == "initialState" && i[s] && $[s] !== i[s] && // Different references
      !L($[s], i[s]) && (p = !0, $[s] = i[s])) : (p = !0, $[s] = i[s]);
  p && V(t, $);
}
function ee(t, { formElements: i, validation: y }) {
  return { initialState: t, formElements: i, validation: y };
}
const ne = (t, i) => {
  let y = t;
  const [g, h] = Nt(y);
  (Object.keys(h).length > 0 || i && Object.keys(i).length > 0) && Object.keys(h).forEach((p) => {
    h[p] = h[p] || {}, h[p].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...h[p].formElements || {}
      // State-specific overrides
    }, Z(p) || n.getState().setInitialStateOptions(p, h[p]);
  }), n.getState().setInitialStates(g), n.getState().setCreatedState(g);
  const V = (p, s) => {
    const [I] = at(s?.componentId ?? mt());
    wt({
      stateKey: p,
      options: s,
      initialOptionsPart: h
    });
    const a = n.getState().cogsStateStore[p] || g[p], S = s?.modifyState ? s.modifyState(a) : a, [D, M] = Gt(
      S,
      {
        stateKey: p,
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
    return M;
  };
  function $(p, s) {
    wt({ stateKey: p, options: s, initialOptionsPart: h }), s.localStorage && Dt(p, s), dt(p);
  }
  return { useCogsState: V, setCogsOptions: $ };
}, {
  setUpdaterState: rt,
  setState: J,
  getInitialOptions: Z,
  getKeyState: kt,
  getValidationErrors: jt,
  setStateLog: Rt,
  updateInitialStateGlobal: vt,
  addValidationError: Ft,
  removeValidationError: q,
  setServerSyncActions: Ut
} = n.getState(), Et = (t, i, y, g, h) => {
  y?.log && console.log(
    "saving to localstorage",
    i,
    y.localStorage?.key,
    g
  );
  const V = z(y?.localStorage?.key) ? y.localStorage?.key(t) : y?.localStorage?.key;
  if (V && g) {
    const $ = `${g}-${i}-${V}`;
    let p;
    try {
      p = lt($)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: h ?? p
    }, I = Ot.serialize(s);
    window.localStorage.setItem(
      $,
      JSON.stringify(I.json)
    );
  }
}, lt = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Dt = (t, i) => {
  const y = n.getState().cogsStateStore[t], { sessionId: g } = bt(), h = z(i?.localStorage?.key) ? i.localStorage.key(y) : i?.localStorage?.key;
  if (h && g) {
    const V = lt(
      `${g}-${t}-${h}`
    );
    if (V && V.lastUpdated > (V.lastSyncedWithServer || 0))
      return J(t, V.state), dt(t), !0;
  }
  return !1;
}, Vt = (t, i, y, g, h, V) => {
  const $ = {
    initialState: i,
    updaterState: X(
      t,
      g,
      h,
      V
    ),
    state: y
  };
  vt(t, $.initialState), rt(t, $.updaterState), J(t, $.state);
}, dt = (t) => {
  const i = n.getState().stateComponents.get(t);
  if (!i) return;
  const y = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || y.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    y.forEach((g) => g());
  });
}, re = (t, i) => {
  const y = n.getState().stateComponents.get(t);
  if (y) {
    const g = `${t}////${i}`, h = y.components.get(g);
    if ((h ? Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"] : null)?.includes("none"))
      return;
    h && h.forceUpdate();
  }
}, Wt = (t, i, y, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: H(i, g),
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
        oldValue: H(i, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Gt(t, {
  stateKey: i,
  serverSync: y,
  localStorage: g,
  formElements: h,
  reactiveDeps: V,
  reactiveType: $,
  componentId: p,
  initialState: s,
  syncUpdate: I,
  dependencies: a,
  serverState: S
} = {}) {
  const [D, M] = at({}), { sessionId: j } = bt();
  let W = !i;
  const [m] = at(i ?? mt()), l = n.getState().stateLog[m], ot = Y(/* @__PURE__ */ new Set()), B = Y(p ?? mt()), P = Y(
    null
  );
  P.current = Z(m) ?? null, st(() => {
    if (I && I.stateKey === m && I.path?.[0]) {
      J(m, (r) => ({
        ...r,
        [I.path[0]]: I.newValue
      }));
      const e = `${I.stateKey}:${I.path.join(".")}`;
      n.getState().setSyncInfo(e, {
        timeStamp: I.timeStamp,
        userId: I.userId
      });
    }
  }, [I]), st(() => {
    if (s) {
      pt(m, {
        initialState: s
      });
      const e = P.current, o = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = n.getState().initialStateGlobal[m];
      if (!(c && !L(c, s) || !c) && !o)
        return;
      let u = null;
      const k = z(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      k && j && (u = lt(`${j}-${m}-${k}`));
      let E = s, w = !1;
      const N = o ? Date.now() : 0, x = u?.lastUpdated || 0, _ = u?.lastSyncedWithServer || 0;
      o && N > x ? (E = e.serverState.data, w = !0) : u && x > _ && (E = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(E)), Vt(
        m,
        s,
        E,
        Q,
        B.current,
        j
      ), w && k && j && Et(E, m, e, j, Date.now()), dt(m), (Array.isArray($) ? $ : [$ || "component"]).includes("none") || M({});
    }
  }, [
    s,
    S?.status,
    S?.data,
    ...a || []
  ]), nt(() => {
    W && pt(m, {
      serverSync: y,
      formElements: h,
      initialState: s,
      localStorage: g,
      middleware: P.current?.middleware
    });
    const e = `${m}////${B.current}`, r = n.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => M({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: V || void 0,
      reactiveType: $ ?? ["component", "deps"]
    }), n.getState().stateComponents.set(m, r), M({}), () => {
      const o = `${m}////${B.current}`;
      r && (r.components.delete(o), r.components.size === 0 && n.getState().stateComponents.delete(m));
    };
  }, []);
  const Q = (e, r, o, c) => {
    if (Array.isArray(r)) {
      const f = `${m}-${r.join(".")}`;
      ot.current.add(f);
    }
    J(m, (f) => {
      const u = z(e) ? e(f) : e, k = `${m}-${r.join(".")}`;
      if (k) {
        let R = !1, b = n.getState().signalDomElements.get(k);
        if ((!b || b.size === 0) && (o.updateType === "insert" || o.updateType === "cut")) {
          const O = r.slice(0, -1), F = H(u, O);
          if (Array.isArray(F)) {
            R = !0;
            const v = `${m}-${O.join(".")}`;
            b = n.getState().signalDomElements.get(v);
          }
        }
        if (b) {
          const O = R ? H(u, r.slice(0, -1)) : H(u, r);
          b.forEach(({ parentId: F, position: v, effect: T }) => {
            const C = document.querySelector(
              `[data-parent-id="${F}"]`
            );
            if (C) {
              const G = Array.from(C.childNodes);
              if (G[v]) {
                const A = T ? new Function("state", `return (${T})(state)`)(O) : O;
                G[v].textContent = String(A);
              }
            }
          });
        }
      }
      o.updateType === "update" && (c || P.current?.validation?.key) && r && q(
        (c || P.current?.validation?.key) + "." + r.join(".")
      );
      const E = r.slice(0, r.length - 1);
      o.updateType === "cut" && P.current?.validation?.key && q(
        P.current?.validation?.key + "." + E.join(".")
      ), o.updateType === "insert" && P.current?.validation?.key && jt(
        P.current?.validation?.key + "." + E.join(".")
      ).filter(([b, O]) => {
        let F = b?.split(".").length;
        if (b == E.join(".") && F == E.length - 1) {
          let v = b + "." + E;
          q(b), Ft(v, O);
        }
      });
      const w = n.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", w), w) {
        const R = St(f, u), b = new Set(R), O = o.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          F,
          v
        ] of w.components.entries()) {
          let T = !1;
          const C = Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"];
          if (console.log("component", v), !C.includes("none")) {
            if (C.includes("all")) {
              v.forceUpdate();
              continue;
            }
            if (C.includes("component") && ((v.paths.has(O) || v.paths.has("")) && (T = !0), !T))
              for (const G of b) {
                let A = G;
                for (; ; ) {
                  if (v.paths.has(A)) {
                    T = !0;
                    break;
                  }
                  const K = A.lastIndexOf(".");
                  if (K !== -1) {
                    const tt = A.substring(
                      0,
                      K
                    );
                    if (!isNaN(
                      Number(A.substring(K + 1))
                    ) && v.paths.has(tt)) {
                      T = !0;
                      break;
                    }
                    A = tt;
                  } else
                    A = "";
                  if (A === "")
                    break;
                }
                if (T) break;
              }
            if (!T && C.includes("deps") && v.depsFunction) {
              const G = v.depsFunction(u);
              let A = !1;
              typeof G == "boolean" ? G && (A = !0) : L(v.deps, G) || (v.deps = G, A = !0), A && (T = !0);
            }
            T && v.forceUpdate();
          }
        }
      }
      const N = Date.now();
      r = r.map((R, b) => {
        const O = r.slice(0, -1), F = H(u, O);
        return b === r.length - 1 && ["insert", "cut"].includes(o.updateType) ? (F.length - 1).toString() : R;
      });
      const { oldValue: x, newValue: _ } = Wt(
        o.updateType,
        f,
        u,
        r
      ), U = {
        timeStamp: N,
        stateKey: m,
        path: r,
        updateType: o.updateType,
        status: "new",
        oldValue: x,
        newValue: _
      };
      if (Rt(m, (R) => {
        const O = [...R ?? [], U].reduce((F, v) => {
          const T = `${v.stateKey}:${JSON.stringify(v.path)}`, C = F.get(T);
          return C ? (C.timeStamp = Math.max(C.timeStamp, v.timeStamp), C.newValue = v.newValue, C.oldValue = C.oldValue ?? v.oldValue, C.updateType = v.updateType) : F.set(T, { ...v }), F;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), Et(
        u,
        m,
        P.current,
        j
      ), P.current?.middleware && P.current.middleware({
        updateLog: l,
        update: U
      }), P.current?.serverSync) {
        const R = n.getState().serverState[m], b = P.current?.serverSync;
        Ut(m, {
          syncKey: typeof b.syncKey == "string" ? b.syncKey : b.syncKey({ state: u }),
          rollBackState: R,
          actionTimeStamp: Date.now() + (b.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return u;
    });
  };
  n.getState().updaterState[m] || (rt(
    m,
    X(
      m,
      Q,
      B.current,
      j
    )
  ), n.getState().cogsStateStore[m] || J(m, t), n.getState().initialStateGlobal[m] || vt(m, t));
  const d = Tt(() => X(
    m,
    Q,
    B.current,
    j
  ), [m, j]);
  return [kt(m), d];
}
function X(t, i, y, g) {
  const h = /* @__PURE__ */ new Map();
  let V = 0;
  const $ = (I) => {
    const a = I.join(".");
    for (const [S] of h)
      (S === a || S.startsWith(a + ".")) && h.delete(S);
    V++;
  }, p = {
    removeValidation: (I) => {
      I?.validationKey && q(I.validationKey);
    },
    revertToInitialState: (I) => {
      const a = n.getState().getInitialOptions(t)?.validation;
      a?.key && q(a?.key), I?.validationKey && q(I.validationKey);
      const S = n.getState().initialStateGlobal[t];
      n.getState().clearSelectedIndexesForState(t), h.clear(), V++;
      const D = s(S, []), M = Z(t), j = z(M?.localStorage?.key) ? M?.localStorage?.key(S) : M?.localStorage?.key, W = `${g}-${t}-${j}`;
      W && localStorage.removeItem(W), rt(t, D), J(t, S);
      const m = n.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (I) => {
      h.clear(), V++;
      const a = X(
        t,
        i,
        y,
        g
      ), S = n.getState().initialStateGlobal[t], D = Z(t), M = z(D?.localStorage?.key) ? D?.localStorage?.key(S) : D?.localStorage?.key, j = `${g}-${t}-${M}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), At(() => {
        vt(t, I), rt(t, a), J(t, I);
        const W = n.getState().stateComponents.get(t);
        W && W.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (W) => a.get()[W]
      };
    },
    _initialState: n.getState().initialStateGlobal[t],
    _serverState: n.getState().serverState[t],
    _isLoading: n.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const I = n.getState().serverState[t];
      return !!(I && L(I, kt(t)));
    }
  };
  function s(I, a = [], S) {
    const D = a.map(String).join(".");
    h.get(D);
    const M = function() {
      return n().getNestedState(t, a);
    };
    Object.keys(p).forEach((m) => {
      M[m] = p[m];
    });
    const j = {
      apply(m, l, ot) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${a.join(".")}`
        ), console.trace("Apply trap stack trace"), n().getNestedState(t, a);
      },
      get(m, l) {
        S?.validIndices && !Array.isArray(I) && (S = { ...S, validIndices: void 0 });
        const ot = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !ot.has(l)) {
          const d = `${t}////${y}`, e = n.getState().stateComponents.get(t);
          if (e) {
            const r = e.components.get(d);
            if (r && !r.paths.has("")) {
              const o = a.join(".");
              let c = !0;
              for (const f of r.paths)
                if (o.startsWith(f) && (o === f || o[f.length] === ".")) {
                  c = !1;
                  break;
                }
              c && r.paths.add(o);
            }
          }
        }
        if (l === "getDifferences")
          return () => St(
            n.getState().cogsStateStore[t],
            n.getState().initialStateGlobal[t]
          );
        if (l === "sync" && a.length === 0)
          return async function() {
            const d = n.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const r = n.getState().getNestedState(t, []), o = d?.validation?.key;
            try {
              const c = await e.action(r);
              if (c && !c.success && c.errors && o) {
                n.getState().removeValidationError(o), c.errors.forEach((u) => {
                  const k = [o, ...u.path].join(".");
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
          const d = n.getState().getNestedState(t, a), e = n.getState().initialStateGlobal[t], r = H(e, a);
          return L(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = n().getNestedState(
              t,
              a
            ), e = n.getState().initialStateGlobal[t], r = H(e, a);
            return L(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = n.getState().initialStateGlobal[t], e = Z(t), r = z(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, o = `${g}-${t}-${r}`;
            o && localStorage.removeItem(o);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = n.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return n.getState().getValidationErrors(d.key + "." + a.join("."));
          };
        if (Array.isArray(I)) {
          const d = () => S?.validIndices ? I.map((r, o) => ({
            item: r,
            originalIndex: S.validIndices[o]
          })) : n.getState().getNestedState(t, a).map((r, o) => ({
            item: r,
            originalIndex: o
          }));
          if (l === "getSelected")
            return () => {
              const e = n.getState().getSelectedIndex(t, a.join("."));
              if (e !== void 0)
                return s(
                  I[e],
                  [...a, e.toString()],
                  S
                );
            };
          if (l === "clearSelected")
            return () => {
              n.getState().clearSelectedIndex({ stateKey: t, path: a });
            };
          if (l === "getSelectedIndex")
            return () => n.getState().getSelectedIndex(t, a.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (e) => {
              const {
                itemHeight: r,
                overscan: o = 5,
                stickToBottom: c = !1
              } = e;
              if (typeof r != "number" || r <= 0)
                throw new Error(
                  "[cogs-state] `useVirtualView` requires a positive number for `itemHeight` option."
                );
              const f = Y(null), u = Y(!0), [k, E] = at({
                startIndex: 0,
                endIndex: 10
              }), w = `${t}-virtual-${a.join(".")}`, N = n().getNestedState(
                t,
                a
              ), x = N.length, _ = x * r;
              nt(() => {
                const v = N.slice(
                  k.startIndex,
                  k.endIndex
                );
                J(w, v), n.getState().updaterState[w] || rt(
                  w,
                  X(
                    w,
                    i,
                    y,
                    g
                  )
                );
              }, [
                k.startIndex,
                k.endIndex,
                N.length,
                w
              ]);
              const U = Tt(() => n.getState().updaterState[w] || X(
                w,
                i,
                y,
                g
              ), [w]);
              st(() => () => {
                const { cogsStateStore: v, updaterState: T, stateComponents: C } = n.getState();
                delete v[w], delete T[w], C.delete(w);
              }, [w]), nt(() => {
                const v = f.current;
                if (!v) return;
                const T = () => {
                  const A = v.scrollTop, K = v.clientHeight, tt = Math.max(
                    0,
                    Math.floor(A / r) - o
                  ), yt = Math.min(
                    x,
                    Math.ceil((A + K) / r) + o
                  );
                  E((ut) => ut.startIndex === tt && ut.endIndex === yt ? ut : { startIndex: tt, endIndex: yt });
                }, C = () => {
                  const A = f.current;
                  A && (u.current = A.scrollHeight > 0 && Math.abs(
                    A.scrollHeight - A.scrollTop - A.clientHeight
                  ) < 1, T());
                };
                T(), v.addEventListener("scroll", C, {
                  passive: !0
                });
                const G = new ResizeObserver(() => {
                  T();
                });
                return G.observe(v), () => {
                  v.removeEventListener("scroll", C), G.disconnect();
                };
              }, [x, r, o]);
              const R = gt(
                (v, T = "auto") => {
                  f.current?.scrollTo({ top: v, behavior: T });
                },
                []
              ), b = gt(
                (v = "smooth") => {
                  const T = f.current;
                  T && T.scrollTo({
                    top: T.scrollHeight,
                    behavior: v
                  });
                },
                []
              ), O = gt(
                (v, T = "smooth") => {
                  R(v * r, T);
                },
                [R, r]
              );
              nt(() => {
                c && u.current && b("auto");
              }, [x, c, b]);
              const F = {
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
                    height: `${_}px`,
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
                virtualizerProps: F,
                scrollToBottom: b,
                scrollToIndex: O
              };
            };
          if (l === "stateSort")
            return (e) => {
              const o = [...d()].sort(
                (u, k) => e(u.item, k.item)
              ), c = o.map(({ item: u }) => u), f = {
                ...S,
                validIndices: o.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, a, f);
            };
          if (l === "stateFilter")
            return (e) => {
              const o = d().filter(
                ({ item: u }, k) => e(u, k)
              ), c = o.map(({ item: u }) => u), f = {
                ...S,
                validIndices: o.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, a, f);
            };
          if (l === "stateMap")
            return (e) => {
              const r = n.getState().getNestedState(t, a);
              return Array.isArray(r) ? r.map((o, c) => {
                let f;
                S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
                const u = [...a, f.toString()], k = s(o, u, S);
                return e(o, k, {
                  register: () => {
                    const [, w] = at({}), N = `${y}-${a.join(".")}-${f}`;
                    nt(() => {
                      const x = `${t}////${N}`, _ = n.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return _.components.set(x, {
                        forceUpdate: () => w({}),
                        paths: /* @__PURE__ */ new Set([u.join(".")])
                        // ATOMIC: Subscribes only to this item's path.
                      }), n.getState().stateComponents.set(t, _), () => {
                        const U = n.getState().stateComponents.get(t);
                        U && U.components.delete(x);
                      };
                    }, [t, N]);
                  },
                  index: c,
                  originalIndex: f
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${a.join(".")}. The current value is:`,
                r
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => I.map((o, c) => {
              let f;
              S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
              const u = [...a, f.toString()], k = s(o, u, S);
              return e(
                o,
                k,
                c,
                I,
                s(I, a, S)
              );
            });
          if (l === "$stateMap")
            return (e) => ct(Lt, {
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
              const r = I;
              h.clear(), V++;
              const o = r.flatMap(
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
              const r = I[e];
              return s(r, [...a, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = n.getState().getNestedState(t, a);
              if (e.length === 0) return;
              const r = e.length - 1, o = e[r], c = [...a, r.toString()];
              return s(o, c);
            };
          if (l === "insert")
            return (e) => ($(a), ft(i, e, a, t), s(
              n.getState().getNestedState(t, a),
              a
            ));
          if (l === "uniqueInsert")
            return (e, r, o) => {
              const c = n.getState().getNestedState(t, a), f = z(e) ? e(c) : e;
              let u = null;
              if (!c.some((E) => {
                if (r) {
                  const N = r.every(
                    (x) => L(E[x], f[x])
                  );
                  return N && (u = E), N;
                }
                const w = L(E, f);
                return w && (u = E), w;
              }))
                $(a), ft(i, f, a, t);
              else if (o && u) {
                const E = o(u), w = c.map(
                  (N) => L(N, u) ? E : N
                );
                $(a), et(i, w, a);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return $(a), it(i, a, t, e), s(
                  n.getState().getNestedState(t, a),
                  a
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < I.length; r++)
                I[r] === e && it(i, a, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = I.findIndex((o) => o === e);
              r > -1 ? it(i, a, t, r) : ft(i, e, a, t);
            };
          if (l === "stateFind")
            return (e) => {
              const o = d().find(
                ({ item: f }, u) => e(f, u)
              );
              if (!o) return;
              const c = [...a, o.originalIndex.toString()];
              return s(o.item, c, S);
            };
          if (l === "findWith")
            return (e, r) => {
              const c = d().find(
                ({ item: u }) => u[e] === r
              );
              if (!c) return;
              const f = [...a, c.originalIndex.toString()];
              return s(c.item, f, S);
            };
        }
        const B = a[a.length - 1];
        if (!isNaN(Number(B))) {
          const d = a.slice(0, -1), e = n.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => it(
              i,
              d,
              t,
              Number(B)
            );
        }
        if (l === "get")
          return () => n.getState().getNestedState(t, a);
        if (l === "$derive")
          return (d) => $t({
            _stateKey: t,
            _path: a,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => $t({
            _stateKey: t,
            _path: a
          });
        if (l === "lastSynced") {
          const d = `${t}:${a.join(".")}`;
          return n.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => lt(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = a.slice(0, -1), e = d.join("."), r = n.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(a[a.length - 1]) === n.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = a.slice(0, -1), r = Number(a[a.length - 1]), o = e.join(".");
            d ? n.getState().setSelectedIndex(t, o, r) : n.getState().setSelectedIndex(t, o, void 0);
            const c = n.getState().getNestedState(t, [...e]);
            et(i, c, e), $(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = a.slice(0, -1), e = Number(a[a.length - 1]), r = d.join("."), o = n.getState().getSelectedIndex(t, r);
            n.getState().setSelectedIndex(
              t,
              r,
              o === e ? void 0 : e
            );
            const c = n.getState().getNestedState(t, [...d]);
            et(i, c, d), $(d);
          };
        if (a.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = n.getState().cogsStateStore[t], o = Mt(e, d).newDocument;
              Vt(
                t,
                n.getState().initialStateGlobal[t],
                o,
                i,
                y,
                g
              );
              const c = n.getState().stateComponents.get(t);
              if (c) {
                const f = St(e, o), u = new Set(f);
                for (const [
                  k,
                  E
                ] of c.components.entries()) {
                  let w = !1;
                  const N = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
                  if (!N.includes("none")) {
                    if (N.includes("all")) {
                      E.forceUpdate();
                      continue;
                    }
                    if (N.includes("component") && (E.paths.has("") && (w = !0), !w))
                      for (const x of u) {
                        if (E.paths.has(x)) {
                          w = !0;
                          break;
                        }
                        let _ = x.lastIndexOf(".");
                        for (; _ !== -1; ) {
                          const U = x.substring(0, _);
                          if (E.paths.has(U)) {
                            w = !0;
                            break;
                          }
                          const R = x.substring(
                            _ + 1
                          );
                          if (!isNaN(Number(R))) {
                            const b = U.lastIndexOf(".");
                            if (b !== -1) {
                              const O = U.substring(
                                0,
                                b
                              );
                              if (E.paths.has(O)) {
                                w = !0;
                                break;
                              }
                            }
                          }
                          _ = U.lastIndexOf(".");
                        }
                        if (w) break;
                      }
                    if (!w && N.includes("deps") && E.depsFunction) {
                      const x = E.depsFunction(o);
                      let _ = !1;
                      typeof x == "boolean" ? x && (_ = !0) : L(E.deps, x) || (E.deps = x, _ = !0), _ && (w = !0);
                    }
                    w && E.forceUpdate();
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
              q(d.key);
              const r = n.getState().cogsStateStore[t];
              try {
                const o = n.getState().getValidationErrors(d.key);
                o && o.length > 0 && o.forEach(([f]) => {
                  f && f.startsWith(d.key) && q(f);
                });
                const c = d.zodSchema.safeParse(r);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const k = u.path, E = u.message, w = [d.key, ...k].join(".");
                  e(w, E);
                }), dt(t), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (l === "_componentId") return y;
          if (l === "getComponents")
            return () => n().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => It.getState().getFormRefsByStateKey(t);
          if (l === "_initialState")
            return n.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return n.getState().serverState[t];
          if (l === "_isLoading")
            return n.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return p.revertToInitialState;
          if (l === "updateInitialState") return p.updateInitialState;
          if (l === "removeValidation") return p.removeValidation;
        }
        if (l === "getFormRef")
          return () => It.getState().getFormRef(t + "." + a.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ ht(
            Pt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: a,
              validationKey: n.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: S?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return a;
        if (l === "_isServerSynced") return p._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Ct(() => {
                et(i, d, a, "");
                const r = n.getState().getNestedState(t, a);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              et(i, d, a, "");
              const r = n.getState().getNestedState(t, a);
              e?.afterUpdate && e.afterUpdate(r);
            }
            $(a);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ ht(
            _t,
            {
              setState: i,
              stateKey: t,
              path: a,
              child: d,
              formOpts: e
            }
          );
        const P = [...a, l], Q = n.getState().getNestedState(t, P);
        return s(Q, P, S);
      }
    }, W = new Proxy(M, j);
    return h.set(D, {
      proxy: W,
      stateVersion: V
    }), W;
  }
  return s(
    n.getState().getNestedState(t, [])
  );
}
function $t(t) {
  return ct(Ht, { proxy: t });
}
function Lt({
  proxy: t,
  rebuildStateShape: i
}) {
  const y = n().getNestedState(t._stateKey, t._path);
  return Array.isArray(y) ? i(
    y,
    t._path
  ).stateMapNoRender(
    (h, V, $, p, s) => t._mapFn(h, V, $, p, s)
  ) : null;
}
function Ht({
  proxy: t
}) {
  const i = Y(null), y = `${t._stateKey}-${t._path.join(".")}`;
  return st(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const h = g.parentElement, $ = Array.from(h.childNodes).indexOf(g);
    let p = h.getAttribute("data-parent-id");
    p || (p = `parent-${crypto.randomUUID()}`, h.setAttribute("data-parent-id", p));
    const I = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: p,
      position: $,
      effect: t._effect
    };
    n.getState().addSignalElement(y, I);
    const a = n.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(a);
      } catch (M) {
        console.error("Error evaluating effect function during mount:", M), S = a;
      }
    else
      S = a;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const D = document.createTextNode(String(S));
    g.replaceWith(D);
  }, [t._stateKey, t._path.join("."), t._effect]), ct("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": y
  });
}
function ae(t) {
  const i = xt(
    (y) => {
      const g = n.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: y,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => n.getState().getNestedState(t._stateKey, t._path)
  );
  return ct("text", {}, String(i));
}
export {
  $t as $cogsSignal,
  ae as $cogsSignalStore,
  ee as addStateOptions,
  ne as createCogsState,
  re as notifyComponent,
  Gt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
