"use client";
import { jsx as pt } from "react/jsx-runtime";
import { useState as rt, useRef as Y, useEffect as dt, useLayoutEffect as ut, useMemo as wt, createElement as st, useSyncExternalStore as jt, startTransition as Ot, useCallback as vt } from "react";
import { transformStateFunc as Rt, isDeepEqual as H, isFunction as Z, getNestedValue as z, getDifferences as Et, debounce as Ft } from "./utility.js";
import { pushFunc as It, updateFn as at, cutFunc as lt, ValidationWrapper as Ut, FormControlComponent as Dt } from "./Functions.jsx";
import Wt from "superjson";
import { v4 as At } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as $t } from "./store.js";
import { useCogsConfig as Ct } from "./CogsStateClient.jsx";
import { applyPatch as Gt } from "fast-json-patch";
import Lt from "react-use-measure";
function kt(t, c) {
  const h = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, v = h(t) || {};
  f(t, {
    ...v,
    ...c
  });
}
function Vt({
  stateKey: t,
  options: c,
  initialOptionsPart: h
}) {
  const f = nt(t) || {}, v = h[t] || {}, k = o.getState().setInitialStateOptions, w = { ...v, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      w.hasOwnProperty(a) ? (a == "localStorage" && c[a] && w[a].key !== c[a]?.key && (I = !0, w[a] = c[a]), a == "initialState" && c[a] && w[a] !== c[a] && // Different references
      !H(w[a], c[a]) && (I = !0, w[a] = c[a])) : (I = !0, w[a] = c[a]);
  I && k(t, w);
}
function fe(t, { formElements: c, validation: h }) {
  return { initialState: t, formElements: c, validation: h };
}
const Se = (t, c) => {
  let h = t;
  const [f, v] = Rt(h);
  (Object.keys(v).length > 0 || c && Object.keys(c).length > 0) && Object.keys(v).forEach((I) => {
    v[I] = v[I] || {}, v[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...v[I].formElements || {}
      // State-specific overrides
    }, nt(I) || o.getState().setInitialStateOptions(I, v[I]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const k = (I, a) => {
    const [y] = rt(a?.componentId ?? At());
    Vt({
      stateKey: I,
      options: a,
      initialOptionsPart: v
    });
    const n = o.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [W, F] = Zt(
      S,
      {
        stateKey: I,
        syncUpdate: a?.syncUpdate,
        componentId: y,
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
    return F;
  };
  function w(I, a) {
    Vt({ stateKey: I, options: a, initialOptionsPart: v }), a.localStorage && Jt(I, a), mt(I);
  }
  return { useCogsState: k, setCogsOptions: w };
}, {
  setUpdaterState: gt,
  setState: K,
  getInitialOptions: nt,
  getKeyState: bt,
  getValidationErrors: Ht,
  setStateLog: zt,
  updateInitialStateGlobal: Tt,
  addValidationError: Bt,
  removeValidationError: J,
  setServerSyncActions: qt
} = o.getState(), xt = (t, c, h, f, v) => {
  h?.log && console.log(
    "saving to localstorage",
    c,
    h.localStorage?.key,
    f
  );
  const k = Z(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if (k && f) {
    const w = `${f}-${c}-${k}`;
    let I;
    try {
      I = St(w)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: v ?? I
    }, y = Wt.serialize(a);
    window.localStorage.setItem(
      w,
      JSON.stringify(y.json)
    );
  }
}, St = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, Jt = (t, c) => {
  const h = o.getState().cogsStateStore[t], { sessionId: f } = Ct(), v = Z(c?.localStorage?.key) ? c.localStorage.key(h) : c?.localStorage?.key;
  if (v && f) {
    const k = St(
      `${f}-${t}-${v}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return K(t, k.state), mt(t), !0;
  }
  return !1;
}, Pt = (t, c, h, f, v, k) => {
  const w = {
    initialState: c,
    updaterState: ft(
      t,
      f,
      v,
      k
    ),
    state: h
  };
  Tt(t, w.initialState), gt(t, w.updaterState), K(t, w.state);
}, mt = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const h = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || h.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((f) => f());
  });
}, me = (t, c) => {
  const h = o.getState().stateComponents.get(t);
  if (h) {
    const f = `${t}////${c}`, v = h.components.get(f);
    if ((v ? Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"] : null)?.includes("none"))
      return;
    v && v.forceUpdate();
  }
}, Yt = (t, c, h, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: z(c, f),
        newValue: z(h, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: z(h, f)
      };
    case "cut":
      return {
        oldValue: z(c, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Zt(t, {
  stateKey: c,
  serverSync: h,
  localStorage: f,
  formElements: v,
  reactiveDeps: k,
  reactiveType: w,
  componentId: I,
  initialState: a,
  syncUpdate: y,
  dependencies: n,
  serverState: S
} = {}) {
  const [W, F] = rt({}), { sessionId: U } = Ct();
  let G = !c;
  const [m] = rt(c ?? At()), l = o.getState().stateLog[m], it = Y(/* @__PURE__ */ new Set()), X = Y(I ?? At()), O = Y(
    null
  );
  O.current = nt(m) ?? null, dt(() => {
    if (y && y.stateKey === m && y.path?.[0]) {
      K(m, (r) => ({
        ...r,
        [y.path[0]]: y.newValue
      }));
      const e = `${y.stateKey}:${y.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: y.timeStamp,
        userId: y.userId
      });
    }
  }, [y]), dt(() => {
    if (a) {
      kt(m, {
        initialState: a
      });
      const e = O.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[m];
      if (!(i && !H(i, a) || !i) && !s)
        return;
      let u = null;
      const A = Z(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      A && U && (u = St(`${U}-${m}-${A}`));
      let p = a, T = !1;
      const b = s ? Date.now() : 0, N = u?.lastUpdated || 0, M = u?.lastSyncedWithServer || 0;
      s && b > N ? (p = e.serverState.data, T = !0) : u && N > M && (p = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), o.getState().initializeShadowState(m, a), Pt(
        m,
        a,
        p,
        ot,
        X.current,
        U
      ), T && A && U && xt(p, m, e, U, Date.now()), mt(m), (Array.isArray(w) ? w : [w || "component"]).includes("none") || F({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), ut(() => {
    G && kt(m, {
      serverSync: h,
      formElements: v,
      initialState: a,
      localStorage: f,
      middleware: O.current?.middleware
    });
    const e = `${m}////${X.current}`, r = o.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => F({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), o.getState().stateComponents.set(m, r), F({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(m));
    };
  }, []);
  const ot = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const u = `${m}-${r.join(".")}`;
      it.current.add(u);
    }
    const g = o.getState();
    K(m, (u) => {
      const A = Z(e) ? e(u) : e, p = `${m}-${r.join(".")}`;
      if (p) {
        let C = !1, V = g.signalDomElements.get(p);
        if ((!V || V.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const R = r.slice(0, -1), D = z(A, R);
          if (Array.isArray(D)) {
            C = !0;
            const $ = `${m}-${R.join(".")}`;
            V = g.signalDomElements.get($);
          }
        }
        if (V) {
          const R = C ? z(A, r.slice(0, -1)) : z(A, r);
          V.forEach(({ parentId: D, position: $, effect: E }) => {
            const x = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (x) {
              const _ = Array.from(x.childNodes);
              if (_[$]) {
                const j = E ? new Function("state", `return (${E})(state)`)(R) : R;
                _[$].textContent = String(j);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (i || O.current?.validation?.key) && r && J(
        (i || O.current?.validation?.key) + "." + r.join(".")
      );
      const T = r.slice(0, r.length - 1);
      s.updateType === "cut" && O.current?.validation?.key && J(
        O.current?.validation?.key + "." + T.join(".")
      ), s.updateType === "insert" && O.current?.validation?.key && Ht(
        O.current?.validation?.key + "." + T.join(".")
      ).filter(([V, R]) => {
        let D = V?.split(".").length;
        if (V == T.join(".") && D == T.length - 1) {
          let $ = V + "." + T;
          J(V), Bt($, R);
        }
      });
      const b = g.stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", b), b) {
        const C = Et(u, A), V = new Set(C), R = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          D,
          $
        ] of b.components.entries()) {
          let E = !1;
          const x = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !x.includes("none")) {
            if (x.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (x.includes("component") && (($.paths.has(R) || $.paths.has("")) && (E = !0), !E))
              for (const _ of V) {
                let j = _;
                for (; ; ) {
                  if ($.paths.has(j)) {
                    E = !0;
                    break;
                  }
                  const L = j.lastIndexOf(".");
                  if (L !== -1) {
                    const Q = j.substring(
                      0,
                      L
                    );
                    if (!isNaN(
                      Number(j.substring(L + 1))
                    ) && $.paths.has(Q)) {
                      E = !0;
                      break;
                    }
                    j = Q;
                  } else
                    j = "";
                  if (j === "")
                    break;
                }
                if (E) break;
              }
            if (!E && x.includes("deps") && $.depsFunction) {
              const _ = $.depsFunction(A);
              let j = !1;
              typeof _ == "boolean" ? _ && (j = !0) : H($.deps, _) || ($.deps = _, j = !0), j && (E = !0);
            }
            E && $.forceUpdate();
          }
        }
      }
      const N = Date.now();
      r = r.map((C, V) => {
        const R = r.slice(0, -1), D = z(A, R);
        return V === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (D.length - 1).toString() : C;
      });
      const { oldValue: M, newValue: P } = Yt(
        s.updateType,
        u,
        A,
        r
      ), B = {
        timeStamp: N,
        stateKey: m,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: M,
        newValue: P
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(m, r, A);
          break;
        case "insert":
          const C = r.slice(0, -1);
          g.insertShadowArrayElement(m, C, P);
          break;
        case "cut":
          const V = r.slice(0, -1), R = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(m, V, R);
          break;
      }
      if (zt(m, (C) => {
        const R = [...C ?? [], B].reduce((D, $) => {
          const E = `${$.stateKey}:${JSON.stringify($.path)}`, x = D.get(E);
          return x ? (x.timeStamp = Math.max(x.timeStamp, $.timeStamp), x.newValue = $.newValue, x.oldValue = x.oldValue ?? $.oldValue, x.updateType = $.updateType) : D.set(E, { ...$ }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(R.values());
      }), xt(
        A,
        m,
        O.current,
        U
      ), O.current?.middleware && O.current.middleware({
        updateLog: l,
        update: B
      }), O.current?.serverSync) {
        const C = g.serverState[m], V = O.current?.serverSync;
        qt(m, {
          syncKey: typeof V.syncKey == "string" ? V.syncKey : V.syncKey({ state: A }),
          rollBackState: C,
          actionTimeStamp: Date.now() + (V.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return A;
    });
  };
  o.getState().updaterState[m] || (gt(
    m,
    ft(
      m,
      ot,
      X.current,
      U
    )
  ), o.getState().cogsStateStore[m] || K(m, t), o.getState().initialStateGlobal[m] || Tt(m, t));
  const d = wt(() => ft(
    m,
    ot,
    X.current,
    U
  ), [m, U]);
  return [bt(m), d];
}
function ft(t, c, h, f) {
  const v = /* @__PURE__ */ new Map();
  let k = 0;
  const w = (y) => {
    const n = y.join(".");
    for (const [S] of v)
      (S === n || S.startsWith(n + ".")) && v.delete(S);
    k++;
  }, I = {
    removeValidation: (y) => {
      y?.validationKey && J(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && J(n?.key), y?.validationKey && J(y.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), v.clear(), k++;
      const W = a(S, []), F = nt(t), U = Z(F?.localStorage?.key) ? F?.localStorage?.key(S) : F?.localStorage?.key, G = `${f}-${t}-${U}`;
      G && localStorage.removeItem(G), gt(t, W), K(t, S);
      const m = o.getState().stateComponents.get(t);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (y) => {
      v.clear(), k++;
      const n = ft(
        t,
        c,
        h,
        f
      ), S = o.getState().initialStateGlobal[t], W = nt(t), F = Z(W?.localStorage?.key) ? W?.localStorage?.key(S) : W?.localStorage?.key, U = `${f}-${t}-${F}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), Ot(() => {
        Tt(t, y), o.getState().initializeShadowState(t, y), gt(t, n), K(t, y);
        const G = o.getState().stateComponents.get(t);
        G && G.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (G) => n.get()[G]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const y = o.getState().serverState[t];
      return !!(y && H(y, bt(t)));
    }
  };
  function a(y, n = [], S) {
    const W = n.map(String).join(".");
    v.get(W);
    const F = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(I).forEach((m) => {
      F[m] = I[m];
    });
    const U = {
      apply(m, l, it) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(m, l) {
        S?.validIndices && !Array.isArray(y) && (S = { ...S, validIndices: void 0 });
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
          const d = `${t}////${h}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const r = e.components.get(d);
            if (r && !r.paths.has("")) {
              const s = n.join(".");
              let i = !0;
              for (const g of r.paths)
                if (s.startsWith(g) && (s === g || s[g.length] === ".")) {
                  i = !1;
                  break;
                }
              i && r.paths.add(s);
            }
          }
        }
        if (l === "getDifferences")
          return () => Et(
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
                o.getState().removeValidationError(s), i.errors.forEach((u) => {
                  const A = [s, ...u.path].join(".");
                  o.getState().addValidationError(A, u.message);
                });
                const g = o.getState().stateComponents.get(t);
                g && g.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return i?.success && e.onSuccess ? e.onSuccess(i.data) : !i?.success && e.onError && e.onError(i.error), i;
            } catch (i) {
              return e.onError && e.onError(i), { success: !1, error: i };
            }
          };
        if (l === "_status") {
          const d = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = z(e, n);
          return H(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = z(e, n);
            return H(d, r) ? "fresh" : "stale";
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
        if (Array.isArray(y)) {
          const d = () => S?.validIndices ? y.map((r, s) => ({
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
                  y[e],
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
                // Default/estimated height
                overscan: s = 5,
                stickToBottom: i = !1
              } = e, g = Y(null), [u, A] = rt({
                startIndex: 0,
                endIndex: 10
              }), p = vt(
                (E) => o.getState().getShadowMetadata(t, [...n, E.toString()])?.virtualizer?.itemHeight || r,
                [r, t, n]
              ), T = Y(i), b = Y(0), N = Y(!0), M = o().getNestedState(
                t,
                n
              ), P = M.length, { totalHeight: B, positions: C } = wt(() => {
                let E = 0;
                const x = [];
                for (let _ = 0; _ < P; _++)
                  x[_] = E, E += p(_), console.log("height", p(_), E);
                return { totalHeight: E, positions: x };
              }, [P, p]), V = wt(() => {
                const E = Math.max(0, u.startIndex), x = Math.min(P, u.endIndex), _ = Array.from(
                  { length: x - E },
                  (L, Q) => E + Q
                ), j = _.map((L) => M[L]);
                return a(j, n, {
                  ...S,
                  validIndices: _
                });
              }, [u.startIndex, u.endIndex, M, P]);
              ut(() => {
                const E = g.current;
                if (!E) return;
                const x = T.current, _ = P > b.current;
                b.current = P;
                const j = () => {
                  const { scrollTop: L, clientHeight: Q, scrollHeight: _t } = E;
                  T.current = _t - L - Q < 10;
                  let tt = ((et, Mt) => {
                    let ct = 0, ht = et.length - 1;
                    for (; ct <= ht; ) {
                      const yt = Math.floor((ct + ht) / 2);
                      et[yt] < Mt ? ct = yt + 1 : ht = yt - 1;
                    }
                    return ct;
                  })(C, L), q = tt;
                  for (; q < P && C[q] < L + Q; )
                    q++;
                  tt = Math.max(0, tt - s), q = Math.min(P, q + s), console.log("startIndex", tt, "endIndex", q), A((et) => et.startIndex !== tt || et.endIndex !== q ? { startIndex: tt, endIndex: q } : et);
                };
                return E.addEventListener("scroll", j, {
                  passive: !0
                }), i && (N.current ? E.scrollTo({
                  top: E.scrollHeight,
                  behavior: "auto"
                }) : x && _ && requestAnimationFrame(() => {
                  E.scrollTo({
                    top: E.scrollHeight,
                    behavior: "smooth"
                  });
                })), N.current = !1, j(), () => E.removeEventListener("scroll", j);
              }, [P, s, i, C]);
              const R = vt(
                (E = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: E
                  });
                },
                []
              ), D = vt(
                (E, x = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: C[E] || 0,
                    behavior: x
                  });
                },
                [C]
              ), $ = {
                outer: {
                  ref: g,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: { height: `${B}px`, position: "relative" }
                },
                list: {
                  style: {
                    transform: `translateY(${C[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: V,
                virtualizerProps: $,
                scrollToBottom: R,
                scrollToIndex: D
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, A) => e(u.item, A.item)
              ), i = s.map(({ item: u }) => u), g = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(i, n, g);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = d().filter(
                ({ item: u }, A) => e(u, A)
              ), i = s.map(({ item: u }) => u), g = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(i, n, g);
            };
          if (l === "stateMap")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (i, g) => g)).map((i, g) => {
                const u = r[i], A = [...n, i.toString()], p = a(u, A, S);
                return e(u, p, {
                  register: () => {
                    const [, b] = rt({}), N = `${h}-${n.join(".")}-${i}`;
                    ut(() => {
                      const M = `${t}////${N}`, P = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return P.components.set(M, {
                        forceUpdate: () => b({}),
                        paths: /* @__PURE__ */ new Set([A.join(".")])
                      }), o.getState().stateComponents.set(t, P), () => {
                        const B = o.getState().stateComponents.get(t);
                        B && B.components.delete(M);
                      };
                    }, [t, N]);
                  },
                  index: g,
                  originalIndex: i
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                r
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => y.map((s, i) => {
              let g;
              S?.validIndices && S.validIndices[i] !== void 0 ? g = S.validIndices[i] : g = i;
              const u = [...n, g.toString()], A = a(s, u, S);
              return e(
                s,
                A,
                i,
                y,
                a(y, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => st(Xt, {
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
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (i, g) => g)).map((i, g) => {
                const u = r[i], A = [...n, i.toString()], p = a(u, A, S), T = `${h}-${n.join(".")}-${i}`;
                return st(Kt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: T,
                  itemPath: A,
                  children: e(
                    u,
                    p,
                    g,
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
              const r = y;
              v.clear(), k++;
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
              const r = y[e];
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
            return (e) => (w(n), It(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), g = Z(e) ? e(i) : e;
              let u = null;
              if (!i.some((p) => {
                if (r) {
                  const b = r.every(
                    (N) => H(p[N], g[N])
                  );
                  return b && (u = p), b;
                }
                const T = H(p, g);
                return T && (u = p), T;
              }))
                w(n), It(c, g, n, t);
              else if (s && u) {
                const p = s(u), T = i.map(
                  (b) => H(b, u) ? p : b
                );
                w(n), at(c, T, n);
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
              for (let r = 0; r < y.length; r++)
                y[r] === e && lt(c, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = y.findIndex((s) => s === e);
              r > -1 ? lt(c, n, t, r) : It(c, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = d().find(
                ({ item: g }, u) => e(g, u)
              );
              if (!s) return;
              const i = [...n, s.originalIndex.toString()];
              return a(s.item, i, S);
            };
          if (l === "findWith")
            return (e, r) => {
              const i = d().find(
                ({ item: u }) => u[e] === r
              );
              if (!i) return;
              const g = [...n, i.originalIndex.toString()];
              return a(i.item, g, S);
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
            if (S?.validIndices && Array.isArray(y)) {
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
          return (d) => St(f + "-" + t + "-" + d);
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
              const e = o.getState().cogsStateStore[t], s = Gt(e, d).newDocument;
              Pt(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                h,
                f
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const g = Et(e, s), u = new Set(g);
                for (const [
                  A,
                  p
                ] of i.components.entries()) {
                  let T = !1;
                  const b = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!b.includes("none")) {
                    if (b.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (b.includes("component") && (p.paths.has("") && (T = !0), !T))
                      for (const N of u) {
                        if (p.paths.has(N)) {
                          T = !0;
                          break;
                        }
                        let M = N.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const P = N.substring(0, M);
                          if (p.paths.has(P)) {
                            T = !0;
                            break;
                          }
                          const B = N.substring(
                            M + 1
                          );
                          if (!isNaN(Number(B))) {
                            const C = P.lastIndexOf(".");
                            if (C !== -1) {
                              const V = P.substring(
                                0,
                                C
                              );
                              if (p.paths.has(V)) {
                                T = !0;
                                break;
                              }
                            }
                          }
                          M = P.lastIndexOf(".");
                        }
                        if (T) break;
                      }
                    if (!T && b.includes("deps") && p.depsFunction) {
                      const N = p.depsFunction(s);
                      let M = !1;
                      typeof N == "boolean" ? N && (M = !0) : H(p.deps, N) || (p.deps = N, M = !0), M && (T = !0);
                    }
                    T && p.forceUpdate();
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
              J(d.key);
              const r = o.getState().cogsStateStore[t];
              try {
                const s = o.getState().getValidationErrors(d.key);
                s && s.length > 0 && s.forEach(([g]) => {
                  g && g.startsWith(d.key) && J(g);
                });
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((u) => {
                  const A = u.path, p = u.message, T = [d.key, ...A].join(".");
                  e(T, p);
                }), mt(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return h;
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
          return () => $t.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ pt(
            Ut,
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
              Ft(() => {
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
          return (d, e) => /* @__PURE__ */ pt(
            Dt,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const O = [...n, l], ot = o.getState().getNestedState(t, O);
        return a(ot, O, S);
      }
    }, G = new Proxy(F, U);
    return v.set(W, {
      proxy: G,
      stateVersion: k
    }), G;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function Nt(t) {
  return st(Qt, { proxy: t });
}
function Xt({
  proxy: t,
  rebuildStateShape: c
}) {
  const h = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(h) ? c(
    h,
    t._path
  ).stateMapNoRender(
    (v, k, w, I, a) => t._mapFn(v, k, w, I, a)
  ) : null;
}
function Qt({
  proxy: t
}) {
  const c = Y(null), h = `${t._stateKey}-${t._path.join(".")}`;
  return dt(() => {
    const f = c.current;
    if (!f || !f.parentElement) return;
    const v = f.parentElement, w = Array.from(v.childNodes).indexOf(f);
    let I = v.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, v.setAttribute("data-parent-id", I));
    const y = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: w,
      effect: t._effect
    };
    o.getState().addSignalElement(h, y);
    const n = o.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (F) {
        console.error("Error evaluating effect function during mount:", F), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const W = document.createTextNode(String(S));
    f.replaceWith(W);
  }, [t._stateKey, t._path.join("."), t._effect]), st("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": h
  });
}
function he(t) {
  const c = jt(
    (h) => {
      const f = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(t._stateKey, {
        forceUpdate: h,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => f.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return st("text", {}, String(c));
}
function Kt({
  stateKey: t,
  itemComponentId: c,
  itemPath: h,
  children: f
}) {
  const [, v] = rt({}), [k, w] = Lt();
  return dt(() => {
    w.height > 0 && o.getState().setShadowMetadata(t, h, {
      virtualizer: {
        itemHeight: w.height
      }
    });
  }, [w.height]), ut(() => {
    const I = `${t}////${c}`, a = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(I, {
      forceUpdate: () => v({}),
      paths: /* @__PURE__ */ new Set([h.join(".")])
    }), o.getState().stateComponents.set(t, a), () => {
      const y = o.getState().stateComponents.get(t);
      y && y.components.delete(I);
    };
  }, [t, c, h.join(".")]), /* @__PURE__ */ pt("div", { ref: k, children: f });
}
export {
  Nt as $cogsSignal,
  he as $cogsSignalStore,
  fe as addStateOptions,
  Se as createCogsState,
  me as notifyComponent,
  Zt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
