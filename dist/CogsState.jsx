"use client";
import { jsx as st } from "react/jsx-runtime";
import { useState as tt, useRef as Z, useEffect as et, useLayoutEffect as vt, useMemo as It, createElement as X, useSyncExternalStore as _t, startTransition as Et } from "react";
import { transformStateFunc as wt, isFunction as L, getNestedValue as U, isDeepEqual as M, debounce as $t } from "./utility.js";
import { pushFunc as Q, updateFn as B, cutFunc as J, ValidationWrapper as Nt, FormControlComponent as Vt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as ct } from "./store.js";
import { useCogsConfig as At } from "./CogsStateClient.jsx";
import nt from "./node_modules/uuid/dist/esm-browser/v4.js";
function lt(t, i) {
  const m = r.getState().getInitialOptions, y = r.getState().setInitialStateOptions, g = m(t) || {};
  y(t, {
    ...g,
    ...i
  });
}
function dt({
  stateKey: t,
  options: i,
  initialOptionsPart: m
}) {
  const y = q(t) || {}, g = m[t] || {}, w = r.getState().setInitialStateOptions, E = { ...g, ...y };
  let v = !1;
  if (i)
    for (const l in i)
      E.hasOwnProperty(l) ? l == "localStorage" && i[l] && E[l].key !== i[l]?.key && (v = !0, E[l] = i[l]) : (v = !0, E[l] = i[l]);
  v && w(t, E);
}
function qt(t, { formElements: i, validation: m }) {
  return { initialState: t, formElements: i, validation: m };
}
const zt = (t, i) => {
  let m = t;
  const [y, g] = wt(m);
  (Object.keys(g).length > 0 || i && Object.keys(i).length > 0) && Object.keys(g).forEach((v) => {
    g[v] = g[v] || {}, g[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...g[v].formElements || {}
      // State-specific overrides
    }, q(v) || r.getState().setInitialStateOptions(v, g[v]);
  }), r.getState().setInitialStates(y);
  const w = (v, l) => {
    const [f] = tt(l?.componentId ?? nt());
    dt({
      stateKey: v,
      options: l,
      initialOptionsPart: g
    });
    const e = r.getState().cogsStateStore[v] || y[v], S = l?.modifyState ? l.modifyState(e) : e, [p, A] = Ot(
      S,
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
    return A;
  };
  function E(v, l) {
    dt({ stateKey: v, options: l, initialOptionsPart: g });
  }
  return { useCogsState: w, setCogsOptions: E };
}, {
  setUpdaterState: H,
  setState: D,
  getInitialOptions: q,
  getKeyState: gt,
  getValidationErrors: ht,
  setStateLog: Ct,
  updateInitialStateGlobal: rt,
  addValidationError: kt,
  removeValidationError: P,
  setServerSyncActions: xt
} = r.getState(), ut = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, pt = (t, i, m, y) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    y
  );
  const g = L(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (g && y) {
    const w = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, E = `${y}-${i}-${g}`;
    window.localStorage.setItem(E, JSON.stringify(w));
  }
}, Tt = (t, i, m, y, g, w) => {
  const E = {
    initialState: i,
    updaterState: Y(
      t,
      y,
      g,
      w
    ),
    state: m
  };
  rt(t, E.initialState), H(t, E.updaterState), D(t, E.state);
}, ft = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i.components.forEach((y) => {
    m.add(() => y.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((y) => y());
  });
}, Bt = (t, i) => {
  const m = r.getState().stateComponents.get(t);
  if (m) {
    const y = `${t}////${i}`, g = m.components.get(y);
    g && g.forceUpdate();
  }
};
function Ot(t, {
  stateKey: i,
  serverSync: m,
  localStorage: y,
  formElements: g,
  middleware: w,
  reactiveDeps: E,
  reactiveType: v,
  componentId: l,
  initialState: f,
  syncUpdate: e,
  dependencies: S
} = {}) {
  const [p, A] = tt({}), { sessionId: T } = At();
  let R = !i;
  const [u] = tt(i ?? nt()), s = r.getState().stateLog[u], G = Z(/* @__PURE__ */ new Set()), b = Z(l ?? nt()), C = Z(null);
  C.current = q(u), et(() => {
    if (e && e.stateKey === u && e.path?.[0]) {
      D(u, (o) => ({
        ...o,
        [e.path[0]]: e.newValue
      }));
      const c = `${e.stateKey}:${e.path.join(".")}`;
      r.getState().setSyncInfo(c, {
        timeStamp: e.timeStamp,
        userId: e.userId
      });
    }
  }, [e]), et(() => {
    lt(u, {
      initialState: f
    });
    const c = C.current;
    let o = null;
    const d = L(c?.localStorage?.key) ? c?.localStorage?.key(f) : c?.localStorage?.key;
    console.log("newoptions", c), console.log("localkey", d), console.log("initialState", f), d && T && (o = ut(
      T + "-" + u + "-" + d
    ));
    let I = null, k = !1;
    o && o.lastUpdated > (o.lastSyncedWithServer || 0) && (I = o.state, k = !0), f && (I = f), I && (console.log("newState thius is newstate", I), Tt(
      u,
      f,
      I,
      n,
      b.current,
      T
    ), k && c?.localStorage?.onChange && c?.localStorage?.onChange(I), ft(u), A({}));
  }, [f, ...S || []]), vt(() => {
    R && lt(u, {
      serverSync: m,
      formElements: g,
      initialState: f,
      localStorage: y,
      middleware: w
    });
    const c = `${u}////${b.current}`, o = r.getState().stateComponents.get(u) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(c, {
      forceUpdate: () => A({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0,
      reactiveType: v ?? ["component", "deps"]
    }), r.getState().stateComponents.set(u, o), A({}), () => {
      const d = `${u}////${b.current}`;
      o && (o.components.delete(d), o.components.size === 0 && r.getState().stateComponents.delete(u));
    };
  }, []);
  const n = (c, o, d, I) => {
    if (Array.isArray(o)) {
      const k = `${u}-${o.join(".")}`;
      G.current.add(k);
    }
    D(u, (k) => {
      const N = L(c) ? c(k) : c, j = `${u}-${o.join(".")}`;
      if (j) {
        let F = !1, _ = r.getState().signalDomElements.get(j);
        if ((!_ || _.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const V = o.slice(0, -1), h = U(N, V);
          if (Array.isArray(h)) {
            F = !0;
            const $ = `${u}-${V.join(".")}`;
            _ = r.getState().signalDomElements.get($);
          }
        }
        if (_) {
          const V = F ? U(N, o.slice(0, -1)) : U(N, o);
          _.forEach(({ parentId: h, position: $, effect: W }) => {
            const O = document.querySelector(
              `[data-parent-id="${h}"]`
            );
            if (O) {
              const it = Array.from(O.childNodes);
              if (it[$]) {
                const yt = W ? new Function("state", `return (${W})(state)`)(V) : V;
                it[$].textContent = String(yt);
              }
            }
          });
        }
      }
      d.updateType === "update" && (I || C.current?.validationKey) && o && P(
        (I || C.current?.validationKey) + "." + o.join(".")
      );
      const x = o.slice(0, o.length - 1);
      d.updateType === "cut" && C.current?.validationKey && P(
        C.current?.validationKey + "." + x.join(".")
      ), d.updateType === "insert" && C.current?.validationKey && ht(
        C.current?.validationKey + "." + x.join(".")
      ).filter(([_, V]) => {
        let h = _?.split(".").length;
        if (_ == x.join(".") && h == x.length - 1) {
          let $ = _ + "." + x;
          P(_), kt($, V);
        }
      });
      const z = U(k, o), St = U(N, o), mt = d.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), ot = r.getState().stateComponents.get(u);
      if (ot)
        for (const [F, _] of ot.components.entries()) {
          let V = !1;
          const h = Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"];
          if (!h.includes("none")) {
            if (h.includes("all")) {
              _.forceUpdate();
              continue;
            }
            if (h.includes("component") && _.paths && (_.paths.has(mt) || _.paths.has("")) && (V = !0), !V && h.includes("deps") && _.depsFunction) {
              const $ = _.depsFunction(N);
              typeof $ == "boolean" ? $ && (V = !0) : M(_.deps, $) || (_.deps = $, V = !0);
            }
            V && _.forceUpdate();
          }
        }
      const at = {
        timeStamp: Date.now(),
        stateKey: u,
        path: o,
        updateType: d.updateType,
        status: "new",
        oldValue: z,
        newValue: St
      };
      if (Ct(u, (F) => {
        const V = [...F ?? [], at].reduce((h, $) => {
          const W = `${$.stateKey}:${JSON.stringify($.path)}`, O = h.get(W);
          return O ? (O.timeStamp = Math.max(O.timeStamp, $.timeStamp), O.newValue = $.newValue, O.oldValue = O.oldValue ?? $.oldValue, O.updateType = $.updateType) : h.set(W, { ...$ }), h;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), pt(
        N,
        u,
        C.current,
        T
      ), w && w({
        updateLog: s,
        update: at
      }), C.current?.serverSync) {
        const F = r.getState().serverState[u], _ = C.current?.serverSync;
        xt(u, {
          syncKey: typeof _.syncKey == "string" ? _.syncKey : _.syncKey({ state: N }),
          rollBackState: F,
          actionTimeStamp: Date.now() + (_.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return N;
    });
  };
  r.getState().updaterState[u] || (H(
    u,
    Y(
      u,
      n,
      b.current,
      T
    )
  ), r.getState().cogsStateStore[u] || D(u, t), r.getState().initialStateGlobal[u] || rt(u, t));
  const a = It(() => Y(
    u,
    n,
    b.current,
    T
  ), [u]);
  return [gt(u), a];
}
function Y(t, i, m, y) {
  const g = /* @__PURE__ */ new Map();
  let w = 0;
  const E = (f) => {
    const e = f.join(".");
    for (const [S] of g)
      (S === e || S.startsWith(e + ".")) && g.delete(S);
    w++;
  }, v = {
    removeValidation: (f) => {
      f?.validationKey && P(f.validationKey);
    },
    revertToInitialState: (f) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && P(e?.key), f?.validationKey && P(f.validationKey);
      const S = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), g.clear(), w++;
      const p = l(S, []), A = q(t), T = L(A?.localStorage?.key) ? A?.localStorage?.key(S) : A?.localStorage?.key, R = `${y}-${t}-${T}`;
      R && localStorage.removeItem(R), H(t, p), D(t, S);
      const u = r.getState().stateComponents.get(t);
      return u && u.components.forEach((s) => {
        s.forceUpdate();
      }), S;
    },
    updateInitialState: (f) => {
      g.clear(), w++;
      const e = Y(
        t,
        i,
        m,
        y
      );
      return Et(() => {
        rt(t, f), H(t, e), D(t, f);
        const S = r.getState().stateComponents.get(t);
        S && S.components.forEach((p) => {
          p.forceUpdate();
        });
      }), {
        fetchId: (S) => e.get()[S]
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
  function l(f, e = [], S) {
    const p = e.map(String).join(".");
    g.get(p);
    const A = function() {
      return r().getNestedState(t, e);
    };
    Object.keys(v).forEach((u) => {
      A[u] = v[u];
    });
    const T = {
      apply(u, s, G) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${e.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, e);
      },
      get(u, s) {
        if (s !== "then" && !s.startsWith("$") && s !== "stateMapNoRender") {
          const n = e.join("."), a = `${t}////${m}`, c = r.getState().stateComponents.get(t);
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
            ), a = r.getState().initialStateGlobal[t];
            console.log("initialStateAtPath initialState", a, e);
            const c = U(a, e);
            return console.log("initialStateAtPath", c), console.log("thisReactiveState", n), M(n, c) ? "fresh" : "stale";
          };
        if (s === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[t], a = q(t), c = L(a?.localStorage?.key) ? a?.localStorage?.key(n) : a?.localStorage?.key, o = `${y}-${t}-${c}`;
            console.log("removing storage", o), o && localStorage.removeItem(o);
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
                  S
                );
            };
          if (s === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(t, e.join(".")) ?? -1;
          if (s === "stateSort")
            return (n) => {
              const o = [...r.getState().getNestedState(t, e).map((d, I) => ({
                ...d,
                __origIndex: I.toString()
              }))].sort(n);
              return g.clear(), w++, l(o, e, {
                filtered: [...S?.filtered || [], e],
                validIndices: o.map(
                  (d) => parseInt(d.__origIndex)
                )
              });
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const a = S?.filtered?.some(
                (o) => o.join(".") === e.join(".")
              ), c = a ? f : r.getState().getNestedState(t, e);
              return s !== "stateMapNoRender" && (g.clear(), w++), c.map((o, d) => {
                const I = a && o.__origIndex ? o.__origIndex : d, k = l(
                  o,
                  [...e, I.toString()],
                  S
                );
                return n(
                  o,
                  k,
                  d,
                  f,
                  l(f, e, S)
                );
              });
            };
          if (s === "$stateMap")
            return (n) => X(jt, {
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
              const c = S?.filtered?.some(
                (d) => d.join(".") === e.join(".")
              ) ? f : r.getState().getNestedState(t, e);
              g.clear(), w++;
              const o = c.flatMap(
                (d, I) => d[n] ?? []
              );
              return l(
                o,
                [...e, "[*]", n],
                S
              );
            };
          if (s === "findWith")
            return (n, a) => {
              const c = f.findIndex(
                (I) => I[n] === a
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
            return (n) => (E(e), Q(i, n, e, t), l(
              r.getState().cogsStateStore[t],
              []
            ));
          if (s === "uniqueInsert")
            return (n, a, c) => {
              const o = r.getState().getNestedState(t, e), d = L(n) ? n(o) : n;
              let I = null;
              if (!o.some((N) => {
                if (a) {
                  const x = a.every(
                    (z) => M(N[z], d[z])
                  );
                  return x && (I = N), x;
                }
                const j = M(N, d);
                return j && (I = N), j;
              }))
                E(e), Q(i, d, e, t);
              else if (c && I) {
                const N = c(I), j = o.map(
                  (x) => M(x, I) ? N : x
                );
                E(e), B(i, j, e);
              }
            };
          if (s === "cut")
            return (n, a) => {
              a?.waitForSync || (E(e), J(i, e, t, n));
            };
          if (s === "cutByValue")
            return (n) => {
              for (let a = 0; a < f.length; a++)
                f[a] === n && J(i, e, t, a);
            };
          if (s === "toggleByValue")
            return (n) => {
              const a = f.findIndex((c) => c === n);
              a > -1 ? J(i, e, t, a) : Q(i, n, e, t);
            };
          if (s === "stateFilter")
            return (n) => {
              const a = f.map((d, I) => ({
                ...d,
                __origIndex: I.toString()
              })), c = [], o = [];
              for (let d = 0; d < a.length; d++)
                n(a[d], d) && (c.push(d), o.push(a[d]));
              return g.clear(), w++, l(o, e, {
                filtered: [...S?.filtered || [], e],
                validIndices: c
                // Always pass validIndices, even if empty
              });
            };
        }
        const G = e[e.length - 1];
        if (!isNaN(Number(G))) {
          const n = e.slice(0, -1), a = r.getState().getNestedState(t, n);
          if (Array.isArray(a) && s === "cut")
            return () => J(
              i,
              n,
              t,
              Number(G)
            );
        }
        if (s === "get")
          return () => r.getState().getNestedState(t, e);
        if (s === "$derive")
          return (n) => K({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (s === "$derive")
          return (n) => K({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (s === "$get")
          return () => K({
            _stateKey: t,
            _path: e
          });
        if (s === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (s == "getLocalStorage")
          return (n) => ut(y + "-" + t + "-" + n);
        if (s === "_selected") {
          const n = e.slice(0, -1), a = n.join("."), c = r.getState().getNestedState(t, n);
          return Array.isArray(c) ? Number(e[e.length - 1]) === r.getState().getSelectedIndex(t, a) : void 0;
        }
        if (s === "setSelected")
          return (n) => {
            const a = e.slice(0, -1), c = Number(e[e.length - 1]), o = a.join(".");
            n ? r.getState().setSelectedIndex(t, o, c) : r.getState().setSelectedIndex(t, o, void 0);
            const d = r.getState().getNestedState(t, [...a]);
            B(i, d, a), E(a);
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
              const c = r.getState().cogsStateStore[t];
              try {
                const o = r.getState().getValidationErrors(n.key);
                o && o.length > 0 && o.forEach(([I]) => {
                  I && I.startsWith(n.key) && P(I);
                });
                const d = n.zodSchema.safeParse(c);
                return d.success ? !0 : (d.error.errors.forEach((k) => {
                  const N = k.path, j = k.message, x = [n.key, ...N].join(".");
                  a(x, j);
                }), ft(t), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (s === "_componentId") return m;
          if (s === "getComponents")
            return () => r().stateComponents.get(t);
          if (s === "getAllFormRefs")
            return () => ct.getState().getFormRefsByStateKey(t);
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
          return () => ct.getState().getFormRef(t + "." + e.join("."));
        if (s === "validationWrapper")
          return ({
            children: n,
            hideMessage: a
          }) => /* @__PURE__ */ st(
            Nt,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: S?.validIndices,
              children: n
            }
          );
        if (s === "_stateKey") return t;
        if (s === "_path") return e;
        if (s === "_isServerSynced") return v._isServerSynced;
        if (s === "update")
          return (n, a) => {
            if (a?.debounce)
              $t(() => {
                B(i, n, e, "");
                const c = r.getState().getNestedState(t, e);
                a?.afterUpdate && a.afterUpdate(c);
              }, a.debounce);
            else {
              B(i, n, e, "");
              const c = r.getState().getNestedState(t, e);
              a?.afterUpdate && a.afterUpdate(c);
            }
            E(e);
          };
        if (s === "formElement")
          return (n, a) => /* @__PURE__ */ st(
            Vt,
            {
              setState: i,
              stateKey: t,
              path: e,
              child: n,
              formOpts: a
            }
          );
        const b = [...e, s], C = r.getState().getNestedState(t, b);
        return l(C, b, S);
      }
    }, R = new Proxy(A, T);
    return g.set(p, {
      proxy: R,
      stateVersion: w
    }), R;
  }
  return l(
    r.getState().getNestedState(t, [])
  );
}
function K(t) {
  return X(bt, { proxy: t });
}
function jt({
  proxy: t,
  rebuildStateShape: i
}) {
  const m = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? i(
    m,
    t._path
  ).stateMapNoRender(
    (g, w, E, v, l) => t._mapFn(g, w, E, v, l)
  ) : null;
}
function bt({
  proxy: t
}) {
  const i = Z(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return et(() => {
    const y = i.current;
    if (!y || !y.parentElement) return;
    const g = y.parentElement, E = Array.from(g.childNodes).indexOf(y);
    let v = g.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, g.setAttribute("data-parent-id", v));
    const f = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: E,
      effect: t._effect
    };
    r.getState().addSignalElement(m, f);
    const e = r.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(e);
      } catch (A) {
        console.error("Error evaluating effect function during mount:", A), S = e;
      }
    else
      S = e;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const p = document.createTextNode(String(S));
    y.replaceWith(p);
  }, [t._stateKey, t._path.join("."), t._effect]), X("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function Jt(t) {
  const i = _t(
    (m) => {
      const y = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return y.components.set(t._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => y.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return X("text", {}, String(i));
}
export {
  K as $cogsSignal,
  Jt as $cogsSignalStore,
  qt as addStateOptions,
  zt as createCogsState,
  Bt as notifyComponent,
  Ot as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
