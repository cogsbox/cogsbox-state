"use client";
import { jsx as Ie } from "react/jsx-runtime";
import { useState as te, useRef as X, useEffect as se, useLayoutEffect as ge, useMemo as pe, createElement as ie, useSyncExternalStore as _e, startTransition as Me, useCallback as Ee } from "react";
import { transformStateFunc as Re, isDeepEqual as Y, isFunction as K, getNestedValue as Z, getDifferences as we, debounce as je } from "./utility.js";
import { pushFunc as ye, updateFn as ae, cutFunc as ue, ValidationWrapper as Oe, FormControlComponent as Ue } from "./Functions.jsx";
import Fe from "superjson";
import { v4 as $e } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as Ve } from "./store.js";
import { useCogsConfig as xe } from "./CogsStateClient.jsx";
import { applyPatch as De } from "fast-json-patch";
import We from "react-use-measure";
function be(e, c) {
  const m = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, y = m(e) || {};
  f(e, {
    ...y,
    ...c
  });
}
function Ae({
  stateKey: e,
  options: c,
  initialOptionsPart: m
}) {
  const f = re(e) || {}, y = m[e] || {}, k = o.getState().setInitialStateOptions, p = { ...y, ...f };
  let I = !1;
  if (c)
    for (const a in c)
      p.hasOwnProperty(a) ? (a == "localStorage" && c[a] && p[a].key !== c[a]?.key && (I = !0, p[a] = c[a]), a == "initialState" && c[a] && p[a] !== c[a] && // Different references
      !Y(p[a], c[a]) && (I = !0, p[a] = c[a])) : (I = !0, p[a] = c[a]);
  I && k(e, p);
}
function lt(e, { formElements: c, validation: m }) {
  return { initialState: e, formElements: c, validation: m };
}
const dt = (e, c) => {
  let m = e;
  const [f, y] = Re(m);
  (Object.keys(y).length > 0 || c && Object.keys(c).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, re(I) || o.getState().setInitialStateOptions(I, y[I]);
  }), o.getState().setInitialStates(f), o.getState().setCreatedState(f);
  const k = (I, a) => {
    const [v] = te(a?.componentId ?? $e());
    Ae({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = o.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [H, O] = Je(
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
    Ae({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Be(I, a), he(I);
  }
  return { useCogsState: k, setCogsOptions: p };
}, {
  setUpdaterState: fe,
  setState: ne,
  getInitialOptions: re,
  getKeyState: Ne,
  getValidationErrors: Le,
  setStateLog: Ge,
  updateInitialStateGlobal: Te,
  addValidationError: He,
  removeValidationError: Q,
  setServerSyncActions: ze
} = o.getState(), ke = (e, c, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    f
  );
  const k = K(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (k && f) {
    const p = `${f}-${c}-${k}`;
    let I;
    try {
      I = me(p)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Fe.serialize(a);
    window.localStorage.setItem(
      p,
      JSON.stringify(v.json)
    );
  }
}, me = (e) => {
  if (!e) return null;
  try {
    const c = window.localStorage.getItem(e);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, Be = (e, c) => {
  const m = o.getState().cogsStateStore[e], { sessionId: f } = xe(), y = K(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (y && f) {
    const k = me(
      `${f}-${e}-${y}`
    );
    if (k && k.lastUpdated > (k.lastSyncedWithServer || 0))
      return ne(e, k.state), he(e), !0;
  }
  return !1;
}, Pe = (e, c, m, f, y, k) => {
  const p = {
    initialState: c,
    updaterState: Se(
      e,
      f,
      y,
      k
    ),
    state: m
  };
  Te(e, p.initialState), fe(e, p.updaterState), ne(e, p.state);
}, he = (e) => {
  const c = o.getState().stateComponents.get(e);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || m.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((f) => f());
  });
}, ut = (e, c) => {
  const m = o.getState().stateComponents.get(e);
  if (m) {
    const f = `${e}////${c}`, y = m.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, qe = (e, c, m, f) => {
  switch (e) {
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
function Je(e, {
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
  const [H, O] = te({}), { sessionId: U } = xe();
  let z = !c;
  const [h] = te(c ?? $e()), d = o.getState().stateLog[h], ce = X(/* @__PURE__ */ new Set()), ee = X(I ?? $e()), R = X(
    null
  );
  R.current = re(h) ?? null, se(() => {
    if (v && v.stateKey === h && v.path?.[0]) {
      ne(h, (r) => ({
        ...r,
        [v.path[0]]: v.newValue
      }));
      const t = `${v.stateKey}:${v.path.join(".")}`;
      o.getState().setSyncInfo(t, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), se(() => {
    if (a) {
      be(h, {
        initialState: a
      });
      const t = R.current, s = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, i = o.getState().initialStateGlobal[h];
      if (!(i && !Y(i, a) || !i) && !s)
        return;
      let l = null;
      const T = K(t?.localStorage?.key) ? t?.localStorage?.key(a) : t?.localStorage?.key;
      T && U && (l = me(`${U}-${h}-${T}`));
      let w = a, b = !1;
      const N = s ? Date.now() : 0, x = l?.lastUpdated || 0, P = l?.lastSyncedWithServer || 0;
      s && N > x ? (w = t.serverState.data, b = !0) : l && x > P && (w = l.state, t?.localStorage?.onChange && t?.localStorage?.onChange(w)), o.getState().initializeShadowState(h, a), Pe(
        h,
        a,
        w,
        oe,
        ee.current,
        U
      ), b && T && U && ke(w, h, t, U, Date.now()), he(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || O({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), ge(() => {
    z && be(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: f,
      middleware: R.current?.middleware
    });
    const t = `${h}////${ee.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(t, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: k || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), O({}), () => {
      r && (r.components.delete(t), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const oe = (t, r, s, i) => {
    if (Array.isArray(r)) {
      const l = `${h}-${r.join(".")}`;
      ce.current.add(l);
    }
    const g = o.getState();
    ne(h, (l) => {
      const T = K(t) ? t(l) : t, w = `${h}-${r.join(".")}`;
      if (w) {
        let M = !1, E = g.signalDomElements.get(w);
        if ((!E || E.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const _ = r.slice(0, -1), W = Z(T, _);
          if (Array.isArray(W)) {
            M = !0;
            const V = `${h}-${_.join(".")}`;
            E = g.signalDomElements.get(V);
          }
        }
        if (E) {
          const _ = M ? Z(T, r.slice(0, -1)) : Z(T, r);
          E.forEach(({ parentId: W, position: V, effect: F }) => {
            const j = document.querySelector(
              `[data-parent-id="${W}"]`
            );
            if (j) {
              const $ = Array.from(j.childNodes);
              if ($[V]) {
                const A = F ? new Function("state", `return (${F})(state)`)(_) : _;
                $[V].textContent = String(A);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (i || R.current?.validation?.key) && r && Q(
        (i || R.current?.validation?.key) + "." + r.join(".")
      );
      const b = r.slice(0, r.length - 1);
      s.updateType === "cut" && R.current?.validation?.key && Q(
        R.current?.validation?.key + "." + b.join(".")
      ), s.updateType === "insert" && R.current?.validation?.key && Le(
        R.current?.validation?.key + "." + b.join(".")
      ).filter(([E, _]) => {
        let W = E?.split(".").length;
        if (E == b.join(".") && W == b.length - 1) {
          let V = E + "." + b;
          Q(E), He(V, _);
        }
      });
      const N = g.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", N), N) {
        const M = we(l, T), E = new Set(M), _ = s.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          W,
          V
        ] of N.components.entries()) {
          let F = !1;
          const j = Array.isArray(V.reactiveType) ? V.reactiveType : [V.reactiveType || "component"];
          if (console.log("component", V), !j.includes("none")) {
            if (j.includes("all")) {
              V.forceUpdate();
              continue;
            }
            if (j.includes("component") && ((V.paths.has(_) || V.paths.has("")) && (F = !0), !F))
              for (const $ of E) {
                let A = $;
                for (; ; ) {
                  if (V.paths.has(A)) {
                    F = !0;
                    break;
                  }
                  const L = A.lastIndexOf(".");
                  if (L !== -1) {
                    const B = A.substring(
                      0,
                      L
                    );
                    if (!isNaN(
                      Number(A.substring(L + 1))
                    ) && V.paths.has(B)) {
                      F = !0;
                      break;
                    }
                    A = B;
                  } else
                    A = "";
                  if (A === "")
                    break;
                }
                if (F) break;
              }
            if (!F && j.includes("deps") && V.depsFunction) {
              const $ = V.depsFunction(T);
              let A = !1;
              typeof $ == "boolean" ? $ && (A = !0) : Y(V.deps, $) || (V.deps = $, A = !0), A && (F = !0);
            }
            F && V.forceUpdate();
          }
        }
      }
      const x = Date.now();
      r = r.map((M, E) => {
        const _ = r.slice(0, -1), W = Z(T, _);
        return E === r.length - 1 && ["insert", "cut"].includes(s.updateType) ? (W.length - 1).toString() : M;
      });
      const { oldValue: P, newValue: D } = qe(
        s.updateType,
        l,
        T,
        r
      ), C = {
        timeStamp: x,
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
          const M = r.slice(0, -1);
          g.insertShadowArrayElement(h, M, D);
          break;
        case "cut":
          const E = r.slice(0, -1), _ = parseInt(r[r.length - 1]);
          g.removeShadowArrayElement(h, E, _);
          break;
      }
      if (Ge(h, (M) => {
        const _ = [...M ?? [], C].reduce((W, V) => {
          const F = `${V.stateKey}:${JSON.stringify(V.path)}`, j = W.get(F);
          return j ? (j.timeStamp = Math.max(j.timeStamp, V.timeStamp), j.newValue = V.newValue, j.oldValue = j.oldValue ?? V.oldValue, j.updateType = V.updateType) : W.set(F, { ...V }), W;
        }, /* @__PURE__ */ new Map());
        return Array.from(_.values());
      }), ke(
        T,
        h,
        R.current,
        U
      ), R.current?.middleware && R.current.middleware({
        updateLog: d,
        update: C
      }), R.current?.serverSync) {
        const M = g.serverState[h], E = R.current?.serverSync;
        ze(h, {
          syncKey: typeof E.syncKey == "string" ? E.syncKey : E.syncKey({ state: T }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (E.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  o.getState().updaterState[h] || (fe(
    h,
    Se(
      h,
      oe,
      ee.current,
      U
    )
  ), o.getState().cogsStateStore[h] || ne(h, e), o.getState().initialStateGlobal[h] || Te(h, e));
  const u = pe(() => Se(
    h,
    oe,
    ee.current,
    U
  ), [h, U]);
  return [Ne(h), u];
}
function Se(e, c, m, f) {
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
      const n = o.getState().getInitialOptions(e)?.validation;
      n?.key && Q(n?.key), v?.validationKey && Q(v.validationKey);
      const S = o.getState().initialStateGlobal[e];
      o.getState().clearSelectedIndexesForState(e), y.clear(), k++;
      const H = a(S, []), O = re(e), U = K(O?.localStorage?.key) ? O?.localStorage?.key(S) : O?.localStorage?.key, z = `${f}-${e}-${U}`;
      z && localStorage.removeItem(z), fe(e, H), ne(e, S);
      const h = o.getState().stateComponents.get(e);
      return h && h.components.forEach((d) => {
        d.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), k++;
      const n = Se(
        e,
        c,
        m,
        f
      ), S = o.getState().initialStateGlobal[e], H = re(e), O = K(H?.localStorage?.key) ? H?.localStorage?.key(S) : H?.localStorage?.key, U = `${f}-${e}-${O}`;
      return localStorage.getItem(U) && localStorage.removeItem(U), Me(() => {
        Te(e, v), o.getState().initializeShadowState(e, v), fe(e, n), ne(e, v);
        const z = o.getState().stateComponents.get(e);
        z && z.components.forEach((h) => {
          h.forceUpdate();
        });
      }), {
        fetchId: (z) => n.get()[z]
      };
    },
    _initialState: o.getState().initialStateGlobal[e],
    _serverState: o.getState().serverState[e],
    _isLoading: o.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const v = o.getState().serverState[e];
      return !!(v && Y(v, Ne(e)));
    }
  };
  function a(v, n = [], S) {
    const H = n.map(String).join(".");
    y.get(H);
    const O = function() {
      return o().getNestedState(e, n);
    };
    Object.keys(I).forEach((h) => {
      O[h] = I[h];
    });
    const U = {
      apply(h, d, ce) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(e, n);
      },
      get(h, d) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
        const ce = /* @__PURE__ */ new Set([
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
        if (d !== "then" && !d.startsWith("$") && d !== "stateMapNoRender" && !ce.has(d)) {
          const u = `${e}////${m}`, t = o.getState().stateComponents.get(e);
          if (t) {
            const r = t.components.get(u);
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
        if (d === "getDifferences")
          return () => we(
            o.getState().cogsStateStore[e],
            o.getState().initialStateGlobal[e]
          );
        if (d === "sync" && n.length === 0)
          return async function() {
            const u = o.getState().getInitialOptions(e), t = u?.sync;
            if (!t)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const r = o.getState().getNestedState(e, []), s = u?.validation?.key;
            try {
              const i = await t.action(r);
              if (i && !i.success && i.errors && s) {
                o.getState().removeValidationError(s), i.errors.forEach((l) => {
                  const T = [s, ...l.path].join(".");
                  o.getState().addValidationError(T, l.message);
                });
                const g = o.getState().stateComponents.get(e);
                g && g.components.forEach((l) => {
                  l.forceUpdate();
                });
              }
              return i?.success && t.onSuccess ? t.onSuccess(i.data) : !i?.success && t.onError && t.onError(i.error), i;
            } catch (i) {
              return t.onError && t.onError(i), { success: !1, error: i };
            }
          };
        if (d === "_status") {
          const u = o.getState().getNestedState(e, n), t = o.getState().initialStateGlobal[e], r = Z(t, n);
          return Y(u, r) ? "fresh" : "stale";
        }
        if (d === "getStatus")
          return function() {
            const u = o().getNestedState(
              e,
              n
            ), t = o.getState().initialStateGlobal[e], r = Z(t, n);
            return Y(u, r) ? "fresh" : "stale";
          };
        if (d === "removeStorage")
          return () => {
            const u = o.getState().initialStateGlobal[e], t = re(e), r = K(t?.localStorage?.key) ? t?.localStorage?.key(u) : t?.localStorage?.key, s = `${f}-${e}-${r}`;
            s && localStorage.removeItem(s);
          };
        if (d === "showValidationErrors")
          return () => {
            const u = o.getState().getInitialOptions(e)?.validation;
            if (!u?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(u.key + "." + n.join("."));
          };
        if (Array.isArray(v)) {
          const u = () => S?.validIndices ? v.map((r, s) => ({
            item: r,
            originalIndex: S.validIndices[s]
          })) : o.getState().getNestedState(e, n).map((r, s) => ({
            item: r,
            originalIndex: s
          }));
          if (d === "getSelected")
            return () => {
              const t = o.getState().getSelectedIndex(e, n.join("."));
              if (t !== void 0)
                return a(
                  v[t],
                  [...n, t.toString()],
                  S
                );
            };
          if (d === "clearSelected")
            return () => {
              o.getState().clearSelectedIndex({ stateKey: e, path: n });
            };
          if (d === "getSelectedIndex")
            return () => o.getState().getSelectedIndex(e, n.join(".")) ?? -1;
          if (d === "useVirtualView")
            return (t) => {
              const {
                itemHeight: r = 50,
                overscan: s = 5,
                stickToBottom: i = !1
              } = t, g = X(null), [l, T] = te({
                startIndex: 0,
                endIndex: 10
              }), w = X(i), [b, N] = te(0), x = X(!1), P = X(0);
              se(() => {
                let $ = 0;
                return o.getState().subscribeToShadowState(e, () => {
                  $++, $ <= 5 && console.log(
                    `[VirtualView] Shadow update #${$}`
                  ), N((L) => L + 1);
                });
              }, [e]);
              const D = o().getNestedState(
                e,
                n
              ), C = D.length;
              console.log(
                `[VirtualView] Initial setup - totalCount: ${C}, itemHeight: ${r}, stickToBottom: ${i}`
              ), C !== P.current && (console.log(
                `[VirtualView] Array size changed from ${P.current} to ${C}`
              ), x.current = !1, P.current = C);
              const { totalHeight: M, positions: E, visibleMeasured: _ } = pe(() => {
                const $ = o.getState().getShadowMetadata(e, n) || [];
                let A = 0;
                const L = [];
                let B = 0, q = 0;
                for (let G = 0; G < C; G++) {
                  L[G] = A;
                  const de = $[G]?.virtualizer?.itemHeight;
                  de && (B++, G >= l.startIndex && G < l.endIndex && q++), A += de || r;
                }
                const J = l.endIndex - l.startIndex, le = q === J && J > 0;
                return console.log(
                  `[VirtualView] Heights calc - measured: ${B}/${C}, visible measured: ${q}/${J}, totalHeight: ${A}`
                ), {
                  totalHeight: A,
                  positions: L,
                  visibleMeasured: le
                };
              }, [
                C,
                e,
                n.join("."),
                r,
                b,
                l
                // Add range dependency
              ]), W = pe(() => {
                const $ = Math.max(0, l.startIndex), A = Math.min(C, l.endIndex);
                console.log(
                  `[VirtualView] Creating virtual slice - range: ${$}-${A} (${A - $} items)`
                );
                const L = Array.from(
                  { length: A - $ },
                  (q, J) => $ + J
                ), B = L.map((q) => D[q]);
                return a(B, n, {
                  ...S,
                  validIndices: L
                });
              }, [l.startIndex, l.endIndex, D, C]);
              ge(() => {
                const $ = g.current;
                if (!$) return;
                const A = () => {
                  if (!$) return;
                  const { scrollTop: B } = $;
                  let q = 0, J = C - 1;
                  for (; q <= J; ) {
                    const ve = Math.floor((q + J) / 2);
                    E[ve] < B ? q = ve + 1 : J = ve - 1;
                  }
                  const le = Math.max(0, J - s);
                  let G = le;
                  const de = B + $.clientHeight;
                  for (; G < C && E[G] < de; )
                    G++;
                  G = Math.min(C, G + s), T({ startIndex: le, endIndex: G });
                }, L = () => {
                  w.current = $.scrollHeight - $.scrollTop - $.clientHeight < 1, A();
                };
                if ($.addEventListener("scroll", L, {
                  passive: !0
                }), i && !x.current && C > 0)
                  if (_ || l.endIndex === C)
                    console.log(
                      `[VirtualView] Scrolling to bottom - visible measured: ${_}, at end: ${l.endIndex === C}`
                    ), x.current = !0, setTimeout(() => {
                      $.scrollTo({
                        top: $.scrollHeight + 1e3,
                        behavior: "auto"
                      }), w.current = !0;
                    }, 0);
                  else {
                    console.log(
                      "[VirtualView] Jumping near bottom to trigger measurements"
                    );
                    const B = Math.max(
                      0,
                      (C - 20) * r
                    );
                    $.scrollTo({
                      top: B,
                      behavior: "auto"
                    });
                  }
                return A(), () => {
                  $.removeEventListener("scroll", L);
                };
              }, [
                C,
                E,
                i,
                _,
                l.endIndex
              ]);
              const V = Ee(
                ($ = "smooth") => {
                  g.current && (w.current = !0, g.current.scrollTo({
                    top: g.current.scrollHeight,
                    behavior: $
                  }));
                },
                []
              ), F = Ee(
                ($, A = "smooth") => {
                  g.current && E[$] !== void 0 && (w.current = !1, g.current.scrollTo({
                    top: E[$],
                    behavior: A
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
                    height: `${M}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${E[l.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: W,
                virtualizerProps: j,
                scrollToBottom: V,
                scrollToIndex: F
              };
            };
          if (d === "stateSort")
            return (t) => {
              const s = [...u()].sort(
                (l, T) => t(l.item, T.item)
              ), i = s.map(({ item: l }) => l), g = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: l }) => l
                )
              };
              return a(i, n, g);
            };
          if (d === "stateFilter")
            return (t) => {
              const s = u().filter(
                ({ item: l }, T) => t(l, T)
              ), i = s.map(({ item: l }) => l), g = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: l }) => l
                )
              };
              return a(i, n, g);
            };
          if (d === "stateMap")
            return (t) => {
              const r = o.getState().getNestedState(e, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (i, g) => g)).map((i, g) => {
                const l = r[i], T = [...n, i.toString()], w = a(l, T, S);
                return t(l, w, {
                  register: () => {
                    const [, N] = te({}), x = `${m}-${n.join(".")}-${i}`;
                    ge(() => {
                      const P = `${e}////${x}`, D = o.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return D.components.set(P, {
                        forceUpdate: () => N({}),
                        paths: /* @__PURE__ */ new Set([T.join(".")])
                      }), o.getState().stateComponents.set(e, D), () => {
                        const C = o.getState().stateComponents.get(e);
                        C && C.components.delete(P);
                      };
                    }, [e, x]);
                  },
                  index: g,
                  originalIndex: i
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                r
              ), null);
            };
          if (d === "stateMapNoRender")
            return (t) => v.map((s, i) => {
              let g;
              S?.validIndices && S.validIndices[i] !== void 0 ? g = S.validIndices[i] : g = i;
              const l = [...n, g.toString()], T = a(s, l, S);
              return t(
                s,
                T,
                i,
                v,
                a(v, n, S)
              );
            });
          if (d === "$stateMap")
            return (t) => ie(Ye, {
              proxy: {
                _stateKey: e,
                _path: n,
                _mapFn: t
                // Pass the actual function, not string
              },
              rebuildStateShape: a
            });
          if (d === "stateList")
            return (t) => {
              const r = o.getState().getNestedState(e, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (i, g) => g)).map((i, g) => {
                const l = r[i], T = [...n, i.toString()], w = a(l, T, S), b = `${m}-${n.join(".")}-${i}`;
                return ie(Xe, {
                  key: i,
                  stateKey: e,
                  itemComponentId: b,
                  itemPath: T,
                  children: t(
                    l,
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
          if (d === "stateFlattenOn")
            return (t) => {
              const r = v;
              y.clear(), k++;
              const s = r.flatMap(
                (i) => i[t] ?? []
              );
              return a(
                s,
                [...n, "[*]", t],
                S
              );
            };
          if (d === "index")
            return (t) => {
              const r = v[t];
              return a(r, [...n, t.toString()]);
            };
          if (d === "last")
            return () => {
              const t = o.getState().getNestedState(e, n);
              if (t.length === 0) return;
              const r = t.length - 1, s = t[r], i = [...n, r.toString()];
              return a(s, i);
            };
          if (d === "insert")
            return (t) => (p(n), ye(c, t, n, e), a(
              o.getState().getNestedState(e, n),
              n
            ));
          if (d === "uniqueInsert")
            return (t, r, s) => {
              const i = o.getState().getNestedState(e, n), g = K(t) ? t(i) : t;
              let l = null;
              if (!i.some((w) => {
                if (r) {
                  const N = r.every(
                    (x) => Y(w[x], g[x])
                  );
                  return N && (l = w), N;
                }
                const b = Y(w, g);
                return b && (l = w), b;
              }))
                p(n), ye(c, g, n, e);
              else if (s && l) {
                const w = s(l), b = i.map(
                  (N) => Y(N, l) ? w : N
                );
                p(n), ae(c, b, n);
              }
            };
          if (d === "cut")
            return (t, r) => {
              if (!r?.waitForSync)
                return p(n), ue(c, n, e, t), a(
                  o.getState().getNestedState(e, n),
                  n
                );
            };
          if (d === "cutByValue")
            return (t) => {
              for (let r = 0; r < v.length; r++)
                v[r] === t && ue(c, n, e, r);
            };
          if (d === "toggleByValue")
            return (t) => {
              const r = v.findIndex((s) => s === t);
              r > -1 ? ue(c, n, e, r) : ye(c, t, n, e);
            };
          if (d === "stateFind")
            return (t) => {
              const s = u().find(
                ({ item: g }, l) => t(g, l)
              );
              if (!s) return;
              const i = [...n, s.originalIndex.toString()];
              return a(s.item, i, S);
            };
          if (d === "findWith")
            return (t, r) => {
              const i = u().find(
                ({ item: l }) => l[t] === r
              );
              if (!i) return;
              const g = [...n, i.originalIndex.toString()];
              return a(i.item, g, S);
            };
        }
        const ee = n[n.length - 1];
        if (!isNaN(Number(ee))) {
          const u = n.slice(0, -1), t = o.getState().getNestedState(e, u);
          if (Array.isArray(t) && d === "cut")
            return () => ue(
              c,
              u,
              e,
              Number(ee)
            );
        }
        if (d === "get")
          return () => {
            if (S?.validIndices && Array.isArray(v)) {
              const u = o.getState().getNestedState(e, n);
              return S.validIndices.map((t) => u[t]);
            }
            return o.getState().getNestedState(e, n);
          };
        if (d === "$derive")
          return (u) => Ce({
            _stateKey: e,
            _path: n,
            _effect: u.toString()
          });
        if (d === "$get")
          return () => Ce({
            _stateKey: e,
            _path: n
          });
        if (d === "lastSynced") {
          const u = `${e}:${n.join(".")}`;
          return o.getState().getSyncInfo(u);
        }
        if (d == "getLocalStorage")
          return (u) => me(f + "-" + e + "-" + u);
        if (d === "_selected") {
          const u = n.slice(0, -1), t = u.join("."), r = o.getState().getNestedState(e, u);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(e, t) : void 0;
        }
        if (d === "setSelected")
          return (u) => {
            const t = n.slice(0, -1), r = Number(n[n.length - 1]), s = t.join(".");
            u ? o.getState().setSelectedIndex(e, s, r) : o.getState().setSelectedIndex(e, s, void 0);
            const i = o.getState().getNestedState(e, [...t]);
            ae(c, i, t), p(t);
          };
        if (d === "toggleSelected")
          return () => {
            const u = n.slice(0, -1), t = Number(n[n.length - 1]), r = u.join("."), s = o.getState().getSelectedIndex(e, r);
            o.getState().setSelectedIndex(
              e,
              r,
              s === t ? void 0 : t
            );
            const i = o.getState().getNestedState(e, [...u]);
            ae(c, i, u), p(u);
          };
        if (n.length == 0) {
          if (d === "applyJsonPatch")
            return (u) => {
              const t = o.getState().cogsStateStore[e], s = De(t, u).newDocument;
              Pe(
                e,
                o.getState().initialStateGlobal[e],
                s,
                c,
                m,
                f
              );
              const i = o.getState().stateComponents.get(e);
              if (i) {
                const g = we(t, s), l = new Set(g);
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
                      for (const x of l) {
                        if (w.paths.has(x)) {
                          b = !0;
                          break;
                        }
                        let P = x.lastIndexOf(".");
                        for (; P !== -1; ) {
                          const D = x.substring(0, P);
                          if (w.paths.has(D)) {
                            b = !0;
                            break;
                          }
                          const C = x.substring(
                            P + 1
                          );
                          if (!isNaN(Number(C))) {
                            const M = D.lastIndexOf(".");
                            if (M !== -1) {
                              const E = D.substring(
                                0,
                                M
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
                      const x = w.depsFunction(s);
                      let P = !1;
                      typeof x == "boolean" ? x && (P = !0) : Y(w.deps, x) || (w.deps = x, P = !0), P && (b = !0);
                    }
                    b && w.forceUpdate();
                  }
                }
              }
            };
          if (d === "validateZodSchema")
            return () => {
              const u = o.getState().getInitialOptions(e)?.validation, t = o.getState().addValidationError;
              if (!u?.zodSchema)
                throw new Error("Zod schema not found");
              if (!u?.key)
                throw new Error("Validation key not found");
              Q(u.key);
              const r = o.getState().cogsStateStore[e];
              try {
                const s = o.getState().getValidationErrors(u.key);
                s && s.length > 0 && s.forEach(([g]) => {
                  g && g.startsWith(u.key) && Q(g);
                });
                const i = u.zodSchema.safeParse(r);
                return i.success ? !0 : (i.error.errors.forEach((l) => {
                  const T = l.path, w = l.message, b = [u.key, ...T].join(".");
                  t(b, w);
                }), he(e), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (d === "_componentId") return m;
          if (d === "getComponents")
            return () => o().stateComponents.get(e);
          if (d === "getAllFormRefs")
            return () => Ve.getState().getFormRefsByStateKey(e);
          if (d === "_initialState")
            return o.getState().initialStateGlobal[e];
          if (d === "_serverState")
            return o.getState().serverState[e];
          if (d === "_isLoading")
            return o.getState().isLoadingGlobal[e];
          if (d === "revertToInitialState")
            return I.revertToInitialState;
          if (d === "updateInitialState") return I.updateInitialState;
          if (d === "removeValidation") return I.removeValidation;
        }
        if (d === "getFormRef")
          return () => Ve.getState().getFormRef(e + "." + n.join("."));
        if (d === "validationWrapper")
          return ({
            children: u,
            hideMessage: t
          }) => /* @__PURE__ */ Ie(
            Oe,
            {
              formOpts: t ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: o.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: S?.validIndices,
              children: u
            }
          );
        if (d === "_stateKey") return e;
        if (d === "_path") return n;
        if (d === "_isServerSynced") return I._isServerSynced;
        if (d === "update")
          return (u, t) => {
            if (t?.debounce)
              je(() => {
                ae(c, u, n, "");
                const r = o.getState().getNestedState(e, n);
                t?.afterUpdate && t.afterUpdate(r);
              }, t.debounce);
            else {
              ae(c, u, n, "");
              const r = o.getState().getNestedState(e, n);
              t?.afterUpdate && t.afterUpdate(r);
            }
            p(n);
          };
        if (d === "formElement")
          return (u, t) => /* @__PURE__ */ Ie(
            Ue,
            {
              setState: c,
              stateKey: e,
              path: n,
              child: u,
              formOpts: t
            }
          );
        const R = [...n, d], oe = o.getState().getNestedState(e, R);
        return a(oe, R, S);
      }
    }, z = new Proxy(O, U);
    return y.set(H, {
      proxy: z,
      stateVersion: k
    }), z;
  }
  return a(
    o.getState().getNestedState(e, [])
  );
}
function Ce(e) {
  return ie(Ze, { proxy: e });
}
function Ye({
  proxy: e,
  rebuildStateShape: c
}) {
  const m = o().getNestedState(e._stateKey, e._path);
  return Array.isArray(m) ? c(
    m,
    e._path
  ).stateMapNoRender(
    (y, k, p, I, a) => e._mapFn(y, k, p, I, a)
  ) : null;
}
function Ze({
  proxy: e
}) {
  const c = X(null), m = `${e._stateKey}-${e._path.join(".")}`;
  return se(() => {
    const f = c.current;
    if (!f || !f.parentElement) return;
    const y = f.parentElement, p = Array.from(y.childNodes).indexOf(f);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: p,
      effect: e._effect
    };
    o.getState().addSignalElement(m, v);
    const n = o.getState().getNestedState(e._stateKey, e._path);
    let S;
    if (e._effect)
      try {
        S = new Function(
          "state",
          `return (${e._effect})(state)`
        )(n);
      } catch (O) {
        console.error("Error evaluating effect function during mount:", O), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const H = document.createTextNode(String(S));
    f.replaceWith(H);
  }, [e._stateKey, e._path.join("."), e._effect]), ie("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function gt(e) {
  const c = _e(
    (m) => {
      const f = o.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(e._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => f.components.delete(e._stateKey);
    },
    () => o.getState().getNestedState(e._stateKey, e._path)
  );
  return ie("text", {}, String(c));
}
function Xe({
  stateKey: e,
  itemComponentId: c,
  itemPath: m,
  children: f
}) {
  const [, y] = te({}), [k, p] = We(), I = X(null);
  return se(() => {
    p.height > 0 && p.height !== I.current && (I.current = p.height, o.getState().setShadowMetadata(e, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, e, m]), ge(() => {
    const a = `${e}////${c}`, v = o.getState().stateComponents.get(e) || {
      components: /* @__PURE__ */ new Map()
    };
    return v.components.set(a, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), o.getState().stateComponents.set(e, v), () => {
      const n = o.getState().stateComponents.get(e);
      n && n.components.delete(a);
    };
  }, [e, c, m.join(".")]), /* @__PURE__ */ Ie("div", { ref: k, children: f });
}
export {
  Ce as $cogsSignal,
  gt as $cogsSignalStore,
  lt as addStateOptions,
  dt as createCogsState,
  ut as notifyComponent,
  Je as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
