"use client";
import { jsx as me } from "react/jsx-runtime";
import { useState as K, useRef as Z, useEffect as ne, useLayoutEffect as de, useMemo as Te, createElement as ae, useSyncExternalStore as xe, startTransition as Ve, useCallback as ye } from "react";
import { transformStateFunc as ke, isDeepEqual as L, isFunction as z, getNestedValue as B, getDifferences as ue, debounce as Ne } from "./utility.js";
import { pushFunc as le, updateFn as Q, cutFunc as te, ValidationWrapper as be, FormControlComponent as Ce } from "./Functions.jsx";
import Pe from "superjson";
import { v4 as ge } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as ve } from "./store.js";
import { useCogsConfig as Ee } from "./CogsStateClient.jsx";
import { applyPatch as _e } from "fast-json-patch";
function he(e, s) {
  const h = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, y = h(e) || {};
  g(e, {
    ...y,
    ...s
  });
}
function Ie({
  stateKey: e,
  options: s,
  initialOptionsPart: h
}) {
  const g = Y(e) || {}, y = h[e] || {}, $ = r.getState().setInitialStateOptions, T = { ...y, ...g };
  let w = !1;
  if (s)
    for (const i in s)
      T.hasOwnProperty(i) ? (i == "localStorage" && s[i] && T[i].key !== s[i]?.key && (w = !0, T[i] = s[i]), i == "initialState" && s[i] && T[i] !== s[i] && // Different references
      !L(T[i], s[i]) && (w = !0, T[i] = s[i])) : (w = !0, T[i] = s[i]);
  w && $(e, T);
}
function Ke(e, { formElements: s, validation: h }) {
  return { initialState: e, formElements: s, validation: h };
}
const et = (e, s) => {
  let h = e;
  const [g, y] = ke(h);
  (Object.keys(y).length > 0 || s && Object.keys(s).length > 0) && Object.keys(y).forEach((w) => {
    y[w] = y[w] || {}, y[w].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...y[w].formElements || {}
      // State-specific overrides
    }, Y(w) || r.getState().setInitialStateOptions(w, y[w]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const $ = (w, i) => {
    const [v] = K(i?.componentId ?? ge());
    Ie({
      stateKey: w,
      options: i,
      initialOptionsPart: y
    });
    const o = r.getState().cogsStateStore[w] || g[w], S = i?.modifyState ? i.modifyState(o) : o, [W, R] = De(
      S,
      {
        stateKey: w,
        syncUpdate: i?.syncUpdate,
        componentId: v,
        localStorage: i?.localStorage,
        middleware: i?.middleware,
        enabledSync: i?.enabledSync,
        reactiveType: i?.reactiveType,
        reactiveDeps: i?.reactiveDeps,
        initialState: i?.initialState,
        dependencies: i?.dependencies,
        serverState: i?.serverState
      }
    );
    return R;
  };
  function T(w, i) {
    Ie({ stateKey: w, options: i, initialOptionsPart: y }), i.localStorage && Fe(w, i), se(w);
  }
  return { useCogsState: $, setCogsOptions: T };
}, {
  setUpdaterState: re,
  setState: J,
  getInitialOptions: Y,
  getKeyState: Ae,
  getValidationErrors: Me,
  setStateLog: Oe,
  updateInitialStateGlobal: fe,
  addValidationError: Re,
  removeValidationError: q,
  setServerSyncActions: je
} = r.getState(), pe = (e, s, h, g, y) => {
  h?.log && console.log(
    "saving to localstorage",
    s,
    h.localStorage?.key,
    g
  );
  const $ = z(h?.localStorage?.key) ? h.localStorage?.key(e) : h?.localStorage?.key;
  if ($ && g) {
    const T = `${g}-${s}-${$}`;
    let w;
    try {
      w = ie(T)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? w
    }, v = Pe.serialize(i);
    window.localStorage.setItem(
      T,
      JSON.stringify(v.json)
    );
  }
}, ie = (e) => {
  if (!e) return null;
  try {
    const s = window.localStorage.getItem(e);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, Fe = (e, s) => {
  const h = r.getState().cogsStateStore[e], { sessionId: g } = Ee(), y = z(s?.localStorage?.key) ? s.localStorage.key(h) : s?.localStorage?.key;
  if (y && g) {
    const $ = ie(
      `${g}-${e}-${y}`
    );
    if ($ && $.lastUpdated > ($.lastSyncedWithServer || 0))
      return J(e, $.state), se(e), !0;
  }
  return !1;
}, $e = (e, s, h, g, y, $) => {
  const T = {
    initialState: s,
    updaterState: oe(
      e,
      g,
      y,
      $
    ),
    state: h
  };
  fe(e, T.initialState), re(e, T.updaterState), J(e, T.state);
}, se = (e) => {
  const s = r.getState().stateComponents.get(e);
  if (!s) return;
  const h = /* @__PURE__ */ new Set();
  s.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || h.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((g) => g());
  });
}, tt = (e, s) => {
  const h = r.getState().stateComponents.get(e);
  if (h) {
    const g = `${e}////${s}`, y = h.components.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Ue = (e, s, h, g) => {
  switch (e) {
    case "update":
      return {
        oldValue: B(s, g),
        newValue: B(h, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: B(h, g)
      };
    case "cut":
      return {
        oldValue: B(s, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function De(e, {
  stateKey: s,
  serverSync: h,
  localStorage: g,
  formElements: y,
  reactiveDeps: $,
  reactiveType: T,
  componentId: w,
  initialState: i,
  syncUpdate: v,
  dependencies: o,
  serverState: S
} = {}) {
  const [W, R] = K({}), { sessionId: j } = Ee();
  let G = !s;
  const [m] = K(s ?? ge()), l = r.getState().stateLog[m], ee = Z(/* @__PURE__ */ new Set()), H = Z(w ?? ge()), M = Z(
    null
  );
  M.current = Y(m) ?? null, ne(() => {
    if (v && v.stateKey === m && v.path?.[0]) {
      J(m, (n) => ({
        ...n,
        [v.path[0]]: v.newValue
      }));
      const t = `${v.stateKey}:${v.path.join(".")}`;
      r.getState().setSyncInfo(t, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), ne(() => {
    if (i) {
      he(m, {
        initialState: i
      });
      const t = M.current, a = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = r.getState().initialStateGlobal[m];
      if (!(c && !L(c, i) || !c) && !a)
        return;
      let d = null;
      const V = z(t?.localStorage?.key) ? t?.localStorage?.key(i) : t?.localStorage?.key;
      V && j && (d = ie(`${j}-${m}-${V}`));
      let p = i, A = !1;
      const x = a ? Date.now() : 0, N = d?.lastUpdated || 0, O = d?.lastSyncedWithServer || 0;
      a && x > N ? (p = t.serverState.data, A = !0) : d && N > O && (p = d.state, t?.localStorage?.onChange && t?.localStorage?.onChange(p)), $e(
        m,
        i,
        p,
        X,
        H.current,
        j
      ), A && V && j && pe(p, m, t, j, Date.now()), se(m), (Array.isArray(T) ? T : [T || "component"]).includes("none") || R({});
    }
  }, [
    i,
    S?.status,
    S?.data,
    ...o || []
  ]), de(() => {
    G && he(m, {
      serverSync: h,
      formElements: y,
      initialState: i,
      localStorage: g,
      middleware: M.current?.middleware
    });
    const t = `${m}////${H.current}`, n = r.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(t, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: $ || void 0,
      reactiveType: T ?? ["component", "deps"]
    }), r.getState().stateComponents.set(m, n), R({}), () => {
      const a = `${m}////${H.current}`;
      n && (n.components.delete(a), n.components.size === 0 && r.getState().stateComponents.delete(m));
    };
  }, []);
  const X = (t, n, a, c) => {
    if (Array.isArray(n)) {
      const f = `${m}-${n.join(".")}`;
      ee.current.add(f);
    }
    J(m, (f) => {
      const d = z(t) ? t(f) : t, V = `${m}-${n.join(".")}`;
      if (V) {
        let _ = !1, I = r.getState().signalDomElements.get(V);
        if ((!I || I.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const k = n.slice(0, -1), C = B(d, k);
          if (Array.isArray(C)) {
            _ = !0;
            const E = `${m}-${k.join(".")}`;
            I = r.getState().signalDomElements.get(E);
          }
        }
        if (I) {
          const k = _ ? B(d, n.slice(0, -1)) : B(d, n);
          I.forEach(({ parentId: C, position: E, effect: b }) => {
            const P = document.querySelector(
              `[data-parent-id="${C}"]`
            );
            if (P) {
              const U = Array.from(P.childNodes);
              if (U[E]) {
                const F = b ? new Function("state", `return (${b})(state)`)(k) : k;
                U[E].textContent = String(F);
              }
            }
          });
        }
      }
      a.updateType === "update" && (c || M.current?.validation?.key) && n && q(
        (c || M.current?.validation?.key) + "." + n.join(".")
      );
      const p = n.slice(0, n.length - 1);
      a.updateType === "cut" && M.current?.validation?.key && q(
        M.current?.validation?.key + "." + p.join(".")
      ), a.updateType === "insert" && M.current?.validation?.key && Me(
        M.current?.validation?.key + "." + p.join(".")
      ).filter(([I, k]) => {
        let C = I?.split(".").length;
        if (I == p.join(".") && C == p.length - 1) {
          let E = I + "." + p;
          q(I), Re(E, k);
        }
      });
      const A = r.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", A), A) {
        const _ = ue(f, d), I = new Set(_), k = a.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          C,
          E
        ] of A.components.entries()) {
          let b = !1;
          const P = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (console.log("component", E), !P.includes("none")) {
            if (P.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if (P.includes("component") && ((E.paths.has(k) || E.paths.has("")) && (b = !0), !b))
              for (const U of I) {
                let F = U;
                for (; ; ) {
                  if (E.paths.has(F)) {
                    b = !0;
                    break;
                  }
                  const ce = F.lastIndexOf(".");
                  if (ce !== -1) {
                    const Se = F.substring(
                      0,
                      ce
                    );
                    if (!isNaN(
                      Number(F.substring(ce + 1))
                    ) && E.paths.has(Se)) {
                      b = !0;
                      break;
                    }
                    F = Se;
                  } else
                    F = "";
                  if (F === "")
                    break;
                }
                if (b) break;
              }
            if (!b && P.includes("deps") && E.depsFunction) {
              const U = E.depsFunction(d);
              let F = !1;
              typeof U == "boolean" ? U && (F = !0) : L(E.deps, U) || (E.deps = U, F = !0), F && (b = !0);
            }
            b && E.forceUpdate();
          }
        }
      }
      const x = Date.now();
      n = n.map((_, I) => {
        const k = n.slice(0, -1), C = B(d, k);
        return I === n.length - 1 && ["insert", "cut"].includes(a.updateType) ? (C.length - 1).toString() : _;
      });
      const { oldValue: N, newValue: O } = Ue(
        a.updateType,
        f,
        d,
        n
      ), D = {
        timeStamp: x,
        stateKey: m,
        path: n,
        updateType: a.updateType,
        status: "new",
        oldValue: N,
        newValue: O
      };
      if (Oe(m, (_) => {
        const k = [..._ ?? [], D].reduce((C, E) => {
          const b = `${E.stateKey}:${JSON.stringify(E.path)}`, P = C.get(b);
          return P ? (P.timeStamp = Math.max(P.timeStamp, E.timeStamp), P.newValue = E.newValue, P.oldValue = P.oldValue ?? E.oldValue, P.updateType = E.updateType) : C.set(b, { ...E }), C;
        }, /* @__PURE__ */ new Map());
        return Array.from(k.values());
      }), pe(
        d,
        m,
        M.current,
        j
      ), M.current?.middleware && M.current.middleware({
        updateLog: l,
        update: D
      }), M.current?.serverSync) {
        const _ = r.getState().serverState[m], I = M.current?.serverSync;
        je(m, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: d }),
          rollBackState: _,
          actionTimeStamp: Date.now() + (I.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return d;
    });
  };
  r.getState().updaterState[m] || (re(
    m,
    oe(
      m,
      X,
      H.current,
      j
    )
  ), r.getState().cogsStateStore[m] || J(m, e), r.getState().initialStateGlobal[m] || fe(m, e));
  const u = Te(() => oe(
    m,
    X,
    H.current,
    j
  ), [m, j]);
  return [Ae(m), u];
}
function oe(e, s, h, g) {
  const y = /* @__PURE__ */ new Map();
  let $ = 0;
  const T = (v) => {
    const o = v.join(".");
    for (const [S] of y)
      (S === o || S.startsWith(o + ".")) && y.delete(S);
    $++;
  }, w = {
    removeValidation: (v) => {
      v?.validationKey && q(v.validationKey);
    },
    revertToInitialState: (v) => {
      const o = r.getState().getInitialOptions(e)?.validation;
      o?.key && q(o?.key), v?.validationKey && q(v.validationKey);
      const S = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), y.clear(), $++;
      const W = i(S, []), R = Y(e), j = z(R?.localStorage?.key) ? R?.localStorage?.key(S) : R?.localStorage?.key, G = `${g}-${e}-${j}`;
      G && localStorage.removeItem(G), re(e, W), J(e, S);
      const m = r.getState().stateComponents.get(e);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), $++;
      const o = oe(
        e,
        s,
        h,
        g
      ), S = r.getState().initialStateGlobal[e], W = Y(e), R = z(W?.localStorage?.key) ? W?.localStorage?.key(S) : W?.localStorage?.key, j = `${g}-${e}-${R}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), Ve(() => {
        fe(e, v), re(e, o), J(e, v);
        const G = r.getState().stateComponents.get(e);
        G && G.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (G) => o.get()[G]
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
  function i(v, o = [], S) {
    const W = o.map(String).join(".");
    y.get(W);
    const R = function() {
      return r().getNestedState(e, o);
    };
    Object.keys(w).forEach((m) => {
      R[m] = w[m];
    });
    const j = {
      apply(m, l, ee) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${o.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, o);
      },
      get(m, l) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
        const ee = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !ee.has(l)) {
          const u = `${e}////${h}`, t = r.getState().stateComponents.get(e);
          if (t) {
            const n = t.components.get(u);
            if (n && !n.paths.has("")) {
              const a = o.join(".");
              let c = !0;
              for (const f of n.paths)
                if (a.startsWith(f) && (a === f || a[f.length] === ".")) {
                  c = !1;
                  break;
                }
              c && n.paths.add(a);
            }
          }
        }
        if (l === "getDifferences")
          return () => ue(
            r.getState().cogsStateStore[e],
            r.getState().initialStateGlobal[e]
          );
        if (l === "sync" && o.length === 0)
          return async function() {
            const u = r.getState().getInitialOptions(e), t = u?.sync;
            if (!t)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const n = r.getState().getNestedState(e, []), a = u?.validation?.key;
            try {
              const c = await t.action(n);
              if (c && !c.success && c.errors && a) {
                r.getState().removeValidationError(a), c.errors.forEach((d) => {
                  const V = [a, ...d.path].join(".");
                  r.getState().addValidationError(V, d.message);
                });
                const f = r.getState().stateComponents.get(e);
                f && f.components.forEach((d) => {
                  d.forceUpdate();
                });
              }
              return c?.success && t.onSuccess ? t.onSuccess(c.data) : !c?.success && t.onError && t.onError(c.error), c;
            } catch (c) {
              return t.onError && t.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const u = r.getState().getNestedState(e, o), t = r.getState().initialStateGlobal[e], n = B(t, o);
          return L(u, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const u = r().getNestedState(
              e,
              o
            ), t = r.getState().initialStateGlobal[e], n = B(t, o);
            return L(u, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const u = r.getState().initialStateGlobal[e], t = Y(e), n = z(t?.localStorage?.key) ? t?.localStorage?.key(u) : t?.localStorage?.key, a = `${g}-${e}-${n}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const u = r.getState().getInitialOptions(e)?.validation;
            if (!u?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(u.key + "." + o.join("."));
          };
        if (Array.isArray(v)) {
          const u = () => S?.validIndices ? v.map((n, a) => ({
            item: n,
            originalIndex: S.validIndices[a]
          })) : r.getState().getNestedState(e, o).map((n, a) => ({
            item: n,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const t = r.getState().getSelectedIndex(e, o.join("."));
              if (t !== void 0)
                return i(
                  v[t],
                  [...o, t.toString()],
                  S
                );
            };
          if (l === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: e, path: o });
            };
          if (l === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(e, o.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (t) => {
              const {
                itemHeight: n,
                overscan: a = 5,
                stickToBottom: c = !1
              } = t;
              if (typeof n != "number" || n <= 0)
                throw new Error(
                  "[cogs-state] `useVirtualView` requires a positive number for `itemHeight` option."
                );
              const f = Z(null), [d, V] = K({
                startIndex: 0,
                endIndex: 50
              }), p = Z(!0), A = r().getNestedState(
                e,
                o
              ), x = A.length, N = Te(() => {
                const I = Array.from(
                  { length: d.endIndex - d.startIndex },
                  (C, E) => d.startIndex + E
                ).filter((C) => C < x), k = I.map((C) => A[C]);
                return i(k, o, {
                  ...S,
                  validIndices: I
                });
              }, [d.startIndex, d.endIndex, A]);
              de(() => {
                const I = f.current;
                if (!I) return;
                let k;
                const C = () => {
                  const { scrollTop: b, clientHeight: P } = I, U = Math.max(
                    0,
                    Math.floor(b / n) - a
                  ), F = Math.min(
                    x,
                    Math.ceil((b + P) / n) + a
                  );
                  V({ startIndex: U, endIndex: F });
                }, E = () => {
                  const { scrollTop: b, scrollHeight: P, clientHeight: U } = I;
                  p.current = P - b - U < 5, console.log(
                    "isAtBottomRef",
                    p.current,
                    b,
                    P,
                    U
                  ), clearTimeout(k), k = setTimeout(C, 10);
                };
                if (I.addEventListener("scroll", E, {
                  passive: !0
                }), c && x > 0) {
                  const b = Math.max(
                    0,
                    x - Math.ceil(I.clientHeight / n) - a
                  );
                  V({ startIndex: b, endIndex: x }), requestAnimationFrame(() => {
                    I.scrollTop = I.scrollHeight, p.current = !0;
                  });
                } else
                  C();
                return () => {
                  clearTimeout(k), I.removeEventListener("scroll", E);
                };
              }, [x, n, a, c]), ne(() => {
                if (c && f.current && p.current) {
                  const I = f.current;
                  I.scrollTo({
                    top: I.scrollHeight,
                    behavior: "smooth"
                  });
                }
              }, [x, c]);
              const O = ye(
                (I = "smooth") => {
                  f.current && f.current.scrollTo({
                    top: f.current.scrollHeight,
                    behavior: I
                  });
                },
                []
              ), D = ye(
                (I, k = "smooth") => {
                  f.current && f.current.scrollTo({
                    top: I * n,
                    behavior: k
                  });
                },
                [n]
              ), _ = {
                outer: {
                  ref: f,
                  style: {
                    overflowY: "auto",
                    height: "100%",
                    position: "relative"
                  }
                },
                inner: {
                  style: {
                    height: `${x * n}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    paddingTop: `${d.startIndex * n}px`
                  }
                }
              };
              return {
                virtualState: N,
                virtualizerProps: _,
                scrollToBottom: O,
                scrollToIndex: D
              };
            };
          if (l === "stateSort")
            return (t) => {
              const a = [...u()].sort(
                (d, V) => t(d.item, V.item)
              ), c = a.map(({ item: d }) => d), f = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: d }) => d
                )
              };
              return i(c, o, f);
            };
          if (l === "stateFilter")
            return (t) => {
              const a = u().filter(
                ({ item: d }, V) => t(d, V)
              ), c = a.map(({ item: d }) => d), f = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: d }) => d
                )
              };
              return i(c, o, f);
            };
          if (l === "stateMap")
            return (t) => {
              const n = r.getState().getNestedState(e, o);
              return Array.isArray(n) ? (S?.validIndices || Array.from({ length: n.length }, (c, f) => f)).map((c, f) => {
                const d = n[c], V = [...o, c.toString()], p = i(d, V, S);
                return t(d, p, {
                  register: () => {
                    const [, x] = K({}), N = `${h}-${o.join(".")}-${c}`;
                    de(() => {
                      const O = `${e}////${N}`, D = r.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set(O, {
                        forceUpdate: () => x({}),
                        paths: /* @__PURE__ */ new Set([V.join(".")])
                      }), r.getState().stateComponents.set(e, D), () => {
                        const _ = r.getState().stateComponents.get(e);
                        _ && _.components.delete(O);
                      };
                    }, [e, N]);
                  },
                  index: f,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${o.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (t) => v.map((a, c) => {
              let f;
              S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
              const d = [...o, f.toString()], V = i(a, d, S);
              return t(
                a,
                V,
                c,
                v,
                i(v, o, S)
              );
            });
          if (l === "$stateMap")
            return (t) => ae(We, {
              proxy: {
                _stateKey: e,
                _path: o,
                _mapFn: t
                // Pass the actual function, not string
              },
              rebuildStateShape: i
            });
          if (l === "stateFlattenOn")
            return (t) => {
              const n = v;
              y.clear(), $++;
              const a = n.flatMap(
                (c) => c[t] ?? []
              );
              return i(
                a,
                [...o, "[*]", t],
                S
              );
            };
          if (l === "index")
            return (t) => {
              const n = v[t];
              return i(n, [...o, t.toString()]);
            };
          if (l === "last")
            return () => {
              const t = r.getState().getNestedState(e, o);
              if (t.length === 0) return;
              const n = t.length - 1, a = t[n], c = [...o, n.toString()];
              return i(a, c);
            };
          if (l === "insert")
            return (t) => (T(o), le(s, t, o, e), i(
              r.getState().getNestedState(e, o),
              o
            ));
          if (l === "uniqueInsert")
            return (t, n, a) => {
              const c = r.getState().getNestedState(e, o), f = z(t) ? t(c) : t;
              let d = null;
              if (!c.some((p) => {
                if (n) {
                  const x = n.every(
                    (N) => L(p[N], f[N])
                  );
                  return x && (d = p), x;
                }
                const A = L(p, f);
                return A && (d = p), A;
              }))
                T(o), le(s, f, o, e);
              else if (a && d) {
                const p = a(d), A = c.map(
                  (x) => L(x, d) ? p : x
                );
                T(o), Q(s, A, o);
              }
            };
          if (l === "cut")
            return (t, n) => {
              if (!n?.waitForSync)
                return T(o), te(s, o, e, t), i(
                  r.getState().getNestedState(e, o),
                  o
                );
            };
          if (l === "cutByValue")
            return (t) => {
              for (let n = 0; n < v.length; n++)
                v[n] === t && te(s, o, e, n);
            };
          if (l === "toggleByValue")
            return (t) => {
              const n = v.findIndex((a) => a === t);
              n > -1 ? te(s, o, e, n) : le(s, t, o, e);
            };
          if (l === "stateFind")
            return (t) => {
              const a = u().find(
                ({ item: f }, d) => t(f, d)
              );
              if (!a) return;
              const c = [...o, a.originalIndex.toString()];
              return i(a.item, c, S);
            };
          if (l === "findWith")
            return (t, n) => {
              const c = u().find(
                ({ item: d }) => d[t] === n
              );
              if (!c) return;
              const f = [...o, c.originalIndex.toString()];
              return i(c.item, f, S);
            };
        }
        const H = o[o.length - 1];
        if (!isNaN(Number(H))) {
          const u = o.slice(0, -1), t = r.getState().getNestedState(e, u);
          if (Array.isArray(t) && l === "cut")
            return () => te(
              s,
              u,
              e,
              Number(H)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(v)) {
              const u = r.getState().getNestedState(e, o);
              return S.validIndices.map((t) => u[t]);
            }
            return r.getState().getNestedState(e, o);
          };
        if (l === "$derive")
          return (u) => we({
            _stateKey: e,
            _path: o,
            _effect: u.toString()
          });
        if (l === "$get")
          return () => we({
            _stateKey: e,
            _path: o
          });
        if (l === "lastSynced") {
          const u = `${e}:${o.join(".")}`;
          return r.getState().getSyncInfo(u);
        }
        if (l == "getLocalStorage")
          return (u) => ie(g + "-" + e + "-" + u);
        if (l === "_selected") {
          const u = o.slice(0, -1), t = u.join("."), n = r.getState().getNestedState(e, u);
          return Array.isArray(n) ? Number(o[o.length - 1]) === r.getState().getSelectedIndex(e, t) : void 0;
        }
        if (l === "setSelected")
          return (u) => {
            const t = o.slice(0, -1), n = Number(o[o.length - 1]), a = t.join(".");
            u ? r.getState().setSelectedIndex(e, a, n) : r.getState().setSelectedIndex(e, a, void 0);
            const c = r.getState().getNestedState(e, [...t]);
            Q(s, c, t), T(t);
          };
        if (l === "toggleSelected")
          return () => {
            const u = o.slice(0, -1), t = Number(o[o.length - 1]), n = u.join("."), a = r.getState().getSelectedIndex(e, n);
            r.getState().setSelectedIndex(
              e,
              n,
              a === t ? void 0 : t
            );
            const c = r.getState().getNestedState(e, [...u]);
            Q(s, c, u), T(u);
          };
        if (o.length == 0) {
          if (l === "applyJsonPatch")
            return (u) => {
              const t = r.getState().cogsStateStore[e], a = _e(t, u).newDocument;
              $e(
                e,
                r.getState().initialStateGlobal[e],
                a,
                s,
                h,
                g
              );
              const c = r.getState().stateComponents.get(e);
              if (c) {
                const f = ue(t, a), d = new Set(f);
                for (const [
                  V,
                  p
                ] of c.components.entries()) {
                  let A = !1;
                  const x = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!x.includes("none")) {
                    if (x.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (x.includes("component") && (p.paths.has("") && (A = !0), !A))
                      for (const N of d) {
                        if (p.paths.has(N)) {
                          A = !0;
                          break;
                        }
                        let O = N.lastIndexOf(".");
                        for (; O !== -1; ) {
                          const D = N.substring(0, O);
                          if (p.paths.has(D)) {
                            A = !0;
                            break;
                          }
                          const _ = N.substring(
                            O + 1
                          );
                          if (!isNaN(Number(_))) {
                            const I = D.lastIndexOf(".");
                            if (I !== -1) {
                              const k = D.substring(
                                0,
                                I
                              );
                              if (p.paths.has(k)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          O = D.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && x.includes("deps") && p.depsFunction) {
                      const N = p.depsFunction(a);
                      let O = !1;
                      typeof N == "boolean" ? N && (O = !0) : L(p.deps, N) || (p.deps = N, O = !0), O && (A = !0);
                    }
                    A && p.forceUpdate();
                  }
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const u = r.getState().getInitialOptions(e)?.validation, t = r.getState().addValidationError;
              if (!u?.zodSchema)
                throw new Error("Zod schema not found");
              if (!u?.key)
                throw new Error("Validation key not found");
              q(u.key);
              const n = r.getState().cogsStateStore[e];
              try {
                const a = r.getState().getValidationErrors(u.key);
                a && a.length > 0 && a.forEach(([f]) => {
                  f && f.startsWith(u.key) && q(f);
                });
                const c = u.zodSchema.safeParse(n);
                return c.success ? !0 : (c.error.errors.forEach((d) => {
                  const V = d.path, p = d.message, A = [u.key, ...V].join(".");
                  t(A, p);
                }), se(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return h;
          if (l === "getComponents")
            return () => r().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => ve.getState().getFormRefsByStateKey(e);
          if (l === "_initialState")
            return r.getState().initialStateGlobal[e];
          if (l === "_serverState")
            return r.getState().serverState[e];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[e];
          if (l === "revertToInitialState")
            return w.revertToInitialState;
          if (l === "updateInitialState") return w.updateInitialState;
          if (l === "removeValidation") return w.removeValidation;
        }
        if (l === "getFormRef")
          return () => ve.getState().getFormRef(e + "." + o.join("."));
        if (l === "validationWrapper")
          return ({
            children: u,
            hideMessage: t
          }) => /* @__PURE__ */ me(
            be,
            {
              formOpts: t ? { validation: { message: "" } } : void 0,
              path: o,
              validationKey: r.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: S?.validIndices,
              children: u
            }
          );
        if (l === "_stateKey") return e;
        if (l === "_path") return o;
        if (l === "_isServerSynced") return w._isServerSynced;
        if (l === "update")
          return (u, t) => {
            if (t?.debounce)
              Ne(() => {
                Q(s, u, o, "");
                const n = r.getState().getNestedState(e, o);
                t?.afterUpdate && t.afterUpdate(n);
              }, t.debounce);
            else {
              Q(s, u, o, "");
              const n = r.getState().getNestedState(e, o);
              t?.afterUpdate && t.afterUpdate(n);
            }
            T(o);
          };
        if (l === "formElement")
          return (u, t) => /* @__PURE__ */ me(
            Ce,
            {
              setState: s,
              stateKey: e,
              path: o,
              child: u,
              formOpts: t
            }
          );
        const M = [...o, l], X = r.getState().getNestedState(e, M);
        return i(X, M, S);
      }
    }, G = new Proxy(R, j);
    return y.set(W, {
      proxy: G,
      stateVersion: $
    }), G;
  }
  return i(
    r.getState().getNestedState(e, [])
  );
}
function we(e) {
  return ae(Ge, { proxy: e });
}
function We({
  proxy: e,
  rebuildStateShape: s
}) {
  const h = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(h) ? s(
    h,
    e._path
  ).stateMapNoRender(
    (y, $, T, w, i) => e._mapFn(y, $, T, w, i)
  ) : null;
}
function Ge({
  proxy: e
}) {
  const s = Z(null), h = `${e._stateKey}-${e._path.join(".")}`;
  return ne(() => {
    const g = s.current;
    if (!g || !g.parentElement) return;
    const y = g.parentElement, T = Array.from(y.childNodes).indexOf(g);
    let w = y.getAttribute("data-parent-id");
    w || (w = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", w));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: w,
      position: T,
      effect: e._effect
    };
    r.getState().addSignalElement(h, v);
    const o = r.getState().getNestedState(e._stateKey, e._path);
    let S;
    if (e._effect)
      try {
        S = new Function(
          "state",
          `return (${e._effect})(state)`
        )(o);
      } catch (R) {
        console.error("Error evaluating effect function during mount:", R), S = o;
      }
    else
      S = o;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const W = document.createTextNode(String(S));
    g.replaceWith(W);
  }, [e._stateKey, e._path.join("."), e._effect]), ae("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function nt(e) {
  const s = xe(
    (h) => {
      const g = r.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(e._stateKey, {
        forceUpdate: h,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => g.components.delete(e._stateKey);
    },
    () => r.getState().getNestedState(e._stateKey, e._path)
  );
  return ae("text", {}, String(s));
}
export {
  we as $cogsSignal,
  nt as $cogsSignalStore,
  Ke as addStateOptions,
  et as createCogsState,
  tt as notifyComponent,
  De as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
