"use client";
import { jsx as pt } from "react/jsx-runtime";
import { useState as et, useRef as X, useEffect as nt, useLayoutEffect as At, useMemo as wt, createElement as ct, useSyncExternalStore as Rt, startTransition as Ot, useCallback as kt } from "react";
import { transformStateFunc as Ut, isDeepEqual as q, isFunction as K, getNestedValue as J, getDifferences as Tt, debounce as Ft } from "./utility.js";
import { pushFunc as It, updateFn as it, cutFunc as ft, ValidationWrapper as Dt, FormControlComponent as Wt } from "./Functions.jsx";
import Lt from "superjson";
import { v4 as Et } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as bt } from "./store.js";
import { useCogsConfig as Pt } from "./CogsStateClient.jsx";
import { applyPatch as Gt } from "fast-json-patch";
import Bt from "react-use-measure";
function xt(t, c) {
  const S = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, y = S(t) || {};
  g(t, {
    ...y,
    ...c
  });
}
function Vt({
  stateKey: t,
  options: c,
  initialOptionsPart: S
}) {
  const g = at(t) || {}, y = S[t] || {}, b = o.getState().setInitialStateOptions, w = { ...y, ...g };
  let I = !1;
  if (c)
    for (const s in c)
      w.hasOwnProperty(s) ? (s == "localStorage" && c[s] && w[s].key !== c[s]?.key && (I = !0, w[s] = c[s]), s == "initialState" && c[s] && w[s] !== c[s] && // Different references
      !q(w[s], c[s]) && (I = !0, w[s] = c[s])) : (I = !0, w[s] = c[s]);
  I && b(t, w);
}
function ue(t, { formElements: c, validation: S }) {
  return { initialState: t, formElements: c, validation: S };
}
const ge = (t, c) => {
  let S = t;
  const [g, y] = Ut(S);
  (Object.keys(y).length > 0 || c && Object.keys(c).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, at(I) || o.getState().setInitialStateOptions(I, y[I]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const b = (I, s) => {
    const [h] = et(s?.componentId ?? Et());
    Vt({
      stateKey: I,
      options: s,
      initialOptionsPart: y
    });
    const r = o.getState().cogsStateStore[I] || g[I], f = s?.modifyState ? s.modifyState(r) : r, [G, U] = Zt(
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
    return U;
  };
  function w(I, s) {
    Vt({ stateKey: I, options: s, initialOptionsPart: y }), s.localStorage && Jt(I, s), lt(I);
  }
  return { useCogsState: b, setCogsOptions: w };
}, {
  setUpdaterState: St,
  setState: rt,
  getInitialOptions: at,
  getKeyState: _t,
  getValidationErrors: Ht,
  setStateLog: zt,
  updateInitialStateGlobal: $t,
  addValidationError: Mt,
  removeValidationError: Z,
  setServerSyncActions: qt
} = o.getState(), Nt = (t, c, S, g, y) => {
  S?.log && console.log(
    "saving to localstorage",
    c,
    S.localStorage?.key,
    g
  );
  const b = K(S?.localStorage?.key) ? S.localStorage?.key(t) : S?.localStorage?.key;
  if (b && g) {
    const w = `${g}-${c}-${b}`;
    let I;
    try {
      I = ht(w)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, h = Lt.serialize(s);
    window.localStorage.setItem(
      w,
      JSON.stringify(h.json)
    );
  }
}, ht = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, Jt = (t, c) => {
  const S = o.getState().cogsStateStore[t], { sessionId: g } = Pt(), y = K(c?.localStorage?.key) ? c.localStorage.key(S) : c?.localStorage?.key;
  if (y && g) {
    const b = ht(
      `${g}-${t}-${y}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return rt(t, b.state), lt(t), !0;
  }
  return !1;
}, jt = (t, c, S, g, y, b) => {
  const w = {
    initialState: c,
    updaterState: mt(
      t,
      g,
      y,
      b
    ),
    state: S
  };
  $t(t, w.initialState), St(t, w.updaterState), rt(t, w.state);
}, lt = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const S = /* @__PURE__ */ new Set();
  c.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || S.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((g) => g());
  });
}, fe = (t, c) => {
  const S = o.getState().stateComponents.get(t);
  if (S) {
    const g = `${t}////${c}`, y = S.components.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Yt = (t, c, S, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: J(c, g),
        newValue: J(S, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: J(S, g)
      };
    case "cut":
      return {
        oldValue: J(c, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Zt(t, {
  stateKey: c,
  serverSync: S,
  localStorage: g,
  formElements: y,
  reactiveDeps: b,
  reactiveType: w,
  componentId: I,
  initialState: s,
  syncUpdate: h,
  dependencies: r,
  serverState: f
} = {}) {
  const [G, U] = et({}), { sessionId: F } = Pt();
  let B = !c;
  const [m] = et(c ?? Et()), l = o.getState().stateLog[m], dt = X(/* @__PURE__ */ new Set()), tt = X(I ?? Et()), j = X(
    null
  );
  j.current = at(m) ?? null, nt(() => {
    if (h && h.stateKey === m && h.path?.[0]) {
      rt(m, (n) => ({
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
      xt(m, {
        initialState: s
      });
      const e = j.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[m];
      if (!(i && !q(i, s) || !i) && !a)
        return;
      let u = null;
      const p = K(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      p && F && (u = ht(`${F}-${m}-${p}`));
      let T = s, A = !1;
      const _ = a ? Date.now() : 0, C = u?.lastUpdated || 0, M = u?.lastSyncedWithServer || 0;
      a && _ > C ? (T = e.serverState.data, A = !0) : u && C > M && (T = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(T)), o.getState().initializeShadowState(m, s), jt(
        m,
        s,
        T,
        st,
        tt.current,
        F
      ), A && p && F && Nt(T, m, e, F, Date.now()), lt(m), (Array.isArray(w) ? w : [w || "component"]).includes("none") || U({});
    }
  }, [
    s,
    f?.status,
    f?.data,
    ...r || []
  ]), At(() => {
    B && xt(m, {
      serverSync: S,
      formElements: y,
      initialState: s,
      localStorage: g,
      middleware: j.current?.middleware
    });
    const e = `${m}////${tt.current}`, n = o.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(e, {
      forceUpdate: () => U({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), o.getState().stateComponents.set(m, n), U({}), () => {
      n && (n.components.delete(e), n.components.size === 0 && o.getState().stateComponents.delete(m));
    };
  }, []);
  const st = (e, n, a, i) => {
    if (Array.isArray(n)) {
      const u = `${m}-${n.join(".")}`;
      dt.current.add(u);
    }
    const v = o.getState();
    rt(m, (u) => {
      const p = K(e) ? e(u) : e, T = `${m}-${n.join(".")}`;
      if (T) {
        let k = !1, V = v.signalDomElements.get(T);
        if ((!V || V.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const N = n.slice(0, -1), L = J(p, N);
          if (Array.isArray(L)) {
            k = !0;
            const E = `${m}-${N.join(".")}`;
            V = v.signalDomElements.get(E);
          }
        }
        if (V) {
          const N = k ? J(p, n.slice(0, -1)) : J(p, n);
          V.forEach(({ parentId: L, position: E, effect: D }) => {
            const R = document.querySelector(
              `[data-parent-id="${L}"]`
            );
            if (R) {
              const x = Array.from(R.childNodes);
              if (x[E]) {
                const $ = D ? new Function("state", `return (${D})(state)`)(N) : N;
                x[E].textContent = String($);
              }
            }
          });
        }
      }
      console.log("shadowState", v.shadowStateStore), a.updateType === "update" && (i || j.current?.validation?.key) && n && Z(
        (i || j.current?.validation?.key) + "." + n.join(".")
      );
      const A = n.slice(0, n.length - 1);
      a.updateType === "cut" && j.current?.validation?.key && Z(
        j.current?.validation?.key + "." + A.join(".")
      ), a.updateType === "insert" && j.current?.validation?.key && Ht(
        j.current?.validation?.key + "." + A.join(".")
      ).filter(([V, N]) => {
        let L = V?.split(".").length;
        if (V == A.join(".") && L == A.length - 1) {
          let E = V + "." + A;
          Z(V), Mt(E, N);
        }
      });
      const _ = v.stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", _), _) {
        const k = Tt(u, p), V = new Set(k), N = a.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          L,
          E
        ] of _.components.entries()) {
          let D = !1;
          const R = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (console.log("component", E), !R.includes("none")) {
            if (R.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if (R.includes("component") && ((E.paths.has(N) || E.paths.has("")) && (D = !0), !D))
              for (const x of V) {
                let $ = x;
                for (; ; ) {
                  if (E.paths.has($)) {
                    D = !0;
                    break;
                  }
                  const W = $.lastIndexOf(".");
                  if (W !== -1) {
                    const O = $.substring(
                      0,
                      W
                    );
                    if (!isNaN(
                      Number($.substring(W + 1))
                    ) && E.paths.has(O)) {
                      D = !0;
                      break;
                    }
                    $ = O;
                  } else
                    $ = "";
                  if ($ === "")
                    break;
                }
                if (D) break;
              }
            if (!D && R.includes("deps") && E.depsFunction) {
              const x = E.depsFunction(p);
              let $ = !1;
              typeof x == "boolean" ? x && ($ = !0) : q(E.deps, x) || (E.deps = x, $ = !0), $ && (D = !0);
            }
            D && E.forceUpdate();
          }
        }
      }
      const C = Date.now();
      n = n.map((k, V) => {
        const N = n.slice(0, -1), L = J(p, N);
        return V === n.length - 1 && ["insert", "cut"].includes(a.updateType) ? (L.length - 1).toString() : k;
      });
      const { oldValue: M, newValue: P } = Yt(
        a.updateType,
        u,
        p,
        n
      ), z = {
        timeStamp: C,
        stateKey: m,
        path: n,
        updateType: a.updateType,
        status: "new",
        oldValue: M,
        newValue: P
      };
      switch (a.updateType) {
        case "update":
          v.updateShadowAtPath(m, n, p);
          break;
        case "insert":
          const k = n.slice(0, -1);
          v.insertShadowArrayElement(m, k, P);
          break;
        case "cut":
          const V = n.slice(0, -1), N = parseInt(n[n.length - 1]);
          v.removeShadowArrayElement(m, V, N);
          break;
      }
      if (zt(m, (k) => {
        const N = [...k ?? [], z].reduce((L, E) => {
          const D = `${E.stateKey}:${JSON.stringify(E.path)}`, R = L.get(D);
          return R ? (R.timeStamp = Math.max(R.timeStamp, E.timeStamp), R.newValue = E.newValue, R.oldValue = R.oldValue ?? E.oldValue, R.updateType = E.updateType) : L.set(D, { ...E }), L;
        }, /* @__PURE__ */ new Map());
        return Array.from(N.values());
      }), Nt(
        p,
        m,
        j.current,
        F
      ), j.current?.middleware && j.current.middleware({
        updateLog: l,
        update: z
      }), j.current?.serverSync) {
        const k = v.serverState[m], V = j.current?.serverSync;
        qt(m, {
          syncKey: typeof V.syncKey == "string" ? V.syncKey : V.syncKey({ state: p }),
          rollBackState: k,
          actionTimeStamp: Date.now() + (V.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return p;
    });
  };
  o.getState().updaterState[m] || (St(
    m,
    mt(
      m,
      st,
      tt.current,
      F
    )
  ), o.getState().cogsStateStore[m] || rt(m, t), o.getState().initialStateGlobal[m] || $t(m, t));
  const d = wt(() => mt(
    m,
    st,
    tt.current,
    F
  ), [m, F]);
  return [_t(m), d];
}
function mt(t, c, S, g) {
  const y = /* @__PURE__ */ new Map();
  let b = 0;
  const w = (h) => {
    const r = h.join(".");
    for (const [f] of y)
      (f === r || f.startsWith(r + ".")) && y.delete(f);
    b++;
  }, I = {
    removeValidation: (h) => {
      h?.validationKey && Z(h.validationKey);
    },
    revertToInitialState: (h) => {
      const r = o.getState().getInitialOptions(t)?.validation;
      r?.key && Z(r?.key), h?.validationKey && Z(h.validationKey);
      const f = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), b++;
      const G = s(f, []), U = at(t), F = K(U?.localStorage?.key) ? U?.localStorage?.key(f) : U?.localStorage?.key, B = `${g}-${t}-${F}`;
      B && localStorage.removeItem(B), St(t, G), rt(t, f);
      const m = o.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), f;
    },
    updateInitialState: (h) => {
      y.clear(), b++;
      const r = mt(
        t,
        c,
        S,
        g
      ), f = o.getState().initialStateGlobal[t], G = at(t), U = K(G?.localStorage?.key) ? G?.localStorage?.key(f) : G?.localStorage?.key, F = `${g}-${t}-${U}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), Ot(() => {
        $t(t, h), o.getState().initializeShadowState(t, h), St(t, r), rt(t, h);
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
      return !!(h && q(h, _t(t)));
    }
  };
  function s(h, r = [], f) {
    const G = r.map(String).join(".");
    y.get(G);
    const U = function() {
      return o().getNestedState(t, r);
    };
    Object.keys(I).forEach((m) => {
      U[m] = I[m];
    });
    const F = {
      apply(m, l, dt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${r.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, r);
      },
      get(m, l) {
        f?.validIndices && !Array.isArray(h) && (f = { ...f, validIndices: void 0 });
        const dt = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !dt.has(l)) {
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
          return () => Tt(
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
          const d = o.getState().getNestedState(t, r), e = o.getState().initialStateGlobal[t], n = J(e, r);
          return q(d, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              r
            ), e = o.getState().initialStateGlobal[t], n = J(e, r);
            return q(d, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = at(t), n = K(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${g}-${t}-${n}`;
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
              } = e, u = X(null), [p, T] = et({
                startIndex: 0,
                endIndex: 10
              }), [A, _] = et(0), C = X(!1), M = X(!0), P = X(
                null
              );
              nt(() => o.getState().subscribeToShadowState(t, () => {
                _(($) => $ + 1);
              }), [t]);
              const z = o().getNestedState(
                t,
                r
              ), k = z.length, { totalHeight: V, positions: N } = wt(() => {
                const x = o.getState().getShadowMetadata(t, r) || [];
                let $ = 0;
                const W = [];
                for (let O = 0; O < k; O++) {
                  W[O] = $;
                  const Q = x[O]?.virtualizer?.itemHeight;
                  $ += Q || n;
                }
                return { totalHeight: $, positions: W };
              }, [
                k,
                t,
                r.join("."),
                n,
                A
              ]), L = wt(() => {
                const x = Math.max(0, p.startIndex), $ = Math.min(k, p.endIndex), W = Array.from(
                  { length: $ - x },
                  (Q, Y) => x + Y
                ), O = W.map((Q) => z[Q]);
                return s(O, r, {
                  ...f,
                  validIndices: W
                });
              }, [p.startIndex, p.endIndex, z, k]);
              nt(() => {
                if (!i || !u.current || k === 0 || !M.current) return;
                P.current && clearInterval(P.current);
                const x = 50, $ = p.endIndex < x, W = k > p.endIndex + x;
                ($ || W) && T({
                  startIndex: Math.max(0, k - 20),
                  endIndex: k
                });
                let O = 0;
                const Q = 50;
                return P.current = setInterval(() => {
                  const Y = u.current;
                  if (!Y) return;
                  O++;
                  const { scrollTop: vt, scrollHeight: ot, clientHeight: ut } = Y, gt = vt + ut, H = ot, yt = H - gt < 5;
                  console.log(
                    `Scroll attempt ${O}: currentBottom=${gt}, actualBottom=${H}, isAtBottom=${yt}`
                  ), yt || O >= Q ? (clearInterval(P.current), P.current = null, console.log(
                    yt ? "Reached bottom!" : "Timeout - giving up"
                  )) : Y.scrollTop = Y.scrollHeight;
                }, 100), () => {
                  P.current && (clearInterval(P.current), P.current = null);
                };
              }, [k, i]), nt(() => {
                const x = u.current;
                if (!x) return;
                let $;
                const W = () => {
                  P.current && (clearInterval(P.current), P.current = null);
                  const { scrollTop: O, scrollHeight: Q, clientHeight: Y } = x, vt = Q - O - Y < 10;
                  M.current = vt, clearTimeout($), C.current = !0, $ = setTimeout(() => {
                    C.current = !1;
                  }, 150);
                  let ot = 0;
                  for (let H = 0; H < N.length; H++)
                    if (N[H] > O - n * a) {
                      ot = Math.max(0, H - 1);
                      break;
                    }
                  let ut = ot;
                  const gt = O + Y;
                  for (let H = ot; H < N.length && !(N[H] > gt + n * a); H++)
                    ut = H;
                  T({
                    startIndex: Math.max(0, ot),
                    endIndex: Math.min(k, ut + 1 + a)
                  });
                };
                return x.addEventListener("scroll", W, {
                  passive: !0
                }), W(), () => {
                  x.removeEventListener("scroll", W), clearTimeout($);
                };
              }, [N, k, n, a]);
              const E = kt(
                (x = "auto") => {
                  M.current = !0, u.current && (u.current.scrollTop = u.current.scrollHeight);
                },
                []
              ), D = kt(
                (x, $ = "smooth") => {
                  u.current && N[x] !== void 0 && u.current.scrollTo({
                    top: N[x],
                    behavior: $
                  });
                },
                [N]
              ), R = {
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
                    transform: `translateY(${N[p.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: L,
                virtualizerProps: R,
                scrollToBottom: E,
                scrollToIndex: D
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
                    const [, _] = et({}), C = `${S}-${r.join(".")}-${i}`;
                    At(() => {
                      const M = `${t}////${C}`, P = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return P.components.set(M, {
                        forceUpdate: () => _({}),
                        paths: /* @__PURE__ */ new Set([p.join(".")])
                      }), o.getState().stateComponents.set(t, P), () => {
                        const z = o.getState().stateComponents.get(t);
                        z && z.components.delete(M);
                      };
                    }, [t, C]);
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
            return (e) => ct(Xt, {
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
                const u = n[i], p = [...r, i.toString()], T = s(u, p, f), A = `${S}-${r.join(".")}-${i}`;
                return ct(Kt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: A,
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
              y.clear(), b++;
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
            return (e) => (w(r), It(c, e, r, t), s(
              o.getState().getNestedState(t, r),
              r
            ));
          if (l === "uniqueInsert")
            return (e, n, a) => {
              const i = o.getState().getNestedState(t, r), v = K(e) ? e(i) : e;
              let u = null;
              if (!i.some((T) => {
                if (n) {
                  const _ = n.every(
                    (C) => q(T[C], v[C])
                  );
                  return _ && (u = T), _;
                }
                const A = q(T, v);
                return A && (u = T), A;
              }))
                w(r), It(c, v, r, t);
              else if (a && u) {
                const T = a(u), A = i.map(
                  (_) => q(_, u) ? T : _
                );
                w(r), it(c, A, r);
              }
            };
          if (l === "cut")
            return (e, n) => {
              if (!n?.waitForSync)
                return w(r), ft(c, r, t, e), s(
                  o.getState().getNestedState(t, r),
                  r
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let n = 0; n < h.length; n++)
                h[n] === e && ft(c, r, t, n);
            };
          if (l === "toggleByValue")
            return (e) => {
              const n = h.findIndex((a) => a === e);
              n > -1 ? ft(c, r, t, n) : It(c, e, r, t);
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
        const tt = r[r.length - 1];
        if (!isNaN(Number(tt))) {
          const d = r.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => ft(
              c,
              d,
              t,
              Number(tt)
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
          return (d) => Ct({
            _stateKey: t,
            _path: r,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Ct({
            _stateKey: t,
            _path: r
          });
        if (l === "lastSynced") {
          const d = `${t}:${r.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => ht(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = r.slice(0, -1), e = d.join("."), n = o.getState().getNestedState(t, d);
          return Array.isArray(n) ? Number(r[r.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = r.slice(0, -1), n = Number(r[r.length - 1]), a = e.join(".");
            d ? o.getState().setSelectedIndex(t, a, n) : o.getState().setSelectedIndex(t, a, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            it(c, i, e), w(e);
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
            it(c, i, d), w(d);
          };
        if (r.length == 0) {
          if (l === "addValidation")
            return (d) => {
              const e = o.getState().getInitialOptions(t)?.validation;
              if (!e?.key)
                throw new Error("Validation key not found");
              Z(e.key), console.log("addValidationError", d), d.forEach((n) => {
                const a = [e.key, ...n.path].join(".");
                console.log("fullErrorPath", a), Mt(a, n.message);
              }), lt(t);
            };
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], a = Gt(e, d).newDocument;
              jt(
                t,
                o.getState().initialStateGlobal[t],
                a,
                c,
                S,
                g
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const v = Tt(e, a), u = new Set(v);
                for (const [
                  p,
                  T
                ] of i.components.entries()) {
                  let A = !1;
                  const _ = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
                  if (!_.includes("none")) {
                    if (_.includes("all")) {
                      T.forceUpdate();
                      continue;
                    }
                    if (_.includes("component") && (T.paths.has("") && (A = !0), !A))
                      for (const C of u) {
                        if (T.paths.has(C)) {
                          A = !0;
                          break;
                        }
                        let M = C.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const P = C.substring(0, M);
                          if (T.paths.has(P)) {
                            A = !0;
                            break;
                          }
                          const z = C.substring(
                            M + 1
                          );
                          if (!isNaN(Number(z))) {
                            const k = P.lastIndexOf(".");
                            if (k !== -1) {
                              const V = P.substring(
                                0,
                                k
                              );
                              if (T.paths.has(V)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          M = P.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && _.includes("deps") && T.depsFunction) {
                      const C = T.depsFunction(a);
                      let M = !1;
                      typeof C == "boolean" ? C && (M = !0) : q(T.deps, C) || (T.deps = C, M = !0), M && (A = !0);
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
              Z(d.key);
              const n = o.getState().cogsStateStore[t];
              try {
                const a = o.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([v]) => {
                  v && v.startsWith(d.key) && Z(v);
                });
                const i = d.zodSchema.safeParse(n);
                return i.success ? !0 : (i.error.errors.forEach((u) => {
                  const p = u.path, T = u.message, A = [d.key, ...p].join(".");
                  e(A, T);
                }), lt(t), !1);
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
          return () => bt.getState().getFormRef(t + "." + r.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ pt(
            Dt,
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
              Ft(() => {
                it(c, d, r, "");
                const n = o.getState().getNestedState(t, r);
                e?.afterUpdate && e.afterUpdate(n);
              }, e.debounce);
            else {
              it(c, d, r, "");
              const n = o.getState().getNestedState(t, r);
              e?.afterUpdate && e.afterUpdate(n);
            }
            w(r);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ pt(
            Wt,
            {
              setState: c,
              stateKey: t,
              path: r,
              child: d,
              formOpts: e
            }
          );
        const j = [...r, l], st = o.getState().getNestedState(t, j);
        return s(st, j, f);
      }
    }, B = new Proxy(U, F);
    return y.set(G, {
      proxy: B,
      stateVersion: b
    }), B;
  }
  return s(
    o.getState().getNestedState(t, [])
  );
}
function Ct(t) {
  return ct(Qt, { proxy: t });
}
function Xt({
  proxy: t,
  rebuildStateShape: c
}) {
  const S = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(S) ? c(
    S,
    t._path
  ).stateMapNoRender(
    (y, b, w, I, s) => t._mapFn(y, b, w, I, s)
  ) : null;
}
function Qt({
  proxy: t
}) {
  const c = X(null), S = `${t._stateKey}-${t._path.join(".")}`;
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
      } catch (U) {
        console.error("Error evaluating effect function during mount:", U), f = r;
      }
    else
      f = r;
    f !== null && typeof f == "object" && (f = JSON.stringify(f));
    const G = document.createTextNode(String(f));
    g.replaceWith(G);
  }, [t._stateKey, t._path.join("."), t._effect]), ct("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function Se(t) {
  const c = Rt(
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
  return ct("text", {}, String(c));
}
function Kt({
  stateKey: t,
  itemComponentId: c,
  itemPath: S,
  children: g
}) {
  const [, y] = et({}), [b, w] = Bt(), I = X(null);
  return nt(() => {
    w.height > 0 && w.height !== I.current && (I.current = w.height, o.getState().setShadowMetadata(t, S, {
      virtualizer: {
        itemHeight: w.height
      }
    }));
  }, [w.height, t, S]), At(() => {
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
  }, [t, c, S.join(".")]), /* @__PURE__ */ pt("div", { ref: b, children: g });
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
