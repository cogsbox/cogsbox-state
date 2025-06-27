"use client";
import { jsx as pt } from "react/jsx-runtime";
import { useState as it, useRef as q, useEffect as rt, useLayoutEffect as Ct, useMemo as Et, createElement as dt, useSyncExternalStore as Ft, startTransition as Dt, useCallback as St } from "react";
import { transformStateFunc as Lt, isDeepEqual as Y, isFunction as tt, getNestedValue as Z, getDifferences as Tt, debounce as Gt } from "./utility.js";
import { pushFunc as wt, updateFn as lt, cutFunc as ft, ValidationWrapper as _t, FormControlComponent as Wt } from "./Functions.jsx";
import Ht from "superjson";
import { v4 as At } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as bt } from "./store.js";
import { useCogsConfig as Rt } from "./CogsStateClient.jsx";
import { applyPatch as zt } from "fast-json-patch";
import Bt from "react-use-measure";
function Vt(t, i) {
  const f = r.getState().getInitialOptions, u = r.getState().setInitialStateOptions, h = f(t) || {};
  u(t, {
    ...h,
    ...i
  });
}
function $t({
  stateKey: t,
  options: i,
  initialOptionsPart: f
}) {
  const u = st(t) || {}, h = f[t] || {}, x = r.getState().setInitialStateOptions, p = { ...h, ...u };
  let y = !1;
  if (i)
    for (const s in i)
      p.hasOwnProperty(s) ? (s == "localStorage" && i[s] && p[s].key !== i[s]?.key && (y = !0, p[s] = i[s]), s == "initialState" && i[s] && p[s] !== i[s] && // Different references
      !Y(p[s], i[s]) && (y = !0, p[s] = i[s])) : (y = !0, p[s] = i[s]);
  y && x(t, p);
}
function fe(t, { formElements: i, validation: f }) {
  return { initialState: t, formElements: i, validation: f };
}
const Se = (t, i) => {
  let f = t;
  const [u, h] = Lt(f);
  (Object.keys(h).length > 0 || i && Object.keys(i).length > 0) && Object.keys(h).forEach((y) => {
    h[y] = h[y] || {}, h[y].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...h[y].formElements || {}
      // State-specific overrides
    }, st(y) || r.getState().setInitialStateOptions(y, h[y]);
  }), r.getState().setInitialStates(u), r.getState().setCreatedState(u);
  const x = (y, s) => {
    const [m] = it(s?.componentId ?? At());
    $t({
      stateKey: y,
      options: s,
      initialOptionsPart: h
    });
    const n = r.getState().cogsStateStore[y] || u[y], g = s?.modifyState ? s.modifyState(n) : n, [L, F] = Qt(
      g,
      {
        stateKey: y,
        syncUpdate: s?.syncUpdate,
        componentId: m,
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
    return F;
  };
  function p(y, s) {
    $t({ stateKey: y, options: s, initialOptionsPart: h }), s.localStorage && Zt(y, s), ut(y);
  }
  return { useCogsState: x, setCogsOptions: p };
}, {
  setUpdaterState: mt,
  setState: ot,
  getInitialOptions: st,
  getKeyState: Mt,
  getValidationErrors: qt,
  setStateLog: Jt,
  updateInitialStateGlobal: kt,
  addValidationError: Ot,
  removeValidationError: Q,
  setServerSyncActions: Yt
} = r.getState(), Nt = (t, i, f, u, h) => {
  f?.log && console.log(
    "saving to localstorage",
    i,
    f.localStorage?.key,
    u
  );
  const x = tt(f?.localStorage?.key) ? f.localStorage?.key(t) : f?.localStorage?.key;
  if (x && u) {
    const p = `${u}-${i}-${x}`;
    let y;
    try {
      y = yt(p)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: h ?? y
    }, m = Ht.serialize(s);
    window.localStorage.setItem(
      p,
      JSON.stringify(m.json)
    );
  }
}, yt = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Zt = (t, i) => {
  const f = r.getState().cogsStateStore[t], { sessionId: u } = Rt(), h = tt(i?.localStorage?.key) ? i.localStorage.key(f) : i?.localStorage?.key;
  if (h && u) {
    const x = yt(
      `${u}-${t}-${h}`
    );
    if (x && x.lastUpdated > (x.lastSyncedWithServer || 0))
      return ot(t, x.state), ut(t), !0;
  }
  return !1;
}, jt = (t, i, f, u, h, x) => {
  const p = {
    initialState: i,
    updaterState: ht(
      t,
      u,
      h,
      x
    ),
    state: f
  };
  kt(t, p.initialState), mt(t, p.updaterState), ot(t, p.state);
}, ut = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const f = /* @__PURE__ */ new Set();
  i.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || f.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    f.forEach((u) => u());
  });
}, me = (t, i) => {
  const f = r.getState().stateComponents.get(t);
  if (f) {
    const u = `${t}////${i}`, h = f.components.get(u);
    if ((h ? Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"] : null)?.includes("none"))
      return;
    h && h.forceUpdate();
  }
}, Xt = (t, i, f, u) => {
  switch (t) {
    case "update":
      return {
        oldValue: Z(i, u),
        newValue: Z(f, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: Z(f, u)
      };
    case "cut":
      return {
        oldValue: Z(i, u),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Qt(t, {
  stateKey: i,
  serverSync: f,
  localStorage: u,
  formElements: h,
  reactiveDeps: x,
  reactiveType: p,
  componentId: y,
  initialState: s,
  syncUpdate: m,
  dependencies: n,
  serverState: g
} = {}) {
  const [L, F] = it({}), { sessionId: D } = Rt();
  let H = !i;
  const [S] = it(i ?? At()), c = r.getState().stateLog[S], gt = q(/* @__PURE__ */ new Set()), et = q(y ?? At()), M = q(
    null
  );
  M.current = st(S) ?? null, rt(() => {
    if (m && m.stateKey === S && m.path?.[0]) {
      ot(S, (o) => ({
        ...o,
        [m.path[0]]: m.newValue
      }));
      const e = `${m.stateKey}:${m.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: m.timeStamp,
        userId: m.userId
      });
    }
  }, [m]), rt(() => {
    if (s) {
      Vt(S, {
        initialState: s
      });
      const e = M.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, d = r.getState().initialStateGlobal[S];
      if (!(d && !Y(d, s) || !d) && !a)
        return;
      let v = null;
      const T = tt(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      T && D && (v = yt(`${D}-${S}-${T}`));
      let E = s, k = !1;
      const C = a ? Date.now() : 0, $ = v?.lastUpdated || 0, R = v?.lastSyncedWithServer || 0;
      a && C > $ ? (E = e.serverState.data, k = !0) : v && $ > R && (E = v.state, e?.localStorage?.onChange && e?.localStorage?.onChange(E)), r.getState().initializeShadowState(S, s), jt(
        S,
        s,
        E,
        ct,
        et.current,
        D
      ), k && T && D && Nt(E, S, e, D, Date.now()), ut(S), (Array.isArray(p) ? p : [p || "component"]).includes("none") || F({});
    }
  }, [
    s,
    g?.status,
    g?.data,
    ...n || []
  ]), Ct(() => {
    H && Vt(S, {
      serverSync: f,
      formElements: h,
      initialState: s,
      localStorage: u,
      middleware: M.current?.middleware
    });
    const e = `${S}////${et.current}`, o = r.getState().stateComponents.get(S) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(e, {
      forceUpdate: () => F({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: x || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), r.getState().stateComponents.set(S, o), F({}), () => {
      o && (o.components.delete(e), o.components.size === 0 && r.getState().stateComponents.delete(S));
    };
  }, []);
  const ct = (e, o, a, d) => {
    if (Array.isArray(o)) {
      const v = `${S}-${o.join(".")}`;
      gt.current.add(v);
    }
    const w = r.getState();
    ot(S, (v) => {
      const T = tt(e) ? e(v) : e, E = `${S}-${o.join(".")}`;
      if (E) {
        let _ = !1, I = w.signalDomElements.get(E);
        if ((!I || I.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const O = o.slice(0, -1), N = Z(T, O);
          if (Array.isArray(N)) {
            _ = !0;
            const A = `${S}-${O.join(".")}`;
            I = w.signalDomElements.get(A);
          }
        }
        if (I) {
          const O = _ ? Z(T, o.slice(0, -1)) : Z(T, o);
          I.forEach(({ parentId: N, position: A, effect: j }) => {
            const U = document.querySelector(
              `[data-parent-id="${N}"]`
            );
            if (U) {
              const B = Array.from(U.childNodes);
              if (B[A]) {
                const G = j ? new Function("state", `return (${j})(state)`)(O) : O;
                B[A].textContent = String(G);
              }
            }
          });
        }
      }
      console.log("shadowState", w.shadowStateStore), a.updateType === "update" && (d || M.current?.validation?.key) && o && Q(
        (d || M.current?.validation?.key) + "." + o.join(".")
      );
      const k = o.slice(0, o.length - 1);
      a.updateType === "cut" && M.current?.validation?.key && Q(
        M.current?.validation?.key + "." + k.join(".")
      ), a.updateType === "insert" && M.current?.validation?.key && qt(
        M.current?.validation?.key + "." + k.join(".")
      ).filter(([I, O]) => {
        let N = I?.split(".").length;
        if (I == k.join(".") && N == k.length - 1) {
          let A = I + "." + k;
          Q(I), Ot(A, O);
        }
      });
      const C = w.stateComponents.get(S);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", C), C) {
        const _ = Tt(v, T), I = new Set(_), O = a.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          N,
          A
        ] of C.components.entries()) {
          let j = !1;
          const U = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (console.log("component", A), !U.includes("none")) {
            if (U.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if (U.includes("component") && ((A.paths.has(O) || A.paths.has("")) && (j = !0), !j))
              for (const B of I) {
                let G = B;
                for (; ; ) {
                  if (A.paths.has(G)) {
                    j = !0;
                    break;
                  }
                  const b = G.lastIndexOf(".");
                  if (b !== -1) {
                    const V = G.substring(
                      0,
                      b
                    );
                    if (!isNaN(
                      Number(G.substring(b + 1))
                    ) && A.paths.has(V)) {
                      j = !0;
                      break;
                    }
                    G = V;
                  } else
                    G = "";
                  if (G === "")
                    break;
                }
                if (j) break;
              }
            if (!j && U.includes("deps") && A.depsFunction) {
              const B = A.depsFunction(T);
              let G = !1;
              typeof B == "boolean" ? B && (G = !0) : Y(A.deps, B) || (A.deps = B, G = !0), G && (j = !0);
            }
            j && A.forceUpdate();
          }
        }
      }
      const $ = Date.now();
      o = o.map((_, I) => {
        const O = o.slice(0, -1), N = Z(T, O);
        return I === o.length - 1 && ["insert", "cut"].includes(a.updateType) ? (N.length - 1).toString() : _;
      });
      const { oldValue: R, newValue: z } = Xt(
        a.updateType,
        v,
        T,
        o
      ), K = {
        timeStamp: $,
        stateKey: S,
        path: o,
        updateType: a.updateType,
        status: "new",
        oldValue: R,
        newValue: z
      };
      switch (a.updateType) {
        case "update":
          w.updateShadowAtPath(S, o, T);
          break;
        case "insert":
          const _ = o.slice(0, -1);
          w.insertShadowArrayElement(S, _, z);
          break;
        case "cut":
          const I = o.slice(0, -1), O = parseInt(o[o.length - 1]);
          w.removeShadowArrayElement(S, I, O);
          break;
      }
      if (Jt(S, (_) => {
        const O = [..._ ?? [], K].reduce((N, A) => {
          const j = `${A.stateKey}:${JSON.stringify(A.path)}`, U = N.get(j);
          return U ? (U.timeStamp = Math.max(U.timeStamp, A.timeStamp), U.newValue = A.newValue, U.oldValue = U.oldValue ?? A.oldValue, U.updateType = A.updateType) : N.set(j, { ...A }), N;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), Nt(
        T,
        S,
        M.current,
        D
      ), M.current?.middleware && M.current.middleware({
        updateLog: c,
        update: K
      }), M.current?.serverSync) {
        const _ = w.serverState[S], I = M.current?.serverSync;
        Yt(S, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: T }),
          rollBackState: _,
          actionTimeStamp: Date.now() + (I.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  r.getState().updaterState[S] || (mt(
    S,
    ht(
      S,
      ct,
      et.current,
      D
    )
  ), r.getState().cogsStateStore[S] || ot(S, t), r.getState().initialStateGlobal[S] || kt(S, t));
  const l = Et(() => ht(
    S,
    ct,
    et.current,
    D
  ), [S, D]);
  return [Mt(S), l];
}
function ht(t, i, f, u) {
  const h = /* @__PURE__ */ new Map();
  let x = 0;
  const p = (m) => {
    const n = m.join(".");
    for (const [g] of h)
      (g === n || g.startsWith(n + ".")) && h.delete(g);
    x++;
  }, y = {
    removeValidation: (m) => {
      m?.validationKey && Q(m.validationKey);
    },
    revertToInitialState: (m) => {
      const n = r.getState().getInitialOptions(t)?.validation;
      n?.key && Q(n?.key), m?.validationKey && Q(m.validationKey);
      const g = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), h.clear(), x++;
      const L = s(g, []), F = st(t), D = tt(F?.localStorage?.key) ? F?.localStorage?.key(g) : F?.localStorage?.key, H = `${u}-${t}-${D}`;
      H && localStorage.removeItem(H), mt(t, L), ot(t, g);
      const S = r.getState().stateComponents.get(t);
      return S && S.components.forEach((c) => {
        c.forceUpdate();
      }), g;
    },
    updateInitialState: (m) => {
      h.clear(), x++;
      const n = ht(
        t,
        i,
        f,
        u
      ), g = r.getState().initialStateGlobal[t], L = st(t), F = tt(L?.localStorage?.key) ? L?.localStorage?.key(g) : L?.localStorage?.key, D = `${u}-${t}-${F}`;
      return localStorage.getItem(D) && localStorage.removeItem(D), Dt(() => {
        kt(t, m), r.getState().initializeShadowState(t, m), mt(t, n), ot(t, m);
        const H = r.getState().stateComponents.get(t);
        H && H.components.forEach((S) => {
          S.forceUpdate();
        });
      }), {
        fetchId: (H) => n.get()[H]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const m = r.getState().serverState[t];
      return !!(m && Y(m, Mt(t)));
    }
  };
  function s(m, n = [], g) {
    const L = n.map(String).join(".");
    h.get(L);
    const F = function() {
      return r().getNestedState(t, n);
    };
    Object.keys(y).forEach((S) => {
      F[S] = y[S];
    });
    const D = {
      apply(S, c, gt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, n);
      },
      get(S, c) {
        g?.validIndices && !Array.isArray(m) && (g = { ...g, validIndices: void 0 });
        const gt = /* @__PURE__ */ new Set([
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
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender" && !gt.has(c)) {
          const l = `${t}////${f}`, e = r.getState().stateComponents.get(t);
          if (e) {
            const o = e.components.get(l);
            if (o && !o.paths.has("")) {
              const a = n.join(".");
              let d = !0;
              for (const w of o.paths)
                if (a.startsWith(w) && (a === w || a[w.length] === ".")) {
                  d = !1;
                  break;
                }
              d && o.paths.add(a);
            }
          }
        }
        if (c === "getDifferences")
          return () => Tt(
            r.getState().cogsStateStore[t],
            r.getState().initialStateGlobal[t]
          );
        if (c === "sync" && n.length === 0)
          return async function() {
            const l = r.getState().getInitialOptions(t), e = l?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const o = r.getState().getNestedState(t, []), a = l?.validation?.key;
            try {
              const d = await e.action(o);
              if (d && !d.success && d.errors && a) {
                r.getState().removeValidationError(a), d.errors.forEach((v) => {
                  const T = [a, ...v.path].join(".");
                  r.getState().addValidationError(T, v.message);
                });
                const w = r.getState().stateComponents.get(t);
                w && w.components.forEach((v) => {
                  v.forceUpdate();
                });
              }
              return d?.success && e.onSuccess ? e.onSuccess(d.data) : !d?.success && e.onError && e.onError(d.error), d;
            } catch (d) {
              return e.onError && e.onError(d), { success: !1, error: d };
            }
          };
        if (c === "_status") {
          const l = r.getState().getNestedState(t, n), e = r.getState().initialStateGlobal[t], o = Z(e, n);
          return Y(l, o) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const l = r().getNestedState(
              t,
              n
            ), e = r.getState().initialStateGlobal[t], o = Z(e, n);
            return Y(l, o) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const l = r.getState().initialStateGlobal[t], e = st(t), o = tt(e?.localStorage?.key) ? e?.localStorage?.key(l) : e?.localStorage?.key, a = `${u}-${t}-${o}`;
            a && localStorage.removeItem(a);
          };
        if (c === "showValidationErrors")
          return () => {
            const l = r.getState().getInitialOptions(t)?.validation;
            if (!l?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(l.key + "." + n.join("."));
          };
        if (Array.isArray(m)) {
          const l = () => g?.validIndices ? m.map((o, a) => ({
            item: o,
            originalIndex: g.validIndices[a]
          })) : r.getState().getNestedState(t, n).map((o, a) => ({
            item: o,
            originalIndex: a
          }));
          if (c === "getSelected")
            return () => {
              const e = r.getState().getSelectedIndex(t, n.join("."));
              if (e !== void 0)
                return s(
                  m[e],
                  [...n, e.toString()],
                  g
                );
            };
          if (c === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: t, path: n });
            };
          if (c === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(t, n.join(".")) ?? -1;
          if (c === "useVirtualView")
            return (e) => {
              const {
                itemHeight: o = 50,
                overscan: a = 6,
                stickToBottom: d = !1,
                dependencies: w = []
              } = e, v = q(null), [T, E] = it({
                startIndex: 0,
                endIndex: 10
              }), [k, C] = it(0), $ = q(!0), R = q(!1), z = q(0), K = q(T);
              rt(() => r.getState().subscribeToShadowState(t, () => {
                C((V) => V + 1);
              }), [t]);
              const _ = r().getNestedState(
                t,
                n
              ), I = _.length, { totalHeight: O, positions: N } = Et(() => {
                const b = r.getState().getShadowMetadata(t, n) || [];
                let V = 0;
                const P = [];
                for (let W = 0; W < I; W++) {
                  P[W] = V;
                  const J = b[W]?.virtualizer?.itemHeight;
                  V += J || o;
                }
                return { totalHeight: V, positions: P };
              }, [
                I,
                t,
                n.join("."),
                o,
                k
              ]), A = Et(() => {
                const b = Math.max(0, T.startIndex), V = Math.min(I, T.endIndex), P = Array.from(
                  { length: V - b },
                  (J, at) => b + at
                ), W = P.map((J) => _[J]);
                return s(W, n, {
                  ...g,
                  validIndices: P
                });
              }, [T.startIndex, T.endIndex, _, I]), j = St(() => {
                const b = r.getState().getShadowMetadata(t, n) || [], V = I - 1;
                if (V >= 0) {
                  const P = b[V];
                  if (P?.virtualizer?.domRef) {
                    const W = P.virtualizer.domRef;
                    if (W && W.scrollIntoView)
                      return W.scrollIntoView({
                        behavior: "auto",
                        block: "end",
                        inline: "nearest"
                      }), !0;
                  }
                }
                return !1;
              }, [t, n, I]);
              rt(() => {
                if (!d || I === 0) return;
                const b = I > z.current, V = z.current === 0 && I > 0;
                if ((b || V) && $.current && !R.current) {
                  const P = Math.ceil(
                    (v.current?.clientHeight || 0) / o
                  ), W = {
                    startIndex: Math.max(
                      0,
                      I - P - a
                    ),
                    endIndex: I
                  };
                  E(W);
                  const J = setTimeout(() => {
                    B(I - 1, "smooth");
                  }, 50);
                  return () => clearTimeout(J);
                }
                z.current = I;
              }, [I, o, a]), rt(() => {
                const b = v.current;
                if (!b) return;
                const V = () => {
                  const { scrollTop: P, scrollHeight: W, clientHeight: J } = b, at = W - P - J;
                  $.current = at < 5, at > 100 && (R.current = !0), at < 5 && (R.current = !1);
                  let nt = 0;
                  for (let X = 0; X < N.length; X++)
                    if (N[X] > P - o * a) {
                      nt = Math.max(0, X - 1);
                      break;
                    }
                  let xt = nt;
                  const Ut = P + J;
                  for (let X = nt; X < N.length && !(N[X] > Ut + o * a); X++)
                    xt = X;
                  const vt = Math.max(0, nt), It = Math.min(
                    I,
                    xt + 1 + a
                  );
                  (vt !== K.current.startIndex || It !== K.current.endIndex) && (K.current = {
                    startIndex: vt,
                    endIndex: It
                  }, E({
                    startIndex: vt,
                    endIndex: It
                  }));
                };
                if (b.addEventListener("scroll", V, {
                  passive: !0
                }), d && I > 0 && !R.current) {
                  const { scrollTop: P } = b;
                  P === 0 && (b.scrollTop = b.scrollHeight, $.current = !0);
                }
                return V(), () => {
                  b.removeEventListener("scroll", V);
                };
              }, [N, I, o, a, d]);
              const U = St(() => {
                $.current = !0, R.current = !1, !j() && v.current && (v.current.scrollTop = v.current.scrollHeight);
              }, [j]), B = St(
                (b, V = "smooth") => {
                  const P = v.current;
                  if (!P) return;
                  if (b === I - 1) {
                    P.scrollTo({
                      top: P.scrollHeight,
                      behavior: V
                    });
                    return;
                  }
                  const nt = (r.getState().getShadowMetadata(t, n) || [])[b]?.virtualizer?.domRef;
                  nt ? nt.scrollIntoView({
                    behavior: V,
                    block: "center"
                  }) : N[b] !== void 0 && P.scrollTo({
                    top: N[b],
                    behavior: V
                  });
                },
                [N, t, n, I]
                // Add totalCount to the dependencies
              ), G = {
                outer: {
                  ref: v,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${O}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${N[T.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: A,
                virtualizerProps: G,
                scrollToBottom: U,
                scrollToIndex: B
              };
            };
          if (c === "stateMapNoRender")
            return (e) => m.map((a, d) => {
              let w;
              g?.validIndices && g.validIndices[d] !== void 0 ? w = g.validIndices[d] : w = d;
              const v = [...n, w.toString()], T = s(a, v, g);
              return e(
                a,
                T,
                d,
                m,
                s(m, n, g)
              );
            });
          if (c === "$stateMap")
            return (e) => dt(Kt, {
              proxy: {
                _stateKey: t,
                _path: n,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (c === "stateList")
            return (e, o) => {
              const a = r.getState().getNestedState(t, n);
              return Array.isArray(a) ? (g?.validIndices || Array.from({ length: a.length }, (w, v) => v)).map((w, v) => {
                const T = a[w], E = [...n, w.toString()], k = s(T, E, g), C = `${f}-${n.join(".")}-${w}`;
                return dt(ee, {
                  key: w,
                  stateKey: t,
                  itemComponentId: C,
                  formOpts: o,
                  itemPath: E,
                  children: e(
                    T,
                    k,
                    { localIndex: v, originalIndex: w },
                    a,
                    s(a, n, g)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (c === "stateFlattenOn")
            return (e) => {
              const o = m;
              h.clear(), x++;
              const a = o.flatMap(
                (d) => d[e] ?? []
              );
              return s(
                a,
                [...n, "[*]", e],
                g
              );
            };
          if (c === "index")
            return (e) => {
              const o = m[e];
              return s(o, [...n, e.toString()]);
            };
          if (c === "last")
            return () => {
              const e = r.getState().getNestedState(t, n);
              if (e.length === 0) return;
              const o = e.length - 1, a = e[o], d = [...n, o.toString()];
              return s(a, d);
            };
          if (c === "insert")
            return (e) => (p(n), wt(i, e, n, t), s(
              r.getState().getNestedState(t, n),
              n
            ));
          if (c === "uniqueInsert")
            return (e, o, a) => {
              const d = r.getState().getNestedState(t, n), w = tt(e) ? e(d) : e;
              let v = null;
              if (!d.some((E) => {
                if (o) {
                  const C = o.every(
                    ($) => Y(E[$], w[$])
                  );
                  return C && (v = E), C;
                }
                const k = Y(E, w);
                return k && (v = E), k;
              }))
                p(n), wt(i, w, n, t);
              else if (a && v) {
                const E = a(v), k = d.map(
                  (C) => Y(C, v) ? E : C
                );
                p(n), lt(i, k, n);
              }
            };
          if (c === "cut")
            return (e, o) => {
              if (!o?.waitForSync)
                return p(n), ft(i, n, t, e), s(
                  r.getState().getNestedState(t, n),
                  n
                );
            };
          if (c === "cutByValue")
            return (e) => {
              for (let o = 0; o < m.length; o++)
                m[o] === e && ft(i, n, t, o);
            };
          if (c === "toggleByValue")
            return (e) => {
              const o = m.findIndex((a) => a === e);
              o > -1 ? ft(i, n, t, o) : wt(i, e, n, t);
            };
          if (c === "stateFind")
            return (e) => {
              const a = l().find(
                ({ item: w }, v) => e(w, v)
              );
              if (!a) return;
              const d = [...n, a.originalIndex.toString()];
              return s(a.item, d, g);
            };
          if (c === "findWith")
            return (e, o) => {
              const d = l().find(
                ({ item: v }) => v[e] === o
              );
              if (!d) return;
              const w = [...n, d.originalIndex.toString()];
              return s(d.item, w, g);
            };
        }
        const et = n[n.length - 1];
        if (!isNaN(Number(et))) {
          const l = n.slice(0, -1), e = r.getState().getNestedState(t, l);
          if (Array.isArray(e) && c === "cut")
            return () => ft(
              i,
              l,
              t,
              Number(et)
            );
        }
        if (c === "get")
          return () => {
            if (g?.validIndices && Array.isArray(m)) {
              const l = r.getState().getNestedState(t, n);
              return g.validIndices.map((e) => l[e]);
            }
            return r.getState().getNestedState(t, n);
          };
        if (c === "$derive")
          return (l) => Pt({
            _stateKey: t,
            _path: n,
            _effect: l.toString()
          });
        if (c === "$get")
          return () => Pt({
            _stateKey: t,
            _path: n
          });
        if (c === "lastSynced") {
          const l = `${t}:${n.join(".")}`;
          return r.getState().getSyncInfo(l);
        }
        if (c == "getLocalStorage")
          return (l) => yt(u + "-" + t + "-" + l);
        if (c === "_selected") {
          const l = n.slice(0, -1), e = l.join("."), o = r.getState().getNestedState(t, l);
          return Array.isArray(o) ? Number(n[n.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (c === "setSelected")
          return (l) => {
            const e = n.slice(0, -1), o = Number(n[n.length - 1]), a = e.join(".");
            l ? r.getState().setSelectedIndex(t, a, o) : r.getState().setSelectedIndex(t, a, void 0);
            const d = r.getState().getNestedState(t, [...e]);
            lt(i, d, e), p(e);
          };
        if (c === "toggleSelected")
          return () => {
            const l = n.slice(0, -1), e = Number(n[n.length - 1]), o = l.join("."), a = r.getState().getSelectedIndex(t, o);
            r.getState().setSelectedIndex(
              t,
              o,
              a === e ? void 0 : e
            );
            const d = r.getState().getNestedState(t, [...l]);
            lt(i, d, l), p(l);
          };
        if (n.length == 0) {
          if (c === "addValidation")
            return (l) => {
              const e = r.getState().getInitialOptions(t)?.validation;
              if (!e?.key)
                throw new Error("Validation key not found");
              Q(e.key), console.log("addValidationError", l), l.forEach((o) => {
                const a = [e.key, ...o.path].join(".");
                console.log("fullErrorPath", a), Ot(a, o.message);
              }), ut(t);
            };
          if (c === "applyJsonPatch")
            return (l) => {
              const e = r.getState().cogsStateStore[t], a = zt(e, l).newDocument;
              jt(
                t,
                r.getState().initialStateGlobal[t],
                a,
                i,
                f,
                u
              );
              const d = r.getState().stateComponents.get(t);
              if (d) {
                const w = Tt(e, a), v = new Set(w);
                for (const [
                  T,
                  E
                ] of d.components.entries()) {
                  let k = !1;
                  const C = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
                  if (!C.includes("none")) {
                    if (C.includes("all")) {
                      E.forceUpdate();
                      continue;
                    }
                    if (C.includes("component") && (E.paths.has("") && (k = !0), !k))
                      for (const $ of v) {
                        if (E.paths.has($)) {
                          k = !0;
                          break;
                        }
                        let R = $.lastIndexOf(".");
                        for (; R !== -1; ) {
                          const z = $.substring(0, R);
                          if (E.paths.has(z)) {
                            k = !0;
                            break;
                          }
                          const K = $.substring(
                            R + 1
                          );
                          if (!isNaN(Number(K))) {
                            const _ = z.lastIndexOf(".");
                            if (_ !== -1) {
                              const I = z.substring(
                                0,
                                _
                              );
                              if (E.paths.has(I)) {
                                k = !0;
                                break;
                              }
                            }
                          }
                          R = z.lastIndexOf(".");
                        }
                        if (k) break;
                      }
                    if (!k && C.includes("deps") && E.depsFunction) {
                      const $ = E.depsFunction(a);
                      let R = !1;
                      typeof $ == "boolean" ? $ && (R = !0) : Y(E.deps, $) || (E.deps = $, R = !0), R && (k = !0);
                    }
                    k && E.forceUpdate();
                  }
                }
              }
            };
          if (c === "validateZodSchema")
            return () => {
              const l = r.getState().getInitialOptions(t)?.validation, e = r.getState().addValidationError;
              if (!l?.zodSchema)
                throw new Error("Zod schema not found");
              if (!l?.key)
                throw new Error("Validation key not found");
              Q(l.key);
              const o = r.getState().cogsStateStore[t];
              try {
                const a = r.getState().getValidationErrors(l.key);
                a && a.length > 0 && a.forEach(([w]) => {
                  w && w.startsWith(l.key) && Q(w);
                });
                const d = l.zodSchema.safeParse(o);
                return d.success ? !0 : (d.error.errors.forEach((v) => {
                  const T = v.path, E = v.message, k = [l.key, ...T].join(".");
                  e(k, E);
                }), ut(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (c === "_componentId") return f;
          if (c === "getComponents")
            return () => r().stateComponents.get(t);
          if (c === "getAllFormRefs")
            return () => bt.getState().getFormRefsByStateKey(t);
          if (c === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (c === "_serverState")
            return r.getState().serverState[t];
          if (c === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (c === "revertToInitialState")
            return y.revertToInitialState;
          if (c === "updateInitialState") return y.updateInitialState;
          if (c === "removeValidation") return y.removeValidation;
        }
        if (c === "getFormRef")
          return () => bt.getState().getFormRef(t + "." + n.join("."));
        if (c === "validationWrapper")
          return ({
            children: l,
            hideMessage: e
          }) => /* @__PURE__ */ pt(
            _t,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              stateKey: t,
              validIndices: g?.validIndices,
              children: l
            }
          );
        if (c === "_stateKey") return t;
        if (c === "_path") return n;
        if (c === "_isServerSynced") return y._isServerSynced;
        if (c === "update")
          return (l, e) => {
            if (e?.debounce)
              Gt(() => {
                lt(i, l, n, "");
                const o = r.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(o);
              }, e.debounce);
            else {
              lt(i, l, n, "");
              const o = r.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(o);
            }
            p(n);
          };
        if (c === "formElement")
          return (l, e) => /* @__PURE__ */ pt(
            Wt,
            {
              setState: i,
              stateKey: t,
              path: n,
              child: l,
              formOpts: e
            }
          );
        const M = [...n, c], ct = r.getState().getNestedState(t, M);
        return s(ct, M, g);
      }
    }, H = new Proxy(F, D);
    return h.set(L, {
      proxy: H,
      stateVersion: x
    }), H;
  }
  return s(
    r.getState().getNestedState(t, [])
  );
}
function Pt(t) {
  return dt(te, { proxy: t });
}
function Kt({
  proxy: t,
  rebuildStateShape: i
}) {
  const f = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(f) ? i(
    f,
    t._path
  ).stateMapNoRender(
    (h, x, p, y, s) => t._mapFn(h, x, p, y, s)
  ) : null;
}
function te({
  proxy: t
}) {
  const i = q(null), f = `${t._stateKey}-${t._path.join(".")}`;
  return rt(() => {
    const u = i.current;
    if (!u || !u.parentElement) return;
    const h = u.parentElement, p = Array.from(h.childNodes).indexOf(u);
    let y = h.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, h.setAttribute("data-parent-id", y));
    const m = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: p,
      effect: t._effect
    };
    r.getState().addSignalElement(f, m);
    const n = r.getState().getNestedState(t._stateKey, t._path);
    let g;
    if (t._effect)
      try {
        g = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (F) {
        console.error("Error evaluating effect function during mount:", F), g = n;
      }
    else
      g = n;
    g !== null && typeof g == "object" && (g = JSON.stringify(g));
    const L = document.createTextNode(String(g));
    u.replaceWith(L);
  }, [t._stateKey, t._path.join("."), t._effect]), dt("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": f
  });
}
function he(t) {
  const i = Ft(
    (f) => {
      const u = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(t._stateKey, {
        forceUpdate: f,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => u.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return dt("text", {}, String(i));
}
function ee({
  stateKey: t,
  itemComponentId: i,
  itemPath: f,
  formOpts: u,
  children: h
}) {
  const [, x] = it({}), [p, y] = Bt(), s = q(null), m = q(null);
  return St(
    (n) => {
      p(n), s.current = n;
    },
    [p]
  ), rt(() => {
    y.height > 0 && y.height !== m.current && (m.current = y.height, r.getState().setShadowMetadata(t, f, {
      virtualizer: {
        itemHeight: y.height,
        domRef: s.current
        // Store the actual DOM element reference
      }
    }));
  }, [y.height, t, f]), Ct(() => {
    const n = `${t}////${i}`, g = r.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return g.components.set(n, {
      forceUpdate: () => x({}),
      paths: /* @__PURE__ */ new Set([f.join(".")])
    }), r.getState().stateComponents.set(t, g), () => {
      const L = r.getState().stateComponents.get(t);
      L && L.components.delete(n);
    };
  }, [t, i, f.join(".")]), /* @__PURE__ */ pt(_t, { formOpts: u, path: f, stateKey: t, children: h });
}
export {
  Pt as $cogsSignal,
  he as $cogsSignalStore,
  fe as addStateOptions,
  Se as createCogsState,
  me as notifyComponent,
  Qt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
