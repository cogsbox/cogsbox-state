"use client";
import { jsx as It } from "react/jsx-runtime";
import { useState as Q, useRef as Z, useEffect as et, useLayoutEffect as gt, useMemo as pt, createElement as at, useSyncExternalStore as Ut, startTransition as Ot, useCallback as kt } from "react";
import { transformStateFunc as jt, isDeepEqual as z, isFunction as Y, getNestedValue as q, getDifferences as wt, debounce as Ft } from "./utility.js";
import { pushFunc as yt, updateFn as ot, cutFunc as ut, ValidationWrapper as Dt, FormControlComponent as Lt } from "./Functions.jsx";
import Wt from "superjson";
import { v4 as At } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as bt } from "./store.js";
import { useCogsConfig as Pt } from "./CogsStateClient.jsx";
import { applyPatch as Gt } from "fast-json-patch";
import Ht from "react-use-measure";
function Nt(t, i) {
  const S = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, y = S(t) || {};
  g(t, {
    ...y,
    ...i
  });
}
function Ct({
  stateKey: t,
  options: i,
  initialOptionsPart: S
}) {
  const g = tt(t) || {}, y = S[t] || {}, b = r.getState().setInitialStateOptions, p = { ...y, ...g };
  let I = !1;
  if (i)
    for (const a in i)
      p.hasOwnProperty(a) ? (a == "localStorage" && i[a] && p[a].key !== i[a]?.key && (I = !0, p[a] = i[a]), a == "initialState" && i[a] && p[a] !== i[a] && // Different references
      !z(p[a], i[a]) && (I = !0, p[a] = i[a])) : (I = !0, p[a] = i[a]);
  I && b(t, p);
}
function ge(t, { formElements: i, validation: S }) {
  return { initialState: t, formElements: i, validation: S };
}
const fe = (t, i) => {
  let S = t;
  const [g, y] = jt(S);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, tt(I) || r.getState().setInitialStateOptions(I, y[I]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const b = (I, a) => {
    const [v] = Q(a?.componentId ?? At());
    Ct({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = r.getState().cogsStateStore[I] || g[I], f = a?.modifyState ? a.modifyState(n) : n, [G, O] = Xt(
      f,
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
    Ct({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Yt(I, a), ht(I);
  }
  return { useCogsState: b, setCogsOptions: p };
}, {
  setUpdaterState: ft,
  setState: K,
  getInitialOptions: tt,
  getKeyState: _t,
  getValidationErrors: Bt,
  setStateLog: zt,
  updateInitialStateGlobal: Et,
  addValidationError: qt,
  removeValidationError: J,
  setServerSyncActions: Jt
} = r.getState(), xt = (t, i, S, g, y) => {
  S?.log && console.log(
    "saving to localstorage",
    i,
    S.localStorage?.key,
    g
  );
  const b = Y(S?.localStorage?.key) ? S.localStorage?.key(t) : S?.localStorage?.key;
  if (b && g) {
    const p = `${g}-${i}-${b}`;
    let I;
    try {
      I = mt(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Wt.serialize(a);
    window.localStorage.setItem(
      p,
      JSON.stringify(v.json)
    );
  }
}, mt = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Yt = (t, i) => {
  const S = r.getState().cogsStateStore[t], { sessionId: g } = Pt(), y = Y(i?.localStorage?.key) ? i.localStorage.key(S) : i?.localStorage?.key;
  if (y && g) {
    const b = mt(
      `${g}-${t}-${y}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return K(t, b.state), ht(t), !0;
  }
  return !1;
}, Mt = (t, i, S, g, y, b) => {
  const p = {
    initialState: i,
    updaterState: St(
      t,
      g,
      y,
      b
    ),
    state: S
  };
  Et(t, p.initialState), ft(t, p.updaterState), K(t, p.state);
}, ht = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const S = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || S.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((g) => g());
  });
}, Se = (t, i) => {
  const S = r.getState().stateComponents.get(t);
  if (S) {
    const g = `${t}////${i}`, y = S.components.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Zt = (t, i, S, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: q(i, g),
        newValue: q(S, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: q(S, g)
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
function Xt(t, {
  stateKey: i,
  serverSync: S,
  localStorage: g,
  formElements: y,
  reactiveDeps: b,
  reactiveType: p,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: f
} = {}) {
  const [G, O] = Q({}), { sessionId: j } = Pt();
  let H = !i;
  const [m] = Q(i ?? At()), l = r.getState().stateLog[m], st = Z(/* @__PURE__ */ new Set()), X = Z(I ?? At()), M = Z(
    null
  );
  M.current = tt(m) ?? null, et(() => {
    if (v && v.stateKey === m && v.path?.[0]) {
      K(m, (o) => ({
        ...o,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), et(() => {
    if (a) {
      Nt(m, {
        initialState: a
      });
      const e = M.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = r.getState().initialStateGlobal[m];
      if (!(c && !z(c, a) || !c) && !s)
        return;
      let u = null;
      const w = Y(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      w && j && (u = mt(`${j}-${m}-${w}`));
      let A = a, T = !1;
      const C = s ? Date.now() : 0, N = u?.lastUpdated || 0, R = u?.lastSyncedWithServer || 0;
      s && C > N ? (A = e.serverState.data, T = !0) : u && N > R && (A = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(A)), r.getState().initializeShadowState(m, a), Mt(
        m,
        a,
        A,
        nt,
        X.current,
        j
      ), T && w && j && xt(A, m, e, j, Date.now()), ht(m), (Array.isArray(p) ? p : [p || "component"]).includes("none") || O({});
    }
  }, [
    a,
    f?.status,
    f?.data,
    ...n || []
  ]), gt(() => {
    H && Nt(m, {
      serverSync: S,
      formElements: y,
      initialState: a,
      localStorage: g,
      middleware: M.current?.middleware
    });
    const e = `${m}////${X.current}`, o = r.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(e, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), r.getState().stateComponents.set(m, o), O({}), () => {
      o && (o.components.delete(e), o.components.size === 0 && r.getState().stateComponents.delete(m));
    };
  }, []);
  const nt = (e, o, s, c) => {
    if (Array.isArray(o)) {
      const u = `${m}-${o.join(".")}`;
      st.current.add(u);
    }
    const h = r.getState();
    K(m, (u) => {
      const w = Y(e) ? e(u) : e, A = `${m}-${o.join(".")}`;
      if (A) {
        let _ = !1, $ = h.signalDomElements.get(A);
        if ((!$ || $.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const U = o.slice(0, -1), L = q(w, U);
          if (Array.isArray(L)) {
            _ = !0;
            const k = `${m}-${U.join(".")}`;
            $ = h.signalDomElements.get(k);
          }
        }
        if ($) {
          const U = _ ? q(w, o.slice(0, -1)) : q(w, o);
          $.forEach(({ parentId: L, position: k, effect: F }) => {
            const E = document.querySelector(
              `[data-parent-id="${L}"]`
            );
            if (E) {
              const V = Array.from(E.childNodes);
              if (V[k]) {
                const P = F ? new Function("state", `return (${F})(state)`)(U) : U;
                V[k].textContent = String(P);
              }
            }
          });
        }
      }
      console.log("shadowState", h.shadowStateStore), s.updateType === "update" && (c || M.current?.validation?.key) && o && J(
        (c || M.current?.validation?.key) + "." + o.join(".")
      );
      const T = o.slice(0, o.length - 1);
      s.updateType === "cut" && M.current?.validation?.key && J(
        M.current?.validation?.key + "." + T.join(".")
      ), s.updateType === "insert" && M.current?.validation?.key && Bt(
        M.current?.validation?.key + "." + T.join(".")
      ).filter(([$, U]) => {
        let L = $?.split(".").length;
        if ($ == T.join(".") && L == T.length - 1) {
          let k = $ + "." + T;
          J($), qt(k, U);
        }
      });
      const C = h.stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", C), C) {
        const _ = wt(u, w), $ = new Set(_), U = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          L,
          k
        ] of C.components.entries()) {
          let F = !1;
          const E = Array.isArray(k.reactiveType) ? k.reactiveType : [k.reactiveType || "component"];
          if (console.log("component", k), !E.includes("none")) {
            if (E.includes("all")) {
              k.forceUpdate();
              continue;
            }
            if (E.includes("component") && ((k.paths.has(U) || k.paths.has("")) && (F = !0), !F))
              for (const V of $) {
                let P = V;
                for (; ; ) {
                  if (k.paths.has(P)) {
                    F = !0;
                    break;
                  }
                  const W = P.lastIndexOf(".");
                  if (W !== -1) {
                    const B = P.substring(
                      0,
                      W
                    );
                    if (!isNaN(
                      Number(P.substring(W + 1))
                    ) && k.paths.has(B)) {
                      F = !0;
                      break;
                    }
                    P = B;
                  } else
                    P = "";
                  if (P === "")
                    break;
                }
                if (F) break;
              }
            if (!F && E.includes("deps") && k.depsFunction) {
              const V = k.depsFunction(w);
              let P = !1;
              typeof V == "boolean" ? V && (P = !0) : z(k.deps, V) || (k.deps = V, P = !0), P && (F = !0);
            }
            F && k.forceUpdate();
          }
        }
      }
      const N = Date.now();
      o = o.map((_, $) => {
        const U = o.slice(0, -1), L = q(w, U);
        return $ === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (L.length - 1).toString() : _;
      });
      const { oldValue: R, newValue: D } = Zt(
        s.updateType,
        u,
        w,
        o
      ), x = {
        timeStamp: N,
        stateKey: m,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: R,
        newValue: D
      };
      switch (s.updateType) {
        case "update":
          h.updateShadowAtPath(m, o, w);
          break;
        case "insert":
          const _ = o.slice(0, -1);
          h.insertShadowArrayElement(m, _, D);
          break;
        case "cut":
          const $ = o.slice(0, -1), U = parseInt(o[o.length - 1]);
          h.removeShadowArrayElement(m, $, U);
          break;
      }
      if (zt(m, (_) => {
        const U = [..._ ?? [], x].reduce((L, k) => {
          const F = `${k.stateKey}:${JSON.stringify(k.path)}`, E = L.get(F);
          return E ? (E.timeStamp = Math.max(E.timeStamp, k.timeStamp), E.newValue = k.newValue, E.oldValue = E.oldValue ?? k.oldValue, E.updateType = k.updateType) : L.set(F, { ...k }), L;
        }, /* @__PURE__ */ new Map());
        return Array.from(U.values());
      }), xt(
        w,
        m,
        M.current,
        j
      ), M.current?.middleware && M.current.middleware({
        updateLog: l,
        update: x
      }), M.current?.serverSync) {
        const _ = h.serverState[m], $ = M.current?.serverSync;
        Jt(m, {
          syncKey: typeof $.syncKey == "string" ? $.syncKey : $.syncKey({ state: w }),
          rollBackState: _,
          actionTimeStamp: Date.now() + ($.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return w;
    });
  };
  r.getState().updaterState[m] || (ft(
    m,
    St(
      m,
      nt,
      X.current,
      j
    )
  ), r.getState().cogsStateStore[m] || K(m, t), r.getState().initialStateGlobal[m] || Et(m, t));
  const d = pt(() => St(
    m,
    nt,
    X.current,
    j
  ), [m, j]);
  return [_t(m), d];
}
function St(t, i, S, g) {
  const y = /* @__PURE__ */ new Map();
  let b = 0;
  const p = (v) => {
    const n = v.join(".");
    for (const [f] of y)
      (f === n || f.startsWith(n + ".")) && y.delete(f);
    b++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && J(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = r.getState().getInitialOptions(t)?.validation;
      n?.key && J(n?.key), v?.validationKey && J(v.validationKey);
      const f = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), y.clear(), b++;
      const G = a(f, []), O = tt(t), j = Y(O?.localStorage?.key) ? O?.localStorage?.key(f) : O?.localStorage?.key, H = `${g}-${t}-${j}`;
      H && localStorage.removeItem(H), ft(t, G), K(t, f);
      const m = r.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), f;
    },
    updateInitialState: (v) => {
      y.clear(), b++;
      const n = St(
        t,
        i,
        S,
        g
      ), f = r.getState().initialStateGlobal[t], G = tt(t), O = Y(G?.localStorage?.key) ? G?.localStorage?.key(f) : G?.localStorage?.key, j = `${g}-${t}-${O}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), Ot(() => {
        Et(t, v), r.getState().initializeShadowState(t, v), ft(t, n), K(t, v);
        const H = r.getState().stateComponents.get(t);
        H && H.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (H) => n.get()[H]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const v = r.getState().serverState[t];
      return !!(v && z(v, _t(t)));
    }
  };
  function a(v, n = [], f) {
    const G = n.map(String).join(".");
    y.get(G);
    const O = function() {
      return r().getNestedState(t, n);
    };
    Object.keys(I).forEach((m) => {
      O[m] = I[m];
    });
    const j = {
      apply(m, l, st) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, n);
      },
      get(m, l) {
        f?.validIndices && !Array.isArray(v) && (f = { ...f, validIndices: void 0 });
        const st = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !st.has(l)) {
          const d = `${t}////${S}`, e = r.getState().stateComponents.get(t);
          if (e) {
            const o = e.components.get(d);
            if (o && !o.paths.has("")) {
              const s = n.join(".");
              let c = !0;
              for (const h of o.paths)
                if (s.startsWith(h) && (s === h || s[h.length] === ".")) {
                  c = !1;
                  break;
                }
              c && o.paths.add(s);
            }
          }
        }
        if (l === "getDifferences")
          return () => wt(
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
                const h = r.getState().stateComponents.get(t);
                h && h.components.forEach((u) => {
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
          return z(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              t,
              n
            ), e = r.getState().initialStateGlobal[t], o = q(e, n);
            return z(d, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[t], e = tt(t), o = Y(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${g}-${t}-${o}`;
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
          const d = () => f?.validIndices ? v.map((o, s) => ({
            item: o,
            originalIndex: f.validIndices[s]
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
                  f
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
                dependencies: h = []
              } = e, u = Z(null), [w, A] = Q({
                startIndex: 0,
                endIndex: 10
              }), T = Z(c), C = Z(0), [N, R] = Q(0);
              et(() => r.getState().subscribeToShadowState(t, () => {
                R((V) => V + 1);
              }), [t]);
              const D = r().getNestedState(
                t,
                n
              ), x = D.length, { totalHeight: _, positions: $ } = pt(() => {
                const E = r.getState().getShadowMetadata(t, n) || [];
                let V = 0;
                const P = [];
                for (let W = 0; W < x; W++) {
                  P[W] = V;
                  const B = E[W]?.virtualizer?.itemHeight;
                  V += B || o;
                }
                return { totalHeight: V, positions: P };
              }, [
                x,
                t,
                n.join("."),
                o,
                N
              ]), U = pt(() => {
                const E = Math.max(0, w.startIndex), V = Math.min(x, w.endIndex), P = Array.from(
                  { length: V - E },
                  (B, it) => E + it
                ), W = P.map((B) => D[B]);
                return a(W, n, {
                  ...f,
                  validIndices: P
                });
              }, [w.startIndex, w.endIndex, D, x]);
              gt(() => {
                const E = u.current;
                if (!E) return;
                const V = x > C.current, P = c && T.current && V, W = () => {
                  const { scrollTop: rt, clientHeight: Tt } = E;
                  let ct = 0, lt = x - 1;
                  for (; ct <= lt; ) {
                    const vt = Math.floor((ct + lt) / 2);
                    $[vt] < rt ? ct = vt + 1 : lt = vt - 1;
                  }
                  const $t = Math.max(0, lt - s);
                  let dt = $t;
                  const Rt = rt + Tt;
                  for (; dt < x && $[dt] < Rt; )
                    dt++;
                  A({
                    startIndex: $t,
                    endIndex: Math.min(x, dt + s)
                  });
                };
                let B;
                P ? (console.log("ALGORITHM: Auto-scroll triggered."), console.log(
                  "...Setting range to the end to render last item."
                ), A({
                  startIndex: Math.max(0, x - 10 - s),
                  endIndex: x
                }), console.log("...Starting loop to wait for measurement."), B = setInterval(() => {
                  const rt = x - 1;
                  ((r.getState().getShadowMetadata(t, n) || [])[rt]?.virtualizer?.itemHeight || 0) > 0 ? (console.log(
                    "%c...SUCCESS: Last item measured. Scrolling.",
                    "color: green; font-weight: bold;"
                  ), clearInterval(B), E.scrollTo({
                    top: E.scrollHeight,
                    behavior: "smooth"
                  })) : console.log("...WAITING for measurement.");
                }, 100)) : W();
                const it = () => {
                  E.scrollHeight - E.scrollTop - E.clientHeight < 1 || (T.current = !1), W();
                };
                return E.addEventListener("scroll", it, {
                  passive: !0
                }), () => {
                  E.removeEventListener("scroll", it), B && clearInterval(B);
                };
              }, [x, $, ...h]), et(() => {
                C.current = x;
              });
              const L = kt(
                (E = "smooth") => {
                  u.current && (T.current = !0, console.log("USER ACTION: Scroll lock ENABLED."), u.current.scrollTo({
                    top: u.current.scrollHeight,
                    behavior: E
                  }));
                },
                []
              ), k = kt(
                (E, V = "smooth") => {
                  u.current && $[E] !== void 0 && (T.current = !1, console.log("USER ACTION: Scroll lock DISABLED."), u.current.scrollTo({
                    top: $[E],
                    behavior: V
                  }));
                },
                [$]
              ), F = {
                outer: {
                  ref: u,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${_}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${$[w.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: U,
                virtualizerProps: F,
                scrollToBottom: L,
                scrollToIndex: k
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, w) => e(u.item, w.item)
              ), c = s.map(({ item: u }) => u), h = {
                ...f,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(c, n, h);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = d().filter(
                ({ item: u }, w) => e(u, w)
              ), c = s.map(({ item: u }) => u), h = {
                ...f,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(c, n, h);
            };
          if (l === "stateMap")
            return (e) => {
              const o = r.getState().getNestedState(t, n);
              return Array.isArray(o) ? (f?.validIndices || Array.from({ length: o.length }, (c, h) => h)).map((c, h) => {
                const u = o[c], w = [...n, c.toString()], A = a(u, w, f);
                return e(u, A, {
                  register: () => {
                    const [, C] = Q({}), N = `${S}-${n.join(".")}-${c}`;
                    gt(() => {
                      const R = `${t}////${N}`, D = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set(R, {
                        forceUpdate: () => C({}),
                        paths: /* @__PURE__ */ new Set([w.join(".")])
                      }), r.getState().stateComponents.set(t, D), () => {
                        const x = r.getState().stateComponents.get(t);
                        x && x.components.delete(R);
                      };
                    }, [t, N]);
                  },
                  index: h,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                o
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => v.map((s, c) => {
              let h;
              f?.validIndices && f.validIndices[c] !== void 0 ? h = f.validIndices[c] : h = c;
              const u = [...n, h.toString()], w = a(s, u, f);
              return e(
                s,
                w,
                c,
                v,
                a(v, n, f)
              );
            });
          if (l === "$stateMap")
            return (e) => at(Qt, {
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
              return Array.isArray(o) ? (f?.validIndices || Array.from({ length: o.length }, (c, h) => h)).map((c, h) => {
                const u = o[c], w = [...n, c.toString()], A = a(u, w, f), T = `${S}-${n.join(".")}-${c}`;
                return at(te, {
                  key: c,
                  stateKey: t,
                  itemComponentId: T,
                  itemPath: w,
                  children: e(
                    u,
                    A,
                    h,
                    o,
                    a(o, n, f)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const o = v;
              y.clear(), b++;
              const s = o.flatMap(
                (c) => c[e] ?? []
              );
              return a(
                s,
                [...n, "[*]", e],
                f
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
            return (e) => (p(n), yt(i, e, n, t), a(
              r.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, o, s) => {
              const c = r.getState().getNestedState(t, n), h = Y(e) ? e(c) : e;
              let u = null;
              if (!c.some((A) => {
                if (o) {
                  const C = o.every(
                    (N) => z(A[N], h[N])
                  );
                  return C && (u = A), C;
                }
                const T = z(A, h);
                return T && (u = A), T;
              }))
                p(n), yt(i, h, n, t);
              else if (s && u) {
                const A = s(u), T = c.map(
                  (C) => z(C, u) ? A : C
                );
                p(n), ot(i, T, n);
              }
            };
          if (l === "cut")
            return (e, o) => {
              if (!o?.waitForSync)
                return p(n), ut(i, n, t, e), a(
                  r.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let o = 0; o < v.length; o++)
                v[o] === e && ut(i, n, t, o);
            };
          if (l === "toggleByValue")
            return (e) => {
              const o = v.findIndex((s) => s === e);
              o > -1 ? ut(i, n, t, o) : yt(i, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = d().find(
                ({ item: h }, u) => e(h, u)
              );
              if (!s) return;
              const c = [...n, s.originalIndex.toString()];
              return a(s.item, c, f);
            };
          if (l === "findWith")
            return (e, o) => {
              const c = d().find(
                ({ item: u }) => u[e] === o
              );
              if (!c) return;
              const h = [...n, c.originalIndex.toString()];
              return a(c.item, h, f);
            };
        }
        const X = n[n.length - 1];
        if (!isNaN(Number(X))) {
          const d = n.slice(0, -1), e = r.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => ut(
              i,
              d,
              t,
              Number(X)
            );
        }
        if (l === "get")
          return () => {
            if (f?.validIndices && Array.isArray(v)) {
              const d = r.getState().getNestedState(t, n);
              return f.validIndices.map((e) => d[e]);
            }
            return r.getState().getNestedState(t, n);
          };
        if (l === "$derive")
          return (d) => Vt({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Vt({
            _stateKey: t,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${t}:${n.join(".")}`;
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => mt(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), o = r.getState().getNestedState(t, d);
          return Array.isArray(o) ? Number(n[n.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), o = Number(n[n.length - 1]), s = e.join(".");
            d ? r.getState().setSelectedIndex(t, s, o) : r.getState().setSelectedIndex(t, s, void 0);
            const c = r.getState().getNestedState(t, [...e]);
            ot(i, c, e), p(e);
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
            ot(i, c, d), p(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = r.getState().cogsStateStore[t], s = Gt(e, d).newDocument;
              Mt(
                t,
                r.getState().initialStateGlobal[t],
                s,
                i,
                S,
                g
              );
              const c = r.getState().stateComponents.get(t);
              if (c) {
                const h = wt(e, s), u = new Set(h);
                for (const [
                  w,
                  A
                ] of c.components.entries()) {
                  let T = !1;
                  const C = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
                  if (!C.includes("none")) {
                    if (C.includes("all")) {
                      A.forceUpdate();
                      continue;
                    }
                    if (C.includes("component") && (A.paths.has("") && (T = !0), !T))
                      for (const N of u) {
                        if (A.paths.has(N)) {
                          T = !0;
                          break;
                        }
                        let R = N.lastIndexOf(".");
                        for (; R !== -1; ) {
                          const D = N.substring(0, R);
                          if (A.paths.has(D)) {
                            T = !0;
                            break;
                          }
                          const x = N.substring(
                            R + 1
                          );
                          if (!isNaN(Number(x))) {
                            const _ = D.lastIndexOf(".");
                            if (_ !== -1) {
                              const $ = D.substring(
                                0,
                                _
                              );
                              if (A.paths.has($)) {
                                T = !0;
                                break;
                              }
                            }
                          }
                          R = D.lastIndexOf(".");
                        }
                        if (T) break;
                      }
                    if (!T && C.includes("deps") && A.depsFunction) {
                      const N = A.depsFunction(s);
                      let R = !1;
                      typeof N == "boolean" ? N && (R = !0) : z(A.deps, N) || (A.deps = N, R = !0), R && (T = !0);
                    }
                    T && A.forceUpdate();
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
              J(d.key);
              const o = r.getState().cogsStateStore[t];
              try {
                const s = r.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([h]) => {
                  h && h.startsWith(d.key) && J(h);
                });
                const c = d.zodSchema.safeParse(o);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const w = u.path, A = u.message, T = [d.key, ...w].join(".");
                  e(T, A);
                }), ht(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return S;
          if (l === "getComponents")
            return () => r().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => bt.getState().getFormRefsByStateKey(t);
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
          return () => bt.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ It(
            Dt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: f?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return n;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Ft(() => {
                ot(i, d, n, "");
                const o = r.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(o);
              }, e.debounce);
            else {
              ot(i, d, n, "");
              const o = r.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(o);
            }
            p(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ It(
            Lt,
            {
              setState: i,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const M = [...n, l], nt = r.getState().getNestedState(t, M);
        return a(nt, M, f);
      }
    }, H = new Proxy(O, j);
    return y.set(G, {
      proxy: H,
      stateVersion: b
    }), H;
  }
  return a(
    r.getState().getNestedState(t, [])
  );
}
function Vt(t) {
  return at(Kt, { proxy: t });
}
function Qt({
  proxy: t,
  rebuildStateShape: i
}) {
  const S = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(S) ? i(
    S,
    t._path
  ).stateMapNoRender(
    (y, b, p, I, a) => t._mapFn(y, b, p, I, a)
  ) : null;
}
function Kt({
  proxy: t
}) {
  const i = Z(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return et(() => {
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
    r.getState().addSignalElement(S, v);
    const n = r.getState().getNestedState(t._stateKey, t._path);
    let f;
    if (t._effect)
      try {
        f = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (O) {
        console.error("Error evaluating effect function during mount:", O), f = n;
      }
    else
      f = n;
    f !== null && typeof f == "object" && (f = JSON.stringify(f));
    const G = document.createTextNode(String(f));
    g.replaceWith(G);
  }, [t._stateKey, t._path.join("."), t._effect]), at("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function me(t) {
  const i = Ut(
    (S) => {
      const g = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return at("text", {}, String(i));
}
function te({
  stateKey: t,
  itemComponentId: i,
  itemPath: S,
  children: g
}) {
  const [, y] = Q({}), [b, p] = Ht(), I = Z(null);
  return et(() => {
    p.height > 0 && p.height !== I.current && (I.current = p.height, r.getState().setShadowMetadata(t, S, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, S]), gt(() => {
    const a = `${t}////${i}`, v = r.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return v.components.set(a, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set([S.join(".")])
    }), r.getState().stateComponents.set(t, v), () => {
      const n = r.getState().stateComponents.get(t);
      n && n.components.delete(a);
    };
  }, [t, i, S.join(".")]), /* @__PURE__ */ It("div", { ref: b, children: g });
}
export {
  Vt as $cogsSignal,
  me as $cogsSignalStore,
  ge as addStateOptions,
  fe as createCogsState,
  Se as notifyComponent,
  Xt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
