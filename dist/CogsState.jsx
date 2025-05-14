"use client";
import { jsx as ue } from "react/jsx-runtime";
import { useState as re, useRef as Y, useEffect as oe, useLayoutEffect as _e, useMemo as he, createElement as K, useSyncExternalStore as Ne, startTransition as we } from "react";
import { transformStateFunc as $e, isFunction as q, isDeepEqual as O, getDifferences as ge, getNestedValue as W, debounce as Ae } from "./utility.js";
import { pushFunc as te, updateFn as Z, cutFunc as H, ValidationWrapper as Te, FormControlComponent as Ve } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as fe } from "./store.js";
import { useCogsConfig as be } from "./CogsStateClient.jsx";
import ae from "./node_modules/uuid/dist/esm-browser/v4.js";
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
    for (const c in i)
      E.hasOwnProperty(c) ? (c == "localStorage" && i[c] && E[c].key !== i[c]?.key && (m = !0, E[c] = i[c]), c == "initialState" && i[c] && E[c] !== i[c] && // Different references
      !O(E[c], i[c]) && (m = !0, E[c] = i[c])) : (m = !0, E[c] = i[c]);
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
  const h = (m, c) => {
    const [f] = re(c?.componentId ?? ae());
    if (c && typeof c.initialState < "u" && q(c.initialState)) {
      const C = r.getState().cogsStateStore[m] || S[m], F = c.initialState(
        C
      );
      c = {
        ...c,
        initialState: F
      };
    }
    me({
      stateKey: m,
      options: c,
      initialOptionsPart: u
    });
    const t = r.getState().cogsStateStore[m] || S[m], y = c?.modifyState ? c.modifyState(t) : t, [P, T] = Oe(
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
  function E(m, c) {
    me({ stateKey: m, options: c, initialOptionsPart: u }), se(m);
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
}, pe = (e, i, v, S) => {
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
}, je = (e, i, v, S, u, h) => {
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
function Oe(e, {
  stateKey: i,
  serverSync: v,
  localStorage: S,
  formElements: u,
  middleware: h,
  reactiveDeps: E,
  reactiveType: m,
  componentId: c,
  initialState: f,
  syncUpdate: t,
  dependencies: y
} = {}) {
  const [P, T] = re({}), { sessionId: C } = be();
  let F = !i;
  const [g] = re(i ?? ae()), l = r.getState().stateLog[g], B = Y(/* @__PURE__ */ new Set()), U = Y(c ?? ae()), b = Y(null);
  b.current = J(g), oe(() => {
    if (t && t.stateKey === g && t.path?.[0]) {
      z(g, (o) => ({
        ...o,
        [t.path[0]]: t.newValue
      }));
      const d = `${t.stateKey}:${t.path.join(".")}`;
      r.getState().setSyncInfo(d, {
        timeStamp: t.timeStamp,
        userId: t.userId
      });
    }
  }, [t]), oe(() => {
    if (f) {
      Se(g, {
        initialState: f
      });
      const d = b.current;
      let o = null;
      const s = q(d?.localStorage?.key) ? d?.localStorage?.key(f) : d?.localStorage?.key;
      s && C && (o = ve(
        C + "-" + g + "-" + s
      ));
      const I = r.getState().initialStateGlobal[g];
      if (console.log(
        "currentGloballyStoredInitialState",
        I,
        f,
        O(I, f)
      ), I && !O(I, f) || !I) {
        let w = f;
        o && o.lastUpdated > (o.lastSyncedWithServer || 0) && (w = o.state, d?.localStorage?.onChange && d?.localStorage?.onChange(w)), je(
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
    F && Se(g, {
      serverSync: v,
      formElements: u,
      initialState: f,
      localStorage: S,
      middleware: h
    });
    const d = `${g}////${U.current}`, o = r.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(d, {
      forceUpdate: () => T({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0,
      reactiveType: m ?? ["component", "deps"]
    }), r.getState().stateComponents.set(g, o), T({}), () => {
      const s = `${g}////${U.current}`;
      o && (o.components.delete(s), o.components.size === 0 && r.getState().stateComponents.delete(g));
    };
  }, []);
  const n = (d, o, s, I) => {
    if (Array.isArray(o)) {
      const w = `${g}-${o.join(".")}`;
      B.current.add(w);
    }
    z(g, (w) => {
      const N = q(d) ? d(w) : d, G = ge(w, N);
      new Set(G);
      const p = `${g}-${o.join(".")}`;
      if (p) {
        let R = !1, $ = r.getState().signalDomElements.get(p);
        if ((!$ || $.size === 0) && (s.updateType === "insert" || s.updateType === "cut")) {
          const x = o.slice(0, -1), j = W(N, x);
          if (Array.isArray(j)) {
            R = !0;
            const _ = `${g}-${x.join(".")}`;
            $ = r.getState().signalDomElements.get(_);
          }
        }
        if ($) {
          const x = R ? W(N, o.slice(0, -1)) : W(N, o);
          $.forEach(({ parentId: j, position: _, effect: V }) => {
            const A = document.querySelector(
              `[data-parent-id="${j}"]`
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
      s.updateType === "update" && (I || b.current?.validationKey) && o && L(
        (I || b.current?.validationKey) + "." + o.join(".")
      );
      const D = o.slice(0, o.length - 1);
      s.updateType === "cut" && b.current?.validationKey && L(
        b.current?.validationKey + "." + D.join(".")
      ), s.updateType === "insert" && b.current?.validationKey && ke(
        b.current?.validationKey + "." + D.join(".")
      ).filter(([$, x]) => {
        let j = $?.split(".").length;
        if ($ == D.join(".") && j == D.length - 1) {
          let _ = $ + "." + D;
          L($), xe(_, x);
        }
      });
      const Ie = W(w, o), Ee = W(N, o);
      s.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join(".");
      const ce = r.getState().stateComponents.get(g);
      if (ce) {
        const R = ge(w, N), $ = new Set(R), x = s.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        for (const [
          j,
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
              typeof M == "boolean" ? M && (k = !0) : O(_.deps, M) || (_.deps = M, k = !0), k && (V = !0);
            }
            V && _.forceUpdate();
          }
        }
      }
      const le = {
        timeStamp: Date.now(),
        stateKey: g,
        path: o,
        updateType: s.updateType,
        status: "new",
        oldValue: Ie,
        newValue: Ee
      };
      if (Ce(g, (R) => {
        const x = [...R ?? [], le].reduce((j, _) => {
          const V = `${_.stateKey}:${JSON.stringify(_.path)}`, A = j.get(V);
          return A ? (A.timeStamp = Math.max(A.timeStamp, _.timeStamp), A.newValue = _.newValue, A.oldValue = A.oldValue ?? _.oldValue, A.updateType = _.updateType) : j.set(V, { ..._ }), j;
        }, /* @__PURE__ */ new Map());
        return Array.from(x.values());
      }), pe(
        N,
        g,
        b.current,
        C
      ), h && h({
        updateLog: l,
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
  const a = he(() => Q(
    g,
    n,
    U.current,
    C
  ), [g]);
  return [ye(g), a];
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
      const P = c(y, []), T = J(e), C = q(T?.localStorage?.key) ? T?.localStorage?.key(y) : T?.localStorage?.key, F = `${S}-${e}-${C}`;
      F && localStorage.removeItem(F), X(e, P), z(e, y);
      const g = r.getState().stateComponents.get(e);
      return g && g.components.forEach((l) => {
        l.forceUpdate();
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
      return !!(f && O(f, ye(e)));
    }
  };
  function c(f, t = [], y) {
    const P = t.map(String).join(".");
    u.get(P);
    const T = function() {
      return r().getNestedState(e, t);
    };
    Object.keys(m).forEach((g) => {
      T[g] = m[g];
    });
    const C = {
      apply(g, l, B) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, t);
      },
      get(g, l) {
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender") {
          const n = t.join("."), a = `${e}////${v}`, d = r.getState().stateComponents.get(e);
          if (d) {
            const o = d.components.get(a);
            o && (t.length > 0 || l === "get") && o.paths.add(n);
          }
        }
        if (l === "sync" && t.length === 0)
          return async function() {
            const n = r.getState().getInitialOptions(e), a = n?.sync;
            if (!a)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const d = r.getState().getNestedState(e, []), o = n?.validation?.key;
            console.log("validationKey", o);
            try {
              const s = await a.action(d);
              if (console.log("response ss", s, s.errors), s && !s.success && s.errors && o) {
                r.getState().removeValidationError(o), console.log("        response.errors ", s.errors), s.errors.forEach((w) => {
                  const N = [o, ...w.path].join(".");
                  console.log("   errorPath ", N, w.message), r.getState().addValidationError(N, w.message);
                });
                const I = r.getState().stateComponents.get(e);
                I && I.components.forEach((w) => {
                  w.forceUpdate();
                });
              }
              return s?.success && a.onSuccess ? a.onSuccess(s.data) : !s?.success && a.onError && a.onError(s.error), s;
            } catch (s) {
              return a.onError && a.onError(s), { success: !1, error: s };
            }
          };
        if (l === "_status") {
          const n = r.getState().getNestedState(e, t), a = r.getState().initialStateGlobal[e], d = W(a, t);
          return O(n, d) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const n = r().getNestedState(
              e,
              t
            ), a = r.getState().initialStateGlobal[e], d = W(a, t);
            return O(n, d) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[e], a = J(e), d = q(a?.localStorage?.key) ? a?.localStorage?.key(n) : a?.localStorage?.key, o = `${S}-${e}-${d}`;
            console.log("removing storage", o), o && localStorage.removeItem(o);
          };
        if (l === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(e)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(n.key + "." + t.join("."));
          };
        if (Array.isArray(f)) {
          if (l === "getSelected")
            return () => {
              const n = r.getState().getSelectedIndex(e, t.join("."));
              if (n !== void 0)
                return c(
                  f[n],
                  [...t, n.toString()],
                  y
                );
            };
          if (l === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(e, t.join(".")) ?? -1;
          if (l === "stateSort")
            return (n) => {
              const o = [...r.getState().getNestedState(e, t).map((s, I) => ({
                ...s,
                __origIndex: I.toString()
              }))].sort(n);
              return u.clear(), h++, c(o, t, {
                filtered: [...y?.filtered || [], t],
                validIndices: o.map(
                  (s) => parseInt(s.__origIndex)
                )
              });
            };
          if (l === "stateMap" || l === "stateMapNoRender")
            return (n) => {
              const a = y?.filtered?.some(
                (o) => o.join(".") === t.join(".")
              ), d = a ? f : r.getState().getNestedState(e, t);
              return l !== "stateMapNoRender" && (u.clear(), h++), d.map((o, s) => {
                const I = a && o.__origIndex ? o.__origIndex : s, w = c(
                  o,
                  [...t, I.toString()],
                  y
                );
                return n(
                  o,
                  w,
                  s,
                  f,
                  c(f, t, y)
                );
              });
            };
          if (l === "$stateMap")
            return (n) => K(Fe, {
              proxy: {
                _stateKey: e,
                _path: t,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: c
            });
          if (l === "stateFlattenOn")
            return (n) => {
              const d = y?.filtered?.some(
                (s) => s.join(".") === t.join(".")
              ) ? f : r.getState().getNestedState(e, t);
              u.clear(), h++;
              const o = d.flatMap(
                (s, I) => s[n] ?? []
              );
              return c(
                o,
                [...t, "[*]", n],
                y
              );
            };
          if (l === "findWith")
            return (n, a) => {
              const d = f.findIndex((I) => I[n] === a);
              if (d === -1) return;
              const o = f[d], s = [...t, d.toString()];
              return u.clear(), h++, c(o, s);
            };
          if (l === "index")
            return (n) => {
              const a = f[n];
              return c(a, [...t, n.toString()]);
            };
          if (l === "last")
            return () => {
              const n = r.getState().getNestedState(e, t);
              if (n.length === 0) return;
              const a = n.length - 1, d = n[a], o = [...t, a.toString()];
              return c(d, o);
            };
          if (l === "insert")
            return (n) => (E(t), te(i, n, t, e), c(
              r.getState().getNestedState(e, t),
              t
            ));
          if (l === "uniqueInsert")
            return (n, a, d) => {
              const o = r.getState().getNestedState(e, t), s = q(n) ? n(o) : n;
              let I = null;
              if (!o.some((N) => {
                if (a) {
                  const p = a.every(
                    (D) => O(N[D], s[D])
                  );
                  return p && (I = N), p;
                }
                const G = O(N, s);
                return G && (I = N), G;
              }))
                E(t), te(i, s, t, e);
              else if (d && I) {
                const N = d(I), G = o.map(
                  (p) => O(p, I) ? N : p
                );
                E(t), Z(i, G, t);
              }
            };
          if (l === "cut")
            return (n, a) => {
              a?.waitForSync || (E(t), H(i, t, e, n));
            };
          if (l === "cutByValue")
            return (n) => {
              for (let a = 0; a < f.length; a++)
                f[a] === n && H(i, t, e, a);
            };
          if (l === "toggleByValue")
            return (n) => {
              const a = f.findIndex((d) => d === n);
              a > -1 ? H(i, t, e, a) : te(i, n, t, e);
            };
          if (l === "stateFilter")
            return (n) => {
              const a = f.map((s, I) => ({
                ...s,
                __origIndex: I.toString()
              })), d = [], o = [];
              for (let s = 0; s < a.length; s++)
                n(a[s], s) && (d.push(s), o.push(a[s]));
              return u.clear(), h++, c(o, t, {
                filtered: [...y?.filtered || [], t],
                validIndices: d
                // Always pass validIndices, even if empty
              });
            };
        }
        const B = t[t.length - 1];
        if (!isNaN(Number(B))) {
          const n = t.slice(0, -1), a = r.getState().getNestedState(e, n);
          if (Array.isArray(a) && l === "cut")
            return () => H(
              i,
              n,
              e,
              Number(B)
            );
        }
        if (l === "get")
          return () => r.getState().getNestedState(e, t);
        if (l === "$derive")
          return (n) => ne({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (l === "$derive")
          return (n) => ne({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (l === "$get")
          return () => ne({
            _stateKey: e,
            _path: t
          });
        if (l === "lastSynced") {
          const n = `${e}:${t.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (l == "getLocalStorage")
          return (n) => ve(S + "-" + e + "-" + n);
        if (l === "_selected") {
          const n = t.slice(0, -1), a = n.join("."), d = r.getState().getNestedState(e, n);
          return Array.isArray(d) ? Number(t[t.length - 1]) === r.getState().getSelectedIndex(e, a) : void 0;
        }
        if (l === "setSelected")
          return (n) => {
            const a = t.slice(0, -1), d = Number(t[t.length - 1]), o = a.join(".");
            n ? r.getState().setSelectedIndex(e, o, d) : r.getState().setSelectedIndex(e, o, void 0);
            const s = r.getState().getNestedState(e, [...a]);
            Z(i, s, a), E(a);
          };
        if (t.length == 0) {
          if (l === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(e)?.validation, a = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              L(n.key);
              const d = r.getState().cogsStateStore[e];
              try {
                const o = r.getState().getValidationErrors(n.key);
                o && o.length > 0 && o.forEach(([I]) => {
                  I && I.startsWith(n.key) && L(I);
                });
                const s = n.zodSchema.safeParse(d);
                return s.success ? !0 : (s.error.errors.forEach((w) => {
                  const N = w.path, G = w.message, p = [n.key, ...N].join(".");
                  a(p, G);
                }), se(e), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (l === "_componentId") return v;
          if (l === "getComponents")
            return () => r().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => fe.getState().getFormRefsByStateKey(e);
          if (l === "_initialState")
            return r.getState().initialStateGlobal[e];
          if (l === "_serverState")
            return r.getState().serverState[e];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[e];
          if (l === "revertToInitialState")
            return m.revertToInitialState;
          if (l === "updateInitialState") return m.updateInitialState;
          if (l === "removeValidation") return m.removeValidation;
        }
        if (l === "getFormRef")
          return () => fe.getState().getFormRef(e + "." + t.join("."));
        if (l === "validationWrapper")
          return ({
            children: n,
            hideMessage: a
          }) => /* @__PURE__ */ ue(
            Te,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: t,
              validationKey: r.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: y?.validIndices,
              children: n
            }
          );
        if (l === "_stateKey") return e;
        if (l === "_path") return t;
        if (l === "_isServerSynced") return m._isServerSynced;
        if (l === "update")
          return (n, a) => {
            if (a?.debounce)
              Ae(() => {
                Z(i, n, t, "");
                const d = r.getState().getNestedState(e, t);
                a?.afterUpdate && a.afterUpdate(d);
              }, a.debounce);
            else {
              Z(i, n, t, "");
              const d = r.getState().getNestedState(e, t);
              a?.afterUpdate && a.afterUpdate(d);
            }
            E(t);
          };
        if (l === "formElement")
          return (n, a) => /* @__PURE__ */ ue(
            Ve,
            {
              setState: i,
              stateKey: e,
              path: t,
              child: n,
              formOpts: a
            }
          );
        const U = [...t, l], b = r.getState().getNestedState(e, U);
        return c(b, U, y);
      }
    }, F = new Proxy(T, C);
    return u.set(P, {
      proxy: F,
      stateVersion: h
    }), F;
  }
  return c(
    r.getState().getNestedState(e, [])
  );
}
function ne(e) {
  return K(Re, { proxy: e });
}
function Fe({
  proxy: e,
  rebuildStateShape: i
}) {
  const v = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(v) ? i(
    v,
    e._path
  ).stateMapNoRender(
    (u, h, E, m, c) => e._mapFn(u, h, E, m, c)
  ) : null;
}
function Re({
  proxy: e
}) {
  const i = Y(null), v = `${e._stateKey}-${e._path.join(".")}`;
  return oe(() => {
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
  Oe as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
