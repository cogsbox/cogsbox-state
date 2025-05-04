"use client";
import { jsx as lt } from "react/jsx-runtime";
import { useState as et, useRef as Z, useEffect as nt, useLayoutEffect as _t, useMemo as Et, createElement as Q, useSyncExternalStore as $t, startTransition as H } from "react";
import { transformStateFunc as wt, isFunction as D, getNestedValue as U, isDeepEqual as M, debounce as Nt } from "./utility.js";
import { pushFunc as K, updateFn as B, cutFunc as J, ValidationWrapper as Vt, FormControlComponent as At } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as dt } from "./store.js";
import { useCogsConfig as pt } from "./CogsStateClient.jsx";
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
  const y = q(t) || {}, g = m[t] || {}, $ = r.getState().setInitialStateOptions, _ = { ...g, ...y };
  let v = !1;
  if (i)
    for (const l in i)
      _.hasOwnProperty(l) ? l == "localStorage" && i[l] && _[l].key !== i[l]?.key && (v = !0, _[l] = i[l]) : (v = !0, _[l] = i[l]);
  console.log("existingOptions-------", _), v && $(t, _);
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
    };
    const l = q(v);
    console.log("existingOptions", l, g[v]), l || r.getState().setInitialStateOptions(v, g[v]);
  }), r.getState().setInitialStates(y);
  const $ = (v, l) => {
    const [f] = et(l?.componentId ?? rt());
    gt({
      stateKey: v,
      options: l,
      initialOptionsPart: g
    });
    const e = r.getState().cogsStateStore[v] || y[v], S = l?.modifyState ? l.modifyState(e) : e, [C, V] = Tt(
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
    return V;
  };
  function _(v, l) {
    gt({ stateKey: v, options: l, initialOptionsPart: g });
  }
  return { useCogsState: $, setCogsOptions: _ };
}, {
  setUpdaterState: Y,
  setState: L,
  getInitialOptions: q,
  getKeyState: St,
  getValidationErrors: xt,
  setStateLog: ht,
  updateInitialStateGlobal: at,
  addValidationError: kt,
  removeValidationError: P,
  setServerSyncActions: Ct
} = r.getState(), mt = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Ot = (t, i, m, y) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    y
  );
  const g = D(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (g && y) {
    const $ = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, _ = `${y}-${i}-${g}`;
    window.localStorage.setItem(_, JSON.stringify($));
  }
}, ft = (t, i, m, y, g, $) => {
  const _ = {
    initialState: i,
    updaterState: X(
      t,
      y,
      g,
      $
    ),
    state: m
  };
  H(() => {
    at(t, _.initialState), Y(t, _.updaterState), L(t, _.state);
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
function Tt(t, {
  stateKey: i,
  serverSync: m,
  localStorage: y,
  formElements: g,
  middleware: $,
  reactiveDeps: _,
  reactiveType: v,
  componentId: l,
  initialState: f,
  syncUpdate: e,
  dependencies: S
} = {}) {
  const [C, V] = et({}), { sessionId: k } = pt();
  let R = !i;
  const [d] = et(i ?? rt()), s = r.getState().stateLog[d], G = Z(/* @__PURE__ */ new Set()), j = Z(l ?? rt()), x = Z(null);
  x.current = q(d), nt(() => {
    if (e && e.stateKey === d && e.path?.[0]) {
      L(d, (o) => ({
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
    const c = x.current;
    let o = null;
    const u = D(c?.localStorage?.key) ? c?.localStorage?.key(f) : c?.localStorage?.key;
    c?.log && (console.log("newoptions", c), console.log("localkey", u), console.log("initialState", f)), u && k && (o = mt(
      k + "-" + d + "-" + u
    ), f || (c?.log && console.log(
      "localData",
      o,
      k + "-" + d + "-" + u
    ), ft(
      d,
      f,
      o,
      n,
      j.current,
      k
    ), ot(d), V({})));
    let E = null;
    f && (E = f, o && o.lastUpdated > (o.lastSyncedWithServer || 0) && (E = o.state), ft(
      d,
      f,
      E,
      n,
      j.current,
      k
    ), ot(d), V({}));
  }, [f, ...S || []]), _t(() => {
    R && ut(d, {
      serverSync: m,
      formElements: g,
      initialState: f,
      localStorage: y,
      middleware: $
    });
    const c = `${d}////${j.current}`, o = r.getState().stateComponents.get(d) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(c, {
      forceUpdate: () => V({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: v ?? ["component", "deps"]
    }), r.getState().stateComponents.set(d, o), V({}), () => {
      const u = `${d}////${j.current}`;
      o && (o.components.delete(u), o.components.size === 0 && r.getState().stateComponents.delete(d));
    };
  }, []);
  const n = (c, o, u, E) => {
    if (Array.isArray(o)) {
      const O = `${d}-${o.join(".")}`;
      G.current.add(O);
    }
    L(d, (O) => {
      const N = D(c) ? c(O) : c, b = `${d}-${o.join(".")}`;
      if (b) {
        let F = !1, I = r.getState().signalDomElements.get(b);
        if ((!I || I.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const A = o.slice(0, -1), p = U(N, A);
          if (Array.isArray(p)) {
            F = !0;
            const w = `${d}-${A.join(".")}`;
            I = r.getState().signalDomElements.get(w);
          }
        }
        if (I) {
          const A = F ? U(N, o.slice(0, -1)) : U(N, o);
          I.forEach(({ parentId: p, position: w, effect: W }) => {
            const T = document.querySelector(
              `[data-parent-id="${p}"]`
            );
            if (T) {
              const ct = Array.from(T.childNodes);
              if (ct[w]) {
                const It = W ? new Function("state", `return (${W})(state)`)(A) : A;
                ct[w].textContent = String(It);
              }
            }
          });
        }
      }
      u.updateType === "update" && (E || x.current?.validationKey) && o && P(
        (E || x.current?.validationKey) + "." + o.join(".")
      );
      const h = o.slice(0, o.length - 1);
      u.updateType === "cut" && x.current?.validationKey && P(
        x.current?.validationKey + "." + h.join(".")
      ), u.updateType === "insert" && x.current?.validationKey && xt(
        x.current?.validationKey + "." + h.join(".")
      ).filter(([I, A]) => {
        let p = I?.split(".").length;
        if (I == h.join(".") && p == h.length - 1) {
          let w = I + "." + h;
          P(I), kt(w, A);
        }
      });
      const z = U(O, o), yt = U(N, o), vt = u.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), it = r.getState().stateComponents.get(d);
      if (it)
        for (const [F, I] of it.components.entries()) {
          let A = !1;
          const p = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (!p.includes("none")) {
            if (p.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if (p.includes("component") && I.paths && (I.paths.has(vt) || I.paths.has("")) && (A = !0), !A && p.includes("deps") && I.depsFunction) {
              const w = I.depsFunction(N);
              typeof w == "boolean" ? w && (A = !0) : M(I.deps, w) || (I.deps = w, A = !0);
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
      if (ht(d, (F) => {
        const A = [...F ?? [], st].reduce((p, w) => {
          const W = `${w.stateKey}:${JSON.stringify(w.path)}`, T = p.get(W);
          return T ? (T.timeStamp = Math.max(T.timeStamp, w.timeStamp), T.newValue = w.newValue, T.oldValue = T.oldValue ?? w.oldValue, T.updateType = w.updateType) : p.set(W, { ...w }), p;
        }, /* @__PURE__ */ new Map());
        return Array.from(A.values());
      }), Ot(
        N,
        d,
        x.current,
        k
      ), $ && $({
        updateLog: s,
        update: st
      }), x.current?.serverSync) {
        const F = r.getState().serverState[d], I = x.current?.serverSync;
        Ct(d, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: N }),
          rollBackState: F,
          actionTimeStamp: Date.now() + (I.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return N;
    });
  };
  r.getState().updaterState[d] || (Y(
    d,
    X(
      d,
      n,
      j.current,
      k
    )
  ), r.getState().cogsStateStore[d] || L(d, t), r.getState().initialStateGlobal[d] || at(d, t));
  const a = Et(() => X(
    d,
    n,
    j.current,
    k
  ), [d]);
  return [St(d), a];
}
function X(t, i, m, y) {
  const g = /* @__PURE__ */ new Map();
  let $ = 0;
  const _ = (f) => {
    const e = f.join(".");
    for (const [S] of g)
      (S === e || S.startsWith(e + ".")) && g.delete(S);
    $++;
  }, v = {
    removeValidation: (f) => {
      f?.validationKey && P(f.validationKey);
    },
    revertToInitialState: (f) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && P(e?.key), f?.validationKey && P(f.validationKey);
      const S = r.getState().initialStateGlobal[t];
      g.clear(), $++;
      const C = l(S, []), V = q(t), k = D(V?.localStorage?.key) ? V?.localStorage?.key(S) : V?.localStorage?.key, R = `${y}-${t}-${k}`;
      return R && localStorage.removeItem(R), H(() => {
        Y(t, C), L(t, S);
        const d = r.getState().stateComponents.get(t);
        d && d.components.forEach((s) => {
          s.forceUpdate();
        });
      }), S;
    },
    updateInitialState: (f) => {
      g.clear(), $++;
      const e = X(
        t,
        i,
        m,
        y
      );
      return H(() => {
        at(t, f), Y(t, e), L(t, f);
        const S = r.getState().stateComponents.get(t);
        S && S.components.forEach((C) => {
          C.forceUpdate();
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
    const C = e.map(String).join(".");
    g.get(C);
    const V = function() {
      return r().getNestedState(t, e);
    };
    Object.keys(v).forEach((d) => {
      V[d] = v[d];
    });
    const k = {
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
            const n = r.getState().initialStateGlobal[t], a = q(t), c = D(a?.localStorage?.key) ? a?.localStorage?.key(n) : a?.localStorage?.key, o = `${y}-${t}-${c}`;
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
              const o = [...r.getState().getNestedState(t, e).map((u, E) => ({
                ...u,
                __origIndex: E.toString()
              }))].sort(n);
              return g.clear(), $++, l(o, e, {
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
              return s !== "stateMapNoRender" && (g.clear(), $++), c.map((o, u) => {
                const E = a && o.__origIndex ? o.__origIndex : u, O = l(
                  o,
                  [...e, E.toString()],
                  S
                );
                return n(
                  o,
                  O,
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
              g.clear(), $++;
              const o = c.flatMap(
                (u, E) => u[n] ?? []
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
                (E) => E[n] === a
              );
              if (c === -1) return;
              const o = f[c], u = [...e, c.toString()];
              return g.clear(), $++, g.clear(), $++, l(o, u);
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
              const o = r.getState().getNestedState(t, e), u = D(n) ? n(o) : n;
              let E = null;
              if (!o.some((N) => {
                if (a) {
                  const h = a.every(
                    (z) => M(N[z], u[z])
                  );
                  return h && (E = N), h;
                }
                const b = M(N, u);
                return b && (E = N), b;
              }))
                _(e), K(i, u, e, t);
              else if (c && E) {
                const N = c(E), b = o.map(
                  (h) => M(h, E) ? N : h
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
              const a = f.map((u, E) => ({
                ...u,
                __origIndex: E.toString()
              })), c = [], o = [];
              for (let u = 0; u < a.length; u++)
                n(a[u], u) && (c.push(u), o.push(a[u]));
              return g.clear(), $++, l(o, e, {
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
                o && o.length > 0 && o.forEach(([E]) => {
                  E && E.startsWith(n.key) && P(E);
                });
                const u = n.zodSchema.safeParse(c);
                return u.success ? !0 : (u.error.errors.forEach((O) => {
                  const N = O.path, b = O.message, h = [n.key, ...N].join(".");
                  a(h, b);
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
        const j = [...e, s], x = r.getState().getNestedState(t, j);
        return l(x, j, S);
      }
    }, R = new Proxy(V, k);
    return g.set(C, {
      proxy: R,
      stateVersion: $
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
    (g, $, _, v, l) => t._mapFn(g, $, _, v, l)
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
      } catch (V) {
        console.error("Error evaluating effect function during mount:", V), S = e;
      }
    else
      S = e;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const C = document.createTextNode(String(S));
    y.replaceWith(C);
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
  Tt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
