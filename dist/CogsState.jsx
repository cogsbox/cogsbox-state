"use client";
import { jsx as me } from "react/jsx-runtime";
import { useState as K, useRef as Q, useEffect as ne, useLayoutEffect as de, useMemo as Ee, createElement as ae, useSyncExternalStore as xe, startTransition as Ve, useCallback as ye } from "react";
import { transformStateFunc as ke, isDeepEqual as G, isFunction as z, getNestedValue as L, getDifferences as ue, debounce as Ne } from "./utility.js";
import { pushFunc as le, updateFn as X, cutFunc as te, ValidationWrapper as be, FormControlComponent as Ce } from "./Functions.jsx";
import Pe from "superjson";
import { v4 as ge } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as ve } from "./store.js";
import { useCogsConfig as Te } from "./CogsStateClient.jsx";
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
  const g = Z(e) || {}, y = h[e] || {}, x = r.getState().setInitialStateOptions, E = { ...y, ...g };
  let I = !1;
  if (s)
    for (const i in s)
      E.hasOwnProperty(i) ? (i == "localStorage" && s[i] && E[i].key !== s[i]?.key && (I = !0, E[i] = s[i]), i == "initialState" && s[i] && E[i] !== s[i] && // Different references
      !G(E[i], s[i]) && (I = !0, E[i] = s[i])) : (I = !0, E[i] = s[i]);
  I && x(e, E);
}
function Ke(e, { formElements: s, validation: h }) {
  return { initialState: e, formElements: s, validation: h };
}
const et = (e, s) => {
  let h = e;
  const [g, y] = ke(h);
  (Object.keys(y).length > 0 || s && Object.keys(s).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, Z(I) || r.getState().setInitialStateOptions(I, y[I]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const x = (I, i) => {
    const [v] = K(i?.componentId ?? ge());
    Ie({
      stateKey: I,
      options: i,
      initialOptionsPart: y
    });
    const o = r.getState().cogsStateStore[I] || g[I], S = i?.modifyState ? i.modifyState(o) : o, [D, O] = De(
      S,
      {
        stateKey: I,
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
    return O;
  };
  function E(I, i) {
    Ie({ stateKey: I, options: i, initialOptionsPart: y }), i.localStorage && Fe(I, i), se(I);
  }
  return { useCogsState: x, setCogsOptions: E };
}, {
  setUpdaterState: re,
  setState: J,
  getInitialOptions: Z,
  getKeyState: $e,
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
  const x = z(h?.localStorage?.key) ? h.localStorage?.key(e) : h?.localStorage?.key;
  if (x && g) {
    const E = `${g}-${s}-${x}`;
    let I;
    try {
      I = ie(E)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Pe.serialize(i);
    window.localStorage.setItem(
      E,
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
  const h = r.getState().cogsStateStore[e], { sessionId: g } = Te(), y = z(s?.localStorage?.key) ? s.localStorage.key(h) : s?.localStorage?.key;
  if (y && g) {
    const x = ie(
      `${g}-${e}-${y}`
    );
    if (x && x.lastUpdated > (x.lastSyncedWithServer || 0))
      return J(e, x.state), se(e), !0;
  }
  return !1;
}, Ae = (e, s, h, g, y, x) => {
  const E = {
    initialState: s,
    updaterState: oe(
      e,
      g,
      y,
      x
    ),
    state: h
  };
  fe(e, E.initialState), re(e, E.updaterState), J(e, E.state);
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
        oldValue: L(s, g),
        newValue: L(h, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: L(h, g)
      };
    case "cut":
      return {
        oldValue: L(s, g),
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
  reactiveDeps: x,
  reactiveType: E,
  componentId: I,
  initialState: i,
  syncUpdate: v,
  dependencies: o,
  serverState: S
} = {}) {
  const [D, O] = K({}), { sessionId: R } = Te();
  let W = !s;
  const [m] = K(s ?? ge()), l = r.getState().stateLog[m], ee = Q(/* @__PURE__ */ new Set()), H = Q(I ?? ge()), P = Q(
    null
  );
  P.current = Z(m) ?? null, ne(() => {
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
      const t = P.current, a = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = r.getState().initialStateGlobal[m];
      if (!(c && !G(c, i) || !c) && !a)
        return;
      let d = null;
      const V = z(t?.localStorage?.key) ? t?.localStorage?.key(i) : t?.localStorage?.key;
      V && R && (d = ie(`${R}-${m}-${V}`));
      let p = i, T = !1;
      const C = a ? Date.now() : 0, N = d?.lastUpdated || 0, _ = d?.lastSyncedWithServer || 0;
      a && C > N ? (p = t.serverState.data, T = !0) : d && N > _ && (p = d.state, t?.localStorage?.onChange && t?.localStorage?.onChange(p)), Ae(
        m,
        i,
        p,
        Y,
        H.current,
        R
      ), T && V && R && pe(p, m, t, R, Date.now()), se(m), (Array.isArray(E) ? E : [E || "component"]).includes("none") || O({});
    }
  }, [
    i,
    S?.status,
    S?.data,
    ...o || []
  ]), de(() => {
    W && he(m, {
      serverSync: h,
      formElements: y,
      initialState: i,
      localStorage: g,
      middleware: P.current?.middleware
    });
    const t = `${m}////${H.current}`, n = r.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(t, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: x || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), r.getState().stateComponents.set(m, n), O({}), () => {
      const a = `${m}////${H.current}`;
      n && (n.components.delete(a), n.components.size === 0 && r.getState().stateComponents.delete(m));
    };
  }, []);
  const Y = (t, n, a, c) => {
    if (Array.isArray(n)) {
      const f = `${m}-${n.join(".")}`;
      ee.current.add(f);
    }
    J(m, (f) => {
      const d = z(t) ? t(f) : t, V = `${m}-${n.join(".")}`;
      if (V) {
        let w = !1, $ = r.getState().signalDomElements.get(V);
        if ((!$ || $.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const k = n.slice(0, -1), b = L(d, k);
          if (Array.isArray(b)) {
            w = !0;
            const A = `${m}-${k.join(".")}`;
            $ = r.getState().signalDomElements.get(A);
          }
        }
        if ($) {
          const k = w ? L(d, n.slice(0, -1)) : L(d, n);
          $.forEach(({ parentId: b, position: A, effect: j }) => {
            const M = document.querySelector(
              `[data-parent-id="${b}"]`
            );
            if (M) {
              const B = Array.from(M.childNodes);
              if (B[A]) {
                const U = j ? new Function("state", `return (${j})(state)`)(k) : k;
                B[A].textContent = String(U);
              }
            }
          });
        }
      }
      a.updateType === "update" && (c || P.current?.validation?.key) && n && q(
        (c || P.current?.validation?.key) + "." + n.join(".")
      );
      const p = n.slice(0, n.length - 1);
      a.updateType === "cut" && P.current?.validation?.key && q(
        P.current?.validation?.key + "." + p.join(".")
      ), a.updateType === "insert" && P.current?.validation?.key && Me(
        P.current?.validation?.key + "." + p.join(".")
      ).filter(([$, k]) => {
        let b = $?.split(".").length;
        if ($ == p.join(".") && b == p.length - 1) {
          let A = $ + "." + p;
          q($), Re(A, k);
        }
      });
      const T = r.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", T), T) {
        const w = ue(f, d), $ = new Set(w), k = a.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          b,
          A
        ] of T.components.entries()) {
          let j = !1;
          const M = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (console.log("component", A), !M.includes("none")) {
            if (M.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if (M.includes("component") && ((A.paths.has(k) || A.paths.has("")) && (j = !0), !j))
              for (const B of $) {
                let U = B;
                for (; ; ) {
                  if (A.paths.has(U)) {
                    j = !0;
                    break;
                  }
                  const ce = U.lastIndexOf(".");
                  if (ce !== -1) {
                    const Se = U.substring(
                      0,
                      ce
                    );
                    if (!isNaN(
                      Number(U.substring(ce + 1))
                    ) && A.paths.has(Se)) {
                      j = !0;
                      break;
                    }
                    U = Se;
                  } else
                    U = "";
                  if (U === "")
                    break;
                }
                if (j) break;
              }
            if (!j && M.includes("deps") && A.depsFunction) {
              const B = A.depsFunction(d);
              let U = !1;
              typeof B == "boolean" ? B && (U = !0) : G(A.deps, B) || (A.deps = B, U = !0), U && (j = !0);
            }
            j && A.forceUpdate();
          }
        }
      }
      const C = Date.now();
      n = n.map((w, $) => {
        const k = n.slice(0, -1), b = L(d, k);
        return $ === n.length - 1 && ["insert", "cut"].includes(a.updateType) ? (b.length - 1).toString() : w;
      });
      const { oldValue: N, newValue: _ } = Ue(
        a.updateType,
        f,
        d,
        n
      ), F = {
        timeStamp: C,
        stateKey: m,
        path: n,
        updateType: a.updateType,
        status: "new",
        oldValue: N,
        newValue: _
      };
      if (Oe(m, (w) => {
        const k = [...w ?? [], F].reduce((b, A) => {
          const j = `${A.stateKey}:${JSON.stringify(A.path)}`, M = b.get(j);
          return M ? (M.timeStamp = Math.max(M.timeStamp, A.timeStamp), M.newValue = A.newValue, M.oldValue = M.oldValue ?? A.oldValue, M.updateType = A.updateType) : b.set(j, { ...A }), b;
        }, /* @__PURE__ */ new Map());
        return Array.from(k.values());
      }), pe(
        d,
        m,
        P.current,
        R
      ), P.current?.middleware && P.current.middleware({
        updateLog: l,
        update: F
      }), P.current?.serverSync) {
        const w = r.getState().serverState[m], $ = P.current?.serverSync;
        je(m, {
          syncKey: typeof $.syncKey == "string" ? $.syncKey : $.syncKey({ state: d }),
          rollBackState: w,
          actionTimeStamp: Date.now() + ($.debounce ?? 3e3),
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
      Y,
      H.current,
      R
    )
  ), r.getState().cogsStateStore[m] || J(m, e), r.getState().initialStateGlobal[m] || fe(m, e));
  const u = Ee(() => oe(
    m,
    Y,
    H.current,
    R
  ), [m, R]);
  return [$e(m), u];
}
function oe(e, s, h, g) {
  const y = /* @__PURE__ */ new Map();
  let x = 0;
  const E = (v) => {
    const o = v.join(".");
    for (const [S] of y)
      (S === o || S.startsWith(o + ".")) && y.delete(S);
    x++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && q(v.validationKey);
    },
    revertToInitialState: (v) => {
      const o = r.getState().getInitialOptions(e)?.validation;
      o?.key && q(o?.key), v?.validationKey && q(v.validationKey);
      const S = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), y.clear(), x++;
      const D = i(S, []), O = Z(e), R = z(O?.localStorage?.key) ? O?.localStorage?.key(S) : O?.localStorage?.key, W = `${g}-${e}-${R}`;
      W && localStorage.removeItem(W), re(e, D), J(e, S);
      const m = r.getState().stateComponents.get(e);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), x++;
      const o = oe(
        e,
        s,
        h,
        g
      ), S = r.getState().initialStateGlobal[e], D = Z(e), O = z(D?.localStorage?.key) ? D?.localStorage?.key(S) : D?.localStorage?.key, R = `${g}-${e}-${O}`;
      return localStorage.getItem(R) && localStorage.removeItem(R), Ve(() => {
        fe(e, v), re(e, o), J(e, v);
        const W = r.getState().stateComponents.get(e);
        W && W.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (W) => o.get()[W]
      };
    },
    _initialState: r.getState().initialStateGlobal[e],
    _serverState: r.getState().serverState[e],
    _isLoading: r.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const v = r.getState().serverState[e];
      return !!(v && G(v, $e(e)));
    }
  };
  function i(v, o = [], S) {
    const D = o.map(String).join(".");
    y.get(D);
    const O = function() {
      return r().getNestedState(e, o);
    };
    Object.keys(I).forEach((m) => {
      O[m] = I[m];
    });
    const R = {
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
          const u = r.getState().getNestedState(e, o), t = r.getState().initialStateGlobal[e], n = L(t, o);
          return G(u, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const u = r().getNestedState(
              e,
              o
            ), t = r.getState().initialStateGlobal[e], n = L(t, o);
            return G(u, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const u = r.getState().initialStateGlobal[e], t = Z(e), n = z(t?.localStorage?.key) ? t?.localStorage?.key(u) : t?.localStorage?.key, a = `${g}-${e}-${n}`;
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
              const f = Q(null), [d, V] = K({
                startIndex: 0,
                endIndex: 50
              }), p = r().getNestedState(
                e,
                o
              ), T = p.length, C = Ee(() => {
                const w = Array.from(
                  { length: d.endIndex - d.startIndex },
                  (k, b) => d.startIndex + b
                ).filter((k) => k < T), $ = w.map((k) => p[k]);
                return i($, o, {
                  ...S,
                  validIndices: w
                });
              }, [d.startIndex, d.endIndex, p]);
              de(() => {
                const w = f.current;
                if (!w) return;
                const $ = () => {
                  const { scrollTop: b, clientHeight: A } = w, j = Math.max(
                    0,
                    Math.floor(b / n) - a
                  ), M = Math.min(
                    T,
                    Math.ceil((b + A) / n) + a
                  );
                  V({ startIndex: j, endIndex: M });
                }, k = () => {
                  $();
                };
                if (w.addEventListener("scroll", k, {
                  passive: !0
                }), c && T > 0) {
                  const b = Math.max(
                    0,
                    T - Math.ceil(w.clientHeight / n) - a
                  );
                  V({ startIndex: b, endIndex: T }), setTimeout(() => {
                    w.scrollTop = w.scrollHeight;
                  }, 0);
                } else
                  $();
                return () => {
                  w.removeEventListener("scroll", k);
                };
              }, [T, n, a, c]), ne(() => {
                if (c && f.current) {
                  const w = f.current;
                  w.scrollHeight - w.scrollTop - w.clientHeight && (w.scrollTop = w.scrollHeight);
                }
              }, [T]);
              const N = ye(
                (w = "smooth") => {
                  f.current && (f.current.scrollTop = f.current.scrollHeight);
                },
                []
              ), _ = ye(
                (w, $ = "smooth") => {
                  f.current && f.current.scrollTo({
                    top: w * n,
                    behavior: $
                  });
                },
                [n]
              ), F = {
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
                    height: `${T * n}px`,
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
                virtualState: C,
                virtualizerProps: F,
                scrollToBottom: N,
                scrollToIndex: _
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
                    const [, C] = K({}), N = `${h}-${o.join(".")}-${c}`;
                    de(() => {
                      const _ = `${e}////${N}`, F = r.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return F.components.set(_, {
                        forceUpdate: () => C({}),
                        paths: /* @__PURE__ */ new Set([V.join(".")])
                      }), r.getState().stateComponents.set(e, F), () => {
                        const w = r.getState().stateComponents.get(e);
                        w && w.components.delete(_);
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
              y.clear(), x++;
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
            return (t) => (E(o), le(s, t, o, e), i(
              r.getState().getNestedState(e, o),
              o
            ));
          if (l === "uniqueInsert")
            return (t, n, a) => {
              const c = r.getState().getNestedState(e, o), f = z(t) ? t(c) : t;
              let d = null;
              if (!c.some((p) => {
                if (n) {
                  const C = n.every(
                    (N) => G(p[N], f[N])
                  );
                  return C && (d = p), C;
                }
                const T = G(p, f);
                return T && (d = p), T;
              }))
                E(o), le(s, f, o, e);
              else if (a && d) {
                const p = a(d), T = c.map(
                  (C) => G(C, d) ? p : C
                );
                E(o), X(s, T, o);
              }
            };
          if (l === "cut")
            return (t, n) => {
              if (!n?.waitForSync)
                return E(o), te(s, o, e, t), i(
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
            X(s, c, t), E(t);
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
            X(s, c, u), E(u);
          };
        if (o.length == 0) {
          if (l === "applyJsonPatch")
            return (u) => {
              const t = r.getState().cogsStateStore[e], a = _e(t, u).newDocument;
              Ae(
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
                  let T = !1;
                  const C = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!C.includes("none")) {
                    if (C.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (C.includes("component") && (p.paths.has("") && (T = !0), !T))
                      for (const N of d) {
                        if (p.paths.has(N)) {
                          T = !0;
                          break;
                        }
                        let _ = N.lastIndexOf(".");
                        for (; _ !== -1; ) {
                          const F = N.substring(0, _);
                          if (p.paths.has(F)) {
                            T = !0;
                            break;
                          }
                          const w = N.substring(
                            _ + 1
                          );
                          if (!isNaN(Number(w))) {
                            const $ = F.lastIndexOf(".");
                            if ($ !== -1) {
                              const k = F.substring(
                                0,
                                $
                              );
                              if (p.paths.has(k)) {
                                T = !0;
                                break;
                              }
                            }
                          }
                          _ = F.lastIndexOf(".");
                        }
                        if (T) break;
                      }
                    if (!T && C.includes("deps") && p.depsFunction) {
                      const N = p.depsFunction(a);
                      let _ = !1;
                      typeof N == "boolean" ? N && (_ = !0) : G(p.deps, N) || (p.deps = N, _ = !0), _ && (T = !0);
                    }
                    T && p.forceUpdate();
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
                  const V = d.path, p = d.message, T = [u.key, ...V].join(".");
                  t(T, p);
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
            return I.revertToInitialState;
          if (l === "updateInitialState") return I.updateInitialState;
          if (l === "removeValidation") return I.removeValidation;
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
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (u, t) => {
            if (t?.debounce)
              Ne(() => {
                X(s, u, o, "");
                const n = r.getState().getNestedState(e, o);
                t?.afterUpdate && t.afterUpdate(n);
              }, t.debounce);
            else {
              X(s, u, o, "");
              const n = r.getState().getNestedState(e, o);
              t?.afterUpdate && t.afterUpdate(n);
            }
            E(o);
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
        const P = [...o, l], Y = r.getState().getNestedState(e, P);
        return i(Y, P, S);
      }
    }, W = new Proxy(O, R);
    return y.set(D, {
      proxy: W,
      stateVersion: x
    }), W;
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
    (y, x, E, I, i) => e._mapFn(y, x, E, I, i)
  ) : null;
}
function Ge({
  proxy: e
}) {
  const s = Q(null), h = `${e._stateKey}-${e._path.join(".")}`;
  return ne(() => {
    const g = s.current;
    if (!g || !g.parentElement) return;
    const y = g.parentElement, E = Array.from(y.childNodes).indexOf(g);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: E,
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
      } catch (O) {
        console.error("Error evaluating effect function during mount:", O), S = o;
      }
    else
      S = o;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const D = document.createTextNode(String(S));
    g.replaceWith(D);
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
