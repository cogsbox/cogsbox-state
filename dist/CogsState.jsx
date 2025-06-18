"use client";
import { jsx as wt } from "react/jsx-runtime";
import { useState as Q, useRef as J, useEffect as ot, useLayoutEffect as ct, useMemo as Ot, createElement as lt, useSyncExternalStore as Ut, startTransition as jt, useCallback as kt } from "react";
import { transformStateFunc as Ht, isDeepEqual as q, isFunction as K, getNestedValue as Z, getDifferences as _t, debounce as Ft } from "./utility.js";
import { pushFunc as Et, updateFn as it, cutFunc as mt, ValidationWrapper as Bt, FormControlComponent as Wt } from "./Functions.jsx";
import zt from "superjson";
import { v4 as At } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as bt } from "./store.js";
import { useCogsConfig as Gt } from "./CogsStateClient.jsx";
import { applyPatch as qt } from "fast-json-patch";
import Jt from "react-use-measure";
function Mt(t, i) {
  const m = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, T = m(t) || {};
  g(t, {
    ...T,
    ...i
  });
}
function xt({
  stateKey: t,
  options: i,
  initialOptionsPart: m
}) {
  const g = rt(t) || {}, T = m[t] || {}, A = o.getState().setInitialStateOptions, E = { ...T, ...g };
  let y = !1;
  if (i)
    for (const s in i)
      E.hasOwnProperty(s) ? (s == "localStorage" && i[s] && E[s].key !== i[s]?.key && (y = !0, E[s] = i[s]), s == "initialState" && i[s] && E[s] !== i[s] && // Different references
      !q(E[s], i[s]) && (y = !0, E[s] = i[s])) : (y = !0, E[s] = i[s]);
  y && A(t, E);
}
function Ie(t, { formElements: i, validation: m }) {
  return { initialState: t, formElements: i, validation: m };
}
const Te = (t, i) => {
  let m = t;
  const [g, T] = Ht(m);
  (Object.keys(T).length > 0 || i && Object.keys(i).length > 0) && Object.keys(T).forEach((y) => {
    T[y] = T[y] || {}, T[y].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...T[y].formElements || {}
      // State-specific overrides
    }, rt(y) || o.getState().setInitialStateOptions(y, T[y]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const A = (y, s) => {
    const [I] = Q(s?.componentId ?? At());
    xt({
      stateKey: y,
      options: s,
      initialOptionsPart: T
    });
    const n = o.getState().cogsStateStore[y] || g[y], S = s?.modifyState ? s.modifyState(n) : n, [B, G] = ee(
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
  function E(y, s) {
    xt({ stateKey: y, options: s, initialOptionsPart: T }), s.localStorage && Kt(y, s), vt(y);
  }
  return { useCogsState: A, setCogsOptions: E };
}, {
  setUpdaterState: ht,
  setState: nt,
  getInitialOptions: rt,
  getKeyState: Lt,
  getValidationErrors: Yt,
  setStateLog: Zt,
  updateInitialStateGlobal: Nt,
  addValidationError: Xt,
  removeValidationError: X,
  setServerSyncActions: Qt
} = o.getState(), Pt = (t, i, m, g, T) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    g
  );
  const A = K(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (A && g) {
    const E = `${g}-${i}-${A}`;
    let y;
    try {
      y = Tt(E)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: T ?? y
    }, I = zt.serialize(s);
    window.localStorage.setItem(
      E,
      JSON.stringify(I.json)
    );
  }
}, Tt = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Kt = (t, i) => {
  const m = o.getState().cogsStateStore[t], { sessionId: g } = Gt(), T = K(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (T && g) {
    const A = Tt(
      `${g}-${t}-${T}`
    );
    if (A && A.lastUpdated > (A.lastSyncedWithServer || 0))
      return nt(t, A.state), vt(t), !0;
  }
  return !1;
}, Rt = (t, i, m, g, T, A) => {
  const E = {
    initialState: i,
    updaterState: It(
      t,
      g,
      T,
      A
    ),
    state: m
  };
  Nt(t, E.initialState), ht(t, E.updaterState), nt(t, E.state);
}, vt = (t) => {
  const i = o.getState().stateComponents.get(t);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, ve = (t, i) => {
  const m = o.getState().stateComponents.get(t);
  if (m) {
    const g = `${t}////${i}`, T = m.components.get(g);
    if ((T ? Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"] : null)?.includes("none"))
      return;
    T && T.forceUpdate();
  }
}, te = (t, i, m, g) => {
  switch (t) {
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
function ee(t, {
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
  const [B, G] = Q({}), { sessionId: L } = Gt();
  let W = !i;
  const [h] = Q(i ?? At()), l = o.getState().stateLog[h], dt = J(/* @__PURE__ */ new Set()), tt = J(y ?? At()), P = J(
    null
  );
  P.current = rt(h) ?? null, ot(() => {
    if (I && I.stateKey === h && I.path?.[0]) {
      nt(h, (r) => ({
        ...r,
        [I.path[0]]: I.newValue
      }));
      const e = `${I.stateKey}:${I.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: I.timeStamp,
        userId: I.userId
      });
    }
  }, [I]), ot(() => {
    if (s) {
      Mt(h, {
        initialState: s
      });
      const e = P.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = o.getState().initialStateGlobal[h];
      if (!(c && !q(c, s) || !c) && !a)
        return;
      let u = null;
      const w = K(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      w && L && (u = Tt(`${L}-${h}-${w}`));
      let p = s, O = !1;
      const N = a ? Date.now() : 0, _ = u?.lastUpdated || 0, k = u?.lastSyncedWithServer || 0;
      a && N > _ ? (p = e.serverState.data, O = !0) : u && _ > k && (p = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), o.getState().initializeShadowState(h, s), Rt(
        h,
        s,
        p,
        at,
        tt.current,
        L
      ), O && w && L && Pt(p, h, e, L, Date.now()), vt(h), (Array.isArray(E) ? E : [E || "component"]).includes("none") || G({});
    }
  }, [
    s,
    S?.status,
    S?.data,
    ...n || []
  ]), ct(() => {
    W && Mt(h, {
      serverSync: m,
      formElements: T,
      initialState: s,
      localStorage: g,
      middleware: P.current?.middleware
    });
    const e = `${h}////${tt.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => G({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: A || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), G({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const at = (e, r, a, c) => {
    if (Array.isArray(r)) {
      const u = `${h}-${r.join(".")}`;
      dt.current.add(u);
    }
    const f = o.getState();
    nt(h, (u) => {
      const w = K(e) ? e(u) : e, p = `${h}-${r.join(".")}`;
      if (p) {
        let b = !1, C = f.signalDomElements.get(p);
        if ((!C || C.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const V = r.slice(0, -1), R = Z(w, V);
          if (Array.isArray(R)) {
            b = !0;
            const v = `${h}-${V.join(".")}`;
            C = f.signalDomElements.get(v);
          }
        }
        if (C) {
          const V = b ? Z(w, r.slice(0, -1)) : Z(w, r);
          C.forEach(({ parentId: R, position: v, effect: D }) => {
            const $ = document.querySelector(
              `[data-parent-id="${R}"]`
            );
            if ($) {
              const z = Array.from($.childNodes);
              if (z[v]) {
                const H = D ? new Function("state", `return (${D})(state)`)(V) : V;
                z[v].textContent = String(H);
              }
            }
          });
        }
      }
      console.log("shadowState", f.shadowStateStore), a.updateType === "update" && (c || P.current?.validation?.key) && r && X(
        (c || P.current?.validation?.key) + "." + r.join(".")
      );
      const O = r.slice(0, r.length - 1);
      a.updateType === "cut" && P.current?.validation?.key && X(
        P.current?.validation?.key + "." + O.join(".")
      ), a.updateType === "insert" && P.current?.validation?.key && Yt(
        P.current?.validation?.key + "." + O.join(".")
      ).filter(([C, V]) => {
        let R = C?.split(".").length;
        if (C == O.join(".") && R == O.length - 1) {
          let v = C + "." + O;
          X(C), Xt(v, V);
        }
      });
      const N = f.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", N), N) {
        const b = _t(u, w), C = new Set(b), V = a.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
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
                let H = z;
                for (; ; ) {
                  if (v.paths.has(H)) {
                    D = !0;
                    break;
                  }
                  const st = H.lastIndexOf(".");
                  if (st !== -1) {
                    const ut = H.substring(
                      0,
                      st
                    );
                    if (!isNaN(
                      Number(H.substring(st + 1))
                    ) && v.paths.has(ut)) {
                      D = !0;
                      break;
                    }
                    H = ut;
                  } else
                    H = "";
                  if (H === "")
                    break;
                }
                if (D) break;
              }
            if (!D && $.includes("deps") && v.depsFunction) {
              const z = v.depsFunction(w);
              let H = !1;
              typeof z == "boolean" ? z && (H = !0) : q(v.deps, z) || (v.deps = z, H = !0), H && (D = !0);
            }
            D && v.forceUpdate();
          }
        }
      }
      const _ = Date.now();
      r = r.map((b, C) => {
        const V = r.slice(0, -1), R = Z(w, V);
        return C === r.length - 1 && ["insert", "cut"].includes(a.updateType) ? (R.length - 1).toString() : b;
      });
      const { oldValue: k, newValue: j } = te(
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
      if (Zt(h, (b) => {
        const V = [...b ?? [], Y].reduce((R, v) => {
          const D = `${v.stateKey}:${JSON.stringify(v.path)}`, $ = R.get(D);
          return $ ? ($.timeStamp = Math.max($.timeStamp, v.timeStamp), $.newValue = v.newValue, $.oldValue = $.oldValue ?? v.oldValue, $.updateType = v.updateType) : R.set(D, { ...v }), R;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), Pt(
        w,
        h,
        P.current,
        L
      ), P.current?.middleware && P.current.middleware({
        updateLog: l,
        update: Y
      }), P.current?.serverSync) {
        const b = f.serverState[h], C = P.current?.serverSync;
        Qt(h, {
          syncKey: typeof C.syncKey == "string" ? C.syncKey : C.syncKey({ state: w }),
          rollBackState: b,
          actionTimeStamp: Date.now() + (C.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return w;
    });
  };
  o.getState().updaterState[h] || (ht(
    h,
    It(
      h,
      at,
      tt.current,
      L
    )
  ), o.getState().cogsStateStore[h] || nt(h, t), o.getState().initialStateGlobal[h] || Nt(h, t));
  const d = Ot(() => It(
    h,
    at,
    tt.current,
    L
  ), [h, L]);
  return [Lt(h), d];
}
function It(t, i, m, g) {
  const T = /* @__PURE__ */ new Map();
  let A = 0;
  const E = (I) => {
    const n = I.join(".");
    for (const [S] of T)
      (S === n || S.startsWith(n + ".")) && T.delete(S);
    A++;
  }, y = {
    removeValidation: (I) => {
      I?.validationKey && X(I.validationKey);
    },
    revertToInitialState: (I) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && X(n?.key), I?.validationKey && X(I.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), T.clear(), A++;
      const B = s(S, []), G = rt(t), L = K(G?.localStorage?.key) ? G?.localStorage?.key(S) : G?.localStorage?.key, W = `${g}-${t}-${L}`;
      W && localStorage.removeItem(W), ht(t, B), nt(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (I) => {
      T.clear(), A++;
      const n = It(
        t,
        i,
        m,
        g
      ), S = o.getState().initialStateGlobal[t], B = rt(t), G = K(B?.localStorage?.key) ? B?.localStorage?.key(S) : B?.localStorage?.key, L = `${g}-${t}-${G}`;
      return localStorage.getItem(L) && localStorage.removeItem(L), jt(() => {
        Nt(t, I), o.getState().initializeShadowState(t, I), ht(t, n), nt(t, I);
        const W = o.getState().stateComponents.get(t);
        W && W.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (W) => n.get()[W]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const I = o.getState().serverState[t];
      return !!(I && q(I, Lt(t)));
    }
  };
  function s(I, n = [], S) {
    const B = n.map(String).join(".");
    T.get(B);
    const G = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(y).forEach((h) => {
      G[h] = y[h];
    });
    const L = {
      apply(h, l, dt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(I) && (S = { ...S, validIndices: void 0 });
        const dt = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !dt.has(l)) {
          const d = `${t}////${m}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const r = e.components.get(d);
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
          return () => _t(
            o.getState().cogsStateStore[t],
            o.getState().initialStateGlobal[t]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const d = o.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const r = o.getState().getNestedState(t, []), a = d?.validation?.key;
            try {
              const c = await e.action(r);
              if (c && !c.success && c.errors && a) {
                o.getState().removeValidationError(a), c.errors.forEach((u) => {
                  const w = [a, ...u.path].join(".");
                  o.getState().addValidationError(w, u.message);
                });
                const f = o.getState().stateComponents.get(t);
                f && f.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return c?.success && e.onSuccess ? e.onSuccess(c.data) : !c?.success && e.onError && e.onError(c.error), c;
            } catch (c) {
              return e.onError && e.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = Z(e, n);
          return q(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = Z(e, n);
            return q(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = rt(t), r = K(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${g}-${t}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(I)) {
          const d = () => S?.validIndices ? I.map((r, a) => ({
            item: r,
            originalIndex: S.validIndices[a]
          })) : o.getState().getNestedState(t, n).map((r, a) => ({
            item: r,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const e = o.getState().getSelectedIndex(t, n.join("."));
              if (e !== void 0)
                return s(
                  I[e],
                  [...n, e.toString()],
                  S
                );
            };
          if (l === "clearSelected")
            return () => {
              o.getState().clearSelectedIndex({ stateKey: t, path: n });
            };
          if (l === "getSelectedIndex")
            return () => o.getState().getSelectedIndex(t, n.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (e) => {
              const {
                itemHeight: r = 50,
                overscan: a = 6,
                stickToBottom: c = !1,
                dependencies: f = []
              } = e, u = J(!1), w = J(null), [p, O] = Q({
                startIndex: 0,
                endIndex: 10
              }), [N, _] = Q("IDLE_AT_TOP"), k = J(!1), j = J(0), Y = J(f), b = J(0), [C, V] = Q(0);
              ot(() => o.getState().subscribeToShadowState(t, () => {
                V((x) => x + 1);
              }), [t]);
              const R = o().getNestedState(
                t,
                n
              ), v = R.length, { totalHeight: D, positions: $ } = Ot(() => {
                const M = o.getState().getShadowMetadata(t, n) || [];
                let x = 0;
                const F = [];
                for (let U = 0; U < v; U++) {
                  F[U] = x;
                  const et = M[U]?.virtualizer?.itemHeight;
                  x += et || r;
                }
                return { totalHeight: x, positions: F };
              }, [
                v,
                t,
                n.join("."),
                r,
                C
              ]), z = Ot(() => {
                const M = Math.max(0, p.startIndex), x = Math.min(v, p.endIndex), F = Array.from(
                  { length: x - M },
                  (et, gt) => M + gt
                ), U = F.map((et) => R[et]);
                return s(U, n, {
                  ...S,
                  validIndices: F
                });
              }, [p.startIndex, p.endIndex, R, v]);
              ct(() => {
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
              }, [v, ...f]), ct(() => {
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
                    ((o.getState().getShadowMetadata(t, n) || [])[F]?.virtualizer?.itemHeight || 0) > 0 && (clearInterval(x), u.current || (console.log(
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
                  const U = setTimeout(
                    () => {
                      console.log(
                        "ACTION (SCROLLING_TO_BOTTOM): Scroll finished -> LOCKED_AT_BOTTOM"
                      ), k.current = !1, u.current = !1, _("LOCKED_AT_BOTTOM");
                    },
                    F === "smooth" ? 500 : 50
                  );
                  return () => clearTimeout(U);
                }
                return () => {
                  x && clearInterval(x);
                };
              }, [N, v, $]), ot(() => {
                const M = w.current;
                if (!M) return;
                const x = r, F = () => {
                  if (k.current)
                    return;
                  const { scrollTop: U, scrollHeight: et, clientHeight: gt } = M;
                  if (et - U - gt < 10 ? N !== "LOCKED_AT_BOTTOM" && _("LOCKED_AT_BOTTOM") : N !== "IDLE_NOT_AT_BOTTOM" && _("IDLE_NOT_AT_BOTTOM"), Math.abs(U - b.current) < x)
                    return;
                  console.log(
                    `Threshold passed at ${U}px. Recalculating range...`
                  );
                  let yt = v - 1, pt = 0, Ct = 0;
                  for (; pt <= yt; ) {
                    const St = Math.floor((pt + yt) / 2);
                    $[St] < U ? (Ct = St, pt = St + 1) : yt = St - 1;
                  }
                  const $t = Math.max(0, Ct - a);
                  let ft = $t;
                  const Dt = U + gt;
                  for (; ft < v && $[ft] < Dt; )
                    ft++;
                  O({
                    startIndex: $t,
                    endIndex: Math.min(v, ft + a)
                  }), b.current = U;
                };
                return M.addEventListener("scroll", F, {
                  passive: !0
                }), () => M.removeEventListener("scroll", F);
              }, [v, $, r, a, N]);
              const H = kt(() => {
                console.log(
                  "USER ACTION: Clicked scroll button -> SCROLLING_TO_BOTTOM"
                ), _("SCROLLING_TO_BOTTOM");
              }, []), st = kt(
                (M, x = "smooth") => {
                  w.current && $[M] !== void 0 && (_("IDLE_NOT_AT_BOTTOM"), w.current.scrollTo({
                    top: $[M],
                    behavior: x
                  }));
                },
                [$]
              ), ut = {
                outer: {
                  ref: w,
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
                virtualizerProps: ut,
                scrollToBottom: H,
                scrollToIndex: st
              };
            };
          if (l === "stateSort")
            return (e) => {
              const a = [...d()].sort(
                (u, w) => e(u.item, w.item)
              ), c = a.map(({ item: u }) => u), f = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, n, f);
            };
          if (l === "stateFilter")
            return (e) => {
              const a = d().filter(
                ({ item: u }, w) => e(u, w)
              ), c = a.map(({ item: u }) => u), f = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, n, f);
            };
          if (l === "stateMap")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (c, f) => f)).map((c, f) => {
                const u = r[c], w = [...n, c.toString()], p = s(u, w, S);
                return e(u, p, {
                  register: () => {
                    const [, N] = Q({}), _ = `${m}-${n.join(".")}-${c}`;
                    ct(() => {
                      const k = `${t}////${_}`, j = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return j.components.set(k, {
                        forceUpdate: () => N({}),
                        paths: /* @__PURE__ */ new Set([w.join(".")])
                      }), o.getState().stateComponents.set(t, j), () => {
                        const Y = o.getState().stateComponents.get(t);
                        Y && Y.components.delete(k);
                      };
                    }, [t, _]);
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
            return (e) => I.map((a, c) => {
              let f;
              S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
              const u = [...n, f.toString()], w = s(a, u, S);
              return e(
                a,
                w,
                c,
                I,
                s(I, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => lt(ne, {
              proxy: {
                _stateKey: t,
                _path: n,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateList")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (c, f) => f)).map((c, f) => {
                const u = r[c], w = [...n, c.toString()], p = s(u, w, S), O = `${m}-${n.join(".")}-${c}`;
                return lt(oe, {
                  key: c,
                  stateKey: t,
                  itemComponentId: O,
                  itemPath: w,
                  children: e(
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
            return (e) => {
              const r = I;
              T.clear(), A++;
              const a = r.flatMap(
                (c) => c[e] ?? []
              );
              return s(
                a,
                [...n, "[*]", e],
                S
              );
            };
          if (l === "index")
            return (e) => {
              const r = I[e];
              return s(r, [...n, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = o.getState().getNestedState(t, n);
              if (e.length === 0) return;
              const r = e.length - 1, a = e[r], c = [...n, r.toString()];
              return s(a, c);
            };
          if (l === "insert")
            return (e) => (E(n), Et(i, e, n, t), s(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, a) => {
              const c = o.getState().getNestedState(t, n), f = K(e) ? e(c) : e;
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
                E(n), Et(i, f, n, t);
              else if (a && u) {
                const p = a(u), O = c.map(
                  (N) => q(N, u) ? p : N
                );
                E(n), it(i, O, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return E(n), mt(i, n, t, e), s(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < I.length; r++)
                I[r] === e && mt(i, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = I.findIndex((a) => a === e);
              r > -1 ? mt(i, n, t, r) : Et(i, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const a = d().find(
                ({ item: f }, u) => e(f, u)
              );
              if (!a) return;
              const c = [...n, a.originalIndex.toString()];
              return s(a.item, c, S);
            };
          if (l === "findWith")
            return (e, r) => {
              const c = d().find(
                ({ item: u }) => u[e] === r
              );
              if (!c) return;
              const f = [...n, c.originalIndex.toString()];
              return s(c.item, f, S);
            };
        }
        const tt = n[n.length - 1];
        if (!isNaN(Number(tt))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => mt(
              i,
              d,
              t,
              Number(tt)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(I)) {
              const d = o.getState().getNestedState(t, n);
              return S.validIndices.map((e) => d[e]);
            }
            return o.getState().getNestedState(t, n);
          };
        if (l === "$derive")
          return (d) => Vt({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Vt({
            _stateKey: t,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${t}:${n.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => Tt(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), a = e.join(".");
            d ? o.getState().setSelectedIndex(t, a, r) : o.getState().setSelectedIndex(t, a, void 0);
            const c = o.getState().getNestedState(t, [...e]);
            it(i, c, e), E(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), e = Number(n[n.length - 1]), r = d.join("."), a = o.getState().getSelectedIndex(t, r);
            o.getState().setSelectedIndex(
              t,
              r,
              a === e ? void 0 : e
            );
            const c = o.getState().getNestedState(t, [...d]);
            it(i, c, d), E(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], a = qt(e, d).newDocument;
              Rt(
                t,
                o.getState().initialStateGlobal[t],
                a,
                i,
                m,
                g
              );
              const c = o.getState().stateComponents.get(t);
              if (c) {
                const f = _t(e, a), u = new Set(f);
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
              const d = o.getState().getInitialOptions(t)?.validation, e = o.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              X(d.key);
              const r = o.getState().cogsStateStore[t];
              try {
                const a = o.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([f]) => {
                  f && f.startsWith(d.key) && X(f);
                });
                const c = d.zodSchema.safeParse(r);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const w = u.path, p = u.message, O = [d.key, ...w].join(".");
                  e(O, p);
                }), vt(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => bt.getState().getFormRefsByStateKey(t);
          if (l === "_initialState")
            return o.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return o.getState().serverState[t];
          if (l === "_isLoading")
            return o.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return y.revertToInitialState;
          if (l === "updateInitialState") return y.updateInitialState;
          if (l === "removeValidation") return y.removeValidation;
        }
        if (l === "getFormRef")
          return () => bt.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ wt(
            Bt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: S?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return n;
        if (l === "_isServerSynced") return y._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Ft(() => {
                it(i, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              it(i, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            E(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ wt(
            Wt,
            {
              setState: i,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const P = [...n, l], at = o.getState().getNestedState(t, P);
        return s(at, P, S);
      }
    }, W = new Proxy(G, L);
    return T.set(B, {
      proxy: W,
      stateVersion: A
    }), W;
  }
  return s(
    o.getState().getNestedState(t, [])
  );
}
function Vt(t) {
  return lt(re, { proxy: t });
}
function ne({
  proxy: t,
  rebuildStateShape: i
}) {
  const m = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? i(
    m,
    t._path
  ).stateMapNoRender(
    (T, A, E, y, s) => t._mapFn(T, A, E, y, s)
  ) : null;
}
function re({
  proxy: t
}) {
  const i = J(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return ot(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const T = g.parentElement, E = Array.from(T.childNodes).indexOf(g);
    let y = T.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, T.setAttribute("data-parent-id", y));
    const I = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: E,
      effect: t._effect
    };
    o.getState().addSignalElement(m, I);
    const n = o.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (G) {
        console.error("Error evaluating effect function during mount:", G), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const B = document.createTextNode(String(S));
    g.replaceWith(B);
  }, [t._stateKey, t._path.join("."), t._effect]), lt("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function ye(t) {
  const i = Ut(
    (m) => {
      const g = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return lt("text", {}, String(i));
}
function oe({
  stateKey: t,
  itemComponentId: i,
  itemPath: m,
  children: g
}) {
  const [, T] = Q({}), [A, E] = Jt(), y = J(null);
  return ot(() => {
    E.height > 0 && E.height !== y.current && (y.current = E.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: E.height
      }
    }));
  }, [E.height, t, m]), ct(() => {
    const s = `${t}////${i}`, I = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return I.components.set(s, {
      forceUpdate: () => T({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), o.getState().stateComponents.set(t, I), () => {
      const n = o.getState().stateComponents.get(t);
      n && n.components.delete(s);
    };
  }, [t, i, m.join(".")]), /* @__PURE__ */ wt("div", { ref: A, children: g });
}
export {
  Vt as $cogsSignal,
  ye as $cogsSignalStore,
  Ie as addStateOptions,
  Te as createCogsState,
  ve as notifyComponent,
  ee as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
