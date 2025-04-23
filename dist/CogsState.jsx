"use client";
import { jsx as lt } from "react/jsx-runtime";
import { useState as et, useRef as Z, useEffect as nt, useLayoutEffect as It, useMemo as Et, createElement as Y, useSyncExternalStore as _t, startTransition as H } from "react";
import { transformStateFunc as wt, isFunction as q, getNestedValue as G, isDeepEqual as W, debounce as pt } from "./utility.js";
import { pushFunc as K, updateFn as B, cutFunc as J, ValidationWrapper as Vt, FormControlComponent as Nt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as o, formRefStore as dt } from "./store.js";
import { useCogsConfig as $t } from "./CogsStateClient.jsx";
import rt from "./node_modules/uuid/dist/esm-browser/v4.js";
function ut(t, i) {
  const f = o.getState().getInitialOptions, S = o.getState().setInitialStateOptions, u = f(t) || {};
  S(t, {
    ...u,
    ...i
  });
}
function ft({
  stateKey: t,
  options: i,
  initialOptionsPart: f
}) {
  const S = ot(t) || {}, u = f[t] || {}, _ = o.getState().setInitialStateOptions, E = { ...u, ...S };
  let y = !1;
  if (i)
    for (const g in i)
      E.hasOwnProperty(g) ? g == "localStorage" && i[g] && E[g].key !== i[g]?.key && (y = !0, E[g] = i[g]) : (y = !0, E[g] = i[g]);
  y && _(t, E);
}
function qt(t, { formElements: i, validation: f }) {
  return { initialState: t, formElements: i, validation: f };
}
const zt = (t, i) => {
  let f = t;
  const [S, u] = wt(f);
  (i?.formElements || i?.validation) && Object.keys(u).forEach((y) => {
    u[y] = u[y] || {}, u[y].formElements = {
      ...i.formElements,
      // Global defaults first
      ...i?.validation,
      ...u[y].formElements || {}
      // State-specific overrides
    };
  }), o.getState().setInitialStates(S);
  const _ = (y, g) => {
    const [w] = et(g?.componentId ?? rt());
    ft({
      stateKey: y,
      options: g,
      initialOptionsPart: u
    });
    const c = o.getState().cogsStateStore[y] || S[y], e = g?.modifyState ? g.modifyState(c) : c, [I, $] = jt(
      e,
      {
        stateKey: y,
        syncUpdate: g?.syncUpdate,
        componentId: w,
        localStorage: g?.localStorage,
        middleware: g?.middleware,
        enabledSync: g?.enabledSync,
        reactiveType: g?.reactiveType,
        reactiveDeps: g?.reactiveDeps,
        initialState: g?.initialState,
        dependencies: g?.dependencies
      }
    );
    return $;
  };
  function E(y, g) {
    ft({ stateKey: y, options: g, initialOptionsPart: u });
  }
  return { useCogsState: _, setCogsOptions: E };
}, {
  setUpdaterState: Q,
  setState: R,
  getInitialOptions: ot,
  getKeyState: gt,
  getValidationErrors: ht,
  setStateLog: At,
  updateInitialStateGlobal: at,
  addValidationError: Ct,
  removeValidationError: U,
  setServerSyncActions: Tt
} = o.getState(), St = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, kt = (t, i, f, S) => {
  f.log && console.log(
    "saving to localstorage",
    i,
    f.localStorage?.key,
    S
  );
  const u = q(f.localStorage?.key) ? f.localStorage?.key(t) : f.localStorage?.key;
  if (u && S) {
    const _ = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: o.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: o.getState().serverState[i]
    }, E = `${S}-${i}-${u}`;
    window.localStorage.setItem(E, JSON.stringify(_));
  }
}, Ft = (t, i, f, S, u, _) => {
  const E = {
    initialState: i,
    updaterState: X(
      t,
      S,
      u,
      _
    ),
    state: f
  };
  H(() => {
    at(t, E.initialState), Q(t, E.updaterState), R(t, E.state);
  });
}, mt = (t) => {
  const i = o.getState().stateComponents.get(t);
  if (!i) return;
  const f = /* @__PURE__ */ new Set();
  i.components.forEach((S) => {
    f.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    H(() => {
      f.forEach((S) => S());
    });
  });
}, Bt = (t, i) => {
  const f = o.getState().stateComponents.get(t);
  if (f) {
    const S = `${t}////${i}`, u = f.components.get(S);
    u && u.forceUpdate();
  }
};
function jt(t, {
  stateKey: i,
  serverSync: f,
  localStorage: S,
  formElements: u,
  middleware: _,
  reactiveDeps: E,
  reactiveType: y,
  componentId: g,
  initialState: w,
  syncUpdate: c,
  dependencies: e
} = {}) {
  const [I, $] = et({}), { sessionId: T } = $t();
  let P = !i;
  const [d] = et(i ?? rt()), O = o.getState().stateLog[d], s = Z(/* @__PURE__ */ new Set()), b = Z(g ?? rt()), h = Z(null);
  h.current = ot(d), nt(() => {
    if (c && c.stateKey === d && c.path?.[0]) {
      R(d, (a) => ({
        ...a,
        [c.path[0]]: c.newValue
      }));
      const r = `${c.stateKey}:${c.path.join(".")}`;
      o.getState().setSyncInfo(r, {
        timeStamp: c.timeStamp,
        userId: c.userId
      });
    }
  }, [c]), nt(() => {
    ut(d, {
      initialState: w
    });
    const r = h.current;
    let a = null;
    r.log && console.log("newoptions", r);
    const l = q(r.localStorage?.key) ? r.localStorage?.key(w) : r.localStorage?.key;
    l && T && (a = St(
      T + "-" + d + "-" + l
    ));
    let m = null;
    w && (m = w, a && a.lastUpdated > (a.lastSyncedWithServer || 0) && (m = a.state), Ft(
      d,
      w,
      m,
      D,
      b.current,
      T
    ), mt(d), $({}));
  }, [w, ...e || []]), It(() => {
    P && ut(d, {
      serverSync: f,
      formElements: u,
      initialState: w,
      localStorage: S,
      middleware: _
    });
    const r = `${d}////${b.current}`, a = o.getState().stateComponents.get(d) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(r, {
      forceUpdate: () => $({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0,
      reactiveType: y ?? ["component", "deps"]
    }), o.getState().stateComponents.set(d, a), $({}), () => {
      const l = `${d}////${b.current}`;
      a && (a.components.delete(l), a.components.size === 0 && o.getState().stateComponents.delete(d));
    };
  }, []);
  const D = (r, a, l, m) => {
    if (Array.isArray(a)) {
      const p = `${d}-${a.join(".")}`;
      s.current.add(p);
    }
    R(d, (p) => {
      const A = q(r) ? r(p) : r, F = `${d}-${a.join(".")}`;
      if (F) {
        let x = !1, v = o.getState().signalDomElements.get(F);
        if ((!v || v.size === 0) && (l.updateType === "insert" || l.updateType === "cut")) {
          const N = a.slice(0, -1), C = G(A, N);
          if (Array.isArray(C)) {
            x = !0;
            const V = `${d}-${N.join(".")}`;
            v = o.getState().signalDomElements.get(V);
          }
        }
        if (v) {
          const N = x ? G(A, a.slice(0, -1)) : G(A, a);
          v.forEach(({ parentId: C, position: V, effect: L }) => {
            const j = document.querySelector(
              `[data-parent-id="${C}"]`
            );
            if (j) {
              const ct = Array.from(j.childNodes);
              if (ct[V]) {
                const vt = L ? new Function("state", `return (${L})(state)`)(N) : N;
                ct[V].textContent = String(vt);
              }
            }
          });
        }
      }
      l.updateType === "update" && (m || h.current?.validationKey) && a && U(
        (m || h.current?.validationKey) + "." + a.join(".")
      );
      const k = a.slice(0, a.length - 1);
      l.updateType === "cut" && h.current?.validationKey && U(
        h.current?.validationKey + "." + k.join(".")
      ), l.updateType === "insert" && h.current?.validationKey && ht(
        h.current?.validationKey + "." + k.join(".")
      ).filter(([v, N]) => {
        let C = v?.split(".").length;
        if (v == k.join(".") && C == k.length - 1) {
          let V = v + "." + k;
          U(v), Ct(V, N);
        }
      });
      const M = G(p, a), z = G(A, a), yt = l.updateType === "update" ? a.join(".") : [...a].slice(0, -1).join("."), it = o.getState().stateComponents.get(d);
      if (it)
        for (const [x, v] of it.components.entries()) {
          let N = !1;
          const C = Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"];
          if (!C.includes("none")) {
            if (C.includes("all")) {
              v.forceUpdate();
              continue;
            }
            if (C.includes("component") && v.paths && (v.paths.has(yt) || v.paths.has("")) && (N = !0), !N && C.includes("deps") && v.depsFunction) {
              const V = v.depsFunction(A);
              typeof V == "boolean" ? V && (N = !0) : W(v.deps, V) || (v.deps = V, N = !0);
            }
            N && v.forceUpdate();
          }
        }
      const st = {
        timeStamp: Date.now(),
        stateKey: d,
        path: a,
        updateType: l.updateType,
        status: "new",
        oldValue: M,
        newValue: z
      };
      if (At(d, (x) => {
        const N = [...x ?? [], st].reduce((C, V) => {
          const L = `${V.stateKey}:${JSON.stringify(V.path)}`, j = C.get(L);
          return j ? (j.timeStamp = Math.max(j.timeStamp, V.timeStamp), j.newValue = V.newValue, j.oldValue = j.oldValue ?? V.oldValue, j.updateType = V.updateType) : C.set(L, { ...V }), C;
        }, /* @__PURE__ */ new Map());
        return Array.from(N.values());
      }), kt(
        A,
        d,
        h.current,
        T
      ), _ && _({
        updateLog: O,
        update: st
      }), h.current?.serverSync) {
        const x = o.getState().serverState[d], v = h.current?.serverSync;
        Tt(d, {
          syncKey: typeof v.syncKey == "string" ? v.syncKey : v.syncKey({ state: A }),
          rollBackState: x,
          actionTimeStamp: Date.now() + (v.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return A;
    });
  };
  o.getState().updaterState[d] || (Q(
    d,
    X(
      d,
      D,
      b.current,
      T
    )
  ), o.getState().cogsStateStore[d] || R(d, t), o.getState().initialStateGlobal[d] || at(d, t));
  const n = Et(() => X(
    d,
    D,
    b.current,
    T
  ), [d]);
  return [gt(d), n];
}
function X(t, i, f, S) {
  const u = /* @__PURE__ */ new Map();
  let _ = 0;
  const E = (c) => {
    const e = c.join(".");
    for (const [I] of u)
      (I === e || I.startsWith(e + ".")) && u.delete(I);
    _++;
  }, y = /* @__PURE__ */ new Map(), g = {
    removeValidation: (c) => {
      c?.validationKey && U(c.validationKey);
    },
    revertToInitialState: (c) => {
      const e = o.getState().getInitialOptions(t)?.validation;
      e?.key && U(e?.key), c?.validationKey && U(c.validationKey);
      const I = o.getState().initialStateGlobal[t];
      u.clear(), _++;
      const $ = w(I, []);
      return H(() => {
        Q(t, $), R(t, I);
        const T = o.getState().stateComponents.get(t);
        T && T.components.forEach((O) => {
          O.forceUpdate();
        });
        const P = ot(t), d = q(P?.localStorage?.key) ? P?.localStorage?.key(I) : P?.localStorage?.key;
        d && localStorage.removeItem(d);
      }), I;
    },
    updateInitialState: (c) => {
      u.clear(), _++;
      const e = X(
        t,
        i,
        f,
        S
      );
      return H(() => {
        at(t, c), Q(t, e), R(t, c);
        const I = o.getState().stateComponents.get(t);
        I && I.components.forEach(($) => {
          $.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (I) => e.get()[I]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const c = o.getState().serverState[t];
      return !!(c && W(c, gt(t)));
    }
  };
  function w(c, e = [], I) {
    const $ = e.map(String).join(".");
    u.get($);
    const T = function() {
      return o().getNestedState(t, e);
    };
    Object.keys(g).forEach((O) => {
      T[O] = g[O];
    });
    const P = {
      apply(O, s, b) {
        return o().getNestedState(t, e);
      },
      get(O, s) {
        if (s !== "then" && !s.startsWith("$") && s !== "stateMapNoRender") {
          const n = e.join("."), r = `${t}////${f}`, a = o.getState().stateComponents.get(t);
          if (a) {
            const l = a.components.get(r);
            l && (e.length > 0 || s === "get") && l.paths.add(n);
          }
        }
        if (s === "showValidationErrors")
          return () => {
            const n = o.getState().getInitialOptions(t)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(n.key + "." + e.join("."));
          };
        if (Array.isArray(c)) {
          if (s === "getSelected")
            return () => {
              const n = y.get(e.join("."));
              if (n !== void 0)
                return w(
                  c[n],
                  [...e, n.toString()],
                  I
                );
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const r = I?.filtered?.some(
                (l) => l.join(".") === e.join(".")
              ), a = r ? c : o.getState().getNestedState(t, e);
              return s !== "stateMapNoRender" && (u.clear(), _++), a.map((l, m) => {
                const p = r && l.__origIndex ? l.__origIndex : m, A = w(
                  l,
                  [...e, p.toString()],
                  I
                );
                return n(
                  l,
                  A,
                  m,
                  c,
                  w(c, e, I)
                );
              });
            };
          if (s === "$stateMap")
            return (n) => Y(bt, {
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
              const a = I?.filtered?.some(
                (m) => m.join(".") === e.join(".")
              ) ? c : o.getState().getNestedState(t, e);
              u.clear(), _++;
              const l = a.flatMap(
                (m, p) => m[n] ?? []
              );
              return w(
                l,
                [...e, "[*]", n],
                I
              );
            };
          if (s === "findWith")
            return (n, r) => {
              const a = c.findIndex(
                (p) => p[n] === r
              );
              if (a === -1) return;
              const l = c[a], m = [...e, a.toString()];
              return u.clear(), _++, u.clear(), _++, w(l, m);
            };
          if (s === "index")
            return (n) => {
              const r = c[n];
              return w(r, [...e, n.toString()]);
            };
          if (s === "insert")
            return (n) => (E(e), K(i, n, e, t), w(
              o.getState().cogsStateStore[t],
              []
            ));
          if (s === "uniqueInsert")
            return (n, r, a) => {
              const l = o.getState().getNestedState(t, e), m = q(n) ? n(l) : n;
              let p = null;
              if (!l.some((F) => {
                if (r) {
                  const M = r.every(
                    (z) => W(F[z], m[z])
                  );
                  return M && (p = F), M;
                }
                const k = W(F, m);
                return k && (p = F), k;
              }))
                E(e), K(i, m, e, t);
              else if (a && p) {
                const F = a(p), k = l.map(
                  (M) => W(M, p) ? F : M
                );
                E(e), B(i, k, e);
              }
            };
          if (s === "cut")
            return (n, r) => {
              r?.waitForSync || (E(e), J(i, e, t, n));
            };
          if (s === "cutByValue")
            return (n) => {
              for (let r = 0; r < c.length; r++)
                c[r] === n && J(i, e, t, r);
            };
          if (s === "toggleByValue")
            return (n) => {
              const r = c.findIndex((a) => a === n);
              r > -1 ? J(i, e, t, r) : K(i, n, e, t);
            };
          if (s === "stateFilter")
            return (n) => {
              const r = c.map((m, p) => ({
                ...m,
                __origIndex: p.toString()
              })), a = [], l = [];
              for (let m = 0; m < r.length; m++)
                n(r[m], m) && (a.push(m), l.push(r[m]));
              return u.clear(), _++, w(l, e, {
                filtered: [...I?.filtered || [], e],
                validIndices: a
                // Always pass validIndices, even if empty
              });
            };
        }
        const b = e[e.length - 1];
        if (!isNaN(Number(b))) {
          const n = e.slice(0, -1), r = o.getState().getNestedState(t, n);
          if (Array.isArray(r) && s === "cut")
            return () => J(
              i,
              n,
              t,
              Number(b)
            );
        }
        if (s === "get")
          return () => o.getState().getNestedState(t, e);
        if (s === "$derive")
          return (n) => tt({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (s === "$derive")
          return (n) => tt({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (s === "$get")
          return () => tt({
            _stateKey: t,
            _path: e
          });
        if (s === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return o.getState().getSyncInfo(n);
        }
        if (s === "_selected") {
          const n = e.slice(0, -1), r = n.join("."), a = o.getState().getNestedState(t, n);
          return Array.isArray(a) ? Number(e[e.length - 1]) === y.get(r) : void 0;
        }
        if (s == "getLocalStorage")
          return (n) => St(S + "-" + t + "-" + n);
        if (s === "setSelected")
          return (n) => {
            const r = e.slice(0, -1), a = Number(e[e.length - 1]), l = r.join(".");
            n ? y.set(l, a) : y.delete(l);
            const m = o.getState().getNestedState(t, [...r]);
            B(i, m, r), E(r);
          };
        if (e.length == 0) {
          if (s === "validateZodSchema")
            return () => {
              const n = o.getState().getInitialOptions(t)?.validation, r = o.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              U(n.key);
              const a = o.getState().cogsStateStore[t];
              try {
                const l = o.getState().getValidationErrors(n.key);
                l && l.length > 0 && l.forEach(([p]) => {
                  p && p.startsWith(n.key) && U(p);
                });
                const m = n.zodSchema.safeParse(a);
                return m.success ? !0 : (m.error.errors.forEach((A) => {
                  const F = A.path, k = A.message, M = [n.key, ...F].join(".");
                  r(M, k);
                }), mt(t), !1);
              } catch (l) {
                return console.error("Zod schema validation failed", l), !1;
              }
            };
          if (s === "_componentId") return f;
          if (s === "getComponents")
            return () => o().stateComponents.get(t);
          if (s === "getAllFormRefs")
            return () => dt.getState().getFormRefsByStateKey(t);
          if (s === "_initialState")
            return o.getState().initialStateGlobal[t];
          if (s === "_serverState")
            return o.getState().serverState[t];
          if (s === "_isLoading")
            return o.getState().isLoadingGlobal[t];
          if (s === "revertToInitialState")
            return g.revertToInitialState;
          if (s === "updateInitialState") return g.updateInitialState;
          if (s === "removeValidation") return g.removeValidation;
        }
        if (s === "getFormRef")
          return () => dt.getState().getFormRef(t + "." + e.join("."));
        if (s === "validationWrapper")
          return ({
            children: n,
            hideMessage: r
          }) => /* @__PURE__ */ lt(
            Vt,
            {
              formOpts: r ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: I?.validIndices,
              children: n
            }
          );
        if (s === "_stateKey") return t;
        if (s === "_path") return e;
        if (s === "_isServerSynced") return g._isServerSynced;
        if (s === "update")
          return (n, r) => {
            if (r?.debounce)
              pt(() => {
                B(i, n, e, "");
                const a = o.getState().getNestedState(t, e);
                r?.afterUpdate && r.afterUpdate(a);
              }, r.debounce);
            else {
              B(i, n, e, "");
              const a = o.getState().getNestedState(t, e);
              r?.afterUpdate && r.afterUpdate(a);
            }
            E(e);
          };
        if (s === "formElement")
          return (n, r) => /* @__PURE__ */ lt(
            Nt,
            {
              setState: i,
              stateKey: t,
              path: e,
              child: n,
              formOpts: r
            }
          );
        const h = [...e, s], D = o.getState().getNestedState(t, h);
        return w(D, h, I);
      }
    }, d = new Proxy(T, P);
    return u.set($, {
      proxy: d,
      stateVersion: _
    }), d;
  }
  return w(
    o.getState().getNestedState(t, [])
  );
}
function tt(t) {
  return Y(Mt, { proxy: t });
}
function bt({
  proxy: t,
  rebuildStateShape: i
}) {
  const f = o().getNestedState(t._stateKey, t._path);
  return Array.isArray(f) ? i(
    f,
    t._path
  ).stateMapNoRender(
    (u, _, E, y, g) => t._mapFn(u, _, E, y, g)
  ) : null;
}
function Mt({
  proxy: t
}) {
  const i = Z(null), f = `${t._stateKey}-${t._path.join(".")}`;
  return nt(() => {
    const S = i.current;
    if (!S || !S.parentElement) return;
    const u = S.parentElement, E = Array.from(u.childNodes).indexOf(S);
    let y = u.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", y));
    const w = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: E,
      effect: t._effect
    };
    o.getState().addSignalElement(f, w);
    const c = o.getState().getNestedState(t._stateKey, t._path);
    let e;
    if (t._effect)
      try {
        e = new Function(
          "state",
          `return (${t._effect})(state)`
        )(c);
      } catch ($) {
        console.error("Error evaluating effect function during mount:", $), e = c;
      }
    else
      e = c;
    e !== null && typeof e == "object" && (e = JSON.stringify(e));
    const I = document.createTextNode(String(e));
    S.replaceWith(I);
  }, [t._stateKey, t._path.join("."), t._effect]), Y("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": f
  });
}
function Jt(t) {
  const i = _t(
    (f) => {
      const S = o.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return S.components.set(t._stateKey, {
        forceUpdate: f,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => S.components.delete(t._stateKey);
    },
    () => o.getState().getNestedState(t._stateKey, t._path)
  );
  return Y("text", {}, String(i));
}
export {
  tt as $cogsSignal,
  Jt as $cogsSignalStore,
  qt as addStateOptions,
  zt as createCogsState,
  Bt as notifyComponent,
  jt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
