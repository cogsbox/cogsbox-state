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
  const y = q(t) || {}, g = m[t] || {}, E = r.getState().setInitialStateOptions, _ = { ...g, ...y };
  let v = !1;
  if (i)
    for (const c in i)
      _.hasOwnProperty(c) ? (c == "localStorage" && i[c] && _[c].key !== i[c]?.key && (v = !0, _[c] = i[c]), c == "initialState" && i[c] && _[c] !== i[c] && (v = !0, _[c] = i[c])) : (v = !0, _[c] = i[c]);
  v && E(t, _);
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
  }), r.getState().setInitialStates(y), r.getState().setCreatedState(y);
  const E = (v, c) => {
    const [f] = tt(c?.componentId ?? nt());
    dt({
      stateKey: v,
      options: c,
      initialOptionsPart: g
    });
    const e = r.getState().cogsStateStore[v] || y[v], S = c?.modifyState ? c.modifyState(e) : e, [T, C] = jt(
      S,
      {
        stateKey: v,
        syncUpdate: c?.syncUpdate,
        componentId: f,
        localStorage: c?.localStorage,
        middleware: c?.middleware,
        enabledSync: c?.enabledSync,
        reactiveType: c?.reactiveType,
        reactiveDeps: c?.reactiveDeps,
        initialState: c?.initialState,
        dependencies: c?.dependencies
      }
    );
    return C;
  };
  function _(v, c) {
    dt({ stateKey: v, options: c, initialOptionsPart: g });
  }
  return { useCogsState: E, setCogsOptions: _ };
}, {
  setUpdaterState: H,
  setState: D,
  getInitialOptions: q,
  getKeyState: ut,
  getValidationErrors: Ct,
  setStateLog: ht,
  updateInitialStateGlobal: rt,
  addValidationError: kt,
  removeValidationError: P,
  setServerSyncActions: xt
} = r.getState(), gt = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Tt = (t, i, m, y) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    y
  );
  const g = L(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (g && y) {
    const E = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, _ = `${y}-${i}-${g}`;
    window.localStorage.setItem(_, JSON.stringify(E));
  }
}, Ot = (t, i, m, y, g, E) => {
  const _ = {
    initialState: i,
    updaterState: Y(
      t,
      y,
      g,
      E
    ),
    state: m
  };
  rt(t, _.initialState), H(t, _.updaterState), D(t, _.state);
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
function jt(t, {
  stateKey: i,
  serverSync: m,
  localStorage: y,
  formElements: g,
  middleware: E,
  reactiveDeps: _,
  reactiveType: v,
  componentId: c,
  initialState: f,
  syncUpdate: e,
  dependencies: S
} = {}) {
  const [T, C] = tt({}), { sessionId: O } = At();
  let R = !i;
  const [u] = tt(i ?? nt()), s = r.getState().stateLog[u], G = Z(/* @__PURE__ */ new Set()), b = Z(c ?? nt()), k = Z(null);
  k.current = q(u), et(() => {
    if (e && e.stateKey === u && e.path?.[0]) {
      D(u, (o) => ({
        ...o,
        [e.path[0]]: e.newValue
      }));
      const l = `${e.stateKey}:${e.path.join(".")}`;
      r.getState().setSyncInfo(l, {
        timeStamp: e.timeStamp,
        userId: e.userId
      });
    }
  }, [e]), et(() => {
    f && lt(u, {
      initialState: f
    });
    const l = k.current;
    let o = null;
    const d = L(l?.localStorage?.key) ? l?.localStorage?.key(f) : l?.localStorage?.key;
    console.log("newoptions", l), console.log("localkey", d), console.log("initialState", f), d && O && (o = gt(
      O + "-" + u + "-" + d
    ));
    const w = r.getState().iniitialCreatedState[u];
    console.log("createdState - intiual", w, f);
    let V = null;
    f && (V = f, o && o.lastUpdated > (o.lastSyncedWithServer || 0) && (V = o.state, l?.localStorage?.onChange && l?.localStorage?.onChange(V)), console.log("newState thius is newstate", V), Ot(
      u,
      f,
      V,
      n,
      b.current,
      O
    ), ft(u), C({}));
  }, [f, ...S || []]), vt(() => {
    R && lt(u, {
      serverSync: m,
      formElements: g,
      initialState: f,
      localStorage: y,
      middleware: E
    });
    const l = `${u}////${b.current}`, o = r.getState().stateComponents.get(u) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(l, {
      forceUpdate: () => C({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: v ?? ["component", "deps"]
    }), r.getState().stateComponents.set(u, o), C({}), () => {
      const d = `${u}////${b.current}`;
      o && (o.components.delete(d), o.components.size === 0 && r.getState().stateComponents.delete(u));
    };
  }, []);
  const n = (l, o, d, w) => {
    if (Array.isArray(o)) {
      const V = `${u}-${o.join(".")}`;
      G.current.add(V);
    }
    D(u, (V) => {
      const N = L(l) ? l(V) : l, p = `${u}-${o.join(".")}`;
      if (p) {
        let F = !1, I = r.getState().signalDomElements.get(p);
        if ((!I || I.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const A = o.slice(0, -1), h = U(N, A);
          if (Array.isArray(h)) {
            F = !0;
            const $ = `${u}-${A.join(".")}`;
            I = r.getState().signalDomElements.get($);
          }
        }
        if (I) {
          const A = F ? U(N, o.slice(0, -1)) : U(N, o);
          I.forEach(({ parentId: h, position: $, effect: W }) => {
            const j = document.querySelector(
              `[data-parent-id="${h}"]`
            );
            if (j) {
              const it = Array.from(j.childNodes);
              if (it[$]) {
                const yt = W ? new Function("state", `return (${W})(state)`)(A) : A;
                it[$].textContent = String(yt);
              }
            }
          });
        }
      }
      d.updateType === "update" && (w || k.current?.validationKey) && o && P(
        (w || k.current?.validationKey) + "." + o.join(".")
      );
      const x = o.slice(0, o.length - 1);
      d.updateType === "cut" && k.current?.validationKey && P(
        k.current?.validationKey + "." + x.join(".")
      ), d.updateType === "insert" && k.current?.validationKey && Ct(
        k.current?.validationKey + "." + x.join(".")
      ).filter(([I, A]) => {
        let h = I?.split(".").length;
        if (I == x.join(".") && h == x.length - 1) {
          let $ = I + "." + x;
          P(I), kt($, A);
        }
      });
      const z = U(V, o), St = U(N, o), mt = d.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), ot = r.getState().stateComponents.get(u);
      if (ot)
        for (const [F, I] of ot.components.entries()) {
          let A = !1;
          const h = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (!h.includes("none")) {
            if (h.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if (h.includes("component") && I.paths && (I.paths.has(mt) || I.paths.has("")) && (A = !0), !A && h.includes("deps") && I.depsFunction) {
              const $ = I.depsFunction(N);
              typeof $ == "boolean" ? $ && (A = !0) : M(I.deps, $) || (I.deps = $, A = !0);
            }
            A && I.forceUpdate();
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
      if (ht(u, (F) => {
        const A = [...F ?? [], at].reduce((h, $) => {
          const W = `${$.stateKey}:${JSON.stringify($.path)}`, j = h.get(W);
          return j ? (j.timeStamp = Math.max(j.timeStamp, $.timeStamp), j.newValue = $.newValue, j.oldValue = j.oldValue ?? $.oldValue, j.updateType = $.updateType) : h.set(W, { ...$ }), h;
        }, /* @__PURE__ */ new Map());
        return Array.from(A.values());
      }), Tt(
        N,
        u,
        k.current,
        O
      ), E && E({
        updateLog: s,
        update: at
      }), k.current?.serverSync) {
        const F = r.getState().serverState[u], I = k.current?.serverSync;
        xt(u, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: N }),
          rollBackState: F,
          actionTimeStamp: Date.now() + (I.debounce ?? 3e3),
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
      O
    )
  ), r.getState().cogsStateStore[u] || D(u, t), r.getState().initialStateGlobal[u] || rt(u, t));
  const a = It(() => Y(
    u,
    n,
    b.current,
    O
  ), [u]);
  return [ut(u), a];
}
function Y(t, i, m, y) {
  const g = /* @__PURE__ */ new Map();
  let E = 0;
  const _ = (f) => {
    const e = f.join(".");
    for (const [S] of g)
      (S === e || S.startsWith(e + ".")) && g.delete(S);
    E++;
  }, v = {
    removeValidation: (f) => {
      f?.validationKey && P(f.validationKey);
    },
    revertToInitialState: (f) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && P(e?.key), f?.validationKey && P(f.validationKey);
      const S = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), g.clear(), E++;
      const T = c(S, []), C = q(t), O = L(C?.localStorage?.key) ? C?.localStorage?.key(S) : C?.localStorage?.key, R = `${y}-${t}-${O}`;
      R && localStorage.removeItem(R), H(t, T), D(t, S);
      const u = r.getState().stateComponents.get(t);
      return u && u.components.forEach((s) => {
        s.forceUpdate();
      }), S;
    },
    updateInitialState: (f) => {
      g.clear(), E++;
      const e = Y(
        t,
        i,
        m,
        y
      );
      return Et(() => {
        rt(t, f), H(t, e), D(t, f);
        const S = r.getState().stateComponents.get(t);
        S && S.components.forEach((T) => {
          T.forceUpdate();
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
      return !!(f && M(f, ut(t)));
    }
  };
  function c(f, e = [], S) {
    const T = e.map(String).join(".");
    g.get(T);
    const C = function() {
      return r().getNestedState(t, e);
    };
    Object.keys(v).forEach((u) => {
      C[u] = v[u];
    });
    const O = {
      apply(u, s, G) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${e.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, e);
      },
      get(u, s) {
        if (s !== "then" && !s.startsWith("$") && s !== "stateMapNoRender") {
          const n = e.join("."), a = `${t}////${m}`, l = r.getState().stateComponents.get(t);
          if (l) {
            const o = l.components.get(a);
            o && (e.length > 0 || s === "get") && o.paths.add(n);
          }
        }
        if (s === "_status") {
          const n = r.getState().getNestedState(t, e), a = r.getState().initialStateGlobal[t], l = U(a, e);
          return M(n, l) ? "fresh" : "stale";
        }
        if (s === "getStatus")
          return function() {
            const n = r().getNestedState(
              t,
              e
            ), a = r.getState().initialStateGlobal[t], l = U(a, e);
            return M(n, l) ? "fresh" : "stale";
          };
        if (s === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[t], a = q(t), l = L(a?.localStorage?.key) ? a?.localStorage?.key(n) : a?.localStorage?.key, o = `${y}-${t}-${l}`;
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
                return c(
                  f[n],
                  [...e, n.toString()],
                  S
                );
            };
          if (s === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(t, e.join(".")) ?? -1;
          if (s === "stateSort")
            return (n) => {
              const o = [...r.getState().getNestedState(t, e).map((d, w) => ({
                ...d,
                __origIndex: w.toString()
              }))].sort(n);
              return g.clear(), E++, c(o, e, {
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
              ), l = a ? f : r.getState().getNestedState(t, e);
              return s !== "stateMapNoRender" && (g.clear(), E++), l.map((o, d) => {
                const w = a && o.__origIndex ? o.__origIndex : d, V = c(
                  o,
                  [...e, w.toString()],
                  S
                );
                return n(
                  o,
                  V,
                  d,
                  f,
                  c(f, e, S)
                );
              });
            };
          if (s === "$stateMap")
            return (n) => X(pt, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: c
            });
          if (s === "stateFlattenOn")
            return (n) => {
              const l = S?.filtered?.some(
                (d) => d.join(".") === e.join(".")
              ) ? f : r.getState().getNestedState(t, e);
              g.clear(), E++;
              const o = l.flatMap(
                (d, w) => d[n] ?? []
              );
              return c(
                o,
                [...e, "[*]", n],
                S
              );
            };
          if (s === "findWith")
            return (n, a) => {
              const l = f.findIndex(
                (w) => w[n] === a
              );
              if (l === -1) return;
              const o = f[l], d = [...e, l.toString()];
              return g.clear(), E++, g.clear(), E++, c(o, d);
            };
          if (s === "index")
            return (n) => {
              const a = f[n];
              return c(a, [...e, n.toString()]);
            };
          if (s === "insert")
            return (n) => (_(e), Q(i, n, e, t), c(
              r.getState().cogsStateStore[t],
              []
            ));
          if (s === "uniqueInsert")
            return (n, a, l) => {
              const o = r.getState().getNestedState(t, e), d = L(n) ? n(o) : n;
              let w = null;
              if (!o.some((N) => {
                if (a) {
                  const x = a.every(
                    (z) => M(N[z], d[z])
                  );
                  return x && (w = N), x;
                }
                const p = M(N, d);
                return p && (w = N), p;
              }))
                _(e), Q(i, d, e, t);
              else if (l && w) {
                const N = l(w), p = o.map(
                  (x) => M(x, w) ? N : x
                );
                _(e), B(i, p, e);
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
              const a = f.findIndex((l) => l === n);
              a > -1 ? J(i, e, t, a) : Q(i, n, e, t);
            };
          if (s === "stateFilter")
            return (n) => {
              const a = f.map((d, w) => ({
                ...d,
                __origIndex: w.toString()
              })), l = [], o = [];
              for (let d = 0; d < a.length; d++)
                n(a[d], d) && (l.push(d), o.push(a[d]));
              return g.clear(), E++, c(o, e, {
                filtered: [...S?.filtered || [], e],
                validIndices: l
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
          return (n) => gt(y + "-" + t + "-" + n);
        if (s === "_selected") {
          const n = e.slice(0, -1), a = n.join("."), l = r.getState().getNestedState(t, n);
          return Array.isArray(l) ? Number(e[e.length - 1]) === r.getState().getSelectedIndex(t, a) : void 0;
        }
        if (s === "setSelected")
          return (n) => {
            const a = e.slice(0, -1), l = Number(e[e.length - 1]), o = a.join(".");
            n ? r.getState().setSelectedIndex(t, o, l) : r.getState().setSelectedIndex(t, o, void 0);
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
              P(n.key);
              const l = r.getState().cogsStateStore[t];
              try {
                const o = r.getState().getValidationErrors(n.key);
                o && o.length > 0 && o.forEach(([w]) => {
                  w && w.startsWith(n.key) && P(w);
                });
                const d = n.zodSchema.safeParse(l);
                return d.success ? !0 : (d.error.errors.forEach((V) => {
                  const N = V.path, p = V.message, x = [n.key, ...N].join(".");
                  a(x, p);
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
                const l = r.getState().getNestedState(t, e);
                a?.afterUpdate && a.afterUpdate(l);
              }, a.debounce);
            else {
              B(i, n, e, "");
              const l = r.getState().getNestedState(t, e);
              a?.afterUpdate && a.afterUpdate(l);
            }
            _(e);
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
        const b = [...e, s], k = r.getState().getNestedState(t, b);
        return c(k, b, S);
      }
    }, R = new Proxy(C, O);
    return g.set(T, {
      proxy: R,
      stateVersion: E
    }), R;
  }
  return c(
    r.getState().getNestedState(t, [])
  );
}
function K(t) {
  return X(bt, { proxy: t });
}
function pt({
  proxy: t,
  rebuildStateShape: i
}) {
  const m = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? i(
    m,
    t._path
  ).stateMapNoRender(
    (g, E, _, v, c) => t._mapFn(g, E, _, v, c)
  ) : null;
}
function bt({
  proxy: t
}) {
  const i = Z(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return et(() => {
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
    r.getState().addSignalElement(m, f);
    const e = r.getState().getNestedState(t._stateKey, t._path);
    let S;
    if (t._effect)
      try {
        S = new Function(
          "state",
          `return (${t._effect})(state)`
        )(e);
      } catch (C) {
        console.error("Error evaluating effect function during mount:", C), S = e;
      }
    else
      S = e;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const T = document.createTextNode(String(S));
    y.replaceWith(T);
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
  jt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
