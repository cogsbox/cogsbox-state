"use client";
import { jsx as It } from "react/jsx-runtime";
import { useState as et, useRef as X, useEffect as st, useLayoutEffect as gt, useMemo as pt, createElement as it, useSyncExternalStore as _t, startTransition as Mt, useCallback as Et } from "react";
import { transformStateFunc as Rt, isDeepEqual as Y, isFunction as K, getNestedValue as Z, getDifferences as wt, debounce as jt } from "./utility.js";
import { pushFunc as yt, updateFn as at, cutFunc as ut, ValidationWrapper as Ot, FormControlComponent as Ut } from "./Functions.jsx";
import Ft from "superjson";
import { v4 as $t } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Vt } from "./store.js";
import { useCogsConfig as xt } from "./CogsStateClient.jsx";
import { applyPatch as Dt } from "fast-json-patch";
import Wt from "react-use-measure";
function bt(t, c) {
  const m = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, y = m(t) || {};
  f(t, {
    ...y,
    ...c
  });
}
function At({
  stateKey: t,
  options: c,
  initialOptionsPart: m
}) {
  const f = rt(t) || {}, y = m[t] || {}, k = o.getState().setInitialStateOptions, p = { ...y, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      p.hasOwnProperty(a) ? (a == "localStorage" && c[a] && p[a].key !== c[a]?.key && (I = !0, p[a] = c[a]), a == "initialState" && c[a] && p[a] !== c[a] && // Different references
      !Y(p[a], c[a]) && (I = !0, p[a] = c[a])) : (I = !0, p[a] = c[a]);
  I && k(t, p);
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
  const k = (I, a) => {
    const [v] = et(a?.componentId ?? $t());
    At({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = o.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [z, j] = Jt(
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
    return j;
  };
  function p(I, a) {
    At({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Bt(I, a), ht(I);
  }
  return { useCogsState: k, setCogsOptions: p };
}, {
  setUpdaterState: ft,
  setState: nt,
  getInitialOptions: rt,
  getKeyState: Nt,
  getValidationErrors: Lt,
  setStateLog: Gt,
  updateInitialStateGlobal: Tt,
  addValidationError: Ht,
  removeValidationError: Q,
  setServerSyncActions: zt
} = o.getState(), kt = (t, c, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    f
  );
  const k = K(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (k && f) {
    const p = `${f}-${c}-${k}`;
    let I;
    try {
      I = mt(p)?.lastSyncedWithServer;
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
}, mt = (t) => {
  if (!t) return null;
  try {
    const c = window.localStorage.getItem(t);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, Bt = (t, c) => {
  const m = o.getState().cogsStateStore[t], { sessionId: f } = xt(), y = K(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (y && f) {
    const k = mt(
      `${f}-${t}-${y}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return nt(t, k.state), ht(t), !0;
  }
  return !1;
}, Pt = (t, c, m, f, y, k) => {
  const p = {
    initialState: c,
    updaterState: St(
      t,
      f,
      y,
      k
    ),
    state: m
  };
  Tt(t, p.initialState), ft(t, p.updaterState), nt(t, p.state);
}, ht = (t) => {
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
        oldValue: Z(c, f),
        newValue: Z(m, f)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: Z(m, f)
      };
    case "cut":
      return {
        oldValue: Z(c, f),
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
  reactiveDeps: k,
  reactiveType: p,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [z, j] = et({}), { sessionId: O } = xt();
  let B = !c;
  const [h] = et(c ?? $t()), l = o.getState().stateLog[h], ct = X(/* @__PURE__ */ new Set()), tt = X(I ?? $t()), M = X(
    null
  );
  M.current = rt(h) ?? null, st(() => {
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
      const e = M.current, s = e?.serverState?.id !== void 0 && e?.serverState?.status === "success" && e?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !Y(i, a) || !i) && !s)
        return;
      let d = null;
      const T = K(e?.localStorage?.key) ? e?.localStorage?.key(a) : e?.localStorage?.key;
      T && O && (d = mt(`${O}-${h}-${T}`));
      let w = a, b = !1;
      const N = s ? Date.now() : 0, C = d?.lastUpdated || 0, P = d?.lastSyncedWithServer || 0;
      s && N > C ? (w = e.serverState.data, b = !0) : d && C > P && (w = d.state, e?.localStorage?.onChange && e?.localStorage?.onChange(w)), o.getState().initializeShadowState(h, a), Pt(
        h,
        a,
        w,
        ot,
        tt.current,
        O
      ), b && T && O && kt(w, h, e, O, Date.now()), ht(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || j({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), gt(() => {
    B && bt(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: f,
      middleware: M.current?.middleware
    });
    const e = `${h}////${tt.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(e, {
      forceUpdate: () => j({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), j({}), () => {
      r && (r.components.delete(e), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const ot = (e, r, s, i) => {
    if (Array.isArray(r)) {
      const d = `${h}-${r.join(".")}`;
      ct.current.add(d);
    }
    const g = o.getState();
    nt(h, (d) => {
      const T = K(e) ? e(d) : e, w = `${h}-${r.join(".")}`;
      if (w) {
        let _ = !1, E = g.signalDomElements.get(w);
        if ((!E || E.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const U = r.slice(0, -1), W = Z(T, U);
          if (Array.isArray(W)) {
            _ = !0;
            const V = `${h}-${U.join(".")}`;
            E = g.signalDomElements.get(V);
          }
        }
        if (E) {
          const U = _ ? Z(T, r.slice(0, -1)) : Z(T, r);
          E.forEach(({ parentId: W, position: V, effect: F }) => {
            const R = document.querySelector(
              `[data-parent-id="${W}"]`
            );
            if (R) {
              const $ = Array.from(R.childNodes);
              if ($[V]) {
                const A = F ? new Function("state", `return (${F})(state)`)(U) : U;
                $[V].textContent = String(A);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (i || M.current?.validation?.key) && r && Q(
        (i || M.current?.validation?.key) + "." + r.join(".")
      );
      const b = r.slice(0, r.length - 1);
      s.updateType === "cut" && M.current?.validation?.key && Q(
        M.current?.validation?.key + "." + b.join(".")
      ), s.updateType === "insert" && M.current?.validation?.key && Lt(
        M.current?.validation?.key + "." + b.join(".")
      ).filter(([E, U]) => {
        let W = E?.split(".").length;
        if (E == b.join(".") && W == b.length - 1) {
          let V = E + "." + b;
          Q(E), Ht(V, U);
        }
      });
      const N = g.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", N), N) {
        const _ = wt(d, T), E = new Set(_), U = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          W,
          V
        ] of N.components.entries()) {
          let F = !1;
          const R = Array.isArray(V.reactiveType) ? V.reactiveType : [V.reactiveType || "component"];
          if (console.log("component", V), !R.includes("none")) {
            if (R.includes("all")) {
              V.forceUpdate();
              continue;
            }
            if (R.includes("component") && ((V.paths.has(U) || V.paths.has("")) && (F = !0), !F))
              for (const $ of E) {
                let A = $;
                for (; ; ) {
                  if (V.paths.has(A)) {
                    F = !0;
                    break;
                  }
                  const L = A.lastIndexOf(".");
                  if (L !== -1) {
                    const q = A.substring(
                      0,
                      L
                    );
                    if (!isNaN(
                      Number(A.substring(L + 1))
                    ) && V.paths.has(q)) {
                      F = !0;
                      break;
                    }
                    A = q;
                  } else
                    A = "";
                  if (A === "")
                    break;
                }
                if (F) break;
              }
            if (!F && R.includes("deps") && V.depsFunction) {
              const $ = V.depsFunction(T);
              let A = !1;
              typeof $ == "boolean" ? $ && (A = !0) : Y(V.deps, $) || (V.deps = $, A = !0), A && (F = !0);
            }
            F && V.forceUpdate();
          }
        }
      }
      const C = Date.now();
      r = r.map((_, E) => {
        const U = r.slice(0, -1), W = Z(T, U);
        return E === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (W.length - 1).toString() : _;
      });
      const { oldValue: P, newValue: D } = qt(
        s.updateType,
        d,
        T,
        r
      ), x = {
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
          const E = r.slice(0, -1), U = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(h, E, U);
          break;
      }
      if (Gt(h, (_) => {
        const U = [..._ ?? [], x].reduce((W, V) => {
          const F = `${V.stateKey}:${JSON.stringify(V.path)}`, R = W.get(F);
          return R ? (R.timeStamp = Math.max(R.timeStamp, V.timeStamp), R.newValue = V.newValue, R.oldValue = R.oldValue ?? V.oldValue, R.updateType = V.updateType) : W.set(F, { ...V }), W;
        }, /* @__PURE__ */ new Map());
        return Array.from(U.values());
      }), kt(
        T,
        h,
        M.current,
        O
      ), M.current?.middleware && M.current.middleware({
        updateLog: l,
        update: x
      }), M.current?.serverSync) {
        const _ = g.serverState[h], E = M.current?.serverSync;
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
  o.getState().updaterState[h] || (ft(
    h,
    St(
      h,
      ot,
      tt.current,
      O
    )
  ), o.getState().cogsStateStore[h] || nt(h, t), o.getState().initialStateGlobal[h] || Tt(h, t));
  const u = pt(() => St(
    h,
    ot,
    tt.current,
    O
  ), [h, O]);
  return [Nt(h), u];
}
function St(t, c, m, f) {
  const y = /* @__PURE__ */ new Map();
  let k = 0;
  const p = (v) => {
    const n = v.join(".");
    for (const [S] of y)
      (S === n || S.startsWith(n + ".")) && y.delete(S);
    k++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && Q(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = o.getState().getInitialOptions(t)?.validation;
      n?.key && Q(n?.key), v?.validationKey && Q(v.validationKey);
      const S = o.getState().initialStateGlobal[t];
      o.getState().clearSelectedIndexesForState(t), y.clear(), k++;
      const z = a(S, []), j = rt(t), O = K(j?.localStorage?.key) ? j?.localStorage?.key(S) : j?.localStorage?.key, B = `${f}-${t}-${O}`;
      B && localStorage.removeItem(B), ft(t, z), nt(t, S);
      const h = o.getState().stateComponents.get(t);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), k++;
      const n = St(
        t,
        c,
        m,
        f
      ), S = o.getState().initialStateGlobal[t], z = rt(t), j = K(z?.localStorage?.key) ? z?.localStorage?.key(S) : z?.localStorage?.key, O = `${f}-${t}-${j}`;
      return localStorage.getItem(O) && localStorage.removeItem(O), Mt(() => {
        Tt(t, v), o.getState().initializeShadowState(t, v), ft(t, n), nt(t, v);
        const B = o.getState().stateComponents.get(t);
        B && B.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (B) => n.get()[B]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const v = o.getState().serverState[t];
      return !!(v && Y(v, Nt(t)));
    }
  };
  function a(v, n = [], S) {
    const z = n.map(String).join(".");
    y.get(z);
    const j = function() {
      return o().getNestedState(t, n);
    };
    Object.keys(I).forEach((h) => {
      j[h] = I[h];
    });
    const O = {
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
          const u = `${t}////${m}`, e = o.getState().stateComponents.get(t);
          if (e) {
            const r = e.components.get(u);
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
          return () => wt(
            o.getState().cogsStateStore[t],
            o.getState().initialStateGlobal[t]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const u = o.getState().getInitialOptions(t), e = u?.sync;
            if (!e)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const r = o.getState().getNestedState(t, []), s = u?.validation?.key;
            try {
              const i = await e.action(r);
              if (i && !i.success && i.errors && s) {
                o.getState().removeValidationError(s), i.errors.forEach((d) => {
                  const T = [s, ...d.path].join(".");
                  o.getState().addValidationError(T, d.message);
                });
                const g = o.getState().stateComponents.get(t);
                g && g.components.forEach((d) => {
                  d.forceUpdate();
                });
              }
              return i?.success && e.onSuccess ? e.onSuccess(i.data) : !i?.success && e.onError && e.onError(i.error), i;
            } catch (i) {
              return e.onError && e.onError(i), { success: !1, error: i };
            }
          };
        if (l === "_status") {
          const u = o.getState().getNestedState(t, n), e = o.getState().initialStateGlobal[t], r = Z(e, n);
          return Y(u, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const u = o().getNestedState(
              t,
              n
            ), e = o.getState().initialStateGlobal[t], r = Z(e, n);
            return Y(u, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const u = o.getState().initialStateGlobal[t], e = rt(t), r = K(e?.localStorage?.key) ? e?.localStorage?.key(u) : e?.localStorage?.key, s = `${f}-${t}-${r}`;
            s && localStorage.removeItem(s);
          };
        if (l === "showValidationErrors")
          return () => {
            const u = o.getState().getInitialOptions(t)?.validation;
            if (!u?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(u.key + "." + n.join("."));
          };
        if (Array.isArray(v)) {
          const u = () => S?.validIndices ? v.map((r, s) => ({
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
              } = e, g = X(null), [d, T] = et({
                startIndex: 0,
                endIndex: 10
              }), w = X(i), [b, N] = et(0), C = X(!1), P = X(0);
              st(() => {
                let $ = 0;
                return o.getState().subscribeToShadowState(t, () => {
                  $++, $ <= 5 && console.log(
                    `[VirtualView] Shadow update #${$}`
                  ), N((L) => L + 1);
                });
              }, [t]);
              const D = o().getNestedState(
                t,
                n
              ), x = D.length;
              console.log(
                `[VirtualView] Initial setup - totalCount: ${x}, itemHeight: ${r}, stickToBottom: ${i}`
              ), x !== P.current && (console.log(
                `[VirtualView] Array size changed from ${P.current} to ${x}`
              ), C.current = !1, P.current = x);
              const { totalHeight: _, positions: E, visibleMeasured: U } = pt(() => {
                const $ = o.getState().getShadowMetadata(t, n) || [];
                let A = 0;
                const L = [];
                let q = 0, J = 0;
                for (let H = 0; H < x; H++) {
                  L[H] = A;
                  const dt = $[H]?.virtualizer?.itemHeight;
                  dt && (q++, H >= d.startIndex && H < d.endIndex && J++), A += dt || r;
                }
                const G = d.endIndex - d.startIndex, lt = J === G && G > 0;
                return console.log(
                  `[VirtualView] Heights calc - measured: ${q}/${x}, visible measured: ${J}/${G}, totalHeight: ${A}`
                ), {
                  totalHeight: A,
                  positions: L,
                  visibleMeasured: lt
                };
              }, [
                x,
                t,
                n.join("."),
                r,
                b,
                d
                // Add range dependency
              ]), W = pt(() => {
                const $ = Math.max(0, d.startIndex), A = Math.min(x, d.endIndex);
                console.log(
                  `[VirtualView] Creating virtual slice - range: ${$}-${A} (${A - $} items)`
                );
                const L = Array.from(
                  { length: A - $ },
                  (J, G) => $ + G
                ), q = L.map((J) => D[J]);
                return a(q, n, {
                  ...S,
                  validIndices: L
                });
              }, [d.startIndex, d.endIndex, D, x]);
              gt(() => {
                const $ = g.current;
                if (!$) return;
                const A = () => {
                  if (!$) return;
                  const { scrollTop: q } = $;
                  let J = 0, G = x - 1;
                  for (; J <= G; ) {
                    const vt = Math.floor((J + G) / 2);
                    E[vt] < q ? J = vt + 1 : G = vt - 1;
                  }
                  const lt = Math.max(0, G - s);
                  let H = lt;
                  const dt = q + $.clientHeight;
                  for (; H < x && E[H] < dt; )
                    H++;
                  H = Math.min(x, H + s), T({ startIndex: lt, endIndex: H });
                }, L = () => {
                  w.current = $.scrollHeight - $.scrollTop - $.clientHeight < 1, A();
                };
                if ($.addEventListener("scroll", L, {
                  passive: !0
                }), i && !C.current && x > 0)
                  if (d.endIndex >= x - 5)
                    console.log(
                      "[VirtualView] At end of list, scrolling to bottom"
                    ), C.current = !0, setTimeout(() => {
                      const G = $.scrollHeight + 1e3;
                      $.scrollTo({
                        top: G,
                        behavior: "auto"
                      }), w.current = !0;
                    }, 50);
                  else {
                    console.log(
                      "[VirtualView] Jumping near bottom to trigger measurements"
                    );
                    const G = Math.max(
                      0,
                      (x - 20) * r
                    );
                    $.scrollTo({
                      top: G,
                      behavior: "auto"
                    });
                  }
                return A(), () => {
                  $.removeEventListener("scroll", L);
                };
              }, [x, E, i]);
              const V = Et(
                ($ = "smooth") => {
                  g.current && (w.current = !0, g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: $
                  }));
                },
                []
              ), F = Et(
                ($, A = "smooth") => {
                  g.current && E[$] !== void 0 && (w.current = !1, g.current.scrollTo({
                    top: E[$],
                    behavior: A
                  }));
                },
                [E]
              ), R = {
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
                    transform: `translateY(${E[d.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: W,
                virtualizerProps: R,
                scrollToBottom: V,
                scrollToIndex: F
              };
            };
          if (l === "stateSort")
            return (e) => {
              const s = [...u()].sort(
                (d, T) => e(d.item, T.item)
              ), i = s.map(({ item: d }) => d), g = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: d }) => d
                )
              };
              return a(i, n, g);
            };
          if (l === "stateFilter")
            return (e) => {
              const s = u().filter(
                ({ item: d }, T) => e(d, T)
              ), i = s.map(({ item: d }) => d), g = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: d }) => d
                )
              };
              return a(i, n, g);
            };
          if (l === "stateMap")
            return (e) => {
              const r = o.getState().getNestedState(t, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (i, g) => g)).map((i, g) => {
                const d = r[i], T = [...n, i.toString()], w = a(d, T, S);
                return e(d, w, {
                  register: () => {
                    const [, N] = et({}), C = `${m}-${n.join(".")}-${i}`;
                    gt(() => {
                      const P = `${t}////${C}`, D = o.getState().stateComponents.get(t) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set(P, {
                        forceUpdate: () => N({}),
                        paths: /* @__PURE__ */ new Set([T.join(".")])
                      }), o.getState().stateComponents.set(t, D), () => {
                        const x = o.getState().stateComponents.get(t);
                        x && x.components.delete(P);
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
              const d = [...n, g.toString()], T = a(s, d, S);
              return e(
                s,
                T,
                i,
                v,
                a(v, n, S)
              );
            });
          if (l === "$stateMap")
            return (e) => it(Yt, {
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
                const d = r[i], T = [...n, i.toString()], w = a(d, T, S), b = `${m}-${n.join(".")}-${i}`;
                return it(Xt, {
                  key: i,
                  stateKey: t,
                  itemComponentId: b,
                  itemPath: T,
                  children: e(
                    d,
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
            return (e) => (p(n), yt(c, e, n, t), a(
              o.getState().getNestedState(t, n),
              n
            ));
          if (l === "uniqueInsert")
            return (e, r, s) => {
              const i = o.getState().getNestedState(t, n), g = K(e) ? e(i) : e;
              let d = null;
              if (!i.some((w) => {
                if (r) {
                  const N = r.every(
                    (C) => Y(w[C], g[C])
                  );
                  return N && (d = w), N;
                }
                const b = Y(w, g);
                return b && (d = w), b;
              }))
                p(n), yt(c, g, n, t);
              else if (s && d) {
                const w = s(d), b = i.map(
                  (N) => Y(N, d) ? w : N
                );
                p(n), at(c, b, n);
              }
            };
          if (l === "cut")
            return (e, r) => {
              if (!r?.waitForSync)
                return p(n), ut(c, n, t, e), a(
                  o.getState().getNestedState(t, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (e) => {
              for (let r = 0; r < v.length; r++)
                v[r] === e && ut(c, n, t, r);
            };
          if (l === "toggleByValue")
            return (e) => {
              const r = v.findIndex((s) => s === e);
              r > -1 ? ut(c, n, t, r) : yt(c, e, n, t);
            };
          if (l === "stateFind")
            return (e) => {
              const s = u().find(
                ({ item: g }, d) => e(g, d)
              );
              if (!s) return;
              const i = [...n, s.originalIndex.toString()];
              return a(s.item, i, S);
            };
          if (l === "findWith")
            return (e, r) => {
              const i = u().find(
                ({ item: d }) => d[e] === r
              );
              if (!i) return;
              const g = [...n, i.originalIndex.toString()];
              return a(i.item, g, S);
            };
        }
        const tt = n[n.length - 1];
        if (!isNaN(Number(tt))) {
          const u = n.slice(0, -1), e = o.getState().getNestedState(t, u);
          if (Array.isArray(e) && l === "cut")
            return () => ut(
              c,
              u,
              t,
              Number(tt)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(v)) {
              const u = o.getState().getNestedState(t, n);
              return S.validIndices.map((e) => u[e]);
            }
            return o.getState().getNestedState(t, n);
          };
        if (l === "$derive")
          return (u) => Ct({
            _stateKey: t,
            _path: n,
            _effect: u.toString()
          });
        if (l === "$get")
          return () => Ct({
            _stateKey: t,
            _path: n
          });
        if (l === "lastSynced") {
          const u = `${t}:${n.join(".")}`;
          return o.getState().getSyncInfo(u);
        }
        if (l == "getLocalStorage")
          return (u) => mt(f + "-" + t + "-" + u);
        if (l === "_selected") {
          const u = n.slice(0, -1), e = u.join("."), r = o.getState().getNestedState(t, u);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(t, e) : void 0;
        }
        if (l === "setSelected")
          return (u) => {
            const e = n.slice(0, -1), r = Number(n[n.length - 1]), s = e.join(".");
            u ? o.getState().setSelectedIndex(t, s, r) : o.getState().setSelectedIndex(t, s, void 0);
            const i = o.getState().getNestedState(t, [...e]);
            at(c, i, e), p(e);
          };
        if (l === "toggleSelected")
          return () => {
            const u = n.slice(0, -1), e = Number(n[n.length - 1]), r = u.join("."), s = o.getState().getSelectedIndex(t, r);
            o.getState().setSelectedIndex(
              t,
              r,
              s === e ? void 0 : e
            );
            const i = o.getState().getNestedState(t, [...u]);
            at(c, i, u), p(u);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (u) => {
              const e = o.getState().cogsStateStore[t], s = Dt(e, u).newDocument;
              Pt(
                t,
                o.getState().initialStateGlobal[t],
                s,
                c,
                m,
                f
              );
              const i = o.getState().stateComponents.get(t);
              if (i) {
                const g = wt(e, s), d = new Set(g);
                for (const [
                  T,
                  w
                ] of i.components.entries()) {
                  let b = !1;
                  const N = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!N.includes("none")) {
                    if (N.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (N.includes("component") && (w.paths.has("") && (b = !0), !b))
                      for (const C of d) {
                        if (w.paths.has(C)) {
                          b = !0;
                          break;
                        }
                        let P = C.lastIndexOf(".");
                        for (; P !== -1; ) {
                          const D = C.substring(0, P);
                          if (w.paths.has(D)) {
                            b = !0;
                            break;
                          }
                          const x = C.substring(
                            P + 1
                          );
                          if (!isNaN(Number(x))) {
                            const _ = D.lastIndexOf(".");
                            if (_ !== -1) {
                              const E = D.substring(
                                0,
                                _
                              );
                              if (w.paths.has(E)) {
                                b = !0;
                                break;
                              }
                            }
                          }
                          P = D.lastIndexOf(".");
                        }
                        if (b) break;
                      }
                    if (!b && N.includes("deps") && w.depsFunction) {
                      const C = w.depsFunction(s);
                      let P = !1;
                      typeof C == "boolean" ? C && (P = !0) : Y(w.deps, C) || (w.deps = C, P = !0), P && (b = !0);
                    }
                    b && w.forceUpdate();
                  }
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const u = o.getState().getInitialOptions(t)?.validation, e = o.getState().addValidationError;
              if (!u?.zodSchema)
                throw new Error("Zod schema not found");
              if (!u?.key)
                throw new Error("Validation key not found");
              Q(u.key);
              const r = o.getState().cogsStateStore[t];
              try {
                const s = o.getState().getValidationErrors(u.key);
                s && s.length > 0 && s.forEach(([g]) => {
                  g && g.startsWith(u.key) && Q(g);
                });
                const i = u.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((d) => {
                  const T = d.path, w = d.message, b = [u.key, ...T].join(".");
                  e(b, w);
                }), ht(t), !1);
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
            children: u,
            hideMessage: e
          }) => /* @__PURE__ */ It(
            Ot,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: S?.validIndices,
              children: u
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return n;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (u, e) => {
            if (e?.debounce)
              jt(() => {
                at(c, u, n, "");
                const r = o.getState().getNestedState(t, n);
                e?.afterUpdate && e.afterUpdate(r);
              }, e.debounce);
            else {
              at(c, u, n, "");
              const r = o.getState().getNestedState(t, n);
              e?.afterUpdate && e.afterUpdate(r);
            }
            p(n);
          };
        if (l === "formElement")
          return (u, e) => /* @__PURE__ */ It(
            Ut,
            {
              setState: c,
              stateKey: t,
              path: n,
              child: u,
              formOpts: e
            }
          );
        const M = [...n, l], ot = o.getState().getNestedState(t, M);
        return a(ot, M, S);
      }
    }, B = new Proxy(j, O);
    return y.set(z, {
      proxy: B,
      stateVersion: k
    }), B;
  }
  return a(
    o.getState().getNestedState(t, [])
  );
}
function Ct(t) {
  return it(Zt, { proxy: t });
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
    (y, k, p, I, a) => t._mapFn(y, k, p, I, a)
  ) : null;
}
function Zt({
  proxy: t
}) {
  const c = X(null), m = `${t._stateKey}-${t._path.join(".")}`;
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
      } catch (j) {
        console.error("Error evaluating effect function during mount:", j), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const z = document.createTextNode(String(S));
    f.replaceWith(z);
  }, [t._stateKey, t._path.join("."), t._effect]), it("span", {
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
  return it("text", {}, String(c));
}
function Xt({
  stateKey: t,
  itemComponentId: c,
  itemPath: m,
  children: f
}) {
  const [, y] = et({}), [k, p] = Wt(), I = X(null);
  return st(() => {
    p.height > 0 && p.height !== I.current && (I.current = p.height, o.getState().setShadowMetadata(t, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, t, m]), gt(() => {
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
  }, [t, c, m.join(".")]), /* @__PURE__ */ It("div", { ref: k, children: f });
}
export {
  Ct as $cogsSignal,
  ge as $cogsSignalStore,
  le as addStateOptions,
  de as createCogsState,
  ue as notifyComponent,
  Jt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
