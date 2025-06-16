"use client";
import { jsx as mt } from "react/jsx-runtime";
import { useState as Z, useRef as X, useEffect as et, useLayoutEffect as ct, useMemo as ht, createElement as at, useSyncExternalStore as Ct, startTransition as xt, useCallback as pt } from "react";
import { transformStateFunc as Pt, isDeepEqual as z, isFunction as J, getNestedValue as B, getDifferences as vt, debounce as _t } from "./utility.js";
import { pushFunc as St, updateFn as ot, cutFunc as it, ValidationWrapper as Mt, FormControlComponent as jt } from "./Functions.jsx";
import Ot from "superjson";
import { v4 as yt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as wt } from "./store.js";
import { useCogsConfig as kt } from "./CogsStateClient.jsx";
import { applyPatch as Rt } from "fast-json-patch";
import Ut from "react-use-measure";
function Tt(t, c) {
  const h = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, I = h(t) || {};
  f(t, {
    ...I,
    ...c
  });
}
function Et({
  stateKey: t,
  options: c,
  initialOptionsPart: h
}) {
  const f = tt(t) || {}, I = h[t] || {}, $ = o.getState().setInitialStateOptions, w = { ...I, ...f };
  let p = !1;
  if (c)
    for (const a in c)
      w.hasOwnProperty(a) ? (a == "localStorage" && c[a] && w[a].key !== c[a]?.key && (p = !0, w[a] = c[a]), a == "initialState" && c[a] && w[a] !== c[a] && // Different references
      !z(w[a], c[a]) && (p = !0, w[a] = c[a])) : (p = !0, w[a] = c[a]);
  p && $(t, w);
}
function se(t, { formElements: c, validation: h }) {
  return { initialState: t, formElements: c, validation: h };
}
const ie = (t, c) => {
  let h = t;
  const [f, I] = Pt(h);
  (Object.keys(I).length > 0 || c && Object.keys(c).length > 0) && Object.keys(I).forEach((p) => {
    I[p] = I[p] || {}, I[p].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...I[p].formElements || {}
      // State-specific overrides
    }, tt(p) || o.getState().setInitialStateOptions(p, I[p]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const $ = (p, a) => {
    const [y] = Z(a?.componentId ?? yt());
    Et({
      stateKey: p,
      options: a,
      initialOptionsPart: I
    });
    const n = o.getState().cogsStateStore[p] || f[p], S = a?.modifyState ? a.modifyState(n) : n, [L, R] = zt(
      S,
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
    Et({ stateKey: p, options: a, initialOptionsPart: I }), a.localStorage && Gt(p, a), gt(p);
  }
  return { useCogsState: $, setCogsOptions: w };
}, {
  setUpdaterState: lt,
  setState: Q,
  getInitialOptions: tt,
  getKeyState: bt,
  getValidationErrors: Ft,
  setStateLog: Dt,
  updateInitialStateGlobal: It,
  addValidationError: Wt,
  removeValidationError: q,
  setServerSyncActions: Lt
} = o.getState(), At = (t, c, h, f, I) => {
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
    }, y = Ot.serialize(a);
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
}, Gt = (t, c) => {
  const h = o.getState().cogsStateStore[t], { sessionId: f } = kt(), I = J(c?.localStorage?.key) ? c.localStorage.key(h) : c?.localStorage?.key;
  if (I && f) {
    const $ = ut(
      `${f}-${t}-${I}`
    );
    if ($ && $.lastUpdated > ($.lastSyncedWithServer || 0))
      return Q(t, $.state), gt(t), !0;
  }
  return !1;
}, Nt = (t, c, h, f, I, $) => {
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
  It(t, w.initialState), lt(t, w.updaterState), Q(t, w.state);
}, gt = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const h = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || h.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((f) => f());
  });
}, ce = (t, c) => {
  const h = o.getState().stateComponents.get(t);
  if (h) {
    const f = `${t}////${c}`, I = h.components.get(f);
    if ((I ? Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"] : null)?.includes("none"))
      return;
    I && I.forceUpdate();
  }
}, Ht = (t, c, h, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: B(c, f),
        newValue: B(h, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: B(h, f)
      };
    case "cut":
      return {
        oldValue: B(c, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function zt(t, {
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
  serverState: S
} = {}) {
  const [L, R] = Z({}), { sessionId: U } = kt();
  let G = !c;
  const [v] = Z(c ?? yt()), l = o.getState().stateLog[v], st = X(/* @__PURE__ */ new Set()), Y = X(p ?? yt()), j = X(
    null
  );
  j.current = tt(v) ?? null, et(() => {
    if (y && y.stateKey === v && y.path?.[0]) {
      Q(v, (r) => ({
        ...r,
        [y.path[0]]: y.newValue
      }));
      const e = `${y.stateKey}:${y.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: y.timeStamp,
        userId: y.userId
      });
    }
  }, [y]), et(() => {
    if (a) {
      Tt(v, {
        initialState: a
      });
      const e = j.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[v];
      if (!(i && !z(i, a) || !i) && !s)
        return;
      let g = null;
      const E = J(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      E && U && (g = ut(`${U}-${v}-${E}`));
      let T = a, A = !1;
      const P = s ? Date.now() : 0, V = g?.lastUpdated || 0, b = g?.lastSyncedWithServer || 0;
      s && P > V ? (T = e.serverState.data, A = !0) : g && V > b && (T = g.state, e?.localStorage?.onChange && e?.localStorage?.onChange(T)), o.getState().initializeShadowState(v, a), Nt(
        v,
        a,
        T,
        nt,
        Y.current,
        U
      ), A && E && U && At(T, v, e, U, Date.now()), gt(v), (Array.isArray(w) ? w : [w || "component"]).includes("none") || R({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), ct(() => {
    G && Tt(v, {
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
      const g = `${v}-${r.join(".")}`;
      st.current.add(g);
    }
    const u = o.getState();
    Q(v, (g) => {
      const E = J(e) ? e(g) : e, T = `${v}-${r.join(".")}`;
      if (T) {
        let M = !1, N = u.signalDomElements.get(T);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const O = r.slice(0, -1), D = B(E, O);
          if (Array.isArray(D)) {
            M = !0;
            const m = `${v}-${O.join(".")}`;
            N = u.signalDomElements.get(m);
          }
        }
        if (N) {
          const O = M ? B(E, r.slice(0, -1)) : B(E, r);
          N.forEach(({ parentId: D, position: m, effect: k }) => {
            const C = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (C) {
              const _ = Array.from(C.childNodes);
              if (_[m]) {
                const x = k ? new Function("state", `return (${k})(state)`)(O) : O;
                _[m].textContent = String(x);
              }
            }
          });
        }
      }
      console.log("shadowState", u.shadowStateStore), s.updateType === "update" && (i || j.current?.validation?.key) && r && q(
        (i || j.current?.validation?.key) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      s.updateType === "cut" && j.current?.validation?.key && q(
        j.current?.validation?.key + "." + A.join(".")
      ), s.updateType === "insert" && j.current?.validation?.key && Ft(
        j.current?.validation?.key + "." + A.join(".")
      ).filter(([N, O]) => {
        let D = N?.split(".").length;
        if (N == A.join(".") && D == A.length - 1) {
          let m = N + "." + A;
          q(N), Wt(m, O);
        }
      });
      const P = u.stateComponents.get(v);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", P), P) {
        const M = vt(g, E), N = new Set(M), O = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          D,
          m
        ] of P.components.entries()) {
          let k = !1;
          const C = Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"];
          if (console.log("component", m), !C.includes("none")) {
            if (C.includes("all")) {
              m.forceUpdate();
              continue;
            }
            if (C.includes("component") && ((m.paths.has(O) || m.paths.has("")) && (k = !0), !k))
              for (const _ of N) {
                let x = _;
                for (; ; ) {
                  if (m.paths.has(x)) {
                    k = !0;
                    break;
                  }
                  const H = x.lastIndexOf(".");
                  if (H !== -1) {
                    const rt = x.substring(
                      0,
                      H
                    );
                    if (!isNaN(
                      Number(x.substring(H + 1))
                    ) && m.paths.has(rt)) {
                      k = !0;
                      break;
                    }
                    x = rt;
                  } else
                    x = "";
                  if (x === "")
                    break;
                }
                if (k) break;
              }
            if (!k && C.includes("deps") && m.depsFunction) {
              const _ = m.depsFunction(E);
              let x = !1;
              typeof _ == "boolean" ? _ && (x = !0) : z(m.deps, _) || (m.deps = _, x = !0), x && (k = !0);
            }
            k && m.forceUpdate();
          }
        }
      }
      const V = Date.now();
      r = r.map((M, N) => {
        const O = r.slice(0, -1), D = B(E, O);
        return N === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (D.length - 1).toString() : M;
      });
      const { oldValue: b, newValue: W } = Ht(
        s.updateType,
        g,
        E,
        r
      ), F = {
        timeStamp: V,
        stateKey: v,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: b,
        newValue: W
      };
      switch (s.updateType) {
        case "update":
          u.updateShadowAtPath(v, r, E);
          break;
        case "insert":
          const M = r.slice(0, -1);
          u.insertShadowArrayElement(v, M, W);
          break;
        case "cut":
          const N = r.slice(0, -1), O = parseInt(r[r.length - 1]);
          u.removeShadowArrayElement(v, N, O);
          break;
      }
      if (Dt(v, (M) => {
        const O = [...M ?? [], F].reduce((D, m) => {
          const k = `${m.stateKey}:${JSON.stringify(m.path)}`, C = D.get(k);
          return C ? (C.timeStamp = Math.max(C.timeStamp, m.timeStamp), C.newValue = m.newValue, C.oldValue = C.oldValue ?? m.oldValue, C.updateType = m.updateType) : D.set(k, { ...m }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), At(
        E,
        v,
        j.current,
        U
      ), j.current?.middleware && j.current.middleware({
        updateLog: l,
        update: F
      }), j.current?.serverSync) {
        const M = u.serverState[v], N = j.current?.serverSync;
        Lt(v, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: E }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
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
  ), o.getState().cogsStateStore[v] || Q(v, t), o.getState().initialStateGlobal[v] || It(v, t));
  const d = ht(() => dt(
    v,
    nt,
    Y.current,
    U
  ), [v, U]);
  return [bt(v), d];
}
function dt(t, c, h, f) {
  const I = /* @__PURE__ */ new Map();
  let $ = 0;
  const w = (y) => {
    const n = y.join(".");
    for (const [S] of I)
      (S === n || S.startsWith(n + ".")) && I.delete(S);
    $++;
  }, p = {
    removeValidation: (y) => {
      y?.validationKey && q(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && q(n?.key), y?.validationKey && q(y.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), I.clear(), $++;
      const L = a(S, []), R = tt(t), U = J(R?.localStorage?.key) ? R?.localStorage?.key(S) : R?.localStorage?.key, G = `${f}-${t}-${U}`;
      G && localStorage.removeItem(G), lt(t, L), Q(t, S);
      const v = o.getState().stateComponents.get(t);
      return v && v.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (y) => {
      I.clear(), $++;
      const n = dt(
        t,
        c,
        h,
        f
      ), S = o.getState().initialStateGlobal[t], L = tt(t), R = J(L?.localStorage?.key) ? L?.localStorage?.key(S) : L?.localStorage?.key, U = `${f}-${t}-${R}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), xt(() => {
        It(t, y), o.getState().initializeShadowState(t, y), lt(t, n), Q(t, y);
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
      return !!(y && z(y, bt(t)));
    }
  };
  function a(y, n = [], S) {
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
        S?.validIndices && !Array.isArray(y) && (S = { ...S, validIndices: void 0 });
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
              for (const u of r.paths)
                if (s.startsWith(u) && (s === u || s[u.length] === ".")) {
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
                o.getState().removeValidationError(s), i.errors.forEach((g) => {
                  const E = [s, ...g.path].join(".");
                  o.getState().addValidationError(E, g.message);
                });
                const u = o.getState().stateComponents.get(t);
                u && u.components.forEach((g) => {
                  g.forceUpdate();
                });
              }
              return i?.success && e.onSuccess ? e.onSuccess(i.data) : !i?.success && e.onError && e.onError(i.error), i;
            } catch (i) {
              return e.onError && e.onError(i), { success: !1, error: i };
            }
          };
        if (l === "_status") {
          const d = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = B(e, n);
          return z(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = B(e, n);
            return z(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = tt(t), r = J(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${r}`;
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
          const d = () => S?.validIndices ? y.map((r, s) => ({
            item: r,
            originalIndex: S.validIndices[s]
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
                  S
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
              } = e, u = X(null), [g, E] = Z({
                startIndex: 0,
                endIndex: 10
              }), T = X(i), [A, P] = Z(0);
              et(() => o.getState().subscribeToShadowState(t, () => {
                P((k) => k + 1);
              }), [t]);
              const V = o().getNestedState(
                t,
                n
              ), b = V.length, { totalHeight: W, positions: F } = ht(() => {
                const m = o.getState().getShadowMetadata(t, n) || [];
                let k = 0;
                const C = [];
                for (let _ = 0; _ < b; _++) {
                  C[_] = k;
                  const x = m[_]?.virtualizer?.itemHeight;
                  k += x || r;
                }
                return { totalHeight: k, positions: C };
              }, [
                b,
                t,
                n.join("."),
                r,
                A
              ]), M = ht(() => {
                const m = Math.max(0, g.startIndex), k = Math.min(b, g.endIndex), C = Array.from(
                  { length: k - m },
                  (x, H) => m + H
                ), _ = C.map((x) => V[x]);
                return a(_, n, {
                  ...S,
                  validIndices: C
                });
              }, [g.startIndex, g.endIndex, V, b]);
              ct(() => {
                const m = u.current;
                if (!m) return;
                const k = () => {
                  if (!m) return;
                  const { scrollTop: _ } = m;
                  let x = 0, H = b - 1;
                  for (; x <= H; ) {
                    const ft = Math.floor((x + H) / 2);
                    F[ft] < _ ? x = ft + 1 : H = ft - 1;
                  }
                  const rt = Math.max(0, H - s);
                  let K = rt;
                  const Vt = _ + m.clientHeight;
                  for (; K < b && F[K] < Vt; )
                    K++;
                  K = Math.min(b, K + s), E({ startIndex: rt, endIndex: K });
                }, C = () => {
                  T.current = m.scrollHeight - m.scrollTop - m.clientHeight < 1, k();
                };
                return m.addEventListener("scroll", C, {
                  passive: !0
                }), k(), () => {
                  m.removeEventListener("scroll", C);
                };
              }, [b, F]), et(() => {
                i && u.current && b > 0 && (u.current.scrollTop = 999999999);
              }, [b, i]);
              const N = pt(
                (m = "smooth") => {
                  u.current && (T.current = !0, u.current.scrollTo({
                    top: u.current.scrollHeight,
                    behavior: m
                  }));
                },
                []
              ), O = pt(
                (m, k = "smooth") => {
                  u.current && F[m] !== void 0 && (T.current = !1, u.current.scrollTo({
                    top: F[m],
                    behavior: k
                  }));
                },
                [F]
              ), D = {
                outer: {
                  ref: u,
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
                    transform: `translateY(${F[g.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: M,
                virtualizerProps: D,
                scrollToBottom: N,
                scrollToIndex: O
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (g, E) => e(g.item, E.item)
              ), i = s.map(({ item: g }) => g), u = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: g }) => g
                )
              };
              return a(i, n, u);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = d().filter(
                ({ item: g }, E) => e(g, E)
              ), i = s.map(({ item: g }) => g), u = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: g }) => g
                )
              };
              return a(i, n, u);
            };
          if (l === "stateMap")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (i, u) => u)).map((i, u) => {
                const g = r[i], E = [...n, i.toString()], T = a(g, E, S);
                return e(g, T, {
                  register: () => {
                    const [, P] = Z({}), V = `${h}-${n.join(".")}-${i}`;
                    ct(() => {
                      const b = `${t}////${V}`, W = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return W.components.set(b, {
                        forceUpdate: () => P({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(t, W), () => {
                        const F = o.getState().stateComponents.get(t);
                        F && F.components.delete(b);
                      };
                    }, [t, V]);
                  },
                  index: u,
                  originalIndex: i
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                r
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => y.map((s, i) => {
              let u;
              S?.validIndices && S.validIndices[i] !== void 0 ? u = S.validIndices[i] : u = i;
              const g = [...n, u.toString()], E = a(s, g, S);
              return e(
                s,
                E,
                i,
                y,
                a(y, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => at(Bt, {
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
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (i, u) => u)).map((i, u) => {
                const g = r[i], E = [...n, i.toString()], T = a(g, E, S), A = `${h}-${n.join(".")}-${i}`;
                return at(Jt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: A,
                  itemPath: E,
                  children: e(
                    g,
                    T,
                    u,
                    r,
                    a(r, n, S)
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
                S
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
              const i = o.getState().getNestedState(t, n), u = J(e) ? e(i) : e;
              let g = null;
              if (!i.some((T) => {
                if (r) {
                  const P = r.every(
                    (V) => z(T[V], u[V])
                  );
                  return P && (g = T), P;
                }
                const A = z(T, u);
                return A && (g = T), A;
              }))
                w(n), St(c, u, n, t);
              else if (s && g) {
                const T = s(g), A = i.map(
                  (P) => z(P, g) ? T : P
                );
                w(n), ot(c, A, n);
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
                ({ item: u }, g) => e(u, g)
              );
              if (!s) return;
              const i = [...n, s.originalIndex.toString()];
              return a(s.item, i, S);
            };
          if (l === "findWith")
            return (e, r) => {
              const i = d().find(
                ({ item: g }) => g[e] === r
              );
              if (!i) return;
              const u = [...n, i.originalIndex.toString()];
              return a(i.item, u, S);
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
            if (S?.validIndices && Array.isArray(y)) {
              const d = o.getState().getNestedState(t, n);
              return S.validIndices.map((e) => d[e]);
            }
            return o.getState().getNestedState(t, n);
          };
        if (l === "$derive")
          return (d) => $t({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => $t({
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
            ot(c, i, e), w(e);
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
            ot(c, i, d), w(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], s = Rt(e, d).newDocument;
              Nt(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                h,
                f
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const u = vt(e, s), g = new Set(u);
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
                      for (const V of g) {
                        if (T.paths.has(V)) {
                          A = !0;
                          break;
                        }
                        let b = V.lastIndexOf(".");
                        for (; b !== -1; ) {
                          const W = V.substring(0, b);
                          if (T.paths.has(W)) {
                            A = !0;
                            break;
                          }
                          const F = V.substring(
                            b + 1
                          );
                          if (!isNaN(Number(F))) {
                            const M = W.lastIndexOf(".");
                            if (M !== -1) {
                              const N = W.substring(
                                0,
                                M
                              );
                              if (T.paths.has(N)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          b = W.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && P.includes("deps") && T.depsFunction) {
                      const V = T.depsFunction(s);
                      let b = !1;
                      typeof V == "boolean" ? V && (b = !0) : z(T.deps, V) || (T.deps = V, b = !0), b && (A = !0);
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
                s && s.length > 0 && s.forEach(([u]) => {
                  u && u.startsWith(d.key) && q(u);
                });
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((g) => {
                  const E = g.path, T = g.message, A = [d.key, ...E].join(".");
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
            return () => wt.getState().getFormRefsByStateKey(t);
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
          return () => wt.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ mt(
            Mt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: S?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return n;
        if (l === "_isServerSynced") return p._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              _t(() => {
                ot(c, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              ot(c, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            w(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ mt(
            jt,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const j = [...n, l], nt = o.getState().getNestedState(t, j);
        return a(nt, j, S);
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
function $t(t) {
  return at(qt, { proxy: t });
}
function Bt({
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
function qt({
  proxy: t
}) {
  const c = X(null), h = `${t._stateKey}-${t._path.join(".")}`;
  return et(() => {
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
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (R) {
        console.error("Error evaluating effect function during mount:", R), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const L = document.createTextNode(String(S));
    f.replaceWith(L);
  }, [t._stateKey, t._path.join("."), t._effect]), at("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function le(t) {
  const c = Ct(
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
function Jt({
  stateKey: t,
  itemComponentId: c,
  itemPath: h,
  children: f
}) {
  const [, I] = Z({}), [$, w] = Ut(), p = X(null);
  return et(() => {
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
  $t as $cogsSignal,
  le as $cogsSignalStore,
  se as addStateOptions,
  ie as createCogsState,
  ce as notifyComponent,
  zt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
