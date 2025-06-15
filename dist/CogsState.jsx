"use client";
import { jsx as ve } from "react/jsx-runtime";
import { useState as ee, useRef as Y, useEffect as re, useLayoutEffect as fe, useMemo as Te, createElement as se, useSyncExternalStore as be, startTransition as Ne, useCallback as he } from "react";
import { transformStateFunc as Ce, isDeepEqual as L, isFunction as z, getNestedValue as H, getDifferences as Se, debounce as Pe } from "./utility.js";
import { pushFunc as ge, updateFn as K, cutFunc as ne, ValidationWrapper as _e, FormControlComponent as Me } from "./Functions.jsx";
import Oe from "superjson";
import { v4 as me } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as Ie } from "./store.js";
import { useCogsConfig as $e } from "./CogsStateClient.jsx";
import { applyPatch as Re } from "fast-json-patch";
function pe(e, i) {
  const I = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, y = I(e) || {};
  g(e, {
    ...y,
    ...i
  });
}
function we({
  stateKey: e,
  options: i,
  initialOptionsPart: I
}) {
  const g = X(e) || {}, y = I[e] || {}, V = r.getState().setInitialStateOptions, E = { ...y, ...g };
  let p = !1;
  if (i)
    for (const s in i)
      E.hasOwnProperty(s) ? (s == "localStorage" && i[s] && E[s].key !== i[s]?.key && (p = !0, E[s] = i[s]), s == "initialState" && i[s] && E[s] !== i[s] && // Different references
      !L(E[s], i[s]) && (p = !0, E[s] = i[s])) : (p = !0, E[s] = i[s]);
  p && V(e, E);
}
function nt(e, { formElements: i, validation: I }) {
  return { initialState: e, formElements: i, validation: I };
}
const rt = (e, i) => {
  let I = e;
  const [g, y] = Ce(I);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((p) => {
    y[p] = y[p] || {}, y[p].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[p].formElements || {}
      // State-specific overrides
    }, X(p) || r.getState().setInitialStateOptions(p, y[p]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const V = (p, s) => {
    const [v] = ee(s?.componentId ?? me());
    we({
      stateKey: p,
      options: s,
      initialOptionsPart: y
    });
    const a = r.getState().cogsStateStore[p] || g[p], S = s?.modifyState ? s.modifyState(a) : a, [D, O] = Le(
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
    return O;
  };
  function E(p, s) {
    we({ stateKey: p, options: s, initialOptionsPart: y }), s.localStorage && We(p, s), ce(p);
  }
  return { useCogsState: V, setCogsOptions: E };
}, {
  setUpdaterState: ae,
  setState: Z,
  getInitialOptions: X,
  getKeyState: Ae,
  getValidationErrors: je,
  setStateLog: Ue,
  updateInitialStateGlobal: ye,
  addValidationError: Fe,
  removeValidationError: q,
  setServerSyncActions: De
} = r.getState(), xe = (e, i, I, g, y) => {
  I?.log && console.log(
    "saving to localstorage",
    i,
    I.localStorage?.key,
    g
  );
  const V = z(I?.localStorage?.key) ? I.localStorage?.key(e) : I?.localStorage?.key;
  if (V && g) {
    const E = `${g}-${i}-${V}`;
    let p;
    try {
      p = ie(E)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? p
    }, v = Oe.serialize(s);
    window.localStorage.setItem(
      E,
      JSON.stringify(v.json)
    );
  }
}, ie = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, We = (e, i) => {
  const I = r.getState().cogsStateStore[e], { sessionId: g } = $e(), y = z(i?.localStorage?.key) ? i.localStorage.key(I) : i?.localStorage?.key;
  if (y && g) {
    const V = ie(
      `${g}-${e}-${y}`
    );
    if (V && V.lastUpdated > (V.lastSyncedWithServer || 0))
      return Z(e, V.state), ce(e), !0;
  }
  return !1;
}, Ve = (e, i, I, g, y, V) => {
  const E = {
    initialState: i,
    updaterState: oe(
      e,
      g,
      y,
      V
    ),
    state: I
  };
  ye(e, E.initialState), ae(e, E.updaterState), Z(e, E.state);
}, ce = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const I = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || I.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    I.forEach((g) => g());
  });
}, at = (e, i) => {
  const I = r.getState().stateComponents.get(e);
  if (I) {
    const g = `${e}////${i}`, y = I.components.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Ge = (e, i, I, g) => {
  switch (e) {
    case "update":
      return {
        oldValue: H(i, g),
        newValue: H(I, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: H(I, g)
      };
    case "cut":
      return {
        oldValue: H(i, g),
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
  localStorage: g,
  formElements: y,
  reactiveDeps: V,
  reactiveType: E,
  componentId: p,
  initialState: s,
  syncUpdate: v,
  dependencies: a,
  serverState: S
} = {}) {
  const [D, O] = ee({}), { sessionId: R } = $e();
  let W = !i;
  const [m] = ee(i ?? me()), l = r.getState().stateLog[m], te = Y(/* @__PURE__ */ new Set()), B = Y(p ?? me()), _ = Y(
    null
  );
  _.current = X(m) ?? null, re(() => {
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
  }, [v]), re(() => {
    if (s) {
      pe(m, {
        initialState: s
      });
      const t = _.current, o = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = r.getState().initialStateGlobal[m];
      if (!(c && !L(c, s) || !c) && !o)
        return;
      let u = null;
      const $ = z(t?.localStorage?.key) ? t?.localStorage?.key(s) : t?.localStorage?.key;
      $ && R && (u = ie(`${R}-${m}-${$}`));
      let w = s, A = !1;
      const T = o ? Date.now() : 0, N = u?.lastUpdated || 0, M = u?.lastSyncedWithServer || 0;
      o && T > N ? (w = t.serverState.data, A = !0) : u && N > M && (w = u.state, t?.localStorage?.onChange && t?.localStorage?.onChange(w)), Ve(
        m,
        s,
        w,
        Q,
        B.current,
        R
      ), A && $ && R && xe(w, m, t, R, Date.now()), ce(m), (Array.isArray(E) ? E : [E || "component"]).includes("none") || O({});
    }
  }, [
    s,
    S?.status,
    S?.data,
    ...a || []
  ]), fe(() => {
    W && pe(m, {
      serverSync: I,
      formElements: y,
      initialState: s,
      localStorage: g,
      middleware: _.current?.middleware
    });
    const t = `${m}////${B.current}`, n = r.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(t, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: V || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), r.getState().stateComponents.set(m, n), O({}), () => {
      const o = `${m}////${B.current}`;
      n && (n.components.delete(o), n.components.size === 0 && r.getState().stateComponents.delete(m));
    };
  }, []);
  const Q = (t, n, o, c) => {
    if (Array.isArray(n)) {
      const f = `${m}-${n.join(".")}`;
      te.current.add(f);
    }
    Z(m, (f) => {
      const u = z(t) ? t(f) : t, $ = `${m}-${n.join(".")}`;
      if ($) {
        let C = !1, h = r.getState().signalDomElements.get($);
        if ((!h || h.size === 0) && (o.updateType === "insert" || o.updateType === "cut")) {
          const k = n.slice(0, -1), b = H(u, k);
          if (Array.isArray(b)) {
            C = !0;
            const x = `${m}-${k.join(".")}`;
            h = r.getState().signalDomElements.get(x);
          }
        }
        if (h) {
          const k = C ? H(u, n.slice(0, -1)) : H(u, n);
          h.forEach(({ parentId: b, position: x, effect: j }) => {
            const P = document.querySelector(
              `[data-parent-id="${b}"]`
            );
            if (P) {
              const G = Array.from(P.childNodes);
              if (G[x]) {
                const U = j ? new Function("state", `return (${j})(state)`)(k) : k;
                G[x].textContent = String(U);
              }
            }
          });
        }
      }
      o.updateType === "update" && (c || _.current?.validation?.key) && n && q(
        (c || _.current?.validation?.key) + "." + n.join(".")
      );
      const w = n.slice(0, n.length - 1);
      o.updateType === "cut" && _.current?.validation?.key && q(
        _.current?.validation?.key + "." + w.join(".")
      ), o.updateType === "insert" && _.current?.validation?.key && je(
        _.current?.validation?.key + "." + w.join(".")
      ).filter(([h, k]) => {
        let b = h?.split(".").length;
        if (h == w.join(".") && b == w.length - 1) {
          let x = h + "." + w;
          q(h), Fe(x, k);
        }
      });
      const A = r.getState().stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", A), A) {
        const C = Se(f, u), h = new Set(C), k = o.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          b,
          x
        ] of A.components.entries()) {
          let j = !1;
          const P = Array.isArray(x.reactiveType) ? x.reactiveType : [x.reactiveType || "component"];
          if (console.log("component", x), !P.includes("none")) {
            if (P.includes("all")) {
              x.forceUpdate();
              continue;
            }
            if (P.includes("component") && ((x.paths.has(k) || x.paths.has("")) && (j = !0), !j))
              for (const G of h) {
                let U = G;
                for (; ; ) {
                  if (x.paths.has(U)) {
                    j = !0;
                    break;
                  }
                  const J = U.lastIndexOf(".");
                  if (J !== -1) {
                    const le = U.substring(
                      0,
                      J
                    );
                    if (!isNaN(
                      Number(U.substring(J + 1))
                    ) && x.paths.has(le)) {
                      j = !0;
                      break;
                    }
                    U = le;
                  } else
                    U = "";
                  if (U === "")
                    break;
                }
                if (j) break;
              }
            if (!j && P.includes("deps") && x.depsFunction) {
              const G = x.depsFunction(u);
              let U = !1;
              typeof G == "boolean" ? G && (U = !0) : L(x.deps, G) || (x.deps = G, U = !0), U && (j = !0);
            }
            j && x.forceUpdate();
          }
        }
      }
      const T = Date.now();
      n = n.map((C, h) => {
        const k = n.slice(0, -1), b = H(u, k);
        return h === n.length - 1 && ["insert", "cut"].includes(o.updateType) ? (b.length - 1).toString() : C;
      });
      const { oldValue: N, newValue: M } = Ge(
        o.updateType,
        f,
        u,
        n
      ), F = {
        timeStamp: T,
        stateKey: m,
        path: n,
        updateType: o.updateType,
        status: "new",
        oldValue: N,
        newValue: M
      };
      if (Ue(m, (C) => {
        const k = [...C ?? [], F].reduce((b, x) => {
          const j = `${x.stateKey}:${JSON.stringify(x.path)}`, P = b.get(j);
          return P ? (P.timeStamp = Math.max(P.timeStamp, x.timeStamp), P.newValue = x.newValue, P.oldValue = P.oldValue ?? x.oldValue, P.updateType = x.updateType) : b.set(j, { ...x }), b;
        }, /* @__PURE__ */ new Map());
        return Array.from(k.values());
      }), xe(
        u,
        m,
        _.current,
        R
      ), _.current?.middleware && _.current.middleware({
        updateLog: l,
        update: F
      }), _.current?.serverSync) {
        const C = r.getState().serverState[m], h = _.current?.serverSync;
        De(m, {
          syncKey: typeof h.syncKey == "string" ? h.syncKey : h.syncKey({ state: u }),
          rollBackState: C,
          actionTimeStamp: Date.now() + (h.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return u;
    });
  };
  r.getState().updaterState[m] || (ae(
    m,
    oe(
      m,
      Q,
      B.current,
      R
    )
  ), r.getState().cogsStateStore[m] || Z(m, e), r.getState().initialStateGlobal[m] || ye(m, e));
  const d = Te(() => oe(
    m,
    Q,
    B.current,
    R
  ), [m, R]);
  return [Ae(m), d];
}
function oe(e, i, I, g) {
  const y = /* @__PURE__ */ new Map();
  let V = 0;
  const E = (v) => {
    const a = v.join(".");
    for (const [S] of y)
      (S === a || S.startsWith(a + ".")) && y.delete(S);
    V++;
  }, p = {
    removeValidation: (v) => {
      v?.validationKey && q(v.validationKey);
    },
    revertToInitialState: (v) => {
      const a = r.getState().getInitialOptions(e)?.validation;
      a?.key && q(a?.key), v?.validationKey && q(v.validationKey);
      const S = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), y.clear(), V++;
      const D = s(S, []), O = X(e), R = z(O?.localStorage?.key) ? O?.localStorage?.key(S) : O?.localStorage?.key, W = `${g}-${e}-${R}`;
      W && localStorage.removeItem(W), ae(e, D), Z(e, S);
      const m = r.getState().stateComponents.get(e);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), V++;
      const a = oe(
        e,
        i,
        I,
        g
      ), S = r.getState().initialStateGlobal[e], D = X(e), O = z(D?.localStorage?.key) ? D?.localStorage?.key(S) : D?.localStorage?.key, R = `${g}-${e}-${O}`;
      return localStorage.getItem(R) && localStorage.removeItem(R), Ne(() => {
        ye(e, v), ae(e, a), Z(e, v);
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
      return !!(v && L(v, Ae(e)));
    }
  };
  function s(v, a = [], S) {
    const D = a.map(String).join(".");
    y.get(D);
    const O = function() {
      return r().getNestedState(e, a);
    };
    Object.keys(p).forEach((m) => {
      O[m] = p[m];
    });
    const R = {
      apply(m, l, te) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${a.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, a);
      },
      get(m, l) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
        const te = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !te.has(l)) {
          const d = `${e}////${I}`, t = r.getState().stateComponents.get(e);
          if (t) {
            const n = t.components.get(d);
            if (n && !n.paths.has("")) {
              const o = a.join(".");
              let c = !0;
              for (const f of n.paths)
                if (o.startsWith(f) && (o === f || o[f.length] === ".")) {
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
                  const $ = [o, ...u.path].join(".");
                  r.getState().addValidationError($, u.message);
                });
                const f = r.getState().stateComponents.get(e);
                f && f.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return c?.success && t.onSuccess ? t.onSuccess(c.data) : !c?.success && t.onError && t.onError(c.error), c;
            } catch (c) {
              return t.onError && t.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = r.getState().getNestedState(e, a), t = r.getState().initialStateGlobal[e], n = H(t, a);
          return L(d, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              e,
              a
            ), t = r.getState().initialStateGlobal[e], n = H(t, a);
            return L(d, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[e], t = X(e), n = z(t?.localStorage?.key) ? t?.localStorage?.key(d) : t?.localStorage?.key, o = `${g}-${e}-${n}`;
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
              const f = Y(null), u = Y({ startIndex: 0, endIndex: 50 }), [$, w] = ee({
                startIndex: 0,
                endIndex: 50
              }), A = r().getNestedState(
                e,
                a
              ), T = A.length, N = Te(() => {
                const h = Array.from(
                  { length: $.endIndex - $.startIndex },
                  (b, x) => $.startIndex + x
                ).filter((b) => b < T), k = h.map((b) => A[b]);
                return s(k, a, {
                  ...S,
                  validIndices: h
                });
              }, [$.startIndex, $.endIndex, A]);
              fe(() => {
                const h = f.current;
                if (!h) return;
                const k = () => {
                  const { scrollTop: b, clientHeight: x, scrollHeight: j } = h, P = j - b - x < 2, G = Math.floor(b / n), U = Math.ceil(
                    (b + x) / n
                  ), J = u.current;
                  if (!(G < J.startIndex + o || U > J.endIndex - o || P && J.endIndex < T)) return;
                  let de = Math.max(0, G - o * 3), ue = Math.min(T, U + o * 3);
                  if (P) {
                    ue = T;
                    const ke = Math.ceil(x / n);
                    de = Math.max(0, T - ke - o * 2);
                  }
                  u.current = { startIndex: de, endIndex: ue }, w({ startIndex: de, endIndex: ue });
                };
                if (h.addEventListener("scroll", k, {
                  passive: !0
                }), c && T > 0) {
                  const b = Math.ceil(
                    h.clientHeight / n
                  ), x = Math.max(
                    0,
                    T - b - o * 2
                  );
                  u.current = {
                    startIndex: x,
                    endIndex: T
                  }, w({ startIndex: x, endIndex: T }), h.scrollTop = h.scrollHeight;
                } else
                  k();
                return () => {
                  h.removeEventListener("scroll", k);
                };
              }, [T, n, o, c]), re(() => {
                if (c && f.current && T > 0) {
                  const h = f.current;
                  h.scrollHeight - h.scrollTop - h.clientHeight < 50 && (h.scrollTop = h.scrollHeight);
                }
              }, [T, c]);
              const M = he(
                (h = "smooth") => {
                  f.current && f.current.scrollTo({
                    top: f.current.scrollHeight,
                    behavior: h
                  });
                },
                []
              ), F = he(
                (h, k = "smooth") => {
                  f.current && f.current.scrollTo({
                    top: h * n,
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
                    height: `${T * n}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    paddingTop: `${$.startIndex * n}px`
                  }
                }
              };
              return {
                virtualState: N,
                virtualizerProps: C,
                scrollToBottom: M,
                scrollToIndex: F
              };
            };
          if (l === "stateSort")
            return (t) => {
              const o = [...d()].sort(
                (u, $) => t(u.item, $.item)
              ), c = o.map(({ item: u }) => u), f = {
                ...S,
                validIndices: o.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, a, f);
            };
          if (l === "stateFilter")
            return (t) => {
              const o = d().filter(
                ({ item: u }, $) => t(u, $)
              ), c = o.map(({ item: u }) => u), f = {
                ...S,
                validIndices: o.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, a, f);
            };
          if (l === "stateMap")
            return (t) => {
              const n = r.getState().getNestedState(e, a);
              return Array.isArray(n) ? (S?.validIndices || Array.from({ length: n.length }, (c, f) => f)).map((c, f) => {
                const u = n[c], $ = [...a, c.toString()], w = s(u, $, S);
                return t(u, w, {
                  register: () => {
                    const [, T] = ee({}), N = `${I}-${a.join(".")}-${c}`;
                    fe(() => {
                      const M = `${e}////${N}`, F = r.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return F.components.set(M, {
                        forceUpdate: () => T({}),
                        paths: /* @__PURE__ */ new Set([$.join(".")])
                      }), r.getState().stateComponents.set(e, F), () => {
                        const C = r.getState().stateComponents.get(e);
                        C && C.components.delete(M);
                      };
                    }, [e, N]);
                  },
                  index: f,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${a.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (t) => v.map((o, c) => {
              let f;
              S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
              const u = [...a, f.toString()], $ = s(o, u, S);
              return t(
                o,
                $,
                c,
                v,
                s(v, a, S)
              );
            });
          if (l === "$stateMap")
            return (t) => se(He, {
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
              y.clear(), V++;
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
            return (t) => (E(a), ge(i, t, a, e), s(
              r.getState().getNestedState(e, a),
              a
            ));
          if (l === "uniqueInsert")
            return (t, n, o) => {
              const c = r.getState().getNestedState(e, a), f = z(t) ? t(c) : t;
              let u = null;
              if (!c.some((w) => {
                if (n) {
                  const T = n.every(
                    (N) => L(w[N], f[N])
                  );
                  return T && (u = w), T;
                }
                const A = L(w, f);
                return A && (u = w), A;
              }))
                E(a), ge(i, f, a, e);
              else if (o && u) {
                const w = o(u), A = c.map(
                  (T) => L(T, u) ? w : T
                );
                E(a), K(i, A, a);
              }
            };
          if (l === "cut")
            return (t, n) => {
              if (!n?.waitForSync)
                return E(a), ne(i, a, e, t), s(
                  r.getState().getNestedState(e, a),
                  a
                );
            };
          if (l === "cutByValue")
            return (t) => {
              for (let n = 0; n < v.length; n++)
                v[n] === t && ne(i, a, e, n);
            };
          if (l === "toggleByValue")
            return (t) => {
              const n = v.findIndex((o) => o === t);
              n > -1 ? ne(i, a, e, n) : ge(i, t, a, e);
            };
          if (l === "stateFind")
            return (t) => {
              const o = d().find(
                ({ item: f }, u) => t(f, u)
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
              const f = [...a, c.originalIndex.toString()];
              return s(c.item, f, S);
            };
        }
        const B = a[a.length - 1];
        if (!isNaN(Number(B))) {
          const d = a.slice(0, -1), t = r.getState().getNestedState(e, d);
          if (Array.isArray(t) && l === "cut")
            return () => ne(
              i,
              d,
              e,
              Number(B)
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
          return (d) => ie(g + "-" + e + "-" + d);
        if (l === "_selected") {
          const d = a.slice(0, -1), t = d.join("."), n = r.getState().getNestedState(e, d);
          return Array.isArray(n) ? Number(a[a.length - 1]) === r.getState().getSelectedIndex(e, t) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const t = a.slice(0, -1), n = Number(a[a.length - 1]), o = t.join(".");
            d ? r.getState().setSelectedIndex(e, o, n) : r.getState().setSelectedIndex(e, o, void 0);
            const c = r.getState().getNestedState(e, [...t]);
            K(i, c, t), E(t);
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
            K(i, c, d), E(d);
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
                g
              );
              const c = r.getState().stateComponents.get(e);
              if (c) {
                const f = Se(t, o), u = new Set(f);
                for (const [
                  $,
                  w
                ] of c.components.entries()) {
                  let A = !1;
                  const T = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!T.includes("none")) {
                    if (T.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (T.includes("component") && (w.paths.has("") && (A = !0), !A))
                      for (const N of u) {
                        if (w.paths.has(N)) {
                          A = !0;
                          break;
                        }
                        let M = N.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const F = N.substring(0, M);
                          if (w.paths.has(F)) {
                            A = !0;
                            break;
                          }
                          const C = N.substring(
                            M + 1
                          );
                          if (!isNaN(Number(C))) {
                            const h = F.lastIndexOf(".");
                            if (h !== -1) {
                              const k = F.substring(
                                0,
                                h
                              );
                              if (w.paths.has(k)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          M = F.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && T.includes("deps") && w.depsFunction) {
                      const N = w.depsFunction(o);
                      let M = !1;
                      typeof N == "boolean" ? N && (M = !0) : L(w.deps, N) || (w.deps = N, M = !0), M && (A = !0);
                    }
                    A && w.forceUpdate();
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
                o && o.length > 0 && o.forEach(([f]) => {
                  f && f.startsWith(d.key) && q(f);
                });
                const c = d.zodSchema.safeParse(n);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const $ = u.path, w = u.message, A = [d.key, ...$].join(".");
                  t(A, w);
                }), ce(e), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (l === "_componentId") return I;
          if (l === "getComponents")
            return () => r().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => Ie.getState().getFormRefsByStateKey(e);
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
          return () => Ie.getState().getFormRef(e + "." + a.join("."));
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
                K(i, d, a, "");
                const n = r.getState().getNestedState(e, a);
                t?.afterUpdate && t.afterUpdate(n);
              }, t.debounce);
            else {
              K(i, d, a, "");
              const n = r.getState().getNestedState(e, a);
              t?.afterUpdate && t.afterUpdate(n);
            }
            E(a);
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
        const _ = [...a, l], Q = r.getState().getNestedState(e, _);
        return s(Q, _, S);
      }
    }, W = new Proxy(O, R);
    return y.set(D, {
      proxy: W,
      stateVersion: V
    }), W;
  }
  return s(
    r.getState().getNestedState(e, [])
  );
}
function Ee(e) {
  return se(Be, { proxy: e });
}
function He({
  proxy: e,
  rebuildStateShape: i
}) {
  const I = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(I) ? i(
    I,
    e._path
  ).stateMapNoRender(
    (y, V, E, p, s) => e._mapFn(y, V, E, p, s)
  ) : null;
}
function Be({
  proxy: e
}) {
  const i = Y(null), I = `${e._stateKey}-${e._path.join(".")}`;
  return re(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const y = g.parentElement, E = Array.from(y.childNodes).indexOf(g);
    let p = y.getAttribute("data-parent-id");
    p || (p = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", p));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: p,
      position: E,
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
    g.replaceWith(D);
  }, [e._stateKey, e._path.join("."), e._effect]), se("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": I
  });
}
function ot(e) {
  const i = be(
    (I) => {
      const g = r.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(e._stateKey, {
        forceUpdate: I,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => g.components.delete(e._stateKey);
    },
    () => r.getState().getNestedState(e._stateKey, e._path)
  );
  return se("text", {}, String(i));
}
export {
  Ee as $cogsSignal,
  ot as $cogsSignalStore,
  nt as addStateOptions,
  rt as createCogsState,
  at as notifyComponent,
  Le as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
