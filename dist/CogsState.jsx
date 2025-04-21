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
  const u = o.getState().getInitialOptions, f = o.getState().setInitialStateOptions, d = u(t) || {};
  return a.log && (console.log("setAndMergeOptions", t, a), console.log("setAndMergeOptions oldValue", d)), f(t, {
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
  const f = et(t) || {}, E = { ...u?.[t] || {}, ...f };
  let w = !1;
  if (a)
    for (const m in a)
      E.hasOwnProperty(m) || (w = !0, E[m] = a[m]);
  w && o.getState().setInitialStateOptions(t, E);
}
function Wt(t, { formElements: a, validation: u }) {
  return { initialState: t, formElements: a, validation: u };
}
const qt = (t, a) => {
  let u = t;
  const [f, d] = _t(u);
  (a?.formElements || a?.validation) && Object.keys(d).forEach((m) => {
    d[m] = d[m] || {}, d[m].formElements = {
      ...a.formElements,
      // Global defaults first
      ...a?.validation,
      ...d[m].formElements || {}
      // State-specific overrides
    };
  }), o.getState().setInitialStates(f);
  const E = (m, I) => {
    const [p] = Y(I?.componentId ?? tt());
    ut({
      stateKey: m,
      options: I
    });
    const s = o.getState().cogsStateStore[m] || f[m], e = I?.modifyState ? I.modifyState(s) : s;
    I?.log && console.log("useCogsState", m, I);
    const [v, N] = Ot(
      e,
      {
        stateKey: m,
        syncUpdate: I?.syncUpdate,
        componentId: p,
        localStorage: I?.localStorage,
        middleware: I?.middleware,
        enabledSync: I?.enabledSync,
        reactiveType: I?.reactiveType,
        reactiveDeps: I?.reactiveDeps,
        initState: I?.initState
      }
    );
    return N;
  };
  function w(m, I) {
    ut({ stateKey: m, options: I, initialOptionsPart: d });
  }
  return { useCogsState: E, setCogsOptions: w };
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
    const d = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: o.getState().serverSyncLog[a]?.[0]?.timeStamp,
      baseServerState: o.getState().serverState[a]
    }, E = `${f}-${a}-${u.localStorage?.key}`;
    window.localStorage.setItem(E, JSON.stringify(d));
  }
}, Ft = (t, a, u, f, d, E) => {
  const w = {
    initialState: a,
    updaterState: Z(
      t,
      f,
      d,
      E
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
    const f = `${t}////${a}`, d = u.components.get(f);
    d && d.forceUpdate();
  }
};
function Ot(t, {
  stateKey: a,
  serverSync: u,
  localStorage: f,
  formElements: d,
  middleware: E,
  reactiveDeps: w,
  reactiveType: m,
  componentId: I,
  initState: p,
  syncUpdate: s
} = {}) {
  const [e, v] = Y({}), { sessionId: N } = Nt();
  let k = !a;
  const [c] = Y(a ?? tt()), R = o.getState().stateLog[c], P = z(/* @__PURE__ */ new Set()), i = z(I ?? tt()), $ = z(null);
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
    const n = dt(c, {
      initState: p
    });
    let r = null;
    n.log && console.log("newoptions", n), n.localStorage?.key && N && (r = St(
      N + "-" + c + "-" + n.localStorage?.key
    ));
    let l = null;
    p?.initialState && (l = p?.initialState, r && r.lastUpdated > (r.lastSyncedWithServer || 0) && (l = r.state), Ft(
      c,
      p?.initialState,
      l,
      U,
      i.current,
      N
    ), mt(c), v({}));
  }, [...p?.dependencies || []]), vt(() => {
    k && dt(c, {
      serverSync: u,
      formElements: d,
      initState: p,
      localStorage: f,
      middleware: E
    });
    const n = `${c}////${i.current}`, r = o.getState().stateComponents.get(c) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(n, {
      forceUpdate: () => v({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: w || void 0,
      reactiveType: m ?? ["component", "deps"]
    }), o.getState().stateComponents.set(c, r), v({}), () => {
      const l = `${c}////${i.current}`;
      r && (r.components.delete(l), r.components.size === 0 && o.getState().stateComponents.delete(c));
    };
  }, []);
  const U = (n, r, l, g) => {
    if (Array.isArray(r)) {
      const S = `${c}-${r.join(".")}`;
      P.current.add(S);
    }
    x(c, (S) => {
      const _ = ft(n) ? n(S) : n, O = `${c}-${r.join(".")}`;
      if (O) {
        let M = !1, y = o.getState().signalDomElements.get(O);
        if ((!y || y.size === 0) && (l.updateType === "insert" || l.updateType === "cut")) {
          const h = r.slice(0, -1), C = L(_, h);
          if (Array.isArray(C)) {
            M = !0;
            const V = `${c}-${h.join(".")}`;
            y = o.getState().signalDomElements.get(V);
          }
        }
        if (y) {
          const h = M ? L(_, r.slice(0, -1)) : L(_, r);
          y.forEach(({ parentId: C, position: V, effect: D }) => {
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
      l.updateType === "update" && (g || $.current?.validationKey) && r && b(
        (g || $.current?.validationKey) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      l.updateType === "cut" && $.current?.validationKey && b(
        $.current?.validationKey + "." + A.join(".")
      ), l.updateType === "insert" && $.current?.validationKey && $t(
        $.current?.validationKey + "." + A.join(".")
      ).filter(([y, h]) => {
        let C = y?.split(".").length;
        if (y == A.join(".") && C == A.length - 1) {
          let V = y + "." + A;
          b(y), At(V, h);
        }
      });
      const j = L(S, r), F = L(_, r), W = l.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), rt = o.getState().stateComponents.get(c);
      if (rt)
        for (const [M, y] of rt.components.entries()) {
          let h = !1;
          const C = Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"];
          if (!C.includes("none")) {
            if (C.includes("all")) {
              y.forceUpdate();
              continue;
            }
            if (C.includes("component") && y.paths && (y.paths.has(W) || y.paths.has("")) && (h = !0), !h && C.includes("deps") && y.depsFunction) {
              const V = y.depsFunction(_);
              typeof V == "boolean" ? V && (h = !0) : G(y.deps, V) || (y.deps = V, h = !0);
            }
            h && y.forceUpdate();
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
      if (ht(c, (M) => {
        const h = [...M ?? [], ot].reduce((C, V) => {
          const D = `${V.stateKey}:${JSON.stringify(V.path)}`, T = C.get(D);
          return T ? (T.timeStamp = Math.max(T.timeStamp, V.timeStamp), T.newValue = V.newValue, T.oldValue = T.oldValue ?? V.oldValue, T.updateType = V.updateType) : C.set(D, { ...V }), C;
        }, /* @__PURE__ */ new Map());
        return Array.from(h.values());
      }), Tt(
        _,
        c,
        $.current,
        N
      ), E && E({
        updateLog: R,
        update: ot
      }), $.current?.serverSync) {
        const M = o.getState().serverState[c], y = $.current?.serverSync;
        Ct(c, {
          syncKey: typeof y.syncKey == "string" ? y.syncKey : y.syncKey({ state: _ }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (y.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return _;
    });
  };
  o.getState().updaterState[c] || (B(
    c,
    Z(
      c,
      U,
      i.current,
      N
    )
  ), o.getState().cogsStateStore[c] || x(c, t), o.getState().initialStateGlobal[c] || nt(c, t));
  const Q = It(() => Z(
    c,
    U,
    i.current,
    N
  ), [c]);
  return [gt(c), Q];
}
function Z(t, a, u, f) {
  const d = /* @__PURE__ */ new Map();
  let E = 0;
  const w = (s) => {
    const e = s.join(".");
    for (const [v] of d)
      (v === e || v.startsWith(e + ".")) && d.delete(v);
    E++;
  }, m = /* @__PURE__ */ new Map(), I = {
    removeValidation: (s) => {
      s?.validationKey && b(s.validationKey);
    },
    revertToInitialState: (s) => {
      const e = o.getState().getInitialOptions(t)?.validation;
      e?.key && b(e?.key), s?.validationKey && b(s.validationKey);
      const v = o.getState().initialStateGlobal[t];
      d.clear(), E++;
      const N = p(v, []);
      J(() => {
        B(t, N), x(t, v);
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
      d.clear(), E++;
      const e = Z(
        t,
        a,
        u,
        f
      );
      return J(() => {
        nt(t, s), B(t, e), x(t, s);
        const v = o.getState().stateComponents.get(t);
        v && v.components.forEach((N) => {
          N.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (v) => e.get()[v]
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
  function p(s, e = [], v) {
    const N = e.map(String).join(".");
    d.get(N);
    const k = function() {
      return o().getNestedState(t, e);
    };
    Object.keys(I).forEach((P) => {
      k[P] = I[P];
    });
    const c = {
      apply(P, i, $) {
        return o().getNestedState(t, e);
      },
      get(P, i) {
        if (i !== "then" && !i.startsWith("$") && i !== "stateMapNoRender") {
          const n = e.join("."), r = `${t}////${u}`, l = o.getState().stateComponents.get(t);
          if (l) {
            const g = l.components.get(r);
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
              const n = m.get(e.join("."));
              if (n !== void 0)
                return p(
                  s[n],
                  [...e, n.toString()],
                  v
                );
            };
          if (i === "stateMap" || i === "stateMapNoRender")
            return (n) => {
              const r = v?.filtered?.some(
                (g) => g.join(".") === e.join(".")
              ), l = r ? s : o.getState().getNestedState(t, e);
              return i !== "stateMapNoRender" && (d.clear(), E++), l.map((g, S) => {
                const _ = r && g.__origIndex ? g.__origIndex : S, O = p(
                  g,
                  [...e, _.toString()],
                  v
                );
                return n(
                  g,
                  O,
                  S,
                  s,
                  p(s, e, v)
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
              const l = v?.filtered?.some(
                (S) => S.join(".") === e.join(".")
              ) ? s : o.getState().getNestedState(t, e);
              d.clear(), E++;
              const g = l.flatMap(
                (S, _) => S[n] ?? []
              );
              return p(
                g,
                [...e, "[*]", n],
                v
              );
            };
          if (i === "findWith")
            return (n, r) => {
              const l = s.findIndex(
                (_) => _[n] === r
              );
              if (l === -1) return;
              const g = s[l], S = [...e, l.toString()];
              return d.clear(), E++, d.clear(), E++, p(g, S);
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
            return (n, r, l) => {
              const g = o.getState().getNestedState(t, e), S = ft(n) ? n(g) : n;
              let _ = null;
              if (!g.some((A) => {
                if (r) {
                  const F = r.every(
                    (W) => G(A[W], S[W])
                  );
                  return F && (_ = A), F;
                }
                const j = G(A, S);
                return j && (_ = A), j;
              }))
                w(e), st(a, S, e, t);
              else if (l && _) {
                const A = l(_), j = g.map(
                  (F) => G(F, _) ? A : F
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
              const r = s.map((S, _) => ({
                ...S,
                __origIndex: _.toString()
              })), l = [], g = [];
              for (let S = 0; S < r.length; S++)
                n(r[S], S) && (l.push(S), g.push(r[S]));
              return d.clear(), E++, p(g, e, {
                filtered: [...v?.filtered || [], e],
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
          return Array.isArray(l) ? Number(e[e.length - 1]) === m.get(r) : void 0;
        }
        if (i == "getLocalStorage")
          return (n) => St(f + "-" + t + "-" + n);
        if (i === "setSelected")
          return (n) => {
            const r = e.slice(0, -1), l = Number(e[e.length - 1]), g = r.join(".");
            n ? m.set(g, l) : m.delete(g);
            const S = o.getState().getNestedState(t, [...r]);
            q(a, S, r), w(r);
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
              const l = o.getState().cogsStateStore[t];
              try {
                const g = o.getState().getValidationErrors(n.key);
                g && g.length > 0 && g.forEach(([_]) => {
                  _ && _.startsWith(n.key) && b(_);
                });
                const S = n.zodSchema.safeParse(l);
                return S.success ? !0 : (S.error.errors.forEach((O) => {
                  const A = O.path, j = O.message, F = [n.key, ...A].join(".");
                  r(F, j);
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
            return I.revertToInitialState;
          if (i === "updateInitialState") return I.updateInitialState;
          if (i === "removeValidation") return I.removeValidation;
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
        if (i === "_isServerSynced") return I._isServerSynced;
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
        const U = [...e, i], Q = o.getState().getNestedState(t, U);
        return p(Q, U, v);
      }
    }, R = new Proxy(k, c);
    return d.set(N, {
      proxy: R,
      stateVersion: E
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
    (d, E, w, m, I) => t._mapFn(d, E, w, m, I)
  ) : null;
}
function Mt({
  proxy: t
}) {
  const a = z(null), u = `${t._stateKey}-${t._path.join(".")}`;
  return K(() => {
    const f = a.current;
    if (!f || !f.parentElement) return;
    const d = f.parentElement, w = Array.from(d.childNodes).indexOf(f);
    let m = d.getAttribute("data-parent-id");
    m || (m = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", m));
    const p = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: m,
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
      } catch (N) {
        console.error("Error evaluating effect function during mount:", N), e = s;
      }
    else
      e = s;
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
  Ot as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
