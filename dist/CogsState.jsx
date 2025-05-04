"use client";
import { jsx as ct } from "react/jsx-runtime";
import { useState as et, useRef as Z, useEffect as nt, useLayoutEffect as It, useMemo as _t, createElement as Q, useSyncExternalStore as Et, startTransition as H } from "react";
import { transformStateFunc as $t, isFunction as L, getNestedValue as U, isDeepEqual as M, debounce as wt } from "./utility.js";
import { pushFunc as K, updateFn as B, cutFunc as J, ValidationWrapper as Nt, FormControlComponent as Vt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as lt } from "./store.js";
import { useCogsConfig as At } from "./CogsStateClient.jsx";
import rt from "./node_modules/uuid/dist/esm-browser/v4.js";
function dt(t, i) {
  const S = r.getState().getInitialOptions, y = r.getState().setInitialStateOptions, d = S(t) || {};
  y(t, {
    ...d,
    ...i
  });
}
function ut({
  stateKey: t,
  options: i,
  initialOptionsPart: S
}) {
  const y = q(t) || {}, d = S[t] || {}, $ = r.getState().setInitialStateOptions, _ = { ...d, ...y };
  let v = !1;
  if (i)
    for (const l in i)
      _.hasOwnProperty(l) ? l == "localStorage" && i[l] && _[l].key !== i[l]?.key && (v = !0, _[l] = i[l]) : (v = !0, _[l] = i[l]);
  console.log("existingOptions", _, i, S), v && $(t, _);
}
function qt(t, { formElements: i, validation: S }) {
  return { initialState: t, formElements: i, validation: S };
}
const zt = (t, i) => {
  let S = t;
  const [y, d] = $t(S);
  (Object.keys(d).length > 0 || i && Object.keys(i).length > 0) && Object.keys(d).forEach((v) => {
    d[v] = d[v] || {}, d[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...d[v].formElements || {}
      // State-specific overrides
    };
    const l = q(v);
    console.log("existingOptions", l, d[v]), l || r.getState().setInitialStateOptions(v, d[v]);
  }), r.getState().setInitialStates(y);
  const $ = (v, l) => {
    const [f] = et(l?.componentId ?? rt());
    ut({
      stateKey: v,
      options: l,
      initialOptionsPart: d
    });
    const e = r.getState().cogsStateStore[v] || y[v], m = l?.modifyState ? l.modifyState(e) : e, [C, A] = Ot(
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
    return A;
  };
  function _(v, l) {
    ut({ stateKey: v, options: l, initialOptionsPart: d });
  }
  return { useCogsState: $, setCogsOptions: _ };
}, {
  setUpdaterState: Y,
  setState: D,
  getInitialOptions: q,
  getKeyState: gt,
  getValidationErrors: xt,
  setStateLog: ht,
  updateInitialStateGlobal: ot,
  addValidationError: pt,
  removeValidationError: P,
  setServerSyncActions: Ct
} = r.getState(), ft = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Tt = (t, i, S, y) => {
  S?.log && console.log(
    "saving to localstorage",
    i,
    S.localStorage?.key,
    y
  );
  const d = L(S?.localStorage?.key) ? S.localStorage?.key(t) : S?.localStorage?.key;
  if (d && y) {
    const $ = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, _ = `${y}-${i}-${d}`;
    window.localStorage.setItem(_, JSON.stringify($));
  }
}, kt = (t, i, S, y, d, $) => {
  const _ = {
    initialState: i,
    updaterState: X(
      t,
      y,
      d,
      $
    ),
    state: S
  };
  H(() => {
    ot(t, _.initialState), Y(t, _.updaterState), D(t, _.state);
  });
}, St = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const S = /* @__PURE__ */ new Set();
  i.components.forEach((y) => {
    S.add(() => y.forceUpdate());
  }), queueMicrotask(() => {
    H(() => {
      S.forEach((y) => y());
    });
  });
}, Bt = (t, i) => {
  const S = r.getState().stateComponents.get(t);
  if (S) {
    const y = `${t}////${i}`, d = S.components.get(y);
    d && d.forceUpdate();
  }
};
function Ot(t, {
  stateKey: i,
  serverSync: S,
  localStorage: y,
  formElements: d,
  middleware: $,
  reactiveDeps: _,
  reactiveType: v,
  componentId: l,
  initialState: f,
  syncUpdate: e,
  dependencies: m
} = {}) {
  const [C, A] = et({}), { sessionId: T } = At();
  let R = !i;
  const [g] = et(i ?? rt()), s = r.getState().stateLog[g], G = Z(/* @__PURE__ */ new Set()), b = Z(l ?? rt()), h = Z(null);
  h.current = q(g), nt(() => {
    if (e && e.stateKey === g && e.path?.[0]) {
      D(g, (o) => ({
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
    dt(g, {
      initialState: f
    });
    const c = h.current;
    let o = null;
    c?.log && console.log("newoptions", c);
    const u = L(c?.localStorage?.key) ? c?.localStorage?.key(f) : c?.localStorage?.key;
    u && T && (o = ft(
      T + "-" + g + "-" + u
    ));
    let E = null;
    f && (E = f, o && o.lastUpdated > (o.lastSyncedWithServer || 0) && (E = o.state), kt(
      g,
      f,
      E,
      n,
      b.current,
      T
    ), St(g), A({}));
  }, [f, ...m || []]), It(() => {
    R && dt(g, {
      serverSync: S,
      formElements: d,
      initialState: f,
      localStorage: y,
      middleware: $
    });
    const c = `${g}////${b.current}`, o = r.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(c, {
      forceUpdate: () => A({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: v ?? ["component", "deps"]
    }), r.getState().stateComponents.set(g, o), A({}), () => {
      const u = `${g}////${b.current}`;
      o && (o.components.delete(u), o.components.size === 0 && r.getState().stateComponents.delete(g));
    };
  }, []);
  const n = (c, o, u, E) => {
    if (Array.isArray(o)) {
      const k = `${g}-${o.join(".")}`;
      G.current.add(k);
    }
    D(g, (k) => {
      const N = L(c) ? c(k) : c, j = `${g}-${o.join(".")}`;
      if (j) {
        let F = !1, I = r.getState().signalDomElements.get(j);
        if ((!I || I.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const V = o.slice(0, -1), x = U(N, V);
          if (Array.isArray(x)) {
            F = !0;
            const w = `${g}-${V.join(".")}`;
            I = r.getState().signalDomElements.get(w);
          }
        }
        if (I) {
          const V = F ? U(N, o.slice(0, -1)) : U(N, o);
          I.forEach(({ parentId: x, position: w, effect: W }) => {
            const O = document.querySelector(
              `[data-parent-id="${x}"]`
            );
            if (O) {
              const st = Array.from(O.childNodes);
              if (st[w]) {
                const vt = W ? new Function("state", `return (${W})(state)`)(V) : V;
                st[w].textContent = String(vt);
              }
            }
          });
        }
      }
      u.updateType === "update" && (E || h.current?.validationKey) && o && P(
        (E || h.current?.validationKey) + "." + o.join(".")
      );
      const p = o.slice(0, o.length - 1);
      u.updateType === "cut" && h.current?.validationKey && P(
        h.current?.validationKey + "." + p.join(".")
      ), u.updateType === "insert" && h.current?.validationKey && xt(
        h.current?.validationKey + "." + p.join(".")
      ).filter(([I, V]) => {
        let x = I?.split(".").length;
        if (I == p.join(".") && x == p.length - 1) {
          let w = I + "." + p;
          P(I), pt(w, V);
        }
      });
      const z = U(k, o), mt = U(N, o), yt = u.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), at = r.getState().stateComponents.get(g);
      if (at)
        for (const [F, I] of at.components.entries()) {
          let V = !1;
          const x = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (!x.includes("none")) {
            if (x.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if (x.includes("component") && I.paths && (I.paths.has(yt) || I.paths.has("")) && (V = !0), !V && x.includes("deps") && I.depsFunction) {
              const w = I.depsFunction(N);
              typeof w == "boolean" ? w && (V = !0) : M(I.deps, w) || (I.deps = w, V = !0);
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
        newValue: mt
      };
      if (ht(g, (F) => {
        const V = [...F ?? [], it].reduce((x, w) => {
          const W = `${w.stateKey}:${JSON.stringify(w.path)}`, O = x.get(W);
          return O ? (O.timeStamp = Math.max(O.timeStamp, w.timeStamp), O.newValue = w.newValue, O.oldValue = O.oldValue ?? w.oldValue, O.updateType = w.updateType) : x.set(W, { ...w }), x;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), Tt(
        N,
        g,
        h.current,
        T
      ), $ && $({
        updateLog: s,
        update: it
      }), h.current?.serverSync) {
        const F = r.getState().serverState[g], I = h.current?.serverSync;
        Ct(g, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: N }),
          rollBackState: F,
          actionTimeStamp: Date.now() + (I.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return N;
    });
  };
  r.getState().updaterState[g] || (Y(
    g,
    X(
      g,
      n,
      b.current,
      T
    )
  ), r.getState().cogsStateStore[g] || D(g, t), r.getState().initialStateGlobal[g] || ot(g, t));
  const a = _t(() => X(
    g,
    n,
    b.current,
    T
  ), [g]);
  return [gt(g), a];
}
function X(t, i, S, y) {
  const d = /* @__PURE__ */ new Map();
  let $ = 0;
  const _ = (f) => {
    const e = f.join(".");
    for (const [m] of d)
      (m === e || m.startsWith(e + ".")) && d.delete(m);
    $++;
  }, v = {
    removeValidation: (f) => {
      f?.validationKey && P(f.validationKey);
    },
    revertToInitialState: (f) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && P(e?.key), f?.validationKey && P(f.validationKey);
      const m = r.getState().initialStateGlobal[t];
      d.clear(), $++;
      const C = l(m, []), A = q(t), T = L(A?.localStorage?.key) ? A?.localStorage?.key(m) : A?.localStorage?.key, R = `${y}-${t}-${T}`;
      return R && localStorage.removeItem(R), H(() => {
        Y(t, C), D(t, m);
        const g = r.getState().stateComponents.get(t);
        g && g.components.forEach((s) => {
          s.forceUpdate();
        });
      }), m;
    },
    updateInitialState: (f) => {
      d.clear(), $++;
      const e = X(
        t,
        i,
        S,
        y
      );
      return H(() => {
        ot(t, f), Y(t, e), D(t, f);
        const m = r.getState().stateComponents.get(t);
        m && m.components.forEach((C) => {
          C.forceUpdate();
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
  function l(f, e = [], m) {
    const C = e.map(String).join(".");
    d.get(C);
    const A = function() {
      return r().getNestedState(t, e);
    };
    Object.keys(v).forEach((g) => {
      A[g] = v[g];
    });
    const T = {
      apply(g, s, G) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${e.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, e);
      },
      get(g, s) {
        if (s !== "then" && !s.startsWith("$") && s !== "stateMapNoRender") {
          const n = e.join("."), a = `${t}////${S}`, c = r.getState().stateComponents.get(t);
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
                  m
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
              return d.clear(), $++, l(o, e, {
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
              ), c = a ? f : r.getState().getNestedState(t, e);
              return s !== "stateMapNoRender" && (d.clear(), $++), c.map((o, u) => {
                const E = a && o.__origIndex ? o.__origIndex : u, k = l(
                  o,
                  [...e, E.toString()],
                  m
                );
                return n(
                  o,
                  k,
                  u,
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
                (u) => u.join(".") === e.join(".")
              ) ? f : r.getState().getNestedState(t, e);
              d.clear(), $++;
              const o = c.flatMap(
                (u, E) => u[n] ?? []
              );
              return l(
                o,
                [...e, "[*]", n],
                m
              );
            };
          if (s === "findWith")
            return (n, a) => {
              const c = f.findIndex(
                (E) => E[n] === a
              );
              if (c === -1) return;
              const o = f[c], u = [...e, c.toString()];
              return d.clear(), $++, d.clear(), $++, l(o, u);
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
              let E = null;
              if (!o.some((N) => {
                if (a) {
                  const p = a.every(
                    (z) => M(N[z], u[z])
                  );
                  return p && (E = N), p;
                }
                const j = M(N, u);
                return j && (E = N), j;
              }))
                _(e), K(i, u, e, t);
              else if (c && E) {
                const N = c(E), j = o.map(
                  (p) => M(p, E) ? N : p
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
              return d.clear(), $++, l(o, e, {
                filtered: [...m?.filtered || [], e],
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
          return (n) => ft(y + "-" + t + "-" + n);
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
                return u.success ? !0 : (u.error.errors.forEach((k) => {
                  const N = k.path, j = k.message, p = [n.key, ...N].join(".");
                  a(p, j);
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
            hideMessage: a
          }) => /* @__PURE__ */ ct(
            Nt,
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
        if (s === "_isServerSynced") return v._isServerSynced;
        if (s === "update")
          return (n, a) => {
            if (a?.debounce)
              wt(() => {
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
          return (n, a) => /* @__PURE__ */ ct(
            Vt,
            {
              setState: i,
              stateKey: t,
              path: e,
              child: n,
              formOpts: a
            }
          );
        const b = [...e, s], h = r.getState().getNestedState(t, b);
        return l(h, b, m);
      }
    }, R = new Proxy(A, T);
    return d.set(C, {
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
  const S = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(S) ? i(
    S,
    t._path
  ).stateMapNoRender(
    (d, $, _, v, l) => t._mapFn(d, $, _, v, l)
  ) : null;
}
function bt({
  proxy: t
}) {
  const i = Z(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return nt(() => {
    const y = i.current;
    if (!y || !y.parentElement) return;
    const d = y.parentElement, _ = Array.from(d.childNodes).indexOf(y);
    let v = d.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", v));
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
      } catch (A) {
        console.error("Error evaluating effect function during mount:", A), m = e;
      }
    else
      m = e;
    m !== null && typeof m == "object" && (m = JSON.stringify(m));
    const C = document.createTextNode(String(m));
    y.replaceWith(C);
  }, [t._stateKey, t._path.join("."), t._effect]), Q("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function Jt(t) {
  const i = Et(
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
