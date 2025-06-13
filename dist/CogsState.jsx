"use client";
import { jsx as me } from "react/jsx-runtime";
import { useState as le, useRef as Q, useEffect as de, useLayoutEffect as $e, useMemo as ke, createElement as te, useSyncExternalStore as Ne, startTransition as Ae } from "react";
import { transformStateFunc as Te, isDeepEqual as M, isFunction as J, getNestedValue as L, getDifferences as ue, debounce as pe } from "./utility.js";
import { pushFunc as se, updateFn as Y, cutFunc as X, ValidationWrapper as Ve, FormControlComponent as xe } from "./Functions.jsx";
import be from "superjson";
import { v4 as ge } from "uuid";
import "zod";
import { getGlobalStore as n, formRefStore as ye } from "./store.js";
import { useCogsConfig as we } from "./CogsStateClient.jsx";
import { applyPatch as Ce } from "fast-json-patch";
function ve(e, i) {
  const y = n.getState().getInitialOptions, u = n.getState().setInitialStateOptions, g = y(e) || {};
  u(e, {
    ...g,
    ...i
  });
}
function Ie({
  stateKey: e,
  options: i,
  initialOptionsPart: y
}) {
  const u = Z(e) || {}, g = y[e] || {}, E = n.getState().setInitialStateOptions, h = { ...g, ...u };
  let v = !1;
  if (i)
    for (const s in i)
      h.hasOwnProperty(s) ? (s == "localStorage" && i[s] && h[s].key !== i[s]?.key && (v = !0, h[s] = i[s]), s == "initialState" && i[s] && h[s] !== i[s] && // Different references
      !M(h[s], i[s]) && (v = !0, h[s] = i[s])) : (v = !0, h[s] = i[s]);
  v && E(e, h);
}
function Qe(e, { formElements: i, validation: y }) {
  return { initialState: e, formElements: i, validation: y };
}
const Ke = (e, i) => {
  let y = e;
  const [u, g] = Te(y);
  (Object.keys(g).length > 0 || i && Object.keys(i).length > 0) && Object.keys(g).forEach((v) => {
    g[v] = g[v] || {}, g[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...g[v].formElements || {}
      // State-specific overrides
    }, Z(v) || n.getState().setInitialStateOptions(v, g[v]);
  }), n.getState().setInitialStates(u), n.getState().setCreatedState(u);
  const E = (v, s) => {
    const [S] = le(s?.componentId ?? ge());
    Ie({
      stateKey: v,
      options: s,
      initialOptionsPart: g
    });
    const t = n.getState().cogsStateStore[v] || u[v], I = s?.modifyState ? s.modifyState(t) : t, [R, T] = De(
      I,
      {
        stateKey: v,
        syncUpdate: s?.syncUpdate,
        componentId: S,
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
    return T;
  };
  function h(v, s) {
    Ie({ stateKey: v, options: s, initialOptionsPart: g }), s.localStorage && Re(v, s), re(v);
  }
  return { useCogsState: E, setCogsOptions: h };
}, {
  setUpdaterState: K,
  setState: B,
  getInitialOptions: Z,
  getKeyState: Ee,
  getValidationErrors: Pe,
  setStateLog: Fe,
  updateInitialStateGlobal: fe,
  addValidationError: Oe,
  removeValidationError: z,
  setServerSyncActions: je
} = n.getState(), he = (e, i, y, u, g) => {
  y?.log && console.log(
    "saving to localstorage",
    i,
    y.localStorage?.key,
    u
  );
  const E = J(y?.localStorage?.key) ? y.localStorage?.key(e) : y?.localStorage?.key;
  if (E && u) {
    const h = `${u}-${i}-${E}`;
    let v;
    try {
      v = ne(h)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: g ?? v
    }, S = be.serialize(s);
    window.localStorage.setItem(
      h,
      JSON.stringify(S.json)
    );
  }
}, ne = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Re = (e, i) => {
  const y = n.getState().cogsStateStore[e], { sessionId: u } = we(), g = J(i?.localStorage?.key) ? i.localStorage.key(y) : i?.localStorage?.key;
  if (g && u) {
    const E = ne(
      `${u}-${e}-${g}`
    );
    if (E && E.lastUpdated > (E.lastSyncedWithServer || 0))
      return B(e, E.state), re(e), !0;
  }
  return !1;
}, _e = (e, i, y, u, g, E) => {
  const h = {
    initialState: i,
    updaterState: ee(
      e,
      u,
      g,
      E
    ),
    state: y
  };
  fe(e, h.initialState), K(e, h.updaterState), B(e, h.state);
}, re = (e) => {
  const i = n.getState().stateComponents.get(e);
  if (!i) return;
  const y = /* @__PURE__ */ new Set();
  i.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || y.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    y.forEach((u) => u());
  });
}, et = (e, i) => {
  const y = n.getState().stateComponents.get(e);
  if (y) {
    const u = `${e}////${i}`, g = y.components.get(u);
    if ((g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none"))
      return;
    g && g.forceUpdate();
  }
}, Ue = (e, i, y, u) => {
  switch (e) {
    case "update":
      return {
        oldValue: L(i, u),
        newValue: L(y, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: L(y, u)
      };
    case "cut":
      return {
        oldValue: L(i, u),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function De(e, {
  stateKey: i,
  serverSync: y,
  localStorage: u,
  formElements: g,
  reactiveDeps: E,
  reactiveType: h,
  componentId: v,
  initialState: s,
  syncUpdate: S,
  dependencies: t,
  serverState: I
} = {}) {
  const [R, T] = le({}), { sessionId: p } = we();
  let U = !i;
  const [f] = le(i ?? ge()), l = n.getState().stateLog[f], H = Q(/* @__PURE__ */ new Set()), q = Q(v ?? ge()), V = Q(
    null
  );
  V.current = Z(f) ?? null, de(() => {
    if (S && S.stateKey === f && S.path?.[0]) {
      B(f, (a) => ({
        ...a,
        [S.path[0]]: S.newValue
      }));
      const o = `${S.stateKey}:${S.path.join(".")}`;
      n.getState().setSyncInfo(o, {
        timeStamp: S.timeStamp,
        userId: S.userId
      });
    }
  }, [S]), de(() => {
    if (s) {
      ve(f, {
        initialState: s
      });
      const o = V.current, c = o?.serverState?.id !== void 0 && o?.serverState?.status === "success" && o?.serverState?.data, m = n.getState().initialStateGlobal[f];
      if (!(m && !M(m, s) || !m) && !c)
        return;
      let N = null;
      const _ = J(o?.localStorage?.key) ? o?.localStorage?.key(s) : o?.localStorage?.key;
      _ && p && (N = ne(`${p}-${f}-${_}`));
      let k = s, x = !1;
      const C = c ? Date.now() : 0, P = N?.lastUpdated || 0, ae = N?.lastSyncedWithServer || 0;
      c && C > P ? (k = o.serverState.data, x = !0) : N && P > ae && (k = N.state, o?.localStorage?.onChange && o?.localStorage?.onChange(k)), _e(
        f,
        s,
        k,
        d,
        q.current,
        p
      ), x && _ && p && he(k, f, o, p, Date.now()), re(f), (Array.isArray(h) ? h : [h || "component"]).includes("none") || T({});
    }
  }, [
    s,
    I?.status,
    I?.data,
    ...t || []
  ]), $e(() => {
    U && ve(f, {
      serverSync: y,
      formElements: g,
      initialState: s,
      localStorage: u,
      middleware: V.current?.middleware
    });
    const o = `${f}////${q.current}`, a = n.getState().stateComponents.get(f) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(o, {
      forceUpdate: () => T({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0,
      reactiveType: h ?? ["component", "deps"]
    }), n.getState().stateComponents.set(f, a), T({}), () => {
      const c = `${f}////${q.current}`;
      a && (a.components.delete(c), a.components.size === 0 && n.getState().stateComponents.delete(f));
    };
  }, []);
  const d = (o, a, c, m) => {
    if (Array.isArray(a)) {
      const w = `${f}-${a.join(".")}`;
      H.current.add(w);
    }
    B(f, (w) => {
      const N = J(o) ? o(w) : o, _ = `${f}-${a.join(".")}`;
      if (_) {
        let G = !1, A = n.getState().signalDomElements.get(_);
        if ((!A || A.size === 0) && (c.updateType === "insert" || c.updateType === "cut")) {
          const O = a.slice(0, -1), D = L(N, O);
          if (Array.isArray(D)) {
            G = !0;
            const $ = `${f}-${O.join(".")}`;
            A = n.getState().signalDomElements.get($);
          }
        }
        if (A) {
          const O = G ? L(N, a.slice(0, -1)) : L(N, a);
          A.forEach(({ parentId: D, position: $, effect: F }) => {
            const b = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (b) {
              const W = Array.from(b.childNodes);
              if (W[$]) {
                const j = F ? new Function("state", `return (${F})(state)`)(O) : O;
                W[$].textContent = String(j);
              }
            }
          });
        }
      }
      c.updateType === "update" && (m || V.current?.validation?.key) && a && z(
        (m || V.current?.validation?.key) + "." + a.join(".")
      );
      const k = a.slice(0, a.length - 1);
      c.updateType === "cut" && V.current?.validation?.key && z(
        V.current?.validation?.key + "." + k.join(".")
      ), c.updateType === "insert" && V.current?.validation?.key && Pe(
        V.current?.validation?.key + "." + k.join(".")
      ).filter(([A, O]) => {
        let D = A?.split(".").length;
        if (A == k.join(".") && D == k.length - 1) {
          let $ = A + "." + k;
          z(A), Oe($, O);
        }
      });
      const x = n.getState().stateComponents.get(f);
      if (x) {
        const G = ue(w, N), A = new Set(G), O = c.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          D,
          $
        ] of x.components.entries()) {
          let F = !1;
          const b = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (!b.includes("none")) {
            if (b.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (b.includes("component") && (($.paths.has(O) || $.paths.has("")) && (F = !0), !F))
              for (const W of A) {
                let j = W;
                for (; ; ) {
                  if ($.paths.has(j)) {
                    F = !0;
                    break;
                  }
                  const ie = j.lastIndexOf(".");
                  if (ie !== -1) {
                    const Se = j.substring(
                      0,
                      ie
                    );
                    if (!isNaN(
                      Number(j.substring(ie + 1))
                    ) && $.paths.has(Se)) {
                      F = !0;
                      break;
                    }
                    j = Se;
                  } else
                    j = "";
                  if (j === "")
                    break;
                }
                if (F) break;
              }
            if (!F && b.includes("deps") && $.depsFunction) {
              const W = $.depsFunction(N);
              let j = !1;
              typeof W == "boolean" ? W && (j = !0) : M($.deps, W) || ($.deps = W, j = !0), j && (F = !0);
            }
            F && $.forceUpdate();
          }
        }
      }
      const C = Date.now();
      a = a.map((G, A) => {
        const O = a.slice(0, -1), D = L(N, O);
        return A === a.length - 1 && ["insert", "cut"].includes(c.updateType) ? (D.length - 1).toString() : G;
      }), console.log(
        "mmmmmmmmmmmmmmmmm22222222222222",
        c.updateType,
        w,
        N,
        a
      );
      const { oldValue: P, newValue: ae } = Ue(
        c.updateType,
        w,
        N,
        a
      ), oe = {
        timeStamp: C,
        stateKey: f,
        path: a,
        updateType: c.updateType,
        status: "new",
        oldValue: P,
        newValue: ae
      };
      if (Fe(f, (G) => {
        const O = [...G ?? [], oe].reduce((D, $) => {
          const F = `${$.stateKey}:${JSON.stringify($.path)}`, b = D.get(F);
          return b ? (b.timeStamp = Math.max(b.timeStamp, $.timeStamp), b.newValue = $.newValue, b.oldValue = b.oldValue ?? $.oldValue, b.updateType = $.updateType) : D.set(F, { ...$ }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), he(
        N,
        f,
        V.current,
        p
      ), V.current?.middleware && V.current.middleware({
        updateLog: l,
        update: oe
      }), V.current?.serverSync) {
        const G = n.getState().serverState[f], A = V.current?.serverSync;
        je(f, {
          syncKey: typeof A.syncKey == "string" ? A.syncKey : A.syncKey({ state: N }),
          rollBackState: G,
          actionTimeStamp: Date.now() + (A.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return N;
    });
  };
  n.getState().updaterState[f] || (K(
    f,
    ee(
      f,
      d,
      q.current,
      p
    )
  ), n.getState().cogsStateStore[f] || B(f, e), n.getState().initialStateGlobal[f] || fe(f, e));
  const r = ke(() => ee(
    f,
    d,
    q.current,
    p
  ), [f]);
  return [Ee(f), r];
}
function ee(e, i, y, u) {
  const g = /* @__PURE__ */ new Map();
  let E = 0;
  const h = (S) => {
    const t = S.join(".");
    for (const [I] of g)
      (I === t || I.startsWith(t + ".")) && g.delete(I);
    E++;
  }, v = {
    removeValidation: (S) => {
      S?.validationKey && z(S.validationKey);
    },
    revertToInitialState: (S) => {
      const t = n.getState().getInitialOptions(e)?.validation;
      t?.key && z(t?.key), S?.validationKey && z(S.validationKey);
      const I = n.getState().initialStateGlobal[e];
      n.getState().clearSelectedIndexesForState(e), g.clear(), E++;
      const R = s(I, []), T = Z(e), p = J(T?.localStorage?.key) ? T?.localStorage?.key(I) : T?.localStorage?.key, U = `${u}-${e}-${p}`;
      U && localStorage.removeItem(U), K(e, R), B(e, I);
      const f = n.getState().stateComponents.get(e);
      return f && f.components.forEach((l) => {
        l.forceUpdate();
      }), I;
    },
    updateInitialState: (S) => {
      g.clear(), E++;
      const t = ee(
        e,
        i,
        y,
        u
      ), I = n.getState().initialStateGlobal[e], R = Z(e), T = J(R?.localStorage?.key) ? R?.localStorage?.key(I) : R?.localStorage?.key, p = `${u}-${e}-${T}`;
      return console.log("removing storage", p), localStorage.getItem(p) && localStorage.removeItem(p), Ae(() => {
        fe(e, S), K(e, t), B(e, S);
        const U = n.getState().stateComponents.get(e);
        U && U.components.forEach((f) => {
          f.forceUpdate();
        });
      }), {
        fetchId: (U) => t.get()[U]
      };
    },
    _initialState: n.getState().initialStateGlobal[e],
    _serverState: n.getState().serverState[e],
    _isLoading: n.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const S = n.getState().serverState[e];
      return !!(S && M(S, Ee(e)));
    }
  };
  function s(S, t = [], I) {
    const R = t.map(String).join(".");
    g.get(R);
    const T = function() {
      return n().getNestedState(e, t);
    };
    Object.keys(v).forEach((f) => {
      T[f] = v[f];
    }), console.log("rebuildStateShapessss", t);
    const p = {
      apply(f, l, H) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), n().getNestedState(e, t);
      },
      get(f, l) {
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender") {
          const d = t.join("."), r = `${e}////${y}`, o = n.getState().stateComponents.get(e);
          if (o) {
            const a = o.components.get(r);
            a && (t.length > 0 || l === "get") && a.paths.add(d);
          }
        }
        if (l === "getDifferences")
          return () => ue(
            n.getState().cogsStateStore[e],
            n.getState().initialStateGlobal[e]
          );
        if (l === "sync" && t.length === 0)
          return async function() {
            const d = n.getState().getInitialOptions(e), r = d?.sync;
            if (!r)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const o = n.getState().getNestedState(e, []), a = d?.validation?.key;
            try {
              const c = await r.action(o);
              if (c && !c.success && c.errors && a) {
                n.getState().removeValidationError(a), c.errors.forEach((w) => {
                  const N = [a, ...w.path].join(".");
                  n.getState().addValidationError(N, w.message);
                });
                const m = n.getState().stateComponents.get(e);
                m && m.components.forEach((w) => {
                  w.forceUpdate();
                });
              }
              return c?.success && r.onSuccess ? r.onSuccess(c.data) : !c?.success && r.onError && r.onError(c.error), c;
            } catch (c) {
              return r.onError && r.onError(c), { success: !1, error: c };
            }
          };
        if (l === "_status") {
          const d = n.getState().getNestedState(e, t), r = n.getState().initialStateGlobal[e], o = L(r, t);
          return M(d, o) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const d = n().getNestedState(
              e,
              t
            ), r = n.getState().initialStateGlobal[e], o = L(r, t);
            return M(d, o) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const d = n.getState().initialStateGlobal[e], r = Z(e), o = J(r?.localStorage?.key) ? r?.localStorage?.key(d) : r?.localStorage?.key, a = `${u}-${e}-${o}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const d = n.getState().getInitialOptions(e)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return n.getState().getValidationErrors(d.key + "." + t.join("."));
          };
        if (Array.isArray(S)) {
          const d = () => I?.validIndices ? S.map((o, a) => ({
            item: o,
            originalIndex: I.validIndices[a]
          })) : n.getState().getNestedState(e, t).map((o, a) => ({
            item: o,
            originalIndex: a
          }));
          if (l === "getSelected")
            return () => {
              const r = n.getState().getSelectedIndex(e, t.join("."));
              if (r !== void 0)
                return s(
                  S[r],
                  [...t, r.toString()],
                  I
                );
            };
          if (l === "clearSelected")
            return () => {
              n.getState().clearSelectedIndex({ stateKey: e, path: t });
            };
          if (l === "getSelectedIndex")
            return () => n.getState().getSelectedIndex(e, t.join(".")) ?? -1;
          if (l === "stateSort")
            return (r) => {
              const c = [...n.getState().getNestedState(e, t).map((m, w) => ({
                ...m,
                __origIndex: w.toString()
              }))].sort(r);
              return g.clear(), E++, s(c, t, {
                filtered: [...I?.filtered || [], t],
                validIndices: c.map(
                  (m) => parseInt(m.__origIndex)
                )
              });
            };
          if (l === "stateFilter")
            return (r) => {
              const o = S.map((m, w) => ({
                ...m,
                __origIndex: w.toString()
              })), a = [], c = [];
              for (let m = 0; m < o.length; m++)
                r(o[m], m) && (a.push(m), c.push(o[m]));
              return g.clear(), E++, s(c, t, {
                filtered: [...I?.filtered || [], t],
                validIndices: a
                // Always pass validIndices, even if empty
              });
            };
          if (l === "stateMap" || l === "stateMapNoRender")
            return (r) => {
              const o = I?.filtered?.some(
                (c) => c.join(".") === t.join(".")
              ), a = o ? S : n.getState().getNestedState(e, t);
              return l !== "stateMapNoRender" && (g.clear(), E++), a.map((c, m) => {
                const w = o && c.__origIndex ? c.__origIndex : m, N = s(
                  c,
                  [...t, w.toString()],
                  I
                );
                return r(
                  c,
                  N,
                  m,
                  S,
                  s(S, t, I)
                );
              });
            };
          if (l === "$stateMap")
            return (r) => te(Ge, {
              proxy: {
                _stateKey: e,
                _path: t,
                _mapFn: r
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (l === "stateFlattenOn")
            return (r) => {
              const a = I?.filtered?.some(
                (m) => m.join(".") === t.join(".")
              ) ? S : n.getState().getNestedState(e, t);
              g.clear(), E++;
              const c = a.flatMap(
                (m, w) => m[r] ?? []
              );
              return s(
                c,
                [...t, "[*]", r],
                I
              );
            };
          if (l === "index")
            return (r) => {
              const o = S[r];
              return s(o, [...t, r.toString()]);
            };
          if (l === "last")
            return () => {
              const r = n.getState().getNestedState(e, t);
              if (r.length === 0) return;
              const o = r.length - 1, a = r[o], c = [...t, o.toString()];
              return s(a, c);
            };
          if (l === "insert")
            return (r) => (h(t), se(i, r, t, e), s(
              n.getState().getNestedState(e, t),
              t
            ));
          if (l === "uniqueInsert")
            return (r, o, a) => {
              const c = n.getState().getNestedState(e, t), m = J(r) ? r(c) : r;
              let w = null;
              if (!c.some((_) => {
                if (o) {
                  const x = o.every(
                    (C) => M(_[C], m[C])
                  );
                  return x && (w = _), x;
                }
                const k = M(_, m);
                return k && (w = _), k;
              }))
                h(t), se(i, m, t, e);
              else if (a && w) {
                const _ = a(w), k = c.map(
                  (x) => M(x, w) ? _ : x
                );
                h(t), Y(i, k, t);
              }
            };
          if (l === "cut")
            return (r, o) => {
              if (!o?.waitForSync)
                return h(t), X(i, t, e, r), s(
                  n.getState().getNestedState(e, t),
                  t
                );
            };
          if (l === "cutByValue")
            return (r) => {
              for (let o = 0; o < S.length; o++)
                S[o] === r && X(i, t, e, o);
            };
          if (l === "toggleByValue")
            return (r) => {
              const o = S.findIndex((a) => a === r);
              o > -1 ? X(i, t, e, o) : se(i, r, t, e);
            };
          if (l === "stateFind")
            return (r) => {
              const a = d().find(
                ({ item: m }, w) => r(m, w)
              );
              if (!a) return;
              const c = [...t, a.originalIndex.toString()];
              return s(a.item, c, I);
            };
          if (l === "findWith")
            return (r, o) => {
              const a = S.findIndex((w) => w[r] === o);
              if (a === -1) return;
              const c = S[a], m = [...t, a.toString()];
              return g.clear(), E++, s(c, m);
            };
        }
        const H = t[t.length - 1];
        if (!isNaN(Number(H))) {
          const d = t.slice(0, -1), r = n.getState().getNestedState(e, d);
          if (Array.isArray(r) && l === "cut")
            return () => X(
              i,
              d,
              e,
              Number(H)
            );
        }
        if (l === "get")
          return () => n.getState().getNestedState(e, t);
        if (l === "$derive")
          return (d) => ce({
            _stateKey: e,
            _path: t,
            _effect: d.toString()
          });
        if (l === "$derive")
          return (d) => ce({
            _stateKey: e,
            _path: t,
            _effect: d.toString()
          });
        if (l === "$get")
          return () => ce({
            _stateKey: e,
            _path: t
          });
        if (l === "lastSynced") {
          const d = `${e}:${t.join(".")}`;
          return n.getState().getSyncInfo(d);
        }
        if (l == "getLocalStorage")
          return (d) => ne(u + "-" + e + "-" + d);
        if (l === "_selected") {
          const d = t.slice(0, -1), r = d.join("."), o = n.getState().getNestedState(e, d);
          return Array.isArray(o) ? Number(t[t.length - 1]) === n.getState().getSelectedIndex(e, r) : void 0;
        }
        if (l === "setSelected")
          return (d) => {
            const r = t.slice(0, -1), o = Number(t[t.length - 1]), a = r.join(".");
            d ? n.getState().setSelectedIndex(e, a, o) : n.getState().setSelectedIndex(e, a, void 0);
            const c = n.getState().getNestedState(e, [...r]);
            Y(i, c, r), h(r);
          };
        if (l === "toggleSelected")
          return () => {
            const d = t.slice(0, -1), r = Number(t[t.length - 1]), o = d.join("."), a = n.getState().getSelectedIndex(e, o);
            n.getState().setSelectedIndex(
              e,
              o,
              a === r ? void 0 : r
            );
            const c = n.getState().getNestedState(e, [...d]);
            Y(i, c, d), h(d);
          };
        if (t.length == 0) {
          if (l === "applyJsonPatch")
            return (d) => {
              const r = n.getState().cogsStateStore[e], a = Ce(r, d).newDocument;
              _e(
                e,
                n.getState().initialStateGlobal[e],
                a,
                i,
                y,
                u
              );
              const c = n.getState().stateComponents.get(e);
              if (c) {
                const m = ue(r, a), w = new Set(m);
                for (const [
                  N,
                  _
                ] of c.components.entries()) {
                  let k = !1;
                  const x = Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"];
                  if (!x.includes("none")) {
                    if (x.includes("all")) {
                      _.forceUpdate();
                      continue;
                    }
                    if (x.includes("component") && (_.paths.has("") && (k = !0), !k))
                      for (const C of w) {
                        if (_.paths.has(C)) {
                          k = !0;
                          break;
                        }
                        let P = C;
                        for (; P.includes("."); )
                          if (P = P.substring(
                            0,
                            P.lastIndexOf(".")
                          ), _.paths.has(P)) {
                            k = !0;
                            break;
                          }
                        if (k) break;
                      }
                    if (!k && x.includes("deps") && _.depsFunction) {
                      const C = _.depsFunction(a);
                      let P = !1;
                      typeof C == "boolean" ? C && (P = !0) : M(_.deps, C) || (_.deps = C, P = !0), P && (k = !0);
                    }
                    k && _.forceUpdate();
                  }
                }
              }
            };
          if (l === "validateZodSchema")
            return () => {
              const d = n.getState().getInitialOptions(e)?.validation, r = n.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              z(d.key);
              const o = n.getState().cogsStateStore[e];
              try {
                const a = n.getState().getValidationErrors(d.key);
                a && a.length > 0 && a.forEach(([m]) => {
                  m && m.startsWith(d.key) && z(m);
                });
                const c = d.zodSchema.safeParse(o);
                return c.success ? !0 : (c.error.errors.forEach((w) => {
                  const N = w.path, _ = w.message, k = [d.key, ...N].join(".");
                  r(k, _);
                }), re(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return y;
          if (l === "getComponents")
            return () => n().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => ye.getState().getFormRefsByStateKey(e);
          if (l === "_initialState")
            return n.getState().initialStateGlobal[e];
          if (l === "_serverState")
            return n.getState().serverState[e];
          if (l === "_isLoading")
            return n.getState().isLoadingGlobal[e];
          if (l === "revertToInitialState")
            return v.revertToInitialState;
          if (l === "updateInitialState") return v.updateInitialState;
          if (l === "removeValidation") return v.removeValidation;
        }
        if (l === "getFormRef")
          return () => ye.getState().getFormRef(e + "." + t.join("."));
        if (l === "validationWrapper")
          return ({
            children: d,
            hideMessage: r
          }) => /* @__PURE__ */ me(
            Ve,
            {
              formOpts: r ? { validation: { message: "" } } : void 0,
              path: t,
              validationKey: n.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: I?.validIndices,
              children: d
            }
          );
        if (l === "_stateKey") return e;
        if (l === "_path") return t;
        if (l === "_isServerSynced") return v._isServerSynced;
        if (l === "update")
          return (d, r) => {
            if (r?.debounce)
              pe(() => {
                Y(i, d, t, "");
                const o = n.getState().getNestedState(e, t);
                r?.afterUpdate && r.afterUpdate(o);
              }, r.debounce);
            else {
              Y(i, d, t, "");
              const o = n.getState().getNestedState(e, t);
              r?.afterUpdate && r.afterUpdate(o);
            }
            h(t);
          };
        if (l === "formElement")
          return (d, r) => /* @__PURE__ */ me(
            xe,
            {
              setState: i,
              stateKey: e,
              path: t,
              child: d,
              formOpts: r
            }
          );
        const q = [...t, l], V = n.getState().getNestedState(e, q);
        return s(V, q, I);
      }
    }, U = new Proxy(T, p);
    return g.set(R, {
      proxy: U,
      stateVersion: E
    }), U;
  }
  return s(
    n.getState().getNestedState(e, [])
  );
}
function ce(e) {
  return te(Me, { proxy: e });
}
function Ge({
  proxy: e,
  rebuildStateShape: i
}) {
  const y = n().getNestedState(e._stateKey, e._path);
  return Array.isArray(y) ? i(
    y,
    e._path
  ).stateMapNoRender(
    (g, E, h, v, s) => e._mapFn(g, E, h, v, s)
  ) : null;
}
function Me({
  proxy: e
}) {
  const i = Q(null), y = `${e._stateKey}-${e._path.join(".")}`;
  return de(() => {
    const u = i.current;
    if (!u || !u.parentElement) return;
    const g = u.parentElement, h = Array.from(g.childNodes).indexOf(u);
    let v = g.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, g.setAttribute("data-parent-id", v));
    const S = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: h,
      effect: e._effect
    };
    n.getState().addSignalElement(y, S);
    const t = n.getState().getNestedState(e._stateKey, e._path);
    let I;
    if (e._effect)
      try {
        I = new Function(
          "state",
          `return (${e._effect})(state)`
        )(t);
      } catch (T) {
        console.error("Error evaluating effect function during mount:", T), I = t;
      }
    else
      I = t;
    I !== null && typeof I == "object" && (I = JSON.stringify(I));
    const R = document.createTextNode(String(I));
    u.replaceWith(R);
  }, [e._stateKey, e._path.join("."), e._effect]), te("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": y
  });
}
function tt(e) {
  const i = Ne(
    (y) => {
      const u = n.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(e._stateKey, {
        forceUpdate: y,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => u.components.delete(e._stateKey);
    },
    () => n.getState().getNestedState(e._stateKey, e._path)
  );
  return te("text", {}, String(i));
}
export {
  ce as $cogsSignal,
  tt as $cogsSignalStore,
  Qe as addStateOptions,
  Ke as createCogsState,
  et as notifyComponent,
  De as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
