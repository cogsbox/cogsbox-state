"use client";
import { jsx as ge } from "react/jsx-runtime";
import { useState as ae, useRef as Y, useEffect as oe, useLayoutEffect as _e, useMemo as Ne, createElement as K, useSyncExternalStore as $e, startTransition as he } from "react";
import { transformStateFunc as we, isFunction as W, isDeepEqual as U, getNestedValue as L, getDifferences as ye, debounce as Ae } from "./utility.js";
import { pushFunc as ne, updateFn as J, cutFunc as H, ValidationWrapper as Te, FormControlComponent as Ve } from "./Functions.jsx";
import ke from "./node_modules/superjson/dist/index.js";
import "zod";
import { getGlobalStore as r, formRefStore as fe } from "./store.js";
import { useCogsConfig as ve } from "./CogsStateClient.jsx";
import ie from "./node_modules/uuid/dist/esm-browser/v4.js";
function Se(e, i) {
  const y = r.getState().getInitialOptions, g = r.getState().setInitialStateOptions, u = y(e) || {};
  g(e, {
    ...u,
    ...i
  });
}
function me({
  stateKey: e,
  options: i,
  initialOptionsPart: y
}) {
  const g = B(e) || {}, u = y[e] || {}, I = r.getState().setInitialStateOptions, E = { ...u, ...g };
  let S = !1;
  if (i)
    for (const l in i)
      E.hasOwnProperty(l) ? (l == "localStorage" && i[l] && E[l].key !== i[l]?.key && (S = !0, E[l] = i[l]), l == "initialState" && i[l] && E[l] !== i[l] && // Different references
      !U(E[l], i[l]) && (S = !0, E[l] = i[l])) : (S = !0, E[l] = i[l]);
  S && I(e, E);
}
function He(e, { formElements: i, validation: y }) {
  return { initialState: e, formElements: i, validation: y };
}
const Ye = (e, i) => {
  let y = e;
  const [g, u] = we(y);
  (Object.keys(u).length > 0 || i && Object.keys(i).length > 0) && Object.keys(u).forEach((S) => {
    u[S] = u[S] || {}, u[S].formElements = {
      ...i?.formElements,
      // Global defaults first
      ...i?.validation,
      ...u[S].formElements || {}
      // State-specific overrides
    }, B(S) || r.getState().setInitialStateOptions(S, u[S]);
  }), r.getState().setInitialStates(g), r.getState().setCreatedState(g);
  const I = (S, l) => {
    const [m] = ae(l?.componentId ?? ie());
    me({
      stateKey: S,
      options: l,
      initialOptionsPart: u
    });
    const t = r.getState().cogsStateStore[S] || g[S], v = l?.modifyState ? l.modifyState(t) : t, [P, T] = Fe(
      v,
      {
        stateKey: S,
        syncUpdate: l?.syncUpdate,
        componentId: m,
        localStorage: l?.localStorage,
        middleware: l?.middleware,
        enabledSync: l?.enabledSync,
        reactiveType: l?.reactiveType,
        reactiveDeps: l?.reactiveDeps,
        initialState: l?.initialState,
        dependencies: l?.dependencies
      }
    );
    return T;
  };
  function E(S, l) {
    me({ stateKey: S, options: l, initialOptionsPart: u }), l.localStorage && Oe(S, l), ee(S);
  }
  return { useCogsState: I, setCogsOptions: E };
}, {
  setUpdaterState: X,
  setState: q,
  getInitialOptions: B,
  getKeyState: Ie,
  getValidationErrors: xe,
  setStateLog: be,
  updateInitialStateGlobal: se,
  addValidationError: Ce,
  removeValidationError: D,
  setServerSyncActions: Pe
} = r.getState(), je = (e, i, y, g) => {
  y?.log && console.log(
    "saving to localstorage",
    i,
    y.localStorage?.key,
    g
  );
  const u = W(y?.localStorage?.key) ? y.localStorage?.key(e) : y?.localStorage?.key;
  if (u && g) {
    const I = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[i]
    }, E = `${g}-${i}-${u}`, S = ke.serialize(I);
    window.localStorage.setItem(
      E,
      JSON.stringify(S.json)
    );
  }
}, ce = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Oe = (e, i) => {
  const y = r.getState().cogsStateStore[e], { sessionId: g } = ve(), u = W(i?.localStorage?.key) ? i.localStorage.key(y) : i?.localStorage?.key;
  if (u && g) {
    const I = ce(
      `${g}-${e}-${u}`
    );
    if (I && I.lastUpdated > (I.lastSyncedWithServer || 0))
      return q(e, I.state), ee(e), !0;
  }
  return !1;
}, pe = (e, i, y, g, u, I) => {
  const E = {
    initialState: i,
    updaterState: Q(
      e,
      g,
      u,
      I
    ),
    state: y
  };
  se(e, E.initialState), X(e, E.updaterState), q(e, E.state);
}, ee = (e) => {
  const i = r.getState().stateComponents.get(e);
  if (!i) return;
  const y = /* @__PURE__ */ new Set();
  i.components.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || y.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    y.forEach((g) => g());
  });
}, Xe = (e, i) => {
  const y = r.getState().stateComponents.get(e);
  if (y) {
    const g = `${e}////${i}`, u = y.components.get(g);
    if ((u ? Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"] : null)?.includes("none"))
      return;
    u && u.forceUpdate();
  }
};
function Fe(e, {
  stateKey: i,
  serverSync: y,
  localStorage: g,
  formElements: u,
  middleware: I,
  reactiveDeps: E,
  reactiveType: S,
  componentId: l,
  initialState: m,
  syncUpdate: t,
  dependencies: v
} = {}) {
  const [P, T] = ae({}), { sessionId: j } = ve();
  let G = !i;
  const [f] = ae(i ?? ie()), s = r.getState().stateLog[f], z = Y(/* @__PURE__ */ new Set()), M = Y(l ?? ie()), k = Y(null);
  k.current = B(f), oe(() => {
    if (t && t.stateKey === f && t.path?.[0]) {
      q(f, (a) => ({
        ...a,
        [t.path[0]]: t.newValue
      }));
      const d = `${t.stateKey}:${t.path.join(".")}`;
      r.getState().setSyncInfo(d, {
        timeStamp: t.timeStamp,
        userId: t.userId
      });
    }
  }, [t]), oe(() => {
    if (m) {
      Se(f, {
        initialState: m
      });
      const d = k.current;
      let a = null;
      const c = W(d?.localStorage?.key) ? d?.localStorage?.key(m) : d?.localStorage?.key;
      c && j && (a = ce(
        j + "-" + f + "-" + c
      ));
      const _ = r.getState().initialStateGlobal[f];
      if (_ && !U(_, m) || !_) {
        let h = m;
        a && a.lastUpdated > (a.lastSyncedWithServer || 0) && (h = a.state, d?.localStorage?.onChange && d?.localStorage?.onChange(h)), pe(
          f,
          m,
          h,
          n,
          M.current,
          j
        ), ee(f), (Array.isArray(S) ? S : [S || "component"]).includes("none") || T({});
      }
    }
  }, [m, ...v || []]), _e(() => {
    G && Se(f, {
      serverSync: y,
      formElements: u,
      initialState: m,
      localStorage: g,
      middleware: I
    });
    const d = `${f}////${M.current}`, a = r.getState().stateComponents.get(f) || {
      components: /* @__PURE__ */ new Map()
    };
    return a.components.set(d, {
      forceUpdate: () => T({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0,
      reactiveType: S ?? ["component", "deps"]
    }), r.getState().stateComponents.set(f, a), T({}), () => {
      const c = `${f}////${M.current}`;
      a && (a.components.delete(c), a.components.size === 0 && r.getState().stateComponents.delete(f));
    };
  }, []);
  const n = (d, a, c, _) => {
    if (Array.isArray(a)) {
      const h = `${f}-${a.join(".")}`;
      z.current.add(h);
    }
    q(f, (h) => {
      const $ = W(d) ? d(h) : d, p = `${f}-${a.join(".")}`;
      if (p) {
        let F = !1, w = r.getState().signalDomElements.get(p);
        if ((!w || w.size === 0) && (c.updateType === "insert" || c.updateType === "cut")) {
          const C = a.slice(0, -1), O = L($, C);
          if (Array.isArray(O)) {
            F = !0;
            const N = `${f}-${C.join(".")}`;
            w = r.getState().signalDomElements.get(N);
          }
        }
        if (w) {
          const C = F ? L($, a.slice(0, -1)) : L($, a);
          w.forEach(({ parentId: O, position: N, effect: V }) => {
            const A = document.querySelector(
              `[data-parent-id="${O}"]`
            );
            if (A) {
              const R = Array.from(A.childNodes);
              if (R[N]) {
                const b = V ? new Function("state", `return (${V})(state)`)(C) : C;
                R[N].textContent = String(b);
              }
            }
          });
        }
      }
      c.updateType === "update" && (_ || k.current?.validationKey) && a && D(
        (_ || k.current?.validationKey) + "." + a.join(".")
      );
      const x = a.slice(0, a.length - 1);
      c.updateType === "cut" && k.current?.validationKey && D(
        k.current?.validationKey + "." + x.join(".")
      ), c.updateType === "insert" && k.current?.validationKey && xe(
        k.current?.validationKey + "." + x.join(".")
      ).filter(([w, C]) => {
        let O = w?.split(".").length;
        if (w == x.join(".") && O == x.length - 1) {
          let N = w + "." + x;
          D(w), Ce(N, C);
        }
      });
      const Z = L(h, a), Ee = L($, a);
      c.updateType === "update" ? a.join(".") : [...a].slice(0, -1).join(".");
      const le = r.getState().stateComponents.get(f);
      if (le) {
        const F = ye(h, $), w = new Set(F), C = c.updateType === "update" ? a.join(".") : a.slice(0, -1).join(".") || "";
        for (const [
          O,
          N
        ] of le.components.entries()) {
          let V = !1;
          const A = Array.isArray(N.reactiveType) ? N.reactiveType : [N.reactiveType || "component"];
          if (!A.includes("none")) {
            if (A.includes("all")) {
              N.forceUpdate();
              continue;
            }
            if (A.includes("component") && ((N.paths.has(C) || N.paths.has("")) && (V = !0), !V))
              for (const R of w) {
                let b = R;
                for (; ; ) {
                  if (N.paths.has(b)) {
                    V = !0;
                    break;
                  }
                  const te = b.lastIndexOf(".");
                  if (te !== -1) {
                    const ue = b.substring(
                      0,
                      te
                    );
                    if (!isNaN(
                      Number(b.substring(te + 1))
                    ) && N.paths.has(ue)) {
                      V = !0;
                      break;
                    }
                    b = ue;
                  } else
                    b = "";
                  if (b === "")
                    break;
                }
                if (V) break;
              }
            if (!V && A.includes("deps") && N.depsFunction) {
              const R = N.depsFunction($);
              let b = !1;
              typeof R == "boolean" ? R && (b = !0) : U(N.deps, R) || (N.deps = R, b = !0), b && (V = !0);
            }
            V && N.forceUpdate();
          }
        }
      }
      const de = {
        timeStamp: Date.now(),
        stateKey: f,
        path: a,
        updateType: c.updateType,
        status: "new",
        oldValue: Z,
        newValue: Ee
      };
      if (be(f, (F) => {
        const C = [...F ?? [], de].reduce((O, N) => {
          const V = `${N.stateKey}:${JSON.stringify(N.path)}`, A = O.get(V);
          return A ? (A.timeStamp = Math.max(A.timeStamp, N.timeStamp), A.newValue = N.newValue, A.oldValue = A.oldValue ?? N.oldValue, A.updateType = N.updateType) : O.set(V, { ...N }), O;
        }, /* @__PURE__ */ new Map());
        return Array.from(C.values());
      }), je(
        $,
        f,
        k.current,
        j
      ), I && I({
        updateLog: s,
        update: de
      }), k.current?.serverSync) {
        const F = r.getState().serverState[f], w = k.current?.serverSync;
        Pe(f, {
          syncKey: typeof w.syncKey == "string" ? w.syncKey : w.syncKey({ state: $ }),
          rollBackState: F,
          actionTimeStamp: Date.now() + (w.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return $;
    });
  };
  r.getState().updaterState[f] || (X(
    f,
    Q(
      f,
      n,
      M.current,
      j
    )
  ), r.getState().cogsStateStore[f] || q(f, e), r.getState().initialStateGlobal[f] || se(f, e));
  const o = Ne(() => Q(
    f,
    n,
    M.current,
    j
  ), [f]);
  return [Ie(f), o];
}
function Q(e, i, y, g) {
  const u = /* @__PURE__ */ new Map();
  let I = 0;
  const E = (m) => {
    const t = m.join(".");
    for (const [v] of u)
      (v === t || v.startsWith(t + ".")) && u.delete(v);
    I++;
  }, S = {
    removeValidation: (m) => {
      m?.validationKey && D(m.validationKey);
    },
    revertToInitialState: (m) => {
      const t = r.getState().getInitialOptions(e)?.validation;
      t?.key && D(t?.key), m?.validationKey && D(m.validationKey);
      const v = r.getState().initialStateGlobal[e];
      r.getState().clearSelectedIndexesForState(e), u.clear(), I++;
      const P = l(v, []), T = B(e), j = W(T?.localStorage?.key) ? T?.localStorage?.key(v) : T?.localStorage?.key, G = `${g}-${e}-${j}`;
      G && localStorage.removeItem(G), X(e, P), q(e, v);
      const f = r.getState().stateComponents.get(e);
      return f && f.components.forEach((s) => {
        s.forceUpdate();
      }), v;
    },
    updateInitialState: (m) => {
      u.clear(), I++;
      const t = Q(
        e,
        i,
        y,
        g
      );
      return he(() => {
        se(e, m), X(e, t), q(e, m);
        const v = r.getState().stateComponents.get(e);
        v && v.components.forEach((P) => {
          P.forceUpdate();
        });
      }), {
        fetchId: (v) => t.get()[v]
      };
    },
    _initialState: r.getState().initialStateGlobal[e],
    _serverState: r.getState().serverState[e],
    _isLoading: r.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const m = r.getState().serverState[e];
      return !!(m && U(m, Ie(e)));
    }
  };
  function l(m, t = [], v) {
    const P = t.map(String).join(".");
    u.get(P);
    const T = function() {
      return r().getNestedState(e, t);
    };
    Object.keys(S).forEach((f) => {
      T[f] = S[f];
    });
    const j = {
      apply(f, s, z) {
        return console.log(
          `PROXY APPLY TRAP HIT: stateKey=${e}, path=${t.join(".")}`
        ), console.trace("Apply trap stack trace"), r().getNestedState(e, t);
      },
      get(f, s) {
        if (s !== "then" && !s.startsWith("$") && s !== "stateMapNoRender") {
          const n = t.join("."), o = `${e}////${y}`, d = r.getState().stateComponents.get(e);
          if (d) {
            const a = d.components.get(o);
            a && (t.length > 0 || s === "get") && a.paths.add(n);
          }
        }
        if (s === "getDifferences")
          return () => ye(
            r.getState().cogsStateStore[e],
            r.getState().initialStateGlobal[e]
          );
        if (s === "sync" && t.length === 0)
          return async function() {
            const n = r.getState().getInitialOptions(e), o = n?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const d = r.getState().getNestedState(e, []), a = n?.validation?.key;
            try {
              const c = await o.action(d);
              if (c && !c.success && c.errors && a) {
                r.getState().removeValidationError(a), c.errors.forEach((h) => {
                  const $ = [a, ...h.path].join(".");
                  r.getState().addValidationError($, h.message);
                });
                const _ = r.getState().stateComponents.get(e);
                _ && _.components.forEach((h) => {
                  h.forceUpdate();
                });
              }
              return c?.success && o.onSuccess ? o.onSuccess(c.data) : !c?.success && o.onError && o.onError(c.error), c;
            } catch (c) {
              return o.onError && o.onError(c), { success: !1, error: c };
            }
          };
        if (s === "_status") {
          const n = r.getState().getNestedState(e, t), o = r.getState().initialStateGlobal[e], d = L(o, t);
          return U(n, d) ? "fresh" : "stale";
        }
        if (s === "getStatus")
          return function() {
            const n = r().getNestedState(
              e,
              t
            ), o = r.getState().initialStateGlobal[e], d = L(o, t);
            return U(n, d) ? "fresh" : "stale";
          };
        if (s === "removeStorage")
          return () => {
            const n = r.getState().initialStateGlobal[e], o = B(e), d = W(o?.localStorage?.key) ? o?.localStorage?.key(n) : o?.localStorage?.key, a = `${g}-${e}-${d}`;
            console.log("removing storage", a), a && localStorage.removeItem(a);
          };
        if (s === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(e)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(n.key + "." + t.join("."));
          };
        if (Array.isArray(m)) {
          if (s === "getSelected")
            return () => {
              const n = r.getState().getSelectedIndex(e, t.join("."));
              if (n !== void 0)
                return l(
                  m[n],
                  [...t, n.toString()],
                  v
                );
            };
          if (s === "clearSelected")
            return () => {
              r.getState().clearSelectedIndex({ stateKey: e, path: t });
            };
          if (s === "getSelectedIndex")
            return () => r.getState().getSelectedIndex(e, t.join(".")) ?? -1;
          if (s === "stateSort")
            return (n) => {
              const a = [...r.getState().getNestedState(e, t).map((c, _) => ({
                ...c,
                __origIndex: _.toString()
              }))].sort(n);
              return u.clear(), I++, l(a, t, {
                filtered: [...v?.filtered || [], t],
                validIndices: a.map(
                  (c) => parseInt(c.__origIndex)
                )
              });
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const o = v?.filtered?.some(
                (a) => a.join(".") === t.join(".")
              ), d = o ? m : r.getState().getNestedState(e, t);
              return s !== "stateMapNoRender" && (u.clear(), I++), d.map((a, c) => {
                const _ = o && a.__origIndex ? a.__origIndex : c, h = l(
                  a,
                  [...t, _.toString()],
                  v
                );
                return n(
                  a,
                  h,
                  c,
                  m,
                  l(m, t, v)
                );
              });
            };
          if (s === "$stateMap")
            return (n) => K(Re, {
              proxy: {
                _stateKey: e,
                _path: t,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: l
            });
          if (s === "stateFlattenOn")
            return (n) => {
              const d = v?.filtered?.some(
                (c) => c.join(".") === t.join(".")
              ) ? m : r.getState().getNestedState(e, t);
              u.clear(), I++;
              const a = d.flatMap(
                (c, _) => c[n] ?? []
              );
              return l(
                a,
                [...t, "[*]", n],
                v
              );
            };
          if (s === "findWith")
            return (n, o) => {
              const d = m.findIndex((_) => _[n] === o);
              if (d === -1) return;
              const a = m[d], c = [...t, d.toString()];
              return u.clear(), I++, l(a, c);
            };
          if (s === "index")
            return (n) => {
              const o = m[n];
              return l(o, [...t, n.toString()]);
            };
          if (s === "last")
            return () => {
              const n = r.getState().getNestedState(e, t);
              if (n.length === 0) return;
              const o = n.length - 1, d = n[o], a = [...t, o.toString()];
              return l(d, a);
            };
          if (s === "insert")
            return (n) => (E(t), ne(i, n, t, e), l(
              r.getState().getNestedState(e, t),
              t
            ));
          if (s === "uniqueInsert")
            return (n, o, d) => {
              const a = r.getState().getNestedState(e, t), c = W(n) ? n(a) : n;
              let _ = null;
              if (!a.some(($) => {
                if (o) {
                  const x = o.every(
                    (Z) => U($[Z], c[Z])
                  );
                  return x && (_ = $), x;
                }
                const p = U($, c);
                return p && (_ = $), p;
              }))
                E(t), ne(i, c, t, e);
              else if (d && _) {
                const $ = d(_), p = a.map(
                  (x) => U(x, _) ? $ : x
                );
                E(t), J(i, p, t);
              }
            };
          if (s === "cut")
            return (n, o) => {
              if (!o?.waitForSync)
                return E(t), H(i, t, e, n), l(
                  r.getState().getNestedState(e, t),
                  t
                );
            };
          if (s === "cutByValue")
            return (n) => {
              for (let o = 0; o < m.length; o++)
                m[o] === n && H(i, t, e, o);
            };
          if (s === "toggleByValue")
            return (n) => {
              const o = m.findIndex((d) => d === n);
              o > -1 ? H(i, t, e, o) : ne(i, n, t, e);
            };
          if (s === "stateFilter")
            return (n) => {
              const o = m.map((c, _) => ({
                ...c,
                __origIndex: _.toString()
              })), d = [], a = [];
              for (let c = 0; c < o.length; c++)
                n(o[c], c) && (d.push(c), a.push(o[c]));
              return u.clear(), I++, l(a, t, {
                filtered: [...v?.filtered || [], t],
                validIndices: d
                // Always pass validIndices, even if empty
              });
            };
        }
        const z = t[t.length - 1];
        if (!isNaN(Number(z))) {
          const n = t.slice(0, -1), o = r.getState().getNestedState(e, n);
          if (Array.isArray(o) && s === "cut")
            return () => H(
              i,
              n,
              e,
              Number(z)
            );
        }
        if (s === "get")
          return () => r.getState().getNestedState(e, t);
        if (s === "$derive")
          return (n) => re({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (s === "$derive")
          return (n) => re({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (s === "$get")
          return () => re({
            _stateKey: e,
            _path: t
          });
        if (s === "lastSynced") {
          const n = `${e}:${t.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (s == "getLocalStorage")
          return (n) => ce(g + "-" + e + "-" + n);
        if (s === "_selected") {
          const n = t.slice(0, -1), o = n.join("."), d = r.getState().getNestedState(e, n);
          return Array.isArray(d) ? Number(t[t.length - 1]) === r.getState().getSelectedIndex(e, o) : void 0;
        }
        if (s === "setSelected")
          return (n) => {
            const o = t.slice(0, -1), d = Number(t[t.length - 1]), a = o.join(".");
            n ? r.getState().setSelectedIndex(e, a, d) : r.getState().setSelectedIndex(e, a, void 0);
            const c = r.getState().getNestedState(e, [...o]);
            J(i, c, o), E(o);
          };
        if (s === "toggleSelected")
          return () => {
            const n = t.slice(0, -1), o = Number(t[t.length - 1]), d = n.join("."), a = r.getState().getSelectedIndex(e, d);
            r.getState().setSelectedIndex(
              e,
              d,
              a === o ? void 0 : o
            );
            const c = r.getState().getNestedState(e, [...n]);
            J(i, c, n), E(n);
          };
        if (t.length == 0) {
          if (s === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(e)?.validation, o = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              D(n.key);
              const d = r.getState().cogsStateStore[e];
              try {
                const a = r.getState().getValidationErrors(n.key);
                a && a.length > 0 && a.forEach(([_]) => {
                  _ && _.startsWith(n.key) && D(_);
                });
                const c = n.zodSchema.safeParse(d);
                return c.success ? !0 : (c.error.errors.forEach((h) => {
                  const $ = h.path, p = h.message, x = [n.key, ...$].join(".");
                  o(x, p);
                }), ee(e), !1);
              } catch (a) {
                return console.error("Zod schema validation failed", a), !1;
              }
            };
          if (s === "_componentId") return y;
          if (s === "getComponents")
            return () => r().stateComponents.get(e);
          if (s === "getAllFormRefs")
            return () => fe.getState().getFormRefsByStateKey(e);
          if (s === "_initialState")
            return r.getState().initialStateGlobal[e];
          if (s === "_serverState")
            return r.getState().serverState[e];
          if (s === "_isLoading")
            return r.getState().isLoadingGlobal[e];
          if (s === "revertToInitialState")
            return S.revertToInitialState;
          if (s === "updateInitialState") return S.updateInitialState;
          if (s === "removeValidation") return S.removeValidation;
        }
        if (s === "getFormRef")
          return () => fe.getState().getFormRef(e + "." + t.join("."));
        if (s === "validationWrapper")
          return ({
            children: n,
            hideMessage: o
          }) => /* @__PURE__ */ ge(
            Te,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: t,
              validationKey: r.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: v?.validIndices,
              children: n
            }
          );
        if (s === "_stateKey") return e;
        if (s === "_path") return t;
        if (s === "_isServerSynced") return S._isServerSynced;
        if (s === "update")
          return (n, o) => {
            if (o?.debounce)
              Ae(() => {
                J(i, n, t, "");
                const d = r.getState().getNestedState(e, t);
                o?.afterUpdate && o.afterUpdate(d);
              }, o.debounce);
            else {
              J(i, n, t, "");
              const d = r.getState().getNestedState(e, t);
              o?.afterUpdate && o.afterUpdate(d);
            }
            E(t);
          };
        if (s === "formElement")
          return (n, o) => /* @__PURE__ */ ge(
            Ve,
            {
              setState: i,
              stateKey: e,
              path: t,
              child: n,
              formOpts: o
            }
          );
        const M = [...t, s], k = r.getState().getNestedState(e, M);
        return l(k, M, v);
      }
    }, G = new Proxy(T, j);
    return u.set(P, {
      proxy: G,
      stateVersion: I
    }), G;
  }
  return l(
    r.getState().getNestedState(e, [])
  );
}
function re(e) {
  return K(Ue, { proxy: e });
}
function Re({
  proxy: e,
  rebuildStateShape: i
}) {
  const y = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(y) ? i(
    y,
    e._path
  ).stateMapNoRender(
    (u, I, E, S, l) => e._mapFn(u, I, E, S, l)
  ) : null;
}
function Ue({
  proxy: e
}) {
  const i = Y(null), y = `${e._stateKey}-${e._path.join(".")}`;
  return oe(() => {
    const g = i.current;
    if (!g || !g.parentElement) return;
    const u = g.parentElement, E = Array.from(u.childNodes).indexOf(g);
    let S = u.getAttribute("data-parent-id");
    S || (S = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", S));
    const m = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: S,
      position: E,
      effect: e._effect
    };
    r.getState().addSignalElement(y, m);
    const t = r.getState().getNestedState(e._stateKey, e._path);
    let v;
    if (e._effect)
      try {
        v = new Function(
          "state",
          `return (${e._effect})(state)`
        )(t);
      } catch (T) {
        console.error("Error evaluating effect function during mount:", T), v = t;
      }
    else
      v = t;
    v !== null && typeof v == "object" && (v = JSON.stringify(v));
    const P = document.createTextNode(String(v));
    g.replaceWith(P);
  }, [e._stateKey, e._path.join("."), e._effect]), K("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": y
  });
}
function Qe(e) {
  const i = $e(
    (y) => {
      const g = r.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return g.components.set(e._stateKey, {
        forceUpdate: y,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => g.components.delete(e._stateKey);
    },
    () => r.getState().getNestedState(e._stateKey, e._path)
  );
  return K("text", {}, String(i));
}
export {
  re as $cogsSignal,
  Qe as $cogsSignalStore,
  He as addStateOptions,
  Ye as createCogsState,
  Xe as notifyComponent,
  Fe as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
