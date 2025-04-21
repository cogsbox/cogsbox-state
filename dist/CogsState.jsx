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
  const u = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, d = u(t) || {};
  return f(t, {
    ...d,
    ...a
  }), {
    ...d,
    ...a
  };
}
function ut({
  stateKey: t,
  options: a,
  initialOptionsPart: u
}) {
  const f = et(t) || {}, d = u[t] || {}, _ = o.getState().setInitialStateOptions, p = { ...d, ...f };
  let y = !1;
  if (a)
    for (const g in a)
      p.hasOwnProperty(g) || (y = !0, (a.log || p.log) && console.log(
        "setOptions needToAdd",
        g,
        a[g]
      ), p[g] = a[g]);
  y && _(t, p);
}
function Wt(t, { formElements: a, validation: u }) {
  return { initialState: t, formElements: a, validation: u };
}
const qt = (t, a) => {
  let u = t;
  const [f, d] = _t(u);
  (a?.formElements || a?.validation) && Object.keys(d).forEach((y) => {
    d[y] = d[y] || {}, d[y].formElements = {
      ...a.formElements,
      // Global defaults first
      ...a?.validation,
      ...d[y].formElements || {}
      // State-specific overrides
    };
  }), o.getState().setInitialStates(f);
  const _ = (y, g) => {
    const [w] = Y(g?.componentId ?? tt());
    ut({
      stateKey: y,
      options: g,
      initialOptionsPart: d
    });
    const s = o.getState().cogsStateStore[y] || f[y], e = g?.modifyState ? g.modifyState(s) : s;
    g?.log && console.log("useCogsState", y, g);
    const [I, V] = Ot(
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
  function p(y, g) {
    ut({ stateKey: y, options: g, initialOptionsPart: d });
  }
  return { useCogsState: _, setCogsOptions: p };
}, {
  setUpdaterState: B,
  setState: x,
  getInitialOptions: et,
  getKeyState: gt,
  getValidationErrors: $t,
  setStateLog: ht,
  updateInitialStateGlobal: nt,
  addValidationError: At,
  removeValidationError: M,
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
    const d = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: o.getState().serverSyncLog[a]?.[0]?.timeStamp,
      baseServerState: o.getState().serverState[a]
    }, _ = `${f}-${a}-${u.localStorage?.key}`;
    window.localStorage.setItem(_, JSON.stringify(d));
  }
}, Ft = (t, a, u, f, d, _) => {
  const p = {
    initialState: a,
    updaterState: Z(
      t,
      f,
      d,
      _
    ),
    state: u
  };
  J(() => {
    nt(t, p.initialState), B(t, p.updaterState), x(t, p.state);
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
    const f = `${t}////${a}`, d = u.components.get(f);
    d && d.forceUpdate();
  }
};
function Ot(t, {
  stateKey: a,
  serverSync: u,
  localStorage: f,
  formElements: d,
  middleware: _,
  reactiveDeps: p,
  reactiveType: y,
  componentId: g,
  initState: w,
  syncUpdate: s
} = {}) {
  const [e, I] = Y({}), { sessionId: V } = Vt();
  let k = !a;
  const [c] = Y(a ?? tt()), R = o.getState().stateLog[c], U = z(/* @__PURE__ */ new Set()), i = z(g ?? tt()), $ = z(null);
  $.current = et(c), K(() => {
    if (s && s.stateKey === c && s.path?.[0]) {
      x(c, (r) => ({
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
    dt(c, {
      initState: w
    });
    const n = $.current;
    let r = null;
    n.log && console.log("newoptions", n), n.localStorage?.key && V && (r = St(
      V + "-" + c + "-" + n.localStorage?.key
    ));
    let l = null;
    w?.initialState && (l = w?.initialState, r && r.lastUpdated > (r.lastSyncedWithServer || 0) && (l = r.state), Ft(
      c,
      w?.initialState,
      l,
      P,
      i.current,
      V
    ), mt(c), I({}));
  }, [...w?.dependencies || []]), vt(() => {
    k && dt(c, {
      serverSync: u,
      formElements: d,
      initState: w,
      localStorage: f,
      middleware: _
    });
    const n = `${c}////${i.current}`, r = o.getState().stateComponents.get(c) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(n, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: p || void 0,
      reactiveType: y ?? ["component", "deps"]
    }), o.getState().stateComponents.set(c, r), I({}), () => {
      const l = `${c}////${i.current}`;
      r && (r.components.delete(l), r.components.size === 0 && o.getState().stateComponents.delete(c));
    };
  }, []);
  const P = (n, r, l, S) => {
    if (Array.isArray(r)) {
      const m = `${c}-${r.join(".")}`;
      U.current.add(m);
    }
    x(c, (m) => {
      const E = ft(n) ? n(m) : n, O = `${c}-${r.join(".")}`;
      if (O) {
        let b = !1, v = o.getState().signalDomElements.get(O);
        if ((!v || v.size === 0) && (l.updateType === "insert" || l.updateType === "cut")) {
          const h = r.slice(0, -1), C = L(E, h);
          if (Array.isArray(C)) {
            b = !0;
            const N = `${c}-${h.join(".")}`;
            v = o.getState().signalDomElements.get(N);
          }
        }
        if (v) {
          const h = b ? L(E, r.slice(0, -1)) : L(E, r);
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
      l.updateType === "update" && (S || $.current?.validationKey) && r && M(
        (S || $.current?.validationKey) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      l.updateType === "cut" && $.current?.validationKey && M(
        $.current?.validationKey + "." + A.join(".")
      ), l.updateType === "insert" && $.current?.validationKey && $t(
        $.current?.validationKey + "." + A.join(".")
      ).filter(([v, h]) => {
        let C = v?.split(".").length;
        if (v == A.join(".") && C == A.length - 1) {
          let N = v + "." + A;
          M(v), At(N, h);
        }
      });
      const j = L(m, r), F = L(E, r), W = l.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), rt = o.getState().stateComponents.get(c);
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
      const ot = {
        timeStamp: Date.now(),
        stateKey: c,
        path: r,
        updateType: l.updateType,
        status: "new",
        oldValue: j,
        newValue: F
      };
      if (ht(c, (b) => {
        const h = [...b ?? [], ot].reduce((C, N) => {
          const D = `${N.stateKey}:${JSON.stringify(N.path)}`, T = C.get(D);
          return T ? (T.timeStamp = Math.max(T.timeStamp, N.timeStamp), T.newValue = N.newValue, T.oldValue = T.oldValue ?? N.oldValue, T.updateType = N.updateType) : C.set(D, { ...N }), C;
        }, /* @__PURE__ */ new Map());
        return Array.from(h.values());
      }), Tt(
        E,
        c,
        $.current,
        V
      ), _ && _({
        updateLog: R,
        update: ot
      }), $.current?.serverSync) {
        const b = o.getState().serverState[c], v = $.current?.serverSync;
        Ct(c, {
          syncKey: typeof v.syncKey == "string" ? v.syncKey : v.syncKey({ state: E }),
          rollBackState: b,
          actionTimeStamp: Date.now() + (v.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  o.getState().updaterState[c] || (B(
    c,
    Z(
      c,
      P,
      i.current,
      V
    )
  ), o.getState().cogsStateStore[c] || x(c, t), o.getState().initialStateGlobal[c] || nt(c, t));
  const Q = It(() => Z(
    c,
    P,
    i.current,
    V
  ), [c]);
  return [gt(c), Q];
}
function Z(t, a, u, f) {
  const d = /* @__PURE__ */ new Map();
  let _ = 0;
  const p = (s) => {
    const e = s.join(".");
    for (const [I] of d)
      (I === e || I.startsWith(e + ".")) && d.delete(I);
    _++;
  }, y = /* @__PURE__ */ new Map(), g = {
    removeValidation: (s) => {
      s?.validationKey && M(s.validationKey);
    },
    revertToInitialState: (s) => {
      const e = o.getState().getInitialOptions(t)?.validation;
      e?.key && M(e?.key), s?.validationKey && M(s.validationKey);
      const I = o.getState().initialStateGlobal[t];
      d.clear(), _++;
      const V = w(I, []);
      J(() => {
        B(t, V), x(t, I);
        const k = o.getState().stateComponents.get(t);
        k && k.components.forEach((R) => {
          R.forceUpdate();
        });
        const c = et(t);
        c?.localStorage?.key && localStorage.removeItem(
          c?.initState ? f + "-" + t + "-" + c?.localStorage?.key : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (s) => {
      d.clear(), _++;
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
  function w(s, e = [], I) {
    const V = e.map(String).join(".");
    d.get(V);
    const k = function() {
      return o().getNestedState(t, e);
    };
    Object.keys(g).forEach((U) => {
      k[U] = g[U];
    });
    const c = {
      apply(U, i, $) {
        return o().getNestedState(t, e);
      },
      get(U, i) {
        if (i !== "then" && !i.startsWith("$") && i !== "stateMapNoRender") {
          const n = e.join("."), r = `${t}////${u}`, l = o.getState().stateComponents.get(t);
          if (l) {
            const S = l.components.get(r);
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
              ), l = r ? s : o.getState().getNestedState(t, e);
              return i !== "stateMapNoRender" && (d.clear(), _++), l.map((S, m) => {
                const E = r && S.__origIndex ? S.__origIndex : m, O = w(
                  S,
                  [...e, E.toString()],
                  I
                );
                return n(
                  S,
                  O,
                  m,
                  s,
                  w(s, e, I)
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
              rebuildStateShape: w
            });
          if (i === "stateFlattenOn")
            return (n) => {
              const l = I?.filtered?.some(
                (m) => m.join(".") === e.join(".")
              ) ? s : o.getState().getNestedState(t, e);
              d.clear(), _++;
              const S = l.flatMap(
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
              const l = s.findIndex(
                (E) => E[n] === r
              );
              if (l === -1) return;
              const S = s[l], m = [...e, l.toString()];
              return d.clear(), _++, d.clear(), _++, w(S, m);
            };
          if (i === "index")
            return (n) => {
              const r = s[n];
              return w(r, [...e, n.toString()]);
            };
          if (i === "insert")
            return (n) => (p(e), st(a, n, e, t), w(
              o.getState().cogsStateStore[t],
              []
            ));
          if (i === "uniqueInsert")
            return (n, r, l) => {
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
                p(e), st(a, m, e, t);
              else if (l && E) {
                const A = l(E), j = S.map(
                  (F) => G(F, E) ? A : F
                );
                p(e), q(a, j, e);
              }
            };
          if (i === "cut")
            return (n, r) => {
              r?.waitForSync || (p(e), ct(a, e, t, n));
            };
          if (i === "stateFilter")
            return (n) => {
              const r = s.map((m, E) => ({
                ...m,
                __origIndex: E.toString()
              })), l = [], S = [];
              for (let m = 0; m < r.length; m++)
                n(r[m], m) && (l.push(m), S.push(r[m]));
              return d.clear(), _++, w(S, e, {
                filtered: [...I?.filtered || [], e],
                validIndices: l
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
          const n = e.slice(0, -1), r = n.join("."), l = o.getState().getNestedState(t, n);
          return Array.isArray(l) ? Number(e[e.length - 1]) === y.get(r) : void 0;
        }
        if (i == "getLocalStorage")
          return (n) => St(f + "-" + t + "-" + n);
        if (i === "setSelected")
          return (n) => {
            const r = e.slice(0, -1), l = Number(e[e.length - 1]), S = r.join(".");
            n ? y.set(S, l) : y.delete(S);
            const m = o.getState().getNestedState(t, [...r]);
            q(a, m, r), p(r);
          };
        if (e.length == 0) {
          if (i === "validateZodSchema")
            return () => {
              const n = o.getState().getInitialOptions(t)?.validation, r = o.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              M(n.key);
              const l = o.getState().cogsStateStore[t];
              try {
                const S = o.getState().getValidationErrors(n.key);
                S && S.length > 0 && S.forEach(([E]) => {
                  E && E.startsWith(n.key) && M(E);
                });
                const m = n.zodSchema.safeParse(l);
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
                const l = o.getState().getNestedState(t, e);
                r?.afterUpdate && r.afterUpdate(l);
              }, r.debounce);
            else {
              q(a, n, e, "");
              const l = o.getState().getNestedState(t, e);
              r?.afterUpdate && r.afterUpdate(l);
            }
            p(e);
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
        return w(Q, P, I);
      }
    }, R = new Proxy(k, c);
    return d.set(V, {
      proxy: R,
      stateVersion: _
    }), R;
  }
  return w(
    o.getState().getNestedState(t, [])
  );
}
function X(t) {
  return H(bt, { proxy: t });
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
    (d, _, p, y, g) => t._mapFn(d, _, p, y, g)
  ) : null;
}
function bt({
  proxy: t
}) {
  const a = z(null), u = `${t._stateKey}-${t._path.join(".")}`;
  return K(() => {
    const f = a.current;
    if (!f || !f.parentElement) return;
    const d = f.parentElement, p = Array.from(d.childNodes).indexOf(f);
    let y = d.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", y));
    const w = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: p,
      effect: t._effect
    };
    o.getState().addSignalElement(u, w);
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
