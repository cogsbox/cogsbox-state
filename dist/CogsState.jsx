"use client";
import { jsx as ct } from "react/jsx-runtime";
import { useState as et, useRef as J, useEffect as nt, useLayoutEffect as It, useMemo as _t, createElement as Q, useSyncExternalStore as Et, startTransition as Z } from "react";
import { transformStateFunc as $t, isFunction as L, getNestedValue as U, isDeepEqual as M, debounce as wt } from "./utility.js";
import { pushFunc as K, updateFn as z, cutFunc as B, ValidationWrapper as Nt, FormControlComponent as Vt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as lt } from "./store.js";
import { useCogsConfig as At } from "./CogsStateClient.jsx";
import rt from "./node_modules/uuid/dist/esm-browser/v4.js";
function dt(t, i) {
  const m = r.getState().getInitialOptions, y = r.getState().setInitialStateOptions, g = m(t) || {};
  y(t, {
    ...g,
    ...i
  });
}
function ut({
  stateKey: t,
  options: i,
  initialOptionsPart: m
}) {
  const y = Y(t) || {}, g = m[t] || {}, $ = r.getState().setInitialStateOptions, _ = { ...g, ...y };
  let v = !1;
  if (i)
    for (const l in i)
      _.hasOwnProperty(l) ? l == "localStorage" && i[l] && _[l].key !== i[l]?.key && (v = !0, _[l] = i[l]) : (v = !0, _[l] = i[l]);
  v && $(t, _);
}
function qt(t, { formElements: i, validation: m }) {
  return { initialState: t, formElements: i, validation: m };
}
const zt = (t, i) => {
  let m = t;
  const [y, g] = $t(m);
  (i?.formElements || i?.validation) && Object.keys(g).forEach((v) => {
    g[v] = g[v] || {}, g[v].formElements = {
      ...i.formElements,
      // Global defaults first
      ...i?.validation,
      ...g[v].formElements || {}
      // State-specific overrides
    };
  }), r.getState().setInitialStates(y);
  const $ = (v, l) => {
    const [f] = et(l?.componentId ?? rt());
    ut({
      stateKey: v,
      options: l,
      initialOptionsPart: g
    });
    const e = r.getState().cogsStateStore[v] || y[v], S = l?.modifyState ? l.modifyState(e) : e, [h, A] = jt(
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
  function _(v, l) {
    ut({ stateKey: v, options: l, initialOptionsPart: g });
  }
  return { useCogsState: $, setCogsOptions: _ };
}, {
  setUpdaterState: H,
  setState: D,
  getInitialOptions: Y,
  getKeyState: gt,
  getValidationErrors: kt,
  setStateLog: Ct,
  updateInitialStateGlobal: ot,
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
}, pt = (t, i, m, y) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    y
  );
  const g = L(m?.localStorage?.key) ? m.localStorage?.key(t) : m.localStorage?.key;
  if (g && y) {
    const $ = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, _ = `${y}-${i}-${g}`;
    window.localStorage.setItem(_, JSON.stringify($));
  }
}, xt = (t, i, m, y, g, $) => {
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
  Z(() => {
    ot(t, _.initialState), H(t, _.updaterState), D(t, _.state);
  });
}, St = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((y) => {
    m.add(() => y.forceUpdate());
  }), queueMicrotask(() => {
    Z(() => {
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
function jt(t, {
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
  const [h, A] = et({}), { sessionId: p } = At();
  let R = !i;
  const [u] = et(i ?? rt()), s = r.getState().stateLog[u], G = J(/* @__PURE__ */ new Set()), b = J(l ?? rt()), C = J(null);
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
    c?.log && console.log("newoptions", c);
    const d = L(c?.localStorage?.key) ? c?.localStorage?.key(f) : c?.localStorage?.key;
    d && p && (o = ft(
      p + "-" + u + "-" + d
    ));
    let E = null;
    f && (E = f, o && o.lastUpdated > (o.lastSyncedWithServer || 0) && (E = o.state), xt(
      u,
      f,
      E,
      n,
      b.current,
      p
    ), St(u), A({}));
  }, [f, ...S || []]), It(() => {
    R && dt(u, {
      serverSync: m,
      formElements: g,
      initialState: f,
      localStorage: y,
      middleware: $
    });
    const c = `${u}////${b.current}`, o = r.getState().stateComponents.get(u) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(c, {
      forceUpdate: () => A({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: v ?? ["component", "deps"]
    }), r.getState().stateComponents.set(u, o), A({}), () => {
      const d = `${u}////${b.current}`;
      o && (o.components.delete(d), o.components.size === 0 && r.getState().stateComponents.delete(u));
    };
  }, []);
  const n = (c, o, d, E) => {
    if (Array.isArray(o)) {
      const x = `${u}-${o.join(".")}`;
      G.current.add(x);
    }
    D(u, (x) => {
      const N = L(c) ? c(x) : c, F = `${u}-${o.join(".")}`;
      if (F) {
        let O = !1, I = r.getState().signalDomElements.get(F);
        if ((!I || I.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const V = o.slice(0, -1), k = U(N, V);
          if (Array.isArray(k)) {
            O = !0;
            const w = `${u}-${V.join(".")}`;
            I = r.getState().signalDomElements.get(w);
          }
        }
        if (I) {
          const V = O ? U(N, o.slice(0, -1)) : U(N, o);
          I.forEach(({ parentId: k, position: w, effect: W }) => {
            const j = document.querySelector(
              `[data-parent-id="${k}"]`
            );
            if (j) {
              const st = Array.from(j.childNodes);
              if (st[w]) {
                const vt = W ? new Function("state", `return (${W})(state)`)(V) : V;
                st[w].textContent = String(vt);
              }
            }
          });
        }
      }
      d.updateType === "update" && (E || C.current?.validationKey) && o && P(
        (E || C.current?.validationKey) + "." + o.join(".")
      );
      const T = o.slice(0, o.length - 1);
      d.updateType === "cut" && C.current?.validationKey && P(
        C.current?.validationKey + "." + T.join(".")
      ), d.updateType === "insert" && C.current?.validationKey && kt(
        C.current?.validationKey + "." + T.join(".")
      ).filter(([I, V]) => {
        let k = I?.split(".").length;
        if (I == T.join(".") && k == T.length - 1) {
          let w = I + "." + T;
          P(I), Tt(w, V);
        }
      });
      const q = U(x, o), mt = U(N, o), yt = d.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), at = r.getState().stateComponents.get(u);
      if (at)
        for (const [O, I] of at.components.entries()) {
          let V = !1;
          const k = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (!k.includes("none")) {
            if (k.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if (k.includes("component") && I.paths && (I.paths.has(yt) || I.paths.has("")) && (V = !0), !V && k.includes("deps") && I.depsFunction) {
              const w = I.depsFunction(N);
              typeof w == "boolean" ? w && (V = !0) : M(I.deps, w) || (I.deps = w, V = !0);
            }
            V && I.forceUpdate();
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
      if (Ct(u, (O) => {
        const V = [...O ?? [], it].reduce((k, w) => {
          const W = `${w.stateKey}:${JSON.stringify(w.path)}`, j = k.get(W);
          return j ? (j.timeStamp = Math.max(j.timeStamp, w.timeStamp), j.newValue = w.newValue, j.oldValue = j.oldValue ?? w.oldValue, j.updateType = w.updateType) : k.set(W, { ...w }), k;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), pt(
        N,
        u,
        C.current,
        p
      ), $ && $({
        updateLog: s,
        update: it
      }), C.current?.serverSync) {
        const O = r.getState().serverState[u], I = C.current?.serverSync;
        ht(u, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: N }),
          rollBackState: O,
          actionTimeStamp: Date.now() + (I.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return N;
    });
  };
  r.getState().updaterState[u] || (H(
    u,
    X(
      u,
      n,
      b.current,
      p
    )
  ), r.getState().cogsStateStore[u] || D(u, t), r.getState().initialStateGlobal[u] || ot(u, t));
  const a = _t(() => X(
    u,
    n,
    b.current,
    p
  ), [u]);
  return [gt(u), a];
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
      const h = l(S, []), A = Y(t), p = L(A?.localStorage?.key) ? A?.localStorage?.key(S) : A?.localStorage?.key, R = `${y}-${t}-${p}`;
      return R && localStorage.removeItem(R), Z(() => {
        H(t, h), D(t, S);
        const u = r.getState().stateComponents.get(t);
        u && u.components.forEach((s) => {
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
      return Z(() => {
        ot(t, f), H(t, e), D(t, f);
        const S = r.getState().stateComponents.get(t);
        S && S.components.forEach((h) => {
          h.forceUpdate();
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
    const h = e.map(String).join(".");
    g.get(h);
    const A = function() {
      return r().getNestedState(t, e);
    };
    Object.keys(v).forEach((u) => {
      A[u] = v[u];
    });
    const p = {
      apply(u, s, G) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${e.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, e);
      },
      get(u, s) {
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
            const n = r.getState().initialStateGlobal[t], a = Y(t), c = L(a?.localStorage?.key) ? a?.localStorage?.key(n) : a?.localStorage?.key, o = `${y}-${t}-${c}`;
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
              const o = [...r.getState().getNestedState(t, e).map((d, E) => ({
                ...d,
                __origIndex: E.toString()
              }))].sort(n);
              return g.clear(), $++, l(o, e, {
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
              return s !== "stateMapNoRender" && (g.clear(), $++), c.map((o, d) => {
                const E = a && o.__origIndex ? o.__origIndex : d, x = l(
                  o,
                  [...e, E.toString()],
                  S
                );
                return n(
                  o,
                  x,
                  d,
                  f,
                  l(f, e, S)
                );
              });
            };
          if (s === "$stateMap")
            return (n) => Q(Ft, {
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
              g.clear(), $++;
              const o = c.flatMap(
                (d, E) => d[n] ?? []
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
              const o = f[c], d = [...e, c.toString()];
              return g.clear(), $++, g.clear(), $++, l(o, d);
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
              const o = r.getState().getNestedState(t, e), d = L(n) ? n(o) : n;
              let E = null;
              if (!o.some((N) => {
                if (a) {
                  const T = a.every(
                    (q) => M(N[q], d[q])
                  );
                  return T && (E = N), T;
                }
                const F = M(N, d);
                return F && (E = N), F;
              }))
                _(e), K(i, d, e, t);
              else if (c && E) {
                const N = c(E), F = o.map(
                  (T) => M(T, E) ? N : T
                );
                _(e), z(i, F, e);
              }
            };
          if (s === "cut")
            return (n, a) => {
              a?.waitForSync || (_(e), B(i, e, t, n));
            };
          if (s === "cutByValue")
            return (n) => {
              for (let a = 0; a < f.length; a++)
                f[a] === n && B(i, e, t, a);
            };
          if (s === "toggleByValue")
            return (n) => {
              const a = f.findIndex((c) => c === n);
              a > -1 ? B(i, e, t, a) : K(i, n, e, t);
            };
          if (s === "stateFilter")
            return (n) => {
              const a = f.map((d, E) => ({
                ...d,
                __origIndex: E.toString()
              })), c = [], o = [];
              for (let d = 0; d < a.length; d++)
                n(a[d], d) && (c.push(d), o.push(a[d]));
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
            return () => B(
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
            z(i, d, a), _(a);
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
                const d = n.zodSchema.safeParse(c);
                return d.success ? !0 : (d.error.errors.forEach((x) => {
                  const N = x.path, F = x.message, T = [n.key, ...N].join(".");
                  a(T, F);
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
                z(i, n, e, "");
                const c = r.getState().getNestedState(t, e);
                a?.afterUpdate && a.afterUpdate(c);
              }, a.debounce);
            else {
              z(i, n, e, "");
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
        const b = [...e, s], C = r.getState().getNestedState(t, b);
        return l(C, b, S);
      }
    }, R = new Proxy(A, p);
    return g.set(h, {
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
function Ft({
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
  const i = J(null), m = `${t._stateKey}-${t._path.join(".")}`;
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
      } catch (A) {
        console.error("Error evaluating effect function during mount:", A), S = e;
      }
    else
      S = e;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const h = document.createTextNode(String(S));
    y.replaceWith(h);
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
  jt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
