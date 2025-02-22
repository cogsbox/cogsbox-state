"use client";
import { j as X } from "./node_modules/react/jsx-runtime.jsx";
import { r as E } from "./node_modules/react/index.js";
import { transformStateFunc as lt, isFunction as rt, getNestedValue as W, isDeepEqual as M } from "./utility.js";
import { updateFn as Y, ValidationWrapper as dt, FormControlComponent as ut, cutFunc as Z, pushFunc as K } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r } from "./store.js";
import { useCogsConfig as St } from "./CogsStateClient.jsx";
import q from "./node_modules/uuid/dist/esm-browser/v4.js";
function Ot(t, { formElements: a, zodSchema: S }) {
  return { initialState: t, formElements: a, zodSchema: S };
}
function tt(t, a) {
  const S = r.getState().getInitialOptions, u = r.getState().setInitialStateOptions, p = S(t) || {};
  u(t, {
    ...p,
    ...a
  });
}
function et({
  stateKey: t,
  options: a,
  initialOptionsPart: S
}) {
  const u = k(t) || {}, p = S[t] || {}, _ = r.getState().setInitialStateOptions, g = { ...p, ...u };
  let f = !1;
  if (a)
    for (const w in a)
      g.hasOwnProperty(w) || (f = !0, g[w] = a[w]);
  f && _(t, g);
}
const At = (t) => {
  let a = t;
  const [S, u] = lt(a);
  r.getState().setInitialStates(S);
  const p = (g, f) => {
    const [w] = E.useState(q());
    et({ stateKey: g, options: f, initialOptionsPart: u });
    const I = r.getState().cogsStateStore[g] || S[g], s = f?.modifyState ? f.modifyState(I) : I, [e, y] = Et(
      s,
      {
        stateKey: g,
        syncUpdate: f?.syncUpdate,
        componentId: w,
        localStorage: f?.localStorage,
        middleware: f?.middleware,
        enabledSync: f?.enabledSync,
        reactiveDeps: f?.reactiveDeps,
        initState: f?.initState
      }
    );
    return [e, y];
  };
  function _(g, f) {
    et({ stateKey: g, options: f, initialOptionsPart: u });
  }
  return { useCogsState: p, setCogsOptions: _ };
}, {
  setUpdaterState: R,
  setState: P,
  getInitialOptions: k,
  getKeyState: ot,
  getValidationErrors: gt,
  setStateLog: ft,
  updateInitialStateGlobal: J,
  addValidationError: mt,
  removeValidationError: D,
  setServerSyncActions: pt
} = r.getState(), at = (t) => {
  if (!t) return null;
  try {
    const a = window.localStorage.getItem(t);
    return a ? JSON.parse(a) : null;
  } catch (a) {
    return console.error("Error loading from localStorage:", a), null;
  }
}, It = (t, a, S, u) => {
  if (S?.initState) {
    const p = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[a]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[a]
    }, _ = S.initState ? `${u}-${a}-${S.initState.localStorageKey}` : a;
    window.localStorage.setItem(_, JSON.stringify(p));
  }
}, yt = (t, a, S, u, p, _) => {
  const g = {
    initialState: a,
    updaterState: G(
      t,
      u,
      p,
      _
    ),
    state: S
  };
  E.startTransition(() => {
    J(t, g.initialState), R(t, g.updaterState), P(t, g.state);
  });
}, vt = (t) => {
  const a = r.getState().stateComponents.get(t);
  if (!a) return;
  const S = /* @__PURE__ */ new Set();
  a.components.forEach((u) => {
    S.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    E.startTransition(() => {
      S.forEach((u) => u());
    });
  });
};
function Et(t, {
  stateKey: a,
  serverSync: S,
  zodSchema: u,
  localStorage: p,
  formElements: _,
  middleware: g,
  reactiveDeps: f,
  componentId: w,
  initState: I,
  syncUpdate: s
} = {}) {
  const [e, y] = E.useState({}), { sessionId: $ } = St();
  let j = !a;
  const [c] = E.useState(a ?? q()), L = r.getState().stateLog[c], z = E.useRef(/* @__PURE__ */ new Set()), l = E.useRef(w ?? q()), x = E.useRef(null);
  x.current = k(c), E.useEffect(() => {
    if (s && s.stateKey === c && s.path?.[0]) {
      P(c, (n) => ({
        ...n,
        [s.path[0]]: s.newValue
      }));
      const i = `${s.stateKey}:${s.path.join(".")}`;
      r.getState().setSyncInfo(i, {
        timeStamp: s.timeStamp,
        userId: s.userId
      });
    }
  }, [s]), E.useEffect(() => {
    if (I) {
      const { initialState: i, dependencies: n } = I;
      tt(c, {
        initState: I
      });
      const d = at(
        $ + "-" + c + "-" + I?.localStorageKey
      );
      let m = i;
      d && d.lastUpdated > (d.lastSyncedWithServer || 0) && (m = d.state), yt(
        c,
        i,
        m,
        h,
        l.current,
        $
      ), vt(c);
    }
  }, [I?.localStorageKey, ...I?.dependencies || []]), E.useEffect(() => {
    j && tt(c, {
      serverSync: S,
      formElements: _,
      zodSchema: u,
      initState: I,
      localStorage: p,
      middleware: g
    });
    const i = `${c}////${l.current}`, n = r.getState().stateComponents.get(c) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(i, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: f || void 0
    }), r.getState().stateComponents.set(c, n), () => {
      const d = `${c}////${l.current}`;
      n && (n.components.delete(d), n.components.size === 0 && r.getState().stateComponents.delete(c));
    };
  }, []);
  const h = (i, n, d, m) => {
    if (Array.isArray(n)) {
      const V = `${c}-${n.join(".")}`;
      z.current.add(V);
    }
    P(c, (V) => {
      const C = rt(i) ? i(V) : i, B = `${c}-${n.join(".")}`;
      if (B) {
        const F = r.getState().signalDomElements.get(B);
        if (F) {
          const v = W(C, n);
          F.forEach(({ parentId: T, position: O }) => {
            const N = document.querySelector(
              `[data-parent-id="${T}"]`
            );
            if (N) {
              const b = Array.from(N.childNodes);
              b[O] && (b[O].textContent = String(v));
            }
          });
        }
      }
      d.updateType === "update" && (m || x.current?.validationKey) && n && D(
        (m || x.current?.validationKey) + "." + n.join(".")
      );
      const U = n.slice(0, n.length - 1);
      d.updateType === "cut" && x.current?.validationKey && D(
        x.current?.validationKey + "." + U.join(".")
      ), d.updateType === "insert" && x.current?.validationKey && gt(
        x.current?.validationKey + "." + U.join(".")
      ).filter(([v, T]) => {
        let O = v?.split(".").length;
        if (v == U.join(".") && O == U.length - 1) {
          let N = v + "." + U;
          D(v), mt(N, T);
        }
      });
      const it = W(V, n), st = W(C, n), ct = d.updateType === "update" ? n.join(".") : [...n].slice(0, -1).join("."), H = r.getState().stateComponents.get(c);
      if (H) {
        for (const [
          F,
          v
        ] of H.components.entries())
          if (v.depsFunction || v.paths && v.paths.has(ct))
            if (v.depsFunction) {
              const T = v.depsFunction(C);
              typeof T == "boolean" ? T && v.forceUpdate() : M(v.deps, T) || (v.deps = T, v.forceUpdate());
            } else
              v.forceUpdate();
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
          const b = `${N.stateKey}:${JSON.stringify(N.path)}`, A = O.get(b);
          return A ? (A.timeStamp = Math.max(
            A.timeStamp,
            N.timeStamp
          ), A.newValue = N.newValue, A.oldValue = A.oldValue ?? N.oldValue, A.updateType = N.updateType) : O.set(b, { ...N }), O;
        }, /* @__PURE__ */ new Map());
        return Array.from(T.values());
      }), It(
        C,
        c,
        x.current,
        $
      ), g && g({ updateLog: L, update: Q }), x.current?.serverSync) {
        const F = r.getState().serverState[c], v = x.current?.serverSync;
        pt(c, {
          syncKey: typeof v.syncKey == "string" ? v.syncKey : v.syncKey({ state: C }),
          rollBackState: F,
          actionTimeStamp: Date.now() + (v.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return C;
    });
  };
  r.getState().updaterState[c] || (console.log("Initializing state for", c, t), R(
    c,
    G(
      c,
      h,
      l.current,
      $
    )
  ), r.getState().cogsStateStore[c] || P(c, t), r.getState().initialStateGlobal[c] || J(c, t));
  const o = E.useMemo(() => G(
    c,
    h,
    l.current,
    $
  ), [c]);
  return [ot(c), o];
}
function _t({
  proxy: t
}) {
  const a = E.useRef(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return E.useEffect(() => {
    const u = a.current;
    if (!u || !u.parentElement) {
      console.log("No element or parent");
      return;
    }
    const p = u.parentElement, g = Array.from(p.childNodes).indexOf(u);
    let f = p.getAttribute("data-parent-id");
    f || (f = `parent-${crypto.randomUUID()}`, p.setAttribute("data-parent-id", f));
    const I = { instanceId: `instance-${crypto.randomUUID()}`, parentId: f, position: g };
    r.getState().addSignalElement(S, I);
    const s = document.createTextNode(
      String(
        r.getState().getNestedState(t._stateKey, t._path)
      )
    );
    u.replaceWith(s);
  }, [t._stateKey, t._path.join(".")]), E.createElement("span", {
    ref: a,
    style: { display: "none" }
  });
}
function G(t, a, S, u) {
  const p = /* @__PURE__ */ new Map();
  let _ = 0;
  const g = (s) => {
    const e = s.join(".");
    for (const [y] of p)
      (y === e || y.startsWith(e + ".")) && p.delete(y);
    _++;
  }, f = /* @__PURE__ */ new Map(), w = {
    removeValidation: (s) => {
      s?.validationKey && D(s.validationKey);
    },
    revertToInitialState: (s) => {
      s?.validationKey && D(s.validationKey);
      const e = r.getState().initialStateGlobal[t];
      p.clear(), _++;
      const y = I(e, []);
      E.startTransition(() => {
        R(t, y), P(t, e);
        const $ = r.getState().stateComponents.get(t);
        $ && $.components.forEach((c) => {
          c.forceUpdate();
        });
        const j = k(t);
        j?.initState && localStorage.removeItem(
          j?.initState ? u + "-" + t + "-" + j?.initState.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (s) => {
      p.clear(), _++;
      const e = G(
        t,
        a,
        S,
        u
      );
      return E.startTransition(() => {
        J(t, s), R(t, e), P(t, s);
        const y = r.getState().stateComponents.get(t);
        y && y.components.forEach(($) => {
          $.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (y) => e.get()[y]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const s = r.getState().serverState[t];
      return !!(s && M(s, ot(t)));
    }
  };
  function I(s, e = [], y) {
    const $ = e.map(String).join("."), j = p.get($);
    if (j?.stateVersion === _)
      return j.proxy;
    const c = {
      get(z, l) {
        if (l !== "then" && l !== "$get") {
          const o = e.join("."), i = `${t}////${S}`, n = r.getState().stateComponents.get(t);
          if (n && o) {
            const d = n.components.get(i);
            d && d.paths.add(o);
          }
        }
        if (l === "lastSynced") {
          const o = `${t}:${e.join(".")}`;
          return r.getState().getSyncInfo(o);
        }
        if (l === "_selected") {
          const o = e.slice(0, -1), i = o.join("."), n = r.getState().getNestedState(t, o);
          return Array.isArray(n) ? Number(e[e.length - 1]) === f.get(i) : void 0;
        }
        if (l == "getLocalStorage")
          return (o) => at(
            u + "-" + t + "-" + o
          );
        if (l === "setSelected")
          return (o) => {
            const i = e.slice(0, -1), n = Number(e[e.length - 1]), d = i.join(".");
            o ? f.set(d, n) : f.delete(d);
            const m = r.getState().getNestedState(t, [...i]);
            Y(a, m, i), g(i);
          };
        if (e.length == 0) {
          if (l == "_componentId") return S;
          if (l === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (l === "_serverState")
            return r.getState().serverState[t];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[t];
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
            hideMessage: i
          }) => /* @__PURE__ */ X.jsx(
            dt,
            {
              formOpts: i ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: r.getState().getInitialOptions(t)?.validationKey || "",
              stateKey: t,
              validIndices: y?.validIndices,
              children: o
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return e;
        if (l === "_isServerSynced") return w._isServerSynced;
        if (l === "update")
          return (o, i) => {
            g(e), Y(a, o, e, "");
          };
        if (l === "get")
          return () => r.getState().getNestedState(t, e);
        if (l === "$get")
          return () => nt({ _stateKey: t, _path: e });
        if (l === "formElement")
          return (o, i, n) => /* @__PURE__ */ X.jsx(
            ut,
            {
              setState: a,
              validationKey: o,
              stateKey: t,
              path: e,
              child: i,
              formOpts: n
            }
          );
        if (Array.isArray(s)) {
          if (l === "getSelected")
            return () => {
              const o = f.get(
                e.join(".")
              );
              if (o !== void 0)
                return I(
                  s[o],
                  [...e, o.toString()],
                  y
                );
            };
          if (l === "$get")
            return () => nt({ _stateKey: t, _path: e });
          if (l === "stateEach")
            return (o) => {
              const i = y?.filtered?.some(
                (d) => d.join(".") === e.join(".")
              ), n = i ? s : r.getState().getNestedState(t, e);
              return p.clear(), _++, n.map((d, m) => {
                const V = i && d.__origIndex ? d.__origIndex : m, C = I(
                  d,
                  [...e, V.toString()],
                  y
                );
                return o(
                  d,
                  C,
                  m,
                  s,
                  I(
                    s,
                    e,
                    y
                  )
                );
              });
            };
          if (l === "stateFlattenOn")
            return (o) => {
              const n = y?.filtered?.some(
                (m) => m.join(".") === e.join(".")
              ) ? s : r.getState().getNestedState(t, e);
              p.clear(), _++;
              const d = n.flatMap(
                (m, V) => m[o] ?? []
              );
              return I(
                d,
                [...e, "[*]", o],
                y
              );
            };
          if (l === "findWith")
            return (o, i) => {
              const n = s.findIndex(
                (C) => C[o] === i
              );
              if (n === -1) return;
              const d = s[n], m = [...e, n.toString()];
              return {
                ...I(
                  d,
                  m
                ),
                cut: () => {
                  Z(
                    a,
                    e,
                    t,
                    n
                  );
                }
              };
            };
          if (l === "index")
            return (o) => {
              const i = s[o];
              return I(i, [
                ...e,
                o.toString()
              ]);
            };
          if (l === "insert")
            return (o) => (g(e), K(
              a,
              o,
              e,
              t
            ), I(
              r.getState().cogsStateStore[t],
              []
            ));
          if (l === "uniqueInsert")
            return (o, i) => {
              const n = r.getState().getNestedState(t, e), d = rt(o) ? o(n) : o;
              !n.some((V) => i ? i.every(
                (C) => M(
                  V[C],
                  d[C]
                )
              ) : M(V, d)) && (g(e), K(
                a,
                d,
                e,
                t
              ));
            };
          if (l === "cut")
            return (o, i) => {
              i?.waitForSync || (g(e), Z(a, e, t, o));
            };
          if (l === "stateFilter")
            return (o) => {
              const i = s.map(
                (m, V) => ({
                  ...m,
                  __origIndex: V.toString()
                })
              ), n = [], d = [];
              for (let m = 0; m < i.length; m++)
                o(i[m], m) && (n.push(m), d.push(i[m]));
              return p.clear(), _++, I(
                d,
                e,
                {
                  filtered: [...y?.filtered || [], e],
                  validIndices: n
                  // Pass through the meta
                }
              );
            };
        }
        const x = [...e, l], h = r.getState().getNestedState(t, x);
        return I(h, x, y);
      }
    }, L = new Proxy(w, c);
    return p.set($, {
      proxy: L,
      stateVersion: _
    }), L;
  }
  return I(
    r.getState().getNestedState(t, [])
  );
}
function nt(t) {
  return E.createElement(_t, { proxy: t });
}
function Pt(t) {
  const a = E.useSyncExternalStore(
    (S) => {
      const u = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(t._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => u.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return E.createElement("text", {}, String(a));
}
export {
  nt as $cogsSignal,
  Pt as $cogsSignalStore,
  Ot as addStateOptions,
  At as createCogsState,
  Et as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
