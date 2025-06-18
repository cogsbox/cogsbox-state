"use client";
import { jsx as we } from "react/jsx-runtime";
import { useState as K, useRef as J, useEffect as oe, useLayoutEffect as le, useMemo as Oe, createElement as de, useSyncExternalStore as je, startTransition as He, useCallback as be } from "react";
import { transformStateFunc as Fe, isDeepEqual as q, isFunction as ee, getNestedValue as Z, getDifferences as _e, debounce as Be } from "./utility.js";
import { pushFunc as Ee, updateFn as ce, cutFunc as me, ValidationWrapper as We, FormControlComponent as ze } from "./Functions.jsx";
import qe from "superjson";
import { v4 as Ae } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Me } from "./store.js";
import { useCogsConfig as Le } from "./CogsStateClient.jsx";
import { applyPatch as Je } from "fast-json-patch";
import Ye from "react-use-measure";
function xe(e, i) {
  const m = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, T = m(e) || {};
  g(e, {
    ...T,
    ...i
  });
}
function Pe({
  stateKey: e,
  options: i,
  initialOptionsPart: m
}) {
  const g = re(e) || {}, T = m[e] || {}, A = o.getState().setInitialStateOptions, E = { ...T, ...g };
  let y = !1;
  if (i)
    for (const s in i)
      E.hasOwnProperty(s) ? (s == "localStorage" && i[s] && E[s].key !== i[s]?.key && (y = !0, E[s] = i[s]), s == "initialState" && i[s] && E[s] !== i[s] && // Different references
      !q(E[s], i[s]) && (y = !0, E[s] = i[s])) : (y = !0, E[s] = i[s]);
  y && A(e, E);
}
function It(e, { formElements: i, validation: m }) {
  return { initialState: e, formElements: i, validation: m };
}
const Tt = (e, i) => {
  let m = e;
  const [g, T] = Fe(m);
  (Object.keys(T).length > 0 || i && Object.keys(i).length > 0) && Object.keys(T).forEach((y) => {
    T[y] = T[y] || {}, T[y].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...T[y].formElements || {}
      // State-specific overrides
    }, re(y) || o.getState().setInitialStateOptions(y, T[y]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const A = (y, s) => {
    const [I] = K(s?.componentId ?? Ae());
    Pe({
      stateKey: y,
      options: s,
      initialOptionsPart: T
    });
    const n = o.getState().cogsStateStore[y] || g[y], S = s?.modifyState ? s.modifyState(n) : n, [B, L] = nt(
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
    return L;
  };
  function E(y, s) {
    Pe({ stateKey: y, options: s, initialOptionsPart: T }), s.localStorage && et(y, s), ve(y);
  }
  return { useCogsState: A, setCogsOptions: E };
}, {
  setUpdaterState: he,
  setState: ne,
  getInitialOptions: re,
  getKeyState: Re,
  getValidationErrors: Ze,
  setStateLog: Xe,
  updateInitialStateGlobal: Ne,
  addValidationError: Qe,
  removeValidationError: Q,
  setServerSyncActions: Ke
} = o.getState(), Ve = (e, i, m, g, T) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    g
  );
  const A = ee(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (A && g) {
    const E = `${g}-${i}-${A}`;
    let y;
    try {
      y = Te(E)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: T ?? y
    }, I = qe.serialize(s);
    window.localStorage.setItem(
      E,
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
}, et = (e, i) => {
  const m = o.getState().cogsStateStore[e], { sessionId: g } = Le(), T = ee(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (T && g) {
    const A = Te(
      `${g}-${e}-${T}`
    );
    if (A && A.lastUpdated > (A.lastSyncedWithServer || 0))
      return ne(e, A.state), ve(e), !0;
  }
  return !1;
}, De = (e, i, m, g, T, A) => {
  const E = {
    initialState: i,
    updaterState: Ie(
      e,
      g,
      T,
      A
    ),
    state: m
  };
  Ne(e, E.initialState), he(e, E.updaterState), ne(e, E.state);
}, ve = (e) => {
  const i = o.getState().stateComponents.get(e);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, vt = (e, i) => {
  const m = o.getState().stateComponents.get(e);
  if (m) {
    const g = `${e}////${i}`, T = m.components.get(g);
    if ((T ? Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"] : null)?.includes("none"))
      return;
    T && T.forceUpdate();
  }
}, tt = (e, i, m, g) => {
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
function nt(e, {
  stateKey: i,
  serverSync: m,
  localStorage: g,
  formElements: T,
  reactiveDeps: A,
  reactiveType: E,
  componentId: y,
  initialState: s,
  syncUpdate: I,
  dependencies: n,
  serverState: S
} = {}) {
  const [B, L] = K({}), { sessionId: R } = Le();
  let W = !i;
  const [h] = K(i ?? Ae()), l = o.getState().stateLog[h], ue = J(/* @__PURE__ */ new Set()), te = J(y ?? Ae()), P = J(
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
      xe(h, {
        initialState: s
      });
      const t = P.current, a = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = o.getState().initialStateGlobal[h];
      if (!(c && !q(c, s) || !c) && !a)
        return;
      let u = null;
      const w = ee(t?.localStorage?.key) ? t?.localStorage?.key(s) : t?.localStorage?.key;
      w && R && (u = Te(`${R}-${h}-${w}`));
      let p = s, O = !1;
      const N = a ? Date.now() : 0, _ = u?.lastUpdated || 0, k = u?.lastSyncedWithServer || 0;
      a && N > _ ? (p = t.serverState.data, O = !0) : u && _ > k && (p = u.state, t?.localStorage?.onChange && t?.localStorage?.onChange(p)), o.getState().initializeShadowState(h, s), De(
        h,
        s,
        p,
        ae,
        te.current,
        R
      ), O && w && R && Ve(p, h, t, R, Date.now()), ve(h), (Array.isArray(E) ? E : [E || "component"]).includes("none") || L({});
    }
  }, [
    s,
    S?.status,
    S?.data,
    ...n || []
  ]), le(() => {
    W && xe(h, {
      serverSync: m,
      formElements: T,
      initialState: s,
      localStorage: g,
      middleware: P.current?.middleware
    });
    const t = `${h}////${te.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(t, {
      forceUpdate: () => L({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: A || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), L({}), () => {
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
      const w = ee(t) ? t(u) : t, p = `${h}-${r.join(".")}`;
      if (p) {
        let b = !1, C = f.signalDomElements.get(p);
        if ((!C || C.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const V = r.slice(0, -1), D = Z(w, V);
          if (Array.isArray(D)) {
            b = !0;
            const v = `${h}-${V.join(".")}`;
            C = f.signalDomElements.get(v);
          }
        }
        if (C) {
          const V = b ? Z(w, r.slice(0, -1)) : Z(w, r);
          C.forEach(({ parentId: D, position: v, effect: U }) => {
            const $ = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if ($) {
              const z = Array.from($.childNodes);
              if (z[v]) {
                const H = U ? new Function("state", `return (${U})(state)`)(V) : V;
                z[v].textContent = String(H);
              }
            }
          });
        }
      }
      console.log("shadowState", f.shadowStateStore), a.updateType === "update" && (c || P.current?.validation?.key) && r && Q(
        (c || P.current?.validation?.key) + "." + r.join(".")
      );
      const O = r.slice(0, r.length - 1);
      a.updateType === "cut" && P.current?.validation?.key && Q(
        P.current?.validation?.key + "." + O.join(".")
      ), a.updateType === "insert" && P.current?.validation?.key && Ze(
        P.current?.validation?.key + "." + O.join(".")
      ).filter(([C, V]) => {
        let D = C?.split(".").length;
        if (C == O.join(".") && D == O.length - 1) {
          let v = C + "." + O;
          Q(C), Qe(v, V);
        }
      });
      const N = f.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", N), N) {
        const b = _e(u, w), C = new Set(b), V = a.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          D,
          v
        ] of N.components.entries()) {
          let U = !1;
          const $ = Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"];
          if (console.log("component", v), !$.includes("none")) {
            if ($.includes("all")) {
              v.forceUpdate();
              continue;
            }
            if ($.includes("component") && ((v.paths.has(V) || v.paths.has("")) && (U = !0), !U))
              for (const z of C) {
                let H = z;
                for (; ; ) {
                  if (v.paths.has(H)) {
                    U = !0;
                    break;
                  }
                  const se = H.lastIndexOf(".");
                  if (se !== -1) {
                    const ge = H.substring(
                      0,
                      se
                    );
                    if (!isNaN(
                      Number(H.substring(se + 1))
                    ) && v.paths.has(ge)) {
                      U = !0;
                      break;
                    }
                    H = ge;
                  } else
                    H = "";
                  if (H === "")
                    break;
                }
                if (U) break;
              }
            if (!U && $.includes("deps") && v.depsFunction) {
              const z = v.depsFunction(w);
              let H = !1;
              typeof z == "boolean" ? z && (H = !0) : q(v.deps, z) || (v.deps = z, H = !0), H && (U = !0);
            }
            U && v.forceUpdate();
          }
        }
      }
      const _ = Date.now();
      r = r.map((b, C) => {
        const V = r.slice(0, -1), D = Z(w, V);
        return C === r.length - 1 && ["insert", "cut"].includes(a.updateType) ? (D.length - 1).toString() : b;
      });
      const { oldValue: k, newValue: j } = tt(
        a.updateType,
        u,
        w,
        r
      ), Y = {
        timeStamp: _,
        stateKey: h,
        path: r,
        updateType: a.updateType,
        status: "new",
        oldValue: k,
        newValue: j
      };
      switch (a.updateType) {
        case "update":
          f.updateShadowAtPath(h, r, w);
          break;
        case "insert":
          const b = r.slice(0, -1);
          f.insertShadowArrayElement(h, b, j);
          break;
        case "cut":
          const C = r.slice(0, -1), V = parseInt(r[r.length - 1]);
          f.removeShadowArrayElement(h, C, V);
          break;
      }
      if (Xe(h, (b) => {
        const V = [...b ?? [], Y].reduce((D, v) => {
          const U = `${v.stateKey}:${JSON.stringify(v.path)}`, $ = D.get(U);
          return $ ? ($.timeStamp = Math.max($.timeStamp, v.timeStamp), $.newValue = v.newValue, $.oldValue = $.oldValue ?? v.oldValue, $.updateType = v.updateType) : D.set(U, { ...v }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), Ve(
        w,
        h,
        P.current,
        R
      ), P.current?.middleware && P.current.middleware({
        updateLog: l,
        update: Y
      }), P.current?.serverSync) {
        const b = f.serverState[h], C = P.current?.serverSync;
        Ke(h, {
          syncKey: typeof C.syncKey == "string" ? C.syncKey : C.syncKey({ state: w }),
          rollBackState: b,
          actionTimeStamp: Date.now() + (C.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return w;
    });
  };
  o.getState().updaterState[h] || (he(
    h,
    Ie(
      h,
      ae,
      te.current,
      R
    )
  ), o.getState().cogsStateStore[h] || ne(h, e), o.getState().initialStateGlobal[h] || Ne(h, e));
  const d = Oe(() => Ie(
    h,
    ae,
    te.current,
    R
  ), [h, R]);
  return [Re(h), d];
}
function Ie(e, i, m, g) {
  const T = /* @__PURE__ */ new Map();
  let A = 0;
  const E = (I) => {
    const n = I.join(".");
    for (const [S] of T)
      (S === n || S.startsWith(n + ".")) && T.delete(S);
    A++;
  }, y = {
    removeValidation: (I) => {
      I?.validationKey && Q(I.validationKey);
    },
    revertToInitialState: (I) => {
      const n = o.getState().getInitialOptions(e)?.validation;
      n?.key && Q(n?.key), I?.validationKey && Q(I.validationKey);
      const S = o.getState().initialStateGlobal[e];
      o.getState().clearSelectedIndexesForState(e), T.clear(), A++;
      const B = s(S, []), L = re(e), R = ee(L?.localStorage?.key) ? L?.localStorage?.key(S) : L?.localStorage?.key, W = `${g}-${e}-${R}`;
      W && localStorage.removeItem(W), he(e, B), ne(e, S);
      const h = o.getState().stateComponents.get(e);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (I) => {
      T.clear(), A++;
      const n = Ie(
        e,
        i,
        m,
        g
      ), S = o.getState().initialStateGlobal[e], B = re(e), L = ee(B?.localStorage?.key) ? B?.localStorage?.key(S) : B?.localStorage?.key, R = `${g}-${e}-${L}`;
      return localStorage.getItem(R) && localStorage.removeItem(R), He(() => {
        Ne(e, I), o.getState().initializeShadowState(e, I), he(e, n), ne(e, I);
        const W = o.getState().stateComponents.get(e);
        W && W.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (W) => n.get()[W]
      };
    },
    _initialState: o.getState().initialStateGlobal[e],
    _serverState: o.getState().serverState[e],
    _isLoading: o.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const I = o.getState().serverState[e];
      return !!(I && q(I, Re(e)));
    }
  };
  function s(I, n = [], S) {
    const B = n.map(String).join(".");
    T.get(B);
    const L = function() {
      return o().getNestedState(e, n);
    };
    Object.keys(y).forEach((h) => {
      L[h] = y[h];
    });
    const R = {
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
                  const w = [a, ...u.path].join(".");
                  o.getState().addValidationError(w, u.message);
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
            const d = o.getState().initialStateGlobal[e], t = re(e), r = ee(t?.localStorage?.key) ? t?.localStorage?.key(d) : t?.localStorage?.key, a = `${g}-${e}-${r}`;
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
              } = t, u = J(!1), w = J(null), [p, O] = K({
                startIndex: 0,
                endIndex: 10
              }), [N, _] = K("IDLE_AT_TOP"), k = J(!1), j = J(0), Y = J(f), b = J(0), [C, V] = K(0);
              oe(() => o.getState().subscribeToShadowState(e, () => {
                V((x) => x + 1);
              }), [e]);
              const D = o().getNestedState(
                e,
                n
              ), v = D.length, { totalHeight: U, positions: $ } = Oe(() => {
                const M = o.getState().getShadowMetadata(e, n) || [];
                let x = 0;
                const F = [];
                for (let G = 0; G < v; G++) {
                  F[G] = x;
                  const X = M[G]?.virtualizer?.itemHeight;
                  x += X || r;
                }
                return { totalHeight: x, positions: F };
              }, [
                v,
                e,
                n.join("."),
                r,
                C
              ]), z = Oe(() => {
                const M = Math.max(0, p.startIndex), x = Math.min(v, p.endIndex), F = Array.from(
                  { length: x - M },
                  (X, ie) => M + ie
                ), G = F.map((X) => D[X]);
                return s(G, n, {
                  ...S,
                  validIndices: F
                });
              }, [p.startIndex, p.endIndex, D, v]);
              le(() => {
                const M = !q(
                  f,
                  Y.current
                ), x = v > j.current;
                if (M) {
                  console.log("TRANSITION: Deps changed -> IDLE_AT_TOP"), _("IDLE_AT_TOP");
                  return;
                }
                x && N === "LOCKED_AT_BOTTOM" && c && (console.log(
                  "TRANSITION: New items arrived while locked -> GETTING_HEIGHTS"
                ), _("GETTING_HEIGHTS")), j.current = v, Y.current = f;
              }, [v, ...f]), le(() => {
                const M = w.current;
                if (!M) return;
                let x;
                if (N === "IDLE_AT_TOP" && c && v > 0)
                  console.log(
                    "ACTION (IDLE_AT_TOP): Data has arrived -> GETTING_HEIGHTS"
                  ), _("GETTING_HEIGHTS");
                else if (N === "GETTING_HEIGHTS")
                  console.log(
                    "ACTION (GETTING_HEIGHTS): Setting range to end and starting loop."
                  ), O({
                    startIndex: Math.max(0, v - 10 - a),
                    endIndex: v
                  }), x = setInterval(() => {
                    const F = v - 1;
                    ((o.getState().getShadowMetadata(e, n) || [])[F]?.virtualizer?.itemHeight || 0) > 0 && (clearInterval(x), u.current || (console.log(
                      "ACTION (GETTING_HEIGHTS): Measurement success -> SCROLLING_TO_BOTTOM"
                    ), _("SCROLLING_TO_BOTTOM")));
                  }, 100);
                else if (N === "SCROLLING_TO_BOTTOM") {
                  console.log(
                    "ACTION (SCROLLING_TO_BOTTOM): Executing scroll."
                  ), k.current = !0;
                  const F = j.current === 0 ? "auto" : "smooth";
                  M.scrollTo({
                    top: M.scrollHeight,
                    behavior: F
                  });
                  const G = setTimeout(
                    () => {
                      console.log(
                        "ACTION (SCROLLING_TO_BOTTOM): Scroll finished -> LOCKED_AT_BOTTOM"
                      ), k.current = !1, u.current = !1, _("LOCKED_AT_BOTTOM");
                    },
                    F === "smooth" ? 500 : 50
                  );
                  return () => clearTimeout(G);
                }
                return () => {
                  x && clearInterval(x);
                };
              }, [N, v, $]), oe(() => {
                const M = w.current;
                if (!M) return;
                const x = r, F = () => {
                  if (k.current)
                    return;
                  const { scrollTop: G, scrollHeight: X, clientHeight: ie } = M;
                  console.log(
                    "scrollTop, scrollHeight, clientHeight ",
                    G,
                    X,
                    ie
                  );
                  const Ce = X - G - ie < 10;
                  if (console.log("isAtBottom", Ce), Ce ? N !== "LOCKED_AT_BOTTOM" && _("LOCKED_AT_BOTTOM") : N !== "IDLE_NOT_AT_BOTTOM" && _("IDLE_NOT_AT_BOTTOM"), Math.abs(G - b.current) < x)
                    return;
                  console.log(
                    `Threshold passed at ${G}px. Recalculating range...`
                  );
                  let ye = v - 1, pe = 0, $e = 0;
                  for (; pe <= ye; ) {
                    const Se = Math.floor((pe + ye) / 2);
                    $[Se] < G ? ($e = Se, pe = Se + 1) : ye = Se - 1;
                  }
                  const ke = Math.max(0, $e - a);
                  let fe = ke;
                  const Ue = G + ie;
                  for (; fe < v && $[fe] < Ue; )
                    fe++;
                  O({
                    startIndex: ke,
                    endIndex: Math.min(v, fe + a)
                  }), b.current = G;
                };
                return M.addEventListener("scroll", F, {
                  passive: !0
                }), () => M.removeEventListener("scroll", F);
              }, [v, $, r, a, N]);
              const H = be(() => {
                console.log(
                  "USER ACTION: Clicked scroll button -> SCROLLING_TO_BOTTOM"
                ), _("SCROLLING_TO_BOTTOM");
              }, []), se = be(
                (M, x = "smooth") => {
                  w.current && $[M] !== void 0 && (_("IDLE_NOT_AT_BOTTOM"), w.current.scrollTo({
                    top: $[M],
                    behavior: x
                  }));
                },
                [$]
              ), ge = {
                outer: {
                  ref: w,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${U}px`,
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
                scrollToBottom: H,
                scrollToIndex: se
              };
            };
          if (l === "stateSort")
            return (t) => {
              const a = [...d()].sort(
                (u, w) => t(u.item, w.item)
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
                ({ item: u }, w) => t(u, w)
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
                const u = r[c], w = [...n, c.toString()], p = s(u, w, S);
                return t(u, p, {
                  register: () => {
                    const [, N] = K({}), _ = `${m}-${n.join(".")}-${c}`;
                    le(() => {
                      const k = `${e}////${_}`, j = o.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return j.components.set(k, {
                        forceUpdate: () => N({}),
                        paths: /* @__PURE__ */ new Set([w.join(".")])
                      }), o.getState().stateComponents.set(e, j), () => {
                        const Y = o.getState().stateComponents.get(e);
                        Y && Y.components.delete(k);
                      };
                    }, [e, _]);
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
              const u = [...n, f.toString()], w = s(a, u, S);
              return t(
                a,
                w,
                c,
                I,
                s(I, n, S)
              );
            });
          if (l === "$stateMap")
            return (t) => de(rt, {
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
                const u = r[c], w = [...n, c.toString()], p = s(u, w, S), O = `${m}-${n.join(".")}-${c}`;
                return de(at, {
                  key: c,
                  stateKey: e,
                  itemComponentId: O,
                  itemPath: w,
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
              T.clear(), A++;
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
            return (t) => (E(n), Ee(i, t, n, e), s(
              o.getState().getNestedState(e, n),
              n
            ));
          if (l === "uniqueInsert")
            return (t, r, a) => {
              const c = o.getState().getNestedState(e, n), f = ee(t) ? t(c) : t;
              let u = null;
              if (!c.some((p) => {
                if (r) {
                  const N = r.every(
                    (_) => q(p[_], f[_])
                  );
                  return N && (u = p), N;
                }
                const O = q(p, f);
                return O && (u = p), O;
              }))
                E(n), Ee(i, f, n, e);
              else if (a && u) {
                const p = a(u), O = c.map(
                  (N) => q(N, u) ? p : N
                );
                E(n), ce(i, O, n);
              }
            };
          if (l === "cut")
            return (t, r) => {
              if (!r?.waitForSync)
                return E(n), me(i, n, e, t), s(
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
              r > -1 ? me(i, n, e, r) : Ee(i, t, n, e);
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
        const te = n[n.length - 1];
        if (!isNaN(Number(te))) {
          const d = n.slice(0, -1), t = o.getState().getNestedState(e, d);
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
            if (S?.validIndices && Array.isArray(I)) {
              const d = o.getState().getNestedState(e, n);
              return S.validIndices.map((t) => d[t]);
            }
            return o.getState().getNestedState(e, n);
          };
        if (l === "$derive")
          return (d) => Ge({
            _stateKey: e,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Ge({
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
            ce(i, c, t), E(t);
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
            ce(i, c, d), E(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const t = o.getState().cogsStateStore[e], a = Je(t, d).newDocument;
              De(
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
                  w,
                  p
                ] of c.components.entries()) {
                  let O = !1;
                  const N = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!N.includes("none")) {
                    if (N.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (N.includes("component") && (p.paths.has("") && (O = !0), !O))
                      for (const _ of u) {
                        if (p.paths.has(_)) {
                          O = !0;
                          break;
                        }
                        let k = _.lastIndexOf(".");
                        for (; k !== -1; ) {
                          const j = _.substring(0, k);
                          if (p.paths.has(j)) {
                            O = !0;
                            break;
                          }
                          const Y = _.substring(
                            k + 1
                          );
                          if (!isNaN(Number(Y))) {
                            const b = j.lastIndexOf(".");
                            if (b !== -1) {
                              const C = j.substring(
                                0,
                                b
                              );
                              if (p.paths.has(C)) {
                                O = !0;
                                break;
                              }
                            }
                          }
                          k = j.lastIndexOf(".");
                        }
                        if (O) break;
                      }
                    if (!O && N.includes("deps") && p.depsFunction) {
                      const _ = p.depsFunction(a);
                      let k = !1;
                      typeof _ == "boolean" ? _ && (k = !0) : q(p.deps, _) || (p.deps = _, k = !0), k && (O = !0);
                    }
                    O && p.forceUpdate();
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
              Q(d.key);
              const r = o.getState().cogsStateStore[e];
              try {
                const a = o.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([f]) => {
                  f && f.startsWith(d.key) && Q(f);
                });
                const c = d.zodSchema.safeParse(r);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const w = u.path, p = u.message, O = [d.key, ...w].join(".");
                  t(O, p);
                }), ve(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => o().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => Me.getState().getFormRefsByStateKey(e);
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
          return () => Me.getState().getFormRef(e + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: t
          }) => /* @__PURE__ */ we(
            We,
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
              Be(() => {
                ce(i, d, n, "");
                const r = o.getState().getNestedState(e, n);
                t?.afterUpdate && t.afterUpdate(r);
              }, t.debounce);
            else {
              ce(i, d, n, "");
              const r = o.getState().getNestedState(e, n);
              t?.afterUpdate && t.afterUpdate(r);
            }
            E(n);
          };
        if (l === "formElement")
          return (d, t) => /* @__PURE__ */ we(
            ze,
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
    }, W = new Proxy(L, R);
    return T.set(B, {
      proxy: W,
      stateVersion: A
    }), W;
  }
  return s(
    o.getState().getNestedState(e, [])
  );
}
function Ge(e) {
  return de(ot, { proxy: e });
}
function rt({
  proxy: e,
  rebuildStateShape: i
}) {
  const m = o().getNestedState(e._stateKey, e._path);
  return Array.isArray(m) ? i(
    m,
    e._path
  ).stateMapNoRender(
    (T, A, E, y, s) => e._mapFn(T, A, E, y, s)
  ) : null;
}
function ot({
  proxy: e
}) {
  const i = J(null), m = `${e._stateKey}-${e._path.join(".")}`;
  return oe(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const T = g.parentElement, E = Array.from(T.childNodes).indexOf(g);
    let y = T.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, T.setAttribute("data-parent-id", y));
    const I = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: E,
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
      } catch (L) {
        console.error("Error evaluating effect function during mount:", L), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const B = document.createTextNode(String(S));
    g.replaceWith(B);
  }, [e._stateKey, e._path.join("."), e._effect]), de("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function yt(e) {
  const i = je(
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
function at({
  stateKey: e,
  itemComponentId: i,
  itemPath: m,
  children: g
}) {
  const [, T] = K({}), [A, E] = Ye(), y = J(null);
  return oe(() => {
    E.height > 0 && E.height !== y.current && (y.current = E.height, o.getState().setShadowMetadata(e, m, {
      virtualizer: {
        itemHeight: E.height
      }
    }));
  }, [E.height, e, m]), le(() => {
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
  }, [e, i, m.join(".")]), /* @__PURE__ */ we("div", { ref: A, children: g });
}
export {
  Ge as $cogsSignal,
  yt as $cogsSignalStore,
  It as addStateOptions,
  Tt as createCogsState,
  vt as notifyComponent,
  nt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
