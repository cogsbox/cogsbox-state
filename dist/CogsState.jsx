"use client";
import { jsx as $t } from "react/jsx-runtime";
import { useState as dt, useRef as q, useEffect as at, useLayoutEffect as pt, useMemo as Et, createElement as gt, useSyncExternalStore as Ft, startTransition as Ut, useCallback as St } from "react";
import { transformStateFunc as Dt, isDeepEqual as X, isFunction as et, getNestedValue as L, getDifferences as Pt, debounce as Lt } from "./utility.js";
import { pushFunc as At, updateFn as ut, cutFunc as ft, ValidationWrapper as Gt, FormControlComponent as Ht } from "./Functions.jsx";
import zt from "superjson";
import { v4 as kt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as bt } from "./store.js";
import { useCogsConfig as Rt } from "./CogsStateClient.jsx";
import { applyPatch as Wt } from "fast-json-patch";
import Bt from "react-use-measure";
import "ulid";
function Mt(t, s) {
  const S = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, I = S(t) || {};
  g(t, {
    ...I,
    ...s
  });
}
function Nt({
  stateKey: t,
  options: s,
  initialOptionsPart: S
}) {
  const g = lt(t) || {}, I = S[t] || {}, T = o.getState().setInitialStateOptions, A = { ...I, ...g };
  let v = !1;
  if (s)
    for (const i in s)
      A.hasOwnProperty(i) ? (i == "localStorage" && s[i] && A[i].key !== s[i]?.key && (v = !0, A[i] = s[i]), i == "initialState" && s[i] && A[i] !== s[i] && // Different references
      !X(A[i], s[i]) && (v = !0, A[i] = s[i])) : (v = !0, A[i] = s[i]);
  v && T(t, A);
}
function Se(t, { formElements: s, validation: S }) {
  return { initialState: t, formElements: s, validation: S };
}
const me = (t, s) => {
  let S = t;
  const [g, I] = Dt(S);
  (Object.keys(I).length > 0 || s && Object.keys(s).length > 0) && Object.keys(I).forEach((v) => {
    I[v] = I[v] || {}, I[v].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...I[v].formElements || {}
      // State-specific overrides
    }, lt(v) || o.getState().setInitialStateOptions(v, I[v]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const T = (v, i) => {
    const [$] = dt(i?.componentId ?? kt());
    Nt({
      stateKey: v,
      options: i,
      initialOptionsPart: I
    });
    const y = o.getState().cogsStateStore[v] || g[v], n = i?.modifyState ? i.modifyState(y) : y, [w, O] = Xt(
      n,
      {
        stateKey: v,
        syncUpdate: i?.syncUpdate,
        componentId: $,
        localStorage: i?.localStorage,
        middleware: i?.middleware,
        enabledSync: i?.enabledSync,
        reactiveType: i?.reactiveType,
        reactiveDeps: i?.reactiveDeps,
        initialState: i?.initialState,
        dependencies: i?.dependencies,
        serverState: i?.serverState
      }
    );
    return O;
  };
  function A(v, i) {
    Nt({ stateKey: v, options: i, initialOptionsPart: I }), i.localStorage && Yt(v, i), ot(v);
  }
  return { useCogsState: T, setCogsOptions: A };
}, {
  setUpdaterState: mt,
  setState: st,
  getInitialOptions: lt,
  getKeyState: Ot,
  getValidationErrors: qt,
  setStateLog: Jt,
  updateInitialStateGlobal: xt,
  addValidationError: Tt,
  removeValidationError: tt,
  setServerSyncActions: Zt
} = o.getState(), Ct = (t, s, S, g, I) => {
  S?.log && console.log(
    "saving to localstorage",
    s,
    S.localStorage?.key,
    g
  );
  const T = et(S?.localStorage?.key) ? S.localStorage?.key(t) : S?.localStorage?.key;
  if (T && g) {
    const A = `${g}-${s}-${T}`;
    let v;
    try {
      v = yt(A)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: I ?? v
    }, $ = zt.serialize(i);
    window.localStorage.setItem(
      A,
      JSON.stringify($.json)
    );
  }
}, yt = (t) => {
  if (!t) return null;
  try {
    const s = window.localStorage.getItem(t);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, Yt = (t, s) => {
  const S = o.getState().cogsStateStore[t], { sessionId: g } = Rt(), I = et(s?.localStorage?.key) ? s.localStorage.key(S) : s?.localStorage?.key;
  if (I && g) {
    const T = yt(
      `${g}-${t}-${I}`
    );
    if (T && T.lastUpdated > (T.lastSyncedWithServer || 0))
      return st(t, T.state), ot(t), !0;
  }
  return !1;
}, jt = (t, s, S, g, I, T) => {
  const A = {
    initialState: s,
    updaterState: It(
      t,
      g,
      I,
      T
    ),
    state: S
  };
  xt(t, A.initialState), mt(t, A.updaterState), st(t, A.state);
}, ot = (t) => {
  const s = o.getState().stateComponents.get(t);
  if (!s) return;
  const S = /* @__PURE__ */ new Set();
  s.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || S.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((g) => g());
  });
}, Ie = (t, s) => {
  const S = o.getState().stateComponents.get(t);
  if (S) {
    const g = `${t}////${s}`, I = S.components.get(g);
    if ((I ? Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"] : null)?.includes("none"))
      return;
    I && I.forceUpdate();
  }
}, Qt = (t, s, S, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: L(s, g),
        newValue: L(S, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: L(S, g)
      };
    case "cut":
      return {
        oldValue: L(s, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Xt(t, {
  stateKey: s,
  serverSync: S,
  localStorage: g,
  formElements: I,
  reactiveDeps: T,
  reactiveType: A,
  componentId: v,
  initialState: i,
  syncUpdate: $,
  dependencies: y,
  serverState: n
} = {}) {
  const [w, O] = dt({}), { sessionId: p } = Rt();
  let K = !s;
  const [f] = dt(s ?? kt()), z = o.getState().stateLog[f], c = q(/* @__PURE__ */ new Set()), nt = q(v ?? kt()), R = q(
    null
  );
  R.current = lt(f) ?? null, at(() => {
    if ($ && $.stateKey === f && $.path?.[0]) {
      st(f, (e) => ({
        ...e,
        [$.path[0]]: $.newValue
      }));
      const r = `${$.stateKey}:${$.path.join(".")}`;
      o.getState().setSyncInfo(r, {
        timeStamp: $.timeStamp,
        userId: $.userId
      });
    }
  }, [$]), at(() => {
    if (i) {
      Mt(f, {
        initialState: i
      });
      const r = R.current, a = r?.serverState?.id !== void 0 && r?.serverState?.status === "success" && r?.serverState?.data, d = o.getState().initialStateGlobal[f];
      if (!(d && !X(d, i) || !d) && !a)
        return;
      let l = null;
      const m = et(r?.localStorage?.key) ? r?.localStorage?.key(i) : r?.localStorage?.key;
      m && p && (l = yt(`${p}-${f}-${m}`));
      let x = i, b = !1;
      const F = a ? Date.now() : 0, W = l?.lastUpdated || 0, D = l?.lastSyncedWithServer || 0;
      a && F > W ? (x = r.serverState.data, b = !0) : l && W > D && (x = l.state, r?.localStorage?.onChange && r?.localStorage?.onChange(x)), o.getState().initializeShadowState(f, i), jt(
        f,
        i,
        x,
        it,
        nt.current,
        p
      ), b && m && p && Ct(x, f, r, p, Date.now()), ot(f), (Array.isArray(A) ? A : [A || "component"]).includes("none") || O({});
    }
  }, [
    i,
    n?.status,
    n?.data,
    ...y || []
  ]), pt(() => {
    K && Mt(f, {
      serverSync: S,
      formElements: I,
      initialState: i,
      localStorage: g,
      middleware: R.current?.middleware
    });
    const r = `${f}////${nt.current}`, e = o.getState().stateComponents.get(f) || {
      components: /* @__PURE__ */ new Map()
    };
    return e.components.set(r, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: T || void 0,
      reactiveType: A ?? ["component", "deps"]
    }), o.getState().stateComponents.set(f, e), O({}), () => {
      e && (e.components.delete(r), e.components.size === 0 && o.getState().stateComponents.delete(f));
    };
  }, []);
  const it = (r, e, a, d) => {
    if (Array.isArray(e)) {
      const l = `${f}-${e.join(".")}`;
      c.current.add(l);
    }
    const u = o.getState();
    st(f, (l) => {
      const m = et(r) ? r(l) : r, x = `${f}-${e.join(".")}`;
      if (x) {
        let P = !1, h = u.signalDomElements.get(x);
        if ((!h || h.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const C = e.slice(0, -1), V = L(m, C);
          if (Array.isArray(V)) {
            P = !0;
            const E = `${f}-${C.join(".")}`;
            h = u.signalDomElements.get(E);
          }
        }
        if (h) {
          const C = P ? L(m, e.slice(0, -1)) : L(m, e);
          h.forEach(({ parentId: V, position: E, effect: M }) => {
            const Z = document.querySelector(
              `[data-parent-id="${V}"]`
            );
            if (Z) {
              const G = Array.from(Z.childNodes);
              if (G[E]) {
                const U = M ? new Function("state", `return (${M})(state)`)(C) : C;
                G[E].textContent = String(U);
              }
            }
          });
        }
      }
      a.updateType === "update" && (d || R.current?.validation?.key) && e && tt(
        (d || R.current?.validation?.key) + "." + e.join(".")
      );
      const b = e.slice(0, e.length - 1);
      a.updateType === "cut" && R.current?.validation?.key && tt(
        R.current?.validation?.key + "." + b.join(".")
      ), a.updateType === "insert" && R.current?.validation?.key && qt(
        R.current?.validation?.key + "." + b.join(".")
      ).filter((h) => {
        let C = h?.split(".").length;
        const V = "";
        if (h == b.join(".") && C == b.length - 1) {
          let E = h + "." + b;
          tt(h), Tt(E, V);
        }
      });
      const F = u.stateComponents.get(f);
      if (F) {
        const P = Pt(l, m), h = new Set(P), C = a.updateType === "update" ? e.join(".") : e.slice(0, -1).join(".") || "";
        for (const [
          V,
          E
        ] of F.components.entries()) {
          let M = !1;
          const Z = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (!Z.includes("none")) {
            if (Z.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if (Z.includes("component") && ((E.paths.has(C) || E.paths.has("")) && (M = !0), !M))
              for (const G of h) {
                let U = G;
                for (; ; ) {
                  if (E.paths.has(U)) {
                    M = !0;
                    break;
                  }
                  const k = U.lastIndexOf(".");
                  if (k !== -1) {
                    const N = U.substring(
                      0,
                      k
                    );
                    if (!isNaN(
                      Number(U.substring(k + 1))
                    ) && E.paths.has(N)) {
                      M = !0;
                      break;
                    }
                    U = N;
                  } else
                    U = "";
                  if (U === "")
                    break;
                }
                if (M) break;
              }
            if (!M && Z.includes("deps") && E.depsFunction) {
              const G = E.depsFunction(m);
              let U = !1;
              typeof G == "boolean" ? G && (U = !0) : X(E.deps, G) || (E.deps = G, U = !0), U && (M = !0);
            }
            M && E.forceUpdate();
          }
        }
      }
      const W = Date.now();
      let { oldValue: D, newValue: B } = Qt(
        a.updateType,
        l,
        m,
        e
      );
      const ct = {
        timeStamp: W,
        stateKey: f,
        path: e,
        updateType: a.updateType,
        status: "new",
        oldValue: D,
        newValue: B
      };
      switch (a.updateType) {
        case "insert": {
          const P = e.slice(0, -1), C = e[e.length - 1].split(":")[1];
          B = L(m, P).find((E) => E.id == C), D = null, u.insertShadowArrayElement(f, P, B);
          break;
        }
        case "cut": {
          D = L(l, e), B = null, u.removeShadowArrayElement(f, e);
          break;
        }
        case "update": {
          D = L(l, e), B = L(m, e);
          const P = e.map((h, C) => {
            const V = e.slice(0, C + 1), E = L(m, V);
            return E?.id ? `id:${E.id}` : h;
          });
          u.updateShadowAtPath(f, P, B);
          break;
        }
      }
      if (Jt(f, (P) => {
        const h = [...P ?? [], ct], C = /* @__PURE__ */ new Map();
        return h.forEach((V) => {
          const E = `${V.stateKey}:${JSON.stringify(V.path)}`, M = C.get(E);
          M ? (M.timeStamp = Math.max(M.timeStamp, V.timeStamp), M.newValue = V.newValue, M.oldValue = M.oldValue ?? V.oldValue, M.updateType = V.updateType) : C.set(E, { ...V });
        }), Array.from(C.values());
      }), Ct(
        m,
        f,
        R.current,
        p
      ), R.current?.middleware && R.current.middleware({
        updateLog: z,
        update: ct
      }), R.current?.serverSync) {
        const P = u.serverState[f], h = R.current?.serverSync;
        Zt(f, {
          syncKey: typeof h.syncKey == "string" ? h.syncKey : h.syncKey({ state: m }),
          rollBackState: P,
          actionTimeStamp: Date.now() + (h.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return m;
    });
  };
  o.getState().updaterState[f] || (mt(
    f,
    It(
      f,
      it,
      nt.current,
      p
    )
  ), o.getState().cogsStateStore[f] || st(f, t), o.getState().initialStateGlobal[f] || xt(f, t));
  const vt = Et(() => It(
    f,
    it,
    nt.current,
    p
  ), [f, p]);
  return [Ot(f), vt];
}
function It(t, s, S, g) {
  const I = /* @__PURE__ */ new Map();
  let T = 0;
  const A = (y) => {
    const n = y.join(".");
    for (const [w] of I)
      (w === n || w.startsWith(n + ".")) && I.delete(w);
    T++;
  }, v = {
    removeValidation: (y) => {
      y?.validationKey && tt(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && tt(n?.key), y?.validationKey && tt(y.validationKey);
      const w = o.getState().initialStateGlobal[t];
      o.getState().initializeShadowState(t, w), o.getState().clearSelectedIndexesForState(t), I.clear(), T++;
      const O = $(w, []), p = lt(t), K = et(p?.localStorage?.key) ? p?.localStorage?.key(w) : p?.localStorage?.key, f = `${g}-${t}-${K}`;
      f && localStorage.removeItem(f), mt(t, O), st(t, w);
      const z = o.getState().stateComponents.get(t);
      return z && z.components.forEach((c) => {
        c.forceUpdate();
      }), w;
    },
    updateInitialState: (y) => {
      I.clear(), T++;
      const n = It(
        t,
        s,
        S,
        g
      ), w = o.getState().initialStateGlobal[t], O = lt(t), p = et(O?.localStorage?.key) ? O?.localStorage?.key(w) : O?.localStorage?.key, K = `${g}-${t}-${p}`;
      return localStorage.getItem(K) && localStorage.removeItem(K), Ut(() => {
        xt(t, y), o.getState().initializeShadowState(t, y), mt(t, n), st(t, y);
        const f = o.getState().stateComponents.get(t);
        f && f.components.forEach((z) => {
          z.forceUpdate();
        });
      }), {
        fetchId: (f) => n.get()[f]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const y = o.getState().serverState[t];
      return !!(y && X(y, Ot(t)));
    }
  };
  function i(y) {
    const n = [t, ...y].join(".");
    return o.getState().shadowStateStore.get(n)?.arrayKeys || null;
  }
  function $(y, n = [], w) {
    const O = n.map(String).join(".");
    I.get(O);
    const p = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(v).forEach((z) => {
      p[z] = v[z];
    });
    const K = {
      apply(z, c, nt) {
        return o().getNestedState(t, n);
      },
      get(z, c) {
        const nt = /* @__PURE__ */ new Set([
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
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender" && !nt.has(c)) {
          const r = `${t}////${S}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const a = e.components.get(r);
            if (a && !a.paths.has("")) {
              const d = n.join(".");
              let u = !0;
              for (const l of a.paths)
                if (d.startsWith(l) && (d === l || d[l.length] === ".")) {
                  u = !1;
                  break;
                }
              u && a.paths.add(d);
            }
          }
        }
        if (c === "getDifferences")
          return () => Pt(
            o.getState().cogsStateStore[t],
            o.getState().initialStateGlobal[t]
          );
        if (c === "sync" && n.length === 0)
          return async function() {
            const r = o.getState().getInitialOptions(t), e = r?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const a = o.getState().getNestedState(t, []), d = r?.validation?.key;
            try {
              const u = await e.action(a);
              return u && !u.success && u.errors && d && (o.getState().removeValidationError(d), u.errors.forEach((l) => {
                const m = [d, ...l.path].join(".");
                o.getState().addValidationError(m, l.message);
              }), ot(t)), u?.success && e.onSuccess ? e.onSuccess(u.data) : !u?.success && e.onError && e.onError(u.error), u;
            } catch (u) {
              return e.onError && e.onError(u), { success: !1, error: u };
            }
          };
        if (c === "_status") {
          const r = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], a = L(e, n);
          return X(r, a) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const r = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], a = L(e, n);
            return X(r, a) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const r = o.getState().initialStateGlobal[t], e = lt(t), a = et(e?.localStorage?.key) ? e.localStorage.key(r) : e?.localStorage?.key, d = `${g}-${t}-${a}`;
            d && localStorage.removeItem(d);
          };
        if (c === "showValidationErrors")
          return () => {
            const r = o.getState().getInitialOptions(t)?.validation;
            if (!r?.key) throw new Error("Validation key not found");
            return o.getState().getValidationErrors(r.key + "." + n.join("."));
          };
        if (Array.isArray(y)) {
          if (c === "getSelected")
            return () => {
              const r = o.getState().getSelectedIndex(t, n.join("."));
              if (r === void 0) return;
              const e = o.getState().getNestedState(t, n);
              if (!e || r >= e.length)
                return;
              const a = e[r], d = `id:${a.id}`;
              return $(a, [...n, d], w);
            };
          if (c === "clearSelected")
            return () => {
              o.getState().clearSelectedIndex({ stateKey: t, path: n });
            };
          if (c === "getSelectedIndex")
            return () => {
              const r = o.getState().getSelectedIndex(t, n.join("."));
              if (r === void 0) return -1;
              if (w?.validIds) {
                const a = (i(n) || [])[r];
                return a ? w.validIds.indexOf(a) : -1;
              }
              return r;
            };
          if (c === "useVirtualView")
            return (r) => {
              const {
                itemHeight: e = 50,
                overscan: a = 6,
                stickToBottom: d = !1,
                dependencies: u = []
              } = r, l = q(null), [m, x] = dt({
                startIndex: 0,
                endIndex: 10
              }), [b, F] = dt(0), W = q(!0), D = q(!1), B = q(0), ct = q(m);
              i(n), at(() => o.getState().subscribeToShadowState(t, () => {
                F((N) => N + 1);
              }), [t]);
              const P = o().getNestedState(
                t,
                n
              ), h = P.length, { totalHeight: C, positions: V } = Et(() => {
                const N = o.getState().getShadowMetadata(t, n)?.arrayKeys || [];
                let _ = 0;
                const H = [];
                for (let j = 0; j < h; j++) {
                  H[j] = _;
                  const Y = N[j];
                  let J = e;
                  Y && (J = o.getState().getShadowMetadata(t, [...n, Y])?.virtualizer?.itemHeight || e), _ += J;
                }
                return { totalHeight: _, positions: H };
              }, [
                h,
                t,
                n.join("."),
                e,
                b
              ]), E = Et(() => {
                const k = Math.max(0, m.startIndex), N = Math.min(h, m.endIndex), H = o.getState().getShadowMetadata(t, n)?.arrayKeys || [], j = P.slice(k, N), Y = H.slice(k, N);
                return $(j, n, {
                  ...w,
                  validIds: Y
                });
              }, [m.startIndex, m.endIndex, P, h]), M = St(() => {
                const k = o.getState().getShadowMetadata(t, n);
                if (!k || k && k?.arrayKeys?.length === 0)
                  return !1;
                const N = h - 1, _ = [...n, k.arrayKeys[N]];
                if (N >= 0) {
                  const H = o.getState().getShadowMetadata(t, _);
                  if (H?.virtualizer?.domRef) {
                    const j = H.virtualizer.domRef;
                    if (j && j.scrollIntoView)
                      return j.scrollIntoView({
                        behavior: "auto",
                        block: "end",
                        inline: "nearest"
                      }), !0;
                  }
                }
                return !1;
              }, [t, n, h]);
              at(() => {
                if (!d || h === 0) return;
                const k = h > B.current, N = B.current === 0 && h > 0;
                if ((k || N) && W.current && !D.current) {
                  const _ = Math.ceil(
                    (l.current?.clientHeight || 0) / e
                  ), H = {
                    startIndex: Math.max(
                      0,
                      h - _ - a
                    ),
                    endIndex: h
                  };
                  x(H);
                  const j = setTimeout(() => {
                    G(h - 1, "smooth");
                  }, 50);
                  return () => clearTimeout(j);
                }
                B.current = h;
              }, [h, e, a]), at(() => {
                const k = l.current;
                if (!k) return;
                const N = () => {
                  const { scrollTop: _, scrollHeight: H, clientHeight: j } = k, Y = H - _ - j;
                  W.current = Y < 5, Y > 100 && (D.current = !0), Y < 5 && (D.current = !1);
                  let J = 0;
                  for (let Q = 0; Q < V.length; Q++)
                    if (V[Q] > _ - e * a) {
                      J = Math.max(0, Q - 1);
                      break;
                    }
                  let rt = J;
                  const Vt = _ + j;
                  for (let Q = J; Q < V.length && !(V[Q] > Vt + e * a); Q++)
                    rt = Q;
                  const ht = Math.max(0, J), wt = Math.min(
                    h,
                    rt + 1 + a
                  );
                  (ht !== ct.current.startIndex || wt !== ct.current.endIndex) && (ct.current = {
                    startIndex: ht,
                    endIndex: wt
                  }, x({
                    startIndex: ht,
                    endIndex: wt
                  }));
                };
                if (k.addEventListener("scroll", N, {
                  passive: !0
                }), d && h > 0 && !D.current) {
                  const { scrollTop: _ } = k;
                  _ === 0 && (k.scrollTop = k.scrollHeight, W.current = !0);
                }
                return N(), () => {
                  k.removeEventListener("scroll", N);
                };
              }, [V, h, e, a, d]);
              const Z = St(() => {
                W.current = !0, D.current = !1, !M() && l.current && (l.current.scrollTop = l.current.scrollHeight);
              }, [M]), G = St(
                (k, N = "smooth") => {
                  const _ = l.current;
                  if (!_) return;
                  if (k === h - 1) {
                    _.scrollTo({
                      top: _.scrollHeight,
                      behavior: N
                    });
                    return;
                  }
                  const J = (o.getState().getShadowMetadata(t, n)?.arrayKeys || [])[k];
                  let rt;
                  J && (rt = o.getState().getShadowMetadata(t, [...n, J])?.virtualizer?.domRef), rt ? rt.scrollIntoView({
                    behavior: N,
                    block: "center"
                  }) : V[k] !== void 0 && _.scrollTo({
                    top: V[k],
                    behavior: N
                  });
                },
                [V, t, n, h]
                // Add totalCount to the dependencies
              ), U = {
                outer: {
                  ref: l,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${C}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${V[m.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: E,
                virtualizerProps: U,
                scrollToBottom: Z,
                scrollToIndex: G
              };
            };
          if (c === "stateMap")
            return (r) => {
              const e = y, a = w?.validIds || i(n) || [], d = $(y, n, w);
              return e.map((u, l) => {
                const m = a[l] || `id:${u.id}`, x = [...n, m], b = $(u, x, w);
                return r(
                  u,
                  b,
                  l,
                  y,
                  d
                );
              });
            };
          if (c === "stateMapNoRender")
            return (r) => {
              const e = y, a = w?.validIds || i(n) || [], d = $(y, n, w);
              return e.map((u, l) => {
                const m = a[l] || `id:${u.id}`, x = [...n, m], b = $(u, x, w);
                return r(
                  u,
                  b,
                  l,
                  y,
                  d
                );
              });
            };
          if (c === "$stateMap")
            return (r) => gt(Kt, {
              proxy: { _stateKey: t, _path: n, _mapFn: r },
              rebuildStateShape: $
            });
          if (c === "stateList")
            return (r) => {
              const e = y;
              if (!Array.isArray(e)) return null;
              const a = w?.validIds || i(n) || [], d = i(n) || [], u = $(
                e,
                n,
                w
              );
              return e.map((l, m) => {
                const x = a[m] || `id:${l.id}`, b = d.indexOf(x), F = [...n, x], W = $(l, F, w), D = `${S}-${n.join(".")}-${x}`;
                return gt(ee, {
                  key: x,
                  stateKey: t,
                  itemComponentId: D,
                  itemPath: F,
                  children: r(
                    l,
                    W,
                    { localIndex: m, originalIndex: b },
                    e,
                    u
                  )
                });
              });
            };
          if (c === "stateFlattenOn")
            return (r) => {
              const e = y;
              I.clear(), T++;
              const a = e.flatMap(
                (d) => d[r] ?? []
              );
              return $(
                a,
                [...n, "[*]", r],
                w
              );
            };
          if (c === "index")
            return (r) => {
              const a = (w?.validIds || i(n))?.[r];
              if (!a)
                return $(void 0, [
                  ...n,
                  r.toString()
                ]);
              const u = o.getState().getNestedState(t, n).find(
                (m) => `id:${m.id}` === a
              ), l = [...n, a];
              return $(u, l, w);
            };
          if (c === "last")
            return () => {
              const r = o.getState().getNestedState(t, n);
              if (r.length === 0) return;
              const e = r.length - 1, a = r[e], d = [...n, e.toString()];
              return $(a, d);
            };
          if (c === "insert")
            return (r) => (A(n), At(s, r, n, t), $(
              o.getState().getNestedState(t, n),
              n
            ));
          if (c === "uniqueInsert")
            return (r, e, a) => {
              const d = o.getState().getNestedState(t, n), u = et(r) ? r(d) : r;
              let l = null;
              if (!d.some((x) => {
                const b = e ? e.every(
                  (F) => X(x[F], u[F])
                ) : X(x, u);
                return b && (l = x), b;
              }))
                A(n), At(s, u, n, t);
              else if (a && l) {
                const x = a(l), b = d.map(
                  (F) => X(F, l) ? x : F
                );
                A(n), ut(s, b, n);
              }
            };
          if (c === "cut")
            return (r, e) => {
              if (!e?.waitForSync)
                return A(n), ft(s, n, t, r), $(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (c === "cutByValue")
            return (r) => {
              const e = y.findIndex((a) => a === r);
              e > -1 && ft(s, n, t, e);
            };
          if (c === "toggleByValue")
            return (r) => {
              const e = y.findIndex((a) => a === r);
              e > -1 ? ft(s, n, t, e) : At(s, r, n, t);
            };
          if (c === "stateFilter")
            return (r) => {
              const e = w?.validIds || i(n) || [], a = o.getState().getNestedState(t, n), d = new Map(
                a.map((m) => [`id:${m.id}`, m])
              ), u = [], l = [];
              return e.forEach((m, x) => {
                const b = d.get(m);
                b && r(b, x) && (u.push(m), l.push(b));
              }), $(l, n, {
                validIds: u
              });
            };
          if (c === "stateSort")
            return (r) => {
              const a = y.map((l) => ({
                item: l,
                id: `id:${l.id}`
              }));
              a.sort((l, m) => r(l.item, m.item));
              const d = a.map((l) => l.item), u = a.map((l) => l.id);
              return $(d, n, {
                validIds: u
              });
            };
          if (c === "findWith")
            return (r, e) => {
              const a = y.find(
                (l) => l[r] === e
              );
              if (!a) return;
              const d = `id:${a.id}`, u = [...n, d];
              return $(a, u, w);
            };
        }
        const R = n[n.length - 1];
        if (!isNaN(Number(R))) {
          const r = n.slice(0, -1), e = o.getState().getNestedState(t, r);
          if (Array.isArray(e) && c === "cut")
            return () => ft(
              s,
              r,
              t,
              Number(R)
            );
        }
        if (c === "get")
          return () => {
            if (w?.validIds && Array.isArray(y)) {
              const r = o.getState().getNestedState(t, n);
              if (!Array.isArray(r)) return [];
              const e = new Map(
                r.map((a) => [`id:${a.id}`, a])
              );
              return w.validIds.map((a) => e.get(a)).filter(Boolean);
            }
            return o.getState().getNestedState(t, n);
          };
        if (c === "$derive")
          return (r) => _t({
            _stateKey: t,
            _path: n,
            _effect: r.toString()
          });
        if (c === "$get")
          return () => _t({ _stateKey: t, _path: n });
        if (c === "lastSynced") {
          const r = `${t}:${n.join(".")}`;
          return o.getState().getSyncInfo(r);
        }
        if (c == "getLocalStorage")
          return (r) => yt(g + "-" + t + "-" + r);
        if (c === "_selected") {
          const r = n.slice(0, -1), e = r.join(".");
          if (Array.isArray(
            o.getState().getNestedState(t, r)
          )) {
            const a = n[n.length - 1];
            return i(r)?.indexOf(a) === o.getState().getSelectedIndex(t, e);
          }
          return;
        }
        if (c === "setSelected")
          return (r) => {
            const e = n.slice(0, -1), a = n[n.length - 1], u = i(e)?.indexOf(a);
            if (u === void 0 || u === -1) return;
            const l = e.join(".");
            o.getState().setSelectedIndex(
              t,
              l,
              r ? u : void 0
            );
            const m = o.getState().getNestedState(t, [...e]);
            ut(s, m, e), A(e);
          };
        if (c === "toggleSelected")
          return () => {
            const r = n.slice(0, -1), e = n[n.length - 1], d = i(r)?.indexOf(e);
            if (d === void 0 || d === -1) return;
            const u = r.join("."), l = o.getState().getSelectedIndex(t, u);
            o.getState().setSelectedIndex(
              t,
              u,
              l === d ? void 0 : d
            );
            const m = o.getState().getNestedState(t, [...r]);
            ut(s, m, r), A(r);
          };
        if (n.length == 0) {
          if (c === "addValidation")
            return (r) => {
              const e = o.getState().getInitialOptions(t)?.validation;
              if (!e?.key) throw new Error("Validation key not found");
              tt(e.key), r.forEach((a) => {
                const d = [e.key, ...a.path].join(".");
                Tt(d, a.message);
              }), ot(t);
            };
          if (c === "applyJsonPatch")
            return (r) => {
              const e = o.getState().cogsStateStore[t], a = Wt(e, r).newDocument;
              jt(
                t,
                o.getState().initialStateGlobal[t],
                a,
                s,
                S,
                g
              ), ot(t);
            };
          if (c === "validateZodSchema")
            return () => {
              const r = o.getState().getInitialOptions(t)?.validation;
              if (!r?.zodSchema || !r?.key)
                throw new Error("Zod schema or validation key not found");
              tt(r.key);
              const e = o.getState().cogsStateStore[t], a = r.zodSchema.safeParse(e);
              return a.success ? !0 : (a.error.errors.forEach((d) => {
                const u = [r.key, ...d.path].join(".");
                Tt(u, d.message);
              }), ot(t), !1);
            };
          if (c === "_componentId") return S;
          if (c === "getComponents")
            return () => o().stateComponents.get(t);
          if (c === "getAllFormRefs")
            return () => bt.getState().getFormRefsByStateKey(t);
          if (c === "_initialState")
            return o.getState().initialStateGlobal[t];
          if (c === "_serverState")
            return o.getState().serverState[t];
          if (c === "_isLoading")
            return o.getState().isLoadingGlobal[t];
          if (c === "revertToInitialState")
            return v.revertToInitialState;
          if (c === "updateInitialState") return v.updateInitialState;
          if (c === "removeValidation") return v.removeValidation;
        }
        if (c === "getFormRef")
          return () => bt.getState().getFormRef(t + "." + n.join("."));
        if (c === "validationWrapper")
          return ({
            children: r,
            hideMessage: e
          }) => /* @__PURE__ */ $t(
            Gt,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              stateKey: t,
              children: r
            }
          );
        if (c === "_stateKey") return t;
        if (c === "_path") return n;
        if (c === "_isServerSynced") return v._isServerSynced;
        if (c === "update")
          return (r, e) => {
            if (e?.debounce)
              Lt(() => {
                ut(s, r, n, "");
                const a = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(a);
              }, e.debounce);
            else {
              ut(s, r, n, "");
              const a = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(a);
            }
            A(n);
          };
        if (c === "formElement")
          return (r, e) => /* @__PURE__ */ $t(
            Ht,
            {
              setState: s,
              stateKey: t,
              path: n,
              child: r,
              formOpts: e
            }
          );
        const it = [...n, c], vt = o.getState().getNestedState(t, it);
        return $(vt, it, w);
      }
    }, f = new Proxy(p, K);
    return I.set(O, {
      proxy: f,
      stateVersion: T
    }), f;
  }
  return $(
    o.getState().getNestedState(t, [])
  );
}
function _t(t) {
  return gt(te, { proxy: t });
}
function Kt({
  proxy: t,
  rebuildStateShape: s
}) {
  const S = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(S) ? s(
    S,
    t._path
  ).stateMapNoRender(
    (I, T, A, v, i) => t._mapFn(I, T, A, v, i)
  ) : null;
}
function te({
  proxy: t
}) {
  const s = q(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return at(() => {
    const g = s.current;
    if (!g || !g.parentElement) return;
    const I = g.parentElement, A = Array.from(I.childNodes).indexOf(g);
    let v = I.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, I.setAttribute("data-parent-id", v));
    const $ = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: A,
      effect: t._effect
    };
    o.getState().addSignalElement(S, $);
    const y = o.getState().getNestedState(t._stateKey, t._path);
    let n = y;
    if (t._effect)
      try {
        n = new Function(
          "state",
          `return (${t._effect})(state)`
        )(y);
      } catch (O) {
        console.error("Error evaluating effect function:", O);
      }
    n !== null && typeof n == "object" && (n = JSON.stringify(n));
    const w = document.createTextNode(String(n));
    g.replaceWith(w);
  }, [t._stateKey, t._path.join("."), t._effect]), gt("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function ye(t) {
  const s = Ft(
    (S) => {
      const g = o.getState().stateComponents.get(t._stateKey) || { components: /* @__PURE__ */ new Map() };
      return g.components.set(t._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), o.getState().stateComponents.set(t._stateKey, g), () => g.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return gt("text", {}, String(s));
}
function ee({
  stateKey: t,
  itemComponentId: s,
  itemPath: S,
  children: g
}) {
  const [, I] = dt({}), [T, A] = Bt(), v = q(null), i = q(null), $ = St(
    (y) => {
      T(y), v.current = y;
    },
    [T]
  );
  return at(() => {
    A.height > 0 && A.height !== i.current && (i.current = A.height, o.getState().setShadowMetadata(t, S, {
      virtualizer: { itemHeight: A.height, domRef: v.current }
    }));
  }, [A.height, t, S]), pt(() => {
    const y = `${t}////${s}`, n = o.getState().stateComponents.get(t) || { components: /* @__PURE__ */ new Map() };
    return n.components.set(y, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set([S.join(".")])
    }), o.getState().stateComponents.set(t, n), () => {
      const w = o.getState().stateComponents.get(t);
      w && w.components.delete(y);
    };
  }, [t, s, S.join(".")]), /* @__PURE__ */ $t("div", { ref: $, children: g });
}
export {
  _t as $cogsSignal,
  ye as $cogsSignalStore,
  Se as addStateOptions,
  me as createCogsState,
  Ie as notifyComponent,
  Xt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
