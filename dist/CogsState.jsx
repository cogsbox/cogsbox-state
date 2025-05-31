"use client";
import { jsx as me } from "react/jsx-runtime";
import { useState as le, useRef as Q, useEffect as de, useLayoutEffect as Ne, useMemo as ke, createElement as te, useSyncExternalStore as we, startTransition as Ae } from "react";
import { transformStateFunc as Te, isDeepEqual as U, isFunction as G, getNestedValue as W, getDifferences as he, debounce as xe } from "./utility.js";
import { pushFunc as se, updateFn as Z, cutFunc as X, ValidationWrapper as Ve, FormControlComponent as Ce } from "./Functions.jsx";
import be from "./node_modules/superjson/dist/index.js";
import "zod";
import { getGlobalStore as a, formRefStore as ye } from "./store.js";
import { useCogsConfig as _e } from "./CogsStateClient.jsx";
import ge from "./node_modules/uuid/dist/esm-browser/v4.js";
function ve(e, c) {
  const m = a.getState().getInitialOptions, g = a.getState().setInitialStateOptions, d = m(e) || {};
  g(e, {
    ...d,
    ...c
  });
}
function Ie({
  stateKey: e,
  options: c,
  initialOptionsPart: m
}) {
  const g = z(e) || {}, d = m[e] || {}, I = a.getState().setInitialStateOptions, E = { ...d, ...g };
  let f = !1;
  if (c)
    for (const l in c)
      E.hasOwnProperty(l) ? (l == "localStorage" && c[l] && E[l].key !== c[l]?.key && (f = !0, E[l] = c[l]), l == "initialState" && c[l] && E[l] !== c[l] && // Different references
      !U(E[l], c[l]) && (f = !0, E[l] = c[l])) : (f = !0, E[l] = c[l]);
  f && I(e, E);
}
function Ye(e, { formElements: c, validation: m }) {
  return { initialState: e, formElements: c, validation: m };
}
const Xe = (e, c) => {
  let m = e;
  const [g, d] = Te(m);
  (Object.keys(d).length > 0 || c && Object.keys(c).length > 0) && Object.keys(d).forEach((f) => {
    d[f] = d[f] || {}, d[f].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...d[f].formElements || {}
      // State-specific overrides
    }, z(f) || a.getState().setInitialStateOptions(f, d[f]);
  }), a.getState().setInitialStates(g), a.getState().setCreatedState(g);
  const I = (f, l) => {
    const [S] = le(l?.componentId ?? ge());
    Ie({
      stateKey: f,
      options: l,
      initialOptionsPart: d
    });
    const t = a.getState().cogsStateStore[f] || g[f], v = l?.modifyState ? l.modifyState(t) : t, [T, b] = De(
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
    Ie({ stateKey: f, options: l, initialOptionsPart: d }), l.localStorage && Fe(f, l), re(f);
  }
  return { useCogsState: I, setCogsOptions: E };
}, {
  setUpdaterState: K,
  setState: q,
  getInitialOptions: z,
  getKeyState: $e,
  getValidationErrors: Pe,
  setStateLog: je,
  updateInitialStateGlobal: ue,
  addValidationError: Oe,
  removeValidationError: M,
  setServerSyncActions: pe
} = a.getState(), Ee = (e, c, m, g, d) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    g
  );
  const I = G(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (I && g) {
    const E = `${g}-${c}-${I}`;
    let f;
    try {
      f = ne(E)?.lastSyncedWithServer;
    } catch {
    }
    const l = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: d ?? f
    }, S = be.serialize(l);
    window.localStorage.setItem(
      E,
      JSON.stringify(S.json)
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
}, Fe = (e, c) => {
  const m = a.getState().cogsStateStore[e], { sessionId: g } = _e(), d = G(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (d && g) {
    const I = ne(
      `${g}-${e}-${d}`
    );
    if (I && I.lastUpdated > (I.lastSyncedWithServer || 0))
      return q(e, I.state), re(e), !0;
  }
  return !1;
}, Re = (e, c, m, g, d, I) => {
  const E = {
    initialState: c,
    updaterState: ee(
      e,
      g,
      d,
      I
    ),
    state: m
  };
  ue(e, E.initialState), K(e, E.updaterState), q(e, E.state);
}, re = (e) => {
  const c = a.getState().stateComponents.get(e);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || m.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((g) => g());
  });
}, Qe = (e, c) => {
  const m = a.getState().stateComponents.get(e);
  if (m) {
    const g = `${e}////${c}`, d = m.components.get(g);
    if ((d ? Array.isArray(d.reactiveType) ? d.reactiveType : [d.reactiveType || "component"] : null)?.includes("none"))
      return;
    d && d.forceUpdate();
  }
};
function De(e, {
  stateKey: c,
  serverSync: m,
  localStorage: g,
  formElements: d,
  middleware: I,
  reactiveDeps: E,
  reactiveType: f,
  componentId: l,
  initialState: S,
  syncUpdate: t,
  dependencies: v,
  serverState: T
} = {}) {
  const [b, j] = le({}), { sessionId: $ } = _e();
  let O = !c;
  const [r] = le(c ?? ge()), J = a.getState().stateLog[r], H = Q(/* @__PURE__ */ new Set()), L = Q(l ?? ge()), n = Q(
    null
  );
  n.current = z(r) ?? null, de(() => {
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
  }, [t]), de(() => {
    if (S) {
      ve(r, {
        initialState: S
      });
      const s = n.current, y = s?.serverState?.id !== void 0 && s?.serverState?.status === "success" && s?.serverState?.data, k = a.getState().initialStateGlobal[r];
      if (!(k && !U(k, S) || !k) && !y)
        return;
      let _ = null;
      const x = G(s?.localStorage?.key) ? s?.localStorage?.key(S) : s?.localStorage?.key;
      x && $ && (_ = ne(`${$}-${r}-${x}`));
      let V = S, Y = !1;
      const ae = y ? Date.now() : 0, B = _?.lastUpdated || 0, fe = _?.lastSyncedWithServer || 0;
      y && ae > B ? (V = s.serverState.data, Y = !0) : _ && B > fe && (V = _.state, s?.localStorage?.onChange && s?.localStorage?.onChange(V)), Re(
        r,
        S,
        V,
        o,
        L.current,
        $
      ), Y && x && $ && Ee(V, r, s, $, Date.now()), re(r), (Array.isArray(f) ? f : [f || "component"]).includes("none") || j({});
    }
  }, [
    S,
    T?.status,
    T?.data,
    ...v || []
  ]), Ne(() => {
    O && ve(r, {
      serverSync: m,
      formElements: d,
      initialState: S,
      localStorage: g,
      middleware: I
    });
    const s = `${r}////${L.current}`, i = a.getState().stateComponents.get(r) || {
      components: /* @__PURE__ */ new Map()
    };
    return i.components.set(s, {
      forceUpdate: () => j({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0,
      reactiveType: f ?? ["component", "deps"]
    }), a.getState().stateComponents.set(r, i), j({}), () => {
      const y = `${r}////${L.current}`;
      i && (i.components.delete(y), i.components.size === 0 && a.getState().stateComponents.delete(r));
    };
  }, []);
  const o = (s, i, y, k) => {
    if (Array.isArray(i)) {
      const w = `${r}-${i.join(".")}`;
      H.current.add(w);
    }
    q(r, (w) => {
      const _ = G(s) ? s(w) : s, x = `${r}-${i.join(".")}`;
      if (x) {
        let R = !1, N = a.getState().signalDomElements.get(x);
        if ((!N || N.size === 0) && (y.updateType === "insert" || y.updateType === "cut")) {
          const p = i.slice(0, -1), F = W(_, p);
          if (Array.isArray(F)) {
            R = !0;
            const h = `${r}-${p.join(".")}`;
            N = a.getState().signalDomElements.get(h);
          }
        }
        if (N) {
          const p = R ? W(_, i.slice(0, -1)) : W(_, i);
          N.forEach(({ parentId: F, position: h, effect: C }) => {
            const A = document.querySelector(
              `[data-parent-id="${F}"]`
            );
            if (A) {
              const D = Array.from(A.childNodes);
              if (D[h]) {
                const P = C ? new Function("state", `return (${C})(state)`)(p) : p;
                D[h].textContent = String(P);
              }
            }
          });
        }
      }
      y.updateType === "update" && (k || n.current?.validation?.key) && i && M(
        (k || n.current?.validation?.key) + "." + i.join(".")
      );
      const V = i.slice(0, i.length - 1);
      y.updateType === "cut" && n.current?.validation?.key && M(
        n.current?.validation?.key + "." + V.join(".")
      ), y.updateType === "insert" && n.current?.validation?.key && Pe(
        n.current?.validation?.key + "." + V.join(".")
      ).filter(([N, p]) => {
        let F = N?.split(".").length;
        if (N == V.join(".") && F == V.length - 1) {
          let h = N + "." + V;
          M(N), Oe(h, p);
        }
      });
      const Y = W(w, i), ae = W(_, i);
      y.updateType === "update" ? i.join(".") : [...i].slice(0, -1).join(".");
      const B = a.getState().stateComponents.get(r);
      if (B) {
        const R = he(w, _), N = new Set(R), p = y.updateType === "update" ? i.join(".") : i.slice(0, -1).join(".") || "";
        for (const [
          F,
          h
        ] of B.components.entries()) {
          let C = !1;
          const A = Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"];
          if (!A.includes("none")) {
            if (A.includes("all")) {
              h.forceUpdate();
              continue;
            }
            if (A.includes("component") && ((h.paths.has(p) || h.paths.has("")) && (C = !0), !C))
              for (const D of N) {
                let P = D;
                for (; ; ) {
                  if (h.paths.has(P)) {
                    C = !0;
                    break;
                  }
                  const ie = P.lastIndexOf(".");
                  if (ie !== -1) {
                    const Se = P.substring(
                      0,
                      ie
                    );
                    if (!isNaN(
                      Number(P.substring(ie + 1))
                    ) && h.paths.has(Se)) {
                      C = !0;
                      break;
                    }
                    P = Se;
                  } else
                    P = "";
                  if (P === "")
                    break;
                }
                if (C) break;
              }
            if (!C && A.includes("deps") && h.depsFunction) {
              const D = h.depsFunction(_);
              let P = !1;
              typeof D == "boolean" ? D && (P = !0) : U(h.deps, D) || (h.deps = D, P = !0), P && (C = !0);
            }
            C && h.forceUpdate();
          }
        }
      }
      const oe = {
        timeStamp: Date.now(),
        stateKey: r,
        path: i,
        updateType: y.updateType,
        status: "new",
        oldValue: Y,
        newValue: ae
      };
      if (je(r, (R) => {
        const p = [...R ?? [], oe].reduce((F, h) => {
          const C = `${h.stateKey}:${JSON.stringify(h.path)}`, A = F.get(C);
          return A ? (A.timeStamp = Math.max(A.timeStamp, h.timeStamp), A.newValue = h.newValue, A.oldValue = A.oldValue ?? h.oldValue, A.updateType = h.updateType) : F.set(C, { ...h }), F;
        }, /* @__PURE__ */ new Map());
        return Array.from(p.values());
      }), Ee(
        _,
        r,
        n.current,
        $
      ), I && I({
        updateLog: J,
        update: oe
      }), n.current?.serverSync) {
        const R = a.getState().serverState[r], N = n.current?.serverSync;
        pe(r, {
          syncKey: typeof N.syncKey == "string" ? N.syncKey : N.syncKey({ state: _ }),
          rollBackState: R,
          actionTimeStamp: Date.now() + (N.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return _;
    });
  };
  a.getState().updaterState[r] || (K(
    r,
    ee(
      r,
      o,
      L.current,
      $
    )
  ), a.getState().cogsStateStore[r] || q(r, e), a.getState().initialStateGlobal[r] || ue(r, e));
  const u = ke(() => ee(
    r,
    o,
    L.current,
    $
  ), [r]);
  return [$e(r), u];
}
function ee(e, c, m, g) {
  const d = /* @__PURE__ */ new Map();
  let I = 0;
  const E = (S) => {
    const t = S.join(".");
    for (const [v] of d)
      (v === t || v.startsWith(t + ".")) && d.delete(v);
    I++;
  }, f = {
    removeValidation: (S) => {
      S?.validationKey && M(S.validationKey);
    },
    revertToInitialState: (S) => {
      const t = a.getState().getInitialOptions(e)?.validation;
      t?.key && M(t?.key), S?.validationKey && M(S.validationKey);
      const v = a.getState().initialStateGlobal[e];
      a.getState().clearSelectedIndexesForState(e), d.clear(), I++;
      const T = l(v, []), b = z(e), j = G(b?.localStorage?.key) ? b?.localStorage?.key(v) : b?.localStorage?.key, $ = `${g}-${e}-${j}`;
      $ && localStorage.removeItem($), K(e, T), q(e, v);
      const O = a.getState().stateComponents.get(e);
      return O && O.components.forEach((r) => {
        r.forceUpdate();
      }), v;
    },
    updateInitialState: (S) => {
      d.clear(), I++;
      const t = ee(
        e,
        c,
        m,
        g
      ), v = a.getState().initialStateGlobal[e], T = z(e), b = G(T?.localStorage?.key) ? T?.localStorage?.key(v) : T?.localStorage?.key, j = `${g}-${e}-${b}`;
      return console.log("removing storage", j), localStorage.getItem(j) && localStorage.removeItem(j), Ae(() => {
        ue(e, S), K(e, t), q(e, S);
        const $ = a.getState().stateComponents.get(e);
        $ && $.components.forEach((O) => {
          O.forceUpdate();
        });
      }), {
        fetchId: ($) => t.get()[$]
      };
    },
    _initialState: a.getState().initialStateGlobal[e],
    _serverState: a.getState().serverState[e],
    _isLoading: a.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const S = a.getState().serverState[e];
      return !!(S && U(S, $e(e)));
    }
  };
  function l(S, t = [], v) {
    const T = t.map(String).join(".");
    d.get(T);
    const b = function() {
      return a().getNestedState(e, t);
    };
    Object.keys(f).forEach((O) => {
      b[O] = f[O];
    });
    const j = {
      apply(O, r, J) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), a().getNestedState(e, t);
      },
      get(O, r) {
        if (r !== "then" && !r.startsWith("$") && r !== "stateMapNoRender") {
          const n = t.join("."), o = `${e}////${m}`, u = a.getState().stateComponents.get(e);
          if (u) {
            const s = u.components.get(o);
            s && (t.length > 0 || r === "get") && s.paths.add(n);
          }
        }
        if (r === "getDifferences")
          return () => he(
            a.getState().cogsStateStore[e],
            a.getState().initialStateGlobal[e]
          );
        if (r === "sync" && t.length === 0)
          return async function() {
            const n = a.getState().getInitialOptions(e), o = n?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const u = a.getState().getNestedState(e, []), s = n?.validation?.key;
            try {
              const i = await o.action(u);
              if (i && !i.success && i.errors && s) {
                a.getState().removeValidationError(s), i.errors.forEach((k) => {
                  const w = [s, ...k.path].join(".");
                  a.getState().addValidationError(w, k.message);
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
          const n = a.getState().getNestedState(e, t), o = a.getState().initialStateGlobal[e], u = W(o, t);
          return U(n, u) ? "fresh" : "stale";
        }
        if (r === "getStatus")
          return function() {
            const n = a().getNestedState(
              e,
              t
            ), o = a.getState().initialStateGlobal[e], u = W(o, t);
            return U(n, u) ? "fresh" : "stale";
          };
        if (r === "removeStorage")
          return () => {
            const n = a.getState().initialStateGlobal[e], o = z(e), u = G(o?.localStorage?.key) ? o?.localStorage?.key(n) : o?.localStorage?.key, s = `${g}-${e}-${u}`;
            console.log("removing storage", s), s && localStorage.removeItem(s);
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
              const s = [...a.getState().getNestedState(e, t).map((i, y) => ({
                ...i,
                __origIndex: y.toString()
              }))].sort(n);
              return d.clear(), I++, l(s, t, {
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
              ), u = o ? S : a.getState().getNestedState(e, t);
              return r !== "stateMapNoRender" && (d.clear(), I++), u.map((s, i) => {
                const y = o && s.__origIndex ? s.__origIndex : i, k = l(
                  s,
                  [...t, y.toString()],
                  v
                );
                return n(
                  s,
                  k,
                  i,
                  S,
                  l(S, t, v)
                );
              });
            };
          if (r === "$stateMap")
            return (n) => te(Ue, {
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
              const u = v?.filtered?.some(
                (i) => i.join(".") === t.join(".")
              ) ? S : a.getState().getNestedState(e, t);
              d.clear(), I++;
              const s = u.flatMap(
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
              const u = S.findIndex((y) => y[n] === o);
              if (u === -1) return;
              const s = S[u], i = [...t, u.toString()];
              return d.clear(), I++, l(s, i);
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
              const o = n.length - 1, u = n[o], s = [...t, o.toString()];
              return l(u, s);
            };
          if (r === "insert")
            return (n) => (E(t), se(c, n, t, e), l(
              a.getState().getNestedState(e, t),
              t
            ));
          if (r === "uniqueInsert")
            return (n, o, u) => {
              const s = a.getState().getNestedState(e, t), i = G(n) ? n(s) : n;
              let y = null;
              if (!s.some((w) => {
                if (o) {
                  const x = o.every(
                    (V) => U(w[V], i[V])
                  );
                  return x && (y = w), x;
                }
                const _ = U(w, i);
                return _ && (y = w), _;
              }))
                E(t), se(c, i, t, e);
              else if (u && y) {
                const w = u(y), _ = s.map(
                  (x) => U(x, y) ? w : x
                );
                E(t), Z(c, _, t);
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
              for (let o = 0; o < S.length; o++)
                S[o] === n && X(c, t, e, o);
            };
          if (r === "toggleByValue")
            return (n) => {
              const o = S.findIndex((u) => u === n);
              o > -1 ? X(c, t, e, o) : se(c, n, t, e);
            };
          if (r === "stateFilter")
            return (n) => {
              const o = S.map((i, y) => ({
                ...i,
                __origIndex: y.toString()
              })), u = [], s = [];
              for (let i = 0; i < o.length; i++)
                n(o[i], i) && (u.push(i), s.push(o[i]));
              return d.clear(), I++, l(s, t, {
                filtered: [...v?.filtered || [], t],
                validIndices: u
                // Always pass validIndices, even if empty
              });
            };
        }
        const J = t[t.length - 1];
        if (!isNaN(Number(J))) {
          const n = t.slice(0, -1), o = a.getState().getNestedState(e, n);
          if (Array.isArray(o) && r === "cut")
            return () => X(
              c,
              n,
              e,
              Number(J)
            );
        }
        if (r === "get")
          return () => a.getState().getNestedState(e, t);
        if (r === "$derive")
          return (n) => ce({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (r === "$derive")
          return (n) => ce({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (r === "$get")
          return () => ce({
            _stateKey: e,
            _path: t
          });
        if (r === "lastSynced") {
          const n = `${e}:${t.join(".")}`;
          return a.getState().getSyncInfo(n);
        }
        if (r == "getLocalStorage")
          return (n) => ne(g + "-" + e + "-" + n);
        if (r === "_selected") {
          const n = t.slice(0, -1), o = n.join("."), u = a.getState().getNestedState(e, n);
          return Array.isArray(u) ? Number(t[t.length - 1]) === a.getState().getSelectedIndex(e, o) : void 0;
        }
        if (r === "setSelected")
          return (n) => {
            const o = t.slice(0, -1), u = Number(t[t.length - 1]), s = o.join(".");
            n ? a.getState().setSelectedIndex(e, s, u) : a.getState().setSelectedIndex(e, s, void 0);
            const i = a.getState().getNestedState(e, [...o]);
            Z(c, i, o), E(o);
          };
        if (r === "toggleSelected")
          return () => {
            const n = t.slice(0, -1), o = Number(t[t.length - 1]), u = n.join("."), s = a.getState().getSelectedIndex(e, u);
            a.getState().setSelectedIndex(
              e,
              u,
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
              M(n.key);
              const u = a.getState().cogsStateStore[e];
              try {
                const s = a.getState().getValidationErrors(n.key);
                s && s.length > 0 && s.forEach(([y]) => {
                  y && y.startsWith(n.key) && M(y);
                });
                const i = n.zodSchema.safeParse(u);
                return i.success ? !0 : (i.error.errors.forEach((k) => {
                  const w = k.path, _ = k.message, x = [n.key, ...w].join(".");
                  o(x, _);
                }), re(e), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
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
            Ve,
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
                const u = a.getState().getNestedState(e, t);
                o?.afterUpdate && o.afterUpdate(u);
              }, o.debounce);
            else {
              Z(c, n, t, "");
              const u = a.getState().getNestedState(e, t);
              o?.afterUpdate && o.afterUpdate(u);
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
        const H = [...t, r], L = a.getState().getNestedState(e, H);
        return l(L, H, v);
      }
    }, $ = new Proxy(b, j);
    return d.set(T, {
      proxy: $,
      stateVersion: I
    }), $;
  }
  return l(
    a.getState().getNestedState(e, [])
  );
}
function ce(e) {
  return te(Me, { proxy: e });
}
function Ue({
  proxy: e,
  rebuildStateShape: c
}) {
  const m = a().getNestedState(e._stateKey, e._path);
  return Array.isArray(m) ? c(
    m,
    e._path
  ).stateMapNoRender(
    (d, I, E, f, l) => e._mapFn(d, I, E, f, l)
  ) : null;
}
function Me({
  proxy: e
}) {
  const c = Q(null), m = `${e._stateKey}-${e._path.join(".")}`;
  return de(() => {
    const g = c.current;
    if (!g || !g.parentElement) return;
    const d = g.parentElement, E = Array.from(d.childNodes).indexOf(g);
    let f = d.getAttribute("data-parent-id");
    f || (f = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", f));
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
    g.replaceWith(T);
  }, [e._stateKey, e._path.join("."), e._effect]), te("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function Ke(e) {
  const c = we(
    (m) => {
      const g = a.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(e._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => g.components.delete(e._stateKey);
    },
    () => a.getState().getNestedState(e._stateKey, e._path)
  );
  return te("text", {}, String(c));
}
export {
  ce as $cogsSignal,
  Ke as $cogsSignalStore,
  Ye as addStateOptions,
  Xe as createCogsState,
  Qe as notifyComponent,
  De as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
