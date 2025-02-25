"use client";
import { j as et } from "./node_modules/react/jsx-runtime.jsx";
import { r as N } from "./node_modules/react/index.js";
import { transformStateFunc as ut, isFunction as it, getNestedValue as G, isDeepEqual as R, debounce as ft } from "./utility.js";
import { pushFunc as nt, updateFn as z, cutFunc as rt, ValidationWrapper as gt, FormControlComponent as St } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r } from "./store.js";
import { useCogsConfig as mt } from "./CogsStateClient.jsx";
import Q from "./node_modules/uuid/dist/esm-browser/v4.js";
function at(t, i) {
  const m = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, u = m(t) || {};
  g(t, {
    ...u,
    ...i
  });
}
function ot({
  stateKey: t,
  options: i,
  initialOptionsPart: m
}) {
  const g = X(t) || {}, u = m[t] || {}, I = r.getState().setInitialStateOptions, _ = { ...u, ...g };
  let E = !1;
  if (i)
    for (const y in i)
      _.hasOwnProperty(y) || (E = !0, _[y] = i[y]);
  E && I(t, _);
}
const Pt = (t, i) => {
  let m = t;
  const [g, u] = ut(m);
  r.getState().setInitialStates(g);
  const I = (E, y) => {
    const [v] = N.useState(y?.componentId ?? Q());
    ot({
      stateKey: E,
      options: y,
      initialOptionsPart: u
    });
    const l = r.getState().cogsStateStore[E] || g[E], e = y?.modifyState ? y.modifyState(l) : l, [p, h] = $t(
      e,
      {
        stateKey: E,
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
  function _(E, y) {
    ot({ stateKey: E, options: y, initialOptionsPart: u });
  }
  return { useCogsState: I, setCogsOptions: _ };
}, {
  setUpdaterState: J,
  setState: D,
  getInitialOptions: X,
  getKeyState: st,
  getValidationErrors: yt,
  setStateLog: vt,
  updateInitialStateGlobal: Y,
  addValidationError: pt,
  removeValidationError: U,
  setServerSyncActions: It
} = r.getState(), ct = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Et = (t, i, m, g) => {
  if (m?.initState) {
    const u = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, I = m.initState ? `${g}-${i}-${m.initState.localStorageKey}` : i;
    window.localStorage.setItem(I, JSON.stringify(u));
  }
}, _t = (t, i, m, g, u, I) => {
  const _ = {
    initialState: i,
    updaterState: Z(
      t,
      g,
      u,
      I
    ),
    state: m
  };
  N.startTransition(() => {
    Y(t, _.initialState), J(t, _.updaterState), D(t, _.state);
  });
}, wt = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    N.startTransition(() => {
      m.forEach((g) => g());
    });
  });
};
function $t(t, {
  stateKey: i,
  serverSync: m,
  localStorage: g,
  formElements: u,
  middleware: I,
  reactiveDeps: _,
  reactiveType: E,
  componentId: y,
  initState: v,
  syncUpdate: l
} = {}) {
  const [e, p] = N.useState({}), { sessionId: h } = mt();
  let b = !i;
  const [s] = N.useState(i ?? Q()), W = r.getState().stateLog[s], c = N.useRef(/* @__PURE__ */ new Set()), P = N.useRef(y ?? Q()), C = N.useRef(null);
  C.current = X(s), N.useEffect(() => {
    if (l && l.stateKey === s && l.path?.[0]) {
      D(s, (a) => ({
        ...a,
        [l.path[0]]: l.newValue
      }));
      const o = `${l.stateKey}:${l.path.join(".")}`;
      r.getState().setSyncInfo(o, {
        timeStamp: l.timeStamp,
        userId: l.userId
      });
    }
  }, [l]), N.useEffect(() => {
    at(s, {
      initState: v
    });
    const o = ct(
      h + "-" + s + "-" + v?.localStorageKey
    );
    let a = null;
    v?.initialState && (a = v?.initialState, o && o.lastUpdated > (o.lastSyncedWithServer || 0) && (a = o.state), _t(
      s,
      v?.initialState,
      a,
      L,
      P.current,
      h
    )), wt(s);
  }, [v?.localStorageKey, ...v?.dependencies || []]), N.useLayoutEffect(() => {
    b && at(s, {
      serverSync: m,
      formElements: u,
      initState: v,
      localStorage: g,
      middleware: I
    });
    const o = `${s}////${P.current}`, a = r.getState().stateComponents.get(s) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(o, {
      forceUpdate: () => p({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), r.getState().stateComponents.set(s, a), () => {
      const d = `${s}////${P.current}`;
      a && (a.components.delete(d), a.components.size === 0 && r.getState().stateComponents.delete(s));
    };
  }, []);
  const L = (o, a, d, S) => {
    if (Array.isArray(a)) {
      const w = `${s}-${a.join(".")}`;
      c.current.add(w);
    }
    D(s, (w) => {
      const A = it(o) ? o(w) : o, M = `${s}-${a.join(".")}`;
      if (M) {
        let O = !1, f = r.getState().signalDomElements.get(M);
        if ((!f || f.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const V = a.slice(0, -1), T = G(A, V);
          if (Array.isArray(T)) {
            O = !0;
            const $ = `${s}-${V.join(".")}`;
            f = r.getState().signalDomElements.get($);
          }
        }
        if (f) {
          const V = O ? G(A, a.slice(0, -1)) : G(A, a);
          f.forEach(({ parentId: T, position: $, effect: k }) => {
            const F = document.querySelector(
              `[data-parent-id="${T}"]`
            );
            if (F) {
              const tt = Array.from(F.childNodes);
              if (tt[$]) {
                const dt = k ? new Function(
                  "state",
                  `return (${k})(state)`
                )(V) : V;
                tt[$].textContent = String(dt);
              }
            }
          });
        }
      }
      d.updateType === "update" && (S || C.current?.validationKey) && a && U(
        (S || C.current?.validationKey) + "." + a.join(".")
      );
      const x = a.slice(0, a.length - 1);
      d.updateType === "cut" && C.current?.validationKey && U(
        C.current?.validationKey + "." + x.join(".")
      ), d.updateType === "insert" && C.current?.validationKey && yt(
        C.current?.validationKey + "." + x.join(".")
      ).filter(([f, V]) => {
        let T = f?.split(".").length;
        if (f == x.join(".") && T == x.length - 1) {
          let $ = f + "." + x;
          U(f), pt($, V);
        }
      });
      const j = G(w, a), q = G(A, a), lt = d.updateType === "update" ? a.join(".") : [...a].slice(0, -1).join("."), B = r.getState().stateComponents.get(s);
      if (i == "products" && (console.log("thisKey", s), console.log("stateEntry", B)), B)
        for (const [
          O,
          f
        ] of B.components.entries()) {
          let V = !1;
          const T = Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"];
          if (!T.includes("none")) {
            if (T.includes("all")) {
              f.forceUpdate();
              continue;
            }
            if (T.includes("component") && f.paths && (f.paths.has(lt) || f.paths.has("")) && (V = !0), console.log(
              "reactiveTypes",
              O,
              f,
              T,
              V
            ), !V && T.includes("deps") && f.depsFunction) {
              const $ = f.depsFunction(A);
              typeof $ == "boolean" ? $ && (V = !0) : R(f.deps, $) || (console.log(
                "reactiveTypes",
                f.deps,
                $,
                R(f.deps, $),
                $
              ), f.deps = $, V = !0);
            }
            V && f.forceUpdate();
          }
        }
      const K = {
        timeStamp: Date.now(),
        stateKey: s,
        path: a,
        updateType: d.updateType,
        status: "new",
        oldValue: j,
        newValue: q
      };
      if (vt(s, (O) => {
        const V = [...O ?? [], K].reduce((T, $) => {
          const k = `${$.stateKey}:${JSON.stringify($.path)}`, F = T.get(k);
          return F ? (F.timeStamp = Math.max(
            F.timeStamp,
            $.timeStamp
          ), F.newValue = $.newValue, F.oldValue = F.oldValue ?? $.oldValue, F.updateType = $.updateType) : T.set(k, { ...$ }), T;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), Et(
        A,
        s,
        C.current,
        h
      ), I && I({
        updateLog: W,
        update: K
      }), C.current?.serverSync) {
        const O = r.getState().serverState[s], f = C.current?.serverSync;
        It(s, {
          syncKey: typeof f.syncKey == "string" ? f.syncKey : f.syncKey({ state: A }),
          rollBackState: O,
          actionTimeStamp: Date.now() + (f.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return A;
    });
  };
  r.getState().updaterState[s] || (console.log("Initializing state for", s, t), J(
    s,
    Z(
      s,
      L,
      P.current,
      h
    )
  ), r.getState().cogsStateStore[s] || D(s, t), r.getState().initialStateGlobal[s] || Y(s, t));
  const n = N.useMemo(() => Z(
    s,
    L,
    P.current,
    h
  ), [s]);
  return [st(s), n];
}
function Z(t, i, m, g) {
  const u = /* @__PURE__ */ new Map();
  let I = 0;
  const _ = (l) => {
    const e = l.join(".");
    for (const [p] of u)
      (p === e || p.startsWith(e + ".")) && u.delete(p);
    I++;
  }, E = /* @__PURE__ */ new Map(), y = {
    removeValidation: (l) => {
      l?.validationKey && U(l.validationKey);
    },
    revertToInitialState: (l) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && U(e?.key), l?.validationKey && U(l.validationKey);
      const p = r.getState().initialStateGlobal[t];
      u.clear(), I++;
      const h = v(p, []);
      N.startTransition(() => {
        J(t, h), D(t, p);
        const b = r.getState().stateComponents.get(t);
        b && b.components.forEach((W) => {
          W.forceUpdate();
        });
        const s = X(t);
        s?.initState && localStorage.removeItem(
          s?.initState ? g + "-" + t + "-" + s?.initState.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (l) => {
      u.clear(), I++;
      const e = Z(
        t,
        i,
        m,
        g
      );
      return N.startTransition(() => {
        Y(t, l), J(t, e), D(t, l);
        const p = r.getState().stateComponents.get(t);
        p && p.components.forEach((h) => {
          h.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (p) => e.get()[p]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const l = r.getState().serverState[t];
      return !!(l && R(l, st(t)));
    }
  };
  function v(l, e = [], p) {
    const h = e.map(String).join(".");
    u.get(h);
    const b = {
      get(W, c) {
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender") {
          const n = e.join("."), o = `${t}////${m}`, a = r.getState().stateComponents.get(t);
          if (a) {
            const d = a.components.get(o);
            d && (e.length > 0 || c === "get") && d.paths.add(n);
          }
        }
        if (Array.isArray(l)) {
          if (c === "getSelected")
            return () => {
              const n = E.get(
                e.join(".")
              );
              if (n !== void 0)
                return v(
                  l[n],
                  [...e, n.toString()],
                  p
                );
            };
          if (c === "stateMap" || c === "stateMapNoRender")
            return (n) => {
              const o = p?.filtered?.some(
                (d) => d.join(".") === e.join(".")
              ), a = o ? l : r.getState().getNestedState(t, e);
              return c !== "stateMapNoRender" && (u.clear(), I++), a.map((d, S) => {
                const w = o && d.__origIndex ? d.__origIndex : S, A = v(
                  d,
                  [...e, w.toString()],
                  p
                );
                return n(
                  d,
                  A,
                  S,
                  l,
                  v(
                    l,
                    e,
                    p
                  )
                );
              });
            };
          if (c === "$stateMap")
            return (n) => N.createElement(Nt, {
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
          if (c === "stateFlattenOn")
            return (n) => {
              const a = p?.filtered?.some(
                (S) => S.join(".") === e.join(".")
              ) ? l : r.getState().getNestedState(t, e);
              u.clear(), I++;
              const d = a.flatMap(
                (S, w) => S[n] ?? []
              );
              return v(
                d,
                [...e, "[*]", n],
                p
              );
            };
          if (c === "findWith")
            return (n, o) => {
              const a = l.findIndex(
                (w) => w[n] === o
              );
              if (a === -1) return;
              const d = l[a], S = [...e, a.toString()];
              return u.clear(), I++, u.clear(), I++, v(d, S);
            };
          if (c === "index")
            return (n) => {
              const o = l[n];
              return v(o, [
                ...e,
                n.toString()
              ]);
            };
          if (c === "insert")
            return (n) => (_(e), nt(
              i,
              n,
              e,
              t
            ), v(
              r.getState().cogsStateStore[t],
              []
            ));
          if (c === "uniqueInsert")
            return (n, o, a) => {
              const d = r.getState().getNestedState(t, e), S = it(n) ? n(d) : n;
              let w = null;
              if (!d.some((M) => {
                if (o) {
                  const j = o.every(
                    (q) => R(
                      M[q],
                      S[q]
                    )
                  );
                  return j && (w = M), j;
                }
                const x = R(M, S);
                return x && (w = M), x;
              }))
                _(e), nt(
                  i,
                  S,
                  e,
                  t
                );
              else if (a && w) {
                const M = a(w), x = d.map(
                  (j) => R(j, w) ? M : j
                );
                _(e), z(
                  i,
                  x,
                  e
                );
              }
            };
          if (c === "cut")
            return (n, o) => {
              o?.waitForSync || (_(e), rt(i, e, t, n));
            };
          if (c === "stateFilter")
            return (n) => {
              const o = l.map(
                (S, w) => ({
                  ...S,
                  __origIndex: w.toString()
                })
              ), a = [], d = [];
              for (let S = 0; S < o.length; S++)
                n(o[S], S) && (a.push(S), d.push(o[S]));
              return u.clear(), I++, v(
                d,
                e,
                {
                  filtered: [...p?.filtered || [], e],
                  validIndices: a
                  // Pass through the meta
                }
              );
            };
        }
        const P = e[e.length - 1];
        if (!isNaN(Number(P))) {
          const n = e.slice(0, -1), o = r.getState().getNestedState(t, n);
          if (Array.isArray(o) && c === "cut")
            return () => rt(
              i,
              n,
              t,
              Number(P)
            );
        }
        if (c === "get")
          return () => r.getState().getNestedState(t, e);
        if (c === "$derive")
          return (n) => H({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (c === "$derive")
          return (n) => H({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (c === "$get")
          return () => H({
            _stateKey: t,
            _path: e
          });
        if (c === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (c === "_selected") {
          const n = e.slice(0, -1), o = n.join("."), a = r.getState().getNestedState(t, n);
          return Array.isArray(a) ? Number(e[e.length - 1]) === E.get(o) : void 0;
        }
        if (c == "getLocalStorage")
          return (n) => ct(
            g + "-" + t + "-" + n
          );
        if (c === "setSelected")
          return (n) => {
            const o = e.slice(0, -1), a = Number(e[e.length - 1]), d = o.join(".");
            n ? E.set(d, a) : E.delete(d);
            const S = r.getState().getNestedState(t, [...o]);
            z(i, S, o), _(o);
          };
        if (e.length == 0) {
          if (c === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(t)?.validation, o = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              U(n.key);
              const a = r.getState().cogsStateStore[t];
              try {
                const d = r.getState().getValidationErrors(n.key);
                d && d.length > 0 && d.forEach(([w]) => {
                  w && w.startsWith(n.key) && U(w);
                });
                const S = n.zodSchema.safeParse(a);
                return S.success ? !0 : (S.error.errors.forEach((A) => {
                  const M = A.path, x = A.message, j = [
                    n.key,
                    ...M
                  ].join(".");
                  o(
                    j,
                    x
                  ), console.log(
                    `Validation error at ${j}: ${x}`
                  );
                }), !1);
              } catch (d) {
                return console.error(
                  "Zod schema validation failed",
                  d
                ), !1;
              }
            };
          if (c === "_componentId") return m;
          if (c === "getComponents")
            return () => r().stateComponents.get(t);
          if (c === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (c === "_serverState")
            return r.getState().serverState[t];
          if (c === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (c === "revertToInitialState")
            return y.revertToInitialState;
          if (c === "updateInitialState")
            return y.updateInitialState;
          if (c === "removeValidation")
            return y.removeValidation;
        }
        if (c === "validationWrapper")
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
              validIndices: p?.validIndices,
              children: n
            }
          );
        if (c === "_stateKey") return t;
        if (c === "_path") return e;
        if (c === "_isServerSynced") return y._isServerSynced;
        if (c === "update")
          return (n, o) => {
            if (o?.debounce)
              ft(() => {
                z(i, n, e, "");
                const a = r.getState().getNestedState(t, e);
                o?.afterUpdate && o.afterUpdate(a);
              }, o.debounce);
            else {
              z(i, n, e, "");
              const a = r.getState().getNestedState(t, e);
              o?.afterUpdate && o.afterUpdate(a);
            }
            _(e);
          };
        if (c === "formElement")
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
        const C = [...e, c], L = r.getState().getNestedState(t, C);
        return v(L, C, p);
      }
    }, s = new Proxy(y, b);
    return u.set(h, {
      proxy: s,
      stateVersion: I
    }), s;
  }
  return v(
    r.getState().getNestedState(t, [])
  );
}
function H(t) {
  return N.createElement(Vt, { proxy: t });
}
function Nt({
  proxy: t,
  effectiveSetState: i,
  componentId: m,
  rebuildStateShape: g
}) {
  const u = r().getNestedState(t._stateKey, t._path);
  return console.log("value", u), Array.isArray(u) ? g(
    u,
    t._path
  ).stateMapNoRender(
    (_, E, y, v, l) => t._mapFn(_, E, y, v, l)
  ) : null;
}
function Vt({
  proxy: t
}) {
  const i = N.useRef(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return N.useEffect(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const u = g.parentElement, _ = Array.from(u.childNodes).indexOf(g);
    let E = u.getAttribute("data-parent-id");
    E || (E = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", E));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: E,
      position: _,
      effect: t._effect
    };
    r.getState().addSignalElement(m, v);
    const l = r.getState().getNestedState(t._stateKey, t._path), e = document.createTextNode(String(l));
    g.replaceWith(e);
  }, [t._stateKey, t._path.join("."), t._effect]), N.createElement("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function Ut(t) {
  const i = N.useSyncExternalStore(
    (m) => {
      const g = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return N.createElement("text", {}, String(i));
}
export {
  H as $cogsSignal,
  Ut as $cogsSignalStore,
  Pt as createCogsState,
  $t as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
