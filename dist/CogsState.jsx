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
  const u = a.getState().getInitialOptions, g = a.getState().setInitialStateOptions, d = u(t) || {};
  console.log("setAndMergeOptions", t, d, o), g(t, {
    ...d,
    ...o
  });
}
function ut({
  stateKey: t,
  options: o,
  initialOptionsPart: u
}) {
  const g = et(t) || {}, d = u[t] || {}, _ = a.getState().setInitialStateOptions, p = { ...d, ...g };
  let y = !1;
  if (o)
    for (const f in o)
      p.hasOwnProperty(f) ? f == "localStorage" && o[f] && p[f].key !== o[f]?.key && (y = !0, p[f] = o[f]) : (y = !0, p[f] = o[f]);
  y && _(t, p);
}
function Wt(t, { formElements: o, validation: u }) {
  return { initialState: t, formElements: o, validation: u };
}
const qt = (t, o) => {
  let u = t;
  const [g, d] = _t(u);
  (o?.formElements || o?.validation) && Object.keys(d).forEach((y) => {
    d[y] = d[y] || {}, d[y].formElements = {
      ...o.formElements,
      // Global defaults first
      ...o?.validation,
      ...d[y].formElements || {}
      // State-specific overrides
    };
  }), a.getState().setInitialStates(g);
  const _ = (y, f) => {
    const [w] = Y(f?.componentId ?? tt());
    ut({
      stateKey: y,
      options: f,
      initialOptionsPart: d
    });
    const s = a.getState().cogsStateStore[y] || g[y], e = f?.modifyState ? f.modifyState(s) : s, [I, V] = jt(
      e,
      {
        stateKey: y,
        syncUpdate: f?.syncUpdate,
        componentId: w,
        localStorage: f?.localStorage,
        middleware: f?.middleware,
        enabledSync: f?.enabledSync,
        reactiveType: f?.reactiveType,
        reactiveDeps: f?.reactiveDeps,
        initState: f?.initState
      }
    );
    return V;
  };
  function p(y, f) {
    ut({ stateKey: y, options: f, initialOptionsPart: d });
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
  removeValidationError: b,
  setServerSyncActions: Ct
} = a.getState(), St = (t) => {
  if (!t) return null;
  try {
    const o = window.localStorage.getItem(t);
    return o ? JSON.parse(o) : null;
  } catch (o) {
    return console.error("Error loading from localStorage:", o), null;
  }
}, Tt = (t, o, u, g) => {
  if (u.log && console.log(
    "saving to localstorage",
    o,
    u.localStorage?.key,
    g
  ), u.localStorage?.key && g) {
    const d = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: a.getState().serverSyncLog[o]?.[0]?.timeStamp,
      baseServerState: a.getState().serverState[o]
    }, _ = `${g}-${o}-${u.localStorage?.key}`;
    window.localStorage.setItem(_, JSON.stringify(d));
  }
}, Ft = (t, o, u, g, d, _) => {
  const p = {
    initialState: o,
    updaterState: Z(
      t,
      g,
      d,
      _
    ),
    state: u
  };
  J(() => {
    nt(t, p.initialState), B(t, p.updaterState), x(t, p.state);
  });
}, mt = (t) => {
  const o = a.getState().stateComponents.get(t);
  if (!o) return;
  const u = /* @__PURE__ */ new Set();
  o.components.forEach((g) => {
    u.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    J(() => {
      u.forEach((g) => g());
    });
  });
}, zt = (t, o) => {
  const u = a.getState().stateComponents.get(t);
  if (u) {
    const g = `${t}////${o}`, d = u.components.get(g);
    d && d.forceUpdate();
  }
};
function jt(t, {
  stateKey: o,
  serverSync: u,
  localStorage: g,
  formElements: d,
  middleware: _,
  reactiveDeps: p,
  reactiveType: y,
  componentId: f,
  initState: w,
  syncUpdate: s
} = {}) {
  const [e, I] = Y({}), { sessionId: V } = Vt();
  let k = !o;
  const [c] = Y(o ?? tt()), U = a.getState().stateLog[c], P = z(/* @__PURE__ */ new Set()), i = z(f ?? tt()), $ = z(null);
  $.current = et(c), K(() => {
    if (s && s.stateKey === c && s.path?.[0]) {
      x(c, (r) => ({
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
      R,
      i.current,
      V
    ), mt(c), I({}));
  }, [...w?.dependencies || []]), vt(() => {
    k && dt(c, {
      serverSync: u,
      formElements: d,
      initState: w,
      localStorage: g,
      middleware: _
    });
    const n = `${c}////${i.current}`, r = a.getState().stateComponents.get(c) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(n, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: p || void 0,
      reactiveType: y ?? ["component", "deps"]
    }), a.getState().stateComponents.set(c, r), I({}), () => {
      const l = `${c}////${i.current}`;
      r && (r.components.delete(l), r.components.size === 0 && a.getState().stateComponents.delete(c));
    };
  }, []);
  const R = (n, r, l, S) => {
    if (Array.isArray(r)) {
      const m = `${c}-${r.join(".")}`;
      P.current.add(m);
    }
    x(c, (m) => {
      const E = ft(n) ? n(m) : n, j = `${c}-${r.join(".")}`;
      if (j) {
        let O = !1, v = a.getState().signalDomElements.get(j);
        if ((!v || v.size === 0) && (l.updateType === "insert" || l.updateType === "cut")) {
          const h = r.slice(0, -1), C = L(E, h);
          if (Array.isArray(C)) {
            O = !0;
            const N = `${c}-${h.join(".")}`;
            v = a.getState().signalDomElements.get(N);
          }
        }
        if (v) {
          const h = O ? L(E, r.slice(0, -1)) : L(E, r);
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
      l.updateType === "update" && (S || $.current?.validationKey) && r && b(
        (S || $.current?.validationKey) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      l.updateType === "cut" && $.current?.validationKey && b(
        $.current?.validationKey + "." + A.join(".")
      ), l.updateType === "insert" && $.current?.validationKey && $t(
        $.current?.validationKey + "." + A.join(".")
      ).filter(([v, h]) => {
        let C = v?.split(".").length;
        if (v == A.join(".") && C == A.length - 1) {
          let N = v + "." + A;
          b(v), At(N, h);
        }
      });
      const M = L(m, r), F = L(E, r), W = l.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), rt = a.getState().stateComponents.get(c);
      if (rt)
        for (const [O, v] of rt.components.entries()) {
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
        stateKey: c,
        path: r,
        updateType: l.updateType,
        status: "new",
        oldValue: M,
        newValue: F
      };
      if (ht(c, (O) => {
        const h = [...O ?? [], at].reduce((C, N) => {
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
        updateLog: U,
        update: at
      }), $.current?.serverSync) {
        const O = a.getState().serverState[c], v = $.current?.serverSync;
        Ct(c, {
          syncKey: typeof v.syncKey == "string" ? v.syncKey : v.syncKey({ state: E }),
          rollBackState: O,
          actionTimeStamp: Date.now() + (v.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  a.getState().updaterState[c] || (B(
    c,
    Z(
      c,
      R,
      i.current,
      V
    )
  ), a.getState().cogsStateStore[c] || x(c, t), a.getState().initialStateGlobal[c] || nt(c, t));
  const Q = It(() => Z(
    c,
    R,
    i.current,
    V
  ), [c]);
  return [gt(c), Q];
}
function Z(t, o, u, g) {
  const d = /* @__PURE__ */ new Map();
  let _ = 0;
  const p = (s) => {
    const e = s.join(".");
    for (const [I] of d)
      (I === e || I.startsWith(e + ".")) && d.delete(I);
    _++;
  }, y = /* @__PURE__ */ new Map(), f = {
    removeValidation: (s) => {
      s?.validationKey && b(s.validationKey);
    },
    revertToInitialState: (s) => {
      const e = a.getState().getInitialOptions(t)?.validation;
      e?.key && b(e?.key), s?.validationKey && b(s.validationKey);
      const I = a.getState().initialStateGlobal[t];
      d.clear(), _++;
      const V = w(I, []);
      J(() => {
        B(t, V), x(t, I);
        const k = a.getState().stateComponents.get(t);
        k && k.components.forEach((U) => {
          U.forceUpdate();
        });
        const c = et(t);
        c?.localStorage?.key && localStorage.removeItem(
          c?.initState ? g + "-" + t + "-" + c?.localStorage?.key : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (s) => {
      d.clear(), _++;
      const e = Z(
        t,
        o,
        u,
        g
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
    d.get(V);
    const k = function() {
      return a().getNestedState(t, e);
    };
    Object.keys(f).forEach((P) => {
      k[P] = f[P];
    });
    const c = {
      apply(P, i, $) {
        return a().getNestedState(t, e);
      },
      get(P, i) {
        if (i !== "then" && !i.startsWith("$") && i !== "stateMapNoRender") {
          const n = e.join("."), r = `${t}////${u}`, l = a.getState().stateComponents.get(t);
          if (l) {
            const S = l.components.get(r);
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
              ), l = r ? s : a.getState().getNestedState(t, e);
              return i !== "stateMapNoRender" && (d.clear(), _++), l.map((S, m) => {
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
              const l = I?.filtered?.some(
                (m) => m.join(".") === e.join(".")
              ) ? s : a.getState().getNestedState(t, e);
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
            return (n) => (p(e), st(o, n, e, t), w(
              a.getState().cogsStateStore[t],
              []
            ));
          if (i === "uniqueInsert")
            return (n, r, l) => {
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
                p(e), st(o, m, e, t);
              else if (l && E) {
                const A = l(E), M = S.map(
                  (F) => G(F, E) ? A : F
                );
                p(e), q(o, M, e);
              }
            };
          if (i === "cut")
            return (n, r) => {
              r?.waitForSync || (p(e), ct(o, e, t, n));
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
          const n = e.slice(0, -1), r = n.join("."), l = a.getState().getNestedState(t, n);
          return Array.isArray(l) ? Number(e[e.length - 1]) === y.get(r) : void 0;
        }
        if (i == "getLocalStorage")
          return (n) => St(g + "-" + t + "-" + n);
        if (i === "setSelected")
          return (n) => {
            const r = e.slice(0, -1), l = Number(e[e.length - 1]), S = r.join(".");
            n ? y.set(S, l) : y.delete(S);
            const m = a.getState().getNestedState(t, [...r]);
            q(o, m, r), p(r);
          };
        if (e.length == 0) {
          if (i === "validateZodSchema")
            return () => {
              const n = a.getState().getInitialOptions(t)?.validation, r = a.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              b(n.key);
              const l = a.getState().cogsStateStore[t];
              try {
                const S = a.getState().getValidationErrors(n.key);
                S && S.length > 0 && S.forEach(([E]) => {
                  E && E.startsWith(n.key) && b(E);
                });
                const m = n.zodSchema.safeParse(l);
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
            return f.revertToInitialState;
          if (i === "updateInitialState") return f.updateInitialState;
          if (i === "removeValidation") return f.removeValidation;
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
        if (i === "_isServerSynced") return f._isServerSynced;
        if (i === "update")
          return (n, r) => {
            if (r?.debounce)
              pt(() => {
                q(o, n, e, "");
                const l = a.getState().getNestedState(t, e);
                r?.afterUpdate && r.afterUpdate(l);
              }, r.debounce);
            else {
              q(o, n, e, "");
              const l = a.getState().getNestedState(t, e);
              r?.afterUpdate && r.afterUpdate(l);
            }
            p(e);
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
    }, U = new Proxy(k, c);
    return d.set(V, {
      proxy: U,
      stateVersion: _
    }), U;
  }
  return w(
    a.getState().getNestedState(t, [])
  );
}
function X(t) {
  return H(Ot, { proxy: t });
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
    (d, _, p, y, f) => t._mapFn(d, _, p, y, f)
  ) : null;
}
function Ot({
  proxy: t
}) {
  const o = z(null), u = `${t._stateKey}-${t._path.join(".")}`;
  return K(() => {
    const g = o.current;
    if (!g || !g.parentElement) return;
    const d = g.parentElement, p = Array.from(d.childNodes).indexOf(g);
    let y = d.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", y));
    const w = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: p,
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
    g.replaceWith(I);
  }, [t._stateKey, t._path.join("."), t._effect]), H("span", {
    ref: o,
    style: { display: "none" },
    "data-signal-id": u
  });
}
function Jt(t) {
  const o = Et(
    (u) => {
      const g = a.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: u,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
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
