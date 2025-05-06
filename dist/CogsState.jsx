"use client";
import { jsx as le } from "react/jsx-runtime";
import { useState as ne, useRef as Z, useEffect as re, useLayoutEffect as ve, useMemo as Ie, createElement as X, useSyncExternalStore as _e, startTransition as Ee } from "react";
import { transformStateFunc as pe, isFunction as L, getNestedValue as U, isDeepEqual as M, debounce as we } from "./utility.js";
import { pushFunc as ee, updateFn as B, cutFunc as J, ValidationWrapper as $e, FormControlComponent as Ae } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as de } from "./store.js";
import { useCogsConfig as Ne } from "./CogsStateClient.jsx";
import oe from "./node_modules/uuid/dist/esm-browser/v4.js";
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
  const S = q(e) || {}, d = v[e] || {}, E = r.getState().setInitialStateOptions, _ = { ...d, ...S };
  let m = !1;
  if (i)
    for (const c in i)
      _.hasOwnProperty(c) ? (c == "localStorage" && i[c] && _[c].key !== i[c]?.key && (m = !0, _[c] = i[c]), c == "initialState" && i[c] && _[c] !== i[c] && (m = !0, _[c] = i[c])) : (m = !0, _[c] = i[c]);
  m && E(e, _);
}
function qe(e, { formElements: i, validation: v }) {
  return { initialState: e, formElements: i, validation: v };
}
const ze = (e, i) => {
  let v = e;
  const [S, d] = pe(v);
  (Object.keys(d).length > 0 || i && Object.keys(i).length > 0) && Object.keys(d).forEach((m) => {
    d[m] = d[m] || {}, d[m].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...d[m].formElements || {}
      // State-specific overrides
    }, q(m) || r.getState().setInitialStateOptions(m, d[m]);
  }), r.getState().setInitialStates(S), r.getState().setCreatedState(S);
  const E = (m, c) => {
    const [f] = ne(c?.componentId ?? oe());
    ge({
      stateKey: m,
      options: c,
      initialOptionsPart: d
    });
    const t = r.getState().cogsStateStore[m] || S[m], y = c?.modifyState ? c.modifyState(t) : t, [x, T] = Oe(
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
  setUpdaterState: H,
  setState: D,
  getInitialOptions: q,
  getKeyState: fe,
  getValidationErrors: Te,
  setStateLog: Ve,
  updateInitialStateGlobal: ae,
  addValidationError: he,
  removeValidationError: P,
  setServerSyncActions: Ce
} = r.getState(), Se = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, ke = (e, i, v, S) => {
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
}, xe = (e, i, v, S, d, E) => {
  const _ = {
    initialState: i,
    updaterState: Y(
      e,
      S,
      d,
      E
    ),
    state: v
  };
  ae(e, _.initialState), H(e, _.updaterState), D(e, _.state);
}, ie = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const v = /* @__PURE__ */ new Set();
  i.components.forEach((S) => {
    (S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : null)?.includes("none") || v.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    v.forEach((S) => S());
  });
}, Be = (e, i) => {
  const v = r.getState().stateComponents.get(e);
  if (v) {
    const S = `${e}////${i}`, d = v.components.get(S);
    if ((d ? Array.isArray(d.reactiveType) ? d.reactiveType : [d.reactiveType || "component"] : null)?.includes("none"))
      return;
    d && d.forceUpdate();
  }
};
function Oe(e, {
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
  const [x, T] = ne({}), { sessionId: O } = Ne();
  let R = !i;
  const [g] = ne(i ?? oe()), s = r.getState().stateLog[g], G = Z(/* @__PURE__ */ new Set()), F = Z(c ?? oe()), h = Z(null);
  h.current = q(g), re(() => {
    if (t && t.stateKey === g && t.path?.[0]) {
      D(g, (o) => ({
        ...o,
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
    const l = h.current;
    let o = null;
    const u = L(l?.localStorage?.key) ? l?.localStorage?.key(f) : l?.localStorage?.key;
    console.log("newoptions", l), console.log("localkey", u), console.log("initialState", f), u && O && (o = Se(
      O + "-" + g + "-" + u
    ));
    const p = r.getState().iniitialCreatedState[g];
    console.log("createdState - intiual", p, f);
    let A = null;
    if (f) {
      A = f, o && o.lastUpdated > (o.lastSyncedWithServer || 0) && (A = o.state, l?.localStorage?.onChange && l?.localStorage?.onChange(A)), console.log("newState thius is newstate", A), xe(
        g,
        f,
        A,
        n,
        F.current,
        O
      ), ie(g);
      const w = Array.isArray(m) ? m : [m || "component"];
      console.log("reactiveTypes.............................", w), w.includes("none") || T({});
    }
  }, [f, ...y || []]), ve(() => {
    R && ue(g, {
      serverSync: v,
      formElements: d,
      initialState: f,
      localStorage: S,
      middleware: E
    });
    const l = `${g}////${F.current}`, o = r.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(l, {
      forceUpdate: () => T({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: m ?? ["component", "deps"]
    }), r.getState().stateComponents.set(g, o), T({}), () => {
      const u = `${g}////${F.current}`;
      o && (o.components.delete(u), o.components.size === 0 && r.getState().stateComponents.delete(g));
    };
  }, []);
  const n = (l, o, u, p) => {
    if (Array.isArray(o)) {
      const A = `${g}-${o.join(".")}`;
      G.current.add(A);
    }
    D(g, (A) => {
      const w = L(l) ? l(A) : l, b = `${g}-${o.join(".")}`;
      if (b) {
        let k = !1, I = r.getState().signalDomElements.get(b);
        if ((!I || I.size === 0) && (u.updateType === "insert" || u.updateType === "cut")) {
          const N = o.slice(0, -1), V = U(w, N);
          if (Array.isArray(V)) {
            k = !0;
            const $ = `${g}-${N.join(".")}`;
            I = r.getState().signalDomElements.get($);
          }
        }
        if (I) {
          const N = k ? U(w, o.slice(0, -1)) : U(w, o);
          I.forEach(({ parentId: V, position: $, effect: W }) => {
            const j = document.querySelector(
              `[data-parent-id="${V}"]`
            );
            if (j) {
              const ce = Array.from(j.childNodes);
              if (ce[$]) {
                const ye = W ? new Function("state", `return (${W})(state)`)(N) : N;
                ce[$].textContent = String(ye);
              }
            }
          });
        }
      }
      u.updateType === "update" && (p || h.current?.validationKey) && o && P(
        (p || h.current?.validationKey) + "." + o.join(".")
      );
      const C = o.slice(0, o.length - 1);
      u.updateType === "cut" && h.current?.validationKey && P(
        h.current?.validationKey + "." + C.join(".")
      ), u.updateType === "insert" && h.current?.validationKey && Te(
        h.current?.validationKey + "." + C.join(".")
      ).filter(([I, N]) => {
        let V = I?.split(".").length;
        if (I == C.join(".") && V == C.length - 1) {
          let $ = I + "." + C;
          P(I), he($, N);
        }
      });
      const z = U(A, o), me = U(w, o), Q = u.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), K = r.getState().stateComponents.get(g);
      if (console.log(
        "pathetocaheck.............................",
        Q,
        K
      ), K)
        for (const [k, I] of K.components.entries()) {
          let N = !1;
          const V = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (console.log("component.............................", k, I), !V.includes("none")) {
            if (V.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if (V.includes("component") && (console.log(
              "component.............................includes(component1111",
              k,
              I.paths,
              Q
            ), I.paths && (I.paths.has(Q) || I.paths.has("")) && (console.log(
              "component.............................includes(component22222",
              k,
              I
            ), N = !0)), !N && V.includes("deps") && (console.log(
              "component.............................includes(deps",
              k,
              I
            ), I.depsFunction)) {
              const $ = I.depsFunction(w);
              console.log(
                "depsResult.............................includes(deps",
                I.deps,
                $
              ), typeof $ == "boolean" ? $ && (N = !0) : M(I.deps, $) || (I.deps = $, N = !0);
            }
            N && I.forceUpdate();
          }
        }
      const se = {
        timeStamp: Date.now(),
        stateKey: g,
        path: o,
        updateType: u.updateType,
        status: "new",
        oldValue: z,
        newValue: me
      };
      if (Ve(g, (k) => {
        const N = [...k ?? [], se].reduce((V, $) => {
          const W = `${$.stateKey}:${JSON.stringify($.path)}`, j = V.get(W);
          return j ? (j.timeStamp = Math.max(j.timeStamp, $.timeStamp), j.newValue = $.newValue, j.oldValue = j.oldValue ?? $.oldValue, j.updateType = $.updateType) : V.set(W, { ...$ }), V;
        }, /* @__PURE__ */ new Map());
        return Array.from(N.values());
      }), ke(
        w,
        g,
        h.current,
        O
      ), E && E({
        updateLog: s,
        update: se
      }), h.current?.serverSync) {
        const k = r.getState().serverState[g], I = h.current?.serverSync;
        Ce(g, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: w }),
          rollBackState: k,
          actionTimeStamp: Date.now() + (I.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return w;
    });
  };
  r.getState().updaterState[g] || (H(
    g,
    Y(
      g,
      n,
      F.current,
      O
    )
  ), r.getState().cogsStateStore[g] || D(g, e), r.getState().initialStateGlobal[g] || ae(g, e));
  const a = Ie(() => Y(
    g,
    n,
    F.current,
    O
  ), [g]);
  return [fe(g), a];
}
function Y(e, i, v, S) {
  const d = /* @__PURE__ */ new Map();
  let E = 0;
  const _ = (f) => {
    const t = f.join(".");
    for (const [y] of d)
      (y === t || y.startsWith(t + ".")) && d.delete(y);
    E++;
  }, m = {
    removeValidation: (f) => {
      f?.validationKey && P(f.validationKey);
    },
    revertToInitialState: (f) => {
      const t = r.getState().getInitialOptions(e)?.validation;
      t?.key && P(t?.key), f?.validationKey && P(f.validationKey);
      const y = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), d.clear(), E++;
      const x = c(y, []), T = q(e), O = L(T?.localStorage?.key) ? T?.localStorage?.key(y) : T?.localStorage?.key, R = `${S}-${e}-${O}`;
      R && localStorage.removeItem(R), H(e, x), D(e, y);
      const g = r.getState().stateComponents.get(e);
      return g && g.components.forEach((s) => {
        s.forceUpdate();
      }), y;
    },
    updateInitialState: (f) => {
      d.clear(), E++;
      const t = Y(
        e,
        i,
        v,
        S
      );
      return Ee(() => {
        ae(e, f), H(e, t), D(e, f);
        const y = r.getState().stateComponents.get(e);
        y && y.components.forEach((x) => {
          x.forceUpdate();
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
      return !!(f && M(f, fe(e)));
    }
  };
  function c(f, t = [], y) {
    const x = t.map(String).join(".");
    d.get(x);
    const T = function() {
      return r().getNestedState(e, t);
    };
    Object.keys(m).forEach((g) => {
      T[g] = m[g];
    });
    const O = {
      apply(g, s, G) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, t);
      },
      get(g, s) {
        if (s !== "then" && !s.startsWith("$") && s !== "stateMapNoRender") {
          const n = t.join("."), a = `${e}////${v}`, l = r.getState().stateComponents.get(e);
          if (l) {
            const o = l.components.get(a);
            o && (t.length > 0 || s === "get") && o.paths.add(n);
          }
        }
        if (s === "_status") {
          const n = r.getState().getNestedState(e, t), a = r.getState().initialStateGlobal[e], l = U(a, t);
          return M(n, l) ? "fresh" : "stale";
        }
        if (s === "getStatus")
          return function() {
            const n = r().getNestedState(
              e,
              t
            ), a = r.getState().initialStateGlobal[e], l = U(a, t);
            return M(n, l) ? "fresh" : "stale";
          };
        if (s === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[e], a = q(e), l = L(a?.localStorage?.key) ? a?.localStorage?.key(n) : a?.localStorage?.key, o = `${S}-${e}-${l}`;
            console.log("removing storage", o), o && localStorage.removeItem(o);
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
              const o = [...r.getState().getNestedState(e, t).map((u, p) => ({
                ...u,
                __origIndex: p.toString()
              }))].sort(n);
              return d.clear(), E++, c(o, t, {
                filtered: [...y?.filtered || [], t],
                validIndices: o.map(
                  (u) => parseInt(u.__origIndex)
                )
              });
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const a = y?.filtered?.some(
                (o) => o.join(".") === t.join(".")
              ), l = a ? f : r.getState().getNestedState(e, t);
              return s !== "stateMapNoRender" && (d.clear(), E++), l.map((o, u) => {
                const p = a && o.__origIndex ? o.__origIndex : u, A = c(
                  o,
                  [...t, p.toString()],
                  y
                );
                return n(
                  o,
                  A,
                  u,
                  f,
                  c(f, t, y)
                );
              });
            };
          if (s === "$stateMap")
            return (n) => X(je, {
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
              const o = l.flatMap(
                (u, p) => u[n] ?? []
              );
              return c(
                o,
                [...t, "[*]", n],
                y
              );
            };
          if (s === "findWith")
            return (n, a) => {
              const l = f.findIndex(
                (p) => p[n] === a
              );
              if (l === -1) return;
              const o = f[l], u = [...t, l.toString()];
              return d.clear(), E++, d.clear(), E++, c(o, u);
            };
          if (s === "index")
            return (n) => {
              const a = f[n];
              return c(a, [...t, n.toString()]);
            };
          if (s === "insert")
            return (n) => (_(t), ee(i, n, t, e), c(
              r.getState().cogsStateStore[e],
              []
            ));
          if (s === "uniqueInsert")
            return (n, a, l) => {
              const o = r.getState().getNestedState(e, t), u = L(n) ? n(o) : n;
              let p = null;
              if (!o.some((w) => {
                if (a) {
                  const C = a.every(
                    (z) => M(w[z], u[z])
                  );
                  return C && (p = w), C;
                }
                const b = M(w, u);
                return b && (p = w), b;
              }))
                _(t), ee(i, u, t, e);
              else if (l && p) {
                const w = l(p), b = o.map(
                  (C) => M(C, p) ? w : C
                );
                _(t), B(i, b, t);
              }
            };
          if (s === "cut")
            return (n, a) => {
              a?.waitForSync || (_(t), J(i, t, e, n));
            };
          if (s === "cutByValue")
            return (n) => {
              for (let a = 0; a < f.length; a++)
                f[a] === n && J(i, t, e, a);
            };
          if (s === "toggleByValue")
            return (n) => {
              const a = f.findIndex((l) => l === n);
              a > -1 ? J(i, t, e, a) : ee(i, n, t, e);
            };
          if (s === "stateFilter")
            return (n) => {
              const a = f.map((u, p) => ({
                ...u,
                __origIndex: p.toString()
              })), l = [], o = [];
              for (let u = 0; u < a.length; u++)
                n(a[u], u) && (l.push(u), o.push(a[u]));
              return d.clear(), E++, c(o, t, {
                filtered: [...y?.filtered || [], t],
                validIndices: l
                // Always pass validIndices, even if empty
              });
            };
        }
        const G = t[t.length - 1];
        if (!isNaN(Number(G))) {
          const n = t.slice(0, -1), a = r.getState().getNestedState(e, n);
          if (Array.isArray(a) && s === "cut")
            return () => J(
              i,
              n,
              e,
              Number(G)
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
          const n = t.slice(0, -1), a = n.join("."), l = r.getState().getNestedState(e, n);
          return Array.isArray(l) ? Number(t[t.length - 1]) === r.getState().getSelectedIndex(e, a) : void 0;
        }
        if (s === "setSelected")
          return (n) => {
            const a = t.slice(0, -1), l = Number(t[t.length - 1]), o = a.join(".");
            n ? r.getState().setSelectedIndex(e, o, l) : r.getState().setSelectedIndex(e, o, void 0);
            const u = r.getState().getNestedState(e, [...a]);
            B(i, u, a), _(a);
          };
        if (t.length == 0) {
          if (s === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(e)?.validation, a = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              P(n.key);
              const l = r.getState().cogsStateStore[e];
              try {
                const o = r.getState().getValidationErrors(n.key);
                o && o.length > 0 && o.forEach(([p]) => {
                  p && p.startsWith(n.key) && P(p);
                });
                const u = n.zodSchema.safeParse(l);
                return u.success ? !0 : (u.error.errors.forEach((A) => {
                  const w = A.path, b = A.message, C = [n.key, ...w].join(".");
                  a(C, b);
                }), ie(e), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
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
            hideMessage: a
          }) => /* @__PURE__ */ le(
            $e,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
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
          return (n, a) => {
            if (a?.debounce)
              we(() => {
                B(i, n, t, "");
                const l = r.getState().getNestedState(e, t);
                a?.afterUpdate && a.afterUpdate(l);
              }, a.debounce);
            else {
              B(i, n, t, "");
              const l = r.getState().getNestedState(e, t);
              a?.afterUpdate && a.afterUpdate(l);
            }
            _(t);
          };
        if (s === "formElement")
          return (n, a) => /* @__PURE__ */ le(
            Ae,
            {
              setState: i,
              stateKey: e,
              path: t,
              child: n,
              formOpts: a
            }
          );
        const F = [...t, s], h = r.getState().getNestedState(e, F);
        return c(h, F, y);
      }
    }, R = new Proxy(T, O);
    return d.set(x, {
      proxy: R,
      stateVersion: E
    }), R;
  }
  return c(
    r.getState().getNestedState(e, [])
  );
}
function te(e) {
  return X(be, { proxy: e });
}
function je({
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
function be({
  proxy: e
}) {
  const i = Z(null), v = `${e._stateKey}-${e._path.join(".")}`;
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
    const x = document.createTextNode(String(y));
    S.replaceWith(x);
  }, [e._stateKey, e._path.join("."), e._effect]), X("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": v
  });
}
function Je(e) {
  const i = _e(
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
  return X("text", {}, String(i));
}
export {
  te as $cogsSignal,
  Je as $cogsSignalStore,
  qe as addStateOptions,
  ze as createCogsState,
  Be as notifyComponent,
  Oe as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
