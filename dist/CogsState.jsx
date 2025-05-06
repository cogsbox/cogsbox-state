"use client";
import { jsx as le } from "react/jsx-runtime";
import { useState as H, useRef as G, useEffect as ne, useLayoutEffect as ve, useMemo as Ie, createElement as Q, useSyncExternalStore as Ee, startTransition as _e } from "react";
import { transformStateFunc as pe, isFunction as D, isDeepEqual as U, getNestedValue as L, debounce as $e } from "./utility.js";
import { pushFunc as ee, updateFn as J, cutFunc as Z, ValidationWrapper as we, FormControlComponent as Ae } from "./Functions.jsx";
import "zod";
import { getGlobalStore as n, formRefStore as de } from "./store.js";
import { useCogsConfig as Ne } from "./CogsStateClient.jsx";
import re from "./node_modules/uuid/dist/esm-browser/v4.js";
function Te(e, i) {
  const I = n.getState().getInitialOptions, m = n.getState().setInitialStateOptions, d = I(e) || {};
  m(e, {
    ...d,
    ...i
  });
}
function ue({
  stateKey: e,
  options: i,
  initialOptionsPart: I
}) {
  const m = B(e) || {}, d = I[e] || {}, p = n.getState().setInitialStateOptions, _ = { ...d, ...m };
  let g = !1;
  if (i)
    for (const l in i)
      _.hasOwnProperty(l) ? (l == "localStorage" && i[l] && _[l].key !== i[l]?.key && (g = !0, _[l] = i[l]), l == "initialState" && i[l] && _[l] !== i[l] && (g = !0, _[l] = i[l])) : (g = !0, _[l] = i[l]);
  g && p(e, _);
}
function ze(e, { formElements: i, validation: I }) {
  return { initialState: e, formElements: i, validation: I };
}
const Be = (e, i) => {
  let I = e;
  const [m, d] = pe(I);
  (Object.keys(d).length > 0 || i && Object.keys(i).length > 0) && Object.keys(d).forEach((g) => {
    d[g] = d[g] || {}, d[g].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...d[g].formElements || {}
      // State-specific overrides
    }, B(g) || n.getState().setInitialStateOptions(g, d[g]);
  }), n.getState().setInitialStates(m), n.getState().setCreatedState(m);
  const p = (g, l) => {
    const [f] = H(l?.componentId ?? re());
    ue({
      stateKey: g,
      options: l,
      initialOptionsPart: d
    });
    const t = n.getState().cogsStateStore[g] || m[g], y = l?.modifyState ? l.modifyState(t) : t, [F, h] = Oe(
      y,
      {
        stateKey: g,
        syncUpdate: l?.syncUpdate,
        componentId: f,
        localStorage: l?.localStorage,
        middleware: l?.middleware,
        enabledSync: l?.enabledSync,
        reactiveType: l?.reactiveType,
        reactiveDeps: l?.reactiveDeps,
        initialState: l?.initialState,
        dependencies: l?.dependencies
      }
    );
    return h;
  };
  function _(g, l) {
    ue({ stateKey: g, options: l, initialOptionsPart: d }), ae(g);
  }
  return { useCogsState: p, setCogsOptions: _ };
}, {
  setUpdaterState: Y,
  setState: W,
  getInitialOptions: B,
  getKeyState: ge,
  getValidationErrors: Ve,
  setStateLog: he,
  updateInitialStateGlobal: oe,
  addValidationError: Ce,
  removeValidationError: M,
  setServerSyncActions: ke
} = n.getState(), fe = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, xe = (e, i, I, m) => {
  I?.log && console.log(
    "saving to localstorage",
    i,
    I.localStorage?.key,
    m
  );
  const d = D(I?.localStorage?.key) ? I.localStorage?.key(e) : I?.localStorage?.key;
  if (d && m) {
    const p = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: n.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: n.getState().serverState[i]
    }, _ = `${m}-${i}-${d}`;
    window.localStorage.setItem(_, JSON.stringify(p));
  }
}, Fe = (e, i, I, m, d, p) => {
  const _ = {
    initialState: i,
    updaterState: X(
      e,
      m,
      d,
      p
    ),
    state: I
  };
  oe(e, _.initialState), Y(e, _.updaterState), W(e, _.state);
}, ae = (e) => {
  const i = n.getState().stateComponents.get(e);
  if (!i) return;
  const I = /* @__PURE__ */ new Set();
  i.components.forEach((m) => {
    (m ? Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"] : null)?.includes("none") || I.add(() => m.forceUpdate());
  }), queueMicrotask(() => {
    I.forEach((m) => m());
  });
}, Je = (e, i) => {
  const I = n.getState().stateComponents.get(e);
  if (I) {
    const m = `${e}////${i}`, d = I.components.get(m);
    if ((d ? Array.isArray(d.reactiveType) ? d.reactiveType : [d.reactiveType || "component"] : null)?.includes("none"))
      return;
    d && d.forceUpdate();
  }
};
function Oe(e, {
  stateKey: i,
  serverSync: I,
  localStorage: m,
  formElements: d,
  middleware: p,
  reactiveDeps: _,
  reactiveType: g,
  componentId: l,
  initialState: f,
  syncUpdate: t,
  dependencies: y
} = {}) {
  const [F, h] = H({}), { sessionId: O } = Ne(), [u] = H(i ?? re()), R = n.getState().stateLog[u], c = G(/* @__PURE__ */ new Set()), k = G(l ?? re()), T = G(null);
  T.current = B(u), ne(() => {
    if (t && t.stateKey === u && t.path?.[0]) {
      W(u, (a) => ({
        ...a,
        [t.path[0]]: t.newValue
      }));
      const s = `${t.stateKey}:${t.path.join(".")}`;
      n.getState().setSyncInfo(s, {
        timeStamp: t.timeStamp,
        userId: t.userId
      });
    }
  }, [t]), ne(() => {
    f && Te(u, {
      initialState: f
    });
    const s = T.current;
    let a = null;
    const S = D(s?.localStorage?.key) ? s?.localStorage?.key(f) : s?.localStorage?.key;
    console.log("newoptions", s), console.log("localkey", S), console.log("initialState", f), S && O && (a = fe(
      O + "-" + u + "-" + S
    ));
    const C = n.getState().iniitialCreatedState[u];
    console.log("createdState - intiual", C, f);
    let w = null;
    if (f) {
      w = f, a && a.lastUpdated > (a.lastSyncedWithServer || 0) && (w = a.state, s?.localStorage?.onChange && s?.localStorage?.onChange(w)), console.log("newState thius is newstate", w), Fe(
        u,
        f,
        w,
        o,
        k.current,
        O
      ), ae(u);
      const A = Array.isArray(g) ? g : [g || "component"];
      console.log("reactiveTypes.............................", A), A.includes("none") || h({});
    }
  }, [f, ...y || []]);
  const q = G(
    g ?? ["component", "deps"]
  ).current, r = G(_).current;
  H(() => {
    const s = `${u}////${k.current}`, a = n.getState().stateComponents.get(u) || {
      components: /* @__PURE__ */ new Map()
    };
    a.components.has(s) || (a.components.set(s, {
      forceUpdate: () => {
      },
      // Placeholder, replaced in useLayoutEffect
      paths: /* @__PURE__ */ new Set(),
      // Initialize paths Set
      deps: [],
      depsFunction: r || void 0,
      reactiveType: Array.isArray(q) ? q : [q]
    }), n.getState().stateComponents.set(u, a));
  }), ve(() => {
    const s = `${u}////${k.current}`, a = n.getState().stateComponents.get(u);
    if (a) {
      const S = a.components.get(s);
      if (S) {
        const C = Array.isArray(g) ? g : [g || "component"];
        (S.forceUpdate.toString() === (() => {
        }).toString() || // Check if it's placeholder
        !U([S.reactiveType], C) || S.depsFunction !== _) && a.components.set(s, {
          ...S,
          forceUpdate: () => h({}),
          // Set the REAL forceUpdate
          reactiveType: C,
          depsFunction: _ || void 0
        });
      } else
        console.error(
          `[${u}/${k.current}] Component data missing in useLayoutEffect!`
        );
    } else
      console.error(
        `[${u}/${k.current}] State entry missing in useLayoutEffect!`
      );
    return () => {
      const S = n.getState().stateComponents.get(u);
      S && (S.components.delete(s), S.components.size);
    };
  }, [u, _, g]);
  const o = (s, a, S, C) => {
    if (Array.isArray(a)) {
      const w = `${u}-${a.join(".")}`;
      c.current.add(w);
    }
    W(u, (w) => {
      const A = D(s) ? s(w) : s, j = `${u}-${a.join(".")}`;
      if (j) {
        let x = !1, E = n.getState().signalDomElements.get(j);
        if ((!E || E.size === 0) && (S.updateType === "insert" || S.updateType === "cut")) {
          const N = a.slice(0, -1), V = L(A, N);
          if (Array.isArray(V)) {
            x = !0;
            const $ = `${u}-${N.join(".")}`;
            E = n.getState().signalDomElements.get($);
          }
        }
        if (E) {
          const N = x ? L(A, a.slice(0, -1)) : L(A, a);
          E.forEach(({ parentId: V, position: $, effect: z }) => {
            const b = document.querySelector(
              `[data-parent-id="${V}"]`
            );
            if (b) {
              const ce = Array.from(b.childNodes);
              if (ce[$]) {
                const ye = z ? new Function("state", `return (${z})(state)`)(N) : N;
                ce[$].textContent = String(ye);
              }
            }
          });
        }
      }
      S.updateType === "update" && (C || T.current?.validationKey) && a && M(
        (C || T.current?.validationKey) + "." + a.join(".")
      );
      const P = a.slice(0, a.length - 1);
      S.updateType === "cut" && T.current?.validationKey && M(
        T.current?.validationKey + "." + P.join(".")
      ), S.updateType === "insert" && T.current?.validationKey && Ve(
        T.current?.validationKey + "." + P.join(".")
      ).filter(([E, N]) => {
        let V = E?.split(".").length;
        if (E == P.join(".") && V == P.length - 1) {
          let $ = E + "." + P;
          M(E), Ce($, N);
        }
      });
      const Se = L(w, a), me = L(A, a), ie = S.updateType === "update" ? a.join(".") : [...a].slice(0, -1).join("."), K = n.getState().stateComponents.get(u);
      if (console.log(
        "pathetocaheck.............................",
        ie,
        K
      ), K)
        for (const [x, E] of K.components.entries()) {
          let N = !1;
          const V = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
          if (console.log("component.............................", x, E), !V.includes("none")) {
            if (V.includes("all")) {
              E.forceUpdate();
              continue;
            }
            if (V.includes("component") && E.paths && (E.paths.has(ie) || E.paths.has("")) && (console.log(
              "component.............................includes(component",
              x,
              E
            ), N = !0), !N && V.includes("deps") && (console.log(
              "component.............................includes(deps",
              x,
              E
            ), E.depsFunction)) {
              const $ = E.depsFunction(A);
              console.log(
                "depsResult.............................includes(deps",
                E.deps,
                $
              ), typeof $ == "boolean" ? $ && (N = !0) : U(E.deps, $) || (E.deps = $, N = !0);
            }
            N && E.forceUpdate();
          }
        }
      const se = {
        timeStamp: Date.now(),
        stateKey: u,
        path: a,
        updateType: S.updateType,
        status: "new",
        oldValue: Se,
        newValue: me
      };
      if (he(u, (x) => {
        const N = [...x ?? [], se].reduce((V, $) => {
          const z = `${$.stateKey}:${JSON.stringify($.path)}`, b = V.get(z);
          return b ? (b.timeStamp = Math.max(b.timeStamp, $.timeStamp), b.newValue = $.newValue, b.oldValue = b.oldValue ?? $.oldValue, b.updateType = $.updateType) : V.set(z, { ...$ }), V;
        }, /* @__PURE__ */ new Map());
        return Array.from(N.values());
      }), xe(
        A,
        u,
        T.current,
        O
      ), p && p({
        updateLog: R,
        update: se
      }), T.current?.serverSync) {
        const x = n.getState().serverState[u], E = T.current?.serverSync;
        ke(u, {
          syncKey: typeof E.syncKey == "string" ? E.syncKey : E.syncKey({ state: A }),
          rollBackState: x,
          actionTimeStamp: Date.now() + (E.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return A;
    });
  };
  n.getState().updaterState[u] || (Y(
    u,
    X(
      u,
      o,
      k.current,
      O
    )
  ), n.getState().cogsStateStore[u] || W(u, e), n.getState().initialStateGlobal[u] || oe(u, e));
  const v = Ie(() => X(
    u,
    o,
    k.current,
    O
  ), [u]);
  return [ge(u), v];
}
function X(e, i, I, m) {
  const d = /* @__PURE__ */ new Map();
  let p = 0;
  const _ = (f) => {
    const t = f.join(".");
    for (const [y] of d)
      (y === t || y.startsWith(t + ".")) && d.delete(y);
    p++;
  }, g = {
    removeValidation: (f) => {
      f?.validationKey && M(f.validationKey);
    },
    revertToInitialState: (f) => {
      const t = n.getState().getInitialOptions(e)?.validation;
      t?.key && M(t?.key), f?.validationKey && M(f.validationKey);
      const y = n.getState().initialStateGlobal[e];
      n.getState().clearSelectedIndexesForState(e), d.clear(), p++;
      const F = l(y, []), h = B(e), O = D(h?.localStorage?.key) ? h?.localStorage?.key(y) : h?.localStorage?.key, u = `${m}-${e}-${O}`;
      u && localStorage.removeItem(u), Y(e, F), W(e, y);
      const R = n.getState().stateComponents.get(e);
      return R && R.components.forEach((c) => {
        c.forceUpdate();
      }), y;
    },
    updateInitialState: (f) => {
      d.clear(), p++;
      const t = X(
        e,
        i,
        I,
        m
      );
      return _e(() => {
        oe(e, f), Y(e, t), W(e, f);
        const y = n.getState().stateComponents.get(e);
        y && y.components.forEach((F) => {
          F.forceUpdate();
        });
      }), {
        fetchId: (y) => t.get()[y]
      };
    },
    _initialState: n.getState().initialStateGlobal[e],
    _serverState: n.getState().serverState[e],
    _isLoading: n.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const f = n.getState().serverState[e];
      return !!(f && U(f, ge(e)));
    }
  };
  function l(f, t = [], y) {
    const F = t.map(String).join(".");
    d.get(F);
    const h = function() {
      return n().getNestedState(e, t);
    };
    Object.keys(g).forEach((R) => {
      h[R] = g[R];
    });
    const O = {
      apply(R, c, k) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), n().getNestedState(e, t);
      },
      get(R, c) {
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender") {
          const r = t.join("."), o = `${e}////${I}`, v = n.getState().stateComponents.get(e);
          if (v) {
            const s = v.components.get(o);
            s && (t.length > 0 || c === "get") && s.paths.add(r);
          }
        }
        if (c === "_status") {
          const r = n.getState().getNestedState(e, t), o = n.getState().initialStateGlobal[e], v = L(o, t);
          return U(r, v) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const r = n().getNestedState(
              e,
              t
            ), o = n.getState().initialStateGlobal[e], v = L(o, t);
            return U(r, v) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const r = n.getState().initialStateGlobal[e], o = B(e), v = D(o?.localStorage?.key) ? o?.localStorage?.key(r) : o?.localStorage?.key, s = `${m}-${e}-${v}`;
            console.log("removing storage", s), s && localStorage.removeItem(s);
          };
        if (c === "showValidationErrors")
          return () => {
            const r = n.getState().getInitialOptions(e)?.validation;
            if (!r?.key)
              throw new Error("Validation key not found");
            return n.getState().getValidationErrors(r.key + "." + t.join("."));
          };
        if (Array.isArray(f)) {
          if (c === "getSelected")
            return () => {
              const r = n.getState().getSelectedIndex(e, t.join("."));
              if (r !== void 0)
                return l(
                  f[r],
                  [...t, r.toString()],
                  y
                );
            };
          if (c === "getSelectedIndex")
            return () => n.getState().getSelectedIndex(e, t.join(".")) ?? -1;
          if (c === "stateSort")
            return (r) => {
              const s = [...n.getState().getNestedState(e, t).map((a, S) => ({
                ...a,
                __origIndex: S.toString()
              }))].sort(r);
              return d.clear(), p++, l(s, t, {
                filtered: [...y?.filtered || [], t],
                validIndices: s.map(
                  (a) => parseInt(a.__origIndex)
                )
              });
            };
          if (c === "stateMap" || c === "stateMapNoRender")
            return (r) => {
              const o = y?.filtered?.some(
                (s) => s.join(".") === t.join(".")
              ), v = o ? f : n.getState().getNestedState(e, t);
              return c !== "stateMapNoRender" && (d.clear(), p++), v.map((s, a) => {
                const S = o && s.__origIndex ? s.__origIndex : a, C = l(
                  s,
                  [...t, S.toString()],
                  y
                );
                return r(
                  s,
                  C,
                  a,
                  f,
                  l(f, t, y)
                );
              });
            };
          if (c === "$stateMap")
            return (r) => Q(je, {
              proxy: {
                _stateKey: e,
                _path: t,
                _mapFn: r
                // Pass the actual function, not string
              },
              rebuildStateShape: l
            });
          if (c === "stateFlattenOn")
            return (r) => {
              const v = y?.filtered?.some(
                (a) => a.join(".") === t.join(".")
              ) ? f : n.getState().getNestedState(e, t);
              d.clear(), p++;
              const s = v.flatMap(
                (a, S) => a[r] ?? []
              );
              return l(
                s,
                [...t, "[*]", r],
                y
              );
            };
          if (c === "findWith")
            return (r, o) => {
              const v = f.findIndex(
                (S) => S[r] === o
              );
              if (v === -1) return;
              const s = f[v], a = [...t, v.toString()];
              return d.clear(), p++, d.clear(), p++, l(s, a);
            };
          if (c === "index")
            return (r) => {
              const o = f[r];
              return l(o, [...t, r.toString()]);
            };
          if (c === "insert")
            return (r) => (_(t), ee(i, r, t, e), l(
              n.getState().cogsStateStore[e],
              []
            ));
          if (c === "uniqueInsert")
            return (r, o, v) => {
              const s = n.getState().getNestedState(e, t), a = D(r) ? r(s) : r;
              let S = null;
              if (!s.some((w) => {
                if (o) {
                  const j = o.every(
                    (P) => U(w[P], a[P])
                  );
                  return j && (S = w), j;
                }
                const A = U(w, a);
                return A && (S = w), A;
              }))
                _(t), ee(i, a, t, e);
              else if (v && S) {
                const w = v(S), A = s.map(
                  (j) => U(j, S) ? w : j
                );
                _(t), J(i, A, t);
              }
            };
          if (c === "cut")
            return (r, o) => {
              o?.waitForSync || (_(t), Z(i, t, e, r));
            };
          if (c === "cutByValue")
            return (r) => {
              for (let o = 0; o < f.length; o++)
                f[o] === r && Z(i, t, e, o);
            };
          if (c === "toggleByValue")
            return (r) => {
              const o = f.findIndex((v) => v === r);
              o > -1 ? Z(i, t, e, o) : ee(i, r, t, e);
            };
          if (c === "stateFilter")
            return (r) => {
              const o = f.map((a, S) => ({
                ...a,
                __origIndex: S.toString()
              })), v = [], s = [];
              for (let a = 0; a < o.length; a++)
                r(o[a], a) && (v.push(a), s.push(o[a]));
              return d.clear(), p++, l(s, t, {
                filtered: [...y?.filtered || [], t],
                validIndices: v
                // Always pass validIndices, even if empty
              });
            };
        }
        const k = t[t.length - 1];
        if (!isNaN(Number(k))) {
          const r = t.slice(0, -1), o = n.getState().getNestedState(e, r);
          if (Array.isArray(o) && c === "cut")
            return () => Z(
              i,
              r,
              e,
              Number(k)
            );
        }
        if (c === "get")
          return () => n.getState().getNestedState(e, t);
        if (c === "$derive")
          return (r) => te({
            _stateKey: e,
            _path: t,
            _effect: r.toString()
          });
        if (c === "$derive")
          return (r) => te({
            _stateKey: e,
            _path: t,
            _effect: r.toString()
          });
        if (c === "$get")
          return () => te({
            _stateKey: e,
            _path: t
          });
        if (c === "lastSynced") {
          const r = `${e}:${t.join(".")}`;
          return n.getState().getSyncInfo(r);
        }
        if (c == "getLocalStorage")
          return (r) => fe(m + "-" + e + "-" + r);
        if (c === "_selected") {
          const r = t.slice(0, -1), o = r.join("."), v = n.getState().getNestedState(e, r);
          return Array.isArray(v) ? Number(t[t.length - 1]) === n.getState().getSelectedIndex(e, o) : void 0;
        }
        if (c === "setSelected")
          return (r) => {
            const o = t.slice(0, -1), v = Number(t[t.length - 1]), s = o.join(".");
            r ? n.getState().setSelectedIndex(e, s, v) : n.getState().setSelectedIndex(e, s, void 0);
            const a = n.getState().getNestedState(e, [...o]);
            J(i, a, o), _(o);
          };
        if (t.length == 0) {
          if (c === "validateZodSchema")
            return () => {
              const r = n.getState().getInitialOptions(e)?.validation, o = n.getState().addValidationError;
              if (!r?.zodSchema)
                throw new Error("Zod schema not found");
              if (!r?.key)
                throw new Error("Validation key not found");
              M(r.key);
              const v = n.getState().cogsStateStore[e];
              try {
                const s = n.getState().getValidationErrors(r.key);
                s && s.length > 0 && s.forEach(([S]) => {
                  S && S.startsWith(r.key) && M(S);
                });
                const a = r.zodSchema.safeParse(v);
                return a.success ? !0 : (a.error.errors.forEach((C) => {
                  const w = C.path, A = C.message, j = [r.key, ...w].join(".");
                  o(j, A);
                }), ae(e), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (c === "_componentId") return I;
          if (c === "getComponents")
            return () => n().stateComponents.get(e);
          if (c === "getAllFormRefs")
            return () => de.getState().getFormRefsByStateKey(e);
          if (c === "_initialState")
            return n.getState().initialStateGlobal[e];
          if (c === "_serverState")
            return n.getState().serverState[e];
          if (c === "_isLoading")
            return n.getState().isLoadingGlobal[e];
          if (c === "revertToInitialState")
            return g.revertToInitialState;
          if (c === "updateInitialState") return g.updateInitialState;
          if (c === "removeValidation") return g.removeValidation;
        }
        if (c === "getFormRef")
          return () => de.getState().getFormRef(e + "." + t.join("."));
        if (c === "validationWrapper")
          return ({
            children: r,
            hideMessage: o
          }) => /* @__PURE__ */ le(
            we,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: t,
              validationKey: n.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: y?.validIndices,
              children: r
            }
          );
        if (c === "_stateKey") return e;
        if (c === "_path") return t;
        if (c === "_isServerSynced") return g._isServerSynced;
        if (c === "update")
          return (r, o) => {
            if (o?.debounce)
              $e(() => {
                J(i, r, t, "");
                const v = n.getState().getNestedState(e, t);
                o?.afterUpdate && o.afterUpdate(v);
              }, o.debounce);
            else {
              J(i, r, t, "");
              const v = n.getState().getNestedState(e, t);
              o?.afterUpdate && o.afterUpdate(v);
            }
            _(t);
          };
        if (c === "formElement")
          return (r, o) => /* @__PURE__ */ le(
            Ae,
            {
              setState: i,
              stateKey: e,
              path: t,
              child: r,
              formOpts: o
            }
          );
        const T = [...t, c], q = n.getState().getNestedState(e, T);
        return l(q, T, y);
      }
    }, u = new Proxy(h, O);
    return d.set(F, {
      proxy: u,
      stateVersion: p
    }), u;
  }
  return l(
    n.getState().getNestedState(e, [])
  );
}
function te(e) {
  return Q(be, { proxy: e });
}
function je({
  proxy: e,
  rebuildStateShape: i
}) {
  const I = n().getNestedState(e._stateKey, e._path);
  return Array.isArray(I) ? i(
    I,
    e._path
  ).stateMapNoRender(
    (d, p, _, g, l) => e._mapFn(d, p, _, g, l)
  ) : null;
}
function be({
  proxy: e
}) {
  const i = G(null), I = `${e._stateKey}-${e._path.join(".")}`;
  return ne(() => {
    const m = i.current;
    if (!m || !m.parentElement) return;
    const d = m.parentElement, _ = Array.from(d.childNodes).indexOf(m);
    let g = d.getAttribute("data-parent-id");
    g || (g = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", g));
    const f = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: g,
      position: _,
      effect: e._effect
    };
    n.getState().addSignalElement(I, f);
    const t = n.getState().getNestedState(e._stateKey, e._path);
    let y;
    if (e._effect)
      try {
        y = new Function(
          "state",
          `return (${e._effect})(state)`
        )(t);
      } catch (h) {
        console.error("Error evaluating effect function during mount:", h), y = t;
      }
    else
      y = t;
    y !== null && typeof y == "object" && (y = JSON.stringify(y));
    const F = document.createTextNode(String(y));
    m.replaceWith(F);
  }, [e._stateKey, e._path.join("."), e._effect]), Q("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": I
  });
}
function Ze(e) {
  const i = Ee(
    (I) => {
      const m = n.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return m.components.set(e._stateKey, {
        forceUpdate: I,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => m.components.delete(e._stateKey);
    },
    () => n.getState().getNestedState(e._stateKey, e._path)
  );
  return Q("text", {}, String(i));
}
export {
  te as $cogsSignal,
  Ze as $cogsSignalStore,
  ze as addStateOptions,
  Be as createCogsState,
  Je as notifyComponent,
  Oe as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
