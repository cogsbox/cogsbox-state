"use client";
import { j as et } from "./node_modules/react/jsx-runtime.jsx";
import { r as $ } from "./node_modules/react/index.js";
import { transformStateFunc as ft, isFunction as it, getNestedValue as G, isDeepEqual as R, debounce as gt } from "./utility.js";
import { pushFunc as nt, updateFn as z, cutFunc as rt, ValidationWrapper as St, FormControlComponent as mt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r } from "./store.js";
import { useCogsConfig as yt } from "./CogsStateClient.jsx";
import Q from "./node_modules/uuid/dist/esm-browser/v4.js";
function at(t, s) {
  const m = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, u = m(t) || {};
  g(t, {
    ...u,
    ...s
  });
}
function ot({
  stateKey: t,
  options: s,
  initialOptionsPart: m
}) {
  const g = X(t) || {}, u = m[t] || {}, p = r.getState().setInitialStateOptions, _ = { ...u, ...g };
  let E = !1;
  if (s)
    for (const y in s)
      _.hasOwnProperty(y) || (E = !0, _[y] = s[y]);
  E && p(t, _);
}
const Pt = (t, s) => {
  let m = t;
  const [g, u] = ft(m);
  r.getState().setInitialStates(g);
  const p = (E, y) => {
    const [v] = $.useState(y?.componentId ?? Q());
    ot({
      stateKey: E,
      options: y,
      initialOptionsPart: u
    });
    const l = r.getState().cogsStateStore[E] || g[E], e = y?.modifyState ? y.modifyState(l) : l, [I, T] = Vt(
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
    return T;
  };
  function _(E, y) {
    ot({ stateKey: E, options: y, initialOptionsPart: u });
  }
  return { useCogsState: p, setCogsOptions: _ };
}, {
  setUpdaterState: J,
  setState: k,
  getInitialOptions: X,
  getKeyState: st,
  getValidationErrors: vt,
  setStateLog: It,
  updateInitialStateGlobal: Y,
  addValidationError: pt,
  removeValidationError: U,
  setServerSyncActions: Et
} = r.getState(), ct = (t) => {
  if (!t) return null;
  try {
    const s = window.localStorage.getItem(t);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, _t = (t, s, m, g) => {
  if (m?.initState) {
    const u = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[s]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[s]
    }, p = m.initState ? `${g}-${s}-${m.initState.localStorageKey}` : s;
    window.localStorage.setItem(p, JSON.stringify(u));
  }
}, wt = (t, s, m, g, u, p) => {
  const _ = {
    initialState: s,
    updaterState: Z(
      t,
      g,
      u,
      p
    ),
    state: m
  };
  $.startTransition(() => {
    Y(t, _.initialState), J(t, _.updaterState), k(t, _.state);
  });
}, lt = (t) => {
  const s = r.getState().stateComponents.get(t);
  if (!s) return;
  const m = /* @__PURE__ */ new Set();
  s.components.forEach((g) => {
    m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    $.startTransition(() => {
      m.forEach((g) => g());
    });
  });
};
function Vt(t, {
  stateKey: s,
  serverSync: m,
  localStorage: g,
  formElements: u,
  middleware: p,
  reactiveDeps: _,
  reactiveType: E,
  componentId: y,
  initState: v,
  syncUpdate: l
} = {}) {
  const [e, I] = $.useState({}), { sessionId: T } = yt();
  let b = !s;
  const [c] = $.useState(s ?? Q()), W = r.getState().stateLog[c], i = $.useRef(/* @__PURE__ */ new Set()), P = $.useRef(y ?? Q()), C = $.useRef(null);
  C.current = X(c), $.useEffect(() => {
    if (l && l.stateKey === c && l.path?.[0]) {
      k(c, (o) => ({
        ...o,
        [l.path[0]]: l.newValue
      }));
      const a = `${l.stateKey}:${l.path.join(".")}`;
      r.getState().setSyncInfo(a, {
        timeStamp: l.timeStamp,
        userId: l.userId
      });
    }
  }, [l]), $.useEffect(() => {
    at(c, {
      initState: v
    });
    const a = ct(
      T + "-" + c + "-" + v?.localStorageKey
    );
    let o = null;
    v?.initialState && (o = v?.initialState, a && a.lastUpdated > (a.lastSyncedWithServer || 0) && (o = a.state), wt(
      c,
      v?.initialState,
      o,
      D,
      P.current,
      T
    )), lt(c);
  }, [v?.localStorageKey, ...v?.dependencies || []]), $.useLayoutEffect(() => {
    b && at(c, {
      serverSync: m,
      formElements: u,
      initState: v,
      localStorage: g,
      middleware: p
    });
    const a = `${c}////${P.current}`, o = r.getState().stateComponents.get(c) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(a, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), r.getState().stateComponents.set(c, o), () => {
      const d = `${c}////${P.current}`;
      o && (o.components.delete(d), o.components.size === 0 && r.getState().stateComponents.delete(c));
    };
  }, []);
  const D = (a, o, d, S) => {
    if (Array.isArray(o)) {
      const w = `${c}-${o.join(".")}`;
      i.current.add(w);
    }
    k(c, (w) => {
      const A = it(a) ? a(w) : a, M = `${c}-${o.join(".")}`;
      if (M) {
        let O = !1, f = r.getState().signalDomElements.get(M);
        if ((!f || f.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const N = o.slice(0, -1), h = G(A, N);
          if (Array.isArray(h)) {
            O = !0;
            const V = `${c}-${N.join(".")}`;
            f = r.getState().signalDomElements.get(V);
          }
        }
        if (f) {
          const N = O ? G(A, o.slice(0, -1)) : G(A, o);
          f.forEach(({ parentId: h, position: V, effect: L }) => {
            const F = document.querySelector(
              `[data-parent-id="${h}"]`
            );
            if (F) {
              const tt = Array.from(F.childNodes);
              if (tt[V]) {
                const ut = L ? new Function("state", `return (${L})(state)`)(N) : N;
                tt[V].textContent = String(ut);
              }
            }
          });
        }
      }
      d.updateType === "update" && (S || C.current?.validationKey) && o && U(
        (S || C.current?.validationKey) + "." + o.join(".")
      );
      const x = o.slice(0, o.length - 1);
      d.updateType === "cut" && C.current?.validationKey && U(
        C.current?.validationKey + "." + x.join(".")
      ), d.updateType === "insert" && C.current?.validationKey && vt(
        C.current?.validationKey + "." + x.join(".")
      ).filter(([f, N]) => {
        let h = f?.split(".").length;
        if (f == x.join(".") && h == x.length - 1) {
          let V = f + "." + x;
          U(f), pt(V, N);
        }
      });
      const j = G(w, o), q = G(A, o), dt = d.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), B = r.getState().stateComponents.get(c);
      if (s == "products" && (console.log("thisKey", c), console.log("stateEntry", B)), B)
        for (const [O, f] of B.components.entries()) {
          let N = !1;
          const h = Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"];
          if (!h.includes("none")) {
            if (h.includes("all")) {
              f.forceUpdate();
              continue;
            }
            if (h.includes("component") && f.paths && (f.paths.has(dt) || f.paths.has("")) && (N = !0), console.log(
              "reactiveTypes",
              O,
              f,
              h,
              N
            ), !N && h.includes("deps") && f.depsFunction) {
              const V = f.depsFunction(A);
              typeof V == "boolean" ? V && (N = !0) : R(f.deps, V) || (console.log(
                "reactiveTypes",
                f.deps,
                V,
                R(f.deps, V),
                V
              ), f.deps = V, N = !0);
            }
            N && f.forceUpdate();
          }
        }
      const K = {
        timeStamp: Date.now(),
        stateKey: c,
        path: o,
        updateType: d.updateType,
        status: "new",
        oldValue: j,
        newValue: q
      };
      if (It(c, (O) => {
        const N = [...O ?? [], K].reduce((h, V) => {
          const L = `${V.stateKey}:${JSON.stringify(V.path)}`, F = h.get(L);
          return F ? (F.timeStamp = Math.max(F.timeStamp, V.timeStamp), F.newValue = V.newValue, F.oldValue = F.oldValue ?? V.oldValue, F.updateType = V.updateType) : h.set(L, { ...V }), h;
        }, /* @__PURE__ */ new Map());
        return Array.from(N.values());
      }), _t(
        A,
        c,
        C.current,
        T
      ), p && p({
        updateLog: W,
        update: K
      }), C.current?.serverSync) {
        const O = r.getState().serverState[c], f = C.current?.serverSync;
        Et(c, {
          syncKey: typeof f.syncKey == "string" ? f.syncKey : f.syncKey({ state: A }),
          rollBackState: O,
          actionTimeStamp: Date.now() + (f.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return A;
    });
  };
  r.getState().updaterState[c] || (console.log("Initializing state for", c, t), J(
    c,
    Z(
      c,
      D,
      P.current,
      T
    )
  ), r.getState().cogsStateStore[c] || k(c, t), r.getState().initialStateGlobal[c] || Y(c, t));
  const n = $.useMemo(() => Z(
    c,
    D,
    P.current,
    T
  ), [c]);
  return [st(c), n];
}
function Z(t, s, m, g) {
  const u = /* @__PURE__ */ new Map();
  let p = 0;
  const _ = (l) => {
    const e = l.join(".");
    for (const [I] of u)
      (I === e || I.startsWith(e + ".")) && u.delete(I);
    p++;
  }, E = /* @__PURE__ */ new Map(), y = {
    removeValidation: (l) => {
      l?.validationKey && U(l.validationKey);
    },
    revertToInitialState: (l) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && U(e?.key), l?.validationKey && U(l.validationKey);
      const I = r.getState().initialStateGlobal[t];
      u.clear(), p++;
      const T = v(I, []);
      $.startTransition(() => {
        J(t, T), k(t, I);
        const b = r.getState().stateComponents.get(t);
        b && b.components.forEach((W) => {
          W.forceUpdate();
        });
        const c = X(t);
        c?.initState && localStorage.removeItem(
          c?.initState ? g + "-" + t + "-" + c?.initState.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (l) => {
      u.clear(), p++;
      const e = Z(
        t,
        s,
        m,
        g
      );
      return $.startTransition(() => {
        Y(t, l), J(t, e), k(t, l);
        const I = r.getState().stateComponents.get(t);
        I && I.components.forEach((T) => {
          T.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (I) => e.get()[I]
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
  function v(l, e = [], I) {
    const T = e.map(String).join(".");
    u.get(T);
    const b = {
      get(W, i) {
        if (i !== "then" && !i.startsWith("$") && i !== "stateMapNoRender") {
          const n = e.join("."), a = `${t}////${m}`, o = r.getState().stateComponents.get(t);
          if (o) {
            const d = o.components.get(a);
            d && (e.length > 0 || i === "get") && d.paths.add(n);
          }
        }
        if (i === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(t)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            const a = r.getState().getValidationErrors(n.key);
            return console.log("errors222222222222222222", a), a;
          };
        if (Array.isArray(l)) {
          if (i === "getSelected")
            return () => {
              const n = E.get(e.join("."));
              if (n !== void 0)
                return v(
                  l[n],
                  [...e, n.toString()],
                  I
                );
            };
          if (i === "stateMap" || i === "stateMapNoRender")
            return (n) => {
              const a = I?.filtered?.some(
                (d) => d.join(".") === e.join(".")
              ), o = a ? l : r.getState().getNestedState(t, e);
              return i !== "stateMapNoRender" && (u.clear(), p++), o.map((d, S) => {
                const w = a && d.__origIndex ? d.__origIndex : S, A = v(
                  d,
                  [...e, w.toString()],
                  I
                );
                return n(
                  d,
                  A,
                  S,
                  l,
                  v(l, e, I)
                );
              });
            };
          if (i === "$stateMap")
            return (n) => $.createElement($t, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              effectiveSetState: s,
              componentId: m,
              rebuildStateShape: v
            });
          if (i === "stateFlattenOn")
            return (n) => {
              const o = I?.filtered?.some(
                (S) => S.join(".") === e.join(".")
              ) ? l : r.getState().getNestedState(t, e);
              u.clear(), p++;
              const d = o.flatMap(
                (S, w) => S[n] ?? []
              );
              return v(
                d,
                [...e, "[*]", n],
                I
              );
            };
          if (i === "findWith")
            return (n, a) => {
              const o = l.findIndex(
                (w) => w[n] === a
              );
              if (o === -1) return;
              const d = l[o], S = [...e, o.toString()];
              return u.clear(), p++, u.clear(), p++, v(d, S);
            };
          if (i === "index")
            return (n) => {
              const a = l[n];
              return v(a, [...e, n.toString()]);
            };
          if (i === "insert")
            return (n) => (_(e), nt(s, n, e, t), v(
              r.getState().cogsStateStore[t],
              []
            ));
          if (i === "uniqueInsert")
            return (n, a, o) => {
              const d = r.getState().getNestedState(t, e), S = it(n) ? n(d) : n;
              let w = null;
              if (!d.some((M) => {
                if (a) {
                  const j = a.every(
                    (q) => R(M[q], S[q])
                  );
                  return j && (w = M), j;
                }
                const x = R(M, S);
                return x && (w = M), x;
              }))
                _(e), nt(s, S, e, t);
              else if (o && w) {
                const M = o(w), x = d.map(
                  (j) => R(j, w) ? M : j
                );
                _(e), z(s, x, e);
              }
            };
          if (i === "cut")
            return (n, a) => {
              a?.waitForSync || (_(e), rt(s, e, t, n));
            };
          if (i === "stateFilter")
            return (n) => {
              const a = l.map((S, w) => ({
                ...S,
                __origIndex: w.toString()
              })), o = [], d = [];
              for (let S = 0; S < a.length; S++)
                n(a[S], S) && (o.push(S), d.push(a[S]));
              return u.clear(), p++, v(d, e, {
                filtered: [...I?.filtered || [], e],
                validIndices: o
                // Pass through the meta
              });
            };
        }
        const P = e[e.length - 1];
        if (!isNaN(Number(P))) {
          const n = e.slice(0, -1), a = r.getState().getNestedState(t, n);
          if (Array.isArray(a) && i === "cut")
            return () => rt(
              s,
              n,
              t,
              Number(P)
            );
        }
        if (i === "get")
          return () => r.getState().getNestedState(t, e);
        if (i === "$derive")
          return (n) => H({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (i === "$derive")
          return (n) => H({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (i === "$get")
          return () => H({
            _stateKey: t,
            _path: e
          });
        if (i === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (i === "_selected") {
          const n = e.slice(0, -1), a = n.join("."), o = r.getState().getNestedState(t, n);
          return Array.isArray(o) ? Number(e[e.length - 1]) === E.get(a) : void 0;
        }
        if (i == "getLocalStorage")
          return (n) => ct(g + "-" + t + "-" + n);
        if (i === "setSelected")
          return (n) => {
            const a = e.slice(0, -1), o = Number(e[e.length - 1]), d = a.join(".");
            n ? E.set(d, o) : E.delete(d);
            const S = r.getState().getNestedState(t, [...a]);
            z(s, S, a), _(a);
          };
        if (e.length == 0) {
          if (i === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(t)?.validation, a = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              U(n.key);
              const o = r.getState().cogsStateStore[t];
              try {
                const d = r.getState().getValidationErrors(n.key);
                d && d.length > 0 && d.forEach(([w]) => {
                  w && w.startsWith(n.key) && U(w);
                });
                const S = n.zodSchema.safeParse(o);
                return S.success ? !0 : (S.error.errors.forEach((A) => {
                  const M = A.path, x = A.message, j = [n.key, ...M].join(".");
                  a(j, x), console.log(
                    `Validation error at ${j}: ${x}`
                  );
                }), lt(t), !1);
              } catch (d) {
                return console.error("Zod schema validation failed", d), !1;
              }
            };
          if (i === "_componentId") return m;
          if (i === "getComponents")
            return () => r().stateComponents.get(t);
          if (i === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (i === "_serverState")
            return r.getState().serverState[t];
          if (i === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (i === "revertToInitialState")
            return y.revertToInitialState;
          if (i === "updateInitialState") return y.updateInitialState;
          if (i === "removeValidation") return y.removeValidation;
        }
        if (i === "validationWrapper")
          return ({
            children: n,
            hideMessage: a
          }) => /* @__PURE__ */ et.jsx(
            St,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: I?.validIndices,
              children: n
            }
          );
        if (i === "_stateKey") return t;
        if (i === "_path") return e;
        if (i === "_isServerSynced") return y._isServerSynced;
        if (i === "update")
          return (n, a) => {
            if (a?.debounce)
              gt(() => {
                z(s, n, e, "");
                const o = r.getState().getNestedState(t, e);
                a?.afterUpdate && a.afterUpdate(o);
              }, a.debounce);
            else {
              z(s, n, e, "");
              const o = r.getState().getNestedState(t, e);
              a?.afterUpdate && a.afterUpdate(o);
            }
            _(e);
          };
        if (i === "formElement")
          return (n, a) => /* @__PURE__ */ et.jsx(
            mt,
            {
              setState: s,
              stateKey: t,
              path: e,
              child: n,
              formOpts: a
            }
          );
        const C = [...e, i], D = r.getState().getNestedState(t, C);
        return v(D, C, I);
      }
    }, c = new Proxy(y, b);
    return u.set(T, {
      proxy: c,
      stateVersion: p
    }), c;
  }
  return v(
    r.getState().getNestedState(t, [])
  );
}
function H(t) {
  return $.createElement(Nt, { proxy: t });
}
function $t({
  proxy: t,
  effectiveSetState: s,
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
function Nt({
  proxy: t
}) {
  const s = $.useRef(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return $.useEffect(() => {
    const g = s.current;
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
  }, [t._stateKey, t._path.join("."), t._effect]), $.createElement("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function Ut(t) {
  const s = $.useSyncExternalStore(
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
  return $.createElement("text", {}, String(s));
}
export {
  H as $cogsSignal,
  Ut as $cogsSignalStore,
  Pt as createCogsState,
  Vt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
