"use client";
import { jsx as pe } from "react/jsx-runtime";
import { useState as Q, useRef as Z, useEffect as oe, useLayoutEffect as ie, useMemo as Ee, createElement as ce, useSyncExternalStore as Re, startTransition as De, useCallback as Ce } from "react";
import { transformStateFunc as Ue, isDeepEqual as q, isFunction as K, getNestedValue as J, getDifferences as _e, debounce as je } from "./utility.js";
import { pushFunc as ye, updateFn as se, cutFunc as fe, ValidationWrapper as He, FormControlComponent as Fe } from "./Functions.jsx";
import Be from "superjson";
import { v4 as we } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as $e } from "./store.js";
import { useCogsConfig as Ve } from "./CogsStateClient.jsx";
import { applyPatch as We } from "fast-json-patch";
import ze from "react-use-measure";
function ke(e, i) {
  const m = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, T = m(e) || {};
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
  const g = re(e) || {}, T = m[e] || {}, C = r.getState().setInitialStateOptions, p = { ...T, ...g };
  let v = !1;
  if (i)
    for (const a in i)
      p.hasOwnProperty(a) ? (a == "localStorage" && i[a] && p[a].key !== i[a]?.key && (v = !0, p[a] = i[a]), a == "initialState" && i[a] && p[a] !== i[a] && // Different references
      !q(p[a], i[a]) && (v = !0, p[a] = i[a])) : (v = !0, p[a] = i[a]);
  v && C(e, p);
}
function St(e, { formElements: i, validation: m }) {
  return { initialState: e, formElements: i, validation: m };
}
const mt = (e, i) => {
  let m = e;
  const [g, T] = Ue(m);
  (Object.keys(T).length > 0 || i && Object.keys(i).length > 0) && Object.keys(T).forEach((v) => {
    T[v] = T[v] || {}, T[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...T[v].formElements || {}
      // State-specific overrides
    }, re(v) || r.getState().setInitialStateOptions(v, T[v]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const C = (v, a) => {
    const [h] = Q(a?.componentId ?? we());
    xe({
      stateKey: v,
      options: a,
      initialOptionsPart: T
    });
    const n = r.getState().cogsStateStore[v] || g[v], S = a?.modifyState ? a.modifyState(n) : n, [F, L] = Ke(
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
    xe({ stateKey: v, options: a, initialOptionsPart: T }), a.localStorage && Xe(v, a), he(v);
  }
  return { useCogsState: C, setCogsOptions: p };
}, {
  setUpdaterState: Se,
  setState: ne,
  getInitialOptions: re,
  getKeyState: Pe,
  getValidationErrors: qe,
  setStateLog: Je,
  updateInitialStateGlobal: Oe,
  addValidationError: Ye,
  removeValidationError: X,
  setServerSyncActions: Ze
} = r.getState(), be = (e, i, m, g, T) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    g
  );
  const C = K(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (C && g) {
    const p = `${g}-${i}-${C}`;
    let v;
    try {
      v = Ie(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: T ?? v
    }, h = Be.serialize(a);
    window.localStorage.setItem(
      p,
      JSON.stringify(h.json)
    );
  }
}, Ie = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Xe = (e, i) => {
  const m = r.getState().cogsStateStore[e], { sessionId: g } = Ve(), T = K(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (T && g) {
    const C = Ie(
      `${g}-${e}-${T}`
    );
    if (C && C.lastUpdated > (C.lastSyncedWithServer || 0))
      return ne(e, C.state), he(e), !0;
  }
  return !1;
}, Le = (e, i, m, g, T, C) => {
  const p = {
    initialState: i,
    updaterState: me(
      e,
      g,
      T,
      C
    ),
    state: m
  };
  Oe(e, p.initialState), Se(e, p.updaterState), ne(e, p.state);
}, he = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, It = (e, i) => {
  const m = r.getState().stateComponents.get(e);
  if (m) {
    const g = `${e}////${i}`, T = m.components.get(g);
    if ((T ? Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"] : null)?.includes("none"))
      return;
    T && T.forceUpdate();
  }
}, Qe = (e, i, m, g) => {
  switch (e) {
    case "update":
      return {
        oldValue: J(i, g),
        newValue: J(m, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: J(m, g)
      };
    case "cut":
      return {
        oldValue: J(i, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Ke(e, {
  stateKey: i,
  serverSync: m,
  localStorage: g,
  formElements: T,
  reactiveDeps: C,
  reactiveType: p,
  componentId: v,
  initialState: a,
  syncUpdate: h,
  dependencies: n,
  serverState: S
} = {}) {
  const [F, L] = Q({}), { sessionId: G } = Ve();
  let B = !i;
  const [I] = Q(i ?? we()), l = r.getState().stateLog[I], le = Z(/* @__PURE__ */ new Set()), ee = Z(v ?? we()), V = Z(
    null
  );
  V.current = re(I) ?? null, oe(() => {
    if (h && h.stateKey === I && h.path?.[0]) {
      ne(I, (o) => ({
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
      ke(I, {
        initialState: a
      });
      const t = V.current, s = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = r.getState().initialStateGlobal[I];
      if (!(c && !q(c, a) || !c) && !s)
        return;
      let u = null;
      const y = K(t?.localStorage?.key) ? t?.localStorage?.key(a) : t?.localStorage?.key;
      y && G && (u = Ie(`${G}-${I}-${y}`));
      let E = a, w = !1;
      const A = s ? Date.now() : 0, $ = u?.lastUpdated || 0, b = u?.lastSyncedWithServer || 0;
      s && A > $ ? (E = t.serverState.data, w = !0) : u && $ > b && (E = u.state, t?.localStorage?.onChange && t?.localStorage?.onChange(E)), r.getState().initializeShadowState(I, a), Le(
        I,
        a,
        E,
        ae,
        ee.current,
        G
      ), w && y && G && be(E, I, t, G, Date.now()), he(I), (Array.isArray(p) ? p : [p || "component"]).includes("none") || L({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), ie(() => {
    B && ke(I, {
      serverSync: m,
      formElements: T,
      initialState: a,
      localStorage: g,
      middleware: V.current?.middleware
    });
    const t = `${I}////${ee.current}`, o = r.getState().stateComponents.get(I) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(t, {
      forceUpdate: () => L({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: C || void 0,
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
    ne(I, (u) => {
      const y = K(t) ? t(u) : t, E = `${I}-${o.join(".")}`;
      if (E) {
        let M = !1, N = f.signalDomElements.get(E);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const O = o.slice(0, -1), j = J(y, O);
          if (Array.isArray(j)) {
            M = !0;
            const _ = `${I}-${O.join(".")}`;
            N = f.signalDomElements.get(_);
          }
        }
        if (N) {
          const O = M ? J(y, o.slice(0, -1)) : J(y, o);
          N.forEach(({ parentId: j, position: _, effect: R }) => {
            const P = document.querySelector(
              `[data-parent-id="${j}"]`
            );
            if (P) {
              const z = Array.from(P.childNodes);
              if (z[_]) {
                const D = R ? new Function("state", `return (${R})(state)`)(O) : O;
                z[_].textContent = String(D);
              }
            }
          });
        }
      }
      console.log("shadowState", f.shadowStateStore), s.updateType === "update" && (c || V.current?.validation?.key) && o && X(
        (c || V.current?.validation?.key) + "." + o.join(".")
      );
      const w = o.slice(0, o.length - 1);
      s.updateType === "cut" && V.current?.validation?.key && X(
        V.current?.validation?.key + "." + w.join(".")
      ), s.updateType === "insert" && V.current?.validation?.key && qe(
        V.current?.validation?.key + "." + w.join(".")
      ).filter(([N, O]) => {
        let j = N?.split(".").length;
        if (N == w.join(".") && j == w.length - 1) {
          let _ = N + "." + w;
          X(N), Ye(_, O);
        }
      });
      const A = f.stateComponents.get(I);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", A), A) {
        const M = _e(u, y), N = new Set(M), O = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          j,
          _
        ] of A.components.entries()) {
          let R = !1;
          const P = Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"];
          if (console.log("component", _), !P.includes("none")) {
            if (P.includes("all")) {
              _.forceUpdate();
              continue;
            }
            if (P.includes("component") && ((_.paths.has(O) || _.paths.has("")) && (R = !0), !R))
              for (const z of N) {
                let D = z;
                for (; ; ) {
                  if (_.paths.has(D)) {
                    R = !0;
                    break;
                  }
                  const k = D.lastIndexOf(".");
                  if (k !== -1) {
                    const x = D.substring(
                      0,
                      k
                    );
                    if (!isNaN(
                      Number(D.substring(k + 1))
                    ) && _.paths.has(x)) {
                      R = !0;
                      break;
                    }
                    D = x;
                  } else
                    D = "";
                  if (D === "")
                    break;
                }
                if (R) break;
              }
            if (!R && P.includes("deps") && _.depsFunction) {
              const z = _.depsFunction(y);
              let D = !1;
              typeof z == "boolean" ? z && (D = !0) : q(_.deps, z) || (_.deps = z, D = !0), D && (R = !0);
            }
            R && _.forceUpdate();
          }
        }
      }
      const $ = Date.now();
      o = o.map((M, N) => {
        const O = o.slice(0, -1), j = J(y, O);
        return N === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (j.length - 1).toString() : M;
      });
      const { oldValue: b, newValue: U } = Qe(
        s.updateType,
        u,
        y,
        o
      ), Y = {
        timeStamp: $,
        stateKey: I,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: b,
        newValue: U
      };
      switch (s.updateType) {
        case "update":
          f.updateShadowAtPath(I, o, y);
          break;
        case "insert":
          const M = o.slice(0, -1);
          f.insertShadowArrayElement(I, M, U);
          break;
        case "cut":
          const N = o.slice(0, -1), O = parseInt(o[o.length - 1]);
          f.removeShadowArrayElement(I, N, O);
          break;
      }
      if (Je(I, (M) => {
        const O = [...M ?? [], Y].reduce((j, _) => {
          const R = `${_.stateKey}:${JSON.stringify(_.path)}`, P = j.get(R);
          return P ? (P.timeStamp = Math.max(P.timeStamp, _.timeStamp), P.newValue = _.newValue, P.oldValue = P.oldValue ?? _.oldValue, P.updateType = _.updateType) : j.set(R, { ..._ }), j;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), be(
        y,
        I,
        V.current,
        G
      ), V.current?.middleware && V.current.middleware({
        updateLog: l,
        update: Y
      }), V.current?.serverSync) {
        const M = f.serverState[I], N = V.current?.serverSync;
        Ze(I, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: y }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return y;
    });
  };
  r.getState().updaterState[I] || (Se(
    I,
    me(
      I,
      ae,
      ee.current,
      G
    )
  ), r.getState().cogsStateStore[I] || ne(I, e), r.getState().initialStateGlobal[I] || Oe(I, e));
  const d = Ee(() => me(
    I,
    ae,
    ee.current,
    G
  ), [I, G]);
  return [Pe(I), d];
}
function me(e, i, m, g) {
  const T = /* @__PURE__ */ new Map();
  let C = 0;
  const p = (h) => {
    const n = h.join(".");
    for (const [S] of T)
      (S === n || S.startsWith(n + ".")) && T.delete(S);
    C++;
  }, v = {
    removeValidation: (h) => {
      h?.validationKey && X(h.validationKey);
    },
    revertToInitialState: (h) => {
      const n = r.getState().getInitialOptions(e)?.validation;
      n?.key && X(n?.key), h?.validationKey && X(h.validationKey);
      const S = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), T.clear(), C++;
      const F = a(S, []), L = re(e), G = K(L?.localStorage?.key) ? L?.localStorage?.key(S) : L?.localStorage?.key, B = `${g}-${e}-${G}`;
      B && localStorage.removeItem(B), Se(e, F), ne(e, S);
      const I = r.getState().stateComponents.get(e);
      return I && I.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (h) => {
      T.clear(), C++;
      const n = me(
        e,
        i,
        m,
        g
      ), S = r.getState().initialStateGlobal[e], F = re(e), L = K(F?.localStorage?.key) ? F?.localStorage?.key(S) : F?.localStorage?.key, G = `${g}-${e}-${L}`;
      return localStorage.getItem(G) && localStorage.removeItem(G), De(() => {
        Oe(e, h), r.getState().initializeShadowState(e, h), Se(e, n), ne(e, h);
        const B = r.getState().stateComponents.get(e);
        B && B.components.forEach((I) => {
          I.forceUpdate();
        });
      }), {
        fetchId: (B) => n.get()[B]
      };
    },
    _initialState: r.getState().initialStateGlobal[e],
    _serverState: r.getState().serverState[e],
    _isLoading: r.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const h = r.getState().serverState[e];
      return !!(h && q(h, Pe(e)));
    }
  };
  function a(h, n = [], S) {
    const F = n.map(String).join(".");
    T.get(F);
    const L = function() {
      return r().getNestedState(e, n);
    };
    Object.keys(v).forEach((I) => {
      L[I] = v[I];
    });
    const G = {
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
          return () => _e(
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
                  const y = [s, ...u.path].join(".");
                  r.getState().addValidationError(y, u.message);
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
          const d = r.getState().getNestedState(e, n), t = r.getState().initialStateGlobal[e], o = J(t, n);
          return q(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              e,
              n
            ), t = r.getState().initialStateGlobal[e], o = J(t, n);
            return q(d, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[e], t = re(e), o = K(t?.localStorage?.key) ? t?.localStorage?.key(d) : t?.localStorage?.key, s = `${g}-${e}-${o}`;
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
              } = t, u = Z(null), [y, E] = Q({
                startIndex: 0,
                endIndex: 10
              }), [w, A] = Q("IDLE_AT_TOP"), $ = Z(!1), b = Z(0), U = Z(f), [Y, M] = Q(0);
              oe(() => r.getState().subscribeToShadowState(e, () => {
                M((x) => x + 1);
              }), [e]);
              const N = r().getNestedState(
                e,
                n
              ), O = N.length, { totalHeight: j, positions: _ } = Ee(() => {
                const k = r.getState().getShadowMetadata(e, n) || [];
                let x = 0;
                const H = [];
                for (let W = 0; W < O; W++) {
                  H[W] = x;
                  const te = k[W]?.virtualizer?.itemHeight;
                  x += te || o;
                }
                return { totalHeight: x, positions: H };
              }, [
                O,
                e,
                n.join("."),
                o,
                Y
              ]), R = Ee(() => {
                const k = Math.max(0, y.startIndex), x = Math.min(O, y.endIndex), H = Array.from(
                  { length: x - k },
                  (te, Ae) => k + Ae
                ), W = H.map((te) => N[te]);
                return a(W, n, {
                  ...S,
                  validIndices: H
                });
              }, [y.startIndex, y.endIndex, N, O]);
              ie(() => {
                const k = !q(
                  f,
                  U.current
                ), x = O > b.current;
                if (k) {
                  console.log("TRANSITION: Deps changed -> IDLE_AT_TOP"), A("IDLE_AT_TOP");
                  return;
                }
                x && w === "LOCKED_AT_BOTTOM" && c && (console.log(
                  "TRANSITION: New items arrived while locked -> GETTING_HEIGHTS"
                ), A("GETTING_HEIGHTS")), b.current = O, U.current = f;
              }, [O, ...f]), ie(() => {
                const k = u.current;
                if (!k) return;
                let x;
                if (w === "IDLE_AT_TOP" && c && O > 0)
                  console.log(
                    "ACTION (IDLE_AT_TOP): Data arrived -> GETTING_HEIGHTS"
                  ), A("GETTING_HEIGHTS");
                else if (w === "GETTING_HEIGHTS")
                  console.log("ACTION (GETTING_HEIGHTS): Setting range to end"), E({
                    startIndex: Math.max(0, O - 10 - s),
                    endIndex: O
                  }), x = setInterval(() => {
                    const H = O - 1;
                    ((r.getState().getShadowMetadata(e, n) || [])[H]?.virtualizer?.itemHeight || 0) > 0 && (clearInterval(x), console.log(
                      "ACTION (GETTING_HEIGHTS): Measurement success -> SCROLLING_TO_BOTTOM"
                    ), A("SCROLLING_TO_BOTTOM"));
                  }, 100);
                else if (w === "SCROLLING_TO_BOTTOM") {
                  console.log(
                    "ACTION (SCROLLING_TO_BOTTOM): Executing scroll."
                  ), $.current = !0;
                  const H = b.current === 0 ? "auto" : "smooth";
                  k.scrollTo({
                    top: k.scrollHeight,
                    behavior: H
                  });
                  const W = setTimeout(
                    () => {
                      $.current = !1, A("LOCKED_AT_BOTTOM");
                    },
                    H === "smooth" ? 500 : 50
                  );
                  return () => clearTimeout(W);
                }
                return () => {
                  x && clearInterval(x);
                };
              }, [w, O, _]), oe(() => {
                const k = u.current;
                if (!k) return;
                const x = () => {
                  if ($.current)
                    return;
                  const { scrollTop: H, clientHeight: W, scrollHeight: te } = k;
                  te - H - W < 1 ? w !== "LOCKED_AT_BOTTOM" && (console.log(
                    "SCROLL EVENT: Reached bottom -> LOCKED_AT_BOTTOM"
                  ), A("LOCKED_AT_BOTTOM")) : w !== "IDLE_NOT_AT_BOTTOM" && (console.log(
                    "SCROLL EVENT: Scrolled up -> IDLE_NOT_AT_BOTTOM"
                  ), A("IDLE_NOT_AT_BOTTOM"));
                  let Te = O - 1, ve = 0, Ne = 0;
                  for (; ve <= Te; ) {
                    const ge = Math.floor((ve + Te) / 2);
                    _[ge] < H ? (Ne = ge, ve = ge + 1) : Te = ge - 1;
                  }
                  const de = Math.max(
                    0,
                    Ne - s
                  );
                  if (de === y.startIndex)
                    return;
                  let ue = de;
                  const Ge = H + W;
                  for (; ue < O && _[ue] < Ge; )
                    ue++;
                  console.log(
                    `Index changed from ${y.startIndex} to ${de}. Updating range.`
                  ), E({
                    startIndex: de,
                    endIndex: Math.min(O, ue + s)
                  });
                };
                return k.addEventListener("scroll", x, {
                  passive: !0
                }), () => k.removeEventListener("scroll", x);
              }, [O, _, w, y.startIndex]);
              const P = Ce(() => {
                console.log(
                  "USER ACTION: Clicked scroll button -> SCROLLING_TO_BOTTOM"
                ), O !== 0 && A("SCROLLING_TO_BOTTOM");
              }, [O]), z = Ce(
                (k, x = "smooth") => {
                  u.current && _[k] !== void 0 && (A("IDLE_NOT_AT_BOTTOM"), u.current.scrollTo({
                    top: _[k],
                    behavior: x
                  }));
                },
                [_]
              ), D = {
                outer: {
                  ref: u,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${j}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${_[y.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: R,
                virtualizerProps: D,
                scrollToBottom: P,
                scrollToIndex: z
              };
            };
          if (l === "stateSort")
            return (t) => {
              const s = [...d()].sort(
                (u, y) => t(u.item, y.item)
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
                ({ item: u }, y) => t(u, y)
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
                const u = o[c], y = [...n, c.toString()], E = a(u, y, S);
                return t(u, E, {
                  register: () => {
                    const [, A] = Q({}), $ = `${m}-${n.join(".")}-${c}`;
                    ie(() => {
                      const b = `${e}////${$}`, U = r.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return U.components.set(b, {
                        forceUpdate: () => A({}),
                        paths: /* @__PURE__ */ new Set([y.join(".")])
                      }), r.getState().stateComponents.set(e, U), () => {
                        const Y = r.getState().stateComponents.get(e);
                        Y && Y.components.delete(b);
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
              const u = [...n, f.toString()], y = a(s, u, S);
              return t(
                s,
                y,
                c,
                h,
                a(h, n, S)
              );
            });
          if (l === "$stateMap")
            return (t) => ce(et, {
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
                const u = o[c], y = [...n, c.toString()], E = a(u, y, S), w = `${m}-${n.join(".")}-${c}`;
                return ce(nt, {
                  key: c,
                  stateKey: e,
                  itemComponentId: w,
                  itemPath: y,
                  children: t(
                    u,
                    E,
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
              T.clear(), C++;
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
            return (t) => (p(n), ye(i, t, n, e), a(
              r.getState().getNestedState(e, n),
              n
            ));
          if (l === "uniqueInsert")
            return (t, o, s) => {
              const c = r.getState().getNestedState(e, n), f = K(t) ? t(c) : t;
              let u = null;
              if (!c.some((E) => {
                if (o) {
                  const A = o.every(
                    ($) => q(E[$], f[$])
                  );
                  return A && (u = E), A;
                }
                const w = q(E, f);
                return w && (u = E), w;
              }))
                p(n), ye(i, f, n, e);
              else if (s && u) {
                const E = s(u), w = c.map(
                  (A) => q(A, u) ? E : A
                );
                p(n), se(i, w, n);
              }
            };
          if (l === "cut")
            return (t, o) => {
              if (!o?.waitForSync)
                return p(n), fe(i, n, e, t), a(
                  r.getState().getNestedState(e, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (t) => {
              for (let o = 0; o < h.length; o++)
                h[o] === t && fe(i, n, e, o);
            };
          if (l === "toggleByValue")
            return (t) => {
              const o = h.findIndex((s) => s === t);
              o > -1 ? fe(i, n, e, o) : ye(i, t, n, e);
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
            return () => fe(
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
          return (d) => Me({
            _stateKey: e,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Me({
            _stateKey: e,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${e}:${n.join(".")}`;
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => Ie(g + "-" + e + "-" + d);
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
              const t = r.getState().cogsStateStore[e], s = We(t, d).newDocument;
              Le(
                e,
                r.getState().initialStateGlobal[e],
                s,
                i,
                m,
                g
              );
              const c = r.getState().stateComponents.get(e);
              if (c) {
                const f = _e(t, s), u = new Set(f);
                for (const [
                  y,
                  E
                ] of c.components.entries()) {
                  let w = !1;
                  const A = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
                  if (!A.includes("none")) {
                    if (A.includes("all")) {
                      E.forceUpdate();
                      continue;
                    }
                    if (A.includes("component") && (E.paths.has("") && (w = !0), !w))
                      for (const $ of u) {
                        if (E.paths.has($)) {
                          w = !0;
                          break;
                        }
                        let b = $.lastIndexOf(".");
                        for (; b !== -1; ) {
                          const U = $.substring(0, b);
                          if (E.paths.has(U)) {
                            w = !0;
                            break;
                          }
                          const Y = $.substring(
                            b + 1
                          );
                          if (!isNaN(Number(Y))) {
                            const M = U.lastIndexOf(".");
                            if (M !== -1) {
                              const N = U.substring(
                                0,
                                M
                              );
                              if (E.paths.has(N)) {
                                w = !0;
                                break;
                              }
                            }
                          }
                          b = U.lastIndexOf(".");
                        }
                        if (w) break;
                      }
                    if (!w && A.includes("deps") && E.depsFunction) {
                      const $ = E.depsFunction(s);
                      let b = !1;
                      typeof $ == "boolean" ? $ && (b = !0) : q(E.deps, $) || (E.deps = $, b = !0), b && (w = !0);
                    }
                    w && E.forceUpdate();
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
              X(d.key);
              const o = r.getState().cogsStateStore[e];
              try {
                const s = r.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([f]) => {
                  f && f.startsWith(d.key) && X(f);
                });
                const c = d.zodSchema.safeParse(o);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const y = u.path, E = u.message, w = [d.key, ...y].join(".");
                  t(w, E);
                }), he(e), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => r().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => $e.getState().getFormRefsByStateKey(e);
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
          return () => $e.getState().getFormRef(e + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: t
          }) => /* @__PURE__ */ pe(
            He,
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
              je(() => {
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
          return (d, t) => /* @__PURE__ */ pe(
            Fe,
            {
              setState: i,
              stateKey: e,
              path: n,
              child: d,
              formOpts: t
            }
          );
        const V = [...n, l], ae = r.getState().getNestedState(e, V);
        return a(ae, V, S);
      }
    }, B = new Proxy(L, G);
    return T.set(F, {
      proxy: B,
      stateVersion: C
    }), B;
  }
  return a(
    r.getState().getNestedState(e, [])
  );
}
function Me(e) {
  return ce(tt, { proxy: e });
}
function et({
  proxy: e,
  rebuildStateShape: i
}) {
  const m = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(m) ? i(
    m,
    e._path
  ).stateMapNoRender(
    (T, C, p, v, a) => e._mapFn(T, C, p, v, a)
  ) : null;
}
function tt({
  proxy: e
}) {
  const i = Z(null), m = `${e._stateKey}-${e._path.join(".")}`;
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
    const F = document.createTextNode(String(S));
    g.replaceWith(F);
  }, [e._stateKey, e._path.join("."), e._effect]), ce("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function ht(e) {
  const i = Re(
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
function nt({
  stateKey: e,
  itemComponentId: i,
  itemPath: m,
  children: g
}) {
  const [, T] = Q({}), [C, p] = ze(), v = Z(null);
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
  }, [e, i, m.join(".")]), /* @__PURE__ */ pe("div", { ref: C, children: g });
}
export {
  Me as $cogsSignal,
  ht as $cogsSignalStore,
  St as addStateOptions,
  mt as createCogsState,
  It as notifyComponent,
  Ke as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
