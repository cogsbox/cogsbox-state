"use client";
import { j as X } from "./node_modules/react/jsx-runtime.jsx";
import { r as _ } from "./node_modules/react/index.js";
import { transformStateFunc as ct, isFunction as nt, getNestedValue as W, isDeepEqual as M } from "./utility.js";
import { updateFn as Y, ValidationWrapper as lt, FormControlComponent as dt, pushFunc as Z, cutFunc as ut } from "./updaterFunctions.jsx";
import "zod";
import { getGlobalStore as n } from "./store.js";
import { useCogsConfig as St } from "./CogsStateClient.jsx";
import q from "./node_modules/uuid/dist/esm-browser/v4.js";
function Ot(t, { formElements: i, zodSchema: S }) {
  return { initialState: t, formElements: i, zodSchema: S };
}
function K(t, i) {
  const S = n.getState().getInitialOptions, u = n.getState().setInitialStateOptions, g = S(t) || {};
  u(t, {
    ...g,
    ...i
  });
}
function tt({
  stateKey: t,
  options: i,
  initialOptionsPart: S
}) {
  const u = k(t) || {}, g = S[t] || {}, E = n.getState().setInitialStateOptions, f = { ...g, ...u };
  let m = !1;
  if (i)
    for (const w in i)
      f.hasOwnProperty(w) || (m = !0, f[w] = i[w]);
  m && E(t, f);
}
const ht = (t) => {
  let i = t;
  const [S, u] = ct(i);
  n.getState().setInitialStates(S);
  const g = (f, m) => {
    const [w] = _.useState(q());
    tt({ stateKey: f, options: m, initialOptionsPart: u });
    const I = n.getState().cogsStateStore[f] || S[f], s = m?.modifyState ? m.modifyState(I) : I, [e, v] = Et(
      s,
      {
        stateKey: f,
        syncUpdate: m?.syncUpdate,
        componentId: w,
        localStorage: m?.localStorage,
        middleware: m?.middleware,
        enabledSync: m?.enabledSync,
        reactiveDeps: m?.reactiveDeps,
        initState: m?.initState
      }
    );
    return [e, v];
  };
  function E(f, m) {
    tt({ stateKey: f, options: m, initialOptionsPart: u });
  }
  return { useCogsState: g, setCogsOptions: E };
}, {
  setUpdaterState: R,
  setState: A,
  getInitialOptions: k,
  getKeyState: rt,
  getValidationErrors: gt,
  setStateLog: ft,
  updateInitialStateGlobal: J,
  addValidationError: mt,
  removeValidationError: D,
  setServerSyncActions: pt
} = n.getState(), ot = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, It = (t, i, S, u) => {
  if (S?.initState) {
    const g = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: n.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: n.getState().serverState[i]
    }, E = S.initState ? `${u}-${i}-${S.initState.localStorageKey}` : i;
    window.localStorage.setItem(E, JSON.stringify(g));
  }
}, vt = (t, i, S, u, g, E) => {
  const f = {
    initialState: i,
    updaterState: G(
      t,
      u,
      g,
      E
    ),
    state: S
  };
  _.startTransition(() => {
    J(t, f.initialState), R(t, f.updaterState), A(t, f.state);
  });
}, yt = (t) => {
  const i = n.getState().stateComponents.get(t);
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
  formElements: E,
  middleware: f,
  reactiveDeps: m,
  componentId: w,
  initState: I,
  syncUpdate: s
} = {}) {
  const [e, v] = _.useState({}), { sessionId: x } = St();
  let j = !i;
  const [c] = _.useState(i ?? q()), L = n.getState().stateLog[c], z = _.useRef(/* @__PURE__ */ new Set()), l = _.useRef(w ?? q()), V = _.useRef(null);
  V.current = k(c), _.useEffect(() => {
    if (s && s.stateKey === c && s.path?.[0]) {
      A(c, (r) => ({
        ...r,
        [s.path[0]]: s.newValue
      }));
      const a = `${s.stateKey}:${s.path.join(".")}`;
      n.getState().setSyncInfo(a, {
        timeStamp: s.timeStamp,
        userId: s.userId
      });
    }
  }, [s]), _.useEffect(() => {
    if (I) {
      const { initialState: a, dependencies: r } = I;
      K(c, {
        initState: I
      });
      const d = ot(
        x + "-" + c + "-" + I?.localStorageKey
      );
      let p = a;
      d && d.lastUpdated > (d.lastSyncedWithServer || 0) && (p = d.state), vt(
        c,
        a,
        p,
        P,
        l.current,
        x
      ), yt(c);
    }
  }, [I?.localStorageKey, ...I?.dependencies || []]), _.useEffect(() => {
    j && K(c, {
      serverSync: S,
      formElements: E,
      zodSchema: u,
      initState: I,
      localStorage: g,
      middleware: f
    });
    const a = `${c}////${l.current}`, r = n.getState().stateComponents.get(c) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(a, {
      forceUpdate: () => v({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: m || void 0
    }), n.getState().stateComponents.set(c, r), () => {
      const d = `${c}////${l.current}`;
      r && (r.components.delete(d), r.components.size === 0 && n.getState().stateComponents.delete(c));
    };
  }, []);
  const P = (a, r, d, p) => {
    if (Array.isArray(r)) {
      const $ = `${c}-${r.join(".")}`;
      z.current.add($);
    }
    A(c, ($) => {
      const N = nt(a) ? a($) : a, B = `${c}-${r.join(".")}`;
      if (B) {
        const F = n.getState().signalDomElements.get(B);
        if (F) {
          const y = W(N, r);
          F.forEach(({ parentId: T, position: O }) => {
            const C = document.querySelector(
              `[data-parent-id="${T}"]`
            );
            if (C) {
              const b = Array.from(C.childNodes);
              b[O] && (b[O].textContent = String(y));
            }
          });
        }
      }
      d.updateType === "update" && (p || V.current?.validationKey) && r && D(
        (p || V.current?.validationKey) + "." + r.join(".")
      );
      const U = r.slice(0, r.length - 1);
      d.updateType === "cut" && V.current?.validationKey && D(
        V.current?.validationKey + "." + U.join(".")
      ), d.updateType === "insert" && V.current?.validationKey && gt(
        V.current?.validationKey + "." + U.join(".")
      ).filter(([y, T]) => {
        let O = y?.split(".").length;
        if (y == U.join(".") && O == U.length - 1) {
          let C = y + "." + U;
          D(y), mt(C, T);
        }
      });
      const at = W($, r), it = W(N, r), st = d.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), H = n.getState().stateComponents.get(c);
      if (H) {
        for (const [
          F,
          y
        ] of H.components.entries())
          if (y.depsFunction || y.paths && y.paths.has(st))
            if (y.depsFunction) {
              const T = y.depsFunction(N);
              typeof T == "boolean" ? T && y.forceUpdate() : M(y.deps, T) || (y.deps = T, y.forceUpdate());
            } else
              y.forceUpdate();
      }
      const Q = {
        timeStamp: Date.now(),
        stateKey: c,
        path: r,
        updateType: d.updateType,
        status: "new",
        oldValue: at,
        newValue: it
      };
      if (ft(c, (F) => {
        const T = [...F ?? [], Q].reduce((O, C) => {
          const b = `${C.stateKey}:${JSON.stringify(C.path)}`, h = O.get(b);
          return h ? (h.timeStamp = Math.max(
            h.timeStamp,
            C.timeStamp
          ), h.newValue = C.newValue, h.oldValue = h.oldValue ?? C.oldValue, h.updateType = C.updateType) : O.set(b, { ...C }), O;
        }, /* @__PURE__ */ new Map());
        return Array.from(T.values());
      }), It(
        N,
        c,
        V.current,
        x
      ), f && f({ updateLog: L, update: Q }), V.current?.serverSync) {
        const F = n.getState().serverState[c], y = V.current?.serverSync;
        pt(c, {
          syncKey: typeof y.syncKey == "string" ? y.syncKey : y.syncKey({ state: N }),
          rollBackState: F,
          actionTimeStamp: Date.now() + (y.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return N;
    });
  };
  n.getState().updaterState[c] || (console.log("Initializing state for", c, t), R(
    c,
    G(
      c,
      P,
      l.current,
      x
    )
  ), n.getState().cogsStateStore[c] || A(c, t), n.getState().initialStateGlobal[c] || J(c, t));
  const o = _.useMemo(() => G(
    c,
    P,
    l.current,
    x
  ), [c]);
  return [rt(c), o];
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
    const g = u.parentElement, f = Array.from(g.childNodes).indexOf(u);
    let m = g.getAttribute("data-parent-id");
    m || (m = `parent-${crypto.randomUUID()}`, g.setAttribute("data-parent-id", m));
    const I = { instanceId: `instance-${crypto.randomUUID()}`, parentId: m, position: f };
    n.getState().addSignalElement(S, I);
    const s = document.createTextNode(
      String(
        n.getState().getNestedState(t._stateKey, t._path)
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
  let E = 0;
  const f = (s) => {
    const e = s.join(".");
    for (const [v] of g)
      (v === e || v.startsWith(e + ".")) && g.delete(v);
    E++;
  }, m = /* @__PURE__ */ new Map(), w = {
    removeValidation: (s) => {
      s?.validationKey && D(s.validationKey);
    },
    revertToInitialState: (s) => {
      s?.validationKey && D(s.validationKey);
      const e = n.getState().initialStateGlobal[t];
      g.clear(), E++;
      const v = I(e, []);
      _.startTransition(() => {
        R(t, v), A(t, e);
        const x = n.getState().stateComponents.get(t);
        x && x.components.forEach((c) => {
          c.forceUpdate();
        });
        const j = k(t);
        j?.initState && localStorage.removeItem(
          j?.initState ? u + "-" + t + "-" + j?.initState.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (s) => {
      g.clear(), E++;
      const e = G(
        t,
        i,
        S,
        u
      );
      return _.startTransition(() => {
        J(t, s), R(t, e), A(t, s);
        const v = n.getState().stateComponents.get(t);
        v && v.components.forEach((x) => {
          x.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (v) => e.get()[v]
      };
    },
    _initialState: n.getState().initialStateGlobal[t],
    _serverState: n.getState().serverState[t],
    _isLoading: n.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const s = n.getState().serverState[t];
      return !!(s && M(s, rt(t)));
    }
  };
  function I(s, e = [], v) {
    const x = e.map(String).join("."), j = g.get(x);
    if (j?.stateVersion === E)
      return j.proxy;
    const c = {
      get(z, l) {
        if (l !== "then" && l !== "$get") {
          const o = e.join("."), a = `${t}////${S}`, r = n.getState().stateComponents.get(t);
          if (r && o) {
            const d = r.components.get(a);
            d && d.paths.add(o);
          }
        }
        if (l === "lastSynced") {
          const o = `${t}:${e.join(".")}`;
          return n.getState().getSyncInfo(o);
        }
        if (l === "_selected") {
          const o = e.slice(0, -1), a = o.join("."), r = n.getState().getNestedState(t, o);
          return Array.isArray(r) ? Number(e[e.length - 1]) === m.get(a) : void 0;
        }
        if (l == "getLocalStorage")
          return (o) => ot(
            u + "-" + t + "-" + o
          );
        if (l === "setSelected")
          return (o) => {
            const a = e.slice(0, -1), r = Number(e[e.length - 1]), d = a.join(".");
            o ? m.set(d, r) : m.delete(d);
            const p = n.getState().getNestedState(t, [...a]);
            Y(i, p, a), f(a);
          };
        if (e.length == 0) {
          if (l == "_componentId") return S;
          if (l === "_initialState")
            return n.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return n.getState().serverState[t];
          if (l === "_isLoading")
            return n.getState().isLoadingGlobal[t];
          if (l === "revertToInitialState")
            return w.revertToInitialState;
          if (l === "updateInitialState")
            return w.updateInitialState;
          if (l === "removeValidation")
            return w.removeValidation;
        }
        if (l === "validationWrapper")
          return ({
            children: o,
            hideMessage: a
          }) => /* @__PURE__ */ X.jsx(
            lt,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: n.getState().getInitialOptions(t)?.validationKey || "",
              stateKey: t,
              validIndices: v?.validIndices,
              children: o
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return e;
        if (l === "_isServerSynced") return w._isServerSynced;
        if (l === "update")
          return (o, a) => {
            f(e), Y(i, o, e, "");
          };
        if (l === "get")
          return () => n.getState().getNestedState(t, e);
        if (l === "$get")
          return () => et({ _stateKey: t, _path: e });
        if (l === "formElement")
          return (o, a, r) => /* @__PURE__ */ X.jsx(
            dt,
            {
              setState: i,
              validationKey: o,
              stateKey: t,
              path: e,
              child: a,
              formOpts: r
            }
          );
        if (Array.isArray(s)) {
          if (l === "getSelected")
            return () => {
              const o = m.get(
                e.join(".")
              );
              if (o !== void 0)
                return I(
                  s[o],
                  [...e, o.toString()],
                  v
                );
            };
          if (l === "$get")
            return () => et({ _stateKey: t, _path: e });
          if (l === "stateEach")
            return (o) => {
              const a = v?.filtered?.some(
                (d) => d.join(".") === e.join(".")
              ), r = a ? s : n.getState().getNestedState(t, e);
              return g.clear(), E++, r.map((d, p) => {
                const $ = a && d.__origIndex ? d.__origIndex : p, N = I(
                  d,
                  [...e, $.toString()],
                  v
                );
                return o(
                  d,
                  N,
                  p,
                  s,
                  I(
                    s,
                    e,
                    v
                  )
                );
              });
            };
          if (l === "stateFlattenOn")
            return (o) => {
              const r = v?.filtered?.some(
                (p) => p.join(".") === e.join(".")
              ) ? s : n.getState().getNestedState(t, e);
              g.clear(), E++;
              const d = r.flatMap(
                (p, $) => p[o] ?? []
              );
              return I(
                d,
                [...e, "[*]", o],
                v
              );
            };
          if (l === "findWith")
            return (o, a) => {
              const r = s.findIndex(
                ($) => $[o] === a
              );
              if (r === -1) return;
              const d = s[r], p = [...e, r.toString()];
              return g.clear(), E++, I(d, p);
            };
          if (l === "index")
            return (o) => {
              const a = s[o];
              return I(a, [
                ...e,
                o.toString()
              ]);
            };
          if (l === "insert")
            return (o) => (f(e), Z(
              i,
              o,
              e,
              t
            ), I(
              n.getState().cogsStateStore[t],
              []
            ));
          if (l === "uniqueInsert")
            return (o, a) => {
              const r = n.getState().getNestedState(t, e), d = nt(o) ? o(r) : o;
              !r.some(($) => a ? a.every(
                (N) => M(
                  $[N],
                  d[N]
                )
              ) : M($, d)) && (f(e), Z(
                i,
                d,
                e,
                t
              ));
            };
          if (l === "cut")
            return (o, a) => {
              a?.waitForSync || (f(e), ut(i, e, t, o));
            };
          if (l === "stateFilter")
            return (o) => {
              const a = s.map(
                (p, $) => ({
                  ...p,
                  __origIndex: $.toString()
                })
              ), r = [], d = [];
              for (let p = 0; p < a.length; p++)
                o(a[p], p) && (r.push(p), d.push(a[p]));
              return g.clear(), E++, I(
                d,
                e,
                {
                  filtered: [...v?.filtered || [], e],
                  validIndices: r
                  // Pass through the meta
                }
              );
            };
        }
        const V = [...e, l], P = n.getState().getNestedState(t, V);
        return I(P, V, v);
      }
    }, L = new Proxy(w, c);
    return g.set(x, {
      proxy: L,
      stateVersion: E
    }), L;
  }
  return I(
    n.getState().getNestedState(t, [])
  );
}
function et(t) {
  return _.createElement(_t, { proxy: t });
}
function At(t) {
  const i = _.useSyncExternalStore(
    (S) => {
      const u = n.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(t._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => u.components.delete(t._stateKey);
    },
    () => n.getState().getNestedState(t._stateKey, t._path)
  );
  return _.createElement("text", {}, String(i));
}
export {
  et as $cogsSignal,
  At as $cogsSignalStore,
  Ot as addStateOptions,
  ht as createCogsState,
  Et as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
