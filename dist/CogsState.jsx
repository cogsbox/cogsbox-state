"use client";
import { jsx as mt } from "react/jsx-runtime";
import { useState as X, useRef as Q, useEffect as ot, useLayoutEffect as ct, useMemo as ht, createElement as at, useSyncExternalStore as xt, startTransition as Pt, useCallback as wt } from "react";
import { transformStateFunc as _t, isDeepEqual as H, isFunction as J, getNestedValue as z, getDifferences as vt, debounce as Mt } from "./utility.js";
import { pushFunc as St, updateFn as rt, cutFunc as it, ValidationWrapper as jt, FormControlComponent as Ot } from "./Functions.jsx";
import Rt from "superjson";
import { v4 as yt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Tt } from "./store.js";
import { useCogsConfig as bt } from "./CogsStateClient.jsx";
import { applyPatch as Ut } from "fast-json-patch";
import Ft from "react-use-measure";
function Et(t, c) {
  const h = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, I = h(t) || {};
  f(t, {
    ...I,
    ...c
  });
}
function At({
  stateKey: t,
  options: c,
  initialOptionsPart: h
}) {
  const f = et(t) || {}, I = h[t] || {}, $ = o.getState().setInitialStateOptions, w = { ...I, ...f };
  let p = !1;
  if (c)
    for (const a in c)
      w.hasOwnProperty(a) ? (a == "localStorage" && c[a] && w[a].key !== c[a]?.key && (p = !0, w[a] = c[a]), a == "initialState" && c[a] && w[a] !== c[a] && // Different references
      !H(w[a], c[a]) && (p = !0, w[a] = c[a])) : (p = !0, w[a] = c[a]);
  p && $(t, w);
}
function ie(t, { formElements: c, validation: h }) {
  return { initialState: t, formElements: c, validation: h };
}
const ce = (t, c) => {
  let h = t;
  const [f, I] = _t(h);
  (Object.keys(I).length > 0 || c && Object.keys(c).length > 0) && Object.keys(I).forEach((p) => {
    I[p] = I[p] || {}, I[p].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...I[p].formElements || {}
      // State-specific overrides
    }, et(p) || o.getState().setInitialStateOptions(p, I[p]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const $ = (p, a) => {
    const [y] = X(a?.componentId ?? yt());
    At({
      stateKey: p,
      options: a,
      initialOptionsPart: I
    });
    const n = o.getState().cogsStateStore[p] || f[p], m = a?.modifyState ? a.modifyState(n) : n, [L, R] = Bt(
      m,
      {
        stateKey: p,
        syncUpdate: a?.syncUpdate,
        componentId: y,
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
    return R;
  };
  function w(p, a) {
    At({ stateKey: p, options: a, initialOptionsPart: I }), a.localStorage && Ht(p, a), gt(p);
  }
  return { useCogsState: $, setCogsOptions: w };
}, {
  setUpdaterState: lt,
  setState: K,
  getInitialOptions: et,
  getKeyState: Nt,
  getValidationErrors: Dt,
  setStateLog: Wt,
  updateInitialStateGlobal: It,
  addValidationError: Lt,
  removeValidationError: q,
  setServerSyncActions: Gt
} = o.getState(), $t = (t, c, h, f, I) => {
  h?.log && console.log(
    "saving to localstorage",
    c,
    h.localStorage?.key,
    f
  );
  const $ = J(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if ($ && f) {
    const w = `${f}-${c}-${$}`;
    let p;
    try {
      p = ut(w)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: I ?? p
    }, y = Rt.serialize(a);
    window.localStorage.setItem(
      w,
      JSON.stringify(y.json)
    );
  }
}, ut = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, Ht = (t, c) => {
  const h = o.getState().cogsStateStore[t], { sessionId: f } = bt(), I = J(c?.localStorage?.key) ? c.localStorage.key(h) : c?.localStorage?.key;
  if (I && f) {
    const $ = ut(
      `${f}-${t}-${I}`
    );
    if ($ && $.lastUpdated > ($.lastSyncedWithServer || 0))
      return K(t, $.state), gt(t), !0;
  }
  return !1;
}, Vt = (t, c, h, f, I, $) => {
  const w = {
    initialState: c,
    updaterState: dt(
      t,
      f,
      I,
      $
    ),
    state: h
  };
  It(t, w.initialState), lt(t, w.updaterState), K(t, w.state);
}, gt = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const h = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || h.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((f) => f());
  });
}, le = (t, c) => {
  const h = o.getState().stateComponents.get(t);
  if (h) {
    const f = `${t}////${c}`, I = h.components.get(f);
    if ((I ? Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"] : null)?.includes("none"))
      return;
    I && I.forceUpdate();
  }
}, zt = (t, c, h, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: z(c, f),
        newValue: z(h, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: z(h, f)
      };
    case "cut":
      return {
        oldValue: z(c, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Bt(t, {
  stateKey: c,
  serverSync: h,
  localStorage: f,
  formElements: I,
  reactiveDeps: $,
  reactiveType: w,
  componentId: p,
  initialState: a,
  syncUpdate: y,
  dependencies: n,
  serverState: m
} = {}) {
  const [L, R] = X({}), { sessionId: U } = bt();
  let G = !c;
  const [v] = X(c ?? yt()), l = o.getState().stateLog[v], st = Q(/* @__PURE__ */ new Set()), Y = Q(p ?? yt()), j = Q(
    null
  );
  j.current = et(v) ?? null, ot(() => {
    if (y && y.stateKey === v && y.path?.[0]) {
      K(v, (r) => ({
        ...r,
        [y.path[0]]: y.newValue
      }));
      const e = `${y.stateKey}:${y.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: y.timeStamp,
        userId: y.userId
      });
    }
  }, [y]), ot(() => {
    if (a) {
      Et(v, {
        initialState: a
      });
      const e = j.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[v];
      if (!(i && !H(i, a) || !i) && !s)
        return;
      let u = null;
      const E = J(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      E && U && (u = ut(`${U}-${v}-${E}`));
      let T = a, A = !1;
      const P = s ? Date.now() : 0, N = u?.lastUpdated || 0, V = u?.lastSyncedWithServer || 0;
      s && P > N ? (T = e.serverState.data, A = !0) : u && N > V && (T = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(T)), o.getState().initializeShadowState(v, a), Vt(
        v,
        a,
        T,
        nt,
        Y.current,
        U
      ), A && E && U && $t(T, v, e, U, Date.now()), gt(v), (Array.isArray(w) ? w : [w || "component"]).includes("none") || R({});
    }
  }, [
    a,
    m?.status,
    m?.data,
    ...n || []
  ]), ct(() => {
    G && Et(v, {
      serverSync: h,
      formElements: I,
      initialState: a,
      localStorage: f,
      middleware: j.current?.middleware
    });
    const e = `${v}////${Y.current}`, r = o.getState().stateComponents.get(v) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: $ || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), o.getState().stateComponents.set(v, r), R({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(v));
    };
  }, []);
  const nt = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const u = `${v}-${r.join(".")}`;
      st.current.add(u);
    }
    const g = o.getState();
    K(v, (u) => {
      const E = J(e) ? e(u) : e, T = `${v}-${r.join(".")}`;
      if (T) {
        let M = !1, b = g.signalDomElements.get(T);
        if ((!b || b.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const O = r.slice(0, -1), D = z(E, O);
          if (Array.isArray(D)) {
            M = !0;
            const S = `${v}-${O.join(".")}`;
            b = g.signalDomElements.get(S);
          }
        }
        if (b) {
          const O = M ? z(E, r.slice(0, -1)) : z(E, r);
          b.forEach(({ parentId: D, position: S, effect: k }) => {
            const C = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (C) {
              const _ = Array.from(C.childNodes);
              if (_[S]) {
                const x = k ? new Function("state", `return (${k})(state)`)(O) : O;
                _[S].textContent = String(x);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (i || j.current?.validation?.key) && r && q(
        (i || j.current?.validation?.key) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      s.updateType === "cut" && j.current?.validation?.key && q(
        j.current?.validation?.key + "." + A.join(".")
      ), s.updateType === "insert" && j.current?.validation?.key && Dt(
        j.current?.validation?.key + "." + A.join(".")
      ).filter(([b, O]) => {
        let D = b?.split(".").length;
        if (b == A.join(".") && D == A.length - 1) {
          let S = b + "." + A;
          q(b), Lt(S, O);
        }
      });
      const P = g.stateComponents.get(v);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", P), P) {
        const M = vt(u, E), b = new Set(M), O = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          D,
          S
        ] of P.components.entries()) {
          let k = !1;
          const C = Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"];
          if (console.log("component", S), !C.includes("none")) {
            if (C.includes("all")) {
              S.forceUpdate();
              continue;
            }
            if (C.includes("component") && ((S.paths.has(O) || S.paths.has("")) && (k = !0), !k))
              for (const _ of b) {
                let x = _;
                for (; ; ) {
                  if (S.paths.has(x)) {
                    k = !0;
                    break;
                  }
                  const B = x.lastIndexOf(".");
                  if (B !== -1) {
                    const Z = x.substring(
                      0,
                      B
                    );
                    if (!isNaN(
                      Number(x.substring(B + 1))
                    ) && S.paths.has(Z)) {
                      k = !0;
                      break;
                    }
                    x = Z;
                  } else
                    x = "";
                  if (x === "")
                    break;
                }
                if (k) break;
              }
            if (!k && C.includes("deps") && S.depsFunction) {
              const _ = S.depsFunction(E);
              let x = !1;
              typeof _ == "boolean" ? _ && (x = !0) : H(S.deps, _) || (S.deps = _, x = !0), x && (k = !0);
            }
            k && S.forceUpdate();
          }
        }
      }
      const N = Date.now();
      r = r.map((M, b) => {
        const O = r.slice(0, -1), D = z(E, O);
        return b === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (D.length - 1).toString() : M;
      });
      const { oldValue: V, newValue: W } = zt(
        s.updateType,
        u,
        E,
        r
      ), F = {
        timeStamp: N,
        stateKey: v,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: V,
        newValue: W
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(v, r, E);
          break;
        case "insert":
          const M = r.slice(0, -1);
          g.insertShadowArrayElement(v, M, W);
          break;
        case "cut":
          const b = r.slice(0, -1), O = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(v, b, O);
          break;
      }
      if (Wt(v, (M) => {
        const O = [...M ?? [], F].reduce((D, S) => {
          const k = `${S.stateKey}:${JSON.stringify(S.path)}`, C = D.get(k);
          return C ? (C.timeStamp = Math.max(C.timeStamp, S.timeStamp), C.newValue = S.newValue, C.oldValue = C.oldValue ?? S.oldValue, C.updateType = S.updateType) : D.set(k, { ...S }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), $t(
        E,
        v,
        j.current,
        U
      ), j.current?.middleware && j.current.middleware({
        updateLog: l,
        update: F
      }), j.current?.serverSync) {
        const M = g.serverState[v], b = j.current?.serverSync;
        Gt(v, {
          syncKey: typeof b.syncKey == "string" ? b.syncKey : b.syncKey({ state: E }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (b.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[v] || (lt(
    v,
    dt(
      v,
      nt,
      Y.current,
      U
    )
  ), o.getState().cogsStateStore[v] || K(v, t), o.getState().initialStateGlobal[v] || It(v, t));
  const d = ht(() => dt(
    v,
    nt,
    Y.current,
    U
  ), [v, U]);
  return [Nt(v), d];
}
function dt(t, c, h, f) {
  const I = /* @__PURE__ */ new Map();
  let $ = 0;
  const w = (y) => {
    const n = y.join(".");
    for (const [m] of I)
      (m === n || m.startsWith(n + ".")) && I.delete(m);
    $++;
  }, p = {
    removeValidation: (y) => {
      y?.validationKey && q(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && q(n?.key), y?.validationKey && q(y.validationKey);
      const m = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), I.clear(), $++;
      const L = a(m, []), R = et(t), U = J(R?.localStorage?.key) ? R?.localStorage?.key(m) : R?.localStorage?.key, G = `${f}-${t}-${U}`;
      G && localStorage.removeItem(G), lt(t, L), K(t, m);
      const v = o.getState().stateComponents.get(t);
      return v && v.components.forEach((l) => {
        l.forceUpdate();
      }), m;
    },
    updateInitialState: (y) => {
      I.clear(), $++;
      const n = dt(
        t,
        c,
        h,
        f
      ), m = o.getState().initialStateGlobal[t], L = et(t), R = J(L?.localStorage?.key) ? L?.localStorage?.key(m) : L?.localStorage?.key, U = `${f}-${t}-${R}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), Pt(() => {
        It(t, y), o.getState().initializeShadowState(t, y), lt(t, n), K(t, y);
        const G = o.getState().stateComponents.get(t);
        G && G.components.forEach((v) => {
          v.forceUpdate();
        });
      }), {
        fetchId: (G) => n.get()[G]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const y = o.getState().serverState[t];
      return !!(y && H(y, Nt(t)));
    }
  };
  function a(y, n = [], m) {
    const L = n.map(String).join(".");
    I.get(L);
    const R = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(p).forEach((v) => {
      R[v] = p[v];
    });
    const U = {
      apply(v, l, st) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(v, l) {
        m?.validIndices && !Array.isArray(y) && (m = { ...m, validIndices: void 0 });
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
          const d = `${t}////${h}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const r = e.components.get(d);
            if (r && !r.paths.has("")) {
              const s = n.join(".");
              let i = !0;
              for (const g of r.paths)
                if (s.startsWith(g) && (s === g || s[g.length] === ".")) {
                  i = !1;
                  break;
                }
              i && r.paths.add(s);
            }
          }
        }
        if (l === "getDifferences")
          return () => vt(
            o.getState().cogsStateStore[t],
            o.getState().initialStateGlobal[t]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const d = o.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const r = o.getState().getNestedState(t, []), s = d?.validation?.key;
            try {
              const i = await e.action(r);
              if (i && !i.success && i.errors && s) {
                o.getState().removeValidationError(s), i.errors.forEach((u) => {
                  const E = [s, ...u.path].join(".");
                  o.getState().addValidationError(E, u.message);
                });
                const g = o.getState().stateComponents.get(t);
                g && g.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return i?.success && e.onSuccess ? e.onSuccess(i.data) : !i?.success && e.onError && e.onError(i.error), i;
            } catch (i) {
              return e.onError && e.onError(i), { success: !1, error: i };
            }
          };
        if (l === "_status") {
          const d = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = z(e, n);
          return H(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = z(e, n);
            return H(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = et(t), r = J(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${r}`;
            s && localStorage.removeItem(s);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(y)) {
          const d = () => m?.validIndices ? y.map((r, s) => ({
            item: r,
            originalIndex: m.validIndices[s]
          })) : o.getState().getNestedState(t, n).map((r, s) => ({
            item: r,
            originalIndex: s
          }));
          if (l === "getSelected")
            return () => {
              const e = o.getState().getSelectedIndex(t, n.join("."));
              if (e !== void 0)
                return a(
                  y[e],
                  [...n, e.toString()],
                  m
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
                overscan: s = 5,
                stickToBottom: i = !1
              } = e, g = Q(null), [u, E] = X({
                startIndex: 0,
                endIndex: 10
              }), T = Q(i), [A, P] = X(0);
              ot(() => o.getState().subscribeToShadowState(t, () => {
                P((k) => k + 1);
              }), [t]);
              const N = o().getNestedState(
                t,
                n
              ), V = N.length, { totalHeight: W, positions: F } = ht(() => {
                const S = o.getState().getShadowMetadata(t, n) || [];
                let k = 0;
                const C = [];
                for (let _ = 0; _ < V; _++) {
                  C[_] = k;
                  const x = S[_]?.virtualizer?.itemHeight;
                  k += x || r;
                }
                return { totalHeight: k, positions: C };
              }, [
                V,
                t,
                n.join("."),
                r,
                A
              ]), M = ht(() => {
                const S = Math.max(0, u.startIndex), k = Math.min(V, u.endIndex), C = Array.from(
                  { length: k - S },
                  (x, B) => S + B
                ), _ = C.map((x) => N[x]);
                return a(_, n, {
                  ...m,
                  validIndices: C
                });
              }, [u.startIndex, u.endIndex, N, V]);
              ct(() => {
                const S = g.current;
                if (!S) return;
                let k;
                const C = () => {
                  if (!S) return;
                  const { scrollTop: x } = S;
                  let B = 0, Z = V - 1;
                  for (; B <= Z; ) {
                    const ft = Math.floor((B + Z) / 2);
                    F[ft] < x ? B = ft + 1 : Z = ft - 1;
                  }
                  const pt = Math.max(0, Z - s);
                  let tt = pt;
                  const Ct = x + S.clientHeight;
                  for (; tt < V && F[tt] < Ct; )
                    tt++;
                  tt = Math.min(V, tt + s), E({ startIndex: pt, endIndex: tt });
                }, _ = () => {
                  T.current = S.scrollHeight - S.scrollTop - S.clientHeight < 1, C();
                };
                return S.addEventListener("scroll", _, {
                  passive: !0
                }), i && (k = setTimeout(() => {
                  T.current && S.scrollTo({
                    top: S.scrollHeight,
                    behavior: "auto"
                    // ALWAYS 'auto' for an instant, correct jump.
                  });
                }, 1e3)), C(), () => {
                  clearTimeout(k), S.removeEventListener("scroll", _);
                };
              }, [V, F, i]);
              const b = wt(
                (S = "smooth") => {
                  g.current && (T.current = !0, g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: S
                  }));
                },
                []
              ), O = wt(
                (S, k = "smooth") => {
                  g.current && F[S] !== void 0 && (T.current = !1, g.current.scrollTo({
                    top: F[S],
                    behavior: k
                  }));
                },
                [F]
              ), D = {
                outer: {
                  ref: g,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${W}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${F[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: M,
                virtualizerProps: D,
                scrollToBottom: b,
                scrollToIndex: O
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, E) => e(u.item, E.item)
              ), i = s.map(({ item: u }) => u), g = {
                ...m,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(i, n, g);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = d().filter(
                ({ item: u }, E) => e(u, E)
              ), i = s.map(({ item: u }) => u), g = {
                ...m,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(i, n, g);
            };
          if (l === "stateMap")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (m?.validIndices || Array.from({ length: r.length }, (i, g) => g)).map((i, g) => {
                const u = r[i], E = [...n, i.toString()], T = a(u, E, m);
                return e(u, T, {
                  register: () => {
                    const [, P] = X({}), N = `${h}-${n.join(".")}-${i}`;
                    ct(() => {
                      const V = `${t}////${N}`, W = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return W.components.set(V, {
                        forceUpdate: () => P({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(t, W), () => {
                        const F = o.getState().stateComponents.get(t);
                        F && F.components.delete(V);
                      };
                    }, [t, N]);
                  },
                  index: g,
                  originalIndex: i
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                r
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => y.map((s, i) => {
              let g;
              m?.validIndices && m.validIndices[i] !== void 0 ? g = m.validIndices[i] : g = i;
              const u = [...n, g.toString()], E = a(s, u, m);
              return e(
                s,
                E,
                i,
                y,
                a(y, n, m)
              );
            });
          if (l === "$stateMap")
            return (e) => at(qt, {
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
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (m?.validIndices || Array.from({ length: r.length }, (i, g) => g)).map((i, g) => {
                const u = r[i], E = [...n, i.toString()], T = a(u, E, m), A = `${h}-${n.join(".")}-${i}`;
                return at(Yt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: A,
                  itemPath: E,
                  children: e(
                    u,
                    T,
                    g,
                    r,
                    a(r, n, m)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const r = y;
              I.clear(), $++;
              const s = r.flatMap(
                (i) => i[e] ?? []
              );
              return a(
                s,
                [...n, "[*]", e],
                m
              );
            };
          if (l === "index")
            return (e) => {
              const r = y[e];
              return a(r, [...n, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = o.getState().getNestedState(t, n);
              if (e.length === 0) return;
              const r = e.length - 1, s = e[r], i = [...n, r.toString()];
              return a(s, i);
            };
          if (l === "insert")
            return (e) => (w(n), St(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), g = J(e) ? e(i) : e;
              let u = null;
              if (!i.some((T) => {
                if (r) {
                  const P = r.every(
                    (N) => H(T[N], g[N])
                  );
                  return P && (u = T), P;
                }
                const A = H(T, g);
                return A && (u = T), A;
              }))
                w(n), St(c, g, n, t);
              else if (s && u) {
                const T = s(u), A = i.map(
                  (P) => H(P, u) ? T : P
                );
                w(n), rt(c, A, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return w(n), it(c, n, t, e), a(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < y.length; r++)
                y[r] === e && it(c, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = y.findIndex((s) => s === e);
              r > -1 ? it(c, n, t, r) : St(c, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = d().find(
                ({ item: g }, u) => e(g, u)
              );
              if (!s) return;
              const i = [...n, s.originalIndex.toString()];
              return a(s.item, i, m);
            };
          if (l === "findWith")
            return (e, r) => {
              const i = d().find(
                ({ item: u }) => u[e] === r
              );
              if (!i) return;
              const g = [...n, i.originalIndex.toString()];
              return a(i.item, g, m);
            };
        }
        const Y = n[n.length - 1];
        if (!isNaN(Number(Y))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => it(
              c,
              d,
              t,
              Number(Y)
            );
        }
        if (l === "get")
          return () => {
            if (m?.validIndices && Array.isArray(y)) {
              const d = o.getState().getNestedState(t, n);
              return m.validIndices.map((e) => d[e]);
            }
            return o.getState().getNestedState(t, n);
          };
        if (l === "$derive")
          return (d) => kt({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => kt({
            _stateKey: t,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${t}:${n.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => ut(f + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), s = e.join(".");
            d ? o.getState().setSelectedIndex(t, s, r) : o.getState().setSelectedIndex(t, s, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            rt(c, i, e), w(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), e = Number(n[n.length - 1]), r = d.join("."), s = o.getState().getSelectedIndex(t, r);
            o.getState().setSelectedIndex(
              t,
              r,
              s === e ? void 0 : e
            );
            const i = o.getState().getNestedState(t, [...d]);
            rt(c, i, d), w(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], s = Ut(e, d).newDocument;
              Vt(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                h,
                f
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const g = vt(e, s), u = new Set(g);
                for (const [
                  E,
                  T
                ] of i.components.entries()) {
                  let A = !1;
                  const P = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
                  if (!P.includes("none")) {
                    if (P.includes("all")) {
                      T.forceUpdate();
                      continue;
                    }
                    if (P.includes("component") && (T.paths.has("") && (A = !0), !A))
                      for (const N of u) {
                        if (T.paths.has(N)) {
                          A = !0;
                          break;
                        }
                        let V = N.lastIndexOf(".");
                        for (; V !== -1; ) {
                          const W = N.substring(0, V);
                          if (T.paths.has(W)) {
                            A = !0;
                            break;
                          }
                          const F = N.substring(
                            V + 1
                          );
                          if (!isNaN(Number(F))) {
                            const M = W.lastIndexOf(".");
                            if (M !== -1) {
                              const b = W.substring(
                                0,
                                M
                              );
                              if (T.paths.has(b)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          V = W.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && P.includes("deps") && T.depsFunction) {
                      const N = T.depsFunction(s);
                      let V = !1;
                      typeof N == "boolean" ? N && (V = !0) : H(T.deps, N) || (T.deps = N, V = !0), V && (A = !0);
                    }
                    A && T.forceUpdate();
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
              q(d.key);
              const r = o.getState().cogsStateStore[t];
              try {
                const s = o.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([g]) => {
                  g && g.startsWith(d.key) && q(g);
                });
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((u) => {
                  const E = u.path, T = u.message, A = [d.key, ...E].join(".");
                  e(A, T);
                }), gt(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return h;
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
            return p.revertToInitialState;
          if (l === "updateInitialState") return p.updateInitialState;
          if (l === "removeValidation") return p.removeValidation;
        }
        if (l === "getFormRef")
          return () => Tt.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ mt(
            jt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: m?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return n;
        if (l === "_isServerSynced") return p._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Mt(() => {
                rt(c, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              rt(c, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            w(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ mt(
            Ot,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const j = [...n, l], nt = o.getState().getNestedState(t, j);
        return a(nt, j, m);
      }
    }, G = new Proxy(R, U);
    return I.set(L, {
      proxy: G,
      stateVersion: $
    }), G;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function kt(t) {
  return at(Jt, { proxy: t });
}
function qt({
  proxy: t,
  rebuildStateShape: c
}) {
  const h = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(h) ? c(
    h,
    t._path
  ).stateMapNoRender(
    (I, $, w, p, a) => t._mapFn(I, $, w, p, a)
  ) : null;
}
function Jt({
  proxy: t
}) {
  const c = Q(null), h = `${t._stateKey}-${t._path.join(".")}`;
  return ot(() => {
    const f = c.current;
    if (!f || !f.parentElement) return;
    const I = f.parentElement, w = Array.from(I.childNodes).indexOf(f);
    let p = I.getAttribute("data-parent-id");
    p || (p = `parent-${crypto.randomUUID()}`, I.setAttribute("data-parent-id", p));
    const y = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: p,
      position: w,
      effect: t._effect
    };
    o.getState().addSignalElement(h, y);
    const n = o.getState().getNestedState(t._stateKey, t._path);
    let m;
    if (t._effect)
      try {
        m = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (R) {
        console.error("Error evaluating effect function during mount:", R), m = n;
      }
    else
      m = n;
    m !== null && typeof m == "object" && (m = JSON.stringify(m));
    const L = document.createTextNode(String(m));
    f.replaceWith(L);
  }, [t._stateKey, t._path.join("."), t._effect]), at("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function de(t) {
  const c = xt(
    (h) => {
      const f = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(t._stateKey, {
        forceUpdate: h,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => f.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return at("text", {}, String(c));
}
function Yt({
  stateKey: t,
  itemComponentId: c,
  itemPath: h,
  children: f
}) {
  const [, I] = X({}), [$, w] = Ft(), p = Q(null);
  return ot(() => {
    w.height > 0 && w.height !== p.current && (p.current = w.height, o.getState().setShadowMetadata(t, h, {
      virtualizer: {
        itemHeight: w.height
      }
    }));
  }, [w.height, t, h]), ct(() => {
    const a = `${t}////${c}`, y = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return y.components.set(a, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set([h.join(".")])
    }), o.getState().stateComponents.set(t, y), () => {
      const n = o.getState().stateComponents.get(t);
      n && n.components.delete(a);
    };
  }, [t, c, h.join(".")]), /* @__PURE__ */ mt("div", { ref: $, children: f });
}
export {
  kt as $cogsSignal,
  de as $cogsSignalStore,
  ie as addStateOptions,
  ce as createCogsState,
  le as notifyComponent,
  Bt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
