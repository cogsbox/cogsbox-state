"use client";
import { jsx as Ie } from "react/jsx-runtime";
import { useState as ee, useRef as J, useEffect as oe, useLayoutEffect as ie, useMemo as pe, createElement as ce, useSyncExternalStore as Oe, startTransition as Re, useCallback as $e } from "react";
import { transformStateFunc as Ue, isDeepEqual as B, isFunction as X, getNestedValue as q, getDifferences as we, debounce as je } from "./utility.js";
import { pushFunc as ye, updateFn as se, cutFunc as ue, ValidationWrapper as Fe, FormControlComponent as De } from "./Functions.jsx";
import Le from "superjson";
import { v4 as Ee } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as ke } from "./store.js";
import { useCogsConfig as Pe } from "./CogsStateClient.jsx";
import { applyPatch as Ge } from "fast-json-patch";
import We from "react-use-measure";
function Ne(e, i) {
  const S = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, y = S(e) || {};
  g(e, {
    ...y,
    ...i
  });
}
function be({
  stateKey: e,
  options: i,
  initialOptionsPart: S
}) {
  const g = re(e) || {}, y = S[e] || {}, b = r.getState().setInitialStateOptions, w = { ...y, ...g };
  let I = !1;
  if (i)
    for (const a in i)
      w.hasOwnProperty(a) ? (a == "localStorage" && i[a] && w[a].key !== i[a]?.key && (I = !0, w[a] = i[a]), a == "initialState" && i[a] && w[a] !== i[a] && // Different references
      !B(w[a], i[a]) && (I = !0, w[a] = i[a])) : (I = !0, w[a] = i[a]);
  I && b(e, w);
}
function ut(e, { formElements: i, validation: S }) {
  return { initialState: e, formElements: i, validation: S };
}
const gt = (e, i) => {
  let S = e;
  const [g, y] = Ue(S);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, re(I) || r.getState().setInitialStateOptions(I, y[I]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const b = (I, a) => {
    const [v] = ee(a?.componentId ?? Ee());
    be({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = r.getState().cogsStateStore[I] || g[I], f = a?.modifyState ? a.modifyState(n) : n, [W, U] = Ze(
      f,
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
    return U;
  };
  function w(I, a) {
    be({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Je(I, a), me(I);
  }
  return { useCogsState: b, setCogsOptions: w };
}, {
  setUpdaterState: ge,
  setState: te,
  getInitialOptions: re,
  getKeyState: Ve,
  getValidationErrors: He,
  setStateLog: ze,
  updateInitialStateGlobal: Ae,
  addValidationError: Be,
  removeValidationError: Z,
  setServerSyncActions: qe
} = r.getState(), Ce = (e, i, S, g, y) => {
  S?.log && console.log(
    "saving to localstorage",
    i,
    S.localStorage?.key,
    g
  );
  const b = X(S?.localStorage?.key) ? S.localStorage?.key(e) : S?.localStorage?.key;
  if (b && g) {
    const w = `${g}-${i}-${b}`;
    let I;
    try {
      I = Se(w)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = Le.serialize(a);
    window.localStorage.setItem(
      w,
      JSON.stringify(v.json)
    );
  }
}, Se = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Je = (e, i) => {
  const S = r.getState().cogsStateStore[e], { sessionId: g } = Pe(), y = X(i?.localStorage?.key) ? i.localStorage.key(S) : i?.localStorage?.key;
  if (y && g) {
    const b = Se(
      `${g}-${e}-${y}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return te(e, b.state), me(e), !0;
  }
  return !1;
}, _e = (e, i, S, g, y, b) => {
  const w = {
    initialState: i,
    updaterState: fe(
      e,
      g,
      y,
      b
    ),
    state: S
  };
  Ae(e, w.initialState), ge(e, w.updaterState), te(e, w.state);
}, me = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const S = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || S.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((g) => g());
  });
}, ft = (e, i) => {
  const S = r.getState().stateComponents.get(e);
  if (S) {
    const g = `${e}////${i}`, y = S.components.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Ye = (e, i, S, g) => {
  switch (e) {
    case "update":
      return {
        oldValue: q(i, g),
        newValue: q(S, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: q(S, g)
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
function Ze(e, {
  stateKey: i,
  serverSync: S,
  localStorage: g,
  formElements: y,
  reactiveDeps: b,
  reactiveType: w,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: f
} = {}) {
  const [W, U] = ee({}), { sessionId: j } = Pe();
  let H = !i;
  const [m] = ee(i ?? Ee()), l = r.getState().stateLog[m], le = J(/* @__PURE__ */ new Set()), Q = J(I ?? Ee()), _ = J(
    null
  );
  _.current = re(m) ?? null, oe(() => {
    if (v && v.stateKey === m && v.path?.[0]) {
      te(m, (o) => ({
        ...o,
        [v.path[0]]: v.newValue
      }));
      const t = `${v.stateKey}:${v.path.join(".")}`;
      r.getState().setSyncInfo(t, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), oe(() => {
    if (a) {
      Ne(m, {
        initialState: a
      });
      const t = _.current, s = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = r.getState().initialStateGlobal[m];
      if (!(c && !B(c, a) || !c) && !s)
        return;
      let d = null;
      const p = X(t?.localStorage?.key) ? t?.localStorage?.key(a) : t?.localStorage?.key;
      p && j && (d = Se(`${j}-${m}-${p}`));
      let E = a, A = !1;
      const V = s ? Date.now() : 0, P = d?.lastUpdated || 0, M = d?.lastSyncedWithServer || 0;
      s && V > P ? (E = t.serverState.data, A = !0) : d && P > M && (E = d.state, t?.localStorage?.onChange && t?.localStorage?.onChange(E)), r.getState().initializeShadowState(m, a), _e(
        m,
        a,
        E,
        ae,
        Q.current,
        j
      ), A && p && j && Ce(E, m, t, j, Date.now()), me(m), (Array.isArray(w) ? w : [w || "component"]).includes("none") || U({});
    }
  }, [
    a,
    f?.status,
    f?.data,
    ...n || []
  ]), ie(() => {
    H && Ne(m, {
      serverSync: S,
      formElements: y,
      initialState: a,
      localStorage: g,
      middleware: _.current?.middleware
    });
    const t = `${m}////${Q.current}`, o = r.getState().stateComponents.get(m) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(t, {
      forceUpdate: () => U({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), r.getState().stateComponents.set(m, o), U({}), () => {
      o && (o.components.delete(t), o.components.size === 0 && r.getState().stateComponents.delete(m));
    };
  }, []);
  const ae = (t, o, s, c) => {
    if (Array.isArray(o)) {
      const d = `${m}-${o.join(".")}`;
      le.current.add(d);
    }
    const h = r.getState();
    te(m, (d) => {
      const p = X(t) ? t(d) : t, E = `${m}-${o.join(".")}`;
      if (E) {
        let T = !1, C = h.signalDomElements.get(E);
        if ((!C || C.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const x = o.slice(0, -1), L = q(p, x);
          if (Array.isArray(L)) {
            T = !0;
            const k = `${m}-${x.join(".")}`;
            C = h.signalDomElements.get(k);
          }
        }
        if (C) {
          const x = T ? q(p, o.slice(0, -1)) : q(p, o);
          C.forEach(({ parentId: L, position: k, effect: F }) => {
            const O = document.querySelector(
              `[data-parent-id="${L}"]`
            );
            if (O) {
              const $ = Array.from(O.childNodes);
              if ($[k]) {
                const N = F ? new Function("state", `return (${F})(state)`)(x) : x;
                $[k].textContent = String(N);
              }
            }
          });
        }
      }
      console.log("shadowState", h.shadowStateStore), s.updateType === "update" && (c || _.current?.validation?.key) && o && Z(
        (c || _.current?.validation?.key) + "." + o.join(".")
      );
      const A = o.slice(0, o.length - 1);
      s.updateType === "cut" && _.current?.validation?.key && Z(
        _.current?.validation?.key + "." + A.join(".")
      ), s.updateType === "insert" && _.current?.validation?.key && He(
        _.current?.validation?.key + "." + A.join(".")
      ).filter(([C, x]) => {
        let L = C?.split(".").length;
        if (C == A.join(".") && L == A.length - 1) {
          let k = C + "." + A;
          Z(C), Be(k, x);
        }
      });
      const V = h.stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", V), V) {
        const T = we(d, p), C = new Set(T), x = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          L,
          k
        ] of V.components.entries()) {
          let F = !1;
          const O = Array.isArray(k.reactiveType) ? k.reactiveType : [k.reactiveType || "component"];
          if (console.log("component", k), !O.includes("none")) {
            if (O.includes("all")) {
              k.forceUpdate();
              continue;
            }
            if (O.includes("component") && ((k.paths.has(x) || k.paths.has("")) && (F = !0), !F))
              for (const $ of C) {
                let N = $;
                for (; ; ) {
                  if (k.paths.has(N)) {
                    F = !0;
                    break;
                  }
                  const D = N.lastIndexOf(".");
                  if (D !== -1) {
                    const R = N.substring(
                      0,
                      D
                    );
                    if (!isNaN(
                      Number(N.substring(D + 1))
                    ) && k.paths.has(R)) {
                      F = !0;
                      break;
                    }
                    N = R;
                  } else
                    N = "";
                  if (N === "")
                    break;
                }
                if (F) break;
              }
            if (!F && O.includes("deps") && k.depsFunction) {
              const $ = k.depsFunction(p);
              let N = !1;
              typeof $ == "boolean" ? $ && (N = !0) : B(k.deps, $) || (k.deps = $, N = !0), N && (F = !0);
            }
            F && k.forceUpdate();
          }
        }
      }
      const P = Date.now();
      o = o.map((T, C) => {
        const x = o.slice(0, -1), L = q(p, x);
        return C === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (L.length - 1).toString() : T;
      });
      const { oldValue: M, newValue: G } = Ye(
        s.updateType,
        d,
        p,
        o
      ), z = {
        timeStamp: P,
        stateKey: m,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: M,
        newValue: G
      };
      switch (s.updateType) {
        case "update":
          h.updateShadowAtPath(m, o, p);
          break;
        case "insert":
          const T = o.slice(0, -1);
          h.insertShadowArrayElement(m, T, G);
          break;
        case "cut":
          const C = o.slice(0, -1), x = parseInt(o[o.length - 1]);
          h.removeShadowArrayElement(m, C, x);
          break;
      }
      if (ze(m, (T) => {
        const x = [...T ?? [], z].reduce((L, k) => {
          const F = `${k.stateKey}:${JSON.stringify(k.path)}`, O = L.get(F);
          return O ? (O.timeStamp = Math.max(O.timeStamp, k.timeStamp), O.newValue = k.newValue, O.oldValue = O.oldValue ?? k.oldValue, O.updateType = k.updateType) : L.set(F, { ...k }), L;
        }, /* @__PURE__ */ new Map());
        return Array.from(x.values());
      }), Ce(
        p,
        m,
        _.current,
        j
      ), _.current?.middleware && _.current.middleware({
        updateLog: l,
        update: z
      }), _.current?.serverSync) {
        const T = h.serverState[m], C = _.current?.serverSync;
        qe(m, {
          syncKey: typeof C.syncKey == "string" ? C.syncKey : C.syncKey({ state: p }),
          rollBackState: T,
          actionTimeStamp: Date.now() + (C.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return p;
    });
  };
  r.getState().updaterState[m] || (ge(
    m,
    fe(
      m,
      ae,
      Q.current,
      j
    )
  ), r.getState().cogsStateStore[m] || te(m, e), r.getState().initialStateGlobal[m] || Ae(m, e));
  const u = pe(() => fe(
    m,
    ae,
    Q.current,
    j
  ), [m, j]);
  return [Ve(m), u];
}
function fe(e, i, S, g) {
  const y = /* @__PURE__ */ new Map();
  let b = 0;
  const w = (v) => {
    const n = v.join(".");
    for (const [f] of y)
      (f === n || f.startsWith(n + ".")) && y.delete(f);
    b++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && Z(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = r.getState().getInitialOptions(e)?.validation;
      n?.key && Z(n?.key), v?.validationKey && Z(v.validationKey);
      const f = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), y.clear(), b++;
      const W = a(f, []), U = re(e), j = X(U?.localStorage?.key) ? U?.localStorage?.key(f) : U?.localStorage?.key, H = `${g}-${e}-${j}`;
      H && localStorage.removeItem(H), ge(e, W), te(e, f);
      const m = r.getState().stateComponents.get(e);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), f;
    },
    updateInitialState: (v) => {
      y.clear(), b++;
      const n = fe(
        e,
        i,
        S,
        g
      ), f = r.getState().initialStateGlobal[e], W = re(e), U = X(W?.localStorage?.key) ? W?.localStorage?.key(f) : W?.localStorage?.key, j = `${g}-${e}-${U}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), Re(() => {
        Ae(e, v), r.getState().initializeShadowState(e, v), ge(e, n), te(e, v);
        const H = r.getState().stateComponents.get(e);
        H && H.components.forEach((m) => {
          m.forceUpdate();
        });
      }), {
        fetchId: (H) => n.get()[H]
      };
    },
    _initialState: r.getState().initialStateGlobal[e],
    _serverState: r.getState().serverState[e],
    _isLoading: r.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const v = r.getState().serverState[e];
      return !!(v && B(v, Ve(e)));
    }
  };
  function a(v, n = [], f) {
    const W = n.map(String).join(".");
    y.get(W);
    const U = function() {
      return r().getNestedState(e, n);
    };
    Object.keys(I).forEach((m) => {
      U[m] = I[m];
    });
    const j = {
      apply(m, l, le) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, n);
      },
      get(m, l) {
        f?.validIndices && !Array.isArray(v) && (f = { ...f, validIndices: void 0 });
        const le = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !le.has(l)) {
          const u = `${e}////${S}`, t = r.getState().stateComponents.get(e);
          if (t) {
            const o = t.components.get(u);
            if (o && !o.paths.has("")) {
              const s = n.join(".");
              let c = !0;
              for (const h of o.paths)
                if (s.startsWith(h) && (s === h || s[h.length] === ".")) {
                  c = !1;
                  break;
                }
              c && o.paths.add(s);
            }
          }
        }
        if (l === "getDifferences")
          return () => we(
            r.getState().cogsStateStore[e],
            r.getState().initialStateGlobal[e]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const u = r.getState().getInitialOptions(e), t = u?.sync;
            if (!t)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const o = r.getState().getNestedState(e, []), s = u?.validation?.key;
            try {
              const c = await t.action(o);
              if (c && !c.success && c.errors && s) {
                r.getState().removeValidationError(s), c.errors.forEach((d) => {
                  const p = [s, ...d.path].join(".");
                  r.getState().addValidationError(p, d.message);
                });
                const h = r.getState().stateComponents.get(e);
                h && h.components.forEach((d) => {
                  d.forceUpdate();
                });
              }
              return c?.success && t.onSuccess ? t.onSuccess(c.data) : !c?.success && t.onError && t.onError(c.error), c;
            } catch (c) {
              return t.onError && t.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const u = r.getState().getNestedState(e, n), t = r.getState().initialStateGlobal[e], o = q(t, n);
          return B(u, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const u = r().getNestedState(
              e,
              n
            ), t = r.getState().initialStateGlobal[e], o = q(t, n);
            return B(u, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const u = r.getState().initialStateGlobal[e], t = re(e), o = X(t?.localStorage?.key) ? t?.localStorage?.key(u) : t?.localStorage?.key, s = `${g}-${e}-${o}`;
            s && localStorage.removeItem(s);
          };
        if (l === "showValidationErrors")
          return () => {
            const u = r.getState().getInitialOptions(e)?.validation;
            if (!u?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(u.key + "." + n.join("."));
          };
        if (Array.isArray(v)) {
          const u = () => f?.validIndices ? v.map((o, s) => ({
            item: o,
            originalIndex: f.validIndices[s]
          })) : r.getState().getNestedState(e, n).map((o, s) => ({
            item: o,
            originalIndex: s
          }));
          if (l === "getSelected")
            return () => {
              const t = r.getState().getSelectedIndex(e, n.join("."));
              if (t !== void 0)
                return a(
                  v[t],
                  [...n, t.toString()],
                  f
                );
            };
          if (l === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: e, path: n });
            };
          if (l === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(e, n.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (t) => {
              const {
                itemHeight: o = 50,
                overscan: s = 6,
                stickToBottom: c = !1,
                dependencies: h = []
              } = t, d = J(null), [p, E] = ee({
                startIndex: 0,
                endIndex: 10
              }), A = J(c), V = J(!1), P = J(0), [M, G] = ee(0);
              oe(() => r.getState().subscribeToShadowState(e, () => {
                G((N) => N + 1);
              }), [e]);
              const z = r().getNestedState(
                e,
                n
              ), T = z.length, { totalHeight: C, positions: x } = pe(() => {
                const $ = r.getState().getShadowMetadata(e, n) || [];
                let N = 0;
                const D = [];
                for (let R = 0; R < T; R++) {
                  D[R] = N;
                  const Y = $[R]?.virtualizer?.itemHeight;
                  N += Y || o;
                }
                return { totalHeight: N, positions: D };
              }, [
                T,
                e,
                n.join("."),
                o,
                M
              ]), L = pe(() => {
                const $ = Math.max(0, p.startIndex), N = Math.min(T, p.endIndex), D = Array.from(
                  { length: N - $ },
                  (Y, ne) => $ + ne
                ), R = D.map((Y) => z[Y]);
                return a(R, n, {
                  ...f,
                  validIndices: D
                });
              }, [p.startIndex, p.endIndex, z, T]);
              ie(() => {
                const $ = T > P.current;
                A.current && $ && (console.log(
                  "PHASE 1: Auto-scroll needed. Setting range to render the last item."
                ), E({
                  startIndex: Math.max(0, T - 10 - s),
                  endIndex: T
                })), P.current = T;
              }, [T]), ie(() => {
                const $ = d.current, N = p.endIndex === T && T > 0;
                if (!$ || !A.current || !N)
                  return;
                console.log(
                  "PHASE 2: Range is at the end. Starting the measurement loop."
                );
                let D = 0;
                const R = setInterval(() => {
                  D++, console.log(`LOOP ${D}: Checking last item...`);
                  const Y = T - 1, K = (r.getState().getShadowMetadata(e, n) || [])[Y]?.virtualizer?.itemHeight || 0;
                  K > 0 ? (console.log(
                    `%cSUCCESS: Last item height is ${K}. Scrolling now.`,
                    "color: green; font-weight: bold;"
                  ), clearInterval(R), V.current = !0, $.scrollTo({
                    top: $.scrollHeight,
                    behavior: "smooth"
                  }), setTimeout(() => {
                    V.current = !1;
                  }, 1e3)) : D > 20 ? (console.error(
                    "LOOP TIMEOUT: Last item was never measured. Stopping loop."
                  ), clearInterval(R)) : console.log("...WAITING. Height is not ready.");
                }, 100);
                return () => clearInterval(R);
              }, [p.endIndex, T, x]), oe(() => {
                const $ = d.current;
                if (!$) return;
                console.log(
                  "DEPENDENCY CHANGE: Resetting scroll lock and initial view."
                ), A.current = c;
                const N = () => {
                  const { scrollTop: R, clientHeight: Y } = $;
                  let ne = 0, K = T - 1;
                  for (; ne <= K; ) {
                    const ve = Math.floor((ne + K) / 2);
                    x[ve] < R ? ne = ve + 1 : K = ve - 1;
                  }
                  const he = Math.max(0, K - s);
                  let de = he;
                  const Me = R + Y;
                  for (; de < T && x[de] < Me; )
                    de++;
                  const Te = Math.min(T, de + s);
                  console.log(
                    `RANGE UPDATE: Start: ${he}, End: ${Te}, Total: ${T}`
                  ), E({ startIndex: he, endIndex: Te });
                }, D = () => {
                  if (V.current) return;
                  $.scrollHeight - $.scrollTop - $.clientHeight < 1 || (A.current = !1), N();
                };
                return $.addEventListener("scroll", D, {
                  passive: !0
                }), N(), () => $.removeEventListener("scroll", D);
              }, [...h, T, x]);
              const k = $e(
                ($ = "smooth") => {
                  d.current && (A.current = !0, d.current.scrollTo({
                    top: d.current.scrollHeight,
                    behavior: $
                  }));
                },
                []
              ), F = $e(
                ($, N = "smooth") => {
                  d.current && x[$] !== void 0 && (A.current = !1, d.current.scrollTo({
                    top: x[$],
                    behavior: N
                  }));
                },
                [x]
              ), O = {
                outer: {
                  ref: d,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${C}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${x[p.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: L,
                virtualizerProps: O,
                scrollToBottom: k,
                scrollToIndex: F
              };
            };
          if (l === "stateSort")
            return (t) => {
              const s = [...u()].sort(
                (d, p) => t(d.item, p.item)
              ), c = s.map(({ item: d }) => d), h = {
                ...f,
                validIndices: s.map(
                  ({ originalIndex: d }) => d
                )
              };
              return a(c, n, h);
            };
          if (l === "stateFilter")
            return (t) => {
              const s = u().filter(
                ({ item: d }, p) => t(d, p)
              ), c = s.map(({ item: d }) => d), h = {
                ...f,
                validIndices: s.map(
                  ({ originalIndex: d }) => d
                )
              };
              return a(c, n, h);
            };
          if (l === "stateMap")
            return (t) => {
              const o = r.getState().getNestedState(e, n);
              return Array.isArray(o) ? (f?.validIndices || Array.from({ length: o.length }, (c, h) => h)).map((c, h) => {
                const d = o[c], p = [...n, c.toString()], E = a(d, p, f);
                return t(d, E, {
                  register: () => {
                    const [, V] = ee({}), P = `${S}-${n.join(".")}-${c}`;
                    ie(() => {
                      const M = `${e}////${P}`, G = r.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return G.components.set(M, {
                        forceUpdate: () => V({}),
                        paths: /* @__PURE__ */ new Set([p.join(".")])
                      }), r.getState().stateComponents.set(e, G), () => {
                        const z = r.getState().stateComponents.get(e);
                        z && z.components.delete(M);
                      };
                    }, [e, P]);
                  },
                  index: h,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                o
              ), null);
            };
          if (l === "stateMapNoRender")
            return (t) => v.map((s, c) => {
              let h;
              f?.validIndices && f.validIndices[c] !== void 0 ? h = f.validIndices[c] : h = c;
              const d = [...n, h.toString()], p = a(s, d, f);
              return t(
                s,
                p,
                c,
                v,
                a(v, n, f)
              );
            });
          if (l === "$stateMap")
            return (t) => ce(Xe, {
              proxy: {
                _stateKey: e,
                _path: n,
                _mapFn: t
                // Pass the actual function, not string
              },
              rebuildStateShape: a
            });
          if (l === "stateList")
            return (t) => {
              const o = r.getState().getNestedState(e, n);
              return Array.isArray(o) ? (f?.validIndices || Array.from({ length: o.length }, (c, h) => h)).map((c, h) => {
                const d = o[c], p = [...n, c.toString()], E = a(d, p, f), A = `${S}-${n.join(".")}-${c}`;
                return ce(Ke, {
                  key: c,
                  stateKey: e,
                  itemComponentId: A,
                  itemPath: p,
                  children: t(
                    d,
                    E,
                    h,
                    o,
                    a(o, n, f)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (t) => {
              const o = v;
              y.clear(), b++;
              const s = o.flatMap(
                (c) => c[t] ?? []
              );
              return a(
                s,
                [...n, "[*]", t],
                f
              );
            };
          if (l === "index")
            return (t) => {
              const o = v[t];
              return a(o, [...n, t.toString()]);
            };
          if (l === "last")
            return () => {
              const t = r.getState().getNestedState(e, n);
              if (t.length === 0) return;
              const o = t.length - 1, s = t[o], c = [...n, o.toString()];
              return a(s, c);
            };
          if (l === "insert")
            return (t) => (w(n), ye(i, t, n, e), a(
              r.getState().getNestedState(e, n),
              n
            ));
          if (l === "uniqueInsert")
            return (t, o, s) => {
              const c = r.getState().getNestedState(e, n), h = X(t) ? t(c) : t;
              let d = null;
              if (!c.some((E) => {
                if (o) {
                  const V = o.every(
                    (P) => B(E[P], h[P])
                  );
                  return V && (d = E), V;
                }
                const A = B(E, h);
                return A && (d = E), A;
              }))
                w(n), ye(i, h, n, e);
              else if (s && d) {
                const E = s(d), A = c.map(
                  (V) => B(V, d) ? E : V
                );
                w(n), se(i, A, n);
              }
            };
          if (l === "cut")
            return (t, o) => {
              if (!o?.waitForSync)
                return w(n), ue(i, n, e, t), a(
                  r.getState().getNestedState(e, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (t) => {
              for (let o = 0; o < v.length; o++)
                v[o] === t && ue(i, n, e, o);
            };
          if (l === "toggleByValue")
            return (t) => {
              const o = v.findIndex((s) => s === t);
              o > -1 ? ue(i, n, e, o) : ye(i, t, n, e);
            };
          if (l === "stateFind")
            return (t) => {
              const s = u().find(
                ({ item: h }, d) => t(h, d)
              );
              if (!s) return;
              const c = [...n, s.originalIndex.toString()];
              return a(s.item, c, f);
            };
          if (l === "findWith")
            return (t, o) => {
              const c = u().find(
                ({ item: d }) => d[t] === o
              );
              if (!c) return;
              const h = [...n, c.originalIndex.toString()];
              return a(c.item, h, f);
            };
        }
        const Q = n[n.length - 1];
        if (!isNaN(Number(Q))) {
          const u = n.slice(0, -1), t = r.getState().getNestedState(e, u);
          if (Array.isArray(t) && l === "cut")
            return () => ue(
              i,
              u,
              e,
              Number(Q)
            );
        }
        if (l === "get")
          return () => {
            if (f?.validIndices && Array.isArray(v)) {
              const u = r.getState().getNestedState(e, n);
              return f.validIndices.map((t) => u[t]);
            }
            return r.getState().getNestedState(e, n);
          };
        if (l === "$derive")
          return (u) => xe({
            _stateKey: e,
            _path: n,
            _effect: u.toString()
          });
        if (l === "$get")
          return () => xe({
            _stateKey: e,
            _path: n
          });
        if (l === "lastSynced") {
          const u = `${e}:${n.join(".")}`;
          return r.getState().getSyncInfo(u);
        }
        if (l == "getLocalStorage")
          return (u) => Se(g + "-" + e + "-" + u);
        if (l === "_selected") {
          const u = n.slice(0, -1), t = u.join("."), o = r.getState().getNestedState(e, u);
          return Array.isArray(o) ? Number(n[n.length - 1]) === r.getState().getSelectedIndex(e, t) : void 0;
        }
        if (l === "setSelected")
          return (u) => {
            const t = n.slice(0, -1), o = Number(n[n.length - 1]), s = t.join(".");
            u ? r.getState().setSelectedIndex(e, s, o) : r.getState().setSelectedIndex(e, s, void 0);
            const c = r.getState().getNestedState(e, [...t]);
            se(i, c, t), w(t);
          };
        if (l === "toggleSelected")
          return () => {
            const u = n.slice(0, -1), t = Number(n[n.length - 1]), o = u.join("."), s = r.getState().getSelectedIndex(e, o);
            r.getState().setSelectedIndex(
              e,
              o,
              s === t ? void 0 : t
            );
            const c = r.getState().getNestedState(e, [...u]);
            se(i, c, u), w(u);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (u) => {
              const t = r.getState().cogsStateStore[e], s = Ge(t, u).newDocument;
              _e(
                e,
                r.getState().initialStateGlobal[e],
                s,
                i,
                S,
                g
              );
              const c = r.getState().stateComponents.get(e);
              if (c) {
                const h = we(t, s), d = new Set(h);
                for (const [
                  p,
                  E
                ] of c.components.entries()) {
                  let A = !1;
                  const V = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
                  if (!V.includes("none")) {
                    if (V.includes("all")) {
                      E.forceUpdate();
                      continue;
                    }
                    if (V.includes("component") && (E.paths.has("") && (A = !0), !A))
                      for (const P of d) {
                        if (E.paths.has(P)) {
                          A = !0;
                          break;
                        }
                        let M = P.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const G = P.substring(0, M);
                          if (E.paths.has(G)) {
                            A = !0;
                            break;
                          }
                          const z = P.substring(
                            M + 1
                          );
                          if (!isNaN(Number(z))) {
                            const T = G.lastIndexOf(".");
                            if (T !== -1) {
                              const C = G.substring(
                                0,
                                T
                              );
                              if (E.paths.has(C)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          M = G.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && V.includes("deps") && E.depsFunction) {
                      const P = E.depsFunction(s);
                      let M = !1;
                      typeof P == "boolean" ? P && (M = !0) : B(E.deps, P) || (E.deps = P, M = !0), M && (A = !0);
                    }
                    A && E.forceUpdate();
                  }
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const u = r.getState().getInitialOptions(e)?.validation, t = r.getState().addValidationError;
              if (!u?.zodSchema)
                throw new Error("Zod schema not found");
              if (!u?.key)
                throw new Error("Validation key not found");
              Z(u.key);
              const o = r.getState().cogsStateStore[e];
              try {
                const s = r.getState().getValidationErrors(u.key);
                s && s.length > 0 && s.forEach(([h]) => {
                  h && h.startsWith(u.key) && Z(h);
                });
                const c = u.zodSchema.safeParse(o);
                return c.success ? !0 : (c.error.errors.forEach((d) => {
                  const p = d.path, E = d.message, A = [u.key, ...p].join(".");
                  t(A, E);
                }), me(e), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return S;
          if (l === "getComponents")
            return () => r().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => ke.getState().getFormRefsByStateKey(e);
          if (l === "_initialState")
            return r.getState().initialStateGlobal[e];
          if (l === "_serverState")
            return r.getState().serverState[e];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[e];
          if (l === "revertToInitialState")
            return I.revertToInitialState;
          if (l === "updateInitialState") return I.updateInitialState;
          if (l === "removeValidation") return I.removeValidation;
        }
        if (l === "getFormRef")
          return () => ke.getState().getFormRef(e + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: u,
            hideMessage: t
          }) => /* @__PURE__ */ Ie(
            Fe,
            {
              formOpts: t ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: r.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: f?.validIndices,
              children: u
            }
          );
        if (l === "_stateKey") return e;
        if (l === "_path") return n;
        if (l === "_isServerSynced") return I._isServerSynced;
        if (l === "update")
          return (u, t) => {
            if (t?.debounce)
              je(() => {
                se(i, u, n, "");
                const o = r.getState().getNestedState(e, n);
                t?.afterUpdate && t.afterUpdate(o);
              }, t.debounce);
            else {
              se(i, u, n, "");
              const o = r.getState().getNestedState(e, n);
              t?.afterUpdate && t.afterUpdate(o);
            }
            w(n);
          };
        if (l === "formElement")
          return (u, t) => /* @__PURE__ */ Ie(
            De,
            {
              setState: i,
              stateKey: e,
              path: n,
              child: u,
              formOpts: t
            }
          );
        const _ = [...n, l], ae = r.getState().getNestedState(e, _);
        return a(ae, _, f);
      }
    }, H = new Proxy(U, j);
    return y.set(W, {
      proxy: H,
      stateVersion: b
    }), H;
  }
  return a(
    r.getState().getNestedState(e, [])
  );
}
function xe(e) {
  return ce(Qe, { proxy: e });
}
function Xe({
  proxy: e,
  rebuildStateShape: i
}) {
  const S = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(S) ? i(
    S,
    e._path
  ).stateMapNoRender(
    (y, b, w, I, a) => e._mapFn(y, b, w, I, a)
  ) : null;
}
function Qe({
  proxy: e
}) {
  const i = J(null), S = `${e._stateKey}-${e._path.join(".")}`;
  return oe(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const y = g.parentElement, w = Array.from(y.childNodes).indexOf(g);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: w,
      effect: e._effect
    };
    r.getState().addSignalElement(S, v);
    const n = r.getState().getNestedState(e._stateKey, e._path);
    let f;
    if (e._effect)
      try {
        f = new Function(
          "state",
          `return (${e._effect})(state)`
        )(n);
      } catch (U) {
        console.error("Error evaluating effect function during mount:", U), f = n;
      }
    else
      f = n;
    f !== null && typeof f == "object" && (f = JSON.stringify(f));
    const W = document.createTextNode(String(f));
    g.replaceWith(W);
  }, [e._stateKey, e._path.join("."), e._effect]), ce("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function St(e) {
  const i = Oe(
    (S) => {
      const g = r.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(e._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => g.components.delete(e._stateKey);
    },
    () => r.getState().getNestedState(e._stateKey, e._path)
  );
  return ce("text", {}, String(i));
}
function Ke({
  stateKey: e,
  itemComponentId: i,
  itemPath: S,
  children: g
}) {
  const [, y] = ee({}), [b, w] = We(), I = J(null);
  return oe(() => {
    w.height > 0 && w.height !== I.current && (I.current = w.height, r.getState().setShadowMetadata(e, S, {
      virtualizer: {
        itemHeight: w.height
      }
    }));
  }, [w.height, e, S]), ie(() => {
    const a = `${e}////${i}`, v = r.getState().stateComponents.get(e) || {
      components: /* @__PURE__ */ new Map()
    };
    return v.components.set(a, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set([S.join(".")])
    }), r.getState().stateComponents.set(e, v), () => {
      const n = r.getState().stateComponents.get(e);
      n && n.components.delete(a);
    };
  }, [e, i, S.join(".")]), /* @__PURE__ */ Ie("div", { ref: b, children: g });
}
export {
  xe as $cogsSignal,
  St as $cogsSignalStore,
  ut as addStateOptions,
  gt as createCogsState,
  ft as notifyComponent,
  Ze as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
