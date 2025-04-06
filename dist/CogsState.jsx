"use client";
import { jsx as ot } from "react/jsx-runtime";
import { useState as X, useRef as z, useEffect as Y, useLayoutEffect as It, useMemo as Et, createElement as H, useSyncExternalStore as _t, startTransition as J } from "react";
import { transformStateFunc as pt, isFunction as ut, getNestedValue as L, isDeepEqual as k, debounce as wt } from "./utility.js";
import { pushFunc as it, updateFn as q, cutFunc as st, ValidationWrapper as $t, FormControlComponent as Vt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as ct } from "./store.js";
import { useCogsConfig as Nt } from "./CogsStateClient.jsx";
import K from "./node_modules/uuid/dist/esm-browser/v4.js";
function lt(t, o) {
  const g = r.getState().getInitialOptions, S = r.getState().setInitialStateOptions, l = g(t) || {};
  S(t, {
    ...l,
    ...o
  });
}
function dt({
  stateKey: t,
  options: o,
  initialOptionsPart: g
}) {
  const S = tt(t) || {}, l = g[t] || {}, E = r.getState().setInitialStateOptions, _ = { ...l, ...S };
  let v = !1;
  if (o)
    for (const m in o)
      _.hasOwnProperty(m) || (v = !0, _[m] = o[m]);
  v && E(t, _);
}
function qt(t, { formElements: o, validation: g }) {
  return { initialState: t, formElements: o, validation: g };
}
const zt = (t, o) => {
  let g = t;
  const [S, l] = pt(g);
  (o?.formElements || o?.validation) && Object.keys(l).forEach((v) => {
    l[v] = l[v] || {}, l[v].formElements = {
      ...o.formElements,
      // Global defaults first
      ...o?.validation,
      ...l[v].formElements || {}
      // State-specific overrides
    };
  }), r.getState().setInitialStates(S);
  const E = (v, m) => {
    const [p] = X(m?.componentId ?? K());
    dt({
      stateKey: v,
      options: m,
      initialOptionsPart: l
    });
    const d = r.getState().cogsStateStore[v] || S[v], e = m?.modifyState ? m.modifyState(d) : d, [I, h] = Ot(
      e,
      {
        stateKey: v,
        syncUpdate: m?.syncUpdate,
        componentId: p,
        localStorage: m?.localStorage,
        middleware: m?.middleware,
        enabledSync: m?.enabledSync,
        reactiveType: m?.reactiveType,
        reactiveDeps: m?.reactiveDeps,
        initState: m?.initState,
        localStorageKey: m?.localStorageKey
      }
    );
    return h;
  };
  function _(v, m) {
    dt({ stateKey: v, options: m, initialOptionsPart: l });
  }
  return { useCogsState: E, setCogsOptions: _ };
}, {
  setUpdaterState: B,
  setState: x,
  getInitialOptions: tt,
  getKeyState: ft,
  getValidationErrors: ht,
  setStateLog: Ct,
  updateInitialStateGlobal: et,
  addValidationError: Tt,
  removeValidationError: R,
  setServerSyncActions: At
} = r.getState(), gt = (t) => {
  if (!t) return null;
  try {
    const o = window.localStorage.getItem(t);
    return o ? JSON.parse(o) : null;
  } catch (o) {
    return console.error("Error loading from localStorage:", o), null;
  }
}, Ft = (t, o, g, S) => {
  if (g.localStorageKey) {
    const l = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[o]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[o]
    }, E = g.initState ? `${S}-${o}-${g.localStorageKey}` : o;
    window.localStorage.setItem(E, JSON.stringify(l));
  }
}, jt = (t, o, g, S, l, E) => {
  const _ = {
    initialState: o,
    updaterState: Z(
      t,
      S,
      l,
      E
    ),
    state: g
  };
  J(() => {
    et(t, _.initialState), B(t, _.updaterState), x(t, _.state);
  });
}, St = (t) => {
  const o = r.getState().stateComponents.get(t);
  if (!o) return;
  const g = /* @__PURE__ */ new Set();
  o.components.forEach((S) => {
    g.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    J(() => {
      g.forEach((S) => S());
    });
  });
}, Jt = (t, o) => {
  const g = r.getState().stateComponents.get(t);
  if (g) {
    const S = `${t}////${o}`, l = g.components.get(S);
    l && l.forceUpdate();
  }
};
function Ot(t, {
  stateKey: o,
  serverSync: g,
  localStorage: S,
  formElements: l,
  middleware: E,
  reactiveDeps: _,
  reactiveType: v,
  componentId: m,
  localStorageKey: p,
  initState: d,
  syncUpdate: e
} = {}) {
  const [I, h] = X({}), { sessionId: F } = Nt();
  let b = !o;
  const [u] = X(o ?? K()), i = r.getState().stateLog[u], G = z(/* @__PURE__ */ new Set()), U = z(m ?? K()), A = z(null);
  A.current = tt(u), Y(() => {
    if (e && e.stateKey === u && e.path?.[0]) {
      x(u, (a) => ({
        ...a,
        [e.path[0]]: e.newValue
      }));
      const c = `${e.stateKey}:${e.path.join(".")}`;
      r.getState().setSyncInfo(c, {
        timeStamp: e.timeStamp,
        userId: e.userId
      });
    }
  }, [e]), Y(() => {
    lt(u, {
      initState: d
    });
    let c = null;
    p && (c = gt(
      F + "-" + u + "-" + p
    ));
    let a = null;
    d?.initialState && (a = d?.initialState, c && c.lastUpdated > (c.lastSyncedWithServer || 0) && (a = c.state), jt(
      u,
      d?.initialState,
      a,
      n,
      U.current,
      F
    ), console.log("newState222", a), St(u), h({}));
  }, [p, ...d?.dependencies || []]), It(() => {
    b && lt(u, {
      serverSync: g,
      formElements: l,
      initState: d,
      localStorage: S,
      middleware: E
    });
    const c = `${u}////${U.current}`, a = r.getState().stateComponents.get(u) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(c, {
      forceUpdate: () => h({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: v ?? ["component", "deps"]
    }), r.getState().stateComponents.set(u, a), h({}), () => {
      const f = `${u}////${U.current}`;
      a && (a.components.delete(f), a.components.size === 0 && r.getState().stateComponents.delete(u));
    };
  }, []);
  const n = (c, a, f, w) => {
    if (Array.isArray(a)) {
      const j = `${u}-${a.join(".")}`;
      G.current.add(j);
    }
    x(u, (j) => {
      const V = ut(c) ? c(j) : c, O = `${u}-${a.join(".")}`;
      if (O) {
        let P = !1, y = r.getState().signalDomElements.get(O);
        if ((!y || y.size === 0) && (f.updateType === "insert" || f.updateType === "cut")) {
          const N = a.slice(0, -1), T = L(V, N);
          if (Array.isArray(T)) {
            P = !0;
            const $ = `${u}-${N.join(".")}`;
            y = r.getState().signalDomElements.get($);
          }
        }
        if (y) {
          const N = P ? L(V, a.slice(0, -1)) : L(V, a);
          y.forEach(({ parentId: T, position: $, effect: D }) => {
            const M = document.querySelector(
              `[data-parent-id="${T}"]`
            );
            if (M) {
              const at = Array.from(M.childNodes);
              if (at[$]) {
                const vt = D ? new Function("state", `return (${D})(state)`)(N) : N;
                at[$].textContent = String(vt);
              }
            }
          });
        }
      }
      f.updateType === "update" && (w || A.current?.validationKey) && a && R(
        (w || A.current?.validationKey) + "." + a.join(".")
      );
      const C = a.slice(0, a.length - 1);
      f.updateType === "cut" && A.current?.validationKey && R(
        A.current?.validationKey + "." + C.join(".")
      ), f.updateType === "insert" && A.current?.validationKey && ht(
        A.current?.validationKey + "." + C.join(".")
      ).filter(([y, N]) => {
        let T = y?.split(".").length;
        if (y == C.join(".") && T == C.length - 1) {
          let $ = y + "." + C;
          R(y), Tt($, N);
        }
      });
      const W = L(j, a), mt = L(V, a), yt = f.updateType === "update" ? a.join(".") : [...a].slice(0, -1).join("."), nt = r.getState().stateComponents.get(u);
      if (nt)
        for (const [P, y] of nt.components.entries()) {
          let N = !1;
          const T = Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"];
          if (!T.includes("none")) {
            if (T.includes("all")) {
              y.forceUpdate();
              continue;
            }
            if (T.includes("component") && y.paths && (y.paths.has(yt) || y.paths.has("")) && (N = !0), !N && T.includes("deps") && y.depsFunction) {
              const $ = y.depsFunction(V);
              typeof $ == "boolean" ? $ && (N = !0) : k(y.deps, $) || (y.deps = $, N = !0);
            }
            N && y.forceUpdate();
          }
        }
      const rt = {
        timeStamp: Date.now(),
        stateKey: u,
        path: a,
        updateType: f.updateType,
        status: "new",
        oldValue: W,
        newValue: mt
      };
      if (Ct(u, (P) => {
        const N = [...P ?? [], rt].reduce((T, $) => {
          const D = `${$.stateKey}:${JSON.stringify($.path)}`, M = T.get(D);
          return M ? (M.timeStamp = Math.max(M.timeStamp, $.timeStamp), M.newValue = $.newValue, M.oldValue = M.oldValue ?? $.oldValue, M.updateType = $.updateType) : T.set(D, { ...$ }), T;
        }, /* @__PURE__ */ new Map());
        return Array.from(N.values());
      }), Ft(
        V,
        u,
        A.current,
        F
      ), E && E({
        updateLog: i,
        update: rt
      }), A.current?.serverSync) {
        const P = r.getState().serverState[u], y = A.current?.serverSync;
        At(u, {
          syncKey: typeof y.syncKey == "string" ? y.syncKey : y.syncKey({ state: V }),
          rollBackState: P,
          actionTimeStamp: Date.now() + (y.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return V;
    });
  };
  r.getState().updaterState[u] || (B(
    u,
    Z(
      u,
      n,
      U.current,
      F
    )
  ), r.getState().cogsStateStore[u] || x(u, t), r.getState().initialStateGlobal[u] || et(u, t));
  const s = Et(() => Z(
    u,
    n,
    U.current,
    F
  ), [u]);
  return [ft(u), s];
}
function Z(t, o, g, S) {
  const l = /* @__PURE__ */ new Map();
  let E = 0;
  const _ = (d) => {
    const e = d.join(".");
    for (const [I] of l)
      (I === e || I.startsWith(e + ".")) && l.delete(I);
    E++;
  }, v = /* @__PURE__ */ new Map(), m = {
    removeValidation: (d) => {
      d?.validationKey && R(d.validationKey);
    },
    revertToInitialState: (d) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && R(e?.key), d?.validationKey && R(d.validationKey);
      const I = r.getState().initialStateGlobal[t];
      l.clear(), E++;
      const h = p(I, []);
      J(() => {
        B(t, h), x(t, I);
        const F = r.getState().stateComponents.get(t);
        F && F.components.forEach((u) => {
          u.forceUpdate();
        });
        const b = tt(t);
        b?.localStorageKey && localStorage.removeItem(
          b?.initState ? S + "-" + t + "-" + b?.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (d) => {
      l.clear(), E++;
      const e = Z(
        t,
        o,
        g,
        S
      );
      return J(() => {
        et(t, d), B(t, e), x(t, d);
        const I = r.getState().stateComponents.get(t);
        I && I.components.forEach((h) => {
          h.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (I) => e.get()[I]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const d = r.getState().serverState[t];
      return !!(d && k(d, ft(t)));
    }
  };
  function p(d, e = [], I) {
    const h = e.map(String).join(".");
    l.get(h);
    const F = {
      get(u, i) {
        if (i !== "then" && !i.startsWith("$") && i !== "stateMapNoRender") {
          const n = e.join("."), s = `${t}////${g}`, c = r.getState().stateComponents.get(t);
          if (c) {
            const a = c.components.get(s);
            a && (e.length > 0 || i === "get") && a.paths.add(n);
          }
        }
        if (i === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(t)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(n.key + "." + e.join("."));
          };
        if (Array.isArray(d)) {
          if (i === "getSelected")
            return () => {
              const n = v.get(e.join("."));
              if (n !== void 0)
                return p(
                  d[n],
                  [...e, n.toString()],
                  I
                );
            };
          if (i === "stateMap" || i === "stateMapNoRender")
            return (n) => {
              const s = I?.filtered?.some(
                (a) => a.join(".") === e.join(".")
              ), c = s ? d : r.getState().getNestedState(t, e);
              return i !== "stateMapNoRender" && (l.clear(), E++), c.map((a, f) => {
                const w = s && a.__origIndex ? a.__origIndex : f, j = p(
                  a,
                  [...e, w.toString()],
                  I
                );
                return n(
                  a,
                  j,
                  f,
                  d,
                  p(d, e, I)
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
              rebuildStateShape: p
            });
          if (i === "stateFlattenOn")
            return (n) => {
              const c = I?.filtered?.some(
                (f) => f.join(".") === e.join(".")
              ) ? d : r.getState().getNestedState(t, e);
              l.clear(), E++;
              const a = c.flatMap(
                (f, w) => f[n] ?? []
              );
              return p(
                a,
                [...e, "[*]", n],
                I
              );
            };
          if (i === "findWith")
            return (n, s) => {
              const c = d.findIndex(
                (w) => w[n] === s
              );
              if (c === -1) return;
              const a = d[c], f = [...e, c.toString()];
              return l.clear(), E++, l.clear(), E++, p(a, f);
            };
          if (i === "index")
            return (n) => {
              const s = d[n];
              return p(s, [...e, n.toString()]);
            };
          if (i === "insert")
            return (n) => (_(e), it(o, n, e, t), p(
              r.getState().cogsStateStore[t],
              []
            ));
          if (i === "uniqueInsert")
            return (n, s, c) => {
              const a = r.getState().getNestedState(t, e), f = ut(n) ? n(a) : n;
              let w = null;
              if (!a.some((V) => {
                if (s) {
                  const C = s.every(
                    (W) => k(V[W], f[W])
                  );
                  return C && (w = V), C;
                }
                const O = k(V, f);
                return O && (w = V), O;
              }))
                _(e), it(o, f, e, t);
              else if (c && w) {
                const V = c(w), O = a.map(
                  (C) => k(C, w) ? V : C
                );
                _(e), q(o, O, e);
              }
            };
          if (i === "cut")
            return (n, s) => {
              s?.waitForSync || (_(e), st(o, e, t, n));
            };
          if (i === "stateFilter")
            return (n) => {
              const s = d.map((f, w) => ({
                ...f,
                __origIndex: w.toString()
              })), c = [], a = [];
              for (let f = 0; f < s.length; f++)
                n(s[f], f) && (c.push(f), a.push(s[f]));
              return l.clear(), E++, p(a, e, {
                filtered: [...I?.filtered || [], e],
                validIndices: c
                // Pass through the meta
              });
            };
        }
        const G = e[e.length - 1];
        if (!isNaN(Number(G))) {
          const n = e.slice(0, -1), s = r.getState().getNestedState(t, n);
          if (Array.isArray(s) && i === "cut")
            return () => st(
              o,
              n,
              t,
              Number(G)
            );
        }
        if (i === "get")
          return () => r.getState().getNestedState(t, e);
        if (i === "$derive")
          return (n) => Q({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (i === "$derive")
          return (n) => Q({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (i === "$get")
          return () => Q({
            _stateKey: t,
            _path: e
          });
        if (i === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (i === "_selected") {
          const n = e.slice(0, -1), s = n.join("."), c = r.getState().getNestedState(t, n);
          return Array.isArray(c) ? Number(e[e.length - 1]) === v.get(s) : void 0;
        }
        if (i == "getLocalStorage")
          return (n) => gt(S + "-" + t + "-" + n);
        if (i === "setSelected")
          return (n) => {
            const s = e.slice(0, -1), c = Number(e[e.length - 1]), a = s.join(".");
            n ? v.set(a, c) : v.delete(a);
            const f = r.getState().getNestedState(t, [...s]);
            q(o, f, s), _(s);
          };
        if (e.length == 0) {
          if (i === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(t)?.validation, s = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              R(n.key);
              const c = r.getState().cogsStateStore[t];
              try {
                const a = r.getState().getValidationErrors(n.key);
                a && a.length > 0 && a.forEach(([w]) => {
                  w && w.startsWith(n.key) && R(w);
                });
                const f = n.zodSchema.safeParse(c);
                return f.success ? !0 : (f.error.errors.forEach((j) => {
                  const V = j.path, O = j.message, C = [n.key, ...V].join(".");
                  s(C, O), console.log(
                    `Validation error at ${C}: ${O}`
                  );
                }), St(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (i === "_componentId") return g;
          if (i === "getComponents")
            return () => r().stateComponents.get(t);
          if (i === "getAllFormRefs")
            return () => ct.getState().getFormRefsByStateKey(t);
          if (i === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (i === "_serverState")
            return r.getState().serverState[t];
          if (i === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (i === "revertToInitialState")
            return m.revertToInitialState;
          if (i === "updateInitialState") return m.updateInitialState;
          if (i === "removeValidation") return m.removeValidation;
        }
        if (i === "getFormRef")
          return () => ct.getState().getFormRef(t + "." + e.join("."));
        if (i === "validationWrapper")
          return ({
            children: n,
            hideMessage: s
          }) => /* @__PURE__ */ ot(
            $t,
            {
              formOpts: s ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: I?.validIndices,
              children: n
            }
          );
        if (i === "_stateKey") return t;
        if (i === "_path") return e;
        if (i === "_isServerSynced") return m._isServerSynced;
        if (i === "update")
          return (n, s) => {
            if (s?.debounce)
              wt(() => {
                q(o, n, e, "");
                const c = r.getState().getNestedState(t, e);
                s?.afterUpdate && s.afterUpdate(c);
              }, s.debounce);
            else {
              q(o, n, e, "");
              const c = r.getState().getNestedState(t, e);
              s?.afterUpdate && s.afterUpdate(c);
            }
            _(e);
          };
        if (i === "formElement")
          return (n, s) => /* @__PURE__ */ ot(
            Vt,
            {
              setState: o,
              stateKey: t,
              path: e,
              child: n,
              formOpts: s
            }
          );
        const U = [...e, i], A = r.getState().getNestedState(t, U);
        return p(A, U, I);
      }
    }, b = new Proxy(m, F);
    return l.set(h, {
      proxy: b,
      stateVersion: E
    }), b;
  }
  return p(
    r.getState().getNestedState(t, [])
  );
}
function Q(t) {
  return H(bt, { proxy: t });
}
function Mt({
  proxy: t,
  rebuildStateShape: o
}) {
  const g = r().getNestedState(t._stateKey, t._path);
  return console.log("value", g), Array.isArray(g) ? o(
    g,
    t._path
  ).stateMapNoRender(
    (l, E, _, v, m) => t._mapFn(l, E, _, v, m)
  ) : null;
}
function bt({
  proxy: t
}) {
  const o = z(null), g = `${t._stateKey}-${t._path.join(".")}`;
  return Y(() => {
    const S = o.current;
    if (!S || !S.parentElement) return;
    const l = S.parentElement, _ = Array.from(l.childNodes).indexOf(S);
    let v = l.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, l.setAttribute("data-parent-id", v));
    const p = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: _,
      effect: t._effect
    };
    r.getState().addSignalElement(g, p);
    const d = r.getState().getNestedState(t._stateKey, t._path);
    let e;
    if (t._effect)
      try {
        e = new Function(
          "state",
          `return (${t._effect})(state)`
        )(d);
      } catch (h) {
        console.error("Error evaluating effect function during mount:", h), e = d;
      }
    else
      e = d;
    e !== null && typeof e == "object" && (e = JSON.stringify(e));
    const I = document.createTextNode(String(e));
    S.replaceWith(I);
  }, [t._stateKey, t._path.join("."), t._effect]), H("span", {
    ref: o,
    style: { display: "none" },
    "data-signal-id": g
  });
}
function Bt(t) {
  const o = _t(
    (g) => {
      const S = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return S.components.set(t._stateKey, {
        forceUpdate: g,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => S.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return H("text", {}, String(o));
}
export {
  Q as $cogsSignal,
  Bt as $cogsSignalStore,
  qt as addStateOptions,
  zt as createCogsState,
  Jt as notifyComponent,
  Ot as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
