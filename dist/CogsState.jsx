"use client";
import { j as et } from "./node_modules/react/jsx-runtime.jsx";
import { r as _ } from "./node_modules/react/index.js";
import { transformStateFunc as gt, isFunction as st, getNestedValue as L, isDeepEqual as G, debounce as St } from "./utility.js";
import { pushFunc as nt, updateFn as z, cutFunc as rt, ValidationWrapper as mt, FormControlComponent as yt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as a, formRefStore as at } from "./store.js";
import { useCogsConfig as vt } from "./CogsStateClient.jsx";
import Q from "./node_modules/uuid/dist/esm-browser/v4.js";
function ot(t, i) {
  const f = a.getState().getInitialOptions, S = a.getState().setInitialStateOptions, g = f(t) || {};
  S(t, {
    ...g,
    ...i
  });
}
function it({
  stateKey: t,
  options: i,
  initialOptionsPart: f
}) {
  const S = X(t) || {}, g = f[t] || {}, I = a.getState().setInitialStateOptions, E = { ...g, ...S };
  let p = !1;
  if (i)
    for (const m in i)
      E.hasOwnProperty(m) || (p = !0, E[m] = i[m]);
  p && I(t, E);
}
const bt = (t, i) => {
  let f = t;
  const [S, g] = gt(f);
  a.getState().setInitialStates(S);
  const I = (p, m) => {
    const [w] = _.useState(m?.componentId ?? Q());
    it({
      stateKey: p,
      options: m,
      initialOptionsPart: g
    });
    const l = a.getState().cogsStateStore[p] || S[p], e = m?.modifyState ? m.modifyState(l) : l, [v, T] = Nt(
      e,
      {
        stateKey: p,
        syncUpdate: m?.syncUpdate,
        componentId: w,
        localStorage: m?.localStorage,
        middleware: m?.middleware,
        enabledSync: m?.enabledSync,
        reactiveType: m?.reactiveType,
        reactiveDeps: m?.reactiveDeps,
        initState: m?.initState,
        localStorageKey: m?.localStorageKey
      }
    );
    return T;
  };
  function E(p, m) {
    it({ stateKey: p, options: m, initialOptionsPart: g });
  }
  return { useCogsState: I, setCogsOptions: E };
}, {
  setUpdaterState: J,
  setState: k,
  getInitialOptions: X,
  getKeyState: ct,
  getValidationErrors: It,
  setStateLog: pt,
  updateInitialStateGlobal: Y,
  addValidationError: Et,
  removeValidationError: P,
  setServerSyncActions: _t
} = a.getState(), lt = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, wt = (t, i, f, S) => {
  if (f.localStorageKey) {
    const g = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: a.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: a.getState().serverState[i]
    }, I = f.initState ? `${S}-${i}-${f.localStorageKey}` : i;
    window.localStorage.setItem(I, JSON.stringify(g));
  }
}, $t = (t, i, f, S, g, I) => {
  const E = {
    initialState: i,
    updaterState: B(
      t,
      S,
      g,
      I
    ),
    state: f
  };
  _.startTransition(() => {
    Y(t, E.initialState), J(t, E.updaterState), k(t, E.state);
  });
}, Vt = (t) => {
  const i = a.getState().stateComponents.get(t);
  if (!i) return;
  const f = /* @__PURE__ */ new Set();
  i.components.forEach((S) => {
    f.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    _.startTransition(() => {
      f.forEach((S) => S());
    });
  });
}, Pt = (t, i) => {
  const f = a.getState().stateComponents.get(t);
  if (f) {
    const S = `${t}////${i}`, g = f.components.get(S);
    g && g.forceUpdate();
  }
};
function Nt(t, {
  stateKey: i,
  serverSync: f,
  localStorage: S,
  formElements: g,
  middleware: I,
  reactiveDeps: E,
  reactiveType: p,
  componentId: m,
  localStorageKey: w,
  initState: l,
  syncUpdate: e
} = {}) {
  const [v, T] = _.useState({}), { sessionId: j } = vt();
  let O = !i;
  const [d] = _.useState(i ?? Q()), o = a.getState().stateLog[d], W = _.useRef(/* @__PURE__ */ new Set()), U = _.useRef(m ?? Q()), F = _.useRef(null);
  F.current = X(d), _.useEffect(() => {
    if (e && e.stateKey === d && e.path?.[0]) {
      k(d, (r) => ({
        ...r,
        [e.path[0]]: e.newValue
      }));
      const c = `${e.stateKey}:${e.path.join(".")}`;
      a.getState().setSyncInfo(c, {
        timeStamp: e.timeStamp,
        userId: e.userId
      });
    }
  }, [e]), _.useEffect(() => {
    ot(d, {
      initState: l
    });
    let c = null;
    w && (c = lt(
      j + "-" + d + "-" + w
    ));
    let r = null;
    l?.initialState && (r = l?.initialState, console.log("newState", r), c && c.lastUpdated > (c.lastSyncedWithServer || 0) && (r = c.state), $t(
      d,
      l?.initialState,
      r,
      n,
      U.current,
      j
    ), console.log("newState222", r), T({}));
  }, [w, ...l?.dependencies || []]), _.useLayoutEffect(() => {
    O && ot(d, {
      serverSync: f,
      formElements: g,
      initState: l,
      localStorage: S,
      middleware: I
    });
    const c = `${d}////${U.current}`, r = a.getState().stateComponents.get(d) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(c, {
      forceUpdate: () => T({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), a.getState().stateComponents.set(d, r), T({}), () => {
      const u = `${d}////${U.current}`;
      r && (r.components.delete(u), r.components.size === 0 && a.getState().stateComponents.delete(d));
    };
  }, []);
  const n = (c, r, u, $) => {
    if (Array.isArray(r)) {
      const M = `${d}-${r.join(".")}`;
      W.current.add(M);
    }
    k(d, (M) => {
      const N = st(c) ? c(M) : c, R = `${d}-${r.join(".")}`;
      if (R) {
        let b = !1, y = a.getState().signalDomElements.get(R);
        if ((!y || y.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const h = r.slice(0, -1), A = L(N, h);
          if (Array.isArray(A)) {
            b = !0;
            const V = `${d}-${h.join(".")}`;
            y = a.getState().signalDomElements.get(V);
          }
        }
        if (y) {
          const h = b ? L(N, r.slice(0, -1)) : L(N, r);
          y.forEach(({ parentId: A, position: V, effect: D }) => {
            const x = document.querySelector(
              `[data-parent-id="${A}"]`
            );
            if (x) {
              const tt = Array.from(x.childNodes);
              if (tt[V]) {
                const ft = D ? new Function("state", `return (${D})(state)`)(h) : h;
                tt[V].textContent = String(ft);
              }
            }
          });
        }
      }
      u.updateType === "update" && ($ || F.current?.validationKey) && r && P(
        ($ || F.current?.validationKey) + "." + r.join(".")
      );
      const C = r.slice(0, r.length - 1);
      u.updateType === "cut" && F.current?.validationKey && P(
        F.current?.validationKey + "." + C.join(".")
      ), u.updateType === "insert" && F.current?.validationKey && It(
        F.current?.validationKey + "." + C.join(".")
      ).filter(([y, h]) => {
        let A = y?.split(".").length;
        if (y == C.join(".") && A == C.length - 1) {
          let V = y + "." + C;
          P(y), Et(V, h);
        }
      });
      const q = L(M, r), dt = L(N, r), ut = u.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), Z = a.getState().stateComponents.get(d);
      if (i == "cart" && (console.log("thisKey", d), console.log("stateEntry", Z)), Z)
        for (const [b, y] of Z.components.entries()) {
          let h = !1;
          const A = Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"];
          if (!A.includes("none")) {
            if (A.includes("all")) {
              y.forceUpdate();
              continue;
            }
            if (A.includes("component") && y.paths && (y.paths.has(ut) || y.paths.has("")) && (h = !0), !h && A.includes("deps") && y.depsFunction) {
              const V = y.depsFunction(N);
              typeof V == "boolean" ? V && (h = !0) : G(y.deps, V) || (y.deps = V, h = !0);
            }
            h && y.forceUpdate();
          }
        }
      const K = {
        timeStamp: Date.now(),
        stateKey: d,
        path: r,
        updateType: u.updateType,
        status: "new",
        oldValue: q,
        newValue: dt
      };
      if (pt(d, (b) => {
        const h = [...b ?? [], K].reduce((A, V) => {
          const D = `${V.stateKey}:${JSON.stringify(V.path)}`, x = A.get(D);
          return x ? (x.timeStamp = Math.max(x.timeStamp, V.timeStamp), x.newValue = V.newValue, x.oldValue = x.oldValue ?? V.oldValue, x.updateType = V.updateType) : A.set(D, { ...V }), A;
        }, /* @__PURE__ */ new Map());
        return Array.from(h.values());
      }), wt(
        N,
        d,
        F.current,
        j
      ), I && I({
        updateLog: o,
        update: K
      }), F.current?.serverSync) {
        const b = a.getState().serverState[d], y = F.current?.serverSync;
        _t(d, {
          syncKey: typeof y.syncKey == "string" ? y.syncKey : y.syncKey({ state: N }),
          rollBackState: b,
          actionTimeStamp: Date.now() + (y.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return N;
    });
  };
  a.getState().updaterState[d] || (console.log("Initializing state for", d, t), J(
    d,
    B(
      d,
      n,
      U.current,
      j
    )
  ), a.getState().cogsStateStore[d] || k(d, t), a.getState().initialStateGlobal[d] || Y(d, t));
  const s = _.useMemo(() => B(
    d,
    n,
    U.current,
    j
  ), [d]);
  return [ct(d), s];
}
function B(t, i, f, S) {
  const g = /* @__PURE__ */ new Map();
  let I = 0;
  const E = (l) => {
    const e = l.join(".");
    for (const [v] of g)
      (v === e || v.startsWith(e + ".")) && g.delete(v);
    I++;
  }, p = /* @__PURE__ */ new Map(), m = {
    removeValidation: (l) => {
      l?.validationKey && P(l.validationKey);
    },
    revertToInitialState: (l) => {
      const e = a.getState().getInitialOptions(t)?.validation;
      e?.key && P(e?.key), l?.validationKey && P(l.validationKey);
      const v = a.getState().initialStateGlobal[t];
      g.clear(), I++;
      const T = w(v, []);
      _.startTransition(() => {
        J(t, T), k(t, v);
        const j = a.getState().stateComponents.get(t);
        j && j.components.forEach((d) => {
          d.forceUpdate();
        });
        const O = X(t);
        O?.localStorageKey && localStorage.removeItem(
          O?.initState ? S + "-" + t + "-" + O?.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (l) => {
      g.clear(), I++;
      const e = B(
        t,
        i,
        f,
        S
      );
      return _.startTransition(() => {
        Y(t, l), J(t, e), k(t, l);
        const v = a.getState().stateComponents.get(t);
        v && v.components.forEach((T) => {
          T.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (v) => e.get()[v]
      };
    },
    _initialState: a.getState().initialStateGlobal[t],
    _serverState: a.getState().serverState[t],
    _isLoading: a.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const l = a.getState().serverState[t];
      return !!(l && G(l, ct(t)));
    }
  };
  function w(l, e = [], v) {
    const T = e.map(String).join(".");
    g.get(T);
    const j = {
      get(d, o) {
        if (o !== "then" && !o.startsWith("$") && o !== "stateMapNoRender") {
          const n = e.join("."), s = `${t}////${f}`, c = a.getState().stateComponents.get(t);
          if (c) {
            const r = c.components.get(s);
            r && (e.length > 0 || o === "get") && r.paths.add(n);
          }
        }
        if (o === "showValidationErrors")
          return () => {
            const n = a.getState().getInitialOptions(t)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return a.getState().getValidationErrors(n.key + "." + e.join("."));
          };
        if (Array.isArray(l)) {
          if (o === "getSelected")
            return () => {
              const n = p.get(e.join("."));
              if (n !== void 0)
                return w(
                  l[n],
                  [...e, n.toString()],
                  v
                );
            };
          if (o === "stateMap" || o === "stateMapNoRender")
            return (n) => {
              const s = v?.filtered?.some(
                (r) => r.join(".") === e.join(".")
              ), c = s ? l : a.getState().getNestedState(t, e);
              return o !== "stateMapNoRender" && (g.clear(), I++), c.map((r, u) => {
                const $ = s && r.__origIndex ? r.__origIndex : u, M = w(
                  r,
                  [...e, $.toString()],
                  v
                );
                return n(
                  r,
                  M,
                  u,
                  l,
                  w(l, e, v)
                );
              });
            };
          if (o === "$stateMap")
            return (n) => _.createElement(ht, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: w
            });
          if (o === "stateFlattenOn")
            return (n) => {
              const c = v?.filtered?.some(
                (u) => u.join(".") === e.join(".")
              ) ? l : a.getState().getNestedState(t, e);
              g.clear(), I++;
              const r = c.flatMap(
                (u, $) => u[n] ?? []
              );
              return w(
                r,
                [...e, "[*]", n],
                v
              );
            };
          if (o === "findWith")
            return (n, s) => {
              const c = l.findIndex(
                ($) => $[n] === s
              );
              if (c === -1) return;
              const r = l[c], u = [...e, c.toString()];
              return g.clear(), I++, g.clear(), I++, w(r, u);
            };
          if (o === "index")
            return (n) => {
              const s = l[n];
              return w(s, [...e, n.toString()]);
            };
          if (o === "insert")
            return (n) => (E(e), nt(i, n, e, t), w(
              a.getState().cogsStateStore[t],
              []
            ));
          if (o === "uniqueInsert")
            return (n, s, c) => {
              const r = a.getState().getNestedState(t, e), u = st(n) ? n(r) : n;
              let $ = null;
              if (!r.some((N) => {
                if (s) {
                  const C = s.every(
                    (q) => G(N[q], u[q])
                  );
                  return C && ($ = N), C;
                }
                const R = G(N, u);
                return R && ($ = N), R;
              }))
                E(e), nt(i, u, e, t);
              else if (c && $) {
                const N = c($), R = r.map(
                  (C) => G(C, $) ? N : C
                );
                E(e), z(i, R, e);
              }
            };
          if (o === "cut")
            return (n, s) => {
              s?.waitForSync || (E(e), rt(i, e, t, n));
            };
          if (o === "stateFilter")
            return (n) => {
              const s = l.map((u, $) => ({
                ...u,
                __origIndex: $.toString()
              })), c = [], r = [];
              for (let u = 0; u < s.length; u++)
                n(s[u], u) && (c.push(u), r.push(s[u]));
              return g.clear(), I++, w(r, e, {
                filtered: [...v?.filtered || [], e],
                validIndices: c
                // Pass through the meta
              });
            };
        }
        const W = e[e.length - 1];
        if (!isNaN(Number(W))) {
          const n = e.slice(0, -1), s = a.getState().getNestedState(t, n);
          if (Array.isArray(s) && o === "cut")
            return () => rt(
              i,
              n,
              t,
              Number(W)
            );
        }
        if (o === "get")
          return () => a.getState().getNestedState(t, e);
        if (o === "$derive")
          return (n) => H({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (o === "$derive")
          return (n) => H({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (o === "$get")
          return () => H({
            _stateKey: t,
            _path: e
          });
        if (o === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return a.getState().getSyncInfo(n);
        }
        if (o === "_selected") {
          const n = e.slice(0, -1), s = n.join("."), c = a.getState().getNestedState(t, n);
          return Array.isArray(c) ? Number(e[e.length - 1]) === p.get(s) : void 0;
        }
        if (o == "getLocalStorage")
          return (n) => lt(S + "-" + t + "-" + n);
        if (o === "setSelected")
          return (n) => {
            const s = e.slice(0, -1), c = Number(e[e.length - 1]), r = s.join(".");
            n ? p.set(r, c) : p.delete(r);
            const u = a.getState().getNestedState(t, [...s]);
            z(i, u, s), E(s);
          };
        if (e.length == 0) {
          if (o === "validateZodSchema")
            return () => {
              const n = a.getState().getInitialOptions(t)?.validation, s = a.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              P(n.key);
              const c = a.getState().cogsStateStore[t];
              try {
                const r = a.getState().getValidationErrors(n.key);
                r && r.length > 0 && r.forEach(([$]) => {
                  $ && $.startsWith(n.key) && P($);
                });
                const u = n.zodSchema.safeParse(c);
                return u.success ? !0 : (u.error.errors.forEach((M) => {
                  const N = M.path, R = M.message, C = [n.key, ...N].join(".");
                  s(C, R), console.log(
                    `Validation error at ${C}: ${R}`
                  );
                }), Vt(t), !1);
              } catch (r) {
                return console.error("Zod schema validation failed", r), !1;
              }
            };
          if (o === "_componentId") return f;
          if (o === "getComponents")
            return () => a().stateComponents.get(t);
          if (o === "getAllFormRefs")
            return () => at.getState().getFormRefsByStateKey(t);
          if (o === "_initialState")
            return a.getState().initialStateGlobal[t];
          if (o === "_serverState")
            return a.getState().serverState[t];
          if (o === "_isLoading")
            return a.getState().isLoadingGlobal[t];
          if (o === "revertToInitialState")
            return m.revertToInitialState;
          if (o === "updateInitialState") return m.updateInitialState;
          if (o === "removeValidation") return m.removeValidation;
        }
        if (o === "getFormRef")
          return () => at.getState().getFormRef(t + "." + e.join("."));
        if (o === "validationWrapper")
          return ({
            children: n,
            hideMessage: s
          }) => /* @__PURE__ */ et.jsx(
            mt,
            {
              formOpts: s ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: a.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: v?.validIndices,
              children: n
            }
          );
        if (o === "_stateKey") return t;
        if (o === "_path") return e;
        if (o === "_isServerSynced") return m._isServerSynced;
        if (o === "update")
          return (n, s) => {
            if (s?.debounce)
              St(() => {
                z(i, n, e, "");
                const c = a.getState().getNestedState(t, e);
                s?.afterUpdate && s.afterUpdate(c);
              }, s.debounce);
            else {
              z(i, n, e, "");
              const c = a.getState().getNestedState(t, e);
              s?.afterUpdate && s.afterUpdate(c);
            }
            E(e);
          };
        if (o === "formElement")
          return (n, s) => /* @__PURE__ */ et.jsx(
            yt,
            {
              setState: i,
              stateKey: t,
              path: e,
              child: n,
              formOpts: s
            }
          );
        const U = [...e, o], F = a.getState().getNestedState(t, U);
        return w(F, U, v);
      }
    }, O = new Proxy(m, j);
    return g.set(T, {
      proxy: O,
      stateVersion: I
    }), O;
  }
  return w(
    a.getState().getNestedState(t, [])
  );
}
function H(t) {
  return _.createElement(Tt, { proxy: t });
}
function ht({
  proxy: t,
  rebuildStateShape: i
}) {
  const f = a().getNestedState(t._stateKey, t._path);
  return console.log("value", f), Array.isArray(f) ? i(
    f,
    t._path
  ).stateMapNoRender(
    (g, I, E, p, m) => t._mapFn(g, I, E, p, m)
  ) : null;
}
function Tt({
  proxy: t
}) {
  const i = _.useRef(null), f = `${t._stateKey}-${t._path.join(".")}`;
  return _.useEffect(() => {
    const S = i.current;
    if (!S || !S.parentElement) return;
    const g = S.parentElement, E = Array.from(g.childNodes).indexOf(S);
    let p = g.getAttribute("data-parent-id");
    p || (p = `parent-${crypto.randomUUID()}`, g.setAttribute("data-parent-id", p));
    const w = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: p,
      position: E,
      effect: t._effect
    };
    a.getState().addSignalElement(f, w);
    const l = a.getState().getNestedState(t._stateKey, t._path);
    let e;
    if (t._effect)
      try {
        e = new Function(
          "state",
          `return (${t._effect})(state)`
        )(l);
      } catch (T) {
        console.error("Error evaluating effect function during mount:", T), e = l;
      }
    else
      e = l;
    e !== null && typeof e == "object" && (e = JSON.stringify(e));
    const v = document.createTextNode(String(e));
    S.replaceWith(v);
  }, [t._stateKey, t._path.join("."), t._effect]), _.createElement("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": f
  });
}
function kt(t) {
  const i = _.useSyncExternalStore(
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
  return _.createElement("text", {}, String(i));
}
export {
  H as $cogsSignal,
  kt as $cogsSignalStore,
  bt as createCogsState,
  Pt as notifyComponent,
  Nt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
