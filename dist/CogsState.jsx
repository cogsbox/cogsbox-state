"use client";
import { jsx as at } from "react/jsx-runtime";
import { useState as Y, useRef as z, useEffect as K, useLayoutEffect as vt, useMemo as It, createElement as H, useSyncExternalStore as Et, startTransition as J } from "react";
import { transformStateFunc as _t, isFunction as ut, getNestedValue as L, isDeepEqual as k, debounce as pt } from "./utility.js";
import { pushFunc as it, updateFn as q, cutFunc as st, ValidationWrapper as wt, FormControlComponent as $t } from "./Functions.jsx";
import "zod";
import { getGlobalStore as o, formRefStore as ct } from "./store.js";
import { useCogsConfig as Vt } from "./CogsStateClient.jsx";
import tt from "./node_modules/uuid/dist/esm-browser/v4.js";
function lt(t, a) {
  const g = o.getState().getInitialOptions, S = o.getState().setInitialStateOptions, l = g(t) || {};
  S(t, {
    ...l,
    ...a
  });
}
function dt({
  stateKey: t,
  options: a,
  initialOptionsPart: g
}) {
  const S = et(t) || {}, l = g[t] || {}, E = o.getState().setInitialStateOptions, _ = { ...l, ...S };
  let v = !1;
  if (a)
    for (const m in a)
      _.hasOwnProperty(m) || (v = !0, _[m] = a[m]);
  v && E(t, _);
}
function qt(t, { formElements: a, validation: g }) {
  return { initialState: t, formElements: a, validation: g };
}
const zt = (t, a) => {
  let g = t;
  const [S, l] = _t(g);
  (a?.formElements || a?.validation) && Object.keys(l).forEach((v) => {
    l[v] = l[v] || {}, l[v].formElements = {
      ...a.formElements,
      // Global defaults first
      ...a?.validation,
      ...l[v].formElements || {}
      // State-specific overrides
    };
  }), o.getState().setInitialStates(S);
  const E = (v, m) => {
    const [p] = Y(m?.componentId ?? tt());
    dt({
      stateKey: v,
      options: m,
      initialOptionsPart: l
    });
    const d = o.getState().cogsStateStore[v] || S[v], e = m?.modifyState ? m.modifyState(d) : d, [I, h] = Mt(
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
  getInitialOptions: et,
  getKeyState: ft,
  getValidationErrors: Nt,
  setStateLog: ht,
  updateInitialStateGlobal: nt,
  addValidationError: Ct,
  removeValidationError: R,
  setServerSyncActions: Tt
} = o.getState(), gt = (t) => {
  if (!t) return null;
  try {
    const a = window.localStorage.getItem(t);
    return a ? JSON.parse(a) : null;
  } catch (a) {
    return console.error("Error loading from localStorage:", a), null;
  }
}, At = (t, a, g, S) => {
  if (g.localStorageKey) {
    const l = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: o.getState().serverSyncLog[a]?.[0]?.timeStamp,
      baseServerState: o.getState().serverState[a]
    }, E = g.initState ? `${S}-${a}-${g.localStorageKey}` : a;
    window.localStorage.setItem(E, JSON.stringify(l));
  }
}, Ft = (t, a, g, S, l, E) => {
  const _ = {
    initialState: a,
    updaterState: Z(
      t,
      S,
      l,
      E
    ),
    state: g
  };
  J(() => {
    nt(t, _.initialState), B(t, _.updaterState), x(t, _.state);
  });
}, jt = (t) => {
  const a = o.getState().stateComponents.get(t);
  if (!a) return;
  const g = /* @__PURE__ */ new Set();
  a.components.forEach((S) => {
    g.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    J(() => {
      g.forEach((S) => S());
    });
  });
}, Jt = (t, a) => {
  const g = o.getState().stateComponents.get(t);
  if (g) {
    const S = `${t}////${a}`, l = g.components.get(S);
    l && l.forceUpdate();
  }
};
function Mt(t, {
  stateKey: a,
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
  const [I, h] = Y({}), { sessionId: F } = Vt();
  let b = !a;
  const [u] = Y(a ?? tt()), i = o.getState().stateLog[u], G = z(/* @__PURE__ */ new Set()), U = z(m ?? tt()), A = z(null);
  A.current = et(u), K(() => {
    if (e && e.stateKey === u && e.path?.[0]) {
      x(u, (r) => ({
        ...r,
        [e.path[0]]: e.newValue
      }));
      const c = `${e.stateKey}:${e.path.join(".")}`;
      o.getState().setSyncInfo(c, {
        timeStamp: e.timeStamp,
        userId: e.userId
      });
    }
  }, [e]), K(() => {
    lt(u, {
      initState: d
    });
    let c = null;
    p && (c = gt(
      F + "-" + u + "-" + p
    ));
    let r = null;
    d?.initialState && (r = d?.initialState, console.log("newState", r), c && c.lastUpdated > (c.lastSyncedWithServer || 0) && (r = c.state), Ft(
      u,
      d?.initialState,
      r,
      n,
      U.current,
      F
    ), console.log("newState222", r), h({}));
  }, [p, ...d?.dependencies || []]), vt(() => {
    b && lt(u, {
      serverSync: g,
      formElements: l,
      initState: d,
      localStorage: S,
      middleware: E
    });
    const c = `${u}////${U.current}`, r = o.getState().stateComponents.get(u) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(c, {
      forceUpdate: () => h({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: v ?? ["component", "deps"]
    }), o.getState().stateComponents.set(u, r), h({}), () => {
      const f = `${u}////${U.current}`;
      r && (r.components.delete(f), r.components.size === 0 && o.getState().stateComponents.delete(u));
    };
  }, []);
  const n = (c, r, f, w) => {
    if (Array.isArray(r)) {
      const j = `${u}-${r.join(".")}`;
      G.current.add(j);
    }
    x(u, (j) => {
      const V = ut(c) ? c(j) : c, M = `${u}-${r.join(".")}`;
      if (M) {
        let P = !1, y = o.getState().signalDomElements.get(M);
        if ((!y || y.size === 0) && (f.updateType === "insert" || f.updateType === "cut")) {
          const N = r.slice(0, -1), T = L(V, N);
          if (Array.isArray(T)) {
            P = !0;
            const $ = `${u}-${N.join(".")}`;
            y = o.getState().signalDomElements.get($);
          }
        }
        if (y) {
          const N = P ? L(V, r.slice(0, -1)) : L(V, r);
          y.forEach(({ parentId: T, position: $, effect: D }) => {
            const O = document.querySelector(
              `[data-parent-id="${T}"]`
            );
            if (O) {
              const ot = Array.from(O.childNodes);
              if (ot[$]) {
                const yt = D ? new Function("state", `return (${D})(state)`)(N) : N;
                ot[$].textContent = String(yt);
              }
            }
          });
        }
      }
      f.updateType === "update" && (w || A.current?.validationKey) && r && R(
        (w || A.current?.validationKey) + "." + r.join(".")
      );
      const C = r.slice(0, r.length - 1);
      f.updateType === "cut" && A.current?.validationKey && R(
        A.current?.validationKey + "." + C.join(".")
      ), f.updateType === "insert" && A.current?.validationKey && Nt(
        A.current?.validationKey + "." + C.join(".")
      ).filter(([y, N]) => {
        let T = y?.split(".").length;
        if (y == C.join(".") && T == C.length - 1) {
          let $ = y + "." + C;
          R(y), Ct($, N);
        }
      });
      const W = L(j, r), St = L(V, r), mt = f.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), Q = o.getState().stateComponents.get(u);
      if (a == "cart" && (console.log("thisKey", u), console.log("stateEntry", Q)), Q)
        for (const [P, y] of Q.components.entries()) {
          let N = !1;
          const T = Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"];
          if (!T.includes("none")) {
            if (T.includes("all")) {
              y.forceUpdate();
              continue;
            }
            if (T.includes("component") && y.paths && (y.paths.has(mt) || y.paths.has("")) && (N = !0), !N && T.includes("deps") && y.depsFunction) {
              const $ = y.depsFunction(V);
              typeof $ == "boolean" ? $ && (N = !0) : k(y.deps, $) || (y.deps = $, N = !0);
            }
            N && y.forceUpdate();
          }
        }
      const rt = {
        timeStamp: Date.now(),
        stateKey: u,
        path: r,
        updateType: f.updateType,
        status: "new",
        oldValue: W,
        newValue: St
      };
      if (ht(u, (P) => {
        const N = [...P ?? [], rt].reduce((T, $) => {
          const D = `${$.stateKey}:${JSON.stringify($.path)}`, O = T.get(D);
          return O ? (O.timeStamp = Math.max(O.timeStamp, $.timeStamp), O.newValue = $.newValue, O.oldValue = O.oldValue ?? $.oldValue, O.updateType = $.updateType) : T.set(D, { ...$ }), T;
        }, /* @__PURE__ */ new Map());
        return Array.from(N.values());
      }), At(
        V,
        u,
        A.current,
        F
      ), E && E({
        updateLog: i,
        update: rt
      }), A.current?.serverSync) {
        const P = o.getState().serverState[u], y = A.current?.serverSync;
        Tt(u, {
          syncKey: typeof y.syncKey == "string" ? y.syncKey : y.syncKey({ state: V }),
          rollBackState: P,
          actionTimeStamp: Date.now() + (y.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return V;
    });
  };
  o.getState().updaterState[u] || (console.log("Initializing state for", u, t), B(
    u,
    Z(
      u,
      n,
      U.current,
      F
    )
  ), o.getState().cogsStateStore[u] || x(u, t), o.getState().initialStateGlobal[u] || nt(u, t));
  const s = It(() => Z(
    u,
    n,
    U.current,
    F
  ), [u]);
  return [ft(u), s];
}
function Z(t, a, g, S) {
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
      const e = o.getState().getInitialOptions(t)?.validation;
      e?.key && R(e?.key), d?.validationKey && R(d.validationKey);
      const I = o.getState().initialStateGlobal[t];
      l.clear(), E++;
      const h = p(I, []);
      J(() => {
        B(t, h), x(t, I);
        const F = o.getState().stateComponents.get(t);
        F && F.components.forEach((u) => {
          u.forceUpdate();
        });
        const b = et(t);
        b?.localStorageKey && localStorage.removeItem(
          b?.initState ? S + "-" + t + "-" + b?.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (d) => {
      l.clear(), E++;
      const e = Z(
        t,
        a,
        g,
        S
      );
      return J(() => {
        nt(t, d), B(t, e), x(t, d);
        const I = o.getState().stateComponents.get(t);
        I && I.components.forEach((h) => {
          h.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (I) => e.get()[I]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const d = o.getState().serverState[t];
      return !!(d && k(d, ft(t)));
    }
  };
  function p(d, e = [], I) {
    const h = e.map(String).join(".");
    l.get(h);
    const F = {
      get(u, i) {
        if (i !== "then" && !i.startsWith("$") && i !== "stateMapNoRender") {
          const n = e.join("."), s = `${t}////${g}`, c = o.getState().stateComponents.get(t);
          if (c) {
            const r = c.components.get(s);
            r && (e.length > 0 || i === "get") && r.paths.add(n);
          }
        }
        if (i === "showValidationErrors")
          return () => {
            const n = o.getState().getInitialOptions(t)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(n.key + "." + e.join("."));
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
                (r) => r.join(".") === e.join(".")
              ), c = s ? d : o.getState().getNestedState(t, e);
              return i !== "stateMapNoRender" && (l.clear(), E++), c.map((r, f) => {
                const w = s && r.__origIndex ? r.__origIndex : f, j = p(
                  r,
                  [...e, w.toString()],
                  I
                );
                return n(
                  r,
                  j,
                  f,
                  d,
                  p(d, e, I)
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
              const c = I?.filtered?.some(
                (f) => f.join(".") === e.join(".")
              ) ? d : o.getState().getNestedState(t, e);
              l.clear(), E++;
              const r = c.flatMap(
                (f, w) => f[n] ?? []
              );
              return p(
                r,
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
              const r = d[c], f = [...e, c.toString()];
              return l.clear(), E++, l.clear(), E++, p(r, f);
            };
          if (i === "index")
            return (n) => {
              const s = d[n];
              return p(s, [...e, n.toString()]);
            };
          if (i === "insert")
            return (n) => (_(e), it(a, n, e, t), p(
              o.getState().cogsStateStore[t],
              []
            ));
          if (i === "uniqueInsert")
            return (n, s, c) => {
              const r = o.getState().getNestedState(t, e), f = ut(n) ? n(r) : n;
              let w = null;
              if (!r.some((V) => {
                if (s) {
                  const C = s.every(
                    (W) => k(V[W], f[W])
                  );
                  return C && (w = V), C;
                }
                const M = k(V, f);
                return M && (w = V), M;
              }))
                _(e), it(a, f, e, t);
              else if (c && w) {
                const V = c(w), M = r.map(
                  (C) => k(C, w) ? V : C
                );
                _(e), q(a, M, e);
              }
            };
          if (i === "cut")
            return (n, s) => {
              s?.waitForSync || (_(e), st(a, e, t, n));
            };
          if (i === "stateFilter")
            return (n) => {
              const s = d.map((f, w) => ({
                ...f,
                __origIndex: w.toString()
              })), c = [], r = [];
              for (let f = 0; f < s.length; f++)
                n(s[f], f) && (c.push(f), r.push(s[f]));
              return l.clear(), E++, p(r, e, {
                filtered: [...I?.filtered || [], e],
                validIndices: c
                // Pass through the meta
              });
            };
        }
        const G = e[e.length - 1];
        if (!isNaN(Number(G))) {
          const n = e.slice(0, -1), s = o.getState().getNestedState(t, n);
          if (Array.isArray(s) && i === "cut")
            return () => st(
              a,
              n,
              t,
              Number(G)
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
          const n = e.slice(0, -1), s = n.join("."), c = o.getState().getNestedState(t, n);
          return Array.isArray(c) ? Number(e[e.length - 1]) === v.get(s) : void 0;
        }
        if (i == "getLocalStorage")
          return (n) => gt(S + "-" + t + "-" + n);
        if (i === "setSelected")
          return (n) => {
            const s = e.slice(0, -1), c = Number(e[e.length - 1]), r = s.join(".");
            n ? v.set(r, c) : v.delete(r);
            const f = o.getState().getNestedState(t, [...s]);
            q(a, f, s), _(s);
          };
        if (e.length == 0) {
          if (i === "validateZodSchema")
            return () => {
              const n = o.getState().getInitialOptions(t)?.validation, s = o.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              R(n.key);
              const c = o.getState().cogsStateStore[t];
              try {
                const r = o.getState().getValidationErrors(n.key);
                r && r.length > 0 && r.forEach(([w]) => {
                  w && w.startsWith(n.key) && R(w);
                });
                const f = n.zodSchema.safeParse(c);
                return f.success ? !0 : (f.error.errors.forEach((j) => {
                  const V = j.path, M = j.message, C = [n.key, ...V].join(".");
                  s(C, M), console.log(
                    `Validation error at ${C}: ${M}`
                  );
                }), jt(t), !1);
              } catch (r) {
                return console.error("Zod schema validation failed", r), !1;
              }
            };
          if (i === "_componentId") return g;
          if (i === "getComponents")
            return () => o().stateComponents.get(t);
          if (i === "getAllFormRefs")
            return () => ct.getState().getFormRefsByStateKey(t);
          if (i === "_initialState")
            return o.getState().initialStateGlobal[t];
          if (i === "_serverState")
            return o.getState().serverState[t];
          if (i === "_isLoading")
            return o.getState().isLoadingGlobal[t];
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
          }) => /* @__PURE__ */ at(
            wt,
            {
              formOpts: s ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
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
              pt(() => {
                q(a, n, e, "");
                const c = o.getState().getNestedState(t, e);
                s?.afterUpdate && s.afterUpdate(c);
              }, s.debounce);
            else {
              q(a, n, e, "");
              const c = o.getState().getNestedState(t, e);
              s?.afterUpdate && s.afterUpdate(c);
            }
            _(e);
          };
        if (i === "formElement")
          return (n, s) => /* @__PURE__ */ at(
            $t,
            {
              setState: a,
              stateKey: t,
              path: e,
              child: n,
              formOpts: s
            }
          );
        const U = [...e, i], A = o.getState().getNestedState(t, U);
        return p(A, U, I);
      }
    }, b = new Proxy(m, F);
    return l.set(h, {
      proxy: b,
      stateVersion: E
    }), b;
  }
  return p(
    o.getState().getNestedState(t, [])
  );
}
function X(t) {
  return H(bt, { proxy: t });
}
function Ot({
  proxy: t,
  rebuildStateShape: a
}) {
  const g = o().getNestedState(t._stateKey, t._path);
  return console.log("value", g), Array.isArray(g) ? a(
    g,
    t._path
  ).stateMapNoRender(
    (l, E, _, v, m) => t._mapFn(l, E, _, v, m)
  ) : null;
}
function bt({
  proxy: t
}) {
  const a = z(null), g = `${t._stateKey}-${t._path.join(".")}`;
  return K(() => {
    const S = a.current;
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
    o.getState().addSignalElement(g, p);
    const d = o.getState().getNestedState(t._stateKey, t._path);
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
    ref: a,
    style: { display: "none" },
    "data-signal-id": g
  });
}
function Bt(t) {
  const a = Et(
    (g) => {
      const S = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return S.components.set(t._stateKey, {
        forceUpdate: g,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => S.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return H("text", {}, String(a));
}
export {
  X as $cogsSignal,
  Bt as $cogsSignalStore,
  qt as addStateOptions,
  zt as createCogsState,
  Jt as notifyComponent,
  Mt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
