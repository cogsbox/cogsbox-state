"use client";
import { jsx as Tt } from "react/jsx-runtime";
import { useState as Q, useRef as tt, useEffect as st, useLayoutEffect as ft, useMemo as wt, createElement as it, useSyncExternalStore as Rt, startTransition as Ut, useCallback as $t } from "react";
import { transformStateFunc as jt, isDeepEqual as B, isFunction as K, getNestedValue as q, getDifferences as Et, debounce as Dt } from "./utility.js";
import { pushFunc as pt, updateFn as at, cutFunc as gt, ValidationWrapper as Ft, FormControlComponent as Gt } from "./Functions.jsx";
import Wt from "superjson";
import { v4 as At } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Ot } from "./store.js";
import { useCogsConfig as xt } from "./CogsStateClient.jsx";
import { applyPatch as Bt } from "fast-json-patch";
import Ht from "react-use-measure";
function bt(t, i) {
  const m = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, I = m(t) || {};
  g(t, {
    ...I,
    ...i
  });
}
function kt({
  stateKey: t,
  options: i,
  initialOptionsPart: m
}) {
  const g = rt(t) || {}, I = m[t] || {}, $ = o.getState().setInitialStateOptions, p = { ...I, ...g };
  let y = !1;
  if (i)
    for (const a in i)
      p.hasOwnProperty(a) ? (a == "localStorage" && i[a] && p[a].key !== i[a]?.key && (y = !0, p[a] = i[a]), a == "initialState" && i[a] && p[a] !== i[a] && // Different references
      !B(p[a], i[a]) && (y = !0, p[a] = i[a])) : (y = !0, p[a] = i[a]);
  y && $(t, p);
}
function fe(t, { formElements: i, validation: m }) {
  return { initialState: t, formElements: i, validation: m };
}
const Se = (t, i) => {
  let m = t;
  const [g, I] = jt(m);
  (Object.keys(I).length > 0 || i && Object.keys(i).length > 0) && Object.keys(I).forEach((y) => {
    I[y] = I[y] || {}, I[y].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...I[y].formElements || {}
      // State-specific overrides
    }, rt(y) || o.getState().setInitialStateOptions(y, I[y]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const $ = (y, a) => {
    const [v] = Q(a?.componentId ?? At());
    kt({
      stateKey: y,
      options: a,
      initialOptionsPart: I
    });
    const n = o.getState().cogsStateStore[y] || g[y], S = a?.modifyState ? a.modifyState(n) : n, [F, L] = Qt(
      S,
      {
        stateKey: y,
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
    return L;
  };
  function p(y, a) {
    kt({ stateKey: y, options: a, initialOptionsPart: I }), a.localStorage && Zt(y, a), vt(y);
  }
  return { useCogsState: $, setCogsOptions: p };
}, {
  setUpdaterState: St,
  setState: nt,
  getInitialOptions: rt,
  getKeyState: Pt,
  getValidationErrors: zt,
  setStateLog: qt,
  updateInitialStateGlobal: Nt,
  addValidationError: Jt,
  removeValidationError: X,
  setServerSyncActions: Yt
} = o.getState(), _t = (t, i, m, g, I) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    g
  );
  const $ = K(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if ($ && g) {
    const p = `${g}-${i}-${$}`;
    let y;
    try {
      y = ht(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: I ?? y
    }, v = Wt.serialize(a);
    window.localStorage.setItem(
      p,
      JSON.stringify(v.json)
    );
  }
}, ht = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Zt = (t, i) => {
  const m = o.getState().cogsStateStore[t], { sessionId: g } = xt(), I = K(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (I && g) {
    const $ = ht(
      `${g}-${t}-${I}`
    );
    if ($ && $.lastUpdated > ($.lastSyncedWithServer || 0))
      return nt(t, $.state), vt(t), !0;
  }
  return !1;
}, Mt = (t, i, m, g, I, $) => {
  const p = {
    initialState: i,
    updaterState: mt(
      t,
      g,
      I,
      $
    ),
    state: m
  };
  Nt(t, p.initialState), St(t, p.updaterState), nt(t, p.state);
}, vt = (t) => {
  const i = o.getState().stateComponents.get(t);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, me = (t, i) => {
  const m = o.getState().stateComponents.get(t);
  if (m) {
    const g = `${t}////${i}`, I = m.components.get(g);
    if ((I ? Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"] : null)?.includes("none"))
      return;
    I && I.forceUpdate();
  }
}, Xt = (t, i, m, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: q(i, g),
        newValue: q(m, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: q(m, g)
      };
    case "cut":
      return {
        oldValue: q(i, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Qt(t, {
  stateKey: i,
  serverSync: m,
  localStorage: g,
  formElements: I,
  reactiveDeps: $,
  reactiveType: p,
  componentId: y,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [F, L] = Q({}), { sessionId: R } = xt();
  let G = !i;
  const [h] = Q(i ?? At()), l = o.getState().stateLog[h], ct = tt(/* @__PURE__ */ new Set()), et = tt(y ?? At()), x = tt(
    null
  );
  x.current = rt(h) ?? null, st(() => {
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
      bt(h, {
        initialState: a
      });
      const e = x.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = o.getState().initialStateGlobal[h];
      if (!(c && !B(c, a) || !c) && !s)
        return;
      let u = null;
      const T = K(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      T && R && (u = ht(`${R}-${h}-${T}`));
      let w = a, A = !1;
      const O = s ? Date.now() : 0, b = u?.lastUpdated || 0, V = u?.lastSyncedWithServer || 0;
      s && O > b ? (w = e.serverState.data, A = !0) : u && b > V && (w = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), o.getState().initializeShadowState(h, a), Mt(
        h,
        a,
        w,
        ot,
        et.current,
        R
      ), A && T && R && _t(w, h, e, R, Date.now()), vt(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || L({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), ft(() => {
    G && bt(h, {
      serverSync: m,
      formElements: I,
      initialState: a,
      localStorage: g,
      middleware: x.current?.middleware
    });
    const e = `${h}////${et.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => L({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: $ || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), L({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const ot = (e, r, s, c) => {
    if (Array.isArray(r)) {
      const u = `${h}-${r.join(".")}`;
      ct.current.add(u);
    }
    const f = o.getState();
    nt(h, (u) => {
      const T = K(e) ? e(u) : e, w = `${h}-${r.join(".")}`;
      if (w) {
        let k = !1, E = f.signalDomElements.get(w);
        if ((!E || E.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const P = r.slice(0, -1), _ = q(T, P);
          if (Array.isArray(_)) {
            k = !0;
            const C = `${h}-${P.join(".")}`;
            E = f.signalDomElements.get(C);
          }
        }
        if (E) {
          const P = k ? q(T, r.slice(0, -1)) : q(T, r);
          E.forEach(({ parentId: _, position: C, effect: U }) => {
            const M = document.querySelector(
              `[data-parent-id="${_}"]`
            );
            if (M) {
              const W = Array.from(M.childNodes);
              if (W[C]) {
                const N = U ? new Function("state", `return (${U})(state)`)(P) : P;
                W[C].textContent = String(N);
              }
            }
          });
        }
      }
      console.log("shadowState", f.shadowStateStore), s.updateType === "update" && (c || x.current?.validation?.key) && r && X(
        (c || x.current?.validation?.key) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      s.updateType === "cut" && x.current?.validation?.key && X(
        x.current?.validation?.key + "." + A.join(".")
      ), s.updateType === "insert" && x.current?.validation?.key && zt(
        x.current?.validation?.key + "." + A.join(".")
      ).filter(([E, P]) => {
        let _ = E?.split(".").length;
        if (E == A.join(".") && _ == A.length - 1) {
          let C = E + "." + A;
          X(E), Jt(C, P);
        }
      });
      const O = f.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", O), O) {
        const k = Et(u, T), E = new Set(k), P = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          _,
          C
        ] of O.components.entries()) {
          let U = !1;
          const M = Array.isArray(C.reactiveType) ? C.reactiveType : [C.reactiveType || "component"];
          if (console.log("component", C), !M.includes("none")) {
            if (M.includes("all")) {
              C.forceUpdate();
              continue;
            }
            if (M.includes("component") && ((C.paths.has(P) || C.paths.has("")) && (U = !0), !U))
              for (const W of E) {
                let N = W;
                for (; ; ) {
                  if (C.paths.has(N)) {
                    U = !0;
                    break;
                  }
                  const j = N.lastIndexOf(".");
                  if (j !== -1) {
                    const H = N.substring(
                      0,
                      j
                    );
                    if (!isNaN(
                      Number(N.substring(j + 1))
                    ) && C.paths.has(H)) {
                      U = !0;
                      break;
                    }
                    N = H;
                  } else
                    N = "";
                  if (N === "")
                    break;
                }
                if (U) break;
              }
            if (!U && M.includes("deps") && C.depsFunction) {
              const W = C.depsFunction(T);
              let N = !1;
              typeof W == "boolean" ? W && (N = !0) : B(C.deps, W) || (C.deps = W, N = !0), N && (U = !0);
            }
            U && C.forceUpdate();
          }
        }
      }
      const b = Date.now();
      r = r.map((k, E) => {
        const P = r.slice(0, -1), _ = q(T, P);
        return E === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (_.length - 1).toString() : k;
      });
      const { oldValue: V, newValue: D } = Xt(
        s.updateType,
        u,
        T,
        r
      ), J = {
        timeStamp: b,
        stateKey: h,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: V,
        newValue: D
      };
      switch (s.updateType) {
        case "update":
          f.updateShadowAtPath(h, r, T);
          break;
        case "insert":
          const k = r.slice(0, -1);
          f.insertShadowArrayElement(h, k, D);
          break;
        case "cut":
          const E = r.slice(0, -1), P = parseInt(r[r.length - 1]);
          f.removeShadowArrayElement(h, E, P);
          break;
      }
      if (qt(h, (k) => {
        const P = [...k ?? [], J].reduce((_, C) => {
          const U = `${C.stateKey}:${JSON.stringify(C.path)}`, M = _.get(U);
          return M ? (M.timeStamp = Math.max(M.timeStamp, C.timeStamp), M.newValue = C.newValue, M.oldValue = M.oldValue ?? C.oldValue, M.updateType = C.updateType) : _.set(U, { ...C }), _;
        }, /* @__PURE__ */ new Map());
        return Array.from(P.values());
      }), _t(
        T,
        h,
        x.current,
        R
      ), x.current?.middleware && x.current.middleware({
        updateLog: l,
        update: J
      }), x.current?.serverSync) {
        const k = f.serverState[h], E = x.current?.serverSync;
        Yt(h, {
          syncKey: typeof E.syncKey == "string" ? E.syncKey : E.syncKey({ state: T }),
          rollBackState: k,
          actionTimeStamp: Date.now() + (E.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  o.getState().updaterState[h] || (St(
    h,
    mt(
      h,
      ot,
      et.current,
      R
    )
  ), o.getState().cogsStateStore[h] || nt(h, t), o.getState().initialStateGlobal[h] || Nt(h, t));
  const d = wt(() => mt(
    h,
    ot,
    et.current,
    R
  ), [h, R]);
  return [Pt(h), d];
}
function mt(t, i, m, g) {
  const I = /* @__PURE__ */ new Map();
  let $ = 0;
  const p = (v) => {
    const n = v.join(".");
    for (const [S] of I)
      (S === n || S.startsWith(n + ".")) && I.delete(S);
    $++;
  }, y = {
    removeValidation: (v) => {
      v?.validationKey && X(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && X(n?.key), v?.validationKey && X(v.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), I.clear(), $++;
      const F = a(S, []), L = rt(t), R = K(L?.localStorage?.key) ? L?.localStorage?.key(S) : L?.localStorage?.key, G = `${g}-${t}-${R}`;
      G && localStorage.removeItem(G), St(t, F), nt(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      I.clear(), $++;
      const n = mt(
        t,
        i,
        m,
        g
      ), S = o.getState().initialStateGlobal[t], F = rt(t), L = K(F?.localStorage?.key) ? F?.localStorage?.key(S) : F?.localStorage?.key, R = `${g}-${t}-${L}`;
      return localStorage.getItem(R) && localStorage.removeItem(R), Ut(() => {
        Nt(t, v), o.getState().initializeShadowState(t, v), St(t, n), nt(t, v);
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
      return !!(v && B(v, Pt(t)));
    }
  };
  function a(v, n = [], S) {
    const F = n.map(String).join(".");
    I.get(F);
    const L = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(y).forEach((h) => {
      L[h] = y[h];
    });
    const R = {
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
              let c = !0;
              for (const f of r.paths)
                if (s.startsWith(f) && (s === f || s[f.length] === ".")) {
                  c = !1;
                  break;
                }
              c && r.paths.add(s);
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
              const c = await e.action(r);
              if (c && !c.success && c.errors && s) {
                o.getState().removeValidationError(s), c.errors.forEach((u) => {
                  const T = [s, ...u.path].join(".");
                  o.getState().addValidationError(T, u.message);
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
            const d = o.getState().initialStateGlobal[t], e = rt(t), r = K(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, s = `${g}-${t}-${r}`;
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
                overscan: s = 6,
                stickToBottom: c = !1,
                dependencies: f = []
              } = e, u = tt(null), [T, w] = Q({
                startIndex: 0,
                endIndex: 10
              }), [A, O] = Q("IDLE"), b = tt(0), V = tt(f), [D, J] = Q(0);
              st(() => o.getState().subscribeToShadowState(t, () => {
                J((j) => j + 1);
              }), [t]);
              const k = o().getNestedState(
                t,
                n
              ), E = k.length, { totalHeight: P, positions: _ } = wt(() => {
                const N = o.getState().getShadowMetadata(t, n) || [];
                let j = 0;
                const H = [];
                for (let z = 0; z < E; z++) {
                  H[z] = j;
                  const Y = N[z]?.virtualizer?.itemHeight;
                  j += Y || r;
                }
                return { totalHeight: j, positions: H };
              }, [
                E,
                t,
                n.join("."),
                r,
                D
              ]), C = wt(() => {
                const N = Math.max(0, T.startIndex), j = Math.min(E, T.endIndex), H = Array.from(
                  { length: j - N },
                  (Y, Z) => N + Z
                ), z = H.map((Y) => k[Y]);
                return a(z, n, {
                  ...S,
                  validIndices: H
                });
              }, [T.startIndex, T.endIndex, k, E]);
              ft(() => {
                const N = u.current;
                if (!N) return;
                const j = !B(
                  f,
                  V.current
                ), H = E > b.current;
                if (j) {
                  console.log(
                    "EVENT: Chat changed. Resetting state and scrolling."
                  ), O("SCROLLING_TO_BOTTOM");
                  return;
                }
                if (H && A === "IDLE" && N.scrollHeight - N.scrollTop - N.clientHeight < r && c) {
                  console.log(
                    "EVENT: New message arrived while at bottom. -> SCROLLING_TO_BOTTOM"
                  ), O("SCROLLING_TO_BOTTOM");
                  return;
                }
                let z;
                if (A === "SCROLLING_TO_BOTTOM") {
                  const Z = b.current === 0 || j, lt = Z ? "auto" : "smooth";
                  console.log(
                    `ACTION: Scrolling to bottom. Behavior: ${lt}`
                  ), N.scrollTo({
                    top: N.scrollHeight,
                    behavior: lt
                  }), z = setTimeout(
                    () => {
                      console.log("ACTION: Scroll finished. -> IDLE"), O("IDLE");
                    },
                    Z ? 50 : 500
                  );
                }
                const Y = () => {
                  A === "SCROLLING_TO_BOTTOM" && (console.log("USER ACTION: Interrupted scroll. -> IDLE"), O("IDLE"));
                  const { scrollTop: Z, clientHeight: lt } = N;
                  let It = 0, dt = E - 1;
                  for (; It <= dt; ) {
                    const yt = Math.floor((It + dt) / 2);
                    _[yt] < Z ? It = yt + 1 : dt = yt - 1;
                  }
                  const Ct = Math.max(0, dt - s);
                  let ut = Ct;
                  const Lt = Z + lt;
                  for (; ut < E && _[ut] < Lt; )
                    ut++;
                  w({
                    startIndex: Ct,
                    endIndex: Math.min(E, ut + s)
                  });
                };
                return N.addEventListener("scroll", Y, {
                  passive: !0
                }), A === "IDLE" && Y(), b.current = E, V.current = f, () => {
                  N.removeEventListener("scroll", Y), z && clearTimeout(z);
                };
              }, [E, _, A, ...f]);
              const U = $t(() => {
                console.log(
                  "USER ACTION: Clicked scroll button -> SCROLLING_TO_BOTTOM"
                ), O("SCROLLING_TO_BOTTOM");
              }, []), M = $t(
                (N, j = "smooth") => {
                  u.current && _[N] !== void 0 && (O("IDLE"), u.current.scrollTo({
                    top: _[N],
                    behavior: j
                  }));
                },
                [_]
              ), W = {
                outer: {
                  ref: u,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${P}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${_[T.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: C,
                virtualizerProps: W,
                scrollToBottom: U,
                scrollToIndex: M
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, T) => e(u.item, T.item)
              ), c = s.map(({ item: u }) => u), f = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(c, n, f);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = d().filter(
                ({ item: u }, T) => e(u, T)
              ), c = s.map(({ item: u }) => u), f = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: u }) => u
                )
              };
              return a(c, n, f);
            };
          if (l === "stateMap")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (c, f) => f)).map((c, f) => {
                const u = r[c], T = [...n, c.toString()], w = a(u, T, S);
                return e(u, w, {
                  register: () => {
                    const [, O] = Q({}), b = `${m}-${n.join(".")}-${c}`;
                    ft(() => {
                      const V = `${t}////${b}`, D = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set(V, {
                        forceUpdate: () => O({}),
                        paths: /* @__PURE__ */ new Set([T.join(".")])
                      }), o.getState().stateComponents.set(t, D), () => {
                        const J = o.getState().stateComponents.get(t);
                        J && J.components.delete(V);
                      };
                    }, [t, b]);
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
            return (e) => v.map((s, c) => {
              let f;
              S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
              const u = [...n, f.toString()], T = a(s, u, S);
              return e(
                s,
                T,
                c,
                v,
                a(v, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => it(Kt, {
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
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (c, f) => f)).map((c, f) => {
                const u = r[c], T = [...n, c.toString()], w = a(u, T, S), A = `${m}-${n.join(".")}-${c}`;
                return it(ee, {
                  key: c,
                  stateKey: t,
                  itemComponentId: A,
                  itemPath: T,
                  children: e(
                    u,
                    w,
                    f,
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
              I.clear(), $++;
              const s = r.flatMap(
                (c) => c[e] ?? []
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
              const r = e.length - 1, s = e[r], c = [...n, r.toString()];
              return a(s, c);
            };
          if (l === "insert")
            return (e) => (p(n), pt(i, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const c = o.getState().getNestedState(t, n), f = K(e) ? e(c) : e;
              let u = null;
              if (!c.some((w) => {
                if (r) {
                  const O = r.every(
                    (b) => B(w[b], f[b])
                  );
                  return O && (u = w), O;
                }
                const A = B(w, f);
                return A && (u = w), A;
              }))
                p(n), pt(i, f, n, t);
              else if (s && u) {
                const w = s(u), A = c.map(
                  (O) => B(O, u) ? w : O
                );
                p(n), at(i, A, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return p(n), gt(i, n, t, e), a(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < v.length; r++)
                v[r] === e && gt(i, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = v.findIndex((s) => s === e);
              r > -1 ? gt(i, n, t, r) : pt(i, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = d().find(
                ({ item: f }, u) => e(f, u)
              );
              if (!s) return;
              const c = [...n, s.originalIndex.toString()];
              return a(s.item, c, S);
            };
          if (l === "findWith")
            return (e, r) => {
              const c = d().find(
                ({ item: u }) => u[e] === r
              );
              if (!c) return;
              const f = [...n, c.originalIndex.toString()];
              return a(c.item, f, S);
            };
        }
        const et = n[n.length - 1];
        if (!isNaN(Number(et))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => gt(
              i,
              d,
              t,
              Number(et)
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
          return (d) => ht(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), r = o.getState().getNestedState(t, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), s = e.join(".");
            d ? o.getState().setSelectedIndex(t, s, r) : o.getState().setSelectedIndex(t, s, void 0);
            const c = o.getState().getNestedState(t, [...e]);
            at(i, c, e), p(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), e = Number(n[n.length - 1]), r = d.join("."), s = o.getState().getSelectedIndex(t, r);
            o.getState().setSelectedIndex(
              t,
              r,
              s === e ? void 0 : e
            );
            const c = o.getState().getNestedState(t, [...d]);
            at(i, c, d), p(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = o.getState().cogsStateStore[t], s = Bt(e, d).newDocument;
              Mt(
                t,
                o.getState().initialStateGlobal[t],
                s,
                i,
                m,
                g
              );
              const c = o.getState().stateComponents.get(t);
              if (c) {
                const f = Et(e, s), u = new Set(f);
                for (const [
                  T,
                  w
                ] of c.components.entries()) {
                  let A = !1;
                  const O = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!O.includes("none")) {
                    if (O.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (O.includes("component") && (w.paths.has("") && (A = !0), !A))
                      for (const b of u) {
                        if (w.paths.has(b)) {
                          A = !0;
                          break;
                        }
                        let V = b.lastIndexOf(".");
                        for (; V !== -1; ) {
                          const D = b.substring(0, V);
                          if (w.paths.has(D)) {
                            A = !0;
                            break;
                          }
                          const J = b.substring(
                            V + 1
                          );
                          if (!isNaN(Number(J))) {
                            const k = D.lastIndexOf(".");
                            if (k !== -1) {
                              const E = D.substring(
                                0,
                                k
                              );
                              if (w.paths.has(E)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          V = D.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && O.includes("deps") && w.depsFunction) {
                      const b = w.depsFunction(s);
                      let V = !1;
                      typeof b == "boolean" ? b && (V = !0) : B(w.deps, b) || (w.deps = b, V = !0), V && (A = !0);
                    }
                    A && w.forceUpdate();
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
                s && s.length > 0 && s.forEach(([f]) => {
                  f && f.startsWith(d.key) && X(f);
                });
                const c = d.zodSchema.safeParse(r);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const T = u.path, w = u.message, A = [d.key, ...T].join(".");
                  e(A, w);
                }), vt(t), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => o().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => Ot.getState().getFormRefsByStateKey(t);
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
          return () => Ot.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ Tt(
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
        if (l === "_isServerSynced") return y._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Dt(() => {
                at(i, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              at(i, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            p(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ Tt(
            Gt,
            {
              setState: i,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const x = [...n, l], ot = o.getState().getNestedState(t, x);
        return a(ot, x, S);
      }
    }, G = new Proxy(L, R);
    return I.set(F, {
      proxy: G,
      stateVersion: $
    }), G;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function Vt(t) {
  return it(te, { proxy: t });
}
function Kt({
  proxy: t,
  rebuildStateShape: i
}) {
  const m = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? i(
    m,
    t._path
  ).stateMapNoRender(
    (I, $, p, y, a) => t._mapFn(I, $, p, y, a)
  ) : null;
}
function te({
  proxy: t
}) {
  const i = tt(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return st(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const I = g.parentElement, p = Array.from(I.childNodes).indexOf(g);
    let y = I.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, I.setAttribute("data-parent-id", y));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
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
      } catch (L) {
        console.error("Error evaluating effect function during mount:", L), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const F = document.createTextNode(String(S));
    g.replaceWith(F);
  }, [t._stateKey, t._path.join("."), t._effect]), it("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function he(t) {
  const i = Rt(
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
  return it("text", {}, String(i));
}
function ee({
  stateKey: t,
  itemComponentId: i,
  itemPath: m,
  children: g
}) {
  const [, I] = Q({}), [$, p] = Ht(), y = tt(null);
  return st(() => {
    p.height > 0 && p.height !== y.current && (y.current = p.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), ft(() => {
    const a = `${t}////${i}`, v = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return v.components.set(a, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), o.getState().stateComponents.set(t, v), () => {
      const n = o.getState().stateComponents.get(t);
      n && n.components.delete(a);
    };
  }, [t, i, m.join(".")]), /* @__PURE__ */ Tt("div", { ref: $, children: g });
}
export {
  Vt as $cogsSignal,
  he as $cogsSignalStore,
  fe as addStateOptions,
  Se as createCogsState,
  me as notifyComponent,
  Qt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
