"use client";
import { jsx as me } from "react/jsx-runtime";
import { useState as de, useRef as Q, useEffect as ue, useLayoutEffect as we, useMemo as Ne, createElement as te, useSyncExternalStore as ke, startTransition as Ve } from "react";
import { transformStateFunc as Te, isDeepEqual as M, isFunction as L, getNestedValue as U, getDifferences as _e, debounce as Ae } from "./utility.js";
import { pushFunc as ce, updateFn as Z, cutFunc as X, ValidationWrapper as xe, FormControlComponent as Ce } from "./Functions.jsx";
import be from "./node_modules/superjson/dist/index.js";
import "zod";
import { getGlobalStore as a, formRefStore as ye } from "./store.js";
import { useCogsConfig as $e } from "./CogsStateClient.jsx";
import ge from "./node_modules/uuid/dist/esm-browser/v4.js";
function ve(e, s) {
  const m = a.getState().getInitialOptions, d = a.getState().setInitialStateOptions, u = m(e) || {};
  d(e, {
    ...u,
    ...s
  });
}
function Ie({
  stateKey: e,
  options: s,
  initialOptionsPart: m
}) {
  const d = z(e) || {}, u = m[e] || {}, I = a.getState().setInitialStateOptions, E = { ...u, ...d };
  let f = !1;
  if (s)
    for (const l in s)
      E.hasOwnProperty(l) ? (l == "localStorage" && s[l] && E[l].key !== s[l]?.key && (f = !0, E[l] = s[l]), l == "initialState" && s[l] && E[l] !== s[l] && // Different references
      !M(E[l], s[l]) && (f = !0, E[l] = s[l])) : (f = !0, E[l] = s[l]);
  f && I(e, E);
}
function Xe(e, { formElements: s, validation: m }) {
  return { initialState: e, formElements: s, validation: m };
}
const Qe = (e, s) => {
  let m = e;
  const [d, u] = Te(m);
  (Object.keys(u).length > 0 || s && Object.keys(s).length > 0) && Object.keys(u).forEach((f) => {
    u[f] = u[f] || {}, u[f].formElements = {
      ...s?.formElements,
      // Global defaults first
      ...s?.validation,
      ...u[f].formElements || {}
      // State-specific overrides
    }, z(f) || a.getState().setInitialStateOptions(f, u[f]);
  }), a.getState().setInitialStates(d), a.getState().setCreatedState(d);
  const I = (f, l) => {
    const [S] = de(l?.componentId ?? ge());
    Ie({
      stateKey: f,
      options: l,
      initialOptionsPart: u
    });
    const t = a.getState().cogsStateStore[f] || d[f], v = l?.modifyState ? l.modifyState(t) : t, [T, b] = De(
      v,
      {
        stateKey: f,
        syncUpdate: l?.syncUpdate,
        componentId: S,
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
    Ie({ stateKey: f, options: l, initialOptionsPart: u }), l.localStorage && pe(f, l), re(f);
  }
  return { useCogsState: I, setCogsOptions: E };
}, {
  setUpdaterState: K,
  setState: q,
  getInitialOptions: z,
  getKeyState: he,
  getValidationErrors: Pe,
  setStateLog: Oe,
  updateInitialStateGlobal: fe,
  addValidationError: je,
  removeValidationError: G,
  setServerSyncActions: Fe
} = a.getState(), Ee = (e, s, m, d, u) => {
  m?.log && console.log(
    "saving to localstorage",
    s,
    m.localStorage?.key,
    d
  );
  const I = L(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (I && d) {
    const E = `${d}-${s}-${I}`;
    let f;
    try {
      f = ne(E)?.lastSyncedWithServer;
    } catch {
    }
    const l = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: u ?? f
    }, S = be.serialize(l);
    window.localStorage.setItem(
      E,
      JSON.stringify(S.json)
    );
  }
}, ne = (e) => {
  if (!e) return null;
  try {
    const s = window.localStorage.getItem(e);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, pe = (e, s) => {
  const m = a.getState().cogsStateStore[e], { sessionId: d } = $e(), u = L(s?.localStorage?.key) ? s.localStorage.key(m) : s?.localStorage?.key;
  if (u && d) {
    const I = ne(
      `${d}-${e}-${u}`
    );
    if (I && I.lastUpdated > (I.lastSyncedWithServer || 0))
      return q(e, I.state), re(e), !0;
  }
  return !1;
}, Re = (e, s, m, d, u, I) => {
  const E = {
    initialState: s,
    updaterState: ee(
      e,
      d,
      u,
      I
    ),
    state: m
  };
  fe(e, E.initialState), K(e, E.updaterState), q(e, E.state);
}, re = (e) => {
  const s = a.getState().stateComponents.get(e);
  if (!s) return;
  const m = /* @__PURE__ */ new Set();
  s.components.forEach((d) => {
    (d ? Array.isArray(d.reactiveType) ? d.reactiveType : [d.reactiveType || "component"] : null)?.includes("none") || m.add(() => d.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((d) => d());
  });
}, Ke = (e, s) => {
  const m = a.getState().stateComponents.get(e);
  if (m) {
    const d = `${e}////${s}`, u = m.components.get(d);
    if ((u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none"))
      return;
    u && u.forceUpdate();
  }
}, Ue = (e, s, m, d) => {
  switch (e) {
    case "update":
      return {
        oldValue: U(s, d),
        newValue: U(m, d)
      };
    case "insert":
      return {
        oldValue: null,
        // or undefined
        newValue: U(m, d)
      };
    case "cut":
      return {
        oldValue: U(s, d),
        newValue: null
        // or undefined
      };
    default:
      return { oldValue: null, newValue: null };
  }
};
function De(e, {
  stateKey: s,
  serverSync: m,
  localStorage: d,
  formElements: u,
  middleware: I,
  reactiveDeps: E,
  reactiveType: f,
  componentId: l,
  initialState: S,
  syncUpdate: t,
  dependencies: v,
  serverState: T
} = {}) {
  const [b, p] = de({}), { sessionId: w } = $e();
  let R = !s;
  const [r] = de(s ?? ge()), J = a.getState().stateLog[r], H = Q(/* @__PURE__ */ new Set()), W = Q(l ?? ge()), n = Q(
    null
  );
  n.current = z(r) ?? null, ue(() => {
    if (t && t.stateKey === r && t.path?.[0]) {
      q(r, (i) => ({
        ...i,
        [t.path[0]]: t.newValue
      }));
      const c = `${t.stateKey}:${t.path.join(".")}`;
      a.getState().setSyncInfo(c, {
        timeStamp: t.timeStamp,
        userId: t.userId
      });
    }
  }, [t]), ue(() => {
    if (S) {
      ve(r, {
        initialState: S
      });
      const c = n.current, y = c?.serverState?.id !== void 0 && c?.serverState?.status === "success" && c?.serverState?.data, k = a.getState().initialStateGlobal[r];
      if (!(k && !M(k, S) || !k) && !y)
        return;
      let $ = null;
      const A = L(c?.localStorage?.key) ? c?.localStorage?.key(S) : c?.localStorage?.key;
      A && w && ($ = ne(`${w}-${r}-${A}`));
      let x = S, B = !1;
      const ae = y ? Date.now() : 0, Y = $?.lastUpdated || 0, oe = $?.lastSyncedWithServer || 0;
      y && ae > Y ? (x = c.serverState.data, B = !0) : $ && Y > oe && (x = $.state, c?.localStorage?.onChange && c?.localStorage?.onChange(x)), Re(
        r,
        S,
        x,
        o,
        W.current,
        w
      ), B && A && w && Ee(x, r, c, w, Date.now()), re(r), (Array.isArray(f) ? f : [f || "component"]).includes("none") || p({});
    }
  }, [
    S,
    T?.status,
    T?.data,
    ...v || []
  ]), we(() => {
    R && ve(r, {
      serverSync: m,
      formElements: u,
      initialState: S,
      localStorage: d,
      middleware: I
    });
    const c = `${r}////${W.current}`, i = a.getState().stateComponents.get(r) || {
      components: /* @__PURE__ */ new Map()
    };
    return i.components.set(c, {
      forceUpdate: () => p({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0,
      reactiveType: f ?? ["component", "deps"]
    }), a.getState().stateComponents.set(r, i), p({}), () => {
      const y = `${r}////${W.current}`;
      i && (i.components.delete(y), i.components.size === 0 && a.getState().stateComponents.delete(r));
    };
  }, []);
  const o = (c, i, y, k) => {
    if (Array.isArray(i)) {
      const N = `${r}-${i.join(".")}`;
      H.current.add(N);
    }
    q(r, (N) => {
      const $ = L(c) ? c(N) : c, A = `${r}-${i.join(".")}`;
      if (A) {
        let j = !1, h = a.getState().signalDomElements.get(A);
        if ((!h || h.size === 0) && (y.updateType === "insert" || y.updateType === "cut")) {
          const P = i.slice(0, -1), F = U($, P);
          if (Array.isArray(F)) {
            j = !0;
            const _ = `${r}-${P.join(".")}`;
            h = a.getState().signalDomElements.get(_);
          }
        }
        if (h) {
          const P = j ? U($, i.slice(0, -1)) : U($, i);
          h.forEach(({ parentId: F, position: _, effect: C }) => {
            const V = document.querySelector(
              `[data-parent-id="${F}"]`
            );
            if (V) {
              const D = Array.from(V.childNodes);
              if (D[_]) {
                const O = C ? new Function("state", `return (${C})(state)`)(P) : P;
                D[_].textContent = String(O);
              }
            }
          });
        }
      }
      y.updateType === "update" && (k || n.current?.validation?.key) && i && G(
        (k || n.current?.validation?.key) + "." + i.join(".")
      );
      const x = i.slice(0, i.length - 1);
      y.updateType === "cut" && n.current?.validation?.key && G(
        n.current?.validation?.key + "." + x.join(".")
      ), y.updateType === "insert" && n.current?.validation?.key && Pe(
        n.current?.validation?.key + "." + x.join(".")
      ).filter(([h, P]) => {
        let F = h?.split(".").length;
        if (h == x.join(".") && F == x.length - 1) {
          let _ = h + "." + x;
          G(h), je(_, P);
        }
      });
      const B = a.getState().stateComponents.get(r);
      if (B) {
        const j = _e(N, $), h = new Set(j), P = y.updateType === "update" ? i.join(".") : i.slice(0, -1).join(".") || "";
        for (const [
          F,
          _
        ] of B.components.entries()) {
          let C = !1;
          const V = Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"];
          if (!V.includes("none")) {
            if (V.includes("all")) {
              _.forceUpdate();
              continue;
            }
            if (V.includes("component") && ((_.paths.has(P) || _.paths.has("")) && (C = !0), !C))
              for (const D of h) {
                let O = D;
                for (; ; ) {
                  if (_.paths.has(O)) {
                    C = !0;
                    break;
                  }
                  const se = O.lastIndexOf(".");
                  if (se !== -1) {
                    const Se = O.substring(
                      0,
                      se
                    );
                    if (!isNaN(
                      Number(O.substring(se + 1))
                    ) && _.paths.has(Se)) {
                      C = !0;
                      break;
                    }
                    O = Se;
                  } else
                    O = "";
                  if (O === "")
                    break;
                }
                if (C) break;
              }
            if (!C && V.includes("deps") && _.depsFunction) {
              const D = _.depsFunction($);
              let O = !1;
              typeof D == "boolean" ? D && (O = !0) : M(_.deps, D) || (_.deps = D, O = !0), O && (C = !0);
            }
            C && _.forceUpdate();
          }
        }
      }
      const ae = Date.now();
      i = i.map((j, h) => {
        const P = i.slice(0, -1), F = U($, P);
        return h === i.length - 1 && ["insert", "cut"].includes(y.updateType) && j === "-1" ? F.length.toString() : j;
      }), console.log(
        "mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm",
        y.updateType,
        N,
        $,
        i
      );
      const { oldValue: Y, newValue: oe } = Ue(
        y.updateType,
        N,
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
      if (Oe(r, (j) => {
        const P = [...j ?? [], ie].reduce((F, _) => {
          const C = `${_.stateKey}:${JSON.stringify(_.path)}`, V = F.get(C);
          return V ? (V.timeStamp = Math.max(V.timeStamp, _.timeStamp), V.newValue = _.newValue, V.oldValue = V.oldValue ?? _.oldValue, V.updateType = _.updateType) : F.set(C, { ..._ }), F;
        }, /* @__PURE__ */ new Map());
        return Array.from(P.values());
      }), Ee(
        $,
        r,
        n.current,
        w
      ), I && I({
        updateLog: J,
        update: ie
      }), n.current?.serverSync) {
        const j = a.getState().serverState[r], h = n.current?.serverSync;
        Fe(r, {
          syncKey: typeof h.syncKey == "string" ? h.syncKey : h.syncKey({ state: $ }),
          rollBackState: j,
          actionTimeStamp: Date.now() + (h.debounce ?? 3e3),
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
      w
    )
  ), a.getState().cogsStateStore[r] || q(r, e), a.getState().initialStateGlobal[r] || fe(r, e));
  const g = Ne(() => ee(
    r,
    o,
    W.current,
    w
  ), [r]);
  return [he(r), g];
}
function ee(e, s, m, d) {
  const u = /* @__PURE__ */ new Map();
  let I = 0;
  const E = (S) => {
    const t = S.join(".");
    for (const [v] of u)
      (v === t || v.startsWith(t + ".")) && u.delete(v);
    I++;
  }, f = {
    removeValidation: (S) => {
      S?.validationKey && G(S.validationKey);
    },
    revertToInitialState: (S) => {
      const t = a.getState().getInitialOptions(e)?.validation;
      t?.key && G(t?.key), S?.validationKey && G(S.validationKey);
      const v = a.getState().initialStateGlobal[e];
      a.getState().clearSelectedIndexesForState(e), u.clear(), I++;
      const T = l(v, []), b = z(e), p = L(b?.localStorage?.key) ? b?.localStorage?.key(v) : b?.localStorage?.key, w = `${d}-${e}-${p}`;
      w && localStorage.removeItem(w), K(e, T), q(e, v);
      const R = a.getState().stateComponents.get(e);
      return R && R.components.forEach((r) => {
        r.forceUpdate();
      }), v;
    },
    updateInitialState: (S) => {
      u.clear(), I++;
      const t = ee(
        e,
        s,
        m,
        d
      ), v = a.getState().initialStateGlobal[e], T = z(e), b = L(T?.localStorage?.key) ? T?.localStorage?.key(v) : T?.localStorage?.key, p = `${d}-${e}-${b}`;
      return console.log("removing storage", p), localStorage.getItem(p) && localStorage.removeItem(p), Ve(() => {
        fe(e, S), K(e, t), q(e, S);
        const w = a.getState().stateComponents.get(e);
        w && w.components.forEach((R) => {
          R.forceUpdate();
        });
      }), {
        fetchId: (w) => t.get()[w]
      };
    },
    _initialState: a.getState().initialStateGlobal[e],
    _serverState: a.getState().serverState[e],
    _isLoading: a.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const S = a.getState().serverState[e];
      return !!(S && M(S, he(e)));
    }
  };
  function l(S, t = [], v) {
    const T = t.map(String).join(".");
    u.get(T);
    const b = function() {
      return a().getNestedState(e, t);
    };
    Object.keys(f).forEach((R) => {
      b[R] = f[R];
    });
    const p = {
      apply(R, r, J) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), a().getNestedState(e, t);
      },
      get(R, r) {
        if (r !== "then" && !r.startsWith("$") && r !== "stateMapNoRender") {
          const n = t.join("."), o = `${e}////${m}`, g = a.getState().stateComponents.get(e);
          if (g) {
            const c = g.components.get(o);
            c && (t.length > 0 || r === "get") && c.paths.add(n);
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
            const g = a.getState().getNestedState(e, []), c = n?.validation?.key;
            try {
              const i = await o.action(g);
              if (i && !i.success && i.errors && c) {
                a.getState().removeValidationError(c), i.errors.forEach((k) => {
                  const N = [c, ...k.path].join(".");
                  a.getState().addValidationError(N, k.message);
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
          const n = a.getState().getNestedState(e, t), o = a.getState().initialStateGlobal[e], g = U(o, t);
          return M(n, g) ? "fresh" : "stale";
        }
        if (r === "getStatus")
          return function() {
            const n = a().getNestedState(
              e,
              t
            ), o = a.getState().initialStateGlobal[e], g = U(o, t);
            return M(n, g) ? "fresh" : "stale";
          };
        if (r === "removeStorage")
          return () => {
            const n = a.getState().initialStateGlobal[e], o = z(e), g = L(o?.localStorage?.key) ? o?.localStorage?.key(n) : o?.localStorage?.key, c = `${d}-${e}-${g}`;
            console.log("removing storage", c), c && localStorage.removeItem(c);
          };
        if (r === "showValidationErrors")
          return () => {
            const n = a.getState().getInitialOptions(e)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return a.getState().getValidationErrors(n.key + "." + t.join("."));
          };
        if (Array.isArray(S)) {
          if (r === "getSelected")
            return () => {
              const n = a.getState().getSelectedIndex(e, t.join("."));
              if (n !== void 0)
                return l(
                  S[n],
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
              const c = [...a.getState().getNestedState(e, t).map((i, y) => ({
                ...i,
                __origIndex: y.toString()
              }))].sort(n);
              return u.clear(), I++, l(c, t, {
                filtered: [...v?.filtered || [], t],
                validIndices: c.map(
                  (i) => parseInt(i.__origIndex)
                )
              });
            };
          if (r === "stateMap" || r === "stateMapNoRender")
            return (n) => {
              const o = v?.filtered?.some(
                (c) => c.join(".") === t.join(".")
              ), g = o ? S : a.getState().getNestedState(e, t);
              return r !== "stateMapNoRender" && (u.clear(), I++), g.map((c, i) => {
                const y = o && c.__origIndex ? c.__origIndex : i, k = l(
                  c,
                  [...t, y.toString()],
                  v
                );
                return n(
                  c,
                  k,
                  i,
                  S,
                  l(S, t, v)
                );
              });
            };
          if (r === "$stateMap")
            return (n) => te(Me, {
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
              ) ? S : a.getState().getNestedState(e, t);
              u.clear(), I++;
              const c = g.flatMap(
                (i, y) => i[n] ?? []
              );
              return l(
                c,
                [...t, "[*]", n],
                v
              );
            };
          if (r === "findWith")
            return (n, o) => {
              const g = S.findIndex((y) => y[n] === o);
              if (g === -1) return;
              const c = S[g], i = [...t, g.toString()];
              return u.clear(), I++, l(c, i);
            };
          if (r === "index")
            return (n) => {
              const o = S[n];
              return l(o, [...t, n.toString()]);
            };
          if (r === "last")
            return () => {
              const n = a.getState().getNestedState(e, t);
              if (n.length === 0) return;
              const o = n.length - 1, g = n[o], c = [...t, o.toString()];
              return l(g, c);
            };
          if (r === "insert")
            return (n) => (E(t), ce(s, n, t, e), l(
              a.getState().getNestedState(e, t),
              t
            ));
          if (r === "uniqueInsert")
            return (n, o, g) => {
              const c = a.getState().getNestedState(e, t), i = L(n) ? n(c) : n;
              let y = null;
              if (!c.some((N) => {
                if (o) {
                  const A = o.every(
                    (x) => M(N[x], i[x])
                  );
                  return A && (y = N), A;
                }
                const $ = M(N, i);
                return $ && (y = N), $;
              }))
                E(t), ce(s, i, t, e);
              else if (g && y) {
                const N = g(y), $ = c.map(
                  (A) => M(A, y) ? N : A
                );
                E(t), Z(s, $, t);
              }
            };
          if (r === "cut")
            return (n, o) => {
              if (!o?.waitForSync)
                return E(t), X(s, t, e, n), l(
                  a.getState().getNestedState(e, t),
                  t
                );
            };
          if (r === "cutByValue")
            return (n) => {
              for (let o = 0; o < S.length; o++)
                S[o] === n && X(s, t, e, o);
            };
          if (r === "toggleByValue")
            return (n) => {
              const o = S.findIndex((g) => g === n);
              o > -1 ? X(s, t, e, o) : ce(s, n, t, e);
            };
          if (r === "stateFilter")
            return (n) => {
              const o = S.map((i, y) => ({
                ...i,
                __origIndex: y.toString()
              })), g = [], c = [];
              for (let i = 0; i < o.length; i++)
                n(o[i], i) && (g.push(i), c.push(o[i]));
              return u.clear(), I++, l(c, t, {
                filtered: [...v?.filtered || [], t],
                validIndices: g
                // Always pass validIndices, even if empty
              });
            };
        }
        const J = t[t.length - 1];
        if (!isNaN(Number(J))) {
          const n = t.slice(0, -1), o = a.getState().getNestedState(e, n);
          if (Array.isArray(o) && r === "cut")
            return () => X(
              s,
              n,
              e,
              Number(J)
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
            const o = t.slice(0, -1), g = Number(t[t.length - 1]), c = o.join(".");
            n ? a.getState().setSelectedIndex(e, c, g) : a.getState().setSelectedIndex(e, c, void 0);
            const i = a.getState().getNestedState(e, [...o]);
            Z(s, i, o), E(o);
          };
        if (r === "toggleSelected")
          return () => {
            const n = t.slice(0, -1), o = Number(t[t.length - 1]), g = n.join("."), c = a.getState().getSelectedIndex(e, g);
            a.getState().setSelectedIndex(
              e,
              g,
              c === o ? void 0 : o
            );
            const i = a.getState().getNestedState(e, [...n]);
            Z(s, i, n), E(n);
          };
        if (t.length == 0) {
          if (r === "validateZodSchema")
            return () => {
              const n = a.getState().getInitialOptions(e)?.validation, o = a.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              G(n.key);
              const g = a.getState().cogsStateStore[e];
              try {
                const c = a.getState().getValidationErrors(n.key);
                c && c.length > 0 && c.forEach(([y]) => {
                  y && y.startsWith(n.key) && G(y);
                });
                const i = n.zodSchema.safeParse(g);
                return i.success ? !0 : (i.error.errors.forEach((k) => {
                  const N = k.path, $ = k.message, A = [n.key, ...N].join(".");
                  o(A, $);
                }), re(e), !1);
              } catch (c) {
                return console.error("Zod schema validation failed", c), !1;
              }
            };
          if (r === "_componentId") return m;
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
            xe,
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
              Ae(() => {
                Z(s, n, t, "");
                const g = a.getState().getNestedState(e, t);
                o?.afterUpdate && o.afterUpdate(g);
              }, o.debounce);
            else {
              Z(s, n, t, "");
              const g = a.getState().getNestedState(e, t);
              o?.afterUpdate && o.afterUpdate(g);
            }
            E(t);
          };
        if (r === "formElement")
          return (n, o) => /* @__PURE__ */ me(
            Ce,
            {
              setState: s,
              stateKey: e,
              path: t,
              child: n,
              formOpts: o
            }
          );
        const H = [...t, r], W = a.getState().getNestedState(e, H);
        return l(W, H, v);
      }
    }, w = new Proxy(b, p);
    return u.set(T, {
      proxy: w,
      stateVersion: I
    }), w;
  }
  return l(
    a.getState().getNestedState(e, [])
  );
}
function le(e) {
  return te(Ge, { proxy: e });
}
function Me({
  proxy: e,
  rebuildStateShape: s
}) {
  const m = a().getNestedState(e._stateKey, e._path);
  return Array.isArray(m) ? s(
    m,
    e._path
  ).stateMapNoRender(
    (u, I, E, f, l) => e._mapFn(u, I, E, f, l)
  ) : null;
}
function Ge({
  proxy: e
}) {
  const s = Q(null), m = `${e._stateKey}-${e._path.join(".")}`;
  return ue(() => {
    const d = s.current;
    if (!d || !d.parentElement) return;
    const u = d.parentElement, E = Array.from(u.childNodes).indexOf(d);
    let f = u.getAttribute("data-parent-id");
    f || (f = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", f));
    const S = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: f,
      position: E,
      effect: e._effect
    };
    a.getState().addSignalElement(m, S);
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
    const T = document.createTextNode(String(v));
    d.replaceWith(T);
  }, [e._stateKey, e._path.join("."), e._effect]), te("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function et(e) {
  const s = ke(
    (m) => {
      const d = a.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return d.components.set(e._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => d.components.delete(e._stateKey);
    },
    () => a.getState().getNestedState(e._stateKey, e._path)
  );
  return te("text", {}, String(s));
}
export {
  le as $cogsSignal,
  et as $cogsSignalStore,
  Xe as addStateOptions,
  Qe as createCogsState,
  Ke as notifyComponent,
  De as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
