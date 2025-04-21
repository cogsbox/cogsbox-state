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
  const u = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, c = u(t) || {};
  return console.log("setAndMergeOptions", t, c, a), f(t, {
    ...c,
    ...a
  }), {
    ...c,
    ...a
  };
}
function ut({
  stateKey: t,
  options: a,
  initialOptionsPart: u
}) {
  const f = et(t) || {}, c = u[t] || {}, _ = o.getState().setInitialStateOptions, w = { ...c, ...f };
  let y = !1;
  if (a)
    for (const g in a)
      w.hasOwnProperty(g) || (y = !0, console.log(
        "setOptions needToAdd",
        g,
        a[g]
      ), w[g] = a[g]);
  y && _(t, w);
}
function Wt(t, { formElements: a, validation: u }) {
  return { initialState: t, formElements: a, validation: u };
}
const qt = (t, a) => {
  let u = t;
  const [f, c] = _t(u);
  (a?.formElements || a?.validation) && Object.keys(c).forEach((y) => {
    c[y] = c[y] || {}, c[y].formElements = {
      ...a.formElements,
      // Global defaults first
      ...a?.validation,
      ...c[y].formElements || {}
      // State-specific overrides
    };
  }), o.getState().setInitialStates(f);
  const _ = (y, g) => {
    const [p] = Y(g?.componentId ?? tt());
    ut({
      stateKey: y,
      options: g,
      initialOptionsPart: c
    });
    const s = o.getState().cogsStateStore[y] || f[y], e = g?.modifyState ? g.modifyState(s) : s;
    g?.log && console.log("useCogsState", y, g);
    const [I, V] = Ot(
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
        initState: g?.initState
      }
    );
    return V;
  };
  function w(y, g) {
    ut({ stateKey: y, options: g, initialOptionsPart: c });
  }
  return { useCogsState: _, setCogsOptions: w };
}, {
  setUpdaterState: B,
  setState: x,
  getInitialOptions: et,
  getKeyState: gt,
  getValidationErrors: $t,
  setStateLog: ht,
  updateInitialStateGlobal: nt,
  addValidationError: At,
  removeValidationError: b,
  setServerSyncActions: Ct
} = o.getState(), St = (t) => {
  if (!t) return null;
  try {
    const a = window.localStorage.getItem(t);
    return a ? JSON.parse(a) : null;
  } catch (a) {
    return console.error("Error loading from localStorage:", a), null;
  }
}, Tt = (t, a, u, f) => {
  if (u.log && console.log(
    "saving to localstorage",
    a,
    u.localStorage?.key,
    f
  ), u.localStorage?.key && f) {
    const c = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: o.getState().serverSyncLog[a]?.[0]?.timeStamp,
      baseServerState: o.getState().serverState[a]
    }, _ = `${f}-${a}-${u.localStorage?.key}`;
    window.localStorage.setItem(_, JSON.stringify(c));
  }
}, Ft = (t, a, u, f, c, _) => {
  const w = {
    initialState: a,
    updaterState: Z(
      t,
      f,
      c,
      _
    ),
    state: u
  };
  J(() => {
    nt(t, w.initialState), B(t, w.updaterState), x(t, w.state);
  });
}, mt = (t) => {
  const a = o.getState().stateComponents.get(t);
  if (!a) return;
  const u = /* @__PURE__ */ new Set();
  a.components.forEach((f) => {
    u.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    J(() => {
      u.forEach((f) => f());
    });
  });
}, zt = (t, a) => {
  const u = o.getState().stateComponents.get(t);
  if (u) {
    const f = `${t}////${a}`, c = u.components.get(f);
    c && c.forceUpdate();
  }
};
function Ot(t, {
  stateKey: a,
  serverSync: u,
  localStorage: f,
  formElements: c,
  middleware: _,
  reactiveDeps: w,
  reactiveType: y,
  componentId: g,
  initState: p,
  syncUpdate: s
} = {}) {
  const [e, I] = Y({}), { sessionId: V } = Vt();
  let k = !a;
  const [l] = Y(a ?? tt()), R = o.getState().stateLog[l], U = z(/* @__PURE__ */ new Set()), i = z(g ?? tt()), $ = z(null);
  $.current = et(l), K(() => {
    if (s && s.stateKey === l && s.path?.[0]) {
      x(l, (r) => ({
        ...r,
        [s.path[0]]: s.newValue
      }));
      const n = `${s.stateKey}:${s.path.join(".")}`;
      o.getState().setSyncInfo(n, {
        timeStamp: s.timeStamp,
        userId: s.userId
      });
    }
  }, [s]), $.current.log && (console.log(
    "latestInitialOptionsRef.current ",
    $.current
  ), console.log("latestInitialOptionsRef.current localStorage", f)), K(() => {
    dt(l, {
      initState: p
    });
    const n = $.current;
    let r = null;
    n.log && console.log("newoptions", n), n.localStorage?.key && V && (r = St(
      V + "-" + l + "-" + n.localStorage?.key
    ));
    let d = null;
    p?.initialState && (d = p?.initialState, r && r.lastUpdated > (r.lastSyncedWithServer || 0) && (d = r.state), Ft(
      l,
      p?.initialState,
      d,
      P,
      i.current,
      V
    ), mt(l), I({}));
  }, [...p?.dependencies || []]), vt(() => {
    k && dt(l, {
      serverSync: u,
      formElements: c,
      initState: p,
      localStorage: f,
      middleware: _
    });
    const n = `${l}////${i.current}`, r = o.getState().stateComponents.get(l) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(n, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: w || void 0,
      reactiveType: y ?? ["component", "deps"]
    }), o.getState().stateComponents.set(l, r), I({}), () => {
      const d = `${l}////${i.current}`;
      r && (r.components.delete(d), r.components.size === 0 && o.getState().stateComponents.delete(l));
    };
  }, []);
  const P = (n, r, d, S) => {
    if (Array.isArray(r)) {
      const m = `${l}-${r.join(".")}`;
      U.current.add(m);
    }
    x(l, (m) => {
      const E = ft(n) ? n(m) : n, O = `${l}-${r.join(".")}`;
      if (O) {
        let M = !1, v = o.getState().signalDomElements.get(O);
        if ((!v || v.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const h = r.slice(0, -1), C = L(E, h);
          if (Array.isArray(C)) {
            M = !0;
            const N = `${l}-${h.join(".")}`;
            v = o.getState().signalDomElements.get(N);
          }
        }
        if (v) {
          const h = M ? L(E, r.slice(0, -1)) : L(E, r);
          v.forEach(({ parentId: C, position: N, effect: D }) => {
            const T = document.querySelector(
              `[data-parent-id="${C}"]`
            );
            if (T) {
              const at = Array.from(T.childNodes);
              if (at[N]) {
                const yt = D ? new Function("state", `return (${D})(state)`)(h) : h;
                at[N].textContent = String(yt);
              }
            }
          });
        }
      }
      d.updateType === "update" && (S || $.current?.validationKey) && r && b(
        (S || $.current?.validationKey) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      d.updateType === "cut" && $.current?.validationKey && b(
        $.current?.validationKey + "." + A.join(".")
      ), d.updateType === "insert" && $.current?.validationKey && $t(
        $.current?.validationKey + "." + A.join(".")
      ).filter(([v, h]) => {
        let C = v?.split(".").length;
        if (v == A.join(".") && C == A.length - 1) {
          let N = v + "." + A;
          b(v), At(N, h);
        }
      });
      const j = L(m, r), F = L(E, r), W = d.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), rt = o.getState().stateComponents.get(l);
      if (rt)
        for (const [M, v] of rt.components.entries()) {
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
      const ot = {
        timeStamp: Date.now(),
        stateKey: l,
        path: r,
        updateType: d.updateType,
        status: "new",
        oldValue: j,
        newValue: F
      };
      if (ht(l, (M) => {
        const h = [...M ?? [], ot].reduce((C, N) => {
          const D = `${N.stateKey}:${JSON.stringify(N.path)}`, T = C.get(D);
          return T ? (T.timeStamp = Math.max(T.timeStamp, N.timeStamp), T.newValue = N.newValue, T.oldValue = T.oldValue ?? N.oldValue, T.updateType = N.updateType) : C.set(D, { ...N }), C;
        }, /* @__PURE__ */ new Map());
        return Array.from(h.values());
      }), Tt(
        E,
        l,
        $.current,
        V
      ), _ && _({
        updateLog: R,
        update: ot
      }), $.current?.serverSync) {
        const M = o.getState().serverState[l], v = $.current?.serverSync;
        Ct(l, {
          syncKey: typeof v.syncKey == "string" ? v.syncKey : v.syncKey({ state: E }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (v.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[l] || (B(
    l,
    Z(
      l,
      P,
      i.current,
      V
    )
  ), o.getState().cogsStateStore[l] || x(l, t), o.getState().initialStateGlobal[l] || nt(l, t));
  const Q = It(() => Z(
    l,
    P,
    i.current,
    V
  ), [l]);
  return [gt(l), Q];
}
function Z(t, a, u, f) {
  const c = /* @__PURE__ */ new Map();
  let _ = 0;
  const w = (s) => {
    const e = s.join(".");
    for (const [I] of c)
      (I === e || I.startsWith(e + ".")) && c.delete(I);
    _++;
  }, y = /* @__PURE__ */ new Map(), g = {
    removeValidation: (s) => {
      s?.validationKey && b(s.validationKey);
    },
    revertToInitialState: (s) => {
      const e = o.getState().getInitialOptions(t)?.validation;
      e?.key && b(e?.key), s?.validationKey && b(s.validationKey);
      const I = o.getState().initialStateGlobal[t];
      c.clear(), _++;
      const V = p(I, []);
      J(() => {
        B(t, V), x(t, I);
        const k = o.getState().stateComponents.get(t);
        k && k.components.forEach((R) => {
          R.forceUpdate();
        });
        const l = et(t);
        l?.localStorage?.key && localStorage.removeItem(
          l?.initState ? f + "-" + t + "-" + l?.localStorage?.key : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (s) => {
      c.clear(), _++;
      const e = Z(
        t,
        a,
        u,
        f
      );
      return J(() => {
        nt(t, s), B(t, e), x(t, s);
        const I = o.getState().stateComponents.get(t);
        I && I.components.forEach((V) => {
          V.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (I) => e.get()[I]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const s = o.getState().serverState[t];
      return !!(s && G(s, gt(t)));
    }
  };
  function p(s, e = [], I) {
    const V = e.map(String).join(".");
    c.get(V);
    const k = function() {
      return o().getNestedState(t, e);
    };
    Object.keys(g).forEach((U) => {
      k[U] = g[U];
    });
    const l = {
      apply(U, i, $) {
        return o().getNestedState(t, e);
      },
      get(U, i) {
        if (i !== "then" && !i.startsWith("$") && i !== "stateMapNoRender") {
          const n = e.join("."), r = `${t}////${u}`, d = o.getState().stateComponents.get(t);
          if (d) {
            const S = d.components.get(r);
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
        if (Array.isArray(s)) {
          if (i === "getSelected")
            return () => {
              const n = y.get(e.join("."));
              if (n !== void 0)
                return p(
                  s[n],
                  [...e, n.toString()],
                  I
                );
            };
          if (i === "stateMap" || i === "stateMapNoRender")
            return (n) => {
              const r = I?.filtered?.some(
                (S) => S.join(".") === e.join(".")
              ), d = r ? s : o.getState().getNestedState(t, e);
              return i !== "stateMapNoRender" && (c.clear(), _++), d.map((S, m) => {
                const E = r && S.__origIndex ? S.__origIndex : m, O = p(
                  S,
                  [...e, E.toString()],
                  I
                );
                return n(
                  S,
                  O,
                  m,
                  s,
                  p(s, e, I)
                );
              });
            };
          if (i === "$stateMap")
            return (n) => H(jt, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: p
            });
          if (i === "stateFlattenOn")
            return (n) => {
              const d = I?.filtered?.some(
                (m) => m.join(".") === e.join(".")
              ) ? s : o.getState().getNestedState(t, e);
              c.clear(), _++;
              const S = d.flatMap(
                (m, E) => m[n] ?? []
              );
              return p(
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
              return c.clear(), _++, c.clear(), _++, p(S, m);
            };
          if (i === "index")
            return (n) => {
              const r = s[n];
              return p(r, [...e, n.toString()]);
            };
          if (i === "insert")
            return (n) => (w(e), st(a, n, e, t), p(
              o.getState().cogsStateStore[t],
              []
            ));
          if (i === "uniqueInsert")
            return (n, r, d) => {
              const S = o.getState().getNestedState(t, e), m = ft(n) ? n(S) : n;
              let E = null;
              if (!S.some((A) => {
                if (r) {
                  const F = r.every(
                    (W) => G(A[W], m[W])
                  );
                  return F && (E = A), F;
                }
                const j = G(A, m);
                return j && (E = A), j;
              }))
                w(e), st(a, m, e, t);
              else if (d && E) {
                const A = d(E), j = S.map(
                  (F) => G(F, E) ? A : F
                );
                w(e), q(a, j, e);
              }
            };
          if (i === "cut")
            return (n, r) => {
              r?.waitForSync || (w(e), ct(a, e, t, n));
            };
          if (i === "stateFilter")
            return (n) => {
              const r = s.map((m, E) => ({
                ...m,
                __origIndex: E.toString()
              })), d = [], S = [];
              for (let m = 0; m < r.length; m++)
                n(r[m], m) && (d.push(m), S.push(r[m]));
              return c.clear(), _++, p(S, e, {
                filtered: [...I?.filtered || [], e],
                validIndices: d
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
          const n = e.slice(0, -1), r = n.join("."), d = o.getState().getNestedState(t, n);
          return Array.isArray(d) ? Number(e[e.length - 1]) === y.get(r) : void 0;
        }
        if (i == "getLocalStorage")
          return (n) => St(f + "-" + t + "-" + n);
        if (i === "setSelected")
          return (n) => {
            const r = e.slice(0, -1), d = Number(e[e.length - 1]), S = r.join(".");
            n ? y.set(S, d) : y.delete(S);
            const m = o.getState().getNestedState(t, [...r]);
            q(a, m, r), w(r);
          };
        if (e.length == 0) {
          if (i === "validateZodSchema")
            return () => {
              const n = o.getState().getInitialOptions(t)?.validation, r = o.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              b(n.key);
              const d = o.getState().cogsStateStore[t];
              try {
                const S = o.getState().getValidationErrors(n.key);
                S && S.length > 0 && S.forEach(([E]) => {
                  E && E.startsWith(n.key) && b(E);
                });
                const m = n.zodSchema.safeParse(d);
                return m.success ? !0 : (m.error.errors.forEach((O) => {
                  const A = O.path, j = O.message, F = [n.key, ...A].join(".");
                  r(F, j);
                }), mt(t), !1);
              } catch (S) {
                return console.error("Zod schema validation failed", S), !1;
              }
            };
          if (i === "_componentId") return u;
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
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
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
                q(a, n, e, "");
                const d = o.getState().getNestedState(t, e);
                r?.afterUpdate && r.afterUpdate(d);
              }, r.debounce);
            else {
              q(a, n, e, "");
              const d = o.getState().getNestedState(t, e);
              r?.afterUpdate && r.afterUpdate(d);
            }
            w(e);
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
        const P = [...e, i], Q = o.getState().getNestedState(t, P);
        return p(Q, P, I);
      }
    }, R = new Proxy(k, l);
    return c.set(V, {
      proxy: R,
      stateVersion: _
    }), R;
  }
  return p(
    o.getState().getNestedState(t, [])
  );
}
function X(t) {
  return H(Mt, { proxy: t });
}
function jt({
  proxy: t,
  rebuildStateShape: a
}) {
  const u = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(u) ? a(
    u,
    t._path
  ).stateMapNoRender(
    (c, _, w, y, g) => t._mapFn(c, _, w, y, g)
  ) : null;
}
function Mt({
  proxy: t
}) {
  const a = z(null), u = `${t._stateKey}-${t._path.join(".")}`;
  return K(() => {
    const f = a.current;
    if (!f || !f.parentElement) return;
    const c = f.parentElement, w = Array.from(c.childNodes).indexOf(f);
    let y = c.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, c.setAttribute("data-parent-id", y));
    const p = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: w,
      effect: t._effect
    };
    o.getState().addSignalElement(u, p);
    const s = o.getState().getNestedState(t._stateKey, t._path);
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
    ref: a,
    style: { display: "none" },
    "data-signal-id": u
  });
}
function Jt(t) {
  const a = Et(
    (u) => {
      const f = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(t._stateKey, {
        forceUpdate: u,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => f.components.delete(t._stateKey);
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
  Ot as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
