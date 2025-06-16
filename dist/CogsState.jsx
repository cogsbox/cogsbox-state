"use client";
import { jsx as Ie } from "react/jsx-runtime";
import { useState as te, useRef as q, useEffect as ae, useLayoutEffect as ce, useMemo as pe, createElement as le, useSyncExternalStore as Oe, startTransition as Re, useCallback as $e } from "react";
import { transformStateFunc as Ue, isDeepEqual as B, isFunction as Q, getNestedValue as J, getDifferences as we, debounce as je } from "./utility.js";
import { pushFunc as ye, updateFn as ie, cutFunc as ge, ValidationWrapper as Fe, FormControlComponent as Le } from "./Functions.jsx";
import De from "superjson";
import { v4 as Te } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as ke } from "./store.js";
import { useCogsConfig as Ve } from "./CogsStateClient.jsx";
import { applyPatch as We } from "fast-json-patch";
import Ge from "react-use-measure";
function be(e, i) {
  const m = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, y = m(e) || {};
  f(e, {
    ...y,
    ...i
  });
}
function Ce({
  stateKey: e,
  options: i,
  initialOptionsPart: m
}) {
  const f = oe(e) || {}, y = m[e] || {}, b = r.getState().setInitialStateOptions, T = { ...y, ...f };
  let I = !1;
  if (i)
    for (const a in i)
      T.hasOwnProperty(a) ? (a == "localStorage" && i[a] && T[a].key !== i[a]?.key && (I = !0, T[a] = i[a]), a == "initialState" && i[a] && T[a] !== i[a] && // Different references
      !B(T[a], i[a]) && (I = !0, T[a] = i[a])) : (I = !0, T[a] = i[a]);
  I && b(e, T);
}
function ut(e, { formElements: i, validation: m }) {
  return { initialState: e, formElements: i, validation: m };
}
const gt = (e, i) => {
  let m = e;
  const [f, y] = Ue(m);
  (Object.keys(y).length > 0 || i && Object.keys(i).length > 0) && Object.keys(y).forEach((I) => {
    y[I] = y[I] || {}, y[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...y[I].formElements || {}
      // State-specific overrides
    }, oe(I) || r.getState().setInitialStateOptions(I, y[I]);
  }), r.getState().setInitialStates(f), r.getState().setCreatedState(f);
  const b = (I, a) => {
    const [v] = te(a?.componentId ?? Te());
    Ce({
      stateKey: I,
      options: a,
      initialOptionsPart: y
    });
    const n = r.getState().cogsStateStore[I] || f[I], S = a?.modifyState ? a.modifyState(n) : n, [G, U] = Ze(
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
    return U;
  };
  function T(I, a) {
    Ce({ stateKey: I, options: a, initialOptionsPart: y }), a.localStorage && Je(I, a), he(I);
  }
  return { useCogsState: b, setCogsOptions: T };
}, {
  setUpdaterState: fe,
  setState: ne,
  getInitialOptions: oe,
  getKeyState: Pe,
  getValidationErrors: He,
  setStateLog: ze,
  updateInitialStateGlobal: Ae,
  addValidationError: Be,
  removeValidationError: X,
  setServerSyncActions: qe
} = r.getState(), Ne = (e, i, m, f, y) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    f
  );
  const b = Q(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (b && f) {
    const T = `${f}-${i}-${b}`;
    let I;
    try {
      I = me(T)?.lastSyncedWithServer;
    } catch {
    }
    const a = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: y ?? I
    }, v = De.serialize(a);
    window.localStorage.setItem(
      T,
      JSON.stringify(v.json)
    );
  }
}, me = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Je = (e, i) => {
  const m = r.getState().cogsStateStore[e], { sessionId: f } = Ve(), y = Q(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (y && f) {
    const b = me(
      `${f}-${e}-${y}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return ne(e, b.state), he(e), !0;
  }
  return !1;
}, _e = (e, i, m, f, y, b) => {
  const T = {
    initialState: i,
    updaterState: Se(
      e,
      f,
      y,
      b
    ),
    state: m
  };
  Ae(e, T.initialState), fe(e, T.updaterState), ne(e, T.state);
}, he = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || m.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((f) => f());
  });
}, ft = (e, i) => {
  const m = r.getState().stateComponents.get(e);
  if (m) {
    const f = `${e}////${i}`, y = m.components.get(f);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
}, Ye = (e, i, m, f) => {
  switch (e) {
    case "update":
      return {
        oldValue: J(i, f),
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
        oldValue: J(i, f),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Ze(e, {
  stateKey: i,
  serverSync: m,
  localStorage: f,
  formElements: y,
  reactiveDeps: b,
  reactiveType: T,
  componentId: I,
  initialState: a,
  syncUpdate: v,
  dependencies: n,
  serverState: S
} = {}) {
  const [G, U] = te({}), { sessionId: j } = Ve();
  let H = !i;
  const [h] = te(i ?? Te()), l = r.getState().stateLog[h], de = q(/* @__PURE__ */ new Set()), K = q(I ?? Te()), M = q(
    null
  );
  M.current = oe(h) ?? null, ae(() => {
    if (v && v.stateKey === h && v.path?.[0]) {
      ne(h, (o) => ({
        ...o,
        [v.path[0]]: v.newValue
      }));
      const t = `${v.stateKey}:${v.path.join(".")}`;
      r.getState().setSyncInfo(t, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), ae(() => {
    if (a) {
      be(h, {
        initialState: a
      });
      const t = M.current, s = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = r.getState().initialStateGlobal[h];
      if (!(c && !B(c, a) || !c) && !s)
        return;
      let d = null;
      const p = Q(t?.localStorage?.key) ? t?.localStorage?.key(a) : t?.localStorage?.key;
      p && j && (d = me(`${j}-${h}-${p}`));
      let A = a, $ = !1;
      const N = s ? Date.now() : 0, C = d?.lastUpdated || 0, _ = d?.lastSyncedWithServer || 0;
      s && N > C ? (A = t.serverState.data, $ = !0) : d && C > _ && (A = d.state, t?.localStorage?.onChange && t?.localStorage?.onChange(A)), r.getState().initializeShadowState(h, a), _e(
        h,
        a,
        A,
        se,
        K.current,
        j
      ), $ && p && j && Ne(A, h, t, j, Date.now()), he(h), (Array.isArray(T) ? T : [T || "component"]).includes("none") || U({});
    }
  }, [
    a,
    S?.status,
    S?.data,
    ...n || []
  ]), ce(() => {
    H && be(h, {
      serverSync: m,
      formElements: y,
      initialState: a,
      localStorage: f,
      middleware: M.current?.middleware
    });
    const t = `${h}////${K.current}`, o = r.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(t, {
      forceUpdate: () => U({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: T ?? ["component", "deps"]
    }), r.getState().stateComponents.set(h, o), U({}), () => {
      o && (o.components.delete(t), o.components.size === 0 && r.getState().stateComponents.delete(h));
    };
  }, []);
  const se = (t, o, s, c) => {
    if (Array.isArray(o)) {
      const d = `${h}-${o.join(".")}`;
      de.current.add(d);
    }
    const g = r.getState();
    ne(h, (d) => {
      const p = Q(t) ? t(d) : t, A = `${h}-${o.join(".")}`;
      if (A) {
        let V = !1, w = g.signalDomElements.get(A);
        if ((!w || w.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const O = o.slice(0, -1), P = J(p, O);
          if (Array.isArray(P)) {
            V = !0;
            const k = `${h}-${O.join(".")}`;
            w = g.signalDomElements.get(k);
          }
        }
        if (w) {
          const O = V ? J(p, o.slice(0, -1)) : J(p, o);
          w.forEach(({ parentId: P, position: k, effect: F }) => {
            const R = document.querySelector(
              `[data-parent-id="${P}"]`
            );
            if (R) {
              const z = Array.from(R.childNodes);
              if (z[k]) {
                const E = F ? new Function("state", `return (${F})(state)`)(O) : O;
                z[k].textContent = String(E);
              }
            }
          });
        }
      }
      console.log("shadowState", g.shadowStateStore), s.updateType === "update" && (c || M.current?.validation?.key) && o && X(
        (c || M.current?.validation?.key) + "." + o.join(".")
      );
      const $ = o.slice(0, o.length - 1);
      s.updateType === "cut" && M.current?.validation?.key && X(
        M.current?.validation?.key + "." + $.join(".")
      ), s.updateType === "insert" && M.current?.validation?.key && He(
        M.current?.validation?.key + "." + $.join(".")
      ).filter(([w, O]) => {
        let P = w?.split(".").length;
        if (w == $.join(".") && P == $.length - 1) {
          let k = w + "." + $;
          X(w), Be(k, O);
        }
      });
      const N = g.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", N), N) {
        const V = we(d, p), w = new Set(V), O = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          P,
          k
        ] of N.components.entries()) {
          let F = !1;
          const R = Array.isArray(k.reactiveType) ? k.reactiveType : [k.reactiveType || "component"];
          if (console.log("component", k), !R.includes("none")) {
            if (R.includes("all")) {
              k.forceUpdate();
              continue;
            }
            if (R.includes("component") && ((k.paths.has(O) || k.paths.has("")) && (F = !0), !F))
              for (const z of w) {
                let E = z;
                for (; ; ) {
                  if (k.paths.has(E)) {
                    F = !0;
                    break;
                  }
                  const x = E.lastIndexOf(".");
                  if (x !== -1) {
                    const L = E.substring(
                      0,
                      x
                    );
                    if (!isNaN(
                      Number(E.substring(x + 1))
                    ) && k.paths.has(L)) {
                      F = !0;
                      break;
                    }
                    E = L;
                  } else
                    E = "";
                  if (E === "")
                    break;
                }
                if (F) break;
              }
            if (!F && R.includes("deps") && k.depsFunction) {
              const z = k.depsFunction(p);
              let E = !1;
              typeof z == "boolean" ? z && (E = !0) : B(k.deps, z) || (k.deps = z, E = !0), E && (F = !0);
            }
            F && k.forceUpdate();
          }
        }
      }
      const C = Date.now();
      o = o.map((V, w) => {
        const O = o.slice(0, -1), P = J(p, O);
        return w === o.length - 1 && ["insert", "cut"].includes(s.updateType) ? (P.length - 1).toString() : V;
      });
      const { oldValue: _, newValue: W } = Ye(
        s.updateType,
        d,
        p,
        o
      ), Y = {
        timeStamp: C,
        stateKey: h,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: _,
        newValue: W
      };
      switch (s.updateType) {
        case "update":
          g.updateShadowAtPath(h, o, p);
          break;
        case "insert":
          const V = o.slice(0, -1);
          g.insertShadowArrayElement(h, V, W);
          break;
        case "cut":
          const w = o.slice(0, -1), O = parseInt(o[o.length - 1]);
          g.removeShadowArrayElement(h, w, O);
          break;
      }
      if (ze(h, (V) => {
        const O = [...V ?? [], Y].reduce((P, k) => {
          const F = `${k.stateKey}:${JSON.stringify(k.path)}`, R = P.get(F);
          return R ? (R.timeStamp = Math.max(R.timeStamp, k.timeStamp), R.newValue = k.newValue, R.oldValue = R.oldValue ?? k.oldValue, R.updateType = k.updateType) : P.set(F, { ...k }), P;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), Ne(
        p,
        h,
        M.current,
        j
      ), M.current?.middleware && M.current.middleware({
        updateLog: l,
        update: Y
      }), M.current?.serverSync) {
        const V = g.serverState[h], w = M.current?.serverSync;
        qe(h, {
          syncKey: typeof w.syncKey == "string" ? w.syncKey : w.syncKey({ state: p }),
          rollBackState: V,
          actionTimeStamp: Date.now() + (w.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return p;
    });
  };
  r.getState().updaterState[h] || (fe(
    h,
    Se(
      h,
      se,
      K.current,
      j
    )
  ), r.getState().cogsStateStore[h] || ne(h, e), r.getState().initialStateGlobal[h] || Ae(h, e));
  const u = pe(() => Se(
    h,
    se,
    K.current,
    j
  ), [h, j]);
  return [Pe(h), u];
}
function Se(e, i, m, f) {
  const y = /* @__PURE__ */ new Map();
  let b = 0;
  const T = (v) => {
    const n = v.join(".");
    for (const [S] of y)
      (S === n || S.startsWith(n + ".")) && y.delete(S);
    b++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && X(v.validationKey);
    },
    revertToInitialState: (v) => {
      const n = r.getState().getInitialOptions(e)?.validation;
      n?.key && X(n?.key), v?.validationKey && X(v.validationKey);
      const S = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), y.clear(), b++;
      const G = a(S, []), U = oe(e), j = Q(U?.localStorage?.key) ? U?.localStorage?.key(S) : U?.localStorage?.key, H = `${f}-${e}-${j}`;
      H && localStorage.removeItem(H), fe(e, G), ne(e, S);
      const h = r.getState().stateComponents.get(e);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (v) => {
      y.clear(), b++;
      const n = Se(
        e,
        i,
        m,
        f
      ), S = r.getState().initialStateGlobal[e], G = oe(e), U = Q(G?.localStorage?.key) ? G?.localStorage?.key(S) : G?.localStorage?.key, j = `${f}-${e}-${U}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), Re(() => {
        Ae(e, v), r.getState().initializeShadowState(e, v), fe(e, n), ne(e, v);
        const H = r.getState().stateComponents.get(e);
        H && H.components.forEach((h) => {
          h.forceUpdate();
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
      return !!(v && B(v, Pe(e)));
    }
  };
  function a(v, n = [], S) {
    const G = n.map(String).join(".");
    y.get(G);
    const U = function() {
      return r().getNestedState(e, n);
    };
    Object.keys(I).forEach((h) => {
      U[h] = I[h];
    });
    const j = {
      apply(h, l, de) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, n);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(v) && (S = { ...S, validIndices: void 0 });
        const de = /* @__PURE__ */ new Set([
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
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender" && !de.has(l)) {
          const u = `${e}////${m}`, t = r.getState().stateComponents.get(e);
          if (t) {
            const o = t.components.get(u);
            if (o && !o.paths.has("")) {
              const s = n.join(".");
              let c = !0;
              for (const g of o.paths)
                if (s.startsWith(g) && (s === g || s[g.length] === ".")) {
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
                const g = r.getState().stateComponents.get(e);
                g && g.components.forEach((d) => {
                  d.forceUpdate();
                });
              }
              return c?.success && t.onSuccess ? t.onSuccess(c.data) : !c?.success && t.onError && t.onError(c.error), c;
            } catch (c) {
              return t.onError && t.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const u = r.getState().getNestedState(e, n), t = r.getState().initialStateGlobal[e], o = J(t, n);
          return B(u, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const u = r().getNestedState(
              e,
              n
            ), t = r.getState().initialStateGlobal[e], o = J(t, n);
            return B(u, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const u = r.getState().initialStateGlobal[e], t = oe(e), o = Q(t?.localStorage?.key) ? t?.localStorage?.key(u) : t?.localStorage?.key, s = `${f}-${e}-${o}`;
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
          const u = () => S?.validIndices ? v.map((o, s) => ({
            item: o,
            originalIndex: S.validIndices[s]
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
                  S
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
                dependencies: g = []
              } = t, d = q(null), [p, A] = te({
                startIndex: 0,
                endIndex: 10
              }), $ = q(c), N = q(!1), C = q(0), _ = q(g), [W, Y] = te(0);
              ae(() => r.getState().subscribeToShadowState(e, () => {
                Y((x) => x + 1);
              }), [e]);
              const V = r().getNestedState(
                e,
                n
              ), w = V.length, { totalHeight: O, positions: P } = pe(() => {
                const E = r.getState().getShadowMetadata(e, n) || [];
                let x = 0;
                const L = [];
                for (let D = 0; D < w; D++) {
                  L[D] = x;
                  const Z = E[D]?.virtualizer?.itemHeight;
                  x += Z || o;
                }
                return { totalHeight: x, positions: L };
              }, [
                w,
                e,
                n.join("."),
                o,
                W
              ]), k = pe(() => {
                const E = Math.max(0, p.startIndex), x = Math.min(w, p.endIndex), L = Array.from(
                  { length: x - E },
                  (Z, re) => E + re
                ), D = L.map((Z) => V[Z]);
                return a(D, n, {
                  ...S,
                  validIndices: L
                });
              }, [p.startIndex, p.endIndex, V, w]);
              ce(() => {
                const E = w > C.current, x = !B(
                  g,
                  _.current
                );
                x && ($.current = c), $.current && (E || x) && (console.log(
                  "PHASE 1: Auto-scroll needed. Setting range to render the last item."
                ), A({
                  startIndex: Math.max(0, w - 10 - s),
                  endIndex: w
                })), C.current = w, _.current = g;
              }, [w, ...g]), ce(() => {
                const E = d.current, x = p.endIndex === w && w > 0;
                if (!E || !$.current || !x)
                  return;
                console.log(
                  "PHASE 2: Range is set to the end. Starting the measurement loop."
                );
                let L = 0;
                const D = setInterval(() => {
                  L++, console.log(`LOOP ${L}: Checking last item...`);
                  const Z = w - 1, ee = (r.getState().getShadowMetadata(e, n) || [])[Z]?.virtualizer?.itemHeight || 0;
                  ee > 0 ? (console.log(
                    `%cSUCCESS: Last item height is ${ee}. Scrolling now.`,
                    "color: green; font-weight: bold;"
                  ), clearInterval(D), N.current = !0, E.scrollTo({
                    top: E.scrollHeight,
                    behavior: "smooth"
                  }), setTimeout(() => {
                    N.current = !1;
                  }, 1e3)) : L > 30 ? (console.error(
                    "LOOP TIMEOUT: Last item was never measured. Stopping loop."
                  ), clearInterval(D)) : console.log("...WAITING. Height is not ready.");
                }, 100);
                return () => clearInterval(D);
              }, [p]), ae(() => {
                const E = d.current;
                if (!E) return;
                const x = () => {
                  const { scrollTop: D, clientHeight: Z } = E;
                  let re = 0, ee = w - 1;
                  for (; re <= ee; ) {
                    const ve = Math.floor((re + ee) / 2);
                    P[ve] < D ? re = ve + 1 : ee = ve - 1;
                  }
                  const Ee = Math.max(0, ee - s);
                  let ue = Ee;
                  const Me = D + Z;
                  for (; ue < w && P[ue] < Me; )
                    ue++;
                  A({
                    startIndex: Ee,
                    endIndex: Math.min(w, ue + s)
                  });
                }, L = () => {
                  if (N.current) return;
                  E.scrollHeight - E.scrollTop - E.clientHeight < 1 || ($.current = !1), x();
                };
                return E.addEventListener("scroll", L, {
                  passive: !0
                }), x(), () => E.removeEventListener("scroll", L);
              }, [w, P, ...g]);
              const F = $e(
                (E = "smooth") => {
                  d.current && ($.current = !0, d.current.scrollTo({
                    top: d.current.scrollHeight,
                    behavior: E
                  }));
                },
                []
              ), R = $e(
                (E, x = "smooth") => {
                  d.current && P[E] !== void 0 && ($.current = !1, d.current.scrollTo({
                    top: P[E],
                    behavior: x
                  }));
                },
                [P]
              ), z = {
                outer: {
                  ref: d,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${O}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${P[p.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: k,
                virtualizerProps: z,
                scrollToBottom: F,
                scrollToIndex: R
              };
            };
          if (l === "stateSort")
            return (t) => {
              const s = [...u()].sort(
                (d, p) => t(d.item, p.item)
              ), c = s.map(({ item: d }) => d), g = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: d }) => d
                )
              };
              return a(c, n, g);
            };
          if (l === "stateFilter")
            return (t) => {
              const s = u().filter(
                ({ item: d }, p) => t(d, p)
              ), c = s.map(({ item: d }) => d), g = {
                ...S,
                validIndices: s.map(
                  ({ originalIndex: d }) => d
                )
              };
              return a(c, n, g);
            };
          if (l === "stateMap")
            return (t) => {
              const o = r.getState().getNestedState(e, n);
              return Array.isArray(o) ? (S?.validIndices || Array.from({ length: o.length }, (c, g) => g)).map((c, g) => {
                const d = o[c], p = [...n, c.toString()], A = a(d, p, S);
                return t(d, A, {
                  register: () => {
                    const [, N] = te({}), C = `${m}-${n.join(".")}-${c}`;
                    ce(() => {
                      const _ = `${e}////${C}`, W = r.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return W.components.set(_, {
                        forceUpdate: () => N({}),
                        paths: /* @__PURE__ */ new Set([p.join(".")])
                      }), r.getState().stateComponents.set(e, W), () => {
                        const Y = r.getState().stateComponents.get(e);
                        Y && Y.components.delete(_);
                      };
                    }, [e, C]);
                  },
                  index: g,
                  originalIndex: c
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${n.join(".")}. The current value is:`,
                o
              ), null);
            };
          if (l === "stateMapNoRender")
            return (t) => v.map((s, c) => {
              let g;
              S?.validIndices && S.validIndices[c] !== void 0 ? g = S.validIndices[c] : g = c;
              const d = [...n, g.toString()], p = a(s, d, S);
              return t(
                s,
                p,
                c,
                v,
                a(v, n, S)
              );
            });
          if (l === "$stateMap")
            return (t) => le(Xe, {
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
              return Array.isArray(o) ? (S?.validIndices || Array.from({ length: o.length }, (c, g) => g)).map((c, g) => {
                const d = o[c], p = [...n, c.toString()], A = a(d, p, S), $ = `${m}-${n.join(".")}-${c}`;
                return le(Ke, {
                  key: c,
                  stateKey: e,
                  itemComponentId: $,
                  itemPath: p,
                  children: t(
                    d,
                    A,
                    g,
                    o,
                    a(o, n, S)
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
                S
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
            return (t) => (T(n), ye(i, t, n, e), a(
              r.getState().getNestedState(e, n),
              n
            ));
          if (l === "uniqueInsert")
            return (t, o, s) => {
              const c = r.getState().getNestedState(e, n), g = Q(t) ? t(c) : t;
              let d = null;
              if (!c.some((A) => {
                if (o) {
                  const N = o.every(
                    (C) => B(A[C], g[C])
                  );
                  return N && (d = A), N;
                }
                const $ = B(A, g);
                return $ && (d = A), $;
              }))
                T(n), ye(i, g, n, e);
              else if (s && d) {
                const A = s(d), $ = c.map(
                  (N) => B(N, d) ? A : N
                );
                T(n), ie(i, $, n);
              }
            };
          if (l === "cut")
            return (t, o) => {
              if (!o?.waitForSync)
                return T(n), ge(i, n, e, t), a(
                  r.getState().getNestedState(e, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (t) => {
              for (let o = 0; o < v.length; o++)
                v[o] === t && ge(i, n, e, o);
            };
          if (l === "toggleByValue")
            return (t) => {
              const o = v.findIndex((s) => s === t);
              o > -1 ? ge(i, n, e, o) : ye(i, t, n, e);
            };
          if (l === "stateFind")
            return (t) => {
              const s = u().find(
                ({ item: g }, d) => t(g, d)
              );
              if (!s) return;
              const c = [...n, s.originalIndex.toString()];
              return a(s.item, c, S);
            };
          if (l === "findWith")
            return (t, o) => {
              const c = u().find(
                ({ item: d }) => d[t] === o
              );
              if (!c) return;
              const g = [...n, c.originalIndex.toString()];
              return a(c.item, g, S);
            };
        }
        const K = n[n.length - 1];
        if (!isNaN(Number(K))) {
          const u = n.slice(0, -1), t = r.getState().getNestedState(e, u);
          if (Array.isArray(t) && l === "cut")
            return () => ge(
              i,
              u,
              e,
              Number(K)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(v)) {
              const u = r.getState().getNestedState(e, n);
              return S.validIndices.map((t) => u[t]);
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
          return (u) => me(f + "-" + e + "-" + u);
        if (l === "_selected") {
          const u = n.slice(0, -1), t = u.join("."), o = r.getState().getNestedState(e, u);
          return Array.isArray(o) ? Number(n[n.length - 1]) === r.getState().getSelectedIndex(e, t) : void 0;
        }
        if (l === "setSelected")
          return (u) => {
            const t = n.slice(0, -1), o = Number(n[n.length - 1]), s = t.join(".");
            u ? r.getState().setSelectedIndex(e, s, o) : r.getState().setSelectedIndex(e, s, void 0);
            const c = r.getState().getNestedState(e, [...t]);
            ie(i, c, t), T(t);
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
            ie(i, c, u), T(u);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (u) => {
              const t = r.getState().cogsStateStore[e], s = We(t, u).newDocument;
              _e(
                e,
                r.getState().initialStateGlobal[e],
                s,
                i,
                m,
                f
              );
              const c = r.getState().stateComponents.get(e);
              if (c) {
                const g = we(t, s), d = new Set(g);
                for (const [
                  p,
                  A
                ] of c.components.entries()) {
                  let $ = !1;
                  const N = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
                  if (!N.includes("none")) {
                    if (N.includes("all")) {
                      A.forceUpdate();
                      continue;
                    }
                    if (N.includes("component") && (A.paths.has("") && ($ = !0), !$))
                      for (const C of d) {
                        if (A.paths.has(C)) {
                          $ = !0;
                          break;
                        }
                        let _ = C.lastIndexOf(".");
                        for (; _ !== -1; ) {
                          const W = C.substring(0, _);
                          if (A.paths.has(W)) {
                            $ = !0;
                            break;
                          }
                          const Y = C.substring(
                            _ + 1
                          );
                          if (!isNaN(Number(Y))) {
                            const V = W.lastIndexOf(".");
                            if (V !== -1) {
                              const w = W.substring(
                                0,
                                V
                              );
                              if (A.paths.has(w)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          _ = W.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && N.includes("deps") && A.depsFunction) {
                      const C = A.depsFunction(s);
                      let _ = !1;
                      typeof C == "boolean" ? C && (_ = !0) : B(A.deps, C) || (A.deps = C, _ = !0), _ && ($ = !0);
                    }
                    $ && A.forceUpdate();
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
              X(u.key);
              const o = r.getState().cogsStateStore[e];
              try {
                const s = r.getState().getValidationErrors(u.key);
                s && s.length > 0 && s.forEach(([g]) => {
                  g && g.startsWith(u.key) && X(g);
                });
                const c = u.zodSchema.safeParse(o);
                return c.success ? !0 : (c.error.errors.forEach((d) => {
                  const p = d.path, A = d.message, $ = [u.key, ...p].join(".");
                  t($, A);
                }), he(e), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (l === "_componentId") return m;
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
              validIndices: S?.validIndices,
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
                ie(i, u, n, "");
                const o = r.getState().getNestedState(e, n);
                t?.afterUpdate && t.afterUpdate(o);
              }, t.debounce);
            else {
              ie(i, u, n, "");
              const o = r.getState().getNestedState(e, n);
              t?.afterUpdate && t.afterUpdate(o);
            }
            T(n);
          };
        if (l === "formElement")
          return (u, t) => /* @__PURE__ */ Ie(
            Le,
            {
              setState: i,
              stateKey: e,
              path: n,
              child: u,
              formOpts: t
            }
          );
        const M = [...n, l], se = r.getState().getNestedState(e, M);
        return a(se, M, S);
      }
    }, H = new Proxy(U, j);
    return y.set(G, {
      proxy: H,
      stateVersion: b
    }), H;
  }
  return a(
    r.getState().getNestedState(e, [])
  );
}
function xe(e) {
  return le(Qe, { proxy: e });
}
function Xe({
  proxy: e,
  rebuildStateShape: i
}) {
  const m = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(m) ? i(
    m,
    e._path
  ).stateMapNoRender(
    (y, b, T, I, a) => e._mapFn(y, b, T, I, a)
  ) : null;
}
function Qe({
  proxy: e
}) {
  const i = q(null), m = `${e._stateKey}-${e._path.join(".")}`;
  return ae(() => {
    const f = i.current;
    if (!f || !f.parentElement) return;
    const y = f.parentElement, T = Array.from(y.childNodes).indexOf(f);
    let I = y.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, y.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: T,
      effect: e._effect
    };
    r.getState().addSignalElement(m, v);
    const n = r.getState().getNestedState(e._stateKey, e._path);
    let S;
    if (e._effect)
      try {
        S = new Function(
          "state",
          `return (${e._effect})(state)`
        )(n);
      } catch (U) {
        console.error("Error evaluating effect function during mount:", U), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const G = document.createTextNode(String(S));
    f.replaceWith(G);
  }, [e._stateKey, e._path.join("."), e._effect]), le("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function St(e) {
  const i = Oe(
    (m) => {
      const f = r.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(e._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => f.components.delete(e._stateKey);
    },
    () => r.getState().getNestedState(e._stateKey, e._path)
  );
  return le("text", {}, String(i));
}
function Ke({
  stateKey: e,
  itemComponentId: i,
  itemPath: m,
  children: f
}) {
  const [, y] = te({}), [b, T] = Ge(), I = q(null);
  return ae(() => {
    T.height > 0 && T.height !== I.current && (I.current = T.height, r.getState().setShadowMetadata(e, m, {
      virtualizer: {
        itemHeight: T.height
      }
    }));
  }, [T.height, e, m]), ce(() => {
    const a = `${e}////${i}`, v = r.getState().stateComponents.get(e) || {
      components: /* @__PURE__ */ new Map()
    };
    return v.components.set(a, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), r.getState().stateComponents.set(e, v), () => {
      const n = r.getState().stateComponents.get(e);
      n && n.components.delete(a);
    };
  }, [e, i, m.join(".")]), /* @__PURE__ */ Ie("div", { ref: b, children: f });
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
