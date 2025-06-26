"use client";
import { jsx as vt } from "react/jsx-runtime";
import { useState as rt, useRef as X, useEffect as tt, useLayoutEffect as $t, useMemo as yt, createElement as it, useSyncExternalStore as Rt, startTransition as Mt, useCallback as gt } from "react";
import { transformStateFunc as Ot, isDeepEqual as q, isFunction as Q, getNestedValue as J, getDifferences as It, debounce as jt } from "./utility.js";
import { pushFunc as ht, updateFn as at, cutFunc as ut, ValidationWrapper as Ut, FormControlComponent as Ft } from "./Functions.jsx";
import Dt from "superjson";
import { v4 as wt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Tt } from "./store.js";
import { useCogsConfig as xt } from "./CogsStateClient.jsx";
import { applyPatch as Lt } from "fast-json-patch";
import Gt from "react-use-measure";
function kt(t, s) {
  const S = o.getState().getInitialOptions, u = o.getState().setInitialStateOptions, v = S(t) || {};
  u(t, {
    ...v,
    ...s
  });
}
function At({
  stateKey: t,
  options: s,
  initialOptionsPart: S
}) {
  const u = nt(t) || {}, v = S[t] || {}, $ = o.getState().setInitialStateOptions, I = { ...v, ...u };
  let y = !1;
  if (s)
    for (const i in s)
      I.hasOwnProperty(i) ? (i == "localStorage" && s[i] && I[i].key !== s[i]?.key && (y = !0, I[i] = s[i]), i == "initialState" && s[i] && I[i] !== s[i] && // Different references
      !q(I[i], s[i]) && (y = !0, I[i] = s[i])) : (y = !0, I[i] = s[i]);
  y && $(t, I);
}
function le(t, { formElements: s, validation: S }) {
  return { initialState: t, formElements: s, validation: S };
}
const de = (t, s) => {
  let S = t;
  const [u, v] = Ot(S);
  (Object.keys(v).length > 0 || s && Object.keys(s).length > 0) && Object.keys(v).forEach((y) => {
    v[y] = v[y] || {}, v[y].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...v[y].formElements || {}
      // State-specific overrides
    }, nt(y) || o.getState().setInitialStateOptions(y, v[y]);
  }), o.getState().setInitialStates(u), o.getState().setCreatedState(u);
  const $ = (y, i) => {
    const [h] = rt(i?.componentId ?? wt());
    At({
      stateKey: y,
      options: i,
      initialOptionsPart: v
    });
    const n = o.getState().cogsStateStore[y] || u[y], g = i?.modifyState ? i.modifyState(n) : n, [W, F] = Jt(
      g,
      {
        stateKey: y,
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
    return F;
  };
  function I(y, i) {
    At({ stateKey: y, options: i, initialOptionsPart: v }), i.localStorage && Bt(y, i), st(y);
  }
  return { useCogsState: $, setCogsOptions: I };
}, {
  setUpdaterState: ft,
  setState: et,
  getInitialOptions: nt,
  getKeyState: Nt,
  getValidationErrors: Wt,
  setStateLog: zt,
  updateInitialStateGlobal: pt,
  addValidationError: Pt,
  removeValidationError: Z,
  setServerSyncActions: Ht
} = o.getState(), bt = (t, s, S, u, v) => {
  S?.log && console.log(
    "saving to localstorage",
    s,
    S.localStorage?.key,
    u
  );
  const $ = Q(S?.localStorage?.key) ? S.localStorage?.key(t) : S?.localStorage?.key;
  if ($ && u) {
    const I = `${u}-${s}-${$}`;
    let y;
    try {
      y = mt(I)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: v ?? y
    }, h = Dt.serialize(i);
    window.localStorage.setItem(
      I,
      JSON.stringify(h.json)
    );
  }
}, mt = (t) => {
  if (!t) return null;
  try {
    const s = window.localStorage.getItem(t);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, Bt = (t, s) => {
  const S = o.getState().cogsStateStore[t], { sessionId: u } = xt(), v = Q(s?.localStorage?.key) ? s.localStorage.key(S) : s?.localStorage?.key;
  if (v && u) {
    const $ = mt(
      `${u}-${t}-${v}`
    );
    if ($ && $.lastUpdated > ($.lastSyncedWithServer || 0))
      return et(t, $.state), st(t), !0;
  }
  return !1;
}, Ct = (t, s, S, u, v, $) => {
  const I = {
    initialState: s,
    updaterState: St(
      t,
      u,
      v,
      $
    ),
    state: S
  };
  pt(t, I.initialState), ft(t, I.updaterState), et(t, I.state);
}, st = (t) => {
  const s = o.getState().stateComponents.get(t);
  if (!s) return;
  const S = /* @__PURE__ */ new Set();
  s.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || S.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((u) => u());
  });
}, ue = (t, s) => {
  const S = o.getState().stateComponents.get(t);
  if (S) {
    const u = `${t}////${s}`, v = S.components.get(u);
    if ((v ? Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"] : null)?.includes("none"))
      return;
    v && v.forceUpdate();
  }
}, qt = (t, s, S, u) => {
  switch (t) {
    case "update":
      return {
        oldValue: J(s, u),
        newValue: J(S, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: J(S, u)
      };
    case "cut":
      return {
        oldValue: J(s, u),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Jt(t, {
  stateKey: s,
  serverSync: S,
  localStorage: u,
  formElements: v,
  reactiveDeps: $,
  reactiveType: I,
  componentId: y,
  initialState: i,
  syncUpdate: h,
  dependencies: n,
  serverState: g
} = {}) {
  const [W, F] = rt({}), { sessionId: D } = xt();
  let H = !s;
  const [f] = rt(s ?? wt()), l = o.getState().stateLog[f], ct = X(/* @__PURE__ */ new Set()), K = X(y ?? wt()), M = X(
    null
  );
  M.current = nt(f) ?? null, tt(() => {
    if (h && h.stateKey === f && h.path?.[0]) {
      et(f, (r) => ({
        ...r,
        [h.path[0]]: h.newValue
      }));
      const e = `${h.stateKey}:${h.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: h.timeStamp,
        userId: h.userId
      });
    }
  }, [h]), tt(() => {
    if (i) {
      kt(f, {
        initialState: i
      });
      const e = M.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = o.getState().initialStateGlobal[f];
      if (!(c && !q(c, i) || !c) && !a)
        return;
      let m = null;
      const k = Q(e?.localStorage?.key) ? e?.localStorage?.key(i) : e?.localStorage?.key;
      k && D && (m = mt(`${D}-${f}-${k}`));
      let p = i, V = !1;
      const _ = a ? Date.now() : 0, N = m?.lastUpdated || 0, O = m?.lastSyncedWithServer || 0;
      a && _ > N ? (p = e.serverState.data, V = !0) : m && N > O && (p = m.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), o.getState().initializeShadowState(f, i), Ct(
        f,
        i,
        p,
        ot,
        K.current,
        D
      ), V && k && D && bt(p, f, e, D, Date.now()), st(f), (Array.isArray(I) ? I : [I || "component"]).includes("none") || F({});
    }
  }, [
    i,
    g?.status,
    g?.data,
    ...n || []
  ]), $t(() => {
    H && kt(f, {
      serverSync: S,
      formElements: v,
      initialState: i,
      localStorage: u,
      middleware: M.current?.middleware
    });
    const e = `${f}////${K.current}`, r = o.getState().stateComponents.get(f) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => F({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: $ || void 0,
      reactiveType: I ?? ["component", "deps"]
    }), o.getState().stateComponents.set(f, r), F({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(f));
    };
  }, []);
  const ot = (e, r, a, c) => {
    if (Array.isArray(r)) {
      const m = `${f}-${r.join(".")}`;
      ct.current.add(m);
    }
    const w = o.getState();
    et(f, (m) => {
      const k = Q(e) ? e(m) : e, p = `${f}-${r.join(".")}`;
      if (p) {
        let R = !1, E = w.signalDomElements.get(p);
        if ((!E || E.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const j = r.slice(0, -1), L = J(k, j);
          if (Array.isArray(L)) {
            R = !0;
            const A = `${f}-${j.join(".")}`;
            E = w.signalDomElements.get(A);
          }
        }
        if (E) {
          const j = R ? J(k, r.slice(0, -1)) : J(k, r);
          E.forEach(({ parentId: L, position: A, effect: G }) => {
            const U = document.querySelector(
              `[data-parent-id="${L}"]`
            );
            if (U) {
              const b = Array.from(U.childNodes);
              if (b[A]) {
                const T = G ? new Function("state", `return (${G})(state)`)(j) : j;
                b[A].textContent = String(T);
              }
            }
          });
        }
      }
      console.log("shadowState", w.shadowStateStore), a.updateType === "update" && (c || M.current?.validation?.key) && r && Z(
        (c || M.current?.validation?.key) + "." + r.join(".")
      );
      const V = r.slice(0, r.length - 1);
      a.updateType === "cut" && M.current?.validation?.key && Z(
        M.current?.validation?.key + "." + V.join(".")
      ), a.updateType === "insert" && M.current?.validation?.key && Wt(
        M.current?.validation?.key + "." + V.join(".")
      ).filter(([E, j]) => {
        let L = E?.split(".").length;
        if (E == V.join(".") && L == V.length - 1) {
          let A = E + "." + V;
          Z(E), Pt(A, j);
        }
      });
      const _ = w.stateComponents.get(f);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", _), _) {
        const R = It(m, k), E = new Set(R), j = a.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          L,
          A
        ] of _.components.entries()) {
          let G = !1;
          const U = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (console.log("component", A), !U.includes("none")) {
            if (U.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if (U.includes("component") && ((A.paths.has(j) || A.paths.has("")) && (G = !0), !G))
              for (const b of E) {
                let T = b;
                for (; ; ) {
                  if (A.paths.has(T)) {
                    G = !0;
                    break;
                  }
                  const C = T.lastIndexOf(".");
                  if (C !== -1) {
                    const P = T.substring(
                      0,
                      C
                    );
                    if (!isNaN(
                      Number(T.substring(C + 1))
                    ) && A.paths.has(P)) {
                      G = !0;
                      break;
                    }
                    T = P;
                  } else
                    T = "";
                  if (T === "")
                    break;
                }
                if (G) break;
              }
            if (!G && U.includes("deps") && A.depsFunction) {
              const b = A.depsFunction(k);
              let T = !1;
              typeof b == "boolean" ? b && (T = !0) : q(A.deps, b) || (A.deps = b, T = !0), T && (G = !0);
            }
            G && A.forceUpdate();
          }
        }
      }
      const N = Date.now();
      r = r.map((R, E) => {
        const j = r.slice(0, -1), L = J(k, j);
        return E === r.length - 1 && ["insert", "cut"].includes(a.updateType) ? (L.length - 1).toString() : R;
      });
      const { oldValue: O, newValue: B } = qt(
        a.updateType,
        m,
        k,
        r
      ), x = {
        timeStamp: N,
        stateKey: f,
        path: r,
        updateType: a.updateType,
        status: "new",
        oldValue: O,
        newValue: B
      };
      switch (a.updateType) {
        case "update":
          w.updateShadowAtPath(f, r, k);
          break;
        case "insert":
          const R = r.slice(0, -1);
          w.insertShadowArrayElement(f, R, B);
          break;
        case "cut":
          const E = r.slice(0, -1), j = parseInt(r[r.length - 1]);
          w.removeShadowArrayElement(f, E, j);
          break;
      }
      if (zt(f, (R) => {
        const j = [...R ?? [], x].reduce((L, A) => {
          const G = `${A.stateKey}:${JSON.stringify(A.path)}`, U = L.get(G);
          return U ? (U.timeStamp = Math.max(U.timeStamp, A.timeStamp), U.newValue = A.newValue, U.oldValue = U.oldValue ?? A.oldValue, U.updateType = A.updateType) : L.set(G, { ...A }), L;
        }, /* @__PURE__ */ new Map());
        return Array.from(j.values());
      }), bt(
        k,
        f,
        M.current,
        D
      ), M.current?.middleware && M.current.middleware({
        updateLog: l,
        update: x
      }), M.current?.serverSync) {
        const R = w.serverState[f], E = M.current?.serverSync;
        Ht(f, {
          syncKey: typeof E.syncKey == "string" ? E.syncKey : E.syncKey({ state: k }),
          rollBackState: R,
          actionTimeStamp: Date.now() + (E.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return k;
    });
  };
  o.getState().updaterState[f] || (ft(
    f,
    St(
      f,
      ot,
      K.current,
      D
    )
  ), o.getState().cogsStateStore[f] || et(f, t), o.getState().initialStateGlobal[f] || pt(f, t));
  const d = yt(() => St(
    f,
    ot,
    K.current,
    D
  ), [f, D]);
  return [Nt(f), d];
}
function St(t, s, S, u) {
  const v = /* @__PURE__ */ new Map();
  let $ = 0;
  const I = (h) => {
    const n = h.join(".");
    for (const [g] of v)
      (g === n || g.startsWith(n + ".")) && v.delete(g);
    $++;
  }, y = {
    removeValidation: (h) => {
      h?.validationKey && Z(h.validationKey);
    },
    revertToInitialState: (h) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && Z(n?.key), h?.validationKey && Z(h.validationKey);
      const g = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), v.clear(), $++;
      const W = i(g, []), F = nt(t), D = Q(F?.localStorage?.key) ? F?.localStorage?.key(g) : F?.localStorage?.key, H = `${u}-${t}-${D}`;
      H && localStorage.removeItem(H), ft(t, W), et(t, g);
      const f = o.getState().stateComponents.get(t);
      return f && f.components.forEach((l) => {
        l.forceUpdate();
      }), g;
    },
    updateInitialState: (h) => {
      v.clear(), $++;
      const n = St(
        t,
        s,
        S,
        u
      ), g = o.getState().initialStateGlobal[t], W = nt(t), F = Q(W?.localStorage?.key) ? W?.localStorage?.key(g) : W?.localStorage?.key, D = `${u}-${t}-${F}`;
      return localStorage.getItem(D) && localStorage.removeItem(D), Mt(() => {
        pt(t, h), o.getState().initializeShadowState(t, h), ft(t, n), et(t, h);
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
      const h = o.getState().serverState[t];
      return !!(h && q(h, Nt(t)));
    }
  };
  function i(h, n = [], g) {
    const W = n.map(String).join(".");
    v.get(W);
    const F = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(y).forEach((f) => {
      F[f] = y[f];
    });
    const D = {
      apply(f, l, ct) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(f, l) {
        g?.validIndices && !Array.isArray(h) && (g = { ...g, validIndices: void 0 });
        const ct = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !ct.has(l)) {
          const d = `${t}////${S}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const r = e.components.get(d);
            if (r && !r.paths.has("")) {
              const a = n.join(".");
              let c = !0;
              for (const w of r.paths)
                if (a.startsWith(w) && (a === w || a[w.length] === ".")) {
                  c = !1;
                  break;
                }
              c && r.paths.add(a);
            }
          }
        }
        if (l === "getDifferences")
          return () => It(
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
                o.getState().removeValidationError(a), c.errors.forEach((m) => {
                  const k = [a, ...m.path].join(".");
                  o.getState().addValidationError(k, m.message);
                });
                const w = o.getState().stateComponents.get(t);
                w && w.components.forEach((m) => {
                  m.forceUpdate();
                });
              }
              return c?.success && e.onSuccess ? e.onSuccess(c.data) : !c?.success && e.onError && e.onError(c.error), c;
            } catch (c) {
              return e.onError && e.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = J(e, n);
          return q(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = J(e, n);
            return q(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = nt(t), r = Q(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${u}-${t}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(h)) {
          const d = () => g?.validIndices ? h.map((r, a) => ({
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
                return i(
                  h[e],
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
                dependencies: w = []
              } = e, m = X(null), [k, p] = rt({
                startIndex: 0,
                endIndex: 10
              }), [V, _] = rt(0), N = X(!0), O = X(0);
              tt(() => o.getState().subscribeToShadowState(t, () => {
                _((T) => T + 1);
              }), [t]);
              const B = o().getNestedState(
                t,
                n
              ), x = B.length, { totalHeight: R, positions: E } = yt(() => {
                const b = o.getState().getShadowMetadata(t, n) || [];
                let T = 0;
                const C = [];
                for (let P = 0; P < x; P++) {
                  C[P] = T;
                  const z = b[P]?.virtualizer?.itemHeight;
                  T += z || r;
                }
                return { totalHeight: T, positions: C };
              }, [
                x,
                t,
                n.join("."),
                r,
                V
              ]), j = yt(() => {
                const b = Math.max(0, k.startIndex), T = Math.min(x, k.endIndex), C = Array.from(
                  { length: T - b },
                  (z, lt) => b + lt
                ), P = C.map((z) => B[z]);
                return i(P, n, {
                  ...g,
                  validIndices: C
                });
              }, [k.startIndex, k.endIndex, B, x]), L = gt(() => {
                const b = o.getState().getShadowMetadata(t, n) || [], T = x - 1;
                if (T >= 0) {
                  const C = b[T];
                  if (C?.virtualizer?.domRef) {
                    const P = C.virtualizer.domRef;
                    if (P && P.scrollIntoView)
                      return P.scrollIntoView({
                        behavior: "auto",
                        block: "end",
                        inline: "nearest"
                      }), !0;
                  }
                }
                return !1;
              }, [t, n, x]);
              tt(() => {
                if (!c || x === 0) return;
                const b = x > O.current, T = O.current === 0 && x > 0;
                if ((b || T) && N.current) {
                  const C = Math.ceil(
                    m.current?.clientHeight || 0 / r
                  ), P = {
                    startIndex: Math.max(
                      0,
                      x - C - a
                    ),
                    endIndex: x
                  };
                  p(P);
                  const z = setTimeout(() => {
                    !L() && m.current && (m.current.scrollTop = m.current.scrollHeight);
                  }, 50);
                  return O.current = x, () => clearTimeout(z);
                }
                O.current = x;
              }, [x]), tt(() => {
                const b = m.current;
                if (!b) return;
                const T = () => {
                  const { scrollTop: C, scrollHeight: P, clientHeight: z } = b, lt = P - C - z;
                  N.current = lt < 100;
                  let dt = 0;
                  for (let Y = 0; Y < E.length; Y++)
                    if (E[Y] > C - r * a) {
                      dt = Math.max(0, Y - 1);
                      break;
                    }
                  let Et = dt;
                  const _t = C + z;
                  for (let Y = dt; Y < E.length && !(E[Y] > _t + r * a); Y++)
                    Et = Y;
                  p({
                    startIndex: Math.max(0, dt),
                    endIndex: Math.min(x, Et + 1 + a)
                  });
                };
                return b.addEventListener("scroll", T, {
                  passive: !0
                }), c && x > 0 && (b.scrollTop = b.scrollHeight), T(), () => {
                  b.removeEventListener("scroll", T);
                };
              }, [E, x, r, a, c]);
              const A = gt(() => {
                N.current = !0, !L() && m.current && (m.current.scrollTop = m.current.scrollHeight);
              }, [L]), G = gt(
                (b, T = "smooth") => {
                  const P = (o.getState().getShadowMetadata(t, n) || [])[b];
                  if (P?.virtualizer?.domRef) {
                    const z = P.virtualizer.domRef;
                    if (z && z.scrollIntoView) {
                      z.scrollIntoView({ behavior: T, block: "center" });
                      return;
                    }
                  }
                  m.current && E[b] !== void 0 && m.current.scrollTo({
                    top: E[b],
                    behavior: T
                  });
                },
                [E, t, n]
              ), U = {
                outer: {
                  ref: m,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${R}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${E[k.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: j,
                virtualizerProps: U,
                scrollToBottom: A,
                scrollToIndex: G
              };
            };
          if (l === "stateMapNoRender")
            return (e) => h.map((a, c) => {
              let w;
              g?.validIndices && g.validIndices[c] !== void 0 ? w = g.validIndices[c] : w = c;
              const m = [...n, w.toString()], k = i(a, m, g);
              return e(
                a,
                k,
                c,
                h,
                i(h, n, g)
              );
            });
          if (l === "$stateMap")
            return (e) => it(Yt, {
              proxy: {
                _stateKey: t,
                _path: n,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: i
            });
          if (l === "stateList")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (g?.validIndices || Array.from({ length: r.length }, (c, w) => w)).map((c, w) => {
                const m = r[c], k = [...n, c.toString()], p = i(m, k, g), V = `${S}-${n.join(".")}-${c}`;
                return it(Xt, {
                  key: c,
                  stateKey: t,
                  itemComponentId: V,
                  itemPath: k,
                  children: e(
                    m,
                    p,
                    { localIndex: w, originalIndex: c },
                    r,
                    i(r, n, g)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const r = h;
              v.clear(), $++;
              const a = r.flatMap(
                (c) => c[e] ?? []
              );
              return i(
                a,
                [...n, "[*]", e],
                g
              );
            };
          if (l === "index")
            return (e) => {
              const r = h[e];
              return i(r, [...n, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = o.getState().getNestedState(t, n);
              if (e.length === 0) return;
              const r = e.length - 1, a = e[r], c = [...n, r.toString()];
              return i(a, c);
            };
          if (l === "insert")
            return (e) => (I(n), ht(s, e, n, t), i(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, a) => {
              const c = o.getState().getNestedState(t, n), w = Q(e) ? e(c) : e;
              let m = null;
              if (!c.some((p) => {
                if (r) {
                  const _ = r.every(
                    (N) => q(p[N], w[N])
                  );
                  return _ && (m = p), _;
                }
                const V = q(p, w);
                return V && (m = p), V;
              }))
                I(n), ht(s, w, n, t);
              else if (a && m) {
                const p = a(m), V = c.map(
                  (_) => q(_, m) ? p : _
                );
                I(n), at(s, V, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return I(n), ut(s, n, t, e), i(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < h.length; r++)
                h[r] === e && ut(s, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = h.findIndex((a) => a === e);
              r > -1 ? ut(s, n, t, r) : ht(s, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const a = d().find(
                ({ item: w }, m) => e(w, m)
              );
              if (!a) return;
              const c = [...n, a.originalIndex.toString()];
              return i(a.item, c, g);
            };
          if (l === "findWith")
            return (e, r) => {
              const c = d().find(
                ({ item: m }) => m[e] === r
              );
              if (!c) return;
              const w = [...n, c.originalIndex.toString()];
              return i(c.item, w, g);
            };
        }
        const K = n[n.length - 1];
        if (!isNaN(Number(K))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => ut(
              s,
              d,
              t,
              Number(K)
            );
        }
        if (l === "get")
          return () => {
            if (g?.validIndices && Array.isArray(h)) {
              const d = o.getState().getNestedState(t, n);
              return g.validIndices.map((e) => d[e]);
            }
            return o.getState().getNestedState(t, n);
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
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => mt(u + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), a = e.join(".");
            d ? o.getState().setSelectedIndex(t, a, r) : o.getState().setSelectedIndex(t, a, void 0);
            const c = o.getState().getNestedState(t, [...e]);
            at(s, c, e), I(e);
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
            at(s, c, d), I(d);
          };
        if (n.length == 0) {
          if (l === "addValidation")
            return (d) => {
              const e = o.getState().getInitialOptions(t)?.validation;
              if (!e?.key)
                throw new Error("Validation key not found");
              Z(e.key), console.log("addValidationError", d), d.forEach((r) => {
                const a = [e.key, ...r.path].join(".");
                console.log("fullErrorPath", a), Pt(a, r.message);
              }), st(t);
            };
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], a = Lt(e, d).newDocument;
              Ct(
                t,
                o.getState().initialStateGlobal[t],
                a,
                s,
                S,
                u
              );
              const c = o.getState().stateComponents.get(t);
              if (c) {
                const w = It(e, a), m = new Set(w);
                for (const [
                  k,
                  p
                ] of c.components.entries()) {
                  let V = !1;
                  const _ = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!_.includes("none")) {
                    if (_.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (_.includes("component") && (p.paths.has("") && (V = !0), !V))
                      for (const N of m) {
                        if (p.paths.has(N)) {
                          V = !0;
                          break;
                        }
                        let O = N.lastIndexOf(".");
                        for (; O !== -1; ) {
                          const B = N.substring(0, O);
                          if (p.paths.has(B)) {
                            V = !0;
                            break;
                          }
                          const x = N.substring(
                            O + 1
                          );
                          if (!isNaN(Number(x))) {
                            const R = B.lastIndexOf(".");
                            if (R !== -1) {
                              const E = B.substring(
                                0,
                                R
                              );
                              if (p.paths.has(E)) {
                                V = !0;
                                break;
                              }
                            }
                          }
                          O = B.lastIndexOf(".");
                        }
                        if (V) break;
                      }
                    if (!V && _.includes("deps") && p.depsFunction) {
                      const N = p.depsFunction(a);
                      let O = !1;
                      typeof N == "boolean" ? N && (O = !0) : q(p.deps, N) || (p.deps = N, O = !0), O && (V = !0);
                    }
                    V && p.forceUpdate();
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
              Z(d.key);
              const r = o.getState().cogsStateStore[t];
              try {
                const a = o.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([w]) => {
                  w && w.startsWith(d.key) && Z(w);
                });
                const c = d.zodSchema.safeParse(r);
                return c.success ? !0 : (c.error.errors.forEach((m) => {
                  const k = m.path, p = m.message, V = [d.key, ...k].join(".");
                  e(V, p);
                }), st(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return S;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => Tt.getState().getFormRefsByStateKey(t);
          if (l === "_initialState")
            return o.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return o.getState().serverState[t];
          if (l === "_isLoading")
            return o.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return y.revertToInitialState;
          if (l === "updateInitialState") return y.updateInitialState;
          if (l === "removeValidation") return y.removeValidation;
        }
        if (l === "getFormRef")
          return () => Tt.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ vt(
            Ut,
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
        if (l === "_isServerSynced") return y._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              jt(() => {
                at(s, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              at(s, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            I(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ vt(
            Ft,
            {
              setState: s,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const M = [...n, l], ot = o.getState().getNestedState(t, M);
        return i(ot, M, g);
      }
    }, H = new Proxy(F, D);
    return v.set(W, {
      proxy: H,
      stateVersion: $
    }), H;
  }
  return i(
    o.getState().getNestedState(t, [])
  );
}
function Vt(t) {
  return it(Zt, { proxy: t });
}
function Yt({
  proxy: t,
  rebuildStateShape: s
}) {
  const S = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(S) ? s(
    S,
    t._path
  ).stateMapNoRender(
    (v, $, I, y, i) => t._mapFn(v, $, I, y, i)
  ) : null;
}
function Zt({
  proxy: t
}) {
  const s = X(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return tt(() => {
    const u = s.current;
    if (!u || !u.parentElement) return;
    const v = u.parentElement, I = Array.from(v.childNodes).indexOf(u);
    let y = v.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, v.setAttribute("data-parent-id", y));
    const h = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: I,
      effect: t._effect
    };
    o.getState().addSignalElement(S, h);
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
    const W = document.createTextNode(String(g));
    u.replaceWith(W);
  }, [t._stateKey, t._path.join("."), t._effect]), it("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function ge(t) {
  const s = Rt(
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
  return it("text", {}, String(s));
}
function Xt({
  stateKey: t,
  itemComponentId: s,
  itemPath: S,
  children: u
}) {
  const [, v] = rt({}), [$, I] = Gt(), y = X(null), i = X(null), h = gt(
    (n) => {
      $(n), y.current = n;
    },
    [$]
  );
  return tt(() => {
    I.height > 0 && I.height !== i.current && (i.current = I.height, o.getState().setShadowMetadata(t, S, {
      virtualizer: {
        itemHeight: I.height,
        domRef: y.current
        // Store the actual DOM element reference
      }
    }));
  }, [I.height, t, S]), $t(() => {
    const n = `${t}////${s}`, g = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return g.components.set(n, {
      forceUpdate: () => v({}),
      paths: /* @__PURE__ */ new Set([S.join(".")])
    }), o.getState().stateComponents.set(t, g), () => {
      const W = o.getState().stateComponents.get(t);
      W && W.components.delete(n);
    };
  }, [t, s, S.join(".")]), /* @__PURE__ */ vt("div", { ref: h, children: u });
}
export {
  Vt as $cogsSignal,
  ge as $cogsSignalStore,
  le as addStateOptions,
  de as createCogsState,
  ue as notifyComponent,
  Jt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
