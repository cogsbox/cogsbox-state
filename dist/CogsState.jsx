"use client";
import { jsx as Se } from "react/jsx-runtime";
import { useState as le, useRef as Q, useEffect as de, useLayoutEffect as pe, useMemo as ke, createElement as te, useSyncExternalStore as Ae, startTransition as Te } from "react";
import { transformStateFunc as Ne, isDeepEqual as M, isFunction as z, getNestedValue as W, getDifferences as he, debounce as Ve } from "./utility.js";
import { pushFunc as se, updateFn as Y, cutFunc as X, ValidationWrapper as _e, FormControlComponent as be } from "./Functions.jsx";
import Pe from "superjson";
import { v4 as ue } from "uuid";
import "zod";
import { getGlobalStore as n, formRefStore as me } from "./store.js";
import { useCogsConfig as we } from "./CogsStateClient.jsx";
import { applyPatch as Ce } from "fast-json-patch";
function ye(e, i) {
  const m = n.getState().getInitialOptions, u = n.getState().setInitialStateOptions, f = m(e) || {};
  u(e, {
    ...f,
    ...i
  });
}
function ve({
  stateKey: e,
  options: i,
  initialOptionsPart: m
}) {
  const u = Z(e) || {}, f = m[e] || {}, A = n.getState().setInitialStateOptions, p = { ...f, ...u };
  let v = !1;
  if (i)
    for (const s in i)
      p.hasOwnProperty(s) ? (s == "localStorage" && i[s] && p[s].key !== i[s]?.key && (v = !0, p[s] = i[s]), s == "initialState" && i[s] && p[s] !== i[s] && // Different references
      !M(p[s], i[s]) && (v = !0, p[s] = i[s])) : (v = !0, p[s] = i[s]);
  v && A(e, p);
}
function Qe(e, { formElements: i, validation: m }) {
  return { initialState: e, formElements: i, validation: m };
}
const Ke = (e, i) => {
  let m = e;
  const [u, f] = Ne(m);
  (Object.keys(f).length > 0 || i && Object.keys(i).length > 0) && Object.keys(f).forEach((v) => {
    f[v] = f[v] || {}, f[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...f[v].formElements || {}
      // State-specific overrides
    }, Z(v) || n.getState().setInitialStateOptions(v, f[v]);
  }), n.getState().setInitialStates(u), n.getState().setCreatedState(u);
  const A = (v, s) => {
    const [y] = le(s?.componentId ?? ue());
    ve({
      stateKey: v,
      options: s,
      initialOptionsPart: f
    });
    const t = n.getState().cogsStateStore[v] || u[v], I = s?.modifyState ? s.modifyState(t) : t, [j, V] = De(
      I,
      {
        stateKey: v,
        syncUpdate: s?.syncUpdate,
        componentId: y,
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
  function p(v, s) {
    ve({ stateKey: v, options: s, initialOptionsPart: f }), s.localStorage && Re(v, s), re(v);
  }
  return { useCogsState: A, setCogsOptions: p };
}, {
  setUpdaterState: K,
  setState: J,
  getInitialOptions: Z,
  getKeyState: Ee,
  getValidationErrors: xe,
  setStateLog: Oe,
  updateInitialStateGlobal: ge,
  addValidationError: Fe,
  removeValidationError: q,
  setServerSyncActions: je
} = n.getState(), Ie = (e, i, m, u, f) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    u
  );
  const A = z(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (A && u) {
    const p = `${u}-${i}-${A}`;
    let v;
    try {
      v = ne(p)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: f ?? v
    }, y = Pe.serialize(s);
    window.localStorage.setItem(
      p,
      JSON.stringify(y.json)
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
  const m = n.getState().cogsStateStore[e], { sessionId: u } = we(), f = z(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (f && u) {
    const A = ne(
      `${u}-${e}-${f}`
    );
    if (A && A.lastUpdated > (A.lastSyncedWithServer || 0))
      return J(e, A.state), re(e), !0;
  }
  return !1;
}, $e = (e, i, m, u, f, A) => {
  const p = {
    initialState: i,
    updaterState: ee(
      e,
      u,
      f,
      A
    ),
    state: m
  };
  ge(e, p.initialState), K(e, p.updaterState), J(e, p.state);
}, re = (e) => {
  const i = n.getState().stateComponents.get(e);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || m.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((u) => u());
  });
}, et = (e, i) => {
  const m = n.getState().stateComponents.get(e);
  if (m) {
    const u = `${e}////${i}`, f = m.components.get(u);
    if ((f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none"))
      return;
    f && f.forceUpdate();
  }
}, Ue = (e, i, m, u) => {
  switch (e) {
    case "update":
      return {
        oldValue: W(i, u),
        newValue: W(m, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: W(m, u)
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
  serverSync: m,
  localStorage: u,
  formElements: f,
  reactiveDeps: A,
  reactiveType: p,
  componentId: v,
  initialState: s,
  syncUpdate: y,
  dependencies: t,
  serverState: I
} = {}) {
  const [j, V] = le({}), { sessionId: _ } = we();
  let R = !i;
  const [g] = le(i ?? ue()), c = n.getState().stateLog[g], H = Q(/* @__PURE__ */ new Set()), L = Q(v ?? ue()), b = Q(
    null
  );
  b.current = Z(g) ?? null, de(() => {
    if (y && y.stateKey === g && y.path?.[0]) {
      J(g, (a) => ({
        ...a,
        [y.path[0]]: y.newValue
      }));
      const o = `${y.stateKey}:${y.path.join(".")}`;
      n.getState().setSyncInfo(o, {
        timeStamp: y.timeStamp,
        userId: y.userId
      });
    }
  }, [y]), de(() => {
    if (s) {
      ye(g, {
        initialState: s
      });
      const o = b.current, d = o?.serverState?.id !== void 0 && o?.serverState?.status === "success" && o?.serverState?.data, w = n.getState().initialStateGlobal[g];
      if (!(w && !M(w, s) || !w) && !d)
        return;
      let h = null;
      const E = z(o?.localStorage?.key) ? o?.localStorage?.key(s) : o?.localStorage?.key;
      E && _ && (h = ne(`${_}-${g}-${E}`));
      let $ = s, N = !1;
      const P = d ? Date.now() : 0, B = h?.lastUpdated || 0, ae = h?.lastSyncedWithServer || 0;
      d && P > B ? ($ = o.serverState.data, N = !0) : h && B > ae && ($ = h.state, o?.localStorage?.onChange && o?.localStorage?.onChange($)), $e(
        g,
        s,
        $,
        l,
        L.current,
        _
      ), N && E && _ && Ie($, g, o, _, Date.now()), re(g), (Array.isArray(p) ? p : [p || "component"]).includes("none") || V({});
    }
  }, [
    s,
    I?.status,
    I?.data,
    ...t || []
  ]), pe(() => {
    R && ye(g, {
      serverSync: m,
      formElements: f,
      initialState: s,
      localStorage: u,
      middleware: b.current?.middleware
    });
    const o = `${g}////${L.current}`, a = n.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(o, {
      forceUpdate: () => V({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: A || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), n.getState().stateComponents.set(g, a), V({}), () => {
      const d = `${g}////${L.current}`;
      a && (a.components.delete(d), a.components.size === 0 && n.getState().stateComponents.delete(g));
    };
  }, []);
  const l = (o, a, d, w) => {
    if (Array.isArray(a)) {
      const S = `${g}-${a.join(".")}`;
      H.current.add(S);
    }
    J(g, (S) => {
      const h = z(o) ? o(S) : o, E = `${g}-${a.join(".")}`;
      if (E) {
        let D = !1, T = n.getState().signalDomElements.get(E);
        if ((!T || T.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const O = a.slice(0, -1), U = W(h, O);
          if (Array.isArray(U)) {
            D = !0;
            const k = `${g}-${O.join(".")}`;
            T = n.getState().signalDomElements.get(k);
          }
        }
        if (T) {
          const O = D ? W(h, a.slice(0, -1)) : W(h, a);
          T.forEach(({ parentId: U, position: k, effect: x }) => {
            const C = document.querySelector(
              `[data-parent-id="${U}"]`
            );
            if (C) {
              const G = Array.from(C.childNodes);
              if (G[k]) {
                const F = x ? new Function("state", `return (${x})(state)`)(O) : O;
                G[k].textContent = String(F);
              }
            }
          });
        }
      }
      d.updateType === "update" && (w || b.current?.validation?.key) && a && q(
        (w || b.current?.validation?.key) + "." + a.join(".")
      );
      const $ = a.slice(0, a.length - 1);
      d.updateType === "cut" && b.current?.validation?.key && q(
        b.current?.validation?.key + "." + $.join(".")
      ), d.updateType === "insert" && b.current?.validation?.key && xe(
        b.current?.validation?.key + "." + $.join(".")
      ).filter(([T, O]) => {
        let U = T?.split(".").length;
        if (T == $.join(".") && U == $.length - 1) {
          let k = T + "." + $;
          q(T), Fe(k, O);
        }
      });
      const N = n.getState().stateComponents.get(g);
      if (N) {
        const D = he(S, h), T = new Set(D), O = d.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          U,
          k
        ] of N.components.entries()) {
          let x = !1;
          const C = Array.isArray(k.reactiveType) ? k.reactiveType : [k.reactiveType || "component"];
          if (!C.includes("none")) {
            if (C.includes("all")) {
              k.forceUpdate();
              continue;
            }
            if (C.includes("component") && ((k.paths.has(O) || k.paths.has("")) && (x = !0), !x))
              for (const G of T) {
                let F = G;
                for (; ; ) {
                  if (k.paths.has(F)) {
                    x = !0;
                    break;
                  }
                  const ie = F.lastIndexOf(".");
                  if (ie !== -1) {
                    const fe = F.substring(
                      0,
                      ie
                    );
                    if (!isNaN(
                      Number(F.substring(ie + 1))
                    ) && k.paths.has(fe)) {
                      x = !0;
                      break;
                    }
                    F = fe;
                  } else
                    F = "";
                  if (F === "")
                    break;
                }
                if (x) break;
              }
            if (!x && C.includes("deps") && k.depsFunction) {
              const G = k.depsFunction(h);
              let F = !1;
              typeof G == "boolean" ? G && (F = !0) : M(k.deps, G) || (k.deps = G, F = !0), F && (x = !0);
            }
            x && k.forceUpdate();
          }
        }
      }
      const P = Date.now();
      a = a.map((D, T) => {
        const O = a.slice(0, -1), U = W(h, O);
        return T === a.length - 1 && ["insert", "cut"].includes(d.updateType) ? (U.length - 1).toString() : D;
      }), console.log(
        "mmmmmmmmmmmmmmmmm22222222222222",
        d.updateType,
        S,
        h,
        a
      );
      const { oldValue: B, newValue: ae } = Ue(
        d.updateType,
        S,
        h,
        a
      ), oe = {
        timeStamp: P,
        stateKey: g,
        path: a,
        updateType: d.updateType,
        status: "new",
        oldValue: B,
        newValue: ae
      };
      if (Oe(g, (D) => {
        const O = [...D ?? [], oe].reduce((U, k) => {
          const x = `${k.stateKey}:${JSON.stringify(k.path)}`, C = U.get(x);
          return C ? (C.timeStamp = Math.max(C.timeStamp, k.timeStamp), C.newValue = k.newValue, C.oldValue = C.oldValue ?? k.oldValue, C.updateType = k.updateType) : U.set(x, { ...k }), U;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), Ie(
        h,
        g,
        b.current,
        _
      ), b.current?.middleware && b.current.middleware({
        updateLog: c,
        update: oe
      }), b.current?.serverSync) {
        const D = n.getState().serverState[g], T = b.current?.serverSync;
        je(g, {
          syncKey: typeof T.syncKey == "string" ? T.syncKey : T.syncKey({ state: h }),
          rollBackState: D,
          actionTimeStamp: Date.now() + (T.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return h;
    });
  };
  n.getState().updaterState[g] || (K(
    g,
    ee(
      g,
      l,
      L.current,
      _
    )
  ), n.getState().cogsStateStore[g] || J(g, e), n.getState().initialStateGlobal[g] || ge(g, e));
  const r = ke(() => ee(
    g,
    l,
    L.current,
    _
  ), [g]);
  return [Ee(g), r];
}
function ee(e, i, m, u) {
  const f = /* @__PURE__ */ new Map();
  let A = 0;
  const p = (y) => {
    const t = y.join(".");
    for (const [I] of f)
      (I === t || I.startsWith(t + ".")) && f.delete(I);
    A++;
  }, v = {
    removeValidation: (y) => {
      y?.validationKey && q(y.validationKey);
    },
    revertToInitialState: (y) => {
      const t = n.getState().getInitialOptions(e)?.validation;
      t?.key && q(t?.key), y?.validationKey && q(y.validationKey);
      const I = n.getState().initialStateGlobal[e];
      n.getState().clearSelectedIndexesForState(e), f.clear(), A++;
      const j = s(I, []), V = Z(e), _ = z(V?.localStorage?.key) ? V?.localStorage?.key(I) : V?.localStorage?.key, R = `${u}-${e}-${_}`;
      R && localStorage.removeItem(R), K(e, j), J(e, I);
      const g = n.getState().stateComponents.get(e);
      return g && g.components.forEach((c) => {
        c.forceUpdate();
      }), I;
    },
    updateInitialState: (y) => {
      f.clear(), A++;
      const t = ee(
        e,
        i,
        m,
        u
      ), I = n.getState().initialStateGlobal[e], j = Z(e), V = z(j?.localStorage?.key) ? j?.localStorage?.key(I) : j?.localStorage?.key, _ = `${u}-${e}-${V}`;
      return console.log("removing storage", _), localStorage.getItem(_) && localStorage.removeItem(_), Te(() => {
        ge(e, y), K(e, t), J(e, y);
        const R = n.getState().stateComponents.get(e);
        R && R.components.forEach((g) => {
          g.forceUpdate();
        });
      }), {
        fetchId: (R) => t.get()[R]
      };
    },
    _initialState: n.getState().initialStateGlobal[e],
    _serverState: n.getState().serverState[e],
    _isLoading: n.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const y = n.getState().serverState[e];
      return !!(y && M(y, Ee(e)));
    }
  };
  function s(y, t = [], I) {
    const j = t.map(String).join(".");
    f.get(j);
    const V = function() {
      return n().getNestedState(e, t);
    };
    Object.keys(v).forEach((g) => {
      V[g] = v[g];
    });
    const _ = {
      apply(g, c, H) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), n().getNestedState(e, t);
      },
      get(g, c) {
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender") {
          const l = t.join("."), r = `${e}////${m}`, o = n.getState().stateComponents.get(e);
          if (o) {
            const a = o.components.get(r);
            a && (t.length > 0 || c === "get") && a.paths.add(l);
          }
        }
        if (c === "getDifferences")
          return () => he(
            n.getState().cogsStateStore[e],
            n.getState().initialStateGlobal[e]
          );
        if (c === "sync" && t.length === 0)
          return async function() {
            const l = n.getState().getInitialOptions(e), r = l?.sync;
            if (!r)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const o = n.getState().getNestedState(e, []), a = l?.validation?.key;
            try {
              const d = await r.action(o);
              if (d && !d.success && d.errors && a) {
                n.getState().removeValidationError(a), d.errors.forEach((S) => {
                  const h = [a, ...S.path].join(".");
                  n.getState().addValidationError(h, S.message);
                });
                const w = n.getState().stateComponents.get(e);
                w && w.components.forEach((S) => {
                  S.forceUpdate();
                });
              }
              return d?.success && r.onSuccess ? r.onSuccess(d.data) : !d?.success && r.onError && r.onError(d.error), d;
            } catch (d) {
              return r.onError && r.onError(d), { success: !1, error: d };
            }
          };
        if (c === "_status") {
          const l = n.getState().getNestedState(e, t), r = n.getState().initialStateGlobal[e], o = W(r, t);
          return M(l, o) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const l = n().getNestedState(
              e,
              t
            ), r = n.getState().initialStateGlobal[e], o = W(r, t);
            return M(l, o) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const l = n.getState().initialStateGlobal[e], r = Z(e), o = z(r?.localStorage?.key) ? r?.localStorage?.key(l) : r?.localStorage?.key, a = `${u}-${e}-${o}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (c === "showValidationErrors")
          return () => {
            const l = n.getState().getInitialOptions(e)?.validation;
            if (!l?.key)
              throw new Error("Validation key not found");
            return n.getState().getValidationErrors(l.key + "." + t.join("."));
          };
        if (Array.isArray(y)) {
          const l = () => I?.validIndices ? y.map((o, a) => ({
            item: o,
            originalIndex: I.validIndices[a]
          })) : n.getState().getNestedState(e, t).map((o, a) => ({
            item: o,
            originalIndex: a
          }));
          if (c === "getSelected")
            return () => {
              const r = n.getState().getSelectedIndex(e, t.join("."));
              if (r !== void 0)
                return s(
                  y[r],
                  [...t, r.toString()],
                  I
                );
            };
          if (c === "clearSelected")
            return () => {
              n.getState().clearSelectedIndex({ stateKey: e, path: t });
            };
          if (c === "getSelectedIndex")
            return () => n.getState().getSelectedIndex(e, t.join(".")) ?? -1;
          if (c === "stateSort")
            return (r) => {
              const a = [...l()].sort(
                (S, h) => r(S.item, h.item)
              ), d = a.map(({ item: S }) => S), w = {
                ...I,
                validIndices: a.map(
                  ({ originalIndex: S }) => S
                )
              };
              return s(d, t, w);
            };
          if (c === "stateFilter")
            return (r) => {
              const a = l().filter(
                ({ item: S }, h) => r(S, h)
              ), d = a.map(({ item: S }) => S), w = {
                ...I,
                validIndices: a.map(
                  ({ originalIndex: S }) => S
                )
              };
              return s(d, t, w);
            };
          if (c === "stateMap" || c === "stateMapNoRender")
            return (r) => y.map((a, d) => {
              let w;
              I?.validIndices && I.validIndices[d] !== void 0 ? w = I.validIndices[d] : w = d;
              const S = [...t, w.toString()], h = s(a, S, I);
              return r(
                a,
                h,
                d,
                y,
                s(y, t, I)
              );
            });
          if (c === "$stateMap")
            return (r) => te(Me, {
              proxy: {
                _stateKey: e,
                _path: t,
                _mapFn: r
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (c === "stateFlattenOn")
            return (r) => {
              const o = y;
              f.clear(), A++;
              const a = o.flatMap(
                (d) => d[r] ?? []
              );
              return s(
                a,
                [...t, "[*]", r],
                I
              );
            };
          if (c === "index")
            return (r) => {
              const o = y[r];
              return s(o, [...t, r.toString()]);
            };
          if (c === "last")
            return () => {
              const r = n.getState().getNestedState(e, t);
              if (r.length === 0) return;
              const o = r.length - 1, a = r[o], d = [...t, o.toString()];
              return s(a, d);
            };
          if (c === "insert")
            return (r) => (p(t), se(i, r, t, e), s(
              n.getState().getNestedState(e, t),
              t
            ));
          if (c === "uniqueInsert")
            return (r, o, a) => {
              const d = n.getState().getNestedState(e, t), w = z(r) ? r(d) : r;
              let S = null;
              if (!d.some((E) => {
                if (o) {
                  const N = o.every(
                    (P) => M(E[P], w[P])
                  );
                  return N && (S = E), N;
                }
                const $ = M(E, w);
                return $ && (S = E), $;
              }))
                p(t), se(i, w, t, e);
              else if (a && S) {
                const E = a(S), $ = d.map(
                  (N) => M(N, S) ? E : N
                );
                p(t), Y(i, $, t);
              }
            };
          if (c === "cut")
            return (r, o) => {
              if (!o?.waitForSync)
                return p(t), X(i, t, e, r), s(
                  n.getState().getNestedState(e, t),
                  t
                );
            };
          if (c === "cutByValue")
            return (r) => {
              for (let o = 0; o < y.length; o++)
                y[o] === r && X(i, t, e, o);
            };
          if (c === "toggleByValue")
            return (r) => {
              const o = y.findIndex((a) => a === r);
              o > -1 ? X(i, t, e, o) : se(i, r, t, e);
            };
          if (c === "stateFind")
            return (r) => {
              const a = l().find(
                ({ item: w }, S) => r(w, S)
              );
              if (!a) return;
              const d = [...t, a.originalIndex.toString()];
              return s(a.item, d, I);
            };
          if (c === "findWith")
            return (r, o) => {
              const d = l().find(
                ({ item: S }) => S[r] === o
              );
              if (!d) return;
              const w = [...t, d.originalIndex.toString()];
              return s(d.item, w, I);
            };
        }
        const H = t[t.length - 1];
        if (!isNaN(Number(H))) {
          const l = t.slice(0, -1), r = n.getState().getNestedState(e, l);
          if (Array.isArray(r) && c === "cut")
            return () => X(
              i,
              l,
              e,
              Number(H)
            );
        }
        if (c === "get")
          return () => n.getState().getNestedState(e, t);
        if (c === "$derive")
          return (l) => ce({
            _stateKey: e,
            _path: t,
            _effect: l.toString()
          });
        if (c === "$derive")
          return (l) => ce({
            _stateKey: e,
            _path: t,
            _effect: l.toString()
          });
        if (c === "$get")
          return () => ce({
            _stateKey: e,
            _path: t
          });
        if (c === "lastSynced") {
          const l = `${e}:${t.join(".")}`;
          return n.getState().getSyncInfo(l);
        }
        if (c == "getLocalStorage")
          return (l) => ne(u + "-" + e + "-" + l);
        if (c === "_selected") {
          const l = t.slice(0, -1), r = l.join("."), o = n.getState().getNestedState(e, l);
          return Array.isArray(o) ? Number(t[t.length - 1]) === n.getState().getSelectedIndex(e, r) : void 0;
        }
        if (c === "setSelected")
          return (l) => {
            const r = t.slice(0, -1), o = Number(t[t.length - 1]), a = r.join(".");
            l ? n.getState().setSelectedIndex(e, a, o) : n.getState().setSelectedIndex(e, a, void 0);
            const d = n.getState().getNestedState(e, [...r]);
            Y(i, d, r), p(r);
          };
        if (c === "toggleSelected")
          return () => {
            const l = t.slice(0, -1), r = Number(t[t.length - 1]), o = l.join("."), a = n.getState().getSelectedIndex(e, o);
            n.getState().setSelectedIndex(
              e,
              o,
              a === r ? void 0 : r
            );
            const d = n.getState().getNestedState(e, [...l]);
            Y(i, d, l), p(l);
          };
        if (t.length == 0) {
          if (c === "applyJsonPatch")
            return (l) => {
              const r = n.getState().cogsStateStore[e], a = Ce(r, l).newDocument;
              $e(
                e,
                n.getState().initialStateGlobal[e],
                a,
                i,
                m,
                u
              );
              const d = n.getState().stateComponents.get(e);
              if (!d) return;
              const w = /* @__PURE__ */ new Set(), S = (h, E) => {
                w.add(h), Array.isArray(E) ? E.forEach(($, N) => {
                  S(`${h}.${N}`, $);
                }) : typeof E == "object" && E !== null && Object.keys(E).forEach(($) => {
                  S(`${h}.${$}`, E[$]);
                });
              };
              l.forEach((h) => {
                const E = h.path.slice(1).replace(/\//g, ".");
                w.add(E);
                let $ = E;
                for (; $.includes("."); )
                  $ = $.substring(
                    0,
                    $.lastIndexOf(".")
                  ), w.add($);
                w.add(""), (h.op === "add" || h.op === "replace") && h.value && S(E, h.value);
              });
              for (const [
                h,
                E
              ] of d.components.entries()) {
                let $ = !1;
                const N = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
                if (!N.includes("none")) {
                  if (N.includes("all")) {
                    E.forceUpdate();
                    continue;
                  }
                  if (N.includes("component"))
                    for (const P of E.paths) {
                      if (w.has(P)) {
                        $ = !0;
                        break;
                      }
                      for (const B of w)
                        if (P.startsWith(B + ".")) {
                          $ = !0;
                          break;
                        }
                      if ($) break;
                    }
                  if (!$ && N.includes("deps") && E.depsFunction) {
                    const P = E.depsFunction(a);
                    (typeof P == "boolean" ? P : !M(E.deps, P)) && (E.deps = Array.isArray(P) ? P : [], $ = !0);
                  }
                  $ && E.forceUpdate();
                }
              }
            };
          if (c === "validateZodSchema")
            return () => {
              const l = n.getState().getInitialOptions(e)?.validation, r = n.getState().addValidationError;
              if (!l?.zodSchema)
                throw new Error("Zod schema not found");
              if (!l?.key)
                throw new Error("Validation key not found");
              q(l.key);
              const o = n.getState().cogsStateStore[e];
              try {
                const a = n.getState().getValidationErrors(l.key);
                a && a.length > 0 && a.forEach(([w]) => {
                  w && w.startsWith(l.key) && q(w);
                });
                const d = l.zodSchema.safeParse(o);
                return d.success ? !0 : (d.error.errors.forEach((S) => {
                  const h = S.path, E = S.message, $ = [l.key, ...h].join(".");
                  r($, E);
                }), re(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (c === "_componentId") return m;
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
            return v.revertToInitialState;
          if (c === "updateInitialState") return v.updateInitialState;
          if (c === "removeValidation") return v.removeValidation;
        }
        if (c === "getFormRef")
          return () => me.getState().getFormRef(e + "." + t.join("."));
        if (c === "validationWrapper")
          return ({
            children: l,
            hideMessage: r
          }) => /* @__PURE__ */ Se(
            _e,
            {
              formOpts: r ? { validation: { message: "" } } : void 0,
              path: t,
              validationKey: n.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: I?.validIndices,
              children: l
            }
          );
        if (c === "_stateKey") return e;
        if (c === "_path") return t;
        if (c === "_isServerSynced") return v._isServerSynced;
        if (c === "update")
          return (l, r) => {
            if (r?.debounce)
              Ve(() => {
                Y(i, l, t, "");
                const o = n.getState().getNestedState(e, t);
                r?.afterUpdate && r.afterUpdate(o);
              }, r.debounce);
            else {
              Y(i, l, t, "");
              const o = n.getState().getNestedState(e, t);
              r?.afterUpdate && r.afterUpdate(o);
            }
            p(t);
          };
        if (c === "formElement")
          return (l, r) => /* @__PURE__ */ Se(
            be,
            {
              setState: i,
              stateKey: e,
              path: t,
              child: l,
              formOpts: r
            }
          );
        const L = [...t, c], b = n.getState().getNestedState(e, L);
        return s(b, L, I);
      }
    }, R = new Proxy(V, _);
    return f.set(j, {
      proxy: R,
      stateVersion: A
    }), R;
  }
  return s(
    n.getState().getNestedState(e, [])
  );
}
function ce(e) {
  return te(We, { proxy: e });
}
function Me({
  proxy: e,
  rebuildStateShape: i
}) {
  const m = n().getNestedState(e._stateKey, e._path);
  return Array.isArray(m) ? i(
    m,
    e._path
  ).stateMapNoRender(
    (f, A, p, v, s) => e._mapFn(f, A, p, v, s)
  ) : null;
}
function We({
  proxy: e
}) {
  const i = Q(null), m = `${e._stateKey}-${e._path.join(".")}`;
  return de(() => {
    const u = i.current;
    if (!u || !u.parentElement) return;
    const f = u.parentElement, p = Array.from(f.childNodes).indexOf(u);
    let v = f.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, f.setAttribute("data-parent-id", v));
    const y = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: p,
      effect: e._effect
    };
    n.getState().addSignalElement(m, y);
    const t = n.getState().getNestedState(e._stateKey, e._path);
    let I;
    if (e._effect)
      try {
        I = new Function(
          "state",
          `return (${e._effect})(state)`
        )(t);
      } catch (V) {
        console.error("Error evaluating effect function during mount:", V), I = t;
      }
    else
      I = t;
    I !== null && typeof I == "object" && (I = JSON.stringify(I));
    const j = document.createTextNode(String(I));
    u.replaceWith(j);
  }, [e._stateKey, e._path.join("."), e._effect]), te("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function tt(e) {
  const i = Ae(
    (m) => {
      const u = n.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(e._stateKey, {
        forceUpdate: m,
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
