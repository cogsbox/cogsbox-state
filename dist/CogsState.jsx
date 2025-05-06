"use client";
import { jsx as ct } from "react/jsx-runtime";
import { useState as tt, useRef as Z, useEffect as et, useLayoutEffect as vt, useMemo as It, createElement as X, useSyncExternalStore as _t, startTransition as Et } from "react";
import { transformStateFunc as wt, isFunction as L, getNestedValue as U, isDeepEqual as M, debounce as $t } from "./utility.js";
import { pushFunc as Q, updateFn as B, cutFunc as J, ValidationWrapper as At, FormControlComponent as Nt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as lt } from "./store.js";
import { useCogsConfig as Vt } from "./CogsStateClient.jsx";
import nt from "./node_modules/uuid/dist/esm-browser/v4.js";
function dt(t, i) {
  const y = r.getState().getInitialOptions, v = r.getState().setInitialStateOptions, d = y(t) || {};
  v(t, {
    ...d,
    ...i
  });
}
function ut({
  stateKey: t,
  options: i,
  initialOptionsPart: y
}) {
  const v = q(t) || {}, d = y[t] || {}, E = r.getState().setInitialStateOptions, _ = { ...d, ...v };
  let S = !1;
  if (i)
    for (const c in i)
      _.hasOwnProperty(c) ? (c == "localStorage" && i[c] && _[c].key !== i[c]?.key && (S = !0, _[c] = i[c]), c == "initialState" && i[c] && _[c] !== i[c] && (S = !0, _[c] = i[c])) : (S = !0, _[c] = i[c]);
  S && E(t, _);
}
function qt(t, { formElements: i, validation: y }) {
  return { initialState: t, formElements: i, validation: y };
}
const zt = (t, i) => {
  let y = t;
  const [v, d] = wt(y);
  (Object.keys(d).length > 0 || i && Object.keys(i).length > 0) && Object.keys(d).forEach((S) => {
    d[S] = d[S] || {}, d[S].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...d[S].formElements || {}
      // State-specific overrides
    }, q(S) || r.getState().setInitialStateOptions(S, d[S]);
  }), r.getState().setInitialStates(v), r.getState().setCreatedState(v);
  const E = (S, c) => {
    const [f] = tt(c?.componentId ?? nt());
    ut({
      stateKey: S,
      options: c,
      initialOptionsPart: d
    });
    const e = r.getState().cogsStateStore[S] || v[S], m = c?.modifyState ? c.modifyState(e) : e, [k, p] = Ot(
      m,
      {
        stateKey: S,
        syncUpdate: c?.syncUpdate,
        componentId: f,
        localStorage: c?.localStorage,
        middleware: c?.middleware,
        enabledSync: c?.enabledSync,
        reactiveType: c?.reactiveType,
        reactiveDeps: c?.reactiveDeps,
        initialState: c?.initialState,
        dependencies: c?.dependencies
      }
    );
    return p;
  };
  function _(S, c) {
    ut({ stateKey: S, options: c, initialOptionsPart: d }), ot(S);
  }
  return { useCogsState: E, setCogsOptions: _ };
}, {
  setUpdaterState: H,
  setState: D,
  getInitialOptions: q,
  getKeyState: gt,
  getValidationErrors: pt,
  setStateLog: Ct,
  updateInitialStateGlobal: rt,
  addValidationError: Tt,
  removeValidationError: P,
  setServerSyncActions: ht
} = r.getState(), ft = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, kt = (t, i, y, v) => {
  y?.log && console.log(
    "saving to localstorage",
    i,
    y.localStorage?.key,
    v
  );
  const d = L(y?.localStorage?.key) ? y.localStorage?.key(t) : y?.localStorage?.key;
  if (d && v) {
    const E = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, _ = `${v}-${i}-${d}`;
    window.localStorage.setItem(_, JSON.stringify(E));
  }
}, xt = (t, i, y, v, d, E) => {
  const _ = {
    initialState: i,
    updaterState: Y(
      t,
      v,
      d,
      E
    ),
    state: y
  };
  rt(t, _.initialState), H(t, _.updaterState), D(t, _.state);
}, ot = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const y = /* @__PURE__ */ new Set();
  i.components.forEach((v) => {
    y.add(() => v.forceUpdate());
  }), queueMicrotask(() => {
    y.forEach((v) => v());
  });
}, Bt = (t, i) => {
  const y = r.getState().stateComponents.get(t);
  if (y) {
    const v = `${t}////${i}`, d = y.components.get(v);
    if ((d ? Array.isArray(d.reactiveType) ? d.reactiveType : [d.reactiveType || "component"] : null)?.includes("none"))
      return;
    d && d.forceUpdate();
  }
};
function Ot(t, {
  stateKey: i,
  serverSync: y,
  localStorage: v,
  formElements: d,
  middleware: E,
  reactiveDeps: _,
  reactiveType: S,
  componentId: c,
  initialState: f,
  syncUpdate: e,
  dependencies: m
} = {}) {
  const [k, p] = tt({}), { sessionId: x } = Vt();
  let R = !i;
  const [g] = tt(i ?? nt()), s = r.getState().stateLog[g], G = Z(/* @__PURE__ */ new Set()), b = Z(c ?? nt()), T = Z(null);
  T.current = q(g), et(() => {
    if (e && e.stateKey === g && e.path?.[0]) {
      D(g, (o) => ({
        ...o,
        [e.path[0]]: e.newValue
      }));
      const l = `${e.stateKey}:${e.path.join(".")}`;
      r.getState().setSyncInfo(l, {
        timeStamp: e.timeStamp,
        userId: e.userId
      });
    }
  }, [e]), et(() => {
    f && dt(g, {
      initialState: f
    });
    const l = T.current;
    let o = null;
    const u = L(l?.localStorage?.key) ? l?.localStorage?.key(f) : l?.localStorage?.key;
    console.log("newoptions", l), console.log("localkey", u), console.log("initialState", f), u && x && (o = ft(
      x + "-" + g + "-" + u
    ));
    const w = r.getState().iniitialCreatedState[g];
    console.log("createdState - intiual", w, f);
    let N = null;
    if (f) {
      N = f, o && o.lastUpdated > (o.lastSyncedWithServer || 0) && (N = o.state, l?.localStorage?.onChange && l?.localStorage?.onChange(N)), console.log("newState thius is newstate", N), xt(
        g,
        f,
        N,
        n,
        b.current,
        x
      ), ot(g);
      const $ = Array.isArray(S) ? S : [S || "component"];
      console.log("reactiveTypes.............................", $), $.includes("none") || p({});
    }
  }, [f, ...m || []]), vt(() => {
    R && dt(g, {
      serverSync: y,
      formElements: d,
      initialState: f,
      localStorage: v,
      middleware: E
    });
    const l = `${g}////${b.current}`, o = r.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(l, {
      forceUpdate: () => p({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: S ?? ["component", "deps"]
    }), r.getState().stateComponents.set(g, o), p({}), () => {
      const u = `${g}////${b.current}`;
      o && (o.components.delete(u), o.components.size === 0 && r.getState().stateComponents.delete(g));
    };
  }, []);
  const n = (l, o, u, w) => {
    if (Array.isArray(o)) {
      const N = `${g}-${o.join(".")}`;
      G.current.add(N);
    }
    D(g, (N) => {
      const $ = L(l) ? l(N) : l, j = `${g}-${o.join(".")}`;
      if (j) {
        let F = !1, I = r.getState().signalDomElements.get(j);
        if ((!I || I.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const V = o.slice(0, -1), C = U($, V);
          if (Array.isArray(C)) {
            F = !0;
            const A = `${g}-${V.join(".")}`;
            I = r.getState().signalDomElements.get(A);
          }
        }
        if (I) {
          const V = F ? U($, o.slice(0, -1)) : U($, o);
          I.forEach(({ parentId: C, position: A, effect: W }) => {
            const O = document.querySelector(
              `[data-parent-id="${C}"]`
            );
            if (O) {
              const st = Array.from(O.childNodes);
              if (st[A]) {
                const yt = W ? new Function("state", `return (${W})(state)`)(V) : V;
                st[A].textContent = String(yt);
              }
            }
          });
        }
      }
      u.updateType === "update" && (w || T.current?.validationKey) && o && P(
        (w || T.current?.validationKey) + "." + o.join(".")
      );
      const h = o.slice(0, o.length - 1);
      u.updateType === "cut" && T.current?.validationKey && P(
        T.current?.validationKey + "." + h.join(".")
      ), u.updateType === "insert" && T.current?.validationKey && pt(
        T.current?.validationKey + "." + h.join(".")
      ).filter(([I, V]) => {
        let C = I?.split(".").length;
        if (I == h.join(".") && C == h.length - 1) {
          let A = I + "." + h;
          P(I), Tt(A, V);
        }
      });
      const z = U(N, o), St = U($, o), mt = u.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), at = r.getState().stateComponents.get(g);
      if (at)
        for (const [F, I] of at.components.entries()) {
          let V = !1;
          const C = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (!C.includes("none")) {
            if (C.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if (C.includes("component") && I.paths && (I.paths.has(mt) || I.paths.has("")) && (V = !0), !V && C.includes("deps") && I.depsFunction) {
              const A = I.depsFunction($);
              typeof A == "boolean" ? A && (V = !0) : M(I.deps, A) || (I.deps = A, V = !0);
            }
            V && I.forceUpdate();
          }
        }
      const it = {
        timeStamp: Date.now(),
        stateKey: g,
        path: o,
        updateType: u.updateType,
        status: "new",
        oldValue: z,
        newValue: St
      };
      if (Ct(g, (F) => {
        const V = [...F ?? [], it].reduce((C, A) => {
          const W = `${A.stateKey}:${JSON.stringify(A.path)}`, O = C.get(W);
          return O ? (O.timeStamp = Math.max(O.timeStamp, A.timeStamp), O.newValue = A.newValue, O.oldValue = O.oldValue ?? A.oldValue, O.updateType = A.updateType) : C.set(W, { ...A }), C;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), kt(
        $,
        g,
        T.current,
        x
      ), E && E({
        updateLog: s,
        update: it
      }), T.current?.serverSync) {
        const F = r.getState().serverState[g], I = T.current?.serverSync;
        ht(g, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: $ }),
          rollBackState: F,
          actionTimeStamp: Date.now() + (I.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return $;
    });
  };
  r.getState().updaterState[g] || (H(
    g,
    Y(
      g,
      n,
      b.current,
      x
    )
  ), r.getState().cogsStateStore[g] || D(g, t), r.getState().initialStateGlobal[g] || rt(g, t));
  const a = It(() => Y(
    g,
    n,
    b.current,
    x
  ), [g]);
  return [gt(g), a];
}
function Y(t, i, y, v) {
  const d = /* @__PURE__ */ new Map();
  let E = 0;
  const _ = (f) => {
    const e = f.join(".");
    for (const [m] of d)
      (m === e || m.startsWith(e + ".")) && d.delete(m);
    E++;
  }, S = {
    removeValidation: (f) => {
      f?.validationKey && P(f.validationKey);
    },
    revertToInitialState: (f) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && P(e?.key), f?.validationKey && P(f.validationKey);
      const m = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), d.clear(), E++;
      const k = c(m, []), p = q(t), x = L(p?.localStorage?.key) ? p?.localStorage?.key(m) : p?.localStorage?.key, R = `${v}-${t}-${x}`;
      R && localStorage.removeItem(R), H(t, k), D(t, m);
      const g = r.getState().stateComponents.get(t);
      return g && g.components.forEach((s) => {
        s.forceUpdate();
      }), m;
    },
    updateInitialState: (f) => {
      d.clear(), E++;
      const e = Y(
        t,
        i,
        y,
        v
      );
      return Et(() => {
        rt(t, f), H(t, e), D(t, f);
        const m = r.getState().stateComponents.get(t);
        m && m.components.forEach((k) => {
          k.forceUpdate();
        });
      }), {
        fetchId: (m) => e.get()[m]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const f = r.getState().serverState[t];
      return !!(f && M(f, gt(t)));
    }
  };
  function c(f, e = [], m) {
    const k = e.map(String).join(".");
    d.get(k);
    const p = function() {
      return r().getNestedState(t, e);
    };
    Object.keys(S).forEach((g) => {
      p[g] = S[g];
    });
    const x = {
      apply(g, s, G) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${e.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, e);
      },
      get(g, s) {
        if (s !== "then" && !s.startsWith("$") && s !== "stateMapNoRender") {
          const n = e.join("."), a = `${t}////${y}`, l = r.getState().stateComponents.get(t);
          if (l) {
            const o = l.components.get(a);
            o && (e.length > 0 || s === "get") && o.paths.add(n);
          }
        }
        if (s === "_status") {
          const n = r.getState().getNestedState(t, e), a = r.getState().initialStateGlobal[t], l = U(a, e);
          return M(n, l) ? "fresh" : "stale";
        }
        if (s === "getStatus")
          return function() {
            const n = r().getNestedState(
              t,
              e
            ), a = r.getState().initialStateGlobal[t], l = U(a, e);
            return M(n, l) ? "fresh" : "stale";
          };
        if (s === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[t], a = q(t), l = L(a?.localStorage?.key) ? a?.localStorage?.key(n) : a?.localStorage?.key, o = `${v}-${t}-${l}`;
            console.log("removing storage", o), o && localStorage.removeItem(o);
          };
        if (s === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(t)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(n.key + "." + e.join("."));
          };
        if (Array.isArray(f)) {
          if (s === "getSelected")
            return () => {
              const n = r.getState().getSelectedIndex(t, e.join("."));
              if (n !== void 0)
                return c(
                  f[n],
                  [...e, n.toString()],
                  m
                );
            };
          if (s === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(t, e.join(".")) ?? -1;
          if (s === "stateSort")
            return (n) => {
              const o = [...r.getState().getNestedState(t, e).map((u, w) => ({
                ...u,
                __origIndex: w.toString()
              }))].sort(n);
              return d.clear(), E++, c(o, e, {
                filtered: [...m?.filtered || [], e],
                validIndices: o.map(
                  (u) => parseInt(u.__origIndex)
                )
              });
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const a = m?.filtered?.some(
                (o) => o.join(".") === e.join(".")
              ), l = a ? f : r.getState().getNestedState(t, e);
              return s !== "stateMapNoRender" && (d.clear(), E++), l.map((o, u) => {
                const w = a && o.__origIndex ? o.__origIndex : u, N = c(
                  o,
                  [...e, w.toString()],
                  m
                );
                return n(
                  o,
                  N,
                  u,
                  f,
                  c(f, e, m)
                );
              });
            };
          if (s === "$stateMap")
            return (n) => X(jt, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: c
            });
          if (s === "stateFlattenOn")
            return (n) => {
              const l = m?.filtered?.some(
                (u) => u.join(".") === e.join(".")
              ) ? f : r.getState().getNestedState(t, e);
              d.clear(), E++;
              const o = l.flatMap(
                (u, w) => u[n] ?? []
              );
              return c(
                o,
                [...e, "[*]", n],
                m
              );
            };
          if (s === "findWith")
            return (n, a) => {
              const l = f.findIndex(
                (w) => w[n] === a
              );
              if (l === -1) return;
              const o = f[l], u = [...e, l.toString()];
              return d.clear(), E++, d.clear(), E++, c(o, u);
            };
          if (s === "index")
            return (n) => {
              const a = f[n];
              return c(a, [...e, n.toString()]);
            };
          if (s === "insert")
            return (n) => (_(e), Q(i, n, e, t), c(
              r.getState().cogsStateStore[t],
              []
            ));
          if (s === "uniqueInsert")
            return (n, a, l) => {
              const o = r.getState().getNestedState(t, e), u = L(n) ? n(o) : n;
              let w = null;
              if (!o.some(($) => {
                if (a) {
                  const h = a.every(
                    (z) => M($[z], u[z])
                  );
                  return h && (w = $), h;
                }
                const j = M($, u);
                return j && (w = $), j;
              }))
                _(e), Q(i, u, e, t);
              else if (l && w) {
                const $ = l(w), j = o.map(
                  (h) => M(h, w) ? $ : h
                );
                _(e), B(i, j, e);
              }
            };
          if (s === "cut")
            return (n, a) => {
              a?.waitForSync || (_(e), J(i, e, t, n));
            };
          if (s === "cutByValue")
            return (n) => {
              for (let a = 0; a < f.length; a++)
                f[a] === n && J(i, e, t, a);
            };
          if (s === "toggleByValue")
            return (n) => {
              const a = f.findIndex((l) => l === n);
              a > -1 ? J(i, e, t, a) : Q(i, n, e, t);
            };
          if (s === "stateFilter")
            return (n) => {
              const a = f.map((u, w) => ({
                ...u,
                __origIndex: w.toString()
              })), l = [], o = [];
              for (let u = 0; u < a.length; u++)
                n(a[u], u) && (l.push(u), o.push(a[u]));
              return d.clear(), E++, c(o, e, {
                filtered: [...m?.filtered || [], e],
                validIndices: l
                // Always pass validIndices, even if empty
              });
            };
        }
        const G = e[e.length - 1];
        if (!isNaN(Number(G))) {
          const n = e.slice(0, -1), a = r.getState().getNestedState(t, n);
          if (Array.isArray(a) && s === "cut")
            return () => J(
              i,
              n,
              t,
              Number(G)
            );
        }
        if (s === "get")
          return () => r.getState().getNestedState(t, e);
        if (s === "$derive")
          return (n) => K({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (s === "$derive")
          return (n) => K({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (s === "$get")
          return () => K({
            _stateKey: t,
            _path: e
          });
        if (s === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (s == "getLocalStorage")
          return (n) => ft(v + "-" + t + "-" + n);
        if (s === "_selected") {
          const n = e.slice(0, -1), a = n.join("."), l = r.getState().getNestedState(t, n);
          return Array.isArray(l) ? Number(e[e.length - 1]) === r.getState().getSelectedIndex(t, a) : void 0;
        }
        if (s === "setSelected")
          return (n) => {
            const a = e.slice(0, -1), l = Number(e[e.length - 1]), o = a.join(".");
            n ? r.getState().setSelectedIndex(t, o, l) : r.getState().setSelectedIndex(t, o, void 0);
            const u = r.getState().getNestedState(t, [...a]);
            B(i, u, a), _(a);
          };
        if (e.length == 0) {
          if (s === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(t)?.validation, a = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              P(n.key);
              const l = r.getState().cogsStateStore[t];
              try {
                const o = r.getState().getValidationErrors(n.key);
                o && o.length > 0 && o.forEach(([w]) => {
                  w && w.startsWith(n.key) && P(w);
                });
                const u = n.zodSchema.safeParse(l);
                return u.success ? !0 : (u.error.errors.forEach((N) => {
                  const $ = N.path, j = N.message, h = [n.key, ...$].join(".");
                  a(h, j);
                }), ot(t), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (s === "_componentId") return y;
          if (s === "getComponents")
            return () => r().stateComponents.get(t);
          if (s === "getAllFormRefs")
            return () => lt.getState().getFormRefsByStateKey(t);
          if (s === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (s === "_serverState")
            return r.getState().serverState[t];
          if (s === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (s === "revertToInitialState")
            return S.revertToInitialState;
          if (s === "updateInitialState") return S.updateInitialState;
          if (s === "removeValidation") return S.removeValidation;
        }
        if (s === "getFormRef")
          return () => lt.getState().getFormRef(t + "." + e.join("."));
        if (s === "validationWrapper")
          return ({
            children: n,
            hideMessage: a
          }) => /* @__PURE__ */ ct(
            At,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: m?.validIndices,
              children: n
            }
          );
        if (s === "_stateKey") return t;
        if (s === "_path") return e;
        if (s === "_isServerSynced") return S._isServerSynced;
        if (s === "update")
          return (n, a) => {
            if (a?.debounce)
              $t(() => {
                B(i, n, e, "");
                const l = r.getState().getNestedState(t, e);
                a?.afterUpdate && a.afterUpdate(l);
              }, a.debounce);
            else {
              B(i, n, e, "");
              const l = r.getState().getNestedState(t, e);
              a?.afterUpdate && a.afterUpdate(l);
            }
            _(e);
          };
        if (s === "formElement")
          return (n, a) => /* @__PURE__ */ ct(
            Nt,
            {
              setState: i,
              stateKey: t,
              path: e,
              child: n,
              formOpts: a
            }
          );
        const b = [...e, s], T = r.getState().getNestedState(t, b);
        return c(T, b, m);
      }
    }, R = new Proxy(p, x);
    return d.set(k, {
      proxy: R,
      stateVersion: E
    }), R;
  }
  return c(
    r.getState().getNestedState(t, [])
  );
}
function K(t) {
  return X(bt, { proxy: t });
}
function jt({
  proxy: t,
  rebuildStateShape: i
}) {
  const y = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(y) ? i(
    y,
    t._path
  ).stateMapNoRender(
    (d, E, _, S, c) => t._mapFn(d, E, _, S, c)
  ) : null;
}
function bt({
  proxy: t
}) {
  const i = Z(null), y = `${t._stateKey}-${t._path.join(".")}`;
  return et(() => {
    const v = i.current;
    if (!v || !v.parentElement) return;
    const d = v.parentElement, _ = Array.from(d.childNodes).indexOf(v);
    let S = d.getAttribute("data-parent-id");
    S || (S = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", S));
    const f = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: S,
      position: _,
      effect: t._effect
    };
    r.getState().addSignalElement(y, f);
    const e = r.getState().getNestedState(t._stateKey, t._path);
    let m;
    if (t._effect)
      try {
        m = new Function(
          "state",
          `return (${t._effect})(state)`
        )(e);
      } catch (p) {
        console.error("Error evaluating effect function during mount:", p), m = e;
      }
    else
      m = e;
    m !== null && typeof m == "object" && (m = JSON.stringify(m));
    const k = document.createTextNode(String(m));
    v.replaceWith(k);
  }, [t._stateKey, t._path.join("."), t._effect]), X("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": y
  });
}
function Jt(t) {
  const i = _t(
    (y) => {
      const v = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return v.components.set(t._stateKey, {
        forceUpdate: y,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => v.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return X("text", {}, String(i));
}
export {
  K as $cogsSignal,
  Jt as $cogsSignalStore,
  qt as addStateOptions,
  zt as createCogsState,
  Bt as notifyComponent,
  Ot as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
