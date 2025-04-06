"use client";
import { jsx as ot } from "react/jsx-runtime";
import { useState as Y, useRef as z, useEffect as K, useLayoutEffect as vt, useMemo as It, createElement as H, useSyncExternalStore as Et, startTransition as J } from "react";
import { transformStateFunc as _t, isFunction as ut, getNestedValue as D, isDeepEqual as L, debounce as pt } from "./utility.js";
import { pushFunc as it, updateFn as q, cutFunc as st, ValidationWrapper as wt, FormControlComponent as $t } from "./Functions.jsx";
import "zod";
import { getGlobalStore as a, formRefStore as ct } from "./store.js";
import { useCogsConfig as Vt } from "./CogsStateClient.jsx";
import tt from "./node_modules/uuid/dist/esm-browser/v4.js";
function lt(t, o) {
  const g = a.getState().getInitialOptions, S = a.getState().setInitialStateOptions, l = g(t) || {};
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
  const S = et(t) || {}, l = g[t] || {}, E = a.getState().setInitialStateOptions, _ = { ...l, ...S };
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
  const [S, l] = _t(g);
  (o?.formElements || o?.validation) && Object.keys(l).forEach((v) => {
    l[v] = l[v] || {}, l[v].formElements = {
      ...o.formElements,
      // Global defaults first
      ...o?.validation,
      ...l[v].formElements || {}
      // State-specific overrides
    };
  }), a.getState().setInitialStates(S);
  const E = (v, m) => {
    const [p] = Y(m?.componentId ?? tt());
    dt({
      stateKey: v,
      options: m,
      initialOptionsPart: l
    });
    const d = a.getState().cogsStateStore[v] || S[v], e = m?.modifyState ? m.modifyState(d) : d, [I, h] = jt(
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
} = a.getState(), gt = (t) => {
  if (!t) return null;
  try {
    const o = window.localStorage.getItem(t);
    return o ? JSON.parse(o) : null;
  } catch (o) {
    return console.error("Error loading from localStorage:", o), null;
  }
}, At = (t, o, g, S) => {
  if (g.localStorageKey) {
    const l = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: a.getState().serverSyncLog[o]?.[0]?.timeStamp,
      baseServerState: a.getState().serverState[o]
    }, E = g.initState ? `${S}-${o}-${g.localStorageKey}` : o;
    window.localStorage.setItem(E, JSON.stringify(l));
  }
}, Ft = (t, o, g, S, l, E) => {
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
    nt(t, _.initialState), B(t, _.updaterState), x(t, _.state);
  });
}, Mt = (t) => {
  const o = a.getState().stateComponents.get(t);
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
  const g = a.getState().stateComponents.get(t);
  if (g) {
    const S = `${t}////${o}`, l = g.components.get(S);
    l && l.forceUpdate();
  }
};
function jt(t, {
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
  const [I, h] = Y({}), { sessionId: F } = Vt();
  let b = !o;
  const [u] = Y(o ?? tt()), i = a.getState().stateLog[u], G = z(/* @__PURE__ */ new Set()), U = z(m ?? tt()), A = z(null);
  A.current = et(u), K(() => {
    if (e && e.stateKey === u && e.path?.[0]) {
      x(u, (r) => ({
        ...r,
        [e.path[0]]: e.newValue
      }));
      const c = `${e.stateKey}:${e.path.join(".")}`;
      a.getState().setSyncInfo(c, {
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
    ), console.log("newState222", r), queueMicrotask(() => {
      h({});
    }));
  }, [p, ...d?.dependencies || []]), vt(() => {
    b && lt(u, {
      serverSync: g,
      formElements: l,
      initState: d,
      localStorage: S,
      middleware: E
    });
    const c = `${u}////${U.current}`, r = a.getState().stateComponents.get(u) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(c, {
      forceUpdate: () => h({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: v ?? ["component", "deps"]
    }), a.getState().stateComponents.set(u, r), h({}), () => {
      const f = `${u}////${U.current}`;
      r && (r.components.delete(f), r.components.size === 0 && a.getState().stateComponents.delete(u));
    };
  }, []);
  const n = (c, r, f, w) => {
    if (Array.isArray(r)) {
      const M = `${u}-${r.join(".")}`;
      G.current.add(M);
    }
    x(u, (M) => {
      const V = ut(c) ? c(M) : c, j = `${u}-${r.join(".")}`;
      if (j) {
        let P = !1, y = a.getState().signalDomElements.get(j);
        if ((!y || y.size === 0) && (f.updateType === "insert" || f.updateType === "cut")) {
          const N = r.slice(0, -1), T = D(V, N);
          if (Array.isArray(T)) {
            P = !0;
            const $ = `${u}-${N.join(".")}`;
            y = a.getState().signalDomElements.get($);
          }
        }
        if (y) {
          const N = P ? D(V, r.slice(0, -1)) : D(V, r);
          y.forEach(({ parentId: T, position: $, effect: k }) => {
            const O = document.querySelector(
              `[data-parent-id="${T}"]`
            );
            if (O) {
              const at = Array.from(O.childNodes);
              if (at[$]) {
                const yt = k ? new Function("state", `return (${k})(state)`)(N) : N;
                at[$].textContent = String(yt);
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
      const W = D(M, r), St = D(V, r), mt = f.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), Q = a.getState().stateComponents.get(u);
      if (o == "cart" && (console.log("thisKey", u), console.log("stateEntry", Q)), Q)
        for (const [P, y] of Q.components.entries()) {
          let N = !1;
          const T = Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"];
          if (!T.includes("none")) {
            if (T.includes("all")) {
              queueMicrotask(() => {
                y.forceUpdate();
              });
              continue;
            }
            if (T.includes("component") && y.paths && (y.paths.has(mt) || y.paths.has("")) && (N = !0), !N && T.includes("deps") && y.depsFunction) {
              const $ = y.depsFunction(V);
              typeof $ == "boolean" ? $ && (N = !0) : L(y.deps, $) || (y.deps = $, N = !0);
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
          const k = `${$.stateKey}:${JSON.stringify($.path)}`, O = T.get(k);
          return O ? (O.timeStamp = Math.max(O.timeStamp, $.timeStamp), O.newValue = $.newValue, O.oldValue = O.oldValue ?? $.oldValue, O.updateType = $.updateType) : T.set(k, { ...$ }), T;
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
        const P = a.getState().serverState[u], y = A.current?.serverSync;
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
  a.getState().updaterState[u] || (B(
    u,
    Z(
      u,
      n,
      U.current,
      F
    )
  ), a.getState().cogsStateStore[u] || x(u, t), a.getState().initialStateGlobal[u] || nt(u, t));
  const s = It(() => Z(
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
      const e = a.getState().getInitialOptions(t)?.validation;
      e?.key && R(e?.key), d?.validationKey && R(d.validationKey);
      const I = a.getState().initialStateGlobal[t];
      l.clear(), E++;
      const h = p(I, []);
      J(() => {
        B(t, h), x(t, I);
        const F = a.getState().stateComponents.get(t);
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
        o,
        g,
        S
      );
      return J(() => {
        nt(t, d), B(t, e), x(t, d);
        const I = a.getState().stateComponents.get(t);
        I && I.components.forEach((h) => {
          h.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (I) => e.get()[I]
      };
    },
    _initialState: a.getState().initialStateGlobal[t],
    _serverState: a.getState().serverState[t],
    _isLoading: a.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const d = a.getState().serverState[t];
      return !!(d && L(d, ft(t)));
    }
  };
  function p(d, e = [], I) {
    const h = e.map(String).join(".");
    l.get(h);
    const F = {
      get(u, i) {
        if (i !== "then" && !i.startsWith("$") && i !== "stateMapNoRender") {
          const n = e.join("."), s = `${t}////${g}`, c = a.getState().stateComponents.get(t);
          if (c) {
            const r = c.components.get(s);
            r && (e.length > 0 || i === "get") && r.paths.add(n);
          }
        }
        if (i === "showValidationErrors")
          return () => {
            const n = a.getState().getInitialOptions(t)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return a.getState().getValidationErrors(n.key + "." + e.join("."));
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
              ), c = s ? d : a.getState().getNestedState(t, e);
              return i !== "stateMapNoRender" && (l.clear(), E++), c.map((r, f) => {
                const w = s && r.__origIndex ? r.__origIndex : f, M = p(
                  r,
                  [...e, w.toString()],
                  I
                );
                return n(
                  r,
                  M,
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
              ) ? d : a.getState().getNestedState(t, e);
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
            return (n) => (_(e), it(o, n, e, t), p(
              a.getState().cogsStateStore[t],
              []
            ));
          if (i === "uniqueInsert")
            return (n, s, c) => {
              const r = a.getState().getNestedState(t, e), f = ut(n) ? n(r) : n;
              let w = null;
              if (!r.some((V) => {
                if (s) {
                  const C = s.every(
                    (W) => L(V[W], f[W])
                  );
                  return C && (w = V), C;
                }
                const j = L(V, f);
                return j && (w = V), j;
              }))
                _(e), it(o, f, e, t);
              else if (c && w) {
                const V = c(w), j = r.map(
                  (C) => L(C, w) ? V : C
                );
                _(e), q(o, j, e);
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
          const n = e.slice(0, -1), s = a.getState().getNestedState(t, n);
          if (Array.isArray(s) && i === "cut")
            return () => st(
              o,
              n,
              t,
              Number(G)
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
          const n = e.slice(0, -1), s = n.join("."), c = a.getState().getNestedState(t, n);
          return Array.isArray(c) ? Number(e[e.length - 1]) === v.get(s) : void 0;
        }
        if (i == "getLocalStorage")
          return (n) => gt(S + "-" + t + "-" + n);
        if (i === "setSelected")
          return (n) => {
            const s = e.slice(0, -1), c = Number(e[e.length - 1]), r = s.join(".");
            n ? v.set(r, c) : v.delete(r);
            const f = a.getState().getNestedState(t, [...s]);
            q(o, f, s), _(s);
          };
        if (e.length == 0) {
          if (i === "validateZodSchema")
            return () => {
              const n = a.getState().getInitialOptions(t)?.validation, s = a.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              R(n.key);
              const c = a.getState().cogsStateStore[t];
              try {
                const r = a.getState().getValidationErrors(n.key);
                r && r.length > 0 && r.forEach(([w]) => {
                  w && w.startsWith(n.key) && R(w);
                });
                const f = n.zodSchema.safeParse(c);
                return f.success ? !0 : (f.error.errors.forEach((M) => {
                  const V = M.path, j = M.message, C = [n.key, ...V].join(".");
                  s(C, j), console.log(
                    `Validation error at ${C}: ${j}`
                  );
                }), Mt(t), !1);
              } catch (r) {
                return console.error("Zod schema validation failed", r), !1;
              }
            };
          if (i === "_componentId") return g;
          if (i === "getComponents")
            return () => a().stateComponents.get(t);
          if (i === "getAllFormRefs")
            return () => ct.getState().getFormRefsByStateKey(t);
          if (i === "_initialState")
            return a.getState().initialStateGlobal[t];
          if (i === "_serverState")
            return a.getState().serverState[t];
          if (i === "_isLoading")
            return a.getState().isLoadingGlobal[t];
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
            wt,
            {
              formOpts: s ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: a.getState().getInitialOptions(t)?.validation?.key || "",
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
                q(o, n, e, "");
                const c = a.getState().getNestedState(t, e);
                s?.afterUpdate && s.afterUpdate(c);
              }, s.debounce);
            else {
              q(o, n, e, "");
              const c = a.getState().getNestedState(t, e);
              s?.afterUpdate && s.afterUpdate(c);
            }
            _(e);
          };
        if (i === "formElement")
          return (n, s) => /* @__PURE__ */ ot(
            $t,
            {
              setState: o,
              stateKey: t,
              path: e,
              child: n,
              formOpts: s
            }
          );
        const U = [...e, i], A = a.getState().getNestedState(t, U);
        return p(A, U, I);
      }
    }, b = new Proxy(m, F);
    return l.set(h, {
      proxy: b,
      stateVersion: E
    }), b;
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
  const g = a().getNestedState(t._stateKey, t._path);
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
  return K(() => {
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
    a.getState().addSignalElement(g, p);
    const d = a.getState().getNestedState(t._stateKey, t._path);
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
  const o = Et(
    (g) => {
      const S = a.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return S.components.set(t._stateKey, {
        forceUpdate: g,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => S.components.delete(t._stateKey);
    },
    () => a.getState().getNestedState(t._stateKey, t._path)
  );
  return H("text", {}, String(o));
}
export {
  X as $cogsSignal,
  Bt as $cogsSignalStore,
  qt as addStateOptions,
  zt as createCogsState,
  Jt as notifyComponent,
  jt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
