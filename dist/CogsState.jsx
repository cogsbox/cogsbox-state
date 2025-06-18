"use client";
import { jsx as Oe } from "react/jsx-runtime";
import { useState as K, useRef as q, useEffect as oe, useLayoutEffect as ce, useMemo as we, createElement as le, useSyncExternalStore as je, startTransition as He, useCallback as ke } from "react";
import { transformStateFunc as Fe, isDeepEqual as J, isFunction as ee, getNestedValue as Z, getDifferences as _e, debounce as Be } from "./utility.js";
import { pushFunc as Ee, updateFn as ie, cutFunc as me, ValidationWrapper as We, FormControlComponent as ze } from "./Functions.jsx";
import qe from "superjson";
import { v4 as Ae } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as be } from "./store.js";
import { useCogsConfig as Ge } from "./CogsStateClient.jsx";
import { applyPatch as Je } from "fast-json-patch";
import Ye from "react-use-measure";
function Me(e, i) {
  const m = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, I = m(e) || {};
  g(e, {
    ...I,
    ...i
  });
}
function xe({
  stateKey: e,
  options: i,
  initialOptionsPart: m
}) {
  const g = re(e) || {}, I = m[e] || {}, N = o.getState().setInitialStateOptions, p = { ...I, ...g };
  let v = !1;
  if (i)
    for (const s in i)
      p.hasOwnProperty(s) ? (s == "localStorage" && i[s] && p[s].key !== i[s]?.key && (v = !0, p[s] = i[s]), s == "initialState" && i[s] && p[s] !== i[s] && // Different references
      !J(p[s], i[s]) && (v = !0, p[s] = i[s])) : (v = !0, p[s] = i[s]);
  v && N(e, p);
}
function It(e, { formElements: i, validation: m }) {
  return { initialState: e, formElements: i, validation: m };
}
const vt = (e, i) => {
  let m = e;
  const [g, I] = Fe(m);
  (Object.keys(I).length > 0 || i && Object.keys(i).length > 0) && Object.keys(I).forEach((v) => {
    I[v] = I[v] || {}, I[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...I[v].formElements || {}
      // State-specific overrides
    }, re(v) || o.getState().setInitialStateOptions(v, I[v]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const N = (v, s) => {
    const [T] = K(s?.componentId ?? Ae());
    xe({
      stateKey: v,
      options: s,
      initialOptionsPart: I
    });
    const n = o.getState().cogsStateStore[v] || g[v], S = s?.modifyState ? s.modifyState(n) : n, [W, U] = nt(
      S,
      {
        stateKey: v,
        syncUpdate: s?.syncUpdate,
        componentId: T,
        localStorage: s?.localStorage,
        middleware: s?.middleware,
        enabledSync: s?.enabledSync,
        reactiveType: s?.reactiveType,
        reactiveDeps: s?.reactiveDeps,
        initialState: s?.initialState,
        dependencies: s?.dependencies,
        serverState: s?.serverState
      }
    );
    return U;
  };
  function p(v, s) {
    xe({ stateKey: v, options: s, initialOptionsPart: I }), s.localStorage && et(v, s), ve(v);
  }
  return { useCogsState: N, setCogsOptions: p };
}, {
  setUpdaterState: he,
  setState: ne,
  getInitialOptions: re,
  getKeyState: Re,
  getValidationErrors: Ze,
  setStateLog: Xe,
  updateInitialStateGlobal: Ne,
  addValidationError: Qe,
  removeValidationError: Q,
  setServerSyncActions: Ke
} = o.getState(), Pe = (e, i, m, g, I) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    g
  );
  const N = ee(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (N && g) {
    const p = `${g}-${i}-${N}`;
    let v;
    try {
      v = Ie(p)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: I ?? v
    }, T = qe.serialize(s);
    window.localStorage.setItem(
      p,
      JSON.stringify(T.json)
    );
  }
}, Ie = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, et = (e, i) => {
  const m = o.getState().cogsStateStore[e], { sessionId: g } = Ge(), I = ee(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (I && g) {
    const N = Ie(
      `${g}-${e}-${I}`
    );
    if (N && N.lastUpdated > (N.lastSyncedWithServer || 0))
      return ne(e, N.state), ve(e), !0;
  }
  return !1;
}, Le = (e, i, m, g, I, N) => {
  const p = {
    initialState: i,
    updaterState: Te(
      e,
      g,
      I,
      N
    ),
    state: m
  };
  Ne(e, p.initialState), he(e, p.updaterState), ne(e, p.state);
}, ve = (e) => {
  const i = o.getState().stateComponents.get(e);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, yt = (e, i) => {
  const m = o.getState().stateComponents.get(e);
  if (m) {
    const g = `${e}////${i}`, I = m.components.get(g);
    if ((I ? Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"] : null)?.includes("none"))
      return;
    I && I.forceUpdate();
  }
}, tt = (e, i, m, g) => {
  switch (e) {
    case "update":
      return {
        oldValue: Z(i, g),
        newValue: Z(m, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: Z(m, g)
      };
    case "cut":
      return {
        oldValue: Z(i, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function nt(e, {
  stateKey: i,
  serverSync: m,
  localStorage: g,
  formElements: I,
  reactiveDeps: N,
  reactiveType: p,
  componentId: v,
  initialState: s,
  syncUpdate: T,
  dependencies: n,
  serverState: S
} = {}) {
  const [W, U] = K({}), { sessionId: j } = Ge();
  let z = !i;
  const [h] = K(i ?? Ae()), l = o.getState().stateLog[h], de = q(/* @__PURE__ */ new Set()), te = q(v ?? Ae()), R = q(
    null
  );
  R.current = re(h) ?? null, oe(() => {
    if (T && T.stateKey === h && T.path?.[0]) {
      ne(h, (r) => ({
        ...r,
        [T.path[0]]: T.newValue
      }));
      const t = `${T.stateKey}:${T.path.join(".")}`;
      o.getState().setSyncInfo(t, {
        timeStamp: T.timeStamp,
        userId: T.userId
      });
    }
  }, [T]), oe(() => {
    if (s) {
      Me(h, {
        initialState: s
      });
      const t = R.current, a = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = o.getState().initialStateGlobal[h];
      if (!(c && !J(c, s) || !c) && !a)
        return;
      let u = null;
      const E = ee(t?.localStorage?.key) ? t?.localStorage?.key(s) : t?.localStorage?.key;
      E && j && (u = Ie(`${j}-${h}-${E}`));
      let y = s, w = !1;
      const C = a ? Date.now() : 0, A = u?.lastUpdated || 0, M = u?.lastSyncedWithServer || 0;
      a && C > A ? (y = t.serverState.data, w = !0) : u && A > M && (y = u.state, t?.localStorage?.onChange && t?.localStorage?.onChange(y)), o.getState().initializeShadowState(h, s), Le(
        h,
        s,
        y,
        ae,
        te.current,
        j
      ), w && E && j && Pe(y, h, t, j, Date.now()), ve(h), (Array.isArray(p) ? p : [p || "component"]).includes("none") || U({});
    }
  }, [
    s,
    S?.status,
    S?.data,
    ...n || []
  ]), ce(() => {
    z && Me(h, {
      serverSync: m,
      formElements: I,
      initialState: s,
      localStorage: g,
      middleware: R.current?.middleware
    });
    const t = `${h}////${te.current}`, r = o.getState().stateComponents.get(h) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(t, {
      forceUpdate: () => U({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: N || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(h, r), U({}), () => {
      r && (r.components.delete(t), r.components.size === 0 && o.getState().stateComponents.delete(h));
    };
  }, []);
  const ae = (t, r, a, c) => {
    if (Array.isArray(r)) {
      const u = `${h}-${r.join(".")}`;
      de.current.add(u);
    }
    const f = o.getState();
    ne(h, (u) => {
      const E = ee(t) ? t(u) : t, y = `${h}-${r.join(".")}`;
      if (y) {
        let x = !1, $ = f.signalDomElements.get(y);
        if ((!$ || $.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const L = r.slice(0, -1), V = Z(E, L);
          if (Array.isArray(V)) {
            x = !0;
            const O = `${h}-${L.join(".")}`;
            $ = f.signalDomElements.get(O);
          }
        }
        if ($) {
          const L = x ? Z(E, r.slice(0, -1)) : Z(E, r);
          $.forEach(({ parentId: V, position: O, effect: _ }) => {
            const D = document.querySelector(
              `[data-parent-id="${V}"]`
            );
            if (D) {
              const G = Array.from(D.childNodes);
              if (G[O]) {
                const B = _ ? new Function("state", `return (${_})(state)`)(L) : L;
                G[O].textContent = String(B);
              }
            }
          });
        }
      }
      console.log("shadowState", f.shadowStateStore), a.updateType === "update" && (c || R.current?.validation?.key) && r && Q(
        (c || R.current?.validation?.key) + "." + r.join(".")
      );
      const w = r.slice(0, r.length - 1);
      a.updateType === "cut" && R.current?.validation?.key && Q(
        R.current?.validation?.key + "." + w.join(".")
      ), a.updateType === "insert" && R.current?.validation?.key && Ze(
        R.current?.validation?.key + "." + w.join(".")
      ).filter(([$, L]) => {
        let V = $?.split(".").length;
        if ($ == w.join(".") && V == w.length - 1) {
          let O = $ + "." + w;
          Q($), Qe(O, L);
        }
      });
      const C = f.stateComponents.get(h);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", C), C) {
        const x = _e(u, E), $ = new Set(x), L = a.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          V,
          O
        ] of C.components.entries()) {
          let _ = !1;
          const D = Array.isArray(O.reactiveType) ? O.reactiveType : [O.reactiveType || "component"];
          if (console.log("component", O), !D.includes("none")) {
            if (D.includes("all")) {
              O.forceUpdate();
              continue;
            }
            if (D.includes("component") && ((O.paths.has(L) || O.paths.has("")) && (_ = !0), !_))
              for (const G of $) {
                let B = G;
                for (; ; ) {
                  if (O.paths.has(B)) {
                    _ = !0;
                    break;
                  }
                  const se = B.lastIndexOf(".");
                  if (se !== -1) {
                    const ue = B.substring(
                      0,
                      se
                    );
                    if (!isNaN(
                      Number(B.substring(se + 1))
                    ) && O.paths.has(ue)) {
                      _ = !0;
                      break;
                    }
                    B = ue;
                  } else
                    B = "";
                  if (B === "")
                    break;
                }
                if (_) break;
              }
            if (!_ && D.includes("deps") && O.depsFunction) {
              const G = O.depsFunction(E);
              let B = !1;
              typeof G == "boolean" ? G && (B = !0) : J(O.deps, G) || (O.deps = G, B = !0), B && (_ = !0);
            }
            _ && O.forceUpdate();
          }
        }
      }
      const A = Date.now();
      r = r.map((x, $) => {
        const L = r.slice(0, -1), V = Z(E, L);
        return $ === r.length - 1 && ["insert", "cut"].includes(a.updateType) ? (V.length - 1).toString() : x;
      });
      const { oldValue: M, newValue: F } = tt(
        a.updateType,
        u,
        E,
        r
      ), Y = {
        timeStamp: A,
        stateKey: h,
        path: r,
        updateType: a.updateType,
        status: "new",
        oldValue: M,
        newValue: F
      };
      switch (a.updateType) {
        case "update":
          f.updateShadowAtPath(h, r, E);
          break;
        case "insert":
          const x = r.slice(0, -1);
          f.insertShadowArrayElement(h, x, F);
          break;
        case "cut":
          const $ = r.slice(0, -1), L = parseInt(r[r.length - 1]);
          f.removeShadowArrayElement(h, $, L);
          break;
      }
      if (Xe(h, (x) => {
        const L = [...x ?? [], Y].reduce((V, O) => {
          const _ = `${O.stateKey}:${JSON.stringify(O.path)}`, D = V.get(_);
          return D ? (D.timeStamp = Math.max(D.timeStamp, O.timeStamp), D.newValue = O.newValue, D.oldValue = D.oldValue ?? O.oldValue, D.updateType = O.updateType) : V.set(_, { ...O }), V;
        }, /* @__PURE__ */ new Map());
        return Array.from(L.values());
      }), Pe(
        E,
        h,
        R.current,
        j
      ), R.current?.middleware && R.current.middleware({
        updateLog: l,
        update: Y
      }), R.current?.serverSync) {
        const x = f.serverState[h], $ = R.current?.serverSync;
        Ke(h, {
          syncKey: typeof $.syncKey == "string" ? $.syncKey : $.syncKey({ state: E }),
          rollBackState: x,
          actionTimeStamp: Date.now() + ($.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[h] || (he(
    h,
    Te(
      h,
      ae,
      te.current,
      j
    )
  ), o.getState().cogsStateStore[h] || ne(h, e), o.getState().initialStateGlobal[h] || Ne(h, e));
  const d = we(() => Te(
    h,
    ae,
    te.current,
    j
  ), [h, j]);
  return [Re(h), d];
}
function Te(e, i, m, g) {
  const I = /* @__PURE__ */ new Map();
  let N = 0;
  const p = (T) => {
    const n = T.join(".");
    for (const [S] of I)
      (S === n || S.startsWith(n + ".")) && I.delete(S);
    N++;
  }, v = {
    removeValidation: (T) => {
      T?.validationKey && Q(T.validationKey);
    },
    revertToInitialState: (T) => {
      const n = o.getState().getInitialOptions(e)?.validation;
      n?.key && Q(n?.key), T?.validationKey && Q(T.validationKey);
      const S = o.getState().initialStateGlobal[e];
      o.getState().clearSelectedIndexesForState(e), I.clear(), N++;
      const W = s(S, []), U = re(e), j = ee(U?.localStorage?.key) ? U?.localStorage?.key(S) : U?.localStorage?.key, z = `${g}-${e}-${j}`;
      z && localStorage.removeItem(z), he(e, W), ne(e, S);
      const h = o.getState().stateComponents.get(e);
      return h && h.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (T) => {
      I.clear(), N++;
      const n = Te(
        e,
        i,
        m,
        g
      ), S = o.getState().initialStateGlobal[e], W = re(e), U = ee(W?.localStorage?.key) ? W?.localStorage?.key(S) : W?.localStorage?.key, j = `${g}-${e}-${U}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), He(() => {
        Ne(e, T), o.getState().initializeShadowState(e, T), he(e, n), ne(e, T);
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
      const T = o.getState().serverState[e];
      return !!(T && J(T, Re(e)));
    }
  };
  function s(T, n = [], S) {
    const W = n.map(String).join(".");
    I.get(W);
    const U = function() {
      return o().getNestedState(e, n);
    };
    Object.keys(v).forEach((h) => {
      U[h] = v[h];
    });
    const j = {
      apply(h, l, de) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(e, n);
      },
      get(h, l) {
        S?.validIndices && !Array.isArray(T) && (S = { ...S, validIndices: void 0 });
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
          const d = `${e}////${m}`, t = o.getState().stateComponents.get(e);
          if (t) {
            const r = t.components.get(d);
            if (r && !r.paths.has("")) {
              const a = n.join(".");
              let c = !0;
              for (const f of r.paths)
                if (a.startsWith(f) && (a === f || a[f.length] === ".")) {
                  c = !1;
                  break;
                }
              c && r.paths.add(a);
            }
          }
        }
        if (l === "getDifferences")
          return () => _e(
            o.getState().cogsStateStore[e],
            o.getState().initialStateGlobal[e]
          );
        if (l === "sync" && n.length === 0)
          return async function() {
            const d = o.getState().getInitialOptions(e), t = d?.sync;
            if (!t)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const r = o.getState().getNestedState(e, []), a = d?.validation?.key;
            try {
              const c = await t.action(r);
              if (c && !c.success && c.errors && a) {
                o.getState().removeValidationError(a), c.errors.forEach((u) => {
                  const E = [a, ...u.path].join(".");
                  o.getState().addValidationError(E, u.message);
                });
                const f = o.getState().stateComponents.get(e);
                f && f.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return c?.success && t.onSuccess ? t.onSuccess(c.data) : !c?.success && t.onError && t.onError(c.error), c;
            } catch (c) {
              return t.onError && t.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = o.getState().getNestedState(e, n), t = o.getState().initialStateGlobal[e], r = Z(t, n);
          return J(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              e,
              n
            ), t = o.getState().initialStateGlobal[e], r = Z(t, n);
            return J(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[e], t = re(e), r = ee(t?.localStorage?.key) ? t?.localStorage?.key(d) : t?.localStorage?.key, a = `${g}-${e}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(e)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(T)) {
          const d = () => S?.validIndices ? T.map((r, a) => ({
            item: r,
            originalIndex: S.validIndices[a]
          })) : o.getState().getNestedState(e, n).map((r, a) => ({
            item: r,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const t = o.getState().getSelectedIndex(e, n.join("."));
              if (t !== void 0)
                return s(
                  T[t],
                  [...n, t.toString()],
                  S
                );
            };
          if (l === "clearSelected")
            return () => {
              o.getState().clearSelectedIndex({ stateKey: e, path: n });
            };
          if (l === "getSelectedIndex")
            return () => o.getState().getSelectedIndex(e, n.join(".")) ?? -1;
          if (l === "useVirtualView")
            return (t) => {
              const {
                itemHeight: r = 50,
                overscan: a = 6,
                stickToBottom: c = !1,
                dependencies: f = []
              } = t, u = q(!1), E = q(null), [y, w] = K({
                startIndex: 0,
                endIndex: 10
              }), [C, A] = K("IDLE_AT_TOP"), M = q(!1), F = q(0), Y = q(f), x = q(0), [$, L] = K(0), V = q(null);
              oe(() => o.getState().subscribeToShadowState(e, () => {
                L((P) => P + 1);
              }), [e]);
              const O = o().getNestedState(
                e,
                n
              ), _ = O.length, { totalHeight: D, positions: G } = we(() => {
                const k = o.getState().getShadowMetadata(e, n) || [];
                let P = 0;
                const H = [];
                for (let b = 0; b < _; b++) {
                  H[b] = P;
                  const X = k[b]?.virtualizer?.itemHeight;
                  P += X || r;
                }
                return { totalHeight: P, positions: H };
              }, [
                _,
                e,
                n.join("."),
                r,
                $
              ]), B = we(() => {
                const k = Math.max(0, y.startIndex), P = Math.min(_, y.endIndex), H = Array.from(
                  { length: P - k },
                  (X, ge) => k + ge
                ), b = H.map((X) => O[X]);
                return s(b, n, {
                  ...S,
                  validIndices: H
                });
              }, [y.startIndex, y.endIndex, O, _]);
              ce(() => {
                const k = E.current, P = _ > F.current;
                if (P && V.current && k) {
                  const { top: H, height: b } = V.current;
                  k.scrollTop = H + (k.scrollHeight - b), V.current = null, console.log(
                    `ANCHOR RESTORED to scrollTop: ${k.scrollTop}`
                  );
                } else {
                  if (!J(
                    f,
                    Y.current
                  )) {
                    console.log("TRANSITION: Deps changed -> IDLE_AT_TOP"), A("IDLE_AT_TOP");
                    return;
                  }
                  P && C === "LOCKED_AT_BOTTOM" && c && (console.log(
                    "TRANSITION: New items arrived while locked -> GETTING_HEIGHTS"
                  ), A("GETTING_HEIGHTS"));
                }
                F.current = _, Y.current = f;
              }, [_, ...f]), ce(() => {
                const k = E.current;
                if (!k) return;
                let P;
                if (C === "IDLE_AT_TOP" && c && _ > 0)
                  console.log(
                    "ACTION (IDLE_AT_TOP): Data has arrived -> GETTING_HEIGHTS"
                  ), A("GETTING_HEIGHTS");
                else if (C === "GETTING_HEIGHTS")
                  console.log(
                    "ACTION (GETTING_HEIGHTS): Setting range to end and starting loop."
                  ), w({
                    startIndex: Math.max(0, _ - 10 - a),
                    endIndex: _
                  }), P = setInterval(() => {
                    const H = _ - 1;
                    ((o.getState().getShadowMetadata(e, n) || [])[H]?.virtualizer?.itemHeight || 0) > 0 && (clearInterval(P), u.current || (console.log(
                      "ACTION (GETTING_HEIGHTS): Measurement success -> SCROLLING_TO_BOTTOM"
                    ), A("SCROLLING_TO_BOTTOM")));
                  }, 100);
                else if (C === "SCROLLING_TO_BOTTOM") {
                  console.log(
                    "ACTION (SCROLLING_TO_BOTTOM): Executing scroll."
                  ), M.current = !0;
                  const H = F.current === 0 ? "auto" : "smooth";
                  k.scrollTo({
                    top: k.scrollHeight,
                    behavior: H
                  });
                  const b = setTimeout(
                    () => {
                      console.log(
                        "ACTION (SCROLLING_TO_BOTTOM): Scroll finished -> LOCKED_AT_BOTTOM"
                      ), M.current = !1, u.current = !1, A("LOCKED_AT_BOTTOM");
                    },
                    H === "smooth" ? 500 : 50
                  );
                  return () => clearTimeout(b);
                }
                return () => {
                  P && clearInterval(P);
                };
              }, [C, _, G]), oe(() => {
                const k = E.current;
                if (!k) return;
                const P = r, H = () => {
                  if (M.current)
                    return;
                  const { scrollTop: b, scrollHeight: X, clientHeight: ge } = k;
                  if (X - b - ge < 10 ? C !== "LOCKED_AT_BOTTOM" && (A("LOCKED_AT_BOTTOM"), V.current = null) : C !== "IDLE_NOT_AT_BOTTOM" && (A("IDLE_NOT_AT_BOTTOM"), V.current = {
                    top: b,
                    height: X
                  }, console.log(`ANCHOR SET at scrollTop: ${b}`)), Math.abs(b - x.current) < P)
                    return;
                  console.log(
                    `Threshold passed at ${b}px. Recalculating range...`
                  );
                  let ye = _ - 1, pe = 0, Ce = 0;
                  for (; pe <= ye; ) {
                    const Se = Math.floor((pe + ye) / 2);
                    G[Se] < b ? (Ce = Se, pe = Se + 1) : ye = Se - 1;
                  }
                  const $e = Math.max(0, Ce - a);
                  let fe = $e;
                  const Ue = b + ge;
                  for (; fe < _ && G[fe] < Ue; )
                    fe++;
                  w({
                    startIndex: $e,
                    endIndex: Math.min(_, fe + a)
                  }), x.current = b;
                };
                return k.addEventListener("scroll", H, {
                  passive: !0
                }), () => k.removeEventListener("scroll", H);
              }, [_, G, r, a, C]);
              const se = ke(() => {
                console.log(
                  "USER ACTION: Clicked scroll button -> SCROLLING_TO_BOTTOM"
                ), A("SCROLLING_TO_BOTTOM");
              }, []), ue = ke(
                (k, P = "smooth") => {
                  E.current && G[k] !== void 0 && (A("IDLE_NOT_AT_BOTTOM"), E.current.scrollTo({
                    top: G[k],
                    behavior: P
                  }));
                },
                [G]
              ), De = {
                outer: {
                  ref: E,
                  style: { overflowY: "auto", height: "100%" }
                },
                inner: {
                  style: {
                    height: `${D}px`,
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${G[y.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: B,
                virtualizerProps: De,
                scrollToBottom: se,
                scrollToIndex: ue
              };
            };
          if (l === "stateSort")
            return (t) => {
              const a = [...d()].sort(
                (u, E) => t(u.item, E.item)
              ), c = a.map(({ item: u }) => u), f = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, n, f);
            };
          if (l === "stateFilter")
            return (t) => {
              const a = d().filter(
                ({ item: u }, E) => t(u, E)
              ), c = a.map(({ item: u }) => u), f = {
                ...S,
                validIndices: a.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(c, n, f);
            };
          if (l === "stateMap")
            return (t) => {
              const r = o.getState().getNestedState(e, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (c, f) => f)).map((c, f) => {
                const u = r[c], E = [...n, c.toString()], y = s(u, E, S);
                return t(u, y, {
                  register: () => {
                    const [, C] = K({}), A = `${m}-${n.join(".")}-${c}`;
                    ce(() => {
                      const M = `${e}////${A}`, F = o.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return F.components.set(M, {
                        forceUpdate: () => C({}),
                        paths: /* @__PURE__ */ new Set([E.join(".")])
                      }), o.getState().stateComponents.set(e, F), () => {
                        const Y = o.getState().stateComponents.get(e);
                        Y && Y.components.delete(M);
                      };
                    }, [e, A]);
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
            return (t) => T.map((a, c) => {
              let f;
              S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
              const u = [...n, f.toString()], E = s(a, u, S);
              return t(
                a,
                E,
                c,
                T,
                s(T, n, S)
              );
            });
          if (l === "$stateMap")
            return (t) => le(rt, {
              proxy: {
                _stateKey: e,
                _path: n,
                _mapFn: t
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateList")
            return (t) => {
              const r = o.getState().getNestedState(e, n);
              return Array.isArray(r) ? (S?.validIndices || Array.from({ length: r.length }, (c, f) => f)).map((c, f) => {
                const u = r[c], E = [...n, c.toString()], y = s(u, E, S), w = `${m}-${n.join(".")}-${c}`;
                return le(at, {
                  key: c,
                  stateKey: e,
                  itemComponentId: w,
                  itemPath: E,
                  children: t(
                    u,
                    y,
                    f,
                    r,
                    s(r, n, S)
                  )
                });
              }) : (console.warn(
                `stateList called on a non-array value at path: ${n.join(".")}.`
              ), null);
            };
          if (l === "stateFlattenOn")
            return (t) => {
              const r = T;
              I.clear(), N++;
              const a = r.flatMap(
                (c) => c[t] ?? []
              );
              return s(
                a,
                [...n, "[*]", t],
                S
              );
            };
          if (l === "index")
            return (t) => {
              const r = T[t];
              return s(r, [...n, t.toString()]);
            };
          if (l === "last")
            return () => {
              const t = o.getState().getNestedState(e, n);
              if (t.length === 0) return;
              const r = t.length - 1, a = t[r], c = [...n, r.toString()];
              return s(a, c);
            };
          if (l === "insert")
            return (t) => (p(n), Ee(i, t, n, e), s(
              o.getState().getNestedState(e, n),
              n
            ));
          if (l === "uniqueInsert")
            return (t, r, a) => {
              const c = o.getState().getNestedState(e, n), f = ee(t) ? t(c) : t;
              let u = null;
              if (!c.some((y) => {
                if (r) {
                  const C = r.every(
                    (A) => J(y[A], f[A])
                  );
                  return C && (u = y), C;
                }
                const w = J(y, f);
                return w && (u = y), w;
              }))
                p(n), Ee(i, f, n, e);
              else if (a && u) {
                const y = a(u), w = c.map(
                  (C) => J(C, u) ? y : C
                );
                p(n), ie(i, w, n);
              }
            };
          if (l === "cut")
            return (t, r) => {
              if (!r?.waitForSync)
                return p(n), me(i, n, e, t), s(
                  o.getState().getNestedState(e, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (t) => {
              for (let r = 0; r < T.length; r++)
                T[r] === t && me(i, n, e, r);
            };
          if (l === "toggleByValue")
            return (t) => {
              const r = T.findIndex((a) => a === t);
              r > -1 ? me(i, n, e, r) : Ee(i, t, n, e);
            };
          if (l === "stateFind")
            return (t) => {
              const a = d().find(
                ({ item: f }, u) => t(f, u)
              );
              if (!a) return;
              const c = [...n, a.originalIndex.toString()];
              return s(a.item, c, S);
            };
          if (l === "findWith")
            return (t, r) => {
              const c = d().find(
                ({ item: u }) => u[t] === r
              );
              if (!c) return;
              const f = [...n, c.originalIndex.toString()];
              return s(c.item, f, S);
            };
        }
        const te = n[n.length - 1];
        if (!isNaN(Number(te))) {
          const d = n.slice(0, -1), t = o.getState().getNestedState(e, d);
          if (Array.isArray(t) && l === "cut")
            return () => me(
              i,
              d,
              e,
              Number(te)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(T)) {
              const d = o.getState().getNestedState(e, n);
              return S.validIndices.map((t) => d[t]);
            }
            return o.getState().getNestedState(e, n);
          };
        if (l === "$derive")
          return (d) => Ve({
            _stateKey: e,
            _path: n,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => Ve({
            _stateKey: e,
            _path: n
          });
        if (l === "lastSynced") {
          const d = `${e}:${n.join(".")}`;
          return o.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => Ie(g + "-" + e + "-" + d);
        if (l === "_selected") {
          const d = n.slice(0, -1), t = d.join("."), r = o.getState().getNestedState(e, d);
          return Array.isArray(r) ? Number(n[n.length - 1]) === o.getState().getSelectedIndex(e, t) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const t = n.slice(0, -1), r = Number(n[n.length - 1]), a = t.join(".");
            d ? o.getState().setSelectedIndex(e, a, r) : o.getState().setSelectedIndex(e, a, void 0);
            const c = o.getState().getNestedState(e, [...t]);
            ie(i, c, t), p(t);
          };
        if (l === "toggleSelected")
          return () => {
            const d = n.slice(0, -1), t = Number(n[n.length - 1]), r = d.join("."), a = o.getState().getSelectedIndex(e, r);
            o.getState().setSelectedIndex(
              e,
              r,
              a === t ? void 0 : t
            );
            const c = o.getState().getNestedState(e, [...d]);
            ie(i, c, d), p(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const t = o.getState().cogsStateStore[e], a = Je(t, d).newDocument;
              Le(
                e,
                o.getState().initialStateGlobal[e],
                a,
                i,
                m,
                g
              );
              const c = o.getState().stateComponents.get(e);
              if (c) {
                const f = _e(t, a), u = new Set(f);
                for (const [
                  E,
                  y
                ] of c.components.entries()) {
                  let w = !1;
                  const C = Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"];
                  if (!C.includes("none")) {
                    if (C.includes("all")) {
                      y.forceUpdate();
                      continue;
                    }
                    if (C.includes("component") && (y.paths.has("") && (w = !0), !w))
                      for (const A of u) {
                        if (y.paths.has(A)) {
                          w = !0;
                          break;
                        }
                        let M = A.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const F = A.substring(0, M);
                          if (y.paths.has(F)) {
                            w = !0;
                            break;
                          }
                          const Y = A.substring(
                            M + 1
                          );
                          if (!isNaN(Number(Y))) {
                            const x = F.lastIndexOf(".");
                            if (x !== -1) {
                              const $ = F.substring(
                                0,
                                x
                              );
                              if (y.paths.has($)) {
                                w = !0;
                                break;
                              }
                            }
                          }
                          M = F.lastIndexOf(".");
                        }
                        if (w) break;
                      }
                    if (!w && C.includes("deps") && y.depsFunction) {
                      const A = y.depsFunction(a);
                      let M = !1;
                      typeof A == "boolean" ? A && (M = !0) : J(y.deps, A) || (y.deps = A, M = !0), M && (w = !0);
                    }
                    w && y.forceUpdate();
                  }
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const d = o.getState().getInitialOptions(e)?.validation, t = o.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              Q(d.key);
              const r = o.getState().cogsStateStore[e];
              try {
                const a = o.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([f]) => {
                  f && f.startsWith(d.key) && Q(f);
                });
                const c = d.zodSchema.safeParse(r);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const E = u.path, y = u.message, w = [d.key, ...E].join(".");
                  t(w, y);
                }), ve(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => o().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => be.getState().getFormRefsByStateKey(e);
          if (l === "_initialState")
            return o.getState().initialStateGlobal[e];
          if (l === "_serverState")
            return o.getState().serverState[e];
          if (l === "_isLoading")
            return o.getState().isLoadingGlobal[e];
          if (l === "revertToInitialState")
            return v.revertToInitialState;
          if (l === "updateInitialState") return v.updateInitialState;
          if (l === "removeValidation") return v.removeValidation;
        }
        if (l === "getFormRef")
          return () => be.getState().getFormRef(e + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: t
          }) => /* @__PURE__ */ Oe(
            We,
            {
              formOpts: t ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: o.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: S?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return e;
        if (l === "_path") return n;
        if (l === "_isServerSynced") return v._isServerSynced;
        if (l === "update")
          return (d, t) => {
            if (t?.debounce)
              Be(() => {
                ie(i, d, n, "");
                const r = o.getState().getNestedState(e, n);
                t?.afterUpdate && t.afterUpdate(r);
              }, t.debounce);
            else {
              ie(i, d, n, "");
              const r = o.getState().getNestedState(e, n);
              t?.afterUpdate && t.afterUpdate(r);
            }
            p(n);
          };
        if (l === "formElement")
          return (d, t) => /* @__PURE__ */ Oe(
            ze,
            {
              setState: i,
              stateKey: e,
              path: n,
              child: d,
              formOpts: t
            }
          );
        const R = [...n, l], ae = o.getState().getNestedState(e, R);
        return s(ae, R, S);
      }
    }, z = new Proxy(U, j);
    return I.set(W, {
      proxy: z,
      stateVersion: N
    }), z;
  }
  return s(
    o.getState().getNestedState(e, [])
  );
}
function Ve(e) {
  return le(ot, { proxy: e });
}
function rt({
  proxy: e,
  rebuildStateShape: i
}) {
  const m = o().getNestedState(e._stateKey, e._path);
  return Array.isArray(m) ? i(
    m,
    e._path
  ).stateMapNoRender(
    (I, N, p, v, s) => e._mapFn(I, N, p, v, s)
  ) : null;
}
function ot({
  proxy: e
}) {
  const i = q(null), m = `${e._stateKey}-${e._path.join(".")}`;
  return oe(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const I = g.parentElement, p = Array.from(I.childNodes).indexOf(g);
    let v = I.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, I.setAttribute("data-parent-id", v));
    const T = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: p,
      effect: e._effect
    };
    o.getState().addSignalElement(m, T);
    const n = o.getState().getNestedState(e._stateKey, e._path);
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
    const W = document.createTextNode(String(S));
    g.replaceWith(W);
  }, [e._stateKey, e._path.join("."), e._effect]), le("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function pt(e) {
  const i = je(
    (m) => {
      const g = o.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(e._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => g.components.delete(e._stateKey);
    },
    () => o.getState().getNestedState(e._stateKey, e._path)
  );
  return le("text", {}, String(i));
}
function at({
  stateKey: e,
  itemComponentId: i,
  itemPath: m,
  children: g
}) {
  const [, I] = K({}), [N, p] = Ye(), v = q(null);
  return oe(() => {
    p.height > 0 && p.height !== v.current && (v.current = p.height, o.getState().setShadowMetadata(e, m, {
      virtualizer: {
        itemHeight: p.height
      }
    }));
  }, [p.height, e, m]), ce(() => {
    const s = `${e}////${i}`, T = o.getState().stateComponents.get(e) || {
      components: /* @__PURE__ */ new Map()
    };
    return T.components.set(s, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), o.getState().stateComponents.set(e, T), () => {
      const n = o.getState().stateComponents.get(e);
      n && n.components.delete(s);
    };
  }, [e, i, m.join(".")]), /* @__PURE__ */ Oe("div", { ref: N, children: g });
}
export {
  Ve as $cogsSignal,
  pt as $cogsSignalStore,
  It as addStateOptions,
  vt as createCogsState,
  yt as notifyComponent,
  nt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
