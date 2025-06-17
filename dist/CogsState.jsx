"use client";
import { jsx as pe } from "react/jsx-runtime";
import { useState as Q, useRef as Y, useEffect as oe, useLayoutEffect as le, useMemo as Ee, createElement as de, useSyncExternalStore as Le, startTransition as Re, useCallback as Ne } from "react";
import { transformStateFunc as De, isDeepEqual as q, isFunction as K, getNestedValue as Z, getDifferences as we, debounce as Ue } from "./utility.js";
import { pushFunc as ye, updateFn as ce, cutFunc as Se, ValidationWrapper as je, FormControlComponent as He } from "./Functions.jsx";
import Fe from "superjson";
import { v4 as _e } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as Ce } from "./store.js";
import { useCogsConfig as Me } from "./CogsStateClient.jsx";
import { applyPatch as Be } from "fast-json-patch";
import We from "react-use-measure";
function $e(e, i) {
  const m = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, T = m(e) || {};
  g(e, {
    ...T,
    ...i
  });
}
function ke({
  stateKey: e,
  options: i,
  initialOptionsPart: m
}) {
  const g = re(e) || {}, T = m[e] || {}, N = r.getState().setInitialStateOptions, p = { ...T, ...g };
  let v = !1;
  if (i)
    for (const a in i)
      p.hasOwnProperty(a) ? (a == "localStorage" && i[a] && p[a].key !== i[a]?.key && (v = !0, p[a] = i[a]), a == "initialState" && i[a] && p[a] !== i[a] && // Different references
      !q(p[a], i[a]) && (v = !0, p[a] = i[a])) : (v = !0, p[a] = i[a]);
  v && N(e, p);
}
function ft(e, { formElements: i, validation: m }) {
  return { initialState: e, formElements: i, validation: m };
}
const St = (e, i) => {
  let m = e;
  const [g, T] = De(m);
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
    const [h] = Q(a?.componentId ?? _e());
    ke({
      stateKey: v,
      options: a,
      initialOptionsPart: T
    });
    const n = r.getState().cogsStateStore[v] || g[v], S = a?.modifyState ? a.modifyState(n) : n, [H, R] = Qe(
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
    return R;
  };
  function p(v, a) {
    ke({ stateKey: v, options: a, initialOptionsPart: T }), a.localStorage && Ze(v, a), Te(v);
  }
  return { useCogsState: N, setCogsOptions: p };
}, {
  setUpdaterState: me,
  setState: ne,
  getInitialOptions: re,
  getKeyState: Pe,
  getValidationErrors: ze,
  setStateLog: qe,
  updateInitialStateGlobal: Oe,
  addValidationError: Je,
  removeValidationError: X,
  setServerSyncActions: Ye
} = r.getState(), be = (e, i, m, g, T) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    g
  );
  const N = K(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (N && g) {
    const p = `${g}-${i}-${N}`;
    let v;
    try {
      v = he(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: T ?? v
    }, h = Fe.serialize(a);
    window.localStorage.setItem(
      p,
      JSON.stringify(h.json)
    );
  }
}, he = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Ze = (e, i) => {
  const m = r.getState().cogsStateStore[e], { sessionId: g } = Me(), T = K(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (T && g) {
    const N = he(
      `${g}-${e}-${T}`
    );
    if (N && N.lastUpdated > (N.lastSyncedWithServer || 0))
      return ne(e, N.state), Te(e), !0;
  }
  return !1;
}, Ve = (e, i, m, g, T, N) => {
  const p = {
    initialState: i,
    updaterState: Ie(
      e,
      g,
      T,
      N
    ),
    state: m
  };
  Oe(e, p.initialState), me(e, p.updaterState), ne(e, p.state);
}, Te = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, mt = (e, i) => {
  const m = r.getState().stateComponents.get(e);
  if (m) {
    const g = `${e}////${i}`, T = m.components.get(g);
    if ((T ? Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"] : null)?.includes("none"))
      return;
    T && T.forceUpdate();
  }
}, Xe = (e, i, m, g) => {
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
function Qe(e, {
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
  const [H, R] = Q({}), { sessionId: D } = Me();
  let F = !i;
  const [I] = Q(i ?? _e()), l = r.getState().stateLog[I], ue = Y(/* @__PURE__ */ new Set()), ee = Y(v ?? _e()), G = Y(
    null
  );
  G.current = re(I) ?? null, oe(() => {
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
      $e(I, {
        initialState: a
      });
      const t = G.current, s = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = r.getState().initialStateGlobal[I];
      if (!(c && !q(c, a) || !c) && !s)
        return;
      let u = null;
      const E = K(t?.localStorage?.key) ? t?.localStorage?.key(a) : t?.localStorage?.key;
      E && D && (u = he(`${D}-${I}-${E}`));
      let y = a, w = !1;
      const $ = s ? Date.now() : 0, O = u?.lastUpdated || 0, x = u?.lastSyncedWithServer || 0;
      s && $ > O ? (y = t.serverState.data, w = !0) : u && O > x && (y = u.state, t?.localStorage?.onChange && t?.localStorage?.onChange(y)), r.getState().initializeShadowState(I, a), Ve(
        I,
        a,
        y,
        ae,
        ee.current,
        D
      ), w && E && D && be(y, I, t, D, Date.now()), Te(I), (Array.isArray(p) ? p : [p || "component"]).includes("none") || R({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), le(() => {
    F && $e(I, {
      serverSync: m,
      formElements: T,
      initialState: a,
      localStorage: g,
      middleware: G.current?.middleware
    });
    const t = `${I}////${ee.current}`, o = r.getState().stateComponents.get(I) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(t, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: N || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), r.getState().stateComponents.set(I, o), R({}), () => {
      o && (o.components.delete(t), o.components.size === 0 && r.getState().stateComponents.delete(I));
    };
  }, []);
  const ae = (t, o, s, c) => {
    if (Array.isArray(o)) {
      const u = `${I}-${o.join(".")}`;
      ue.current.add(u);
    }
    const f = r.getState();
    ne(I, (u) => {
      const E = K(t) ? t(u) : t, y = `${I}-${o.join(".")}`;
      if (y) {
        let V = !1, C = f.signalDomElements.get(y);
        if ((!C || C.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const M = o.slice(0, -1), A = Z(E, M);
          if (Array.isArray(A)) {
            V = !0;
            const _ = `${I}-${M.join(".")}`;
            C = f.signalDomElements.get(_);
          }
        }
        if (C) {
          const M = V ? Z(E, o.slice(0, -1)) : Z(E, o);
          C.forEach(({ parentId: A, position: _, effect: b }) => {
            const L = document.querySelector(
              `[data-parent-id="${A}"]`
            );
            if (L) {
              const W = Array.from(L.childNodes);
              if (W[_]) {
                const j = b ? new Function("state", `return (${b})(state)`)(M) : M;
                W[_].textContent = String(j);
              }
            }
          });
        }
      }
      console.log("shadowState", f.shadowStateStore), s.updateType === "update" && (c || G.current?.validation?.key) && o && X(
        (c || G.current?.validation?.key) + "." + o.join(".")
      );
      const w = o.slice(0, o.length - 1);
      s.updateType === "cut" && G.current?.validation?.key && X(
        G.current?.validation?.key + "." + w.join(".")
      ), s.updateType === "insert" && G.current?.validation?.key && ze(
        G.current?.validation?.key + "." + w.join(".")
      ).filter(([C, M]) => {
        let A = C?.split(".").length;
        if (C == w.join(".") && A == w.length - 1) {
          let _ = C + "." + w;
          X(C), Je(_, M);
        }
      });
      const $ = f.stateComponents.get(I);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", $), $) {
        const V = we(u, E), C = new Set(V), M = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          A,
          _
        ] of $.components.entries()) {
          let b = !1;
          const L = Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"];
          if (console.log("component", _), !L.includes("none")) {
            if (L.includes("all")) {
              _.forceUpdate();
              continue;
            }
            if (L.includes("component") && ((_.paths.has(M) || _.paths.has("")) && (b = !0), !b))
              for (const W of C) {
                let j = W;
                for (; ; ) {
                  if (_.paths.has(j)) {
                    b = !0;
                    break;
                  }
                  const se = j.lastIndexOf(".");
                  if (se !== -1) {
                    const k = j.substring(
                      0,
                      se
                    );
                    if (!isNaN(
                      Number(j.substring(se + 1))
                    ) && _.paths.has(k)) {
                      b = !0;
                      break;
                    }
                    j = k;
                  } else
                    j = "";
                  if (j === "")
                    break;
                }
                if (b) break;
              }
            if (!b && L.includes("deps") && _.depsFunction) {
              const W = _.depsFunction(E);
              let j = !1;
              typeof W == "boolean" ? W && (j = !0) : q(_.deps, W) || (_.deps = W, j = !0), j && (b = !0);
            }
            b && _.forceUpdate();
          }
        }
      }
      const O = Date.now();
      o = o.map((V, C) => {
        const M = o.slice(0, -1), A = Z(E, M);
        return C === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (A.length - 1).toString() : V;
      });
      const { oldValue: x, newValue: U } = Xe(
        s.updateType,
        u,
        E,
        o
      ), J = {
        timeStamp: O,
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
          const V = o.slice(0, -1);
          f.insertShadowArrayElement(I, V, U);
          break;
        case "cut":
          const C = o.slice(0, -1), M = parseInt(o[o.length - 1]);
          f.removeShadowArrayElement(I, C, M);
          break;
      }
      if (qe(I, (V) => {
        const M = [...V ?? [], J].reduce((A, _) => {
          const b = `${_.stateKey}:${JSON.stringify(_.path)}`, L = A.get(b);
          return L ? (L.timeStamp = Math.max(L.timeStamp, _.timeStamp), L.newValue = _.newValue, L.oldValue = L.oldValue ?? _.oldValue, L.updateType = _.updateType) : A.set(b, { ..._ }), A;
        }, /* @__PURE__ */ new Map());
        return Array.from(M.values());
      }), be(
        E,
        I,
        G.current,
        D
      ), G.current?.middleware && G.current.middleware({
        updateLog: l,
        update: J
      }), G.current?.serverSync) {
        const V = f.serverState[I], C = G.current?.serverSync;
        Ye(I, {
          syncKey: typeof C.syncKey == "string" ? C.syncKey : C.syncKey({ state: E }),
          rollBackState: V,
          actionTimeStamp: Date.now() + (C.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  r.getState().updaterState[I] || (me(
    I,
    Ie(
      I,
      ae,
      ee.current,
      D
    )
  ), r.getState().cogsStateStore[I] || ne(I, e), r.getState().initialStateGlobal[I] || Oe(I, e));
  const d = Ee(() => Ie(
    I,
    ae,
    ee.current,
    D
  ), [I, D]);
  return [Pe(I), d];
}
function Ie(e, i, m, g) {
  const T = /* @__PURE__ */ new Map();
  let N = 0;
  const p = (h) => {
    const n = h.join(".");
    for (const [S] of T)
      (S === n || S.startsWith(n + ".")) && T.delete(S);
    N++;
  }, v = {
    removeValidation: (h) => {
      h?.validationKey && X(h.validationKey);
    },
    revertToInitialState: (h) => {
      const n = r.getState().getInitialOptions(e)?.validation;
      n?.key && X(n?.key), h?.validationKey && X(h.validationKey);
      const S = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), T.clear(), N++;
      const H = a(S, []), R = re(e), D = K(R?.localStorage?.key) ? R?.localStorage?.key(S) : R?.localStorage?.key, F = `${g}-${e}-${D}`;
      F && localStorage.removeItem(F), me(e, H), ne(e, S);
      const I = r.getState().stateComponents.get(e);
      return I && I.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (h) => {
      T.clear(), N++;
      const n = Ie(
        e,
        i,
        m,
        g
      ), S = r.getState().initialStateGlobal[e], H = re(e), R = K(H?.localStorage?.key) ? H?.localStorage?.key(S) : H?.localStorage?.key, D = `${g}-${e}-${R}`;
      return localStorage.getItem(D) && localStorage.removeItem(D), Re(() => {
        Oe(e, h), r.getState().initializeShadowState(e, h), me(e, n), ne(e, h);
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
      return !!(h && q(h, Pe(e)));
    }
  };
  function a(h, n = [], S) {
    const H = n.map(String).join(".");
    T.get(H);
    const R = function() {
      return r().getNestedState(e, n);
    };
    Object.keys(v).forEach((I) => {
      R[I] = v[I];
    });
    const D = {
      apply(I, l, ue) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, n);
      },
      get(I, l) {
        S?.validIndices && !Array.isArray(h) && (S = { ...S, validIndices: void 0 });
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
          return () => we(
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
          const d = r.getState().getNestedState(e, n), t = r.getState().initialStateGlobal[e], o = Z(t, n);
          return q(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              e,
              n
            ), t = r.getState().initialStateGlobal[e], o = Z(t, n);
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
              } = t, u = Y(!1), E = Y(null), [y, w] = Q({
                startIndex: 0,
                endIndex: 10
              }), [$, O] = Q("IDLE_AT_TOP"), x = Y(!1), U = Y(0), J = Y(f), [V, C] = Q(0);
              oe(() => r.getState().subscribeToShadowState(e, () => {
                C((P) => P + 1);
              }), [e]);
              const M = r().getNestedState(
                e,
                n
              ), A = M.length, { totalHeight: _, positions: b } = Ee(() => {
                const k = r.getState().getShadowMetadata(e, n) || [];
                let P = 0;
                const z = [];
                for (let B = 0; B < A; B++) {
                  z[B] = P;
                  const te = k[B]?.virtualizer?.itemHeight;
                  P += te || o;
                }
                return { totalHeight: P, positions: z };
              }, [
                A,
                e,
                n.join("."),
                o,
                V
              ]), L = Ee(() => {
                const k = Math.max(0, y.startIndex), P = Math.min(A, y.endIndex), z = Array.from(
                  { length: P - k },
                  (te, ie) => k + ie
                ), B = z.map((te) => M[te]);
                return a(B, n, {
                  ...S,
                  validIndices: z
                });
              }, [y.startIndex, y.endIndex, M, A]);
              le(() => {
                const k = !q(
                  f,
                  J.current
                ), P = A > U.current;
                if (k) {
                  console.log("TRANSITION: Deps changed -> IDLE_AT_TOP"), O("IDLE_AT_TOP");
                  return;
                }
                P && $ === "LOCKED_AT_BOTTOM" && c && (console.log(
                  "TRANSITION: New items arrived while locked -> GETTING_HEIGHTS"
                ), O("GETTING_HEIGHTS")), U.current = A, J.current = f;
              }, [A, ...f]), le(() => {
                const k = E.current;
                if (!k) return;
                let P;
                if ($ === "IDLE_AT_TOP" && c && A > 0)
                  console.log(
                    "ACTION (IDLE_AT_TOP): Data has arrived -> GETTING_HEIGHTS"
                  ), O("GETTING_HEIGHTS");
                else if ($ === "GETTING_HEIGHTS")
                  console.log(
                    "ACTION (GETTING_HEIGHTS): Setting range to end and starting loop."
                  ), w({
                    startIndex: Math.max(0, A - 10 - s),
                    endIndex: A
                  }), P = setInterval(() => {
                    const z = A - 1;
                    ((r.getState().getShadowMetadata(e, n) || [])[z]?.virtualizer?.itemHeight || 0) > 0 && (clearInterval(P), u.current || (console.log(
                      "ACTION (GETTING_HEIGHTS): Measurement success -> SCROLLING_TO_BOTTOM"
                    ), O("SCROLLING_TO_BOTTOM")));
                  }, 100);
                else if ($ === "SCROLLING_TO_BOTTOM") {
                  console.log(
                    "ACTION (SCROLLING_TO_BOTTOM): Executing scroll."
                  ), x.current = !0;
                  const z = U.current === 0 ? "auto" : "smooth";
                  k.scrollTo({
                    top: k.scrollHeight,
                    behavior: z
                  });
                  const B = setTimeout(
                    () => {
                      console.log(
                        "ACTION (SCROLLING_TO_BOTTOM): Scroll finished -> LOCKED_AT_BOTTOM"
                      ), x.current = !1, u.current = !1, O("LOCKED_AT_BOTTOM");
                    },
                    z === "smooth" ? 500 : 50
                  );
                  return () => clearTimeout(B);
                }
                return () => {
                  P && clearInterval(P);
                };
              }, [$, A, b]), oe(() => {
                const k = E.current;
                if (!k) return;
                const P = () => {
                  if (x.current)
                    return;
                  k.scrollHeight - k.scrollTop - k.clientHeight < 1 ? u.current = !1 : (console.log(
                    "USER ACTION: Scrolled up -> IDLE_NOT_AT_BOTTOM"
                  ), u.current = !0, O("IDLE_NOT_AT_BOTTOM"));
                  const { scrollTop: B, clientHeight: te } = k;
                  let ie = 0, ge = A - 1;
                  for (; ie <= ge; ) {
                    const ve = Math.floor((ie + ge) / 2);
                    b[ve] < B ? ie = ve + 1 : ge = ve - 1;
                  }
                  const Ae = Math.max(0, ge - s);
                  let fe = Ae;
                  const Ge = B + te;
                  for (; fe < A && b[fe] < Ge; )
                    fe++;
                  w({
                    startIndex: Ae,
                    endIndex: Math.min(A, fe + s)
                  });
                };
                return k.addEventListener("scroll", P, {
                  passive: !0
                }), () => k.removeEventListener("scroll", P);
              }, [A, b, $]);
              const W = Ne(() => {
                console.log(
                  "USER ACTION: Clicked scroll button -> SCROLLING_TO_BOTTOM"
                ), O("SCROLLING_TO_BOTTOM");
              }, []), j = Ne(
                (k, P = "smooth") => {
                  E.current && b[k] !== void 0 && (O("IDLE_NOT_AT_BOTTOM"), E.current.scrollTo({
                    top: b[k],
                    behavior: P
                  }));
                },
                [b]
              ), se = {
                outer: {
                  ref: E,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${_}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${b[y.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: L,
                virtualizerProps: se,
                scrollToBottom: W,
                scrollToIndex: j
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
                    const [, $] = Q({}), O = `${m}-${n.join(".")}-${c}`;
                    le(() => {
                      const x = `${e}////${O}`, U = r.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return U.components.set(x, {
                        forceUpdate: () => $({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), r.getState().stateComponents.set(e, U), () => {
                        const J = r.getState().stateComponents.get(e);
                        J && J.components.delete(x);
                      };
                    }, [e, O]);
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
            return (t) => de(Ke, {
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
                const u = o[c], E = [...n, c.toString()], y = a(u, E, S), w = `${m}-${n.join(".")}-${c}`;
                return de(tt, {
                  key: c,
                  stateKey: e,
                  itemComponentId: w,
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
            return (t) => (p(n), ye(i, t, n, e), a(
              r.getState().getNestedState(e, n),
              n
            ));
          if (l === "uniqueInsert")
            return (t, o, s) => {
              const c = r.getState().getNestedState(e, n), f = K(t) ? t(c) : t;
              let u = null;
              if (!c.some((y) => {
                if (o) {
                  const $ = o.every(
                    (O) => q(y[O], f[O])
                  );
                  return $ && (u = y), $;
                }
                const w = q(y, f);
                return w && (u = y), w;
              }))
                p(n), ye(i, f, n, e);
              else if (s && u) {
                const y = s(u), w = c.map(
                  ($) => q($, u) ? y : $
                );
                p(n), ce(i, w, n);
              }
            };
          if (l === "cut")
            return (t, o) => {
              if (!o?.waitForSync)
                return p(n), Se(i, n, e, t), a(
                  r.getState().getNestedState(e, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (t) => {
              for (let o = 0; o < h.length; o++)
                h[o] === t && Se(i, n, e, o);
            };
          if (l === "toggleByValue")
            return (t) => {
              const o = h.findIndex((s) => s === t);
              o > -1 ? Se(i, n, e, o) : ye(i, t, n, e);
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
            return () => Se(
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
          return (d) => xe({
            _stateKey: e,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => xe({
            _stateKey: e,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${e}:${n.join(".")}`;
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => he(g + "-" + e + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), t = d.join("."), o = r.getState().getNestedState(e, d);
          return Array.isArray(o) ? Number(n[n.length - 1]) === r.getState().getSelectedIndex(e, t) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const t = n.slice(0, -1), o = Number(n[n.length - 1]), s = t.join(".");
            d ? r.getState().setSelectedIndex(e, s, o) : r.getState().setSelectedIndex(e, s, void 0);
            const c = r.getState().getNestedState(e, [...t]);
            ce(i, c, t), p(t);
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
            ce(i, c, d), p(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const t = r.getState().cogsStateStore[e], s = Be(t, d).newDocument;
              Ve(
                e,
                r.getState().initialStateGlobal[e],
                s,
                i,
                m,
                g
              );
              const c = r.getState().stateComponents.get(e);
              if (c) {
                const f = we(t, s), u = new Set(f);
                for (const [
                  E,
                  y
                ] of c.components.entries()) {
                  let w = !1;
                  const $ = Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"];
                  if (!$.includes("none")) {
                    if ($.includes("all")) {
                      y.forceUpdate();
                      continue;
                    }
                    if ($.includes("component") && (y.paths.has("") && (w = !0), !w))
                      for (const O of u) {
                        if (y.paths.has(O)) {
                          w = !0;
                          break;
                        }
                        let x = O.lastIndexOf(".");
                        for (; x !== -1; ) {
                          const U = O.substring(0, x);
                          if (y.paths.has(U)) {
                            w = !0;
                            break;
                          }
                          const J = O.substring(
                            x + 1
                          );
                          if (!isNaN(Number(J))) {
                            const V = U.lastIndexOf(".");
                            if (V !== -1) {
                              const C = U.substring(
                                0,
                                V
                              );
                              if (y.paths.has(C)) {
                                w = !0;
                                break;
                              }
                            }
                          }
                          x = U.lastIndexOf(".");
                        }
                        if (w) break;
                      }
                    if (!w && $.includes("deps") && y.depsFunction) {
                      const O = y.depsFunction(s);
                      let x = !1;
                      typeof O == "boolean" ? O && (x = !0) : q(y.deps, O) || (y.deps = O, x = !0), x && (w = !0);
                    }
                    w && y.forceUpdate();
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
                  const E = u.path, y = u.message, w = [d.key, ...E].join(".");
                  t(w, y);
                }), Te(e), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => r().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => Ce.getState().getFormRefsByStateKey(e);
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
          return () => Ce.getState().getFormRef(e + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: t
          }) => /* @__PURE__ */ pe(
            je,
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
              Ue(() => {
                ce(i, d, n, "");
                const o = r.getState().getNestedState(e, n);
                t?.afterUpdate && t.afterUpdate(o);
              }, t.debounce);
            else {
              ce(i, d, n, "");
              const o = r.getState().getNestedState(e, n);
              t?.afterUpdate && t.afterUpdate(o);
            }
            p(n);
          };
        if (l === "formElement")
          return (d, t) => /* @__PURE__ */ pe(
            He,
            {
              setState: i,
              stateKey: e,
              path: n,
              child: d,
              formOpts: t
            }
          );
        const G = [...n, l], ae = r.getState().getNestedState(e, G);
        return a(ae, G, S);
      }
    }, F = new Proxy(R, D);
    return T.set(H, {
      proxy: F,
      stateVersion: N
    }), F;
  }
  return a(
    r.getState().getNestedState(e, [])
  );
}
function xe(e) {
  return de(et, { proxy: e });
}
function Ke({
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
function et({
  proxy: e
}) {
  const i = Y(null), m = `${e._stateKey}-${e._path.join(".")}`;
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
      } catch (R) {
        console.error("Error evaluating effect function during mount:", R), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const H = document.createTextNode(String(S));
    g.replaceWith(H);
  }, [e._stateKey, e._path.join("."), e._effect]), de("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function It(e) {
  const i = Le(
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
  return de("text", {}, String(i));
}
function tt({
  stateKey: e,
  itemComponentId: i,
  itemPath: m,
  children: g
}) {
  const [, T] = Q({}), [N, p] = We(), v = Y(null);
  return oe(() => {
    p.height > 0 && p.height !== v.current && (v.current = p.height, r.getState().setShadowMetadata(e, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, e, m]), le(() => {
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
  }, [e, i, m.join(".")]), /* @__PURE__ */ pe("div", { ref: N, children: g });
}
export {
  xe as $cogsSignal,
  It as $cogsSignalStore,
  ft as addStateOptions,
  St as createCogsState,
  mt as notifyComponent,
  Qe as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
