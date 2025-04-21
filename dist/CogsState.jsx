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
  const u = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, s = u(t) || {};
  return console.log("setAndMergeOptions", t, s, a), f(t, {
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
  initialOptionsPart: u
}) {
  const f = et(t) || {}, s = u[t] || {}, _ = o.getState().setInitialStateOptions, p = { ...s, ...f };
  let y = !1;
  if (a)
    for (const S in a)
      p.hasOwnProperty(S) || (y = !0, console.log(
        "setOptions needToAdd",
        S,
        a[S]
      ), p[S] = a[S]);
  return y && _(t, p), p;
}
function Wt(t, { formElements: a, validation: u }) {
  return { initialState: t, formElements: a, validation: u };
}
const qt = (t, a) => {
  let u = t;
  const [f, s] = _t(u);
  (a?.formElements || a?.validation) && Object.keys(s).forEach((y) => {
    s[y] = s[y] || {}, s[y].formElements = {
      ...a.formElements,
      // Global defaults first
      ...a?.validation,
      ...s[y].formElements || {}
      // State-specific overrides
    };
  }), o.getState().setInitialStates(f);
  const _ = (y, S) => {
    const [w] = Y(S?.componentId ?? tt()), c = ut({
      stateKey: y,
      options: S,
      initialOptionsPart: s
    });
    console.log("useCogsState", y, S, s, c);
    const e = o.getState().cogsStateStore[y] || f[y], v = S?.modifyState ? S.modifyState(e) : e, [V, F] = jt(
      v,
      {
        stateKey: y,
        syncUpdate: S?.syncUpdate,
        componentId: w,
        localStorage: S?.localStorage,
        middleware: S?.middleware,
        enabledSync: S?.enabledSync,
        reactiveType: S?.reactiveType,
        reactiveDeps: S?.reactiveDeps,
        initState: S?.initState
      }
    );
    return F;
  };
  function p(y, S) {
    ut({ stateKey: y, options: S, initialOptionsPart: s });
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
  removeValidationError: k,
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
    const s = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: o.getState().serverSyncLog[a]?.[0]?.timeStamp,
      baseServerState: o.getState().serverState[a]
    }, _ = `${f}-${a}-${u.localStorage?.key}`;
    window.localStorage.setItem(_, JSON.stringify(s));
  }
}, Ft = (t, a, u, f, s, _) => {
  const p = {
    initialState: a,
    updaterState: Z(
      t,
      f,
      s,
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
    const f = `${t}////${a}`, s = u.components.get(f);
    s && s.forceUpdate();
  }
};
function jt(t, {
  stateKey: a,
  serverSync: u,
  localStorage: f,
  formElements: s,
  middleware: _,
  reactiveDeps: p,
  reactiveType: y,
  componentId: S,
  initState: w,
  syncUpdate: c
} = {}) {
  const [e, v] = Y({}), { sessionId: V } = Vt();
  let F = !a;
  const [l] = Y(a ?? tt()), U = o.getState().stateLog[l], P = z(/* @__PURE__ */ new Set()), i = z(S ?? tt()), $ = z(null);
  $.current = et(l), K(() => {
    if (c && c.stateKey === l && c.path?.[0]) {
      x(l, (r) => ({
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
    ), mt(l), v({}));
  }, [...w?.dependencies || []]), vt(() => {
    F && dt(l, {
      serverSync: u,
      formElements: s,
      initState: w,
      localStorage: f,
      middleware: _
    });
    const n = `${l}////${i.current}`, r = o.getState().stateComponents.get(l) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(n, {
      forceUpdate: () => v({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: p || void 0,
      reactiveType: y ?? ["component", "deps"]
    }), o.getState().stateComponents.set(l, r), v({}), () => {
      const d = `${l}////${i.current}`;
      r && (r.components.delete(d), r.components.size === 0 && o.getState().stateComponents.delete(l));
    };
  }, []);
  const R = (n, r, d, g) => {
    if (Array.isArray(r)) {
      const m = `${l}-${r.join(".")}`;
      P.current.add(m);
    }
    x(l, (m) => {
      const E = ft(n) ? n(m) : n, M = `${l}-${r.join(".")}`;
      if (M) {
        let b = !1, I = o.getState().signalDomElements.get(M);
        if ((!I || I.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const h = r.slice(0, -1), C = L(E, h);
          if (Array.isArray(C)) {
            b = !0;
            const N = `${l}-${h.join(".")}`;
            I = o.getState().signalDomElements.get(N);
          }
        }
        if (I) {
          const h = b ? L(E, r.slice(0, -1)) : L(E, r);
          I.forEach(({ parentId: C, position: N, effect: D }) => {
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
      d.updateType === "update" && (g || $.current?.validationKey) && r && k(
        (g || $.current?.validationKey) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      d.updateType === "cut" && $.current?.validationKey && k(
        $.current?.validationKey + "." + A.join(".")
      ), d.updateType === "insert" && $.current?.validationKey && $t(
        $.current?.validationKey + "." + A.join(".")
      ).filter(([I, h]) => {
        let C = I?.split(".").length;
        if (I == A.join(".") && C == A.length - 1) {
          let N = I + "." + A;
          k(I), At(N, h);
        }
      });
      const O = L(m, r), j = L(E, r), W = d.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), rt = o.getState().stateComponents.get(l);
      if (rt)
        for (const [b, I] of rt.components.entries()) {
          let h = !1;
          const C = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (!C.includes("none")) {
            if (C.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if (C.includes("component") && I.paths && (I.paths.has(W) || I.paths.has("")) && (h = !0), !h && C.includes("deps") && I.depsFunction) {
              const N = I.depsFunction(E);
              typeof N == "boolean" ? N && (h = !0) : G(I.deps, N) || (I.deps = N, h = !0);
            }
            h && I.forceUpdate();
          }
        }
      const ot = {
        timeStamp: Date.now(),
        stateKey: l,
        path: r,
        updateType: d.updateType,
        status: "new",
        oldValue: O,
        newValue: j
      };
      if (ht(l, (b) => {
        const h = [...b ?? [], ot].reduce((C, N) => {
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
        updateLog: U,
        update: ot
      }), $.current?.serverSync) {
        const b = o.getState().serverState[l], I = $.current?.serverSync;
        Ct(l, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: E }),
          rollBackState: b,
          actionTimeStamp: Date.now() + (I.debounce ?? 3e3),
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
      R,
      i.current,
      V
    )
  ), o.getState().cogsStateStore[l] || x(l, t), o.getState().initialStateGlobal[l] || nt(l, t));
  const Q = It(() => Z(
    l,
    R,
    i.current,
    V
  ), [l]);
  return [gt(l), Q];
}
function Z(t, a, u, f) {
  const s = /* @__PURE__ */ new Map();
  let _ = 0;
  const p = (c) => {
    const e = c.join(".");
    for (const [v] of s)
      (v === e || v.startsWith(e + ".")) && s.delete(v);
    _++;
  }, y = /* @__PURE__ */ new Map(), S = {
    removeValidation: (c) => {
      c?.validationKey && k(c.validationKey);
    },
    revertToInitialState: (c) => {
      const e = o.getState().getInitialOptions(t)?.validation;
      e?.key && k(e?.key), c?.validationKey && k(c.validationKey);
      const v = o.getState().initialStateGlobal[t];
      s.clear(), _++;
      const V = w(v, []);
      J(() => {
        B(t, V), x(t, v);
        const F = o.getState().stateComponents.get(t);
        F && F.components.forEach((U) => {
          U.forceUpdate();
        });
        const l = et(t);
        l?.localStorage?.key && localStorage.removeItem(
          l?.initState ? f + "-" + t + "-" + l?.localStorage?.key : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (c) => {
      s.clear(), _++;
      const e = Z(
        t,
        a,
        u,
        f
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
    Object.keys(S).forEach((P) => {
      F[P] = S[P];
    });
    const l = {
      apply(P, i, $) {
        return o().getNestedState(t, e);
      },
      get(P, i) {
        if (i !== "then" && !i.startsWith("$") && i !== "stateMapNoRender") {
          const n = e.join("."), r = `${t}////${u}`, d = o.getState().stateComponents.get(t);
          if (d) {
            const g = d.components.get(r);
            g && (e.length > 0 || i === "get") && g.paths.add(n);
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
                (g) => g.join(".") === e.join(".")
              ), d = r ? c : o.getState().getNestedState(t, e);
              return i !== "stateMapNoRender" && (s.clear(), _++), d.map((g, m) => {
                const E = r && g.__origIndex ? g.__origIndex : m, M = w(
                  g,
                  [...e, E.toString()],
                  v
                );
                return n(
                  g,
                  M,
                  m,
                  c,
                  w(c, e, v)
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
              const d = v?.filtered?.some(
                (m) => m.join(".") === e.join(".")
              ) ? c : o.getState().getNestedState(t, e);
              s.clear(), _++;
              const g = d.flatMap(
                (m, E) => m[n] ?? []
              );
              return w(
                g,
                [...e, "[*]", n],
                v
              );
            };
          if (i === "findWith")
            return (n, r) => {
              const d = c.findIndex(
                (E) => E[n] === r
              );
              if (d === -1) return;
              const g = c[d], m = [...e, d.toString()];
              return s.clear(), _++, s.clear(), _++, w(g, m);
            };
          if (i === "index")
            return (n) => {
              const r = c[n];
              return w(r, [...e, n.toString()]);
            };
          if (i === "insert")
            return (n) => (p(e), st(a, n, e, t), w(
              o.getState().cogsStateStore[t],
              []
            ));
          if (i === "uniqueInsert")
            return (n, r, d) => {
              const g = o.getState().getNestedState(t, e), m = ft(n) ? n(g) : n;
              let E = null;
              if (!g.some((A) => {
                if (r) {
                  const j = r.every(
                    (W) => G(A[W], m[W])
                  );
                  return j && (E = A), j;
                }
                const O = G(A, m);
                return O && (E = A), O;
              }))
                p(e), st(a, m, e, t);
              else if (d && E) {
                const A = d(E), O = g.map(
                  (j) => G(j, E) ? A : j
                );
                p(e), q(a, O, e);
              }
            };
          if (i === "cut")
            return (n, r) => {
              r?.waitForSync || (p(e), ct(a, e, t, n));
            };
          if (i === "stateFilter")
            return (n) => {
              const r = c.map((m, E) => ({
                ...m,
                __origIndex: E.toString()
              })), d = [], g = [];
              for (let m = 0; m < r.length; m++)
                n(r[m], m) && (d.push(m), g.push(r[m]));
              return s.clear(), _++, w(g, e, {
                filtered: [...v?.filtered || [], e],
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
            const r = e.slice(0, -1), d = Number(e[e.length - 1]), g = r.join(".");
            n ? y.set(g, d) : y.delete(g);
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
              k(n.key);
              const d = o.getState().cogsStateStore[t];
              try {
                const g = o.getState().getValidationErrors(n.key);
                g && g.length > 0 && g.forEach(([E]) => {
                  E && E.startsWith(n.key) && k(E);
                });
                const m = n.zodSchema.safeParse(d);
                return m.success ? !0 : (m.error.errors.forEach((M) => {
                  const A = M.path, O = M.message, j = [n.key, ...A].join(".");
                  r(j, O);
                }), mt(t), !1);
              } catch (g) {
                return console.error("Zod schema validation failed", g), !1;
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
            return S.revertToInitialState;
          if (i === "updateInitialState") return S.updateInitialState;
          if (i === "removeValidation") return S.removeValidation;
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
        if (i === "_isServerSynced") return S._isServerSynced;
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
        const R = [...e, i], Q = o.getState().getNestedState(t, R);
        return w(Q, R, v);
      }
    }, U = new Proxy(F, l);
    return s.set(V, {
      proxy: U,
      stateVersion: _
    }), U;
  }
  return w(
    o.getState().getNestedState(t, [])
  );
}
function X(t) {
  return H(Ot, { proxy: t });
}
function Mt({
  proxy: t,
  rebuildStateShape: a
}) {
  const u = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(u) ? a(
    u,
    t._path
  ).stateMapNoRender(
    (s, _, p, y, S) => t._mapFn(s, _, p, y, S)
  ) : null;
}
function Ot({
  proxy: t
}) {
  const a = z(null), u = `${t._stateKey}-${t._path.join(".")}`;
  return K(() => {
    const f = a.current;
    if (!f || !f.parentElement) return;
    const s = f.parentElement, p = Array.from(s.childNodes).indexOf(f);
    let y = s.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, s.setAttribute("data-parent-id", y));
    const w = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: p,
      effect: t._effect
    };
    o.getState().addSignalElement(u, w);
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
    f.replaceWith(v);
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
  jt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
