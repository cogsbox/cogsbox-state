"use client";
import { jsx as ue } from "react/jsx-runtime";
import { useState as ae, useRef as Y, useEffect as oe, useLayoutEffect as he, useMemo as we, createElement as K, useSyncExternalStore as Ne, startTransition as $e } from "react";
import { transformStateFunc as Ae, isFunction as q, getDifferences as ge, getNestedValue as W, isDeepEqual as G, debounce as Te } from "./utility.js";
import { pushFunc as ne, updateFn as Z, cutFunc as H, ValidationWrapper as Ve, FormControlComponent as Ce } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as fe } from "./store.js";
import { useCogsConfig as ke } from "./CogsStateClient.jsx";
import ie from "./node_modules/uuid/dist/esm-browser/v4.js";
function Se(e, i) {
  const v = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, d = v(e) || {};
  f(e, {
    ...d,
    ...i
  });
}
function me({
  stateKey: e,
  options: i,
  initialOptionsPart: v
}) {
  const f = J(e) || {}, d = v[e] || {}, h = r.getState().setInitialStateOptions, I = { ...d, ...f };
  let S = !1;
  if (i)
    for (const s in i)
      I.hasOwnProperty(s) ? (s == "localStorage" && i[s] && I[s].key !== i[s]?.key && (S = !0, I[s] = i[s]), s == "initialState" && i[s] && I[s] !== i[s] && (S = !0, I[s] = i[s])) : (S = !0, I[s] = i[s]);
  S && h(e, I);
}
function Ze(e, { formElements: i, validation: v }) {
  return { initialState: e, formElements: i, validation: v };
}
const He = (e, i) => {
  let v = e;
  const [f, d] = Ae(v);
  (Object.keys(d).length > 0 || i && Object.keys(i).length > 0) && Object.keys(d).forEach((S) => {
    d[S] = d[S] || {}, d[S].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...d[S].formElements || {}
      // State-specific overrides
    }, J(S) || r.getState().setInitialStateOptions(S, d[S]);
  }), r.getState().setInitialStates(f), r.getState().setCreatedState(f);
  const h = (S, s) => {
    const [m] = ae(s?.componentId ?? ie());
    if (s && typeof s.initialState < "u" && q(s.initialState)) {
      const x = r.getState().cogsStateStore[S] || f[S], j = s.initialState(
        x
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
  getValidationErrors: xe,
  setStateLog: be,
  updateInitialStateGlobal: se,
  addValidationError: pe,
  removeValidationError: L,
  setServerSyncActions: Pe
} = r.getState(), ve = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Oe = (e, i, v, f) => {
  v?.log && console.log(
    "saving to localstorage",
    i,
    v.localStorage?.key,
    f
  );
  const d = q(v?.localStorage?.key) ? v.localStorage?.key(e) : v?.localStorage?.key;
  if (d && f) {
    const h = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, I = `${f}-${i}-${d}`;
    window.localStorage.setItem(I, JSON.stringify(h));
  }
}, je = (e, i, v, f, d, h) => {
  const I = {
    initialState: i,
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
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const v = /* @__PURE__ */ new Set();
  i.components.forEach((f) => {
    (f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none") || v.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    v.forEach((f) => f());
  });
}, Ye = (e, i) => {
  const v = r.getState().stateComponents.get(e);
  if (v) {
    const f = `${e}////${i}`, d = v.components.get(f);
    if ((d ? Array.isArray(d.reactiveType) ? d.reactiveType : [d.reactiveType || "component"] : null)?.includes("none"))
      return;
    d && d.forceUpdate();
  }
};
function Fe(e, {
  stateKey: i,
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
  const [p, A] = ae({}), { sessionId: x } = ke();
  let j = !i;
  const [g] = ae(i ?? ie()), c = r.getState().stateLog[g], B = Y(/* @__PURE__ */ new Set()), M = Y(s ?? ie()), V = Y(null);
  V.current = J(g), oe(() => {
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
    const l = V.current;
    let a = null;
    const u = q(l?.localStorage?.key) ? l?.localStorage?.key(m) : l?.localStorage?.key;
    u && x && (a = ve(
      x + "-" + g + "-" + u
    )), r.getState().iniitialCreatedState[g];
    let _ = null;
    m && (_ = m, a && a.lastUpdated > (a.lastSyncedWithServer || 0) && (_ = a.state, l?.localStorage?.onChange && l?.localStorage?.onChange(_)), console.log("newState thius is newstate", _), je(
      g,
      m,
      _,
      n,
      M.current,
      x
    ), ce(g), (Array.isArray(S) ? S : [S || "component"]).includes("none") || A({}));
  }, [m, ...y || []]), he(() => {
    j && Se(g, {
      serverSync: v,
      formElements: d,
      initialState: m,
      localStorage: f,
      middleware: h
    });
    const l = `${g}////${M.current}`, a = r.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(l, {
      forceUpdate: () => A({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: I || void 0,
      reactiveType: S ?? ["component", "deps"]
    }), r.getState().stateComponents.set(g, a), A({}), () => {
      const u = `${g}////${M.current}`;
      a && (a.components.delete(u), a.components.size === 0 && r.getState().stateComponents.delete(g));
    };
  }, []);
  const n = (l, a, u, _) => {
    if (Array.isArray(a)) {
      const C = `${g}-${a.join(".")}`;
      B.current.add(C);
    }
    z(g, (C) => {
      const w = q(l) ? l(C) : l, U = ge(C, w);
      new Set(U);
      const P = `${g}-${a.join(".")}`;
      if (P) {
        let F = !1, N = r.getState().signalDomElements.get(P);
        if ((!N || N.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const b = a.slice(0, -1), O = W(w, b);
          if (Array.isArray(O)) {
            F = !0;
            const E = `${g}-${b.join(".")}`;
            N = r.getState().signalDomElements.get(E);
          }
        }
        if (N) {
          const b = F ? W(w, a.slice(0, -1)) : W(w, a);
          N.forEach(({ parentId: O, position: E, effect: T }) => {
            const $ = document.querySelector(
              `[data-parent-id="${O}"]`
            );
            if ($) {
              const R = Array.from($.childNodes);
              if (R[E]) {
                const k = T ? new Function("state", `return (${T})(state)`)(b) : b;
                R[E].textContent = String(k);
              }
            }
          });
        }
      }
      u.updateType === "update" && (_ || V.current?.validationKey) && a && L(
        (_ || V.current?.validationKey) + "." + a.join(".")
      );
      const D = a.slice(0, a.length - 1);
      u.updateType === "cut" && V.current?.validationKey && L(
        V.current?.validationKey + "." + D.join(".")
      ), u.updateType === "insert" && V.current?.validationKey && xe(
        V.current?.validationKey + "." + D.join(".")
      ).filter(([N, b]) => {
        let O = N?.split(".").length;
        if (N == D.join(".") && O == D.length - 1) {
          let E = N + "." + D;
          L(N), pe(E, b);
        }
      });
      const Ie = W(C, a), _e = W(w, a), Ee = u.updateType === "update" ? a.join(".") : [...a].slice(0, -1).join("."), ee = r.getState().stateComponents.get(g);
      if (console.log(
        "pathetocaheck.............................",
        a,
        u,
        Ee ?? "NONE",
        ee
      ), ee) {
        const F = ge(C, w), N = new Set(F), b = u.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          O,
          E
        ] of ee.components.entries()) {
          let T = !1;
          const $ = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (!$.includes("none")) {
            if ($.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if ($.includes("component") && ((E.paths.has(b) || E.paths.has("")) && (T = !0), !T))
              for (const R of N) {
                let k = R;
                for (; ; ) {
                  if (E.paths.has(k)) {
                    T = !0;
                    break;
                  }
                  const te = k.lastIndexOf(".");
                  if (te !== -1) {
                    const de = k.substring(
                      0,
                      te
                    );
                    if (!isNaN(
                      Number(k.substring(te + 1))
                    ) && E.paths.has(de)) {
                      T = !0;
                      break;
                    }
                    k = de;
                  } else
                    k = "";
                  if (k === "")
                    break;
                }
                if (T) break;
              }
            if (!T && $.includes("deps") && E.depsFunction) {
              const R = E.depsFunction(w);
              let k = !1;
              typeof R == "boolean" ? R && (k = !0) : G(E.deps, R) || (E.deps = R, k = !0), k && (T = !0);
            }
            T && E.forceUpdate();
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
      if (be(g, (F) => {
        const b = [...F ?? [], le].reduce((O, E) => {
          const T = `${E.stateKey}:${JSON.stringify(E.path)}`, $ = O.get(T);
          return $ ? ($.timeStamp = Math.max($.timeStamp, E.timeStamp), $.newValue = E.newValue, $.oldValue = $.oldValue ?? E.oldValue, $.updateType = E.updateType) : O.set(T, { ...E }), O;
        }, /* @__PURE__ */ new Map());
        return Array.from(b.values());
      }), Oe(
        w,
        g,
        V.current,
        x
      ), h && h({
        updateLog: c,
        update: le
      }), V.current?.serverSync) {
        const F = r.getState().serverState[g], N = V.current?.serverSync;
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
      M.current,
      x
    )
  ), r.getState().cogsStateStore[g] || z(g, e), r.getState().initialStateGlobal[g] || se(g, e));
  const o = we(() => Q(
    g,
    n,
    M.current,
    x
  ), [g]);
  return [ye(g), o];
}
function Q(e, i, v, f) {
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
      const p = s(y, []), A = J(e), x = q(A?.localStorage?.key) ? A?.localStorage?.key(y) : A?.localStorage?.key, j = `${f}-${e}-${x}`;
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
        i,
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
      return !!(m && G(m, ye(e)));
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
    const x = {
      apply(g, c, B) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, t);
      },
      get(g, c) {
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender") {
          const n = t.join("."), o = `${e}////${v}`, l = r.getState().stateComponents.get(e);
          if (l) {
            const a = l.components.get(o);
            a && (t.length > 0 || c === "get") && a.paths.add(n);
          }
        }
        if (c === "_status") {
          const n = r.getState().getNestedState(e, t), o = r.getState().initialStateGlobal[e], l = W(o, t);
          return G(n, l) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const n = r().getNestedState(
              e,
              t
            ), o = r.getState().initialStateGlobal[e], l = W(o, t);
            return G(n, l) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[e], o = J(e), l = q(o?.localStorage?.key) ? o?.localStorage?.key(n) : o?.localStorage?.key, a = `${f}-${e}-${l}`;
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
              const o = y?.filtered?.some(
                (a) => a.join(".") === t.join(".")
              ), l = o ? m : r.getState().getNestedState(e, t);
              return c !== "stateMapNoRender" && (d.clear(), h++), l.map((a, u) => {
                const _ = o && a.__origIndex ? a.__origIndex : u, C = s(
                  a,
                  [...t, _.toString()],
                  y
                );
                return n(
                  a,
                  C,
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
            return (n, o) => {
              const l = m.findIndex(
                (_) => _[n] === o
              );
              if (l === -1) return;
              const a = m[l], u = [...t, l.toString()];
              return d.clear(), h++, d.clear(), h++, s(a, u);
            };
          if (c === "index")
            return (n) => {
              const o = m[n];
              return s(o, [...t, n.toString()]);
            };
          if (c === "insert")
            return (n) => (I(t), ne(i, n, t, e), s(
              r.getState().cogsStateStore[e],
              []
            ));
          if (c === "uniqueInsert")
            return (n, o, l) => {
              const a = r.getState().getNestedState(e, t), u = q(n) ? n(a) : n;
              let _ = null;
              if (!a.some((w) => {
                if (o) {
                  const P = o.every(
                    (D) => G(w[D], u[D])
                  );
                  return P && (_ = w), P;
                }
                const U = G(w, u);
                return U && (_ = w), U;
              }))
                I(t), ne(i, u, t, e);
              else if (l && _) {
                const w = l(_), U = a.map(
                  (P) => G(P, _) ? w : P
                );
                I(t), Z(i, U, t);
              }
            };
          if (c === "cut")
            return (n, o) => {
              o?.waitForSync || (I(t), H(i, t, e, n));
            };
          if (c === "cutByValue")
            return (n) => {
              for (let o = 0; o < m.length; o++)
                m[o] === n && H(i, t, e, o);
            };
          if (c === "toggleByValue")
            return (n) => {
              const o = m.findIndex((l) => l === n);
              o > -1 ? H(i, t, e, o) : ne(i, n, t, e);
            };
          if (c === "stateFilter")
            return (n) => {
              const o = m.map((u, _) => ({
                ...u,
                __origIndex: _.toString()
              })), l = [], a = [];
              for (let u = 0; u < o.length; u++)
                n(o[u], u) && (l.push(u), a.push(o[u]));
              return d.clear(), h++, s(a, t, {
                filtered: [...y?.filtered || [], t],
                validIndices: l
                // Always pass validIndices, even if empty
              });
            };
        }
        const B = t[t.length - 1];
        if (!isNaN(Number(B))) {
          const n = t.slice(0, -1), o = r.getState().getNestedState(e, n);
          if (Array.isArray(o) && c === "cut")
            return () => H(
              i,
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
          const n = t.slice(0, -1), o = n.join("."), l = r.getState().getNestedState(e, n);
          return Array.isArray(l) ? Number(t[t.length - 1]) === r.getState().getSelectedIndex(e, o) : void 0;
        }
        if (c === "setSelected")
          return (n) => {
            const o = t.slice(0, -1), l = Number(t[t.length - 1]), a = o.join(".");
            n ? r.getState().setSelectedIndex(e, a, l) : r.getState().setSelectedIndex(e, a, void 0);
            const u = r.getState().getNestedState(e, [...o]);
            Z(i, u, o), I(o);
          };
        if (t.length == 0) {
          if (c === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(e)?.validation, o = r.getState().addValidationError;
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
                return u.success ? !0 : (u.error.errors.forEach((C) => {
                  const w = C.path, U = C.message, P = [n.key, ...w].join(".");
                  o(P, U);
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
            hideMessage: o
          }) => /* @__PURE__ */ ue(
            Ve,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
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
        if (c === "formElement")
          return (n, o) => /* @__PURE__ */ ue(
            Ce,
            {
              setState: i,
              stateKey: e,
              path: t,
              child: n,
              formOpts: o
            }
          );
        const M = [...t, c], V = r.getState().getNestedState(e, M);
        return s(V, M, y);
      }
    }, j = new Proxy(A, x);
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
  rebuildStateShape: i
}) {
  const v = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(v) ? i(
    v,
    e._path
  ).stateMapNoRender(
    (d, h, I, S, s) => e._mapFn(d, h, I, S, s)
  ) : null;
}
function Me({
  proxy: e
}) {
  const i = Y(null), v = `${e._stateKey}-${e._path.join(".")}`;
  return oe(() => {
    const f = i.current;
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
    ref: i,
    style: { display: "none" },
    "data-signal-id": v
  });
}
function Xe(e) {
  const i = Ne(
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
