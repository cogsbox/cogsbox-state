"use client";
import { jsx as ue } from "react/jsx-runtime";
import { useState as ae, useRef as Y, useEffect as oe, useLayoutEffect as he, useMemo as we, createElement as K, useSyncExternalStore as Ne, startTransition as $e } from "react";
import { transformStateFunc as Ae, isFunction as q, isDeepEqual as j, getDifferences as ge, getNestedValue as W, debounce as Te } from "./utility.js";
import { pushFunc as ne, updateFn as Z, cutFunc as H, ValidationWrapper as Ve, FormControlComponent as ke } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as fe } from "./store.js";
import { useCogsConfig as Ce } from "./CogsStateClient.jsx";
import ie from "./node_modules/uuid/dist/esm-browser/v4.js";
function Se(e, o) {
  const v = r.getState().getInitialOptions, S = r.getState().setInitialStateOptions, d = v(e) || {};
  S(e, {
    ...d,
    ...o
  });
}
function me({
  stateKey: e,
  options: o,
  initialOptionsPart: v
}) {
  const S = J(e) || {}, d = v[e] || {}, h = r.getState().setInitialStateOptions, I = { ...d, ...S };
  let m = !1;
  if (o)
    for (const s in o)
      I.hasOwnProperty(s) ? (s == "localStorage" && o[s] && I[s].key !== o[s]?.key && (m = !0, I[s] = o[s]), s == "initialState" && o[s] && I[s] !== o[s] && // Different references
      !j(I[s], o[s]) && (m = !0, I[s] = o[s])) : (m = !0, I[s] = o[s]);
  m && h(e, I);
}
function Ze(e, { formElements: o, validation: v }) {
  return { initialState: e, formElements: o, validation: v };
}
const He = (e, o) => {
  let v = e;
  const [S, d] = Ae(v);
  (Object.keys(d).length > 0 || o && Object.keys(o).length > 0) && Object.keys(d).forEach((m) => {
    d[m] = d[m] || {}, d[m].formElements = {
      ...o?.formElements,
      // Global defaults first
      ...o?.validation,
      ...d[m].formElements || {}
      // State-specific overrides
    }, J(m) || r.getState().setInitialStateOptions(m, d[m]);
  }), r.getState().setInitialStates(S), r.getState().setCreatedState(S);
  const h = (m, s) => {
    const [f] = ae(s?.componentId ?? ie());
    if (s && typeof s.initialState < "u" && q(s.initialState)) {
      const b = r.getState().cogsStateStore[m] || S[m], F = s.initialState(
        b
      );
      s = {
        ...s,
        initialState: F
      };
    }
    me({
      stateKey: m,
      options: s,
      initialOptionsPart: d
    });
    const t = r.getState().cogsStateStore[m] || S[m], y = s?.modifyState ? s.modifyState(t) : t, [p, T] = Fe(
      y,
      {
        stateKey: m,
        syncUpdate: s?.syncUpdate,
        componentId: f,
        localStorage: s?.localStorage,
        middleware: s?.middleware,
        enabledSync: s?.enabledSync,
        reactiveType: s?.reactiveType,
        reactiveDeps: s?.reactiveDeps,
        initialState: s?.initialState,
        dependencies: s?.dependencies
      }
    );
    return T;
  };
  function I(m, s) {
    me({ stateKey: m, options: s, initialOptionsPart: d }), ce(m);
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
}, Oe = (e, o, v, S) => {
  v?.log && console.log(
    "saving to localstorage",
    o,
    v.localStorage?.key,
    S
  );
  const d = q(v?.localStorage?.key) ? v.localStorage?.key(e) : v?.localStorage?.key;
  if (d && S) {
    const h = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[o]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[o]
    }, I = `${S}-${o}-${d}`;
    window.localStorage.setItem(I, JSON.stringify(h));
  }
}, je = (e, o, v, S, d, h) => {
  const I = {
    initialState: o,
    updaterState: Q(
      e,
      S,
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
  o.components.forEach((S) => {
    (S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : null)?.includes("none") || v.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    v.forEach((S) => S());
  });
}, Ye = (e, o) => {
  const v = r.getState().stateComponents.get(e);
  if (v) {
    const S = `${e}////${o}`, d = v.components.get(S);
    if ((d ? Array.isArray(d.reactiveType) ? d.reactiveType : [d.reactiveType || "component"] : null)?.includes("none"))
      return;
    d && d.forceUpdate();
  }
};
function Fe(e, {
  stateKey: o,
  serverSync: v,
  localStorage: S,
  formElements: d,
  middleware: h,
  reactiveDeps: I,
  reactiveType: m,
  componentId: s,
  initialState: f,
  syncUpdate: t,
  dependencies: y
} = {}) {
  const [p, T] = ae({}), { sessionId: b } = Ce();
  let F = !o;
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
    if (f) {
      Se(g, {
        initialState: f
      });
      const l = k.current;
      let a = null;
      const u = q(l?.localStorage?.key) ? l?.localStorage?.key(f) : l?.localStorage?.key;
      u && b && (a = ve(
        b + "-" + g + "-" + u
      ));
      const _ = r.getState().initialStateGlobal[g];
      if (console.log(
        "currentGloballyStoredInitialState",
        _,
        f,
        j(_, f)
      ), _ && !j(_, f) || !_) {
        let $ = f;
        a && a.lastUpdated > (a.lastSyncedWithServer || 0) && ($ = a.state, l?.localStorage?.onChange && l?.localStorage?.onChange($)), je(
          g,
          f,
          $,
          n,
          U.current,
          b
        ), ce(g), (Array.isArray(m) ? m : [m || "component"]).includes("none") || T({});
      }
    }
  }, [f, ...y || []]), he(() => {
    F && Se(g, {
      serverSync: v,
      formElements: d,
      initialState: f,
      localStorage: S,
      middleware: h
    });
    const l = `${g}////${U.current}`, a = r.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(l, {
      forceUpdate: () => T({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: I || void 0,
      reactiveType: m ?? ["component", "deps"]
    }), r.getState().stateComponents.set(g, a), T({}), () => {
      const u = `${g}////${U.current}`;
      a && (a.components.delete(u), a.components.size === 0 && r.getState().stateComponents.delete(g));
    };
  }, []);
  const n = (l, a, u, _) => {
    if (Array.isArray(a)) {
      const $ = `${g}-${a.join(".")}`;
      B.current.add($);
    }
    z(g, ($) => {
      const w = q(l) ? l($) : l, G = ge($, w);
      new Set(G);
      const P = `${g}-${a.join(".")}`;
      if (P) {
        let R = !1, N = r.getState().signalDomElements.get(P);
        if ((!N || N.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const x = a.slice(0, -1), O = W(w, x);
          if (Array.isArray(O)) {
            R = !0;
            const E = `${g}-${x.join(".")}`;
            N = r.getState().signalDomElements.get(E);
          }
        }
        if (N) {
          const x = R ? W(w, a.slice(0, -1)) : W(w, a);
          N.forEach(({ parentId: O, position: E, effect: V }) => {
            const A = document.querySelector(
              `[data-parent-id="${O}"]`
            );
            if (A) {
              const M = Array.from(A.childNodes);
              if (M[E]) {
                const C = V ? new Function("state", `return (${V})(state)`)(x) : x;
                M[E].textContent = String(C);
              }
            }
          });
        }
      }
      u.updateType === "update" && (_ || k.current?.validationKey) && a && L(
        (_ || k.current?.validationKey) + "." + a.join(".")
      );
      const D = a.slice(0, a.length - 1);
      u.updateType === "cut" && k.current?.validationKey && L(
        k.current?.validationKey + "." + D.join(".")
      ), u.updateType === "insert" && k.current?.validationKey && be(
        k.current?.validationKey + "." + D.join(".")
      ).filter(([N, x]) => {
        let O = N?.split(".").length;
        if (N == D.join(".") && O == D.length - 1) {
          let E = N + "." + D;
          L(N), pe(E, x);
        }
      });
      const Ie = W($, a), _e = W(w, a), Ee = u.updateType === "update" ? a.join(".") : [...a].slice(0, -1).join("."), ee = r.getState().stateComponents.get(g);
      if (console.log(
        "pathetocaheck.............................",
        a,
        u,
        Ee ?? "NONE",
        ee
      ), ee) {
        const R = ge($, w), N = new Set(R), x = u.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          O,
          E
        ] of ee.components.entries()) {
          let V = !1;
          const A = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (!A.includes("none")) {
            if (A.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if (A.includes("component") && ((E.paths.has(x) || E.paths.has("")) && (V = !0), !V))
              for (const M of N) {
                let C = M;
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
            if (!V && A.includes("deps") && E.depsFunction) {
              const M = E.depsFunction(w);
              let C = !1;
              typeof M == "boolean" ? M && (C = !0) : j(E.deps, M) || (E.deps = M, C = !0), C && (V = !0);
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
      if (xe(g, (R) => {
        const x = [...R ?? [], le].reduce((O, E) => {
          const V = `${E.stateKey}:${JSON.stringify(E.path)}`, A = O.get(V);
          return A ? (A.timeStamp = Math.max(A.timeStamp, E.timeStamp), A.newValue = E.newValue, A.oldValue = A.oldValue ?? E.oldValue, A.updateType = E.updateType) : O.set(V, { ...E }), O;
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
        const R = r.getState().serverState[g], N = k.current?.serverSync;
        Pe(g, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: w }),
          rollBackState: R,
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
function Q(e, o, v, S) {
  const d = /* @__PURE__ */ new Map();
  let h = 0;
  const I = (f) => {
    const t = f.join(".");
    for (const [y] of d)
      (y === t || y.startsWith(t + ".")) && d.delete(y);
    h++;
  }, m = {
    removeValidation: (f) => {
      f?.validationKey && L(f.validationKey);
    },
    revertToInitialState: (f) => {
      const t = r.getState().getInitialOptions(e)?.validation;
      t?.key && L(t?.key), f?.validationKey && L(f.validationKey);
      const y = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), d.clear(), h++;
      const p = s(y, []), T = J(e), b = q(T?.localStorage?.key) ? T?.localStorage?.key(y) : T?.localStorage?.key, F = `${S}-${e}-${b}`;
      F && localStorage.removeItem(F), X(e, p), z(e, y);
      const g = r.getState().stateComponents.get(e);
      return g && g.components.forEach((c) => {
        c.forceUpdate();
      }), y;
    },
    updateInitialState: (f) => {
      d.clear(), h++;
      const t = Q(
        e,
        o,
        v,
        S
      );
      return $e(() => {
        se(e, f), X(e, t), z(e, f);
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
      const f = r.getState().serverState[e];
      return !!(f && j(f, ye(e)));
    }
  };
  function s(f, t = [], y) {
    const p = t.map(String).join(".");
    d.get(p);
    const T = function() {
      return r().getNestedState(e, t);
    };
    Object.keys(m).forEach((g) => {
      T[g] = m[g];
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
          return j(n, l) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const n = r().getNestedState(
              e,
              t
            ), i = r.getState().initialStateGlobal[e], l = W(i, t);
            return j(n, l) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[e], i = J(e), l = q(i?.localStorage?.key) ? i?.localStorage?.key(n) : i?.localStorage?.key, a = `${S}-${e}-${l}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (c === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(e)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(n.key + "." + t.join("."));
          };
        if (Array.isArray(f)) {
          if (c === "getSelected")
            return () => {
              const n = r.getState().getSelectedIndex(e, t.join("."));
              if (n !== void 0)
                return s(
                  f[n],
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
              ), l = i ? f : r.getState().getNestedState(e, t);
              return c !== "stateMapNoRender" && (d.clear(), h++), l.map((a, u) => {
                const _ = i && a.__origIndex ? a.__origIndex : u, $ = s(
                  a,
                  [...t, _.toString()],
                  y
                );
                return n(
                  a,
                  $,
                  u,
                  f,
                  s(f, t, y)
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
              ) ? f : r.getState().getNestedState(e, t);
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
              const l = f.findIndex((_) => _[n] === i);
              if (l === -1) return;
              const a = f[l], u = [...t, l.toString()];
              return d.clear(), h++, s(a, u);
            };
          if (c === "index")
            return (n) => {
              const i = f[n];
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
                    (D) => j(w[D], u[D])
                  );
                  return P && (_ = w), P;
                }
                const G = j(w, u);
                return G && (_ = w), G;
              }))
                I(t), ne(o, u, t, e);
              else if (l && _) {
                const w = l(_), G = a.map(
                  (P) => j(P, _) ? w : P
                );
                I(t), Z(o, G, t);
              }
            };
          if (c === "cut")
            return (n, i) => {
              i?.waitForSync || (I(t), H(o, t, e, n));
            };
          if (c === "cutByValue")
            return (n) => {
              for (let i = 0; i < f.length; i++)
                f[i] === n && H(o, t, e, i);
            };
          if (c === "toggleByValue")
            return (n) => {
              const i = f.findIndex((l) => l === n);
              i > -1 ? H(o, t, e, i) : ne(o, n, t, e);
            };
          if (c === "stateFilter")
            return (n) => {
              const i = f.map((u, _) => ({
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
          return (n) => ve(S + "-" + e + "-" + n);
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
                return u.success ? !0 : (u.error.errors.forEach(($) => {
                  const w = $.path, G = $.message, P = [n.key, ...w].join(".");
                  i(P, G);
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
            return m.revertToInitialState;
          if (c === "updateInitialState") return m.updateInitialState;
          if (c === "removeValidation") return m.removeValidation;
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
        if (c === "_isServerSynced") return m._isServerSynced;
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
    }, F = new Proxy(T, b);
    return d.set(p, {
      proxy: F,
      stateVersion: h
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
  rebuildStateShape: o
}) {
  const v = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(v) ? o(
    v,
    e._path
  ).stateMapNoRender(
    (d, h, I, m, s) => e._mapFn(d, h, I, m, s)
  ) : null;
}
function Me({
  proxy: e
}) {
  const o = Y(null), v = `${e._stateKey}-${e._path.join(".")}`;
  return oe(() => {
    const S = o.current;
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
    const p = document.createTextNode(String(y));
    S.replaceWith(p);
  }, [e._stateKey, e._path.join("."), e._effect]), K("span", {
    ref: o,
    style: { display: "none" },
    "data-signal-id": v
  });
}
function Xe(e) {
  const o = Ne(
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
