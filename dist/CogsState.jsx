"use client";
import { j as et } from "./node_modules/react/jsx-runtime.jsx";
import { r as E } from "./node_modules/react/index.js";
import { transformStateFunc as St, isFunction as ot, getNestedValue as b, isDeepEqual as G } from "./utility.js";
import { pushFunc as nt, updateFn as B, cutFunc as rt, ValidationWrapper as ft, FormControlComponent as gt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as a } from "./store.js";
import { useCogsConfig as mt } from "./CogsStateClient.jsx";
import Q from "./node_modules/uuid/dist/esm-browser/v4.js";
function Rt(t, { formElements: i, zodSchema: g }) {
  return { initialState: t, formElements: i, zodSchema: g };
}
function at(t, i) {
  const g = a.getState().getInitialOptions, f = a.getState().setInitialStateOptions, S = g(t) || {};
  f(t, {
    ...S,
    ...i
  });
}
function it({
  stateKey: t,
  options: i,
  initialOptionsPart: g
}) {
  const f = X(t) || {}, S = g[t] || {}, _ = a.getState().setInitialStateOptions, p = { ...S, ...f };
  let v = !1;
  if (i)
    for (const y in i)
      p.hasOwnProperty(y) || (v = !0, p[y] = i[y]);
  v && _(t, p);
}
const Ot = (t, i) => {
  let g = t;
  const [f, S] = St(g);
  a.getState().setInitialStates(f);
  const _ = (v, y) => {
    const [$] = E.useState(Q());
    it({ stateKey: v, options: y, initialOptionsPart: S });
    const o = a.getState().cogsStateStore[v] || f[v], e = y?.modifyState ? y.modifyState(o) : o, [I, x] = wt(
      e,
      {
        stateKey: v,
        syncUpdate: y?.syncUpdate,
        componentId: $,
        localStorage: y?.localStorage,
        middleware: y?.middleware,
        enabledSync: y?.enabledSync,
        reactiveType: y?.reactiveType,
        reactiveDeps: y?.reactiveDeps,
        initState: y?.initState
      }
    );
    return x;
  };
  function p(v, y) {
    it({ stateKey: v, options: y, initialOptionsPart: S });
  }
  return { useCogsState: _, setCogsOptions: p };
}, {
  setUpdaterState: z,
  setState: L,
  getInitialOptions: X,
  getKeyState: st,
  getValidationErrors: yt,
  setStateLog: pt,
  updateInitialStateGlobal: Y,
  addValidationError: vt,
  removeValidationError: W,
  setServerSyncActions: It
} = a.getState(), ct = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, _t = (t, i, g, f) => {
  if (g?.initState) {
    const S = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: a.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: a.getState().serverState[i]
    }, _ = g.initState ? `${f}-${i}-${g.initState.localStorageKey}` : i;
    window.localStorage.setItem(_, JSON.stringify(S));
  }
}, Et = (t, i, g, f, S, _) => {
  const p = {
    initialState: i,
    updaterState: J(
      t,
      f,
      S,
      _
    ),
    state: g
  };
  E.startTransition(() => {
    Y(t, p.initialState), z(t, p.updaterState), L(t, p.state);
  });
}, $t = (t) => {
  const i = a.getState().stateComponents.get(t);
  if (!i) return;
  const g = /* @__PURE__ */ new Set();
  i.components.forEach((f) => {
    g.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    E.startTransition(() => {
      g.forEach((f) => f());
    });
  });
};
function wt(t, {
  stateKey: i,
  serverSync: g,
  zodSchema: f,
  localStorage: S,
  formElements: _,
  middleware: p,
  reactiveDeps: v,
  reactiveType: y,
  componentId: $,
  initState: o,
  syncUpdate: e
} = {}) {
  const [I, x] = E.useState({}), { sessionId: M } = mt();
  let D = !i;
  const [c] = E.useState(i ?? Q()), s = a.getState().stateLog[c], q = E.useRef(/* @__PURE__ */ new Set()), h = E.useRef($ ?? Q()), C = E.useRef(null);
  C.current = X(c), E.useEffect(() => {
    if (e && e.stateKey === c && e.path?.[0]) {
      L(c, (r) => ({
        ...r,
        [e.path[0]]: e.newValue
      }));
      const l = `${e.stateKey}:${e.path.join(".")}`;
      a.getState().setSyncInfo(l, {
        timeStamp: e.timeStamp,
        userId: e.userId
      });
    }
  }, [e]), E.useEffect(() => {
    at(c, {
      initState: o
    });
    const l = ct(
      M + "-" + c + "-" + o?.localStorageKey
    );
    let r = null;
    o?.initialState && (r = o?.initialState, l && l.lastUpdated > (l.lastSyncedWithServer || 0) && (r = l.state), Et(
      c,
      o?.initialState,
      r,
      n,
      h.current,
      M
    )), $t(c);
  }, [o?.localStorageKey, ...o?.dependencies || []]), E.useLayoutEffect(() => {
    D && at(c, {
      serverSync: g,
      formElements: _,
      zodSchema: f,
      initState: o,
      localStorage: S,
      middleware: p
    });
    const l = `${c}////${h.current}`, r = a.getState().stateComponents.get(c) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(l, {
      forceUpdate: () => x({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: v || void 0,
      reactiveType: y ?? ["component", "deps"]
    }), a.getState().stateComponents.set(c, r), () => {
      const u = `${c}////${h.current}`;
      r && (r.components.delete(u), r.components.size === 0 && a.getState().stateComponents.delete(c));
    };
  }, []);
  const n = (l, r, u, N) => {
    if (Array.isArray(r)) {
      const R = `${c}-${r.join(".")}`;
      q.current.add(R);
    }
    L(c, (R) => {
      const T = ot(l) ? l(R) : l, O = `${c}-${r.join(".")}`;
      if (O) {
        let P = !1, m = a.getState().signalDomElements.get(O);
        if ((!m || m.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const V = r.slice(0, -1), A = b(T, V);
          if (Array.isArray(A)) {
            P = !0;
            const w = `${c}-${V.join(".")}`;
            m = a.getState().signalDomElements.get(w);
          }
        }
        if (m) {
          const V = P ? b(T, r.slice(0, -1)) : b(T, r);
          m.forEach(({ parentId: A, position: w, effect: U }) => {
            const j = document.querySelector(
              `[data-parent-id="${A}"]`
            );
            if (j) {
              const tt = Array.from(j.childNodes);
              if (tt[w]) {
                const ut = U ? new Function(
                  "state",
                  `return (${U})(state)`
                )(V) : V;
                tt[w].textContent = String(ut);
              }
            }
          });
        }
      }
      u.updateType === "update" && (N || C.current?.validationKey) && r && W(
        (N || C.current?.validationKey) + "." + r.join(".")
      );
      const F = r.slice(0, r.length - 1);
      u.updateType === "cut" && C.current?.validationKey && W(
        C.current?.validationKey + "." + F.join(".")
      ), u.updateType === "insert" && C.current?.validationKey && yt(
        C.current?.validationKey + "." + F.join(".")
      ).filter(([m, V]) => {
        let A = m?.split(".").length;
        if (m == F.join(".") && A == F.length - 1) {
          let w = m + "." + F;
          W(m), vt(w, V);
        }
      });
      const k = b(R, r), lt = b(T, r), dt = u.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), Z = a.getState().stateComponents.get(c);
      if (Z)
        for (const [
          P,
          m
        ] of Z.components.entries()) {
          let V = !1;
          const A = Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"];
          if (!A.includes("none")) {
            if (A.includes("all")) {
              m.forceUpdate();
              continue;
            }
            if (A.includes("component") && m.paths && m.paths.has(dt) && (V = !0), !V && A.includes("deps") && m.depsFunction) {
              const w = m.depsFunction(T);
              typeof w == "boolean" ? w && (V = !0) : G(m.deps, w) || (m.deps = w, V = !0);
            }
            V && m.forceUpdate();
          }
        }
      const K = {
        timeStamp: Date.now(),
        stateKey: c,
        path: r,
        updateType: u.updateType,
        status: "new",
        oldValue: k,
        newValue: lt
      };
      if (pt(c, (P) => {
        const V = [...P ?? [], K].reduce((A, w) => {
          const U = `${w.stateKey}:${JSON.stringify(w.path)}`, j = A.get(U);
          return j ? (j.timeStamp = Math.max(
            j.timeStamp,
            w.timeStamp
          ), j.newValue = w.newValue, j.oldValue = j.oldValue ?? w.oldValue, j.updateType = w.updateType) : A.set(U, { ...w }), A;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), _t(
        T,
        c,
        C.current,
        M
      ), p && p({
        updateLog: s,
        update: K
      }), C.current?.serverSync) {
        const P = a.getState().serverState[c], m = C.current?.serverSync;
        It(c, {
          syncKey: typeof m.syncKey == "string" ? m.syncKey : m.syncKey({ state: T }),
          rollBackState: P,
          actionTimeStamp: Date.now() + (m.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  a.getState().updaterState[c] || (console.log("Initializing state for", c, t), z(
    c,
    J(
      c,
      n,
      h.current,
      M
    )
  ), a.getState().cogsStateStore[c] || L(c, t), a.getState().initialStateGlobal[c] || Y(c, t));
  const d = E.useMemo(() => J(
    c,
    n,
    h.current,
    M
  ), [c]);
  return [st(c), d];
}
function J(t, i, g, f) {
  const S = /* @__PURE__ */ new Map();
  let _ = 0;
  const p = (o) => {
    const e = o.join(".");
    for (const [I] of S)
      (I === e || I.startsWith(e + ".")) && S.delete(I);
    _++;
  }, v = /* @__PURE__ */ new Map(), y = {
    removeValidation: (o) => {
      o?.validationKey && W(o.validationKey);
    },
    revertToInitialState: (o) => {
      o?.validationKey && W(o.validationKey);
      const e = a.getState().initialStateGlobal[t];
      S.clear(), _++;
      const I = $(e, []);
      E.startTransition(() => {
        z(t, I), L(t, e);
        const x = a.getState().stateComponents.get(t);
        x && x.components.forEach((D) => {
          D.forceUpdate();
        });
        const M = X(t);
        M?.initState && localStorage.removeItem(
          M?.initState ? f + "-" + t + "-" + M?.initState.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (o) => {
      S.clear(), _++;
      const e = J(
        t,
        i,
        g,
        f
      );
      return E.startTransition(() => {
        Y(t, o), z(t, e), L(t, o);
        const I = a.getState().stateComponents.get(t);
        I && I.components.forEach((x) => {
          x.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (I) => e.get()[I]
      };
    },
    _initialState: a.getState().initialStateGlobal[t],
    _serverState: a.getState().serverState[t],
    _isLoading: a.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const o = a.getState().serverState[t];
      return !!(o && G(o, st(t)));
    }
  };
  function $(o, e = [], I) {
    const x = e.map(String).join(".");
    S.get(x);
    const M = {
      get(c, s) {
        if (s !== "then" && !s.startsWith("$") && s !== "stateMapNoRender") {
          const n = e.join("."), d = `${t}////${g}`, l = a.getState().stateComponents.get(t);
          if (l && n) {
            const r = l.components.get(d);
            r && r.paths.add(n);
          }
        }
        if (Array.isArray(o)) {
          if (s === "getSelected")
            return () => {
              const n = v.get(
                e.join(".")
              );
              if (n !== void 0)
                return $(
                  o[n],
                  [...e, n.toString()],
                  I
                );
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const d = I?.filtered?.some(
                (r) => r.join(".") === e.join(".")
              ), l = d ? o : a.getState().getNestedState(t, e);
              return s !== "stateMapNoRender" && (S.clear(), _++), l.map((r, u) => {
                const N = d && r.__origIndex ? r.__origIndex : u, R = $(
                  r,
                  [...e, N.toString()],
                  I
                );
                return n(
                  r,
                  R,
                  u,
                  o,
                  $(
                    o,
                    e,
                    I
                  )
                );
              });
            };
          if (s === "$stateMap")
            return (n) => E.createElement(Nt, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              effectiveSetState: i,
              componentId: g,
              rebuildStateShape: $
            });
          if (s === "stateFlattenOn")
            return (n) => {
              const l = I?.filtered?.some(
                (u) => u.join(".") === e.join(".")
              ) ? o : a.getState().getNestedState(t, e);
              S.clear(), _++;
              const r = l.flatMap(
                (u, N) => u[n] ?? []
              );
              return $(
                r,
                [...e, "[*]", n],
                I
              );
            };
          if (s === "findWith")
            return (n, d) => {
              const l = o.findIndex(
                (N) => N[n] === d
              );
              if (l === -1) return;
              const r = o[l], u = [...e, l.toString()];
              return S.clear(), _++, S.clear(), _++, $(r, u);
            };
          if (s === "index")
            return (n) => {
              const d = o[n];
              return $(d, [
                ...e,
                n.toString()
              ]);
            };
          if (s === "insert")
            return (n) => (p(e), nt(
              i,
              n,
              e,
              t
            ), $(
              a.getState().cogsStateStore[t],
              []
            ));
          if (s === "uniqueInsert")
            return (n, d, l) => {
              const r = a.getState().getNestedState(t, e), u = ot(n) ? n(r) : n;
              let N = null;
              if (!r.some((T) => {
                if (d) {
                  const F = d.every(
                    (k) => G(
                      T[k],
                      u[k]
                    )
                  );
                  return F && (N = T), F;
                }
                const O = G(T, u);
                return O && (N = T), O;
              }))
                p(e), nt(
                  i,
                  u,
                  e,
                  t
                );
              else if (l && N) {
                const T = l(N), O = r.map(
                  (F) => G(F, N) ? T : F
                );
                p(e), B(
                  i,
                  O,
                  e
                );
              }
            };
          if (s === "cut")
            return (n, d) => {
              d?.waitForSync || (p(e), rt(i, e, t, n));
            };
          if (s === "stateFilter")
            return (n) => {
              const d = o.map(
                (u, N) => ({
                  ...u,
                  __origIndex: N.toString()
                })
              ), l = [], r = [];
              for (let u = 0; u < d.length; u++)
                n(d[u], u) && (l.push(u), r.push(d[u]));
              return S.clear(), _++, $(
                r,
                e,
                {
                  filtered: [...I?.filtered || [], e],
                  validIndices: l
                  // Pass through the meta
                }
              );
            };
        }
        const q = e[e.length - 1];
        if (!isNaN(Number(q))) {
          const n = e.slice(0, -1), d = a.getState().getNestedState(t, n);
          if (Array.isArray(d) && s === "cut")
            return () => rt(
              i,
              n,
              t,
              Number(q)
            );
        }
        if (s === "get")
          return () => a.getState().getNestedState(t, e);
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
          return a.getState().getSyncInfo(n);
        }
        if (s === "_selected") {
          const n = e.slice(0, -1), d = n.join("."), l = a.getState().getNestedState(t, n);
          return Array.isArray(l) ? Number(e[e.length - 1]) === v.get(d) : void 0;
        }
        if (s == "getLocalStorage")
          return (n) => ct(
            f + "-" + t + "-" + n
          );
        if (s === "setSelected")
          return (n) => {
            const d = e.slice(0, -1), l = Number(e[e.length - 1]), r = d.join(".");
            n ? v.set(r, l) : v.delete(r);
            const u = a.getState().getNestedState(t, [...d]);
            B(i, u, d), p(d);
          };
        if (e.length == 0) {
          if (s == "_componentId") return g;
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
            children: n,
            hideMessage: d
          }) => /* @__PURE__ */ et.jsx(
            ft,
            {
              formOpts: d ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: a.getState().getInitialOptions(t)?.validationKey || "",
              stateKey: t,
              validIndices: I?.validIndices,
              children: n
            }
          );
        if (s === "_stateKey") return t;
        if (s === "_path") return e;
        if (s === "_isServerSynced") return y._isServerSynced;
        if (s === "update")
          return (n, d) => {
            p(e), B(i, n, e, "");
          };
        if (s === "formElement")
          return (n, d, l) => /* @__PURE__ */ et.jsx(
            gt,
            {
              setState: i,
              validationKey: n,
              stateKey: t,
              path: e,
              child: d,
              formOpts: l
            }
          );
        const h = [...e, s], C = a.getState().getNestedState(t, h);
        return $(C, h, I);
      }
    }, D = new Proxy(y, M);
    return S.set(x, {
      proxy: D,
      stateVersion: _
    }), D;
  }
  return $(
    a.getState().getNestedState(t, [])
  );
}
function H(t) {
  return E.createElement(Tt, { proxy: t });
}
function Nt({
  proxy: t,
  effectiveSetState: i,
  componentId: g,
  rebuildStateShape: f
}) {
  const S = a().getNestedState(t._stateKey, t._path);
  return console.log("value", S), Array.isArray(S) ? f(
    S,
    t._path
  ).stateMapNoRender(
    (p, v, y, $, o) => t._mapFn(p, v, y, $, o)
  ) : null;
}
function Tt({
  proxy: t
}) {
  const i = E.useRef(null), g = `${t._stateKey}-${t._path.join(".")}`;
  return E.useEffect(() => {
    const f = i.current;
    if (!f || !f.parentElement) return;
    const S = f.parentElement, p = Array.from(S.childNodes).indexOf(f);
    let v = S.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, S.setAttribute("data-parent-id", v));
    const $ = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: p,
      effect: t._effect
    };
    a.getState().addSignalElement(g, $);
    const o = a.getState().getNestedState(t._stateKey, t._path), e = document.createTextNode(String(o));
    f.replaceWith(e);
  }, [t._stateKey, t._path.join("."), t._effect]), E.createElement("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": g
  });
}
function Dt(t) {
  const i = E.useSyncExternalStore(
    (g) => {
      const f = a.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(t._stateKey, {
        forceUpdate: g,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => f.components.delete(t._stateKey);
    },
    () => a.getState().getNestedState(t._stateKey, t._path)
  );
  return E.createElement("text", {}, String(i));
}
export {
  H as $cogsSignal,
  Dt as $cogsSignalStore,
  Rt as addStateOptions,
  Ot as createCogsState,
  wt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
