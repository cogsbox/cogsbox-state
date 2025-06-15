"use client";
import { jsx as wt } from "react/jsx-runtime";
import { useState as K, useRef as J, useEffect as st, useLayoutEffect as ut, useMemo as Tt, createElement as it, useSyncExternalStore as jt, startTransition as Ot, useCallback as It } from "react";
import { transformStateFunc as Rt, isDeepEqual as B, isFunction as Z, getNestedValue as q, getDifferences as Et, debounce as Ut } from "./utility.js";
import { pushFunc as pt, updateFn as at, cutFunc as dt, ValidationWrapper as Ft, FormControlComponent as Dt } from "./Functions.jsx";
import Wt from "superjson";
import { v4 as At } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as kt } from "./store.js";
import { useCogsConfig as xt } from "./CogsStateClient.jsx";
import { applyPatch as Gt } from "fast-json-patch";
import Lt from "react-use-measure";
function bt(t, c) {
  const m = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, v = m(t) || {};
  f(t, {
    ...v,
    ...c
  });
}
function Vt({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const f = nt(t) || {}, v = m[t] || {}, b = o.getState().setInitialStateOptions, p = { ...v, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      p.hasOwnProperty(a) ? (a == "localStorage" && c[a] && p[a].key !== c[a]?.key && (I = !0, p[a] = c[a]), a == "initialState" && c[a] && p[a] !== c[a] && // Different references
      !B(p[a], c[a]) && (I = !0, p[a] = c[a])) : (I = !0, p[a] = c[a]);
  I && b(t, p);
}
function fe(t, { formElements: c, validation: m }) {
  return { initialState: t, formElements: c, validation: m };
}
const Se = (t, c) => {
  let m = t;
  const [f, v] = Rt(m);
  (Object.keys(v).length > 0 || c && Object.keys(c).length > 0) && Object.keys(v).forEach((I) => {
    v[I] = v[I] || {}, v[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...v[I].formElements || {}
      // State-specific overrides
    }, nt(I) || o.getState().setInitialStateOptions(I, v[I]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const b = (I, a) => {
    const [y] = K(a?.componentId ?? At());
    Vt({
      stateKey: I,
      options: a,
      initialOptionsPart: v
    });
    const n = o.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [L, O] = Zt(
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
    return O;
  };
  function p(I, a) {
    Vt({ stateKey: I, options: a, initialOptionsPart: v }), a.localStorage && Jt(I, a), mt(I);
  }
  return { useCogsState: b, setCogsOptions: p };
}, {
  setUpdaterState: gt,
  setState: tt,
  getInitialOptions: nt,
  getKeyState: Pt,
  getValidationErrors: Ht,
  setStateLog: zt,
  updateInitialStateGlobal: $t,
  addValidationError: Bt,
  removeValidationError: Y,
  setServerSyncActions: qt
} = o.getState(), Nt = (t, c, m, f, v) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    f
  );
  const b = Z(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (b && f) {
    const p = `${f}-${c}-${b}`;
    let I;
    try {
      I = St(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: v ?? I
    }, y = Wt.serialize(a);
    window.localStorage.setItem(
      p,
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
  const m = o.getState().cogsStateStore[t], { sessionId: f } = xt(), v = Z(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (v && f) {
    const b = St(
      `${f}-${t}-${v}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return tt(t, b.state), mt(t), !0;
  }
  return !1;
}, _t = (t, c, m, f, v, b) => {
  const p = {
    initialState: c,
    updaterState: ft(
      t,
      f,
      v,
      b
    ),
    state: m
  };
  $t(t, p.initialState), gt(t, p.updaterState), tt(t, p.state);
}, mt = (t) => {
  const c = o.getState().stateComponents.get(t);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || m.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((f) => f());
  });
}, me = (t, c) => {
  const m = o.getState().stateComponents.get(t);
  if (m) {
    const f = `${t}////${c}`, v = m.components.get(f);
    if ((v ? Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"] : null)?.includes("none"))
      return;
    v && v.forceUpdate();
  }
}, Yt = (t, c, m, f) => {
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
function Zt(t, {
  stateKey: c,
  serverSync: m,
  localStorage: f,
  formElements: v,
  reactiveDeps: b,
  reactiveType: p,
  componentId: I,
  initialState: a,
  syncUpdate: y,
  dependencies: n,
  serverState: S
} = {}) {
  const [L, O] = K({}), { sessionId: R } = xt();
  let H = !c;
  const [h] = K(c ?? At()), l = o.getState().stateLog[h], ct = J(/* @__PURE__ */ new Set()), X = J(I ?? At()), M = J(
    null
  );
  M.current = nt(h) ?? null, st(() => {
    if (y && y.stateKey === h && y.path?.[0]) {
      tt(h, (r) => ({
        ...r,
        [y.path[0]]: y.newValue
      }));
      const e = `${y.stateKey}:${y.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: y.timeStamp,
        userId: y.userId
      });
    }
  }, [y]), st(() => {
    if (a) {
      bt(h, {
        initialState: a
      });
      const e = M.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !B(i, a) || !i) && !s)
        return;
      let u = null;
      const E = Z(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      E && R && (u = St(`${R}-${h}-${E}`));
      let T = a, k = !1;
      const N = s ? Date.now() : 0, V = u?.lastUpdated || 0, P = u?.lastSyncedWithServer || 0;
      s && N > V ? (T = e.serverState.data, k = !0) : u && V > P && (T = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(T)), o.getState().initializeShadowState(h, a), _t(
        h,
        a,
        T,
        rt,
        X.current,
        R
      ), k && E && R && Nt(T, h, e, R, Date.now()), mt(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || O({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), ut(() => {
    H && bt(h, {
      serverSync: m,
      formElements: v,
      initialState: a,
      localStorage: f,
      middleware: M.current?.middleware
    });
    const e = `${h}////${X.current}`, r = o.getState().stateComponents.get(h) || {
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
  const rt = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const u = `${h}-${r.join(".")}`;
      ct.current.add(u);
    }
    const g = o.getState();
    tt(h, (u) => {
      const E = Z(e) ? e(u) : e, T = `${h}-${r.join(".")}`;
      if (T) {
        let _ = !1, A = g.signalDomElements.get(T);
        if ((!A || A.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const j = r.slice(0, -1), W = q(E, j);
          if (Array.isArray(W)) {
            _ = !0;
            const $ = `${h}-${j.join(".")}`;
            A = g.signalDomElements.get($);
          }
        }
        if (A) {
          const j = _ ? q(E, r.slice(0, -1)) : q(E, r);
          A.forEach(({ parentId: W, position: $, effect: F }) => {
            const w = document.querySelector(
              `[data-parent-id="${W}"]`
            );
            if (w) {
              const C = Array.from(w.childNodes);
              if (C[$]) {
                const x = F ? new Function("state", `return (${F})(state)`)(j) : j;
                C[$].textContent = String(x);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (i || M.current?.validation?.key) && r && Y(
        (i || M.current?.validation?.key) + "." + r.join(".")
      );
      const k = r.slice(0, r.length - 1);
      s.updateType === "cut" && M.current?.validation?.key && Y(
        M.current?.validation?.key + "." + k.join(".")
      ), s.updateType === "insert" && M.current?.validation?.key && Ht(
        M.current?.validation?.key + "." + k.join(".")
      ).filter(([A, j]) => {
        let W = A?.split(".").length;
        if (A == k.join(".") && W == k.length - 1) {
          let $ = A + "." + k;
          Y(A), Bt($, j);
        }
      });
      const N = g.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", N), N) {
        const _ = Et(u, E), A = new Set(_), j = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          W,
          $
        ] of N.components.entries()) {
          let F = !1;
          const w = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (console.log("component", $), !w.includes("none")) {
            if (w.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (w.includes("component") && (($.paths.has(j) || $.paths.has("")) && (F = !0), !F))
              for (const C of A) {
                let x = C;
                for (; ; ) {
                  if ($.paths.has(x)) {
                    F = !0;
                    break;
                  }
                  const G = x.lastIndexOf(".");
                  if (G !== -1) {
                    const z = x.substring(
                      0,
                      G
                    );
                    if (!isNaN(
                      Number(x.substring(G + 1))
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
            if (!F && w.includes("deps") && $.depsFunction) {
              const C = $.depsFunction(E);
              let x = !1;
              typeof C == "boolean" ? C && (x = !0) : B($.deps, C) || ($.deps = C, x = !0), x && (F = !0);
            }
            F && $.forceUpdate();
          }
        }
      }
      const V = Date.now();
      r = r.map((_, A) => {
        const j = r.slice(0, -1), W = q(E, j);
        return A === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (W.length - 1).toString() : _;
      });
      const { oldValue: P, newValue: D } = Yt(
        s.updateType,
        u,
        E,
        r
      ), U = {
        timeStamp: V,
        stateKey: h,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: P,
        newValue: D
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(h, r, E);
          break;
        case "insert":
          const _ = r.slice(0, -1);
          g.insertShadowArrayElement(h, _, D);
          break;
        case "cut":
          const A = r.slice(0, -1), j = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(h, A, j);
          break;
      }
      if (zt(h, (_) => {
        const j = [..._ ?? [], U].reduce((W, $) => {
          const F = `${$.stateKey}:${JSON.stringify($.path)}`, w = W.get(F);
          return w ? (w.timeStamp = Math.max(w.timeStamp, $.timeStamp), w.newValue = $.newValue, w.oldValue = w.oldValue ?? $.oldValue, w.updateType = $.updateType) : W.set(F, { ...$ }), W;
        }, /* @__PURE__ */ new Map());
        return Array.from(j.values());
      }), Nt(
        E,
        h,
        M.current,
        R
      ), M.current?.middleware && M.current.middleware({
        updateLog: l,
        update: U
      }), M.current?.serverSync) {
        const _ = g.serverState[h], A = M.current?.serverSync;
        qt(h, {
          syncKey: typeof A.syncKey == "string" ? A.syncKey : A.syncKey({ state: E }),
          rollBackState: _,
          actionTimeStamp: Date.now() + (A.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[h] || (gt(
    h,
    ft(
      h,
      rt,
      X.current,
      R
    )
  ), o.getState().cogsStateStore[h] || tt(h, t), o.getState().initialStateGlobal[h] || $t(h, t));
  const d = Tt(() => ft(
    h,
    rt,
    X.current,
    R
  ), [h, R]);
  return [Pt(h), d];
}
function ft(t, c, m, f) {
  const v = /* @__PURE__ */ new Map();
  let b = 0;
  const p = (y) => {
    const n = y.join(".");
    for (const [S] of v)
      (S === n || S.startsWith(n + ".")) && v.delete(S);
    b++;
  }, I = {
    removeValidation: (y) => {
      y?.validationKey && Y(y.validationKey);
    },
    revertToInitialState: (y) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && Y(n?.key), y?.validationKey && Y(y.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), v.clear(), b++;
      const L = a(S, []), O = nt(t), R = Z(O?.localStorage?.key) ? O?.localStorage?.key(S) : O?.localStorage?.key, H = `${f}-${t}-${R}`;
      H && localStorage.removeItem(H), gt(t, L), tt(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (y) => {
      v.clear(), b++;
      const n = ft(
        t,
        c,
        m,
        f
      ), S = o.getState().initialStateGlobal[t], L = nt(t), O = Z(L?.localStorage?.key) ? L?.localStorage?.key(S) : L?.localStorage?.key, R = `${f}-${t}-${O}`;
      return localStorage.getItem(R) && localStorage.removeItem(R), Ot(() => {
        $t(t, y), o.getState().initializeShadowState(t, y), gt(t, n), tt(t, y);
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
      const y = o.getState().serverState[t];
      return !!(y && B(y, Pt(t)));
    }
  };
  function a(y, n = [], S) {
    const L = n.map(String).join(".");
    v.get(L);
    const O = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(I).forEach((h) => {
      O[h] = I[h];
    });
    const R = {
      apply(h, l, ct) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(y) && (S = { ...S, validIndices: void 0 });
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
              } = e, g = J(null), [u, E] = K({
                startIndex: 0,
                endIndex: 10
              }), [T, k] = K(0), N = It(
                () => k((w) => w + 1),
                []
              );
              st(() => {
                const w = o.getState().subscribeToShadowState(t, N), C = setTimeout(N, 50);
                return () => {
                  w(), clearTimeout(C);
                };
              }, [t, N]), J(i);
              const V = J(0), P = J(!0), D = o().getNestedState(
                t,
                n
              ), U = D.length, { totalHeight: _, positions: A } = Tt(() => {
                const w = o.getState().getShadowMetadata(t, n) || [];
                let C = 0;
                const x = [];
                for (let G = 0; G < U; G++) {
                  x[G] = C;
                  const z = w[G]?.virtualizer?.itemHeight;
                  C += z || r;
                }
                return { totalHeight: C, positions: x };
              }, [U, t, n, r, T]), j = Tt(() => {
                const w = Math.max(0, u.startIndex), C = Math.min(U, u.endIndex), x = Array.from(
                  { length: C - w },
                  (z, ht) => w + ht
                ), G = x.map((z) => D[z]);
                return a(G, n, {
                  ...S,
                  validIndices: x
                });
              }, [u.startIndex, u.endIndex, D]);
              ut(() => {
                const w = g.current;
                if (!w) return;
                const C = U > V.current, x = w.scrollHeight - w.scrollTop - w.clientHeight < 5;
                V.current = U;
                const G = () => {
                  const { scrollTop: z, clientHeight: ht, scrollHeight: te } = w;
                  let ot = ((et, Mt) => {
                    let lt = 0, yt = et.length - 1;
                    for (; lt <= yt; ) {
                      const vt = Math.floor((lt + yt) / 2);
                      et[vt] < Mt ? lt = vt + 1 : yt = vt - 1;
                    }
                    return lt;
                  })(A, z), Q = ot;
                  for (; Q < U && A[Q] < z + ht; )
                    Q++;
                  ot = Math.max(0, ot - s), Q = Math.min(U, Q + s), E((et) => et.startIndex !== ot || et.endIndex !== Q ? { startIndex: ot, endIndex: Q } : et);
                };
                return w.addEventListener("scroll", G, {
                  passive: !0
                }), G(), i && (C || P.current) && x && w.scrollTo({
                  top: w.scrollHeight,
                  behavior: "auto"
                }), A.length > 0 && (P.current = !1), () => w.removeEventListener("scroll", G);
              }, [U, s, i, A]);
              const W = It(
                (w = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: w
                  });
                },
                []
              ), $ = It(
                (w, C = "smooth") => {
                  g.current && g.current.scrollTo({
                    top: A[w] || 0,
                    behavior: C
                  });
                },
                [A]
              ), F = {
                outer: {
                  ref: g,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: { height: `${_}px`, position: "relative" }
                },
                list: {
                  style: {
                    transform: `translateY(${A[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: j,
                virtualizerProps: F,
                scrollToBottom: W,
                scrollToIndex: $
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
                const u = r[i], E = [...n, i.toString()], T = a(u, E, S);
                return e(u, T, {
                  register: () => {
                    const [, N] = K({}), V = `${m}-${n.join(".")}-${i}`;
                    ut(() => {
                      const P = `${t}////${V}`, D = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set(P, {
                        forceUpdate: () => N({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(t, D), () => {
                        const U = o.getState().stateComponents.get(t);
                        U && U.components.delete(P);
                      };
                    }, [t, V]);
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
              const u = [...n, g.toString()], E = a(s, u, S);
              return e(
                s,
                E,
                i,
                y,
                a(y, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => it(Xt, {
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
                const u = r[i], E = [...n, i.toString()], T = a(u, E, S), k = `${m}-${n.join(".")}-${i}`;
                return it(Kt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: k,
                  itemPath: E,
                  children: e(
                    u,
                    T,
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
              v.clear(), b++;
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
            return (e) => (p(n), pt(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), g = Z(e) ? e(i) : e;
              let u = null;
              if (!i.some((T) => {
                if (r) {
                  const N = r.every(
                    (V) => B(T[V], g[V])
                  );
                  return N && (u = T), N;
                }
                const k = B(T, g);
                return k && (u = T), k;
              }))
                p(n), pt(c, g, n, t);
              else if (s && u) {
                const T = s(u), k = i.map(
                  (N) => B(N, u) ? T : N
                );
                p(n), at(c, k, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return p(n), dt(c, n, t, e), a(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < y.length; r++)
                y[r] === e && dt(c, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = y.findIndex((s) => s === e);
              r > -1 ? dt(c, n, t, r) : pt(c, e, n, t);
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
            return () => dt(
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
          return (d) => Ct({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Ct({
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
              const e = o.getState().cogsStateStore[t], s = Gt(e, d).newDocument;
              _t(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                m,
                f
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const g = Et(e, s), u = new Set(g);
                for (const [
                  E,
                  T
                ] of i.components.entries()) {
                  let k = !1;
                  const N = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
                  if (!N.includes("none")) {
                    if (N.includes("all")) {
                      T.forceUpdate();
                      continue;
                    }
                    if (N.includes("component") && (T.paths.has("") && (k = !0), !k))
                      for (const V of u) {
                        if (T.paths.has(V)) {
                          k = !0;
                          break;
                        }
                        let P = V.lastIndexOf(".");
                        for (; P !== -1; ) {
                          const D = V.substring(0, P);
                          if (T.paths.has(D)) {
                            k = !0;
                            break;
                          }
                          const U = V.substring(
                            P + 1
                          );
                          if (!isNaN(Number(U))) {
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
                          P = D.lastIndexOf(".");
                        }
                        if (k) break;
                      }
                    if (!k && N.includes("deps") && T.depsFunction) {
                      const V = T.depsFunction(s);
                      let P = !1;
                      typeof V == "boolean" ? V && (P = !0) : B(T.deps, V) || (T.deps = V, P = !0), P && (k = !0);
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
                s && s.length > 0 && s.forEach(([g]) => {
                  g && g.startsWith(d.key) && Y(g);
                });
                const i = d.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((u) => {
                  const E = u.path, T = u.message, k = [d.key, ...E].join(".");
                  e(k, T);
                }), mt(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => kt.getState().getFormRefsByStateKey(t);
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
          return () => kt.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ wt(
            Ft,
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
              Ut(() => {
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
          return (d, e) => /* @__PURE__ */ wt(
            Dt,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const M = [...n, l], rt = o.getState().getNestedState(t, M);
        return a(rt, M, S);
      }
    }, H = new Proxy(O, R);
    return v.set(L, {
      proxy: H,
      stateVersion: b
    }), H;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function Ct(t) {
  return it(Qt, { proxy: t });
}
function Xt({
  proxy: t,
  rebuildStateShape: c
}) {
  const m = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? c(
    m,
    t._path
  ).stateMapNoRender(
    (v, b, p, I, a) => t._mapFn(v, b, p, I, a)
  ) : null;
}
function Qt({
  proxy: t
}) {
  const c = J(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return st(() => {
    const f = c.current;
    if (!f || !f.parentElement) return;
    const v = f.parentElement, p = Array.from(v.childNodes).indexOf(f);
    let I = v.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, v.setAttribute("data-parent-id", I));
    const y = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: p,
      effect: t._effect
    };
    o.getState().addSignalElement(m, y);
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
function he(t) {
  const c = jt(
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
function Kt({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: f
}) {
  const [, v] = K({}), [b, p] = Lt(), I = J(null);
  return st(() => {
    p.height > 0 && p.height !== I.current && (I.current = p.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), ut(() => {
    const a = `${t}////${c}`, y = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return y.components.set(a, {
      forceUpdate: () => v({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), o.getState().stateComponents.set(t, y), () => {
      const n = o.getState().stateComponents.get(t);
      n && n.components.delete(a);
    };
  }, [t, c, m.join(".")]), /* @__PURE__ */ wt("div", { ref: b, children: f });
}
export {
  Ct as $cogsSignal,
  he as $cogsSignalStore,
  fe as addStateOptions,
  Se as createCogsState,
  me as notifyComponent,
  Zt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
