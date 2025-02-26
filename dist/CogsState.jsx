"use client";
import { j as et } from "./node_modules/react/jsx-runtime.jsx";
import { r as V } from "./node_modules/react/index.js";
import { transformStateFunc as ut, isFunction as it, getNestedValue as L, isDeepEqual as G, debounce as ft } from "./utility.js";
import { pushFunc as nt, updateFn as z, cutFunc as rt, ValidationWrapper as gt, FormControlComponent as St } from "./Functions.jsx";
import "zod";
import { getGlobalStore as r } from "./store.js";
import { useCogsConfig as mt } from "./CogsStateClient.jsx";
import Q from "./node_modules/uuid/dist/esm-browser/v4.js";
function at(t, s) {
  const u = r.getState().getInitialOptions, f = r.getState().setInitialStateOptions, g = u(t) || {};
  f(t, {
    ...g,
    ...s
  });
}
function ot({
  stateKey: t,
  options: s,
  initialOptionsPart: u
}) {
  const f = X(t) || {}, g = u[t] || {}, p = r.getState().setInitialStateOptions, _ = { ...g, ...f };
  let E = !1;
  if (s)
    for (const y in s)
      _.hasOwnProperty(y) || (E = !0, _[y] = s[y]);
  E && p(t, _);
}
const bt = (t, s) => {
  let u = t;
  const [f, g] = ut(u);
  r.getState().setInitialStates(f);
  const p = (E, y) => {
    const [I] = V.useState(y?.componentId ?? Q());
    ot({
      stateKey: E,
      options: y,
      initialOptionsPart: g
    });
    const c = r.getState().cogsStateStore[E] || f[E], e = y?.modifyState ? y.modifyState(c) : c, [v, N] = Vt(
      e,
      {
        stateKey: E,
        syncUpdate: y?.syncUpdate,
        componentId: I,
        localStorage: y?.localStorage,
        middleware: y?.middleware,
        enabledSync: y?.enabledSync,
        reactiveType: y?.reactiveType,
        reactiveDeps: y?.reactiveDeps,
        initState: y?.initState
      }
    );
    return N;
  };
  function _(E, y) {
    ot({ stateKey: E, options: y, initialOptionsPart: g });
  }
  return { useCogsState: p, setCogsOptions: _ };
}, {
  setUpdaterState: J,
  setState: R,
  getInitialOptions: X,
  getKeyState: st,
  getValidationErrors: yt,
  setStateLog: vt,
  updateInitialStateGlobal: Y,
  addValidationError: It,
  removeValidationError: P,
  setServerSyncActions: pt
} = r.getState(), ct = (t) => {
  if (!t) return null;
  try {
    const s = window.localStorage.getItem(t);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, Et = (t, s, u, f) => {
  if (u?.initState) {
    const g = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: r.getState().serverSyncLog[s]?.[0]?.timeStamp,
      baseServerState: r.getState().serverState[s]
    }, p = u.initState ? `${f}-${s}-${u.initState.localStorageKey}` : s;
    window.localStorage.setItem(p, JSON.stringify(g));
  }
}, _t = (t, s, u, f, g, p) => {
  const _ = {
    initialState: s,
    updaterState: Z(
      t,
      f,
      g,
      p
    ),
    state: u
  };
  V.startTransition(() => {
    Y(t, _.initialState), J(t, _.updaterState), R(t, _.state);
  });
}, wt = (t) => {
  const s = r.getState().stateComponents.get(t);
  if (!s) return;
  const u = /* @__PURE__ */ new Set();
  s.components.forEach((f) => {
    u.add(() => f.forceUpdate());
  }), queueMicrotask(() => {
    V.startTransition(() => {
      u.forEach((f) => f());
    });
  });
};
function Vt(t, {
  stateKey: s,
  serverSync: u,
  localStorage: f,
  formElements: g,
  middleware: p,
  reactiveDeps: _,
  reactiveType: E,
  componentId: y,
  initState: I,
  syncUpdate: c
} = {}) {
  const [e, v] = V.useState({}), { sessionId: N } = mt();
  let U = !s;
  const [l] = V.useState(s ?? Q()), W = r.getState().stateLog[l], i = V.useRef(/* @__PURE__ */ new Set()), O = V.useRef(y ?? Q()), C = V.useRef(null);
  C.current = X(l), V.useEffect(() => {
    if (c && c.stateKey === l && c.path?.[0]) {
      R(l, (o) => ({
        ...o,
        [c.path[0]]: c.newValue
      }));
      const a = `${c.stateKey}:${c.path.join(".")}`;
      r.getState().setSyncInfo(a, {
        timeStamp: c.timeStamp,
        userId: c.userId
      });
    }
  }, [c]), V.useEffect(() => {
    at(l, {
      initState: I
    });
    const a = ct(
      N + "-" + l + "-" + I?.localStorageKey
    );
    let o = null;
    I?.initialState && (o = I?.initialState, a && a.lastUpdated > (a.lastSyncedWithServer || 0) && (o = a.state), _t(
      l,
      I?.initialState,
      o,
      k,
      O.current,
      N
    ), v({}));
  }, [I?.localStorageKey, ...I?.dependencies || []]), V.useLayoutEffect(() => {
    U && at(l, {
      serverSync: u,
      formElements: g,
      initState: I,
      localStorage: f,
      middleware: p
    });
    const a = `${l}////${O.current}`, o = r.getState().stateComponents.get(l) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(a, {
      forceUpdate: () => v({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), r.getState().stateComponents.set(l, o), v({}), () => {
      const d = `${l}////${O.current}`;
      o && (o.components.delete(d), o.components.size === 0 && r.getState().stateComponents.delete(l));
    };
  }, []);
  const k = (a, o, d, S) => {
    if (Array.isArray(o)) {
      const w = `${l}-${o.join(".")}`;
      i.current.add(w);
    }
    R(l, (w) => {
      const T = it(a) ? a(w) : a, M = `${l}-${o.join(".")}`;
      if (M) {
        let b = !1, m = r.getState().signalDomElements.get(M);
        if ((!m || m.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const h = o.slice(0, -1), A = L(T, h);
          if (Array.isArray(A)) {
            b = !0;
            const $ = `${l}-${h.join(".")}`;
            m = r.getState().signalDomElements.get($);
          }
        }
        if (m) {
          const h = b ? L(T, o.slice(0, -1)) : L(T, o);
          m.forEach(({ parentId: A, position: $, effect: D }) => {
            const x = document.querySelector(
              `[data-parent-id="${A}"]`
            );
            if (x) {
              const tt = Array.from(x.childNodes);
              if (tt[$]) {
                const dt = D ? new Function("state", `return (${D})(state)`)(h) : h;
                tt[$].textContent = String(dt);
              }
            }
          });
        }
      }
      d.updateType === "update" && (S || C.current?.validationKey) && o && P(
        (S || C.current?.validationKey) + "." + o.join(".")
      );
      const j = o.slice(0, o.length - 1);
      d.updateType === "cut" && C.current?.validationKey && P(
        C.current?.validationKey + "." + j.join(".")
      ), d.updateType === "insert" && C.current?.validationKey && yt(
        C.current?.validationKey + "." + j.join(".")
      ).filter(([m, h]) => {
        let A = m?.split(".").length;
        if (m == j.join(".") && A == j.length - 1) {
          let $ = m + "." + j;
          P(m), It($, h);
        }
      });
      const F = L(w, o), q = L(T, o), lt = d.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), B = r.getState().stateComponents.get(l);
      if (s == "cart" && (console.log("thisKey", l), console.log("stateEntry", B)), B)
        for (const [b, m] of B.components.entries()) {
          let h = !1;
          const A = Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"];
          if (!A.includes("none")) {
            if (A.includes("all")) {
              m.forceUpdate();
              continue;
            }
            if (A.includes("component") && m.paths && (m.paths.has(lt) || m.paths.has("")) && (h = !0), !h && A.includes("deps") && m.depsFunction) {
              const $ = m.depsFunction(T);
              typeof $ == "boolean" ? $ && (h = !0) : G(m.deps, $) || (m.deps = $, h = !0);
            }
            h && m.forceUpdate();
          }
        }
      const K = {
        timeStamp: Date.now(),
        stateKey: l,
        path: o,
        updateType: d.updateType,
        status: "new",
        oldValue: F,
        newValue: q
      };
      if (vt(l, (b) => {
        const h = [...b ?? [], K].reduce((A, $) => {
          const D = `${$.stateKey}:${JSON.stringify($.path)}`, x = A.get(D);
          return x ? (x.timeStamp = Math.max(x.timeStamp, $.timeStamp), x.newValue = $.newValue, x.oldValue = x.oldValue ?? $.oldValue, x.updateType = $.updateType) : A.set(D, { ...$ }), A;
        }, /* @__PURE__ */ new Map());
        return Array.from(h.values());
      }), Et(
        T,
        l,
        C.current,
        N
      ), p && p({
        updateLog: W,
        update: K
      }), C.current?.serverSync) {
        const b = r.getState().serverState[l], m = C.current?.serverSync;
        pt(l, {
          syncKey: typeof m.syncKey == "string" ? m.syncKey : m.syncKey({ state: T }),
          rollBackState: b,
          actionTimeStamp: Date.now() + (m.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  r.getState().updaterState[l] || (console.log("Initializing state for", l, t), J(
    l,
    Z(
      l,
      k,
      O.current,
      N
    )
  ), r.getState().cogsStateStore[l] || R(l, t), r.getState().initialStateGlobal[l] || Y(l, t));
  const n = V.useMemo(() => Z(
    l,
    k,
    O.current,
    N
  ), [l]);
  return [st(l), n];
}
function Z(t, s, u, f) {
  const g = /* @__PURE__ */ new Map();
  let p = 0;
  const _ = (c) => {
    const e = c.join(".");
    for (const [v] of g)
      (v === e || v.startsWith(e + ".")) && g.delete(v);
    p++;
  }, E = /* @__PURE__ */ new Map(), y = {
    removeValidation: (c) => {
      c?.validationKey && P(c.validationKey);
    },
    revertToInitialState: (c) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && P(e?.key), c?.validationKey && P(c.validationKey);
      const v = r.getState().initialStateGlobal[t];
      g.clear(), p++;
      const N = I(v, []);
      V.startTransition(() => {
        J(t, N), R(t, v);
        const U = r.getState().stateComponents.get(t);
        U && U.components.forEach((W) => {
          W.forceUpdate();
        });
        const l = X(t);
        l?.initState && localStorage.removeItem(
          l?.initState ? f + "-" + t + "-" + l?.initState.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (c) => {
      g.clear(), p++;
      const e = Z(
        t,
        s,
        u,
        f
      );
      return V.startTransition(() => {
        Y(t, c), J(t, e), R(t, c);
        const v = r.getState().stateComponents.get(t);
        v && v.components.forEach((N) => {
          N.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (v) => e.get()[v]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const c = r.getState().serverState[t];
      return !!(c && G(c, st(t)));
    }
  };
  function I(c, e = [], v) {
    const N = e.map(String).join(".");
    g.get(N);
    const U = {
      get(W, i) {
        if (i !== "then" && !i.startsWith("$") && i !== "stateMapNoRender") {
          const n = e.join("."), a = `${t}////${u}`, o = r.getState().stateComponents.get(t);
          if (o) {
            const d = o.components.get(a);
            d && (e.length > 0 || i === "get") && d.paths.add(n);
          }
        }
        if (i === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(t)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(n.key + "." + e.join("."));
          };
        if (Array.isArray(c)) {
          if (i === "getSelected")
            return () => {
              const n = E.get(e.join("."));
              if (n !== void 0)
                return I(
                  c[n],
                  [...e, n.toString()],
                  v
                );
            };
          if (i === "stateMap" || i === "stateMapNoRender")
            return (n) => {
              const a = v?.filtered?.some(
                (d) => d.join(".") === e.join(".")
              ), o = a ? c : r.getState().getNestedState(t, e);
              return i !== "stateMapNoRender" && (g.clear(), p++), o.map((d, S) => {
                const w = a && d.__origIndex ? d.__origIndex : S, T = I(
                  d,
                  [...e, w.toString()],
                  v
                );
                return n(
                  d,
                  T,
                  S,
                  c,
                  I(c, e, v)
                );
              });
            };
          if (i === "$stateMap")
            return (n) => V.createElement($t, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: I
            });
          if (i === "stateFlattenOn")
            return (n) => {
              const o = v?.filtered?.some(
                (S) => S.join(".") === e.join(".")
              ) ? c : r.getState().getNestedState(t, e);
              g.clear(), p++;
              const d = o.flatMap(
                (S, w) => S[n] ?? []
              );
              return I(
                d,
                [...e, "[*]", n],
                v
              );
            };
          if (i === "findWith")
            return (n, a) => {
              const o = c.findIndex(
                (w) => w[n] === a
              );
              if (o === -1) return;
              const d = c[o], S = [...e, o.toString()];
              return g.clear(), p++, g.clear(), p++, I(d, S);
            };
          if (i === "index")
            return (n) => {
              const a = c[n];
              return I(a, [...e, n.toString()]);
            };
          if (i === "insert")
            return (n) => (_(e), nt(s, n, e, t), I(
              r.getState().cogsStateStore[t],
              []
            ));
          if (i === "uniqueInsert")
            return (n, a, o) => {
              const d = r.getState().getNestedState(t, e), S = it(n) ? n(d) : n;
              let w = null;
              if (!d.some((M) => {
                if (a) {
                  const F = a.every(
                    (q) => G(M[q], S[q])
                  );
                  return F && (w = M), F;
                }
                const j = G(M, S);
                return j && (w = M), j;
              }))
                _(e), nt(s, S, e, t);
              else if (o && w) {
                const M = o(w), j = d.map(
                  (F) => G(F, w) ? M : F
                );
                _(e), z(s, j, e);
              }
            };
          if (i === "cut")
            return (n, a) => {
              a?.waitForSync || (_(e), rt(s, e, t, n));
            };
          if (i === "stateFilter")
            return (n) => {
              const a = c.map((S, w) => ({
                ...S,
                __origIndex: w.toString()
              })), o = [], d = [];
              for (let S = 0; S < a.length; S++)
                n(a[S], S) && (o.push(S), d.push(a[S]));
              return g.clear(), p++, I(d, e, {
                filtered: [...v?.filtered || [], e],
                validIndices: o
                // Pass through the meta
              });
            };
        }
        const O = e[e.length - 1];
        if (!isNaN(Number(O))) {
          const n = e.slice(0, -1), a = r.getState().getNestedState(t, n);
          if (Array.isArray(a) && i === "cut")
            return () => rt(
              s,
              n,
              t,
              Number(O)
            );
        }
        if (i === "get")
          return () => r.getState().getNestedState(t, e);
        if (i === "$derive")
          return (n) => H({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (i === "$derive")
          return (n) => H({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (i === "$get")
          return () => H({
            _stateKey: t,
            _path: e
          });
        if (i === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return r.getState().getSyncInfo(n);
        }
        if (i === "_selected") {
          const n = e.slice(0, -1), a = n.join("."), o = r.getState().getNestedState(t, n);
          return Array.isArray(o) ? Number(e[e.length - 1]) === E.get(a) : void 0;
        }
        if (i == "getLocalStorage")
          return (n) => ct(f + "-" + t + "-" + n);
        if (i === "setSelected")
          return (n) => {
            const a = e.slice(0, -1), o = Number(e[e.length - 1]), d = a.join(".");
            n ? E.set(d, o) : E.delete(d);
            const S = r.getState().getNestedState(t, [...a]);
            z(s, S, a), _(a);
          };
        if (e.length == 0) {
          if (i === "validateZodSchema")
            return () => {
              const n = r.getState().getInitialOptions(t)?.validation, a = r.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              P(n.key);
              const o = r.getState().cogsStateStore[t];
              try {
                const d = r.getState().getValidationErrors(n.key);
                d && d.length > 0 && d.forEach(([w]) => {
                  w && w.startsWith(n.key) && P(w);
                });
                const S = n.zodSchema.safeParse(o);
                return S.success ? !0 : (S.error.errors.forEach((T) => {
                  const M = T.path, j = T.message, F = [n.key, ...M].join(".");
                  a(F, j), console.log(
                    `Validation error at ${F}: ${j}`
                  );
                }), wt(t), !1);
              } catch (d) {
                return console.error("Zod schema validation failed", d), !1;
              }
            };
          if (i === "_componentId") return u;
          if (i === "getComponents")
            return () => r().stateComponents.get(t);
          if (i === "_initialState")
            return r.getState().initialStateGlobal[t];
          if (i === "_serverState")
            return r.getState().serverState[t];
          if (i === "_isLoading")
            return r.getState().isLoadingGlobal[t];
          if (i === "revertToInitialState")
            return y.revertToInitialState;
          if (i === "updateInitialState") return y.updateInitialState;
          if (i === "removeValidation") return y.removeValidation;
        }
        if (i === "validationWrapper")
          return ({
            children: n,
            hideMessage: a
          }) => /* @__PURE__ */ et.jsx(
            gt,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: r.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: v?.validIndices,
              children: n
            }
          );
        if (i === "_stateKey") return t;
        if (i === "_path") return e;
        if (i === "_isServerSynced") return y._isServerSynced;
        if (i === "update")
          return (n, a) => {
            if (a?.debounce)
              ft(() => {
                z(s, n, e, "");
                const o = r.getState().getNestedState(t, e);
                a?.afterUpdate && a.afterUpdate(o);
              }, a.debounce);
            else {
              z(s, n, e, "");
              const o = r.getState().getNestedState(t, e);
              a?.afterUpdate && a.afterUpdate(o);
            }
            _(e);
          };
        if (i === "formElement")
          return (n, a) => /* @__PURE__ */ et.jsx(
            St,
            {
              setState: s,
              stateKey: t,
              path: e,
              child: n,
              formOpts: a
            }
          );
        const C = [...e, i], k = r.getState().getNestedState(t, C);
        return I(k, C, v);
      }
    }, l = new Proxy(y, U);
    return g.set(N, {
      proxy: l,
      stateVersion: p
    }), l;
  }
  return I(
    r.getState().getNestedState(t, [])
  );
}
function H(t) {
  return V.createElement(Nt, { proxy: t });
}
function $t({
  proxy: t,
  rebuildStateShape: s
}) {
  const u = r().getNestedState(t._stateKey, t._path);
  return console.log("value", u), Array.isArray(u) ? s(
    u,
    t._path
  ).stateMapNoRender(
    (g, p, _, E, y) => t._mapFn(g, p, _, E, y)
  ) : null;
}
function Nt({
  proxy: t
}) {
  const s = V.useRef(null), u = `${t._stateKey}-${t._path.join(".")}`;
  return V.useEffect(() => {
    const f = s.current;
    if (!f || !f.parentElement) return;
    const g = f.parentElement, _ = Array.from(g.childNodes).indexOf(f);
    let E = g.getAttribute("data-parent-id");
    E || (E = `parent-${crypto.randomUUID()}`, g.setAttribute("data-parent-id", E));
    const I = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: E,
      position: _,
      effect: t._effect
    };
    r.getState().addSignalElement(u, I);
    const c = r.getState().getNestedState(t._stateKey, t._path);
    let e;
    if (t._effect)
      try {
        e = new Function(
          "state",
          `return (${t._effect})(state)`
        )(c);
      } catch (N) {
        console.error("Error evaluating effect function during mount:", N), e = c;
      }
    else
      e = c;
    e !== null && typeof e == "object" && (e = JSON.stringify(e));
    const v = document.createTextNode(String(e));
    f.replaceWith(v);
  }, [t._stateKey, t._path.join("."), t._effect]), V.createElement("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": u
  });
}
function Pt(t) {
  const s = V.useSyncExternalStore(
    (u) => {
      const f = r.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return f.components.set(t._stateKey, {
        forceUpdate: u,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => f.components.delete(t._stateKey);
    },
    () => r.getState().getNestedState(t._stateKey, t._path)
  );
  return V.createElement("text", {}, String(s));
}
export {
  H as $cogsSignal,
  Pt as $cogsSignalStore,
  bt as createCogsState,
  Vt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
