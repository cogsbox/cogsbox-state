"use client";
import { jsx as lt } from "react/jsx-runtime";
import { useState as et, useRef as Z, useEffect as nt, useLayoutEffect as _t, useMemo as Et, createElement as Q, useSyncExternalStore as $t, startTransition as H } from "react";
import { transformStateFunc as wt, isFunction as L, getNestedValue as U, isDeepEqual as M, debounce as Nt } from "./utility.js";
import { pushFunc as K, updateFn as B, cutFunc as J, ValidationWrapper as Vt, FormControlComponent as At } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as dt } from "./store.js";
import { useCogsConfig as ht } from "./CogsStateClient.jsx";
import rt from "./node_modules/uuid/dist/esm-browser/v4.js";
function ut(t, i) {
  const m = r.getState().getInitialOptions, y = r.getState().setInitialStateOptions, g = m(t) || {};
  y(t, {
    ...g,
    ...i
  });
}
function gt({
  stateKey: t,
  options: i,
  initialOptionsPart: m
}) {
  const y = q(t) || {}, g = m[t] || {}, E = r.getState().setInitialStateOptions, _ = { ...g, ...y };
  let v = !1;
  if (i)
    for (const l in i)
      _.hasOwnProperty(l) ? l == "localStorage" && i[l] && _[l].key !== i[l]?.key && (v = !0, _[l] = i[l]) : (v = !0, _[l] = i[l]);
  v && E(t, _);
}
function qt(t, { formElements: i, validation: m }) {
  return { initialState: t, formElements: i, validation: m };
}
const zt = (t, i) => {
  let m = t;
  const [y, g] = wt(m);
  (Object.keys(g).length > 0 || i && Object.keys(i).length > 0) && Object.keys(g).forEach((v) => {
    g[v] = g[v] || {}, g[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...g[v].formElements || {}
      // State-specific overrides
    }, q(v) || r.getState().setInitialStateOptions(v, g[v]);
  }), r.getState().setInitialStates(y);
  const E = (v, l) => {
    const [f] = et(l?.componentId ?? rt());
    gt({
      stateKey: v,
      options: l,
      initialOptionsPart: g
    });
    const e = r.getState().cogsStateStore[v] || y[v], S = l?.modifyState ? l.modifyState(e) : e, [T, h] = Ot(
      S,
      {
        stateKey: v,
        syncUpdate: l?.syncUpdate,
        componentId: f,
        localStorage: l?.localStorage,
        middleware: l?.middleware,
        enabledSync: l?.enabledSync,
        reactiveType: l?.reactiveType,
        reactiveDeps: l?.reactiveDeps,
        initialState: l?.initialState,
        dependencies: l?.dependencies
      }
    );
    return h;
  };
  function _(v, l) {
    gt({ stateKey: v, options: l, initialOptionsPart: g });
  }
  return { useCogsState: E, setCogsOptions: _ };
}, {
  setUpdaterState: Y,
  setState: D,
  getInitialOptions: q,
  getKeyState: St,
  getValidationErrors: Ct,
  setStateLog: pt,
  updateInitialStateGlobal: at,
  addValidationError: kt,
  removeValidationError: P,
  setServerSyncActions: xt
} = r.getState(), mt = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Tt = (t, i, m, y) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    y
  );
  const g = L(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (g && y) {
    const E = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, _ = `${y}-${i}-${g}`;
    window.localStorage.setItem(_, JSON.stringify(E));
  }
}, ft = (t, i, m, y, g, E) => {
  const _ = {
    initialState: i,
    updaterState: X(
      t,
      y,
      g,
      E
    ),
    state: m
  };
  H(() => {
    at(t, _.initialState), Y(t, _.updaterState), D(t, _.state);
  });
}, ot = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((y) => {
    m.add(() => y.forceUpdate());
  }), queueMicrotask(() => {
    H(() => {
      m.forEach((y) => y());
    });
  });
}, Bt = (t, i) => {
  const m = r.getState().stateComponents.get(t);
  if (m) {
    const y = `${t}////${i}`, g = m.components.get(y);
    g && g.forceUpdate();
  }
};
function Ot(t, {
  stateKey: i,
  serverSync: m,
  localStorage: y,
  formElements: g,
  middleware: E,
  reactiveDeps: _,
  reactiveType: v,
  componentId: l,
  initialState: f,
  syncUpdate: e,
  dependencies: S
} = {}) {
  const [T, h] = et({}), { sessionId: x } = ht();
  let R = !i;
  const [d] = et(i ?? rt()), s = r.getState().stateLog[d], G = Z(/* @__PURE__ */ new Set()), j = Z(l ?? rt()), p = Z(null);
  p.current = q(d), nt(() => {
    if (e && e.stateKey === d && e.path?.[0]) {
      D(d, (o) => ({
        ...o,
        [e.path[0]]: e.newValue
      }));
      const c = `${e.stateKey}:${e.path.join(".")}`;
      r.getState().setSyncInfo(c, {
        timeStamp: e.timeStamp,
        userId: e.userId
      });
    }
  }, [e]), nt(() => {
    ut(d, {
      initialState: f
    });
    let c = null;
    f && (c = f), c && (console.log("newState thius is newstate", c), ft(
      d,
      f,
      c,
      n,
      j.current,
      x
    ), ot(d), h({}));
  }, [f, ...S || []]), _t(() => {
    R && ut(d, {
      serverSync: m,
      formElements: g,
      initialState: f,
      localStorage: y,
      middleware: E
    });
    const c = `${d}////${j.current}`, o = r.getState().stateComponents.get(d) || {
      components: /* @__PURE__ */ new Map()
    };
    o.components.set(c, {
      forceUpdate: () => h({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: v ?? ["component", "deps"]
    }), r.getState().stateComponents.set(d, o);
    const u = p.current, $ = L(u?.localStorage?.key) ? u?.localStorage?.key(f) : u?.localStorage?.key;
    if ($ && x) {
      let w = mt(
        x + "-" + d + "-" + $
      );
      w && w.lastUpdated && w.lastUpdated > (w.lastSyncedWithServer || 0) && (ft(
        d,
        f,
        w.state,
        n,
        j.current,
        x
      ), u?.localStorage?.onChange && u?.localStorage?.onChange(w.state), ot(d));
    }
    return h({}), () => {
      const w = `${d}////${j.current}`;
      o && (o.components.delete(w), o.components.size === 0 && r.getState().stateComponents.delete(d));
    };
  }, []);
  const n = (c, o, u, $) => {
    if (Array.isArray(o)) {
      const w = `${d}-${o.join(".")}`;
      G.current.add(w);
    }
    D(d, (w) => {
      const V = L(c) ? c(w) : c, b = `${d}-${o.join(".")}`;
      if (b) {
        let F = !1, I = r.getState().signalDomElements.get(b);
        if ((!I || I.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const A = o.slice(0, -1), C = U(V, A);
          if (Array.isArray(C)) {
            F = !0;
            const N = `${d}-${A.join(".")}`;
            I = r.getState().signalDomElements.get(N);
          }
        }
        if (I) {
          const A = F ? U(V, o.slice(0, -1)) : U(V, o);
          I.forEach(({ parentId: C, position: N, effect: W }) => {
            const O = document.querySelector(
              `[data-parent-id="${C}"]`
            );
            if (O) {
              const ct = Array.from(O.childNodes);
              if (ct[N]) {
                const It = W ? new Function("state", `return (${W})(state)`)(A) : A;
                ct[N].textContent = String(It);
              }
            }
          });
        }
      }
      u.updateType === "update" && ($ || p.current?.validationKey) && o && P(
        ($ || p.current?.validationKey) + "." + o.join(".")
      );
      const k = o.slice(0, o.length - 1);
      u.updateType === "cut" && p.current?.validationKey && P(
        p.current?.validationKey + "." + k.join(".")
      ), u.updateType === "insert" && p.current?.validationKey && Ct(
        p.current?.validationKey + "." + k.join(".")
      ).filter(([I, A]) => {
        let C = I?.split(".").length;
        if (I == k.join(".") && C == k.length - 1) {
          let N = I + "." + k;
          P(I), kt(N, A);
        }
      });
      const z = U(w, o), yt = U(V, o), vt = u.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), it = r.getState().stateComponents.get(d);
      if (it)
        for (const [F, I] of it.components.entries()) {
          let A = !1;
          const C = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (!C.includes("none")) {
            if (C.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if (C.includes("component") && I.paths && (I.paths.has(vt) || I.paths.has("")) && (A = !0), !A && C.includes("deps") && I.depsFunction) {
              const N = I.depsFunction(V);
              typeof N == "boolean" ? N && (A = !0) : M(I.deps, N) || (I.deps = N, A = !0);
            }
            A && I.forceUpdate();
          }
        }
      const st = {
        timeStamp: Date.now(),
        stateKey: d,
        path: o,
        updateType: u.updateType,
        status: "new",
        oldValue: z,
        newValue: yt
      };
      if (pt(d, (F) => {
        const A = [...F ?? [], st].reduce((C, N) => {
          const W = `${N.stateKey}:${JSON.stringify(N.path)}`, O = C.get(W);
          return O ? (O.timeStamp = Math.max(O.timeStamp, N.timeStamp), O.newValue = N.newValue, O.oldValue = O.oldValue ?? N.oldValue, O.updateType = N.updateType) : C.set(W, { ...N }), C;
        }, /* @__PURE__ */ new Map());
        return Array.from(A.values());
      }), Tt(
        V,
        d,
        p.current,
        x
      ), E && E({
        updateLog: s,
        update: st
      }), p.current?.serverSync) {
        const F = r.getState().serverState[d], I = p.current?.serverSync;
        xt(d, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: V }),
          rollBackState: F,
          actionTimeStamp: Date.now() + (I.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return V;
    });
  };
  r.getState().updaterState[d] || (Y(
    d,
    X(
      d,
      n,
      j.current,
      x
    )
  ), r.getState().cogsStateStore[d] || D(d, t), r.getState().initialStateGlobal[d] || at(d, t));
  const a = Et(() => X(
    d,
    n,
    j.current,
    x
  ), [d]);
  return [St(d), a];
}
function X(t, i, m, y) {
  const g = /* @__PURE__ */ new Map();
  let E = 0;
  const _ = (f) => {
    const e = f.join(".");
    for (const [S] of g)
      (S === e || S.startsWith(e + ".")) && g.delete(S);
    E++;
  }, v = {
    removeValidation: (f) => {
      f?.validationKey && P(f.validationKey);
    },
    revertToInitialState: (f) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && P(e?.key), f?.validationKey && P(f.validationKey);
      const S = r.getState().initialStateGlobal[t];
      g.clear(), E++;
      const T = l(S, []), h = q(t), x = L(h?.localStorage?.key) ? h?.localStorage?.key(S) : h?.localStorage?.key, R = `${y}-${t}-${x}`;
      return R && localStorage.removeItem(R), H(() => {
        Y(t, T), D(t, S);
        const d = r.getState().stateComponents.get(t);
        d && d.components.forEach((s) => {
          s.forceUpdate();
        });
      }), S;
    },
    updateInitialState: (f) => {
      g.clear(), E++;
      const e = X(
        t,
        i,
        m,
        y
      );
      return H(() => {
        at(t, f), Y(t, e), D(t, f);
        const S = r.getState().stateComponents.get(t);
        S && S.components.forEach((T) => {
          T.forceUpdate();
        });
      }), {
        fetchId: (S) => e.get()[S]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const f = r.getState().serverState[t];
      return !!(f && M(f, St(t)));
    }
  };
  function l(f, e = [], S) {
    const T = e.map(String).join(".");
    g.get(T);
    const h = function() {
      return r().getNestedState(t, e);
    };
    Object.keys(v).forEach((d) => {
      h[d] = v[d];
    });
    const x = {
      apply(d, s, G) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${e.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, e);
      },
      get(d, s) {
        if (s !== "then" && !s.startsWith("$") && s !== "stateMapNoRender") {
          const n = e.join("."), a = `${t}////${m}`, c = r.getState().stateComponents.get(t);
          if (c) {
            const o = c.components.get(a);
            o && (e.length > 0 || s === "get") && o.paths.add(n);
          }
        }
        if (s === "_status") {
          const n = r.getState().getNestedState(t, e), a = r.getState().initialStateGlobal[t], c = U(a, e);
          return M(n, c) ? "fresh" : "stale";
        }
        if (s === "getStatus")
          return function() {
            const n = r().getNestedState(
              t,
              e
            ), a = r.getState().initialStateGlobal[t], c = U(a, e);
            return M(n, c) ? "fresh" : "stale";
          };
        if (s === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[t], a = q(t), c = L(a?.localStorage?.key) ? a?.localStorage?.key(n) : a?.localStorage?.key, o = `${y}-${t}-${c}`;
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
                return l(
                  f[n],
                  [...e, n.toString()],
                  S
                );
            };
          if (s === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(t, e.join(".")) ?? -1;
          if (s === "stateSort")
            return (n) => {
              const o = [...r.getState().getNestedState(t, e).map((u, $) => ({
                ...u,
                __origIndex: $.toString()
              }))].sort(n);
              return g.clear(), E++, l(o, e, {
                filtered: [...S?.filtered || [], e],
                validIndices: o.map(
                  (u) => parseInt(u.__origIndex)
                )
              });
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const a = S?.filtered?.some(
                (o) => o.join(".") === e.join(".")
              ), c = a ? f : r.getState().getNestedState(t, e);
              return s !== "stateMapNoRender" && (g.clear(), E++), c.map((o, u) => {
                const $ = a && o.__origIndex ? o.__origIndex : u, w = l(
                  o,
                  [...e, $.toString()],
                  S
                );
                return n(
                  o,
                  w,
                  u,
                  f,
                  l(f, e, S)
                );
              });
            };
          if (s === "$stateMap")
            return (n) => Q(jt, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: l
            });
          if (s === "stateFlattenOn")
            return (n) => {
              const c = S?.filtered?.some(
                (u) => u.join(".") === e.join(".")
              ) ? f : r.getState().getNestedState(t, e);
              g.clear(), E++;
              const o = c.flatMap(
                (u, $) => u[n] ?? []
              );
              return l(
                o,
                [...e, "[*]", n],
                S
              );
            };
          if (s === "findWith")
            return (n, a) => {
              const c = f.findIndex(
                ($) => $[n] === a
              );
              if (c === -1) return;
              const o = f[c], u = [...e, c.toString()];
              return g.clear(), E++, g.clear(), E++, l(o, u);
            };
          if (s === "index")
            return (n) => {
              const a = f[n];
              return l(a, [...e, n.toString()]);
            };
          if (s === "insert")
            return (n) => (_(e), K(i, n, e, t), l(
              r.getState().cogsStateStore[t],
              []
            ));
          if (s === "uniqueInsert")
            return (n, a, c) => {
              const o = r.getState().getNestedState(t, e), u = L(n) ? n(o) : n;
              let $ = null;
              if (!o.some((V) => {
                if (a) {
                  const k = a.every(
                    (z) => M(V[z], u[z])
                  );
                  return k && ($ = V), k;
                }
                const b = M(V, u);
                return b && ($ = V), b;
              }))
                _(e), K(i, u, e, t);
              else if (c && $) {
                const V = c($), b = o.map(
                  (k) => M(k, $) ? V : k
                );
                _(e), B(i, b, e);
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
              const a = f.findIndex((c) => c === n);
              a > -1 ? J(i, e, t, a) : K(i, n, e, t);
            };
          if (s === "stateFilter")
            return (n) => {
              const a = f.map((u, $) => ({
                ...u,
                __origIndex: $.toString()
              })), c = [], o = [];
              for (let u = 0; u < a.length; u++)
                n(a[u], u) && (c.push(u), o.push(a[u]));
              return g.clear(), E++, l(o, e, {
                filtered: [...S?.filtered || [], e],
                validIndices: c
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
          return (n) => tt({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (s === "$derive")
          return (n) => tt({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (s === "$get")
          return () => tt({
            _stateKey: t,
            _path: e
          });
        if (s === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (s == "getLocalStorage")
          return (n) => mt(y + "-" + t + "-" + n);
        if (s === "_selected") {
          const n = e.slice(0, -1), a = n.join("."), c = r.getState().getNestedState(t, n);
          return Array.isArray(c) ? Number(e[e.length - 1]) === r.getState().getSelectedIndex(t, a) : void 0;
        }
        if (s === "setSelected")
          return (n) => {
            const a = e.slice(0, -1), c = Number(e[e.length - 1]), o = a.join(".");
            n ? r.getState().setSelectedIndex(t, o, c) : r.getState().setSelectedIndex(t, o, void 0);
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
              const c = r.getState().cogsStateStore[t];
              try {
                const o = r.getState().getValidationErrors(n.key);
                o && o.length > 0 && o.forEach(([$]) => {
                  $ && $.startsWith(n.key) && P($);
                });
                const u = n.zodSchema.safeParse(c);
                return u.success ? !0 : (u.error.errors.forEach((w) => {
                  const V = w.path, b = w.message, k = [n.key, ...V].join(".");
                  a(k, b);
                }), ot(t), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (s === "_componentId") return m;
          if (s === "getComponents")
            return () => r().stateComponents.get(t);
          if (s === "getAllFormRefs")
            return () => dt.getState().getFormRefsByStateKey(t);
          if (s === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (s === "_serverState")
            return r.getState().serverState[t];
          if (s === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (s === "revertToInitialState")
            return v.revertToInitialState;
          if (s === "updateInitialState") return v.updateInitialState;
          if (s === "removeValidation") return v.removeValidation;
        }
        if (s === "getFormRef")
          return () => dt.getState().getFormRef(t + "." + e.join("."));
        if (s === "validationWrapper")
          return ({
            children: n,
            hideMessage: a
          }) => /* @__PURE__ */ lt(
            Vt,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: S?.validIndices,
              children: n
            }
          );
        if (s === "_stateKey") return t;
        if (s === "_path") return e;
        if (s === "_isServerSynced") return v._isServerSynced;
        if (s === "update")
          return (n, a) => {
            if (a?.debounce)
              Nt(() => {
                B(i, n, e, "");
                const c = r.getState().getNestedState(t, e);
                a?.afterUpdate && a.afterUpdate(c);
              }, a.debounce);
            else {
              B(i, n, e, "");
              const c = r.getState().getNestedState(t, e);
              a?.afterUpdate && a.afterUpdate(c);
            }
            _(e);
          };
        if (s === "formElement")
          return (n, a) => /* @__PURE__ */ lt(
            At,
            {
              setState: i,
              stateKey: t,
              path: e,
              child: n,
              formOpts: a
            }
          );
        const j = [...e, s], p = r.getState().getNestedState(t, j);
        return l(p, j, S);
      }
    }, R = new Proxy(h, x);
    return g.set(T, {
      proxy: R,
      stateVersion: E
    }), R;
  }
  return l(
    r.getState().getNestedState(t, [])
  );
}
function tt(t) {
  return Q(bt, { proxy: t });
}
function jt({
  proxy: t,
  rebuildStateShape: i
}) {
  const m = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? i(
    m,
    t._path
  ).stateMapNoRender(
    (g, E, _, v, l) => t._mapFn(g, E, _, v, l)
  ) : null;
}
function bt({
  proxy: t
}) {
  const i = Z(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return nt(() => {
    const y = i.current;
    if (!y || !y.parentElement) return;
    const g = y.parentElement, _ = Array.from(g.childNodes).indexOf(y);
    let v = g.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, g.setAttribute("data-parent-id", v));
    const f = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: _,
      effect: t._effect
    };
    r.getState().addSignalElement(m, f);
    const e = r.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(e);
      } catch (h) {
        console.error("Error evaluating effect function during mount:", h), S = e;
      }
    else
      S = e;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const T = document.createTextNode(String(S));
    y.replaceWith(T);
  }, [t._stateKey, t._path.join("."), t._effect]), Q("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function Jt(t) {
  const i = $t(
    (m) => {
      const y = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return y.components.set(t._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => y.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return Q("text", {}, String(i));
}
export {
  tt as $cogsSignal,
  Jt as $cogsSignalStore,
  qt as addStateOptions,
  zt as createCogsState,
  Bt as notifyComponent,
  Ot as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
