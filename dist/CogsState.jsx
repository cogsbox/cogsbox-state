"use client";
import { jsx as ve } from "react/jsx-runtime";
import { useState as te, useRef as J, useEffect as ae, useLayoutEffect as fe, useMemo as Te, createElement as ie, useSyncExternalStore as be, startTransition as Ne, useCallback as Ie } from "react";
import { transformStateFunc as Ce, isDeepEqual as L, isFunction as z, getNestedValue as B, getDifferences as Se, debounce as Pe } from "./utility.js";
import { pushFunc as ge, updateFn as ee, cutFunc as re, ValidationWrapper as _e, FormControlComponent as Me } from "./Functions.jsx";
import Oe from "superjson";
import { v4 as me } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as he } from "./store.js";
import { useCogsConfig as $e } from "./CogsStateClient.jsx";
import { applyPatch as Re } from "fast-json-patch";
function pe(e, i) {
  const I = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, y = I(e) || {};
  f(e, {
    ...y,
    ...i
  });
}
function we({
  stateKey: e,
  options: i,
  initialOptionsPart: I
}) {
  const f = Q(e) || {}, y = I[e] || {}, A = r.getState().setInitialStateOptions, x = { ...y, ...f };
  let p = !1;
  if (i)
    for (const s in i)
      x.hasOwnProperty(s) ? (s == "localStorage" && i[s] && x[s].key !== i[s]?.key && (p = !0, x[s] = i[s]), s == "initialState" && i[s] && x[s] !== i[s] && // Different references
      !L(x[s], i[s]) && (p = !0, x[s] = i[s])) : (p = !0, x[s] = i[s]);
  p && A(e, x);
}
function rt(e, { formElements: i, validation: I }) {
  return { initialState: e, formElements: i, validation: I };
}
const at = (e, i) => {
  let I = e;
  const [f, y] = Ce(I);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((p) => {
    y[p] = y[p] || {}, y[p].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[p].formElements || {}
      // State-specific overrides
    }, Q(p) || r.getState().setInitialStateOptions(p, y[p]);
  }), r.getState().setInitialStates(f), r.getState().setCreatedState(f);
  const A = (p, s) => {
    const [v] = te(s?.componentId ?? me());
    we({
      stateKey: p,
      options: s,
      initialOptionsPart: y
    });
    const a = r.getState().cogsStateStore[p] || f[p], S = s?.modifyState ? s.modifyState(a) : a, [W, R] = Le(
      S,
      {
        stateKey: p,
        syncUpdate: s?.syncUpdate,
        componentId: v,
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
    return R;
  };
  function x(p, s) {
    we({ stateKey: p, options: s, initialOptionsPart: y }), s.localStorage && We(p, s), le(p);
  }
  return { useCogsState: A, setCogsOptions: x };
}, {
  setUpdaterState: oe,
  setState: Z,
  getInitialOptions: Q,
  getKeyState: Ae,
  getValidationErrors: je,
  setStateLog: Ue,
  updateInitialStateGlobal: ye,
  addValidationError: Fe,
  removeValidationError: q,
  setServerSyncActions: De
} = r.getState(), xe = (e, i, I, f, y) => {
  I?.log && console.log(
    "saving to localstorage",
    i,
    I.localStorage?.key,
    f
  );
  const A = z(I?.localStorage?.key) ? I.localStorage?.key(e) : I?.localStorage?.key;
  if (A && f) {
    const x = `${f}-${i}-${A}`;
    let p;
    try {
      p = ce(x)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? p
    }, v = Oe.serialize(s);
    window.localStorage.setItem(
      x,
      JSON.stringify(v.json)
    );
  }
}, ce = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, We = (e, i) => {
  const I = r.getState().cogsStateStore[e], { sessionId: f } = $e(), y = z(i?.localStorage?.key) ? i.localStorage.key(I) : i?.localStorage?.key;
  if (y && f) {
    const A = ce(
      `${f}-${e}-${y}`
    );
    if (A && A.lastUpdated > (A.lastSyncedWithServer || 0))
      return Z(e, A.state), le(e), !0;
  }
  return !1;
}, Ve = (e, i, I, f, y, A) => {
  const x = {
    initialState: i,
    updaterState: se(
      e,
      f,
      y,
      A
    ),
    state: I
  };
  ye(e, x.initialState), oe(e, x.updaterState), Z(e, x.state);
}, le = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const I = /* @__PURE__ */ new Set();
  i.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || I.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    I.forEach((f) => f());
  });
}, ot = (e, i) => {
  const I = r.getState().stateComponents.get(e);
  if (I) {
    const f = `${e}////${i}`, y = I.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Ge = (e, i, I, f) => {
  switch (e) {
    case "update":
      return {
        oldValue: B(i, f),
        newValue: B(I, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: B(I, f)
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
function Le(e, {
  stateKey: i,
  serverSync: I,
  localStorage: f,
  formElements: y,
  reactiveDeps: A,
  reactiveType: x,
  componentId: p,
  initialState: s,
  syncUpdate: v,
  dependencies: a,
  serverState: S
} = {}) {
  const [W, R] = te({}), { sessionId: j } = $e();
  let G = !i;
  const [m] = te(i ?? me()), l = r.getState().stateLog[m], ne = J(/* @__PURE__ */ new Set()), H = J(p ?? me()), _ = J(
    null
  );
  _.current = Q(m) ?? null, ae(() => {
    if (v && v.stateKey === m && v.path?.[0]) {
      Z(m, (n) => ({
        ...n,
        [v.path[0]]: v.newValue
      }));
      const t = `${v.stateKey}:${v.path.join(".")}`;
      r.getState().setSyncInfo(t, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), ae(() => {
    if (s) {
      pe(m, {
        initialState: s
      });
      const t = _.current, o = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = r.getState().initialStateGlobal[m];
      if (!(c && !L(c, s) || !c) && !o)
        return;
      let u = null;
      const V = z(t?.localStorage?.key) ? t?.localStorage?.key(s) : t?.localStorage?.key;
      V && j && (u = ce(`${j}-${m}-${V}`));
      let h = s, $ = !1;
      const N = o ? Date.now() : 0, E = u?.lastUpdated || 0, M = u?.lastSyncedWithServer || 0;
      o && N > E ? (h = t.serverState.data, $ = !0) : u && E > M && (h = u.state, t?.localStorage?.onChange && t?.localStorage?.onChange(h)), Ve(
        m,
        s,
        h,
        K,
        H.current,
        j
      ), $ && V && j && xe(h, m, t, j, Date.now()), le(m), (Array.isArray(x) ? x : [x || "component"]).includes("none") || R({});
    }
  }, [
    s,
    S?.status,
    S?.data,
    ...a || []
  ]), fe(() => {
    G && pe(m, {
      serverSync: I,
      formElements: y,
      initialState: s,
      localStorage: f,
      middleware: _.current?.middleware
    });
    const t = `${m}////${H.current}`, n = r.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(t, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: A || void 0,
      reactiveType: x ?? ["component", "deps"]
    }), r.getState().stateComponents.set(m, n), R({}), () => {
      const o = `${m}////${H.current}`;
      n && (n.components.delete(o), n.components.size === 0 && r.getState().stateComponents.delete(m));
    };
  }, []);
  const K = (t, n, o, c) => {
    if (Array.isArray(n)) {
      const g = `${m}-${n.join(".")}`;
      ne.current.add(g);
    }
    Z(m, (g) => {
      const u = z(t) ? t(g) : t, V = `${m}-${n.join(".")}`;
      if (V) {
        let P = !1, k = r.getState().signalDomElements.get(V);
        if ((!k || k.size === 0) && (o.updateType === "insert" || o.updateType === "cut")) {
          const T = n.slice(0, -1), C = B(u, T);
          if (Array.isArray(C)) {
            P = !0;
            const w = `${m}-${T.join(".")}`;
            k = r.getState().signalDomElements.get(w);
          }
        }
        if (k) {
          const T = P ? B(u, n.slice(0, -1)) : B(u, n);
          k.forEach(({ parentId: C, position: w, effect: b }) => {
            const O = document.querySelector(
              `[data-parent-id="${C}"]`
            );
            if (O) {
              const D = Array.from(O.childNodes);
              if (D[w]) {
                const U = b ? new Function("state", `return (${b})(state)`)(T) : T;
                D[w].textContent = String(U);
              }
            }
          });
        }
      }
      o.updateType === "update" && (c || _.current?.validation?.key) && n && q(
        (c || _.current?.validation?.key) + "." + n.join(".")
      );
      const h = n.slice(0, n.length - 1);
      o.updateType === "cut" && _.current?.validation?.key && q(
        _.current?.validation?.key + "." + h.join(".")
      ), o.updateType === "insert" && _.current?.validation?.key && je(
        _.current?.validation?.key + "." + h.join(".")
      ).filter(([k, T]) => {
        let C = k?.split(".").length;
        if (k == h.join(".") && C == h.length - 1) {
          let w = k + "." + h;
          q(k), Fe(w, T);
        }
      });
      const $ = r.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", $), $) {
        const P = Se(g, u), k = new Set(P), T = o.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          C,
          w
        ] of $.components.entries()) {
          let b = !1;
          const O = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
          if (console.log("component", w), !O.includes("none")) {
            if (O.includes("all")) {
              w.forceUpdate();
              continue;
            }
            if (O.includes("component") && ((w.paths.has(T) || w.paths.has("")) && (b = !0), !b))
              for (const D of k) {
                let U = D;
                for (; ; ) {
                  if (w.paths.has(U)) {
                    b = !0;
                    break;
                  }
                  const Y = U.lastIndexOf(".");
                  if (Y !== -1) {
                    const X = U.substring(
                      0,
                      Y
                    );
                    if (!isNaN(
                      Number(U.substring(Y + 1))
                    ) && w.paths.has(X)) {
                      b = !0;
                      break;
                    }
                    U = X;
                  } else
                    U = "";
                  if (U === "")
                    break;
                }
                if (b) break;
              }
            if (!b && O.includes("deps") && w.depsFunction) {
              const D = w.depsFunction(u);
              let U = !1;
              typeof D == "boolean" ? D && (U = !0) : L(w.deps, D) || (w.deps = D, U = !0), U && (b = !0);
            }
            b && w.forceUpdate();
          }
        }
      }
      const N = Date.now();
      n = n.map((P, k) => {
        const T = n.slice(0, -1), C = B(u, T);
        return k === n.length - 1 && ["insert", "cut"].includes(o.updateType) ? (C.length - 1).toString() : P;
      });
      const { oldValue: E, newValue: M } = Ge(
        o.updateType,
        g,
        u,
        n
      ), F = {
        timeStamp: N,
        stateKey: m,
        path: n,
        updateType: o.updateType,
        status: "new",
        oldValue: E,
        newValue: M
      };
      if (Ue(m, (P) => {
        const T = [...P ?? [], F].reduce((C, w) => {
          const b = `${w.stateKey}:${JSON.stringify(w.path)}`, O = C.get(b);
          return O ? (O.timeStamp = Math.max(O.timeStamp, w.timeStamp), O.newValue = w.newValue, O.oldValue = O.oldValue ?? w.oldValue, O.updateType = w.updateType) : C.set(b, { ...w }), C;
        }, /* @__PURE__ */ new Map());
        return Array.from(T.values());
      }), xe(
        u,
        m,
        _.current,
        j
      ), _.current?.middleware && _.current.middleware({
        updateLog: l,
        update: F
      }), _.current?.serverSync) {
        const P = r.getState().serverState[m], k = _.current?.serverSync;
        De(m, {
          syncKey: typeof k.syncKey == "string" ? k.syncKey : k.syncKey({ state: u }),
          rollBackState: P,
          actionTimeStamp: Date.now() + (k.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return u;
    });
  };
  r.getState().updaterState[m] || (oe(
    m,
    se(
      m,
      K,
      H.current,
      j
    )
  ), r.getState().cogsStateStore[m] || Z(m, e), r.getState().initialStateGlobal[m] || ye(m, e));
  const d = Te(() => se(
    m,
    K,
    H.current,
    j
  ), [m, j]);
  return [Ae(m), d];
}
function se(e, i, I, f) {
  const y = /* @__PURE__ */ new Map();
  let A = 0;
  const x = (v) => {
    const a = v.join(".");
    for (const [S] of y)
      (S === a || S.startsWith(a + ".")) && y.delete(S);
    A++;
  }, p = {
    removeValidation: (v) => {
      v?.validationKey && q(v.validationKey);
    },
    revertToInitialState: (v) => {
      const a = r.getState().getInitialOptions(e)?.validation;
      a?.key && q(a?.key), v?.validationKey && q(v.validationKey);
      const S = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), y.clear(), A++;
      const W = s(S, []), R = Q(e), j = z(R?.localStorage?.key) ? R?.localStorage?.key(S) : R?.localStorage?.key, G = `${f}-${e}-${j}`;
      G && localStorage.removeItem(G), oe(e, W), Z(e, S);
      const m = r.getState().stateComponents.get(e);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), A++;
      const a = se(
        e,
        i,
        I,
        f
      ), S = r.getState().initialStateGlobal[e], W = Q(e), R = z(W?.localStorage?.key) ? W?.localStorage?.key(S) : W?.localStorage?.key, j = `${f}-${e}-${R}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), Ne(() => {
        ye(e, v), oe(e, a), Z(e, v);
        const G = r.getState().stateComponents.get(e);
        G && G.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (G) => a.get()[G]
      };
    },
    _initialState: r.getState().initialStateGlobal[e],
    _serverState: r.getState().serverState[e],
    _isLoading: r.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const v = r.getState().serverState[e];
      return !!(v && L(v, Ae(e)));
    }
  };
  function s(v, a = [], S) {
    const W = a.map(String).join(".");
    y.get(W);
    const R = function() {
      return r().getNestedState(e, a);
    };
    Object.keys(p).forEach((m) => {
      R[m] = p[m];
    });
    const j = {
      apply(m, l, ne) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${a.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, a);
      },
      get(m, l) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
        const ne = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !ne.has(l)) {
          const d = `${e}////${I}`, t = r.getState().stateComponents.get(e);
          if (t) {
            const n = t.components.get(d);
            if (n && !n.paths.has("")) {
              const o = a.join(".");
              let c = !0;
              for (const g of n.paths)
                if (o.startsWith(g) && (o === g || o[g.length] === ".")) {
                  c = !1;
                  break;
                }
              c && n.paths.add(o);
            }
          }
        }
        if (l === "getDifferences")
          return () => Se(
            r.getState().cogsStateStore[e],
            r.getState().initialStateGlobal[e]
          );
        if (l === "sync" && a.length === 0)
          return async function() {
            const d = r.getState().getInitialOptions(e), t = d?.sync;
            if (!t)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const n = r.getState().getNestedState(e, []), o = d?.validation?.key;
            try {
              const c = await t.action(n);
              if (c && !c.success && c.errors && o) {
                r.getState().removeValidationError(o), c.errors.forEach((u) => {
                  const V = [o, ...u.path].join(".");
                  r.getState().addValidationError(V, u.message);
                });
                const g = r.getState().stateComponents.get(e);
                g && g.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return c?.success && t.onSuccess ? t.onSuccess(c.data) : !c?.success && t.onError && t.onError(c.error), c;
            } catch (c) {
              return t.onError && t.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = r.getState().getNestedState(e, a), t = r.getState().initialStateGlobal[e], n = B(t, a);
          return L(d, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              e,
              a
            ), t = r.getState().initialStateGlobal[e], n = B(t, a);
            return L(d, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[e], t = Q(e), n = z(t?.localStorage?.key) ? t?.localStorage?.key(d) : t?.localStorage?.key, o = `${f}-${e}-${n}`;
            o && localStorage.removeItem(o);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = r.getState().getInitialOptions(e)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(d.key + "." + a.join("."));
          };
        if (Array.isArray(v)) {
          const d = () => S?.validIndices ? v.map((n, o) => ({
            item: n,
            originalIndex: S.validIndices[o]
          })) : r.getState().getNestedState(e, a).map((n, o) => ({
            item: n,
            originalIndex: o
          }));
          if (l === "getSelected")
            return () => {
              const t = r.getState().getSelectedIndex(e, a.join("."));
              if (t !== void 0)
                return s(
                  v[t],
                  [...a, t.toString()],
                  S
                );
            };
          if (l === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: e, path: a });
            };
          if (l === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(e, a.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (t) => {
              const {
                itemHeight: n,
                overscan: o = 5,
                stickToBottom: c = !1
              } = t;
              if (typeof n != "number" || n <= 0)
                throw new Error(
                  "[cogs-state] `useVirtualView` requires a positive number for `itemHeight` option."
                );
              const g = J(null), u = J(!0), V = J({ startIndex: 0, endIndex: 50 }), [h, $] = te({
                startIndex: 0,
                endIndex: 50
              }), N = r().getNestedState(
                e,
                a
              ), E = N.length, M = Te(() => {
                const T = Array.from(
                  { length: h.endIndex - h.startIndex },
                  (w, b) => h.startIndex + b
                ).filter((w) => w < E), C = T.map((w) => N[w]);
                return s(C, a, {
                  ...S,
                  validIndices: T
                });
              }, [h.startIndex, h.endIndex, N]);
              fe(() => {
                const T = g.current;
                if (!T) return;
                const C = () => {
                  const { scrollTop: w, clientHeight: b, scrollHeight: O } = T, D = O - w - b < 2;
                  u.current = D;
                  const U = Math.floor(w / n), Y = Math.ceil(
                    (w + b) / n
                  ), X = V.current;
                  if (!(U < X.startIndex + o || Y > X.endIndex - o || D && X.endIndex < E)) return;
                  let de = Math.max(0, U - o * 3), ue = Math.min(E, Y + o * 3);
                  if (D) {
                    ue = E;
                    const ke = Math.ceil(b / n);
                    de = Math.max(0, E - ke - o * 2);
                  }
                  V.current = { startIndex: de, endIndex: ue }, $({ startIndex: de, endIndex: ue });
                };
                if (T.addEventListener("scroll", C, {
                  passive: !0
                }), c && E > 0) {
                  const w = Math.ceil(
                    T.clientHeight / n
                  ), b = Math.max(
                    0,
                    E - w - o * 2
                  );
                  V.current = {
                    startIndex: b,
                    endIndex: E
                  }, $({ startIndex: b, endIndex: E }), T.scrollTop = T.scrollHeight;
                } else
                  C();
                return () => {
                  T.removeEventListener("scroll", C);
                };
              }, [E, n, o, c]), ae(() => {
                c && u.current && g.current && (g.current.scrollTop = g.current.scrollHeight);
              }, [E, c]);
              const F = Ie(
                (T = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: T
                  });
                },
                []
              ), P = Ie(
                (T, C = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: T * n,
                    behavior: C
                  });
                },
                [n]
              ), k = {
                outer: {
                  ref: g,
                  style: {
                    overflowY: "auto",
                    height: "100%",
                    position: "relative"
                  }
                },
                inner: {
                  style: {
                    height: `${E * n}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    paddingTop: `${h.startIndex * n}px`
                  }
                }
              };
              return {
                virtualState: M,
                virtualizerProps: k,
                scrollToBottom: F,
                scrollToIndex: P
              };
            };
          if (l === "stateSort")
            return (t) => {
              const o = [...d()].sort(
                (u, V) => t(u.item, V.item)
              ), c = o.map(({ item: u }) => u), g = {
                ...S,
                validIndices: o.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, a, g);
            };
          if (l === "stateFilter")
            return (t) => {
              const o = d().filter(
                ({ item: u }, V) => t(u, V)
              ), c = o.map(({ item: u }) => u), g = {
                ...S,
                validIndices: o.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, a, g);
            };
          if (l === "stateMap")
            return (t) => {
              const n = r.getState().getNestedState(e, a);
              return Array.isArray(n) ? (S?.validIndices || Array.from({ length: n.length }, (c, g) => g)).map((c, g) => {
                const u = n[c], V = [...a, c.toString()], h = s(u, V, S);
                return t(u, h, {
                  register: () => {
                    const [, N] = te({}), E = `${I}-${a.join(".")}-${c}`;
                    fe(() => {
                      const M = `${e}////${E}`, F = r.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return F.components.set(M, {
                        forceUpdate: () => N({}),
                        paths: /* @__PURE__ */ new Set([V.join(".")])
                      }), r.getState().stateComponents.set(e, F), () => {
                        const P = r.getState().stateComponents.get(e);
                        P && P.components.delete(M);
                      };
                    }, [e, E]);
                  },
                  index: g,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${a.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (t) => v.map((o, c) => {
              let g;
              S?.validIndices && S.validIndices[c] !== void 0 ? g = S.validIndices[c] : g = c;
              const u = [...a, g.toString()], V = s(o, u, S);
              return t(
                o,
                V,
                c,
                v,
                s(v, a, S)
              );
            });
          if (l === "$stateMap")
            return (t) => ie(Be, {
              proxy: {
                _stateKey: e,
                _path: a,
                _mapFn: t
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateFlattenOn")
            return (t) => {
              const n = v;
              y.clear(), A++;
              const o = n.flatMap(
                (c) => c[t] ?? []
              );
              return s(
                o,
                [...a, "[*]", t],
                S
              );
            };
          if (l === "index")
            return (t) => {
              const n = v[t];
              return s(n, [...a, t.toString()]);
            };
          if (l === "last")
            return () => {
              const t = r.getState().getNestedState(e, a);
              if (t.length === 0) return;
              const n = t.length - 1, o = t[n], c = [...a, n.toString()];
              return s(o, c);
            };
          if (l === "insert")
            return (t) => (x(a), ge(i, t, a, e), s(
              r.getState().getNestedState(e, a),
              a
            ));
          if (l === "uniqueInsert")
            return (t, n, o) => {
              const c = r.getState().getNestedState(e, a), g = z(t) ? t(c) : t;
              let u = null;
              if (!c.some((h) => {
                if (n) {
                  const N = n.every(
                    (E) => L(h[E], g[E])
                  );
                  return N && (u = h), N;
                }
                const $ = L(h, g);
                return $ && (u = h), $;
              }))
                x(a), ge(i, g, a, e);
              else if (o && u) {
                const h = o(u), $ = c.map(
                  (N) => L(N, u) ? h : N
                );
                x(a), ee(i, $, a);
              }
            };
          if (l === "cut")
            return (t, n) => {
              if (!n?.waitForSync)
                return x(a), re(i, a, e, t), s(
                  r.getState().getNestedState(e, a),
                  a
                );
            };
          if (l === "cutByValue")
            return (t) => {
              for (let n = 0; n < v.length; n++)
                v[n] === t && re(i, a, e, n);
            };
          if (l === "toggleByValue")
            return (t) => {
              const n = v.findIndex((o) => o === t);
              n > -1 ? re(i, a, e, n) : ge(i, t, a, e);
            };
          if (l === "stateFind")
            return (t) => {
              const o = d().find(
                ({ item: g }, u) => t(g, u)
              );
              if (!o) return;
              const c = [...a, o.originalIndex.toString()];
              return s(o.item, c, S);
            };
          if (l === "findWith")
            return (t, n) => {
              const c = d().find(
                ({ item: u }) => u[t] === n
              );
              if (!c) return;
              const g = [...a, c.originalIndex.toString()];
              return s(c.item, g, S);
            };
        }
        const H = a[a.length - 1];
        if (!isNaN(Number(H))) {
          const d = a.slice(0, -1), t = r.getState().getNestedState(e, d);
          if (Array.isArray(t) && l === "cut")
            return () => re(
              i,
              d,
              e,
              Number(H)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(v)) {
              const d = r.getState().getNestedState(e, a);
              return S.validIndices.map((t) => d[t]);
            }
            return r.getState().getNestedState(e, a);
          };
        if (l === "$derive")
          return (d) => Ee({
            _stateKey: e,
            _path: a,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Ee({
            _stateKey: e,
            _path: a
          });
        if (l === "lastSynced") {
          const d = `${e}:${a.join(".")}`;
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => ce(f + "-" + e + "-" + d);
        if (l === "_selected") {
          const d = a.slice(0, -1), t = d.join("."), n = r.getState().getNestedState(e, d);
          return Array.isArray(n) ? Number(a[a.length - 1]) === r.getState().getSelectedIndex(e, t) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const t = a.slice(0, -1), n = Number(a[a.length - 1]), o = t.join(".");
            d ? r.getState().setSelectedIndex(e, o, n) : r.getState().setSelectedIndex(e, o, void 0);
            const c = r.getState().getNestedState(e, [...t]);
            ee(i, c, t), x(t);
          };
        if (l === "toggleSelected")
          return () => {
            const d = a.slice(0, -1), t = Number(a[a.length - 1]), n = d.join("."), o = r.getState().getSelectedIndex(e, n);
            r.getState().setSelectedIndex(
              e,
              n,
              o === t ? void 0 : t
            );
            const c = r.getState().getNestedState(e, [...d]);
            ee(i, c, d), x(d);
          };
        if (a.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const t = r.getState().cogsStateStore[e], o = Re(t, d).newDocument;
              Ve(
                e,
                r.getState().initialStateGlobal[e],
                o,
                i,
                I,
                f
              );
              const c = r.getState().stateComponents.get(e);
              if (c) {
                const g = Se(t, o), u = new Set(g);
                for (const [
                  V,
                  h
                ] of c.components.entries()) {
                  let $ = !1;
                  const N = Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"];
                  if (!N.includes("none")) {
                    if (N.includes("all")) {
                      h.forceUpdate();
                      continue;
                    }
                    if (N.includes("component") && (h.paths.has("") && ($ = !0), !$))
                      for (const E of u) {
                        if (h.paths.has(E)) {
                          $ = !0;
                          break;
                        }
                        let M = E.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const F = E.substring(0, M);
                          if (h.paths.has(F)) {
                            $ = !0;
                            break;
                          }
                          const P = E.substring(
                            M + 1
                          );
                          if (!isNaN(Number(P))) {
                            const k = F.lastIndexOf(".");
                            if (k !== -1) {
                              const T = F.substring(
                                0,
                                k
                              );
                              if (h.paths.has(T)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          M = F.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && N.includes("deps") && h.depsFunction) {
                      const E = h.depsFunction(o);
                      let M = !1;
                      typeof E == "boolean" ? E && (M = !0) : L(h.deps, E) || (h.deps = E, M = !0), M && ($ = !0);
                    }
                    $ && h.forceUpdate();
                  }
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const d = r.getState().getInitialOptions(e)?.validation, t = r.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              q(d.key);
              const n = r.getState().cogsStateStore[e];
              try {
                const o = r.getState().getValidationErrors(d.key);
                o && o.length > 0 && o.forEach(([g]) => {
                  g && g.startsWith(d.key) && q(g);
                });
                const c = d.zodSchema.safeParse(n);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const V = u.path, h = u.message, $ = [d.key, ...V].join(".");
                  t($, h);
                }), le(e), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (l === "_componentId") return I;
          if (l === "getComponents")
            return () => r().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => he.getState().getFormRefsByStateKey(e);
          if (l === "_initialState")
            return r.getState().initialStateGlobal[e];
          if (l === "_serverState")
            return r.getState().serverState[e];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[e];
          if (l === "revertToInitialState")
            return p.revertToInitialState;
          if (l === "updateInitialState") return p.updateInitialState;
          if (l === "removeValidation") return p.removeValidation;
        }
        if (l === "getFormRef")
          return () => he.getState().getFormRef(e + "." + a.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: t
          }) => /* @__PURE__ */ ve(
            _e,
            {
              formOpts: t ? { validation: { message: "" } } : void 0,
              path: a,
              validationKey: r.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: S?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return e;
        if (l === "_path") return a;
        if (l === "_isServerSynced") return p._isServerSynced;
        if (l === "update")
          return (d, t) => {
            if (t?.debounce)
              Pe(() => {
                ee(i, d, a, "");
                const n = r.getState().getNestedState(e, a);
                t?.afterUpdate && t.afterUpdate(n);
              }, t.debounce);
            else {
              ee(i, d, a, "");
              const n = r.getState().getNestedState(e, a);
              t?.afterUpdate && t.afterUpdate(n);
            }
            x(a);
          };
        if (l === "formElement")
          return (d, t) => /* @__PURE__ */ ve(
            Me,
            {
              setState: i,
              stateKey: e,
              path: a,
              child: d,
              formOpts: t
            }
          );
        const _ = [...a, l], K = r.getState().getNestedState(e, _);
        return s(K, _, S);
      }
    }, G = new Proxy(R, j);
    return y.set(W, {
      proxy: G,
      stateVersion: A
    }), G;
  }
  return s(
    r.getState().getNestedState(e, [])
  );
}
function Ee(e) {
  return ie(He, { proxy: e });
}
function Be({
  proxy: e,
  rebuildStateShape: i
}) {
  const I = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(I) ? i(
    I,
    e._path
  ).stateMapNoRender(
    (y, A, x, p, s) => e._mapFn(y, A, x, p, s)
  ) : null;
}
function He({
  proxy: e
}) {
  const i = J(null), I = `${e._stateKey}-${e._path.join(".")}`;
  return ae(() => {
    const f = i.current;
    if (!f || !f.parentElement) return;
    const y = f.parentElement, x = Array.from(y.childNodes).indexOf(f);
    let p = y.getAttribute("data-parent-id");
    p || (p = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", p));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: p,
      position: x,
      effect: e._effect
    };
    r.getState().addSignalElement(I, v);
    const a = r.getState().getNestedState(e._stateKey, e._path);
    let S;
    if (e._effect)
      try {
        S = new Function(
          "state",
          `return (${e._effect})(state)`
        )(a);
      } catch (R) {
        console.error("Error evaluating effect function during mount:", R), S = a;
      }
    else
      S = a;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const W = document.createTextNode(String(S));
    f.replaceWith(W);
  }, [e._stateKey, e._path.join("."), e._effect]), ie("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": I
  });
}
function st(e) {
  const i = be(
    (I) => {
      const f = r.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(e._stateKey, {
        forceUpdate: I,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => f.components.delete(e._stateKey);
    },
    () => r.getState().getNestedState(e._stateKey, e._path)
  );
  return ie("text", {}, String(i));
}
export {
  Ee as $cogsSignal,
  st as $cogsSignalStore,
  rt as addStateOptions,
  at as createCogsState,
  ot as notifyComponent,
  Le as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
