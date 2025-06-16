"use client";
import { jsx as vt } from "react/jsx-runtime";
import { useState as et, useRef as K, useEffect as st, useLayoutEffect as dt, useMemo as yt, createElement as it, useSyncExternalStore as Pt, startTransition as _t, useCallback as Tt } from "react";
import { transformStateFunc as Mt, isDeepEqual as z, isFunction as Q, getNestedValue as B, getDifferences as It, debounce as jt } from "./utility.js";
import { pushFunc as ht, updateFn as at, cutFunc as lt, ValidationWrapper as Rt, FormControlComponent as Ot } from "./Functions.jsx";
import Ut from "superjson";
import { v4 as pt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Et } from "./store.js";
import { useCogsConfig as Vt } from "./CogsStateClient.jsx";
import { applyPatch as Ft } from "fast-json-patch";
import Dt from "react-use-measure";
function At(t, c) {
  const m = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, y = m(t) || {};
  f(t, {
    ...y,
    ...c
  });
}
function $t({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const f = rt(t) || {}, y = m[t] || {}, b = o.getState().setInitialStateOptions, p = { ...y, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      p.hasOwnProperty(a) ? (a == "localStorage" && c[a] && p[a].key !== c[a]?.key && (I = !0, p[a] = c[a]), a == "initialState" && c[a] && p[a] !== c[a] && // Different references
      !z(p[a], c[a]) && (I = !0, p[a] = c[a])) : (I = !0, p[a] = c[a]);
  I && b(t, p);
}
function ce(t, { formElements: c, validation: m }) {
  return { initialState: t, formElements: c, validation: m };
}
const le = (t, c) => {
  let m = t;
  const [f, y] = Mt(m);
  (Object.keys(y).length > 0 || c && Object.keys(c).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, rt(I) || o.getState().setInitialStateOptions(I, y[I]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const b = (I, a) => {
    const [v] = et(a?.componentId ?? pt());
    $t({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = o.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [L, O] = qt(
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
    $t({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && zt(I, a), St(I);
  }
  return { useCogsState: b, setCogsOptions: p };
}, {
  setUpdaterState: ut,
  setState: nt,
  getInitialOptions: rt,
  getKeyState: Nt,
  getValidationErrors: Wt,
  setStateLog: Lt,
  updateInitialStateGlobal: wt,
  addValidationError: Gt,
  removeValidationError: X,
  setServerSyncActions: Ht
} = o.getState(), bt = (t, c, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    f
  );
  const b = Q(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (b && f) {
    const p = `${f}-${c}-${b}`;
    let I;
    try {
      I = ft(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Ut.serialize(a);
    window.localStorage.setItem(
      p,
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
}, zt = (t, c) => {
  const m = o.getState().cogsStateStore[t], { sessionId: f } = Vt(), y = Q(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (y && f) {
    const b = ft(
      `${f}-${t}-${y}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return nt(t, b.state), St(t), !0;
  }
  return !1;
}, Ct = (t, c, m, f, y, b) => {
  const p = {
    initialState: c,
    updaterState: gt(
      t,
      f,
      y,
      b
    ),
    state: m
  };
  wt(t, p.initialState), ut(t, p.updaterState), nt(t, p.state);
}, St = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || m.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((f) => f());
  });
}, de = (t, c) => {
  const m = o.getState().stateComponents.get(t);
  if (m) {
    const f = `${t}////${c}`, y = m.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Bt = (t, c, m, f) => {
  switch (t) {
    case "update":
      return {
        oldValue: B(c, f),
        newValue: B(m, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: B(m, f)
      };
    case "cut":
      return {
        oldValue: B(c, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function qt(t, {
  stateKey: c,
  serverSync: m,
  localStorage: f,
  formElements: y,
  reactiveDeps: b,
  reactiveType: p,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [L, O] = et({}), { sessionId: U } = Vt();
  let G = !c;
  const [h] = et(c ?? pt()), l = o.getState().stateLog[h], ct = K(/* @__PURE__ */ new Set()), tt = K(I ?? pt()), j = K(
    null
  );
  j.current = rt(h) ?? null, st(() => {
    if (v && v.stateKey === h && v.path?.[0]) {
      nt(h, (r) => ({
        ...r,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), st(() => {
    if (a) {
      At(h, {
        initialState: a
      });
      const e = j.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !z(i, a) || !i) && !s)
        return;
      let u = null;
      const E = Q(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      E && U && (u = ft(`${U}-${h}-${E}`));
      let w = a, $ = !1;
      const _ = s ? Date.now() : 0, C = u?.lastUpdated || 0, M = u?.lastSyncedWithServer || 0;
      s && _ > C ? (w = e.serverState.data, $ = !0) : u && C > M && (w = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), o.getState().initializeShadowState(h, a), Ct(
        h,
        a,
        w,
        ot,
        tt.current,
        U
      ), $ && E && U && bt(w, h, e, U, Date.now()), St(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || O({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), dt(() => {
    G && At(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: f,
      middleware: j.current?.middleware
    });
    const e = `${h}////${tt.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), O({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const ot = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const u = `${h}-${r.join(".")}`;
      ct.current.add(u);
    }
    const g = o.getState();
    nt(h, (u) => {
      const E = Q(e) ? e(u) : e, w = `${h}-${r.join(".")}`;
      if (w) {
        let N = !1, k = g.signalDomElements.get(w);
        if ((!k || k.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const R = r.slice(0, -1), D = B(E, R);
          if (Array.isArray(D)) {
            N = !0;
            const A = `${h}-${R.join(".")}`;
            k = g.signalDomElements.get(A);
          }
        }
        if (k) {
          const R = N ? B(E, r.slice(0, -1)) : B(E, r);
          k.forEach(({ parentId: D, position: A, effect: F }) => {
            const T = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (T) {
              const x = Array.from(T.childNodes);
              if (x[A]) {
                const P = F ? new Function("state", `return (${F})(state)`)(R) : R;
                x[A].textContent = String(P);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (i || j.current?.validation?.key) && r && X(
        (i || j.current?.validation?.key) + "." + r.join(".")
      );
      const $ = r.slice(0, r.length - 1);
      s.updateType === "cut" && j.current?.validation?.key && X(
        j.current?.validation?.key + "." + $.join(".")
      ), s.updateType === "insert" && j.current?.validation?.key && Wt(
        j.current?.validation?.key + "." + $.join(".")
      ).filter(([k, R]) => {
        let D = k?.split(".").length;
        if (k == $.join(".") && D == $.length - 1) {
          let A = k + "." + $;
          X(k), Gt(A, R);
        }
      });
      const _ = g.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", _), _) {
        const N = It(u, E), k = new Set(N), R = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          D,
          A
        ] of _.components.entries()) {
          let F = !1;
          const T = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (console.log("component", A), !T.includes("none")) {
            if (T.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if (T.includes("component") && ((A.paths.has(R) || A.paths.has("")) && (F = !0), !F))
              for (const x of k) {
                let P = x;
                for (; ; ) {
                  if (A.paths.has(P)) {
                    F = !0;
                    break;
                  }
                  const W = P.lastIndexOf(".");
                  if (W !== -1) {
                    const H = P.substring(
                      0,
                      W
                    );
                    if (!isNaN(
                      Number(P.substring(W + 1))
                    ) && A.paths.has(H)) {
                      F = !0;
                      break;
                    }
                    P = H;
                  } else
                    P = "";
                  if (P === "")
                    break;
                }
                if (F) break;
              }
            if (!F && T.includes("deps") && A.depsFunction) {
              const x = A.depsFunction(E);
              let P = !1;
              typeof x == "boolean" ? x && (P = !0) : z(A.deps, x) || (A.deps = x, P = !0), P && (F = !0);
            }
            F && A.forceUpdate();
          }
        }
      }
      const C = Date.now();
      r = r.map((N, k) => {
        const R = r.slice(0, -1), D = B(E, R);
        return k === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (D.length - 1).toString() : N;
      });
      const { oldValue: M, newValue: V } = Bt(
        s.updateType,
        u,
        E,
        r
      ), q = {
        timeStamp: C,
        stateKey: h,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: M,
        newValue: V
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(h, r, E);
          break;
        case "insert":
          const N = r.slice(0, -1);
          g.insertShadowArrayElement(h, N, V);
          break;
        case "cut":
          const k = r.slice(0, -1), R = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(h, k, R);
          break;
      }
      if (Lt(h, (N) => {
        const R = [...N ?? [], q].reduce((D, A) => {
          const F = `${A.stateKey}:${JSON.stringify(A.path)}`, T = D.get(F);
          return T ? (T.timeStamp = Math.max(T.timeStamp, A.timeStamp), T.newValue = A.newValue, T.oldValue = T.oldValue ?? A.oldValue, T.updateType = A.updateType) : D.set(F, { ...A }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(R.values());
      }), bt(
        E,
        h,
        j.current,
        U
      ), j.current?.middleware && j.current.middleware({
        updateLog: l,
        update: q
      }), j.current?.serverSync) {
        const N = g.serverState[h], k = j.current?.serverSync;
        Ht(h, {
          syncKey: typeof k.syncKey == "string" ? k.syncKey : k.syncKey({ state: E }),
          rollBackState: N,
          actionTimeStamp: Date.now() + (k.debounce ?? 3e3),
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
      tt.current,
      U
    )
  ), o.getState().cogsStateStore[h] || nt(h, t), o.getState().initialStateGlobal[h] || wt(h, t));
  const d = yt(() => gt(
    h,
    ot,
    tt.current,
    U
  ), [h, U]);
  return [Nt(h), d];
}
function gt(t, c, m, f) {
  const y = /* @__PURE__ */ new Map();
  let b = 0;
  const p = (v) => {
    const n = v.join(".");
    for (const [S] of y)
      (S === n || S.startsWith(n + ".")) && y.delete(S);
    b++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && X(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && X(n?.key), v?.validationKey && X(v.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), b++;
      const L = a(S, []), O = rt(t), U = Q(O?.localStorage?.key) ? O?.localStorage?.key(S) : O?.localStorage?.key, G = `${f}-${t}-${U}`;
      G && localStorage.removeItem(G), ut(t, L), nt(t, S);
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
      ), S = o.getState().initialStateGlobal[t], L = rt(t), O = Q(L?.localStorage?.key) ? L?.localStorage?.key(S) : L?.localStorage?.key, U = `${f}-${t}-${O}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), _t(() => {
        wt(t, v), o.getState().initializeShadowState(t, v), ut(t, n), nt(t, v);
        const G = o.getState().stateComponents.get(t);
        G && G.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (G) => n.get()[G]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const v = o.getState().serverState[t];
      return !!(v && z(v, Nt(t)));
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
    const U = {
      apply(h, l, ct) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
        const ct = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !ct.has(l)) {
          const d = `${t}////${m}`, e = o.getState().stateComponents.get(t);
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
                o.getState().removeValidationError(s), i.errors.forEach((u) => {
                  const E = [s, ...u.path].join(".");
                  o.getState().addValidationError(E, u.message);
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
          const d = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = B(e, n);
          return z(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = B(e, n);
            return z(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[t], e = rt(t), r = Q(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${f}-${t}-${r}`;
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
              } = e, g = K(null), [u, E] = et({
                startIndex: 0,
                endIndex: 10
              }), w = K(i), [$, _] = et(0), C = K(!1), M = o().getNestedState(
                t,
                n
              ), V = M.length;
              st(() => o.getState().subscribeToShadowState(t, () => {
                _((x) => x + 1);
              }), [t]);
              const { totalHeight: q, positions: N, bottomItemsMeasured: k } = yt(() => {
                const T = o.getState().getShadowMetadata(t, n) || [];
                let x = 0;
                const P = [];
                let W = 0;
                const H = Math.max(0, V - 20);
                for (let Z = 0; Z < V; Z++) {
                  P[Z] = x;
                  const J = T[Z]?.virtualizer?.itemHeight;
                  J ? (x += J, Z >= H && W++) : x += r;
                }
                const Y = W >= Math.min(20, V - H);
                return {
                  totalHeight: x,
                  positions: P,
                  bottomItemsMeasured: Y
                };
              }, [
                V,
                t,
                n.join("."),
                r,
                $
              ]), R = yt(() => {
                const T = Math.max(0, u.startIndex), x = Math.min(V, u.endIndex), P = Array.from(
                  { length: x - T },
                  (H, Y) => T + Y
                ), W = P.map((H) => M[H]);
                return a(W, n, {
                  ...S,
                  validIndices: P
                });
              }, [u.startIndex, u.endIndex, M, V]);
              dt(() => {
                const T = g.current;
                if (!T) return;
                const x = () => {
                  if (!T) return;
                  const { scrollTop: W } = T;
                  let H = 0, Y = V - 1;
                  for (; H <= Y; ) {
                    const mt = Math.floor((H + Y) / 2);
                    N[mt] < W ? H = mt + 1 : Y = mt - 1;
                  }
                  const Z = Math.max(0, Y - s);
                  let J = Z;
                  const xt = W + T.clientHeight;
                  for (; J < V && N[J] < xt; )
                    J++;
                  J = Math.min(V, J + s), E({ startIndex: Z, endIndex: J });
                }, P = () => {
                  w.current = T.scrollHeight - T.scrollTop - T.clientHeight < 1, x();
                };
                if (T.addEventListener("scroll", P, {
                  passive: !0
                }), i && !C.current && V > 0)
                  if (k)
                    console.log(
                      "[VirtualView] Bottom items measured, scrolling to true bottom"
                    ), C.current = !0, T.scrollTop = T.scrollHeight, w.current = !0;
                  else {
                    console.log(
                      "[VirtualView] Jumping to near bottom to trigger measurements"
                    );
                    const W = Math.max(
                      0,
                      (V - 30) * r
                    );
                    T.scrollTop = W;
                  }
                return x(), () => {
                  T.removeEventListener("scroll", P);
                };
              }, [V, N, i, k]);
              const D = Tt(
                (T = "smooth") => {
                  g.current && (w.current = !0, g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: T
                  }));
                },
                []
              ), A = Tt(
                (T, x = "smooth") => {
                  g.current && N[T] !== void 0 && (w.current = !1, g.current.scrollTo({
                    top: N[T],
                    behavior: x
                  }));
                },
                [N]
              ), F = {
                outer: {
                  ref: g,
                  style: {
                    overflowY: "auto",
                    height: "100%",
                    overflowAnchor: i ? "auto" : "none"
                  }
                },
                inner: {
                  style: {
                    height: `${q}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${N[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: R,
                virtualizerProps: F,
                scrollToBottom: D,
                scrollToIndex: A
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, E) => e(u.item, E.item)
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
                ({ item: u }, E) => e(u, E)
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
                const u = r[i], E = [...n, i.toString()], w = a(u, E, S);
                return e(u, w, {
                  register: () => {
                    const [, _] = et({}), C = `${m}-${n.join(".")}-${i}`;
                    dt(() => {
                      const M = `${t}////${C}`, V = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return V.components.set(M, {
                        forceUpdate: () => _({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(t, V), () => {
                        const q = o.getState().stateComponents.get(t);
                        q && q.components.delete(M);
                      };
                    }, [t, C]);
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
            return (e) => v.map((s, i) => {
              let g;
              S?.validIndices && S.validIndices[i] !== void 0 ? g = S.validIndices[i] : g = i;
              const u = [...n, g.toString()], E = a(s, u, S);
              return e(
                s,
                E,
                i,
                v,
                a(v, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => it(Jt, {
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
                const u = r[i], E = [...n, i.toString()], w = a(u, E, S), $ = `${m}-${n.join(".")}-${i}`;
                return it(Zt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: $,
                  itemPath: E,
                  children: e(
                    u,
                    w,
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
            return (e) => (p(n), ht(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), g = Q(e) ? e(i) : e;
              let u = null;
              if (!i.some((w) => {
                if (r) {
                  const _ = r.every(
                    (C) => z(w[C], g[C])
                  );
                  return _ && (u = w), _;
                }
                const $ = z(w, g);
                return $ && (u = w), $;
              }))
                p(n), ht(c, g, n, t);
              else if (s && u) {
                const w = s(u), $ = i.map(
                  (_) => z(_, u) ? w : _
                );
                p(n), at(c, $, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return p(n), lt(c, n, t, e), a(
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
        const tt = n[n.length - 1];
        if (!isNaN(Number(tt))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => lt(
              c,
              d,
              t,
              Number(tt)
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
          return (d) => kt({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => kt({
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
            at(c, i, e), p(e);
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
            at(c, i, d), p(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], s = Ft(e, d).newDocument;
              Ct(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                m,
                f
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const g = It(e, s), u = new Set(g);
                for (const [
                  E,
                  w
                ] of i.components.entries()) {
                  let $ = !1;
                  const _ = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!_.includes("none")) {
                    if (_.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (_.includes("component") && (w.paths.has("") && ($ = !0), !$))
                      for (const C of u) {
                        if (w.paths.has(C)) {
                          $ = !0;
                          break;
                        }
                        let M = C.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const V = C.substring(0, M);
                          if (w.paths.has(V)) {
                            $ = !0;
                            break;
                          }
                          const q = C.substring(
                            M + 1
                          );
                          if (!isNaN(Number(q))) {
                            const N = V.lastIndexOf(".");
                            if (N !== -1) {
                              const k = V.substring(
                                0,
                                N
                              );
                              if (w.paths.has(k)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          M = V.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && _.includes("deps") && w.depsFunction) {
                      const C = w.depsFunction(s);
                      let M = !1;
                      typeof C == "boolean" ? C && (M = !0) : z(w.deps, C) || (w.deps = C, M = !0), M && ($ = !0);
                    }
                    $ && w.forceUpdate();
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
                s && s.length > 0 && s.forEach(([g]) => {
                  g && g.startsWith(d.key) && X(g);
                });
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((u) => {
                  const E = u.path, w = u.message, $ = [d.key, ...E].join(".");
                  e($, w);
                }), St(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => Et.getState().getFormRefsByStateKey(t);
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
          return () => Et.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ vt(
            Rt,
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
            p(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ vt(
            Ot,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const j = [...n, l], ot = o.getState().getNestedState(t, j);
        return a(ot, j, S);
      }
    }, G = new Proxy(O, U);
    return y.set(L, {
      proxy: G,
      stateVersion: b
    }), G;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function kt(t) {
  return it(Yt, { proxy: t });
}
function Jt({
  proxy: t,
  rebuildStateShape: c
}) {
  const m = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? c(
    m,
    t._path
  ).stateMapNoRender(
    (y, b, p, I, a) => t._mapFn(y, b, p, I, a)
  ) : null;
}
function Yt({
  proxy: t
}) {
  const c = K(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return st(() => {
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
  }, [t._stateKey, t._path.join("."), t._effect]), it("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function ue(t) {
  const c = Pt(
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
  return it("text", {}, String(c));
}
function Zt({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: f
}) {
  const [, y] = et({}), [b, p] = Dt(), I = K(null);
  return st(() => {
    p.height > 0 && p.height !== I.current && (I.current = p.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), dt(() => {
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
  kt as $cogsSignal,
  ue as $cogsSignalStore,
  ce as addStateOptions,
  le as createCogsState,
  de as notifyComponent,
  qt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
