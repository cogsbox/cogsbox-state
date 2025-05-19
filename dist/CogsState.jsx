"use client";
import { jsx as ue } from "react/jsx-runtime";
import { useState as re, useRef as Y, useEffect as ae, useLayoutEffect as _e, useMemo as he, createElement as K, useSyncExternalStore as Ne, startTransition as we } from "react";
import { transformStateFunc as $e, isFunction as q, isDeepEqual as F, getDifferences as ge, getNestedValue as W, debounce as Ae } from "./utility.js";
import { pushFunc as te, updateFn as Z, cutFunc as H, ValidationWrapper as Te, FormControlComponent as Ve } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as fe } from "./store.js";
import { useCogsConfig as be } from "./CogsStateClient.jsx";
import oe from "./node_modules/uuid/dist/esm-browser/v4.js";
function Se(e, i) {
  const v = r.getState().getInitialOptions, S = r.getState().setInitialStateOptions, u = v(e) || {};
  S(e, {
    ...u,
    ...i
  });
}
function me({
  stateKey: e,
  options: i,
  initialOptionsPart: v
}) {
  const S = J(e) || {}, u = v[e] || {}, h = r.getState().setInitialStateOptions, E = { ...u, ...S };
  let m = !1;
  if (i)
    for (const s in i)
      E.hasOwnProperty(s) ? (s == "localStorage" && i[s] && E[s].key !== i[s]?.key && (m = !0, E[s] = i[s]), s == "initialState" && i[s] && E[s] !== i[s] && // Different references
      !F(E[s], i[s]) && (m = !0, E[s] = i[s])) : (m = !0, E[s] = i[s]);
  m && h(e, E);
}
function Je(e, { formElements: i, validation: v }) {
  return { initialState: e, formElements: i, validation: v };
}
const Ze = (e, i) => {
  let v = e;
  const [S, u] = $e(v);
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
    const [f] = re(s?.componentId ?? oe());
    if (s && typeof s.initialState < "u" && q(s.initialState)) {
      const C = r.getState().cogsStateStore[m] || S[m], p = s.initialState(
        C
      );
      s = {
        ...s,
        initialState: p
      };
    }
    me({
      stateKey: m,
      options: s,
      initialOptionsPart: u
    });
    const t = r.getState().cogsStateStore[m] || S[m], y = s?.modifyState ? s.modifyState(t) : t, [P, T] = Fe(
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
    me({ stateKey: m, options: s, initialOptionsPart: u }), se(m);
  }
  return { useCogsState: h, setCogsOptions: E };
}, {
  setUpdaterState: X,
  setState: z,
  getInitialOptions: J,
  getKeyState: ye,
  getValidationErrors: ke,
  setStateLog: Ce,
  updateInitialStateGlobal: ie,
  addValidationError: xe,
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
}, je = (e, i, v, S) => {
  v?.log && console.log(
    "saving to localstorage",
    i,
    v.localStorage?.key,
    S
  );
  const u = q(v?.localStorage?.key) ? v.localStorage?.key(e) : v?.localStorage?.key;
  if (u && S) {
    const h = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, E = `${S}-${i}-${u}`;
    window.localStorage.setItem(E, JSON.stringify(h));
  }
}, Oe = (e, i, v, S, u, h) => {
  const E = {
    initialState: i,
    updaterState: Q(
      e,
      S,
      u,
      h
    ),
    state: v
  };
  ie(e, E.initialState), X(e, E.updaterState), z(e, E.state);
}, se = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const v = /* @__PURE__ */ new Set();
  i.components.forEach((S) => {
    (S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : null)?.includes("none") || v.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    v.forEach((S) => S());
  });
}, He = (e, i) => {
  const v = r.getState().stateComponents.get(e);
  if (v) {
    const S = `${e}////${i}`, u = v.components.get(S);
    if ((u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none"))
      return;
    u && u.forceUpdate();
  }
};
function Fe(e, {
  stateKey: i,
  serverSync: v,
  localStorage: S,
  formElements: u,
  middleware: h,
  reactiveDeps: E,
  reactiveType: m,
  componentId: s,
  initialState: f,
  syncUpdate: t,
  dependencies: y
} = {}) {
  const [P, T] = re({}), { sessionId: C } = be();
  let p = !i;
  const [g] = re(i ?? oe()), c = r.getState().stateLog[g], B = Y(/* @__PURE__ */ new Set()), U = Y(s ?? oe()), b = Y(null);
  b.current = J(g), ae(() => {
    if (t && t.stateKey === g && t.path?.[0]) {
      z(g, (a) => ({
        ...a,
        [t.path[0]]: t.newValue
      }));
      const d = `${t.stateKey}:${t.path.join(".")}`;
      r.getState().setSyncInfo(d, {
        timeStamp: t.timeStamp,
        userId: t.userId
      });
    }
  }, [t]), ae(() => {
    if (f) {
      Se(g, {
        initialState: f
      });
      const d = b.current;
      let a = null;
      const l = q(d?.localStorage?.key) ? d?.localStorage?.key(f) : d?.localStorage?.key;
      l && C && (a = ve(
        C + "-" + g + "-" + l
      ));
      const I = r.getState().initialStateGlobal[g];
      if (console.log(
        "currentGloballyStoredInitialState",
        I,
        f,
        F(I, f)
      ), I && !F(I, f) || !I) {
        let w = f;
        a && a.lastUpdated > (a.lastSyncedWithServer || 0) && (w = a.state, d?.localStorage?.onChange && d?.localStorage?.onChange(w)), Oe(
          g,
          f,
          w,
          n,
          U.current,
          C
        ), se(g), (Array.isArray(m) ? m : [m || "component"]).includes("none") || T({});
      }
    }
  }, [f, ...y || []]), _e(() => {
    p && Se(g, {
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
      const N = q(d) ? d(w) : d, G = ge(w, N);
      new Set(G);
      const j = `${g}-${a.join(".")}`;
      if (j) {
        let R = !1, $ = r.getState().signalDomElements.get(j);
        if ((!$ || $.size === 0) && (l.updateType === "insert" || l.updateType === "cut")) {
          const x = a.slice(0, -1), O = W(N, x);
          if (Array.isArray(O)) {
            R = !0;
            const _ = `${g}-${x.join(".")}`;
            $ = r.getState().signalDomElements.get(_);
          }
        }
        if ($) {
          const x = R ? W(N, a.slice(0, -1)) : W(N, a);
          $.forEach(({ parentId: O, position: _, effect: V }) => {
            const A = document.querySelector(
              `[data-parent-id="${O}"]`
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
      ), l.updateType === "insert" && b.current?.validationKey && ke(
        b.current?.validationKey + "." + D.join(".")
      ).filter(([$, x]) => {
        let O = $?.split(".").length;
        if ($ == D.join(".") && O == D.length - 1) {
          let _ = $ + "." + D;
          L($), xe(_, x);
        }
      });
      const Ie = W(w, a), Ee = W(N, a);
      l.updateType === "update" ? a.join(".") : [...a].slice(0, -1).join(".");
      const ce = r.getState().stateComponents.get(g);
      if (ce) {
        const R = ge(w, N), $ = new Set(R), x = l.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          O,
          _
        ] of ce.components.entries()) {
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
                  const ee = k.lastIndexOf(".");
                  if (ee !== -1) {
                    const de = k.substring(
                      0,
                      ee
                    );
                    if (!isNaN(
                      Number(k.substring(ee + 1))
                    ) && _.paths.has(de)) {
                      V = !0;
                      break;
                    }
                    k = de;
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
              typeof M == "boolean" ? M && (k = !0) : F(_.deps, M) || (_.deps = M, k = !0), k && (V = !0);
            }
            V && _.forceUpdate();
          }
        }
      }
      const le = {
        timeStamp: Date.now(),
        stateKey: g,
        path: a,
        updateType: l.updateType,
        status: "new",
        oldValue: Ie,
        newValue: Ee
      };
      if (Ce(g, (R) => {
        const x = [...R ?? [], le].reduce((O, _) => {
          const V = `${_.stateKey}:${JSON.stringify(_.path)}`, A = O.get(V);
          return A ? (A.timeStamp = Math.max(A.timeStamp, _.timeStamp), A.newValue = _.newValue, A.oldValue = A.oldValue ?? _.oldValue, A.updateType = _.updateType) : O.set(V, { ..._ }), O;
        }, /* @__PURE__ */ new Map());
        return Array.from(x.values());
      }), je(
        N,
        g,
        b.current,
        C
      ), h && h({
        updateLog: c,
        update: le
      }), b.current?.serverSync) {
        const R = r.getState().serverState[g], $ = b.current?.serverSync;
        Pe(g, {
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
  ), r.getState().cogsStateStore[g] || z(g, e), r.getState().initialStateGlobal[g] || ie(g, e));
  const o = he(() => Q(
    g,
    n,
    U.current,
    C
  ), [g]);
  return [ye(g), o];
}
function Q(e, i, v, S) {
  const u = /* @__PURE__ */ new Map();
  let h = 0;
  const E = (f) => {
    const t = f.join(".");
    for (const [y] of u)
      (y === t || y.startsWith(t + ".")) && u.delete(y);
    h++;
  }, m = {
    removeValidation: (f) => {
      f?.validationKey && L(f.validationKey);
    },
    revertToInitialState: (f) => {
      const t = r.getState().getInitialOptions(e)?.validation;
      t?.key && L(t?.key), f?.validationKey && L(f.validationKey);
      const y = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), u.clear(), h++;
      const P = s(y, []), T = J(e), C = q(T?.localStorage?.key) ? T?.localStorage?.key(y) : T?.localStorage?.key, p = `${S}-${e}-${C}`;
      p && localStorage.removeItem(p), X(e, P), z(e, y);
      const g = r.getState().stateComponents.get(e);
      return g && g.components.forEach((c) => {
        c.forceUpdate();
      }), y;
    },
    updateInitialState: (f) => {
      u.clear(), h++;
      const t = Q(
        e,
        i,
        v,
        S
      );
      return we(() => {
        ie(e, f), X(e, t), z(e, f);
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
    u.get(P);
    const T = function() {
      return r().getNestedState(e, t);
    };
    Object.keys(m).forEach((g) => {
      T[g] = m[g];
    });
    const C = {
      apply(g, c, B) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, t);
      },
      get(g, c) {
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender") {
          const n = t.join("."), o = `${e}////${v}`, d = r.getState().stateComponents.get(e);
          if (d) {
            const a = d.components.get(o);
            a && (t.length > 0 || c === "get") && a.paths.add(n);
          }
        }
        if (c === "sync" && t.length === 0)
          return async function() {
            const n = r.getState().getInitialOptions(e), o = n?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const d = r.getState().getNestedState(e, []), a = n?.validation?.key;
            try {
              const l = await o.action(d);
              if (l && !l.success && l.errors && a) {
                r.getState().removeValidationError(a), l.errors.forEach((w) => {
                  const N = [a, ...w.path].join(".");
                  r.getState().addValidationError(N, w.message);
                });
                const I = r.getState().stateComponents.get(e);
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
          const n = r.getState().getNestedState(e, t), o = r.getState().initialStateGlobal[e], d = W(o, t);
          return F(n, d) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const n = r().getNestedState(
              e,
              t
            ), o = r.getState().initialStateGlobal[e], d = W(o, t);
            return F(n, d) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[e], o = J(e), d = q(o?.localStorage?.key) ? o?.localStorage?.key(n) : o?.localStorage?.key, a = `${S}-${e}-${d}`;
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
          if (c === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: e, path: t });
            };
          if (c === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(e, t.join(".")) ?? -1;
          if (c === "stateSort")
            return (n) => {
              const a = [...r.getState().getNestedState(e, t).map((l, I) => ({
                ...l,
                __origIndex: I.toString()
              }))].sort(n);
              return u.clear(), h++, s(a, t, {
                filtered: [...y?.filtered || [], t],
                validIndices: a.map(
                  (l) => parseInt(l.__origIndex)
                )
              });
            };
          if (c === "stateMap" || c === "stateMapNoRender")
            return (n) => {
              const o = y?.filtered?.some(
                (a) => a.join(".") === t.join(".")
              ), d = o ? f : r.getState().getNestedState(e, t);
              return c !== "stateMapNoRender" && (u.clear(), h++), d.map((a, l) => {
                const I = o && a.__origIndex ? a.__origIndex : l, w = s(
                  a,
                  [...t, I.toString()],
                  y
                );
                return n(
                  a,
                  w,
                  l,
                  f,
                  s(f, t, y)
                );
              });
            };
          if (c === "$stateMap")
            return (n) => K(pe, {
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
              const d = y?.filtered?.some(
                (l) => l.join(".") === t.join(".")
              ) ? f : r.getState().getNestedState(e, t);
              u.clear(), h++;
              const a = d.flatMap(
                (l, I) => l[n] ?? []
              );
              return s(
                a,
                [...t, "[*]", n],
                y
              );
            };
          if (c === "findWith")
            return (n, o) => {
              const d = f.findIndex((I) => I[n] === o);
              if (d === -1) return;
              const a = f[d], l = [...t, d.toString()];
              return u.clear(), h++, s(a, l);
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
              const o = n.length - 1, d = n[o], a = [...t, o.toString()];
              return s(d, a);
            };
          if (c === "insert")
            return (n) => (E(t), te(i, n, t, e), s(
              r.getState().getNestedState(e, t),
              t
            ));
          if (c === "uniqueInsert")
            return (n, o, d) => {
              const a = r.getState().getNestedState(e, t), l = q(n) ? n(a) : n;
              let I = null;
              if (!a.some((N) => {
                if (o) {
                  const j = o.every(
                    (D) => F(N[D], l[D])
                  );
                  return j && (I = N), j;
                }
                const G = F(N, l);
                return G && (I = N), G;
              }))
                E(t), te(i, l, t, e);
              else if (d && I) {
                const N = d(I), G = a.map(
                  (j) => F(j, I) ? N : j
                );
                E(t), Z(i, G, t);
              }
            };
          if (c === "cut")
            return (n, o) => {
              o?.waitForSync || (E(t), H(i, t, e, n));
            };
          if (c === "cutByValue")
            return (n) => {
              for (let o = 0; o < f.length; o++)
                f[o] === n && H(i, t, e, o);
            };
          if (c === "toggleByValue")
            return (n) => {
              const o = f.findIndex((d) => d === n);
              o > -1 ? H(i, t, e, o) : te(i, n, t, e);
            };
          if (c === "stateFilter")
            return (n) => {
              const o = f.map((l, I) => ({
                ...l,
                __origIndex: I.toString()
              })), d = [], a = [];
              for (let l = 0; l < o.length; l++)
                n(o[l], l) && (d.push(l), a.push(o[l]));
              return u.clear(), h++, s(a, t, {
                filtered: [...y?.filtered || [], t],
                validIndices: d
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
          return (n) => ne({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (c === "$derive")
          return (n) => ne({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (c === "$get")
          return () => ne({
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
          const n = t.slice(0, -1), o = n.join("."), d = r.getState().getNestedState(e, n);
          return Array.isArray(d) ? Number(t[t.length - 1]) === r.getState().getSelectedIndex(e, o) : void 0;
        }
        if (c === "setSelected")
          return (n) => {
            const o = t.slice(0, -1), d = Number(t[t.length - 1]), a = o.join(".");
            n ? r.getState().setSelectedIndex(e, a, d) : r.getState().setSelectedIndex(e, a, void 0);
            const l = r.getState().getNestedState(e, [...o]);
            Z(i, l, o), E(o);
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
              const d = r.getState().cogsStateStore[e];
              try {
                const a = r.getState().getValidationErrors(n.key);
                a && a.length > 0 && a.forEach(([I]) => {
                  I && I.startsWith(n.key) && L(I);
                });
                const l = n.zodSchema.safeParse(d);
                return l.success ? !0 : (l.error.errors.forEach((w) => {
                  const N = w.path, G = w.message, j = [n.key, ...N].join(".");
                  o(j, G);
                }), se(e), !1);
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
            Te,
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
              Ae(() => {
                Z(i, n, t, "");
                const d = r.getState().getNestedState(e, t);
                o?.afterUpdate && o.afterUpdate(d);
              }, o.debounce);
            else {
              Z(i, n, t, "");
              const d = r.getState().getNestedState(e, t);
              o?.afterUpdate && o.afterUpdate(d);
            }
            E(t);
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
        const U = [...t, c], b = r.getState().getNestedState(e, U);
        return s(b, U, y);
      }
    }, p = new Proxy(T, C);
    return u.set(P, {
      proxy: p,
      stateVersion: h
    }), p;
  }
  return s(
    r.getState().getNestedState(e, [])
  );
}
function ne(e) {
  return K(Re, { proxy: e });
}
function pe({
  proxy: e,
  rebuildStateShape: i
}) {
  const v = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(v) ? i(
    v,
    e._path
  ).stateMapNoRender(
    (u, h, E, m, s) => e._mapFn(u, h, E, m, s)
  ) : null;
}
function Re({
  proxy: e
}) {
  const i = Y(null), v = `${e._stateKey}-${e._path.join(".")}`;
  return ae(() => {
    const S = i.current;
    if (!S || !S.parentElement) return;
    const u = S.parentElement, E = Array.from(u.childNodes).indexOf(S);
    let m = u.getAttribute("data-parent-id");
    m || (m = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", m));
    const f = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: m,
      position: E,
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
function Ye(e) {
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
  ne as $cogsSignal,
  Ye as $cogsSignalStore,
  Je as addStateOptions,
  Ze as createCogsState,
  He as notifyComponent,
  Fe as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
