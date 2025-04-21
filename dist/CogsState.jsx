"use client";
import { jsx as it } from "react/jsx-runtime";
import { useState as Y, useRef as z, useEffect as K, useLayoutEffect as vt, useMemo as It, createElement as H, useSyncExternalStore as Et, startTransition as J } from "react";
import { transformStateFunc as _t, isFunction as ft, getNestedValue as L, isDeepEqual as G, debounce as pt } from "./utility.js";
import { pushFunc as st, updateFn as q, cutFunc as ct, ValidationWrapper as wt, FormControlComponent as Nt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as a, formRefStore as lt } from "./store.js";
import { useCogsConfig as Vt } from "./CogsStateClient.jsx";
import tt from "./node_modules/uuid/dist/esm-browser/v4.js";
function dt(t, o) {
  const u = a.getState().getInitialOptions, f = a.getState().setInitialStateOptions, c = u(t) || {};
  return console.log("setAndMergeOptions", t, c, o), f(t, {
    ...c,
    ...o
  }), {
    ...c,
    ...o
  };
}
function ut({
  stateKey: t,
  options: o,
  initialOptionsPart: u
}) {
  const f = et(t) || {}, c = u[t] || {}, p = a.getState().setInitialStateOptions, _ = { ...c, ...f };
  let y = !1;
  if (o)
    for (const g in o)
      _.hasOwnProperty(g) ? g == "localStorage" && _[g] !== o[g] && (y = !0, _[g] = o[g]) : (y = !0, _[g] = o[g]);
  return y && p(t, _), _;
}
function Wt(t, { formElements: o, validation: u }) {
  return { initialState: t, formElements: o, validation: u };
}
const qt = (t, o) => {
  let u = t;
  const [f, c] = _t(u);
  (o?.formElements || o?.validation) && Object.keys(c).forEach((y) => {
    c[y] = c[y] || {}, c[y].formElements = {
      ...o.formElements,
      // Global defaults first
      ...o?.validation,
      ...c[y].formElements || {}
      // State-specific overrides
    };
  }), a.getState().setInitialStates(f);
  const p = (y, g) => {
    const [w] = Y(g?.componentId ?? tt());
    ut({
      stateKey: y,
      options: g,
      initialOptionsPart: c
    });
    const s = a.getState().cogsStateStore[y] || f[y], e = g?.modifyState ? g.modifyState(s) : s, [I, V] = jt(
      e,
      {
        stateKey: y,
        syncUpdate: g?.syncUpdate,
        componentId: w,
        localStorage: g?.localStorage,
        middleware: g?.middleware,
        enabledSync: g?.enabledSync,
        reactiveType: g?.reactiveType,
        reactiveDeps: g?.reactiveDeps,
        initState: g?.initState
      }
    );
    return V;
  };
  function _(y, g) {
    ut({ stateKey: y, options: g, initialOptionsPart: c });
  }
  return { useCogsState: p, setCogsOptions: _ };
}, {
  setUpdaterState: B,
  setState: x,
  getInitialOptions: et,
  getKeyState: gt,
  getValidationErrors: $t,
  setStateLog: ht,
  updateInitialStateGlobal: nt,
  addValidationError: At,
  removeValidationError: O,
  setServerSyncActions: Ct
} = a.getState(), St = (t) => {
  if (!t) return null;
  try {
    const o = window.localStorage.getItem(t);
    return o ? JSON.parse(o) : null;
  } catch (o) {
    return console.error("Error loading from localStorage:", o), null;
  }
}, Tt = (t, o, u, f) => {
  if (u.log && console.log(
    "saving to localstorage",
    o,
    u.localStorage?.key,
    f
  ), u.localStorage?.key && f) {
    const c = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: a.getState().serverSyncLog[o]?.[0]?.timeStamp,
      baseServerState: a.getState().serverState[o]
    }, p = `${f}-${o}-${u.localStorage?.key}`;
    window.localStorage.setItem(p, JSON.stringify(c));
  }
}, Ft = (t, o, u, f, c, p) => {
  const _ = {
    initialState: o,
    updaterState: Z(
      t,
      f,
      c,
      p
    ),
    state: u
  };
  J(() => {
    nt(t, _.initialState), B(t, _.updaterState), x(t, _.state);
  });
}, mt = (t) => {
  const o = a.getState().stateComponents.get(t);
  if (!o) return;
  const u = /* @__PURE__ */ new Set();
  o.components.forEach((f) => {
    u.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    J(() => {
      u.forEach((f) => f());
    });
  });
}, zt = (t, o) => {
  const u = a.getState().stateComponents.get(t);
  if (u) {
    const f = `${t}////${o}`, c = u.components.get(f);
    c && c.forceUpdate();
  }
};
function jt(t, {
  stateKey: o,
  serverSync: u,
  localStorage: f,
  formElements: c,
  middleware: p,
  reactiveDeps: _,
  reactiveType: y,
  componentId: g,
  initState: w,
  syncUpdate: s
} = {}) {
  const [e, I] = Y({}), { sessionId: V } = Vt();
  let k = !o;
  const [l] = Y(o ?? tt()), U = a.getState().stateLog[l], P = z(/* @__PURE__ */ new Set()), i = z(g ?? tt()), $ = z(null);
  $.current = et(l), K(() => {
    if (s && s.stateKey === l && s.path?.[0]) {
      x(l, (r) => ({
        ...r,
        [s.path[0]]: s.newValue
      }));
      const n = `${s.stateKey}:${s.path.join(".")}`;
      a.getState().setSyncInfo(n, {
        timeStamp: s.timeStamp,
        userId: s.userId
      });
    }
  }, [s]), K(() => {
    dt(l, {
      initState: w
    });
    const n = $.current;
    let r = null;
    n.log && console.log("newoptions", n), n.localStorage?.key && V && (r = St(
      V + "-" + l + "-" + n.localStorage?.key
    ));
    let d = null;
    w?.initialState && (d = w?.initialState, r && r.lastUpdated > (r.lastSyncedWithServer || 0) && (d = r.state), Ft(
      l,
      w?.initialState,
      d,
      R,
      i.current,
      V
    ), mt(l), I({}));
  }, [...w?.dependencies || []]), vt(() => {
    k && dt(l, {
      serverSync: u,
      formElements: c,
      initState: w,
      localStorage: f,
      middleware: p
    });
    const n = `${l}////${i.current}`, r = a.getState().stateComponents.get(l) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(n, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: y ?? ["component", "deps"]
    }), a.getState().stateComponents.set(l, r), I({}), () => {
      const d = `${l}////${i.current}`;
      r && (r.components.delete(d), r.components.size === 0 && a.getState().stateComponents.delete(l));
    };
  }, []);
  const R = (n, r, d, S) => {
    if (Array.isArray(r)) {
      const m = `${l}-${r.join(".")}`;
      P.current.add(m);
    }
    x(l, (m) => {
      const E = ft(n) ? n(m) : n, j = `${l}-${r.join(".")}`;
      if (j) {
        let b = !1, v = a.getState().signalDomElements.get(j);
        if ((!v || v.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const h = r.slice(0, -1), C = L(E, h);
          if (Array.isArray(C)) {
            b = !0;
            const N = `${l}-${h.join(".")}`;
            v = a.getState().signalDomElements.get(N);
          }
        }
        if (v) {
          const h = b ? L(E, r.slice(0, -1)) : L(E, r);
          v.forEach(({ parentId: C, position: N, effect: D }) => {
            const T = document.querySelector(
              `[data-parent-id="${C}"]`
            );
            if (T) {
              const ot = Array.from(T.childNodes);
              if (ot[N]) {
                const yt = D ? new Function("state", `return (${D})(state)`)(h) : h;
                ot[N].textContent = String(yt);
              }
            }
          });
        }
      }
      d.updateType === "update" && (S || $.current?.validationKey) && r && O(
        (S || $.current?.validationKey) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      d.updateType === "cut" && $.current?.validationKey && O(
        $.current?.validationKey + "." + A.join(".")
      ), d.updateType === "insert" && $.current?.validationKey && $t(
        $.current?.validationKey + "." + A.join(".")
      ).filter(([v, h]) => {
        let C = v?.split(".").length;
        if (v == A.join(".") && C == A.length - 1) {
          let N = v + "." + A;
          O(v), At(N, h);
        }
      });
      const M = L(m, r), F = L(E, r), W = d.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), rt = a.getState().stateComponents.get(l);
      if (rt)
        for (const [b, v] of rt.components.entries()) {
          let h = !1;
          const C = Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"];
          if (!C.includes("none")) {
            if (C.includes("all")) {
              v.forceUpdate();
              continue;
            }
            if (C.includes("component") && v.paths && (v.paths.has(W) || v.paths.has("")) && (h = !0), !h && C.includes("deps") && v.depsFunction) {
              const N = v.depsFunction(E);
              typeof N == "boolean" ? N && (h = !0) : G(v.deps, N) || (v.deps = N, h = !0);
            }
            h && v.forceUpdate();
          }
        }
      const at = {
        timeStamp: Date.now(),
        stateKey: l,
        path: r,
        updateType: d.updateType,
        status: "new",
        oldValue: M,
        newValue: F
      };
      if (ht(l, (b) => {
        const h = [...b ?? [], at].reduce((C, N) => {
          const D = `${N.stateKey}:${JSON.stringify(N.path)}`, T = C.get(D);
          return T ? (T.timeStamp = Math.max(T.timeStamp, N.timeStamp), T.newValue = N.newValue, T.oldValue = T.oldValue ?? N.oldValue, T.updateType = N.updateType) : C.set(D, { ...N }), C;
        }, /* @__PURE__ */ new Map());
        return Array.from(h.values());
      }), Tt(
        E,
        l,
        $.current,
        V
      ), p && p({
        updateLog: U,
        update: at
      }), $.current?.serverSync) {
        const b = a.getState().serverState[l], v = $.current?.serverSync;
        Ct(l, {
          syncKey: typeof v.syncKey == "string" ? v.syncKey : v.syncKey({ state: E }),
          rollBackState: b,
          actionTimeStamp: Date.now() + (v.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  a.getState().updaterState[l] || (B(
    l,
    Z(
      l,
      R,
      i.current,
      V
    )
  ), a.getState().cogsStateStore[l] || x(l, t), a.getState().initialStateGlobal[l] || nt(l, t));
  const Q = It(() => Z(
    l,
    R,
    i.current,
    V
  ), [l]);
  return [gt(l), Q];
}
function Z(t, o, u, f) {
  const c = /* @__PURE__ */ new Map();
  let p = 0;
  const _ = (s) => {
    const e = s.join(".");
    for (const [I] of c)
      (I === e || I.startsWith(e + ".")) && c.delete(I);
    p++;
  }, y = /* @__PURE__ */ new Map(), g = {
    removeValidation: (s) => {
      s?.validationKey && O(s.validationKey);
    },
    revertToInitialState: (s) => {
      const e = a.getState().getInitialOptions(t)?.validation;
      e?.key && O(e?.key), s?.validationKey && O(s.validationKey);
      const I = a.getState().initialStateGlobal[t];
      c.clear(), p++;
      const V = w(I, []);
      J(() => {
        B(t, V), x(t, I);
        const k = a.getState().stateComponents.get(t);
        k && k.components.forEach((U) => {
          U.forceUpdate();
        });
        const l = et(t);
        l?.localStorage?.key && localStorage.removeItem(
          l?.initState ? f + "-" + t + "-" + l?.localStorage?.key : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (s) => {
      c.clear(), p++;
      const e = Z(
        t,
        o,
        u,
        f
      );
      return J(() => {
        nt(t, s), B(t, e), x(t, s);
        const I = a.getState().stateComponents.get(t);
        I && I.components.forEach((V) => {
          V.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (I) => e.get()[I]
      };
    },
    _initialState: a.getState().initialStateGlobal[t],
    _serverState: a.getState().serverState[t],
    _isLoading: a.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const s = a.getState().serverState[t];
      return !!(s && G(s, gt(t)));
    }
  };
  function w(s, e = [], I) {
    const V = e.map(String).join(".");
    c.get(V);
    const k = function() {
      return a().getNestedState(t, e);
    };
    Object.keys(g).forEach((P) => {
      k[P] = g[P];
    });
    const l = {
      apply(P, i, $) {
        return a().getNestedState(t, e);
      },
      get(P, i) {
        if (i !== "then" && !i.startsWith("$") && i !== "stateMapNoRender") {
          const n = e.join("."), r = `${t}////${u}`, d = a.getState().stateComponents.get(t);
          if (d) {
            const S = d.components.get(r);
            S && (e.length > 0 || i === "get") && S.paths.add(n);
          }
        }
        if (i === "showValidationErrors")
          return () => {
            const n = a.getState().getInitialOptions(t)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return a.getState().getValidationErrors(n.key + "." + e.join("."));
          };
        if (Array.isArray(s)) {
          if (i === "getSelected")
            return () => {
              const n = y.get(e.join("."));
              if (n !== void 0)
                return w(
                  s[n],
                  [...e, n.toString()],
                  I
                );
            };
          if (i === "stateMap" || i === "stateMapNoRender")
            return (n) => {
              const r = I?.filtered?.some(
                (S) => S.join(".") === e.join(".")
              ), d = r ? s : a.getState().getNestedState(t, e);
              return i !== "stateMapNoRender" && (c.clear(), p++), d.map((S, m) => {
                const E = r && S.__origIndex ? S.__origIndex : m, j = w(
                  S,
                  [...e, E.toString()],
                  I
                );
                return n(
                  S,
                  j,
                  m,
                  s,
                  w(s, e, I)
                );
              });
            };
          if (i === "$stateMap")
            return (n) => H(Mt, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: w
            });
          if (i === "stateFlattenOn")
            return (n) => {
              const d = I?.filtered?.some(
                (m) => m.join(".") === e.join(".")
              ) ? s : a.getState().getNestedState(t, e);
              c.clear(), p++;
              const S = d.flatMap(
                (m, E) => m[n] ?? []
              );
              return w(
                S,
                [...e, "[*]", n],
                I
              );
            };
          if (i === "findWith")
            return (n, r) => {
              const d = s.findIndex(
                (E) => E[n] === r
              );
              if (d === -1) return;
              const S = s[d], m = [...e, d.toString()];
              return c.clear(), p++, c.clear(), p++, w(S, m);
            };
          if (i === "index")
            return (n) => {
              const r = s[n];
              return w(r, [...e, n.toString()]);
            };
          if (i === "insert")
            return (n) => (_(e), st(o, n, e, t), w(
              a.getState().cogsStateStore[t],
              []
            ));
          if (i === "uniqueInsert")
            return (n, r, d) => {
              const S = a.getState().getNestedState(t, e), m = ft(n) ? n(S) : n;
              let E = null;
              if (!S.some((A) => {
                if (r) {
                  const F = r.every(
                    (W) => G(A[W], m[W])
                  );
                  return F && (E = A), F;
                }
                const M = G(A, m);
                return M && (E = A), M;
              }))
                _(e), st(o, m, e, t);
              else if (d && E) {
                const A = d(E), M = S.map(
                  (F) => G(F, E) ? A : F
                );
                _(e), q(o, M, e);
              }
            };
          if (i === "cut")
            return (n, r) => {
              r?.waitForSync || (_(e), ct(o, e, t, n));
            };
          if (i === "stateFilter")
            return (n) => {
              const r = s.map((m, E) => ({
                ...m,
                __origIndex: E.toString()
              })), d = [], S = [];
              for (let m = 0; m < r.length; m++)
                n(r[m], m) && (d.push(m), S.push(r[m]));
              return c.clear(), p++, w(S, e, {
                filtered: [...I?.filtered || [], e],
                validIndices: d
                // Always pass validIndices, even if empty
              });
            };
        }
        const $ = e[e.length - 1];
        if (!isNaN(Number($))) {
          const n = e.slice(0, -1), r = a.getState().getNestedState(t, n);
          if (Array.isArray(r) && i === "cut")
            return () => ct(
              o,
              n,
              t,
              Number($)
            );
        }
        if (i === "get")
          return () => a.getState().getNestedState(t, e);
        if (i === "$derive")
          return (n) => X({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (i === "$derive")
          return (n) => X({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (i === "$get")
          return () => X({
            _stateKey: t,
            _path: e
          });
        if (i === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return a.getState().getSyncInfo(n);
        }
        if (i === "_selected") {
          const n = e.slice(0, -1), r = n.join("."), d = a.getState().getNestedState(t, n);
          return Array.isArray(d) ? Number(e[e.length - 1]) === y.get(r) : void 0;
        }
        if (i == "getLocalStorage")
          return (n) => St(f + "-" + t + "-" + n);
        if (i === "setSelected")
          return (n) => {
            const r = e.slice(0, -1), d = Number(e[e.length - 1]), S = r.join(".");
            n ? y.set(S, d) : y.delete(S);
            const m = a.getState().getNestedState(t, [...r]);
            q(o, m, r), _(r);
          };
        if (e.length == 0) {
          if (i === "validateZodSchema")
            return () => {
              const n = a.getState().getInitialOptions(t)?.validation, r = a.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              O(n.key);
              const d = a.getState().cogsStateStore[t];
              try {
                const S = a.getState().getValidationErrors(n.key);
                S && S.length > 0 && S.forEach(([E]) => {
                  E && E.startsWith(n.key) && O(E);
                });
                const m = n.zodSchema.safeParse(d);
                return m.success ? !0 : (m.error.errors.forEach((j) => {
                  const A = j.path, M = j.message, F = [n.key, ...A].join(".");
                  r(F, M);
                }), mt(t), !1);
              } catch (S) {
                return console.error("Zod schema validation failed", S), !1;
              }
            };
          if (i === "_componentId") return u;
          if (i === "getComponents")
            return () => a().stateComponents.get(t);
          if (i === "getAllFormRefs")
            return () => lt.getState().getFormRefsByStateKey(t);
          if (i === "_initialState")
            return a.getState().initialStateGlobal[t];
          if (i === "_serverState")
            return a.getState().serverState[t];
          if (i === "_isLoading")
            return a.getState().isLoadingGlobal[t];
          if (i === "revertToInitialState")
            return g.revertToInitialState;
          if (i === "updateInitialState") return g.updateInitialState;
          if (i === "removeValidation") return g.removeValidation;
        }
        if (i === "getFormRef")
          return () => lt.getState().getFormRef(t + "." + e.join("."));
        if (i === "validationWrapper")
          return ({
            children: n,
            hideMessage: r
          }) => /* @__PURE__ */ it(
            wt,
            {
              formOpts: r ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: a.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: I?.validIndices,
              children: n
            }
          );
        if (i === "_stateKey") return t;
        if (i === "_path") return e;
        if (i === "_isServerSynced") return g._isServerSynced;
        if (i === "update")
          return (n, r) => {
            if (r?.debounce)
              pt(() => {
                q(o, n, e, "");
                const d = a.getState().getNestedState(t, e);
                r?.afterUpdate && r.afterUpdate(d);
              }, r.debounce);
            else {
              q(o, n, e, "");
              const d = a.getState().getNestedState(t, e);
              r?.afterUpdate && r.afterUpdate(d);
            }
            _(e);
          };
        if (i === "formElement")
          return (n, r) => /* @__PURE__ */ it(
            Nt,
            {
              setState: o,
              stateKey: t,
              path: e,
              child: n,
              formOpts: r
            }
          );
        const R = [...e, i], Q = a.getState().getNestedState(t, R);
        return w(Q, R, I);
      }
    }, U = new Proxy(k, l);
    return c.set(V, {
      proxy: U,
      stateVersion: p
    }), U;
  }
  return w(
    a.getState().getNestedState(t, [])
  );
}
function X(t) {
  return H(bt, { proxy: t });
}
function Mt({
  proxy: t,
  rebuildStateShape: o
}) {
  const u = a().getNestedState(t._stateKey, t._path);
  return Array.isArray(u) ? o(
    u,
    t._path
  ).stateMapNoRender(
    (c, p, _, y, g) => t._mapFn(c, p, _, y, g)
  ) : null;
}
function bt({
  proxy: t
}) {
  const o = z(null), u = `${t._stateKey}-${t._path.join(".")}`;
  return K(() => {
    const f = o.current;
    if (!f || !f.parentElement) return;
    const c = f.parentElement, _ = Array.from(c.childNodes).indexOf(f);
    let y = c.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, c.setAttribute("data-parent-id", y));
    const w = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: _,
      effect: t._effect
    };
    a.getState().addSignalElement(u, w);
    const s = a.getState().getNestedState(t._stateKey, t._path);
    let e;
    if (t._effect)
      try {
        e = new Function(
          "state",
          `return (${t._effect})(state)`
        )(s);
      } catch (V) {
        console.error("Error evaluating effect function during mount:", V), e = s;
      }
    else
      e = s;
    e !== null && typeof e == "object" && (e = JSON.stringify(e));
    const I = document.createTextNode(String(e));
    f.replaceWith(I);
  }, [t._stateKey, t._path.join("."), t._effect]), H("span", {
    ref: o,
    style: { display: "none" },
    "data-signal-id": u
  });
}
function Jt(t) {
  const o = Et(
    (u) => {
      const f = a.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(t._stateKey, {
        forceUpdate: u,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => f.components.delete(t._stateKey);
    },
    () => a.getState().getNestedState(t._stateKey, t._path)
  );
  return H("text", {}, String(o));
}
export {
  X as $cogsSignal,
  Jt as $cogsSignalStore,
  Wt as addStateOptions,
  qt as createCogsState,
  zt as notifyComponent,
  jt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
