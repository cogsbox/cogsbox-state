"use client";
import { jsx as ye } from "react/jsx-runtime";
import { useState as Q, useRef as Z, useEffect as oe, useLayoutEffect as ce, useMemo as pe, createElement as le, useSyncExternalStore as Ge, startTransition as Le, useCallback as Ae } from "react";
import { transformStateFunc as Re, isDeepEqual as q, isFunction as K, getNestedValue as J, getDifferences as Ee, debounce as De } from "./utility.js";
import { pushFunc as ve, updateFn as ie, cutFunc as fe, ValidationWrapper as Ue, FormControlComponent as je } from "./Functions.jsx";
import He from "superjson";
import { v4 as we } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as Ne } from "./store.js";
import { useCogsConfig as xe } from "./CogsStateClient.jsx";
import { applyPatch as Fe } from "fast-json-patch";
import Be from "react-use-measure";
function Ce(e, i) {
  const m = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, T = m(e) || {};
  g(e, {
    ...T,
    ...i
  });
}
function $e({
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
function gt(e, { formElements: i, validation: m }) {
  return { initialState: e, formElements: i, validation: m };
}
const ft = (e, i) => {
  let m = e;
  const [g, T] = Re(m);
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
    $e({
      stateKey: v,
      options: a,
      initialOptionsPart: T
    });
    const n = r.getState().cogsStateStore[v] || g[v], S = a?.modifyState ? a.modifyState(n) : n, [H, G] = Xe(
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
    return G;
  };
  function p(v, a) {
    $e({ stateKey: v, options: a, initialOptionsPart: T }), a.localStorage && Ye(v, a), he(v);
  }
  return { useCogsState: C, setCogsOptions: p };
}, {
  setUpdaterState: Se,
  setState: ne,
  getInitialOptions: re,
  getKeyState: Me,
  getValidationErrors: We,
  setStateLog: ze,
  updateInitialStateGlobal: _e,
  addValidationError: qe,
  removeValidationError: X,
  setServerSyncActions: Je
} = r.getState(), ke = (e, i, m, g, T) => {
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
    }, h = He.serialize(a);
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
}, Ye = (e, i) => {
  const m = r.getState().cogsStateStore[e], { sessionId: g } = xe(), T = K(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (T && g) {
    const C = Ie(
      `${g}-${e}-${T}`
    );
    if (C && C.lastUpdated > (C.lastSyncedWithServer || 0))
      return ne(e, C.state), he(e), !0;
  }
  return !1;
}, Pe = (e, i, m, g, T, C) => {
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
  _e(e, p.initialState), Se(e, p.updaterState), ne(e, p.state);
}, he = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, St = (e, i) => {
  const m = r.getState().stateComponents.get(e);
  if (m) {
    const g = `${e}////${i}`, T = m.components.get(g);
    if ((T ? Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"] : null)?.includes("none"))
      return;
    T && T.forceUpdate();
  }
}, Ze = (e, i, m, g) => {
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
function Xe(e, {
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
  const [H, G] = Q({}), { sessionId: L } = xe();
  let F = !i;
  const [I] = Q(i ?? we()), l = r.getState().stateLog[I], de = Z(/* @__PURE__ */ new Set()), ee = Z(v ?? we()), P = Z(
    null
  );
  P.current = re(I) ?? null, oe(() => {
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
      Ce(I, {
        initialState: a
      });
      const t = P.current, s = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = r.getState().initialStateGlobal[I];
      if (!(c && !q(c, a) || !c) && !s)
        return;
      let u = null;
      const E = K(t?.localStorage?.key) ? t?.localStorage?.key(a) : t?.localStorage?.key;
      E && L && (u = Ie(`${L}-${I}-${E}`));
      let y = a, O = !1;
      const k = s ? Date.now() : 0, A = u?.lastUpdated || 0, x = u?.lastSyncedWithServer || 0;
      s && k > A ? (y = t.serverState.data, O = !0) : u && A > x && (y = u.state, t?.localStorage?.onChange && t?.localStorage?.onChange(y)), r.getState().initializeShadowState(I, a), Pe(
        I,
        a,
        y,
        ae,
        ee.current,
        L
      ), O && E && L && ke(y, I, t, L, Date.now()), he(I), (Array.isArray(p) ? p : [p || "component"]).includes("none") || G({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), ce(() => {
    F && Ce(I, {
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
      forceUpdate: () => G({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: C || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), r.getState().stateComponents.set(I, o), G({}), () => {
      o && (o.components.delete(t), o.components.size === 0 && r.getState().stateComponents.delete(I));
    };
  }, []);
  const ae = (t, o, s, c) => {
    if (Array.isArray(o)) {
      const u = `${I}-${o.join(".")}`;
      de.current.add(u);
    }
    const f = r.getState();
    ne(I, (u) => {
      const E = K(t) ? t(u) : t, y = `${I}-${o.join(".")}`;
      if (y) {
        let M = !1, N = f.signalDomElements.get(y);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const _ = o.slice(0, -1), j = J(E, _);
          if (Array.isArray(j)) {
            M = !0;
            const w = `${I}-${_.join(".")}`;
            N = f.signalDomElements.get(w);
          }
        }
        if (N) {
          const _ = M ? J(E, o.slice(0, -1)) : J(E, o);
          N.forEach(({ parentId: j, position: w, effect: R }) => {
            const V = document.querySelector(
              `[data-parent-id="${j}"]`
            );
            if (V) {
              const W = Array.from(V.childNodes);
              if (W[w]) {
                const D = R ? new Function("state", `return (${R})(state)`)(_) : _;
                W[w].textContent = String(D);
              }
            }
          });
        }
      }
      console.log("shadowState", f.shadowStateStore), s.updateType === "update" && (c || P.current?.validation?.key) && o && X(
        (c || P.current?.validation?.key) + "." + o.join(".")
      );
      const O = o.slice(0, o.length - 1);
      s.updateType === "cut" && P.current?.validation?.key && X(
        P.current?.validation?.key + "." + O.join(".")
      ), s.updateType === "insert" && P.current?.validation?.key && We(
        P.current?.validation?.key + "." + O.join(".")
      ).filter(([N, _]) => {
        let j = N?.split(".").length;
        if (N == O.join(".") && j == O.length - 1) {
          let w = N + "." + O;
          X(N), qe(w, _);
        }
      });
      const k = f.stateComponents.get(I);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", k), k) {
        const M = Ee(u, E), N = new Set(M), _ = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          j,
          w
        ] of k.components.entries()) {
          let R = !1;
          const V = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
          if (console.log("component", w), !V.includes("none")) {
            if (V.includes("all")) {
              w.forceUpdate();
              continue;
            }
            if (V.includes("component") && ((w.paths.has(_) || w.paths.has("")) && (R = !0), !R))
              for (const W of N) {
                let D = W;
                for (; ; ) {
                  if (w.paths.has(D)) {
                    R = !0;
                    break;
                  }
                  const $ = D.lastIndexOf(".");
                  if ($ !== -1) {
                    const b = D.substring(
                      0,
                      $
                    );
                    if (!isNaN(
                      Number(D.substring($ + 1))
                    ) && w.paths.has(b)) {
                      R = !0;
                      break;
                    }
                    D = b;
                  } else
                    D = "";
                  if (D === "")
                    break;
                }
                if (R) break;
              }
            if (!R && V.includes("deps") && w.depsFunction) {
              const W = w.depsFunction(E);
              let D = !1;
              typeof W == "boolean" ? W && (D = !0) : q(w.deps, W) || (w.deps = W, D = !0), D && (R = !0);
            }
            R && w.forceUpdate();
          }
        }
      }
      const A = Date.now();
      o = o.map((M, N) => {
        const _ = o.slice(0, -1), j = J(E, _);
        return N === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (j.length - 1).toString() : M;
      });
      const { oldValue: x, newValue: U } = Ze(
        s.updateType,
        u,
        E,
        o
      ), Y = {
        timeStamp: A,
        stateKey: I,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: x,
        newValue: U
      };
      switch (s.updateType) {
        case "update":
          f.updateShadowAtPath(I, o, E);
          break;
        case "insert":
          const M = o.slice(0, -1);
          f.insertShadowArrayElement(I, M, U);
          break;
        case "cut":
          const N = o.slice(0, -1), _ = parseInt(o[o.length - 1]);
          f.removeShadowArrayElement(I, N, _);
          break;
      }
      if (ze(I, (M) => {
        const _ = [...M ?? [], Y].reduce((j, w) => {
          const R = `${w.stateKey}:${JSON.stringify(w.path)}`, V = j.get(R);
          return V ? (V.timeStamp = Math.max(V.timeStamp, w.timeStamp), V.newValue = w.newValue, V.oldValue = V.oldValue ?? w.oldValue, V.updateType = w.updateType) : j.set(R, { ...w }), j;
        }, /* @__PURE__ */ new Map());
        return Array.from(_.values());
      }), ke(
        E,
        I,
        P.current,
        L
      ), P.current?.middleware && P.current.middleware({
        updateLog: l,
        update: Y
      }), P.current?.serverSync) {
        const M = f.serverState[I], N = P.current?.serverSync;
        Je(I, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: E }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  r.getState().updaterState[I] || (Se(
    I,
    me(
      I,
      ae,
      ee.current,
      L
    )
  ), r.getState().cogsStateStore[I] || ne(I, e), r.getState().initialStateGlobal[I] || _e(I, e));
  const d = pe(() => me(
    I,
    ae,
    ee.current,
    L
  ), [I, L]);
  return [Me(I), d];
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
      const H = a(S, []), G = re(e), L = K(G?.localStorage?.key) ? G?.localStorage?.key(S) : G?.localStorage?.key, F = `${g}-${e}-${L}`;
      F && localStorage.removeItem(F), Se(e, H), ne(e, S);
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
      ), S = r.getState().initialStateGlobal[e], H = re(e), G = K(H?.localStorage?.key) ? H?.localStorage?.key(S) : H?.localStorage?.key, L = `${g}-${e}-${G}`;
      return localStorage.getItem(L) && localStorage.removeItem(L), Le(() => {
        _e(e, h), r.getState().initializeShadowState(e, h), Se(e, n), ne(e, h);
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
      return !!(h && q(h, Me(e)));
    }
  };
  function a(h, n = [], S) {
    const H = n.map(String).join(".");
    T.get(H);
    const G = function() {
      return r().getNestedState(e, n);
    };
    Object.keys(v).forEach((I) => {
      G[I] = v[I];
    });
    const L = {
      apply(I, l, de) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, n);
      },
      get(I, l) {
        S?.validIndices && !Array.isArray(h) && (S = { ...S, validIndices: void 0 });
        const de = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !de.has(l)) {
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
          return () => Ee(
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
              } = t, u = Z(!1), E = Z(null), [y, O] = Q({
                startIndex: 0,
                endIndex: 10
              }), [k, A] = Q("IDLE_AT_TOP"), x = Z(0), U = Z(f), [Y, M] = Q(0);
              oe(() => r.getState().subscribeToShadowState(e, () => {
                M((b) => b + 1);
              }), [e]);
              const N = r().getNestedState(
                e,
                n
              ), _ = N.length, { totalHeight: j, positions: w } = pe(() => {
                const $ = r.getState().getShadowMetadata(e, n) || [];
                let b = 0;
                const z = [];
                for (let B = 0; B < _; B++) {
                  z[B] = b;
                  const te = $[B]?.virtualizer?.itemHeight;
                  b += te || o;
                }
                return { totalHeight: b, positions: z };
              }, [
                _,
                e,
                n.join("."),
                o,
                Y
              ]), R = pe(() => {
                const $ = Math.max(0, y.startIndex), b = Math.min(_, y.endIndex), z = Array.from(
                  { length: b - $ },
                  (te, se) => $ + se
                ), B = z.map((te) => N[te]);
                return a(B, n, {
                  ...S,
                  validIndices: z
                });
              }, [y.startIndex, y.endIndex, N, _]);
              ce(() => {
                const $ = !q(
                  f,
                  U.current
                ), b = _ > x.current;
                if ($) {
                  console.log("TRANSITION: Deps changed -> IDLE_AT_TOP"), A("IDLE_AT_TOP");
                  return;
                }
                b && k === "LOCKED_AT_BOTTOM" && c && (console.log(
                  "TRANSITION: New items arrived while locked -> GETTING_HEIGHTS"
                ), A("GETTING_HEIGHTS")), x.current = _, U.current = f;
              }, [_, ...f]), ce(() => {
                const $ = E.current;
                if (!$) return;
                let b;
                if (k === "IDLE_AT_TOP" && c && _ > 0)
                  console.log(
                    "ACTION (IDLE_AT_TOP): Data has arrived -> GETTING_HEIGHTS"
                  ), A("GETTING_HEIGHTS");
                else if (k === "GETTING_HEIGHTS")
                  console.log(
                    "ACTION (GETTING_HEIGHTS): Setting range to end and starting loop."
                  ), O({
                    startIndex: Math.max(0, _ - 10 - s),
                    endIndex: _
                  }), b = setInterval(() => {
                    const z = _ - 1;
                    ((r.getState().getShadowMetadata(e, n) || [])[z]?.virtualizer?.itemHeight || 0) > 0 && (clearInterval(b), u.current || (console.log(
                      "ACTION (GETTING_HEIGHTS): Measurement success -> SCROLLING_TO_BOTTOM"
                    ), A("SCROLLING_TO_BOTTOM")));
                  }, 100);
                else if (k === "SCROLLING_TO_BOTTOM") {
                  console.log(
                    "ACTION (SCROLLING_TO_BOTTOM): Executing scroll."
                  );
                  const z = x.current === 0 ? "auto" : "smooth";
                  $.scrollTo({
                    top: $.scrollHeight,
                    behavior: z
                  });
                  const B = setTimeout(
                    () => {
                      console.log(
                        "ACTION (SCROLLING_TO_BOTTOM): Scroll finished -> LOCKED_AT_BOTTOM"
                      ), u.current = !1, A("LOCKED_AT_BOTTOM");
                    },
                    z === "smooth" ? 500 : 50
                  );
                  return () => clearTimeout(B);
                }
                return () => {
                  b && clearInterval(b);
                };
              }, [k, _, w]), oe(() => {
                const $ = E.current;
                if (!$) return;
                const b = () => {
                  $.scrollHeight - $.scrollTop - $.clientHeight < 1 ? u.current = !1 : (console.log(
                    "USER ACTION: Scrolled up -> IDLE_NOT_AT_BOTTOM"
                  ), A("IDLE_NOT_AT_BOTTOM"));
                  const { scrollTop: B, clientHeight: te } = $;
                  let se = 0, ue = _ - 1;
                  for (; se <= ue; ) {
                    const Te = Math.floor((se + ue) / 2);
                    w[Te] < B ? se = Te + 1 : ue = Te - 1;
                  }
                  const Oe = Math.max(0, ue - s);
                  let ge = Oe;
                  const Ve = B + te;
                  for (; ge < _ && w[ge] < Ve; )
                    ge++;
                  O({
                    startIndex: Oe,
                    endIndex: Math.min(_, ge + s)
                  });
                };
                return $.addEventListener("scroll", b, {
                  passive: !0
                }), () => $.removeEventListener("scroll", b);
              }, [_, w, k]);
              const V = Ae(() => {
                console.log(
                  "USER ACTION: Clicked scroll button -> SCROLLING_TO_BOTTOM"
                ), A("SCROLLING_TO_BOTTOM");
              }, []), W = Ae(
                ($, b = "smooth") => {
                  E.current && w[$] !== void 0 && (A("IDLE_NOT_AT_BOTTOM"), E.current.scrollTo({
                    top: w[$],
                    behavior: b
                  }));
                },
                [w]
              ), D = {
                outer: {
                  ref: E,
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
                    transform: `translateY(${w[y.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: R,
                virtualizerProps: D,
                scrollToBottom: V,
                scrollToIndex: W
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
                const u = o[c], E = [...n, c.toString()], y = a(u, E, S);
                return t(u, y, {
                  register: () => {
                    const [, k] = Q({}), A = `${m}-${n.join(".")}-${c}`;
                    ce(() => {
                      const x = `${e}////${A}`, U = r.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return U.components.set(x, {
                        forceUpdate: () => k({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), r.getState().stateComponents.set(e, U), () => {
                        const Y = r.getState().stateComponents.get(e);
                        Y && Y.components.delete(x);
                      };
                    }, [e, A]);
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
            return (t) => le(Qe, {
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
                const u = o[c], E = [...n, c.toString()], y = a(u, E, S), O = `${m}-${n.join(".")}-${c}`;
                return le(et, {
                  key: c,
                  stateKey: e,
                  itemComponentId: O,
                  itemPath: E,
                  children: t(
                    u,
                    y,
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
            return (t) => (p(n), ve(i, t, n, e), a(
              r.getState().getNestedState(e, n),
              n
            ));
          if (l === "uniqueInsert")
            return (t, o, s) => {
              const c = r.getState().getNestedState(e, n), f = K(t) ? t(c) : t;
              let u = null;
              if (!c.some((y) => {
                if (o) {
                  const k = o.every(
                    (A) => q(y[A], f[A])
                  );
                  return k && (u = y), k;
                }
                const O = q(y, f);
                return O && (u = y), O;
              }))
                p(n), ve(i, f, n, e);
              else if (s && u) {
                const y = s(u), O = c.map(
                  (k) => q(k, u) ? y : k
                );
                p(n), ie(i, O, n);
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
              o > -1 ? fe(i, n, e, o) : ve(i, t, n, e);
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
          return (d) => be({
            _stateKey: e,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => be({
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
            ie(i, c, t), p(t);
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
            ie(i, c, d), p(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const t = r.getState().cogsStateStore[e], s = Fe(t, d).newDocument;
              Pe(
                e,
                r.getState().initialStateGlobal[e],
                s,
                i,
                m,
                g
              );
              const c = r.getState().stateComponents.get(e);
              if (c) {
                const f = Ee(t, s), u = new Set(f);
                for (const [
                  E,
                  y
                ] of c.components.entries()) {
                  let O = !1;
                  const k = Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"];
                  if (!k.includes("none")) {
                    if (k.includes("all")) {
                      y.forceUpdate();
                      continue;
                    }
                    if (k.includes("component") && (y.paths.has("") && (O = !0), !O))
                      for (const A of u) {
                        if (y.paths.has(A)) {
                          O = !0;
                          break;
                        }
                        let x = A.lastIndexOf(".");
                        for (; x !== -1; ) {
                          const U = A.substring(0, x);
                          if (y.paths.has(U)) {
                            O = !0;
                            break;
                          }
                          const Y = A.substring(
                            x + 1
                          );
                          if (!isNaN(Number(Y))) {
                            const M = U.lastIndexOf(".");
                            if (M !== -1) {
                              const N = U.substring(
                                0,
                                M
                              );
                              if (y.paths.has(N)) {
                                O = !0;
                                break;
                              }
                            }
                          }
                          x = U.lastIndexOf(".");
                        }
                        if (O) break;
                      }
                    if (!O && k.includes("deps") && y.depsFunction) {
                      const A = y.depsFunction(s);
                      let x = !1;
                      typeof A == "boolean" ? A && (x = !0) : q(y.deps, A) || (y.deps = A, x = !0), x && (O = !0);
                    }
                    O && y.forceUpdate();
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
                  const E = u.path, y = u.message, O = [d.key, ...E].join(".");
                  t(O, y);
                }), he(e), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => r().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => Ne.getState().getFormRefsByStateKey(e);
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
          return () => Ne.getState().getFormRef(e + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: t
          }) => /* @__PURE__ */ ye(
            Ue,
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
              De(() => {
                ie(i, d, n, "");
                const o = r.getState().getNestedState(e, n);
                t?.afterUpdate && t.afterUpdate(o);
              }, t.debounce);
            else {
              ie(i, d, n, "");
              const o = r.getState().getNestedState(e, n);
              t?.afterUpdate && t.afterUpdate(o);
            }
            p(n);
          };
        if (l === "formElement")
          return (d, t) => /* @__PURE__ */ ye(
            je,
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
    }, F = new Proxy(G, L);
    return T.set(H, {
      proxy: F,
      stateVersion: C
    }), F;
  }
  return a(
    r.getState().getNestedState(e, [])
  );
}
function be(e) {
  return le(Ke, { proxy: e });
}
function Qe({
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
function Ke({
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
      } catch (G) {
        console.error("Error evaluating effect function during mount:", G), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const H = document.createTextNode(String(S));
    g.replaceWith(H);
  }, [e._stateKey, e._path.join("."), e._effect]), le("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function mt(e) {
  const i = Ge(
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
  return le("text", {}, String(i));
}
function et({
  stateKey: e,
  itemComponentId: i,
  itemPath: m,
  children: g
}) {
  const [, T] = Q({}), [C, p] = Be(), v = Z(null);
  return oe(() => {
    p.height > 0 && p.height !== v.current && (v.current = p.height, r.getState().setShadowMetadata(e, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, e, m]), ce(() => {
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
  }, [e, i, m.join(".")]), /* @__PURE__ */ ye("div", { ref: C, children: g });
}
export {
  be as $cogsSignal,
  mt as $cogsSignalStore,
  gt as addStateOptions,
  ft as createCogsState,
  St as notifyComponent,
  Xe as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
