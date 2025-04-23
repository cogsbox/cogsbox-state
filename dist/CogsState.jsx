"use client";
import { jsx as ce } from "react/jsx-runtime";
import { useState as ee, useRef as J, useEffect as te, useLayoutEffect as Ie, useMemo as Ee, createElement as X, useSyncExternalStore as _e, startTransition as Z } from "react";
import { transformStateFunc as we, isFunction as W, getNestedValue as L, isDeepEqual as G, debounce as Ve } from "./utility.js";
import { pushFunc as Y, updateFn as z, cutFunc as B, ValidationWrapper as pe, FormControlComponent as Ne } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r, formRefStore as le } from "./store.js";
import { useCogsConfig as $e } from "./CogsStateClient.jsx";
import ne from "./node_modules/uuid/dist/esm-browser/v4.js";
function de(e, a) {
  const S = r.getState().getInitialOptions, y = r.getState().setInitialStateOptions, u = S(e) || {};
  y(e, {
    ...u,
    ...a
  });
}
function ue({
  stateKey: e,
  options: a,
  initialOptionsPart: S
}) {
  const y = re(e) || {}, u = S[e] || {}, _ = r.getState().setInitialStateOptions, E = { ...u, ...y };
  let v = !1;
  if (a)
    for (const c in a)
      E.hasOwnProperty(c) ? c == "localStorage" && a[c] && E[c].key !== a[c]?.key && (v = !0, E[c] = a[c]) : (v = !0, E[c] = a[c]);
  v && _(e, E);
}
function qe(e, { formElements: a, validation: S }) {
  return { initialState: e, formElements: a, validation: S };
}
const ze = (e, a) => {
  let S = e;
  const [y, u] = we(S);
  (a?.formElements || a?.validation) && Object.keys(u).forEach((v) => {
    u[v] = u[v] || {}, u[v].formElements = {
      ...a.formElements,
      // Global defaults first
      ...a?.validation,
      ...u[v].formElements || {}
      // State-specific overrides
    };
  }), r.getState().setInitialStates(y);
  const _ = (v, c) => {
    const [f] = ee(c?.componentId ?? ne());
    ue({
      stateKey: v,
      options: c,
      initialOptionsPart: u
    });
    const t = r.getState().cogsStateStore[v] || y[v], m = c?.modifyState ? c.modifyState(t) : t, [k, h] = je(
      m,
      {
        stateKey: v,
        syncUpdate: c?.syncUpdate,
        componentId: f,
        localStorage: c?.localStorage,
        middleware: c?.middleware,
        enabledSync: c?.enabledSync,
        reactiveType: c?.reactiveType,
        reactiveDeps: c?.reactiveDeps,
        initialState: c?.initialState,
        dependencies: c?.dependencies
      }
    );
    return h;
  };
  function E(v, c) {
    ue({ stateKey: v, options: c, initialOptionsPart: u });
  }
  return { useCogsState: _, setCogsOptions: E };
}, {
  setUpdaterState: H,
  setState: P,
  getInitialOptions: re,
  getKeyState: fe,
  getValidationErrors: he,
  setStateLog: Ae,
  updateInitialStateGlobal: oe,
  addValidationError: Ce,
  removeValidationError: M,
  setServerSyncActions: Te
} = r.getState(), ge = (e) => {
  if (!e) return null;
  try {
    const a = window.localStorage.getItem(e);
    return a ? JSON.parse(a) : null;
  } catch (a) {
    return console.error("Error loading from localStorage:", a), null;
  }
}, ke = (e, a, S, y) => {
  S.log && console.log(
    "saving to localstorage",
    a,
    S.localStorage?.key,
    y
  );
  const u = W(S.localStorage?.key) ? S.localStorage?.key(e) : S.localStorage?.key;
  if (u && y) {
    const _ = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[a]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[a]
    }, E = `${y}-${a}-${u}`;
    window.localStorage.setItem(E, JSON.stringify(_));
  }
}, Fe = (e, a, S, y, u, _) => {
  const E = {
    initialState: a,
    updaterState: Q(
      e,
      y,
      u,
      _
    ),
    state: S
  };
  Z(() => {
    oe(e, E.initialState), H(e, E.updaterState), P(e, E.state);
  });
}, Se = (e) => {
  const a = r.getState().stateComponents.get(e);
  if (!a) return;
  const S = /* @__PURE__ */ new Set();
  a.components.forEach((y) => {
    S.add(() => y.forceUpdate());
  }), queueMicrotask(() => {
    Z(() => {
      S.forEach((y) => y());
    });
  });
}, Be = (e, a) => {
  const S = r.getState().stateComponents.get(e);
  if (S) {
    const y = `${e}////${a}`, u = S.components.get(y);
    u && u.forceUpdate();
  }
};
function je(e, {
  stateKey: a,
  serverSync: S,
  localStorage: y,
  formElements: u,
  middleware: _,
  reactiveDeps: E,
  reactiveType: v,
  componentId: c,
  initialState: f,
  syncUpdate: t,
  dependencies: m
} = {}) {
  const [k, h] = ee({}), { sessionId: T } = $e();
  let U = !a;
  const [d] = ee(a ?? ne()), s = r.getState().stateLog[d], R = J(/* @__PURE__ */ new Set()), x = J(c ?? ne()), A = J(null);
  A.current = re(d), te(() => {
    if (t && t.stateKey === d && t.path?.[0]) {
      P(d, (o) => ({
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
    de(d, {
      initialState: f
    });
    const l = A.current;
    let o = null;
    l.log && console.log("newoptions", l);
    const g = W(l.localStorage?.key) ? l.localStorage?.key(f) : l.localStorage?.key;
    g && T && (o = ge(
      T + "-" + d + "-" + g
    ));
    let w = null;
    f && (w = f, o && o.lastUpdated > (o.lastSyncedWithServer || 0) && (w = o.state), Fe(
      d,
      f,
      w,
      n,
      x.current,
      T
    ), Se(d), h({}));
  }, [f, ...m || []]), Ie(() => {
    U && de(d, {
      serverSync: S,
      formElements: u,
      initialState: f,
      localStorage: y,
      middleware: _
    });
    const l = `${d}////${x.current}`, o = r.getState().stateComponents.get(d) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(l, {
      forceUpdate: () => h({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: E || void 0,
      reactiveType: v ?? ["component", "deps"]
    }), r.getState().stateComponents.set(d, o), h({}), () => {
      const g = `${d}////${x.current}`;
      o && (o.components.delete(g), o.components.size === 0 && r.getState().stateComponents.delete(d));
    };
  }, []);
  const n = (l, o, g, w) => {
    if (Array.isArray(o)) {
      const F = `${d}-${o.join(".")}`;
      R.current.add(F);
    }
    P(d, (F) => {
      const p = W(l) ? l(F) : l, b = `${d}-${o.join(".")}`;
      if (b) {
        let O = !1, I = r.getState().signalDomElements.get(b);
        if ((!I || I.size === 0) && (g.updateType === "insert" || g.updateType === "cut")) {
          const N = o.slice(0, -1), $ = L(p, N);
          if (Array.isArray($)) {
            O = !0;
            const V = `${d}-${N.join(".")}`;
            I = r.getState().signalDomElements.get(V);
          }
        }
        if (I) {
          const N = O ? L(p, o.slice(0, -1)) : L(p, o);
          I.forEach(({ parentId: $, position: V, effect: D }) => {
            const j = document.querySelector(
              `[data-parent-id="${$}"]`
            );
            if (j) {
              const se = Array.from(j.childNodes);
              if (se[V]) {
                const ve = D ? new Function("state", `return (${D})(state)`)(N) : N;
                se[V].textContent = String(ve);
              }
            }
          });
        }
      }
      g.updateType === "update" && (w || A.current?.validationKey) && o && M(
        (w || A.current?.validationKey) + "." + o.join(".")
      );
      const C = o.slice(0, o.length - 1);
      g.updateType === "cut" && A.current?.validationKey && M(
        A.current?.validationKey + "." + C.join(".")
      ), g.updateType === "insert" && A.current?.validationKey && he(
        A.current?.validationKey + "." + C.join(".")
      ).filter(([I, N]) => {
        let $ = I?.split(".").length;
        if (I == C.join(".") && $ == C.length - 1) {
          let V = I + "." + C;
          M(I), Ce(V, N);
        }
      });
      const q = L(F, o), me = L(p, o), ye = g.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), ae = r.getState().stateComponents.get(d);
      if (ae)
        for (const [O, I] of ae.components.entries()) {
          let N = !1;
          const $ = Array.isArray(I.reactiveType) ? I.reactiveType : [I.reactiveType || "component"];
          if (!$.includes("none")) {
            if ($.includes("all")) {
              I.forceUpdate();
              continue;
            }
            if ($.includes("component") && I.paths && (I.paths.has(ye) || I.paths.has("")) && (N = !0), !N && $.includes("deps") && I.depsFunction) {
              const V = I.depsFunction(p);
              typeof V == "boolean" ? V && (N = !0) : G(I.deps, V) || (I.deps = V, N = !0);
            }
            N && I.forceUpdate();
          }
        }
      const ie = {
        timeStamp: Date.now(),
        stateKey: d,
        path: o,
        updateType: g.updateType,
        status: "new",
        oldValue: q,
        newValue: me
      };
      if (Ae(d, (O) => {
        const N = [...O ?? [], ie].reduce(($, V) => {
          const D = `${V.stateKey}:${JSON.stringify(V.path)}`, j = $.get(D);
          return j ? (j.timeStamp = Math.max(j.timeStamp, V.timeStamp), j.newValue = V.newValue, j.oldValue = j.oldValue ?? V.oldValue, j.updateType = V.updateType) : $.set(D, { ...V }), $;
        }, /* @__PURE__ */ new Map());
        return Array.from(N.values());
      }), ke(
        p,
        d,
        A.current,
        T
      ), _ && _({
        updateLog: s,
        update: ie
      }), A.current?.serverSync) {
        const O = r.getState().serverState[d], I = A.current?.serverSync;
        Te(d, {
          syncKey: typeof I.syncKey == "string" ? I.syncKey : I.syncKey({ state: p }),
          rollBackState: O,
          actionTimeStamp: Date.now() + (I.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return p;
    });
  };
  r.getState().updaterState[d] || (H(
    d,
    Q(
      d,
      n,
      x.current,
      T
    )
  ), r.getState().cogsStateStore[d] || P(d, e), r.getState().initialStateGlobal[d] || oe(d, e));
  const i = Ee(() => Q(
    d,
    n,
    x.current,
    T
  ), [d]);
  return [fe(d), i];
}
function Q(e, a, S, y) {
  const u = /* @__PURE__ */ new Map();
  let _ = 0;
  const E = (f) => {
    const t = f.join(".");
    for (const [m] of u)
      (m === t || m.startsWith(t + ".")) && u.delete(m);
    _++;
  }, v = {
    removeValidation: (f) => {
      f?.validationKey && M(f.validationKey);
    },
    revertToInitialState: (f) => {
      const t = r.getState().getInitialOptions(e)?.validation;
      t?.key && M(t?.key), f?.validationKey && M(f.validationKey);
      const m = r.getState().initialStateGlobal[e];
      u.clear(), _++;
      const k = c(m, []);
      return Z(() => {
        H(e, k), P(e, m);
        const h = r.getState().stateComponents.get(e);
        h && h.components.forEach((d) => {
          d.forceUpdate();
        });
        const T = re(e), U = W(T?.localStorage?.key) ? T?.localStorage?.key(m) : T?.localStorage?.key;
        U && localStorage.removeItem(U);
      }), m;
    },
    updateInitialState: (f) => {
      u.clear(), _++;
      const t = Q(
        e,
        a,
        S,
        y
      );
      return Z(() => {
        oe(e, f), H(e, t), P(e, f);
        const m = r.getState().stateComponents.get(e);
        m && m.components.forEach((k) => {
          k.forceUpdate();
        }), localStorage.removeItem(e);
      }), {
        fetchId: (m) => t.get()[m]
      };
    },
    _initialState: r.getState().initialStateGlobal[e],
    _serverState: r.getState().serverState[e],
    _isLoading: r.getState().isLoadingGlobal[e],
    _isServerSynced: () => {
      const f = r.getState().serverState[e];
      return !!(f && G(f, fe(e)));
    }
  };
  function c(f, t = [], m) {
    const k = t.map(String).join(".");
    u.get(k);
    const h = function() {
      return r().getNestedState(e, t);
    };
    Object.keys(v).forEach((d) => {
      h[d] = v[d];
    });
    const T = {
      apply(d, s, R) {
        return r().getNestedState(e, t);
      },
      get(d, s) {
        if (s !== "then" && !s.startsWith("$") && s !== "stateMapNoRender") {
          const n = t.join("."), i = `${e}////${S}`, l = r.getState().stateComponents.get(e);
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
        if (Array.isArray(f)) {
          if (s === "getSelected")
            return () => {
              const n = r.getState().getSelectedIndex(e, t.join("."));
              if (n !== void 0)
                return c(
                  f[n],
                  [...t, n.toString()],
                  m
                );
            };
          if (s === "stateMap" || s === "stateMapNoRender")
            return (n) => {
              const i = m?.filtered?.some(
                (o) => o.join(".") === t.join(".")
              ), l = i ? f : r.getState().getNestedState(e, t);
              return s !== "stateMapNoRender" && (u.clear(), _++), l.map((o, g) => {
                const w = i && o.__origIndex ? o.__origIndex : g, F = c(
                  o,
                  [...t, w.toString()],
                  m
                );
                return n(
                  o,
                  F,
                  g,
                  f,
                  c(f, t, m)
                );
              });
            };
          if (s === "$stateMap")
            return (n) => X(be, {
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
              const l = m?.filtered?.some(
                (g) => g.join(".") === t.join(".")
              ) ? f : r.getState().getNestedState(e, t);
              u.clear(), _++;
              const o = l.flatMap(
                (g, w) => g[n] ?? []
              );
              return c(
                o,
                [...t, "[*]", n],
                m
              );
            };
          if (s === "findWith")
            return (n, i) => {
              const l = f.findIndex(
                (w) => w[n] === i
              );
              if (l === -1) return;
              const o = f[l], g = [...t, l.toString()];
              return u.clear(), _++, u.clear(), _++, c(o, g);
            };
          if (s === "index")
            return (n) => {
              const i = f[n];
              return c(i, [...t, n.toString()]);
            };
          if (s === "insert")
            return (n) => (E(t), Y(a, n, t, e), c(
              r.getState().cogsStateStore[e],
              []
            ));
          if (s === "uniqueInsert")
            return (n, i, l) => {
              const o = r.getState().getNestedState(e, t), g = W(n) ? n(o) : n;
              let w = null;
              if (!o.some((p) => {
                if (i) {
                  const C = i.every(
                    (q) => G(p[q], g[q])
                  );
                  return C && (w = p), C;
                }
                const b = G(p, g);
                return b && (w = p), b;
              }))
                E(t), Y(a, g, t, e);
              else if (l && w) {
                const p = l(w), b = o.map(
                  (C) => G(C, w) ? p : C
                );
                E(t), z(a, b, t);
              }
            };
          if (s === "cut")
            return (n, i) => {
              i?.waitForSync || (E(t), B(a, t, e, n));
            };
          if (s === "cutByValue")
            return (n) => {
              for (let i = 0; i < f.length; i++)
                f[i] === n && B(a, t, e, i);
            };
          if (s === "toggleByValue")
            return (n) => {
              const i = f.findIndex((l) => l === n);
              i > -1 ? B(a, t, e, i) : Y(a, n, t, e);
            };
          if (s === "stateFilter")
            return (n) => {
              const i = f.map((g, w) => ({
                ...g,
                __origIndex: w.toString()
              })), l = [], o = [];
              for (let g = 0; g < i.length; g++)
                n(i[g], g) && (l.push(g), o.push(i[g]));
              return u.clear(), _++, c(o, t, {
                filtered: [...m?.filtered || [], t],
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
            const g = r.getState().getNestedState(e, [...i]);
            z(a, g, i), E(i);
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
                o && o.length > 0 && o.forEach(([w]) => {
                  w && w.startsWith(n.key) && M(w);
                });
                const g = n.zodSchema.safeParse(l);
                return g.success ? !0 : (g.error.errors.forEach((F) => {
                  const p = F.path, b = F.message, C = [n.key, ...p].join(".");
                  i(C, b);
                }), Se(e), !1);
              } catch (o) {
                return console.error("Zod schema validation failed", o), !1;
              }
            };
          if (s === "_componentId") return S;
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
            pe,
            {
              formOpts: i ? { validation: { message: "" } } : void 0,
              path: t,
              validationKey: r.getState().getInitialOptions(e)?.validation?.key || "",
              stateKey: e,
              validIndices: m?.validIndices,
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
            E(t);
          };
        if (s === "formElement")
          return (n, i) => /* @__PURE__ */ ce(
            Ne,
            {
              setState: a,
              stateKey: e,
              path: t,
              child: n,
              formOpts: i
            }
          );
        const x = [...t, s], A = r.getState().getNestedState(e, x);
        return c(A, x, m);
      }
    }, U = new Proxy(h, T);
    return u.set(k, {
      proxy: U,
      stateVersion: _
    }), U;
  }
  return c(
    r.getState().getNestedState(e, [])
  );
}
function K(e) {
  return X(xe, { proxy: e });
}
function be({
  proxy: e,
  rebuildStateShape: a
}) {
  const S = r().getNestedState(e._stateKey, e._path);
  return Array.isArray(S) ? a(
    S,
    e._path
  ).stateMapNoRender(
    (u, _, E, v, c) => e._mapFn(u, _, E, v, c)
  ) : null;
}
function xe({
  proxy: e
}) {
  const a = J(null), S = `${e._stateKey}-${e._path.join(".")}`;
  return te(() => {
    const y = a.current;
    if (!y || !y.parentElement) return;
    const u = y.parentElement, E = Array.from(u.childNodes).indexOf(y);
    let v = u.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", v));
    const f = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: E,
      effect: e._effect
    };
    r.getState().addSignalElement(S, f);
    const t = r.getState().getNestedState(e._stateKey, e._path);
    let m;
    if (e._effect)
      try {
        m = new Function(
          "state",
          `return (${e._effect})(state)`
        )(t);
      } catch (h) {
        console.error("Error evaluating effect function during mount:", h), m = t;
      }
    else
      m = t;
    m !== null && typeof m == "object" && (m = JSON.stringify(m));
    const k = document.createTextNode(String(m));
    y.replaceWith(k);
  }, [e._stateKey, e._path.join("."), e._effect]), X("span", {
    ref: a,
    style: { display: "none" },
    "data-signal-id": S
  });
}
function Je(e) {
  const a = _e(
    (S) => {
      const y = r.getState().stateComponents.get(e._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return y.components.set(e._stateKey, {
        forceUpdate: S,
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
