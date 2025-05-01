"use client";
import { jsx as ct } from "react/jsx-runtime";
import { useState as et, useRef as Z, useEffect as nt, useLayoutEffect as It, useMemo as _t, createElement as Q, useSyncExternalStore as Et, startTransition as H } from "react";
import { transformStateFunc as $t, isFunction as G, getNestedValue as U, isDeepEqual as M, debounce as wt } from "./utility.js";
import { pushFunc as K, updateFn as B, cutFunc as J, ValidationWrapper as Nt, FormControlComponent as Vt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as lt } from "./store.js";
import { useCogsConfig as At } from "./CogsStateClient.jsx";
import rt from "./node_modules/uuid/dist/esm-browser/v4.js";
function dt(t, i) {
  const S = r.getState().getInitialOptions, m = r.getState().setInitialStateOptions, g = S(t) || {};
  m(t, {
    ...g,
    ...i
  });
}
function ut({
  stateKey: t,
  options: i,
  initialOptionsPart: S
}) {
  const m = q(t) || {}, g = S[t] || {}, $ = r.getState().setInitialStateOptions, _ = { ...g, ...m };
  let v = !1;
  if (i)
    for (const d in i)
      _.hasOwnProperty(d) ? d == "localStorage" && i[d] && _[d].key !== i[d]?.key && (v = !0, _[d] = i[d]) : (v = !0, _[d] = i[d]);
  v && $(t, _);
}
function qt(t, { formElements: i, validation: S }) {
  return { initialState: t, formElements: i, validation: S };
}
const zt = (t, i) => {
  let S = t;
  const [m, g] = $t(S);
  (i?.formElements || i?.validation) && Object.keys(g).forEach((v) => {
    g[v] = g[v] || {}, g[v].formElements = {
      ...i.formElements,
      // Global defaults first
      ...i?.validation,
      ...g[v].formElements || {}
      // State-specific overrides
    };
  }), r.getState().setInitialStates(m);
  const $ = (v, d) => {
    const [f] = et(d?.componentId ?? rt());
    ut({
      stateKey: v,
      options: d,
      initialOptionsPart: g
    });
    const e = r.getState().cogsStateStore[v] || m[v], y = d?.modifyState ? d.modifyState(e) : e, [b, N] = Ft(
      y,
      {
        stateKey: v,
        syncUpdate: d?.syncUpdate,
        componentId: f,
        localStorage: d?.localStorage,
        middleware: d?.middleware,
        enabledSync: d?.enabledSync,
        reactiveType: d?.reactiveType,
        reactiveDeps: d?.reactiveDeps,
        initialState: d?.initialState,
        dependencies: d?.dependencies
      }
    );
    return N;
  };
  function _(v, d) {
    ut({ stateKey: v, options: d, initialOptionsPart: g });
  }
  return { useCogsState: $, setCogsOptions: _ };
}, {
  setUpdaterState: Y,
  setState: L,
  getInitialOptions: q,
  getKeyState: gt,
  getValidationErrors: kt,
  setStateLog: pt,
  updateInitialStateGlobal: ot,
  addValidationError: Ct,
  removeValidationError: R,
  setServerSyncActions: Tt
} = r.getState(), ft = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, ht = (t, i, S, m) => {
  S.log && console.log(
    "saving to localstorage",
    i,
    S.localStorage?.key,
    m
  );
  const g = G(S.localStorage?.key) ? S.localStorage?.key(t) : S.localStorage?.key;
  if (g && m) {
    const $ = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, _ = `${m}-${i}-${g}`;
    window.localStorage.setItem(_, JSON.stringify($));
  }
}, bt = (t, i, S, m, g, $) => {
  const _ = {
    initialState: i,
    updaterState: X(
      t,
      m,
      g,
      $
    ),
    state: S
  };
  H(() => {
    ot(t, _.initialState), Y(t, _.updaterState), L(t, _.state);
  });
}, St = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const S = /* @__PURE__ */ new Set();
  i.components.forEach((m) => {
    S.add(() => m.forceUpdate());
  }), queueMicrotask(() => {
    H(() => {
      S.forEach((m) => m());
    });
  });
}, Bt = (t, i) => {
  const S = r.getState().stateComponents.get(t);
  if (S) {
    const m = `${t}////${i}`, g = S.components.get(m);
    g && g.forceUpdate();
  }
};
function Ft(t, {
  stateKey: i,
  serverSync: S,
  localStorage: m,
  formElements: g,
  middleware: $,
  reactiveDeps: _,
  reactiveType: v,
  componentId: d,
  initialState: f,
  syncUpdate: e,
  dependencies: y
} = {}) {
  const [b, N] = et({}), { sessionId: p } = At();
  let h = !i;
  const [l] = et(i ?? rt()), s = r.getState().stateLog[l], D = Z(/* @__PURE__ */ new Set()), x = Z(d ?? rt()), C = Z(null);
  C.current = q(l), nt(() => {
    if (e && e.stateKey === l && e.path?.[0]) {
      L(l, (o) => ({
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
    dt(l, {
      initialState: f
    });
    const c = C.current;
    let o = null;
    c.log && console.log("newoptions", c);
    const u = G(c.localStorage?.key) ? c.localStorage?.key(f) : c.localStorage?.key;
    u && p && (o = ft(
      p + "-" + l + "-" + u
    ));
    let E = null;
    f && (E = f, o && o.lastUpdated > (o.lastSyncedWithServer || 0) && (E = o.state), bt(
      l,
      f,
      E,
      n,
      x.current,
      p
    ), St(l), N({}));
  }, [f, ...y || []]), It(() => {
    h && dt(l, {
      serverSync: S,
      formElements: g,
      initialState: f,
      localStorage: m,
      middleware: $
    });
    const c = `${l}////${x.current}`, o = r.getState().stateComponents.get(l) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(c, {
      forceUpdate: () => N({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: v ?? ["component", "deps"]
    }), r.getState().stateComponents.set(l, o), N({}), () => {
      const u = `${l}////${x.current}`;
      o && (o.components.delete(u), o.components.size === 0 && r.getState().stateComponents.delete(l));
    };
  }, []);
  const n = (c, o, u, E) => {
    if (Array.isArray(o)) {
      const F = `${l}-${o.join(".")}`;
      D.current.add(F);
    }
    L(l, (F) => {
      const V = G(c) ? c(F) : c, O = `${l}-${o.join(".")}`;
      if (O) {
        let P = !1, I = r.getState().signalDomElements.get(O);
        if ((!I || I.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const A = o.slice(0, -1), k = U(V, A);
          if (Array.isArray(k)) {
            P = !0;
            const w = `${l}-${A.join(".")}`;
            I = r.getState().signalDomElements.get(w);
          }
        }
        if (I) {
          const A = P ? U(V, o.slice(0, -1)) : U(V, o);
          I.forEach(({ parentId: k, position: w, effect: W }) => {
            const j = document.querySelector(
              `[data-parent-id="${k}"]`
            );
            if (j) {
              const st = Array.from(j.childNodes);
              if (st[w]) {
                const vt = W ? new Function("state", `return (${W})(state)`)(A) : A;
                st[w].textContent = String(vt);
              }
            }
          });
        }
      }
      u.updateType === "update" && (E || C.current?.validationKey) && o && R(
        (E || C.current?.validationKey) + "." + o.join(".")
      );
      const T = o.slice(0, o.length - 1);
      u.updateType === "cut" && C.current?.validationKey && R(
        C.current?.validationKey + "." + T.join(".")
      ), u.updateType === "insert" && C.current?.validationKey && kt(
        C.current?.validationKey + "." + T.join(".")
      ).filter(([I, A]) => {
        let k = I?.split(".").length;
        if (I == T.join(".") && k == T.length - 1) {
          let w = I + "." + T;
          R(I), Ct(w, A);
        }
      });
      const z = U(F, o), mt = U(V, o), yt = u.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), at = r.getState().stateComponents.get(l);
      if (at)
        for (const [P, I] of at.components.entries()) {
          let A = !1;
          const k = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (!k.includes("none")) {
            if (k.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if (k.includes("component") && I.paths && (I.paths.has(yt) || I.paths.has("")) && (A = !0), !A && k.includes("deps") && I.depsFunction) {
              const w = I.depsFunction(V);
              typeof w == "boolean" ? w && (A = !0) : M(I.deps, w) || (I.deps = w, A = !0);
            }
            A && I.forceUpdate();
          }
        }
      const it = {
        timeStamp: Date.now(),
        stateKey: l,
        path: o,
        updateType: u.updateType,
        status: "new",
        oldValue: z,
        newValue: mt
      };
      if (pt(l, (P) => {
        const A = [...P ?? [], it].reduce((k, w) => {
          const W = `${w.stateKey}:${JSON.stringify(w.path)}`, j = k.get(W);
          return j ? (j.timeStamp = Math.max(j.timeStamp, w.timeStamp), j.newValue = w.newValue, j.oldValue = j.oldValue ?? w.oldValue, j.updateType = w.updateType) : k.set(W, { ...w }), k;
        }, /* @__PURE__ */ new Map());
        return Array.from(A.values());
      }), ht(
        V,
        l,
        C.current,
        p
      ), $ && $({
        updateLog: s,
        update: it
      }), C.current?.serverSync) {
        const P = r.getState().serverState[l], I = C.current?.serverSync;
        Tt(l, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: V }),
          rollBackState: P,
          actionTimeStamp: Date.now() + (I.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return V;
    });
  };
  r.getState().updaterState[l] || (Y(
    l,
    X(
      l,
      n,
      x.current,
      p
    )
  ), r.getState().cogsStateStore[l] || L(l, t), r.getState().initialStateGlobal[l] || ot(l, t));
  const a = _t(() => X(
    l,
    n,
    x.current,
    p
  ), [l]);
  return [gt(l), a];
}
function X(t, i, S, m) {
  const g = /* @__PURE__ */ new Map();
  let $ = 0;
  const _ = (f) => {
    const e = f.join(".");
    for (const [y] of g)
      (y === e || y.startsWith(e + ".")) && g.delete(y);
    $++;
  }, v = {
    removeValidation: (f) => {
      f?.validationKey && R(f.validationKey);
    },
    revertToInitialState: (f) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && R(e?.key), f?.validationKey && R(f.validationKey);
      const y = r.getState().initialStateGlobal[t];
      g.clear(), $++;
      const b = d(y, []), N = q(t), p = G(N?.localStorage?.key) ? N?.localStorage?.key(y) : N?.localStorage?.key, h = `${m}-${t}-${p}`;
      return h && localStorage.removeItem(h), H(() => {
        Y(t, b), L(t, y);
        const l = r.getState().stateComponents.get(t);
        l && l.components.forEach((s) => {
          s.forceUpdate();
        });
      }), y;
    },
    updateInitialState: (f) => {
      g.clear(), $++;
      const e = r.getState().initialStateGlobal[t], y = q(t), b = G(y?.localStorage?.key) ? y?.localStorage?.key(e) : y?.localStorage?.key, N = `${m}-${t}-${b}`;
      N && localStorage.removeItem(N);
      const p = X(
        t,
        i,
        S,
        m
      );
      return H(() => {
        ot(t, f), Y(t, p), L(t, f);
        const h = r.getState().stateComponents.get(t);
        h && h.components.forEach((l) => {
          l.forceUpdate();
        });
      }), {
        fetchId: (h) => p.get()[h]
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
  function d(f, e = [], y) {
    const b = e.map(String).join(".");
    g.get(b);
    const N = function() {
      return r().getNestedState(t, e);
    };
    Object.keys(v).forEach((l) => {
      N[l] = v[l];
    });
    const p = {
      apply(l, s, D) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${e.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, e);
      },
      get(l, s) {
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
            const n = r.getState().initialStateGlobal[t], a = q(t), c = G(a?.localStorage?.key) ? a?.localStorage?.key(n) : a?.localStorage?.key, o = `${m}-${t}-${c}`;
            o && localStorage.removeItem(o);
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
                return d(
                  f[n],
                  [...e, n.toString()],
                  y
                );
            };
          if (s === "stateSort")
            return (n) => {
              const o = [...r.getState().getNestedState(t, e).map((u, E) => ({
                ...u,
                __origIndex: E.toString()
              }))].sort(n);
              return g.clear(), $++, d(o, e, {
                filtered: [...y?.filtered || [], e],
                validIndices: o.map(
                  (u) => parseInt(u.__origIndex)
                )
              });
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const a = y?.filtered?.some(
                (o) => o.join(".") === e.join(".")
              ), c = a ? f : r.getState().getNestedState(t, e);
              return s !== "stateMapNoRender" && (g.clear(), $++), c.map((o, u) => {
                const E = a && o.__origIndex ? o.__origIndex : u, F = d(
                  o,
                  [...e, E.toString()],
                  y
                );
                return n(
                  o,
                  F,
                  u,
                  f,
                  d(f, e, y)
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
              rebuildStateShape: d
            });
          if (s === "stateFlattenOn")
            return (n) => {
              const c = y?.filtered?.some(
                (u) => u.join(".") === e.join(".")
              ) ? f : r.getState().getNestedState(t, e);
              g.clear(), $++;
              const o = c.flatMap(
                (u, E) => u[n] ?? []
              );
              return d(
                o,
                [...e, "[*]", n],
                y
              );
            };
          if (s === "findWith")
            return (n, a) => {
              const c = f.findIndex(
                (E) => E[n] === a
              );
              if (c === -1) return;
              const o = f[c], u = [...e, c.toString()];
              return g.clear(), $++, g.clear(), $++, d(o, u);
            };
          if (s === "index")
            return (n) => {
              const a = f[n];
              return d(a, [...e, n.toString()]);
            };
          if (s === "insert")
            return (n) => (_(e), K(i, n, e, t), d(
              r.getState().cogsStateStore[t],
              []
            ));
          if (s === "uniqueInsert")
            return (n, a, c) => {
              const o = r.getState().getNestedState(t, e), u = G(n) ? n(o) : n;
              let E = null;
              if (!o.some((V) => {
                if (a) {
                  const T = a.every(
                    (z) => M(V[z], u[z])
                  );
                  return T && (E = V), T;
                }
                const O = M(V, u);
                return O && (E = V), O;
              }))
                _(e), K(i, u, e, t);
              else if (c && E) {
                const V = c(E), O = o.map(
                  (T) => M(T, E) ? V : T
                );
                _(e), B(i, O, e);
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
              return g.clear(), $++, d(o, e, {
                filtered: [...y?.filtered || [], e],
                validIndices: c
                // Always pass validIndices, even if empty
              });
            };
        }
        const D = e[e.length - 1];
        if (!isNaN(Number(D))) {
          const n = e.slice(0, -1), a = r.getState().getNestedState(t, n);
          if (Array.isArray(a) && s === "cut")
            return () => J(
              i,
              n,
              t,
              Number(D)
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
          return (n) => ft(m + "-" + t + "-" + n);
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
              R(n.key);
              const c = r.getState().cogsStateStore[t];
              try {
                const o = r.getState().getValidationErrors(n.key);
                o && o.length > 0 && o.forEach(([E]) => {
                  E && E.startsWith(n.key) && R(E);
                });
                const u = n.zodSchema.safeParse(c);
                return u.success ? !0 : (u.error.errors.forEach((F) => {
                  const V = F.path, O = F.message, T = [n.key, ...V].join(".");
                  a(T, O);
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
              validIndices: y?.validIndices,
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
        const x = [...e, s], C = r.getState().getNestedState(t, x);
        return d(C, x, y);
      }
    }, h = new Proxy(N, p);
    return g.set(b, {
      proxy: h,
      stateVersion: $
    }), h;
  }
  return d(
    r.getState().getNestedState(t, [])
  );
}
function tt(t) {
  return Q(Ot, { proxy: t });
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
    (g, $, _, v, d) => t._mapFn(g, $, _, v, d)
  ) : null;
}
function Ot({
  proxy: t
}) {
  const i = Z(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return nt(() => {
    const m = i.current;
    if (!m || !m.parentElement) return;
    const g = m.parentElement, _ = Array.from(g.childNodes).indexOf(m);
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
    let y;
    if (t._effect)
      try {
        y = new Function(
          "state",
          `return (${t._effect})(state)`
        )(e);
      } catch (N) {
        console.error("Error evaluating effect function during mount:", N), y = e;
      }
    else
      y = e;
    y !== null && typeof y == "object" && (y = JSON.stringify(y));
    const b = document.createTextNode(String(y));
    m.replaceWith(b);
  }, [t._stateKey, t._path.join("."), t._effect]), Q("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function Jt(t) {
  const i = Et(
    (S) => {
      const m = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return m.components.set(t._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => m.components.delete(t._stateKey);
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
  Ft as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
