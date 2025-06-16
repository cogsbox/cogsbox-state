"use client";
import { jsx as ye } from "react/jsx-runtime";
import { useState as ee, useRef as J, useEffect as oe, useLayoutEffect as ie, useMemo as Ie, createElement as ce, useSyncExternalStore as Me, startTransition as Oe, useCallback as Te } from "react";
import { transformStateFunc as Re, isDeepEqual as B, isFunction as X, getNestedValue as q, getDifferences as pe, debounce as Ue } from "./utility.js";
import { pushFunc as ve, updateFn as se, cutFunc as ue, ValidationWrapper as je, FormControlComponent as Fe } from "./Functions.jsx";
import De from "superjson";
import { v4 as we } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as $e } from "./store.js";
import { useCogsConfig as xe } from "./CogsStateClient.jsx";
import { applyPatch as Le } from "fast-json-patch";
import We from "react-use-measure";
function ke(e, i) {
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
  const g = re(e) || {}, y = S[e] || {}, C = r.getState().setInitialStateOptions, w = { ...y, ...g };
  let I = !1;
  if (i)
    for (const a in i)
      w.hasOwnProperty(a) ? (a == "localStorage" && i[a] && w[a].key !== i[a]?.key && (I = !0, w[a] = i[a]), a == "initialState" && i[a] && w[a] !== i[a] && // Different references
      !B(w[a], i[a]) && (I = !0, w[a] = i[a])) : (I = !0, w[a] = i[a]);
  I && C(e, w);
}
function dt(e, { formElements: i, validation: S }) {
  return { initialState: e, formElements: i, validation: S };
}
const ut = (e, i) => {
  let S = e;
  const [g, y] = Re(S);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, re(I) || r.getState().setInitialStateOptions(I, y[I]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const C = (I, a) => {
    const [v] = ee(a?.componentId ?? we());
    be({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = r.getState().cogsStateStore[I] || g[I], f = a?.modifyState ? a.modifyState(n) : n, [G, U] = Ye(
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
    be({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && qe(I, a), me(I);
  }
  return { useCogsState: C, setCogsOptions: w };
}, {
  setUpdaterState: ge,
  setState: te,
  getInitialOptions: re,
  getKeyState: Ve,
  getValidationErrors: Ge,
  setStateLog: He,
  updateInitialStateGlobal: Ee,
  addValidationError: ze,
  removeValidationError: Z,
  setServerSyncActions: Be
} = r.getState(), Ce = (e, i, S, g, y) => {
  S?.log && console.log(
    "saving to localstorage",
    i,
    S.localStorage?.key,
    g
  );
  const C = X(S?.localStorage?.key) ? S.localStorage?.key(e) : S?.localStorage?.key;
  if (C && g) {
    const w = `${g}-${i}-${C}`;
    let I;
    try {
      I = Se(w)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = De.serialize(a);
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
}, qe = (e, i) => {
  const S = r.getState().cogsStateStore[e], { sessionId: g } = xe(), y = X(i?.localStorage?.key) ? i.localStorage.key(S) : i?.localStorage?.key;
  if (y && g) {
    const C = Se(
      `${g}-${e}-${y}`
    );
    if (C && C.lastUpdated > (C.lastSyncedWithServer || 0))
      return te(e, C.state), me(e), !0;
  }
  return !1;
}, Pe = (e, i, S, g, y, C) => {
  const w = {
    initialState: i,
    updaterState: fe(
      e,
      g,
      y,
      C
    ),
    state: S
  };
  Ee(e, w.initialState), ge(e, w.updaterState), te(e, w.state);
}, me = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const S = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || S.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((g) => g());
  });
}, gt = (e, i) => {
  const S = r.getState().stateComponents.get(e);
  if (S) {
    const g = `${e}////${i}`, y = S.components.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Je = (e, i, S, g) => {
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
function Ye(e, {
  stateKey: i,
  serverSync: S,
  localStorage: g,
  formElements: y,
  reactiveDeps: C,
  reactiveType: w,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: f
} = {}) {
  const [G, U] = ee({}), { sessionId: j } = xe();
  let H = !i;
  const [m] = ee(i ?? we()), l = r.getState().stateLog[m], le = J(/* @__PURE__ */ new Set()), Q = J(I ?? we()), _ = J(
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
      ke(m, {
        initialState: a
      });
      const t = _.current, s = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = r.getState().initialStateGlobal[m];
      if (!(c && !B(c, a) || !c) && !s)
        return;
      let d = null;
      const p = X(t?.localStorage?.key) ? t?.localStorage?.key(a) : t?.localStorage?.key;
      p && j && (d = Se(`${j}-${m}-${p}`));
      let E = a, A = !1;
      const P = s ? Date.now() : 0, x = d?.lastUpdated || 0, M = d?.lastSyncedWithServer || 0;
      s && P > x ? (E = t.serverState.data, A = !0) : d && x > M && (E = d.state, t?.localStorage?.onChange && t?.localStorage?.onChange(E)), r.getState().initializeShadowState(m, a), Pe(
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
    H && ke(m, {
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
      depsFunction: C || void 0,
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
        let $ = !1, N = h.signalDomElements.get(E);
        if ((!N || N.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const V = o.slice(0, -1), L = q(p, V);
          if (Array.isArray(L)) {
            $ = !0;
            const k = `${m}-${V.join(".")}`;
            N = h.signalDomElements.get(k);
          }
        }
        if (N) {
          const V = $ ? q(p, o.slice(0, -1)) : q(p, o);
          N.forEach(({ parentId: L, position: k, effect: F }) => {
            const O = document.querySelector(
              `[data-parent-id="${L}"]`
            );
            if (O) {
              const T = Array.from(O.childNodes);
              if (T[k]) {
                const b = F ? new Function("state", `return (${F})(state)`)(V) : V;
                T[k].textContent = String(b);
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
      ), s.updateType === "insert" && _.current?.validation?.key && Ge(
        _.current?.validation?.key + "." + A.join(".")
      ).filter(([N, V]) => {
        let L = N?.split(".").length;
        if (N == A.join(".") && L == A.length - 1) {
          let k = N + "." + A;
          Z(N), ze(k, V);
        }
      });
      const P = h.stateComponents.get(m);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", P), P) {
        const $ = pe(d, p), N = new Set($), V = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          L,
          k
        ] of P.components.entries()) {
          let F = !1;
          const O = Array.isArray(k.reactiveType) ? k.reactiveType : [k.reactiveType || "component"];
          if (console.log("component", k), !O.includes("none")) {
            if (O.includes("all")) {
              k.forceUpdate();
              continue;
            }
            if (O.includes("component") && ((k.paths.has(V) || k.paths.has("")) && (F = !0), !F))
              for (const T of N) {
                let b = T;
                for (; ; ) {
                  if (k.paths.has(b)) {
                    F = !0;
                    break;
                  }
                  const D = b.lastIndexOf(".");
                  if (D !== -1) {
                    const R = b.substring(
                      0,
                      D
                    );
                    if (!isNaN(
                      Number(b.substring(D + 1))
                    ) && k.paths.has(R)) {
                      F = !0;
                      break;
                    }
                    b = R;
                  } else
                    b = "";
                  if (b === "")
                    break;
                }
                if (F) break;
              }
            if (!F && O.includes("deps") && k.depsFunction) {
              const T = k.depsFunction(p);
              let b = !1;
              typeof T == "boolean" ? T && (b = !0) : B(k.deps, T) || (k.deps = T, b = !0), b && (F = !0);
            }
            F && k.forceUpdate();
          }
        }
      }
      const x = Date.now();
      o = o.map(($, N) => {
        const V = o.slice(0, -1), L = q(p, V);
        return N === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (L.length - 1).toString() : $;
      });
      const { oldValue: M, newValue: W } = Je(
        s.updateType,
        d,
        p,
        o
      ), z = {
        timeStamp: x,
        stateKey: m,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: M,
        newValue: W
      };
      switch (s.updateType) {
        case "update":
          h.updateShadowAtPath(m, o, p);
          break;
        case "insert":
          const $ = o.slice(0, -1);
          h.insertShadowArrayElement(m, $, W);
          break;
        case "cut":
          const N = o.slice(0, -1), V = parseInt(o[o.length - 1]);
          h.removeShadowArrayElement(m, N, V);
          break;
      }
      if (He(m, ($) => {
        const V = [...$ ?? [], z].reduce((L, k) => {
          const F = `${k.stateKey}:${JSON.stringify(k.path)}`, O = L.get(F);
          return O ? (O.timeStamp = Math.max(O.timeStamp, k.timeStamp), O.newValue = k.newValue, O.oldValue = O.oldValue ?? k.oldValue, O.updateType = k.updateType) : L.set(F, { ...k }), L;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), Ce(
        p,
        m,
        _.current,
        j
      ), _.current?.middleware && _.current.middleware({
        updateLog: l,
        update: z
      }), _.current?.serverSync) {
        const $ = h.serverState[m], N = _.current?.serverSync;
        Be(m, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: p }),
          rollBackState: $,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
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
  ), r.getState().cogsStateStore[m] || te(m, e), r.getState().initialStateGlobal[m] || Ee(m, e));
  const u = Ie(() => fe(
    m,
    ae,
    Q.current,
    j
  ), [m, j]);
  return [Ve(m), u];
}
function fe(e, i, S, g) {
  const y = /* @__PURE__ */ new Map();
  let C = 0;
  const w = (v) => {
    const n = v.join(".");
    for (const [f] of y)
      (f === n || f.startsWith(n + ".")) && y.delete(f);
    C++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && Z(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = r.getState().getInitialOptions(e)?.validation;
      n?.key && Z(n?.key), v?.validationKey && Z(v.validationKey);
      const f = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), y.clear(), C++;
      const G = a(f, []), U = re(e), j = X(U?.localStorage?.key) ? U?.localStorage?.key(f) : U?.localStorage?.key, H = `${g}-${e}-${j}`;
      H && localStorage.removeItem(H), ge(e, G), te(e, f);
      const m = r.getState().stateComponents.get(e);
      return m && m.components.forEach((l) => {
        l.forceUpdate();
      }), f;
    },
    updateInitialState: (v) => {
      y.clear(), C++;
      const n = fe(
        e,
        i,
        S,
        g
      ), f = r.getState().initialStateGlobal[e], G = re(e), U = X(G?.localStorage?.key) ? G?.localStorage?.key(f) : G?.localStorage?.key, j = `${g}-${e}-${U}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), Oe(() => {
        Ee(e, v), r.getState().initializeShadowState(e, v), ge(e, n), te(e, v);
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
    const G = n.map(String).join(".");
    y.get(G);
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
          return () => pe(
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
              }), A = J(c), P = J(!1), x = J(0), [M, W] = ee(0);
              oe(() => r.getState().subscribeToShadowState(e, () => {
                W((b) => b + 1);
              }), [e]);
              const z = r().getNestedState(
                e,
                n
              ), $ = z.length, { totalHeight: N, positions: V } = Ie(() => {
                const T = r.getState().getShadowMetadata(e, n) || [];
                let b = 0;
                const D = [];
                for (let R = 0; R < $; R++) {
                  D[R] = b;
                  const Y = T[R]?.virtualizer?.itemHeight;
                  b += Y || o;
                }
                return { totalHeight: b, positions: D };
              }, [
                $,
                e,
                n.join("."),
                o,
                M
              ]), L = Ie(() => {
                const T = Math.max(0, p.startIndex), b = Math.min($, p.endIndex), D = Array.from(
                  { length: b - T },
                  (Y, ne) => T + ne
                ), R = D.map((Y) => z[Y]);
                return a(R, n, {
                  ...f,
                  validIndices: D
                });
              }, [p.startIndex, p.endIndex, z, $]);
              ie(() => {
                const T = $ > x.current;
                A.current && T && (console.log(
                  "PHASE 1: Auto-scroll needed. Setting range to render the last item."
                ), E({
                  startIndex: Math.max(0, $ - 10 - s),
                  endIndex: $
                })), x.current = $;
              }, [$]), ie(() => {
                const T = d.current, b = p.endIndex === $ && $ > 0;
                if (!T || !A.current || !b)
                  return;
                console.log(
                  "PHASE 2: Range is at the end. Starting the measurement loop."
                );
                let D = 0;
                const R = setInterval(() => {
                  D++, console.log(`LOOP ${D}: Checking last item...`);
                  const Y = $ - 1, K = (r.getState().getShadowMetadata(e, n) || [])[Y]?.virtualizer?.itemHeight || 0;
                  K > 0 ? (console.log(
                    `%cSUCCESS: Last item height is ${K}. Scrolling now.`,
                    "color: green; font-weight: bold;"
                  ), clearInterval(R), P.current = !0, T.scrollTo({
                    top: T.scrollHeight,
                    behavior: "smooth"
                  }), setTimeout(() => {
                    P.current = !1;
                  }, 1e3)) : D > 20 ? (console.error(
                    "LOOP TIMEOUT: Last item was never measured. Stopping loop."
                  ), clearInterval(R)) : console.log("...WAITING. Height is not ready.");
                }, 100);
                return () => clearInterval(R);
              }, [p.endIndex, $, V]), oe(() => {
                const T = d.current;
                if (!T) return;
                console.log(
                  "DEPENDENCY CHANGE: Resetting scroll lock and initial view."
                ), A.current = c;
                const b = () => {
                  const { scrollTop: R, clientHeight: Y } = T;
                  let ne = 0, K = $ - 1;
                  for (; ne <= K; ) {
                    const he = Math.floor((ne + K) / 2);
                    V[he] < R ? ne = he + 1 : K = he - 1;
                  }
                  const Ae = Math.max(0, K - s);
                  let de = Ae;
                  const _e = R + Y;
                  for (; de < $ && V[de] < _e; )
                    de++;
                  E({
                    startIndex: Ae,
                    endIndex: Math.min($, de + s)
                  });
                }, D = () => {
                  if (P.current) return;
                  T.scrollHeight - T.scrollTop - T.clientHeight < 1 || (A.current = !1), b();
                };
                return T.addEventListener("scroll", D, {
                  passive: !0
                }), b(), () => T.removeEventListener("scroll", D);
              }, [...h]);
              const k = Te(
                (T = "smooth") => {
                  d.current && (A.current = !0, d.current.scrollTo({
                    top: d.current.scrollHeight,
                    behavior: T
                  }));
                },
                []
              ), F = Te(
                (T, b = "smooth") => {
                  d.current && V[T] !== void 0 && (A.current = !1, d.current.scrollTo({
                    top: V[T],
                    behavior: b
                  }));
                },
                [V]
              ), O = {
                outer: {
                  ref: d,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${N}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${V[p.startIndex] || 0}px)`
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
                    const [, P] = ee({}), x = `${S}-${n.join(".")}-${c}`;
                    ie(() => {
                      const M = `${e}////${x}`, W = r.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return W.components.set(M, {
                        forceUpdate: () => P({}),
                        paths: /* @__PURE__ */ new Set([p.join(".")])
                      }), r.getState().stateComponents.set(e, W), () => {
                        const z = r.getState().stateComponents.get(e);
                        z && z.components.delete(M);
                      };
                    }, [e, x]);
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
            return (t) => ce(Ze, {
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
                return ce(Qe, {
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
              y.clear(), C++;
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
            return (t) => (w(n), ve(i, t, n, e), a(
              r.getState().getNestedState(e, n),
              n
            ));
          if (l === "uniqueInsert")
            return (t, o, s) => {
              const c = r.getState().getNestedState(e, n), h = X(t) ? t(c) : t;
              let d = null;
              if (!c.some((E) => {
                if (o) {
                  const P = o.every(
                    (x) => B(E[x], h[x])
                  );
                  return P && (d = E), P;
                }
                const A = B(E, h);
                return A && (d = E), A;
              }))
                w(n), ve(i, h, n, e);
              else if (s && d) {
                const E = s(d), A = c.map(
                  (P) => B(P, d) ? E : P
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
              o > -1 ? ue(i, n, e, o) : ve(i, t, n, e);
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
          return (u) => Ne({
            _stateKey: e,
            _path: n,
            _effect: u.toString()
          });
        if (l === "$get")
          return () => Ne({
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
              const t = r.getState().cogsStateStore[e], s = Le(t, u).newDocument;
              Pe(
                e,
                r.getState().initialStateGlobal[e],
                s,
                i,
                S,
                g
              );
              const c = r.getState().stateComponents.get(e);
              if (c) {
                const h = pe(t, s), d = new Set(h);
                for (const [
                  p,
                  E
                ] of c.components.entries()) {
                  let A = !1;
                  const P = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
                  if (!P.includes("none")) {
                    if (P.includes("all")) {
                      E.forceUpdate();
                      continue;
                    }
                    if (P.includes("component") && (E.paths.has("") && (A = !0), !A))
                      for (const x of d) {
                        if (E.paths.has(x)) {
                          A = !0;
                          break;
                        }
                        let M = x.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const W = x.substring(0, M);
                          if (E.paths.has(W)) {
                            A = !0;
                            break;
                          }
                          const z = x.substring(
                            M + 1
                          );
                          if (!isNaN(Number(z))) {
                            const $ = W.lastIndexOf(".");
                            if ($ !== -1) {
                              const N = W.substring(
                                0,
                                $
                              );
                              if (E.paths.has(N)) {
                                A = !0;
                                break;
                              }
                            }
                          }
                          M = W.lastIndexOf(".");
                        }
                        if (A) break;
                      }
                    if (!A && P.includes("deps") && E.depsFunction) {
                      const x = E.depsFunction(s);
                      let M = !1;
                      typeof x == "boolean" ? x && (M = !0) : B(E.deps, x) || (E.deps = x, M = !0), M && (A = !0);
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
            return () => $e.getState().getFormRefsByStateKey(e);
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
          return () => $e.getState().getFormRef(e + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: u,
            hideMessage: t
          }) => /* @__PURE__ */ ye(
            je,
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
              Ue(() => {
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
          return (u, t) => /* @__PURE__ */ ye(
            Fe,
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
    return y.set(G, {
      proxy: H,
      stateVersion: C
    }), H;
  }
  return a(
    r.getState().getNestedState(e, [])
  );
}
function Ne(e) {
  return ce(Xe, { proxy: e });
}
function Ze({
  proxy: e,
  rebuildStateShape: i
}) {
  const S = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(S) ? i(
    S,
    e._path
  ).stateMapNoRender(
    (y, C, w, I, a) => e._mapFn(y, C, w, I, a)
  ) : null;
}
function Xe({
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
    const G = document.createTextNode(String(f));
    g.replaceWith(G);
  }, [e._stateKey, e._path.join("."), e._effect]), ce("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function ft(e) {
  const i = Me(
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
function Qe({
  stateKey: e,
  itemComponentId: i,
  itemPath: S,
  children: g
}) {
  const [, y] = ee({}), [C, w] = We(), I = J(null);
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
  }, [e, i, S.join(".")]), /* @__PURE__ */ ye("div", { ref: C, children: g });
}
export {
  Ne as $cogsSignal,
  ft as $cogsSignalStore,
  dt as addStateOptions,
  ut as createCogsState,
  gt as notifyComponent,
  Ye as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
