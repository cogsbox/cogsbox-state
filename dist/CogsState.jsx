"use client";
import { jsx as fe } from "react/jsx-runtime";
import { useState as te, useRef as ee, useEffect as ce, useLayoutEffect as Ie, useMemo as $e, createElement as oe, useSyncExternalStore as Ae, startTransition as Ne } from "react";
import { transformStateFunc as Ve, isDeepEqual as G, isFunction as z, getNestedValue as W, getDifferences as le, debounce as ke } from "./utility.js";
import { pushFunc as se, updateFn as X, cutFunc as K, ValidationWrapper as Ce, FormControlComponent as _e } from "./Functions.jsx";
import Pe from "superjson";
import { v4 as de } from "uuid";
import "zod";
import { getGlobalStore as n, formRefStore as Se } from "./store.js";
import { useCogsConfig as Te } from "./CogsStateClient.jsx";
import { applyPatch as xe } from "fast-json-patch";
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
  const l = Z(e) || {}, c = S[e] || {}, b = n.getState().setInitialStateOptions, I = { ...c, ...l };
  let h = !1;
  if (i)
    for (const s in i)
      I.hasOwnProperty(s) ? (s == "localStorage" && i[s] && I[s].key !== i[s]?.key && (h = !0, I[s] = i[s]), s == "initialState" && i[s] && I[s] !== i[s] && // Different references
      !G(I[s], i[s]) && (h = !0, I[s] = i[s])) : (h = !0, I[s] = i[s]);
  h && b(e, I);
}
function Ke(e, { formElements: i, validation: S }) {
  return { initialState: e, formElements: i, validation: S };
}
const et = (e, i) => {
  let S = e;
  const [l, c] = Ve(S);
  (Object.keys(c).length > 0 || i && Object.keys(i).length > 0) && Object.keys(c).forEach((h) => {
    c[h] = c[h] || {}, c[h].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...c[h].formElements || {}
      // State-specific overrides
    }, Z(h) || n.getState().setInitialStateOptions(h, c[h]);
  }), n.getState().setInitialStates(l), n.getState().setCreatedState(l);
  const b = (h, s) => {
    const [p] = te(s?.componentId ?? de());
    ye({
      stateKey: h,
      options: s,
      initialOptionsPart: c
    });
    const r = n.getState().cogsStateStore[h] || l[h], m = s?.modifyState ? s.modifyState(r) : r, [D, x] = Ue(
      m,
      {
        stateKey: h,
        syncUpdate: s?.syncUpdate,
        componentId: p,
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
  function I(h, s) {
    ye({ stateKey: h, options: s, initialOptionsPart: c }), s.localStorage && De(h, s), ie(h);
  }
  return { useCogsState: b, setCogsOptions: I };
}, {
  setUpdaterState: ne,
  setState: J,
  getInitialOptions: Z,
  getKeyState: be,
  getValidationErrors: Oe,
  setStateLog: je,
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
    const I = `${l}-${i}-${b}`;
    let h;
    try {
      h = ae(I)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: c ?? h
    }, p = Pe.serialize(s);
    window.localStorage.setItem(
      I,
      JSON.stringify(p.json)
    );
  }
}, ae = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, De = (e, i) => {
  const S = n.getState().cogsStateStore[e], { sessionId: l } = Te(), c = z(i?.localStorage?.key) ? i.localStorage.key(S) : i?.localStorage?.key;
  if (c && l) {
    const b = ae(
      `${l}-${e}-${c}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return J(e, b.state), ie(e), !0;
  }
  return !1;
}, we = (e, i, S, l, c, b) => {
  const I = {
    initialState: i,
    updaterState: re(
      e,
      l,
      c,
      b
    ),
    state: S
  };
  ge(e, I.initialState), ne(e, I.updaterState), J(e, I.state);
}, ie = (e) => {
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
}, Me = (e, i, S, l) => {
  switch (e) {
    case "update":
      return {
        oldValue: W(i, l),
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
        oldValue: W(i, l),
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
function Ee(e, i, S) {
  const l = i.split(".");
  let c = e;
  for (const b of l)
    if (c = c.children.get(b), !c) return;
  c.subscribers.delete(S);
}
function pe(e, i) {
  console.log("Getting subscribers for path:", i);
  const S = i.split("."), l = new Set(e.subscribers);
  console.log("Root subscribers:", e.subscribers);
  let c = e;
  for (const b of S) {
    if (c = c.children?.get(b), console.log(`Segment ${b} subscribers:`, c?.subscribers), !c) break;
    c.subscribers.forEach((I) => l.add(I));
  }
  return console.log("Total subscribers found:", l), l;
}
function Ue(e, {
  stateKey: i,
  serverSync: S,
  localStorage: l,
  formElements: c,
  reactiveDeps: b,
  reactiveType: I,
  componentId: h,
  initialState: s,
  syncUpdate: p,
  dependencies: r,
  serverState: m
} = {}) {
  const [D, x] = te({}), { sessionId: O } = Te();
  let M = !i;
  const [v] = te(i ?? de()), d = n.getState().stateLog[v], Q = ee(/* @__PURE__ */ new Set()), L = ee(h ?? de()), k = ee(
    null
  );
  k.current = Z(v) ?? null, ce(() => {
    if (p && p.stateKey === v && p.path?.[0]) {
      J(v, (o) => ({
        ...o,
        [p.path[0]]: p.newValue
      }));
      const t = `${p.stateKey}:${p.path.join(".")}`;
      n.getState().setSyncInfo(t, {
        timeStamp: p.timeStamp,
        userId: p.userId
      });
    }
  }, [p]), ce(() => {
    if (s) {
      me(v, {
        initialState: s
      });
      const t = k.current, a = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, g = n.getState().initialStateGlobal[v];
      if (!(g && !G(g, s) || !g) && !a)
        return;
      let f = null;
      const A = z(t?.localStorage?.key) ? t?.localStorage?.key(s) : t?.localStorage?.key;
      A && O && (f = ae(`${O}-${v}-${A}`));
      let T = s, w = !1;
      const C = a ? Date.now() : 0, $ = f?.lastUpdated || 0, _ = f?.lastSyncedWithServer || 0;
      a && C > $ ? (T = t.serverState.data, w = !0) : f && $ > _ && (T = f.state, t?.localStorage?.onChange && t?.localStorage?.onChange(T)), we(
        v,
        s,
        T,
        H,
        L.current,
        O
      ), w && A && O && ve(T, v, t, O, Date.now()), ie(v), (Array.isArray(I) ? I : [I || "component"]).includes("none") || x({});
    }
  }, [
    s,
    m?.status,
    m?.data,
    ...r || []
  ]), Ie(() => {
    M && me(v, {
      serverSync: S,
      formElements: c,
      initialState: s,
      localStorage: l,
      middleware: k.current?.middleware
    });
    const t = `${v}////${L.current}`, o = n.getState().stateComponents.get(v) || {
      components: /* @__PURE__ */ new Map(),
      pathTrie: {
        subscribers: /* @__PURE__ */ new Set(),
        children: /* @__PURE__ */ new Map()
      }
    };
    return o.components.set(t, {
      forceUpdate: () => x({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: b || void 0,
      reactiveType: I ?? ["component", "deps"]
    }), n.getState().stateComponents.set(v, o), x({}), () => {
      const a = `${v}////${L.current}`;
      o && (o.components.delete(a), o.components.size === 0 && n.getState().stateComponents.delete(v));
    };
  }, []);
  const H = (t, o, a, g) => {
    if (Array.isArray(o)) {
      const y = `${v}-${o.join(".")}`;
      Q.current.add(y);
    }
    J(v, (y) => {
      const f = z(t) ? t(y) : t, A = `${v}-${o.join(".")}`;
      if (A) {
        let R = !1, E = n.getState().signalDomElements.get(A);
        if ((!E || E.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const j = o.slice(0, -1), U = W(f, j);
          if (Array.isArray(U)) {
            R = !0;
            const N = `${v}-${j.join(".")}`;
            E = n.getState().signalDomElements.get(N);
          }
        }
        if (E) {
          const j = R ? W(f, o.slice(0, -1)) : W(f, o);
          E.forEach(({ parentId: U, position: N, effect: V }) => {
            const P = document.querySelector(
              `[data-parent-id="${U}"]`
            );
            if (P) {
              const B = Array.from(P.childNodes);
              if (B[N]) {
                const Y = V ? new Function("state", `return (${V})(state)`)(j) : j;
                B[N].textContent = String(Y);
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
      ), a.updateType === "insert" && k.current?.validation?.key && Oe(
        k.current?.validation?.key + "." + T.join(".")
      ).filter(([E, j]) => {
        let U = E?.split(".").length;
        if (E == T.join(".") && U == T.length - 1) {
          let N = E + "." + T;
          q(E), Fe(N, j);
        }
      });
      const w = n.getState().stateComponents.get(v);
      if (w && w.pathTrie) {
        const R = le(y, f), E = /* @__PURE__ */ new Set();
        R.forEach((N) => {
          pe(
            w.pathTrie,
            N
          ).forEach((P) => E.add(P));
        });
        const j = a.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        pe(
          w.pathTrie,
          j
        ).forEach((N) => E.add(N)), console.log("componentsToUpdate", E), E.forEach((N) => {
          const V = w.components.get(N);
          if (V) {
            const P = Array.isArray(V.reactiveType) ? V.reactiveType : [V.reactiveType || "component"];
            if (P.includes("none")) return;
            if (P.includes("all")) {
              V.forceUpdate();
              return;
            }
            if (P.includes("deps") && V.depsFunction) {
              const B = V.depsFunction(f);
              let Y = !1;
              if (typeof B == "boolean" ? B && (Y = !0) : G(V.deps, B) || (V.deps = B, Y = !0), Y) {
                V.forceUpdate();
                return;
              }
            }
            P.includes("component") && V.forceUpdate();
          }
        });
      }
      const C = Date.now();
      o = o.map((R, E) => {
        const j = o.slice(0, -1), U = W(f, j);
        return E === o.length - 1 && ["insert", "cut"].includes(a.updateType) ? (U.length - 1).toString() : R;
      });
      const { oldValue: $, newValue: _ } = Me(
        a.updateType,
        y,
        f,
        o
      ), F = {
        timeStamp: C,
        stateKey: v,
        path: o,
        updateType: a.updateType,
        status: "new",
        oldValue: $,
        newValue: _
      };
      if (je(v, (R) => {
        const j = [...R ?? [], F].reduce((U, N) => {
          const V = `${N.stateKey}:${JSON.stringify(N.path)}`, P = U.get(V);
          return P ? (P.timeStamp = Math.max(P.timeStamp, N.timeStamp), P.newValue = N.newValue, P.oldValue = P.oldValue ?? N.oldValue, P.updateType = N.updateType) : U.set(V, { ...N }), U;
        }, /* @__PURE__ */ new Map());
        return Array.from(j.values());
      }), ve(
        f,
        v,
        k.current,
        O
      ), k.current?.middleware && k.current.middleware({
        updateLog: d,
        update: F
      }), k.current?.serverSync) {
        const R = n.getState().serverState[v], E = k.current?.serverSync;
        Re(v, {
          syncKey: typeof E.syncKey == "string" ? E.syncKey : E.syncKey({ state: f }),
          rollBackState: R,
          actionTimeStamp: Date.now() + (E.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return f;
    });
  };
  n.getState().updaterState[v] || (ne(
    v,
    re(
      v,
      H,
      L.current,
      O
    )
  ), n.getState().cogsStateStore[v] || J(v, e), n.getState().initialStateGlobal[v] || ge(v, e));
  const u = $e(() => re(
    v,
    H,
    L.current,
    O
  ), [v, O]);
  return [be(v), u];
}
function re(e, i, S, l) {
  const c = /* @__PURE__ */ new Map();
  let b = 0;
  const I = (p) => {
    const r = p.join(".");
    for (const [m] of c)
      (m === r || m.startsWith(r + ".")) && c.delete(m);
    b++;
  }, h = {
    removeValidation: (p) => {
      p?.validationKey && q(p.validationKey);
    },
    revertToInitialState: (p) => {
      const r = n.getState().getInitialOptions(e)?.validation;
      r?.key && q(r?.key), p?.validationKey && q(p.validationKey);
      const m = n.getState().initialStateGlobal[e];
      n.getState().clearSelectedIndexesForState(e), c.clear(), b++;
      const D = s(m, []), x = Z(e), O = z(x?.localStorage?.key) ? x?.localStorage?.key(m) : x?.localStorage?.key, M = `${l}-${e}-${O}`;
      M && localStorage.removeItem(M), ne(e, D), J(e, m);
      const v = n.getState().stateComponents.get(e);
      return v && v.components.forEach((d) => {
        d.forceUpdate();
      }), m;
    },
    updateInitialState: (p) => {
      c.clear(), b++;
      const r = re(
        e,
        i,
        S,
        l
      ), m = n.getState().initialStateGlobal[e], D = Z(e), x = z(D?.localStorage?.key) ? D?.localStorage?.key(m) : D?.localStorage?.key, O = `${l}-${e}-${x}`;
      return localStorage.getItem(O) && localStorage.removeItem(O), Ne(() => {
        ge(e, p), ne(e, r), J(e, p);
        const M = n.getState().stateComponents.get(e);
        M && M.components.forEach((v) => {
          v.forceUpdate();
        });
      }), {
        fetchId: (M) => r.get()[M]
      };
    },
    _initialState: n.getState().initialStateGlobal[e],
    _serverState: n.getState().serverState[e],
    _isLoading: n.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const p = n.getState().serverState[e];
      return !!(p && G(p, be(e)));
    }
  };
  function s(p, r = [], m) {
    const D = r.map(String).join(".");
    c.get(D);
    const x = function() {
      return n().getNestedState(e, r);
    };
    Object.keys(h).forEach((v) => {
      x[v] = h[v];
    });
    const O = {
      apply(v, d, Q) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${r.join(".")}`
        ), console.trace("Apply trap stack trace"), n().getNestedState(e, r);
      },
      get(v, d) {
        m?.validIndices && !Array.isArray(p) && (m = { ...m, validIndices: void 0 });
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
          if (t) {
            const o = t.components.get(u);
            if (o && !o.paths.has("")) {
              const a = r.join(".");
              let g = !0;
              for (const y of o.paths)
                if (a.startsWith(y) && (a === y || a[y.length] === ".")) {
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
                const y = n.getState().stateComponents.get(e);
                y && y.pathTrie ? (console.log(
                  "ADDING TO TRIE:",
                  a,
                  u
                ), ue(
                  y.pathTrie,
                  a,
                  u
                ), console.log("TRIE AFTER ADD:", y.pathTrie)) : console.log("NO TRIE FOUND for state:", e);
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
                  const A = [a, ...f.path].join(".");
                  n.getState().addValidationError(A, f.message);
                });
                const y = n.getState().stateComponents.get(e);
                y && y.components.forEach((f) => {
                  f.forceUpdate();
                });
              }
              return g?.success && t.onSuccess ? t.onSuccess(g.data) : !g?.success && t.onError && t.onError(g.error), g;
            } catch (g) {
              return t.onError && t.onError(g), { success: !1, error: g };
            }
          };
        if (d === "_status") {
          const u = n.getState().getNestedState(e, r), t = n.getState().initialStateGlobal[e], o = W(t, r);
          return G(u, o) ? "fresh" : "stale";
        }
        if (d === "getStatus")
          return function() {
            const u = n().getNestedState(
              e,
              r
            ), t = n.getState().initialStateGlobal[e], o = W(t, r);
            return G(u, o) ? "fresh" : "stale";
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
        if (Array.isArray(p)) {
          const u = () => m?.validIndices ? p.map((o, a) => ({
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
                  p[t],
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
                (f, A) => t(f.item, A.item)
              ), g = a.map(({ item: f }) => f), y = {
                ...m,
                validIndices: a.map(
                  ({ originalIndex: f }) => f
                )
              };
              return s(g, r, y);
            };
          if (d === "stateFilter")
            return (t) => {
              const a = u().filter(
                ({ item: f }, A) => t(f, A)
              ), g = a.map(({ item: f }) => f), y = {
                ...m,
                validIndices: a.map(
                  ({ originalIndex: f }) => f
                )
              };
              return s(g, r, y);
            };
          if (d === "stateMap")
            return (t) => {
              const o = n.getState().getNestedState(e, r);
              return Array.isArray(o) ? o.map((a, g) => {
                let y;
                m?.validIndices && m.validIndices[g] !== void 0 ? y = m.validIndices[g] : y = g;
                const f = [...r, y.toString()], A = s(a, f, m);
                return t(a, A, {
                  register: () => {
                    const [, w] = te({}), C = `${S}-${r.join(".")}-${y}`;
                    Ie(() => {
                      const $ = `${e}////${C}`, _ = n.getState().stateComponents.get(e) || {
                        components: /* @__PURE__ */ new Map(),
                        pathTrie: {
                          subscribers: /* @__PURE__ */ new Set(),
                          children: /* @__PURE__ */ new Map()
                        }
                      };
                      return _.components.set($, {
                        forceUpdate: () => w({}),
                        paths: /* @__PURE__ */ new Set([f.join(".")]),
                        deps: [],
                        depsFunction: void 0,
                        reactiveType: ["component"]
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
                  index: g,
                  originalIndex: y
                });
              }) : (console.warn(
                `stateMap called on a non-array value at path: ${r.join(".")}. The current value is:`,
                o
              ), null);
            };
          if (d === "stateMapNoRender")
            return (t) => p.map((a, g) => {
              let y;
              m?.validIndices && m.validIndices[g] !== void 0 ? y = m.validIndices[g] : y = g;
              const f = [...r, y.toString()], A = s(a, f, m);
              return t(
                a,
                A,
                g,
                p,
                s(p, r, m)
              );
            });
          if (d === "$stateMap")
            return (t) => oe(Ge, {
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
              const o = p;
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
              const o = p[t];
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
            return (t) => (I(r), se(i, t, r, e), s(
              n.getState().getNestedState(e, r),
              r
            ));
          if (d === "uniqueInsert")
            return (t, o, a) => {
              const g = n.getState().getNestedState(e, r), y = z(t) ? t(g) : t;
              let f = null;
              if (!g.some((T) => {
                if (o) {
                  const C = o.every(
                    ($) => G(T[$], y[$])
                  );
                  return C && (f = T), C;
                }
                const w = G(T, y);
                return w && (f = T), w;
              }))
                I(r), se(i, y, r, e);
              else if (a && f) {
                const T = a(f), w = g.map(
                  (C) => G(C, f) ? T : C
                );
                I(r), X(i, w, r);
              }
            };
          if (d === "cut")
            return (t, o) => {
              if (!o?.waitForSync)
                return I(r), K(i, r, e, t), s(
                  n.getState().getNestedState(e, r),
                  r
                );
            };
          if (d === "cutByValue")
            return (t) => {
              for (let o = 0; o < p.length; o++)
                p[o] === t && K(i, r, e, o);
            };
          if (d === "toggleByValue")
            return (t) => {
              const o = p.findIndex((a) => a === t);
              o > -1 ? K(i, r, e, o) : se(i, t, r, e);
            };
          if (d === "stateFind")
            return (t) => {
              const a = u().find(
                ({ item: y }, f) => t(y, f)
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
              const y = [...r, g.originalIndex.toString()];
              return s(g.item, y, m);
            };
        }
        const L = r[r.length - 1];
        if (!isNaN(Number(L))) {
          const u = r.slice(0, -1), t = n.getState().getNestedState(e, u);
          if (Array.isArray(t) && d === "cut")
            return () => K(
              i,
              u,
              e,
              Number(L)
            );
        }
        if (d === "get")
          return () => n.getState().getNestedState(e, r);
        if (d === "$derive")
          return (u) => he({
            _stateKey: e,
            _path: r,
            _effect: u.toString()
          });
        if (d === "$get")
          return () => he({
            _stateKey: e,
            _path: r
          });
        if (d === "lastSynced") {
          const u = `${e}:${r.join(".")}`;
          return n.getState().getSyncInfo(u);
        }
        if (d == "getLocalStorage")
          return (u) => ae(l + "-" + e + "-" + u);
        if (d === "_selected") {
          const u = r.slice(0, -1), t = u.join("."), o = n.getState().getNestedState(e, u);
          return Array.isArray(o) ? Number(r[r.length - 1]) === n.getState().getSelectedIndex(e, t) : void 0;
        }
        if (d === "setSelected")
          return (u) => {
            const t = r.slice(0, -1), o = Number(r[r.length - 1]), a = t.join(".");
            u ? n.getState().setSelectedIndex(e, a, o) : n.getState().setSelectedIndex(e, a, void 0);
            const g = n.getState().getNestedState(e, [...t]);
            X(i, g, t), I(t);
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
            X(i, g, u), I(u);
          };
        if (r.length == 0) {
          if (d === "applyJsonPatch")
            return (u) => {
              const t = n.getState().cogsStateStore[e], a = xe(t, u).newDocument;
              we(
                e,
                n.getState().initialStateGlobal[e],
                a,
                i,
                S,
                l
              );
              const g = n.getState().stateComponents.get(e);
              if (g) {
                const y = le(t, a), f = new Set(y);
                for (const [
                  A,
                  T
                ] of g.components.entries()) {
                  let w = !1;
                  const C = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
                  if (!C.includes("none")) {
                    if (C.includes("all")) {
                      T.forceUpdate();
                      continue;
                    }
                    if (C.includes("component") && (T.paths.has("") && (w = !0), !w))
                      for (const $ of f) {
                        if (T.paths.has($)) {
                          w = !0;
                          break;
                        }
                        let _ = $.lastIndexOf(".");
                        for (; _ !== -1; ) {
                          const F = $.substring(0, _);
                          if (T.paths.has(F)) {
                            w = !0;
                            break;
                          }
                          const R = $.substring(
                            _ + 1
                          );
                          if (!isNaN(Number(R))) {
                            const E = F.lastIndexOf(".");
                            if (E !== -1) {
                              const j = F.substring(
                                0,
                                E
                              );
                              if (T.paths.has(j)) {
                                w = !0;
                                break;
                              }
                            }
                          }
                          _ = F.lastIndexOf(".");
                        }
                        if (w) break;
                      }
                    if (!w && C.includes("deps") && T.depsFunction) {
                      const $ = T.depsFunction(a);
                      let _ = !1;
                      typeof $ == "boolean" ? $ && (_ = !0) : G(T.deps, $) || (T.deps = $, _ = !0), _ && (w = !0);
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
                a && a.length > 0 && a.forEach(([y]) => {
                  y && y.startsWith(u.key) && q(y);
                });
                const g = u.zodSchema.safeParse(o);
                return g.success ? !0 : (g.error.errors.forEach((f) => {
                  const A = f.path, T = f.message, w = [u.key, ...A].join(".");
                  t(w, T);
                }), ie(e), !1);
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
            return h.revertToInitialState;
          if (d === "updateInitialState") return h.updateInitialState;
          if (d === "removeValidation") return h.removeValidation;
        }
        if (d === "getFormRef")
          return () => Se.getState().getFormRef(e + "." + r.join("."));
        if (d === "validationWrapper")
          return ({
            children: u,
            hideMessage: t
          }) => /* @__PURE__ */ fe(
            Ce,
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
        if (d === "_isServerSynced") return h._isServerSynced;
        if (d === "update")
          return (u, t) => {
            if (t?.debounce)
              ke(() => {
                X(i, u, r, "");
                const o = n.getState().getNestedState(e, r);
                t?.afterUpdate && t.afterUpdate(o);
              }, t.debounce);
            else {
              X(i, u, r, "");
              const o = n.getState().getNestedState(e, r);
              t?.afterUpdate && t.afterUpdate(o);
            }
            I(r);
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
    }, M = new Proxy(x, O);
    return c.set(D, {
      proxy: M,
      stateVersion: b
    }), M;
  }
  return s(
    n.getState().getNestedState(e, [])
  );
}
function he(e) {
  return oe(We, { proxy: e });
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
    (c, b, I, h, s) => e._mapFn(c, b, I, h, s)
  ) : null;
}
function We({
  proxy: e
}) {
  const i = ee(null), S = `${e._stateKey}-${e._path.join(".")}`;
  return ce(() => {
    const l = i.current;
    if (!l || !l.parentElement) return;
    const c = l.parentElement, I = Array.from(c.childNodes).indexOf(l);
    let h = c.getAttribute("data-parent-id");
    h || (h = `parent-${crypto.randomUUID()}`, c.setAttribute("data-parent-id", h));
    const p = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: h,
      position: I,
      effect: e._effect
    };
    n.getState().addSignalElement(S, p);
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
    const D = document.createTextNode(String(m));
    l.replaceWith(D);
  }, [e._stateKey, e._path.join("."), e._effect]), oe("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function nt(e) {
  const i = Ae(
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
        l.components.delete(c), l.pathTrie && Ee(
          l.pathTrie,
          e._path.join("."),
          c
        );
      };
    },
    () => n.getState().getNestedState(e._stateKey, e._path)
  );
  return oe("text", {}, String(i));
}
export {
  he as $cogsSignal,
  nt as $cogsSignalStore,
  Ke as addStateOptions,
  et as createCogsState,
  tt as notifyComponent,
  Ue as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
