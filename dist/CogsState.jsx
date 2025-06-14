"use client";
import { jsx as ye } from "react/jsx-runtime";
import { useState as de, useRef as te, useEffect as ue, useLayoutEffect as $e, useMemo as Te, createElement as ae, useSyncExternalStore as Ve, startTransition as Ne } from "react";
import { transformStateFunc as Ae, isDeepEqual as W, isFunction as J, getNestedValue as G, getDifferences as ge, debounce as be } from "./utility.js";
import { pushFunc as ce, updateFn as Q, cutFunc as ee, ValidationWrapper as Pe, FormControlComponent as _e } from "./Functions.jsx";
import xe from "superjson";
import { v4 as fe } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as ve } from "./store.js";
import { useCogsConfig as we } from "./CogsStateClient.jsx";
import { applyPatch as Ce } from "fast-json-patch";
function he(e, i) {
  const v = r.getState().getInitialOptions, u = r.getState().setInitialStateOptions, S = v(e) || {};
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
  const u = Y(e) || {}, S = v[e] || {}, E = r.getState().setInitialStateOptions, p = { ...S, ...u };
  let h = !1;
  if (i)
    for (const s in i)
      p.hasOwnProperty(s) ? (s == "localStorage" && i[s] && p[s].key !== i[s]?.key && (h = !0, p[s] = i[s]), s == "initialState" && i[s] && p[s] !== i[s] && // Different references
      !W(p[s], i[s]) && (h = !0, p[s] = i[s])) : (h = !0, p[s] = i[s]);
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
    }, Y(h) || r.getState().setInitialStateOptions(h, S[h]);
  }), r.getState().setInitialStates(u), r.getState().setCreatedState(u);
  const E = (h, s) => {
    const [m] = de(s?.componentId ?? fe());
    Ie({
      stateKey: h,
      options: s,
      initialOptionsPart: S
    });
    const n = r.getState().cogsStateStore[h] || u[h], y = s?.modifyState ? s.modifyState(n) : n, [j, _] = De(
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
} = r.getState(), pe = (e, i, v, u, S) => {
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
  const v = r.getState().cogsStateStore[e], { sessionId: u } = we(), S = J(i?.localStorage?.key) ? i.localStorage.key(v) : i?.localStorage?.key;
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
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const v = /* @__PURE__ */ new Set();
  i.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || v.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    v.forEach((u) => u());
  });
}, tt = (e, i) => {
  const v = r.getState().stateComponents.get(e);
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
        oldValue: G(i, u),
        newValue: G(v, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: G(v, u)
      };
    case "cut":
      return {
        oldValue: G(i, u),
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
  dependencies: n,
  serverState: y
} = {}) {
  const [j, _] = de({}), { sessionId: x } = we();
  let U = !i;
  const [f] = de(i ?? fe()), c = r.getState().stateLog[f], K = te(/* @__PURE__ */ new Set()), L = te(h ?? fe()), A = te(
    null
  );
  A.current = Y(f) ?? null, ue(() => {
    if (m && m.stateKey === f && m.path?.[0]) {
      H(f, (a) => ({
        ...a,
        [m.path[0]]: m.newValue
      }));
      const t = `${m.stateKey}:${m.path.join(".")}`;
      r.getState().setSyncInfo(t, {
        timeStamp: m.timeStamp,
        userId: m.userId
      });
    }
  }, [m]), ue(() => {
    if (s) {
      he(f, {
        initialState: s
      });
      const t = A.current, o = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, d = r.getState().initialStateGlobal[f];
      if (!(d && !W(d, s) || !d) && !o)
        return;
      let g = null;
      const N = J(t?.localStorage?.key) ? t?.localStorage?.key(s) : t?.localStorage?.key;
      N && x && (g = oe(`${x}-${f}-${N}`));
      let w = s, $ = !1;
      const F = o ? Date.now() : 0, b = g?.lastUpdated || 0, M = g?.lastSyncedWithServer || 0;
      o && F > b ? (w = t.serverState.data, $ = !0) : g && b > M && (w = g.state, t?.localStorage?.onChange && t?.localStorage?.onChange(w)), ke(
        f,
        s,
        w,
        X,
        L.current,
        x
      ), $ && N && x && pe(w, f, t, x, Date.now()), ie(f), (Array.isArray(p) ? p : [p || "component"]).includes("none") || _({});
    }
  }, [
    s,
    y?.status,
    y?.data,
    ...n || []
  ]), $e(() => {
    U && he(f, {
      serverSync: v,
      formElements: S,
      initialState: s,
      localStorage: u,
      middleware: A.current?.middleware
    });
    const t = `${f}////${L.current}`, a = r.getState().stateComponents.get(f) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(t, {
      forceUpdate: () => _({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), r.getState().stateComponents.set(f, a), _({}), () => {
      const o = `${f}////${L.current}`;
      a && (a.components.delete(o), a.components.size === 0 && r.getState().stateComponents.delete(f));
    };
  }, []);
  const X = (t, a, o, d) => {
    if (Array.isArray(a)) {
      const I = `${f}-${a.join(".")}`;
      K.current.add(I);
    }
    H(f, (I) => {
      const g = J(t) ? t(I) : t, N = `${f}-${a.join(".")}`;
      if (N) {
        let R = !1, k = r.getState().signalDomElements.get(N);
        if ((!k || k.size === 0) && (o.updateType === "insert" || o.updateType === "cut")) {
          const O = a.slice(0, -1), C = G(g, O);
          if (Array.isArray(C)) {
            R = !0;
            const P = `${f}-${O.join(".")}`;
            k = r.getState().signalDomElements.get(P);
          }
        }
        if (k) {
          const O = R ? G(g, a.slice(0, -1)) : G(g, a);
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
      const $ = r.getState().stateComponents.get(f);
      if ($) {
        const R = ge(I, g), k = new Set(R), O = o.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "", C = [];
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
              const z = T.depsFunction(g);
              let D = !1;
              typeof z == "boolean" ? z && (D = !0) : W(T.deps, z) || (T.deps = z, D = !0), D && (V = !0);
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
        const O = a.slice(0, -1), C = G(g, O);
        return k === a.length - 1 && ["insert", "cut"].includes(o.updateType) ? (C.length - 1).toString() : R;
      });
      const { oldValue: b, newValue: M } = Me(
        o.updateType,
        I,
        g,
        a
      ), q = {
        timeStamp: F,
        stateKey: f,
        path: a,
        updateType: o.updateType,
        status: "new",
        oldValue: b,
        newValue: M
      };
      if (Fe(f, (R) => {
        const O = [...R ?? [], q].reduce((C, P) => {
          const T = `${P.stateKey}:${JSON.stringify(P.path)}`, V = C.get(T);
          return V ? (V.timeStamp = Math.max(V.timeStamp, P.timeStamp), V.newValue = P.newValue, V.oldValue = V.oldValue ?? P.oldValue, V.updateType = P.updateType) : C.set(T, { ...P }), C;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), pe(
        g,
        f,
        A.current,
        x
      ), A.current?.middleware && A.current.middleware({
        updateLog: c,
        update: q
      }), A.current?.serverSync) {
        const R = r.getState().serverState[f], k = A.current?.serverSync;
        je(f, {
          syncKey: typeof k.syncKey == "string" ? k.syncKey : k.syncKey({ state: g }),
          rollBackState: R,
          actionTimeStamp: Date.now() + (k.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return g;
    });
  };
  r.getState().updaterState[f] || (ne(
    f,
    re(
      f,
      X,
      L.current,
      x
    )
  ), r.getState().cogsStateStore[f] || H(f, e), r.getState().initialStateGlobal[f] || Se(f, e));
  const l = Te(() => re(
    f,
    X,
    L.current,
    x
  ), [f, x]);
  return [Ee(f), l];
}
function re(e, i, v, u) {
  const S = /* @__PURE__ */ new Map();
  let E = 0;
  const p = (m) => {
    const n = m.join(".");
    for (const [y] of S)
      (y === n || y.startsWith(n + ".")) && S.delete(y);
    E++;
  }, h = {
    removeValidation: (m) => {
      m?.validationKey && B(m.validationKey);
    },
    revertToInitialState: (m) => {
      const n = r.getState().getInitialOptions(e)?.validation;
      n?.key && B(n?.key), m?.validationKey && B(m.validationKey);
      const y = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), S.clear(), E++;
      const j = s(y, []), _ = Y(e), x = J(_?.localStorage?.key) ? _?.localStorage?.key(y) : _?.localStorage?.key, U = `${u}-${e}-${x}`;
      U && localStorage.removeItem(U), ne(e, j), H(e, y);
      const f = r.getState().stateComponents.get(e);
      return f && f.components.forEach((c) => {
        c.forceUpdate();
      }), y;
    },
    updateInitialState: (m) => {
      S.clear(), E++;
      const n = re(
        e,
        i,
        v,
        u
      ), y = r.getState().initialStateGlobal[e], j = Y(e), _ = J(j?.localStorage?.key) ? j?.localStorage?.key(y) : j?.localStorage?.key, x = `${u}-${e}-${_}`;
      return localStorage.getItem(x) && localStorage.removeItem(x), Ne(() => {
        Se(e, m), ne(e, n), H(e, m);
        const U = r.getState().stateComponents.get(e);
        U && U.components.forEach((f) => {
          f.forceUpdate();
        });
      }), {
        fetchId: (U) => n.get()[U]
      };
    },
    _initialState: r.getState().initialStateGlobal[e],
    _serverState: r.getState().serverState[e],
    _isLoading: r.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const m = r.getState().serverState[e];
      return !!(m && W(m, Ee(e)));
    }
  };
  function s(m, n = [], y) {
    const j = n.map(String).join(".");
    S.get(j);
    const _ = function() {
      return r().getNestedState(e, n);
    };
    Object.keys(h).forEach((f) => {
      _[f] = h[f];
    });
    const x = {
      apply(f, c, K) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${n.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, n);
      },
      get(f, c) {
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
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender" && !K.has(c)) {
          const l = `${e}////${v}`;
          console.log("adding path", l, n, c);
          const t = r.getState().stateComponents.get(e);
          if (t) {
            const a = t.components.get(l);
            if (a && !a.pathsInitialized && (a.pathsInitialized = !0, !a.paths.has(""))) {
              const o = n.join(".");
              let d = !0;
              for (const I of a.paths)
                if (o.startsWith(I) && (o === I || o[I.length] === ".")) {
                  d = !1;
                  break;
                }
              d && (console.log(
                "adding path actualyl adding",
                l,
                n,
                c
              ), a.paths.add(o));
            }
          }
        }
        if (c === "getDifferences")
          return () => ge(
            r.getState().cogsStateStore[e],
            r.getState().initialStateGlobal[e]
          );
        if (c === "sync" && n.length === 0)
          return async function() {
            const l = r.getState().getInitialOptions(e), t = l?.sync;
            if (!t)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const a = r.getState().getNestedState(e, []), o = l?.validation?.key;
            try {
              const d = await t.action(a);
              if (d && !d.success && d.errors && o) {
                r.getState().removeValidationError(o), d.errors.forEach((g) => {
                  const N = [o, ...g.path].join(".");
                  r.getState().addValidationError(N, g.message);
                });
                const I = r.getState().stateComponents.get(e);
                I && I.components.forEach((g) => {
                  g.forceUpdate();
                });
              }
              return d?.success && t.onSuccess ? t.onSuccess(d.data) : !d?.success && t.onError && t.onError(d.error), d;
            } catch (d) {
              return t.onError && t.onError(d), { success: !1, error: d };
            }
          };
        if (c === "_status") {
          const l = r.getState().getNestedState(e, n), t = r.getState().initialStateGlobal[e], a = G(t, n);
          return W(l, a) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const l = r().getNestedState(
              e,
              n
            ), t = r.getState().initialStateGlobal[e], a = G(t, n);
            return W(l, a) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const l = r.getState().initialStateGlobal[e], t = Y(e), a = J(t?.localStorage?.key) ? t?.localStorage?.key(l) : t?.localStorage?.key, o = `${u}-${e}-${a}`;
            o && localStorage.removeItem(o);
          };
        if (c === "showValidationErrors")
          return () => {
            const l = r.getState().getInitialOptions(e)?.validation;
            if (!l?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(l.key + "." + n.join("."));
          };
        if (Array.isArray(m)) {
          const l = () => y?.validIndices ? m.map((a, o) => ({
            item: a,
            originalIndex: y.validIndices[o]
          })) : r.getState().getNestedState(e, n).map((a, o) => ({
            item: a,
            originalIndex: o
          }));
          if (c === "getSelected")
            return () => {
              const t = r.getState().getSelectedIndex(e, n.join("."));
              if (t !== void 0)
                return s(
                  m[t],
                  [...n, t.toString()],
                  y
                );
            };
          if (c === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: e, path: n });
            };
          if (c === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(e, n.join(".")) ?? -1;
          if (c === "stateSort")
            return (t) => {
              const o = [...l()].sort(
                (g, N) => t(g.item, N.item)
              ), d = o.map(({ item: g }) => g), I = {
                ...y,
                validIndices: o.map(
                  ({ originalIndex: g }) => g
                )
              };
              return s(d, n, I);
            };
          if (c === "stateFilter")
            return (t) => {
              const o = l().filter(
                ({ item: g }, N) => t(g, N)
              ), d = o.map(({ item: g }) => g), I = {
                ...y,
                validIndices: o.map(
                  ({ originalIndex: g }) => g
                )
              };
              return s(d, n, I);
            };
          if (c === "stateMap" || c === "stateMapNoRender")
            return (t) => m.map((o, d) => {
              let I;
              y?.validIndices && y.validIndices[d] !== void 0 ? I = y.validIndices[d] : I = d;
              const g = [...n, I.toString()], N = s(o, g, y);
              return t(
                o,
                N,
                d,
                m,
                s(m, n, y)
              );
            });
          if (c === "$stateMap")
            return (t) => ae(We, {
              proxy: {
                _stateKey: e,
                _path: n,
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
                [...n, "[*]", t],
                y
              );
            };
          if (c === "index")
            return (t) => {
              const a = m[t];
              return s(a, [...n, t.toString()]);
            };
          if (c === "last")
            return () => {
              const t = r.getState().getNestedState(e, n);
              if (t.length === 0) return;
              const a = t.length - 1, o = t[a], d = [...n, a.toString()];
              return s(o, d);
            };
          if (c === "insert")
            return (t) => (p(n), ce(i, t, n, e), s(
              r.getState().getNestedState(e, n),
              n
            ));
          if (c === "uniqueInsert")
            return (t, a, o) => {
              const d = r.getState().getNestedState(e, n), I = J(t) ? t(d) : t;
              let g = null;
              if (!d.some((w) => {
                if (a) {
                  const F = a.every(
                    (b) => W(w[b], I[b])
                  );
                  return F && (g = w), F;
                }
                const $ = W(w, I);
                return $ && (g = w), $;
              }))
                p(n), ce(i, I, n, e);
              else if (o && g) {
                const w = o(g), $ = d.map(
                  (F) => W(F, g) ? w : F
                );
                p(n), Q(i, $, n);
              }
            };
          if (c === "cut")
            return (t, a) => {
              if (!a?.waitForSync)
                return p(n), ee(i, n, e, t), s(
                  r.getState().getNestedState(e, n),
                  n
                );
            };
          if (c === "cutByValue")
            return (t) => {
              for (let a = 0; a < m.length; a++)
                m[a] === t && ee(i, n, e, a);
            };
          if (c === "toggleByValue")
            return (t) => {
              const a = m.findIndex((o) => o === t);
              a > -1 ? ee(i, n, e, a) : ce(i, t, n, e);
            };
          if (c === "stateFind")
            return (t) => {
              const o = l().find(
                ({ item: I }, g) => t(I, g)
              );
              if (!o) return;
              const d = [...n, o.originalIndex.toString()];
              return s(o.item, d, y);
            };
          if (c === "findWith")
            return (t, a) => {
              const d = l().find(
                ({ item: g }) => g[t] === a
              );
              if (!d) return;
              const I = [...n, d.originalIndex.toString()];
              return s(d.item, I, y);
            };
        }
        const L = n[n.length - 1];
        if (!isNaN(Number(L))) {
          const l = n.slice(0, -1), t = r.getState().getNestedState(e, l);
          if (Array.isArray(t) && c === "cut")
            return () => ee(
              i,
              l,
              e,
              Number(L)
            );
        }
        if (c === "get")
          return () => r.getState().getNestedState(e, n);
        if (c === "$derive")
          return (l) => le({
            _stateKey: e,
            _path: n,
            _effect: l.toString()
          });
        if (c === "$derive")
          return (l) => le({
            _stateKey: e,
            _path: n,
            _effect: l.toString()
          });
        if (c === "$get")
          return () => le({
            _stateKey: e,
            _path: n
          });
        if (c === "lastSynced") {
          const l = `${e}:${n.join(".")}`;
          return r.getState().getSyncInfo(l);
        }
        if (c == "getLocalStorage")
          return (l) => oe(u + "-" + e + "-" + l);
        if (c === "_selected") {
          const l = n.slice(0, -1), t = l.join("."), a = r.getState().getNestedState(e, l);
          return Array.isArray(a) ? Number(n[n.length - 1]) === r.getState().getSelectedIndex(e, t) : void 0;
        }
        if (c === "setSelected")
          return (l) => {
            const t = n.slice(0, -1), a = Number(n[n.length - 1]), o = t.join(".");
            l ? r.getState().setSelectedIndex(e, o, a) : r.getState().setSelectedIndex(e, o, void 0);
            const d = r.getState().getNestedState(e, [...t]);
            Q(i, d, t), p(t);
          };
        if (c === "toggleSelected")
          return () => {
            const l = n.slice(0, -1), t = Number(n[n.length - 1]), a = l.join("."), o = r.getState().getSelectedIndex(e, a);
            r.getState().setSelectedIndex(
              e,
              a,
              o === t ? void 0 : t
            );
            const d = r.getState().getNestedState(e, [...l]);
            Q(i, d, l), p(l);
          };
        if (n.length == 0) {
          if (c === "applyJsonPatch")
            return (l) => {
              const t = r.getState().cogsStateStore[e], o = Ce(t, l).newDocument;
              ke(
                e,
                r.getState().initialStateGlobal[e],
                o,
                i,
                v,
                u
              );
              const d = r.getState().stateComponents.get(e);
              if (d) {
                const I = ge(t, o), g = new Set(I);
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
                      for (const b of g) {
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
                      typeof b == "boolean" ? b && (M = !0) : W(w.deps, b) || (w.deps = b, M = !0), M && ($ = !0);
                    }
                    $ && w.forceUpdate();
                  }
                }
              }
            };
          if (c === "validateZodSchema")
            return () => {
              const l = r.getState().getInitialOptions(e)?.validation, t = r.getState().addValidationError;
              if (!l?.zodSchema)
                throw new Error("Zod schema not found");
              if (!l?.key)
                throw new Error("Validation key not found");
              B(l.key);
              const a = r.getState().cogsStateStore[e];
              try {
                const o = r.getState().getValidationErrors(l.key);
                o && o.length > 0 && o.forEach(([I]) => {
                  I && I.startsWith(l.key) && B(I);
                });
                const d = l.zodSchema.safeParse(a);
                return d.success ? !0 : (d.error.errors.forEach((g) => {
                  const N = g.path, w = g.message, $ = [l.key, ...N].join(".");
                  t($, w);
                }), ie(e), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (c === "_componentId") return v;
          if (c === "getComponents")
            return () => r().stateComponents.get(e);
          if (c === "getAllFormRefs")
            return () => ve.getState().getFormRefsByStateKey(e);
          if (c === "_initialState")
            return r.getState().initialStateGlobal[e];
          if (c === "_serverState")
            return r.getState().serverState[e];
          if (c === "_isLoading")
            return r.getState().isLoadingGlobal[e];
          if (c === "revertToInitialState")
            return h.revertToInitialState;
          if (c === "updateInitialState") return h.updateInitialState;
          if (c === "removeValidation") return h.removeValidation;
        }
        if (c === "getFormRef")
          return () => ve.getState().getFormRef(e + "." + n.join("."));
        if (c === "validationWrapper")
          return ({
            children: l,
            hideMessage: t
          }) => /* @__PURE__ */ ye(
            Pe,
            {
              formOpts: t ? { validation: { message: "" } } : void 0,
              path: n,
              validationKey: r.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: y?.validIndices,
              children: l
            }
          );
        if (c === "_stateKey") return e;
        if (c === "_path") return n;
        if (c === "_isServerSynced") return h._isServerSynced;
        if (c === "update")
          return (l, t) => {
            if (t?.debounce)
              be(() => {
                Q(i, l, n, "");
                const a = r.getState().getNestedState(e, n);
                t?.afterUpdate && t.afterUpdate(a);
              }, t.debounce);
            else {
              Q(i, l, n, "");
              const a = r.getState().getNestedState(e, n);
              t?.afterUpdate && t.afterUpdate(a);
            }
            p(n);
          };
        if (c === "formElement")
          return (l, t) => /* @__PURE__ */ ye(
            _e,
            {
              setState: i,
              stateKey: e,
              path: n,
              child: l,
              formOpts: t
            }
          );
        const A = [...n, c], X = r.getState().getNestedState(e, A);
        return s(X, A, y);
      }
    }, U = new Proxy(_, x);
    return S.set(j, {
      proxy: U,
      stateVersion: E
    }), U;
  }
  return s(
    r.getState().getNestedState(e, [])
  );
}
function le(e) {
  return ae(Ge, { proxy: e });
}
function We({
  proxy: e,
  rebuildStateShape: i
}) {
  const v = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(v) ? i(
    v,
    e._path
  ).stateMapNoRender(
    (S, E, p, h, s) => e._mapFn(S, E, p, h, s)
  ) : null;
}
function Ge({
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
    r.getState().addSignalElement(v, m);
    const n = r.getState().getNestedState(e._stateKey, e._path);
    let y;
    if (e._effect)
      try {
        y = new Function(
          "state",
          `return (${e._effect})(state)`
        )(n);
      } catch (_) {
        console.error("Error evaluating effect function during mount:", _), y = n;
      }
    else
      y = n;
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
      const u = r.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(e._stateKey, {
        forceUpdate: v,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => u.components.delete(e._stateKey);
    },
    () => r.getState().getNestedState(e._stateKey, e._path)
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
