"use client";
import { jsx as te, Fragment as Te } from "react/jsx-runtime";
import { useState as re, useRef as ne, useEffect as ue, useLayoutEffect as we, useMemo as Ve, createElement as ie, useSyncExternalStore as Ne, startTransition as Ae } from "react";
import { transformStateFunc as be, isDeepEqual as W, isFunction as B, getNestedValue as G, getDifferences as ge, debounce as Ce } from "./utility.js";
import { pushFunc as de, updateFn as Q, cutFunc as ee, ValidationWrapper as Pe, FormControlComponent as _e } from "./Functions.jsx";
import xe from "superjson";
import { v4 as fe } from "uuid";
import "zod";
import { getGlobalStore as n, formRefStore as ye } from "./store.js";
import { useCogsConfig as Ee } from "./CogsStateClient.jsx";
import { applyPatch as Oe } from "fast-json-patch";
function ve(e, i) {
  const S = n.getState().getInitialOptions, g = n.getState().setInitialStateOptions, m = S(e) || {};
  g(e, {
    ...m,
    ...i
  });
}
function Ie({
  stateKey: e,
  options: i,
  initialOptionsPart: S
}) {
  const g = Y(e) || {}, m = S[e] || {}, E = n.getState().setInitialStateOptions, p = { ...m, ...g };
  let I = !1;
  if (i)
    for (const s in i)
      p.hasOwnProperty(s) ? (s == "localStorage" && i[s] && p[s].key !== i[s]?.key && (I = !0, p[s] = i[s]), s == "initialState" && i[s] && p[s] !== i[s] && // Different references
      !W(p[s], i[s]) && (I = !0, p[s] = i[s])) : (I = !0, p[s] = i[s]);
  I && E(e, p);
}
function tt(e, { formElements: i, validation: S }) {
  return { initialState: e, formElements: i, validation: S };
}
const nt = (e, i) => {
  let S = e;
  const [g, m] = be(S);
  (Object.keys(m).length > 0 || i && Object.keys(i).length > 0) && Object.keys(m).forEach((I) => {
    m[I] = m[I] || {}, m[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...m[I].formElements || {}
      // State-specific overrides
    }, Y(I) || n.getState().setInitialStateOptions(I, m[I]);
  }), n.getState().setInitialStates(g), n.getState().setCreatedState(g);
  const E = (I, s) => {
    const [v] = re(s?.componentId ?? fe());
    Ie({
      stateKey: I,
      options: s,
      initialOptionsPart: m
    });
    const r = n.getState().cogsStateStore[I] || g[I], f = s?.modifyState ? s.modifyState(r) : r, [U, P] = We(
      f,
      {
        stateKey: I,
        syncUpdate: s?.syncUpdate,
        componentId: v,
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
    return P;
  };
  function p(I, s) {
    Ie({ stateKey: I, options: s, initialOptionsPart: m }), s.localStorage && Re(I, s), ce(I);
  }
  return { useCogsState: E, setCogsOptions: p };
}, {
  setUpdaterState: ae,
  setState: H,
  getInitialOptions: Y,
  getKeyState: $e,
  getValidationErrors: je,
  setStateLog: Fe,
  updateInitialStateGlobal: Se,
  addValidationError: Ue,
  removeValidationError: J,
  setServerSyncActions: Me
} = n.getState(), he = (e, i, S, g, m) => {
  S?.log && console.log(
    "saving to localstorage",
    i,
    S.localStorage?.key,
    g
  );
  const E = B(S?.localStorage?.key) ? S.localStorage?.key(e) : S?.localStorage?.key;
  if (E && g) {
    const p = `${g}-${i}-${E}`;
    let I;
    try {
      I = se(p)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: m ?? I
    }, v = xe.serialize(s);
    window.localStorage.setItem(
      p,
      JSON.stringify(v.json)
    );
  }
}, se = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Re = (e, i) => {
  const S = n.getState().cogsStateStore[e], { sessionId: g } = Ee(), m = B(i?.localStorage?.key) ? i.localStorage.key(S) : i?.localStorage?.key;
  if (m && g) {
    const E = se(
      `${g}-${e}-${m}`
    );
    if (E && E.lastUpdated > (E.lastSyncedWithServer || 0))
      return H(e, E.state), ce(e), !0;
  }
  return !1;
}, ke = (e, i, S, g, m, E) => {
  const p = {
    initialState: i,
    updaterState: oe(
      e,
      g,
      m,
      E
    ),
    state: S
  };
  Se(e, p.initialState), ae(e, p.updaterState), H(e, p.state);
}, ce = (e) => {
  const i = n.getState().stateComponents.get(e);
  if (!i) return;
  const S = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || S.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((g) => g());
  });
}, rt = (e, i) => {
  const S = n.getState().stateComponents.get(e);
  if (S) {
    const g = `${e}////${i}`, m = S.components.get(g);
    if ((m ? Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"] : null)?.includes("none"))
      return;
    m && m.forceUpdate();
  }
}, De = (e, i, S, g) => {
  switch (e) {
    case "update":
      return {
        oldValue: G(i, g),
        newValue: G(S, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: G(S, g)
      };
    case "cut":
      return {
        oldValue: G(i, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function We(e, {
  stateKey: i,
  serverSync: S,
  localStorage: g,
  formElements: m,
  reactiveDeps: E,
  reactiveType: p,
  componentId: I,
  initialState: s,
  syncUpdate: v,
  dependencies: r,
  serverState: f
} = {}) {
  const [U, P] = re({}), { sessionId: _ } = Ee();
  let M = !i;
  const [y] = re(i ?? fe()), c = n.getState().stateLog[y], K = ne(/* @__PURE__ */ new Set()), L = ne(I ?? fe()), A = ne(
    null
  );
  A.current = Y(y) ?? null, ue(() => {
    if (v && v.stateKey === y && v.path?.[0]) {
      H(y, (a) => ({
        ...a,
        [v.path[0]]: v.newValue
      }));
      const t = `${v.stateKey}:${v.path.join(".")}`;
      n.getState().setSyncInfo(t, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), ue(() => {
    if (s) {
      ve(y, {
        initialState: s
      });
      const t = A.current, o = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, l = n.getState().initialStateGlobal[y];
      if (!(l && !W(l, s) || !l) && !o)
        return;
      let u = null;
      const T = B(t?.localStorage?.key) ? t?.localStorage?.key(s) : t?.localStorage?.key;
      T && _ && (u = se(`${_}-${y}-${T}`));
      let w = s, $ = !1;
      const j = o ? Date.now() : 0, b = u?.lastUpdated || 0, R = u?.lastSyncedWithServer || 0;
      o && j > b ? (w = t.serverState.data, $ = !0) : u && b > R && (w = u.state, t?.localStorage?.onChange && t?.localStorage?.onChange(w)), ke(
        y,
        s,
        w,
        X,
        L.current,
        _
      ), $ && T && _ && he(w, y, t, _, Date.now()), ce(y), (Array.isArray(p) ? p : [p || "component"]).includes("none") || P({});
    }
  }, [
    s,
    f?.status,
    f?.data,
    ...r || []
  ]), we(() => {
    M && ve(y, {
      serverSync: S,
      formElements: m,
      initialState: s,
      localStorage: g,
      middleware: A.current?.middleware
    });
    const t = `${y}////${L.current}`, a = n.getState().stateComponents.get(y) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(t, {
      forceUpdate: () => P({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), n.getState().stateComponents.set(y, a), P({}), () => {
      const o = `${y}////${L.current}`;
      a && (a.components.delete(o), a.components.size === 0 && n.getState().stateComponents.delete(y));
    };
  }, []);
  const X = (t, a, o, l) => {
    if (Array.isArray(a)) {
      const h = `${y}-${a.join(".")}`;
      K.current.add(h);
    }
    H(y, (h) => {
      const u = B(t) ? t(h) : t, T = `${y}-${a.join(".")}`;
      if (T) {
        let F = !1, k = n.getState().signalDomElements.get(T);
        if ((!k || k.size === 0) && (o.updateType === "insert" || o.updateType === "cut")) {
          const O = a.slice(0, -1), x = G(u, O);
          if (Array.isArray(x)) {
            F = !0;
            const C = `${y}-${O.join(".")}`;
            k = n.getState().signalDomElements.get(C);
          }
        }
        if (k) {
          const O = F ? G(u, a.slice(0, -1)) : G(u, a);
          k.forEach(({ parentId: x, position: C, effect: V }) => {
            const N = document.querySelector(
              `[data-parent-id="${x}"]`
            );
            if (N) {
              const Z = Array.from(N.childNodes);
              if (Z[C]) {
                const z = V ? new Function("state", `return (${V})(state)`)(O) : O;
                Z[C].textContent = String(z);
              }
            }
          });
        }
      }
      o.updateType === "update" && (l || A.current?.validation?.key) && a && J(
        (l || A.current?.validation?.key) + "." + a.join(".")
      );
      const w = a.slice(0, a.length - 1);
      o.updateType === "cut" && A.current?.validation?.key && J(
        A.current?.validation?.key + "." + w.join(".")
      ), o.updateType === "insert" && A.current?.validation?.key && je(
        A.current?.validation?.key + "." + w.join(".")
      ).filter(([k, O]) => {
        let x = k?.split(".").length;
        if (k == w.join(".") && x == w.length - 1) {
          let C = k + "." + w;
          J(k), Ue(C, O);
        }
      });
      const $ = n.getState().stateComponents.get(y);
      if ($) {
        const F = ge(h, u), k = new Set(F), O = o.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "", x = [];
        for (const [
          C,
          V
        ] of $.components.entries()) {
          let N = !1;
          const Z = Array.isArray(V.reactiveType) ? V.reactiveType : [V.reactiveType || "component"];
          if (!Z.includes("none")) {
            if (Z.includes("all")) {
              x.push(V.forceUpdate);
              continue;
            }
            if (Z.includes("component") && ((V.paths.has(O) || V.paths.has("")) && (N = !0), !N))
              for (const z of k) {
                let D = z;
                for (; ; ) {
                  if (V.paths.has(D)) {
                    N = !0;
                    break;
                  }
                  const le = D.lastIndexOf(".");
                  if (le !== -1) {
                    const me = D.substring(
                      0,
                      le
                    );
                    if (!isNaN(
                      Number(D.substring(le + 1))
                    ) && V.paths.has(me)) {
                      N = !0;
                      break;
                    }
                    D = me;
                  } else
                    D = "";
                  if (D === "")
                    break;
                }
                if (N) break;
              }
            if (!N && Z.includes("deps") && V.depsFunction) {
              const z = V.depsFunction(u);
              let D = !1;
              typeof z == "boolean" ? z && (D = !0) : W(V.deps, z) || (V.deps = z, D = !0), D && (N = !0);
            }
            N && x.push(V.forceUpdate);
          }
        }
        x.length > 0 && queueMicrotask(() => {
          x.forEach((C) => C());
        });
      }
      const j = Date.now();
      a = a.map((F, k) => {
        const O = a.slice(0, -1), x = G(u, O);
        return k === a.length - 1 && ["insert", "cut"].includes(o.updateType) ? (x.length - 1).toString() : F;
      });
      const { oldValue: b, newValue: R } = De(
        o.updateType,
        h,
        u,
        a
      ), q = {
        timeStamp: j,
        stateKey: y,
        path: a,
        updateType: o.updateType,
        status: "new",
        oldValue: b,
        newValue: R
      };
      if (Fe(y, (F) => {
        const O = [...F ?? [], q].reduce((x, C) => {
          const V = `${C.stateKey}:${JSON.stringify(C.path)}`, N = x.get(V);
          return N ? (N.timeStamp = Math.max(N.timeStamp, C.timeStamp), N.newValue = C.newValue, N.oldValue = N.oldValue ?? C.oldValue, N.updateType = C.updateType) : x.set(V, { ...C }), x;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), he(
        u,
        y,
        A.current,
        _
      ), A.current?.middleware && A.current.middleware({
        updateLog: c,
        update: q
      }), A.current?.serverSync) {
        const F = n.getState().serverState[y], k = A.current?.serverSync;
        Me(y, {
          syncKey: typeof k.syncKey == "string" ? k.syncKey : k.syncKey({ state: u }),
          rollBackState: F,
          actionTimeStamp: Date.now() + (k.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return u;
    });
  };
  n.getState().updaterState[y] || (ae(
    y,
    oe(
      y,
      X,
      L.current,
      _
    )
  ), n.getState().cogsStateStore[y] || H(y, e), n.getState().initialStateGlobal[y] || Se(y, e));
  const d = Ve(() => oe(
    y,
    X,
    L.current,
    _
  ), [y, _]);
  return [$e(y), d];
}
function oe(e, i, S, g) {
  const m = /* @__PURE__ */ new Map();
  let E = 0;
  const p = (v) => {
    const r = v.join(".");
    for (const [f] of m)
      (f === r || f.startsWith(r + ".")) && m.delete(f);
    E++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && J(v.validationKey);
    },
    revertToInitialState: (v) => {
      const r = n.getState().getInitialOptions(e)?.validation;
      r?.key && J(r?.key), v?.validationKey && J(v.validationKey);
      const f = n.getState().initialStateGlobal[e];
      n.getState().clearSelectedIndexesForState(e), m.clear(), E++;
      const U = s(f, []), P = Y(e), _ = B(P?.localStorage?.key) ? P?.localStorage?.key(f) : P?.localStorage?.key, M = `${g}-${e}-${_}`;
      M && localStorage.removeItem(M), ae(e, U), H(e, f);
      const y = n.getState().stateComponents.get(e);
      return y && y.components.forEach((c) => {
        c.forceUpdate();
      }), f;
    },
    updateInitialState: (v) => {
      m.clear(), E++;
      const r = oe(
        e,
        i,
        S,
        g
      ), f = n.getState().initialStateGlobal[e], U = Y(e), P = B(U?.localStorage?.key) ? U?.localStorage?.key(f) : U?.localStorage?.key, _ = `${g}-${e}-${P}`;
      return localStorage.getItem(_) && localStorage.removeItem(_), Ae(() => {
        Se(e, v), ae(e, r), H(e, v);
        const M = n.getState().stateComponents.get(e);
        M && M.components.forEach((y) => {
          y.forceUpdate();
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
      return !!(v && W(v, $e(e)));
    }
  };
  function s(v, r = [], f) {
    const U = r.map(String).join(".");
    m.get(U);
    const P = function() {
      return n().getNestedState(e, r);
    };
    Object.keys(I).forEach((y) => {
      P[y] = I[y];
    });
    const _ = {
      apply(y, c, K) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${r.join(".")}`
        ), console.trace("Apply trap stack trace"), n().getNestedState(e, r);
      },
      get(y, c) {
        f?.validIndices && !Array.isArray(v) && (f = { ...f, validIndices: void 0 });
        const K = /* @__PURE__ */ new Set([
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
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender" && !K.has(c)) {
          const d = `${e}////${S}`, t = n.getState().stateComponents.get(e);
          if (t) {
            const a = t.components.get(d);
            if (a && !a.pathsInitialized && (a.pathsInitialized = !0, !a.paths.has(""))) {
              const o = r.join(".");
              let l = !0;
              for (const h of a.paths)
                if (o.startsWith(h) && (o === h || o[h.length] === ".")) {
                  l = !1;
                  break;
                }
              l && a.paths.add(o);
            }
          }
        }
        if (c === "getDifferences")
          return () => ge(
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
                  const T = [o, ...u.path].join(".");
                  n.getState().addValidationError(T, u.message);
                });
                const h = n.getState().stateComponents.get(e);
                h && h.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return l?.success && t.onSuccess ? t.onSuccess(l.data) : !l?.success && t.onError && t.onError(l.error), l;
            } catch (l) {
              return t.onError && t.onError(l), { success: !1, error: l };
            }
          };
        if (c === "_status") {
          const d = n.getState().getNestedState(e, r), t = n.getState().initialStateGlobal[e], a = G(t, r);
          return W(d, a) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const d = n().getNestedState(
              e,
              r
            ), t = n.getState().initialStateGlobal[e], a = G(t, r);
            return W(d, a) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const d = n.getState().initialStateGlobal[e], t = Y(e), a = B(t?.localStorage?.key) ? t?.localStorage?.key(d) : t?.localStorage?.key, o = `${g}-${e}-${a}`;
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
                return s(
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
                (u, T) => t(u.item, T.item)
              ), l = o.map(({ item: u }) => u), h = {
                ...f,
                validIndices: o.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(l, r, h);
            };
          if (c === "stateFilter")
            return (t) => {
              const o = d().filter(
                ({ item: u }, T) => t(u, T)
              ), l = o.map(({ item: u }) => u), h = {
                ...f,
                validIndices: o.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(l, r, h);
            };
          if (c === "stateMap")
            return (t) => v.map((o, l) => {
              let h;
              f?.validIndices && f.validIndices[l] !== void 0 ? h = f.validIndices[l] : h = l;
              const u = [...r, h.toString()], T = s(o, u, f), w = `${S}-${r.join(".")}-${h}`, $ = t(o, T, l);
              return /* @__PURE__ */ te(
                qe,
                {
                  stateKey: e,
                  itemComponentId: w,
                  itemPath: u,
                  children: $
                },
                h
              );
            });
          if (c === "stateMapNoRender")
            return (t) => v.map((o, l) => {
              let h;
              f?.validIndices && f.validIndices[l] !== void 0 ? h = f.validIndices[l] : h = l;
              const u = [...r, h.toString()], T = s(o, u, f);
              return t(
                o,
                T,
                l,
                v,
                s(v, r, f)
              );
            });
          if (c === "$stateMap")
            return (t) => ie(Ge, {
              proxy: {
                _stateKey: e,
                _path: r,
                _mapFn: t
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (c === "stateFlattenOn")
            return (t) => {
              const a = v;
              m.clear(), E++;
              const o = a.flatMap(
                (l) => l[t] ?? []
              );
              return s(
                o,
                [...r, "[*]", t],
                f
              );
            };
          if (c === "index")
            return (t) => {
              const a = v[t];
              return s(a, [...r, t.toString()]);
            };
          if (c === "last")
            return () => {
              const t = n.getState().getNestedState(e, r);
              if (t.length === 0) return;
              const a = t.length - 1, o = t[a], l = [...r, a.toString()];
              return s(o, l);
            };
          if (c === "insert")
            return (t) => (p(r), de(i, t, r, e), s(
              n.getState().getNestedState(e, r),
              r
            ));
          if (c === "uniqueInsert")
            return (t, a, o) => {
              const l = n.getState().getNestedState(e, r), h = B(t) ? t(l) : t;
              let u = null;
              if (!l.some((w) => {
                if (a) {
                  const j = a.every(
                    (b) => W(w[b], h[b])
                  );
                  return j && (u = w), j;
                }
                const $ = W(w, h);
                return $ && (u = w), $;
              }))
                p(r), de(i, h, r, e);
              else if (o && u) {
                const w = o(u), $ = l.map(
                  (j) => W(j, u) ? w : j
                );
                p(r), Q(i, $, r);
              }
            };
          if (c === "cut")
            return (t, a) => {
              if (!a?.waitForSync)
                return p(r), ee(i, r, e, t), s(
                  n.getState().getNestedState(e, r),
                  r
                );
            };
          if (c === "cutByValue")
            return (t) => {
              for (let a = 0; a < v.length; a++)
                v[a] === t && ee(i, r, e, a);
            };
          if (c === "toggleByValue")
            return (t) => {
              const a = v.findIndex((o) => o === t);
              a > -1 ? ee(i, r, e, a) : de(i, t, r, e);
            };
          if (c === "stateFind")
            return (t) => {
              const o = d().find(
                ({ item: h }, u) => t(h, u)
              );
              if (!o) return;
              const l = [...r, o.originalIndex.toString()];
              return s(o.item, l, f);
            };
          if (c === "findWith")
            return (t, a) => {
              const l = d().find(
                ({ item: u }) => u[t] === a
              );
              if (!l) return;
              const h = [...r, l.originalIndex.toString()];
              return s(l.item, h, f);
            };
        }
        const L = r[r.length - 1];
        if (!isNaN(Number(L))) {
          const d = r.slice(0, -1), t = n.getState().getNestedState(e, d);
          if (Array.isArray(t) && c === "cut")
            return () => ee(
              i,
              d,
              e,
              Number(L)
            );
        }
        if (c === "get")
          return () => n.getState().getNestedState(e, r);
        if (c === "$derive")
          return (d) => pe({
            _stateKey: e,
            _path: r,
            _effect: d.toString()
          });
        if (c === "$get")
          return () => pe({
            _stateKey: e,
            _path: r
          });
        if (c === "lastSynced") {
          const d = `${e}:${r.join(".")}`;
          return n.getState().getSyncInfo(d);
        }
        if (c == "getLocalStorage")
          return (d) => se(g + "-" + e + "-" + d);
        if (c === "_selected") {
          const d = r.slice(0, -1), t = d.join("."), a = n.getState().getNestedState(e, d);
          return Array.isArray(a) ? Number(r[r.length - 1]) === n.getState().getSelectedIndex(e, t) : void 0;
        }
        if (c === "setSelected")
          return (d) => {
            const t = r.slice(0, -1), a = Number(r[r.length - 1]), o = t.join(".");
            d ? n.getState().setSelectedIndex(e, o, a) : n.getState().setSelectedIndex(e, o, void 0);
            const l = n.getState().getNestedState(e, [...t]);
            Q(i, l, t), p(t);
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
            Q(i, l, d), p(d);
          };
        if (r.length == 0) {
          if (c === "applyJsonPatch")
            return (d) => {
              const t = n.getState().cogsStateStore[e], o = Oe(t, d).newDocument;
              ke(
                e,
                n.getState().initialStateGlobal[e],
                o,
                i,
                S,
                g
              );
              const l = n.getState().stateComponents.get(e);
              if (l) {
                const h = ge(t, o), u = new Set(h);
                for (const [
                  T,
                  w
                ] of l.components.entries()) {
                  let $ = !1;
                  const j = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!j.includes("none")) {
                    if (j.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (j.includes("component") && (w.paths.has("") && ($ = !0), !$))
                      for (const b of u) {
                        if (w.paths.has(b)) {
                          $ = !0;
                          break;
                        }
                        let R = b.lastIndexOf(".");
                        for (; R !== -1; ) {
                          const q = b.substring(0, R);
                          if (w.paths.has(q)) {
                            $ = !0;
                            break;
                          }
                          const F = b.substring(
                            R + 1
                          );
                          if (!isNaN(Number(F))) {
                            const k = q.lastIndexOf(".");
                            if (k !== -1) {
                              const O = q.substring(
                                0,
                                k
                              );
                              if (w.paths.has(O)) {
                                $ = !0;
                                break;
                              }
                            }
                          }
                          R = q.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && j.includes("deps") && w.depsFunction) {
                      const b = w.depsFunction(o);
                      let R = !1;
                      typeof b == "boolean" ? b && (R = !0) : W(w.deps, b) || (w.deps = b, R = !0), R && ($ = !0);
                    }
                    $ && w.forceUpdate();
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
              J(d.key);
              const a = n.getState().cogsStateStore[e];
              try {
                const o = n.getState().getValidationErrors(d.key);
                o && o.length > 0 && o.forEach(([h]) => {
                  h && h.startsWith(d.key) && J(h);
                });
                const l = d.zodSchema.safeParse(a);
                return l.success ? !0 : (l.error.errors.forEach((u) => {
                  const T = u.path, w = u.message, $ = [d.key, ...T].join(".");
                  t($, w);
                }), ce(e), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (c === "_componentId") return S;
          if (c === "getComponents")
            return () => n().stateComponents.get(e);
          if (c === "getAllFormRefs")
            return () => ye.getState().getFormRefsByStateKey(e);
          if (c === "_initialState")
            return n.getState().initialStateGlobal[e];
          if (c === "_serverState")
            return n.getState().serverState[e];
          if (c === "_isLoading")
            return n.getState().isLoadingGlobal[e];
          if (c === "revertToInitialState")
            return I.revertToInitialState;
          if (c === "updateInitialState") return I.updateInitialState;
          if (c === "removeValidation") return I.removeValidation;
        }
        if (c === "getFormRef")
          return () => ye.getState().getFormRef(e + "." + r.join("."));
        if (c === "validationWrapper")
          return ({
            children: d,
            hideMessage: t
          }) => /* @__PURE__ */ te(
            Pe,
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
        if (c === "_isServerSynced") return I._isServerSynced;
        if (c === "update")
          return (d, t) => {
            if (t?.debounce)
              Ce(() => {
                Q(i, d, r, "");
                const a = n.getState().getNestedState(e, r);
                t?.afterUpdate && t.afterUpdate(a);
              }, t.debounce);
            else {
              Q(i, d, r, "");
              const a = n.getState().getNestedState(e, r);
              t?.afterUpdate && t.afterUpdate(a);
            }
            p(r);
          };
        if (c === "formElement")
          return (d, t) => /* @__PURE__ */ te(
            _e,
            {
              setState: i,
              stateKey: e,
              path: r,
              child: d,
              formOpts: t
            }
          );
        const A = [...r, c], X = n.getState().getNestedState(e, A);
        return s(X, A, f);
      }
    }, M = new Proxy(P, _);
    return m.set(U, {
      proxy: M,
      stateVersion: E
    }), M;
  }
  return s(
    n.getState().getNestedState(e, [])
  );
}
function pe(e) {
  return ie(Le, { proxy: e });
}
function Ge({
  proxy: e,
  rebuildStateShape: i
}) {
  const S = n().getNestedState(e._stateKey, e._path);
  return Array.isArray(S) ? i(
    S,
    e._path
  ).stateMapNoRender(
    (m, E, p, I, s) => e._mapFn(m, E, p, I, s)
  ) : null;
}
function Le({
  proxy: e
}) {
  const i = ne(null), S = `${e._stateKey}-${e._path.join(".")}`;
  return ue(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const m = g.parentElement, p = Array.from(m.childNodes).indexOf(g);
    let I = m.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, m.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: p,
      effect: e._effect
    };
    n.getState().addSignalElement(S, v);
    const r = n.getState().getNestedState(e._stateKey, e._path);
    let f;
    if (e._effect)
      try {
        f = new Function(
          "state",
          `return (${e._effect})(state)`
        )(r);
      } catch (P) {
        console.error("Error evaluating effect function during mount:", P), f = r;
      }
    else
      f = r;
    f !== null && typeof f == "object" && (f = JSON.stringify(f));
    const U = document.createTextNode(String(f));
    g.replaceWith(U);
  }, [e._stateKey, e._path.join("."), e._effect]), ie("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function at(e) {
  const i = Ne(
    (S) => {
      const g = n.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(e._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => g.components.delete(e._stateKey);
    },
    () => n.getState().getNestedState(e._stateKey, e._path)
  );
  return ie("text", {}, String(i));
}
function qe({
  stateKey: e,
  itemComponentId: i,
  itemPath: S,
  children: g
}) {
  const [, m] = re({});
  return we(() => {
    const E = `${e}////${i}`, p = n.getState().stateComponents.get(e) || {
      components: /* @__PURE__ */ new Map()
    };
    return p.components.set(E, {
      forceUpdate: () => m({}),
      paths: /* @__PURE__ */ new Set([S.join(".")])
      // ATOMIC: Subscribes only to this item's path.
    }), n.getState().stateComponents.set(e, p), () => {
      const I = n.getState().stateComponents.get(e);
      I && I.components.delete(E);
    };
  }, [e, i, S.join(".")]), /* @__PURE__ */ te(Te, { children: g });
}
export {
  pe as $cogsSignal,
  at as $cogsSignalStore,
  tt as addStateOptions,
  nt as createCogsState,
  rt as notifyComponent,
  We as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
