"use client";
import { jsx as st } from "react/jsx-runtime";
import { useState as K, useRef as z, useEffect as tt, useLayoutEffect as vt, useMemo as It, createElement as Q, useSyncExternalStore as Et, startTransition as J } from "react";
import { transformStateFunc as _t, isFunction as B, getNestedValue as L, isDeepEqual as G, debounce as pt } from "./utility.js";
import { pushFunc as ct, updateFn as q, cutFunc as lt, ValidationWrapper as wt, FormControlComponent as Nt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as a, formRefStore as dt } from "./store.js";
import { useCogsConfig as Vt } from "./CogsStateClient.jsx";
import et from "./node_modules/uuid/dist/esm-browser/v4.js";
function ut(t, o) {
  const f = a.getState().getInitialOptions, S = a.getState().setInitialStateOptions, l = f(t) || {};
  S(t, {
    ...l,
    ...o
  });
}
function ft({
  stateKey: t,
  options: o,
  initialOptionsPart: f
}) {
  const S = nt(t) || {}, l = f[t] || {}, p = a.getState().setInitialStateOptions, E = { ...l, ...S };
  let y = !1;
  if (o)
    for (const g in o)
      E.hasOwnProperty(g) ? g == "localStorage" && o[g] && E[g].key !== o[g]?.key && (y = !0, E[g] = o[g]) : (y = !0, E[g] = o[g]);
  y && p(t, E);
}
function Wt(t, { formElements: o, validation: f }) {
  return { initialState: t, formElements: o, validation: f };
}
const qt = (t, o) => {
  let f = t;
  const [S, l] = _t(f);
  (o?.formElements || o?.validation) && Object.keys(l).forEach((y) => {
    l[y] = l[y] || {}, l[y].formElements = {
      ...o.formElements,
      // Global defaults first
      ...o?.validation,
      ...l[y].formElements || {}
      // State-specific overrides
    };
  }), a.getState().setInitialStates(S);
  const p = (y, g) => {
    const [w] = K(g?.componentId ?? et());
    ft({
      stateKey: y,
      options: g,
      initialOptionsPart: l
    });
    const s = a.getState().cogsStateStore[y] || S[y], e = g?.modifyState ? g.modifyState(s) : s, [I, V] = Ft(
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
  function E(y, g) {
    ft({ stateKey: y, options: g, initialOptionsPart: l });
  }
  return { useCogsState: p, setCogsOptions: E };
}, {
  setUpdaterState: Z,
  setState: x,
  getInitialOptions: nt,
  getKeyState: gt,
  getValidationErrors: $t,
  setStateLog: ht,
  updateInitialStateGlobal: rt,
  addValidationError: At,
  removeValidationError: M,
  setServerSyncActions: Ct
} = a.getState(), St = (t) => {
  if (!t) return null;
  try {
    const o = window.localStorage.getItem(t);
    return o ? JSON.parse(o) : null;
  } catch (o) {
    return console.error("Error loading from localStorage:", o), null;
  }
}, Tt = (t, o, f, S) => {
  f.log && console.log(
    "saving to localstorage",
    o,
    f.localStorage?.key,
    S
  );
  const l = B(f.localStorage?.key) ? f.localStorage?.key(t) : f.localStorage?.key;
  if (l && S) {
    const p = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: a.getState().serverSyncLog[o]?.[0]?.timeStamp,
      baseServerState: a.getState().serverState[o]
    }, E = `${S}-${o}-${l}`;
    window.localStorage.setItem(E, JSON.stringify(p));
  }
}, kt = (t, o, f, S, l, p) => {
  const E = {
    initialState: o,
    updaterState: H(
      t,
      S,
      l,
      p
    ),
    state: f
  };
  J(() => {
    rt(t, E.initialState), Z(t, E.updaterState), x(t, E.state);
  });
}, mt = (t) => {
  const o = a.getState().stateComponents.get(t);
  if (!o) return;
  const f = /* @__PURE__ */ new Set();
  o.components.forEach((S) => {
    f.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    J(() => {
      f.forEach((S) => S());
    });
  });
}, zt = (t, o) => {
  const f = a.getState().stateComponents.get(t);
  if (f) {
    const S = `${t}////${o}`, l = f.components.get(S);
    l && l.forceUpdate();
  }
};
function Ft(t, {
  stateKey: o,
  serverSync: f,
  localStorage: S,
  formElements: l,
  middleware: p,
  reactiveDeps: E,
  reactiveType: y,
  componentId: g,
  initState: w,
  syncUpdate: s
} = {}) {
  const [e, I] = K({}), { sessionId: V } = Vt();
  let O = !o;
  const [c] = K(o ?? et()), U = a.getState().stateLog[c], P = z(/* @__PURE__ */ new Set()), i = z(g ?? et()), $ = z(null);
  $.current = nt(c), tt(() => {
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
  }, [s]), tt(() => {
    ut(c, {
      initState: w
    });
    const n = $.current;
    let r = null;
    n.log && console.log("newoptions", n);
    const d = B(n.localStorage?.key) ? n.localStorage?.key(w) : n.localStorage?.key;
    d && V && (r = St(
      V + "-" + c + "-" + d
    ));
    let u = null;
    w?.initialState && (u = w?.initialState, r && r.lastUpdated > (r.lastSyncedWithServer || 0) && (u = r.state), kt(
      c,
      w?.initialState,
      u,
      R,
      i.current,
      V
    ), mt(c), I({}));
  }, [...w?.dependencies || []]), vt(() => {
    O && ut(c, {
      serverSync: f,
      formElements: l,
      initState: w,
      localStorage: S,
      middleware: p
    });
    const n = `${c}////${i.current}`, r = a.getState().stateComponents.get(c) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(n, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0,
      reactiveType: y ?? ["component", "deps"]
    }), a.getState().stateComponents.set(c, r), I({}), () => {
      const d = `${c}////${i.current}`;
      r && (r.components.delete(d), r.components.size === 0 && a.getState().stateComponents.delete(c));
    };
  }, []);
  const R = (n, r, d, u) => {
    if (Array.isArray(r)) {
      const m = `${c}-${r.join(".")}`;
      P.current.add(m);
    }
    x(c, (m) => {
      const _ = B(n) ? n(m) : n, F = `${c}-${r.join(".")}`;
      if (F) {
        let b = !1, v = a.getState().signalDomElements.get(F);
        if ((!v || v.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const h = r.slice(0, -1), C = L(_, h);
          if (Array.isArray(C)) {
            b = !0;
            const N = `${c}-${h.join(".")}`;
            v = a.getState().signalDomElements.get(N);
          }
        }
        if (v) {
          const h = b ? L(_, r.slice(0, -1)) : L(_, r);
          v.forEach(({ parentId: C, position: N, effect: D }) => {
            const T = document.querySelector(
              `[data-parent-id="${C}"]`
            );
            if (T) {
              const it = Array.from(T.childNodes);
              if (it[N]) {
                const yt = D ? new Function("state", `return (${D})(state)`)(h) : h;
                it[N].textContent = String(yt);
              }
            }
          });
        }
      }
      d.updateType === "update" && (u || $.current?.validationKey) && r && M(
        (u || $.current?.validationKey) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      d.updateType === "cut" && $.current?.validationKey && M(
        $.current?.validationKey + "." + A.join(".")
      ), d.updateType === "insert" && $.current?.validationKey && $t(
        $.current?.validationKey + "." + A.join(".")
      ).filter(([v, h]) => {
        let C = v?.split(".").length;
        if (v == A.join(".") && C == A.length - 1) {
          let N = v + "." + A;
          M(v), At(N, h);
        }
      });
      const j = L(m, r), k = L(_, r), W = d.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), at = a.getState().stateComponents.get(c);
      if (at)
        for (const [b, v] of at.components.entries()) {
          let h = !1;
          const C = Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"];
          if (!C.includes("none")) {
            if (C.includes("all")) {
              v.forceUpdate();
              continue;
            }
            if (C.includes("component") && v.paths && (v.paths.has(W) || v.paths.has("")) && (h = !0), !h && C.includes("deps") && v.depsFunction) {
              const N = v.depsFunction(_);
              typeof N == "boolean" ? N && (h = !0) : G(v.deps, N) || (v.deps = N, h = !0);
            }
            h && v.forceUpdate();
          }
        }
      const ot = {
        timeStamp: Date.now(),
        stateKey: c,
        path: r,
        updateType: d.updateType,
        status: "new",
        oldValue: j,
        newValue: k
      };
      if (ht(c, (b) => {
        const h = [...b ?? [], ot].reduce((C, N) => {
          const D = `${N.stateKey}:${JSON.stringify(N.path)}`, T = C.get(D);
          return T ? (T.timeStamp = Math.max(T.timeStamp, N.timeStamp), T.newValue = N.newValue, T.oldValue = T.oldValue ?? N.oldValue, T.updateType = N.updateType) : C.set(D, { ...N }), C;
        }, /* @__PURE__ */ new Map());
        return Array.from(h.values());
      }), Tt(
        _,
        c,
        $.current,
        V
      ), p && p({
        updateLog: U,
        update: ot
      }), $.current?.serverSync) {
        const b = a.getState().serverState[c], v = $.current?.serverSync;
        Ct(c, {
          syncKey: typeof v.syncKey == "string" ? v.syncKey : v.syncKey({ state: _ }),
          rollBackState: b,
          actionTimeStamp: Date.now() + (v.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return _;
    });
  };
  a.getState().updaterState[c] || (Z(
    c,
    H(
      c,
      R,
      i.current,
      V
    )
  ), a.getState().cogsStateStore[c] || x(c, t), a.getState().initialStateGlobal[c] || rt(c, t));
  const X = It(() => H(
    c,
    R,
    i.current,
    V
  ), [c]);
  return [gt(c), X];
}
function H(t, o, f, S) {
  const l = /* @__PURE__ */ new Map();
  let p = 0;
  const E = (s) => {
    const e = s.join(".");
    for (const [I] of l)
      (I === e || I.startsWith(e + ".")) && l.delete(I);
    p++;
  }, y = /* @__PURE__ */ new Map(), g = {
    removeValidation: (s) => {
      s?.validationKey && M(s.validationKey);
    },
    revertToInitialState: (s) => {
      const e = a.getState().getInitialOptions(t)?.validation;
      e?.key && M(e?.key), s?.validationKey && M(s.validationKey);
      const I = a.getState().initialStateGlobal[t];
      l.clear(), p++;
      const V = w(I, []);
      J(() => {
        Z(t, V), x(t, I);
        const O = a.getState().stateComponents.get(t);
        O && O.components.forEach((U) => {
          U.forceUpdate();
        });
        const c = nt(t);
        c?.localStorage?.key && localStorage.removeItem(
          c?.initState ? S + "-" + t + "-" + c?.localStorage?.key : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (s) => {
      l.clear(), p++;
      const e = H(
        t,
        o,
        f,
        S
      );
      return J(() => {
        rt(t, s), Z(t, e), x(t, s);
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
    l.get(V);
    const O = function() {
      return a().getNestedState(t, e);
    };
    Object.keys(g).forEach((P) => {
      O[P] = g[P];
    });
    const c = {
      apply(P, i, $) {
        return a().getNestedState(t, e);
      },
      get(P, i) {
        if (i !== "then" && !i.startsWith("$") && i !== "stateMapNoRender") {
          const n = e.join("."), r = `${t}////${f}`, d = a.getState().stateComponents.get(t);
          if (d) {
            const u = d.components.get(r);
            u && (e.length > 0 || i === "get") && u.paths.add(n);
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
                (u) => u.join(".") === e.join(".")
              ), d = r ? s : a.getState().getNestedState(t, e);
              return i !== "stateMapNoRender" && (l.clear(), p++), d.map((u, m) => {
                const _ = r && u.__origIndex ? u.__origIndex : m, F = w(
                  u,
                  [...e, _.toString()],
                  I
                );
                return n(
                  u,
                  F,
                  m,
                  s,
                  w(s, e, I)
                );
              });
            };
          if (i === "$stateMap")
            return (n) => Q(jt, {
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
              l.clear(), p++;
              const u = d.flatMap(
                (m, _) => m[n] ?? []
              );
              return w(
                u,
                [...e, "[*]", n],
                I
              );
            };
          if (i === "findWith")
            return (n, r) => {
              const d = s.findIndex(
                (_) => _[n] === r
              );
              if (d === -1) return;
              const u = s[d], m = [...e, d.toString()];
              return l.clear(), p++, l.clear(), p++, w(u, m);
            };
          if (i === "index")
            return (n) => {
              const r = s[n];
              return w(r, [...e, n.toString()]);
            };
          if (i === "insert")
            return (n) => (E(e), ct(o, n, e, t), w(
              a.getState().cogsStateStore[t],
              []
            ));
          if (i === "uniqueInsert")
            return (n, r, d) => {
              const u = a.getState().getNestedState(t, e), m = B(n) ? n(u) : n;
              let _ = null;
              if (!u.some((A) => {
                if (r) {
                  const k = r.every(
                    (W) => G(A[W], m[W])
                  );
                  return k && (_ = A), k;
                }
                const j = G(A, m);
                return j && (_ = A), j;
              }))
                E(e), ct(o, m, e, t);
              else if (d && _) {
                const A = d(_), j = u.map(
                  (k) => G(k, _) ? A : k
                );
                E(e), q(o, j, e);
              }
            };
          if (i === "cut")
            return (n, r) => {
              r?.waitForSync || (E(e), lt(o, e, t, n));
            };
          if (i === "stateFilter")
            return (n) => {
              const r = s.map((m, _) => ({
                ...m,
                __origIndex: _.toString()
              })), d = [], u = [];
              for (let m = 0; m < r.length; m++)
                n(r[m], m) && (d.push(m), u.push(r[m]));
              return l.clear(), p++, w(u, e, {
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
            return () => lt(
              o,
              n,
              t,
              Number($)
            );
        }
        if (i === "get")
          return () => a.getState().getNestedState(t, e);
        if (i === "$derive")
          return (n) => Y({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (i === "$derive")
          return (n) => Y({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (i === "$get")
          return () => Y({
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
          return (n) => St(S + "-" + t + "-" + n);
        if (i === "setSelected")
          return (n) => {
            const r = e.slice(0, -1), d = Number(e[e.length - 1]), u = r.join(".");
            n ? y.set(u, d) : y.delete(u);
            const m = a.getState().getNestedState(t, [...r]);
            q(o, m, r), E(r);
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
              const d = a.getState().cogsStateStore[t];
              try {
                const u = a.getState().getValidationErrors(n.key);
                u && u.length > 0 && u.forEach(([_]) => {
                  _ && _.startsWith(n.key) && M(_);
                });
                const m = n.zodSchema.safeParse(d);
                return m.success ? !0 : (m.error.errors.forEach((F) => {
                  const A = F.path, j = F.message, k = [n.key, ...A].join(".");
                  r(k, j);
                }), mt(t), !1);
              } catch (u) {
                return console.error("Zod schema validation failed", u), !1;
              }
            };
          if (i === "_componentId") return f;
          if (i === "getComponents")
            return () => a().stateComponents.get(t);
          if (i === "getAllFormRefs")
            return () => dt.getState().getFormRefsByStateKey(t);
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
          return () => dt.getState().getFormRef(t + "." + e.join("."));
        if (i === "validationWrapper")
          return ({
            children: n,
            hideMessage: r
          }) => /* @__PURE__ */ st(
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
            E(e);
          };
        if (i === "formElement")
          return (n, r) => /* @__PURE__ */ st(
            Nt,
            {
              setState: o,
              stateKey: t,
              path: e,
              child: n,
              formOpts: r
            }
          );
        const R = [...e, i], X = a.getState().getNestedState(t, R);
        return w(X, R, I);
      }
    }, U = new Proxy(O, c);
    return l.set(V, {
      proxy: U,
      stateVersion: p
    }), U;
  }
  return w(
    a.getState().getNestedState(t, [])
  );
}
function Y(t) {
  return Q(bt, { proxy: t });
}
function jt({
  proxy: t,
  rebuildStateShape: o
}) {
  const f = a().getNestedState(t._stateKey, t._path);
  return Array.isArray(f) ? o(
    f,
    t._path
  ).stateMapNoRender(
    (l, p, E, y, g) => t._mapFn(l, p, E, y, g)
  ) : null;
}
function bt({
  proxy: t
}) {
  const o = z(null), f = `${t._stateKey}-${t._path.join(".")}`;
  return tt(() => {
    const S = o.current;
    if (!S || !S.parentElement) return;
    const l = S.parentElement, E = Array.from(l.childNodes).indexOf(S);
    let y = l.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, l.setAttribute("data-parent-id", y));
    const w = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: E,
      effect: t._effect
    };
    a.getState().addSignalElement(f, w);
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
    S.replaceWith(I);
  }, [t._stateKey, t._path.join("."), t._effect]), Q("span", {
    ref: o,
    style: { display: "none" },
    "data-signal-id": f
  });
}
function Jt(t) {
  const o = Et(
    (f) => {
      const S = a.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return S.components.set(t._stateKey, {
        forceUpdate: f,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => S.components.delete(t._stateKey);
    },
    () => a.getState().getNestedState(t._stateKey, t._path)
  );
  return Q("text", {}, String(o));
}
export {
  Y as $cogsSignal,
  Jt as $cogsSignalStore,
  Wt as addStateOptions,
  qt as createCogsState,
  zt as notifyComponent,
  Ft as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
