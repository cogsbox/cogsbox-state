"use client";
import { jsx as _e } from "react/jsx-runtime";
import { useState as Q, useRef as J, useEffect as oe, useLayoutEffect as ce, useMemo as Ee, createElement as le, useSyncExternalStore as Ue, startTransition as je, useCallback as ke } from "react";
import { transformStateFunc as Be, isDeepEqual as q, isFunction as K, getNestedValue as Z, getDifferences as we, debounce as He } from "./utility.js";
import { pushFunc as Oe, updateFn as ie, cutFunc as me, ValidationWrapper as Fe, FormControlComponent as We } from "./Functions.jsx";
import ze from "superjson";
import { v4 as Ae } from "uuid";
import "zod";
import { getGlobalStore as o, formRefStore as be } from "./store.js";
import { useCogsConfig as Ge } from "./CogsStateClient.jsx";
import { applyPatch as qe } from "fast-json-patch";
import Je from "react-use-measure";
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
  const g = re(e) || {}, I = m[e] || {}, A = o.getState().setInitialStateOptions, O = { ...I, ...g };
  let y = !1;
  if (i)
    for (const s in i)
      O.hasOwnProperty(s) ? (s == "localStorage" && i[s] && O[s].key !== i[s]?.key && (y = !0, O[s] = i[s]), s == "initialState" && i[s] && O[s] !== i[s] && // Different references
      !q(O[s], i[s]) && (y = !0, O[s] = i[s])) : (y = !0, O[s] = i[s]);
  y && A(e, O);
}
function ht(e, { formElements: i, validation: m }) {
  return { initialState: e, formElements: i, validation: m };
}
const It = (e, i) => {
  let m = e;
  const [g, I] = Be(m);
  (Object.keys(I).length > 0 || i && Object.keys(i).length > 0) && Object.keys(I).forEach((y) => {
    I[y] = I[y] || {}, I[y].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...I[y].formElements || {}
      // State-specific overrides
    }, re(y) || o.getState().setInitialStateOptions(y, I[y]);
  }), o.getState().setInitialStates(g), o.getState().setCreatedState(g);
  const A = (y, s) => {
    const [h] = Q(s?.componentId ?? Ae());
    xe({
      stateKey: y,
      options: s,
      initialOptionsPart: I
    });
    const n = o.getState().cogsStateStore[y] || g[y], S = s?.modifyState ? s.modifyState(n) : n, [F, G] = tt(
      S,
      {
        stateKey: y,
        syncUpdate: s?.syncUpdate,
        componentId: h,
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
    return G;
  };
  function O(y, s) {
    xe({ stateKey: y, options: s, initialOptionsPart: I }), s.localStorage && Ke(y, s), ve(y);
  }
  return { useCogsState: A, setCogsOptions: O };
}, {
  setUpdaterState: Te,
  setState: ne,
  getInitialOptions: re,
  getKeyState: Le,
  getValidationErrors: Ye,
  setStateLog: Ze,
  updateInitialStateGlobal: Ne,
  addValidationError: Xe,
  removeValidationError: X,
  setServerSyncActions: Qe
} = o.getState(), Pe = (e, i, m, g, I) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    g
  );
  const A = K(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (A && g) {
    const O = `${g}-${i}-${A}`;
    let y;
    try {
      y = Ie(O)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: I ?? y
    }, h = ze.serialize(s);
    window.localStorage.setItem(
      O,
      JSON.stringify(h.json)
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
}, Ke = (e, i) => {
  const m = o.getState().cogsStateStore[e], { sessionId: g } = Ge(), I = K(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (I && g) {
    const A = Ie(
      `${g}-${e}-${I}`
    );
    if (A && A.lastUpdated > (A.lastSyncedWithServer || 0))
      return ne(e, A.state), ve(e), !0;
  }
  return !1;
}, Re = (e, i, m, g, I, A) => {
  const O = {
    initialState: i,
    updaterState: he(
      e,
      g,
      I,
      A
    ),
    state: m
  };
  Ne(e, O.initialState), Te(e, O.updaterState), ne(e, O.state);
}, ve = (e) => {
  const i = o.getState().stateComponents.get(e);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, vt = (e, i) => {
  const m = o.getState().stateComponents.get(e);
  if (m) {
    const g = `${e}////${i}`, I = m.components.get(g);
    if ((I ? Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"] : null)?.includes("none"))
      return;
    I && I.forceUpdate();
  }
}, et = (e, i, m, g) => {
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
function tt(e, {
  stateKey: i,
  serverSync: m,
  localStorage: g,
  formElements: I,
  reactiveDeps: A,
  reactiveType: O,
  componentId: y,
  initialState: s,
  syncUpdate: h,
  dependencies: n,
  serverState: S
} = {}) {
  const [F, G] = Q({}), { sessionId: L } = Ge();
  let W = !i;
  const [T] = Q(i ?? Ae()), l = o.getState().stateLog[T], de = J(/* @__PURE__ */ new Set()), ee = J(y ?? Ae()), P = J(
    null
  );
  P.current = re(T) ?? null, oe(() => {
    if (h && h.stateKey === T && h.path?.[0]) {
      ne(T, (r) => ({
        ...r,
        [h.path[0]]: h.newValue
      }));
      const t = `${h.stateKey}:${h.path.join(".")}`;
      o.getState().setSyncInfo(t, {
        timeStamp: h.timeStamp,
        userId: h.userId
      });
    }
  }, [h]), oe(() => {
    if (s) {
      Me(T, {
        initialState: s
      });
      const t = P.current, a = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, c = o.getState().initialStateGlobal[T];
      if (!(c && !q(c, s) || !c) && !a)
        return;
      let u = null;
      const _ = K(t?.localStorage?.key) ? t?.localStorage?.key(s) : t?.localStorage?.key;
      _ && L && (u = Ie(`${L}-${T}-${_}`));
      let p = s, E = !1;
      const N = a ? Date.now() : 0, w = u?.lastUpdated || 0, k = u?.lastSyncedWithServer || 0;
      a && N > w ? (p = t.serverState.data, E = !0) : u && w > k && (p = u.state, t?.localStorage?.onChange && t?.localStorage?.onChange(p)), o.getState().initializeShadowState(T, s), Re(
        T,
        s,
        p,
        ae,
        ee.current,
        L
      ), E && _ && L && Pe(p, T, t, L, Date.now()), ve(T), (Array.isArray(O) ? O : [O || "component"]).includes("none") || G({});
    }
  }, [
    s,
    S?.status,
    S?.data,
    ...n || []
  ]), ce(() => {
    W && Me(T, {
      serverSync: m,
      formElements: I,
      initialState: s,
      localStorage: g,
      middleware: P.current?.middleware
    });
    const t = `${T}////${ee.current}`, r = o.getState().stateComponents.get(T) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(t, {
      forceUpdate: () => G({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: A || void 0,
      reactiveType: O ?? ["component", "deps"]
    }), o.getState().stateComponents.set(T, r), G({}), () => {
      r && (r.components.delete(t), r.components.size === 0 && o.getState().stateComponents.delete(T));
    };
  }, []);
  const ae = (t, r, a, c) => {
    if (Array.isArray(r)) {
      const u = `${T}-${r.join(".")}`;
      de.current.add(u);
    }
    const f = o.getState();
    ne(T, (u) => {
      const _ = K(t) ? t(u) : t, p = `${T}-${r.join(".")}`;
      if (p) {
        let b = !1, C = f.signalDomElements.get(p);
        if ((!C || C.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const V = r.slice(0, -1), R = Z(_, V);
          if (Array.isArray(R)) {
            b = !0;
            const v = `${T}-${V.join(".")}`;
            C = f.signalDomElements.get(v);
          }
        }
        if (C) {
          const V = b ? Z(_, r.slice(0, -1)) : Z(_, r);
          C.forEach(({ parentId: R, position: v, effect: D }) => {
            const $ = document.querySelector(
              `[data-parent-id="${R}"]`
            );
            if ($) {
              const z = Array.from($.childNodes);
              if (z[v]) {
                const B = D ? new Function("state", `return (${D})(state)`)(V) : V;
                z[v].textContent = String(B);
              }
            }
          });
        }
      }
      console.log("shadowState", f.shadowStateStore), a.updateType === "update" && (c || P.current?.validation?.key) && r && X(
        (c || P.current?.validation?.key) + "." + r.join(".")
      );
      const E = r.slice(0, r.length - 1);
      a.updateType === "cut" && P.current?.validation?.key && X(
        P.current?.validation?.key + "." + E.join(".")
      ), a.updateType === "insert" && P.current?.validation?.key && Ye(
        P.current?.validation?.key + "." + E.join(".")
      ).filter(([C, V]) => {
        let R = C?.split(".").length;
        if (C == E.join(".") && R == E.length - 1) {
          let v = C + "." + E;
          X(C), Xe(v, V);
        }
      });
      const N = f.stateComponents.get(T);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", N), N) {
        const b = we(u, _), C = new Set(b), V = a.updateType === "update" ? r.join(".") : r.slice(0, -1).join(".") || "";
        for (const [
          R,
          v
        ] of N.components.entries()) {
          let D = !1;
          const $ = Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"];
          if (console.log("component", v), !$.includes("none")) {
            if ($.includes("all")) {
              v.forceUpdate();
              continue;
            }
            if ($.includes("component") && ((v.paths.has(V) || v.paths.has("")) && (D = !0), !D))
              for (const z of C) {
                let B = z;
                for (; ; ) {
                  if (v.paths.has(B)) {
                    D = !0;
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
                    ) && v.paths.has(ue)) {
                      D = !0;
                      break;
                    }
                    B = ue;
                  } else
                    B = "";
                  if (B === "")
                    break;
                }
                if (D) break;
              }
            if (!D && $.includes("deps") && v.depsFunction) {
              const z = v.depsFunction(_);
              let B = !1;
              typeof z == "boolean" ? z && (B = !0) : q(v.deps, z) || (v.deps = z, B = !0), B && (D = !0);
            }
            D && v.forceUpdate();
          }
        }
      }
      const w = Date.now();
      r = r.map((b, C) => {
        const V = r.slice(0, -1), R = Z(_, V);
        return C === r.length - 1 && ["insert", "cut"].includes(a.updateType) ? (R.length - 1).toString() : b;
      });
      const { oldValue: k, newValue: j } = et(
        a.updateType,
        u,
        _,
        r
      ), Y = {
        timeStamp: w,
        stateKey: T,
        path: r,
        updateType: a.updateType,
        status: "new",
        oldValue: k,
        newValue: j
      };
      switch (a.updateType) {
        case "update":
          f.updateShadowAtPath(T, r, _);
          break;
        case "insert":
          const b = r.slice(0, -1);
          f.insertShadowArrayElement(T, b, j);
          break;
        case "cut":
          const C = r.slice(0, -1), V = parseInt(r[r.length - 1]);
          f.removeShadowArrayElement(T, C, V);
          break;
      }
      if (Ze(T, (b) => {
        const V = [...b ?? [], Y].reduce((R, v) => {
          const D = `${v.stateKey}:${JSON.stringify(v.path)}`, $ = R.get(D);
          return $ ? ($.timeStamp = Math.max($.timeStamp, v.timeStamp), $.newValue = v.newValue, $.oldValue = $.oldValue ?? v.oldValue, $.updateType = v.updateType) : R.set(D, { ...v }), R;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), Pe(
        _,
        T,
        P.current,
        L
      ), P.current?.middleware && P.current.middleware({
        updateLog: l,
        update: Y
      }), P.current?.serverSync) {
        const b = f.serverState[T], C = P.current?.serverSync;
        Qe(T, {
          syncKey: typeof C.syncKey == "string" ? C.syncKey : C.syncKey({ state: _ }),
          rollBackState: b,
          actionTimeStamp: Date.now() + (C.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return _;
    });
  };
  o.getState().updaterState[T] || (Te(
    T,
    he(
      T,
      ae,
      ee.current,
      L
    )
  ), o.getState().cogsStateStore[T] || ne(T, e), o.getState().initialStateGlobal[T] || Ne(T, e));
  const d = Ee(() => he(
    T,
    ae,
    ee.current,
    L
  ), [T, L]);
  return [Le(T), d];
}
function he(e, i, m, g) {
  const I = /* @__PURE__ */ new Map();
  let A = 0;
  const O = (h) => {
    const n = h.join(".");
    for (const [S] of I)
      (S === n || S.startsWith(n + ".")) && I.delete(S);
    A++;
  }, y = {
    removeValidation: (h) => {
      h?.validationKey && X(h.validationKey);
    },
    revertToInitialState: (h) => {
      const n = o.getState().getInitialOptions(e)?.validation;
      n?.key && X(n?.key), h?.validationKey && X(h.validationKey);
      const S = o.getState().initialStateGlobal[e];
      o.getState().clearSelectedIndexesForState(e), I.clear(), A++;
      const F = s(S, []), G = re(e), L = K(G?.localStorage?.key) ? G?.localStorage?.key(S) : G?.localStorage?.key, W = `${g}-${e}-${L}`;
      W && localStorage.removeItem(W), Te(e, F), ne(e, S);
      const T = o.getState().stateComponents.get(e);
      return T && T.components.forEach((l) => {
        l.forceUpdate();
      }), S;
    },
    updateInitialState: (h) => {
      I.clear(), A++;
      const n = he(
        e,
        i,
        m,
        g
      ), S = o.getState().initialStateGlobal[e], F = re(e), G = K(F?.localStorage?.key) ? F?.localStorage?.key(S) : F?.localStorage?.key, L = `${g}-${e}-${G}`;
      return localStorage.getItem(L) && localStorage.removeItem(L), je(() => {
        Ne(e, h), o.getState().initializeShadowState(e, h), Te(e, n), ne(e, h);
        const W = o.getState().stateComponents.get(e);
        W && W.components.forEach((T) => {
          T.forceUpdate();
        });
      }), {
        fetchId: (W) => n.get()[W]
      };
    },
    _initialState: o.getState().initialStateGlobal[e],
    _serverState: o.getState().serverState[e],
    _isLoading: o.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const h = o.getState().serverState[e];
      return !!(h && q(h, Le(e)));
    }
  };
  function s(h, n = [], S) {
    const F = n.map(String).join(".");
    I.get(F);
    const G = function() {
      return o().getNestedState(e, n);
    };
    Object.keys(y).forEach((T) => {
      G[T] = y[T];
    });
    const L = {
      apply(T, l, de) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), o().getNestedState(e, n);
      },
      get(T, l) {
        S?.validIndices && !Array.isArray(h) && (S = { ...S, validIndices: void 0 });
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
          return () => we(
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
                  const _ = [a, ...u.path].join(".");
                  o.getState().addValidationError(_, u.message);
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
          return q(d, r) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = o().getNestedState(
              e,
              n
            ), t = o.getState().initialStateGlobal[e], r = Z(t, n);
            return q(d, r) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = o.getState().initialStateGlobal[e], t = re(e), r = K(t?.localStorage?.key) ? t?.localStorage?.key(d) : t?.localStorage?.key, a = `${g}-${e}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = o.getState().getInitialOptions(e)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(d.key + "." + n.join("."));
          };
        if (Array.isArray(h)) {
          const d = () => S?.validIndices ? h.map((r, a) => ({
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
                  h[t],
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
              } = t, u = J(!1), _ = J(null), [p, E] = Q({
                startIndex: 0,
                endIndex: 10
              }), [N, w] = Q("IDLE_AT_TOP"), k = J(!1), j = J(0), Y = J(f), b = J(0), [C, V] = Q(0);
              oe(() => o.getState().subscribeToShadowState(e, () => {
                V((x) => x + 1);
              }), [e]);
              const R = o().getNestedState(
                e,
                n
              ), v = R.length, { totalHeight: D, positions: $ } = Ee(() => {
                const M = o.getState().getShadowMetadata(e, n) || [];
                let x = 0;
                const H = [];
                for (let U = 0; U < v; U++) {
                  H[U] = x;
                  const te = M[U]?.virtualizer?.itemHeight;
                  x += te || r;
                }
                return { totalHeight: x, positions: H };
              }, [
                v,
                e,
                n.join("."),
                r,
                C
              ]), z = Ee(() => {
                const M = Math.max(0, p.startIndex), x = Math.min(v, p.endIndex), H = Array.from(
                  { length: x - M },
                  (te, ge) => M + ge
                ), U = H.map((te) => R[te]);
                return s(U, n, {
                  ...S,
                  validIndices: H
                });
              }, [p.startIndex, p.endIndex, R, v]);
              ce(() => {
                const M = !q(
                  f,
                  Y.current
                ), x = v > j.current;
                if (M) {
                  console.log("TRANSITION: Deps changed -> IDLE_AT_TOP"), w("IDLE_AT_TOP");
                  return;
                }
                x && N === "LOCKED_AT_BOTTOM" && c && (console.log(
                  "TRANSITION: New items arrived while locked -> GETTING_HEIGHTS"
                ), w("GETTING_HEIGHTS")), j.current = v, Y.current = f;
              }, [v, ...f]), ce(() => {
                const M = _.current;
                if (!M) return;
                let x;
                if (N === "IDLE_AT_TOP" && c && v > 0)
                  console.log(
                    "ACTION (IDLE_AT_TOP): Data has arrived -> GETTING_HEIGHTS"
                  ), w("GETTING_HEIGHTS");
                else if (N === "GETTING_HEIGHTS")
                  console.log(
                    "ACTION (GETTING_HEIGHTS): Setting range to end and starting loop."
                  ), E({
                    startIndex: Math.max(0, v - 10 - a),
                    endIndex: v
                  }), x = setInterval(() => {
                    const H = v - 1;
                    ((o.getState().getShadowMetadata(e, n) || [])[H]?.virtualizer?.itemHeight || 0) > 0 && (clearInterval(x), u.current || (console.log(
                      "ACTION (GETTING_HEIGHTS): Measurement success -> SCROLLING_TO_BOTTOM"
                    ), w("SCROLLING_TO_BOTTOM")));
                  }, 100);
                else if (N === "SCROLLING_TO_BOTTOM") {
                  console.log(
                    "ACTION (SCROLLING_TO_BOTTOM): Executing scroll."
                  ), k.current = !0;
                  const H = j.current === 0 ? "auto" : "smooth";
                  M.scrollTo({
                    top: M.scrollHeight,
                    behavior: H
                  });
                  const U = setTimeout(
                    () => {
                      console.log(
                        "ACTION (SCROLLING_TO_BOTTOM): Scroll finished -> LOCKED_AT_BOTTOM"
                      ), k.current = !1, u.current = !1, w("LOCKED_AT_BOTTOM");
                    },
                    H === "smooth" ? 500 : 50
                  );
                  return () => clearTimeout(U);
                }
                return () => {
                  x && clearInterval(x);
                };
              }, [N, v, $]), oe(() => {
                const M = _.current;
                if (!M) return;
                const x = r, H = () => {
                  if (k.current)
                    return;
                  const { scrollTop: U, scrollHeight: te, clientHeight: ge } = M;
                  if (te - U - ge < 10 ? N !== "LOCKED_AT_BOTTOM" && (console.log("OCKED_AT_BOTTOM"), u.current = !1, w("LOCKED_AT_BOTTOM")) : N !== "IDLE_NOT_AT_BOTTOM" && (console.log("Scrolled up -> IDLE_NOT_AT_BOTTOM"), u.current = !0, w("IDLE_NOT_AT_BOTTOM")), Math.abs(U - b.current) < x)
                    return;
                  console.log(
                    `Threshold passed at ${U}px. Recalculating range...`
                  );
                  let ye = v - 1, pe = 0, Ce = 0;
                  for (; pe <= ye; ) {
                    const Se = Math.floor((pe + ye) / 2);
                    $[Se] < U ? (Ce = Se, pe = Se + 1) : ye = Se - 1;
                  }
                  const $e = Math.max(0, Ce - a);
                  let fe = $e;
                  const De = U + ge;
                  for (; fe < v && $[fe] < De; )
                    fe++;
                  E({
                    startIndex: $e,
                    endIndex: Math.min(v, fe + a)
                  }), b.current = U;
                };
                return M.addEventListener("scroll", H, {
                  passive: !0
                }), () => M.removeEventListener("scroll", H);
              }, [v, $, r, a, N]);
              const B = ke(() => {
                console.log(
                  "USER ACTION: Clicked scroll button -> SCROLLING_TO_BOTTOM"
                ), w("SCROLLING_TO_BOTTOM");
              }, []), se = ke(
                (M, x = "smooth") => {
                  _.current && $[M] !== void 0 && (w("IDLE_NOT_AT_BOTTOM"), _.current.scrollTo({
                    top: $[M],
                    behavior: x
                  }));
                },
                [$]
              ), ue = {
                outer: {
                  ref: _,
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
                    transform: `translateY(${$[p.startIndex] || 0}px)`
                  }
                }
              };
              return {
                virtualState: z,
                virtualizerProps: ue,
                scrollToBottom: B,
                scrollToIndex: se
              };
            };
          if (l === "stateSort")
            return (t) => {
              const a = [...d()].sort(
                (u, _) => t(u.item, _.item)
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
                ({ item: u }, _) => t(u, _)
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
                const u = r[c], _ = [...n, c.toString()], p = s(u, _, S);
                return t(u, p, {
                  register: () => {
                    const [, N] = Q({}), w = `${m}-${n.join(".")}-${c}`;
                    ce(() => {
                      const k = `${e}////${w}`, j = o.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return j.components.set(k, {
                        forceUpdate: () => N({}),
                        paths: /* @__PURE__ */ new Set([_.join(".")])
                      }), o.getState().stateComponents.set(e, j), () => {
                        const Y = o.getState().stateComponents.get(e);
                        Y && Y.components.delete(k);
                      };
                    }, [e, w]);
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
            return (t) => h.map((a, c) => {
              let f;
              S?.validIndices && S.validIndices[c] !== void 0 ? f = S.validIndices[c] : f = c;
              const u = [...n, f.toString()], _ = s(a, u, S);
              return t(
                a,
                _,
                c,
                h,
                s(h, n, S)
              );
            });
          if (l === "$stateMap")
            return (t) => le(nt, {
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
                const u = r[c], _ = [...n, c.toString()], p = s(u, _, S), E = `${m}-${n.join(".")}-${c}`;
                return le(ot, {
                  key: c,
                  stateKey: e,
                  itemComponentId: E,
                  itemPath: _,
                  children: t(
                    u,
                    p,
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
              const r = h;
              I.clear(), A++;
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
              const r = h[t];
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
            return (t) => (O(n), Oe(i, t, n, e), s(
              o.getState().getNestedState(e, n),
              n
            ));
          if (l === "uniqueInsert")
            return (t, r, a) => {
              const c = o.getState().getNestedState(e, n), f = K(t) ? t(c) : t;
              let u = null;
              if (!c.some((p) => {
                if (r) {
                  const N = r.every(
                    (w) => q(p[w], f[w])
                  );
                  return N && (u = p), N;
                }
                const E = q(p, f);
                return E && (u = p), E;
              }))
                O(n), Oe(i, f, n, e);
              else if (a && u) {
                const p = a(u), E = c.map(
                  (N) => q(N, u) ? p : N
                );
                O(n), ie(i, E, n);
              }
            };
          if (l === "cut")
            return (t, r) => {
              if (!r?.waitForSync)
                return O(n), me(i, n, e, t), s(
                  o.getState().getNestedState(e, n),
                  n
                );
            };
          if (l === "cutByValue")
            return (t) => {
              for (let r = 0; r < h.length; r++)
                h[r] === t && me(i, n, e, r);
            };
          if (l === "toggleByValue")
            return (t) => {
              const r = h.findIndex((a) => a === t);
              r > -1 ? me(i, n, e, r) : Oe(i, t, n, e);
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
        const ee = n[n.length - 1];
        if (!isNaN(Number(ee))) {
          const d = n.slice(0, -1), t = o.getState().getNestedState(e, d);
          if (Array.isArray(t) && l === "cut")
            return () => me(
              i,
              d,
              e,
              Number(ee)
            );
        }
        if (l === "get")
          return () => {
            if (S?.validIndices && Array.isArray(h)) {
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
            ie(i, c, t), O(t);
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
            ie(i, c, d), O(d);
          };
        if (n.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const t = o.getState().cogsStateStore[e], a = qe(t, d).newDocument;
              Re(
                e,
                o.getState().initialStateGlobal[e],
                a,
                i,
                m,
                g
              );
              const c = o.getState().stateComponents.get(e);
              if (c) {
                const f = we(t, a), u = new Set(f);
                for (const [
                  _,
                  p
                ] of c.components.entries()) {
                  let E = !1;
                  const N = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!N.includes("none")) {
                    if (N.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (N.includes("component") && (p.paths.has("") && (E = !0), !E))
                      for (const w of u) {
                        if (p.paths.has(w)) {
                          E = !0;
                          break;
                        }
                        let k = w.lastIndexOf(".");
                        for (; k !== -1; ) {
                          const j = w.substring(0, k);
                          if (p.paths.has(j)) {
                            E = !0;
                            break;
                          }
                          const Y = w.substring(
                            k + 1
                          );
                          if (!isNaN(Number(Y))) {
                            const b = j.lastIndexOf(".");
                            if (b !== -1) {
                              const C = j.substring(
                                0,
                                b
                              );
                              if (p.paths.has(C)) {
                                E = !0;
                                break;
                              }
                            }
                          }
                          k = j.lastIndexOf(".");
                        }
                        if (E) break;
                      }
                    if (!E && N.includes("deps") && p.depsFunction) {
                      const w = p.depsFunction(a);
                      let k = !1;
                      typeof w == "boolean" ? w && (k = !0) : q(p.deps, w) || (p.deps = w, k = !0), k && (E = !0);
                    }
                    E && p.forceUpdate();
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
              X(d.key);
              const r = o.getState().cogsStateStore[e];
              try {
                const a = o.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([f]) => {
                  f && f.startsWith(d.key) && X(f);
                });
                const c = d.zodSchema.safeParse(r);
                return c.success ? !0 : (c.error.errors.forEach((u) => {
                  const _ = u.path, p = u.message, E = [d.key, ..._].join(".");
                  t(E, p);
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
            return y.revertToInitialState;
          if (l === "updateInitialState") return y.updateInitialState;
          if (l === "removeValidation") return y.removeValidation;
        }
        if (l === "getFormRef")
          return () => be.getState().getFormRef(e + "." + n.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: t
          }) => /* @__PURE__ */ _e(
            Fe,
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
        if (l === "_isServerSynced") return y._isServerSynced;
        if (l === "update")
          return (d, t) => {
            if (t?.debounce)
              He(() => {
                ie(i, d, n, "");
                const r = o.getState().getNestedState(e, n);
                t?.afterUpdate && t.afterUpdate(r);
              }, t.debounce);
            else {
              ie(i, d, n, "");
              const r = o.getState().getNestedState(e, n);
              t?.afterUpdate && t.afterUpdate(r);
            }
            O(n);
          };
        if (l === "formElement")
          return (d, t) => /* @__PURE__ */ _e(
            We,
            {
              setState: i,
              stateKey: e,
              path: n,
              child: d,
              formOpts: t
            }
          );
        const P = [...n, l], ae = o.getState().getNestedState(e, P);
        return s(ae, P, S);
      }
    }, W = new Proxy(G, L);
    return I.set(F, {
      proxy: W,
      stateVersion: A
    }), W;
  }
  return s(
    o.getState().getNestedState(e, [])
  );
}
function Ve(e) {
  return le(rt, { proxy: e });
}
function nt({
  proxy: e,
  rebuildStateShape: i
}) {
  const m = o().getNestedState(e._stateKey, e._path);
  return Array.isArray(m) ? i(
    m,
    e._path
  ).stateMapNoRender(
    (I, A, O, y, s) => e._mapFn(I, A, O, y, s)
  ) : null;
}
function rt({
  proxy: e
}) {
  const i = J(null), m = `${e._stateKey}-${e._path.join(".")}`;
  return oe(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const I = g.parentElement, O = Array.from(I.childNodes).indexOf(g);
    let y = I.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, I.setAttribute("data-parent-id", y));
    const h = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: O,
      effect: e._effect
    };
    o.getState().addSignalElement(m, h);
    const n = o.getState().getNestedState(e._stateKey, e._path);
    let S;
    if (e._effect)
      try {
        S = new Function(
          "state",
          `return (${e._effect})(state)`
        )(n);
      } catch (G) {
        console.error("Error evaluating effect function during mount:", G), S = n;
      }
    else
      S = n;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const F = document.createTextNode(String(S));
    g.replaceWith(F);
  }, [e._stateKey, e._path.join("."), e._effect]), le("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function yt(e) {
  const i = Ue(
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
function ot({
  stateKey: e,
  itemComponentId: i,
  itemPath: m,
  children: g
}) {
  const [, I] = Q({}), [A, O] = Je(), y = J(null);
  return oe(() => {
    O.height > 0 && O.height !== y.current && (y.current = O.height, o.getState().setShadowMetadata(e, m, {
      virtualizer: {
        itemHeight: O.height
      }
    }));
  }, [O.height, e, m]), ce(() => {
    const s = `${e}////${i}`, h = o.getState().stateComponents.get(e) || {
      components: /* @__PURE__ */ new Map()
    };
    return h.components.set(s, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set([m.join(".")])
    }), o.getState().stateComponents.set(e, h), () => {
      const n = o.getState().stateComponents.get(e);
      n && n.components.delete(s);
    };
  }, [e, i, m.join(".")]), /* @__PURE__ */ _e("div", { ref: A, children: g });
}
export {
  Ve as $cogsSignal,
  yt as $cogsSignalStore,
  ht as addStateOptions,
  It as createCogsState,
  vt as notifyComponent,
  tt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
