"use client";
import { jsx as It } from "react/jsx-runtime";
import { useState as nt, useRef as X, useEffect as rt, useLayoutEffect as kt, useMemo as wt, createElement as ut, useSyncExternalStore as Ut, startTransition as jt, useCallback as bt } from "react";
import { transformStateFunc as Ot, isDeepEqual as q, isFunction as K, getNestedValue as Y, getDifferences as Tt, debounce as Ft } from "./utility.js";
import { pushFunc as yt, updateFn as dt, cutFunc as mt, ValidationWrapper as Dt, FormControlComponent as Wt } from "./Functions.jsx";
import Lt from "superjson";
import { v4 as Et } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as $t } from "./store.js";
import { useCogsConfig as Pt } from "./CogsStateClient.jsx";
import { applyPatch as Gt } from "fast-json-patch";
import Bt from "react-use-measure";
function xt(t, c) {
  const S = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, y = S(t) || {};
  g(t, {
    ...y,
    ...c
  });
}
function Vt({
  stateKey: t,
  options: c,
  initialOptionsPart: S
}) {
  const g = at(t) || {}, y = S[t] || {}, x = o.getState().setInitialStateOptions, w = { ...y, ...g };
  let I = !1;
  if (c)
    for (const s in c)
      w.hasOwnProperty(s) ? (s == "localStorage" && c[s] && w[s].key !== c[s]?.key && (I = !0, w[s] = c[s]), s == "initialState" && c[s] && w[s] !== c[s] && // Different references
      !q(w[s], c[s]) && (I = !0, w[s] = c[s])) : (I = !0, w[s] = c[s]);
  I && x(t, w);
}
function ue(t, { formElements: c, validation: S }) {
  return { initialState: t, formElements: c, validation: S };
}
const ge = (t, c) => {
  let S = t;
  const [g, y] = Ot(S);
  (Object.keys(y).length > 0 || c && Object.keys(c).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, at(I) || o.getState().setInitialStateOptions(I, y[I]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const x = (I, s) => {
    const [h] = nt(s?.componentId ?? Et());
    Vt({
      stateKey: I,
      options: s,
      initialOptionsPart: y
    });
    const r = o.getState().cogsStateStore[I] || g[I], f = s?.modifyState ? s.modifyState(r) : r, [H, O] = Zt(
      f,
      {
        stateKey: I,
        syncUpdate: s?.syncUpdate,
        componentId: h,
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
    return O;
  };
  function w(I, s) {
    Vt({ stateKey: I, options: s, initialOptionsPart: y }), s.localStorage && qt(I, s), gt(I);
  }
  return { useCogsState: x, setCogsOptions: w };
}, {
  setUpdaterState: ht,
  setState: ot,
  getInitialOptions: at,
  getKeyState: _t,
  getValidationErrors: Ht,
  setStateLog: zt,
  updateInitialStateGlobal: At,
  addValidationError: Mt,
  removeValidationError: Z,
  setServerSyncActions: Jt
} = o.getState(), Ct = (t, c, S, g, y) => {
  S?.log && console.log(
    "saving to localstorage",
    c,
    S.localStorage?.key,
    g
  );
  const x = K(S?.localStorage?.key) ? S.localStorage?.key(t) : S?.localStorage?.key;
  if (x && g) {
    const w = `${g}-${c}-${x}`;
    let I;
    try {
      I = pt(w)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, h = Lt.serialize(s);
    window.localStorage.setItem(
      w,
      JSON.stringify(h.json)
    );
  }
}, pt = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, qt = (t, c) => {
  const S = o.getState().cogsStateStore[t], { sessionId: g } = Pt(), y = K(c?.localStorage?.key) ? c.localStorage.key(S) : c?.localStorage?.key;
  if (y && g) {
    const x = pt(
      `${g}-${t}-${y}`
    );
    if (x && x.lastUpdated > (x.lastSyncedWithServer || 0))
      return ot(t, x.state), gt(t), !0;
  }
  return !1;
}, Rt = (t, c, S, g, y, x) => {
  const w = {
    initialState: c,
    updaterState: vt(
      t,
      g,
      y,
      x
    ),
    state: S
  };
  At(t, w.initialState), ht(t, w.updaterState), ot(t, w.state);
}, gt = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const S = /* @__PURE__ */ new Set();
  c.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || S.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((g) => g());
  });
}, fe = (t, c) => {
  const S = o.getState().stateComponents.get(t);
  if (S) {
    const g = `${t}////${c}`, y = S.components.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Yt = (t, c, S, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: Y(c, g),
        newValue: Y(S, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: Y(S, g)
      };
    case "cut":
      return {
        oldValue: Y(c, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Zt(t, {
  stateKey: c,
  serverSync: S,
  localStorage: g,
  formElements: y,
  reactiveDeps: x,
  reactiveType: w,
  componentId: I,
  initialState: s,
  syncUpdate: h,
  dependencies: r,
  serverState: f
} = {}) {
  const [H, O] = nt({}), { sessionId: F } = Pt();
  let z = !c;
  const [m] = nt(c ?? Et()), l = o.getState().stateLog[m], ft = X(/* @__PURE__ */ new Set()), tt = X(I ?? Et()), R = X(
    null
  );
  R.current = at(m) ?? null, rt(() => {
    if (h && h.stateKey === m && h.path?.[0]) {
      ot(m, (n) => ({
        ...n,
        [h.path[0]]: h.newValue
      }));
      const e = `${h.stateKey}:${h.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: h.timeStamp,
        userId: h.userId
      });
    }
  }, [h]), rt(() => {
    if (s) {
      xt(m, {
        initialState: s
      });
      const e = R.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[m];
      if (!(i && !q(i, s) || !i) && !a)
        return;
      let u = null;
      const p = K(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      p && F && (u = pt(`${F}-${m}-${p}`));
      let T = s, b = !1;
      const _ = a ? Date.now() : 0, N = u?.lastUpdated || 0, M = u?.lastSyncedWithServer || 0;
      a && _ > N ? (T = e.serverState.data, b = !0) : u && N > M && (T = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(T)), o.getState().initializeShadowState(m, s), Rt(
        m,
        s,
        T,
        st,
        tt.current,
        F
      ), b && p && F && Ct(T, m, e, F, Date.now()), gt(m), (Array.isArray(w) ? w : [w || "component"]).includes("none") || O({});
    }
  }, [
    s,
    f?.status,
    f?.data,
    ...r || []
  ]), kt(() => {
    z && xt(m, {
      serverSync: S,
      formElements: y,
      initialState: s,
      localStorage: g,
      middleware: R.current?.middleware
    });
    const e = `${m}////${tt.current}`, n = o.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(e, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: x || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), o.getState().stateComponents.set(m, n), O({}), () => {
      n && (n.components.delete(e), n.components.size === 0 && o.getState().stateComponents.delete(m));
    };
  }, []);
  const st = (e, n, a, i) => {
    if (Array.isArray(n)) {
      const u = `${m}-${n.join(".")}`;
      ft.current.add(u);
    }
    const v = o.getState();
    ot(m, (u) => {
      const p = K(e) ? e(u) : e, T = `${m}-${n.join(".")}`;
      if (T) {
        let k = !1, V = v.signalDomElements.get(T);
        if ((!V || V.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const C = n.slice(0, -1), L = Y(p, C);
          if (Array.isArray(L)) {
            k = !0;
            const A = `${m}-${C.join(".")}`;
            V = v.signalDomElements.get(A);
          }
        }
        if (V) {
          const C = k ? Y(p, n.slice(0, -1)) : Y(p, n);
          V.forEach(({ parentId: L, position: A, effect: D }) => {
            const U = document.querySelector(
              `[data-parent-id="${L}"]`
            );
            if (U) {
              const $ = Array.from(U.childNodes);
              if ($[A]) {
                const E = D ? new Function("state", `return (${D})(state)`)(C) : C;
                $[A].textContent = String(E);
              }
            }
          });
        }
      }
      console.log("shadowState", v.shadowStateStore), a.updateType === "update" && (i || R.current?.validation?.key) && n && Z(
        (i || R.current?.validation?.key) + "." + n.join(".")
      );
      const b = n.slice(0, n.length - 1);
      a.updateType === "cut" && R.current?.validation?.key && Z(
        R.current?.validation?.key + "." + b.join(".")
      ), a.updateType === "insert" && R.current?.validation?.key && Ht(
        R.current?.validation?.key + "." + b.join(".")
      ).filter(([V, C]) => {
        let L = V?.split(".").length;
        if (V == b.join(".") && L == b.length - 1) {
          let A = V + "." + b;
          Z(V), Mt(A, C);
        }
      });
      const _ = v.stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", _), _) {
        const k = Tt(u, p), V = new Set(k), C = a.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          L,
          A
        ] of _.components.entries()) {
          let D = !1;
          const U = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (console.log("component", A), !U.includes("none")) {
            if (U.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if (U.includes("component") && ((A.paths.has(C) || A.paths.has("")) && (D = !0), !D))
              for (const $ of V) {
                let E = $;
                for (; ; ) {
                  if (A.paths.has(E)) {
                    D = !0;
                    break;
                  }
                  const W = E.lastIndexOf(".");
                  if (W !== -1) {
                    const j = E.substring(
                      0,
                      W
                    );
                    if (!isNaN(
                      Number(E.substring(W + 1))
                    ) && A.paths.has(j)) {
                      D = !0;
                      break;
                    }
                    E = j;
                  } else
                    E = "";
                  if (E === "")
                    break;
                }
                if (D) break;
              }
            if (!D && U.includes("deps") && A.depsFunction) {
              const $ = A.depsFunction(p);
              let E = !1;
              typeof $ == "boolean" ? $ && (E = !0) : q(A.deps, $) || (A.deps = $, E = !0), E && (D = !0);
            }
            D && A.forceUpdate();
          }
        }
      }
      const N = Date.now();
      n = n.map((k, V) => {
        const C = n.slice(0, -1), L = Y(p, C);
        return V === n.length - 1 && ["insert", "cut"].includes(a.updateType) ? (L.length - 1).toString() : k;
      });
      const { oldValue: M, newValue: P } = Yt(
        a.updateType,
        u,
        p,
        n
      ), J = {
        timeStamp: N,
        stateKey: m,
        path: n,
        updateType: a.updateType,
        status: "new",
        oldValue: M,
        newValue: P
      };
      switch (a.updateType) {
        case "update":
          v.updateShadowAtPath(m, n, p);
          break;
        case "insert":
          const k = n.slice(0, -1);
          v.insertShadowArrayElement(m, k, P);
          break;
        case "cut":
          const V = n.slice(0, -1), C = parseInt(n[n.length - 1]);
          v.removeShadowArrayElement(m, V, C);
          break;
      }
      if (zt(m, (k) => {
        const C = [...k ?? [], J].reduce((L, A) => {
          const D = `${A.stateKey}:${JSON.stringify(A.path)}`, U = L.get(D);
          return U ? (U.timeStamp = Math.max(U.timeStamp, A.timeStamp), U.newValue = A.newValue, U.oldValue = U.oldValue ?? A.oldValue, U.updateType = A.updateType) : L.set(D, { ...A }), L;
        }, /* @__PURE__ */ new Map());
        return Array.from(C.values());
      }), Ct(
        p,
        m,
        R.current,
        F
      ), R.current?.middleware && R.current.middleware({
        updateLog: l,
        update: J
      }), R.current?.serverSync) {
        const k = v.serverState[m], V = R.current?.serverSync;
        Jt(m, {
          syncKey: typeof V.syncKey == "string" ? V.syncKey : V.syncKey({ state: p }),
          rollBackState: k,
          actionTimeStamp: Date.now() + (V.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return p;
    });
  };
  o.getState().updaterState[m] || (ht(
    m,
    vt(
      m,
      st,
      tt.current,
      F
    )
  ), o.getState().cogsStateStore[m] || ot(m, t), o.getState().initialStateGlobal[m] || At(m, t));
  const d = wt(() => vt(
    m,
    st,
    tt.current,
    F
  ), [m, F]);
  return [_t(m), d];
}
function vt(t, c, S, g) {
  const y = /* @__PURE__ */ new Map();
  let x = 0;
  const w = (h) => {
    const r = h.join(".");
    for (const [f] of y)
      (f === r || f.startsWith(r + ".")) && y.delete(f);
    x++;
  }, I = {
    removeValidation: (h) => {
      h?.validationKey && Z(h.validationKey);
    },
    revertToInitialState: (h) => {
      const r = o.getState().getInitialOptions(t)?.validation;
      r?.key && Z(r?.key), h?.validationKey && Z(h.validationKey);
      const f = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), x++;
      const H = s(f, []), O = at(t), F = K(O?.localStorage?.key) ? O?.localStorage?.key(f) : O?.localStorage?.key, z = `${g}-${t}-${F}`;
      z && localStorage.removeItem(z), ht(t, H), ot(t, f);
      const m = o.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), f;
    },
    updateInitialState: (h) => {
      y.clear(), x++;
      const r = vt(
        t,
        c,
        S,
        g
      ), f = o.getState().initialStateGlobal[t], H = at(t), O = K(H?.localStorage?.key) ? H?.localStorage?.key(f) : H?.localStorage?.key, F = `${g}-${t}-${O}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), jt(() => {
        At(t, h), o.getState().initializeShadowState(t, h), ht(t, r), ot(t, h);
        const z = o.getState().stateComponents.get(t);
        z && z.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (z) => r.get()[z]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const h = o.getState().serverState[t];
      return !!(h && q(h, _t(t)));
    }
  };
  function s(h, r = [], f) {
    const H = r.map(String).join(".");
    y.get(H);
    const O = function() {
      return o().getNestedState(t, r);
    };
    Object.keys(I).forEach((m) => {
      O[m] = I[m];
    });
    const F = {
      apply(m, l, ft) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${r.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, r);
      },
      get(m, l) {
        f?.validIndices && !Array.isArray(h) && (f = { ...f, validIndices: void 0 });
        const ft = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !ft.has(l)) {
          const d = `${t}////${S}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const n = e.components.get(d);
            if (n && !n.paths.has("")) {
              const a = r.join(".");
              let i = !0;
              for (const v of n.paths)
                if (a.startsWith(v) && (a === v || a[v.length] === ".")) {
                  i = !1;
                  break;
                }
              i && n.paths.add(a);
            }
          }
        }
        if (l === "getDifferences")
          return () => Tt(
            o.getState().cogsStateStore[t],
            o.getState().initialStateGlobal[t]
          );
        if (l === "sync" && r.length === 0)
          return async function() {
            const d = o.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const n = o.getState().getNestedState(t, []), a = d?.validation?.key;
            try {
              const i = await e.action(n);
              if (i && !i.success && i.errors && a) {
                o.getState().removeValidationError(a), i.errors.forEach((u) => {
                  const p = [a, ...u.path].join(".");
                  o.getState().addValidationError(p, u.message);
                });
                const v = o.getState().stateComponents.get(t);
                v && v.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return i?.success && e.onSuccess ? e.onSuccess(i.data) : !i?.success && e.onError && e.onError(i.error), i;
            } catch (i) {
              return e.onError && e.onError(i), { success: !1, error: i };
            }
          };
        if (l === "_status") {
          const d = o.getState().getNestedState(t, r), e = o.getState().initialStateGlobal[t], n = Y(e, r);
          return q(d, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              r
            ), e = o.getState().initialStateGlobal[t], n = Y(e, r);
            return q(d, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = at(t), n = K(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${g}-${t}-${n}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + r.join("."));
          };
        if (Array.isArray(h)) {
          const d = () => f?.validIndices ? h.map((n, a) => ({
            item: n,
            originalIndex: f.validIndices[a]
          })) : o.getState().getNestedState(t, r).map((n, a) => ({
            item: n,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const e = o.getState().getSelectedIndex(t, r.join("."));
              if (e !== void 0)
                return s(
                  h[e],
                  [...r, e.toString()],
                  f
                );
            };
          if (l === "clearSelected")
            return () => {
              o.getState().clearSelectedIndex({ stateKey: t, path: r });
            };
          if (l === "getSelectedIndex")
            return () => o.getState().getSelectedIndex(t, r.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (e) => {
              const {
                itemHeight: n = 50,
                overscan: a = 6,
                stickToBottom: i = !1,
                dependencies: v = []
              } = e;
              console.log("useVirtualView initialized with:", {
                itemHeight: n,
                overscan: a,
                stickToBottom: i
              });
              const u = X(null), [p, T] = nt({
                startIndex: 0,
                endIndex: 10
              }), [b, _] = nt(0), N = X(!1), M = X(!0), P = X(
                null
              );
              rt(() => (console.log("Setting up shadow state subscription"), o.getState().subscribeToShadowState(t, () => {
                console.log("Shadow state updated"), _((E) => E + 1);
              })), [t]);
              const J = o().getNestedState(
                t,
                r
              ), k = J.length;
              console.log("Source array length:", k);
              const { totalHeight: V, positions: C } = wt(() => {
                console.log("Recalculating heights and positions");
                const $ = o.getState().getShadowMetadata(t, r) || [];
                let E = 0;
                const W = [];
                for (let j = 0; j < k; j++) {
                  W[j] = E;
                  const Q = $[j]?.virtualizer?.itemHeight;
                  E += Q || n;
                }
                return console.log("Total height calculated:", E), { totalHeight: E, positions: W };
              }, [
                k,
                t,
                r.join("."),
                n,
                b
              ]), L = wt(() => {
                const $ = Math.max(0, p.startIndex), E = Math.min(k, p.endIndex);
                console.log("Creating virtual state for range:", {
                  start: $,
                  end: E
                });
                const W = Array.from(
                  { length: E - $ },
                  (Q, G) => $ + G
                ), j = W.map((Q) => J[Q]);
                return s(j, r, {
                  ...f,
                  validIndices: W
                });
              }, [p.startIndex, p.endIndex, J, k]);
              rt(() => {
                if (console.log("Auto-scroll effect triggered:", {
                  stickToBottom: i,
                  hasContainer: !!u.current,
                  totalCount: k,
                  shouldStickToBottom: M.current,
                  range: p
                }), !i) {
                  console.log("Stick to bottom is false, skipping");
                  return;
                }
                if (!u.current) {
                  console.log("No container ref, skipping");
                  return;
                }
                if (k === 0) {
                  console.log("No items, skipping");
                  return;
                }
                if (!M.current) {
                  console.log(
                    "Should not stick to bottom (user scrolled), skipping"
                  );
                  return;
                }
                console.log("Proceeding with auto-scroll logic"), P.current && (console.log("Clearing existing scroll interval"), clearInterval(P.current));
                const $ = 50, E = p.endIndex < $, W = k > p.endIndex + $;
                if (console.log("Jump check:", {
                  isInitialLoad: E,
                  isBigJump: W,
                  totalCount: k,
                  currentEndIndex: p.endIndex
                }), E || W) {
                  const G = {
                    startIndex: Math.max(0, k - 20),
                    endIndex: k
                  };
                  console.log("Jumping to end range:", G), T(G);
                }
                let j = 0;
                const Q = 50;
                return console.log("Starting scroll-to-bottom interval"), P.current = setInterval(() => {
                  const G = u.current;
                  if (!G) {
                    console.log("Container lost during interval");
                    return;
                  }
                  j++;
                  const { scrollTop: it, scrollHeight: et, clientHeight: ct } = G, St = it + ct, lt = et, B = lt - St < 5;
                  console.log(`Scroll attempt ${j}:`, {
                    currentBottom: St,
                    actualBottom: lt,
                    isAtBottom: B,
                    scrollTop: it,
                    scrollHeight: et,
                    clientHeight: ct
                  }), B || j >= Q ? (console.log(
                    B ? "Successfully reached bottom!" : "Timeout - giving up"
                  ), clearInterval(P.current), P.current = null) : (console.log("Scrolling to", G.scrollHeight), G.scrollTop = G.scrollHeight);
                }, 100), () => {
                  console.log("Cleaning up scroll interval"), P.current && (clearInterval(P.current), P.current = null);
                };
              }, [k, i, p.startIndex, p.endIndex]), rt(() => {
                const $ = u.current;
                if (!$) {
                  console.log("No container for scroll handler");
                  return;
                }
                console.log("Setting up scroll handler");
                let E;
                const W = () => {
                  P.current && (console.log("User scrolled - stopping auto-scroll"), clearInterval(P.current), P.current = null);
                  const { scrollTop: j, scrollHeight: Q, clientHeight: G } = $, it = Q - j - G < 10;
                  M.current = it, console.log("User scroll - at bottom:", it), clearTimeout(E), N.current = !0, E = setTimeout(() => {
                    N.current = !1, console.log("User stopped scrolling");
                  }, 150);
                  let et = 0;
                  for (let B = 0; B < C.length; B++)
                    if (C[B] > j - n * a) {
                      et = Math.max(0, B - 1);
                      break;
                    }
                  let ct = et;
                  const St = j + G;
                  for (let B = et; B < C.length && !(C[B] > St + n * a); B++)
                    ct = B;
                  const lt = {
                    startIndex: Math.max(0, et),
                    endIndex: Math.min(k, ct + 1 + a)
                  };
                  console.log("Updating visible range:", lt), T(lt);
                };
                return $.addEventListener("scroll", W, {
                  passive: !0
                }), console.log("Initial scroll calculation"), W(), () => {
                  console.log("Removing scroll handler"), $.removeEventListener("scroll", W), clearTimeout(E);
                };
              }, [C, k, n, a]);
              const A = bt(
                ($ = "auto") => {
                  console.log("Manual scrollToBottom called"), M.current = !0, u.current && (u.current.scrollTop = u.current.scrollHeight);
                },
                []
              ), D = bt(
                ($, E = "smooth") => {
                  console.log("scrollToIndex called:", $), u.current && C[$] !== void 0 && u.current.scrollTo({
                    top: C[$],
                    behavior: E
                  });
                },
                [C]
              ), U = {
                outer: {
                  ref: u,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${V}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${C[p.startIndex] || 0}px)`
                  }
                }
              };
              return console.log("Returning virtualizer with props:", {
                range: p,
                totalHeight: V,
                startPosition: C[p.startIndex] || 0
              }), {
                virtualState: L,
                virtualizerProps: U,
                scrollToBottom: A,
                scrollToIndex: D
              };
            };
          if (l === "stateSort")
            return (e) => {
              const a = [...d()].sort(
                (u, p) => e(u.item, p.item)
              ), i = a.map(({ item: u }) => u), v = {
                ...f,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(i, r, v);
            };
          if (l === "stateFilter")
            return (e) => {
              const a = d().filter(
                ({ item: u }, p) => e(u, p)
              ), i = a.map(({ item: u }) => u), v = {
                ...f,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(i, r, v);
            };
          if (l === "stateMap")
            return (e) => {
              const n = o.getState().getNestedState(t, r);
              return Array.isArray(n) ? (f?.validIndices || Array.from({ length: n.length }, (i, v) => v)).map((i, v) => {
                const u = n[i], p = [...r, i.toString()], T = s(u, p, f);
                return e(u, T, {
                  register: () => {
                    const [, _] = nt({}), N = `${S}-${r.join(".")}-${i}`;
                    kt(() => {
                      const M = `${t}////${N}`, P = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return P.components.set(M, {
                        forceUpdate: () => _({}),
                        paths: /* @__PURE__ */ new Set([p.join(".")])
                      }), o.getState().stateComponents.set(t, P), () => {
                        const J = o.getState().stateComponents.get(t);
                        J && J.components.delete(M);
                      };
                    }, [t, N]);
                  },
                  index: v,
                  originalIndex: i
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${r.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => h.map((a, i) => {
              let v;
              f?.validIndices && f.validIndices[i] !== void 0 ? v = f.validIndices[i] : v = i;
              const u = [...r, v.toString()], p = s(a, u, f);
              return e(
                a,
                p,
                i,
                h,
                s(h, r, f)
              );
            });
          if (l === "$stateMap")
            return (e) => ut(Xt, {
              proxy: {
                _stateKey: t,
                _path: r,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateList")
            return (e) => {
              const n = o.getState().getNestedState(t, r);
              return Array.isArray(n) ? (f?.validIndices || Array.from({ length: n.length }, (i, v) => v)).map((i, v) => {
                const u = n[i], p = [...r, i.toString()], T = s(u, p, f), b = `${S}-${r.join(".")}-${i}`;
                return ut(Kt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: b,
                  itemPath: p,
                  children: e(
                    u,
                    T,
                    { localIndex: v, originalIndex: i },
                    n,
                    s(n, r, f)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${r.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const n = h;
              y.clear(), x++;
              const a = n.flatMap(
                (i) => i[e] ?? []
              );
              return s(
                a,
                [...r, "[*]", e],
                f
              );
            };
          if (l === "index")
            return (e) => {
              const n = h[e];
              return s(n, [...r, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = o.getState().getNestedState(t, r);
              if (e.length === 0) return;
              const n = e.length - 1, a = e[n], i = [...r, n.toString()];
              return s(a, i);
            };
          if (l === "insert")
            return (e) => (w(r), yt(c, e, r, t), s(
              o.getState().getNestedState(t, r),
              r
            ));
          if (l === "uniqueInsert")
            return (e, n, a) => {
              const i = o.getState().getNestedState(t, r), v = K(e) ? e(i) : e;
              let u = null;
              if (!i.some((T) => {
                if (n) {
                  const _ = n.every(
                    (N) => q(T[N], v[N])
                  );
                  return _ && (u = T), _;
                }
                const b = q(T, v);
                return b && (u = T), b;
              }))
                w(r), yt(c, v, r, t);
              else if (a && u) {
                const T = a(u), b = i.map(
                  (_) => q(_, u) ? T : _
                );
                w(r), dt(c, b, r);
              }
            };
          if (l === "cut")
            return (e, n) => {
              if (!n?.waitForSync)
                return w(r), mt(c, r, t, e), s(
                  o.getState().getNestedState(t, r),
                  r
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let n = 0; n < h.length; n++)
                h[n] === e && mt(c, r, t, n);
            };
          if (l === "toggleByValue")
            return (e) => {
              const n = h.findIndex((a) => a === e);
              n > -1 ? mt(c, r, t, n) : yt(c, e, r, t);
            };
          if (l === "stateFind")
            return (e) => {
              const a = d().find(
                ({ item: v }, u) => e(v, u)
              );
              if (!a) return;
              const i = [...r, a.originalIndex.toString()];
              return s(a.item, i, f);
            };
          if (l === "findWith")
            return (e, n) => {
              const i = d().find(
                ({ item: u }) => u[e] === n
              );
              if (!i) return;
              const v = [...r, i.originalIndex.toString()];
              return s(i.item, v, f);
            };
        }
        const tt = r[r.length - 1];
        if (!isNaN(Number(tt))) {
          const d = r.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => mt(
              c,
              d,
              t,
              Number(tt)
            );
        }
        if (l === "get")
          return () => {
            if (f?.validIndices && Array.isArray(h)) {
              const d = o.getState().getNestedState(t, r);
              return f.validIndices.map((e) => d[e]);
            }
            return o.getState().getNestedState(t, r);
          };
        if (l === "$derive")
          return (d) => Nt({
            _stateKey: t,
            _path: r,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Nt({
            _stateKey: t,
            _path: r
          });
        if (l === "lastSynced") {
          const d = `${t}:${r.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => pt(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = r.slice(0, -1), e = d.join("."), n = o.getState().getNestedState(t, d);
          return Array.isArray(n) ? Number(r[r.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = r.slice(0, -1), n = Number(r[r.length - 1]), a = e.join(".");
            d ? o.getState().setSelectedIndex(t, a, n) : o.getState().setSelectedIndex(t, a, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            dt(c, i, e), w(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = r.slice(0, -1), e = Number(r[r.length - 1]), n = d.join("."), a = o.getState().getSelectedIndex(t, n);
            o.getState().setSelectedIndex(
              t,
              n,
              a === e ? void 0 : e
            );
            const i = o.getState().getNestedState(t, [...d]);
            dt(c, i, d), w(d);
          };
        if (r.length == 0) {
          if (l === "addValidation")
            return (d) => {
              const e = o.getState().getInitialOptions(t)?.validation;
              if (!e?.key)
                throw new Error("Validation key not found");
              Z(e.key), console.log("addValidationError", d), d.forEach((n) => {
                const a = [e.key, ...n.path].join(".");
                console.log("fullErrorPath", a), Mt(a, n.message);
              }), gt(t);
            };
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], a = Gt(e, d).newDocument;
              Rt(
                t,
                o.getState().initialStateGlobal[t],
                a,
                c,
                S,
                g
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const v = Tt(e, a), u = new Set(v);
                for (const [
                  p,
                  T
                ] of i.components.entries()) {
                  let b = !1;
                  const _ = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
                  if (!_.includes("none")) {
                    if (_.includes("all")) {
                      T.forceUpdate();
                      continue;
                    }
                    if (_.includes("component") && (T.paths.has("") && (b = !0), !b))
                      for (const N of u) {
                        if (T.paths.has(N)) {
                          b = !0;
                          break;
                        }
                        let M = N.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const P = N.substring(0, M);
                          if (T.paths.has(P)) {
                            b = !0;
                            break;
                          }
                          const J = N.substring(
                            M + 1
                          );
                          if (!isNaN(Number(J))) {
                            const k = P.lastIndexOf(".");
                            if (k !== -1) {
                              const V = P.substring(
                                0,
                                k
                              );
                              if (T.paths.has(V)) {
                                b = !0;
                                break;
                              }
                            }
                          }
                          M = P.lastIndexOf(".");
                        }
                        if (b) break;
                      }
                    if (!b && _.includes("deps") && T.depsFunction) {
                      const N = T.depsFunction(a);
                      let M = !1;
                      typeof N == "boolean" ? N && (M = !0) : q(T.deps, N) || (T.deps = N, M = !0), M && (b = !0);
                    }
                    b && T.forceUpdate();
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
              Z(d.key);
              const n = o.getState().cogsStateStore[t];
              try {
                const a = o.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([v]) => {
                  v && v.startsWith(d.key) && Z(v);
                });
                const i = d.zodSchema.safeParse(n);
                return i.success ? !0 : (i.error.errors.forEach((u) => {
                  const p = u.path, T = u.message, b = [d.key, ...p].join(".");
                  e(b, T);
                }), gt(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return S;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => $t.getState().getFormRefsByStateKey(t);
          if (l === "_initialState")
            return o.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return o.getState().serverState[t];
          if (l === "_isLoading")
            return o.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return I.revertToInitialState;
          if (l === "updateInitialState") return I.updateInitialState;
          if (l === "removeValidation") return I.removeValidation;
        }
        if (l === "getFormRef")
          return () => $t.getState().getFormRef(t + "." + r.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ It(
            Dt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: r,
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: f?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return r;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Ft(() => {
                dt(c, d, r, "");
                const n = o.getState().getNestedState(t, r);
                e?.afterUpdate && e.afterUpdate(n);
              }, e.debounce);
            else {
              dt(c, d, r, "");
              const n = o.getState().getNestedState(t, r);
              e?.afterUpdate && e.afterUpdate(n);
            }
            w(r);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ It(
            Wt,
            {
              setState: c,
              stateKey: t,
              path: r,
              child: d,
              formOpts: e
            }
          );
        const R = [...r, l], st = o.getState().getNestedState(t, R);
        return s(st, R, f);
      }
    }, z = new Proxy(O, F);
    return y.set(H, {
      proxy: z,
      stateVersion: x
    }), z;
  }
  return s(
    o.getState().getNestedState(t, [])
  );
}
function Nt(t) {
  return ut(Qt, { proxy: t });
}
function Xt({
  proxy: t,
  rebuildStateShape: c
}) {
  const S = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(S) ? c(
    S,
    t._path
  ).stateMapNoRender(
    (y, x, w, I, s) => t._mapFn(y, x, w, I, s)
  ) : null;
}
function Qt({
  proxy: t
}) {
  const c = X(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return rt(() => {
    const g = c.current;
    if (!g || !g.parentElement) return;
    const y = g.parentElement, w = Array.from(y.childNodes).indexOf(g);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const h = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: w,
      effect: t._effect
    };
    o.getState().addSignalElement(S, h);
    const r = o.getState().getNestedState(t._stateKey, t._path);
    let f;
    if (t._effect)
      try {
        f = new Function(
          "state",
          `return (${t._effect})(state)`
        )(r);
      } catch (O) {
        console.error("Error evaluating effect function during mount:", O), f = r;
      }
    else
      f = r;
    f !== null && typeof f == "object" && (f = JSON.stringify(f));
    const H = document.createTextNode(String(f));
    g.replaceWith(H);
  }, [t._stateKey, t._path.join("."), t._effect]), ut("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function Se(t) {
  const c = Ut(
    (S) => {
      const g = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return ut("text", {}, String(c));
}
function Kt({
  stateKey: t,
  itemComponentId: c,
  itemPath: S,
  children: g
}) {
  const [, y] = nt({}), [x, w] = Bt(), I = X(null);
  return rt(() => {
    w.height > 0 && w.height !== I.current && (I.current = w.height, o.getState().setShadowMetadata(t, S, {
      virtualizer: {
        itemHeight: w.height
      }
    }));
  }, [w.height, t, S]), kt(() => {
    const s = `${t}////${c}`, h = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return h.components.set(s, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set([S.join(".")])
    }), o.getState().stateComponents.set(t, h), () => {
      const r = o.getState().stateComponents.get(t);
      r && r.components.delete(s);
    };
  }, [t, c, S.join(".")]), /* @__PURE__ */ It("div", { ref: x, children: g });
}
export {
  Nt as $cogsSignal,
  Se as $cogsSignalStore,
  ue as addStateOptions,
  ge as createCogsState,
  fe as notifyComponent,
  Zt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
