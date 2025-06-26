"use client";
import { jsx as yt } from "react/jsx-runtime";
import { useState as et, useRef as Q, useEffect as nt, useLayoutEffect as Tt, useMemo as It, createElement as ct, useSyncExternalStore as Mt, startTransition as jt, useCallback as At } from "react";
import { transformStateFunc as Rt, isDeepEqual as J, isFunction as K, getNestedValue as Y, getDifferences as pt, debounce as Ot } from "./utility.js";
import { pushFunc as vt, updateFn as it, cutFunc as gt, ValidationWrapper as Ut, FormControlComponent as Ft } from "./Functions.jsx";
import Dt from "superjson";
import { v4 as wt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as kt } from "./store.js";
import { useCogsConfig as Nt } from "./CogsStateClient.jsx";
import { applyPatch as Wt } from "fast-json-patch";
import Lt from "react-use-measure";
function $t(t, c) {
  const S = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, y = S(t) || {};
  g(t, {
    ...y,
    ...c
  });
}
function bt({
  stateKey: t,
  options: c,
  initialOptionsPart: S
}) {
  const g = at(t) || {}, y = S[t] || {}, x = o.getState().setInitialStateOptions, w = { ...y, ...g };
  let I = !1;
  if (c)
    for (const s in c)
      w.hasOwnProperty(s) ? (s == "localStorage" && c[s] && w[s].key !== c[s]?.key && (I = !0, w[s] = c[s]), s == "initialState" && c[s] && w[s] !== c[s] && // Different references
      !J(w[s], c[s]) && (I = !0, w[s] = c[s])) : (I = !0, w[s] = c[s]);
  I && x(t, w);
}
function ue(t, { formElements: c, validation: S }) {
  return { initialState: t, formElements: c, validation: S };
}
const ge = (t, c) => {
  let S = t;
  const [g, y] = Rt(S);
  (Object.keys(y).length > 0 || c && Object.keys(c).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, at(I) || o.getState().setInitialStateOptions(I, y[I]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const x = (I, s) => {
    const [h] = et(s?.componentId ?? wt());
    bt({
      stateKey: I,
      options: s,
      initialOptionsPart: y
    });
    const r = o.getState().cogsStateStore[I] || g[I], f = s?.modifyState ? s.modifyState(r) : r, [G, O] = Jt(
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
    bt({ stateKey: I, options: s, initialOptionsPart: y }), s.localStorage && zt(I, s), lt(I);
  }
  return { useCogsState: x, setCogsOptions: w };
}, {
  setUpdaterState: ft,
  setState: rt,
  getInitialOptions: at,
  getKeyState: Ct,
  getValidationErrors: Gt,
  setStateLog: Bt,
  updateInitialStateGlobal: Et,
  addValidationError: Pt,
  removeValidationError: X,
  setServerSyncActions: Ht
} = o.getState(), xt = (t, c, S, g, y) => {
  S?.log && console.log(
    "saving to localstorage",
    c,
    S.localStorage?.key,
    g
  );
  const x = K(S?.localStorage?.key) ? S.localStorage?.key(t) : S?.localStorage?.key;
  if (x && g) {
    const w = `${g}-${c}-${x}`;
    let I;
    try {
      I = mt(w)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, h = Dt.serialize(s);
    window.localStorage.setItem(
      w,
      JSON.stringify(h.json)
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
}, zt = (t, c) => {
  const S = o.getState().cogsStateStore[t], { sessionId: g } = Nt(), y = K(c?.localStorage?.key) ? c.localStorage.key(S) : c?.localStorage?.key;
  if (y && g) {
    const x = mt(
      `${g}-${t}-${y}`
    );
    if (x && x.lastUpdated > (x.lastSyncedWithServer || 0))
      return rt(t, x.state), lt(t), !0;
  }
  return !1;
}, _t = (t, c, S, g, y, x) => {
  const w = {
    initialState: c,
    updaterState: St(
      t,
      g,
      y,
      x
    ),
    state: S
  };
  Et(t, w.initialState), ft(t, w.updaterState), rt(t, w.state);
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
}, qt = (t, c, S, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: Y(c, g),
        newValue: Y(S, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: Y(S, g)
      };
    case "cut":
      return {
        oldValue: Y(c, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Jt(t, {
  stateKey: c,
  serverSync: S,
  localStorage: g,
  formElements: y,
  reactiveDeps: x,
  reactiveType: w,
  componentId: I,
  initialState: s,
  syncUpdate: h,
  dependencies: r,
  serverState: f
} = {}) {
  const [G, O] = et({}), { sessionId: U } = Nt();
  let B = !c;
  const [m] = et(c ?? wt()), l = o.getState().stateLog[m], dt = Q(/* @__PURE__ */ new Set()), tt = Q(I ?? wt()), j = Q(
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
      $t(m, {
        initialState: s
      });
      const e = j.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[m];
      if (!(i && !J(i, s) || !i) && !a)
        return;
      let u = null;
      const p = K(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      p && U && (u = mt(`${U}-${m}-${p}`));
      let T = s, A = !1;
      const _ = a ? Date.now() : 0, k = u?.lastUpdated || 0, M = u?.lastSyncedWithServer || 0;
      a && _ > k ? (T = e.serverState.data, A = !0) : u && k > M && (T = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(T)), o.getState().initializeShadowState(m, s), _t(
        m,
        s,
        T,
        st,
        tt.current,
        U
      ), A && p && U && xt(T, m, e, U, Date.now()), lt(m), (Array.isArray(w) ? w : [w || "component"]).includes("none") || O({});
    }
  }, [
    s,
    f?.status,
    f?.data,
    ...r || []
  ]), Tt(() => {
    B && $t(m, {
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
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: x || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), o.getState().stateComponents.set(m, n), O({}), () => {
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
        let b = !1, N = v.signalDomElements.get(T);
        if ((!N || N.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const C = n.slice(0, -1), W = Y(p, C);
          if (Array.isArray(W)) {
            b = !0;
            const E = `${m}-${C.join(".")}`;
            N = v.signalDomElements.get(E);
          }
        }
        if (N) {
          const C = b ? Y(p, n.slice(0, -1)) : Y(p, n);
          N.forEach(({ parentId: W, position: E, effect: F }) => {
            const R = document.querySelector(
              `[data-parent-id="${W}"]`
            );
            if (R) {
              const V = Array.from(R.childNodes);
              if (V[E]) {
                const $ = F ? new Function("state", `return (${F})(state)`)(C) : C;
                V[E].textContent = String($);
              }
            }
          });
        }
      }
      console.log("shadowState", v.shadowStateStore), a.updateType === "update" && (i || j.current?.validation?.key) && n && X(
        (i || j.current?.validation?.key) + "." + n.join(".")
      );
      const A = n.slice(0, n.length - 1);
      a.updateType === "cut" && j.current?.validation?.key && X(
        j.current?.validation?.key + "." + A.join(".")
      ), a.updateType === "insert" && j.current?.validation?.key && Gt(
        j.current?.validation?.key + "." + A.join(".")
      ).filter(([N, C]) => {
        let W = N?.split(".").length;
        if (N == A.join(".") && W == A.length - 1) {
          let E = N + "." + A;
          X(N), Pt(E, C);
        }
      });
      const _ = v.stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", _), _) {
        const b = pt(u, p), N = new Set(b), C = a.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          W,
          E
        ] of _.components.entries()) {
          let F = !1;
          const R = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (console.log("component", E), !R.includes("none")) {
            if (R.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if (R.includes("component") && ((E.paths.has(C) || E.paths.has("")) && (F = !0), !F))
              for (const V of N) {
                let $ = V;
                for (; ; ) {
                  if (E.paths.has($)) {
                    F = !0;
                    break;
                  }
                  const D = $.lastIndexOf(".");
                  if (D !== -1) {
                    const L = $.substring(
                      0,
                      D
                    );
                    if (!isNaN(
                      Number($.substring(D + 1))
                    ) && E.paths.has(L)) {
                      F = !0;
                      break;
                    }
                    $ = L;
                  } else
                    $ = "";
                  if ($ === "")
                    break;
                }
                if (F) break;
              }
            if (!F && R.includes("deps") && E.depsFunction) {
              const V = E.depsFunction(p);
              let $ = !1;
              typeof V == "boolean" ? V && ($ = !0) : J(E.deps, V) || (E.deps = V, $ = !0), $ && (F = !0);
            }
            F && E.forceUpdate();
          }
        }
      }
      const k = Date.now();
      n = n.map((b, N) => {
        const C = n.slice(0, -1), W = Y(p, C);
        return N === n.length - 1 && ["insert", "cut"].includes(a.updateType) ? (W.length - 1).toString() : b;
      });
      const { oldValue: M, newValue: P } = qt(
        a.updateType,
        u,
        p,
        n
      ), H = {
        timeStamp: k,
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
          const b = n.slice(0, -1);
          v.insertShadowArrayElement(m, b, P);
          break;
        case "cut":
          const N = n.slice(0, -1), C = parseInt(n[n.length - 1]);
          v.removeShadowArrayElement(m, N, C);
          break;
      }
      if (Bt(m, (b) => {
        const C = [...b ?? [], H].reduce((W, E) => {
          const F = `${E.stateKey}:${JSON.stringify(E.path)}`, R = W.get(F);
          return R ? (R.timeStamp = Math.max(R.timeStamp, E.timeStamp), R.newValue = E.newValue, R.oldValue = R.oldValue ?? E.oldValue, R.updateType = E.updateType) : W.set(F, { ...E }), W;
        }, /* @__PURE__ */ new Map());
        return Array.from(C.values());
      }), xt(
        p,
        m,
        j.current,
        U
      ), j.current?.middleware && j.current.middleware({
        updateLog: l,
        update: H
      }), j.current?.serverSync) {
        const b = v.serverState[m], N = j.current?.serverSync;
        Ht(m, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: p }),
          rollBackState: b,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return p;
    });
  };
  o.getState().updaterState[m] || (ft(
    m,
    St(
      m,
      st,
      tt.current,
      U
    )
  ), o.getState().cogsStateStore[m] || rt(m, t), o.getState().initialStateGlobal[m] || Et(m, t));
  const d = It(() => St(
    m,
    st,
    tt.current,
    U
  ), [m, U]);
  return [Ct(m), d];
}
function St(t, c, S, g) {
  const y = /* @__PURE__ */ new Map();
  let x = 0;
  const w = (h) => {
    const r = h.join(".");
    for (const [f] of y)
      (f === r || f.startsWith(r + ".")) && y.delete(f);
    x++;
  }, I = {
    removeValidation: (h) => {
      h?.validationKey && X(h.validationKey);
    },
    revertToInitialState: (h) => {
      const r = o.getState().getInitialOptions(t)?.validation;
      r?.key && X(r?.key), h?.validationKey && X(h.validationKey);
      const f = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), x++;
      const G = s(f, []), O = at(t), U = K(O?.localStorage?.key) ? O?.localStorage?.key(f) : O?.localStorage?.key, B = `${g}-${t}-${U}`;
      B && localStorage.removeItem(B), ft(t, G), rt(t, f);
      const m = o.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), f;
    },
    updateInitialState: (h) => {
      y.clear(), x++;
      const r = St(
        t,
        c,
        S,
        g
      ), f = o.getState().initialStateGlobal[t], G = at(t), O = K(G?.localStorage?.key) ? G?.localStorage?.key(f) : G?.localStorage?.key, U = `${g}-${t}-${O}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), jt(() => {
        Et(t, h), o.getState().initializeShadowState(t, h), ft(t, r), rt(t, h);
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
      return !!(h && J(h, Ct(t)));
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
          return () => pt(
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
          const d = o.getState().getNestedState(t, r), e = o.getState().initialStateGlobal[t], n = Y(e, r);
          return J(d, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              r
            ), e = o.getState().initialStateGlobal[t], n = Y(e, r);
            return J(d, n) ? "fresh" : "stale";
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
              } = e, u = Q(null), [p, T] = et({
                startIndex: 0,
                endIndex: 10
              }), [A, _] = et(0), k = Q(!1), M = Q(!0), P = Q(
                null
              );
              nt(() => o.getState().subscribeToShadowState(t, () => {
                _(($) => $ + 1);
              }), [t]);
              const H = o().getNestedState(
                t,
                r
              ), b = H.length, { totalHeight: N, positions: C } = It(() => {
                const V = o.getState().getShadowMetadata(t, r) || [];
                let $ = 0;
                const D = [];
                for (let L = 0; L < b; L++) {
                  D[L] = $;
                  const Z = V[L]?.virtualizer?.itemHeight;
                  $ += Z || n;
                }
                return { totalHeight: $, positions: D };
              }, [
                b,
                t,
                r.join("."),
                n,
                A
              ]), W = It(() => {
                const V = Math.max(0, p.startIndex), $ = Math.min(b, p.endIndex), D = Array.from(
                  { length: $ - V },
                  (Z, q) => V + q
                ), L = D.map((Z) => H[Z]);
                return s(L, r, {
                  ...f,
                  validIndices: D
                });
              }, [p.startIndex, p.endIndex, H, b]);
              nt(() => {
                if (!i || !u.current || b === 0 || !M.current) return;
                P.current && clearInterval(P.current);
                const V = 50, $ = p.endIndex < V, D = b > p.endIndex + V;
                if ($ || D) {
                  k.current = !0;
                  const q = {
                    startIndex: Math.max(0, b - 20),
                    endIndex: b
                  };
                  T(q), setTimeout(() => {
                    k.current = !1;
                  }, 100);
                }
                let L = 0;
                const Z = 50;
                return P.current = setInterval(() => {
                  const q = u.current;
                  if (!q) return;
                  L++;
                  const { scrollTop: ot, scrollHeight: ut, clientHeight: ht } = q, z = ot + ht;
                  ut - z < 5 || L >= Z ? (clearInterval(P.current), P.current = null) : (k.current = !0, q.scrollTop = q.scrollHeight, setTimeout(() => {
                    k.current = !1;
                  }, 50));
                }, 100), () => {
                  P.current && (clearInterval(P.current), P.current = null);
                };
              }, [b, i, p.startIndex, p.endIndex]), nt(() => {
                const V = u.current;
                if (!V) return;
                const $ = () => {
                  if (k.current)
                    return;
                  P.current && (clearInterval(P.current), P.current = null);
                  const { scrollTop: D, scrollHeight: L, clientHeight: Z } = V, q = L - D - Z < 10;
                  M.current = q;
                  let ot = 0;
                  for (let z = 0; z < C.length; z++)
                    if (C[z] > D - n * a) {
                      ot = Math.max(0, z - 1);
                      break;
                    }
                  let ut = ot;
                  const ht = D + Z;
                  for (let z = ot; z < C.length && !(C[z] > ht + n * a); z++)
                    ut = z;
                  T({
                    startIndex: Math.max(0, ot),
                    endIndex: Math.min(b, ut + 1 + a)
                  });
                };
                return V.addEventListener("scroll", $, {
                  passive: !0
                }), $(), () => {
                  V.removeEventListener("scroll", $);
                };
              }, [C, b, n, a]);
              const E = At(
                (V = "auto") => {
                  M.current = !0, k.current = !0, u.current && (u.current.scrollTop = u.current.scrollHeight), setTimeout(() => {
                    k.current = !1;
                  }, 100);
                },
                []
              ), F = At(
                (V, $ = "smooth") => {
                  k.current = !0, u.current && C[V] !== void 0 && u.current.scrollTo({
                    top: C[V],
                    behavior: $
                  }), setTimeout(() => {
                    k.current = !1;
                  }, 100);
                },
                [C]
              ), R = {
                outer: {
                  ref: u,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${N}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${C[p.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: W,
                virtualizerProps: R,
                scrollToBottom: E,
                scrollToIndex: F
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
                    const [, _] = et({}), k = `${S}-${r.join(".")}-${i}`;
                    Tt(() => {
                      const M = `${t}////${k}`, P = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return P.components.set(M, {
                        forceUpdate: () => _({}),
                        paths: /* @__PURE__ */ new Set([p.join(".")])
                      }), o.getState().stateComponents.set(t, P), () => {
                        const H = o.getState().stateComponents.get(t);
                        H && H.components.delete(M);
                      };
                    }, [t, k]);
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
            return (e) => ct(Yt, {
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
                return ct(Xt, {
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
              y.clear(), x++;
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
            return (e) => (w(r), vt(c, e, r, t), s(
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
                    (k) => J(T[k], v[k])
                  );
                  return _ && (u = T), _;
                }
                const A = J(T, v);
                return A && (u = T), A;
              }))
                w(r), vt(c, v, r, t);
              else if (a && u) {
                const T = a(u), A = i.map(
                  (_) => J(_, u) ? T : _
                );
                w(r), it(c, A, r);
              }
            };
          if (l === "cut")
            return (e, n) => {
              if (!n?.waitForSync)
                return w(r), gt(c, r, t, e), s(
                  o.getState().getNestedState(t, r),
                  r
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let n = 0; n < h.length; n++)
                h[n] === e && gt(c, r, t, n);
            };
          if (l === "toggleByValue")
            return (e) => {
              const n = h.findIndex((a) => a === e);
              n > -1 ? gt(c, r, t, n) : vt(c, e, r, t);
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
            return () => gt(
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
          return (d) => Vt({
            _stateKey: t,
            _path: r,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Vt({
            _stateKey: t,
            _path: r
          });
        if (l === "lastSynced") {
          const d = `${t}:${r.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => mt(g + "-" + t + "-" + d);
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
              X(e.key), console.log("addValidationError", d), d.forEach((n) => {
                const a = [e.key, ...n.path].join(".");
                console.log("fullErrorPath", a), Pt(a, n.message);
              }), lt(t);
            };
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], a = Wt(e, d).newDocument;
              _t(
                t,
                o.getState().initialStateGlobal[t],
                a,
                c,
                S,
                g
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const v = pt(e, a), u = new Set(v);
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
                      for (const k of u) {
                        if (T.paths.has(k)) {
                          A = !0;
                          break;
                        }
                        let M = k.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const P = k.substring(0, M);
                          if (T.paths.has(P)) {
                            A = !0;
                            break;
                          }
                          const H = k.substring(
                            M + 1
                          );
                          if (!isNaN(Number(H))) {
                            const b = P.lastIndexOf(".");
                            if (b !== -1) {
                              const N = P.substring(
                                0,
                                b
                              );
                              if (T.paths.has(N)) {
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
                      const k = T.depsFunction(a);
                      let M = !1;
                      typeof k == "boolean" ? k && (M = !0) : J(T.deps, k) || (T.deps = k, M = !0), M && (A = !0);
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
              X(d.key);
              const n = o.getState().cogsStateStore[t];
              try {
                const a = o.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([v]) => {
                  v && v.startsWith(d.key) && X(v);
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
          return () => kt.getState().getFormRef(t + "." + r.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ yt(
            Ut,
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
              Ot(() => {
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
          return (d, e) => /* @__PURE__ */ yt(
            Ft,
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
    }, B = new Proxy(O, U);
    return y.set(G, {
      proxy: B,
      stateVersion: x
    }), B;
  }
  return s(
    o.getState().getNestedState(t, [])
  );
}
function Vt(t) {
  return ct(Zt, { proxy: t });
}
function Yt({
  proxy: t,
  rebuildStateShape: c
}) {
  const S = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(S) ? c(
    S,
    t._path
  ).stateMapNoRender(
    (y, x, w, I, s) => t._mapFn(y, x, w, I, s)
  ) : null;
}
function Zt({
  proxy: t
}) {
  const c = Q(null), S = `${t._stateKey}-${t._path.join(".")}`;
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
  }, [t._stateKey, t._path.join("."), t._effect]), ct("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function Se(t) {
  const c = Mt(
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
function Xt({
  stateKey: t,
  itemComponentId: c,
  itemPath: S,
  children: g
}) {
  const [, y] = et({}), [x, w] = Lt(), I = Q(null);
  return nt(() => {
    w.height > 0 && w.height !== I.current && (I.current = w.height, o.getState().setShadowMetadata(t, S, {
      virtualizer: {
        itemHeight: w.height
      }
    }));
  }, [w.height, t, S]), Tt(() => {
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
  }, [t, c, S.join(".")]), /* @__PURE__ */ yt("div", { ref: x, children: g });
}
export {
  Vt as $cogsSignal,
  Se as $cogsSignalStore,
  ue as addStateOptions,
  ge as createCogsState,
  fe as notifyComponent,
  Jt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
