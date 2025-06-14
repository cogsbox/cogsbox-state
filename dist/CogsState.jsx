"use client";
import { jsx as Ie } from "react/jsx-runtime";
import { useState as te, useRef as Y, useEffect as ie, useLayoutEffect as me, useMemo as $e, createElement as de, useSyncExternalStore as Ce, startTransition as _e, useCallback as ge } from "react";
import { transformStateFunc as Oe, isDeepEqual as L, isFunction as z, getNestedValue as H, getDifferences as ve, debounce as Me } from "./utility.js";
import { pushFunc as Se, updateFn as ee, cutFunc as se, ValidationWrapper as je, FormControlComponent as Fe } from "./Functions.jsx";
import Re from "superjson";
import { v4 as ye } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as pe } from "./store.js";
import { useCogsConfig as xe } from "./CogsStateClient.jsx";
import { applyPatch as Ue } from "fast-json-patch";
function we(e, i) {
  const h = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, y = h(e) || {};
  g(e, {
    ...y,
    ...i
  });
}
function Te({
  stateKey: e,
  options: i,
  initialOptionsPart: h
}) {
  const g = Z(e) || {}, y = h[e] || {}, x = r.getState().setInitialStateOptions, T = { ...y, ...g };
  let p = !1;
  if (i)
    for (const s in i)
      T.hasOwnProperty(s) ? (s == "localStorage" && i[s] && T[s].key !== i[s]?.key && (p = !0, T[s] = i[s]), s == "initialState" && i[s] && T[s] !== i[s] && // Different references
      !L(T[s], i[s]) && (p = !0, T[s] = i[s])) : (p = !0, T[s] = i[s]);
  p && x(e, T);
}
function at(e, { formElements: i, validation: h }) {
  return { initialState: e, formElements: i, validation: h };
}
const st = (e, i) => {
  let h = e;
  const [g, y] = Oe(h);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((p) => {
    y[p] = y[p] || {}, y[p].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[p].formElements || {}
      // State-specific overrides
    }, Z(p) || r.getState().setInitialStateOptions(p, y[p]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const x = (p, s) => {
    const [m] = te(s?.componentId ?? ye());
    Te({
      stateKey: p,
      options: s,
      initialOptionsPart: y
    });
    const o = r.getState().cogsStateStore[p] || g[p], S = s?.modifyState ? s.modifyState(o) : o, [D, j] = qe(
      S,
      {
        stateKey: p,
        syncUpdate: s?.syncUpdate,
        componentId: m,
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
    return j;
  };
  function T(p, s) {
    Te({ stateKey: p, options: s, initialOptionsPart: y }), s.localStorage && He(p, s), fe(p);
  }
  return { useCogsState: x, setCogsOptions: T };
}, {
  setUpdaterState: ce,
  setState: J,
  getInitialOptions: Z,
  getKeyState: Ae,
  getValidationErrors: De,
  setStateLog: We,
  updateInitialStateGlobal: he,
  addValidationError: Ge,
  removeValidationError: q,
  setServerSyncActions: Le
} = r.getState(), Ee = (e, i, h, g, y) => {
  h?.log && console.log(
    "saving to localstorage",
    i,
    h.localStorage?.key,
    g
  );
  const x = z(h?.localStorage?.key) ? h.localStorage?.key(e) : h?.localStorage?.key;
  if (x && g) {
    const T = `${g}-${i}-${x}`;
    let p;
    try {
      p = ue(T)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? p
    }, m = Re.serialize(s);
    window.localStorage.setItem(
      T,
      JSON.stringify(m.json)
    );
  }
}, ue = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, He = (e, i) => {
  const h = r.getState().cogsStateStore[e], { sessionId: g } = xe(), y = z(i?.localStorage?.key) ? i.localStorage.key(h) : i?.localStorage?.key;
  if (y && g) {
    const x = ue(
      `${g}-${e}-${y}`
    );
    if (x && x.lastUpdated > (x.lastSyncedWithServer || 0))
      return J(e, x.state), fe(e), !0;
  }
  return !1;
}, Ve = (e, i, h, g, y, x) => {
  const T = {
    initialState: i,
    updaterState: le(
      e,
      g,
      y,
      x
    ),
    state: h
  };
  he(e, T.initialState), ce(e, T.updaterState), J(e, T.state);
}, fe = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const h = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || h.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((g) => g());
  });
}, it = (e, i) => {
  const h = r.getState().stateComponents.get(e);
  if (h) {
    const g = `${e}////${i}`, y = h.components.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Be = (e, i, h, g) => {
  switch (e) {
    case "update":
      return {
        oldValue: H(i, g),
        newValue: H(h, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: H(h, g)
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
function qe(e, {
  stateKey: i,
  serverSync: h,
  localStorage: g,
  formElements: y,
  reactiveDeps: x,
  reactiveType: T,
  componentId: p,
  initialState: s,
  syncUpdate: m,
  dependencies: o,
  serverState: S
} = {}) {
  const [D, j] = te({}), { sessionId: F } = xe();
  let W = !i;
  const [v] = te(i ?? ye()), l = r.getState().stateLog[v], ne = Y(/* @__PURE__ */ new Set()), B = Y(p ?? ye()), _ = Y(
    null
  );
  _.current = Z(v) ?? null, ie(() => {
    if (m && m.stateKey === v && m.path?.[0]) {
      J(v, (n) => ({
        ...n,
        [m.path[0]]: m.newValue
      }));
      const t = `${m.stateKey}:${m.path.join(".")}`;
      r.getState().setSyncInfo(t, {
        timeStamp: m.timeStamp,
        userId: m.userId
      });
    }
  }, [m]), ie(() => {
    if (s) {
      we(v, {
        initialState: s
      });
      const t = _.current, a = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = r.getState().initialStateGlobal[v];
      if (!(c && !L(c, s) || !c) && !a)
        return;
      let u = null;
      const b = z(t?.localStorage?.key) ? t?.localStorage?.key(s) : t?.localStorage?.key;
      b && F && (u = ue(`${F}-${v}-${b}`));
      let w = s, $ = !1;
      const A = a ? Date.now() : 0, k = u?.lastUpdated || 0, O = u?.lastSyncedWithServer || 0;
      a && A > k ? (w = t.serverState.data, $ = !0) : u && k > O && (w = u.state, t?.localStorage?.onChange && t?.localStorage?.onChange(w)), Ve(
        v,
        s,
        w,
        X,
        B.current,
        F
      ), $ && b && F && Ee(w, v, t, F, Date.now()), fe(v), (Array.isArray(T) ? T : [T || "component"]).includes("none") || j({});
    }
  }, [
    s,
    S?.status,
    S?.data,
    ...o || []
  ]), me(() => {
    W && we(v, {
      serverSync: h,
      formElements: y,
      initialState: s,
      localStorage: g,
      middleware: _.current?.middleware
    });
    const t = `${v}////${B.current}`, n = r.getState().stateComponents.get(v) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(t, {
      forceUpdate: () => j({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: x || void 0,
      reactiveType: T ?? ["component", "deps"]
    }), r.getState().stateComponents.set(v, n), j({}), () => {
      const a = `${v}////${B.current}`;
      n && (n.components.delete(a), n.components.size === 0 && r.getState().stateComponents.delete(v));
    };
  }, []);
  const X = (t, n, a, c) => {
    if (Array.isArray(n)) {
      const f = `${v}-${n.join(".")}`;
      ne.current.add(f);
    }
    J(v, (f) => {
      const u = z(t) ? t(f) : t, b = `${v}-${n.join(".")}`;
      if (b) {
        let R = !1, V = r.getState().signalDomElements.get(b);
        if ((!V || V.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const M = n.slice(0, -1), E = H(u, M);
          if (Array.isArray(E)) {
            R = !0;
            const I = `${v}-${M.join(".")}`;
            V = r.getState().signalDomElements.get(I);
          }
        }
        if (V) {
          const M = R ? H(u, n.slice(0, -1)) : H(u, n);
          V.forEach(({ parentId: E, position: I, effect: N }) => {
            const C = document.querySelector(
              `[data-parent-id="${E}"]`
            );
            if (C) {
              const G = Array.from(C.childNodes);
              if (G[I]) {
                const P = N ? new Function("state", `return (${N})(state)`)(M) : M;
                G[I].textContent = String(P);
              }
            }
          });
        }
      }
      a.updateType === "update" && (c || _.current?.validation?.key) && n && q(
        (c || _.current?.validation?.key) + "." + n.join(".")
      );
      const w = n.slice(0, n.length - 1);
      a.updateType === "cut" && _.current?.validation?.key && q(
        _.current?.validation?.key + "." + w.join(".")
      ), a.updateType === "insert" && _.current?.validation?.key && De(
        _.current?.validation?.key + "." + w.join(".")
      ).filter(([V, M]) => {
        let E = V?.split(".").length;
        if (V == w.join(".") && E == w.length - 1) {
          let I = V + "." + w;
          q(V), Ge(I, M);
        }
      });
      const $ = r.getState().stateComponents.get(v);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", $), $) {
        const R = ve(f, u), V = new Set(R), M = a.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          E,
          I
        ] of $.components.entries()) {
          let N = !1;
          const C = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (console.log("component", I), !C.includes("none")) {
            if (C.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if (C.includes("component") && ((I.paths.has(M) || I.paths.has("")) && (N = !0), !N))
              for (const G of V) {
                let P = G;
                for (; ; ) {
                  if (I.paths.has(P)) {
                    N = !0;
                    break;
                  }
                  const Q = P.lastIndexOf(".");
                  if (Q !== -1) {
                    const re = P.substring(
                      0,
                      Q
                    );
                    if (!isNaN(
                      Number(P.substring(Q + 1))
                    ) && I.paths.has(re)) {
                      N = !0;
                      break;
                    }
                    P = re;
                  } else
                    P = "";
                  if (P === "")
                    break;
                }
                if (N) break;
              }
            if (!N && C.includes("deps") && I.depsFunction) {
              const G = I.depsFunction(u);
              let P = !1;
              typeof G == "boolean" ? G && (P = !0) : L(I.deps, G) || (I.deps = G, P = !0), P && (N = !0);
            }
            N && I.forceUpdate();
          }
        }
      }
      const A = Date.now();
      n = n.map((R, V) => {
        const M = n.slice(0, -1), E = H(u, M);
        return V === n.length - 1 && ["insert", "cut"].includes(a.updateType) ? (E.length - 1).toString() : R;
      });
      const { oldValue: k, newValue: O } = Be(
        a.updateType,
        f,
        u,
        n
      ), U = {
        timeStamp: A,
        stateKey: v,
        path: n,
        updateType: a.updateType,
        status: "new",
        oldValue: k,
        newValue: O
      };
      if (We(v, (R) => {
        const M = [...R ?? [], U].reduce((E, I) => {
          const N = `${I.stateKey}:${JSON.stringify(I.path)}`, C = E.get(N);
          return C ? (C.timeStamp = Math.max(C.timeStamp, I.timeStamp), C.newValue = I.newValue, C.oldValue = C.oldValue ?? I.oldValue, C.updateType = I.updateType) : E.set(N, { ...I }), E;
        }, /* @__PURE__ */ new Map());
        return Array.from(M.values());
      }), Ee(
        u,
        v,
        _.current,
        F
      ), _.current?.middleware && _.current.middleware({
        updateLog: l,
        update: U
      }), _.current?.serverSync) {
        const R = r.getState().serverState[v], V = _.current?.serverSync;
        Le(v, {
          syncKey: typeof V.syncKey == "string" ? V.syncKey : V.syncKey({ state: u }),
          rollBackState: R,
          actionTimeStamp: Date.now() + (V.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return u;
    });
  };
  r.getState().updaterState[v] || (ce(
    v,
    le(
      v,
      X,
      B.current,
      F
    )
  ), r.getState().cogsStateStore[v] || J(v, e), r.getState().initialStateGlobal[v] || he(v, e));
  const d = $e(() => le(
    v,
    X,
    B.current,
    F
  ), [v, F]);
  return [Ae(v), d];
}
function le(e, i, h, g) {
  const y = /* @__PURE__ */ new Map();
  let x = 0;
  const T = (m) => {
    const o = m.join(".");
    for (const [S] of y)
      (S === o || S.startsWith(o + ".")) && y.delete(S);
    x++;
  }, p = {
    removeValidation: (m) => {
      m?.validationKey && q(m.validationKey);
    },
    revertToInitialState: (m) => {
      const o = r.getState().getInitialOptions(e)?.validation;
      o?.key && q(o?.key), m?.validationKey && q(m.validationKey);
      const S = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), y.clear(), x++;
      const D = s(S, []), j = Z(e), F = z(j?.localStorage?.key) ? j?.localStorage?.key(S) : j?.localStorage?.key, W = `${g}-${e}-${F}`;
      W && localStorage.removeItem(W), ce(e, D), J(e, S);
      const v = r.getState().stateComponents.get(e);
      return v && v.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (m) => {
      y.clear(), x++;
      const o = le(
        e,
        i,
        h,
        g
      ), S = r.getState().initialStateGlobal[e], D = Z(e), j = z(D?.localStorage?.key) ? D?.localStorage?.key(S) : D?.localStorage?.key, F = `${g}-${e}-${j}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), _e(() => {
        he(e, m), ce(e, o), J(e, m);
        const W = r.getState().stateComponents.get(e);
        W && W.components.forEach((v) => {
          v.forceUpdate();
        });
      }), {
        fetchId: (W) => o.get()[W]
      };
    },
    _initialState: r.getState().initialStateGlobal[e],
    _serverState: r.getState().serverState[e],
    _isLoading: r.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const m = r.getState().serverState[e];
      return !!(m && L(m, Ae(e)));
    }
  };
  function s(m, o = [], S) {
    const D = o.map(String).join(".");
    y.get(D);
    const j = function() {
      return r().getNestedState(e, o);
    };
    Object.keys(p).forEach((v) => {
      j[v] = p[v];
    });
    const F = {
      apply(v, l, ne) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${o.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, o);
      },
      get(v, l) {
        S?.validIndices && !Array.isArray(m) && (S = { ...S, validIndices: void 0 });
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
          const d = `${e}////${h}`, t = r.getState().stateComponents.get(e);
          if (t) {
            const n = t.components.get(d);
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
          return () => ve(
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
                  const b = [a, ...u.path].join(".");
                  r.getState().addValidationError(b, u.message);
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
          const d = r.getState().getNestedState(e, o), t = r.getState().initialStateGlobal[e], n = H(t, o);
          return L(d, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              e,
              o
            ), t = r.getState().initialStateGlobal[e], n = H(t, o);
            return L(d, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[e], t = Z(e), n = z(t?.localStorage?.key) ? t?.localStorage?.key(d) : t?.localStorage?.key, a = `${g}-${e}-${n}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = r.getState().getInitialOptions(e)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(d.key + "." + o.join("."));
          };
        if (Array.isArray(m)) {
          const d = () => S?.validIndices ? m.map((n, a) => ({
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
                return s(
                  m[t],
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
              const f = Y(null), u = Y(!0), [b, w] = te({
                startIndex: 0,
                endIndex: Math.min(20, m.length)
              }), A = r().getNestedState(
                e,
                o
              ).length, k = A * n, O = $e(() => s(m, o, S).stateFilter((I, N) => N >= b.startIndex && N < b.endIndex), [b.startIndex, b.endIndex, A]);
              me(() => {
                const E = f.current;
                if (!E) return;
                let I;
                const N = () => {
                  if (!E) return;
                  const P = E.scrollTop, Q = E.clientHeight, re = Math.floor(P / n), ke = Math.ceil(
                    (P + Q) / n
                  ), oe = Math.max(0, re - a), ae = Math.min(A, ke + a);
                  w((K) => {
                    const Ne = Math.abs(K.startIndex - oe), Pe = Math.abs(K.endIndex - ae);
                    return Ne > a / 2 || Pe > a / 2 ? { startIndex: oe, endIndex: ae } : oe === 0 && K.startIndex !== 0 || ae === A && K.endIndex !== A ? { startIndex: oe, endIndex: ae } : K;
                  });
                }, C = () => {
                  const P = f.current;
                  P && (clearTimeout(I), u.current = P.scrollHeight - P.scrollTop - P.clientHeight < 1, I = setTimeout(N, 10));
                };
                N(), c && (E.scrollTop = E.scrollHeight), E.addEventListener("scroll", C, {
                  passive: !0
                });
                const G = new ResizeObserver(() => {
                  N(), c && u.current && (E.scrollTop = E.scrollHeight);
                });
                return G.observe(E), () => {
                  clearTimeout(I), E.removeEventListener("scroll", C), G.disconnect();
                };
              }, [A, n, a, c]), ie(() => {
                c && u.current && f.current && (f.current.scrollTop = f.current.scrollHeight);
              }, [A]);
              const U = ge(
                (E, I = "auto") => {
                  f.current?.scrollTo({ top: E, behavior: I });
                },
                []
              ), R = ge(
                (E = "smooth") => {
                  const I = f.current;
                  I && I.scrollTo({
                    top: I.scrollHeight,
                    behavior: E
                  });
                },
                []
              ), V = ge(
                (E, I = "smooth") => {
                  U(E * n, I);
                },
                [U, n]
              ), M = {
                outer: {
                  ref: f,
                  style: {
                    overflowY: "auto",
                    position: "relative",
                    height: "100%"
                  }
                },
                inner: {
                  style: {
                    position: "relative",
                    height: `${k}px`,
                    width: "100%"
                  }
                },
                list: {
                  style: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    transform: `translateY(${b.startIndex * n}px)`
                  }
                }
              };
              return {
                virtualState: O,
                virtualizerProps: M,
                scrollToBottom: R,
                scrollToIndex: V
              };
            };
          if (l === "stateSort")
            return (t) => {
              const a = [...d()].sort(
                (u, b) => t(u.item, b.item)
              ), c = a.map(({ item: u }) => u), f = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, o, f);
            };
          if (l === "stateFilter")
            return (t) => {
              const a = d().filter(
                ({ item: u }, b) => t(u, b)
              ), c = a.map(({ item: u }) => u), f = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, o, f);
            };
          if (l === "stateMap")
            return (t) => {
              const n = r.getState().getNestedState(e, o);
              return Array.isArray(n) ? n.map((a, c) => {
                let f;
                S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
                const u = [...o, f.toString()], b = s(a, u, S);
                return t(a, b, {
                  register: () => {
                    const [, $] = te({}), A = `${h}-${o.join(".")}-${f}`;
                    me(() => {
                      const k = `${e}////${A}`, O = r.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return O.components.set(k, {
                        forceUpdate: () => $({}),
                        paths: /* @__PURE__ */ new Set([u.join(".")])
                        // ATOMIC: Subscribes only to this item's path.
                      }), r.getState().stateComponents.set(e, O), () => {
                        const U = r.getState().stateComponents.get(e);
                        U && U.components.delete(k);
                      };
                    }, [e, A]);
                  },
                  index: c,
                  originalIndex: f
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${o.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (t) => m.map((a, c) => {
              let f;
              S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
              const u = [...o, f.toString()], b = s(a, u, S);
              return t(
                a,
                b,
                c,
                m,
                s(m, o, S)
              );
            });
          if (l === "$stateMap")
            return (t) => de(ze, {
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
              const n = m;
              y.clear(), x++;
              const a = n.flatMap(
                (c) => c[t] ?? []
              );
              return s(
                a,
                [...o, "[*]", t],
                S
              );
            };
          if (l === "index")
            return (t) => {
              const n = m[t];
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
            return (t) => (T(o), Se(i, t, o, e), s(
              r.getState().getNestedState(e, o),
              o
            ));
          if (l === "uniqueInsert")
            return (t, n, a) => {
              const c = r.getState().getNestedState(e, o), f = z(t) ? t(c) : t;
              let u = null;
              if (!c.some((w) => {
                if (n) {
                  const A = n.every(
                    (k) => L(w[k], f[k])
                  );
                  return A && (u = w), A;
                }
                const $ = L(w, f);
                return $ && (u = w), $;
              }))
                T(o), Se(i, f, o, e);
              else if (a && u) {
                const w = a(u), $ = c.map(
                  (A) => L(A, u) ? w : A
                );
                T(o), ee(i, $, o);
              }
            };
          if (l === "cut")
            return (t, n) => {
              if (!n?.waitForSync)
                return T(o), se(i, o, e, t), s(
                  r.getState().getNestedState(e, o),
                  o
                );
            };
          if (l === "cutByValue")
            return (t) => {
              for (let n = 0; n < m.length; n++)
                m[n] === t && se(i, o, e, n);
            };
          if (l === "toggleByValue")
            return (t) => {
              const n = m.findIndex((a) => a === t);
              n > -1 ? se(i, o, e, n) : Se(i, t, o, e);
            };
          if (l === "stateFind")
            return (t) => {
              const a = d().find(
                ({ item: f }, u) => t(f, u)
              );
              if (!a) return;
              const c = [...o, a.originalIndex.toString()];
              return s(a.item, c, S);
            };
          if (l === "findWith")
            return (t, n) => {
              const c = d().find(
                ({ item: u }) => u[t] === n
              );
              if (!c) return;
              const f = [...o, c.originalIndex.toString()];
              return s(c.item, f, S);
            };
        }
        const B = o[o.length - 1];
        if (!isNaN(Number(B))) {
          const d = o.slice(0, -1), t = r.getState().getNestedState(e, d);
          if (Array.isArray(t) && l === "cut")
            return () => se(
              i,
              d,
              e,
              Number(B)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(m)) {
              const d = r.getState().getNestedState(e, o);
              return S.validIndices.map((t) => d[t]);
            }
            return r.getState().getNestedState(e, o);
          };
        if (l === "$derive")
          return (d) => be({
            _stateKey: e,
            _path: o,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => be({
            _stateKey: e,
            _path: o
          });
        if (l === "lastSynced") {
          const d = `${e}:${o.join(".")}`;
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => ue(g + "-" + e + "-" + d);
        if (l === "_selected") {
          const d = o.slice(0, -1), t = d.join("."), n = r.getState().getNestedState(e, d);
          return Array.isArray(n) ? Number(o[o.length - 1]) === r.getState().getSelectedIndex(e, t) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const t = o.slice(0, -1), n = Number(o[o.length - 1]), a = t.join(".");
            d ? r.getState().setSelectedIndex(e, a, n) : r.getState().setSelectedIndex(e, a, void 0);
            const c = r.getState().getNestedState(e, [...t]);
            ee(i, c, t), T(t);
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
            ee(i, c, d), T(d);
          };
        if (o.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const t = r.getState().cogsStateStore[e], a = Ue(t, d).newDocument;
              Ve(
                e,
                r.getState().initialStateGlobal[e],
                a,
                i,
                h,
                g
              );
              const c = r.getState().stateComponents.get(e);
              if (c) {
                const f = ve(t, a), u = new Set(f);
                for (const [
                  b,
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
                      for (const k of u) {
                        if (w.paths.has(k)) {
                          $ = !0;
                          break;
                        }
                        let O = k.lastIndexOf(".");
                        for (; O !== -1; ) {
                          const U = k.substring(0, O);
                          if (w.paths.has(U)) {
                            $ = !0;
                            break;
                          }
                          const R = k.substring(
                            O + 1
                          );
                          if (!isNaN(Number(R))) {
                            const V = U.lastIndexOf(".");
                            if (V !== -1) {
                              const M = U.substring(
                                0,
                                V
                              );
                              if (w.paths.has(M)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          O = U.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && A.includes("deps") && w.depsFunction) {
                      const k = w.depsFunction(a);
                      let O = !1;
                      typeof k == "boolean" ? k && (O = !0) : L(w.deps, k) || (w.deps = k, O = !0), O && ($ = !0);
                    }
                    $ && w.forceUpdate();
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
                a && a.length > 0 && a.forEach(([f]) => {
                  f && f.startsWith(d.key) && q(f);
                });
                const c = d.zodSchema.safeParse(n);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const b = u.path, w = u.message, $ = [d.key, ...b].join(".");
                  t($, w);
                }), fe(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return h;
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
            return p.revertToInitialState;
          if (l === "updateInitialState") return p.updateInitialState;
          if (l === "removeValidation") return p.removeValidation;
        }
        if (l === "getFormRef")
          return () => pe.getState().getFormRef(e + "." + o.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: t
          }) => /* @__PURE__ */ Ie(
            je,
            {
              formOpts: t ? { validation: { message: "" } } : void 0,
              path: o,
              validationKey: r.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: S?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return e;
        if (l === "_path") return o;
        if (l === "_isServerSynced") return p._isServerSynced;
        if (l === "update")
          return (d, t) => {
            if (t?.debounce)
              Me(() => {
                ee(i, d, o, "");
                const n = r.getState().getNestedState(e, o);
                t?.afterUpdate && t.afterUpdate(n);
              }, t.debounce);
            else {
              ee(i, d, o, "");
              const n = r.getState().getNestedState(e, o);
              t?.afterUpdate && t.afterUpdate(n);
            }
            T(o);
          };
        if (l === "formElement")
          return (d, t) => /* @__PURE__ */ Ie(
            Fe,
            {
              setState: i,
              stateKey: e,
              path: o,
              child: d,
              formOpts: t
            }
          );
        const _ = [...o, l], X = r.getState().getNestedState(e, _);
        return s(X, _, S);
      }
    }, W = new Proxy(j, F);
    return y.set(D, {
      proxy: W,
      stateVersion: x
    }), W;
  }
  return s(
    r.getState().getNestedState(e, [])
  );
}
function be(e) {
  return de(Je, { proxy: e });
}
function ze({
  proxy: e,
  rebuildStateShape: i
}) {
  const h = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(h) ? i(
    h,
    e._path
  ).stateMapNoRender(
    (y, x, T, p, s) => e._mapFn(y, x, T, p, s)
  ) : null;
}
function Je({
  proxy: e
}) {
  const i = Y(null), h = `${e._stateKey}-${e._path.join(".")}`;
  return ie(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const y = g.parentElement, T = Array.from(y.childNodes).indexOf(g);
    let p = y.getAttribute("data-parent-id");
    p || (p = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", p));
    const m = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: p,
      position: T,
      effect: e._effect
    };
    r.getState().addSignalElement(h, m);
    const o = r.getState().getNestedState(e._stateKey, e._path);
    let S;
    if (e._effect)
      try {
        S = new Function(
          "state",
          `return (${e._effect})(state)`
        )(o);
      } catch (j) {
        console.error("Error evaluating effect function during mount:", j), S = o;
      }
    else
      S = o;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const D = document.createTextNode(String(S));
    g.replaceWith(D);
  }, [e._stateKey, e._path.join("."), e._effect]), de("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function ct(e) {
  const i = Ce(
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
  return de("text", {}, String(i));
}
export {
  be as $cogsSignal,
  ct as $cogsSignalStore,
  at as addStateOptions,
  st as createCogsState,
  it as notifyComponent,
  qe as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
