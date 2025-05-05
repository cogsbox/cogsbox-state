"use client";
import { jsx as dt } from "react/jsx-runtime";
import { useState as et, useRef as Z, useEffect as nt, useLayoutEffect as vt, useMemo as _t, createElement as Q, useSyncExternalStore as Et, startTransition as H } from "react";
import { transformStateFunc as $t, isFunction as D, isDeepEqual as O, getNestedValue as M, debounce as wt } from "./utility.js";
import { pushFunc as K, updateFn as B, cutFunc as J, ValidationWrapper as Nt, FormControlComponent as Vt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as ut } from "./store.js";
import { useCogsConfig as At } from "./CogsStateClient.jsx";
import rt from "./node_modules/uuid/dist/esm-browser/v4.js";
function ht(t, s) {
  const y = r.getState().getInitialOptions, I = r.getState().setInitialStateOptions, g = y(t) || {};
  I(t, {
    ...g,
    ...s
  });
}
function gt({
  stateKey: t,
  options: s,
  initialOptionsPart: y
}) {
  const I = q(t) || {}, g = y[t] || {}, E = r.getState().setInitialStateOptions, _ = { ...g, ...I };
  let f = !1;
  if (s)
    for (const l in s)
      _.hasOwnProperty(l) ? l == "localStorage" && s[l] && _[l].key !== s[l]?.key && (f = !0, _[l] = s[l]) : (f = !0, _[l] = s[l]);
  f && E(t, _);
}
function qt(t, { formElements: s, validation: y }) {
  return { initialState: t, formElements: s, validation: y };
}
const zt = (t, s) => {
  let y = t;
  const [I, g] = $t(y);
  (Object.keys(g).length > 0 || s && Object.keys(s).length > 0) && Object.keys(g).forEach((f) => {
    g[f] = g[f] || {}, g[f].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...g[f].formElements || {}
      // State-specific overrides
    }, q(f) || r.getState().setInitialStateOptions(f, g[f]);
  }), r.getState().setInitialStates(I);
  const E = (f, l) => {
    const [m] = et(l?.componentId ?? rt());
    gt({
      stateKey: f,
      options: l,
      initialOptionsPart: g
    });
    const e = r.getState().cogsStateStore[f] || I[f], S = l?.modifyState ? l.modifyState(e) : e, [k, C] = kt(
      S,
      {
        stateKey: f,
        syncUpdate: l?.syncUpdate,
        componentId: m,
        localStorage: l?.localStorage,
        middleware: l?.middleware,
        enabledSync: l?.enabledSync,
        reactiveType: l?.reactiveType,
        reactiveDeps: l?.reactiveDeps,
        initialState: l?.initialState,
        dependencies: l?.dependencies
      }
    );
    return C;
  };
  function _(f, l) {
    gt({ stateKey: f, options: l, initialOptionsPart: g });
  }
  return { useCogsState: E, setCogsOptions: _ };
}, {
  setUpdaterState: Y,
  setState: G,
  getInitialOptions: q,
  getKeyState: ot,
  getValidationErrors: Ct,
  setStateLog: pt,
  updateInitialStateGlobal: at,
  addValidationError: xt,
  removeValidationError: R,
  setServerSyncActions: Tt
} = r.getState(), it = (t) => {
  if (!t) return null;
  try {
    const s = window.localStorage.getItem(t);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, ft = (t, s, y, I, g) => {
  const E = D(y?.localStorage?.key) ? y.localStorage?.key(t) : y?.localStorage?.key;
  if (!E || !I)
    return;
  const _ = `${I}-${s}-${E}`;
  try {
    let f;
    if (g !== void 0)
      f = {
        state: t,
        baseServerState: g,
        // Use provided base
        lastUpdated: Date.now()
      };
    else {
      const l = it(_);
      f = {
        state: t,
        // !!! --- REMOVED '?? null' --- !!!
        baseServerState: l?.baseServerState,
        // Preserve existing base (will be T | null | undefined)
        lastUpdated: Date.now()
      };
    }
    window.localStorage.setItem(_, JSON.stringify(f));
  } catch (f) {
    console.error("Error saving to localStorage:", _, f);
  }
}, bt = (t, s, y, I, g, E) => {
  const _ = {
    initialState: s,
    updaterState: X(
      t,
      I,
      g,
      E
    ),
    state: y
  };
  H(() => {
    at(t, _.initialState), Y(t, _.updaterState), G(t, _.state);
  });
}, St = (t) => {
  const s = r.getState().stateComponents.get(t);
  if (!s) return;
  const y = /* @__PURE__ */ new Set();
  s.components.forEach((I) => {
    y.add(() => I.forceUpdate());
  }), queueMicrotask(() => {
    H(() => {
      y.forEach((I) => I());
    });
  });
}, Bt = (t, s) => {
  const y = r.getState().stateComponents.get(t);
  if (y) {
    const I = `${t}////${s}`, g = y.components.get(I);
    g && g.forceUpdate();
  }
};
function kt(t, {
  stateKey: s,
  serverSync: y,
  localStorage: I,
  formElements: g,
  middleware: E,
  reactiveDeps: _,
  reactiveType: f,
  componentId: l,
  initialState: m,
  syncUpdate: e,
  dependencies: S
} = {}) {
  const [k, C] = et({}), { sessionId: b } = At();
  let U = !s;
  const [u] = et(s ?? rt()), i = r.getState().stateLog[u], L = Z(/* @__PURE__ */ new Set()), j = Z(l ?? rt()), x = Z(null);
  x.current = q(u), nt(() => {
    if (e && e.stateKey === u && e.path?.[0]) {
      G(u, (o) => ({
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
    const c = x.current, o = m;
    let d = null;
    const $ = D(c?.localStorage?.key) ? c?.localStorage?.key(o ?? t) : c?.localStorage?.key;
    $ && b && (d = it(
      // Call existing load function
      b + "-" + u + "-" + $
    ));
    let N = null, w = o ?? void 0, T = !1;
    if (d ? O(
      o,
      d.baseServerState
    ) ? (N = d.state, w = d.baseServerState, T = !0) : (N = o ?? t, w = o ?? void 0, console.warn(
      "Initial state differs from localStorage base. Using initialState."
    )) : (N = o ?? t, w = o ?? void 0), N !== null) {
      const A = ot(u);
      (!A || !O(A, N)) && (bt(
        u,
        o ?? t,
        // Pass the *actual* initialState prop reference
        N,
        n,
        j.current,
        b
      ), ft(
        N,
        u,
        c,
        b,
        w
      ), T && c?.localStorage?.onChange && c.localStorage.onChange(N), St(u), C({}));
    }
  }, [m, ...S || []]), vt(() => {
    U && ht(
      u,
      {
        serverSync: y,
        formElements: g,
        initialState: m,
        localStorage: I,
        middleware: E
      }
    );
    const c = `${u}////${j.current}`, o = r.getState().stateComponents.get(u) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(c, {
      forceUpdate: () => C({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: f ?? ["component", "deps"]
    }), r.getState().stateComponents.set(u, o), C({}), () => {
      const d = `${u}////${j.current}`;
      o && (o.components.delete(d), o.components.size === 0 && r.getState().stateComponents.delete(u));
    };
  }, []);
  const n = (c, o, d, $) => {
    if (Array.isArray(o)) {
      const N = `${u}-${o.join(".")}`;
      L.current.add(N);
    }
    G(u, (N) => {
      const w = D(c) ? c(N) : c, T = `${u}-${o.join(".")}`;
      if (T) {
        let P = !1, v = r.getState().signalDomElements.get(T);
        if ((!v || v.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const h = o.slice(0, -1), p = M(w, h);
          if (Array.isArray(p)) {
            P = !0;
            const V = `${u}-${h.join(".")}`;
            v = r.getState().signalDomElements.get(V);
          }
        }
        if (v) {
          const h = P ? M(w, o.slice(0, -1)) : M(w, o);
          v.forEach(({ parentId: p, position: V, effect: W }) => {
            const F = document.querySelector(
              `[data-parent-id="${p}"]`
            );
            if (F) {
              const lt = Array.from(F.childNodes);
              if (lt[V]) {
                const It = W ? new Function("state", `return (${W})(state)`)(h) : h;
                lt[V].textContent = String(It);
              }
            }
          });
        }
      }
      d.updateType === "update" && ($ || x.current?.validationKey) && o && R(
        ($ || x.current?.validationKey) + "." + o.join(".")
      );
      const A = o.slice(0, o.length - 1);
      d.updateType === "cut" && x.current?.validationKey && R(
        x.current?.validationKey + "." + A.join(".")
      ), d.updateType === "insert" && x.current?.validationKey && Ct(
        x.current?.validationKey + "." + A.join(".")
      ).filter(([v, h]) => {
        let p = v?.split(".").length;
        if (v == A.join(".") && p == A.length - 1) {
          let V = v + "." + A;
          R(v), xt(V, h);
        }
      });
      const z = M(N, o), mt = M(w, o), yt = d.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), st = r.getState().stateComponents.get(u);
      if (st)
        for (const [P, v] of st.components.entries()) {
          let h = !1;
          const p = Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"];
          if (!p.includes("none")) {
            if (p.includes("all")) {
              v.forceUpdate();
              continue;
            }
            if (p.includes("component") && v.paths && (v.paths.has(yt) || v.paths.has("")) && (h = !0), !h && p.includes("deps") && v.depsFunction) {
              const V = v.depsFunction(w);
              typeof V == "boolean" ? V && (h = !0) : O(v.deps, V) || (v.deps = V, h = !0);
            }
            h && v.forceUpdate();
          }
        }
      const ct = {
        timeStamp: Date.now(),
        stateKey: u,
        path: o,
        updateType: d.updateType,
        status: "new",
        oldValue: z,
        newValue: mt
      };
      if (pt(u, (P) => {
        const h = [...P ?? [], ct].reduce((p, V) => {
          const W = `${V.stateKey}:${JSON.stringify(V.path)}`, F = p.get(W);
          return F ? (F.timeStamp = Math.max(F.timeStamp, V.timeStamp), F.newValue = V.newValue, F.oldValue = F.oldValue ?? V.oldValue, F.updateType = V.updateType) : p.set(W, { ...V }), p;
        }, /* @__PURE__ */ new Map());
        return Array.from(h.values());
      }), ft(
        w,
        u,
        x.current,
        b
      ), E && E({
        updateLog: i,
        update: ct
      }), x.current?.serverSync) {
        const P = r.getState().serverState[u], v = x.current?.serverSync;
        Tt(u, {
          syncKey: typeof v.syncKey == "string" ? v.syncKey : v.syncKey({ state: w }),
          rollBackState: P,
          actionTimeStamp: Date.now() + (v.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return w;
    });
  };
  r.getState().updaterState[u] || (Y(
    u,
    X(
      u,
      n,
      j.current,
      b
    )
  ), r.getState().cogsStateStore[u] || G(u, t), r.getState().initialStateGlobal[u] || at(u, t));
  const a = _t(() => X(
    u,
    n,
    j.current,
    b
  ), [u]);
  return [ot(u), a];
}
function X(t, s, y, I) {
  const g = /* @__PURE__ */ new Map();
  let E = 0;
  const _ = (m) => {
    const e = m.join(".");
    for (const [S] of g)
      (S === e || S.startsWith(e + ".")) && g.delete(S);
    E++;
  }, f = {
    removeValidation: (m) => {
      m?.validationKey && R(m.validationKey);
    },
    revertToInitialState: (m) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && R(e?.key), m?.validationKey && R(m.validationKey);
      const S = r.getState().initialStateGlobal[t];
      g.clear(), E++;
      const k = l(S, []), C = q(t), b = D(C?.localStorage?.key) ? C?.localStorage?.key(S) : C?.localStorage?.key, U = `${I}-${t}-${b}`;
      return U && localStorage.removeItem(U), H(() => {
        Y(t, k), G(t, S);
        const u = r.getState().stateComponents.get(t);
        u && u.components.forEach((i) => {
          i.forceUpdate();
        });
      }), S;
    },
    updateInitialState: (m) => {
      g.clear(), E++;
      const e = X(
        t,
        s,
        y,
        I
      );
      return H(() => {
        at(t, m), Y(t, e), G(t, m);
        const S = r.getState().stateComponents.get(t);
        S && S.components.forEach((k) => {
          k.forceUpdate();
        });
      }), {
        fetchId: (S) => e.get()[S]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const m = r.getState().serverState[t];
      return !!(m && O(m, ot(t)));
    }
  };
  function l(m, e = [], S) {
    const k = e.map(String).join(".");
    g.get(k);
    const C = function() {
      return r().getNestedState(t, e);
    };
    Object.keys(f).forEach((u) => {
      C[u] = f[u];
    });
    const b = {
      apply(u, i, L) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${e.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, e);
      },
      get(u, i) {
        if (i !== "then" && !i.startsWith("$") && i !== "stateMapNoRender") {
          const n = e.join("."), a = `${t}////${y}`, c = r.getState().stateComponents.get(t);
          if (c) {
            const o = c.components.get(a);
            o && (e.length > 0 || i === "get") && o.paths.add(n);
          }
        }
        if (i === "_status") {
          const n = r.getState().getNestedState(t, e), a = r.getState().initialStateGlobal[t], c = M(a, e);
          return O(n, c) ? "fresh" : "stale";
        }
        if (i === "getStatus")
          return function() {
            const n = r().getNestedState(
              t,
              e
            ), a = r.getState().initialStateGlobal[t], c = M(a, e);
            return O(n, c) ? "fresh" : "stale";
          };
        if (i === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[t], a = q(t), c = D(a?.localStorage?.key) ? a?.localStorage?.key(n) : a?.localStorage?.key, o = `${I}-${t}-${c}`;
            console.log("removing storage", o), o && localStorage.removeItem(o);
          };
        if (i === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(t)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(n.key + "." + e.join("."));
          };
        if (Array.isArray(m)) {
          if (i === "getSelected")
            return () => {
              const n = r.getState().getSelectedIndex(t, e.join("."));
              if (n !== void 0)
                return l(
                  m[n],
                  [...e, n.toString()],
                  S
                );
            };
          if (i === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(t, e.join(".")) ?? -1;
          if (i === "stateSort")
            return (n) => {
              const o = [...r.getState().getNestedState(t, e).map((d, $) => ({
                ...d,
                __origIndex: $.toString()
              }))].sort(n);
              return g.clear(), E++, l(o, e, {
                filtered: [...S?.filtered || [], e],
                validIndices: o.map(
                  (d) => parseInt(d.__origIndex)
                )
              });
            };
          if (i === "stateMap" || i === "stateMapNoRender")
            return (n) => {
              const a = S?.filtered?.some(
                (o) => o.join(".") === e.join(".")
              ), c = a ? m : r.getState().getNestedState(t, e);
              return i !== "stateMapNoRender" && (g.clear(), E++), c.map((o, d) => {
                const $ = a && o.__origIndex ? o.__origIndex : d, N = l(
                  o,
                  [...e, $.toString()],
                  S
                );
                return n(
                  o,
                  N,
                  d,
                  m,
                  l(m, e, S)
                );
              });
            };
          if (i === "$stateMap")
            return (n) => Q(Ft, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: l
            });
          if (i === "stateFlattenOn")
            return (n) => {
              const c = S?.filtered?.some(
                (d) => d.join(".") === e.join(".")
              ) ? m : r.getState().getNestedState(t, e);
              g.clear(), E++;
              const o = c.flatMap(
                (d, $) => d[n] ?? []
              );
              return l(
                o,
                [...e, "[*]", n],
                S
              );
            };
          if (i === "findWith")
            return (n, a) => {
              const c = m.findIndex(
                ($) => $[n] === a
              );
              if (c === -1) return;
              const o = m[c], d = [...e, c.toString()];
              return g.clear(), E++, g.clear(), E++, l(o, d);
            };
          if (i === "index")
            return (n) => {
              const a = m[n];
              return l(a, [...e, n.toString()]);
            };
          if (i === "insert")
            return (n) => (_(e), K(s, n, e, t), l(
              r.getState().cogsStateStore[t],
              []
            ));
          if (i === "uniqueInsert")
            return (n, a, c) => {
              const o = r.getState().getNestedState(t, e), d = D(n) ? n(o) : n;
              let $ = null;
              if (!o.some((w) => {
                if (a) {
                  const A = a.every(
                    (z) => O(w[z], d[z])
                  );
                  return A && ($ = w), A;
                }
                const T = O(w, d);
                return T && ($ = w), T;
              }))
                _(e), K(s, d, e, t);
              else if (c && $) {
                const w = c($), T = o.map(
                  (A) => O(A, $) ? w : A
                );
                _(e), B(s, T, e);
              }
            };
          if (i === "cut")
            return (n, a) => {
              a?.waitForSync || (_(e), J(s, e, t, n));
            };
          if (i === "cutByValue")
            return (n) => {
              for (let a = 0; a < m.length; a++)
                m[a] === n && J(s, e, t, a);
            };
          if (i === "toggleByValue")
            return (n) => {
              const a = m.findIndex((c) => c === n);
              a > -1 ? J(s, e, t, a) : K(s, n, e, t);
            };
          if (i === "stateFilter")
            return (n) => {
              const a = m.map((d, $) => ({
                ...d,
                __origIndex: $.toString()
              })), c = [], o = [];
              for (let d = 0; d < a.length; d++)
                n(a[d], d) && (c.push(d), o.push(a[d]));
              return g.clear(), E++, l(o, e, {
                filtered: [...S?.filtered || [], e],
                validIndices: c
                // Always pass validIndices, even if empty
              });
            };
        }
        const L = e[e.length - 1];
        if (!isNaN(Number(L))) {
          const n = e.slice(0, -1), a = r.getState().getNestedState(t, n);
          if (Array.isArray(a) && i === "cut")
            return () => J(
              s,
              n,
              t,
              Number(L)
            );
        }
        if (i === "get")
          return () => r.getState().getNestedState(t, e);
        if (i === "$derive")
          return (n) => tt({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (i === "$derive")
          return (n) => tt({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (i === "$get")
          return () => tt({
            _stateKey: t,
            _path: e
          });
        if (i === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (i == "getLocalStorage")
          return (n) => it(I + "-" + t + "-" + n);
        if (i === "_selected") {
          const n = e.slice(0, -1), a = n.join("."), c = r.getState().getNestedState(t, n);
          return Array.isArray(c) ? Number(e[e.length - 1]) === r.getState().getSelectedIndex(t, a) : void 0;
        }
        if (i === "setSelected")
          return (n) => {
            const a = e.slice(0, -1), c = Number(e[e.length - 1]), o = a.join(".");
            n ? r.getState().setSelectedIndex(t, o, c) : r.getState().setSelectedIndex(t, o, void 0);
            const d = r.getState().getNestedState(t, [...a]);
            B(s, d, a), _(a);
          };
        if (e.length == 0) {
          if (i === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(t)?.validation, a = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              R(n.key);
              const c = r.getState().cogsStateStore[t];
              try {
                const o = r.getState().getValidationErrors(n.key);
                o && o.length > 0 && o.forEach(([$]) => {
                  $ && $.startsWith(n.key) && R($);
                });
                const d = n.zodSchema.safeParse(c);
                return d.success ? !0 : (d.error.errors.forEach((N) => {
                  const w = N.path, T = N.message, A = [n.key, ...w].join(".");
                  a(A, T);
                }), St(t), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (i === "_componentId") return y;
          if (i === "getComponents")
            return () => r().stateComponents.get(t);
          if (i === "getAllFormRefs")
            return () => ut.getState().getFormRefsByStateKey(t);
          if (i === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (i === "_serverState")
            return r.getState().serverState[t];
          if (i === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (i === "revertToInitialState")
            return f.revertToInitialState;
          if (i === "updateInitialState") return f.updateInitialState;
          if (i === "removeValidation") return f.removeValidation;
        }
        if (i === "getFormRef")
          return () => ut.getState().getFormRef(t + "." + e.join("."));
        if (i === "validationWrapper")
          return ({
            children: n,
            hideMessage: a
          }) => /* @__PURE__ */ dt(
            Nt,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: S?.validIndices,
              children: n
            }
          );
        if (i === "_stateKey") return t;
        if (i === "_path") return e;
        if (i === "_isServerSynced") return f._isServerSynced;
        if (i === "update")
          return (n, a) => {
            if (a?.debounce)
              wt(() => {
                B(s, n, e, "");
                const c = r.getState().getNestedState(t, e);
                a?.afterUpdate && a.afterUpdate(c);
              }, a.debounce);
            else {
              B(s, n, e, "");
              const c = r.getState().getNestedState(t, e);
              a?.afterUpdate && a.afterUpdate(c);
            }
            _(e);
          };
        if (i === "formElement")
          return (n, a) => /* @__PURE__ */ dt(
            Vt,
            {
              setState: s,
              stateKey: t,
              path: e,
              child: n,
              formOpts: a
            }
          );
        const j = [...e, i], x = r.getState().getNestedState(t, j);
        return l(x, j, S);
      }
    }, U = new Proxy(C, b);
    return g.set(k, {
      proxy: U,
      stateVersion: E
    }), U;
  }
  return l(
    r.getState().getNestedState(t, [])
  );
}
function tt(t) {
  return Q(Ot, { proxy: t });
}
function Ft({
  proxy: t,
  rebuildStateShape: s
}) {
  const y = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(y) ? s(
    y,
    t._path
  ).stateMapNoRender(
    (g, E, _, f, l) => t._mapFn(g, E, _, f, l)
  ) : null;
}
function Ot({
  proxy: t
}) {
  const s = Z(null), y = `${t._stateKey}-${t._path.join(".")}`;
  return nt(() => {
    const I = s.current;
    if (!I || !I.parentElement) return;
    const g = I.parentElement, _ = Array.from(g.childNodes).indexOf(I);
    let f = g.getAttribute("data-parent-id");
    f || (f = `parent-${crypto.randomUUID()}`, g.setAttribute("data-parent-id", f));
    const m = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: f,
      position: _,
      effect: t._effect
    };
    r.getState().addSignalElement(y, m);
    const e = r.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(e);
      } catch (C) {
        console.error("Error evaluating effect function during mount:", C), S = e;
      }
    else
      S = e;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const k = document.createTextNode(String(S));
    I.replaceWith(k);
  }, [t._stateKey, t._path.join("."), t._effect]), Q("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": y
  });
}
function Jt(t) {
  const s = Et(
    (y) => {
      const I = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return I.components.set(t._stateKey, {
        forceUpdate: y,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => I.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return Q("text", {}, String(s));
}
export {
  tt as $cogsSignal,
  Jt as $cogsSignalStore,
  qt as addStateOptions,
  zt as createCogsState,
  Bt as notifyComponent,
  kt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
