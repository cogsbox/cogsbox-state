"use client";
import { jsx as ut } from "react/jsx-runtime";
import { useState as Z, useRef as Y, useEffect as Q, useLayoutEffect as mt, useMemo as gt, createElement as nt, useSyncExternalStore as kt, startTransition as Nt, useCallback as vt } from "react";
import { transformStateFunc as Vt, isDeepEqual as G, isFunction as q, getNestedValue as z, getDifferences as ft, debounce as Ct } from "./utility.js";
import { pushFunc as dt, updateFn as et, cutFunc as ot, ValidationWrapper as xt, FormControlComponent as Pt } from "./Functions.jsx";
import _t from "superjson";
import { v4 as St } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as It } from "./store.js";
import { useCogsConfig as At } from "./CogsStateClient.jsx";
import { applyPatch as Mt } from "fast-json-patch";
import jt from "react-use-measure";
function pt(t, i) {
  const m = o.getState().getInitialOptions, S = o.getState().setInitialStateOptions, v = m(t) || {};
  S(t, {
    ...v,
    ...i
  });
}
function wt({
  stateKey: t,
  options: i,
  initialOptionsPart: m
}) {
  const S = K(t) || {}, v = m[t] || {}, k = o.getState().setInitialStateOptions, E = { ...v, ...S };
  let I = !1;
  if (i)
    for (const s in i)
      E.hasOwnProperty(s) ? (s == "localStorage" && i[s] && E[s].key !== i[s]?.key && (I = !0, E[s] = i[s]), s == "initialState" && i[s] && E[s] !== i[s] && // Different references
      !G(E[s], i[s]) && (I = !0, E[s] = i[s])) : (I = !0, E[s] = i[s]);
  I && k(t, E);
}
function re(t, { formElements: i, validation: m }) {
  return { initialState: t, formElements: i, validation: m };
}
const oe = (t, i) => {
  let m = t;
  const [S, v] = Vt(m);
  (Object.keys(v).length > 0 || i && Object.keys(i).length > 0) && Object.keys(v).forEach((I) => {
    v[I] = v[I] || {}, v[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...v[I].formElements || {}
      // State-specific overrides
    }, K(I) || o.getState().setInitialStateOptions(I, v[I]);
  }), o.getState().setInitialStates(S), o.getState().setCreatedState(S);
  const k = (I, s) => {
    const [y] = Z(s?.componentId ?? St());
    wt({
      stateKey: I,
      options: s,
      initialOptionsPart: v
    });
    const n = o.getState().cogsStateStore[I] || S[I], f = s?.modifyState ? s.modifyState(n) : n, [U, O] = Lt(
      f,
      {
        stateKey: I,
        syncUpdate: s?.syncUpdate,
        componentId: y,
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
  function E(I, s) {
    wt({ stateKey: I, options: s, initialOptionsPart: v }), s.localStorage && Dt(I, s), ct(I);
  }
  return { useCogsState: k, setCogsOptions: E };
}, {
  setUpdaterState: at,
  setState: X,
  getInitialOptions: K,
  getKeyState: $t,
  getValidationErrors: Ot,
  setStateLog: Rt,
  updateInitialStateGlobal: ht,
  addValidationError: Ut,
  removeValidationError: B,
  setServerSyncActions: Ft
} = o.getState(), Et = (t, i, m, S, v) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    S
  );
  const k = q(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (k && S) {
    const E = `${S}-${i}-${k}`;
    let I;
    try {
      I = it(E)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: v ?? I
    }, y = _t.serialize(s);
    window.localStorage.setItem(
      E,
      JSON.stringify(y.json)
    );
  }
}, it = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Dt = (t, i) => {
  const m = o.getState().cogsStateStore[t], { sessionId: S } = At(), v = q(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (v && S) {
    const k = it(
      `${S}-${t}-${v}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return X(t, k.state), ct(t), !0;
  }
  return !1;
}, bt = (t, i, m, S, v, k) => {
  const E = {
    initialState: i,
    updaterState: st(
      t,
      S,
      v,
      k
    ),
    state: m
  };
  ht(t, E.initialState), at(t, E.updaterState), X(t, E.state);
}, ct = (t) => {
  const i = o.getState().stateComponents.get(t);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((S) => {
    (S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : null)?.includes("none") || m.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((S) => S());
  });
}, ae = (t, i) => {
  const m = o.getState().stateComponents.get(t);
  if (m) {
    const S = `${t}////${i}`, v = m.components.get(S);
    if ((v ? Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"] : null)?.includes("none"))
      return;
    v && v.forceUpdate();
  }
}, Wt = (t, i, m, S) => {
  switch (t) {
    case "update":
      return {
        oldValue: z(i, S),
        newValue: z(m, S)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: z(m, S)
      };
    case "cut":
      return {
        oldValue: z(i, S),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Lt(t, {
  stateKey: i,
  serverSync: m,
  localStorage: S,
  formElements: v,
  reactiveDeps: k,
  reactiveType: E,
  componentId: I,
  initialState: s,
  syncUpdate: y,
  dependencies: n,
  serverState: f
} = {}) {
  const [U, O] = Z({}), { sessionId: R } = At();
  let L = !i;
  const [h] = Z(i ?? St()), c = o.getState().stateLog[h], rt = Y(/* @__PURE__ */ new Set()), J = Y(I ?? St()), M = Y(
    null
  );
  M.current = K(h) ?? null, Q(() => {
    if (y && y.stateKey === h && y.path?.[0]) {
      X(h, (r) => ({
        ...r,
        [y.path[0]]: y.newValue
      }));
      const e = `${y.stateKey}:${y.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: y.timeStamp,
        userId: y.userId
      });
    }
  }, [y]), Q(() => {
    if (s) {
      pt(h, {
        initialState: s
      });
      const e = M.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, l = o.getState().initialStateGlobal[h];
      if (!(l && !G(l, s) || !l) && !a)
        return;
      let g = null;
      const T = q(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      T && R && (g = it(`${R}-${h}-${T}`));
      let p = s, A = !1;
      const V = a ? Date.now() : 0, $ = g?.lastUpdated || 0, j = g?.lastSyncedWithServer || 0;
      a && V > $ ? (p = e.serverState.data, A = !0) : g && $ > j && (p = g.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), o.getState().initializeShadowState(h, s), bt(
        h,
        s,
        p,
        tt,
        J.current,
        R
      ), A && T && R && Et(p, h, e, R, Date.now()), ct(h), (Array.isArray(E) ? E : [E || "component"]).includes("none") || O({});
    }
  }, [
    s,
    f?.status,
    f?.data,
    ...n || []
  ]), mt(() => {
    L && pt(h, {
      serverSync: m,
      formElements: v,
      initialState: s,
      localStorage: S,
      middleware: M.current?.middleware
    });
    const e = `${h}////${J.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), O({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const tt = (e, r, a, l) => {
    if (Array.isArray(r)) {
      const g = `${h}-${r.join(".")}`;
      rt.current.add(g);
    }
    const u = o.getState();
    X(h, (g) => {
      const T = q(e) ? e(g) : e, p = `${h}-${r.join(".")}`;
      if (p) {
        let _ = !1, N = u.signalDomElements.get(p);
        if ((!N || N.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const b = r.slice(0, -1), C = z(T, b);
          if (Array.isArray(C)) {
            _ = !0;
            const w = `${h}-${b.join(".")}`;
            N = u.signalDomElements.get(w);
          }
        }
        if (N) {
          const b = _ ? z(T, r.slice(0, -1)) : z(T, r);
          N.forEach(({ parentId: C, position: w, effect: P }) => {
            const x = document.querySelector(
              `[data-parent-id="${C}"]`
            );
            if (x) {
              const D = Array.from(x.childNodes);
              if (D[w]) {
                const W = P ? new Function("state", `return (${P})(state)`)(b) : b;
                D[w].textContent = String(W);
              }
            }
          });
        }
      }
      console.log("shadowState", u.shadowStateStore), a.updateType === "update" && (l || M.current?.validation?.key) && r && B(
        (l || M.current?.validation?.key) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      a.updateType === "cut" && M.current?.validation?.key && B(
        M.current?.validation?.key + "." + A.join(".")
      ), a.updateType === "insert" && M.current?.validation?.key && Ot(
        M.current?.validation?.key + "." + A.join(".")
      ).filter(([N, b]) => {
        let C = N?.split(".").length;
        if (N == A.join(".") && C == A.length - 1) {
          let w = N + "." + A;
          B(N), Ut(w, b);
        }
      });
      const V = u.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", V), V) {
        const _ = ft(g, T), N = new Set(_), b = a.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          C,
          w
        ] of V.components.entries()) {
          let P = !1;
          const x = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
          if (console.log("component", w), !x.includes("none")) {
            if (x.includes("all")) {
              w.forceUpdate();
              continue;
            }
            if (x.includes("component") && ((w.paths.has(b) || w.paths.has("")) && (P = !0), !P))
              for (const D of N) {
                let W = D;
                for (; ; ) {
                  if (w.paths.has(W)) {
                    P = !0;
                    break;
                  }
                  const lt = W.lastIndexOf(".");
                  if (lt !== -1) {
                    const yt = W.substring(
                      0,
                      lt
                    );
                    if (!isNaN(
                      Number(W.substring(lt + 1))
                    ) && w.paths.has(yt)) {
                      P = !0;
                      break;
                    }
                    W = yt;
                  } else
                    W = "";
                  if (W === "")
                    break;
                }
                if (P) break;
              }
            if (!P && x.includes("deps") && w.depsFunction) {
              const D = w.depsFunction(T);
              let W = !1;
              typeof D == "boolean" ? D && (W = !0) : G(w.deps, D) || (w.deps = D, W = !0), W && (P = !0);
            }
            P && w.forceUpdate();
          }
        }
      }
      const $ = Date.now();
      r = r.map((_, N) => {
        const b = r.slice(0, -1), C = z(T, b);
        return N === r.length - 1 && ["insert", "cut"].includes(a.updateType) ? (C.length - 1).toString() : _;
      });
      const { oldValue: j, newValue: F } = Wt(
        a.updateType,
        g,
        T,
        r
      ), H = {
        timeStamp: $,
        stateKey: h,
        path: r,
        updateType: a.updateType,
        status: "new",
        oldValue: j,
        newValue: F
      };
      switch (a.updateType) {
        case "update":
          u.updateShadowAtPath(h, r, T);
          break;
        case "insert":
          const _ = r.slice(0, -1);
          u.insertShadowArrayElement(h, _, F);
          break;
        case "cut":
          const N = r.slice(0, -1), b = parseInt(r[r.length - 1]);
          u.removeShadowArrayElement(h, N, b);
          break;
      }
      if (Rt(h, (_) => {
        const b = [..._ ?? [], H].reduce((C, w) => {
          const P = `${w.stateKey}:${JSON.stringify(w.path)}`, x = C.get(P);
          return x ? (x.timeStamp = Math.max(x.timeStamp, w.timeStamp), x.newValue = w.newValue, x.oldValue = x.oldValue ?? w.oldValue, x.updateType = w.updateType) : C.set(P, { ...w }), C;
        }, /* @__PURE__ */ new Map());
        return Array.from(b.values());
      }), Et(
        T,
        h,
        M.current,
        R
      ), M.current?.middleware && M.current.middleware({
        updateLog: c,
        update: H
      }), M.current?.serverSync) {
        const _ = u.serverState[h], N = M.current?.serverSync;
        Ft(h, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: T }),
          rollBackState: _,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  o.getState().updaterState[h] || (at(
    h,
    st(
      h,
      tt,
      J.current,
      R
    )
  ), o.getState().cogsStateStore[h] || X(h, t), o.getState().initialStateGlobal[h] || ht(h, t));
  const d = gt(() => st(
    h,
    tt,
    J.current,
    R
  ), [h, R]);
  return [$t(h), d];
}
function st(t, i, m, S) {
  const v = /* @__PURE__ */ new Map();
  let k = 0;
  const E = (y) => {
    const n = y.join(".");
    for (const [f] of v)
      (f === n || f.startsWith(n + ".")) && v.delete(f);
    k++;
  }, I = {
    removeValidation: (y) => {
      y?.validationKey && B(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && B(n?.key), y?.validationKey && B(y.validationKey);
      const f = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), v.clear(), k++;
      const U = s(f, []), O = K(t), R = q(O?.localStorage?.key) ? O?.localStorage?.key(f) : O?.localStorage?.key, L = `${S}-${t}-${R}`;
      L && localStorage.removeItem(L), at(t, U), X(t, f);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((c) => {
        c.forceUpdate();
      }), f;
    },
    updateInitialState: (y) => {
      v.clear(), k++;
      const n = st(
        t,
        i,
        m,
        S
      ), f = o.getState().initialStateGlobal[t], U = K(t), O = q(U?.localStorage?.key) ? U?.localStorage?.key(f) : U?.localStorage?.key, R = `${S}-${t}-${O}`;
      return localStorage.getItem(R) && localStorage.removeItem(R), Nt(() => {
        ht(t, y), o.getState().initializeShadowState(t, y), at(t, n), X(t, y);
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
      const y = o.getState().serverState[t];
      return !!(y && G(y, $t(t)));
    }
  };
  function s(y, n = [], f) {
    const U = n.map(String).join(".");
    v.get(U);
    const O = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(I).forEach((h) => {
      O[h] = I[h];
    });
    const R = {
      apply(h, c, rt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(h, c) {
        f?.validIndices && !Array.isArray(y) && (f = { ...f, validIndices: void 0 });
        const rt = /* @__PURE__ */ new Set([
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
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender" && !rt.has(c)) {
          const d = `${t}////${m}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const r = e.components.get(d);
            if (r && !r.paths.has("")) {
              const a = n.join(".");
              let l = !0;
              for (const u of r.paths)
                if (a.startsWith(u) && (a === u || a[u.length] === ".")) {
                  l = !1;
                  break;
                }
              l && r.paths.add(a);
            }
          }
        }
        if (c === "getDifferences")
          return () => ft(
            o.getState().cogsStateStore[t],
            o.getState().initialStateGlobal[t]
          );
        if (c === "sync" && n.length === 0)
          return async function() {
            const d = o.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const r = o.getState().getNestedState(t, []), a = d?.validation?.key;
            try {
              const l = await e.action(r);
              if (l && !l.success && l.errors && a) {
                o.getState().removeValidationError(a), l.errors.forEach((g) => {
                  const T = [a, ...g.path].join(".");
                  o.getState().addValidationError(T, g.message);
                });
                const u = o.getState().stateComponents.get(t);
                u && u.components.forEach((g) => {
                  g.forceUpdate();
                });
              }
              return l?.success && e.onSuccess ? e.onSuccess(l.data) : !l?.success && e.onError && e.onError(l.error), l;
            } catch (l) {
              return e.onError && e.onError(l), { success: !1, error: l };
            }
          };
        if (c === "_status") {
          const d = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = z(e, n);
          return G(d, r) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = z(e, n);
            return G(d, r) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = K(t), r = q(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${S}-${t}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (c === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(y)) {
          const d = () => f?.validIndices ? y.map((r, a) => ({
            item: r,
            originalIndex: f.validIndices[a]
          })) : o.getState().getNestedState(t, n).map((r, a) => ({
            item: r,
            originalIndex: a
          }));
          if (c === "getSelected")
            return () => {
              const e = o.getState().getSelectedIndex(t, n.join("."));
              if (e !== void 0)
                return s(
                  y[e],
                  [...n, e.toString()],
                  f
                );
            };
          if (c === "clearSelected")
            return () => {
              o.getState().clearSelectedIndex({ stateKey: t, path: n });
            };
          if (c === "getSelectedIndex")
            return () => o.getState().getSelectedIndex(t, n.join(".")) ?? -1;
          if (c === "useVirtualView")
            return (e) => {
              const {
                itemHeight: r = 50,
                overscan: a = 5,
                stickToBottom: l = !1
              } = e, u = Y(null), [g, T] = Z({
                startIndex: 0,
                endIndex: 10
              }), [p, A] = Z(0);
              Q(() => o.getState().subscribeToShadowState(t, () => {
                A((C) => C + 1);
              }), [t]);
              const V = o().getNestedState(
                t,
                n
              ), $ = V.length, j = gt(() => {
                const b = o.getState().getShadowMetadata(t, n) || [];
                let C = 0;
                for (let w = 0; w < $; w++) {
                  const P = b[w]?.virtualizer?.itemHeight;
                  C += P || r;
                }
                return C;
              }, [
                $,
                t,
                n.join("."),
                r,
                p
              ]), F = gt(() => {
                const b = Math.max(0, g.startIndex), C = Math.min($, g.endIndex), w = Array.from(
                  { length: C - b },
                  (x, D) => b + D
                ), P = w.map((x) => V[x]);
                return s(P, n, {
                  ...f,
                  validIndices: w
                });
              }, [g.startIndex, g.endIndex, V, $]);
              Q(() => {
                const b = u.current;
                if (!b) return;
                const C = () => {
                  const { scrollTop: w, clientHeight: P } = b, x = Math.floor(w / r), D = Math.ceil(P / r);
                  T({
                    startIndex: Math.max(0, x - a),
                    endIndex: Math.min(
                      $,
                      x + D + a
                    )
                  });
                };
                return b.addEventListener("scroll", C), C(), () => b.removeEventListener("scroll", C);
              }, [$, r, a]);
              const H = vt(() => {
                u.current && (u.current.scrollTop = u.current.scrollHeight);
              }, []), _ = vt(
                (b) => {
                  u.current && (u.current.scrollTop = b * r);
                },
                [r]
              ), N = {
                outer: {
                  ref: u,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${j}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    position: "absolute",
                    top: `${g.startIndex * r}px`,
                    left: 0,
                    right: 0
                  }
                }
              };
              return {
                virtualState: F,
                virtualizerProps: N,
                scrollToBottom: H,
                scrollToIndex: _
              };
            };
          if (c === "stateSort")
            return (e) => {
              const a = [...d()].sort(
                (g, T) => e(g.item, T.item)
              ), l = a.map(({ item: g }) => g), u = {
                ...f,
                validIndices: a.map(
                  ({ originalIndex: g }) => g
                )
              };
              return s(l, n, u);
            };
          if (c === "stateFilter")
            return (e) => {
              const a = d().filter(
                ({ item: g }, T) => e(g, T)
              ), l = a.map(({ item: g }) => g), u = {
                ...f,
                validIndices: a.map(
                  ({ originalIndex: g }) => g
                )
              };
              return s(l, n, u);
            };
          if (c === "stateMap")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (f?.validIndices || Array.from({ length: r.length }, (l, u) => u)).map((l, u) => {
                const g = r[l], T = [...n, l.toString()], p = s(g, T, f);
                return e(g, p, {
                  register: () => {
                    const [, V] = Z({}), $ = `${m}-${n.join(".")}-${l}`;
                    mt(() => {
                      const j = `${t}////${$}`, F = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return F.components.set(j, {
                        forceUpdate: () => V({}),
                        paths: /* @__PURE__ */ new Set([T.join(".")])
                      }), o.getState().stateComponents.set(t, F), () => {
                        const H = o.getState().stateComponents.get(t);
                        H && H.components.delete(j);
                      };
                    }, [t, $]);
                  },
                  index: u,
                  originalIndex: l
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                r
              ), null);
            };
          if (c === "stateMapNoRender")
            return (e) => y.map((a, l) => {
              let u;
              f?.validIndices && f.validIndices[l] !== void 0 ? u = f.validIndices[l] : u = l;
              const g = [...n, u.toString()], T = s(a, g, f);
              return e(
                a,
                T,
                l,
                y,
                s(y, n, f)
              );
            });
          if (c === "$stateMap")
            return (e) => nt(Gt, {
              proxy: {
                _stateKey: t,
                _path: n,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (c === "stateList")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              if (!Array.isArray(r))
                return console.warn(
                  `stateList called on a non-array value at path: ${n.join(".")}.`
                ), null;
              const a = r.length;
              return (f?.validIndices || Array.from({ length: a }, (u, g) => g)).map((u, g) => {
                const T = r[u], p = [...n, u.toString()], A = s(T, p, f), V = `${m}-${n.join(".")}-${u}`, $ = u === a - 1;
                return nt(Ht, {
                  key: u,
                  stateKey: t,
                  itemComponentId: V,
                  itemPath: p,
                  isLastItem: $,
                  // Pass it here!
                  children: e(
                    T,
                    A,
                    g,
                    r,
                    s(r, n, f)
                  )
                });
              });
            };
          if (c === "stateFlattenOn")
            return (e) => {
              const r = y;
              v.clear(), k++;
              const a = r.flatMap(
                (l) => l[e] ?? []
              );
              return s(
                a,
                [...n, "[*]", e],
                f
              );
            };
          if (c === "index")
            return (e) => {
              const r = y[e];
              return s(r, [...n, e.toString()]);
            };
          if (c === "last")
            return () => {
              const e = o.getState().getNestedState(t, n);
              if (e.length === 0) return;
              const r = e.length - 1, a = e[r], l = [...n, r.toString()];
              return s(a, l);
            };
          if (c === "insert")
            return (e) => (E(n), dt(i, e, n, t), s(
              o.getState().getNestedState(t, n),
              n
            ));
          if (c === "uniqueInsert")
            return (e, r, a) => {
              const l = o.getState().getNestedState(t, n), u = q(e) ? e(l) : e;
              let g = null;
              if (!l.some((p) => {
                if (r) {
                  const V = r.every(
                    ($) => G(p[$], u[$])
                  );
                  return V && (g = p), V;
                }
                const A = G(p, u);
                return A && (g = p), A;
              }))
                E(n), dt(i, u, n, t);
              else if (a && g) {
                const p = a(g), A = l.map(
                  (V) => G(V, g) ? p : V
                );
                E(n), et(i, A, n);
              }
            };
          if (c === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return E(n), ot(i, n, t, e), s(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (c === "cutByValue")
            return (e) => {
              for (let r = 0; r < y.length; r++)
                y[r] === e && ot(i, n, t, r);
            };
          if (c === "toggleByValue")
            return (e) => {
              const r = y.findIndex((a) => a === e);
              r > -1 ? ot(i, n, t, r) : dt(i, e, n, t);
            };
          if (c === "stateFind")
            return (e) => {
              const a = d().find(
                ({ item: u }, g) => e(u, g)
              );
              if (!a) return;
              const l = [...n, a.originalIndex.toString()];
              return s(a.item, l, f);
            };
          if (c === "findWith")
            return (e, r) => {
              const l = d().find(
                ({ item: g }) => g[e] === r
              );
              if (!l) return;
              const u = [...n, l.originalIndex.toString()];
              return s(l.item, u, f);
            };
        }
        const J = n[n.length - 1];
        if (!isNaN(Number(J))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && c === "cut")
            return () => ot(
              i,
              d,
              t,
              Number(J)
            );
        }
        if (c === "get")
          return () => {
            if (f?.validIndices && Array.isArray(y)) {
              const d = o.getState().getNestedState(t, n);
              return f.validIndices.map((e) => d[e]);
            }
            return o.getState().getNestedState(t, n);
          };
        if (c === "$derive")
          return (d) => Tt({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (c === "$get")
          return () => Tt({
            _stateKey: t,
            _path: n
          });
        if (c === "lastSynced") {
          const d = `${t}:${n.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (c == "getLocalStorage")
          return (d) => it(S + "-" + t + "-" + d);
        if (c === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (c === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), a = e.join(".");
            d ? o.getState().setSelectedIndex(t, a, r) : o.getState().setSelectedIndex(t, a, void 0);
            const l = o.getState().getNestedState(t, [...e]);
            et(i, l, e), E(e);
          };
        if (c === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), e = Number(n[n.length - 1]), r = d.join("."), a = o.getState().getSelectedIndex(t, r);
            o.getState().setSelectedIndex(
              t,
              r,
              a === e ? void 0 : e
            );
            const l = o.getState().getNestedState(t, [...d]);
            et(i, l, d), E(d);
          };
        if (n.length == 0) {
          if (c === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], a = Mt(e, d).newDocument;
              bt(
                t,
                o.getState().initialStateGlobal[t],
                a,
                i,
                m,
                S
              );
              const l = o.getState().stateComponents.get(t);
              if (l) {
                const u = ft(e, a), g = new Set(u);
                for (const [
                  T,
                  p
                ] of l.components.entries()) {
                  let A = !1;
                  const V = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!V.includes("none")) {
                    if (V.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (V.includes("component") && (p.paths.has("") && (A = !0), !A))
                      for (const $ of g) {
                        if (p.paths.has($)) {
                          A = !0;
                          break;
                        }
                        let j = $.lastIndexOf(".");
                        for (; j !== -1; ) {
                          const F = $.substring(0, j);
                          if (p.paths.has(F)) {
                            A = !0;
                            break;
                          }
                          const H = $.substring(
                            j + 1
                          );
                          if (!isNaN(Number(H))) {
                            const _ = F.lastIndexOf(".");
                            if (_ !== -1) {
                              const N = F.substring(
                                0,
                                _
                              );
                              if (p.paths.has(N)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          j = F.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && V.includes("deps") && p.depsFunction) {
                      const $ = p.depsFunction(a);
                      let j = !1;
                      typeof $ == "boolean" ? $ && (j = !0) : G(p.deps, $) || (p.deps = $, j = !0), j && (A = !0);
                    }
                    A && p.forceUpdate();
                  }
                }
              }
            };
          if (c === "validateZodSchema")
            return () => {
              const d = o.getState().getInitialOptions(t)?.validation, e = o.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              B(d.key);
              const r = o.getState().cogsStateStore[t];
              try {
                const a = o.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([u]) => {
                  u && u.startsWith(d.key) && B(u);
                });
                const l = d.zodSchema.safeParse(r);
                return l.success ? !0 : (l.error.errors.forEach((g) => {
                  const T = g.path, p = g.message, A = [d.key, ...T].join(".");
                  e(A, p);
                }), ct(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (c === "_componentId") return m;
          if (c === "getComponents")
            return () => o().stateComponents.get(t);
          if (c === "getAllFormRefs")
            return () => It.getState().getFormRefsByStateKey(t);
          if (c === "_initialState")
            return o.getState().initialStateGlobal[t];
          if (c === "_serverState")
            return o.getState().serverState[t];
          if (c === "_isLoading")
            return o.getState().isLoadingGlobal[t];
          if (c === "revertToInitialState")
            return I.revertToInitialState;
          if (c === "updateInitialState") return I.updateInitialState;
          if (c === "removeValidation") return I.removeValidation;
        }
        if (c === "getFormRef")
          return () => It.getState().getFormRef(t + "." + n.join("."));
        if (c === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ ut(
            xt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: f?.validIndices,
              children: d
            }
          );
        if (c === "_stateKey") return t;
        if (c === "_path") return n;
        if (c === "_isServerSynced") return I._isServerSynced;
        if (c === "update")
          return (d, e) => {
            if (e?.debounce)
              Ct(() => {
                et(i, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              et(i, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            E(n);
          };
        if (c === "formElement")
          return (d, e) => /* @__PURE__ */ ut(
            Pt,
            {
              setState: i,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const M = [...n, c], tt = o.getState().getNestedState(t, M);
        return s(tt, M, f);
      }
    }, L = new Proxy(O, R);
    return v.set(U, {
      proxy: L,
      stateVersion: k
    }), L;
  }
  return s(
    o.getState().getNestedState(t, [])
  );
}
function Tt(t) {
  return nt(zt, { proxy: t });
}
function Gt({
  proxy: t,
  rebuildStateShape: i
}) {
  const m = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? i(
    m,
    t._path
  ).stateMapNoRender(
    (v, k, E, I, s) => t._mapFn(v, k, E, I, s)
  ) : null;
}
function zt({
  proxy: t
}) {
  const i = Y(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return Q(() => {
    const S = i.current;
    if (!S || !S.parentElement) return;
    const v = S.parentElement, E = Array.from(v.childNodes).indexOf(S);
    let I = v.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, v.setAttribute("data-parent-id", I));
    const y = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: E,
      effect: t._effect
    };
    o.getState().addSignalElement(m, y);
    const n = o.getState().getNestedState(t._stateKey, t._path);
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
    const U = document.createTextNode(String(f));
    S.replaceWith(U);
  }, [t._stateKey, t._path.join("."), t._effect]), nt("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function se(t) {
  const i = kt(
    (m) => {
      const S = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return S.components.set(t._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => S.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return nt("text", {}, String(i));
}
function Ht({
  stateKey: t,
  itemComponentId: i,
  itemPath: m,
  isLastItem: S,
  children: v
}) {
  const [, k] = Z({}), [E, I] = jt(), s = Y(null), y = Y(null);
  return Q(() => {
    I.height > 0 && I.height !== y.current && (y.current = I.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: I.height
      }
    }));
  }, [I.height, t, m]), mt(() => {
    const n = `${t}////${i}`, f = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return f.components.set(n, {
      forceUpdate: () => k({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), o.getState().stateComponents.set(t, f), () => {
      const U = o.getState().stateComponents.get(t);
      U && U.components.delete(n);
    };
  }, [t, i, m.join(".")]), Q(() => {
    S && s.current && setTimeout(() => {
      s.current?.scrollIntoView({
        behavior: "smooth",
        block: "end"
      });
    }, 50);
  }, [S]), /* @__PURE__ */ ut(
    "div",
    {
      ref: (n) => {
        E(n), s.current = n;
      },
      children: v
    }
  );
}
export {
  Tt as $cogsSignal,
  se as $cogsSignalStore,
  re as addStateOptions,
  oe as createCogsState,
  ae as notifyComponent,
  Lt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
