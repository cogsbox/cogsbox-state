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
  const f = a.getState().getInitialOptions, u = a.getState().setInitialStateOptions, d = f(t) || {};
  return u(t, {
    ...d,
    ...o
  }), {
    ...d,
    ...o
  };
}
function ut({
  stateKey: t,
  options: o,
  initialOptionsPart: f
}) {
  const u = et(t) || {}, d = f[t] || {}, _ = a.getState().setInitialStateOptions, w = { ...d, ...u };
  let y = !1;
  if (o)
    for (const S in o)
      w.hasOwnProperty(S) || (y = !0, w[S] = o[S]);
  y && _(t, w);
}
function Wt(t, { formElements: o, validation: f }) {
  return { initialState: t, formElements: o, validation: f };
}
const qt = (t, o) => {
  let f = t;
  const [u, d] = _t(f);
  (o?.formElements || o?.validation) && Object.keys(d).forEach((y) => {
    d[y] = d[y] || {}, d[y].formElements = {
      ...o.formElements,
      // Global defaults first
      ...o?.validation,
      ...d[y].formElements || {}
      // State-specific overrides
    };
  }), a.getState().setInitialStates(u);
  const _ = (y, S) => {
    const [p] = Y(S?.componentId ?? tt());
    ut({
      stateKey: y,
      options: S,
      initialOptionsPart: d
    });
    const s = a.getState().cogsStateStore[y] || u[y], e = S?.modifyState ? S.modifyState(s) : s;
    S?.log && console.log("useCogsState", y, S);
    const [I, V] = jt(
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
    return V;
  };
  function w(y, S) {
    ut({ stateKey: y, options: S, initialOptionsPart: d });
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
  addValidationError: Ct,
  removeValidationError: M,
  setServerSyncActions: At
} = a.getState(), St = (t) => {
  if (!t) return null;
  try {
    const o = window.localStorage.getItem(t);
    return o ? JSON.parse(o) : null;
  } catch (o) {
    return console.error("Error loading from localStorage:", o), null;
  }
}, Tt = (t, o, f, u) => {
  if (f.log && console.log(
    "saving to localstorage",
    o,
    f.localStorage?.key,
    u
  ), f.localStorage?.key && u) {
    const d = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: a.getState().serverSyncLog[o]?.[0]?.timeStamp,
      baseServerState: a.getState().serverState[o]
    }, _ = `${u}-${o}-${f.localStorage?.key}`;
    window.localStorage.setItem(_, JSON.stringify(d));
  }
}, Ft = (t, o, f, u, d, _) => {
  const w = {
    initialState: o,
    updaterState: Z(
      t,
      u,
      d,
      _
    ),
    state: f
  };
  J(() => {
    nt(t, w.initialState), B(t, w.updaterState), x(t, w.state);
  });
}, mt = (t) => {
  const o = a.getState().stateComponents.get(t);
  if (!o) return;
  const f = /* @__PURE__ */ new Set();
  o.components.forEach((u) => {
    f.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    J(() => {
      f.forEach((u) => u());
    });
  });
}, zt = (t, o) => {
  const f = a.getState().stateComponents.get(t);
  if (f) {
    const u = `${t}////${o}`, d = f.components.get(u);
    d && d.forceUpdate();
  }
};
function jt(t, {
  stateKey: o,
  serverSync: f,
  localStorage: u,
  formElements: d,
  middleware: _,
  reactiveDeps: w,
  reactiveType: y,
  componentId: S,
  initState: p,
  syncUpdate: s
} = {}) {
  const [e, I] = Y({}), { sessionId: V } = Vt();
  let k = !o;
  const [c] = Y(o ?? tt()), U = a.getState().stateLog[c], P = z(/* @__PURE__ */ new Set()), i = z(S ?? tt()), $ = z(null);
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
    const n = dt(c, {
      initState: p,
      localStorage: u
    });
    $.current = n;
    let r = null;
    n.log && console.log("newoptions", n), n.localStorage?.key && V && (r = St(
      V + "-" + c + "-" + n.localStorage?.key
    ));
    let l = null;
    p?.initialState && (l = p?.initialState, r && r.lastUpdated > (r.lastSyncedWithServer || 0) && (l = r.state), Ft(
      c,
      p?.initialState,
      l,
      R,
      i.current,
      V
    ), mt(c), I({}));
  }, [u?.key, ...p?.dependencies || []]), vt(() => {
    k && dt(c, {
      serverSync: f,
      formElements: d,
      initState: p,
      localStorage: u,
      middleware: _
    });
    const n = `${c}////${i.current}`, r = a.getState().stateComponents.get(c) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(n, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: w || void 0,
      reactiveType: y ?? ["component", "deps"]
    }), a.getState().stateComponents.set(c, r), I({}), () => {
      const l = `${c}////${i.current}`;
      r && (r.components.delete(l), r.components.size === 0 && a.getState().stateComponents.delete(c));
    };
  }, []);
  const R = (n, r, l, g) => {
    if (Array.isArray(r)) {
      const m = `${c}-${r.join(".")}`;
      P.current.add(m);
    }
    x(c, (m) => {
      const E = ft(n) ? n(m) : n, j = `${c}-${r.join(".")}`;
      if (j) {
        let b = !1, v = a.getState().signalDomElements.get(j);
        if ((!v || v.size === 0) && (l.updateType === "insert" || l.updateType === "cut")) {
          const h = r.slice(0, -1), A = L(E, h);
          if (Array.isArray(A)) {
            b = !0;
            const N = `${c}-${h.join(".")}`;
            v = a.getState().signalDomElements.get(N);
          }
        }
        if (v) {
          const h = b ? L(E, r.slice(0, -1)) : L(E, r);
          v.forEach(({ parentId: A, position: N, effect: D }) => {
            const T = document.querySelector(
              `[data-parent-id="${A}"]`
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
      l.updateType === "update" && (g || $.current?.validationKey) && r && M(
        (g || $.current?.validationKey) + "." + r.join(".")
      );
      const C = r.slice(0, r.length - 1);
      l.updateType === "cut" && $.current?.validationKey && M(
        $.current?.validationKey + "." + C.join(".")
      ), l.updateType === "insert" && $.current?.validationKey && $t(
        $.current?.validationKey + "." + C.join(".")
      ).filter(([v, h]) => {
        let A = v?.split(".").length;
        if (v == C.join(".") && A == C.length - 1) {
          let N = v + "." + C;
          M(v), Ct(N, h);
        }
      });
      const O = L(m, r), F = L(E, r), W = l.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), rt = a.getState().stateComponents.get(c);
      if (rt)
        for (const [b, v] of rt.components.entries()) {
          let h = !1;
          const A = Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"];
          if (!A.includes("none")) {
            if (A.includes("all")) {
              v.forceUpdate();
              continue;
            }
            if (A.includes("component") && v.paths && (v.paths.has(W) || v.paths.has("")) && (h = !0), !h && A.includes("deps") && v.depsFunction) {
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
        oldValue: O,
        newValue: F
      };
      if (ht(c, (b) => {
        const h = [...b ?? [], at].reduce((A, N) => {
          const D = `${N.stateKey}:${JSON.stringify(N.path)}`, T = A.get(D);
          return T ? (T.timeStamp = Math.max(T.timeStamp, N.timeStamp), T.newValue = N.newValue, T.oldValue = T.oldValue ?? N.oldValue, T.updateType = N.updateType) : A.set(D, { ...N }), A;
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
        const b = a.getState().serverState[c], v = $.current?.serverSync;
        At(c, {
          syncKey: typeof v.syncKey == "string" ? v.syncKey : v.syncKey({ state: E }),
          rollBackState: b,
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
function Z(t, o, f, u) {
  const d = /* @__PURE__ */ new Map();
  let _ = 0;
  const w = (s) => {
    const e = s.join(".");
    for (const [I] of d)
      (I === e || I.startsWith(e + ".")) && d.delete(I);
    _++;
  }, y = /* @__PURE__ */ new Map(), S = {
    removeValidation: (s) => {
      s?.validationKey && M(s.validationKey);
    },
    revertToInitialState: (s) => {
      const e = a.getState().getInitialOptions(t)?.validation;
      e?.key && M(e?.key), s?.validationKey && M(s.validationKey);
      const I = a.getState().initialStateGlobal[t];
      d.clear(), _++;
      const V = p(I, []);
      J(() => {
        B(t, V), x(t, I);
        const k = a.getState().stateComponents.get(t);
        k && k.components.forEach((U) => {
          U.forceUpdate();
        });
        const c = et(t);
        c?.localStorage?.key && localStorage.removeItem(
          c?.initState ? u + "-" + t + "-" + c?.localStorage?.key : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (s) => {
      d.clear(), _++;
      const e = Z(
        t,
        o,
        f,
        u
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
  function p(s, e = [], I) {
    const V = e.map(String).join(".");
    d.get(V);
    const k = function() {
      return a().getNestedState(t, e);
    };
    Object.keys(S).forEach((P) => {
      k[P] = S[P];
    });
    const c = {
      apply(P, i, $) {
        return a().getNestedState(t, e);
      },
      get(P, i) {
        if (i !== "then" && !i.startsWith("$") && i !== "stateMapNoRender") {
          const n = e.join("."), r = `${t}////${f}`, l = a.getState().stateComponents.get(t);
          if (l) {
            const g = l.components.get(r);
            g && (e.length > 0 || i === "get") && g.paths.add(n);
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
              ), l = r ? s : a.getState().getNestedState(t, e);
              return i !== "stateMapNoRender" && (d.clear(), _++), l.map((g, m) => {
                const E = r && g.__origIndex ? g.__origIndex : m, j = p(
                  g,
                  [...e, E.toString()],
                  I
                );
                return n(
                  g,
                  j,
                  m,
                  s,
                  p(s, e, I)
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
              rebuildStateShape: p
            });
          if (i === "stateFlattenOn")
            return (n) => {
              const l = I?.filtered?.some(
                (m) => m.join(".") === e.join(".")
              ) ? s : a.getState().getNestedState(t, e);
              d.clear(), _++;
              const g = l.flatMap(
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
              const l = s.findIndex(
                (E) => E[n] === r
              );
              if (l === -1) return;
              const g = s[l], m = [...e, l.toString()];
              return d.clear(), _++, d.clear(), _++, p(g, m);
            };
          if (i === "index")
            return (n) => {
              const r = s[n];
              return p(r, [...e, n.toString()]);
            };
          if (i === "insert")
            return (n) => (w(e), st(o, n, e, t), p(
              a.getState().cogsStateStore[t],
              []
            ));
          if (i === "uniqueInsert")
            return (n, r, l) => {
              const g = a.getState().getNestedState(t, e), m = ft(n) ? n(g) : n;
              let E = null;
              if (!g.some((C) => {
                if (r) {
                  const F = r.every(
                    (W) => G(C[W], m[W])
                  );
                  return F && (E = C), F;
                }
                const O = G(C, m);
                return O && (E = C), O;
              }))
                w(e), st(o, m, e, t);
              else if (l && E) {
                const C = l(E), O = g.map(
                  (F) => G(F, E) ? C : F
                );
                w(e), q(o, O, e);
              }
            };
          if (i === "cut")
            return (n, r) => {
              r?.waitForSync || (w(e), ct(o, e, t, n));
            };
          if (i === "stateFilter")
            return (n) => {
              const r = s.map((m, E) => ({
                ...m,
                __origIndex: E.toString()
              })), l = [], g = [];
              for (let m = 0; m < r.length; m++)
                n(r[m], m) && (l.push(m), g.push(r[m]));
              return d.clear(), _++, p(g, e, {
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
          return (n) => St(u + "-" + t + "-" + n);
        if (i === "setSelected")
          return (n) => {
            const r = e.slice(0, -1), l = Number(e[e.length - 1]), g = r.join(".");
            n ? y.set(g, l) : y.delete(g);
            const m = a.getState().getNestedState(t, [...r]);
            q(o, m, r), w(r);
          };
        if (e.length == 0) {
          if (i === "validateZodSchema")
            return () => {
              const n = a.getState().getInitialOptions(t)?.validation, r = a.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              M(n.key);
              const l = a.getState().cogsStateStore[t];
              try {
                const g = a.getState().getValidationErrors(n.key);
                g && g.length > 0 && g.forEach(([E]) => {
                  E && E.startsWith(n.key) && M(E);
                });
                const m = n.zodSchema.safeParse(l);
                return m.success ? !0 : (m.error.errors.forEach((j) => {
                  const C = j.path, O = j.message, F = [n.key, ...C].join(".");
                  r(F, O);
                }), mt(t), !1);
              } catch (g) {
                return console.error("Zod schema validation failed", g), !1;
              }
            };
          if (i === "_componentId") return f;
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
              validationKey: a.getState().getInitialOptions(t)?.validation?.key || "",
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
                q(o, n, e, "");
                const l = a.getState().getNestedState(t, e);
                r?.afterUpdate && r.afterUpdate(l);
              }, r.debounce);
            else {
              q(o, n, e, "");
              const l = a.getState().getNestedState(t, e);
              r?.afterUpdate && r.afterUpdate(l);
            }
            w(e);
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
        return p(Q, R, I);
      }
    }, U = new Proxy(k, c);
    return d.set(V, {
      proxy: U,
      stateVersion: _
    }), U;
  }
  return p(
    a.getState().getNestedState(t, [])
  );
}
function X(t) {
  return H(bt, { proxy: t });
}
function Ot({
  proxy: t,
  rebuildStateShape: o
}) {
  const f = a().getNestedState(t._stateKey, t._path);
  return Array.isArray(f) ? o(
    f,
    t._path
  ).stateMapNoRender(
    (d, _, w, y, S) => t._mapFn(d, _, w, y, S)
  ) : null;
}
function bt({
  proxy: t
}) {
  const o = z(null), f = `${t._stateKey}-${t._path.join(".")}`;
  return K(() => {
    const u = o.current;
    if (!u || !u.parentElement) return;
    const d = u.parentElement, w = Array.from(d.childNodes).indexOf(u);
    let y = d.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", y));
    const p = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: w,
      effect: t._effect
    };
    a.getState().addSignalElement(f, p);
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
    u.replaceWith(I);
  }, [t._stateKey, t._path.join("."), t._effect]), H("span", {
    ref: o,
    style: { display: "none" },
    "data-signal-id": f
  });
}
function Jt(t) {
  const o = Et(
    (f) => {
      const u = a.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(t._stateKey, {
        forceUpdate: f,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => u.components.delete(t._stateKey);
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
