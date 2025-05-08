"use client";
import { jsx as ue } from "react/jsx-runtime";
import { useState as ae, useRef as Y, useEffect as oe, useLayoutEffect as Ee, useMemo as we, createElement as K, useSyncExternalStore as Ne, startTransition as $e } from "react";
import { transformStateFunc as Ae, isFunction as q, getDifferences as ge, getNestedValue as W, isDeepEqual as G, debounce as Te } from "./utility.js";
import { pushFunc as ne, updateFn as Z, cutFunc as H, ValidationWrapper as Ce, FormControlComponent as Ve } from "./Functions.jsx";
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
  const f = J(e) || {}, d = v[e] || {}, E = r.getState().setInitialStateOptions, _ = { ...d, ...f };
  let S = !1;
  if (i)
    for (const s in i)
      _.hasOwnProperty(s) ? (s == "localStorage" && i[s] && _[s].key !== i[s]?.key && (S = !0, _[s] = i[s]), s == "initialState" && i[s] && _[s] !== i[s] && (S = !0, _[s] = i[s])) : (S = !0, _[s] = i[s]);
  S && E(e, _);
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
  const E = (S, s) => {
    const [m] = ae(s?.componentId ?? ie());
    if (s && typeof s.initialState < "u" && q(s.initialState)) {
      const x = r.getState().cogsStateStore[S] || f[S], F = s.initialState(
        x
      );
      s = {
        ...s,
        initialState: F
      };
    }
    me({
      stateKey: S,
      options: s,
      initialOptionsPart: d
    });
    const t = r.getState().cogsStateStore[S] || f[S], y = s?.modifyState ? s.modifyState(t) : t, [b, A] = je(
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
  function _(S, s) {
    me({ stateKey: S, options: s, initialOptionsPart: d }), ce(S);
  }
  return { useCogsState: E, setCogsOptions: _ };
}, {
  setUpdaterState: X,
  setState: z,
  getInitialOptions: J,
  getKeyState: ye,
  getValidationErrors: xe,
  setStateLog: pe,
  updateInitialStateGlobal: se,
  addValidationError: be,
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
    const E = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, _ = `${f}-${i}-${d}`;
    window.localStorage.setItem(_, JSON.stringify(E));
  }
}, Fe = (e, i, v, f, d, E) => {
  const _ = {
    initialState: i,
    updaterState: Q(
      e,
      f,
      d,
      E
    ),
    state: v
  };
  se(e, _.initialState), X(e, _.updaterState), z(e, _.state);
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
function je(e, {
  stateKey: i,
  serverSync: v,
  localStorage: f,
  formElements: d,
  middleware: E,
  reactiveDeps: _,
  reactiveType: S,
  componentId: s,
  initialState: m,
  syncUpdate: t,
  dependencies: y
} = {}) {
  const [b, A] = ae({}), { sessionId: x } = ke();
  let F = !i;
  const [g] = ae(i ?? ie()), c = r.getState().stateLog[g], B = Y(/* @__PURE__ */ new Set()), M = Y(s ?? ie()), C = Y(null);
  C.current = J(g), oe(() => {
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
    const l = C.current;
    let a = null;
    const u = q(l?.localStorage?.key) ? l?.localStorage?.key(m) : l?.localStorage?.key;
    u && x && (a = ve(
      x + "-" + g + "-" + u
    )), r.getState().iniitialCreatedState[g];
    let I = null;
    m && (I = m, a && a.lastUpdated > (a.lastSyncedWithServer || 0) && (I = a.state, l?.localStorage?.onChange && l?.localStorage?.onChange(I)), console.log("newState thius is newstate", I), Fe(
      g,
      m,
      I,
      n,
      M.current,
      x
    ), ce(g), (Array.isArray(S) ? S : [S || "component"]).includes("none") || A({}));
  }, [m, ...y || []]), Ee(() => {
    F && Se(g, {
      serverSync: v,
      formElements: d,
      initialState: m,
      localStorage: f,
      middleware: E
    });
    const l = `${g}////${M.current}`, a = r.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(l, {
      forceUpdate: () => A({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: S ?? ["component", "deps"]
    }), r.getState().stateComponents.set(g, a), A({}), () => {
      const u = `${g}////${M.current}`;
      a && (a.components.delete(u), a.components.size === 0 && r.getState().stateComponents.delete(g));
    };
  }, []);
  const n = (l, a, u, I) => {
    if (Array.isArray(a)) {
      const V = `${g}-${a.join(".")}`;
      B.current.add(V);
    }
    z(g, (V) => {
      const w = q(l) ? l(V) : l, U = ge(V, w);
      new Set(U);
      const P = `${g}-${a.join(".")}`;
      if (P) {
        let j = !1, N = r.getState().signalDomElements.get(P);
        if ((!N || N.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const p = a.slice(0, -1), O = W(w, p);
          if (Array.isArray(O)) {
            j = !0;
            const h = `${g}-${p.join(".")}`;
            N = r.getState().signalDomElements.get(h);
          }
        }
        if (N) {
          const p = j ? W(w, a.slice(0, -1)) : W(w, a);
          N.forEach(({ parentId: O, position: h, effect: T }) => {
            const $ = document.querySelector(
              `[data-parent-id="${O}"]`
            );
            if ($) {
              const R = Array.from($.childNodes);
              if (R[h]) {
                const k = T ? new Function("state", `return (${T})(state)`)(p) : p;
                R[h].textContent = String(k);
              }
            }
          });
        }
      }
      u.updateType === "update" && (I || C.current?.validationKey) && a && L(
        (I || C.current?.validationKey) + "." + a.join(".")
      );
      const D = a.slice(0, a.length - 1);
      u.updateType === "cut" && C.current?.validationKey && L(
        C.current?.validationKey + "." + D.join(".")
      ), u.updateType === "insert" && C.current?.validationKey && xe(
        C.current?.validationKey + "." + D.join(".")
      ).filter(([N, p]) => {
        let O = N?.split(".").length;
        if (N == D.join(".") && O == D.length - 1) {
          let h = N + "." + D;
          L(N), be(h, p);
        }
      });
      const Ie = W(V, a), _e = W(w, a), he = u.updateType === "update" ? a.join(".") : [...a].slice(0, -1).join("."), ee = r.getState().stateComponents.get(g);
      if (console.log(
        "pathetocaheck.............................",
        a,
        u,
        he ?? "NONE",
        ee
      ), ee) {
        const j = ge(V, w), N = new Set(j), p = u.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          O,
          h
        ] of ee.components.entries()) {
          let T = !1;
          const $ = Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"];
          if (!$.includes("none")) {
            if ($.includes("all")) {
              h.forceUpdate();
              continue;
            }
            if ($.includes("component") && ((h.paths.has(p) || h.paths.has("")) && (T = !0), !T))
              for (const R of N) {
                let k = R;
                for (; ; ) {
                  if (h.paths.has(k)) {
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
                    ) && h.paths.has(de)) {
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
            if (!T && $.includes("deps") && h.depsFunction) {
              const R = h.depsFunction(w);
              let k = !1;
              typeof R == "boolean" ? R && (k = !0) : G(h.deps, R) || (h.deps = R, k = !0), k && (T = !0);
            }
            T && h.forceUpdate();
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
      if (pe(g, (j) => {
        const p = [...j ?? [], le].reduce((O, h) => {
          const T = `${h.stateKey}:${JSON.stringify(h.path)}`, $ = O.get(T);
          return $ ? ($.timeStamp = Math.max($.timeStamp, h.timeStamp), $.newValue = h.newValue, $.oldValue = $.oldValue ?? h.oldValue, $.updateType = h.updateType) : O.set(T, { ...h }), O;
        }, /* @__PURE__ */ new Map());
        return Array.from(p.values());
      }), Oe(
        w,
        g,
        C.current,
        x
      ), E && E({
        updateLog: c,
        update: le
      }), C.current?.serverSync) {
        const j = r.getState().serverState[g], N = C.current?.serverSync;
        Pe(g, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: w }),
          rollBackState: j,
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
  let E = 0;
  const _ = (m) => {
    const t = m.join(".");
    for (const [y] of d)
      (y === t || y.startsWith(t + ".")) && d.delete(y);
    E++;
  }, S = {
    removeValidation: (m) => {
      m?.validationKey && L(m.validationKey);
    },
    revertToInitialState: (m) => {
      const t = r.getState().getInitialOptions(e)?.validation;
      t?.key && L(t?.key), m?.validationKey && L(m.validationKey);
      const y = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), d.clear(), E++;
      const b = s(y, []), A = J(e), x = q(A?.localStorage?.key) ? A?.localStorage?.key(y) : A?.localStorage?.key, F = `${f}-${e}-${x}`;
      F && localStorage.removeItem(F), X(e, b), z(e, y);
      const g = r.getState().stateComponents.get(e);
      return g && g.components.forEach((c) => {
        c.forceUpdate();
      }), y;
    },
    updateInitialState: (m) => {
      d.clear(), E++;
      const t = Q(
        e,
        i,
        v,
        f
      );
      return $e(() => {
        se(e, m), X(e, t), z(e, m);
        const y = r.getState().stateComponents.get(e);
        y && y.components.forEach((b) => {
          b.forceUpdate();
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
    const b = t.map(String).join(".");
    d.get(b);
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
              const a = [...r.getState().getNestedState(e, t).map((u, I) => ({
                ...u,
                __origIndex: I.toString()
              }))].sort(n);
              return d.clear(), E++, s(a, t, {
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
              return c !== "stateMapNoRender" && (d.clear(), E++), l.map((a, u) => {
                const I = o && a.__origIndex ? a.__origIndex : u, V = s(
                  a,
                  [...t, I.toString()],
                  y
                );
                return n(
                  a,
                  V,
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
              d.clear(), E++;
              const a = l.flatMap(
                (u, I) => u[n] ?? []
              );
              return s(
                a,
                [...t, "[*]", n],
                y
              );
            };
          if (c === "findWith")
            return (n, o) => {
              const l = m.findIndex((I) => (console.log("findWith-----------11-----------", I, o), I[n] === o));
              if (console.log("findWith---------22--------------", l), l === -1) return;
              const a = m[l], u = [...t, l.toString()];
              return d.clear(), E++, d.clear(), E++, s(a, u);
            };
          if (c === "index")
            return (n) => {
              const o = m[n];
              return s(o, [...t, n.toString()]);
            };
          if (c === "insert")
            return (n) => (_(t), ne(i, n, t, e), s(
              r.getState().cogsStateStore[e],
              []
            ));
          if (c === "uniqueInsert")
            return (n, o, l) => {
              const a = r.getState().getNestedState(e, t), u = q(n) ? n(a) : n;
              let I = null;
              if (!a.some((w) => {
                if (o) {
                  const P = o.every(
                    (D) => G(w[D], u[D])
                  );
                  return P && (I = w), P;
                }
                const U = G(w, u);
                return U && (I = w), U;
              }))
                _(t), ne(i, u, t, e);
              else if (l && I) {
                const w = l(I), U = a.map(
                  (P) => G(P, I) ? w : P
                );
                _(t), Z(i, U, t);
              }
            };
          if (c === "cut")
            return (n, o) => {
              o?.waitForSync || (_(t), H(i, t, e, n));
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
              const o = m.map((u, I) => ({
                ...u,
                __origIndex: I.toString()
              })), l = [], a = [];
              for (let u = 0; u < o.length; u++)
                n(o[u], u) && (l.push(u), a.push(o[u]));
              return d.clear(), E++, s(a, t, {
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
            Z(i, u, o), _(o);
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
                a && a.length > 0 && a.forEach(([I]) => {
                  I && I.startsWith(n.key) && L(I);
                });
                const u = n.zodSchema.safeParse(l);
                return u.success ? !0 : (u.error.errors.forEach((V) => {
                  const w = V.path, U = V.message, P = [n.key, ...w].join(".");
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
            Ce,
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
            _(t);
          };
        if (c === "formElement")
          return (n, o) => /* @__PURE__ */ ue(
            Ve,
            {
              setState: i,
              stateKey: e,
              path: t,
              child: n,
              formOpts: o
            }
          );
        const M = [...t, c], C = r.getState().getNestedState(e, M);
        return s(C, M, y);
      }
    }, F = new Proxy(A, x);
    return d.set(b, {
      proxy: F,
      stateVersion: E
    }), F;
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
    (d, E, _, S, s) => e._mapFn(d, E, _, S, s)
  ) : null;
}
function Me({
  proxy: e
}) {
  const i = Y(null), v = `${e._stateKey}-${e._path.join(".")}`;
  return oe(() => {
    const f = i.current;
    if (!f || !f.parentElement) return;
    const d = f.parentElement, _ = Array.from(d.childNodes).indexOf(f);
    let S = d.getAttribute("data-parent-id");
    S || (S = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", S));
    const m = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: S,
      position: _,
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
    const b = document.createTextNode(String(y));
    f.replaceWith(b);
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
  je as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
