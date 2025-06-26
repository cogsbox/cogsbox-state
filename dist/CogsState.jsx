"use client";
import { jsx as yt } from "react/jsx-runtime";
import { useState as ot, useRef as J, useEffect as et, useLayoutEffect as $t, useMemo as It, createElement as st, useSyncExternalStore as Mt, startTransition as Ot, useCallback as gt } from "react";
import { transformStateFunc as jt, isDeepEqual as q, isFunction as K, getNestedValue as Y, getDifferences as wt, debounce as Ut } from "./utility.js";
import { pushFunc as vt, updateFn as it, cutFunc as ut, ValidationWrapper as Ft, FormControlComponent as Dt } from "./Functions.jsx";
import Lt from "superjson";
import { v4 as pt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Tt } from "./store.js";
import { useCogsConfig as Nt } from "./CogsStateClient.jsx";
import { applyPatch as Gt } from "fast-json-patch";
import Wt from "react-use-measure";
function At(t, s) {
  const m = o.getState().getInitialOptions, u = o.getState().setInitialStateOptions, v = m(t) || {};
  u(t, {
    ...v,
    ...s
  });
}
function bt({
  stateKey: t,
  options: s,
  initialOptionsPart: m
}) {
  const u = rt(t) || {}, v = m[t] || {}, V = o.getState().setInitialStateOptions, I = { ...v, ...u };
  let y = !1;
  if (s)
    for (const i in s)
      I.hasOwnProperty(i) ? (i == "localStorage" && s[i] && I[i].key !== s[i]?.key && (y = !0, I[i] = s[i]), i == "initialState" && s[i] && I[i] !== s[i] && // Different references
      !q(I[i], s[i]) && (y = !0, I[i] = s[i])) : (y = !0, I[i] = s[i]);
  y && V(t, I);
}
function de(t, { formElements: s, validation: m }) {
  return { initialState: t, formElements: s, validation: m };
}
const ue = (t, s) => {
  let m = t;
  const [u, v] = jt(m);
  (Object.keys(v).length > 0 || s && Object.keys(s).length > 0) && Object.keys(v).forEach((y) => {
    v[y] = v[y] || {}, v[y].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...v[y].formElements || {}
      // State-specific overrides
    }, rt(y) || o.getState().setInitialStateOptions(y, v[y]);
  }), o.getState().setInitialStates(u), o.getState().setCreatedState(u);
  const V = (y, i) => {
    const [h] = ot(i?.componentId ?? pt());
    bt({
      stateKey: y,
      options: i,
      initialOptionsPart: v
    });
    const n = o.getState().cogsStateStore[y] || u[y], g = i?.modifyState ? i.modifyState(n) : n, [D, O] = Yt(
      g,
      {
        stateKey: y,
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
  function I(y, i) {
    bt({ stateKey: y, options: i, initialOptionsPart: v }), i.localStorage && qt(y, i), ct(y);
  }
  return { useCogsState: V, setCogsOptions: I };
}, {
  setUpdaterState: ft,
  setState: nt,
  getInitialOptions: rt,
  getKeyState: Pt,
  getValidationErrors: zt,
  setStateLog: Ht,
  updateInitialStateGlobal: Et,
  addValidationError: Ct,
  removeValidationError: X,
  setServerSyncActions: Bt
} = o.getState(), Vt = (t, s, m, u, v) => {
  m?.log && console.log(
    "saving to localstorage",
    s,
    m.localStorage?.key,
    u
  );
  const V = K(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (V && u) {
    const I = `${u}-${s}-${V}`;
    let y;
    try {
      y = mt(I)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: v ?? y
    }, h = Lt.serialize(i);
    window.localStorage.setItem(
      I,
      JSON.stringify(h.json)
    );
  }
}, mt = (t) => {
  if (!t) return null;
  try {
    const s = window.localStorage.getItem(t);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, qt = (t, s) => {
  const m = o.getState().cogsStateStore[t], { sessionId: u } = Nt(), v = K(s?.localStorage?.key) ? s.localStorage.key(m) : s?.localStorage?.key;
  if (v && u) {
    const V = mt(
      `${u}-${t}-${v}`
    );
    if (V && V.lastUpdated > (V.lastSyncedWithServer || 0))
      return nt(t, V.state), ct(t), !0;
  }
  return !1;
}, _t = (t, s, m, u, v, V) => {
  const I = {
    initialState: s,
    updaterState: St(
      t,
      u,
      v,
      V
    ),
    state: m
  };
  Et(t, I.initialState), ft(t, I.updaterState), nt(t, I.state);
}, ct = (t) => {
  const s = o.getState().stateComponents.get(t);
  if (!s) return;
  const m = /* @__PURE__ */ new Set();
  s.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || m.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((u) => u());
  });
}, ge = (t, s) => {
  const m = o.getState().stateComponents.get(t);
  if (m) {
    const u = `${t}////${s}`, v = m.components.get(u);
    if ((v ? Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"] : null)?.includes("none"))
      return;
    v && v.forceUpdate();
  }
}, Jt = (t, s, m, u) => {
  switch (t) {
    case "update":
      return {
        oldValue: Y(s, u),
        newValue: Y(m, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: Y(m, u)
      };
    case "cut":
      return {
        oldValue: Y(s, u),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Yt(t, {
  stateKey: s,
  serverSync: m,
  localStorage: u,
  formElements: v,
  reactiveDeps: V,
  reactiveType: I,
  componentId: y,
  initialState: i,
  syncUpdate: h,
  dependencies: n,
  serverState: g
} = {}) {
  const [D, O] = ot({}), { sessionId: j } = Nt();
  let W = !s;
  const [f] = ot(s ?? pt()), c = o.getState().stateLog[f], lt = J(/* @__PURE__ */ new Set()), tt = J(y ?? pt()), R = J(
    null
  );
  R.current = rt(f) ?? null, et(() => {
    if (h && h.stateKey === f && h.path?.[0]) {
      nt(f, (r) => ({
        ...r,
        [h.path[0]]: h.newValue
      }));
      const e = `${h.stateKey}:${h.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: h.timeStamp,
        userId: h.userId
      });
    }
  }, [h]), et(() => {
    if (i) {
      At(f, {
        initialState: i
      });
      const e = R.current, a = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, d = o.getState().initialStateGlobal[f];
      if (!(d && !q(d, i) || !d) && !a)
        return;
      let S = null;
      const A = K(e?.localStorage?.key) ? e?.localStorage?.key(i) : e?.localStorage?.key;
      A && j && (S = mt(`${j}-${f}-${A}`));
      let p = i, b = !1;
      const C = a ? Date.now() : 0, P = S?.lastUpdated || 0, U = S?.lastSyncedWithServer || 0;
      a && C > P ? (p = e.serverState.data, b = !0) : S && P > U && (p = S.state, e?.localStorage?.onChange && e?.localStorage?.onChange(p)), o.getState().initializeShadowState(f, i), _t(
        f,
        i,
        p,
        at,
        tt.current,
        j
      ), b && A && j && Vt(p, f, e, j, Date.now()), ct(f), (Array.isArray(I) ? I : [I || "component"]).includes("none") || O({});
    }
  }, [
    i,
    g?.status,
    g?.data,
    ...n || []
  ]), $t(() => {
    W && At(f, {
      serverSync: m,
      formElements: v,
      initialState: i,
      localStorage: u,
      middleware: R.current?.middleware
    });
    const e = `${f}////${tt.current}`, r = o.getState().stateComponents.get(f) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: V || void 0,
      reactiveType: I ?? ["component", "deps"]
    }), o.getState().stateComponents.set(f, r), O({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(f));
    };
  }, []);
  const at = (e, r, a, d) => {
    if (Array.isArray(r)) {
      const S = `${f}-${r.join(".")}`;
      lt.current.add(S);
    }
    const w = o.getState();
    nt(f, (S) => {
      const A = K(e) ? e(S) : e, p = `${f}-${r.join(".")}`;
      if (p) {
        let E = !1, x = w.signalDomElements.get(p);
        if ((!x || x.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const $ = r.slice(0, -1), G = Y(A, $);
          if (Array.isArray(G)) {
            E = !0;
            const k = `${f}-${$.join(".")}`;
            x = w.signalDomElements.get(k);
          }
        }
        if (x) {
          const $ = E ? Y(A, r.slice(0, -1)) : Y(A, r);
          x.forEach(({ parentId: G, position: k, effect: F }) => {
            const M = document.querySelector(
              `[data-parent-id="${G}"]`
            );
            if (M) {
              const H = Array.from(M.childNodes);
              if (H[k]) {
                const T = F ? new Function("state", `return (${F})(state)`)($) : $;
                H[k].textContent = String(T);
              }
            }
          });
        }
      }
      console.log("shadowState", w.shadowStateStore), a.updateType === "update" && (d || R.current?.validation?.key) && r && X(
        (d || R.current?.validation?.key) + "." + r.join(".")
      );
      const b = r.slice(0, r.length - 1);
      a.updateType === "cut" && R.current?.validation?.key && X(
        R.current?.validation?.key + "." + b.join(".")
      ), a.updateType === "insert" && R.current?.validation?.key && zt(
        R.current?.validation?.key + "." + b.join(".")
      ).filter(([x, $]) => {
        let G = x?.split(".").length;
        if (x == b.join(".") && G == b.length - 1) {
          let k = x + "." + b;
          X(x), Ct(k, $);
        }
      });
      const C = w.stateComponents.get(f);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", C), C) {
        const E = wt(S, A), x = new Set(E), $ = a.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          G,
          k
        ] of C.components.entries()) {
          let F = !1;
          const M = Array.isArray(k.reactiveType) ? k.reactiveType : [k.reactiveType || "component"];
          if (console.log("component", k), !M.includes("none")) {
            if (M.includes("all")) {
              k.forceUpdate();
              continue;
            }
            if (M.includes("component") && ((k.paths.has($) || k.paths.has("")) && (F = !0), !F))
              for (const H of x) {
                let T = H;
                for (; ; ) {
                  if (k.paths.has(T)) {
                    F = !0;
                    break;
                  }
                  const N = T.lastIndexOf(".");
                  if (N !== -1) {
                    const _ = T.substring(
                      0,
                      N
                    );
                    if (!isNaN(
                      Number(T.substring(N + 1))
                    ) && k.paths.has(_)) {
                      F = !0;
                      break;
                    }
                    T = _;
                  } else
                    T = "";
                  if (T === "")
                    break;
                }
                if (F) break;
              }
            if (!F && M.includes("deps") && k.depsFunction) {
              const H = k.depsFunction(A);
              let T = !1;
              typeof H == "boolean" ? H && (T = !0) : q(k.deps, H) || (k.deps = H, T = !0), T && (F = !0);
            }
            F && k.forceUpdate();
          }
        }
      }
      const P = Date.now();
      r = r.map((E, x) => {
        const $ = r.slice(0, -1), G = Y(A, $);
        return x === r.length - 1 && ["insert", "cut"].includes(a.updateType) ? (G.length - 1).toString() : E;
      });
      const { oldValue: U, newValue: z } = Jt(
        a.updateType,
        S,
        A,
        r
      ), Q = {
        timeStamp: P,
        stateKey: f,
        path: r,
        updateType: a.updateType,
        status: "new",
        oldValue: U,
        newValue: z
      };
      switch (a.updateType) {
        case "update":
          w.updateShadowAtPath(f, r, A);
          break;
        case "insert":
          const E = r.slice(0, -1);
          w.insertShadowArrayElement(f, E, z);
          break;
        case "cut":
          const x = r.slice(0, -1), $ = parseInt(r[r.length - 1]);
          w.removeShadowArrayElement(f, x, $);
          break;
      }
      if (Ht(f, (E) => {
        const $ = [...E ?? [], Q].reduce((G, k) => {
          const F = `${k.stateKey}:${JSON.stringify(k.path)}`, M = G.get(F);
          return M ? (M.timeStamp = Math.max(M.timeStamp, k.timeStamp), M.newValue = k.newValue, M.oldValue = M.oldValue ?? k.oldValue, M.updateType = k.updateType) : G.set(F, { ...k }), G;
        }, /* @__PURE__ */ new Map());
        return Array.from($.values());
      }), Vt(
        A,
        f,
        R.current,
        j
      ), R.current?.middleware && R.current.middleware({
        updateLog: c,
        update: Q
      }), R.current?.serverSync) {
        const E = w.serverState[f], x = R.current?.serverSync;
        Bt(f, {
          syncKey: typeof x.syncKey == "string" ? x.syncKey : x.syncKey({ state: A }),
          rollBackState: E,
          actionTimeStamp: Date.now() + (x.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return A;
    });
  };
  o.getState().updaterState[f] || (ft(
    f,
    St(
      f,
      at,
      tt.current,
      j
    )
  ), o.getState().cogsStateStore[f] || nt(f, t), o.getState().initialStateGlobal[f] || Et(f, t));
  const l = It(() => St(
    f,
    at,
    tt.current,
    j
  ), [f, j]);
  return [Pt(f), l];
}
function St(t, s, m, u) {
  const v = /* @__PURE__ */ new Map();
  let V = 0;
  const I = (h) => {
    const n = h.join(".");
    for (const [g] of v)
      (g === n || g.startsWith(n + ".")) && v.delete(g);
    V++;
  }, y = {
    removeValidation: (h) => {
      h?.validationKey && X(h.validationKey);
    },
    revertToInitialState: (h) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && X(n?.key), h?.validationKey && X(h.validationKey);
      const g = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), v.clear(), V++;
      const D = i(g, []), O = rt(t), j = K(O?.localStorage?.key) ? O?.localStorage?.key(g) : O?.localStorage?.key, W = `${u}-${t}-${j}`;
      W && localStorage.removeItem(W), ft(t, D), nt(t, g);
      const f = o.getState().stateComponents.get(t);
      return f && f.components.forEach((c) => {
        c.forceUpdate();
      }), g;
    },
    updateInitialState: (h) => {
      v.clear(), V++;
      const n = St(
        t,
        s,
        m,
        u
      ), g = o.getState().initialStateGlobal[t], D = rt(t), O = K(D?.localStorage?.key) ? D?.localStorage?.key(g) : D?.localStorage?.key, j = `${u}-${t}-${O}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), Ot(() => {
        Et(t, h), o.getState().initializeShadowState(t, h), ft(t, n), nt(t, h);
        const W = o.getState().stateComponents.get(t);
        W && W.components.forEach((f) => {
          f.forceUpdate();
        });
      }), {
        fetchId: (W) => n.get()[W]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const h = o.getState().serverState[t];
      return !!(h && q(h, Pt(t)));
    }
  };
  function i(h, n = [], g) {
    const D = n.map(String).join(".");
    v.get(D);
    const O = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(y).forEach((f) => {
      O[f] = y[f];
    });
    const j = {
      apply(f, c, lt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(f, c) {
        g?.validIndices && !Array.isArray(h) && (g = { ...g, validIndices: void 0 });
        const lt = /* @__PURE__ */ new Set([
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
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender" && !lt.has(c)) {
          const l = `${t}////${m}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const r = e.components.get(l);
            if (r && !r.paths.has("")) {
              const a = n.join(".");
              let d = !0;
              for (const w of r.paths)
                if (a.startsWith(w) && (a === w || a[w.length] === ".")) {
                  d = !1;
                  break;
                }
              d && r.paths.add(a);
            }
          }
        }
        if (c === "getDifferences")
          return () => wt(
            o.getState().cogsStateStore[t],
            o.getState().initialStateGlobal[t]
          );
        if (c === "sync" && n.length === 0)
          return async function() {
            const l = o.getState().getInitialOptions(t), e = l?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const r = o.getState().getNestedState(t, []), a = l?.validation?.key;
            try {
              const d = await e.action(r);
              if (d && !d.success && d.errors && a) {
                o.getState().removeValidationError(a), d.errors.forEach((S) => {
                  const A = [a, ...S.path].join(".");
                  o.getState().addValidationError(A, S.message);
                });
                const w = o.getState().stateComponents.get(t);
                w && w.components.forEach((S) => {
                  S.forceUpdate();
                });
              }
              return d?.success && e.onSuccess ? e.onSuccess(d.data) : !d?.success && e.onError && e.onError(d.error), d;
            } catch (d) {
              return e.onError && e.onError(d), { success: !1, error: d };
            }
          };
        if (c === "_status") {
          const l = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = Y(e, n);
          return q(l, r) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const l = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = Y(e, n);
            return q(l, r) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const l = o.getState().initialStateGlobal[t], e = rt(t), r = K(e?.localStorage?.key) ? e?.localStorage?.key(l) : e?.localStorage?.key, a = `${u}-${t}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (c === "showValidationErrors")
          return () => {
            const l = o.getState().getInitialOptions(t)?.validation;
            if (!l?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(l.key + "." + n.join("."));
          };
        if (Array.isArray(h)) {
          const l = () => g?.validIndices ? h.map((r, a) => ({
            item: r,
            originalIndex: g.validIndices[a]
          })) : o.getState().getNestedState(t, n).map((r, a) => ({
            item: r,
            originalIndex: a
          }));
          if (c === "getSelected")
            return () => {
              const e = o.getState().getSelectedIndex(t, n.join("."));
              if (e !== void 0)
                return i(
                  h[e],
                  [...n, e.toString()],
                  g
                );
            };
          if (c === "clearSelected")
            return () => {
              o.getState().clearSelectedIndex({ stateKey: t, path: n });
            };
          if (c === "getSelectedIndex")
            return () => o.getState().getSelectedIndex(t, n.join(".")) ?? -1;
          if (c === "useVirtualView")
            return (e) => {
              const {
                itemHeight: r = 50,
                overscan: a = 6,
                stickToBottom: d = !1,
                dependencies: w = []
              } = e, S = J(null), [A, p] = ot({
                startIndex: 0,
                endIndex: 10
              }), [b, C] = ot(0), P = J(!1), U = J(0), z = J(!1);
              et(() => o.getState().subscribeToShadowState(t, () => {
                C((N) => N + 1);
              }), [t]);
              const Q = o().getNestedState(
                t,
                n
              ), E = Q.length, { totalHeight: x, positions: $ } = It(() => {
                const T = o.getState().getShadowMetadata(t, n) || [];
                let N = 0;
                const _ = [];
                for (let L = 0; L < E; L++) {
                  _[L] = N;
                  const B = T[L]?.virtualizer?.itemHeight;
                  N += B || r;
                }
                return { totalHeight: N, positions: _ };
              }, [
                E,
                t,
                n.join("."),
                r,
                b
              ]), G = It(() => {
                const T = Math.max(0, A.startIndex), N = Math.min(E, A.endIndex), _ = Array.from(
                  { length: N - T },
                  (B, ht) => T + ht
                ), L = _.map((B) => Q[B]);
                return i(L, n, {
                  ...g,
                  validIndices: _
                });
              }, [A.startIndex, A.endIndex, Q, E]), k = gt(() => {
                const T = o.getState().getShadowMetadata(t, n) || [], N = E - 1;
                if (N >= 0) {
                  const _ = T[N];
                  if (_?.virtualizer?.domRef) {
                    const L = _.virtualizer.domRef;
                    if (L && L.scrollIntoView)
                      return L.scrollIntoView({
                        behavior: "auto",
                        block: "end",
                        inline: "nearest"
                      }), !0;
                  }
                }
                return !1;
              }, [t, n, E]);
              et(() => {
                if (!d || E === 0) return;
                const T = E > U.current;
                if (U.current === 0 && E > 0 && !z.current) {
                  z.current = !0;
                  const N = Math.ceil(
                    (S.current?.clientHeight || 600) / r
                  );
                  p({
                    startIndex: Math.max(
                      0,
                      E - N - a
                    ),
                    endIndex: E
                  }), setTimeout(() => {
                    S.current && (S.current.scrollTop = S.current.scrollHeight, P.current = !0);
                  }, 100);
                } else if (T && P.current) {
                  const N = Math.ceil(
                    (S.current?.clientHeight || 600) / r
                  ), _ = {
                    startIndex: Math.max(
                      0,
                      E - N - a
                    ),
                    endIndex: E
                  };
                  p(_), setTimeout(() => {
                    k();
                  }, 50);
                }
                U.current = E;
              }, [E]), et(() => {
                const T = S.current;
                if (!T) return;
                const N = () => {
                  const { scrollTop: _, scrollHeight: L, clientHeight: B } = T, ht = L - _ - B;
                  P.current = ht < 100;
                  let dt = 0;
                  for (let Z = 0; Z < $.length; Z++)
                    if ($[Z] > _ - r * a) {
                      dt = Math.max(0, Z - 1);
                      break;
                    }
                  let kt = dt;
                  const Rt = _ + B;
                  for (let Z = dt; Z < $.length && !($[Z] > Rt + r * a); Z++)
                    kt = Z;
                  p({
                    startIndex: Math.max(0, dt),
                    endIndex: Math.min(E, kt + 1 + a)
                  });
                };
                return T.addEventListener("scroll", N, {
                  passive: !0
                }), N(), () => {
                  T.removeEventListener("scroll", N);
                };
              }, [$, E, r, a]);
              const F = gt(() => {
                P.current = !0, !k() && S.current && (S.current.scrollTop = S.current.scrollHeight);
              }, [k]), M = gt(
                (T, N = "smooth") => {
                  const L = (o.getState().getShadowMetadata(t, n) || [])[T];
                  if (L?.virtualizer?.domRef) {
                    const B = L.virtualizer.domRef;
                    if (B && B.scrollIntoView) {
                      B.scrollIntoView({ behavior: N, block: "center" });
                      return;
                    }
                  }
                  S.current && $[T] !== void 0 && S.current.scrollTo({
                    top: $[T],
                    behavior: N
                  });
                },
                [$, t, n]
              ), H = {
                outer: {
                  ref: S,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${x}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${$[A.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: G,
                virtualizerProps: H,
                scrollToBottom: F,
                scrollToIndex: M
              };
            };
          if (c === "stateMapNoRender")
            return (e) => h.map((a, d) => {
              let w;
              g?.validIndices && g.validIndices[d] !== void 0 ? w = g.validIndices[d] : w = d;
              const S = [...n, w.toString()], A = i(a, S, g);
              return e(
                a,
                A,
                d,
                h,
                i(h, n, g)
              );
            });
          if (c === "$stateMap")
            return (e) => st(Zt, {
              proxy: {
                _stateKey: t,
                _path: n,
                _mapFn: e
                // Pass the actual function, not string
              },
              rebuildStateShape: i
            });
          if (c === "stateList")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (g?.validIndices || Array.from({ length: r.length }, (d, w) => w)).map((d, w) => {
                const S = r[d], A = [...n, d.toString()], p = i(S, A, g), b = `${m}-${n.join(".")}-${d}`;
                return st(Qt, {
                  key: d,
                  stateKey: t,
                  itemComponentId: b,
                  itemPath: A,
                  children: e(
                    S,
                    p,
                    { localIndex: w, originalIndex: d },
                    r,
                    i(r, n, g)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (c === "stateFlattenOn")
            return (e) => {
              const r = h;
              v.clear(), V++;
              const a = r.flatMap(
                (d) => d[e] ?? []
              );
              return i(
                a,
                [...n, "[*]", e],
                g
              );
            };
          if (c === "index")
            return (e) => {
              const r = h[e];
              return i(r, [...n, e.toString()]);
            };
          if (c === "last")
            return () => {
              const e = o.getState().getNestedState(t, n);
              if (e.length === 0) return;
              const r = e.length - 1, a = e[r], d = [...n, r.toString()];
              return i(a, d);
            };
          if (c === "insert")
            return (e) => (I(n), vt(s, e, n, t), i(
              o.getState().getNestedState(t, n),
              n
            ));
          if (c === "uniqueInsert")
            return (e, r, a) => {
              const d = o.getState().getNestedState(t, n), w = K(e) ? e(d) : e;
              let S = null;
              if (!d.some((p) => {
                if (r) {
                  const C = r.every(
                    (P) => q(p[P], w[P])
                  );
                  return C && (S = p), C;
                }
                const b = q(p, w);
                return b && (S = p), b;
              }))
                I(n), vt(s, w, n, t);
              else if (a && S) {
                const p = a(S), b = d.map(
                  (C) => q(C, S) ? p : C
                );
                I(n), it(s, b, n);
              }
            };
          if (c === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return I(n), ut(s, n, t, e), i(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (c === "cutByValue")
            return (e) => {
              for (let r = 0; r < h.length; r++)
                h[r] === e && ut(s, n, t, r);
            };
          if (c === "toggleByValue")
            return (e) => {
              const r = h.findIndex((a) => a === e);
              r > -1 ? ut(s, n, t, r) : vt(s, e, n, t);
            };
          if (c === "stateFind")
            return (e) => {
              const a = l().find(
                ({ item: w }, S) => e(w, S)
              );
              if (!a) return;
              const d = [...n, a.originalIndex.toString()];
              return i(a.item, d, g);
            };
          if (c === "findWith")
            return (e, r) => {
              const d = l().find(
                ({ item: S }) => S[e] === r
              );
              if (!d) return;
              const w = [...n, d.originalIndex.toString()];
              return i(d.item, w, g);
            };
        }
        const tt = n[n.length - 1];
        if (!isNaN(Number(tt))) {
          const l = n.slice(0, -1), e = o.getState().getNestedState(t, l);
          if (Array.isArray(e) && c === "cut")
            return () => ut(
              s,
              l,
              t,
              Number(tt)
            );
        }
        if (c === "get")
          return () => {
            if (g?.validIndices && Array.isArray(h)) {
              const l = o.getState().getNestedState(t, n);
              return g.validIndices.map((e) => l[e]);
            }
            return o.getState().getNestedState(t, n);
          };
        if (c === "$derive")
          return (l) => xt({
            _stateKey: t,
            _path: n,
            _effect: l.toString()
          });
        if (c === "$get")
          return () => xt({
            _stateKey: t,
            _path: n
          });
        if (c === "lastSynced") {
          const l = `${t}:${n.join(".")}`;
          return o.getState().getSyncInfo(l);
        }
        if (c == "getLocalStorage")
          return (l) => mt(u + "-" + t + "-" + l);
        if (c === "_selected") {
          const l = n.slice(0, -1), e = l.join("."), r = o.getState().getNestedState(t, l);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (c === "setSelected")
          return (l) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), a = e.join(".");
            l ? o.getState().setSelectedIndex(t, a, r) : o.getState().setSelectedIndex(t, a, void 0);
            const d = o.getState().getNestedState(t, [...e]);
            it(s, d, e), I(e);
          };
        if (c === "toggleSelected")
          return () => {
            const l = n.slice(0, -1), e = Number(n[n.length - 1]), r = l.join("."), a = o.getState().getSelectedIndex(t, r);
            o.getState().setSelectedIndex(
              t,
              r,
              a === e ? void 0 : e
            );
            const d = o.getState().getNestedState(t, [...l]);
            it(s, d, l), I(l);
          };
        if (n.length == 0) {
          if (c === "addValidation")
            return (l) => {
              const e = o.getState().getInitialOptions(t)?.validation;
              if (!e?.key)
                throw new Error("Validation key not found");
              X(e.key), console.log("addValidationError", l), l.forEach((r) => {
                const a = [e.key, ...r.path].join(".");
                console.log("fullErrorPath", a), Ct(a, r.message);
              }), ct(t);
            };
          if (c === "applyJsonPatch")
            return (l) => {
              const e = o.getState().cogsStateStore[t], a = Gt(e, l).newDocument;
              _t(
                t,
                o.getState().initialStateGlobal[t],
                a,
                s,
                m,
                u
              );
              const d = o.getState().stateComponents.get(t);
              if (d) {
                const w = wt(e, a), S = new Set(w);
                for (const [
                  A,
                  p
                ] of d.components.entries()) {
                  let b = !1;
                  const C = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!C.includes("none")) {
                    if (C.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (C.includes("component") && (p.paths.has("") && (b = !0), !b))
                      for (const P of S) {
                        if (p.paths.has(P)) {
                          b = !0;
                          break;
                        }
                        let U = P.lastIndexOf(".");
                        for (; U !== -1; ) {
                          const z = P.substring(0, U);
                          if (p.paths.has(z)) {
                            b = !0;
                            break;
                          }
                          const Q = P.substring(
                            U + 1
                          );
                          if (!isNaN(Number(Q))) {
                            const E = z.lastIndexOf(".");
                            if (E !== -1) {
                              const x = z.substring(
                                0,
                                E
                              );
                              if (p.paths.has(x)) {
                                b = !0;
                                break;
                              }
                            }
                          }
                          U = z.lastIndexOf(".");
                        }
                        if (b) break;
                      }
                    if (!b && C.includes("deps") && p.depsFunction) {
                      const P = p.depsFunction(a);
                      let U = !1;
                      typeof P == "boolean" ? P && (U = !0) : q(p.deps, P) || (p.deps = P, U = !0), U && (b = !0);
                    }
                    b && p.forceUpdate();
                  }
                }
              }
            };
          if (c === "validateZodSchema")
            return () => {
              const l = o.getState().getInitialOptions(t)?.validation, e = o.getState().addValidationError;
              if (!l?.zodSchema)
                throw new Error("Zod schema not found");
              if (!l?.key)
                throw new Error("Validation key not found");
              X(l.key);
              const r = o.getState().cogsStateStore[t];
              try {
                const a = o.getState().getValidationErrors(l.key);
                a && a.length > 0 && a.forEach(([w]) => {
                  w && w.startsWith(l.key) && X(w);
                });
                const d = l.zodSchema.safeParse(r);
                return d.success ? !0 : (d.error.errors.forEach((S) => {
                  const A = S.path, p = S.message, b = [l.key, ...A].join(".");
                  e(b, p);
                }), ct(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (c === "_componentId") return m;
          if (c === "getComponents")
            return () => o().stateComponents.get(t);
          if (c === "getAllFormRefs")
            return () => Tt.getState().getFormRefsByStateKey(t);
          if (c === "_initialState")
            return o.getState().initialStateGlobal[t];
          if (c === "_serverState")
            return o.getState().serverState[t];
          if (c === "_isLoading")
            return o.getState().isLoadingGlobal[t];
          if (c === "revertToInitialState")
            return y.revertToInitialState;
          if (c === "updateInitialState") return y.updateInitialState;
          if (c === "removeValidation") return y.removeValidation;
        }
        if (c === "getFormRef")
          return () => Tt.getState().getFormRef(t + "." + n.join("."));
        if (c === "validationWrapper")
          return ({
            children: l,
            hideMessage: e
          }) => /* @__PURE__ */ yt(
            Ft,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: g?.validIndices,
              children: l
            }
          );
        if (c === "_stateKey") return t;
        if (c === "_path") return n;
        if (c === "_isServerSynced") return y._isServerSynced;
        if (c === "update")
          return (l, e) => {
            if (e?.debounce)
              Ut(() => {
                it(s, l, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              it(s, l, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            I(n);
          };
        if (c === "formElement")
          return (l, e) => /* @__PURE__ */ yt(
            Dt,
            {
              setState: s,
              stateKey: t,
              path: n,
              child: l,
              formOpts: e
            }
          );
        const R = [...n, c], at = o.getState().getNestedState(t, R);
        return i(at, R, g);
      }
    }, W = new Proxy(O, j);
    return v.set(D, {
      proxy: W,
      stateVersion: V
    }), W;
  }
  return i(
    o.getState().getNestedState(t, [])
  );
}
function xt(t) {
  return st(Xt, { proxy: t });
}
function Zt({
  proxy: t,
  rebuildStateShape: s
}) {
  const m = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? s(
    m,
    t._path
  ).stateMapNoRender(
    (v, V, I, y, i) => t._mapFn(v, V, I, y, i)
  ) : null;
}
function Xt({
  proxy: t
}) {
  const s = J(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return et(() => {
    const u = s.current;
    if (!u || !u.parentElement) return;
    const v = u.parentElement, I = Array.from(v.childNodes).indexOf(u);
    let y = v.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, v.setAttribute("data-parent-id", y));
    const h = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: I,
      effect: t._effect
    };
    o.getState().addSignalElement(m, h);
    const n = o.getState().getNestedState(t._stateKey, t._path);
    let g;
    if (t._effect)
      try {
        g = new Function(
          "state",
          `return (${t._effect})(state)`
        )(n);
      } catch (O) {
        console.error("Error evaluating effect function during mount:", O), g = n;
      }
    else
      g = n;
    g !== null && typeof g == "object" && (g = JSON.stringify(g));
    const D = document.createTextNode(String(g));
    u.replaceWith(D);
  }, [t._stateKey, t._path.join("."), t._effect]), st("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function fe(t) {
  const s = Mt(
    (m) => {
      const u = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(t._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => u.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return st("text", {}, String(s));
}
function Qt({
  stateKey: t,
  itemComponentId: s,
  itemPath: m,
  children: u
}) {
  const [, v] = ot({}), [V, I] = Wt(), y = J(null), i = J(null), h = gt(
    (n) => {
      V(n), y.current = n;
    },
    [V]
  );
  return et(() => {
    I.height > 0 && I.height !== i.current && (i.current = I.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: I.height,
        domRef: y.current
        // Store the actual DOM element reference
      }
    }));
  }, [I.height, t, m]), $t(() => {
    const n = `${t}////${s}`, g = o.getState().stateComponents.get(t) || {
      components: /* @__PURE__ */ new Map()
    };
    return g.components.set(n, {
      forceUpdate: () => v({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), o.getState().stateComponents.set(t, g), () => {
      const D = o.getState().stateComponents.get(t);
      D && D.components.delete(n);
    };
  }, [t, s, m.join(".")]), /* @__PURE__ */ yt("div", { ref: h, children: u });
}
export {
  xt as $cogsSignal,
  fe as $cogsSignalStore,
  de as addStateOptions,
  ue as createCogsState,
  ge as notifyComponent,
  Yt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
