"use client";
import { jsx as st } from "react/jsx-runtime";
import { useState as tt, useRef as Z, useEffect as yt, useLayoutEffect as ct, useMemo as vt, createElement as ut, useSyncExternalStore as xt, startTransition as _t, useCallback as mt } from "react";
import { transformStateFunc as Mt, isDeepEqual as B, isFunction as Y, getNestedValue as q, getDifferences as It, debounce as Rt } from "./utility.js";
import { pushFunc as ht, updateFn as rt, cutFunc as it, ValidationWrapper as Ot, FormControlComponent as jt } from "./Functions.jsx";
import Ft from "superjson";
import { v4 as pt } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as Tt } from "./store.js";
import { useCogsConfig as Nt } from "./CogsStateClient.jsx";
import { applyPatch as Ut } from "fast-json-patch";
import Dt from "react-use-measure";
function At(t, s) {
  const y = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, S = y(t) || {};
  g(t, {
    ...S,
    ...s
  });
}
function Vt({
  stateKey: t,
  options: s,
  initialOptionsPart: y
}) {
  const g = K(t) || {}, S = y[t] || {}, A = r.getState().setInitialStateOptions, E = { ...S, ...g };
  let I = !1;
  if (s)
    for (const i in s)
      E.hasOwnProperty(i) ? (i == "localStorage" && s[i] && E[i].key !== s[i]?.key && (I = !0, E[i] = s[i]), i == "initialState" && s[i] && E[i] !== s[i] && // Different references
      !B(E[i], s[i]) && (I = !0, E[i] = s[i])) : (I = !0, E[i] = s[i]);
  I && A(t, E);
}
function ce(t, { formElements: s, validation: y }) {
  return { initialState: t, formElements: s, validation: y };
}
const le = (t, s) => {
  let y = t;
  const [g, S] = Mt(y);
  (Object.keys(S).length > 0 || s && Object.keys(s).length > 0) && Object.keys(S).forEach((I) => {
    S[I] = S[I] || {}, S[I].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...S[I].formElements || {}
      // State-specific overrides
    }, K(I) || r.getState().setInitialStateOptions(I, S[I]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const A = (I, i) => {
    const [h] = tt(i?.componentId ?? pt());
    Vt({
      stateKey: I,
      options: i,
      initialOptionsPart: S
    });
    const n = r.getState().cogsStateStore[I] || g[I], f = i?.modifyState ? i.modifyState(n) : n, [W, O] = zt(
      f,
      {
        stateKey: I,
        syncUpdate: i?.syncUpdate,
        componentId: h,
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
  function E(I, i) {
    Vt({ stateKey: I, options: i, initialOptionsPart: S }), i.localStorage && Bt(I, i), ft(I);
  }
  return { useCogsState: A, setCogsOptions: E };
}, {
  setUpdaterState: lt,
  setState: X,
  getInitialOptions: K,
  getKeyState: bt,
  getValidationErrors: Wt,
  setStateLog: Gt,
  updateInitialStateGlobal: wt,
  addValidationError: Lt,
  removeValidationError: J,
  setServerSyncActions: Ht
} = r.getState(), $t = (t, s, y, g, S) => {
  y?.log && console.log(
    "saving to localstorage",
    s,
    y.localStorage?.key,
    g
  );
  const A = Y(y?.localStorage?.key) ? y.localStorage?.key(t) : y?.localStorage?.key;
  if (A && g) {
    const E = `${g}-${s}-${A}`;
    let I;
    try {
      I = gt(E)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: S ?? I
    }, h = Ft.serialize(i);
    window.localStorage.setItem(
      E,
      JSON.stringify(h.json)
    );
  }
}, gt = (t) => {
  if (!t) return null;
  try {
    const s = window.localStorage.getItem(t);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, Bt = (t, s) => {
  const y = r.getState().cogsStateStore[t], { sessionId: g } = Nt(), S = Y(s?.localStorage?.key) ? s.localStorage.key(y) : s?.localStorage?.key;
  if (S && g) {
    const A = gt(
      `${g}-${t}-${S}`
    );
    if (A && A.lastUpdated > (A.lastSyncedWithServer || 0))
      return X(t, A.state), ft(t), !0;
  }
  return !1;
}, Ct = (t, s, y, g, S, A) => {
  const E = {
    initialState: s,
    updaterState: dt(
      t,
      g,
      S,
      A
    ),
    state: y
  };
  wt(t, E.initialState), lt(t, E.updaterState), X(t, E.state);
}, ft = (t) => {
  const s = r.getState().stateComponents.get(t);
  if (!s) return;
  const y = /* @__PURE__ */ new Set();
  s.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || y.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    y.forEach((g) => g());
  });
}, de = (t, s) => {
  const y = r.getState().stateComponents.get(t);
  if (y) {
    const g = `${t}////${s}`, S = y.components.get(g);
    if ((S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : null)?.includes("none"))
      return;
    S && S.forceUpdate();
  }
}, qt = (t, s, y, g) => {
  switch (t) {
    case "update":
      return {
        oldValue: q(s, g),
        newValue: q(y, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: q(y, g)
      };
    case "cut":
      return {
        oldValue: q(s, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function zt(t, {
  stateKey: s,
  serverSync: y,
  localStorage: g,
  formElements: S,
  reactiveDeps: A,
  reactiveType: E,
  componentId: I,
  initialState: i,
  syncUpdate: h,
  dependencies: n,
  serverState: f
} = {}) {
  const [W, O] = tt({}), { sessionId: j } = Nt();
  let G = !s;
  const [v] = tt(s ?? pt()), l = r.getState().stateLog[v], ot = Z(/* @__PURE__ */ new Set()), z = Z(I ?? pt()), M = Z(
    null
  );
  M.current = K(v) ?? null, yt(() => {
    if (h && h.stateKey === v && h.path?.[0]) {
      X(v, (o) => ({
        ...o,
        [h.path[0]]: h.newValue
      }));
      const e = `${h.stateKey}:${h.path.join(".")}`;
      r.getState().setSyncInfo(e, {
        timeStamp: h.timeStamp,
        userId: h.userId
      });
    }
  }, [h]), yt(() => {
    if (i) {
      At(v, {
        initialState: i
      });
      const e = M.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, c = r.getState().initialStateGlobal[v];
      if (!(c && !B(c, i) || !c) && !a)
        return;
      let u = null;
      const N = Y(e?.localStorage?.key) ? e?.localStorage?.key(i) : e?.localStorage?.key;
      N && j && (u = gt(`${j}-${v}-${N}`));
      let p = i, V = !1;
      const P = a ? Date.now() : 0, b = u?.lastUpdated || 0, $ = u?.lastSyncedWithServer || 0;
      a && P > b ? (p = e.serverState.data, V = !0) : u && b > $ && (p = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), Ct(
        v,
        i,
        p,
        et,
        z.current,
        j
      ), V && N && j && $t(p, v, e, j, Date.now()), ft(v), (Array.isArray(E) ? E : [E || "component"]).includes("none") || O({});
    }
  }, [
    i,
    f?.status,
    f?.data,
    ...n || []
  ]), ct(() => {
    G && At(v, {
      serverSync: y,
      formElements: S,
      initialState: i,
      localStorage: g,
      middleware: M.current?.middleware
    });
    const e = `${v}////${z.current}`, o = r.getState().stateComponents.get(v) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(e, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: A || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), r.getState().stateComponents.set(v, o), O({}), () => {
      const a = `${v}////${z.current}`;
      o && (o.components.delete(a), o.components.size === 0 && r.getState().stateComponents.delete(v));
    };
  }, []);
  const et = (e, o, a, c) => {
    if (Array.isArray(o)) {
      const m = `${v}-${o.join(".")}`;
      ot.current.add(m);
    }
    X(v, (m) => {
      const u = Y(e) ? e(m) : e, N = `${v}-${o.join(".")}`;
      if (N) {
        let C = !1, k = r.getState().signalDomElements.get(N);
        if ((!k || k.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const x = o.slice(0, -1), U = q(u, x);
          if (Array.isArray(U)) {
            C = !0;
            const T = `${v}-${x.join(".")}`;
            k = r.getState().signalDomElements.get(T);
          }
        }
        if (k) {
          const x = C ? q(u, o.slice(0, -1)) : q(u, o);
          k.forEach(({ parentId: U, position: T, effect: F }) => {
            const R = document.querySelector(
              `[data-parent-id="${U}"]`
            );
            if (R) {
              const H = Array.from(R.childNodes);
              if (H[T]) {
                const w = F ? new Function("state", `return (${F})(state)`)(x) : x;
                H[T].textContent = String(w);
              }
            }
          });
        }
      }
      a.updateType === "update" && (c || M.current?.validation?.key) && o && J(
        (c || M.current?.validation?.key) + "." + o.join(".")
      );
      const p = o.slice(0, o.length - 1);
      a.updateType === "cut" && M.current?.validation?.key && J(
        M.current?.validation?.key + "." + p.join(".")
      ), a.updateType === "insert" && M.current?.validation?.key && Wt(
        M.current?.validation?.key + "." + p.join(".")
      ).filter(([k, x]) => {
        let U = k?.split(".").length;
        if (k == p.join(".") && U == p.length - 1) {
          let T = k + "." + p;
          J(k), Lt(T, x);
        }
      });
      const V = r.getState().stateComponents.get(v);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", V), V) {
        const C = It(m, u), k = new Set(C), x = a.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          U,
          T
        ] of V.components.entries()) {
          let F = !1;
          const R = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
          if (console.log("component", T), !R.includes("none")) {
            if (R.includes("all")) {
              T.forceUpdate();
              continue;
            }
            if (R.includes("component") && ((T.paths.has(x) || T.paths.has("")) && (F = !0), !F))
              for (const H of k) {
                let w = H;
                for (; ; ) {
                  if (T.paths.has(w)) {
                    F = !0;
                    break;
                  }
                  const _ = w.lastIndexOf(".");
                  if (_ !== -1) {
                    const D = w.substring(
                      0,
                      _
                    );
                    if (!isNaN(
                      Number(w.substring(_ + 1))
                    ) && T.paths.has(D)) {
                      F = !0;
                      break;
                    }
                    w = D;
                  } else
                    w = "";
                  if (w === "")
                    break;
                }
                if (F) break;
              }
            if (!F && R.includes("deps") && T.depsFunction) {
              const H = T.depsFunction(u);
              let w = !1;
              typeof H == "boolean" ? H && (w = !0) : B(T.deps, H) || (T.deps = H, w = !0), w && (F = !0);
            }
            F && T.forceUpdate();
          }
        }
      }
      const P = Date.now();
      o = o.map((C, k) => {
        const x = o.slice(0, -1), U = q(u, x);
        return k === o.length - 1 && ["insert", "cut"].includes(a.updateType) ? (U.length - 1).toString() : C;
      });
      const { oldValue: b, newValue: $ } = qt(
        a.updateType,
        m,
        u,
        o
      ), L = {
        timeStamp: P,
        stateKey: v,
        path: o,
        updateType: a.updateType,
        status: "new",
        oldValue: b,
        newValue: $
      };
      if (Gt(v, (C) => {
        const x = [...C ?? [], L].reduce((U, T) => {
          const F = `${T.stateKey}:${JSON.stringify(T.path)}`, R = U.get(F);
          return R ? (R.timeStamp = Math.max(R.timeStamp, T.timeStamp), R.newValue = T.newValue, R.oldValue = R.oldValue ?? T.oldValue, R.updateType = T.updateType) : U.set(F, { ...T }), U;
        }, /* @__PURE__ */ new Map());
        return Array.from(x.values());
      }), $t(
        u,
        v,
        M.current,
        j
      ), M.current?.middleware && M.current.middleware({
        updateLog: l,
        update: L
      }), M.current?.serverSync) {
        const C = r.getState().serverState[v], k = M.current?.serverSync;
        Ht(v, {
          syncKey: typeof k.syncKey == "string" ? k.syncKey : k.syncKey({ state: u }),
          rollBackState: C,
          actionTimeStamp: Date.now() + (k.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return u;
    });
  };
  r.getState().updaterState[v] || (lt(
    v,
    dt(
      v,
      et,
      z.current,
      j
    )
  ), r.getState().cogsStateStore[v] || X(v, t), r.getState().initialStateGlobal[v] || wt(v, t));
  const d = vt(() => dt(
    v,
    et,
    z.current,
    j
  ), [v, j]);
  return [bt(v), d];
}
function dt(t, s, y, g) {
  const S = /* @__PURE__ */ new Map();
  let A = 0;
  const E = (h) => {
    const n = h.join(".");
    for (const [f] of S)
      (f === n || f.startsWith(n + ".")) && S.delete(f);
    A++;
  }, I = {
    removeValidation: (h) => {
      h?.validationKey && J(h.validationKey);
    },
    revertToInitialState: (h) => {
      const n = r.getState().getInitialOptions(t)?.validation;
      n?.key && J(n?.key), h?.validationKey && J(h.validationKey);
      const f = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), S.clear(), A++;
      const W = i(f, []), O = K(t), j = Y(O?.localStorage?.key) ? O?.localStorage?.key(f) : O?.localStorage?.key, G = `${g}-${t}-${j}`;
      G && localStorage.removeItem(G), lt(t, W), X(t, f);
      const v = r.getState().stateComponents.get(t);
      return v && v.components.forEach((l) => {
        l.forceUpdate();
      }), f;
    },
    updateInitialState: (h) => {
      S.clear(), A++;
      const n = dt(
        t,
        s,
        y,
        g
      ), f = r.getState().initialStateGlobal[t], W = K(t), O = Y(W?.localStorage?.key) ? W?.localStorage?.key(f) : W?.localStorage?.key, j = `${g}-${t}-${O}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), _t(() => {
        wt(t, h), lt(t, n), X(t, h);
        const G = r.getState().stateComponents.get(t);
        G && G.components.forEach((v) => {
          v.forceUpdate();
        });
      }), {
        fetchId: (G) => n.get()[G]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const h = r.getState().serverState[t];
      return !!(h && B(h, bt(t)));
    }
  };
  function i(h, n = [], f) {
    const W = n.map(String).join(".");
    S.get(W);
    const O = function() {
      return r().getNestedState(t, n);
    };
    Object.keys(I).forEach((v) => {
      O[v] = I[v];
    });
    const j = {
      apply(v, l, ot) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, n);
      },
      get(v, l) {
        f?.validIndices && !Array.isArray(h) && (f = { ...f, validIndices: void 0 });
        const ot = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !ot.has(l)) {
          const d = `${t}////${y}`, e = r.getState().stateComponents.get(t);
          if (e) {
            const o = e.components.get(d);
            if (o && !o.paths.has("")) {
              const a = n.join(".");
              let c = !0;
              for (const m of o.paths)
                if (a.startsWith(m) && (a === m || a[m.length] === ".")) {
                  c = !1;
                  break;
                }
              c && o.paths.add(a);
            }
          }
        }
        if (l === "getDifferences")
          return () => It(
            r.getState().cogsStateStore[t],
            r.getState().initialStateGlobal[t]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const d = r.getState().getInitialOptions(t), e = d?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const o = r.getState().getNestedState(t, []), a = d?.validation?.key;
            try {
              const c = await e.action(o);
              if (c && !c.success && c.errors && a) {
                r.getState().removeValidationError(a), c.errors.forEach((u) => {
                  const N = [a, ...u.path].join(".");
                  r.getState().addValidationError(N, u.message);
                });
                const m = r.getState().stateComponents.get(t);
                m && m.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return c?.success && e.onSuccess ? e.onSuccess(c.data) : !c?.success && e.onError && e.onError(c.error), c;
            } catch (c) {
              return e.onError && e.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = r.getState().getNestedState(t, n), e = r.getState().initialStateGlobal[t], o = q(e, n);
          return B(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = r().getNestedState(
              t,
              n
            ), e = r.getState().initialStateGlobal[t], o = q(e, n);
            return B(d, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = r.getState().initialStateGlobal[t], e = K(t), o = Y(e?.localStorage?.key) ? e?.localStorage?.key(d) : e?.localStorage?.key, a = `${g}-${t}-${o}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = r.getState().getInitialOptions(t)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(h)) {
          const d = () => f?.validIndices ? h.map((o, a) => ({
            item: o,
            originalIndex: f.validIndices[a]
          })) : r.getState().getNestedState(t, n).map((o, a) => ({
            item: o,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const e = r.getState().getSelectedIndex(t, n.join("."));
              if (e !== void 0)
                return i(
                  h[e],
                  [...n, e.toString()],
                  f
                );
            };
          if (l === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: t, path: n });
            };
          if (l === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(t, n.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (e) => {
              const {
                itemHeight: o = 50,
                // A sensible default
                overscan: a = 5,
                stickToBottom: c = !1
              } = e, m = Z(null), [u, N] = tt({
                startIndex: 0,
                endIndex: 10
              }), [p, V] = tt(
                () => /* @__PURE__ */ new Map()
              ), P = mt(
                (w, _) => {
                  V((D) => {
                    if (D.get(w) === _) return D;
                    const Q = new Map(D);
                    return Q.set(w, _), Q;
                  });
                },
                []
              ), b = r().getNestedState(
                t,
                n
              ), $ = b.length, { totalHeight: L, itemPositions: C } = vt(() => {
                let w = 0;
                const _ = Array($);
                for (let D = 0; D < $; D++)
                  _[D] = w, w += p.get(D) ?? o;
                return { totalHeight: w, itemPositions: _ };
              }, [$, p, o]), k = Z(c), x = Z($), U = Z(!0);
              ct(() => {
                const w = m.current;
                if (!w) return;
                const _ = k.current, D = $ > x.current;
                x.current = $;
                const Q = () => {
                  const { scrollTop: St, clientHeight: Et, scrollHeight: Pt } = w;
                  k.current = Pt - St - Et < 10;
                  let nt = 0;
                  for (; nt < $ - 1 && C[nt + 1] <= St; )
                    nt++;
                  let at = nt;
                  for (; at < $ - 1 && C[at] < St + Et; )
                    at++;
                  N({
                    startIndex: Math.max(0, nt - a),
                    endIndex: Math.min($ - 1, at + a)
                  });
                };
                return Q(), c && (U.current ? w.scrollTo({
                  top: w.scrollHeight,
                  behavior: "auto"
                }) : _ && D && requestAnimationFrame(() => {
                  w.scrollTo({
                    top: w.scrollHeight,
                    behavior: "smooth"
                  });
                })), U.current = !1, w.addEventListener("scroll", Q, {
                  passive: !0
                }), () => w.removeEventListener("scroll", Q);
              }, [$, a, c, C]);
              const T = mt(
                (w = "smooth") => {
                  m.current && m.current.scrollTo({
                    top: m.current.scrollHeight,
                    behavior: w
                  });
                },
                []
              ), F = mt(
                (w, _ = "smooth") => {
                  m.current && C[w] !== void 0 && m.current.scrollTo({
                    top: C[w],
                    behavior: _
                  });
                },
                [C]
              ), R = {
                outer: {
                  ref: m,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${L}px`,
                    // Use the dynamic total height
                    position: "relative"
                  }
                },
                // This is now just a slice of the full array to map over.
                list: {
                  // We no longer need to apply a transform here because CogsItemWrapper
                  // will eventually be positioned absolutely by its index.
                  // For now, let's keep it simple. The user's code will map over virtualState.
                  style: {}
                }
              };
              return {
                virtualState: vt(() => {
                  const w = [];
                  for (let _ = u.startIndex; _ <= u.endIndex; _++)
                    _ < $ && w.push(_);
                  return i(b, n, {
                    ...f,
                    isVirtual: !0,
                    setVirtualItemHeight: P,
                    validIndices: w
                  });
                }, [u, b, P]),
                virtualizerProps: R,
                scrollToBottom: T,
                scrollToIndex: F
              };
            };
          if (l === "stateSort")
            return (e) => {
              const a = [...d()].sort(
                (u, N) => e(u.item, N.item)
              ), c = a.map(({ item: u }) => u), m = {
                ...f,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return i(c, n, m);
            };
          if (l === "stateFilter")
            return (e) => {
              const a = d().filter(
                ({ item: u }, N) => e(u, N)
              ), c = a.map(({ item: u }) => u), m = {
                ...f,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return i(c, n, m);
            };
          if (l === "stateMap")
            return (e) => {
              const o = r.getState().getNestedState(t, n);
              return Array.isArray(o) ? (f?.validIndices || Array.from({ length: o.length }, (c, m) => m)).map((c, m) => {
                const u = o[c], N = [...n, c.toString()], p = N.join("."), V = `${y}-${p}`, P = i(u, N, f), b = e(u, P, {
                  // This function is now a no-op because CogsItemWrapper handles registration.
                  register: () => {
                    console.warn(
                      "The `register` function in stateMap is deprecated. Item reactivity is now automatic."
                    );
                  },
                  index: m,
                  originalIndex: c
                }), $ = f?.isVirtual && f.setVirtualItemHeight ? (L) => f.setVirtualItemHeight(c, L) : void 0;
                return /* @__PURE__ */ st(
                  Yt,
                  {
                    stateKey: t,
                    itemComponentId: V,
                    itemPath: N,
                    onMeasure: $,
                    children: b
                  },
                  p
                );
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                o
              ), null);
            };
          if (l === "stateMapNoRender")
            return (e) => h.map((a, c) => {
              let m;
              f?.validIndices && f.validIndices[c] !== void 0 ? m = f.validIndices[c] : m = c;
              const u = [...n, m.toString()], N = i(a, u, f);
              return e(
                a,
                N,
                c,
                h,
                i(h, n, f)
              );
            });
          if (l === "$stateMap")
            return (e) => ut(Jt, {
              proxy: {
                _stateKey: t,
                _path: n,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: i
            });
          if (l === "stateFlattenOn")
            return (e) => {
              const o = h;
              S.clear(), A++;
              const a = o.flatMap(
                (c) => c[e] ?? []
              );
              return i(
                a,
                [...n, "[*]", e],
                f
              );
            };
          if (l === "index")
            return (e) => {
              const o = h[e];
              return i(o, [...n, e.toString()]);
            };
          if (l === "last")
            return () => {
              const e = r.getState().getNestedState(t, n);
              if (e.length === 0) return;
              const o = e.length - 1, a = e[o], c = [...n, o.toString()];
              return i(a, c);
            };
          if (l === "insert")
            return (e) => (E(n), ht(s, e, n, t), i(
              r.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, o, a) => {
              const c = r.getState().getNestedState(t, n), m = Y(e) ? e(c) : e;
              let u = null;
              if (!c.some((p) => {
                if (o) {
                  const P = o.every(
                    (b) => B(p[b], m[b])
                  );
                  return P && (u = p), P;
                }
                const V = B(p, m);
                return V && (u = p), V;
              }))
                E(n), ht(s, m, n, t);
              else if (a && u) {
                const p = a(u), V = c.map(
                  (P) => B(P, u) ? p : P
                );
                E(n), rt(s, V, n);
              }
            };
          if (l === "cut")
            return (e, o) => {
              if (!o?.waitForSync)
                return E(n), it(s, n, t, e), i(
                  r.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let o = 0; o < h.length; o++)
                h[o] === e && it(s, n, t, o);
            };
          if (l === "toggleByValue")
            return (e) => {
              const o = h.findIndex((a) => a === e);
              o > -1 ? it(s, n, t, o) : ht(s, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const a = d().find(
                ({ item: m }, u) => e(m, u)
              );
              if (!a) return;
              const c = [...n, a.originalIndex.toString()];
              return i(a.item, c, f);
            };
          if (l === "findWith")
            return (e, o) => {
              const c = d().find(
                ({ item: u }) => u[e] === o
              );
              if (!c) return;
              const m = [...n, c.originalIndex.toString()];
              return i(c.item, m, f);
            };
        }
        const z = n[n.length - 1];
        if (!isNaN(Number(z))) {
          const d = n.slice(0, -1), e = r.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => it(
              s,
              d,
              t,
              Number(z)
            );
        }
        if (l === "get")
          return () => {
            if (f?.validIndices && Array.isArray(h)) {
              const d = r.getState().getNestedState(t, n);
              return f.validIndices.map((e) => d[e]);
            }
            return r.getState().getNestedState(t, n);
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
          return r.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => gt(g + "-" + t + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), e = d.join("."), o = r.getState().getNestedState(t, d);
          return Array.isArray(o) ? Number(n[n.length - 1]) === r.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const e = n.slice(0, -1), o = Number(n[n.length - 1]), a = e.join(".");
            d ? r.getState().setSelectedIndex(t, a, o) : r.getState().setSelectedIndex(t, a, void 0);
            const c = r.getState().getNestedState(t, [...e]);
            rt(s, c, e), E(e);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), e = Number(n[n.length - 1]), o = d.join("."), a = r.getState().getSelectedIndex(t, o);
            r.getState().setSelectedIndex(
              t,
              o,
              a === e ? void 0 : e
            );
            const c = r.getState().getNestedState(t, [...d]);
            rt(s, c, d), E(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const e = r.getState().cogsStateStore[t], a = Ut(e, d).newDocument;
              Ct(
                t,
                r.getState().initialStateGlobal[t],
                a,
                s,
                y,
                g
              );
              const c = r.getState().stateComponents.get(t);
              if (c) {
                const m = It(e, a), u = new Set(m);
                for (const [
                  N,
                  p
                ] of c.components.entries()) {
                  let V = !1;
                  const P = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!P.includes("none")) {
                    if (P.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (P.includes("component") && (p.paths.has("") && (V = !0), !V))
                      for (const b of u) {
                        if (p.paths.has(b)) {
                          V = !0;
                          break;
                        }
                        let $ = b.lastIndexOf(".");
                        for (; $ !== -1; ) {
                          const L = b.substring(0, $);
                          if (p.paths.has(L)) {
                            V = !0;
                            break;
                          }
                          const C = b.substring(
                            $ + 1
                          );
                          if (!isNaN(Number(C))) {
                            const k = L.lastIndexOf(".");
                            if (k !== -1) {
                              const x = L.substring(
                                0,
                                k
                              );
                              if (p.paths.has(x)) {
                                V = !0;
                                break;
                              }
                            }
                          }
                          $ = L.lastIndexOf(".");
                        }
                        if (V) break;
                      }
                    if (!V && P.includes("deps") && p.depsFunction) {
                      const b = p.depsFunction(a);
                      let $ = !1;
                      typeof b == "boolean" ? b && ($ = !0) : B(p.deps, b) || (p.deps = b, $ = !0), $ && (V = !0);
                    }
                    V && p.forceUpdate();
                  }
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const d = r.getState().getInitialOptions(t)?.validation, e = r.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              J(d.key);
              const o = r.getState().cogsStateStore[t];
              try {
                const a = r.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([m]) => {
                  m && m.startsWith(d.key) && J(m);
                });
                const c = d.zodSchema.safeParse(o);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const N = u.path, p = u.message, V = [d.key, ...N].join(".");
                  e(V, p);
                }), ft(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return y;
          if (l === "getComponents")
            return () => r().stateComponents.get(t);
          if (l === "getAllFormRefs")
            return () => Tt.getState().getFormRefsByStateKey(t);
          if (l === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return r.getState().serverState[t];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return I.revertToInitialState;
          if (l === "updateInitialState") return I.updateInitialState;
          if (l === "removeValidation") return I.removeValidation;
        }
        if (l === "getFormRef")
          return () => Tt.getState().getFormRef(t + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: e
          }) => /* @__PURE__ */ st(
            Ot,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: f?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return n;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (d, e) => {
            if (e?.debounce)
              Rt(() => {
                rt(s, d, n, "");
                const o = r.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(o);
              }, e.debounce);
            else {
              rt(s, d, n, "");
              const o = r.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(o);
            }
            E(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ st(
            jt,
            {
              setState: s,
              stateKey: t,
              path: n,
              child: d,
              formOpts: e
            }
          );
        const M = [...n, l], et = r.getState().getNestedState(t, M);
        return i(et, M, f);
      }
    }, G = new Proxy(O, j);
    return S.set(W, {
      proxy: G,
      stateVersion: A
    }), G;
  }
  return i(
    r.getState().getNestedState(t, [])
  );
}
function kt(t) {
  return ut(Zt, { proxy: t });
}
function Jt({
  proxy: t,
  rebuildStateShape: s
}) {
  const y = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(y) ? s(
    y,
    t._path
  ).stateMapNoRender(
    (S, A, E, I, i) => t._mapFn(S, A, E, I, i)
  ) : null;
}
function Zt({
  proxy: t
}) {
  const s = Z(null), y = `${t._stateKey}-${t._path.join(".")}`;
  return yt(() => {
    const g = s.current;
    if (!g || !g.parentElement) return;
    const S = g.parentElement, E = Array.from(S.childNodes).indexOf(g);
    let I = S.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, S.setAttribute("data-parent-id", I));
    const h = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: E,
      effect: t._effect
    };
    r.getState().addSignalElement(y, h);
    const n = r.getState().getNestedState(t._stateKey, t._path);
    let f;
    if (t._effect)
      try {
        f = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (O) {
        console.error("Error evaluating effect function during mount:", O), f = n;
      }
    else
      f = n;
    f !== null && typeof f == "object" && (f = JSON.stringify(f));
    const W = document.createTextNode(String(f));
    g.replaceWith(W);
  }, [t._stateKey, t._path.join("."), t._effect]), ut("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": y
  });
}
function ue(t) {
  const s = xt(
    (y) => {
      const g = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: y,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return ut("text", {}, String(s));
}
function Yt({
  stateKey: t,
  itemComponentId: s,
  itemPath: y,
  children: g,
  onMeasure: S
  // OPTIONAL PROP
}) {
  const [, A] = tt({});
  ct(() => {
    const i = `${t}////${s}`, h = r.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return h.components.set(i, {
      forceUpdate: () => A({}),
      paths: /* @__PURE__ */ new Set([y.join(".")])
      // ATOMIC: Subscribes only to this item's path.
    }), r.getState().stateComponents.set(t, h), () => {
      const n = r.getState().stateComponents.get(t);
      n && n.components.delete(i);
    };
  }, [t, s, y.join(".")]);
  const [E, I] = Dt();
  return ct(() => {
    !S || I.height === 0 || S(I.height);
  }, [I.height, S]), /* @__PURE__ */ st("div", { ref: E, children: g });
}
export {
  kt as $cogsSignal,
  ue as $cogsSignalStore,
  ce as addStateOptions,
  le as createCogsState,
  de as notifyComponent,
  zt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
