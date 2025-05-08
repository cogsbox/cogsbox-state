"use client";
import { jsx as ue } from "react/jsx-runtime";
import { useState as ae, useRef as Y, useEffect as oe, useLayoutEffect as he, useMemo as we, createElement as K, useSyncExternalStore as Ne, startTransition as $e } from "react";
import { transformStateFunc as Ae, isFunction as q, getDifferences as ge, getNestedValue as W, isDeepEqual as L, debounce as Te } from "./utility.js";
import { pushFunc as ne, updateFn as Z, cutFunc as H, ValidationWrapper as pe, FormControlComponent as Ve } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as fe } from "./store.js";
import { useCogsConfig as ke } from "./CogsStateClient.jsx";
import ie from "./node_modules/uuid/dist/esm-browser/v4.js";
function Se(e, i) {
  const v = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, u = v(e) || {};
  f(e, {
    ...u,
    ...i
  });
}
function me({
  stateKey: e,
  options: i,
  initialOptionsPart: v
}) {
  const f = B(e) || {}, u = v[e] || {}, E = r.getState().setInitialStateOptions, I = { ...u, ...f };
  let S = !1;
  if (i)
    for (const c in i)
      I.hasOwnProperty(c) ? (c == "localStorage" && i[c] && I[c].key !== i[c]?.key && (S = !0, I[c] = i[c]), c == "initialState" && i[c] && I[c] !== i[c] && (S = !0, I[c] = i[c])) : (S = !0, I[c] = i[c]);
  S && E(e, I);
}
function Ze(e, { formElements: i, validation: v }) {
  return { initialState: e, formElements: i, validation: v };
}
const He = (e, i) => {
  let v = e;
  const [f, u] = Ae(v);
  (Object.keys(u).length > 0 || i && Object.keys(i).length > 0) && Object.keys(u).forEach((S) => {
    u[S] = u[S] || {}, u[S].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...u[S].formElements || {}
      // State-specific overrides
    }, B(S) || r.getState().setInitialStateOptions(S, u[S]);
  }), r.getState().setInitialStates(f), r.getState().setCreatedState(f);
  const E = (S, c) => {
    const [m] = ae(c?.componentId ?? ie());
    me({
      stateKey: S,
      options: c,
      initialOptionsPart: u
    });
    const t = r.getState().cogsStateStore[S] || f[S], y = c?.modifyState ? c.modifyState(t) : t, [b, T] = je(
      y,
      {
        stateKey: S,
        syncUpdate: c?.syncUpdate,
        componentId: m,
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
  function I(S, c) {
    me({ stateKey: S, options: c, initialOptionsPart: u }), ce(S);
  }
  return { useCogsState: E, setCogsOptions: I };
}, {
  setUpdaterState: X,
  setState: z,
  getInitialOptions: B,
  getKeyState: ye,
  getValidationErrors: Ce,
  setStateLog: be,
  updateInitialStateGlobal: se,
  addValidationError: xe,
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
}, Oe = (e, i, v, f) => {
  v?.log && console.log(
    "saving to localstorage",
    i,
    v.localStorage?.key,
    f
  );
  const u = q(v?.localStorage?.key) ? v.localStorage?.key(e) : v?.localStorage?.key;
  if (u && f) {
    const E = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, I = `${f}-${i}-${u}`;
    window.localStorage.setItem(I, JSON.stringify(E));
  }
}, Fe = (e, i, v, f, u, E) => {
  const I = {
    initialState: i,
    updaterState: Q(
      e,
      f,
      u,
      E
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
    const f = `${e}////${i}`, u = v.components.get(f);
    if ((u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none"))
      return;
    u && u.forceUpdate();
  }
};
function je(e, {
  stateKey: i,
  serverSync: v,
  localStorage: f,
  formElements: u,
  middleware: E,
  reactiveDeps: I,
  reactiveType: S,
  componentId: c,
  initialState: m,
  syncUpdate: t,
  dependencies: y
} = {}) {
  const [b, T] = ae({}), { sessionId: x } = ke();
  let G = !i;
  const [g] = ae(i ?? ie()), s = r.getState().stateLog[g], J = Y(/* @__PURE__ */ new Set()), M = Y(c ?? ie()), k = Y(null);
  k.current = B(g), oe(() => {
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
    if (typeof m < "u") {
      let l;
      if (q(m)) {
        const P = r.getState().cogsStateStore[g];
        l = m(P);
      } else
        l = m;
      Se(g, {
        initialState: l
      });
      const a = B(g);
      let d = null;
      const h = q(a?.localStorage?.key) ? a?.localStorage?.key(l) : a?.localStorage?.key;
      h && x && (d = ve(
        x + "-" + g + "-" + h
      ));
      let $ = l;
      d && d.lastUpdated > (d.lastSyncedWithServer || 0) && ($ = d.state, a?.localStorage?.onChange && a?.localStorage?.onChange($)), console.log("newState thius is newstate", $), Fe(
        g,
        l,
        $,
        n,
        M.current,
        x
      ), ce(g), (Array.isArray(S) ? S : [S || "component"]).includes("none") || T({});
    }
  }, [m, ...y || []]), he(() => {
    G && Se(g, {
      serverSync: v,
      formElements: u,
      initialState: m,
      localStorage: f,
      middleware: E
    });
    const l = `${g}////${M.current}`, a = r.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(l, {
      forceUpdate: () => T({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: I || void 0,
      reactiveType: S ?? ["component", "deps"]
    }), r.getState().stateComponents.set(g, a), T({}), () => {
      const d = `${g}////${M.current}`;
      a && (a.components.delete(d), a.components.size === 0 && r.getState().stateComponents.delete(g));
    };
  }, []);
  const n = (l, a, d, h) => {
    if (Array.isArray(a)) {
      const $ = `${g}-${a.join(".")}`;
      J.current.add($);
    }
    z(g, ($) => {
      const w = q(l) ? l($) : l, P = ge($, w);
      new Set(P);
      const O = `${g}-${a.join(".")}`;
      if (O) {
        let j = !1, N = r.getState().signalDomElements.get(O);
        if ((!N || N.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const C = a.slice(0, -1), F = W(w, C);
          if (Array.isArray(F)) {
            j = !0;
            const _ = `${g}-${C.join(".")}`;
            N = r.getState().signalDomElements.get(_);
          }
        }
        if (N) {
          const C = j ? W(w, a.slice(0, -1)) : W(w, a);
          N.forEach(({ parentId: F, position: _, effect: p }) => {
            const A = document.querySelector(
              `[data-parent-id="${F}"]`
            );
            if (A) {
              const R = Array.from(A.childNodes);
              if (R[_]) {
                const V = p ? new Function("state", `return (${p})(state)`)(C) : C;
                R[_].textContent = String(V);
              }
            }
          });
        }
      }
      d.updateType === "update" && (h || k.current?.validationKey) && a && D(
        (h || k.current?.validationKey) + "." + a.join(".")
      );
      const U = a.slice(0, a.length - 1);
      d.updateType === "cut" && k.current?.validationKey && D(
        k.current?.validationKey + "." + U.join(".")
      ), d.updateType === "insert" && k.current?.validationKey && Ce(
        k.current?.validationKey + "." + U.join(".")
      ).filter(([N, C]) => {
        let F = N?.split(".").length;
        if (N == U.join(".") && F == U.length - 1) {
          let _ = N + "." + U;
          D(N), xe(_, C);
        }
      });
      const Ie = W($, a), _e = W(w, a), Ee = d.updateType === "update" ? a.join(".") : [...a].slice(0, -1).join("."), ee = r.getState().stateComponents.get(g);
      if (console.log(
        "pathetocaheck.............................",
        a,
        d,
        Ee ?? "NONE",
        ee
      ), ee) {
        const j = ge($, w), N = new Set(j), C = d.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          F,
          _
        ] of ee.components.entries()) {
          let p = !1;
          const A = Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"];
          if (!A.includes("none")) {
            if (A.includes("all")) {
              _.forceUpdate();
              continue;
            }
            if (A.includes("component") && ((_.paths.has(C) || _.paths.has("")) && (p = !0), !p))
              for (const R of N) {
                let V = R;
                for (; ; ) {
                  if (_.paths.has(V)) {
                    p = !0;
                    break;
                  }
                  const te = V.lastIndexOf(".");
                  if (te !== -1) {
                    const de = V.substring(
                      0,
                      te
                    );
                    if (!isNaN(
                      Number(V.substring(te + 1))
                    ) && _.paths.has(de)) {
                      p = !0;
                      break;
                    }
                    V = de;
                  } else
                    V = "";
                  if (V === "")
                    break;
                }
                if (p) break;
              }
            if (!p && A.includes("deps") && _.depsFunction) {
              const R = _.depsFunction(w);
              let V = !1;
              typeof R == "boolean" ? R && (V = !0) : L(_.deps, R) || (_.deps = R, V = !0), V && (p = !0);
            }
            p && _.forceUpdate();
          }
        }
      }
      const le = {
        timeStamp: Date.now(),
        stateKey: g,
        path: a,
        updateType: d.updateType,
        status: "new",
        oldValue: Ie,
        newValue: _e
      };
      if (be(g, (j) => {
        const C = [...j ?? [], le].reduce((F, _) => {
          const p = `${_.stateKey}:${JSON.stringify(_.path)}`, A = F.get(p);
          return A ? (A.timeStamp = Math.max(A.timeStamp, _.timeStamp), A.newValue = _.newValue, A.oldValue = A.oldValue ?? _.oldValue, A.updateType = _.updateType) : F.set(p, { ..._ }), F;
        }, /* @__PURE__ */ new Map());
        return Array.from(C.values());
      }), Oe(
        w,
        g,
        k.current,
        x
      ), E && E({
        updateLog: s,
        update: le
      }), k.current?.serverSync) {
        const j = r.getState().serverState[g], N = k.current?.serverSync;
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
  const u = /* @__PURE__ */ new Map();
  let E = 0;
  const I = (m) => {
    const t = m.join(".");
    for (const [y] of u)
      (y === t || y.startsWith(t + ".")) && u.delete(y);
    E++;
  }, S = {
    removeValidation: (m) => {
      m?.validationKey && D(m.validationKey);
    },
    revertToInitialState: (m) => {
      const t = r.getState().getInitialOptions(e)?.validation;
      t?.key && D(t?.key), m?.validationKey && D(m.validationKey);
      const y = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), u.clear(), E++;
      const b = c(y, []), T = B(e), x = q(T?.localStorage?.key) ? T?.localStorage?.key(y) : T?.localStorage?.key, G = `${f}-${e}-${x}`;
      G && localStorage.removeItem(G), X(e, b), z(e, y);
      const g = r.getState().stateComponents.get(e);
      return g && g.components.forEach((s) => {
        s.forceUpdate();
      }), y;
    },
    updateInitialState: (m) => {
      u.clear(), E++;
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
      return !!(m && L(m, ye(e)));
    }
  };
  function c(m, t = [], y) {
    const b = t.map(String).join(".");
    u.get(b);
    const T = function() {
      return r().getNestedState(e, t);
    };
    Object.keys(S).forEach((g) => {
      T[g] = S[g];
    });
    const x = {
      apply(g, s, J) {
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
          return L(n, l) ? "fresh" : "stale";
        }
        if (s === "getStatus")
          return function() {
            const n = r().getNestedState(
              e,
              t
            ), o = r.getState().initialStateGlobal[e], l = W(o, t);
            return L(n, l) ? "fresh" : "stale";
          };
        if (s === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[e], o = B(e), l = q(o?.localStorage?.key) ? o?.localStorage?.key(n) : o?.localStorage?.key, a = `${f}-${e}-${l}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (s === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(e)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(n.key + "." + t.join("."));
          };
        if (Array.isArray(m)) {
          if (s === "getSelected")
            return () => {
              const n = r.getState().getSelectedIndex(e, t.join("."));
              if (n !== void 0)
                return c(
                  m[n],
                  [...t, n.toString()],
                  y
                );
            };
          if (s === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(e, t.join(".")) ?? -1;
          if (s === "stateSort")
            return (n) => {
              const a = [...r.getState().getNestedState(e, t).map((d, h) => ({
                ...d,
                __origIndex: h.toString()
              }))].sort(n);
              return u.clear(), E++, c(a, t, {
                filtered: [...y?.filtered || [], t],
                validIndices: a.map(
                  (d) => parseInt(d.__origIndex)
                )
              });
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const o = y?.filtered?.some(
                (a) => a.join(".") === t.join(".")
              ), l = o ? m : r.getState().getNestedState(e, t);
              return s !== "stateMapNoRender" && (u.clear(), E++), l.map((a, d) => {
                const h = o && a.__origIndex ? a.__origIndex : d, $ = c(
                  a,
                  [...t, h.toString()],
                  y
                );
                return n(
                  a,
                  $,
                  d,
                  m,
                  c(m, t, y)
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
                (d) => d.join(".") === t.join(".")
              ) ? m : r.getState().getNestedState(e, t);
              u.clear(), E++;
              const a = l.flatMap(
                (d, h) => d[n] ?? []
              );
              return c(
                a,
                [...t, "[*]", n],
                y
              );
            };
          if (s === "findWith")
            return (n, o) => {
              const l = m.findIndex(
                (h) => h[n] === o
              );
              if (l === -1) return;
              const a = m[l], d = [...t, l.toString()];
              return u.clear(), E++, u.clear(), E++, c(a, d);
            };
          if (s === "index")
            return (n) => {
              const o = m[n];
              return c(o, [...t, n.toString()]);
            };
          if (s === "insert")
            return (n) => (I(t), ne(i, n, t, e), c(
              r.getState().cogsStateStore[e],
              []
            ));
          if (s === "uniqueInsert")
            return (n, o, l) => {
              const a = r.getState().getNestedState(e, t), d = q(n) ? n(a) : n;
              let h = null;
              if (!a.some((w) => {
                if (o) {
                  const O = o.every(
                    (U) => L(w[U], d[U])
                  );
                  return O && (h = w), O;
                }
                const P = L(w, d);
                return P && (h = w), P;
              }))
                I(t), ne(i, d, t, e);
              else if (l && h) {
                const w = l(h), P = a.map(
                  (O) => L(O, h) ? w : O
                );
                I(t), Z(i, P, t);
              }
            };
          if (s === "cut")
            return (n, o) => {
              o?.waitForSync || (I(t), H(i, t, e, n));
            };
          if (s === "cutByValue")
            return (n) => {
              for (let o = 0; o < m.length; o++)
                m[o] === n && H(i, t, e, o);
            };
          if (s === "toggleByValue")
            return (n) => {
              const o = m.findIndex((l) => l === n);
              o > -1 ? H(i, t, e, o) : ne(i, n, t, e);
            };
          if (s === "stateFilter")
            return (n) => {
              const o = m.map((d, h) => ({
                ...d,
                __origIndex: h.toString()
              })), l = [], a = [];
              for (let d = 0; d < o.length; d++)
                n(o[d], d) && (l.push(d), a.push(o[d]));
              return u.clear(), E++, c(a, t, {
                filtered: [...y?.filtered || [], t],
                validIndices: l
                // Always pass validIndices, even if empty
              });
            };
        }
        const J = t[t.length - 1];
        if (!isNaN(Number(J))) {
          const n = t.slice(0, -1), o = r.getState().getNestedState(e, n);
          if (Array.isArray(o) && s === "cut")
            return () => H(
              i,
              n,
              e,
              Number(J)
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
          return (n) => ve(f + "-" + e + "-" + n);
        if (s === "_selected") {
          const n = t.slice(0, -1), o = n.join("."), l = r.getState().getNestedState(e, n);
          return Array.isArray(l) ? Number(t[t.length - 1]) === r.getState().getSelectedIndex(e, o) : void 0;
        }
        if (s === "setSelected")
          return (n) => {
            const o = t.slice(0, -1), l = Number(t[t.length - 1]), a = o.join(".");
            n ? r.getState().setSelectedIndex(e, a, l) : r.getState().setSelectedIndex(e, a, void 0);
            const d = r.getState().getNestedState(e, [...o]);
            Z(i, d, o), I(o);
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
                const d = n.zodSchema.safeParse(l);
                return d.success ? !0 : (d.error.errors.forEach(($) => {
                  const w = $.path, P = $.message, O = [n.key, ...w].join(".");
                  o(O, P);
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
            return S.revertToInitialState;
          if (s === "updateInitialState") return S.updateInitialState;
          if (s === "removeValidation") return S.removeValidation;
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
        if (s === "_isServerSynced") return S._isServerSynced;
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
            Ve,
            {
              setState: i,
              stateKey: e,
              path: t,
              child: n,
              formOpts: o
            }
          );
        const M = [...t, s], k = r.getState().getNestedState(e, M);
        return c(k, M, y);
      }
    }, G = new Proxy(T, x);
    return u.set(b, {
      proxy: G,
      stateVersion: E
    }), G;
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
    (u, E, I, S, c) => e._mapFn(u, E, I, S, c)
  ) : null;
}
function Me({
  proxy: e
}) {
  const i = Y(null), v = `${e._stateKey}-${e._path.join(".")}`;
  return oe(() => {
    const f = i.current;
    if (!f || !f.parentElement) return;
    const u = f.parentElement, I = Array.from(u.childNodes).indexOf(f);
    let S = u.getAttribute("data-parent-id");
    S || (S = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", S));
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
      } catch (T) {
        console.error("Error evaluating effect function during mount:", T), y = t;
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
