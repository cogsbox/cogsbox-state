"use client";
import { jsx as me } from "react/jsx-runtime";
import { useState as de, useRef as Q, useEffect as ue, useLayoutEffect as Ne, useMemo as he, createElement as te, useSyncExternalStore as ke, startTransition as Ve } from "react";
import { transformStateFunc as Ae, isDeepEqual as G, isFunction as L, getNestedValue as D, getDifferences as _e, debounce as xe } from "./utility.js";
import { pushFunc as ce, updateFn as Z, cutFunc as X, ValidationWrapper as Te, FormControlComponent as Ce } from "./Functions.jsx";
import be from "superjson";
import { v4 as ge } from "uuid";
import "zod";
import { getGlobalStore as a, formRefStore as ye } from "./store.js";
import { useCogsConfig as $e } from "./CogsStateClient.jsx";
function ve(e, c) {
  const S = a.getState().getInitialOptions, d = a.getState().setInitialStateOptions, u = S(e) || {};
  d(e, {
    ...u,
    ...c
  });
}
function Ie({
  stateKey: e,
  options: c,
  initialOptionsPart: S
}) {
  const d = z(e) || {}, u = S[e] || {}, I = a.getState().setInitialStateOptions, E = { ...u, ...d };
  let f = !1;
  if (c)
    for (const l in c)
      E.hasOwnProperty(l) ? (l == "localStorage" && c[l] && E[l].key !== c[l]?.key && (f = !0, E[l] = c[l]), l == "initialState" && c[l] && E[l] !== c[l] && // Different references
      !G(E[l], c[l]) && (f = !0, E[l] = c[l])) : (f = !0, E[l] = c[l]);
  f && I(e, E);
}
function Xe(e, { formElements: c, validation: S }) {
  return { initialState: e, formElements: c, validation: S };
}
const Qe = (e, c) => {
  let S = e;
  const [d, u] = Ae(S);
  (Object.keys(u).length > 0 || c && Object.keys(c).length > 0) && Object.keys(u).forEach((f) => {
    u[f] = u[f] || {}, u[f].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...u[f].formElements || {}
      // State-specific overrides
    }, z(f) || a.getState().setInitialStateOptions(f, u[f]);
  }), a.getState().setInitialStates(d), a.getState().setCreatedState(d);
  const I = (f, l) => {
    const [m] = de(l?.componentId ?? ge());
    Ie({
      stateKey: f,
      options: l,
      initialOptionsPart: u
    });
    const t = a.getState().cogsStateStore[f] || d[f], v = l?.modifyState ? l.modifyState(t) : t, [A, b] = Me(
      v,
      {
        stateKey: f,
        syncUpdate: l?.syncUpdate,
        componentId: m,
        localStorage: l?.localStorage,
        middleware: l?.middleware,
        enabledSync: l?.enabledSync,
        reactiveType: l?.reactiveType,
        reactiveDeps: l?.reactiveDeps,
        initialState: l?.initialState,
        dependencies: l?.dependencies,
        serverState: l?.serverState
      }
    );
    return b;
  };
  function E(f, l) {
    Ie({ stateKey: f, options: l, initialOptionsPart: u }), l.localStorage && Re(f, l), re(f);
  }
  return { useCogsState: I, setCogsOptions: E };
}, {
  setUpdaterState: K,
  setState: q,
  getInitialOptions: z,
  getKeyState: we,
  getValidationErrors: Pe,
  setStateLog: je,
  updateInitialStateGlobal: fe,
  addValidationError: Fe,
  removeValidationError: p,
  setServerSyncActions: Oe
} = a.getState(), Ee = (e, c, S, d, u) => {
  S?.log && console.log(
    "saving to localstorage",
    c,
    S.localStorage?.key,
    d
  );
  const I = L(S?.localStorage?.key) ? S.localStorage?.key(e) : S?.localStorage?.key;
  if (I && d) {
    const E = `${d}-${c}-${I}`;
    let f;
    try {
      f = ne(E)?.lastSyncedWithServer;
    } catch {
    }
    const l = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: u ?? f
    }, m = be.serialize(l);
    window.localStorage.setItem(
      E,
      JSON.stringify(m.json)
    );
  }
}, ne = (e) => {
  if (!e) return null;
  try {
    const c = window.localStorage.getItem(e);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, Re = (e, c) => {
  const S = a.getState().cogsStateStore[e], { sessionId: d } = $e(), u = L(c?.localStorage?.key) ? c.localStorage.key(S) : c?.localStorage?.key;
  if (u && d) {
    const I = ne(
      `${d}-${e}-${u}`
    );
    if (I && I.lastUpdated > (I.lastSyncedWithServer || 0))
      return q(e, I.state), re(e), !0;
  }
  return !1;
}, Ue = (e, c, S, d, u, I) => {
  const E = {
    initialState: c,
    updaterState: ee(
      e,
      d,
      u,
      I
    ),
    state: S
  };
  fe(e, E.initialState), K(e, E.updaterState), q(e, E.state);
}, re = (e) => {
  const c = a.getState().stateComponents.get(e);
  if (!c) return;
  const S = /* @__PURE__ */ new Set();
  c.components.forEach((d) => {
    (d ? Array.isArray(d.reactiveType) ? d.reactiveType : [d.reactiveType || "component"] : null)?.includes("none") || S.add(() => d.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((d) => d());
  });
}, Ke = (e, c) => {
  const S = a.getState().stateComponents.get(e);
  if (S) {
    const d = `${e}////${c}`, u = S.components.get(d);
    if ((u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none"))
      return;
    u && u.forceUpdate();
  }
}, De = (e, c, S, d) => {
  switch (e) {
    case "update":
      return {
        oldValue: D(c, d),
        newValue: D(S, d)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: D(S, d)
      };
    case "cut":
      return {
        oldValue: D(c, d),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function Me(e, {
  stateKey: c,
  serverSync: S,
  localStorage: d,
  formElements: u,
  middleware: I,
  reactiveDeps: E,
  reactiveType: f,
  componentId: l,
  initialState: m,
  syncUpdate: t,
  dependencies: v,
  serverState: A
} = {}) {
  const [b, O] = de({}), { sessionId: N } = $e();
  let R = !c;
  const [r] = de(c ?? ge()), B = a.getState().stateLog[r], H = Q(/* @__PURE__ */ new Set()), W = Q(l ?? ge()), n = Q(
    null
  );
  n.current = z(r) ?? null, ue(() => {
    if (t && t.stateKey === r && t.path?.[0]) {
      q(r, (i) => ({
        ...i,
        [t.path[0]]: t.newValue
      }));
      const s = `${t.stateKey}:${t.path.join(".")}`;
      a.getState().setSyncInfo(s, {
        timeStamp: t.timeStamp,
        userId: t.userId
      });
    }
  }, [t]), ue(() => {
    if (m) {
      ve(r, {
        initialState: m
      });
      const s = n.current, y = s?.serverState?.id !== void 0 && s?.serverState?.status === "success" && s?.serverState?.data, k = a.getState().initialStateGlobal[r];
      if (!(k && !G(k, m) || !k) && !y)
        return;
      let $ = null;
      const x = L(s?.localStorage?.key) ? s?.localStorage?.key(m) : s?.localStorage?.key;
      x && N && ($ = ne(`${N}-${r}-${x}`));
      let T = m, J = !1;
      const ae = y ? Date.now() : 0, Y = $?.lastUpdated || 0, oe = $?.lastSyncedWithServer || 0;
      y && ae > Y ? (T = s.serverState.data, J = !0) : $ && Y > oe && (T = $.state, s?.localStorage?.onChange && s?.localStorage?.onChange(T)), Ue(
        r,
        m,
        T,
        o,
        W.current,
        N
      ), J && x && N && Ee(T, r, s, N, Date.now()), re(r), (Array.isArray(f) ? f : [f || "component"]).includes("none") || O({});
    }
  }, [
    m,
    A?.status,
    A?.data,
    ...v || []
  ]), Ne(() => {
    R && ve(r, {
      serverSync: S,
      formElements: u,
      initialState: m,
      localStorage: d,
      middleware: I
    });
    const s = `${r}////${W.current}`, i = a.getState().stateComponents.get(r) || {
      components: /* @__PURE__ */ new Map()
    };
    return i.components.set(s, {
      forceUpdate: () => O({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0,
      reactiveType: f ?? ["component", "deps"]
    }), a.getState().stateComponents.set(r, i), O({}), () => {
      const y = `${r}////${W.current}`;
      i && (i.components.delete(y), i.components.size === 0 && a.getState().stateComponents.delete(r));
    };
  }, []);
  const o = (s, i, y, k) => {
    if (Array.isArray(i)) {
      const h = `${r}-${i.join(".")}`;
      H.current.add(h);
    }
    q(r, (h) => {
      const $ = L(s) ? s(h) : s, x = `${r}-${i.join(".")}`;
      if (x) {
        let U = !1, w = a.getState().signalDomElements.get(x);
        if ((!w || w.size === 0) && (y.updateType === "insert" || y.updateType === "cut")) {
          const P = i.slice(0, -1), F = D($, P);
          if (Array.isArray(F)) {
            U = !0;
            const _ = `${r}-${P.join(".")}`;
            w = a.getState().signalDomElements.get(_);
          }
        }
        if (w) {
          const P = U ? D($, i.slice(0, -1)) : D($, i);
          w.forEach(({ parentId: F, position: _, effect: C }) => {
            const V = document.querySelector(
              `[data-parent-id="${F}"]`
            );
            if (V) {
              const M = Array.from(V.childNodes);
              if (M[_]) {
                const j = C ? new Function("state", `return (${C})(state)`)(P) : P;
                M[_].textContent = String(j);
              }
            }
          });
        }
      }
      y.updateType === "update" && (k || n.current?.validation?.key) && i && p(
        (k || n.current?.validation?.key) + "." + i.join(".")
      );
      const T = i.slice(0, i.length - 1);
      y.updateType === "cut" && n.current?.validation?.key && p(
        n.current?.validation?.key + "." + T.join(".")
      ), y.updateType === "insert" && n.current?.validation?.key && Pe(
        n.current?.validation?.key + "." + T.join(".")
      ).filter(([w, P]) => {
        let F = w?.split(".").length;
        if (w == T.join(".") && F == T.length - 1) {
          let _ = w + "." + T;
          p(w), Fe(_, P);
        }
      });
      const J = a.getState().stateComponents.get(r);
      if (J) {
        const U = _e(h, $), w = new Set(U), P = y.updateType === "update" ? i.join(".") : i.slice(0, -1).join(".") || "";
        for (const [
          F,
          _
        ] of J.components.entries()) {
          let C = !1;
          const V = Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"];
          if (!V.includes("none")) {
            if (V.includes("all")) {
              _.forceUpdate();
              continue;
            }
            if (V.includes("component") && ((_.paths.has(P) || _.paths.has("")) && (C = !0), !C))
              for (const M of w) {
                let j = M;
                for (; ; ) {
                  if (_.paths.has(j)) {
                    C = !0;
                    break;
                  }
                  const se = j.lastIndexOf(".");
                  if (se !== -1) {
                    const Se = j.substring(
                      0,
                      se
                    );
                    if (!isNaN(
                      Number(j.substring(se + 1))
                    ) && _.paths.has(Se)) {
                      C = !0;
                      break;
                    }
                    j = Se;
                  } else
                    j = "";
                  if (j === "")
                    break;
                }
                if (C) break;
              }
            if (!C && V.includes("deps") && _.depsFunction) {
              const M = _.depsFunction($);
              let j = !1;
              typeof M == "boolean" ? M && (j = !0) : G(_.deps, M) || (_.deps = M, j = !0), j && (C = !0);
            }
            C && _.forceUpdate();
          }
        }
      }
      const ae = Date.now();
      i = i.map((U, w) => {
        const P = i.slice(0, -1), F = D($, P);
        return w === i.length - 1 && ["insert", "cut"].includes(y.updateType) ? (F.length - 1).toString() : U;
      }), console.log(
        "mmmmmmmmmmmmmmmmm22222222222222",
        y.updateType,
        h,
        $,
        i
      );
      const { oldValue: Y, newValue: oe } = De(
        y.updateType,
        h,
        $,
        i
      ), ie = {
        timeStamp: ae,
        stateKey: r,
        path: i,
        updateType: y.updateType,
        status: "new",
        oldValue: Y,
        newValue: oe
      };
      if (je(r, (U) => {
        const P = [...U ?? [], ie].reduce((F, _) => {
          const C = `${_.stateKey}:${JSON.stringify(_.path)}`, V = F.get(C);
          return V ? (V.timeStamp = Math.max(V.timeStamp, _.timeStamp), V.newValue = _.newValue, V.oldValue = V.oldValue ?? _.oldValue, V.updateType = _.updateType) : F.set(C, { ..._ }), F;
        }, /* @__PURE__ */ new Map());
        return Array.from(P.values());
      }), Ee(
        $,
        r,
        n.current,
        N
      ), I && I({
        updateLog: B,
        update: ie
      }), n.current?.serverSync) {
        const U = a.getState().serverState[r], w = n.current?.serverSync;
        Oe(r, {
          syncKey: typeof w.syncKey == "string" ? w.syncKey : w.syncKey({ state: $ }),
          rollBackState: U,
          actionTimeStamp: Date.now() + (w.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return $;
    });
  };
  a.getState().updaterState[r] || (K(
    r,
    ee(
      r,
      o,
      W.current,
      N
    )
  ), a.getState().cogsStateStore[r] || q(r, e), a.getState().initialStateGlobal[r] || fe(r, e));
  const g = he(() => ee(
    r,
    o,
    W.current,
    N
  ), [r]);
  return [we(r), g];
}
function ee(e, c, S, d) {
  const u = /* @__PURE__ */ new Map();
  let I = 0;
  const E = (m) => {
    const t = m.join(".");
    for (const [v] of u)
      (v === t || v.startsWith(t + ".")) && u.delete(v);
    I++;
  }, f = {
    removeValidation: (m) => {
      m?.validationKey && p(m.validationKey);
    },
    revertToInitialState: (m) => {
      const t = a.getState().getInitialOptions(e)?.validation;
      t?.key && p(t?.key), m?.validationKey && p(m.validationKey);
      const v = a.getState().initialStateGlobal[e];
      a.getState().clearSelectedIndexesForState(e), u.clear(), I++;
      const A = l(v, []), b = z(e), O = L(b?.localStorage?.key) ? b?.localStorage?.key(v) : b?.localStorage?.key, N = `${d}-${e}-${O}`;
      N && localStorage.removeItem(N), K(e, A), q(e, v);
      const R = a.getState().stateComponents.get(e);
      return R && R.components.forEach((r) => {
        r.forceUpdate();
      }), v;
    },
    updateInitialState: (m) => {
      u.clear(), I++;
      const t = ee(
        e,
        c,
        S,
        d
      ), v = a.getState().initialStateGlobal[e], A = z(e), b = L(A?.localStorage?.key) ? A?.localStorage?.key(v) : A?.localStorage?.key, O = `${d}-${e}-${b}`;
      return console.log("removing storage", O), localStorage.getItem(O) && localStorage.removeItem(O), Ve(() => {
        fe(e, m), K(e, t), q(e, m);
        const N = a.getState().stateComponents.get(e);
        N && N.components.forEach((R) => {
          R.forceUpdate();
        });
      }), {
        fetchId: (N) => t.get()[N]
      };
    },
    _initialState: a.getState().initialStateGlobal[e],
    _serverState: a.getState().serverState[e],
    _isLoading: a.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const m = a.getState().serverState[e];
      return !!(m && G(m, we(e)));
    }
  };
  function l(m, t = [], v) {
    const A = t.map(String).join(".");
    u.get(A);
    const b = function() {
      return a().getNestedState(e, t);
    };
    Object.keys(f).forEach((R) => {
      b[R] = f[R];
    });
    const O = {
      apply(R, r, B) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), a().getNestedState(e, t);
      },
      get(R, r) {
        if (r !== "then" && !r.startsWith("$") && r !== "stateMapNoRender") {
          const n = t.join("."), o = `${e}////${S}`, g = a.getState().stateComponents.get(e);
          if (g) {
            const s = g.components.get(o);
            s && (t.length > 0 || r === "get") && s.paths.add(n);
          }
        }
        if (r === "getDifferences")
          return () => _e(
            a.getState().cogsStateStore[e],
            a.getState().initialStateGlobal[e]
          );
        if (r === "sync" && t.length === 0)
          return async function() {
            const n = a.getState().getInitialOptions(e), o = n?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const g = a.getState().getNestedState(e, []), s = n?.validation?.key;
            try {
              const i = await o.action(g);
              if (i && !i.success && i.errors && s) {
                a.getState().removeValidationError(s), i.errors.forEach((k) => {
                  const h = [s, ...k.path].join(".");
                  a.getState().addValidationError(h, k.message);
                });
                const y = a.getState().stateComponents.get(e);
                y && y.components.forEach((k) => {
                  k.forceUpdate();
                });
              }
              return i?.success && o.onSuccess ? o.onSuccess(i.data) : !i?.success && o.onError && o.onError(i.error), i;
            } catch (i) {
              return o.onError && o.onError(i), { success: !1, error: i };
            }
          };
        if (r === "_status") {
          const n = a.getState().getNestedState(e, t), o = a.getState().initialStateGlobal[e], g = D(o, t);
          return G(n, g) ? "fresh" : "stale";
        }
        if (r === "getStatus")
          return function() {
            const n = a().getNestedState(
              e,
              t
            ), o = a.getState().initialStateGlobal[e], g = D(o, t);
            return G(n, g) ? "fresh" : "stale";
          };
        if (r === "removeStorage")
          return () => {
            const n = a.getState().initialStateGlobal[e], o = z(e), g = L(o?.localStorage?.key) ? o?.localStorage?.key(n) : o?.localStorage?.key, s = `${d}-${e}-${g}`;
            console.log("removing storage", s), s && localStorage.removeItem(s);
          };
        if (r === "showValidationErrors")
          return () => {
            const n = a.getState().getInitialOptions(e)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return a.getState().getValidationErrors(n.key + "." + t.join("."));
          };
        if (Array.isArray(m)) {
          if (r === "getSelected")
            return () => {
              const n = a.getState().getSelectedIndex(e, t.join("."));
              if (n !== void 0)
                return l(
                  m[n],
                  [...t, n.toString()],
                  v
                );
            };
          if (r === "clearSelected")
            return () => {
              a.getState().clearSelectedIndex({ stateKey: e, path: t });
            };
          if (r === "getSelectedIndex")
            return () => a.getState().getSelectedIndex(e, t.join(".")) ?? -1;
          if (r === "stateSort")
            return (n) => {
              const s = [...a.getState().getNestedState(e, t).map((i, y) => ({
                ...i,
                __origIndex: y.toString()
              }))].sort(n);
              return u.clear(), I++, l(s, t, {
                filtered: [...v?.filtered || [], t],
                validIndices: s.map(
                  (i) => parseInt(i.__origIndex)
                )
              });
            };
          if (r === "stateMap" || r === "stateMapNoRender")
            return (n) => {
              const o = v?.filtered?.some(
                (s) => s.join(".") === t.join(".")
              ), g = o ? m : a.getState().getNestedState(e, t);
              return r !== "stateMapNoRender" && (u.clear(), I++), g.map((s, i) => {
                const y = o && s.__origIndex ? s.__origIndex : i, k = l(
                  s,
                  [...t, y.toString()],
                  v
                );
                return n(
                  s,
                  k,
                  i,
                  m,
                  l(m, t, v)
                );
              });
            };
          if (r === "$stateMap")
            return (n) => te(Ge, {
              proxy: {
                _stateKey: e,
                _path: t,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: l
            });
          if (r === "stateFlattenOn")
            return (n) => {
              const g = v?.filtered?.some(
                (i) => i.join(".") === t.join(".")
              ) ? m : a.getState().getNestedState(e, t);
              u.clear(), I++;
              const s = g.flatMap(
                (i, y) => i[n] ?? []
              );
              return l(
                s,
                [...t, "[*]", n],
                v
              );
            };
          if (r === "findWith")
            return (n, o) => {
              const g = m.findIndex((y) => y[n] === o);
              if (g === -1) return;
              const s = m[g], i = [...t, g.toString()];
              return u.clear(), I++, l(s, i);
            };
          if (r === "index")
            return (n) => {
              const o = m[n];
              return l(o, [...t, n.toString()]);
            };
          if (r === "last")
            return () => {
              const n = a.getState().getNestedState(e, t);
              if (n.length === 0) return;
              const o = n.length - 1, g = n[o], s = [...t, o.toString()];
              return l(g, s);
            };
          if (r === "insert")
            return (n) => (E(t), ce(c, n, t, e), l(
              a.getState().getNestedState(e, t),
              t
            ));
          if (r === "uniqueInsert")
            return (n, o, g) => {
              const s = a.getState().getNestedState(e, t), i = L(n) ? n(s) : n;
              let y = null;
              if (!s.some((h) => {
                if (o) {
                  const x = o.every(
                    (T) => G(h[T], i[T])
                  );
                  return x && (y = h), x;
                }
                const $ = G(h, i);
                return $ && (y = h), $;
              }))
                E(t), ce(c, i, t, e);
              else if (g && y) {
                const h = g(y), $ = s.map(
                  (x) => G(x, y) ? h : x
                );
                E(t), Z(c, $, t);
              }
            };
          if (r === "cut")
            return (n, o) => {
              if (!o?.waitForSync)
                return E(t), X(c, t, e, n), l(
                  a.getState().getNestedState(e, t),
                  t
                );
            };
          if (r === "cutByValue")
            return (n) => {
              for (let o = 0; o < m.length; o++)
                m[o] === n && X(c, t, e, o);
            };
          if (r === "toggleByValue")
            return (n) => {
              const o = m.findIndex((g) => g === n);
              o > -1 ? X(c, t, e, o) : ce(c, n, t, e);
            };
          if (r === "stateFind")
            return (n) => {
              const o = a.getState().getNestedState(e, t), g = o.findIndex(n);
              if (g === -1)
                return;
              const s = o[g], i = [...t, g.toString()];
              return l(s, i);
            };
          if (r === "stateFilter")
            return (n) => {
              const g = a.getState().getNestedState(e, t).filter((s, i) => {
                const y = { ...s, __origIndex: i.toString() };
                return n(y, i);
              });
              return u.clear(), I++, l(g, t, {
                filtered: [...v?.filtered || [], t],
                validIndices: g.map(
                  (s) => parseInt(s.__origIndex)
                )
              });
            };
        }
        const B = t[t.length - 1];
        if (!isNaN(Number(B))) {
          const n = t.slice(0, -1), o = a.getState().getNestedState(e, n);
          if (Array.isArray(o) && r === "cut")
            return () => X(
              c,
              n,
              e,
              Number(B)
            );
        }
        if (r === "get")
          return () => a.getState().getNestedState(e, t);
        if (r === "$derive")
          return (n) => le({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (r === "$derive")
          return (n) => le({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (r === "$get")
          return () => le({
            _stateKey: e,
            _path: t
          });
        if (r === "lastSynced") {
          const n = `${e}:${t.join(".")}`;
          return a.getState().getSyncInfo(n);
        }
        if (r == "getLocalStorage")
          return (n) => ne(d + "-" + e + "-" + n);
        if (r === "_selected") {
          const n = t.slice(0, -1), o = n.join("."), g = a.getState().getNestedState(e, n);
          return Array.isArray(g) ? Number(t[t.length - 1]) === a.getState().getSelectedIndex(e, o) : void 0;
        }
        if (r === "setSelected")
          return (n) => {
            const o = t.slice(0, -1), g = Number(t[t.length - 1]), s = o.join(".");
            n ? a.getState().setSelectedIndex(e, s, g) : a.getState().setSelectedIndex(e, s, void 0);
            const i = a.getState().getNestedState(e, [...o]);
            Z(c, i, o), E(o);
          };
        if (r === "toggleSelected")
          return () => {
            const n = t.slice(0, -1), o = Number(t[t.length - 1]), g = n.join("."), s = a.getState().getSelectedIndex(e, g);
            a.getState().setSelectedIndex(
              e,
              g,
              s === o ? void 0 : o
            );
            const i = a.getState().getNestedState(e, [...n]);
            Z(c, i, n), E(n);
          };
        if (t.length == 0) {
          if (r === "validateZodSchema")
            return () => {
              const n = a.getState().getInitialOptions(e)?.validation, o = a.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              p(n.key);
              const g = a.getState().cogsStateStore[e];
              try {
                const s = a.getState().getValidationErrors(n.key);
                s && s.length > 0 && s.forEach(([y]) => {
                  y && y.startsWith(n.key) && p(y);
                });
                const i = n.zodSchema.safeParse(g);
                return i.success ? !0 : (i.error.errors.forEach((k) => {
                  const h = k.path, $ = k.message, x = [n.key, ...h].join(".");
                  o(x, $);
                }), re(e), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (r === "_componentId") return S;
          if (r === "getComponents")
            return () => a().stateComponents.get(e);
          if (r === "getAllFormRefs")
            return () => ye.getState().getFormRefsByStateKey(e);
          if (r === "_initialState")
            return a.getState().initialStateGlobal[e];
          if (r === "_serverState")
            return a.getState().serverState[e];
          if (r === "_isLoading")
            return a.getState().isLoadingGlobal[e];
          if (r === "revertToInitialState")
            return f.revertToInitialState;
          if (r === "updateInitialState") return f.updateInitialState;
          if (r === "removeValidation") return f.removeValidation;
        }
        if (r === "getFormRef")
          return () => ye.getState().getFormRef(e + "." + t.join("."));
        if (r === "validationWrapper")
          return ({
            children: n,
            hideMessage: o
          }) => /* @__PURE__ */ me(
            Te,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: t,
              validationKey: a.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: v?.validIndices,
              children: n
            }
          );
        if (r === "_stateKey") return e;
        if (r === "_path") return t;
        if (r === "_isServerSynced") return f._isServerSynced;
        if (r === "update")
          return (n, o) => {
            if (o?.debounce)
              xe(() => {
                Z(c, n, t, "");
                const g = a.getState().getNestedState(e, t);
                o?.afterUpdate && o.afterUpdate(g);
              }, o.debounce);
            else {
              Z(c, n, t, "");
              const g = a.getState().getNestedState(e, t);
              o?.afterUpdate && o.afterUpdate(g);
            }
            E(t);
          };
        if (r === "formElement")
          return (n, o) => /* @__PURE__ */ me(
            Ce,
            {
              setState: c,
              stateKey: e,
              path: t,
              child: n,
              formOpts: o
            }
          );
        const H = [...t, r], W = a.getState().getNestedState(e, H);
        return l(W, H, v);
      }
    }, N = new Proxy(b, O);
    return u.set(A, {
      proxy: N,
      stateVersion: I
    }), N;
  }
  return l(
    a.getState().getNestedState(e, [])
  );
}
function le(e) {
  return te(pe, { proxy: e });
}
function Ge({
  proxy: e,
  rebuildStateShape: c
}) {
  const S = a().getNestedState(e._stateKey, e._path);
  return Array.isArray(S) ? c(
    S,
    e._path
  ).stateMapNoRender(
    (u, I, E, f, l) => e._mapFn(u, I, E, f, l)
  ) : null;
}
function pe({
  proxy: e
}) {
  const c = Q(null), S = `${e._stateKey}-${e._path.join(".")}`;
  return ue(() => {
    const d = c.current;
    if (!d || !d.parentElement) return;
    const u = d.parentElement, E = Array.from(u.childNodes).indexOf(d);
    let f = u.getAttribute("data-parent-id");
    f || (f = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", f));
    const m = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: f,
      position: E,
      effect: e._effect
    };
    a.getState().addSignalElement(S, m);
    const t = a.getState().getNestedState(e._stateKey, e._path);
    let v;
    if (e._effect)
      try {
        v = new Function(
          "state",
          `return (${e._effect})(state)`
        )(t);
      } catch (b) {
        console.error("Error evaluating effect function during mount:", b), v = t;
      }
    else
      v = t;
    v !== null && typeof v == "object" && (v = JSON.stringify(v));
    const A = document.createTextNode(String(v));
    d.replaceWith(A);
  }, [e._stateKey, e._path.join("."), e._effect]), te("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function et(e) {
  const c = ke(
    (S) => {
      const d = a.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return d.components.set(e._stateKey, {
        forceUpdate: S,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => d.components.delete(e._stateKey);
    },
    () => a.getState().getNestedState(e._stateKey, e._path)
  );
  return te("text", {}, String(c));
}
export {
  le as $cogsSignal,
  et as $cogsSignalStore,
  Xe as addStateOptions,
  Qe as createCogsState,
  Ke as notifyComponent,
  Me as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
