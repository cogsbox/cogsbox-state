"use client";
import { jsx as wt } from "react/jsx-runtime";
import { useState as et, useRef as J, useEffect as st, useLayoutEffect as gt, useMemo as Tt, createElement as it, useSyncExternalStore as Ot, startTransition as Rt, useCallback as It } from "react";
import { transformStateFunc as Ft, isDeepEqual as B, isFunction as X, getNestedValue as q, getDifferences as Et, debounce as Ut } from "./utility.js";
import { pushFunc as pt, updateFn as at, cutFunc as ut, ValidationWrapper as Dt, FormControlComponent as Wt } from "./Functions.jsx";
import Gt from "superjson";
import { v4 as At } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as kt } from "./store.js";
import { useCogsConfig as xt } from "./CogsStateClient.jsx";
import { applyPatch as Lt } from "fast-json-patch";
import Ht from "react-use-measure";
function bt(t, c) {
  const m = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, y = m(t) || {};
  f(t, {
    ...y,
    ...c
  });
}
function Vt({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const f = rt(t) || {}, y = m[t] || {}, k = o.getState().setInitialStateOptions, p = { ...y, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      p.hasOwnProperty(a) ? (a == "localStorage" && c[a] && p[a].key !== c[a]?.key && (I = !0, p[a] = c[a]), a == "initialState" && c[a] && p[a] !== c[a] && // Different references
      !B(p[a], c[a]) && (I = !0, p[a] = c[a])) : (I = !0, p[a] = c[a]);
  I && k(t, p);
}
function ge(t, { formElements: c, validation: m }) {
  return { initialState: t, formElements: c, validation: m };
}
const fe = (t, c) => {
  let m = t;
  const [f, y] = Ft(m);
  (Object.keys(y).length > 0 || c && Object.keys(c).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, rt(I) || o.getState().setInitialStateOptions(I, y[I]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const k = (I, a) => {
    const [v] = et(a?.componentId ?? At());
    Vt({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = o.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [G, O] = Xt(
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
    Vt({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Yt(I, a), ht(I);
  }
  return { useCogsState: k, setCogsOptions: p };
}, {
  setUpdaterState: ft,
  setState: nt,
  getInitialOptions: rt,
  getKeyState: Pt,
  getValidationErrors: zt,
  setStateLog: Bt,
  updateInitialStateGlobal: $t,
  addValidationError: qt,
  removeValidationError: Z,
  setServerSyncActions: Jt
} = o.getState(), Nt = (t, c, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    f
  );
  const k = X(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (k && f) {
    const p = `${f}-${c}-${k}`;
    let I;
    try {
      I = mt(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Gt.serialize(a);
    window.localStorage.setItem(
      p,
      JSON.stringify(v.json)
    );
  }
}, mt = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, Yt = (t, c) => {
  const m = o.getState().cogsStateStore[t], { sessionId: f } = xt(), y = X(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (y && f) {
    const k = mt(
      `${f}-${t}-${y}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return nt(t, k.state), ht(t), !0;
  }
  return !1;
}, _t = (t, c, m, f, y, k) => {
  const p = {
    initialState: c,
    updaterState: St(
      t,
      f,
      y,
      k
    ),
    state: m
  };
  $t(t, p.initialState), ft(t, p.updaterState), nt(t, p.state);
}, ht = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || m.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((f) => f());
  });
}, Se = (t, c) => {
  const m = o.getState().stateComponents.get(t);
  if (m) {
    const f = `${t}////${c}`, y = m.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Zt = (t, c, m, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: q(c, f),
        newValue: q(m, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: q(m, f)
      };
    case "cut":
      return {
        oldValue: q(c, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Xt(t, {
  stateKey: c,
  serverSync: m,
  localStorage: f,
  formElements: y,
  reactiveDeps: k,
  reactiveType: p,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [G, O] = et({}), { sessionId: R } = xt();
  let L = !c;
  const [h] = et(c ?? At()), l = o.getState().stateLog[h], ct = J(/* @__PURE__ */ new Set()), Q = J(I ?? At()), M = J(
    null
  );
  M.current = rt(h) ?? null, st(() => {
    if (v && v.stateKey === h && v.path?.[0]) {
      nt(h, (r) => ({
        ...r,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), st(() => {
    if (a) {
      bt(h, {
        initialState: a
      });
      const e = M.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !B(i, a) || !i) && !s)
        return;
      let u = null;
      const T = X(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      T && R && (u = mt(`${R}-${h}-${T}`));
      let w = a, $ = !1;
      const P = s ? Date.now() : 0, C = u?.lastUpdated || 0, _ = u?.lastSyncedWithServer || 0;
      s && P > C ? (w = e.serverState.data, $ = !0) : u && C > _ && (w = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), o.getState().initializeShadowState(h, a), _t(
        h,
        a,
        w,
        ot,
        Q.current,
        R
      ), $ && T && R && Nt(w, h, e, R, Date.now()), ht(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || O({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), gt(() => {
    L && bt(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: f,
      middleware: M.current?.middleware
    });
    const e = `${h}////${Q.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), O({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const ot = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const u = `${h}-${r.join(".")}`;
      ct.current.add(u);
    }
    const g = o.getState();
    nt(h, (u) => {
      const T = X(e) ? e(u) : e, w = `${h}-${r.join(".")}`;
      if (w) {
        let b = !1, V = g.signalDomElements.get(w);
        if ((!V || V.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const x = r.slice(0, -1), D = q(T, x);
          if (Array.isArray(D)) {
            b = !0;
            const A = `${h}-${x.join(".")}`;
            V = g.signalDomElements.get(A);
          }
        }
        if (V) {
          const x = b ? q(T, r.slice(0, -1)) : q(T, r);
          V.forEach(({ parentId: D, position: A, effect: F }) => {
            const j = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (j) {
              const E = Array.from(j.childNodes);
              if (E[A]) {
                const N = F ? new Function("state", `return (${F})(state)`)(x) : x;
                E[A].textContent = String(N);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (i || M.current?.validation?.key) && r && Z(
        (i || M.current?.validation?.key) + "." + r.join(".")
      );
      const $ = r.slice(0, r.length - 1);
      s.updateType === "cut" && M.current?.validation?.key && Z(
        M.current?.validation?.key + "." + $.join(".")
      ), s.updateType === "insert" && M.current?.validation?.key && zt(
        M.current?.validation?.key + "." + $.join(".")
      ).filter(([V, x]) => {
        let D = V?.split(".").length;
        if (V == $.join(".") && D == $.length - 1) {
          let A = V + "." + $;
          Z(V), qt(A, x);
        }
      });
      const P = g.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", P), P) {
        const b = Et(u, T), V = new Set(b), x = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          D,
          A
        ] of P.components.entries()) {
          let F = !1;
          const j = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (console.log("component", A), !j.includes("none")) {
            if (j.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if (j.includes("component") && ((A.paths.has(x) || A.paths.has("")) && (F = !0), !F))
              for (const E of V) {
                let N = E;
                for (; ; ) {
                  if (A.paths.has(N)) {
                    F = !0;
                    break;
                  }
                  const z = N.lastIndexOf(".");
                  if (z !== -1) {
                    const W = N.substring(
                      0,
                      z
                    );
                    if (!isNaN(
                      Number(N.substring(z + 1))
                    ) && A.paths.has(W)) {
                      F = !0;
                      break;
                    }
                    N = W;
                  } else
                    N = "";
                  if (N === "")
                    break;
                }
                if (F) break;
              }
            if (!F && j.includes("deps") && A.depsFunction) {
              const E = A.depsFunction(T);
              let N = !1;
              typeof E == "boolean" ? E && (N = !0) : B(A.deps, E) || (A.deps = E, N = !0), N && (F = !0);
            }
            F && A.forceUpdate();
          }
        }
      }
      const C = Date.now();
      r = r.map((b, V) => {
        const x = r.slice(0, -1), D = q(T, x);
        return V === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (D.length - 1).toString() : b;
      });
      const { oldValue: _, newValue: U } = Zt(
        s.updateType,
        u,
        T,
        r
      ), H = {
        timeStamp: C,
        stateKey: h,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: _,
        newValue: U
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(h, r, T);
          break;
        case "insert":
          const b = r.slice(0, -1);
          g.insertShadowArrayElement(h, b, U);
          break;
        case "cut":
          const V = r.slice(0, -1), x = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(h, V, x);
          break;
      }
      if (Bt(h, (b) => {
        const x = [...b ?? [], H].reduce((D, A) => {
          const F = `${A.stateKey}:${JSON.stringify(A.path)}`, j = D.get(F);
          return j ? (j.timeStamp = Math.max(j.timeStamp, A.timeStamp), j.newValue = A.newValue, j.oldValue = j.oldValue ?? A.oldValue, j.updateType = A.updateType) : D.set(F, { ...A }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(x.values());
      }), Nt(
        T,
        h,
        M.current,
        R
      ), M.current?.middleware && M.current.middleware({
        updateLog: l,
        update: H
      }), M.current?.serverSync) {
        const b = g.serverState[h], V = M.current?.serverSync;
        Jt(h, {
          syncKey: typeof V.syncKey == "string" ? V.syncKey : V.syncKey({ state: T }),
          rollBackState: b,
          actionTimeStamp: Date.now() + (V.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  o.getState().updaterState[h] || (ft(
    h,
    St(
      h,
      ot,
      Q.current,
      R
    )
  ), o.getState().cogsStateStore[h] || nt(h, t), o.getState().initialStateGlobal[h] || $t(h, t));
  const d = Tt(() => St(
    h,
    ot,
    Q.current,
    R
  ), [h, R]);
  return [Pt(h), d];
}
function St(t, c, m, f) {
  const y = /* @__PURE__ */ new Map();
  let k = 0;
  const p = (v) => {
    const n = v.join(".");
    for (const [S] of y)
      (S === n || S.startsWith(n + ".")) && y.delete(S);
    k++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && Z(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && Z(n?.key), v?.validationKey && Z(v.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), k++;
      const G = a(S, []), O = rt(t), R = X(O?.localStorage?.key) ? O?.localStorage?.key(S) : O?.localStorage?.key, L = `${f}-${t}-${R}`;
      L && localStorage.removeItem(L), ft(t, G), nt(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), k++;
      const n = St(
        t,
        c,
        m,
        f
      ), S = o.getState().initialStateGlobal[t], G = rt(t), O = X(G?.localStorage?.key) ? G?.localStorage?.key(S) : G?.localStorage?.key, R = `${f}-${t}-${O}`;
      return localStorage.getItem(R) && localStorage.removeItem(R), Rt(() => {
        $t(t, v), o.getState().initializeShadowState(t, v), ft(t, n), nt(t, v);
        const L = o.getState().stateComponents.get(t);
        L && L.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (L) => n.get()[L]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const v = o.getState().serverState[t];
      return !!(v && B(v, Pt(t)));
    }
  };
  function a(v, n = [], S) {
    const G = n.map(String).join(".");
    y.get(G);
    const O = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(I).forEach((h) => {
      O[h] = I[h];
    });
    const R = {
      apply(h, l, ct) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
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
          const d = `${t}////${m}`, e = o.getState().stateComponents.get(t);
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
          return () => Et(
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
                  const T = [s, ...u.path].join(".");
                  o.getState().addValidationError(T, u.message);
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
          const d = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = q(e, n);
          return B(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = q(e, n);
            return B(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = rt(t), r = X(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${r}`;
            s && localStorage.removeItem(s);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(v)) {
          const d = () => S?.validIndices ? v.map((r, s) => ({
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
                  v[e],
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
              } = e, g = J(null), [u, T] = et({
                startIndex: 0,
                endIndex: 10
              }), [w, $] = et(0), P = It(
                () => $((E) => E + 1),
                []
              ), C = J(i), _ = J(0), U = J(!0);
              st(() => {
                const E = o.getState().subscribeToShadowState(t, P), N = setTimeout(P, 50);
                return () => {
                  E(), clearTimeout(N);
                };
              }, [t, P]);
              const H = o().getNestedState(
                t,
                n
              ), b = H.length, { totalHeight: V, positions: x } = Tt(() => {
                const E = o.getState().getShadowMetadata(t, n) || [];
                let N = 0;
                const z = [];
                for (let W = 0; W < b; W++) {
                  z[W] = N;
                  const Y = E[W]?.virtualizer?.itemHeight;
                  N += Y || r;
                }
                return { totalHeight: N, positions: z };
              }, [b, t, n, r, w]), D = Tt(() => {
                const E = Math.max(0, u.startIndex), N = Math.min(b, u.endIndex), z = Array.from(
                  { length: N - E },
                  (Y, lt) => E + lt
                ), W = z.map((Y) => H[Y]);
                return a(W, n, {
                  ...S,
                  validIndices: z
                });
              }, [u.startIndex, u.endIndex, H, b]);
              gt(() => {
                const E = g.current;
                if (!E) return;
                const N = C.current, z = b > _.current;
                _.current = b;
                const W = () => {
                  const { scrollTop: Y, clientHeight: lt, scrollHeight: Mt } = E;
                  C.current = Mt - Y - lt < 10;
                  let vt = 0, dt = b - 1;
                  for (; vt <= dt; ) {
                    const tt = Math.floor((vt + dt) / 2);
                    x[tt] < Y ? vt = tt + 1 : dt = tt - 1;
                  }
                  const yt = Math.max(0, dt - s);
                  let K = yt;
                  const jt = Y + lt;
                  for (; K < b && x[K] < jt; )
                    K++;
                  K = Math.min(b, K + s), T((tt) => tt.startIndex !== yt || tt.endIndex !== K ? { startIndex: yt, endIndex: K } : tt);
                };
                return E.addEventListener("scroll", W, {
                  passive: !0
                }), i && (U.current ? E.scrollTo({
                  top: E.scrollHeight,
                  behavior: "auto"
                }) : N && z && requestAnimationFrame(() => {
                  E.scrollTo({
                    top: E.scrollHeight,
                    behavior: "smooth"
                  });
                })), U.current = !1, W(), () => E.removeEventListener("scroll", W);
              }, [b, x, s, i]);
              const A = It(
                (E = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: E
                  });
                },
                []
              ), F = It(
                (E, N = "smooth") => {
                  g.current && x[E] !== void 0 && g.current.scrollTo({
                    top: x[E],
                    behavior: N
                  });
                },
                [x]
              ), j = {
                outer: {
                  ref: g,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${V}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${x[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: D,
                virtualizerProps: j,
                scrollToBottom: A,
                scrollToIndex: F
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, T) => e(u.item, T.item)
              ), i = s.map(({ item: u }) => u), g = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(i, n, g);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = d().filter(
                ({ item: u }, T) => e(u, T)
              ), i = s.map(({ item: u }) => u), g = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(i, n, g);
            };
          if (l === "stateMap")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (i, g) => g)).map((i, g) => {
                const u = r[i], T = [...n, i.toString()], w = a(u, T, S);
                return e(u, w, {
                  register: () => {
                    const [, P] = et({}), C = `${m}-${n.join(".")}-${i}`;
                    gt(() => {
                      const _ = `${t}////${C}`, U = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return U.components.set(_, {
                        forceUpdate: () => P({}),
                        paths: /* @__PURE__ */ new Set([T.join(".")])
                      }), o.getState().stateComponents.set(t, U), () => {
                        const H = o.getState().stateComponents.get(t);
                        H && H.components.delete(_);
                      };
                    }, [t, C]);
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
            return (e) => v.map((s, i) => {
              let g;
              S?.validIndices && S.validIndices[i] !== void 0 ? g = S.validIndices[i] : g = i;
              const u = [...n, g.toString()], T = a(s, u, S);
              return e(
                s,
                T,
                i,
                v,
                a(v, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => it(Qt, {
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
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (i, g) => g)).map((i, g) => {
                const u = r[i], T = [...n, i.toString()], w = a(u, T, S), $ = `${m}-${n.join(".")}-${i}`;
                return it(te, {
                  key: i,
                  stateKey: t,
                  itemComponentId: $,
                  itemPath: T,
                  children: e(
                    u,
                    w,
                    g,
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
              const r = v;
              y.clear(), k++;
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
              const r = v[e];
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
            return (e) => (p(n), pt(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), g = X(e) ? e(i) : e;
              let u = null;
              if (!i.some((w) => {
                if (r) {
                  const P = r.every(
                    (C) => B(w[C], g[C])
                  );
                  return P && (u = w), P;
                }
                const $ = B(w, g);
                return $ && (u = w), $;
              }))
                p(n), pt(c, g, n, t);
              else if (s && u) {
                const w = s(u), $ = i.map(
                  (P) => B(P, u) ? w : P
                );
                p(n), at(c, $, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return p(n), ut(c, n, t, e), a(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < v.length; r++)
                v[r] === e && ut(c, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = v.findIndex((s) => s === e);
              r > -1 ? ut(c, n, t, r) : pt(c, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = d().find(
                ({ item: g }, u) => e(g, u)
              );
              if (!s) return;
              const i = [...n, s.originalIndex.toString()];
              return a(s.item, i, S);
            };
          if (l === "findWith")
            return (e, r) => {
              const i = d().find(
                ({ item: u }) => u[e] === r
              );
              if (!i) return;
              const g = [...n, i.originalIndex.toString()];
              return a(i.item, g, S);
            };
        }
        const Q = n[n.length - 1];
        if (!isNaN(Number(Q))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => ut(
              c,
              d,
              t,
              Number(Q)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(v)) {
              const d = o.getState().getNestedState(t, n);
              return S.validIndices.map((e) => d[e]);
            }
            return o.getState().getNestedState(t, n);
          };
        if (l === "$derive")
          return (d) => Ct({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Ct({
            _stateKey: t,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${t}:${n.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => mt(f + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), s = e.join(".");
            d ? o.getState().setSelectedIndex(t, s, r) : o.getState().setSelectedIndex(t, s, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            at(c, i, e), p(e);
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
            at(c, i, d), p(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], s = Lt(e, d).newDocument;
              _t(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                m,
                f
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const g = Et(e, s), u = new Set(g);
                for (const [
                  T,
                  w
                ] of i.components.entries()) {
                  let $ = !1;
                  const P = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!P.includes("none")) {
                    if (P.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (P.includes("component") && (w.paths.has("") && ($ = !0), !$))
                      for (const C of u) {
                        if (w.paths.has(C)) {
                          $ = !0;
                          break;
                        }
                        let _ = C.lastIndexOf(".");
                        for (; _ !== -1; ) {
                          const U = C.substring(0, _);
                          if (w.paths.has(U)) {
                            $ = !0;
                            break;
                          }
                          const H = C.substring(
                            _ + 1
                          );
                          if (!isNaN(Number(H))) {
                            const b = U.lastIndexOf(".");
                            if (b !== -1) {
                              const V = U.substring(
                                0,
                                b
                              );
                              if (w.paths.has(V)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          _ = U.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && P.includes("deps") && w.depsFunction) {
                      const C = w.depsFunction(s);
                      let _ = !1;
                      typeof C == "boolean" ? C && (_ = !0) : B(w.deps, C) || (w.deps = C, _ = !0), _ && ($ = !0);
                    }
                    $ && w.forceUpdate();
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
                const s = o.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([g]) => {
                  g && g.startsWith(d.key) && Z(g);
                });
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((u) => {
                  const T = u.path, w = u.message, $ = [d.key, ...T].join(".");
                  e($, w);
                }), ht(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => kt.getState().getFormRefsByStateKey(t);
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
          return () => kt.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ wt(
            Dt,
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
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Ut(() => {
                at(c, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              at(c, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            p(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ wt(
            Wt,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const M = [...n, l], ot = o.getState().getNestedState(t, M);
        return a(ot, M, S);
      }
    }, L = new Proxy(O, R);
    return y.set(G, {
      proxy: L,
      stateVersion: k
    }), L;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function Ct(t) {
  return it(Kt, { proxy: t });
}
function Qt({
  proxy: t,
  rebuildStateShape: c
}) {
  const m = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? c(
    m,
    t._path
  ).stateMapNoRender(
    (y, k, p, I, a) => t._mapFn(y, k, p, I, a)
  ) : null;
}
function Kt({
  proxy: t
}) {
  const c = J(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return st(() => {
    const f = c.current;
    if (!f || !f.parentElement) return;
    const y = f.parentElement, p = Array.from(y.childNodes).indexOf(f);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: p,
      effect: t._effect
    };
    o.getState().addSignalElement(m, v);
    const n = o.getState().getNestedState(t._stateKey, t._path);
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
    const G = document.createTextNode(String(S));
    f.replaceWith(G);
  }, [t._stateKey, t._path.join("."), t._effect]), it("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function me(t) {
  const c = Ot(
    (m) => {
      const f = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(t._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => f.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return it("text", {}, String(c));
}
function te({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: f
}) {
  const [, y] = et({}), [k, p] = Ht(), I = J(null);
  return st(() => {
    p.height > 0 && p.height !== I.current && (I.current = p.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), gt(() => {
    const a = `${t}////${c}`, v = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return v.components.set(a, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), o.getState().stateComponents.set(t, v), () => {
      const n = o.getState().stateComponents.get(t);
      n && n.components.delete(a);
    };
  }, [t, c, m.join(".")]), /* @__PURE__ */ wt("div", { ref: k, children: f });
}
export {
  Ct as $cogsSignal,
  me as $cogsSignalStore,
  ge as addStateOptions,
  fe as createCogsState,
  Se as notifyComponent,
  Xt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
