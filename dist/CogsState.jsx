"use client";
import { j as et } from "./node_modules/react/jsx-runtime.jsx";
import { r as V } from "./node_modules/react/index.js";
import { transformStateFunc as ut, isFunction as it, getNestedValue as G, isDeepEqual as R, debounce as ft } from "./utility.js";
import { pushFunc as nt, updateFn as q, cutFunc as rt, ValidationWrapper as gt, FormControlComponent as St } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r } from "./store.js";
import { useCogsConfig as mt } from "./CogsStateClient.jsx";
import H from "./node_modules/uuid/dist/esm-browser/v4.js";
function at(t, i) {
  const m = r.getState().getInitialOptions, S = r.getState().setInitialStateOptions, u = m(t) || {};
  S(t, {
    ...u,
    ...i
  });
}
function ot({
  stateKey: t,
  options: i,
  initialOptionsPart: m
}) {
  const S = Q(t) || {}, u = m[t] || {}, p = r.getState().setInitialStateOptions, _ = { ...u, ...S };
  let I = !1;
  if (i)
    for (const y in i)
      _.hasOwnProperty(y) || (I = !0, _[y] = i[y]);
  I && p(t, _);
}
const Ut = (t, i) => {
  let m = t;
  const [S, u] = ut(m);
  r.getState().setInitialStates(S);
  const p = (I, y) => {
    const [v] = V.useState(y?.componentId ?? H());
    ot({
      stateKey: I,
      options: y,
      initialOptionsPart: u
    });
    const c = r.getState().cogsStateStore[I] || S[I], e = y?.modifyState ? y.modifyState(c) : c, [E, h] = Vt(
      e,
      {
        stateKey: I,
        syncUpdate: y?.syncUpdate,
        componentId: v,
        localStorage: y?.localStorage,
        middleware: y?.middleware,
        enabledSync: y?.enabledSync,
        reactiveType: y?.reactiveType,
        reactiveDeps: y?.reactiveDeps,
        initState: y?.initState
      }
    );
    return h;
  };
  function _(I, y) {
    ot({ stateKey: I, options: y, initialOptionsPart: u });
  }
  return { useCogsState: p, setCogsOptions: _ };
}, {
  setUpdaterState: z,
  setState: D,
  getInitialOptions: Q,
  getKeyState: st,
  getValidationErrors: yt,
  setStateLog: vt,
  updateInitialStateGlobal: X,
  addValidationError: pt,
  removeValidationError: W,
  setServerSyncActions: It
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
    const u = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, p = m.initState ? `${S}-${i}-${m.initState.localStorageKey}` : i;
    window.localStorage.setItem(p, JSON.stringify(u));
  }
}, _t = (t, i, m, S, u, p) => {
  const _ = {
    initialState: i,
    updaterState: J(
      t,
      S,
      u,
      p
    ),
    state: m
  };
  V.startTransition(() => {
    X(t, _.initialState), z(t, _.updaterState), D(t, _.state);
  });
}, wt = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((S) => {
    m.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    V.startTransition(() => {
      m.forEach((S) => S());
    });
  });
};
function Vt(t, {
  stateKey: i,
  serverSync: m,
  localStorage: S,
  formElements: u,
  middleware: p,
  reactiveDeps: _,
  reactiveType: I,
  componentId: y,
  initState: v,
  syncUpdate: c
} = {}) {
  const [e, E] = V.useState({}), { sessionId: h } = mt();
  let b = !i;
  const [l] = V.useState(i ?? H()), Y = r.getState().stateLog[l], s = V.useRef(/* @__PURE__ */ new Set()), U = V.useRef(y ?? H()), C = V.useRef(null);
  C.current = Q(l), V.useEffect(() => {
    if (c && c.stateKey === l && c.path?.[0]) {
      D(l, (a) => ({
        ...a,
        [c.path[0]]: c.newValue
      }));
      const o = `${c.stateKey}:${c.path.join(".")}`;
      r.getState().setSyncInfo(o, {
        timeStamp: c.timeStamp,
        userId: c.userId
      });
    }
  }, [c]), V.useEffect(() => {
    at(l, {
      initState: v
    });
    const o = ct(
      h + "-" + l + "-" + v?.localStorageKey
    );
    let a = null;
    v?.initialState && (a = v?.initialState, o && o.lastUpdated > (o.lastSyncedWithServer || 0) && (a = o.state), _t(
      l,
      v?.initialState,
      a,
      L,
      U.current,
      h
    )), wt(l);
  }, [v?.localStorageKey, ...v?.dependencies || []]), V.useLayoutEffect(() => {
    b && at(l, {
      serverSync: m,
      formElements: u,
      initState: v,
      localStorage: S,
      middleware: p
    });
    const o = `${l}////${U.current}`, a = r.getState().stateComponents.get(l) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(o, {
      forceUpdate: () => E({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: I ?? ["component", "deps"]
    }), r.getState().stateComponents.set(l, a), () => {
      const d = `${l}////${U.current}`;
      a && (a.components.delete(d), a.components.size === 0 && r.getState().stateComponents.delete(l));
    };
  }, []);
  const L = (o, a, d, f) => {
    if (Array.isArray(a)) {
      const $ = `${l}-${a.join(".")}`;
      s.current.add($);
    }
    D(l, ($) => {
      const N = it(o) ? o($) : o, x = `${l}-${a.join(".")}`;
      if (x) {
        let P = !1, g = r.getState().signalDomElements.get(x);
        if ((!g || g.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const T = a.slice(0, -1), A = G(N, T);
          if (Array.isArray(A)) {
            P = !0;
            const w = `${l}-${T.join(".")}`;
            g = r.getState().signalDomElements.get(w);
          }
        }
        if (g) {
          const T = P ? G(N, a.slice(0, -1)) : G(N, a);
          g.forEach(({ parentId: A, position: w, effect: k }) => {
            const F = document.querySelector(
              `[data-parent-id="${A}"]`
            );
            if (F) {
              const tt = Array.from(F.childNodes);
              if (tt[w]) {
                const dt = k ? new Function(
                  "state",
                  `return (${k})(state)`
                )(T) : T;
                tt[w].textContent = String(dt);
              }
            }
          });
        }
      }
      d.updateType === "update" && (f || C.current?.validationKey) && a && W(
        (f || C.current?.validationKey) + "." + a.join(".")
      );
      const M = a.slice(0, a.length - 1);
      d.updateType === "cut" && C.current?.validationKey && W(
        C.current?.validationKey + "." + M.join(".")
      ), d.updateType === "insert" && C.current?.validationKey && yt(
        C.current?.validationKey + "." + M.join(".")
      ).filter(([g, T]) => {
        let A = g?.split(".").length;
        if (g == M.join(".") && A == M.length - 1) {
          let w = g + "." + M;
          W(g), pt(w, T);
        }
      });
      const j = G($, a), O = G(N, a), lt = d.updateType === "update" ? a.join(".") : [...a].slice(0, -1).join("."), Z = r.getState().stateComponents.get(l);
      if (i == "products" && (console.log("thisKey", l), console.log("stateEntry", Z)), Z)
        for (const [
          P,
          g
        ] of Z.components.entries()) {
          let T = !1;
          const A = Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"];
          if (!A.includes("none")) {
            if (A.includes("all")) {
              g.forceUpdate();
              continue;
            }
            if (A.includes("component") && g.paths && (g.paths.has(lt) || g.paths.has("")) && (T = !0), console.log(
              "reactiveTypes",
              P,
              g,
              A,
              T
            ), !T && A.includes("deps") && g.depsFunction) {
              const w = g.depsFunction(N);
              typeof w == "boolean" ? w && (T = !0) : R(g.deps, w) || (console.log(
                "reactiveTypes",
                g.deps,
                w,
                R(g.deps, w),
                w
              ), g.deps = w, T = !0);
            }
            T && g.forceUpdate();
          }
        }
      const K = {
        timeStamp: Date.now(),
        stateKey: l,
        path: a,
        updateType: d.updateType,
        status: "new",
        oldValue: j,
        newValue: O
      };
      if (vt(l, (P) => {
        const T = [...P ?? [], K].reduce((A, w) => {
          const k = `${w.stateKey}:${JSON.stringify(w.path)}`, F = A.get(k);
          return F ? (F.timeStamp = Math.max(
            F.timeStamp,
            w.timeStamp
          ), F.newValue = w.newValue, F.oldValue = F.oldValue ?? w.oldValue, F.updateType = w.updateType) : A.set(k, { ...w }), A;
        }, /* @__PURE__ */ new Map());
        return Array.from(T.values());
      }), Et(
        N,
        l,
        C.current,
        h
      ), p && p({
        updateLog: Y,
        update: K
      }), C.current?.serverSync) {
        const P = r.getState().serverState[l], g = C.current?.serverSync;
        It(l, {
          syncKey: typeof g.syncKey == "string" ? g.syncKey : g.syncKey({ state: N }),
          rollBackState: P,
          actionTimeStamp: Date.now() + (g.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return N;
    });
  };
  r.getState().updaterState[l] || (console.log("Initializing state for", l, t), z(
    l,
    J(
      l,
      L,
      U.current,
      h
    )
  ), r.getState().cogsStateStore[l] || D(l, t), r.getState().initialStateGlobal[l] || X(l, t));
  const n = V.useMemo(() => J(
    l,
    L,
    U.current,
    h
  ), [l]);
  return [st(l), n];
}
function J(t, i, m, S) {
  const u = /* @__PURE__ */ new Map();
  let p = 0;
  const _ = (c) => {
    const e = c.join(".");
    for (const [E] of u)
      (E === e || E.startsWith(e + ".")) && u.delete(E);
    p++;
  }, I = /* @__PURE__ */ new Map(), y = {
    removeValidation: (c) => {
      c?.validationKey && W(c.validationKey);
    },
    revertToInitialState: (c) => {
      c?.validationKey && W(c.validationKey);
      const e = r.getState().initialStateGlobal[t];
      u.clear(), p++;
      const E = v(e, []);
      V.startTransition(() => {
        z(t, E), D(t, e);
        const h = r.getState().stateComponents.get(t);
        h && h.components.forEach((l) => {
          l.forceUpdate();
        });
        const b = Q(t);
        b?.initState && localStorage.removeItem(
          b?.initState ? S + "-" + t + "-" + b?.initState.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (c) => {
      u.clear(), p++;
      const e = J(
        t,
        i,
        m,
        S
      );
      return V.startTransition(() => {
        X(t, c), z(t, e), D(t, c);
        const E = r.getState().stateComponents.get(t);
        E && E.components.forEach((h) => {
          h.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (E) => e.get()[E]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const c = r.getState().serverState[t];
      return !!(c && R(c, st(t)));
    }
  };
  function v(c, e = [], E) {
    const h = e.map(String).join(".");
    u.get(h);
    const b = {
      get(Y, s) {
        if (s !== "then" && !s.startsWith("$") && s !== "stateMapNoRender") {
          const n = e.join("."), o = `${t}////${m}`, a = r.getState().stateComponents.get(t);
          if (a) {
            const d = a.components.get(o);
            d && (e.length > 0 || s === "get") && d.paths.add(n);
          }
        }
        if (Array.isArray(c)) {
          if (s === "getSelected")
            return () => {
              const n = I.get(
                e.join(".")
              );
              if (n !== void 0)
                return v(
                  c[n],
                  [...e, n.toString()],
                  E
                );
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const o = E?.filtered?.some(
                (d) => d.join(".") === e.join(".")
              ), a = o ? c : r.getState().getNestedState(t, e);
              return s !== "stateMapNoRender" && (u.clear(), p++), a.map((d, f) => {
                const $ = o && d.__origIndex ? d.__origIndex : f, N = v(
                  d,
                  [...e, $.toString()],
                  E
                );
                return n(
                  d,
                  N,
                  f,
                  c,
                  v(
                    c,
                    e,
                    E
                  )
                );
              });
            };
          if (s === "$stateMap")
            return (n) => V.createElement($t, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              effectiveSetState: i,
              componentId: m,
              rebuildStateShape: v
            });
          if (s === "stateFlattenOn")
            return (n) => {
              const a = E?.filtered?.some(
                (f) => f.join(".") === e.join(".")
              ) ? c : r.getState().getNestedState(t, e);
              u.clear(), p++;
              const d = a.flatMap(
                (f, $) => f[n] ?? []
              );
              return v(
                d,
                [...e, "[*]", n],
                E
              );
            };
          if (s === "findWith")
            return (n, o) => {
              const a = c.findIndex(
                ($) => $[n] === o
              );
              if (a === -1) return;
              const d = c[a], f = [...e, a.toString()];
              return u.clear(), p++, u.clear(), p++, v(d, f);
            };
          if (s === "index")
            return (n) => {
              const o = c[n];
              return v(o, [
                ...e,
                n.toString()
              ]);
            };
          if (s === "insert")
            return (n) => (_(e), nt(
              i,
              n,
              e,
              t
            ), v(
              r.getState().cogsStateStore[t],
              []
            ));
          if (s === "uniqueInsert")
            return (n, o, a) => {
              const d = r.getState().getNestedState(t, e), f = it(n) ? n(d) : n;
              let $ = null;
              if (!d.some((x) => {
                if (o) {
                  const j = o.every(
                    (O) => R(
                      x[O],
                      f[O]
                    )
                  );
                  return j && ($ = x), j;
                }
                const M = R(x, f);
                return M && ($ = x), M;
              }))
                _(e), nt(
                  i,
                  f,
                  e,
                  t
                );
              else if (a && $) {
                const x = a($), M = d.map(
                  (j) => R(j, $) ? x : j
                );
                _(e), q(
                  i,
                  M,
                  e
                );
              }
            };
          if (s === "cut")
            return (n, o) => {
              o?.waitForSync || (_(e), rt(i, e, t, n));
            };
          if (s === "stateFilter")
            return (n) => {
              const o = c.map(
                (f, $) => ({
                  ...f,
                  __origIndex: $.toString()
                })
              ), a = [], d = [];
              for (let f = 0; f < o.length; f++)
                n(o[f], f) && (a.push(f), d.push(o[f]));
              return u.clear(), p++, v(
                d,
                e,
                {
                  filtered: [...E?.filtered || [], e],
                  validIndices: a
                  // Pass through the meta
                }
              );
            };
        }
        const U = e[e.length - 1];
        if (!isNaN(Number(U))) {
          const n = e.slice(0, -1), o = r.getState().getNestedState(t, n);
          if (Array.isArray(o) && s === "cut")
            return () => rt(
              i,
              n,
              t,
              Number(U)
            );
        }
        if (s === "get")
          return () => r.getState().getNestedState(t, e);
        if (s === "$derive")
          return (n) => B({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (s === "$derive")
          return (n) => B({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (s === "$get")
          return () => B({
            _stateKey: t,
            _path: e
          });
        if (s === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (s === "_selected") {
          const n = e.slice(0, -1), o = n.join("."), a = r.getState().getNestedState(t, n);
          return Array.isArray(a) ? Number(e[e.length - 1]) === I.get(o) : void 0;
        }
        if (s == "getLocalStorage")
          return (n) => ct(
            S + "-" + t + "-" + n
          );
        if (s === "setSelected")
          return (n) => {
            const o = e.slice(0, -1), a = Number(e[e.length - 1]), d = o.join(".");
            n ? I.set(d, a) : I.delete(d);
            const f = r.getState().getNestedState(t, [...o]);
            q(i, f, o), _(o);
          };
        if (e.length == 0) {
          if (s === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(t)?.validation, o = r.getState().addValidationError, a = r.getState().removeValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              a(n.key);
              const d = r.getState().cogsStateStore[t];
              try {
                const f = r.getState().getValidationErrors(n.key);
                f && f.length > 0 && f.forEach(([N]) => {
                  N && N.startsWith(n.key) && a(N);
                });
                const $ = n.zodSchema.safeParse(d);
                return $.success ? !0 : ($.error.errors.forEach((x) => {
                  const M = x.path, j = x.message, O = [
                    n.key,
                    ...M
                  ].join(".");
                  o(
                    O,
                    j
                  ), console.log(
                    `Validation error at ${O}: ${j}`
                  );
                }), !1);
              } catch (f) {
                return console.error(
                  "Zod schema validation failed",
                  f
                ), !1;
              }
            };
          if (s === "_componentId") return m;
          if (s === "getComponents")
            return () => r().stateComponents.get(t);
          if (s === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (s === "_serverState")
            return r.getState().serverState[t];
          if (s === "_isLoading")
            return r.getState().isLoadingGlobal[t];
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
            hideMessage: o
          }) => /* @__PURE__ */ et.jsx(
            gt,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: E?.validIndices,
              children: n
            }
          );
        if (s === "_stateKey") return t;
        if (s === "_path") return e;
        if (s === "_isServerSynced") return y._isServerSynced;
        if (s === "update")
          return (n, o) => {
            if (o?.debounce)
              ft(() => {
                q(i, n, e, "");
                const a = r.getState().getNestedState(t, e);
                o?.afterUpdate && o.afterUpdate(a);
              }, o.debounce);
            else {
              q(i, n, e, "");
              const a = r.getState().getNestedState(t, e);
              o?.afterUpdate && o.afterUpdate(a);
            }
            _(e);
          };
        if (s === "formElement")
          return (n, o) => /* @__PURE__ */ et.jsx(
            St,
            {
              setState: i,
              stateKey: t,
              path: e,
              child: n,
              formOpts: o
            }
          );
        const C = [...e, s], L = r.getState().getNestedState(t, C);
        return v(L, C, E);
      }
    }, l = new Proxy(y, b);
    return u.set(h, {
      proxy: l,
      stateVersion: p
    }), l;
  }
  return v(
    r.getState().getNestedState(t, [])
  );
}
function B(t) {
  return V.createElement(Nt, { proxy: t });
}
function $t({
  proxy: t,
  effectiveSetState: i,
  componentId: m,
  rebuildStateShape: S
}) {
  const u = r().getNestedState(t._stateKey, t._path);
  return console.log("value", u), Array.isArray(u) ? S(
    u,
    t._path
  ).stateMapNoRender(
    (_, I, y, v, c) => t._mapFn(_, I, y, v, c)
  ) : null;
}
function Nt({
  proxy: t
}) {
  const i = V.useRef(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return V.useEffect(() => {
    const S = i.current;
    if (!S || !S.parentElement) return;
    const u = S.parentElement, _ = Array.from(u.childNodes).indexOf(S);
    let I = u.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: _,
      effect: t._effect
    };
    r.getState().addSignalElement(m, v);
    const c = r.getState().getNestedState(t._stateKey, t._path), e = document.createTextNode(String(c));
    S.replaceWith(e);
  }, [t._stateKey, t._path.join("."), t._effect]), V.createElement("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function bt(t) {
  const i = V.useSyncExternalStore(
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
  return V.createElement("text", {}, String(i));
}
export {
  B as $cogsSignal,
  bt as $cogsSignalStore,
  Ut as createCogsState,
  Vt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
