"use client";
import { jsx as At } from "react/jsx-runtime";
import { ulid as Dt } from "ulid";
import { useState as st, useRef as J, useEffect as rt, useLayoutEffect as Ct, useMemo as Et, createElement as ut, useSyncExternalStore as Ut, startTransition as Ft, useCallback as mt } from "react";
import { transformStateFunc as Lt, isDeepEqual as Y, isFunction as et, getNestedValue as Z, getDifferences as Tt, debounce as Gt } from "./utility.js";
import { pushFunc as pt, updateFn as dt, cutFunc as St, ValidationWrapper as Wt, FormControlComponent as Ht } from "./Functions.jsx";
import zt from "superjson";
import { v4 as kt } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as bt } from "./store.js";
import { useCogsConfig as _t } from "./CogsStateClient.jsx";
import { applyPatch as Bt } from "fast-json-patch";
import qt from "react-use-measure";
function Vt(t, i) {
  const S = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, h = S(t) || {};
  f(t, {
    ...h,
    ...i
  });
}
function $t({
  stateKey: t,
  options: i,
  initialOptionsPart: S
}) {
  const f = at(t) || {}, h = S[t] || {}, b = r.getState().setInitialStateOptions, p = { ...h, ...f };
  let y = !1;
  if (i)
    for (const s in i)
      p.hasOwnProperty(s) ? (s == "localStorage" && i[s] && p[s].key !== i[s]?.key && (y = !0, p[s] = i[s]), s == "initialState" && i[s] && p[s] !== i[s] && // Different references
      !Y(p[s], i[s]) && (y = !0, p[s] = i[s])) : (y = !0, p[s] = i[s]);
  y && b(t, p);
}
function me(t, { formElements: i, validation: S }) {
  return { initialState: t, formElements: i, validation: S };
}
const he = (t, i) => {
  let S = t;
  const [f, h] = Lt(S);
  (Object.keys(h).length > 0 || i && Object.keys(i).length > 0) && Object.keys(h).forEach((y) => {
    h[y] = h[y] || {}, h[y].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...h[y].formElements || {}
      // State-specific overrides
    }, at(y) || r.getState().setInitialStateOptions(y, h[y]);
  }), r.getState().setInitialStates(f), r.getState().setCreatedState(f);
  const b = (y, s) => {
    const [m] = st(s?.componentId ?? kt());
    $t({
      stateKey: y,
      options: s,
      initialOptionsPart: h
    });
    const n = r.getState().cogsStateStore[y] || f[y], u = s?.modifyState ? s.modifyState(n) : n, [G, R] = Kt(
      u,
      {
        stateKey: y,
        syncUpdate: s?.syncUpdate,
        componentId: m,
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
    return R;
  };
  function p(y, s) {
    $t({ stateKey: y, options: s, initialOptionsPart: h }), s.localStorage && Xt(y, s), ft(y);
  }
  return { useCogsState: b, setCogsOptions: p };
}, {
  setUpdaterState: ht,
  setState: ot,
  getInitialOptions: at,
  getKeyState: Rt,
  getValidationErrors: Jt,
  setStateLog: Yt,
  updateInitialStateGlobal: xt,
  addValidationError: Mt,
  removeValidationError: Q,
  setServerSyncActions: Zt
} = r.getState(), Nt = (t, i, S, f, h) => {
  S?.log && console.log(
    "saving to localstorage",
    i,
    S.localStorage?.key,
    f
  );
  const b = et(S?.localStorage?.key) ? S.localStorage?.key(t) : S?.localStorage?.key;
  if (b && f) {
    const p = `${f}-${i}-${b}`;
    let y;
    try {
      y = It(p)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: h ?? y
    }, m = zt.serialize(s);
    window.localStorage.setItem(
      p,
      JSON.stringify(m.json)
    );
  }
}, It = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Xt = (t, i) => {
  const S = r.getState().cogsStateStore[t], { sessionId: f } = _t(), h = et(i?.localStorage?.key) ? i.localStorage.key(S) : i?.localStorage?.key;
  if (h && f) {
    const b = It(
      `${f}-${t}-${h}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return ot(t, b.state), ft(t), !0;
  }
  return !1;
}, Ot = (t, i, S, f, h, b) => {
  const p = {
    initialState: i,
    updaterState: yt(
      t,
      f,
      h,
      b
    ),
    state: S
  };
  xt(t, p.initialState), ht(t, p.updaterState), ot(t, p.state);
}, ft = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const S = /* @__PURE__ */ new Set();
  i.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || S.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((f) => f());
  });
}, ye = (t, i) => {
  const S = r.getState().stateComponents.get(t);
  if (S) {
    const f = `${t}////${i}`, h = S.components.get(f);
    if ((h ? Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"] : null)?.includes("none"))
      return;
    h && h.forceUpdate();
  }
}, Qt = (t, i, S, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: Z(i, f),
        newValue: Z(S, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: Z(S, f)
      };
    case "cut":
      return {
        oldValue: Z(i, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Kt(t, {
  stateKey: i,
  serverSync: S,
  localStorage: f,
  formElements: h,
  reactiveDeps: b,
  reactiveType: p,
  componentId: y,
  initialState: s,
  syncUpdate: m,
  dependencies: n,
  serverState: u
} = {}) {
  const [G, R] = st({}), { sessionId: L } = _t();
  let z = !i;
  const [g] = st(i ?? kt()), c = r.getState().stateLog[g], gt = J(/* @__PURE__ */ new Set()), nt = J(y ?? kt()), j = J(
    null
  );
  j.current = at(g) ?? null, rt(() => {
    if (m && m.stateKey === g && m.path?.[0]) {
      ot(g, (o) => ({
        ...o,
        [m.path[0]]: m.newValue
      }));
      const e = `${m.stateKey}:${m.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: m.timeStamp,
        userId: m.userId
      });
    }
  }, [m]), rt(() => {
    if (s) {
      Vt(g, {
        initialState: s
      });
      const e = j.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, d = r.getState().initialStateGlobal[g];
      if (!(d && !Y(d, s) || !d) && !a)
        return;
      let I = null;
      const E = et(e?.localStorage?.key) ? e?.localStorage?.key(s) : e?.localStorage?.key;
      E && L && (I = It(`${L}-${g}-${E}`));
      let A = s, k = !1;
      const P = a ? Date.now() : 0, $ = I?.lastUpdated || 0, O = I?.lastSyncedWithServer || 0;
      a && P > $ ? (A = e.serverState.data, k = !0) : I && $ > O && (A = I.state, e?.localStorage?.onChange && e?.localStorage?.onChange(A)), r.getState().initializeShadowState(g, s), Ot(
        g,
        s,
        A,
        it,
        nt.current,
        L
      ), k && E && L && Nt(A, g, e, L, Date.now()), ft(g), (Array.isArray(p) ? p : [p || "component"]).includes("none") || R({});
    }
  }, [
    s,
    u?.status,
    u?.data,
    ...n || []
  ]), Ct(() => {
    z && Vt(g, {
      serverSync: S,
      formElements: h,
      initialState: s,
      localStorage: f,
      middleware: j.current?.middleware
    });
    const e = `${g}////${nt.current}`, o = r.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(e, {
      forceUpdate: () => R({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), r.getState().stateComponents.set(g, o), R({}), () => {
      o && (o.components.delete(e), o.components.size === 0 && r.getState().stateComponents.delete(g));
    };
  }, []);
  const it = (e, o, a, d) => {
    if (Array.isArray(o)) {
      const I = `${g}-${o.join(".")}`;
      gt.current.add(I);
    }
    const v = r.getState();
    ot(g, (I) => {
      const E = et(e) ? e(I) : e, A = `${g}-${o.join(".")}`;
      if (A) {
        let C = !1, w = v.signalDomElements.get(A);
        if ((!w || w.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const D = o.slice(0, -1), V = Z(E, D);
          if (Array.isArray(V)) {
            C = !0;
            const T = `${g}-${D.join(".")}`;
            w = v.signalDomElements.get(T);
          }
        }
        if (w) {
          const D = C ? Z(E, o.slice(0, -1)) : Z(E, o);
          w.forEach(({ parentId: V, position: T, effect: U }) => {
            const F = document.querySelector(
              `[data-parent-id="${V}"]`
            );
            if (F) {
              const B = Array.from(F.childNodes);
              if (B[T]) {
                const W = U ? new Function("state", `return (${U})(state)`)(D) : D;
                B[T].textContent = String(W);
              }
            }
          });
        }
      }
      console.log("shadowState", v.shadowStateStore), a.updateType === "update" && (d || j.current?.validation?.key) && o && Q(
        (d || j.current?.validation?.key) + "." + o.join(".")
      );
      const k = o.slice(0, o.length - 1);
      a.updateType === "cut" && j.current?.validation?.key && Q(
        j.current?.validation?.key + "." + k.join(".")
      ), a.updateType === "insert" && j.current?.validation?.key && Jt(
        j.current?.validation?.key + "." + k.join(".")
      ).filter(([w, D]) => {
        let V = w?.split(".").length;
        if (w == k.join(".") && V == k.length - 1) {
          let T = w + "." + k;
          Q(w), Mt(T, D);
        }
      });
      const P = v.stateComponents.get(g);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", P), P) {
        const C = Tt(I, E), w = new Set(C), D = a.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          V,
          T
        ] of P.components.entries()) {
          let U = !1;
          const F = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
          if (console.log("component", T), !F.includes("none")) {
            if (F.includes("all")) {
              T.forceUpdate();
              continue;
            }
            if (F.includes("component") && ((T.paths.has(D) || T.paths.has("")) && (U = !0), !U))
              for (const B of w) {
                let W = B;
                for (; ; ) {
                  if (T.paths.has(W)) {
                    U = !0;
                    break;
                  }
                  const x = W.lastIndexOf(".");
                  if (x !== -1) {
                    const _ = W.substring(
                      0,
                      x
                    );
                    if (!isNaN(
                      Number(W.substring(x + 1))
                    ) && T.paths.has(_)) {
                      U = !0;
                      break;
                    }
                    W = _;
                  } else
                    W = "";
                  if (W === "")
                    break;
                }
                if (U) break;
              }
            if (!U && F.includes("deps") && T.depsFunction) {
              const B = T.depsFunction(E);
              let W = !1;
              typeof B == "boolean" ? B && (W = !0) : Y(T.deps, B) || (T.deps = B, W = !0), W && (U = !0);
            }
            U && T.forceUpdate();
          }
        }
      }
      const $ = Date.now();
      o = o.map((C, w) => {
        const D = o.slice(0, -1), V = Z(E, D);
        return w === o.length - 1 && ["insert", "cut"].includes(a.updateType) ? (V.length - 1).toString() : C;
      });
      const { oldValue: O, newValue: H } = Qt(
        a.updateType,
        I,
        E,
        o
      ), K = {
        timeStamp: $,
        stateKey: g,
        path: o,
        updateType: a.updateType,
        status: "new",
        oldValue: O,
        newValue: H
      };
      switch (a.updateType) {
        case "update":
          v.updateShadowAtPath(g, o, E);
          break;
        case "insert":
          const C = o.slice(0, -1), D = { _cogsId: H.id ?? H.key ?? Dt() };
          v.insertShadowArrayElement(g, C, D);
          break;
        case "cut":
          const V = o.slice(0, -1), T = parseInt(o[o.length - 1]);
          v.removeShadowArrayElement(g, V, T);
          break;
      }
      if (Yt(g, (C) => {
        const D = [...C ?? [], K].reduce((V, T) => {
          const U = `${T.stateKey}:${JSON.stringify(T.path)}`, F = V.get(U);
          return F ? (F.timeStamp = Math.max(F.timeStamp, T.timeStamp), F.newValue = T.newValue, F.oldValue = F.oldValue ?? T.oldValue, F.updateType = T.updateType) : V.set(U, { ...T }), V;
        }, /* @__PURE__ */ new Map());
        return Array.from(D.values());
      }), Nt(
        E,
        g,
        j.current,
        L
      ), j.current?.middleware && j.current.middleware({
        updateLog: c,
        update: K
      }), j.current?.serverSync) {
        const C = v.serverState[g], w = j.current?.serverSync;
        Zt(g, {
          syncKey: typeof w.syncKey == "string" ? w.syncKey : w.syncKey({ state: E }),
          rollBackState: C,
          actionTimeStamp: Date.now() + (w.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  r.getState().updaterState[g] || (ht(
    g,
    yt(
      g,
      it,
      nt.current,
      L
    )
  ), r.getState().cogsStateStore[g] || ot(g, t), r.getState().initialStateGlobal[g] || xt(g, t));
  const l = Et(() => yt(
    g,
    it,
    nt.current,
    L
  ), [g, L]);
  return [Rt(g), l];
}
function yt(t, i, S, f) {
  const h = /* @__PURE__ */ new Map();
  let b = 0;
  const p = (m) => {
    const n = m.join(".");
    for (const [u] of h)
      (u === n || u.startsWith(n + ".")) && h.delete(u);
    b++;
  }, y = {
    removeValidation: (m) => {
      m?.validationKey && Q(m.validationKey);
    },
    revertToInitialState: (m) => {
      const n = r.getState().getInitialOptions(t)?.validation;
      n?.key && Q(n?.key), m?.validationKey && Q(m.validationKey);
      const u = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), h.clear(), b++;
      const G = s(u, []), R = at(t), L = et(R?.localStorage?.key) ? R?.localStorage?.key(u) : R?.localStorage?.key, z = `${f}-${t}-${L}`;
      z && localStorage.removeItem(z), ht(t, G), ot(t, u);
      const g = r.getState().stateComponents.get(t);
      return g && g.components.forEach((c) => {
        c.forceUpdate();
      }), u;
    },
    updateInitialState: (m) => {
      h.clear(), b++;
      const n = yt(
        t,
        i,
        S,
        f
      ), u = r.getState().initialStateGlobal[t], G = at(t), R = et(G?.localStorage?.key) ? G?.localStorage?.key(u) : G?.localStorage?.key, L = `${f}-${t}-${R}`;
      return localStorage.getItem(L) && localStorage.removeItem(L), Ft(() => {
        xt(t, m), r.getState().initializeShadowState(t, m), ht(t, n), ot(t, m);
        const z = r.getState().stateComponents.get(t);
        z && z.components.forEach((g) => {
          g.forceUpdate();
        });
      }), {
        fetchId: (z) => n.get()[z]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const m = r.getState().serverState[t];
      return !!(m && Y(m, Rt(t)));
    }
  };
  function s(m, n = [], u) {
    const G = n.map(String).join(".");
    h.get(G);
    const R = function() {
      return r().getNestedState(t, n);
    };
    Object.keys(y).forEach((g) => {
      R[g] = y[g];
    });
    const L = {
      apply(g, c, gt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, n);
      },
      get(g, c) {
        u?.validIndices && !Array.isArray(m) && (u = { ...u, validIndices: void 0 });
        const gt = /* @__PURE__ */ new Set([
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
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender" && !gt.has(c)) {
          const l = `${t}////${S}`, e = r.getState().stateComponents.get(t);
          if (e) {
            const o = e.components.get(l);
            if (o && !o.paths.has("")) {
              const a = n.join(".");
              let d = !0;
              for (const v of o.paths)
                if (a.startsWith(v) && (a === v || a[v.length] === ".")) {
                  d = !1;
                  break;
                }
              d && o.paths.add(a);
            }
          }
        }
        if (c === "getDifferences")
          return () => Tt(
            r.getState().cogsStateStore[t],
            r.getState().initialStateGlobal[t]
          );
        if (c === "sync" && n.length === 0)
          return async function() {
            const l = r.getState().getInitialOptions(t), e = l?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const o = r.getState().getNestedState(t, []), a = l?.validation?.key;
            try {
              const d = await e.action(o);
              if (d && !d.success && d.errors && a) {
                r.getState().removeValidationError(a), d.errors.forEach((I) => {
                  const E = [a, ...I.path].join(".");
                  r.getState().addValidationError(E, I.message);
                });
                const v = r.getState().stateComponents.get(t);
                v && v.components.forEach((I) => {
                  I.forceUpdate();
                });
              }
              return d?.success && e.onSuccess ? e.onSuccess(d.data) : !d?.success && e.onError && e.onError(d.error), d;
            } catch (d) {
              return e.onError && e.onError(d), { success: !1, error: d };
            }
          };
        if (c === "_status") {
          const l = r.getState().getNestedState(t, n), e = r.getState().initialStateGlobal[t], o = Z(e, n);
          return Y(l, o) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const l = r().getNestedState(
              t,
              n
            ), e = r.getState().initialStateGlobal[t], o = Z(e, n);
            return Y(l, o) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const l = r.getState().initialStateGlobal[t], e = at(t), o = et(e?.localStorage?.key) ? e?.localStorage?.key(l) : e?.localStorage?.key, a = `${f}-${t}-${o}`;
            a && localStorage.removeItem(a);
          };
        if (c === "showValidationErrors")
          return () => {
            const l = r.getState().getInitialOptions(t)?.validation;
            if (!l?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(l.key + "." + n.join("."));
          };
        if (Array.isArray(m)) {
          const l = () => u?.validIndices ? m.map((o, a) => ({
            item: o,
            originalIndex: u.validIndices[a]
          })) : r.getState().getNestedState(t, n).map((o, a) => ({
            item: o,
            originalIndex: a
          }));
          if (c === "getSelected")
            return () => {
              const e = r.getState().getSelectedIndex(t, n.join("."));
              if (e !== void 0)
                return s(
                  m[e],
                  [...n, e.toString()],
                  u
                );
            };
          if (c === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: t, path: n });
            };
          if (c === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(t, n.join(".")) ?? -1;
          if (c === "useVirtualView")
            return (e) => {
              const {
                itemHeight: o = 50,
                overscan: a = 6,
                stickToBottom: d = !1,
                dependencies: v = []
              } = e, I = J(null), [E, A] = st({
                startIndex: 0,
                endIndex: 10
              }), [k, P] = st(0), $ = J(!0), O = J(!1), H = J(0), K = J(E);
              rt(() => r.getState().subscribeToShadowState(t, () => {
                P((_) => _ + 1);
              }), [t]);
              const C = r().getNestedState(
                t,
                n
              ), w = C.length, { totalHeight: D, positions: V } = Et(() => {
                const x = r.getState().getShadowMetadata(t, n), _ = Array.isArray(x) ? x : [];
                let N = 0;
                const q = [];
                for (let M = 0; M < w; M++) {
                  q[M] = N;
                  const tt = _[M]?.virtualizer?.itemHeight;
                  N += tt || o;
                }
                return { totalHeight: N, positions: q };
              }, [
                w,
                t,
                n.join("."),
                o,
                k
              ]), T = Et(() => {
                const x = Math.max(0, E.startIndex), _ = Math.min(w, E.endIndex), N = Array.from(
                  { length: _ - x },
                  (M, tt) => x + tt
                ), q = N.map((M) => C[M]);
                return s(q, n, {
                  ...u,
                  validIndices: N
                });
              }, [E.startIndex, E.endIndex, C, w]), U = mt(() => {
                const x = r.getState().getShadowMetadata(t, n), _ = Array.isArray(x) ? x : [], N = w - 1;
                if (N >= 0) {
                  const q = _[N];
                  if (q?.virtualizer?.domRef) {
                    const M = q.virtualizer.domRef;
                    if (M && M.scrollIntoView)
                      return M.scrollIntoView({
                        behavior: "auto",
                        block: "end",
                        inline: "nearest"
                      }), !0;
                  }
                }
                return !1;
              }, [t, n, w]);
              rt(() => {
                if (!d || w === 0) return;
                const x = w > H.current, _ = H.current === 0 && w > 0;
                if ((x || _) && $.current && !O.current) {
                  const N = Math.ceil(
                    (I.current?.clientHeight || 0) / o
                  ), q = {
                    startIndex: Math.max(
                      0,
                      w - N - a
                    ),
                    endIndex: w
                  };
                  A(q);
                  const M = setTimeout(() => {
                    B(w - 1, "smooth");
                  }, 50);
                  return () => clearTimeout(M);
                }
                H.current = w;
              }, [w, o, a]), rt(() => {
                const x = I.current;
                if (!x) return;
                const _ = () => {
                  const { scrollTop: N, scrollHeight: q, clientHeight: M } = x, tt = q - N - M;
                  $.current = tt < 5, tt > 100 && (O.current = !0), tt < 5 && (O.current = !1);
                  let ct = 0;
                  for (let X = 0; X < V.length; X++)
                    if (V[X] > N - o * a) {
                      ct = Math.max(0, X - 1);
                      break;
                    }
                  let lt = ct;
                  const jt = N + M;
                  for (let X = ct; X < V.length && !(V[X] > jt + o * a); X++)
                    lt = X;
                  const vt = Math.max(0, ct), wt = Math.min(
                    w,
                    lt + 1 + a
                  );
                  (vt !== K.current.startIndex || wt !== K.current.endIndex) && (K.current = {
                    startIndex: vt,
                    endIndex: wt
                  }, A({
                    startIndex: vt,
                    endIndex: wt
                  }));
                };
                if (x.addEventListener("scroll", _, {
                  passive: !0
                }), d && w > 0 && !O.current) {
                  const { scrollTop: N } = x;
                  N === 0 && (x.scrollTop = x.scrollHeight, $.current = !0);
                }
                return _(), () => {
                  x.removeEventListener("scroll", _);
                };
              }, [V, w, o, a, d]);
              const F = mt(() => {
                $.current = !0, O.current = !1, !U() && I.current && (I.current.scrollTop = I.current.scrollHeight);
              }, [U]), B = mt(
                (x, _ = "smooth") => {
                  const N = I.current;
                  if (!N) return;
                  if (x === w - 1) {
                    N.scrollTo({
                      top: N.scrollHeight,
                      behavior: _
                    });
                    return;
                  }
                  const M = r.getState().getShadowMetadata(t, n), lt = (Array.isArray(M) ? M : [])[x]?.virtualizer?.domRef;
                  lt ? lt.scrollIntoView({
                    behavior: _,
                    block: "center"
                  }) : V[x] !== void 0 && N.scrollTo({
                    top: V[x],
                    behavior: _
                  });
                },
                [V, t, n, w]
                // Add totalCount to the dependencies
              ), W = {
                outer: {
                  ref: I,
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
                    transform: `translateY(${V[E.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: T,
                virtualizerProps: W,
                scrollToBottom: F,
                scrollToIndex: B
              };
            };
          if (c === "stateMapNoRender")
            return (e) => m.map((a, d) => {
              let v;
              u?.validIndices && u.validIndices[d] !== void 0 ? v = u.validIndices[d] : v = d;
              const I = [...n, v.toString()], E = s(a, I, u);
              return e(
                a,
                E,
                d,
                m,
                s(m, n, u)
              );
            });
          if (c === "$stateMap")
            return (e) => ut(te, {
              proxy: {
                _stateKey: t,
                _path: n,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (c === "stateList")
            return (e, o) => {
              const a = r.getState().getNestedState(t, n);
              return Array.isArray(a) ? (u?.validIndices || Array.from({ length: a.length }, (v, I) => I)).map((v, I) => {
                const E = a[v], A = [...n, v.toString()], k = s(E, A, u), P = `${S}-${n.join(".")}-${v}`;
                return ut(ne, {
                  key: v,
                  stateKey: t,
                  itemComponentId: P,
                  formOpts: o,
                  itemPath: A,
                  children: e(
                    E,
                    k,
                    { localIndex: I, originalIndex: v },
                    a,
                    s(a, n, u)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (c === "stateFlattenOn")
            return (e) => {
              const o = m;
              h.clear(), b++;
              const a = o.flatMap(
                (d) => d[e] ?? []
              );
              return s(
                a,
                [...n, "[*]", e],
                u
              );
            };
          if (c === "index")
            return (e) => {
              const o = m[e];
              return s(o, [...n, e.toString()]);
            };
          if (c === "last")
            return () => {
              const e = r.getState().getNestedState(t, n);
              if (e.length === 0) return;
              const o = e.length - 1, a = e[o], d = [...n, o.toString()];
              return s(a, d);
            };
          if (c === "insert")
            return (e) => (p(n), pt(i, e, n, t), s(
              r.getState().getNestedState(t, n),
              n
            ));
          if (c === "uniqueInsert")
            return (e, o, a) => {
              const d = r.getState().getNestedState(t, n), v = et(e) ? e(d) : e;
              let I = null;
              if (!d.some((A) => {
                if (o) {
                  const P = o.every(
                    ($) => Y(A[$], v[$])
                  );
                  return P && (I = A), P;
                }
                const k = Y(A, v);
                return k && (I = A), k;
              }))
                p(n), pt(i, v, n, t);
              else if (a && I) {
                const A = a(I), k = d.map(
                  (P) => Y(P, I) ? A : P
                );
                p(n), dt(i, k, n);
              }
            };
          if (c === "cut")
            return (e, o) => {
              if (!o?.waitForSync)
                return p(n), St(i, n, t, e), s(
                  r.getState().getNestedState(t, n),
                  n
                );
            };
          if (c === "cutByValue")
            return (e) => {
              for (let o = 0; o < m.length; o++)
                m[o] === e && St(i, n, t, o);
            };
          if (c === "toggleByValue")
            return (e) => {
              const o = m.findIndex((a) => a === e);
              o > -1 ? St(i, n, t, o) : pt(i, e, n, t);
            };
          if (c === "stateFind")
            return (e) => {
              const a = l().find(
                ({ item: v }, I) => e(v, I)
              );
              if (!a) return;
              const d = [...n, a.originalIndex.toString()];
              return s(a.item, d, u);
            };
          if (c === "findWith")
            return (e, o) => {
              const d = l().find(
                ({ item: I }) => I[e] === o
              );
              if (!d) return;
              const v = [...n, d.originalIndex.toString()];
              return s(d.item, v, u);
            };
        }
        const nt = n[n.length - 1];
        if (!isNaN(Number(nt))) {
          const l = n.slice(0, -1), e = r.getState().getNestedState(t, l);
          if (Array.isArray(e) && c === "cut")
            return () => St(
              i,
              l,
              t,
              Number(nt)
            );
        }
        if (c === "get")
          return () => {
            if (u?.validIndices && Array.isArray(m)) {
              const l = r.getState().getNestedState(t, n);
              return u.validIndices.map((e) => l[e]);
            }
            return r.getState().getNestedState(t, n);
          };
        if (c === "$derive")
          return (l) => Pt({
            _stateKey: t,
            _path: n,
            _effect: l.toString()
          });
        if (c === "$get")
          return () => Pt({
            _stateKey: t,
            _path: n
          });
        if (c === "lastSynced") {
          const l = `${t}:${n.join(".")}`;
          return r.getState().getSyncInfo(l);
        }
        if (c == "getLocalStorage")
          return (l) => It(f + "-" + t + "-" + l);
        if (c === "_selected") {
          const l = n.slice(0, -1), e = l.join("."), o = r.getState().getNestedState(t, l);
          return Array.isArray(o) ? Number(n[n.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (c === "setSelected")
          return (l) => {
            const e = n.slice(0, -1), o = Number(n[n.length - 1]), a = e.join(".");
            l ? r.getState().setSelectedIndex(t, a, o) : r.getState().setSelectedIndex(t, a, void 0);
            const d = r.getState().getNestedState(t, [...e]);
            dt(i, d, e), p(e);
          };
        if (c === "toggleSelected")
          return () => {
            const l = n.slice(0, -1), e = Number(n[n.length - 1]), o = l.join("."), a = r.getState().getSelectedIndex(t, o);
            r.getState().setSelectedIndex(
              t,
              o,
              a === e ? void 0 : e
            );
            const d = r.getState().getNestedState(t, [...l]);
            dt(i, d, l), p(l);
          };
        if (n.length == 0) {
          if (c === "addValidation")
            return (l) => {
              const e = r.getState().getInitialOptions(t)?.validation;
              if (!e?.key)
                throw new Error("Validation key not found");
              Q(e.key), console.log("addValidationError", l), l.forEach((o) => {
                const a = [e.key, ...o.path].join(".");
                console.log("fullErrorPath", a), Mt(a, o.message);
              }), ft(t);
            };
          if (c === "applyJsonPatch")
            return (l) => {
              const e = r.getState().cogsStateStore[t], a = Bt(e, l).newDocument;
              Ot(
                t,
                r.getState().initialStateGlobal[t],
                a,
                i,
                S,
                f
              );
              const d = r.getState().stateComponents.get(t);
              if (d) {
                const v = Tt(e, a), I = new Set(v);
                for (const [
                  E,
                  A
                ] of d.components.entries()) {
                  let k = !1;
                  const P = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
                  if (!P.includes("none")) {
                    if (P.includes("all")) {
                      A.forceUpdate();
                      continue;
                    }
                    if (P.includes("component") && (A.paths.has("") && (k = !0), !k))
                      for (const $ of I) {
                        if (A.paths.has($)) {
                          k = !0;
                          break;
                        }
                        let O = $.lastIndexOf(".");
                        for (; O !== -1; ) {
                          const H = $.substring(0, O);
                          if (A.paths.has(H)) {
                            k = !0;
                            break;
                          }
                          const K = $.substring(
                            O + 1
                          );
                          if (!isNaN(Number(K))) {
                            const C = H.lastIndexOf(".");
                            if (C !== -1) {
                              const w = H.substring(
                                0,
                                C
                              );
                              if (A.paths.has(w)) {
                                k = !0;
                                break;
                              }
                            }
                          }
                          O = H.lastIndexOf(".");
                        }
                        if (k) break;
                      }
                    if (!k && P.includes("deps") && A.depsFunction) {
                      const $ = A.depsFunction(a);
                      let O = !1;
                      typeof $ == "boolean" ? $ && (O = !0) : Y(A.deps, $) || (A.deps = $, O = !0), O && (k = !0);
                    }
                    k && A.forceUpdate();
                  }
                }
              }
            };
          if (c === "validateZodSchema")
            return () => {
              const l = r.getState().getInitialOptions(t)?.validation, e = r.getState().addValidationError;
              if (!l?.zodSchema)
                throw new Error("Zod schema not found");
              if (!l?.key)
                throw new Error("Validation key not found");
              Q(l.key);
              const o = r.getState().cogsStateStore[t];
              try {
                const a = r.getState().getValidationErrors(l.key);
                a && a.length > 0 && a.forEach(([v]) => {
                  v && v.startsWith(l.key) && Q(v);
                });
                const d = l.zodSchema.safeParse(o);
                return d.success ? !0 : (d.error.errors.forEach((I) => {
                  const E = I.path, A = I.message, k = [l.key, ...E].join(".");
                  e(k, A);
                }), ft(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (c === "_componentId") return S;
          if (c === "getComponents")
            return () => r().stateComponents.get(t);
          if (c === "getAllFormRefs")
            return () => bt.getState().getFormRefsByStateKey(t);
          if (c === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (c === "_serverState")
            return r.getState().serverState[t];
          if (c === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (c === "revertToInitialState")
            return y.revertToInitialState;
          if (c === "updateInitialState") return y.updateInitialState;
          if (c === "removeValidation") return y.removeValidation;
        }
        if (c === "getFormRef")
          return () => bt.getState().getFormRef(t + "." + n.join("."));
        if (c === "validationWrapper")
          return ({
            children: l,
            hideMessage: e
          }) => /* @__PURE__ */ At(
            Wt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              stateKey: t,
              validIndices: u?.validIndices,
              children: l
            }
          );
        if (c === "_stateKey") return t;
        if (c === "_path") return n;
        if (c === "_isServerSynced") return y._isServerSynced;
        if (c === "update")
          return (l, e) => {
            if (e?.debounce)
              Gt(() => {
                dt(i, l, n, "");
                const o = r.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(o);
              }, e.debounce);
            else {
              dt(i, l, n, "");
              const o = r.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(o);
            }
            p(n);
          };
        if (c === "formElement")
          return (l, e) => /* @__PURE__ */ At(
            Ht,
            {
              setState: i,
              stateKey: t,
              path: n,
              child: l,
              formOpts: e
            }
          );
        const j = [...n, c], it = r.getState().getNestedState(t, j);
        return s(it, j, u);
      }
    }, z = new Proxy(R, L);
    return h.set(G, {
      proxy: z,
      stateVersion: b
    }), z;
  }
  return s(
    r.getState().getNestedState(t, [])
  );
}
function Pt(t) {
  return ut(ee, { proxy: t });
}
function te({
  proxy: t,
  rebuildStateShape: i
}) {
  const S = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(S) ? i(
    S,
    t._path
  ).stateMapNoRender(
    (h, b, p, y, s) => t._mapFn(h, b, p, y, s)
  ) : null;
}
function ee({
  proxy: t
}) {
  const i = J(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return rt(() => {
    const f = i.current;
    if (!f || !f.parentElement) return;
    const h = f.parentElement, p = Array.from(h.childNodes).indexOf(f);
    let y = h.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, h.setAttribute("data-parent-id", y));
    const m = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: p,
      effect: t._effect
    };
    r.getState().addSignalElement(S, m);
    const n = r.getState().getNestedState(t._stateKey, t._path);
    let u;
    if (t._effect)
      try {
        u = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (R) {
        console.error("Error evaluating effect function during mount:", R), u = n;
      }
    else
      u = n;
    u !== null && typeof u == "object" && (u = JSON.stringify(u));
    const G = document.createTextNode(String(u));
    f.replaceWith(G);
  }, [t._stateKey, t._path.join("."), t._effect]), ut("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function Ie(t) {
  const i = Ut(
    (S) => {
      const f = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(t._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => f.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return ut("text", {}, String(i));
}
function ne({
  stateKey: t,
  itemComponentId: i,
  itemPath: S,
  formOpts: f,
  children: h
}) {
  const [, b] = st({}), [p, y] = qt(), s = J(null), m = J(null), n = mt(
    (u) => {
      p(u), s.current = u;
    },
    [p]
  );
  return rt(() => {
    y.height > 0 && y.height !== m.current && (m.current = y.height, r.getState().setShadowMetadata(t, S, {
      virtualizer: {
        itemHeight: y.height,
        domRef: s.current
        // Store the actual DOM element reference
      }
    }));
  }, [y.height, t, S]), Ct(() => {
    const u = `${t}////${i}`, G = r.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return G.components.set(u, {
      forceUpdate: () => b({}),
      paths: /* @__PURE__ */ new Set([S.join(".")])
    }), r.getState().stateComponents.set(t, G), () => {
      const R = r.getState().stateComponents.get(t);
      R && R.components.delete(u);
    };
  }, [t, i, S.join(".")]), /* @__PURE__ */ At("div", { ref: n, children: h });
}
export {
  Pt as $cogsSignal,
  Ie as $cogsSignalStore,
  me as addStateOptions,
  he as createCogsState,
  ye as notifyComponent,
  Kt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
