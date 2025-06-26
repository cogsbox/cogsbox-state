"use client";
import { jsx as pt } from "react/jsx-runtime";
import { useState as it, useRef as q, useEffect as rt, useLayoutEffect as Ct, useMemo as Et, createElement as dt, useSyncExternalStore as Ut, startTransition as Ft, useCallback as St } from "react";
import { transformStateFunc as Dt, isDeepEqual as Y, isFunction as tt, getNestedValue as Z, getDifferences as Tt, debounce as Lt } from "./utility.js";
import { pushFunc as wt, updateFn as lt, cutFunc as ft, ValidationWrapper as Gt, FormControlComponent as Wt } from "./Functions.jsx";
import Ht from "superjson";
import { v4 as kt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as bt } from "./store.js";
import { useCogsConfig as _t } from "./CogsStateClient.jsx";
import { applyPatch as zt } from "fast-json-patch";
import Bt from "react-use-measure";
function Vt(t, i) {
  const S = o.getState().getInitialOptions, u = o.getState().setInitialStateOptions, h = S(t) || {};
  u(t, {
    ...h,
    ...i
  });
}
function $t({
  stateKey: t,
  options: i,
  initialOptionsPart: S
}) {
  const u = st(t) || {}, h = S[t] || {}, x = o.getState().setInitialStateOptions, w = { ...h, ...u };
  let I = !1;
  if (i)
    for (const s in i)
      w.hasOwnProperty(s) ? (s == "localStorage" && i[s] && w[s].key !== i[s]?.key && (I = !0, w[s] = i[s]), s == "initialState" && i[s] && w[s] !== i[s] && // Different references
      !Y(w[s], i[s]) && (I = !0, w[s] = i[s])) : (I = !0, w[s] = i[s]);
  I && x(t, w);
}
function fe(t, { formElements: i, validation: S }) {
  return { initialState: t, formElements: i, validation: S };
}
const Se = (t, i) => {
  let S = t;
  const [u, h] = Dt(S);
  (Object.keys(h).length > 0 || i && Object.keys(i).length > 0) && Object.keys(h).forEach((I) => {
    h[I] = h[I] || {}, h[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...h[I].formElements || {}
      // State-specific overrides
    }, st(I) || o.getState().setInitialStateOptions(I, h[I]);
  }), o.getState().setInitialStates(u), o.getState().setCreatedState(u);
  const x = (I, s) => {
    const [m] = it(s?.componentId ?? kt());
    $t({
      stateKey: I,
      options: s,
      initialOptionsPart: h
    });
    const n = o.getState().cogsStateStore[I] || u[I], g = s?.modifyState ? s.modifyState(n) : n, [L, F] = Qt(
      g,
      {
        stateKey: I,
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
  function w(I, s) {
    $t({ stateKey: I, options: s, initialOptionsPart: h }), s.localStorage && Zt(I, s), ut(I);
  }
  return { useCogsState: x, setCogsOptions: w };
}, {
  setUpdaterState: mt,
  setState: ot,
  getInitialOptions: st,
  getKeyState: Rt,
  getValidationErrors: qt,
  setStateLog: Jt,
  updateInitialStateGlobal: At,
  addValidationError: Mt,
  removeValidationError: Q,
  setServerSyncActions: Yt
} = o.getState(), Nt = (t, i, S, u, h) => {
  S?.log && console.log(
    "saving to localstorage",
    i,
    S.localStorage?.key,
    u
  );
  const x = tt(S?.localStorage?.key) ? S.localStorage?.key(t) : S?.localStorage?.key;
  if (x && u) {
    const w = `${u}-${i}-${x}`;
    let I;
    try {
      I = vt(w)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: h ?? I
    }, m = Ht.serialize(s);
    window.localStorage.setItem(
      w,
      JSON.stringify(m.json)
    );
  }
}, vt = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Zt = (t, i) => {
  const S = o.getState().cogsStateStore[t], { sessionId: u } = _t(), h = tt(i?.localStorage?.key) ? i.localStorage.key(S) : i?.localStorage?.key;
  if (h && u) {
    const x = vt(
      `${u}-${t}-${h}`
    );
    if (x && x.lastUpdated > (x.lastSyncedWithServer || 0))
      return ot(t, x.state), ut(t), !0;
  }
  return !1;
}, Ot = (t, i, S, u, h, x) => {
  const w = {
    initialState: i,
    updaterState: ht(
      t,
      u,
      h,
      x
    ),
    state: S
  };
  At(t, w.initialState), mt(t, w.updaterState), ot(t, w.state);
}, ut = (t) => {
  const i = o.getState().stateComponents.get(t);
  if (!i) return;
  const S = /* @__PURE__ */ new Set();
  i.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || S.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((u) => u());
  });
}, me = (t, i) => {
  const S = o.getState().stateComponents.get(t);
  if (S) {
    const u = `${t}////${i}`, h = S.components.get(u);
    if ((h ? Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"] : null)?.includes("none"))
      return;
    h && h.forceUpdate();
  }
}, Xt = (t, i, S, u) => {
  switch (t) {
    case "update":
      return {
        oldValue: Z(i, u),
        newValue: Z(S, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: Z(S, u)
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
  serverSync: S,
  localStorage: u,
  formElements: h,
  reactiveDeps: x,
  reactiveType: w,
  componentId: I,
  initialState: s,
  syncUpdate: m,
  dependencies: n,
  serverState: g
} = {}) {
  const [L, F] = it({}), { sessionId: D } = _t();
  let H = !i;
  const [f] = it(i ?? kt()), l = o.getState().stateLog[f], gt = q(/* @__PURE__ */ new Set()), et = q(I ?? kt()), M = q(
    null
  );
  M.current = st(f) ?? null, rt(() => {
    if (m && m.stateKey === f && m.path?.[0]) {
      ot(f, (r) => ({
        ...r,
        [m.path[0]]: m.newValue
      }));
      const e = `${m.stateKey}:${m.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: m.timeStamp,
        userId: m.userId
      });
    }
  }, [m]), rt(() => {
    if (s) {
      Vt(f, {
        initialState: s
      });
      const e = M.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = o.getState().initialStateGlobal[f];
      if (!(c && !Y(c, s) || !c) && !a)
        return;
      let v = null;
      const T = tt(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      T && D && (v = vt(`${D}-${f}-${T}`));
      let E = s, A = !1;
      const _ = a ? Date.now() : 0, $ = v?.lastUpdated || 0, R = v?.lastSyncedWithServer || 0;
      a && _ > $ ? (E = e.serverState.data, A = !0) : v && $ > R && (E = v.state, e?.localStorage?.onChange && e?.localStorage?.onChange(E)), o.getState().initializeShadowState(f, s), Ot(
        f,
        s,
        E,
        ct,
        et.current,
        D
      ), A && T && D && Nt(E, f, e, D, Date.now()), ut(f), (Array.isArray(w) ? w : [w || "component"]).includes("none") || F({});
    }
  }, [
    s,
    g?.status,
    g?.data,
    ...n || []
  ]), Ct(() => {
    H && Vt(f, {
      serverSync: S,
      formElements: h,
      initialState: s,
      localStorage: u,
      middleware: M.current?.middleware
    });
    const e = `${f}////${et.current}`, r = o.getState().stateComponents.get(f) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => F({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: x || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), o.getState().stateComponents.set(f, r), F({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(f));
    };
  }, []);
  const ct = (e, r, a, c) => {
    if (Array.isArray(r)) {
      const v = `${f}-${r.join(".")}`;
      gt.current.add(v);
    }
    const p = o.getState();
    ot(f, (v) => {
      const T = tt(e) ? e(v) : e, E = `${f}-${r.join(".")}`;
      if (E) {
        let C = !1, y = p.signalDomElements.get(E);
        if ((!y || y.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const O = r.slice(0, -1), N = Z(T, O);
          if (Array.isArray(N)) {
            C = !0;
            const k = `${f}-${O.join(".")}`;
            y = p.signalDomElements.get(k);
          }
        }
        if (y) {
          const O = C ? Z(T, r.slice(0, -1)) : Z(T, r);
          y.forEach(({ parentId: N, position: k, effect: j }) => {
            const U = document.querySelector(
              `[data-parent-id="${N}"]`
            );
            if (U) {
              const B = Array.from(U.childNodes);
              if (B[k]) {
                const G = j ? new Function("state", `return (${j})(state)`)(O) : O;
                B[k].textContent = String(G);
              }
            }
          });
        }
      }
      console.log("shadowState", p.shadowStateStore), a.updateType === "update" && (c || M.current?.validation?.key) && r && Q(
        (c || M.current?.validation?.key) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      a.updateType === "cut" && M.current?.validation?.key && Q(
        M.current?.validation?.key + "." + A.join(".")
      ), a.updateType === "insert" && M.current?.validation?.key && qt(
        M.current?.validation?.key + "." + A.join(".")
      ).filter(([y, O]) => {
        let N = y?.split(".").length;
        if (y == A.join(".") && N == A.length - 1) {
          let k = y + "." + A;
          Q(y), Mt(k, O);
        }
      });
      const _ = p.stateComponents.get(f);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", _), _) {
        const C = Tt(v, T), y = new Set(C), O = a.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          N,
          k
        ] of _.components.entries()) {
          let j = !1;
          const U = Array.isArray(k.reactiveType) ? k.reactiveType : [k.reactiveType || "component"];
          if (console.log("component", k), !U.includes("none")) {
            if (U.includes("all")) {
              k.forceUpdate();
              continue;
            }
            if (U.includes("component") && ((k.paths.has(O) || k.paths.has("")) && (j = !0), !j))
              for (const B of y) {
                let G = B;
                for (; ; ) {
                  if (k.paths.has(G)) {
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
                    ) && k.paths.has(V)) {
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
            if (!j && U.includes("deps") && k.depsFunction) {
              const B = k.depsFunction(T);
              let G = !1;
              typeof B == "boolean" ? B && (G = !0) : Y(k.deps, B) || (k.deps = B, G = !0), G && (j = !0);
            }
            j && k.forceUpdate();
          }
        }
      }
      const $ = Date.now();
      r = r.map((C, y) => {
        const O = r.slice(0, -1), N = Z(T, O);
        return y === r.length - 1 && ["insert", "cut"].includes(a.updateType) ? (N.length - 1).toString() : C;
      });
      const { oldValue: R, newValue: z } = Xt(
        a.updateType,
        v,
        T,
        r
      ), K = {
        timeStamp: $,
        stateKey: f,
        path: r,
        updateType: a.updateType,
        status: "new",
        oldValue: R,
        newValue: z
      };
      switch (a.updateType) {
        case "update":
          p.updateShadowAtPath(f, r, T);
          break;
        case "insert":
          const C = r.slice(0, -1);
          p.insertShadowArrayElement(f, C, z);
          break;
        case "cut":
          const y = r.slice(0, -1), O = parseInt(r[r.length - 1]);
          p.removeShadowArrayElement(f, y, O);
          break;
      }
      if (Jt(f, (C) => {
        const O = [...C ?? [], K].reduce((N, k) => {
          const j = `${k.stateKey}:${JSON.stringify(k.path)}`, U = N.get(j);
          return U ? (U.timeStamp = Math.max(U.timeStamp, k.timeStamp), U.newValue = k.newValue, U.oldValue = U.oldValue ?? k.oldValue, U.updateType = k.updateType) : N.set(j, { ...k }), N;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), Nt(
        T,
        f,
        M.current,
        D
      ), M.current?.middleware && M.current.middleware({
        updateLog: l,
        update: K
      }), M.current?.serverSync) {
        const C = p.serverState[f], y = M.current?.serverSync;
        Yt(f, {
          syncKey: typeof y.syncKey == "string" ? y.syncKey : y.syncKey({ state: T }),
          rollBackState: C,
          actionTimeStamp: Date.now() + (y.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  o.getState().updaterState[f] || (mt(
    f,
    ht(
      f,
      ct,
      et.current,
      D
    )
  ), o.getState().cogsStateStore[f] || ot(f, t), o.getState().initialStateGlobal[f] || At(f, t));
  const d = Et(() => ht(
    f,
    ct,
    et.current,
    D
  ), [f, D]);
  return [Rt(f), d];
}
function ht(t, i, S, u) {
  const h = /* @__PURE__ */ new Map();
  let x = 0;
  const w = (m) => {
    const n = m.join(".");
    for (const [g] of h)
      (g === n || g.startsWith(n + ".")) && h.delete(g);
    x++;
  }, I = {
    removeValidation: (m) => {
      m?.validationKey && Q(m.validationKey);
    },
    revertToInitialState: (m) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && Q(n?.key), m?.validationKey && Q(m.validationKey);
      const g = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), h.clear(), x++;
      const L = s(g, []), F = st(t), D = tt(F?.localStorage?.key) ? F?.localStorage?.key(g) : F?.localStorage?.key, H = `${u}-${t}-${D}`;
      H && localStorage.removeItem(H), mt(t, L), ot(t, g);
      const f = o.getState().stateComponents.get(t);
      return f && f.components.forEach((l) => {
        l.forceUpdate();
      }), g;
    },
    updateInitialState: (m) => {
      h.clear(), x++;
      const n = ht(
        t,
        i,
        S,
        u
      ), g = o.getState().initialStateGlobal[t], L = st(t), F = tt(L?.localStorage?.key) ? L?.localStorage?.key(g) : L?.localStorage?.key, D = `${u}-${t}-${F}`;
      return localStorage.getItem(D) && localStorage.removeItem(D), Ft(() => {
        At(t, m), o.getState().initializeShadowState(t, m), mt(t, n), ot(t, m);
        const H = o.getState().stateComponents.get(t);
        H && H.components.forEach((f) => {
          f.forceUpdate();
        });
      }), {
        fetchId: (H) => n.get()[H]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const m = o.getState().serverState[t];
      return !!(m && Y(m, Rt(t)));
    }
  };
  function s(m, n = [], g) {
    const L = n.map(String).join(".");
    h.get(L);
    const F = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(I).forEach((f) => {
      F[f] = I[f];
    });
    const D = {
      apply(f, l, gt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(f, l) {
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !gt.has(l)) {
          const d = `${t}////${S}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const r = e.components.get(d);
            if (r && !r.paths.has("")) {
              const a = n.join(".");
              let c = !0;
              for (const p of r.paths)
                if (a.startsWith(p) && (a === p || a[p.length] === ".")) {
                  c = !1;
                  break;
                }
              c && r.paths.add(a);
            }
          }
        }
        if (l === "getDifferences")
          return () => Tt(
            o.getState().cogsStateStore[t],
            o.getState().initialStateGlobal[t]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const d = o.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const r = o.getState().getNestedState(t, []), a = d?.validation?.key;
            try {
              const c = await e.action(r);
              if (c && !c.success && c.errors && a) {
                o.getState().removeValidationError(a), c.errors.forEach((v) => {
                  const T = [a, ...v.path].join(".");
                  o.getState().addValidationError(T, v.message);
                });
                const p = o.getState().stateComponents.get(t);
                p && p.components.forEach((v) => {
                  v.forceUpdate();
                });
              }
              return c?.success && e.onSuccess ? e.onSuccess(c.data) : !c?.success && e.onError && e.onError(c.error), c;
            } catch (c) {
              return e.onError && e.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = Z(e, n);
          return Y(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = Z(e, n);
            return Y(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = st(t), r = tt(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${u}-${t}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(m)) {
          const d = () => g?.validIndices ? m.map((r, a) => ({
            item: r,
            originalIndex: g.validIndices[a]
          })) : o.getState().getNestedState(t, n).map((r, a) => ({
            item: r,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const e = o.getState().getSelectedIndex(t, n.join("."));
              if (e !== void 0)
                return s(
                  m[e],
                  [...n, e.toString()],
                  g
                );
            };
          if (l === "clearSelected")
            return () => {
              o.getState().clearSelectedIndex({ stateKey: t, path: n });
            };
          if (l === "getSelectedIndex")
            return () => o.getState().getSelectedIndex(t, n.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (e) => {
              const {
                itemHeight: r = 50,
                overscan: a = 6,
                stickToBottom: c = !1,
                dependencies: p = []
              } = e, v = q(null), [T, E] = it({
                startIndex: 0,
                endIndex: 10
              }), [A, _] = it(0), $ = q(!0), R = q(!1), z = q(0), K = q(T);
              rt(() => o.getState().subscribeToShadowState(t, () => {
                _((V) => V + 1);
              }), [t]);
              const C = o().getNestedState(
                t,
                n
              ), y = C.length, { totalHeight: O, positions: N } = Et(() => {
                const b = o.getState().getShadowMetadata(t, n) || [];
                let V = 0;
                const P = [];
                for (let W = 0; W < y; W++) {
                  P[W] = V;
                  const J = b[W]?.virtualizer?.itemHeight;
                  V += J || r;
                }
                return { totalHeight: V, positions: P };
              }, [
                y,
                t,
                n.join("."),
                r,
                A
              ]), k = Et(() => {
                const b = Math.max(0, T.startIndex), V = Math.min(y, T.endIndex), P = Array.from(
                  { length: V - b },
                  (J, at) => b + at
                ), W = P.map((J) => C[J]);
                return s(W, n, {
                  ...g,
                  validIndices: P
                });
              }, [T.startIndex, T.endIndex, C, y]), j = St(() => {
                const b = o.getState().getShadowMetadata(t, n) || [], V = y - 1;
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
              }, [t, n, y]);
              rt(() => {
                if (!c || y === 0) return;
                const b = y > z.current, V = z.current === 0 && y > 0;
                if ((b || V) && $.current && !R.current) {
                  const P = Math.ceil(
                    (v.current?.clientHeight || 0) / r
                  ), W = {
                    startIndex: Math.max(
                      0,
                      y - P - a
                    ),
                    endIndex: y
                  };
                  E(W);
                  const J = setTimeout(() => {
                    B(y - 1, "smooth");
                  }, 50);
                  return () => clearTimeout(J);
                }
                z.current = y;
              }, [y, r, a]), rt(() => {
                const b = v.current;
                if (!b) return;
                const V = () => {
                  const { scrollTop: P, scrollHeight: W, clientHeight: J } = b, at = W - P - J;
                  $.current = at < 5, at > 100 && (R.current = !0), at < 5 && (R.current = !1);
                  let nt = 0;
                  for (let X = 0; X < N.length; X++)
                    if (N[X] > P - r * a) {
                      nt = Math.max(0, X - 1);
                      break;
                    }
                  let xt = nt;
                  const jt = P + J;
                  for (let X = nt; X < N.length && !(N[X] > jt + r * a); X++)
                    xt = X;
                  const yt = Math.max(0, nt), It = Math.min(
                    y,
                    xt + 1 + a
                  );
                  (yt !== K.current.startIndex || It !== K.current.endIndex) && (K.current = {
                    startIndex: yt,
                    endIndex: It
                  }, E({
                    startIndex: yt,
                    endIndex: It
                  }));
                };
                if (b.addEventListener("scroll", V, {
                  passive: !0
                }), c && y > 0 && !R.current) {
                  const { scrollTop: P } = b;
                  P === 0 && (b.scrollTop = b.scrollHeight, $.current = !0);
                }
                return V(), () => {
                  b.removeEventListener("scroll", V);
                };
              }, [N, y, r, a, c]);
              const U = St(() => {
                $.current = !0, R.current = !1, !j() && v.current && (v.current.scrollTop = v.current.scrollHeight);
              }, [j]), B = St(
                (b, V = "smooth") => {
                  const P = v.current;
                  if (!P) return;
                  if (b === y - 1) {
                    P.scrollTo({
                      top: P.scrollHeight,
                      behavior: V
                    });
                    return;
                  }
                  const nt = (o.getState().getShadowMetadata(t, n) || [])[b]?.virtualizer?.domRef;
                  nt ? nt.scrollIntoView({
                    behavior: V,
                    block: "center"
                  }) : N[b] !== void 0 && P.scrollTo({
                    top: N[b],
                    behavior: V
                  });
                },
                [N, t, n, y]
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
                virtualState: k,
                virtualizerProps: G,
                scrollToBottom: U,
                scrollToIndex: B
              };
            };
          if (l === "stateMapNoRender")
            return (e) => m.map((a, c) => {
              let p;
              g?.validIndices && g.validIndices[c] !== void 0 ? p = g.validIndices[c] : p = c;
              const v = [...n, p.toString()], T = s(a, v, g);
              return e(
                a,
                T,
                c,
                m,
                s(m, n, g)
              );
            });
          if (l === "$stateMap")
            return (e) => dt(Kt, {
              proxy: {
                _stateKey: t,
                _path: n,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateList")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (g?.validIndices || Array.from({ length: r.length }, (c, p) => p)).map((c, p) => {
                const v = r[c], T = [...n, c.toString()], E = s(v, T, g), A = `${S}-${n.join(".")}-${c}`;
                return dt(ee, {
                  key: c,
                  stateKey: t,
                  itemComponentId: A,
                  itemPath: T,
                  children: e(
                    v,
                    E,
                    { localIndex: p, originalIndex: c },
                    r,
                    s(r, n, g)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const r = m;
              h.clear(), x++;
              const a = r.flatMap(
                (c) => c[e] ?? []
              );
              return s(
                a,
                [...n, "[*]", e],
                g
              );
            };
          if (l === "index")
            return (e) => {
              const r = m[e];
              return s(r, [...n, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = o.getState().getNestedState(t, n);
              if (e.length === 0) return;
              const r = e.length - 1, a = e[r], c = [...n, r.toString()];
              return s(a, c);
            };
          if (l === "insert")
            return (e) => (w(n), wt(i, e, n, t), s(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, a) => {
              const c = o.getState().getNestedState(t, n), p = tt(e) ? e(c) : e;
              let v = null;
              if (!c.some((E) => {
                if (r) {
                  const _ = r.every(
                    ($) => Y(E[$], p[$])
                  );
                  return _ && (v = E), _;
                }
                const A = Y(E, p);
                return A && (v = E), A;
              }))
                w(n), wt(i, p, n, t);
              else if (a && v) {
                const E = a(v), A = c.map(
                  (_) => Y(_, v) ? E : _
                );
                w(n), lt(i, A, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return w(n), ft(i, n, t, e), s(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < m.length; r++)
                m[r] === e && ft(i, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = m.findIndex((a) => a === e);
              r > -1 ? ft(i, n, t, r) : wt(i, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const a = d().find(
                ({ item: p }, v) => e(p, v)
              );
              if (!a) return;
              const c = [...n, a.originalIndex.toString()];
              return s(a.item, c, g);
            };
          if (l === "findWith")
            return (e, r) => {
              const c = d().find(
                ({ item: v }) => v[e] === r
              );
              if (!c) return;
              const p = [...n, c.originalIndex.toString()];
              return s(c.item, p, g);
            };
        }
        const et = n[n.length - 1];
        if (!isNaN(Number(et))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => ft(
              i,
              d,
              t,
              Number(et)
            );
        }
        if (l === "get")
          return () => {
            if (g?.validIndices && Array.isArray(m)) {
              const d = o.getState().getNestedState(t, n);
              return g.validIndices.map((e) => d[e]);
            }
            return o.getState().getNestedState(t, n);
          };
        if (l === "$derive")
          return (d) => Pt({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Pt({
            _stateKey: t,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${t}:${n.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => vt(u + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), a = e.join(".");
            d ? o.getState().setSelectedIndex(t, a, r) : o.getState().setSelectedIndex(t, a, void 0);
            const c = o.getState().getNestedState(t, [...e]);
            lt(i, c, e), w(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), e = Number(n[n.length - 1]), r = d.join("."), a = o.getState().getSelectedIndex(t, r);
            o.getState().setSelectedIndex(
              t,
              r,
              a === e ? void 0 : e
            );
            const c = o.getState().getNestedState(t, [...d]);
            lt(i, c, d), w(d);
          };
        if (n.length == 0) {
          if (l === "addValidation")
            return (d) => {
              const e = o.getState().getInitialOptions(t)?.validation;
              if (!e?.key)
                throw new Error("Validation key not found");
              Q(e.key), console.log("addValidationError", d), d.forEach((r) => {
                const a = [e.key, ...r.path].join(".");
                console.log("fullErrorPath", a), Mt(a, r.message);
              }), ut(t);
            };
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], a = zt(e, d).newDocument;
              Ot(
                t,
                o.getState().initialStateGlobal[t],
                a,
                i,
                S,
                u
              );
              const c = o.getState().stateComponents.get(t);
              if (c) {
                const p = Tt(e, a), v = new Set(p);
                for (const [
                  T,
                  E
                ] of c.components.entries()) {
                  let A = !1;
                  const _ = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
                  if (!_.includes("none")) {
                    if (_.includes("all")) {
                      E.forceUpdate();
                      continue;
                    }
                    if (_.includes("component") && (E.paths.has("") && (A = !0), !A))
                      for (const $ of v) {
                        if (E.paths.has($)) {
                          A = !0;
                          break;
                        }
                        let R = $.lastIndexOf(".");
                        for (; R !== -1; ) {
                          const z = $.substring(0, R);
                          if (E.paths.has(z)) {
                            A = !0;
                            break;
                          }
                          const K = $.substring(
                            R + 1
                          );
                          if (!isNaN(Number(K))) {
                            const C = z.lastIndexOf(".");
                            if (C !== -1) {
                              const y = z.substring(
                                0,
                                C
                              );
                              if (E.paths.has(y)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          R = z.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && _.includes("deps") && E.depsFunction) {
                      const $ = E.depsFunction(a);
                      let R = !1;
                      typeof $ == "boolean" ? $ && (R = !0) : Y(E.deps, $) || (E.deps = $, R = !0), R && (A = !0);
                    }
                    A && E.forceUpdate();
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
              Q(d.key);
              const r = o.getState().cogsStateStore[t];
              try {
                const a = o.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([p]) => {
                  p && p.startsWith(d.key) && Q(p);
                });
                const c = d.zodSchema.safeParse(r);
                return c.success ? !0 : (c.error.errors.forEach((v) => {
                  const T = v.path, E = v.message, A = [d.key, ...T].join(".");
                  e(A, E);
                }), ut(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return S;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => bt.getState().getFormRefsByStateKey(t);
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
          return () => bt.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ pt(
            Gt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: g?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return n;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Lt(() => {
                lt(i, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              lt(i, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            w(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ pt(
            Wt,
            {
              setState: i,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const M = [...n, l], ct = o.getState().getNestedState(t, M);
        return s(ct, M, g);
      }
    }, H = new Proxy(F, D);
    return h.set(L, {
      proxy: H,
      stateVersion: x
    }), H;
  }
  return s(
    o.getState().getNestedState(t, [])
  );
}
function Pt(t) {
  return dt(te, { proxy: t });
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
    (h, x, w, I, s) => t._mapFn(h, x, w, I, s)
  ) : null;
}
function te({
  proxy: t
}) {
  const i = q(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return rt(() => {
    const u = i.current;
    if (!u || !u.parentElement) return;
    const h = u.parentElement, w = Array.from(h.childNodes).indexOf(u);
    let I = h.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, h.setAttribute("data-parent-id", I));
    const m = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: w,
      effect: t._effect
    };
    o.getState().addSignalElement(S, m);
    const n = o.getState().getNestedState(t._stateKey, t._path);
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
    "data-signal-id": S
  });
}
function he(t) {
  const i = Ut(
    (S) => {
      const u = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(t._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => u.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return dt("text", {}, String(i));
}
function ee({
  stateKey: t,
  itemComponentId: i,
  itemPath: S,
  children: u
}) {
  const [, h] = it({}), [x, w] = Bt(), I = q(null), s = q(null), m = St(
    (n) => {
      x(n), I.current = n;
    },
    [x]
  );
  return rt(() => {
    w.height > 0 && w.height !== s.current && (s.current = w.height, o.getState().setShadowMetadata(t, S, {
      virtualizer: {
        itemHeight: w.height,
        domRef: I.current
        // Store the actual DOM element reference
      }
    }));
  }, [w.height, t, S]), Ct(() => {
    const n = `${t}////${i}`, g = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return g.components.set(n, {
      forceUpdate: () => h({}),
      paths: /* @__PURE__ */ new Set([S.join(".")])
    }), o.getState().stateComponents.set(t, g), () => {
      const L = o.getState().stateComponents.get(t);
      L && L.components.delete(n);
    };
  }, [t, i, S.join(".")]), /* @__PURE__ */ pt("div", { ref: m, children: u });
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
