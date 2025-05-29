"use client";
import { jsx as ue } from "react/jsx-runtime";
import { useState as re, useRef as Y, useEffect as ae, useLayoutEffect as _e, useMemo as Ne, createElement as K, useSyncExternalStore as we, startTransition as $e } from "react";
import { transformStateFunc as he, isFunction as W, isDeepEqual as F, getNestedValue as L, getDifferences as me, debounce as Ae } from "./utility.js";
import { pushFunc as te, updateFn as B, cutFunc as H, ValidationWrapper as Ve, FormControlComponent as Te } from "./Functions.jsx";
import ye from "./node_modules/superjson/dist/index.js";
import "zod";
import { getGlobalStore as r, formRefStore as ge } from "./store.js";
import { useCogsConfig as xe } from "./CogsStateClient.jsx";
import oe from "./node_modules/uuid/dist/esm-browser/v4.js";
function fe(e, i) {
  const v = r.getState().getInitialOptions, S = r.getState().setInitialStateOptions, u = v(e) || {};
  S(e, {
    ...u,
    ...i
  });
}
function Se({
  stateKey: e,
  options: i,
  initialOptionsPart: v
}) {
  const S = J(e) || {}, u = v[e] || {}, N = r.getState().setInitialStateOptions, E = { ...u, ...S };
  let m = !1;
  if (i)
    for (const c in i)
      E.hasOwnProperty(c) ? (c == "localStorage" && i[c] && E[c].key !== i[c]?.key && (m = !0, E[c] = i[c]), c == "initialState" && i[c] && E[c] !== i[c] && // Different references
      !F(E[c], i[c]) && (m = !0, E[c] = i[c])) : (m = !0, E[c] = i[c]);
  m && N(e, E);
}
function Ze(e, { formElements: i, validation: v }) {
  return { initialState: e, formElements: i, validation: v };
}
const He = (e, i) => {
  let v = e;
  const [S, u] = he(v);
  (Object.keys(u).length > 0 || i && Object.keys(i).length > 0) && Object.keys(u).forEach((m) => {
    u[m] = u[m] || {}, u[m].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...u[m].formElements || {}
      // State-specific overrides
    }, J(m) || r.getState().setInitialStateOptions(m, u[m]);
  }), r.getState().setInitialStates(S), r.getState().setCreatedState(S);
  const N = (m, c) => {
    const [f] = re(c?.componentId ?? oe());
    if (c && typeof c.initialState < "u" && W(c.initialState)) {
      const C = r.getState().cogsStateStore[m] || S[m], p = c.initialState(
        C
      );
      c = {
        ...c,
        initialState: p
      };
    }
    Se({
      stateKey: m,
      options: c,
      initialOptionsPart: u
    });
    const t = r.getState().cogsStateStore[m] || S[m], y = c?.modifyState ? c.modifyState(t) : t, [j, V] = Fe(
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
    return V;
  };
  function E(m, c) {
    Se({ stateKey: m, options: c, initialOptionsPart: u }), se(m);
  }
  return { useCogsState: N, setCogsOptions: E };
}, {
  setUpdaterState: X,
  setState: q,
  getInitialOptions: J,
  getKeyState: ve,
  getValidationErrors: be,
  setStateLog: ke,
  updateInitialStateGlobal: ie,
  addValidationError: Ce,
  removeValidationError: D,
  setServerSyncActions: Pe
} = r.getState(), Ie = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? ye.parse(i) : null;
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
  const u = W(v?.localStorage?.key) ? v.localStorage?.key(e) : v?.localStorage?.key;
  if (u && S) {
    const N = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, E = `${S}-${i}-${u}`;
    window.localStorage.setItem(E, ye.stringify(N));
  }
}, Oe = (e, i, v, S, u, N) => {
  const E = {
    initialState: i,
    updaterState: Q(
      e,
      S,
      u,
      N
    ),
    state: v
  };
  ie(e, E.initialState), X(e, E.updaterState), q(e, E.state);
}, se = (e) => {
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
  middleware: N,
  reactiveDeps: E,
  reactiveType: m,
  componentId: c,
  initialState: f,
  syncUpdate: t,
  dependencies: y
} = {}) {
  const [j, V] = re({}), { sessionId: C } = xe();
  let p = !i;
  const [g] = re(i ?? oe()), s = r.getState().stateLog[g], z = Y(/* @__PURE__ */ new Set()), G = Y(c ?? oe()), x = Y(null);
  x.current = J(g), ae(() => {
    if (t && t.stateKey === g && t.path?.[0]) {
      q(g, (a) => ({
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
      fe(g, {
        initialState: f
      });
      const d = x.current;
      let a = null;
      const l = W(d?.localStorage?.key) ? d?.localStorage?.key(f) : d?.localStorage?.key;
      l && C && (a = Ie(
        C + "-" + g + "-" + l
      ));
      const I = r.getState().initialStateGlobal[g];
      if (console.log(
        "currentGloballyStoredInitialState",
        I,
        f,
        F(I, f)
      ), I && !F(I, f) || !I) {
        let $ = f;
        a && a.lastUpdated > (a.lastSyncedWithServer || 0) && ($ = a.state, d?.localStorage?.onChange && d?.localStorage?.onChange($)), Oe(
          g,
          f,
          $,
          n,
          G.current,
          C
        ), se(g), (Array.isArray(m) ? m : [m || "component"]).includes("none") || V({});
      }
    }
  }, [f, ...y || []]), _e(() => {
    p && fe(g, {
      serverSync: v,
      formElements: u,
      initialState: f,
      localStorage: S,
      middleware: N
    });
    const d = `${g}////${G.current}`, a = r.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(d, {
      forceUpdate: () => V({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0,
      reactiveType: m ?? ["component", "deps"]
    }), r.getState().stateComponents.set(g, a), V({}), () => {
      const l = `${g}////${G.current}`;
      a && (a.components.delete(l), a.components.size === 0 && r.getState().stateComponents.delete(g));
    };
  }, []);
  const n = (d, a, l, I) => {
    if (Array.isArray(a)) {
      const $ = `${g}-${a.join(".")}`;
      z.current.add($);
    }
    q(g, ($) => {
      const w = W(d) ? d($) : d, R = `${g}-${a.join(".")}`;
      if (R) {
        let M = !1, h = r.getState().signalDomElements.get(R);
        if ((!h || h.size === 0) && (l.updateType === "insert" || l.updateType === "cut")) {
          const P = a.slice(0, -1), O = L(w, P);
          if (Array.isArray(O)) {
            M = !0;
            const _ = `${g}-${P.join(".")}`;
            h = r.getState().signalDomElements.get(_);
          }
        }
        if (h) {
          const P = M ? L(w, a.slice(0, -1)) : L(w, a);
          h.forEach(({ parentId: O, position: _, effect: T }) => {
            const A = document.querySelector(
              `[data-parent-id="${O}"]`
            );
            if (A) {
              const U = Array.from(A.childNodes);
              if (U[_]) {
                const k = T ? new Function("state", `return (${T})(state)`)(P) : P;
                U[_].textContent = String(k);
              }
            }
          });
        }
      }
      l.updateType === "update" && (I || x.current?.validationKey) && a && D(
        (I || x.current?.validationKey) + "." + a.join(".")
      );
      const b = a.slice(0, a.length - 1);
      l.updateType === "cut" && x.current?.validationKey && D(
        x.current?.validationKey + "." + b.join(".")
      ), l.updateType === "insert" && x.current?.validationKey && be(
        x.current?.validationKey + "." + b.join(".")
      ).filter(([h, P]) => {
        let O = h?.split(".").length;
        if (h == b.join(".") && O == b.length - 1) {
          let _ = h + "." + b;
          D(h), Ce(_, P);
        }
      });
      const Z = L($, a), Ee = L(w, a);
      l.updateType === "update" ? a.join(".") : [...a].slice(0, -1).join(".");
      const ce = r.getState().stateComponents.get(g);
      if (ce) {
        const M = me($, w), h = new Set(M), P = l.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          O,
          _
        ] of ce.components.entries()) {
          let T = !1;
          const A = Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"];
          if (!A.includes("none")) {
            if (A.includes("all")) {
              _.forceUpdate();
              continue;
            }
            if (A.includes("component") && ((_.paths.has(P) || _.paths.has("")) && (T = !0), !T))
              for (const U of h) {
                let k = U;
                for (; ; ) {
                  if (_.paths.has(k)) {
                    T = !0;
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
            if (!T && A.includes("deps") && _.depsFunction) {
              const U = _.depsFunction(w);
              let k = !1;
              typeof U == "boolean" ? U && (k = !0) : F(_.deps, U) || (_.deps = U, k = !0), k && (T = !0);
            }
            T && _.forceUpdate();
          }
        }
      }
      const le = {
        timeStamp: Date.now(),
        stateKey: g,
        path: a,
        updateType: l.updateType,
        status: "new",
        oldValue: Z,
        newValue: Ee
      };
      if (ke(g, (M) => {
        const P = [...M ?? [], le].reduce((O, _) => {
          const T = `${_.stateKey}:${JSON.stringify(_.path)}`, A = O.get(T);
          return A ? (A.timeStamp = Math.max(A.timeStamp, _.timeStamp), A.newValue = _.newValue, A.oldValue = A.oldValue ?? _.oldValue, A.updateType = _.updateType) : O.set(T, { ..._ }), O;
        }, /* @__PURE__ */ new Map());
        return Array.from(P.values());
      }), je(
        w,
        g,
        x.current,
        C
      ), N && N({
        updateLog: s,
        update: le
      }), x.current?.serverSync) {
        const M = r.getState().serverState[g], h = x.current?.serverSync;
        Pe(g, {
          syncKey: typeof h.syncKey == "string" ? h.syncKey : h.syncKey({ state: w }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (h.debounce ?? 3e3),
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
      G.current,
      C
    )
  ), r.getState().cogsStateStore[g] || q(g, e), r.getState().initialStateGlobal[g] || ie(g, e));
  const o = Ne(() => Q(
    g,
    n,
    G.current,
    C
  ), [g]);
  return [ve(g), o];
}
function Q(e, i, v, S) {
  const u = /* @__PURE__ */ new Map();
  let N = 0;
  const E = (f) => {
    const t = f.join(".");
    for (const [y] of u)
      (y === t || y.startsWith(t + ".")) && u.delete(y);
    N++;
  }, m = {
    removeValidation: (f) => {
      f?.validationKey && D(f.validationKey);
    },
    revertToInitialState: (f) => {
      const t = r.getState().getInitialOptions(e)?.validation;
      t?.key && D(t?.key), f?.validationKey && D(f.validationKey);
      const y = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), u.clear(), N++;
      const j = c(y, []), V = J(e), C = W(V?.localStorage?.key) ? V?.localStorage?.key(y) : V?.localStorage?.key, p = `${S}-${e}-${C}`;
      p && localStorage.removeItem(p), X(e, j), q(e, y);
      const g = r.getState().stateComponents.get(e);
      return g && g.components.forEach((s) => {
        s.forceUpdate();
      }), y;
    },
    updateInitialState: (f) => {
      u.clear(), N++;
      const t = Q(
        e,
        i,
        v,
        S
      );
      return $e(() => {
        ie(e, f), X(e, t), q(e, f);
        const y = r.getState().stateComponents.get(e);
        y && y.components.forEach((j) => {
          j.forceUpdate();
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
      return !!(f && F(f, ve(e)));
    }
  };
  function c(f, t = [], y) {
    const j = t.map(String).join(".");
    u.get(j);
    const V = function() {
      return r().getNestedState(e, t);
    };
    Object.keys(m).forEach((g) => {
      V[g] = m[g];
    });
    const C = {
      apply(g, s, z) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, t);
      },
      get(g, s) {
        if (s !== "then" && !s.startsWith("$") && s !== "stateMapNoRender") {
          const n = t.join("."), o = `${e}////${v}`, d = r.getState().stateComponents.get(e);
          if (d) {
            const a = d.components.get(o);
            a && (t.length > 0 || s === "get") && a.paths.add(n);
          }
        }
        if (s === "getDifferences")
          return () => me(
            r.getState().cogsStateStore[e],
            r.getState().initialStateGlobal[e]
          );
        if (s === "sync" && t.length === 0)
          return async function() {
            const n = r.getState().getInitialOptions(e), o = n?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const d = r.getState().getNestedState(e, []), a = n?.validation?.key;
            try {
              const l = await o.action(d);
              if (l && !l.success && l.errors && a) {
                r.getState().removeValidationError(a), l.errors.forEach(($) => {
                  const w = [a, ...$.path].join(".");
                  r.getState().addValidationError(w, $.message);
                });
                const I = r.getState().stateComponents.get(e);
                I && I.components.forEach(($) => {
                  $.forceUpdate();
                });
              }
              return l?.success && o.onSuccess ? o.onSuccess(l.data) : !l?.success && o.onError && o.onError(l.error), l;
            } catch (l) {
              return o.onError && o.onError(l), { success: !1, error: l };
            }
          };
        if (s === "_status") {
          const n = r.getState().getNestedState(e, t), o = r.getState().initialStateGlobal[e], d = L(o, t);
          return F(n, d) ? "fresh" : "stale";
        }
        if (s === "getStatus")
          return function() {
            const n = r().getNestedState(
              e,
              t
            ), o = r.getState().initialStateGlobal[e], d = L(o, t);
            return F(n, d) ? "fresh" : "stale";
          };
        if (s === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[e], o = J(e), d = W(o?.localStorage?.key) ? o?.localStorage?.key(n) : o?.localStorage?.key, a = `${S}-${e}-${d}`;
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
          if (s === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: e, path: t });
            };
          if (s === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(e, t.join(".")) ?? -1;
          if (s === "stateSort")
            return (n) => {
              const a = [...r.getState().getNestedState(e, t).map((l, I) => ({
                ...l,
                __origIndex: I.toString()
              }))].sort(n);
              return u.clear(), N++, c(a, t, {
                filtered: [...y?.filtered || [], t],
                validIndices: a.map(
                  (l) => parseInt(l.__origIndex)
                )
              });
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const o = y?.filtered?.some(
                (a) => a.join(".") === t.join(".")
              ), d = o ? f : r.getState().getNestedState(e, t);
              return s !== "stateMapNoRender" && (u.clear(), N++), d.map((a, l) => {
                const I = o && a.__origIndex ? a.__origIndex : l, $ = c(
                  a,
                  [...t, I.toString()],
                  y
                );
                return n(
                  a,
                  $,
                  l,
                  f,
                  c(f, t, y)
                );
              });
            };
          if (s === "$stateMap")
            return (n) => K(pe, {
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
              const d = y?.filtered?.some(
                (l) => l.join(".") === t.join(".")
              ) ? f : r.getState().getNestedState(e, t);
              u.clear(), N++;
              const a = d.flatMap(
                (l, I) => l[n] ?? []
              );
              return c(
                a,
                [...t, "[*]", n],
                y
              );
            };
          if (s === "findWith")
            return (n, o) => {
              const d = f.findIndex((I) => I[n] === o);
              if (d === -1) return;
              const a = f[d], l = [...t, d.toString()];
              return u.clear(), N++, c(a, l);
            };
          if (s === "index")
            return (n) => {
              const o = f[n];
              return c(o, [...t, n.toString()]);
            };
          if (s === "last")
            return () => {
              const n = r.getState().getNestedState(e, t);
              if (n.length === 0) return;
              const o = n.length - 1, d = n[o], a = [...t, o.toString()];
              return c(d, a);
            };
          if (s === "insert")
            return (n) => (E(t), te(i, n, t, e), c(
              r.getState().getNestedState(e, t),
              t
            ));
          if (s === "uniqueInsert")
            return (n, o, d) => {
              const a = r.getState().getNestedState(e, t), l = W(n) ? n(a) : n;
              let I = null;
              if (!a.some((w) => {
                if (o) {
                  const b = o.every(
                    (Z) => F(w[Z], l[Z])
                  );
                  return b && (I = w), b;
                }
                const R = F(w, l);
                return R && (I = w), R;
              }))
                E(t), te(i, l, t, e);
              else if (d && I) {
                const w = d(I), R = a.map(
                  (b) => F(b, I) ? w : b
                );
                E(t), B(i, R, t);
              }
            };
          if (s === "cut")
            return (n, o) => {
              if (!o?.waitForSync)
                return E(t), H(i, t, e, n), c(
                  r.getState().getNestedState(e, t),
                  t
                );
            };
          if (s === "cutByValue")
            return (n) => {
              for (let o = 0; o < f.length; o++)
                f[o] === n && H(i, t, e, o);
            };
          if (s === "toggleByValue")
            return (n) => {
              const o = f.findIndex((d) => d === n);
              o > -1 ? H(i, t, e, o) : te(i, n, t, e);
            };
          if (s === "stateFilter")
            return (n) => {
              const o = f.map((l, I) => ({
                ...l,
                __origIndex: I.toString()
              })), d = [], a = [];
              for (let l = 0; l < o.length; l++)
                n(o[l], l) && (d.push(l), a.push(o[l]));
              return u.clear(), N++, c(a, t, {
                filtered: [...y?.filtered || [], t],
                validIndices: d
                // Always pass validIndices, even if empty
              });
            };
        }
        const z = t[t.length - 1];
        if (!isNaN(Number(z))) {
          const n = t.slice(0, -1), o = r.getState().getNestedState(e, n);
          if (Array.isArray(o) && s === "cut")
            return () => H(
              i,
              n,
              e,
              Number(z)
            );
        }
        if (s === "get")
          return () => r.getState().getNestedState(e, t);
        if (s === "$derive")
          return (n) => ne({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (s === "$derive")
          return (n) => ne({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (s === "$get")
          return () => ne({
            _stateKey: e,
            _path: t
          });
        if (s === "lastSynced") {
          const n = `${e}:${t.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (s == "getLocalStorage")
          return (n) => Ie(S + "-" + e + "-" + n);
        if (s === "_selected") {
          const n = t.slice(0, -1), o = n.join("."), d = r.getState().getNestedState(e, n);
          return Array.isArray(d) ? Number(t[t.length - 1]) === r.getState().getSelectedIndex(e, o) : void 0;
        }
        if (s === "setSelected")
          return (n) => {
            const o = t.slice(0, -1), d = Number(t[t.length - 1]), a = o.join(".");
            n ? r.getState().setSelectedIndex(e, a, d) : r.getState().setSelectedIndex(e, a, void 0);
            const l = r.getState().getNestedState(e, [...o]);
            B(i, l, o), E(o);
          };
        if (s === "toggleSelected")
          return () => {
            const n = t.slice(0, -1), o = Number(t[t.length - 1]), d = n.join("."), a = r.getState().getSelectedIndex(e, d);
            r.getState().setSelectedIndex(
              e,
              d,
              a === o ? void 0 : o
            );
            const l = r.getState().getNestedState(e, [...n]);
            B(i, l, n), E(n);
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
              const d = r.getState().cogsStateStore[e];
              try {
                const a = r.getState().getValidationErrors(n.key);
                a && a.length > 0 && a.forEach(([I]) => {
                  I && I.startsWith(n.key) && D(I);
                });
                const l = n.zodSchema.safeParse(d);
                return l.success ? !0 : (l.error.errors.forEach(($) => {
                  const w = $.path, R = $.message, b = [n.key, ...w].join(".");
                  o(b, R);
                }), se(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (s === "_componentId") return v;
          if (s === "getComponents")
            return () => r().stateComponents.get(e);
          if (s === "getAllFormRefs")
            return () => ge.getState().getFormRefsByStateKey(e);
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
          return () => ge.getState().getFormRef(e + "." + t.join("."));
        if (s === "validationWrapper")
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
        if (s === "_stateKey") return e;
        if (s === "_path") return t;
        if (s === "_isServerSynced") return m._isServerSynced;
        if (s === "update")
          return (n, o) => {
            if (o?.debounce)
              Ae(() => {
                B(i, n, t, "");
                const d = r.getState().getNestedState(e, t);
                o?.afterUpdate && o.afterUpdate(d);
              }, o.debounce);
            else {
              B(i, n, t, "");
              const d = r.getState().getNestedState(e, t);
              o?.afterUpdate && o.afterUpdate(d);
            }
            E(t);
          };
        if (s === "formElement")
          return (n, o) => /* @__PURE__ */ ue(
            Te,
            {
              setState: i,
              stateKey: e,
              path: t,
              child: n,
              formOpts: o
            }
          );
        const G = [...t, s], x = r.getState().getNestedState(e, G);
        return c(x, G, y);
      }
    }, p = new Proxy(V, C);
    return u.set(j, {
      proxy: p,
      stateVersion: N
    }), p;
  }
  return c(
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
    (u, N, E, m, c) => e._mapFn(u, N, E, m, c)
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
      } catch (V) {
        console.error("Error evaluating effect function during mount:", V), y = t;
      }
    else
      y = t;
    y !== null && typeof y == "object" && (y = JSON.stringify(y));
    const j = document.createTextNode(String(y));
    S.replaceWith(j);
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
  ne as $cogsSignal,
  Xe as $cogsSignalStore,
  Ze as addStateOptions,
  He as createCogsState,
  Ye as notifyComponent,
  Fe as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
