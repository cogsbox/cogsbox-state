"use client";
import { jsx as me } from "react/jsx-runtime";
import { useState as K, useRef as Q, useEffect as le, useLayoutEffect as de, useMemo as Ee, createElement as ae, useSyncExternalStore as ke, startTransition as xe, useCallback as ye } from "react";
import { transformStateFunc as Ne, isDeepEqual as G, isFunction as H, getNestedValue as L, getDifferences as ue, debounce as Ve } from "./utility.js";
import { pushFunc as ce, updateFn as X, cutFunc as te, ValidationWrapper as be, FormControlComponent as Ce } from "./Functions.jsx";
import Pe from "superjson";
import { v4 as ge } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as ve } from "./store.js";
import { useCogsConfig as Te } from "./CogsStateClient.jsx";
import { applyPatch as _e } from "fast-json-patch";
function he(e, i) {
  const h = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, y = h(e) || {};
  g(e, {
    ...y,
    ...i
  });
}
function Ie({
  stateKey: e,
  options: i,
  initialOptionsPart: h
}) {
  const g = Z(e) || {}, y = h[e] || {}, k = r.getState().setInitialStateOptions, w = { ...y, ...g };
  let I = !1;
  if (i)
    for (const s in i)
      w.hasOwnProperty(s) ? (s == "localStorage" && i[s] && w[s].key !== i[s]?.key && (I = !0, w[s] = i[s]), s == "initialState" && i[s] && w[s] !== i[s] && // Different references
      !G(w[s], i[s]) && (I = !0, w[s] = i[s])) : (I = !0, w[s] = i[s]);
  I && k(e, w);
}
function Ke(e, { formElements: i, validation: h }) {
  return { initialState: e, formElements: i, validation: h };
}
const et = (e, i) => {
  let h = e;
  const [g, y] = Ne(h);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, Z(I) || r.getState().setInitialStateOptions(I, y[I]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const k = (I, s) => {
    const [v] = K(s?.componentId ?? ge());
    Ie({
      stateKey: I,
      options: s,
      initialOptionsPart: y
    });
    const a = r.getState().cogsStateStore[I] || g[I], f = s?.modifyState ? s.modifyState(a) : a, [D, M] = De(
      f,
      {
        stateKey: I,
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
    return M;
  };
  function w(I, s) {
    Ie({ stateKey: I, options: s, initialOptionsPart: y }), s.localStorage && Fe(I, s), se(I);
  }
  return { useCogsState: k, setCogsOptions: w };
}, {
  setUpdaterState: ne,
  setState: J,
  getInitialOptions: Z,
  getKeyState: $e,
  getValidationErrors: Me,
  setStateLog: Oe,
  updateInitialStateGlobal: fe,
  addValidationError: je,
  removeValidationError: z,
  setServerSyncActions: Re
} = r.getState(), pe = (e, i, h, g, y) => {
  h?.log && console.log(
    "saving to localstorage",
    i,
    h.localStorage?.key,
    g
  );
  const k = H(h?.localStorage?.key) ? h.localStorage?.key(e) : h?.localStorage?.key;
  if (k && g) {
    const w = `${g}-${i}-${k}`;
    let I;
    try {
      I = oe(w)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Pe.serialize(s);
    window.localStorage.setItem(
      w,
      JSON.stringify(v.json)
    );
  }
}, oe = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Fe = (e, i) => {
  const h = r.getState().cogsStateStore[e], { sessionId: g } = Te(), y = H(i?.localStorage?.key) ? i.localStorage.key(h) : i?.localStorage?.key;
  if (y && g) {
    const k = oe(
      `${g}-${e}-${y}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return J(e, k.state), se(e), !0;
  }
  return !1;
}, Ae = (e, i, h, g, y, k) => {
  const w = {
    initialState: i,
    updaterState: re(
      e,
      g,
      y,
      k
    ),
    state: h
  };
  fe(e, w.initialState), ne(e, w.updaterState), J(e, w.state);
}, se = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const h = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || h.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((g) => g());
  });
}, tt = (e, i) => {
  const h = r.getState().stateComponents.get(e);
  if (h) {
    const g = `${e}////${i}`, y = h.components.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Ue = (e, i, h, g) => {
  switch (e) {
    case "update":
      return {
        oldValue: L(i, g),
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
        oldValue: L(i, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function De(e, {
  stateKey: i,
  serverSync: h,
  localStorage: g,
  formElements: y,
  reactiveDeps: k,
  reactiveType: w,
  componentId: I,
  initialState: s,
  syncUpdate: v,
  dependencies: a,
  serverState: f
} = {}) {
  const [D, M] = K({}), { sessionId: O } = Te();
  let W = !i;
  const [m] = K(i ?? ge()), l = r.getState().stateLog[m], ee = Q(/* @__PURE__ */ new Set()), q = Q(I ?? ge()), P = Q(
    null
  );
  P.current = Z(m) ?? null, le(() => {
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
  }, [v]), le(() => {
    if (s) {
      he(m, {
        initialState: s
      });
      const t = P.current, o = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = r.getState().initialStateGlobal[m];
      if (!(c && !G(c, s) || !c) && !o)
        return;
      let d = null;
      const N = H(t?.localStorage?.key) ? t?.localStorage?.key(s) : t?.localStorage?.key;
      N && O && (d = oe(`${O}-${m}-${N}`));
      let p = s, E = !1;
      const b = o ? Date.now() : 0, V = d?.lastUpdated || 0, _ = d?.lastSyncedWithServer || 0;
      o && b > V ? (p = t.serverState.data, E = !0) : d && V > _ && (p = d.state, t?.localStorage?.onChange && t?.localStorage?.onChange(p)), Ae(
        m,
        s,
        p,
        Y,
        q.current,
        O
      ), E && N && O && pe(p, m, t, O, Date.now()), se(m), (Array.isArray(w) ? w : [w || "component"]).includes("none") || M({});
    }
  }, [
    s,
    f?.status,
    f?.data,
    ...a || []
  ]), de(() => {
    W && he(m, {
      serverSync: h,
      formElements: y,
      initialState: s,
      localStorage: g,
      middleware: P.current?.middleware
    });
    const t = `${m}////${q.current}`, n = r.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(t, {
      forceUpdate: () => M({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), r.getState().stateComponents.set(m, n), M({}), () => {
      const o = `${m}////${q.current}`;
      n && (n.components.delete(o), n.components.size === 0 && r.getState().stateComponents.delete(m));
    };
  }, []);
  const Y = (t, n, o, c) => {
    if (Array.isArray(n)) {
      const S = `${m}-${n.join(".")}`;
      ee.current.add(S);
    }
    J(m, (S) => {
      const d = H(t) ? t(S) : t, N = `${m}-${n.join(".")}`;
      if (N) {
        let T = !1, $ = r.getState().signalDomElements.get(N);
        if ((!$ || $.size === 0) && (o.updateType === "insert" || o.updateType === "cut")) {
          const x = n.slice(0, -1), C = L(d, x);
          if (Array.isArray(C)) {
            T = !0;
            const A = `${m}-${x.join(".")}`;
            $ = r.getState().signalDomElements.get(A);
          }
        }
        if ($) {
          const x = T ? L(d, n.slice(0, -1)) : L(d, n);
          $.forEach(({ parentId: C, position: A, effect: j }) => {
            const R = document.querySelector(
              `[data-parent-id="${C}"]`
            );
            if (R) {
              const B = Array.from(R.childNodes);
              if (B[A]) {
                const U = j ? new Function("state", `return (${j})(state)`)(x) : x;
                B[A].textContent = String(U);
              }
            }
          });
        }
      }
      o.updateType === "update" && (c || P.current?.validation?.key) && n && z(
        (c || P.current?.validation?.key) + "." + n.join(".")
      );
      const p = n.slice(0, n.length - 1);
      o.updateType === "cut" && P.current?.validation?.key && z(
        P.current?.validation?.key + "." + p.join(".")
      ), o.updateType === "insert" && P.current?.validation?.key && Me(
        P.current?.validation?.key + "." + p.join(".")
      ).filter(([$, x]) => {
        let C = $?.split(".").length;
        if ($ == p.join(".") && C == p.length - 1) {
          let A = $ + "." + p;
          z($), je(A, x);
        }
      });
      const E = r.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", E), E) {
        const T = ue(S, d), $ = new Set(T), x = o.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          C,
          A
        ] of E.components.entries()) {
          let j = !1;
          const R = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (console.log("component", A), !R.includes("none")) {
            if (R.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if (R.includes("component") && ((A.paths.has(x) || A.paths.has("")) && (j = !0), !j))
              for (const B of $) {
                let U = B;
                for (; ; ) {
                  if (A.paths.has(U)) {
                    j = !0;
                    break;
                  }
                  const ie = U.lastIndexOf(".");
                  if (ie !== -1) {
                    const Se = U.substring(
                      0,
                      ie
                    );
                    if (!isNaN(
                      Number(U.substring(ie + 1))
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
            if (!j && R.includes("deps") && A.depsFunction) {
              const B = A.depsFunction(d);
              let U = !1;
              typeof B == "boolean" ? B && (U = !0) : G(A.deps, B) || (A.deps = B, U = !0), U && (j = !0);
            }
            j && A.forceUpdate();
          }
        }
      }
      const b = Date.now();
      n = n.map((T, $) => {
        const x = n.slice(0, -1), C = L(d, x);
        return $ === n.length - 1 && ["insert", "cut"].includes(o.updateType) ? (C.length - 1).toString() : T;
      });
      const { oldValue: V, newValue: _ } = Ue(
        o.updateType,
        S,
        d,
        n
      ), F = {
        timeStamp: b,
        stateKey: m,
        path: n,
        updateType: o.updateType,
        status: "new",
        oldValue: V,
        newValue: _
      };
      if (Oe(m, (T) => {
        const x = [...T ?? [], F].reduce((C, A) => {
          const j = `${A.stateKey}:${JSON.stringify(A.path)}`, R = C.get(j);
          return R ? (R.timeStamp = Math.max(R.timeStamp, A.timeStamp), R.newValue = A.newValue, R.oldValue = R.oldValue ?? A.oldValue, R.updateType = A.updateType) : C.set(j, { ...A }), C;
        }, /* @__PURE__ */ new Map());
        return Array.from(x.values());
      }), pe(
        d,
        m,
        P.current,
        O
      ), P.current?.middleware && P.current.middleware({
        updateLog: l,
        update: F
      }), P.current?.serverSync) {
        const T = r.getState().serverState[m], $ = P.current?.serverSync;
        Re(m, {
          syncKey: typeof $.syncKey == "string" ? $.syncKey : $.syncKey({ state: d }),
          rollBackState: T,
          actionTimeStamp: Date.now() + ($.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return d;
    });
  };
  r.getState().updaterState[m] || (ne(
    m,
    re(
      m,
      Y,
      q.current,
      O
    )
  ), r.getState().cogsStateStore[m] || J(m, e), r.getState().initialStateGlobal[m] || fe(m, e));
  const u = Ee(() => re(
    m,
    Y,
    q.current,
    O
  ), [m, O]);
  return [$e(m), u];
}
function re(e, i, h, g) {
  const y = /* @__PURE__ */ new Map();
  let k = 0;
  const w = (v) => {
    const a = v.join(".");
    for (const [f] of y)
      (f === a || f.startsWith(a + ".")) && y.delete(f);
    k++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && z(v.validationKey);
    },
    revertToInitialState: (v) => {
      const a = r.getState().getInitialOptions(e)?.validation;
      a?.key && z(a?.key), v?.validationKey && z(v.validationKey);
      const f = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), y.clear(), k++;
      const D = s(f, []), M = Z(e), O = H(M?.localStorage?.key) ? M?.localStorage?.key(f) : M?.localStorage?.key, W = `${g}-${e}-${O}`;
      W && localStorage.removeItem(W), ne(e, D), J(e, f);
      const m = r.getState().stateComponents.get(e);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), f;
    },
    updateInitialState: (v) => {
      y.clear(), k++;
      const a = re(
        e,
        i,
        h,
        g
      ), f = r.getState().initialStateGlobal[e], D = Z(e), M = H(D?.localStorage?.key) ? D?.localStorage?.key(f) : D?.localStorage?.key, O = `${g}-${e}-${M}`;
      return localStorage.getItem(O) && localStorage.removeItem(O), xe(() => {
        fe(e, v), ne(e, a), J(e, v);
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
      return !!(v && G(v, $e(e)));
    }
  };
  function s(v, a = [], f) {
    const D = a.map(String).join(".");
    y.get(D);
    const M = function() {
      return r().getNestedState(e, a);
    };
    Object.keys(I).forEach((m) => {
      M[m] = I[m];
    });
    const O = {
      apply(m, l, ee) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${a.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, a);
      },
      get(m, l) {
        f?.validIndices && !Array.isArray(v) && (f = { ...f, validIndices: void 0 });
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
              const o = a.join(".");
              let c = !0;
              for (const S of n.paths)
                if (o.startsWith(S) && (o === S || o[S.length] === ".")) {
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
                  const N = [o, ...d.path].join(".");
                  r.getState().addValidationError(N, d.message);
                });
                const S = r.getState().stateComponents.get(e);
                S && S.components.forEach((d) => {
                  d.forceUpdate();
                });
              }
              return c?.success && t.onSuccess ? t.onSuccess(c.data) : !c?.success && t.onError && t.onError(c.error), c;
            } catch (c) {
              return t.onError && t.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const u = r.getState().getNestedState(e, a), t = r.getState().initialStateGlobal[e], n = L(t, a);
          return G(u, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const u = r().getNestedState(
              e,
              a
            ), t = r.getState().initialStateGlobal[e], n = L(t, a);
            return G(u, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const u = r.getState().initialStateGlobal[e], t = Z(e), n = H(t?.localStorage?.key) ? t?.localStorage?.key(u) : t?.localStorage?.key, o = `${g}-${e}-${n}`;
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
          const u = () => f?.validIndices ? v.map((n, o) => ({
            item: n,
            originalIndex: f.validIndices[o]
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
                  f
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
              } = t, S = Q(null), [d, N] = K({
                startIndex: 0,
                endIndex: 50
              }), p = r().getNestedState(
                e,
                a
              ), E = p.length, b = Ee(() => {
                const T = Array.from(
                  { length: d.endIndex - d.startIndex },
                  (x, C) => d.startIndex + C
                ).filter((x) => x < E), $ = T.map((x) => p[x]);
                return s($, a, {
                  ...f,
                  validIndices: T
                });
              }, [d.startIndex, d.endIndex, p]);
              de(() => {
                const T = S.current;
                if (!T) return;
                const $ = () => {
                  const { scrollTop: x, clientHeight: C } = T, A = Math.max(
                    0,
                    Math.floor(x / n) - o
                  ), j = Math.min(
                    E,
                    Math.ceil((x + C) / n) + o
                  );
                  N({ startIndex: A, endIndex: j });
                };
                if (T.addEventListener("scroll", $, {
                  passive: !0
                }), c && E > 0) {
                  const x = Math.ceil(
                    T.clientHeight / n
                  ), C = Math.max(
                    0,
                    E - x - o
                  );
                  N({ startIndex: C, endIndex: E }), setTimeout(() => {
                    T.scrollTop = T.scrollHeight;
                  }, 0);
                } else
                  $();
                return () => T.removeEventListener("scroll", $);
              }, [E, n, o, c]);
              const V = ye(
                (T = "smooth") => {
                  S.current && S.current.scrollTo({
                    top: S.current.scrollHeight,
                    behavior: T
                  });
                },
                []
              ), _ = ye(
                (T, $ = "smooth") => {
                  S.current && S.current.scrollTo({
                    top: T * n,
                    behavior: $
                  });
                },
                [n]
              ), F = {
                outer: {
                  ref: S,
                  style: {
                    overflowY: "auto",
                    height: "100%"
                  }
                },
                inner: {
                  style: {
                    height: `${E * n}px`
                  }
                },
                list: {
                  style: {
                    paddingTop: `${d.startIndex * n}px`
                  }
                }
              };
              return {
                virtualState: b,
                virtualizerProps: F,
                scrollToBottom: V,
                scrollToIndex: _
              };
            };
          if (l === "stateSort")
            return (t) => {
              const o = [...u()].sort(
                (d, N) => t(d.item, N.item)
              ), c = o.map(({ item: d }) => d), S = {
                ...f,
                validIndices: o.map(
                  ({ originalIndex: d }) => d
                )
              };
              return s(c, a, S);
            };
          if (l === "stateFilter")
            return (t) => {
              const o = u().filter(
                ({ item: d }, N) => t(d, N)
              ), c = o.map(({ item: d }) => d), S = {
                ...f,
                validIndices: o.map(
                  ({ originalIndex: d }) => d
                )
              };
              return s(c, a, S);
            };
          if (l === "stateMap")
            return (t) => {
              const n = r.getState().getNestedState(e, a);
              return Array.isArray(n) ? (f?.validIndices || Array.from({ length: n.length }, (c, S) => S)).map((c, S) => {
                const d = n[c], N = [...a, c.toString()], p = s(d, N, f);
                return t(d, p, {
                  register: () => {
                    const [, b] = K({}), V = `${h}-${a.join(".")}-${c}`;
                    de(() => {
                      const _ = `${e}////${V}`, F = r.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return F.components.set(_, {
                        forceUpdate: () => b({}),
                        paths: /* @__PURE__ */ new Set([N.join(".")])
                      }), r.getState().stateComponents.set(e, F), () => {
                        const T = r.getState().stateComponents.get(e);
                        T && T.components.delete(_);
                      };
                    }, [e, V]);
                  },
                  index: S,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${a.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (t) => v.map((o, c) => {
              let S;
              f?.validIndices && f.validIndices[c] !== void 0 ? S = f.validIndices[c] : S = c;
              const d = [...a, S.toString()], N = s(o, d, f);
              return t(
                o,
                N,
                c,
                v,
                s(v, a, f)
              );
            });
          if (l === "$stateMap")
            return (t) => ae(We, {
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
              y.clear(), k++;
              const o = n.flatMap(
                (c) => c[t] ?? []
              );
              return s(
                o,
                [...a, "[*]", t],
                f
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
            return (t) => (w(a), ce(i, t, a, e), s(
              r.getState().getNestedState(e, a),
              a
            ));
          if (l === "uniqueInsert")
            return (t, n, o) => {
              const c = r.getState().getNestedState(e, a), S = H(t) ? t(c) : t;
              let d = null;
              if (!c.some((p) => {
                if (n) {
                  const b = n.every(
                    (V) => G(p[V], S[V])
                  );
                  return b && (d = p), b;
                }
                const E = G(p, S);
                return E && (d = p), E;
              }))
                w(a), ce(i, S, a, e);
              else if (o && d) {
                const p = o(d), E = c.map(
                  (b) => G(b, d) ? p : b
                );
                w(a), X(i, E, a);
              }
            };
          if (l === "cut")
            return (t, n) => {
              if (!n?.waitForSync)
                return w(a), te(i, a, e, t), s(
                  r.getState().getNestedState(e, a),
                  a
                );
            };
          if (l === "cutByValue")
            return (t) => {
              for (let n = 0; n < v.length; n++)
                v[n] === t && te(i, a, e, n);
            };
          if (l === "toggleByValue")
            return (t) => {
              const n = v.findIndex((o) => o === t);
              n > -1 ? te(i, a, e, n) : ce(i, t, a, e);
            };
          if (l === "stateFind")
            return (t) => {
              const o = u().find(
                ({ item: S }, d) => t(S, d)
              );
              if (!o) return;
              const c = [...a, o.originalIndex.toString()];
              return s(o.item, c, f);
            };
          if (l === "findWith")
            return (t, n) => {
              const c = u().find(
                ({ item: d }) => d[t] === n
              );
              if (!c) return;
              const S = [...a, c.originalIndex.toString()];
              return s(c.item, S, f);
            };
        }
        const q = a[a.length - 1];
        if (!isNaN(Number(q))) {
          const u = a.slice(0, -1), t = r.getState().getNestedState(e, u);
          if (Array.isArray(t) && l === "cut")
            return () => te(
              i,
              u,
              e,
              Number(q)
            );
        }
        if (l === "get")
          return () => {
            if (f?.validIndices && Array.isArray(v)) {
              const u = r.getState().getNestedState(e, a);
              return f.validIndices.map((t) => u[t]);
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
          return (u) => oe(g + "-" + e + "-" + u);
        if (l === "_selected") {
          const u = a.slice(0, -1), t = u.join("."), n = r.getState().getNestedState(e, u);
          return Array.isArray(n) ? Number(a[a.length - 1]) === r.getState().getSelectedIndex(e, t) : void 0;
        }
        if (l === "setSelected")
          return (u) => {
            const t = a.slice(0, -1), n = Number(a[a.length - 1]), o = t.join(".");
            u ? r.getState().setSelectedIndex(e, o, n) : r.getState().setSelectedIndex(e, o, void 0);
            const c = r.getState().getNestedState(e, [...t]);
            X(i, c, t), w(t);
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
            X(i, c, u), w(u);
          };
        if (a.length == 0) {
          if (l === "applyJsonPatch")
            return (u) => {
              const t = r.getState().cogsStateStore[e], o = _e(t, u).newDocument;
              Ae(
                e,
                r.getState().initialStateGlobal[e],
                o,
                i,
                h,
                g
              );
              const c = r.getState().stateComponents.get(e);
              if (c) {
                const S = ue(t, o), d = new Set(S);
                for (const [
                  N,
                  p
                ] of c.components.entries()) {
                  let E = !1;
                  const b = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!b.includes("none")) {
                    if (b.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (b.includes("component") && (p.paths.has("") && (E = !0), !E))
                      for (const V of d) {
                        if (p.paths.has(V)) {
                          E = !0;
                          break;
                        }
                        let _ = V.lastIndexOf(".");
                        for (; _ !== -1; ) {
                          const F = V.substring(0, _);
                          if (p.paths.has(F)) {
                            E = !0;
                            break;
                          }
                          const T = V.substring(
                            _ + 1
                          );
                          if (!isNaN(Number(T))) {
                            const $ = F.lastIndexOf(".");
                            if ($ !== -1) {
                              const x = F.substring(
                                0,
                                $
                              );
                              if (p.paths.has(x)) {
                                E = !0;
                                break;
                              }
                            }
                          }
                          _ = F.lastIndexOf(".");
                        }
                        if (E) break;
                      }
                    if (!E && b.includes("deps") && p.depsFunction) {
                      const V = p.depsFunction(o);
                      let _ = !1;
                      typeof V == "boolean" ? V && (_ = !0) : G(p.deps, V) || (p.deps = V, _ = !0), _ && (E = !0);
                    }
                    E && p.forceUpdate();
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
              z(u.key);
              const n = r.getState().cogsStateStore[e];
              try {
                const o = r.getState().getValidationErrors(u.key);
                o && o.length > 0 && o.forEach(([S]) => {
                  S && S.startsWith(u.key) && z(S);
                });
                const c = u.zodSchema.safeParse(n);
                return c.success ? !0 : (c.error.errors.forEach((d) => {
                  const N = d.path, p = d.message, E = [u.key, ...N].join(".");
                  t(E, p);
                }), se(e), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
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
              validIndices: f?.validIndices,
              children: u
            }
          );
        if (l === "_stateKey") return e;
        if (l === "_path") return a;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (u, t) => {
            if (t?.debounce)
              Ve(() => {
                X(i, u, a, "");
                const n = r.getState().getNestedState(e, a);
                t?.afterUpdate && t.afterUpdate(n);
              }, t.debounce);
            else {
              X(i, u, a, "");
              const n = r.getState().getNestedState(e, a);
              t?.afterUpdate && t.afterUpdate(n);
            }
            w(a);
          };
        if (l === "formElement")
          return (u, t) => /* @__PURE__ */ me(
            Ce,
            {
              setState: i,
              stateKey: e,
              path: a,
              child: u,
              formOpts: t
            }
          );
        const P = [...a, l], Y = r.getState().getNestedState(e, P);
        return s(Y, P, f);
      }
    }, W = new Proxy(M, O);
    return y.set(D, {
      proxy: W,
      stateVersion: k
    }), W;
  }
  return s(
    r.getState().getNestedState(e, [])
  );
}
function we(e) {
  return ae(Ge, { proxy: e });
}
function We({
  proxy: e,
  rebuildStateShape: i
}) {
  const h = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(h) ? i(
    h,
    e._path
  ).stateMapNoRender(
    (y, k, w, I, s) => e._mapFn(y, k, w, I, s)
  ) : null;
}
function Ge({
  proxy: e
}) {
  const i = Q(null), h = `${e._stateKey}-${e._path.join(".")}`;
  return le(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const y = g.parentElement, w = Array.from(y.childNodes).indexOf(g);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: w,
      effect: e._effect
    };
    r.getState().addSignalElement(h, v);
    const a = r.getState().getNestedState(e._stateKey, e._path);
    let f;
    if (e._effect)
      try {
        f = new Function(
          "state",
          `return (${e._effect})(state)`
        )(a);
      } catch (M) {
        console.error("Error evaluating effect function during mount:", M), f = a;
      }
    else
      f = a;
    f !== null && typeof f == "object" && (f = JSON.stringify(f));
    const D = document.createTextNode(String(f));
    g.replaceWith(D);
  }, [e._stateKey, e._path.join("."), e._effect]), ae("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function nt(e) {
  const i = ke(
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
  return ae("text", {}, String(i));
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
