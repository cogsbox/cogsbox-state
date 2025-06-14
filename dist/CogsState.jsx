"use client";
import { jsx as ye } from "react/jsx-runtime";
import { useState as de, useRef as te, useEffect as ue, useLayoutEffect as $e, useMemo as Te, createElement as ae, useSyncExternalStore as Ve, startTransition as Ne } from "react";
import { transformStateFunc as Ae, isDeepEqual as G, isFunction as J, getNestedValue as W, getDifferences as fe, debounce as be } from "./utility.js";
import { pushFunc as ce, updateFn as Q, cutFunc as ee, ValidationWrapper as Pe, FormControlComponent as _e } from "./Functions.jsx";
import xe from "superjson";
import { v4 as ge } from "uuid";
import "zod";
import { getGlobalStore as n, formRefStore as ve } from "./store.js";
import { useCogsConfig as we } from "./CogsStateClient.jsx";
import { applyPatch as Ce } from "fast-json-patch";
function he(e, i) {
  const v = n.getState().getInitialOptions, u = n.getState().setInitialStateOptions, S = v(e) || {};
  u(e, {
    ...S,
    ...i
  });
}
function Ie({
  stateKey: e,
  options: i,
  initialOptionsPart: v
}) {
  const u = Y(e) || {}, S = v[e] || {}, E = n.getState().setInitialStateOptions, p = { ...S, ...u };
  let h = !1;
  if (i)
    for (const s in i)
      p.hasOwnProperty(s) ? (s == "localStorage" && i[s] && p[s].key !== i[s]?.key && (h = !0, p[s] = i[s]), s == "initialState" && i[s] && p[s] !== i[s] && // Different references
      !G(p[s], i[s]) && (h = !0, p[s] = i[s])) : (h = !0, p[s] = i[s]);
  h && E(e, p);
}
function Ke(e, { formElements: i, validation: v }) {
  return { initialState: e, formElements: i, validation: v };
}
const et = (e, i) => {
  let v = e;
  const [u, S] = Ae(v);
  (Object.keys(S).length > 0 || i && Object.keys(i).length > 0) && Object.keys(S).forEach((h) => {
    S[h] = S[h] || {}, S[h].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...S[h].formElements || {}
      // State-specific overrides
    }, Y(h) || n.getState().setInitialStateOptions(h, S[h]);
  }), n.getState().setInitialStates(u), n.getState().setCreatedState(u);
  const E = (h, s) => {
    const [m] = de(s?.componentId ?? ge());
    Ie({
      stateKey: h,
      options: s,
      initialOptionsPart: S
    });
    const r = n.getState().cogsStateStore[h] || u[h], y = s?.modifyState ? s.modifyState(r) : r, [j, _] = De(
      y,
      {
        stateKey: h,
        syncUpdate: s?.syncUpdate,
        componentId: m,
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
    return _;
  };
  function p(h, s) {
    Ie({ stateKey: h, options: s, initialOptionsPart: S }), s.localStorage && Ue(h, s), ie(h);
  }
  return { useCogsState: E, setCogsOptions: p };
}, {
  setUpdaterState: ne,
  setState: H,
  getInitialOptions: Y,
  getKeyState: Ee,
  getValidationErrors: Oe,
  setStateLog: Fe,
  updateInitialStateGlobal: Se,
  addValidationError: Re,
  removeValidationError: B,
  setServerSyncActions: je
} = n.getState(), pe = (e, i, v, u, S) => {
  v?.log && console.log(
    "saving to localstorage",
    i,
    v.localStorage?.key,
    u
  );
  const E = J(v?.localStorage?.key) ? v.localStorage?.key(e) : v?.localStorage?.key;
  if (E && u) {
    const p = `${u}-${i}-${E}`;
    let h;
    try {
      h = oe(p)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: S ?? h
    }, m = xe.serialize(s);
    window.localStorage.setItem(
      p,
      JSON.stringify(m.json)
    );
  }
}, oe = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Ue = (e, i) => {
  const v = n.getState().cogsStateStore[e], { sessionId: u } = we(), S = J(i?.localStorage?.key) ? i.localStorage.key(v) : i?.localStorage?.key;
  if (S && u) {
    const E = oe(
      `${u}-${e}-${S}`
    );
    if (E && E.lastUpdated > (E.lastSyncedWithServer || 0))
      return H(e, E.state), ie(e), !0;
  }
  return !1;
}, ke = (e, i, v, u, S, E) => {
  const p = {
    initialState: i,
    updaterState: re(
      e,
      u,
      S,
      E
    ),
    state: v
  };
  Se(e, p.initialState), ne(e, p.updaterState), H(e, p.state);
}, ie = (e) => {
  const i = n.getState().stateComponents.get(e);
  if (!i) return;
  const v = /* @__PURE__ */ new Set();
  i.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || v.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    v.forEach((u) => u());
  });
}, tt = (e, i) => {
  const v = n.getState().stateComponents.get(e);
  if (v) {
    const u = `${e}////${i}`, S = v.components.get(u);
    if ((S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : null)?.includes("none"))
      return;
    S && S.forceUpdate();
  }
}, Me = (e, i, v, u) => {
  switch (e) {
    case "update":
      return {
        oldValue: W(i, u),
        newValue: W(v, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: W(v, u)
      };
    case "cut":
      return {
        oldValue: W(i, u),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function De(e, {
  stateKey: i,
  serverSync: v,
  localStorage: u,
  formElements: S,
  reactiveDeps: E,
  reactiveType: p,
  componentId: h,
  initialState: s,
  syncUpdate: m,
  dependencies: r,
  serverState: y
} = {}) {
  const [j, _] = de({}), { sessionId: x } = we();
  let U = !i;
  const [g] = de(i ?? ge()), c = n.getState().stateLog[g], K = te(/* @__PURE__ */ new Set()), L = te(h ?? ge()), A = te(
    null
  );
  A.current = Y(g) ?? null, ue(() => {
    if (m && m.stateKey === g && m.path?.[0]) {
      H(g, (a) => ({
        ...a,
        [m.path[0]]: m.newValue
      }));
      const t = `${m.stateKey}:${m.path.join(".")}`;
      n.getState().setSyncInfo(t, {
        timeStamp: m.timeStamp,
        userId: m.userId
      });
    }
  }, [m]), ue(() => {
    if (s) {
      he(g, {
        initialState: s
      });
      const t = A.current, o = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, d = n.getState().initialStateGlobal[g];
      if (!(d && !G(d, s) || !d) && !o)
        return;
      let f = null;
      const N = J(t?.localStorage?.key) ? t?.localStorage?.key(s) : t?.localStorage?.key;
      N && x && (f = oe(`${x}-${g}-${N}`));
      let w = s, $ = !1;
      const F = o ? Date.now() : 0, b = f?.lastUpdated || 0, M = f?.lastSyncedWithServer || 0;
      o && F > b ? (w = t.serverState.data, $ = !0) : f && b > M && (w = f.state, t?.localStorage?.onChange && t?.localStorage?.onChange(w)), ke(
        g,
        s,
        w,
        X,
        L.current,
        x
      ), $ && N && x && pe(w, g, t, x, Date.now()), ie(g), (Array.isArray(p) ? p : [p || "component"]).includes("none") || _({});
    }
  }, [
    s,
    y?.status,
    y?.data,
    ...r || []
  ]), $e(() => {
    U && he(g, {
      serverSync: v,
      formElements: S,
      initialState: s,
      localStorage: u,
      middleware: A.current?.middleware
    });
    const t = `${g}////${L.current}`, a = n.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(t, {
      forceUpdate: () => _({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), n.getState().stateComponents.set(g, a), _({}), () => {
      const o = `${g}////${L.current}`;
      a && (a.components.delete(o), a.components.size === 0 && n.getState().stateComponents.delete(g));
    };
  }, []);
  const X = (t, a, o, d) => {
    if (Array.isArray(a)) {
      const I = `${g}-${a.join(".")}`;
      K.current.add(I);
    }
    H(g, (I) => {
      const f = J(t) ? t(I) : t, N = `${g}-${a.join(".")}`;
      if (N) {
        let R = !1, k = n.getState().signalDomElements.get(N);
        if ((!k || k.size === 0) && (o.updateType === "insert" || o.updateType === "cut")) {
          const O = a.slice(0, -1), C = W(f, O);
          if (Array.isArray(C)) {
            R = !0;
            const P = `${g}-${O.join(".")}`;
            k = n.getState().signalDomElements.get(P);
          }
        }
        if (k) {
          const O = R ? W(f, a.slice(0, -1)) : W(f, a);
          k.forEach(({ parentId: C, position: P, effect: T }) => {
            const V = document.querySelector(
              `[data-parent-id="${C}"]`
            );
            if (V) {
              const Z = Array.from(V.childNodes);
              if (Z[P]) {
                const z = T ? new Function("state", `return (${T})(state)`)(O) : O;
                Z[P].textContent = String(z);
              }
            }
          });
        }
      }
      o.updateType === "update" && (d || A.current?.validation?.key) && a && B(
        (d || A.current?.validation?.key) + "." + a.join(".")
      );
      const w = a.slice(0, a.length - 1);
      o.updateType === "cut" && A.current?.validation?.key && B(
        A.current?.validation?.key + "." + w.join(".")
      ), o.updateType === "insert" && A.current?.validation?.key && Oe(
        A.current?.validation?.key + "." + w.join(".")
      ).filter(([k, O]) => {
        let C = k?.split(".").length;
        if (k == w.join(".") && C == w.length - 1) {
          let P = k + "." + w;
          B(k), Re(P, O);
        }
      });
      const $ = n.getState().stateComponents.get(g);
      if ($) {
        const R = fe(I, f), k = new Set(R), O = o.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "", C = [];
        for (const [
          P,
          T
        ] of $.components.entries()) {
          let V = !1;
          const Z = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
          if (!Z.includes("none")) {
            if (Z.includes("all")) {
              C.push(T.forceUpdate);
              continue;
            }
            if (Z.includes("component") && ((T.paths.has(O) || T.paths.has("")) && (V = !0), !V))
              for (const z of k) {
                let D = z;
                for (; ; ) {
                  if (T.paths.has(D)) {
                    V = !0;
                    break;
                  }
                  const se = D.lastIndexOf(".");
                  if (se !== -1) {
                    const me = D.substring(
                      0,
                      se
                    );
                    if (!isNaN(
                      Number(D.substring(se + 1))
                    ) && T.paths.has(me)) {
                      V = !0;
                      break;
                    }
                    D = me;
                  } else
                    D = "";
                  if (D === "")
                    break;
                }
                if (V) break;
              }
            if (!V && Z.includes("deps") && T.depsFunction) {
              const z = T.depsFunction(f);
              let D = !1;
              typeof z == "boolean" ? z && (D = !0) : G(T.deps, z) || (T.deps = z, D = !0), D && (V = !0);
            }
            V && C.push(T.forceUpdate);
          }
        }
        C.length > 0 && queueMicrotask(() => {
          C.forEach((P) => P());
        });
      }
      const F = Date.now();
      a = a.map((R, k) => {
        const O = a.slice(0, -1), C = W(f, O);
        return k === a.length - 1 && ["insert", "cut"].includes(o.updateType) ? (C.length - 1).toString() : R;
      });
      const { oldValue: b, newValue: M } = Me(
        o.updateType,
        I,
        f,
        a
      ), q = {
        timeStamp: F,
        stateKey: g,
        path: a,
        updateType: o.updateType,
        status: "new",
        oldValue: b,
        newValue: M
      };
      if (Fe(g, (R) => {
        const O = [...R ?? [], q].reduce((C, P) => {
          const T = `${P.stateKey}:${JSON.stringify(P.path)}`, V = C.get(T);
          return V ? (V.timeStamp = Math.max(V.timeStamp, P.timeStamp), V.newValue = P.newValue, V.oldValue = V.oldValue ?? P.oldValue, V.updateType = P.updateType) : C.set(T, { ...P }), C;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), pe(
        f,
        g,
        A.current,
        x
      ), A.current?.middleware && A.current.middleware({
        updateLog: c,
        update: q
      }), A.current?.serverSync) {
        const R = n.getState().serverState[g], k = A.current?.serverSync;
        je(g, {
          syncKey: typeof k.syncKey == "string" ? k.syncKey : k.syncKey({ state: f }),
          rollBackState: R,
          actionTimeStamp: Date.now() + (k.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return f;
    });
  };
  n.getState().updaterState[g] || (ne(
    g,
    re(
      g,
      X,
      L.current,
      x
    )
  ), n.getState().cogsStateStore[g] || H(g, e), n.getState().initialStateGlobal[g] || Se(g, e));
  const l = Te(() => re(
    g,
    X,
    L.current,
    x
  ), [g, x]);
  return [Ee(g), l];
}
function re(e, i, v, u) {
  const S = /* @__PURE__ */ new Map();
  let E = 0;
  const p = (m) => {
    const r = m.join(".");
    for (const [y] of S)
      (y === r || y.startsWith(r + ".")) && S.delete(y);
    E++;
  }, h = {
    removeValidation: (m) => {
      m?.validationKey && B(m.validationKey);
    },
    revertToInitialState: (m) => {
      const r = n.getState().getInitialOptions(e)?.validation;
      r?.key && B(r?.key), m?.validationKey && B(m.validationKey);
      const y = n.getState().initialStateGlobal[e];
      n.getState().clearSelectedIndexesForState(e), S.clear(), E++;
      const j = s(y, []), _ = Y(e), x = J(_?.localStorage?.key) ? _?.localStorage?.key(y) : _?.localStorage?.key, U = `${u}-${e}-${x}`;
      U && localStorage.removeItem(U), ne(e, j), H(e, y);
      const g = n.getState().stateComponents.get(e);
      return g && g.components.forEach((c) => {
        c.forceUpdate();
      }), y;
    },
    updateInitialState: (m) => {
      S.clear(), E++;
      const r = re(
        e,
        i,
        v,
        u
      ), y = n.getState().initialStateGlobal[e], j = Y(e), _ = J(j?.localStorage?.key) ? j?.localStorage?.key(y) : j?.localStorage?.key, x = `${u}-${e}-${_}`;
      return localStorage.getItem(x) && localStorage.removeItem(x), Ne(() => {
        Se(e, m), ne(e, r), H(e, m);
        const U = n.getState().stateComponents.get(e);
        U && U.components.forEach((g) => {
          g.forceUpdate();
        });
      }), {
        fetchId: (U) => r.get()[U]
      };
    },
    _initialState: n.getState().initialStateGlobal[e],
    _serverState: n.getState().serverState[e],
    _isLoading: n.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const m = n.getState().serverState[e];
      return !!(m && G(m, Ee(e)));
    }
  };
  function s(m, r = [], y) {
    const j = r.map(String).join(".");
    S.get(j);
    const _ = function() {
      return n().getNestedState(e, r);
    };
    Object.keys(h).forEach((g) => {
      _[g] = h[g];
    });
    const x = {
      apply(g, c, K) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${r.join(".")}`
        ), console.trace("Apply trap stack trace"), n().getNestedState(e, r);
      },
      get(g, c) {
        y?.validIndices && !Array.isArray(m) && (y = { ...y, validIndices: void 0 });
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
          "middleware"
        ]);
        if (!(c === "then" || c[0] === "$" || c === "stateMapNoRender" || !K.has(c))) {
          const l = `${e}////${v}`, t = n.getState().stateComponents.get(e);
          if (t) {
            const a = t.components.get(l);
            if (a) {
              if (a.paths.has(""))
                return;
              const o = [...r, c].join(".");
              let d = !0;
              for (const I of a.paths)
                if (o.startsWith(I) && (o === I || o[I.length] === ".")) {
                  d = !1;
                  break;
                }
              d && (console.log("adding path", o, c), a.paths.add(o));
            }
          }
        }
        if (c === "getDifferences")
          return () => fe(
            n.getState().cogsStateStore[e],
            n.getState().initialStateGlobal[e]
          );
        if (c === "sync" && r.length === 0)
          return async function() {
            const l = n.getState().getInitialOptions(e), t = l?.sync;
            if (!t)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const a = n.getState().getNestedState(e, []), o = l?.validation?.key;
            try {
              const d = await t.action(a);
              if (d && !d.success && d.errors && o) {
                n.getState().removeValidationError(o), d.errors.forEach((f) => {
                  const N = [o, ...f.path].join(".");
                  n.getState().addValidationError(N, f.message);
                });
                const I = n.getState().stateComponents.get(e);
                I && I.components.forEach((f) => {
                  f.forceUpdate();
                });
              }
              return d?.success && t.onSuccess ? t.onSuccess(d.data) : !d?.success && t.onError && t.onError(d.error), d;
            } catch (d) {
              return t.onError && t.onError(d), { success: !1, error: d };
            }
          };
        if (c === "_status") {
          const l = n.getState().getNestedState(e, r), t = n.getState().initialStateGlobal[e], a = W(t, r);
          return G(l, a) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const l = n().getNestedState(
              e,
              r
            ), t = n.getState().initialStateGlobal[e], a = W(t, r);
            return G(l, a) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const l = n.getState().initialStateGlobal[e], t = Y(e), a = J(t?.localStorage?.key) ? t?.localStorage?.key(l) : t?.localStorage?.key, o = `${u}-${e}-${a}`;
            o && localStorage.removeItem(o);
          };
        if (c === "showValidationErrors")
          return () => {
            const l = n.getState().getInitialOptions(e)?.validation;
            if (!l?.key)
              throw new Error("Validation key not found");
            return n.getState().getValidationErrors(l.key + "." + r.join("."));
          };
        if (Array.isArray(m)) {
          const l = () => y?.validIndices ? m.map((a, o) => ({
            item: a,
            originalIndex: y.validIndices[o]
          })) : n.getState().getNestedState(e, r).map((a, o) => ({
            item: a,
            originalIndex: o
          }));
          if (c === "getSelected")
            return () => {
              const t = n.getState().getSelectedIndex(e, r.join("."));
              if (t !== void 0)
                return s(
                  m[t],
                  [...r, t.toString()],
                  y
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
              const o = [...l()].sort(
                (f, N) => t(f.item, N.item)
              ), d = o.map(({ item: f }) => f), I = {
                ...y,
                validIndices: o.map(
                  ({ originalIndex: f }) => f
                )
              };
              return s(d, r, I);
            };
          if (c === "stateFilter")
            return (t) => {
              const o = l().filter(
                ({ item: f }, N) => t(f, N)
              ), d = o.map(({ item: f }) => f), I = {
                ...y,
                validIndices: o.map(
                  ({ originalIndex: f }) => f
                )
              };
              return s(d, r, I);
            };
          if (c === "stateMap" || c === "stateMapNoRender")
            return (t) => m.map((o, d) => {
              let I;
              y?.validIndices && y.validIndices[d] !== void 0 ? I = y.validIndices[d] : I = d;
              const f = [...r, I.toString()], N = s(o, f, y);
              return t(
                o,
                N,
                d,
                m,
                s(m, r, y)
              );
            });
          if (c === "$stateMap")
            return (t) => ae(Ge, {
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
              const a = m;
              S.clear(), E++;
              const o = a.flatMap(
                (d) => d[t] ?? []
              );
              return s(
                o,
                [...r, "[*]", t],
                y
              );
            };
          if (c === "index")
            return (t) => {
              const a = m[t];
              return s(a, [...r, t.toString()]);
            };
          if (c === "last")
            return () => {
              const t = n.getState().getNestedState(e, r);
              if (t.length === 0) return;
              const a = t.length - 1, o = t[a], d = [...r, a.toString()];
              return s(o, d);
            };
          if (c === "insert")
            return (t) => (p(r), ce(i, t, r, e), s(
              n.getState().getNestedState(e, r),
              r
            ));
          if (c === "uniqueInsert")
            return (t, a, o) => {
              const d = n.getState().getNestedState(e, r), I = J(t) ? t(d) : t;
              let f = null;
              if (!d.some((w) => {
                if (a) {
                  const F = a.every(
                    (b) => G(w[b], I[b])
                  );
                  return F && (f = w), F;
                }
                const $ = G(w, I);
                return $ && (f = w), $;
              }))
                p(r), ce(i, I, r, e);
              else if (o && f) {
                const w = o(f), $ = d.map(
                  (F) => G(F, f) ? w : F
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
              for (let a = 0; a < m.length; a++)
                m[a] === t && ee(i, r, e, a);
            };
          if (c === "toggleByValue")
            return (t) => {
              const a = m.findIndex((o) => o === t);
              a > -1 ? ee(i, r, e, a) : ce(i, t, r, e);
            };
          if (c === "stateFind")
            return (t) => {
              const o = l().find(
                ({ item: I }, f) => t(I, f)
              );
              if (!o) return;
              const d = [...r, o.originalIndex.toString()];
              return s(o.item, d, y);
            };
          if (c === "findWith")
            return (t, a) => {
              const d = l().find(
                ({ item: f }) => f[t] === a
              );
              if (!d) return;
              const I = [...r, d.originalIndex.toString()];
              return s(d.item, I, y);
            };
        }
        const L = r[r.length - 1];
        if (!isNaN(Number(L))) {
          const l = r.slice(0, -1), t = n.getState().getNestedState(e, l);
          if (Array.isArray(t) && c === "cut")
            return () => ee(
              i,
              l,
              e,
              Number(L)
            );
        }
        if (c === "get")
          return () => n.getState().getNestedState(e, r);
        if (c === "$derive")
          return (l) => le({
            _stateKey: e,
            _path: r,
            _effect: l.toString()
          });
        if (c === "$derive")
          return (l) => le({
            _stateKey: e,
            _path: r,
            _effect: l.toString()
          });
        if (c === "$get")
          return () => le({
            _stateKey: e,
            _path: r
          });
        if (c === "lastSynced") {
          const l = `${e}:${r.join(".")}`;
          return n.getState().getSyncInfo(l);
        }
        if (c == "getLocalStorage")
          return (l) => oe(u + "-" + e + "-" + l);
        if (c === "_selected") {
          const l = r.slice(0, -1), t = l.join("."), a = n.getState().getNestedState(e, l);
          return Array.isArray(a) ? Number(r[r.length - 1]) === n.getState().getSelectedIndex(e, t) : void 0;
        }
        if (c === "setSelected")
          return (l) => {
            const t = r.slice(0, -1), a = Number(r[r.length - 1]), o = t.join(".");
            l ? n.getState().setSelectedIndex(e, o, a) : n.getState().setSelectedIndex(e, o, void 0);
            const d = n.getState().getNestedState(e, [...t]);
            Q(i, d, t), p(t);
          };
        if (c === "toggleSelected")
          return () => {
            const l = r.slice(0, -1), t = Number(r[r.length - 1]), a = l.join("."), o = n.getState().getSelectedIndex(e, a);
            n.getState().setSelectedIndex(
              e,
              a,
              o === t ? void 0 : t
            );
            const d = n.getState().getNestedState(e, [...l]);
            Q(i, d, l), p(l);
          };
        if (r.length == 0) {
          if (c === "applyJsonPatch")
            return (l) => {
              const t = n.getState().cogsStateStore[e], o = Ce(t, l).newDocument;
              ke(
                e,
                n.getState().initialStateGlobal[e],
                o,
                i,
                v,
                u
              );
              const d = n.getState().stateComponents.get(e);
              if (d) {
                const I = fe(t, o), f = new Set(I);
                for (const [
                  N,
                  w
                ] of d.components.entries()) {
                  let $ = !1;
                  const F = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!F.includes("none")) {
                    if (F.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (F.includes("component") && (w.paths.has("") && ($ = !0), !$))
                      for (const b of f) {
                        if (w.paths.has(b)) {
                          $ = !0;
                          break;
                        }
                        let M = b.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const q = b.substring(0, M);
                          if (w.paths.has(q)) {
                            $ = !0;
                            break;
                          }
                          const R = b.substring(
                            M + 1
                          );
                          if (!isNaN(Number(R))) {
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
                          M = q.lastIndexOf(".");
                        }
                        if ($) break;
                      }
                    if (!$ && F.includes("deps") && w.depsFunction) {
                      const b = w.depsFunction(o);
                      let M = !1;
                      typeof b == "boolean" ? b && (M = !0) : G(w.deps, b) || (w.deps = b, M = !0), M && ($ = !0);
                    }
                    $ && w.forceUpdate();
                  }
                }
              }
            };
          if (c === "validateZodSchema")
            return () => {
              const l = n.getState().getInitialOptions(e)?.validation, t = n.getState().addValidationError;
              if (!l?.zodSchema)
                throw new Error("Zod schema not found");
              if (!l?.key)
                throw new Error("Validation key not found");
              B(l.key);
              const a = n.getState().cogsStateStore[e];
              try {
                const o = n.getState().getValidationErrors(l.key);
                o && o.length > 0 && o.forEach(([I]) => {
                  I && I.startsWith(l.key) && B(I);
                });
                const d = l.zodSchema.safeParse(a);
                return d.success ? !0 : (d.error.errors.forEach((f) => {
                  const N = f.path, w = f.message, $ = [l.key, ...N].join(".");
                  t($, w);
                }), ie(e), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (c === "_componentId") return v;
          if (c === "getComponents")
            return () => n().stateComponents.get(e);
          if (c === "getAllFormRefs")
            return () => ve.getState().getFormRefsByStateKey(e);
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
          return () => ve.getState().getFormRef(e + "." + r.join("."));
        if (c === "validationWrapper")
          return ({
            children: l,
            hideMessage: t
          }) => /* @__PURE__ */ ye(
            Pe,
            {
              formOpts: t ? { validation: { message: "" } } : void 0,
              path: r,
              validationKey: n.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: y?.validIndices,
              children: l
            }
          );
        if (c === "_stateKey") return e;
        if (c === "_path") return r;
        if (c === "_isServerSynced") return h._isServerSynced;
        if (c === "update")
          return (l, t) => {
            if (t?.debounce)
              be(() => {
                Q(i, l, r, "");
                const a = n.getState().getNestedState(e, r);
                t?.afterUpdate && t.afterUpdate(a);
              }, t.debounce);
            else {
              Q(i, l, r, "");
              const a = n.getState().getNestedState(e, r);
              t?.afterUpdate && t.afterUpdate(a);
            }
            p(r);
          };
        if (c === "formElement")
          return (l, t) => /* @__PURE__ */ ye(
            _e,
            {
              setState: i,
              stateKey: e,
              path: r,
              child: l,
              formOpts: t
            }
          );
        const A = [...r, c], X = n.getState().getNestedState(e, A);
        return s(X, A, y);
      }
    }, U = new Proxy(_, x);
    return S.set(j, {
      proxy: U,
      stateVersion: E
    }), U;
  }
  return s(
    n.getState().getNestedState(e, [])
  );
}
function le(e) {
  return ae(We, { proxy: e });
}
function Ge({
  proxy: e,
  rebuildStateShape: i
}) {
  const v = n().getNestedState(e._stateKey, e._path);
  return Array.isArray(v) ? i(
    v,
    e._path
  ).stateMapNoRender(
    (S, E, p, h, s) => e._mapFn(S, E, p, h, s)
  ) : null;
}
function We({
  proxy: e
}) {
  const i = te(null), v = `${e._stateKey}-${e._path.join(".")}`;
  return ue(() => {
    const u = i.current;
    if (!u || !u.parentElement) return;
    const S = u.parentElement, p = Array.from(S.childNodes).indexOf(u);
    let h = S.getAttribute("data-parent-id");
    h || (h = `parent-${crypto.randomUUID()}`, S.setAttribute("data-parent-id", h));
    const m = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: h,
      position: p,
      effect: e._effect
    };
    n.getState().addSignalElement(v, m);
    const r = n.getState().getNestedState(e._stateKey, e._path);
    let y;
    if (e._effect)
      try {
        y = new Function(
          "state",
          `return (${e._effect})(state)`
        )(r);
      } catch (_) {
        console.error("Error evaluating effect function during mount:", _), y = r;
      }
    else
      y = r;
    y !== null && typeof y == "object" && (y = JSON.stringify(y));
    const j = document.createTextNode(String(y));
    u.replaceWith(j);
  }, [e._stateKey, e._path.join("."), e._effect]), ae("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": v
  });
}
function nt(e) {
  const i = Ve(
    (v) => {
      const u = n.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(e._stateKey, {
        forceUpdate: v,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => u.components.delete(e._stateKey);
    },
    () => n.getState().getNestedState(e._stateKey, e._path)
  );
  return ae("text", {}, String(i));
}
export {
  le as $cogsSignal,
  nt as $cogsSignalStore,
  Ke as addStateOptions,
  et as createCogsState,
  tt as notifyComponent,
  De as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
