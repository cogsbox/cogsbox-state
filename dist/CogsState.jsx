"use client";
import { j as Y } from "./node_modules/react/jsx-runtime.jsx";
import { r as w } from "./node_modules/react/index.js";
import { transformStateFunc as ut, isFunction as at, getNestedValue as R, isDeepEqual as L } from "./utility.js";
import { pushFunc as Z, cutFunc as K, updateFn as tt, ValidationWrapper as St, FormControlComponent as gt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as a } from "./store.js";
import { useCogsConfig as ft } from "./CogsStateClient.jsx";
import k from "./node_modules/uuid/dist/esm-browser/v4.js";
function Mt(t, { formElements: i, zodSchema: d }) {
  return { initialState: t, formElements: i, zodSchema: d };
}
function et(t, i) {
  const d = a.getState().getInitialOptions, u = a.getState().setInitialStateOptions, S = d(t) || {};
  u(t, {
    ...S,
    ...i
  });
}
function nt({
  stateKey: t,
  options: i,
  initialOptionsPart: d
}) {
  const u = z(t) || {}, S = d[t] || {}, I = a.getState().setInitialStateOptions, _ = { ...S, ...u };
  let E = !1;
  if (i)
    for (const y in i)
      _.hasOwnProperty(y) || (E = !0, _[y] = i[y]);
  E && I(t, _);
}
const Ot = (t, i) => {
  let d = t;
  const [u, S] = ut(d);
  a.getState().setInitialStates(u);
  const I = (E, y) => {
    const [p] = w.useState(k());
    nt({ stateKey: E, options: y, initialOptionsPart: S });
    const o = a.getState().cogsStateStore[E] || u[E], r = y?.modifyState ? y.modifyState(o) : o, [v, N] = wt(
      r,
      {
        stateKey: E,
        syncUpdate: y?.syncUpdate,
        componentId: p,
        localStorage: y?.localStorage,
        middleware: y?.middleware,
        enabledSync: y?.enabledSync,
        reactiveDeps: y?.reactiveDeps,
        initState: y?.initState
      }
    );
    return N;
  };
  function _(E, y) {
    nt({ stateKey: E, options: y, initialOptionsPart: S });
  }
  return { useCogsState: I, setCogsOptions: _ };
}, {
  setUpdaterState: G,
  setState: M,
  getInitialOptions: z,
  getKeyState: it,
  getValidationErrors: mt,
  setStateLog: yt,
  updateInitialStateGlobal: J,
  addValidationError: pt,
  removeValidationError: U,
  setServerSyncActions: vt
} = a.getState(), ot = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, It = (t, i, d, u) => {
  if (d?.initState) {
    const S = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: a.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: a.getState().serverState[i]
    }, I = d.initState ? `${u}-${i}-${d.initState.localStorageKey}` : i;
    window.localStorage.setItem(I, JSON.stringify(S));
  }
}, _t = (t, i, d, u, S, I) => {
  const _ = {
    initialState: i,
    updaterState: W(
      t,
      u,
      S,
      I
    ),
    state: d
  };
  w.startTransition(() => {
    J(t, _.initialState), G(t, _.updaterState), M(t, _.state);
  });
}, Et = (t) => {
  const i = a.getState().stateComponents.get(t);
  if (!i) return;
  const d = /* @__PURE__ */ new Set();
  i.components.forEach((u) => {
    d.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    w.startTransition(() => {
      d.forEach((u) => u());
    });
  });
};
function wt(t, {
  stateKey: i,
  serverSync: d,
  zodSchema: u,
  localStorage: S,
  formElements: I,
  middleware: _,
  reactiveDeps: E,
  componentId: y,
  initState: p,
  syncUpdate: o
} = {}) {
  const [r, v] = w.useState({}), { sessionId: N } = ft();
  let F = !i;
  const [c] = w.useState(i ?? k()), b = a.getState().stateLog[c], B = w.useRef(/* @__PURE__ */ new Set()), s = w.useRef(y ?? k()), A = w.useRef(null);
  A.current = z(c), w.useEffect(() => {
    if (o && o.stateKey === c && o.path?.[0]) {
      M(c, (n) => ({
        ...n,
        [o.path[0]]: o.newValue
      }));
      const e = `${o.stateKey}:${o.path.join(".")}`;
      a.getState().setSyncInfo(e, {
        timeStamp: o.timeStamp,
        userId: o.userId
      });
    }
  }, [o]), w.useEffect(() => {
    et(c, {
      initState: p
    });
    const e = ot(
      N + "-" + c + "-" + p?.localStorageKey
    );
    let n = null;
    p?.initialState && (n = p?.initialState, e && e.lastUpdated > (e.lastSyncedWithServer || 0) && (n = e.state), _t(
      c,
      p?.initialState,
      n,
      h,
      s.current,
      N
    )), Et(c);
  }, [p?.localStorageKey, ...p?.dependencies || []]), w.useEffect(() => {
    F && et(c, {
      serverSync: d,
      formElements: I,
      zodSchema: u,
      initState: p,
      localStorage: S,
      middleware: _
    });
    const e = `${c}////${s.current}`, n = a.getState().stateComponents.get(c) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(e, {
      forceUpdate: () => v({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0
    }), a.getState().stateComponents.set(c, n), () => {
      const l = `${c}////${s.current}`;
      n && (n.components.delete(l), n.components.size === 0 && a.getState().stateComponents.delete(c));
    };
  }, []);
  const h = (e, n, l, g) => {
    if (Array.isArray(n)) {
      const m = `${c}-${n.join(".")}`;
      B.current.add(m);
    }
    M(c, (m) => {
      const $ = at(e) ? e(m) : e, P = `${c}-${n.join(".")}`;
      if (P) {
        let j = !1, f = a.getState().signalDomElements.get(P);
        if ((!f || f.size === 0) && (l.updateType === "insert" || l.updateType === "cut")) {
          const V = n.slice(0, -1), x = R($, V);
          if (Array.isArray(x)) {
            j = !0;
            const T = `${c}-${V.join(".")}`;
            f = a.getState().signalDomElements.get(T);
          }
        }
        if (f) {
          const V = j ? R($, n.slice(0, -1)) : R($, n);
          f.forEach(({ parentId: x, position: T, effect: D }) => {
            const C = document.querySelector(
              `[data-parent-id="${x}"]`
            );
            if (C) {
              const X = Array.from(C.childNodes);
              if (X[T]) {
                const dt = D ? new Function(
                  "state",
                  `return (${D})(state)`
                )(V) : V;
                X[T].textContent = String(dt);
              }
            }
          });
        }
      }
      l.updateType === "update" && (g || A.current?.validationKey) && n && U(
        (g || A.current?.validationKey) + "." + n.join(".")
      );
      const O = n.slice(0, n.length - 1);
      l.updateType === "cut" && A.current?.validationKey && U(
        A.current?.validationKey + "." + O.join(".")
      ), l.updateType === "insert" && A.current?.validationKey && mt(
        A.current?.validationKey + "." + O.join(".")
      ).filter(([f, V]) => {
        let x = f?.split(".").length;
        if (f == O.join(".") && x == O.length - 1) {
          let T = f + "." + O;
          U(f), pt(T, V);
        }
      });
      const st = R(m, n), ct = R($, n), lt = l.updateType === "update" ? n.join(".") : [...n].slice(0, -1).join("."), H = a.getState().stateComponents.get(c);
      if (H) {
        for (const [
          j,
          f
        ] of H.components.entries())
          if (f.depsFunction || f.paths && f.paths.has(lt))
            if (f.depsFunction) {
              const V = f.depsFunction($);
              typeof V == "boolean" ? V && f.forceUpdate() : L(f.deps, V) || (f.deps = V, f.forceUpdate());
            } else
              f.forceUpdate();
      }
      const Q = {
        timeStamp: Date.now(),
        stateKey: c,
        path: n,
        updateType: l.updateType,
        status: "new",
        oldValue: st,
        newValue: ct
      };
      if (yt(c, (j) => {
        const V = [...j ?? [], Q].reduce((x, T) => {
          const D = `${T.stateKey}:${JSON.stringify(T.path)}`, C = x.get(D);
          return C ? (C.timeStamp = Math.max(
            C.timeStamp,
            T.timeStamp
          ), C.newValue = T.newValue, C.oldValue = C.oldValue ?? T.oldValue, C.updateType = T.updateType) : x.set(D, { ...T }), x;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), It(
        $,
        c,
        A.current,
        N
      ), _ && _({ updateLog: b, update: Q }), A.current?.serverSync) {
        const j = a.getState().serverState[c], f = A.current?.serverSync;
        vt(c, {
          syncKey: typeof f.syncKey == "string" ? f.syncKey : f.syncKey({ state: $ }),
          rollBackState: j,
          actionTimeStamp: Date.now() + (f.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return $;
    });
  };
  a.getState().updaterState[c] || (console.log("Initializing state for", c, t), G(
    c,
    W(
      c,
      h,
      s.current,
      N
    )
  ), a.getState().cogsStateStore[c] || M(c, t), a.getState().initialStateGlobal[c] || J(c, t));
  const q = w.useMemo(() => W(
    c,
    h,
    s.current,
    N
  ), [c]);
  return [it(c), q];
}
function W(t, i, d, u) {
  const S = /* @__PURE__ */ new Map();
  let I = 0;
  const _ = (o) => {
    const r = o.join(".");
    for (const [v] of S)
      (v === r || v.startsWith(r + ".")) && S.delete(v);
    I++;
  }, E = /* @__PURE__ */ new Map(), y = {
    removeValidation: (o) => {
      o?.validationKey && U(o.validationKey);
    },
    revertToInitialState: (o) => {
      o?.validationKey && U(o.validationKey);
      const r = a.getState().initialStateGlobal[t];
      S.clear(), I++;
      const v = p(r, []);
      w.startTransition(() => {
        G(t, v), M(t, r);
        const N = a.getState().stateComponents.get(t);
        N && N.components.forEach((c) => {
          c.forceUpdate();
        });
        const F = z(t);
        F?.initState && localStorage.removeItem(
          F?.initState ? u + "-" + t + "-" + F?.initState.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (o) => {
      S.clear(), I++;
      const r = W(
        t,
        i,
        d,
        u
      );
      return w.startTransition(() => {
        J(t, o), G(t, r), M(t, o);
        const v = a.getState().stateComponents.get(t);
        v && v.components.forEach((N) => {
          N.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (v) => r.get()[v]
      };
    },
    _initialState: a.getState().initialStateGlobal[t],
    _serverState: a.getState().serverState[t],
    _isLoading: a.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const o = a.getState().serverState[t];
      return !!(o && L(o, it(t)));
    }
  };
  function p(o, r = [], v) {
    const N = r.map(String).join("."), F = S.get(N);
    if (F?.stateVersion === I)
      return F.proxy;
    const c = {
      get(B, s) {
        if (s !== "then" && !s.startsWith("$")) {
          const e = r.join("."), n = `${t}////${d}`, l = a.getState().stateComponents.get(t);
          if (l && e) {
            const g = l.components.get(n);
            g && g.paths.add(e);
          }
        }
        if (Array.isArray(o)) {
          if (s === "getSelected")
            return () => {
              const e = E.get(
                r.join(".")
              );
              if (e !== void 0)
                return p(
                  o[e],
                  [...r, e.toString()],
                  v
                );
            };
          if (s === "stateMap")
            return (e) => {
              const n = v?.filtered?.some(
                (g) => g.join(".") === r.join(".")
              ), l = n ? o : a.getState().getNestedState(t, r);
              return S.clear(), I++, l.map((g, m) => {
                const $ = n && g.__origIndex ? g.__origIndex : m, P = p(
                  g,
                  [...r, $.toString()],
                  v
                );
                return e(
                  g,
                  P,
                  m,
                  o,
                  p(
                    o,
                    r,
                    v
                  )
                );
              });
            };
          if (s === "$stateMap")
            return (e) => w.createElement($t, {
              proxy: {
                _stateKey: t,
                _path: r,
                _mapFn: e
                // Pass the actual function, not string
              }
            });
          if (s === "stateFlattenOn")
            return (e) => {
              const l = v?.filtered?.some(
                (m) => m.join(".") === r.join(".")
              ) ? o : a.getState().getNestedState(t, r);
              S.clear(), I++;
              const g = l.flatMap(
                (m, $) => m[e] ?? []
              );
              return p(
                g,
                [...r, "[*]", e],
                v
              );
            };
          if (s === "findWith")
            return (e, n) => {
              const l = o.findIndex(
                ($) => $[e] === n
              );
              if (l === -1) return;
              const g = o[l], m = [...r, l.toString()];
              return S.clear(), I++, S.clear(), I++, p(g, m);
            };
          if (s === "index")
            return (e) => {
              const n = o[e];
              return p(n, [
                ...r,
                e.toString()
              ]);
            };
          if (s === "insert")
            return (e) => (_(r), Z(
              i,
              e,
              r,
              t
            ), p(
              a.getState().cogsStateStore[t],
              []
            ));
          if (s === "uniqueInsert")
            return (e, n) => {
              const l = a.getState().getNestedState(t, r), g = at(e) ? e(l) : e;
              !l.some(($) => n ? n.every(
                (P) => L(
                  $[P],
                  g[P]
                )
              ) : L($, g)) && (_(r), Z(
                i,
                g,
                r,
                t
              ));
            };
          if (s === "cut")
            return (e, n) => {
              n?.waitForSync || (_(r), K(i, r, t, e));
            };
          if (s === "stateFilter")
            return (e) => {
              const n = o.map(
                (m, $) => ({
                  ...m,
                  __origIndex: $.toString()
                })
              ), l = [], g = [];
              for (let m = 0; m < n.length; m++)
                e(n[m], m) && (l.push(m), g.push(n[m]));
              return S.clear(), I++, p(
                g,
                r,
                {
                  filtered: [...v?.filtered || [], r],
                  validIndices: l
                  // Pass through the meta
                }
              );
            };
        }
        const A = r[r.length - 1];
        if (!isNaN(Number(A))) {
          const e = r.slice(0, -1), n = a.getState().getNestedState(t, e);
          if (Array.isArray(n) && s === "cut")
            return () => K(
              i,
              e,
              t,
              Number(A)
            );
        }
        if (s === "get")
          return () => a.getState().getNestedState(t, r);
        if (s === "$effect")
          return (e) => rt({
            _stateKey: t,
            _path: r,
            _effect: e.toString()
          });
        if (s === "$get")
          return () => rt({
            _stateKey: t,
            _path: r
          });
        if (s === "lastSynced") {
          const e = `${t}:${r.join(".")}`;
          return a.getState().getSyncInfo(e);
        }
        if (s === "_selected") {
          const e = r.slice(0, -1), n = e.join("."), l = a.getState().getNestedState(t, e);
          return Array.isArray(l) ? Number(r[r.length - 1]) === E.get(n) : void 0;
        }
        if (s == "getLocalStorage")
          return (e) => ot(
            u + "-" + t + "-" + e
          );
        if (s === "setSelected")
          return (e) => {
            const n = r.slice(0, -1), l = Number(r[r.length - 1]), g = n.join(".");
            e ? E.set(g, l) : E.delete(g);
            const m = a.getState().getNestedState(t, [...n]);
            tt(i, m, n), _(n);
          };
        if (r.length == 0) {
          if (s == "_componentId") return d;
          if (s === "_initialState")
            return a.getState().initialStateGlobal[t];
          if (s === "_serverState")
            return a.getState().serverState[t];
          if (s === "_isLoading")
            return a.getState().isLoadingGlobal[t];
          if (s === "revertToInitialState")
            return y.revertToInitialState;
          if (s === "updateInitialState")
            return y.updateInitialState;
          if (s === "removeValidation")
            return y.removeValidation;
        }
        if (s === "validationWrapper")
          return ({
            children: e,
            hideMessage: n
          }) => /* @__PURE__ */ Y.jsx(
            St,
            {
              formOpts: n ? { validation: { message: "" } } : void 0,
              path: r,
              validationKey: a.getState().getInitialOptions(t)?.validationKey || "",
              stateKey: t,
              validIndices: v?.validIndices,
              children: e
            }
          );
        if (s === "_stateKey") return t;
        if (s === "_path") return r;
        if (s === "_isServerSynced") return y._isServerSynced;
        if (s === "update")
          return (e, n) => {
            _(r), tt(i, e, r, "");
          };
        if (s === "formElement")
          return (e, n, l) => /* @__PURE__ */ Y.jsx(
            gt,
            {
              setState: i,
              validationKey: e,
              stateKey: t,
              path: r,
              child: n,
              formOpts: l
            }
          );
        const h = [...r, s], q = a.getState().getNestedState(t, h);
        return p(q, h, v);
      }
    }, b = new Proxy(y, c);
    return S.set(N, {
      proxy: b,
      stateVersion: I
    }), b;
  }
  return p(
    a.getState().getNestedState(t, [])
  );
}
function rt(t) {
  return w.createElement(Nt, { proxy: t });
}
function $t({
  proxy: t
}) {
  const i = a().getNestedState(t._stateKey, t._path);
  return console.log("value", i), Array.isArray(i) ? i.map((d, u) => t._mapFn(
    d,
    a.getState().updaterState[t._stateKey],
    u,
    i,
    a.getState().updaterState[t._stateKey]
  )) : null;
}
function Nt({
  proxy: t
}) {
  const i = w.useRef(null), d = `${t._stateKey}-${t._path.join(".")}`;
  return console.log("SignalRenderer", d), w.useEffect(() => {
    const u = i.current;
    if (!u || !u.parentElement) return;
    const S = u.parentElement, _ = Array.from(S.childNodes).indexOf(u);
    let E = S.getAttribute("data-parent-id");
    E || (E = `parent-${crypto.randomUUID()}`, S.setAttribute("data-parent-id", E));
    const p = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: E,
      position: _,
      effect: t._effect
    };
    a.getState().addSignalElement(d, p);
    const o = a.getState().getNestedState(t._stateKey, t._path), r = document.createTextNode(String(o));
    u.replaceWith(r);
  }, [t._stateKey, t._path.join("."), t._effect]), w.createElement("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": d
  });
}
function Dt(t) {
  const i = w.useSyncExternalStore(
    (d) => {
      const u = a.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(t._stateKey, {
        forceUpdate: d,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => u.components.delete(t._stateKey);
    },
    () => a.getState().getNestedState(t._stateKey, t._path)
  );
  return w.createElement("text", {}, String(i));
}
export {
  rt as $cogsSignal,
  Dt as $cogsSignalStore,
  Mt as addStateOptions,
  Ot as createCogsState,
  wt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
