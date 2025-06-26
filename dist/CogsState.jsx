"use client";
import { jsx as Tt } from "react/jsx-runtime";
import { useState as et, useRef as K, useEffect as nt, useLayoutEffect as kt, useMemo as Et, createElement as dt, useSyncExternalStore as Ut, startTransition as Ft, useCallback as xt } from "react";
import { transformStateFunc as Dt, isDeepEqual as Y, isFunction as rt, getNestedValue as Z, getDifferences as $t, debounce as Wt } from "./utility.js";
import { pushFunc as wt, updateFn as lt, cutFunc as mt, ValidationWrapper as Lt, FormControlComponent as Gt } from "./Functions.jsx";
import Bt from "superjson";
import { v4 as At } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Vt } from "./store.js";
import { useCogsConfig as Mt } from "./CogsStateClient.jsx";
import { applyPatch as Ht } from "fast-json-patch";
import zt from "react-use-measure";
function Nt(t, c) {
  const S = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, y = S(t) || {};
  g(t, {
    ...y,
    ...c
  });
}
function Ct({
  stateKey: t,
  options: c,
  initialOptionsPart: S
}) {
  const g = it(t) || {}, y = S[t] || {}, k = o.getState().setInitialStateOptions, w = { ...y, ...g };
  let I = !1;
  if (c)
    for (const s in c)
      w.hasOwnProperty(s) ? (s == "localStorage" && c[s] && w[s].key !== c[s]?.key && (I = !0, w[s] = c[s]), s == "initialState" && c[s] && w[s] !== c[s] && // Different references
      !Y(w[s], c[s]) && (I = !0, w[s] = c[s])) : (I = !0, w[s] = c[s]);
  I && k(t, w);
}
function fe(t, { formElements: c, validation: S }) {
  return { initialState: t, formElements: c, validation: S };
}
const Se = (t, c) => {
  let S = t;
  const [g, y] = Dt(S);
  (Object.keys(y).length > 0 || c && Object.keys(c).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, it(I) || o.getState().setInitialStateOptions(I, y[I]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const k = (I, s) => {
    const [h] = et(s?.componentId ?? At());
    Ct({
      stateKey: I,
      options: s,
      initialOptionsPart: y
    });
    const r = o.getState().cogsStateStore[I] || g[I], f = s?.modifyState ? s.modifyState(r) : r, [G, O] = Qt(
      f,
      {
        stateKey: I,
        syncUpdate: s?.syncUpdate,
        componentId: h,
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
    return O;
  };
  function w(I, s) {
    Ct({ stateKey: I, options: s, initialOptionsPart: y }), s.localStorage && Zt(I, s), ut(I);
  }
  return { useCogsState: k, setCogsOptions: w };
}, {
  setUpdaterState: ht,
  setState: at,
  getInitialOptions: it,
  getKeyState: jt,
  getValidationErrors: qt,
  setStateLog: Jt,
  updateInitialStateGlobal: bt,
  addValidationError: Rt,
  removeValidationError: Q,
  setServerSyncActions: Yt
} = o.getState(), Pt = (t, c, S, g, y) => {
  S?.log && console.log(
    "saving to localstorage",
    c,
    S.localStorage?.key,
    g
  );
  const k = rt(S?.localStorage?.key) ? S.localStorage?.key(t) : S?.localStorage?.key;
  if (k && g) {
    const w = `${g}-${c}-${k}`;
    let I;
    try {
      I = yt(w)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, h = Bt.serialize(s);
    window.localStorage.setItem(
      w,
      JSON.stringify(h.json)
    );
  }
}, yt = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, Zt = (t, c) => {
  const S = o.getState().cogsStateStore[t], { sessionId: g } = Mt(), y = rt(c?.localStorage?.key) ? c.localStorage.key(S) : c?.localStorage?.key;
  if (y && g) {
    const k = yt(
      `${g}-${t}-${y}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return at(t, k.state), ut(t), !0;
  }
  return !1;
}, Ot = (t, c, S, g, y, k) => {
  const w = {
    initialState: c,
    updaterState: vt(
      t,
      g,
      y,
      k
    ),
    state: S
  };
  bt(t, w.initialState), ht(t, w.updaterState), at(t, w.state);
}, ut = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const S = /* @__PURE__ */ new Set();
  c.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || S.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((g) => g());
  });
}, me = (t, c) => {
  const S = o.getState().stateComponents.get(t);
  if (S) {
    const g = `${t}////${c}`, y = S.components.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Xt = (t, c, S, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: Z(c, g),
        newValue: Z(S, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: Z(S, g)
      };
    case "cut":
      return {
        oldValue: Z(c, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Qt(t, {
  stateKey: c,
  serverSync: S,
  localStorage: g,
  formElements: y,
  reactiveDeps: k,
  reactiveType: w,
  componentId: I,
  initialState: s,
  syncUpdate: h,
  dependencies: r,
  serverState: f
} = {}) {
  const [G, O] = et({}), { sessionId: U } = Mt();
  let B = !c;
  const [m] = et(c ?? At()), l = o.getState().stateLog[m], gt = K(/* @__PURE__ */ new Set()), ot = K(I ?? At()), j = K(
    null
  );
  j.current = it(m) ?? null, nt(() => {
    if (h && h.stateKey === m && h.path?.[0]) {
      at(m, (n) => ({
        ...n,
        [h.path[0]]: h.newValue
      }));
      const e = `${h.stateKey}:${h.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: h.timeStamp,
        userId: h.userId
      });
    }
  }, [h]), nt(() => {
    if (s) {
      Nt(m, {
        initialState: s
      });
      const e = j.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[m];
      if (!(i && !Y(i, s) || !i) && !a)
        return;
      let u = null;
      const p = rt(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      p && U && (u = yt(`${U}-${m}-${p}`));
      let T = s, $ = !1;
      const P = a ? Date.now() : 0, V = u?.lastUpdated || 0, _ = u?.lastSyncedWithServer || 0;
      a && P > V ? (T = e.serverState.data, $ = !0) : u && V > _ && (T = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(T)), o.getState().initializeShadowState(m, s), Ot(
        m,
        s,
        T,
        ct,
        ot.current,
        U
      ), $ && p && U && Pt(T, m, e, U, Date.now()), ut(m), (Array.isArray(w) ? w : [w || "component"]).includes("none") || O({});
    }
  }, [
    s,
    f?.status,
    f?.data,
    ...r || []
  ]), kt(() => {
    B && Nt(m, {
      serverSync: S,
      formElements: y,
      initialState: s,
      localStorage: g,
      middleware: j.current?.middleware
    });
    const e = `${m}////${ot.current}`, n = o.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(e, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), o.getState().stateComponents.set(m, n), O({}), () => {
      n && (n.components.delete(e), n.components.size === 0 && o.getState().stateComponents.delete(m));
    };
  }, []);
  const ct = (e, n, a, i) => {
    if (Array.isArray(n)) {
      const u = `${m}-${n.join(".")}`;
      gt.current.add(u);
    }
    const v = o.getState();
    at(m, (u) => {
      const p = rt(e) ? e(u) : e, T = `${m}-${n.join(".")}`;
      if (T) {
        let A = !1, b = v.signalDomElements.get(T);
        if ((!b || b.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const x = n.slice(0, -1), W = Z(p, x);
          if (Array.isArray(W)) {
            A = !0;
            const E = `${m}-${x.join(".")}`;
            b = v.signalDomElements.get(E);
          }
        }
        if (b) {
          const x = A ? Z(p, n.slice(0, -1)) : Z(p, n);
          b.forEach(({ parentId: W, position: E, effect: F }) => {
            const R = document.querySelector(
              `[data-parent-id="${W}"]`
            );
            if (R) {
              const q = Array.from(R.childNodes);
              if (q[E]) {
                const D = F ? new Function("state", `return (${F})(state)`)(x) : x;
                q[E].textContent = String(D);
              }
            }
          });
        }
      }
      console.log("shadowState", v.shadowStateStore), a.updateType === "update" && (i || j.current?.validation?.key) && n && Q(
        (i || j.current?.validation?.key) + "." + n.join(".")
      );
      const $ = n.slice(0, n.length - 1);
      a.updateType === "cut" && j.current?.validation?.key && Q(
        j.current?.validation?.key + "." + $.join(".")
      ), a.updateType === "insert" && j.current?.validation?.key && qt(
        j.current?.validation?.key + "." + $.join(".")
      ).filter(([b, x]) => {
        let W = b?.split(".").length;
        if (b == $.join(".") && W == $.length - 1) {
          let E = b + "." + $;
          Q(b), Rt(E, x);
        }
      });
      const P = v.stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", P), P) {
        const A = $t(u, p), b = new Set(A), x = a.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          W,
          E
        ] of P.components.entries()) {
          let F = !1;
          const R = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (console.log("component", E), !R.includes("none")) {
            if (R.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if (R.includes("component") && ((E.paths.has(x) || E.paths.has("")) && (F = !0), !F))
              for (const q of b) {
                let D = q;
                for (; ; ) {
                  if (E.paths.has(D)) {
                    F = !0;
                    break;
                  }
                  const C = D.lastIndexOf(".");
                  if (C !== -1) {
                    const M = D.substring(
                      0,
                      C
                    );
                    if (!isNaN(
                      Number(D.substring(C + 1))
                    ) && E.paths.has(M)) {
                      F = !0;
                      break;
                    }
                    D = M;
                  } else
                    D = "";
                  if (D === "")
                    break;
                }
                if (F) break;
              }
            if (!F && R.includes("deps") && E.depsFunction) {
              const q = E.depsFunction(p);
              let D = !1;
              typeof q == "boolean" ? q && (D = !0) : Y(E.deps, q) || (E.deps = q, D = !0), D && (F = !0);
            }
            F && E.forceUpdate();
          }
        }
      }
      const V = Date.now();
      n = n.map((A, b) => {
        const x = n.slice(0, -1), W = Z(p, x);
        return b === n.length - 1 && ["insert", "cut"].includes(a.updateType) ? (W.length - 1).toString() : A;
      });
      const { oldValue: _, newValue: N } = Xt(
        a.updateType,
        u,
        p,
        n
      ), z = {
        timeStamp: V,
        stateKey: m,
        path: n,
        updateType: a.updateType,
        status: "new",
        oldValue: _,
        newValue: N
      };
      switch (a.updateType) {
        case "update":
          v.updateShadowAtPath(m, n, p);
          break;
        case "insert":
          const A = n.slice(0, -1);
          v.insertShadowArrayElement(m, A, N);
          break;
        case "cut":
          const b = n.slice(0, -1), x = parseInt(n[n.length - 1]);
          v.removeShadowArrayElement(m, b, x);
          break;
      }
      if (Jt(m, (A) => {
        const x = [...A ?? [], z].reduce((W, E) => {
          const F = `${E.stateKey}:${JSON.stringify(E.path)}`, R = W.get(F);
          return R ? (R.timeStamp = Math.max(R.timeStamp, E.timeStamp), R.newValue = E.newValue, R.oldValue = R.oldValue ?? E.oldValue, R.updateType = E.updateType) : W.set(F, { ...E }), W;
        }, /* @__PURE__ */ new Map());
        return Array.from(x.values());
      }), Pt(
        p,
        m,
        j.current,
        U
      ), j.current?.middleware && j.current.middleware({
        updateLog: l,
        update: z
      }), j.current?.serverSync) {
        const A = v.serverState[m], b = j.current?.serverSync;
        Yt(m, {
          syncKey: typeof b.syncKey == "string" ? b.syncKey : b.syncKey({ state: p }),
          rollBackState: A,
          actionTimeStamp: Date.now() + (b.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return p;
    });
  };
  o.getState().updaterState[m] || (ht(
    m,
    vt(
      m,
      ct,
      ot.current,
      U
    )
  ), o.getState().cogsStateStore[m] || at(m, t), o.getState().initialStateGlobal[m] || bt(m, t));
  const d = Et(() => vt(
    m,
    ct,
    ot.current,
    U
  ), [m, U]);
  return [jt(m), d];
}
function vt(t, c, S, g) {
  const y = /* @__PURE__ */ new Map();
  let k = 0;
  const w = (h) => {
    const r = h.join(".");
    for (const [f] of y)
      (f === r || f.startsWith(r + ".")) && y.delete(f);
    k++;
  }, I = {
    removeValidation: (h) => {
      h?.validationKey && Q(h.validationKey);
    },
    revertToInitialState: (h) => {
      const r = o.getState().getInitialOptions(t)?.validation;
      r?.key && Q(r?.key), h?.validationKey && Q(h.validationKey);
      const f = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), k++;
      const G = s(f, []), O = it(t), U = rt(O?.localStorage?.key) ? O?.localStorage?.key(f) : O?.localStorage?.key, B = `${g}-${t}-${U}`;
      B && localStorage.removeItem(B), ht(t, G), at(t, f);
      const m = o.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), f;
    },
    updateInitialState: (h) => {
      y.clear(), k++;
      const r = vt(
        t,
        c,
        S,
        g
      ), f = o.getState().initialStateGlobal[t], G = it(t), O = rt(G?.localStorage?.key) ? G?.localStorage?.key(f) : G?.localStorage?.key, U = `${g}-${t}-${O}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), Ft(() => {
        bt(t, h), o.getState().initializeShadowState(t, h), ht(t, r), at(t, h);
        const B = o.getState().stateComponents.get(t);
        B && B.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (B) => r.get()[B]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const h = o.getState().serverState[t];
      return !!(h && Y(h, jt(t)));
    }
  };
  function s(h, r = [], f) {
    const G = r.map(String).join(".");
    y.get(G);
    const O = function() {
      return o().getNestedState(t, r);
    };
    Object.keys(I).forEach((m) => {
      O[m] = I[m];
    });
    const U = {
      apply(m, l, gt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${r.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, r);
      },
      get(m, l) {
        f?.validIndices && !Array.isArray(h) && (f = { ...f, validIndices: void 0 });
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
            const n = e.components.get(d);
            if (n && !n.paths.has("")) {
              const a = r.join(".");
              let i = !0;
              for (const v of n.paths)
                if (a.startsWith(v) && (a === v || a[v.length] === ".")) {
                  i = !1;
                  break;
                }
              i && n.paths.add(a);
            }
          }
        }
        if (l === "getDifferences")
          return () => $t(
            o.getState().cogsStateStore[t],
            o.getState().initialStateGlobal[t]
          );
        if (l === "sync" && r.length === 0)
          return async function() {
            const d = o.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const n = o.getState().getNestedState(t, []), a = d?.validation?.key;
            try {
              const i = await e.action(n);
              if (i && !i.success && i.errors && a) {
                o.getState().removeValidationError(a), i.errors.forEach((u) => {
                  const p = [a, ...u.path].join(".");
                  o.getState().addValidationError(p, u.message);
                });
                const v = o.getState().stateComponents.get(t);
                v && v.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return i?.success && e.onSuccess ? e.onSuccess(i.data) : !i?.success && e.onError && e.onError(i.error), i;
            } catch (i) {
              return e.onError && e.onError(i), { success: !1, error: i };
            }
          };
        if (l === "_status") {
          const d = o.getState().getNestedState(t, r), e = o.getState().initialStateGlobal[t], n = Z(e, r);
          return Y(d, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              r
            ), e = o.getState().initialStateGlobal[t], n = Z(e, r);
            return Y(d, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = it(t), n = rt(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${g}-${t}-${n}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + r.join("."));
          };
        if (Array.isArray(h)) {
          const d = () => f?.validIndices ? h.map((n, a) => ({
            item: n,
            originalIndex: f.validIndices[a]
          })) : o.getState().getNestedState(t, r).map((n, a) => ({
            item: n,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const e = o.getState().getSelectedIndex(t, r.join("."));
              if (e !== void 0)
                return s(
                  h[e],
                  [...r, e.toString()],
                  f
                );
            };
          if (l === "clearSelected")
            return () => {
              o.getState().clearSelectedIndex({ stateKey: t, path: r });
            };
          if (l === "getSelectedIndex")
            return () => o.getState().getSelectedIndex(t, r.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (e) => {
              const {
                itemHeight: n = 50,
                overscan: a = 6,
                stickToBottom: i = !1,
                dependencies: v = []
              } = e, u = K(null), [p, T] = et({
                startIndex: 0,
                endIndex: 10
              }), [$, P] = et(0), V = K(!1), _ = K(!0), N = K(
                null
              );
              nt(() => o.getState().subscribeToShadowState(t, () => {
                P((M) => M + 1);
              }), [t]);
              const z = o().getNestedState(
                t,
                r
              ), A = z.length, { totalHeight: b, positions: x } = Et(() => {
                const C = o.getState().getShadowMetadata(t, r) || [];
                let M = 0;
                const J = [];
                for (let L = 0; L < A; L++) {
                  J[L] = M;
                  const tt = C[L]?.virtualizer?.itemHeight;
                  M += tt || n;
                }
                return { totalHeight: M, positions: J };
              }, [
                A,
                t,
                r.join("."),
                n,
                $
              ]), W = Et(() => {
                const C = Math.max(0, p.startIndex), M = Math.min(A, p.endIndex), J = Array.from(
                  { length: M - C },
                  (tt, X) => C + X
                ), L = J.map((tt) => z[tt]);
                return s(L, r, {
                  ...f,
                  validIndices: J
                });
              }, [p.startIndex, p.endIndex, z, A]), [E, F] = et(!1);
              nt(() => {
                F(!0);
              }, []), nt(() => {
                if (!i || !u.current || A === 0 || !_.current && E) return;
                N.current && clearInterval(N.current);
                const C = 50, M = p.endIndex < C, J = A > p.endIndex + C;
                (M || J) && T({
                  startIndex: Math.max(0, A - 20),
                  endIndex: A
                });
                let L = 0;
                const tt = 50;
                return N.current = setInterval(() => {
                  const X = u.current;
                  if (!X) return;
                  L++;
                  const { scrollTop: It, scrollHeight: st, clientHeight: ft } = X, St = It + ft, H = st, pt = H - St < 5;
                  console.log(
                    `Scroll attempt ${L}: currentBottom=${St}, actualBottom=${H}, isAtBottom=${pt}, hasMounted=${E}`
                  ), pt || L >= tt ? (clearInterval(N.current), N.current = null, console.log(
                    pt ? "Reached bottom!" : "Timeout - giving up"
                  )) : X.scrollTop = X.scrollHeight;
                }, 100), () => {
                  N.current && (clearInterval(N.current), N.current = null);
                };
              }, [A, i, E]), nt(() => {
                const C = u.current;
                if (!C) return;
                let M;
                const J = () => {
                  N.current && (clearInterval(N.current), N.current = null);
                  const { scrollTop: L, scrollHeight: tt, clientHeight: X } = C, It = tt - L - X < 10;
                  _.current = It, clearTimeout(M), V.current = !0, M = setTimeout(() => {
                    V.current = !1;
                  }, 150);
                  let st = 0;
                  for (let H = 0; H < x.length; H++)
                    if (x[H] > L - n * a) {
                      st = Math.max(0, H - 1);
                      break;
                    }
                  let ft = st;
                  const St = L + X;
                  for (let H = st; H < x.length && !(x[H] > St + n * a); H++)
                    ft = H;
                  T({
                    startIndex: Math.max(0, st),
                    endIndex: Math.min(A, ft + 1 + a)
                  });
                };
                return C.addEventListener("scroll", J, {
                  passive: !0
                }), J(), () => {
                  C.removeEventListener("scroll", J), clearTimeout(M);
                };
              }, [x, A, n, a]);
              const R = xt(
                (C = "auto") => {
                  _.current = !0, u.current && (u.current.scrollTop = u.current.scrollHeight);
                },
                []
              ), q = xt(
                (C, M = "smooth") => {
                  u.current && x[C] !== void 0 && u.current.scrollTo({
                    top: x[C],
                    behavior: M
                  });
                },
                [x]
              ), D = {
                outer: {
                  ref: u,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${b}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${x[p.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: W,
                virtualizerProps: D,
                scrollToBottom: R,
                scrollToIndex: q
              };
            };
          if (l === "stateSort")
            return (e) => {
              const a = [...d()].sort(
                (u, p) => e(u.item, p.item)
              ), i = a.map(({ item: u }) => u), v = {
                ...f,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(i, r, v);
            };
          if (l === "stateFilter")
            return (e) => {
              const a = d().filter(
                ({ item: u }, p) => e(u, p)
              ), i = a.map(({ item: u }) => u), v = {
                ...f,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(i, r, v);
            };
          if (l === "stateMap")
            return (e) => {
              const n = o.getState().getNestedState(t, r);
              return Array.isArray(n) ? (f?.validIndices || Array.from({ length: n.length }, (i, v) => v)).map((i, v) => {
                const u = n[i], p = [...r, i.toString()], T = s(u, p, f);
                return e(u, T, {
                  register: () => {
                    const [, P] = et({}), V = `${S}-${r.join(".")}-${i}`;
                    kt(() => {
                      const _ = `${t}////${V}`, N = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return N.components.set(_, {
                        forceUpdate: () => P({}),
                        paths: /* @__PURE__ */ new Set([p.join(".")])
                      }), o.getState().stateComponents.set(t, N), () => {
                        const z = o.getState().stateComponents.get(t);
                        z && z.components.delete(_);
                      };
                    }, [t, V]);
                  },
                  index: v,
                  originalIndex: i
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${r.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => h.map((a, i) => {
              let v;
              f?.validIndices && f.validIndices[i] !== void 0 ? v = f.validIndices[i] : v = i;
              const u = [...r, v.toString()], p = s(a, u, f);
              return e(
                a,
                p,
                i,
                h,
                s(h, r, f)
              );
            });
          if (l === "$stateMap")
            return (e) => dt(Kt, {
              proxy: {
                _stateKey: t,
                _path: r,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateList")
            return (e) => {
              const n = o.getState().getNestedState(t, r);
              return Array.isArray(n) ? (f?.validIndices || Array.from({ length: n.length }, (i, v) => v)).map((i, v) => {
                const u = n[i], p = [...r, i.toString()], T = s(u, p, f), $ = `${S}-${r.join(".")}-${i}`;
                return dt(ee, {
                  key: i,
                  stateKey: t,
                  itemComponentId: $,
                  itemPath: p,
                  children: e(
                    u,
                    T,
                    { localIndex: v, originalIndex: i },
                    n,
                    s(n, r, f)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${r.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const n = h;
              y.clear(), k++;
              const a = n.flatMap(
                (i) => i[e] ?? []
              );
              return s(
                a,
                [...r, "[*]", e],
                f
              );
            };
          if (l === "index")
            return (e) => {
              const n = h[e];
              return s(n, [...r, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = o.getState().getNestedState(t, r);
              if (e.length === 0) return;
              const n = e.length - 1, a = e[n], i = [...r, n.toString()];
              return s(a, i);
            };
          if (l === "insert")
            return (e) => (w(r), wt(c, e, r, t), s(
              o.getState().getNestedState(t, r),
              r
            ));
          if (l === "uniqueInsert")
            return (e, n, a) => {
              const i = o.getState().getNestedState(t, r), v = rt(e) ? e(i) : e;
              let u = null;
              if (!i.some((T) => {
                if (n) {
                  const P = n.every(
                    (V) => Y(T[V], v[V])
                  );
                  return P && (u = T), P;
                }
                const $ = Y(T, v);
                return $ && (u = T), $;
              }))
                w(r), wt(c, v, r, t);
              else if (a && u) {
                const T = a(u), $ = i.map(
                  (P) => Y(P, u) ? T : P
                );
                w(r), lt(c, $, r);
              }
            };
          if (l === "cut")
            return (e, n) => {
              if (!n?.waitForSync)
                return w(r), mt(c, r, t, e), s(
                  o.getState().getNestedState(t, r),
                  r
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let n = 0; n < h.length; n++)
                h[n] === e && mt(c, r, t, n);
            };
          if (l === "toggleByValue")
            return (e) => {
              const n = h.findIndex((a) => a === e);
              n > -1 ? mt(c, r, t, n) : wt(c, e, r, t);
            };
          if (l === "stateFind")
            return (e) => {
              const a = d().find(
                ({ item: v }, u) => e(v, u)
              );
              if (!a) return;
              const i = [...r, a.originalIndex.toString()];
              return s(a.item, i, f);
            };
          if (l === "findWith")
            return (e, n) => {
              const i = d().find(
                ({ item: u }) => u[e] === n
              );
              if (!i) return;
              const v = [...r, i.originalIndex.toString()];
              return s(i.item, v, f);
            };
        }
        const ot = r[r.length - 1];
        if (!isNaN(Number(ot))) {
          const d = r.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => mt(
              c,
              d,
              t,
              Number(ot)
            );
        }
        if (l === "get")
          return () => {
            if (f?.validIndices && Array.isArray(h)) {
              const d = o.getState().getNestedState(t, r);
              return f.validIndices.map((e) => d[e]);
            }
            return o.getState().getNestedState(t, r);
          };
        if (l === "$derive")
          return (d) => _t({
            _stateKey: t,
            _path: r,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => _t({
            _stateKey: t,
            _path: r
          });
        if (l === "lastSynced") {
          const d = `${t}:${r.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => yt(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = r.slice(0, -1), e = d.join("."), n = o.getState().getNestedState(t, d);
          return Array.isArray(n) ? Number(r[r.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = r.slice(0, -1), n = Number(r[r.length - 1]), a = e.join(".");
            d ? o.getState().setSelectedIndex(t, a, n) : o.getState().setSelectedIndex(t, a, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            lt(c, i, e), w(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = r.slice(0, -1), e = Number(r[r.length - 1]), n = d.join("."), a = o.getState().getSelectedIndex(t, n);
            o.getState().setSelectedIndex(
              t,
              n,
              a === e ? void 0 : e
            );
            const i = o.getState().getNestedState(t, [...d]);
            lt(c, i, d), w(d);
          };
        if (r.length == 0) {
          if (l === "addValidation")
            return (d) => {
              const e = o.getState().getInitialOptions(t)?.validation;
              if (!e?.key)
                throw new Error("Validation key not found");
              Q(e.key), console.log("addValidationError", d), d.forEach((n) => {
                const a = [e.key, ...n.path].join(".");
                console.log("fullErrorPath", a), Rt(a, n.message);
              }), ut(t);
            };
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], a = Ht(e, d).newDocument;
              Ot(
                t,
                o.getState().initialStateGlobal[t],
                a,
                c,
                S,
                g
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const v = $t(e, a), u = new Set(v);
                for (const [
                  p,
                  T
                ] of i.components.entries()) {
                  let $ = !1;
                  const P = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
                  if (!P.includes("none")) {
                    if (P.includes("all")) {
                      T.forceUpdate();
                      continue;
                    }
                    if (P.includes("component") && (T.paths.has("") && ($ = !0), !$))
                      for (const V of u) {
                        if (T.paths.has(V)) {
                          $ = !0;
                          break;
                        }
                        let _ = V.lastIndexOf(".");
                        for (; _ !== -1; ) {
                          const N = V.substring(0, _);
                          if (T.paths.has(N)) {
                            $ = !0;
                            break;
                          }
                          const z = V.substring(
                            _ + 1
                          );
                          if (!isNaN(Number(z))) {
                            const A = N.lastIndexOf(".");
                            if (A !== -1) {
                              const b = N.substring(
                                0,
                                A
                              );
                              if (T.paths.has(b)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          _ = N.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && P.includes("deps") && T.depsFunction) {
                      const V = T.depsFunction(a);
                      let _ = !1;
                      typeof V == "boolean" ? V && (_ = !0) : Y(T.deps, V) || (T.deps = V, _ = !0), _ && ($ = !0);
                    }
                    $ && T.forceUpdate();
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
              const n = o.getState().cogsStateStore[t];
              try {
                const a = o.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([v]) => {
                  v && v.startsWith(d.key) && Q(v);
                });
                const i = d.zodSchema.safeParse(n);
                return i.success ? !0 : (i.error.errors.forEach((u) => {
                  const p = u.path, T = u.message, $ = [d.key, ...p].join(".");
                  e($, T);
                }), ut(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return S;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => Vt.getState().getFormRefsByStateKey(t);
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
          return () => Vt.getState().getFormRef(t + "." + r.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ Tt(
            Lt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: r,
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: f?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return r;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Wt(() => {
                lt(c, d, r, "");
                const n = o.getState().getNestedState(t, r);
                e?.afterUpdate && e.afterUpdate(n);
              }, e.debounce);
            else {
              lt(c, d, r, "");
              const n = o.getState().getNestedState(t, r);
              e?.afterUpdate && e.afterUpdate(n);
            }
            w(r);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ Tt(
            Gt,
            {
              setState: c,
              stateKey: t,
              path: r,
              child: d,
              formOpts: e
            }
          );
        const j = [...r, l], ct = o.getState().getNestedState(t, j);
        return s(ct, j, f);
      }
    }, B = new Proxy(O, U);
    return y.set(G, {
      proxy: B,
      stateVersion: k
    }), B;
  }
  return s(
    o.getState().getNestedState(t, [])
  );
}
function _t(t) {
  return dt(te, { proxy: t });
}
function Kt({
  proxy: t,
  rebuildStateShape: c
}) {
  const S = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(S) ? c(
    S,
    t._path
  ).stateMapNoRender(
    (y, k, w, I, s) => t._mapFn(y, k, w, I, s)
  ) : null;
}
function te({
  proxy: t
}) {
  const c = K(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return nt(() => {
    const g = c.current;
    if (!g || !g.parentElement) return;
    const y = g.parentElement, w = Array.from(y.childNodes).indexOf(g);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const h = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: w,
      effect: t._effect
    };
    o.getState().addSignalElement(S, h);
    const r = o.getState().getNestedState(t._stateKey, t._path);
    let f;
    if (t._effect)
      try {
        f = new Function(
          "state",
          `return (${t._effect})(state)`
        )(r);
      } catch (O) {
        console.error("Error evaluating effect function during mount:", O), f = r;
      }
    else
      f = r;
    f !== null && typeof f == "object" && (f = JSON.stringify(f));
    const G = document.createTextNode(String(f));
    g.replaceWith(G);
  }, [t._stateKey, t._path.join("."), t._effect]), dt("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function he(t) {
  const c = Ut(
    (S) => {
      const g = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return dt("text", {}, String(c));
}
function ee({
  stateKey: t,
  itemComponentId: c,
  itemPath: S,
  children: g
}) {
  const [, y] = et({}), [k, w] = zt(), I = K(null);
  return nt(() => {
    w.height > 0 && w.height !== I.current && (I.current = w.height, o.getState().setShadowMetadata(t, S, {
      virtualizer: {
        itemHeight: w.height
      }
    }));
  }, [w.height, t, S]), kt(() => {
    const s = `${t}////${c}`, h = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return h.components.set(s, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set([S.join(".")])
    }), o.getState().stateComponents.set(t, h), () => {
      const r = o.getState().stateComponents.get(t);
      r && r.components.delete(s);
    };
  }, [t, c, S.join(".")]), /* @__PURE__ */ Tt("div", { ref: k, children: g });
}
export {
  _t as $cogsSignal,
  he as $cogsSignalStore,
  fe as addStateOptions,
  Se as createCogsState,
  me as notifyComponent,
  Qt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
