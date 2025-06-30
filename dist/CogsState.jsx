"use client";
import { jsx as At } from "react/jsx-runtime";
import { useState as ct, useRef as z, useEffect as nt, useLayoutEffect as Pt, useMemo as Et, createElement as ut, useSyncExternalStore as Ut, startTransition as Dt, useCallback as St } from "react";
import { transformStateFunc as Lt, isDeepEqual as Z, isFunction as X, getNestedValue as U, getDifferences as Mt, debounce as Gt } from "./utility.js";
import { pushFunc as $t, updateFn as dt, cutFunc as ft, ValidationWrapper as Wt, FormControlComponent as zt } from "./Functions.jsx";
import Bt from "superjson";
import { v4 as kt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Vt } from "./store.js";
import { useCogsConfig as Ot } from "./CogsStateClient.jsx";
import { applyPatch as Ht } from "fast-json-patch";
import qt from "react-use-measure";
import "ulid";
function Nt(t, s) {
  const S = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, I = S(t) || {};
  g(t, {
    ...I,
    ...s
  });
}
function Ct({
  stateKey: t,
  options: s,
  initialOptionsPart: S
}) {
  const g = it(t) || {}, I = S[t] || {}, k = o.getState().setInitialStateOptions, w = { ...I, ...g };
  let y = !1;
  if (s)
    for (const i in s)
      w.hasOwnProperty(i) ? (i == "localStorage" && s[i] && w[i].key !== s[i]?.key && (y = !0, w[i] = s[i]), i == "initialState" && s[i] && w[i] !== s[i] && // Different references
      !Z(w[i], s[i]) && (y = !0, w[i] = s[i])) : (y = !0, w[i] = s[i]);
  y && k(t, w);
}
function me(t, { formElements: s, validation: S }) {
  return { initialState: t, formElements: s, validation: S };
}
const Ie = (t, s) => {
  let S = t;
  const [g, I] = Lt(S);
  (Object.keys(I).length > 0 || s && Object.keys(s).length > 0) && Object.keys(I).forEach((y) => {
    I[y] = I[y] || {}, I[y].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...I[y].formElements || {}
      // State-specific overrides
    }, it(y) || o.getState().setInitialStateOptions(y, I[y]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const k = (y, i) => {
    const [$] = ct(i?.componentId ?? kt());
    Ct({
      stateKey: y,
      options: i,
      initialOptionsPart: I
    });
    const v = o.getState().cogsStateStore[y] || g[y], r = i?.modifyState ? i.modifyState(v) : v, [h, M] = Kt(
      r,
      {
        stateKey: y,
        syncUpdate: i?.syncUpdate,
        componentId: $,
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
  function w(y, i) {
    Ct({ stateKey: y, options: i, initialOptionsPart: I }), i.localStorage && Qt(y, i), et(y);
  }
  return { useCogsState: k, setCogsOptions: w };
}, {
  setUpdaterState: mt,
  setState: rt,
  getInitialOptions: it,
  getKeyState: Rt,
  getValidationErrors: Jt,
  setStateLog: Zt,
  updateInitialStateGlobal: Tt,
  addValidationError: xt,
  removeValidationError: Q,
  setServerSyncActions: Yt
} = o.getState(), pt = (t, s, S, g, I) => {
  S?.log && console.log(
    "saving to localstorage",
    s,
    S.localStorage?.key,
    g
  );
  const k = X(S?.localStorage?.key) ? S.localStorage?.key(t) : S?.localStorage?.key;
  if (k && g) {
    const w = `${g}-${s}-${k}`;
    let y;
    try {
      y = vt(w)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: I ?? y
    }, $ = Bt.serialize(i);
    window.localStorage.setItem(
      w,
      JSON.stringify($.json)
    );
  }
}, vt = (t) => {
  if (!t) return null;
  try {
    const s = window.localStorage.getItem(t);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, Qt = (t, s) => {
  const S = o.getState().cogsStateStore[t], { sessionId: g } = Ot(), I = X(s?.localStorage?.key) ? s.localStorage.key(S) : s?.localStorage?.key;
  if (I && g) {
    const k = vt(
      `${g}-${t}-${I}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return rt(t, k.state), et(t), !0;
  }
  return !1;
}, jt = (t, s, S, g, I, k) => {
  const w = {
    initialState: s,
    updaterState: It(
      t,
      g,
      I,
      k
    ),
    state: S
  };
  Tt(t, w.initialState), mt(t, w.updaterState), rt(t, w.state);
}, et = (t) => {
  const s = o.getState().stateComponents.get(t);
  if (!s) return;
  const S = /* @__PURE__ */ new Set();
  s.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || S.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((g) => g());
  });
}, ve = (t, s) => {
  const S = o.getState().stateComponents.get(t);
  if (S) {
    const g = `${t}////${s}`, I = S.components.get(g);
    if ((I ? Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"] : null)?.includes("none"))
      return;
    I && I.forceUpdate();
  }
}, Xt = (t, s, S, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: U(s, g),
        newValue: U(S, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: U(S, g)
      };
    case "cut":
      return {
        oldValue: U(s, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Kt(t, {
  stateKey: s,
  serverSync: S,
  localStorage: g,
  formElements: I,
  reactiveDeps: k,
  reactiveType: w,
  componentId: y,
  initialState: i,
  syncUpdate: $,
  dependencies: v,
  serverState: r
} = {}) {
  const [h, M] = ct({}), { sessionId: _ } = Ot();
  let Y = !s;
  const [f] = ct(s ?? kt()), G = o.getState().stateLog[f], c = z(/* @__PURE__ */ new Set()), K = z(y ?? kt()), P = z(
    null
  );
  P.current = it(f) ?? null, nt(() => {
    if ($ && $.stateKey === f && $.path?.[0]) {
      rt(f, (e) => ({
        ...e,
        [$.path[0]]: $.newValue
      }));
      const n = `${$.stateKey}:${$.path.join(".")}`;
      o.getState().setSyncInfo(n, {
        timeStamp: $.timeStamp,
        userId: $.userId
      });
    }
  }, [$]), nt(() => {
    if (i) {
      Nt(f, {
        initialState: i
      });
      const n = P.current, a = n?.serverState?.id !== void 0 && n?.serverState?.status === "success" && n?.serverState?.data, d = o.getState().initialStateGlobal[f];
      if (!(d && !Z(d, i) || !d) && !a)
        return;
      let l = null;
      const m = X(n?.localStorage?.key) ? n?.localStorage?.key(i) : n?.localStorage?.key;
      m && _ && (l = vt(`${_}-${f}-${m}`));
      let x = i, b = !1;
      const R = a ? Date.now() : 0, B = l?.lastUpdated || 0, D = l?.lastSyncedWithServer || 0;
      a && R > B ? (x = n.serverState.data, b = !0) : l && B > D && (x = l.state, n?.localStorage?.onChange && n?.localStorage?.onChange(x)), o.getState().initializeShadowState(f, i), jt(
        f,
        i,
        x,
        ot,
        K.current,
        _
      ), b && m && _ && pt(x, f, n, _, Date.now()), et(f), (Array.isArray(w) ? w : [w || "component"]).includes("none") || M({});
    }
  }, [
    i,
    r?.status,
    r?.data,
    ...v || []
  ]), Pt(() => {
    Y && Nt(f, {
      serverSync: S,
      formElements: I,
      initialState: i,
      localStorage: g,
      middleware: P.current?.middleware
    });
    const n = `${f}////${K.current}`, e = o.getState().stateComponents.get(f) || {
      components: /* @__PURE__ */ new Map()
    };
    return e.components.set(n, {
      forceUpdate: () => M({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), o.getState().stateComponents.set(f, e), M({}), () => {
      e && (e.components.delete(n), e.components.size === 0 && o.getState().stateComponents.delete(f));
    };
  }, []);
  const ot = (n, e, a, d) => {
    if (Array.isArray(e)) {
      const l = `${f}-${e.join(".")}`;
      c.current.add(l);
    }
    const u = o.getState();
    rt(f, (l) => {
      const m = X(n) ? n(l) : n, x = `${f}-${e.join(".")}`;
      if (x) {
        let N = !1, T = u.signalDomElements.get(x);
        if ((!T || T.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const E = e.slice(0, -1), p = U(m, E);
          if (Array.isArray(p)) {
            N = !0;
            const A = `${f}-${E.join(".")}`;
            T = u.signalDomElements.get(A);
          }
        }
        if (T) {
          const E = N ? U(m, e.slice(0, -1)) : U(m, e);
          T.forEach(({ parentId: p, position: A, effect: C }) => {
            const q = document.querySelector(
              `[data-parent-id="${p}"]`
            );
            if (q) {
              const W = Array.from(q.childNodes);
              if (W[A]) {
                const O = C ? new Function("state", `return (${C})(state)`)(E) : E;
                W[A].textContent = String(O);
              }
            }
          });
        }
      }
      a.updateType === "update" && (d || P.current?.validation?.key) && e && Q(
        (d || P.current?.validation?.key) + "." + e.join(".")
      );
      const b = e.slice(0, e.length - 1);
      a.updateType === "cut" && P.current?.validation?.key && Q(
        P.current?.validation?.key + "." + b.join(".")
      ), a.updateType === "insert" && P.current?.validation?.key && Jt(
        P.current?.validation?.key + "." + b.join(".")
      ).filter((T) => {
        let E = T?.split(".").length;
        const p = "";
        if (T == b.join(".") && E == b.length - 1) {
          let A = T + "." + b;
          Q(T), xt(A, p);
        }
      });
      const R = u.stateComponents.get(f);
      if (R) {
        const N = Mt(l, m), T = new Set(N), E = a.updateType === "update" ? e.join(".") : e.slice(0, -1).join(".") || "";
        for (const [
          p,
          A
        ] of R.components.entries()) {
          let C = !1;
          const q = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (!q.includes("none")) {
            if (q.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if (q.includes("component") && ((A.paths.has(E) || A.paths.has("")) && (C = !0), !C))
              for (const W of T) {
                let O = W;
                for (; ; ) {
                  if (A.paths.has(O)) {
                    C = !0;
                    break;
                  }
                  const lt = O.lastIndexOf(".");
                  if (lt !== -1) {
                    const V = O.substring(
                      0,
                      lt
                    );
                    if (!isNaN(
                      Number(O.substring(lt + 1))
                    ) && A.paths.has(V)) {
                      C = !0;
                      break;
                    }
                    O = V;
                  } else
                    O = "";
                  if (O === "")
                    break;
                }
                if (C) break;
              }
            if (!C && q.includes("deps") && A.depsFunction) {
              const W = A.depsFunction(m);
              let O = !1;
              typeof W == "boolean" ? W && (O = !0) : Z(A.deps, W) || (A.deps = W, O = !0), O && (C = !0);
            }
            C && A.forceUpdate();
          }
        }
      }
      const B = Date.now();
      let { oldValue: D, newValue: H } = Xt(
        a.updateType,
        l,
        m,
        e
      );
      const at = {
        timeStamp: B,
        stateKey: f,
        path: e,
        updateType: a.updateType,
        status: "new",
        oldValue: D,
        newValue: H
      };
      switch (a.updateType) {
        case "insert": {
          const N = e.slice(0, -1), E = e[e.length - 1].split(":")[1];
          H = U(m, N).find((A) => A.id == E), D = null, u.insertShadowArrayElement(f, N, H);
          break;
        }
        case "cut": {
          D = U(l, e), H = null, u.removeShadowArrayElement(f, e);
          break;
        }
        case "update": {
          D = U(l, e), H = U(m, e);
          const N = e.map((T, E) => {
            const p = e.slice(0, E + 1), A = U(m, p);
            return A?.id ? `id:${A.id}` : T;
          });
          u.updateShadowAtPath(f, N, H);
          break;
        }
      }
      if (Zt(f, (N) => {
        const T = [...N ?? [], at], E = /* @__PURE__ */ new Map();
        return T.forEach((p) => {
          const A = `${p.stateKey}:${JSON.stringify(p.path)}`, C = E.get(A);
          C ? (C.timeStamp = Math.max(C.timeStamp, p.timeStamp), C.newValue = p.newValue, C.oldValue = C.oldValue ?? p.oldValue, C.updateType = p.updateType) : E.set(A, { ...p });
        }), Array.from(E.values());
      }), pt(
        m,
        f,
        P.current,
        _
      ), P.current?.middleware && P.current.middleware({
        updateLog: G,
        update: at
      }), P.current?.serverSync) {
        const N = u.serverState[f], T = P.current?.serverSync;
        Yt(f, {
          syncKey: typeof T.syncKey == "string" ? T.syncKey : T.syncKey({ state: m }),
          rollBackState: N,
          actionTimeStamp: Date.now() + (T.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return m;
    });
  };
  o.getState().updaterState[f] || (mt(
    f,
    It(
      f,
      ot,
      K.current,
      _
    )
  ), o.getState().cogsStateStore[f] || rt(f, t), o.getState().initialStateGlobal[f] || Tt(f, t));
  const yt = Et(() => It(
    f,
    ot,
    K.current,
    _
  ), [f, _]);
  return [Rt(f), yt];
}
function It(t, s, S, g) {
  const I = /* @__PURE__ */ new Map();
  let k = 0;
  const w = (v) => {
    const r = v.join(".");
    for (const [h] of I)
      (h === r || h.startsWith(r + ".")) && I.delete(h);
    k++;
  }, y = {
    removeValidation: (v) => {
      v?.validationKey && Q(v.validationKey);
    },
    revertToInitialState: (v) => {
      const r = o.getState().getInitialOptions(t)?.validation;
      r?.key && Q(r?.key), v?.validationKey && Q(v.validationKey);
      const h = o.getState().initialStateGlobal[t];
      o.getState().initializeShadowState(t, h), o.getState().clearSelectedIndexesForState(t), I.clear(), k++;
      const M = $(h, []), _ = it(t), Y = X(_?.localStorage?.key) ? _?.localStorage?.key(h) : _?.localStorage?.key, f = `${g}-${t}-${Y}`;
      f && localStorage.removeItem(f), mt(t, M), rt(t, h);
      const G = o.getState().stateComponents.get(t);
      return G && G.components.forEach((c) => {
        c.forceUpdate();
      }), h;
    },
    updateInitialState: (v) => {
      I.clear(), k++;
      const r = It(
        t,
        s,
        S,
        g
      ), h = o.getState().initialStateGlobal[t], M = it(t), _ = X(M?.localStorage?.key) ? M?.localStorage?.key(h) : M?.localStorage?.key, Y = `${g}-${t}-${_}`;
      return localStorage.getItem(Y) && localStorage.removeItem(Y), Dt(() => {
        Tt(t, v), o.getState().initializeShadowState(t, v), mt(t, r), rt(t, v);
        const f = o.getState().stateComponents.get(t);
        f && f.components.forEach((G) => {
          G.forceUpdate();
        });
      }), {
        fetchId: (f) => r.get()[f]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const v = o.getState().serverState[t];
      return !!(v && Z(v, Rt(t)));
    }
  };
  function i(v) {
    const r = [t, ...v].join(".");
    return o.getState().shadowStateStore.get(r)?.arrayKeys || null;
  }
  function $(v, r = [], h) {
    const M = r.map(String).join(".");
    I.get(M);
    const _ = function() {
      return o().getNestedState(t, r);
    };
    Object.keys(y).forEach((G) => {
      _[G] = y[G];
    });
    const Y = {
      apply(G, c, K) {
        return o().getNestedState(t, r);
      },
      get(G, c) {
        const K = /* @__PURE__ */ new Set([
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
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender" && !K.has(c)) {
          const n = `${t}////${S}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const a = e.components.get(n);
            if (a && !a.paths.has("")) {
              const d = r.join(".");
              let u = !0;
              for (const l of a.paths)
                if (d.startsWith(l) && (d === l || d[l.length] === ".")) {
                  u = !1;
                  break;
                }
              u && a.paths.add(d);
            }
          }
        }
        if (c === "getDifferences")
          return () => Mt(
            o.getState().cogsStateStore[t],
            o.getState().initialStateGlobal[t]
          );
        if (c === "sync" && r.length === 0)
          return async function() {
            const n = o.getState().getInitialOptions(t), e = n?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const a = o.getState().getNestedState(t, []), d = n?.validation?.key;
            try {
              const u = await e.action(a);
              return u && !u.success && u.errors && d && (o.getState().removeValidationError(d), u.errors.forEach((l) => {
                const m = [d, ...l.path].join(".");
                o.getState().addValidationError(m, l.message);
              }), et(t)), u?.success && e.onSuccess ? e.onSuccess(u.data) : !u?.success && e.onError && e.onError(u.error), u;
            } catch (u) {
              return e.onError && e.onError(u), { success: !1, error: u };
            }
          };
        if (c === "_status") {
          const n = o.getState().getNestedState(t, r), e = o.getState().initialStateGlobal[t], a = U(e, r);
          return Z(n, a) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const n = o().getNestedState(
              t,
              r
            ), e = o.getState().initialStateGlobal[t], a = U(e, r);
            return Z(n, a) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const n = o.getState().initialStateGlobal[t], e = it(t), a = X(e?.localStorage?.key) ? e.localStorage.key(n) : e?.localStorage?.key, d = `${g}-${t}-${a}`;
            d && localStorage.removeItem(d);
          };
        if (c === "showValidationErrors")
          return () => {
            const n = o.getState().getInitialOptions(t)?.validation;
            if (!n?.key) throw new Error("Validation key not found");
            return o.getState().getValidationErrors(n.key + "." + r.join("."));
          };
        if (Array.isArray(v)) {
          if (c === "getSelected")
            return () => {
              const n = o.getState().getSelectedIndex(t, r.join("."));
              if (n === void 0) return;
              const e = o.getState().getNestedState(t, r);
              if (!e || n >= e.length)
                return;
              const a = e[n], d = `id:${a.id}`;
              return $(a, [...r, d], h);
            };
          if (c === "clearSelected")
            return () => {
              o.getState().clearSelectedIndex({ stateKey: t, path: r });
            };
          if (c === "getSelectedIndex")
            return () => {
              const n = o.getState().getSelectedIndex(t, r.join("."));
              if (n === void 0) return -1;
              if (h?.validIds) {
                const a = (i(r) || [])[n];
                return a ? h.validIds.indexOf(a) : -1;
              }
              return n;
            };
          if (c === "useVirtualView")
            return (n) => {
              const {
                itemHeight: e = 50,
                overscan: a = 6,
                stickToBottom: d = !1,
                dependencies: u = []
              } = n, l = z(null), [m, x] = ct({
                startIndex: 0,
                endIndex: 10
              }), [b, R] = ct(0), B = z(!0), D = z(!1), H = z(0), at = z(m), N = i(r);
              nt(() => o.getState().subscribeToShadowState(t, () => {
                R((j) => j + 1);
              }), [t]);
              const T = o().getNestedState(
                t,
                r
              ), E = T.length, { totalHeight: p, positions: A } = Et(() => {
                let V = 0;
                const j = [];
                for (let F = 0; F < E; F++) {
                  j[F] = V;
                  const L = N?.[F];
                  if (L) {
                    const tt = [...r, L], st = o.getState().getShadowMetadata(t, tt)?.virtualizer?.itemHeight;
                    V += st || e;
                  } else
                    V += e;
                }
                return { totalHeight: V, positions: j };
              }, [
                E,
                t,
                r.join("."),
                e,
                b,
                N
              ]), C = Et(() => {
                const V = Math.max(0, m.startIndex), j = Math.min(E, m.endIndex), F = T.slice(V, j), L = N?.slice(V, j);
                return $(F, r, {
                  ...h,
                  validIds: L
                });
              }, [
                m.startIndex,
                m.endIndex,
                T,
                E,
                N
              ]), q = St(() => {
                const V = E - 1;
                if (V >= 0 && N?.[V]) {
                  const j = N[V], F = [...r, j], L = o.getState().getShadowMetadata(t, F);
                  if (L?.virtualizer?.domRef) {
                    const tt = L.virtualizer.domRef;
                    if (tt?.scrollIntoView)
                      return tt.scrollIntoView({
                        behavior: "auto",
                        block: "end"
                      }), !0;
                  }
                }
                return !1;
              }, [t, r, E, N]);
              nt(() => {
                if (!d || E === 0) return;
                E > H.current && B.current && !D.current && setTimeout(() => O(E - 1, "smooth"), 50), H.current = E;
              }, [E, d]), nt(() => {
                const V = l.current;
                if (!V) return;
                const j = () => {
                  const { scrollTop: F, scrollHeight: L, clientHeight: tt } = V, gt = L - F - tt;
                  B.current = gt < 5, gt > 100 && (D.current = !0), gt < 5 && (D.current = !1);
                  let st = 0;
                  for (let J = 0; J < A.length; J++)
                    if (A[J] > F - e * a) {
                      st = Math.max(0, J - 1);
                      break;
                    }
                  let bt = st;
                  const Ft = F + tt;
                  for (let J = st; J < A.length && !(A[J] > Ft + e * a); J++)
                    bt = J;
                  const ht = Math.max(0, st), wt = Math.min(
                    E,
                    bt + 1 + a
                  );
                  (ht !== at.current.startIndex || wt !== at.current.endIndex) && (at.current = {
                    startIndex: ht,
                    endIndex: wt
                  }, x({
                    startIndex: ht,
                    endIndex: wt
                  }));
                };
                return V.addEventListener("scroll", j, {
                  passive: !0
                }), j(), () => V.removeEventListener("scroll", j);
              }, [A, E, e, a, d]);
              const W = St(() => {
                B.current = !0, D.current = !1, !q() && l.current && (l.current.scrollTop = l.current.scrollHeight);
              }, [q]), O = St(
                (V, j = "smooth") => {
                  const F = l.current;
                  if (!F) return;
                  const L = A[V];
                  L !== void 0 && F.scrollTo({ top: L, behavior: j });
                },
                [A]
              ), lt = {
                outer: {
                  ref: l,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${p}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${A[m.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: C,
                virtualizerProps: lt,
                scrollToBottom: W,
                scrollToIndex: O
              };
            };
          if (c === "stateMap")
            return (n) => {
              const e = v, a = h?.validIds || i(r) || [], d = $(v, r, h);
              return e.map((u, l) => {
                const m = a[l] || `id:${u.id}`, x = [...r, m], b = $(u, x, h);
                return n(
                  u,
                  b,
                  l,
                  v,
                  d
                );
              });
            };
          if (c === "stateMapNoRender")
            return (n) => {
              const e = v, a = h?.validIds || i(r) || [], d = $(v, r, h);
              return e.map((u, l) => {
                const m = a[l] || `id:${u.id}`, x = [...r, m], b = $(u, x, h);
                return n(
                  u,
                  b,
                  l,
                  v,
                  d
                );
              });
            };
          if (c === "$stateMap")
            return (n) => ut(te, {
              proxy: { _stateKey: t, _path: r, _mapFn: n },
              rebuildStateShape: $
            });
          if (c === "stateList")
            return (n) => {
              const e = v;
              if (!Array.isArray(e)) return null;
              const a = h?.validIds || i(r) || [], d = i(r) || [], u = $(
                e,
                r,
                h
              );
              return e.map((l, m) => {
                const x = a[m] || `id:${l.id}`, b = d.indexOf(x), R = [...r, x], B = $(l, R, h), D = `${S}-${r.join(".")}-${x}`;
                return ut(ne, {
                  key: x,
                  stateKey: t,
                  itemComponentId: D,
                  itemPath: R,
                  children: n(
                    l,
                    B,
                    { localIndex: m, originalIndex: b },
                    e,
                    u
                  )
                });
              });
            };
          if (c === "stateFlattenOn")
            return (n) => {
              const e = v;
              I.clear(), k++;
              const a = e.flatMap(
                (d) => d[n] ?? []
              );
              return $(
                a,
                [...r, "[*]", n],
                h
              );
            };
          if (c === "index")
            return (n) => {
              const a = (h?.validIds || i(r))?.[n];
              if (!a)
                return $(void 0, [
                  ...r,
                  n.toString()
                ]);
              const u = o.getState().getNestedState(t, r).find(
                (m) => `id:${m.id}` === a
              ), l = [...r, a];
              return $(u, l, h);
            };
          if (c === "last")
            return () => {
              const n = o.getState().getNestedState(t, r);
              if (n.length === 0) return;
              const e = n.length - 1, a = n[e], d = [...r, e.toString()];
              return $(a, d);
            };
          if (c === "insert")
            return (n) => (w(r), $t(s, n, r, t), $(
              o.getState().getNestedState(t, r),
              r
            ));
          if (c === "uniqueInsert")
            return (n, e, a) => {
              const d = o.getState().getNestedState(t, r), u = X(n) ? n(d) : n;
              let l = null;
              if (!d.some((x) => {
                const b = e ? e.every(
                  (R) => Z(x[R], u[R])
                ) : Z(x, u);
                return b && (l = x), b;
              }))
                w(r), $t(s, u, r, t);
              else if (a && l) {
                const x = a(l), b = d.map(
                  (R) => Z(R, l) ? x : R
                );
                w(r), dt(s, b, r);
              }
            };
          if (c === "cut")
            return (n, e) => {
              if (!e?.waitForSync)
                return w(r), ft(s, r, t, n), $(
                  o.getState().getNestedState(t, r),
                  r
                );
            };
          if (c === "cutByValue")
            return (n) => {
              const e = v.findIndex((a) => a === n);
              e > -1 && ft(s, r, t, e);
            };
          if (c === "toggleByValue")
            return (n) => {
              const e = v.findIndex((a) => a === n);
              e > -1 ? ft(s, r, t, e) : $t(s, n, r, t);
            };
          if (c === "stateFilter")
            return (n) => {
              const e = h?.validIds || i(r) || [], a = o.getState().getNestedState(t, r), d = new Map(
                a.map((m) => [`id:${m.id}`, m])
              ), u = [], l = [];
              return e.forEach((m, x) => {
                const b = d.get(m);
                b && n(b, x) && (u.push(m), l.push(b));
              }), $(l, r, {
                validIds: u
              });
            };
          if (c === "stateSort")
            return (n) => {
              const a = v.map((l) => ({
                item: l,
                id: `id:${l.id}`
              }));
              a.sort((l, m) => n(l.item, m.item));
              const d = a.map((l) => l.item), u = a.map((l) => l.id);
              return $(d, r, {
                validIds: u
              });
            };
          if (c === "findWith")
            return (n, e) => {
              const a = v.find(
                (l) => l[n] === e
              );
              if (!a) return;
              const d = `id:${a.id}`, u = [...r, d];
              return $(a, u, h);
            };
        }
        const P = r[r.length - 1];
        if (!isNaN(Number(P))) {
          const n = r.slice(0, -1), e = o.getState().getNestedState(t, n);
          if (Array.isArray(e) && c === "cut")
            return () => ft(
              s,
              n,
              t,
              Number(P)
            );
        }
        if (c === "get")
          return () => {
            if (h?.validIds && Array.isArray(v)) {
              const n = o.getState().getNestedState(t, r);
              if (!Array.isArray(n)) return [];
              const e = new Map(
                n.map((a) => [`id:${a.id}`, a])
              );
              return h.validIds.map((a) => e.get(a)).filter(Boolean);
            }
            return o.getState().getNestedState(t, r);
          };
        if (c === "$derive")
          return (n) => _t({
            _stateKey: t,
            _path: r,
            _effect: n.toString()
          });
        if (c === "$get")
          return () => _t({ _stateKey: t, _path: r });
        if (c === "lastSynced") {
          const n = `${t}:${r.join(".")}`;
          return o.getState().getSyncInfo(n);
        }
        if (c == "getLocalStorage")
          return (n) => vt(g + "-" + t + "-" + n);
        if (c === "_selected") {
          const n = r.slice(0, -1), e = n.join(".");
          if (Array.isArray(
            o.getState().getNestedState(t, n)
          )) {
            const a = r[r.length - 1];
            return i(n)?.indexOf(a) === o.getState().getSelectedIndex(t, e);
          }
          return;
        }
        if (c === "setSelected")
          return (n) => {
            const e = r.slice(0, -1), a = r[r.length - 1], u = i(e)?.indexOf(a);
            if (u === void 0 || u === -1) return;
            const l = e.join(".");
            o.getState().setSelectedIndex(
              t,
              l,
              n ? u : void 0
            );
            const m = o.getState().getNestedState(t, [...e]);
            dt(s, m, e), w(e);
          };
        if (c === "toggleSelected")
          return () => {
            const n = r.slice(0, -1), e = r[r.length - 1], d = i(n)?.indexOf(e);
            if (d === void 0 || d === -1) return;
            const u = n.join("."), l = o.getState().getSelectedIndex(t, u);
            o.getState().setSelectedIndex(
              t,
              u,
              l === d ? void 0 : d
            );
            const m = o.getState().getNestedState(t, [...n]);
            dt(s, m, n), w(n);
          };
        if (r.length == 0) {
          if (c === "addValidation")
            return (n) => {
              const e = o.getState().getInitialOptions(t)?.validation;
              if (!e?.key) throw new Error("Validation key not found");
              Q(e.key), n.forEach((a) => {
                const d = [e.key, ...a.path].join(".");
                xt(d, a.message);
              }), et(t);
            };
          if (c === "applyJsonPatch")
            return (n) => {
              const e = o.getState().cogsStateStore[t], a = Ht(e, n).newDocument;
              jt(
                t,
                o.getState().initialStateGlobal[t],
                a,
                s,
                S,
                g
              ), et(t);
            };
          if (c === "validateZodSchema")
            return () => {
              const n = o.getState().getInitialOptions(t)?.validation;
              if (!n?.zodSchema || !n?.key)
                throw new Error("Zod schema or validation key not found");
              Q(n.key);
              const e = o.getState().cogsStateStore[t], a = n.zodSchema.safeParse(e);
              return a.success ? !0 : (a.error.errors.forEach((d) => {
                const u = [n.key, ...d.path].join(".");
                xt(u, d.message);
              }), et(t), !1);
            };
          if (c === "_componentId") return S;
          if (c === "getComponents")
            return () => o().stateComponents.get(t);
          if (c === "getAllFormRefs")
            return () => Vt.getState().getFormRefsByStateKey(t);
          if (c === "_initialState")
            return o.getState().initialStateGlobal[t];
          if (c === "_serverState")
            return o.getState().serverState[t];
          if (c === "_isLoading")
            return o.getState().isLoadingGlobal[t];
          if (c === "revertToInitialState")
            return y.revertToInitialState;
          if (c === "updateInitialState") return y.updateInitialState;
          if (c === "removeValidation") return y.removeValidation;
        }
        if (c === "getFormRef")
          return () => Vt.getState().getFormRef(t + "." + r.join("."));
        if (c === "validationWrapper")
          return ({
            children: n,
            hideMessage: e
          }) => /* @__PURE__ */ At(
            Wt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: r,
              stateKey: t,
              children: n
            }
          );
        if (c === "_stateKey") return t;
        if (c === "_path") return r;
        if (c === "_isServerSynced") return y._isServerSynced;
        if (c === "update")
          return (n, e) => {
            if (e?.debounce)
              Gt(() => {
                dt(s, n, r, "");
                const a = o.getState().getNestedState(t, r);
                e?.afterUpdate && e.afterUpdate(a);
              }, e.debounce);
            else {
              dt(s, n, r, "");
              const a = o.getState().getNestedState(t, r);
              e?.afterUpdate && e.afterUpdate(a);
            }
            w(r);
          };
        if (c === "formElement")
          return (n, e) => /* @__PURE__ */ At(
            zt,
            {
              setState: s,
              stateKey: t,
              path: r,
              child: n,
              formOpts: e
            }
          );
        const ot = [...r, c], yt = o.getState().getNestedState(t, ot);
        return $(yt, ot, h);
      }
    }, f = new Proxy(_, Y);
    return I.set(M, {
      proxy: f,
      stateVersion: k
    }), f;
  }
  return $(
    o.getState().getNestedState(t, [])
  );
}
function _t(t) {
  return ut(ee, { proxy: t });
}
function te({
  proxy: t,
  rebuildStateShape: s
}) {
  const S = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(S) ? s(
    S,
    t._path
  ).stateMapNoRender(
    (I, k, w, y, i) => t._mapFn(I, k, w, y, i)
  ) : null;
}
function ee({
  proxy: t
}) {
  const s = z(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return nt(() => {
    const g = s.current;
    if (!g || !g.parentElement) return;
    const I = g.parentElement, w = Array.from(I.childNodes).indexOf(g);
    let y = I.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, I.setAttribute("data-parent-id", y));
    const $ = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: w,
      effect: t._effect
    };
    o.getState().addSignalElement(S, $);
    const v = o.getState().getNestedState(t._stateKey, t._path);
    let r = v;
    if (t._effect)
      try {
        r = new Function(
          "state",
          `return (${t._effect})(state)`
        )(v);
      } catch (M) {
        console.error("Error evaluating effect function:", M);
      }
    r !== null && typeof r == "object" && (r = JSON.stringify(r));
    const h = document.createTextNode(String(r));
    g.replaceWith(h);
  }, [t._stateKey, t._path.join("."), t._effect]), ut("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function ye(t) {
  const s = Ut(
    (S) => {
      const g = o.getState().stateComponents.get(t._stateKey) || { components: /* @__PURE__ */ new Map() };
      return g.components.set(t._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), o.getState().stateComponents.set(t._stateKey, g), () => g.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return ut("text", {}, String(s));
}
function ne({
  stateKey: t,
  itemComponentId: s,
  itemPath: S,
  children: g
}) {
  const [, I] = ct({}), [k, w] = qt(), y = z(null), i = z(null), $ = St(
    (v) => {
      k(v), y.current = v;
    },
    [k]
  );
  return nt(() => {
    w.height > 0 && w.height !== i.current && (i.current = w.height, o.getState().setShadowMetadata(t, S, {
      virtualizer: { itemHeight: w.height, domRef: y.current }
    }));
  }, [w.height, t, S]), Pt(() => {
    const v = `${t}////${s}`, r = o.getState().stateComponents.get(t) || { components: /* @__PURE__ */ new Map() };
    return r.components.set(v, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set([S.join(".")])
    }), o.getState().stateComponents.set(t, r), () => {
      const h = o.getState().stateComponents.get(t);
      h && h.components.delete(v);
    };
  }, [t, s, S.join(".")]), /* @__PURE__ */ At("div", { ref: $, children: g });
}
export {
  _t as $cogsSignal,
  ye as $cogsSignalStore,
  me as addStateOptions,
  Ie as createCogsState,
  ve as notifyComponent,
  Kt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
