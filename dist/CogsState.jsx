"use client";
import { jsx as ee, Fragment as ke } from "react/jsx-runtime";
import { useState as ne, useRef as te, useEffect as de, useLayoutEffect as pe, useMemo as Te, createElement as oe, useSyncExternalStore as Ve, startTransition as Ne } from "react";
import { transformStateFunc as Ae, isDeepEqual as W, isFunction as B, getNestedValue as G, getDifferences as ue, debounce as be } from "./utility.js";
import { pushFunc as le, updateFn as X, cutFunc as K, ValidationWrapper as Ce, FormControlComponent as Pe } from "./Functions.jsx";
import _e from "superjson";
import { v4 as ge } from "uuid";
import "zod";
import { getGlobalStore as n, formRefStore as me } from "./store.js";
import { useCogsConfig as we } from "./CogsStateClient.jsx";
import { applyPatch as xe } from "fast-json-patch";
function ye(e, i) {
  const S = n.getState().getInitialOptions, g = n.getState().setInitialStateOptions, m = S(e) || {};
  g(e, {
    ...m,
    ...i
  });
}
function ve({
  stateKey: e,
  options: i,
  initialOptionsPart: S
}) {
  const g = H(e) || {}, m = S[e] || {}, E = n.getState().setInitialStateOptions, p = { ...m, ...g };
  let I = !1;
  if (i)
    for (const s in i)
      p.hasOwnProperty(s) ? (s == "localStorage" && i[s] && p[s].key !== i[s]?.key && (I = !0, p[s] = i[s]), s == "initialState" && i[s] && p[s] !== i[s] && // Different references
      !W(p[s], i[s]) && (I = !0, p[s] = i[s])) : (I = !0, p[s] = i[s]);
  I && E(e, p);
}
function et(e, { formElements: i, validation: S }) {
  return { initialState: e, formElements: i, validation: S };
}
const tt = (e, i) => {
  let S = e;
  const [g, m] = Ae(S);
  (Object.keys(m).length > 0 || i && Object.keys(i).length > 0) && Object.keys(m).forEach((I) => {
    m[I] = m[I] || {}, m[I].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...m[I].formElements || {}
      // State-specific overrides
    }, H(I) || n.getState().setInitialStateOptions(I, m[I]);
  }), n.getState().setInitialStates(g), n.getState().setCreatedState(g);
  const E = (I, s) => {
    const [v] = ne(s?.componentId ?? ge());
    ve({
      stateKey: I,
      options: s,
      initialOptionsPart: m
    });
    const r = n.getState().cogsStateStore[I] || g[I], f = s?.modifyState ? s.modifyState(r) : r, [R, b] = De(
      f,
      {
        stateKey: I,
        syncUpdate: s?.syncUpdate,
        componentId: v,
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
    return b;
  };
  function p(I, s) {
    ve({ stateKey: I, options: s, initialOptionsPart: m }), s.localStorage && Ue(I, s), se(I);
  }
  return { useCogsState: E, setCogsOptions: p };
}, {
  setUpdaterState: re,
  setState: Z,
  getInitialOptions: H,
  getKeyState: Ee,
  getValidationErrors: Oe,
  setStateLog: je,
  updateInitialStateGlobal: fe,
  addValidationError: Fe,
  removeValidationError: J,
  setServerSyncActions: Re
} = n.getState(), Ie = (e, i, S, g, m) => {
  S?.log && console.log(
    "saving to localstorage",
    i,
    S.localStorage?.key,
    g
  );
  const E = B(S?.localStorage?.key) ? S.localStorage?.key(e) : S?.localStorage?.key;
  if (E && g) {
    const p = `${g}-${i}-${E}`;
    let I;
    try {
      I = ie(p)?.lastSyncedWithServer;
    } catch {
    }
    const s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: m ?? I
    }, v = _e.serialize(s);
    window.localStorage.setItem(
      p,
      JSON.stringify(v.json)
    );
  }
}, ie = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Ue = (e, i) => {
  const S = n.getState().cogsStateStore[e], { sessionId: g } = we(), m = B(i?.localStorage?.key) ? i.localStorage.key(S) : i?.localStorage?.key;
  if (m && g) {
    const E = ie(
      `${g}-${e}-${m}`
    );
    if (E && E.lastUpdated > (E.lastSyncedWithServer || 0))
      return Z(e, E.state), se(e), !0;
  }
  return !1;
}, $e = (e, i, S, g, m, E) => {
  const p = {
    initialState: i,
    updaterState: ae(
      e,
      g,
      m,
      E
    ),
    state: S
  };
  fe(e, p.initialState), re(e, p.updaterState), Z(e, p.state);
}, se = (e) => {
  const i = n.getState().stateComponents.get(e);
  if (!i) return;
  const S = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || S.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((g) => g());
  });
}, nt = (e, i) => {
  const S = n.getState().stateComponents.get(e);
  if (S) {
    const g = `${e}////${i}`, m = S.components.get(g);
    if ((m ? Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"] : null)?.includes("none"))
      return;
    m && m.forceUpdate();
  }
}, Me = (e, i, S, g) => {
  switch (e) {
    case "update":
      return {
        oldValue: G(i, g),
        newValue: G(S, g)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: G(S, g)
      };
    case "cut":
      return {
        oldValue: G(i, g),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function De(e, {
  stateKey: i,
  serverSync: S,
  localStorage: g,
  formElements: m,
  reactiveDeps: E,
  reactiveType: p,
  componentId: I,
  initialState: s,
  syncUpdate: v,
  dependencies: r,
  serverState: f
} = {}) {
  const [R, b] = ne({}), { sessionId: C } = we();
  let U = !i;
  const [y] = ne(i ?? ge()), c = n.getState().stateLog[y], Q = te(/* @__PURE__ */ new Set()), z = te(I ?? ge()), N = te(
    null
  );
  N.current = H(y) ?? null, de(() => {
    if (v && v.stateKey === y && v.path?.[0]) {
      Z(y, (a) => ({
        ...a,
        [v.path[0]]: v.newValue
      }));
      const t = `${v.stateKey}:${v.path.join(".")}`;
      n.getState().setSyncInfo(t, {
        timeStamp: v.timeStamp,
        userId: v.userId
      });
    }
  }, [v]), de(() => {
    if (s) {
      ye(y, {
        initialState: s
      });
      const t = N.current, o = t?.serverState?.id !== void 0 && t?.serverState?.status === "success" && t?.serverState?.data, l = n.getState().initialStateGlobal[y];
      if (!(l && !W(l, s) || !l) && !o)
        return;
      let u = null;
      const V = B(t?.localStorage?.key) ? t?.localStorage?.key(s) : t?.localStorage?.key;
      V && C && (u = ie(`${C}-${y}-${V}`));
      let w = s, k = !1;
      const x = o ? Date.now() : 0, A = u?.lastUpdated || 0, M = u?.lastSyncedWithServer || 0;
      o && x > A ? (w = t.serverState.data, k = !0) : u && A > M && (w = u.state, t?.localStorage?.onChange && t?.localStorage?.onChange(w)), $e(
        y,
        s,
        w,
        Y,
        z.current,
        C
      ), k && V && C && Ie(w, y, t, C, Date.now()), se(y), (Array.isArray(p) ? p : [p || "component"]).includes("none") || b({});
    }
  }, [
    s,
    f?.status,
    f?.data,
    ...r || []
  ]), pe(() => {
    U && ye(y, {
      serverSync: S,
      formElements: m,
      initialState: s,
      localStorage: g,
      middleware: N.current?.middleware
    });
    const t = `${y}////${z.current}`, a = n.getState().stateComponents.get(y) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(t, {
      forceUpdate: () => b({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0,
      reactiveType: p ?? ["component", "deps"]
    }), n.getState().stateComponents.set(y, a), b({}), () => {
      const o = `${y}////${z.current}`;
      a && (a.components.delete(o), a.components.size === 0 && n.getState().stateComponents.delete(y));
    };
  }, []);
  const Y = (t, a, o, l) => {
    if (Array.isArray(a)) {
      const h = `${y}-${a.join(".")}`;
      Q.current.add(h);
    }
    Z(y, (h) => {
      const u = B(t) ? t(h) : t, V = `${y}-${a.join(".")}`;
      if (V) {
        let j = !1, T = n.getState().signalDomElements.get(V);
        if ((!T || T.size === 0) && (o.updateType === "insert" || o.updateType === "cut")) {
          const P = a.slice(0, -1), D = G(u, P);
          if (Array.isArray(D)) {
            j = !0;
            const $ = `${y}-${P.join(".")}`;
            T = n.getState().signalDomElements.get($);
          }
        }
        if (T) {
          const P = j ? G(u, a.slice(0, -1)) : G(u, a);
          T.forEach(({ parentId: D, position: $, effect: O }) => {
            const _ = document.querySelector(
              `[data-parent-id="${D}"]`
            );
            if (_) {
              const L = Array.from(_.childNodes);
              if (L[$]) {
                const F = O ? new Function("state", `return (${O})(state)`)(P) : P;
                L[$].textContent = String(F);
              }
            }
          });
        }
      }
      o.updateType === "update" && (l || N.current?.validation?.key) && a && J(
        (l || N.current?.validation?.key) + "." + a.join(".")
      );
      const w = a.slice(0, a.length - 1);
      o.updateType === "cut" && N.current?.validation?.key && J(
        N.current?.validation?.key + "." + w.join(".")
      ), o.updateType === "insert" && N.current?.validation?.key && Oe(
        N.current?.validation?.key + "." + w.join(".")
      ).filter(([T, P]) => {
        let D = T?.split(".").length;
        if (T == w.join(".") && D == w.length - 1) {
          let $ = T + "." + w;
          J(T), Fe($, P);
        }
      });
      const k = n.getState().stateComponents.get(y);
      if (k) {
        const j = ue(h, u), T = new Set(j), P = o.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          D,
          $
        ] of k.components.entries()) {
          let O = !1;
          const _ = Array.isArray($.reactiveType) ? $.reactiveType : [$.reactiveType || "component"];
          if (!_.includes("none")) {
            if (_.includes("all")) {
              $.forceUpdate();
              continue;
            }
            if (_.includes("component") && (($.paths.has(P) || $.paths.has("")) && (O = !0), !O))
              for (const L of T) {
                let F = L;
                for (; ; ) {
                  if ($.paths.has(F)) {
                    O = !0;
                    break;
                  }
                  const ce = F.lastIndexOf(".");
                  if (ce !== -1) {
                    const Se = F.substring(
                      0,
                      ce
                    );
                    if (!isNaN(
                      Number(F.substring(ce + 1))
                    ) && $.paths.has(Se)) {
                      O = !0;
                      break;
                    }
                    F = Se;
                  } else
                    F = "";
                  if (F === "")
                    break;
                }
                if (O) break;
              }
            if (!O && _.includes("deps") && $.depsFunction) {
              const L = $.depsFunction(u);
              let F = !1;
              typeof L == "boolean" ? L && (F = !0) : W($.deps, L) || ($.deps = L, F = !0), F && (O = !0);
            }
            O && $.forceUpdate();
          }
        }
      }
      const x = Date.now();
      a = a.map((j, T) => {
        const P = a.slice(0, -1), D = G(u, P);
        return T === a.length - 1 && ["insert", "cut"].includes(o.updateType) ? (D.length - 1).toString() : j;
      });
      const { oldValue: A, newValue: M } = Me(
        o.updateType,
        h,
        u,
        a
      ), q = {
        timeStamp: x,
        stateKey: y,
        path: a,
        updateType: o.updateType,
        status: "new",
        oldValue: A,
        newValue: M
      };
      if (je(y, (j) => {
        const P = [...j ?? [], q].reduce((D, $) => {
          const O = `${$.stateKey}:${JSON.stringify($.path)}`, _ = D.get(O);
          return _ ? (_.timeStamp = Math.max(_.timeStamp, $.timeStamp), _.newValue = $.newValue, _.oldValue = _.oldValue ?? $.oldValue, _.updateType = $.updateType) : D.set(O, { ...$ }), D;
        }, /* @__PURE__ */ new Map());
        return Array.from(P.values());
      }), Ie(
        u,
        y,
        N.current,
        C
      ), N.current?.middleware && N.current.middleware({
        updateLog: c,
        update: q
      }), N.current?.serverSync) {
        const j = n.getState().serverState[y], T = N.current?.serverSync;
        Re(y, {
          syncKey: typeof T.syncKey == "string" ? T.syncKey : T.syncKey({ state: u }),
          rollBackState: j,
          actionTimeStamp: Date.now() + (T.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return u;
    });
  };
  n.getState().updaterState[y] || (re(
    y,
    ae(
      y,
      Y,
      z.current,
      C
    )
  ), n.getState().cogsStateStore[y] || Z(y, e), n.getState().initialStateGlobal[y] || fe(y, e));
  const d = Te(() => ae(
    y,
    Y,
    z.current,
    C
  ), [y, C]);
  return [Ee(y), d];
}
function ae(e, i, S, g) {
  const m = /* @__PURE__ */ new Map();
  let E = 0;
  const p = (v) => {
    const r = v.join(".");
    for (const [f] of m)
      (f === r || f.startsWith(r + ".")) && m.delete(f);
    E++;
  }, I = {
    removeValidation: (v) => {
      v?.validationKey && J(v.validationKey);
    },
    revertToInitialState: (v) => {
      const r = n.getState().getInitialOptions(e)?.validation;
      r?.key && J(r?.key), v?.validationKey && J(v.validationKey);
      const f = n.getState().initialStateGlobal[e];
      n.getState().clearSelectedIndexesForState(e), m.clear(), E++;
      const R = s(f, []), b = H(e), C = B(b?.localStorage?.key) ? b?.localStorage?.key(f) : b?.localStorage?.key, U = `${g}-${e}-${C}`;
      U && localStorage.removeItem(U), re(e, R), Z(e, f);
      const y = n.getState().stateComponents.get(e);
      return y && y.components.forEach((c) => {
        c.forceUpdate();
      }), f;
    },
    updateInitialState: (v) => {
      m.clear(), E++;
      const r = ae(
        e,
        i,
        S,
        g
      ), f = n.getState().initialStateGlobal[e], R = H(e), b = B(R?.localStorage?.key) ? R?.localStorage?.key(f) : R?.localStorage?.key, C = `${g}-${e}-${b}`;
      return localStorage.getItem(C) && localStorage.removeItem(C), Ne(() => {
        fe(e, v), re(e, r), Z(e, v);
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
      return !!(v && W(v, Ee(e)));
    }
  };
  function s(v, r = [], f) {
    const R = r.map(String).join(".");
    m.get(R);
    const b = function() {
      return n().getNestedState(e, r);
    };
    Object.keys(I).forEach((y) => {
      b[y] = I[y];
    });
    const C = {
      apply(y, c, Q) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${r.join(".")}`
        ), console.trace("Apply trap stack trace"), n().getNestedState(e, r);
      },
      get(y, c) {
        f?.validIndices && !Array.isArray(v) && (f = { ...f, validIndices: void 0 });
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
        if (c !== "then" && !c.startsWith("$") && c !== "stateMapNoRender" && !Q.has(c)) {
          const d = `${e}////${S}`, t = n.getState().stateComponents.get(e);
          if (t) {
            const a = t.components.get(d);
            if (a && !a.pathsInitialized && (a.pathsInitialized = !0, !a.paths.has(""))) {
              const o = r.join(".");
              let l = !0;
              for (const h of a.paths)
                if (o.startsWith(h) && (o === h || o[h.length] === ".")) {
                  l = !1;
                  break;
                }
              l && a.paths.add(o);
            }
          }
        }
        if (c === "getDifferences")
          return () => ue(
            n.getState().cogsStateStore[e],
            n.getState().initialStateGlobal[e]
          );
        if (c === "sync" && r.length === 0)
          return async function() {
            const d = n.getState().getInitialOptions(e), t = d?.sync;
            if (!t)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const a = n.getState().getNestedState(e, []), o = d?.validation?.key;
            try {
              const l = await t.action(a);
              if (l && !l.success && l.errors && o) {
                n.getState().removeValidationError(o), l.errors.forEach((u) => {
                  const V = [o, ...u.path].join(".");
                  n.getState().addValidationError(V, u.message);
                });
                const h = n.getState().stateComponents.get(e);
                h && h.components.forEach((u) => {
                  u.forceUpdate();
                });
              }
              return l?.success && t.onSuccess ? t.onSuccess(l.data) : !l?.success && t.onError && t.onError(l.error), l;
            } catch (l) {
              return t.onError && t.onError(l), { success: !1, error: l };
            }
          };
        if (c === "_status") {
          const d = n.getState().getNestedState(e, r), t = n.getState().initialStateGlobal[e], a = G(t, r);
          return W(d, a) ? "fresh" : "stale";
        }
        if (c === "getStatus")
          return function() {
            const d = n().getNestedState(
              e,
              r
            ), t = n.getState().initialStateGlobal[e], a = G(t, r);
            return W(d, a) ? "fresh" : "stale";
          };
        if (c === "removeStorage")
          return () => {
            const d = n.getState().initialStateGlobal[e], t = H(e), a = B(t?.localStorage?.key) ? t?.localStorage?.key(d) : t?.localStorage?.key, o = `${g}-${e}-${a}`;
            o && localStorage.removeItem(o);
          };
        if (c === "showValidationErrors")
          return () => {
            const d = n.getState().getInitialOptions(e)?.validation;
            if (!d?.key)
              throw new Error("Validation key not found");
            return n.getState().getValidationErrors(d.key + "." + r.join("."));
          };
        if (Array.isArray(v)) {
          const d = () => f?.validIndices ? v.map((a, o) => ({
            item: a,
            originalIndex: f.validIndices[o]
          })) : n.getState().getNestedState(e, r).map((a, o) => ({
            item: a,
            originalIndex: o
          }));
          if (c === "getSelected")
            return () => {
              const t = n.getState().getSelectedIndex(e, r.join("."));
              if (t !== void 0)
                return s(
                  v[t],
                  [...r, t.toString()],
                  f
                );
            };
          if (c === "clearSelected")
            return () => {
              n.getState().clearSelectedIndex({ stateKey: e, path: r });
            };
          if (c === "getSelectedIndex")
            return () => n.getState().getSelectedIndex(e, r.join(".")) ?? -1;
          if (c === "stateSort")
            return (t) => {
              const o = [...d()].sort(
                (u, V) => t(u.item, V.item)
              ), l = o.map(({ item: u }) => u), h = {
                ...f,
                validIndices: o.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(l, r, h);
            };
          if (c === "stateFilter")
            return (t) => {
              const o = d().filter(
                ({ item: u }, V) => t(u, V)
              ), l = o.map(({ item: u }) => u), h = {
                ...f,
                validIndices: o.map(
                  ({ originalIndex: u }) => u
                )
              };
              return s(l, r, h);
            };
          if (c === "stateMap")
            return (t) => v.map((o, l) => {
              let h;
              f?.validIndices && f.validIndices[l] !== void 0 ? h = f.validIndices[l] : h = l;
              const u = [...r, h.toString()], V = s(o, u, f), w = `${S}-${r.join(".")}-${h}`, k = t(o, V, l);
              return /* @__PURE__ */ ee(
                Le,
                {
                  stateKey: e,
                  itemComponentId: w,
                  itemPath: u,
                  children: k
                },
                h
              );
            });
          if (c === "stateMapNoRender")
            return (t) => v.map((o, l) => {
              let h;
              f?.validIndices && f.validIndices[l] !== void 0 ? h = f.validIndices[l] : h = l;
              const u = [...r, h.toString()], V = s(o, u, f);
              return t(
                o,
                V,
                l,
                v,
                s(v, r, f)
              );
            });
          if (c === "$stateMap")
            return (t) => oe(We, {
              proxy: {
                _stateKey: e,
                _path: r,
                _mapFn: t
                // Pass the actual function, not string
              },
              rebuildStateShape: s
            });
          if (c === "stateFlattenOn")
            return (t) => {
              const a = v;
              m.clear(), E++;
              const o = a.flatMap(
                (l) => l[t] ?? []
              );
              return s(
                o,
                [...r, "[*]", t],
                f
              );
            };
          if (c === "index")
            return (t) => {
              const a = v[t];
              return s(a, [...r, t.toString()]);
            };
          if (c === "last")
            return () => {
              const t = n.getState().getNestedState(e, r);
              if (t.length === 0) return;
              const a = t.length - 1, o = t[a], l = [...r, a.toString()];
              return s(o, l);
            };
          if (c === "insert")
            return (t) => (p(r), le(i, t, r, e), s(
              n.getState().getNestedState(e, r),
              r
            ));
          if (c === "uniqueInsert")
            return (t, a, o) => {
              const l = n.getState().getNestedState(e, r), h = B(t) ? t(l) : t;
              let u = null;
              if (!l.some((w) => {
                if (a) {
                  const x = a.every(
                    (A) => W(w[A], h[A])
                  );
                  return x && (u = w), x;
                }
                const k = W(w, h);
                return k && (u = w), k;
              }))
                p(r), le(i, h, r, e);
              else if (o && u) {
                const w = o(u), k = l.map(
                  (x) => W(x, u) ? w : x
                );
                p(r), X(i, k, r);
              }
            };
          if (c === "cut")
            return (t, a) => {
              if (!a?.waitForSync)
                return p(r), K(i, r, e, t), s(
                  n.getState().getNestedState(e, r),
                  r
                );
            };
          if (c === "cutByValue")
            return (t) => {
              for (let a = 0; a < v.length; a++)
                v[a] === t && K(i, r, e, a);
            };
          if (c === "toggleByValue")
            return (t) => {
              const a = v.findIndex((o) => o === t);
              a > -1 ? K(i, r, e, a) : le(i, t, r, e);
            };
          if (c === "stateFind")
            return (t) => {
              const o = d().find(
                ({ item: h }, u) => t(h, u)
              );
              if (!o) return;
              const l = [...r, o.originalIndex.toString()];
              return s(o.item, l, f);
            };
          if (c === "findWith")
            return (t, a) => {
              const l = d().find(
                ({ item: u }) => u[t] === a
              );
              if (!l) return;
              const h = [...r, l.originalIndex.toString()];
              return s(l.item, h, f);
            };
        }
        const z = r[r.length - 1];
        if (!isNaN(Number(z))) {
          const d = r.slice(0, -1), t = n.getState().getNestedState(e, d);
          if (Array.isArray(t) && c === "cut")
            return () => K(
              i,
              d,
              e,
              Number(z)
            );
        }
        if (c === "get")
          return () => n.getState().getNestedState(e, r);
        if (c === "$derive")
          return (d) => he({
            _stateKey: e,
            _path: r,
            _effect: d.toString()
          });
        if (c === "$get")
          return () => he({
            _stateKey: e,
            _path: r
          });
        if (c === "lastSynced") {
          const d = `${e}:${r.join(".")}`;
          return n.getState().getSyncInfo(d);
        }
        if (c == "getLocalStorage")
          return (d) => ie(g + "-" + e + "-" + d);
        if (c === "_selected") {
          const d = r.slice(0, -1), t = d.join("."), a = n.getState().getNestedState(e, d);
          return Array.isArray(a) ? Number(r[r.length - 1]) === n.getState().getSelectedIndex(e, t) : void 0;
        }
        if (c === "setSelected")
          return (d) => {
            const t = r.slice(0, -1), a = Number(r[r.length - 1]), o = t.join(".");
            d ? n.getState().setSelectedIndex(e, o, a) : n.getState().setSelectedIndex(e, o, void 0);
            const l = n.getState().getNestedState(e, [...t]);
            X(i, l, t), p(t);
          };
        if (c === "toggleSelected")
          return () => {
            const d = r.slice(0, -1), t = Number(r[r.length - 1]), a = d.join("."), o = n.getState().getSelectedIndex(e, a);
            n.getState().setSelectedIndex(
              e,
              a,
              o === t ? void 0 : t
            );
            const l = n.getState().getNestedState(e, [...d]);
            X(i, l, d), p(d);
          };
        if (r.length == 0) {
          if (c === "applyJsonPatch")
            return (d) => {
              const t = n.getState().cogsStateStore[e], o = xe(t, d).newDocument;
              $e(
                e,
                n.getState().initialStateGlobal[e],
                o,
                i,
                S,
                g
              );
              const l = n.getState().stateComponents.get(e);
              if (l) {
                const h = ue(t, o), u = new Set(h);
                for (const [
                  V,
                  w
                ] of l.components.entries()) {
                  let k = !1;
                  const x = Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"];
                  if (!x.includes("none")) {
                    if (x.includes("all")) {
                      w.forceUpdate();
                      continue;
                    }
                    if (x.includes("component") && (w.paths.has("") && (k = !0), !k))
                      for (const A of u) {
                        if (w.paths.has(A)) {
                          k = !0;
                          break;
                        }
                        let M = A.lastIndexOf(".");
                        for (; M !== -1; ) {
                          const q = A.substring(0, M);
                          if (w.paths.has(q)) {
                            k = !0;
                            break;
                          }
                          const j = A.substring(
                            M + 1
                          );
                          if (!isNaN(Number(j))) {
                            const T = q.lastIndexOf(".");
                            if (T !== -1) {
                              const P = q.substring(
                                0,
                                T
                              );
                              if (w.paths.has(P)) {
                                k = !0;
                                break;
                              }
                            }
                          }
                          M = q.lastIndexOf(".");
                        }
                        if (k) break;
                      }
                    if (!k && x.includes("deps") && w.depsFunction) {
                      const A = w.depsFunction(o);
                      let M = !1;
                      typeof A == "boolean" ? A && (M = !0) : W(w.deps, A) || (w.deps = A, M = !0), M && (k = !0);
                    }
                    k && w.forceUpdate();
                  }
                }
              }
            };
          if (c === "validateZodSchema")
            return () => {
              const d = n.getState().getInitialOptions(e)?.validation, t = n.getState().addValidationError;
              if (!d?.zodSchema)
                throw new Error("Zod schema not found");
              if (!d?.key)
                throw new Error("Validation key not found");
              J(d.key);
              const a = n.getState().cogsStateStore[e];
              try {
                const o = n.getState().getValidationErrors(d.key);
                o && o.length > 0 && o.forEach(([h]) => {
                  h && h.startsWith(d.key) && J(h);
                });
                const l = d.zodSchema.safeParse(a);
                return l.success ? !0 : (l.error.errors.forEach((u) => {
                  const V = u.path, w = u.message, k = [d.key, ...V].join(".");
                  t(k, w);
                }), se(e), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (c === "_componentId") return S;
          if (c === "getComponents")
            return () => n().stateComponents.get(e);
          if (c === "getAllFormRefs")
            return () => me.getState().getFormRefsByStateKey(e);
          if (c === "_initialState")
            return n.getState().initialStateGlobal[e];
          if (c === "_serverState")
            return n.getState().serverState[e];
          if (c === "_isLoading")
            return n.getState().isLoadingGlobal[e];
          if (c === "revertToInitialState")
            return I.revertToInitialState;
          if (c === "updateInitialState") return I.updateInitialState;
          if (c === "removeValidation") return I.removeValidation;
        }
        if (c === "getFormRef")
          return () => me.getState().getFormRef(e + "." + r.join("."));
        if (c === "validationWrapper")
          return ({
            children: d,
            hideMessage: t
          }) => /* @__PURE__ */ ee(
            Ce,
            {
              formOpts: t ? { validation: { message: "" } } : void 0,
              path: r,
              validationKey: n.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: f?.validIndices,
              children: d
            }
          );
        if (c === "_stateKey") return e;
        if (c === "_path") return r;
        if (c === "_isServerSynced") return I._isServerSynced;
        if (c === "update")
          return (d, t) => {
            if (t?.debounce)
              be(() => {
                X(i, d, r, "");
                const a = n.getState().getNestedState(e, r);
                t?.afterUpdate && t.afterUpdate(a);
              }, t.debounce);
            else {
              X(i, d, r, "");
              const a = n.getState().getNestedState(e, r);
              t?.afterUpdate && t.afterUpdate(a);
            }
            p(r);
          };
        if (c === "formElement")
          return (d, t) => /* @__PURE__ */ ee(
            Pe,
            {
              setState: i,
              stateKey: e,
              path: r,
              child: d,
              formOpts: t
            }
          );
        const N = [...r, c], Y = n.getState().getNestedState(e, N);
        return s(Y, N, f);
      }
    }, U = new Proxy(b, C);
    return m.set(R, {
      proxy: U,
      stateVersion: E
    }), U;
  }
  return s(
    n.getState().getNestedState(e, [])
  );
}
function he(e) {
  return oe(Ge, { proxy: e });
}
function We({
  proxy: e,
  rebuildStateShape: i
}) {
  const S = n().getNestedState(e._stateKey, e._path);
  return Array.isArray(S) ? i(
    S,
    e._path
  ).stateMapNoRender(
    (m, E, p, I, s) => e._mapFn(m, E, p, I, s)
  ) : null;
}
function Ge({
  proxy: e
}) {
  const i = te(null), S = `${e._stateKey}-${e._path.join(".")}`;
  return de(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const m = g.parentElement, p = Array.from(m.childNodes).indexOf(g);
    let I = m.getAttribute("data-parent-id");
    I || (I = `parent-${crypto.randomUUID()}`, m.setAttribute("data-parent-id", I));
    const v = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: I,
      position: p,
      effect: e._effect
    };
    n.getState().addSignalElement(S, v);
    const r = n.getState().getNestedState(e._stateKey, e._path);
    let f;
    if (e._effect)
      try {
        f = new Function(
          "state",
          `return (${e._effect})(state)`
        )(r);
      } catch (b) {
        console.error("Error evaluating effect function during mount:", b), f = r;
      }
    else
      f = r;
    f !== null && typeof f == "object" && (f = JSON.stringify(f));
    const R = document.createTextNode(String(f));
    g.replaceWith(R);
  }, [e._stateKey, e._path.join("."), e._effect]), oe("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function rt(e) {
  const i = Ve(
    (S) => {
      const g = n.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(e._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => g.components.delete(e._stateKey);
    },
    () => n.getState().getNestedState(e._stateKey, e._path)
  );
  return oe("text", {}, String(i));
}
function Le({
  stateKey: e,
  itemComponentId: i,
  itemPath: S,
  children: g
}) {
  const [, m] = ne({});
  return pe(() => {
    const E = `${e}////${i}`, p = n.getState().stateComponents.get(e) || {
      components: /* @__PURE__ */ new Map()
    };
    return p.components.set(E, {
      forceUpdate: () => m({}),
      paths: /* @__PURE__ */ new Set([S.join(".")])
      // ATOMIC: Subscribes only to this item's path.
    }), n.getState().stateComponents.set(e, p), () => {
      const I = n.getState().stateComponents.get(e);
      I && I.components.delete(E);
    };
  }, [e, i, S.join(".")]), /* @__PURE__ */ ee(ke, { children: g });
}
export {
  he as $cogsSignal,
  rt as $cogsSignalStore,
  et as addStateOptions,
  tt as createCogsState,
  nt as notifyComponent,
  De as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
