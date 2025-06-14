"use client";
import { jsx as fe } from "react/jsx-runtime";
import { useState as te, useRef as ee, useEffect as ce, useLayoutEffect as Ie, useMemo as $e, createElement as ae, useSyncExternalStore as Ae, startTransition as Ve } from "react";
import { transformStateFunc as ke, isDeepEqual as G, isFunction as q, getNestedValue as W, getDifferences as le, debounce as Ne } from "./utility.js";
import { pushFunc as se, updateFn as X, cutFunc as K, ValidationWrapper as Ce, FormControlComponent as _e } from "./Functions.jsx";
import Pe from "superjson";
import { v4 as de } from "uuid";
import "zod";
import { getGlobalStore as n, formRefStore as Se } from "./store.js";
import { useCogsConfig as be } from "./CogsStateClient.jsx";
import { applyPatch as xe } from "fast-json-patch";
function me(e, o) {
  const S = n.getState().getInitialOptions, l = n.getState().setInitialStateOptions, c = S(e) || {};
  l(e, {
    ...c,
    ...o
  });
}
function ye({
  stateKey: e,
  options: o,
  initialOptionsPart: S
}) {
  const l = Z(e) || {}, c = S[e] || {}, w = n.getState().setInitialStateOptions, I = { ...c, ...l };
  let p = !1;
  if (o)
    for (const s in o)
      I.hasOwnProperty(s) ? (s == "localStorage" && o[s] && I[s].key !== o[s]?.key && (p = !0, I[s] = o[s]), s == "initialState" && o[s] && I[s] !== o[s] && // Different references
      !G(I[s], o[s]) && (p = !0, I[s] = o[s])) : (p = !0, I[s] = o[s]);
  p && w(e, I);
}
function Ke(e, { formElements: o, validation: S }) {
  return { initialState: e, formElements: o, validation: S };
}
const et = (e, o) => {
  let S = e;
  const [l, c] = ke(S);
  (Object.keys(c).length > 0 || o && Object.keys(o).length > 0) && Object.keys(c).forEach((p) => {
    c[p] = c[p] || {}, c[p].formElements = {
      ...o?.formElements,
      // Global defaults first
      ...o?.validation,
      ...c[p].formElements || {}
      // State-specific overrides
    }, Z(p) || n.getState().setInitialStateOptions(p, c[p]);
  }), n.getState().setInitialStates(l), n.getState().setCreatedState(l);
  const w = (p, s) => {
    const [h] = te(s?.componentId ?? de());
    ye({
      stateKey: p,
      options: s,
      initialOptionsPart: c
    });
    const r = n.getState().cogsStateStore[p] || l[p], m = s?.modifyState ? s.modifyState(r) : r, [U, x] = De(
      m,
      {
        stateKey: p,
        syncUpdate: s?.syncUpdate,
        componentId: h,
        localStorage: s?.localStorage,
        middleware: s?.middleware,
        enabledSync: s?.enabledSync,
        reactiveType: s?.reactiveType,
        reactiveDeps: s?.reactiveDeps,
        initialState: s?.initialState,
        dependencies: s?.dependencies,
        serverState: s?.serverState
      }
    );
    return x;
  };
  function I(p, s) {
    ye({ stateKey: p, options: s, initialOptionsPart: c }), s.localStorage && Ue(p, s), ie(p);
  }
  return { useCogsState: w, setCogsOptions: I };
}, {
  setUpdaterState: ne,
  setState: J,
  getInitialOptions: Z,
  getKeyState: we,
  getValidationErrors: je,
  setStateLog: Oe,
  updateInitialStateGlobal: ge,
  addValidationError: Fe,
  removeValidationError: z,
  setServerSyncActions: Me
} = n.getState(), ve = (e, o, S, l, c) => {
  S?.log && console.log(
    "saving to localstorage",
    o,
    S.localStorage?.key,
    l
  );
  const w = q(S?.localStorage?.key) ? S.localStorage?.key(e) : S?.localStorage?.key;
  if (w && l) {
    const I = `${l}-${o}-${w}`;
    let p;
    try {
      p = oe(I)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: c ?? p
    }, h = Pe.serialize(s);
    window.localStorage.setItem(
      I,
      JSON.stringify(h.json)
    );
  }
}, oe = (e) => {
  if (!e) return null;
  try {
    const o = window.localStorage.getItem(e);
    return o ? JSON.parse(o) : null;
  } catch (o) {
    return console.error("Error loading from localStorage:", o), null;
  }
}, Ue = (e, o) => {
  const S = n.getState().cogsStateStore[e], { sessionId: l } = be(), c = q(o?.localStorage?.key) ? o.localStorage.key(S) : o?.localStorage?.key;
  if (c && l) {
    const w = oe(
      `${l}-${e}-${c}`
    );
    if (w && w.lastUpdated > (w.lastSyncedWithServer || 0))
      return J(e, w.state), ie(e), !0;
  }
  return !1;
}, Te = (e, o, S, l, c, w) => {
  const I = {
    initialState: o,
    updaterState: re(
      e,
      l,
      c,
      w
    ),
    state: S
  };
  ge(e, I.initialState), ne(e, I.updaterState), J(e, I.state);
}, ie = (e) => {
  const o = n.getState().stateComponents.get(e);
  if (!o) return;
  const S = /* @__PURE__ */ new Set();
  o.components.forEach((l) => {
    (l ? Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType || "component"] : null)?.includes("none") || S.add(() => l.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((l) => l());
  });
}, tt = (e, o) => {
  const S = n.getState().stateComponents.get(e);
  if (S) {
    const l = `${e}////${o}`, c = S.components.get(l);
    if ((c ? Array.isArray(c.reactiveType) ? c.reactiveType : [c.reactiveType || "component"] : null)?.includes("none"))
      return;
    c && c.forceUpdate();
  }
}, Re = (e, o, S, l) => {
  switch (e) {
    case "update":
      return {
        oldValue: W(o, l),
        newValue: W(S, l)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: W(S, l)
      };
    case "cut":
      return {
        oldValue: W(o, l),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function ue(e, o, S) {
  const l = o.split(".");
  let c = e;
  for (const w of l)
    c.children.has(w) || c.children.set(w, {
      subscribers: /* @__PURE__ */ new Set(),
      children: /* @__PURE__ */ new Map()
    }), c = c.children.get(w);
  c.subscribers.add(S);
}
function Ee(e, o, S) {
  const l = o.split(".");
  let c = e;
  for (const w of l)
    if (c = c.children.get(w), !c) return;
  c.subscribers.delete(S);
}
function he(e, o) {
  console.log("Getting subscribers for path:", o);
  const S = o.split("."), l = new Set(e.subscribers);
  console.log("Root subscribers:", e.subscribers);
  let c = e;
  for (const w of S) {
    if (c = c.children?.get(w), console.log(`Segment ${w} subscribers:`, c?.subscribers), !c) break;
    c.subscribers.forEach((I) => l.add(I));
  }
  return console.log("Total subscribers found:", l), l;
}
function De(e, {
  stateKey: o,
  serverSync: S,
  localStorage: l,
  formElements: c,
  reactiveDeps: w,
  reactiveType: I,
  componentId: p,
  initialState: s,
  syncUpdate: h,
  dependencies: r,
  serverState: m
} = {}) {
  const [U, x] = te({}), { sessionId: j } = be();
  let R = !o;
  const [y] = te(o ?? de()), d = n.getState().stateLog[y], Q = ee(/* @__PURE__ */ new Set()), L = ee(p ?? de()), N = ee(
    null
  );
  N.current = Z(y) ?? null, ce(() => {
    if (h && h.stateKey === y && h.path?.[0]) {
      J(y, (a) => ({
        ...a,
        [h.path[0]]: h.newValue
      }));
      const t = `${h.stateKey}:${h.path.join(".")}`;
      n.getState().setSyncInfo(t, {
        timeStamp: h.timeStamp,
        userId: h.userId
      });
    }
  }, [h]), ce(() => {
    if (s) {
      me(y, {
        initialState: s
      });
      const t = N.current, i = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, u = n.getState().initialStateGlobal[y];
      if (!(u && !G(u, s) || !u) && !i)
        return;
      let f = null;
      const A = q(t?.localStorage?.key) ? t?.localStorage?.key(s) : t?.localStorage?.key;
      A && j && (f = oe(`${j}-${y}-${A}`));
      let b = s, T = !1;
      const C = i ? Date.now() : 0, $ = f?.lastUpdated || 0, _ = f?.lastSyncedWithServer || 0;
      i && C > $ ? (b = t.serverState.data, T = !0) : f && $ > _ && (b = f.state, t?.localStorage?.onChange && t?.localStorage?.onChange(b)), Te(
        y,
        s,
        b,
        H,
        L.current,
        j
      ), T && A && j && ve(b, y, t, j, Date.now()), ie(y), (Array.isArray(I) ? I : [I || "component"]).includes("none") || x({});
    }
  }, [
    s,
    m?.status,
    m?.data,
    ...r || []
  ]), Ie(() => {
    R && me(y, {
      serverSync: S,
      formElements: c,
      initialState: s,
      localStorage: l,
      middleware: N.current?.middleware
    });
    const t = `${y}////${L.current}`, a = n.getState().stateComponents.get(y) || {
      components: /* @__PURE__ */ new Map(),
      pathTrie: {
        subscribers: /* @__PURE__ */ new Set(),
        children: /* @__PURE__ */ new Map()
      }
    };
    return a.components.set(t, {
      forceUpdate: () => x({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: w || void 0,
      reactiveType: I ?? ["component", "deps"]
    }), n.getState().stateComponents.set(y, a), x({}), () => {
      const i = `${y}////${L.current}`;
      a && (a.components.delete(i), a.components.size === 0 && n.getState().stateComponents.delete(y));
    };
  }, []);
  const H = (t, a, i, u) => {
    if (Array.isArray(a)) {
      const v = `${y}-${a.join(".")}`;
      Q.current.add(v);
    }
    J(y, (v) => {
      const f = q(t) ? t(v) : t, A = `${y}-${a.join(".")}`;
      if (A) {
        let M = !1, E = n.getState().signalDomElements.get(A);
        if ((!E || E.size === 0) && (i.updateType === "insert" || i.updateType === "cut")) {
          const O = a.slice(0, -1), D = W(f, O);
          if (Array.isArray(D)) {
            M = !0;
            const V = `${y}-${O.join(".")}`;
            E = n.getState().signalDomElements.get(V);
          }
        }
        if (E) {
          const O = M ? W(f, a.slice(0, -1)) : W(f, a);
          E.forEach(({ parentId: D, position: V, effect: k }) => {
            const P = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (P) {
              const B = Array.from(P.childNodes);
              if (B[V]) {
                const Y = k ? new Function("state", `return (${k})(state)`)(O) : O;
                B[V].textContent = String(Y);
              }
            }
          });
        }
      }
      i.updateType === "update" && (u || N.current?.validation?.key) && a && z(
        (u || N.current?.validation?.key) + "." + a.join(".")
      );
      const b = a.slice(0, a.length - 1);
      i.updateType === "cut" && N.current?.validation?.key && z(
        N.current?.validation?.key + "." + b.join(".")
      ), i.updateType === "insert" && N.current?.validation?.key && je(
        N.current?.validation?.key + "." + b.join(".")
      ).filter(([E, O]) => {
        let D = E?.split(".").length;
        if (E == b.join(".") && D == b.length - 1) {
          let V = E + "." + b;
          z(E), Fe(V, O);
        }
      });
      const T = n.getState().stateComponents.get(y);
      if (T && T.pathTrie) {
        const M = le(v, f), E = /* @__PURE__ */ new Set();
        M.forEach((V) => {
          he(
            T.pathTrie,
            V
          ).forEach((P) => E.add(P));
        });
        const O = i.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        he(
          T.pathTrie,
          O
        ).forEach((V) => E.add(V)), console.log("componentsToUpdate", E), E.forEach((V) => {
          const k = T.components.get(V);
          if (k) {
            const P = Array.isArray(k.reactiveType) ? k.reactiveType : [k.reactiveType || "component"];
            if (P.includes("none")) return;
            if (P.includes("all")) {
              k.forceUpdate();
              return;
            }
            if (P.includes("deps") && k.depsFunction) {
              const B = k.depsFunction(f);
              let Y = !1;
              if (typeof B == "boolean" ? B && (Y = !0) : G(k.deps, B) || (k.deps = B, Y = !0), Y) {
                k.forceUpdate();
                return;
              }
            }
            P.includes("component") && k.forceUpdate();
          }
        });
      }
      const C = Date.now();
      a = a.map((M, E) => {
        const O = a.slice(0, -1), D = W(f, O);
        return E === a.length - 1 && ["insert", "cut"].includes(i.updateType) ? (D.length - 1).toString() : M;
      });
      const { oldValue: $, newValue: _ } = Re(
        i.updateType,
        v,
        f,
        a
      ), F = {
        timeStamp: C,
        stateKey: y,
        path: a,
        updateType: i.updateType,
        status: "new",
        oldValue: $,
        newValue: _
      };
      if (Oe(y, (M) => {
        const O = [...M ?? [], F].reduce((D, V) => {
          const k = `${V.stateKey}:${JSON.stringify(V.path)}`, P = D.get(k);
          return P ? (P.timeStamp = Math.max(P.timeStamp, V.timeStamp), P.newValue = V.newValue, P.oldValue = P.oldValue ?? V.oldValue, P.updateType = V.updateType) : D.set(k, { ...V }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), ve(
        f,
        y,
        N.current,
        j
      ), N.current?.middleware && N.current.middleware({
        updateLog: d,
        update: F
      }), N.current?.serverSync) {
        const M = n.getState().serverState[y], E = N.current?.serverSync;
        Me(y, {
          syncKey: typeof E.syncKey == "string" ? E.syncKey : E.syncKey({ state: f }),
          rollBackState: M,
          actionTimeStamp: Date.now() + (E.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return f;
    });
  };
  n.getState().updaterState[y] || (ne(
    y,
    re(
      y,
      H,
      L.current,
      j
    )
  ), n.getState().cogsStateStore[y] || J(y, e), n.getState().initialStateGlobal[y] || ge(y, e));
  const g = $e(() => re(
    y,
    H,
    L.current,
    j
  ), [y, j]);
  return [we(y), g];
}
function re(e, o, S, l) {
  const c = /* @__PURE__ */ new Map();
  let w = 0;
  const I = (h) => {
    const r = h.join(".");
    for (const [m] of c)
      (m === r || m.startsWith(r + ".")) && c.delete(m);
    w++;
  }, p = {
    removeValidation: (h) => {
      h?.validationKey && z(h.validationKey);
    },
    revertToInitialState: (h) => {
      const r = n.getState().getInitialOptions(e)?.validation;
      r?.key && z(r?.key), h?.validationKey && z(h.validationKey);
      const m = n.getState().initialStateGlobal[e];
      n.getState().clearSelectedIndexesForState(e), c.clear(), w++;
      const U = s(m, []), x = Z(e), j = q(x?.localStorage?.key) ? x?.localStorage?.key(m) : x?.localStorage?.key, R = `${l}-${e}-${j}`;
      R && localStorage.removeItem(R), ne(e, U), J(e, m);
      const y = n.getState().stateComponents.get(e);
      return y && y.components.forEach((d) => {
        d.forceUpdate();
      }), m;
    },
    updateInitialState: (h) => {
      c.clear(), w++;
      const r = re(
        e,
        o,
        S,
        l
      ), m = n.getState().initialStateGlobal[e], U = Z(e), x = q(U?.localStorage?.key) ? U?.localStorage?.key(m) : U?.localStorage?.key, j = `${l}-${e}-${x}`;
      return localStorage.getItem(j) && localStorage.removeItem(j), Ve(() => {
        ge(e, h), ne(e, r), J(e, h);
        const R = n.getState().stateComponents.get(e);
        R && R.components.forEach((y) => {
          y.forceUpdate();
        });
      }), {
        fetchId: (R) => r.get()[R]
      };
    },
    _initialState: n.getState().initialStateGlobal[e],
    _serverState: n.getState().serverState[e],
    _isLoading: n.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const h = n.getState().serverState[e];
      return !!(h && G(h, we(e)));
    }
  };
  function s(h, r = [], m) {
    const U = r.map(String).join(".");
    c.get(U);
    const x = function() {
      return n().getNestedState(e, r);
    };
    Object.keys(p).forEach((y) => {
      x[y] = p[y];
    });
    const j = {
      apply(y, d, Q) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${r.join(".")}`
        ), console.trace("Apply trap stack trace"), n().getNestedState(e, r);
      },
      get(y, d) {
        m?.validIndices && !Array.isArray(h) && (m = { ...m, validIndices: void 0 });
        const Q = /* @__PURE__ */ new Set([
          "insert",
          "cut",
          "cutByValue",
          "toggleByValue",
          "uniqueInsert",
          "update",
          "applyJsonPatch",
          "setSelected",
          "toggleSelected",
          "clearSelected",
          "sync",
          "validateZodSchema",
          "revertToInitialState",
          "updateInitialState",
          "removeValidation",
          "setValidation",
          "removeStorage",
          "middleware",
          "_componentId",
          "_stateKey",
          "getComponents"
        ]);
        if (d !== "then" && !d.startsWith("$") && d !== "stateMapNoRender" && !Q.has(d)) {
          const g = `${e}////${S}`, t = n.getState().stateComponents.get(e);
          if (t) {
            const a = t.components.get(g);
            if (a && !a.pathsInitialized && (a.pathsInitialized = !0, !a.paths.has(""))) {
              const i = r.join(".");
              let u = !0;
              for (const v of a.paths)
                if (i.startsWith(v) && (i === v || i[v.length] === ".")) {
                  u = !1;
                  break;
                }
              if (u) {
                a.paths.add(i);
                const v = n.getState().stateComponents.get(e);
                v && v.pathTrie && ue(
                  v.pathTrie,
                  i,
                  g
                );
              }
            }
          }
        }
        if (d === "getDifferences")
          return () => le(
            n.getState().cogsStateStore[e],
            n.getState().initialStateGlobal[e]
          );
        if (d === "sync" && r.length === 0)
          return async function() {
            const g = n.getState().getInitialOptions(e), t = g?.sync;
            if (!t)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const a = n.getState().getNestedState(e, []), i = g?.validation?.key;
            try {
              const u = await t.action(a);
              if (u && !u.success && u.errors && i) {
                n.getState().removeValidationError(i), u.errors.forEach((f) => {
                  const A = [i, ...f.path].join(".");
                  n.getState().addValidationError(A, f.message);
                });
                const v = n.getState().stateComponents.get(e);
                v && v.components.forEach((f) => {
                  f.forceUpdate();
                });
              }
              return u?.success && t.onSuccess ? t.onSuccess(u.data) : !u?.success && t.onError && t.onError(u.error), u;
            } catch (u) {
              return t.onError && t.onError(u), { success: !1, error: u };
            }
          };
        if (d === "_status") {
          const g = n.getState().getNestedState(e, r), t = n.getState().initialStateGlobal[e], a = W(t, r);
          return G(g, a) ? "fresh" : "stale";
        }
        if (d === "getStatus")
          return function() {
            const g = n().getNestedState(
              e,
              r
            ), t = n.getState().initialStateGlobal[e], a = W(t, r);
            return G(g, a) ? "fresh" : "stale";
          };
        if (d === "removeStorage")
          return () => {
            const g = n.getState().initialStateGlobal[e], t = Z(e), a = q(t?.localStorage?.key) ? t?.localStorage?.key(g) : t?.localStorage?.key, i = `${l}-${e}-${a}`;
            i && localStorage.removeItem(i);
          };
        if (d === "showValidationErrors")
          return () => {
            const g = n.getState().getInitialOptions(e)?.validation;
            if (!g?.key)
              throw new Error("Validation key not found");
            return n.getState().getValidationErrors(g.key + "." + r.join("."));
          };
        if (Array.isArray(h)) {
          const g = () => m?.validIndices ? h.map((a, i) => ({
            item: a,
            originalIndex: m.validIndices[i]
          })) : n.getState().getNestedState(e, r).map((a, i) => ({
            item: a,
            originalIndex: i
          }));
          if (d === "getSelected")
            return () => {
              const t = n.getState().getSelectedIndex(e, r.join("."));
              if (t !== void 0)
                return s(
                  h[t],
                  [...r, t.toString()],
                  m
                );
            };
          if (d === "clearSelected")
            return () => {
              n.getState().clearSelectedIndex({ stateKey: e, path: r });
            };
          if (d === "getSelectedIndex")
            return () => n.getState().getSelectedIndex(e, r.join(".")) ?? -1;
          if (d === "stateSort")
            return (t) => {
              const i = [...g()].sort(
                (f, A) => t(f.item, A.item)
              ), u = i.map(({ item: f }) => f), v = {
                ...m,
                validIndices: i.map(
                  ({ originalIndex: f }) => f
                )
              };
              return s(u, r, v);
            };
          if (d === "stateFilter")
            return (t) => {
              const i = g().filter(
                ({ item: f }, A) => t(f, A)
              ), u = i.map(({ item: f }) => f), v = {
                ...m,
                validIndices: i.map(
                  ({ originalIndex: f }) => f
                )
              };
              return s(u, r, v);
            };
          if (d === "stateMap")
            return (t) => {
              const a = n.getState().getNestedState(e, r);
              return Array.isArray(a) ? a.map((i, u) => {
                let v;
                m?.validIndices && m.validIndices[u] !== void 0 ? v = m.validIndices[u] : v = u;
                const f = [...r, v.toString()], A = s(i, f, m);
                return t(i, A, {
                  register: () => {
                    const [, T] = te({}), C = `${S}-${r.join(".")}-${v}`;
                    Ie(() => {
                      const $ = `${e}////${C}`, _ = n.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map(),
                        pathTrie: {
                          subscribers: /* @__PURE__ */ new Set(),
                          children: /* @__PURE__ */ new Map()
                        }
                      };
                      return _.components.set($, {
                        forceUpdate: () => T({}),
                        paths: /* @__PURE__ */ new Set([f.join(".")]),
                        deps: [],
                        depsFunction: void 0,
                        reactiveType: ["component"],
                        pathsInitialized: !0
                      }), _.pathTrie && ue(
                        _.pathTrie,
                        f.join("."),
                        $
                      ), n.getState().stateComponents.set(e, _), () => {
                        const F = n.getState().stateComponents.get(e);
                        F && (F.components.delete($), F.pathTrie && Ee(
                          F.pathTrie,
                          f.join("."),
                          $
                        ));
                      };
                    }, [e, C]);
                  },
                  index: u,
                  originalIndex: v
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${r.join(".")}. The current value is:`,
                a
              ), null);
            };
          if (d === "stateMapNoRender")
            return (t) => h.map((i, u) => {
              let v;
              m?.validIndices && m.validIndices[u] !== void 0 ? v = m.validIndices[u] : v = u;
              const f = [...r, v.toString()], A = s(i, f, m);
              return t(
                i,
                A,
                u,
                h,
                s(h, r, m)
              );
            });
          if (d === "$stateMap")
            return (t) => ae(Ge, {
              proxy: {
                _stateKey: e,
                _path: r,
                _mapFn: t
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (d === "stateFlattenOn")
            return (t) => {
              const a = h;
              c.clear(), w++;
              const i = a.flatMap(
                (u) => u[t] ?? []
              );
              return s(
                i,
                [...r, "[*]", t],
                m
              );
            };
          if (d === "index")
            return (t) => {
              const a = h[t];
              return s(a, [...r, t.toString()]);
            };
          if (d === "last")
            return () => {
              const t = n.getState().getNestedState(e, r);
              if (t.length === 0) return;
              const a = t.length - 1, i = t[a], u = [...r, a.toString()];
              return s(i, u);
            };
          if (d === "insert")
            return (t) => (I(r), se(o, t, r, e), s(
              n.getState().getNestedState(e, r),
              r
            ));
          if (d === "uniqueInsert")
            return (t, a, i) => {
              const u = n.getState().getNestedState(e, r), v = q(t) ? t(u) : t;
              let f = null;
              if (!u.some((b) => {
                if (a) {
                  const C = a.every(
                    ($) => G(b[$], v[$])
                  );
                  return C && (f = b), C;
                }
                const T = G(b, v);
                return T && (f = b), T;
              }))
                I(r), se(o, v, r, e);
              else if (i && f) {
                const b = i(f), T = u.map(
                  (C) => G(C, f) ? b : C
                );
                I(r), X(o, T, r);
              }
            };
          if (d === "cut")
            return (t, a) => {
              if (!a?.waitForSync)
                return I(r), K(o, r, e, t), s(
                  n.getState().getNestedState(e, r),
                  r
                );
            };
          if (d === "cutByValue")
            return (t) => {
              for (let a = 0; a < h.length; a++)
                h[a] === t && K(o, r, e, a);
            };
          if (d === "toggleByValue")
            return (t) => {
              const a = h.findIndex((i) => i === t);
              a > -1 ? K(o, r, e, a) : se(o, t, r, e);
            };
          if (d === "stateFind")
            return (t) => {
              const i = g().find(
                ({ item: v }, f) => t(v, f)
              );
              if (!i) return;
              const u = [...r, i.originalIndex.toString()];
              return s(i.item, u, m);
            };
          if (d === "findWith")
            return (t, a) => {
              const u = g().find(
                ({ item: f }) => f[t] === a
              );
              if (!u) return;
              const v = [...r, u.originalIndex.toString()];
              return s(u.item, v, m);
            };
        }
        const L = r[r.length - 1];
        if (!isNaN(Number(L))) {
          const g = r.slice(0, -1), t = n.getState().getNestedState(e, g);
          if (Array.isArray(t) && d === "cut")
            return () => K(
              o,
              g,
              e,
              Number(L)
            );
        }
        if (d === "get")
          return () => n.getState().getNestedState(e, r);
        if (d === "$derive")
          return (g) => pe({
            _stateKey: e,
            _path: r,
            _effect: g.toString()
          });
        if (d === "$get")
          return () => pe({
            _stateKey: e,
            _path: r
          });
        if (d === "lastSynced") {
          const g = `${e}:${r.join(".")}`;
          return n.getState().getSyncInfo(g);
        }
        if (d == "getLocalStorage")
          return (g) => oe(l + "-" + e + "-" + g);
        if (d === "_selected") {
          const g = r.slice(0, -1), t = g.join("."), a = n.getState().getNestedState(e, g);
          return Array.isArray(a) ? Number(r[r.length - 1]) === n.getState().getSelectedIndex(e, t) : void 0;
        }
        if (d === "setSelected")
          return (g) => {
            const t = r.slice(0, -1), a = Number(r[r.length - 1]), i = t.join(".");
            g ? n.getState().setSelectedIndex(e, i, a) : n.getState().setSelectedIndex(e, i, void 0);
            const u = n.getState().getNestedState(e, [...t]);
            X(o, u, t), I(t);
          };
        if (d === "toggleSelected")
          return () => {
            const g = r.slice(0, -1), t = Number(r[r.length - 1]), a = g.join("."), i = n.getState().getSelectedIndex(e, a);
            n.getState().setSelectedIndex(
              e,
              a,
              i === t ? void 0 : t
            );
            const u = n.getState().getNestedState(e, [...g]);
            X(o, u, g), I(g);
          };
        if (r.length == 0) {
          if (d === "applyJsonPatch")
            return (g) => {
              const t = n.getState().cogsStateStore[e], i = xe(t, g).newDocument;
              Te(
                e,
                n.getState().initialStateGlobal[e],
                i,
                o,
                S,
                l
              );
              const u = n.getState().stateComponents.get(e);
              if (u) {
                const v = le(t, i), f = new Set(v);
                for (const [
                  A,
                  b
                ] of u.components.entries()) {
                  let T = !1;
                  const C = Array.isArray(b.reactiveType) ? b.reactiveType : [b.reactiveType || "component"];
                  if (!C.includes("none")) {
                    if (C.includes("all")) {
                      b.forceUpdate();
                      continue;
                    }
                    if (C.includes("component") && (b.paths.has("") && (T = !0), !T))
                      for (const $ of f) {
                        if (b.paths.has($)) {
                          T = !0;
                          break;
                        }
                        let _ = $.lastIndexOf(".");
                        for (; _ !== -1; ) {
                          const F = $.substring(0, _);
                          if (b.paths.has(F)) {
                            T = !0;
                            break;
                          }
                          const M = $.substring(
                            _ + 1
                          );
                          if (!isNaN(Number(M))) {
                            const E = F.lastIndexOf(".");
                            if (E !== -1) {
                              const O = F.substring(
                                0,
                                E
                              );
                              if (b.paths.has(O)) {
                                T = !0;
                                break;
                              }
                            }
                          }
                          _ = F.lastIndexOf(".");
                        }
                        if (T) break;
                      }
                    if (!T && C.includes("deps") && b.depsFunction) {
                      const $ = b.depsFunction(i);
                      let _ = !1;
                      typeof $ == "boolean" ? $ && (_ = !0) : G(b.deps, $) || (b.deps = $, _ = !0), _ && (T = !0);
                    }
                    T && b.forceUpdate();
                  }
                }
              }
            };
          if (d === "validateZodSchema")
            return () => {
              const g = n.getState().getInitialOptions(e)?.validation, t = n.getState().addValidationError;
              if (!g?.zodSchema)
                throw new Error("Zod schema not found");
              if (!g?.key)
                throw new Error("Validation key not found");
              z(g.key);
              const a = n.getState().cogsStateStore[e];
              try {
                const i = n.getState().getValidationErrors(g.key);
                i && i.length > 0 && i.forEach(([v]) => {
                  v && v.startsWith(g.key) && z(v);
                });
                const u = g.zodSchema.safeParse(a);
                return u.success ? !0 : (u.error.errors.forEach((f) => {
                  const A = f.path, b = f.message, T = [g.key, ...A].join(".");
                  t(T, b);
                }), ie(e), !1);
              } catch (i) {
                return console.error("Zod schema validation failed", i), !1;
              }
            };
          if (d === "_componentId") return S;
          if (d === "getComponents")
            return () => n().stateComponents.get(e);
          if (d === "getAllFormRefs")
            return () => Se.getState().getFormRefsByStateKey(e);
          if (d === "_initialState")
            return n.getState().initialStateGlobal[e];
          if (d === "_serverState")
            return n.getState().serverState[e];
          if (d === "_isLoading")
            return n.getState().isLoadingGlobal[e];
          if (d === "revertToInitialState")
            return p.revertToInitialState;
          if (d === "updateInitialState") return p.updateInitialState;
          if (d === "removeValidation") return p.removeValidation;
        }
        if (d === "getFormRef")
          return () => Se.getState().getFormRef(e + "." + r.join("."));
        if (d === "validationWrapper")
          return ({
            children: g,
            hideMessage: t
          }) => /* @__PURE__ */ fe(
            Ce,
            {
              formOpts: t ? { validation: { message: "" } } : void 0,
              path: r,
              validationKey: n.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: m?.validIndices,
              children: g
            }
          );
        if (d === "_stateKey") return e;
        if (d === "_path") return r;
        if (d === "_isServerSynced") return p._isServerSynced;
        if (d === "update")
          return (g, t) => {
            if (t?.debounce)
              Ne(() => {
                X(o, g, r, "");
                const a = n.getState().getNestedState(e, r);
                t?.afterUpdate && t.afterUpdate(a);
              }, t.debounce);
            else {
              X(o, g, r, "");
              const a = n.getState().getNestedState(e, r);
              t?.afterUpdate && t.afterUpdate(a);
            }
            I(r);
          };
        if (d === "formElement")
          return (g, t) => /* @__PURE__ */ fe(
            _e,
            {
              setState: o,
              stateKey: e,
              path: r,
              child: g,
              formOpts: t
            }
          );
        const N = [...r, d], H = n.getState().getNestedState(e, N);
        return s(H, N, m);
      }
    }, R = new Proxy(x, j);
    return c.set(U, {
      proxy: R,
      stateVersion: w
    }), R;
  }
  return s(
    n.getState().getNestedState(e, [])
  );
}
function pe(e) {
  return ae(We, { proxy: e });
}
function Ge({
  proxy: e,
  rebuildStateShape: o
}) {
  const S = n().getNestedState(e._stateKey, e._path);
  return Array.isArray(S) ? o(
    S,
    e._path
  ).stateMapNoRender(
    (c, w, I, p, s) => e._mapFn(c, w, I, p, s)
  ) : null;
}
function We({
  proxy: e
}) {
  const o = ee(null), S = `${e._stateKey}-${e._path.join(".")}`;
  return ce(() => {
    const l = o.current;
    if (!l || !l.parentElement) return;
    const c = l.parentElement, I = Array.from(c.childNodes).indexOf(l);
    let p = c.getAttribute("data-parent-id");
    p || (p = `parent-${crypto.randomUUID()}`, c.setAttribute("data-parent-id", p));
    const h = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: p,
      position: I,
      effect: e._effect
    };
    n.getState().addSignalElement(S, h);
    const r = n.getState().getNestedState(e._stateKey, e._path);
    let m;
    if (e._effect)
      try {
        m = new Function(
          "state",
          `return (${e._effect})(state)`
        )(r);
      } catch (x) {
        console.error("Error evaluating effect function during mount:", x), m = r;
      }
    else
      m = r;
    m !== null && typeof m == "object" && (m = JSON.stringify(m));
    const U = document.createTextNode(String(m));
    l.replaceWith(U);
  }, [e._stateKey, e._path.join("."), e._effect]), ae("span", {
    ref: o,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function nt(e) {
  const o = Ae(
    (S) => {
      const l = n.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map(),
        pathTrie: {
          subscribers: /* @__PURE__ */ new Set(),
          children: /* @__PURE__ */ new Map()
        }
      }, c = `signal-${e._stateKey}-${Date.now()}`;
      return l.components.set(c, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([e._path.join(".")]),
        deps: [],
        depsFunction: void 0,
        reactiveType: ["component"],
        pathsInitialized: !0
      }), l.pathTrie && ue(l.pathTrie, e._path.join("."), c), n.getState().stateComponents.set(e._stateKey, l), () => {
        l.components.delete(c), l.pathTrie && Ee(
          l.pathTrie,
          e._path.join("."),
          c
        );
      };
    },
    () => n.getState().getNestedState(e._stateKey, e._path)
  );
  return ae("text", {}, String(o));
}
export {
  pe as $cogsSignal,
  nt as $cogsSignalStore,
  Ke as addStateOptions,
  et as createCogsState,
  tt as notifyComponent,
  De as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
