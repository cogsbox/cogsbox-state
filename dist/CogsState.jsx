"use client";
import { jsx as ft } from "react/jsx-runtime";
import { useState as Y, useRef as Z, useEffect as tt, useLayoutEffect as it, useMemo as St, createElement as ot, useSyncExternalStore as Ct, startTransition as bt, useCallback as yt } from "react";
import { transformStateFunc as Nt, isDeepEqual as H, isFunction as q, getNestedValue as B, getDifferences as mt, debounce as Vt } from "./utility.js";
import { pushFunc as gt, updateFn as rt, cutFunc as st, ValidationWrapper as Pt, FormControlComponent as xt } from "./Functions.jsx";
import _t from "superjson";
import { v4 as ht } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as It } from "./store.js";
import { useCogsConfig as Et } from "./CogsStateClient.jsx";
import { applyPatch as Ot } from "fast-json-patch";
import Mt from "react-use-measure";
function pt(t, i) {
  const h = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, I = h(t) || {};
  f(t, {
    ...I,
    ...i
  });
}
function wt({
  stateKey: t,
  options: i,
  initialOptionsPart: h
}) {
  const f = K(t) || {}, I = h[t] || {}, k = r.getState().setInitialStateOptions, w = { ...I, ...f };
  let p = !1;
  if (i)
    for (const a in i)
      w.hasOwnProperty(a) ? (a == "localStorage" && i[a] && w[a].key !== i[a]?.key && (p = !0, w[a] = i[a]), a == "initialState" && i[a] && w[a] !== i[a] && // Different references
      !H(w[a], i[a]) && (p = !0, w[a] = i[a])) : (p = !0, w[a] = i[a]);
  p && k(t, w);
}
function re(t, { formElements: i, validation: h }) {
  return { initialState: t, formElements: i, validation: h };
}
const oe = (t, i) => {
  let h = t;
  const [f, I] = Nt(h);
  (Object.keys(I).length > 0 || i && Object.keys(i).length > 0) && Object.keys(I).forEach((p) => {
    I[p] = I[p] || {}, I[p].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...I[p].formElements || {}
      // State-specific overrides
    }, K(p) || r.getState().setInitialStateOptions(p, I[p]);
  }), r.getState().setInitialStates(f), r.getState().setCreatedState(f);
  const k = (p, a) => {
    const [y] = Y(a?.componentId ?? ht());
    wt({
      stateKey: p,
      options: a,
      initialOptionsPart: I
    });
    const n = r.getState().cogsStateStore[p] || f[p], S = a?.modifyState ? a.modifyState(n) : n, [F, U] = Gt(
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
    return U;
  };
  function w(p, a) {
    wt({ stateKey: p, options: a, initialOptionsPart: I }), a.localStorage && Dt(p, a), ut(p);
  }
  return { useCogsState: k, setCogsOptions: w };
}, {
  setUpdaterState: ct,
  setState: X,
  getInitialOptions: K,
  getKeyState: $t,
  getValidationErrors: Rt,
  setStateLog: Ut,
  updateInitialStateGlobal: vt,
  addValidationError: jt,
  removeValidationError: z,
  setServerSyncActions: Lt
} = r.getState(), At = (t, i, h, f, I) => {
  h?.log && console.log(
    "saving to localstorage",
    i,
    h.localStorage?.key,
    f
  );
  const k = q(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if (k && f) {
    const w = `${f}-${i}-${k}`;
    let p;
    try {
      p = dt(w)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: I ?? p
    }, y = _t.serialize(a);
    window.localStorage.setItem(
      w,
      JSON.stringify(y.json)
    );
  }
}, dt = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Dt = (t, i) => {
  const h = r.getState().cogsStateStore[t], { sessionId: f } = Et(), I = q(i?.localStorage?.key) ? i.localStorage.key(h) : i?.localStorage?.key;
  if (I && f) {
    const k = dt(
      `${f}-${t}-${I}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return X(t, k.state), ut(t), !0;
  }
  return !1;
}, kt = (t, i, h, f, I, k) => {
  const w = {
    initialState: i,
    updaterState: lt(
      t,
      f,
      I,
      k
    ),
    state: h
  };
  vt(t, w.initialState), ct(t, w.updaterState), X(t, w.state);
}, ut = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const h = /* @__PURE__ */ new Set();
  i.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || h.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((f) => f());
  });
}, ae = (t, i) => {
  const h = r.getState().stateComponents.get(t);
  if (h) {
    const f = `${t}////${i}`, I = h.components.get(f);
    if ((I ? Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"] : null)?.includes("none"))
      return;
    I && I.forceUpdate();
  }
}, Ft = (t, i, h, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: B(i, f),
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
        oldValue: B(i, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Gt(t, {
  stateKey: i,
  serverSync: h,
  localStorage: f,
  formElements: I,
  reactiveDeps: k,
  reactiveType: w,
  componentId: p,
  initialState: a,
  syncUpdate: y,
  dependencies: n,
  serverState: S
} = {}) {
  const [F, U] = Y({}), { sessionId: j } = Et();
  let G = !i;
  const [v] = Y(i ?? ht()), l = r.getState().stateLog[v], at = Z(/* @__PURE__ */ new Set()), J = Z(p ?? ht()), M = Z(
    null
  );
  M.current = K(v) ?? null, tt(() => {
    if (y && y.stateKey === v && y.path?.[0]) {
      X(v, (o) => ({
        ...o,
        [y.path[0]]: y.newValue
      }));
      const e = `${y.stateKey}:${y.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: y.timeStamp,
        userId: y.userId
      });
    }
  }, [y]), tt(() => {
    if (a) {
      pt(v, {
        initialState: a
      });
      const e = M.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = r.getState().initialStateGlobal[v];
      if (!(c && !H(c, a) || !c) && !s)
        return;
      let u = null;
      const T = q(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      T && j && (u = dt(`${j}-${v}-${T}`));
      let A = a, E = !1;
      const P = s ? Date.now() : 0, V = u?.lastUpdated || 0, N = u?.lastSyncedWithServer || 0;
      s && P > V ? (A = e.serverState.data, E = !0) : u && V > N && (A = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(A)), r.getState().initializeShadowState(v, a), kt(
        v,
        a,
        A,
        et,
        J.current,
        j
      ), E && T && j && At(A, v, e, j, Date.now()), ut(v), (Array.isArray(w) ? w : [w || "component"]).includes("none") || U({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), it(() => {
    G && pt(v, {
      serverSync: h,
      formElements: I,
      initialState: a,
      localStorage: f,
      middleware: M.current?.middleware
    });
    const e = `${v}////${J.current}`, o = r.getState().stateComponents.get(v) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(e, {
      forceUpdate: () => U({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), r.getState().stateComponents.set(v, o), U({}), () => {
      o && (o.components.delete(e), o.components.size === 0 && r.getState().stateComponents.delete(v));
    };
  }, []);
  const et = (e, o, s, c) => {
    if (Array.isArray(o)) {
      const u = `${v}-${o.join(".")}`;
      at.current.add(u);
    }
    const g = r.getState();
    X(v, (u) => {
      const T = q(e) ? e(u) : e, A = `${v}-${o.join(".")}`;
      if (A) {
        let O = !1, C = g.signalDomElements.get(A);
        if ((!C || C.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const R = o.slice(0, -1), L = B(T, R);
          if (Array.isArray(L)) {
            O = !0;
            const m = `${v}-${R.join(".")}`;
            C = g.signalDomElements.get(m);
          }
        }
        if (C) {
          const R = O ? B(T, o.slice(0, -1)) : B(T, o);
          C.forEach(({ parentId: L, position: m, effect: $ }) => {
            const b = document.querySelector(
              `[data-parent-id="${L}"]`
            );
            if (b) {
              const x = Array.from(b.childNodes);
              if (x[m]) {
                const _ = $ ? new Function("state", `return (${$})(state)`)(R) : R;
                x[m].textContent = String(_);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (c || M.current?.validation?.key) && o && z(
        (c || M.current?.validation?.key) + "." + o.join(".")
      );
      const E = o.slice(0, o.length - 1);
      s.updateType === "cut" && M.current?.validation?.key && z(
        M.current?.validation?.key + "." + E.join(".")
      ), s.updateType === "insert" && M.current?.validation?.key && Rt(
        M.current?.validation?.key + "." + E.join(".")
      ).filter(([C, R]) => {
        let L = C?.split(".").length;
        if (C == E.join(".") && L == E.length - 1) {
          let m = C + "." + E;
          z(C), jt(m, R);
        }
      });
      const P = g.stateComponents.get(v);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", P), P) {
        const O = mt(u, T), C = new Set(O), R = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          L,
          m
        ] of P.components.entries()) {
          let $ = !1;
          const b = Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"];
          if (console.log("component", m), !b.includes("none")) {
            if (b.includes("all")) {
              m.forceUpdate();
              continue;
            }
            if (b.includes("component") && ((m.paths.has(R) || m.paths.has("")) && ($ = !0), !$))
              for (const x of C) {
                let _ = x;
                for (; ; ) {
                  if (m.paths.has(_)) {
                    $ = !0;
                    break;
                  }
                  const Q = _.lastIndexOf(".");
                  if (Q !== -1) {
                    const nt = _.substring(
                      0,
                      Q
                    );
                    if (!isNaN(
                      Number(_.substring(Q + 1))
                    ) && m.paths.has(nt)) {
                      $ = !0;
                      break;
                    }
                    _ = nt;
                  } else
                    _ = "";
                  if (_ === "")
                    break;
                }
                if ($) break;
              }
            if (!$ && b.includes("deps") && m.depsFunction) {
              const x = m.depsFunction(T);
              let _ = !1;
              typeof x == "boolean" ? x && (_ = !0) : H(m.deps, x) || (m.deps = x, _ = !0), _ && ($ = !0);
            }
            $ && m.forceUpdate();
          }
        }
      }
      const V = Date.now();
      o = o.map((O, C) => {
        const R = o.slice(0, -1), L = B(T, R);
        return C === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (L.length - 1).toString() : O;
      });
      const { oldValue: N, newValue: D } = Ft(
        s.updateType,
        u,
        T,
        o
      ), W = {
        timeStamp: V,
        stateKey: v,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: N,
        newValue: D
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(v, o, T);
          break;
        case "insert":
          const O = o.slice(0, -1);
          g.insertShadowArrayElement(v, O, D);
          break;
        case "cut":
          const C = o.slice(0, -1), R = parseInt(o[o.length - 1]);
          g.removeShadowArrayElement(v, C, R);
          break;
      }
      if (Ut(v, (O) => {
        const R = [...O ?? [], W].reduce((L, m) => {
          const $ = `${m.stateKey}:${JSON.stringify(m.path)}`, b = L.get($);
          return b ? (b.timeStamp = Math.max(b.timeStamp, m.timeStamp), b.newValue = m.newValue, b.oldValue = b.oldValue ?? m.oldValue, b.updateType = m.updateType) : L.set($, { ...m }), L;
        }, /* @__PURE__ */ new Map());
        return Array.from(R.values());
      }), At(
        T,
        v,
        M.current,
        j
      ), M.current?.middleware && M.current.middleware({
        updateLog: l,
        update: W
      }), M.current?.serverSync) {
        const O = g.serverState[v], C = M.current?.serverSync;
        Lt(v, {
          syncKey: typeof C.syncKey == "string" ? C.syncKey : C.syncKey({ state: T }),
          rollBackState: O,
          actionTimeStamp: Date.now() + (C.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  r.getState().updaterState[v] || (ct(
    v,
    lt(
      v,
      et,
      J.current,
      j
    )
  ), r.getState().cogsStateStore[v] || X(v, t), r.getState().initialStateGlobal[v] || vt(v, t));
  const d = St(() => lt(
    v,
    et,
    J.current,
    j
  ), [v, j]);
  return [$t(v), d];
}
function lt(t, i, h, f) {
  const I = /* @__PURE__ */ new Map();
  let k = 0;
  const w = (y) => {
    const n = y.join(".");
    for (const [S] of I)
      (S === n || S.startsWith(n + ".")) && I.delete(S);
    k++;
  }, p = {
    removeValidation: (y) => {
      y?.validationKey && z(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = r.getState().getInitialOptions(t)?.validation;
      n?.key && z(n?.key), y?.validationKey && z(y.validationKey);
      const S = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), I.clear(), k++;
      const F = a(S, []), U = K(t), j = q(U?.localStorage?.key) ? U?.localStorage?.key(S) : U?.localStorage?.key, G = `${f}-${t}-${j}`;
      G && localStorage.removeItem(G), ct(t, F), X(t, S);
      const v = r.getState().stateComponents.get(t);
      return v && v.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (y) => {
      I.clear(), k++;
      const n = lt(
        t,
        i,
        h,
        f
      ), S = r.getState().initialStateGlobal[t], F = K(t), U = q(F?.localStorage?.key) ? F?.localStorage?.key(S) : F?.localStorage?.key, j = `${f}-${t}-${U}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), bt(() => {
        vt(t, y), r.getState().initializeShadowState(t, y), ct(t, n), X(t, y);
        const G = r.getState().stateComponents.get(t);
        G && G.components.forEach((v) => {
          v.forceUpdate();
        });
      }), {
        fetchId: (G) => n.get()[G]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const y = r.getState().serverState[t];
      return !!(y && H(y, $t(t)));
    }
  };
  function a(y, n = [], S) {
    const F = n.map(String).join(".");
    I.get(F);
    const U = function() {
      return r().getNestedState(t, n);
    };
    Object.keys(p).forEach((v) => {
      U[v] = p[v];
    });
    const j = {
      apply(v, l, at) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, n);
      },
      get(v, l) {
        S?.validIndices && !Array.isArray(y) && (S = { ...S, validIndices: void 0 });
        const at = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !at.has(l)) {
          const d = `${t}////${h}`, e = r.getState().stateComponents.get(t);
          if (e) {
            const o = e.components.get(d);
            if (o && !o.paths.has("")) {
              const s = n.join(".");
              let c = !0;
              for (const g of o.paths)
                if (s.startsWith(g) && (s === g || s[g.length] === ".")) {
                  c = !1;
                  break;
                }
              c && o.paths.add(s);
            }
          }
        }
        if (l === "getDifferences")
          return () => mt(
            r.getState().cogsStateStore[t],
            r.getState().initialStateGlobal[t]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const d = r.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const o = r.getState().getNestedState(t, []), s = d?.validation?.key;
            try {
              const c = await e.action(o);
              if (c && !c.success && c.errors && s) {
                r.getState().removeValidationError(s), c.errors.forEach((u) => {
                  const T = [s, ...u.path].join(".");
                  r.getState().addValidationError(T, u.message);
                });
                const g = r.getState().stateComponents.get(t);
                g && g.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return c?.success && e.onSuccess ? e.onSuccess(c.data) : !c?.success && e.onError && e.onError(c.error), c;
            } catch (c) {
              return e.onError && e.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = r.getState().getNestedState(t, n), e = r.getState().initialStateGlobal[t], o = B(e, n);
          return H(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              t,
              n
            ), e = r.getState().initialStateGlobal[t], o = B(e, n);
            return H(d, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[t], e = K(t), o = q(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${o}`;
            s && localStorage.removeItem(s);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = r.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(y)) {
          const d = () => S?.validIndices ? y.map((o, s) => ({
            item: o,
            originalIndex: S.validIndices[s]
          })) : r.getState().getNestedState(t, n).map((o, s) => ({
            item: o,
            originalIndex: s
          }));
          if (l === "getSelected")
            return () => {
              const e = r.getState().getSelectedIndex(t, n.join("."));
              if (e !== void 0)
                return a(
                  y[e],
                  [...n, e.toString()],
                  S
                );
            };
          if (l === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: t, path: n });
            };
          if (l === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(t, n.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (e) => {
              const {
                itemHeight: o = 50,
                overscan: s = 6,
                stickToBottom: c = !1
              } = e, g = Z(null), [u, T] = Y({
                startIndex: 0,
                endIndex: 10
              }), A = Z(c), [E, P] = Y(0);
              tt(() => r.getState().subscribeToShadowState(t, () => {
                P(($) => $ + 1);
              }), [t]);
              const V = r().getNestedState(
                t,
                n
              ), N = V.length, { totalHeight: D, positions: W } = St(() => {
                const m = r.getState().getShadowMetadata(t, n) || [];
                let $ = 0;
                const b = [];
                for (let x = 0; x < N; x++) {
                  b[x] = $;
                  const _ = m[x]?.virtualizer?.itemHeight;
                  $ += _ || o;
                }
                return { totalHeight: $, positions: b };
              }, [
                N,
                t,
                n.join("."),
                o,
                E
              ]), O = St(() => {
                const m = Math.max(0, u.startIndex), $ = Math.min(N, u.endIndex), b = Array.from(
                  { length: $ - m },
                  (_, Q) => m + Q
                ), x = b.map((_) => V[_]);
                return a(x, n, {
                  ...S,
                  validIndices: b
                });
              }, [u.startIndex, u.endIndex, V, N]);
              it(() => {
                const m = g.current;
                if (!m || !A.current || N === 0)
                  return;
                console.log("ALGORITHM: Starting..."), T({
                  startIndex: Math.max(0, N - 10 - s),
                  endIndex: N
                }), console.log(
                  "ALGORITHM: Starting LOOP to wait for measurement."
                );
                let b = 0;
                const x = setInterval(() => {
                  b++, console.log(`LOOP ${b}: Checking last item...`);
                  const _ = N - 1, nt = (r.getState().getShadowMetadata(t, n) || [])[_]?.virtualizer?.itemHeight || 0;
                  nt > 0 ? (console.log(
                    `%cSUCCESS: Last item height is ${nt}. Scrolling now.`,
                    "color: green; font-weight: bold;"
                  ), clearInterval(x), m.scrollTo({
                    top: m.scrollHeight,
                    behavior: "smooth"
                  })) : (console.log("...WAITING. Height is not ready."), b > 20 && (console.error(
                    "LOOP TIMEOUT: Last item was never measured. Stopping loop."
                  ), clearInterval(x)));
                }, 100);
                return () => {
                  console.log("ALGORITHM: Cleaning up loop."), clearInterval(x);
                };
              }, [N]), tt(() => {
                const m = g.current;
                if (!m) return;
                const $ = () => {
                  m.scrollHeight - m.scrollTop - m.clientHeight < 1 || (A.current = !1, console.log("USER ACTION: Scroll lock DISABLED."));
                };
                return m.addEventListener("scroll", $, {
                  passive: !0
                }), () => m.removeEventListener("scroll", $);
              }, []);
              const C = yt(
                (m = "smooth") => {
                  g.current && (A.current = !0, console.log("USER ACTION: Scroll lock ENABLED."), g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: m
                  }));
                },
                []
              ), R = yt(
                (m, $ = "smooth") => {
                  g.current && W[m] !== void 0 && (A.current = !1, console.log("USER ACTION: Scroll lock DISABLED."), g.current.scrollTo({
                    top: W[m],
                    behavior: $
                  }));
                },
                [W]
              ), L = {
                outer: {
                  ref: g,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${D}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${W[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: O,
                virtualizerProps: L,
                scrollToBottom: C,
                scrollToIndex: R
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, T) => e(u.item, T.item)
              ), c = s.map(({ item: u }) => u), g = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(c, n, g);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = d().filter(
                ({ item: u }, T) => e(u, T)
              ), c = s.map(({ item: u }) => u), g = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(c, n, g);
            };
          if (l === "stateMap")
            return (e) => {
              const o = r.getState().getNestedState(t, n);
              return Array.isArray(o) ? (S?.validIndices || Array.from({ length: o.length }, (c, g) => g)).map((c, g) => {
                const u = o[c], T = [...n, c.toString()], A = a(u, T, S);
                return e(u, A, {
                  register: () => {
                    const [, P] = Y({}), V = `${h}-${n.join(".")}-${c}`;
                    it(() => {
                      const N = `${t}////${V}`, D = r.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set(N, {
                        forceUpdate: () => P({}),
                        paths: /* @__PURE__ */ new Set([T.join(".")])
                      }), r.getState().stateComponents.set(t, D), () => {
                        const W = r.getState().stateComponents.get(t);
                        W && W.components.delete(N);
                      };
                    }, [t, V]);
                  },
                  index: g,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                o
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => y.map((s, c) => {
              let g;
              S?.validIndices && S.validIndices[c] !== void 0 ? g = S.validIndices[c] : g = c;
              const u = [...n, g.toString()], T = a(s, u, S);
              return e(
                s,
                T,
                c,
                y,
                a(y, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => ot(Wt, {
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
              const o = r.getState().getNestedState(t, n);
              return Array.isArray(o) ? (S?.validIndices || Array.from({ length: o.length }, (c, g) => g)).map((c, g) => {
                const u = o[c], T = [...n, c.toString()], A = a(u, T, S), E = `${h}-${n.join(".")}-${c}`;
                return ot(Bt, {
                  key: c,
                  stateKey: t,
                  itemComponentId: E,
                  itemPath: T,
                  children: e(
                    u,
                    A,
                    g,
                    o,
                    a(o, n, S)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const o = y;
              I.clear(), k++;
              const s = o.flatMap(
                (c) => c[e] ?? []
              );
              return a(
                s,
                [...n, "[*]", e],
                S
              );
            };
          if (l === "index")
            return (e) => {
              const o = y[e];
              return a(o, [...n, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = r.getState().getNestedState(t, n);
              if (e.length === 0) return;
              const o = e.length - 1, s = e[o], c = [...n, o.toString()];
              return a(s, c);
            };
          if (l === "insert")
            return (e) => (w(n), gt(i, e, n, t), a(
              r.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, o, s) => {
              const c = r.getState().getNestedState(t, n), g = q(e) ? e(c) : e;
              let u = null;
              if (!c.some((A) => {
                if (o) {
                  const P = o.every(
                    (V) => H(A[V], g[V])
                  );
                  return P && (u = A), P;
                }
                const E = H(A, g);
                return E && (u = A), E;
              }))
                w(n), gt(i, g, n, t);
              else if (s && u) {
                const A = s(u), E = c.map(
                  (P) => H(P, u) ? A : P
                );
                w(n), rt(i, E, n);
              }
            };
          if (l === "cut")
            return (e, o) => {
              if (!o?.waitForSync)
                return w(n), st(i, n, t, e), a(
                  r.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let o = 0; o < y.length; o++)
                y[o] === e && st(i, n, t, o);
            };
          if (l === "toggleByValue")
            return (e) => {
              const o = y.findIndex((s) => s === e);
              o > -1 ? st(i, n, t, o) : gt(i, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = d().find(
                ({ item: g }, u) => e(g, u)
              );
              if (!s) return;
              const c = [...n, s.originalIndex.toString()];
              return a(s.item, c, S);
            };
          if (l === "findWith")
            return (e, o) => {
              const c = d().find(
                ({ item: u }) => u[e] === o
              );
              if (!c) return;
              const g = [...n, c.originalIndex.toString()];
              return a(c.item, g, S);
            };
        }
        const J = n[n.length - 1];
        if (!isNaN(Number(J))) {
          const d = n.slice(0, -1), e = r.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => st(
              i,
              d,
              t,
              Number(J)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(y)) {
              const d = r.getState().getNestedState(t, n);
              return S.validIndices.map((e) => d[e]);
            }
            return r.getState().getNestedState(t, n);
          };
        if (l === "$derive")
          return (d) => Tt({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Tt({
            _stateKey: t,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${t}:${n.join(".")}`;
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => dt(f + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), o = r.getState().getNestedState(t, d);
          return Array.isArray(o) ? Number(n[n.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), o = Number(n[n.length - 1]), s = e.join(".");
            d ? r.getState().setSelectedIndex(t, s, o) : r.getState().setSelectedIndex(t, s, void 0);
            const c = r.getState().getNestedState(t, [...e]);
            rt(i, c, e), w(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), e = Number(n[n.length - 1]), o = d.join("."), s = r.getState().getSelectedIndex(t, o);
            r.getState().setSelectedIndex(
              t,
              o,
              s === e ? void 0 : e
            );
            const c = r.getState().getNestedState(t, [...d]);
            rt(i, c, d), w(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = r.getState().cogsStateStore[t], s = Ot(e, d).newDocument;
              kt(
                t,
                r.getState().initialStateGlobal[t],
                s,
                i,
                h,
                f
              );
              const c = r.getState().stateComponents.get(t);
              if (c) {
                const g = mt(e, s), u = new Set(g);
                for (const [
                  T,
                  A
                ] of c.components.entries()) {
                  let E = !1;
                  const P = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
                  if (!P.includes("none")) {
                    if (P.includes("all")) {
                      A.forceUpdate();
                      continue;
                    }
                    if (P.includes("component") && (A.paths.has("") && (E = !0), !E))
                      for (const V of u) {
                        if (A.paths.has(V)) {
                          E = !0;
                          break;
                        }
                        let N = V.lastIndexOf(".");
                        for (; N !== -1; ) {
                          const D = V.substring(0, N);
                          if (A.paths.has(D)) {
                            E = !0;
                            break;
                          }
                          const W = V.substring(
                            N + 1
                          );
                          if (!isNaN(Number(W))) {
                            const O = D.lastIndexOf(".");
                            if (O !== -1) {
                              const C = D.substring(
                                0,
                                O
                              );
                              if (A.paths.has(C)) {
                                E = !0;
                                break;
                              }
                            }
                          }
                          N = D.lastIndexOf(".");
                        }
                        if (E) break;
                      }
                    if (!E && P.includes("deps") && A.depsFunction) {
                      const V = A.depsFunction(s);
                      let N = !1;
                      typeof V == "boolean" ? V && (N = !0) : H(A.deps, V) || (A.deps = V, N = !0), N && (E = !0);
                    }
                    E && A.forceUpdate();
                  }
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const d = r.getState().getInitialOptions(t)?.validation, e = r.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              z(d.key);
              const o = r.getState().cogsStateStore[t];
              try {
                const s = r.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([g]) => {
                  g && g.startsWith(d.key) && z(g);
                });
                const c = d.zodSchema.safeParse(o);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const T = u.path, A = u.message, E = [d.key, ...T].join(".");
                  e(E, A);
                }), ut(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return h;
          if (l === "getComponents")
            return () => r().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => It.getState().getFormRefsByStateKey(t);
          if (l === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return r.getState().serverState[t];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return p.revertToInitialState;
          if (l === "updateInitialState") return p.updateInitialState;
          if (l === "removeValidation") return p.removeValidation;
        }
        if (l === "getFormRef")
          return () => It.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ ft(
            Pt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
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
              Vt(() => {
                rt(i, d, n, "");
                const o = r.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(o);
              }, e.debounce);
            else {
              rt(i, d, n, "");
              const o = r.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(o);
            }
            w(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ ft(
            xt,
            {
              setState: i,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const M = [...n, l], et = r.getState().getNestedState(t, M);
        return a(et, M, S);
      }
    }, G = new Proxy(U, j);
    return I.set(F, {
      proxy: G,
      stateVersion: k
    }), G;
  }
  return a(
    r.getState().getNestedState(t, [])
  );
}
function Tt(t) {
  return ot(Ht, { proxy: t });
}
function Wt({
  proxy: t,
  rebuildStateShape: i
}) {
  const h = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(h) ? i(
    h,
    t._path
  ).stateMapNoRender(
    (I, k, w, p, a) => t._mapFn(I, k, w, p, a)
  ) : null;
}
function Ht({
  proxy: t
}) {
  const i = Z(null), h = `${t._stateKey}-${t._path.join(".")}`;
  return tt(() => {
    const f = i.current;
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
    r.getState().addSignalElement(h, y);
    const n = r.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (U) {
        console.error("Error evaluating effect function during mount:", U), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const F = document.createTextNode(String(S));
    f.replaceWith(F);
  }, [t._stateKey, t._path.join("."), t._effect]), ot("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function se(t) {
  const i = Ct(
    (h) => {
      const f = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(t._stateKey, {
        forceUpdate: h,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => f.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return ot("text", {}, String(i));
}
function Bt({
  stateKey: t,
  itemComponentId: i,
  itemPath: h,
  children: f
}) {
  const [, I] = Y({}), [k, w] = Mt(), p = Z(null);
  return tt(() => {
    w.height > 0 && w.height !== p.current && (p.current = w.height, r.getState().setShadowMetadata(t, h, {
      virtualizer: {
        itemHeight: w.height
      }
    }));
  }, [w.height, t, h]), it(() => {
    const a = `${t}////${i}`, y = r.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return y.components.set(a, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set([h.join(".")])
    }), r.getState().stateComponents.set(t, y), () => {
      const n = r.getState().stateComponents.get(t);
      n && n.components.delete(a);
    };
  }, [t, i, h.join(".")]), /* @__PURE__ */ ft("div", { ref: k, children: f });
}
export {
  Tt as $cogsSignal,
  se as $cogsSignalStore,
  re as addStateOptions,
  oe as createCogsState,
  ae as notifyComponent,
  Gt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
