"use client";
import { jsx as it } from "react/jsx-runtime";
import { useState as Y, useRef as z, useEffect as K, useLayoutEffect as vt, useMemo as It, createElement as H, useSyncExternalStore as Et, startTransition as J } from "react";
import { transformStateFunc as _t, isFunction as ft, getNestedValue as L, isDeepEqual as G, debounce as pt } from "./utility.js";
import { pushFunc as st, updateFn as q, cutFunc as ct, ValidationWrapper as wt, FormControlComponent as Vt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as o, formRefStore as lt } from "./store.js";
import { useCogsConfig as Nt } from "./CogsStateClient.jsx";
import tt from "./node_modules/uuid/dist/esm-browser/v4.js";
function dt(t, a) {
  const f = o.getState().getInitialOptions, u = o.getState().setInitialStateOptions, c = f(t) || {};
  return a.log && (console.log("setAndMergeOptions", t, a), console.log("setAndMergeOptions oldValue", c)), u(t, {
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
  initialOptionsPart: f
}) {
  const u = et(t) || {}, c = f[t] || {}, _ = o.getState().setInitialStateOptions, w = { ...c, ...u };
  let y = !1;
  if (a)
    for (const S in a)
      w.hasOwnProperty(S) || (y = !0, w[S] = a[S]);
  y && _(t, w);
}
function Wt(t, { formElements: a, validation: f }) {
  return { initialState: t, formElements: a, validation: f };
}
const qt = (t, a) => {
  let f = t;
  const [u, c] = _t(f);
  (a?.formElements || a?.validation) && Object.keys(c).forEach((y) => {
    c[y] = c[y] || {}, c[y].formElements = {
      ...a.formElements,
      // Global defaults first
      ...a?.validation,
      ...c[y].formElements || {}
      // State-specific overrides
    };
  }), o.getState().setInitialStates(u);
  const _ = (y, S) => {
    const [p] = Y(S?.componentId ?? tt());
    ut({
      stateKey: y,
      options: S,
      initialOptionsPart: c
    });
    const s = o.getState().cogsStateStore[y] || u[y], e = S?.modifyState ? S.modifyState(s) : s;
    S?.log && console.log("useCogsState", y, S);
    const [I, N] = Ot(
      e,
      {
        stateKey: y,
        syncUpdate: S?.syncUpdate,
        componentId: p,
        localStorage: S?.localStorage,
        middleware: S?.middleware,
        enabledSync: S?.enabledSync,
        reactiveType: S?.reactiveType,
        reactiveDeps: S?.reactiveDeps,
        initState: S?.initState
      }
    );
    return N;
  };
  function w(y, S) {
    ut({ stateKey: y, options: S, initialOptionsPart: c });
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
}, Tt = (t, a, f, u) => {
  if (f.log && console.log(
    "saving to localstorage",
    a,
    f.localStorage?.key,
    u
  ), f.localStorage?.key && u) {
    const c = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: o.getState().serverSyncLog[a]?.[0]?.timeStamp,
      baseServerState: o.getState().serverState[a]
    }, _ = `${u}-${a}-${f.localStorage?.key}`;
    window.localStorage.setItem(_, JSON.stringify(c));
  }
}, Ft = (t, a, f, u, c, _) => {
  const w = {
    initialState: a,
    updaterState: Z(
      t,
      u,
      c,
      _
    ),
    state: f
  };
  J(() => {
    nt(t, w.initialState), B(t, w.updaterState), x(t, w.state);
  });
}, mt = (t) => {
  const a = o.getState().stateComponents.get(t);
  if (!a) return;
  const f = /* @__PURE__ */ new Set();
  a.components.forEach((u) => {
    f.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    J(() => {
      f.forEach((u) => u());
    });
  });
}, zt = (t, a) => {
  const f = o.getState().stateComponents.get(t);
  if (f) {
    const u = `${t}////${a}`, c = f.components.get(u);
    c && c.forceUpdate();
  }
};
function Ot(t, {
  stateKey: a,
  serverSync: f,
  localStorage: u,
  formElements: c,
  middleware: _,
  reactiveDeps: w,
  reactiveType: y,
  componentId: S,
  initState: p,
  syncUpdate: s
} = {}) {
  const [e, I] = Y({}), { sessionId: N } = Nt();
  let k = !a;
  const [l] = Y(a ?? tt()), R = o.getState().stateLog[l], U = z(/* @__PURE__ */ new Set()), i = z(S ?? tt()), $ = z(null);
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
  ), console.log("latestInitialOptionsRef.current localStorage", u)), K(() => {
    const n = dt(l, {
      initState: p,
      localStorage: u
    });
    $.current = n;
    let r = null;
    n.log && console.log("newoptions", n), n.localStorage?.key && N && (r = St(
      N + "-" + l + "-" + n.localStorage?.key
    ));
    let d = null;
    p?.initialState && (d = p?.initialState, r && r.lastUpdated > (r.lastSyncedWithServer || 0) && (d = r.state), Ft(
      l,
      p?.initialState,
      d,
      P,
      i.current,
      N
    ), mt(l), I({}));
  }, [u?.key, ...p?.dependencies || []]), vt(() => {
    k && dt(l, {
      serverSync: f,
      formElements: c,
      initState: p,
      localStorage: u,
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
  const P = (n, r, d, g) => {
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
            const V = `${l}-${h.join(".")}`;
            v = o.getState().signalDomElements.get(V);
          }
        }
        if (v) {
          const h = M ? L(E, r.slice(0, -1)) : L(E, r);
          v.forEach(({ parentId: C, position: V, effect: D }) => {
            const T = document.querySelector(
              `[data-parent-id="${C}"]`
            );
            if (T) {
              const at = Array.from(T.childNodes);
              if (at[V]) {
                const yt = D ? new Function("state", `return (${D})(state)`)(h) : h;
                at[V].textContent = String(yt);
              }
            }
          });
        }
      }
      d.updateType === "update" && (g || $.current?.validationKey) && r && b(
        (g || $.current?.validationKey) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      d.updateType === "cut" && $.current?.validationKey && b(
        $.current?.validationKey + "." + A.join(".")
      ), d.updateType === "insert" && $.current?.validationKey && $t(
        $.current?.validationKey + "." + A.join(".")
      ).filter(([v, h]) => {
        let C = v?.split(".").length;
        if (v == A.join(".") && C == A.length - 1) {
          let V = v + "." + A;
          b(v), At(V, h);
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
              const V = v.depsFunction(E);
              typeof V == "boolean" ? V && (h = !0) : G(v.deps, V) || (v.deps = V, h = !0);
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
        const h = [...M ?? [], ot].reduce((C, V) => {
          const D = `${V.stateKey}:${JSON.stringify(V.path)}`, T = C.get(D);
          return T ? (T.timeStamp = Math.max(T.timeStamp, V.timeStamp), T.newValue = V.newValue, T.oldValue = T.oldValue ?? V.oldValue, T.updateType = V.updateType) : C.set(D, { ...V }), C;
        }, /* @__PURE__ */ new Map());
        return Array.from(h.values());
      }), Tt(
        E,
        l,
        $.current,
        N
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
      N
    )
  ), o.getState().cogsStateStore[l] || x(l, t), o.getState().initialStateGlobal[l] || nt(l, t));
  const Q = It(() => Z(
    l,
    P,
    i.current,
    N
  ), [l]);
  return [gt(l), Q];
}
function Z(t, a, f, u) {
  const c = /* @__PURE__ */ new Map();
  let _ = 0;
  const w = (s) => {
    const e = s.join(".");
    for (const [I] of c)
      (I === e || I.startsWith(e + ".")) && c.delete(I);
    _++;
  }, y = /* @__PURE__ */ new Map(), S = {
    removeValidation: (s) => {
      s?.validationKey && b(s.validationKey);
    },
    revertToInitialState: (s) => {
      const e = o.getState().getInitialOptions(t)?.validation;
      e?.key && b(e?.key), s?.validationKey && b(s.validationKey);
      const I = o.getState().initialStateGlobal[t];
      c.clear(), _++;
      const N = p(I, []);
      J(() => {
        B(t, N), x(t, I);
        const k = o.getState().stateComponents.get(t);
        k && k.components.forEach((R) => {
          R.forceUpdate();
        });
        const l = et(t);
        l?.localStorage?.key && localStorage.removeItem(
          l?.initState ? u + "-" + t + "-" + l?.localStorage?.key : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (s) => {
      c.clear(), _++;
      const e = Z(
        t,
        a,
        f,
        u
      );
      return J(() => {
        nt(t, s), B(t, e), x(t, s);
        const I = o.getState().stateComponents.get(t);
        I && I.components.forEach((N) => {
          N.forceUpdate();
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
    const N = e.map(String).join(".");
    c.get(N);
    const k = function() {
      return o().getNestedState(t, e);
    };
    Object.keys(S).forEach((U) => {
      k[U] = S[U];
    });
    const l = {
      apply(U, i, $) {
        return o().getNestedState(t, e);
      },
      get(U, i) {
        if (i !== "then" && !i.startsWith("$") && i !== "stateMapNoRender") {
          const n = e.join("."), r = `${t}////${f}`, d = o.getState().stateComponents.get(t);
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
                (g) => g.join(".") === e.join(".")
              ), d = r ? s : o.getState().getNestedState(t, e);
              return i !== "stateMapNoRender" && (c.clear(), _++), d.map((g, m) => {
                const E = r && g.__origIndex ? g.__origIndex : m, O = p(
                  g,
                  [...e, E.toString()],
                  I
                );
                return n(
                  g,
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
              const g = d.flatMap(
                (m, E) => m[n] ?? []
              );
              return p(
                g,
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
              const g = s[d], m = [...e, d.toString()];
              return c.clear(), _++, c.clear(), _++, p(g, m);
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
              const g = o.getState().getNestedState(t, e), m = ft(n) ? n(g) : n;
              let E = null;
              if (!g.some((A) => {
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
                const A = d(E), j = g.map(
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
              })), d = [], g = [];
              for (let m = 0; m < r.length; m++)
                n(r[m], m) && (d.push(m), g.push(r[m]));
              return c.clear(), _++, p(g, e, {
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
          return (n) => St(u + "-" + t + "-" + n);
        if (i === "setSelected")
          return (n) => {
            const r = e.slice(0, -1), d = Number(e[e.length - 1]), g = r.join(".");
            n ? y.set(g, d) : y.delete(g);
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
                const g = o.getState().getValidationErrors(n.key);
                g && g.length > 0 && g.forEach(([E]) => {
                  E && E.startsWith(n.key) && b(E);
                });
                const m = n.zodSchema.safeParse(d);
                return m.success ? !0 : (m.error.errors.forEach((O) => {
                  const A = O.path, j = O.message, F = [n.key, ...A].join(".");
                  r(F, j);
                }), mt(t), !1);
              } catch (g) {
                return console.error("Zod schema validation failed", g), !1;
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
              validIndices: I?.validIndices,
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
            w(e);
          };
        if (i === "formElement")
          return (n, r) => /* @__PURE__ */ it(
            Vt,
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
    return c.set(N, {
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
  const f = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(f) ? a(
    f,
    t._path
  ).stateMapNoRender(
    (c, _, w, y, S) => t._mapFn(c, _, w, y, S)
  ) : null;
}
function Mt({
  proxy: t
}) {
  const a = z(null), f = `${t._stateKey}-${t._path.join(".")}`;
  return K(() => {
    const u = a.current;
    if (!u || !u.parentElement) return;
    const c = u.parentElement, w = Array.from(c.childNodes).indexOf(u);
    let y = c.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, c.setAttribute("data-parent-id", y));
    const p = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: w,
      effect: t._effect
    };
    o.getState().addSignalElement(f, p);
    const s = o.getState().getNestedState(t._stateKey, t._path);
    let e;
    if (t._effect)
      try {
        e = new Function(
          "state",
          `return (${t._effect})(state)`
        )(s);
      } catch (N) {
        console.error("Error evaluating effect function during mount:", N), e = s;
      }
    else
      e = s;
    e !== null && typeof e == "object" && (e = JSON.stringify(e));
    const I = document.createTextNode(String(e));
    u.replaceWith(I);
  }, [t._stateKey, t._path.join("."), t._effect]), H("span", {
    ref: a,
    style: { display: "none" },
    "data-signal-id": f
  });
}
function Jt(t) {
  const a = Et(
    (f) => {
      const u = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(t._stateKey, {
        forceUpdate: f,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => u.components.delete(t._stateKey);
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
