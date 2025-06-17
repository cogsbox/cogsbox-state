"use client";
import { jsx as Ee } from "react/jsx-runtime";
import { useState as Q, useRef as J, useEffect as oe, useLayoutEffect as ce, useMemo as _e, createElement as le, useSyncExternalStore as De, startTransition as Ue, useCallback as $e } from "react";
import { transformStateFunc as je, isDeepEqual as q, isFunction as K, getNestedValue as Z, getDifferences as we, debounce as He } from "./utility.js";
import { pushFunc as Oe, updateFn as ie, cutFunc as Se, ValidationWrapper as Be, FormControlComponent as Fe } from "./Functions.jsx";
import We from "superjson";
import { v4 as Ae } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as be } from "./store.js";
import { useCogsConfig as Ve } from "./CogsStateClient.jsx";
import { applyPatch as ze } from "fast-json-patch";
import qe from "react-use-measure";
function ke(e, i) {
  const m = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, I = m(e) || {};
  g(e, {
    ...I,
    ...i
  });
}
function Me({
  stateKey: e,
  options: i,
  initialOptionsPart: m
}) {
  const g = re(e) || {}, I = m[e] || {}, A = o.getState().setInitialStateOptions, O = { ...I, ...g };
  let y = !1;
  if (i)
    for (const a in i)
      O.hasOwnProperty(a) ? (a == "localStorage" && i[a] && O[a].key !== i[a]?.key && (y = !0, O[a] = i[a]), a == "initialState" && i[a] && O[a] !== i[a] && // Different references
      !q(O[a], i[a]) && (y = !0, O[a] = i[a])) : (y = !0, O[a] = i[a]);
  y && A(e, O);
}
function mt(e, { formElements: i, validation: m }) {
  return { initialState: e, formElements: i, validation: m };
}
const Tt = (e, i) => {
  let m = e;
  const [g, I] = je(m);
  (Object.keys(I).length > 0 || i && Object.keys(i).length > 0) && Object.keys(I).forEach((y) => {
    I[y] = I[y] || {}, I[y].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...I[y].formElements || {}
      // State-specific overrides
    }, re(y) || o.getState().setInitialStateOptions(y, I[y]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const A = (y, a) => {
    const [h] = Q(a?.componentId ?? Ae());
    Me({
      stateKey: y,
      options: a,
      initialOptionsPart: I
    });
    const n = o.getState().cogsStateStore[y] || g[y], S = a?.modifyState ? a.modifyState(n) : n, [F, L] = et(
      S,
      {
        stateKey: y,
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
  function O(y, a) {
    Me({ stateKey: y, options: a, initialOptionsPart: I }), a.localStorage && Qe(y, a), Ie(y);
  }
  return { useCogsState: A, setCogsOptions: O };
}, {
  setUpdaterState: me,
  setState: te,
  getInitialOptions: re,
  getKeyState: Le,
  getValidationErrors: Je,
  setStateLog: Ye,
  updateInitialStateGlobal: Ne,
  addValidationError: Ze,
  removeValidationError: X,
  setServerSyncActions: Xe
} = o.getState(), xe = (e, i, m, g, I) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    g
  );
  const A = K(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (A && g) {
    const O = `${g}-${i}-${A}`;
    let y;
    try {
      y = he(O)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: I ?? y
    }, h = We.serialize(a);
    window.localStorage.setItem(
      O,
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
}, Qe = (e, i) => {
  const m = o.getState().cogsStateStore[e], { sessionId: g } = Ve(), I = K(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (I && g) {
    const A = he(
      `${g}-${e}-${I}`
    );
    if (A && A.lastUpdated > (A.lastSyncedWithServer || 0))
      return te(e, A.state), Ie(e), !0;
  }
  return !1;
}, Ge = (e, i, m, g, I, A) => {
  const O = {
    initialState: i,
    updaterState: Te(
      e,
      g,
      I,
      A
    ),
    state: m
  };
  Ne(e, O.initialState), me(e, O.updaterState), te(e, O.state);
}, Ie = (e) => {
  const i = o.getState().stateComponents.get(e);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, ht = (e, i) => {
  const m = o.getState().stateComponents.get(e);
  if (m) {
    const g = `${e}////${i}`, I = m.components.get(g);
    if ((I ? Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"] : null)?.includes("none"))
      return;
    I && I.forceUpdate();
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
  formElements: I,
  reactiveDeps: A,
  reactiveType: O,
  componentId: y,
  initialState: a,
  syncUpdate: h,
  dependencies: n,
  serverState: S
} = {}) {
  const [F, L] = Q({}), { sessionId: G } = Ve();
  let W = !i;
  const [T] = Q(i ?? Ae()), l = o.getState().stateLog[T], de = J(/* @__PURE__ */ new Set()), ee = J(y ?? Ae()), P = J(
    null
  );
  P.current = re(T) ?? null, oe(() => {
    if (h && h.stateKey === T && h.path?.[0]) {
      te(T, (r) => ({
        ...r,
        [h.path[0]]: h.newValue
      }));
      const t = `${h.stateKey}:${h.path.join(".")}`;
      o.getState().setSyncInfo(t, {
        timeStamp: h.timeStamp,
        userId: h.userId
      });
    }
  }, [h]), oe(() => {
    if (a) {
      ke(T, {
        initialState: a
      });
      const t = P.current, s = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = o.getState().initialStateGlobal[T];
      if (!(c && !q(c, a) || !c) && !s)
        return;
      let u = null;
      const E = K(t?.localStorage?.key) ? t?.localStorage?.key(a) : t?.localStorage?.key;
      E && G && (u = he(`${G}-${T}-${E}`));
      let p = a, _ = !1;
      const N = s ? Date.now() : 0, w = u?.lastUpdated || 0, k = u?.lastSyncedWithServer || 0;
      s && N > w ? (p = t.serverState.data, _ = !0) : u && w > k && (p = u.state, t?.localStorage?.onChange && t?.localStorage?.onChange(p)), o.getState().initializeShadowState(T, a), Ge(
        T,
        a,
        p,
        ae,
        ee.current,
        G
      ), _ && E && G && xe(p, T, t, G, Date.now()), Ie(T), (Array.isArray(O) ? O : [O || "component"]).includes("none") || L({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), ce(() => {
    W && ke(T, {
      serverSync: m,
      formElements: I,
      initialState: a,
      localStorage: g,
      middleware: P.current?.middleware
    });
    const t = `${T}////${ee.current}`, r = o.getState().stateComponents.get(T) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(t, {
      forceUpdate: () => L({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: A || void 0,
      reactiveType: O ?? ["component", "deps"]
    }), o.getState().stateComponents.set(T, r), L({}), () => {
      r && (r.components.delete(t), r.components.size === 0 && o.getState().stateComponents.delete(T));
    };
  }, []);
  const ae = (t, r, s, c) => {
    if (Array.isArray(r)) {
      const u = `${T}-${r.join(".")}`;
      de.current.add(u);
    }
    const f = o.getState();
    te(T, (u) => {
      const E = K(t) ? t(u) : t, p = `${T}-${r.join(".")}`;
      if (p) {
        let M = !1, C = f.signalDomElements.get(p);
        if ((!C || C.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const V = r.slice(0, -1), R = Z(E, V);
          if (Array.isArray(R)) {
            M = !0;
            const v = `${T}-${V.join(".")}`;
            C = f.signalDomElements.get(v);
          }
        }
        if (C) {
          const V = M ? Z(E, r.slice(0, -1)) : Z(E, r);
          C.forEach(({ parentId: R, position: v, effect: D }) => {
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
      console.log("shadowState", f.shadowStateStore), s.updateType === "update" && (c || P.current?.validation?.key) && r && X(
        (c || P.current?.validation?.key) + "." + r.join(".")
      );
      const _ = r.slice(0, r.length - 1);
      s.updateType === "cut" && P.current?.validation?.key && X(
        P.current?.validation?.key + "." + _.join(".")
      ), s.updateType === "insert" && P.current?.validation?.key && Je(
        P.current?.validation?.key + "." + _.join(".")
      ).filter(([C, V]) => {
        let R = C?.split(".").length;
        if (C == _.join(".") && R == _.length - 1) {
          let v = C + "." + _;
          X(C), Ze(v, V);
        }
      });
      const N = f.stateComponents.get(T);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", N), N) {
        const M = we(u, E), C = new Set(M), V = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          R,
          v
        ] of N.components.entries()) {
          let D = !1;
          const $ = Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"];
          if (console.log("component", v), !$.includes("none")) {
            if ($.includes("all")) {
              v.forceUpdate();
              continue;
            }
            if ($.includes("component") && ((v.paths.has(V) || v.paths.has("")) && (D = !0), !D))
              for (const z of C) {
                let j = z;
                for (; ; ) {
                  if (v.paths.has(j)) {
                    D = !0;
                    break;
                  }
                  const se = j.lastIndexOf(".");
                  if (se !== -1) {
                    const ue = j.substring(
                      0,
                      se
                    );
                    if (!isNaN(
                      Number(j.substring(se + 1))
                    ) && v.paths.has(ue)) {
                      D = !0;
                      break;
                    }
                    j = ue;
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
      const w = Date.now();
      r = r.map((M, C) => {
        const V = r.slice(0, -1), R = Z(E, V);
        return C === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (R.length - 1).toString() : M;
      });
      const { oldValue: k, newValue: U } = Ke(
        s.updateType,
        u,
        E,
        r
      ), Y = {
        timeStamp: w,
        stateKey: T,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: k,
        newValue: U
      };
      switch (s.updateType) {
        case "update":
          f.updateShadowAtPath(T, r, E);
          break;
        case "insert":
          const M = r.slice(0, -1);
          f.insertShadowArrayElement(T, M, U);
          break;
        case "cut":
          const C = r.slice(0, -1), V = parseInt(r[r.length - 1]);
          f.removeShadowArrayElement(T, C, V);
          break;
      }
      if (Ye(T, (M) => {
        const V = [...M ?? [], Y].reduce((R, v) => {
          const D = `${v.stateKey}:${JSON.stringify(v.path)}`, $ = R.get(D);
          return $ ? ($.timeStamp = Math.max($.timeStamp, v.timeStamp), $.newValue = v.newValue, $.oldValue = $.oldValue ?? v.oldValue, $.updateType = v.updateType) : R.set(D, { ...v }), R;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), xe(
        E,
        T,
        P.current,
        G
      ), P.current?.middleware && P.current.middleware({
        updateLog: l,
        update: Y
      }), P.current?.serverSync) {
        const M = f.serverState[T], C = P.current?.serverSync;
        Xe(T, {
          syncKey: typeof C.syncKey == "string" ? C.syncKey : C.syncKey({ state: E }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (C.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[T] || (me(
    T,
    Te(
      T,
      ae,
      ee.current,
      G
    )
  ), o.getState().cogsStateStore[T] || te(T, e), o.getState().initialStateGlobal[T] || Ne(T, e));
  const d = _e(() => Te(
    T,
    ae,
    ee.current,
    G
  ), [T, G]);
  return [Le(T), d];
}
function Te(e, i, m, g) {
  const I = /* @__PURE__ */ new Map();
  let A = 0;
  const O = (h) => {
    const n = h.join(".");
    for (const [S] of I)
      (S === n || S.startsWith(n + ".")) && I.delete(S);
    A++;
  }, y = {
    removeValidation: (h) => {
      h?.validationKey && X(h.validationKey);
    },
    revertToInitialState: (h) => {
      const n = o.getState().getInitialOptions(e)?.validation;
      n?.key && X(n?.key), h?.validationKey && X(h.validationKey);
      const S = o.getState().initialStateGlobal[e];
      o.getState().clearSelectedIndexesForState(e), I.clear(), A++;
      const F = a(S, []), L = re(e), G = K(L?.localStorage?.key) ? L?.localStorage?.key(S) : L?.localStorage?.key, W = `${g}-${e}-${G}`;
      W && localStorage.removeItem(W), me(e, F), te(e, S);
      const T = o.getState().stateComponents.get(e);
      return T && T.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (h) => {
      I.clear(), A++;
      const n = Te(
        e,
        i,
        m,
        g
      ), S = o.getState().initialStateGlobal[e], F = re(e), L = K(F?.localStorage?.key) ? F?.localStorage?.key(S) : F?.localStorage?.key, G = `${g}-${e}-${L}`;
      return localStorage.getItem(G) && localStorage.removeItem(G), Ue(() => {
        Ne(e, h), o.getState().initializeShadowState(e, h), me(e, n), te(e, h);
        const W = o.getState().stateComponents.get(e);
        W && W.components.forEach((T) => {
          T.forceUpdate();
        });
      }), {
        fetchId: (W) => n.get()[W]
      };
    },
    _initialState: o.getState().initialStateGlobal[e],
    _serverState: o.getState().serverState[e],
    _isLoading: o.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const h = o.getState().serverState[e];
      return !!(h && q(h, Le(e)));
    }
  };
  function a(h, n = [], S) {
    const F = n.map(String).join(".");
    I.get(F);
    const L = function() {
      return o().getNestedState(e, n);
    };
    Object.keys(y).forEach((T) => {
      L[T] = y[T];
    });
    const G = {
      apply(T, l, de) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(e, n);
      },
      get(T, l) {
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
          const d = `${e}////${m}`, t = o.getState().stateComponents.get(e);
          if (t) {
            const r = t.components.get(d);
            if (r && !r.paths.has("")) {
              const s = n.join(".");
              let c = !0;
              for (const f of r.paths)
                if (s.startsWith(f) && (s === f || s[f.length] === ".")) {
                  c = !1;
                  break;
                }
              c && r.paths.add(s);
            }
          }
        }
        if (l === "getDifferences")
          return () => we(
            o.getState().cogsStateStore[e],
            o.getState().initialStateGlobal[e]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const d = o.getState().getInitialOptions(e), t = d?.sync;
            if (!t)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const r = o.getState().getNestedState(e, []), s = d?.validation?.key;
            try {
              const c = await t.action(r);
              if (c && !c.success && c.errors && s) {
                o.getState().removeValidationError(s), c.errors.forEach((u) => {
                  const E = [s, ...u.path].join(".");
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
            const d = o.getState().initialStateGlobal[e], t = re(e), r = K(t?.localStorage?.key) ? t?.localStorage?.key(d) : t?.localStorage?.key, s = `${g}-${e}-${r}`;
            s && localStorage.removeItem(s);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(e)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(h)) {
          const d = () => S?.validIndices ? h.map((r, s) => ({
            item: r,
            originalIndex: S.validIndices[s]
          })) : o.getState().getNestedState(e, n).map((r, s) => ({
            item: r,
            originalIndex: s
          }));
          if (l === "getSelected")
            return () => {
              const t = o.getState().getSelectedIndex(e, n.join("."));
              if (t !== void 0)
                return a(
                  h[t],
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
                overscan: s = 6,
                stickToBottom: c = !1,
                dependencies: f = []
              } = t, u = J(!1), E = J(null), [p, _] = Q({
                startIndex: 0,
                endIndex: 10
              }), [N, w] = Q("IDLE_AT_TOP"), k = J(!1), U = J(0), Y = J(f), M = J(0), [C, V] = Q(0);
              oe(() => o.getState().subscribeToShadowState(e, () => {
                V((x) => x + 1);
              }), [e]);
              const R = o().getNestedState(
                e,
                n
              ), v = R.length, { totalHeight: D, positions: $ } = _e(() => {
                const b = o.getState().getShadowMetadata(e, n) || [];
                let x = 0;
                const B = [];
                for (let H = 0; H < v; H++) {
                  B[H] = x;
                  const ne = b[H]?.virtualizer?.itemHeight;
                  x += ne || r;
                }
                return { totalHeight: x, positions: B };
              }, [
                v,
                e,
                n.join("."),
                r,
                C
              ]), z = _e(() => {
                const b = Math.max(0, p.startIndex), x = Math.min(v, p.endIndex), B = Array.from(
                  { length: x - b },
                  (ne, ve) => b + ve
                ), H = B.map((ne) => R[ne]);
                return a(H, n, {
                  ...S,
                  validIndices: B
                });
              }, [p.startIndex, p.endIndex, R, v]);
              ce(() => {
                const b = !q(
                  f,
                  Y.current
                ), x = v > U.current;
                if (b) {
                  console.log("TRANSITION: Deps changed -> IDLE_AT_TOP"), w("IDLE_AT_TOP");
                  return;
                }
                x && N === "LOCKED_AT_BOTTOM" && c && (console.log(
                  "TRANSITION: New items arrived while locked -> GETTING_HEIGHTS"
                ), w("GETTING_HEIGHTS")), U.current = v, Y.current = f;
              }, [v, ...f]), ce(() => {
                const b = E.current;
                if (!b) return;
                let x;
                if (N === "IDLE_AT_TOP" && c && v > 0)
                  console.log(
                    "ACTION (IDLE_AT_TOP): Data has arrived -> GETTING_HEIGHTS"
                  ), w("GETTING_HEIGHTS");
                else if (N === "GETTING_HEIGHTS")
                  console.log(
                    "ACTION (GETTING_HEIGHTS): Setting range to end and starting loop."
                  ), _({
                    startIndex: Math.max(0, v - 10 - s),
                    endIndex: v
                  }), x = setInterval(() => {
                    const B = v - 1;
                    ((o.getState().getShadowMetadata(e, n) || [])[B]?.virtualizer?.itemHeight || 0) > 0 && (clearInterval(x), u.current || (console.log(
                      "ACTION (GETTING_HEIGHTS): Measurement success -> SCROLLING_TO_BOTTOM"
                    ), w("SCROLLING_TO_BOTTOM")));
                  }, 100);
                else if (N === "SCROLLING_TO_BOTTOM") {
                  console.log(
                    "ACTION (SCROLLING_TO_BOTTOM): Executing scroll."
                  ), k.current = !0;
                  const B = U.current === 0 ? "auto" : "smooth";
                  b.scrollTo({
                    top: b.scrollHeight,
                    behavior: B
                  });
                  const H = setTimeout(
                    () => {
                      console.log(
                        "ACTION (SCROLLING_TO_BOTTOM): Scroll finished -> LOCKED_AT_BOTTOM"
                      ), k.current = !1, u.current = !1, w("LOCKED_AT_BOTTOM");
                    },
                    B === "smooth" ? 500 : 50
                  );
                  return () => clearTimeout(H);
                }
                return () => {
                  x && clearInterval(x);
                };
              }, [N, v, $]), oe(() => {
                const b = E.current;
                if (!b) return;
                const x = r / 2, B = () => {
                  if (k.current)
                    return;
                  const H = b.scrollTop;
                  if (b.scrollHeight - H - b.clientHeight < 1 ? (N === "IDLE_NOT_AT_BOTTOM" && (console.log(
                    "USER ACTION: Scrolled back to bottom -> LOCKED_AT_BOTTOM"
                  ), w("LOCKED_AT_BOTTOM")), u.current = !1) : (N !== "IDLE_NOT_AT_BOTTOM" && (console.log(
                    "USER ACTION: Scrolled up -> IDLE_NOT_AT_BOTTOM"
                  ), w("IDLE_NOT_AT_BOTTOM")), u.current = !0), Math.abs(H - M.current) < x)
                    return;
                  M.current = H, console.log("Threshold passed: Updating virtual range.");
                  const { clientHeight: ve } = b;
                  let ye = 0, ge = v - 1;
                  for (; ye <= ge; ) {
                    const pe = Math.floor((ye + ge) / 2);
                    $[pe] < H ? ye = pe + 1 : ge = pe - 1;
                  }
                  const Ce = Math.max(0, ge - s);
                  let fe = Ce;
                  const Re = H + ve;
                  for (; fe < v && $[fe] < Re; )
                    fe++;
                  _({
                    startIndex: Ce,
                    endIndex: Math.min(v, fe + s)
                  });
                };
                return b.addEventListener("scroll", B, {
                  passive: !0
                }), () => b.removeEventListener("scroll", B);
              }, [v, $, N, r]);
              const j = $e(() => {
                console.log(
                  "USER ACTION: Clicked scroll button -> SCROLLING_TO_BOTTOM"
                ), w("SCROLLING_TO_BOTTOM");
              }, []), se = $e(
                (b, x = "smooth") => {
                  E.current && $[b] !== void 0 && (w("IDLE_NOT_AT_BOTTOM"), E.current.scrollTo({
                    top: $[b],
                    behavior: x
                  }));
                },
                [$]
              ), ue = {
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
                virtualizerProps: ue,
                scrollToBottom: j,
                scrollToIndex: se
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
              const r = o.getState().getNestedState(e, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (c, f) => f)).map((c, f) => {
                const u = r[c], E = [...n, c.toString()], p = a(u, E, S);
                return t(u, p, {
                  register: () => {
                    const [, N] = Q({}), w = `${m}-${n.join(".")}-${c}`;
                    ce(() => {
                      const k = `${e}////${w}`, U = o.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return U.components.set(k, {
                        forceUpdate: () => N({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(e, U), () => {
                        const Y = o.getState().stateComponents.get(e);
                        Y && Y.components.delete(k);
                      };
                    }, [e, w]);
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
              const r = o.getState().getNestedState(e, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (c, f) => f)).map((c, f) => {
                const u = r[c], E = [...n, c.toString()], p = a(u, E, S), _ = `${m}-${n.join(".")}-${c}`;
                return le(rt, {
                  key: c,
                  stateKey: e,
                  itemComponentId: _,
                  itemPath: E,
                  children: t(
                    u,
                    p,
                    f,
                    r,
                    a(r, n, S)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (t) => {
              const r = h;
              I.clear(), A++;
              const s = r.flatMap(
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
              const r = h[t];
              return a(r, [...n, t.toString()]);
            };
          if (l === "last")
            return () => {
              const t = o.getState().getNestedState(e, n);
              if (t.length === 0) return;
              const r = t.length - 1, s = t[r], c = [...n, r.toString()];
              return a(s, c);
            };
          if (l === "insert")
            return (t) => (O(n), Oe(i, t, n, e), a(
              o.getState().getNestedState(e, n),
              n
            ));
          if (l === "uniqueInsert")
            return (t, r, s) => {
              const c = o.getState().getNestedState(e, n), f = K(t) ? t(c) : t;
              let u = null;
              if (!c.some((p) => {
                if (r) {
                  const N = r.every(
                    (w) => q(p[w], f[w])
                  );
                  return N && (u = p), N;
                }
                const _ = q(p, f);
                return _ && (u = p), _;
              }))
                O(n), Oe(i, f, n, e);
              else if (s && u) {
                const p = s(u), _ = c.map(
                  (N) => q(N, u) ? p : N
                );
                O(n), ie(i, _, n);
              }
            };
          if (l === "cut")
            return (t, r) => {
              if (!r?.waitForSync)
                return O(n), Se(i, n, e, t), a(
                  o.getState().getNestedState(e, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (t) => {
              for (let r = 0; r < h.length; r++)
                h[r] === t && Se(i, n, e, r);
            };
          if (l === "toggleByValue")
            return (t) => {
              const r = h.findIndex((s) => s === t);
              r > -1 ? Se(i, n, e, r) : Oe(i, t, n, e);
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
            return (t, r) => {
              const c = d().find(
                ({ item: u }) => u[t] === r
              );
              if (!c) return;
              const f = [...n, c.originalIndex.toString()];
              return a(c.item, f, S);
            };
        }
        const ee = n[n.length - 1];
        if (!isNaN(Number(ee))) {
          const d = n.slice(0, -1), t = o.getState().getNestedState(e, d);
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
          return (d) => he(g + "-" + e + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), t = d.join("."), r = o.getState().getNestedState(e, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(e, t) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const t = n.slice(0, -1), r = Number(n[n.length - 1]), s = t.join(".");
            d ? o.getState().setSelectedIndex(e, s, r) : o.getState().setSelectedIndex(e, s, void 0);
            const c = o.getState().getNestedState(e, [...t]);
            ie(i, c, t), O(t);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), t = Number(n[n.length - 1]), r = d.join("."), s = o.getState().getSelectedIndex(e, r);
            o.getState().setSelectedIndex(
              e,
              r,
              s === t ? void 0 : t
            );
            const c = o.getState().getNestedState(e, [...d]);
            ie(i, c, d), O(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const t = o.getState().cogsStateStore[e], s = ze(t, d).newDocument;
              Ge(
                e,
                o.getState().initialStateGlobal[e],
                s,
                i,
                m,
                g
              );
              const c = o.getState().stateComponents.get(e);
              if (c) {
                const f = we(t, s), u = new Set(f);
                for (const [
                  E,
                  p
                ] of c.components.entries()) {
                  let _ = !1;
                  const N = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!N.includes("none")) {
                    if (N.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (N.includes("component") && (p.paths.has("") && (_ = !0), !_))
                      for (const w of u) {
                        if (p.paths.has(w)) {
                          _ = !0;
                          break;
                        }
                        let k = w.lastIndexOf(".");
                        for (; k !== -1; ) {
                          const U = w.substring(0, k);
                          if (p.paths.has(U)) {
                            _ = !0;
                            break;
                          }
                          const Y = w.substring(
                            k + 1
                          );
                          if (!isNaN(Number(Y))) {
                            const M = U.lastIndexOf(".");
                            if (M !== -1) {
                              const C = U.substring(
                                0,
                                M
                              );
                              if (p.paths.has(C)) {
                                _ = !0;
                                break;
                              }
                            }
                          }
                          k = U.lastIndexOf(".");
                        }
                        if (_) break;
                      }
                    if (!_ && N.includes("deps") && p.depsFunction) {
                      const w = p.depsFunction(s);
                      let k = !1;
                      typeof w == "boolean" ? w && (k = !0) : q(p.deps, w) || (p.deps = w, k = !0), k && (_ = !0);
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
                const s = o.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([f]) => {
                  f && f.startsWith(d.key) && X(f);
                });
                const c = d.zodSchema.safeParse(r);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const E = u.path, p = u.message, _ = [d.key, ...E].join(".");
                  t(_, p);
                }), Ie(e), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => o().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => be.getState().getFormRefsByStateKey(e);
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
          return () => be.getState().getFormRef(e + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: t
          }) => /* @__PURE__ */ Ee(
            Be,
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
              He(() => {
                ie(i, d, n, "");
                const r = o.getState().getNestedState(e, n);
                t?.afterUpdate && t.afterUpdate(r);
              }, t.debounce);
            else {
              ie(i, d, n, "");
              const r = o.getState().getNestedState(e, n);
              t?.afterUpdate && t.afterUpdate(r);
            }
            O(n);
          };
        if (l === "formElement")
          return (d, t) => /* @__PURE__ */ Ee(
            Fe,
            {
              setState: i,
              stateKey: e,
              path: n,
              child: d,
              formOpts: t
            }
          );
        const P = [...n, l], ae = o.getState().getNestedState(e, P);
        return a(ae, P, S);
      }
    }, W = new Proxy(L, G);
    return I.set(F, {
      proxy: W,
      stateVersion: A
    }), W;
  }
  return a(
    o.getState().getNestedState(e, [])
  );
}
function Pe(e) {
  return le(nt, { proxy: e });
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
    (I, A, O, y, a) => e._mapFn(I, A, O, y, a)
  ) : null;
}
function nt({
  proxy: e
}) {
  const i = J(null), m = `${e._stateKey}-${e._path.join(".")}`;
  return oe(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const I = g.parentElement, O = Array.from(I.childNodes).indexOf(g);
    let y = I.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, I.setAttribute("data-parent-id", y));
    const h = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: O,
      effect: e._effect
    };
    o.getState().addSignalElement(m, h);
    const n = o.getState().getNestedState(e._stateKey, e._path);
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
  }, [e._stateKey, e._path.join("."), e._effect]), le("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function It(e) {
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
  return le("text", {}, String(i));
}
function rt({
  stateKey: e,
  itemComponentId: i,
  itemPath: m,
  children: g
}) {
  const [, I] = Q({}), [A, O] = qe(), y = J(null);
  return oe(() => {
    O.height > 0 && O.height !== y.current && (y.current = O.height, o.getState().setShadowMetadata(e, m, {
      virtualizer: {
        itemHeight: O.height
      }
    }));
  }, [O.height, e, m]), ce(() => {
    const a = `${e}////${i}`, h = o.getState().stateComponents.get(e) || {
      components: /* @__PURE__ */ new Map()
    };
    return h.components.set(a, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), o.getState().stateComponents.set(e, h), () => {
      const n = o.getState().stateComponents.get(e);
      n && n.components.delete(a);
    };
  }, [e, i, m.join(".")]), /* @__PURE__ */ Ee("div", { ref: A, children: g });
}
export {
  Pe as $cogsSignal,
  It as $cogsSignalStore,
  mt as addStateOptions,
  Tt as createCogsState,
  ht as notifyComponent,
  et as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
