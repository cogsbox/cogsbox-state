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
const Pt = (t, s) => {
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
    const l = r.getState().cogsStateStore[E] || f[E], e = y?.modifyState ? y.modifyState(l) : l, [v, h] = Vt(
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
    return h;
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
  removeValidationError: U,
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
  syncUpdate: l
} = {}) {
  const [e, v] = V.useState({}), { sessionId: h } = mt();
  let b = !s;
  const [c] = V.useState(s ?? Q()), W = r.getState().stateLog[c], i = V.useRef(/* @__PURE__ */ new Set()), O = V.useRef(y ?? Q()), C = V.useRef(null);
  C.current = X(c), V.useEffect(() => {
    if (l && l.stateKey === c && l.path?.[0]) {
      R(c, (o) => ({
        ...o,
        [l.path[0]]: l.newValue
      }));
      const a = `${l.stateKey}:${l.path.join(".")}`;
      r.getState().setSyncInfo(a, {
        timeStamp: l.timeStamp,
        userId: l.userId
      });
    }
  }, [l]), V.useEffect(() => {
    at(c, {
      initState: I
    });
    const a = ct(
      h + "-" + c + "-" + I?.localStorageKey
    );
    let o = null;
    I?.initialState && (o = I?.initialState, a && a.lastUpdated > (a.lastSyncedWithServer || 0) && (o = a.state), _t(
      c,
      I?.initialState,
      o,
      k,
      O.current,
      h
    )), v({});
  }, [I?.localStorageKey, ...I?.dependencies || []]), V.useLayoutEffect(() => {
    b && at(c, {
      serverSync: u,
      formElements: g,
      initState: I,
      localStorage: f,
      middleware: p
    });
    const a = `${c}////${O.current}`, o = r.getState().stateComponents.get(c) || {
      components: /* @__PURE__ */ new Map()
    };
    return o.components.set(a, {
      forceUpdate: () => v({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: _ || void 0,
      reactiveType: E ?? ["component", "deps"]
    }), r.getState().stateComponents.set(c, o), v({}), () => {
      const d = `${c}////${O.current}`;
      o && (o.components.delete(d), o.components.size === 0 && r.getState().stateComponents.delete(c));
    };
  }, []);
  const k = (a, o, d, S) => {
    if (Array.isArray(o)) {
      const w = `${c}-${o.join(".")}`;
      i.current.add(w);
    }
    R(c, (w) => {
      const T = it(a) ? a(w) : a, x = `${c}-${o.join(".")}`;
      if (x) {
        let P = !1, m = r.getState().signalDomElements.get(x);
        if ((!m || m.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const N = o.slice(0, -1), A = L(T, N);
          if (Array.isArray(A)) {
            P = !0;
            const $ = `${c}-${N.join(".")}`;
            m = r.getState().signalDomElements.get($);
          }
        }
        if (m) {
          const N = P ? L(T, o.slice(0, -1)) : L(T, o);
          m.forEach(({ parentId: A, position: $, effect: D }) => {
            const F = document.querySelector(
              `[data-parent-id="${A}"]`
            );
            if (F) {
              const tt = Array.from(F.childNodes);
              if (tt[$]) {
                const dt = D ? new Function("state", `return (${D})(state)`)(N) : N;
                tt[$].textContent = String(dt);
              }
            }
          });
        }
      }
      d.updateType === "update" && (S || C.current?.validationKey) && o && U(
        (S || C.current?.validationKey) + "." + o.join(".")
      );
      const j = o.slice(0, o.length - 1);
      d.updateType === "cut" && C.current?.validationKey && U(
        C.current?.validationKey + "." + j.join(".")
      ), d.updateType === "insert" && C.current?.validationKey && yt(
        C.current?.validationKey + "." + j.join(".")
      ).filter(([m, N]) => {
        let A = m?.split(".").length;
        if (m == j.join(".") && A == j.length - 1) {
          let $ = m + "." + j;
          U(m), It($, N);
        }
      });
      const M = L(w, o), q = L(T, o), lt = d.updateType === "update" ? o.join(".") : [...o].slice(0, -1).join("."), B = r.getState().stateComponents.get(c);
      if (s == "cart" && (console.log("thisKey", c), console.log("stateEntry", B)), B)
        for (const [P, m] of B.components.entries()) {
          let N = !1;
          const A = Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"];
          if (!A.includes("none")) {
            if (A.includes("all")) {
              m.forceUpdate();
              continue;
            }
            if (A.includes("component") && m.paths && (m.paths.has(lt) || m.paths.has("")) && (N = !0), !N && A.includes("deps") && m.depsFunction) {
              const $ = m.depsFunction(T);
              typeof $ == "boolean" ? $ && (N = !0) : G(m.deps, $) || (m.deps = $, N = !0);
            }
            N && m.forceUpdate();
          }
        }
      const K = {
        timeStamp: Date.now(),
        stateKey: c,
        path: o,
        updateType: d.updateType,
        status: "new",
        oldValue: M,
        newValue: q
      };
      if (vt(c, (P) => {
        const N = [...P ?? [], K].reduce((A, $) => {
          const D = `${$.stateKey}:${JSON.stringify($.path)}`, F = A.get(D);
          return F ? (F.timeStamp = Math.max(F.timeStamp, $.timeStamp), F.newValue = $.newValue, F.oldValue = F.oldValue ?? $.oldValue, F.updateType = $.updateType) : A.set(D, { ...$ }), A;
        }, /* @__PURE__ */ new Map());
        return Array.from(N.values());
      }), Et(
        T,
        c,
        C.current,
        h
      ), p && p({
        updateLog: W,
        update: K
      }), C.current?.serverSync) {
        const P = r.getState().serverState[c], m = C.current?.serverSync;
        pt(c, {
          syncKey: typeof m.syncKey == "string" ? m.syncKey : m.syncKey({ state: T }),
          rollBackState: P,
          actionTimeStamp: Date.now() + (m.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return T;
    });
  };
  r.getState().updaterState[c] || (console.log("Initializing state for", c, t), J(
    c,
    Z(
      c,
      k,
      O.current,
      h
    )
  ), r.getState().cogsStateStore[c] || R(c, t), r.getState().initialStateGlobal[c] || Y(c, t));
  const n = V.useMemo(() => Z(
    c,
    k,
    O.current,
    h
  ), [c]);
  return [st(c), n];
}
function Z(t, s, u, f) {
  const g = /* @__PURE__ */ new Map();
  let p = 0;
  const _ = (l) => {
    const e = l.join(".");
    for (const [v] of g)
      (v === e || v.startsWith(e + ".")) && g.delete(v);
    p++;
  }, E = /* @__PURE__ */ new Map(), y = {
    removeValidation: (l) => {
      l?.validationKey && U(l.validationKey);
    },
    revertToInitialState: (l) => {
      const e = r.getState().getInitialOptions(t)?.validation;
      e?.key && U(e?.key), l?.validationKey && U(l.validationKey);
      const v = r.getState().initialStateGlobal[t];
      g.clear(), p++;
      const h = I(v, []);
      V.startTransition(() => {
        J(t, h), R(t, v);
        const b = r.getState().stateComponents.get(t);
        b && b.components.forEach((W) => {
          W.forceUpdate();
        });
        const c = X(t);
        c?.initState && localStorage.removeItem(
          c?.initState ? f + "-" + t + "-" + c?.initState.localStorageKey : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (l) => {
      g.clear(), p++;
      const e = Z(
        t,
        s,
        u,
        f
      );
      return V.startTransition(() => {
        Y(t, l), J(t, e), R(t, l);
        const v = r.getState().stateComponents.get(t);
        v && v.components.forEach((h) => {
          h.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (v) => e.get()[v]
      };
    },
    _initialState: r.getState().initialStateGlobal[t],
    _serverState: r.getState().serverState[t],
    _isLoading: r.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const l = r.getState().serverState[t];
      return !!(l && G(l, st(t)));
    }
  };
  function I(l, e = [], v) {
    const h = e.map(String).join(".");
    g.get(h);
    const b = {
      get(W, i) {
        if (i !== "then" && !i.startsWith("$") && i !== "stateMapNoRender") {
          const n = e.join("."), a = `${t}////${u}`, o = r.getState().stateComponents.get(t);
          if (console.log("component ", a), o) {
            const d = o.components.get(a);
            console.log("component ", t, a, o), d && (e.length > 0 || i === "get") && d.paths.add(n);
          }
        }
        if (i === "showValidationErrors")
          return () => {
            const n = r.getState().getInitialOptions(t)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return r.getState().getValidationErrors(n.key + "." + e.join("."));
          };
        if (Array.isArray(l)) {
          if (i === "getSelected")
            return () => {
              const n = E.get(e.join("."));
              if (n !== void 0)
                return I(
                  l[n],
                  [...e, n.toString()],
                  v
                );
            };
          if (i === "stateMap" || i === "stateMapNoRender")
            return (n) => {
              const a = v?.filtered?.some(
                (d) => d.join(".") === e.join(".")
              ), o = a ? l : r.getState().getNestedState(t, e);
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
                  l,
                  I(l, e, v)
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
              ) ? l : r.getState().getNestedState(t, e);
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
              const o = l.findIndex(
                (w) => w[n] === a
              );
              if (o === -1) return;
              const d = l[o], S = [...e, o.toString()];
              return g.clear(), p++, g.clear(), p++, I(d, S);
            };
          if (i === "index")
            return (n) => {
              const a = l[n];
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
              if (!d.some((x) => {
                if (a) {
                  const M = a.every(
                    (q) => G(x[q], S[q])
                  );
                  return M && (w = x), M;
                }
                const j = G(x, S);
                return j && (w = x), j;
              }))
                _(e), nt(s, S, e, t);
              else if (o && w) {
                const x = o(w), j = d.map(
                  (M) => G(M, w) ? x : M
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
              const a = l.map((S, w) => ({
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
              U(n.key);
              const o = r.getState().cogsStateStore[t];
              try {
                const d = r.getState().getValidationErrors(n.key);
                d && d.length > 0 && d.forEach(([w]) => {
                  w && w.startsWith(n.key) && U(w);
                });
                const S = n.zodSchema.safeParse(o);
                return S.success ? !0 : (S.error.errors.forEach((T) => {
                  const x = T.path, j = T.message, M = [n.key, ...x].join(".");
                  a(M, j), console.log(
                    `Validation error at ${M}: ${j}`
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
    }, c = new Proxy(y, b);
    return g.set(h, {
      proxy: c,
      stateVersion: p
    }), c;
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
    const l = r.getState().getNestedState(t._stateKey, t._path), e = document.createTextNode(String(l));
    f.replaceWith(e);
  }, [t._stateKey, t._path.join("."), t._effect]), V.createElement("span", {
    ref: s,
    style: { display: "none" },
    "data-signal-id": u
  });
}
function Ut(t) {
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
  Ut as $cogsSignalStore,
  Pt as createCogsState,
  Vt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
