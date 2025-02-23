"use client";
import { j as Y } from "./node_modules/react/jsx-runtime.jsx";
import { r as w } from "./node_modules/react/index.js";
import { transformStateFunc as ut, isFunction as at, getNestedValue as U, isDeepEqual as R } from "./utility.js";
import { pushFunc as Z, cutFunc as K, updateFn as tt, ValidationWrapper as St, FormControlComponent as gt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as a } from "./store.js";
import { useCogsConfig as ft } from "./CogsStateClient.jsx";
import z from "./node_modules/uuid/dist/esm-browser/v4.js";
function Ot(t, { formElements: o, zodSchema: d }) {
  return { initialState: t, formElements: o, zodSchema: d };
}
function et(t, o) {
  const d = a.getState().getInitialOptions, u = a.getState().setInitialStateOptions, S = d(t) || {};
  u(t, {
    ...S,
    ...o
  });
}
function nt({
  stateKey: t,
  options: o,
  initialOptionsPart: d
}) {
  const u = J(t) || {}, S = d[t] || {}, v = a.getState().setInitialStateOptions, E = { ...S, ...u };
  let _ = !1;
  if (o)
    for (const y in o)
      E.hasOwnProperty(y) || (_ = !0, E[y] = o[y]);
  _ && v(t, E);
}
const ht = (t, o) => {
  let d = t;
  const [u, S] = ut(d);
  a.getState().setInitialStates(u);
  const v = (_, y) => {
    const [p] = w.useState(z());
    nt({ stateKey: _, options: y, initialOptionsPart: S });
    const i = a.getState().cogsStateStore[_] || u[_], r = y?.modifyState ? y.modifyState(i) : i, [I, V] = wt(
      r,
      {
        stateKey: _,
        syncUpdate: y?.syncUpdate,
        componentId: p,
        localStorage: y?.localStorage,
        middleware: y?.middleware,
        enabledSync: y?.enabledSync,
        reactiveDeps: y?.reactiveDeps,
        initState: y?.initState
      }
    );
    return V;
  };
  function E(_, y) {
    nt({ stateKey: _, options: y, initialOptionsPart: S });
  }
  return { useCogsState: v, setCogsOptions: E };
}, {
  setUpdaterState: G,
  setState: h,
  getInitialOptions: J,
  getKeyState: ot,
  getValidationErrors: mt,
  setStateLog: yt,
  updateInitialStateGlobal: B,
  addValidationError: pt,
  removeValidationError: L,
  setServerSyncActions: It
} = a.getState(), it = (t) => {
  if (!t) return null;
  try {
    const o = window.localStorage.getItem(t);
    return o ? JSON.parse(o) : null;
  } catch (o) {
    return console.error("Error loading from localStorage:", o), null;
  }
}, vt = (t, o, d, u) => {
  if (d?.initState) {
    const S = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: a.getState().serverSyncLog[o]?.[0]?.timeStamp,
      baseServerState: a.getState().serverState[o]
    }, v = d.initState ? `${u}-${o}-${d.initState.localStorageKey}` : o;
    window.localStorage.setItem(v, JSON.stringify(S));
  }
}, Et = (t, o, d, u, S, v) => {
  const E = {
    initialState: o,
    updaterState: W(
      t,
      u,
      S,
      v
    ),
    state: d
  };
  w.startTransition(() => {
    B(t, E.initialState), G(t, E.updaterState), h(t, E.state);
  });
}, _t = (t) => {
  const o = a.getState().stateComponents.get(t);
  if (!o) return;
  const d = /* @__PURE__ */ new Set();
  o.components.forEach((u) => {
    d.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    w.startTransition(() => {
      d.forEach((u) => u());
    });
  });
};
function wt(t, {
  stateKey: o,
  serverSync: d,
  zodSchema: u,
  localStorage: S,
  formElements: v,
  middleware: E,
  reactiveDeps: _,
  componentId: y,
  initState: p,
  syncUpdate: i
} = {}) {
  const [r, I] = w.useState({}), { sessionId: V } = ft();
  let j = !o;
  const [c] = w.useState(o ?? z()), M = a.getState().stateLog[c], H = w.useRef(/* @__PURE__ */ new Set()), s = w.useRef(y ?? z()), x = w.useRef(null);
  x.current = J(c), w.useEffect(() => {
    if (i && i.stateKey === c && i.path?.[0]) {
      h(c, (e) => ({
        ...e,
        [i.path[0]]: i.newValue
      }));
      const n = `${i.stateKey}:${i.path.join(".")}`;
      a.getState().setSyncInfo(n, {
        timeStamp: i.timeStamp,
        userId: i.userId
      });
    }
  }, [i]), w.useEffect(() => {
    et(c, {
      initState: p
    });
    const n = it(
      V + "-" + c + "-" + p?.localStorageKey
    );
    let e = null;
    p?.initialState && (e = p?.initialState, n && n.lastUpdated > (n.lastSyncedWithServer || 0) && (e = n.state), Et(
      c,
      p?.initialState,
      e,
      O,
      s.current,
      V
    )), _t(c);
  }, [p?.localStorageKey, ...p?.dependencies || []]), w.useEffect(() => {
    j && et(c, {
      serverSync: d,
      formElements: v,
      zodSchema: u,
      initState: p,
      localStorage: S,
      middleware: E
    });
    const n = `${c}////${s.current}`, e = a.getState().stateComponents.get(c) || {
      components: /* @__PURE__ */ new Map()
    };
    return console.log("stateEntry", e), e.components.set(n, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0
    }), a.getState().stateComponents.set(c, e), console.log(
      "   getGlobalStore.getState().stateComponent",
      a.getState().stateComponents
    ), () => {
      const l = `${c}////${s.current}`;
      e && (e.components.delete(l), e.components.size === 0 && a.getState().stateComponents.delete(c));
    };
  }, []);
  const O = (n, e, l, g) => {
    if (Array.isArray(e)) {
      const m = `${c}-${e.join(".")}`;
      H.current.add(m);
    }
    h(c, (m) => {
      const $ = at(n) ? n(m) : n, P = `${c}-${e.join(".")}`;
      if (P) {
        let F = !1, f = a.getState().signalDomElements.get(P);
        if ((!f || f.size === 0) && (l.updateType === "insert" || l.updateType === "cut")) {
          const N = e.slice(0, -1), A = U($, N);
          if (Array.isArray(A)) {
            F = !0;
            const C = `${c}-${N.join(".")}`;
            f = a.getState().signalDomElements.get(C);
          }
        }
        if (f) {
          const N = F ? U($, e.slice(0, -1)) : U($, e);
          f.forEach(({ parentId: A, position: C, effect: D }) => {
            const T = document.querySelector(
              `[data-parent-id="${A}"]`
            );
            if (T) {
              const X = Array.from(T.childNodes);
              if (X[C]) {
                const dt = D ? new Function(
                  "state",
                  `return (${D})(state)`
                )(N) : N;
                X[C].textContent = String(dt);
              }
            }
          });
        }
      }
      l.updateType === "update" && (g || x.current?.validationKey) && e && L(
        (g || x.current?.validationKey) + "." + e.join(".")
      );
      const b = e.slice(0, e.length - 1);
      l.updateType === "cut" && x.current?.validationKey && L(
        x.current?.validationKey + "." + b.join(".")
      ), l.updateType === "insert" && x.current?.validationKey && mt(
        x.current?.validationKey + "." + b.join(".")
      ).filter(([f, N]) => {
        let A = f?.split(".").length;
        if (f == b.join(".") && A == b.length - 1) {
          let C = f + "." + b;
          L(f), pt(C, N);
        }
      });
      const st = U(m, e), ct = U($, e), lt = l.updateType === "update" ? e.join(".") : [...e].slice(0, -1).join("."), k = a.getState().stateComponents.get(c);
      if (console.log("stateEntry", k), k) {
        for (const [
          F,
          f
        ] of k.components.entries())
          if (f.depsFunction || f.paths && f.paths.has(lt))
            if (f.depsFunction) {
              const N = f.depsFunction($);
              typeof N == "boolean" ? N && f.forceUpdate() : R(f.deps, N) || (f.deps = N, f.forceUpdate());
            } else
              f.forceUpdate();
      }
      const Q = {
        timeStamp: Date.now(),
        stateKey: c,
        path: e,
        updateType: l.updateType,
        status: "new",
        oldValue: st,
        newValue: ct
      };
      if (yt(c, (F) => {
        const N = [...F ?? [], Q].reduce((A, C) => {
          const D = `${C.stateKey}:${JSON.stringify(C.path)}`, T = A.get(D);
          return T ? (T.timeStamp = Math.max(
            T.timeStamp,
            C.timeStamp
          ), T.newValue = C.newValue, T.oldValue = T.oldValue ?? C.oldValue, T.updateType = C.updateType) : A.set(D, { ...C }), A;
        }, /* @__PURE__ */ new Map());
        return Array.from(N.values());
      }), vt(
        $,
        c,
        x.current,
        V
      ), E && E({ updateLog: M, update: Q }), x.current?.serverSync) {
        const F = a.getState().serverState[c], f = x.current?.serverSync;
        It(c, {
          syncKey: typeof f.syncKey == "string" ? f.syncKey : f.syncKey({ state: $ }),
          rollBackState: F,
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
      O,
      s.current,
      V
    )
  ), a.getState().cogsStateStore[c] || h(c, t), a.getState().initialStateGlobal[c] || B(c, t));
  const q = w.useMemo(() => W(
    c,
    O,
    s.current,
    V
  ), [c]);
  return [ot(c), q];
}
function W(t, o, d, u) {
  const S = /* @__PURE__ */ new Map();
  let v = 0;
  const E = (i) => {
    const r = i.join(".");
    for (const [I] of S)
      (I === r || I.startsWith(r + ".")) && S.delete(I);
    v++;
  }, _ = /* @__PURE__ */ new Map(), y = {
    removeValidation: (i) => {
      i?.validationKey && L(i.validationKey);
    },
    revertToInitialState: (i) => {
      i?.validationKey && L(i.validationKey);
      const r = a.getState().initialStateGlobal[t];
      S.clear(), v++;
      const I = p(r, []);
      w.startTransition(() => {
        G(t, I), h(t, r);
        const V = a.getState().stateComponents.get(t);
        V && V.components.forEach((c) => {
          c.forceUpdate();
        });
        const j = J(t);
        j?.initState && localStorage.removeItem(
          j?.initState ? u + "-" + t + "-" + j?.initState.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (i) => {
      S.clear(), v++;
      const r = W(
        t,
        o,
        d,
        u
      );
      return w.startTransition(() => {
        B(t, i), G(t, r), h(t, i);
        const I = a.getState().stateComponents.get(t);
        I && I.components.forEach((V) => {
          V.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (I) => r.get()[I]
      };
    },
    _initialState: a.getState().initialStateGlobal[t],
    _serverState: a.getState().serverState[t],
    _isLoading: a.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const i = a.getState().serverState[t];
      return !!(i && R(i, ot(t)));
    }
  };
  function p(i, r = [], I) {
    const V = r.map(String).join("."), j = S.get(V);
    if (j?.stateVersion === v)
      return j.proxy;
    const c = {
      get(H, s) {
        if (s !== "then" && s !== "$get") {
          console.log("prop", s);
          const n = r.join("."), e = `${t}////${d}`, l = a.getState().stateComponents.get(t);
          if (l && n) {
            const g = l.components.get(e);
            g && g.paths.add(n);
          }
        }
        if (Array.isArray(i)) {
          if (s === "getSelected")
            return () => {
              const n = _.get(
                r.join(".")
              );
              if (n !== void 0)
                return p(
                  i[n],
                  [...r, n.toString()],
                  I
                );
            };
          if (s === "stateEach")
            return (n) => {
              const e = I?.filtered?.some(
                (g) => g.join(".") === r.join(".")
              ), l = e ? i : a.getState().getNestedState(t, r);
              return S.clear(), v++, l.map((g, m) => {
                const $ = e && g.__origIndex ? g.__origIndex : m, P = p(
                  g,
                  [...r, $.toString()],
                  I
                );
                return n(
                  g,
                  P,
                  m,
                  i,
                  p(
                    i,
                    r,
                    I
                  )
                );
              });
            };
          if (s === "stateFlattenOn")
            return (n) => {
              const l = I?.filtered?.some(
                (m) => m.join(".") === r.join(".")
              ) ? i : a.getState().getNestedState(t, r);
              S.clear(), v++;
              const g = l.flatMap(
                (m, $) => m[n] ?? []
              );
              return p(
                g,
                [...r, "[*]", n],
                I
              );
            };
          if (s === "findWith")
            return (n, e) => {
              const l = i.findIndex(
                ($) => $[n] === e
              );
              if (l === -1) return;
              const g = i[l], m = [...r, l.toString()];
              return S.clear(), v++, S.clear(), v++, p(g, m);
            };
          if (s === "index")
            return (n) => {
              const e = i[n];
              return p(e, [
                ...r,
                n.toString()
              ]);
            };
          if (s === "insert")
            return (n) => (E(r), Z(
              o,
              n,
              r,
              t
            ), p(
              a.getState().cogsStateStore[t],
              []
            ));
          if (s === "uniqueInsert")
            return (n, e) => {
              const l = a.getState().getNestedState(t, r), g = at(n) ? n(l) : n;
              !l.some(($) => e ? e.every(
                (P) => R(
                  $[P],
                  g[P]
                )
              ) : R($, g)) && (E(r), Z(
                o,
                g,
                r,
                t
              ));
            };
          if (s === "cut")
            return (n, e) => {
              e?.waitForSync || (E(r), K(o, r, t, n));
            };
          if (s === "stateFilter")
            return (n) => {
              const e = i.map(
                (m, $) => ({
                  ...m,
                  __origIndex: $.toString()
                })
              ), l = [], g = [];
              for (let m = 0; m < e.length; m++)
                n(e[m], m) && (l.push(m), g.push(e[m]));
              return S.clear(), v++, p(
                g,
                r,
                {
                  filtered: [...I?.filtered || [], r],
                  validIndices: l
                  // Pass through the meta
                }
              );
            };
        }
        const x = r[r.length - 1];
        if (!isNaN(Number(x))) {
          const n = r.slice(0, -1), e = a.getState().getNestedState(t, n);
          if (Array.isArray(e) && s === "cut")
            return () => K(
              o,
              n,
              t,
              Number(x)
            );
        }
        if (s === "get")
          return () => a.getState().getNestedState(t, r);
        if (s === "$effect")
          return (n) => rt({
            _stateKey: t,
            _path: r,
            _effect: n.toString()
          });
        if (s === "$get")
          return () => rt({
            _stateKey: t,
            _path: r
          });
        if (s === "lastSynced") {
          const n = `${t}:${r.join(".")}`;
          return a.getState().getSyncInfo(n);
        }
        if (s === "_selected") {
          const n = r.slice(0, -1), e = n.join("."), l = a.getState().getNestedState(t, n);
          return Array.isArray(l) ? Number(r[r.length - 1]) === _.get(e) : void 0;
        }
        if (s == "getLocalStorage")
          return (n) => it(
            u + "-" + t + "-" + n
          );
        if (s === "setSelected")
          return (n) => {
            const e = r.slice(0, -1), l = Number(r[r.length - 1]), g = e.join(".");
            n ? _.set(g, l) : _.delete(g);
            const m = a.getState().getNestedState(t, [...e]);
            tt(o, m, e), E(e);
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
            children: n,
            hideMessage: e
          }) => /* @__PURE__ */ Y.jsx(
            St,
            {
              formOpts: e ? { validation: { message: "" } } : void 0,
              path: r,
              validationKey: a.getState().getInitialOptions(t)?.validationKey || "",
              stateKey: t,
              validIndices: I?.validIndices,
              children: n
            }
          );
        if (s === "_stateKey") return t;
        if (s === "_path") return r;
        if (s === "_isServerSynced") return y._isServerSynced;
        if (s === "update")
          return (n, e) => {
            E(r), tt(o, n, r, "");
          };
        if (s === "formElement")
          return (n, e, l) => /* @__PURE__ */ Y.jsx(
            gt,
            {
              setState: o,
              validationKey: n,
              stateKey: t,
              path: r,
              child: e,
              formOpts: l
            }
          );
        const O = [...r, s], q = a.getState().getNestedState(t, O);
        return p(q, O, I);
      }
    }, M = new Proxy(y, c);
    return S.set(V, {
      proxy: M,
      stateVersion: v
    }), M;
  }
  return p(
    a.getState().getNestedState(t, [])
  );
}
function rt(t) {
  return w.createElement($t, { proxy: t });
}
function $t({
  proxy: t
}) {
  const o = w.useRef(null), d = `${t._stateKey}-${t._path.join(".")}`;
  return console.log("SignalRenderer", d), w.useEffect(() => {
    const u = o.current;
    if (!u || !u.parentElement) return;
    const S = u.parentElement, E = Array.from(S.childNodes).indexOf(u);
    let _ = S.getAttribute("data-parent-id");
    _ || (_ = `parent-${crypto.randomUUID()}`, S.setAttribute("data-parent-id", _));
    const p = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: _,
      position: E,
      effect: t._effect
    };
    a.getState().addSignalElement(d, p);
    const i = a.getState().getNestedState(t._stateKey, t._path), r = document.createTextNode(String(i));
    u.replaceWith(r);
  }, [t._stateKey, t._path.join("."), t._effect]), w.createElement("span", {
    ref: o,
    style: { display: "none" },
    "data-signal-id": d
  });
}
function bt(t) {
  const o = w.useSyncExternalStore(
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
  return w.createElement("text", {}, String(o));
}
export {
  rt as $cogsSignal,
  bt as $cogsSignalStore,
  Ot as addStateOptions,
  ht as createCogsState,
  wt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
