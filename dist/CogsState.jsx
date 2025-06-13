"use client";
import { jsx as Se } from "react/jsx-runtime";
import { useState as le, useRef as X, useEffect as de, useLayoutEffect as he, useMemo as $e, createElement as ee, useSyncExternalStore as Te, startTransition as ke } from "react";
import { transformStateFunc as Ne, isDeepEqual as M, isFunction as q, getNestedValue as U, getDifferences as we, debounce as Ve } from "./utility.js";
import { pushFunc as se, updateFn as Z, cutFunc as Y, ValidationWrapper as xe, FormControlComponent as Ae } from "./Functions.jsx";
import Ce from "superjson";
import { v4 as ue } from "uuid";
import "zod";
import { getGlobalStore as r, formRefStore as me } from "./store.js";
import { useCogsConfig as Ee } from "./CogsStateClient.jsx";
function ye(e, c) {
  const m = r.getState().getInitialOptions, u = r.getState().setInitialStateOptions, f = m(e) || {};
  u(e, {
    ...f,
    ...c
  });
}
function ve({
  stateKey: e,
  options: c,
  initialOptionsPart: m
}) {
  const u = B(e) || {}, f = m[e] || {}, h = r.getState().setInitialStateOptions, v = { ...f, ...u };
  let y = !1;
  if (c)
    for (const i in c)
      v.hasOwnProperty(i) ? (i == "localStorage" && c[i] && v[i].key !== c[i]?.key && (y = !0, v[i] = c[i]), i == "initialState" && c[i] && v[i] !== c[i] && // Different references
      !M(v[i], c[i]) && (y = !0, v[i] = c[i])) : (y = !0, v[i] = c[i]);
  y && h(e, v);
}
function Ye(e, { formElements: c, validation: m }) {
  return { initialState: e, formElements: c, validation: m };
}
const Xe = (e, c) => {
  let m = e;
  const [u, f] = Ne(m);
  (Object.keys(f).length > 0 || c && Object.keys(c).length > 0) && Object.keys(f).forEach((y) => {
    f[y] = f[y] || {}, f[y].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...f[y].formElements || {}
      // State-specific overrides
    }, B(y) || r.getState().setInitialStateOptions(y, f[y]);
  }), r.getState().setInitialStates(u), r.getState().setCreatedState(u);
  const h = (y, i) => {
    const [S] = le(i?.componentId ?? ue());
    ve({
      stateKey: y,
      options: i,
      initialOptionsPart: f
    });
    const t = r.getState().cogsStateStore[y] || u[y], I = i?.modifyState ? i.modifyState(t) : t, [O, k] = Ue(
      I,
      {
        stateKey: y,
        syncUpdate: i?.syncUpdate,
        componentId: S,
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
    return k;
  };
  function v(y, i) {
    ve({ stateKey: y, options: i, initialOptionsPart: f }), i.localStorage && je(y, i), ne(y);
  }
  return { useCogsState: h, setCogsOptions: v };
}, {
  setUpdaterState: Q,
  setState: z,
  getInitialOptions: B,
  getKeyState: _e,
  getValidationErrors: be,
  setStateLog: Pe,
  updateInitialStateGlobal: ge,
  addValidationError: Fe,
  removeValidationError: W,
  setServerSyncActions: Oe
} = r.getState(), Ie = (e, c, m, u, f) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    u
  );
  const h = q(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (h && u) {
    const v = `${u}-${c}-${h}`;
    let y;
    try {
      y = te(v)?.lastSyncedWithServer;
    } catch {
    }
    const i = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: f ?? y
    }, S = Ce.serialize(i);
    window.localStorage.setItem(
      v,
      JSON.stringify(S.json)
    );
  }
}, te = (e) => {
  if (!e) return null;
  try {
    const c = window.localStorage.getItem(e);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, je = (e, c) => {
  const m = r.getState().cogsStateStore[e], { sessionId: u } = Ee(), f = q(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (f && u) {
    const h = te(
      `${u}-${e}-${f}`
    );
    if (h && h.lastUpdated > (h.lastSyncedWithServer || 0))
      return z(e, h.state), ne(e), !0;
  }
  return !1;
}, pe = (e, c, m, u, f, h) => {
  const v = {
    initialState: c,
    updaterState: K(
      e,
      u,
      f,
      h
    ),
    state: m
  };
  ge(e, v.initialState), Q(e, v.updaterState), z(e, v.state);
}, ne = (e) => {
  const c = r.getState().stateComponents.get(e);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || m.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((u) => u());
  });
}, Qe = (e, c) => {
  const m = r.getState().stateComponents.get(e);
  if (m) {
    const u = `${e}////${c}`, f = m.components.get(u);
    if ((f ? Array.isArray(f.reactiveType) ? f.reactiveType : [f.reactiveType || "component"] : null)?.includes("none"))
      return;
    f && f.forceUpdate();
  }
}, Re = (e, c, m, u) => {
  switch (e) {
    case "update":
      return {
        oldValue: U(c, u),
        newValue: U(m, u)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: U(m, u)
      };
    case "cut":
      return {
        oldValue: U(c, u),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Ue(e, {
  stateKey: c,
  serverSync: m,
  localStorage: u,
  formElements: f,
  reactiveDeps: h,
  reactiveType: v,
  componentId: y,
  initialState: i,
  syncUpdate: S,
  dependencies: t,
  serverState: I
} = {}) {
  const [O, k] = le({}), { sessionId: N } = Ee();
  let j = !c;
  const [g] = le(c ?? ue()), l = r.getState().stateLog[g], J = X(/* @__PURE__ */ new Set()), G = X(y ?? ue()), V = X(
    null
  );
  V.current = B(g) ?? null, de(() => {
    if (S && S.stateKey === g && S.path?.[0]) {
      z(g, (a) => ({
        ...a,
        [S.path[0]]: S.newValue
      }));
      const s = `${S.stateKey}:${S.path.join(".")}`;
      r.getState().setSyncInfo(s, {
        timeStamp: S.timeStamp,
        userId: S.userId
      });
    }
  }, [S]), de(() => {
    if (i) {
      ye(g, {
        initialState: i
      });
      const s = V.current, d = s?.serverState?.id !== void 0 && s?.serverState?.status === "success" && s?.serverState?.data, w = r.getState().initialStateGlobal[g];
      if (!(w && !M(w, i) || !w) && !d)
        return;
      let E = null;
      const b = q(s?.localStorage?.key) ? s?.localStorage?.key(i) : s?.localStorage?.key;
      b && N && (E = te(`${N}-${g}-${b}`));
      let T = i, L = !1;
      const re = d ? Date.now() : 0, H = E?.lastUpdated || 0, ae = E?.lastSyncedWithServer || 0;
      d && re > H ? (T = s.serverState.data, L = !0) : E && H > ae && (T = E.state, s?.localStorage?.onChange && s?.localStorage?.onChange(T)), pe(
        g,
        i,
        T,
        n,
        G.current,
        N
      ), L && b && N && Ie(T, g, s, N, Date.now()), ne(g), (Array.isArray(v) ? v : [v || "component"]).includes("none") || k({});
    }
  }, [
    i,
    I?.status,
    I?.data,
    ...t || []
  ]), he(() => {
    j && ye(g, {
      serverSync: m,
      formElements: f,
      initialState: i,
      localStorage: u,
      middleware: V.current?.middleware
    });
    const s = `${g}////${G.current}`, a = r.getState().stateComponents.get(g) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(s, {
      forceUpdate: () => k({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: h || void 0,
      reactiveType: v ?? ["component", "deps"]
    }), r.getState().stateComponents.set(g, a), k({}), () => {
      const d = `${g}////${G.current}`;
      a && (a.components.delete(d), a.components.size === 0 && r.getState().stateComponents.delete(g));
    };
  }, []);
  const n = (s, a, d, w) => {
    if (Array.isArray(a)) {
      const x = `${g}-${a.join(".")}`;
      J.current.add(x);
    }
    z(g, (x) => {
      const E = q(s) ? s(x) : s, b = `${g}-${a.join(".")}`;
      if (b) {
        let R = !1, $ = r.getState().signalDomElements.get(b);
        if ((!$ || $.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const P = a.slice(0, -1), p = U(E, P);
          if (Array.isArray(p)) {
            R = !0;
            const _ = `${g}-${P.join(".")}`;
            $ = r.getState().signalDomElements.get(_);
          }
        }
        if ($) {
          const P = R ? U(E, a.slice(0, -1)) : U(E, a);
          $.forEach(({ parentId: p, position: _, effect: C }) => {
            const A = document.querySelector(
              `[data-parent-id="${p}"]`
            );
            if (A) {
              const D = Array.from(A.childNodes);
              if (D[_]) {
                const F = C ? new Function("state", `return (${C})(state)`)(P) : P;
                D[_].textContent = String(F);
              }
            }
          });
        }
      }
      d.updateType === "update" && (w || V.current?.validation?.key) && a && W(
        (w || V.current?.validation?.key) + "." + a.join(".")
      );
      const T = a.slice(0, a.length - 1);
      d.updateType === "cut" && V.current?.validation?.key && W(
        V.current?.validation?.key + "." + T.join(".")
      ), d.updateType === "insert" && V.current?.validation?.key && be(
        V.current?.validation?.key + "." + T.join(".")
      ).filter(([$, P]) => {
        let p = $?.split(".").length;
        if ($ == T.join(".") && p == T.length - 1) {
          let _ = $ + "." + T;
          W($), Fe(_, P);
        }
      });
      const L = r.getState().stateComponents.get(g);
      if (L) {
        const R = we(x, E), $ = new Set(R), P = d.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          p,
          _
        ] of L.components.entries()) {
          let C = !1;
          const A = Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"];
          if (!A.includes("none")) {
            if (A.includes("all")) {
              _.forceUpdate();
              continue;
            }
            if (A.includes("component") && ((_.paths.has(P) || _.paths.has("")) && (C = !0), !C))
              for (const D of $) {
                let F = D;
                for (; ; ) {
                  if (_.paths.has(F)) {
                    C = !0;
                    break;
                  }
                  const ie = F.lastIndexOf(".");
                  if (ie !== -1) {
                    const fe = F.substring(
                      0,
                      ie
                    );
                    if (!isNaN(
                      Number(F.substring(ie + 1))
                    ) && _.paths.has(fe)) {
                      C = !0;
                      break;
                    }
                    F = fe;
                  } else
                    F = "";
                  if (F === "")
                    break;
                }
                if (C) break;
              }
            if (!C && A.includes("deps") && _.depsFunction) {
              const D = _.depsFunction(E);
              let F = !1;
              typeof D == "boolean" ? D && (F = !0) : M(_.deps, D) || (_.deps = D, F = !0), F && (C = !0);
            }
            C && _.forceUpdate();
          }
        }
      }
      const re = Date.now();
      a = a.map((R, $) => {
        const P = a.slice(0, -1), p = U(E, P);
        return $ === a.length - 1 && ["insert", "cut"].includes(d.updateType) ? (p.length - 1).toString() : R;
      }), console.log(
        "mmmmmmmmmmmmmmmmm22222222222222",
        d.updateType,
        x,
        E,
        a
      );
      const { oldValue: H, newValue: ae } = Re(
        d.updateType,
        x,
        E,
        a
      ), oe = {
        timeStamp: re,
        stateKey: g,
        path: a,
        updateType: d.updateType,
        status: "new",
        oldValue: H,
        newValue: ae
      };
      if (Pe(g, (R) => {
        const P = [...R ?? [], oe].reduce((p, _) => {
          const C = `${_.stateKey}:${JSON.stringify(_.path)}`, A = p.get(C);
          return A ? (A.timeStamp = Math.max(A.timeStamp, _.timeStamp), A.newValue = _.newValue, A.oldValue = A.oldValue ?? _.oldValue, A.updateType = _.updateType) : p.set(C, { ..._ }), p;
        }, /* @__PURE__ */ new Map());
        return Array.from(P.values());
      }), Ie(
        E,
        g,
        V.current,
        N
      ), V.current?.middleware && V.current.middleware({
        updateLog: l,
        update: oe
      }), V.current?.serverSync) {
        const R = r.getState().serverState[g], $ = V.current?.serverSync;
        Oe(g, {
          syncKey: typeof $.syncKey == "string" ? $.syncKey : $.syncKey({ state: E }),
          rollBackState: R,
          actionTimeStamp: Date.now() + ($.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  r.getState().updaterState[g] || (Q(
    g,
    K(
      g,
      n,
      G.current,
      N
    )
  ), r.getState().cogsStateStore[g] || z(g, e), r.getState().initialStateGlobal[g] || ge(g, e));
  const o = $e(() => K(
    g,
    n,
    G.current,
    N
  ), [g]);
  return [_e(g), o];
}
function K(e, c, m, u) {
  const f = /* @__PURE__ */ new Map();
  let h = 0;
  const v = (S) => {
    const t = S.join(".");
    for (const [I] of f)
      (I === t || I.startsWith(t + ".")) && f.delete(I);
    h++;
  }, y = {
    removeValidation: (S) => {
      S?.validationKey && W(S.validationKey);
    },
    revertToInitialState: (S) => {
      const t = r.getState().getInitialOptions(e)?.validation;
      t?.key && W(t?.key), S?.validationKey && W(S.validationKey);
      const I = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), f.clear(), h++;
      const O = i(I, []), k = B(e), N = q(k?.localStorage?.key) ? k?.localStorage?.key(I) : k?.localStorage?.key, j = `${u}-${e}-${N}`;
      j && localStorage.removeItem(j), Q(e, O), z(e, I);
      const g = r.getState().stateComponents.get(e);
      return g && g.components.forEach((l) => {
        l.forceUpdate();
      }), I;
    },
    updateInitialState: (S) => {
      f.clear(), h++;
      const t = K(
        e,
        c,
        m,
        u
      ), I = r.getState().initialStateGlobal[e], O = B(e), k = q(O?.localStorage?.key) ? O?.localStorage?.key(I) : O?.localStorage?.key, N = `${u}-${e}-${k}`;
      return console.log("removing storage", N), localStorage.getItem(N) && localStorage.removeItem(N), ke(() => {
        ge(e, S), Q(e, t), z(e, S);
        const j = r.getState().stateComponents.get(e);
        j && j.components.forEach((g) => {
          g.forceUpdate();
        });
      }), {
        fetchId: (j) => t.get()[j]
      };
    },
    _initialState: r.getState().initialStateGlobal[e],
    _serverState: r.getState().serverState[e],
    _isLoading: r.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const S = r.getState().serverState[e];
      return !!(S && M(S, _e(e)));
    }
  };
  function i(S, t = [], I) {
    const O = t.map(String).join(".");
    f.get(O);
    const k = function() {
      return r().getNestedState(e, t);
    };
    Object.keys(y).forEach((g) => {
      k[g] = y[g];
    });
    const N = {
      apply(g, l, J) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, t);
      },
      get(g, l) {
        if (l !== "then" && !l.startsWith("$") && l !== "stateMapNoRender") {
          const n = t.join("."), o = `${e}////${m}`, s = r.getState().stateComponents.get(e);
          if (s) {
            const a = s.components.get(o);
            a && (t.length > 0 || l === "get") && a.paths.add(n);
          }
        }
        if (l === "getDifferences")
          return () => we(
            r.getState().cogsStateStore[e],
            r.getState().initialStateGlobal[e]
          );
        if (l === "sync" && t.length === 0)
          return async function() {
            const n = r.getState().getInitialOptions(e), o = n?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const s = r.getState().getNestedState(e, []), a = n?.validation?.key;
            try {
              const d = await o.action(s);
              if (d && !d.success && d.errors && a) {
                r.getState().removeValidationError(a), d.errors.forEach((x) => {
                  const E = [a, ...x.path].join(".");
                  r.getState().addValidationError(E, x.message);
                });
                const w = r.getState().stateComponents.get(e);
                w && w.components.forEach((x) => {
                  x.forceUpdate();
                });
              }
              return d?.success && o.onSuccess ? o.onSuccess(d.data) : !d?.success && o.onError && o.onError(d.error), d;
            } catch (d) {
              return o.onError && o.onError(d), { success: !1, error: d };
            }
          };
        if (l === "_status") {
          const n = r.getState().getNestedState(e, t), o = r.getState().initialStateGlobal[e], s = U(o, t);
          return M(n, s) ? "fresh" : "stale";
        }
        if (l === "getStatus")
          return function() {
            const n = r().getNestedState(
              e,
              t
            ), o = r.getState().initialStateGlobal[e], s = U(o, t);
            return M(n, s) ? "fresh" : "stale";
          };
        if (l === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[e], o = B(e), s = q(o?.localStorage?.key) ? o?.localStorage?.key(n) : o?.localStorage?.key, a = `${u}-${e}-${s}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (l === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(e)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(n.key + "." + t.join("."));
          };
        if (Array.isArray(S)) {
          if (l === "getSelected")
            return () => {
              const n = r.getState().getSelectedIndex(e, t.join("."));
              if (n !== void 0)
                return i(
                  S[n],
                  [...t, n.toString()],
                  I
                );
            };
          if (l === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: e, path: t });
            };
          if (l === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(e, t.join(".")) ?? -1;
          if (l === "stateSort")
            return (n) => {
              const a = [...S.map((d, w) => ({
                ...d,
                // If it's already filtered, preserve its original index. Otherwise, use its current position.
                __origIndex: d.__origIndex ?? w.toString()
              }))].sort(n);
              return i(a, t, {
                filtered: [...I?.filtered || [], t],
                validIndices: a.map(
                  (d) => parseInt(d.__origIndex)
                )
              });
            };
          if (l === "stateFilter")
            return (n) => {
              const s = S.filter(
                (a, d) => {
                  const w = {
                    ...a,
                    __origIndex: a.__origIndex ?? d.toString()
                  };
                  return n(w, d);
                }
              );
              return i(s, t, {
                filtered: [...I?.filtered || [], t],
                validIndices: s.map(
                  (a) => parseInt(a.__origIndex)
                )
              });
            };
          if (l === "stateMap" || l === "stateMapNoRender")
            return (n) => S.map((s, a) => {
              const d = s.__origIndex ?? a, w = i(
                s,
                [...t, d.toString()],
                I
                // Pass meta through
              );
              return n(
                s,
                w,
                a,
                S,
                i(S, t, I)
              );
            });
          if (l === "$stateMap")
            return (n) => ee(De, {
              proxy: {
                _stateKey: e,
                _path: t,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: i
            });
          if (l === "stateFlattenOn")
            return (n) => {
              const s = I?.filtered?.some(
                (d) => d.join(".") === t.join(".")
              ) ? S : r.getState().getNestedState(e, t);
              f.clear(), h++;
              const a = s.flatMap(
                (d, w) => d[n] ?? []
              );
              return i(
                a,
                [...t, "[*]", n],
                I
              );
            };
          if (l === "findWith")
            return (n, o) => {
              const s = S.findIndex((w) => w[n] === o);
              if (s === -1) return;
              const a = S[s], d = [...t, s.toString()];
              return f.clear(), h++, i(a, d);
            };
          if (l === "index")
            return (n) => {
              const o = S[n];
              return i(o, [...t, n.toString()]);
            };
          if (l === "last")
            return () => {
              const n = r.getState().getNestedState(e, t);
              if (n.length === 0) return;
              const o = n.length - 1, s = n[o], a = [...t, o.toString()];
              return i(s, a);
            };
          if (l === "insert")
            return (n) => (v(t), se(c, n, t, e), i(
              r.getState().getNestedState(e, t),
              t
            ));
          if (l === "uniqueInsert")
            return (n, o, s) => {
              const a = r.getState().getNestedState(e, t), d = q(n) ? n(a) : n;
              let w = null;
              if (!a.some((E) => {
                if (o) {
                  const T = o.every(
                    (L) => M(E[L], d[L])
                  );
                  return T && (w = E), T;
                }
                const b = M(E, d);
                return b && (w = E), b;
              }))
                v(t), se(c, d, t, e);
              else if (s && w) {
                const E = s(w), b = a.map(
                  (T) => M(T, w) ? E : T
                );
                v(t), Z(c, b, t);
              }
            };
          if (l === "cut")
            return (n, o) => {
              if (!o?.waitForSync)
                return v(t), Y(c, t, e, n), i(
                  r.getState().getNestedState(e, t),
                  t
                );
            };
          if (l === "cutByValue")
            return (n) => {
              for (let o = 0; o < S.length; o++)
                S[o] === n && Y(c, t, e, o);
            };
          if (l === "toggleByValue")
            return (n) => {
              const o = S.findIndex((s) => s === n);
              o > -1 ? Y(c, t, e, o) : se(c, n, t, e);
            };
          if (l === "stateFind")
            return (n) => {
              const o = r.getState().getNestedState(e, t), s = o.findIndex(n);
              if (s === -1)
                return;
              const a = o[s], d = [...t, s.toString()];
              return i(a, d);
            };
        }
        const J = t[t.length - 1];
        if (!isNaN(Number(J))) {
          const n = t.slice(0, -1), o = r.getState().getNestedState(e, n);
          if (Array.isArray(o) && l === "cut")
            return () => Y(
              c,
              n,
              e,
              Number(J)
            );
        }
        if (l === "get")
          return () => r.getState().getNestedState(e, t);
        if (l === "$derive")
          return (n) => ce({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (l === "$derive")
          return (n) => ce({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (l === "$get")
          return () => ce({
            _stateKey: e,
            _path: t
          });
        if (l === "lastSynced") {
          const n = `${e}:${t.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (l == "getLocalStorage")
          return (n) => te(u + "-" + e + "-" + n);
        if (l === "_selected") {
          const n = t.slice(0, -1), o = n.join("."), s = r.getState().getNestedState(e, n);
          return Array.isArray(s) ? Number(t[t.length - 1]) === r.getState().getSelectedIndex(e, o) : void 0;
        }
        if (l === "setSelected")
          return (n) => {
            const o = t.slice(0, -1), s = Number(t[t.length - 1]), a = o.join(".");
            n ? r.getState().setSelectedIndex(e, a, s) : r.getState().setSelectedIndex(e, a, void 0);
            const d = r.getState().getNestedState(e, [...o]);
            Z(c, d, o), v(o);
          };
        if (l === "toggleSelected")
          return () => {
            const n = t.slice(0, -1), o = Number(t[t.length - 1]), s = n.join("."), a = r.getState().getSelectedIndex(e, s);
            r.getState().setSelectedIndex(
              e,
              s,
              a === o ? void 0 : o
            );
            const d = r.getState().getNestedState(e, [...n]);
            Z(c, d, n), v(n);
          };
        if (t.length == 0) {
          if (l === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(e)?.validation, o = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              W(n.key);
              const s = r.getState().cogsStateStore[e];
              try {
                const a = r.getState().getValidationErrors(n.key);
                a && a.length > 0 && a.forEach(([w]) => {
                  w && w.startsWith(n.key) && W(w);
                });
                const d = n.zodSchema.safeParse(s);
                return d.success ? !0 : (d.error.errors.forEach((x) => {
                  const E = x.path, b = x.message, T = [n.key, ...E].join(".");
                  o(T, b);
                }), ne(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (l === "_componentId") return m;
          if (l === "getComponents")
            return () => r().stateComponents.get(e);
          if (l === "getAllFormRefs")
            return () => me.getState().getFormRefsByStateKey(e);
          if (l === "_initialState")
            return r.getState().initialStateGlobal[e];
          if (l === "_serverState")
            return r.getState().serverState[e];
          if (l === "_isLoading")
            return r.getState().isLoadingGlobal[e];
          if (l === "revertToInitialState")
            return y.revertToInitialState;
          if (l === "updateInitialState") return y.updateInitialState;
          if (l === "removeValidation") return y.removeValidation;
        }
        if (l === "getFormRef")
          return () => me.getState().getFormRef(e + "." + t.join("."));
        if (l === "validationWrapper")
          return ({
            children: n,
            hideMessage: o
          }) => /* @__PURE__ */ Se(
            xe,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: t,
              validationKey: r.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: I?.validIndices,
              children: n
            }
          );
        if (l === "_stateKey") return e;
        if (l === "_path") return t;
        if (l === "_isServerSynced") return y._isServerSynced;
        if (l === "update")
          return (n, o) => {
            if (o?.debounce)
              Ve(() => {
                Z(c, n, t, "");
                const s = r.getState().getNestedState(e, t);
                o?.afterUpdate && o.afterUpdate(s);
              }, o.debounce);
            else {
              Z(c, n, t, "");
              const s = r.getState().getNestedState(e, t);
              o?.afterUpdate && o.afterUpdate(s);
            }
            v(t);
          };
        if (l === "formElement")
          return (n, o) => /* @__PURE__ */ Se(
            Ae,
            {
              setState: c,
              stateKey: e,
              path: t,
              child: n,
              formOpts: o
            }
          );
        const G = [...t, l], V = r.getState().getNestedState(e, G);
        return i(V, G, I);
      }
    }, j = new Proxy(k, N);
    return f.set(O, {
      proxy: j,
      stateVersion: h
    }), j;
  }
  return i(
    r.getState().getNestedState(e, [])
  );
}
function ce(e) {
  return ee(Me, { proxy: e });
}
function De({
  proxy: e,
  rebuildStateShape: c
}) {
  const m = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(m) ? c(
    m,
    e._path
  ).stateMapNoRender(
    (f, h, v, y, i) => e._mapFn(f, h, v, y, i)
  ) : null;
}
function Me({
  proxy: e
}) {
  const c = X(null), m = `${e._stateKey}-${e._path.join(".")}`;
  return de(() => {
    const u = c.current;
    if (!u || !u.parentElement) return;
    const f = u.parentElement, v = Array.from(f.childNodes).indexOf(u);
    let y = f.getAttribute("data-parent-id");
    y || (y = `parent-${crypto.randomUUID()}`, f.setAttribute("data-parent-id", y));
    const S = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: y,
      position: v,
      effect: e._effect
    };
    r.getState().addSignalElement(m, S);
    const t = r.getState().getNestedState(e._stateKey, e._path);
    let I;
    if (e._effect)
      try {
        I = new Function(
          "state",
          `return (${e._effect})(state)`
        )(t);
      } catch (k) {
        console.error("Error evaluating effect function during mount:", k), I = t;
      }
    else
      I = t;
    I !== null && typeof I == "object" && (I = JSON.stringify(I));
    const O = document.createTextNode(String(I));
    u.replaceWith(O);
  }, [e._stateKey, e._path.join("."), e._effect]), ee("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function Ke(e) {
  const c = Te(
    (m) => {
      const u = r.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(e._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => u.components.delete(e._stateKey);
    },
    () => r.getState().getNestedState(e._stateKey, e._path)
  );
  return ee("text", {}, String(c));
}
export {
  ce as $cogsSignal,
  Ke as $cogsSignalStore,
  Ye as addStateOptions,
  Xe as createCogsState,
  Qe as notifyComponent,
  Ue as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
