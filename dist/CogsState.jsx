"use client";
import { j as et } from "./node_modules/react/jsx-runtime.jsx";
import { r as w } from "./node_modules/react/index.js";
import { transformStateFunc as ft, isFunction as ot, getNestedValue as G, isDeepEqual as O, debounce as gt } from "./utility.js";
import { pushFunc as nt, updateFn as z, cutFunc as at, ValidationWrapper as St, FormControlComponent as mt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r } from "./store.js";
import { useCogsConfig as yt } from "./CogsStateClient.jsx";
import X from "./node_modules/uuid/dist/esm-browser/v4.js";
function Rt(t, { formElements: i, zodSchema: m }) {
  return { initialState: t, formElements: i, zodSchema: m };
}
function rt(t, i) {
  const m = r.getState().getInitialOptions, S = r.getState().setInitialStateOptions, f = m(t) || {};
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
  const S = Y(t) || {}, f = m[t] || {}, E = r.getState().setInitialStateOptions, v = { ...f, ...S };
  let p = !1;
  if (i)
    for (const y in i)
      v.hasOwnProperty(y) || (p = !0, v[y] = i[y]);
  p && E(t, v);
}
const bt = (t, i) => {
  let m = t;
  const [S, f] = ft(m);
  r.getState().setInitialStates(S);
  const E = (p, y) => {
    const [N] = w.useState(y?.componentId ?? X());
    it({
      stateKey: p,
      options: { ...y, validationKey: i?.validationKey },
      initialOptionsPart: f
    });
    const s = r.getState().cogsStateStore[p] || S[p], e = y?.modifyState ? y.modifyState(s) : s, [I, x] = $t(
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
} = r.getState(), ct = (t) => {
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
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
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
  const i = r.getState().stateComponents.get(t);
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
  const [l] = w.useState(i ?? X()), o = r.getState().stateLog[l], q = w.useRef(/* @__PURE__ */ new Set()), h = w.useRef(N ?? X()), C = w.useRef(null);
  C.current = Y(l), w.useEffect(() => {
    if (e && e.stateKey === l && e.path?.[0]) {
      D(l, (a) => ({
        ...a,
        [e.path[0]]: e.newValue
      }));
      const d = `${e.stateKey}:${e.path.join(".")}`;
      r.getState().setSyncInfo(d, {
        timeStamp: e.timeStamp,
        userId: e.userId
      });
    }
  }, [e]), w.useEffect(() => {
    rt(l, {
      initState: s
    });
    const d = ct(
      M + "-" + l + "-" + s?.localStorageKey
    );
    let a = null;
    s?.initialState && (a = s?.initialState, d && d.lastUpdated > (d.lastSyncedWithServer || 0) && (a = d.state), wt(
      l,
      s?.initialState,
      a,
      n,
      h.current,
      M
    )), Nt(l);
  }, [s?.localStorageKey, ...s?.dependencies || []]), w.useLayoutEffect(() => {
    b && rt(l, {
      serverSync: m,
      formElements: E,
      zodSchema: S,
      initState: s,
      localStorage: f,
      middleware: v
    });
    const d = `${l}////${h.current}`, a = r.getState().stateComponents.get(l) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(d, {
      forceUpdate: () => x({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: p || void 0,
      reactiveType: y ?? ["component", "deps"]
    }), r.getState().stateComponents.set(l, a), () => {
      const u = `${l}////${h.current}`;
      a && (a.components.delete(u), a.components.size === 0 && r.getState().stateComponents.delete(l));
    };
  }, []);
  const n = (d, a, u, T) => {
    if (Array.isArray(a)) {
      const P = `${l}-${a.join(".")}`;
      q.current.add(P);
    }
    D(l, (P) => {
      const V = ot(d) ? d(P) : d, R = `${l}-${a.join(".")}`;
      if (R) {
        let U = !1, g = r.getState().signalDomElements.get(R);
        if ((!g || g.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const $ = a.slice(0, -1), A = G(V, $);
          if (Array.isArray(A)) {
            U = !0;
            const _ = `${l}-${$.join(".")}`;
            g = r.getState().signalDomElements.get(_);
          }
        }
        if (g) {
          const $ = U ? G(V, a.slice(0, -1)) : G(V, a);
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
      u.updateType === "update" && (T || C.current?.validationKey) && a && W(
        (T || C.current?.validationKey) + "." + a.join(".")
      );
      const F = a.slice(0, a.length - 1);
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
      const k = G(P, a), lt = G(V, a), dt = u.updateType === "update" ? a.join(".") : [...a].slice(0, -1).join("."), H = r.getState().stateComponents.get(l);
      if (i == "products" && (console.log("thisKey", l), console.log("stateEntry", H)), H)
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
        stateKey: l,
        path: a,
        updateType: u.updateType,
        status: "new",
        oldValue: k,
        newValue: lt
      };
      if (pt(l, (U) => {
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
        l,
        C.current,
        M
      ), v && v({
        updateLog: o,
        update: K
      }), C.current?.serverSync) {
        const U = r.getState().serverState[l], g = C.current?.serverSync;
        _t(l, {
          syncKey: typeof g.syncKey == "string" ? g.syncKey : g.syncKey({ state: V }),
          rollBackState: U,
          actionTimeStamp: Date.now() + (g.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return V;
    });
  };
  r.getState().updaterState[l] || (console.log("Initializing state for", l, t), J(
    l,
    B(
      l,
      n,
      h.current,
      M
    )
  ), r.getState().cogsStateStore[l] || D(l, t), r.getState().initialStateGlobal[l] || Z(l, t));
  const c = w.useMemo(() => B(
    l,
    n,
    h.current,
    M
  ), [l]);
  return [st(l), c];
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
      const e = r.getState().initialStateGlobal[t];
      f.clear(), E++;
      const I = N(e, []);
      w.startTransition(() => {
        J(t, I), D(t, e);
        const x = r.getState().stateComponents.get(t);
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
        const I = r.getState().stateComponents.get(t);
        I && I.components.forEach((x) => {
          x.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (I) => e.get()[I]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const s = r.getState().serverState[t];
      return !!(s && O(s, st(t)));
    }
  };
  function N(s, e = [], I) {
    const x = e.map(String).join(".");
    f.get(x);
    const M = {
      get(l, o) {
        if (o !== "then" && !o.startsWith("$") && o !== "stateMapNoRender") {
          const n = e.join("."), c = `${t}////${m}`, d = r.getState().stateComponents.get(t);
          if (d) {
            const a = d.components.get(c);
            a && (e.length > 0 || o === "get") && a.paths.add(n);
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
                (a) => a.join(".") === e.join(".")
              ), d = c ? s : r.getState().getNestedState(t, e);
              return o !== "stateMapNoRender" && (f.clear(), E++), d.map((a, u) => {
                const T = c && a.__origIndex ? a.__origIndex : u, P = N(
                  a,
                  [...e, T.toString()],
                  I
                );
                return n(
                  a,
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
              const d = I?.filtered?.some(
                (u) => u.join(".") === e.join(".")
              ) ? s : r.getState().getNestedState(t, e);
              f.clear(), E++;
              const a = d.flatMap(
                (u, T) => u[n] ?? []
              );
              return N(
                a,
                [...e, "[*]", n],
                I
              );
            };
          if (o === "findWith")
            return (n, c) => {
              const d = s.findIndex(
                (T) => T[n] === c
              );
              if (d === -1) return;
              const a = s[d], u = [...e, d.toString()];
              return f.clear(), E++, f.clear(), E++, N(a, u);
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
              r.getState().cogsStateStore[t],
              []
            ));
          if (o === "uniqueInsert")
            return (n, c, d) => {
              const a = r.getState().getNestedState(t, e), u = ot(n) ? n(a) : n;
              let T = null;
              if (!a.some((V) => {
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
              else if (d && T) {
                const V = d(T), R = a.map(
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
              c?.waitForSync || (v(e), at(i, e, t, n));
            };
          if (o === "stateFilter")
            return (n) => {
              const c = s.map(
                (u, T) => ({
                  ...u,
                  __origIndex: T.toString()
                })
              ), d = [], a = [];
              for (let u = 0; u < c.length; u++)
                n(c[u], u) && (d.push(u), a.push(c[u]));
              return f.clear(), E++, N(
                a,
                e,
                {
                  filtered: [...I?.filtered || [], e],
                  validIndices: d
                  // Pass through the meta
                }
              );
            };
        }
        const q = e[e.length - 1];
        if (!isNaN(Number(q))) {
          const n = e.slice(0, -1), c = r.getState().getNestedState(t, n);
          if (Array.isArray(c) && o === "cut")
            return () => at(
              i,
              n,
              t,
              Number(q)
            );
        }
        if (o === "get")
          return () => r.getState().getNestedState(t, e);
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
          return r.getState().getSyncInfo(n);
        }
        if (o === "_selected") {
          const n = e.slice(0, -1), c = n.join("."), d = r.getState().getNestedState(t, n);
          return Array.isArray(d) ? Number(e[e.length - 1]) === p.get(c) : void 0;
        }
        if (o == "getLocalStorage")
          return (n) => ct(
            S + "-" + t + "-" + n
          );
        if (o === "setSelected")
          return (n) => {
            const c = e.slice(0, -1), d = Number(e[e.length - 1]), a = c.join(".");
            n ? p.set(a, d) : p.delete(a);
            const u = r.getState().getNestedState(t, [...c]);
            z(i, u, c), v(c);
          };
        if (e.length == 0) {
          if (o == "_componentId") return m;
          if (o === "getComponents")
            return () => r().stateComponents.get(t);
          if (o === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (o === "_serverState")
            return r.getState().serverState[t];
          if (o === "_isLoading")
            return r.getState().isLoadingGlobal[t];
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
              validationKey: r.getState().getInitialOptions(t)?.validationKey || "",
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
                const d = r.getState().getNestedState(t, e);
                c?.afterUpdate && c.afterUpdate(d);
              }, c.debounce);
            else {
              z(i, n, e, "");
              const d = r.getState().getNestedState(t, e);
              c?.afterUpdate && c.afterUpdate(d);
            }
            v(e);
          };
        if (o === "formElement")
          return (n, c) => /* @__PURE__ */ et.jsx(
            mt,
            {
              setState: i,
              stateKey: t,
              path: e,
              child: n,
              formOpts: c
            }
          );
        const h = [...e, o], C = r.getState().getNestedState(t, h);
        return N(C, h, I);
      }
    }, b = new Proxy(y, M);
    return f.set(x, {
      proxy: b,
      stateVersion: E
    }), b;
  }
  return N(
    r.getState().getNestedState(t, [])
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
  const f = r().getNestedState(t._stateKey, t._path);
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
    r.getState().addSignalElement(m, N);
    const s = r.getState().getNestedState(t._stateKey, t._path), e = document.createTextNode(String(s));
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
      const S = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return S.components.set(t._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => S.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
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
