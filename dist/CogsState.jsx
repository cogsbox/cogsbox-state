"use client";
import { jsx as ct } from "react/jsx-runtime";
import { useState as tt, useRef as Z, useEffect as et, useLayoutEffect as vt, useMemo as It, createElement as X, useSyncExternalStore as _t, startTransition as Et } from "react";
import { transformStateFunc as wt, isFunction as L, getNestedValue as U, isDeepEqual as M, debounce as $t } from "./utility.js";
import { pushFunc as Q, updateFn as B, cutFunc as J, ValidationWrapper as Nt, FormControlComponent as Vt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as lt } from "./store.js";
import { useCogsConfig as At } from "./CogsStateClient.jsx";
import nt from "./node_modules/uuid/dist/esm-browser/v4.js";
function dt(t, i) {
  const m = r.getState().getInitialOptions, y = r.getState().setInitialStateOptions, d = m(t) || {};
  y(t, {
    ...d,
    ...i
  });
}
function ut({
  stateKey: t,
  options: i,
  initialOptionsPart: m
}) {
  const y = q(t) || {}, d = m[t] || {}, E = r.getState().setInitialStateOptions, _ = { ...d, ...y };
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
  const [y, d] = wt(m);
  (Object.keys(d).length > 0 || i && Object.keys(i).length > 0) && Object.keys(d).forEach((v) => {
    d[v] = d[v] || {}, d[v].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...d[v].formElements || {}
      // State-specific overrides
    }, q(v) || r.getState().setInitialStateOptions(v, d[v]);
  }), r.getState().setInitialStates(y), r.getState().setCreatedState(y);
  const E = (v, c) => {
    const [f] = tt(c?.componentId ?? nt());
    ut({
      stateKey: v,
      options: c,
      initialOptionsPart: d
    });
    const e = r.getState().cogsStateStore[v] || y[v], S = c?.modifyState ? c.modifyState(e) : e, [k, T] = Ot(
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
    return T;
  };
  function _(v, c) {
    ut({ stateKey: v, options: c, initialOptionsPart: d }), ot(v);
  }
  return { useCogsState: E, setCogsOptions: _ };
}, {
  setUpdaterState: H,
  setState: D,
  getInitialOptions: q,
  getKeyState: gt,
  getValidationErrors: Tt,
  setStateLog: pt,
  updateInitialStateGlobal: rt,
  addValidationError: Ct,
  removeValidationError: P,
  setServerSyncActions: ht
} = r.getState(), ft = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, kt = (t, i, m, y) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    y
  );
  const d = L(m?.localStorage?.key) ? m.localStorage?.key(t) : m?.localStorage?.key;
  if (d && y) {
    const E = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, _ = `${y}-${i}-${d}`;
    window.localStorage.setItem(_, JSON.stringify(E));
  }
}, xt = (t, i, m, y, d, E) => {
  const _ = {
    initialState: i,
    updaterState: Y(
      t,
      y,
      d,
      E
    ),
    state: m
  };
  rt(t, _.initialState), H(t, _.updaterState), D(t, _.state);
}, ot = (t) => {
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
    const y = `${t}////${i}`, d = m.components.get(y);
    if ((d ? Array.isArray(d.reactiveType) ? d.reactiveType : [d.reactiveType || "component"] : null)?.includes("none"))
      return;
    d && d.forceUpdate();
  }
};
function Ot(t, {
  stateKey: i,
  serverSync: m,
  localStorage: y,
  formElements: d,
  middleware: E,
  reactiveDeps: _,
  reactiveType: v,
  componentId: c,
  initialState: f,
  syncUpdate: e,
  dependencies: S
} = {}) {
  const [k, T] = tt({}), { sessionId: x } = At();
  let R = !i;
  const [g] = tt(i ?? nt()), s = r.getState().stateLog[g], G = Z(/* @__PURE__ */ new Set()), b = Z(c ?? nt()), C = Z(null);
  C.current = q(g), et(() => {
    if (e && e.stateKey === g && e.path?.[0]) {
      D(g, (o) => ({
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
    f && dt(g, {
      initialState: f
    });
    const l = C.current;
    let o = null;
    const u = L(l?.localStorage?.key) ? l?.localStorage?.key(f) : l?.localStorage?.key;
    console.log("newoptions", l), console.log("localkey", u), console.log("initialState", f), u && x && (o = ft(
      x + "-" + g + "-" + u
    ));
    const w = r.getState().iniitialCreatedState[g];
    console.log("createdState - intiual", w, f);
    let V = null;
    f && (V = f, o && o.lastUpdated > (o.lastSyncedWithServer || 0) && (V = o.state, l?.localStorage?.onChange && l?.localStorage?.onChange(V)), console.log("newState thius is newstate", V), xt(
      g,
      f,
      V,
      n,
      b.current,
      x
    ), ot(g), T({}));
  }, [f, ...S || []]), vt(() => {
    R && dt(g, {
      serverSync: m,
      formElements: d,
      initialState: f,
      localStorage: y,
      middleware: E
    });
    const l = `${g}////${b.current}`, o = r.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(l, {
      forceUpdate: () => T({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: v ?? ["component", "deps"]
    }), r.getState().stateComponents.set(g, o), T({}), () => {
      const u = `${g}////${b.current}`;
      o && (o.components.delete(u), o.components.size === 0 && r.getState().stateComponents.delete(g));
    };
  }, []);
  const n = (l, o, u, w) => {
    if (Array.isArray(o)) {
      const V = `${g}-${o.join(".")}`;
      G.current.add(V);
    }
    D(g, (V) => {
      const N = L(l) ? l(V) : l, j = `${g}-${o.join(".")}`;
      if (j) {
        let F = !1, I = r.getState().signalDomElements.get(j);
        if ((!I || I.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const A = o.slice(0, -1), p = U(N, A);
          if (Array.isArray(p)) {
            F = !0;
            const $ = `${g}-${A.join(".")}`;
            I = r.getState().signalDomElements.get($);
          }
        }
        if (I) {
          const A = F ? U(N, o.slice(0, -1)) : U(N, o);
          I.forEach(({ parentId: p, position: $, effect: W }) => {
            const O = document.querySelector(
              `[data-parent-id="${p}"]`
            );
            if (O) {
              const st = Array.from(O.childNodes);
              if (st[$]) {
                const yt = W ? new Function("state", `return (${W})(state)`)(A) : A;
                st[$].textContent = String(yt);
              }
            }
          });
        }
      }
      u.updateType === "update" && (w || C.current?.validationKey) && o && P(
        (w || C.current?.validationKey) + "." + o.join(".")
      );
      const h = o.slice(0, o.length - 1);
      u.updateType === "cut" && C.current?.validationKey && P(
        C.current?.validationKey + "." + h.join(".")
      ), u.updateType === "insert" && C.current?.validationKey && Tt(
        C.current?.validationKey + "." + h.join(".")
      ).filter(([I, A]) => {
        let p = I?.split(".").length;
        if (I == h.join(".") && p == h.length - 1) {
          let $ = I + "." + h;
          P(I), Ct($, A);
        }
      });
      const z = U(V, o), St = U(N, o), mt = u.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), at = r.getState().stateComponents.get(g);
      if (at)
        for (const [F, I] of at.components.entries()) {
          let A = !1;
          const p = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (!p.includes("none")) {
            if (p.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if (p.includes("component") && I.paths && (I.paths.has(mt) || I.paths.has("")) && (A = !0), !A && p.includes("deps") && I.depsFunction) {
              const $ = I.depsFunction(N);
              typeof $ == "boolean" ? $ && (A = !0) : M(I.deps, $) || (I.deps = $, A = !0);
            }
            A && I.forceUpdate();
          }
        }
      const it = {
        timeStamp: Date.now(),
        stateKey: g,
        path: o,
        updateType: u.updateType,
        status: "new",
        oldValue: z,
        newValue: St
      };
      if (pt(g, (F) => {
        const A = [...F ?? [], it].reduce((p, $) => {
          const W = `${$.stateKey}:${JSON.stringify($.path)}`, O = p.get(W);
          return O ? (O.timeStamp = Math.max(O.timeStamp, $.timeStamp), O.newValue = $.newValue, O.oldValue = O.oldValue ?? $.oldValue, O.updateType = $.updateType) : p.set(W, { ...$ }), p;
        }, /* @__PURE__ */ new Map());
        return Array.from(A.values());
      }), kt(
        N,
        g,
        C.current,
        x
      ), E && E({
        updateLog: s,
        update: it
      }), C.current?.serverSync) {
        const F = r.getState().serverState[g], I = C.current?.serverSync;
        ht(g, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: N }),
          rollBackState: F,
          actionTimeStamp: Date.now() + (I.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return N;
    });
  };
  r.getState().updaterState[g] || (H(
    g,
    Y(
      g,
      n,
      b.current,
      x
    )
  ), r.getState().cogsStateStore[g] || D(g, t), r.getState().initialStateGlobal[g] || rt(g, t));
  const a = It(() => Y(
    g,
    n,
    b.current,
    x
  ), [g]);
  return [gt(g), a];
}
function Y(t, i, m, y) {
  const d = /* @__PURE__ */ new Map();
  let E = 0;
  const _ = (f) => {
    const e = f.join(".");
    for (const [S] of d)
      (S === e || S.startsWith(e + ".")) && d.delete(S);
    E++;
  }, v = {
    removeValidation: (f) => {
      f?.validationKey && P(f.validationKey);
    },
    revertToInitialState: (f) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && P(e?.key), f?.validationKey && P(f.validationKey);
      const S = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), d.clear(), E++;
      const k = c(S, []), T = q(t), x = L(T?.localStorage?.key) ? T?.localStorage?.key(S) : T?.localStorage?.key, R = `${y}-${t}-${x}`;
      R && localStorage.removeItem(R), H(t, k), D(t, S);
      const g = r.getState().stateComponents.get(t);
      return g && g.components.forEach((s) => {
        s.forceUpdate();
      }), S;
    },
    updateInitialState: (f) => {
      d.clear(), E++;
      const e = Y(
        t,
        i,
        m,
        y
      );
      return Et(() => {
        rt(t, f), H(t, e), D(t, f);
        const S = r.getState().stateComponents.get(t);
        S && S.components.forEach((k) => {
          k.forceUpdate();
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
  function c(f, e = [], S) {
    const k = e.map(String).join(".");
    d.get(k);
    const T = function() {
      return r().getNestedState(t, e);
    };
    Object.keys(v).forEach((g) => {
      T[g] = v[g];
    });
    const x = {
      apply(g, s, G) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${e.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, e);
      },
      get(g, s) {
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
              const o = [...r.getState().getNestedState(t, e).map((u, w) => ({
                ...u,
                __origIndex: w.toString()
              }))].sort(n);
              return d.clear(), E++, c(o, e, {
                filtered: [...S?.filtered || [], e],
                validIndices: o.map(
                  (u) => parseInt(u.__origIndex)
                )
              });
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const a = S?.filtered?.some(
                (o) => o.join(".") === e.join(".")
              ), l = a ? f : r.getState().getNestedState(t, e);
              return s !== "stateMapNoRender" && (d.clear(), E++), l.map((o, u) => {
                const w = a && o.__origIndex ? o.__origIndex : u, V = c(
                  o,
                  [...e, w.toString()],
                  S
                );
                return n(
                  o,
                  V,
                  u,
                  f,
                  c(f, e, S)
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
              rebuildStateShape: c
            });
          if (s === "stateFlattenOn")
            return (n) => {
              const l = S?.filtered?.some(
                (u) => u.join(".") === e.join(".")
              ) ? f : r.getState().getNestedState(t, e);
              d.clear(), E++;
              const o = l.flatMap(
                (u, w) => u[n] ?? []
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
              const o = f[l], u = [...e, l.toString()];
              return d.clear(), E++, d.clear(), E++, c(o, u);
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
              const o = r.getState().getNestedState(t, e), u = L(n) ? n(o) : n;
              let w = null;
              if (!o.some((N) => {
                if (a) {
                  const h = a.every(
                    (z) => M(N[z], u[z])
                  );
                  return h && (w = N), h;
                }
                const j = M(N, u);
                return j && (w = N), j;
              }))
                _(e), Q(i, u, e, t);
              else if (l && w) {
                const N = l(w), j = o.map(
                  (h) => M(h, w) ? N : h
                );
                _(e), B(i, j, e);
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
              const a = f.map((u, w) => ({
                ...u,
                __origIndex: w.toString()
              })), l = [], o = [];
              for (let u = 0; u < a.length; u++)
                n(a[u], u) && (l.push(u), o.push(a[u]));
              return d.clear(), E++, c(o, e, {
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
          return (n) => ft(y + "-" + t + "-" + n);
        if (s === "_selected") {
          const n = e.slice(0, -1), a = n.join("."), l = r.getState().getNestedState(t, n);
          return Array.isArray(l) ? Number(e[e.length - 1]) === r.getState().getSelectedIndex(t, a) : void 0;
        }
        if (s === "setSelected")
          return (n) => {
            const a = e.slice(0, -1), l = Number(e[e.length - 1]), o = a.join(".");
            n ? r.getState().setSelectedIndex(t, o, l) : r.getState().setSelectedIndex(t, o, void 0);
            const u = r.getState().getNestedState(t, [...a]);
            B(i, u, a), _(a);
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
                const u = n.zodSchema.safeParse(l);
                return u.success ? !0 : (u.error.errors.forEach((V) => {
                  const N = V.path, j = V.message, h = [n.key, ...N].join(".");
                  a(h, j);
                }), ot(t), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (s === "_componentId") return m;
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
          return (n, a) => /* @__PURE__ */ ct(
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
        return c(C, b, S);
      }
    }, R = new Proxy(T, x);
    return d.set(k, {
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
function jt({
  proxy: t,
  rebuildStateShape: i
}) {
  const m = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(m) ? i(
    m,
    t._path
  ).stateMapNoRender(
    (d, E, _, v, c) => t._mapFn(d, E, _, v, c)
  ) : null;
}
function bt({
  proxy: t
}) {
  const i = Z(null), m = `${t._stateKey}-${t._path.join(".")}`;
  return et(() => {
    const y = i.current;
    if (!y || !y.parentElement) return;
    const d = y.parentElement, _ = Array.from(d.childNodes).indexOf(y);
    let v = d.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", v));
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
      } catch (T) {
        console.error("Error evaluating effect function during mount:", T), S = e;
      }
    else
      S = e;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const k = document.createTextNode(String(S));
    y.replaceWith(k);
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
