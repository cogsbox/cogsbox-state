"use client";
import { jsx as It } from "react/jsx-runtime";
import { useState as tt, useRef as J, useEffect as at, useLayoutEffect as ut, useMemo as pt, createElement as st, useSyncExternalStore as jt, startTransition as Ot, useCallback as Et } from "react";
import { transformStateFunc as Rt, isDeepEqual as z, isFunction as Z, getNestedValue as q, getDifferences as wt, debounce as Ut } from "./utility.js";
import { pushFunc as yt, updateFn as ot, cutFunc as dt, ValidationWrapper as Ft, FormControlComponent as Dt } from "./Functions.jsx";
import Gt from "superjson";
import { v4 as Tt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as $t } from "./store.js";
import { useCogsConfig as Vt } from "./CogsStateClient.jsx";
import { applyPatch as Wt } from "fast-json-patch";
import Lt from "react-use-measure";
function kt(t, c) {
  const m = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, y = m(t) || {};
  f(t, {
    ...y,
    ...c
  });
}
function bt({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const f = nt(t) || {}, y = m[t] || {}, b = o.getState().setInitialStateOptions, p = { ...y, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      p.hasOwnProperty(a) ? (a == "localStorage" && c[a] && p[a].key !== c[a]?.key && (I = !0, p[a] = c[a]), a == "initialState" && c[a] && p[a] !== c[a] && // Different references
      !z(p[a], c[a]) && (I = !0, p[a] = c[a])) : (I = !0, p[a] = c[a]);
  I && b(t, p);
}
function ue(t, { formElements: c, validation: m }) {
  return { initialState: t, formElements: c, validation: m };
}
const ge = (t, c) => {
  let m = t;
  const [f, y] = Rt(m);
  (Object.keys(y).length > 0 || c && Object.keys(c).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, nt(I) || o.getState().setInitialStateOptions(I, y[I]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const b = (I, a) => {
    const [v] = tt(a?.componentId ?? Tt());
    bt({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = o.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [L, R] = Zt(
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
    return R;
  };
  function p(I, a) {
    bt({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Jt(I, a), mt(I);
  }
  return { useCogsState: b, setCogsOptions: p };
}, {
  setUpdaterState: gt,
  setState: et,
  getInitialOptions: nt,
  getKeyState: xt,
  getValidationErrors: Ht,
  setStateLog: Bt,
  updateInitialStateGlobal: At,
  addValidationError: zt,
  removeValidationError: Y,
  setServerSyncActions: qt
} = o.getState(), Nt = (t, c, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    f
  );
  const b = Z(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (b && f) {
    const p = `${f}-${c}-${b}`;
    let I;
    try {
      I = St(p)?.lastSyncedWithServer;
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
}, St = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, Jt = (t, c) => {
  const m = o.getState().cogsStateStore[t], { sessionId: f } = Vt(), y = Z(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (y && f) {
    const b = St(
      `${f}-${t}-${y}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return et(t, b.state), mt(t), !0;
  }
  return !1;
}, Pt = (t, c, m, f, y, b) => {
  const p = {
    initialState: c,
    updaterState: ft(
      t,
      f,
      y,
      b
    ),
    state: m
  };
  At(t, p.initialState), gt(t, p.updaterState), et(t, p.state);
}, mt = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || m.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((f) => f());
  });
}, fe = (t, c) => {
  const m = o.getState().stateComponents.get(t);
  if (m) {
    const f = `${t}////${c}`, y = m.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Yt = (t, c, m, f) => {
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
function Zt(t, {
  stateKey: c,
  serverSync: m,
  localStorage: f,
  formElements: y,
  reactiveDeps: b,
  reactiveType: p,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [L, R] = tt({}), { sessionId: U } = Vt();
  let H = !c;
  const [h] = tt(c ?? Tt()), l = o.getState().stateLog[h], it = J(/* @__PURE__ */ new Set()), X = J(I ?? Tt()), M = J(
    null
  );
  M.current = nt(h) ?? null, at(() => {
    if (v && v.stateKey === h && v.path?.[0]) {
      et(h, (r) => ({
        ...r,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), at(() => {
    if (a) {
      kt(h, {
        initialState: a
      });
      const e = M.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !z(i, a) || !i) && !s)
        return;
      let u = null;
      const A = Z(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      A && U && (u = St(`${U}-${h}-${A}`));
      let w = a, $ = !1;
      const x = s ? Date.now() : 0, N = u?.lastUpdated || 0, j = u?.lastSyncedWithServer || 0;
      s && x > N ? (w = e.serverState.data, $ = !0) : u && N > j && (w = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), o.getState().initializeShadowState(h, a), Pt(
        h,
        a,
        w,
        rt,
        X.current,
        U
      ), $ && A && U && Nt(w, h, e, U, Date.now()), mt(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || R({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), ut(() => {
    H && kt(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: f,
      middleware: M.current?.middleware
    });
    const e = `${h}////${X.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), R({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const rt = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const u = `${h}-${r.join(".")}`;
      it.current.add(u);
    }
    const g = o.getState();
    et(h, (u) => {
      const A = Z(e) ? e(u) : e, w = `${h}-${r.join(".")}`;
      if (w) {
        let P = !1, E = g.signalDomElements.get(w);
        if ((!E || E.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const O = r.slice(0, -1), G = q(A, O);
          if (Array.isArray(G)) {
            P = !0;
            const k = `${h}-${O.join(".")}`;
            E = g.signalDomElements.get(k);
          }
        }
        if (E) {
          const O = P ? q(A, r.slice(0, -1)) : q(A, r);
          E.forEach(({ parentId: G, position: k, effect: F }) => {
            const T = document.querySelector(
              `[data-parent-id="${G}"]`
            );
            if (T) {
              const C = Array.from(T.childNodes);
              if (C[k]) {
                const V = F ? new Function("state", `return (${F})(state)`)(O) : O;
                C[k].textContent = String(V);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (i || M.current?.validation?.key) && r && Y(
        (i || M.current?.validation?.key) + "." + r.join(".")
      );
      const $ = r.slice(0, r.length - 1);
      s.updateType === "cut" && M.current?.validation?.key && Y(
        M.current?.validation?.key + "." + $.join(".")
      ), s.updateType === "insert" && M.current?.validation?.key && Ht(
        M.current?.validation?.key + "." + $.join(".")
      ).filter(([E, O]) => {
        let G = E?.split(".").length;
        if (E == $.join(".") && G == $.length - 1) {
          let k = E + "." + $;
          Y(E), zt(k, O);
        }
      });
      const x = g.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", x), x) {
        const P = wt(u, A), E = new Set(P), O = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          G,
          k
        ] of x.components.entries()) {
          let F = !1;
          const T = Array.isArray(k.reactiveType) ? k.reactiveType : [k.reactiveType || "component"];
          if (console.log("component", k), !T.includes("none")) {
            if (T.includes("all")) {
              k.forceUpdate();
              continue;
            }
            if (T.includes("component") && ((k.paths.has(O) || k.paths.has("")) && (F = !0), !F))
              for (const C of E) {
                let V = C;
                for (; ; ) {
                  if (k.paths.has(V)) {
                    F = !0;
                    break;
                  }
                  const W = V.lastIndexOf(".");
                  if (W !== -1) {
                    const B = V.substring(
                      0,
                      W
                    );
                    if (!isNaN(
                      Number(V.substring(W + 1))
                    ) && k.paths.has(B)) {
                      F = !0;
                      break;
                    }
                    V = B;
                  } else
                    V = "";
                  if (V === "")
                    break;
                }
                if (F) break;
              }
            if (!F && T.includes("deps") && k.depsFunction) {
              const C = k.depsFunction(A);
              let V = !1;
              typeof C == "boolean" ? C && (V = !0) : z(k.deps, C) || (k.deps = C, V = !0), V && (F = !0);
            }
            F && k.forceUpdate();
          }
        }
      }
      const N = Date.now();
      r = r.map((P, E) => {
        const O = r.slice(0, -1), G = q(A, O);
        return E === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (G.length - 1).toString() : P;
      });
      const { oldValue: j, newValue: D } = Yt(
        s.updateType,
        u,
        A,
        r
      ), _ = {
        timeStamp: N,
        stateKey: h,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: j,
        newValue: D
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(h, r, A);
          break;
        case "insert":
          const P = r.slice(0, -1);
          g.insertShadowArrayElement(h, P, D);
          break;
        case "cut":
          const E = r.slice(0, -1), O = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(h, E, O);
          break;
      }
      if (Bt(h, (P) => {
        const O = [...P ?? [], _].reduce((G, k) => {
          const F = `${k.stateKey}:${JSON.stringify(k.path)}`, T = G.get(F);
          return T ? (T.timeStamp = Math.max(T.timeStamp, k.timeStamp), T.newValue = k.newValue, T.oldValue = T.oldValue ?? k.oldValue, T.updateType = k.updateType) : G.set(F, { ...k }), G;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), Nt(
        A,
        h,
        M.current,
        U
      ), M.current?.middleware && M.current.middleware({
        updateLog: l,
        update: _
      }), M.current?.serverSync) {
        const P = g.serverState[h], E = M.current?.serverSync;
        qt(h, {
          syncKey: typeof E.syncKey == "string" ? E.syncKey : E.syncKey({ state: A }),
          rollBackState: P,
          actionTimeStamp: Date.now() + (E.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return A;
    });
  };
  o.getState().updaterState[h] || (gt(
    h,
    ft(
      h,
      rt,
      X.current,
      U
    )
  ), o.getState().cogsStateStore[h] || et(h, t), o.getState().initialStateGlobal[h] || At(h, t));
  const d = pt(() => ft(
    h,
    rt,
    X.current,
    U
  ), [h, U]);
  return [xt(h), d];
}
function ft(t, c, m, f) {
  const y = /* @__PURE__ */ new Map();
  let b = 0;
  const p = (v) => {
    const n = v.join(".");
    for (const [S] of y)
      (S === n || S.startsWith(n + ".")) && y.delete(S);
    b++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && Y(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && Y(n?.key), v?.validationKey && Y(v.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), b++;
      const L = a(S, []), R = nt(t), U = Z(R?.localStorage?.key) ? R?.localStorage?.key(S) : R?.localStorage?.key, H = `${f}-${t}-${U}`;
      H && localStorage.removeItem(H), gt(t, L), et(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), b++;
      const n = ft(
        t,
        c,
        m,
        f
      ), S = o.getState().initialStateGlobal[t], L = nt(t), R = Z(L?.localStorage?.key) ? L?.localStorage?.key(S) : L?.localStorage?.key, U = `${f}-${t}-${R}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), Ot(() => {
        At(t, v), o.getState().initializeShadowState(t, v), gt(t, n), et(t, v);
        const H = o.getState().stateComponents.get(t);
        H && H.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (H) => n.get()[H]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const v = o.getState().serverState[t];
      return !!(v && z(v, xt(t)));
    }
  };
  function a(v, n = [], S) {
    const L = n.map(String).join(".");
    y.get(L);
    const R = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(I).forEach((h) => {
      R[h] = I[h];
    });
    const U = {
      apply(h, l, it) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
        const it = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !it.has(l)) {
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
          return () => wt(
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
                  const A = [s, ...u.path].join(".");
                  o.getState().addValidationError(A, u.message);
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
          return z(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = q(e, n);
            return z(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = nt(t), r = Z(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${r}`;
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
              } = e, g = J(null), [u, A] = tt({
                startIndex: 0,
                endIndex: 10
              }), w = J(i), $ = J(0), x = J(!0), [N, j] = tt(0);
              at(() => o.getState().subscribeToShadowState(t, () => {
                j((C) => C + 1);
              }), [t]);
              const D = o().getNestedState(
                t,
                n
              ), _ = D.length, { totalHeight: P, positions: E } = pt(() => {
                const T = o.getState().getShadowMetadata(t, n) || [];
                let C = 0;
                const V = [];
                for (let W = 0; W < _; W++) {
                  V[W] = C;
                  const B = T[W]?.virtualizer?.itemHeight;
                  C += B || r;
                }
                return { totalHeight: C, positions: V };
              }, [
                _,
                t,
                n.join("."),
                r,
                N
              ]);
              console.log("height", P);
              const O = pt(() => {
                const T = Math.max(0, u.startIndex), C = Math.min(_, u.endIndex), V = Array.from(
                  { length: C - T },
                  (B, ct) => T + ct
                ), W = V.map((B) => D[B]);
                return a(W, n, {
                  ...S,
                  validIndices: V
                });
              }, [u.startIndex, u.endIndex, D, _]);
              ut(() => {
                const T = g.current;
                if (!T) return;
                const C = w.current, V = _ > $.current;
                $.current = _;
                const W = () => {
                  const { scrollTop: B, clientHeight: ct, scrollHeight: _t } = T;
                  w.current = _t - B - ct < 10;
                  let ht = 0, lt = _ - 1;
                  for (; ht <= lt; ) {
                    const K = Math.floor((ht + lt) / 2);
                    E[K] < B ? ht = K + 1 : lt = K - 1;
                  }
                  const vt = Math.max(0, lt - s);
                  let Q = vt;
                  const Mt = B + ct;
                  for (; Q < _ && E[Q] < Mt; )
                    Q++;
                  Q = Math.min(_, Q + s), A((K) => K.startIndex !== vt || K.endIndex !== Q ? { startIndex: vt, endIndex: Q } : K);
                };
                return T.addEventListener("scroll", W, {
                  passive: !0
                }), i && (x.current ? (console.log(
                  "stickToBottom initial mount",
                  T.scrollHeight
                ), T.scrollTo({
                  top: T.scrollHeight,
                  behavior: "auto"
                }), x.current = !1) : C && V && (console.log(
                  "stickToBottom wasAtBottom && listGrew",
                  T.scrollHeight
                ), requestAnimationFrame(() => {
                  T.scrollTo({
                    top: T.scrollHeight,
                    behavior: "smooth"
                  });
                }))), console.log("wasAtBottom && listGrew", C, V), W(), () => T.removeEventListener("scroll", W);
              }, [_, E, s, i]);
              const G = Et(
                (T = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: T
                  });
                },
                []
              ), k = Et(
                (T, C = "smooth") => {
                  g.current && E[T] !== void 0 && g.current.scrollTo({
                    top: E[T],
                    behavior: C
                  });
                },
                [E]
              ), F = {
                outer: {
                  ref: g,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${P}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${E[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: O,
                virtualizerProps: F,
                scrollToBottom: G,
                scrollToIndex: k
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, A) => e(u.item, A.item)
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
                ({ item: u }, A) => e(u, A)
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
                const u = r[i], A = [...n, i.toString()], w = a(u, A, S);
                return e(u, w, {
                  register: () => {
                    const [, x] = tt({}), N = `${m}-${n.join(".")}-${i}`;
                    ut(() => {
                      const j = `${t}////${N}`, D = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set(j, {
                        forceUpdate: () => x({}),
                        paths: /* @__PURE__ */ new Set([A.join(".")])
                      }), o.getState().stateComponents.set(t, D), () => {
                        const _ = o.getState().stateComponents.get(t);
                        _ && _.components.delete(j);
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
            return (e) => v.map((s, i) => {
              let g;
              S?.validIndices && S.validIndices[i] !== void 0 ? g = S.validIndices[i] : g = i;
              const u = [...n, g.toString()], A = a(s, u, S);
              return e(
                s,
                A,
                i,
                v,
                a(v, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => st(Xt, {
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
                const u = r[i], A = [...n, i.toString()], w = a(u, A, S), $ = `${m}-${n.join(".")}-${i}`;
                return st(Kt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: $,
                  itemPath: A,
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
              y.clear(), b++;
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
            return (e) => (p(n), yt(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), g = Z(e) ? e(i) : e;
              let u = null;
              if (!i.some((w) => {
                if (r) {
                  const x = r.every(
                    (N) => z(w[N], g[N])
                  );
                  return x && (u = w), x;
                }
                const $ = z(w, g);
                return $ && (u = w), $;
              }))
                p(n), yt(c, g, n, t);
              else if (s && u) {
                const w = s(u), $ = i.map(
                  (x) => z(x, u) ? w : x
                );
                p(n), ot(c, $, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return p(n), dt(c, n, t, e), a(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < v.length; r++)
                v[r] === e && dt(c, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = v.findIndex((s) => s === e);
              r > -1 ? dt(c, n, t, r) : yt(c, e, n, t);
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
        const X = n[n.length - 1];
        if (!isNaN(Number(X))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => dt(
              c,
              d,
              t,
              Number(X)
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
          return (d) => St(f + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), s = e.join(".");
            d ? o.getState().setSelectedIndex(t, s, r) : o.getState().setSelectedIndex(t, s, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            ot(c, i, e), p(e);
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
            ot(c, i, d), p(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], s = Wt(e, d).newDocument;
              Pt(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                m,
                f
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const g = wt(e, s), u = new Set(g);
                for (const [
                  A,
                  w
                ] of i.components.entries()) {
                  let $ = !1;
                  const x = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!x.includes("none")) {
                    if (x.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (x.includes("component") && (w.paths.has("") && ($ = !0), !$))
                      for (const N of u) {
                        if (w.paths.has(N)) {
                          $ = !0;
                          break;
                        }
                        let j = N.lastIndexOf(".");
                        for (; j !== -1; ) {
                          const D = N.substring(0, j);
                          if (w.paths.has(D)) {
                            $ = !0;
                            break;
                          }
                          const _ = N.substring(
                            j + 1
                          );
                          if (!isNaN(Number(_))) {
                            const P = D.lastIndexOf(".");
                            if (P !== -1) {
                              const E = D.substring(
                                0,
                                P
                              );
                              if (w.paths.has(E)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          j = D.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && x.includes("deps") && w.depsFunction) {
                      const N = w.depsFunction(s);
                      let j = !1;
                      typeof N == "boolean" ? N && (j = !0) : z(w.deps, N) || (w.deps = N, j = !0), j && ($ = !0);
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
              Y(d.key);
              const r = o.getState().cogsStateStore[t];
              try {
                const s = o.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([g]) => {
                  g && g.startsWith(d.key) && Y(g);
                });
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((u) => {
                  const A = u.path, w = u.message, $ = [d.key, ...A].join(".");
                  e($, w);
                }), mt(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => $t.getState().getFormRefsByStateKey(t);
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
          return () => $t.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ It(
            Ft,
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
                ot(c, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              ot(c, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            p(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ It(
            Dt,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const M = [...n, l], rt = o.getState().getNestedState(t, M);
        return a(rt, M, S);
      }
    }, H = new Proxy(R, U);
    return y.set(L, {
      proxy: H,
      stateVersion: b
    }), H;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function Ct(t) {
  return st(Qt, { proxy: t });
}
function Xt({
  proxy: t,
  rebuildStateShape: c
}) {
  const m = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? c(
    m,
    t._path
  ).stateMapNoRender(
    (y, b, p, I, a) => t._mapFn(y, b, p, I, a)
  ) : null;
}
function Qt({
  proxy: t
}) {
  const c = J(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return at(() => {
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
      } catch (R) {
        console.error("Error evaluating effect function during mount:", R), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const L = document.createTextNode(String(S));
    f.replaceWith(L);
  }, [t._stateKey, t._path.join("."), t._effect]), st("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function Se(t) {
  const c = jt(
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
  return st("text", {}, String(c));
}
function Kt({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: f
}) {
  const [, y] = tt({}), [b, p] = Lt(), I = J(null);
  return at(() => {
    p.height > 0 && p.height !== I.current && (I.current = p.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), ut(() => {
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
  }, [t, c, m.join(".")]), /* @__PURE__ */ It("div", { ref: b, children: f });
}
export {
  Ct as $cogsSignal,
  Se as $cogsSignalStore,
  ue as addStateOptions,
  ge as createCogsState,
  fe as notifyComponent,
  Zt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
