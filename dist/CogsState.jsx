"use client";
import { jsx as ct } from "react/jsx-runtime";
import { useState as et, useRef as Z, useEffect as nt, useLayoutEffect as It, useMemo as _t, createElement as Q, useSyncExternalStore as Et, startTransition as H } from "react";
import { transformStateFunc as wt, isFunction as G, getNestedValue as U, isDeepEqual as M, debounce as Nt } from "./utility.js";
import { pushFunc as K, updateFn as B, cutFunc as J, ValidationWrapper as Vt, FormControlComponent as $t } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as lt } from "./store.js";
import { useCogsConfig as At } from "./CogsStateClient.jsx";
import rt from "./node_modules/uuid/dist/esm-browser/v4.js";
function dt(t, i) {
  const S = r.getState().getInitialOptions, y = r.getState().setInitialStateOptions, g = S(t) || {};
  y(t, {
    ...g,
    ...i
  });
}
function ut({
  stateKey: t,
  options: i,
  initialOptionsPart: S
}) {
  const y = q(t) || {}, g = S[t] || {}, w = r.getState().setInitialStateOptions, _ = { ...g, ...y };
  let v = !1;
  if (i)
    for (const l in i)
      _.hasOwnProperty(l) ? l == "localStorage" && i[l] && _[l].key !== i[l]?.key && (v = !0, _[l] = i[l]) : (v = !0, _[l] = i[l]);
  v && w(t, _);
}
function qt(t, { formElements: i, validation: S }) {
  return { initialState: t, formElements: i, validation: S };
}
const zt = (t, i) => {
  let S = t;
  const [y, g] = wt(S);
  (i?.formElements || i?.validation) && Object.keys(g).forEach((v) => {
    g[v] = g[v] || {}, g[v].formElements = {
      ...i.formElements,
      // Global defaults first
      ...i?.validation,
      ...g[v].formElements || {}
      // State-specific overrides
    };
  }), r.getState().setInitialStates(y);
  const w = (v, l) => {
    const [f] = et(l?.componentId ?? rt());
    ut({
      stateKey: v,
      options: l,
      initialOptionsPart: g
    });
    const e = r.getState().cogsStateStore[v] || y[v], m = l?.modifyState ? l.modifyState(e) : e, [h, V] = Ft(
      m,
      {
        stateKey: v,
        syncUpdate: l?.syncUpdate,
        componentId: f,
        localStorage: l?.localStorage,
        middleware: l?.middleware,
        enabledSync: l?.enabledSync,
        reactiveType: l?.reactiveType,
        reactiveDeps: l?.reactiveDeps,
        initialState: l?.initialState,
        dependencies: l?.dependencies
      }
    );
    return V;
  };
  function _(v, l) {
    ut({ stateKey: v, options: l, initialOptionsPart: g });
  }
  return { useCogsState: w, setCogsOptions: _ };
}, {
  setUpdaterState: Y,
  setState: L,
  getInitialOptions: q,
  getKeyState: gt,
  getValidationErrors: kt,
  setStateLog: pt,
  updateInitialStateGlobal: ot,
  addValidationError: Ct,
  removeValidationError: R,
  setServerSyncActions: Tt
} = r.getState(), ft = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, ht = (t, i, S, y) => {
  S.log && console.log(
    "saving to localstorage",
    i,
    S.localStorage?.key,
    y
  );
  const g = G(S.localStorage?.key) ? S.localStorage?.key(t) : S.localStorage?.key;
  if (g && y) {
    const w = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, _ = `${y}-${i}-${g}`;
    window.localStorage.setItem(_, JSON.stringify(w));
  }
}, bt = (t, i, S, y, g, w) => {
  const _ = {
    initialState: i,
    updaterState: X(
      t,
      y,
      g,
      w
    ),
    state: S
  };
  H(() => {
    ot(t, _.initialState), Y(t, _.updaterState), L(t, _.state);
  });
}, St = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const S = /* @__PURE__ */ new Set();
  i.components.forEach((y) => {
    S.add(() => y.forceUpdate());
  }), queueMicrotask(() => {
    H(() => {
      S.forEach((y) => y());
    });
  });
}, Bt = (t, i) => {
  const S = r.getState().stateComponents.get(t);
  if (S) {
    const y = `${t}////${i}`, g = S.components.get(y);
    g && g.forceUpdate();
  }
};
function Ft(t, {
  stateKey: i,
  serverSync: S,
  localStorage: y,
  formElements: g,
  middleware: w,
  reactiveDeps: _,
  reactiveType: v,
  componentId: l,
  initialState: f,
  syncUpdate: e,
  dependencies: m
} = {}) {
  const [h, V] = et({}), { sessionId: A } = At();
  let j = !i;
  const [u] = et(i ?? rt()), s = r.getState().stateLog[u], D = Z(/* @__PURE__ */ new Set()), x = Z(l ?? rt()), C = Z(null);
  C.current = q(u), nt(() => {
    if (e && e.stateKey === u && e.path?.[0]) {
      L(u, (o) => ({
        ...o,
        [e.path[0]]: e.newValue
      }));
      const c = `${e.stateKey}:${e.path.join(".")}`;
      r.getState().setSyncInfo(c, {
        timeStamp: e.timeStamp,
        userId: e.userId
      });
    }
  }, [e]), nt(() => {
    dt(u, {
      initialState: f
    });
    const c = C.current;
    let o = null;
    c.log && console.log("newoptions", c);
    const d = G(c.localStorage?.key) ? c.localStorage?.key(f) : c.localStorage?.key;
    d && A && (o = ft(
      A + "-" + u + "-" + d
    ));
    let E = null;
    f && (E = f, o && o.lastUpdated > (o.lastSyncedWithServer || 0) && (E = o.state), bt(
      u,
      f,
      E,
      n,
      x.current,
      A
    ), St(u), V({}));
  }, [f, ...m || []]), It(() => {
    j && dt(u, {
      serverSync: S,
      formElements: g,
      initialState: f,
      localStorage: y,
      middleware: w
    });
    const c = `${u}////${x.current}`, o = r.getState().stateComponents.get(u) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(c, {
      forceUpdate: () => V({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: v ?? ["component", "deps"]
    }), r.getState().stateComponents.set(u, o), V({}), () => {
      const d = `${u}////${x.current}`;
      o && (o.components.delete(d), o.components.size === 0 && r.getState().stateComponents.delete(u));
    };
  }, []);
  const n = (c, o, d, E) => {
    if (Array.isArray(o)) {
      const b = `${u}-${o.join(".")}`;
      D.current.add(b);
    }
    L(u, (b) => {
      const $ = G(c) ? c(b) : c, O = `${u}-${o.join(".")}`;
      if (O) {
        let P = !1, I = r.getState().signalDomElements.get(O);
        if ((!I || I.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const k = o.slice(0, -1), p = U($, k);
          if (Array.isArray(p)) {
            P = !0;
            const N = `${u}-${k.join(".")}`;
            I = r.getState().signalDomElements.get(N);
          }
        }
        if (I) {
          const k = P ? U($, o.slice(0, -1)) : U($, o);
          I.forEach(({ parentId: p, position: N, effect: W }) => {
            const F = document.querySelector(
              `[data-parent-id="${p}"]`
            );
            if (F) {
              const st = Array.from(F.childNodes);
              if (st[N]) {
                const vt = W ? new Function("state", `return (${W})(state)`)(k) : k;
                st[N].textContent = String(vt);
              }
            }
          });
        }
      }
      d.updateType === "update" && (E || C.current?.validationKey) && o && R(
        (E || C.current?.validationKey) + "." + o.join(".")
      );
      const T = o.slice(0, o.length - 1);
      d.updateType === "cut" && C.current?.validationKey && R(
        C.current?.validationKey + "." + T.join(".")
      ), d.updateType === "insert" && C.current?.validationKey && kt(
        C.current?.validationKey + "." + T.join(".")
      ).filter(([I, k]) => {
        let p = I?.split(".").length;
        if (I == T.join(".") && p == T.length - 1) {
          let N = I + "." + T;
          R(I), Ct(N, k);
        }
      });
      const z = U(b, o), mt = U($, o), yt = d.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), at = r.getState().stateComponents.get(u);
      if (at)
        for (const [P, I] of at.components.entries()) {
          let k = !1;
          const p = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (!p.includes("none")) {
            if (p.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if (p.includes("component") && I.paths && (I.paths.has(yt) || I.paths.has("")) && (k = !0), !k && p.includes("deps") && I.depsFunction) {
              const N = I.depsFunction($);
              typeof N == "boolean" ? N && (k = !0) : M(I.deps, N) || (I.deps = N, k = !0);
            }
            k && I.forceUpdate();
          }
        }
      const it = {
        timeStamp: Date.now(),
        stateKey: u,
        path: o,
        updateType: d.updateType,
        status: "new",
        oldValue: z,
        newValue: mt
      };
      if (pt(u, (P) => {
        const k = [...P ?? [], it].reduce((p, N) => {
          const W = `${N.stateKey}:${JSON.stringify(N.path)}`, F = p.get(W);
          return F ? (F.timeStamp = Math.max(F.timeStamp, N.timeStamp), F.newValue = N.newValue, F.oldValue = F.oldValue ?? N.oldValue, F.updateType = N.updateType) : p.set(W, { ...N }), p;
        }, /* @__PURE__ */ new Map());
        return Array.from(k.values());
      }), ht(
        $,
        u,
        C.current,
        A
      ), w && w({
        updateLog: s,
        update: it
      }), C.current?.serverSync) {
        const P = r.getState().serverState[u], I = C.current?.serverSync;
        Tt(u, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: $ }),
          rollBackState: P,
          actionTimeStamp: Date.now() + (I.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return $;
    });
  };
  r.getState().updaterState[u] || (Y(
    u,
    X(
      u,
      n,
      x.current,
      A
    )
  ), r.getState().cogsStateStore[u] || L(u, t), r.getState().initialStateGlobal[u] || ot(u, t));
  const a = _t(() => X(
    u,
    n,
    x.current,
    A
  ), [u]);
  return [gt(u), a];
}
function X(t, i, S, y) {
  const g = /* @__PURE__ */ new Map();
  let w = 0;
  const _ = (f) => {
    const e = f.join(".");
    for (const [m] of g)
      (m === e || m.startsWith(e + ".")) && g.delete(m);
    w++;
  }, v = {
    removeValidation: (f) => {
      f?.validationKey && R(f.validationKey);
    },
    revertToInitialState: (f) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && R(e?.key), f?.validationKey && R(f.validationKey);
      const m = r.getState().initialStateGlobal[t];
      g.clear(), w++;
      const h = l(m, []), V = q(t), A = G(V?.localStorage?.key) ? V?.localStorage?.key(m) : V?.localStorage?.key;
      return A && localStorage.removeItem(A), H(() => {
        Y(t, h), L(t, m);
        const j = r.getState().stateComponents.get(t);
        j && j.components.forEach((u) => {
          u.forceUpdate();
        });
      }), m;
    },
    updateInitialState: (f) => {
      g.clear(), w++;
      const e = r.getState().initialStateGlobal[t], m = q(t), h = G(m?.localStorage?.key) ? m?.localStorage?.key(e) : m?.localStorage?.key;
      h && localStorage.removeItem(h);
      const V = X(
        t,
        i,
        S,
        y
      );
      return H(() => {
        ot(t, f), Y(t, V), L(t, f);
        const A = r.getState().stateComponents.get(t);
        A && A.components.forEach((j) => {
          j.forceUpdate();
        });
      }), {
        fetchId: (A) => V.get()[A]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const f = r.getState().serverState[t];
      return !!(f && M(f, gt(t)));
    }
  };
  function l(f, e = [], m) {
    const h = e.map(String).join(".");
    g.get(h);
    const V = function() {
      return r().getNestedState(t, e);
    };
    Object.keys(v).forEach((u) => {
      V[u] = v[u];
    });
    const A = {
      apply(u, s, D) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${e.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, e);
      },
      get(u, s) {
        if (s !== "then" && !s.startsWith("$") && s !== "stateMapNoRender") {
          const n = e.join("."), a = `${t}////${S}`, c = r.getState().stateComponents.get(t);
          if (c) {
            const o = c.components.get(a);
            o && (e.length > 0 || s === "get") && o.paths.add(n);
          }
        }
        if (s === "_status") {
          const n = r.getState().getNestedState(t, e), a = r.getState().initialStateGlobal[t], c = U(a, e);
          return M(n, c) ? "fresh" : "stale";
        }
        if (s === "getStatus")
          return function() {
            const n = r().getNestedState(
              t,
              e
            ), a = r.getState().initialStateGlobal[t], c = U(a, e);
            return M(n, c) ? "fresh" : "stale";
          };
        if (s === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[t], a = q(t), c = G(a?.localStorage?.key) ? a?.localStorage?.key(n) : a?.localStorage?.key;
            c && localStorage.removeItem(c);
          };
        if (s === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(t)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(n.key + "." + e.join("."));
          };
        if (Array.isArray(f)) {
          if (s === "getSelected")
            return () => {
              const n = r.getState().getSelectedIndex(t, e.join("."));
              if (n !== void 0)
                return l(
                  f[n],
                  [...e, n.toString()],
                  m
                );
            };
          if (s === "stateSort")
            return (n) => {
              const o = [...r.getState().getNestedState(t, e).map((d, E) => ({
                ...d,
                __origIndex: E.toString()
              }))].sort(n);
              return g.clear(), w++, l(o, e, {
                filtered: [...m?.filtered || [], e],
                validIndices: o.map(
                  (d) => parseInt(d.__origIndex)
                )
              });
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const a = m?.filtered?.some(
                (o) => o.join(".") === e.join(".")
              ), c = a ? f : r.getState().getNestedState(t, e);
              return s !== "stateMapNoRender" && (g.clear(), w++), c.map((o, d) => {
                const E = a && o.__origIndex ? o.__origIndex : d, b = l(
                  o,
                  [...e, E.toString()],
                  m
                );
                return n(
                  o,
                  b,
                  d,
                  f,
                  l(f, e, m)
                );
              });
            };
          if (s === "$stateMap")
            return (n) => Q(jt, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: l
            });
          if (s === "stateFlattenOn")
            return (n) => {
              const c = m?.filtered?.some(
                (d) => d.join(".") === e.join(".")
              ) ? f : r.getState().getNestedState(t, e);
              g.clear(), w++;
              const o = c.flatMap(
                (d, E) => d[n] ?? []
              );
              return l(
                o,
                [...e, "[*]", n],
                m
              );
            };
          if (s === "findWith")
            return (n, a) => {
              const c = f.findIndex(
                (E) => E[n] === a
              );
              if (c === -1) return;
              const o = f[c], d = [...e, c.toString()];
              return g.clear(), w++, g.clear(), w++, l(o, d);
            };
          if (s === "index")
            return (n) => {
              const a = f[n];
              return l(a, [...e, n.toString()]);
            };
          if (s === "insert")
            return (n) => (_(e), K(i, n, e, t), l(
              r.getState().cogsStateStore[t],
              []
            ));
          if (s === "uniqueInsert")
            return (n, a, c) => {
              const o = r.getState().getNestedState(t, e), d = G(n) ? n(o) : n;
              let E = null;
              if (!o.some(($) => {
                if (a) {
                  const T = a.every(
                    (z) => M($[z], d[z])
                  );
                  return T && (E = $), T;
                }
                const O = M($, d);
                return O && (E = $), O;
              }))
                _(e), K(i, d, e, t);
              else if (c && E) {
                const $ = c(E), O = o.map(
                  (T) => M(T, E) ? $ : T
                );
                _(e), B(i, O, e);
              }
            };
          if (s === "cut")
            return (n, a) => {
              a?.waitForSync || (_(e), J(i, e, t, n));
            };
          if (s === "cutByValue")
            return (n) => {
              for (let a = 0; a < f.length; a++)
                f[a] === n && J(i, e, t, a);
            };
          if (s === "toggleByValue")
            return (n) => {
              const a = f.findIndex((c) => c === n);
              a > -1 ? J(i, e, t, a) : K(i, n, e, t);
            };
          if (s === "stateFilter")
            return (n) => {
              const a = f.map((d, E) => ({
                ...d,
                __origIndex: E.toString()
              })), c = [], o = [];
              for (let d = 0; d < a.length; d++)
                n(a[d], d) && (c.push(d), o.push(a[d]));
              return g.clear(), w++, l(o, e, {
                filtered: [...m?.filtered || [], e],
                validIndices: c
                // Always pass validIndices, even if empty
              });
            };
        }
        const D = e[e.length - 1];
        if (!isNaN(Number(D))) {
          const n = e.slice(0, -1), a = r.getState().getNestedState(t, n);
          if (Array.isArray(a) && s === "cut")
            return () => J(
              i,
              n,
              t,
              Number(D)
            );
        }
        if (s === "get")
          return () => r.getState().getNestedState(t, e);
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
          return r.getState().getSyncInfo(n);
        }
        if (s == "getLocalStorage")
          return (n) => ft(y + "-" + t + "-" + n);
        if (s === "_selected") {
          const n = e.slice(0, -1), a = n.join("."), c = r.getState().getNestedState(t, n);
          return Array.isArray(c) ? Number(e[e.length - 1]) === r.getState().getSelectedIndex(t, a) : void 0;
        }
        if (s === "setSelected")
          return (n) => {
            const a = e.slice(0, -1), c = Number(e[e.length - 1]), o = a.join(".");
            n ? r.getState().setSelectedIndex(t, o, c) : r.getState().setSelectedIndex(t, o, void 0);
            const d = r.getState().getNestedState(t, [...a]);
            B(i, d, a), _(a);
          };
        if (e.length == 0) {
          if (s === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(t)?.validation, a = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              R(n.key);
              const c = r.getState().cogsStateStore[t];
              try {
                const o = r.getState().getValidationErrors(n.key);
                o && o.length > 0 && o.forEach(([E]) => {
                  E && E.startsWith(n.key) && R(E);
                });
                const d = n.zodSchema.safeParse(c);
                return d.success ? !0 : (d.error.errors.forEach((b) => {
                  const $ = b.path, O = b.message, T = [n.key, ...$].join(".");
                  a(T, O);
                }), St(t), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (s === "_componentId") return S;
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
            return v.revertToInitialState;
          if (s === "updateInitialState") return v.updateInitialState;
          if (s === "removeValidation") return v.removeValidation;
        }
        if (s === "getFormRef")
          return () => lt.getState().getFormRef(t + "." + e.join("."));
        if (s === "validationWrapper")
          return ({
            children: n,
            hideMessage: a
          }) => /* @__PURE__ */ ct(
            Vt,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: m?.validIndices,
              children: n
            }
          );
        if (s === "_stateKey") return t;
        if (s === "_path") return e;
        if (s === "_isServerSynced") return v._isServerSynced;
        if (s === "update")
          return (n, a) => {
            if (a?.debounce)
              Nt(() => {
                B(i, n, e, "");
                const c = r.getState().getNestedState(t, e);
                a?.afterUpdate && a.afterUpdate(c);
              }, a.debounce);
            else {
              B(i, n, e, "");
              const c = r.getState().getNestedState(t, e);
              a?.afterUpdate && a.afterUpdate(c);
            }
            _(e);
          };
        if (s === "formElement")
          return (n, a) => /* @__PURE__ */ ct(
            $t,
            {
              setState: i,
              stateKey: t,
              path: e,
              child: n,
              formOpts: a
            }
          );
        const x = [...e, s], C = r.getState().getNestedState(t, x);
        return l(C, x, m);
      }
    }, j = new Proxy(V, A);
    return g.set(h, {
      proxy: j,
      stateVersion: w
    }), j;
  }
  return l(
    r.getState().getNestedState(t, [])
  );
}
function tt(t) {
  return Q(Ot, { proxy: t });
}
function jt({
  proxy: t,
  rebuildStateShape: i
}) {
  const S = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(S) ? i(
    S,
    t._path
  ).stateMapNoRender(
    (g, w, _, v, l) => t._mapFn(g, w, _, v, l)
  ) : null;
}
function Ot({
  proxy: t
}) {
  const i = Z(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return nt(() => {
    const y = i.current;
    if (!y || !y.parentElement) return;
    const g = y.parentElement, _ = Array.from(g.childNodes).indexOf(y);
    let v = g.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, g.setAttribute("data-parent-id", v));
    const f = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: _,
      effect: t._effect
    };
    r.getState().addSignalElement(S, f);
    const e = r.getState().getNestedState(t._stateKey, t._path);
    let m;
    if (t._effect)
      try {
        m = new Function(
          "state",
          `return (${t._effect})(state)`
        )(e);
      } catch (V) {
        console.error("Error evaluating effect function during mount:", V), m = e;
      }
    else
      m = e;
    m !== null && typeof m == "object" && (m = JSON.stringify(m));
    const h = document.createTextNode(String(m));
    y.replaceWith(h);
  }, [t._stateKey, t._path.join("."), t._effect]), Q("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function Jt(t) {
  const i = Et(
    (S) => {
      const y = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return y.components.set(t._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => y.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return Q("text", {}, String(i));
}
export {
  tt as $cogsSignal,
  Jt as $cogsSignalStore,
  qt as addStateOptions,
  zt as createCogsState,
  Bt as notifyComponent,
  Ft as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
