"use client";
import { jsx as me } from "react/jsx-runtime";
import { useState as K, useRef as Z, useEffect as ne, useLayoutEffect as de, useMemo as Ee, createElement as ae, useSyncExternalStore as xe, startTransition as Ve, useCallback as ye } from "react";
import { transformStateFunc as ke, isDeepEqual as L, isFunction as z, getNestedValue as B, getDifferences as ue, debounce as Ne } from "./utility.js";
import { pushFunc as le, updateFn as Q, cutFunc as te, ValidationWrapper as be, FormControlComponent as Ce } from "./Functions.jsx";
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
  const g = Y(e) || {}, y = h[e] || {}, A = r.getState().setInitialStateOptions, T = { ...y, ...g };
  let p = !1;
  if (s)
    for (const i in s)
      T.hasOwnProperty(i) ? (i == "localStorage" && s[i] && T[i].key !== s[i]?.key && (p = !0, T[i] = s[i]), i == "initialState" && s[i] && T[i] !== s[i] && // Different references
      !L(T[i], s[i]) && (p = !0, T[i] = s[i])) : (p = !0, T[i] = s[i]);
  p && A(e, T);
}
function Ke(e, { formElements: s, validation: h }) {
  return { initialState: e, formElements: s, validation: h };
}
const et = (e, s) => {
  let h = e;
  const [g, y] = ke(h);
  (Object.keys(y).length > 0 || s && Object.keys(s).length > 0) && Object.keys(y).forEach((p) => {
    y[p] = y[p] || {}, y[p].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...y[p].formElements || {}
      // State-specific overrides
    }, Y(p) || r.getState().setInitialStateOptions(p, y[p]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const A = (p, i) => {
    const [v] = K(i?.componentId ?? ge());
    Ie({
      stateKey: p,
      options: i,
      initialOptionsPart: y
    });
    const o = r.getState().cogsStateStore[p] || g[p], S = i?.modifyState ? i.modifyState(o) : o, [D, O] = De(
      S,
      {
        stateKey: p,
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
  function T(p, i) {
    Ie({ stateKey: p, options: i, initialOptionsPart: y }), i.localStorage && Fe(p, i), se(p);
  }
  return { useCogsState: A, setCogsOptions: T };
}, {
  setUpdaterState: re,
  setState: J,
  getInitialOptions: Y,
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
  const A = z(h?.localStorage?.key) ? h.localStorage?.key(e) : h?.localStorage?.key;
  if (A && g) {
    const T = `${g}-${s}-${A}`;
    let p;
    try {
      p = ie(T)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? p
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
  const h = r.getState().cogsStateStore[e], { sessionId: g } = Te(), y = z(s?.localStorage?.key) ? s.localStorage.key(h) : s?.localStorage?.key;
  if (y && g) {
    const A = ie(
      `${g}-${e}-${y}`
    );
    if (A && A.lastUpdated > (A.lastSyncedWithServer || 0))
      return J(e, A.state), se(e), !0;
  }
  return !1;
}, Ae = (e, s, h, g, y, A) => {
  const T = {
    initialState: s,
    updaterState: oe(
      e,
      g,
      y,
      A
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
  reactiveDeps: A,
  reactiveType: T,
  componentId: p,
  initialState: i,
  syncUpdate: v,
  dependencies: o,
  serverState: S
} = {}) {
  const [D, O] = K({}), { sessionId: R } = Te();
  let W = !s;
  const [m] = K(s ?? ge()), l = r.getState().stateLog[m], ee = Z(/* @__PURE__ */ new Set()), H = Z(p ?? ge()), P = Z(
    null
  );
  P.current = Y(m) ?? null, ne(() => {
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
      if (!(c && !L(c, i) || !c) && !a)
        return;
      let d = null;
      const V = z(t?.localStorage?.key) ? t?.localStorage?.key(i) : t?.localStorage?.key;
      V && R && (d = ie(`${R}-${m}-${V}`));
      let w = i, $ = !1;
      const x = a ? Date.now() : 0, N = d?.lastUpdated || 0, _ = d?.lastSyncedWithServer || 0;
      a && x > N ? (w = t.serverState.data, $ = !0) : d && N > _ && (w = d.state, t?.localStorage?.onChange && t?.localStorage?.onChange(w)), Ae(
        m,
        i,
        w,
        X,
        H.current,
        R
      ), $ && V && R && pe(w, m, t, R, Date.now()), se(m), (Array.isArray(T) ? T : [T || "component"]).includes("none") || O({});
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
      depsFunction: A || void 0,
      reactiveType: T ?? ["component", "deps"]
    }), r.getState().stateComponents.set(m, n), O({}), () => {
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
        let C = !1, I = r.getState().signalDomElements.get(V);
        if ((!I || I.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const k = n.slice(0, -1), b = B(d, k);
          if (Array.isArray(b)) {
            C = !0;
            const E = `${m}-${k.join(".")}`;
            I = r.getState().signalDomElements.get(E);
          }
        }
        if (I) {
          const k = C ? B(d, n.slice(0, -1)) : B(d, n);
          I.forEach(({ parentId: b, position: E, effect: j }) => {
            const M = document.querySelector(
              `[data-parent-id="${b}"]`
            );
            if (M) {
              const G = Array.from(M.childNodes);
              if (G[E]) {
                const U = j ? new Function("state", `return (${j})(state)`)(k) : k;
                G[E].textContent = String(U);
              }
            }
          });
        }
      }
      a.updateType === "update" && (c || P.current?.validation?.key) && n && q(
        (c || P.current?.validation?.key) + "." + n.join(".")
      );
      const w = n.slice(0, n.length - 1);
      a.updateType === "cut" && P.current?.validation?.key && q(
        P.current?.validation?.key + "." + w.join(".")
      ), a.updateType === "insert" && P.current?.validation?.key && Me(
        P.current?.validation?.key + "." + w.join(".")
      ).filter(([I, k]) => {
        let b = I?.split(".").length;
        if (I == w.join(".") && b == w.length - 1) {
          let E = I + "." + w;
          q(I), Re(E, k);
        }
      });
      const $ = r.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", $), $) {
        const C = ue(f, d), I = new Set(C), k = a.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          b,
          E
        ] of $.components.entries()) {
          let j = !1;
          const M = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (console.log("component", E), !M.includes("none")) {
            if (M.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if (M.includes("component") && ((E.paths.has(k) || E.paths.has("")) && (j = !0), !j))
              for (const G of I) {
                let U = G;
                for (; ; ) {
                  if (E.paths.has(U)) {
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
                    ) && E.paths.has(Se)) {
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
            if (!j && M.includes("deps") && E.depsFunction) {
              const G = E.depsFunction(d);
              let U = !1;
              typeof G == "boolean" ? G && (U = !0) : L(E.deps, G) || (E.deps = G, U = !0), U && (j = !0);
            }
            j && E.forceUpdate();
          }
        }
      }
      const x = Date.now();
      n = n.map((C, I) => {
        const k = n.slice(0, -1), b = B(d, k);
        return I === n.length - 1 && ["insert", "cut"].includes(a.updateType) ? (b.length - 1).toString() : C;
      });
      const { oldValue: N, newValue: _ } = Ue(
        a.updateType,
        f,
        d,
        n
      ), F = {
        timeStamp: x,
        stateKey: m,
        path: n,
        updateType: a.updateType,
        status: "new",
        oldValue: N,
        newValue: _
      };
      if (Oe(m, (C) => {
        const k = [...C ?? [], F].reduce((b, E) => {
          const j = `${E.stateKey}:${JSON.stringify(E.path)}`, M = b.get(j);
          return M ? (M.timeStamp = Math.max(M.timeStamp, E.timeStamp), M.newValue = E.newValue, M.oldValue = M.oldValue ?? E.oldValue, M.updateType = E.updateType) : b.set(j, { ...E }), b;
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
        const C = r.getState().serverState[m], I = P.current?.serverSync;
        je(m, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: d }),
          rollBackState: C,
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
      R
    )
  ), r.getState().cogsStateStore[m] || J(m, e), r.getState().initialStateGlobal[m] || fe(m, e));
  const u = Ee(() => oe(
    m,
    X,
    H.current,
    R
  ), [m, R]);
  return [$e(m), u];
}
function oe(e, s, h, g) {
  const y = /* @__PURE__ */ new Map();
  let A = 0;
  const T = (v) => {
    const o = v.join(".");
    for (const [S] of y)
      (S === o || S.startsWith(o + ".")) && y.delete(S);
    A++;
  }, p = {
    removeValidation: (v) => {
      v?.validationKey && q(v.validationKey);
    },
    revertToInitialState: (v) => {
      const o = r.getState().getInitialOptions(e)?.validation;
      o?.key && q(o?.key), v?.validationKey && q(v.validationKey);
      const S = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), y.clear(), A++;
      const D = i(S, []), O = Y(e), R = z(O?.localStorage?.key) ? O?.localStorage?.key(S) : O?.localStorage?.key, W = `${g}-${e}-${R}`;
      W && localStorage.removeItem(W), re(e, D), J(e, S);
      const m = r.getState().stateComponents.get(e);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), A++;
      const o = oe(
        e,
        s,
        h,
        g
      ), S = r.getState().initialStateGlobal[e], D = Y(e), O = z(D?.localStorage?.key) ? D?.localStorage?.key(S) : D?.localStorage?.key, R = `${g}-${e}-${O}`;
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
      return !!(v && L(v, $e(e)));
    }
  };
  function i(v, o = [], S) {
    const D = o.map(String).join(".");
    y.get(D);
    const O = function() {
      return r().getNestedState(e, o);
    };
    Object.keys(p).forEach((m) => {
      O[m] = p[m];
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
              }), w = Z(!0), $ = r().getNestedState(
                e,
                o
              ), x = $.length, N = Ee(() => {
                const I = Array.from(
                  { length: d.endIndex - d.startIndex },
                  (b, E) => d.startIndex + E
                ).filter((b) => b < x), k = I.map((b) => $[b]);
                return i(k, o, {
                  ...S,
                  validIndices: I
                });
              }, [d.startIndex, d.endIndex, $]);
              de(() => {
                const I = f.current;
                if (!I) return;
                const k = () => {
                  const { scrollTop: E, clientHeight: j } = I, M = Math.max(
                    0,
                    Math.floor(E / n) - a
                  ), G = Math.min(
                    x,
                    Math.ceil((E + j) / n) + a
                  );
                  V({ startIndex: M, endIndex: G });
                }, b = () => {
                  k();
                };
                if (I.addEventListener("scroll", b, {
                  passive: !0
                }), w.current && c && x > 0) {
                  w.current = !1;
                  const E = Math.max(
                    0,
                    x - Math.ceil(I.clientHeight / n) - a
                  );
                  V({ startIndex: E, endIndex: x }), setTimeout(() => {
                    I.scrollTop = I.scrollHeight;
                  }, 0);
                } else
                  k();
                return () => {
                  I.removeEventListener("scroll", b);
                };
              }, [x, n, a]), ne(() => {
                if (c && f.current && !w.current) {
                  const I = f.current;
                  I.scrollHeight - I.scrollTop - I.clientHeight < 100 && (I.scrollTop = I.scrollHeight);
                }
              }, [x]);
              const _ = ye(
                (I = "smooth") => {
                  f.current && (f.current.scrollTop = f.current.scrollHeight);
                },
                []
              ), F = ye(
                (I, k = "smooth") => {
                  f.current && f.current.scrollTo({
                    top: I * n,
                    behavior: k
                  });
                },
                [n]
              ), C = {
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
                virtualizerProps: C,
                scrollToBottom: _,
                scrollToIndex: F
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
                const d = n[c], V = [...o, c.toString()], w = i(d, V, S);
                return t(d, w, {
                  register: () => {
                    const [, x] = K({}), N = `${h}-${o.join(".")}-${c}`;
                    de(() => {
                      const _ = `${e}////${N}`, F = r.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return F.components.set(_, {
                        forceUpdate: () => x({}),
                        paths: /* @__PURE__ */ new Set([V.join(".")])
                      }), r.getState().stateComponents.set(e, F), () => {
                        const C = r.getState().stateComponents.get(e);
                        C && C.components.delete(_);
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
              y.clear(), A++;
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
              if (!c.some((w) => {
                if (n) {
                  const x = n.every(
                    (N) => L(w[N], f[N])
                  );
                  return x && (d = w), x;
                }
                const $ = L(w, f);
                return $ && (d = w), $;
              }))
                T(o), le(s, f, o, e);
              else if (a && d) {
                const w = a(d), $ = c.map(
                  (x) => L(x, d) ? w : x
                );
                T(o), Q(s, $, o);
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
                  w
                ] of c.components.entries()) {
                  let $ = !1;
                  const x = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!x.includes("none")) {
                    if (x.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (x.includes("component") && (w.paths.has("") && ($ = !0), !$))
                      for (const N of d) {
                        if (w.paths.has(N)) {
                          $ = !0;
                          break;
                        }
                        let _ = N.lastIndexOf(".");
                        for (; _ !== -1; ) {
                          const F = N.substring(0, _);
                          if (w.paths.has(F)) {
                            $ = !0;
                            break;
                          }
                          const C = N.substring(
                            _ + 1
                          );
                          if (!isNaN(Number(C))) {
                            const I = F.lastIndexOf(".");
                            if (I !== -1) {
                              const k = F.substring(
                                0,
                                I
                              );
                              if (w.paths.has(k)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          _ = F.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && x.includes("deps") && w.depsFunction) {
                      const N = w.depsFunction(a);
                      let _ = !1;
                      typeof N == "boolean" ? N && (_ = !0) : L(w.deps, N) || (w.deps = N, _ = !0), _ && ($ = !0);
                    }
                    $ && w.forceUpdate();
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
                  const V = d.path, w = d.message, $ = [u.key, ...V].join(".");
                  t($, w);
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
            return p.revertToInitialState;
          if (l === "updateInitialState") return p.updateInitialState;
          if (l === "removeValidation") return p.removeValidation;
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
        if (l === "_isServerSynced") return p._isServerSynced;
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
        const P = [...o, l], X = r.getState().getNestedState(e, P);
        return i(X, P, S);
      }
    }, W = new Proxy(O, R);
    return y.set(D, {
      proxy: W,
      stateVersion: A
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
    (y, A, T, p, i) => e._mapFn(y, A, T, p, i)
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
    let p = y.getAttribute("data-parent-id");
    p || (p = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", p));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: p,
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
