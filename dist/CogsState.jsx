"use client";
import { jsx as vt } from "react/jsx-runtime";
import { useState as K, useRef as J, useEffect as rt, useLayoutEffect as dt, useMemo as yt, createElement as st, useSyncExternalStore as _t, startTransition as Mt, useCallback as Et } from "react";
import { transformStateFunc as Rt, isDeepEqual as B, isFunction as Z, getNestedValue as q, getDifferences as It, debounce as jt } from "./utility.js";
import { pushFunc as ht, updateFn as at, cutFunc as lt, ValidationWrapper as Ot, FormControlComponent as Ut } from "./Functions.jsx";
import Ft from "superjson";
import { v4 as pt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as At } from "./store.js";
import { useCogsConfig as Ct } from "./CogsStateClient.jsx";
import { applyPatch as Dt } from "fast-json-patch";
import Lt from "react-use-measure";
function $t(t, c) {
  const m = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, y = m(t) || {};
  f(t, {
    ...y,
    ...c
  });
}
function kt({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const f = nt(t) || {}, y = m[t] || {}, b = o.getState().setInitialStateOptions, w = { ...y, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      w.hasOwnProperty(a) ? (a == "localStorage" && c[a] && w[a].key !== c[a]?.key && (I = !0, w[a] = c[a]), a == "initialState" && c[a] && w[a] !== c[a] && // Different references
      !B(w[a], c[a]) && (I = !0, w[a] = c[a])) : (I = !0, w[a] = c[a]);
  I && b(t, w);
}
function le(t, { formElements: c, validation: m }) {
  return { initialState: t, formElements: c, validation: m };
}
const de = (t, c) => {
  let m = t;
  const [f, y] = Rt(m);
  (Object.keys(y).length > 0 || c && Object.keys(c).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, nt(I) || o.getState().setInitialStateOptions(I, y[I]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const b = (I, a) => {
    const [v] = K(a?.componentId ?? pt());
    kt({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = o.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [G, O] = Jt(
      S,
      {
        stateKey: I,
        syncUpdate: a?.syncUpdate,
        componentId: v,
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
    return O;
  };
  function w(I, a) {
    kt({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Bt(I, a), St(I);
  }
  return { useCogsState: b, setCogsOptions: w };
}, {
  setUpdaterState: ut,
  setState: tt,
  getInitialOptions: nt,
  getKeyState: Vt,
  getValidationErrors: Wt,
  setStateLog: Gt,
  updateInitialStateGlobal: wt,
  addValidationError: Ht,
  removeValidationError: Y,
  setServerSyncActions: zt
} = o.getState(), bt = (t, c, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    f
  );
  const b = Z(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (b && f) {
    const w = `${f}-${c}-${b}`;
    let I;
    try {
      I = ft(w)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Ft.serialize(a);
    window.localStorage.setItem(
      w,
      JSON.stringify(v.json)
    );
  }
}, ft = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, Bt = (t, c) => {
  const m = o.getState().cogsStateStore[t], { sessionId: f } = Ct(), y = Z(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (y && f) {
    const b = ft(
      `${f}-${t}-${y}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return tt(t, b.state), St(t), !0;
  }
  return !1;
}, xt = (t, c, m, f, y, b) => {
  const w = {
    initialState: c,
    updaterState: gt(
      t,
      f,
      y,
      b
    ),
    state: m
  };
  wt(t, w.initialState), ut(t, w.updaterState), tt(t, w.state);
}, St = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || m.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((f) => f());
  });
}, ue = (t, c) => {
  const m = o.getState().stateComponents.get(t);
  if (m) {
    const f = `${t}////${c}`, y = m.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, qt = (t, c, m, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: q(c, f),
        newValue: q(m, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: q(m, f)
      };
    case "cut":
      return {
        oldValue: q(c, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Jt(t, {
  stateKey: c,
  serverSync: m,
  localStorage: f,
  formElements: y,
  reactiveDeps: b,
  reactiveType: w,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [G, O] = K({}), { sessionId: U } = Ct();
  let H = !c;
  const [h] = K(c ?? pt()), l = o.getState().stateLog[h], it = J(/* @__PURE__ */ new Set()), X = J(I ?? pt()), R = J(
    null
  );
  R.current = nt(h) ?? null, rt(() => {
    if (v && v.stateKey === h && v.path?.[0]) {
      tt(h, (r) => ({
        ...r,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), rt(() => {
    if (a) {
      $t(h, {
        initialState: a
      });
      const e = R.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !B(i, a) || !i) && !s)
        return;
      let g = null;
      const E = Z(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      E && U && (g = ft(`${U}-${h}-${E}`));
      let T = a, k = !1;
      const P = s ? Date.now() : 0, N = g?.lastUpdated || 0, M = g?.lastSyncedWithServer || 0;
      s && P > N ? (T = e.serverState.data, k = !0) : g && N > M && (T = g.state, e?.localStorage?.onChange && e?.localStorage?.onChange(T)), o.getState().initializeShadowState(h, a), xt(
        h,
        a,
        T,
        ot,
        X.current,
        U
      ), k && E && U && bt(T, h, e, U, Date.now()), St(h), (Array.isArray(w) ? w : [w || "component"]).includes("none") || O({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), dt(() => {
    H && $t(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: f,
      middleware: R.current?.middleware
    });
    const e = `${h}////${X.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), O({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const ot = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const g = `${h}-${r.join(".")}`;
      it.current.add(g);
    }
    const u = o.getState();
    tt(h, (g) => {
      const E = Z(e) ? e(g) : e, T = `${h}-${r.join(".")}`;
      if (T) {
        let _ = !1, A = u.signalDomElements.get(T);
        if ((!A || A.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const j = r.slice(0, -1), L = q(E, j);
          if (Array.isArray(L)) {
            _ = !0;
            const $ = `${h}-${j.join(".")}`;
            A = u.signalDomElements.get($);
          }
        }
        if (A) {
          const j = _ ? q(E, r.slice(0, -1)) : q(E, r);
          A.forEach(({ parentId: L, position: $, effect: F }) => {
            const p = document.querySelector(
              `[data-parent-id="${L}"]`
            );
            if (p) {
              const C = Array.from(p.childNodes);
              if (C[$]) {
                const x = F ? new Function("state", `return (${F})(state)`)(j) : j;
                C[$].textContent = String(x);
              }
            }
          });
        }
      }
      console.log("shadowState", u.shadowStateStore), s.updateType === "update" && (i || R.current?.validation?.key) && r && Y(
        (i || R.current?.validation?.key) + "." + r.join(".")
      );
      const k = r.slice(0, r.length - 1);
      s.updateType === "cut" && R.current?.validation?.key && Y(
        R.current?.validation?.key + "." + k.join(".")
      ), s.updateType === "insert" && R.current?.validation?.key && Wt(
        R.current?.validation?.key + "." + k.join(".")
      ).filter(([A, j]) => {
        let L = A?.split(".").length;
        if (A == k.join(".") && L == k.length - 1) {
          let $ = A + "." + k;
          Y(A), Ht($, j);
        }
      });
      const P = u.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", P), P) {
        const _ = It(g, E), A = new Set(_), j = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          L,
          $
        ] of P.components.entries()) {
          let F = !1;
          const p = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !p.includes("none")) {
            if (p.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (p.includes("component") && (($.paths.has(j) || $.paths.has("")) && (F = !0), !F))
              for (const C of A) {
                let x = C;
                for (; ; ) {
                  if ($.paths.has(x)) {
                    F = !0;
                    break;
                  }
                  const W = x.lastIndexOf(".");
                  if (W !== -1) {
                    const z = x.substring(
                      0,
                      W
                    );
                    if (!isNaN(
                      Number(x.substring(W + 1))
                    ) && $.paths.has(z)) {
                      F = !0;
                      break;
                    }
                    x = z;
                  } else
                    x = "";
                  if (x === "")
                    break;
                }
                if (F) break;
              }
            if (!F && p.includes("deps") && $.depsFunction) {
              const C = $.depsFunction(E);
              let x = !1;
              typeof C == "boolean" ? C && (x = !0) : B($.deps, C) || ($.deps = C, x = !0), x && (F = !0);
            }
            F && $.forceUpdate();
          }
        }
      }
      const N = Date.now();
      r = r.map((_, A) => {
        const j = r.slice(0, -1), L = q(E, j);
        return A === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (L.length - 1).toString() : _;
      });
      const { oldValue: M, newValue: D } = qt(
        s.updateType,
        g,
        E,
        r
      ), V = {
        timeStamp: N,
        stateKey: h,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: M,
        newValue: D
      };
      switch (s.updateType) {
        case "update":
          u.updateShadowAtPath(h, r, E);
          break;
        case "insert":
          const _ = r.slice(0, -1);
          u.insertShadowArrayElement(h, _, D);
          break;
        case "cut":
          const A = r.slice(0, -1), j = parseInt(r[r.length - 1]);
          u.removeShadowArrayElement(h, A, j);
          break;
      }
      if (Gt(h, (_) => {
        const j = [..._ ?? [], V].reduce((L, $) => {
          const F = `${$.stateKey}:${JSON.stringify($.path)}`, p = L.get(F);
          return p ? (p.timeStamp = Math.max(p.timeStamp, $.timeStamp), p.newValue = $.newValue, p.oldValue = p.oldValue ?? $.oldValue, p.updateType = $.updateType) : L.set(F, { ...$ }), L;
        }, /* @__PURE__ */ new Map());
        return Array.from(j.values());
      }), bt(
        E,
        h,
        R.current,
        U
      ), R.current?.middleware && R.current.middleware({
        updateLog: l,
        update: V
      }), R.current?.serverSync) {
        const _ = u.serverState[h], A = R.current?.serverSync;
        zt(h, {
          syncKey: typeof A.syncKey == "string" ? A.syncKey : A.syncKey({ state: E }),
          rollBackState: _,
          actionTimeStamp: Date.now() + (A.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[h] || (ut(
    h,
    gt(
      h,
      ot,
      X.current,
      U
    )
  ), o.getState().cogsStateStore[h] || tt(h, t), o.getState().initialStateGlobal[h] || wt(h, t));
  const d = yt(() => gt(
    h,
    ot,
    X.current,
    U
  ), [h, U]);
  return [Vt(h), d];
}
function gt(t, c, m, f) {
  const y = /* @__PURE__ */ new Map();
  let b = 0;
  const w = (v) => {
    const n = v.join(".");
    for (const [S] of y)
      (S === n || S.startsWith(n + ".")) && y.delete(S);
    b++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && Y(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && Y(n?.key), v?.validationKey && Y(v.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), b++;
      const G = a(S, []), O = nt(t), U = Z(O?.localStorage?.key) ? O?.localStorage?.key(S) : O?.localStorage?.key, H = `${f}-${t}-${U}`;
      H && localStorage.removeItem(H), ut(t, G), tt(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), b++;
      const n = gt(
        t,
        c,
        m,
        f
      ), S = o.getState().initialStateGlobal[t], G = nt(t), O = Z(G?.localStorage?.key) ? G?.localStorage?.key(S) : G?.localStorage?.key, U = `${f}-${t}-${O}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), Mt(() => {
        wt(t, v), o.getState().initializeShadowState(t, v), ut(t, n), tt(t, v);
        const H = o.getState().stateComponents.get(t);
        H && H.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (H) => n.get()[H]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const v = o.getState().serverState[t];
      return !!(v && B(v, Vt(t)));
    }
  };
  function a(v, n = [], S) {
    const G = n.map(String).join(".");
    y.get(G);
    const O = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(I).forEach((h) => {
      O[h] = I[h];
    });
    const U = {
      apply(h, l, it) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
        const it = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !it.has(l)) {
          const d = `${t}////${m}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const r = e.components.get(d);
            if (r && !r.paths.has("")) {
              const s = n.join(".");
              let i = !0;
              for (const u of r.paths)
                if (s.startsWith(u) && (s === u || s[u.length] === ".")) {
                  i = !1;
                  break;
                }
              i && r.paths.add(s);
            }
          }
        }
        if (l === "getDifferences")
          return () => It(
            o.getState().cogsStateStore[t],
            o.getState().initialStateGlobal[t]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const d = o.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const r = o.getState().getNestedState(t, []), s = d?.validation?.key;
            try {
              const i = await e.action(r);
              if (i && !i.success && i.errors && s) {
                o.getState().removeValidationError(s), i.errors.forEach((g) => {
                  const E = [s, ...g.path].join(".");
                  o.getState().addValidationError(E, g.message);
                });
                const u = o.getState().stateComponents.get(t);
                u && u.components.forEach((g) => {
                  g.forceUpdate();
                });
              }
              return i?.success && e.onSuccess ? e.onSuccess(i.data) : !i?.success && e.onError && e.onError(i.error), i;
            } catch (i) {
              return e.onError && e.onError(i), { success: !1, error: i };
            }
          };
        if (l === "_status") {
          const d = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = q(e, n);
          return B(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = q(e, n);
            return B(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = nt(t), r = Z(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${r}`;
            s && localStorage.removeItem(s);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(v)) {
          const d = () => S?.validIndices ? v.map((r, s) => ({
            item: r,
            originalIndex: S.validIndices[s]
          })) : o.getState().getNestedState(t, n).map((r, s) => ({
            item: r,
            originalIndex: s
          }));
          if (l === "getSelected")
            return () => {
              const e = o.getState().getSelectedIndex(t, n.join("."));
              if (e !== void 0)
                return a(
                  v[e],
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
                overscan: s = 5,
                stickToBottom: i = !1
              } = e, u = J(null), [g, E] = K({
                startIndex: 0,
                endIndex: 10
              }), T = J(i), [k, P] = K(0), N = J(!1), M = J(0);
              rt(() => o.getState().subscribeToShadowState(t, () => {
                P((C) => C + 1);
              }), [t]);
              const D = o().getNestedState(
                t,
                n
              ), V = D.length, { totalHeight: _, positions: A } = yt(() => {
                const p = o.getState().getShadowMetadata(t, n) || [];
                let C = 0;
                const x = [];
                for (let W = 0; W < V; W++) {
                  x[W] = C;
                  const z = p[W]?.virtualizer?.itemHeight;
                  C += z || r;
                }
                return { totalHeight: C, positions: x };
              }, [
                V,
                t,
                n.join("."),
                r,
                k
              ]), j = yt(() => {
                const p = Math.max(0, g.startIndex), C = Math.min(V, g.endIndex), x = Array.from(
                  { length: C - p },
                  (z, Q) => p + Q
                ), W = x.map((z) => D[z]);
                return a(W, n, {
                  ...S,
                  validIndices: x
                });
              }, [g.startIndex, g.endIndex, D, V]);
              rt(() => {
                if (i && V > 0 && u.current) {
                  const p = u.current, C = Math.ceil(
                    p.clientHeight / r
                  );
                  E({
                    startIndex: Math.max(
                      0,
                      V - C - s
                    ),
                    endIndex: V
                  }), setTimeout(() => {
                    p.scrollTop = p.scrollHeight;
                  }, 100);
                }
              }, [V]), dt(() => {
                const p = u.current;
                if (!p) return;
                let C;
                const x = () => {
                  if (!p) return;
                  const { scrollTop: z } = p;
                  let Q = 0, ct = V - 1;
                  for (; Q <= ct; ) {
                    const mt = Math.floor((Q + ct) / 2);
                    A[mt] < z ? Q = mt + 1 : ct = mt - 1;
                  }
                  const Tt = Math.max(0, ct - s);
                  let et = Tt;
                  const Pt = z + p.clientHeight;
                  for (; et < V && A[et] < Pt; )
                    et++;
                  et = Math.min(V, et + s), E({ startIndex: Tt, endIndex: et });
                }, W = () => {
                  T.current = p.scrollHeight - p.scrollTop - p.clientHeight < 1, x();
                };
                if (p.addEventListener("scroll", W, {
                  passive: !0
                }), i) {
                  const z = !N.current && V > 0, Q = N.current && V > M.current;
                  C = setTimeout(() => {
                    console.log("totalHeight", _), T.current && p.scrollTo({
                      top: 999999999,
                      behavior: Q ? "smooth" : "auto"
                      // Only smooth for NEW items after initial load
                    });
                  }, 200), z && (N.current = !0);
                }
                return M.current = V, x(), () => {
                  clearTimeout(C), p.removeEventListener("scroll", W);
                };
              }, [V, A, _, i]);
              const L = Et(
                (p = "smooth") => {
                  u.current && (T.current = !0, u.current.scrollTo({
                    top: u.current.scrollHeight,
                    behavior: p
                  }));
                },
                []
              ), $ = Et(
                (p, C = "smooth") => {
                  u.current && A[p] !== void 0 && (T.current = !1, u.current.scrollTo({
                    top: A[p],
                    behavior: C
                  }));
                },
                [A]
              ), F = {
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
                    transform: `translateY(${A[g.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: j,
                virtualizerProps: F,
                scrollToBottom: L,
                scrollToIndex: $
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (g, E) => e(g.item, E.item)
              ), i = s.map(({ item: g }) => g), u = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: g }) => g
                )
              };
              return a(i, n, u);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = d().filter(
                ({ item: g }, E) => e(g, E)
              ), i = s.map(({ item: g }) => g), u = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: g }) => g
                )
              };
              return a(i, n, u);
            };
          if (l === "stateMap")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (i, u) => u)).map((i, u) => {
                const g = r[i], E = [...n, i.toString()], T = a(g, E, S);
                return e(g, T, {
                  register: () => {
                    const [, P] = K({}), N = `${m}-${n.join(".")}-${i}`;
                    dt(() => {
                      const M = `${t}////${N}`, D = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set(M, {
                        forceUpdate: () => P({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(t, D), () => {
                        const V = o.getState().stateComponents.get(t);
                        V && V.components.delete(M);
                      };
                    }, [t, N]);
                  },
                  index: u,
                  originalIndex: i
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                r
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => v.map((s, i) => {
              let u;
              S?.validIndices && S.validIndices[i] !== void 0 ? u = S.validIndices[i] : u = i;
              const g = [...n, u.toString()], E = a(s, g, S);
              return e(
                s,
                E,
                i,
                v,
                a(v, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => st(Yt, {
              proxy: {
                _stateKey: t,
                _path: n,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: a
            });
          if (l === "stateList")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (i, u) => u)).map((i, u) => {
                const g = r[i], E = [...n, i.toString()], T = a(g, E, S), k = `${m}-${n.join(".")}-${i}`;
                return st(Xt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: k,
                  itemPath: E,
                  children: e(
                    g,
                    T,
                    u,
                    r,
                    a(r, n, S)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (e) => {
              const r = v;
              y.clear(), b++;
              const s = r.flatMap(
                (i) => i[e] ?? []
              );
              return a(
                s,
                [...n, "[*]", e],
                S
              );
            };
          if (l === "index")
            return (e) => {
              const r = v[e];
              return a(r, [...n, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = o.getState().getNestedState(t, n);
              if (e.length === 0) return;
              const r = e.length - 1, s = e[r], i = [...n, r.toString()];
              return a(s, i);
            };
          if (l === "insert")
            return (e) => (w(n), ht(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), u = Z(e) ? e(i) : e;
              let g = null;
              if (!i.some((T) => {
                if (r) {
                  const P = r.every(
                    (N) => B(T[N], u[N])
                  );
                  return P && (g = T), P;
                }
                const k = B(T, u);
                return k && (g = T), k;
              }))
                w(n), ht(c, u, n, t);
              else if (s && g) {
                const T = s(g), k = i.map(
                  (P) => B(P, g) ? T : P
                );
                w(n), at(c, k, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return w(n), lt(c, n, t, e), a(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < v.length; r++)
                v[r] === e && lt(c, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = v.findIndex((s) => s === e);
              r > -1 ? lt(c, n, t, r) : ht(c, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = d().find(
                ({ item: u }, g) => e(u, g)
              );
              if (!s) return;
              const i = [...n, s.originalIndex.toString()];
              return a(s.item, i, S);
            };
          if (l === "findWith")
            return (e, r) => {
              const i = d().find(
                ({ item: g }) => g[e] === r
              );
              if (!i) return;
              const u = [...n, i.originalIndex.toString()];
              return a(i.item, u, S);
            };
        }
        const X = n[n.length - 1];
        if (!isNaN(Number(X))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => lt(
              c,
              d,
              t,
              Number(X)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(v)) {
              const d = o.getState().getNestedState(t, n);
              return S.validIndices.map((e) => d[e]);
            }
            return o.getState().getNestedState(t, n);
          };
        if (l === "$derive")
          return (d) => Nt({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Nt({
            _stateKey: t,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${t}:${n.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => ft(f + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), s = e.join(".");
            d ? o.getState().setSelectedIndex(t, s, r) : o.getState().setSelectedIndex(t, s, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            at(c, i, e), w(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), e = Number(n[n.length - 1]), r = d.join("."), s = o.getState().getSelectedIndex(t, r);
            o.getState().setSelectedIndex(
              t,
              r,
              s === e ? void 0 : e
            );
            const i = o.getState().getNestedState(t, [...d]);
            at(c, i, d), w(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], s = Dt(e, d).newDocument;
              xt(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                m,
                f
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const u = It(e, s), g = new Set(u);
                for (const [
                  E,
                  T
                ] of i.components.entries()) {
                  let k = !1;
                  const P = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
                  if (!P.includes("none")) {
                    if (P.includes("all")) {
                      T.forceUpdate();
                      continue;
                    }
                    if (P.includes("component") && (T.paths.has("") && (k = !0), !k))
                      for (const N of g) {
                        if (T.paths.has(N)) {
                          k = !0;
                          break;
                        }
                        let M = N.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const D = N.substring(0, M);
                          if (T.paths.has(D)) {
                            k = !0;
                            break;
                          }
                          const V = N.substring(
                            M + 1
                          );
                          if (!isNaN(Number(V))) {
                            const _ = D.lastIndexOf(".");
                            if (_ !== -1) {
                              const A = D.substring(
                                0,
                                _
                              );
                              if (T.paths.has(A)) {
                                k = !0;
                                break;
                              }
                            }
                          }
                          M = D.lastIndexOf(".");
                        }
                        if (k) break;
                      }
                    if (!k && P.includes("deps") && T.depsFunction) {
                      const N = T.depsFunction(s);
                      let M = !1;
                      typeof N == "boolean" ? N && (M = !0) : B(T.deps, N) || (T.deps = N, M = !0), M && (k = !0);
                    }
                    k && T.forceUpdate();
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
              Y(d.key);
              const r = o.getState().cogsStateStore[t];
              try {
                const s = o.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([u]) => {
                  u && u.startsWith(d.key) && Y(u);
                });
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((g) => {
                  const E = g.path, T = g.message, k = [d.key, ...E].join(".");
                  e(k, T);
                }), St(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => At.getState().getFormRefsByStateKey(t);
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
          return () => At.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ vt(
            Ot,
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
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              jt(() => {
                at(c, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              at(c, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            w(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ vt(
            Ut,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const R = [...n, l], ot = o.getState().getNestedState(t, R);
        return a(ot, R, S);
      }
    }, H = new Proxy(O, U);
    return y.set(G, {
      proxy: H,
      stateVersion: b
    }), H;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function Nt(t) {
  return st(Zt, { proxy: t });
}
function Yt({
  proxy: t,
  rebuildStateShape: c
}) {
  const m = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? c(
    m,
    t._path
  ).stateMapNoRender(
    (y, b, w, I, a) => t._mapFn(y, b, w, I, a)
  ) : null;
}
function Zt({
  proxy: t
}) {
  const c = J(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return rt(() => {
    const f = c.current;
    if (!f || !f.parentElement) return;
    const y = f.parentElement, w = Array.from(y.childNodes).indexOf(f);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: w,
      effect: t._effect
    };
    o.getState().addSignalElement(m, v);
    const n = o.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (O) {
        console.error("Error evaluating effect function during mount:", O), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const G = document.createTextNode(String(S));
    f.replaceWith(G);
  }, [t._stateKey, t._path.join("."), t._effect]), st("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function ge(t) {
  const c = _t(
    (m) => {
      const f = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(t._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => f.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return st("text", {}, String(c));
}
function Xt({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: f
}) {
  const [, y] = K({}), [b, w] = Lt(), I = J(null);
  return rt(() => {
    w.height > 0 && w.height !== I.current && (I.current = w.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: w.height
      }
    }));
  }, [w.height, t, m]), dt(() => {
    const a = `${t}////${c}`, v = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return v.components.set(a, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), o.getState().stateComponents.set(t, v), () => {
      const n = o.getState().stateComponents.get(t);
      n && n.components.delete(a);
    };
  }, [t, c, m.join(".")]), /* @__PURE__ */ vt("div", { ref: b, children: f });
}
export {
  Nt as $cogsSignal,
  ge as $cogsSignalStore,
  le as addStateOptions,
  de as createCogsState,
  ue as notifyComponent,
  Jt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
