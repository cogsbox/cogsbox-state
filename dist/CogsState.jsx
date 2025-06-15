"use client";
import { jsx as Et } from "react/jsx-runtime";
import { useState as ot, useRef as J, useEffect as lt, useLayoutEffect as St, useMemo as At, createElement as dt, useSyncExternalStore as Ft, startTransition as Ut, useCallback as wt } from "react";
import { transformStateFunc as Dt, isDeepEqual as q, isFunction as Q, getNestedValue as Y, getDifferences as $t, debounce as Wt } from "./utility.js";
import { pushFunc as Tt, updateFn as ct, cutFunc as ft, ValidationWrapper as Gt, FormControlComponent as Lt } from "./Functions.jsx";
import Ht from "superjson";
import { v4 as kt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Vt } from "./store.js";
import { useCogsConfig as _t } from "./CogsStateClient.jsx";
import { applyPatch as zt } from "fast-json-patch";
import Bt from "react-use-measure";
function Nt(t, c) {
  const m = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, y = m(t) || {};
  f(t, {
    ...y,
    ...c
  });
}
function Ct({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const f = st(t) || {}, y = m[t] || {}, k = o.getState().setInitialStateOptions, p = { ...y, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      p.hasOwnProperty(a) ? (a == "localStorage" && c[a] && p[a].key !== c[a]?.key && (I = !0, p[a] = c[a]), a == "initialState" && c[a] && p[a] !== c[a] && // Different references
      !q(p[a], c[a]) && (I = !0, p[a] = c[a])) : (I = !0, p[a] = c[a]);
  I && k(t, p);
}
function Se(t, { formElements: c, validation: m }) {
  return { initialState: t, formElements: c, validation: m };
}
const me = (t, c) => {
  let m = t;
  const [f, y] = Dt(m);
  (Object.keys(y).length > 0 || c && Object.keys(c).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, st(I) || o.getState().setInitialStateOptions(I, y[I]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const k = (I, a) => {
    const [v] = ot(a?.componentId ?? kt());
    Ct({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = o.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [L, O] = Kt(
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
  function p(I, a) {
    Ct({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Xt(I, a), yt(I);
  }
  return { useCogsState: k, setCogsOptions: p };
}, {
  setUpdaterState: mt,
  setState: at,
  getInitialOptions: st,
  getKeyState: Mt,
  getValidationErrors: qt,
  setStateLog: Jt,
  updateInitialStateGlobal: bt,
  addValidationError: Yt,
  removeValidationError: X,
  setServerSyncActions: Zt
} = o.getState(), xt = (t, c, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    f
  );
  const k = Q(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (k && f) {
    const p = `${f}-${c}-${k}`;
    let I;
    try {
      I = vt(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Ht.serialize(a);
    window.localStorage.setItem(
      p,
      JSON.stringify(v.json)
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
}, Xt = (t, c) => {
  const m = o.getState().cogsStateStore[t], { sessionId: f } = _t(), y = Q(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (y && f) {
    const k = vt(
      `${f}-${t}-${y}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return at(t, k.state), yt(t), !0;
  }
  return !1;
}, Rt = (t, c, m, f, y, k) => {
  const p = {
    initialState: c,
    updaterState: ht(
      t,
      f,
      y,
      k
    ),
    state: m
  };
  bt(t, p.initialState), mt(t, p.updaterState), at(t, p.state);
}, yt = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || m.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((f) => f());
  });
}, he = (t, c) => {
  const m = o.getState().stateComponents.get(t);
  if (m) {
    const f = `${t}////${c}`, y = m.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Qt = (t, c, m, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: Y(c, f),
        newValue: Y(m, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: Y(m, f)
      };
    case "cut":
      return {
        oldValue: Y(c, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Kt(t, {
  stateKey: c,
  serverSync: m,
  localStorage: f,
  formElements: y,
  reactiveDeps: k,
  reactiveType: p,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [L, O] = ot({}), { sessionId: F } = _t();
  let H = !c;
  const [h] = ot(c ?? kt()), l = o.getState().stateLog[h], ut = J(/* @__PURE__ */ new Set()), K = J(I ?? kt()), M = J(
    null
  );
  M.current = st(h) ?? null, lt(() => {
    if (v && v.stateKey === h && v.path?.[0]) {
      at(h, (r) => ({
        ...r,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), lt(() => {
    if (a) {
      Nt(h, {
        initialState: a
      });
      const e = M.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !q(i, a) || !i) && !s)
        return;
      let g = null;
      const E = Q(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      E && F && (g = vt(`${F}-${h}-${E}`));
      let T = a, $ = !1;
      const N = s ? Date.now() : 0, V = g?.lastUpdated || 0, P = g?.lastSyncedWithServer || 0;
      s && N > V ? (T = e.serverState.data, $ = !0) : g && V > P && (T = g.state, e?.localStorage?.onChange && e?.localStorage?.onChange(T)), o.getState().initializeShadowState(h, a), Rt(
        h,
        a,
        T,
        it,
        K.current,
        F
      ), $ && E && F && xt(T, h, e, F, Date.now()), yt(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || O({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), St(() => {
    H && Nt(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: f,
      middleware: M.current?.middleware
    });
    const e = `${h}////${K.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), O({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const it = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const g = `${h}-${r.join(".")}`;
      ut.current.add(g);
    }
    const u = o.getState();
    at(h, (g) => {
      const E = Q(e) ? e(g) : e, T = `${h}-${r.join(".")}`;
      if (T) {
        let C = !1, w = u.signalDomElements.get(T);
        if ((!w || w.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const R = r.slice(0, -1), x = Y(E, R);
          if (Array.isArray(x)) {
            C = !0;
            const A = `${h}-${R.join(".")}`;
            w = u.signalDomElements.get(A);
          }
        }
        if (w) {
          const R = C ? Y(E, r.slice(0, -1)) : Y(E, r);
          w.forEach(({ parentId: x, position: A, effect: U }) => {
            const j = document.querySelector(
              `[data-parent-id="${x}"]`
            );
            if (j) {
              const B = Array.from(j.childNodes);
              if (B[A]) {
                const D = U ? new Function("state", `return (${U})(state)`)(R) : R;
                B[A].textContent = String(D);
              }
            }
          });
        }
      }
      console.log("shadowState", u.shadowStateStore), s.updateType === "update" && (i || M.current?.validation?.key) && r && X(
        (i || M.current?.validation?.key) + "." + r.join(".")
      );
      const $ = r.slice(0, r.length - 1);
      s.updateType === "cut" && M.current?.validation?.key && X(
        M.current?.validation?.key + "." + $.join(".")
      ), s.updateType === "insert" && M.current?.validation?.key && qt(
        M.current?.validation?.key + "." + $.join(".")
      ).filter(([w, R]) => {
        let x = w?.split(".").length;
        if (w == $.join(".") && x == $.length - 1) {
          let A = w + "." + $;
          X(w), Yt(A, R);
        }
      });
      const N = u.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", N), N) {
        const C = $t(g, E), w = new Set(C), R = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          x,
          A
        ] of N.components.entries()) {
          let U = !1;
          const j = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (console.log("component", A), !j.includes("none")) {
            if (j.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if (j.includes("component") && ((A.paths.has(R) || A.paths.has("")) && (U = !0), !U))
              for (const B of w) {
                let D = B;
                for (; ; ) {
                  if (A.paths.has(D)) {
                    U = !0;
                    break;
                  }
                  const b = D.lastIndexOf(".");
                  if (b !== -1) {
                    const W = D.substring(
                      0,
                      b
                    );
                    if (!isNaN(
                      Number(D.substring(b + 1))
                    ) && A.paths.has(W)) {
                      U = !0;
                      break;
                    }
                    D = W;
                  } else
                    D = "";
                  if (D === "")
                    break;
                }
                if (U) break;
              }
            if (!U && j.includes("deps") && A.depsFunction) {
              const B = A.depsFunction(E);
              let D = !1;
              typeof B == "boolean" ? B && (D = !0) : q(A.deps, B) || (A.deps = B, D = !0), D && (U = !0);
            }
            U && A.forceUpdate();
          }
        }
      }
      const V = Date.now();
      r = r.map((C, w) => {
        const R = r.slice(0, -1), x = Y(E, R);
        return w === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (x.length - 1).toString() : C;
      });
      const { oldValue: P, newValue: _ } = Qt(
        s.updateType,
        g,
        E,
        r
      ), z = {
        timeStamp: V,
        stateKey: h,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: P,
        newValue: _
      };
      switch (s.updateType) {
        case "update":
          u.updateShadowAtPath(h, r, E);
          break;
        case "insert":
          const C = r.slice(0, -1);
          u.insertShadowArrayElement(h, C, _);
          break;
        case "cut":
          const w = r.slice(0, -1), R = parseInt(r[r.length - 1]);
          u.removeShadowArrayElement(h, w, R);
          break;
      }
      if (Jt(h, (C) => {
        const R = [...C ?? [], z].reduce((x, A) => {
          const U = `${A.stateKey}:${JSON.stringify(A.path)}`, j = x.get(U);
          return j ? (j.timeStamp = Math.max(j.timeStamp, A.timeStamp), j.newValue = A.newValue, j.oldValue = j.oldValue ?? A.oldValue, j.updateType = A.updateType) : x.set(U, { ...A }), x;
        }, /* @__PURE__ */ new Map());
        return Array.from(R.values());
      }), xt(
        E,
        h,
        M.current,
        F
      ), M.current?.middleware && M.current.middleware({
        updateLog: l,
        update: z
      }), M.current?.serverSync) {
        const C = u.serverState[h], w = M.current?.serverSync;
        Zt(h, {
          syncKey: typeof w.syncKey == "string" ? w.syncKey : w.syncKey({ state: E }),
          rollBackState: C,
          actionTimeStamp: Date.now() + (w.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[h] || (mt(
    h,
    ht(
      h,
      it,
      K.current,
      F
    )
  ), o.getState().cogsStateStore[h] || at(h, t), o.getState().initialStateGlobal[h] || bt(h, t));
  const d = At(() => ht(
    h,
    it,
    K.current,
    F
  ), [h, F]);
  return [Mt(h), d];
}
function ht(t, c, m, f) {
  const y = /* @__PURE__ */ new Map();
  let k = 0;
  const p = (v) => {
    const n = v.join(".");
    for (const [S] of y)
      (S === n || S.startsWith(n + ".")) && y.delete(S);
    k++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && X(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && X(n?.key), v?.validationKey && X(v.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), k++;
      const L = a(S, []), O = st(t), F = Q(O?.localStorage?.key) ? O?.localStorage?.key(S) : O?.localStorage?.key, H = `${f}-${t}-${F}`;
      H && localStorage.removeItem(H), mt(t, L), at(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), k++;
      const n = ht(
        t,
        c,
        m,
        f
      ), S = o.getState().initialStateGlobal[t], L = st(t), O = Q(L?.localStorage?.key) ? L?.localStorage?.key(S) : L?.localStorage?.key, F = `${f}-${t}-${O}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), Ut(() => {
        bt(t, v), o.getState().initializeShadowState(t, v), mt(t, n), at(t, v);
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
      return !!(v && q(v, Mt(t)));
    }
  };
  function a(v, n = [], S) {
    const L = n.map(String).join(".");
    y.get(L);
    const O = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(I).forEach((h) => {
      O[h] = I[h];
    });
    const F = {
      apply(h, l, ut) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
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
          return () => $t(
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
          const d = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = Y(e, n);
          return q(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = Y(e, n);
            return q(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = st(t), r = Q(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${r}`;
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
              } = e, u = J(null), [g, E] = ot({
                startIndex: 0,
                endIndex: 10
              }), [T, $] = ot(0), N = wt(
                () => $((b) => b + 1),
                []
              ), V = J(i), P = J(0), _ = J(!0), z = J(!1);
              lt(() => {
                const b = o.getState().subscribeToShadowState(t, N), W = setTimeout(N, 50);
                return () => {
                  b(), clearTimeout(W);
                };
              }, [t, N]);
              const C = o().getNestedState(
                t,
                n
              ), w = C.length, { totalHeight: R, positions: x, allItemsMeasured: A } = At(() => {
                const b = o.getState().getShadowMetadata(t, n) || [];
                let W = 0;
                const tt = [];
                let Z = !0;
                for (let G = 0; G < w; G++) {
                  tt[G] = W;
                  const et = b[G]?.virtualizer?.itemHeight;
                  !et && w > 0 && (Z = !1), W += et || r;
                }
                return {
                  totalHeight: W,
                  positions: tt,
                  allItemsMeasured: Z
                };
              }, [w, t, n, r, T]), U = At(() => {
                const b = Math.max(0, g.startIndex), W = Math.min(w, g.endIndex), tt = Array.from(
                  { length: W - b },
                  (G, et) => b + et
                ), Z = tt.map((G) => C[G]);
                return a(Z, n, {
                  ...S,
                  validIndices: tt
                });
              }, [g.startIndex, g.endIndex, C, w]);
              St(() => {
                const b = u.current;
                if (!b) return;
                const W = V.current, tt = w > P.current;
                P.current = w;
                const Z = () => {
                  const { scrollTop: G, clientHeight: et, scrollHeight: jt } = b;
                  V.current = jt - G - et < 10;
                  let It = 0, gt = w - 1;
                  for (; It <= gt; ) {
                    const rt = Math.floor((It + gt) / 2);
                    x[rt] < G ? It = rt + 1 : gt = rt - 1;
                  }
                  const pt = Math.max(0, gt - s);
                  let nt = pt;
                  const Ot = G + et;
                  for (; nt < w && x[nt] < Ot; )
                    nt++;
                  nt = Math.min(w, nt + s), E((rt) => rt.startIndex !== pt || rt.endIndex !== nt ? { startIndex: pt, endIndex: nt } : rt);
                };
                if (b.addEventListener("scroll", Z, {
                  passive: !0
                }), i)
                  if (_.current && !z.current) {
                    if (A && w > 0)
                      b.scrollTo({
                        top: b.scrollHeight,
                        behavior: "auto"
                      }), z.current = !0, _.current = !1;
                    else if (w > 0) {
                      const G = setTimeout(() => {
                        u.current && _.current && (u.current.scrollTo({
                          top: u.current.scrollHeight,
                          behavior: "auto"
                        }), z.current = !0, _.current = !1);
                      }, 100);
                      return () => clearTimeout(G);
                    }
                  } else !_.current && W && tt && requestAnimationFrame(() => {
                    b.scrollTo({
                      top: b.scrollHeight,
                      behavior: "smooth"
                    });
                  });
                else
                  _.current = !1;
                return Z(), () => b.removeEventListener("scroll", Z);
              }, [
                w,
                x,
                s,
                i,
                A
              ]);
              const j = wt(
                (b = "smooth") => {
                  u.current && u.current.scrollTo({
                    top: u.current.scrollHeight,
                    behavior: b
                  });
                },
                []
              ), B = wt(
                (b, W = "smooth") => {
                  u.current && x[b] !== void 0 && u.current.scrollTo({
                    top: x[b],
                    behavior: W
                  });
                },
                [x]
              ), D = {
                outer: {
                  ref: u,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${R}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${x[g.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: U,
                virtualizerProps: D,
                scrollToBottom: j,
                scrollToIndex: B
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
                    const [, N] = ot({}), V = `${m}-${n.join(".")}-${i}`;
                    St(() => {
                      const P = `${t}////${V}`, _ = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return _.components.set(P, {
                        forceUpdate: () => N({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(t, _), () => {
                        const z = o.getState().stateComponents.get(t);
                        z && z.components.delete(P);
                      };
                    }, [t, V]);
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
            return (e) => dt(te, {
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
                const g = r[i], E = [...n, i.toString()], T = a(g, E, S), $ = `${m}-${n.join(".")}-${i}`;
                return dt(ne, {
                  key: i,
                  stateKey: t,
                  itemComponentId: $,
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
              y.clear(), k++;
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
            return (e) => (p(n), Tt(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), u = Q(e) ? e(i) : e;
              let g = null;
              if (!i.some((T) => {
                if (r) {
                  const N = r.every(
                    (V) => q(T[V], u[V])
                  );
                  return N && (g = T), N;
                }
                const $ = q(T, u);
                return $ && (g = T), $;
              }))
                p(n), Tt(c, u, n, t);
              else if (s && g) {
                const T = s(g), $ = i.map(
                  (N) => q(N, g) ? T : N
                );
                p(n), ct(c, $, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return p(n), ft(c, n, t, e), a(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < v.length; r++)
                v[r] === e && ft(c, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = v.findIndex((s) => s === e);
              r > -1 ? ft(c, n, t, r) : Tt(c, e, n, t);
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
        const K = n[n.length - 1];
        if (!isNaN(Number(K))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => ft(
              c,
              d,
              t,
              Number(K)
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
          return (d) => Pt({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Pt({
            _stateKey: t,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${t}:${n.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => vt(f + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), s = e.join(".");
            d ? o.getState().setSelectedIndex(t, s, r) : o.getState().setSelectedIndex(t, s, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            ct(c, i, e), p(e);
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
            ct(c, i, d), p(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], s = zt(e, d).newDocument;
              Rt(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                m,
                f
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const u = $t(e, s), g = new Set(u);
                for (const [
                  E,
                  T
                ] of i.components.entries()) {
                  let $ = !1;
                  const N = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
                  if (!N.includes("none")) {
                    if (N.includes("all")) {
                      T.forceUpdate();
                      continue;
                    }
                    if (N.includes("component") && (T.paths.has("") && ($ = !0), !$))
                      for (const V of g) {
                        if (T.paths.has(V)) {
                          $ = !0;
                          break;
                        }
                        let P = V.lastIndexOf(".");
                        for (; P !== -1; ) {
                          const _ = V.substring(0, P);
                          if (T.paths.has(_)) {
                            $ = !0;
                            break;
                          }
                          const z = V.substring(
                            P + 1
                          );
                          if (!isNaN(Number(z))) {
                            const C = _.lastIndexOf(".");
                            if (C !== -1) {
                              const w = _.substring(
                                0,
                                C
                              );
                              if (T.paths.has(w)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          P = _.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && N.includes("deps") && T.depsFunction) {
                      const V = T.depsFunction(s);
                      let P = !1;
                      typeof V == "boolean" ? V && (P = !0) : q(T.deps, V) || (T.deps = V, P = !0), P && ($ = !0);
                    }
                    $ && T.forceUpdate();
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
                const s = o.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([u]) => {
                  u && u.startsWith(d.key) && X(u);
                });
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((g) => {
                  const E = g.path, T = g.message, $ = [d.key, ...E].join(".");
                  e($, T);
                }), yt(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => Vt.getState().getFormRefsByStateKey(t);
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
          return () => Vt.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ Et(
            Gt,
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
              Wt(() => {
                ct(c, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              ct(c, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            p(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ Et(
            Lt,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const M = [...n, l], it = o.getState().getNestedState(t, M);
        return a(it, M, S);
      }
    }, H = new Proxy(O, F);
    return y.set(L, {
      proxy: H,
      stateVersion: k
    }), H;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function Pt(t) {
  return dt(ee, { proxy: t });
}
function te({
  proxy: t,
  rebuildStateShape: c
}) {
  const m = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? c(
    m,
    t._path
  ).stateMapNoRender(
    (y, k, p, I, a) => t._mapFn(y, k, p, I, a)
  ) : null;
}
function ee({
  proxy: t
}) {
  const c = J(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return lt(() => {
    const f = c.current;
    if (!f || !f.parentElement) return;
    const y = f.parentElement, p = Array.from(y.childNodes).indexOf(f);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: p,
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
    const L = document.createTextNode(String(S));
    f.replaceWith(L);
  }, [t._stateKey, t._path.join("."), t._effect]), dt("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function ve(t) {
  const c = Ft(
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
  return dt("text", {}, String(c));
}
function ne({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: f
}) {
  const [, y] = ot({}), [k, p] = Bt(), I = J(null);
  return lt(() => {
    p.height > 0 && p.height !== I.current && (I.current = p.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), St(() => {
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
  }, [t, c, m.join(".")]), /* @__PURE__ */ Et("div", { ref: k, children: f });
}
export {
  Pt as $cogsSignal,
  ve as $cogsSignalStore,
  Se as addStateOptions,
  me as createCogsState,
  he as notifyComponent,
  Kt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
