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
    const e = r.getState().cogsStateStore[v] || y[v], S = l?.modifyState ? l.modifyState(e) : e, [x, V] = Tt(
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
    return V;
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
  setStateLog: pt,
  updateInitialStateGlobal: rt,
  addValidationError: Ct,
  removeValidationError: R,
  setServerSyncActions: kt
} = r.getState(), ut = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, xt = (t, i, m, y) => {
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
}, Ot = (t, i, m, y, g, w) => {
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
  }), m.forEach((y) => y());
}, Bt = (t, i) => {
  const m = r.getState().stateComponents.get(t);
  if (m) {
    const y = `${t}////${i}`, g = m.components.get(y);
    g && g.forceUpdate();
  }
};
function Tt(t, {
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
  const [x, V] = tt({}), { sessionId: O } = At();
  let b = !i;
  const [u] = tt(i ?? nt()), s = r.getState().stateLog[u], G = Z(/* @__PURE__ */ new Set()), F = Z(l ?? nt()), p = Z(null);
  p.current = q(u), et(() => {
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
    const c = p.current;
    let o = null;
    const d = L(c?.localStorage?.key) ? c?.localStorage?.key(f) : c?.localStorage?.key;
    console.log("newoptions", c), console.log("localkey", d), console.log("initialState", f), d && O && (o = ut(
      O + "-" + u + "-" + d
    ));
    let I = null, C = !1;
    o && o.lastUpdated > (o.lastSyncedWithServer || 0) && (I = o.state, C = !0), f && (I = f), I && (console.log("newState thius is newstate", I), Ot(
      u,
      f,
      I,
      n,
      F.current,
      O
    ), C && c?.localStorage?.onChange && c?.localStorage?.onChange(I), ft(u), V({}));
  }, [f, ...S || []]), vt(() => {
    b && lt(u, {
      serverSync: m,
      formElements: g,
      initialState: f,
      localStorage: y,
      middleware: w
    });
    const c = `${u}////${F.current}`, o = r.getState().stateComponents.get(u) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(c, {
      forceUpdate: () => V({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0,
      reactiveType: v ?? ["component", "deps"]
    }), r.getState().stateComponents.set(u, o), V({}), () => {
      const d = `${u}////${F.current}`;
      o && (o.components.delete(d), o.components.size === 0 && r.getState().stateComponents.delete(u));
    };
  }, []);
  const n = (c, o, d, I) => {
    if (Array.isArray(o)) {
      const C = `${u}-${o.join(".")}`;
      G.current.add(C);
    }
    D(u, (C) => {
      const N = L(c) ? c(C) : c, j = `${u}-${o.join(".")}`;
      if (j) {
        let P = !1, _ = r.getState().signalDomElements.get(j);
        if ((!_ || _.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const A = o.slice(0, -1), h = U(N, A);
          if (Array.isArray(h)) {
            P = !0;
            const $ = `${u}-${A.join(".")}`;
            _ = r.getState().signalDomElements.get($);
          }
        }
        if (_) {
          const A = P ? U(N, o.slice(0, -1)) : U(N, o);
          _.forEach(({ parentId: h, position: $, effect: W }) => {
            const T = document.querySelector(
              `[data-parent-id="${h}"]`
            );
            if (T) {
              const it = Array.from(T.childNodes);
              if (it[$]) {
                const yt = W ? new Function("state", `return (${W})(state)`)(A) : A;
                it[$].textContent = String(yt);
              }
            }
          });
        }
      }
      d.updateType === "update" && (I || p.current?.validationKey) && o && R(
        (I || p.current?.validationKey) + "." + o.join(".")
      );
      const k = o.slice(0, o.length - 1);
      d.updateType === "cut" && p.current?.validationKey && R(
        p.current?.validationKey + "." + k.join(".")
      ), d.updateType === "insert" && p.current?.validationKey && ht(
        p.current?.validationKey + "." + k.join(".")
      ).filter(([_, A]) => {
        let h = _?.split(".").length;
        if (_ == k.join(".") && h == k.length - 1) {
          let $ = _ + "." + k;
          R(_), Ct($, A);
        }
      });
      const z = U(C, o), St = U(N, o), mt = d.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), ot = r.getState().stateComponents.get(u);
      if (ot)
        for (const [P, _] of ot.components.entries()) {
          let A = !1;
          const h = Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"];
          if (!h.includes("none")) {
            if (h.includes("all")) {
              _.forceUpdate();
              continue;
            }
            if (h.includes("component") && _.paths && (_.paths.has(mt) || _.paths.has("")) && (A = !0), !A && h.includes("deps") && _.depsFunction) {
              const $ = _.depsFunction(N);
              typeof $ == "boolean" ? $ && (A = !0) : M(_.deps, $) || (_.deps = $, A = !0);
            }
            A && _.forceUpdate();
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
      if (pt(u, (P) => {
        const A = [...P ?? [], at].reduce((h, $) => {
          const W = `${$.stateKey}:${JSON.stringify($.path)}`, T = h.get(W);
          return T ? (T.timeStamp = Math.max(T.timeStamp, $.timeStamp), T.newValue = $.newValue, T.oldValue = T.oldValue ?? $.oldValue, T.updateType = $.updateType) : h.set(W, { ...$ }), h;
        }, /* @__PURE__ */ new Map());
        return Array.from(A.values());
      }), xt(
        N,
        u,
        p.current,
        O
      ), w && w({
        updateLog: s,
        update: at
      }), p.current?.serverSync) {
        const P = r.getState().serverState[u], _ = p.current?.serverSync;
        kt(u, {
          syncKey: typeof _.syncKey == "string" ? _.syncKey : _.syncKey({ state: N }),
          rollBackState: P,
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
      F.current,
      O
    )
  ), r.getState().cogsStateStore[u] || D(u, t), r.getState().initialStateGlobal[u] || rt(u, t));
  const a = It(() => Y(
    u,
    n,
    F.current,
    O
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
      f?.validationKey && R(f.validationKey);
    },
    revertToInitialState: (f) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && R(e?.key), console.log("revert to initial state"), f?.validationKey && R(f.validationKey);
      const S = r.getState().initialStateGlobal[t];
      console.log("revert initialState", S), g.clear(), w++;
      const x = l(S, []), V = q(t), O = L(V?.localStorage?.key) ? V?.localStorage?.key(S) : V?.localStorage?.key, b = `${y}-${t}-${O}`;
      console.log("revert storageKey", b), console.log("revert initalOptionsGet", V), b && localStorage.removeItem(b), H(t, x), D(t, S);
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
        S && S.components.forEach((x) => {
          x.forceUpdate();
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
    const x = e.map(String).join(".");
    g.get(x);
    const V = function() {
      return r().getNestedState(t, e);
    };
    Object.keys(v).forEach((u) => {
      V[u] = v[u];
    });
    const O = {
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
            ), a = r.getState().initialStateGlobal[t], c = U(a, e);
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
                const I = a && o.__origIndex ? o.__origIndex : d, C = l(
                  o,
                  [...e, I.toString()],
                  S
                );
                return n(
                  o,
                  C,
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
                  const k = a.every(
                    (z) => M(N[z], d[z])
                  );
                  return k && (I = N), k;
                }
                const j = M(N, d);
                return j && (I = N), j;
              }))
                E(e), Q(i, d, e, t);
              else if (c && I) {
                const N = c(I), j = o.map(
                  (k) => M(k, I) ? N : k
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
              R(n.key);
              const c = r.getState().cogsStateStore[t];
              try {
                const o = r.getState().getValidationErrors(n.key);
                o && o.length > 0 && o.forEach(([I]) => {
                  I && I.startsWith(n.key) && R(I);
                });
                const d = n.zodSchema.safeParse(c);
                return d.success ? !0 : (d.error.errors.forEach((C) => {
                  const N = C.path, j = C.message, k = [n.key, ...N].join(".");
                  a(k, j);
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
        const F = [...e, s], p = r.getState().getNestedState(t, F);
        return l(p, F, S);
      }
    }, b = new Proxy(V, O);
    return g.set(x, {
      proxy: b,
      stateVersion: w
    }), b;
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
      } catch (V) {
        console.error("Error evaluating effect function during mount:", V), S = e;
      }
    else
      S = e;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const x = document.createTextNode(String(S));
    y.replaceWith(x);
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
  Tt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
