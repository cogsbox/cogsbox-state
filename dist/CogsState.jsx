"use client";
import { jsx as $t } from "react/jsx-runtime";
import { useState as lt, useRef as B, useEffect as rt, useLayoutEffect as _t, useMemo as At, createElement as gt, useSyncExternalStore as Ft, startTransition as Ut, useCallback as Et } from "react";
import { transformStateFunc as Dt, isDeepEqual as Q, isFunction as tt, getNestedValue as U, getDifferences as Pt, debounce as Gt } from "./utility.js";
import { pushFunc as wt, updateFn as ut, cutFunc as ft, ValidationWrapper as Lt, FormControlComponent as Wt } from "./Functions.jsx";
import Bt from "superjson";
import { v4 as kt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Vt } from "./store.js";
import { useCogsConfig as Mt } from "./CogsStateClient.jsx";
import { applyPatch as zt } from "fast-json-patch";
import Ht from "react-use-measure";
import "ulid";
function bt(t, i) {
  const S = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, I = S(t) || {};
  g(t, {
    ...I,
    ...i
  });
}
function Nt({
  stateKey: t,
  options: i,
  initialOptionsPart: S
}) {
  const g = ct(t) || {}, I = S[t] || {}, k = o.getState().setInitialStateOptions, w = { ...I, ...g };
  let v = !1;
  if (i)
    for (const s in i)
      w.hasOwnProperty(s) ? (s == "localStorage" && i[s] && w[s].key !== i[s]?.key && (v = !0, w[s] = i[s]), s == "initialState" && i[s] && w[s] !== i[s] && // Different references
      !Q(w[s], i[s]) && (v = !0, w[s] = i[s])) : (v = !0, w[s] = i[s]);
  v && k(t, w);
}
function Se(t, { formElements: i, validation: S }) {
  return { initialState: t, formElements: i, validation: S };
}
const me = (t, i) => {
  let S = t;
  const [g, I] = Dt(S);
  (Object.keys(I).length > 0 || i && Object.keys(i).length > 0) && Object.keys(I).forEach((v) => {
    I[v] = I[v] || {}, I[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...I[v].formElements || {}
      // State-specific overrides
    }, ct(v) || o.getState().setInitialStateOptions(v, I[v]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const k = (v, s) => {
    const [$] = lt(s?.componentId ?? kt());
    Nt({
      stateKey: v,
      options: s,
      initialOptionsPart: I
    });
    const y = o.getState().cogsStateStore[v] || g[v], r = s?.modifyState ? s.modifyState(y) : y, [h, M] = Xt(
      r,
      {
        stateKey: v,
        syncUpdate: s?.syncUpdate,
        componentId: $,
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
  function w(v, s) {
    Nt({ stateKey: v, options: s, initialOptionsPart: I }), s.localStorage && Yt(v, s), nt(v);
  }
  return { useCogsState: k, setCogsOptions: w };
}, {
  setUpdaterState: St,
  setState: ot,
  getInitialOptions: ct,
  getKeyState: Ot,
  getValidationErrors: qt,
  setStateLog: Jt,
  updateInitialStateGlobal: Tt,
  addValidationError: xt,
  removeValidationError: K,
  setServerSyncActions: Zt
} = o.getState(), pt = (t, i, S, g, I) => {
  S?.log && console.log(
    "saving to localstorage",
    i,
    S.localStorage?.key,
    g
  );
  const k = tt(S?.localStorage?.key) ? S.localStorage?.key(t) : S?.localStorage?.key;
  if (k && g) {
    const w = `${g}-${i}-${k}`;
    let v;
    try {
      v = It(w)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: I ?? v
    }, $ = Bt.serialize(s);
    window.localStorage.setItem(
      w,
      JSON.stringify($.json)
    );
  }
}, It = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Yt = (t, i) => {
  const S = o.getState().cogsStateStore[t], { sessionId: g } = Mt(), I = tt(i?.localStorage?.key) ? i.localStorage.key(S) : i?.localStorage?.key;
  if (I && g) {
    const k = It(
      `${g}-${t}-${I}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return ot(t, k.state), nt(t), !0;
  }
  return !1;
}, Rt = (t, i, S, g, I, k) => {
  const w = {
    initialState: i,
    updaterState: mt(
      t,
      g,
      I,
      k
    ),
    state: S
  };
  Tt(t, w.initialState), St(t, w.updaterState), ot(t, w.state);
}, nt = (t) => {
  const i = o.getState().stateComponents.get(t);
  if (!i) return;
  const S = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || S.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((g) => g());
  });
}, Ie = (t, i) => {
  const S = o.getState().stateComponents.get(t);
  if (S) {
    const g = `${t}////${i}`, I = S.components.get(g);
    if ((I ? Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"] : null)?.includes("none"))
      return;
    I && I.forceUpdate();
  }
}, Qt = (t, i, S, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: U(i, g),
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
        oldValue: U(i, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Xt(t, {
  stateKey: i,
  serverSync: S,
  localStorage: g,
  formElements: I,
  reactiveDeps: k,
  reactiveType: w,
  componentId: v,
  initialState: s,
  syncUpdate: $,
  dependencies: y,
  serverState: r
} = {}) {
  const [h, M] = lt({}), { sessionId: C } = Mt();
  let X = !i;
  const [f] = lt(i ?? kt()), W = o.getState().stateLog[f], c = B(/* @__PURE__ */ new Set()), et = B(v ?? kt()), P = B(
    null
  );
  P.current = ct(f) ?? null, rt(() => {
    if ($ && $.stateKey === f && $.path?.[0]) {
      ot(f, (e) => ({
        ...e,
        [$.path[0]]: $.newValue
      }));
      const n = `${$.stateKey}:${$.path.join(".")}`;
      o.getState().setSyncInfo(n, {
        timeStamp: $.timeStamp,
        userId: $.userId
      });
    }
  }, [$]), rt(() => {
    if (s) {
      bt(f, {
        initialState: s
      });
      const n = P.current, a = n?.serverState?.id !== void 0 && n?.serverState?.status === "success" && n?.serverState?.data, u = o.getState().initialStateGlobal[f];
      if (!(u && !Q(u, s) || !u) && !a)
        return;
      let l = null;
      const m = tt(n?.localStorage?.key) ? n?.localStorage?.key(s) : n?.localStorage?.key;
      m && C && (l = It(`${C}-${f}-${m}`));
      let x = s, T = !1;
      const R = a ? Date.now() : 0, z = l?.lastUpdated || 0, D = l?.lastSyncedWithServer || 0;
      a && R > z ? (x = n.serverState.data, T = !0) : l && z > D && (x = l.state, n?.localStorage?.onChange && n?.localStorage?.onChange(x)), o.getState().initializeShadowState(f, s), Rt(
        f,
        s,
        x,
        at,
        et.current,
        C
      ), T && m && C && pt(x, f, n, C, Date.now()), nt(f), (Array.isArray(w) ? w : [w || "component"]).includes("none") || M({});
    }
  }, [
    s,
    r?.status,
    r?.data,
    ...y || []
  ]), _t(() => {
    X && bt(f, {
      serverSync: S,
      formElements: I,
      initialState: s,
      localStorage: g,
      middleware: P.current?.middleware
    });
    const n = `${f}////${et.current}`, e = o.getState().stateComponents.get(f) || {
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
  const at = (n, e, a, u) => {
    if (Array.isArray(e)) {
      const l = `${f}-${e.join(".")}`;
      c.current.add(l);
    }
    const d = o.getState();
    ot(f, (l) => {
      const m = tt(n) ? n(l) : n, x = `${f}-${e.join(".")}`;
      if (x) {
        let _ = !1, E = d.signalDomElements.get(x);
        if ((!E || E.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const V = e.slice(0, -1), N = U(m, V);
          if (Array.isArray(N)) {
            _ = !0;
            const A = `${f}-${V.join(".")}`;
            E = d.signalDomElements.get(A);
          }
        }
        if (E) {
          const V = _ ? U(m, e.slice(0, -1)) : U(m, e);
          E.forEach(({ parentId: N, position: A, effect: b }) => {
            const J = document.querySelector(
              `[data-parent-id="${N}"]`
            );
            if (J) {
              const G = Array.from(J.childNodes);
              if (G[A]) {
                const j = b ? new Function("state", `return (${b})(state)`)(V) : V;
                G[A].textContent = String(j);
              }
            }
          });
        }
      }
      a.updateType === "update" && (u || P.current?.validation?.key) && e && K(
        (u || P.current?.validation?.key) + "." + e.join(".")
      );
      const T = e.slice(0, e.length - 1);
      a.updateType === "cut" && P.current?.validation?.key && K(
        P.current?.validation?.key + "." + T.join(".")
      ), a.updateType === "insert" && P.current?.validation?.key && qt(
        P.current?.validation?.key + "." + T.join(".")
      ).filter((E) => {
        let V = E?.split(".").length;
        const N = "";
        if (E == T.join(".") && V == T.length - 1) {
          let A = E + "." + T;
          K(E), xt(A, N);
        }
      });
      const R = d.stateComponents.get(f);
      if (R) {
        const _ = Pt(l, m), E = new Set(_), V = a.updateType === "update" ? e.join(".") : e.slice(0, -1).join(".") || "";
        for (const [
          N,
          A
        ] of R.components.entries()) {
          let b = !1;
          const J = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (!J.includes("none")) {
            if (J.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if (J.includes("component") && ((A.paths.has(V) || A.paths.has("")) && (b = !0), !b))
              for (const G of E) {
                let j = G;
                for (; ; ) {
                  if (A.paths.has(j)) {
                    b = !0;
                    break;
                  }
                  const p = j.lastIndexOf(".");
                  if (p !== -1) {
                    const O = j.substring(
                      0,
                      p
                    );
                    if (!isNaN(
                      Number(j.substring(p + 1))
                    ) && A.paths.has(O)) {
                      b = !0;
                      break;
                    }
                    j = O;
                  } else
                    j = "";
                  if (j === "")
                    break;
                }
                if (b) break;
              }
            if (!b && J.includes("deps") && A.depsFunction) {
              const G = A.depsFunction(m);
              let j = !1;
              typeof G == "boolean" ? G && (j = !0) : Q(A.deps, G) || (A.deps = G, j = !0), j && (b = !0);
            }
            b && A.forceUpdate();
          }
        }
      }
      const z = Date.now();
      let { oldValue: D, newValue: H } = Qt(
        a.updateType,
        l,
        m,
        e
      );
      const it = {
        timeStamp: z,
        stateKey: f,
        path: e,
        updateType: a.updateType,
        status: "new",
        oldValue: D,
        newValue: H
      };
      switch (a.updateType) {
        case "insert": {
          const _ = e.slice(0, -1), V = e[e.length - 1].split(":")[1];
          H = U(m, _).find((A) => A.id == V), D = null, d.insertShadowArrayElement(f, _, H);
          break;
        }
        case "cut": {
          D = U(l, e), H = null, d.removeShadowArrayElement(f, e);
          break;
        }
        case "update": {
          D = U(l, e), H = U(m, e);
          const _ = e.map((E, V) => {
            const N = e.slice(0, V + 1), A = U(m, N);
            return A?.id ? `id:${A.id}` : E;
          });
          d.updateShadowAtPath(f, _, H);
          break;
        }
      }
      if (Jt(f, (_) => {
        const E = [..._ ?? [], it], V = /* @__PURE__ */ new Map();
        return E.forEach((N) => {
          const A = `${N.stateKey}:${JSON.stringify(N.path)}`, b = V.get(A);
          b ? (b.timeStamp = Math.max(b.timeStamp, N.timeStamp), b.newValue = N.newValue, b.oldValue = b.oldValue ?? N.oldValue, b.updateType = N.updateType) : V.set(A, { ...N });
        }), Array.from(V.values());
      }), pt(
        m,
        f,
        P.current,
        C
      ), P.current?.middleware && P.current.middleware({
        updateLog: W,
        update: it
      }), P.current?.serverSync) {
        const _ = d.serverState[f], E = P.current?.serverSync;
        Zt(f, {
          syncKey: typeof E.syncKey == "string" ? E.syncKey : E.syncKey({ state: m }),
          rollBackState: _,
          actionTimeStamp: Date.now() + (E.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return m;
    });
  };
  o.getState().updaterState[f] || (St(
    f,
    mt(
      f,
      at,
      et.current,
      C
    )
  ), o.getState().cogsStateStore[f] || ot(f, t), o.getState().initialStateGlobal[f] || Tt(f, t));
  const yt = At(() => mt(
    f,
    at,
    et.current,
    C
  ), [f, C]);
  return [Ot(f), yt];
}
function mt(t, i, S, g) {
  const I = /* @__PURE__ */ new Map();
  let k = 0;
  const w = (y) => {
    const r = y.join(".");
    for (const [h] of I)
      (h === r || h.startsWith(r + ".")) && I.delete(h);
    k++;
  }, v = {
    removeValidation: (y) => {
      y?.validationKey && K(y.validationKey);
    },
    revertToInitialState: (y) => {
      const r = o.getState().getInitialOptions(t)?.validation;
      r?.key && K(r?.key), y?.validationKey && K(y.validationKey);
      const h = o.getState().initialStateGlobal[t];
      o.getState().initializeShadowState(t, h), o.getState().clearSelectedIndexesForState(t), I.clear(), k++;
      const M = $(h, []), C = ct(t), X = tt(C?.localStorage?.key) ? C?.localStorage?.key(h) : C?.localStorage?.key, f = `${g}-${t}-${X}`;
      f && localStorage.removeItem(f), St(t, M), ot(t, h);
      const W = o.getState().stateComponents.get(t);
      return W && W.components.forEach((c) => {
        c.forceUpdate();
      }), h;
    },
    updateInitialState: (y) => {
      I.clear(), k++;
      const r = mt(
        t,
        i,
        S,
        g
      ), h = o.getState().initialStateGlobal[t], M = ct(t), C = tt(M?.localStorage?.key) ? M?.localStorage?.key(h) : M?.localStorage?.key, X = `${g}-${t}-${C}`;
      return localStorage.getItem(X) && localStorage.removeItem(X), Ut(() => {
        Tt(t, y), o.getState().initializeShadowState(t, y), St(t, r), ot(t, y);
        const f = o.getState().stateComponents.get(t);
        f && f.components.forEach((W) => {
          W.forceUpdate();
        });
      }), {
        fetchId: (f) => r.get()[f]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const y = o.getState().serverState[t];
      return !!(y && Q(y, Ot(t)));
    }
  };
  function s(y) {
    const r = [t, ...y].join(".");
    return o.getState().shadowStateStore.get(r)?.arrayKeys || null;
  }
  function $(y, r = [], h) {
    const M = r.map(String).join(".");
    I.get(M);
    const C = function() {
      return o().getNestedState(t, r);
    };
    Object.keys(v).forEach((W) => {
      C[W] = v[W];
    });
    const X = {
      apply(W, c, et) {
        return o().getNestedState(t, r);
      },
      get(W, c) {
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
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender" && !et.has(c)) {
          const n = `${t}////${S}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const a = e.components.get(n);
            if (a && !a.paths.has("")) {
              const u = r.join(".");
              let d = !0;
              for (const l of a.paths)
                if (u.startsWith(l) && (u === l || u[l.length] === ".")) {
                  d = !1;
                  break;
                }
              d && a.paths.add(u);
            }
          }
        }
        if (c === "getDifferences")
          return () => Pt(
            o.getState().cogsStateStore[t],
            o.getState().initialStateGlobal[t]
          );
        if (c === "sync" && r.length === 0)
          return async function() {
            const n = o.getState().getInitialOptions(t), e = n?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const a = o.getState().getNestedState(t, []), u = n?.validation?.key;
            try {
              const d = await e.action(a);
              return d && !d.success && d.errors && u && (o.getState().removeValidationError(u), d.errors.forEach((l) => {
                const m = [u, ...l.path].join(".");
                o.getState().addValidationError(m, l.message);
              }), nt(t)), d?.success && e.onSuccess ? e.onSuccess(d.data) : !d?.success && e.onError && e.onError(d.error), d;
            } catch (d) {
              return e.onError && e.onError(d), { success: !1, error: d };
            }
          };
        if (c === "_status") {
          const n = o.getState().getNestedState(t, r), e = o.getState().initialStateGlobal[t], a = U(e, r);
          return Q(n, a) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const n = o().getNestedState(
              t,
              r
            ), e = o.getState().initialStateGlobal[t], a = U(e, r);
            return Q(n, a) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const n = o.getState().initialStateGlobal[t], e = ct(t), a = tt(e?.localStorage?.key) ? e.localStorage.key(n) : e?.localStorage?.key, u = `${g}-${t}-${a}`;
            u && localStorage.removeItem(u);
          };
        if (c === "showValidationErrors")
          return () => {
            const n = o.getState().getInitialOptions(t)?.validation;
            if (!n?.key) throw new Error("Validation key not found");
            return o.getState().getValidationErrors(n.key + "." + r.join("."));
          };
        if (Array.isArray(y)) {
          if (c === "getSelected")
            return () => {
              const n = o.getState().getSelectedIndex(t, r.join("."));
              if (n === void 0) return;
              const e = o.getState().getNestedState(t, r);
              if (!e || n >= e.length)
                return;
              const a = e[n], u = `id:${a.id}`;
              return $(a, [...r, u], h);
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
                const a = (s(r) || [])[n];
                return a ? h.validIds.indexOf(a) : -1;
              }
              return n;
            };
          if (c === "useVirtualView")
            return (n) => {
              const {
                itemHeight: e = 50,
                overscan: a = 6,
                stickToBottom: u = !1,
                dependencies: d = []
              } = n, l = B(null), [m, x] = lt({
                startIndex: 0,
                endIndex: 10
              }), [T, R] = lt(0), z = B(!0), D = B(!1), H = B(0), it = B(m);
              rt(() => o.getState().subscribeToShadowState(t, () => {
                R((O) => O + 1);
              }), [t]);
              const _ = o().getNestedState(
                t,
                r
              ), E = _.length, V = s(r), { totalHeight: N, positions: A } = At(() => {
                let p = 0;
                const O = [];
                for (let F = 0; F < E; F++) {
                  O[F] = p;
                  const Z = V?.[F];
                  let q = e;
                  if (Z) {
                    const L = [...r, Z];
                    q = o.getState().getShadowMetadata(t, L)?.virtualizer?.itemHeight || e;
                  }
                  p += q;
                }
                return { totalHeight: p, positions: O };
              }, [
                E,
                t,
                r.join("."),
                e,
                T,
                V
                // Add `orderedIds` to the dependency array
              ]), b = At(() => {
                const p = Math.max(0, m.startIndex), O = Math.min(E, m.endIndex), F = V?.slice(p, O), Z = new Map(
                  _.map((L) => [`id:${L.id}`, L])
                ), q = F?.map((L) => Z.get(L)).filter(Boolean) || [];
                return $(q, r, {
                  ...h,
                  validIds: F
                  // Pass the sliced IDs as the new `validIds`
                });
              }, [
                m.startIndex,
                m.endIndex,
                _,
                E,
                V
              ]);
              rt(() => {
                if (!u || E === 0) return;
                E > H.current && z.current && !D.current && setTimeout(() => G(E - 1, "smooth"), 50), H.current = E;
              }, [E, u]), rt(() => {
                const p = l.current;
                if (!p) return;
                const O = () => {
                  const { scrollTop: F, scrollHeight: Z, clientHeight: q } = p, L = Z - F - q;
                  z.current = L < 5, L > 100 && (D.current = !0), L < 5 && (D.current = !1);
                  let st = 0;
                  for (let Y = 0; Y < A.length; Y++)
                    if (A[Y] > F - e * a) {
                      st = Math.max(0, Y - 1);
                      break;
                    }
                  let dt = st;
                  const jt = F + q;
                  for (let Y = st; Y < A.length && !(A[Y] > jt + e * a); Y++)
                    dt = Y;
                  const vt = Math.max(0, st), ht = Math.min(
                    E,
                    dt + 1 + a
                  );
                  (vt !== it.current.startIndex || ht !== it.current.endIndex) && (it.current = {
                    startIndex: vt,
                    endIndex: ht
                  }, x({
                    startIndex: vt,
                    endIndex: ht
                  }));
                };
                return p.addEventListener("scroll", O, {
                  passive: !0
                }), O(), () => p.removeEventListener("scroll", O);
              }, [A, E, e, a]);
              const J = Et(() => {
                z.current = !0, D.current = !1, l.current && (l.current.scrollTop = l.current.scrollHeight);
              }, []), G = Et(
                (p, O = "smooth") => {
                  const F = l.current;
                  if (!F) return;
                  const Z = V?.[p];
                  if (Z) {
                    const L = [...r, Z], dt = o.getState().getShadowMetadata(t, L)?.virtualizer?.domRef;
                    if (dt?.scrollIntoView) {
                      dt.scrollIntoView({ behavior: O, block: "nearest" });
                      return;
                    }
                  }
                  const q = A[p];
                  q !== void 0 && F.scrollTo({ top: q, behavior: O });
                },
                [A, t, r, V]
                // Add `orderedIds` to dependency array
              ), j = {
                outer: {
                  ref: l,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: { height: `${N}px`, position: "relative" }
                },
                list: {
                  style: {
                    transform: `translateY(${A[m.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: b,
                virtualizerProps: j,
                scrollToBottom: J,
                scrollToIndex: G
              };
            };
          if (c === "stateMap")
            return (n) => {
              const e = y, a = h?.validIds || s(r) || [], u = $(y, r, h);
              return e.map((d, l) => {
                const m = a[l] || `id:${d.id}`, x = [...r, m], T = $(d, x, h);
                return n(
                  d,
                  T,
                  l,
                  y,
                  u
                );
              });
            };
          if (c === "stateMapNoRender")
            return (n) => {
              const e = y, a = h?.validIds || s(r) || [], u = $(y, r, h);
              return e.map((d, l) => {
                const m = a[l] || `id:${d.id}`, x = [...r, m], T = $(d, x, h);
                return n(
                  d,
                  T,
                  l,
                  y,
                  u
                );
              });
            };
          if (c === "$stateMap")
            return (n) => gt(Kt, {
              proxy: { _stateKey: t, _path: r, _mapFn: n },
              rebuildStateShape: $
            });
          if (c === "stateList")
            return (n) => {
              const e = y;
              if (!Array.isArray(e)) return null;
              const a = h?.validIds || s(r) || [], u = s(r) || [], d = $(
                e,
                r,
                h
              );
              return e.map((l, m) => {
                const x = a[m] || `id:${l.id}`, T = u.indexOf(x), R = [...r, x], z = $(l, R, h), D = `${S}-${r.join(".")}-${x}`;
                return gt(ee, {
                  key: x,
                  stateKey: t,
                  itemComponentId: D,
                  itemPath: R,
                  children: n(
                    l,
                    z,
                    { localIndex: m, originalIndex: T },
                    e,
                    d
                  )
                });
              });
            };
          if (c === "stateFlattenOn")
            return (n) => {
              const e = y;
              I.clear(), k++;
              const a = e.flatMap(
                (u) => u[n] ?? []
              );
              return $(
                a,
                [...r, "[*]", n],
                h
              );
            };
          if (c === "index")
            return (n) => {
              const a = (h?.validIds || s(r))?.[n];
              if (!a)
                return $(void 0, [
                  ...r,
                  n.toString()
                ]);
              const d = o.getState().getNestedState(t, r).find(
                (m) => `id:${m.id}` === a
              ), l = [...r, a];
              return $(d, l, h);
            };
          if (c === "last")
            return () => {
              const n = o.getState().getNestedState(t, r);
              if (n.length === 0) return;
              const e = n.length - 1, a = n[e], u = [...r, e.toString()];
              return $(a, u);
            };
          if (c === "insert")
            return (n) => (w(r), wt(i, n, r, t), $(
              o.getState().getNestedState(t, r),
              r
            ));
          if (c === "uniqueInsert")
            return (n, e, a) => {
              const u = o.getState().getNestedState(t, r), d = tt(n) ? n(u) : n;
              let l = null;
              if (!u.some((x) => {
                const T = e ? e.every(
                  (R) => Q(x[R], d[R])
                ) : Q(x, d);
                return T && (l = x), T;
              }))
                w(r), wt(i, d, r, t);
              else if (a && l) {
                const x = a(l), T = u.map(
                  (R) => Q(R, l) ? x : R
                );
                w(r), ut(i, T, r);
              }
            };
          if (c === "cut")
            return (n, e) => {
              if (!e?.waitForSync)
                return w(r), ft(i, r, t, n), $(
                  o.getState().getNestedState(t, r),
                  r
                );
            };
          if (c === "cutByValue")
            return (n) => {
              const e = y.findIndex((a) => a === n);
              e > -1 && ft(i, r, t, e);
            };
          if (c === "toggleByValue")
            return (n) => {
              const e = y.findIndex((a) => a === n);
              e > -1 ? ft(i, r, t, e) : wt(i, n, r, t);
            };
          if (c === "stateFilter")
            return (n) => {
              const e = h?.validIds || s(r) || [], a = o.getState().getNestedState(t, r), u = new Map(
                a.map((m) => [`id:${m.id}`, m])
              ), d = [], l = [];
              return e.forEach((m, x) => {
                const T = u.get(m);
                T && n(T, x) && (d.push(m), l.push(T));
              }), $(l, r, {
                validIds: d
              });
            };
          if (c === "stateSort")
            return (n) => {
              const a = y.map((l) => ({
                item: l,
                id: `id:${l.id}`
              }));
              a.sort((l, m) => n(l.item, m.item));
              const u = a.map((l) => l.item), d = a.map((l) => l.id);
              return $(u, r, {
                validIds: d
              });
            };
          if (c === "findWith")
            return (n, e) => {
              const a = y.find(
                (l) => l[n] === e
              );
              if (!a) return;
              const u = `id:${a.id}`, d = [...r, u];
              return $(a, d, h);
            };
        }
        const P = r[r.length - 1];
        if (!isNaN(Number(P))) {
          const n = r.slice(0, -1), e = o.getState().getNestedState(t, n);
          if (Array.isArray(e) && c === "cut")
            return () => ft(
              i,
              n,
              t,
              Number(P)
            );
        }
        if (c === "get")
          return () => {
            if (h?.validIds && Array.isArray(y)) {
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
          return (n) => Ct({
            _stateKey: t,
            _path: r,
            _effect: n.toString()
          });
        if (c === "$get")
          return () => Ct({ _stateKey: t, _path: r });
        if (c === "lastSynced") {
          const n = `${t}:${r.join(".")}`;
          return o.getState().getSyncInfo(n);
        }
        if (c == "getLocalStorage")
          return (n) => It(g + "-" + t + "-" + n);
        if (c === "_selected") {
          const n = r.slice(0, -1), e = n.join(".");
          if (Array.isArray(
            o.getState().getNestedState(t, n)
          )) {
            const a = r[r.length - 1];
            return s(n)?.indexOf(a) === o.getState().getSelectedIndex(t, e);
          }
          return;
        }
        if (c === "setSelected")
          return (n) => {
            const e = r.slice(0, -1), a = r[r.length - 1], d = s(e)?.indexOf(a);
            if (d === void 0 || d === -1) return;
            const l = e.join(".");
            o.getState().setSelectedIndex(
              t,
              l,
              n ? d : void 0
            );
            const m = o.getState().getNestedState(t, [...e]);
            ut(i, m, e), w(e);
          };
        if (c === "toggleSelected")
          return () => {
            const n = r.slice(0, -1), e = r[r.length - 1], u = s(n)?.indexOf(e);
            if (u === void 0 || u === -1) return;
            const d = n.join("."), l = o.getState().getSelectedIndex(t, d);
            o.getState().setSelectedIndex(
              t,
              d,
              l === u ? void 0 : u
            );
            const m = o.getState().getNestedState(t, [...n]);
            ut(i, m, n), w(n);
          };
        if (r.length == 0) {
          if (c === "addValidation")
            return (n) => {
              const e = o.getState().getInitialOptions(t)?.validation;
              if (!e?.key) throw new Error("Validation key not found");
              K(e.key), n.forEach((a) => {
                const u = [e.key, ...a.path].join(".");
                xt(u, a.message);
              }), nt(t);
            };
          if (c === "applyJsonPatch")
            return (n) => {
              const e = o.getState().cogsStateStore[t], a = zt(e, n).newDocument;
              Rt(
                t,
                o.getState().initialStateGlobal[t],
                a,
                i,
                S,
                g
              ), nt(t);
            };
          if (c === "validateZodSchema")
            return () => {
              const n = o.getState().getInitialOptions(t)?.validation;
              if (!n?.zodSchema || !n?.key)
                throw new Error("Zod schema or validation key not found");
              K(n.key);
              const e = o.getState().cogsStateStore[t], a = n.zodSchema.safeParse(e);
              return a.success ? !0 : (a.error.errors.forEach((u) => {
                const d = [n.key, ...u.path].join(".");
                xt(d, u.message);
              }), nt(t), !1);
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
            return v.revertToInitialState;
          if (c === "updateInitialState") return v.updateInitialState;
          if (c === "removeValidation") return v.removeValidation;
        }
        if (c === "getFormRef")
          return () => Vt.getState().getFormRef(t + "." + r.join("."));
        if (c === "validationWrapper")
          return ({
            children: n,
            hideMessage: e
          }) => /* @__PURE__ */ $t(
            Lt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: r,
              stateKey: t,
              children: n
            }
          );
        if (c === "_stateKey") return t;
        if (c === "_path") return r;
        if (c === "_isServerSynced") return v._isServerSynced;
        if (c === "update")
          return (n, e) => {
            if (e?.debounce)
              Gt(() => {
                ut(i, n, r, "");
                const a = o.getState().getNestedState(t, r);
                e?.afterUpdate && e.afterUpdate(a);
              }, e.debounce);
            else {
              ut(i, n, r, "");
              const a = o.getState().getNestedState(t, r);
              e?.afterUpdate && e.afterUpdate(a);
            }
            w(r);
          };
        if (c === "formElement")
          return (n, e) => /* @__PURE__ */ $t(
            Wt,
            {
              setState: i,
              stateKey: t,
              path: r,
              child: n,
              formOpts: e
            }
          );
        const at = [...r, c], yt = o.getState().getNestedState(t, at);
        return $(yt, at, h);
      }
    }, f = new Proxy(C, X);
    return I.set(M, {
      proxy: f,
      stateVersion: k
    }), f;
  }
  return $(
    o.getState().getNestedState(t, [])
  );
}
function Ct(t) {
  return gt(te, { proxy: t });
}
function Kt({
  proxy: t,
  rebuildStateShape: i
}) {
  const S = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(S) ? i(
    S,
    t._path
  ).stateMapNoRender(
    (I, k, w, v, s) => t._mapFn(I, k, w, v, s)
  ) : null;
}
function te({
  proxy: t
}) {
  const i = B(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return rt(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const I = g.parentElement, w = Array.from(I.childNodes).indexOf(g);
    let v = I.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, I.setAttribute("data-parent-id", v));
    const $ = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: w,
      effect: t._effect
    };
    o.getState().addSignalElement(S, $);
    const y = o.getState().getNestedState(t._stateKey, t._path);
    let r = y;
    if (t._effect)
      try {
        r = new Function(
          "state",
          `return (${t._effect})(state)`
        )(y);
      } catch (M) {
        console.error("Error evaluating effect function:", M);
      }
    r !== null && typeof r == "object" && (r = JSON.stringify(r));
    const h = document.createTextNode(String(r));
    g.replaceWith(h);
  }, [t._stateKey, t._path.join("."), t._effect]), gt("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function ye(t) {
  const i = Ft(
    (S) => {
      const g = o.getState().stateComponents.get(t._stateKey) || { components: /* @__PURE__ */ new Map() };
      return g.components.set(t._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), o.getState().stateComponents.set(t._stateKey, g), () => g.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return gt("text", {}, String(i));
}
function ee({
  stateKey: t,
  itemComponentId: i,
  itemPath: S,
  children: g
}) {
  const [, I] = lt({}), [k, w] = Ht(), v = B(null), s = B(null), $ = Et(
    (y) => {
      k(y), v.current = y;
    },
    [k]
  );
  return rt(() => {
    w.height > 0 && w.height !== s.current && (s.current = w.height, o.getState().setShadowMetadata(t, S, {
      virtualizer: { itemHeight: w.height, domRef: v.current }
    }));
  }, [w.height, t, S]), _t(() => {
    const y = `${t}////${i}`, r = o.getState().stateComponents.get(t) || { components: /* @__PURE__ */ new Map() };
    return r.components.set(y, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set([S.join(".")])
    }), o.getState().stateComponents.set(t, r), () => {
      const h = o.getState().stateComponents.get(t);
      h && h.components.delete(y);
    };
  }, [t, i, S.join(".")]), /* @__PURE__ */ $t("div", { ref: $, children: g });
}
export {
  Ct as $cogsSignal,
  ye as $cogsSignalStore,
  Se as addStateOptions,
  me as createCogsState,
  Ie as notifyComponent,
  Xt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
