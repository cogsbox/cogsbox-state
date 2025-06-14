"use client";
import { jsx as ie } from "react/jsx-runtime";
import { useState as te, useRef as ee, useEffect as le, useLayoutEffect as Ie, useMemo as $e, createElement as oe, useSyncExternalStore as Ae, startTransition as Ne } from "react";
import { transformStateFunc as Ve, isDeepEqual as G, isFunction as z, getNestedValue as W, getDifferences as de, debounce as ke } from "./utility.js";
import { pushFunc as ce, updateFn as X, cutFunc as K, ValidationWrapper as Ce, FormControlComponent as _e } from "./Functions.jsx";
import Pe from "superjson";
import { v4 as ue } from "uuid";
import "zod";
import { getGlobalStore as n, formRefStore as Se } from "./store.js";
import { useCogsConfig as Te } from "./CogsStateClient.jsx";
import { applyPatch as Oe } from "fast-json-patch";
function me(e, s) {
  const S = n.getState().getInitialOptions, l = n.getState().setInitialStateOptions, c = S(e) || {};
  l(e, {
    ...c,
    ...s
  });
}
function ye({
  stateKey: e,
  options: s,
  initialOptionsPart: S
}) {
  const l = Z(e) || {}, c = S[e] || {}, b = n.getState().setInitialStateOptions, I = { ...c, ...l };
  let h = !1;
  if (s)
    for (const i in s)
      I.hasOwnProperty(i) ? (i == "localStorage" && s[i] && I[i].key !== s[i]?.key && (h = !0, I[i] = s[i]), i == "initialState" && s[i] && I[i] !== s[i] && // Different references
      !G(I[i], s[i]) && (h = !0, I[i] = s[i])) : (h = !0, I[i] = s[i]);
  h && b(e, I);
}
function Ke(e, { formElements: s, validation: S }) {
  return { initialState: e, formElements: s, validation: S };
}
const et = (e, s) => {
  let S = e;
  const [l, c] = Ve(S);
  (Object.keys(c).length > 0 || s && Object.keys(s).length > 0) && Object.keys(c).forEach((h) => {
    c[h] = c[h] || {}, c[h].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...c[h].formElements || {}
      // State-specific overrides
    }, Z(h) || n.getState().setInitialStateOptions(h, c[h]);
  }), n.getState().setInitialStates(l), n.getState().setCreatedState(l);
  const b = (h, i) => {
    const [v] = te(i?.componentId ?? ue());
    ye({
      stateKey: h,
      options: i,
      initialOptionsPart: c
    });
    const r = n.getState().cogsStateStore[h] || l[h], m = i?.modifyState ? i.modifyState(r) : r, [D, P] = Me(
      m,
      {
        stateKey: h,
        syncUpdate: i?.syncUpdate,
        componentId: v,
        localStorage: i?.localStorage,
        middleware: i?.middleware,
        enabledSync: i?.enabledSync,
        reactiveType: i?.reactiveType,
        reactiveDeps: i?.reactiveDeps,
        initialState: i?.initialState,
        dependencies: i?.dependencies,
        serverState: i?.serverState
      }
    );
    return P;
  };
  function I(h, i) {
    ye({ stateKey: h, options: i, initialOptionsPart: c }), i.localStorage && De(h, i), se(h);
  }
  return { useCogsState: b, setCogsOptions: I };
}, {
  setUpdaterState: ne,
  setState: J,
  getInitialOptions: Z,
  getKeyState: be,
  getValidationErrors: xe,
  setStateLog: Fe,
  updateInitialStateGlobal: fe,
  addValidationError: je,
  removeValidationError: q,
  setServerSyncActions: Re
} = n.getState(), pe = (e, s, S, l, c) => {
  S?.log && console.log(
    "saving to localstorage",
    s,
    S.localStorage?.key,
    l
  );
  const b = z(S?.localStorage?.key) ? S.localStorage?.key(e) : S?.localStorage?.key;
  if (b && l) {
    const I = `${l}-${s}-${b}`;
    let h;
    try {
      h = ae(I)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: c ?? h
    }, v = Pe.serialize(i);
    window.localStorage.setItem(
      I,
      JSON.stringify(v.json)
    );
  }
}, ae = (e) => {
  if (!e) return null;
  try {
    const s = window.localStorage.getItem(e);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, De = (e, s) => {
  const S = n.getState().cogsStateStore[e], { sessionId: l } = Te(), c = z(s?.localStorage?.key) ? s.localStorage.key(S) : s?.localStorage?.key;
  if (c && l) {
    const b = ae(
      `${l}-${e}-${c}`
    );
    if (b && b.lastUpdated > (b.lastSyncedWithServer || 0))
      return J(e, b.state), se(e), !0;
  }
  return !1;
}, we = (e, s, S, l, c, b) => {
  const I = {
    initialState: s,
    updaterState: re(
      e,
      l,
      c,
      b
    ),
    state: S
  };
  fe(e, I.initialState), ne(e, I.updaterState), J(e, I.state);
}, se = (e) => {
  const s = n.getState().stateComponents.get(e);
  if (!s) return;
  const S = /* @__PURE__ */ new Set();
  s.components.forEach((l) => {
    (l ? Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType || "component"] : null)?.includes("none") || S.add(() => l.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((l) => l());
  });
}, tt = (e, s) => {
  const S = n.getState().stateComponents.get(e);
  if (S) {
    const l = `${e}////${s}`, c = S.components.get(l);
    if ((c ? Array.isArray(c.reactiveType) ? c.reactiveType : [c.reactiveType || "component"] : null)?.includes("none"))
      return;
    c && c.forceUpdate();
  }
}, Ue = (e, s, S, l) => {
  switch (e) {
    case "update":
      return {
        oldValue: W(s, l),
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
        oldValue: W(s, l),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function ge(e, s, S) {
  const l = s.split(".");
  let c = e;
  for (const b of l)
    c.children.has(b) || c.children.set(b, {
      subscribers: /* @__PURE__ */ new Set(),
      children: /* @__PURE__ */ new Map()
    }), c = c.children.get(b);
  c.subscribers.add(S);
}
function Ee(e, s, S) {
  const l = s.split(".");
  let c = e;
  for (const b of l)
    if (c = c.children.get(b), !c) return;
  c.subscribers.delete(S);
}
function ve(e, s) {
  console.log("Getting subscribers for path:", s);
  const S = s.split("."), l = new Set(e.subscribers);
  console.log("Root subscribers:", e.subscribers);
  let c = e;
  for (const b of S) {
    if (c = c.children?.get(b), console.log(`Segment ${b} subscribers:`, c?.subscribers), !c) break;
    c.subscribers.forEach((I) => l.add(I));
  }
  return console.log("Total subscribers found:", l), l;
}
function Me(e, {
  stateKey: s,
  serverSync: S,
  localStorage: l,
  formElements: c,
  reactiveDeps: b,
  reactiveType: I,
  componentId: h,
  initialState: i,
  syncUpdate: v,
  dependencies: r,
  serverState: m
} = {}) {
  const [D, P] = te({}), { sessionId: O } = Te();
  let U = !s;
  const [y] = te(s ?? ue()), d = n.getState().stateLog[y], Q = ee(/* @__PURE__ */ new Set()), L = ee(h ?? ue()), k = ee(
    null
  );
  k.current = Z(y) ?? null, le(() => {
    if (v && v.stateKey === y && v.path?.[0]) {
      J(y, (o) => ({
        ...o,
        [v.path[0]]: v.newValue
      }));
      const t = `${v.stateKey}:${v.path.join(".")}`;
      n.getState().setSyncInfo(t, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), le(() => {
    if (i) {
      me(y, {
        initialState: i
      });
      const t = k.current, a = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, u = n.getState().initialStateGlobal[y];
      if (!(u && !G(u, i) || !u) && !a)
        return;
      let f = null;
      const A = z(t?.localStorage?.key) ? t?.localStorage?.key(i) : t?.localStorage?.key;
      A && O && (f = ae(`${O}-${y}-${A}`));
      let T = i, w = !1;
      const x = a ? Date.now() : 0, $ = f?.lastUpdated || 0, C = f?.lastSyncedWithServer || 0;
      a && x > $ ? (T = t.serverState.data, w = !0) : f && $ > C && (T = f.state, t?.localStorage?.onChange && t?.localStorage?.onChange(T)), we(
        y,
        i,
        T,
        H,
        L.current,
        O
      ), w && A && O && pe(T, y, t, O, Date.now()), se(y), (Array.isArray(I) ? I : [I || "component"]).includes("none") || P({});
    }
  }, [
    i,
    m?.status,
    m?.data,
    ...r || []
  ]), Ie(() => {
    U && me(y, {
      serverSync: S,
      formElements: c,
      initialState: i,
      localStorage: l,
      middleware: k.current?.middleware
    });
    const t = `${y}////${L.current}`, o = n.getState().stateComponents.get(y) || {
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
      reactiveType: I ?? ["component", "deps"]
    }), n.getState().stateComponents.set(y, o), P({}), () => {
      const a = `${y}////${L.current}`;
      o && (o.components.delete(a), o.components.size === 0 && n.getState().stateComponents.delete(y));
    };
  }, []);
  const H = (t, o, a, u) => {
    if (Array.isArray(o)) {
      const p = `${y}-${o.join(".")}`;
      Q.current.add(p);
    }
    J(y, (p) => {
      const f = z(t) ? t(p) : t, A = `${y}-${o.join(".")}`;
      if (A) {
        let R = !1, E = n.getState().signalDomElements.get(A);
        if ((!E || E.size === 0) && (a.updateType === "insert" || a.updateType === "cut")) {
          const F = o.slice(0, -1), M = W(f, F);
          if (Array.isArray(M)) {
            R = !0;
            const N = `${y}-${F.join(".")}`;
            E = n.getState().signalDomElements.get(N);
          }
        }
        if (E) {
          const F = R ? W(f, o.slice(0, -1)) : W(f, o);
          E.forEach(({ parentId: M, position: N, effect: V }) => {
            const _ = document.querySelector(
              `[data-parent-id="${M}"]`
            );
            if (_) {
              const B = Array.from(_.childNodes);
              if (B[N]) {
                const Y = V ? new Function("state", `return (${V})(state)`)(F) : F;
                B[N].textContent = String(Y);
              }
            }
          });
        }
      }
      a.updateType === "update" && (u || k.current?.validation?.key) && o && q(
        (u || k.current?.validation?.key) + "." + o.join(".")
      );
      const T = o.slice(0, o.length - 1);
      a.updateType === "cut" && k.current?.validation?.key && q(
        k.current?.validation?.key + "." + T.join(".")
      ), a.updateType === "insert" && k.current?.validation?.key && xe(
        k.current?.validation?.key + "." + T.join(".")
      ).filter(([E, F]) => {
        let M = E?.split(".").length;
        if (E == T.join(".") && M == T.length - 1) {
          let N = E + "." + T;
          q(E), je(N, F);
        }
      });
      const w = n.getState().stateComponents.get(y);
      if (w && w.pathTrie) {
        const R = de(p, f), E = /* @__PURE__ */ new Set();
        R.forEach((N) => {
          ve(
            w.pathTrie,
            N
          ).forEach((_) => E.add(_));
        });
        const F = a.updateType === "update" ? o.join(".") : o.slice(0, -1).join(".") || "";
        ve(
          w.pathTrie,
          F
        ).forEach((N) => E.add(N)), console.log("componentsToUpdate", E), E.forEach((N) => {
          const V = w.components.get(N);
          if (V) {
            const _ = Array.isArray(V.reactiveType) ? V.reactiveType : [V.reactiveType || "component"];
            if (_.includes("none")) return;
            if (_.includes("all")) {
              V.forceUpdate();
              return;
            }
            if (_.includes("deps") && V.depsFunction) {
              const B = V.depsFunction(f);
              let Y = !1;
              if (typeof B == "boolean" ? B && (Y = !0) : G(V.deps, B) || (V.deps = B, Y = !0), Y) {
                V.forceUpdate();
                return;
              }
            }
            _.includes("component") && V.forceUpdate();
          }
        });
      }
      const x = Date.now();
      o = o.map((R, E) => {
        const F = o.slice(0, -1), M = W(f, F);
        return E === o.length - 1 && ["insert", "cut"].includes(a.updateType) ? (M.length - 1).toString() : R;
      });
      const { oldValue: $, newValue: C } = Ue(
        a.updateType,
        p,
        f,
        o
      ), j = {
        timeStamp: x,
        stateKey: y,
        path: o,
        updateType: a.updateType,
        status: "new",
        oldValue: $,
        newValue: C
      };
      if (Fe(y, (R) => {
        const F = [...R ?? [], j].reduce((M, N) => {
          const V = `${N.stateKey}:${JSON.stringify(N.path)}`, _ = M.get(V);
          return _ ? (_.timeStamp = Math.max(_.timeStamp, N.timeStamp), _.newValue = N.newValue, _.oldValue = _.oldValue ?? N.oldValue, _.updateType = N.updateType) : M.set(V, { ...N }), M;
        }, /* @__PURE__ */ new Map());
        return Array.from(F.values());
      }), pe(
        f,
        y,
        k.current,
        O
      ), k.current?.middleware && k.current.middleware({
        updateLog: d,
        update: j
      }), k.current?.serverSync) {
        const R = n.getState().serverState[y], E = k.current?.serverSync;
        Re(y, {
          syncKey: typeof E.syncKey == "string" ? E.syncKey : E.syncKey({ state: f }),
          rollBackState: R,
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
      O
    )
  ), n.getState().cogsStateStore[y] || J(y, e), n.getState().initialStateGlobal[y] || fe(y, e));
  const g = $e(() => re(
    y,
    H,
    L.current,
    O
  ), [y, O]);
  return [be(y), g];
}
function re(e, s, S, l) {
  const c = /* @__PURE__ */ new Map();
  let b = 0;
  const I = (v) => {
    const r = v.join(".");
    for (const [m] of c)
      (m === r || m.startsWith(r + ".")) && c.delete(m);
    b++;
  }, h = {
    removeValidation: (v) => {
      v?.validationKey && q(v.validationKey);
    },
    revertToInitialState: (v) => {
      const r = n.getState().getInitialOptions(e)?.validation;
      r?.key && q(r?.key), v?.validationKey && q(v.validationKey);
      const m = n.getState().initialStateGlobal[e];
      n.getState().clearSelectedIndexesForState(e), c.clear(), b++;
      const D = i(m, []), P = Z(e), O = z(P?.localStorage?.key) ? P?.localStorage?.key(m) : P?.localStorage?.key, U = `${l}-${e}-${O}`;
      U && localStorage.removeItem(U), ne(e, D), J(e, m);
      const y = n.getState().stateComponents.get(e);
      return y && y.components.forEach((d) => {
        d.forceUpdate();
      }), m;
    },
    updateInitialState: (v) => {
      c.clear(), b++;
      const r = re(
        e,
        s,
        S,
        l
      ), m = n.getState().initialStateGlobal[e], D = Z(e), P = z(D?.localStorage?.key) ? D?.localStorage?.key(m) : D?.localStorage?.key, O = `${l}-${e}-${P}`;
      return localStorage.getItem(O) && localStorage.removeItem(O), Ne(() => {
        fe(e, v), ne(e, r), J(e, v);
        const U = n.getState().stateComponents.get(e);
        U && U.components.forEach((y) => {
          y.forceUpdate();
        });
      }), {
        fetchId: (U) => r.get()[U]
      };
    },
    _initialState: n.getState().initialStateGlobal[e],
    _serverState: n.getState().serverState[e],
    _isLoading: n.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const v = n.getState().serverState[e];
      return !!(v && G(v, be(e)));
    }
  };
  function i(v, r = [], m) {
    const D = r.map(String).join(".");
    c.get(D);
    const P = function() {
      return n().getNestedState(e, r);
    };
    Object.keys(h).forEach((y) => {
      P[y] = h[y];
    });
    const O = {
      apply(y, d, Q) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${r.join(".")}`
        ), console.trace("Apply trap stack trace"), n().getNestedState(e, r);
      },
      get(y, d) {
        m?.validIndices && !Array.isArray(v) && (m = { ...m, validIndices: void 0 });
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
          if (console.log("stateEntry", t), t) {
            const o = t.components.get(g);
            if (o && !o.paths.has("")) {
              const a = r.join(".");
              let u = !0;
              for (const p of o.paths)
                if (a.startsWith(p) && (a === p || a[p.length] === ".")) {
                  u = !1;
                  break;
                }
              if (u) {
                console.log(
                  "ADDING PATH:",
                  a,
                  "for component:",
                  g
                ), o.paths.add(a);
                const p = n.getState().stateComponents.get(e);
                p && p.pathTrie ? (console.log(
                  "ADDING TO TRIE:",
                  a,
                  g
                ), ge(
                  p.pathTrie,
                  a,
                  g
                ), console.log("TRIE AFTER ADD:", p.pathTrie)) : console.log("NO TRIE FOUND for state:", e);
              }
            }
          }
        }
        if (d === "getDifferences")
          return () => de(
            n.getState().cogsStateStore[e],
            n.getState().initialStateGlobal[e]
          );
        if (d === "sync" && r.length === 0)
          return async function() {
            const g = n.getState().getInitialOptions(e), t = g?.sync;
            if (!t)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const o = n.getState().getNestedState(e, []), a = g?.validation?.key;
            try {
              const u = await t.action(o);
              if (u && !u.success && u.errors && a) {
                n.getState().removeValidationError(a), u.errors.forEach((f) => {
                  const A = [a, ...f.path].join(".");
                  n.getState().addValidationError(A, f.message);
                });
                const p = n.getState().stateComponents.get(e);
                p && p.components.forEach((f) => {
                  f.forceUpdate();
                });
              }
              return u?.success && t.onSuccess ? t.onSuccess(u.data) : !u?.success && t.onError && t.onError(u.error), u;
            } catch (u) {
              return t.onError && t.onError(u), { success: !1, error: u };
            }
          };
        if (d === "_status") {
          const g = n.getState().getNestedState(e, r), t = n.getState().initialStateGlobal[e], o = W(t, r);
          return G(g, o) ? "fresh" : "stale";
        }
        if (d === "getStatus")
          return function() {
            const g = n().getNestedState(
              e,
              r
            ), t = n.getState().initialStateGlobal[e], o = W(t, r);
            return G(g, o) ? "fresh" : "stale";
          };
        if (d === "removeStorage")
          return () => {
            const g = n.getState().initialStateGlobal[e], t = Z(e), o = z(t?.localStorage?.key) ? t?.localStorage?.key(g) : t?.localStorage?.key, a = `${l}-${e}-${o}`;
            a && localStorage.removeItem(a);
          };
        if (d === "showValidationErrors")
          return () => {
            const g = n.getState().getInitialOptions(e)?.validation;
            if (!g?.key)
              throw new Error("Validation key not found");
            return n.getState().getValidationErrors(g.key + "." + r.join("."));
          };
        if (Array.isArray(v)) {
          const g = () => m?.validIndices ? v.map((o, a) => ({
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
                return i(
                  v[t],
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
              const a = [...g()].sort(
                (f, A) => t(f.item, A.item)
              ), u = a.map(({ item: f }) => f), p = {
                ...m,
                validIndices: a.map(
                  ({ originalIndex: f }) => f
                )
              };
              return i(u, r, p);
            };
          if (d === "stateFilter")
            return (t) => {
              const a = g().filter(
                ({ item: f }, A) => t(f, A)
              ), u = a.map(({ item: f }) => f), p = {
                ...m,
                validIndices: a.map(
                  ({ originalIndex: f }) => f
                )
              };
              return i(u, r, p);
            };
          if (d === "stateMap")
            return (t) => {
              const o = n.getState().getNestedState(e, r);
              return o.map((a, u) => {
                let p;
                m?.validIndices && m.validIndices[u] !== void 0 ? p = m.validIndices[u] : p = u;
                const f = [...r, p.toString()], A = i(a, f, m);
                return /* @__PURE__ */ ie(() => {
                  const [, w] = te({}), x = `${S}-${r.join(".")}-${p}`;
                  return Ie(() => {
                    const $ = `${e}////${x}`, C = n.getState().stateComponents.get(e) || {
                      components: /* @__PURE__ */ new Map(),
                      pathTrie: {
                        subscribers: /* @__PURE__ */ new Set(),
                        children: /* @__PURE__ */ new Map()
                      }
                    };
                    return C.components.set($, {
                      forceUpdate: () => w({}),
                      paths: /* @__PURE__ */ new Set([f.join(".")]),
                      deps: [],
                      depsFunction: void 0,
                      reactiveType: ["component"]
                    }), C.pathTrie && ge(
                      C.pathTrie,
                      f.join("."),
                      $
                    ), n.getState().stateComponents.set(e, C), () => {
                      const j = n.getState().stateComponents.get(e);
                      j && (j.components.delete($), j.pathTrie && Ee(
                        j.pathTrie,
                        f.join("."),
                        $
                      ));
                    };
                  }, []), t(
                    a,
                    A,
                    u,
                    o,
                    i(o, r, m)
                  );
                }, {}, u);
              });
            };
          if (d === "stateMapNoRender")
            return (t) => v.map((a, u) => {
              let p;
              m?.validIndices && m.validIndices[u] !== void 0 ? p = m.validIndices[u] : p = u;
              const f = [...r, p.toString()], A = i(a, f, m);
              return t(
                a,
                A,
                u,
                v,
                i(v, r, m)
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
              rebuildStateShape: i
            });
          if (d === "stateFlattenOn")
            return (t) => {
              const o = v;
              c.clear(), b++;
              const a = o.flatMap(
                (u) => u[t] ?? []
              );
              return i(
                a,
                [...r, "[*]", t],
                m
              );
            };
          if (d === "index")
            return (t) => {
              const o = v[t];
              return i(o, [...r, t.toString()]);
            };
          if (d === "last")
            return () => {
              const t = n.getState().getNestedState(e, r);
              if (t.length === 0) return;
              const o = t.length - 1, a = t[o], u = [...r, o.toString()];
              return i(a, u);
            };
          if (d === "insert")
            return (t) => (I(r), ce(s, t, r, e), i(
              n.getState().getNestedState(e, r),
              r
            ));
          if (d === "uniqueInsert")
            return (t, o, a) => {
              const u = n.getState().getNestedState(e, r), p = z(t) ? t(u) : t;
              let f = null;
              if (!u.some((T) => {
                if (o) {
                  const x = o.every(
                    ($) => G(T[$], p[$])
                  );
                  return x && (f = T), x;
                }
                const w = G(T, p);
                return w && (f = T), w;
              }))
                I(r), ce(s, p, r, e);
              else if (a && f) {
                const T = a(f), w = u.map(
                  (x) => G(x, f) ? T : x
                );
                I(r), X(s, w, r);
              }
            };
          if (d === "cut")
            return (t, o) => {
              if (!o?.waitForSync)
                return I(r), K(s, r, e, t), i(
                  n.getState().getNestedState(e, r),
                  r
                );
            };
          if (d === "cutByValue")
            return (t) => {
              for (let o = 0; o < v.length; o++)
                v[o] === t && K(s, r, e, o);
            };
          if (d === "toggleByValue")
            return (t) => {
              const o = v.findIndex((a) => a === t);
              o > -1 ? K(s, r, e, o) : ce(s, t, r, e);
            };
          if (d === "stateFind")
            return (t) => {
              const a = g().find(
                ({ item: p }, f) => t(p, f)
              );
              if (!a) return;
              const u = [...r, a.originalIndex.toString()];
              return i(a.item, u, m);
            };
          if (d === "findWith")
            return (t, o) => {
              const u = g().find(
                ({ item: f }) => f[t] === o
              );
              if (!u) return;
              const p = [...r, u.originalIndex.toString()];
              return i(u.item, p, m);
            };
        }
        const L = r[r.length - 1];
        if (!isNaN(Number(L))) {
          const g = r.slice(0, -1), t = n.getState().getNestedState(e, g);
          if (Array.isArray(t) && d === "cut")
            return () => K(
              s,
              g,
              e,
              Number(L)
            );
        }
        if (d === "get")
          return () => n.getState().getNestedState(e, r);
        if (d === "$derive")
          return (g) => he({
            _stateKey: e,
            _path: r,
            _effect: g.toString()
          });
        if (d === "$get")
          return () => he({
            _stateKey: e,
            _path: r
          });
        if (d === "lastSynced") {
          const g = `${e}:${r.join(".")}`;
          return n.getState().getSyncInfo(g);
        }
        if (d == "getLocalStorage")
          return (g) => ae(l + "-" + e + "-" + g);
        if (d === "_selected") {
          const g = r.slice(0, -1), t = g.join("."), o = n.getState().getNestedState(e, g);
          return Array.isArray(o) ? Number(r[r.length - 1]) === n.getState().getSelectedIndex(e, t) : void 0;
        }
        if (d === "setSelected")
          return (g) => {
            const t = r.slice(0, -1), o = Number(r[r.length - 1]), a = t.join(".");
            g ? n.getState().setSelectedIndex(e, a, o) : n.getState().setSelectedIndex(e, a, void 0);
            const u = n.getState().getNestedState(e, [...t]);
            X(s, u, t), I(t);
          };
        if (d === "toggleSelected")
          return () => {
            const g = r.slice(0, -1), t = Number(r[r.length - 1]), o = g.join("."), a = n.getState().getSelectedIndex(e, o);
            n.getState().setSelectedIndex(
              e,
              o,
              a === t ? void 0 : t
            );
            const u = n.getState().getNestedState(e, [...g]);
            X(s, u, g), I(g);
          };
        if (r.length == 0) {
          if (d === "applyJsonPatch")
            return (g) => {
              const t = n.getState().cogsStateStore[e], a = Oe(t, g).newDocument;
              we(
                e,
                n.getState().initialStateGlobal[e],
                a,
                s,
                S,
                l
              );
              const u = n.getState().stateComponents.get(e);
              if (u) {
                const p = de(t, a), f = new Set(p);
                for (const [
                  A,
                  T
                ] of u.components.entries()) {
                  let w = !1;
                  const x = Array.isArray(T.reactiveType) ? T.reactiveType : [T.reactiveType || "component"];
                  if (!x.includes("none")) {
                    if (x.includes("all")) {
                      T.forceUpdate();
                      continue;
                    }
                    if (x.includes("component") && (T.paths.has("") && (w = !0), !w))
                      for (const $ of f) {
                        if (T.paths.has($)) {
                          w = !0;
                          break;
                        }
                        let C = $.lastIndexOf(".");
                        for (; C !== -1; ) {
                          const j = $.substring(0, C);
                          if (T.paths.has(j)) {
                            w = !0;
                            break;
                          }
                          const R = $.substring(
                            C + 1
                          );
                          if (!isNaN(Number(R))) {
                            const E = j.lastIndexOf(".");
                            if (E !== -1) {
                              const F = j.substring(
                                0,
                                E
                              );
                              if (T.paths.has(F)) {
                                w = !0;
                                break;
                              }
                            }
                          }
                          C = j.lastIndexOf(".");
                        }
                        if (w) break;
                      }
                    if (!w && x.includes("deps") && T.depsFunction) {
                      const $ = T.depsFunction(a);
                      let C = !1;
                      typeof $ == "boolean" ? $ && (C = !0) : G(T.deps, $) || (T.deps = $, C = !0), C && (w = !0);
                    }
                    w && T.forceUpdate();
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
              q(g.key);
              const o = n.getState().cogsStateStore[e];
              try {
                const a = n.getState().getValidationErrors(g.key);
                a && a.length > 0 && a.forEach(([p]) => {
                  p && p.startsWith(g.key) && q(p);
                });
                const u = g.zodSchema.safeParse(o);
                return u.success ? !0 : (u.error.errors.forEach((f) => {
                  const A = f.path, T = f.message, w = [g.key, ...A].join(".");
                  t(w, T);
                }), se(e), !1);
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
            children: g,
            hideMessage: t
          }) => /* @__PURE__ */ ie(
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
        if (d === "_isServerSynced") return h._isServerSynced;
        if (d === "update")
          return (g, t) => {
            if (t?.debounce)
              ke(() => {
                X(s, g, r, "");
                const o = n.getState().getNestedState(e, r);
                t?.afterUpdate && t.afterUpdate(o);
              }, t.debounce);
            else {
              X(s, g, r, "");
              const o = n.getState().getNestedState(e, r);
              t?.afterUpdate && t.afterUpdate(o);
            }
            I(r);
          };
        if (d === "formElement")
          return (g, t) => /* @__PURE__ */ ie(
            _e,
            {
              setState: s,
              stateKey: e,
              path: r,
              child: g,
              formOpts: t
            }
          );
        const k = [...r, d], H = n.getState().getNestedState(e, k);
        return i(H, k, m);
      }
    }, U = new Proxy(P, O);
    return c.set(D, {
      proxy: U,
      stateVersion: b
    }), U;
  }
  return i(
    n.getState().getNestedState(e, [])
  );
}
function he(e) {
  return oe(We, { proxy: e });
}
function Ge({
  proxy: e,
  rebuildStateShape: s
}) {
  const S = n().getNestedState(e._stateKey, e._path);
  return Array.isArray(S) ? s(
    S,
    e._path
  ).stateMapNoRender(
    (c, b, I, h, i) => e._mapFn(c, b, I, h, i)
  ) : null;
}
function We({
  proxy: e
}) {
  const s = ee(null), S = `${e._stateKey}-${e._path.join(".")}`;
  return le(() => {
    const l = s.current;
    if (!l || !l.parentElement) return;
    const c = l.parentElement, I = Array.from(c.childNodes).indexOf(l);
    let h = c.getAttribute("data-parent-id");
    h || (h = `parent-${crypto.randomUUID()}`, c.setAttribute("data-parent-id", h));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: h,
      position: I,
      effect: e._effect
    };
    n.getState().addSignalElement(S, v);
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
    const D = document.createTextNode(String(m));
    l.replaceWith(D);
  }, [e._stateKey, e._path.join("."), e._effect]), oe("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function nt(e) {
  const s = Ae(
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
      }), l.pathTrie && ge(l.pathTrie, e._path.join("."), c), n.getState().stateComponents.set(e._stateKey, l), () => {
        l.components.delete(c), l.pathTrie && Ee(
          l.pathTrie,
          e._path.join("."),
          c
        );
      };
    },
    () => n.getState().getNestedState(e._stateKey, e._path)
  );
  return oe("text", {}, String(s));
}
export {
  he as $cogsSignal,
  nt as $cogsSignalStore,
  Ke as addStateOptions,
  et as createCogsState,
  tt as notifyComponent,
  Me as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
