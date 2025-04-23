"use client";
import { jsx as ce } from "react/jsx-runtime";
import { useState as ee, useRef as J, useEffect as te, useLayoutEffect as Ie, useMemo as _e, createElement as X, useSyncExternalStore as Ee, startTransition as Z } from "react";
import { transformStateFunc as we, isFunction as W, getNestedValue as L, isDeepEqual as G, debounce as Ve } from "./utility.js";
import { pushFunc as Y, updateFn as z, cutFunc as B, ValidationWrapper as Ne, FormControlComponent as pe } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as le } from "./store.js";
import { useCogsConfig as $e } from "./CogsStateClient.jsx";
import ne from "./node_modules/uuid/dist/esm-browser/v4.js";
function de(e, a) {
  const m = r.getState().getInitialOptions, y = r.getState().setInitialStateOptions, f = m(e) || {};
  y(e, {
    ...f,
    ...a
  });
}
function ue({
  stateKey: e,
  options: a,
  initialOptionsPart: m
}) {
  const y = re(e) || {}, f = m[e] || {}, w = r.getState().setInitialStateOptions, _ = { ...f, ...y };
  let v = !1;
  if (a)
    for (const c in a)
      _.hasOwnProperty(c) ? c == "localStorage" && a[c] && _[c].key !== a[c]?.key && (v = !0, _[c] = a[c]) : (v = !0, _[c] = a[c]);
  v && w(e, _);
}
function qe(e, { formElements: a, validation: m }) {
  return { initialState: e, formElements: a, validation: m };
}
const ze = (e, a) => {
  let m = e;
  const [y, f] = we(m);
  (a?.formElements || a?.validation) && Object.keys(f).forEach((v) => {
    f[v] = f[v] || {}, f[v].formElements = {
      ...a.formElements,
      // Global defaults first
      ...a?.validation,
      ...f[v].formElements || {}
      // State-specific overrides
    };
  }), r.getState().setInitialStates(y);
  const w = (v, c) => {
    const [g] = ee(c?.componentId ?? ne());
    ue({
      stateKey: v,
      options: c,
      initialOptionsPart: f
    });
    const t = r.getState().cogsStateStore[v] || y[v], S = c?.modifyState ? c.modifyState(t) : t, [k, A] = je(
      S,
      {
        stateKey: v,
        syncUpdate: c?.syncUpdate,
        componentId: g,
        localStorage: c?.localStorage,
        middleware: c?.middleware,
        enabledSync: c?.enabledSync,
        reactiveType: c?.reactiveType,
        reactiveDeps: c?.reactiveDeps,
        initialState: c?.initialState,
        dependencies: c?.dependencies
      }
    );
    return A;
  };
  function _(v, c) {
    ue({ stateKey: v, options: c, initialOptionsPart: f });
  }
  return { useCogsState: w, setCogsOptions: _ };
}, {
  setUpdaterState: H,
  setState: P,
  getInitialOptions: re,
  getKeyState: fe,
  getValidationErrors: Ae,
  setStateLog: Ce,
  updateInitialStateGlobal: oe,
  addValidationError: Te,
  removeValidationError: M,
  setServerSyncActions: he
} = r.getState(), ge = (e) => {
  if (!e) return null;
  try {
    const a = window.localStorage.getItem(e);
    return a ? JSON.parse(a) : null;
  } catch (a) {
    return console.error("Error loading from localStorage:", a), null;
  }
}, ke = (e, a, m, y) => {
  m.log && console.log(
    "saving to localstorage",
    a,
    m.localStorage?.key,
    y
  );
  const f = W(m.localStorage?.key) ? m.localStorage?.key(e) : m.localStorage?.key;
  if (f && y) {
    const w = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[a]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[a]
    }, _ = `${y}-${a}-${f}`;
    window.localStorage.setItem(_, JSON.stringify(w));
  }
}, Fe = (e, a, m, y, f, w) => {
  const _ = {
    initialState: a,
    updaterState: Q(
      e,
      y,
      f,
      w
    ),
    state: m
  };
  Z(() => {
    oe(e, _.initialState), H(e, _.updaterState), P(e, _.state);
  });
}, Se = (e) => {
  const a = r.getState().stateComponents.get(e);
  if (!a) return;
  const m = /* @__PURE__ */ new Set();
  a.components.forEach((y) => {
    m.add(() => y.forceUpdate());
  }), queueMicrotask(() => {
    Z(() => {
      m.forEach((y) => y());
    });
  });
}, Be = (e, a) => {
  const m = r.getState().stateComponents.get(e);
  if (m) {
    const y = `${e}////${a}`, f = m.components.get(y);
    f && f.forceUpdate();
  }
};
function je(e, {
  stateKey: a,
  serverSync: m,
  localStorage: y,
  formElements: f,
  middleware: w,
  reactiveDeps: _,
  reactiveType: v,
  componentId: c,
  initialState: g,
  syncUpdate: t,
  dependencies: S
} = {}) {
  const [k, A] = ee({}), { sessionId: h } = $e();
  let U = !a;
  const [u] = ee(a ?? ne()), s = r.getState().stateLog[u], R = J(/* @__PURE__ */ new Set()), b = J(c ?? ne()), C = J(null);
  C.current = re(u), te(() => {
    if (t && t.stateKey === u && t.path?.[0]) {
      P(u, (o) => ({
        ...o,
        [t.path[0]]: t.newValue
      }));
      const l = `${t.stateKey}:${t.path.join(".")}`;
      r.getState().setSyncInfo(l, {
        timeStamp: t.timeStamp,
        userId: t.userId
      });
    }
  }, [t]), te(() => {
    de(u, {
      initialState: g
    });
    const l = C.current;
    let o = null;
    l.log && console.log("newoptions", l);
    const d = W(l.localStorage?.key) ? l.localStorage?.key(g) : l.localStorage?.key;
    d && h && (o = ge(
      h + "-" + u + "-" + d
    ));
    let E = null;
    g && (E = g, o && o.lastUpdated > (o.lastSyncedWithServer || 0) && (E = o.state), Fe(
      u,
      g,
      E,
      n,
      b.current,
      h
    ), Se(u), A({}));
  }, [g, ...S || []]), Ie(() => {
    U && de(u, {
      serverSync: m,
      formElements: f,
      initialState: g,
      localStorage: y,
      middleware: w
    });
    const l = `${u}////${b.current}`, o = r.getState().stateComponents.get(u) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(l, {
      forceUpdate: () => A({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: v ?? ["component", "deps"]
    }), r.getState().stateComponents.set(u, o), A({}), () => {
      const d = `${u}////${b.current}`;
      o && (o.components.delete(d), o.components.size === 0 && r.getState().stateComponents.delete(u));
    };
  }, []);
  const n = (l, o, d, E) => {
    if (Array.isArray(o)) {
      const F = `${u}-${o.join(".")}`;
      R.current.add(F);
    }
    P(u, (F) => {
      const N = W(l) ? l(F) : l, x = `${u}-${o.join(".")}`;
      if (x) {
        let O = !1, I = r.getState().signalDomElements.get(x);
        if ((!I || I.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const p = o.slice(0, -1), $ = L(N, p);
          if (Array.isArray($)) {
            O = !0;
            const V = `${u}-${p.join(".")}`;
            I = r.getState().signalDomElements.get(V);
          }
        }
        if (I) {
          const p = O ? L(N, o.slice(0, -1)) : L(N, o);
          I.forEach(({ parentId: $, position: V, effect: D }) => {
            const j = document.querySelector(
              `[data-parent-id="${$}"]`
            );
            if (j) {
              const se = Array.from(j.childNodes);
              if (se[V]) {
                const ve = D ? new Function("state", `return (${D})(state)`)(p) : p;
                se[V].textContent = String(ve);
              }
            }
          });
        }
      }
      d.updateType === "update" && (E || C.current?.validationKey) && o && M(
        (E || C.current?.validationKey) + "." + o.join(".")
      );
      const T = o.slice(0, o.length - 1);
      d.updateType === "cut" && C.current?.validationKey && M(
        C.current?.validationKey + "." + T.join(".")
      ), d.updateType === "insert" && C.current?.validationKey && Ae(
        C.current?.validationKey + "." + T.join(".")
      ).filter(([I, p]) => {
        let $ = I?.split(".").length;
        if (I == T.join(".") && $ == T.length - 1) {
          let V = I + "." + T;
          M(I), Te(V, p);
        }
      });
      const q = L(F, o), me = L(N, o), ye = d.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), ae = r.getState().stateComponents.get(u);
      if (ae)
        for (const [O, I] of ae.components.entries()) {
          let p = !1;
          const $ = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (!$.includes("none")) {
            if ($.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if ($.includes("component") && I.paths && (I.paths.has(ye) || I.paths.has("")) && (p = !0), !p && $.includes("deps") && I.depsFunction) {
              const V = I.depsFunction(N);
              typeof V == "boolean" ? V && (p = !0) : G(I.deps, V) || (I.deps = V, p = !0);
            }
            p && I.forceUpdate();
          }
        }
      const ie = {
        timeStamp: Date.now(),
        stateKey: u,
        path: o,
        updateType: d.updateType,
        status: "new",
        oldValue: q,
        newValue: me
      };
      if (Ce(u, (O) => {
        const p = [...O ?? [], ie].reduce(($, V) => {
          const D = `${V.stateKey}:${JSON.stringify(V.path)}`, j = $.get(D);
          return j ? (j.timeStamp = Math.max(j.timeStamp, V.timeStamp), j.newValue = V.newValue, j.oldValue = j.oldValue ?? V.oldValue, j.updateType = V.updateType) : $.set(D, { ...V }), $;
        }, /* @__PURE__ */ new Map());
        return Array.from(p.values());
      }), ke(
        N,
        u,
        C.current,
        h
      ), w && w({
        updateLog: s,
        update: ie
      }), C.current?.serverSync) {
        const O = r.getState().serverState[u], I = C.current?.serverSync;
        he(u, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: N }),
          rollBackState: O,
          actionTimeStamp: Date.now() + (I.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return N;
    });
  };
  r.getState().updaterState[u] || (H(
    u,
    Q(
      u,
      n,
      b.current,
      h
    )
  ), r.getState().cogsStateStore[u] || P(u, e), r.getState().initialStateGlobal[u] || oe(u, e));
  const i = _e(() => Q(
    u,
    n,
    b.current,
    h
  ), [u]);
  return [fe(u), i];
}
function Q(e, a, m, y) {
  const f = /* @__PURE__ */ new Map();
  let w = 0;
  const _ = (g) => {
    const t = g.join(".");
    for (const [S] of f)
      (S === t || S.startsWith(t + ".")) && f.delete(S);
    w++;
  }, v = {
    removeValidation: (g) => {
      g?.validationKey && M(g.validationKey);
    },
    revertToInitialState: (g) => {
      const t = r.getState().getInitialOptions(e)?.validation;
      t?.key && M(t?.key), g?.validationKey && M(g.validationKey);
      const S = r.getState().initialStateGlobal[e];
      f.clear(), w++;
      const k = c(S, []);
      return Z(() => {
        H(e, k), P(e, S);
        const A = r.getState().stateComponents.get(e);
        A && A.components.forEach((u) => {
          u.forceUpdate();
        });
        const h = re(e), U = W(h?.localStorage?.key) ? h?.localStorage?.key(S) : h?.localStorage?.key;
        U && localStorage.removeItem(U);
      }), S;
    },
    updateInitialState: (g) => {
      f.clear(), w++;
      const t = Q(
        e,
        a,
        m,
        y
      );
      return Z(() => {
        oe(e, g), H(e, t), P(e, g);
        const S = r.getState().stateComponents.get(e);
        S && S.components.forEach((k) => {
          k.forceUpdate();
        }), localStorage.removeItem(e);
      }), {
        fetchId: (S) => t.get()[S]
      };
    },
    _initialState: r.getState().initialStateGlobal[e],
    _serverState: r.getState().serverState[e],
    _isLoading: r.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const g = r.getState().serverState[e];
      return !!(g && G(g, fe(e)));
    }
  };
  function c(g, t = [], S) {
    const k = t.map(String).join(".");
    f.get(k);
    const A = function() {
      return r().getNestedState(e, t);
    };
    Object.keys(v).forEach((u) => {
      A[u] = v[u];
    });
    const h = {
      apply(u, s, R) {
        return r().getNestedState(e, t);
      },
      get(u, s) {
        if (s !== "then" && !s.startsWith("$") && s !== "stateMapNoRender") {
          const n = t.join("."), i = `${e}////${m}`, l = r.getState().stateComponents.get(e);
          if (l) {
            const o = l.components.get(i);
            o && (t.length > 0 || s === "get") && o.paths.add(n);
          }
        }
        if (s === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(e)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(n.key + "." + t.join("."));
          };
        if (Array.isArray(g)) {
          if (s === "getSelected")
            return () => {
              const n = r.getState().getSelectedIndex(e, t.join("."));
              if (n !== void 0)
                return c(
                  g[n],
                  [...t, n.toString()],
                  S
                );
            };
          if (s === "stateSort")
            return (n) => {
              const o = [...r.getState().getNestedState(e, t).map((d, E) => ({
                ...d,
                __origIndex: E.toString()
              }))].sort(n);
              return f.clear(), w++, c(o, t, {
                filtered: [...S?.filtered || [], t],
                validIndices: o.map(
                  (d) => parseInt(d.__origIndex)
                )
              });
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const i = S?.filtered?.some(
                (o) => o.join(".") === t.join(".")
              ), l = i ? g : r.getState().getNestedState(e, t);
              return s !== "stateMapNoRender" && (f.clear(), w++), l.map((o, d) => {
                const E = i && o.__origIndex ? o.__origIndex : d, F = c(
                  o,
                  [...t, E.toString()],
                  S
                );
                return n(
                  o,
                  F,
                  d,
                  g,
                  c(g, t, S)
                );
              });
            };
          if (s === "$stateMap")
            return (n) => X(xe, {
              proxy: {
                _stateKey: e,
                _path: t,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: c
            });
          if (s === "stateFlattenOn")
            return (n) => {
              const l = S?.filtered?.some(
                (d) => d.join(".") === t.join(".")
              ) ? g : r.getState().getNestedState(e, t);
              f.clear(), w++;
              const o = l.flatMap(
                (d, E) => d[n] ?? []
              );
              return c(
                o,
                [...t, "[*]", n],
                S
              );
            };
          if (s === "findWith")
            return (n, i) => {
              const l = g.findIndex(
                (E) => E[n] === i
              );
              if (l === -1) return;
              const o = g[l], d = [...t, l.toString()];
              return f.clear(), w++, f.clear(), w++, c(o, d);
            };
          if (s === "index")
            return (n) => {
              const i = g[n];
              return c(i, [...t, n.toString()]);
            };
          if (s === "insert")
            return (n) => (_(t), Y(a, n, t, e), c(
              r.getState().cogsStateStore[e],
              []
            ));
          if (s === "uniqueInsert")
            return (n, i, l) => {
              const o = r.getState().getNestedState(e, t), d = W(n) ? n(o) : n;
              let E = null;
              if (!o.some((N) => {
                if (i) {
                  const T = i.every(
                    (q) => G(N[q], d[q])
                  );
                  return T && (E = N), T;
                }
                const x = G(N, d);
                return x && (E = N), x;
              }))
                _(t), Y(a, d, t, e);
              else if (l && E) {
                const N = l(E), x = o.map(
                  (T) => G(T, E) ? N : T
                );
                _(t), z(a, x, t);
              }
            };
          if (s === "cut")
            return (n, i) => {
              i?.waitForSync || (_(t), B(a, t, e, n));
            };
          if (s === "cutByValue")
            return (n) => {
              for (let i = 0; i < g.length; i++)
                g[i] === n && B(a, t, e, i);
            };
          if (s === "toggleByValue")
            return (n) => {
              const i = g.findIndex((l) => l === n);
              i > -1 ? B(a, t, e, i) : Y(a, n, t, e);
            };
          if (s === "stateFilter")
            return (n) => {
              const i = g.map((d, E) => ({
                ...d,
                __origIndex: E.toString()
              })), l = [], o = [];
              for (let d = 0; d < i.length; d++)
                n(i[d], d) && (l.push(d), o.push(i[d]));
              return f.clear(), w++, c(o, t, {
                filtered: [...S?.filtered || [], t],
                validIndices: l
                // Always pass validIndices, even if empty
              });
            };
        }
        const R = t[t.length - 1];
        if (!isNaN(Number(R))) {
          const n = t.slice(0, -1), i = r.getState().getNestedState(e, n);
          if (Array.isArray(i) && s === "cut")
            return () => B(
              a,
              n,
              e,
              Number(R)
            );
        }
        if (s === "get")
          return () => r.getState().getNestedState(e, t);
        if (s === "$derive")
          return (n) => K({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (s === "$derive")
          return (n) => K({
            _stateKey: e,
            _path: t,
            _effect: n.toString()
          });
        if (s === "$get")
          return () => K({
            _stateKey: e,
            _path: t
          });
        if (s === "lastSynced") {
          const n = `${e}:${t.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (s == "getLocalStorage")
          return (n) => ge(y + "-" + e + "-" + n);
        if (s === "_selected") {
          const n = t.slice(0, -1), i = n.join("."), l = r.getState().getNestedState(e, n);
          return Array.isArray(l) ? Number(t[t.length - 1]) === r.getState().getSelectedIndex(e, i) : void 0;
        }
        if (s === "setSelected")
          return (n) => {
            const i = t.slice(0, -1), l = Number(t[t.length - 1]), o = i.join(".");
            n ? r.getState().setSelectedIndex(e, o, l) : r.getState().setSelectedIndex(e, o, void 0);
            const d = r.getState().getNestedState(e, [...i]);
            z(a, d, i), _(i);
          };
        if (t.length == 0) {
          if (s === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(e)?.validation, i = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              M(n.key);
              const l = r.getState().cogsStateStore[e];
              try {
                const o = r.getState().getValidationErrors(n.key);
                o && o.length > 0 && o.forEach(([E]) => {
                  E && E.startsWith(n.key) && M(E);
                });
                const d = n.zodSchema.safeParse(l);
                return d.success ? !0 : (d.error.errors.forEach((F) => {
                  const N = F.path, x = F.message, T = [n.key, ...N].join(".");
                  i(T, x);
                }), Se(e), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (s === "_componentId") return m;
          if (s === "getComponents")
            return () => r().stateComponents.get(e);
          if (s === "getAllFormRefs")
            return () => le.getState().getFormRefsByStateKey(e);
          if (s === "_initialState")
            return r.getState().initialStateGlobal[e];
          if (s === "_serverState")
            return r.getState().serverState[e];
          if (s === "_isLoading")
            return r.getState().isLoadingGlobal[e];
          if (s === "revertToInitialState")
            return v.revertToInitialState;
          if (s === "updateInitialState") return v.updateInitialState;
          if (s === "removeValidation") return v.removeValidation;
        }
        if (s === "getFormRef")
          return () => le.getState().getFormRef(e + "." + t.join("."));
        if (s === "validationWrapper")
          return ({
            children: n,
            hideMessage: i
          }) => /* @__PURE__ */ ce(
            Ne,
            {
              formOpts: i ? { validation: { message: "" } } : void 0,
              path: t,
              validationKey: r.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: S?.validIndices,
              children: n
            }
          );
        if (s === "_stateKey") return e;
        if (s === "_path") return t;
        if (s === "_isServerSynced") return v._isServerSynced;
        if (s === "update")
          return (n, i) => {
            if (i?.debounce)
              Ve(() => {
                z(a, n, t, "");
                const l = r.getState().getNestedState(e, t);
                i?.afterUpdate && i.afterUpdate(l);
              }, i.debounce);
            else {
              z(a, n, t, "");
              const l = r.getState().getNestedState(e, t);
              i?.afterUpdate && i.afterUpdate(l);
            }
            _(t);
          };
        if (s === "formElement")
          return (n, i) => /* @__PURE__ */ ce(
            pe,
            {
              setState: a,
              stateKey: e,
              path: t,
              child: n,
              formOpts: i
            }
          );
        const b = [...t, s], C = r.getState().getNestedState(e, b);
        return c(C, b, S);
      }
    }, U = new Proxy(A, h);
    return f.set(k, {
      proxy: U,
      stateVersion: w
    }), U;
  }
  return c(
    r.getState().getNestedState(e, [])
  );
}
function K(e) {
  return X(be, { proxy: e });
}
function xe({
  proxy: e,
  rebuildStateShape: a
}) {
  const m = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(m) ? a(
    m,
    e._path
  ).stateMapNoRender(
    (f, w, _, v, c) => e._mapFn(f, w, _, v, c)
  ) : null;
}
function be({
  proxy: e
}) {
  const a = J(null), m = `${e._stateKey}-${e._path.join(".")}`;
  return te(() => {
    const y = a.current;
    if (!y || !y.parentElement) return;
    const f = y.parentElement, _ = Array.from(f.childNodes).indexOf(y);
    let v = f.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, f.setAttribute("data-parent-id", v));
    const g = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: _,
      effect: e._effect
    };
    r.getState().addSignalElement(m, g);
    const t = r.getState().getNestedState(e._stateKey, e._path);
    let S;
    if (e._effect)
      try {
        S = new Function(
          "state",
          `return (${e._effect})(state)`
        )(t);
      } catch (A) {
        console.error("Error evaluating effect function during mount:", A), S = t;
      }
    else
      S = t;
    S !== null && typeof S == "object" && (S = JSON.stringify(S));
    const k = document.createTextNode(String(S));
    y.replaceWith(k);
  }, [e._stateKey, e._path.join("."), e._effect]), X("span", {
    ref: a,
    style: { display: "none" },
    "data-signal-id": m
  });
}
function Je(e) {
  const a = Ee(
    (m) => {
      const y = r.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return y.components.set(e._stateKey, {
        forceUpdate: m,
        paths: /* @__PURE__ */ new Set([e._path.join(".")])
      }), () => y.components.delete(e._stateKey);
    },
    () => r.getState().getNestedState(e._stateKey, e._path)
  );
  return X("text", {}, String(a));
}
export {
  K as $cogsSignal,
  Je as $cogsSignalStore,
  qe as addStateOptions,
  ze as createCogsState,
  Be as notifyComponent,
  je as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
