"use client";
import { jsx as ve } from "react/jsx-runtime";
import { useState as Z, useRef as Q, useEffect as re, useLayoutEffect as ie, useMemo as ye, createElement as ce, useSyncExternalStore as xe, startTransition as Ge, useCallback as Ee } from "react";
import { transformStateFunc as Pe, isDeepEqual as Y, isFunction as X, getNestedValue as z, getDifferences as Ae, debounce as Ue } from "./utility.js";
import { pushFunc as Te, updateFn as se, cutFunc as ge, ValidationWrapper as je, FormControlComponent as Fe } from "./Functions.jsx";
import De from "superjson";
import { v4 as pe } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as Oe } from "./store.js";
import { useCogsConfig as Me } from "./CogsStateClient.jsx";
import { applyPatch as He } from "fast-json-patch";
import We from "react-use-measure";
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
  const g = ne(e) || {}, T = m[e] || {}, N = r.getState().setInitialStateOptions, A = { ...T, ...g };
  let v = !1;
  if (i)
    for (const a in i)
      A.hasOwnProperty(a) ? (a == "localStorage" && i[a] && A[a].key !== i[a]?.key && (v = !0, A[a] = i[a]), a == "initialState" && i[a] && A[a] !== i[a] && // Different references
      !Y(A[a], i[a]) && (v = !0, A[a] = i[a])) : (v = !0, A[a] = i[a]);
  v && N(e, A);
}
function ut(e, { formElements: i, validation: m }) {
  return { initialState: e, formElements: i, validation: m };
}
const gt = (e, i) => {
  let m = e;
  const [g, T] = Pe(m);
  (Object.keys(T).length > 0 || i && Object.keys(i).length > 0) && Object.keys(T).forEach((v) => {
    T[v] = T[v] || {}, T[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...T[v].formElements || {}
      // State-specific overrides
    }, ne(v) || r.getState().setInitialStateOptions(v, T[v]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const N = (v, a) => {
    const [h] = Z(a?.componentId ?? pe());
    Ce({
      stateKey: v,
      options: a,
      initialOptionsPart: T
    });
    const n = r.getState().cogsStateStore[v] || g[v], S = a?.modifyState ? a.modifyState(n) : n, [H, P] = Ze(
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
    return P;
  };
  function A(v, a) {
    Ce({ stateKey: v, options: a, initialOptionsPart: T }), a.localStorage && qe(v, a), Ie(v);
  }
  return { useCogsState: N, setCogsOptions: A };
}, {
  setUpdaterState: fe,
  setState: te,
  getInitialOptions: ne,
  getKeyState: Re,
  getValidationErrors: Le,
  setStateLog: Be,
  updateInitialStateGlobal: _e,
  addValidationError: Ye,
  removeValidationError: J,
  setServerSyncActions: ze
} = r.getState(), $e = (e, i, m, g, T) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    g
  );
  const N = X(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (N && g) {
    const A = `${g}-${i}-${N}`;
    let v;
    try {
      v = me(A)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: T ?? v
    }, h = De.serialize(a);
    window.localStorage.setItem(
      A,
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
  const m = r.getState().cogsStateStore[e], { sessionId: g } = Me(), T = X(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (T && g) {
    const N = me(
      `${g}-${e}-${T}`
    );
    if (N && N.lastUpdated > (N.lastSyncedWithServer || 0))
      return te(e, N.state), Ie(e), !0;
  }
  return !1;
}, ke = (e, i, m, g, T, N) => {
  const A = {
    initialState: i,
    updaterState: Se(
      e,
      g,
      T,
      N
    ),
    state: m
  };
  _e(e, A.initialState), fe(e, A.updaterState), te(e, A.state);
}, Ie = (e) => {
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
}, Je = (e, i, m, g) => {
  switch (e) {
    case "update":
      return {
        oldValue: z(i, g),
        newValue: z(m, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: z(m, g)
      };
    case "cut":
      return {
        oldValue: z(i, g),
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
  reactiveDeps: N,
  reactiveType: A,
  componentId: v,
  initialState: a,
  syncUpdate: h,
  dependencies: n,
  serverState: S
} = {}) {
  const [H, P] = Z({}), { sessionId: U } = Me();
  let W = !i;
  const [I] = Z(i ?? pe()), l = r.getState().stateLog[I], le = Q(/* @__PURE__ */ new Set()), K = Q(v ?? pe()), V = Q(
    null
  );
  V.current = ne(I) ?? null, re(() => {
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
  }, [h]), re(() => {
    if (a) {
      Ne(I, {
        initialState: a
      });
      const t = V.current, s = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = r.getState().initialStateGlobal[I];
      if (!(c && !Y(c, a) || !c) && !s)
        return;
      let u = null;
      const p = X(t?.localStorage?.key) ? t?.localStorage?.key(a) : t?.localStorage?.key;
      p && U && (u = me(`${U}-${I}-${p}`));
      let _ = a, w = !1;
      const C = s ? Date.now() : 0, $ = u?.lastUpdated || 0, k = u?.lastSyncedWithServer || 0;
      s && C > $ ? (_ = t.serverState.data, w = !0) : u && $ > k && (_ = u.state, t?.localStorage?.onChange && t?.localStorage?.onChange(_)), r.getState().initializeShadowState(I, a), ke(
        I,
        a,
        _,
        oe,
        K.current,
        U
      ), w && p && U && $e(_, I, t, U, Date.now()), Ie(I), (Array.isArray(A) ? A : [A || "component"]).includes("none") || P({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), ie(() => {
    W && Ne(I, {
      serverSync: m,
      formElements: T,
      initialState: a,
      localStorage: g,
      middleware: V.current?.middleware
    });
    const t = `${I}////${K.current}`, o = r.getState().stateComponents.get(I) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(t, {
      forceUpdate: () => P({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: N || void 0,
      reactiveType: A ?? ["component", "deps"]
    }), r.getState().stateComponents.set(I, o), P({}), () => {
      o && (o.components.delete(t), o.components.size === 0 && r.getState().stateComponents.delete(I));
    };
  }, []);
  const oe = (t, o, s, c) => {
    if (Array.isArray(o)) {
      const u = `${I}-${o.join(".")}`;
      le.current.add(u);
    }
    const f = r.getState();
    te(I, (u) => {
      const p = X(t) ? t(u) : t, _ = `${I}-${o.join(".")}`;
      if (_) {
        let M = !1, y = f.signalDomElements.get(_);
        if ((!y || y.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const x = o.slice(0, -1), R = z(p, x);
          if (Array.isArray(R)) {
            M = !0;
            const O = `${I}-${x.join(".")}`;
            y = f.signalDomElements.get(O);
          }
        }
        if (y) {
          const x = M ? z(p, o.slice(0, -1)) : z(p, o);
          y.forEach(({ parentId: R, position: O, effect: j }) => {
            const G = document.querySelector(
              `[data-parent-id="${R}"]`
            );
            if (G) {
              const B = Array.from(G.childNodes);
              if (B[O]) {
                const E = j ? new Function("state", `return (${j})(state)`)(x) : x;
                B[O].textContent = String(E);
              }
            }
          });
        }
      }
      console.log("shadowState", f.shadowStateStore), s.updateType === "update" && (c || V.current?.validation?.key) && o && J(
        (c || V.current?.validation?.key) + "." + o.join(".")
      );
      const w = o.slice(0, o.length - 1);
      s.updateType === "cut" && V.current?.validation?.key && J(
        V.current?.validation?.key + "." + w.join(".")
      ), s.updateType === "insert" && V.current?.validation?.key && Le(
        V.current?.validation?.key + "." + w.join(".")
      ).filter(([y, x]) => {
        let R = y?.split(".").length;
        if (y == w.join(".") && R == w.length - 1) {
          let O = y + "." + w;
          J(y), Ye(O, x);
        }
      });
      const C = f.stateComponents.get(I);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", C), C) {
        const M = Ae(u, p), y = new Set(M), x = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          R,
          O
        ] of C.components.entries()) {
          let j = !1;
          const G = Array.isArray(O.reactiveType) ? O.reactiveType : [O.reactiveType || "component"];
          if (console.log("component", O), !G.includes("none")) {
            if (G.includes("all")) {
              O.forceUpdate();
              continue;
            }
            if (G.includes("component") && ((O.paths.has(x) || O.paths.has("")) && (j = !0), !j))
              for (const B of y) {
                let E = B;
                for (; ; ) {
                  if (O.paths.has(E)) {
                    j = !0;
                    break;
                  }
                  const b = E.lastIndexOf(".");
                  if (b !== -1) {
                    const F = E.substring(
                      0,
                      b
                    );
                    if (!isNaN(
                      Number(E.substring(b + 1))
                    ) && O.paths.has(F)) {
                      j = !0;
                      break;
                    }
                    E = F;
                  } else
                    E = "";
                  if (E === "")
                    break;
                }
                if (j) break;
              }
            if (!j && G.includes("deps") && O.depsFunction) {
              const B = O.depsFunction(p);
              let E = !1;
              typeof B == "boolean" ? B && (E = !0) : Y(O.deps, B) || (O.deps = B, E = !0), E && (j = !0);
            }
            j && O.forceUpdate();
          }
        }
      }
      const $ = Date.now();
      o = o.map((M, y) => {
        const x = o.slice(0, -1), R = z(p, x);
        return y === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (R.length - 1).toString() : M;
      });
      const { oldValue: k, newValue: D } = Je(
        s.updateType,
        u,
        p,
        o
      ), q = {
        timeStamp: $,
        stateKey: I,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: k,
        newValue: D
      };
      switch (s.updateType) {
        case "update":
          f.updateShadowAtPath(I, o, p);
          break;
        case "insert":
          const M = o.slice(0, -1);
          f.insertShadowArrayElement(I, M, D);
          break;
        case "cut":
          const y = o.slice(0, -1), x = parseInt(o[o.length - 1]);
          f.removeShadowArrayElement(I, y, x);
          break;
      }
      if (Be(I, (M) => {
        const x = [...M ?? [], q].reduce((R, O) => {
          const j = `${O.stateKey}:${JSON.stringify(O.path)}`, G = R.get(j);
          return G ? (G.timeStamp = Math.max(G.timeStamp, O.timeStamp), G.newValue = O.newValue, G.oldValue = G.oldValue ?? O.oldValue, G.updateType = O.updateType) : R.set(j, { ...O }), R;
        }, /* @__PURE__ */ new Map());
        return Array.from(x.values());
      }), $e(
        p,
        I,
        V.current,
        U
      ), V.current?.middleware && V.current.middleware({
        updateLog: l,
        update: q
      }), V.current?.serverSync) {
        const M = f.serverState[I], y = V.current?.serverSync;
        ze(I, {
          syncKey: typeof y.syncKey == "string" ? y.syncKey : y.syncKey({ state: p }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (y.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return p;
    });
  };
  r.getState().updaterState[I] || (fe(
    I,
    Se(
      I,
      oe,
      K.current,
      U
    )
  ), r.getState().cogsStateStore[I] || te(I, e), r.getState().initialStateGlobal[I] || _e(I, e));
  const d = ye(() => Se(
    I,
    oe,
    K.current,
    U
  ), [I, U]);
  return [Re(I), d];
}
function Se(e, i, m, g) {
  const T = /* @__PURE__ */ new Map();
  let N = 0;
  const A = (h) => {
    const n = h.join(".");
    for (const [S] of T)
      (S === n || S.startsWith(n + ".")) && T.delete(S);
    N++;
  }, v = {
    removeValidation: (h) => {
      h?.validationKey && J(h.validationKey);
    },
    revertToInitialState: (h) => {
      const n = r.getState().getInitialOptions(e)?.validation;
      n?.key && J(n?.key), h?.validationKey && J(h.validationKey);
      const S = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), T.clear(), N++;
      const H = a(S, []), P = ne(e), U = X(P?.localStorage?.key) ? P?.localStorage?.key(S) : P?.localStorage?.key, W = `${g}-${e}-${U}`;
      W && localStorage.removeItem(W), fe(e, H), te(e, S);
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
      ), S = r.getState().initialStateGlobal[e], H = ne(e), P = X(H?.localStorage?.key) ? H?.localStorage?.key(S) : H?.localStorage?.key, U = `${g}-${e}-${P}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), Ge(() => {
        _e(e, h), r.getState().initializeShadowState(e, h), fe(e, n), te(e, h);
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
      return !!(h && Y(h, Re(e)));
    }
  };
  function a(h, n = [], S) {
    const H = n.map(String).join(".");
    T.get(H);
    const P = function() {
      return r().getNestedState(e, n);
    };
    Object.keys(v).forEach((I) => {
      P[I] = v[I];
    });
    const U = {
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
          return () => Ae(
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
                  const p = [s, ...u.path].join(".");
                  r.getState().addValidationError(p, u.message);
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
          const d = r.getState().getNestedState(e, n), t = r.getState().initialStateGlobal[e], o = z(t, n);
          return Y(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              e,
              n
            ), t = r.getState().initialStateGlobal[e], o = z(t, n);
            return Y(d, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[e], t = ne(e), o = X(t?.localStorage?.key) ? t?.localStorage?.key(d) : t?.localStorage?.key, s = `${g}-${e}-${o}`;
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
              } = t, u = Q(null), [p, _] = Z({
                startIndex: 0,
                endIndex: 10
              }), [w, C] = Z("WAITING_FOR_ARRAY"), $ = Q(0), k = Q(f), [D, q] = Z(0);
              re(() => r.getState().subscribeToShadowState(e, () => {
                q((b) => b + 1);
              }), [e]);
              const M = r().getNestedState(
                e,
                n
              ), y = M.length, { totalHeight: x, positions: R } = ye(() => {
                const E = r.getState().getShadowMetadata(e, n) || [];
                let b = 0;
                const F = [];
                for (let L = 0; L < y; L++) {
                  F[L] = b;
                  const ee = E[L]?.virtualizer?.itemHeight;
                  b += ee || o;
                }
                return { totalHeight: b, positions: F };
              }, [
                y,
                e,
                n.join("."),
                o,
                D
              ]), O = ye(() => {
                const E = Math.max(0, p.startIndex), b = Math.min(y, p.endIndex), F = Array.from(
                  { length: b - E },
                  (ee, ae) => E + ae
                ), L = F.map((ee) => M[ee]);
                return a(L, n, {
                  ...S,
                  validIndices: F
                });
              }, [p.startIndex, p.endIndex, M, y]);
              ie(() => {
                const E = !Y(
                  f,
                  k.current
                ), b = y > $.current;
                if (E) {
                  console.log(
                    "STATE_TRANSITION: Deps changed. -> WAITING_FOR_ARRAY"
                  ), C("WAITING_FOR_ARRAY");
                  return;
                }
                b && w === "LOCKED_AT_BOTTOM" && c && (console.log(
                  "STATE_TRANSITION: New items arrived while locked. -> GETTING_ARRAY_HEIGHTS"
                ), C("GETTING_ARRAY_HEIGHTS")), $.current = y, k.current = f;
              }, [y, ...f]), ie(() => {
                const E = u.current;
                if (!E) return;
                let b;
                if (w === "WAITING_FOR_ARRAY" && y > 0 && c)
                  console.log(
                    "ACTION: WAITING_FOR_ARRAY -> GETTING_ARRAY_HEIGHTS"
                  ), C("GETTING_ARRAY_HEIGHTS");
                else if (w === "GETTING_ARRAY_HEIGHTS")
                  console.log(
                    "ACTION: GETTING_ARRAY_HEIGHTS. Setting range and starting loop."
                  ), _({
                    startIndex: Math.max(0, y - 10 - s),
                    endIndex: y
                  }), b = setInterval(() => {
                    const F = y - 1;
                    ((r.getState().getShadowMetadata(e, n) || [])[F]?.virtualizer?.itemHeight || 0) > 0 && (clearInterval(b), console.log(
                      "ACTION: Measurement success. -> MOVING_TO_BOTTOM"
                    ), C("MOVING_TO_BOTTOM"));
                  }, 100);
                else if (w === "MOVING_TO_BOTTOM") {
                  console.log("ACTION: MOVING_TO_BOTTOM. Executing scroll.");
                  const F = $.current === 0 ? "auto" : "smooth";
                  E.scrollTo({
                    top: E.scrollHeight,
                    behavior: F
                  });
                  const L = setTimeout(
                    () => {
                      console.log(
                        "ACTION: Scroll finished. -> LOCKED_AT_BOTTOM"
                      ), C("LOCKED_AT_BOTTOM");
                    },
                    F === "smooth" ? 500 : 50
                  );
                  return () => clearTimeout(L);
                }
                return () => {
                  b && clearInterval(b);
                };
              }, [w, y, R]), re(() => {
                const E = u.current;
                if (!E) return;
                const b = () => {
                  !(E.scrollHeight - E.scrollTop - E.clientHeight < 1) && (w === "LOCKED_AT_BOTTOM" || w === "MOVING_TO_BOTTOM") && (console.log(
                    "USER_ACTION: Scrolled up. -> IDLE_NOT_AT_BOTTOM"
                  ), C("IDLE_NOT_AT_BOTTOM"));
                  const { scrollTop: L, clientHeight: ee } = E;
                  let ae = 0, de = y - 1;
                  for (; ae <= de; ) {
                    const he = Math.floor((ae + de) / 2);
                    R[he] < L ? ae = he + 1 : de = he - 1;
                  }
                  const we = Math.max(0, de - s);
                  let ue = we;
                  const Ve = L + ee;
                  for (; ue < y && R[ue] < Ve; )
                    ue++;
                  _({
                    startIndex: we,
                    endIndex: Math.min(y, ue + s)
                  });
                };
                return E.addEventListener("scroll", b, {
                  passive: !0
                }), () => E.removeEventListener("scroll", b);
              }, [y, R, w]);
              const j = Ee(
                (E = "smooth") => {
                  console.log(
                    "USER_ACTION: Clicked scroll to bottom button. -> MOVING_TO_BOTTOM"
                  ), C("MOVING_TO_BOTTOM");
                },
                []
              ), G = Ee(
                (E, b = "smooth") => {
                },
                [R]
              ), B = {
                outer: {
                  ref: u,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${x}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${R[p.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: O,
                virtualizerProps: B,
                scrollToBottom: j,
                scrollToIndex: G
              };
            };
          if (l === "stateSort")
            return (t) => {
              const s = [...d()].sort(
                (u, p) => t(u.item, p.item)
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
                ({ item: u }, p) => t(u, p)
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
                const u = o[c], p = [...n, c.toString()], _ = a(u, p, S);
                return t(u, _, {
                  register: () => {
                    const [, C] = Z({}), $ = `${m}-${n.join(".")}-${c}`;
                    ie(() => {
                      const k = `${e}////${$}`, D = r.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set(k, {
                        forceUpdate: () => C({}),
                        paths: /* @__PURE__ */ new Set([p.join(".")])
                      }), r.getState().stateComponents.set(e, D), () => {
                        const q = r.getState().stateComponents.get(e);
                        q && q.components.delete(k);
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
              const u = [...n, f.toString()], p = a(s, u, S);
              return t(
                s,
                p,
                c,
                h,
                a(h, n, S)
              );
            });
          if (l === "$stateMap")
            return (t) => ce(Xe, {
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
                const u = o[c], p = [...n, c.toString()], _ = a(u, p, S), w = `${m}-${n.join(".")}-${c}`;
                return ce(Ke, {
                  key: c,
                  stateKey: e,
                  itemComponentId: w,
                  itemPath: p,
                  children: t(
                    u,
                    _,
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
            return (t) => (A(n), Te(i, t, n, e), a(
              r.getState().getNestedState(e, n),
              n
            ));
          if (l === "uniqueInsert")
            return (t, o, s) => {
              const c = r.getState().getNestedState(e, n), f = X(t) ? t(c) : t;
              let u = null;
              if (!c.some((_) => {
                if (o) {
                  const C = o.every(
                    ($) => Y(_[$], f[$])
                  );
                  return C && (u = _), C;
                }
                const w = Y(_, f);
                return w && (u = _), w;
              }))
                A(n), Te(i, f, n, e);
              else if (s && u) {
                const _ = s(u), w = c.map(
                  (C) => Y(C, u) ? _ : C
                );
                A(n), se(i, w, n);
              }
            };
          if (l === "cut")
            return (t, o) => {
              if (!o?.waitForSync)
                return A(n), ge(i, n, e, t), a(
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
              o > -1 ? ge(i, n, e, o) : Te(i, t, n, e);
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
        const K = n[n.length - 1];
        if (!isNaN(Number(K))) {
          const d = n.slice(0, -1), t = r.getState().getNestedState(e, d);
          if (Array.isArray(t) && l === "cut")
            return () => ge(
              i,
              d,
              e,
              Number(K)
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
            se(i, c, t), A(t);
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
            se(i, c, d), A(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const t = r.getState().cogsStateStore[e], s = He(t, d).newDocument;
              ke(
                e,
                r.getState().initialStateGlobal[e],
                s,
                i,
                m,
                g
              );
              const c = r.getState().stateComponents.get(e);
              if (c) {
                const f = Ae(t, s), u = new Set(f);
                for (const [
                  p,
                  _
                ] of c.components.entries()) {
                  let w = !1;
                  const C = Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"];
                  if (!C.includes("none")) {
                    if (C.includes("all")) {
                      _.forceUpdate();
                      continue;
                    }
                    if (C.includes("component") && (_.paths.has("") && (w = !0), !w))
                      for (const $ of u) {
                        if (_.paths.has($)) {
                          w = !0;
                          break;
                        }
                        let k = $.lastIndexOf(".");
                        for (; k !== -1; ) {
                          const D = $.substring(0, k);
                          if (_.paths.has(D)) {
                            w = !0;
                            break;
                          }
                          const q = $.substring(
                            k + 1
                          );
                          if (!isNaN(Number(q))) {
                            const M = D.lastIndexOf(".");
                            if (M !== -1) {
                              const y = D.substring(
                                0,
                                M
                              );
                              if (_.paths.has(y)) {
                                w = !0;
                                break;
                              }
                            }
                          }
                          k = D.lastIndexOf(".");
                        }
                        if (w) break;
                      }
                    if (!w && C.includes("deps") && _.depsFunction) {
                      const $ = _.depsFunction(s);
                      let k = !1;
                      typeof $ == "boolean" ? $ && (k = !0) : Y(_.deps, $) || (_.deps = $, k = !0), k && (w = !0);
                    }
                    w && _.forceUpdate();
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
              J(d.key);
              const o = r.getState().cogsStateStore[e];
              try {
                const s = r.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([f]) => {
                  f && f.startsWith(d.key) && J(f);
                });
                const c = d.zodSchema.safeParse(o);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const p = u.path, _ = u.message, w = [d.key, ...p].join(".");
                  t(w, _);
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
          }) => /* @__PURE__ */ ve(
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
                se(i, d, n, "");
                const o = r.getState().getNestedState(e, n);
                t?.afterUpdate && t.afterUpdate(o);
              }, t.debounce);
            else {
              se(i, d, n, "");
              const o = r.getState().getNestedState(e, n);
              t?.afterUpdate && t.afterUpdate(o);
            }
            A(n);
          };
        if (l === "formElement")
          return (d, t) => /* @__PURE__ */ ve(
            Fe,
            {
              setState: i,
              stateKey: e,
              path: n,
              child: d,
              formOpts: t
            }
          );
        const V = [...n, l], oe = r.getState().getNestedState(e, V);
        return a(oe, V, S);
      }
    }, W = new Proxy(P, U);
    return T.set(H, {
      proxy: W,
      stateVersion: N
    }), W;
  }
  return a(
    r.getState().getNestedState(e, [])
  );
}
function be(e) {
  return ce(Qe, { proxy: e });
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
    (T, N, A, v, a) => e._mapFn(T, N, A, v, a)
  ) : null;
}
function Qe({
  proxy: e
}) {
  const i = Q(null), m = `${e._stateKey}-${e._path.join(".")}`;
  return re(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const T = g.parentElement, A = Array.from(T.childNodes).indexOf(g);
    let v = T.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, T.setAttribute("data-parent-id", v));
    const h = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: A,
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
      } catch (P) {
        console.error("Error evaluating effect function during mount:", P), S = n;
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
function St(e) {
  const i = xe(
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
function Ke({
  stateKey: e,
  itemComponentId: i,
  itemPath: m,
  children: g
}) {
  const [, T] = Z({}), [N, A] = We(), v = Q(null);
  return re(() => {
    A.height > 0 && A.height !== v.current && (v.current = A.height, r.getState().setShadowMetadata(e, m, {
      virtualizer: {
        itemHeight: A.height
      }
    }));
  }, [A.height, e, m]), ie(() => {
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
  }, [e, i, m.join(".")]), /* @__PURE__ */ ve("div", { ref: N, children: g });
}
export {
  be as $cogsSignal,
  St as $cogsSignalStore,
  ut as addStateOptions,
  gt as createCogsState,
  ft as notifyComponent,
  Ze as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
