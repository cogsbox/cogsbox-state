"use client";
import { j as X } from "./node_modules/react/jsx-runtime.jsx";
import { r as E } from "./node_modules/react/index.js";
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
  const S = o.getState().getInitialOptions, u = o.getState().setInitialStateOptions, m = S(t) || {};
  u(t, {
    ...m,
    ...i
  });
}
function et({
  stateKey: t,
  options: i,
  initialOptionsPart: S
}) {
  const u = J(t) || {}, m = S[t] || {}, _ = o.getState().setInitialStateOptions, g = { ...m, ...u };
  let f = !1;
  if (i)
    for (const w in i)
      g.hasOwnProperty(w) || (f = !0, g[w] = i[w]);
  f && _(t, g);
}
const At = (t) => {
  let i = t;
  const [S, u] = lt(i);
  o.getState().setInitialStates(S);
  const m = (g, f) => {
    const [w] = E.useState(k());
    et({ stateKey: g, options: f, initialOptionsPart: u });
    const p = o.getState().cogsStateStore[g] || S[g], s = f?.modifyState ? f.modifyState(p) : p, [e, y] = Et(
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
    return y;
  };
  function _(g, f) {
    et({ stateKey: g, options: f, initialOptionsPart: u });
  }
  return { useCogsState: m, setCogsOptions: _ };
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
    const m = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: o.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: o.getState().serverState[i]
    }, _ = S.initState ? `${u}-${i}-${S.initState.localStorageKey}` : i;
    window.localStorage.setItem(_, JSON.stringify(m));
  }
}, It = (t, i, S, u, m, _) => {
  const g = {
    initialState: i,
    updaterState: G(
      t,
      u,
      m,
      _
    ),
    state: S
  };
  E.startTransition(() => {
    z(t, g.initialState), R(t, g.updaterState), P(t, g.state);
  });
}, vt = (t) => {
  const i = o.getState().stateComponents.get(t);
  if (!i) return;
  const S = /* @__PURE__ */ new Set();
  i.components.forEach((u) => {
    S.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    E.startTransition(() => {
      S.forEach((u) => u());
    });
  });
};
function Et(t, {
  stateKey: i,
  serverSync: S,
  zodSchema: u,
  localStorage: m,
  formElements: _,
  middleware: g,
  reactiveDeps: f,
  componentId: w,
  initState: p,
  syncUpdate: s
} = {}) {
  const [e, y] = E.useState({}), { sessionId: $ } = St();
  let j = !i;
  const [c] = E.useState(i ?? k()), L = o.getState().stateLog[c], B = E.useRef(/* @__PURE__ */ new Set()), l = E.useRef(w ?? k()), x = E.useRef(null);
  x.current = J(c), E.useEffect(() => {
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
  }, [s]), E.useEffect(() => {
    tt(c, {
      initState: p
    });
    const a = at(
      $ + "-" + c + "-" + p?.localStorageKey
    );
    let n = null;
    p?.initialState && (n = p?.initialState, a && a.lastUpdated > (a.lastSyncedWithServer || 0) && (n = a.state), It(
      c,
      p?.initialState,
      n,
      h,
      l.current,
      $
    )), vt(c);
  }, [p?.localStorageKey, ...p?.dependencies || []]), E.useEffect(() => {
    j && tt(c, {
      serverSync: S,
      formElements: _,
      zodSchema: u,
      initState: p,
      localStorage: m,
      middleware: g
    });
    const a = `${c}////${l.current}`, n = o.getState().stateComponents.get(c) || {
      components: /* @__PURE__ */ new Map()
    };
    return console.log("stateEntry", n), n.components.set(a, {
      forceUpdate: () => y({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: f || void 0
    }), o.getState().stateComponents.set(c, n), console.log(
      "   getGlobalStore.getState().stateComponent",
      o.getState().stateComponents
    ), () => {
      const d = `${c}////${l.current}`;
      n && (n.components.delete(d), n.components.size === 0 && o.getState().stateComponents.delete(c));
    };
  }, []);
  const h = (a, n, d, I) => {
    if (Array.isArray(n)) {
      const C = `${c}-${n.join(".")}`;
      B.current.add(C);
    }
    P(c, (C) => {
      const V = ot(a) ? a(C) : a, H = `${c}-${n.join(".")}`;
      if (H) {
        const F = o.getState().signalDomElements.get(H);
        if (F) {
          const v = q(V, n);
          F.forEach(({ parentId: T, position: O }) => {
            const N = document.querySelector(
              `[data-parent-id="${T}"]`
            );
            if (N) {
              const U = Array.from(N.childNodes);
              U[O] && (U[O].textContent = String(v));
            }
          });
        }
      }
      d.updateType === "update" && (I || x.current?.validationKey) && n && D(
        (I || x.current?.validationKey) + "." + n.join(".")
      );
      const b = n.slice(0, n.length - 1);
      d.updateType === "cut" && x.current?.validationKey && D(
        x.current?.validationKey + "." + b.join(".")
      ), d.updateType === "insert" && x.current?.validationKey && gt(
        x.current?.validationKey + "." + b.join(".")
      ).filter(([v, T]) => {
        let O = v?.split(".").length;
        if (v == b.join(".") && O == b.length - 1) {
          let N = v + "." + b;
          D(v), mt(N, T);
        }
      });
      const it = q(C, n), st = q(V, n), ct = d.updateType === "update" ? n.join(".") : [...n].slice(0, -1).join("."), W = o.getState().stateComponents.get(c);
      if (console.log("stateEntry", W), W) {
        for (const [
          F,
          v
        ] of W.components.entries())
          if (v.depsFunction || v.paths && v.paths.has(ct))
            if (v.depsFunction) {
              const T = v.depsFunction(V);
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
      ), g && g({ updateLog: L, update: Q }), x.current?.serverSync) {
        const F = o.getState().serverState[c], v = x.current?.serverSync;
        pt(c, {
          syncKey: typeof v.syncKey == "string" ? v.syncKey : v.syncKey({ state: V }),
          rollBackState: F,
          actionTimeStamp: Date.now() + (v.debounce ?? 3e3),
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
  const r = E.useMemo(() => G(
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
  const i = E.useRef(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return E.useEffect(() => {
    const u = i.current;
    if (!u || !u.parentElement) {
      console.log("No element or parent");
      return;
    }
    const m = u.parentElement, g = Array.from(m.childNodes).indexOf(u);
    let f = m.getAttribute("data-parent-id");
    f || (f = `parent-${crypto.randomUUID()}`, m.setAttribute("data-parent-id", f));
    const p = { instanceId: `instance-${crypto.randomUUID()}`, parentId: f, position: g };
    o.getState().addSignalElement(S, p);
    const s = document.createTextNode(
      String(
        o.getState().getNestedState(t._stateKey, t._path)
      )
    );
    u.replaceWith(s);
  }, [t._stateKey, t._path.join(".")]), E.createElement("span", {
    ref: i,
    style: { display: "none" }
  });
}
function G(t, i, S, u) {
  const m = /* @__PURE__ */ new Map();
  let _ = 0;
  const g = (s) => {
    const e = s.join(".");
    for (const [y] of m)
      (y === e || y.startsWith(e + ".")) && m.delete(y);
    _++;
  }, f = /* @__PURE__ */ new Map(), w = {
    removeValidation: (s) => {
      s?.validationKey && D(s.validationKey);
    },
    revertToInitialState: (s) => {
      s?.validationKey && D(s.validationKey);
      const e = o.getState().initialStateGlobal[t];
      m.clear(), _++;
      const y = p(e, []);
      E.startTransition(() => {
        R(t, y), P(t, e);
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
      m.clear(), _++;
      const e = G(
        t,
        i,
        S,
        u
      );
      return E.startTransition(() => {
        z(t, s), R(t, e), P(t, s);
        const y = o.getState().stateComponents.get(t);
        y && y.components.forEach(($) => {
          $.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (y) => e.get()[y]
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
  function p(s, e = [], y) {
    const $ = e.map(String).join("."), j = m.get($);
    if (j?.stateVersion === _)
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
          return Array.isArray(n) ? Number(e[e.length - 1]) === f.get(a) : void 0;
        }
        if (l == "getLocalStorage")
          return (r) => at(
            u + "-" + t + "-" + r
          );
        if (l === "setSelected")
          return (r) => {
            const a = e.slice(0, -1), n = Number(e[e.length - 1]), d = a.join(".");
            r ? f.set(d, n) : f.delete(d);
            const I = o.getState().getNestedState(t, [...a]);
            Y(i, I, a), g(a);
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
            return w.revertToInitialState;
          if (l === "updateInitialState")
            return w.updateInitialState;
          if (l === "removeValidation")
            return w.removeValidation;
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
              validIndices: y?.validIndices,
              children: r
            }
          );
        if (l === "_stateKey") return t;
        if (l === "_path") return e;
        if (l === "_isServerSynced") return w._isServerSynced;
        if (l === "update")
          return (r, a) => {
            g(e), Y(i, r, e, "");
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
              const r = f.get(
                e.join(".")
              );
              if (r !== void 0)
                return p(
                  s[r],
                  [...e, r.toString()],
                  y
                );
            };
          if (l === "$get")
            return () => nt({ _stateKey: t, _path: e });
          if (l === "stateEach")
            return (r) => {
              const a = y?.filtered?.some(
                (d) => d.join(".") === e.join(".")
              ), n = a ? s : o.getState().getNestedState(t, e);
              return m.clear(), _++, n.map((d, I) => {
                const C = a && d.__origIndex ? d.__origIndex : I, V = p(
                  d,
                  [...e, C.toString()],
                  y
                );
                return r(
                  d,
                  V,
                  I,
                  s,
                  p(
                    s,
                    e,
                    y
                  )
                );
              });
            };
          if (l === "stateFlattenOn")
            return (r) => {
              const n = y?.filtered?.some(
                (I) => I.join(".") === e.join(".")
              ) ? s : o.getState().getNestedState(t, e);
              m.clear(), _++;
              const d = n.flatMap(
                (I, C) => I[r] ?? []
              );
              return p(
                d,
                [...e, "[*]", r],
                y
              );
            };
          if (l === "findWith")
            return (r, a) => {
              const n = s.findIndex(
                (V) => V[r] === a
              );
              if (n === -1) return;
              const d = s[n], I = [...e, n.toString()];
              return {
                ...p(
                  d,
                  I
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
              return p(a, [
                ...e,
                r.toString()
              ]);
            };
          if (l === "insert")
            return (r) => (g(e), K(
              i,
              r,
              e,
              t
            ), p(
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
              ) : M(C, d)) && (g(e), K(
                i,
                d,
                e,
                t
              ));
            };
          if (l === "cut")
            return (r, a) => {
              a?.waitForSync || (g(e), Z(i, e, t, r));
            };
          if (l === "stateFilter")
            return (r) => {
              const a = s.map(
                (I, C) => ({
                  ...I,
                  __origIndex: C.toString()
                })
              ), n = [], d = [];
              for (let I = 0; I < a.length; I++)
                r(a[I], I) && (n.push(I), d.push(a[I]));
              return m.clear(), _++, p(
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
        const x = [...e, l], h = o.getState().getNestedState(t, x);
        return p(h, x, y);
      }
    }, L = new Proxy(w, c);
    return m.set($, {
      proxy: L,
      stateVersion: _
    }), L;
  }
  return p(
    o.getState().getNestedState(t, [])
  );
}
function nt(t) {
  return E.createElement(_t, { proxy: t });
}
function Pt(t) {
  const i = E.useSyncExternalStore(
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
  return E.createElement("text", {}, String(i));
}
export {
  nt as $cogsSignal,
  Pt as $cogsSignalStore,
  Ot as addStateOptions,
  At as createCogsState,
  Et as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
