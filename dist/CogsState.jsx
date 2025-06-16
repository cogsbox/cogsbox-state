"use client";
import { jsx as ve } from "react/jsx-runtime";
import { useState as K, useRef as X, useEffect as ae, useLayoutEffect as ce, useMemo as ye, createElement as le, useSyncExternalStore as Ve, startTransition as Ge, useCallback as Oe } from "react";
import { transformStateFunc as Le, isDeepEqual as q, isFunction as ee, getNestedValue as J, getDifferences as pe, debounce as Re } from "./utility.js";
import { pushFunc as Te, updateFn as ie, cutFunc as fe, ValidationWrapper as De, FormControlComponent as Ue } from "./Functions.jsx";
import je from "superjson";
import { v4 as Ee } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as Ae } from "./store.js";
import { useCogsConfig as be } from "./CogsStateClient.jsx";
import { applyPatch as He } from "fast-json-patch";
import Fe from "react-use-measure";
function Ne(e, i) {
  const m = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, T = m(e) || {};
  g(e, {
    ...T,
    ...i
  });
}
function Ce({
  stateKey: e,
  options: i,
  initialOptionsPart: m
}) {
  const g = oe(e) || {}, T = m[e] || {}, C = r.getState().setInitialStateOptions, p = { ...T, ...g };
  let v = !1;
  if (i)
    for (const a in i)
      p.hasOwnProperty(a) ? (a == "localStorage" && i[a] && p[a].key !== i[a]?.key && (v = !0, p[a] = i[a]), a == "initialState" && i[a] && p[a] !== i[a] && // Different references
      !q(p[a], i[a]) && (v = !0, p[a] = i[a])) : (v = !0, p[a] = i[a]);
  v && C(e, p);
}
function ut(e, { formElements: i, validation: m }) {
  return { initialState: e, formElements: i, validation: m };
}
const gt = (e, i) => {
  let m = e;
  const [g, T] = Le(m);
  (Object.keys(T).length > 0 || i && Object.keys(i).length > 0) && Object.keys(T).forEach((v) => {
    T[v] = T[v] || {}, T[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...T[v].formElements || {}
      // State-specific overrides
    }, oe(v) || r.getState().setInitialStateOptions(v, T[v]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const C = (v, a) => {
    const [h] = K(a?.componentId ?? Ee());
    Ce({
      stateKey: v,
      options: a,
      initialOptionsPart: T
    });
    const n = r.getState().cogsStateStore[v] || g[v], S = a?.modifyState ? a.modifyState(n) : n, [F, G] = Ze(
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
    Ce({ stateKey: v, options: a, initialOptionsPart: T }), a.localStorage && Je(v, a), he(v);
  }
  return { useCogsState: C, setCogsOptions: p };
}, {
  setUpdaterState: Se,
  setState: ne,
  getInitialOptions: oe,
  getKeyState: Me,
  getValidationErrors: Be,
  setStateLog: We,
  updateInitialStateGlobal: we,
  addValidationError: ze,
  removeValidationError: Q,
  setServerSyncActions: qe
} = r.getState(), $e = (e, i, m, g, T) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    g
  );
  const C = ee(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
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
    }, h = je.serialize(a);
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
}, Je = (e, i) => {
  const m = r.getState().cogsStateStore[e], { sessionId: g } = be(), T = ee(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (T && g) {
    const C = Ie(
      `${g}-${e}-${T}`
    );
    if (C && C.lastUpdated > (C.lastSyncedWithServer || 0))
      return ne(e, C.state), he(e), !0;
  }
  return !1;
}, xe = (e, i, m, g, T, C) => {
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
  we(e, p.initialState), Se(e, p.updaterState), ne(e, p.state);
}, he = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, ft = (e, i) => {
  const m = r.getState().stateComponents.get(e);
  if (m) {
    const g = `${e}////${i}`, T = m.components.get(g);
    if ((T ? Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"] : null)?.includes("none"))
      return;
    T && T.forceUpdate();
  }
}, Ye = (e, i, m, g) => {
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
function Ze(e, {
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
  const [F, G] = K({}), { sessionId: L } = be();
  let B = !i;
  const [I] = K(i ?? Ee()), l = r.getState().stateLog[I], de = X(/* @__PURE__ */ new Set()), te = X(v ?? Ee()), P = X(
    null
  );
  P.current = oe(I) ?? null, ae(() => {
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
  }, [h]), ae(() => {
    if (a) {
      Ne(I, {
        initialState: a
      });
      const t = P.current, s = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = r.getState().initialStateGlobal[I];
      if (!(c && !q(c, a) || !c) && !s)
        return;
      let u = null;
      const E = ee(t?.localStorage?.key) ? t?.localStorage?.key(a) : t?.localStorage?.key;
      E && L && (u = Ie(`${L}-${I}-${E}`));
      let y = a, O = !1;
      const $ = s ? Date.now() : 0, A = u?.lastUpdated || 0, M = u?.lastSyncedWithServer || 0;
      s && $ > A ? (y = t.serverState.data, O = !0) : u && A > M && (y = u.state, t?.localStorage?.onChange && t?.localStorage?.onChange(y)), r.getState().initializeShadowState(I, a), xe(
        I,
        a,
        y,
        se,
        te.current,
        L
      ), O && E && L && $e(y, I, t, L, Date.now()), he(I), (Array.isArray(p) ? p : [p || "component"]).includes("none") || G({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), ce(() => {
    B && Ne(I, {
      serverSync: m,
      formElements: T,
      initialState: a,
      localStorage: g,
      middleware: P.current?.middleware
    });
    const t = `${I}////${te.current}`, o = r.getState().stateComponents.get(I) || {
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
  const se = (t, o, s, c) => {
    if (Array.isArray(o)) {
      const u = `${I}-${o.join(".")}`;
      de.current.add(u);
    }
    const f = r.getState();
    ne(I, (u) => {
      const E = ee(t) ? t(u) : t, y = `${I}-${o.join(".")}`;
      if (y) {
        let x = !1, N = f.signalDomElements.get(y);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const _ = o.slice(0, -1), j = J(E, _);
          if (Array.isArray(j)) {
            x = !0;
            const w = `${I}-${_.join(".")}`;
            N = f.signalDomElements.get(w);
          }
        }
        if (N) {
          const _ = x ? J(E, o.slice(0, -1)) : J(E, o);
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
      console.log("shadowState", f.shadowStateStore), s.updateType === "update" && (c || P.current?.validation?.key) && o && Q(
        (c || P.current?.validation?.key) + "." + o.join(".")
      );
      const O = o.slice(0, o.length - 1);
      s.updateType === "cut" && P.current?.validation?.key && Q(
        P.current?.validation?.key + "." + O.join(".")
      ), s.updateType === "insert" && P.current?.validation?.key && Be(
        P.current?.validation?.key + "." + O.join(".")
      ).filter(([N, _]) => {
        let j = N?.split(".").length;
        if (N == O.join(".") && j == O.length - 1) {
          let w = N + "." + O;
          Q(N), ze(w, _);
        }
      });
      const $ = f.stateComponents.get(I);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", $), $) {
        const x = pe(u, E), N = new Set(x), _ = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          j,
          w
        ] of $.components.entries()) {
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
                  const k = D.lastIndexOf(".");
                  if (k !== -1) {
                    const b = D.substring(
                      0,
                      k
                    );
                    if (!isNaN(
                      Number(D.substring(k + 1))
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
      o = o.map((x, N) => {
        const _ = o.slice(0, -1), j = J(E, _);
        return N === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (j.length - 1).toString() : x;
      });
      const { oldValue: M, newValue: U } = Ye(
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
        oldValue: M,
        newValue: U
      };
      switch (s.updateType) {
        case "update":
          f.updateShadowAtPath(I, o, E);
          break;
        case "insert":
          const x = o.slice(0, -1);
          f.insertShadowArrayElement(I, x, U);
          break;
        case "cut":
          const N = o.slice(0, -1), _ = parseInt(o[o.length - 1]);
          f.removeShadowArrayElement(I, N, _);
          break;
      }
      if (We(I, (x) => {
        const _ = [...x ?? [], Y].reduce((j, w) => {
          const R = `${w.stateKey}:${JSON.stringify(w.path)}`, V = j.get(R);
          return V ? (V.timeStamp = Math.max(V.timeStamp, w.timeStamp), V.newValue = w.newValue, V.oldValue = V.oldValue ?? w.oldValue, V.updateType = w.updateType) : j.set(R, { ...w }), j;
        }, /* @__PURE__ */ new Map());
        return Array.from(_.values());
      }), $e(
        E,
        I,
        P.current,
        L
      ), P.current?.middleware && P.current.middleware({
        updateLog: l,
        update: Y
      }), P.current?.serverSync) {
        const x = f.serverState[I], N = P.current?.serverSync;
        qe(I, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: E }),
          rollBackState: x,
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
      se,
      te.current,
      L
    )
  ), r.getState().cogsStateStore[I] || ne(I, e), r.getState().initialStateGlobal[I] || we(I, e));
  const d = ye(() => me(
    I,
    se,
    te.current,
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
      h?.validationKey && Q(h.validationKey);
    },
    revertToInitialState: (h) => {
      const n = r.getState().getInitialOptions(e)?.validation;
      n?.key && Q(n?.key), h?.validationKey && Q(h.validationKey);
      const S = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), T.clear(), C++;
      const F = a(S, []), G = oe(e), L = ee(G?.localStorage?.key) ? G?.localStorage?.key(S) : G?.localStorage?.key, B = `${g}-${e}-${L}`;
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
      ), S = r.getState().initialStateGlobal[e], F = oe(e), G = ee(F?.localStorage?.key) ? F?.localStorage?.key(S) : F?.localStorage?.key, L = `${g}-${e}-${G}`;
      return localStorage.getItem(L) && localStorage.removeItem(L), Ge(() => {
        we(e, h), r.getState().initializeShadowState(e, h), Se(e, n), ne(e, h);
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
      return !!(h && q(h, Me(e)));
    }
  };
  function a(h, n = [], S) {
    const F = n.map(String).join(".");
    T.get(F);
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
          return () => pe(
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
            const d = r.getState().initialStateGlobal[e], t = oe(e), o = ee(t?.localStorage?.key) ? t?.localStorage?.key(d) : t?.localStorage?.key, s = `${g}-${e}-${o}`;
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
              } = t, u = X(!1), E = X(null), [y, O] = K({
                startIndex: 0,
                endIndex: 10
              }), [$, A] = K("IDLE_AT_TOP"), M = X(0), U = X(f), [Y, x] = K(0);
              ae(() => r.getState().subscribeToShadowState(e, () => {
                x((b) => b + 1);
              }), [e]);
              const N = r().getNestedState(
                e,
                n
              ), _ = N.length, { totalHeight: j, positions: w } = ye(() => {
                const k = r.getState().getShadowMetadata(e, n) || [];
                let b = 0;
                const H = [];
                for (let z = 0; z < _; z++) {
                  H[z] = b;
                  const Z = k[z]?.virtualizer?.itemHeight;
                  b += Z || o;
                }
                return { totalHeight: b, positions: H };
              }, [
                _,
                e,
                n.join("."),
                o,
                Y
              ]), R = ye(() => {
                const k = Math.max(0, y.startIndex), b = Math.min(_, y.endIndex), H = Array.from(
                  { length: b - k },
                  (Z, re) => k + re
                ), z = H.map((Z) => N[Z]);
                return a(z, n, {
                  ...S,
                  validIndices: H
                });
              }, [y.startIndex, y.endIndex, N, _]);
              ce(() => {
                const k = !q(
                  f,
                  U.current
                ), b = _ > M.current;
                if (k) {
                  console.log("TRANSITION: Deps changed -> IDLE_AT_TOP"), A("IDLE_AT_TOP");
                  return;
                }
                b && $ === "LOCKED_AT_BOTTOM" && c && (console.log(
                  "TRANSITION: New items arrived while locked -> GETTING_HEIGHTS"
                ), A("GETTING_HEIGHTS")), M.current = _, U.current = f;
              }, [_, ...f]), ce(() => {
                const k = E.current;
                if (!k) return;
                let b;
                if ($ === "IDLE_AT_TOP" && c && _ > 0)
                  console.log(
                    "ACTION (IDLE_AT_TOP): Data has arrived -> GETTING_HEIGHTS"
                  ), A("GETTING_HEIGHTS");
                else if ($ === "GETTING_HEIGHTS")
                  console.log(
                    "ACTION (GETTING_HEIGHTS): Setting range to end and starting loop."
                  ), O({
                    startIndex: Math.max(0, _ - 10 - s),
                    endIndex: _
                  }), b = setInterval(() => {
                    const H = _ - 1;
                    ((r.getState().getShadowMetadata(e, n) || [])[H]?.virtualizer?.itemHeight || 0) > 0 && (clearInterval(b), console.log(
                      "ACTION (GETTING_HEIGHTS): Measurement success -> SCROLLING_TO_BOTTOM"
                    ), A("SCROLLING_TO_BOTTOM"));
                  }, 100);
                else if ($ === "SCROLLING_TO_BOTTOM" && !u.current) {
                  console.log(
                    "ACTION (SCROLLING_TO_BOTTOM): Executing scroll."
                  );
                  const H = M.current === 0 ? "auto" : "smooth";
                  k.scrollTo({
                    top: k.scrollHeight,
                    behavior: H
                  });
                  const z = setTimeout(
                    () => {
                      console.log(
                        "ACTION (SCROLLING_TO_BOTTOM): Scroll finished -> LOCKED_AT_BOTTOM"
                      ), u.current = !1, A("LOCKED_AT_BOTTOM");
                    },
                    H === "smooth" ? 500 : 50
                  );
                  return () => clearTimeout(z);
                }
                return () => {
                  b && clearInterval(b);
                };
              }, [$, _, w]), ae(() => {
                const k = E.current;
                if (!k) return;
                const b = () => {
                  $ !== "IDLE_NOT_AT_BOTTOM" && (k.scrollHeight - k.scrollTop - k.clientHeight < 1 || (console.log(
                    "USER ACTION: Scrolled up -> IDLE_NOT_AT_BOTTOM"
                  ), u.current = !0, A("IDLE_NOT_AT_BOTTOM")));
                  const { scrollTop: H, clientHeight: z } = k;
                  let Z = 0, re = _ - 1;
                  for (; Z <= re; ) {
                    const ge = Math.floor((Z + re) / 2);
                    w[ge] < H ? Z = ge + 1 : re = ge - 1;
                  }
                  const _e = Math.max(0, re - s);
                  let ue = _e;
                  const Pe = H + z;
                  for (; ue < _ && w[ue] < Pe; )
                    ue++;
                  O({
                    startIndex: _e,
                    endIndex: Math.min(_, ue + s)
                  });
                };
                return k.addEventListener("scroll", b, {
                  passive: !0
                }), () => k.removeEventListener("scroll", b);
              }, [_, w, $]);
              const V = Oe(() => {
                console.log(
                  "USER ACTION: Clicked scroll button -> SCROLLING_TO_BOTTOM"
                ), A("SCROLLING_TO_BOTTOM");
              }, []), W = Oe(
                (k, b = "smooth") => {
                  E.current && w[k] !== void 0 && (A("IDLE_NOT_AT_BOTTOM"), E.current.scrollTo({
                    top: w[k],
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
                    const [, $] = K({}), A = `${m}-${n.join(".")}-${c}`;
                    ce(() => {
                      const M = `${e}////${A}`, U = r.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return U.components.set(M, {
                        forceUpdate: () => $({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), r.getState().stateComponents.set(e, U), () => {
                        const Y = r.getState().stateComponents.get(e);
                        Y && Y.components.delete(M);
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
            return (t) => le(Xe, {
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
                return le(Ke, {
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
            return (t) => (p(n), Te(i, t, n, e), a(
              r.getState().getNestedState(e, n),
              n
            ));
          if (l === "uniqueInsert")
            return (t, o, s) => {
              const c = r.getState().getNestedState(e, n), f = ee(t) ? t(c) : t;
              let u = null;
              if (!c.some((y) => {
                if (o) {
                  const $ = o.every(
                    (A) => q(y[A], f[A])
                  );
                  return $ && (u = y), $;
                }
                const O = q(y, f);
                return O && (u = y), O;
              }))
                p(n), Te(i, f, n, e);
              else if (s && u) {
                const y = s(u), O = c.map(
                  ($) => q($, u) ? y : $
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
              o > -1 ? fe(i, n, e, o) : Te(i, t, n, e);
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
        const te = n[n.length - 1];
        if (!isNaN(Number(te))) {
          const d = n.slice(0, -1), t = r.getState().getNestedState(e, d);
          if (Array.isArray(t) && l === "cut")
            return () => fe(
              i,
              d,
              e,
              Number(te)
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
          return (d) => ke({
            _stateKey: e,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => ke({
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
              const t = r.getState().cogsStateStore[e], s = He(t, d).newDocument;
              xe(
                e,
                r.getState().initialStateGlobal[e],
                s,
                i,
                m,
                g
              );
              const c = r.getState().stateComponents.get(e);
              if (c) {
                const f = pe(t, s), u = new Set(f);
                for (const [
                  E,
                  y
                ] of c.components.entries()) {
                  let O = !1;
                  const $ = Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"];
                  if (!$.includes("none")) {
                    if ($.includes("all")) {
                      y.forceUpdate();
                      continue;
                    }
                    if ($.includes("component") && (y.paths.has("") && (O = !0), !O))
                      for (const A of u) {
                        if (y.paths.has(A)) {
                          O = !0;
                          break;
                        }
                        let M = A.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const U = A.substring(0, M);
                          if (y.paths.has(U)) {
                            O = !0;
                            break;
                          }
                          const Y = A.substring(
                            M + 1
                          );
                          if (!isNaN(Number(Y))) {
                            const x = U.lastIndexOf(".");
                            if (x !== -1) {
                              const N = U.substring(
                                0,
                                x
                              );
                              if (y.paths.has(N)) {
                                O = !0;
                                break;
                              }
                            }
                          }
                          M = U.lastIndexOf(".");
                        }
                        if (O) break;
                      }
                    if (!O && $.includes("deps") && y.depsFunction) {
                      const A = y.depsFunction(s);
                      let M = !1;
                      typeof A == "boolean" ? A && (M = !0) : q(y.deps, A) || (y.deps = A, M = !0), M && (O = !0);
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
              Q(d.key);
              const o = r.getState().cogsStateStore[e];
              try {
                const s = r.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([f]) => {
                  f && f.startsWith(d.key) && Q(f);
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
            return () => Ae.getState().getFormRefsByStateKey(e);
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
          return () => Ae.getState().getFormRef(e + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: t
          }) => /* @__PURE__ */ ve(
            De,
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
              Re(() => {
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
          return (d, t) => /* @__PURE__ */ ve(
            Ue,
            {
              setState: i,
              stateKey: e,
              path: n,
              child: d,
              formOpts: t
            }
          );
        const P = [...n, l], se = r.getState().getNestedState(e, P);
        return a(se, P, S);
      }
    }, B = new Proxy(G, L);
    return T.set(F, {
      proxy: B,
      stateVersion: C
    }), B;
  }
  return a(
    r.getState().getNestedState(e, [])
  );
}
function ke(e) {
  return le(Qe, { proxy: e });
}
function Xe({
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
function Qe({
  proxy: e
}) {
  const i = X(null), m = `${e._stateKey}-${e._path.join(".")}`;
  return ae(() => {
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
    const F = document.createTextNode(String(S));
    g.replaceWith(F);
  }, [e._stateKey, e._path.join("."), e._effect]), le("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function St(e) {
  const i = Ve(
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
function Ke({
  stateKey: e,
  itemComponentId: i,
  itemPath: m,
  children: g
}) {
  const [, T] = K({}), [C, p] = Fe(), v = X(null);
  return ae(() => {
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
  }, [e, i, m.join(".")]), /* @__PURE__ */ ve("div", { ref: C, children: g });
}
export {
  ke as $cogsSignal,
  St as $cogsSignalStore,
  ut as addStateOptions,
  gt as createCogsState,
  ft as notifyComponent,
  Ze as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
