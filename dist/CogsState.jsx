"use client";
import { jsx as Ot } from "react/jsx-runtime";
import { useState as K, useRef as q, useEffect as ot, useLayoutEffect as ct, useMemo as wt, createElement as lt, useSyncExternalStore as Ht, startTransition as Ft, useCallback as kt } from "react";
import { transformStateFunc as Bt, isDeepEqual as J, isFunction as tt, getNestedValue as Z, getDifferences as _t, debounce as Wt } from "./utility.js";
import { pushFunc as Et, updateFn as it, cutFunc as ht, ValidationWrapper as zt, FormControlComponent as qt } from "./Functions.jsx";
import Jt from "superjson";
import { v4 as At } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as bt } from "./store.js";
import { useCogsConfig as Gt } from "./CogsStateClient.jsx";
import { applyPatch as Yt } from "fast-json-patch";
import Zt from "react-use-measure";
function Mt(t, c) {
  const m = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, I = m(t) || {};
  g(t, {
    ...I,
    ...c
  });
}
function xt({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const g = rt(t) || {}, I = m[t] || {}, N = o.getState().setInitialStateOptions, p = { ...I, ...g };
  let v = !1;
  if (c)
    for (const s in c)
      p.hasOwnProperty(s) ? (s == "localStorage" && c[s] && p[s].key !== c[s]?.key && (v = !0, p[s] = c[s]), s == "initialState" && c[s] && p[s] !== c[s] && // Different references
      !J(p[s], c[s]) && (v = !0, p[s] = c[s])) : (v = !0, p[s] = c[s]);
  v && N(t, p);
}
function Ie(t, { formElements: c, validation: m }) {
  return { initialState: t, formElements: c, validation: m };
}
const ve = (t, c) => {
  let m = t;
  const [g, I] = Bt(m);
  (Object.keys(I).length > 0 || c && Object.keys(c).length > 0) && Object.keys(I).forEach((v) => {
    I[v] = I[v] || {}, I[v].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...I[v].formElements || {}
      // State-specific overrides
    }, rt(v) || o.getState().setInitialStateOptions(v, I[v]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const N = (v, s) => {
    const [T] = K(s?.componentId ?? At());
    xt({
      stateKey: v,
      options: s,
      initialOptionsPart: I
    });
    const r = o.getState().cogsStateStore[v] || g[v], S = s?.modifyState ? s.modifyState(r) : r, [W, j] = ne(
      S,
      {
        stateKey: v,
        syncUpdate: s?.syncUpdate,
        componentId: T,
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
    return j;
  };
  function p(v, s) {
    xt({ stateKey: v, options: s, initialOptionsPart: I }), s.localStorage && te(v, s), dt(v);
  }
  return { useCogsState: N, setCogsOptions: p };
}, {
  setUpdaterState: Tt,
  setState: nt,
  getInitialOptions: rt,
  getKeyState: Lt,
  getValidationErrors: Xt,
  setStateLog: Qt,
  updateInitialStateGlobal: Nt,
  addValidationError: Rt,
  removeValidationError: X,
  setServerSyncActions: Kt
} = o.getState(), Pt = (t, c, m, g, I) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    g
  );
  const N = tt(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (N && g) {
    const p = `${g}-${c}-${N}`;
    let v;
    try {
      v = vt(p)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: I ?? v
    }, T = Jt.serialize(s);
    window.localStorage.setItem(
      p,
      JSON.stringify(T.json)
    );
  }
}, vt = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, te = (t, c) => {
  const m = o.getState().cogsStateStore[t], { sessionId: g } = Gt(), I = tt(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (I && g) {
    const N = vt(
      `${g}-${t}-${I}`
    );
    if (N && N.lastUpdated > (N.lastSyncedWithServer || 0))
      return nt(t, N.state), dt(t), !0;
  }
  return !1;
}, Dt = (t, c, m, g, I, N) => {
  const p = {
    initialState: c,
    updaterState: It(
      t,
      g,
      I,
      N
    ),
    state: m
  };
  Nt(t, p.initialState), Tt(t, p.updaterState), nt(t, p.state);
}, dt = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, ye = (t, c) => {
  const m = o.getState().stateComponents.get(t);
  if (m) {
    const g = `${t}////${c}`, I = m.components.get(g);
    if ((I ? Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"] : null)?.includes("none"))
      return;
    I && I.forceUpdate();
  }
}, ee = (t, c, m, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: Z(c, g),
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
        oldValue: Z(c, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function ne(t, {
  stateKey: c,
  serverSync: m,
  localStorage: g,
  formElements: I,
  reactiveDeps: N,
  reactiveType: p,
  componentId: v,
  initialState: s,
  syncUpdate: T,
  dependencies: r,
  serverState: S
} = {}) {
  const [W, j] = K({}), { sessionId: U } = Gt();
  let z = !c;
  const [h] = K(c ?? At()), l = o.getState().stateLog[h], ut = q(/* @__PURE__ */ new Set()), et = q(v ?? At()), L = q(
    null
  );
  L.current = rt(h) ?? null, ot(() => {
    if (T && T.stateKey === h && T.path?.[0]) {
      nt(h, (n) => ({
        ...n,
        [T.path[0]]: T.newValue
      }));
      const e = `${T.stateKey}:${T.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: T.timeStamp,
        userId: T.userId
      });
    }
  }, [T]), ot(() => {
    if (s) {
      Mt(h, {
        initialState: s
      });
      const e = L.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !J(i, s) || !i) && !a)
        return;
      let u = null;
      const E = tt(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      E && U && (u = vt(`${U}-${h}-${E}`));
      let y = s, w = !1;
      const C = a ? Date.now() : 0, A = u?.lastUpdated || 0, b = u?.lastSyncedWithServer || 0;
      a && C > A ? (y = e.serverState.data, w = !0) : u && A > b && (y = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(y)), o.getState().initializeShadowState(h, s), Dt(
        h,
        s,
        y,
        at,
        et.current,
        U
      ), w && E && U && Pt(y, h, e, U, Date.now()), dt(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || j({});
    }
  }, [
    s,
    S?.status,
    S?.data,
    ...r || []
  ]), ct(() => {
    z && Mt(h, {
      serverSync: m,
      formElements: I,
      initialState: s,
      localStorage: g,
      middleware: L.current?.middleware
    });
    const e = `${h}////${et.current}`, n = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(e, {
      forceUpdate: () => j({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: N || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, n), j({}), () => {
      n && (n.components.delete(e), n.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const at = (e, n, a, i) => {
    if (Array.isArray(n)) {
      const u = `${h}-${n.join(".")}`;
      ut.current.add(u);
    }
    const f = o.getState();
    nt(h, (u) => {
      const E = tt(e) ? e(u) : e, y = `${h}-${n.join(".")}`;
      if (y) {
        let M = !1, $ = f.signalDomElements.get(y);
        if ((!$ || $.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const R = n.slice(0, -1), V = Z(E, R);
          if (Array.isArray(V)) {
            M = !0;
            const O = `${h}-${R.join(".")}`;
            $ = f.signalDomElements.get(O);
          }
        }
        if ($) {
          const R = M ? Z(E, n.slice(0, -1)) : Z(E, n);
          $.forEach(({ parentId: V, position: O, effect: _ }) => {
            const D = document.querySelector(
              `[data-parent-id="${V}"]`
            );
            if (D) {
              const G = Array.from(D.childNodes);
              if (G[O]) {
                const B = _ ? new Function("state", `return (${_})(state)`)(R) : R;
                G[O].textContent = String(B);
              }
            }
          });
        }
      }
      console.log("shadowState", f.shadowStateStore), a.updateType === "update" && (i || L.current?.validation?.key) && n && X(
        (i || L.current?.validation?.key) + "." + n.join(".")
      );
      const w = n.slice(0, n.length - 1);
      a.updateType === "cut" && L.current?.validation?.key && X(
        L.current?.validation?.key + "." + w.join(".")
      ), a.updateType === "insert" && L.current?.validation?.key && Xt(
        L.current?.validation?.key + "." + w.join(".")
      ).filter(([$, R]) => {
        let V = $?.split(".").length;
        if ($ == w.join(".") && V == w.length - 1) {
          let O = $ + "." + w;
          X($), Rt(O, R);
        }
      });
      const C = f.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", C), C) {
        const M = _t(u, E), $ = new Set(M), R = a.updateType === "update" ? n.join(".") : n.slice(0, -1).join(".") || "";
        for (const [
          V,
          O
        ] of C.components.entries()) {
          let _ = !1;
          const D = Array.isArray(O.reactiveType) ? O.reactiveType : [O.reactiveType || "component"];
          if (console.log("component", O), !D.includes("none")) {
            if (D.includes("all")) {
              O.forceUpdate();
              continue;
            }
            if (D.includes("component") && ((O.paths.has(R) || O.paths.has("")) && (_ = !0), !_))
              for (const G of $) {
                let B = G;
                for (; ; ) {
                  if (O.paths.has(B)) {
                    _ = !0;
                    break;
                  }
                  const st = B.lastIndexOf(".");
                  if (st !== -1) {
                    const gt = B.substring(
                      0,
                      st
                    );
                    if (!isNaN(
                      Number(B.substring(st + 1))
                    ) && O.paths.has(gt)) {
                      _ = !0;
                      break;
                    }
                    B = gt;
                  } else
                    B = "";
                  if (B === "")
                    break;
                }
                if (_) break;
              }
            if (!_ && D.includes("deps") && O.depsFunction) {
              const G = O.depsFunction(E);
              let B = !1;
              typeof G == "boolean" ? G && (B = !0) : J(O.deps, G) || (O.deps = G, B = !0), B && (_ = !0);
            }
            _ && O.forceUpdate();
          }
        }
      }
      const A = Date.now();
      n = n.map((M, $) => {
        const R = n.slice(0, -1), V = Z(E, R);
        return $ === n.length - 1 && ["insert", "cut"].includes(a.updateType) ? (V.length - 1).toString() : M;
      });
      const { oldValue: b, newValue: F } = ee(
        a.updateType,
        u,
        E,
        n
      ), Y = {
        timeStamp: A,
        stateKey: h,
        path: n,
        updateType: a.updateType,
        status: "new",
        oldValue: b,
        newValue: F
      };
      switch (a.updateType) {
        case "update":
          f.updateShadowAtPath(h, n, E);
          break;
        case "insert":
          const M = n.slice(0, -1);
          f.insertShadowArrayElement(h, M, F);
          break;
        case "cut":
          const $ = n.slice(0, -1), R = parseInt(n[n.length - 1]);
          f.removeShadowArrayElement(h, $, R);
          break;
      }
      if (Qt(h, (M) => {
        const R = [...M ?? [], Y].reduce((V, O) => {
          const _ = `${O.stateKey}:${JSON.stringify(O.path)}`, D = V.get(_);
          return D ? (D.timeStamp = Math.max(D.timeStamp, O.timeStamp), D.newValue = O.newValue, D.oldValue = D.oldValue ?? O.oldValue, D.updateType = O.updateType) : V.set(_, { ...O }), V;
        }, /* @__PURE__ */ new Map());
        return Array.from(R.values());
      }), Pt(
        E,
        h,
        L.current,
        U
      ), L.current?.middleware && L.current.middleware({
        updateLog: l,
        update: Y
      }), L.current?.serverSync) {
        const M = f.serverState[h], $ = L.current?.serverSync;
        Kt(h, {
          syncKey: typeof $.syncKey == "string" ? $.syncKey : $.syncKey({ state: E }),
          rollBackState: M,
          actionTimeStamp: Date.now() + ($.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[h] || (Tt(
    h,
    It(
      h,
      at,
      et.current,
      U
    )
  ), o.getState().cogsStateStore[h] || nt(h, t), o.getState().initialStateGlobal[h] || Nt(h, t));
  const d = wt(() => It(
    h,
    at,
    et.current,
    U
  ), [h, U]);
  return [Lt(h), d];
}
function It(t, c, m, g) {
  const I = /* @__PURE__ */ new Map();
  let N = 0;
  const p = (T) => {
    const r = T.join(".");
    for (const [S] of I)
      (S === r || S.startsWith(r + ".")) && I.delete(S);
    N++;
  }, v = {
    removeValidation: (T) => {
      T?.validationKey && X(T.validationKey);
    },
    revertToInitialState: (T) => {
      const r = o.getState().getInitialOptions(t)?.validation;
      r?.key && X(r?.key), T?.validationKey && X(T.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), I.clear(), N++;
      const W = s(S, []), j = rt(t), U = tt(j?.localStorage?.key) ? j?.localStorage?.key(S) : j?.localStorage?.key, z = `${g}-${t}-${U}`;
      z && localStorage.removeItem(z), Tt(t, W), nt(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (T) => {
      I.clear(), N++;
      const r = It(
        t,
        c,
        m,
        g
      ), S = o.getState().initialStateGlobal[t], W = rt(t), j = tt(W?.localStorage?.key) ? W?.localStorage?.key(S) : W?.localStorage?.key, U = `${g}-${t}-${j}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), Ft(() => {
        Nt(t, T), o.getState().initializeShadowState(t, T), Tt(t, r), nt(t, T);
        const z = o.getState().stateComponents.get(t);
        z && z.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (z) => r.get()[z]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const T = o.getState().serverState[t];
      return !!(T && J(T, Lt(t)));
    }
  };
  function s(T, r = [], S) {
    const W = r.map(String).join(".");
    I.get(W);
    const j = function() {
      return o().getNestedState(t, r);
    };
    Object.keys(v).forEach((h) => {
      j[h] = v[h];
    });
    const U = {
      apply(h, l, ut) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${r.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, r);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(T) && (S = { ...S, validIndices: void 0 });
        const ut = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !ut.has(l)) {
          const d = `${t}////${m}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const n = e.components.get(d);
            if (n && !n.paths.has("")) {
              const a = r.join(".");
              let i = !0;
              for (const f of n.paths)
                if (a.startsWith(f) && (a === f || a[f.length] === ".")) {
                  i = !1;
                  break;
                }
              i && n.paths.add(a);
            }
          }
        }
        if (l === "getDifferences")
          return () => _t(
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
                  const E = [a, ...u.path].join(".");
                  o.getState().addValidationError(E, u.message);
                });
                const f = o.getState().stateComponents.get(t);
                f && f.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return i?.success && e.onSuccess ? e.onSuccess(i.data) : !i?.success && e.onError && e.onError(i.error), i;
            } catch (i) {
              return e.onError && e.onError(i), { success: !1, error: i };
            }
          };
        if (l === "_status") {
          const d = o.getState().getNestedState(t, r), e = o.getState().initialStateGlobal[t], n = Z(e, r);
          return J(d, n) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              r
            ), e = o.getState().initialStateGlobal[t], n = Z(e, r);
            return J(d, n) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = rt(t), n = tt(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${g}-${t}-${n}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + r.join("."));
          };
        if (Array.isArray(T)) {
          const d = () => S?.validIndices ? T.map((n, a) => ({
            item: n,
            originalIndex: S.validIndices[a]
          })) : o.getState().getNestedState(t, r).map((n, a) => ({
            item: n,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const e = o.getState().getSelectedIndex(t, r.join("."));
              if (e !== void 0)
                return s(
                  T[e],
                  [...r, e.toString()],
                  S
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
                dependencies: f = []
              } = e, u = q(!1), E = q(null), [y, w] = K({
                startIndex: 0,
                endIndex: 10
              }), [C, A] = K("IDLE_AT_TOP"), b = q(!1), F = q(0), Y = q(f), M = q(0), [$, R] = K(0), V = q(null);
              ot(() => o.getState().subscribeToShadowState(t, () => {
                R((x) => x + 1);
              }), [t]);
              const O = o().getNestedState(
                t,
                r
              ), _ = O.length, { totalHeight: D, positions: G } = wt(() => {
                const k = o.getState().getShadowMetadata(t, r) || [];
                let x = 0;
                const H = [];
                for (let P = 0; P < _; P++) {
                  H[P] = x;
                  const Q = k[P]?.virtualizer?.itemHeight;
                  x += Q || n;
                }
                return { totalHeight: x, positions: H };
              }, [
                _,
                t,
                r.join("."),
                n,
                $
              ]), B = wt(() => {
                const k = Math.max(0, y.startIndex), x = Math.min(_, y.endIndex), H = Array.from(
                  { length: x - k },
                  (Q, ft) => k + ft
                ), P = H.map((Q) => O[Q]);
                return s(P, r, {
                  ...S,
                  validIndices: H
                });
              }, [y.startIndex, y.endIndex, O, _]);
              ct(() => {
                const k = E.current;
                if (!k) return;
                const x = _ > F.current;
                if (x && V.current) {
                  const { top: H, height: P } = V.current;
                  b.current = !0, k.scrollTop = H + (k.scrollHeight - P), console.log(
                    `ANCHOR RESTORED to scrollTop: ${k.scrollTop}`
                  ), setTimeout(() => {
                    b.current = !1;
                  }, 100), V.current = null;
                } else {
                  if (!J(
                    f,
                    Y.current
                  )) {
                    console.log("TRANSITION: Deps changed -> IDLE_AT_TOP"), A("IDLE_AT_TOP");
                    return;
                  }
                  x && C === "LOCKED_AT_BOTTOM" && i && (console.log(
                    "TRANSITION: New items arrived while locked -> GETTING_HEIGHTS"
                  ), A("GETTING_HEIGHTS"));
                }
                F.current = _, Y.current = f;
              }, [_, ...f]), ct(() => {
                const k = E.current;
                if (!k) return;
                let x;
                if (C === "IDLE_AT_TOP" && i && _ > 0)
                  console.log(
                    "ACTION (IDLE_AT_TOP): Data has arrived -> GETTING_HEIGHTS"
                  ), A("GETTING_HEIGHTS");
                else if (C === "GETTING_HEIGHTS")
                  console.log(
                    "ACTION (GETTING_HEIGHTS): Setting range to end and starting loop."
                  ), w({
                    startIndex: Math.max(0, _ - 10 - a),
                    endIndex: _
                  }), x = setInterval(() => {
                    const H = _ - 1;
                    ((o.getState().getShadowMetadata(t, r) || [])[H]?.virtualizer?.itemHeight || 0) > 0 && (clearInterval(x), u.current || (console.log(
                      "ACTION (GETTING_HEIGHTS): Measurement success -> SCROLLING_TO_BOTTOM"
                    ), A("SCROLLING_TO_BOTTOM")));
                  }, 100);
                else if (C === "SCROLLING_TO_BOTTOM") {
                  console.log(
                    "ACTION (SCROLLING_TO_BOTTOM): Executing scroll."
                  ), b.current = !0;
                  const H = F.current === 0 ? "auto" : "smooth";
                  k.scrollTo({
                    top: k.scrollHeight,
                    behavior: H
                  });
                  const P = setTimeout(
                    () => {
                      console.log(
                        "ACTION (SCROLLING_TO_BOTTOM): Scroll finished -> LOCKED_AT_BOTTOM"
                      ), b.current = !1, u.current = !1, A("LOCKED_AT_BOTTOM");
                    },
                    H === "smooth" ? 500 : 50
                  );
                  return () => clearTimeout(P);
                }
                return () => {
                  x && clearInterval(x);
                };
              }, [C, _, G]), ot(() => {
                const k = E.current;
                if (!k) return;
                const x = n, H = () => {
                  if (b.current)
                    return;
                  const { scrollTop: P, scrollHeight: Q, clientHeight: ft } = k;
                  if (Q - P - ft < 10 ? (C !== "LOCKED_AT_BOTTOM" && A("LOCKED_AT_BOTTOM"), V.current = null) : (C !== "IDLE_NOT_AT_BOTTOM" && A("IDLE_NOT_AT_BOTTOM"), V.current = {
                    top: P,
                    height: Q
                  }), Math.abs(P - M.current) < x)
                    return;
                  console.log(
                    `Threshold passed at ${P}px. Recalculating range...`
                  );
                  let yt = _ - 1, pt = 0, Ct = 0;
                  for (; pt <= yt; ) {
                    const mt = Math.floor((pt + yt) / 2);
                    G[mt] < P ? (Ct = mt, pt = mt + 1) : yt = mt - 1;
                  }
                  const $t = Math.max(0, Ct - a);
                  let St = $t;
                  const Ut = P + ft;
                  for (; St < _ && G[St] < Ut; )
                    St++;
                  w({
                    startIndex: $t,
                    endIndex: Math.min(_, St + a)
                  }), M.current = P;
                };
                return k.addEventListener("scroll", H, {
                  passive: !0
                }), () => k.removeEventListener("scroll", H);
              }, [_, G, n, a, C]);
              const st = kt(() => {
                console.log(
                  "USER ACTION: Clicked scroll button -> SCROLLING_TO_BOTTOM"
                ), A("SCROLLING_TO_BOTTOM");
              }, []), gt = kt(
                (k, x = "smooth") => {
                  E.current && G[k] !== void 0 && (A("IDLE_NOT_AT_BOTTOM"), E.current.scrollTo({
                    top: G[k],
                    behavior: x
                  }));
                },
                [G]
              ), jt = {
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
                    transform: `translateY(${G[y.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: B,
                virtualizerProps: jt,
                scrollToBottom: st,
                scrollToIndex: gt
              };
            };
          if (l === "stateSort")
            return (e) => {
              const a = [...d()].sort(
                (u, E) => e(u.item, E.item)
              ), i = a.map(({ item: u }) => u), f = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(i, r, f);
            };
          if (l === "stateFilter")
            return (e) => {
              const a = d().filter(
                ({ item: u }, E) => e(u, E)
              ), i = a.map(({ item: u }) => u), f = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(i, r, f);
            };
          if (l === "stateMap")
            return (e) => {
              const n = o.getState().getNestedState(t, r);
              return Array.isArray(n) ? (S?.validIndices || Array.from({ length: n.length }, (i, f) => f)).map((i, f) => {
                const u = n[i], E = [...r, i.toString()], y = s(u, E, S);
                return e(u, y, {
                  register: () => {
                    const [, C] = K({}), A = `${m}-${r.join(".")}-${i}`;
                    ct(() => {
                      const b = `${t}////${A}`, F = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return F.components.set(b, {
                        forceUpdate: () => C({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(t, F), () => {
                        const Y = o.getState().stateComponents.get(t);
                        Y && Y.components.delete(b);
                      };
                    }, [t, A]);
                  },
                  index: f,
                  originalIndex: i
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${r.join(".")}. The current value is:`,
                n
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => T.map((a, i) => {
              let f;
              S?.validIndices && S.validIndices[i] !== void 0 ? f = S.validIndices[i] : f = i;
              const u = [...r, f.toString()], E = s(a, u, S);
              return e(
                a,
                E,
                i,
                T,
                s(T, r, S)
              );
            });
          if (l === "$stateMap")
            return (e) => lt(re, {
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
              return Array.isArray(n) ? (S?.validIndices || Array.from({ length: n.length }, (i, f) => f)).map((i, f) => {
                const u = n[i], E = [...r, i.toString()], y = s(u, E, S), w = `${m}-${r.join(".")}-${i}`;
                return lt(ae, {
                  key: i,
                  stateKey: t,
                  itemComponentId: w,
                  itemPath: E,
                  children: e(
                    u,
                    y,
                    { localIndex: f, originalIndex: i },
                    n,
                    s(n, r, S)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${r.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const n = T;
              I.clear(), N++;
              const a = n.flatMap(
                (i) => i[e] ?? []
              );
              return s(
                a,
                [...r, "[*]", e],
                S
              );
            };
          if (l === "index")
            return (e) => {
              const n = T[e];
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
            return (e) => (p(r), Et(c, e, r, t), s(
              o.getState().getNestedState(t, r),
              r
            ));
          if (l === "uniqueInsert")
            return (e, n, a) => {
              const i = o.getState().getNestedState(t, r), f = tt(e) ? e(i) : e;
              let u = null;
              if (!i.some((y) => {
                if (n) {
                  const C = n.every(
                    (A) => J(y[A], f[A])
                  );
                  return C && (u = y), C;
                }
                const w = J(y, f);
                return w && (u = y), w;
              }))
                p(r), Et(c, f, r, t);
              else if (a && u) {
                const y = a(u), w = i.map(
                  (C) => J(C, u) ? y : C
                );
                p(r), it(c, w, r);
              }
            };
          if (l === "cut")
            return (e, n) => {
              if (!n?.waitForSync)
                return p(r), ht(c, r, t, e), s(
                  o.getState().getNestedState(t, r),
                  r
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let n = 0; n < T.length; n++)
                T[n] === e && ht(c, r, t, n);
            };
          if (l === "toggleByValue")
            return (e) => {
              const n = T.findIndex((a) => a === e);
              n > -1 ? ht(c, r, t, n) : Et(c, e, r, t);
            };
          if (l === "stateFind")
            return (e) => {
              const a = d().find(
                ({ item: f }, u) => e(f, u)
              );
              if (!a) return;
              const i = [...r, a.originalIndex.toString()];
              return s(a.item, i, S);
            };
          if (l === "findWith")
            return (e, n) => {
              const i = d().find(
                ({ item: u }) => u[e] === n
              );
              if (!i) return;
              const f = [...r, i.originalIndex.toString()];
              return s(i.item, f, S);
            };
        }
        const et = r[r.length - 1];
        if (!isNaN(Number(et))) {
          const d = r.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => ht(
              c,
              d,
              t,
              Number(et)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(T)) {
              const d = o.getState().getNestedState(t, r);
              return S.validIndices.map((e) => d[e]);
            }
            return o.getState().getNestedState(t, r);
          };
        if (l === "$derive")
          return (d) => Vt({
            _stateKey: t,
            _path: r,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Vt({
            _stateKey: t,
            _path: r
          });
        if (l === "lastSynced") {
          const d = `${t}:${r.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => vt(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = r.slice(0, -1), e = d.join("."), n = o.getState().getNestedState(t, d);
          return Array.isArray(n) ? Number(r[r.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = r.slice(0, -1), n = Number(r[r.length - 1]), a = e.join(".");
            d ? o.getState().setSelectedIndex(t, a, n) : o.getState().setSelectedIndex(t, a, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            it(c, i, e), p(e);
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
            it(c, i, d), p(d);
          };
        if (r.length == 0) {
          if (l === "addValidation")
            return (d) => {
              const e = o.getState().getInitialOptions(t)?.validation;
              if (!e?.key)
                throw new Error("Validation key not found");
              X(e.key), d.forEach((n) => {
                const a = [e.key, ...n.path].join(".");
                Rt(a, n.message);
              }), dt(t);
            };
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], a = Yt(e, d).newDocument;
              Dt(
                t,
                o.getState().initialStateGlobal[t],
                a,
                c,
                m,
                g
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const f = _t(e, a), u = new Set(f);
                for (const [
                  E,
                  y
                ] of i.components.entries()) {
                  let w = !1;
                  const C = Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"];
                  if (!C.includes("none")) {
                    if (C.includes("all")) {
                      y.forceUpdate();
                      continue;
                    }
                    if (C.includes("component") && (y.paths.has("") && (w = !0), !w))
                      for (const A of u) {
                        if (y.paths.has(A)) {
                          w = !0;
                          break;
                        }
                        let b = A.lastIndexOf(".");
                        for (; b !== -1; ) {
                          const F = A.substring(0, b);
                          if (y.paths.has(F)) {
                            w = !0;
                            break;
                          }
                          const Y = A.substring(
                            b + 1
                          );
                          if (!isNaN(Number(Y))) {
                            const M = F.lastIndexOf(".");
                            if (M !== -1) {
                              const $ = F.substring(
                                0,
                                M
                              );
                              if (y.paths.has($)) {
                                w = !0;
                                break;
                              }
                            }
                          }
                          b = F.lastIndexOf(".");
                        }
                        if (w) break;
                      }
                    if (!w && C.includes("deps") && y.depsFunction) {
                      const A = y.depsFunction(a);
                      let b = !1;
                      typeof A == "boolean" ? A && (b = !0) : J(y.deps, A) || (y.deps = A, b = !0), b && (w = !0);
                    }
                    w && y.forceUpdate();
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
              const n = o.getState().cogsStateStore[t];
              try {
                const a = o.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([f]) => {
                  f && f.startsWith(d.key) && X(f);
                });
                const i = d.zodSchema.safeParse(n);
                return i.success ? !0 : (i.error.errors.forEach((u) => {
                  const E = u.path, y = u.message, w = [d.key, ...E].join(".");
                  e(w, y);
                }), dt(t), !1);
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
            return v.revertToInitialState;
          if (l === "updateInitialState") return v.updateInitialState;
          if (l === "removeValidation") return v.removeValidation;
        }
        if (l === "getFormRef")
          return () => bt.getState().getFormRef(t + "." + r.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ Ot(
            zt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: r,
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: S?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return r;
        if (l === "_isServerSynced") return v._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Wt(() => {
                it(c, d, r, "");
                const n = o.getState().getNestedState(t, r);
                e?.afterUpdate && e.afterUpdate(n);
              }, e.debounce);
            else {
              it(c, d, r, "");
              const n = o.getState().getNestedState(t, r);
              e?.afterUpdate && e.afterUpdate(n);
            }
            p(r);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ Ot(
            qt,
            {
              setState: c,
              stateKey: t,
              path: r,
              child: d,
              formOpts: e
            }
          );
        const L = [...r, l], at = o.getState().getNestedState(t, L);
        return s(at, L, S);
      }
    }, z = new Proxy(j, U);
    return I.set(W, {
      proxy: z,
      stateVersion: N
    }), z;
  }
  return s(
    o.getState().getNestedState(t, [])
  );
}
function Vt(t) {
  return lt(oe, { proxy: t });
}
function re({
  proxy: t,
  rebuildStateShape: c
}) {
  const m = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? c(
    m,
    t._path
  ).stateMapNoRender(
    (I, N, p, v, s) => t._mapFn(I, N, p, v, s)
  ) : null;
}
function oe({
  proxy: t
}) {
  const c = q(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return ot(() => {
    const g = c.current;
    if (!g || !g.parentElement) return;
    const I = g.parentElement, p = Array.from(I.childNodes).indexOf(g);
    let v = I.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, I.setAttribute("data-parent-id", v));
    const T = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: p,
      effect: t._effect
    };
    o.getState().addSignalElement(m, T);
    const r = o.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(r);
      } catch (j) {
        console.error("Error evaluating effect function during mount:", j), S = r;
      }
    else
      S = r;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const W = document.createTextNode(String(S));
    g.replaceWith(W);
  }, [t._stateKey, t._path.join("."), t._effect]), lt("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function pe(t) {
  const c = Ht(
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
  return lt("text", {}, String(c));
}
function ae({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: g
}) {
  const [, I] = K({}), [N, p] = Zt(), v = q(null);
  return ot(() => {
    p.height > 0 && p.height !== v.current && (v.current = p.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), ct(() => {
    const s = `${t}////${c}`, T = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return T.components.set(s, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), o.getState().stateComponents.set(t, T), () => {
      const r = o.getState().stateComponents.get(t);
      r && r.components.delete(s);
    };
  }, [t, c, m.join(".")]), /* @__PURE__ */ Ot("div", { ref: N, children: g });
}
export {
  Vt as $cogsSignal,
  pe as $cogsSignalStore,
  Ie as addStateOptions,
  ve as createCogsState,
  ye as notifyComponent,
  ne as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
