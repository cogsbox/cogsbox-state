"use client";
import { jsx as Te } from "react/jsx-runtime";
import { useState as X, useRef as K, useEffect as oe, useLayoutEffect as ie, useMemo as ve, createElement as ce, useSyncExternalStore as Pe, startTransition as Ve, useCallback as _e } from "react";
import { transformStateFunc as Ge, isDeepEqual as z, isFunction as Q, getNestedValue as q, getDifferences as ye, debounce as Le } from "./utility.js";
import { pushFunc as he, updateFn as se, cutFunc as ge, ValidationWrapper as Re, FormControlComponent as De } from "./Functions.jsx";
import Ue from "superjson";
import { v4 as pe } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as Oe } from "./store.js";
import { useCogsConfig as ke } from "./CogsStateClient.jsx";
import { applyPatch as je } from "fast-json-patch";
import He from "react-use-measure";
function Ae(e, i) {
  const m = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, T = m(e) || {};
  g(e, {
    ...T,
    ...i
  });
}
function Ne({
  stateKey: e,
  options: i,
  initialOptionsPart: m
}) {
  const g = re(e) || {}, T = m[e] || {}, N = r.getState().setInitialStateOptions, p = { ...T, ...g };
  let v = !1;
  if (i)
    for (const a in i)
      p.hasOwnProperty(a) ? (a == "localStorage" && i[a] && p[a].key !== i[a]?.key && (v = !0, p[a] = i[a]), a == "initialState" && i[a] && p[a] !== i[a] && // Different references
      !z(p[a], i[a]) && (v = !0, p[a] = i[a])) : (v = !0, p[a] = i[a]);
  v && N(e, p);
}
function dt(e, { formElements: i, validation: m }) {
  return { initialState: e, formElements: i, validation: m };
}
const ut = (e, i) => {
  let m = e;
  const [g, T] = Ge(m);
  (Object.keys(T).length > 0 || i && Object.keys(i).length > 0) && Object.keys(T).forEach((v) => {
    T[v] = T[v] || {}, T[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...T[v].formElements || {}
      // State-specific overrides
    }, re(v) || r.getState().setInitialStateOptions(v, T[v]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const N = (v, a) => {
    const [h] = X(a?.componentId ?? pe());
    Ne({
      stateKey: v,
      options: a,
      initialOptionsPart: T
    });
    const n = r.getState().cogsStateStore[v] || g[v], S = a?.modifyState ? a.modifyState(n) : n, [H, L] = Ye(
      S,
      {
        stateKey: v,
        syncUpdate: a?.syncUpdate,
        componentId: h,
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
    return L;
  };
  function p(v, a) {
    Ne({ stateKey: v, options: a, initialOptionsPart: T }), a.localStorage && qe(v, a), Ie(v);
  }
  return { useCogsState: N, setCogsOptions: p };
}, {
  setUpdaterState: fe,
  setState: te,
  getInitialOptions: re,
  getKeyState: be,
  getValidationErrors: Fe,
  setStateLog: Be,
  updateInitialStateGlobal: Ee,
  addValidationError: We,
  removeValidationError: Z,
  setServerSyncActions: ze
} = r.getState(), Ce = (e, i, m, g, T) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    g
  );
  const N = Q(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (N && g) {
    const p = `${g}-${i}-${N}`;
    let v;
    try {
      v = me(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: T ?? v
    }, h = Ue.serialize(a);
    window.localStorage.setItem(
      p,
      JSON.stringify(h.json)
    );
  }
}, me = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, qe = (e, i) => {
  const m = r.getState().cogsStateStore[e], { sessionId: g } = ke(), T = Q(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (T && g) {
    const N = me(
      `${g}-${e}-${T}`
    );
    if (N && N.lastUpdated > (N.lastSyncedWithServer || 0))
      return te(e, N.state), Ie(e), !0;
  }
  return !1;
}, Me = (e, i, m, g, T, N) => {
  const p = {
    initialState: i,
    updaterState: Se(
      e,
      g,
      T,
      N
    ),
    state: m
  };
  Ee(e, p.initialState), fe(e, p.updaterState), te(e, p.state);
}, Ie = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, gt = (e, i) => {
  const m = r.getState().stateComponents.get(e);
  if (m) {
    const g = `${e}////${i}`, T = m.components.get(g);
    if ((T ? Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"] : null)?.includes("none"))
      return;
    T && T.forceUpdate();
  }
}, Je = (e, i, m, g) => {
  switch (e) {
    case "update":
      return {
        oldValue: q(i, g),
        newValue: q(m, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: q(m, g)
      };
    case "cut":
      return {
        oldValue: q(i, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Ye(e, {
  stateKey: i,
  serverSync: m,
  localStorage: g,
  formElements: T,
  reactiveDeps: N,
  reactiveType: p,
  componentId: v,
  initialState: a,
  syncUpdate: h,
  dependencies: n,
  serverState: S
} = {}) {
  const [H, L] = X({}), { sessionId: R } = ke();
  let F = !i;
  const [I] = X(i ?? pe()), l = r.getState().stateLog[I], le = K(/* @__PURE__ */ new Set()), ee = K(v ?? pe()), P = K(
    null
  );
  P.current = re(I) ?? null, oe(() => {
    if (h && h.stateKey === I && h.path?.[0]) {
      te(I, (o) => ({
        ...o,
        [h.path[0]]: h.newValue
      }));
      const t = `${h.stateKey}:${h.path.join(".")}`;
      r.getState().setSyncInfo(t, {
        timeStamp: h.timeStamp,
        userId: h.userId
      });
    }
  }, [h]), oe(() => {
    if (a) {
      Ae(I, {
        initialState: a
      });
      const t = P.current, s = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = r.getState().initialStateGlobal[I];
      if (!(c && !z(c, a) || !c) && !s)
        return;
      let u = null;
      const E = Q(t?.localStorage?.key) ? t?.localStorage?.key(a) : t?.localStorage?.key;
      E && R && (u = me(`${R}-${I}-${E}`));
      let w = a, _ = !1;
      const C = s ? Date.now() : 0, $ = u?.lastUpdated || 0, x = u?.lastSyncedWithServer || 0;
      s && C > $ ? (w = t.serverState.data, _ = !0) : u && $ > x && (w = u.state, t?.localStorage?.onChange && t?.localStorage?.onChange(w)), r.getState().initializeShadowState(I, a), Me(
        I,
        a,
        w,
        ae,
        ee.current,
        R
      ), _ && E && R && Ce(w, I, t, R, Date.now()), Ie(I), (Array.isArray(p) ? p : [p || "component"]).includes("none") || L({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), ie(() => {
    F && Ae(I, {
      serverSync: m,
      formElements: T,
      initialState: a,
      localStorage: g,
      middleware: P.current?.middleware
    });
    const t = `${I}////${ee.current}`, o = r.getState().stateComponents.get(I) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(t, {
      forceUpdate: () => L({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: N || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), r.getState().stateComponents.set(I, o), L({}), () => {
      o && (o.components.delete(t), o.components.size === 0 && r.getState().stateComponents.delete(I));
    };
  }, []);
  const ae = (t, o, s, c) => {
    if (Array.isArray(o)) {
      const u = `${I}-${o.join(".")}`;
      le.current.add(u);
    }
    const f = r.getState();
    te(I, (u) => {
      const E = Q(t) ? t(u) : t, w = `${I}-${o.join(".")}`;
      if (w) {
        let M = !1, y = f.signalDomElements.get(w);
        if ((!y || y.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const V = o.slice(0, -1), b = q(E, V);
          if (Array.isArray(b)) {
            M = !0;
            const A = `${I}-${V.join(".")}`;
            y = f.signalDomElements.get(A);
          }
        }
        if (y) {
          const V = M ? q(E, o.slice(0, -1)) : q(E, o);
          y.forEach(({ parentId: b, position: A, effect: D }) => {
            const G = document.querySelector(
              `[data-parent-id="${b}"]`
            );
            if (G) {
              const B = Array.from(G.childNodes);
              if (B[A]) {
                const O = D ? new Function("state", `return (${D})(state)`)(V) : V;
                B[A].textContent = String(O);
              }
            }
          });
        }
      }
      console.log("shadowState", f.shadowStateStore), s.updateType === "update" && (c || P.current?.validation?.key) && o && Z(
        (c || P.current?.validation?.key) + "." + o.join(".")
      );
      const _ = o.slice(0, o.length - 1);
      s.updateType === "cut" && P.current?.validation?.key && Z(
        P.current?.validation?.key + "." + _.join(".")
      ), s.updateType === "insert" && P.current?.validation?.key && Fe(
        P.current?.validation?.key + "." + _.join(".")
      ).filter(([y, V]) => {
        let b = y?.split(".").length;
        if (y == _.join(".") && b == _.length - 1) {
          let A = y + "." + _;
          Z(y), We(A, V);
        }
      });
      const C = f.stateComponents.get(I);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", C), C) {
        const M = ye(u, E), y = new Set(M), V = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          b,
          A
        ] of C.components.entries()) {
          let D = !1;
          const G = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (console.log("component", A), !G.includes("none")) {
            if (G.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if (G.includes("component") && ((A.paths.has(V) || A.paths.has("")) && (D = !0), !D))
              for (const B of y) {
                let O = B;
                for (; ; ) {
                  if (A.paths.has(O)) {
                    D = !0;
                    break;
                  }
                  const k = O.lastIndexOf(".");
                  if (k !== -1) {
                    const U = O.substring(
                      0,
                      k
                    );
                    if (!isNaN(
                      Number(O.substring(k + 1))
                    ) && A.paths.has(U)) {
                      D = !0;
                      break;
                    }
                    O = U;
                  } else
                    O = "";
                  if (O === "")
                    break;
                }
                if (D) break;
              }
            if (!D && G.includes("deps") && A.depsFunction) {
              const B = A.depsFunction(E);
              let O = !1;
              typeof B == "boolean" ? B && (O = !0) : z(A.deps, B) || (A.deps = B, O = !0), O && (D = !0);
            }
            D && A.forceUpdate();
          }
        }
      }
      const $ = Date.now();
      o = o.map((M, y) => {
        const V = o.slice(0, -1), b = q(E, V);
        return y === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (b.length - 1).toString() : M;
      });
      const { oldValue: x, newValue: j } = Je(
        s.updateType,
        u,
        E,
        o
      ), J = {
        timeStamp: $,
        stateKey: I,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: x,
        newValue: j
      };
      switch (s.updateType) {
        case "update":
          f.updateShadowAtPath(I, o, E);
          break;
        case "insert":
          const M = o.slice(0, -1);
          f.insertShadowArrayElement(I, M, j);
          break;
        case "cut":
          const y = o.slice(0, -1), V = parseInt(o[o.length - 1]);
          f.removeShadowArrayElement(I, y, V);
          break;
      }
      if (Be(I, (M) => {
        const V = [...M ?? [], J].reduce((b, A) => {
          const D = `${A.stateKey}:${JSON.stringify(A.path)}`, G = b.get(D);
          return G ? (G.timeStamp = Math.max(G.timeStamp, A.timeStamp), G.newValue = A.newValue, G.oldValue = G.oldValue ?? A.oldValue, G.updateType = A.updateType) : b.set(D, { ...A }), b;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), Ce(
        E,
        I,
        P.current,
        R
      ), P.current?.middleware && P.current.middleware({
        updateLog: l,
        update: J
      }), P.current?.serverSync) {
        const M = f.serverState[I], y = P.current?.serverSync;
        ze(I, {
          syncKey: typeof y.syncKey == "string" ? y.syncKey : y.syncKey({ state: E }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (y.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  r.getState().updaterState[I] || (fe(
    I,
    Se(
      I,
      ae,
      ee.current,
      R
    )
  ), r.getState().cogsStateStore[I] || te(I, e), r.getState().initialStateGlobal[I] || Ee(I, e));
  const d = ve(() => Se(
    I,
    ae,
    ee.current,
    R
  ), [I, R]);
  return [be(I), d];
}
function Se(e, i, m, g) {
  const T = /* @__PURE__ */ new Map();
  let N = 0;
  const p = (h) => {
    const n = h.join(".");
    for (const [S] of T)
      (S === n || S.startsWith(n + ".")) && T.delete(S);
    N++;
  }, v = {
    removeValidation: (h) => {
      h?.validationKey && Z(h.validationKey);
    },
    revertToInitialState: (h) => {
      const n = r.getState().getInitialOptions(e)?.validation;
      n?.key && Z(n?.key), h?.validationKey && Z(h.validationKey);
      const S = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), T.clear(), N++;
      const H = a(S, []), L = re(e), R = Q(L?.localStorage?.key) ? L?.localStorage?.key(S) : L?.localStorage?.key, F = `${g}-${e}-${R}`;
      F && localStorage.removeItem(F), fe(e, H), te(e, S);
      const I = r.getState().stateComponents.get(e);
      return I && I.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (h) => {
      T.clear(), N++;
      const n = Se(
        e,
        i,
        m,
        g
      ), S = r.getState().initialStateGlobal[e], H = re(e), L = Q(H?.localStorage?.key) ? H?.localStorage?.key(S) : H?.localStorage?.key, R = `${g}-${e}-${L}`;
      return localStorage.getItem(R) && localStorage.removeItem(R), Ve(() => {
        Ee(e, h), r.getState().initializeShadowState(e, h), fe(e, n), te(e, h);
        const F = r.getState().stateComponents.get(e);
        F && F.components.forEach((I) => {
          I.forceUpdate();
        });
      }), {
        fetchId: (F) => n.get()[F]
      };
    },
    _initialState: r.getState().initialStateGlobal[e],
    _serverState: r.getState().serverState[e],
    _isLoading: r.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const h = r.getState().serverState[e];
      return !!(h && z(h, be(e)));
    }
  };
  function a(h, n = [], S) {
    const H = n.map(String).join(".");
    T.get(H);
    const L = function() {
      return r().getNestedState(e, n);
    };
    Object.keys(v).forEach((I) => {
      L[I] = v[I];
    });
    const R = {
      apply(I, l, le) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, n);
      },
      get(I, l) {
        S?.validIndices && !Array.isArray(h) && (S = { ...S, validIndices: void 0 });
        const le = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !le.has(l)) {
          const d = `${e}////${m}`, t = r.getState().stateComponents.get(e);
          if (t) {
            const o = t.components.get(d);
            if (o && !o.paths.has("")) {
              const s = n.join(".");
              let c = !0;
              for (const f of o.paths)
                if (s.startsWith(f) && (s === f || s[f.length] === ".")) {
                  c = !1;
                  break;
                }
              c && o.paths.add(s);
            }
          }
        }
        if (l === "getDifferences")
          return () => ye(
            r.getState().cogsStateStore[e],
            r.getState().initialStateGlobal[e]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const d = r.getState().getInitialOptions(e), t = d?.sync;
            if (!t)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const o = r.getState().getNestedState(e, []), s = d?.validation?.key;
            try {
              const c = await t.action(o);
              if (c && !c.success && c.errors && s) {
                r.getState().removeValidationError(s), c.errors.forEach((u) => {
                  const E = [s, ...u.path].join(".");
                  r.getState().addValidationError(E, u.message);
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
          const d = r.getState().getNestedState(e, n), t = r.getState().initialStateGlobal[e], o = q(t, n);
          return z(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              e,
              n
            ), t = r.getState().initialStateGlobal[e], o = q(t, n);
            return z(d, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[e], t = re(e), o = Q(t?.localStorage?.key) ? t?.localStorage?.key(d) : t?.localStorage?.key, s = `${g}-${e}-${o}`;
            s && localStorage.removeItem(s);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = r.getState().getInitialOptions(e)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(h)) {
          const d = () => S?.validIndices ? h.map((o, s) => ({
            item: o,
            originalIndex: S.validIndices[s]
          })) : r.getState().getNestedState(e, n).map((o, s) => ({
            item: o,
            originalIndex: s
          }));
          if (l === "getSelected")
            return () => {
              const t = r.getState().getSelectedIndex(e, n.join("."));
              if (t !== void 0)
                return a(
                  h[t],
                  [...n, t.toString()],
                  S
                );
            };
          if (l === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: e, path: n });
            };
          if (l === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(e, n.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (t) => {
              const {
                itemHeight: o = 50,
                overscan: s = 6,
                stickToBottom: c = !1,
                dependencies: f = []
              } = t, u = K(null), [E, w] = X({
                startIndex: 0,
                endIndex: 10
              }), [_, C] = X("IDLE_AT_TOP"), $ = K(0), x = K(f), [j, J] = X(0);
              oe(() => r.getState().subscribeToShadowState(e, () => {
                J((k) => k + 1);
              }), [e]);
              const M = r().getNestedState(
                e,
                n
              ), y = M.length, { totalHeight: V, positions: b } = ve(() => {
                const O = r.getState().getShadowMetadata(e, n) || [];
                let k = 0;
                const U = [];
                for (let W = 0; W < y; W++) {
                  U[W] = k;
                  const Y = O[W]?.virtualizer?.itemHeight;
                  k += Y || o;
                }
                return { totalHeight: k, positions: U };
              }, [
                y,
                e,
                n.join("."),
                o,
                j
              ]), A = ve(() => {
                const O = Math.max(0, E.startIndex), k = Math.min(y, E.endIndex), U = Array.from(
                  { length: k - O },
                  (Y, ne) => O + ne
                ), W = U.map((Y) => M[Y]);
                return a(W, n, {
                  ...S,
                  validIndices: U
                });
              }, [E.startIndex, E.endIndex, M, y]);
              ie(() => {
                const O = !z(
                  f,
                  x.current
                ), k = y > $.current;
                if (O) {
                  console.log("TRANSITION: Deps changed -> IDLE_AT_TOP"), C("IDLE_AT_TOP");
                  return;
                }
                k && _ === "LOCKED_AT_BOTTOM" && c && (console.log(
                  "TRANSITION: New items arrived while locked -> GETTING_HEIGHTS"
                ), C("GETTING_HEIGHTS")), $.current = y, x.current = f;
              }, [y, ...f]), ie(() => {
                const O = u.current;
                if (!O) return;
                let k;
                if (_ === "IDLE_AT_TOP" && c && y > 0)
                  console.log(
                    "ACTION (IDLE_AT_TOP): Data has arrived -> GETTING_HEIGHTS"
                  ), C("GETTING_HEIGHTS");
                else if (_ === "GETTING_HEIGHTS")
                  console.log(
                    "ACTION (GETTING_HEIGHTS): Setting range to end and starting loop."
                  ), w({
                    startIndex: Math.max(0, y - 10 - s),
                    endIndex: y
                  }), k = setInterval(() => {
                    const U = y - 1;
                    ((r.getState().getShadowMetadata(e, n) || [])[U]?.virtualizer?.itemHeight || 0) > 0 && (clearInterval(k), console.log(
                      "ACTION (GETTING_HEIGHTS): Measurement success -> SCROLLING_TO_BOTTOM"
                    ), C("SCROLLING_TO_BOTTOM"));
                  }, 100);
                else if (_ === "SCROLLING_TO_BOTTOM") {
                  console.log(
                    "ACTION (SCROLLING_TO_BOTTOM): Executing scroll."
                  );
                  const U = $.current === 0 ? "auto" : "smooth";
                  O.scrollTo({
                    top: O.scrollHeight,
                    behavior: U
                  });
                  const W = setTimeout(
                    () => {
                      console.log(
                        "ACTION (SCROLLING_TO_BOTTOM): Scroll finished -> LOCKED_AT_BOTTOM"
                      ), C("LOCKED_AT_BOTTOM");
                    },
                    U === "smooth" ? 500 : 50
                  );
                  return () => clearTimeout(W);
                }
                return () => {
                  k && clearInterval(k);
                };
              }, [_, y, b]), oe(() => {
                const O = u.current;
                if (!O) return;
                const k = () => {
                  _ !== "IDLE_NOT_AT_BOTTOM" && (O.scrollHeight - O.scrollTop - O.clientHeight < 1 || (console.log(
                    "USER ACTION: Scrolled up -> IDLE_NOT_AT_BOTTOM"
                  ), C("IDLE_NOT_AT_BOTTOM")));
                  const { scrollTop: U, clientHeight: W } = O;
                  let Y = 0, ne = y - 1;
                  for (; Y <= ne; ) {
                    const ue = Math.floor((Y + ne) / 2);
                    b[ue] < U ? Y = ue + 1 : ne = ue - 1;
                  }
                  const we = Math.max(0, ne - s);
                  let de = we;
                  const xe = U + W;
                  for (; de < y && b[de] < xe; )
                    de++;
                  w({
                    startIndex: we,
                    endIndex: Math.min(y, de + s)
                  });
                };
                return O.addEventListener("scroll", k, {
                  passive: !0
                }), () => O.removeEventListener("scroll", k);
              }, [y, b, _]);
              const D = _e(() => {
                console.log(
                  "USER ACTION: Clicked scroll button -> SCROLLING_TO_BOTTOM"
                ), C("SCROLLING_TO_BOTTOM");
              }, []), G = _e(
                (O, k = "smooth") => {
                  u.current && b[O] !== void 0 && (C("IDLE_NOT_AT_BOTTOM"), u.current.scrollTo({
                    top: b[O],
                    behavior: k
                  }));
                },
                [b]
              ), B = {
                outer: {
                  ref: u,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${V}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${b[E.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: A,
                virtualizerProps: B,
                scrollToBottom: D,
                scrollToIndex: G
              };
            };
          if (l === "stateSort")
            return (t) => {
              const s = [...d()].sort(
                (u, E) => t(u.item, E.item)
              ), c = s.map(({ item: u }) => u), f = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(c, n, f);
            };
          if (l === "stateFilter")
            return (t) => {
              const s = d().filter(
                ({ item: u }, E) => t(u, E)
              ), c = s.map(({ item: u }) => u), f = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(c, n, f);
            };
          if (l === "stateMap")
            return (t) => {
              const o = r.getState().getNestedState(e, n);
              return Array.isArray(o) ? (S?.validIndices || Array.from({ length: o.length }, (c, f) => f)).map((c, f) => {
                const u = o[c], E = [...n, c.toString()], w = a(u, E, S);
                return t(u, w, {
                  register: () => {
                    const [, C] = X({}), $ = `${m}-${n.join(".")}-${c}`;
                    ie(() => {
                      const x = `${e}////${$}`, j = r.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return j.components.set(x, {
                        forceUpdate: () => C({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), r.getState().stateComponents.set(e, j), () => {
                        const J = r.getState().stateComponents.get(e);
                        J && J.components.delete(x);
                      };
                    }, [e, $]);
                  },
                  index: f,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                o
              ), null);
            };
          if (l === "stateMapNoRender")
            return (t) => h.map((s, c) => {
              let f;
              S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
              const u = [...n, f.toString()], E = a(s, u, S);
              return t(
                s,
                E,
                c,
                h,
                a(h, n, S)
              );
            });
          if (l === "$stateMap")
            return (t) => ce(Ze, {
              proxy: {
                _stateKey: e,
                _path: n,
                _mapFn: t
                // Pass the actual function, not string
              },
              rebuildStateShape: a
            });
          if (l === "stateList")
            return (t) => {
              const o = r.getState().getNestedState(e, n);
              return Array.isArray(o) ? (S?.validIndices || Array.from({ length: o.length }, (c, f) => f)).map((c, f) => {
                const u = o[c], E = [...n, c.toString()], w = a(u, E, S), _ = `${m}-${n.join(".")}-${c}`;
                return ce(Qe, {
                  key: c,
                  stateKey: e,
                  itemComponentId: _,
                  itemPath: E,
                  children: t(
                    u,
                    w,
                    f,
                    o,
                    a(o, n, S)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (t) => {
              const o = h;
              T.clear(), N++;
              const s = o.flatMap(
                (c) => c[t] ?? []
              );
              return a(
                s,
                [...n, "[*]", t],
                S
              );
            };
          if (l === "index")
            return (t) => {
              const o = h[t];
              return a(o, [...n, t.toString()]);
            };
          if (l === "last")
            return () => {
              const t = r.getState().getNestedState(e, n);
              if (t.length === 0) return;
              const o = t.length - 1, s = t[o], c = [...n, o.toString()];
              return a(s, c);
            };
          if (l === "insert")
            return (t) => (p(n), he(i, t, n, e), a(
              r.getState().getNestedState(e, n),
              n
            ));
          if (l === "uniqueInsert")
            return (t, o, s) => {
              const c = r.getState().getNestedState(e, n), f = Q(t) ? t(c) : t;
              let u = null;
              if (!c.some((w) => {
                if (o) {
                  const C = o.every(
                    ($) => z(w[$], f[$])
                  );
                  return C && (u = w), C;
                }
                const _ = z(w, f);
                return _ && (u = w), _;
              }))
                p(n), he(i, f, n, e);
              else if (s && u) {
                const w = s(u), _ = c.map(
                  (C) => z(C, u) ? w : C
                );
                p(n), se(i, _, n);
              }
            };
          if (l === "cut")
            return (t, o) => {
              if (!o?.waitForSync)
                return p(n), ge(i, n, e, t), a(
                  r.getState().getNestedState(e, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (t) => {
              for (let o = 0; o < h.length; o++)
                h[o] === t && ge(i, n, e, o);
            };
          if (l === "toggleByValue")
            return (t) => {
              const o = h.findIndex((s) => s === t);
              o > -1 ? ge(i, n, e, o) : he(i, t, n, e);
            };
          if (l === "stateFind")
            return (t) => {
              const s = d().find(
                ({ item: f }, u) => t(f, u)
              );
              if (!s) return;
              const c = [...n, s.originalIndex.toString()];
              return a(s.item, c, S);
            };
          if (l === "findWith")
            return (t, o) => {
              const c = d().find(
                ({ item: u }) => u[t] === o
              );
              if (!c) return;
              const f = [...n, c.originalIndex.toString()];
              return a(c.item, f, S);
            };
        }
        const ee = n[n.length - 1];
        if (!isNaN(Number(ee))) {
          const d = n.slice(0, -1), t = r.getState().getNestedState(e, d);
          if (Array.isArray(t) && l === "cut")
            return () => ge(
              i,
              d,
              e,
              Number(ee)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(h)) {
              const d = r.getState().getNestedState(e, n);
              return S.validIndices.map((t) => d[t]);
            }
            return r.getState().getNestedState(e, n);
          };
        if (l === "$derive")
          return (d) => $e({
            _stateKey: e,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => $e({
            _stateKey: e,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${e}:${n.join(".")}`;
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => me(g + "-" + e + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), t = d.join("."), o = r.getState().getNestedState(e, d);
          return Array.isArray(o) ? Number(n[n.length - 1]) === r.getState().getSelectedIndex(e, t) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const t = n.slice(0, -1), o = Number(n[n.length - 1]), s = t.join(".");
            d ? r.getState().setSelectedIndex(e, s, o) : r.getState().setSelectedIndex(e, s, void 0);
            const c = r.getState().getNestedState(e, [...t]);
            se(i, c, t), p(t);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), t = Number(n[n.length - 1]), o = d.join("."), s = r.getState().getSelectedIndex(e, o);
            r.getState().setSelectedIndex(
              e,
              o,
              s === t ? void 0 : t
            );
            const c = r.getState().getNestedState(e, [...d]);
            se(i, c, d), p(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const t = r.getState().cogsStateStore[e], s = je(t, d).newDocument;
              Me(
                e,
                r.getState().initialStateGlobal[e],
                s,
                i,
                m,
                g
              );
              const c = r.getState().stateComponents.get(e);
              if (c) {
                const f = ye(t, s), u = new Set(f);
                for (const [
                  E,
                  w
                ] of c.components.entries()) {
                  let _ = !1;
                  const C = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!C.includes("none")) {
                    if (C.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (C.includes("component") && (w.paths.has("") && (_ = !0), !_))
                      for (const $ of u) {
                        if (w.paths.has($)) {
                          _ = !0;
                          break;
                        }
                        let x = $.lastIndexOf(".");
                        for (; x !== -1; ) {
                          const j = $.substring(0, x);
                          if (w.paths.has(j)) {
                            _ = !0;
                            break;
                          }
                          const J = $.substring(
                            x + 1
                          );
                          if (!isNaN(Number(J))) {
                            const M = j.lastIndexOf(".");
                            if (M !== -1) {
                              const y = j.substring(
                                0,
                                M
                              );
                              if (w.paths.has(y)) {
                                _ = !0;
                                break;
                              }
                            }
                          }
                          x = j.lastIndexOf(".");
                        }
                        if (_) break;
                      }
                    if (!_ && C.includes("deps") && w.depsFunction) {
                      const $ = w.depsFunction(s);
                      let x = !1;
                      typeof $ == "boolean" ? $ && (x = !0) : z(w.deps, $) || (w.deps = $, x = !0), x && (_ = !0);
                    }
                    _ && w.forceUpdate();
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
              Z(d.key);
              const o = r.getState().cogsStateStore[e];
              try {
                const s = r.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([f]) => {
                  f && f.startsWith(d.key) && Z(f);
                });
                const c = d.zodSchema.safeParse(o);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const E = u.path, w = u.message, _ = [d.key, ...E].join(".");
                  t(_, w);
                }), Ie(e), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => r().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => Oe.getState().getFormRefsByStateKey(e);
          if (l === "_initialState")
            return r.getState().initialStateGlobal[e];
          if (l === "_serverState")
            return r.getState().serverState[e];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[e];
          if (l === "revertToInitialState")
            return v.revertToInitialState;
          if (l === "updateInitialState") return v.updateInitialState;
          if (l === "removeValidation") return v.removeValidation;
        }
        if (l === "getFormRef")
          return () => Oe.getState().getFormRef(e + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: t
          }) => /* @__PURE__ */ Te(
            Re,
            {
              formOpts: t ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: r.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: S?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return e;
        if (l === "_path") return n;
        if (l === "_isServerSynced") return v._isServerSynced;
        if (l === "update")
          return (d, t) => {
            if (t?.debounce)
              Le(() => {
                se(i, d, n, "");
                const o = r.getState().getNestedState(e, n);
                t?.afterUpdate && t.afterUpdate(o);
              }, t.debounce);
            else {
              se(i, d, n, "");
              const o = r.getState().getNestedState(e, n);
              t?.afterUpdate && t.afterUpdate(o);
            }
            p(n);
          };
        if (l === "formElement")
          return (d, t) => /* @__PURE__ */ Te(
            De,
            {
              setState: i,
              stateKey: e,
              path: n,
              child: d,
              formOpts: t
            }
          );
        const P = [...n, l], ae = r.getState().getNestedState(e, P);
        return a(ae, P, S);
      }
    }, F = new Proxy(L, R);
    return T.set(H, {
      proxy: F,
      stateVersion: N
    }), F;
  }
  return a(
    r.getState().getNestedState(e, [])
  );
}
function $e(e) {
  return ce(Xe, { proxy: e });
}
function Ze({
  proxy: e,
  rebuildStateShape: i
}) {
  const m = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(m) ? i(
    m,
    e._path
  ).stateMapNoRender(
    (T, N, p, v, a) => e._mapFn(T, N, p, v, a)
  ) : null;
}
function Xe({
  proxy: e
}) {
  const i = K(null), m = `${e._stateKey}-${e._path.join(".")}`;
  return oe(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const T = g.parentElement, p = Array.from(T.childNodes).indexOf(g);
    let v = T.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, T.setAttribute("data-parent-id", v));
    const h = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: p,
      effect: e._effect
    };
    r.getState().addSignalElement(m, h);
    const n = r.getState().getNestedState(e._stateKey, e._path);
    let S;
    if (e._effect)
      try {
        S = new Function(
          "state",
          `return (${e._effect})(state)`
        )(n);
      } catch (L) {
        console.error("Error evaluating effect function during mount:", L), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const H = document.createTextNode(String(S));
    g.replaceWith(H);
  }, [e._stateKey, e._path.join("."), e._effect]), ce("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function ft(e) {
  const i = Pe(
    (m) => {
      const g = r.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(e._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => g.components.delete(e._stateKey);
    },
    () => r.getState().getNestedState(e._stateKey, e._path)
  );
  return ce("text", {}, String(i));
}
function Qe({
  stateKey: e,
  itemComponentId: i,
  itemPath: m,
  children: g
}) {
  const [, T] = X({}), [N, p] = He(), v = K(null);
  return oe(() => {
    p.height > 0 && p.height !== v.current && (v.current = p.height, r.getState().setShadowMetadata(e, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, e, m]), ie(() => {
    const a = `${e}////${i}`, h = r.getState().stateComponents.get(e) || {
      components: /* @__PURE__ */ new Map()
    };
    return h.components.set(a, {
      forceUpdate: () => T({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), r.getState().stateComponents.set(e, h), () => {
      const n = r.getState().stateComponents.get(e);
      n && n.components.delete(a);
    };
  }, [e, i, m.join(".")]), /* @__PURE__ */ Te("div", { ref: N, children: g });
}
export {
  $e as $cogsSignal,
  ft as $cogsSignalStore,
  dt as addStateOptions,
  ut as createCogsState,
  gt as notifyComponent,
  Ye as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
