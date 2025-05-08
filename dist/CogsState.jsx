"use client";
import { jsx as ue } from "react/jsx-runtime";
import { useState as ae, useRef as Y, useEffect as oe, useLayoutEffect as he, useMemo as we, createElement as K, useSyncExternalStore as Ne, startTransition as $e } from "react";
import { transformStateFunc as Ae, isFunction as q, isDeepEqual as M, getDifferences as ge, getNestedValue as W, debounce as Te } from "./utility.js";
import { pushFunc as ne, updateFn as Z, cutFunc as H, ValidationWrapper as Ve, FormControlComponent as ke } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as fe } from "./store.js";
import { useCogsConfig as Ce } from "./CogsStateClient.jsx";
import ie from "./node_modules/uuid/dist/esm-browser/v4.js";
function Se(e, o) {
  const v = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, d = v(e) || {};
  f(e, {
    ...d,
    ...o
  });
}
function me({
  stateKey: e,
  options: o,
  initialOptionsPart: v
}) {
  const f = J(e) || {}, d = v[e] || {}, h = r.getState().setInitialStateOptions, I = { ...d, ...f };
  let S = !1;
  if (o)
    for (const s in o)
      I.hasOwnProperty(s) ? (s == "localStorage" && o[s] && I[s].key !== o[s]?.key && (S = !0, I[s] = o[s]), s == "initialState" && o[s] && I[s] !== o[s] && M(I[s], o[s]) && (S = !0, I[s] = o[s])) : (S = !0, I[s] = o[s]);
  S && h(e, I);
}
function Ze(e, { formElements: o, validation: v }) {
  return { initialState: e, formElements: o, validation: v };
}
const He = (e, o) => {
  let v = e;
  const [f, d] = Ae(v);
  (Object.keys(d).length > 0 || o && Object.keys(o).length > 0) && Object.keys(d).forEach((S) => {
    d[S] = d[S] || {}, d[S].formElements = {
      ...o?.formElements,
      // Global defaults first
      ...o?.validation,
      ...d[S].formElements || {}
      // State-specific overrides
    }, J(S) || r.getState().setInitialStateOptions(S, d[S]);
  }), r.getState().setInitialStates(f), r.getState().setCreatedState(f);
  const h = (S, s) => {
    const [m] = ae(s?.componentId ?? ie());
    if (s && typeof s.initialState < "u" && q(s.initialState)) {
      const b = r.getState().cogsStateStore[S] || f[S], j = s.initialState(
        b
      );
      s = {
        ...s,
        initialState: j
      };
    }
    me({
      stateKey: S,
      options: s,
      initialOptionsPart: d
    });
    const t = r.getState().cogsStateStore[S] || f[S], y = s?.modifyState ? s.modifyState(t) : t, [p, A] = Fe(
      y,
      {
        stateKey: S,
        syncUpdate: s?.syncUpdate,
        componentId: m,
        localStorage: s?.localStorage,
        middleware: s?.middleware,
        enabledSync: s?.enabledSync,
        reactiveType: s?.reactiveType,
        reactiveDeps: s?.reactiveDeps,
        initialState: s?.initialState,
        dependencies: s?.dependencies
      }
    );
    return A;
  };
  function I(S, s) {
    me({ stateKey: S, options: s, initialOptionsPart: d }), ce(S);
  }
  return { useCogsState: h, setCogsOptions: I };
}, {
  setUpdaterState: X,
  setState: z,
  getInitialOptions: J,
  getKeyState: ye,
  getValidationErrors: be,
  setStateLog: xe,
  updateInitialStateGlobal: se,
  addValidationError: pe,
  removeValidationError: L,
  setServerSyncActions: Pe
} = r.getState(), ve = (e) => {
  if (!e) return null;
  try {
    const o = window.localStorage.getItem(e);
    return o ? JSON.parse(o) : null;
  } catch (o) {
    return console.error("Error loading from localStorage:", o), null;
  }
}, Oe = (e, o, v, f) => {
  v?.log && console.log(
    "saving to localstorage",
    o,
    v.localStorage?.key,
    f
  );
  const d = q(v?.localStorage?.key) ? v.localStorage?.key(e) : v?.localStorage?.key;
  if (d && f) {
    const h = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[o]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[o]
    }, I = `${f}-${o}-${d}`;
    window.localStorage.setItem(I, JSON.stringify(h));
  }
}, je = (e, o, v, f, d, h) => {
  const I = {
    initialState: o,
    updaterState: Q(
      e,
      f,
      d,
      h
    ),
    state: v
  };
  se(e, I.initialState), X(e, I.updaterState), z(e, I.state);
}, ce = (e) => {
  const o = r.getState().stateComponents.get(e);
  if (!o) return;
  const v = /* @__PURE__ */ new Set();
  o.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || v.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    v.forEach((f) => f());
  });
}, Ye = (e, o) => {
  const v = r.getState().stateComponents.get(e);
  if (v) {
    const f = `${e}////${o}`, d = v.components.get(f);
    if ((d ? Array.isArray(d.reactiveType) ? d.reactiveType : [d.reactiveType || "component"] : null)?.includes("none"))
      return;
    d && d.forceUpdate();
  }
};
function Fe(e, {
  stateKey: o,
  serverSync: v,
  localStorage: f,
  formElements: d,
  middleware: h,
  reactiveDeps: I,
  reactiveType: S,
  componentId: s,
  initialState: m,
  syncUpdate: t,
  dependencies: y
} = {}) {
  const [p, A] = ae({}), { sessionId: b } = Ce();
  let j = !o;
  const [g] = ae(o ?? ie()), c = r.getState().stateLog[g], B = Y(/* @__PURE__ */ new Set()), U = Y(s ?? ie()), k = Y(null);
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
    m && Se(g, {
      initialState: m
    });
    const l = k.current;
    let a = null;
    const u = q(l?.localStorage?.key) ? l?.localStorage?.key(m) : l?.localStorage?.key;
    u && b && (a = ve(
      b + "-" + g + "-" + u
    ));
    let _ = null;
    if (m) {
      const T = r.getState().initialStateGlobal[g];
      if (M(T, m))
        return;
      _ = m, a && a.lastUpdated > (a.lastSyncedWithServer || 0) && (_ = a.state, l?.localStorage?.onChange && l?.localStorage?.onChange(_)), console.log("newState thius is newstate", _), je(
        g,
        m,
        _,
        n,
        U.current,
        b
      ), ce(g), (Array.isArray(S) ? S : [S || "component"]).includes("none") || A({});
    }
  }, [m, ...y || []]), he(() => {
    j && Se(g, {
      serverSync: v,
      formElements: d,
      initialState: m,
      localStorage: f,
      middleware: h
    });
    const l = `${g}////${U.current}`, a = r.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(l, {
      forceUpdate: () => A({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: I || void 0,
      reactiveType: S ?? ["component", "deps"]
    }), r.getState().stateComponents.set(g, a), A({}), () => {
      const u = `${g}////${U.current}`;
      a && (a.components.delete(u), a.components.size === 0 && r.getState().stateComponents.delete(g));
    };
  }, []);
  const n = (l, a, u, _) => {
    if (Array.isArray(a)) {
      const T = `${g}-${a.join(".")}`;
      B.current.add(T);
    }
    z(g, (T) => {
      const w = q(l) ? l(T) : l, D = ge(T, w);
      new Set(D);
      const P = `${g}-${a.join(".")}`;
      if (P) {
        let F = !1, N = r.getState().signalDomElements.get(P);
        if ((!N || N.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const x = a.slice(0, -1), O = W(w, x);
          if (Array.isArray(O)) {
            F = !0;
            const E = `${g}-${x.join(".")}`;
            N = r.getState().signalDomElements.get(E);
          }
        }
        if (N) {
          const x = F ? W(w, a.slice(0, -1)) : W(w, a);
          N.forEach(({ parentId: O, position: E, effect: V }) => {
            const $ = document.querySelector(
              `[data-parent-id="${O}"]`
            );
            if ($) {
              const R = Array.from($.childNodes);
              if (R[E]) {
                const C = V ? new Function("state", `return (${V})(state)`)(x) : x;
                R[E].textContent = String(C);
              }
            }
          });
        }
      }
      u.updateType === "update" && (_ || k.current?.validationKey) && a && L(
        (_ || k.current?.validationKey) + "." + a.join(".")
      );
      const G = a.slice(0, a.length - 1);
      u.updateType === "cut" && k.current?.validationKey && L(
        k.current?.validationKey + "." + G.join(".")
      ), u.updateType === "insert" && k.current?.validationKey && be(
        k.current?.validationKey + "." + G.join(".")
      ).filter(([N, x]) => {
        let O = N?.split(".").length;
        if (N == G.join(".") && O == G.length - 1) {
          let E = N + "." + G;
          L(N), pe(E, x);
        }
      });
      const Ie = W(T, a), _e = W(w, a), Ee = u.updateType === "update" ? a.join(".") : [...a].slice(0, -1).join("."), ee = r.getState().stateComponents.get(g);
      if (console.log(
        "pathetocaheck.............................",
        a,
        u,
        Ee ?? "NONE",
        ee
      ), ee) {
        const F = ge(T, w), N = new Set(F), x = u.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          O,
          E
        ] of ee.components.entries()) {
          let V = !1;
          const $ = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (!$.includes("none")) {
            if ($.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if ($.includes("component") && ((E.paths.has(x) || E.paths.has("")) && (V = !0), !V))
              for (const R of N) {
                let C = R;
                for (; ; ) {
                  if (E.paths.has(C)) {
                    V = !0;
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
                    ) && E.paths.has(de)) {
                      V = !0;
                      break;
                    }
                    C = de;
                  } else
                    C = "";
                  if (C === "")
                    break;
                }
                if (V) break;
              }
            if (!V && $.includes("deps") && E.depsFunction) {
              const R = E.depsFunction(w);
              let C = !1;
              typeof R == "boolean" ? R && (C = !0) : M(E.deps, R) || (E.deps = R, C = !0), C && (V = !0);
            }
            V && E.forceUpdate();
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
      if (xe(g, (F) => {
        const x = [...F ?? [], le].reduce((O, E) => {
          const V = `${E.stateKey}:${JSON.stringify(E.path)}`, $ = O.get(V);
          return $ ? ($.timeStamp = Math.max($.timeStamp, E.timeStamp), $.newValue = E.newValue, $.oldValue = $.oldValue ?? E.oldValue, $.updateType = E.updateType) : O.set(V, { ...E }), O;
        }, /* @__PURE__ */ new Map());
        return Array.from(x.values());
      }), Oe(
        w,
        g,
        k.current,
        b
      ), h && h({
        updateLog: c,
        update: le
      }), k.current?.serverSync) {
        const F = r.getState().serverState[g], N = k.current?.serverSync;
        Pe(g, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: w }),
          rollBackState: F,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
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
      U.current,
      b
    )
  ), r.getState().cogsStateStore[g] || z(g, e), r.getState().initialStateGlobal[g] || se(g, e));
  const i = we(() => Q(
    g,
    n,
    U.current,
    b
  ), [g]);
  return [ye(g), i];
}
function Q(e, o, v, f) {
  const d = /* @__PURE__ */ new Map();
  let h = 0;
  const I = (m) => {
    const t = m.join(".");
    for (const [y] of d)
      (y === t || y.startsWith(t + ".")) && d.delete(y);
    h++;
  }, S = {
    removeValidation: (m) => {
      m?.validationKey && L(m.validationKey);
    },
    revertToInitialState: (m) => {
      const t = r.getState().getInitialOptions(e)?.validation;
      t?.key && L(t?.key), m?.validationKey && L(m.validationKey);
      const y = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), d.clear(), h++;
      const p = s(y, []), A = J(e), b = q(A?.localStorage?.key) ? A?.localStorage?.key(y) : A?.localStorage?.key, j = `${f}-${e}-${b}`;
      j && localStorage.removeItem(j), X(e, p), z(e, y);
      const g = r.getState().stateComponents.get(e);
      return g && g.components.forEach((c) => {
        c.forceUpdate();
      }), y;
    },
    updateInitialState: (m) => {
      d.clear(), h++;
      const t = Q(
        e,
        o,
        v,
        f
      );
      return $e(() => {
        se(e, m), X(e, t), z(e, m);
        const y = r.getState().stateComponents.get(e);
        y && y.components.forEach((p) => {
          p.forceUpdate();
        });
      }), {
        fetchId: (y) => t.get()[y]
      };
    },
    _initialState: r.getState().initialStateGlobal[e],
    _serverState: r.getState().serverState[e],
    _isLoading: r.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const m = r.getState().serverState[e];
      return !!(m && M(m, ye(e)));
    }
  };
  function s(m, t = [], y) {
    const p = t.map(String).join(".");
    d.get(p);
    const A = function() {
      return r().getNestedState(e, t);
    };
    Object.keys(S).forEach((g) => {
      A[g] = S[g];
    });
    const b = {
      apply(g, c, B) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, t);
      },
      get(g, c) {
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender") {
          const n = t.join("."), i = `${e}////${v}`, l = r.getState().stateComponents.get(e);
          if (l) {
            const a = l.components.get(i);
            a && (t.length > 0 || c === "get") && a.paths.add(n);
          }
        }
        if (c === "_status") {
          const n = r.getState().getNestedState(e, t), i = r.getState().initialStateGlobal[e], l = W(i, t);
          return M(n, l) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const n = r().getNestedState(
              e,
              t
            ), i = r.getState().initialStateGlobal[e], l = W(i, t);
            return M(n, l) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[e], i = J(e), l = q(i?.localStorage?.key) ? i?.localStorage?.key(n) : i?.localStorage?.key, a = `${f}-${e}-${l}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (c === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(e)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(n.key + "." + t.join("."));
          };
        if (Array.isArray(m)) {
          if (c === "getSelected")
            return () => {
              const n = r.getState().getSelectedIndex(e, t.join("."));
              if (n !== void 0)
                return s(
                  m[n],
                  [...t, n.toString()],
                  y
                );
            };
          if (c === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(e, t.join(".")) ?? -1;
          if (c === "stateSort")
            return (n) => {
              const a = [...r.getState().getNestedState(e, t).map((u, _) => ({
                ...u,
                __origIndex: _.toString()
              }))].sort(n);
              return d.clear(), h++, s(a, t, {
                filtered: [...y?.filtered || [], t],
                validIndices: a.map(
                  (u) => parseInt(u.__origIndex)
                )
              });
            };
          if (c === "stateMap" || c === "stateMapNoRender")
            return (n) => {
              const i = y?.filtered?.some(
                (a) => a.join(".") === t.join(".")
              ), l = i ? m : r.getState().getNestedState(e, t);
              return c !== "stateMapNoRender" && (d.clear(), h++), l.map((a, u) => {
                const _ = i && a.__origIndex ? a.__origIndex : u, T = s(
                  a,
                  [...t, _.toString()],
                  y
                );
                return n(
                  a,
                  T,
                  u,
                  m,
                  s(m, t, y)
                );
              });
            };
          if (c === "$stateMap")
            return (n) => K(Re, {
              proxy: {
                _stateKey: e,
                _path: t,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (c === "stateFlattenOn")
            return (n) => {
              const l = y?.filtered?.some(
                (u) => u.join(".") === t.join(".")
              ) ? m : r.getState().getNestedState(e, t);
              d.clear(), h++;
              const a = l.flatMap(
                (u, _) => u[n] ?? []
              );
              return s(
                a,
                [...t, "[*]", n],
                y
              );
            };
          if (c === "findWith")
            return (n, i) => {
              const l = m.findIndex((_) => _[n] === i);
              if (l === -1) return;
              const a = m[l], u = [...t, l.toString()];
              return d.clear(), h++, s(a, u);
            };
          if (c === "index")
            return (n) => {
              const i = m[n];
              return s(i, [...t, n.toString()]);
            };
          if (c === "insert")
            return (n) => (I(t), ne(o, n, t, e), s(
              r.getState().cogsStateStore[e],
              []
            ));
          if (c === "uniqueInsert")
            return (n, i, l) => {
              const a = r.getState().getNestedState(e, t), u = q(n) ? n(a) : n;
              let _ = null;
              if (!a.some((w) => {
                if (i) {
                  const P = i.every(
                    (G) => M(w[G], u[G])
                  );
                  return P && (_ = w), P;
                }
                const D = M(w, u);
                return D && (_ = w), D;
              }))
                I(t), ne(o, u, t, e);
              else if (l && _) {
                const w = l(_), D = a.map(
                  (P) => M(P, _) ? w : P
                );
                I(t), Z(o, D, t);
              }
            };
          if (c === "cut")
            return (n, i) => {
              i?.waitForSync || (I(t), H(o, t, e, n));
            };
          if (c === "cutByValue")
            return (n) => {
              for (let i = 0; i < m.length; i++)
                m[i] === n && H(o, t, e, i);
            };
          if (c === "toggleByValue")
            return (n) => {
              const i = m.findIndex((l) => l === n);
              i > -1 ? H(o, t, e, i) : ne(o, n, t, e);
            };
          if (c === "stateFilter")
            return (n) => {
              const i = m.map((u, _) => ({
                ...u,
                __origIndex: _.toString()
              })), l = [], a = [];
              for (let u = 0; u < i.length; u++)
                n(i[u], u) && (l.push(u), a.push(i[u]));
              return d.clear(), h++, s(a, t, {
                filtered: [...y?.filtered || [], t],
                validIndices: l
                // Always pass validIndices, even if empty
              });
            };
        }
        const B = t[t.length - 1];
        if (!isNaN(Number(B))) {
          const n = t.slice(0, -1), i = r.getState().getNestedState(e, n);
          if (Array.isArray(i) && c === "cut")
            return () => H(
              o,
              n,
              e,
              Number(B)
            );
        }
        if (c === "get")
          return () => r.getState().getNestedState(e, t);
        if (c === "$derive")
          return (n) => re({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (c === "$derive")
          return (n) => re({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (c === "$get")
          return () => re({
            _stateKey: e,
            _path: t
          });
        if (c === "lastSynced") {
          const n = `${e}:${t.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (c == "getLocalStorage")
          return (n) => ve(f + "-" + e + "-" + n);
        if (c === "_selected") {
          const n = t.slice(0, -1), i = n.join("."), l = r.getState().getNestedState(e, n);
          return Array.isArray(l) ? Number(t[t.length - 1]) === r.getState().getSelectedIndex(e, i) : void 0;
        }
        if (c === "setSelected")
          return (n) => {
            const i = t.slice(0, -1), l = Number(t[t.length - 1]), a = i.join(".");
            n ? r.getState().setSelectedIndex(e, a, l) : r.getState().setSelectedIndex(e, a, void 0);
            const u = r.getState().getNestedState(e, [...i]);
            Z(o, u, i), I(i);
          };
        if (t.length == 0) {
          if (c === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(e)?.validation, i = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              L(n.key);
              const l = r.getState().cogsStateStore[e];
              try {
                const a = r.getState().getValidationErrors(n.key);
                a && a.length > 0 && a.forEach(([_]) => {
                  _ && _.startsWith(n.key) && L(_);
                });
                const u = n.zodSchema.safeParse(l);
                return u.success ? !0 : (u.error.errors.forEach((T) => {
                  const w = T.path, D = T.message, P = [n.key, ...w].join(".");
                  i(P, D);
                }), ce(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (c === "_componentId") return v;
          if (c === "getComponents")
            return () => r().stateComponents.get(e);
          if (c === "getAllFormRefs")
            return () => fe.getState().getFormRefsByStateKey(e);
          if (c === "_initialState")
            return r.getState().initialStateGlobal[e];
          if (c === "_serverState")
            return r.getState().serverState[e];
          if (c === "_isLoading")
            return r.getState().isLoadingGlobal[e];
          if (c === "revertToInitialState")
            return S.revertToInitialState;
          if (c === "updateInitialState") return S.updateInitialState;
          if (c === "removeValidation") return S.removeValidation;
        }
        if (c === "getFormRef")
          return () => fe.getState().getFormRef(e + "." + t.join("."));
        if (c === "validationWrapper")
          return ({
            children: n,
            hideMessage: i
          }) => /* @__PURE__ */ ue(
            Ve,
            {
              formOpts: i ? { validation: { message: "" } } : void 0,
              path: t,
              validationKey: r.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: y?.validIndices,
              children: n
            }
          );
        if (c === "_stateKey") return e;
        if (c === "_path") return t;
        if (c === "_isServerSynced") return S._isServerSynced;
        if (c === "update")
          return (n, i) => {
            if (i?.debounce)
              Te(() => {
                Z(o, n, t, "");
                const l = r.getState().getNestedState(e, t);
                i?.afterUpdate && i.afterUpdate(l);
              }, i.debounce);
            else {
              Z(o, n, t, "");
              const l = r.getState().getNestedState(e, t);
              i?.afterUpdate && i.afterUpdate(l);
            }
            I(t);
          };
        if (c === "formElement")
          return (n, i) => /* @__PURE__ */ ue(
            ke,
            {
              setState: o,
              stateKey: e,
              path: t,
              child: n,
              formOpts: i
            }
          );
        const U = [...t, c], k = r.getState().getNestedState(e, U);
        return s(k, U, y);
      }
    }, j = new Proxy(A, b);
    return d.set(p, {
      proxy: j,
      stateVersion: h
    }), j;
  }
  return s(
    r.getState().getNestedState(e, [])
  );
}
function re(e) {
  return K(Me, { proxy: e });
}
function Re({
  proxy: e,
  rebuildStateShape: o
}) {
  const v = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(v) ? o(
    v,
    e._path
  ).stateMapNoRender(
    (d, h, I, S, s) => e._mapFn(d, h, I, S, s)
  ) : null;
}
function Me({
  proxy: e
}) {
  const o = Y(null), v = `${e._stateKey}-${e._path.join(".")}`;
  return oe(() => {
    const f = o.current;
    if (!f || !f.parentElement) return;
    const d = f.parentElement, I = Array.from(d.childNodes).indexOf(f);
    let S = d.getAttribute("data-parent-id");
    S || (S = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", S));
    const m = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: S,
      position: I,
      effect: e._effect
    };
    r.getState().addSignalElement(v, m);
    const t = r.getState().getNestedState(e._stateKey, e._path);
    let y;
    if (e._effect)
      try {
        y = new Function(
          "state",
          `return (${e._effect})(state)`
        )(t);
      } catch (A) {
        console.error("Error evaluating effect function during mount:", A), y = t;
      }
    else
      y = t;
    y !== null && typeof y == "object" && (y = JSON.stringify(y));
    const p = document.createTextNode(String(y));
    f.replaceWith(p);
  }, [e._stateKey, e._path.join("."), e._effect]), K("span", {
    ref: o,
    style: { display: "none" },
    "data-signal-id": v
  });
}
function Xe(e) {
  const o = Ne(
    (v) => {
      const f = r.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(e._stateKey, {
        forceUpdate: v,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => f.components.delete(e._stateKey);
    },
    () => r.getState().getNestedState(e._stateKey, e._path)
  );
  return K("text", {}, String(o));
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
