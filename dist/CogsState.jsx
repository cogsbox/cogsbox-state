"use client";
import { jsx as ut } from "react/jsx-runtime";
import { useState as rt, useRef as Y, useEffect as at, useLayoutEffect as _t, useMemo as ht, createElement as K, useSyncExternalStore as Nt, startTransition as wt } from "react";
import { transformStateFunc as $t, isFunction as q, isDeepEqual as O, getDifferences as gt, getNestedValue as W, debounce as At } from "./utility.js";
import { pushFunc as et, updateFn as Z, cutFunc as H, ValidationWrapper as Tt, FormControlComponent as Vt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as ft } from "./store.js";
import { useCogsConfig as bt } from "./CogsStateClient.jsx";
import ot from "./node_modules/uuid/dist/esm-browser/v4.js";
function St(t, i) {
  const v = r.getState().getInitialOptions, S = r.getState().setInitialStateOptions, u = v(t) || {};
  S(t, {
    ...u,
    ...i
  });
}
function mt({
  stateKey: t,
  options: i,
  initialOptionsPart: v
}) {
  const S = J(t) || {}, u = v[t] || {}, h = r.getState().setInitialStateOptions, E = { ...u, ...S };
  let m = !1;
  if (i)
    for (const s in i)
      E.hasOwnProperty(s) ? (s == "localStorage" && i[s] && E[s].key !== i[s]?.key && (m = !0, E[s] = i[s]), s == "initialState" && i[s] && E[s] !== i[s] && // Different references
      !O(E[s], i[s]) && (m = !0, E[s] = i[s])) : (m = !0, E[s] = i[s]);
  m && h(t, E);
}
function Jt(t, { formElements: i, validation: v }) {
  return { initialState: t, formElements: i, validation: v };
}
const Zt = (t, i) => {
  let v = t;
  const [S, u] = $t(v);
  (Object.keys(u).length > 0 || i && Object.keys(i).length > 0) && Object.keys(u).forEach((m) => {
    u[m] = u[m] || {}, u[m].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...u[m].formElements || {}
      // State-specific overrides
    }, J(m) || r.getState().setInitialStateOptions(m, u[m]);
  }), r.getState().setInitialStates(S), r.getState().setCreatedState(S);
  const h = (m, s) => {
    const [f] = rt(s?.componentId ?? ot());
    if (s && typeof s.initialState < "u" && q(s.initialState)) {
      const C = r.getState().cogsStateStore[m] || S[m], F = s.initialState(
        C
      );
      s = {
        ...s,
        initialState: F
      };
    }
    mt({
      stateKey: m,
      options: s,
      initialOptionsPart: u
    });
    const e = r.getState().cogsStateStore[m] || S[m], y = s?.modifyState ? s.modifyState(e) : e, [P, T] = Ot(
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
  function E(m, s) {
    mt({ stateKey: m, options: s, initialOptionsPart: u }), st(m);
  }
  return { useCogsState: h, setCogsOptions: E };
}, {
  setUpdaterState: X,
  setState: z,
  getInitialOptions: J,
  getKeyState: yt,
  getValidationErrors: kt,
  setStateLog: Ct,
  updateInitialStateGlobal: it,
  addValidationError: xt,
  removeValidationError: L,
  setServerSyncActions: Pt
} = r.getState(), vt = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, jt = (t, i, v, S) => {
  v?.log && console.log(
    "saving to localstorage",
    i,
    v.localStorage?.key,
    S
  );
  const u = q(v?.localStorage?.key) ? v.localStorage?.key(t) : v?.localStorage?.key;
  if (u && S) {
    const h = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, E = `${S}-${i}-${u}`;
    window.localStorage.setItem(E, JSON.stringify(h));
  }
}, pt = (t, i, v, S, u, h) => {
  const E = {
    initialState: i,
    updaterState: Q(
      t,
      S,
      u,
      h
    ),
    state: v
  };
  it(t, E.initialState), X(t, E.updaterState), z(t, E.state);
}, st = (t) => {
  const i = r.getState().stateComponents.get(t);
  if (!i) return;
  const v = /* @__PURE__ */ new Set();
  i.components.forEach((S) => {
    (S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : null)?.includes("none") || v.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    v.forEach((S) => S());
  });
}, Ht = (t, i) => {
  const v = r.getState().stateComponents.get(t);
  if (v) {
    const S = `${t}////${i}`, u = v.components.get(S);
    if ((u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none"))
      return;
    u && u.forceUpdate();
  }
};
function Ot(t, {
  stateKey: i,
  serverSync: v,
  localStorage: S,
  formElements: u,
  middleware: h,
  reactiveDeps: E,
  reactiveType: m,
  componentId: s,
  initialState: f,
  syncUpdate: e,
  dependencies: y
} = {}) {
  const [P, T] = rt({}), { sessionId: C } = bt();
  let F = !i;
  const [g] = rt(i ?? ot()), c = r.getState().stateLog[g], B = Y(/* @__PURE__ */ new Set()), U = Y(s ?? ot()), b = Y(null);
  b.current = J(g), at(() => {
    if (e && e.stateKey === g && e.path?.[0]) {
      z(g, (a) => ({
        ...a,
        [e.path[0]]: e.newValue
      }));
      const d = `${e.stateKey}:${e.path.join(".")}`;
      r.getState().setSyncInfo(d, {
        timeStamp: e.timeStamp,
        userId: e.userId
      });
    }
  }, [e]), at(() => {
    if (f) {
      St(g, {
        initialState: f
      });
      const d = b.current;
      let a = null;
      const l = q(d?.localStorage?.key) ? d?.localStorage?.key(f) : d?.localStorage?.key;
      l && C && (a = vt(
        C + "-" + g + "-" + l
      ));
      const I = r.getState().initialStateGlobal[g];
      if (console.log(
        "currentGloballyStoredInitialState",
        I,
        f,
        O(I, f)
      ), I && !O(I, f) || !I) {
        let w = f;
        a && a.lastUpdated > (a.lastSyncedWithServer || 0) && (w = a.state, d?.localStorage?.onChange && d?.localStorage?.onChange(w)), pt(
          g,
          f,
          w,
          n,
          U.current,
          C
        ), st(g), (Array.isArray(m) ? m : [m || "component"]).includes("none") || T({});
      }
    }
  }, [f, ...y || []]), _t(() => {
    F && St(g, {
      serverSync: v,
      formElements: u,
      initialState: f,
      localStorage: S,
      middleware: h
    });
    const d = `${g}////${U.current}`, a = r.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(d, {
      forceUpdate: () => T({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0,
      reactiveType: m ?? ["component", "deps"]
    }), r.getState().stateComponents.set(g, a), T({}), () => {
      const l = `${g}////${U.current}`;
      a && (a.components.delete(l), a.components.size === 0 && r.getState().stateComponents.delete(g));
    };
  }, []);
  const n = (d, a, l, I) => {
    if (Array.isArray(a)) {
      const w = `${g}-${a.join(".")}`;
      B.current.add(w);
    }
    z(g, (w) => {
      const N = q(d) ? d(w) : d, G = gt(w, N);
      new Set(G);
      const j = `${g}-${a.join(".")}`;
      if (j) {
        let R = !1, $ = r.getState().signalDomElements.get(j);
        if ((!$ || $.size === 0) && (l.updateType === "insert" || l.updateType === "cut")) {
          const x = a.slice(0, -1), p = W(N, x);
          if (Array.isArray(p)) {
            R = !0;
            const _ = `${g}-${x.join(".")}`;
            $ = r.getState().signalDomElements.get(_);
          }
        }
        if ($) {
          const x = R ? W(N, a.slice(0, -1)) : W(N, a);
          $.forEach(({ parentId: p, position: _, effect: V }) => {
            const A = document.querySelector(
              `[data-parent-id="${p}"]`
            );
            if (A) {
              const M = Array.from(A.childNodes);
              if (M[_]) {
                const k = V ? new Function("state", `return (${V})(state)`)(x) : x;
                M[_].textContent = String(k);
              }
            }
          });
        }
      }
      l.updateType === "update" && (I || b.current?.validationKey) && a && L(
        (I || b.current?.validationKey) + "." + a.join(".")
      );
      const D = a.slice(0, a.length - 1);
      l.updateType === "cut" && b.current?.validationKey && L(
        b.current?.validationKey + "." + D.join(".")
      ), l.updateType === "insert" && b.current?.validationKey && kt(
        b.current?.validationKey + "." + D.join(".")
      ).filter(([$, x]) => {
        let p = $?.split(".").length;
        if ($ == D.join(".") && p == D.length - 1) {
          let _ = $ + "." + D;
          L($), xt(_, x);
        }
      });
      const It = W(w, a), Et = W(N, a);
      l.updateType === "update" ? a.join(".") : [...a].slice(0, -1).join(".");
      const ct = r.getState().stateComponents.get(g);
      if (ct) {
        const R = gt(w, N), $ = new Set(R), x = l.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          p,
          _
        ] of ct.components.entries()) {
          let V = !1;
          const A = Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"];
          if (!A.includes("none")) {
            if (A.includes("all")) {
              _.forceUpdate();
              continue;
            }
            if (A.includes("component") && ((_.paths.has(x) || _.paths.has("")) && (V = !0), !V))
              for (const M of $) {
                let k = M;
                for (; ; ) {
                  if (_.paths.has(k)) {
                    V = !0;
                    break;
                  }
                  const tt = k.lastIndexOf(".");
                  if (tt !== -1) {
                    const dt = k.substring(
                      0,
                      tt
                    );
                    if (!isNaN(
                      Number(k.substring(tt + 1))
                    ) && _.paths.has(dt)) {
                      V = !0;
                      break;
                    }
                    k = dt;
                  } else
                    k = "";
                  if (k === "")
                    break;
                }
                if (V) break;
              }
            if (!V && A.includes("deps") && _.depsFunction) {
              const M = _.depsFunction(N);
              let k = !1;
              typeof M == "boolean" ? M && (k = !0) : O(_.deps, M) || (_.deps = M, k = !0), k && (V = !0);
            }
            V && _.forceUpdate();
          }
        }
      }
      const lt = {
        timeStamp: Date.now(),
        stateKey: g,
        path: a,
        updateType: l.updateType,
        status: "new",
        oldValue: It,
        newValue: Et
      };
      if (Ct(g, (R) => {
        const x = [...R ?? [], lt].reduce((p, _) => {
          const V = `${_.stateKey}:${JSON.stringify(_.path)}`, A = p.get(V);
          return A ? (A.timeStamp = Math.max(A.timeStamp, _.timeStamp), A.newValue = _.newValue, A.oldValue = A.oldValue ?? _.oldValue, A.updateType = _.updateType) : p.set(V, { ..._ }), p;
        }, /* @__PURE__ */ new Map());
        return Array.from(x.values());
      }), jt(
        N,
        g,
        b.current,
        C
      ), h && h({
        updateLog: c,
        update: lt
      }), b.current?.serverSync) {
        const R = r.getState().serverState[g], $ = b.current?.serverSync;
        Pt(g, {
          syncKey: typeof $.syncKey == "string" ? $.syncKey : $.syncKey({ state: N }),
          rollBackState: R,
          actionTimeStamp: Date.now() + ($.debounce ?? 3e3),
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
      C
    )
  ), r.getState().cogsStateStore[g] || z(g, t), r.getState().initialStateGlobal[g] || it(g, t));
  const o = ht(() => Q(
    g,
    n,
    U.current,
    C
  ), [g]);
  return [yt(g), o];
}
function Q(t, i, v, S) {
  const u = /* @__PURE__ */ new Map();
  let h = 0;
  const E = (f) => {
    const e = f.join(".");
    for (const [y] of u)
      (y === e || y.startsWith(e + ".")) && u.delete(y);
    h++;
  }, m = {
    removeValidation: (f) => {
      f?.validationKey && L(f.validationKey);
    },
    revertToInitialState: (f) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && L(e?.key), f?.validationKey && L(f.validationKey);
      const y = r.getState().initialStateGlobal[t];
      r.getState().clearSelectedIndexesForState(t), u.clear(), h++;
      const P = s(y, []), T = J(t), C = q(T?.localStorage?.key) ? T?.localStorage?.key(y) : T?.localStorage?.key, F = `${S}-${t}-${C}`;
      F && localStorage.removeItem(F), X(t, P), z(t, y);
      const g = r.getState().stateComponents.get(t);
      return g && g.components.forEach((c) => {
        c.forceUpdate();
      }), y;
    },
    updateInitialState: (f) => {
      u.clear(), h++;
      const e = Q(
        t,
        i,
        v,
        S
      );
      return wt(() => {
        it(t, f), X(t, e), z(t, f);
        const y = r.getState().stateComponents.get(t);
        y && y.components.forEach((P) => {
          P.forceUpdate();
        });
      }), {
        fetchId: (y) => e.get()[y]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const f = r.getState().serverState[t];
      return !!(f && O(f, yt(t)));
    }
  };
  function s(f, e = [], y) {
    const P = e.map(String).join(".");
    u.get(P);
    const T = function() {
      return r().getNestedState(t, e);
    };
    Object.keys(m).forEach((g) => {
      T[g] = m[g];
    });
    const C = {
      apply(g, c, B) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${t}, path=${e.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(t, e);
      },
      get(g, c) {
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender") {
          const n = e.join("."), o = `${t}////${v}`, d = r.getState().stateComponents.get(t);
          if (d) {
            const a = d.components.get(o);
            a && (e.length > 0 || c === "get") && a.paths.add(n);
          }
        }
        if (c === "sync" && e.length === 0)
          return async function() {
            const n = r.getState().getInitialOptions(t), o = n?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const d = r.getState().getNestedState(t, []), a = n?.validation?.key;
            try {
              const l = await o.action(d);
              if (console.log("response", l), l && !l.success && l.validation_errors && a) {
                r.getState().removeValidationError(a), l.validation_errors.forEach((w) => {
                  const N = [a, ...w.path].join(".");
                  r.getState().addValidationError(N, w.message);
                });
                const I = r.getState().stateComponents.get(t);
                I && I.components.forEach((w) => {
                  w.forceUpdate();
                });
              }
              return l?.success && o.onSuccess ? o.onSuccess(l.data) : !l?.success && o.onError && o.onError(l.error), l;
            } catch (l) {
              return o.onError && o.onError(l), { success: !1, error: l };
            }
          };
        if (c === "_status") {
          const n = r.getState().getNestedState(t, e), o = r.getState().initialStateGlobal[t], d = W(o, e);
          return O(n, d) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const n = r().getNestedState(
              t,
              e
            ), o = r.getState().initialStateGlobal[t], d = W(o, e);
            return O(n, d) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[t], o = J(t), d = q(o?.localStorage?.key) ? o?.localStorage?.key(n) : o?.localStorage?.key, a = `${S}-${t}-${d}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (c === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(t)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(n.key + "." + e.join("."));
          };
        if (Array.isArray(f)) {
          if (c === "getSelected")
            return () => {
              const n = r.getState().getSelectedIndex(t, e.join("."));
              if (n !== void 0)
                return s(
                  f[n],
                  [...e, n.toString()],
                  y
                );
            };
          if (c === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(t, e.join(".")) ?? -1;
          if (c === "stateSort")
            return (n) => {
              const a = [...r.getState().getNestedState(t, e).map((l, I) => ({
                ...l,
                __origIndex: I.toString()
              }))].sort(n);
              return u.clear(), h++, s(a, e, {
                filtered: [...y?.filtered || [], e],
                validIndices: a.map(
                  (l) => parseInt(l.__origIndex)
                )
              });
            };
          if (c === "stateMap" || c === "stateMapNoRender")
            return (n) => {
              const o = y?.filtered?.some(
                (a) => a.join(".") === e.join(".")
              ), d = o ? f : r.getState().getNestedState(t, e);
              return c !== "stateMapNoRender" && (u.clear(), h++), d.map((a, l) => {
                const I = o && a.__origIndex ? a.__origIndex : l, w = s(
                  a,
                  [...e, I.toString()],
                  y
                );
                return n(
                  a,
                  w,
                  l,
                  f,
                  s(f, e, y)
                );
              });
            };
          if (c === "$stateMap")
            return (n) => K(Ft, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (c === "stateFlattenOn")
            return (n) => {
              const d = y?.filtered?.some(
                (l) => l.join(".") === e.join(".")
              ) ? f : r.getState().getNestedState(t, e);
              u.clear(), h++;
              const a = d.flatMap(
                (l, I) => l[n] ?? []
              );
              return s(
                a,
                [...e, "[*]", n],
                y
              );
            };
          if (c === "findWith")
            return (n, o) => {
              const d = f.findIndex((I) => I[n] === o);
              if (d === -1) return;
              const a = f[d], l = [...e, d.toString()];
              return u.clear(), h++, s(a, l);
            };
          if (c === "index")
            return (n) => {
              const o = f[n];
              return s(o, [...e, n.toString()]);
            };
          if (c === "last")
            return () => {
              const n = r.getState().getNestedState(t, e);
              if (n.length === 0) return;
              const o = n.length - 1, d = n[o], a = [...e, o.toString()];
              return s(d, a);
            };
          if (c === "insert")
            return (n) => (E(e), et(i, n, e, t), s(
              r.getState().getNestedState(t, e),
              e
            ));
          if (c === "uniqueInsert")
            return (n, o, d) => {
              const a = r.getState().getNestedState(t, e), l = q(n) ? n(a) : n;
              let I = null;
              if (!a.some((N) => {
                if (o) {
                  const j = o.every(
                    (D) => O(N[D], l[D])
                  );
                  return j && (I = N), j;
                }
                const G = O(N, l);
                return G && (I = N), G;
              }))
                E(e), et(i, l, e, t);
              else if (d && I) {
                const N = d(I), G = a.map(
                  (j) => O(j, I) ? N : j
                );
                E(e), Z(i, G, e);
              }
            };
          if (c === "cut")
            return (n, o) => {
              o?.waitForSync || (E(e), H(i, e, t, n));
            };
          if (c === "cutByValue")
            return (n) => {
              for (let o = 0; o < f.length; o++)
                f[o] === n && H(i, e, t, o);
            };
          if (c === "toggleByValue")
            return (n) => {
              const o = f.findIndex((d) => d === n);
              o > -1 ? H(i, e, t, o) : et(i, n, e, t);
            };
          if (c === "stateFilter")
            return (n) => {
              const o = f.map((l, I) => ({
                ...l,
                __origIndex: I.toString()
              })), d = [], a = [];
              for (let l = 0; l < o.length; l++)
                n(o[l], l) && (d.push(l), a.push(o[l]));
              return u.clear(), h++, s(a, e, {
                filtered: [...y?.filtered || [], e],
                validIndices: d
                // Always pass validIndices, even if empty
              });
            };
        }
        const B = e[e.length - 1];
        if (!isNaN(Number(B))) {
          const n = e.slice(0, -1), o = r.getState().getNestedState(t, n);
          if (Array.isArray(o) && c === "cut")
            return () => H(
              i,
              n,
              t,
              Number(B)
            );
        }
        if (c === "get")
          return () => r.getState().getNestedState(t, e);
        if (c === "$derive")
          return (n) => nt({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (c === "$derive")
          return (n) => nt({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (c === "$get")
          return () => nt({
            _stateKey: t,
            _path: e
          });
        if (c === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (c == "getLocalStorage")
          return (n) => vt(S + "-" + t + "-" + n);
        if (c === "_selected") {
          const n = e.slice(0, -1), o = n.join("."), d = r.getState().getNestedState(t, n);
          return Array.isArray(d) ? Number(e[e.length - 1]) === r.getState().getSelectedIndex(t, o) : void 0;
        }
        if (c === "setSelected")
          return (n) => {
            const o = e.slice(0, -1), d = Number(e[e.length - 1]), a = o.join(".");
            n ? r.getState().setSelectedIndex(t, a, d) : r.getState().setSelectedIndex(t, a, void 0);
            const l = r.getState().getNestedState(t, [...o]);
            Z(i, l, o), E(o);
          };
        if (e.length == 0) {
          if (c === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(t)?.validation, o = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              L(n.key);
              const d = r.getState().cogsStateStore[t];
              try {
                const a = r.getState().getValidationErrors(n.key);
                a && a.length > 0 && a.forEach(([I]) => {
                  I && I.startsWith(n.key) && L(I);
                });
                const l = n.zodSchema.safeParse(d);
                return l.success ? !0 : (l.error.errors.forEach((w) => {
                  const N = w.path, G = w.message, j = [n.key, ...N].join(".");
                  o(j, G);
                }), st(t), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (c === "_componentId") return v;
          if (c === "getComponents")
            return () => r().stateComponents.get(t);
          if (c === "getAllFormRefs")
            return () => ft.getState().getFormRefsByStateKey(t);
          if (c === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (c === "_serverState")
            return r.getState().serverState[t];
          if (c === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (c === "revertToInitialState")
            return m.revertToInitialState;
          if (c === "updateInitialState") return m.updateInitialState;
          if (c === "removeValidation") return m.removeValidation;
        }
        if (c === "getFormRef")
          return () => ft.getState().getFormRef(t + "." + e.join("."));
        if (c === "validationWrapper")
          return ({
            children: n,
            hideMessage: o
          }) => /* @__PURE__ */ ut(
            Tt,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: y?.validIndices,
              children: n
            }
          );
        if (c === "_stateKey") return t;
        if (c === "_path") return e;
        if (c === "_isServerSynced") return m._isServerSynced;
        if (c === "update")
          return (n, o) => {
            if (o?.debounce)
              At(() => {
                Z(i, n, e, "");
                const d = r.getState().getNestedState(t, e);
                o?.afterUpdate && o.afterUpdate(d);
              }, o.debounce);
            else {
              Z(i, n, e, "");
              const d = r.getState().getNestedState(t, e);
              o?.afterUpdate && o.afterUpdate(d);
            }
            E(e);
          };
        if (c === "formElement")
          return (n, o) => /* @__PURE__ */ ut(
            Vt,
            {
              setState: i,
              stateKey: t,
              path: e,
              child: n,
              formOpts: o
            }
          );
        const U = [...e, c], b = r.getState().getNestedState(t, U);
        return s(b, U, y);
      }
    }, F = new Proxy(T, C);
    return u.set(P, {
      proxy: F,
      stateVersion: h
    }), F;
  }
  return s(
    r.getState().getNestedState(t, [])
  );
}
function nt(t) {
  return K(Rt, { proxy: t });
}
function Ft({
  proxy: t,
  rebuildStateShape: i
}) {
  const v = r().getNestedState(t._stateKey, t._path);
  return Array.isArray(v) ? i(
    v,
    t._path
  ).stateMapNoRender(
    (u, h, E, m, s) => t._mapFn(u, h, E, m, s)
  ) : null;
}
function Rt({
  proxy: t
}) {
  const i = Y(null), v = `${t._stateKey}-${t._path.join(".")}`;
  return at(() => {
    const S = i.current;
    if (!S || !S.parentElement) return;
    const u = S.parentElement, E = Array.from(u.childNodes).indexOf(S);
    let m = u.getAttribute("data-parent-id");
    m || (m = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", m));
    const f = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: m,
      position: E,
      effect: t._effect
    };
    r.getState().addSignalElement(v, f);
    const e = r.getState().getNestedState(t._stateKey, t._path);
    let y;
    if (t._effect)
      try {
        y = new Function(
          "state",
          `return (${t._effect})(state)`
        )(e);
      } catch (T) {
        console.error("Error evaluating effect function during mount:", T), y = e;
      }
    else
      y = e;
    y !== null && typeof y == "object" && (y = JSON.stringify(y));
    const P = document.createTextNode(String(y));
    S.replaceWith(P);
  }, [t._stateKey, t._path.join("."), t._effect]), K("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": v
  });
}
function Yt(t) {
  const i = Nt(
    (v) => {
      const S = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return S.components.set(t._stateKey, {
        forceUpdate: v,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => S.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return K("text", {}, String(i));
}
export {
  nt as $cogsSignal,
  Yt as $cogsSignalStore,
  Jt as addStateOptions,
  Zt as createCogsState,
  Ht as notifyComponent,
  Ot as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
