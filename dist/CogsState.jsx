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
  const m = r.getState().getInitialOptions, y = r.getState().setInitialStateOptions, u = m(t) || {};
  y(t, {
    ...u,
    ...i
  });
}
function ut({
  stateKey: t,
  options: i,
  initialOptionsPart: m
}) {
  const y = q(t) || {}, u = m[t] || {}, $ = r.getState().setInitialStateOptions, E = { ...u, ...y };
  let v = !1;
  if (i)
    for (const l in i)
      E.hasOwnProperty(l) ? l == "localStorage" && i[l] && E[l].key !== i[l]?.key && (v = !0, E[l] = i[l]) : (v = !0, E[l] = i[l]);
  v && $(t, E);
}
function qt(t, { formElements: i, validation: m }) {
  return { initialState: t, formElements: i, validation: m };
}
const zt = (t, i) => {
  let m = t;
  const [y, u] = $t(m);
  (Object.keys(u).length > 0 || i && Object.keys(i).length > 0) && Object.keys(u).forEach((v) => {
    u[v] = u[v] || {}, u[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...u[v].formElements || {}
      // State-specific overrides
    }, q(v) || r.getState().setInitialStateOptions(v, u[v]);
  }), r.getState().setInitialStates(y);
  const $ = (v, l) => {
    const [f] = et(l?.componentId ?? rt());
    ut({
      stateKey: v,
      options: l,
      initialOptionsPart: u
    });
    const e = r.getState().cogsStateStore[v] || y[v], S = l?.modifyState ? l.modifyState(e) : e, [x, A] = Ot(
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
    return A;
  };
  function E(v, l) {
    ut({ stateKey: v, options: l, initialOptionsPart: u });
  }
  return { useCogsState: $, setCogsOptions: E };
}, {
  setUpdaterState: Y,
  setState: D,
  getInitialOptions: q,
  getKeyState: gt,
  getValidationErrors: ht,
  setStateLog: Ct,
  updateInitialStateGlobal: ot,
  addValidationError: kt,
  removeValidationError: P,
  setServerSyncActions: pt
} = r.getState(), ft = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, xt = (t, i, m, y) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    y
  );
  const u = L(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (u && y) {
    const $ = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, E = `${y}-${i}-${u}`;
    window.localStorage.setItem(E, JSON.stringify($));
  }
}, Tt = (t, i, m, y, u, $) => {
  const E = {
    initialState: i,
    updaterState: X(
      t,
      y,
      u,
      $
    ),
    state: m
  };
  H(() => {
    ot(t, E.initialState), Y(t, E.updaterState), D(t, E.state);
  });
}, St = (t) => {
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
    const y = `${t}////${i}`, u = m.components.get(y);
    u && u.forceUpdate();
  }
};
function Ot(t, {
  stateKey: i,
  serverSync: m,
  localStorage: y,
  formElements: u,
  middleware: $,
  reactiveDeps: E,
  reactiveType: v,
  componentId: l,
  initialState: f,
  syncUpdate: e,
  dependencies: S
} = {}) {
  const [x, A] = et({}), { sessionId: T } = At();
  let R = !i;
  const [g] = et(i ?? rt()), s = r.getState().stateLog[g], G = Z(/* @__PURE__ */ new Set()), b = Z(l ?? rt()), C = Z(null);
  C.current = q(g), nt(() => {
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
    const c = C.current;
    let o = null;
    const d = L(c?.localStorage?.key) ? c?.localStorage?.key(f) : c?.localStorage?.key;
    c?.log && (console.log("newoptions", c), console.log("localkey", d), console.log("initialState", f)), d && T && (o = ft(
      T + "-" + g + "-" + d
    ));
    let _ = null, k = !1;
    f && (_ = f), o && o.lastUpdated > (o.lastSyncedWithServer || 0) && (_ = o.state, k = !0), _ && (Tt(
      g,
      f,
      _,
      n,
      b.current,
      T
    ), k && c?.localStorage?.onChange && c?.localStorage?.onChange(_), St(g), A({}));
  }, [f, ...S || []]), It(() => {
    R && dt(g, {
      serverSync: m,
      formElements: u,
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
      depsFunction: E || void 0,
      reactiveType: v ?? ["component", "deps"]
    }), r.getState().stateComponents.set(g, o), A({}), () => {
      const d = `${g}////${b.current}`;
      o && (o.components.delete(d), o.components.size === 0 && r.getState().stateComponents.delete(g));
    };
  }, []);
  const n = (c, o, d, _) => {
    if (Array.isArray(o)) {
      const k = `${g}-${o.join(".")}`;
      G.current.add(k);
    }
    D(g, (k) => {
      const N = L(c) ? c(k) : c, j = `${g}-${o.join(".")}`;
      if (j) {
        let F = !1, I = r.getState().signalDomElements.get(j);
        if ((!I || I.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const V = o.slice(0, -1), h = U(N, V);
          if (Array.isArray(h)) {
            F = !0;
            const w = `${g}-${V.join(".")}`;
            I = r.getState().signalDomElements.get(w);
          }
        }
        if (I) {
          const V = F ? U(N, o.slice(0, -1)) : U(N, o);
          I.forEach(({ parentId: h, position: w, effect: W }) => {
            const O = document.querySelector(
              `[data-parent-id="${h}"]`
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
      d.updateType === "update" && (_ || C.current?.validationKey) && o && P(
        (_ || C.current?.validationKey) + "." + o.join(".")
      );
      const p = o.slice(0, o.length - 1);
      d.updateType === "cut" && C.current?.validationKey && P(
        C.current?.validationKey + "." + p.join(".")
      ), d.updateType === "insert" && C.current?.validationKey && ht(
        C.current?.validationKey + "." + p.join(".")
      ).filter(([I, V]) => {
        let h = I?.split(".").length;
        if (I == p.join(".") && h == p.length - 1) {
          let w = I + "." + p;
          P(I), kt(w, V);
        }
      });
      const z = U(k, o), mt = U(N, o), yt = d.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), at = r.getState().stateComponents.get(g);
      if (at)
        for (const [F, I] of at.components.entries()) {
          let V = !1;
          const h = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (!h.includes("none")) {
            if (h.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if (h.includes("component") && I.paths && (I.paths.has(yt) || I.paths.has("")) && (V = !0), !V && h.includes("deps") && I.depsFunction) {
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
        updateType: d.updateType,
        status: "new",
        oldValue: z,
        newValue: mt
      };
      if (Ct(g, (F) => {
        const V = [...F ?? [], it].reduce((h, w) => {
          const W = `${w.stateKey}:${JSON.stringify(w.path)}`, O = h.get(W);
          return O ? (O.timeStamp = Math.max(O.timeStamp, w.timeStamp), O.newValue = w.newValue, O.oldValue = O.oldValue ?? w.oldValue, O.updateType = w.updateType) : h.set(W, { ...w }), h;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), xt(
        N,
        g,
        C.current,
        T
      ), $ && $({
        updateLog: s,
        update: it
      }), C.current?.serverSync) {
        const F = r.getState().serverState[g], I = C.current?.serverSync;
        pt(g, {
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
function X(t, i, m, y) {
  const u = /* @__PURE__ */ new Map();
  let $ = 0;
  const E = (f) => {
    const e = f.join(".");
    for (const [S] of u)
      (S === e || S.startsWith(e + ".")) && u.delete(S);
    $++;
  }, v = {
    removeValidation: (f) => {
      f?.validationKey && P(f.validationKey);
    },
    revertToInitialState: (f) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && P(e?.key), f?.validationKey && P(f.validationKey);
      const S = r.getState().initialStateGlobal[t];
      u.clear(), $++;
      const x = l(S, []), A = q(t), T = L(A?.localStorage?.key) ? A?.localStorage?.key(S) : A?.localStorage?.key, R = `${y}-${t}-${T}`;
      return R && localStorage.removeItem(R), H(() => {
        Y(t, x), D(t, S);
        const g = r.getState().stateComponents.get(t);
        g && g.components.forEach((s) => {
          s.forceUpdate();
        });
      }), S;
    },
    updateInitialState: (f) => {
      u.clear(), $++;
      const e = X(
        t,
        i,
        m,
        y
      );
      return H(() => {
        ot(t, f), Y(t, e), D(t, f);
        const S = r.getState().stateComponents.get(t);
        S && S.components.forEach((x) => {
          x.forceUpdate();
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
      return !!(f && M(f, gt(t)));
    }
  };
  function l(f, e = [], S) {
    const x = e.map(String).join(".");
    u.get(x);
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
              const o = [...r.getState().getNestedState(t, e).map((d, _) => ({
                ...d,
                __origIndex: _.toString()
              }))].sort(n);
              return u.clear(), $++, l(o, e, {
                filtered: [...S?.filtered || [], e],
                validIndices: o.map(
                  (d) => parseInt(d.__origIndex)
                )
              });
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const a = S?.filtered?.some(
                (o) => o.join(".") === e.join(".")
              ), c = a ? f : r.getState().getNestedState(t, e);
              return s !== "stateMapNoRender" && (u.clear(), $++), c.map((o, d) => {
                const _ = a && o.__origIndex ? o.__origIndex : d, k = l(
                  o,
                  [...e, _.toString()],
                  S
                );
                return n(
                  o,
                  k,
                  d,
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
                (d) => d.join(".") === e.join(".")
              ) ? f : r.getState().getNestedState(t, e);
              u.clear(), $++;
              const o = c.flatMap(
                (d, _) => d[n] ?? []
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
                (_) => _[n] === a
              );
              if (c === -1) return;
              const o = f[c], d = [...e, c.toString()];
              return u.clear(), $++, u.clear(), $++, l(o, d);
            };
          if (s === "index")
            return (n) => {
              const a = f[n];
              return l(a, [...e, n.toString()]);
            };
          if (s === "insert")
            return (n) => (E(e), K(i, n, e, t), l(
              r.getState().cogsStateStore[t],
              []
            ));
          if (s === "uniqueInsert")
            return (n, a, c) => {
              const o = r.getState().getNestedState(t, e), d = L(n) ? n(o) : n;
              let _ = null;
              if (!o.some((N) => {
                if (a) {
                  const p = a.every(
                    (z) => M(N[z], d[z])
                  );
                  return p && (_ = N), p;
                }
                const j = M(N, d);
                return j && (_ = N), j;
              }))
                E(e), K(i, d, e, t);
              else if (c && _) {
                const N = c(_), j = o.map(
                  (p) => M(p, _) ? N : p
                );
                E(e), B(i, j, e);
              }
            };
          if (s === "cut")
            return (n, a) => {
              a?.waitForSync || (E(e), J(i, e, t, n));
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
              const a = f.map((d, _) => ({
                ...d,
                __origIndex: _.toString()
              })), c = [], o = [];
              for (let d = 0; d < a.length; d++)
                n(a[d], d) && (c.push(d), o.push(a[d]));
              return u.clear(), $++, l(o, e, {
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
          return (n) => ft(y + "-" + t + "-" + n);
        if (s === "_selected") {
          const n = e.slice(0, -1), a = n.join("."), c = r.getState().getNestedState(t, n);
          return Array.isArray(c) ? Number(e[e.length - 1]) === r.getState().getSelectedIndex(t, a) : void 0;
        }
        if (s === "setSelected")
          return (n) => {
            const a = e.slice(0, -1), c = Number(e[e.length - 1]), o = a.join(".");
            n ? r.getState().setSelectedIndex(t, o, c) : r.getState().setSelectedIndex(t, o, void 0);
            const d = r.getState().getNestedState(t, [...a]);
            B(i, d, a), E(a);
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
                o && o.length > 0 && o.forEach(([_]) => {
                  _ && _.startsWith(n.key) && P(_);
                });
                const d = n.zodSchema.safeParse(c);
                return d.success ? !0 : (d.error.errors.forEach((k) => {
                  const N = k.path, j = k.message, p = [n.key, ...N].join(".");
                  a(p, j);
                }), St(t), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (s === "_componentId") return m;
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
            E(e);
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
        const b = [...e, s], C = r.getState().getNestedState(t, b);
        return l(C, b, S);
      }
    }, R = new Proxy(A, T);
    return u.set(x, {
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
    (u, $, E, v, l) => t._mapFn(u, $, E, v, l)
  ) : null;
}
function bt({
  proxy: t
}) {
  const i = Z(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return nt(() => {
    const y = i.current;
    if (!y || !y.parentElement) return;
    const u = y.parentElement, E = Array.from(u.childNodes).indexOf(y);
    let v = u.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", v));
    const f = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: E,
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
      } catch (A) {
        console.error("Error evaluating effect function during mount:", A), S = e;
      }
    else
      S = e;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const x = document.createTextNode(String(S));
    y.replaceWith(x);
  }, [t._stateKey, t._path.join("."), t._effect]), Q("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function Jt(t) {
  const i = Et(
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
