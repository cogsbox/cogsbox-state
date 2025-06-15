"use client";
import { jsx as It } from "react/jsx-runtime";
import { useState as tt, useRef as q, useEffect as st, useLayoutEffect as at, useMemo as pt, createElement as it, useSyncExternalStore as jt, startTransition as Ot, useCallback as Et } from "react";
import { transformStateFunc as Rt, isDeepEqual as B, isFunction as Z, getNestedValue as J, getDifferences as wt, debounce as Ft } from "./utility.js";
import { pushFunc as yt, updateFn as ot, cutFunc as ut, ValidationWrapper as Ut, FormControlComponent as Dt } from "./Functions.jsx";
import Wt from "superjson";
import { v4 as Tt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as $t } from "./store.js";
import { useCogsConfig as Vt } from "./CogsStateClient.jsx";
import { applyPatch as Gt } from "fast-json-patch";
import Lt from "react-use-measure";
function bt(t, c) {
  const m = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, y = m(t) || {};
  f(t, {
    ...y,
    ...c
  });
}
function kt({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const f = nt(t) || {}, y = m[t] || {}, k = o.getState().setInitialStateOptions, p = { ...y, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      p.hasOwnProperty(a) ? (a == "localStorage" && c[a] && p[a].key !== c[a]?.key && (I = !0, p[a] = c[a]), a == "initialState" && c[a] && p[a] !== c[a] && // Different references
      !B(p[a], c[a]) && (I = !0, p[a] = c[a])) : (I = !0, p[a] = c[a]);
  I && k(t, p);
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
  const k = (I, a) => {
    const [v] = tt(a?.componentId ?? Tt());
    kt({
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
    kt({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Jt(I, a), mt(I);
  }
  return { useCogsState: k, setCogsOptions: p };
}, {
  setUpdaterState: gt,
  setState: et,
  getInitialOptions: nt,
  getKeyState: xt,
  getValidationErrors: Ht,
  setStateLog: zt,
  updateInitialStateGlobal: At,
  addValidationError: Bt,
  removeValidationError: Y,
  setServerSyncActions: qt
} = o.getState(), Ct = (t, c, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    f
  );
  const k = Z(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (k && f) {
    const p = `${f}-${c}-${k}`;
    let I;
    try {
      I = St(p)?.lastSyncedWithServer;
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
    const k = St(
      `${f}-${t}-${y}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return et(t, k.state), mt(t), !0;
  }
  return !1;
}, Pt = (t, c, m, f, y, k) => {
  const p = {
    initialState: c,
    updaterState: ft(
      t,
      f,
      y,
      k
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
        oldValue: J(c, f),
        newValue: J(m, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: J(m, f)
      };
    case "cut":
      return {
        oldValue: J(c, f),
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
  reactiveDeps: k,
  reactiveType: p,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [L, R] = tt({}), { sessionId: F } = Vt();
  let H = !c;
  const [h] = tt(c ?? Tt()), l = o.getState().stateLog[h], ct = q(/* @__PURE__ */ new Set()), X = q(I ?? Tt()), j = q(
    null
  );
  j.current = nt(h) ?? null, st(() => {
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
  }, [v]), st(() => {
    if (a) {
      bt(h, {
        initialState: a
      });
      const e = j.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !B(i, a) || !i) && !s)
        return;
      let g = null;
      const A = Z(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      A && F && (g = St(`${F}-${h}-${A}`));
      let w = a, E = !1;
      const N = s ? Date.now() : 0, C = g?.lastUpdated || 0, M = g?.lastSyncedWithServer || 0;
      s && N > C ? (w = e.serverState.data, E = !0) : g && C > M && (w = g.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), o.getState().initializeShadowState(h, a), Pt(
        h,
        a,
        w,
        rt,
        X.current,
        F
      ), E && A && F && Ct(w, h, e, F, Date.now()), mt(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || R({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), at(() => {
    H && bt(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: f,
      middleware: j.current?.middleware
    });
    const e = `${h}////${X.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), R({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const rt = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const g = `${h}-${r.join(".")}`;
      ct.current.add(g);
    }
    const u = o.getState();
    et(h, (g) => {
      const A = Z(e) ? e(g) : e, w = `${h}-${r.join(".")}`;
      if (w) {
        let V = !1, $ = u.signalDomElements.get(w);
        if ((!$ || $.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const O = r.slice(0, -1), W = J(A, O);
          if (Array.isArray(W)) {
            V = !0;
            const b = `${h}-${O.join(".")}`;
            $ = u.signalDomElements.get(b);
          }
        }
        if ($) {
          const O = V ? J(A, r.slice(0, -1)) : J(A, r);
          $.forEach(({ parentId: W, position: b, effect: U }) => {
            const T = document.querySelector(
              `[data-parent-id="${W}"]`
            );
            if (T) {
              const x = Array.from(T.childNodes);
              if (x[b]) {
                const P = U ? new Function("state", `return (${U})(state)`)(O) : O;
                x[b].textContent = String(P);
              }
            }
          });
        }
      }
      console.log("shadowState", u.shadowStateStore), s.updateType === "update" && (i || j.current?.validation?.key) && r && Y(
        (i || j.current?.validation?.key) + "." + r.join(".")
      );
      const E = r.slice(0, r.length - 1);
      s.updateType === "cut" && j.current?.validation?.key && Y(
        j.current?.validation?.key + "." + E.join(".")
      ), s.updateType === "insert" && j.current?.validation?.key && Ht(
        j.current?.validation?.key + "." + E.join(".")
      ).filter(([$, O]) => {
        let W = $?.split(".").length;
        if ($ == E.join(".") && W == E.length - 1) {
          let b = $ + "." + E;
          Y($), Bt(b, O);
        }
      });
      const N = u.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", N), N) {
        const V = wt(g, A), $ = new Set(V), O = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          W,
          b
        ] of N.components.entries()) {
          let U = !1;
          const T = Array.isArray(b.reactiveType) ? b.reactiveType : [b.reactiveType || "component"];
          if (console.log("component", b), !T.includes("none")) {
            if (T.includes("all")) {
              b.forceUpdate();
              continue;
            }
            if (T.includes("component") && ((b.paths.has(O) || b.paths.has("")) && (U = !0), !U))
              for (const x of $) {
                let P = x;
                for (; ; ) {
                  if (b.paths.has(P)) {
                    U = !0;
                    break;
                  }
                  const G = P.lastIndexOf(".");
                  if (G !== -1) {
                    const z = P.substring(
                      0,
                      G
                    );
                    if (!isNaN(
                      Number(P.substring(G + 1))
                    ) && b.paths.has(z)) {
                      U = !0;
                      break;
                    }
                    P = z;
                  } else
                    P = "";
                  if (P === "")
                    break;
                }
                if (U) break;
              }
            if (!U && T.includes("deps") && b.depsFunction) {
              const x = b.depsFunction(A);
              let P = !1;
              typeof x == "boolean" ? x && (P = !0) : B(b.deps, x) || (b.deps = x, P = !0), P && (U = !0);
            }
            U && b.forceUpdate();
          }
        }
      }
      const C = Date.now();
      r = r.map((V, $) => {
        const O = r.slice(0, -1), W = J(A, O);
        return $ === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (W.length - 1).toString() : V;
      });
      const { oldValue: M, newValue: D } = Yt(
        s.updateType,
        g,
        A,
        r
      ), _ = {
        timeStamp: C,
        stateKey: h,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: M,
        newValue: D
      };
      switch (s.updateType) {
        case "update":
          u.updateShadowAtPath(h, r, A);
          break;
        case "insert":
          const V = r.slice(0, -1);
          u.insertShadowArrayElement(h, V, D);
          break;
        case "cut":
          const $ = r.slice(0, -1), O = parseInt(r[r.length - 1]);
          u.removeShadowArrayElement(h, $, O);
          break;
      }
      if (zt(h, (V) => {
        const O = [...V ?? [], _].reduce((W, b) => {
          const U = `${b.stateKey}:${JSON.stringify(b.path)}`, T = W.get(U);
          return T ? (T.timeStamp = Math.max(T.timeStamp, b.timeStamp), T.newValue = b.newValue, T.oldValue = T.oldValue ?? b.oldValue, T.updateType = b.updateType) : W.set(U, { ...b }), W;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), Ct(
        A,
        h,
        j.current,
        F
      ), j.current?.middleware && j.current.middleware({
        updateLog: l,
        update: _
      }), j.current?.serverSync) {
        const V = u.serverState[h], $ = j.current?.serverSync;
        qt(h, {
          syncKey: typeof $.syncKey == "string" ? $.syncKey : $.syncKey({ state: A }),
          rollBackState: V,
          actionTimeStamp: Date.now() + ($.debounce ?? 3e3),
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
      F
    )
  ), o.getState().cogsStateStore[h] || et(h, t), o.getState().initialStateGlobal[h] || At(h, t));
  const d = pt(() => ft(
    h,
    rt,
    X.current,
    F
  ), [h, F]);
  return [xt(h), d];
}
function ft(t, c, m, f) {
  const y = /* @__PURE__ */ new Map();
  let k = 0;
  const p = (v) => {
    const n = v.join(".");
    for (const [S] of y)
      (S === n || S.startsWith(n + ".")) && y.delete(S);
    k++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && Y(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && Y(n?.key), v?.validationKey && Y(v.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), k++;
      const L = a(S, []), R = nt(t), F = Z(R?.localStorage?.key) ? R?.localStorage?.key(S) : R?.localStorage?.key, H = `${f}-${t}-${F}`;
      H && localStorage.removeItem(H), gt(t, L), et(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), k++;
      const n = ft(
        t,
        c,
        m,
        f
      ), S = o.getState().initialStateGlobal[t], L = nt(t), R = Z(L?.localStorage?.key) ? L?.localStorage?.key(S) : L?.localStorage?.key, F = `${f}-${t}-${R}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), Ot(() => {
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
      return !!(v && B(v, xt(t)));
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
    const F = {
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
                o.getState().removeValidationError(s), i.errors.forEach((g) => {
                  const A = [s, ...g.path].join(".");
                  o.getState().addValidationError(A, g.message);
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
          const d = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = J(e, n);
          return B(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = J(e, n);
            return B(d, r) ? "fresh" : "stale";
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
              } = e, u = q(null), [g, A] = tt({
                startIndex: 0,
                endIndex: 10
              }), [, w] = tt({}), E = q(i), N = q(0), C = q(!0), M = q(0);
              st(() => o.getState().subscribeToShadowState(t, () => w({})), [t]);
              const D = o().getNestedState(
                t,
                n
              ), _ = D.length, { totalHeight: V, positions: $ } = pt(() => {
                const T = o.getState().getShadowMetadata(t, n) || [];
                let x = 0;
                const P = [];
                for (let G = 0; G < _; G++) {
                  P[G] = x;
                  const z = T[G]?.virtualizer?.itemHeight;
                  x += z || r;
                }
                return { totalHeight: x, positions: P };
              }, [_, t, n.join("."), r]);
              at(() => {
                const T = u.current;
                if (!T) return;
                const x = V !== M.current;
                M.current = V, x && E.current && !C.current && T.scrollTo({
                  top: T.scrollHeight,
                  behavior: "auto"
                });
              }, [V]);
              const O = pt(() => {
                const T = Math.max(0, g.startIndex), x = Math.min(_, g.endIndex), P = Array.from(
                  { length: x - T },
                  (z, lt) => T + lt
                ), G = P.map((z) => D[z]);
                return a(G, n, {
                  ...S,
                  validIndices: P
                });
              }, [g.startIndex, g.endIndex, D, _]);
              at(() => {
                const T = u.current;
                if (!T) return;
                const x = E.current, P = _ > N.current;
                N.current = _;
                const G = () => {
                  const { scrollTop: z, clientHeight: lt, scrollHeight: _t } = T;
                  E.current = _t - z - lt < 10;
                  let ht = 0, dt = _ - 1;
                  for (; ht <= dt; ) {
                    const K = Math.floor((ht + dt) / 2);
                    $[K] < z ? ht = K + 1 : dt = K - 1;
                  }
                  const vt = Math.max(0, dt - s);
                  let Q = vt;
                  const Mt = z + lt;
                  for (; Q < _ && $[Q] < Mt; )
                    Q++;
                  Q = Math.min(_, Q + s), A((K) => K.startIndex !== vt || K.endIndex !== Q ? { startIndex: vt, endIndex: Q } : K);
                };
                return T.addEventListener("scroll", G, {
                  passive: !0
                }), i && C.current && _ > 0 ? (E.current = !0, requestAnimationFrame(() => {
                  u.current && (u.current.scrollTo({
                    top: u.current.scrollHeight,
                    behavior: "auto"
                  }), C.current = !1);
                })) : !C.current && x && P && requestAnimationFrame(() => {
                  T.scrollTo({
                    top: T.scrollHeight,
                    behavior: "smooth"
                  });
                }), G(), () => T.removeEventListener("scroll", G);
              }, [_, $, s, i]);
              const W = Et(
                (T = "smooth") => {
                  u.current && u.current.scrollTo({
                    top: u.current.scrollHeight,
                    behavior: T
                  });
                },
                []
              ), b = Et(
                (T, x = "smooth") => {
                  u.current && $[T] !== void 0 && u.current.scrollTo({
                    top: $[T],
                    behavior: x
                  });
                },
                [$]
              ), U = {
                outer: {
                  ref: u,
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
                    transform: `translateY(${$[g.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: O,
                virtualizerProps: U,
                scrollToBottom: W,
                scrollToIndex: b
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (g, A) => e(g.item, A.item)
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
                ({ item: g }, A) => e(g, A)
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
                const g = r[i], A = [...n, i.toString()], w = a(g, A, S);
                return e(g, w, {
                  register: () => {
                    const [, N] = tt({}), C = `${m}-${n.join(".")}-${i}`;
                    at(() => {
                      const M = `${t}////${C}`, D = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set(M, {
                        forceUpdate: () => N({}),
                        paths: /* @__PURE__ */ new Set([A.join(".")])
                      }), o.getState().stateComponents.set(t, D), () => {
                        const _ = o.getState().stateComponents.get(t);
                        _ && _.components.delete(M);
                      };
                    }, [t, C]);
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
            return (e) => v.map((s, i) => {
              let u;
              S?.validIndices && S.validIndices[i] !== void 0 ? u = S.validIndices[i] : u = i;
              const g = [...n, u.toString()], A = a(s, g, S);
              return e(
                s,
                A,
                i,
                v,
                a(v, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => it(Xt, {
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
                const g = r[i], A = [...n, i.toString()], w = a(g, A, S), E = `${m}-${n.join(".")}-${i}`;
                return it(Kt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: E,
                  itemPath: A,
                  children: e(
                    g,
                    w,
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
            return (e) => (p(n), yt(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), u = Z(e) ? e(i) : e;
              let g = null;
              if (!i.some((w) => {
                if (r) {
                  const N = r.every(
                    (C) => B(w[C], u[C])
                  );
                  return N && (g = w), N;
                }
                const E = B(w, u);
                return E && (g = w), E;
              }))
                p(n), yt(c, u, n, t);
              else if (s && g) {
                const w = s(g), E = i.map(
                  (N) => B(N, g) ? w : N
                );
                p(n), ot(c, E, n);
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
              r > -1 ? ut(c, n, t, r) : yt(c, e, n, t);
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
        const X = n[n.length - 1];
        if (!isNaN(Number(X))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => ut(
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
          return (d) => Nt({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Nt({
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
              const e = o.getState().cogsStateStore[t], s = Gt(e, d).newDocument;
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
                const u = wt(e, s), g = new Set(u);
                for (const [
                  A,
                  w
                ] of i.components.entries()) {
                  let E = !1;
                  const N = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!N.includes("none")) {
                    if (N.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (N.includes("component") && (w.paths.has("") && (E = !0), !E))
                      for (const C of g) {
                        if (w.paths.has(C)) {
                          E = !0;
                          break;
                        }
                        let M = C.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const D = C.substring(0, M);
                          if (w.paths.has(D)) {
                            E = !0;
                            break;
                          }
                          const _ = C.substring(
                            M + 1
                          );
                          if (!isNaN(Number(_))) {
                            const V = D.lastIndexOf(".");
                            if (V !== -1) {
                              const $ = D.substring(
                                0,
                                V
                              );
                              if (w.paths.has($)) {
                                E = !0;
                                break;
                              }
                            }
                          }
                          M = D.lastIndexOf(".");
                        }
                        if (E) break;
                      }
                    if (!E && N.includes("deps") && w.depsFunction) {
                      const C = w.depsFunction(s);
                      let M = !1;
                      typeof C == "boolean" ? C && (M = !0) : B(w.deps, C) || (w.deps = C, M = !0), M && (E = !0);
                    }
                    E && w.forceUpdate();
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
                s && s.length > 0 && s.forEach(([u]) => {
                  u && u.startsWith(d.key) && Y(u);
                });
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((g) => {
                  const A = g.path, w = g.message, E = [d.key, ...A].join(".");
                  e(E, w);
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
            Ut,
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
              Ft(() => {
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
        const j = [...n, l], rt = o.getState().getNestedState(t, j);
        return a(rt, j, S);
      }
    }, H = new Proxy(R, F);
    return y.set(L, {
      proxy: H,
      stateVersion: k
    }), H;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function Nt(t) {
  return it(Qt, { proxy: t });
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
    (y, k, p, I, a) => t._mapFn(y, k, p, I, a)
  ) : null;
}
function Qt({
  proxy: t
}) {
  const c = q(null), m = `${t._stateKey}-${t._path.join(".")}`;
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
      } catch (R) {
        console.error("Error evaluating effect function during mount:", R), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const L = document.createTextNode(String(S));
    f.replaceWith(L);
  }, [t._stateKey, t._path.join("."), t._effect]), it("span", {
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
  return it("text", {}, String(c));
}
function Kt({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: f
}) {
  const [, y] = tt({}), [k, p] = Lt(), I = q(null);
  return st(() => {
    p.height > 0 && p.height !== I.current && (I.current = p.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), at(() => {
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
  }, [t, c, m.join(".")]), /* @__PURE__ */ It("div", { ref: k, children: f });
}
export {
  Nt as $cogsSignal,
  Se as $cogsSignalStore,
  ue as addStateOptions,
  ge as createCogsState,
  fe as notifyComponent,
  Zt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
