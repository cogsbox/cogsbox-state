"use client";
import { jsx as le } from "react/jsx-runtime";
import { useState as ne, useRef as H, useEffect as re, useLayoutEffect as _e, useMemo as Ee, createElement as Q, useSyncExternalStore as we, startTransition as $e } from "react";
import { transformStateFunc as he, isFunction as L, getDifferences as Ae, getNestedValue as D, isDeepEqual as U, debounce as Ne } from "./utility.js";
import { pushFunc as ee, updateFn as J, cutFunc as Z, ValidationWrapper as Te, FormControlComponent as Ve } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as de } from "./store.js";
import { useCogsConfig as pe } from "./CogsStateClient.jsx";
import ae from "./node_modules/uuid/dist/esm-browser/v4.js";
function ue(e, i) {
  const v = r.getState().getInitialOptions, S = r.getState().setInitialStateOptions, d = v(e) || {};
  S(e, {
    ...d,
    ...i
  });
}
function ge({
  stateKey: e,
  options: i,
  initialOptionsPart: v
}) {
  const S = B(e) || {}, d = v[e] || {}, E = r.getState().setInitialStateOptions, _ = { ...d, ...S };
  let m = !1;
  if (i)
    for (const c in i)
      _.hasOwnProperty(c) ? (c == "localStorage" && i[c] && _[c].key !== i[c]?.key && (m = !0, _[c] = i[c]), c == "initialState" && i[c] && _[c] !== i[c] && (m = !0, _[c] = i[c])) : (m = !0, _[c] = i[c]);
  m && E(e, _);
}
function Je(e, { formElements: i, validation: v }) {
  return { initialState: e, formElements: i, validation: v };
}
const Ze = (e, i) => {
  let v = e;
  const [S, d] = he(v);
  (Object.keys(d).length > 0 || i && Object.keys(i).length > 0) && Object.keys(d).forEach((m) => {
    d[m] = d[m] || {}, d[m].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...d[m].formElements || {}
      // State-specific overrides
    }, B(m) || r.getState().setInitialStateOptions(m, d[m]);
  }), r.getState().setInitialStates(S), r.getState().setCreatedState(S);
  const E = (m, c) => {
    const [f] = ne(c?.componentId ?? ae());
    ge({
      stateKey: m,
      options: c,
      initialOptionsPart: d
    });
    const t = r.getState().cogsStateStore[m] || S[m], y = c?.modifyState ? c.modifyState(t) : t, [C, T] = je(
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
  function _(m, c) {
    ge({ stateKey: m, options: c, initialOptionsPart: d }), ie(m);
  }
  return { useCogsState: E, setCogsOptions: _ };
}, {
  setUpdaterState: Y,
  setState: G,
  getInitialOptions: B,
  getKeyState: fe,
  getValidationErrors: ke,
  setStateLog: Ce,
  updateInitialStateGlobal: oe,
  addValidationError: xe,
  removeValidationError: R,
  setServerSyncActions: be
} = r.getState(), Se = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Oe = (e, i, v, S) => {
  v?.log && console.log(
    "saving to localstorage",
    i,
    v.localStorage?.key,
    S
  );
  const d = L(v?.localStorage?.key) ? v.localStorage?.key(e) : v?.localStorage?.key;
  if (d && S) {
    const E = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, _ = `${S}-${i}-${d}`;
    window.localStorage.setItem(_, JSON.stringify(E));
  }
}, Pe = (e, i, v, S, d, E) => {
  const _ = {
    initialState: i,
    updaterState: X(
      e,
      S,
      d,
      E
    ),
    state: v
  };
  oe(e, _.initialState), Y(e, _.updaterState), G(e, _.state);
}, ie = (e) => {
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
    const S = `${e}////${i}`, d = v.components.get(S);
    if ((d ? Array.isArray(d.reactiveType) ? d.reactiveType : [d.reactiveType || "component"] : null)?.includes("none"))
      return;
    d && d.forceUpdate();
  }
};
function je(e, {
  stateKey: i,
  serverSync: v,
  localStorage: S,
  formElements: d,
  middleware: E,
  reactiveDeps: _,
  reactiveType: m,
  componentId: c,
  initialState: f,
  syncUpdate: t,
  dependencies: y
} = {}) {
  const [C, T] = ne({}), { sessionId: x } = pe();
  let M = !i;
  const [g] = ne(i ?? ae()), s = r.getState().stateLog[g], W = H(/* @__PURE__ */ new Set()), P = H(c ?? ae()), p = H(null);
  p.current = B(g), re(() => {
    if (t && t.stateKey === g && t.path?.[0]) {
      G(g, (a) => ({
        ...a,
        [t.path[0]]: t.newValue
      }));
      const l = `${t.stateKey}:${t.path.join(".")}`;
      r.getState().setSyncInfo(l, {
        timeStamp: t.timeStamp,
        userId: t.userId
      });
    }
  }, [t]), re(() => {
    f && ue(g, {
      initialState: f
    });
    const l = p.current;
    let a = null;
    const u = L(l?.localStorage?.key) ? l?.localStorage?.key(f) : l?.localStorage?.key;
    console.log("newoptions", l), console.log("localkey", u), console.log("initialState", f), u && x && (a = Se(
      x + "-" + g + "-" + u
    ));
    const w = r.getState().iniitialCreatedState[g];
    console.log("createdState - intiual", w, f);
    let N = null;
    if (f) {
      N = f, a && a.lastUpdated > (a.lastSyncedWithServer || 0) && (N = a.state, l?.localStorage?.onChange && l?.localStorage?.onChange(N)), console.log("newState thius is newstate", N), Pe(
        g,
        f,
        N,
        n,
        P.current,
        x
      ), ie(g);
      const h = Array.isArray(m) ? m : [m || "component"];
      console.log("reactiveTypes.............................", h), h.includes("none") || T({});
    }
  }, [f, ...y || []]), _e(() => {
    M && ue(g, {
      serverSync: v,
      formElements: d,
      initialState: f,
      localStorage: S,
      middleware: E
    });
    const l = `${g}////${P.current}`, a = r.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(l, {
      forceUpdate: () => T({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: m ?? ["component", "deps"]
    }), r.getState().stateComponents.set(g, a), T({}), () => {
      const u = `${g}////${P.current}`;
      a && (a.components.delete(u), a.components.size === 0 && r.getState().stateComponents.delete(g));
    };
  }, []);
  const n = (l, a, u, w) => {
    if (Array.isArray(a)) {
      const N = `${g}-${a.join(".")}`;
      W.current.add(N);
    }
    G(g, (N) => {
      const h = L(l) ? l(N) : l, j = Ae(N, h), O = new Set(j), q = `${g}-${a.join(".")}`;
      if (q) {
        let F = !1, I = r.getState().signalDomElements.get(q);
        if ((!I || I.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const A = a.slice(0, -1), V = D(h, A);
          if (Array.isArray(V)) {
            F = !0;
            const $ = `${g}-${A.join(".")}`;
            I = r.getState().signalDomElements.get($);
          }
        }
        if (I) {
          const A = F ? D(h, a.slice(0, -1)) : D(h, a);
          I.forEach(({ parentId: V, position: $, effect: k }) => {
            const b = document.querySelector(
              `[data-parent-id="${V}"]`
            );
            if (b) {
              const ce = Array.from(b.childNodes);
              if (ce[$]) {
                const Ie = k ? new Function("state", `return (${k})(state)`)(A) : A;
                ce[$].textContent = String(Ie);
              }
            }
          });
        }
      }
      u.updateType === "update" && (w || p.current?.validationKey) && a && R(
        (w || p.current?.validationKey) + "." + a.join(".")
      );
      const z = a.slice(0, a.length - 1);
      u.updateType === "cut" && p.current?.validationKey && R(
        p.current?.validationKey + "." + z.join(".")
      ), u.updateType === "insert" && p.current?.validationKey && ke(
        p.current?.validationKey + "." + z.join(".")
      ).filter(([I, A]) => {
        let V = I?.split(".").length;
        if (I == z.join(".") && V == z.length - 1) {
          let $ = I + "." + z;
          R(I), xe($, A);
        }
      });
      const me = D(N, a), ye = D(h, a), ve = u.updateType === "update" ? a.join(".") : [...a].slice(0, -1).join("."), K = r.getState().stateComponents.get(g);
      if (console.log(
        "pathetocaheck.............................",
        a,
        u,
        ve ?? "NONE",
        K
      ), K)
        for (const [
          F,
          I
        ] of K.components.entries()) {
          let A = !1;
          const V = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (!V.includes("none")) {
            if (V.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if (V.includes("component")) {
              for (const $ of O) {
                if (I.paths.has($)) {
                  A = !0;
                  break;
                }
                let k = $;
                for (; k.includes("."); )
                  if (k = k.substring(
                    0,
                    k.lastIndexOf(".")
                  ), I.paths.has(k)) {
                    A = !0;
                    break;
                  }
                if (A) break;
                if (I.paths.has("")) {
                  A = !0;
                  break;
                }
              }
              if (!A && V.includes("deps") && I.depsFunction) {
                const $ = I.depsFunction(h);
                typeof $ == "boolean" ? $ && (A = !0) : U(I.deps, $) || (I.deps = $, A = !0);
              }
              A && I.forceUpdate();
            }
          }
        }
      const se = {
        timeStamp: Date.now(),
        stateKey: g,
        path: a,
        updateType: u.updateType,
        status: "new",
        oldValue: me,
        newValue: ye
      };
      if (Ce(g, (F) => {
        const A = [...F ?? [], se].reduce((V, $) => {
          const k = `${$.stateKey}:${JSON.stringify($.path)}`, b = V.get(k);
          return b ? (b.timeStamp = Math.max(b.timeStamp, $.timeStamp), b.newValue = $.newValue, b.oldValue = b.oldValue ?? $.oldValue, b.updateType = $.updateType) : V.set(k, { ...$ }), V;
        }, /* @__PURE__ */ new Map());
        return Array.from(A.values());
      }), Oe(
        h,
        g,
        p.current,
        x
      ), E && E({
        updateLog: s,
        update: se
      }), p.current?.serverSync) {
        const F = r.getState().serverState[g], I = p.current?.serverSync;
        be(g, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: h }),
          rollBackState: F,
          actionTimeStamp: Date.now() + (I.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return h;
    });
  };
  r.getState().updaterState[g] || (Y(
    g,
    X(
      g,
      n,
      P.current,
      x
    )
  ), r.getState().cogsStateStore[g] || G(g, e), r.getState().initialStateGlobal[g] || oe(g, e));
  const o = Ee(() => X(
    g,
    n,
    P.current,
    x
  ), [g]);
  return [fe(g), o];
}
function X(e, i, v, S) {
  const d = /* @__PURE__ */ new Map();
  let E = 0;
  const _ = (f) => {
    const t = f.join(".");
    for (const [y] of d)
      (y === t || y.startsWith(t + ".")) && d.delete(y);
    E++;
  }, m = {
    removeValidation: (f) => {
      f?.validationKey && R(f.validationKey);
    },
    revertToInitialState: (f) => {
      const t = r.getState().getInitialOptions(e)?.validation;
      t?.key && R(t?.key), f?.validationKey && R(f.validationKey);
      const y = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), d.clear(), E++;
      const C = c(y, []), T = B(e), x = L(T?.localStorage?.key) ? T?.localStorage?.key(y) : T?.localStorage?.key, M = `${S}-${e}-${x}`;
      M && localStorage.removeItem(M), Y(e, C), G(e, y);
      const g = r.getState().stateComponents.get(e);
      return g && g.components.forEach((s) => {
        s.forceUpdate();
      }), y;
    },
    updateInitialState: (f) => {
      d.clear(), E++;
      const t = X(
        e,
        i,
        v,
        S
      );
      return $e(() => {
        oe(e, f), Y(e, t), G(e, f);
        const y = r.getState().stateComponents.get(e);
        y && y.components.forEach((C) => {
          C.forceUpdate();
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
      return !!(f && U(f, fe(e)));
    }
  };
  function c(f, t = [], y) {
    const C = t.map(String).join(".");
    d.get(C);
    const T = function() {
      return r().getNestedState(e, t);
    };
    Object.keys(m).forEach((g) => {
      T[g] = m[g];
    });
    const x = {
      apply(g, s, W) {
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
          const n = r.getState().getNestedState(e, t), o = r.getState().initialStateGlobal[e], l = D(o, t);
          return U(n, l) ? "fresh" : "stale";
        }
        if (s === "getStatus")
          return function() {
            const n = r().getNestedState(
              e,
              t
            ), o = r.getState().initialStateGlobal[e], l = D(o, t);
            return U(n, l) ? "fresh" : "stale";
          };
        if (s === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[e], o = B(e), l = L(o?.localStorage?.key) ? o?.localStorage?.key(n) : o?.localStorage?.key, a = `${S}-${e}-${l}`;
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
          if (s === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(e, t.join(".")) ?? -1;
          if (s === "stateSort")
            return (n) => {
              const a = [...r.getState().getNestedState(e, t).map((u, w) => ({
                ...u,
                __origIndex: w.toString()
              }))].sort(n);
              return d.clear(), E++, c(a, t, {
                filtered: [...y?.filtered || [], t],
                validIndices: a.map(
                  (u) => parseInt(u.__origIndex)
                )
              });
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const o = y?.filtered?.some(
                (a) => a.join(".") === t.join(".")
              ), l = o ? f : r.getState().getNestedState(e, t);
              return s !== "stateMapNoRender" && (d.clear(), E++), l.map((a, u) => {
                const w = o && a.__origIndex ? a.__origIndex : u, N = c(
                  a,
                  [...t, w.toString()],
                  y
                );
                return n(
                  a,
                  N,
                  u,
                  f,
                  c(f, t, y)
                );
              });
            };
          if (s === "$stateMap")
            return (n) => Q(Fe, {
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
                (u) => u.join(".") === t.join(".")
              ) ? f : r.getState().getNestedState(e, t);
              d.clear(), E++;
              const a = l.flatMap(
                (u, w) => u[n] ?? []
              );
              return c(
                a,
                [...t, "[*]", n],
                y
              );
            };
          if (s === "findWith")
            return (n, o) => {
              const l = f.findIndex(
                (w) => w[n] === o
              );
              if (l === -1) return;
              const a = f[l], u = [...t, l.toString()];
              return d.clear(), E++, d.clear(), E++, c(a, u);
            };
          if (s === "index")
            return (n) => {
              const o = f[n];
              return c(o, [...t, n.toString()]);
            };
          if (s === "insert")
            return (n) => (_(t), ee(i, n, t, e), c(
              r.getState().cogsStateStore[e],
              []
            ));
          if (s === "uniqueInsert")
            return (n, o, l) => {
              const a = r.getState().getNestedState(e, t), u = L(n) ? n(a) : n;
              let w = null;
              if (!a.some((h) => {
                if (o) {
                  const O = o.every(
                    (q) => U(h[q], u[q])
                  );
                  return O && (w = h), O;
                }
                const j = U(h, u);
                return j && (w = h), j;
              }))
                _(t), ee(i, u, t, e);
              else if (l && w) {
                const h = l(w), j = a.map(
                  (O) => U(O, w) ? h : O
                );
                _(t), J(i, j, t);
              }
            };
          if (s === "cut")
            return (n, o) => {
              o?.waitForSync || (_(t), Z(i, t, e, n));
            };
          if (s === "cutByValue")
            return (n) => {
              for (let o = 0; o < f.length; o++)
                f[o] === n && Z(i, t, e, o);
            };
          if (s === "toggleByValue")
            return (n) => {
              const o = f.findIndex((l) => l === n);
              o > -1 ? Z(i, t, e, o) : ee(i, n, t, e);
            };
          if (s === "stateFilter")
            return (n) => {
              const o = f.map((u, w) => ({
                ...u,
                __origIndex: w.toString()
              })), l = [], a = [];
              for (let u = 0; u < o.length; u++)
                n(o[u], u) && (l.push(u), a.push(o[u]));
              return d.clear(), E++, c(a, t, {
                filtered: [...y?.filtered || [], t],
                validIndices: l
                // Always pass validIndices, even if empty
              });
            };
        }
        const W = t[t.length - 1];
        if (!isNaN(Number(W))) {
          const n = t.slice(0, -1), o = r.getState().getNestedState(e, n);
          if (Array.isArray(o) && s === "cut")
            return () => Z(
              i,
              n,
              e,
              Number(W)
            );
        }
        if (s === "get")
          return () => r.getState().getNestedState(e, t);
        if (s === "$derive")
          return (n) => te({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (s === "$derive")
          return (n) => te({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (s === "$get")
          return () => te({
            _stateKey: e,
            _path: t
          });
        if (s === "lastSynced") {
          const n = `${e}:${t.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (s == "getLocalStorage")
          return (n) => Se(S + "-" + e + "-" + n);
        if (s === "_selected") {
          const n = t.slice(0, -1), o = n.join("."), l = r.getState().getNestedState(e, n);
          return Array.isArray(l) ? Number(t[t.length - 1]) === r.getState().getSelectedIndex(e, o) : void 0;
        }
        if (s === "setSelected")
          return (n) => {
            const o = t.slice(0, -1), l = Number(t[t.length - 1]), a = o.join(".");
            n ? r.getState().setSelectedIndex(e, a, l) : r.getState().setSelectedIndex(e, a, void 0);
            const u = r.getState().getNestedState(e, [...o]);
            J(i, u, o), _(o);
          };
        if (t.length == 0) {
          if (s === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(e)?.validation, o = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              R(n.key);
              const l = r.getState().cogsStateStore[e];
              try {
                const a = r.getState().getValidationErrors(n.key);
                a && a.length > 0 && a.forEach(([w]) => {
                  w && w.startsWith(n.key) && R(w);
                });
                const u = n.zodSchema.safeParse(l);
                return u.success ? !0 : (u.error.errors.forEach((N) => {
                  const h = N.path, j = N.message, O = [n.key, ...h].join(".");
                  o(O, j);
                }), ie(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (s === "_componentId") return v;
          if (s === "getComponents")
            return () => r().stateComponents.get(e);
          if (s === "getAllFormRefs")
            return () => de.getState().getFormRefsByStateKey(e);
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
          return () => de.getState().getFormRef(e + "." + t.join("."));
        if (s === "validationWrapper")
          return ({
            children: n,
            hideMessage: o
          }) => /* @__PURE__ */ le(
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
        if (s === "_stateKey") return e;
        if (s === "_path") return t;
        if (s === "_isServerSynced") return m._isServerSynced;
        if (s === "update")
          return (n, o) => {
            if (o?.debounce)
              Ne(() => {
                J(i, n, t, "");
                const l = r.getState().getNestedState(e, t);
                o?.afterUpdate && o.afterUpdate(l);
              }, o.debounce);
            else {
              J(i, n, t, "");
              const l = r.getState().getNestedState(e, t);
              o?.afterUpdate && o.afterUpdate(l);
            }
            _(t);
          };
        if (s === "formElement")
          return (n, o) => /* @__PURE__ */ le(
            Ve,
            {
              setState: i,
              stateKey: e,
              path: t,
              child: n,
              formOpts: o
            }
          );
        const P = [...t, s], p = r.getState().getNestedState(e, P);
        return c(p, P, y);
      }
    }, M = new Proxy(T, x);
    return d.set(C, {
      proxy: M,
      stateVersion: E
    }), M;
  }
  return c(
    r.getState().getNestedState(e, [])
  );
}
function te(e) {
  return Q(Re, { proxy: e });
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
    (d, E, _, m, c) => e._mapFn(d, E, _, m, c)
  ) : null;
}
function Re({
  proxy: e
}) {
  const i = H(null), v = `${e._stateKey}-${e._path.join(".")}`;
  return re(() => {
    const S = i.current;
    if (!S || !S.parentElement) return;
    const d = S.parentElement, _ = Array.from(d.childNodes).indexOf(S);
    let m = d.getAttribute("data-parent-id");
    m || (m = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", m));
    const f = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: m,
      position: _,
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
    const C = document.createTextNode(String(y));
    S.replaceWith(C);
  }, [e._stateKey, e._path.join("."), e._effect]), Q("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": v
  });
}
function Ye(e) {
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
  return Q("text", {}, String(i));
}
export {
  te as $cogsSignal,
  Ye as $cogsSignalStore,
  Je as addStateOptions,
  Ze as createCogsState,
  He as notifyComponent,
  je as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
