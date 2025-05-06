"use client";
import { jsx as ue } from "react/jsx-runtime";
import { useState as ae, useRef as Y, useEffect as oe, useLayoutEffect as he, useMemo as we, createElement as K, useSyncExternalStore as Ne, startTransition as $e } from "react";
import { transformStateFunc as Ae, isFunction as q, getDifferences as ge, getNestedValue as W, isDeepEqual as G, debounce as Te } from "./utility.js";
import { pushFunc as ne, updateFn as Z, cutFunc as H, ValidationWrapper as pe, FormControlComponent as ke } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as fe } from "./store.js";
import { useCogsConfig as Ce } from "./CogsStateClient.jsx";
import ie from "./node_modules/uuid/dist/esm-browser/v4.js";
function Se(e, i) {
  const v = r.getState().getInitialOptions, S = r.getState().setInitialStateOptions, d = v(e) || {};
  S(e, {
    ...d,
    ...i
  });
}
function me({
  stateKey: e,
  options: i,
  initialOptionsPart: v
}) {
  const S = J(e) || {}, d = v[e] || {}, E = r.getState().setInitialStateOptions, I = { ...d, ...S };
  let m = !1;
  if (i)
    for (const c in i)
      I.hasOwnProperty(c) ? (c == "localStorage" && i[c] && I[c].key !== i[c]?.key && (m = !0, I[c] = i[c]), c == "initialState" && i[c] && I[c] !== i[c] && (m = !0, I[c] = i[c])) : (m = !0, I[c] = i[c]);
  m && E(e, I);
}
function Ze(e, { formElements: i, validation: v }) {
  return { initialState: e, formElements: i, validation: v };
}
const He = (e, i) => {
  let v = e;
  const [S, d] = Ae(v);
  (Object.keys(d).length > 0 || i && Object.keys(i).length > 0) && Object.keys(d).forEach((m) => {
    d[m] = d[m] || {}, d[m].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...d[m].formElements || {}
      // State-specific overrides
    }, J(m) || r.getState().setInitialStateOptions(m, d[m]);
  }), r.getState().setInitialStates(S), r.getState().setCreatedState(S);
  const E = (m, c) => {
    const [f] = ae(c?.componentId ?? ie());
    me({
      stateKey: m,
      options: c,
      initialOptionsPart: d
    });
    const t = r.getState().cogsStateStore[m] || S[m], y = c?.modifyState ? c.modifyState(t) : t, [x, T] = Fe(
      y,
      {
        stateKey: m,
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
  function I(m, c) {
    me({ stateKey: m, options: c, initialOptionsPart: d }), ce(m);
  }
  return { useCogsState: E, setCogsOptions: I };
}, {
  setUpdaterState: X,
  setState: z,
  getInitialOptions: J,
  getKeyState: ye,
  getValidationErrors: Ve,
  setStateLog: xe,
  updateInitialStateGlobal: se,
  addValidationError: be,
  removeValidationError: D,
  setServerSyncActions: Pe
} = r.getState(), ve = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Oe = (e, i, v, S) => {
  v?.log && console.log(
    "saving to localstorage",
    i,
    v.localStorage?.key,
    S
  );
  const d = q(v?.localStorage?.key) ? v.localStorage?.key(e) : v?.localStorage?.key;
  if (d && S) {
    const E = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, I = `${S}-${i}-${d}`;
    window.localStorage.setItem(I, JSON.stringify(E));
  }
}, je = (e, i, v, S, d, E) => {
  const I = {
    initialState: i,
    updaterState: Q(
      e,
      S,
      d,
      E
    ),
    state: v
  };
  se(e, I.initialState), X(e, I.updaterState), z(e, I.state);
}, ce = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const v = /* @__PURE__ */ new Set();
  i.components.forEach((S) => {
    (S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : null)?.includes("none") || v.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    v.forEach((S) => S());
  });
}, Ye = (e, i) => {
  const v = r.getState().stateComponents.get(e);
  if (v) {
    const S = `${e}////${i}`, d = v.components.get(S);
    if ((d ? Array.isArray(d.reactiveType) ? d.reactiveType : [d.reactiveType || "component"] : null)?.includes("none"))
      return;
    d && d.forceUpdate();
  }
};
function Fe(e, {
  stateKey: i,
  serverSync: v,
  localStorage: S,
  formElements: d,
  middleware: E,
  reactiveDeps: I,
  reactiveType: m,
  componentId: c,
  initialState: f,
  syncUpdate: t,
  dependencies: y
} = {}) {
  const [x, T] = ae({}), { sessionId: b } = Ce();
  let L = !i;
  const [g] = ae(i ?? ie()), s = r.getState().stateLog[g], B = Y(/* @__PURE__ */ new Set()), R = Y(c ?? ie()), k = Y(null);
  k.current = J(g), oe(() => {
    if (t && t.stateKey === g && t.path?.[0]) {
      z(g, (a) => ({
        ...a,
        [t.path[0]]: t.newValue
      }));
      const l = `${t.stateKey}:${t.path.join(".")}`;
      r.getState().setSyncInfo(l, {
        timeStamp: t.timeStamp,
        userId: t.userId
      });
    }
  }, [t]), oe(() => {
    f && Se(g, {
      initialState: f
    });
    const l = k.current;
    let a = null;
    const u = q(l?.localStorage?.key) ? l?.localStorage?.key(f) : l?.localStorage?.key;
    console.log("newoptions", l), console.log("localkey", u), console.log("initialState", f), u && b && (a = ve(
      b + "-" + g + "-" + u
    ));
    const h = r.getState().iniitialCreatedState[g];
    console.log("createdState - intiual", h, f);
    let N = null;
    if (f) {
      N = f, a && a.lastUpdated > (a.lastSyncedWithServer || 0) && (N = a.state, l?.localStorage?.onChange && l?.localStorage?.onChange(N)), console.log("newState thius is newstate", N), je(
        g,
        f,
        N,
        n,
        R.current,
        b
      ), ce(g);
      const w = Array.isArray(m) ? m : [m || "component"];
      console.log("reactiveTypes.............................", w), w.includes("none") || T({});
    }
  }, [f, ...y || []]), he(() => {
    L && Se(g, {
      serverSync: v,
      formElements: d,
      initialState: f,
      localStorage: S,
      middleware: E
    });
    const l = `${g}////${R.current}`, a = r.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(l, {
      forceUpdate: () => T({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: I || void 0,
      reactiveType: m ?? ["component", "deps"]
    }), r.getState().stateComponents.set(g, a), T({}), () => {
      const u = `${g}////${R.current}`;
      a && (a.components.delete(u), a.components.size === 0 && r.getState().stateComponents.delete(g));
    };
  }, []);
  const n = (l, a, u, h) => {
    if (Array.isArray(a)) {
      const N = `${g}-${a.join(".")}`;
      B.current.add(N);
    }
    z(g, (N) => {
      const w = q(l) ? l(N) : l, M = ge(N, w);
      new Set(M);
      const P = `${g}-${a.join(".")}`;
      if (P) {
        let j = !1, $ = r.getState().signalDomElements.get(P);
        if ((!$ || $.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const V = a.slice(0, -1), O = W(w, V);
          if (Array.isArray(O)) {
            j = !0;
            const _ = `${g}-${V.join(".")}`;
            $ = r.getState().signalDomElements.get(_);
          }
        }
        if ($) {
          const V = j ? W(w, a.slice(0, -1)) : W(w, a);
          $.forEach(({ parentId: O, position: _, effect: p }) => {
            const A = document.querySelector(
              `[data-parent-id="${O}"]`
            );
            if (A) {
              const F = Array.from(A.childNodes);
              if (F[_]) {
                const C = p ? new Function("state", `return (${p})(state)`)(V) : V;
                F[_].textContent = String(C);
              }
            }
          });
        }
      }
      u.updateType === "update" && (h || k.current?.validationKey) && a && D(
        (h || k.current?.validationKey) + "." + a.join(".")
      );
      const U = a.slice(0, a.length - 1);
      u.updateType === "cut" && k.current?.validationKey && D(
        k.current?.validationKey + "." + U.join(".")
      ), u.updateType === "insert" && k.current?.validationKey && Ve(
        k.current?.validationKey + "." + U.join(".")
      ).filter(([$, V]) => {
        let O = $?.split(".").length;
        if ($ == U.join(".") && O == U.length - 1) {
          let _ = $ + "." + U;
          D($), be(_, V);
        }
      });
      const Ie = W(N, a), _e = W(w, a), Ee = u.updateType === "update" ? a.join(".") : [...a].slice(0, -1).join("."), ee = r.getState().stateComponents.get(g);
      if (console.log(
        "pathetocaheck.............................",
        a,
        u,
        Ee ?? "NONE",
        ee
      ), ee) {
        const j = ge(N, w), $ = new Set(j), V = u.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          O,
          _
        ] of ee.components.entries()) {
          let p = !1;
          const A = Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"];
          if (!A.includes("none")) {
            if (A.includes("all")) {
              _.forceUpdate();
              continue;
            }
            if (A.includes("component") && ((_.paths.has(V) || _.paths.has("")) && (p = !0), !p))
              for (const F of $) {
                let C = F;
                for (; ; ) {
                  if (_.paths.has(C)) {
                    p = !0;
                    break;
                  }
                  const te = C.lastIndexOf(".");
                  if (te !== -1) {
                    const de = C.substring(
                      0,
                      te
                    );
                    if (!isNaN(
                      Number(C.substring(te + 1))
                    ) && _.paths.has(de)) {
                      p = !0;
                      break;
                    }
                    C = de;
                  } else
                    C = "";
                  if (C === "")
                    break;
                }
                if (p) break;
              }
            if (!p && A.includes("deps") && _.depsFunction) {
              const F = _.depsFunction(w);
              let C = !1;
              typeof F == "boolean" ? F && (C = !0) : G(_.deps, F) || (_.deps = F, C = !0), C && (p = !0);
            }
            p && _.forceUpdate();
          }
        }
      }
      const le = {
        timeStamp: Date.now(),
        stateKey: g,
        path: a,
        updateType: u.updateType,
        status: "new",
        oldValue: Ie,
        newValue: _e
      };
      if (xe(g, (j) => {
        const V = [...j ?? [], le].reduce((O, _) => {
          const p = `${_.stateKey}:${JSON.stringify(_.path)}`, A = O.get(p);
          return A ? (A.timeStamp = Math.max(A.timeStamp, _.timeStamp), A.newValue = _.newValue, A.oldValue = A.oldValue ?? _.oldValue, A.updateType = _.updateType) : O.set(p, { ..._ }), O;
        }, /* @__PURE__ */ new Map());
        return Array.from(V.values());
      }), Oe(
        w,
        g,
        k.current,
        b
      ), E && E({
        updateLog: s,
        update: le
      }), k.current?.serverSync) {
        const j = r.getState().serverState[g], $ = k.current?.serverSync;
        Pe(g, {
          syncKey: typeof $.syncKey == "string" ? $.syncKey : $.syncKey({ state: w }),
          rollBackState: j,
          actionTimeStamp: Date.now() + ($.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return w;
    });
  };
  r.getState().updaterState[g] || (X(
    g,
    Q(
      g,
      n,
      R.current,
      b
    )
  ), r.getState().cogsStateStore[g] || z(g, e), r.getState().initialStateGlobal[g] || se(g, e));
  const o = we(() => Q(
    g,
    n,
    R.current,
    b
  ), [g]);
  return [ye(g), o];
}
function Q(e, i, v, S) {
  const d = /* @__PURE__ */ new Map();
  let E = 0;
  const I = (f) => {
    const t = f.join(".");
    for (const [y] of d)
      (y === t || y.startsWith(t + ".")) && d.delete(y);
    E++;
  }, m = {
    removeValidation: (f) => {
      f?.validationKey && D(f.validationKey);
    },
    revertToInitialState: (f) => {
      const t = r.getState().getInitialOptions(e)?.validation;
      t?.key && D(t?.key), f?.validationKey && D(f.validationKey);
      const y = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), d.clear(), E++;
      const x = c(y, []), T = J(e), b = q(T?.localStorage?.key) ? T?.localStorage?.key(y) : T?.localStorage?.key, L = `${S}-${e}-${b}`;
      L && localStorage.removeItem(L), X(e, x), z(e, y);
      const g = r.getState().stateComponents.get(e);
      return g && g.components.forEach((s) => {
        s.forceUpdate();
      }), y;
    },
    updateInitialState: (f) => {
      d.clear(), E++;
      const t = Q(
        e,
        i,
        v,
        S
      );
      return $e(() => {
        se(e, f), X(e, t), z(e, f);
        const y = r.getState().stateComponents.get(e);
        y && y.components.forEach((x) => {
          x.forceUpdate();
        });
      }), {
        fetchId: (y) => t.get()[y]
      };
    },
    _initialState: r.getState().initialStateGlobal[e],
    _serverState: r.getState().serverState[e],
    _isLoading: r.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const f = r.getState().serverState[e];
      return !!(f && G(f, ye(e)));
    }
  };
  function c(f, t = [], y) {
    const x = t.map(String).join(".");
    d.get(x);
    const T = function() {
      return r().getNestedState(e, t);
    };
    Object.keys(m).forEach((g) => {
      T[g] = m[g];
    });
    const b = {
      apply(g, s, B) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, t);
      },
      get(g, s) {
        if (s !== "then" && !s.startsWith("$") && s !== "stateMapNoRender") {
          const n = t.join("."), o = `${e}////${v}`, l = r.getState().stateComponents.get(e);
          if (l) {
            const a = l.components.get(o);
            a && (t.length > 0 || s === "get") && a.paths.add(n);
          }
        }
        if (s === "_status") {
          const n = r.getState().getNestedState(e, t), o = r.getState().initialStateGlobal[e], l = W(o, t);
          return G(n, l) ? "fresh" : "stale";
        }
        if (s === "getStatus")
          return function() {
            const n = r().getNestedState(
              e,
              t
            ), o = r.getState().initialStateGlobal[e], l = W(o, t);
            return G(n, l) ? "fresh" : "stale";
          };
        if (s === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[e], o = J(e), l = q(o?.localStorage?.key) ? o?.localStorage?.key(n) : o?.localStorage?.key, a = `${S}-${e}-${l}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (s === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(e)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(n.key + "." + t.join("."));
          };
        if (Array.isArray(f)) {
          if (s === "getSelected")
            return () => {
              const n = r.getState().getSelectedIndex(e, t.join("."));
              if (n !== void 0)
                return c(
                  f[n],
                  [...t, n.toString()],
                  y
                );
            };
          if (s === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(e, t.join(".")) ?? -1;
          if (s === "stateSort")
            return (n) => {
              const a = [...r.getState().getNestedState(e, t).map((u, h) => ({
                ...u,
                __origIndex: h.toString()
              }))].sort(n);
              return d.clear(), E++, c(a, t, {
                filtered: [...y?.filtered || [], t],
                validIndices: a.map(
                  (u) => parseInt(u.__origIndex)
                )
              });
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const o = y?.filtered?.some(
                (a) => a.join(".") === t.join(".")
              ), l = o ? f : r.getState().getNestedState(e, t);
              return s !== "stateMapNoRender" && (d.clear(), E++), l.map((a, u) => {
                const h = o && a.__origIndex ? a.__origIndex : u, N = c(
                  a,
                  [...t, h.toString()],
                  y
                );
                return n(
                  a,
                  N,
                  u,
                  f,
                  c(f, t, y)
                );
              });
            };
          if (s === "$stateMap")
            return (n) => K(Re, {
              proxy: {
                _stateKey: e,
                _path: t,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: c
            });
          if (s === "stateFlattenOn")
            return (n) => {
              const l = y?.filtered?.some(
                (u) => u.join(".") === t.join(".")
              ) ? f : r.getState().getNestedState(e, t);
              d.clear(), E++;
              const a = l.flatMap(
                (u, h) => u[n] ?? []
              );
              return c(
                a,
                [...t, "[*]", n],
                y
              );
            };
          if (s === "findWith")
            return (n, o) => {
              const l = f.findIndex(
                (h) => h[n] === o
              );
              if (l === -1) return;
              const a = f[l], u = [...t, l.toString()];
              return d.clear(), E++, d.clear(), E++, c(a, u);
            };
          if (s === "index")
            return (n) => {
              const o = f[n];
              return c(o, [...t, n.toString()]);
            };
          if (s === "insert")
            return (n) => (I(t), ne(i, n, t, e), c(
              r.getState().cogsStateStore[e],
              []
            ));
          if (s === "uniqueInsert")
            return (n, o, l) => {
              const a = r.getState().getNestedState(e, t), u = q(n) ? n(a) : n;
              let h = null;
              if (!a.some((w) => {
                if (o) {
                  const P = o.every(
                    (U) => G(w[U], u[U])
                  );
                  return P && (h = w), P;
                }
                const M = G(w, u);
                return M && (h = w), M;
              }))
                I(t), ne(i, u, t, e);
              else if (l && h) {
                const w = l(h), M = a.map(
                  (P) => G(P, h) ? w : P
                );
                I(t), Z(i, M, t);
              }
            };
          if (s === "cut")
            return (n, o) => {
              o?.waitForSync || (I(t), H(i, t, e, n));
            };
          if (s === "cutByValue")
            return (n) => {
              for (let o = 0; o < f.length; o++)
                f[o] === n && H(i, t, e, o);
            };
          if (s === "toggleByValue")
            return (n) => {
              const o = f.findIndex((l) => l === n);
              o > -1 ? H(i, t, e, o) : ne(i, n, t, e);
            };
          if (s === "stateFilter")
            return (n) => {
              const o = f.map((u, h) => ({
                ...u,
                __origIndex: h.toString()
              })), l = [], a = [];
              for (let u = 0; u < o.length; u++)
                n(o[u], u) && (l.push(u), a.push(o[u]));
              return d.clear(), E++, c(a, t, {
                filtered: [...y?.filtered || [], t],
                validIndices: l
                // Always pass validIndices, even if empty
              });
            };
        }
        const B = t[t.length - 1];
        if (!isNaN(Number(B))) {
          const n = t.slice(0, -1), o = r.getState().getNestedState(e, n);
          if (Array.isArray(o) && s === "cut")
            return () => H(
              i,
              n,
              e,
              Number(B)
            );
        }
        if (s === "get")
          return () => r.getState().getNestedState(e, t);
        if (s === "$derive")
          return (n) => re({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (s === "$derive")
          return (n) => re({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (s === "$get")
          return () => re({
            _stateKey: e,
            _path: t
          });
        if (s === "lastSynced") {
          const n = `${e}:${t.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (s == "getLocalStorage")
          return (n) => ve(S + "-" + e + "-" + n);
        if (s === "_selected") {
          const n = t.slice(0, -1), o = n.join("."), l = r.getState().getNestedState(e, n);
          return Array.isArray(l) ? Number(t[t.length - 1]) === r.getState().getSelectedIndex(e, o) : void 0;
        }
        if (s === "setSelected")
          return (n) => {
            const o = t.slice(0, -1), l = Number(t[t.length - 1]), a = o.join(".");
            n ? r.getState().setSelectedIndex(e, a, l) : r.getState().setSelectedIndex(e, a, void 0);
            const u = r.getState().getNestedState(e, [...o]);
            Z(i, u, o), I(o);
          };
        if (t.length == 0) {
          if (s === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(e)?.validation, o = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              D(n.key);
              const l = r.getState().cogsStateStore[e];
              try {
                const a = r.getState().getValidationErrors(n.key);
                a && a.length > 0 && a.forEach(([h]) => {
                  h && h.startsWith(n.key) && D(h);
                });
                const u = n.zodSchema.safeParse(l);
                return u.success ? !0 : (u.error.errors.forEach((N) => {
                  const w = N.path, M = N.message, P = [n.key, ...w].join(".");
                  o(P, M);
                }), ce(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (s === "_componentId") return v;
          if (s === "getComponents")
            return () => r().stateComponents.get(e);
          if (s === "getAllFormRefs")
            return () => fe.getState().getFormRefsByStateKey(e);
          if (s === "_initialState")
            return r.getState().initialStateGlobal[e];
          if (s === "_serverState")
            return r.getState().serverState[e];
          if (s === "_isLoading")
            return r.getState().isLoadingGlobal[e];
          if (s === "revertToInitialState")
            return m.revertToInitialState;
          if (s === "updateInitialState") return m.updateInitialState;
          if (s === "removeValidation") return m.removeValidation;
        }
        if (s === "getFormRef")
          return () => fe.getState().getFormRef(e + "." + t.join("."));
        if (s === "validationWrapper")
          return ({
            children: n,
            hideMessage: o
          }) => /* @__PURE__ */ ue(
            pe,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: t,
              validationKey: r.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: y?.validIndices,
              children: n
            }
          );
        if (s === "_stateKey") return e;
        if (s === "_path") return t;
        if (s === "_isServerSynced") return m._isServerSynced;
        if (s === "update")
          return (n, o) => {
            if (o?.debounce)
              Te(() => {
                Z(i, n, t, "");
                const l = r.getState().getNestedState(e, t);
                o?.afterUpdate && o.afterUpdate(l);
              }, o.debounce);
            else {
              Z(i, n, t, "");
              const l = r.getState().getNestedState(e, t);
              o?.afterUpdate && o.afterUpdate(l);
            }
            I(t);
          };
        if (s === "formElement")
          return (n, o) => /* @__PURE__ */ ue(
            ke,
            {
              setState: i,
              stateKey: e,
              path: t,
              child: n,
              formOpts: o
            }
          );
        const R = [...t, s], k = r.getState().getNestedState(e, R);
        return c(k, R, y);
      }
    }, L = new Proxy(T, b);
    return d.set(x, {
      proxy: L,
      stateVersion: E
    }), L;
  }
  return c(
    r.getState().getNestedState(e, [])
  );
}
function re(e) {
  return K(Me, { proxy: e });
}
function Re({
  proxy: e,
  rebuildStateShape: i
}) {
  const v = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(v) ? i(
    v,
    e._path
  ).stateMapNoRender(
    (d, E, I, m, c) => e._mapFn(d, E, I, m, c)
  ) : null;
}
function Me({
  proxy: e
}) {
  const i = Y(null), v = `${e._stateKey}-${e._path.join(".")}`;
  return oe(() => {
    const S = i.current;
    if (!S || !S.parentElement) return;
    const d = S.parentElement, I = Array.from(d.childNodes).indexOf(S);
    let m = d.getAttribute("data-parent-id");
    m || (m = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", m));
    const f = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: m,
      position: I,
      effect: e._effect
    };
    r.getState().addSignalElement(v, f);
    const t = r.getState().getNestedState(e._stateKey, e._path);
    let y;
    if (e._effect)
      try {
        y = new Function(
          "state",
          `return (${e._effect})(state)`
        )(t);
      } catch (T) {
        console.error("Error evaluating effect function during mount:", T), y = t;
      }
    else
      y = t;
    y !== null && typeof y == "object" && (y = JSON.stringify(y));
    const x = document.createTextNode(String(y));
    S.replaceWith(x);
  }, [e._stateKey, e._path.join("."), e._effect]), K("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": v
  });
}
function Xe(e) {
  const i = Ne(
    (v) => {
      const S = r.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return S.components.set(e._stateKey, {
        forceUpdate: v,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => S.components.delete(e._stateKey);
    },
    () => r.getState().getNestedState(e._stateKey, e._path)
  );
  return K("text", {}, String(i));
}
export {
  re as $cogsSignal,
  Xe as $cogsSignalStore,
  Ze as addStateOptions,
  He as createCogsState,
  Ye as notifyComponent,
  Fe as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
