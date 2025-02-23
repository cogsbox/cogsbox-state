"use client";
import { j as Y } from "./node_modules/react/jsx-runtime.jsx";
import { r as w } from "./node_modules/react/index.js";
import { transformStateFunc as ut, isFunction as at, getNestedValue as D, isDeepEqual as L } from "./utility.js";
import { pushFunc as Z, cutFunc as K, updateFn as tt, ValidationWrapper as St, FormControlComponent as ft } from "./Functions.jsx";
import "zod";
import { getGlobalStore as a } from "./store.js";
import { useCogsConfig as gt } from "./CogsStateClient.jsx";
import k from "./node_modules/uuid/dist/esm-browser/v4.js";
function Pt(t, { formElements: o, zodSchema: u }) {
  return { initialState: t, formElements: o, zodSchema: u };
}
function et(t, o) {
  const u = a.getState().getInitialOptions, S = a.getState().setInitialStateOptions, l = u(t) || {};
  S(t, {
    ...l,
    ...o
  });
}
function nt({
  stateKey: t,
  options: o,
  initialOptionsPart: u
}) {
  const S = z(t) || {}, l = u[t] || {}, E = a.getState().setInitialStateOptions, v = { ...l, ...S };
  let I = !1;
  if (o)
    for (const y in o)
      v.hasOwnProperty(y) || (I = !0, v[y] = o[y]);
  I && E(t, v);
}
const Rt = (t, o) => {
  let u = t;
  const [S, l] = ut(u);
  a.getState().setInitialStates(S);
  const E = (I, y) => {
    const [f] = w.useState(k());
    nt({ stateKey: I, options: y, initialOptionsPart: l });
    const s = a.getState().cogsStateStore[I] || S[I], r = y?.modifyState ? y.modifyState(s) : s, [_, N] = wt(
      r,
      {
        stateKey: I,
        syncUpdate: y?.syncUpdate,
        componentId: f,
        localStorage: y?.localStorage,
        middleware: y?.middleware,
        enabledSync: y?.enabledSync,
        reactiveDeps: y?.reactiveDeps,
        initState: y?.initState
      }
    );
    return N;
  };
  function v(I, y) {
    nt({ stateKey: I, options: y, initialOptionsPart: l });
  }
  return { useCogsState: E, setCogsOptions: v };
}, {
  setUpdaterState: G,
  setState: P,
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
    const o = window.localStorage.getItem(t);
    return o ? JSON.parse(o) : null;
  } catch (o) {
    return console.error("Error loading from localStorage:", o), null;
  }
}, It = (t, o, u, S) => {
  if (u?.initState) {
    const l = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: a.getState().serverSyncLog[o]?.[0]?.timeStamp,
      baseServerState: a.getState().serverState[o]
    }, E = u.initState ? `${S}-${o}-${u.initState.localStorageKey}` : o;
    window.localStorage.setItem(E, JSON.stringify(l));
  }
}, _t = (t, o, u, S, l, E) => {
  const v = {
    initialState: o,
    updaterState: W(
      t,
      S,
      l,
      E
    ),
    state: u
  };
  w.startTransition(() => {
    J(t, v.initialState), G(t, v.updaterState), P(t, v.state);
  });
}, Et = (t) => {
  const o = a.getState().stateComponents.get(t);
  if (!o) return;
  const u = /* @__PURE__ */ new Set();
  o.components.forEach((S) => {
    u.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    w.startTransition(() => {
      u.forEach((S) => S());
    });
  });
};
function wt(t, {
  stateKey: o,
  serverSync: u,
  zodSchema: S,
  localStorage: l,
  formElements: E,
  middleware: v,
  reactiveDeps: I,
  componentId: y,
  initState: f,
  syncUpdate: s
} = {}) {
  const [r, _] = w.useState({}), { sessionId: N } = gt();
  let F = !o;
  const [c] = w.useState(o ?? k()), b = a.getState().stateLog[c], B = w.useRef(/* @__PURE__ */ new Set()), i = w.useRef(y ?? k()), A = w.useRef(null);
  A.current = z(c), w.useEffect(() => {
    if (s && s.stateKey === c && s.path?.[0]) {
      P(c, (n) => ({
        ...n,
        [s.path[0]]: s.newValue
      }));
      const e = `${s.stateKey}:${s.path.join(".")}`;
      a.getState().setSyncInfo(e, {
        timeStamp: s.timeStamp,
        userId: s.userId
      });
    }
  }, [s]), w.useEffect(() => {
    et(c, {
      initState: f
    });
    const e = ot(
      N + "-" + c + "-" + f?.localStorageKey
    );
    let n = null;
    f?.initialState && (n = f?.initialState, e && e.lastUpdated > (e.lastSyncedWithServer || 0) && (n = e.state), _t(
      c,
      f?.initialState,
      n,
      h,
      i.current,
      N
    )), Et(c);
  }, [f?.localStorageKey, ...f?.dependencies || []]), w.useEffect(() => {
    F && et(c, {
      serverSync: u,
      formElements: E,
      zodSchema: S,
      initState: f,
      localStorage: l,
      middleware: v
    });
    const e = `${c}////${i.current}`, n = a.getState().stateComponents.get(c) || {
      components: /* @__PURE__ */ new Map()
    };
    return n.components.set(e, {
      forceUpdate: () => _({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: I || void 0
    }), a.getState().stateComponents.set(c, n), () => {
      const d = `${c}////${i.current}`;
      n && (n.components.delete(d), n.components.size === 0 && a.getState().stateComponents.delete(c));
    };
  }, []);
  const h = (e, n, d, g) => {
    if (Array.isArray(n)) {
      const p = `${c}-${n.join(".")}`;
      B.current.add(p);
    }
    P(c, (p) => {
      const $ = at(e) ? e(p) : e, j = `${c}-${n.join(".")}`;
      if (j) {
        let M = !1, m = a.getState().signalDomElements.get(j);
        if ((!m || m.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const V = n.slice(0, -1), x = D($, V);
          if (Array.isArray(x)) {
            M = !0;
            const T = `${c}-${V.join(".")}`;
            m = a.getState().signalDomElements.get(T);
          }
        }
        if (m) {
          const V = M ? D($, n.slice(0, -1)) : D($, n);
          m.forEach(({ parentId: x, position: T, effect: O }) => {
            const C = document.querySelector(
              `[data-parent-id="${x}"]`
            );
            if (C) {
              const X = Array.from(C.childNodes);
              if (X[T]) {
                const dt = O ? new Function(
                  "state",
                  `return (${O})(state)`
                )(V) : V;
                X[T].textContent = String(dt);
              }
            }
          });
        }
      }
      d.updateType === "update" && (g || A.current?.validationKey) && n && U(
        (g || A.current?.validationKey) + "." + n.join(".")
      );
      const R = n.slice(0, n.length - 1);
      d.updateType === "cut" && A.current?.validationKey && U(
        A.current?.validationKey + "." + R.join(".")
      ), d.updateType === "insert" && A.current?.validationKey && mt(
        A.current?.validationKey + "." + R.join(".")
      ).filter(([m, V]) => {
        let x = m?.split(".").length;
        if (m == R.join(".") && x == R.length - 1) {
          let T = m + "." + R;
          U(m), pt(T, V);
        }
      });
      const st = D(p, n), ct = D($, n), lt = d.updateType === "update" ? n.join(".") : [...n].slice(0, -1).join("."), H = a.getState().stateComponents.get(c);
      if (H) {
        for (const [
          M,
          m
        ] of H.components.entries())
          if (m.depsFunction || m.paths && m.paths.has(lt))
            if (m.depsFunction) {
              const V = m.depsFunction($);
              typeof V == "boolean" ? V && m.forceUpdate() : L(m.deps, V) || (m.deps = V, m.forceUpdate());
            } else
              m.forceUpdate();
      }
      const Q = {
        timeStamp: Date.now(),
        stateKey: c,
        path: n,
        updateType: d.updateType,
        status: "new",
        oldValue: st,
        newValue: ct
      };
      if (yt(c, (M) => {
        const V = [...M ?? [], Q].reduce((x, T) => {
          const O = `${T.stateKey}:${JSON.stringify(T.path)}`, C = x.get(O);
          return C ? (C.timeStamp = Math.max(
            C.timeStamp,
            T.timeStamp
          ), C.newValue = T.newValue, C.oldValue = C.oldValue ?? T.oldValue, C.updateType = T.updateType) : x.set(O, { ...T }), x;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), It(
        $,
        c,
        A.current,
        N
      ), v && v({ updateLog: b, update: Q }), A.current?.serverSync) {
        const M = a.getState().serverState[c], m = A.current?.serverSync;
        vt(c, {
          syncKey: typeof m.syncKey == "string" ? m.syncKey : m.syncKey({ state: $ }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (m.debounce ?? 3e3),
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
      i.current,
      N
    )
  ), a.getState().cogsStateStore[c] || P(c, t), a.getState().initialStateGlobal[c] || J(c, t));
  const q = w.useMemo(() => W(
    c,
    h,
    i.current,
    N
  ), [c]);
  return [it(c), q];
}
function W(t, o, u, S) {
  const l = /* @__PURE__ */ new Map();
  let E = 0;
  const v = (s) => {
    const r = s.join(".");
    for (const [_] of l)
      (_ === r || _.startsWith(r + ".")) && l.delete(_);
    E++;
  }, I = /* @__PURE__ */ new Map(), y = {
    removeValidation: (s) => {
      s?.validationKey && U(s.validationKey);
    },
    revertToInitialState: (s) => {
      s?.validationKey && U(s.validationKey);
      const r = a.getState().initialStateGlobal[t];
      l.clear(), E++;
      const _ = f(r, []);
      w.startTransition(() => {
        G(t, _), P(t, r);
        const N = a.getState().stateComponents.get(t);
        N && N.components.forEach((c) => {
          c.forceUpdate();
        });
        const F = z(t);
        F?.initState && localStorage.removeItem(
          F?.initState ? S + "-" + t + "-" + F?.initState.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (s) => {
      l.clear(), E++;
      const r = W(
        t,
        o,
        u,
        S
      );
      return w.startTransition(() => {
        J(t, s), G(t, r), P(t, s);
        const _ = a.getState().stateComponents.get(t);
        _ && _.components.forEach((N) => {
          N.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (_) => r.get()[_]
      };
    },
    _initialState: a.getState().initialStateGlobal[t],
    _serverState: a.getState().serverState[t],
    _isLoading: a.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const s = a.getState().serverState[t];
      return !!(s && L(s, it(t)));
    }
  };
  function f(s, r = [], _) {
    const N = r.map(String).join("."), F = l.get(N);
    if (F?.stateVersion === E)
      return F.proxy;
    const c = {
      get(B, i) {
        if (i !== "then" && !i.startsWith("$") && i == "stateMapNoRender") {
          const e = r.join("."), n = `${t}////${u}`, d = a.getState().stateComponents.get(t);
          if (d && e) {
            const g = d.components.get(n);
            g && g.paths.add(e);
          }
        }
        if (Array.isArray(s)) {
          if (i === "getSelected")
            return () => {
              const e = I.get(
                r.join(".")
              );
              if (e !== void 0)
                return f(
                  s[e],
                  [...r, e.toString()],
                  _
                );
            };
          if (i === "stateMap" || i === "stateMapNoRender")
            return (e) => {
              const n = _?.filtered?.some(
                (g) => g.join(".") === r.join(".")
              ), d = n ? s : a.getState().getNestedState(t, r);
              return i !== "stateMapNoRender" && (l.clear(), E++), d.map((g, p) => {
                const $ = n && g.__origIndex ? g.__origIndex : p, j = f(
                  g,
                  [...r, $.toString()],
                  _
                );
                return e(
                  g,
                  j,
                  p,
                  s,
                  f(
                    s,
                    r,
                    _
                  )
                );
              });
            };
          if (i === "$stateMap")
            return (e) => w.createElement($t, {
              proxy: {
                _stateKey: t,
                _path: r,
                _mapFn: e
                // Pass the actual function, not string
              },
              effectiveSetState: o,
              componentId: u,
              rebuildStateShape: f
            });
          if (i === "stateFlattenOn")
            return (e) => {
              const d = _?.filtered?.some(
                (p) => p.join(".") === r.join(".")
              ) ? s : a.getState().getNestedState(t, r);
              l.clear(), E++;
              const g = d.flatMap(
                (p, $) => p[e] ?? []
              );
              return f(
                g,
                [...r, "[*]", e],
                _
              );
            };
          if (i === "findWith")
            return (e, n) => {
              const d = s.findIndex(
                ($) => $[e] === n
              );
              if (d === -1) return;
              const g = s[d], p = [...r, d.toString()];
              return l.clear(), E++, l.clear(), E++, f(g, p);
            };
          if (i === "index")
            return (e) => {
              const n = s[e];
              return f(n, [
                ...r,
                e.toString()
              ]);
            };
          if (i === "insert")
            return (e) => (v(r), Z(
              o,
              e,
              r,
              t
            ), f(
              a.getState().cogsStateStore[t],
              []
            ));
          if (i === "uniqueInsert")
            return (e, n) => {
              const d = a.getState().getNestedState(t, r), g = at(e) ? e(d) : e;
              !d.some(($) => n ? n.every(
                (j) => L(
                  $[j],
                  g[j]
                )
              ) : L($, g)) && (v(r), Z(
                o,
                g,
                r,
                t
              ));
            };
          if (i === "cut")
            return (e, n) => {
              n?.waitForSync || (v(r), K(o, r, t, e));
            };
          if (i === "stateFilter")
            return (e) => {
              const n = s.map(
                (p, $) => ({
                  ...p,
                  __origIndex: $.toString()
                })
              ), d = [], g = [];
              for (let p = 0; p < n.length; p++)
                e(n[p], p) && (d.push(p), g.push(n[p]));
              return l.clear(), E++, f(
                g,
                r,
                {
                  filtered: [..._?.filtered || [], r],
                  validIndices: d
                  // Pass through the meta
                }
              );
            };
        }
        const A = r[r.length - 1];
        if (!isNaN(Number(A))) {
          const e = r.slice(0, -1), n = a.getState().getNestedState(t, e);
          if (Array.isArray(n) && i === "cut")
            return () => K(
              o,
              e,
              t,
              Number(A)
            );
        }
        if (i === "get")
          return () => a.getState().getNestedState(t, r);
        if (i === "$effect")
          return (e) => rt({
            _stateKey: t,
            _path: r,
            _effect: e.toString()
          });
        if (i === "$get")
          return () => rt({
            _stateKey: t,
            _path: r
          });
        if (i === "lastSynced") {
          const e = `${t}:${r.join(".")}`;
          return a.getState().getSyncInfo(e);
        }
        if (i === "_selected") {
          const e = r.slice(0, -1), n = e.join("."), d = a.getState().getNestedState(t, e);
          return Array.isArray(d) ? Number(r[r.length - 1]) === I.get(n) : void 0;
        }
        if (i == "getLocalStorage")
          return (e) => ot(
            S + "-" + t + "-" + e
          );
        if (i === "setSelected")
          return (e) => {
            const n = r.slice(0, -1), d = Number(r[r.length - 1]), g = n.join(".");
            e ? I.set(g, d) : I.delete(g);
            const p = a.getState().getNestedState(t, [...n]);
            tt(o, p, n), v(n);
          };
        if (r.length == 0) {
          if (i == "_componentId") return u;
          if (i === "_initialState")
            return a.getState().initialStateGlobal[t];
          if (i === "_serverState")
            return a.getState().serverState[t];
          if (i === "_isLoading")
            return a.getState().isLoadingGlobal[t];
          if (i === "revertToInitialState")
            return y.revertToInitialState;
          if (i === "updateInitialState")
            return y.updateInitialState;
          if (i === "removeValidation")
            return y.removeValidation;
        }
        if (i === "validationWrapper")
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
              validIndices: _?.validIndices,
              children: e
            }
          );
        if (i === "_stateKey") return t;
        if (i === "_path") return r;
        if (i === "_isServerSynced") return y._isServerSynced;
        if (i === "update")
          return (e, n) => {
            v(r), tt(o, e, r, "");
          };
        if (i === "formElement")
          return (e, n, d) => /* @__PURE__ */ Y.jsx(
            ft,
            {
              setState: o,
              validationKey: e,
              stateKey: t,
              path: r,
              child: n,
              formOpts: d
            }
          );
        const h = [...r, i], q = a.getState().getNestedState(t, h);
        return f(q, h, _);
      }
    }, b = new Proxy(y, c);
    return l.set(N, {
      proxy: b,
      stateVersion: E
    }), b;
  }
  return f(
    a.getState().getNestedState(t, [])
  );
}
function rt(t) {
  return w.createElement(Nt, { proxy: t });
}
function $t({
  proxy: t,
  effectiveSetState: o,
  componentId: u,
  rebuildStateShape: S
}) {
  const l = a().getNestedState(t._stateKey, t._path);
  return console.log("value", l), Array.isArray(l) ? S(
    l,
    t._path
  ).stateMap((v, I, y, f, s) => t._mapFn(v, I, y, f, s)) : null;
}
function Nt({
  proxy: t
}) {
  const o = w.useRef(null), u = `${t._stateKey}-${t._path.join(".")}`;
  return console.log("SignalRenderer", u), w.useEffect(() => {
    const S = o.current;
    if (!S || !S.parentElement) return;
    const l = S.parentElement, v = Array.from(l.childNodes).indexOf(S);
    let I = l.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, l.setAttribute("data-parent-id", I));
    const f = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: v,
      effect: t._effect
    };
    a.getState().addSignalElement(u, f);
    const s = a.getState().getNestedState(t._stateKey, t._path), r = document.createTextNode(String(s));
    S.replaceWith(r);
  }, [t._stateKey, t._path.join("."), t._effect]), w.createElement("span", {
    ref: o,
    style: { display: "none" },
    "data-signal-id": u
  });
}
function Ot(t) {
  const o = w.useSyncExternalStore(
    (u) => {
      const S = a.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return S.components.set(t._stateKey, {
        forceUpdate: u,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => S.components.delete(t._stateKey);
    },
    () => a.getState().getNestedState(t._stateKey, t._path)
  );
  return w.createElement("text", {}, String(o));
}
export {
  rt as $cogsSignal,
  Ot as $cogsSignalStore,
  Pt as addStateOptions,
  Rt as createCogsState,
  wt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
