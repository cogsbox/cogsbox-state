"use client";
import { jsx as pt } from "react/jsx-runtime";
import { useState as it, useRef as q, useEffect as rt, useLayoutEffect as Ct, useMemo as Et, createElement as dt, useSyncExternalStore as Ut, startTransition as Ft, useCallback as St } from "react";
import { transformStateFunc as Dt, isDeepEqual as Y, isFunction as tt, getNestedValue as Z, getDifferences as Tt, debounce as Lt } from "./utility.js";
import { pushFunc as wt, updateFn as lt, cutFunc as gt, ValidationWrapper as Gt, FormControlComponent as Wt } from "./Functions.jsx";
import Ht from "superjson";
import { v4 as At } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as bt } from "./store.js";
import { useCogsConfig as _t } from "./CogsStateClient.jsx";
import { applyPatch as zt } from "fast-json-patch";
import Bt from "react-use-measure";
function Vt(t, i) {
  const S = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, h = S(t) || {};
  f(t, {
    ...h,
    ...i
  });
}
function $t({
  stateKey: t,
  options: i,
  initialOptionsPart: S
}) {
  const f = st(t) || {}, h = S[t] || {}, x = r.getState().setInitialStateOptions, p = { ...h, ...f };
  let y = !1;
  if (i)
    for (const s in i)
      p.hasOwnProperty(s) ? (s == "localStorage" && i[s] && p[s].key !== i[s]?.key && (y = !0, p[s] = i[s]), s == "initialState" && i[s] && p[s] !== i[s] && // Different references
      !Y(p[s], i[s]) && (y = !0, p[s] = i[s])) : (y = !0, p[s] = i[s]);
  y && x(t, p);
}
function ge(t, { formElements: i, validation: S }) {
  return { initialState: t, formElements: i, validation: S };
}
const Se = (t, i) => {
  let S = t;
  const [f, h] = Dt(S);
  (Object.keys(h).length > 0 || i && Object.keys(i).length > 0) && Object.keys(h).forEach((y) => {
    h[y] = h[y] || {}, h[y].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...h[y].formElements || {}
      // State-specific overrides
    }, st(y) || r.getState().setInitialStateOptions(y, h[y]);
  }), r.getState().setInitialStates(f), r.getState().setCreatedState(f);
  const x = (y, s) => {
    const [m] = it(s?.componentId ?? At());
    $t({
      stateKey: y,
      options: s,
      initialOptionsPart: h
    });
    const n = r.getState().cogsStateStore[y] || f[y], u = s?.modifyState ? s.modifyState(n) : n, [L, R] = Qt(
      u,
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
    return R;
  };
  function p(y, s) {
    $t({ stateKey: y, options: s, initialOptionsPart: h }), s.localStorage && Zt(y, s), ut(y);
  }
  return { useCogsState: x, setCogsOptions: p };
}, {
  setUpdaterState: mt,
  setState: ot,
  getInitialOptions: st,
  getKeyState: Rt,
  getValidationErrors: qt,
  setStateLog: Jt,
  updateInitialStateGlobal: kt,
  addValidationError: Mt,
  removeValidationError: Q,
  setServerSyncActions: Yt
} = r.getState(), Nt = (t, i, S, f, h) => {
  S?.log && console.log(
    "saving to localstorage",
    i,
    S.localStorage?.key,
    f
  );
  const x = tt(S?.localStorage?.key) ? S.localStorage?.key(t) : S?.localStorage?.key;
  if (x && f) {
    const p = `${f}-${i}-${x}`;
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
  const S = r.getState().cogsStateStore[t], { sessionId: f } = _t(), h = tt(i?.localStorage?.key) ? i.localStorage.key(S) : i?.localStorage?.key;
  if (h && f) {
    const x = yt(
      `${f}-${t}-${h}`
    );
    if (x && x.lastUpdated > (x.lastSyncedWithServer || 0))
      return ot(t, x.state), ut(t), !0;
  }
  return !1;
}, Ot = (t, i, S, f, h, x) => {
  const p = {
    initialState: i,
    updaterState: ht(
      t,
      f,
      h,
      x
    ),
    state: S
  };
  kt(t, p.initialState), mt(t, p.updaterState), ot(t, p.state);
}, ut = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const S = /* @__PURE__ */ new Set();
  i.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || S.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((f) => f());
  });
}, me = (t, i) => {
  const S = r.getState().stateComponents.get(t);
  if (S) {
    const f = `${t}////${i}`, h = S.components.get(f);
    if ((h ? Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"] : null)?.includes("none"))
      return;
    h && h.forceUpdate();
  }
}, Xt = (t, i, S, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: Z(i, f),
        newValue: Z(S, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: Z(S, f)
      };
    case "cut":
      return {
        oldValue: Z(i, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Qt(t, {
  stateKey: i,
  serverSync: S,
  localStorage: f,
  formElements: h,
  reactiveDeps: x,
  reactiveType: p,
  componentId: y,
  initialState: s,
  syncUpdate: m,
  dependencies: n,
  serverState: u
} = {}) {
  const [L, R] = it({}), { sessionId: D } = _t();
  let H = !i;
  const [g] = it(i ?? At()), c = r.getState().stateLog[g], ft = q(/* @__PURE__ */ new Set()), et = q(y ?? At()), O = q(
    null
  );
  O.current = st(g) ?? null, rt(() => {
    if (m && m.stateKey === g && m.path?.[0]) {
      ot(g, (o) => ({
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
      Vt(g, {
        initialState: s
      });
      const e = O.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, d = r.getState().initialStateGlobal[g];
      if (!(d && !Y(d, s) || !d) && !a)
        return;
      let v = null;
      const T = tt(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      T && D && (v = yt(`${D}-${g}-${T}`));
      let E = s, k = !1;
      const C = a ? Date.now() : 0, $ = v?.lastUpdated || 0, M = v?.lastSyncedWithServer || 0;
      a && C > $ ? (E = e.serverState.data, k = !0) : v && $ > M && (E = v.state, e?.localStorage?.onChange && e?.localStorage?.onChange(E)), r.getState().initializeShadowState(g, s), Ot(
        g,
        s,
        E,
        ct,
        et.current,
        D
      ), k && T && D && Nt(E, g, e, D, Date.now()), ut(g), (Array.isArray(p) ? p : [p || "component"]).includes("none") || R({});
    }
  }, [
    s,
    u?.status,
    u?.data,
    ...n || []
  ]), Ct(() => {
    H && Vt(g, {
      serverSync: S,
      formElements: h,
      initialState: s,
      localStorage: f,
      middleware: O.current?.middleware
    });
    const e = `${g}////${et.current}`, o = r.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(e, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: x || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), r.getState().stateComponents.set(g, o), R({}), () => {
      o && (o.components.delete(e), o.components.size === 0 && r.getState().stateComponents.delete(g));
    };
  }, []);
  const ct = (e, o, a, d) => {
    if (Array.isArray(o)) {
      const v = `${g}-${o.join(".")}`;
      ft.current.add(v);
    }
    const w = r.getState();
    ot(g, (v) => {
      const T = tt(e) ? e(v) : e, E = `${g}-${o.join(".")}`;
      if (E) {
        let _ = !1, I = w.signalDomElements.get(E);
        if ((!I || I.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const j = o.slice(0, -1), N = Z(T, j);
          if (Array.isArray(N)) {
            _ = !0;
            const A = `${g}-${j.join(".")}`;
            I = w.signalDomElements.get(A);
          }
        }
        if (I) {
          const j = _ ? Z(T, o.slice(0, -1)) : Z(T, o);
          I.forEach(({ parentId: N, position: A, effect: U }) => {
            const F = document.querySelector(
              `[data-parent-id="${N}"]`
            );
            if (F) {
              const B = Array.from(F.childNodes);
              if (B[A]) {
                const G = U ? new Function("state", `return (${U})(state)`)(j) : j;
                B[A].textContent = String(G);
              }
            }
          });
        }
      }
      console.log("shadowState", w.shadowStateStore), a.updateType === "update" && (d || O.current?.validation?.key) && o && Q(
        (d || O.current?.validation?.key) + "." + o.join(".")
      );
      const k = o.slice(0, o.length - 1);
      a.updateType === "cut" && O.current?.validation?.key && Q(
        O.current?.validation?.key + "." + k.join(".")
      ), a.updateType === "insert" && O.current?.validation?.key && qt(
        O.current?.validation?.key + "." + k.join(".")
      ).filter(([I, j]) => {
        let N = I?.split(".").length;
        if (I == k.join(".") && N == k.length - 1) {
          let A = I + "." + k;
          Q(I), Mt(A, j);
        }
      });
      const C = w.stateComponents.get(g);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", C), C) {
        const _ = Tt(v, T), I = new Set(_), j = a.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          N,
          A
        ] of C.components.entries()) {
          let U = !1;
          const F = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (console.log("component", A), !F.includes("none")) {
            if (F.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if (F.includes("component") && ((A.paths.has(j) || A.paths.has("")) && (U = !0), !U))
              for (const B of I) {
                let G = B;
                for (; ; ) {
                  if (A.paths.has(G)) {
                    U = !0;
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
                      U = !0;
                      break;
                    }
                    G = V;
                  } else
                    G = "";
                  if (G === "")
                    break;
                }
                if (U) break;
              }
            if (!U && F.includes("deps") && A.depsFunction) {
              const B = A.depsFunction(T);
              let G = !1;
              typeof B == "boolean" ? B && (G = !0) : Y(A.deps, B) || (A.deps = B, G = !0), G && (U = !0);
            }
            U && A.forceUpdate();
          }
        }
      }
      const $ = Date.now();
      o = o.map((_, I) => {
        const j = o.slice(0, -1), N = Z(T, j);
        return I === o.length - 1 && ["insert", "cut"].includes(a.updateType) ? (N.length - 1).toString() : _;
      });
      const { oldValue: M, newValue: z } = Xt(
        a.updateType,
        v,
        T,
        o
      ), K = {
        timeStamp: $,
        stateKey: g,
        path: o,
        updateType: a.updateType,
        status: "new",
        oldValue: M,
        newValue: z
      };
      switch (a.updateType) {
        case "update":
          w.updateShadowAtPath(g, o, T);
          break;
        case "insert":
          const _ = o.slice(0, -1);
          w.insertShadowArrayElement(g, _, z);
          break;
        case "cut":
          const I = o.slice(0, -1), j = parseInt(o[o.length - 1]);
          w.removeShadowArrayElement(g, I, j);
          break;
      }
      if (Jt(g, (_) => {
        const j = [..._ ?? [], K].reduce((N, A) => {
          const U = `${A.stateKey}:${JSON.stringify(A.path)}`, F = N.get(U);
          return F ? (F.timeStamp = Math.max(F.timeStamp, A.timeStamp), F.newValue = A.newValue, F.oldValue = F.oldValue ?? A.oldValue, F.updateType = A.updateType) : N.set(U, { ...A }), N;
        }, /* @__PURE__ */ new Map());
        return Array.from(j.values());
      }), Nt(
        T,
        g,
        O.current,
        D
      ), O.current?.middleware && O.current.middleware({
        updateLog: c,
        update: K
      }), O.current?.serverSync) {
        const _ = w.serverState[g], I = O.current?.serverSync;
        Yt(g, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: T }),
          rollBackState: _,
          actionTimeStamp: Date.now() + (I.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  r.getState().updaterState[g] || (mt(
    g,
    ht(
      g,
      ct,
      et.current,
      D
    )
  ), r.getState().cogsStateStore[g] || ot(g, t), r.getState().initialStateGlobal[g] || kt(g, t));
  const l = Et(() => ht(
    g,
    ct,
    et.current,
    D
  ), [g, D]);
  return [Rt(g), l];
}
function ht(t, i, S, f) {
  const h = /* @__PURE__ */ new Map();
  let x = 0;
  const p = (m) => {
    const n = m.join(".");
    for (const [u] of h)
      (u === n || u.startsWith(n + ".")) && h.delete(u);
    x++;
  }, y = {
    removeValidation: (m) => {
      m?.validationKey && Q(m.validationKey);
    },
    revertToInitialState: (m) => {
      const n = r.getState().getInitialOptions(t)?.validation;
      n?.key && Q(n?.key), m?.validationKey && Q(m.validationKey);
      const u = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), h.clear(), x++;
      const L = s(u, []), R = st(t), D = tt(R?.localStorage?.key) ? R?.localStorage?.key(u) : R?.localStorage?.key, H = `${f}-${t}-${D}`;
      H && localStorage.removeItem(H), mt(t, L), ot(t, u);
      const g = r.getState().stateComponents.get(t);
      return g && g.components.forEach((c) => {
        c.forceUpdate();
      }), u;
    },
    updateInitialState: (m) => {
      h.clear(), x++;
      const n = ht(
        t,
        i,
        S,
        f
      ), u = r.getState().initialStateGlobal[t], L = st(t), R = tt(L?.localStorage?.key) ? L?.localStorage?.key(u) : L?.localStorage?.key, D = `${f}-${t}-${R}`;
      return localStorage.getItem(D) && localStorage.removeItem(D), Ft(() => {
        kt(t, m), r.getState().initializeShadowState(t, m), mt(t, n), ot(t, m);
        const H = r.getState().stateComponents.get(t);
        H && H.components.forEach((g) => {
          g.forceUpdate();
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
      return !!(m && Y(m, Rt(t)));
    }
  };
  function s(m, n = [], u) {
    const L = n.map(String).join(".");
    h.get(L);
    const R = function() {
      return r().getNestedState(t, n);
    };
    Object.keys(y).forEach((g) => {
      R[g] = y[g];
    });
    const D = {
      apply(g, c, ft) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, n);
      },
      get(g, c) {
        u?.validIndices && !Array.isArray(m) && (u = { ...u, validIndices: void 0 });
        const ft = /* @__PURE__ */ new Set([
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
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender" && !ft.has(c)) {
          const l = `${t}////${S}`, e = r.getState().stateComponents.get(t);
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
            const l = r.getState().initialStateGlobal[t], e = st(t), o = tt(e?.localStorage?.key) ? e?.localStorage?.key(l) : e?.localStorage?.key, a = `${f}-${t}-${o}`;
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
          const l = () => u?.validIndices ? m.map((o, a) => ({
            item: o,
            originalIndex: u.validIndices[a]
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
                  u
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
              }), [k, C] = it(0), $ = q(!0), M = q(!1), z = q(0), K = q(T);
              rt(() => r.getState().subscribeToShadowState(t, () => {
                C((V) => V + 1);
              }), [t]);
              const _ = r().getNestedState(
                t,
                n
              ), I = _.length, { totalHeight: j, positions: N } = Et(() => {
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
                  ...u,
                  validIndices: P
                });
              }, [T.startIndex, T.endIndex, _, I]), U = St(() => {
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
                if ((b || V) && $.current && !M.current) {
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
                  $.current = at < 5, at > 100 && (M.current = !0), at < 5 && (M.current = !1);
                  let nt = 0;
                  for (let X = 0; X < N.length; X++)
                    if (N[X] > P - o * a) {
                      nt = Math.max(0, X - 1);
                      break;
                    }
                  let xt = nt;
                  const jt = P + J;
                  for (let X = nt; X < N.length && !(N[X] > jt + o * a); X++)
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
                }), d && I > 0 && !M.current) {
                  const { scrollTop: P } = b;
                  P === 0 && (b.scrollTop = b.scrollHeight, $.current = !0);
                }
                return V(), () => {
                  b.removeEventListener("scroll", V);
                };
              }, [N, I, o, a, d]);
              const F = St(() => {
                $.current = !0, M.current = !1, !U() && v.current && (v.current.scrollTop = v.current.scrollHeight);
              }, [U]), B = St(
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
                    height: `${j}px`,
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
                scrollToBottom: F,
                scrollToIndex: B
              };
            };
          if (c === "stateMapNoRender")
            return (e) => m.map((a, d) => {
              let w;
              u?.validIndices && u.validIndices[d] !== void 0 ? w = u.validIndices[d] : w = d;
              const v = [...n, w.toString()], T = s(a, v, u);
              return e(
                a,
                T,
                d,
                m,
                s(m, n, u)
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
              return Array.isArray(a) ? (u?.validIndices || Array.from({ length: a.length }, (w, v) => v)).map((w, v) => {
                const T = a[w], E = [...n, w.toString()], k = s(T, E, u), C = `${S}-${n.join(".")}-${w}`;
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
                    s(a, n, u)
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
                u
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
                return p(n), gt(i, n, t, e), s(
                  r.getState().getNestedState(t, n),
                  n
                );
            };
          if (c === "cutByValue")
            return (e) => {
              for (let o = 0; o < m.length; o++)
                m[o] === e && gt(i, n, t, o);
            };
          if (c === "toggleByValue")
            return (e) => {
              const o = m.findIndex((a) => a === e);
              o > -1 ? gt(i, n, t, o) : wt(i, e, n, t);
            };
          if (c === "stateFind")
            return (e) => {
              const a = l().find(
                ({ item: w }, v) => e(w, v)
              );
              if (!a) return;
              const d = [...n, a.originalIndex.toString()];
              return s(a.item, d, u);
            };
          if (c === "findWith")
            return (e, o) => {
              const d = l().find(
                ({ item: v }) => v[e] === o
              );
              if (!d) return;
              const w = [...n, d.originalIndex.toString()];
              return s(d.item, w, u);
            };
        }
        const et = n[n.length - 1];
        if (!isNaN(Number(et))) {
          const l = n.slice(0, -1), e = r.getState().getNestedState(t, l);
          if (Array.isArray(e) && c === "cut")
            return () => gt(
              i,
              l,
              t,
              Number(et)
            );
        }
        if (c === "get")
          return () => {
            if (u?.validIndices && Array.isArray(m)) {
              const l = r.getState().getNestedState(t, n);
              return u.validIndices.map((e) => l[e]);
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
          return (l) => yt(f + "-" + t + "-" + l);
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
                console.log("fullErrorPath", a), Mt(a, o.message);
              }), ut(t);
            };
          if (c === "applyJsonPatch")
            return (l) => {
              const e = r.getState().cogsStateStore[t], a = zt(e, l).newDocument;
              Ot(
                t,
                r.getState().initialStateGlobal[t],
                a,
                i,
                S,
                f
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
                        let M = $.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const z = $.substring(0, M);
                          if (E.paths.has(z)) {
                            k = !0;
                            break;
                          }
                          const K = $.substring(
                            M + 1
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
                          M = z.lastIndexOf(".");
                        }
                        if (k) break;
                      }
                    if (!k && C.includes("deps") && E.depsFunction) {
                      const $ = E.depsFunction(a);
                      let M = !1;
                      typeof $ == "boolean" ? $ && (M = !0) : Y(E.deps, $) || (E.deps = $, M = !0), M && (k = !0);
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
          if (c === "_componentId") return S;
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
            Gt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              stateKey: t,
              validIndices: u?.validIndices,
              children: l
            }
          );
        if (c === "_stateKey") return t;
        if (c === "_path") return n;
        if (c === "_isServerSynced") return y._isServerSynced;
        if (c === "update")
          return (l, e) => {
            if (e?.debounce)
              Lt(() => {
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
        const O = [...n, c], ct = r.getState().getNestedState(t, O);
        return s(ct, O, u);
      }
    }, H = new Proxy(R, D);
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
  const S = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(S) ? i(
    S,
    t._path
  ).stateMapNoRender(
    (h, x, p, y, s) => t._mapFn(h, x, p, y, s)
  ) : null;
}
function te({
  proxy: t
}) {
  const i = q(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return rt(() => {
    const f = i.current;
    if (!f || !f.parentElement) return;
    const h = f.parentElement, p = Array.from(h.childNodes).indexOf(f);
    let y = h.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, h.setAttribute("data-parent-id", y));
    const m = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: p,
      effect: t._effect
    };
    r.getState().addSignalElement(S, m);
    const n = r.getState().getNestedState(t._stateKey, t._path);
    let u;
    if (t._effect)
      try {
        u = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (R) {
        console.error("Error evaluating effect function during mount:", R), u = n;
      }
    else
      u = n;
    u !== null && typeof u == "object" && (u = JSON.stringify(u));
    const L = document.createTextNode(String(u));
    f.replaceWith(L);
  }, [t._stateKey, t._path.join("."), t._effect]), dt("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function he(t) {
  const i = Ut(
    (S) => {
      const f = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(t._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => f.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return dt("text", {}, String(i));
}
function ee({
  stateKey: t,
  itemComponentId: i,
  itemPath: S,
  formOpts: f,
  children: h
}) {
  const [, x] = it({}), [p, y] = Bt(), s = q(null), m = q(null), n = St(
    (u) => {
      p(u), s.current = u;
    },
    [p]
  );
  return rt(() => {
    y.height > 0 && y.height !== m.current && (m.current = y.height, r.getState().setShadowMetadata(t, S, {
      virtualizer: {
        itemHeight: y.height,
        domRef: s.current
        // Store the actual DOM element reference
      }
    }));
  }, [y.height, t, S]), Ct(() => {
    const u = `${t}////${i}`, L = r.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return L.components.set(u, {
      forceUpdate: () => x({}),
      paths: /* @__PURE__ */ new Set([S.join(".")])
    }), r.getState().stateComponents.set(t, L), () => {
      const R = r.getState().stateComponents.get(t);
      R && R.components.delete(u);
    };
  }, [t, i, S.join(".")]), /* @__PURE__ */ pt("div", { ref: n, children: h });
}
export {
  Pt as $cogsSignal,
  he as $cogsSignalStore,
  ge as addStateOptions,
  Se as createCogsState,
  me as notifyComponent,
  Qt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
