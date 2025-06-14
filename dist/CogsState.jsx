"use client";
import { jsx as Se } from "react/jsx-runtime";
import { useState as te, useRef as ee, useEffect as le, useLayoutEffect as pe, useMemo as ke, createElement as ae, useSyncExternalStore as Te, startTransition as Ae } from "react";
import { transformStateFunc as Ne, isDeepEqual as G, isFunction as J, getNestedValue as L, getDifferences as de, debounce as Ve } from "./utility.js";
import { pushFunc as ce, updateFn as X, cutFunc as K, ValidationWrapper as be, FormControlComponent as Ce } from "./Functions.jsx";
import Pe from "superjson";
import { v4 as ue } from "uuid";
import "zod";
import { getGlobalStore as n, formRefStore as me } from "./store.js";
import { useCogsConfig as we } from "./CogsStateClient.jsx";
import { applyPatch as _e } from "fast-json-patch";
function ye(e, s) {
  const y = n.getState().getInitialOptions, g = n.getState().setInitialStateOptions, m = y(e) || {};
  g(e, {
    ...m,
    ...s
  });
}
function ve({
  stateKey: e,
  options: s,
  initialOptionsPart: y
}) {
  const g = H(e) || {}, m = y[e] || {}, $ = n.getState().setInitialStateOptions, w = { ...m, ...g };
  let h = !1;
  if (s)
    for (const i in s)
      w.hasOwnProperty(i) ? (i == "localStorage" && s[i] && w[i].key !== s[i]?.key && (h = !0, w[i] = s[i]), i == "initialState" && s[i] && w[i] !== s[i] && // Different references
      !G(w[i], s[i]) && (h = !0, w[i] = s[i])) : (h = !0, w[i] = s[i]);
  h && $(e, w);
}
function Qe(e, { formElements: s, validation: y }) {
  return { initialState: e, formElements: s, validation: y };
}
const Ke = (e, s) => {
  let y = e;
  const [g, m] = Ne(y);
  (Object.keys(m).length > 0 || s && Object.keys(s).length > 0) && Object.keys(m).forEach((h) => {
    m[h] = m[h] || {}, m[h].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...m[h].formElements || {}
      // State-specific overrides
    }, H(h) || n.getState().setInitialStateOptions(h, m[h]);
  }), n.getState().setInitialStates(g), n.getState().setCreatedState(g);
  const $ = (h, i) => {
    const [v] = te(i?.componentId ?? ue());
    ve({
      stateKey: h,
      options: i,
      initialOptionsPart: m
    });
    const r = n.getState().cogsStateStore[h] || g[h], f = i?.modifyState ? i.modifyState(r) : r, [U, C] = Me(
      f,
      {
        stateKey: h,
        syncUpdate: i?.syncUpdate,
        componentId: v,
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
    return C;
  };
  function w(h, i) {
    ve({ stateKey: h, options: i, initialOptionsPart: m }), i.localStorage && Re(h, i), ie(h);
  }
  return { useCogsState: $, setCogsOptions: w };
}, {
  setUpdaterState: ne,
  setState: Z,
  getInitialOptions: H,
  getKeyState: Ee,
  getValidationErrors: xe,
  setStateLog: Oe,
  updateInitialStateGlobal: ge,
  addValidationError: je,
  removeValidationError: B,
  setServerSyncActions: Fe
} = n.getState(), Ie = (e, s, y, g, m) => {
  y?.log && console.log(
    "saving to localstorage",
    s,
    y.localStorage?.key,
    g
  );
  const $ = J(y?.localStorage?.key) ? y.localStorage?.key(e) : y?.localStorage?.key;
  if ($ && g) {
    const w = `${g}-${s}-${$}`;
    let h;
    try {
      h = oe(w)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: m ?? h
    }, v = Pe.serialize(i);
    window.localStorage.setItem(
      w,
      JSON.stringify(v.json)
    );
  }
}, oe = (e) => {
  if (!e) return null;
  try {
    const s = window.localStorage.getItem(e);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, Re = (e, s) => {
  const y = n.getState().cogsStateStore[e], { sessionId: g } = we(), m = J(s?.localStorage?.key) ? s.localStorage.key(y) : s?.localStorage?.key;
  if (m && g) {
    const $ = oe(
      `${g}-${e}-${m}`
    );
    if ($ && $.lastUpdated > ($.lastSyncedWithServer || 0))
      return Z(e, $.state), ie(e), !0;
  }
  return !1;
}, $e = (e, s, y, g, m, $) => {
  const w = {
    initialState: s,
    updaterState: re(
      e,
      g,
      m,
      $
    ),
    state: y
  };
  ge(e, w.initialState), ne(e, w.updaterState), Z(e, w.state);
}, ie = (e) => {
  const s = n.getState().stateComponents.get(e);
  if (!s) return;
  const y = /* @__PURE__ */ new Set();
  s.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || y.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    y.forEach((g) => g());
  });
}, et = (e, s) => {
  const y = n.getState().stateComponents.get(e);
  if (y) {
    const g = `${e}////${s}`, m = y.components.get(g);
    if ((m ? Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"] : null)?.includes("none"))
      return;
    m && m.forceUpdate();
  }
}, Ue = (e, s, y, g) => {
  switch (e) {
    case "update":
      return {
        oldValue: L(s, g),
        newValue: L(y, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: L(y, g)
      };
    case "cut":
      return {
        oldValue: L(s, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Me(e, {
  stateKey: s,
  serverSync: y,
  localStorage: g,
  formElements: m,
  reactiveDeps: $,
  reactiveType: w,
  componentId: h,
  initialState: i,
  syncUpdate: v,
  dependencies: r,
  serverState: f
} = {}) {
  const [U, C] = te({}), { sessionId: P } = we();
  let M = !s;
  const [S] = te(s ?? ue()), c = n.getState().stateLog[S], Q = ee(/* @__PURE__ */ new Set()), z = ee(h ?? ue()), V = ee(
    null
  );
  V.current = H(S) ?? null, le(() => {
    if (v && v.stateKey === S && v.path?.[0]) {
      Z(S, (a) => ({
        ...a,
        [v.path[0]]: v.newValue
      }));
      const t = `${v.stateKey}:${v.path.join(".")}`;
      n.getState().setSyncInfo(t, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), le(() => {
    if (i) {
      ye(S, {
        initialState: i
      });
      const t = V.current, o = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, l = n.getState().initialStateGlobal[S];
      if (!(l && !G(l, i) || !l) && !o)
        return;
      let u = null;
      const A = J(t?.localStorage?.key) ? t?.localStorage?.key(i) : t?.localStorage?.key;
      A && P && (u = oe(`${P}-${S}-${A}`));
      let p = i, k = !1;
      const b = o ? Date.now() : 0, N = u?.lastUpdated || 0, _ = u?.lastSyncedWithServer || 0;
      o && b > N ? (p = t.serverState.data, k = !0) : u && N > _ && (p = u.state, t?.localStorage?.onChange && t?.localStorage?.onChange(p)), $e(
        S,
        i,
        p,
        Y,
        z.current,
        P
      ), k && A && P && Ie(p, S, t, P, Date.now()), ie(S), (Array.isArray(w) ? w : [w || "component"]).includes("none") || C({});
    }
  }, [
    i,
    f?.status,
    f?.data,
    ...r || []
  ]), pe(() => {
    M && ye(S, {
      serverSync: y,
      formElements: m,
      initialState: i,
      localStorage: g,
      middleware: V.current?.middleware
    });
    const t = `${S}////${z.current}`, a = n.getState().stateComponents.get(S) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(t, {
      forceUpdate: () => C({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: $ || void 0,
      reactiveType: w ?? ["component", "deps"]
    }), n.getState().stateComponents.set(S, a), C({}), () => {
      const o = `${S}////${z.current}`;
      a && (a.components.delete(o), a.components.size === 0 && n.getState().stateComponents.delete(S));
    };
  }, []);
  const Y = (t, a, o, l) => {
    if (Array.isArray(a)) {
      const I = `${S}-${a.join(".")}`;
      Q.current.add(I);
    }
    Z(S, (I) => {
      const u = J(t) ? t(I) : t, A = `${S}-${a.join(".")}`;
      if (A) {
        let F = !1, T = n.getState().signalDomElements.get(A);
        if ((!T || T.size === 0) && (o.updateType === "insert" || o.updateType === "cut")) {
          const x = a.slice(0, -1), D = L(u, x);
          if (Array.isArray(D)) {
            F = !0;
            const E = `${S}-${x.join(".")}`;
            T = n.getState().signalDomElements.get(E);
          }
        }
        if (T) {
          const x = F ? L(u, a.slice(0, -1)) : L(u, a);
          T.forEach(({ parentId: D, position: E, effect: j }) => {
            const O = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (O) {
              const q = Array.from(O.childNodes);
              if (q[E]) {
                const R = j ? new Function("state", `return (${j})(state)`)(x) : x;
                q[E].textContent = String(R);
              }
            }
          });
        }
      }
      o.updateType === "update" && (l || V.current?.validation?.key) && a && B(
        (l || V.current?.validation?.key) + "." + a.join(".")
      );
      const p = a.slice(0, a.length - 1);
      o.updateType === "cut" && V.current?.validation?.key && B(
        V.current?.validation?.key + "." + p.join(".")
      ), o.updateType === "insert" && V.current?.validation?.key && xe(
        V.current?.validation?.key + "." + p.join(".")
      ).filter(([T, x]) => {
        let D = T?.split(".").length;
        if (T == p.join(".") && D == p.length - 1) {
          let E = T + "." + p;
          B(T), je(E, x);
        }
      });
      const k = n.getState().stateComponents.get(S);
      if (console.log("stateEntry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", k), k) {
        const F = de(I, u), T = new Set(F), x = o.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          D,
          E
        ] of k.components.entries()) {
          let j = !1;
          const O = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (console.log("component", E), !O.includes("none")) {
            if (O.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if (O.includes("component") && ((E.paths.has(x) || E.paths.has("")) && (j = !0), !j))
              for (const q of T) {
                let R = q;
                for (; ; ) {
                  if (E.paths.has(R)) {
                    j = !0;
                    break;
                  }
                  const se = R.lastIndexOf(".");
                  if (se !== -1) {
                    const fe = R.substring(
                      0,
                      se
                    );
                    if (!isNaN(
                      Number(R.substring(se + 1))
                    ) && E.paths.has(fe)) {
                      j = !0;
                      break;
                    }
                    R = fe;
                  } else
                    R = "";
                  if (R === "")
                    break;
                }
                if (j) break;
              }
            if (!j && O.includes("deps") && E.depsFunction) {
              const q = E.depsFunction(u);
              let R = !1;
              typeof q == "boolean" ? q && (R = !0) : G(E.deps, q) || (E.deps = q, R = !0), R && (j = !0);
            }
            j && E.forceUpdate();
          }
        }
      }
      const b = Date.now();
      a = a.map((F, T) => {
        const x = a.slice(0, -1), D = L(u, x);
        return T === a.length - 1 && ["insert", "cut"].includes(o.updateType) ? (D.length - 1).toString() : F;
      });
      const { oldValue: N, newValue: _ } = Ue(
        o.updateType,
        I,
        u,
        a
      ), W = {
        timeStamp: b,
        stateKey: S,
        path: a,
        updateType: o.updateType,
        status: "new",
        oldValue: N,
        newValue: _
      };
      if (Oe(S, (F) => {
        const x = [...F ?? [], W].reduce((D, E) => {
          const j = `${E.stateKey}:${JSON.stringify(E.path)}`, O = D.get(j);
          return O ? (O.timeStamp = Math.max(O.timeStamp, E.timeStamp), O.newValue = E.newValue, O.oldValue = O.oldValue ?? E.oldValue, O.updateType = E.updateType) : D.set(j, { ...E }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(x.values());
      }), Ie(
        u,
        S,
        V.current,
        P
      ), V.current?.middleware && V.current.middleware({
        updateLog: c,
        update: W
      }), V.current?.serverSync) {
        const F = n.getState().serverState[S], T = V.current?.serverSync;
        Fe(S, {
          syncKey: typeof T.syncKey == "string" ? T.syncKey : T.syncKey({ state: u }),
          rollBackState: F,
          actionTimeStamp: Date.now() + (T.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return u;
    });
  };
  n.getState().updaterState[S] || (ne(
    S,
    re(
      S,
      Y,
      z.current,
      P
    )
  ), n.getState().cogsStateStore[S] || Z(S, e), n.getState().initialStateGlobal[S] || ge(S, e));
  const d = ke(() => re(
    S,
    Y,
    z.current,
    P
  ), [S, P]);
  return [Ee(S), d];
}
function re(e, s, y, g) {
  const m = /* @__PURE__ */ new Map();
  let $ = 0;
  const w = (v) => {
    const r = v.join(".");
    for (const [f] of m)
      (f === r || f.startsWith(r + ".")) && m.delete(f);
    $++;
  }, h = {
    removeValidation: (v) => {
      v?.validationKey && B(v.validationKey);
    },
    revertToInitialState: (v) => {
      const r = n.getState().getInitialOptions(e)?.validation;
      r?.key && B(r?.key), v?.validationKey && B(v.validationKey);
      const f = n.getState().initialStateGlobal[e];
      n.getState().clearSelectedIndexesForState(e), m.clear(), $++;
      const U = i(f, []), C = H(e), P = J(C?.localStorage?.key) ? C?.localStorage?.key(f) : C?.localStorage?.key, M = `${g}-${e}-${P}`;
      M && localStorage.removeItem(M), ne(e, U), Z(e, f);
      const S = n.getState().stateComponents.get(e);
      return S && S.components.forEach((c) => {
        c.forceUpdate();
      }), f;
    },
    updateInitialState: (v) => {
      m.clear(), $++;
      const r = re(
        e,
        s,
        y,
        g
      ), f = n.getState().initialStateGlobal[e], U = H(e), C = J(U?.localStorage?.key) ? U?.localStorage?.key(f) : U?.localStorage?.key, P = `${g}-${e}-${C}`;
      return localStorage.getItem(P) && localStorage.removeItem(P), Ae(() => {
        ge(e, v), ne(e, r), Z(e, v);
        const M = n.getState().stateComponents.get(e);
        M && M.components.forEach((S) => {
          S.forceUpdate();
        });
      }), {
        fetchId: (M) => r.get()[M]
      };
    },
    _initialState: n.getState().initialStateGlobal[e],
    _serverState: n.getState().serverState[e],
    _isLoading: n.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const v = n.getState().serverState[e];
      return !!(v && G(v, Ee(e)));
    }
  };
  function i(v, r = [], f) {
    const U = r.map(String).join(".");
    m.get(U);
    const C = function() {
      return n().getNestedState(e, r);
    };
    Object.keys(h).forEach((S) => {
      C[S] = h[S];
    });
    const P = {
      apply(S, c, Q) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${r.join(".")}`
        ), console.trace("Apply trap stack trace"), n().getNestedState(e, r);
      },
      get(S, c) {
        f?.validIndices && !Array.isArray(v) && (f = { ...f, validIndices: void 0 });
        const Q = /* @__PURE__ */ new Set([
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
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender" && !Q.has(c)) {
          const d = `${e}////${y}`, t = n.getState().stateComponents.get(e);
          if (t) {
            const a = t.components.get(d);
            if (a && !a.paths.has("")) {
              const o = r.join(".");
              let l = !0;
              for (const I of a.paths)
                if (o.startsWith(I) && (o === I || o[I.length] === ".")) {
                  l = !1;
                  break;
                }
              l && a.paths.add(o);
            }
          }
        }
        if (c === "getDifferences")
          return () => de(
            n.getState().cogsStateStore[e],
            n.getState().initialStateGlobal[e]
          );
        if (c === "sync" && r.length === 0)
          return async function() {
            const d = n.getState().getInitialOptions(e), t = d?.sync;
            if (!t)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const a = n.getState().getNestedState(e, []), o = d?.validation?.key;
            try {
              const l = await t.action(a);
              if (l && !l.success && l.errors && o) {
                n.getState().removeValidationError(o), l.errors.forEach((u) => {
                  const A = [o, ...u.path].join(".");
                  n.getState().addValidationError(A, u.message);
                });
                const I = n.getState().stateComponents.get(e);
                I && I.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return l?.success && t.onSuccess ? t.onSuccess(l.data) : !l?.success && t.onError && t.onError(l.error), l;
            } catch (l) {
              return t.onError && t.onError(l), { success: !1, error: l };
            }
          };
        if (c === "_status") {
          const d = n.getState().getNestedState(e, r), t = n.getState().initialStateGlobal[e], a = L(t, r);
          return G(d, a) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const d = n().getNestedState(
              e,
              r
            ), t = n.getState().initialStateGlobal[e], a = L(t, r);
            return G(d, a) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const d = n.getState().initialStateGlobal[e], t = H(e), a = J(t?.localStorage?.key) ? t?.localStorage?.key(d) : t?.localStorage?.key, o = `${g}-${e}-${a}`;
            o && localStorage.removeItem(o);
          };
        if (c === "showValidationErrors")
          return () => {
            const d = n.getState().getInitialOptions(e)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return n.getState().getValidationErrors(d.key + "." + r.join("."));
          };
        if (Array.isArray(v)) {
          const d = () => f?.validIndices ? v.map((a, o) => ({
            item: a,
            originalIndex: f.validIndices[o]
          })) : n.getState().getNestedState(e, r).map((a, o) => ({
            item: a,
            originalIndex: o
          }));
          if (c === "getSelected")
            return () => {
              const t = n.getState().getSelectedIndex(e, r.join("."));
              if (t !== void 0)
                return i(
                  v[t],
                  [...r, t.toString()],
                  f
                );
            };
          if (c === "clearSelected")
            return () => {
              n.getState().clearSelectedIndex({ stateKey: e, path: r });
            };
          if (c === "getSelectedIndex")
            return () => n.getState().getSelectedIndex(e, r.join(".")) ?? -1;
          if (c === "stateSort")
            return (t) => {
              const o = [...d()].sort(
                (u, A) => t(u.item, A.item)
              ), l = o.map(({ item: u }) => u), I = {
                ...f,
                validIndices: o.map(
                  ({ originalIndex: u }) => u
                )
              };
              return i(l, r, I);
            };
          if (c === "stateFilter")
            return (t) => {
              const o = d().filter(
                ({ item: u }, A) => t(u, A)
              ), l = o.map(({ item: u }) => u), I = {
                ...f,
                validIndices: o.map(
                  ({ originalIndex: u }) => u
                )
              };
              return i(l, r, I);
            };
          if (c === "stateMap")
            return (t) => {
              const a = n.getState().getNestedState(e, r);
              return Array.isArray(a) ? a.map((o, l) => {
                let I;
                f?.validIndices && f.validIndices[l] !== void 0 ? I = f.validIndices[l] : I = l;
                const u = [...r, I.toString()], A = i(o, u, f);
                return t(o, A, {
                  register: () => {
                    const [, k] = te({}), b = `${y}-${r.join(".")}-${I}`;
                    pe(() => {
                      const N = `${e}////${b}`, _ = n.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map()
                      };
                      return _.components.set(N, {
                        forceUpdate: () => k({}),
                        paths: /* @__PURE__ */ new Set([u.join(".")])
                        // ATOMIC: Subscribes only to this item's path.
                      }), n.getState().stateComponents.set(e, _), () => {
                        const W = n.getState().stateComponents.get(e);
                        W && W.components.delete(N);
                      };
                    }, [e, b]);
                  },
                  index: l,
                  originalIndex: I
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${r.join(".")}. The current value is:`,
                a
              ), null);
            };
          if (c === "stateMapNoRender")
            return (t) => v.map((o, l) => {
              let I;
              f?.validIndices && f.validIndices[l] !== void 0 ? I = f.validIndices[l] : I = l;
              const u = [...r, I.toString()], A = i(o, u, f);
              return t(
                o,
                A,
                l,
                v,
                i(v, r, f)
              );
            });
          if (c === "$stateMap")
            return (t) => ae(De, {
              proxy: {
                _stateKey: e,
                _path: r,
                _mapFn: t
                // Pass the actual function, not string
              },
              rebuildStateShape: i
            });
          if (c === "stateFlattenOn")
            return (t) => {
              const a = v;
              m.clear(), $++;
              const o = a.flatMap(
                (l) => l[t] ?? []
              );
              return i(
                o,
                [...r, "[*]", t],
                f
              );
            };
          if (c === "index")
            return (t) => {
              const a = v[t];
              return i(a, [...r, t.toString()]);
            };
          if (c === "last")
            return () => {
              const t = n.getState().getNestedState(e, r);
              if (t.length === 0) return;
              const a = t.length - 1, o = t[a], l = [...r, a.toString()];
              return i(o, l);
            };
          if (c === "insert")
            return (t) => (w(r), ce(s, t, r, e), i(
              n.getState().getNestedState(e, r),
              r
            ));
          if (c === "uniqueInsert")
            return (t, a, o) => {
              const l = n.getState().getNestedState(e, r), I = J(t) ? t(l) : t;
              let u = null;
              if (!l.some((p) => {
                if (a) {
                  const b = a.every(
                    (N) => G(p[N], I[N])
                  );
                  return b && (u = p), b;
                }
                const k = G(p, I);
                return k && (u = p), k;
              }))
                w(r), ce(s, I, r, e);
              else if (o && u) {
                const p = o(u), k = l.map(
                  (b) => G(b, u) ? p : b
                );
                w(r), X(s, k, r);
              }
            };
          if (c === "cut")
            return (t, a) => {
              if (!a?.waitForSync)
                return w(r), K(s, r, e, t), i(
                  n.getState().getNestedState(e, r),
                  r
                );
            };
          if (c === "cutByValue")
            return (t) => {
              for (let a = 0; a < v.length; a++)
                v[a] === t && K(s, r, e, a);
            };
          if (c === "toggleByValue")
            return (t) => {
              const a = v.findIndex((o) => o === t);
              a > -1 ? K(s, r, e, a) : ce(s, t, r, e);
            };
          if (c === "stateFind")
            return (t) => {
              const o = d().find(
                ({ item: I }, u) => t(I, u)
              );
              if (!o) return;
              const l = [...r, o.originalIndex.toString()];
              return i(o.item, l, f);
            };
          if (c === "findWith")
            return (t, a) => {
              const l = d().find(
                ({ item: u }) => u[t] === a
              );
              if (!l) return;
              const I = [...r, l.originalIndex.toString()];
              return i(l.item, I, f);
            };
        }
        const z = r[r.length - 1];
        if (!isNaN(Number(z))) {
          const d = r.slice(0, -1), t = n.getState().getNestedState(e, d);
          if (Array.isArray(t) && c === "cut")
            return () => K(
              s,
              d,
              e,
              Number(z)
            );
        }
        if (c === "get")
          return () => n.getState().getNestedState(e, r);
        if (c === "$derive")
          return (d) => he({
            _stateKey: e,
            _path: r,
            _effect: d.toString()
          });
        if (c === "$get")
          return () => he({
            _stateKey: e,
            _path: r
          });
        if (c === "lastSynced") {
          const d = `${e}:${r.join(".")}`;
          return n.getState().getSyncInfo(d);
        }
        if (c == "getLocalStorage")
          return (d) => oe(g + "-" + e + "-" + d);
        if (c === "_selected") {
          const d = r.slice(0, -1), t = d.join("."), a = n.getState().getNestedState(e, d);
          return Array.isArray(a) ? Number(r[r.length - 1]) === n.getState().getSelectedIndex(e, t) : void 0;
        }
        if (c === "setSelected")
          return (d) => {
            const t = r.slice(0, -1), a = Number(r[r.length - 1]), o = t.join(".");
            d ? n.getState().setSelectedIndex(e, o, a) : n.getState().setSelectedIndex(e, o, void 0);
            const l = n.getState().getNestedState(e, [...t]);
            X(s, l, t), w(t);
          };
        if (c === "toggleSelected")
          return () => {
            const d = r.slice(0, -1), t = Number(r[r.length - 1]), a = d.join("."), o = n.getState().getSelectedIndex(e, a);
            n.getState().setSelectedIndex(
              e,
              a,
              o === t ? void 0 : t
            );
            const l = n.getState().getNestedState(e, [...d]);
            X(s, l, d), w(d);
          };
        if (r.length == 0) {
          if (c === "applyJsonPatch")
            return (d) => {
              const t = n.getState().cogsStateStore[e], o = _e(t, d).newDocument;
              $e(
                e,
                n.getState().initialStateGlobal[e],
                o,
                s,
                y,
                g
              );
              const l = n.getState().stateComponents.get(e);
              if (l) {
                const I = de(t, o), u = new Set(I);
                for (const [
                  A,
                  p
                ] of l.components.entries()) {
                  let k = !1;
                  const b = Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"];
                  if (!b.includes("none")) {
                    if (b.includes("all")) {
                      p.forceUpdate();
                      continue;
                    }
                    if (b.includes("component") && (p.paths.has("") && (k = !0), !k))
                      for (const N of u) {
                        if (p.paths.has(N)) {
                          k = !0;
                          break;
                        }
                        let _ = N.lastIndexOf(".");
                        for (; _ !== -1; ) {
                          const W = N.substring(0, _);
                          if (p.paths.has(W)) {
                            k = !0;
                            break;
                          }
                          const F = N.substring(
                            _ + 1
                          );
                          if (!isNaN(Number(F))) {
                            const T = W.lastIndexOf(".");
                            if (T !== -1) {
                              const x = W.substring(
                                0,
                                T
                              );
                              if (p.paths.has(x)) {
                                k = !0;
                                break;
                              }
                            }
                          }
                          _ = W.lastIndexOf(".");
                        }
                        if (k) break;
                      }
                    if (!k && b.includes("deps") && p.depsFunction) {
                      const N = p.depsFunction(o);
                      let _ = !1;
                      typeof N == "boolean" ? N && (_ = !0) : G(p.deps, N) || (p.deps = N, _ = !0), _ && (k = !0);
                    }
                    k && p.forceUpdate();
                  }
                }
              }
            };
          if (c === "validateZodSchema")
            return () => {
              const d = n.getState().getInitialOptions(e)?.validation, t = n.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              B(d.key);
              const a = n.getState().cogsStateStore[e];
              try {
                const o = n.getState().getValidationErrors(d.key);
                o && o.length > 0 && o.forEach(([I]) => {
                  I && I.startsWith(d.key) && B(I);
                });
                const l = d.zodSchema.safeParse(a);
                return l.success ? !0 : (l.error.errors.forEach((u) => {
                  const A = u.path, p = u.message, k = [d.key, ...A].join(".");
                  t(k, p);
                }), ie(e), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (c === "_componentId") return y;
          if (c === "getComponents")
            return () => n().stateComponents.get(e);
          if (c === "getAllFormRefs")
            return () => me.getState().getFormRefsByStateKey(e);
          if (c === "_initialState")
            return n.getState().initialStateGlobal[e];
          if (c === "_serverState")
            return n.getState().serverState[e];
          if (c === "_isLoading")
            return n.getState().isLoadingGlobal[e];
          if (c === "revertToInitialState")
            return h.revertToInitialState;
          if (c === "updateInitialState") return h.updateInitialState;
          if (c === "removeValidation") return h.removeValidation;
        }
        if (c === "getFormRef")
          return () => me.getState().getFormRef(e + "." + r.join("."));
        if (c === "validationWrapper")
          return ({
            children: d,
            hideMessage: t
          }) => /* @__PURE__ */ Se(
            be,
            {
              formOpts: t ? { validation: { message: "" } } : void 0,
              path: r,
              validationKey: n.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: f?.validIndices,
              children: d
            }
          );
        if (c === "_stateKey") return e;
        if (c === "_path") return r;
        if (c === "_isServerSynced") return h._isServerSynced;
        if (c === "update")
          return (d, t) => {
            if (t?.debounce)
              Ve(() => {
                X(s, d, r, "");
                const a = n.getState().getNestedState(e, r);
                t?.afterUpdate && t.afterUpdate(a);
              }, t.debounce);
            else {
              X(s, d, r, "");
              const a = n.getState().getNestedState(e, r);
              t?.afterUpdate && t.afterUpdate(a);
            }
            w(r);
          };
        if (c === "formElement")
          return (d, t) => /* @__PURE__ */ Se(
            Ce,
            {
              setState: s,
              stateKey: e,
              path: r,
              child: d,
              formOpts: t
            }
          );
        const V = [...r, c], Y = n.getState().getNestedState(e, V);
        return i(Y, V, f);
      }
    }, M = new Proxy(C, P);
    return m.set(U, {
      proxy: M,
      stateVersion: $
    }), M;
  }
  return i(
    n.getState().getNestedState(e, [])
  );
}
function he(e) {
  return ae(We, { proxy: e });
}
function De({
  proxy: e,
  rebuildStateShape: s
}) {
  const y = n().getNestedState(e._stateKey, e._path);
  return Array.isArray(y) ? s(
    y,
    e._path
  ).stateMapNoRender(
    (m, $, w, h, i) => e._mapFn(m, $, w, h, i)
  ) : null;
}
function We({
  proxy: e
}) {
  const s = ee(null), y = `${e._stateKey}-${e._path.join(".")}`;
  return le(() => {
    const g = s.current;
    if (!g || !g.parentElement) return;
    const m = g.parentElement, w = Array.from(m.childNodes).indexOf(g);
    let h = m.getAttribute("data-parent-id");
    h || (h = `parent-${crypto.randomUUID()}`, m.setAttribute("data-parent-id", h));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: h,
      position: w,
      effect: e._effect
    };
    n.getState().addSignalElement(y, v);
    const r = n.getState().getNestedState(e._stateKey, e._path);
    let f;
    if (e._effect)
      try {
        f = new Function(
          "state",
          `return (${e._effect})(state)`
        )(r);
      } catch (C) {
        console.error("Error evaluating effect function during mount:", C), f = r;
      }
    else
      f = r;
    f !== null && typeof f == "object" && (f = JSON.stringify(f));
    const U = document.createTextNode(String(f));
    g.replaceWith(U);
  }, [e._stateKey, e._path.join("."), e._effect]), ae("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": y
  });
}
function tt(e) {
  const s = Te(
    (y) => {
      const g = n.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(e._stateKey, {
        forceUpdate: y,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => g.components.delete(e._stateKey);
    },
    () => n.getState().getNestedState(e._stateKey, e._path)
  );
  return ae("text", {}, String(s));
}
export {
  he as $cogsSignal,
  tt as $cogsSignalStore,
  Qe as addStateOptions,
  Ke as createCogsState,
  et as notifyComponent,
  Me as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
