"use client";
import { j as et } from "./node_modules/react/jsx-runtime.jsx";
import { r as $ } from "./node_modules/react/index.js";
import { transformStateFunc as ft, isFunction as st, getNestedValue as L, isDeepEqual as G, debounce as gt } from "./utility.js";
import { pushFunc as nt, updateFn as z, cutFunc as rt, ValidationWrapper as St, FormControlComponent as mt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as at } from "./store.js";
import { useCogsConfig as yt } from "./CogsStateClient.jsx";
import Q from "./node_modules/uuid/dist/esm-browser/v4.js";
function ot(t, s) {
  const u = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, f = u(t) || {};
  g(t, {
    ...f,
    ...s
  });
}
function it({
  stateKey: t,
  options: s,
  initialOptionsPart: u
}) {
  const g = X(t) || {}, f = u[t] || {}, p = r.getState().setInitialStateOptions, _ = { ...f, ...g };
  let E = !1;
  if (s)
    for (const y in s)
      _.hasOwnProperty(y) || (E = !0, _[y] = s[y]);
  E && p(t, _);
}
const Ut = (t, s) => {
  let u = t;
  const [g, f] = ft(u);
  r.getState().setInitialStates(g);
  const p = (E, y) => {
    const [I] = $.useState(y?.componentId ?? Q());
    it({
      stateKey: E,
      options: y,
      initialOptionsPart: f
    });
    const c = r.getState().cogsStateStore[E] || g[E], e = y?.modifyState ? y.modifyState(c) : c, [v, N] = Vt(
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
    it({ stateKey: E, options: y, initialOptionsPart: f });
  }
  return { useCogsState: p, setCogsOptions: _ };
}, {
  setUpdaterState: J,
  setState: P,
  getInitialOptions: X,
  getKeyState: ct,
  getValidationErrors: vt,
  setStateLog: It,
  updateInitialStateGlobal: Y,
  addValidationError: pt,
  removeValidationError: U,
  setServerSyncActions: Et
} = r.getState(), lt = (t) => {
  if (!t) return null;
  try {
    const s = window.localStorage.getItem(t);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, _t = (t, s, u, g) => {
  if (u?.initState) {
    const f = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[s]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[s]
    }, p = u.initState ? `${g}-${s}-${u.initState.localStorageKey}` : s;
    window.localStorage.setItem(p, JSON.stringify(f));
  }
}, wt = (t, s, u, g, f, p) => {
  const _ = {
    initialState: s,
    updaterState: B(
      t,
      g,
      f,
      p
    ),
    state: u
  };
  $.startTransition(() => {
    Y(t, _.initialState), J(t, _.updaterState), P(t, _.state);
  });
}, $t = (t) => {
  const s = r.getState().stateComponents.get(t);
  if (!s) return;
  const u = /* @__PURE__ */ new Set();
  s.components.forEach((g) => {
    u.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    $.startTransition(() => {
      u.forEach((g) => g());
    });
  });
}, bt = (t, s) => {
  const u = r.getState().stateComponents.get(t);
  if (u) {
    const g = `${t}////${s}`, f = u.components.get(g);
    f && f.forceUpdate();
  }
};
function Vt(t, {
  stateKey: s,
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
  const [e, v] = $.useState({}), { sessionId: N } = yt();
  let b = !s;
  const [l] = $.useState(s ?? Q()), W = r.getState().stateLog[l], i = $.useRef(/* @__PURE__ */ new Set()), x = $.useRef(y ?? Q()), A = $.useRef(null);
  A.current = X(l), $.useEffect(() => {
    if (c && c.stateKey === l && c.path?.[0]) {
      P(l, (o) => ({
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
    ot(l, {
      initState: I
    });
    const a = lt(
      N + "-" + l + "-" + I?.localStorageKey
    );
    let o = null;
    I?.initialState && (o = I?.initialState, a && a.lastUpdated > (a.lastSyncedWithServer || 0) && (o = a.state), wt(
      l,
      I?.initialState,
      o,
      k,
      x.current,
      N
    ), v({}));
  }, [I?.localStorageKey, ...I?.dependencies || []]), $.useLayoutEffect(() => {
    b && ot(l, {
      serverSync: u,
      formElements: f,
      initState: I,
      localStorage: g,
      middleware: p
    });
    const a = `${l}////${x.current}`, o = r.getState().stateComponents.get(l) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(a, {
      forceUpdate: () => v({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), r.getState().stateComponents.set(l, o), v({}), () => {
      const d = `${l}////${x.current}`;
      o && (o.components.delete(d), o.components.size === 0 && r.getState().stateComponents.delete(l));
    };
  }, []);
  const k = (a, o, d, S) => {
    if (Array.isArray(o)) {
      const w = `${l}-${o.join(".")}`;
      i.current.add(w);
    }
    P(l, (w) => {
      const T = st(a) ? a(w) : a, j = `${l}-${o.join(".")}`;
      if (j) {
        let O = !1, m = r.getState().signalDomElements.get(j);
        if ((!m || m.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const h = o.slice(0, -1), C = L(T, h);
          if (Array.isArray(C)) {
            O = !0;
            const V = `${l}-${h.join(".")}`;
            m = r.getState().signalDomElements.get(V);
          }
        }
        if (m) {
          const h = O ? L(T, o.slice(0, -1)) : L(T, o);
          m.forEach(({ parentId: C, position: V, effect: D }) => {
            const R = document.querySelector(
              `[data-parent-id="${C}"]`
            );
            if (R) {
              const tt = Array.from(R.childNodes);
              if (tt[V]) {
                const ut = D ? new Function("state", `return (${D})(state)`)(h) : h;
                tt[V].textContent = String(ut);
              }
            }
          });
        }
      }
      d.updateType === "update" && (S || A.current?.validationKey) && o && U(
        (S || A.current?.validationKey) + "." + o.join(".")
      );
      const F = o.slice(0, o.length - 1);
      d.updateType === "cut" && A.current?.validationKey && U(
        A.current?.validationKey + "." + F.join(".")
      ), d.updateType === "insert" && A.current?.validationKey && vt(
        A.current?.validationKey + "." + F.join(".")
      ).filter(([m, h]) => {
        let C = m?.split(".").length;
        if (m == F.join(".") && C == F.length - 1) {
          let V = m + "." + F;
          U(m), pt(V, h);
        }
      });
      const M = L(w, o), q = L(T, o), dt = d.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), Z = r.getState().stateComponents.get(l);
      if (s == "cart" && (console.log("thisKey", l), console.log("stateEntry", Z)), Z)
        for (const [O, m] of Z.components.entries()) {
          let h = !1;
          const C = Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"];
          if (!C.includes("none")) {
            if (C.includes("all")) {
              m.forceUpdate();
              continue;
            }
            if (C.includes("component") && m.paths && (m.paths.has(dt) || m.paths.has("")) && (h = !0), !h && C.includes("deps") && m.depsFunction) {
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
        oldValue: M,
        newValue: q
      };
      if (It(l, (O) => {
        const h = [...O ?? [], K].reduce((C, V) => {
          const D = `${V.stateKey}:${JSON.stringify(V.path)}`, R = C.get(D);
          return R ? (R.timeStamp = Math.max(R.timeStamp, V.timeStamp), R.newValue = V.newValue, R.oldValue = R.oldValue ?? V.oldValue, R.updateType = V.updateType) : C.set(D, { ...V }), C;
        }, /* @__PURE__ */ new Map());
        return Array.from(h.values());
      }), _t(
        T,
        l,
        A.current,
        N
      ), p && p({
        updateLog: W,
        update: K
      }), A.current?.serverSync) {
        const O = r.getState().serverState[l], m = A.current?.serverSync;
        Et(l, {
          syncKey: typeof m.syncKey == "string" ? m.syncKey : m.syncKey({ state: T }),
          rollBackState: O,
          actionTimeStamp: Date.now() + (m.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  r.getState().updaterState[l] || (console.log("Initializing state for", l, t), J(
    l,
    B(
      l,
      k,
      x.current,
      N
    )
  ), r.getState().cogsStateStore[l] || P(l, t), r.getState().initialStateGlobal[l] || Y(l, t));
  const n = $.useMemo(() => B(
    l,
    k,
    x.current,
    N
  ), [l]);
  return [ct(l), n];
}
function B(t, s, u, g) {
  const f = /* @__PURE__ */ new Map();
  let p = 0;
  const _ = (c) => {
    const e = c.join(".");
    for (const [v] of f)
      (v === e || v.startsWith(e + ".")) && f.delete(v);
    p++;
  }, E = /* @__PURE__ */ new Map(), y = {
    removeValidation: (c) => {
      c?.validationKey && U(c.validationKey);
    },
    revertToInitialState: (c) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && U(e?.key), c?.validationKey && U(c.validationKey);
      const v = r.getState().initialStateGlobal[t];
      f.clear(), p++;
      const N = I(v, []);
      $.startTransition(() => {
        J(t, N), P(t, v);
        const b = r.getState().stateComponents.get(t);
        b && b.components.forEach((W) => {
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
      const e = B(
        t,
        s,
        u,
        g
      );
      return $.startTransition(() => {
        Y(t, c), J(t, e), P(t, c);
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
      return !!(c && G(c, ct(t)));
    }
  };
  function I(c, e = [], v) {
    const N = e.map(String).join(".");
    f.get(N);
    const b = {
      get(W, i) {
        if (i !== "then" && !i.startsWith("$") && i !== "stateMapNoRender") {
          const n = e.join("."), a = `${t}////${u}`, o = r.getState().stateComponents.get(t);
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
        if (Array.isArray(c)) {
          if (i === "getSelected")
            return () => {
              const n = E.get(e.join("."));
              if (n !== void 0)
                return I(
                  c[n],
                  [...e, n.toString()],
                  v
                );
            };
          if (i === "stateMap" || i === "stateMapNoRender")
            return (n) => {
              const a = v?.filtered?.some(
                (d) => d.join(".") === e.join(".")
              ), o = a ? c : r.getState().getNestedState(t, e);
              return i !== "stateMapNoRender" && (f.clear(), p++), o.map((d, S) => {
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
          if (i === "$stateMap")
            return (n) => $.createElement(Nt, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: I
            });
          if (i === "stateFlattenOn")
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
          if (i === "findWith")
            return (n, a) => {
              const o = c.findIndex(
                (w) => w[n] === a
              );
              if (o === -1) return;
              const d = c[o], S = [...e, o.toString()];
              return f.clear(), p++, f.clear(), p++, I(d, S);
            };
          if (i === "index")
            return (n) => {
              const a = c[n];
              return I(a, [...e, n.toString()]);
            };
          if (i === "insert")
            return (n) => (_(e), nt(s, n, e, t), I(
              r.getState().cogsStateStore[t],
              []
            ));
          if (i === "uniqueInsert")
            return (n, a, o) => {
              const d = r.getState().getNestedState(t, e), S = st(n) ? n(d) : n;
              let w = null;
              if (!d.some((j) => {
                if (a) {
                  const M = a.every(
                    (q) => G(j[q], S[q])
                  );
                  return M && (w = j), M;
                }
                const F = G(j, S);
                return F && (w = j), F;
              }))
                _(e), nt(s, S, e, t);
              else if (o && w) {
                const j = o(w), F = d.map(
                  (M) => G(M, w) ? j : M
                );
                _(e), z(s, F, e);
              }
            };
          if (i === "cut")
            return (n, a) => {
              a?.waitForSync || (_(e), rt(s, e, t, n));
            };
          if (i === "stateFilter")
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
        const x = e[e.length - 1];
        if (!isNaN(Number(x))) {
          const n = e.slice(0, -1), a = r.getState().getNestedState(t, n);
          if (Array.isArray(a) && i === "cut")
            return () => rt(
              s,
              n,
              t,
              Number(x)
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
          return (n) => lt(g + "-" + t + "-" + n);
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
                return S.success ? !0 : (S.error.errors.forEach((T) => {
                  const j = T.path, F = T.message, M = [n.key, ...j].join(".");
                  a(M, F), console.log(
                    `Validation error at ${M}: ${F}`
                  );
                }), $t(t), !1);
              } catch (d) {
                return console.error("Zod schema validation failed", d), !1;
              }
            };
          if (i === "_componentId") return u;
          if (i === "getComponents")
            return () => r().stateComponents.get(t);
          if (i === "getAllFormRefs")
            return () => at.getState().getFormRefsByStateKey(t);
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
        if (i === "getFormRef")
          return () => at.getState().getFormRef(t + "." + e.join("."));
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
              validIndices: v?.validIndices,
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
        const A = [...e, i], k = r.getState().getNestedState(t, A);
        return I(k, A, v);
      }
    }, l = new Proxy(y, b);
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
  return $.createElement(ht, { proxy: t });
}
function Nt({
  proxy: t,
  rebuildStateShape: s
}) {
  const u = r().getNestedState(t._stateKey, t._path);
  return console.log("value", u), Array.isArray(u) ? s(
    u,
    t._path
  ).stateMapNoRender(
    (f, p, _, E, y) => t._mapFn(f, p, _, E, y)
  ) : null;
}
function ht({
  proxy: t
}) {
  const s = $.useRef(null), u = `${t._stateKey}-${t._path.join(".")}`;
  return $.useEffect(() => {
    const g = s.current;
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
    ref: s,
    style: { display: "none" },
    "data-signal-id": u
  });
}
function Pt(t) {
  const s = $.useSyncExternalStore(
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
  return $.createElement("text", {}, String(s));
}
export {
  H as $cogsSignal,
  Pt as $cogsSignalStore,
  Ut as createCogsState,
  bt as notifyComponent,
  Vt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
