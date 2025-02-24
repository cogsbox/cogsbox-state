"use client";
import { j as et } from "./node_modules/react/jsx-runtime.jsx";
import { r as w } from "./node_modules/react/index.js";
import { transformStateFunc as ft, isFunction as ot, getNestedValue as G, isDeepEqual as h, debounce as St } from "./utility.js";
import { pushFunc as nt, updateFn as z, cutFunc as rt, ValidationWrapper as gt, FormControlComponent as mt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as a } from "./store.js";
import { useCogsConfig as yt } from "./CogsStateClient.jsx";
import X from "./node_modules/uuid/dist/esm-browser/v4.js";
function bt(t, { formElements: i, zodSchema: g }) {
  return { initialState: t, formElements: i, zodSchema: g };
}
function at(t, i) {
  const g = a.getState().getInitialOptions, S = a.getState().setInitialStateOptions, f = g(t) || {};
  S(t, {
    ...f,
    ...i
  });
}
function it({
  stateKey: t,
  options: i,
  initialOptionsPart: g
}) {
  const S = Y(t) || {}, f = g[t] || {}, _ = a.getState().setInitialStateOptions, v = { ...f, ...S };
  let p = !1;
  if (i)
    for (const y in i)
      v.hasOwnProperty(y) || (p = !0, v[y] = i[y]);
  p && _(t, v);
}
const Ot = (t, i) => {
  let g = t;
  const [S, f] = ft(g);
  a.getState().setInitialStates(S);
  const _ = (p, y) => {
    const [N] = w.useState(X());
    it({ stateKey: p, options: y, initialOptionsPart: f });
    const o = a.getState().cogsStateStore[p] || S[p], e = y?.modifyState ? y.modifyState(o) : o, [I, x] = $t(
      e,
      {
        stateKey: p,
        syncUpdate: y?.syncUpdate,
        componentId: N,
        localStorage: y?.localStorage,
        middleware: y?.middleware,
        enabledSync: y?.enabledSync,
        reactiveType: y?.reactiveType,
        reactiveDeps: y?.reactiveDeps,
        initState: y?.initState
      }
    );
    return x;
  };
  function v(p, y) {
    it({ stateKey: p, options: y, initialOptionsPart: f });
  }
  return { useCogsState: _, setCogsOptions: v };
}, {
  setUpdaterState: J,
  setState: D,
  getInitialOptions: Y,
  getKeyState: st,
  getValidationErrors: vt,
  setStateLog: pt,
  updateInitialStateGlobal: Z,
  addValidationError: It,
  removeValidationError: W,
  setServerSyncActions: _t
} = a.getState(), ct = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Et = (t, i, g, S) => {
  if (g?.initState) {
    const f = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: a.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: a.getState().serverState[i]
    }, _ = g.initState ? `${S}-${i}-${g.initState.localStorageKey}` : i;
    window.localStorage.setItem(_, JSON.stringify(f));
  }
}, wt = (t, i, g, S, f, _) => {
  const v = {
    initialState: i,
    updaterState: B(
      t,
      S,
      f,
      _
    ),
    state: g
  };
  w.startTransition(() => {
    Z(t, v.initialState), J(t, v.updaterState), D(t, v.state);
  });
}, Nt = (t) => {
  const i = a.getState().stateComponents.get(t);
  if (!i) return;
  const g = /* @__PURE__ */ new Set();
  i.components.forEach((S) => {
    g.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    w.startTransition(() => {
      g.forEach((S) => S());
    });
  });
};
function $t(t, {
  stateKey: i,
  serverSync: g,
  zodSchema: S,
  localStorage: f,
  formElements: _,
  middleware: v,
  reactiveDeps: p,
  reactiveType: y,
  componentId: N,
  initState: o,
  syncUpdate: e
} = {}) {
  const [I, x] = w.useState({}), { sessionId: M } = yt();
  let O = !i;
  const [d] = w.useState(i ?? X()), s = a.getState().stateLog[d], q = w.useRef(/* @__PURE__ */ new Set()), U = w.useRef(N ?? X()), C = w.useRef(null);
  C.current = Y(d), w.useEffect(() => {
    if (e && e.stateKey === d && e.path?.[0]) {
      D(d, (r) => ({
        ...r,
        [e.path[0]]: e.newValue
      }));
      const l = `${e.stateKey}:${e.path.join(".")}`;
      a.getState().setSyncInfo(l, {
        timeStamp: e.timeStamp,
        userId: e.userId
      });
    }
  }, [e]), w.useEffect(() => {
    at(d, {
      initState: o
    });
    const l = ct(
      M + "-" + d + "-" + o?.localStorageKey
    );
    let r = null;
    o?.initialState && (r = o?.initialState, l && l.lastUpdated > (l.lastSyncedWithServer || 0) && (r = l.state), wt(
      d,
      o?.initialState,
      r,
      n,
      U.current,
      M
    )), Nt(d);
  }, [o?.localStorageKey, ...o?.dependencies || []]), w.useLayoutEffect(() => {
    O && at(d, {
      serverSync: g,
      formElements: _,
      zodSchema: S,
      initState: o,
      localStorage: f,
      middleware: v
    });
    const l = `${d}////${U.current}`, r = a.getState().stateComponents.get(d) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(l, {
      forceUpdate: () => x({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: p || void 0,
      reactiveType: y ?? ["component", "deps"]
    }), a.getState().stateComponents.set(d, r), () => {
      const u = `${d}////${U.current}`;
      r && (r.components.delete(u), r.components.size === 0 && a.getState().stateComponents.delete(d));
    };
  }, []);
  const n = (l, r, u, $) => {
    if (Array.isArray(r)) {
      const R = `${d}-${r.join(".")}`;
      q.current.add(R);
    }
    D(d, (R) => {
      const T = ot(l) ? l(R) : l, b = `${d}-${r.join(".")}`;
      if (b) {
        let P = !1, m = a.getState().signalDomElements.get(b);
        if ((!m || m.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const V = r.slice(0, -1), A = G(T, V);
          if (Array.isArray(A)) {
            P = !0;
            const E = `${d}-${V.join(".")}`;
            m = a.getState().signalDomElements.get(E);
          }
        }
        if (m) {
          const V = P ? G(T, r.slice(0, -1)) : G(T, r);
          m.forEach(({ parentId: A, position: E, effect: L }) => {
            const j = document.querySelector(
              `[data-parent-id="${A}"]`
            );
            if (j) {
              const tt = Array.from(j.childNodes);
              if (tt[E]) {
                const ut = L ? new Function(
                  "state",
                  `return (${L})(state)`
                )(V) : V;
                tt[E].textContent = String(ut);
              }
            }
          });
        }
      }
      u.updateType === "update" && ($ || C.current?.validationKey) && r && W(
        ($ || C.current?.validationKey) + "." + r.join(".")
      );
      const F = r.slice(0, r.length - 1);
      u.updateType === "cut" && C.current?.validationKey && W(
        C.current?.validationKey + "." + F.join(".")
      ), u.updateType === "insert" && C.current?.validationKey && vt(
        C.current?.validationKey + "." + F.join(".")
      ).filter(([m, V]) => {
        let A = m?.split(".").length;
        if (m == F.join(".") && A == F.length - 1) {
          let E = m + "." + F;
          W(m), It(E, V);
        }
      });
      const k = G(R, r), lt = G(T, r), dt = u.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), H = a.getState().stateComponents.get(d);
      if (i == "products" && (console.log("thisKey", d), console.log("stateEntry", H)), H)
        for (const [
          P,
          m
        ] of H.components.entries()) {
          let V = !1;
          const A = Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"];
          if (!A.includes("none")) {
            if (A.includes("all")) {
              m.forceUpdate();
              continue;
            }
            if (A.includes("component") && m.paths && m.paths.has(dt) && (V = !0), !V && A.includes("deps") && m.depsFunction) {
              const E = m.depsFunction(T);
              typeof E == "boolean" ? E && (V = !0) : h(m.deps, E) || (console.log(
                "reactiveTypes",
                h(m.deps, E),
                E
              ), m.deps = E, V = !0);
            }
            V && m.forceUpdate();
          }
        }
      const K = {
        timeStamp: Date.now(),
        stateKey: d,
        path: r,
        updateType: u.updateType,
        status: "new",
        oldValue: k,
        newValue: lt
      };
      if (pt(d, (P) => {
        const V = [...P ?? [], K].reduce((A, E) => {
          const L = `${E.stateKey}:${JSON.stringify(E.path)}`, j = A.get(L);
          return j ? (j.timeStamp = Math.max(
            j.timeStamp,
            E.timeStamp
          ), j.newValue = E.newValue, j.oldValue = j.oldValue ?? E.oldValue, j.updateType = E.updateType) : A.set(L, { ...E }), A;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), Et(
        T,
        d,
        C.current,
        M
      ), v && v({
        updateLog: s,
        update: K
      }), C.current?.serverSync) {
        const P = a.getState().serverState[d], m = C.current?.serverSync;
        _t(d, {
          syncKey: typeof m.syncKey == "string" ? m.syncKey : m.syncKey({ state: T }),
          rollBackState: P,
          actionTimeStamp: Date.now() + (m.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  a.getState().updaterState[d] || (console.log("Initializing state for", d, t), J(
    d,
    B(
      d,
      n,
      U.current,
      M
    )
  ), a.getState().cogsStateStore[d] || D(d, t), a.getState().initialStateGlobal[d] || Z(d, t));
  const c = w.useMemo(() => B(
    d,
    n,
    U.current,
    M
  ), [d]);
  return [st(d), c];
}
function B(t, i, g, S) {
  const f = /* @__PURE__ */ new Map();
  let _ = 0;
  const v = (o) => {
    const e = o.join(".");
    for (const [I] of f)
      (I === e || I.startsWith(e + ".")) && f.delete(I);
    _++;
  }, p = /* @__PURE__ */ new Map(), y = {
    removeValidation: (o) => {
      o?.validationKey && W(o.validationKey);
    },
    revertToInitialState: (o) => {
      o?.validationKey && W(o.validationKey);
      const e = a.getState().initialStateGlobal[t];
      f.clear(), _++;
      const I = N(e, []);
      w.startTransition(() => {
        J(t, I), D(t, e);
        const x = a.getState().stateComponents.get(t);
        x && x.components.forEach((O) => {
          O.forceUpdate();
        });
        const M = Y(t);
        M?.initState && localStorage.removeItem(
          M?.initState ? S + "-" + t + "-" + M?.initState.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (o) => {
      f.clear(), _++;
      const e = B(
        t,
        i,
        g,
        S
      );
      return w.startTransition(() => {
        Z(t, o), J(t, e), D(t, o);
        const I = a.getState().stateComponents.get(t);
        I && I.components.forEach((x) => {
          x.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (I) => e.get()[I]
      };
    },
    _initialState: a.getState().initialStateGlobal[t],
    _serverState: a.getState().serverState[t],
    _isLoading: a.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const o = a.getState().serverState[t];
      return !!(o && h(o, st(t)));
    }
  };
  function N(o, e = [], I) {
    const x = e.map(String).join(".");
    f.get(x);
    const M = {
      get(d, s) {
        if (s !== "then" && !s.startsWith("$") && s !== "stateMapNoRender") {
          const n = e.join("."), c = `${t}////${g}`, l = a.getState().stateComponents.get(t);
          if (l && n) {
            const r = l.components.get(c);
            r && r.paths.add(n);
          }
        }
        if (Array.isArray(o)) {
          if (s === "getSelected")
            return () => {
              const n = p.get(
                e.join(".")
              );
              if (n !== void 0)
                return N(
                  o[n],
                  [...e, n.toString()],
                  I
                );
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const c = I?.filtered?.some(
                (r) => r.join(".") === e.join(".")
              ), l = c ? o : a.getState().getNestedState(t, e);
              return s !== "stateMapNoRender" && (f.clear(), _++), l.map((r, u) => {
                const $ = c && r.__origIndex ? r.__origIndex : u, R = N(
                  r,
                  [...e, $.toString()],
                  I
                );
                return n(
                  r,
                  R,
                  u,
                  o,
                  N(
                    o,
                    e,
                    I
                  )
                );
              });
            };
          if (s === "$stateMap")
            return (n) => w.createElement(Tt, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              effectiveSetState: i,
              componentId: g,
              rebuildStateShape: N
            });
          if (s === "stateFlattenOn")
            return (n) => {
              const l = I?.filtered?.some(
                (u) => u.join(".") === e.join(".")
              ) ? o : a.getState().getNestedState(t, e);
              f.clear(), _++;
              const r = l.flatMap(
                (u, $) => u[n] ?? []
              );
              return N(
                r,
                [...e, "[*]", n],
                I
              );
            };
          if (s === "findWith")
            return (n, c) => {
              const l = o.findIndex(
                ($) => $[n] === c
              );
              if (l === -1) return;
              const r = o[l], u = [...e, l.toString()];
              return f.clear(), _++, f.clear(), _++, N(r, u);
            };
          if (s === "index")
            return (n) => {
              const c = o[n];
              return N(c, [
                ...e,
                n.toString()
              ]);
            };
          if (s === "insert")
            return (n) => (v(e), nt(
              i,
              n,
              e,
              t
            ), N(
              a.getState().cogsStateStore[t],
              []
            ));
          if (s === "uniqueInsert")
            return (n, c, l) => {
              const r = a.getState().getNestedState(t, e), u = ot(n) ? n(r) : n;
              let $ = null;
              if (!r.some((T) => {
                if (c) {
                  const F = c.every(
                    (k) => h(
                      T[k],
                      u[k]
                    )
                  );
                  return F && ($ = T), F;
                }
                const b = h(T, u);
                return b && ($ = T), b;
              }))
                v(e), nt(
                  i,
                  u,
                  e,
                  t
                );
              else if (l && $) {
                const T = l($), b = r.map(
                  (F) => h(F, $) ? T : F
                );
                v(e), z(
                  i,
                  b,
                  e
                );
              }
            };
          if (s === "cut")
            return (n, c) => {
              c?.waitForSync || (v(e), rt(i, e, t, n));
            };
          if (s === "stateFilter")
            return (n) => {
              const c = o.map(
                (u, $) => ({
                  ...u,
                  __origIndex: $.toString()
                })
              ), l = [], r = [];
              for (let u = 0; u < c.length; u++)
                n(c[u], u) && (l.push(u), r.push(c[u]));
              return f.clear(), _++, N(
                r,
                e,
                {
                  filtered: [...I?.filtered || [], e],
                  validIndices: l
                  // Pass through the meta
                }
              );
            };
        }
        const q = e[e.length - 1];
        if (!isNaN(Number(q))) {
          const n = e.slice(0, -1), c = a.getState().getNestedState(t, n);
          if (Array.isArray(c) && s === "cut")
            return () => rt(
              i,
              n,
              t,
              Number(q)
            );
        }
        if (s === "get")
          return () => a.getState().getNestedState(t, e);
        if (s === "$derive")
          return (n) => Q({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (s === "$derive")
          return (n) => Q({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (s === "$get")
          return () => Q({
            _stateKey: t,
            _path: e
          });
        if (s === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return a.getState().getSyncInfo(n);
        }
        if (s === "_selected") {
          const n = e.slice(0, -1), c = n.join("."), l = a.getState().getNestedState(t, n);
          return Array.isArray(l) ? Number(e[e.length - 1]) === p.get(c) : void 0;
        }
        if (s == "getLocalStorage")
          return (n) => ct(
            S + "-" + t + "-" + n
          );
        if (s === "setSelected")
          return (n) => {
            const c = e.slice(0, -1), l = Number(e[e.length - 1]), r = c.join(".");
            n ? p.set(r, l) : p.delete(r);
            const u = a.getState().getNestedState(t, [...c]);
            z(i, u, c), v(c);
          };
        if (e.length == 0) {
          if (s == "_componentId") return g;
          if (s === "_initialState")
            return a.getState().initialStateGlobal[t];
          if (s === "_serverState")
            return a.getState().serverState[t];
          if (s === "_isLoading")
            return a.getState().isLoadingGlobal[t];
          if (s === "revertToInitialState")
            return y.revertToInitialState;
          if (s === "updateInitialState")
            return y.updateInitialState;
          if (s === "removeValidation")
            return y.removeValidation;
        }
        if (s === "validationWrapper")
          return ({
            children: n,
            hideMessage: c
          }) => /* @__PURE__ */ et.jsx(
            gt,
            {
              formOpts: c ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: a.getState().getInitialOptions(t)?.validationKey || "",
              stateKey: t,
              validIndices: I?.validIndices,
              children: n
            }
          );
        if (s === "_stateKey") return t;
        if (s === "_path") return e;
        if (s === "_isServerSynced") return y._isServerSynced;
        if (s === "update")
          return (n, c) => {
            if (c?.debounce)
              St(() => {
                z(i, n, e, "");
                const l = a.getState().getNestedState(t, e);
                c?.afterUpdate && c.afterUpdate(l);
              }, c.debounce);
            else {
              z(i, n, e, "");
              const l = a.getState().getNestedState(t, e);
              c?.afterUpdate && c.afterUpdate(l);
            }
            v(e);
          };
        if (s === "formElement")
          return (n, c, l) => /* @__PURE__ */ et.jsx(
            mt,
            {
              setState: i,
              validationKey: n,
              stateKey: t,
              path: e,
              child: c,
              formOpts: l
            }
          );
        const U = [...e, s], C = a.getState().getNestedState(t, U);
        return N(C, U, I);
      }
    }, O = new Proxy(y, M);
    return f.set(x, {
      proxy: O,
      stateVersion: _
    }), O;
  }
  return N(
    a.getState().getNestedState(t, [])
  );
}
function Q(t) {
  return w.createElement(Vt, { proxy: t });
}
function Tt({
  proxy: t,
  effectiveSetState: i,
  componentId: g,
  rebuildStateShape: S
}) {
  const f = a().getNestedState(t._stateKey, t._path);
  return console.log("value", f), Array.isArray(f) ? S(
    f,
    t._path
  ).stateMapNoRender(
    (v, p, y, N, o) => t._mapFn(v, p, y, N, o)
  ) : null;
}
function Vt({
  proxy: t
}) {
  const i = w.useRef(null), g = `${t._stateKey}-${t._path.join(".")}`;
  return w.useEffect(() => {
    const S = i.current;
    if (!S || !S.parentElement) return;
    const f = S.parentElement, v = Array.from(f.childNodes).indexOf(S);
    let p = f.getAttribute("data-parent-id");
    p || (p = `parent-${crypto.randomUUID()}`, f.setAttribute("data-parent-id", p));
    const N = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: p,
      position: v,
      effect: t._effect
    };
    a.getState().addSignalElement(g, N);
    const o = a.getState().getNestedState(t._stateKey, t._path), e = document.createTextNode(String(o));
    S.replaceWith(e);
  }, [t._stateKey, t._path.join("."), t._effect]), w.createElement("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": g
  });
}
function ht(t) {
  const i = w.useSyncExternalStore(
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
  return w.createElement("text", {}, String(i));
}
export {
  Q as $cogsSignal,
  ht as $cogsSignalStore,
  bt as addStateOptions,
  Ot as createCogsState,
  $t as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
