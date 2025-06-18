"use client";
import { jsx as we } from "react/jsx-runtime";
import { useState as Q, useRef as J, useEffect as oe, useLayoutEffect as le, useMemo as Ee, createElement as de, useSyncExternalStore as De, startTransition as Ue, useCallback as $e } from "react";
import { transformStateFunc as je, isDeepEqual as q, isFunction as K, getNestedValue as Z, getDifferences as _e, debounce as Fe } from "./utility.js";
import { pushFunc as pe, updateFn as ce, cutFunc as me, ValidationWrapper as He, FormControlComponent as We } from "./Functions.jsx";
import Be from "superjson";
import { v4 as Ae } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as ke } from "./store.js";
import { useCogsConfig as Ve } from "./CogsStateClient.jsx";
import { applyPatch as ze } from "fast-json-patch";
import qe from "react-use-measure";
function be(e, i) {
  const m = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, T = m(e) || {};
  g(e, {
    ...T,
    ...i
  });
}
function xe({
  stateKey: e,
  options: i,
  initialOptionsPart: m
}) {
  const g = re(e) || {}, T = m[e] || {}, O = o.getState().setInitialStateOptions, w = { ...T, ...g };
  let y = !1;
  if (i)
    for (const s in i)
      w.hasOwnProperty(s) ? (s == "localStorage" && i[s] && w[s].key !== i[s]?.key && (y = !0, w[s] = i[s]), s == "initialState" && i[s] && w[s] !== i[s] && // Different references
      !q(w[s], i[s]) && (y = !0, w[s] = i[s])) : (y = !0, w[s] = i[s]);
  y && O(e, w);
}
function mt(e, { formElements: i, validation: m }) {
  return { initialState: e, formElements: i, validation: m };
}
const ht = (e, i) => {
  let m = e;
  const [g, T] = je(m);
  (Object.keys(T).length > 0 || i && Object.keys(i).length > 0) && Object.keys(T).forEach((y) => {
    T[y] = T[y] || {}, T[y].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...T[y].formElements || {}
      // State-specific overrides
    }, re(y) || o.getState().setInitialStateOptions(y, T[y]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const O = (y, s) => {
    const [I] = Q(s?.componentId ?? Ae());
    xe({
      stateKey: y,
      options: s,
      initialOptionsPart: T
    });
    const n = o.getState().cogsStateStore[y] || g[y], S = s?.modifyState ? s.modifyState(n) : n, [W, G] = et(
      S,
      {
        stateKey: y,
        syncUpdate: s?.syncUpdate,
        componentId: I,
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
    return G;
  };
  function w(y, s) {
    xe({ stateKey: y, options: s, initialOptionsPart: T }), s.localStorage && Qe(y, s), ve(y);
  }
  return { useCogsState: O, setCogsOptions: w };
}, {
  setUpdaterState: he,
  setState: ne,
  getInitialOptions: re,
  getKeyState: Ge,
  getValidationErrors: Je,
  setStateLog: Ye,
  updateInitialStateGlobal: Oe,
  addValidationError: Ze,
  removeValidationError: X,
  setServerSyncActions: Xe
} = o.getState(), Me = (e, i, m, g, T) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    g
  );
  const O = K(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (O && g) {
    const w = `${g}-${i}-${O}`;
    let y;
    try {
      y = Te(w)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: T ?? y
    }, I = Be.serialize(s);
    window.localStorage.setItem(
      w,
      JSON.stringify(I.json)
    );
  }
}, Te = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Qe = (e, i) => {
  const m = o.getState().cogsStateStore[e], { sessionId: g } = Ve(), T = K(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (T && g) {
    const O = Te(
      `${g}-${e}-${T}`
    );
    if (O && O.lastUpdated > (O.lastSyncedWithServer || 0))
      return ne(e, O.state), ve(e), !0;
  }
  return !1;
}, Le = (e, i, m, g, T, O) => {
  const w = {
    initialState: i,
    updaterState: Ie(
      e,
      g,
      T,
      O
    ),
    state: m
  };
  Oe(e, w.initialState), he(e, w.updaterState), ne(e, w.state);
}, ve = (e) => {
  const i = o.getState().stateComponents.get(e);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, It = (e, i) => {
  const m = o.getState().stateComponents.get(e);
  if (m) {
    const g = `${e}////${i}`, T = m.components.get(g);
    if ((T ? Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"] : null)?.includes("none"))
      return;
    T && T.forceUpdate();
  }
}, Ke = (e, i, m, g) => {
  switch (e) {
    case "update":
      return {
        oldValue: Z(i, g),
        newValue: Z(m, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: Z(m, g)
      };
    case "cut":
      return {
        oldValue: Z(i, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function et(e, {
  stateKey: i,
  serverSync: m,
  localStorage: g,
  formElements: T,
  reactiveDeps: O,
  reactiveType: w,
  componentId: y,
  initialState: s,
  syncUpdate: I,
  dependencies: n,
  serverState: S
} = {}) {
  const [W, G] = Q({}), { sessionId: L } = Ve();
  let B = !i;
  const [h] = Q(i ?? Ae()), l = o.getState().stateLog[h], ue = J(/* @__PURE__ */ new Set()), ee = J(y ?? Ae()), P = J(
    null
  );
  P.current = re(h) ?? null, oe(() => {
    if (I && I.stateKey === h && I.path?.[0]) {
      ne(h, (r) => ({
        ...r,
        [I.path[0]]: I.newValue
      }));
      const t = `${I.stateKey}:${I.path.join(".")}`;
      o.getState().setSyncInfo(t, {
        timeStamp: I.timeStamp,
        userId: I.userId
      });
    }
  }, [I]), oe(() => {
    if (s) {
      be(h, {
        initialState: s
      });
      const t = P.current, a = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = o.getState().initialStateGlobal[h];
      if (!(c && !q(c, s) || !c) && !a)
        return;
      let u = null;
      const E = K(t?.localStorage?.key) ? t?.localStorage?.key(s) : t?.localStorage?.key;
      E && L && (u = Te(`${L}-${h}-${E}`));
      let p = s, _ = !1;
      const C = a ? Date.now() : 0, A = u?.lastUpdated || 0, b = u?.lastSyncedWithServer || 0;
      a && C > A ? (p = t.serverState.data, _ = !0) : u && A > b && (p = u.state, t?.localStorage?.onChange && t?.localStorage?.onChange(p)), o.getState().initializeShadowState(h, s), Le(
        h,
        s,
        p,
        ae,
        ee.current,
        L
      ), _ && E && L && Me(p, h, t, L, Date.now()), ve(h), (Array.isArray(w) ? w : [w || "component"]).includes("none") || G({});
    }
  }, [
    s,
    S?.status,
    S?.data,
    ...n || []
  ]), le(() => {
    B && be(h, {
      serverSync: m,
      formElements: T,
      initialState: s,
      localStorage: g,
      middleware: P.current?.middleware
    });
    const t = `${h}////${ee.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(t, {
      forceUpdate: () => G({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: O || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), G({}), () => {
      r && (r.components.delete(t), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const ae = (t, r, a, c) => {
    if (Array.isArray(r)) {
      const u = `${h}-${r.join(".")}`;
      ue.current.add(u);
    }
    const f = o.getState();
    ne(h, (u) => {
      const E = K(t) ? t(u) : t, p = `${h}-${r.join(".")}`;
      if (p) {
        let x = !1, N = f.signalDomElements.get(p);
        if ((!N || N.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const V = r.slice(0, -1), R = Z(E, V);
          if (Array.isArray(R)) {
            x = !0;
            const v = `${h}-${V.join(".")}`;
            N = f.signalDomElements.get(v);
          }
        }
        if (N) {
          const V = x ? Z(E, r.slice(0, -1)) : Z(E, r);
          N.forEach(({ parentId: R, position: v, effect: D }) => {
            const $ = document.querySelector(
              `[data-parent-id="${R}"]`
            );
            if ($) {
              const z = Array.from($.childNodes);
              if (z[v]) {
                const j = D ? new Function("state", `return (${D})(state)`)(V) : V;
                z[v].textContent = String(j);
              }
            }
          });
        }
      }
      console.log("shadowState", f.shadowStateStore), a.updateType === "update" && (c || P.current?.validation?.key) && r && X(
        (c || P.current?.validation?.key) + "." + r.join(".")
      );
      const _ = r.slice(0, r.length - 1);
      a.updateType === "cut" && P.current?.validation?.key && X(
        P.current?.validation?.key + "." + _.join(".")
      ), a.updateType === "insert" && P.current?.validation?.key && Je(
        P.current?.validation?.key + "." + _.join(".")
      ).filter(([N, V]) => {
        let R = N?.split(".").length;
        if (N == _.join(".") && R == _.length - 1) {
          let v = N + "." + _;
          X(N), Ze(v, V);
        }
      });
      const C = f.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", C), C) {
        const x = _e(u, E), N = new Set(x), V = a.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          R,
          v
        ] of C.components.entries()) {
          let D = !1;
          const $ = Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"];
          if (console.log("component", v), !$.includes("none")) {
            if ($.includes("all")) {
              v.forceUpdate();
              continue;
            }
            if ($.includes("component") && ((v.paths.has(V) || v.paths.has("")) && (D = !0), !D))
              for (const z of N) {
                let j = z;
                for (; ; ) {
                  if (v.paths.has(j)) {
                    D = !0;
                    break;
                  }
                  const se = j.lastIndexOf(".");
                  if (se !== -1) {
                    const ge = j.substring(
                      0,
                      se
                    );
                    if (!isNaN(
                      Number(j.substring(se + 1))
                    ) && v.paths.has(ge)) {
                      D = !0;
                      break;
                    }
                    j = ge;
                  } else
                    j = "";
                  if (j === "")
                    break;
                }
                if (D) break;
              }
            if (!D && $.includes("deps") && v.depsFunction) {
              const z = v.depsFunction(E);
              let j = !1;
              typeof z == "boolean" ? z && (j = !0) : q(v.deps, z) || (v.deps = z, j = !0), j && (D = !0);
            }
            D && v.forceUpdate();
          }
        }
      }
      const A = Date.now();
      r = r.map((x, N) => {
        const V = r.slice(0, -1), R = Z(E, V);
        return N === r.length - 1 && ["insert", "cut"].includes(a.updateType) ? (R.length - 1).toString() : x;
      });
      const { oldValue: b, newValue: U } = Ke(
        a.updateType,
        u,
        E,
        r
      ), Y = {
        timeStamp: A,
        stateKey: h,
        path: r,
        updateType: a.updateType,
        status: "new",
        oldValue: b,
        newValue: U
      };
      switch (a.updateType) {
        case "update":
          f.updateShadowAtPath(h, r, E);
          break;
        case "insert":
          const x = r.slice(0, -1);
          f.insertShadowArrayElement(h, x, U);
          break;
        case "cut":
          const N = r.slice(0, -1), V = parseInt(r[r.length - 1]);
          f.removeShadowArrayElement(h, N, V);
          break;
      }
      if (Ye(h, (x) => {
        const V = [...x ?? [], Y].reduce((R, v) => {
          const D = `${v.stateKey}:${JSON.stringify(v.path)}`, $ = R.get(D);
          return $ ? ($.timeStamp = Math.max($.timeStamp, v.timeStamp), $.newValue = v.newValue, $.oldValue = $.oldValue ?? v.oldValue, $.updateType = v.updateType) : R.set(D, { ...v }), R;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), Me(
        E,
        h,
        P.current,
        L
      ), P.current?.middleware && P.current.middleware({
        updateLog: l,
        update: Y
      }), P.current?.serverSync) {
        const x = f.serverState[h], N = P.current?.serverSync;
        Xe(h, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: E }),
          rollBackState: x,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[h] || (he(
    h,
    Ie(
      h,
      ae,
      ee.current,
      L
    )
  ), o.getState().cogsStateStore[h] || ne(h, e), o.getState().initialStateGlobal[h] || Oe(h, e));
  const d = Ee(() => Ie(
    h,
    ae,
    ee.current,
    L
  ), [h, L]);
  return [Ge(h), d];
}
function Ie(e, i, m, g) {
  const T = /* @__PURE__ */ new Map();
  let O = 0;
  const w = (I) => {
    const n = I.join(".");
    for (const [S] of T)
      (S === n || S.startsWith(n + ".")) && T.delete(S);
    O++;
  }, y = {
    removeValidation: (I) => {
      I?.validationKey && X(I.validationKey);
    },
    revertToInitialState: (I) => {
      const n = o.getState().getInitialOptions(e)?.validation;
      n?.key && X(n?.key), I?.validationKey && X(I.validationKey);
      const S = o.getState().initialStateGlobal[e];
      o.getState().clearSelectedIndexesForState(e), T.clear(), O++;
      const W = s(S, []), G = re(e), L = K(G?.localStorage?.key) ? G?.localStorage?.key(S) : G?.localStorage?.key, B = `${g}-${e}-${L}`;
      B && localStorage.removeItem(B), he(e, W), ne(e, S);
      const h = o.getState().stateComponents.get(e);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (I) => {
      T.clear(), O++;
      const n = Ie(
        e,
        i,
        m,
        g
      ), S = o.getState().initialStateGlobal[e], W = re(e), G = K(W?.localStorage?.key) ? W?.localStorage?.key(S) : W?.localStorage?.key, L = `${g}-${e}-${G}`;
      return localStorage.getItem(L) && localStorage.removeItem(L), Ue(() => {
        Oe(e, I), o.getState().initializeShadowState(e, I), he(e, n), ne(e, I);
        const B = o.getState().stateComponents.get(e);
        B && B.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (B) => n.get()[B]
      };
    },
    _initialState: o.getState().initialStateGlobal[e],
    _serverState: o.getState().serverState[e],
    _isLoading: o.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const I = o.getState().serverState[e];
      return !!(I && q(I, Ge(e)));
    }
  };
  function s(I, n = [], S) {
    const W = n.map(String).join(".");
    T.get(W);
    const G = function() {
      return o().getNestedState(e, n);
    };
    Object.keys(y).forEach((h) => {
      G[h] = y[h];
    });
    const L = {
      apply(h, l, ue) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(e, n);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(I) && (S = { ...S, validIndices: void 0 });
        const ue = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !ue.has(l)) {
          const d = `${e}////${m}`, t = o.getState().stateComponents.get(e);
          if (t) {
            const r = t.components.get(d);
            if (r && !r.paths.has("")) {
              const a = n.join(".");
              let c = !0;
              for (const f of r.paths)
                if (a.startsWith(f) && (a === f || a[f.length] === ".")) {
                  c = !1;
                  break;
                }
              c && r.paths.add(a);
            }
          }
        }
        if (l === "getDifferences")
          return () => _e(
            o.getState().cogsStateStore[e],
            o.getState().initialStateGlobal[e]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const d = o.getState().getInitialOptions(e), t = d?.sync;
            if (!t)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const r = o.getState().getNestedState(e, []), a = d?.validation?.key;
            try {
              const c = await t.action(r);
              if (c && !c.success && c.errors && a) {
                o.getState().removeValidationError(a), c.errors.forEach((u) => {
                  const E = [a, ...u.path].join(".");
                  o.getState().addValidationError(E, u.message);
                });
                const f = o.getState().stateComponents.get(e);
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
          const d = o.getState().getNestedState(e, n), t = o.getState().initialStateGlobal[e], r = Z(t, n);
          return q(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              e,
              n
            ), t = o.getState().initialStateGlobal[e], r = Z(t, n);
            return q(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[e], t = re(e), r = K(t?.localStorage?.key) ? t?.localStorage?.key(d) : t?.localStorage?.key, a = `${g}-${e}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(e)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(I)) {
          const d = () => S?.validIndices ? I.map((r, a) => ({
            item: r,
            originalIndex: S.validIndices[a]
          })) : o.getState().getNestedState(e, n).map((r, a) => ({
            item: r,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const t = o.getState().getSelectedIndex(e, n.join("."));
              if (t !== void 0)
                return s(
                  I[t],
                  [...n, t.toString()],
                  S
                );
            };
          if (l === "clearSelected")
            return () => {
              o.getState().clearSelectedIndex({ stateKey: e, path: n });
            };
          if (l === "getSelectedIndex")
            return () => o.getState().getSelectedIndex(e, n.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (t) => {
              const {
                itemHeight: r = 50,
                overscan: a = 6,
                stickToBottom: c = !1,
                dependencies: f = []
              } = t, u = J(!1), E = J(null), [p, _] = Q({
                startIndex: 0,
                endIndex: 10
              }), [C, A] = Q("IDLE_AT_TOP"), b = J(!1), U = J(0), Y = J(f), x = J(0), [N, V] = Q(0);
              oe(() => o.getState().subscribeToShadowState(e, () => {
                V((M) => M + 1);
              }), [e]);
              const R = o().getNestedState(
                e,
                n
              ), v = R.length, { totalHeight: D, positions: $ } = Ee(() => {
                const k = o.getState().getShadowMetadata(e, n) || [];
                let M = 0;
                const H = [];
                for (let F = 0; F < v; F++) {
                  H[F] = M;
                  const te = k[F]?.virtualizer?.itemHeight;
                  M += te || r;
                }
                return { totalHeight: M, positions: H };
              }, [
                v,
                e,
                n.join("."),
                r,
                N
              ]), z = Ee(() => {
                const k = Math.max(0, p.startIndex), M = Math.min(v, p.endIndex), H = Array.from(
                  { length: M - k },
                  (te, ie) => k + ie
                ), F = H.map((te) => R[te]);
                return s(F, n, {
                  ...S,
                  validIndices: H
                });
              }, [p.startIndex, p.endIndex, R, v]);
              le(() => {
                const k = !q(
                  f,
                  Y.current
                ), M = v > U.current;
                if (k) {
                  console.log("TRANSITION: Deps changed -> IDLE_AT_TOP"), A("IDLE_AT_TOP");
                  return;
                }
                M && C === "LOCKED_AT_BOTTOM" && c && (console.log(
                  "TRANSITION: New items arrived while locked -> GETTING_HEIGHTS"
                ), A("GETTING_HEIGHTS")), U.current = v, Y.current = f;
              }, [v, ...f]), le(() => {
                const k = E.current;
                if (!k) return;
                let M;
                if (C === "IDLE_AT_TOP" && c && v > 0)
                  console.log(
                    "ACTION (IDLE_AT_TOP): Data has arrived -> GETTING_HEIGHTS"
                  ), A("GETTING_HEIGHTS");
                else if (C === "GETTING_HEIGHTS")
                  console.log(
                    "ACTION (GETTING_HEIGHTS): Setting range to end and starting loop."
                  ), _({
                    startIndex: Math.max(0, v - 10 - a),
                    endIndex: v
                  }), M = setInterval(() => {
                    const H = v - 1;
                    ((o.getState().getShadowMetadata(e, n) || [])[H]?.virtualizer?.itemHeight || 0) > 0 && (clearInterval(M), u.current || (console.log(
                      "ACTION (GETTING_HEIGHTS): Measurement success -> SCROLLING_TO_BOTTOM"
                    ), A("SCROLLING_TO_BOTTOM")));
                  }, 100);
                else if (C === "SCROLLING_TO_BOTTOM") {
                  console.log(
                    "ACTION (SCROLLING_TO_BOTTOM): Executing scroll."
                  ), b.current = !0;
                  const H = U.current === 0 ? "auto" : "smooth";
                  k.scrollTo({
                    top: k.scrollHeight,
                    behavior: H
                  });
                  const F = setTimeout(
                    () => {
                      console.log(
                        "ACTION (SCROLLING_TO_BOTTOM): Scroll finished -> LOCKED_AT_BOTTOM"
                      ), b.current = !1, u.current = !1, A("LOCKED_AT_BOTTOM");
                    },
                    H === "smooth" ? 500 : 50
                  );
                  return () => clearTimeout(F);
                }
                return () => {
                  M && clearInterval(M);
                };
              }, [C, v, $]), oe(() => {
                const k = E.current;
                if (!k) return;
                const M = r, H = () => {
                  if (b.current)
                    return;
                  const F = k.scrollTop;
                  if (Math.abs(F - x.current) < M)
                    return;
                  console.log(
                    `Threshold passed at ${F}px. Recalculating range...`
                  );
                  const { clientHeight: te } = k;
                  let ie = v - 1, ye = 0, Ne = 0;
                  for (; ye <= ie; ) {
                    const Se = Math.floor((ye + ie) / 2);
                    $[Se] < F ? (Ne = Se, ye = Se + 1) : ie = Se - 1;
                  }
                  const Ce = Math.max(0, Ne - a);
                  let fe = Ce;
                  const Re = F + te;
                  for (; fe < v && $[fe] < Re; )
                    fe++;
                  _({
                    startIndex: Ce,
                    endIndex: Math.min(v, fe + a)
                  }), x.current = F;
                };
                return k.addEventListener("scroll", H, {
                  passive: !0
                }), () => k.removeEventListener("scroll", H);
              }, [v, $, r, a, C]);
              const j = $e(() => {
                console.log(
                  "USER ACTION: Clicked scroll button -> SCROLLING_TO_BOTTOM"
                ), A("SCROLLING_TO_BOTTOM");
              }, []), se = $e(
                (k, M = "smooth") => {
                  E.current && $[k] !== void 0 && (A("IDLE_NOT_AT_BOTTOM"), E.current.scrollTo({
                    top: $[k],
                    behavior: M
                  }));
                },
                [$]
              ), ge = {
                outer: {
                  ref: E,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${D}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${$[p.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: z,
                virtualizerProps: ge,
                scrollToBottom: j,
                scrollToIndex: se
              };
            };
          if (l === "stateSort")
            return (t) => {
              const a = [...d()].sort(
                (u, E) => t(u.item, E.item)
              ), c = a.map(({ item: u }) => u), f = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, n, f);
            };
          if (l === "stateFilter")
            return (t) => {
              const a = d().filter(
                ({ item: u }, E) => t(u, E)
              ), c = a.map(({ item: u }) => u), f = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, n, f);
            };
          if (l === "stateMap")
            return (t) => {
              const r = o.getState().getNestedState(e, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (c, f) => f)).map((c, f) => {
                const u = r[c], E = [...n, c.toString()], p = s(u, E, S);
                return t(u, p, {
                  register: () => {
                    const [, C] = Q({}), A = `${m}-${n.join(".")}-${c}`;
                    le(() => {
                      const b = `${e}////${A}`, U = o.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return U.components.set(b, {
                        forceUpdate: () => C({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(e, U), () => {
                        const Y = o.getState().stateComponents.get(e);
                        Y && Y.components.delete(b);
                      };
                    }, [e, A]);
                  },
                  index: f,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                r
              ), null);
            };
          if (l === "stateMapNoRender")
            return (t) => I.map((a, c) => {
              let f;
              S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
              const u = [...n, f.toString()], E = s(a, u, S);
              return t(
                a,
                E,
                c,
                I,
                s(I, n, S)
              );
            });
          if (l === "$stateMap")
            return (t) => de(tt, {
              proxy: {
                _stateKey: e,
                _path: n,
                _mapFn: t
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateList")
            return (t) => {
              const r = o.getState().getNestedState(e, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (c, f) => f)).map((c, f) => {
                const u = r[c], E = [...n, c.toString()], p = s(u, E, S), _ = `${m}-${n.join(".")}-${c}`;
                return de(rt, {
                  key: c,
                  stateKey: e,
                  itemComponentId: _,
                  itemPath: E,
                  children: t(
                    u,
                    p,
                    f,
                    r,
                    s(r, n, S)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (t) => {
              const r = I;
              T.clear(), O++;
              const a = r.flatMap(
                (c) => c[t] ?? []
              );
              return s(
                a,
                [...n, "[*]", t],
                S
              );
            };
          if (l === "index")
            return (t) => {
              const r = I[t];
              return s(r, [...n, t.toString()]);
            };
          if (l === "last")
            return () => {
              const t = o.getState().getNestedState(e, n);
              if (t.length === 0) return;
              const r = t.length - 1, a = t[r], c = [...n, r.toString()];
              return s(a, c);
            };
          if (l === "insert")
            return (t) => (w(n), pe(i, t, n, e), s(
              o.getState().getNestedState(e, n),
              n
            ));
          if (l === "uniqueInsert")
            return (t, r, a) => {
              const c = o.getState().getNestedState(e, n), f = K(t) ? t(c) : t;
              let u = null;
              if (!c.some((p) => {
                if (r) {
                  const C = r.every(
                    (A) => q(p[A], f[A])
                  );
                  return C && (u = p), C;
                }
                const _ = q(p, f);
                return _ && (u = p), _;
              }))
                w(n), pe(i, f, n, e);
              else if (a && u) {
                const p = a(u), _ = c.map(
                  (C) => q(C, u) ? p : C
                );
                w(n), ce(i, _, n);
              }
            };
          if (l === "cut")
            return (t, r) => {
              if (!r?.waitForSync)
                return w(n), me(i, n, e, t), s(
                  o.getState().getNestedState(e, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (t) => {
              for (let r = 0; r < I.length; r++)
                I[r] === t && me(i, n, e, r);
            };
          if (l === "toggleByValue")
            return (t) => {
              const r = I.findIndex((a) => a === t);
              r > -1 ? me(i, n, e, r) : pe(i, t, n, e);
            };
          if (l === "stateFind")
            return (t) => {
              const a = d().find(
                ({ item: f }, u) => t(f, u)
              );
              if (!a) return;
              const c = [...n, a.originalIndex.toString()];
              return s(a.item, c, S);
            };
          if (l === "findWith")
            return (t, r) => {
              const c = d().find(
                ({ item: u }) => u[t] === r
              );
              if (!c) return;
              const f = [...n, c.originalIndex.toString()];
              return s(c.item, f, S);
            };
        }
        const ee = n[n.length - 1];
        if (!isNaN(Number(ee))) {
          const d = n.slice(0, -1), t = o.getState().getNestedState(e, d);
          if (Array.isArray(t) && l === "cut")
            return () => me(
              i,
              d,
              e,
              Number(ee)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(I)) {
              const d = o.getState().getNestedState(e, n);
              return S.validIndices.map((t) => d[t]);
            }
            return o.getState().getNestedState(e, n);
          };
        if (l === "$derive")
          return (d) => Pe({
            _stateKey: e,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Pe({
            _stateKey: e,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${e}:${n.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => Te(g + "-" + e + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), t = d.join("."), r = o.getState().getNestedState(e, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(e, t) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const t = n.slice(0, -1), r = Number(n[n.length - 1]), a = t.join(".");
            d ? o.getState().setSelectedIndex(e, a, r) : o.getState().setSelectedIndex(e, a, void 0);
            const c = o.getState().getNestedState(e, [...t]);
            ce(i, c, t), w(t);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), t = Number(n[n.length - 1]), r = d.join("."), a = o.getState().getSelectedIndex(e, r);
            o.getState().setSelectedIndex(
              e,
              r,
              a === t ? void 0 : t
            );
            const c = o.getState().getNestedState(e, [...d]);
            ce(i, c, d), w(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const t = o.getState().cogsStateStore[e], a = ze(t, d).newDocument;
              Le(
                e,
                o.getState().initialStateGlobal[e],
                a,
                i,
                m,
                g
              );
              const c = o.getState().stateComponents.get(e);
              if (c) {
                const f = _e(t, a), u = new Set(f);
                for (const [
                  E,
                  p
                ] of c.components.entries()) {
                  let _ = !1;
                  const C = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!C.includes("none")) {
                    if (C.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (C.includes("component") && (p.paths.has("") && (_ = !0), !_))
                      for (const A of u) {
                        if (p.paths.has(A)) {
                          _ = !0;
                          break;
                        }
                        let b = A.lastIndexOf(".");
                        for (; b !== -1; ) {
                          const U = A.substring(0, b);
                          if (p.paths.has(U)) {
                            _ = !0;
                            break;
                          }
                          const Y = A.substring(
                            b + 1
                          );
                          if (!isNaN(Number(Y))) {
                            const x = U.lastIndexOf(".");
                            if (x !== -1) {
                              const N = U.substring(
                                0,
                                x
                              );
                              if (p.paths.has(N)) {
                                _ = !0;
                                break;
                              }
                            }
                          }
                          b = U.lastIndexOf(".");
                        }
                        if (_) break;
                      }
                    if (!_ && C.includes("deps") && p.depsFunction) {
                      const A = p.depsFunction(a);
                      let b = !1;
                      typeof A == "boolean" ? A && (b = !0) : q(p.deps, A) || (p.deps = A, b = !0), b && (_ = !0);
                    }
                    _ && p.forceUpdate();
                  }
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const d = o.getState().getInitialOptions(e)?.validation, t = o.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              X(d.key);
              const r = o.getState().cogsStateStore[e];
              try {
                const a = o.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([f]) => {
                  f && f.startsWith(d.key) && X(f);
                });
                const c = d.zodSchema.safeParse(r);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const E = u.path, p = u.message, _ = [d.key, ...E].join(".");
                  t(_, p);
                }), ve(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => o().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => ke.getState().getFormRefsByStateKey(e);
          if (l === "_initialState")
            return o.getState().initialStateGlobal[e];
          if (l === "_serverState")
            return o.getState().serverState[e];
          if (l === "_isLoading")
            return o.getState().isLoadingGlobal[e];
          if (l === "revertToInitialState")
            return y.revertToInitialState;
          if (l === "updateInitialState") return y.updateInitialState;
          if (l === "removeValidation") return y.removeValidation;
        }
        if (l === "getFormRef")
          return () => ke.getState().getFormRef(e + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: t
          }) => /* @__PURE__ */ we(
            He,
            {
              formOpts: t ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: o.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: S?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return e;
        if (l === "_path") return n;
        if (l === "_isServerSynced") return y._isServerSynced;
        if (l === "update")
          return (d, t) => {
            if (t?.debounce)
              Fe(() => {
                ce(i, d, n, "");
                const r = o.getState().getNestedState(e, n);
                t?.afterUpdate && t.afterUpdate(r);
              }, t.debounce);
            else {
              ce(i, d, n, "");
              const r = o.getState().getNestedState(e, n);
              t?.afterUpdate && t.afterUpdate(r);
            }
            w(n);
          };
        if (l === "formElement")
          return (d, t) => /* @__PURE__ */ we(
            We,
            {
              setState: i,
              stateKey: e,
              path: n,
              child: d,
              formOpts: t
            }
          );
        const P = [...n, l], ae = o.getState().getNestedState(e, P);
        return s(ae, P, S);
      }
    }, B = new Proxy(G, L);
    return T.set(W, {
      proxy: B,
      stateVersion: O
    }), B;
  }
  return s(
    o.getState().getNestedState(e, [])
  );
}
function Pe(e) {
  return de(nt, { proxy: e });
}
function tt({
  proxy: e,
  rebuildStateShape: i
}) {
  const m = o().getNestedState(e._stateKey, e._path);
  return Array.isArray(m) ? i(
    m,
    e._path
  ).stateMapNoRender(
    (T, O, w, y, s) => e._mapFn(T, O, w, y, s)
  ) : null;
}
function nt({
  proxy: e
}) {
  const i = J(null), m = `${e._stateKey}-${e._path.join(".")}`;
  return oe(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const T = g.parentElement, w = Array.from(T.childNodes).indexOf(g);
    let y = T.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, T.setAttribute("data-parent-id", y));
    const I = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: w,
      effect: e._effect
    };
    o.getState().addSignalElement(m, I);
    const n = o.getState().getNestedState(e._stateKey, e._path);
    let S;
    if (e._effect)
      try {
        S = new Function(
          "state",
          `return (${e._effect})(state)`
        )(n);
      } catch (G) {
        console.error("Error evaluating effect function during mount:", G), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const W = document.createTextNode(String(S));
    g.replaceWith(W);
  }, [e._stateKey, e._path.join("."), e._effect]), de("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function Tt(e) {
  const i = De(
    (m) => {
      const g = o.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(e._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => g.components.delete(e._stateKey);
    },
    () => o.getState().getNestedState(e._stateKey, e._path)
  );
  return de("text", {}, String(i));
}
function rt({
  stateKey: e,
  itemComponentId: i,
  itemPath: m,
  children: g
}) {
  const [, T] = Q({}), [O, w] = qe(), y = J(null);
  return oe(() => {
    w.height > 0 && w.height !== y.current && (y.current = w.height, o.getState().setShadowMetadata(e, m, {
      virtualizer: {
        itemHeight: w.height
      }
    }));
  }, [w.height, e, m]), le(() => {
    const s = `${e}////${i}`, I = o.getState().stateComponents.get(e) || {
      components: /* @__PURE__ */ new Map()
    };
    return I.components.set(s, {
      forceUpdate: () => T({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), o.getState().stateComponents.set(e, I), () => {
      const n = o.getState().stateComponents.get(e);
      n && n.components.delete(s);
    };
  }, [e, i, m.join(".")]), /* @__PURE__ */ we("div", { ref: O, children: g });
}
export {
  Pe as $cogsSignal,
  Tt as $cogsSignalStore,
  mt as addStateOptions,
  ht as createCogsState,
  It as notifyComponent,
  et as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
