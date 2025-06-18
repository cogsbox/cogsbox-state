"use client";
import { jsx as we } from "react/jsx-runtime";
import { useState as K, useRef as J, useEffect as oe, useLayoutEffect as ce, useMemo as Oe, createElement as le, useSyncExternalStore as De, startTransition as Ue, useCallback as $e } from "react";
import { transformStateFunc as je, isDeepEqual as q, isFunction as ee, getNestedValue as Y, getDifferences as _e, debounce as He } from "./utility.js";
import { pushFunc as Ee, updateFn as ie, cutFunc as me, ValidationWrapper as Fe, FormControlComponent as Be } from "./Functions.jsx";
import We from "superjson";
import { v4 as Ae } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as ke } from "./store.js";
import { useCogsConfig as Pe } from "./CogsStateClient.jsx";
import { applyPatch as ze } from "fast-json-patch";
import qe from "react-use-measure";
function be(e, i) {
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
function It(e, { formElements: i, validation: m }) {
  return { initialState: e, formElements: i, validation: m };
}
const ht = (e, i) => {
  let m = e;
  const [g, T] = je(m);
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
    const [h] = K(a?.componentId ?? Ae());
    xe({
      stateKey: v,
      options: a,
      initialOptionsPart: T
    });
    const n = r.getState().cogsStateStore[v] || g[v], S = a?.modifyState ? a.modifyState(n) : n, [B, R] = et(
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
    xe({ stateKey: v, options: a, initialOptionsPart: T }), a.localStorage && Qe(v, a), ve(v);
  }
  return { useCogsState: C, setCogsOptions: p };
}, {
  setUpdaterState: Ie,
  setState: ne,
  getInitialOptions: re,
  getKeyState: Le,
  getValidationErrors: Je,
  setStateLog: Ye,
  updateInitialStateGlobal: Ne,
  addValidationError: Ze,
  removeValidationError: Q,
  setServerSyncActions: Xe
} = r.getState(), Me = (e, i, m, g, T) => {
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
      v = Te(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: T ?? v
    }, h = We.serialize(a);
    window.localStorage.setItem(
      p,
      JSON.stringify(h.json)
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
  const m = r.getState().cogsStateStore[e], { sessionId: g } = Pe(), T = ee(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (T && g) {
    const C = Te(
      `${g}-${e}-${T}`
    );
    if (C && C.lastUpdated > (C.lastSyncedWithServer || 0))
      return ne(e, C.state), ve(e), !0;
  }
  return !1;
}, Ge = (e, i, m, g, T, C) => {
  const p = {
    initialState: i,
    updaterState: he(
      e,
      g,
      T,
      C
    ),
    state: m
  };
  Ne(e, p.initialState), Ie(e, p.updaterState), ne(e, p.state);
}, ve = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, Tt = (e, i) => {
  const m = r.getState().stateComponents.get(e);
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
        oldValue: Y(i, g),
        newValue: Y(m, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: Y(m, g)
      };
    case "cut":
      return {
        oldValue: Y(i, g),
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
  reactiveDeps: C,
  reactiveType: p,
  componentId: v,
  initialState: a,
  syncUpdate: h,
  dependencies: n,
  serverState: S
} = {}) {
  const [B, R] = K({}), { sessionId: D } = Pe();
  let W = !i;
  const [I] = K(i ?? Ae()), l = r.getState().stateLog[I], de = J(/* @__PURE__ */ new Set()), te = J(v ?? Ae()), L = J(
    null
  );
  L.current = re(I) ?? null, oe(() => {
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
      be(I, {
        initialState: a
      });
      const t = L.current, s = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = r.getState().initialStateGlobal[I];
      if (!(c && !q(c, a) || !c) && !s)
        return;
      let u = null;
      const y = ee(t?.localStorage?.key) ? t?.localStorage?.key(a) : t?.localStorage?.key;
      y && D && (u = Te(`${D}-${I}-${y}`));
      let E = a, w = !1;
      const N = s ? Date.now() : 0, k = u?.lastUpdated || 0, x = u?.lastSyncedWithServer || 0;
      s && N > k ? (E = t.serverState.data, w = !0) : u && k > x && (E = u.state, t?.localStorage?.onChange && t?.localStorage?.onChange(E)), r.getState().initializeShadowState(I, a), Ge(
        I,
        a,
        E,
        ae,
        te.current,
        D
      ), w && y && D && Me(E, I, t, D, Date.now()), ve(I), (Array.isArray(p) ? p : [p || "component"]).includes("none") || R({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), ce(() => {
    W && be(I, {
      serverSync: m,
      formElements: T,
      initialState: a,
      localStorage: g,
      middleware: L.current?.middleware
    });
    const t = `${I}////${te.current}`, o = r.getState().stateComponents.get(I) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(t, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: C || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), r.getState().stateComponents.set(I, o), R({}), () => {
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
      const y = ee(t) ? t(u) : t, E = `${I}-${o.join(".")}`;
      if (E) {
        let P = !1, A = f.signalDomElements.get(E);
        if ((!A || A.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const M = o.slice(0, -1), O = Y(y, M);
          if (Array.isArray(O)) {
            P = !0;
            const _ = `${I}-${M.join(".")}`;
            A = f.signalDomElements.get(_);
          }
        }
        if (A) {
          const M = P ? Y(y, o.slice(0, -1)) : Y(y, o);
          A.forEach(({ parentId: O, position: _, effect: b }) => {
            const G = document.querySelector(
              `[data-parent-id="${O}"]`
            );
            if (G) {
              const z = Array.from(G.childNodes);
              if (z[_]) {
                const U = b ? new Function("state", `return (${b})(state)`)(M) : M;
                z[_].textContent = String(U);
              }
            }
          });
        }
      }
      console.log("shadowState", f.shadowStateStore), s.updateType === "update" && (c || L.current?.validation?.key) && o && Q(
        (c || L.current?.validation?.key) + "." + o.join(".")
      );
      const w = o.slice(0, o.length - 1);
      s.updateType === "cut" && L.current?.validation?.key && Q(
        L.current?.validation?.key + "." + w.join(".")
      ), s.updateType === "insert" && L.current?.validation?.key && Je(
        L.current?.validation?.key + "." + w.join(".")
      ).filter(([A, M]) => {
        let O = A?.split(".").length;
        if (A == w.join(".") && O == w.length - 1) {
          let _ = A + "." + w;
          Q(A), Ze(_, M);
        }
      });
      const N = f.stateComponents.get(I);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", N), N) {
        const P = _e(u, y), A = new Set(P), M = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          O,
          _
        ] of N.components.entries()) {
          let b = !1;
          const G = Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"];
          if (console.log("component", _), !G.includes("none")) {
            if (G.includes("all")) {
              _.forceUpdate();
              continue;
            }
            if (G.includes("component") && ((_.paths.has(M) || _.paths.has("")) && (b = !0), !b))
              for (const z of A) {
                let U = z;
                for (; ; ) {
                  if (_.paths.has(U)) {
                    b = !0;
                    break;
                  }
                  const se = U.lastIndexOf(".");
                  if (se !== -1) {
                    const $ = U.substring(
                      0,
                      se
                    );
                    if (!isNaN(
                      Number(U.substring(se + 1))
                    ) && _.paths.has($)) {
                      b = !0;
                      break;
                    }
                    U = $;
                  } else
                    U = "";
                  if (U === "")
                    break;
                }
                if (b) break;
              }
            if (!b && G.includes("deps") && _.depsFunction) {
              const z = _.depsFunction(y);
              let U = !1;
              typeof z == "boolean" ? z && (U = !0) : q(_.deps, z) || (_.deps = z, U = !0), U && (b = !0);
            }
            b && _.forceUpdate();
          }
        }
      }
      const k = Date.now();
      o = o.map((P, A) => {
        const M = o.slice(0, -1), O = Y(y, M);
        return A === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (O.length - 1).toString() : P;
      });
      const { oldValue: x, newValue: j } = Ke(
        s.updateType,
        u,
        y,
        o
      ), Z = {
        timeStamp: k,
        stateKey: I,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: x,
        newValue: j
      };
      switch (s.updateType) {
        case "update":
          f.updateShadowAtPath(I, o, y);
          break;
        case "insert":
          const P = o.slice(0, -1);
          f.insertShadowArrayElement(I, P, j);
          break;
        case "cut":
          const A = o.slice(0, -1), M = parseInt(o[o.length - 1]);
          f.removeShadowArrayElement(I, A, M);
          break;
      }
      if (Ye(I, (P) => {
        const M = [...P ?? [], Z].reduce((O, _) => {
          const b = `${_.stateKey}:${JSON.stringify(_.path)}`, G = O.get(b);
          return G ? (G.timeStamp = Math.max(G.timeStamp, _.timeStamp), G.newValue = _.newValue, G.oldValue = G.oldValue ?? _.oldValue, G.updateType = _.updateType) : O.set(b, { ..._ }), O;
        }, /* @__PURE__ */ new Map());
        return Array.from(M.values());
      }), Me(
        y,
        I,
        L.current,
        D
      ), L.current?.middleware && L.current.middleware({
        updateLog: l,
        update: Z
      }), L.current?.serverSync) {
        const P = f.serverState[I], A = L.current?.serverSync;
        Xe(I, {
          syncKey: typeof A.syncKey == "string" ? A.syncKey : A.syncKey({ state: y }),
          rollBackState: P,
          actionTimeStamp: Date.now() + (A.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return y;
    });
  };
  r.getState().updaterState[I] || (Ie(
    I,
    he(
      I,
      ae,
      te.current,
      D
    )
  ), r.getState().cogsStateStore[I] || ne(I, e), r.getState().initialStateGlobal[I] || Ne(I, e));
  const d = Oe(() => he(
    I,
    ae,
    te.current,
    D
  ), [I, D]);
  return [Le(I), d];
}
function he(e, i, m, g) {
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
      const B = a(S, []), R = re(e), D = ee(R?.localStorage?.key) ? R?.localStorage?.key(S) : R?.localStorage?.key, W = `${g}-${e}-${D}`;
      W && localStorage.removeItem(W), Ie(e, B), ne(e, S);
      const I = r.getState().stateComponents.get(e);
      return I && I.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (h) => {
      T.clear(), C++;
      const n = he(
        e,
        i,
        m,
        g
      ), S = r.getState().initialStateGlobal[e], B = re(e), R = ee(B?.localStorage?.key) ? B?.localStorage?.key(S) : B?.localStorage?.key, D = `${g}-${e}-${R}`;
      return localStorage.getItem(D) && localStorage.removeItem(D), Ue(() => {
        Ne(e, h), r.getState().initializeShadowState(e, h), Ie(e, n), ne(e, h);
        const W = r.getState().stateComponents.get(e);
        W && W.components.forEach((I) => {
          I.forceUpdate();
        });
      }), {
        fetchId: (W) => n.get()[W]
      };
    },
    _initialState: r.getState().initialStateGlobal[e],
    _serverState: r.getState().serverState[e],
    _isLoading: r.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const h = r.getState().serverState[e];
      return !!(h && q(h, Le(e)));
    }
  };
  function a(h, n = [], S) {
    const B = n.map(String).join(".");
    T.get(B);
    const R = function() {
      return r().getNestedState(e, n);
    };
    Object.keys(v).forEach((I) => {
      R[I] = v[I];
    });
    const D = {
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
          const d = r.getState().getNestedState(e, n), t = r.getState().initialStateGlobal[e], o = Y(t, n);
          return q(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              e,
              n
            ), t = r.getState().initialStateGlobal[e], o = Y(t, n);
            return q(d, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[e], t = re(e), o = ee(t?.localStorage?.key) ? t?.localStorage?.key(d) : t?.localStorage?.key, s = `${g}-${e}-${o}`;
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
              } = t, u = J(null), [y, E] = K({
                startIndex: 0,
                endIndex: 10
              }), [w, N] = K("IDLE_AT_TOP"), k = J(!1), x = J(0), j = J(f), [Z, P] = K(0), A = J(null);
              oe(() => r.getState().subscribeToShadowState(e, () => {
                P((V) => V + 1);
              }), [e]);
              const M = r().getNestedState(
                e,
                n
              ), O = M.length, { totalHeight: _, positions: b } = Oe(() => {
                const $ = r.getState().getShadowMetadata(e, n) || [];
                let V = 0;
                const H = [];
                for (let F = 0; F < O; F++) {
                  H[F] = V;
                  const X = $[F]?.virtualizer?.itemHeight;
                  V += X || o;
                }
                return { totalHeight: V, positions: H };
              }, [
                O,
                e,
                n.join("."),
                o,
                Z
              ]), G = Oe(() => {
                const $ = Math.max(0, y.startIndex), V = Math.min(O, y.endIndex), H = Array.from(
                  { length: V - $ },
                  (X, ue) => $ + ue
                ), F = H.map((X) => M[X]);
                return a(F, n, {
                  ...S,
                  validIndices: H
                });
              }, [y.startIndex, y.endIndex, M, O]);
              ce(() => {
                const $ = u.current;
                if (!$) return;
                const V = O > x.current;
                !q(
                  f,
                  j.current
                ) ? (console.log(
                  "TRANSITION (Hard Reset): Deps changed -> IDLE_AT_TOP"
                ), N("IDLE_AT_TOP"), $.scrollTo({ top: 0 })) : V && w === "LOCKED_AT_BOTTOM" && c ? (console.log(
                  "TRANSITION: New items arrived while locked -> GETTING_HEIGHTS"
                ), N("GETTING_HEIGHTS")) : V && A.current && (console.log(
                  "ACTION: Maintaining scroll position after new items added."
                ), $.scrollTop = A.current.scrollTop + ($.scrollHeight - A.current.scrollHeight)), x.current = O, j.current = f, A.current = null;
              }, [O, ...f]), ce(() => {
                const $ = u.current;
                if (!$) return;
                let V;
                if (w === "IDLE_AT_TOP" && c && O > 0)
                  console.log(
                    "ACTION (IDLE_AT_TOP): Data arrived -> GETTING_HEIGHTS"
                  ), N("GETTING_HEIGHTS");
                else if (w === "GETTING_HEIGHTS")
                  console.log("ACTION (GETTING_HEIGHTS): Setting range to end"), E({
                    startIndex: Math.max(0, O - 10 - s),
                    endIndex: O
                  }), V = setInterval(() => {
                    const H = O - 1;
                    ((r.getState().getShadowMetadata(e, n) || [])[H]?.virtualizer?.itemHeight || 0) > 0 && (clearInterval(V), console.log(
                      "ACTION (GETTING_HEIGHTS): Measurement success -> SCROLLING_TO_BOTTOM"
                    ), N("SCROLLING_TO_BOTTOM"));
                  }, 100);
                else if (w === "SCROLLING_TO_BOTTOM") {
                  console.log(
                    "ACTION (SCROLLING_TO_BOTTOM): Executing scroll."
                  ), k.current = !0;
                  const H = x.current === 0 ? "auto" : "smooth";
                  $.scrollTo({
                    top: $.scrollHeight,
                    behavior: H
                  });
                  const F = setTimeout(
                    () => {
                      k.current = !1, N("LOCKED_AT_BOTTOM");
                    },
                    H === "smooth" ? 500 : 50
                  );
                  return () => clearTimeout(F);
                }
                return () => {
                  V && clearInterval(V);
                };
              }, [w, O, b]), oe(() => {
                const $ = u.current;
                if (!$) return;
                const V = 10, H = () => {
                  if (k.current)
                    return;
                  const { scrollTop: F, clientHeight: X, scrollHeight: ue } = $;
                  A.current = { scrollTop: F, scrollHeight: ue }, ue - F - X < V ? w !== "LOCKED_AT_BOTTOM" && (console.log(
                    "SCROLL EVENT: Reached bottom -> LOCKED_AT_BOTTOM"
                  ), N("LOCKED_AT_BOTTOM")) : w !== "IDLE_NOT_AT_BOTTOM" && (console.log(
                    "SCROLL EVENT: Scrolled up -> IDLE_NOT_AT_BOTTOM"
                  ), N("IDLE_NOT_AT_BOTTOM"));
                  let ye = O - 1, pe = 0, Ce = 0;
                  for (; pe <= ye; ) {
                    const Se = Math.floor((pe + ye) / 2);
                    b[Se] < F ? (Ce = Se, pe = Se + 1) : ye = Se - 1;
                  }
                  const ge = Math.max(
                    0,
                    Ce - s
                  );
                  if (ge === y.startIndex)
                    return;
                  let fe = ge;
                  const Re = F + X;
                  for (; fe < O && b[fe] < Re; )
                    fe++;
                  console.log(
                    `Index changed from ${y.startIndex} to ${ge}. Updating range.`
                  ), E({
                    startIndex: ge,
                    endIndex: Math.min(O, fe + s)
                  });
                };
                return $.addEventListener("scroll", H, {
                  passive: !0
                }), () => $.removeEventListener("scroll", H);
              }, [O, b, w, y.startIndex]);
              const z = $e(() => {
                console.log(
                  "USER ACTION: Clicked scroll button -> SCROLLING_TO_BOTTOM"
                ), O !== 0 && N("SCROLLING_TO_BOTTOM");
              }, [O]), U = $e(
                ($, V = "smooth") => {
                  u.current && b[$] !== void 0 && (N("IDLE_NOT_AT_BOTTOM"), u.current.scrollTo({
                    top: b[$],
                    behavior: V
                  }));
                },
                [b]
              ), se = {
                outer: {
                  ref: u,
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
                virtualState: G,
                virtualizerProps: se,
                scrollToBottom: z,
                scrollToIndex: U
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
                    const [, N] = K({}), k = `${m}-${n.join(".")}-${c}`;
                    ce(() => {
                      const x = `${e}////${k}`, j = r.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return j.components.set(x, {
                        forceUpdate: () => N({}),
                        paths: /* @__PURE__ */ new Set([y.join(".")])
                      }), r.getState().stateComponents.set(e, j), () => {
                        const Z = r.getState().stateComponents.get(e);
                        Z && Z.components.delete(x);
                      };
                    }, [e, k]);
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
            return (t) => le(tt, {
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
                return le(rt, {
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
            return (t) => (p(n), Ee(i, t, n, e), a(
              r.getState().getNestedState(e, n),
              n
            ));
          if (l === "uniqueInsert")
            return (t, o, s) => {
              const c = r.getState().getNestedState(e, n), f = ee(t) ? t(c) : t;
              let u = null;
              if (!c.some((E) => {
                if (o) {
                  const N = o.every(
                    (k) => q(E[k], f[k])
                  );
                  return N && (u = E), N;
                }
                const w = q(E, f);
                return w && (u = E), w;
              }))
                p(n), Ee(i, f, n, e);
              else if (s && u) {
                const E = s(u), w = c.map(
                  (N) => q(N, u) ? E : N
                );
                p(n), ie(i, w, n);
              }
            };
          if (l === "cut")
            return (t, o) => {
              if (!o?.waitForSync)
                return p(n), me(i, n, e, t), a(
                  r.getState().getNestedState(e, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (t) => {
              for (let o = 0; o < h.length; o++)
                h[o] === t && me(i, n, e, o);
            };
          if (l === "toggleByValue")
            return (t) => {
              const o = h.findIndex((s) => s === t);
              o > -1 ? me(i, n, e, o) : Ee(i, t, n, e);
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
            return () => me(
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
          return (d) => Ve({
            _stateKey: e,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Ve({
            _stateKey: e,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${e}:${n.join(".")}`;
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => Te(g + "-" + e + "-" + d);
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
              const t = r.getState().cogsStateStore[e], s = ze(t, d).newDocument;
              Ge(
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
                  const N = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
                  if (!N.includes("none")) {
                    if (N.includes("all")) {
                      E.forceUpdate();
                      continue;
                    }
                    if (N.includes("component") && (E.paths.has("") && (w = !0), !w))
                      for (const k of u) {
                        if (E.paths.has(k)) {
                          w = !0;
                          break;
                        }
                        let x = k.lastIndexOf(".");
                        for (; x !== -1; ) {
                          const j = k.substring(0, x);
                          if (E.paths.has(j)) {
                            w = !0;
                            break;
                          }
                          const Z = k.substring(
                            x + 1
                          );
                          if (!isNaN(Number(Z))) {
                            const P = j.lastIndexOf(".");
                            if (P !== -1) {
                              const A = j.substring(
                                0,
                                P
                              );
                              if (E.paths.has(A)) {
                                w = !0;
                                break;
                              }
                            }
                          }
                          x = j.lastIndexOf(".");
                        }
                        if (w) break;
                      }
                    if (!w && N.includes("deps") && E.depsFunction) {
                      const k = E.depsFunction(s);
                      let x = !1;
                      typeof k == "boolean" ? k && (x = !0) : q(E.deps, k) || (E.deps = k, x = !0), x && (w = !0);
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
              Q(d.key);
              const o = r.getState().cogsStateStore[e];
              try {
                const s = r.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([f]) => {
                  f && f.startsWith(d.key) && Q(f);
                });
                const c = d.zodSchema.safeParse(o);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const y = u.path, E = u.message, w = [d.key, ...y].join(".");
                  t(w, E);
                }), ve(e), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => r().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => ke.getState().getFormRefsByStateKey(e);
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
          return () => ke.getState().getFormRef(e + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: t
          }) => /* @__PURE__ */ we(
            Fe,
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
              He(() => {
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
          return (d, t) => /* @__PURE__ */ we(
            Be,
            {
              setState: i,
              stateKey: e,
              path: n,
              child: d,
              formOpts: t
            }
          );
        const L = [...n, l], ae = r.getState().getNestedState(e, L);
        return a(ae, L, S);
      }
    }, W = new Proxy(R, D);
    return T.set(B, {
      proxy: W,
      stateVersion: C
    }), W;
  }
  return a(
    r.getState().getNestedState(e, [])
  );
}
function Ve(e) {
  return le(nt, { proxy: e });
}
function tt({
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
function nt({
  proxy: e
}) {
  const i = J(null), m = `${e._stateKey}-${e._path.join(".")}`;
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
    const B = document.createTextNode(String(S));
    g.replaceWith(B);
  }, [e._stateKey, e._path.join("."), e._effect]), le("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function vt(e) {
  const i = De(
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
function rt({
  stateKey: e,
  itemComponentId: i,
  itemPath: m,
  children: g
}) {
  const [, T] = K({}), [C, p] = qe(), v = J(null);
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
  }, [e, i, m.join(".")]), /* @__PURE__ */ we("div", { ref: C, children: g });
}
export {
  Ve as $cogsSignal,
  vt as $cogsSignalStore,
  It as addStateOptions,
  ht as createCogsState,
  Tt as notifyComponent,
  et as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
