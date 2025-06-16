"use client";
import { jsx as wt } from "react/jsx-runtime";
import { useState as et, useRef as z, useEffect as it, useLayoutEffect as St, useMemo as Et, createElement as ct, useSyncExternalStore as Dt, startTransition as Ft, useCallback as bt } from "react";
import { transformStateFunc as Lt, isDeepEqual as H, isFunction as Q, getNestedValue as q, getDifferences as At, debounce as Gt } from "./utility.js";
import { pushFunc as pt, updateFn as st, cutFunc as ft, ValidationWrapper as Wt, FormControlComponent as Ht } from "./Functions.jsx";
import Bt from "superjson";
import { v4 as Tt } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as xt } from "./store.js";
import { useCogsConfig as Rt } from "./CogsStateClient.jsx";
import { applyPatch as zt } from "fast-json-patch";
import qt from "react-use-measure";
function Vt(t, i) {
  const m = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, y = m(t) || {};
  g(t, {
    ...y,
    ...i
  });
}
function Pt({
  stateKey: t,
  options: i,
  initialOptionsPart: m
}) {
  const g = ot(t) || {}, y = m[t] || {}, C = r.getState().setInitialStateOptions, p = { ...y, ...g };
  let I = !1;
  if (i)
    for (const a in i)
      p.hasOwnProperty(a) ? (a == "localStorage" && i[a] && p[a].key !== i[a]?.key && (I = !0, p[a] = i[a]), a == "initialState" && i[a] && p[a] !== i[a] && // Different references
      !H(p[a], i[a]) && (I = !0, p[a] = i[a])) : (I = !0, p[a] = i[a]);
  I && C(t, p);
}
function me(t, { formElements: i, validation: m }) {
  return { initialState: t, formElements: i, validation: m };
}
const he = (t, i) => {
  let m = t;
  const [g, y] = Lt(m);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, ot(I) || r.getState().setInitialStateOptions(I, y[I]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const C = (I, a) => {
    const [v] = et(a?.componentId ?? Tt());
    Pt({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = r.getState().cogsStateStore[I] || g[I], S = a?.modifyState ? a.modifyState(n) : n, [L, O] = te(
      S,
      {
        stateKey: I,
        syncUpdate: a?.syncUpdate,
        componentId: v,
        localStorage: a?.localStorage,
        middleware: a?.middleware,
        enabledSync: a?.enabledSync,
        reactiveType: a?.reactiveType,
        reactiveDeps: a?.reactiveDeps,
        initialState: a?.initialState,
        dependencies: a?.dependencies,
        serverState: a?.serverState
      }
    );
    return O;
  };
  function p(I, a) {
    Pt({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Qt(I, a), yt(I);
  }
  return { useCogsState: C, setCogsOptions: p };
}, {
  setUpdaterState: mt,
  setState: nt,
  getInitialOptions: ot,
  getKeyState: Ot,
  getValidationErrors: Jt,
  setStateLog: Yt,
  updateInitialStateGlobal: kt,
  addValidationError: Zt,
  removeValidationError: X,
  setServerSyncActions: Xt
} = r.getState(), _t = (t, i, m, g, y) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    g
  );
  const C = Q(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (C && g) {
    const p = `${g}-${i}-${C}`;
    let I;
    try {
      I = vt(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Bt.serialize(a);
    window.localStorage.setItem(
      p,
      JSON.stringify(v.json)
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
}, Qt = (t, i) => {
  const m = r.getState().cogsStateStore[t], { sessionId: g } = Rt(), y = Q(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (y && g) {
    const C = vt(
      `${g}-${t}-${y}`
    );
    if (C && C.lastUpdated > (C.lastSyncedWithServer || 0))
      return nt(t, C.state), yt(t), !0;
  }
  return !1;
}, Ut = (t, i, m, g, y, C) => {
  const p = {
    initialState: i,
    updaterState: ht(
      t,
      g,
      y,
      C
    ),
    state: m
  };
  kt(t, p.initialState), mt(t, p.updaterState), nt(t, p.state);
}, yt = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, ve = (t, i) => {
  const m = r.getState().stateComponents.get(t);
  if (m) {
    const g = `${t}////${i}`, y = m.components.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Kt = (t, i, m, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: q(i, g),
        newValue: q(m, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: q(m, g)
      };
    case "cut":
      return {
        oldValue: q(i, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function te(t, {
  stateKey: i,
  serverSync: m,
  localStorage: g,
  formElements: y,
  reactiveDeps: C,
  reactiveType: p,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [L, O] = et({}), { sessionId: U } = Rt();
  let G = !i;
  const [h] = et(i ?? Tt()), l = r.getState().stateLog[h], lt = z(/* @__PURE__ */ new Set()), K = z(I ?? Tt()), _ = z(
    null
  );
  _.current = ot(h) ?? null, it(() => {
    if (v && v.stateKey === h && v.path?.[0]) {
      nt(h, (o) => ({
        ...o,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), it(() => {
    if (a) {
      Vt(h, {
        initialState: a
      });
      const e = _.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = r.getState().initialStateGlobal[h];
      if (!(c && !H(c, a) || !c) && !s)
        return;
      let u = null;
      const w = Q(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      w && U && (u = vt(`${U}-${h}-${w}`));
      let E = a, T = !1;
      const b = s ? Date.now() : 0, N = u?.lastUpdated || 0, P = u?.lastSyncedWithServer || 0;
      s && b > N ? (E = e.serverState.data, T = !0) : u && N > P && (E = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(E)), r.getState().initializeShadowState(h, a), Ut(
        h,
        a,
        E,
        at,
        K.current,
        U
      ), T && w && U && _t(E, h, e, U, Date.now()), yt(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || O({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), St(() => {
    G && Vt(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: g,
      middleware: _.current?.middleware
    });
    const e = `${h}////${K.current}`, o = r.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(e, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: C || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), r.getState().stateComponents.set(h, o), O({}), () => {
      o && (o.components.delete(e), o.components.size === 0 && r.getState().stateComponents.delete(h));
    };
  }, []);
  const at = (e, o, s, c) => {
    if (Array.isArray(o)) {
      const u = `${h}-${o.join(".")}`;
      lt.current.add(u);
    }
    const f = r.getState();
    nt(h, (u) => {
      const w = Q(e) ? e(u) : e, E = `${h}-${o.join(".")}`;
      if (E) {
        let x = !1, A = f.signalDomElements.get(E);
        if ((!A || A.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const M = o.slice(0, -1), V = q(w, M);
          if (Array.isArray(V)) {
            x = !0;
            const $ = `${h}-${M.join(".")}`;
            A = f.signalDomElements.get($);
          }
        }
        if (A) {
          const M = x ? q(w, o.slice(0, -1)) : q(w, o);
          A.forEach(({ parentId: V, position: $, effect: j }) => {
            const R = document.querySelector(
              `[data-parent-id="${V}"]`
            );
            if (R) {
              const W = Array.from(R.childNodes);
              if (W[$]) {
                const k = j ? new Function("state", `return (${j})(state)`)(M) : M;
                W[$].textContent = String(k);
              }
            }
          });
        }
      }
      console.log("shadowState", f.shadowStateStore), s.updateType === "update" && (c || _.current?.validation?.key) && o && X(
        (c || _.current?.validation?.key) + "." + o.join(".")
      );
      const T = o.slice(0, o.length - 1);
      s.updateType === "cut" && _.current?.validation?.key && X(
        _.current?.validation?.key + "." + T.join(".")
      ), s.updateType === "insert" && _.current?.validation?.key && Jt(
        _.current?.validation?.key + "." + T.join(".")
      ).filter(([A, M]) => {
        let V = A?.split(".").length;
        if (A == T.join(".") && V == T.length - 1) {
          let $ = A + "." + T;
          X(A), Zt($, M);
        }
      });
      const b = f.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", b), b) {
        const x = At(u, w), A = new Set(x), M = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          V,
          $
        ] of b.components.entries()) {
          let j = !1;
          const R = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !R.includes("none")) {
            if (R.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (R.includes("component") && (($.paths.has(M) || $.paths.has("")) && (j = !0), !j))
              for (const W of A) {
                let k = W;
                for (; ; ) {
                  if ($.paths.has(k)) {
                    j = !0;
                    break;
                  }
                  const D = k.lastIndexOf(".");
                  if (D !== -1) {
                    const B = k.substring(
                      0,
                      D
                    );
                    if (!isNaN(
                      Number(k.substring(D + 1))
                    ) && $.paths.has(B)) {
                      j = !0;
                      break;
                    }
                    k = B;
                  } else
                    k = "";
                  if (k === "")
                    break;
                }
                if (j) break;
              }
            if (!j && R.includes("deps") && $.depsFunction) {
              const W = $.depsFunction(w);
              let k = !1;
              typeof W == "boolean" ? W && (k = !0) : H($.deps, W) || ($.deps = W, k = !0), k && (j = !0);
            }
            j && $.forceUpdate();
          }
        }
      }
      const N = Date.now();
      o = o.map((x, A) => {
        const M = o.slice(0, -1), V = q(w, M);
        return A === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (V.length - 1).toString() : x;
      });
      const { oldValue: P, newValue: F } = Kt(
        s.updateType,
        u,
        w,
        o
      ), J = {
        timeStamp: N,
        stateKey: h,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: P,
        newValue: F
      };
      switch (s.updateType) {
        case "update":
          f.updateShadowAtPath(h, o, w);
          break;
        case "insert":
          const x = o.slice(0, -1);
          f.insertShadowArrayElement(h, x, F);
          break;
        case "cut":
          const A = o.slice(0, -1), M = parseInt(o[o.length - 1]);
          f.removeShadowArrayElement(h, A, M);
          break;
      }
      if (Yt(h, (x) => {
        const M = [...x ?? [], J].reduce((V, $) => {
          const j = `${$.stateKey}:${JSON.stringify($.path)}`, R = V.get(j);
          return R ? (R.timeStamp = Math.max(R.timeStamp, $.timeStamp), R.newValue = $.newValue, R.oldValue = R.oldValue ?? $.oldValue, R.updateType = $.updateType) : V.set(j, { ...$ }), V;
        }, /* @__PURE__ */ new Map());
        return Array.from(M.values());
      }), _t(
        w,
        h,
        _.current,
        U
      ), _.current?.middleware && _.current.middleware({
        updateLog: l,
        update: J
      }), _.current?.serverSync) {
        const x = f.serverState[h], A = _.current?.serverSync;
        Xt(h, {
          syncKey: typeof A.syncKey == "string" ? A.syncKey : A.syncKey({ state: w }),
          rollBackState: x,
          actionTimeStamp: Date.now() + (A.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return w;
    });
  };
  r.getState().updaterState[h] || (mt(
    h,
    ht(
      h,
      at,
      K.current,
      U
    )
  ), r.getState().cogsStateStore[h] || nt(h, t), r.getState().initialStateGlobal[h] || kt(h, t));
  const d = Et(() => ht(
    h,
    at,
    K.current,
    U
  ), [h, U]);
  return [Ot(h), d];
}
function ht(t, i, m, g) {
  const y = /* @__PURE__ */ new Map();
  let C = 0;
  const p = (v) => {
    const n = v.join(".");
    for (const [S] of y)
      (S === n || S.startsWith(n + ".")) && y.delete(S);
    C++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && X(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = r.getState().getInitialOptions(t)?.validation;
      n?.key && X(n?.key), v?.validationKey && X(v.validationKey);
      const S = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), y.clear(), C++;
      const L = a(S, []), O = ot(t), U = Q(O?.localStorage?.key) ? O?.localStorage?.key(S) : O?.localStorage?.key, G = `${g}-${t}-${U}`;
      G && localStorage.removeItem(G), mt(t, L), nt(t, S);
      const h = r.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), C++;
      const n = ht(
        t,
        i,
        m,
        g
      ), S = r.getState().initialStateGlobal[t], L = ot(t), O = Q(L?.localStorage?.key) ? L?.localStorage?.key(S) : L?.localStorage?.key, U = `${g}-${t}-${O}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), Ft(() => {
        kt(t, v), r.getState().initializeShadowState(t, v), mt(t, n), nt(t, v);
        const G = r.getState().stateComponents.get(t);
        G && G.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (G) => n.get()[G]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const v = r.getState().serverState[t];
      return !!(v && H(v, Ot(t)));
    }
  };
  function a(v, n = [], S) {
    const L = n.map(String).join(".");
    y.get(L);
    const O = function() {
      return r().getNestedState(t, n);
    };
    Object.keys(I).forEach((h) => {
      O[h] = I[h];
    });
    const U = {
      apply(h, l, lt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, n);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
        const lt = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !lt.has(l)) {
          const d = `${t}////${m}`, e = r.getState().stateComponents.get(t);
          if (e) {
            const o = e.components.get(d);
            if (o && !o.paths.has("")) {
              const s = n.join(".");
              let c = !0;
              for (const f of o.paths)
                if (s.startsWith(f) && (s === f || s[f.length] === ".")) {
                  c = !1;
                  break;
                }
              c && o.paths.add(s);
            }
          }
        }
        if (l === "getDifferences")
          return () => At(
            r.getState().cogsStateStore[t],
            r.getState().initialStateGlobal[t]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const d = r.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const o = r.getState().getNestedState(t, []), s = d?.validation?.key;
            try {
              const c = await e.action(o);
              if (c && !c.success && c.errors && s) {
                r.getState().removeValidationError(s), c.errors.forEach((u) => {
                  const w = [s, ...u.path].join(".");
                  r.getState().addValidationError(w, u.message);
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
          const d = r.getState().getNestedState(t, n), e = r.getState().initialStateGlobal[t], o = q(e, n);
          return H(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              t,
              n
            ), e = r.getState().initialStateGlobal[t], o = q(e, n);
            return H(d, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[t], e = ot(t), o = Q(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${g}-${t}-${o}`;
            s && localStorage.removeItem(s);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = r.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(v)) {
          const d = () => S?.validIndices ? v.map((o, s) => ({
            item: o,
            originalIndex: S.validIndices[s]
          })) : r.getState().getNestedState(t, n).map((o, s) => ({
            item: o,
            originalIndex: s
          }));
          if (l === "getSelected")
            return () => {
              const e = r.getState().getSelectedIndex(t, n.join("."));
              if (e !== void 0)
                return a(
                  v[e],
                  [...n, e.toString()],
                  S
                );
            };
          if (l === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: t, path: n });
            };
          if (l === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(t, n.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (e) => {
              const {
                itemHeight: o = 50,
                overscan: s = 6,
                stickToBottom: c = !1,
                dependencies: f = []
              } = e, u = z(null), [w, E] = et({
                startIndex: 0,
                endIndex: 10
              }), T = z(c), b = z(!1), N = z(f), P = z(0), [F, J] = et(0);
              it(() => r.getState().subscribeToShadowState(t, () => {
                J((D) => D + 1);
              }), [t]);
              const x = r().getNestedState(
                t,
                n
              ), A = x.length, { totalHeight: M, positions: V } = Et(() => {
                const k = r.getState().getShadowMetadata(t, n) || [];
                let D = 0;
                const B = [];
                for (let Z = 0; Z < A; Z++) {
                  B[Z] = D;
                  const tt = k[Z]?.virtualizer?.itemHeight;
                  D += tt || o;
                }
                return { totalHeight: D, positions: B };
              }, [
                A,
                t,
                n.join("."),
                o,
                F
              ]), $ = Et(() => {
                const k = Math.max(0, w.startIndex), D = Math.min(A, w.endIndex), B = Array.from(
                  { length: D - k },
                  (tt, Y) => k + Y
                ), Z = B.map((tt) => x[tt]);
                return a(Z, n, {
                  ...S,
                  validIndices: B
                });
              }, [w.startIndex, w.endIndex, x, A]);
              St(() => {
                const k = u.current;
                if (!k) return;
                const D = !H(
                  f,
                  N.current
                ), B = A > P.current;
                D && (console.log("DEPENDENCY CHANGE: Resetting scroll lock."), T.current = c);
                const Z = T.current && (B || D), tt = () => {
                  const { scrollTop: rt, clientHeight: Ct } = k;
                  let dt = 0, ut = A - 1;
                  for (; dt <= ut; ) {
                    const It = Math.floor((dt + ut) / 2);
                    V[It] < rt ? dt = It + 1 : ut = It - 1;
                  }
                  const Nt = Math.max(0, ut - s);
                  let gt = Nt;
                  const jt = rt + Ct;
                  for (; gt < A && V[gt] < jt; )
                    gt++;
                  E({
                    startIndex: Nt,
                    endIndex: Math.min(A, gt + s)
                  });
                };
                let Y;
                Z ? (console.log("ALGORITHM: Starting..."), E({
                  startIndex: Math.max(0, A - 10 - s),
                  endIndex: A
                }), Y = setInterval(() => {
                  const rt = A - 1;
                  if (rt < 0) {
                    clearInterval(Y);
                    return;
                  }
                  ((r.getState().getShadowMetadata(t, n) || [])[rt]?.virtualizer?.itemHeight || 0) > 0 && (clearInterval(Y), console.log("%cSUCCESS: Scrolling now.", "color: green;"), b.current = !0, k.scrollTo({
                    top: k.scrollHeight,
                    behavior: "smooth"
                  }), setTimeout(() => {
                    b.current = !1;
                  }, 1e3));
                }, 100)) : tt();
                const $t = () => {
                  if (b.current) return;
                  !(k.scrollHeight - k.scrollTop - k.clientHeight < 1) && T.current && (console.log("USER SCROLL: Lock broken."), T.current = !1, Y && clearInterval(Y)), tt();
                };
                return k.addEventListener("scroll", $t, {
                  passive: !0
                }), N.current = f, P.current = A, () => {
                  k.removeEventListener("scroll", $t), Y && clearInterval(Y);
                };
              }, [A, V, ...f]);
              const j = bt(
                (k = "smooth") => {
                  u.current && (T.current = !0, console.log("USER ACTION: Scroll lock ENABLED."), u.current.scrollTo({
                    top: u.current.scrollHeight,
                    behavior: k
                  }));
                },
                []
              ), R = bt(
                (k, D = "smooth") => {
                  u.current && V[k] !== void 0 && (T.current = !1, console.log("USER ACTION: Scroll lock DISABLED."), u.current.scrollTo({
                    top: V[k],
                    behavior: D
                  }));
                },
                [V]
              ), W = {
                outer: {
                  ref: u,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${M}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${V[w.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: $,
                virtualizerProps: W,
                scrollToBottom: j,
                scrollToIndex: R
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, w) => e(u.item, w.item)
              ), c = s.map(({ item: u }) => u), f = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(c, n, f);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = d().filter(
                ({ item: u }, w) => e(u, w)
              ), c = s.map(({ item: u }) => u), f = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(c, n, f);
            };
          if (l === "stateMap")
            return (e) => {
              const o = r.getState().getNestedState(t, n);
              return Array.isArray(o) ? (S?.validIndices || Array.from({ length: o.length }, (c, f) => f)).map((c, f) => {
                const u = o[c], w = [...n, c.toString()], E = a(u, w, S);
                return e(u, E, {
                  register: () => {
                    const [, b] = et({}), N = `${m}-${n.join(".")}-${c}`;
                    St(() => {
                      const P = `${t}////${N}`, F = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return F.components.set(P, {
                        forceUpdate: () => b({}),
                        paths: /* @__PURE__ */ new Set([w.join(".")])
                      }), r.getState().stateComponents.set(t, F), () => {
                        const J = r.getState().stateComponents.get(t);
                        J && J.components.delete(P);
                      };
                    }, [t, N]);
                  },
                  index: f,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                o
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => v.map((s, c) => {
              let f;
              S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
              const u = [...n, f.toString()], w = a(s, u, S);
              return e(
                s,
                w,
                c,
                v,
                a(v, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => ct(ee, {
              proxy: {
                _stateKey: t,
                _path: n,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: a
            });
          if (l === "stateList")
            return (e) => {
              const o = r.getState().getNestedState(t, n);
              return Array.isArray(o) ? (S?.validIndices || Array.from({ length: o.length }, (c, f) => f)).map((c, f) => {
                const u = o[c], w = [...n, c.toString()], E = a(u, w, S), T = `${m}-${n.join(".")}-${c}`;
                return ct(re, {
                  key: c,
                  stateKey: t,
                  itemComponentId: T,
                  itemPath: w,
                  children: e(
                    u,
                    E,
                    f,
                    o,
                    a(o, n, S)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const o = v;
              y.clear(), C++;
              const s = o.flatMap(
                (c) => c[e] ?? []
              );
              return a(
                s,
                [...n, "[*]", e],
                S
              );
            };
          if (l === "index")
            return (e) => {
              const o = v[e];
              return a(o, [...n, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = r.getState().getNestedState(t, n);
              if (e.length === 0) return;
              const o = e.length - 1, s = e[o], c = [...n, o.toString()];
              return a(s, c);
            };
          if (l === "insert")
            return (e) => (p(n), pt(i, e, n, t), a(
              r.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, o, s) => {
              const c = r.getState().getNestedState(t, n), f = Q(e) ? e(c) : e;
              let u = null;
              if (!c.some((E) => {
                if (o) {
                  const b = o.every(
                    (N) => H(E[N], f[N])
                  );
                  return b && (u = E), b;
                }
                const T = H(E, f);
                return T && (u = E), T;
              }))
                p(n), pt(i, f, n, t);
              else if (s && u) {
                const E = s(u), T = c.map(
                  (b) => H(b, u) ? E : b
                );
                p(n), st(i, T, n);
              }
            };
          if (l === "cut")
            return (e, o) => {
              if (!o?.waitForSync)
                return p(n), ft(i, n, t, e), a(
                  r.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let o = 0; o < v.length; o++)
                v[o] === e && ft(i, n, t, o);
            };
          if (l === "toggleByValue")
            return (e) => {
              const o = v.findIndex((s) => s === e);
              o > -1 ? ft(i, n, t, o) : pt(i, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = d().find(
                ({ item: f }, u) => e(f, u)
              );
              if (!s) return;
              const c = [...n, s.originalIndex.toString()];
              return a(s.item, c, S);
            };
          if (l === "findWith")
            return (e, o) => {
              const c = d().find(
                ({ item: u }) => u[e] === o
              );
              if (!c) return;
              const f = [...n, c.originalIndex.toString()];
              return a(c.item, f, S);
            };
        }
        const K = n[n.length - 1];
        if (!isNaN(Number(K))) {
          const d = n.slice(0, -1), e = r.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => ft(
              i,
              d,
              t,
              Number(K)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(v)) {
              const d = r.getState().getNestedState(t, n);
              return S.validIndices.map((e) => d[e]);
            }
            return r.getState().getNestedState(t, n);
          };
        if (l === "$derive")
          return (d) => Mt({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Mt({
            _stateKey: t,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${t}:${n.join(".")}`;
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => vt(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), o = r.getState().getNestedState(t, d);
          return Array.isArray(o) ? Number(n[n.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), o = Number(n[n.length - 1]), s = e.join(".");
            d ? r.getState().setSelectedIndex(t, s, o) : r.getState().setSelectedIndex(t, s, void 0);
            const c = r.getState().getNestedState(t, [...e]);
            st(i, c, e), p(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), e = Number(n[n.length - 1]), o = d.join("."), s = r.getState().getSelectedIndex(t, o);
            r.getState().setSelectedIndex(
              t,
              o,
              s === e ? void 0 : e
            );
            const c = r.getState().getNestedState(t, [...d]);
            st(i, c, d), p(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = r.getState().cogsStateStore[t], s = zt(e, d).newDocument;
              Ut(
                t,
                r.getState().initialStateGlobal[t],
                s,
                i,
                m,
                g
              );
              const c = r.getState().stateComponents.get(t);
              if (c) {
                const f = At(e, s), u = new Set(f);
                for (const [
                  w,
                  E
                ] of c.components.entries()) {
                  let T = !1;
                  const b = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
                  if (!b.includes("none")) {
                    if (b.includes("all")) {
                      E.forceUpdate();
                      continue;
                    }
                    if (b.includes("component") && (E.paths.has("") && (T = !0), !T))
                      for (const N of u) {
                        if (E.paths.has(N)) {
                          T = !0;
                          break;
                        }
                        let P = N.lastIndexOf(".");
                        for (; P !== -1; ) {
                          const F = N.substring(0, P);
                          if (E.paths.has(F)) {
                            T = !0;
                            break;
                          }
                          const J = N.substring(
                            P + 1
                          );
                          if (!isNaN(Number(J))) {
                            const x = F.lastIndexOf(".");
                            if (x !== -1) {
                              const A = F.substring(
                                0,
                                x
                              );
                              if (E.paths.has(A)) {
                                T = !0;
                                break;
                              }
                            }
                          }
                          P = F.lastIndexOf(".");
                        }
                        if (T) break;
                      }
                    if (!T && b.includes("deps") && E.depsFunction) {
                      const N = E.depsFunction(s);
                      let P = !1;
                      typeof N == "boolean" ? N && (P = !0) : H(E.deps, N) || (E.deps = N, P = !0), P && (T = !0);
                    }
                    T && E.forceUpdate();
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
              X(d.key);
              const o = r.getState().cogsStateStore[t];
              try {
                const s = r.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([f]) => {
                  f && f.startsWith(d.key) && X(f);
                });
                const c = d.zodSchema.safeParse(o);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const w = u.path, E = u.message, T = [d.key, ...w].join(".");
                  e(T, E);
                }), yt(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => r().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => xt.getState().getFormRefsByStateKey(t);
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
          return () => xt.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ wt(
            Wt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: S?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return n;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Gt(() => {
                st(i, d, n, "");
                const o = r.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(o);
              }, e.debounce);
            else {
              st(i, d, n, "");
              const o = r.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(o);
            }
            p(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ wt(
            Ht,
            {
              setState: i,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const _ = [...n, l], at = r.getState().getNestedState(t, _);
        return a(at, _, S);
      }
    }, G = new Proxy(O, U);
    return y.set(L, {
      proxy: G,
      stateVersion: C
    }), G;
  }
  return a(
    r.getState().getNestedState(t, [])
  );
}
function Mt(t) {
  return ct(ne, { proxy: t });
}
function ee({
  proxy: t,
  rebuildStateShape: i
}) {
  const m = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? i(
    m,
    t._path
  ).stateMapNoRender(
    (y, C, p, I, a) => t._mapFn(y, C, p, I, a)
  ) : null;
}
function ne({
  proxy: t
}) {
  const i = z(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return it(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const y = g.parentElement, p = Array.from(y.childNodes).indexOf(g);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: p,
      effect: t._effect
    };
    r.getState().addSignalElement(m, v);
    const n = r.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (O) {
        console.error("Error evaluating effect function during mount:", O), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const L = document.createTextNode(String(S));
    g.replaceWith(L);
  }, [t._stateKey, t._path.join("."), t._effect]), ct("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function ye(t) {
  const i = Dt(
    (m) => {
      const g = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return ct("text", {}, String(i));
}
function re({
  stateKey: t,
  itemComponentId: i,
  itemPath: m,
  children: g
}) {
  const [, y] = et({}), [C, p] = qt(), I = z(null);
  return it(() => {
    p.height > 0 && p.height !== I.current && (I.current = p.height, r.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), St(() => {
    const a = `${t}////${i}`, v = r.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return v.components.set(a, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), r.getState().stateComponents.set(t, v), () => {
      const n = r.getState().stateComponents.get(t);
      n && n.components.delete(a);
    };
  }, [t, i, m.join(".")]), /* @__PURE__ */ wt("div", { ref: C, children: g });
}
export {
  Mt as $cogsSignal,
  ye as $cogsSignalStore,
  me as addStateOptions,
  he as createCogsState,
  ve as notifyComponent,
  te as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
