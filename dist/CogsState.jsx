"use client";
import { j as Y } from "./node_modules/react/jsx-runtime.jsx";
import { r as w } from "./node_modules/react/index.js";
import { transformStateFunc as ut, isFunction as at, getNestedValue as L, isDeepEqual as b } from "./utility.js";
import { pushFunc as Z, cutFunc as K, updateFn as tt, ValidationWrapper as St, FormControlComponent as ft } from "./Functions.jsx";
import "zod";
import { getGlobalStore as a } from "./store.js";
import { useCogsConfig as gt } from "./CogsStateClient.jsx";
import q from "./node_modules/uuid/dist/esm-browser/v4.js";
function Rt(t, { formElements: o, zodSchema: f }) {
  return { initialState: t, formElements: o, zodSchema: f };
}
function et(t, o) {
  const f = a.getState().getInitialOptions, S = a.getState().setInitialStateOptions, u = f(t) || {};
  S(t, {
    ...u,
    ...o
  });
}
function nt({
  stateKey: t,
  options: o,
  initialOptionsPart: f
}) {
  const S = k(t) || {}, u = f[t] || {}, E = a.getState().setInitialStateOptions, v = { ...u, ...S };
  let I = !1;
  if (o)
    for (const y in o)
      v.hasOwnProperty(y) || (I = !0, v[y] = o[y]);
  I && E(t, v);
}
const Ot = (t, o) => {
  let f = t;
  const [S, u] = ut(f);
  a.getState().setInitialStates(S);
  const E = (I, y) => {
    const [g] = w.useState(q());
    nt({ stateKey: I, options: y, initialOptionsPart: u });
    const s = a.getState().cogsStateStore[I] || S[I], e = y?.modifyState ? y.modifyState(s) : s, [p, $] = wt(
      e,
      {
        stateKey: I,
        syncUpdate: y?.syncUpdate,
        componentId: g,
        localStorage: y?.localStorage,
        middleware: y?.middleware,
        enabledSync: y?.enabledSync,
        reactiveDeps: y?.reactiveDeps,
        initState: y?.initState
      }
    );
    return $;
  };
  function v(I, y) {
    nt({ stateKey: I, options: y, initialOptionsPart: u });
  }
  return { useCogsState: E, setCogsOptions: v };
}, {
  setUpdaterState: G,
  setState: R,
  getInitialOptions: k,
  getKeyState: it,
  getValidationErrors: mt,
  setStateLog: yt,
  updateInitialStateGlobal: z,
  addValidationError: vt,
  removeValidationError: U,
  setServerSyncActions: It
} = a.getState(), ot = (t) => {
  if (!t) return null;
  try {
    const o = window.localStorage.getItem(t);
    return o ? JSON.parse(o) : null;
  } catch (o) {
    return console.error("Error loading from localStorage:", o), null;
  }
}, pt = (t, o, f, S) => {
  if (f?.initState) {
    const u = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: a.getState().serverSyncLog[o]?.[0]?.timeStamp,
      baseServerState: a.getState().serverState[o]
    }, E = f.initState ? `${S}-${o}-${f.initState.localStorageKey}` : o;
    window.localStorage.setItem(E, JSON.stringify(u));
  }
}, _t = (t, o, f, S, u, E) => {
  const v = {
    initialState: o,
    updaterState: W(
      t,
      S,
      u,
      E
    ),
    state: f
  };
  w.startTransition(() => {
    z(t, v.initialState), G(t, v.updaterState), R(t, v.state);
  });
}, Et = (t) => {
  const o = a.getState().stateComponents.get(t);
  if (!o) return;
  const f = /* @__PURE__ */ new Set();
  o.components.forEach((S) => {
    f.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    w.startTransition(() => {
      f.forEach((S) => S());
    });
  });
};
function wt(t, {
  stateKey: o,
  serverSync: f,
  zodSchema: S,
  localStorage: u,
  formElements: E,
  middleware: v,
  reactiveDeps: I,
  componentId: y,
  initState: g,
  syncUpdate: s
} = {}) {
  const [e, p] = w.useState({}), { sessionId: $ } = gt();
  let P = !o;
  const [c] = w.useState(o ?? q()), J = a.getState().stateLog[c], l = w.useRef(/* @__PURE__ */ new Set()), M = w.useRef(y ?? q()), A = w.useRef(null);
  A.current = k(c), w.useEffect(() => {
    if (s && s.stateKey === c && s.path?.[0]) {
      R(c, (r) => ({
        ...r,
        [s.path[0]]: s.newValue
      }));
      const i = `${s.stateKey}:${s.path.join(".")}`;
      a.getState().setSyncInfo(i, {
        timeStamp: s.timeStamp,
        userId: s.userId
      });
    }
  }, [s]), w.useEffect(() => {
    et(c, {
      initState: g
    });
    const i = ot(
      $ + "-" + c + "-" + g?.localStorageKey
    );
    let r = null;
    g?.initialState && (r = g?.initialState, i && i.lastUpdated > (i.lastSyncedWithServer || 0) && (r = i.state), _t(
      c,
      g?.initialState,
      r,
      O,
      M.current,
      $
    )), Et(c);
  }, [g?.localStorageKey, ...g?.dependencies || []]), w.useLayoutEffect(() => {
    P && et(c, {
      serverSync: f,
      formElements: E,
      zodSchema: S,
      initState: g,
      localStorage: u,
      middleware: v
    });
    const i = `${c}////${M.current}`, r = a.getState().stateComponents.get(c) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(i, {
      forceUpdate: () => p({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: I || void 0
    }), a.getState().stateComponents.set(c, r), () => {
      const d = `${c}////${M.current}`;
      r && (r.components.delete(d), r.components.size === 0 && a.getState().stateComponents.delete(c));
    };
  }, []);
  const O = (i, r, d, _) => {
    if (Array.isArray(r)) {
      const N = `${c}-${r.join(".")}`;
      l.current.add(N);
    }
    R(c, (N) => {
      const C = at(i) ? i(N) : i, B = `${c}-${r.join(".")}`;
      if (B) {
        let j = !1, m = a.getState().signalDomElements.get(B);
        if ((!m || m.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const V = r.slice(0, -1), F = L(C, V);
          if (Array.isArray(F)) {
            j = !0;
            const T = `${c}-${V.join(".")}`;
            m = a.getState().signalDomElements.get(T);
          }
        }
        if (m) {
          const V = j ? L(C, r.slice(0, -1)) : L(C, r);
          m.forEach(({ parentId: F, position: T, effect: D }) => {
            const x = document.querySelector(
              `[data-parent-id="${F}"]`
            );
            if (x) {
              const X = Array.from(x.childNodes);
              if (X[T]) {
                const dt = D ? new Function(
                  "state",
                  `return (${D})(state)`
                )(V) : V;
                X[T].textContent = String(dt);
              }
            }
          });
        }
      }
      d.updateType === "update" && (_ || A.current?.validationKey) && r && U(
        (_ || A.current?.validationKey) + "." + r.join(".")
      );
      const h = r.slice(0, r.length - 1);
      d.updateType === "cut" && A.current?.validationKey && U(
        A.current?.validationKey + "." + h.join(".")
      ), d.updateType === "insert" && A.current?.validationKey && mt(
        A.current?.validationKey + "." + h.join(".")
      ).filter(([m, V]) => {
        let F = m?.split(".").length;
        if (m == h.join(".") && F == h.length - 1) {
          let T = m + "." + h;
          U(m), vt(T, V);
        }
      });
      const st = L(N, r), ct = L(C, r), lt = d.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), H = a.getState().stateComponents.get(c);
      if (H) {
        for (const [
          j,
          m
        ] of H.components.entries())
          if (m.depsFunction || m.paths && m.paths.has(lt))
            if (m.depsFunction) {
              const V = m.depsFunction(C);
              typeof V == "boolean" ? V && m.forceUpdate() : b(m.deps, V) || (m.deps = V, m.forceUpdate());
            } else
              m.forceUpdate();
      }
      const Q = {
        timeStamp: Date.now(),
        stateKey: c,
        path: r,
        updateType: d.updateType,
        status: "new",
        oldValue: st,
        newValue: ct
      };
      if (yt(c, (j) => {
        const V = [...j ?? [], Q].reduce((F, T) => {
          const D = `${T.stateKey}:${JSON.stringify(T.path)}`, x = F.get(D);
          return x ? (x.timeStamp = Math.max(
            x.timeStamp,
            T.timeStamp
          ), x.newValue = T.newValue, x.oldValue = x.oldValue ?? T.oldValue, x.updateType = T.updateType) : F.set(D, { ...T }), F;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), pt(
        C,
        c,
        A.current,
        $
      ), v && v({ updateLog: J, update: Q }), A.current?.serverSync) {
        const j = a.getState().serverState[c], m = A.current?.serverSync;
        It(c, {
          syncKey: typeof m.syncKey == "string" ? m.syncKey : m.syncKey({ state: C }),
          rollBackState: j,
          actionTimeStamp: Date.now() + (m.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return C;
    });
  };
  a.getState().updaterState[c] || (console.log("Initializing state for", c, t), G(
    c,
    W(
      c,
      O,
      M.current,
      $
    )
  ), a.getState().cogsStateStore[c] || R(c, t), a.getState().initialStateGlobal[c] || z(c, t));
  const n = w.useMemo(() => W(
    c,
    O,
    M.current,
    $
  ), [c]);
  return [it(c), n];
}
function W(t, o, f, S) {
  const u = /* @__PURE__ */ new Map();
  let E = 0;
  const v = (s) => {
    const e = s.join(".");
    for (const [p] of u)
      (p === e || p.startsWith(e + ".")) && u.delete(p);
    E++;
  }, I = /* @__PURE__ */ new Map(), y = {
    removeValidation: (s) => {
      s?.validationKey && U(s.validationKey);
    },
    revertToInitialState: (s) => {
      s?.validationKey && U(s.validationKey);
      const e = a.getState().initialStateGlobal[t];
      u.clear(), E++;
      const p = g(e, []);
      w.startTransition(() => {
        G(t, p), R(t, e);
        const $ = a.getState().stateComponents.get(t);
        $ && $.components.forEach((c) => {
          c.forceUpdate();
        });
        const P = k(t);
        P?.initState && localStorage.removeItem(
          P?.initState ? S + "-" + t + "-" + P?.initState.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (s) => {
      u.clear(), E++;
      const e = W(
        t,
        o,
        f,
        S
      );
      return w.startTransition(() => {
        z(t, s), G(t, e), R(t, s);
        const p = a.getState().stateComponents.get(t);
        p && p.components.forEach(($) => {
          $.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (p) => e.get()[p]
      };
    },
    _initialState: a.getState().initialStateGlobal[t],
    _serverState: a.getState().serverState[t],
    _isLoading: a.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const s = a.getState().serverState[t];
      return !!(s && b(s, it(t)));
    }
  };
  function g(s, e = [], p) {
    const $ = e.map(String).join(".");
    u.get($);
    const P = {
      get(J, l) {
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender") {
          const n = e.join("."), i = `${t}////${f}`, r = a.getState().stateComponents.get(t);
          if (r && n) {
            const d = r.components.get(i);
            d && d.paths.add(n);
          }
        }
        if (Array.isArray(s)) {
          if (l === "getSelected")
            return () => {
              const n = I.get(
                e.join(".")
              );
              if (n !== void 0)
                return g(
                  s[n],
                  [...e, n.toString()],
                  p
                );
            };
          if (t == "cart" && console.log("get222222", l, e), l === "stateMap" || l === "stateMapNoRender")
            return (n) => {
              const i = p?.filtered?.some(
                (d) => d.join(".") === e.join(".")
              ), r = i ? s : a.getState().getNestedState(t, e);
              return l !== "stateMapNoRender" && (u.clear(), E++), r.map((d, _) => {
                const N = i && d.__origIndex ? d.__origIndex : _, C = g(
                  d,
                  [...e, N.toString()],
                  p
                );
                return n(
                  d,
                  C,
                  _,
                  s,
                  g(
                    s,
                    e,
                    p
                  )
                );
              });
            };
          if (l === "$stateMap")
            return (n) => w.createElement($t, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              effectiveSetState: o,
              componentId: f,
              rebuildStateShape: g
            });
          if (l === "stateFlattenOn")
            return (n) => {
              const r = p?.filtered?.some(
                (_) => _.join(".") === e.join(".")
              ) ? s : a.getState().getNestedState(t, e);
              u.clear(), E++;
              const d = r.flatMap(
                (_, N) => _[n] ?? []
              );
              return g(
                d,
                [...e, "[*]", n],
                p
              );
            };
          if (l === "findWith")
            return (n, i) => {
              const r = s.findIndex(
                (N) => N[n] === i
              );
              if (r === -1) return;
              const d = s[r], _ = [...e, r.toString()];
              return u.clear(), E++, u.clear(), E++, g(d, _);
            };
          if (l === "index")
            return (n) => {
              const i = s[n];
              return g(i, [
                ...e,
                n.toString()
              ]);
            };
          if (l === "insert")
            return (n) => (v(e), Z(
              o,
              n,
              e,
              t
            ), g(
              a.getState().cogsStateStore[t],
              []
            ));
          if (l === "uniqueInsert")
            return (n, i) => {
              const r = a.getState().getNestedState(t, e), d = at(n) ? n(r) : n;
              !r.some((N) => i ? i.every(
                (C) => b(
                  N[C],
                  d[C]
                )
              ) : b(N, d)) && (v(e), Z(
                o,
                d,
                e,
                t
              ));
            };
          if (l === "cut")
            return (n, i) => {
              i?.waitForSync || (v(e), K(o, e, t, n));
            };
          if (l === "stateFilter")
            return (n) => {
              const i = s.map(
                (_, N) => ({
                  ..._,
                  __origIndex: N.toString()
                })
              ), r = [], d = [];
              for (let _ = 0; _ < i.length; _++)
                n(i[_], _) && (r.push(_), d.push(i[_]));
              return u.clear(), E++, g(
                d,
                e,
                {
                  filtered: [...p?.filtered || [], e],
                  validIndices: r
                  // Pass through the meta
                }
              );
            };
        }
        const M = e[e.length - 1];
        if (!isNaN(Number(M))) {
          const n = e.slice(0, -1), i = a.getState().getNestedState(t, n);
          if (Array.isArray(i) && l === "cut")
            return () => K(
              o,
              n,
              t,
              Number(M)
            );
        }
        if (l === "get")
          return () => a.getState().getNestedState(t, e);
        if (l === "$effect")
          return (n) => rt({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (l === "$get")
          return () => rt({
            _stateKey: t,
            _path: e
          });
        if (l === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return a.getState().getSyncInfo(n);
        }
        if (l === "_selected") {
          const n = e.slice(0, -1), i = n.join("."), r = a.getState().getNestedState(t, n);
          return Array.isArray(r) ? Number(e[e.length - 1]) === I.get(i) : void 0;
        }
        if (l == "getLocalStorage")
          return (n) => ot(
            S + "-" + t + "-" + n
          );
        if (l === "setSelected")
          return (n) => {
            const i = e.slice(0, -1), r = Number(e[e.length - 1]), d = i.join(".");
            n ? I.set(d, r) : I.delete(d);
            const _ = a.getState().getNestedState(t, [...i]);
            tt(o, _, i), v(i);
          };
        if (e.length == 0) {
          if (l == "_componentId") return f;
          if (l === "_initialState")
            return a.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return a.getState().serverState[t];
          if (l === "_isLoading")
            return a.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return y.revertToInitialState;
          if (l === "updateInitialState")
            return y.updateInitialState;
          if (l === "removeValidation")
            return y.removeValidation;
        }
        if (l === "validationWrapper")
          return ({
            children: n,
            hideMessage: i
          }) => /* @__PURE__ */ Y.jsx(
            St,
            {
              formOpts: i ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: a.getState().getInitialOptions(t)?.validationKey || "",
              stateKey: t,
              validIndices: p?.validIndices,
              children: n
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return e;
        if (l === "_isServerSynced") return y._isServerSynced;
        if (l === "update")
          return (n, i) => {
            v(e), tt(o, n, e, "");
          };
        if (l === "formElement")
          return (n, i, r) => /* @__PURE__ */ Y.jsx(
            ft,
            {
              setState: o,
              validationKey: n,
              stateKey: t,
              path: e,
              child: i,
              formOpts: r
            }
          );
        const A = [...e, l], O = a.getState().getNestedState(t, A);
        return g(O, A, p);
      }
    }, c = new Proxy(y, P);
    return u.set($, {
      proxy: c,
      stateVersion: E
    }), c;
  }
  return g(
    a.getState().getNestedState(t, [])
  );
}
function rt(t) {
  return w.createElement(Nt, { proxy: t });
}
function $t({
  proxy: t,
  effectiveSetState: o,
  componentId: f,
  rebuildStateShape: S
}) {
  const u = a().getNestedState(t._stateKey, t._path);
  return console.log("value", u), Array.isArray(u) ? S(
    u,
    t._path
  ).stateMapNoRender(
    (v, I, y, g, s) => t._mapFn(v, I, y, g, s)
  ) : null;
}
function Nt({
  proxy: t
}) {
  const o = w.useRef(null), f = `${t._stateKey}-${t._path.join(".")}`;
  return w.useEffect(() => {
    const S = o.current;
    if (!S || !S.parentElement) return;
    const u = S.parentElement, v = Array.from(u.childNodes).indexOf(S);
    let I = u.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", I));
    const g = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: v,
      effect: t._effect
    };
    a.getState().addSignalElement(f, g);
    const s = a.getState().getNestedState(t._stateKey, t._path), e = document.createTextNode(String(s));
    S.replaceWith(e);
  }, [t._stateKey, t._path.join("."), t._effect]), w.createElement("span", {
    ref: o,
    style: { display: "none" },
    "data-signal-id": f
  });
}
function ht(t) {
  const o = w.useSyncExternalStore(
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
  return w.createElement("text", {}, String(o));
}
export {
  rt as $cogsSignal,
  ht as $cogsSignalStore,
  Rt as addStateOptions,
  Ot as createCogsState,
  wt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
