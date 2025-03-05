"use client";
import { jsx as at } from "react/jsx-runtime";
import { useState as Y, useRef as z, useEffect as K, useLayoutEffect as vt, useMemo as It, createElement as H, useSyncExternalStore as pt, startTransition as J } from "react";
import { transformStateFunc as _t, isFunction as ut, getNestedValue as D, isDeepEqual as L, debounce as Et } from "./utility.js";
import { pushFunc as it, updateFn as q, cutFunc as st, ValidationWrapper as wt, FormControlComponent as $t } from "./Functions.jsx";
import "zod";
import { getGlobalStore as o, formRefStore as ct } from "./store.js";
import { useCogsConfig as Vt } from "./CogsStateClient.jsx";
import tt from "./node_modules/uuid/dist/esm-browser/v4.js";
function lt(t, i) {
  const f = o.getState().getInitialOptions, S = o.getState().setInitialStateOptions, g = f(t) || {};
  S(t, {
    ...g,
    ...i
  });
}
function dt({
  stateKey: t,
  options: i,
  initialOptionsPart: f
}) {
  const S = et(t) || {}, g = f[t] || {}, I = o.getState().setInitialStateOptions, _ = { ...g, ...S };
  let p = !1;
  if (i)
    for (const m in i)
      _.hasOwnProperty(m) || (p = !0, _[m] = i[m]);
  p && I(t, _);
}
const qt = (t, i) => {
  let f = t;
  const [S, g] = _t(f);
  o.getState().setInitialStates(S);
  const I = (p, m) => {
    const [E] = Y(m?.componentId ?? tt());
    dt({
      stateKey: p,
      options: m,
      initialOptionsPart: g
    });
    const l = o.getState().cogsStateStore[p] || S[p], e = m?.modifyState ? m.modifyState(l) : l, [v, h] = jt(
      e,
      {
        stateKey: p,
        syncUpdate: m?.syncUpdate,
        componentId: E,
        localStorage: m?.localStorage,
        middleware: m?.middleware,
        enabledSync: m?.enabledSync,
        reactiveType: m?.reactiveType,
        reactiveDeps: m?.reactiveDeps,
        initState: m?.initState,
        localStorageKey: m?.localStorageKey
      }
    );
    return h;
  };
  function _(p, m) {
    dt({ stateKey: p, options: m, initialOptionsPart: g });
  }
  return { useCogsState: I, setCogsOptions: _ };
}, {
  setUpdaterState: B,
  setState: x,
  getInitialOptions: et,
  getKeyState: ft,
  getValidationErrors: Nt,
  setStateLog: ht,
  updateInitialStateGlobal: nt,
  addValidationError: Ct,
  removeValidationError: R,
  setServerSyncActions: Tt
} = o.getState(), gt = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, At = (t, i, f, S) => {
  if (f.localStorageKey) {
    const g = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: o.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: o.getState().serverState[i]
    }, I = f.initState ? `${S}-${i}-${f.localStorageKey}` : i;
    window.localStorage.setItem(I, JSON.stringify(g));
  }
}, Ft = (t, i, f, S, g, I) => {
  const _ = {
    initialState: i,
    updaterState: Z(
      t,
      S,
      g,
      I
    ),
    state: f
  };
  J(() => {
    nt(t, _.initialState), B(t, _.updaterState), x(t, _.state);
  });
}, Mt = (t) => {
  const i = o.getState().stateComponents.get(t);
  if (!i) return;
  const f = /* @__PURE__ */ new Set();
  i.components.forEach((S) => {
    f.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    J(() => {
      f.forEach((S) => S());
    });
  });
}, zt = (t, i) => {
  const f = o.getState().stateComponents.get(t);
  if (f) {
    const S = `${t}////${i}`, g = f.components.get(S);
    g && g.forceUpdate();
  }
};
function jt(t, {
  stateKey: i,
  serverSync: f,
  localStorage: S,
  formElements: g,
  middleware: I,
  reactiveDeps: _,
  reactiveType: p,
  componentId: m,
  localStorageKey: E,
  initState: l,
  syncUpdate: e
} = {}) {
  const [v, h] = Y({}), { sessionId: F } = Vt();
  let U = !i;
  const [d] = Y(i ?? tt()), a = o.getState().stateLog[d], G = z(/* @__PURE__ */ new Set()), b = z(m ?? tt()), A = z(null);
  A.current = et(d), K(() => {
    if (e && e.stateKey === d && e.path?.[0]) {
      x(d, (r) => ({
        ...r,
        [e.path[0]]: e.newValue
      }));
      const c = `${e.stateKey}:${e.path.join(".")}`;
      o.getState().setSyncInfo(c, {
        timeStamp: e.timeStamp,
        userId: e.userId
      });
    }
  }, [e]), K(() => {
    lt(d, {
      initState: l
    });
    let c = null;
    E && (c = gt(
      F + "-" + d + "-" + E
    ));
    let r = null;
    l?.initialState && (r = l?.initialState, console.log("newState", r), c && c.lastUpdated > (c.lastSyncedWithServer || 0) && (r = c.state), Ft(
      d,
      l?.initialState,
      r,
      n,
      b.current,
      F
    ), console.log("newState222", r), h({}));
  }, [E, ...l?.dependencies || []]), vt(() => {
    U && lt(d, {
      serverSync: f,
      formElements: g,
      initState: l,
      localStorage: S,
      middleware: I
    });
    const c = `${d}////${b.current}`, r = o.getState().stateComponents.get(d) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(c, {
      forceUpdate: () => h({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), o.getState().stateComponents.set(d, r), h({}), () => {
      const u = `${d}////${b.current}`;
      r && (r.components.delete(u), r.components.size === 0 && o.getState().stateComponents.delete(d));
    };
  }, []);
  const n = (c, r, u, w) => {
    if (Array.isArray(r)) {
      const M = `${d}-${r.join(".")}`;
      G.current.add(M);
    }
    x(d, (M) => {
      const V = ut(c) ? c(M) : c, j = `${d}-${r.join(".")}`;
      if (j) {
        let P = !1, y = o.getState().signalDomElements.get(j);
        if ((!y || y.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const N = r.slice(0, -1), T = D(V, N);
          if (Array.isArray(T)) {
            P = !0;
            const $ = `${d}-${N.join(".")}`;
            y = o.getState().signalDomElements.get($);
          }
        }
        if (y) {
          const N = P ? D(V, r.slice(0, -1)) : D(V, r);
          y.forEach(({ parentId: T, position: $, effect: k }) => {
            const O = document.querySelector(
              `[data-parent-id="${T}"]`
            );
            if (O) {
              const ot = Array.from(O.childNodes);
              if (ot[$]) {
                const yt = k ? new Function("state", `return (${k})(state)`)(N) : N;
                ot[$].textContent = String(yt);
              }
            }
          });
        }
      }
      u.updateType === "update" && (w || A.current?.validationKey) && r && R(
        (w || A.current?.validationKey) + "." + r.join(".")
      );
      const C = r.slice(0, r.length - 1);
      u.updateType === "cut" && A.current?.validationKey && R(
        A.current?.validationKey + "." + C.join(".")
      ), u.updateType === "insert" && A.current?.validationKey && Nt(
        A.current?.validationKey + "." + C.join(".")
      ).filter(([y, N]) => {
        let T = y?.split(".").length;
        if (y == C.join(".") && T == C.length - 1) {
          let $ = y + "." + C;
          R(y), Ct($, N);
        }
      });
      const W = D(M, r), St = D(V, r), mt = u.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), Q = o.getState().stateComponents.get(d);
      if (i == "cart" && (console.log("thisKey", d), console.log("stateEntry", Q)), Q)
        for (const [P, y] of Q.components.entries()) {
          let N = !1;
          const T = Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"];
          if (!T.includes("none")) {
            if (T.includes("all")) {
              y.forceUpdate();
              continue;
            }
            if (T.includes("component") && y.paths && (y.paths.has(mt) || y.paths.has("")) && (N = !0), !N && T.includes("deps") && y.depsFunction) {
              const $ = y.depsFunction(V);
              typeof $ == "boolean" ? $ && (N = !0) : L(y.deps, $) || (y.deps = $, N = !0);
            }
            N && y.forceUpdate();
          }
        }
      const rt = {
        timeStamp: Date.now(),
        stateKey: d,
        path: r,
        updateType: u.updateType,
        status: "new",
        oldValue: W,
        newValue: St
      };
      if (ht(d, (P) => {
        const N = [...P ?? [], rt].reduce((T, $) => {
          const k = `${$.stateKey}:${JSON.stringify($.path)}`, O = T.get(k);
          return O ? (O.timeStamp = Math.max(O.timeStamp, $.timeStamp), O.newValue = $.newValue, O.oldValue = O.oldValue ?? $.oldValue, O.updateType = $.updateType) : T.set(k, { ...$ }), T;
        }, /* @__PURE__ */ new Map());
        return Array.from(N.values());
      }), At(
        V,
        d,
        A.current,
        F
      ), I && I({
        updateLog: a,
        update: rt
      }), A.current?.serverSync) {
        const P = o.getState().serverState[d], y = A.current?.serverSync;
        Tt(d, {
          syncKey: typeof y.syncKey == "string" ? y.syncKey : y.syncKey({ state: V }),
          rollBackState: P,
          actionTimeStamp: Date.now() + (y.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return V;
    });
  };
  o.getState().updaterState[d] || (console.log("Initializing state for", d, t), B(
    d,
    Z(
      d,
      n,
      b.current,
      F
    )
  ), o.getState().cogsStateStore[d] || x(d, t), o.getState().initialStateGlobal[d] || nt(d, t));
  const s = It(() => Z(
    d,
    n,
    b.current,
    F
  ), [d]);
  return [ft(d), s];
}
function Z(t, i, f, S) {
  const g = /* @__PURE__ */ new Map();
  let I = 0;
  const _ = (l) => {
    const e = l.join(".");
    for (const [v] of g)
      (v === e || v.startsWith(e + ".")) && g.delete(v);
    I++;
  }, p = /* @__PURE__ */ new Map(), m = {
    removeValidation: (l) => {
      l?.validationKey && R(l.validationKey);
    },
    revertToInitialState: (l) => {
      const e = o.getState().getInitialOptions(t)?.validation;
      e?.key && R(e?.key), l?.validationKey && R(l.validationKey);
      const v = o.getState().initialStateGlobal[t];
      g.clear(), I++;
      const h = E(v, []);
      J(() => {
        B(t, h), x(t, v);
        const F = o.getState().stateComponents.get(t);
        F && F.components.forEach((d) => {
          d.forceUpdate();
        });
        const U = et(t);
        U?.localStorageKey && localStorage.removeItem(
          U?.initState ? S + "-" + t + "-" + U?.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (l) => {
      g.clear(), I++;
      const e = Z(
        t,
        i,
        f,
        S
      );
      return J(() => {
        nt(t, l), B(t, e), x(t, l);
        const v = o.getState().stateComponents.get(t);
        v && v.components.forEach((h) => {
          h.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (v) => e.get()[v]
      };
    },
    _initialState: o.getState().initialStateGlobal[t],
    _serverState: o.getState().serverState[t],
    _isLoading: o.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const l = o.getState().serverState[t];
      return !!(l && L(l, ft(t)));
    }
  };
  function E(l, e = [], v) {
    const h = e.map(String).join(".");
    g.get(h);
    const F = {
      get(d, a) {
        if (a !== "then" && !a.startsWith("$") && a !== "stateMapNoRender") {
          const n = e.join("."), s = `${t}////${f}`, c = o.getState().stateComponents.get(t);
          if (c) {
            const r = c.components.get(s);
            r && (e.length > 0 || a === "get") && r.paths.add(n);
          }
        }
        if (a === "showValidationErrors")
          return () => {
            const n = o.getState().getInitialOptions(t)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return o.getState().getValidationErrors(n.key + "." + e.join("."));
          };
        if (Array.isArray(l)) {
          if (a === "getSelected")
            return () => {
              const n = p.get(e.join("."));
              if (n !== void 0)
                return E(
                  l[n],
                  [...e, n.toString()],
                  v
                );
            };
          if (a === "stateMap" || a === "stateMapNoRender")
            return (n) => {
              const s = v?.filtered?.some(
                (r) => r.join(".") === e.join(".")
              ), c = s ? l : o.getState().getNestedState(t, e);
              return a !== "stateMapNoRender" && (g.clear(), I++), c.map((r, u) => {
                const w = s && r.__origIndex ? r.__origIndex : u, M = E(
                  r,
                  [...e, w.toString()],
                  v
                );
                return n(
                  r,
                  M,
                  u,
                  l,
                  E(l, e, v)
                );
              });
            };
          if (a === "$stateMap")
            return (n) => H(Ot, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: E
            });
          if (a === "stateFlattenOn")
            return (n) => {
              const c = v?.filtered?.some(
                (u) => u.join(".") === e.join(".")
              ) ? l : o.getState().getNestedState(t, e);
              g.clear(), I++;
              const r = c.flatMap(
                (u, w) => u[n] ?? []
              );
              return E(
                r,
                [...e, "[*]", n],
                v
              );
            };
          if (a === "findWith")
            return (n, s) => {
              const c = l.findIndex(
                (w) => w[n] === s
              );
              if (c === -1) return;
              const r = l[c], u = [...e, c.toString()];
              return g.clear(), I++, g.clear(), I++, E(r, u);
            };
          if (a === "index")
            return (n) => {
              const s = l[n];
              return E(s, [...e, n.toString()]);
            };
          if (a === "insert")
            return (n) => (_(e), it(i, n, e, t), E(
              o.getState().cogsStateStore[t],
              []
            ));
          if (a === "uniqueInsert")
            return (n, s, c) => {
              const r = o.getState().getNestedState(t, e), u = ut(n) ? n(r) : n;
              let w = null;
              if (!r.some((V) => {
                if (s) {
                  const C = s.every(
                    (W) => L(V[W], u[W])
                  );
                  return C && (w = V), C;
                }
                const j = L(V, u);
                return j && (w = V), j;
              }))
                _(e), it(i, u, e, t);
              else if (c && w) {
                const V = c(w), j = r.map(
                  (C) => L(C, w) ? V : C
                );
                _(e), q(i, j, e);
              }
            };
          if (a === "cut")
            return (n, s) => {
              s?.waitForSync || (_(e), st(i, e, t, n));
            };
          if (a === "stateFilter")
            return (n) => {
              const s = l.map((u, w) => ({
                ...u,
                __origIndex: w.toString()
              })), c = [], r = [];
              for (let u = 0; u < s.length; u++)
                n(s[u], u) && (c.push(u), r.push(s[u]));
              return g.clear(), I++, E(r, e, {
                filtered: [...v?.filtered || [], e],
                validIndices: c
                // Pass through the meta
              });
            };
        }
        const G = e[e.length - 1];
        if (!isNaN(Number(G))) {
          const n = e.slice(0, -1), s = o.getState().getNestedState(t, n);
          if (Array.isArray(s) && a === "cut")
            return () => st(
              i,
              n,
              t,
              Number(G)
            );
        }
        if (a === "get")
          return () => o.getState().getNestedState(t, e);
        if (a === "$derive")
          return (n) => X({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (a === "$derive")
          return (n) => X({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (a === "$get")
          return () => X({
            _stateKey: t,
            _path: e
          });
        if (a === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return o.getState().getSyncInfo(n);
        }
        if (a === "_selected") {
          const n = e.slice(0, -1), s = n.join("."), c = o.getState().getNestedState(t, n);
          return Array.isArray(c) ? Number(e[e.length - 1]) === p.get(s) : void 0;
        }
        if (a == "getLocalStorage")
          return (n) => gt(S + "-" + t + "-" + n);
        if (a === "setSelected")
          return (n) => {
            const s = e.slice(0, -1), c = Number(e[e.length - 1]), r = s.join(".");
            n ? p.set(r, c) : p.delete(r);
            const u = o.getState().getNestedState(t, [...s]);
            q(i, u, s), _(s);
          };
        if (e.length == 0) {
          if (a === "validateZodSchema")
            return () => {
              const n = o.getState().getInitialOptions(t)?.validation, s = o.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              R(n.key);
              const c = o.getState().cogsStateStore[t];
              try {
                const r = o.getState().getValidationErrors(n.key);
                r && r.length > 0 && r.forEach(([w]) => {
                  w && w.startsWith(n.key) && R(w);
                });
                const u = n.zodSchema.safeParse(c);
                return u.success ? !0 : (u.error.errors.forEach((M) => {
                  const V = M.path, j = M.message, C = [n.key, ...V].join(".");
                  s(C, j), console.log(
                    `Validation error at ${C}: ${j}`
                  );
                }), Mt(t), !1);
              } catch (r) {
                return console.error("Zod schema validation failed", r), !1;
              }
            };
          if (a === "_componentId") return f;
          if (a === "getComponents")
            return () => o().stateComponents.get(t);
          if (a === "getAllFormRefs")
            return () => ct.getState().getFormRefsByStateKey(t);
          if (a === "_initialState")
            return o.getState().initialStateGlobal[t];
          if (a === "_serverState")
            return o.getState().serverState[t];
          if (a === "_isLoading")
            return o.getState().isLoadingGlobal[t];
          if (a === "revertToInitialState")
            return m.revertToInitialState;
          if (a === "updateInitialState") return m.updateInitialState;
          if (a === "removeValidation") return m.removeValidation;
        }
        if (a === "getFormRef")
          return () => ct.getState().getFormRef(t + "." + e.join("."));
        if (a === "validationWrapper")
          return ({
            children: n,
            hideMessage: s
          }) => /* @__PURE__ */ at(
            wt,
            {
              formOpts: s ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: o.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: v?.validIndices,
              children: n
            }
          );
        if (a === "_stateKey") return t;
        if (a === "_path") return e;
        if (a === "_isServerSynced") return m._isServerSynced;
        if (a === "update")
          return (n, s) => {
            if (s?.debounce)
              Et(() => {
                q(i, n, e, "");
                const c = o.getState().getNestedState(t, e);
                s?.afterUpdate && s.afterUpdate(c);
              }, s.debounce);
            else {
              q(i, n, e, "");
              const c = o.getState().getNestedState(t, e);
              s?.afterUpdate && s.afterUpdate(c);
            }
            _(e);
          };
        if (a === "formElement")
          return (n, s) => /* @__PURE__ */ at(
            $t,
            {
              setState: i,
              stateKey: t,
              path: e,
              child: n,
              formOpts: s
            }
          );
        const b = [...e, a], A = o.getState().getNestedState(t, b);
        return E(A, b, v);
      }
    }, U = new Proxy(m, F);
    return g.set(h, {
      proxy: U,
      stateVersion: I
    }), U;
  }
  return E(
    o.getState().getNestedState(t, [])
  );
}
function X(t) {
  return H(Ut, { proxy: t });
}
function Ot({
  proxy: t,
  rebuildStateShape: i
}) {
  const f = o().getNestedState(t._stateKey, t._path);
  return console.log("value", f), Array.isArray(f) ? i(
    f,
    t._path
  ).stateMapNoRender(
    (g, I, _, p, m) => t._mapFn(g, I, _, p, m)
  ) : null;
}
function Ut({
  proxy: t
}) {
  const i = z(null), f = `${t._stateKey}-${t._path.join(".")}`;
  return K(() => {
    const S = i.current;
    if (!S || !S.parentElement) return;
    const g = S.parentElement, _ = Array.from(g.childNodes).indexOf(S);
    let p = g.getAttribute("data-parent-id");
    p || (p = `parent-${crypto.randomUUID()}`, g.setAttribute("data-parent-id", p));
    const E = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: p,
      position: _,
      effect: t._effect
    };
    o.getState().addSignalElement(f, E);
    const l = o.getState().getNestedState(t._stateKey, t._path);
    let e;
    if (t._effect)
      try {
        e = new Function(
          "state",
          `return (${t._effect})(state)`
        )(l);
      } catch (h) {
        console.error("Error evaluating effect function during mount:", h), e = l;
      }
    else
      e = l;
    e !== null && typeof e == "object" && (e = JSON.stringify(e));
    const v = document.createTextNode(String(e));
    S.replaceWith(v);
  }, [t._stateKey, t._path.join("."), t._effect]), H("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": f
  });
}
function Jt(t) {
  const i = pt(
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
  return H("text", {}, String(i));
}
export {
  X as $cogsSignal,
  Jt as $cogsSignalStore,
  qt as createCogsState,
  zt as notifyComponent,
  jt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
