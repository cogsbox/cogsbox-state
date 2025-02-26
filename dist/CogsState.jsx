"use client";
import { j as et } from "./node_modules/react/jsx-runtime.jsx";
import { r as $ } from "./node_modules/react/index.js";
import { transformStateFunc as ut, isFunction as it, getNestedValue as L, isDeepEqual as G, debounce as ft } from "./utility.js";
import { pushFunc as nt, updateFn as z, cutFunc as rt, ValidationWrapper as gt, FormControlComponent as St } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r } from "./store.js";
import { useCogsConfig as mt } from "./CogsStateClient.jsx";
import Q from "./node_modules/uuid/dist/esm-browser/v4.js";
function at(t, i) {
  const u = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, f = u(t) || {};
  g(t, {
    ...f,
    ...i
  });
}
function ot({
  stateKey: t,
  options: i,
  initialOptionsPart: u
}) {
  const g = X(t) || {}, f = u[t] || {}, p = r.getState().setInitialStateOptions, _ = { ...f, ...g };
  let E = !1;
  if (i)
    for (const y in i)
      _.hasOwnProperty(y) || (E = !0, _[y] = i[y]);
  E && p(t, _);
}
const Ut = (t, i) => {
  let u = t;
  const [g, f] = ut(u);
  r.getState().setInitialStates(g);
  const p = (E, y) => {
    const [I] = $.useState(y?.componentId ?? Q());
    ot({
      stateKey: E,
      options: y,
      initialOptionsPart: f
    });
    const c = r.getState().cogsStateStore[E] || g[E], e = y?.modifyState ? y.modifyState(c) : c, [v, N] = $t(
      e,
      {
        stateKey: E,
        syncUpdate: y?.syncUpdate,
        componentId: I,
        localStorage: y?.localStorage,
        middleware: y?.middleware,
        enabledSync: y?.enabledSync,
        reactiveType: y?.reactiveType,
        reactiveDeps: y?.reactiveDeps,
        initState: y?.initState
      }
    );
    return N;
  };
  function _(E, y) {
    ot({ stateKey: E, options: y, initialOptionsPart: f });
  }
  return { useCogsState: p, setCogsOptions: _ };
}, {
  setUpdaterState: J,
  setState: R,
  getInitialOptions: X,
  getKeyState: st,
  getValidationErrors: yt,
  setStateLog: vt,
  updateInitialStateGlobal: Y,
  addValidationError: It,
  removeValidationError: b,
  setServerSyncActions: pt
} = r.getState(), ct = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Et = (t, i, u, g) => {
  if (u?.initState) {
    const f = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, p = u.initState ? `${g}-${i}-${u.initState.localStorageKey}` : i;
    window.localStorage.setItem(p, JSON.stringify(f));
  }
}, _t = (t, i, u, g, f, p) => {
  const _ = {
    initialState: i,
    updaterState: Z(
      t,
      g,
      f,
      p
    ),
    state: u
  };
  $.startTransition(() => {
    Y(t, _.initialState), J(t, _.updaterState), R(t, _.state);
  });
}, wt = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const u = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    u.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    $.startTransition(() => {
      u.forEach((g) => g());
    });
  });
}, bt = (t, i) => {
  const u = r.getState().stateComponents.get(t);
  if (u) {
    const g = `${t}////${i}`, f = u.components.get(g);
    f && f.forceUpdate();
  }
};
function $t(t, {
  stateKey: i,
  serverSync: u,
  localStorage: g,
  formElements: f,
  middleware: p,
  reactiveDeps: _,
  reactiveType: E,
  componentId: y,
  initState: I,
  syncUpdate: c
} = {}) {
  const [e, v] = $.useState({}), { sessionId: N } = mt();
  let P = !i;
  const [l] = $.useState(i ?? Q()), W = r.getState().stateLog[l], s = $.useRef(/* @__PURE__ */ new Set()), O = $.useRef(y ?? Q()), A = $.useRef(null);
  A.current = X(l), $.useEffect(() => {
    if (c && c.stateKey === l && c.path?.[0]) {
      R(l, (o) => ({
        ...o,
        [c.path[0]]: c.newValue
      }));
      const a = `${c.stateKey}:${c.path.join(".")}`;
      r.getState().setSyncInfo(a, {
        timeStamp: c.timeStamp,
        userId: c.userId
      });
    }
  }, [c]), $.useEffect(() => {
    at(l, {
      initState: I
    });
    const a = ct(
      N + "-" + l + "-" + I?.localStorageKey
    );
    let o = null;
    I?.initialState && (o = I?.initialState, a && a.lastUpdated > (a.lastSyncedWithServer || 0) && (o = a.state), _t(
      l,
      I?.initialState,
      o,
      k,
      O.current,
      N
    ), v({}));
  }, [I?.localStorageKey, ...I?.dependencies || []]), $.useLayoutEffect(() => {
    P && at(l, {
      serverSync: u,
      formElements: f,
      initState: I,
      localStorage: g,
      middleware: p
    });
    const a = `${l}////${O.current}`, o = r.getState().stateComponents.get(l) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(a, {
      forceUpdate: () => v({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), r.getState().stateComponents.set(l, o), v({}), () => {
      const d = `${l}////${O.current}`;
      o && (o.components.delete(d), o.components.size === 0 && r.getState().stateComponents.delete(l));
    };
  }, []);
  const k = (a, o, d, S) => {
    if (Array.isArray(o)) {
      const w = `${l}-${o.join(".")}`;
      s.current.add(w);
    }
    R(l, (w) => {
      const T = it(a) ? a(w) : a, M = `${l}-${o.join(".")}`;
      if (M) {
        let U = !1, m = r.getState().signalDomElements.get(M);
        if ((!m || m.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const h = o.slice(0, -1), C = L(T, h);
          if (Array.isArray(C)) {
            U = !0;
            const V = `${l}-${h.join(".")}`;
            m = r.getState().signalDomElements.get(V);
          }
        }
        if (m) {
          const h = U ? L(T, o.slice(0, -1)) : L(T, o);
          m.forEach(({ parentId: C, position: V, effect: D }) => {
            const x = document.querySelector(
              `[data-parent-id="${C}"]`
            );
            if (x) {
              const tt = Array.from(x.childNodes);
              if (tt[V]) {
                const dt = D ? new Function("state", `return (${D})(state)`)(h) : h;
                tt[V].textContent = String(dt);
              }
            }
          });
        }
      }
      d.updateType === "update" && (S || A.current?.validationKey) && o && b(
        (S || A.current?.validationKey) + "." + o.join(".")
      );
      const j = o.slice(0, o.length - 1);
      d.updateType === "cut" && A.current?.validationKey && b(
        A.current?.validationKey + "." + j.join(".")
      ), d.updateType === "insert" && A.current?.validationKey && yt(
        A.current?.validationKey + "." + j.join(".")
      ).filter(([m, h]) => {
        let C = m?.split(".").length;
        if (m == j.join(".") && C == j.length - 1) {
          let V = m + "." + j;
          b(m), It(V, h);
        }
      });
      const F = L(w, o), q = L(T, o), lt = d.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), B = r.getState().stateComponents.get(l);
      if (i == "cart" && (console.log("thisKey", l), console.log("stateEntry", B)), B)
        for (const [U, m] of B.components.entries()) {
          let h = !1;
          const C = Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"];
          if (!C.includes("none")) {
            if (C.includes("all")) {
              m.forceUpdate();
              continue;
            }
            if (C.includes("component") && m.paths && (m.paths.has(lt) || m.paths.has("")) && (h = !0), !h && C.includes("deps") && m.depsFunction) {
              const V = m.depsFunction(T);
              typeof V == "boolean" ? V && (h = !0) : G(m.deps, V) || (m.deps = V, h = !0);
            }
            h && m.forceUpdate();
          }
        }
      const K = {
        timeStamp: Date.now(),
        stateKey: l,
        path: o,
        updateType: d.updateType,
        status: "new",
        oldValue: F,
        newValue: q
      };
      if (vt(l, (U) => {
        const h = [...U ?? [], K].reduce((C, V) => {
          const D = `${V.stateKey}:${JSON.stringify(V.path)}`, x = C.get(D);
          return x ? (x.timeStamp = Math.max(x.timeStamp, V.timeStamp), x.newValue = V.newValue, x.oldValue = x.oldValue ?? V.oldValue, x.updateType = V.updateType) : C.set(D, { ...V }), C;
        }, /* @__PURE__ */ new Map());
        return Array.from(h.values());
      }), Et(
        T,
        l,
        A.current,
        N
      ), p && p({
        updateLog: W,
        update: K
      }), A.current?.serverSync) {
        const U = r.getState().serverState[l], m = A.current?.serverSync;
        pt(l, {
          syncKey: typeof m.syncKey == "string" ? m.syncKey : m.syncKey({ state: T }),
          rollBackState: U,
          actionTimeStamp: Date.now() + (m.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  r.getState().updaterState[l] || (console.log("Initializing state for", l, t), J(
    l,
    Z(
      l,
      k,
      O.current,
      N
    )
  ), r.getState().cogsStateStore[l] || R(l, t), r.getState().initialStateGlobal[l] || Y(l, t));
  const n = $.useMemo(() => Z(
    l,
    k,
    O.current,
    N
  ), [l]);
  return [st(l), n];
}
function Z(t, i, u, g) {
  const f = /* @__PURE__ */ new Map();
  let p = 0;
  const _ = (c) => {
    const e = c.join(".");
    for (const [v] of f)
      (v === e || v.startsWith(e + ".")) && f.delete(v);
    p++;
  }, E = /* @__PURE__ */ new Map(), y = {
    removeValidation: (c) => {
      c?.validationKey && b(c.validationKey);
    },
    revertToInitialState: (c) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && b(e?.key), c?.validationKey && b(c.validationKey);
      const v = r.getState().initialStateGlobal[t];
      f.clear(), p++;
      const N = I(v, []);
      $.startTransition(() => {
        J(t, N), R(t, v);
        const P = r.getState().stateComponents.get(t);
        P && P.components.forEach((W) => {
          W.forceUpdate();
        });
        const l = X(t);
        l?.initState && localStorage.removeItem(
          l?.initState ? g + "-" + t + "-" + l?.initState.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (c) => {
      f.clear(), p++;
      const e = Z(
        t,
        i,
        u,
        g
      );
      return $.startTransition(() => {
        Y(t, c), J(t, e), R(t, c);
        const v = r.getState().stateComponents.get(t);
        v && v.components.forEach((N) => {
          N.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (v) => e.get()[v]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const c = r.getState().serverState[t];
      return !!(c && G(c, st(t)));
    }
  };
  function I(c, e = [], v) {
    const N = e.map(String).join(".");
    f.get(N);
    const P = {
      get(W, s) {
        if (s !== "then" && !s.startsWith("$") && s !== "stateMapNoRender") {
          const n = e.join("."), a = `${t}////${u}`, o = r.getState().stateComponents.get(t);
          if (o) {
            const d = o.components.get(a);
            d && (e.length > 0 || s === "get") && d.paths.add(n);
          }
        }
        if (s === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(t)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(n.key + "." + e.join("."));
          };
        if (Array.isArray(c)) {
          if (s === "getSelected")
            return () => {
              const n = E.get(e.join("."));
              if (n !== void 0)
                return I(
                  c[n],
                  [...e, n.toString()],
                  v
                );
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const a = v?.filtered?.some(
                (d) => d.join(".") === e.join(".")
              ), o = a ? c : r.getState().getNestedState(t, e);
              return s !== "stateMapNoRender" && (f.clear(), p++), o.map((d, S) => {
                const w = a && d.__origIndex ? d.__origIndex : S, T = I(
                  d,
                  [...e, w.toString()],
                  v
                );
                return n(
                  d,
                  T,
                  S,
                  c,
                  I(c, e, v)
                );
              });
            };
          if (s === "$stateMap")
            return (n) => $.createElement(Vt, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: I
            });
          if (s === "stateFlattenOn")
            return (n) => {
              const o = v?.filtered?.some(
                (S) => S.join(".") === e.join(".")
              ) ? c : r.getState().getNestedState(t, e);
              f.clear(), p++;
              const d = o.flatMap(
                (S, w) => S[n] ?? []
              );
              return I(
                d,
                [...e, "[*]", n],
                v
              );
            };
          if (s === "findWith")
            return (n, a) => {
              const o = c.findIndex(
                (w) => w[n] === a
              );
              if (o === -1) return;
              const d = c[o], S = [...e, o.toString()];
              return f.clear(), p++, f.clear(), p++, I(d, S);
            };
          if (s === "index")
            return (n) => {
              const a = c[n];
              return I(a, [...e, n.toString()]);
            };
          if (s === "insert")
            return (n) => (_(e), nt(i, n, e, t), I(
              r.getState().cogsStateStore[t],
              []
            ));
          if (s === "uniqueInsert")
            return (n, a, o) => {
              const d = r.getState().getNestedState(t, e), S = it(n) ? n(d) : n;
              let w = null;
              if (!d.some((M) => {
                if (a) {
                  const F = a.every(
                    (q) => G(M[q], S[q])
                  );
                  return F && (w = M), F;
                }
                const j = G(M, S);
                return j && (w = M), j;
              }))
                _(e), nt(i, S, e, t);
              else if (o && w) {
                const M = o(w), j = d.map(
                  (F) => G(F, w) ? M : F
                );
                _(e), z(i, j, e);
              }
            };
          if (s === "cut")
            return (n, a) => {
              a?.waitForSync || (_(e), rt(i, e, t, n));
            };
          if (s === "stateFilter")
            return (n) => {
              const a = c.map((S, w) => ({
                ...S,
                __origIndex: w.toString()
              })), o = [], d = [];
              for (let S = 0; S < a.length; S++)
                n(a[S], S) && (o.push(S), d.push(a[S]));
              return f.clear(), p++, I(d, e, {
                filtered: [...v?.filtered || [], e],
                validIndices: o
                // Pass through the meta
              });
            };
        }
        const O = e[e.length - 1];
        if (!isNaN(Number(O))) {
          const n = e.slice(0, -1), a = r.getState().getNestedState(t, n);
          if (Array.isArray(a) && s === "cut")
            return () => rt(
              i,
              n,
              t,
              Number(O)
            );
        }
        if (s === "get")
          return () => r.getState().getNestedState(t, e);
        if (s === "$derive")
          return (n) => H({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (s === "$derive")
          return (n) => H({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (s === "$get")
          return () => H({
            _stateKey: t,
            _path: e
          });
        if (s === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (s === "_selected") {
          const n = e.slice(0, -1), a = n.join("."), o = r.getState().getNestedState(t, n);
          return Array.isArray(o) ? Number(e[e.length - 1]) === E.get(a) : void 0;
        }
        if (s == "getLocalStorage")
          return (n) => ct(g + "-" + t + "-" + n);
        if (s === "setSelected")
          return (n) => {
            const a = e.slice(0, -1), o = Number(e[e.length - 1]), d = a.join(".");
            n ? E.set(d, o) : E.delete(d);
            const S = r.getState().getNestedState(t, [...a]);
            z(i, S, a), _(a);
          };
        if (e.length == 0) {
          if (s === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(t)?.validation, a = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              b(n.key);
              const o = r.getState().cogsStateStore[t];
              try {
                const d = r.getState().getValidationErrors(n.key);
                d && d.length > 0 && d.forEach(([w]) => {
                  w && w.startsWith(n.key) && b(w);
                });
                const S = n.zodSchema.safeParse(o);
                return S.success ? !0 : (S.error.errors.forEach((T) => {
                  const M = T.path, j = T.message, F = [n.key, ...M].join(".");
                  a(F, j), console.log(
                    `Validation error at ${F}: ${j}`
                  );
                }), wt(t), !1);
              } catch (d) {
                return console.error("Zod schema validation failed", d), !1;
              }
            };
          if (s === "_componentId") return u;
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
          if (s === "updateInitialState") return y.updateInitialState;
          if (s === "removeValidation") return y.removeValidation;
        }
        if (s === "validationWrapper")
          return ({
            children: n,
            hideMessage: a
          }) => /* @__PURE__ */ et.jsx(
            gt,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: v?.validIndices,
              children: n
            }
          );
        if (s === "_stateKey") return t;
        if (s === "_path") return e;
        if (s === "_isServerSynced") return y._isServerSynced;
        if (s === "update")
          return (n, a) => {
            if (a?.debounce)
              ft(() => {
                z(i, n, e, "");
                const o = r.getState().getNestedState(t, e);
                a?.afterUpdate && a.afterUpdate(o);
              }, a.debounce);
            else {
              z(i, n, e, "");
              const o = r.getState().getNestedState(t, e);
              a?.afterUpdate && a.afterUpdate(o);
            }
            _(e);
          };
        if (s === "formElement")
          return (n, a) => /* @__PURE__ */ et.jsx(
            St,
            {
              setState: i,
              stateKey: t,
              path: e,
              child: n,
              formOpts: a
            }
          );
        const A = [...e, s], k = r.getState().getNestedState(t, A);
        return I(k, A, v);
      }
    }, l = new Proxy(y, P);
    return f.set(N, {
      proxy: l,
      stateVersion: p
    }), l;
  }
  return I(
    r.getState().getNestedState(t, [])
  );
}
function H(t) {
  return $.createElement(Nt, { proxy: t });
}
function Vt({
  proxy: t,
  rebuildStateShape: i
}) {
  const u = r().getNestedState(t._stateKey, t._path);
  return console.log("value", u), Array.isArray(u) ? i(
    u,
    t._path
  ).stateMapNoRender(
    (f, p, _, E, y) => t._mapFn(f, p, _, E, y)
  ) : null;
}
function Nt({
  proxy: t
}) {
  const i = $.useRef(null), u = `${t._stateKey}-${t._path.join(".")}`;
  return $.useEffect(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const f = g.parentElement, _ = Array.from(f.childNodes).indexOf(g);
    let E = f.getAttribute("data-parent-id");
    E || (E = `parent-${crypto.randomUUID()}`, f.setAttribute("data-parent-id", E));
    const I = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: E,
      position: _,
      effect: t._effect
    };
    r.getState().addSignalElement(u, I);
    const c = r.getState().getNestedState(t._stateKey, t._path);
    let e;
    if (t._effect)
      try {
        e = new Function(
          "state",
          `return (${t._effect})(state)`
        )(c);
      } catch (N) {
        console.error("Error evaluating effect function during mount:", N), e = c;
      }
    else
      e = c;
    e !== null && typeof e == "object" && (e = JSON.stringify(e));
    const v = document.createTextNode(String(e));
    g.replaceWith(v);
  }, [t._stateKey, t._path.join("."), t._effect]), $.createElement("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": u
  });
}
function Pt(t) {
  const i = $.useSyncExternalStore(
    (u) => {
      const g = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: u,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return $.createElement("text", {}, String(i));
}
export {
  H as $cogsSignal,
  Pt as $cogsSignalStore,
  Ut as createCogsState,
  bt as notifyComponent,
  $t as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
