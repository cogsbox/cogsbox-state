"use client";
import { j as Z } from "./node_modules/react/jsx-runtime.jsx";
import { r as E } from "./node_modules/react/index.js";
import { transformStateFunc as ut, isFunction as at, getNestedValue as b, isDeepEqual as G } from "./utility.js";
import { updateFn as K, ValidationWrapper as St, FormControlComponent as gt, cutFunc as tt, pushFunc as et } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r } from "./store.js";
import { useCogsConfig as ft } from "./CogsStateClient.jsx";
import z from "./node_modules/uuid/dist/esm-browser/v4.js";
function Ot(t, { formElements: i, zodSchema: u }) {
  return { initialState: t, formElements: i, zodSchema: u };
}
function nt(t, i) {
  const u = r.getState().getInitialOptions, S = r.getState().setInitialStateOptions, g = u(t) || {};
  S(t, {
    ...g,
    ...i
  });
}
function rt({
  stateKey: t,
  options: i,
  initialOptionsPart: u
}) {
  const S = J(t) || {}, g = u[t] || {}, $ = r.getState().setInitialStateOptions, v = { ...g, ...S };
  let _ = !1;
  if (i)
    for (const m in i)
      v.hasOwnProperty(m) || (_ = !0, v[m] = i[m]);
  _ && $(t, v);
}
const ht = (t, i) => {
  let u = t;
  const [S, g] = ut(u);
  r.getState().setInitialStates(S);
  const $ = (_, m) => {
    const [y] = E.useState(z());
    rt({ stateKey: _, options: m, initialOptionsPart: g });
    const s = r.getState().cogsStateStore[_] || S[_], e = m?.modifyState ? m.modifyState(s) : s, [I, w] = $t(
      e,
      {
        stateKey: _,
        syncUpdate: m?.syncUpdate,
        componentId: y,
        localStorage: m?.localStorage,
        middleware: m?.middleware,
        enabledSync: m?.enabledSync,
        reactiveDeps: m?.reactiveDeps,
        initState: m?.initState
      }
    );
    return w;
  };
  function v(_, m) {
    rt({ stateKey: _, options: m, initialOptionsPart: g });
  }
  return { useCogsState: $, setCogsOptions: v };
}, {
  setUpdaterState: W,
  setState: O,
  getInitialOptions: J,
  getKeyState: ot,
  getValidationErrors: mt,
  setStateLog: yt,
  updateInitialStateGlobal: B,
  addValidationError: It,
  removeValidationError: L,
  setServerSyncActions: pt
} = r.getState(), it = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, vt = (t, i, u, S) => {
  if (u?.initState) {
    const g = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, $ = u.initState ? `${S}-${i}-${u.initState.localStorageKey}` : i;
    window.localStorage.setItem($, JSON.stringify(g));
  }
}, _t = (t, i, u, S, g, $) => {
  const v = {
    initialState: i,
    updaterState: q(
      t,
      S,
      g,
      $
    ),
    state: u
  };
  E.startTransition(() => {
    B(t, v.initialState), W(t, v.updaterState), O(t, v.state);
  });
}, Et = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const u = /* @__PURE__ */ new Set();
  i.components.forEach((S) => {
    u.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    E.startTransition(() => {
      u.forEach((S) => S());
    });
  });
};
function $t(t, {
  stateKey: i,
  serverSync: u,
  zodSchema: S,
  localStorage: g,
  formElements: $,
  middleware: v,
  reactiveDeps: _,
  componentId: m,
  initState: y,
  syncUpdate: s
} = {}) {
  const [e, I] = E.useState({}), { sessionId: w } = ft();
  let F = !i;
  const [l] = E.useState(i ?? z()), M = r.getState().stateLog[l], H = E.useRef(/* @__PURE__ */ new Set()), c = E.useRef(m ?? z()), T = E.useRef(null);
  T.current = J(l), E.useEffect(() => {
    if (s && s.stateKey === l && s.path?.[0]) {
      O(l, (n) => ({
        ...n,
        [s.path[0]]: s.newValue
      }));
      const o = `${s.stateKey}:${s.path.join(".")}`;
      r.getState().setSyncInfo(o, {
        timeStamp: s.timeStamp,
        userId: s.userId
      });
    }
  }, [s]), E.useEffect(() => {
    nt(l, {
      initState: y
    });
    const o = it(
      w + "-" + l + "-" + y?.localStorageKey
    );
    let n = null;
    y?.initialState && (n = y?.initialState, o && o.lastUpdated > (o.lastSyncedWithServer || 0) && (n = o.state), _t(
      l,
      y?.initialState,
      n,
      h,
      c.current,
      w
    )), Et(l);
  }, [y?.localStorageKey, ...y?.dependencies || []]), E.useEffect(() => {
    F && nt(l, {
      serverSync: u,
      formElements: $,
      zodSchema: S,
      initState: y,
      localStorage: g,
      middleware: v
    });
    const o = `${l}////${c.current}`, n = r.getState().stateComponents.get(l) || {
      components: /* @__PURE__ */ new Map()
    };
    return console.log("stateEntry", n), n.components.set(o, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0
    }), r.getState().stateComponents.set(l, n), console.log(
      "   getGlobalStore.getState().stateComponent",
      r.getState().stateComponents
    ), () => {
      const d = `${l}////${c.current}`;
      n && (n.components.delete(d), n.components.size === 0 && r.getState().stateComponents.delete(l));
    };
  }, []);
  const h = (o, n, d, p) => {
    if (Array.isArray(n)) {
      const N = `${l}-${n.join(".")}`;
      H.current.add(N);
    }
    O(l, (N) => {
      const V = at(o) ? o(N) : o, Q = `${l}-${n.join(".")}`;
      if (Q) {
        let P = !1, f = r.getState().signalDomElements.get(Q);
        if ((!f || f.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const C = n.slice(0, -1), j = b(V, C);
          if (Array.isArray(j)) {
            P = !0;
            const x = `${l}-${C.join(".")}`;
            f = r.getState().signalDomElements.get(x);
          }
        }
        if (f) {
          const C = P ? b(V, n.slice(0, -1)) : b(V, n);
          f.forEach(({ parentId: j, position: x, effect: U }) => {
            const A = document.querySelector(
              `[data-parent-id="${j}"]`
            );
            if (A) {
              const Y = Array.from(A.childNodes);
              if (Y[x]) {
                const dt = U ? new Function(
                  "state",
                  `return (${U})(state)`
                )(C) : C;
                Y[x].textContent = String(dt);
              }
            }
          });
        }
      }
      d.updateType === "update" && (p || T.current?.validationKey) && n && L(
        (p || T.current?.validationKey) + "." + n.join(".")
      );
      const D = n.slice(0, n.length - 1);
      d.updateType === "cut" && T.current?.validationKey && L(
        T.current?.validationKey + "." + D.join(".")
      ), d.updateType === "insert" && T.current?.validationKey && mt(
        T.current?.validationKey + "." + D.join(".")
      ).filter(([f, C]) => {
        let j = f?.split(".").length;
        if (f == D.join(".") && j == D.length - 1) {
          let x = f + "." + D;
          L(f), It(x, C);
        }
      });
      const st = b(N, n), ct = b(V, n), lt = d.updateType === "update" ? n.join(".") : [...n].slice(0, -1).join("."), k = r.getState().stateComponents.get(l);
      if (console.log("stateEntry", k), k) {
        for (const [
          P,
          f
        ] of k.components.entries())
          if (f.depsFunction || f.paths && f.paths.has(lt))
            if (f.depsFunction) {
              const C = f.depsFunction(V);
              typeof C == "boolean" ? C && f.forceUpdate() : G(f.deps, C) || (f.deps = C, f.forceUpdate());
            } else
              f.forceUpdate();
      }
      const X = {
        timeStamp: Date.now(),
        stateKey: l,
        path: n,
        updateType: d.updateType,
        status: "new",
        oldValue: st,
        newValue: ct
      };
      if (yt(l, (P) => {
        const C = [...P ?? [], X].reduce((j, x) => {
          const U = `${x.stateKey}:${JSON.stringify(x.path)}`, A = j.get(U);
          return A ? (A.timeStamp = Math.max(
            A.timeStamp,
            x.timeStamp
          ), A.newValue = x.newValue, A.oldValue = A.oldValue ?? x.oldValue, A.updateType = x.updateType) : j.set(U, { ...x }), j;
        }, /* @__PURE__ */ new Map());
        return Array.from(C.values());
      }), vt(
        V,
        l,
        T.current,
        w
      ), v && v({ updateLog: M, update: X }), T.current?.serverSync) {
        const P = r.getState().serverState[l], f = T.current?.serverSync;
        pt(l, {
          syncKey: typeof f.syncKey == "string" ? f.syncKey : f.syncKey({ state: V }),
          rollBackState: P,
          actionTimeStamp: Date.now() + (f.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return V;
    });
  };
  r.getState().updaterState[l] || (console.log("Initializing state for", l, t), W(
    l,
    q(
      l,
      h,
      c.current,
      w
    )
  ), r.getState().cogsStateStore[l] || O(l, t), r.getState().initialStateGlobal[l] || B(l, t));
  const a = E.useMemo(() => q(
    l,
    h,
    c.current,
    w
  ), [l]);
  return [ot(l), a];
}
function q(t, i, u, S) {
  const g = /* @__PURE__ */ new Map();
  let $ = 0;
  const v = (s) => {
    const e = s.join(".");
    for (const [I] of g)
      (I === e || I.startsWith(e + ".")) && g.delete(I);
    $++;
  }, _ = /* @__PURE__ */ new Map(), m = {
    removeValidation: (s) => {
      s?.validationKey && L(s.validationKey);
    },
    revertToInitialState: (s) => {
      s?.validationKey && L(s.validationKey);
      const e = r.getState().initialStateGlobal[t];
      g.clear(), $++;
      const I = y(e, []);
      E.startTransition(() => {
        W(t, I), O(t, e);
        const w = r.getState().stateComponents.get(t);
        w && w.components.forEach((l) => {
          l.forceUpdate();
        });
        const F = J(t);
        F?.initState && localStorage.removeItem(
          F?.initState ? S + "-" + t + "-" + F?.initState.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (s) => {
      g.clear(), $++;
      const e = q(
        t,
        i,
        u,
        S
      );
      return E.startTransition(() => {
        B(t, s), W(t, e), O(t, s);
        const I = r.getState().stateComponents.get(t);
        I && I.components.forEach((w) => {
          w.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (I) => e.get()[I]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const s = r.getState().serverState[t];
      return !!(s && G(s, ot(t)));
    }
  };
  function y(s, e = [], I) {
    const w = e.map(String).join("."), F = g.get(w);
    if (F?.stateVersion === $)
      return F.proxy;
    const l = {
      get(H, c) {
        if (c !== "then" && c !== "$get") {
          const a = e.join("."), o = `${t}////${u}`, n = r.getState().stateComponents.get(t);
          if (n && a) {
            const d = n.components.get(o);
            d && d.paths.add(a);
          }
        }
        if (c === "lastSynced") {
          const a = `${t}:${e.join(".")}`;
          return r.getState().getSyncInfo(a);
        }
        if (c === "_selected") {
          const a = e.slice(0, -1), o = a.join("."), n = r.getState().getNestedState(t, a);
          return Array.isArray(n) ? Number(e[e.length - 1]) === _.get(o) : void 0;
        }
        if (c == "getLocalStorage")
          return (a) => it(
            S + "-" + t + "-" + a
          );
        if (c === "setSelected")
          return (a) => {
            const o = e.slice(0, -1), n = Number(e[e.length - 1]), d = o.join(".");
            a ? _.set(d, n) : _.delete(d);
            const p = r.getState().getNestedState(t, [...o]);
            K(i, p, o), v(o);
          };
        if (e.length == 0) {
          if (c == "_componentId") return u;
          if (c === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (c === "_serverState")
            return r.getState().serverState[t];
          if (c === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (c === "revertToInitialState")
            return m.revertToInitialState;
          if (c === "updateInitialState")
            return m.updateInitialState;
          if (c === "removeValidation")
            return m.removeValidation;
        }
        if (c === "validationWrapper")
          return ({
            children: a,
            hideMessage: o
          }) => /* @__PURE__ */ Z.jsx(
            St,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: r.getState().getInitialOptions(t)?.validationKey || "",
              stateKey: t,
              validIndices: I?.validIndices,
              children: a
            }
          );
        if (c === "_stateKey") return t;
        if (c === "_path") return e;
        if (c === "_isServerSynced") return m._isServerSynced;
        if (c === "update")
          return (a, o) => {
            v(e), K(i, a, e, "");
          };
        if (c === "get")
          return () => r.getState().getNestedState(t, e);
        if (c === "$get")
          return () => R({ _stateKey: t, _path: e });
        if (c === "formElement")
          return (a, o, n) => /* @__PURE__ */ Z.jsx(
            gt,
            {
              setState: i,
              validationKey: a,
              stateKey: t,
              path: e,
              child: o,
              formOpts: n
            }
          );
        if (Array.isArray(s)) {
          if (c === "getSelected")
            return () => {
              const a = _.get(
                e.join(".")
              );
              if (a !== void 0)
                return y(
                  s[a],
                  [...e, a.toString()],
                  I
                );
            };
          if (c === "$effect")
            return (a) => R({
              _stateKey: t,
              _path: e,
              _effect: a.toString()
            });
          if (c === "$get")
            return () => R({
              _stateKey: t,
              _path: e
            });
          if (c === "$get")
            return () => R({ _stateKey: t, _path: e });
          if (c === "stateEach")
            return (a) => {
              const o = I?.filtered?.some(
                (d) => d.join(".") === e.join(".")
              ), n = o ? s : r.getState().getNestedState(t, e);
              return g.clear(), $++, n.map((d, p) => {
                const N = o && d.__origIndex ? d.__origIndex : p, V = y(
                  d,
                  [...e, N.toString()],
                  I
                );
                return a(
                  d,
                  V,
                  p,
                  s,
                  y(
                    s,
                    e,
                    I
                  )
                );
              });
            };
          if (c === "stateFlattenOn")
            return (a) => {
              const n = I?.filtered?.some(
                (p) => p.join(".") === e.join(".")
              ) ? s : r.getState().getNestedState(t, e);
              g.clear(), $++;
              const d = n.flatMap(
                (p, N) => p[a] ?? []
              );
              return y(
                d,
                [...e, "[*]", a],
                I
              );
            };
          if (c === "findWith")
            return (a, o) => {
              const n = s.findIndex(
                (V) => V[a] === o
              );
              if (n === -1) return;
              const d = s[n], p = [...e, n.toString()];
              return {
                ...y(
                  d,
                  p
                ),
                cut: () => {
                  tt(
                    i,
                    e,
                    t,
                    n
                  );
                }
              };
            };
          if (c === "index")
            return (a) => {
              const o = s[a];
              return y(o, [
                ...e,
                a.toString()
              ]);
            };
          if (c === "insert")
            return (a) => (v(e), et(
              i,
              a,
              e,
              t
            ), y(
              r.getState().cogsStateStore[t],
              []
            ));
          if (c === "uniqueInsert")
            return (a, o) => {
              const n = r.getState().getNestedState(t, e), d = at(a) ? a(n) : a;
              !n.some((N) => o ? o.every(
                (V) => G(
                  N[V],
                  d[V]
                )
              ) : G(N, d)) && (v(e), et(
                i,
                d,
                e,
                t
              ));
            };
          if (c === "cut")
            return (a, o) => {
              o?.waitForSync || (v(e), tt(i, e, t, a));
            };
          if (c === "stateFilter")
            return (a) => {
              const o = s.map(
                (p, N) => ({
                  ...p,
                  __origIndex: N.toString()
                })
              ), n = [], d = [];
              for (let p = 0; p < o.length; p++)
                a(o[p], p) && (n.push(p), d.push(o[p]));
              return g.clear(), $++, y(
                d,
                e,
                {
                  filtered: [...I?.filtered || [], e],
                  validIndices: n
                  // Pass through the meta
                }
              );
            };
        }
        const T = [...e, c], h = r.getState().getNestedState(t, T);
        return y(h, T, I);
      }
    }, M = new Proxy(m, l);
    return g.set(w, {
      proxy: M,
      stateVersion: $
    }), M;
  }
  return y(
    r.getState().getNestedState(t, [])
  );
}
function R(t) {
  return E.createElement(wt, { proxy: t });
}
function wt({
  proxy: t
}) {
  const i = E.useRef(null), u = `${t._stateKey}-${t._path.join(".")}`;
  return console.log("SignalRenderer", u), E.useEffect(() => {
    const S = i.current;
    if (!S || !S.parentElement) return;
    const g = S.parentElement, v = Array.from(g.childNodes).indexOf(S);
    let _ = g.getAttribute("data-parent-id");
    _ || (_ = `parent-${crypto.randomUUID()}`, g.setAttribute("data-parent-id", _), t._effect && g.setAttribute("data-signal-effect", t._effect));
    const y = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: _,
      position: v,
      effect: t._effect
    };
    r.getState().addSignalElement(u, y);
    const s = r.getState().getNestedState(t._stateKey, t._path), e = document.createTextNode(String(s));
    S.replaceWith(e);
  }, [t._stateKey, t._path.join("."), t._effect]), E.createElement("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": u
  });
}
function Dt(t) {
  const i = E.useSyncExternalStore(
    (u) => {
      const S = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return S.components.set(t._stateKey, {
        forceUpdate: u,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => S.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return E.createElement("text", {}, String(i));
}
export {
  R as $cogsSignal,
  Dt as $cogsSignalStore,
  Ot as addStateOptions,
  ht as createCogsState,
  $t as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
