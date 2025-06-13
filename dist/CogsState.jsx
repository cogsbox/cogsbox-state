"use client";
import { jsx as me } from "react/jsx-runtime";
import { useState as le, useRef as Q, useEffect as de, useLayoutEffect as $e, useMemo as ke, createElement as te, useSyncExternalStore as Ne, startTransition as Te } from "react";
import { transformStateFunc as Ve, isDeepEqual as M, isFunction as J, getNestedValue as L, getDifferences as ue, debounce as pe } from "./utility.js";
import { pushFunc as se, updateFn as Y, cutFunc as X, ValidationWrapper as Ae, FormControlComponent as xe } from "./Functions.jsx";
import be from "superjson";
import { v4 as ge } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as ye } from "./store.js";
import { useCogsConfig as we } from "./CogsStateClient.jsx";
import { applyPatch as Ce } from "fast-json-patch";
function ve(e, i) {
  const m = r.getState().getInitialOptions, u = r.getState().setInitialStateOptions, g = m(e) || {};
  u(e, {
    ...g,
    ...i
  });
}
function Ie({
  stateKey: e,
  options: i,
  initialOptionsPart: m
}) {
  const u = Z(e) || {}, g = m[e] || {}, w = r.getState().setInitialStateOptions, I = { ...g, ...u };
  let y = !1;
  if (i)
    for (const s in i)
      I.hasOwnProperty(s) ? (s == "localStorage" && i[s] && I[s].key !== i[s]?.key && (y = !0, I[s] = i[s]), s == "initialState" && i[s] && I[s] !== i[s] && // Different references
      !M(I[s], i[s]) && (y = !0, I[s] = i[s])) : (y = !0, I[s] = i[s]);
  y && w(e, I);
}
function Qe(e, { formElements: i, validation: m }) {
  return { initialState: e, formElements: i, validation: m };
}
const Ke = (e, i) => {
  let m = e;
  const [u, g] = Ve(m);
  (Object.keys(g).length > 0 || i && Object.keys(i).length > 0) && Object.keys(g).forEach((y) => {
    g[y] = g[y] || {}, g[y].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...g[y].formElements || {}
      // State-specific overrides
    }, Z(y) || r.getState().setInitialStateOptions(y, g[y]);
  }), r.getState().setInitialStates(u), r.getState().setCreatedState(u);
  const w = (y, s) => {
    const [f] = le(s?.componentId ?? ge());
    Ie({
      stateKey: y,
      options: s,
      initialOptionsPart: g
    });
    const t = r.getState().cogsStateStore[y] || u[y], v = s?.modifyState ? s.modifyState(t) : t, [j, V] = De(
      v,
      {
        stateKey: y,
        syncUpdate: s?.syncUpdate,
        componentId: f,
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
    return V;
  };
  function I(y, s) {
    Ie({ stateKey: y, options: s, initialOptionsPart: g }), s.localStorage && Re(y, s), re(y);
  }
  return { useCogsState: w, setCogsOptions: I };
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
} = r.getState(), he = (e, i, m, u, g) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    u
  );
  const w = J(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (w && u) {
    const I = `${u}-${i}-${w}`;
    let y;
    try {
      y = ne(I)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: g ?? y
    }, f = be.serialize(s);
    window.localStorage.setItem(
      I,
      JSON.stringify(f.json)
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
  const m = r.getState().cogsStateStore[e], { sessionId: u } = we(), g = J(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (g && u) {
    const w = ne(
      `${u}-${e}-${g}`
    );
    if (w && w.lastUpdated > (w.lastSyncedWithServer || 0))
      return B(e, w.state), re(e), !0;
  }
  return !1;
}, _e = (e, i, m, u, g, w) => {
  const I = {
    initialState: i,
    updaterState: ee(
      e,
      u,
      g,
      w
    ),
    state: m
  };
  fe(e, I.initialState), K(e, I.updaterState), B(e, I.state);
}, re = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || m.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((u) => u());
  });
}, et = (e, i) => {
  const m = r.getState().stateComponents.get(e);
  if (m) {
    const u = `${e}////${i}`, g = m.components.get(u);
    if ((g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none"))
      return;
    g && g.forceUpdate();
  }
}, Ue = (e, i, m, u) => {
  switch (e) {
    case "update":
      return {
        oldValue: L(i, u),
        newValue: L(m, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: L(m, u)
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
  serverSync: m,
  localStorage: u,
  formElements: g,
  reactiveDeps: w,
  reactiveType: I,
  componentId: y,
  initialState: s,
  syncUpdate: f,
  dependencies: t,
  serverState: v
} = {}) {
  const [j, V] = le({}), { sessionId: p } = we();
  let R = !i;
  const [S] = le(i ?? ge()), d = r.getState().stateLog[S], H = Q(/* @__PURE__ */ new Set()), q = Q(y ?? ge()), A = Q(
    null
  );
  A.current = Z(S) ?? null, de(() => {
    if (f && f.stateKey === S && f.path?.[0]) {
      B(S, (o) => ({
        ...o,
        [f.path[0]]: f.newValue
      }));
      const l = `${f.stateKey}:${f.path.join(".")}`;
      r.getState().setSyncInfo(l, {
        timeStamp: f.timeStamp,
        userId: f.userId
      });
    }
  }, [f]), de(() => {
    if (s) {
      ve(S, {
        initialState: s
      });
      const l = A.current, c = l?.serverState?.id !== void 0 && l?.serverState?.status === "success" && l?.serverState?.data, h = r.getState().initialStateGlobal[S];
      if (!(h && !M(h, s) || !h) && !c)
        return;
      let E = null;
      const k = J(l?.localStorage?.key) ? l?.localStorage?.key(s) : l?.localStorage?.key;
      k && p && (E = ne(`${p}-${S}-${k}`));
      let _ = s, P = !1;
      const D = c ? Date.now() : 0, b = E?.lastUpdated || 0, ae = E?.lastSyncedWithServer || 0;
      c && D > b ? (_ = l.serverState.data, P = !0) : E && b > ae && (_ = E.state, l?.localStorage?.onChange && l?.localStorage?.onChange(_)), _e(
        S,
        s,
        _,
        n,
        q.current,
        p
      ), P && k && p && he(_, S, l, p, Date.now()), re(S), (Array.isArray(I) ? I : [I || "component"]).includes("none") || V({});
    }
  }, [
    s,
    v?.status,
    v?.data,
    ...t || []
  ]), $e(() => {
    R && ve(S, {
      serverSync: m,
      formElements: g,
      initialState: s,
      localStorage: u,
      middleware: A.current?.middleware
    });
    const l = `${S}////${q.current}`, o = r.getState().stateComponents.get(S) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(l, {
      forceUpdate: () => V({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: w || void 0,
      reactiveType: I ?? ["component", "deps"]
    }), r.getState().stateComponents.set(S, o), V({}), () => {
      const c = `${S}////${q.current}`;
      o && (o.components.delete(c), o.components.size === 0 && r.getState().stateComponents.delete(S));
    };
  }, []);
  const n = (l, o, c, h) => {
    if (Array.isArray(o)) {
      const N = `${S}-${o.join(".")}`;
      H.current.add(N);
    }
    B(S, (N) => {
      const E = J(l) ? l(N) : l, k = `${S}-${o.join(".")}`;
      if (k) {
        let G = !1, T = r.getState().signalDomElements.get(k);
        if ((!T || T.size === 0) && (c.updateType === "insert" || c.updateType === "cut")) {
          const F = o.slice(0, -1), U = L(E, F);
          if (Array.isArray(U)) {
            G = !0;
            const $ = `${S}-${F.join(".")}`;
            T = r.getState().signalDomElements.get($);
          }
        }
        if (T) {
          const F = G ? L(E, o.slice(0, -1)) : L(E, o);
          T.forEach(({ parentId: U, position: $, effect: C }) => {
            const x = document.querySelector(
              `[data-parent-id="${U}"]`
            );
            if (x) {
              const W = Array.from(x.childNodes);
              if (W[$]) {
                const O = C ? new Function("state", `return (${C})(state)`)(F) : F;
                W[$].textContent = String(O);
              }
            }
          });
        }
      }
      c.updateType === "update" && (h || A.current?.validation?.key) && o && z(
        (h || A.current?.validation?.key) + "." + o.join(".")
      );
      const _ = o.slice(0, o.length - 1);
      c.updateType === "cut" && A.current?.validation?.key && z(
        A.current?.validation?.key + "." + _.join(".")
      ), c.updateType === "insert" && A.current?.validation?.key && Pe(
        A.current?.validation?.key + "." + _.join(".")
      ).filter(([T, F]) => {
        let U = T?.split(".").length;
        if (T == _.join(".") && U == _.length - 1) {
          let $ = T + "." + _;
          z(T), Oe($, F);
        }
      });
      const P = r.getState().stateComponents.get(S);
      if (P) {
        const G = ue(N, E), T = new Set(G), F = c.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          U,
          $
        ] of P.components.entries()) {
          let C = !1;
          const x = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (!x.includes("none")) {
            if (x.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (x.includes("component") && (($.paths.has(F) || $.paths.has("")) && (C = !0), !C))
              for (const W of T) {
                let O = W;
                for (; ; ) {
                  if ($.paths.has(O)) {
                    C = !0;
                    break;
                  }
                  const ie = O.lastIndexOf(".");
                  if (ie !== -1) {
                    const Se = O.substring(
                      0,
                      ie
                    );
                    if (!isNaN(
                      Number(O.substring(ie + 1))
                    ) && $.paths.has(Se)) {
                      C = !0;
                      break;
                    }
                    O = Se;
                  } else
                    O = "";
                  if (O === "")
                    break;
                }
                if (C) break;
              }
            if (!C && x.includes("deps") && $.depsFunction) {
              const W = $.depsFunction(E);
              let O = !1;
              typeof W == "boolean" ? W && (O = !0) : M($.deps, W) || ($.deps = W, O = !0), O && (C = !0);
            }
            C && $.forceUpdate();
          }
        }
      }
      const D = Date.now();
      o = o.map((G, T) => {
        const F = o.slice(0, -1), U = L(E, F);
        return T === o.length - 1 && ["insert", "cut"].includes(c.updateType) ? (U.length - 1).toString() : G;
      }), console.log(
        "mmmmmmmmmmmmmmmmm22222222222222",
        c.updateType,
        N,
        E,
        o
      );
      const { oldValue: b, newValue: ae } = Ue(
        c.updateType,
        N,
        E,
        o
      ), oe = {
        timeStamp: D,
        stateKey: S,
        path: o,
        updateType: c.updateType,
        status: "new",
        oldValue: b,
        newValue: ae
      };
      if (Fe(S, (G) => {
        const F = [...G ?? [], oe].reduce((U, $) => {
          const C = `${$.stateKey}:${JSON.stringify($.path)}`, x = U.get(C);
          return x ? (x.timeStamp = Math.max(x.timeStamp, $.timeStamp), x.newValue = $.newValue, x.oldValue = x.oldValue ?? $.oldValue, x.updateType = $.updateType) : U.set(C, { ...$ }), U;
        }, /* @__PURE__ */ new Map());
        return Array.from(F.values());
      }), he(
        E,
        S,
        A.current,
        p
      ), A.current?.middleware && A.current.middleware({
        updateLog: d,
        update: oe
      }), A.current?.serverSync) {
        const G = r.getState().serverState[S], T = A.current?.serverSync;
        je(S, {
          syncKey: typeof T.syncKey == "string" ? T.syncKey : T.syncKey({ state: E }),
          rollBackState: G,
          actionTimeStamp: Date.now() + (T.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  r.getState().updaterState[S] || (K(
    S,
    ee(
      S,
      n,
      q.current,
      p
    )
  ), r.getState().cogsStateStore[S] || B(S, e), r.getState().initialStateGlobal[S] || fe(S, e));
  const a = ke(() => ee(
    S,
    n,
    q.current,
    p
  ), [S]);
  return [Ee(S), a];
}
function ee(e, i, m, u) {
  const g = /* @__PURE__ */ new Map();
  let w = 0;
  const I = (f) => {
    const t = f.join(".");
    for (const [v] of g)
      (v === t || v.startsWith(t + ".")) && g.delete(v);
    w++;
  }, y = {
    removeValidation: (f) => {
      f?.validationKey && z(f.validationKey);
    },
    revertToInitialState: (f) => {
      const t = r.getState().getInitialOptions(e)?.validation;
      t?.key && z(t?.key), f?.validationKey && z(f.validationKey);
      const v = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), g.clear(), w++;
      const j = s(v, []), V = Z(e), p = J(V?.localStorage?.key) ? V?.localStorage?.key(v) : V?.localStorage?.key, R = `${u}-${e}-${p}`;
      R && localStorage.removeItem(R), K(e, j), B(e, v);
      const S = r.getState().stateComponents.get(e);
      return S && S.components.forEach((d) => {
        d.forceUpdate();
      }), v;
    },
    updateInitialState: (f) => {
      g.clear(), w++;
      const t = ee(
        e,
        i,
        m,
        u
      ), v = r.getState().initialStateGlobal[e], j = Z(e), V = J(j?.localStorage?.key) ? j?.localStorage?.key(v) : j?.localStorage?.key, p = `${u}-${e}-${V}`;
      return console.log("removing storage", p), localStorage.getItem(p) && localStorage.removeItem(p), Te(() => {
        fe(e, f), K(e, t), B(e, f);
        const R = r.getState().stateComponents.get(e);
        R && R.components.forEach((S) => {
          S.forceUpdate();
        });
      }), {
        fetchId: (R) => t.get()[R]
      };
    },
    _initialState: r.getState().initialStateGlobal[e],
    _serverState: r.getState().serverState[e],
    _isLoading: r.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const f = r.getState().serverState[e];
      return !!(f && M(f, Ee(e)));
    }
  };
  function s(f, t = [], v) {
    const j = t.map(String).join(".");
    g.get(j);
    const V = function() {
      return r().getNestedState(e, t);
    };
    Object.keys(y).forEach((S) => {
      V[S] = y[S];
    }), console.log("rebuildStateShapessss", t);
    const p = {
      apply(S, d, H) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, t);
      },
      get(S, d) {
        if (d !== "then" && !d.startsWith("$") && d !== "stateMapNoRender") {
          const n = t.join("."), a = `${e}////${m}`, l = r.getState().stateComponents.get(e);
          if (l) {
            const o = l.components.get(a);
            o && (t.length > 0 || d === "get") && o.paths.add(n);
          }
        }
        if (d === "getDifferences")
          return () => ue(
            r.getState().cogsStateStore[e],
            r.getState().initialStateGlobal[e]
          );
        if (d === "sync" && t.length === 0)
          return async function() {
            const n = r.getState().getInitialOptions(e), a = n?.sync;
            if (!a)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const l = r.getState().getNestedState(e, []), o = n?.validation?.key;
            try {
              const c = await a.action(l);
              if (c && !c.success && c.errors && o) {
                r.getState().removeValidationError(o), c.errors.forEach((N) => {
                  const E = [o, ...N.path].join(".");
                  r.getState().addValidationError(E, N.message);
                });
                const h = r.getState().stateComponents.get(e);
                h && h.components.forEach((N) => {
                  N.forceUpdate();
                });
              }
              return c?.success && a.onSuccess ? a.onSuccess(c.data) : !c?.success && a.onError && a.onError(c.error), c;
            } catch (c) {
              return a.onError && a.onError(c), { success: !1, error: c };
            }
          };
        if (d === "_status") {
          const n = r.getState().getNestedState(e, t), a = r.getState().initialStateGlobal[e], l = L(a, t);
          return M(n, l) ? "fresh" : "stale";
        }
        if (d === "getStatus")
          return function() {
            const n = r().getNestedState(
              e,
              t
            ), a = r.getState().initialStateGlobal[e], l = L(a, t);
            return M(n, l) ? "fresh" : "stale";
          };
        if (d === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[e], a = Z(e), l = J(a?.localStorage?.key) ? a?.localStorage?.key(n) : a?.localStorage?.key, o = `${u}-${e}-${l}`;
            console.log("removing storage", o), o && localStorage.removeItem(o);
          };
        if (d === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(e)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(n.key + "." + t.join("."));
          };
        if (Array.isArray(f)) {
          if (d === "getSelected")
            return () => {
              const n = r.getState().getSelectedIndex(e, t.join("."));
              if (n !== void 0)
                return s(
                  f[n],
                  [...t, n.toString()],
                  v
                );
            };
          if (d === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: e, path: t });
            };
          if (d === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(e, t.join(".")) ?? -1;
          if (d === "stateSort")
            return (n) => {
              const o = [...r.getState().getNestedState(e, t).map((c, h) => ({
                ...c,
                __origIndex: h.toString()
              }))].sort(n);
              return g.clear(), w++, s(o, t, {
                filtered: [...v?.filtered || [], t],
                validIndices: o.map(
                  (c) => parseInt(c.__origIndex)
                )
              });
            };
          if (d === "stateFilter")
            return (n) => {
              const a = f.map((c, h) => ({
                ...c,
                __origIndex: h.toString()
              })), l = [], o = [];
              for (let c = 0; c < a.length; c++)
                n(a[c], c) && (l.push(c), o.push(a[c]));
              return g.clear(), w++, s(o, t, {
                filtered: [...v?.filtered || [], t],
                validIndices: l
                // Always pass validIndices, even if empty
              });
            };
          if (d === "stateMap" || d === "stateMapNoRender")
            return (n) => {
              const a = v?.filtered?.some(
                (o) => o.join(".") === t.join(".")
              ), l = a ? f : r.getState().getNestedState(e, t);
              return d !== "stateMapNoRender" && (g.clear(), w++), l.map((o, c) => {
                const h = a && o.__origIndex ? o.__origIndex : c, N = s(
                  o,
                  [...t, h.toString()],
                  v
                );
                return n(
                  o,
                  N,
                  c,
                  f,
                  s(f, t, v)
                );
              });
            };
          if (d === "$stateMap")
            return (n) => te(Ge, {
              proxy: {
                _stateKey: e,
                _path: t,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (d === "stateFlattenOn")
            return (n) => {
              const l = v?.filtered?.some(
                (c) => c.join(".") === t.join(".")
              ) ? f : r.getState().getNestedState(e, t);
              g.clear(), w++;
              const o = l.flatMap(
                (c, h) => c[n] ?? []
              );
              return s(
                o,
                [...t, "[*]", n],
                v
              );
            };
          if (d === "index")
            return (n) => {
              const a = f[n];
              return s(a, [...t, n.toString()]);
            };
          if (d === "last")
            return () => {
              const n = r.getState().getNestedState(e, t);
              if (n.length === 0) return;
              const a = n.length - 1, l = n[a], o = [...t, a.toString()];
              return s(l, o);
            };
          if (d === "insert")
            return (n) => (I(t), se(i, n, t, e), s(
              r.getState().getNestedState(e, t),
              t
            ));
          if (d === "uniqueInsert")
            return (n, a, l) => {
              const o = r.getState().getNestedState(e, t), c = J(n) ? n(o) : n;
              let h = null;
              if (!o.some((E) => {
                if (a) {
                  const _ = a.every(
                    (P) => M(E[P], c[P])
                  );
                  return _ && (h = E), _;
                }
                const k = M(E, c);
                return k && (h = E), k;
              }))
                I(t), se(i, c, t, e);
              else if (l && h) {
                const E = l(h), k = o.map(
                  (_) => M(_, h) ? E : _
                );
                I(t), Y(i, k, t);
              }
            };
          if (d === "cut")
            return (n, a) => {
              if (!a?.waitForSync)
                return I(t), X(i, t, e, n), s(
                  r.getState().getNestedState(e, t),
                  t
                );
            };
          if (d === "cutByValue")
            return (n) => {
              for (let a = 0; a < f.length; a++)
                f[a] === n && X(i, t, e, a);
            };
          if (d === "toggleByValue")
            return (n) => {
              const a = f.findIndex((l) => l === n);
              a > -1 ? X(i, t, e, a) : se(i, n, t, e);
            };
          if (d === "stateFind")
            return (n) => {
              const a = f.findIndex(n);
              if (a === -1)
                return;
              const l = f[a], o = [...t, a.toString()];
              return s(l, o);
            };
          if (d === "findWith")
            return (n, a) => {
              const l = f.findIndex((h) => h[n] === a);
              if (l === -1) return;
              const o = f[l], c = [...t, l.toString()];
              return g.clear(), w++, s(o, c);
            };
        }
        const H = t[t.length - 1];
        if (!isNaN(Number(H))) {
          const n = t.slice(0, -1), a = r.getState().getNestedState(e, n);
          if (Array.isArray(a) && d === "cut")
            return () => X(
              i,
              n,
              e,
              Number(H)
            );
        }
        if (d === "get")
          return () => r.getState().getNestedState(e, t);
        if (d === "$derive")
          return (n) => ce({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (d === "$derive")
          return (n) => ce({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (d === "$get")
          return () => ce({
            _stateKey: e,
            _path: t
          });
        if (d === "lastSynced") {
          const n = `${e}:${t.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (d == "getLocalStorage")
          return (n) => ne(u + "-" + e + "-" + n);
        if (d === "_selected") {
          const n = t.slice(0, -1), a = n.join("."), l = r.getState().getNestedState(e, n);
          return Array.isArray(l) ? Number(t[t.length - 1]) === r.getState().getSelectedIndex(e, a) : void 0;
        }
        if (d === "setSelected")
          return (n) => {
            const a = t.slice(0, -1), l = Number(t[t.length - 1]), o = a.join(".");
            n ? r.getState().setSelectedIndex(e, o, l) : r.getState().setSelectedIndex(e, o, void 0);
            const c = r.getState().getNestedState(e, [...a]);
            Y(i, c, a), I(a);
          };
        if (d === "toggleSelected")
          return () => {
            const n = t.slice(0, -1), a = Number(t[t.length - 1]), l = n.join("."), o = r.getState().getSelectedIndex(e, l);
            r.getState().setSelectedIndex(
              e,
              l,
              o === a ? void 0 : a
            );
            const c = r.getState().getNestedState(e, [...n]);
            Y(i, c, n), I(n);
          };
        if (t.length == 0) {
          if (d === "applyJsonPatch")
            return (n) => {
              const a = r.getState().cogsStateStore[e], o = Ce(a, n).newDocument;
              _e(
                e,
                r.getState().initialStateGlobal[e],
                o,
                i,
                m,
                u
              );
              const c = r.getState().stateComponents.get(e);
              if (c) {
                const h = ue(a, o), N = new Set(h);
                for (const [
                  E,
                  k
                ] of c.components.entries()) {
                  let _ = !1;
                  const P = Array.isArray(k.reactiveType) ? k.reactiveType : [k.reactiveType || "component"];
                  if (!P.includes("none")) {
                    if (P.includes("all")) {
                      k.forceUpdate();
                      continue;
                    }
                    if (P.includes("component") && (k.paths.has("") && (_ = !0), !_))
                      for (const D of N) {
                        if (k.paths.has(D)) {
                          _ = !0;
                          break;
                        }
                        let b = D;
                        for (; b.includes("."); )
                          if (b = b.substring(
                            0,
                            b.lastIndexOf(".")
                          ), k.paths.has(b)) {
                            _ = !0;
                            break;
                          }
                        if (_) break;
                      }
                    if (!_ && P.includes("deps") && k.depsFunction) {
                      const D = k.depsFunction(o);
                      let b = !1;
                      typeof D == "boolean" ? D && (b = !0) : M(k.deps, D) || (k.deps = D, b = !0), b && (_ = !0);
                    }
                    _ && k.forceUpdate();
                  }
                }
              }
            };
          if (d === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(e)?.validation, a = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              z(n.key);
              const l = r.getState().cogsStateStore[e];
              try {
                const o = r.getState().getValidationErrors(n.key);
                o && o.length > 0 && o.forEach(([h]) => {
                  h && h.startsWith(n.key) && z(h);
                });
                const c = n.zodSchema.safeParse(l);
                return c.success ? !0 : (c.error.errors.forEach((N) => {
                  const E = N.path, k = N.message, _ = [n.key, ...E].join(".");
                  a(_, k);
                }), re(e), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (d === "_componentId") return m;
          if (d === "getComponents")
            return () => r().stateComponents.get(e);
          if (d === "getAllFormRefs")
            return () => ye.getState().getFormRefsByStateKey(e);
          if (d === "_initialState")
            return r.getState().initialStateGlobal[e];
          if (d === "_serverState")
            return r.getState().serverState[e];
          if (d === "_isLoading")
            return r.getState().isLoadingGlobal[e];
          if (d === "revertToInitialState")
            return y.revertToInitialState;
          if (d === "updateInitialState") return y.updateInitialState;
          if (d === "removeValidation") return y.removeValidation;
        }
        if (d === "getFormRef")
          return () => ye.getState().getFormRef(e + "." + t.join("."));
        if (d === "validationWrapper")
          return ({
            children: n,
            hideMessage: a
          }) => /* @__PURE__ */ me(
            Ae,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: t,
              validationKey: r.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: v?.validIndices,
              children: n
            }
          );
        if (d === "_stateKey") return e;
        if (d === "_path") return t;
        if (d === "_isServerSynced") return y._isServerSynced;
        if (d === "update")
          return (n, a) => {
            if (a?.debounce)
              pe(() => {
                Y(i, n, t, "");
                const l = r.getState().getNestedState(e, t);
                a?.afterUpdate && a.afterUpdate(l);
              }, a.debounce);
            else {
              Y(i, n, t, "");
              const l = r.getState().getNestedState(e, t);
              a?.afterUpdate && a.afterUpdate(l);
            }
            I(t);
          };
        if (d === "formElement")
          return (n, a) => /* @__PURE__ */ me(
            xe,
            {
              setState: i,
              stateKey: e,
              path: t,
              child: n,
              formOpts: a
            }
          );
        const q = [...t, d], A = r.getState().getNestedState(e, q);
        return s(A, q, v);
      }
    }, R = new Proxy(V, p);
    return g.set(j, {
      proxy: R,
      stateVersion: w
    }), R;
  }
  return s(
    r.getState().getNestedState(e, [])
  );
}
function ce(e) {
  return te(Me, { proxy: e });
}
function Ge({
  proxy: e,
  rebuildStateShape: i
}) {
  const m = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(m) ? i(
    m,
    e._path
  ).stateMapNoRender(
    (g, w, I, y, s) => e._mapFn(g, w, I, y, s)
  ) : null;
}
function Me({
  proxy: e
}) {
  const i = Q(null), m = `${e._stateKey}-${e._path.join(".")}`;
  return de(() => {
    const u = i.current;
    if (!u || !u.parentElement) return;
    const g = u.parentElement, I = Array.from(g.childNodes).indexOf(u);
    let y = g.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, g.setAttribute("data-parent-id", y));
    const f = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: I,
      effect: e._effect
    };
    r.getState().addSignalElement(m, f);
    const t = r.getState().getNestedState(e._stateKey, e._path);
    let v;
    if (e._effect)
      try {
        v = new Function(
          "state",
          `return (${e._effect})(state)`
        )(t);
      } catch (V) {
        console.error("Error evaluating effect function during mount:", V), v = t;
      }
    else
      v = t;
    v !== null && typeof v == "object" && (v = JSON.stringify(v));
    const j = document.createTextNode(String(v));
    u.replaceWith(j);
  }, [e._stateKey, e._path.join("."), e._effect]), te("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function tt(e) {
  const i = Ne(
    (m) => {
      const u = r.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(e._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => u.components.delete(e._stateKey);
    },
    () => r.getState().getNestedState(e._stateKey, e._path)
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
