"use client";
import { jsx as yt } from "react/jsx-runtime";
import { useState as tt, useRef as Z, useEffect as it, useLayoutEffect as ut, useMemo as It, createElement as ct, useSyncExternalStore as _t, startTransition as Mt, useCallback as Tt } from "react";
import { transformStateFunc as Rt, isDeepEqual as q, isFunction as Q, getNestedValue as J, getDifferences as pt, debounce as jt } from "./utility.js";
import { pushFunc as vt, updateFn as st, cutFunc as dt, ValidationWrapper as Ot, FormControlComponent as Ut } from "./Functions.jsx";
import Ft from "superjson";
import { v4 as wt } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Et } from "./store.js";
import { useCogsConfig as Ct } from "./CogsStateClient.jsx";
import { applyPatch as Dt } from "fast-json-patch";
import Wt from "react-use-measure";
function At(t, c) {
  const m = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, y = m(t) || {};
  f(t, {
    ...y,
    ...c
  });
}
function Vt({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const f = rt(t) || {}, y = m[t] || {}, b = o.getState().setInitialStateOptions, p = { ...y, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      p.hasOwnProperty(a) ? (a == "localStorage" && c[a] && p[a].key !== c[a]?.key && (I = !0, p[a] = c[a]), a == "initialState" && c[a] && p[a] !== c[a] && // Different references
      !q(p[a], c[a]) && (I = !0, p[a] = c[a])) : (I = !0, p[a] = c[a]);
  I && b(t, p);
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
    }, rt(I) || o.getState().setInitialStateOptions(I, y[I]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const b = (I, a) => {
    const [v] = tt(a?.componentId ?? wt());
    Vt({
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
  function p(I, a) {
    Vt({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Bt(I, a), mt(I);
  }
  return { useCogsState: b, setCogsOptions: p };
}, {
  setUpdaterState: gt,
  setState: et,
  getInitialOptions: rt,
  getKeyState: Nt,
  getValidationErrors: Lt,
  setStateLog: Gt,
  updateInitialStateGlobal: $t,
  addValidationError: Ht,
  removeValidationError: X,
  setServerSyncActions: zt
} = o.getState(), kt = (t, c, m, f, y) => {
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
      I = St(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Ft.serialize(a);
    window.localStorage.setItem(
      p,
      JSON.stringify(v.json)
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
}, Bt = (t, c) => {
  const m = o.getState().cogsStateStore[t], { sessionId: f } = Ct(), y = Q(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (y && f) {
    const b = St(
      `${f}-${t}-${y}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return et(t, b.state), mt(t), !0;
  }
  return !1;
}, xt = (t, c, m, f, y, b) => {
  const p = {
    initialState: c,
    updaterState: ft(
      t,
      f,
      y,
      b
    ),
    state: m
  };
  $t(t, p.initialState), gt(t, p.updaterState), et(t, p.state);
}, mt = (t) => {
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
        oldValue: J(c, f),
        newValue: J(m, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: J(m, f)
      };
    case "cut":
      return {
        oldValue: J(c, f),
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
  reactiveType: p,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [G, O] = tt({}), { sessionId: U } = Ct();
  let H = !c;
  const [h] = tt(c ?? wt()), l = o.getState().stateLog[h], lt = Z(/* @__PURE__ */ new Set()), K = Z(I ?? wt()), R = Z(
    null
  );
  R.current = rt(h) ?? null, it(() => {
    if (v && v.stateKey === h && v.path?.[0]) {
      et(h, (r) => ({
        ...r,
        [v.path[0]]: v.newValue
      }));
      const e = `${v.stateKey}:${v.path.join(".")}`;
      o.getState().setSyncInfo(e, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), it(() => {
    if (a) {
      At(h, {
        initialState: a
      });
      const e = R.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !q(i, a) || !i) && !s)
        return;
      let u = null;
      const T = Q(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      T && U && (u = St(`${U}-${h}-${T}`));
      let w = a, V = !1;
      const x = s ? Date.now() : 0, C = u?.lastUpdated || 0, P = u?.lastSyncedWithServer || 0;
      s && x > C ? (w = e.serverState.data, V = !0) : u && C > P && (w = u.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), o.getState().initializeShadowState(h, a), xt(
        h,
        a,
        w,
        ot,
        K.current,
        U
      ), V && T && U && kt(w, h, e, U, Date.now()), mt(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || O({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), ut(() => {
    H && At(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: f,
      middleware: R.current?.middleware
    });
    const e = `${h}////${K.current}`, r = o.getState().stateComponents.get(h) || {
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
      lt.current.add(u);
    }
    const g = o.getState();
    et(h, (u) => {
      const T = Q(e) ? e(u) : e, w = `${h}-${r.join(".")}`;
      if (w) {
        let _ = !1, E = g.signalDomElements.get(w);
        if ((!E || E.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const M = r.slice(0, -1), W = J(T, M);
          if (Array.isArray(W)) {
            _ = !0;
            const A = `${h}-${M.join(".")}`;
            E = g.signalDomElements.get(A);
          }
        }
        if (E) {
          const M = _ ? J(T, r.slice(0, -1)) : J(T, r);
          E.forEach(({ parentId: W, position: A, effect: F }) => {
            const j = document.querySelector(
              `[data-parent-id="${W}"]`
            );
            if (j) {
              const $ = Array.from(j.childNodes);
              if ($[A]) {
                const k = F ? new Function("state", `return (${F})(state)`)(M) : M;
                $[A].textContent = String(k);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (i || R.current?.validation?.key) && r && X(
        (i || R.current?.validation?.key) + "." + r.join(".")
      );
      const V = r.slice(0, r.length - 1);
      s.updateType === "cut" && R.current?.validation?.key && X(
        R.current?.validation?.key + "." + V.join(".")
      ), s.updateType === "insert" && R.current?.validation?.key && Lt(
        R.current?.validation?.key + "." + V.join(".")
      ).filter(([E, M]) => {
        let W = E?.split(".").length;
        if (E == V.join(".") && W == V.length - 1) {
          let A = E + "." + V;
          X(E), Ht(A, M);
        }
      });
      const x = g.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", x), x) {
        const _ = pt(u, T), E = new Set(_), M = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          W,
          A
        ] of x.components.entries()) {
          let F = !1;
          const j = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
          if (console.log("component", A), !j.includes("none")) {
            if (j.includes("all")) {
              A.forceUpdate();
              continue;
            }
            if (j.includes("component") && ((A.paths.has(M) || A.paths.has("")) && (F = !0), !F))
              for (const $ of E) {
                let k = $;
                for (; ; ) {
                  if (A.paths.has(k)) {
                    F = !0;
                    break;
                  }
                  const L = k.lastIndexOf(".");
                  if (L !== -1) {
                    const z = k.substring(
                      0,
                      L
                    );
                    if (!isNaN(
                      Number(k.substring(L + 1))
                    ) && A.paths.has(z)) {
                      F = !0;
                      break;
                    }
                    k = z;
                  } else
                    k = "";
                  if (k === "")
                    break;
                }
                if (F) break;
              }
            if (!F && j.includes("deps") && A.depsFunction) {
              const $ = A.depsFunction(T);
              let k = !1;
              typeof $ == "boolean" ? $ && (k = !0) : q(A.deps, $) || (A.deps = $, k = !0), k && (F = !0);
            }
            F && A.forceUpdate();
          }
        }
      }
      const C = Date.now();
      r = r.map((_, E) => {
        const M = r.slice(0, -1), W = J(T, M);
        return E === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (W.length - 1).toString() : _;
      });
      const { oldValue: P, newValue: D } = qt(
        s.updateType,
        u,
        T,
        r
      ), N = {
        timeStamp: C,
        stateKey: h,
        path: r,
        updateType: s.updateType,
        status: "new",
        oldValue: P,
        newValue: D
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(h, r, T);
          break;
        case "insert":
          const _ = r.slice(0, -1);
          g.insertShadowArrayElement(h, _, D);
          break;
        case "cut":
          const E = r.slice(0, -1), M = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(h, E, M);
          break;
      }
      if (Gt(h, (_) => {
        const M = [..._ ?? [], N].reduce((W, A) => {
          const F = `${A.stateKey}:${JSON.stringify(A.path)}`, j = W.get(F);
          return j ? (j.timeStamp = Math.max(j.timeStamp, A.timeStamp), j.newValue = A.newValue, j.oldValue = j.oldValue ?? A.oldValue, j.updateType = A.updateType) : W.set(F, { ...A }), W;
        }, /* @__PURE__ */ new Map());
        return Array.from(M.values());
      }), kt(
        T,
        h,
        R.current,
        U
      ), R.current?.middleware && R.current.middleware({
        updateLog: l,
        update: N
      }), R.current?.serverSync) {
        const _ = g.serverState[h], E = R.current?.serverSync;
        zt(h, {
          syncKey: typeof E.syncKey == "string" ? E.syncKey : E.syncKey({ state: T }),
          rollBackState: _,
          actionTimeStamp: Date.now() + (E.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  o.getState().updaterState[h] || (gt(
    h,
    ft(
      h,
      ot,
      K.current,
      U
    )
  ), o.getState().cogsStateStore[h] || et(h, t), o.getState().initialStateGlobal[h] || $t(h, t));
  const d = It(() => ft(
    h,
    ot,
    K.current,
    U
  ), [h, U]);
  return [Nt(h), d];
}
function ft(t, c, m, f) {
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
      const G = a(S, []), O = rt(t), U = Q(O?.localStorage?.key) ? O?.localStorage?.key(S) : O?.localStorage?.key, H = `${f}-${t}-${U}`;
      H && localStorage.removeItem(H), gt(t, G), et(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), b++;
      const n = ft(
        t,
        c,
        m,
        f
      ), S = o.getState().initialStateGlobal[t], G = rt(t), O = Q(G?.localStorage?.key) ? G?.localStorage?.key(S) : G?.localStorage?.key, U = `${f}-${t}-${O}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), Mt(() => {
        $t(t, v), o.getState().initializeShadowState(t, v), gt(t, n), et(t, v);
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
      return !!(v && q(v, Nt(t)));
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
      apply(h, l, lt) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(t, n);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !lt.has(l)) {
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
          return () => pt(
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
                  const T = [s, ...u.path].join(".");
                  o.getState().addValidationError(T, u.message);
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
          const d = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = J(e, n);
          return q(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = J(e, n);
            return q(d, r) ? "fresh" : "stale";
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
              } = e, g = Z(null), [u, T] = tt({
                startIndex: 0,
                endIndex: 10
              }), w = Z(i), [V, x] = tt(0), C = Z(!1), P = Z(0);
              it(() => {
                let $ = 0;
                return o.getState().subscribeToShadowState(t, () => {
                  $++, $ <= 5 && console.log(
                    `[VirtualView] Shadow update #${$}`
                  ), x((L) => L + 1);
                });
              }, [t]);
              const D = o().getNestedState(
                t,
                n
              ), N = D.length;
              console.log(
                `[VirtualView] Initial setup - totalCount: ${N}, itemHeight: ${r}, stickToBottom: ${i}`
              ), N !== P.current && (console.log(
                `[VirtualView] Array size changed from ${P.current} to ${N}`
              ), C.current = !1, P.current = N);
              const { totalHeight: _, positions: E, allMeasured: M } = It(() => {
                const $ = o.getState().getShadowMetadata(t, n) || [];
                let k = 0;
                const L = [];
                let z = 0;
                for (let B = 0; B < N; B++) {
                  L[B] = k;
                  const at = $[B]?.virtualizer?.itemHeight;
                  at && z++, k += at || r;
                }
                const Y = z === N && N > 0;
                return console.log(
                  `[VirtualView] Heights calc - measured: ${z}/${N}, allMeasured: ${Y}, totalHeight: ${k}`
                ), { totalHeight: k, positions: L, allMeasured: Y };
              }, [
                N,
                t,
                n.join("."),
                r,
                V
              ]), W = It(() => {
                const $ = Math.max(0, u.startIndex), k = Math.min(N, u.endIndex);
                console.log(
                  `[VirtualView] Creating virtual slice - range: ${$}-${k} (${k - $} items)`
                );
                const L = Array.from(
                  { length: k - $ },
                  (Y, B) => $ + B
                ), z = L.map((Y) => D[Y]);
                return a(z, n, {
                  ...S,
                  validIndices: L
                });
              }, [u.startIndex, u.endIndex, D, N]);
              ut(() => {
                const $ = g.current;
                if (!$) return;
                const k = () => {
                  if (!$) return;
                  const { scrollTop: z } = $;
                  let Y = 0, B = N - 1;
                  for (; Y <= B; ) {
                    const ht = Math.floor((Y + B) / 2);
                    E[ht] < z ? Y = ht + 1 : B = ht - 1;
                  }
                  const at = Math.max(0, B - s);
                  let nt = at;
                  const Pt = z + $.clientHeight;
                  for (; nt < N && E[nt] < Pt; )
                    nt++;
                  nt = Math.min(N, nt + s), T({ startIndex: at, endIndex: nt });
                }, L = () => {
                  w.current = $.scrollHeight - $.scrollTop - $.clientHeight < 1, k();
                };
                return $.addEventListener("scroll", L, {
                  passive: !0
                }), i && !C.current && N > 0 && (M ? (console.log(
                  "[VirtualView] All items measured, scrolling to bottom"
                ), C.current = !0, $.scrollTo({
                  top: $.scrollHeight,
                  behavior: "auto"
                })) : console.log(
                  "[VirtualView] Waiting for all measurements before scroll"
                )), k(), () => {
                  $.removeEventListener("scroll", L);
                };
              }, [N, E, i, M]);
              const A = Tt(
                ($ = "smooth") => {
                  g.current && (w.current = !0, g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: $
                  }));
                },
                []
              ), F = Tt(
                ($, k = "smooth") => {
                  g.current && E[$] !== void 0 && (w.current = !1, g.current.scrollTo({
                    top: E[$],
                    behavior: k
                  }));
                },
                [E]
              ), j = {
                outer: {
                  ref: g,
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
                    transform: `translateY(${E[u.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: W,
                virtualizerProps: j,
                scrollToBottom: A,
                scrollToIndex: F
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...d()].sort(
                (u, T) => e(u.item, T.item)
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
                ({ item: u }, T) => e(u, T)
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
                const u = r[i], T = [...n, i.toString()], w = a(u, T, S);
                return e(u, w, {
                  register: () => {
                    const [, x] = tt({}), C = `${m}-${n.join(".")}-${i}`;
                    ut(() => {
                      const P = `${t}////${C}`, D = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set(P, {
                        forceUpdate: () => x({}),
                        paths: /* @__PURE__ */ new Set([T.join(".")])
                      }), o.getState().stateComponents.set(t, D), () => {
                        const N = o.getState().stateComponents.get(t);
                        N && N.components.delete(P);
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
              const u = [...n, g.toString()], T = a(s, u, S);
              return e(
                s,
                T,
                i,
                v,
                a(v, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => ct(Yt, {
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
                const u = r[i], T = [...n, i.toString()], w = a(u, T, S), V = `${m}-${n.join(".")}-${i}`;
                return ct(Xt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: V,
                  itemPath: T,
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
            return (e) => (p(n), vt(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), g = Q(e) ? e(i) : e;
              let u = null;
              if (!i.some((w) => {
                if (r) {
                  const x = r.every(
                    (C) => q(w[C], g[C])
                  );
                  return x && (u = w), x;
                }
                const V = q(w, g);
                return V && (u = w), V;
              }))
                p(n), vt(c, g, n, t);
              else if (s && u) {
                const w = s(u), V = i.map(
                  (x) => q(x, u) ? w : x
                );
                p(n), st(c, V, n);
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
              for (let r = 0; r < v.length; r++)
                v[r] === e && dt(c, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = v.findIndex((s) => s === e);
              r > -1 ? dt(c, n, t, r) : vt(c, e, n, t);
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
        const K = n[n.length - 1];
        if (!isNaN(Number(K))) {
          const d = n.slice(0, -1), e = o.getState().getNestedState(t, d);
          if (Array.isArray(e) && l === "cut")
            return () => dt(
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
          return (d) => bt({
            _stateKey: t,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => bt({
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
            st(c, i, e), p(e);
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
            st(c, i, d), p(d);
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
                const g = pt(e, s), u = new Set(g);
                for (const [
                  T,
                  w
                ] of i.components.entries()) {
                  let V = !1;
                  const x = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!x.includes("none")) {
                    if (x.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (x.includes("component") && (w.paths.has("") && (V = !0), !V))
                      for (const C of u) {
                        if (w.paths.has(C)) {
                          V = !0;
                          break;
                        }
                        let P = C.lastIndexOf(".");
                        for (; P !== -1; ) {
                          const D = C.substring(0, P);
                          if (w.paths.has(D)) {
                            V = !0;
                            break;
                          }
                          const N = C.substring(
                            P + 1
                          );
                          if (!isNaN(Number(N))) {
                            const _ = D.lastIndexOf(".");
                            if (_ !== -1) {
                              const E = D.substring(
                                0,
                                _
                              );
                              if (w.paths.has(E)) {
                                V = !0;
                                break;
                              }
                            }
                          }
                          P = D.lastIndexOf(".");
                        }
                        if (V) break;
                      }
                    if (!V && x.includes("deps") && w.depsFunction) {
                      const C = w.depsFunction(s);
                      let P = !1;
                      typeof C == "boolean" ? C && (P = !0) : q(w.deps, C) || (w.deps = C, P = !0), P && (V = !0);
                    }
                    V && w.forceUpdate();
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
                  const T = u.path, w = u.message, V = [d.key, ...T].join(".");
                  e(V, w);
                }), mt(t), !1);
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
          }) => /* @__PURE__ */ yt(
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
                st(c, d, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              st(c, d, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            p(n);
          };
        if (l === "formElement")
          return (d, e) => /* @__PURE__ */ yt(
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
function bt(t) {
  return ct(Zt, { proxy: t });
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
    (y, b, p, I, a) => t._mapFn(y, b, p, I, a)
  ) : null;
}
function Zt({
  proxy: t
}) {
  const c = Z(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return it(() => {
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
    const G = document.createTextNode(String(S));
    f.replaceWith(G);
  }, [t._stateKey, t._path.join("."), t._effect]), ct("span", {
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
  return ct("text", {}, String(c));
}
function Xt({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: f
}) {
  const [, y] = tt({}), [b, p] = Wt(), I = Z(null);
  return it(() => {
    p.height > 0 && p.height !== I.current && (I.current = p.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), ut(() => {
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
  }, [t, c, m.join(".")]), /* @__PURE__ */ yt("div", { ref: b, children: f });
}
export {
  bt as $cogsSignal,
  ge as $cogsSignalStore,
  le as addStateOptions,
  de as createCogsState,
  ue as notifyComponent,
  Jt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
