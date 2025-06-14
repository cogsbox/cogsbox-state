"use client";
import { jsx as me } from "react/jsx-runtime";
import { useState as K, useRef as Z, useEffect as ne, useLayoutEffect as de, useMemo as Ee, createElement as oe, useSyncExternalStore as xe, startTransition as Ve, useCallback as ye } from "react";
import { transformStateFunc as ke, isDeepEqual as L, isFunction as z, getNestedValue as B, getDifferences as ue, debounce as Ne } from "./utility.js";
import { pushFunc as le, updateFn as Q, cutFunc as te, ValidationWrapper as be, FormControlComponent as Ce } from "./Functions.jsx";
import Pe from "superjson";
import { v4 as ge } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as ve } from "./store.js";
import { useCogsConfig as Te } from "./CogsStateClient.jsx";
import { applyPatch as _e } from "fast-json-patch";
function Ie(e, s) {
  const I = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, y = I(e) || {};
  f(e, {
    ...y,
    ...s
  });
}
function he({
  stateKey: e,
  options: s,
  initialOptionsPart: I
}) {
  const f = Y(e) || {}, y = I[e] || {}, x = r.getState().setInitialStateOptions, T = { ...y, ...f };
  let p = !1;
  if (s)
    for (const i in s)
      T.hasOwnProperty(i) ? (i == "localStorage" && s[i] && T[i].key !== s[i]?.key && (p = !0, T[i] = s[i]), i == "initialState" && s[i] && T[i] !== s[i] && // Different references
      !L(T[i], s[i]) && (p = !0, T[i] = s[i])) : (p = !0, T[i] = s[i]);
  p && x(e, T);
}
function Ke(e, { formElements: s, validation: I }) {
  return { initialState: e, formElements: s, validation: I };
}
const et = (e, s) => {
  let I = e;
  const [f, y] = ke(I);
  (Object.keys(y).length > 0 || s && Object.keys(s).length > 0) && Object.keys(y).forEach((p) => {
    y[p] = y[p] || {}, y[p].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...y[p].formElements || {}
      // State-specific overrides
    }, Y(p) || r.getState().setInitialStateOptions(p, y[p]);
  }), r.getState().setInitialStates(f), r.getState().setCreatedState(f);
  const x = (p, i) => {
    const [v] = K(i?.componentId ?? ge());
    he({
      stateKey: p,
      options: i,
      initialOptionsPart: y
    });
    const a = r.getState().cogsStateStore[p] || f[p], S = i?.modifyState ? i.modifyState(a) : a, [D, O] = De(
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
    he({ stateKey: p, options: i, initialOptionsPart: y }), i.localStorage && Fe(p, i), se(p);
  }
  return { useCogsState: x, setCogsOptions: T };
}, {
  setUpdaterState: re,
  setState: J,
  getInitialOptions: Y,
  getKeyState: $e,
  getValidationErrors: Oe,
  setStateLog: Me,
  updateInitialStateGlobal: fe,
  addValidationError: Re,
  removeValidationError: q,
  setServerSyncActions: je
} = r.getState(), pe = (e, s, I, f, y) => {
  I?.log && console.log(
    "saving to localstorage",
    s,
    I.localStorage?.key,
    f
  );
  const x = z(I?.localStorage?.key) ? I.localStorage?.key(e) : I?.localStorage?.key;
  if (x && f) {
    const T = `${f}-${s}-${x}`;
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
  const I = r.getState().cogsStateStore[e], { sessionId: f } = Te(), y = z(s?.localStorage?.key) ? s.localStorage.key(I) : s?.localStorage?.key;
  if (y && f) {
    const x = ie(
      `${f}-${e}-${y}`
    );
    if (x && x.lastUpdated > (x.lastSyncedWithServer || 0))
      return J(e, x.state), se(e), !0;
  }
  return !1;
}, Ae = (e, s, I, f, y, x) => {
  const T = {
    initialState: s,
    updaterState: ae(
      e,
      f,
      y,
      x
    ),
    state: I
  };
  fe(e, T.initialState), re(e, T.updaterState), J(e, T.state);
}, se = (e) => {
  const s = r.getState().stateComponents.get(e);
  if (!s) return;
  const I = /* @__PURE__ */ new Set();
  s.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || I.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    I.forEach((f) => f());
  });
}, tt = (e, s) => {
  const I = r.getState().stateComponents.get(e);
  if (I) {
    const f = `${e}////${s}`, y = I.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Ue = (e, s, I, f) => {
  switch (e) {
    case "update":
      return {
        oldValue: B(s, f),
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
        oldValue: B(s, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function De(e, {
  stateKey: s,
  serverSync: I,
  localStorage: f,
  formElements: y,
  reactiveDeps: x,
  reactiveType: T,
  componentId: p,
  initialState: i,
  syncUpdate: v,
  dependencies: a,
  serverState: S
} = {}) {
  const [D, O] = K({}), { sessionId: M } = Te();
  let W = !s;
  const [m] = K(s ?? ge()), l = r.getState().stateLog[m], ee = Z(/* @__PURE__ */ new Set()), H = Z(p ?? ge()), C = Z(
    null
  );
  C.current = Y(m) ?? null, ne(() => {
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
      Ie(m, {
        initialState: i
      });
      const t = C.current, o = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = r.getState().initialStateGlobal[m];
      if (!(c && !L(c, i) || !c) && !o)
        return;
      let d = null;
      const V = z(t?.localStorage?.key) ? t?.localStorage?.key(i) : t?.localStorage?.key;
      V && M && (d = ie(`${M}-${m}-${V}`));
      let w = i, $ = !1;
      const A = o ? Date.now() : 0, N = d?.lastUpdated || 0, P = d?.lastSyncedWithServer || 0;
      o && A > N ? (w = t.serverState.data, $ = !0) : d && N > P && (w = d.state, t?.localStorage?.onChange && t?.localStorage?.onChange(w)), Ae(
        m,
        i,
        w,
        X,
        H.current,
        M
      ), $ && V && M && pe(w, m, t, M, Date.now()), se(m), (Array.isArray(T) ? T : [T || "component"]).includes("none") || O({});
    }
  }, [
    i,
    S?.status,
    S?.data,
    ...a || []
  ]), de(() => {
    W && Ie(m, {
      serverSync: I,
      formElements: y,
      initialState: i,
      localStorage: f,
      middleware: C.current?.middleware
    });
    const t = `${m}////${H.current}`, n = r.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(t, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: x || void 0,
      reactiveType: T ?? ["component", "deps"]
    }), r.getState().stateComponents.set(m, n), O({}), () => {
      const o = `${m}////${H.current}`;
      n && (n.components.delete(o), n.components.size === 0 && r.getState().stateComponents.delete(m));
    };
  }, []);
  const X = (t, n, o, c) => {
    if (Array.isArray(n)) {
      const g = `${m}-${n.join(".")}`;
      ee.current.add(g);
    }
    J(m, (g) => {
      const d = z(t) ? t(g) : t, V = `${m}-${n.join(".")}`;
      if (V) {
        let j = !1, h = r.getState().signalDomElements.get(V);
        if ((!h || h.size === 0) && (o.updateType === "insert" || o.updateType === "cut")) {
          const k = n.slice(0, -1), b = B(d, k);
          if (Array.isArray(b)) {
            j = !0;
            const E = `${m}-${k.join(".")}`;
            h = r.getState().signalDomElements.get(E);
          }
        }
        if (h) {
          const k = j ? B(d, n.slice(0, -1)) : B(d, n);
          h.forEach(({ parentId: b, position: E, effect: R }) => {
            const _ = document.querySelector(
              `[data-parent-id="${b}"]`
            );
            if (_) {
              const G = Array.from(_.childNodes);
              if (G[E]) {
                const U = R ? new Function("state", `return (${R})(state)`)(k) : k;
                G[E].textContent = String(U);
              }
            }
          });
        }
      }
      o.updateType === "update" && (c || C.current?.validation?.key) && n && q(
        (c || C.current?.validation?.key) + "." + n.join(".")
      );
      const w = n.slice(0, n.length - 1);
      o.updateType === "cut" && C.current?.validation?.key && q(
        C.current?.validation?.key + "." + w.join(".")
      ), o.updateType === "insert" && C.current?.validation?.key && Oe(
        C.current?.validation?.key + "." + w.join(".")
      ).filter(([h, k]) => {
        let b = h?.split(".").length;
        if (h == w.join(".") && b == w.length - 1) {
          let E = h + "." + w;
          q(h), Re(E, k);
        }
      });
      const $ = r.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", $), $) {
        const j = ue(g, d), h = new Set(j), k = o.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          b,
          E
        ] of $.components.entries()) {
          let R = !1;
          const _ = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (console.log("component", E), !_.includes("none")) {
            if (_.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if (_.includes("component") && ((E.paths.has(k) || E.paths.has("")) && (R = !0), !R))
              for (const G of h) {
                let U = G;
                for (; ; ) {
                  if (E.paths.has(U)) {
                    R = !0;
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
                      R = !0;
                      break;
                    }
                    U = Se;
                  } else
                    U = "";
                  if (U === "")
                    break;
                }
                if (R) break;
              }
            if (!R && _.includes("deps") && E.depsFunction) {
              const G = E.depsFunction(d);
              let U = !1;
              typeof G == "boolean" ? G && (U = !0) : L(E.deps, G) || (E.deps = G, U = !0), U && (R = !0);
            }
            R && E.forceUpdate();
          }
        }
      }
      const A = Date.now();
      n = n.map((j, h) => {
        const k = n.slice(0, -1), b = B(d, k);
        return h === n.length - 1 && ["insert", "cut"].includes(o.updateType) ? (b.length - 1).toString() : j;
      });
      const { oldValue: N, newValue: P } = Ue(
        o.updateType,
        g,
        d,
        n
      ), F = {
        timeStamp: A,
        stateKey: m,
        path: n,
        updateType: o.updateType,
        status: "new",
        oldValue: N,
        newValue: P
      };
      if (Me(m, (j) => {
        const k = [...j ?? [], F].reduce((b, E) => {
          const R = `${E.stateKey}:${JSON.stringify(E.path)}`, _ = b.get(R);
          return _ ? (_.timeStamp = Math.max(_.timeStamp, E.timeStamp), _.newValue = E.newValue, _.oldValue = _.oldValue ?? E.oldValue, _.updateType = E.updateType) : b.set(R, { ...E }), b;
        }, /* @__PURE__ */ new Map());
        return Array.from(k.values());
      }), pe(
        d,
        m,
        C.current,
        M
      ), C.current?.middleware && C.current.middleware({
        updateLog: l,
        update: F
      }), C.current?.serverSync) {
        const j = r.getState().serverState[m], h = C.current?.serverSync;
        je(m, {
          syncKey: typeof h.syncKey == "string" ? h.syncKey : h.syncKey({ state: d }),
          rollBackState: j,
          actionTimeStamp: Date.now() + (h.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return d;
    });
  };
  r.getState().updaterState[m] || (re(
    m,
    ae(
      m,
      X,
      H.current,
      M
    )
  ), r.getState().cogsStateStore[m] || J(m, e), r.getState().initialStateGlobal[m] || fe(m, e));
  const u = Ee(() => ae(
    m,
    X,
    H.current,
    M
  ), [m, M]);
  return [$e(m), u];
}
function ae(e, s, I, f) {
  const y = /* @__PURE__ */ new Map();
  let x = 0;
  const T = (v) => {
    const a = v.join(".");
    for (const [S] of y)
      (S === a || S.startsWith(a + ".")) && y.delete(S);
    x++;
  }, p = {
    removeValidation: (v) => {
      v?.validationKey && q(v.validationKey);
    },
    revertToInitialState: (v) => {
      const a = r.getState().getInitialOptions(e)?.validation;
      a?.key && q(a?.key), v?.validationKey && q(v.validationKey);
      const S = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), y.clear(), x++;
      const D = i(S, []), O = Y(e), M = z(O?.localStorage?.key) ? O?.localStorage?.key(S) : O?.localStorage?.key, W = `${f}-${e}-${M}`;
      W && localStorage.removeItem(W), re(e, D), J(e, S);
      const m = r.getState().stateComponents.get(e);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), x++;
      const a = ae(
        e,
        s,
        I,
        f
      ), S = r.getState().initialStateGlobal[e], D = Y(e), O = z(D?.localStorage?.key) ? D?.localStorage?.key(S) : D?.localStorage?.key, M = `${f}-${e}-${O}`;
      return localStorage.getItem(M) && localStorage.removeItem(M), Ve(() => {
        fe(e, v), re(e, a), J(e, v);
        const W = r.getState().stateComponents.get(e);
        W && W.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (W) => a.get()[W]
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
  function i(v, a = [], S) {
    const D = a.map(String).join(".");
    y.get(D);
    const O = function() {
      return r().getNestedState(e, a);
    };
    Object.keys(p).forEach((m) => {
      O[m] = p[m];
    });
    const M = {
      apply(m, l, ee) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${a.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, a);
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
          const u = `${e}////${I}`, t = r.getState().stateComponents.get(e);
          if (t) {
            const n = t.components.get(u);
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
          return () => ue(
            r.getState().cogsStateStore[e],
            r.getState().initialStateGlobal[e]
          );
        if (l === "sync" && a.length === 0)
          return async function() {
            const u = r.getState().getInitialOptions(e), t = u?.sync;
            if (!t)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const n = r.getState().getNestedState(e, []), o = u?.validation?.key;
            try {
              const c = await t.action(n);
              if (c && !c.success && c.errors && o) {
                r.getState().removeValidationError(o), c.errors.forEach((d) => {
                  const V = [o, ...d.path].join(".");
                  r.getState().addValidationError(V, d.message);
                });
                const g = r.getState().stateComponents.get(e);
                g && g.components.forEach((d) => {
                  d.forceUpdate();
                });
              }
              return c?.success && t.onSuccess ? t.onSuccess(c.data) : !c?.success && t.onError && t.onError(c.error), c;
            } catch (c) {
              return t.onError && t.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const u = r.getState().getNestedState(e, a), t = r.getState().initialStateGlobal[e], n = B(t, a);
          return L(u, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const u = r().getNestedState(
              e,
              a
            ), t = r.getState().initialStateGlobal[e], n = B(t, a);
            return L(u, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const u = r.getState().initialStateGlobal[e], t = Y(e), n = z(t?.localStorage?.key) ? t?.localStorage?.key(u) : t?.localStorage?.key, o = `${f}-${e}-${n}`;
            o && localStorage.removeItem(o);
          };
        if (l === "showValidationErrors")
          return () => {
            const u = r.getState().getInitialOptions(e)?.validation;
            if (!u?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(u.key + "." + a.join("."));
          };
        if (Array.isArray(v)) {
          const u = () => S?.validIndices ? v.map((n, o) => ({
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
                return i(
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
              const g = Z(null), [d, V] = K({
                startIndex: 0,
                endIndex: 50
              }), w = Z(!0), $ = r().getNestedState(
                e,
                a
              ), A = $.length, N = Ee(() => {
                const h = Array.from(
                  { length: d.endIndex - d.startIndex },
                  (b, E) => d.startIndex + E
                ).filter((b) => b < A), k = h.map((b) => $[b]);
                return i(k, a, {
                  ...S,
                  validIndices: h
                });
              }, [d.startIndex, d.endIndex, $]);
              de(() => {
                const h = g.current;
                if (!h) return;
                const k = () => {
                  const { scrollTop: E, clientHeight: R } = h, _ = Math.max(
                    0,
                    Math.floor(E / n) - o
                  ), G = Math.min(
                    A,
                    Math.ceil((E + R) / n) + o
                  );
                  V({ startIndex: _, endIndex: G });
                }, b = () => {
                  k();
                };
                if (h.addEventListener("scroll", b, {
                  passive: !0
                }), w.current && c && A > 0) {
                  w.current = !1;
                  const E = Math.max(
                    0,
                    A - Math.ceil(h.clientHeight / n) - o
                  );
                  V({ startIndex: E, endIndex: A }), setTimeout(() => {
                    h.scrollTop = h.scrollHeight;
                  }, 0);
                } else
                  k();
                return () => {
                  h.removeEventListener("scroll", b);
                };
              }, [A, n, o]), ne(() => {
                if (c && g.current && !w.current) {
                  const h = g.current;
                  h.scrollHeight - h.scrollTop - h.clientHeight < 100 && (h.scrollTop = h.scrollHeight);
                }
              }, [A]);
              const P = ye(
                (h = "smooth") => {
                  g.current && (g.current.scrollTop = g.current.scrollHeight);
                },
                []
              ), F = ye(
                (h, k = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: h * n,
                    behavior: k
                  });
                },
                [n]
              ), j = {
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
                    height: `${A * n}px`,
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
                virtualizerProps: j,
                scrollToBottom: P,
                scrollToIndex: F
              };
            };
          if (l === "stateSort")
            return (t) => {
              const o = [...u()].sort(
                (d, V) => t(d.item, V.item)
              ), c = o.map(({ item: d }) => d), g = {
                ...S,
                validIndices: o.map(
                  ({ originalIndex: d }) => d
                )
              };
              return i(c, a, g);
            };
          if (l === "stateFilter")
            return (t) => {
              const o = u().filter(
                ({ item: d }, V) => t(d, V)
              ), c = o.map(({ item: d }) => d), g = {
                ...S,
                validIndices: o.map(
                  ({ originalIndex: d }) => d
                )
              };
              return i(c, a, g);
            };
          if (l === "stateMap")
            return (t) => {
              const n = r.getState().getNestedState(e, a);
              return Array.isArray(n) ? n.map((o, c) => {
                let g;
                S?.validIndices && S.validIndices[c] !== void 0 ? g = S.validIndices[c] : g = c;
                const d = [...a, g.toString()], V = i(o, d, S);
                return t(o, V, {
                  register: () => {
                    const [, $] = K({}), A = `${I}-${a.join(".")}-${g}`;
                    de(() => {
                      const N = `${e}////${A}`, P = r.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return P.components.set(N, {
                        forceUpdate: () => $({}),
                        paths: /* @__PURE__ */ new Set([d.join(".")])
                        // ATOMIC: Subscribes only to this item's path.
                      }), r.getState().stateComponents.set(e, P), () => {
                        const F = r.getState().stateComponents.get(e);
                        F && F.components.delete(N);
                      };
                    }, [e, A]);
                  },
                  index: c,
                  originalIndex: g
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
              const d = [...a, g.toString()], V = i(o, d, S);
              return t(
                o,
                V,
                c,
                v,
                i(v, a, S)
              );
            });
          if (l === "$stateMap")
            return (t) => oe(We, {
              proxy: {
                _stateKey: e,
                _path: a,
                _mapFn: t
                // Pass the actual function, not string
              },
              rebuildStateShape: i
            });
          if (l === "stateFlattenOn")
            return (t) => {
              const n = v;
              y.clear(), x++;
              const o = n.flatMap(
                (c) => c[t] ?? []
              );
              return i(
                o,
                [...a, "[*]", t],
                S
              );
            };
          if (l === "index")
            return (t) => {
              const n = v[t];
              return i(n, [...a, t.toString()]);
            };
          if (l === "last")
            return () => {
              const t = r.getState().getNestedState(e, a);
              if (t.length === 0) return;
              const n = t.length - 1, o = t[n], c = [...a, n.toString()];
              return i(o, c);
            };
          if (l === "insert")
            return (t) => (T(a), le(s, t, a, e), i(
              r.getState().getNestedState(e, a),
              a
            ));
          if (l === "uniqueInsert")
            return (t, n, o) => {
              const c = r.getState().getNestedState(e, a), g = z(t) ? t(c) : t;
              let d = null;
              if (!c.some((w) => {
                if (n) {
                  const A = n.every(
                    (N) => L(w[N], g[N])
                  );
                  return A && (d = w), A;
                }
                const $ = L(w, g);
                return $ && (d = w), $;
              }))
                T(a), le(s, g, a, e);
              else if (o && d) {
                const w = o(d), $ = c.map(
                  (A) => L(A, d) ? w : A
                );
                T(a), Q(s, $, a);
              }
            };
          if (l === "cut")
            return (t, n) => {
              if (!n?.waitForSync)
                return T(a), te(s, a, e, t), i(
                  r.getState().getNestedState(e, a),
                  a
                );
            };
          if (l === "cutByValue")
            return (t) => {
              for (let n = 0; n < v.length; n++)
                v[n] === t && te(s, a, e, n);
            };
          if (l === "toggleByValue")
            return (t) => {
              const n = v.findIndex((o) => o === t);
              n > -1 ? te(s, a, e, n) : le(s, t, a, e);
            };
          if (l === "stateFind")
            return (t) => {
              const o = u().find(
                ({ item: g }, d) => t(g, d)
              );
              if (!o) return;
              const c = [...a, o.originalIndex.toString()];
              return i(o.item, c, S);
            };
          if (l === "findWith")
            return (t, n) => {
              const c = u().find(
                ({ item: d }) => d[t] === n
              );
              if (!c) return;
              const g = [...a, c.originalIndex.toString()];
              return i(c.item, g, S);
            };
        }
        const H = a[a.length - 1];
        if (!isNaN(Number(H))) {
          const u = a.slice(0, -1), t = r.getState().getNestedState(e, u);
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
              const u = r.getState().getNestedState(e, a);
              return S.validIndices.map((t) => u[t]);
            }
            return r.getState().getNestedState(e, a);
          };
        if (l === "$derive")
          return (u) => we({
            _stateKey: e,
            _path: a,
            _effect: u.toString()
          });
        if (l === "$get")
          return () => we({
            _stateKey: e,
            _path: a
          });
        if (l === "lastSynced") {
          const u = `${e}:${a.join(".")}`;
          return r.getState().getSyncInfo(u);
        }
        if (l == "getLocalStorage")
          return (u) => ie(f + "-" + e + "-" + u);
        if (l === "_selected") {
          const u = a.slice(0, -1), t = u.join("."), n = r.getState().getNestedState(e, u);
          return Array.isArray(n) ? Number(a[a.length - 1]) === r.getState().getSelectedIndex(e, t) : void 0;
        }
        if (l === "setSelected")
          return (u) => {
            const t = a.slice(0, -1), n = Number(a[a.length - 1]), o = t.join(".");
            u ? r.getState().setSelectedIndex(e, o, n) : r.getState().setSelectedIndex(e, o, void 0);
            const c = r.getState().getNestedState(e, [...t]);
            Q(s, c, t), T(t);
          };
        if (l === "toggleSelected")
          return () => {
            const u = a.slice(0, -1), t = Number(a[a.length - 1]), n = u.join("."), o = r.getState().getSelectedIndex(e, n);
            r.getState().setSelectedIndex(
              e,
              n,
              o === t ? void 0 : t
            );
            const c = r.getState().getNestedState(e, [...u]);
            Q(s, c, u), T(u);
          };
        if (a.length == 0) {
          if (l === "applyJsonPatch")
            return (u) => {
              const t = r.getState().cogsStateStore[e], o = _e(t, u).newDocument;
              Ae(
                e,
                r.getState().initialStateGlobal[e],
                o,
                s,
                I,
                f
              );
              const c = r.getState().stateComponents.get(e);
              if (c) {
                const g = ue(t, o), d = new Set(g);
                for (const [
                  V,
                  w
                ] of c.components.entries()) {
                  let $ = !1;
                  const A = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!A.includes("none")) {
                    if (A.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (A.includes("component") && (w.paths.has("") && ($ = !0), !$))
                      for (const N of d) {
                        if (w.paths.has(N)) {
                          $ = !0;
                          break;
                        }
                        let P = N.lastIndexOf(".");
                        for (; P !== -1; ) {
                          const F = N.substring(0, P);
                          if (w.paths.has(F)) {
                            $ = !0;
                            break;
                          }
                          const j = N.substring(
                            P + 1
                          );
                          if (!isNaN(Number(j))) {
                            const h = F.lastIndexOf(".");
                            if (h !== -1) {
                              const k = F.substring(
                                0,
                                h
                              );
                              if (w.paths.has(k)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          P = F.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && A.includes("deps") && w.depsFunction) {
                      const N = w.depsFunction(o);
                      let P = !1;
                      typeof N == "boolean" ? N && (P = !0) : L(w.deps, N) || (w.deps = N, P = !0), P && ($ = !0);
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
                const o = r.getState().getValidationErrors(u.key);
                o && o.length > 0 && o.forEach(([g]) => {
                  g && g.startsWith(u.key) && q(g);
                });
                const c = u.zodSchema.safeParse(n);
                return c.success ? !0 : (c.error.errors.forEach((d) => {
                  const V = d.path, w = d.message, $ = [u.key, ...V].join(".");
                  t($, w);
                }), se(e), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (l === "_componentId") return I;
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
          return () => ve.getState().getFormRef(e + "." + a.join("."));
        if (l === "validationWrapper")
          return ({
            children: u,
            hideMessage: t
          }) => /* @__PURE__ */ me(
            be,
            {
              formOpts: t ? { validation: { message: "" } } : void 0,
              path: a,
              validationKey: r.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: S?.validIndices,
              children: u
            }
          );
        if (l === "_stateKey") return e;
        if (l === "_path") return a;
        if (l === "_isServerSynced") return p._isServerSynced;
        if (l === "update")
          return (u, t) => {
            if (t?.debounce)
              Ne(() => {
                Q(s, u, a, "");
                const n = r.getState().getNestedState(e, a);
                t?.afterUpdate && t.afterUpdate(n);
              }, t.debounce);
            else {
              Q(s, u, a, "");
              const n = r.getState().getNestedState(e, a);
              t?.afterUpdate && t.afterUpdate(n);
            }
            T(a);
          };
        if (l === "formElement")
          return (u, t) => /* @__PURE__ */ me(
            Ce,
            {
              setState: s,
              stateKey: e,
              path: a,
              child: u,
              formOpts: t
            }
          );
        const C = [...a, l], X = r.getState().getNestedState(e, C);
        return i(X, C, S);
      }
    }, W = new Proxy(O, M);
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
  return oe(Ge, { proxy: e });
}
function We({
  proxy: e,
  rebuildStateShape: s
}) {
  const I = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(I) ? s(
    I,
    e._path
  ).stateMapNoRender(
    (y, x, T, p, i) => e._mapFn(y, x, T, p, i)
  ) : null;
}
function Ge({
  proxy: e
}) {
  const s = Z(null), I = `${e._stateKey}-${e._path.join(".")}`;
  return ne(() => {
    const f = s.current;
    if (!f || !f.parentElement) return;
    const y = f.parentElement, T = Array.from(y.childNodes).indexOf(f);
    let p = y.getAttribute("data-parent-id");
    p || (p = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", p));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: p,
      position: T,
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
      } catch (O) {
        console.error("Error evaluating effect function during mount:", O), S = a;
      }
    else
      S = a;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const D = document.createTextNode(String(S));
    f.replaceWith(D);
  }, [e._stateKey, e._path.join("."), e._effect]), oe("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": I
  });
}
function nt(e) {
  const s = xe(
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
  return oe("text", {}, String(s));
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
