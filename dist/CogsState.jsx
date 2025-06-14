"use client";
import { jsx as fe } from "react/jsx-runtime";
import { useState as se, useRef as ee, useEffect as ce, useLayoutEffect as we, useMemo as Ee, createElement as re, useSyncExternalStore as $e, startTransition as Ae } from "react";
import { transformStateFunc as Ne, isDeepEqual as M, isFunction as z, getNestedValue as G, getDifferences as le, debounce as Ve } from "./utility.js";
import { pushFunc as ie, updateFn as X, cutFunc as K, ValidationWrapper as ke, FormControlComponent as _e } from "./Functions.jsx";
import Ce from "superjson";
import { v4 as de } from "uuid";
import "zod";
import { getGlobalStore as n, formRefStore as Se } from "./store.js";
import { useCogsConfig as pe } from "./CogsStateClient.jsx";
import { applyPatch as Pe } from "fast-json-patch";
function me(e, i) {
  const S = n.getState().getInitialOptions, l = n.getState().setInitialStateOptions, c = S(e) || {};
  l(e, {
    ...c,
    ...i
  });
}
function ye({
  stateKey: e,
  options: i,
  initialOptionsPart: S
}) {
  const l = Z(e) || {}, c = S[e] || {}, b = n.getState().setInitialStateOptions, p = { ...c, ...l };
  let I = !1;
  if (i)
    for (const s in i)
      p.hasOwnProperty(s) ? (s == "localStorage" && i[s] && p[s].key !== i[s]?.key && (I = !0, p[s] = i[s]), s == "initialState" && i[s] && p[s] !== i[s] && // Different references
      !M(p[s], i[s]) && (I = !0, p[s] = i[s])) : (I = !0, p[s] = i[s]);
  I && b(e, p);
}
function Ke(e, { formElements: i, validation: S }) {
  return { initialState: e, formElements: i, validation: S };
}
const et = (e, i) => {
  let S = e;
  const [l, c] = Ne(S);
  (Object.keys(c).length > 0 || i && Object.keys(i).length > 0) && Object.keys(c).forEach((I) => {
    c[I] = c[I] || {}, c[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...c[I].formElements || {}
      // State-specific overrides
    }, Z(I) || n.getState().setInitialStateOptions(I, c[I]);
  }), n.getState().setInitialStates(l), n.getState().setCreatedState(l);
  const b = (I, s) => {
    const [h] = se(s?.componentId ?? de());
    ye({
      stateKey: I,
      options: s,
      initialOptionsPart: c
    });
    const r = n.getState().cogsStateStore[I] || l[I], m = s?.modifyState ? s.modifyState(r) : r, [R, P] = Me(
      m,
      {
        stateKey: I,
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
    return P;
  };
  function p(I, s) {
    ye({ stateKey: I, options: s, initialOptionsPart: c }), s.localStorage && je(I, s), ae(I);
  }
  return { useCogsState: b, setCogsOptions: p };
}, {
  setUpdaterState: te,
  setState: J,
  getInitialOptions: Z,
  getKeyState: Te,
  getValidationErrors: xe,
  setStateLog: Oe,
  updateInitialStateGlobal: ge,
  addValidationError: Fe,
  removeValidationError: q,
  setServerSyncActions: Re
} = n.getState(), ve = (e, i, S, l, c) => {
  S?.log && console.log(
    "saving to localstorage",
    i,
    S.localStorage?.key,
    l
  );
  const b = z(S?.localStorage?.key) ? S.localStorage?.key(e) : S?.localStorage?.key;
  if (b && l) {
    const p = `${l}-${i}-${b}`;
    let I;
    try {
      I = oe(p)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: c ?? I
    }, h = Ce.serialize(s);
    window.localStorage.setItem(
      p,
      JSON.stringify(h.json)
    );
  }
}, oe = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, je = (e, i) => {
  const S = n.getState().cogsStateStore[e], { sessionId: l } = pe(), c = z(i?.localStorage?.key) ? i.localStorage.key(S) : i?.localStorage?.key;
  if (c && l) {
    const b = oe(
      `${l}-${e}-${c}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return J(e, b.state), ae(e), !0;
  }
  return !1;
}, be = (e, i, S, l, c, b) => {
  const p = {
    initialState: i,
    updaterState: ne(
      e,
      l,
      c,
      b
    ),
    state: S
  };
  ge(e, p.initialState), te(e, p.updaterState), J(e, p.state);
}, ae = (e) => {
  const i = n.getState().stateComponents.get(e);
  if (!i) return;
  const S = /* @__PURE__ */ new Set();
  i.components.forEach((l) => {
    (l ? Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType || "component"] : null)?.includes("none") || S.add(() => l.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((l) => l());
  });
}, tt = (e, i) => {
  const S = n.getState().stateComponents.get(e);
  if (S) {
    const l = `${e}////${i}`, c = S.components.get(l);
    if ((c ? Array.isArray(c.reactiveType) ? c.reactiveType : [c.reactiveType || "component"] : null)?.includes("none"))
      return;
    c && c.forceUpdate();
  }
}, De = (e, i, S, l) => {
  switch (e) {
    case "update":
      return {
        oldValue: G(i, l),
        newValue: G(S, l)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: G(S, l)
      };
    case "cut":
      return {
        oldValue: G(i, l),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function ue(e, i, S) {
  const l = i.split(".");
  let c = e;
  for (const b of l)
    c.children.has(b) || c.children.set(b, {
      subscribers: /* @__PURE__ */ new Set(),
      children: /* @__PURE__ */ new Map()
    }), c = c.children.get(b);
  c.subscribers.add(S);
}
function Ue(e, i, S) {
  const l = i.split(".");
  let c = e;
  for (const b of l)
    if (c = c.children.get(b), !c) return;
  c.subscribers.delete(S);
}
function he(e, i) {
  console.log("Getting subscribers for path:", i);
  const S = i.split("."), l = new Set(e.subscribers);
  console.log("Root subscribers:", e.subscribers);
  let c = e;
  for (const b of S) {
    if (c = c.children?.get(b), console.log(`Segment ${b} subscribers:`, c?.subscribers), !c) break;
    c.subscribers.forEach((p) => l.add(p));
  }
  return console.log("Total subscribers found:", l), l;
}
function Me(e, {
  stateKey: i,
  serverSync: S,
  localStorage: l,
  formElements: c,
  reactiveDeps: b,
  reactiveType: p,
  componentId: I,
  initialState: s,
  syncUpdate: h,
  dependencies: r,
  serverState: m
} = {}) {
  const [R, P] = se({}), { sessionId: x } = pe();
  let j = !i;
  const [y] = se(i ?? de()), d = n.getState().stateLog[y], Q = ee(/* @__PURE__ */ new Set()), W = ee(I ?? de()), k = ee(
    null
  );
  k.current = Z(y) ?? null, ce(() => {
    if (h && h.stateKey === y && h.path?.[0]) {
      J(y, (o) => ({
        ...o,
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
      const t = k.current, a = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, g = n.getState().initialStateGlobal[y];
      if (!(g && !M(g, s) || !g) && !a)
        return;
      let f = null;
      const $ = z(t?.localStorage?.key) ? t?.localStorage?.key(s) : t?.localStorage?.key;
      $ && x && (f = oe(`${x}-${y}-${$}`));
      let T = s, w = !1;
      const N = a ? Date.now() : 0, _ = f?.lastUpdated || 0, D = f?.lastSyncedWithServer || 0;
      a && N > _ ? (T = t.serverState.data, w = !0) : f && _ > D && (T = f.state, t?.localStorage?.onChange && t?.localStorage?.onChange(T)), be(
        y,
        s,
        T,
        H,
        W.current,
        x
      ), w && $ && x && ve(T, y, t, x, Date.now()), ae(y), (Array.isArray(p) ? p : [p || "component"]).includes("none") || P({});
    }
  }, [
    s,
    m?.status,
    m?.data,
    ...r || []
  ]), we(() => {
    j && me(y, {
      serverSync: S,
      formElements: c,
      initialState: s,
      localStorage: l,
      middleware: k.current?.middleware
    });
    const t = `${y}////${W.current}`, o = n.getState().stateComponents.get(y) || {
      components: /* @__PURE__ */ new Map(),
      pathTrie: {
        subscribers: /* @__PURE__ */ new Set(),
        children: /* @__PURE__ */ new Map()
      }
    };
    return o.components.set(t, {
      forceUpdate: () => P({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), n.getState().stateComponents.set(y, o), P({}), () => {
      const a = `${y}////${W.current}`;
      o && (o.components.delete(a), o.components.size === 0 && n.getState().stateComponents.delete(y));
    };
  }, []);
  const H = (t, o, a, g) => {
    if (Array.isArray(o)) {
      const v = `${y}-${o.join(".")}`;
      Q.current.add(v);
    }
    J(y, (v) => {
      const f = z(t) ? t(v) : t, $ = `${y}-${o.join(".")}`;
      if ($) {
        let F = !1, E = n.getState().signalDomElements.get($);
        if ((!E || E.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const O = o.slice(0, -1), U = G(f, O);
          if (Array.isArray(U)) {
            F = !0;
            const A = `${y}-${O.join(".")}`;
            E = n.getState().signalDomElements.get(A);
          }
        }
        if (E) {
          const O = F ? G(f, o.slice(0, -1)) : G(f, o);
          E.forEach(({ parentId: U, position: A, effect: V }) => {
            const C = document.querySelector(
              `[data-parent-id="${U}"]`
            );
            if (C) {
              const B = Array.from(C.childNodes);
              if (B[A]) {
                const Y = V ? new Function("state", `return (${V})(state)`)(O) : O;
                B[A].textContent = String(Y);
              }
            }
          });
        }
      }
      a.updateType === "update" && (g || k.current?.validation?.key) && o && q(
        (g || k.current?.validation?.key) + "." + o.join(".")
      );
      const T = o.slice(0, o.length - 1);
      a.updateType === "cut" && k.current?.validation?.key && q(
        k.current?.validation?.key + "." + T.join(".")
      ), a.updateType === "insert" && k.current?.validation?.key && xe(
        k.current?.validation?.key + "." + T.join(".")
      ).filter(([E, O]) => {
        let U = E?.split(".").length;
        if (E == T.join(".") && U == T.length - 1) {
          let A = E + "." + T;
          q(E), Fe(A, O);
        }
      });
      const w = n.getState().stateComponents.get(y);
      if (w && w.pathTrie) {
        const F = le(v, f), E = /* @__PURE__ */ new Set();
        F.forEach((A) => {
          he(
            w.pathTrie,
            A
          ).forEach((C) => E.add(C));
        });
        const O = a.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        he(
          w.pathTrie,
          O
        ).forEach((A) => E.add(A)), console.log("componentsToUpdate", E), E.forEach((A) => {
          const V = w.components.get(A);
          if (V) {
            const C = Array.isArray(V.reactiveType) ? V.reactiveType : [V.reactiveType || "component"];
            if (C.includes("none")) return;
            if (C.includes("all")) {
              V.forceUpdate();
              return;
            }
            if (C.includes("deps") && V.depsFunction) {
              const B = V.depsFunction(f);
              let Y = !1;
              if (typeof B == "boolean" ? B && (Y = !0) : M(V.deps, B) || (V.deps = B, Y = !0), Y) {
                V.forceUpdate();
                return;
              }
            }
            C.includes("component") && V.forceUpdate();
          }
        });
      }
      const N = Date.now();
      o = o.map((F, E) => {
        const O = o.slice(0, -1), U = G(f, O);
        return E === o.length - 1 && ["insert", "cut"].includes(a.updateType) ? (U.length - 1).toString() : F;
      });
      const { oldValue: _, newValue: D } = De(
        a.updateType,
        v,
        f,
        o
      ), L = {
        timeStamp: N,
        stateKey: y,
        path: o,
        updateType: a.updateType,
        status: "new",
        oldValue: _,
        newValue: D
      };
      if (Oe(y, (F) => {
        const O = [...F ?? [], L].reduce((U, A) => {
          const V = `${A.stateKey}:${JSON.stringify(A.path)}`, C = U.get(V);
          return C ? (C.timeStamp = Math.max(C.timeStamp, A.timeStamp), C.newValue = A.newValue, C.oldValue = C.oldValue ?? A.oldValue, C.updateType = A.updateType) : U.set(V, { ...A }), U;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), ve(
        f,
        y,
        k.current,
        x
      ), k.current?.middleware && k.current.middleware({
        updateLog: d,
        update: L
      }), k.current?.serverSync) {
        const F = n.getState().serverState[y], E = k.current?.serverSync;
        Re(y, {
          syncKey: typeof E.syncKey == "string" ? E.syncKey : E.syncKey({ state: f }),
          rollBackState: F,
          actionTimeStamp: Date.now() + (E.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return f;
    });
  };
  n.getState().updaterState[y] || (te(
    y,
    ne(
      y,
      H,
      W.current,
      x
    )
  ), n.getState().cogsStateStore[y] || J(y, e), n.getState().initialStateGlobal[y] || ge(y, e));
  const u = Ee(() => ne(
    y,
    H,
    W.current,
    x
  ), [y, x]);
  return [Te(y), u];
}
function ne(e, i, S, l) {
  const c = /* @__PURE__ */ new Map();
  let b = 0;
  const p = (h) => {
    const r = h.join(".");
    for (const [m] of c)
      (m === r || m.startsWith(r + ".")) && c.delete(m);
    b++;
  }, I = {
    removeValidation: (h) => {
      h?.validationKey && q(h.validationKey);
    },
    revertToInitialState: (h) => {
      const r = n.getState().getInitialOptions(e)?.validation;
      r?.key && q(r?.key), h?.validationKey && q(h.validationKey);
      const m = n.getState().initialStateGlobal[e];
      n.getState().clearSelectedIndexesForState(e), c.clear(), b++;
      const R = s(m, []), P = Z(e), x = z(P?.localStorage?.key) ? P?.localStorage?.key(m) : P?.localStorage?.key, j = `${l}-${e}-${x}`;
      j && localStorage.removeItem(j), te(e, R), J(e, m);
      const y = n.getState().stateComponents.get(e);
      return y && y.components.forEach((d) => {
        d.forceUpdate();
      }), m;
    },
    updateInitialState: (h) => {
      c.clear(), b++;
      const r = ne(
        e,
        i,
        S,
        l
      ), m = n.getState().initialStateGlobal[e], R = Z(e), P = z(R?.localStorage?.key) ? R?.localStorage?.key(m) : R?.localStorage?.key, x = `${l}-${e}-${P}`;
      return localStorage.getItem(x) && localStorage.removeItem(x), Ae(() => {
        ge(e, h), te(e, r), J(e, h);
        const j = n.getState().stateComponents.get(e);
        j && j.components.forEach((y) => {
          y.forceUpdate();
        });
      }), {
        fetchId: (j) => r.get()[j]
      };
    },
    _initialState: n.getState().initialStateGlobal[e],
    _serverState: n.getState().serverState[e],
    _isLoading: n.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const h = n.getState().serverState[e];
      return !!(h && M(h, Te(e)));
    }
  };
  function s(h, r = [], m) {
    const R = r.map(String).join(".");
    c.get(R);
    const P = function() {
      return n().getNestedState(e, r);
    };
    Object.keys(I).forEach((y) => {
      P[y] = I[y];
    });
    const x = {
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
          const u = `${e}////${S}`, t = n.getState().stateComponents.get(e);
          if (console.log("stateEntry", t), t) {
            const o = t.components.get(u);
            if (o && !o.paths.has("")) {
              const a = r.join(".");
              let g = !0;
              for (const v of o.paths)
                if (a.startsWith(v) && (a === v || a[v.length] === ".")) {
                  g = !1;
                  break;
                }
              if (g) {
                console.log(
                  "ADDING PATH:",
                  a,
                  "for component:",
                  u
                ), o.paths.add(a);
                const v = n.getState().stateComponents.get(e);
                v && v.pathTrie ? (console.log(
                  "ADDING TO TRIE:",
                  a,
                  u
                ), ue(
                  v.pathTrie,
                  a,
                  u
                ), console.log("TRIE AFTER ADD:", v.pathTrie)) : console.log("NO TRIE FOUND for state:", e);
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
            const u = n.getState().getInitialOptions(e), t = u?.sync;
            if (!t)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const o = n.getState().getNestedState(e, []), a = u?.validation?.key;
            try {
              const g = await t.action(o);
              if (g && !g.success && g.errors && a) {
                n.getState().removeValidationError(a), g.errors.forEach((f) => {
                  const $ = [a, ...f.path].join(".");
                  n.getState().addValidationError($, f.message);
                });
                const v = n.getState().stateComponents.get(e);
                v && v.components.forEach((f) => {
                  f.forceUpdate();
                });
              }
              return g?.success && t.onSuccess ? t.onSuccess(g.data) : !g?.success && t.onError && t.onError(g.error), g;
            } catch (g) {
              return t.onError && t.onError(g), { success: !1, error: g };
            }
          };
        if (d === "_status") {
          const u = n.getState().getNestedState(e, r), t = n.getState().initialStateGlobal[e], o = G(t, r);
          return M(u, o) ? "fresh" : "stale";
        }
        if (d === "getStatus")
          return function() {
            const u = n().getNestedState(
              e,
              r
            ), t = n.getState().initialStateGlobal[e], o = G(t, r);
            return M(u, o) ? "fresh" : "stale";
          };
        if (d === "removeStorage")
          return () => {
            const u = n.getState().initialStateGlobal[e], t = Z(e), o = z(t?.localStorage?.key) ? t?.localStorage?.key(u) : t?.localStorage?.key, a = `${l}-${e}-${o}`;
            a && localStorage.removeItem(a);
          };
        if (d === "showValidationErrors")
          return () => {
            const u = n.getState().getInitialOptions(e)?.validation;
            if (!u?.key)
              throw new Error("Validation key not found");
            return n.getState().getValidationErrors(u.key + "." + r.join("."));
          };
        if (Array.isArray(h)) {
          const u = () => m?.validIndices ? h.map((o, a) => ({
            item: o,
            originalIndex: m.validIndices[a]
          })) : n.getState().getNestedState(e, r).map((o, a) => ({
            item: o,
            originalIndex: a
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
              const a = [...u()].sort(
                (f, $) => t(f.item, $.item)
              ), g = a.map(({ item: f }) => f), v = {
                ...m,
                validIndices: a.map(
                  ({ originalIndex: f }) => f
                )
              };
              return s(g, r, v);
            };
          if (d === "stateFilter")
            return (t) => {
              const a = u().filter(
                ({ item: f }, $) => t(f, $)
              ), g = a.map(({ item: f }) => f), v = {
                ...m,
                validIndices: a.map(
                  ({ originalIndex: f }) => f
                )
              };
              return s(g, r, v);
            };
          if (d === "stateMap")
            return (t) => {
              const o = n.getState().getNestedState(e, r);
              return o.map((a, g) => {
                let v;
                m?.validIndices && m.validIndices[g] !== void 0 ? v = m.validIndices[g] : v = g;
                const f = [...r, v.toString()], $ = s(a, f, m), T = `${S}-${r.join(".")}-${v}`, w = `${e}////${T}`, N = n.getState().stateComponents.get(e);
                return N && N.pathTrie && (N.components.set(w, {
                  forceUpdate: () => {
                  },
                  // This will be updated when component mounts
                  paths: /* @__PURE__ */ new Set([f.join(".")]),
                  deps: [],
                  depsFunction: void 0,
                  reactiveType: ["component"]
                }), ue(
                  N.pathTrie,
                  f.join("."),
                  w
                )), t(
                  a,
                  $,
                  g,
                  o,
                  s(o, r, m)
                );
              });
            };
          if (d === "stateMapNoRender")
            return (t) => h.map((a, g) => {
              let v;
              m?.validIndices && m.validIndices[g] !== void 0 ? v = m.validIndices[g] : v = g;
              const f = [...r, v.toString()], $ = s(a, f, m);
              return t(
                a,
                $,
                g,
                h,
                s(h, r, m)
              );
            });
          if (d === "$stateMap")
            return (t) => re(Ge, {
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
              const o = h;
              c.clear(), b++;
              const a = o.flatMap(
                (g) => g[t] ?? []
              );
              return s(
                a,
                [...r, "[*]", t],
                m
              );
            };
          if (d === "index")
            return (t) => {
              const o = h[t];
              return s(o, [...r, t.toString()]);
            };
          if (d === "last")
            return () => {
              const t = n.getState().getNestedState(e, r);
              if (t.length === 0) return;
              const o = t.length - 1, a = t[o], g = [...r, o.toString()];
              return s(a, g);
            };
          if (d === "insert")
            return (t) => (p(r), ie(i, t, r, e), s(
              n.getState().getNestedState(e, r),
              r
            ));
          if (d === "uniqueInsert")
            return (t, o, a) => {
              const g = n.getState().getNestedState(e, r), v = z(t) ? t(g) : t;
              let f = null;
              if (!g.some((T) => {
                if (o) {
                  const N = o.every(
                    (_) => M(T[_], v[_])
                  );
                  return N && (f = T), N;
                }
                const w = M(T, v);
                return w && (f = T), w;
              }))
                p(r), ie(i, v, r, e);
              else if (a && f) {
                const T = a(f), w = g.map(
                  (N) => M(N, f) ? T : N
                );
                p(r), X(i, w, r);
              }
            };
          if (d === "cut")
            return (t, o) => {
              if (!o?.waitForSync)
                return p(r), K(i, r, e, t), s(
                  n.getState().getNestedState(e, r),
                  r
                );
            };
          if (d === "cutByValue")
            return (t) => {
              for (let o = 0; o < h.length; o++)
                h[o] === t && K(i, r, e, o);
            };
          if (d === "toggleByValue")
            return (t) => {
              const o = h.findIndex((a) => a === t);
              o > -1 ? K(i, r, e, o) : ie(i, t, r, e);
            };
          if (d === "stateFind")
            return (t) => {
              const a = u().find(
                ({ item: v }, f) => t(v, f)
              );
              if (!a) return;
              const g = [...r, a.originalIndex.toString()];
              return s(a.item, g, m);
            };
          if (d === "findWith")
            return (t, o) => {
              const g = u().find(
                ({ item: f }) => f[t] === o
              );
              if (!g) return;
              const v = [...r, g.originalIndex.toString()];
              return s(g.item, v, m);
            };
        }
        const W = r[r.length - 1];
        if (!isNaN(Number(W))) {
          const u = r.slice(0, -1), t = n.getState().getNestedState(e, u);
          if (Array.isArray(t) && d === "cut")
            return () => K(
              i,
              u,
              e,
              Number(W)
            );
        }
        if (d === "get")
          return () => n.getState().getNestedState(e, r);
        if (d === "$derive")
          return (u) => Ie({
            _stateKey: e,
            _path: r,
            _effect: u.toString()
          });
        if (d === "$get")
          return () => Ie({
            _stateKey: e,
            _path: r
          });
        if (d === "lastSynced") {
          const u = `${e}:${r.join(".")}`;
          return n.getState().getSyncInfo(u);
        }
        if (d == "getLocalStorage")
          return (u) => oe(l + "-" + e + "-" + u);
        if (d === "_selected") {
          const u = r.slice(0, -1), t = u.join("."), o = n.getState().getNestedState(e, u);
          return Array.isArray(o) ? Number(r[r.length - 1]) === n.getState().getSelectedIndex(e, t) : void 0;
        }
        if (d === "setSelected")
          return (u) => {
            const t = r.slice(0, -1), o = Number(r[r.length - 1]), a = t.join(".");
            u ? n.getState().setSelectedIndex(e, a, o) : n.getState().setSelectedIndex(e, a, void 0);
            const g = n.getState().getNestedState(e, [...t]);
            X(i, g, t), p(t);
          };
        if (d === "toggleSelected")
          return () => {
            const u = r.slice(0, -1), t = Number(r[r.length - 1]), o = u.join("."), a = n.getState().getSelectedIndex(e, o);
            n.getState().setSelectedIndex(
              e,
              o,
              a === t ? void 0 : t
            );
            const g = n.getState().getNestedState(e, [...u]);
            X(i, g, u), p(u);
          };
        if (r.length == 0) {
          if (d === "applyJsonPatch")
            return (u) => {
              const t = n.getState().cogsStateStore[e], a = Pe(t, u).newDocument;
              be(
                e,
                n.getState().initialStateGlobal[e],
                a,
                i,
                S,
                l
              );
              const g = n.getState().stateComponents.get(e);
              if (g) {
                const v = le(t, a), f = new Set(v);
                for (const [
                  $,
                  T
                ] of g.components.entries()) {
                  let w = !1;
                  const N = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
                  if (!N.includes("none")) {
                    if (N.includes("all")) {
                      T.forceUpdate();
                      continue;
                    }
                    if (N.includes("component") && (T.paths.has("") && (w = !0), !w))
                      for (const _ of f) {
                        if (T.paths.has(_)) {
                          w = !0;
                          break;
                        }
                        let D = _.lastIndexOf(".");
                        for (; D !== -1; ) {
                          const L = _.substring(0, D);
                          if (T.paths.has(L)) {
                            w = !0;
                            break;
                          }
                          const F = _.substring(
                            D + 1
                          );
                          if (!isNaN(Number(F))) {
                            const E = L.lastIndexOf(".");
                            if (E !== -1) {
                              const O = L.substring(
                                0,
                                E
                              );
                              if (T.paths.has(O)) {
                                w = !0;
                                break;
                              }
                            }
                          }
                          D = L.lastIndexOf(".");
                        }
                        if (w) break;
                      }
                    if (!w && N.includes("deps") && T.depsFunction) {
                      const _ = T.depsFunction(a);
                      let D = !1;
                      typeof _ == "boolean" ? _ && (D = !0) : M(T.deps, _) || (T.deps = _, D = !0), D && (w = !0);
                    }
                    w && T.forceUpdate();
                  }
                }
              }
            };
          if (d === "validateZodSchema")
            return () => {
              const u = n.getState().getInitialOptions(e)?.validation, t = n.getState().addValidationError;
              if (!u?.zodSchema)
                throw new Error("Zod schema not found");
              if (!u?.key)
                throw new Error("Validation key not found");
              q(u.key);
              const o = n.getState().cogsStateStore[e];
              try {
                const a = n.getState().getValidationErrors(u.key);
                a && a.length > 0 && a.forEach(([v]) => {
                  v && v.startsWith(u.key) && q(v);
                });
                const g = u.zodSchema.safeParse(o);
                return g.success ? !0 : (g.error.errors.forEach((f) => {
                  const $ = f.path, T = f.message, w = [u.key, ...$].join(".");
                  t(w, T);
                }), ae(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
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
            return I.revertToInitialState;
          if (d === "updateInitialState") return I.updateInitialState;
          if (d === "removeValidation") return I.removeValidation;
        }
        if (d === "getFormRef")
          return () => Se.getState().getFormRef(e + "." + r.join("."));
        if (d === "validationWrapper")
          return ({
            children: u,
            hideMessage: t
          }) => /* @__PURE__ */ fe(
            ke,
            {
              formOpts: t ? { validation: { message: "" } } : void 0,
              path: r,
              validationKey: n.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: m?.validIndices,
              children: u
            }
          );
        if (d === "_stateKey") return e;
        if (d === "_path") return r;
        if (d === "_isServerSynced") return I._isServerSynced;
        if (d === "update")
          return (u, t) => {
            if (t?.debounce)
              Ve(() => {
                X(i, u, r, "");
                const o = n.getState().getNestedState(e, r);
                t?.afterUpdate && t.afterUpdate(o);
              }, t.debounce);
            else {
              X(i, u, r, "");
              const o = n.getState().getNestedState(e, r);
              t?.afterUpdate && t.afterUpdate(o);
            }
            p(r);
          };
        if (d === "formElement")
          return (u, t) => /* @__PURE__ */ fe(
            _e,
            {
              setState: i,
              stateKey: e,
              path: r,
              child: u,
              formOpts: t
            }
          );
        const k = [...r, d], H = n.getState().getNestedState(e, k);
        return s(H, k, m);
      }
    }, j = new Proxy(P, x);
    return c.set(R, {
      proxy: j,
      stateVersion: b
    }), j;
  }
  return s(
    n.getState().getNestedState(e, [])
  );
}
function Ie(e) {
  return re(We, { proxy: e });
}
function Ge({
  proxy: e,
  rebuildStateShape: i
}) {
  const S = n().getNestedState(e._stateKey, e._path);
  return Array.isArray(S) ? i(
    S,
    e._path
  ).stateMapNoRender(
    (c, b, p, I, s) => e._mapFn(c, b, p, I, s)
  ) : null;
}
function We({
  proxy: e
}) {
  const i = ee(null), S = `${e._stateKey}-${e._path.join(".")}`;
  return ce(() => {
    const l = i.current;
    if (!l || !l.parentElement) return;
    const c = l.parentElement, p = Array.from(c.childNodes).indexOf(l);
    let I = c.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, c.setAttribute("data-parent-id", I));
    const h = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: p,
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
      } catch (P) {
        console.error("Error evaluating effect function during mount:", P), m = r;
      }
    else
      m = r;
    m !== null && typeof m == "object" && (m = JSON.stringify(m));
    const R = document.createTextNode(String(m));
    l.replaceWith(R);
  }, [e._stateKey, e._path.join("."), e._effect]), re("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function nt(e) {
  const i = $e(
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
        reactiveType: ["component"]
      }), l.pathTrie && ue(l.pathTrie, e._path.join("."), c), n.getState().stateComponents.set(e._stateKey, l), () => {
        l.components.delete(c), l.pathTrie && Ue(
          l.pathTrie,
          e._path.join("."),
          c
        );
      };
    },
    () => n.getState().getNestedState(e._stateKey, e._path)
  );
  return re("text", {}, String(i));
}
export {
  Ie as $cogsSignal,
  nt as $cogsSignalStore,
  Ke as addStateOptions,
  et as createCogsState,
  tt as notifyComponent,
  Me as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
