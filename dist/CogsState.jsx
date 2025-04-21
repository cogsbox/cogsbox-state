"use client";
import { jsx as it } from "react/jsx-runtime";
import { useState as Y, useRef as J, useEffect as K, useLayoutEffect as It, useMemo as Et, createElement as Q, useSyncExternalStore as _t, startTransition as B } from "react";
import { transformStateFunc as pt, isFunction as ft, getNestedValue as G, isDeepEqual as W, debounce as wt } from "./utility.js";
import { pushFunc as st, updateFn as z, cutFunc as ct, ValidationWrapper as Nt, FormControlComponent as Vt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as lt } from "./store.js";
import { useCogsConfig as $t } from "./CogsStateClient.jsx";
import tt from "./node_modules/uuid/dist/esm-browser/v4.js";
function dt(t, i) {
  const f = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, d = f(t) || {};
  g(t, {
    ...d,
    ...i
  });
}
function ut({
  stateKey: t,
  options: i,
  initialOptionsPart: f
}) {
  const g = et(t) || {}, d = f[t] || {}, E = r.getState().setInitialStateOptions, _ = { ...d, ...g };
  let v = !1;
  if (i)
    for (const S in i)
      _.hasOwnProperty(S) || (v = !0, _[S] = i[S]);
  v && E(t, _);
}
function qt(t, { formElements: i, validation: f }) {
  return { initialState: t, formElements: i, validation: f };
}
const zt = (t, i) => {
  let f = t;
  const [g, d] = pt(f);
  (i?.formElements || i?.validation) && Object.keys(d).forEach((v) => {
    d[v] = d[v] || {}, d[v].formElements = {
      ...i.formElements,
      // Global defaults first
      ...i?.validation,
      ...d[v].formElements || {}
      // State-specific overrides
    };
  }), r.getState().setInitialStates(g);
  const E = (v, S) => {
    const [w] = Y(S?.componentId ?? tt());
    ut({
      stateKey: v,
      options: S,
      initialOptionsPart: d
    });
    const u = r.getState().cogsStateStore[v] || g[v], e = S?.modifyState ? S.modifyState(u) : u, [I, $] = Ot(
      e,
      {
        stateKey: v,
        syncUpdate: S?.syncUpdate,
        componentId: w,
        localStorage: S?.localStorage,
        middleware: S?.middleware,
        enabledSync: S?.enabledSync,
        reactiveType: S?.reactiveType,
        reactiveDeps: S?.reactiveDeps,
        initState: S?.initState,
        localStorageKey: S?.localStorageKey
      }
    );
    return $;
  };
  function _(v, S) {
    ut({ stateKey: v, options: S, initialOptionsPart: d });
  }
  return { useCogsState: E, setCogsOptions: _ };
}, {
  setUpdaterState: Z,
  setState: L,
  getInitialOptions: et,
  getKeyState: gt,
  getValidationErrors: ht,
  setStateLog: Tt,
  updateInitialStateGlobal: nt,
  addValidationError: At,
  removeValidationError: P,
  setServerSyncActions: Ct
} = r.getState(), St = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Ft = (t, i, f, g) => {
  if (console.log("saveToLocalStorage", t, i, f), f.localStorageKey) {
    const d = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, E = f.initState ? `${g}-${i}-${f.localStorageKey}` : i;
    window.localStorage.setItem(E, JSON.stringify(d));
  }
}, jt = (t, i, f, g, d, E) => {
  const _ = {
    initialState: i,
    updaterState: H(
      t,
      g,
      d,
      E
    ),
    state: f
  };
  B(() => {
    nt(t, _.initialState), Z(t, _.updaterState), L(t, _.state);
  });
}, mt = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const f = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    f.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    B(() => {
      f.forEach((g) => g());
    });
  });
}, Jt = (t, i) => {
  const f = r.getState().stateComponents.get(t);
  if (f) {
    const g = `${t}////${i}`, d = f.components.get(g);
    d && d.forceUpdate();
  }
};
function Ot(t, {
  stateKey: i,
  serverSync: f,
  localStorage: g,
  formElements: d,
  middleware: E,
  reactiveDeps: _,
  reactiveType: v,
  componentId: S,
  localStorageKey: w,
  initState: u,
  syncUpdate: e
} = {}) {
  const [I, $] = Y({}), { sessionId: F } = $t();
  let R = !i;
  const [l] = Y(i ?? tt()), x = r.getState().stateLog[l], s = J(/* @__PURE__ */ new Set()), b = J(S ?? tt()), A = J(null);
  A.current = et(l), K(() => {
    if (e && e.stateKey === l && e.path?.[0]) {
      L(l, (o) => ({
        ...o,
        [e.path[0]]: e.newValue
      }));
      const a = `${e.stateKey}:${e.path.join(".")}`;
      r.getState().setSyncInfo(a, {
        timeStamp: e.timeStamp,
        userId: e.userId
      });
    }
  }, [e]), K(() => {
    dt(l, {
      initState: u
    });
    let a = null;
    w && (a = St(
      F + "-" + l + "-" + w
    ));
    let o = null;
    u?.initialState && (o = u?.initialState, a && a.lastUpdated > (a.lastSyncedWithServer || 0) && (o = a.state), jt(
      l,
      u?.initialState,
      o,
      D,
      b.current,
      F
    ), mt(l), $({}));
  }, [w, ...u?.dependencies || []]), It(() => {
    R && dt(l, {
      serverSync: f,
      formElements: d,
      initState: u,
      localStorage: g,
      middleware: E
    });
    const a = `${l}////${b.current}`, o = r.getState().stateComponents.get(l) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(a, {
      forceUpdate: () => $({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: v ?? ["component", "deps"]
    }), r.getState().stateComponents.set(l, o), $({}), () => {
      const c = `${l}////${b.current}`;
      o && (o.components.delete(c), o.components.size === 0 && r.getState().stateComponents.delete(l));
    };
  }, []);
  const D = (a, o, c, m) => {
    if (Array.isArray(o)) {
      const p = `${l}-${o.join(".")}`;
      s.current.add(p);
    }
    L(l, (p) => {
      const h = ft(a) ? a(p) : a, j = `${l}-${o.join(".")}`;
      if (j) {
        let U = !1, y = r.getState().signalDomElements.get(j);
        if ((!y || y.size === 0) && (c.updateType === "insert" || c.updateType === "cut")) {
          const V = o.slice(0, -1), T = G(h, V);
          if (Array.isArray(T)) {
            U = !0;
            const N = `${l}-${V.join(".")}`;
            y = r.getState().signalDomElements.get(N);
          }
        }
        if (y) {
          const V = U ? G(h, o.slice(0, -1)) : G(h, o);
          y.forEach(({ parentId: T, position: N, effect: k }) => {
            const O = document.querySelector(
              `[data-parent-id="${T}"]`
            );
            if (O) {
              const ot = Array.from(O.childNodes);
              if (ot[N]) {
                const vt = k ? new Function("state", `return (${k})(state)`)(V) : V;
                ot[N].textContent = String(vt);
              }
            }
          });
        }
      }
      c.updateType === "update" && (m || A.current?.validationKey) && o && P(
        (m || A.current?.validationKey) + "." + o.join(".")
      );
      const C = o.slice(0, o.length - 1);
      c.updateType === "cut" && A.current?.validationKey && P(
        A.current?.validationKey + "." + C.join(".")
      ), c.updateType === "insert" && A.current?.validationKey && ht(
        A.current?.validationKey + "." + C.join(".")
      ).filter(([y, V]) => {
        let T = y?.split(".").length;
        if (y == C.join(".") && T == C.length - 1) {
          let N = y + "." + C;
          P(y), At(N, V);
        }
      });
      const M = G(p, o), q = G(h, o), yt = c.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), rt = r.getState().stateComponents.get(l);
      if (rt)
        for (const [U, y] of rt.components.entries()) {
          let V = !1;
          const T = Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"];
          if (!T.includes("none")) {
            if (T.includes("all")) {
              y.forceUpdate();
              continue;
            }
            if (T.includes("component") && y.paths && (y.paths.has(yt) || y.paths.has("")) && (V = !0), !V && T.includes("deps") && y.depsFunction) {
              const N = y.depsFunction(h);
              typeof N == "boolean" ? N && (V = !0) : W(y.deps, N) || (y.deps = N, V = !0);
            }
            V && y.forceUpdate();
          }
        }
      const at = {
        timeStamp: Date.now(),
        stateKey: l,
        path: o,
        updateType: c.updateType,
        status: "new",
        oldValue: M,
        newValue: q
      };
      if (Tt(l, (U) => {
        const V = [...U ?? [], at].reduce((T, N) => {
          const k = `${N.stateKey}:${JSON.stringify(N.path)}`, O = T.get(k);
          return O ? (O.timeStamp = Math.max(O.timeStamp, N.timeStamp), O.newValue = N.newValue, O.oldValue = O.oldValue ?? N.oldValue, O.updateType = N.updateType) : T.set(k, { ...N }), T;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), Ft(
        h,
        l,
        A.current,
        F
      ), E && E({
        updateLog: x,
        update: at
      }), A.current?.serverSync) {
        const U = r.getState().serverState[l], y = A.current?.serverSync;
        Ct(l, {
          syncKey: typeof y.syncKey == "string" ? y.syncKey : y.syncKey({ state: h }),
          rollBackState: U,
          actionTimeStamp: Date.now() + (y.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return h;
    });
  };
  r.getState().updaterState[l] || (Z(
    l,
    H(
      l,
      D,
      b.current,
      F
    )
  ), r.getState().cogsStateStore[l] || L(l, t), r.getState().initialStateGlobal[l] || nt(l, t));
  const n = Et(() => H(
    l,
    D,
    b.current,
    F
  ), [l]);
  return [gt(l), n];
}
function H(t, i, f, g) {
  const d = /* @__PURE__ */ new Map();
  let E = 0;
  const _ = (u) => {
    const e = u.join(".");
    for (const [I] of d)
      (I === e || I.startsWith(e + ".")) && d.delete(I);
    E++;
  }, v = /* @__PURE__ */ new Map(), S = {
    removeValidation: (u) => {
      u?.validationKey && P(u.validationKey);
    },
    revertToInitialState: (u) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && P(e?.key), u?.validationKey && P(u.validationKey);
      const I = r.getState().initialStateGlobal[t];
      d.clear(), E++;
      const $ = w(I, []);
      B(() => {
        Z(t, $), L(t, I);
        const F = r.getState().stateComponents.get(t);
        F && F.components.forEach((l) => {
          l.forceUpdate();
        });
        const R = et(t);
        R?.localStorageKey && localStorage.removeItem(
          R?.initState ? g + "-" + t + "-" + R?.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (u) => {
      d.clear(), E++;
      const e = H(
        t,
        i,
        f,
        g
      );
      return B(() => {
        nt(t, u), Z(t, e), L(t, u);
        const I = r.getState().stateComponents.get(t);
        I && I.components.forEach(($) => {
          $.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (I) => e.get()[I]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const u = r.getState().serverState[t];
      return !!(u && W(u, gt(t)));
    }
  };
  function w(u, e = [], I) {
    const $ = e.map(String).join(".");
    d.get($);
    const F = function() {
      return r().getNestedState(t, e);
    };
    Object.keys(S).forEach((x) => {
      F[x] = S[x];
    });
    const R = {
      apply(x, s, b) {
        return r().getNestedState(t, e);
      },
      get(x, s) {
        if (s !== "then" && !s.startsWith("$") && s !== "stateMapNoRender") {
          const n = e.join("."), a = `${t}////${f}`, o = r.getState().stateComponents.get(t);
          if (o) {
            const c = o.components.get(a);
            c && (e.length > 0 || s === "get") && c.paths.add(n);
          }
        }
        if (s === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(t)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(n.key + "." + e.join("."));
          };
        if (Array.isArray(u)) {
          if (s === "getSelected")
            return () => {
              const n = v.get(e.join("."));
              if (n !== void 0)
                return w(
                  u[n],
                  [...e, n.toString()],
                  I
                );
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const a = I?.filtered?.some(
                (c) => c.join(".") === e.join(".")
              ), o = a ? u : r.getState().getNestedState(t, e);
              return s !== "stateMapNoRender" && (d.clear(), E++), o.map((c, m) => {
                const p = a && c.__origIndex ? c.__origIndex : m, h = w(
                  c,
                  [...e, p.toString()],
                  I
                );
                return n(
                  c,
                  h,
                  m,
                  u,
                  w(u, e, I)
                );
              });
            };
          if (s === "$stateMap")
            return (n) => Q(bt, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: w
            });
          if (s === "stateFlattenOn")
            return (n) => {
              const o = I?.filtered?.some(
                (m) => m.join(".") === e.join(".")
              ) ? u : r.getState().getNestedState(t, e);
              d.clear(), E++;
              const c = o.flatMap(
                (m, p) => m[n] ?? []
              );
              return w(
                c,
                [...e, "[*]", n],
                I
              );
            };
          if (s === "findWith")
            return (n, a) => {
              const o = u.findIndex(
                (p) => p[n] === a
              );
              if (o === -1) return;
              const c = u[o], m = [...e, o.toString()];
              return d.clear(), E++, d.clear(), E++, w(c, m);
            };
          if (s === "index")
            return (n) => {
              const a = u[n];
              return w(a, [...e, n.toString()]);
            };
          if (s === "insert")
            return (n) => (_(e), st(i, n, e, t), w(
              r.getState().cogsStateStore[t],
              []
            ));
          if (s === "uniqueInsert")
            return (n, a, o) => {
              const c = r.getState().getNestedState(t, e), m = ft(n) ? n(c) : n;
              let p = null;
              if (!c.some((j) => {
                if (a) {
                  const M = a.every(
                    (q) => W(j[q], m[q])
                  );
                  return M && (p = j), M;
                }
                const C = W(j, m);
                return C && (p = j), C;
              }))
                _(e), st(i, m, e, t);
              else if (o && p) {
                const j = o(p), C = c.map(
                  (M) => W(M, p) ? j : M
                );
                _(e), z(i, C, e);
              }
            };
          if (s === "cut")
            return (n, a) => {
              a?.waitForSync || (_(e), ct(i, e, t, n));
            };
          if (s === "stateFilter")
            return (n) => {
              const a = u.map((m, p) => ({
                ...m,
                __origIndex: p.toString()
              })), o = [], c = [];
              for (let m = 0; m < a.length; m++)
                n(a[m], m) && (o.push(m), c.push(a[m]));
              return d.clear(), E++, w(c, e, {
                filtered: [...I?.filtered || [], e],
                validIndices: o
                // Always pass validIndices, even if empty
              });
            };
        }
        const b = e[e.length - 1];
        if (!isNaN(Number(b))) {
          const n = e.slice(0, -1), a = r.getState().getNestedState(t, n);
          if (Array.isArray(a) && s === "cut")
            return () => ct(
              i,
              n,
              t,
              Number(b)
            );
        }
        if (s === "get")
          return () => r.getState().getNestedState(t, e);
        if (s === "$derive")
          return (n) => X({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (s === "$derive")
          return (n) => X({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (s === "$get")
          return () => X({
            _stateKey: t,
            _path: e
          });
        if (s === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (s === "_selected") {
          const n = e.slice(0, -1), a = n.join("."), o = r.getState().getNestedState(t, n);
          return Array.isArray(o) ? Number(e[e.length - 1]) === v.get(a) : void 0;
        }
        if (s == "getLocalStorage")
          return (n) => St(g + "-" + t + "-" + n);
        if (s === "setSelected")
          return (n) => {
            const a = e.slice(0, -1), o = Number(e[e.length - 1]), c = a.join(".");
            n ? v.set(c, o) : v.delete(c);
            const m = r.getState().getNestedState(t, [...a]);
            z(i, m, a), _(a);
          };
        if (e.length == 0) {
          if (s === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(t)?.validation, a = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              P(n.key);
              const o = r.getState().cogsStateStore[t];
              try {
                const c = r.getState().getValidationErrors(n.key);
                c && c.length > 0 && c.forEach(([p]) => {
                  p && p.startsWith(n.key) && P(p);
                });
                const m = n.zodSchema.safeParse(o);
                return m.success ? !0 : (m.error.errors.forEach((h) => {
                  const j = h.path, C = h.message, M = [n.key, ...j].join(".");
                  a(M, C);
                }), mt(t), !1);
              } catch (c) {
                return console.error("Zod schema validation failed", c), !1;
              }
            };
          if (s === "_componentId") return f;
          if (s === "getComponents")
            return () => r().stateComponents.get(t);
          if (s === "getAllFormRefs")
            return () => lt.getState().getFormRefsByStateKey(t);
          if (s === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (s === "_serverState")
            return r.getState().serverState[t];
          if (s === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (s === "revertToInitialState")
            return S.revertToInitialState;
          if (s === "updateInitialState") return S.updateInitialState;
          if (s === "removeValidation") return S.removeValidation;
        }
        if (s === "getFormRef")
          return () => lt.getState().getFormRef(t + "." + e.join("."));
        if (s === "validationWrapper")
          return ({
            children: n,
            hideMessage: a
          }) => /* @__PURE__ */ it(
            Nt,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: I?.validIndices,
              children: n
            }
          );
        if (s === "_stateKey") return t;
        if (s === "_path") return e;
        if (s === "_isServerSynced") return S._isServerSynced;
        if (s === "update")
          return (n, a) => {
            if (a?.debounce)
              wt(() => {
                z(i, n, e, "");
                const o = r.getState().getNestedState(t, e);
                a?.afterUpdate && a.afterUpdate(o);
              }, a.debounce);
            else {
              z(i, n, e, "");
              const o = r.getState().getNestedState(t, e);
              a?.afterUpdate && a.afterUpdate(o);
            }
            _(e);
          };
        if (s === "formElement")
          return (n, a) => /* @__PURE__ */ it(
            Vt,
            {
              setState: i,
              stateKey: t,
              path: e,
              child: n,
              formOpts: a
            }
          );
        const A = [...e, s], D = r.getState().getNestedState(t, A);
        return w(D, A, I);
      }
    }, l = new Proxy(F, R);
    return d.set($, {
      proxy: l,
      stateVersion: E
    }), l;
  }
  return w(
    r.getState().getNestedState(t, [])
  );
}
function X(t) {
  return Q(Mt, { proxy: t });
}
function bt({
  proxy: t,
  rebuildStateShape: i
}) {
  const f = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(f) ? i(
    f,
    t._path
  ).stateMapNoRender(
    (d, E, _, v, S) => t._mapFn(d, E, _, v, S)
  ) : null;
}
function Mt({
  proxy: t
}) {
  const i = J(null), f = `${t._stateKey}-${t._path.join(".")}`;
  return K(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const d = g.parentElement, _ = Array.from(d.childNodes).indexOf(g);
    let v = d.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", v));
    const w = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: _,
      effect: t._effect
    };
    r.getState().addSignalElement(f, w);
    const u = r.getState().getNestedState(t._stateKey, t._path);
    let e;
    if (t._effect)
      try {
        e = new Function(
          "state",
          `return (${t._effect})(state)`
        )(u);
      } catch ($) {
        console.error("Error evaluating effect function during mount:", $), e = u;
      }
    else
      e = u;
    e !== null && typeof e == "object" && (e = JSON.stringify(e));
    const I = document.createTextNode(String(e));
    g.replaceWith(I);
  }, [t._stateKey, t._path.join("."), t._effect]), Q("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": f
  });
}
function Bt(t) {
  const i = _t(
    (f) => {
      const g = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(t._stateKey, {
        forceUpdate: f,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => g.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return Q("text", {}, String(i));
}
export {
  X as $cogsSignal,
  Bt as $cogsSignalStore,
  qt as addStateOptions,
  zt as createCogsState,
  Jt as notifyComponent,
  Ot as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
