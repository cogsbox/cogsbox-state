"use client";
import { j as et } from "./node_modules/react/jsx-runtime.jsx";
import { r as w } from "./node_modules/react/index.js";
import { transformStateFunc as ft, isFunction as ot, getNestedValue as G, isDeepEqual as O, debounce as gt } from "./utility.js";
import { pushFunc as nt, updateFn as z, cutFunc as rt, ValidationWrapper as St, FormControlComponent as mt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as a } from "./store.js";
import { useCogsConfig as yt } from "./CogsStateClient.jsx";
import X from "./node_modules/uuid/dist/esm-browser/v4.js";
function Rt(t, { formElements: i, zodSchema: m }) {
  return { initialState: t, formElements: i, zodSchema: m };
}
function at(t, i) {
  const m = a.getState().getInitialOptions, S = a.getState().setInitialStateOptions, f = m(t) || {};
  S(t, {
    ...f,
    ...i
  });
}
function it({
  stateKey: t,
  options: i,
  initialOptionsPart: m
}) {
  const S = Y(t) || {}, f = m[t] || {}, E = a.getState().setInitialStateOptions, v = { ...f, ...S };
  let p = !1;
  if (i)
    for (const y in i)
      v.hasOwnProperty(y) || (p = !0, v[y] = i[y]);
  p && E(t, v);
}
const bt = (t, i) => {
  let m = t;
  const [S, f] = ft(m);
  a.getState().setInitialStates(S);
  const E = (p, y) => {
    const [N] = w.useState(X());
    it({ stateKey: p, options: y, initialOptionsPart: f });
    const s = a.getState().cogsStateStore[p] || S[p], e = y?.modifyState ? y.modifyState(s) : s, [I, x] = $t(
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
  return { useCogsState: E, setCogsOptions: v };
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
}, Et = (t, i, m, S) => {
  if (m?.initState) {
    const f = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: a.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: a.getState().serverState[i]
    }, E = m.initState ? `${S}-${i}-${m.initState.localStorageKey}` : i;
    window.localStorage.setItem(E, JSON.stringify(f));
  }
}, wt = (t, i, m, S, f, E) => {
  const v = {
    initialState: i,
    updaterState: B(
      t,
      S,
      f,
      E
    ),
    state: m
  };
  w.startTransition(() => {
    Z(t, v.initialState), J(t, v.updaterState), D(t, v.state);
  });
}, Nt = (t) => {
  const i = a.getState().stateComponents.get(t);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((S) => {
    m.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    w.startTransition(() => {
      m.forEach((S) => S());
    });
  });
};
function $t(t, {
  stateKey: i,
  serverSync: m,
  zodSchema: S,
  localStorage: f,
  formElements: E,
  middleware: v,
  reactiveDeps: p,
  reactiveType: y,
  componentId: N,
  initState: s,
  syncUpdate: e
} = {}) {
  const [I, x] = w.useState({}), { sessionId: M } = yt();
  let b = !i;
  const [d] = w.useState(i ?? X()), o = a.getState().stateLog[d], q = w.useRef(/* @__PURE__ */ new Set()), h = w.useRef(N ?? X()), C = w.useRef(null);
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
      initState: s
    });
    const l = ct(
      M + "-" + d + "-" + s?.localStorageKey
    );
    let r = null;
    s?.initialState && (r = s?.initialState, l && l.lastUpdated > (l.lastSyncedWithServer || 0) && (r = l.state), wt(
      d,
      s?.initialState,
      r,
      n,
      h.current,
      M
    )), Nt(d);
  }, [s?.localStorageKey, ...s?.dependencies || []]), w.useLayoutEffect(() => {
    b && at(d, {
      serverSync: m,
      formElements: E,
      zodSchema: S,
      initState: s,
      localStorage: f,
      middleware: v
    });
    const l = `${d}////${h.current}`, r = a.getState().stateComponents.get(d) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(l, {
      forceUpdate: () => x({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: p || void 0,
      reactiveType: y ?? ["component", "deps"]
    }), a.getState().stateComponents.set(d, r), () => {
      const u = `${d}////${h.current}`;
      r && (r.components.delete(u), r.components.size === 0 && a.getState().stateComponents.delete(d));
    };
  }, []);
  const n = (l, r, u, T) => {
    if (Array.isArray(r)) {
      const P = `${d}-${r.join(".")}`;
      q.current.add(P);
    }
    D(d, (P) => {
      const V = ot(l) ? l(P) : l, R = `${d}-${r.join(".")}`;
      if (R) {
        let U = !1, g = a.getState().signalDomElements.get(R);
        if ((!g || g.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const $ = r.slice(0, -1), A = G(V, $);
          if (Array.isArray(A)) {
            U = !0;
            const _ = `${d}-${$.join(".")}`;
            g = a.getState().signalDomElements.get(_);
          }
        }
        if (g) {
          const $ = U ? G(V, r.slice(0, -1)) : G(V, r);
          g.forEach(({ parentId: A, position: _, effect: L }) => {
            const j = document.querySelector(
              `[data-parent-id="${A}"]`
            );
            if (j) {
              const tt = Array.from(j.childNodes);
              if (tt[_]) {
                const ut = L ? new Function(
                  "state",
                  `return (${L})(state)`
                )($) : $;
                tt[_].textContent = String(ut);
              }
            }
          });
        }
      }
      u.updateType === "update" && (T || C.current?.validationKey) && r && W(
        (T || C.current?.validationKey) + "." + r.join(".")
      );
      const F = r.slice(0, r.length - 1);
      u.updateType === "cut" && C.current?.validationKey && W(
        C.current?.validationKey + "." + F.join(".")
      ), u.updateType === "insert" && C.current?.validationKey && vt(
        C.current?.validationKey + "." + F.join(".")
      ).filter(([g, $]) => {
        let A = g?.split(".").length;
        if (g == F.join(".") && A == F.length - 1) {
          let _ = g + "." + F;
          W(g), It(_, $);
        }
      });
      const k = G(P, r), lt = G(V, r), dt = u.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), H = a.getState().stateComponents.get(d);
      if (i == "products" && (console.log("thisKey", d), console.log("stateEntry", H)), H)
        for (const [
          U,
          g
        ] of H.components.entries()) {
          let $ = !1;
          const A = Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"];
          if (!A.includes("none")) {
            if (A.includes("all")) {
              g.forceUpdate();
              continue;
            }
            if (A.includes("component") && g.paths && (g.paths.has(dt) || g.paths.has("")) && ($ = !0), console.log(
              "reactiveTypes",
              U,
              g,
              A,
              $
            ), !$ && A.includes("deps") && g.depsFunction) {
              const _ = g.depsFunction(V);
              typeof _ == "boolean" ? _ && ($ = !0) : O(g.deps, _) || (console.log(
                "reactiveTypes",
                g.deps,
                _,
                O(g.deps, _),
                _
              ), g.deps = _, $ = !0);
            }
            $ && g.forceUpdate();
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
      if (pt(d, (U) => {
        const $ = [...U ?? [], K].reduce((A, _) => {
          const L = `${_.stateKey}:${JSON.stringify(_.path)}`, j = A.get(L);
          return j ? (j.timeStamp = Math.max(
            j.timeStamp,
            _.timeStamp
          ), j.newValue = _.newValue, j.oldValue = j.oldValue ?? _.oldValue, j.updateType = _.updateType) : A.set(L, { ..._ }), A;
        }, /* @__PURE__ */ new Map());
        return Array.from($.values());
      }), Et(
        V,
        d,
        C.current,
        M
      ), v && v({
        updateLog: o,
        update: K
      }), C.current?.serverSync) {
        const U = a.getState().serverState[d], g = C.current?.serverSync;
        _t(d, {
          syncKey: typeof g.syncKey == "string" ? g.syncKey : g.syncKey({ state: V }),
          rollBackState: U,
          actionTimeStamp: Date.now() + (g.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return V;
    });
  };
  a.getState().updaterState[d] || (console.log("Initializing state for", d, t), J(
    d,
    B(
      d,
      n,
      h.current,
      M
    )
  ), a.getState().cogsStateStore[d] || D(d, t), a.getState().initialStateGlobal[d] || Z(d, t));
  const c = w.useMemo(() => B(
    d,
    n,
    h.current,
    M
  ), [d]);
  return [st(d), c];
}
function B(t, i, m, S) {
  const f = /* @__PURE__ */ new Map();
  let E = 0;
  const v = (s) => {
    const e = s.join(".");
    for (const [I] of f)
      (I === e || I.startsWith(e + ".")) && f.delete(I);
    E++;
  }, p = /* @__PURE__ */ new Map(), y = {
    removeValidation: (s) => {
      s?.validationKey && W(s.validationKey);
    },
    revertToInitialState: (s) => {
      s?.validationKey && W(s.validationKey);
      const e = a.getState().initialStateGlobal[t];
      f.clear(), E++;
      const I = N(e, []);
      w.startTransition(() => {
        J(t, I), D(t, e);
        const x = a.getState().stateComponents.get(t);
        x && x.components.forEach((b) => {
          b.forceUpdate();
        });
        const M = Y(t);
        M?.initState && localStorage.removeItem(
          M?.initState ? S + "-" + t + "-" + M?.initState.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (s) => {
      f.clear(), E++;
      const e = B(
        t,
        i,
        m,
        S
      );
      return w.startTransition(() => {
        Z(t, s), J(t, e), D(t, s);
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
      const s = a.getState().serverState[t];
      return !!(s && O(s, st(t)));
    }
  };
  function N(s, e = [], I) {
    const x = e.map(String).join(".");
    f.get(x);
    const M = {
      get(d, o) {
        if (o !== "then" && !o.startsWith("$") && o !== "stateMapNoRender") {
          const n = e.join("."), c = `${t}////${m}`, l = a.getState().stateComponents.get(t);
          if (l) {
            const r = l.components.get(c);
            r && (e.length > 0 || o === "get") && r.paths.add(n);
          }
        }
        if (Array.isArray(s)) {
          if (o === "getSelected")
            return () => {
              const n = p.get(
                e.join(".")
              );
              if (n !== void 0)
                return N(
                  s[n],
                  [...e, n.toString()],
                  I
                );
            };
          if (o === "stateMap" || o === "stateMapNoRender")
            return (n) => {
              const c = I?.filtered?.some(
                (r) => r.join(".") === e.join(".")
              ), l = c ? s : a.getState().getNestedState(t, e);
              return o !== "stateMapNoRender" && (f.clear(), E++), l.map((r, u) => {
                const T = c && r.__origIndex ? r.__origIndex : u, P = N(
                  r,
                  [...e, T.toString()],
                  I
                );
                return n(
                  r,
                  P,
                  u,
                  s,
                  N(
                    s,
                    e,
                    I
                  )
                );
              });
            };
          if (o === "$stateMap")
            return (n) => w.createElement(Tt, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              effectiveSetState: i,
              componentId: m,
              rebuildStateShape: N
            });
          if (o === "stateFlattenOn")
            return (n) => {
              const l = I?.filtered?.some(
                (u) => u.join(".") === e.join(".")
              ) ? s : a.getState().getNestedState(t, e);
              f.clear(), E++;
              const r = l.flatMap(
                (u, T) => u[n] ?? []
              );
              return N(
                r,
                [...e, "[*]", n],
                I
              );
            };
          if (o === "findWith")
            return (n, c) => {
              const l = s.findIndex(
                (T) => T[n] === c
              );
              if (l === -1) return;
              const r = s[l], u = [...e, l.toString()];
              return f.clear(), E++, f.clear(), E++, N(r, u);
            };
          if (o === "index")
            return (n) => {
              const c = s[n];
              return N(c, [
                ...e,
                n.toString()
              ]);
            };
          if (o === "insert")
            return (n) => (v(e), nt(
              i,
              n,
              e,
              t
            ), N(
              a.getState().cogsStateStore[t],
              []
            ));
          if (o === "uniqueInsert")
            return (n, c, l) => {
              const r = a.getState().getNestedState(t, e), u = ot(n) ? n(r) : n;
              let T = null;
              if (!r.some((V) => {
                if (c) {
                  const F = c.every(
                    (k) => O(
                      V[k],
                      u[k]
                    )
                  );
                  return F && (T = V), F;
                }
                const R = O(V, u);
                return R && (T = V), R;
              }))
                v(e), nt(
                  i,
                  u,
                  e,
                  t
                );
              else if (l && T) {
                const V = l(T), R = r.map(
                  (F) => O(F, T) ? V : F
                );
                v(e), z(
                  i,
                  R,
                  e
                );
              }
            };
          if (o === "cut")
            return (n, c) => {
              c?.waitForSync || (v(e), rt(i, e, t, n));
            };
          if (o === "stateFilter")
            return (n) => {
              const c = s.map(
                (u, T) => ({
                  ...u,
                  __origIndex: T.toString()
                })
              ), l = [], r = [];
              for (let u = 0; u < c.length; u++)
                n(c[u], u) && (l.push(u), r.push(c[u]));
              return f.clear(), E++, N(
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
          if (Array.isArray(c) && o === "cut")
            return () => rt(
              i,
              n,
              t,
              Number(q)
            );
        }
        if (o === "get")
          return () => a.getState().getNestedState(t, e);
        if (o === "$derive")
          return (n) => Q({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (o === "$derive")
          return (n) => Q({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (o === "$get")
          return () => Q({
            _stateKey: t,
            _path: e
          });
        if (o === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return a.getState().getSyncInfo(n);
        }
        if (o === "_selected") {
          const n = e.slice(0, -1), c = n.join("."), l = a.getState().getNestedState(t, n);
          return Array.isArray(l) ? Number(e[e.length - 1]) === p.get(c) : void 0;
        }
        if (o == "getLocalStorage")
          return (n) => ct(
            S + "-" + t + "-" + n
          );
        if (o === "getComponents")
          return a().stateComponents.get(t);
        if (o === "setSelected")
          return (n) => {
            const c = e.slice(0, -1), l = Number(e[e.length - 1]), r = c.join(".");
            n ? p.set(r, l) : p.delete(r);
            const u = a.getState().getNestedState(t, [...c]);
            z(i, u, c), v(c);
          };
        if (e.length == 0) {
          if (o == "_componentId") return m;
          if (o === "_initialState")
            return a.getState().initialStateGlobal[t];
          if (o === "_serverState")
            return a.getState().serverState[t];
          if (o === "_isLoading")
            return a.getState().isLoadingGlobal[t];
          if (o === "revertToInitialState")
            return y.revertToInitialState;
          if (o === "updateInitialState")
            return y.updateInitialState;
          if (o === "removeValidation")
            return y.removeValidation;
        }
        if (o === "validationWrapper")
          return ({
            children: n,
            hideMessage: c
          }) => /* @__PURE__ */ et.jsx(
            St,
            {
              formOpts: c ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: a.getState().getInitialOptions(t)?.validationKey || "",
              stateKey: t,
              validIndices: I?.validIndices,
              children: n
            }
          );
        if (o === "_stateKey") return t;
        if (o === "_path") return e;
        if (o === "_isServerSynced") return y._isServerSynced;
        if (o === "update")
          return (n, c) => {
            if (c?.debounce)
              gt(() => {
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
        if (o === "formElement")
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
        const h = [...e, o], C = a.getState().getNestedState(t, h);
        return N(C, h, I);
      }
    }, b = new Proxy(y, M);
    return f.set(x, {
      proxy: b,
      stateVersion: E
    }), b;
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
  componentId: m,
  rebuildStateShape: S
}) {
  const f = a().getNestedState(t._stateKey, t._path);
  return console.log("value", f), Array.isArray(f) ? S(
    f,
    t._path
  ).stateMapNoRender(
    (v, p, y, N, s) => t._mapFn(v, p, y, N, s)
  ) : null;
}
function Vt({
  proxy: t
}) {
  const i = w.useRef(null), m = `${t._stateKey}-${t._path.join(".")}`;
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
    a.getState().addSignalElement(m, N);
    const s = a.getState().getNestedState(t._stateKey, t._path), e = document.createTextNode(String(s));
    S.replaceWith(e);
  }, [t._stateKey, t._path.join("."), t._effect]), w.createElement("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function Ot(t) {
  const i = w.useSyncExternalStore(
    (m) => {
      const S = a.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return S.components.set(t._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => S.components.delete(t._stateKey);
    },
    () => a.getState().getNestedState(t._stateKey, t._path)
  );
  return w.createElement("text", {}, String(i));
}
export {
  Q as $cogsSignal,
  Ot as $cogsSignalStore,
  Rt as addStateOptions,
  bt as createCogsState,
  $t as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
