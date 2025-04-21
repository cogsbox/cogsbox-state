"use client";
import { jsx as it } from "react/jsx-runtime";
import { useState as Y, useRef as z, useEffect as K, useLayoutEffect as vt, useMemo as It, createElement as H, useSyncExternalStore as Et, startTransition as J } from "react";
import { transformStateFunc as _t, isFunction as ft, getNestedValue as L, isDeepEqual as G, debounce as pt } from "./utility.js";
import { pushFunc as st, updateFn as q, cutFunc as ct, ValidationWrapper as wt, FormControlComponent as Nt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as o, formRefStore as lt } from "./store.js";
import { useCogsConfig as Vt } from "./CogsStateClient.jsx";
import tt from "./node_modules/uuid/dist/esm-browser/v4.js";
function dt(t, a) {
  const f = o.getState().getInitialOptions, g = o.getState().setInitialStateOptions, s = f(t) || {};
  return console.log("setAndMergeOptions", t, s, a), g(t, {
    ...s,
    ...a
  }), {
    ...s,
    ...a
  };
}
function ut({
  stateKey: t,
  options: a,
  initialOptionsPart: f
}) {
  const g = et(t) || {}, s = f[t] || {}, p = o.getState().setInitialStateOptions, _ = { ...s, ...g };
  let y = !1;
  if (a)
    for (const l in a)
      _.hasOwnProperty(l) ? l == "localStorage" && _[l] && (console.log(
        "localStorage needToAdd",
        l,
        a[l]
      ), y = !0, _[l] = a[l]) : (y = !0, console.log(
        "setOptions needToAdd",
        l,
        a[l]
      ), _[l] = a[l]);
  return y && p(t, _), _;
}
function Wt(t, { formElements: a, validation: f }) {
  return { initialState: t, formElements: a, validation: f };
}
const qt = (t, a) => {
  let f = t;
  const [g, s] = _t(f);
  (a?.formElements || a?.validation) && Object.keys(s).forEach((y) => {
    s[y] = s[y] || {}, s[y].formElements = {
      ...a.formElements,
      // Global defaults first
      ...a?.validation,
      ...s[y].formElements || {}
      // State-specific overrides
    };
  }), o.getState().setInitialStates(g);
  const p = (y, l) => {
    const [w] = Y(l?.componentId ?? tt()), c = ut({
      stateKey: y,
      options: l,
      initialOptionsPart: s
    });
    l && Object.keys(l).length > 0 && console.log(
      "useCogsState",
      y,
      l,
      s,
      c
    );
    const e = o.getState().cogsStateStore[y] || g[y], v = l?.modifyState ? l.modifyState(e) : e, [V, F] = jt(
      v,
      {
        stateKey: y,
        syncUpdate: l?.syncUpdate,
        componentId: w,
        localStorage: l?.localStorage,
        middleware: l?.middleware,
        enabledSync: l?.enabledSync,
        reactiveType: l?.reactiveType,
        reactiveDeps: l?.reactiveDeps,
        initState: l?.initState
      }
    );
    return F;
  };
  function _(y, l) {
    ut({ stateKey: y, options: l, initialOptionsPart: s });
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
  removeValidationError: k,
  setServerSyncActions: Tt
} = o.getState(), St = (t) => {
  if (!t) return null;
  try {
    const a = window.localStorage.getItem(t);
    return a ? JSON.parse(a) : null;
  } catch (a) {
    return console.error("Error loading from localStorage:", a), null;
  }
}, Ct = (t, a, f, g) => {
  if (f.log && console.log(
    "saving to localstorage",
    a,
    f.localStorage?.key,
    g
  ), f.localStorage?.key && g) {
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: o.getState().serverSyncLog[a]?.[0]?.timeStamp,
      baseServerState: o.getState().serverState[a]
    }, p = `${g}-${a}-${f.localStorage?.key}`;
    window.localStorage.setItem(p, JSON.stringify(s));
  }
}, Ft = (t, a, f, g, s, p) => {
  const _ = {
    initialState: a,
    updaterState: Z(
      t,
      g,
      s,
      p
    ),
    state: f
  };
  J(() => {
    nt(t, _.initialState), B(t, _.updaterState), x(t, _.state);
  });
}, mt = (t) => {
  const a = o.getState().stateComponents.get(t);
  if (!a) return;
  const f = /* @__PURE__ */ new Set();
  a.components.forEach((g) => {
    f.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    J(() => {
      f.forEach((g) => g());
    });
  });
}, zt = (t, a) => {
  const f = o.getState().stateComponents.get(t);
  if (f) {
    const g = `${t}////${a}`, s = f.components.get(g);
    s && s.forceUpdate();
  }
};
function jt(t, {
  stateKey: a,
  serverSync: f,
  localStorage: g,
  formElements: s,
  middleware: p,
  reactiveDeps: _,
  reactiveType: y,
  componentId: l,
  initState: w,
  syncUpdate: c
} = {}) {
  const [e, v] = Y({}), { sessionId: V } = Vt();
  let F = !a;
  const [d] = Y(a ?? tt()), U = o.getState().stateLog[d], P = z(/* @__PURE__ */ new Set()), i = z(l ?? tt()), $ = z(null);
  $.current = et(d), K(() => {
    if (c && c.stateKey === d && c.path?.[0]) {
      x(d, (r) => ({
        ...r,
        [c.path[0]]: c.newValue
      }));
      const n = `${c.stateKey}:${c.path.join(".")}`;
      o.getState().setSyncInfo(n, {
        timeStamp: c.timeStamp,
        userId: c.userId
      });
    }
  }, [c]), K(() => {
    dt(d, {
      initState: w
    });
    const n = $.current;
    let r = null;
    n.log && console.log("newoptions", n), n.localStorage?.key && V && (r = St(
      V + "-" + d + "-" + n.localStorage?.key
    ));
    let u = null;
    w?.initialState && (u = w?.initialState, r && r.lastUpdated > (r.lastSyncedWithServer || 0) && (u = r.state), Ft(
      d,
      w?.initialState,
      u,
      R,
      i.current,
      V
    ), mt(d), v({}));
  }, [...w?.dependencies || []]), vt(() => {
    F && dt(d, {
      serverSync: f,
      formElements: s,
      initState: w,
      localStorage: g,
      middleware: p
    });
    const n = `${d}////${i.current}`, r = o.getState().stateComponents.get(d) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(n, {
      forceUpdate: () => v({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: y ?? ["component", "deps"]
    }), o.getState().stateComponents.set(d, r), v({}), () => {
      const u = `${d}////${i.current}`;
      r && (r.components.delete(u), r.components.size === 0 && o.getState().stateComponents.delete(d));
    };
  }, []);
  const R = (n, r, u, S) => {
    if (Array.isArray(r)) {
      const m = `${d}-${r.join(".")}`;
      P.current.add(m);
    }
    x(d, (m) => {
      const E = ft(n) ? n(m) : n, O = `${d}-${r.join(".")}`;
      if (O) {
        let M = !1, I = o.getState().signalDomElements.get(O);
        if ((!I || I.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const h = r.slice(0, -1), T = L(E, h);
          if (Array.isArray(T)) {
            M = !0;
            const N = `${d}-${h.join(".")}`;
            I = o.getState().signalDomElements.get(N);
          }
        }
        if (I) {
          const h = M ? L(E, r.slice(0, -1)) : L(E, r);
          I.forEach(({ parentId: T, position: N, effect: D }) => {
            const C = document.querySelector(
              `[data-parent-id="${T}"]`
            );
            if (C) {
              const at = Array.from(C.childNodes);
              if (at[N]) {
                const yt = D ? new Function("state", `return (${D})(state)`)(h) : h;
                at[N].textContent = String(yt);
              }
            }
          });
        }
      }
      u.updateType === "update" && (S || $.current?.validationKey) && r && k(
        (S || $.current?.validationKey) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      u.updateType === "cut" && $.current?.validationKey && k(
        $.current?.validationKey + "." + A.join(".")
      ), u.updateType === "insert" && $.current?.validationKey && $t(
        $.current?.validationKey + "." + A.join(".")
      ).filter(([I, h]) => {
        let T = I?.split(".").length;
        if (I == A.join(".") && T == A.length - 1) {
          let N = I + "." + A;
          k(I), At(N, h);
        }
      });
      const b = L(m, r), j = L(E, r), W = u.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), rt = o.getState().stateComponents.get(d);
      if (rt)
        for (const [M, I] of rt.components.entries()) {
          let h = !1;
          const T = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (!T.includes("none")) {
            if (T.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if (T.includes("component") && I.paths && (I.paths.has(W) || I.paths.has("")) && (h = !0), !h && T.includes("deps") && I.depsFunction) {
              const N = I.depsFunction(E);
              typeof N == "boolean" ? N && (h = !0) : G(I.deps, N) || (I.deps = N, h = !0);
            }
            h && I.forceUpdate();
          }
        }
      const ot = {
        timeStamp: Date.now(),
        stateKey: d,
        path: r,
        updateType: u.updateType,
        status: "new",
        oldValue: b,
        newValue: j
      };
      if (ht(d, (M) => {
        const h = [...M ?? [], ot].reduce((T, N) => {
          const D = `${N.stateKey}:${JSON.stringify(N.path)}`, C = T.get(D);
          return C ? (C.timeStamp = Math.max(C.timeStamp, N.timeStamp), C.newValue = N.newValue, C.oldValue = C.oldValue ?? N.oldValue, C.updateType = N.updateType) : T.set(D, { ...N }), T;
        }, /* @__PURE__ */ new Map());
        return Array.from(h.values());
      }), Ct(
        E,
        d,
        $.current,
        V
      ), p && p({
        updateLog: U,
        update: ot
      }), $.current?.serverSync) {
        const M = o.getState().serverState[d], I = $.current?.serverSync;
        Tt(d, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: E }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (I.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[d] || (B(
    d,
    Z(
      d,
      R,
      i.current,
      V
    )
  ), o.getState().cogsStateStore[d] || x(d, t), o.getState().initialStateGlobal[d] || nt(d, t));
  const Q = It(() => Z(
    d,
    R,
    i.current,
    V
  ), [d]);
  return [gt(d), Q];
}
function Z(t, a, f, g) {
  const s = /* @__PURE__ */ new Map();
  let p = 0;
  const _ = (c) => {
    const e = c.join(".");
    for (const [v] of s)
      (v === e || v.startsWith(e + ".")) && s.delete(v);
    p++;
  }, y = /* @__PURE__ */ new Map(), l = {
    removeValidation: (c) => {
      c?.validationKey && k(c.validationKey);
    },
    revertToInitialState: (c) => {
      const e = o.getState().getInitialOptions(t)?.validation;
      e?.key && k(e?.key), c?.validationKey && k(c.validationKey);
      const v = o.getState().initialStateGlobal[t];
      s.clear(), p++;
      const V = w(v, []);
      J(() => {
        B(t, V), x(t, v);
        const F = o.getState().stateComponents.get(t);
        F && F.components.forEach((U) => {
          U.forceUpdate();
        });
        const d = et(t);
        d?.localStorage?.key && localStorage.removeItem(
          d?.initState ? g + "-" + t + "-" + d?.localStorage?.key : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (c) => {
      s.clear(), p++;
      const e = Z(
        t,
        a,
        f,
        g
      );
      return J(() => {
        nt(t, c), B(t, e), x(t, c);
        const v = o.getState().stateComponents.get(t);
        v && v.components.forEach((V) => {
          V.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (v) => e.get()[v]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const c = o.getState().serverState[t];
      return !!(c && G(c, gt(t)));
    }
  };
  function w(c, e = [], v) {
    const V = e.map(String).join(".");
    s.get(V);
    const F = function() {
      return o().getNestedState(t, e);
    };
    Object.keys(l).forEach((P) => {
      F[P] = l[P];
    });
    const d = {
      apply(P, i, $) {
        return o().getNestedState(t, e);
      },
      get(P, i) {
        if (i !== "then" && !i.startsWith("$") && i !== "stateMapNoRender") {
          const n = e.join("."), r = `${t}////${f}`, u = o.getState().stateComponents.get(t);
          if (u) {
            const S = u.components.get(r);
            S && (e.length > 0 || i === "get") && S.paths.add(n);
          }
        }
        if (i === "showValidationErrors")
          return () => {
            const n = o.getState().getInitialOptions(t)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(n.key + "." + e.join("."));
          };
        if (Array.isArray(c)) {
          if (i === "getSelected")
            return () => {
              const n = y.get(e.join("."));
              if (n !== void 0)
                return w(
                  c[n],
                  [...e, n.toString()],
                  v
                );
            };
          if (i === "stateMap" || i === "stateMapNoRender")
            return (n) => {
              const r = v?.filtered?.some(
                (S) => S.join(".") === e.join(".")
              ), u = r ? c : o.getState().getNestedState(t, e);
              return i !== "stateMapNoRender" && (s.clear(), p++), u.map((S, m) => {
                const E = r && S.__origIndex ? S.__origIndex : m, O = w(
                  S,
                  [...e, E.toString()],
                  v
                );
                return n(
                  S,
                  O,
                  m,
                  c,
                  w(c, e, v)
                );
              });
            };
          if (i === "$stateMap")
            return (n) => H(Ot, {
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
              const u = v?.filtered?.some(
                (m) => m.join(".") === e.join(".")
              ) ? c : o.getState().getNestedState(t, e);
              s.clear(), p++;
              const S = u.flatMap(
                (m, E) => m[n] ?? []
              );
              return w(
                S,
                [...e, "[*]", n],
                v
              );
            };
          if (i === "findWith")
            return (n, r) => {
              const u = c.findIndex(
                (E) => E[n] === r
              );
              if (u === -1) return;
              const S = c[u], m = [...e, u.toString()];
              return s.clear(), p++, s.clear(), p++, w(S, m);
            };
          if (i === "index")
            return (n) => {
              const r = c[n];
              return w(r, [...e, n.toString()]);
            };
          if (i === "insert")
            return (n) => (_(e), st(a, n, e, t), w(
              o.getState().cogsStateStore[t],
              []
            ));
          if (i === "uniqueInsert")
            return (n, r, u) => {
              const S = o.getState().getNestedState(t, e), m = ft(n) ? n(S) : n;
              let E = null;
              if (!S.some((A) => {
                if (r) {
                  const j = r.every(
                    (W) => G(A[W], m[W])
                  );
                  return j && (E = A), j;
                }
                const b = G(A, m);
                return b && (E = A), b;
              }))
                _(e), st(a, m, e, t);
              else if (u && E) {
                const A = u(E), b = S.map(
                  (j) => G(j, E) ? A : j
                );
                _(e), q(a, b, e);
              }
            };
          if (i === "cut")
            return (n, r) => {
              r?.waitForSync || (_(e), ct(a, e, t, n));
            };
          if (i === "stateFilter")
            return (n) => {
              const r = c.map((m, E) => ({
                ...m,
                __origIndex: E.toString()
              })), u = [], S = [];
              for (let m = 0; m < r.length; m++)
                n(r[m], m) && (u.push(m), S.push(r[m]));
              return s.clear(), p++, w(S, e, {
                filtered: [...v?.filtered || [], e],
                validIndices: u
                // Always pass validIndices, even if empty
              });
            };
        }
        const $ = e[e.length - 1];
        if (!isNaN(Number($))) {
          const n = e.slice(0, -1), r = o.getState().getNestedState(t, n);
          if (Array.isArray(r) && i === "cut")
            return () => ct(
              a,
              n,
              t,
              Number($)
            );
        }
        if (i === "get")
          return () => o.getState().getNestedState(t, e);
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
          return o.getState().getSyncInfo(n);
        }
        if (i === "_selected") {
          const n = e.slice(0, -1), r = n.join("."), u = o.getState().getNestedState(t, n);
          return Array.isArray(u) ? Number(e[e.length - 1]) === y.get(r) : void 0;
        }
        if (i == "getLocalStorage")
          return (n) => St(g + "-" + t + "-" + n);
        if (i === "setSelected")
          return (n) => {
            const r = e.slice(0, -1), u = Number(e[e.length - 1]), S = r.join(".");
            n ? y.set(S, u) : y.delete(S);
            const m = o.getState().getNestedState(t, [...r]);
            q(a, m, r), _(r);
          };
        if (e.length == 0) {
          if (i === "validateZodSchema")
            return () => {
              const n = o.getState().getInitialOptions(t)?.validation, r = o.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              k(n.key);
              const u = o.getState().cogsStateStore[t];
              try {
                const S = o.getState().getValidationErrors(n.key);
                S && S.length > 0 && S.forEach(([E]) => {
                  E && E.startsWith(n.key) && k(E);
                });
                const m = n.zodSchema.safeParse(u);
                return m.success ? !0 : (m.error.errors.forEach((O) => {
                  const A = O.path, b = O.message, j = [n.key, ...A].join(".");
                  r(j, b);
                }), mt(t), !1);
              } catch (S) {
                return console.error("Zod schema validation failed", S), !1;
              }
            };
          if (i === "_componentId") return f;
          if (i === "getComponents")
            return () => o().stateComponents.get(t);
          if (i === "getAllFormRefs")
            return () => lt.getState().getFormRefsByStateKey(t);
          if (i === "_initialState")
            return o.getState().initialStateGlobal[t];
          if (i === "_serverState")
            return o.getState().serverState[t];
          if (i === "_isLoading")
            return o.getState().isLoadingGlobal[t];
          if (i === "revertToInitialState")
            return l.revertToInitialState;
          if (i === "updateInitialState") return l.updateInitialState;
          if (i === "removeValidation") return l.removeValidation;
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
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: v?.validIndices,
              children: n
            }
          );
        if (i === "_stateKey") return t;
        if (i === "_path") return e;
        if (i === "_isServerSynced") return l._isServerSynced;
        if (i === "update")
          return (n, r) => {
            if (r?.debounce)
              pt(() => {
                q(a, n, e, "");
                const u = o.getState().getNestedState(t, e);
                r?.afterUpdate && r.afterUpdate(u);
              }, r.debounce);
            else {
              q(a, n, e, "");
              const u = o.getState().getNestedState(t, e);
              r?.afterUpdate && r.afterUpdate(u);
            }
            _(e);
          };
        if (i === "formElement")
          return (n, r) => /* @__PURE__ */ it(
            Nt,
            {
              setState: a,
              stateKey: t,
              path: e,
              child: n,
              formOpts: r
            }
          );
        const R = [...e, i], Q = o.getState().getNestedState(t, R);
        return w(Q, R, v);
      }
    }, U = new Proxy(F, d);
    return s.set(V, {
      proxy: U,
      stateVersion: p
    }), U;
  }
  return w(
    o.getState().getNestedState(t, [])
  );
}
function X(t) {
  return H(bt, { proxy: t });
}
function Ot({
  proxy: t,
  rebuildStateShape: a
}) {
  const f = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(f) ? a(
    f,
    t._path
  ).stateMapNoRender(
    (s, p, _, y, l) => t._mapFn(s, p, _, y, l)
  ) : null;
}
function bt({
  proxy: t
}) {
  const a = z(null), f = `${t._stateKey}-${t._path.join(".")}`;
  return K(() => {
    const g = a.current;
    if (!g || !g.parentElement) return;
    const s = g.parentElement, _ = Array.from(s.childNodes).indexOf(g);
    let y = s.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, s.setAttribute("data-parent-id", y));
    const w = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: _,
      effect: t._effect
    };
    o.getState().addSignalElement(f, w);
    const c = o.getState().getNestedState(t._stateKey, t._path);
    let e;
    if (t._effect)
      try {
        e = new Function(
          "state",
          `return (${t._effect})(state)`
        )(c);
      } catch (V) {
        console.error("Error evaluating effect function during mount:", V), e = c;
      }
    else
      e = c;
    e !== null && typeof e == "object" && (e = JSON.stringify(e));
    const v = document.createTextNode(String(e));
    g.replaceWith(v);
  }, [t._stateKey, t._path.join("."), t._effect]), H("span", {
    ref: a,
    style: { display: "none" },
    "data-signal-id": f
  });
}
function Jt(t) {
  const a = Et(
    (f) => {
      const g = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: f,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return H("text", {}, String(a));
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
