"use client";
import { j as X } from "./node_modules/react/jsx-runtime.jsx";
import { r as _ } from "./node_modules/react/index.js";
import { transformStateFunc as lt, isFunction as ot, getNestedValue as q, isDeepEqual as M } from "./utility.js";
import { updateFn as Y, ValidationWrapper as dt, FormControlComponent as ut, cutFunc as Z, pushFunc as K } from "./Functions.jsx";
import "zod";
import { getGlobalStore as o } from "./store.js";
import { useCogsConfig as St } from "./CogsStateClient.jsx";
import k from "./node_modules/uuid/dist/esm-browser/v4.js";
function Ot(t, { formElements: i, zodSchema: S }) {
  return { initialState: t, formElements: i, zodSchema: S };
}
function tt(t, i) {
  const S = o.getState().getInitialOptions, u = o.getState().setInitialStateOptions, g = S(t) || {};
  u(t, {
    ...g,
    ...i
  });
}
function et({
  stateKey: t,
  options: i,
  initialOptionsPart: S
}) {
  const u = J(t) || {}, g = S[t] || {}, w = o.getState().setInitialStateOptions, v = { ...g, ...u };
  let E = !1;
  if (i)
    for (const f in i)
      v.hasOwnProperty(f) || (E = !0, v[f] = i[f]);
  E && w(t, v);
}
const At = (t, i) => {
  let S = t;
  const [u, g] = lt(S);
  o.getState().setInitialStates(u);
  const w = (E, f) => {
    const [m] = _.useState(k());
    et({ stateKey: E, options: f, initialOptionsPart: g });
    const s = o.getState().cogsStateStore[E] || u[E], e = f?.modifyState ? f.modifyState(s) : s, [p, $] = Et(
      e,
      {
        stateKey: E,
        syncUpdate: f?.syncUpdate,
        componentId: m,
        localStorage: f?.localStorage,
        middleware: f?.middleware,
        enabledSync: f?.enabledSync,
        reactiveDeps: f?.reactiveDeps,
        initState: f?.initState
      }
    );
    return $;
  };
  function v(E, f) {
    et({ stateKey: E, options: f, initialOptionsPart: g });
  }
  return { useCogsState: w, setCogsOptions: v };
}, {
  setUpdaterState: R,
  setState: P,
  getInitialOptions: J,
  getKeyState: rt,
  getValidationErrors: gt,
  setStateLog: ft,
  updateInitialStateGlobal: z,
  addValidationError: mt,
  removeValidationError: D,
  setServerSyncActions: pt
} = o.getState(), at = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, yt = (t, i, S, u) => {
  if (S?.initState) {
    const g = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: o.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: o.getState().serverState[i]
    }, w = S.initState ? `${u}-${i}-${S.initState.localStorageKey}` : i;
    window.localStorage.setItem(w, JSON.stringify(g));
  }
}, It = (t, i, S, u, g, w) => {
  const v = {
    initialState: i,
    updaterState: G(
      t,
      u,
      g,
      w
    ),
    state: S
  };
  _.startTransition(() => {
    z(t, v.initialState), R(t, v.updaterState), P(t, v.state);
  });
}, vt = (t) => {
  const i = o.getState().stateComponents.get(t);
  if (!i) return;
  const S = /* @__PURE__ */ new Set();
  i.components.forEach((u) => {
    S.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    _.startTransition(() => {
      S.forEach((u) => u());
    });
  });
};
function Et(t, {
  stateKey: i,
  serverSync: S,
  zodSchema: u,
  localStorage: g,
  formElements: w,
  middleware: v,
  reactiveDeps: E,
  componentId: f,
  initState: m,
  syncUpdate: s
} = {}) {
  const [e, p] = _.useState({}), { sessionId: $ } = St();
  let j = !i;
  const [c] = _.useState(i ?? k()), L = o.getState().stateLog[c], B = _.useRef(/* @__PURE__ */ new Set()), l = _.useRef(f ?? k()), x = _.useRef(null);
  x.current = J(c), _.useEffect(() => {
    if (s && s.stateKey === c && s.path?.[0]) {
      P(c, (n) => ({
        ...n,
        [s.path[0]]: s.newValue
      }));
      const a = `${s.stateKey}:${s.path.join(".")}`;
      o.getState().setSyncInfo(a, {
        timeStamp: s.timeStamp,
        userId: s.userId
      });
    }
  }, [s]), _.useEffect(() => {
    tt(c, {
      initState: m
    });
    const a = at(
      $ + "-" + c + "-" + m?.localStorageKey
    );
    let n = null;
    m?.initialState && (n = m?.initialState, a && a.lastUpdated > (a.lastSyncedWithServer || 0) && (n = a.state), It(
      c,
      m?.initialState,
      n,
      h,
      l.current,
      $
    )), vt(c);
  }, [m?.localStorageKey, ...m?.dependencies || []]), _.useEffect(() => {
    j && tt(c, {
      serverSync: S,
      formElements: w,
      zodSchema: u,
      initState: m,
      localStorage: g,
      middleware: v
    });
    const a = `${c}////${l.current}`, n = o.getState().stateComponents.get(c) || {
      components: /* @__PURE__ */ new Map()
    };
    return console.log("stateEntry", n), n.components.set(a, {
      forceUpdate: () => p({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0
    }), o.getState().stateComponents.set(c, n), console.log(
      "   getGlobalStore.getState().stateComponent",
      o.getState().stateComponents
    ), () => {
      const d = `${c}////${l.current}`;
      n && (n.components.delete(d), n.components.size === 0 && o.getState().stateComponents.delete(c));
    };
  }, []);
  const h = (a, n, d, y) => {
    if (Array.isArray(n)) {
      const C = `${c}-${n.join(".")}`;
      B.current.add(C);
    }
    P(c, (C) => {
      const V = ot(a) ? a(C) : a, H = `${c}-${n.join(".")}`;
      if (H) {
        const F = o.getState().signalDomElements.get(H);
        if (F) {
          const I = q(V, n);
          F.forEach(({ parentId: T, position: O }) => {
            const N = document.querySelector(
              `[data-parent-id="${T}"]`
            );
            if (N) {
              const U = Array.from(N.childNodes);
              U[O] && (U[O].textContent = String(I));
            }
          });
        }
      }
      d.updateType === "update" && (y || x.current?.validationKey) && n && D(
        (y || x.current?.validationKey) + "." + n.join(".")
      );
      const b = n.slice(0, n.length - 1);
      d.updateType === "cut" && x.current?.validationKey && D(
        x.current?.validationKey + "." + b.join(".")
      ), d.updateType === "insert" && x.current?.validationKey && gt(
        x.current?.validationKey + "." + b.join(".")
      ).filter(([I, T]) => {
        let O = I?.split(".").length;
        if (I == b.join(".") && O == b.length - 1) {
          let N = I + "." + b;
          D(I), mt(N, T);
        }
      });
      const it = q(C, n), st = q(V, n), ct = d.updateType === "update" ? n.join(".") : [...n].slice(0, -1).join("."), W = o.getState().stateComponents.get(c);
      if (console.log("stateEntry", W), W) {
        for (const [
          F,
          I
        ] of W.components.entries())
          if (I.depsFunction || I.paths && I.paths.has(ct))
            if (I.depsFunction) {
              const T = I.depsFunction(V);
              typeof T == "boolean" ? T && I.forceUpdate() : M(I.deps, T) || (I.deps = T, I.forceUpdate());
            } else
              I.forceUpdate();
      }
      const Q = {
        timeStamp: Date.now(),
        stateKey: c,
        path: n,
        updateType: d.updateType,
        status: "new",
        oldValue: it,
        newValue: st
      };
      if (ft(c, (F) => {
        const T = [...F ?? [], Q].reduce((O, N) => {
          const U = `${N.stateKey}:${JSON.stringify(N.path)}`, A = O.get(U);
          return A ? (A.timeStamp = Math.max(
            A.timeStamp,
            N.timeStamp
          ), A.newValue = N.newValue, A.oldValue = A.oldValue ?? N.oldValue, A.updateType = N.updateType) : O.set(U, { ...N }), O;
        }, /* @__PURE__ */ new Map());
        return Array.from(T.values());
      }), yt(
        V,
        c,
        x.current,
        $
      ), v && v({ updateLog: L, update: Q }), x.current?.serverSync) {
        const F = o.getState().serverState[c], I = x.current?.serverSync;
        pt(c, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: V }),
          rollBackState: F,
          actionTimeStamp: Date.now() + (I.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return V;
    });
  };
  o.getState().updaterState[c] || (console.log("Initializing state for", c, t), R(
    c,
    G(
      c,
      h,
      l.current,
      $
    )
  ), o.getState().cogsStateStore[c] || P(c, t), o.getState().initialStateGlobal[c] || z(c, t));
  const r = _.useMemo(() => G(
    c,
    h,
    l.current,
    $
  ), [c]);
  return [rt(c), r];
}
function _t({
  proxy: t
}) {
  const i = _.useRef(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return _.useEffect(() => {
    const u = i.current;
    if (!u || !u.parentElement) {
      console.log("No element or parent");
      return;
    }
    const g = u.parentElement, v = Array.from(g.childNodes).indexOf(u);
    let E = g.getAttribute("data-parent-id");
    E || (E = `parent-${crypto.randomUUID()}`, g.setAttribute("data-parent-id", E));
    const m = { instanceId: `instance-${crypto.randomUUID()}`, parentId: E, position: v };
    o.getState().addSignalElement(S, m);
    const s = document.createTextNode(
      String(
        o.getState().getNestedState(t._stateKey, t._path)
      )
    );
    u.replaceWith(s);
  }, [t._stateKey, t._path.join(".")]), _.createElement("span", {
    ref: i,
    style: { display: "none" }
  });
}
function G(t, i, S, u) {
  const g = /* @__PURE__ */ new Map();
  let w = 0;
  const v = (s) => {
    const e = s.join(".");
    for (const [p] of g)
      (p === e || p.startsWith(e + ".")) && g.delete(p);
    w++;
  }, E = /* @__PURE__ */ new Map(), f = {
    removeValidation: (s) => {
      s?.validationKey && D(s.validationKey);
    },
    revertToInitialState: (s) => {
      s?.validationKey && D(s.validationKey);
      const e = o.getState().initialStateGlobal[t];
      g.clear(), w++;
      const p = m(e, []);
      _.startTransition(() => {
        R(t, p), P(t, e);
        const $ = o.getState().stateComponents.get(t);
        $ && $.components.forEach((c) => {
          c.forceUpdate();
        });
        const j = J(t);
        j?.initState && localStorage.removeItem(
          j?.initState ? u + "-" + t + "-" + j?.initState.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (s) => {
      g.clear(), w++;
      const e = G(
        t,
        i,
        S,
        u
      );
      return _.startTransition(() => {
        z(t, s), R(t, e), P(t, s);
        const p = o.getState().stateComponents.get(t);
        p && p.components.forEach(($) => {
          $.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (p) => e.get()[p]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const s = o.getState().serverState[t];
      return !!(s && M(s, rt(t)));
    }
  };
  function m(s, e = [], p) {
    const $ = e.map(String).join("."), j = g.get($);
    if (j?.stateVersion === w)
      return j.proxy;
    const c = {
      get(B, l) {
        if (l !== "then" && l !== "$get") {
          const r = e.join("."), a = `${t}////${S}`, n = o.getState().stateComponents.get(t);
          if (n && r) {
            const d = n.components.get(a);
            d && d.paths.add(r);
          }
        }
        if (l === "lastSynced") {
          const r = `${t}:${e.join(".")}`;
          return o.getState().getSyncInfo(r);
        }
        if (l === "_selected") {
          const r = e.slice(0, -1), a = r.join("."), n = o.getState().getNestedState(t, r);
          return Array.isArray(n) ? Number(e[e.length - 1]) === E.get(a) : void 0;
        }
        if (l == "getLocalStorage")
          return (r) => at(
            u + "-" + t + "-" + r
          );
        if (l === "setSelected")
          return (r) => {
            const a = e.slice(0, -1), n = Number(e[e.length - 1]), d = a.join(".");
            r ? E.set(d, n) : E.delete(d);
            const y = o.getState().getNestedState(t, [...a]);
            Y(i, y, a), v(a);
          };
        if (e.length == 0) {
          if (l == "_componentId") return S;
          if (l === "_initialState")
            return o.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return o.getState().serverState[t];
          if (l === "_isLoading")
            return o.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return f.revertToInitialState;
          if (l === "updateInitialState")
            return f.updateInitialState;
          if (l === "removeValidation")
            return f.removeValidation;
        }
        if (l === "validationWrapper")
          return ({
            children: r,
            hideMessage: a
          }) => /* @__PURE__ */ X.jsx(
            dt,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: o.getState().getInitialOptions(t)?.validationKey || "",
              stateKey: t,
              validIndices: p?.validIndices,
              children: r
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return e;
        if (l === "_isServerSynced") return f._isServerSynced;
        if (l === "update")
          return (r, a) => {
            v(e), Y(i, r, e, "");
          };
        if (l === "get")
          return () => o.getState().getNestedState(t, e);
        if (l === "$get")
          return () => nt({ _stateKey: t, _path: e });
        if (l === "formElement")
          return (r, a, n) => /* @__PURE__ */ X.jsx(
            ut,
            {
              setState: i,
              validationKey: r,
              stateKey: t,
              path: e,
              child: a,
              formOpts: n
            }
          );
        if (Array.isArray(s)) {
          if (l === "getSelected")
            return () => {
              const r = E.get(
                e.join(".")
              );
              if (r !== void 0)
                return m(
                  s[r],
                  [...e, r.toString()],
                  p
                );
            };
          if (l === "$get")
            return () => nt({ _stateKey: t, _path: e });
          if (l === "stateEach")
            return (r) => {
              const a = p?.filtered?.some(
                (d) => d.join(".") === e.join(".")
              ), n = a ? s : o.getState().getNestedState(t, e);
              return g.clear(), w++, n.map((d, y) => {
                const C = a && d.__origIndex ? d.__origIndex : y, V = m(
                  d,
                  [...e, C.toString()],
                  p
                );
                return r(
                  d,
                  V,
                  y,
                  s,
                  m(
                    s,
                    e,
                    p
                  )
                );
              });
            };
          if (l === "stateFlattenOn")
            return (r) => {
              const n = p?.filtered?.some(
                (y) => y.join(".") === e.join(".")
              ) ? s : o.getState().getNestedState(t, e);
              g.clear(), w++;
              const d = n.flatMap(
                (y, C) => y[r] ?? []
              );
              return m(
                d,
                [...e, "[*]", r],
                p
              );
            };
          if (l === "findWith")
            return (r, a) => {
              const n = s.findIndex(
                (V) => V[r] === a
              );
              if (n === -1) return;
              const d = s[n], y = [...e, n.toString()];
              return {
                ...m(
                  d,
                  y
                ),
                cut: () => {
                  Z(
                    i,
                    e,
                    t,
                    n
                  );
                }
              };
            };
          if (l === "index")
            return (r) => {
              const a = s[r];
              return m(a, [
                ...e,
                r.toString()
              ]);
            };
          if (l === "insert")
            return (r) => (v(e), K(
              i,
              r,
              e,
              t
            ), m(
              o.getState().cogsStateStore[t],
              []
            ));
          if (l === "uniqueInsert")
            return (r, a) => {
              const n = o.getState().getNestedState(t, e), d = ot(r) ? r(n) : r;
              !n.some((C) => a ? a.every(
                (V) => M(
                  C[V],
                  d[V]
                )
              ) : M(C, d)) && (v(e), K(
                i,
                d,
                e,
                t
              ));
            };
          if (l === "cut")
            return (r, a) => {
              a?.waitForSync || (v(e), Z(i, e, t, r));
            };
          if (l === "stateFilter")
            return (r) => {
              const a = s.map(
                (y, C) => ({
                  ...y,
                  __origIndex: C.toString()
                })
              ), n = [], d = [];
              for (let y = 0; y < a.length; y++)
                r(a[y], y) && (n.push(y), d.push(a[y]));
              return g.clear(), w++, m(
                d,
                e,
                {
                  filtered: [...p?.filtered || [], e],
                  validIndices: n
                  // Pass through the meta
                }
              );
            };
        }
        const x = [...e, l], h = o.getState().getNestedState(t, x);
        return m(h, x, p);
      }
    }, L = new Proxy(f, c);
    return g.set($, {
      proxy: L,
      stateVersion: w
    }), L;
  }
  return m(
    o.getState().getNestedState(t, [])
  );
}
function nt(t) {
  return _.createElement(_t, { proxy: t });
}
function Pt(t) {
  const i = _.useSyncExternalStore(
    (S) => {
      const u = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(t._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => u.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return _.createElement("text", {}, String(i));
}
export {
  nt as $cogsSignal,
  Pt as $cogsSignalStore,
  Ot as addStateOptions,
  At as createCogsState,
  Et as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
