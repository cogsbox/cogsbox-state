"use client";
import { jsx as ct } from "react/jsx-runtime";
import { useState as et, useRef as J, useEffect as nt, useLayoutEffect as It, useMemo as _t, createElement as Q, useSyncExternalStore as Et, startTransition as Z } from "react";
import { transformStateFunc as wt, isFunction as L, getNestedValue as U, isDeepEqual as M, debounce as Nt } from "./utility.js";
import { pushFunc as K, updateFn as z, cutFunc as B, ValidationWrapper as Vt, FormControlComponent as $t } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as lt } from "./store.js";
import { useCogsConfig as At } from "./CogsStateClient.jsx";
import rt from "./node_modules/uuid/dist/esm-browser/v4.js";
function dt(t, a) {
  const S = r.getState().getInitialOptions, y = r.getState().setInitialStateOptions, g = S(t) || {};
  y(t, {
    ...g,
    ...a
  });
}
function ut({
  stateKey: t,
  options: a,
  initialOptionsPart: S
}) {
  const y = Y(t) || {}, g = S[t] || {}, w = r.getState().setInitialStateOptions, _ = { ...g, ...y };
  let v = !1;
  if (a)
    for (const l in a)
      _.hasOwnProperty(l) ? l == "localStorage" && a[l] && _[l].key !== a[l]?.key && (v = !0, _[l] = a[l]) : (v = !0, _[l] = a[l]);
  v && w(t, _);
}
function qt(t, { formElements: a, validation: S }) {
  return { initialState: t, formElements: a, validation: S };
}
const zt = (t, a) => {
  let S = t;
  const [y, g] = wt(S);
  (a?.formElements || a?.validation) && Object.keys(g).forEach((v) => {
    g[v] = g[v] || {}, g[v].formElements = {
      ...a.formElements,
      // Global defaults first
      ...a?.validation,
      ...g[v].formElements || {}
      // State-specific overrides
    };
  }), r.getState().setInitialStates(y);
  const w = (v, l) => {
    const [f] = et(l?.componentId ?? rt());
    ut({
      stateKey: v,
      options: l,
      initialOptionsPart: g
    });
    const e = r.getState().cogsStateStore[v] || y[v], m = l?.modifyState ? l.modifyState(e) : e, [h, V] = bt(
      m,
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
    ut({ stateKey: v, options: l, initialOptionsPart: g });
  }
  return { useCogsState: w, setCogsOptions: _ };
}, {
  setUpdaterState: H,
  setState: D,
  getInitialOptions: Y,
  getKeyState: gt,
  getValidationErrors: pt,
  setStateLog: kt,
  updateInitialStateGlobal: ot,
  addValidationError: Ct,
  removeValidationError: R,
  setServerSyncActions: Tt
} = r.getState(), ft = (t) => {
  if (!t) return null;
  try {
    const a = window.localStorage.getItem(t);
    return a ? JSON.parse(a) : null;
  } catch (a) {
    return console.error("Error loading from localStorage:", a), null;
  }
}, ht = (t, a, S, y) => {
  S.log && console.log(
    "saving to localstorage",
    a,
    S.localStorage?.key,
    y
  );
  const g = L(S.localStorage?.key) ? S.localStorage?.key(t) : S.localStorage?.key;
  if (g && y) {
    const w = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[a]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[a]
    }, _ = `${y}-${a}-${g}`;
    window.localStorage.setItem(_, JSON.stringify(w));
  }
}, Ft = (t, a, S, y, g, w) => {
  const _ = {
    initialState: a,
    updaterState: X(
      t,
      y,
      g,
      w
    ),
    state: S
  };
  Z(() => {
    ot(t, _.initialState), H(t, _.updaterState), D(t, _.state);
  });
}, St = (t) => {
  const a = r.getState().stateComponents.get(t);
  if (!a) return;
  const S = /* @__PURE__ */ new Set();
  a.components.forEach((y) => {
    S.add(() => y.forceUpdate());
  }), queueMicrotask(() => {
    Z(() => {
      S.forEach((y) => y());
    });
  });
}, Bt = (t, a) => {
  const S = r.getState().stateComponents.get(t);
  if (S) {
    const y = `${t}////${a}`, g = S.components.get(y);
    g && g.forceUpdate();
  }
};
function bt(t, {
  stateKey: a,
  serverSync: S,
  localStorage: y,
  formElements: g,
  middleware: w,
  reactiveDeps: _,
  reactiveType: v,
  componentId: l,
  initialState: f,
  syncUpdate: e,
  dependencies: m
} = {}) {
  const [h, V] = et({}), { sessionId: A } = At();
  let j = !a;
  const [u] = et(a ?? rt()), s = r.getState().stateLog[u], G = J(/* @__PURE__ */ new Set()), O = J(l ?? rt()), C = J(null);
  C.current = Y(u), nt(() => {
    if (e && e.stateKey === u && e.path?.[0]) {
      D(u, (o) => ({
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
    dt(u, {
      initialState: f
    });
    const c = C.current;
    let o = null;
    c.log && console.log("newoptions", c);
    const d = L(c.localStorage?.key) ? c.localStorage?.key(f) : c.localStorage?.key;
    d && A && (o = ft(
      A + "-" + u + "-" + d
    ));
    let E = null;
    f && (E = f, o && o.lastUpdated > (o.lastSyncedWithServer || 0) && (E = o.state), Ft(
      u,
      f,
      E,
      n,
      O.current,
      A
    ), St(u), V({}));
  }, [f, ...m || []]), It(() => {
    j && dt(u, {
      serverSync: S,
      formElements: g,
      initialState: f,
      localStorage: y,
      middleware: w
    });
    const c = `${u}////${O.current}`, o = r.getState().stateComponents.get(u) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(c, {
      forceUpdate: () => V({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: v ?? ["component", "deps"]
    }), r.getState().stateComponents.set(u, o), V({}), () => {
      const d = `${u}////${O.current}`;
      o && (o.components.delete(d), o.components.size === 0 && r.getState().stateComponents.delete(u));
    };
  }, []);
  const n = (c, o, d, E) => {
    if (Array.isArray(o)) {
      const F = `${u}-${o.join(".")}`;
      G.current.add(F);
    }
    D(u, (F) => {
      const $ = L(c) ? c(F) : c, x = `${u}-${o.join(".")}`;
      if (x) {
        let P = !1, I = r.getState().signalDomElements.get(x);
        if ((!I || I.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const p = o.slice(0, -1), k = U($, p);
          if (Array.isArray(k)) {
            P = !0;
            const N = `${u}-${p.join(".")}`;
            I = r.getState().signalDomElements.get(N);
          }
        }
        if (I) {
          const p = P ? U($, o.slice(0, -1)) : U($, o);
          I.forEach(({ parentId: k, position: N, effect: W }) => {
            const b = document.querySelector(
              `[data-parent-id="${k}"]`
            );
            if (b) {
              const st = Array.from(b.childNodes);
              if (st[N]) {
                const vt = W ? new Function("state", `return (${W})(state)`)(p) : p;
                st[N].textContent = String(vt);
              }
            }
          });
        }
      }
      d.updateType === "update" && (E || C.current?.validationKey) && o && R(
        (E || C.current?.validationKey) + "." + o.join(".")
      );
      const T = o.slice(0, o.length - 1);
      d.updateType === "cut" && C.current?.validationKey && R(
        C.current?.validationKey + "." + T.join(".")
      ), d.updateType === "insert" && C.current?.validationKey && pt(
        C.current?.validationKey + "." + T.join(".")
      ).filter(([I, p]) => {
        let k = I?.split(".").length;
        if (I == T.join(".") && k == T.length - 1) {
          let N = I + "." + T;
          R(I), Ct(N, p);
        }
      });
      const q = U(F, o), mt = U($, o), yt = d.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), at = r.getState().stateComponents.get(u);
      if (at)
        for (const [P, I] of at.components.entries()) {
          let p = !1;
          const k = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (!k.includes("none")) {
            if (k.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if (k.includes("component") && I.paths && (I.paths.has(yt) || I.paths.has("")) && (p = !0), !p && k.includes("deps") && I.depsFunction) {
              const N = I.depsFunction($);
              typeof N == "boolean" ? N && (p = !0) : M(I.deps, N) || (I.deps = N, p = !0);
            }
            p && I.forceUpdate();
          }
        }
      const it = {
        timeStamp: Date.now(),
        stateKey: u,
        path: o,
        updateType: d.updateType,
        status: "new",
        oldValue: q,
        newValue: mt
      };
      if (kt(u, (P) => {
        const p = [...P ?? [], it].reduce((k, N) => {
          const W = `${N.stateKey}:${JSON.stringify(N.path)}`, b = k.get(W);
          return b ? (b.timeStamp = Math.max(b.timeStamp, N.timeStamp), b.newValue = N.newValue, b.oldValue = b.oldValue ?? N.oldValue, b.updateType = N.updateType) : k.set(W, { ...N }), k;
        }, /* @__PURE__ */ new Map());
        return Array.from(p.values());
      }), ht(
        $,
        u,
        C.current,
        A
      ), w && w({
        updateLog: s,
        update: it
      }), C.current?.serverSync) {
        const P = r.getState().serverState[u], I = C.current?.serverSync;
        Tt(u, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: $ }),
          rollBackState: P,
          actionTimeStamp: Date.now() + (I.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return $;
    });
  };
  r.getState().updaterState[u] || (H(
    u,
    X(
      u,
      n,
      O.current,
      A
    )
  ), r.getState().cogsStateStore[u] || D(u, t), r.getState().initialStateGlobal[u] || ot(u, t));
  const i = _t(() => X(
    u,
    n,
    O.current,
    A
  ), [u]);
  return [gt(u), i];
}
function X(t, a, S, y) {
  const g = /* @__PURE__ */ new Map();
  let w = 0;
  const _ = (f) => {
    const e = f.join(".");
    for (const [m] of g)
      (m === e || m.startsWith(e + ".")) && g.delete(m);
    w++;
  }, v = {
    removeValidation: (f) => {
      f?.validationKey && R(f.validationKey);
    },
    revertToInitialState: (f) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && R(e?.key), f?.validationKey && R(f.validationKey);
      const m = r.getState().initialStateGlobal[t];
      g.clear(), w++;
      const h = l(m, []), V = Y(t), A = L(V?.localStorage?.key) ? V?.localStorage?.key(m) : V?.localStorage?.key;
      return A && localStorage.removeItem(A), Z(() => {
        H(t, h), D(t, m);
        const j = r.getState().stateComponents.get(t);
        j && j.components.forEach((u) => {
          u.forceUpdate();
        });
      }), m;
    },
    updateInitialState: (f) => {
      g.clear(), w++;
      const e = r.getState().initialStateGlobal[t], m = Y(t), h = L(m?.localStorage?.key) ? m?.localStorage?.key(e) : m?.localStorage?.key;
      h && localStorage.removeItem(h);
      const V = X(
        t,
        a,
        S,
        y
      );
      return Z(() => {
        ot(t, f), H(t, V), D(t, f);
        const A = r.getState().stateComponents.get(t);
        A && A.components.forEach((j) => {
          j.forceUpdate();
        });
      }), {
        fetchId: (A) => V.get()[A]
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
  function l(f, e = [], m) {
    const h = e.map(String).join(".");
    g.get(h);
    const V = function() {
      return r().getNestedState(t, e);
    };
    Object.keys(v).forEach((u) => {
      V[u] = v[u];
    });
    const A = {
      apply(u, s, G) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${e.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, e);
      },
      get(u, s) {
        if (s !== "then" && !s.startsWith("$") && s !== "stateMapNoRender") {
          const n = e.join("."), i = `${t}////${S}`, c = r.getState().stateComponents.get(t);
          if (c) {
            const o = c.components.get(i);
            o && (e.length > 0 || s === "get") && o.paths.add(n);
          }
        }
        if (s === "_status") {
          const n = r.getState().getNestedState(t, e), i = r.getState().initialStateGlobal[t], c = U(i, e);
          return M(n, c) ? "fresh" : "stale";
        }
        if (s === "getStatus")
          return function() {
            const n = r().getNestedState(
              t,
              e
            ), i = r.getState().initialStateGlobal[t], c = U(i, e);
            return M(n, c) ? "fresh" : "stale";
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
                  m
                );
            };
          if (s === "stateSort")
            return (n) => {
              const o = [...r.getState().getNestedState(t, e).map((d, E) => ({
                ...d,
                __origIndex: E.toString()
              }))].sort(n);
              return g.clear(), w++, l(o, e, {
                filtered: [...m?.filtered || [], e],
                validIndices: o.map(
                  (d) => parseInt(d.__origIndex)
                )
              });
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const i = m?.filtered?.some(
                (o) => o.join(".") === e.join(".")
              ), c = i ? f : r.getState().getNestedState(t, e);
              return s !== "stateMapNoRender" && (g.clear(), w++), c.map((o, d) => {
                const E = i && o.__origIndex ? o.__origIndex : d, F = l(
                  o,
                  [...e, E.toString()],
                  m
                );
                return n(
                  o,
                  F,
                  d,
                  f,
                  l(f, e, m)
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
              const c = m?.filtered?.some(
                (d) => d.join(".") === e.join(".")
              ) ? f : r.getState().getNestedState(t, e);
              g.clear(), w++;
              const o = c.flatMap(
                (d, E) => d[n] ?? []
              );
              return l(
                o,
                [...e, "[*]", n],
                m
              );
            };
          if (s === "findWith")
            return (n, i) => {
              const c = f.findIndex(
                (E) => E[n] === i
              );
              if (c === -1) return;
              const o = f[c], d = [...e, c.toString()];
              return g.clear(), w++, g.clear(), w++, l(o, d);
            };
          if (s === "index")
            return (n) => {
              const i = f[n];
              return l(i, [...e, n.toString()]);
            };
          if (s === "insert")
            return (n) => (_(e), K(a, n, e, t), l(
              r.getState().cogsStateStore[t],
              []
            ));
          if (s === "uniqueInsert")
            return (n, i, c) => {
              const o = r.getState().getNestedState(t, e), d = L(n) ? n(o) : n;
              let E = null;
              if (!o.some(($) => {
                if (i) {
                  const T = i.every(
                    (q) => M($[q], d[q])
                  );
                  return T && (E = $), T;
                }
                const x = M($, d);
                return x && (E = $), x;
              }))
                _(e), K(a, d, e, t);
              else if (c && E) {
                const $ = c(E), x = o.map(
                  (T) => M(T, E) ? $ : T
                );
                _(e), z(a, x, e);
              }
            };
          if (s === "cut")
            return (n, i) => {
              i?.waitForSync || (_(e), B(a, e, t, n));
            };
          if (s === "cutByValue")
            return (n) => {
              for (let i = 0; i < f.length; i++)
                f[i] === n && B(a, e, t, i);
            };
          if (s === "toggleByValue")
            return (n) => {
              const i = f.findIndex((c) => c === n);
              i > -1 ? B(a, e, t, i) : K(a, n, e, t);
            };
          if (s === "stateFilter")
            return (n) => {
              const i = f.map((d, E) => ({
                ...d,
                __origIndex: E.toString()
              })), c = [], o = [];
              for (let d = 0; d < i.length; d++)
                n(i[d], d) && (c.push(d), o.push(i[d]));
              return g.clear(), w++, l(o, e, {
                filtered: [...m?.filtered || [], e],
                validIndices: c
                // Always pass validIndices, even if empty
              });
            };
        }
        const G = e[e.length - 1];
        if (!isNaN(Number(G))) {
          const n = e.slice(0, -1), i = r.getState().getNestedState(t, n);
          if (Array.isArray(i) && s === "cut")
            return () => B(
              a,
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
          return (n) => ft(y + "-" + t + "-" + n);
        if (s === "_selected") {
          const n = e.slice(0, -1), i = n.join("."), c = r.getState().getNestedState(t, n);
          return Array.isArray(c) ? Number(e[e.length - 1]) === r.getState().getSelectedIndex(t, i) : void 0;
        }
        if (s === "setSelected")
          return (n) => {
            const i = e.slice(0, -1), c = Number(e[e.length - 1]), o = i.join(".");
            n ? r.getState().setSelectedIndex(t, o, c) : r.getState().setSelectedIndex(t, o, void 0);
            const d = r.getState().getNestedState(t, [...i]);
            z(a, d, i), _(i);
          };
        if (e.length == 0) {
          if (s === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(t)?.validation, i = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              R(n.key);
              const c = r.getState().cogsStateStore[t];
              try {
                const o = r.getState().getValidationErrors(n.key);
                o && o.length > 0 && o.forEach(([E]) => {
                  E && E.startsWith(n.key) && R(E);
                });
                const d = n.zodSchema.safeParse(c);
                return d.success ? !0 : (d.error.errors.forEach((F) => {
                  const $ = F.path, x = F.message, T = [n.key, ...$].join(".");
                  i(T, x);
                }), St(t), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (s === "_componentId") return S;
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
            return v.revertToInitialState;
          if (s === "updateInitialState") return v.updateInitialState;
          if (s === "removeValidation") return v.removeValidation;
        }
        if (s === "getFormRef")
          return () => lt.getState().getFormRef(t + "." + e.join("."));
        if (s === "validationWrapper")
          return ({
            children: n,
            hideMessage: i
          }) => /* @__PURE__ */ ct(
            Vt,
            {
              formOpts: i ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: m?.validIndices,
              children: n
            }
          );
        if (s === "_stateKey") return t;
        if (s === "_path") return e;
        if (s === "_isServerSynced") return v._isServerSynced;
        if (s === "update")
          return (n, i) => {
            if (i?.debounce)
              Nt(() => {
                z(a, n, e, "");
                const c = r.getState().getNestedState(t, e);
                i?.afterUpdate && i.afterUpdate(c);
              }, i.debounce);
            else {
              z(a, n, e, "");
              const c = r.getState().getNestedState(t, e);
              i?.afterUpdate && i.afterUpdate(c);
            }
            _(e);
          };
        if (s === "formElement")
          return (n, i) => /* @__PURE__ */ ct(
            $t,
            {
              setState: a,
              stateKey: t,
              path: e,
              child: n,
              formOpts: i
            }
          );
        const O = [...e, s], C = r.getState().getNestedState(t, O);
        return l(C, O, m);
      }
    }, j = new Proxy(V, A);
    return g.set(h, {
      proxy: j,
      stateVersion: w
    }), j;
  }
  return l(
    r.getState().getNestedState(t, [])
  );
}
function tt(t) {
  return Q(xt, { proxy: t });
}
function jt({
  proxy: t,
  rebuildStateShape: a
}) {
  const S = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(S) ? a(
    S,
    t._path
  ).stateMapNoRender(
    (g, w, _, v, l) => t._mapFn(g, w, _, v, l)
  ) : null;
}
function xt({
  proxy: t
}) {
  const a = J(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return nt(() => {
    const y = a.current;
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
    r.getState().addSignalElement(S, f);
    const e = r.getState().getNestedState(t._stateKey, t._path);
    let m;
    if (t._effect)
      try {
        m = new Function(
          "state",
          `return (${t._effect})(state)`
        )(e);
      } catch (V) {
        console.error("Error evaluating effect function during mount:", V), m = e;
      }
    else
      m = e;
    m !== null && typeof m == "object" && (m = JSON.stringify(m));
    const h = document.createTextNode(String(m));
    y.replaceWith(h);
  }, [t._stateKey, t._path.join("."), t._effect]), Q("span", {
    ref: a,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function Jt(t) {
  const a = Et(
    (S) => {
      const y = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return y.components.set(t._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => y.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return Q("text", {}, String(a));
}
export {
  tt as $cogsSignal,
  Jt as $cogsSignalStore,
  qt as addStateOptions,
  zt as createCogsState,
  Bt as notifyComponent,
  bt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
