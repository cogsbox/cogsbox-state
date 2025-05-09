"use client";
import { jsx as ue } from "react/jsx-runtime";
import { useState as ae, useRef as Y, useEffect as oe, useLayoutEffect as he, useMemo as Ne, createElement as K, useSyncExternalStore as we, startTransition as $e } from "react";
import { transformStateFunc as Ae, isFunction as q, isDeepEqual as F, getDifferences as ge, getNestedValue as W, debounce as Te } from "./utility.js";
import { pushFunc as ne, updateFn as Z, cutFunc as H, ValidationWrapper as Ve, FormControlComponent as ke } from "./Functions.jsx";
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
  const S = J(e) || {}, d = v[e] || {}, h = r.getState().setInitialStateOptions, I = { ...d, ...S };
  let m = !1;
  if (i)
    for (const s in i)
      I.hasOwnProperty(s) ? (s == "localStorage" && i[s] && I[s].key !== i[s]?.key && (m = !0, I[s] = i[s]), s == "initialState" && i[s] && I[s] !== i[s] && // Different references
      !F(I[s], i[s]) && (m = !0, I[s] = i[s])) : (m = !0, I[s] = i[s]);
  m && h(e, I);
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
  const h = (m, s) => {
    const [f] = ae(s?.componentId ?? ie());
    if (s && typeof s.initialState < "u" && q(s.initialState)) {
      const b = r.getState().cogsStateStore[m] || S[m], p = s.initialState(
        b
      );
      s = {
        ...s,
        initialState: p
      };
    }
    me({
      stateKey: m,
      options: s,
      initialOptionsPart: d
    });
    const t = r.getState().cogsStateStore[m] || S[m], y = s?.modifyState ? s.modifyState(t) : t, [P, T] = pe(
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
  addValidationError: Pe,
  removeValidationError: L,
  setServerSyncActions: Oe
} = r.getState(), ve = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, je = (e, i, v, S) => {
  v?.log && console.log(
    "saving to localstorage",
    i,
    v.localStorage?.key,
    S
  );
  const d = q(v?.localStorage?.key) ? v.localStorage?.key(e) : v?.localStorage?.key;
  if (d && S) {
    const h = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, I = `${S}-${i}-${d}`;
    window.localStorage.setItem(I, JSON.stringify(h));
  }
}, Fe = (e, i, v, S, d, h) => {
  const I = {
    initialState: i,
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
function pe(e, {
  stateKey: i,
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
  const [P, T] = ae({}), { sessionId: b } = Ce();
  let p = !i;
  const [g] = ae(i ?? ie()), c = r.getState().stateLog[g], B = Y(/* @__PURE__ */ new Set()), U = Y(s ?? ie()), k = Y(null);
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
        F(_, f)
      ), _ && !F(_, f) || !_) {
        let $ = f;
        a && a.lastUpdated > (a.lastSyncedWithServer || 0) && ($ = a.state, l?.localStorage?.onChange && l?.localStorage?.onChange($)), Fe(
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
    p && Se(g, {
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
      const N = q(l) ? l($) : l, G = ge($, N);
      new Set(G);
      const O = `${g}-${a.join(".")}`;
      if (O) {
        let R = !1, w = r.getState().signalDomElements.get(O);
        if ((!w || w.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const x = a.slice(0, -1), j = W(N, x);
          if (Array.isArray(j)) {
            R = !0;
            const E = `${g}-${x.join(".")}`;
            w = r.getState().signalDomElements.get(E);
          }
        }
        if (w) {
          const x = R ? W(N, a.slice(0, -1)) : W(N, a);
          w.forEach(({ parentId: j, position: E, effect: V }) => {
            const A = document.querySelector(
              `[data-parent-id="${j}"]`
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
      ).filter(([w, x]) => {
        let j = w?.split(".").length;
        if (w == D.join(".") && j == D.length - 1) {
          let E = w + "." + D;
          L(w), Pe(E, x);
        }
      });
      const Ie = W($, a), _e = W(N, a), Ee = u.updateType === "update" ? a.join(".") : [...a].slice(0, -1).join("."), ee = r.getState().stateComponents.get(g);
      if (console.log(
        "pathetocaheck.............................",
        a,
        u,
        Ee ?? "NONE",
        ee
      ), ee) {
        const R = ge($, N), w = new Set(R), x = u.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          j,
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
              for (const M of w) {
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
              const M = E.depsFunction(N);
              let C = !1;
              typeof M == "boolean" ? M && (C = !0) : F(E.deps, M) || (E.deps = M, C = !0), C && (V = !0);
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
        const x = [...R ?? [], le].reduce((j, E) => {
          const V = `${E.stateKey}:${JSON.stringify(E.path)}`, A = j.get(V);
          return A ? (A.timeStamp = Math.max(A.timeStamp, E.timeStamp), A.newValue = E.newValue, A.oldValue = A.oldValue ?? E.oldValue, A.updateType = E.updateType) : j.set(V, { ...E }), j;
        }, /* @__PURE__ */ new Map());
        return Array.from(x.values());
      }), je(
        N,
        g,
        k.current,
        b
      ), h && h({
        updateLog: c,
        update: le
      }), k.current?.serverSync) {
        const R = r.getState().serverState[g], w = k.current?.serverSync;
        Oe(g, {
          syncKey: typeof w.syncKey == "string" ? w.syncKey : w.syncKey({ state: N }),
          rollBackState: R,
          actionTimeStamp: Date.now() + (w.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return N;
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
  const o = Ne(() => Q(
    g,
    n,
    U.current,
    b
  ), [g]);
  return [ye(g), o];
}
function Q(e, i, v, S) {
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
      const P = s(y, []), T = J(e), b = q(T?.localStorage?.key) ? T?.localStorage?.key(y) : T?.localStorage?.key, p = `${S}-${e}-${b}`;
      p && localStorage.removeItem(p), X(e, P), z(e, y);
      const g = r.getState().stateComponents.get(e);
      return g && g.components.forEach((c) => {
        c.forceUpdate();
      }), y;
    },
    updateInitialState: (f) => {
      d.clear(), h++;
      const t = Q(
        e,
        i,
        v,
        S
      );
      return $e(() => {
        se(e, f), X(e, t), z(e, f);
        const y = r.getState().stateComponents.get(e);
        y && y.components.forEach((P) => {
          P.forceUpdate();
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
      return !!(f && F(f, ye(e)));
    }
  };
  function s(f, t = [], y) {
    const P = t.map(String).join(".");
    d.get(P);
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
          const n = t.join("."), o = `${e}////${v}`, l = r.getState().stateComponents.get(e);
          if (l) {
            const a = l.components.get(o);
            a && (t.length > 0 || c === "get") && a.paths.add(n);
          }
        }
        if (c === "_status") {
          const n = r.getState().getNestedState(e, t), o = r.getState().initialStateGlobal[e], l = W(o, t);
          return F(n, l) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const n = r().getNestedState(
              e,
              t
            ), o = r.getState().initialStateGlobal[e], l = W(o, t);
            return F(n, l) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[e], o = J(e), l = q(o?.localStorage?.key) ? o?.localStorage?.key(n) : o?.localStorage?.key, a = `${S}-${e}-${l}`;
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
              const o = y?.filtered?.some(
                (a) => a.join(".") === t.join(".")
              ), l = o ? f : r.getState().getNestedState(e, t);
              return c !== "stateMapNoRender" && (d.clear(), h++), l.map((a, u) => {
                const _ = o && a.__origIndex ? a.__origIndex : u, $ = s(
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
            return (n, o) => {
              const l = f.findIndex((_) => _[n] === o);
              if (l === -1) return;
              const a = f[l], u = [...t, l.toString()];
              return d.clear(), h++, s(a, u);
            };
          if (c === "index")
            return (n) => {
              const o = f[n];
              return s(o, [...t, n.toString()]);
            };
          if (c === "last")
            return () => {
              const n = r.getState().getNestedState(e, t);
              if (n.length === 0) return;
              const o = n.length - 1, l = n[o], a = [...t, o.toString()];
              return s(l, a);
            };
          if (c === "insert")
            return (n) => (I(t), ne(i, n, t, e), s(
              r.getState().getNestedState(e, t),
              t
            ));
          if (c === "uniqueInsert")
            return (n, o, l) => {
              const a = r.getState().getNestedState(e, t), u = q(n) ? n(a) : n;
              let _ = null;
              if (!a.some((N) => {
                if (o) {
                  const O = o.every(
                    (D) => F(N[D], u[D])
                  );
                  return O && (_ = N), O;
                }
                const G = F(N, u);
                return G && (_ = N), G;
              }))
                I(t), ne(i, u, t, e);
              else if (l && _) {
                const N = l(_), G = a.map(
                  (O) => F(O, _) ? N : O
                );
                I(t), Z(i, G, t);
              }
            };
          if (c === "cut")
            return (n, o) => {
              o?.waitForSync || (I(t), H(i, t, e, n));
            };
          if (c === "cutByValue")
            return (n) => {
              for (let o = 0; o < f.length; o++)
                f[o] === n && H(i, t, e, o);
            };
          if (c === "toggleByValue")
            return (n) => {
              const o = f.findIndex((l) => l === n);
              o > -1 ? H(i, t, e, o) : ne(i, n, t, e);
            };
          if (c === "stateFilter")
            return (n) => {
              const o = f.map((u, _) => ({
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
          return (n) => ve(S + "-" + e + "-" + n);
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
                return u.success ? !0 : (u.error.errors.forEach(($) => {
                  const N = $.path, G = $.message, O = [n.key, ...N].join(".");
                  o(O, G);
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
        if (c === "_isServerSynced") return m._isServerSynced;
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
            ke,
            {
              setState: i,
              stateKey: e,
              path: t,
              child: n,
              formOpts: o
            }
          );
        const U = [...t, c], k = r.getState().getNestedState(e, U);
        return s(k, U, y);
      }
    }, p = new Proxy(T, b);
    return d.set(P, {
      proxy: p,
      stateVersion: h
    }), p;
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
    (d, h, I, m, s) => e._mapFn(d, h, I, m, s)
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
    const P = document.createTextNode(String(y));
    S.replaceWith(P);
  }, [e._stateKey, e._path.join("."), e._effect]), K("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": v
  });
}
function Xe(e) {
  const i = we(
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
  pe as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
