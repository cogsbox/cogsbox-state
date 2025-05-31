"use client";
import { jsx as Se } from "react/jsx-runtime";
import { useState as ie, useRef as Y, useEffect as se, useLayoutEffect as Ne, useMemo as $e, createElement as K, useSyncExternalStore as ke, startTransition as we } from "react";
import { transformStateFunc as Ae, isFunction as G, getNestedValue as W, getDifferences as Ee, isDeepEqual as U, debounce as Te } from "./utility.js";
import { pushFunc as ae, updateFn as B, cutFunc as H, ValidationWrapper as xe, FormControlComponent as Ve } from "./Functions.jsx";
import Ce from "./node_modules/superjson/dist/index.js";
import "zod";
import { getGlobalStore as a, formRefStore as me } from "./store.js";
import { useCogsConfig as _e } from "./CogsStateClient.jsx";
import ce from "./node_modules/uuid/dist/esm-browser/v4.js";
function ye(e, c) {
  const m = a.getState().getInitialOptions, u = a.getState().setInitialStateOptions, d = m(e) || {};
  u(e, {
    ...d,
    ...c
  });
}
function ve({
  stateKey: e,
  options: c,
  initialOptionsPart: m
}) {
  const u = z(e) || {}, d = m[e] || {}, I = a.getState().setInitialStateOptions, E = { ...d, ...u };
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
  const [u, d] = Ae(m);
  (Object.keys(d).length > 0 || c && Object.keys(c).length > 0) && Object.keys(d).forEach((f) => {
    d[f] = d[f] || {}, d[f].formElements = {
      ...c?.formElements,
      // Global defaults first
      ...c?.validation,
      ...d[f].formElements || {}
      // State-specific overrides
    }, z(f) || a.getState().setInitialStateOptions(f, d[f]);
  }), a.getState().setInitialStates(u), a.getState().setCreatedState(u);
  const I = (f, l) => {
    const [S] = ie(l?.componentId ?? ce());
    ve({
      stateKey: f,
      options: l,
      initialOptionsPart: d
    });
    const t = a.getState().cogsStateStore[f] || u[f], v = l?.modifyState ? l.modifyState(t) : t, [x, V] = Re(
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
    return V;
  };
  function E(f, l) {
    ve({ stateKey: f, options: l, initialOptionsPart: d }), l.localStorage && pe(f, l), te(f);
  }
  return { useCogsState: I, setCogsOptions: E };
}, {
  setUpdaterState: X,
  setState: q,
  getInitialOptions: z,
  getKeyState: he,
  getValidationErrors: be,
  setStateLog: Pe,
  updateInitialStateGlobal: le,
  addValidationError: je,
  removeValidationError: M,
  setServerSyncActions: Oe
} = a.getState(), Ie = (e, c, m, u, d) => {
  m?.log && console.log(
    "saving to localstorage",
    c,
    m.localStorage?.key,
    u
  );
  const I = G(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (I && u) {
    const E = `${u}-${c}-${I}`;
    let f;
    try {
      f = ee(E)?.lastSyncedWithServer;
    } catch {
    }
    const l = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: d ?? f
    }, S = Ce.serialize(l);
    window.localStorage.setItem(
      E,
      JSON.stringify(S.json)
    );
  }
}, ee = (e) => {
  if (!e) return null;
  try {
    const c = window.localStorage.getItem(e);
    return c ? JSON.parse(c) : null;
  } catch (c) {
    return console.error("Error loading from localStorage:", c), null;
  }
}, pe = (e, c) => {
  const m = a.getState().cogsStateStore[e], { sessionId: u } = _e(), d = G(c?.localStorage?.key) ? c.localStorage.key(m) : c?.localStorage?.key;
  if (d && u) {
    const I = ee(
      `${u}-${e}-${d}`
    );
    if (I && I.lastUpdated > (I.lastSyncedWithServer || 0))
      return q(e, I.state), te(e), !0;
  }
  return !1;
}, Fe = (e, c, m, u, d, I) => {
  const E = {
    initialState: c,
    updaterState: Q(
      e,
      u,
      d,
      I
    ),
    state: m
  };
  le(e, E.initialState), X(e, E.updaterState), q(e, E.state);
}, te = (e) => {
  const c = a.getState().stateComponents.get(e);
  if (!c) return;
  const m = /* @__PURE__ */ new Set();
  c.components.forEach((u) => {
    (u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none") || m.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((u) => u());
  });
}, Qe = (e, c) => {
  const m = a.getState().stateComponents.get(e);
  if (m) {
    const u = `${e}////${c}`, d = m.components.get(u);
    if ((d ? Array.isArray(d.reactiveType) ? d.reactiveType : [d.reactiveType || "component"] : null)?.includes("none"))
      return;
    d && d.forceUpdate();
  }
};
function Re(e, {
  stateKey: c,
  serverSync: m,
  localStorage: u,
  formElements: d,
  middleware: I,
  reactiveDeps: E,
  reactiveType: f,
  componentId: l,
  initialState: S,
  syncUpdate: t,
  dependencies: v,
  serverState: x
} = {}) {
  const [V, P] = ie({}), { sessionId: h } = _e();
  let j = !c;
  const [r] = ie(c ?? ce()), J = a.getState().stateLog[r], Z = Y(/* @__PURE__ */ new Set()), L = Y(l ?? ce()), n = Y(
    null
  );
  n.current = z(r) ?? null, se(() => {
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
  }, [t]), se(() => {
    if (S) {
      ye(r, {
        initialState: S
      });
      const s = n.current;
      let i = null;
      const y = G(s?.localStorage?.key) ? s?.localStorage?.key(S) : s?.localStorage?.key;
      y && h && (i = ee(
        h + "-" + r + "-" + y
      ));
      let N = S, $ = !1;
      const k = Date.now(), C = i?.lastUpdated || 0, p = i?.lastSyncedWithServer || 0;
      s?.serverState?.id !== void 0 && s?.serverState?.status === "success" && s?.serverState?.data && k > C ? (N = s.serverState.data, $ = !0) : i && C > p && (N = i.state, s?.localStorage?.onChange && s?.localStorage?.onChange(N)), Fe(
        r,
        S,
        N,
        o,
        L.current,
        h
      ), $ && y && h && Ie(N, r, s, h, Date.now()), te(r), (Array.isArray(f) ? f : [f || "component"]).includes("none") || P({});
    }
  }, [S, x?.status, ...v || []]), Ne(() => {
    j && ye(r, {
      serverSync: m,
      formElements: d,
      initialState: S,
      localStorage: u,
      middleware: I
    });
    const s = `${r}////${L.current}`, i = a.getState().stateComponents.get(r) || {
      components: /* @__PURE__ */ new Map()
    };
    return i.components.set(s, {
      forceUpdate: () => P({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0,
      reactiveType: f ?? ["component", "deps"]
    }), a.getState().stateComponents.set(r, i), P({}), () => {
      const y = `${r}////${L.current}`;
      i && (i.components.delete(y), i.components.size === 0 && a.getState().stateComponents.delete(r));
    };
  }, []);
  const o = (s, i, y, N) => {
    if (Array.isArray(i)) {
      const $ = `${r}-${i.join(".")}`;
      Z.current.add($);
    }
    q(r, ($) => {
      const k = G(s) ? s($) : s, C = `${r}-${i.join(".")}`;
      if (C) {
        let R = !1, w = a.getState().signalDomElements.get(C);
        if ((!w || w.size === 0) && (y.updateType === "insert" || y.updateType === "cut")) {
          const O = i.slice(0, -1), F = W(k, O);
          if (Array.isArray(F)) {
            R = !0;
            const _ = `${r}-${O.join(".")}`;
            w = a.getState().signalDomElements.get(_);
          }
        }
        if (w) {
          const O = R ? W(k, i.slice(0, -1)) : W(k, i);
          w.forEach(({ parentId: F, position: _, effect: T }) => {
            const A = document.querySelector(
              `[data-parent-id="${F}"]`
            );
            if (A) {
              const D = Array.from(A.childNodes);
              if (D[_]) {
                const b = T ? new Function("state", `return (${T})(state)`)(O) : O;
                D[_].textContent = String(b);
              }
            }
          });
        }
      }
      y.updateType === "update" && (N || n.current?.validation?.key) && i && M(
        (N || n.current?.validation?.key) + "." + i.join(".")
      );
      const p = i.slice(0, i.length - 1);
      y.updateType === "cut" && n.current?.validation?.key && M(
        n.current?.validation?.key + "." + p.join(".")
      ), y.updateType === "insert" && n.current?.validation?.key && be(
        n.current?.validation?.key + "." + p.join(".")
      ).filter(([w, O]) => {
        let F = w?.split(".").length;
        if (w == p.join(".") && F == p.length - 1) {
          let _ = w + "." + p;
          M(w), je(_, O);
        }
      });
      const de = W($, i), ue = W(k, i);
      y.updateType === "update" ? i.join(".") : [...i].slice(0, -1).join(".");
      const ne = a.getState().stateComponents.get(r);
      if (ne) {
        const R = Ee($, k), w = new Set(R), O = y.updateType === "update" ? i.join(".") : i.slice(0, -1).join(".") || "";
        for (const [
          F,
          _
        ] of ne.components.entries()) {
          let T = !1;
          const A = Array.isArray(_.reactiveType) ? _.reactiveType : [_.reactiveType || "component"];
          if (!A.includes("none")) {
            if (A.includes("all")) {
              _.forceUpdate();
              continue;
            }
            if (A.includes("component") && ((_.paths.has(O) || _.paths.has("")) && (T = !0), !T))
              for (const D of w) {
                let b = D;
                for (; ; ) {
                  if (_.paths.has(b)) {
                    T = !0;
                    break;
                  }
                  const re = b.lastIndexOf(".");
                  if (re !== -1) {
                    const fe = b.substring(
                      0,
                      re
                    );
                    if (!isNaN(
                      Number(b.substring(re + 1))
                    ) && _.paths.has(fe)) {
                      T = !0;
                      break;
                    }
                    b = fe;
                  } else
                    b = "";
                  if (b === "")
                    break;
                }
                if (T) break;
              }
            if (!T && A.includes("deps") && _.depsFunction) {
              const D = _.depsFunction(k);
              let b = !1;
              typeof D == "boolean" ? D && (b = !0) : U(_.deps, D) || (_.deps = D, b = !0), b && (T = !0);
            }
            T && _.forceUpdate();
          }
        }
      }
      const ge = {
        timeStamp: Date.now(),
        stateKey: r,
        path: i,
        updateType: y.updateType,
        status: "new",
        oldValue: de,
        newValue: ue
      };
      if (Pe(r, (R) => {
        const O = [...R ?? [], ge].reduce((F, _) => {
          const T = `${_.stateKey}:${JSON.stringify(_.path)}`, A = F.get(T);
          return A ? (A.timeStamp = Math.max(A.timeStamp, _.timeStamp), A.newValue = _.newValue, A.oldValue = A.oldValue ?? _.oldValue, A.updateType = _.updateType) : F.set(T, { ..._ }), F;
        }, /* @__PURE__ */ new Map());
        return Array.from(O.values());
      }), Ie(
        k,
        r,
        n.current,
        h
      ), I && I({
        updateLog: J,
        update: ge
      }), n.current?.serverSync) {
        const R = a.getState().serverState[r], w = n.current?.serverSync;
        Oe(r, {
          syncKey: typeof w.syncKey == "string" ? w.syncKey : w.syncKey({ state: k }),
          rollBackState: R,
          actionTimeStamp: Date.now() + (w.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return k;
    });
  };
  a.getState().updaterState[r] || (X(
    r,
    Q(
      r,
      o,
      L.current,
      h
    )
  ), a.getState().cogsStateStore[r] || q(r, e), a.getState().initialStateGlobal[r] || le(r, e));
  const g = $e(() => Q(
    r,
    o,
    L.current,
    h
  ), [r]);
  return [he(r), g];
}
function Q(e, c, m, u) {
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
      const x = l(v, []), V = z(e), P = G(V?.localStorage?.key) ? V?.localStorage?.key(v) : V?.localStorage?.key, h = `${u}-${e}-${P}`;
      h && localStorage.removeItem(h), X(e, x), q(e, v);
      const j = a.getState().stateComponents.get(e);
      return j && j.components.forEach((r) => {
        r.forceUpdate();
      }), v;
    },
    updateInitialState: (S) => {
      d.clear(), I++;
      const t = Q(
        e,
        c,
        m,
        u
      ), v = a.getState().initialStateGlobal[e], x = z(e), V = G(x?.localStorage?.key) ? x?.localStorage?.key(v) : x?.localStorage?.key, P = `${u}-${e}-${V}`;
      return console.log("removing storage", P), localStorage.getItem(P) && localStorage.removeItem(P), we(() => {
        le(e, S), X(e, t), q(e, S);
        const h = a.getState().stateComponents.get(e);
        h && h.components.forEach((j) => {
          j.forceUpdate();
        });
      }), {
        fetchId: (h) => t.get()[h]
      };
    },
    _initialState: a.getState().initialStateGlobal[e],
    _serverState: a.getState().serverState[e],
    _isLoading: a.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const S = a.getState().serverState[e];
      return !!(S && U(S, he(e)));
    }
  };
  function l(S, t = [], v) {
    const x = t.map(String).join(".");
    d.get(x);
    const V = function() {
      return a().getNestedState(e, t);
    };
    Object.keys(f).forEach((j) => {
      V[j] = f[j];
    });
    const P = {
      apply(j, r, J) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), a().getNestedState(e, t);
      },
      get(j, r) {
        if (r !== "then" && !r.startsWith("$") && r !== "stateMapNoRender") {
          const n = t.join("."), o = `${e}////${m}`, g = a.getState().stateComponents.get(e);
          if (g) {
            const s = g.components.get(o);
            s && (t.length > 0 || r === "get") && s.paths.add(n);
          }
        }
        if (r === "getDifferences")
          return () => Ee(
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
                a.getState().removeValidationError(s), i.errors.forEach((N) => {
                  const $ = [s, ...N.path].join(".");
                  a.getState().addValidationError($, N.message);
                });
                const y = a.getState().stateComponents.get(e);
                y && y.components.forEach((N) => {
                  N.forceUpdate();
                });
              }
              return i?.success && o.onSuccess ? o.onSuccess(i.data) : !i?.success && o.onError && o.onError(i.error), i;
            } catch (i) {
              return o.onError && o.onError(i), { success: !1, error: i };
            }
          };
        if (r === "_status") {
          const n = a.getState().getNestedState(e, t), o = a.getState().initialStateGlobal[e], g = W(o, t);
          return U(n, g) ? "fresh" : "stale";
        }
        if (r === "getStatus")
          return function() {
            const n = a().getNestedState(
              e,
              t
            ), o = a.getState().initialStateGlobal[e], g = W(o, t);
            return U(n, g) ? "fresh" : "stale";
          };
        if (r === "removeStorage")
          return () => {
            const n = a.getState().initialStateGlobal[e], o = z(e), g = G(o?.localStorage?.key) ? o?.localStorage?.key(n) : o?.localStorage?.key, s = `${u}-${e}-${g}`;
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
              ), g = o ? S : a.getState().getNestedState(e, t);
              return r !== "stateMapNoRender" && (d.clear(), I++), g.map((s, i) => {
                const y = o && s.__origIndex ? s.__origIndex : i, N = l(
                  s,
                  [...t, y.toString()],
                  v
                );
                return n(
                  s,
                  N,
                  i,
                  S,
                  l(S, t, v)
                );
              });
            };
          if (r === "$stateMap")
            return (n) => K(De, {
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
              d.clear(), I++;
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
              const g = S.findIndex((y) => y[n] === o);
              if (g === -1) return;
              const s = S[g], i = [...t, g.toString()];
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
              const o = n.length - 1, g = n[o], s = [...t, o.toString()];
              return l(g, s);
            };
          if (r === "insert")
            return (n) => (E(t), ae(c, n, t, e), l(
              a.getState().getNestedState(e, t),
              t
            ));
          if (r === "uniqueInsert")
            return (n, o, g) => {
              const s = a.getState().getNestedState(e, t), i = G(n) ? n(s) : n;
              let y = null;
              if (!s.some(($) => {
                if (o) {
                  const C = o.every(
                    (p) => U($[p], i[p])
                  );
                  return C && (y = $), C;
                }
                const k = U($, i);
                return k && (y = $), k;
              }))
                E(t), ae(c, i, t, e);
              else if (g && y) {
                const $ = g(y), k = s.map(
                  (C) => U(C, y) ? $ : C
                );
                E(t), B(c, k, t);
              }
            };
          if (r === "cut")
            return (n, o) => {
              if (!o?.waitForSync)
                return E(t), H(c, t, e, n), l(
                  a.getState().getNestedState(e, t),
                  t
                );
            };
          if (r === "cutByValue")
            return (n) => {
              for (let o = 0; o < S.length; o++)
                S[o] === n && H(c, t, e, o);
            };
          if (r === "toggleByValue")
            return (n) => {
              const o = S.findIndex((g) => g === n);
              o > -1 ? H(c, t, e, o) : ae(c, n, t, e);
            };
          if (r === "stateFilter")
            return (n) => {
              const o = S.map((i, y) => ({
                ...i,
                __origIndex: y.toString()
              })), g = [], s = [];
              for (let i = 0; i < o.length; i++)
                n(o[i], i) && (g.push(i), s.push(o[i]));
              return d.clear(), I++, l(s, t, {
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
            return () => H(
              c,
              n,
              e,
              Number(J)
            );
        }
        if (r === "get")
          return () => a.getState().getNestedState(e, t);
        if (r === "$derive")
          return (n) => oe({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (r === "$derive")
          return (n) => oe({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (r === "$get")
          return () => oe({
            _stateKey: e,
            _path: t
          });
        if (r === "lastSynced") {
          const n = `${e}:${t.join(".")}`;
          return a.getState().getSyncInfo(n);
        }
        if (r == "getLocalStorage")
          return (n) => ee(u + "-" + e + "-" + n);
        if (r === "_selected") {
          const n = t.slice(0, -1), o = n.join("."), g = a.getState().getNestedState(e, n);
          return Array.isArray(g) ? Number(t[t.length - 1]) === a.getState().getSelectedIndex(e, o) : void 0;
        }
        if (r === "setSelected")
          return (n) => {
            const o = t.slice(0, -1), g = Number(t[t.length - 1]), s = o.join(".");
            n ? a.getState().setSelectedIndex(e, s, g) : a.getState().setSelectedIndex(e, s, void 0);
            const i = a.getState().getNestedState(e, [...o]);
            B(c, i, o), E(o);
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
            B(c, i, n), E(n);
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
              const g = a.getState().cogsStateStore[e];
              try {
                const s = a.getState().getValidationErrors(n.key);
                s && s.length > 0 && s.forEach(([y]) => {
                  y && y.startsWith(n.key) && M(y);
                });
                const i = n.zodSchema.safeParse(g);
                return i.success ? !0 : (i.error.errors.forEach((N) => {
                  const $ = N.path, k = N.message, C = [n.key, ...$].join(".");
                  o(C, k);
                }), te(e), !1);
              } catch (s) {
                return console.error("Zod schema validation failed", s), !1;
              }
            };
          if (r === "_componentId") return m;
          if (r === "getComponents")
            return () => a().stateComponents.get(e);
          if (r === "getAllFormRefs")
            return () => me.getState().getFormRefsByStateKey(e);
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
          return () => me.getState().getFormRef(e + "." + t.join("."));
        if (r === "validationWrapper")
          return ({
            children: n,
            hideMessage: o
          }) => /* @__PURE__ */ Se(
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
              Te(() => {
                B(c, n, t, "");
                const g = a.getState().getNestedState(e, t);
                o?.afterUpdate && o.afterUpdate(g);
              }, o.debounce);
            else {
              B(c, n, t, "");
              const g = a.getState().getNestedState(e, t);
              o?.afterUpdate && o.afterUpdate(g);
            }
            E(t);
          };
        if (r === "formElement")
          return (n, o) => /* @__PURE__ */ Se(
            Ve,
            {
              setState: c,
              stateKey: e,
              path: t,
              child: n,
              formOpts: o
            }
          );
        const Z = [...t, r], L = a.getState().getNestedState(e, Z);
        return l(L, Z, v);
      }
    }, h = new Proxy(V, P);
    return d.set(x, {
      proxy: h,
      stateVersion: I
    }), h;
  }
  return l(
    a.getState().getNestedState(e, [])
  );
}
function oe(e) {
  return K(Ue, { proxy: e });
}
function De({
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
function Ue({
  proxy: e
}) {
  const c = Y(null), m = `${e._stateKey}-${e._path.join(".")}`;
  return se(() => {
    const u = c.current;
    if (!u || !u.parentElement) return;
    const d = u.parentElement, E = Array.from(d.childNodes).indexOf(u);
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
      } catch (V) {
        console.error("Error evaluating effect function during mount:", V), v = t;
      }
    else
      v = t;
    v !== null && typeof v == "object" && (v = JSON.stringify(v));
    const x = document.createTextNode(String(v));
    u.replaceWith(x);
  }, [e._stateKey, e._path.join("."), e._effect]), K("span", {
    ref: c,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function Ke(e) {
  const c = ke(
    (m) => {
      const u = a.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(e._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => u.components.delete(e._stateKey);
    },
    () => a.getState().getNestedState(e._stateKey, e._path)
  );
  return K("text", {}, String(c));
}
export {
  oe as $cogsSignal,
  Ke as $cogsSignalStore,
  Ye as addStateOptions,
  Xe as createCogsState,
  Qe as notifyComponent,
  Re as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
