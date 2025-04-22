"use client";
import { jsx as st } from "react/jsx-runtime";
import { useState as K, useRef as B, useEffect as tt, useLayoutEffect as It, useMemo as Et, createElement as X, useSyncExternalStore as _t, startTransition as Z } from "react";
import { transformStateFunc as pt, isFunction as q, getNestedValue as G, isDeepEqual as W, debounce as wt } from "./utility.js";
import { pushFunc as ct, updateFn as J, cutFunc as lt, ValidationWrapper as Nt, FormControlComponent as Vt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as dt } from "./store.js";
import { useCogsConfig as $t } from "./CogsStateClient.jsx";
import et from "./node_modules/uuid/dist/esm-browser/v4.js";
function ut(t, i) {
  const f = r.getState().getInitialOptions, S = r.getState().setInitialStateOptions, u = f(t) || {};
  S(t, {
    ...u,
    ...i
  });
}
function ft({
  stateKey: t,
  options: i,
  initialOptionsPart: f
}) {
  const S = nt(t) || {}, u = f[t] || {}, _ = r.getState().setInitialStateOptions, E = { ...u, ...S };
  let y = !1;
  if (i)
    for (const g in i)
      E.hasOwnProperty(g) ? g == "localStorage" && i[g] && E[g].key !== i[g]?.key && (y = !0, E[g] = i[g]) : (y = !0, E[g] = i[g]);
  y && _(t, E);
}
function qt(t, { formElements: i, validation: f }) {
  return { initialState: t, formElements: i, validation: f };
}
const zt = (t, i) => {
  let f = t;
  const [S, u] = pt(f);
  (i?.formElements || i?.validation) && Object.keys(u).forEach((y) => {
    u[y] = u[y] || {}, u[y].formElements = {
      ...i.formElements,
      // Global defaults first
      ...i?.validation,
      ...u[y].formElements || {}
      // State-specific overrides
    };
  }), r.getState().setInitialStates(S);
  const _ = (y, g) => {
    const [p] = K(g?.componentId ?? et());
    ft({
      stateKey: y,
      options: g,
      initialOptionsPart: u
    });
    const l = r.getState().cogsStateStore[y] || S[y], e = g?.modifyState ? g.modifyState(l) : l, [I, $] = jt(
      e,
      {
        stateKey: y,
        syncUpdate: g?.syncUpdate,
        componentId: p,
        localStorage: g?.localStorage,
        middleware: g?.middleware,
        enabledSync: g?.enabledSync,
        reactiveType: g?.reactiveType,
        reactiveDeps: g?.reactiveDeps,
        initialState: g?.initialState,
        dependencies: g?.dependencies
      }
    );
    return $;
  };
  function E(y, g) {
    ft({ stateKey: y, options: g, initialOptionsPart: u });
  }
  return { useCogsState: _, setCogsOptions: E };
}, {
  setUpdaterState: H,
  setState: x,
  getInitialOptions: nt,
  getKeyState: gt,
  getValidationErrors: ht,
  setStateLog: At,
  updateInitialStateGlobal: rt,
  addValidationError: Ct,
  removeValidationError: P,
  setServerSyncActions: Tt
} = r.getState(), St = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, kt = (t, i, f, S) => {
  f.log && console.log(
    "saving to localstorage",
    i,
    f.localStorage?.key,
    S
  );
  const u = q(f.localStorage?.key) ? f.localStorage?.key(t) : f.localStorage?.key;
  if (u && S) {
    const _ = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, E = `${S}-${i}-${u}`;
    window.localStorage.setItem(E, JSON.stringify(_));
  }
}, Ft = (t, i, f, S, u, _) => {
  const E = {
    initialState: i,
    updaterState: Q(
      t,
      S,
      u,
      _
    ),
    state: f
  };
  Z(() => {
    rt(t, E.initialState), H(t, E.updaterState), x(t, E.state);
  });
}, mt = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const f = /* @__PURE__ */ new Set();
  i.components.forEach((S) => {
    f.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    Z(() => {
      f.forEach((S) => S());
    });
  });
}, Jt = (t, i) => {
  const f = r.getState().stateComponents.get(t);
  if (f) {
    const S = `${t}////${i}`, u = f.components.get(S);
    u && u.forceUpdate();
  }
};
function jt(t, {
  stateKey: i,
  serverSync: f,
  localStorage: S,
  formElements: u,
  middleware: _,
  reactiveDeps: E,
  reactiveType: y,
  componentId: g,
  initialState: p,
  syncUpdate: l,
  dependencies: e
} = {}) {
  const [I, $] = K({}), { sessionId: T } = $t();
  let R = !i;
  const [d] = K(i ?? et()), O = r.getState().stateLog[d], s = B(/* @__PURE__ */ new Set()), b = B(g ?? et()), h = B(null);
  h.current = nt(d), tt(() => {
    if (l && l.stateKey === d && l.path?.[0]) {
      x(d, (o) => ({
        ...o,
        [l.path[0]]: l.newValue
      }));
      const a = `${l.stateKey}:${l.path.join(".")}`;
      r.getState().setSyncInfo(a, {
        timeStamp: l.timeStamp,
        userId: l.userId
      });
    }
  }, [l]), tt(() => {
    ut(d, {
      initialState: p
    });
    const a = h.current;
    let o = null;
    a.log && console.log("newoptions", a);
    const c = q(a.localStorage?.key) ? a.localStorage?.key(p) : a.localStorage?.key;
    c && T && (o = St(
      T + "-" + d + "-" + c
    ));
    let m = null;
    p && (m = p, o && o.lastUpdated > (o.lastSyncedWithServer || 0) && (m = o.state), Ft(
      d,
      p,
      m,
      D,
      b.current,
      T
    ), mt(d), $({}));
  }, [p, ...e || []]), It(() => {
    R && ut(d, {
      serverSync: f,
      formElements: u,
      initialState: p,
      localStorage: S,
      middleware: _
    });
    const a = `${d}////${b.current}`, o = r.getState().stateComponents.get(d) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(a, {
      forceUpdate: () => $({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0,
      reactiveType: y ?? ["component", "deps"]
    }), r.getState().stateComponents.set(d, o), $({}), () => {
      const c = `${d}////${b.current}`;
      o && (o.components.delete(c), o.components.size === 0 && r.getState().stateComponents.delete(d));
    };
  }, []);
  const D = (a, o, c, m) => {
    if (Array.isArray(o)) {
      const w = `${d}-${o.join(".")}`;
      s.current.add(w);
    }
    x(d, (w) => {
      const A = q(a) ? a(w) : a, F = `${d}-${o.join(".")}`;
      if (F) {
        let U = !1, v = r.getState().signalDomElements.get(F);
        if ((!v || v.size === 0) && (c.updateType === "insert" || c.updateType === "cut")) {
          const V = o.slice(0, -1), C = G(A, V);
          if (Array.isArray(C)) {
            U = !0;
            const N = `${d}-${V.join(".")}`;
            v = r.getState().signalDomElements.get(N);
          }
        }
        if (v) {
          const V = U ? G(A, o.slice(0, -1)) : G(A, o);
          v.forEach(({ parentId: C, position: N, effect: L }) => {
            const j = document.querySelector(
              `[data-parent-id="${C}"]`
            );
            if (j) {
              const it = Array.from(j.childNodes);
              if (it[N]) {
                const vt = L ? new Function("state", `return (${L})(state)`)(V) : V;
                it[N].textContent = String(vt);
              }
            }
          });
        }
      }
      c.updateType === "update" && (m || h.current?.validationKey) && o && P(
        (m || h.current?.validationKey) + "." + o.join(".")
      );
      const k = o.slice(0, o.length - 1);
      c.updateType === "cut" && h.current?.validationKey && P(
        h.current?.validationKey + "." + k.join(".")
      ), c.updateType === "insert" && h.current?.validationKey && ht(
        h.current?.validationKey + "." + k.join(".")
      ).filter(([v, V]) => {
        let C = v?.split(".").length;
        if (v == k.join(".") && C == k.length - 1) {
          let N = v + "." + k;
          P(v), Ct(N, V);
        }
      });
      const M = G(w, o), z = G(A, o), yt = c.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), ot = r.getState().stateComponents.get(d);
      if (ot)
        for (const [U, v] of ot.components.entries()) {
          let V = !1;
          const C = Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"];
          if (!C.includes("none")) {
            if (C.includes("all")) {
              v.forceUpdate();
              continue;
            }
            if (C.includes("component") && v.paths && (v.paths.has(yt) || v.paths.has("")) && (V = !0), !V && C.includes("deps") && v.depsFunction) {
              const N = v.depsFunction(A);
              typeof N == "boolean" ? N && (V = !0) : W(v.deps, N) || (v.deps = N, V = !0);
            }
            V && v.forceUpdate();
          }
        }
      const at = {
        timeStamp: Date.now(),
        stateKey: d,
        path: o,
        updateType: c.updateType,
        status: "new",
        oldValue: M,
        newValue: z
      };
      if (At(d, (U) => {
        const V = [...U ?? [], at].reduce((C, N) => {
          const L = `${N.stateKey}:${JSON.stringify(N.path)}`, j = C.get(L);
          return j ? (j.timeStamp = Math.max(j.timeStamp, N.timeStamp), j.newValue = N.newValue, j.oldValue = j.oldValue ?? N.oldValue, j.updateType = N.updateType) : C.set(L, { ...N }), C;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), kt(
        A,
        d,
        h.current,
        T
      ), _ && _({
        updateLog: O,
        update: at
      }), h.current?.serverSync) {
        const U = r.getState().serverState[d], v = h.current?.serverSync;
        Tt(d, {
          syncKey: typeof v.syncKey == "string" ? v.syncKey : v.syncKey({ state: A }),
          rollBackState: U,
          actionTimeStamp: Date.now() + (v.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return A;
    });
  };
  r.getState().updaterState[d] || (H(
    d,
    Q(
      d,
      D,
      b.current,
      T
    )
  ), r.getState().cogsStateStore[d] || x(d, t), r.getState().initialStateGlobal[d] || rt(d, t));
  const n = Et(() => Q(
    d,
    D,
    b.current,
    T
  ), [d]);
  return [gt(d), n];
}
function Q(t, i, f, S) {
  const u = /* @__PURE__ */ new Map();
  let _ = 0;
  const E = (l) => {
    const e = l.join(".");
    for (const [I] of u)
      (I === e || I.startsWith(e + ".")) && u.delete(I);
    _++;
  }, y = /* @__PURE__ */ new Map(), g = {
    removeValidation: (l) => {
      l?.validationKey && P(l.validationKey);
    },
    revertToInitialState: (l) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && P(e?.key), l?.validationKey && P(l.validationKey);
      const I = r.getState().initialStateGlobal[t];
      u.clear(), _++;
      const $ = p(I, []);
      return Z(() => {
        H(t, $), x(t, I);
        const T = r.getState().stateComponents.get(t);
        T && T.components.forEach((O) => {
          O.forceUpdate();
        });
        const R = nt(t), d = q(R?.localStorage?.key) ? R?.localStorage?.key(I) : R?.localStorage?.key;
        d && localStorage.removeItem(d);
      }), I;
    },
    updateInitialState: (l) => {
      u.clear(), _++;
      const e = Q(
        t,
        i,
        f,
        S
      );
      return Z(() => {
        rt(t, l), H(t, e), x(t, l);
        const I = r.getState().stateComponents.get(t);
        I && I.components.forEach(($) => {
          $.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (I) => e.get()[I]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const l = r.getState().serverState[t];
      return !!(l && W(l, gt(t)));
    }
  };
  function p(l, e = [], I) {
    const $ = e.map(String).join(".");
    u.get($);
    const T = function() {
      return r().getNestedState(t, e);
    };
    Object.keys(g).forEach((O) => {
      T[O] = g[O];
    });
    const R = {
      apply(O, s, b) {
        return r().getNestedState(t, e);
      },
      get(O, s) {
        if (s !== "then" && !s.startsWith("$") && s !== "stateMapNoRender") {
          const n = e.join("."), a = `${t}////${f}`, o = r.getState().stateComponents.get(t);
          if (o) {
            const c = o.components.get(a);
            c && (e.length > 0 || s === "get") && c.paths.add(n);
          }
        }
        if (s === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(t)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(n.key + "." + e.join("."));
          };
        if (Array.isArray(l)) {
          if (s === "getSelected")
            return () => {
              const n = y.get(e.join("."));
              if (n !== void 0)
                return p(
                  l[n],
                  [...e, n.toString()],
                  I
                );
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const a = I?.filtered?.some(
                (c) => c.join(".") === e.join(".")
              ), o = a ? l : r.getState().getNestedState(t, e);
              return s !== "stateMapNoRender" && (u.clear(), _++), o.map((c, m) => {
                const w = a && c.__origIndex ? c.__origIndex : m, A = p(
                  c,
                  [...e, w.toString()],
                  I
                );
                return n(
                  c,
                  A,
                  m,
                  l,
                  p(l, e, I)
                );
              });
            };
          if (s === "$stateMap")
            return (n) => X(bt, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: p
            });
          if (s === "stateFlattenOn")
            return (n) => {
              const o = I?.filtered?.some(
                (m) => m.join(".") === e.join(".")
              ) ? l : r.getState().getNestedState(t, e);
              u.clear(), _++;
              const c = o.flatMap(
                (m, w) => m[n] ?? []
              );
              return p(
                c,
                [...e, "[*]", n],
                I
              );
            };
          if (s === "findWith")
            return (n, a) => {
              const o = l.findIndex(
                (w) => w[n] === a
              );
              if (o === -1) return;
              const c = l[o], m = [...e, o.toString()];
              return u.clear(), _++, u.clear(), _++, p(c, m);
            };
          if (s === "index")
            return (n) => {
              const a = l[n];
              return p(a, [...e, n.toString()]);
            };
          if (s === "insert")
            return (n) => (E(e), ct(i, n, e, t), p(
              r.getState().cogsStateStore[t],
              []
            ));
          if (s === "uniqueInsert")
            return (n, a, o) => {
              const c = r.getState().getNestedState(t, e), m = q(n) ? n(c) : n;
              let w = null;
              if (!c.some((F) => {
                if (a) {
                  const M = a.every(
                    (z) => W(F[z], m[z])
                  );
                  return M && (w = F), M;
                }
                const k = W(F, m);
                return k && (w = F), k;
              }))
                E(e), ct(i, m, e, t);
              else if (o && w) {
                const F = o(w), k = c.map(
                  (M) => W(M, w) ? F : M
                );
                E(e), J(i, k, e);
              }
            };
          if (s === "cut")
            return (n, a) => {
              a?.waitForSync || (E(e), lt(i, e, t, n));
            };
          if (s === "stateFilter")
            return (n) => {
              const a = l.map((m, w) => ({
                ...m,
                __origIndex: w.toString()
              })), o = [], c = [];
              for (let m = 0; m < a.length; m++)
                n(a[m], m) && (o.push(m), c.push(a[m]));
              return u.clear(), _++, p(c, e, {
                filtered: [...I?.filtered || [], e],
                validIndices: o
                // Always pass validIndices, even if empty
              });
            };
        }
        const b = e[e.length - 1];
        if (!isNaN(Number(b))) {
          const n = e.slice(0, -1), a = r.getState().getNestedState(t, n);
          if (Array.isArray(a) && s === "cut")
            return () => lt(
              i,
              n,
              t,
              Number(b)
            );
        }
        if (s === "get")
          return () => r.getState().getNestedState(t, e);
        if (s === "$derive")
          return (n) => Y({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (s === "$derive")
          return (n) => Y({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (s === "$get")
          return () => Y({
            _stateKey: t,
            _path: e
          });
        if (s === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (s === "_selected") {
          const n = e.slice(0, -1), a = n.join("."), o = r.getState().getNestedState(t, n);
          return Array.isArray(o) ? Number(e[e.length - 1]) === y.get(a) : void 0;
        }
        if (s == "getLocalStorage")
          return (n) => St(S + "-" + t + "-" + n);
        if (s === "setSelected")
          return (n) => {
            const a = e.slice(0, -1), o = Number(e[e.length - 1]), c = a.join(".");
            n ? y.set(c, o) : y.delete(c);
            const m = r.getState().getNestedState(t, [...a]);
            J(i, m, a), E(a);
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
              const o = r.getState().cogsStateStore[t];
              try {
                const c = r.getState().getValidationErrors(n.key);
                c && c.length > 0 && c.forEach(([w]) => {
                  w && w.startsWith(n.key) && P(w);
                });
                const m = n.zodSchema.safeParse(o);
                return m.success ? !0 : (m.error.errors.forEach((A) => {
                  const F = A.path, k = A.message, M = [n.key, ...F].join(".");
                  a(M, k);
                }), mt(t), !1);
              } catch (c) {
                return console.error("Zod schema validation failed", c), !1;
              }
            };
          if (s === "_componentId") return f;
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
            return g.revertToInitialState;
          if (s === "updateInitialState") return g.updateInitialState;
          if (s === "removeValidation") return g.removeValidation;
        }
        if (s === "getFormRef")
          return () => dt.getState().getFormRef(t + "." + e.join("."));
        if (s === "validationWrapper")
          return ({
            children: n,
            hideMessage: a
          }) => /* @__PURE__ */ st(
            Nt,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: I?.validIndices,
              children: n
            }
          );
        if (s === "_stateKey") return t;
        if (s === "_path") return e;
        if (s === "_isServerSynced") return g._isServerSynced;
        if (s === "update")
          return (n, a) => {
            if (a?.debounce)
              wt(() => {
                J(i, n, e, "");
                const o = r.getState().getNestedState(t, e);
                a?.afterUpdate && a.afterUpdate(o);
              }, a.debounce);
            else {
              J(i, n, e, "");
              const o = r.getState().getNestedState(t, e);
              a?.afterUpdate && a.afterUpdate(o);
            }
            E(e);
          };
        if (s === "formElement")
          return (n, a) => /* @__PURE__ */ st(
            Vt,
            {
              setState: i,
              stateKey: t,
              path: e,
              child: n,
              formOpts: a
            }
          );
        const h = [...e, s], D = r.getState().getNestedState(t, h);
        return p(D, h, I);
      }
    }, d = new Proxy(T, R);
    return u.set($, {
      proxy: d,
      stateVersion: _
    }), d;
  }
  return p(
    r.getState().getNestedState(t, [])
  );
}
function Y(t) {
  return X(Mt, { proxy: t });
}
function bt({
  proxy: t,
  rebuildStateShape: i
}) {
  const f = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(f) ? i(
    f,
    t._path
  ).stateMapNoRender(
    (u, _, E, y, g) => t._mapFn(u, _, E, y, g)
  ) : null;
}
function Mt({
  proxy: t
}) {
  const i = B(null), f = `${t._stateKey}-${t._path.join(".")}`;
  return tt(() => {
    const S = i.current;
    if (!S || !S.parentElement) return;
    const u = S.parentElement, E = Array.from(u.childNodes).indexOf(S);
    let y = u.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", y));
    const p = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: E,
      effect: t._effect
    };
    r.getState().addSignalElement(f, p);
    const l = r.getState().getNestedState(t._stateKey, t._path);
    let e;
    if (t._effect)
      try {
        e = new Function(
          "state",
          `return (${t._effect})(state)`
        )(l);
      } catch ($) {
        console.error("Error evaluating effect function during mount:", $), e = l;
      }
    else
      e = l;
    e !== null && typeof e == "object" && (e = JSON.stringify(e));
    const I = document.createTextNode(String(e));
    S.replaceWith(I);
  }, [t._stateKey, t._path.join("."), t._effect]), X("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": f
  });
}
function Bt(t) {
  const i = _t(
    (f) => {
      const S = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return S.components.set(t._stateKey, {
        forceUpdate: f,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => S.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return X("text", {}, String(i));
}
export {
  Y as $cogsSignal,
  Bt as $cogsSignalStore,
  qt as addStateOptions,
  zt as createCogsState,
  Jt as notifyComponent,
  jt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
