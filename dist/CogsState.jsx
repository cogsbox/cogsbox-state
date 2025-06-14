"use client";
import { jsx as Ie } from "react/jsx-runtime";
import { useState as X, useRef as J, useEffect as ae, useLayoutEffect as oe, useMemo as Se, createElement as ce, useSyncExternalStore as be, startTransition as Ae, useCallback as ge } from "react";
import { transformStateFunc as Ne, isDeepEqual as L, isFunction as z, getNestedValue as B, getDifferences as me, debounce as Pe } from "./utility.js";
import { pushFunc as fe, updateFn as te, cutFunc as re, ValidationWrapper as Ce, FormControlComponent as _e } from "./Functions.jsx";
import Oe from "superjson";
import { v4 as ye } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as pe } from "./store.js";
import { useCogsConfig as Ve } from "./CogsStateClient.jsx";
import { applyPatch as Re } from "fast-json-patch";
function we(e, i) {
  const v = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, y = v(e) || {};
  g(e, {
    ...y,
    ...i
  });
}
function Ee({
  stateKey: e,
  options: i,
  initialOptionsPart: v
}) {
  const g = Q(e) || {}, y = v[e] || {}, k = r.getState().setInitialStateOptions, E = { ...y, ...g };
  let I = !1;
  if (i)
    for (const s in i)
      E.hasOwnProperty(s) ? (s == "localStorage" && i[s] && E[s].key !== i[s]?.key && (I = !0, E[s] = i[s]), s == "initialState" && i[s] && E[s] !== i[s] && // Different references
      !L(E[s], i[s]) && (I = !0, E[s] = i[s])) : (I = !0, E[s] = i[s]);
  I && k(e, E);
}
function tt(e, { formElements: i, validation: v }) {
  return { initialState: e, formElements: i, validation: v };
}
const nt = (e, i) => {
  let v = e;
  const [g, y] = Ne(v);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, Q(I) || r.getState().setInitialStateOptions(I, y[I]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const k = (I, s) => {
    const [h] = X(s?.componentId ?? ye());
    Ee({
      stateKey: I,
      options: s,
      initialOptionsPart: y
    });
    const o = r.getState().cogsStateStore[I] || g[I], f = s?.modifyState ? s.modifyState(o) : o, [W, R] = Ge(
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
    return R;
  };
  function E(I, s) {
    Ee({ stateKey: I, options: s, initialOptionsPart: y }), s.localStorage && De(I, s), de(I);
  }
  return { useCogsState: k, setCogsOptions: E };
}, {
  setUpdaterState: se,
  setState: Y,
  getInitialOptions: Q,
  getKeyState: ke,
  getValidationErrors: Me,
  setStateLog: je,
  updateInitialStateGlobal: ve,
  addValidationError: Fe,
  removeValidationError: q,
  setServerSyncActions: Ue
} = r.getState(), $e = (e, i, v, g, y) => {
  v?.log && console.log(
    "saving to localstorage",
    i,
    v.localStorage?.key,
    g
  );
  const k = z(v?.localStorage?.key) ? v.localStorage?.key(e) : v?.localStorage?.key;
  if (k && g) {
    const E = `${g}-${i}-${k}`;
    let I;
    try {
      I = le(E)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, h = Oe.serialize(s);
    window.localStorage.setItem(
      E,
      JSON.stringify(h.json)
    );
  }
}, le = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, De = (e, i) => {
  const v = r.getState().cogsStateStore[e], { sessionId: g } = Ve(), y = z(i?.localStorage?.key) ? i.localStorage.key(v) : i?.localStorage?.key;
  if (y && g) {
    const k = le(
      `${g}-${e}-${y}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return Y(e, k.state), de(e), !0;
  }
  return !1;
}, xe = (e, i, v, g, y, k) => {
  const E = {
    initialState: i,
    updaterState: ie(
      e,
      g,
      y,
      k
    ),
    state: v
  };
  ve(e, E.initialState), se(e, E.updaterState), Y(e, E.state);
}, de = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const v = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || v.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    v.forEach((g) => g());
  });
}, rt = (e, i) => {
  const v = r.getState().stateComponents.get(e);
  if (v) {
    const g = `${e}////${i}`, y = v.components.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, We = (e, i, v, g) => {
  switch (e) {
    case "update":
      return {
        oldValue: B(i, g),
        newValue: B(v, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: B(v, g)
      };
    case "cut":
      return {
        oldValue: B(i, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Ge(e, {
  stateKey: i,
  serverSync: v,
  localStorage: g,
  formElements: y,
  reactiveDeps: k,
  reactiveType: E,
  componentId: I,
  initialState: s,
  syncUpdate: h,
  dependencies: o,
  serverState: f
} = {}) {
  const [W, R] = X({}), { sessionId: M } = Ve();
  let G = !i;
  const [m] = X(i ?? ye()), l = r.getState().stateLog[m], ne = J(/* @__PURE__ */ new Set()), H = J(I ?? ye()), _ = J(
    null
  );
  _.current = Q(m) ?? null, ae(() => {
    if (h && h.stateKey === m && h.path?.[0]) {
      Y(m, (n) => ({
        ...n,
        [h.path[0]]: h.newValue
      }));
      const t = `${h.stateKey}:${h.path.join(".")}`;
      r.getState().setSyncInfo(t, {
        timeStamp: h.timeStamp,
        userId: h.userId
      });
    }
  }, [h]), ae(() => {
    if (s) {
      we(m, {
        initialState: s
      });
      const t = _.current, a = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = r.getState().initialStateGlobal[m];
      if (!(c && !L(c, s) || !c) && !a)
        return;
      let u = null;
      const T = z(t?.localStorage?.key) ? t?.localStorage?.key(s) : t?.localStorage?.key;
      T && M && (u = le(`${M}-${m}-${T}`));
      let p = s, V = !1;
      const C = a ? Date.now() : 0, x = u?.lastUpdated || 0, A = u?.lastSyncedWithServer || 0;
      a && C > x ? (p = t.serverState.data, V = !0) : u && x > A && (p = u.state, t?.localStorage?.onChange && t?.localStorage?.onChange(p)), xe(
        m,
        s,
        p,
        K,
        H.current,
        M
      ), V && T && M && $e(p, m, t, M, Date.now()), de(m), (Array.isArray(E) ? E : [E || "component"]).includes("none") || R({});
    }
  }, [
    s,
    f?.status,
    f?.data,
    ...o || []
  ]), oe(() => {
    G && we(m, {
      serverSync: v,
      formElements: y,
      initialState: s,
      localStorage: g,
      middleware: _.current?.middleware
    });
    const t = `${m}////${H.current}`, n = r.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(t, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), r.getState().stateComponents.set(m, n), R({}), () => {
      const a = `${m}////${H.current}`;
      n && (n.components.delete(a), n.components.size === 0 && r.getState().stateComponents.delete(m));
    };
  }, []);
  const K = (t, n, a, c) => {
    if (Array.isArray(n)) {
      const S = `${m}-${n.join(".")}`;
      ne.current.add(S);
    }
    Y(m, (S) => {
      const u = z(t) ? t(S) : t, T = `${m}-${n.join(".")}`;
      if (T) {
        let j = !1, b = r.getState().signalDomElements.get(T);
        if ((!b || b.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const N = n.slice(0, -1), F = B(u, N);
          if (Array.isArray(F)) {
            j = !0;
            const $ = `${m}-${N.join(".")}`;
            b = r.getState().signalDomElements.get($);
          }
        }
        if (b) {
          const N = j ? B(u, n.slice(0, -1)) : B(u, n);
          b.forEach(({ parentId: F, position: $, effect: U }) => {
            const w = document.querySelector(
              `[data-parent-id="${F}"]`
            );
            if (w) {
              const O = Array.from(w.childNodes);
              if (O[$]) {
                const P = U ? new Function("state", `return (${U})(state)`)(N) : N;
                O[$].textContent = String(P);
              }
            }
          });
        }
      }
      a.updateType === "update" && (c || _.current?.validation?.key) && n && q(
        (c || _.current?.validation?.key) + "." + n.join(".")
      );
      const p = n.slice(0, n.length - 1);
      a.updateType === "cut" && _.current?.validation?.key && q(
        _.current?.validation?.key + "." + p.join(".")
      ), a.updateType === "insert" && _.current?.validation?.key && Me(
        _.current?.validation?.key + "." + p.join(".")
      ).filter(([b, N]) => {
        let F = b?.split(".").length;
        if (b == p.join(".") && F == p.length - 1) {
          let $ = b + "." + p;
          q(b), Fe($, N);
        }
      });
      const V = r.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", V), V) {
        const j = me(S, u), b = new Set(j), N = a.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          F,
          $
        ] of V.components.entries()) {
          let U = !1;
          const w = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !w.includes("none")) {
            if (w.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (w.includes("component") && (($.paths.has(N) || $.paths.has("")) && (U = !0), !U))
              for (const O of b) {
                let P = O;
                for (; ; ) {
                  if ($.paths.has(P)) {
                    U = !0;
                    break;
                  }
                  const Z = P.lastIndexOf(".");
                  if (Z !== -1) {
                    const ee = P.substring(
                      0,
                      Z
                    );
                    if (!isNaN(
                      Number(P.substring(Z + 1))
                    ) && $.paths.has(ee)) {
                      U = !0;
                      break;
                    }
                    P = ee;
                  } else
                    P = "";
                  if (P === "")
                    break;
                }
                if (U) break;
              }
            if (!U && w.includes("deps") && $.depsFunction) {
              const O = $.depsFunction(u);
              let P = !1;
              typeof O == "boolean" ? O && (P = !0) : L($.deps, O) || ($.deps = O, P = !0), P && (U = !0);
            }
            U && $.forceUpdate();
          }
        }
      }
      const C = Date.now();
      n = n.map((j, b) => {
        const N = n.slice(0, -1), F = B(u, N);
        return b === n.length - 1 && ["insert", "cut"].includes(a.updateType) ? (F.length - 1).toString() : j;
      });
      const { oldValue: x, newValue: A } = We(
        a.updateType,
        S,
        u,
        n
      ), D = {
        timeStamp: C,
        stateKey: m,
        path: n,
        updateType: a.updateType,
        status: "new",
        oldValue: x,
        newValue: A
      };
      if (je(m, (j) => {
        const N = [...j ?? [], D].reduce((F, $) => {
          const U = `${$.stateKey}:${JSON.stringify($.path)}`, w = F.get(U);
          return w ? (w.timeStamp = Math.max(w.timeStamp, $.timeStamp), w.newValue = $.newValue, w.oldValue = w.oldValue ?? $.oldValue, w.updateType = $.updateType) : F.set(U, { ...$ }), F;
        }, /* @__PURE__ */ new Map());
        return Array.from(N.values());
      }), $e(
        u,
        m,
        _.current,
        M
      ), _.current?.middleware && _.current.middleware({
        updateLog: l,
        update: D
      }), _.current?.serverSync) {
        const j = r.getState().serverState[m], b = _.current?.serverSync;
        Ue(m, {
          syncKey: typeof b.syncKey == "string" ? b.syncKey : b.syncKey({ state: u }),
          rollBackState: j,
          actionTimeStamp: Date.now() + (b.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return u;
    });
  };
  r.getState().updaterState[m] || (se(
    m,
    ie(
      m,
      K,
      H.current,
      M
    )
  ), r.getState().cogsStateStore[m] || Y(m, e), r.getState().initialStateGlobal[m] || ve(m, e));
  const d = Se(() => ie(
    m,
    K,
    H.current,
    M
  ), [m, M]);
  return [ke(m), d];
}
function ie(e, i, v, g) {
  const y = /* @__PURE__ */ new Map();
  let k = 0;
  const E = (h) => {
    const o = h.join(".");
    for (const [f] of y)
      (f === o || f.startsWith(o + ".")) && y.delete(f);
    k++;
  }, I = {
    removeValidation: (h) => {
      h?.validationKey && q(h.validationKey);
    },
    revertToInitialState: (h) => {
      const o = r.getState().getInitialOptions(e)?.validation;
      o?.key && q(o?.key), h?.validationKey && q(h.validationKey);
      const f = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), y.clear(), k++;
      const W = s(f, []), R = Q(e), M = z(R?.localStorage?.key) ? R?.localStorage?.key(f) : R?.localStorage?.key, G = `${g}-${e}-${M}`;
      G && localStorage.removeItem(G), se(e, W), Y(e, f);
      const m = r.getState().stateComponents.get(e);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), f;
    },
    updateInitialState: (h) => {
      y.clear(), k++;
      const o = ie(
        e,
        i,
        v,
        g
      ), f = r.getState().initialStateGlobal[e], W = Q(e), R = z(W?.localStorage?.key) ? W?.localStorage?.key(f) : W?.localStorage?.key, M = `${g}-${e}-${R}`;
      return localStorage.getItem(M) && localStorage.removeItem(M), Ae(() => {
        ve(e, h), se(e, o), Y(e, h);
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
      const h = r.getState().serverState[e];
      return !!(h && L(h, ke(e)));
    }
  };
  function s(h, o = [], f) {
    const W = o.map(String).join(".");
    y.get(W);
    const R = function() {
      return r().getNestedState(e, o);
    };
    Object.keys(I).forEach((m) => {
      R[m] = I[m];
    });
    const M = {
      apply(m, l, ne) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${o.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, o);
      },
      get(m, l) {
        f?.validIndices && !Array.isArray(h) && (f = { ...f, validIndices: void 0 });
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
          const d = `${e}////${v}`, t = r.getState().stateComponents.get(e);
          if (t) {
            const n = t.components.get(d);
            if (n && !n.paths.has("")) {
              const a = o.join(".");
              let c = !0;
              for (const S of n.paths)
                if (a.startsWith(S) && (a === S || a[S.length] === ".")) {
                  c = !1;
                  break;
                }
              c && n.paths.add(a);
            }
          }
        }
        if (l === "getDifferences")
          return () => me(
            r.getState().cogsStateStore[e],
            r.getState().initialStateGlobal[e]
          );
        if (l === "sync" && o.length === 0)
          return async function() {
            const d = r.getState().getInitialOptions(e), t = d?.sync;
            if (!t)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const n = r.getState().getNestedState(e, []), a = d?.validation?.key;
            try {
              const c = await t.action(n);
              if (c && !c.success && c.errors && a) {
                r.getState().removeValidationError(a), c.errors.forEach((u) => {
                  const T = [a, ...u.path].join(".");
                  r.getState().addValidationError(T, u.message);
                });
                const S = r.getState().stateComponents.get(e);
                S && S.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return c?.success && t.onSuccess ? t.onSuccess(c.data) : !c?.success && t.onError && t.onError(c.error), c;
            } catch (c) {
              return t.onError && t.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = r.getState().getNestedState(e, o), t = r.getState().initialStateGlobal[e], n = B(t, o);
          return L(d, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              e,
              o
            ), t = r.getState().initialStateGlobal[e], n = B(t, o);
            return L(d, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[e], t = Q(e), n = z(t?.localStorage?.key) ? t?.localStorage?.key(d) : t?.localStorage?.key, a = `${g}-${e}-${n}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = r.getState().getInitialOptions(e)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(d.key + "." + o.join("."));
          };
        if (Array.isArray(h)) {
          const d = () => f?.validIndices ? h.map((n, a) => ({
            item: n,
            originalIndex: f.validIndices[a]
          })) : r.getState().getNestedState(e, o).map((n, a) => ({
            item: n,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const t = r.getState().getSelectedIndex(e, o.join("."));
              if (t !== void 0)
                return s(
                  h[t],
                  [...o, t.toString()],
                  f
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
              const S = J(null), u = J(!0), [T, p] = X({
                startIndex: 0,
                endIndex: 0
              }), [V, C] = X(0), x = r().getNestedState(
                e,
                o
              ), A = x.length, D = A * n, j = J(A);
              ae(() => {
                j.current !== A && (j.current = A, C((w) => w + 1));
              }, [A]);
              const b = Se(() => s(
                x,
                // Use the actual current array
                o,
                f
              ).stateFilter((O, P) => P >= T.startIndex && P < T.endIndex), [
                T.startIndex,
                T.endIndex,
                V,
                x.length
              ]);
              oe(() => {
                const w = S.current;
                if (!w) return;
                const O = () => {
                  const ee = Math.max(
                    0,
                    Math.floor(w.scrollTop / n) - a
                  ), he = Math.min(
                    A,
                    Math.ceil(
                      (w.scrollTop + w.clientHeight) / n
                    ) + a
                  );
                  p((ue) => ue.startIndex === ee && ue.endIndex === he ? ue : { startIndex: ee, endIndex: he });
                }, P = () => {
                  u.current = w.scrollHeight > 0 && w.scrollHeight - w.scrollTop - w.clientHeight < 1, O();
                };
                O(), w.addEventListener("scroll", P, {
                  passive: !0
                });
                const Z = new ResizeObserver(P);
                return Z.observe(w), () => {
                  w.removeEventListener("scroll", P), Z.disconnect();
                };
              }, [A, n, a]);
              const N = ge(
                (w, O = "auto") => S.current?.scrollTo({ top: w, behavior: O }),
                []
              ), F = ge(
                (w = "smooth") => {
                  S.current && N(S.current.scrollHeight, w);
                },
                [N]
              ), $ = ge(
                (w, O = "smooth") => N(w * n, O),
                [N, n]
              );
              oe(() => {
                c && u.current && F("auto");
              }, [x, c, F]);
              const U = Se(
                () => ({
                  outer: {
                    ref: S,
                    style: {
                      overflowY: "auto",
                      position: "relative"
                    }
                  },
                  inner: {
                    style: {
                      position: "relative",
                      height: `${D}px`,
                      width: "100%"
                    }
                  },
                  list: {
                    style: {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${T.startIndex * n}px)`
                    }
                  }
                }),
                [D, T.startIndex, n]
              );
              return {
                virtualState: b,
                virtualizerProps: U,
                scrollToBottom: F,
                scrollToIndex: $
              };
            };
          if (l === "stateSort")
            return (t) => {
              const a = [...d()].sort(
                (u, T) => t(u.item, T.item)
              ), c = a.map(({ item: u }) => u), S = {
                ...f,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, o, S);
            };
          if (l === "stateFilter")
            return (t) => {
              const a = d().filter(
                ({ item: u }, T) => t(u, T)
              ), c = a.map(({ item: u }) => u), S = {
                ...f,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, o, S);
            };
          if (l === "stateMap")
            return (t) => {
              const n = r.getState().getNestedState(e, o);
              return Array.isArray(n) ? n.map((a, c) => {
                let S;
                f?.validIndices && f.validIndices[c] !== void 0 ? S = f.validIndices[c] : S = c;
                const u = [...o, S.toString()], T = s(a, u, f);
                return t(a, T, {
                  register: () => {
                    const [, V] = X({}), C = `${v}-${o.join(".")}-${S}`;
                    oe(() => {
                      const x = `${e}////${C}`, A = r.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return A.components.set(x, {
                        forceUpdate: () => V({}),
                        paths: /* @__PURE__ */ new Set([u.join(".")])
                        // ATOMIC: Subscribes only to this item's path.
                      }), r.getState().stateComponents.set(e, A), () => {
                        const D = r.getState().stateComponents.get(e);
                        D && D.components.delete(x);
                      };
                    }, [e, C]);
                  },
                  index: c,
                  originalIndex: S
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${o.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (t) => h.map((a, c) => {
              let S;
              f?.validIndices && f.validIndices[c] !== void 0 ? S = f.validIndices[c] : S = c;
              const u = [...o, S.toString()], T = s(a, u, f);
              return t(
                a,
                T,
                c,
                h,
                s(h, o, f)
              );
            });
          if (l === "$stateMap")
            return (t) => ce(Le, {
              proxy: {
                _stateKey: e,
                _path: o,
                _mapFn: t
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateFlattenOn")
            return (t) => {
              const n = h;
              y.clear(), k++;
              const a = n.flatMap(
                (c) => c[t] ?? []
              );
              return s(
                a,
                [...o, "[*]", t],
                f
              );
            };
          if (l === "index")
            return (t) => {
              const n = h[t];
              return s(n, [...o, t.toString()]);
            };
          if (l === "last")
            return () => {
              const t = r.getState().getNestedState(e, o);
              if (t.length === 0) return;
              const n = t.length - 1, a = t[n], c = [...o, n.toString()];
              return s(a, c);
            };
          if (l === "insert")
            return (t) => (E(o), fe(i, t, o, e), s(
              r.getState().getNestedState(e, o),
              o
            ));
          if (l === "uniqueInsert")
            return (t, n, a) => {
              const c = r.getState().getNestedState(e, o), S = z(t) ? t(c) : t;
              let u = null;
              if (!c.some((p) => {
                if (n) {
                  const C = n.every(
                    (x) => L(p[x], S[x])
                  );
                  return C && (u = p), C;
                }
                const V = L(p, S);
                return V && (u = p), V;
              }))
                E(o), fe(i, S, o, e);
              else if (a && u) {
                const p = a(u), V = c.map(
                  (C) => L(C, u) ? p : C
                );
                E(o), te(i, V, o);
              }
            };
          if (l === "cut")
            return (t, n) => {
              if (!n?.waitForSync)
                return E(o), re(i, o, e, t), s(
                  r.getState().getNestedState(e, o),
                  o
                );
            };
          if (l === "cutByValue")
            return (t) => {
              for (let n = 0; n < h.length; n++)
                h[n] === t && re(i, o, e, n);
            };
          if (l === "toggleByValue")
            return (t) => {
              const n = h.findIndex((a) => a === t);
              n > -1 ? re(i, o, e, n) : fe(i, t, o, e);
            };
          if (l === "stateFind")
            return (t) => {
              const a = d().find(
                ({ item: S }, u) => t(S, u)
              );
              if (!a) return;
              const c = [...o, a.originalIndex.toString()];
              return s(a.item, c, f);
            };
          if (l === "findWith")
            return (t, n) => {
              const c = d().find(
                ({ item: u }) => u[t] === n
              );
              if (!c) return;
              const S = [...o, c.originalIndex.toString()];
              return s(c.item, S, f);
            };
        }
        const H = o[o.length - 1];
        if (!isNaN(Number(H))) {
          const d = o.slice(0, -1), t = r.getState().getNestedState(e, d);
          if (Array.isArray(t) && l === "cut")
            return () => re(
              i,
              d,
              e,
              Number(H)
            );
        }
        if (l === "get")
          return () => r.getState().getNestedState(e, o);
        if (l === "$derive")
          return (d) => Te({
            _stateKey: e,
            _path: o,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Te({
            _stateKey: e,
            _path: o
          });
        if (l === "lastSynced") {
          const d = `${e}:${o.join(".")}`;
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => le(g + "-" + e + "-" + d);
        if (l === "_selected") {
          const d = o.slice(0, -1), t = d.join("."), n = r.getState().getNestedState(e, d);
          return Array.isArray(n) ? Number(o[o.length - 1]) === r.getState().getSelectedIndex(e, t) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const t = o.slice(0, -1), n = Number(o[o.length - 1]), a = t.join(".");
            d ? r.getState().setSelectedIndex(e, a, n) : r.getState().setSelectedIndex(e, a, void 0);
            const c = r.getState().getNestedState(e, [...t]);
            te(i, c, t), E(t);
          };
        if (l === "toggleSelected")
          return () => {
            const d = o.slice(0, -1), t = Number(o[o.length - 1]), n = d.join("."), a = r.getState().getSelectedIndex(e, n);
            r.getState().setSelectedIndex(
              e,
              n,
              a === t ? void 0 : t
            );
            const c = r.getState().getNestedState(e, [...d]);
            te(i, c, d), E(d);
          };
        if (o.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const t = r.getState().cogsStateStore[e], a = Re(t, d).newDocument;
              xe(
                e,
                r.getState().initialStateGlobal[e],
                a,
                i,
                v,
                g
              );
              const c = r.getState().stateComponents.get(e);
              if (c) {
                const S = me(t, a), u = new Set(S);
                for (const [
                  T,
                  p
                ] of c.components.entries()) {
                  let V = !1;
                  const C = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!C.includes("none")) {
                    if (C.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (C.includes("component") && (p.paths.has("") && (V = !0), !V))
                      for (const x of u) {
                        if (p.paths.has(x)) {
                          V = !0;
                          break;
                        }
                        let A = x.lastIndexOf(".");
                        for (; A !== -1; ) {
                          const D = x.substring(0, A);
                          if (p.paths.has(D)) {
                            V = !0;
                            break;
                          }
                          const j = x.substring(
                            A + 1
                          );
                          if (!isNaN(Number(j))) {
                            const b = D.lastIndexOf(".");
                            if (b !== -1) {
                              const N = D.substring(
                                0,
                                b
                              );
                              if (p.paths.has(N)) {
                                V = !0;
                                break;
                              }
                            }
                          }
                          A = D.lastIndexOf(".");
                        }
                        if (V) break;
                      }
                    if (!V && C.includes("deps") && p.depsFunction) {
                      const x = p.depsFunction(a);
                      let A = !1;
                      typeof x == "boolean" ? x && (A = !0) : L(p.deps, x) || (p.deps = x, A = !0), A && (V = !0);
                    }
                    V && p.forceUpdate();
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
                const a = r.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([S]) => {
                  S && S.startsWith(d.key) && q(S);
                });
                const c = d.zodSchema.safeParse(n);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const T = u.path, p = u.message, V = [d.key, ...T].join(".");
                  t(V, p);
                }), de(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return v;
          if (l === "getComponents")
            return () => r().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => pe.getState().getFormRefsByStateKey(e);
          if (l === "_initialState")
            return r.getState().initialStateGlobal[e];
          if (l === "_serverState")
            return r.getState().serverState[e];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[e];
          if (l === "revertToInitialState")
            return I.revertToInitialState;
          if (l === "updateInitialState") return I.updateInitialState;
          if (l === "removeValidation") return I.removeValidation;
        }
        if (l === "getFormRef")
          return () => pe.getState().getFormRef(e + "." + o.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: t
          }) => /* @__PURE__ */ Ie(
            Ce,
            {
              formOpts: t ? { validation: { message: "" } } : void 0,
              path: o,
              validationKey: r.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: f?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return e;
        if (l === "_path") return o;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (d, t) => {
            if (t?.debounce)
              Pe(() => {
                te(i, d, o, "");
                const n = r.getState().getNestedState(e, o);
                t?.afterUpdate && t.afterUpdate(n);
              }, t.debounce);
            else {
              te(i, d, o, "");
              const n = r.getState().getNestedState(e, o);
              t?.afterUpdate && t.afterUpdate(n);
            }
            E(o);
          };
        if (l === "formElement")
          return (d, t) => /* @__PURE__ */ Ie(
            _e,
            {
              setState: i,
              stateKey: e,
              path: o,
              child: d,
              formOpts: t
            }
          );
        const _ = [...o, l], K = r.getState().getNestedState(e, _);
        return s(K, _, f);
      }
    }, G = new Proxy(R, M);
    return y.set(W, {
      proxy: G,
      stateVersion: k
    }), G;
  }
  return s(
    r.getState().getNestedState(e, [])
  );
}
function Te(e) {
  return ce(Be, { proxy: e });
}
function Le({
  proxy: e,
  rebuildStateShape: i
}) {
  const v = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(v) ? i(
    v,
    e._path
  ).stateMapNoRender(
    (y, k, E, I, s) => e._mapFn(y, k, E, I, s)
  ) : null;
}
function Be({
  proxy: e
}) {
  const i = J(null), v = `${e._stateKey}-${e._path.join(".")}`;
  return ae(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const y = g.parentElement, E = Array.from(y.childNodes).indexOf(g);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const h = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: E,
      effect: e._effect
    };
    r.getState().addSignalElement(v, h);
    const o = r.getState().getNestedState(e._stateKey, e._path);
    let f;
    if (e._effect)
      try {
        f = new Function(
          "state",
          `return (${e._effect})(state)`
        )(o);
      } catch (R) {
        console.error("Error evaluating effect function during mount:", R), f = o;
      }
    else
      f = o;
    f !== null && typeof f == "object" && (f = JSON.stringify(f));
    const W = document.createTextNode(String(f));
    g.replaceWith(W);
  }, [e._stateKey, e._path.join("."), e._effect]), ce("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": v
  });
}
function ot(e) {
  const i = be(
    (v) => {
      const g = r.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(e._stateKey, {
        forceUpdate: v,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => g.components.delete(e._stateKey);
    },
    () => r.getState().getNestedState(e._stateKey, e._path)
  );
  return ce("text", {}, String(i));
}
export {
  Te as $cogsSignal,
  ot as $cogsSignalStore,
  tt as addStateOptions,
  nt as createCogsState,
  rt as notifyComponent,
  Ge as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
