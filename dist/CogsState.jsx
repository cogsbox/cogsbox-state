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
  const f = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, S = f(t) || {};
  g(t, {
    ...S,
    ...s
  });
}
function ot({
  stateKey: t,
  options: s,
  initialOptionsPart: f
}) {
  const g = X(t) || {}, S = f[t] || {}, I = r.getState().setInitialStateOptions, _ = { ...S, ...g };
  let E = !1;
  if (s)
    for (const y in s)
      _.hasOwnProperty(y) || (E = !0, _[y] = s[y]);
  E && I(t, _);
}
const Pt = (t, s) => {
  let f = t;
  const [g, S] = ft(f);
  r.getState().setInitialStates(g);
  const I = (E, y) => {
    const [v] = $.useState(y?.componentId ?? Q());
    ot({
      stateKey: E,
      options: y,
      initialOptionsPart: S
    });
    const l = r.getState().cogsStateStore[E] || g[E], e = y?.modifyState ? y.modifyState(l) : l, [p, h] = Vt(
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
    ot({ stateKey: E, options: y, initialOptionsPart: S });
  }
  return { useCogsState: I, setCogsOptions: _ };
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
}, _t = (t, s, f, g) => {
  if (f?.initState) {
    const S = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[s]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[s]
    }, I = f.initState ? `${g}-${s}-${f.initState.localStorageKey}` : s;
    window.localStorage.setItem(I, JSON.stringify(S));
  }
}, wt = (t, s, f, g, S, I) => {
  const _ = {
    initialState: s,
    updaterState: Z(
      t,
      g,
      S,
      I
    ),
    state: f
  };
  $.startTransition(() => {
    Y(t, _.initialState), J(t, _.updaterState), k(t, _.state);
  });
}, lt = (t) => {
  const s = r.getState().stateComponents.get(t);
  if (!s) return;
  const f = /* @__PURE__ */ new Set();
  s.components.forEach((g) => {
    f.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    $.startTransition(() => {
      f.forEach((g) => g());
    });
  });
};
function Vt(t, {
  stateKey: s,
  serverSync: f,
  localStorage: g,
  formElements: S,
  middleware: I,
  reactiveDeps: _,
  reactiveType: E,
  componentId: y,
  initState: v,
  syncUpdate: l
} = {}) {
  const [e, p] = $.useState({}), { sessionId: h } = yt();
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
      h + "-" + c + "-" + v?.localStorageKey
    );
    let o = null;
    v?.initialState && (o = v?.initialState, a && a.lastUpdated > (a.lastSyncedWithServer || 0) && (o = a.state), wt(
      c,
      v?.initialState,
      o,
      D,
      P.current,
      h
    )), lt(c);
  }, [v?.localStorageKey, ...v?.dependencies || []]), $.useLayoutEffect(() => {
    b && at(c, {
      serverSync: f,
      formElements: S,
      initState: v,
      localStorage: g,
      middleware: I
    });
    const a = `${c}////${P.current}`, o = r.getState().stateComponents.get(c) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(a, {
      forceUpdate: () => p({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), r.getState().stateComponents.set(c, o), () => {
      const d = `${c}////${P.current}`;
      o && (o.components.delete(d), o.components.size === 0 && r.getState().stateComponents.delete(c));
    };
  }, []);
  const D = (a, o, d, m) => {
    if (Array.isArray(o)) {
      const w = `${c}-${o.join(".")}`;
      i.current.add(w);
    }
    k(c, (w) => {
      const A = it(a) ? a(w) : a, x = `${c}-${o.join(".")}`;
      if (x) {
        let O = !1, u = r.getState().signalDomElements.get(x);
        if ((!u || u.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const N = o.slice(0, -1), T = G(A, N);
          if (Array.isArray(T)) {
            O = !0;
            const V = `${c}-${N.join(".")}`;
            u = r.getState().signalDomElements.get(V);
          }
        }
        if (u) {
          const N = O ? G(A, o.slice(0, -1)) : G(A, o);
          u.forEach(({ parentId: T, position: V, effect: L }) => {
            const F = document.querySelector(
              `[data-parent-id="${T}"]`
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
      d.updateType === "update" && (m || C.current?.validationKey) && o && U(
        (m || C.current?.validationKey) + "." + o.join(".")
      );
      const j = o.slice(0, o.length - 1);
      d.updateType === "cut" && C.current?.validationKey && U(
        C.current?.validationKey + "." + j.join(".")
      ), d.updateType === "insert" && C.current?.validationKey && vt(
        C.current?.validationKey + "." + j.join(".")
      ).filter(([u, N]) => {
        let T = u?.split(".").length;
        if (u == j.join(".") && T == j.length - 1) {
          let V = u + "." + j;
          U(u), pt(V, N);
        }
      });
      const M = G(w, o), q = G(A, o), dt = d.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), B = r.getState().stateComponents.get(c);
      if (s == "products" && (console.log("thisKey", c), console.log("stateEntry", B)), B)
        for (const [O, u] of B.components.entries()) {
          let N = !1;
          const T = Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"];
          if (!T.includes("none")) {
            if (T.includes("all")) {
              u.forceUpdate();
              continue;
            }
            if (T.includes("component") && u.paths && (u.paths.has(dt) || u.paths.has("")) && (N = !0), console.log(
              "reactiveTypes",
              O,
              u,
              T,
              N
            ), !N && T.includes("deps") && u.depsFunction) {
              const V = u.depsFunction(A);
              typeof V == "boolean" ? V && (N = !0) : R(u.deps, V) || (console.log(
                "reactiveTypes",
                u.deps,
                V,
                R(u.deps, V),
                V
              ), u.deps = V, N = !0);
            }
            N && u.forceUpdate();
          }
        }
      const K = {
        timeStamp: Date.now(),
        stateKey: c,
        path: o,
        updateType: d.updateType,
        status: "new",
        oldValue: M,
        newValue: q
      };
      if (It(c, (O) => {
        const N = [...O ?? [], K].reduce((T, V) => {
          const L = `${V.stateKey}:${JSON.stringify(V.path)}`, F = T.get(L);
          return F ? (F.timeStamp = Math.max(F.timeStamp, V.timeStamp), F.newValue = V.newValue, F.oldValue = F.oldValue ?? V.oldValue, F.updateType = V.updateType) : T.set(L, { ...V }), T;
        }, /* @__PURE__ */ new Map());
        return Array.from(N.values());
      }), _t(
        A,
        c,
        C.current,
        h
      ), I && I({
        updateLog: W,
        update: K
      }), C.current?.serverSync) {
        const O = r.getState().serverState[c], u = C.current?.serverSync;
        Et(c, {
          syncKey: typeof u.syncKey == "string" ? u.syncKey : u.syncKey({ state: A }),
          rollBackState: O,
          actionTimeStamp: Date.now() + (u.debounce ?? 3e3),
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
      h
    )
  ), r.getState().cogsStateStore[c] || k(c, t), r.getState().initialStateGlobal[c] || Y(c, t));
  const n = $.useMemo(() => Z(
    c,
    D,
    P.current,
    h
  ), [c]);
  return [st(c), n];
}
function Z(t, s, f, g) {
  const S = /* @__PURE__ */ new Map();
  let I = 0;
  const _ = (l) => {
    const e = l.join(".");
    for (const [p] of S)
      (p === e || p.startsWith(e + ".")) && S.delete(p);
    I++;
  }, E = /* @__PURE__ */ new Map(), y = {
    removeValidation: (l) => {
      l?.validationKey && U(l.validationKey);
    },
    revertToInitialState: (l) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && U(e?.key), l?.validationKey && U(l.validationKey);
      const p = r.getState().initialStateGlobal[t];
      S.clear(), I++;
      const h = v(p, []);
      $.startTransition(() => {
        J(t, h), k(t, p);
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
      S.clear(), I++;
      const e = Z(
        t,
        s,
        f,
        g
      );
      return $.startTransition(() => {
        Y(t, l), J(t, e), k(t, l);
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
    S.get(h);
    const b = {
      get(W, i) {
        if (i !== "then" && !i.startsWith("$") && i !== "stateMapNoRender") {
          const n = e.join("."), a = `${t}////${f}`, o = r.getState().stateComponents.get(t);
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
            return r.getState().getValidationErrors(n.key + "." + e.join("."));
          };
        if (Array.isArray(l)) {
          if (i === "getSelected")
            return () => {
              const n = E.get(e.join("."));
              if (n !== void 0)
                return v(
                  l[n],
                  [...e, n.toString()],
                  p
                );
            };
          if (i === "stateMap" || i === "stateMapNoRender")
            return (n) => {
              const a = p?.filtered?.some(
                (d) => d.join(".") === e.join(".")
              ), o = a ? l : r.getState().getNestedState(t, e);
              return i !== "stateMapNoRender" && (S.clear(), I++), o.map((d, m) => {
                const w = a && d.__origIndex ? d.__origIndex : m, A = v(
                  d,
                  [...e, w.toString()],
                  p
                );
                return n(
                  d,
                  A,
                  m,
                  l,
                  v(l, e, p)
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
              rebuildStateShape: v
            });
          if (i === "stateFlattenOn")
            return (n) => {
              const o = p?.filtered?.some(
                (m) => m.join(".") === e.join(".")
              ) ? l : r.getState().getNestedState(t, e);
              S.clear(), I++;
              const d = o.flatMap(
                (m, w) => m[n] ?? []
              );
              return v(
                d,
                [...e, "[*]", n],
                p
              );
            };
          if (i === "findWith")
            return (n, a) => {
              const o = l.findIndex(
                (w) => w[n] === a
              );
              if (o === -1) return;
              const d = l[o], m = [...e, o.toString()];
              return S.clear(), I++, S.clear(), I++, v(d, m);
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
              const d = r.getState().getNestedState(t, e), m = it(n) ? n(d) : n;
              let w = null;
              if (!d.some((x) => {
                if (a) {
                  const M = a.every(
                    (q) => R(x[q], m[q])
                  );
                  return M && (w = x), M;
                }
                const j = R(x, m);
                return j && (w = x), j;
              }))
                _(e), nt(s, m, e, t);
              else if (o && w) {
                const x = o(w), j = d.map(
                  (M) => R(M, w) ? x : M
                );
                _(e), z(s, j, e);
              }
            };
          if (i === "cut")
            return (n, a) => {
              a?.waitForSync || (_(e), rt(s, e, t, n));
            };
          if (i === "stateFilter")
            return (n) => {
              const a = l.map((m, w) => ({
                ...m,
                __origIndex: w.toString()
              })), o = [], d = [];
              for (let m = 0; m < a.length; m++)
                n(a[m], m) && (o.push(m), d.push(a[m]));
              return S.clear(), I++, v(d, e, {
                filtered: [...p?.filtered || [], e],
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
            const m = r.getState().getNestedState(t, [...a]);
            z(s, m, a), _(a);
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
                const m = n.zodSchema.safeParse(o);
                return m.success ? !0 : (m.error.errors.forEach((A) => {
                  const x = A.path, j = A.message, M = [n.key, ...x].join(".");
                  a(M, j), console.log(
                    `Validation error at ${M}: ${j}`
                  );
                }), lt(t), !1);
              } catch (d) {
                return console.error("Zod schema validation failed", d), !1;
              }
            };
          if (i === "_componentId") return f;
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
              validIndices: p?.validIndices,
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
        return v(D, C, p);
      }
    }, c = new Proxy(y, b);
    return S.set(h, {
      proxy: c,
      stateVersion: I
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
  rebuildStateShape: s
}) {
  const f = r().getNestedState(t._stateKey, t._path);
  return console.log("value", f), Array.isArray(f) ? s(
    f,
    t._path
  ).stateMapNoRender(
    (S, I, _, E, y) => t._mapFn(S, I, _, E, y)
  ) : null;
}
function Nt({
  proxy: t
}) {
  const s = $.useRef(null), f = `${t._stateKey}-${t._path.join(".")}`;
  return $.useEffect(() => {
    const g = s.current;
    if (!g || !g.parentElement) return;
    const S = g.parentElement, _ = Array.from(S.childNodes).indexOf(g);
    let E = S.getAttribute("data-parent-id");
    E || (E = `parent-${crypto.randomUUID()}`, S.setAttribute("data-parent-id", E));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: E,
      position: _,
      effect: t._effect
    };
    r.getState().addSignalElement(f, v);
    const l = r.getState().getNestedState(t._stateKey, t._path), e = document.createTextNode(String(l));
    g.replaceWith(e);
  }, [t._stateKey, t._path.join("."), t._effect]), $.createElement("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": f
  });
}
function Ut(t) {
  const s = $.useSyncExternalStore(
    (f) => {
      const g = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: f,
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
