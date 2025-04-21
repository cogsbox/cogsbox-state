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
  const f = o.getState().getInitialOptions, u = o.getState().setInitialStateOptions, d = f(t) || {};
  return a.log && (console.log("setAndMergeOptions", t, a), console.log("setAndMergeOptions oldValue", d)), u(t, {
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
  initialOptionsPart: f
}) {
  const u = et(t) || {}, E = { ...f?.[t] || {}, ...u };
  let w = !1;
  a && Object.keys(a).forEach((m) => {
    const y = a[m];
    E[m] !== y && (E[m] = y, w = !0);
  }), w && o.getState().setInitialStateOptions(t, E);
}
function Wt(t, { formElements: a, validation: f }) {
  return { initialState: t, formElements: a, validation: f };
}
const qt = (t, a) => {
  let f = t;
  const [u, d] = _t(f);
  (a?.formElements || a?.validation) && Object.keys(d).forEach((m) => {
    d[m] = d[m] || {}, d[m].formElements = {
      ...a.formElements,
      // Global defaults first
      ...a?.validation,
      ...d[m].formElements || {}
      // State-specific overrides
    };
  }), o.getState().setInitialStates(u);
  const E = (m, y) => {
    const [p] = Y(y?.componentId ?? tt());
    ut({
      stateKey: m,
      options: y
    });
    const s = o.getState().cogsStateStore[m] || u[m], e = y?.modifyState ? y.modifyState(s) : s;
    y?.log && console.log("useCogsState", m, y);
    const [I, N] = jt(
      e,
      {
        stateKey: m,
        syncUpdate: y?.syncUpdate,
        componentId: p,
        localStorage: y?.localStorage,
        middleware: y?.middleware,
        enabledSync: y?.enabledSync,
        reactiveType: y?.reactiveType,
        reactiveDeps: y?.reactiveDeps,
        initState: y?.initState
      }
    );
    return N;
  };
  function w(m, y) {
    ut({ stateKey: m, options: y, initialOptionsPart: d });
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
}, Tt = (t, a, f, u) => {
  if (f.log && console.log(
    "saving to localstorage",
    a,
    f.localStorage?.key,
    u
  ), f.localStorage?.key && u) {
    const d = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: o.getState().serverSyncLog[a]?.[0]?.timeStamp,
      baseServerState: o.getState().serverState[a]
    }, E = `${u}-${a}-${f.localStorage?.key}`;
    window.localStorage.setItem(E, JSON.stringify(d));
  }
}, Ft = (t, a, f, u, d, E) => {
  const w = {
    initialState: a,
    updaterState: Z(
      t,
      u,
      d,
      E
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
    const u = `${t}////${a}`, d = f.components.get(u);
    d && d.forceUpdate();
  }
};
function jt(t, {
  stateKey: a,
  serverSync: f,
  localStorage: u,
  formElements: d,
  middleware: E,
  reactiveDeps: w,
  reactiveType: m,
  componentId: y,
  initState: p,
  syncUpdate: s
} = {}) {
  const [e, I] = Y({}), { sessionId: N } = Nt();
  let R = !a;
  const [c] = Y(a ?? tt()), k = o.getState().stateLog[c], U = z(/* @__PURE__ */ new Set()), i = z(y ?? tt()), $ = z(null);
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
  ), console.log("latestInitialOptionsRef.current localStorage", u)), K(() => {
    const n = dt(c, {
      initState: p,
      localStorage: u
    });
    $.current = n;
    let r = null;
    n.log && console.log("newoptions", n), n.localStorage?.key && N && (r = St(
      N + "-" + c + "-" + n.localStorage?.key
    ));
    let l = null;
    p?.initialState && (l = p?.initialState, r && r.lastUpdated > (r.lastSyncedWithServer || 0) && (l = r.state), Ft(
      c,
      p?.initialState,
      l,
      P,
      i.current,
      N
    ), mt(c), I({}));
  }, [u?.key, ...p?.dependencies || []]), vt(() => {
    R && dt(c, {
      serverSync: f,
      formElements: d,
      initState: p,
      localStorage: u,
      middleware: E
    });
    const n = `${c}////${i.current}`, r = o.getState().stateComponents.get(c) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(n, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: w || void 0,
      reactiveType: m ?? ["component", "deps"]
    }), o.getState().stateComponents.set(c, r), I({}), () => {
      const l = `${c}////${i.current}`;
      r && (r.components.delete(l), r.components.size === 0 && o.getState().stateComponents.delete(c));
    };
  }, []);
  const P = (n, r, l, g) => {
    if (Array.isArray(r)) {
      const S = `${c}-${r.join(".")}`;
      U.current.add(S);
    }
    x(c, (S) => {
      const _ = ft(n) ? n(S) : n, j = `${c}-${r.join(".")}`;
      if (j) {
        let M = !1, v = o.getState().signalDomElements.get(j);
        if ((!v || v.size === 0) && (l.updateType === "insert" || l.updateType === "cut")) {
          const h = r.slice(0, -1), C = L(_, h);
          if (Array.isArray(C)) {
            M = !0;
            const V = `${c}-${h.join(".")}`;
            v = o.getState().signalDomElements.get(V);
          }
        }
        if (v) {
          const h = M ? L(_, r.slice(0, -1)) : L(_, r);
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
      l.updateType === "update" && (g || $.current?.validationKey) && r && b(
        (g || $.current?.validationKey) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      l.updateType === "cut" && $.current?.validationKey && b(
        $.current?.validationKey + "." + A.join(".")
      ), l.updateType === "insert" && $.current?.validationKey && $t(
        $.current?.validationKey + "." + A.join(".")
      ).filter(([v, h]) => {
        let C = v?.split(".").length;
        if (v == A.join(".") && C == A.length - 1) {
          let V = v + "." + A;
          b(v), At(V, h);
        }
      });
      const O = L(S, r), F = L(_, r), W = l.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), rt = o.getState().stateComponents.get(c);
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
              const V = v.depsFunction(_);
              typeof V == "boolean" ? V && (h = !0) : G(v.deps, V) || (v.deps = V, h = !0);
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
        oldValue: O,
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
        updateLog: k,
        update: ot
      }), $.current?.serverSync) {
        const M = o.getState().serverState[c], v = $.current?.serverSync;
        Ct(c, {
          syncKey: typeof v.syncKey == "string" ? v.syncKey : v.syncKey({ state: _ }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (v.debounce ?? 3e3),
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
      P,
      i.current,
      N
    )
  ), o.getState().cogsStateStore[c] || x(c, t), o.getState().initialStateGlobal[c] || nt(c, t));
  const Q = It(() => Z(
    c,
    P,
    i.current,
    N
  ), [c]);
  return [gt(c), Q];
}
function Z(t, a, f, u) {
  const d = /* @__PURE__ */ new Map();
  let E = 0;
  const w = (s) => {
    const e = s.join(".");
    for (const [I] of d)
      (I === e || I.startsWith(e + ".")) && d.delete(I);
    E++;
  }, m = /* @__PURE__ */ new Map(), y = {
    removeValidation: (s) => {
      s?.validationKey && b(s.validationKey);
    },
    revertToInitialState: (s) => {
      const e = o.getState().getInitialOptions(t)?.validation;
      e?.key && b(e?.key), s?.validationKey && b(s.validationKey);
      const I = o.getState().initialStateGlobal[t];
      d.clear(), E++;
      const N = p(I, []);
      J(() => {
        B(t, N), x(t, I);
        const R = o.getState().stateComponents.get(t);
        R && R.components.forEach((k) => {
          k.forceUpdate();
        });
        const c = et(t);
        c?.localStorage?.key && localStorage.removeItem(
          c?.initState ? u + "-" + t + "-" + c?.localStorage?.key : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (s) => {
      d.clear(), E++;
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
    d.get(N);
    const R = function() {
      return o().getNestedState(t, e);
    };
    Object.keys(y).forEach((U) => {
      R[U] = y[U];
    });
    const c = {
      apply(U, i, $) {
        return o().getNestedState(t, e);
      },
      get(U, i) {
        if (i !== "then" && !i.startsWith("$") && i !== "stateMapNoRender") {
          const n = e.join("."), r = `${t}////${f}`, l = o.getState().stateComponents.get(t);
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
                  I
                );
            };
          if (i === "stateMap" || i === "stateMapNoRender")
            return (n) => {
              const r = I?.filtered?.some(
                (g) => g.join(".") === e.join(".")
              ), l = r ? s : o.getState().getNestedState(t, e);
              return i !== "stateMapNoRender" && (d.clear(), E++), l.map((g, S) => {
                const _ = r && g.__origIndex ? g.__origIndex : S, j = p(
                  g,
                  [...e, _.toString()],
                  I
                );
                return n(
                  g,
                  j,
                  S,
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
                (S) => S.join(".") === e.join(".")
              ) ? s : o.getState().getNestedState(t, e);
              d.clear(), E++;
              const g = l.flatMap(
                (S, _) => S[n] ?? []
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
                const O = G(A, S);
                return O && (_ = A), O;
              }))
                w(e), st(a, S, e, t);
              else if (l && _) {
                const A = l(_), O = g.map(
                  (F) => G(F, _) ? A : F
                );
                w(e), q(a, O, e);
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
          return Array.isArray(l) ? Number(e[e.length - 1]) === m.get(r) : void 0;
        }
        if (i == "getLocalStorage")
          return (n) => St(u + "-" + t + "-" + n);
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
                return S.success ? !0 : (S.error.errors.forEach((j) => {
                  const A = j.path, O = j.message, F = [n.key, ...A].join(".");
                  r(F, O);
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
            return y.revertToInitialState;
          if (i === "updateInitialState") return y.updateInitialState;
          if (i === "removeValidation") return y.removeValidation;
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
        if (i === "_isServerSynced") return y._isServerSynced;
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
        const P = [...e, i], Q = o.getState().getNestedState(t, P);
        return p(Q, P, I);
      }
    }, k = new Proxy(R, c);
    return d.set(N, {
      proxy: k,
      stateVersion: E
    }), k;
  }
  return p(
    o.getState().getNestedState(t, [])
  );
}
function X(t) {
  return H(Mt, { proxy: t });
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
    (d, E, w, m, y) => t._mapFn(d, E, w, m, y)
  ) : null;
}
function Mt({
  proxy: t
}) {
  const a = z(null), f = `${t._stateKey}-${t._path.join(".")}`;
  return K(() => {
    const u = a.current;
    if (!u || !u.parentElement) return;
    const d = u.parentElement, w = Array.from(d.childNodes).indexOf(u);
    let m = d.getAttribute("data-parent-id");
    m || (m = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", m));
    const p = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: m,
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
  jt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
