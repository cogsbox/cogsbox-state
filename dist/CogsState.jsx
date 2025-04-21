"use client";
import { jsx as it } from "react/jsx-runtime";
import { useState as Y, useRef as z, useEffect as K, useLayoutEffect as vt, useMemo as It, createElement as H, useSyncExternalStore as Et, startTransition as J } from "react";
import { transformStateFunc as pt, isFunction as ft, getNestedValue as L, isDeepEqual as G, debounce as _t } from "./utility.js";
import { pushFunc as st, updateFn as q, cutFunc as ct, ValidationWrapper as wt, FormControlComponent as Nt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as a, formRefStore as lt } from "./store.js";
import { useCogsConfig as Vt } from "./CogsStateClient.jsx";
import tt from "./node_modules/uuid/dist/esm-browser/v4.js";
function dt(t, i) {
  const f = a.getState().getInitialOptions, u = a.getState().setInitialStateOptions, l = f(t) || {};
  u(t, {
    ...l,
    ...i
  });
}
function ut({
  stateKey: t,
  options: i,
  initialOptionsPart: f
}) {
  const u = et(t) || {}, l = f[t] || {}, p = a.getState().setInitialStateOptions, w = { ...l, ...u };
  let v = !1;
  if (i)
    for (const m in i)
      w.hasOwnProperty(m) || (v = !0, w[m] = i[m]);
  v && p(t, w);
}
function Wt(t, { formElements: i, validation: f }) {
  return { initialState: t, formElements: i, validation: f };
}
const qt = (t, i) => {
  let f = t;
  const [u, l] = pt(f);
  (i?.formElements || i?.validation) && Object.keys(l).forEach((v) => {
    l[v] = l[v] || {}, l[v].formElements = {
      ...i.formElements,
      // Global defaults first
      ...i?.validation,
      ...l[v].formElements || {}
      // State-specific overrides
    };
  }), a.getState().setInitialStates(u);
  const p = (v, m) => {
    const [_] = Y(m?.componentId ?? tt());
    ut({
      stateKey: v,
      options: m,
      initialOptionsPart: l
    });
    const s = a.getState().cogsStateStore[v] || u[v], e = m?.modifyState ? m.modifyState(s) : s, [I, V] = Ot(
      e,
      {
        stateKey: v,
        syncUpdate: m?.syncUpdate,
        componentId: _,
        localStorage: m?.localStorage,
        middleware: m?.middleware,
        enabledSync: m?.enabledSync,
        reactiveType: m?.reactiveType,
        reactiveDeps: m?.reactiveDeps,
        initState: m?.initState
      }
    );
    return V;
  };
  function w(v, m) {
    ut({ stateKey: v, options: m, initialOptionsPart: l });
  }
  return { useCogsState: p, setCogsOptions: w };
}, {
  setUpdaterState: B,
  setState: x,
  getInitialOptions: et,
  getKeyState: gt,
  getValidationErrors: $t,
  setStateLog: ht,
  updateInitialStateGlobal: nt,
  addValidationError: At,
  removeValidationError: M,
  setServerSyncActions: Ct
} = a.getState(), St = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Tt = (t, i, f, u) => {
  if (f.localStorage?.key && u) {
    const l = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: a.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: a.getState().serverState[i]
    }, p = `${u}-${i}-${f.localStorage?.key}`;
    window.localStorage.setItem(p, JSON.stringify(l));
  }
}, Ft = (t, i, f, u, l, p) => {
  const w = {
    initialState: i,
    updaterState: Z(
      t,
      u,
      l,
      p
    ),
    state: f
  };
  J(() => {
    nt(t, w.initialState), B(t, w.updaterState), x(t, w.state);
  });
}, mt = (t) => {
  const i = a.getState().stateComponents.get(t);
  if (!i) return;
  const f = /* @__PURE__ */ new Set();
  i.components.forEach((u) => {
    f.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    J(() => {
      f.forEach((u) => u());
    });
  });
}, zt = (t, i) => {
  const f = a.getState().stateComponents.get(t);
  if (f) {
    const u = `${t}////${i}`, l = f.components.get(u);
    l && l.forceUpdate();
  }
};
function Ot(t, {
  stateKey: i,
  serverSync: f,
  localStorage: u,
  formElements: l,
  middleware: p,
  reactiveDeps: w,
  reactiveType: v,
  componentId: m,
  initState: _,
  syncUpdate: s
} = {}) {
  const [e, I] = Y({}), { sessionId: V } = Vt();
  let k = !i;
  const [c] = Y(i ?? tt()), U = a.getState().stateLog[c], P = z(/* @__PURE__ */ new Set()), o = z(m ?? tt()), $ = z(null);
  $.current = et(c), K(() => {
    if (s && s.stateKey === c && s.path?.[0]) {
      x(c, (r) => ({
        ...r,
        [s.path[0]]: s.newValue
      }));
      const n = `${s.stateKey}:${s.path.join(".")}`;
      a.getState().setSyncInfo(n, {
        timeStamp: s.timeStamp,
        userId: s.userId
      });
    }
  }, [s]), K(() => {
    dt(c, {
      initState: _
    });
    let n = null;
    $.current?.localStorage?.key && (n = St(
      V + "-" + c + "-" + $.current?.localStorage?.key
    ));
    let r = null;
    _?.initialState && (r = _?.initialState, n && n.lastUpdated > (n.lastSyncedWithServer || 0) && (r = n.state), Ft(
      c,
      _?.initialState,
      r,
      R,
      o.current,
      V
    ), mt(c), I({}));
  }, [u?.key, ..._?.dependencies || []]), vt(() => {
    k && dt(c, {
      serverSync: f,
      formElements: l,
      initState: _,
      localStorage: u,
      middleware: p
    });
    const n = `${c}////${o.current}`, r = a.getState().stateComponents.get(c) || {
      components: /* @__PURE__ */ new Map()
    };
    return r.components.set(n, {
      forceUpdate: () => I({}),
      paths: /* @__PURE__ */ new Set(),
      deps: [],
      depsFunction: w || void 0,
      reactiveType: v ?? ["component", "deps"]
    }), a.getState().stateComponents.set(c, r), I({}), () => {
      const d = `${c}////${o.current}`;
      r && (r.components.delete(d), r.components.size === 0 && a.getState().stateComponents.delete(c));
    };
  }, []);
  const R = (n, r, d, g) => {
    if (Array.isArray(r)) {
      const S = `${c}-${r.join(".")}`;
      P.current.add(S);
    }
    x(c, (S) => {
      const E = ft(n) ? n(S) : n, O = `${c}-${r.join(".")}`;
      if (O) {
        let b = !1, y = a.getState().signalDomElements.get(O);
        if ((!y || y.size === 0) && (d.updateType === "insert" || d.updateType === "cut")) {
          const h = r.slice(0, -1), C = L(E, h);
          if (Array.isArray(C)) {
            b = !0;
            const N = `${c}-${h.join(".")}`;
            y = a.getState().signalDomElements.get(N);
          }
        }
        if (y) {
          const h = b ? L(E, r.slice(0, -1)) : L(E, r);
          y.forEach(({ parentId: C, position: N, effect: D }) => {
            const T = document.querySelector(
              `[data-parent-id="${C}"]`
            );
            if (T) {
              const ot = Array.from(T.childNodes);
              if (ot[N]) {
                const yt = D ? new Function("state", `return (${D})(state)`)(h) : h;
                ot[N].textContent = String(yt);
              }
            }
          });
        }
      }
      d.updateType === "update" && (g || $.current?.validationKey) && r && M(
        (g || $.current?.validationKey) + "." + r.join(".")
      );
      const A = r.slice(0, r.length - 1);
      d.updateType === "cut" && $.current?.validationKey && M(
        $.current?.validationKey + "." + A.join(".")
      ), d.updateType === "insert" && $.current?.validationKey && $t(
        $.current?.validationKey + "." + A.join(".")
      ).filter(([y, h]) => {
        let C = y?.split(".").length;
        if (y == A.join(".") && C == A.length - 1) {
          let N = y + "." + A;
          M(y), At(N, h);
        }
      });
      const j = L(S, r), F = L(E, r), W = d.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), rt = a.getState().stateComponents.get(c);
      if (rt)
        for (const [b, y] of rt.components.entries()) {
          let h = !1;
          const C = Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"];
          if (!C.includes("none")) {
            if (C.includes("all")) {
              y.forceUpdate();
              continue;
            }
            if (C.includes("component") && y.paths && (y.paths.has(W) || y.paths.has("")) && (h = !0), !h && C.includes("deps") && y.depsFunction) {
              const N = y.depsFunction(E);
              typeof N == "boolean" ? N && (h = !0) : G(y.deps, N) || (y.deps = N, h = !0);
            }
            h && y.forceUpdate();
          }
        }
      const at = {
        timeStamp: Date.now(),
        stateKey: c,
        path: r,
        updateType: d.updateType,
        status: "new",
        oldValue: j,
        newValue: F
      };
      if (ht(c, (b) => {
        const h = [...b ?? [], at].reduce((C, N) => {
          const D = `${N.stateKey}:${JSON.stringify(N.path)}`, T = C.get(D);
          return T ? (T.timeStamp = Math.max(T.timeStamp, N.timeStamp), T.newValue = N.newValue, T.oldValue = T.oldValue ?? N.oldValue, T.updateType = N.updateType) : C.set(D, { ...N }), C;
        }, /* @__PURE__ */ new Map());
        return Array.from(h.values());
      }), Tt(
        E,
        c,
        $.current,
        V
      ), p && p({
        updateLog: U,
        update: at
      }), $.current?.serverSync) {
        const b = a.getState().serverState[c], y = $.current?.serverSync;
        Ct(c, {
          syncKey: typeof y.syncKey == "string" ? y.syncKey : y.syncKey({ state: E }),
          rollBackState: b,
          actionTimeStamp: Date.now() + (y.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return E;
    });
  };
  a.getState().updaterState[c] || (B(
    c,
    Z(
      c,
      R,
      o.current,
      V
    )
  ), a.getState().cogsStateStore[c] || x(c, t), a.getState().initialStateGlobal[c] || nt(c, t));
  const Q = It(() => Z(
    c,
    R,
    o.current,
    V
  ), [c]);
  return [gt(c), Q];
}
function Z(t, i, f, u) {
  const l = /* @__PURE__ */ new Map();
  let p = 0;
  const w = (s) => {
    const e = s.join(".");
    for (const [I] of l)
      (I === e || I.startsWith(e + ".")) && l.delete(I);
    p++;
  }, v = /* @__PURE__ */ new Map(), m = {
    removeValidation: (s) => {
      s?.validationKey && M(s.validationKey);
    },
    revertToInitialState: (s) => {
      const e = a.getState().getInitialOptions(t)?.validation;
      e?.key && M(e?.key), s?.validationKey && M(s.validationKey);
      const I = a.getState().initialStateGlobal[t];
      l.clear(), p++;
      const V = _(I, []);
      J(() => {
        B(t, V), x(t, I);
        const k = a.getState().stateComponents.get(t);
        k && k.components.forEach((U) => {
          U.forceUpdate();
        });
        const c = et(t);
        c?.localStorage?.key && localStorage.removeItem(
          c?.initState ? u + "-" + t + "-" + c?.localStorage?.key : t
        ), localStorage.removeItem(t);
      });
    },
    updateInitialState: (s) => {
      l.clear(), p++;
      const e = Z(
        t,
        i,
        f,
        u
      );
      return J(() => {
        nt(t, s), B(t, e), x(t, s);
        const I = a.getState().stateComponents.get(t);
        I && I.components.forEach((V) => {
          V.forceUpdate();
        }), localStorage.removeItem(t);
      }), {
        fetchId: (I) => e.get()[I]
      };
    },
    _initialState: a.getState().initialStateGlobal[t],
    _serverState: a.getState().serverState[t],
    _isLoading: a.getState().isLoadingGlobal[t],
    _isServerSynced: () => {
      const s = a.getState().serverState[t];
      return !!(s && G(s, gt(t)));
    }
  };
  function _(s, e = [], I) {
    const V = e.map(String).join(".");
    l.get(V);
    const k = function() {
      return a().getNestedState(t, e);
    };
    Object.keys(m).forEach((P) => {
      k[P] = m[P];
    });
    const c = {
      apply(P, o, $) {
        return a().getNestedState(t, e);
      },
      get(P, o) {
        if (o !== "then" && !o.startsWith("$") && o !== "stateMapNoRender") {
          const n = e.join("."), r = `${t}////${f}`, d = a.getState().stateComponents.get(t);
          if (d) {
            const g = d.components.get(r);
            g && (e.length > 0 || o === "get") && g.paths.add(n);
          }
        }
        if (o === "showValidationErrors")
          return () => {
            const n = a.getState().getInitialOptions(t)?.validation;
            if (!n?.key)
              throw new Error("Validation key not found");
            return a.getState().getValidationErrors(n.key + "." + e.join("."));
          };
        if (Array.isArray(s)) {
          if (o === "getSelected")
            return () => {
              const n = v.get(e.join("."));
              if (n !== void 0)
                return _(
                  s[n],
                  [...e, n.toString()],
                  I
                );
            };
          if (o === "stateMap" || o === "stateMapNoRender")
            return (n) => {
              const r = I?.filtered?.some(
                (g) => g.join(".") === e.join(".")
              ), d = r ? s : a.getState().getNestedState(t, e);
              return o !== "stateMapNoRender" && (l.clear(), p++), d.map((g, S) => {
                const E = r && g.__origIndex ? g.__origIndex : S, O = _(
                  g,
                  [...e, E.toString()],
                  I
                );
                return n(
                  g,
                  O,
                  S,
                  s,
                  _(s, e, I)
                );
              });
            };
          if (o === "$stateMap")
            return (n) => H(jt, {
              proxy: {
                _stateKey: t,
                _path: e,
                _mapFn: n
                // Pass the actual function, not string
              },
              rebuildStateShape: _
            });
          if (o === "stateFlattenOn")
            return (n) => {
              const d = I?.filtered?.some(
                (S) => S.join(".") === e.join(".")
              ) ? s : a.getState().getNestedState(t, e);
              l.clear(), p++;
              const g = d.flatMap(
                (S, E) => S[n] ?? []
              );
              return _(
                g,
                [...e, "[*]", n],
                I
              );
            };
          if (o === "findWith")
            return (n, r) => {
              const d = s.findIndex(
                (E) => E[n] === r
              );
              if (d === -1) return;
              const g = s[d], S = [...e, d.toString()];
              return l.clear(), p++, l.clear(), p++, _(g, S);
            };
          if (o === "index")
            return (n) => {
              const r = s[n];
              return _(r, [...e, n.toString()]);
            };
          if (o === "insert")
            return (n) => (w(e), st(i, n, e, t), _(
              a.getState().cogsStateStore[t],
              []
            ));
          if (o === "uniqueInsert")
            return (n, r, d) => {
              const g = a.getState().getNestedState(t, e), S = ft(n) ? n(g) : n;
              let E = null;
              if (!g.some((A) => {
                if (r) {
                  const F = r.every(
                    (W) => G(A[W], S[W])
                  );
                  return F && (E = A), F;
                }
                const j = G(A, S);
                return j && (E = A), j;
              }))
                w(e), st(i, S, e, t);
              else if (d && E) {
                const A = d(E), j = g.map(
                  (F) => G(F, E) ? A : F
                );
                w(e), q(i, j, e);
              }
            };
          if (o === "cut")
            return (n, r) => {
              r?.waitForSync || (w(e), ct(i, e, t, n));
            };
          if (o === "stateFilter")
            return (n) => {
              const r = s.map((S, E) => ({
                ...S,
                __origIndex: E.toString()
              })), d = [], g = [];
              for (let S = 0; S < r.length; S++)
                n(r[S], S) && (d.push(S), g.push(r[S]));
              return l.clear(), p++, _(g, e, {
                filtered: [...I?.filtered || [], e],
                validIndices: d
                // Always pass validIndices, even if empty
              });
            };
        }
        const $ = e[e.length - 1];
        if (!isNaN(Number($))) {
          const n = e.slice(0, -1), r = a.getState().getNestedState(t, n);
          if (Array.isArray(r) && o === "cut")
            return () => ct(
              i,
              n,
              t,
              Number($)
            );
        }
        if (o === "get")
          return () => a.getState().getNestedState(t, e);
        if (o === "$derive")
          return (n) => X({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (o === "$derive")
          return (n) => X({
            _stateKey: t,
            _path: e,
            _effect: n.toString()
          });
        if (o === "$get")
          return () => X({
            _stateKey: t,
            _path: e
          });
        if (o === "lastSynced") {
          const n = `${t}:${e.join(".")}`;
          return a.getState().getSyncInfo(n);
        }
        if (o === "_selected") {
          const n = e.slice(0, -1), r = n.join("."), d = a.getState().getNestedState(t, n);
          return Array.isArray(d) ? Number(e[e.length - 1]) === v.get(r) : void 0;
        }
        if (o == "getLocalStorage")
          return (n) => St(u + "-" + t + "-" + n);
        if (o === "setSelected")
          return (n) => {
            const r = e.slice(0, -1), d = Number(e[e.length - 1]), g = r.join(".");
            n ? v.set(g, d) : v.delete(g);
            const S = a.getState().getNestedState(t, [...r]);
            q(i, S, r), w(r);
          };
        if (e.length == 0) {
          if (o === "validateZodSchema")
            return () => {
              const n = a.getState().getInitialOptions(t)?.validation, r = a.getState().addValidationError;
              if (!n?.zodSchema)
                throw new Error("Zod schema not found");
              if (!n?.key)
                throw new Error("Validation key not found");
              M(n.key);
              const d = a.getState().cogsStateStore[t];
              try {
                const g = a.getState().getValidationErrors(n.key);
                g && g.length > 0 && g.forEach(([E]) => {
                  E && E.startsWith(n.key) && M(E);
                });
                const S = n.zodSchema.safeParse(d);
                return S.success ? !0 : (S.error.errors.forEach((O) => {
                  const A = O.path, j = O.message, F = [n.key, ...A].join(".");
                  r(F, j);
                }), mt(t), !1);
              } catch (g) {
                return console.error("Zod schema validation failed", g), !1;
              }
            };
          if (o === "_componentId") return f;
          if (o === "getComponents")
            return () => a().stateComponents.get(t);
          if (o === "getAllFormRefs")
            return () => lt.getState().getFormRefsByStateKey(t);
          if (o === "_initialState")
            return a.getState().initialStateGlobal[t];
          if (o === "_serverState")
            return a.getState().serverState[t];
          if (o === "_isLoading")
            return a.getState().isLoadingGlobal[t];
          if (o === "revertToInitialState")
            return m.revertToInitialState;
          if (o === "updateInitialState") return m.updateInitialState;
          if (o === "removeValidation") return m.removeValidation;
        }
        if (o === "getFormRef")
          return () => lt.getState().getFormRef(t + "." + e.join("."));
        if (o === "validationWrapper")
          return ({
            children: n,
            hideMessage: r
          }) => /* @__PURE__ */ it(
            wt,
            {
              formOpts: r ? { validation: { message: "" } } : void 0,
              path: e,
              validationKey: a.getState().getInitialOptions(t)?.validation?.key || "",
              stateKey: t,
              validIndices: I?.validIndices,
              children: n
            }
          );
        if (o === "_stateKey") return t;
        if (o === "_path") return e;
        if (o === "_isServerSynced") return m._isServerSynced;
        if (o === "update")
          return (n, r) => {
            if (r?.debounce)
              _t(() => {
                q(i, n, e, "");
                const d = a.getState().getNestedState(t, e);
                r?.afterUpdate && r.afterUpdate(d);
              }, r.debounce);
            else {
              q(i, n, e, "");
              const d = a.getState().getNestedState(t, e);
              r?.afterUpdate && r.afterUpdate(d);
            }
            w(e);
          };
        if (o === "formElement")
          return (n, r) => /* @__PURE__ */ it(
            Nt,
            {
              setState: i,
              stateKey: t,
              path: e,
              child: n,
              formOpts: r
            }
          );
        const R = [...e, o], Q = a.getState().getNestedState(t, R);
        return _(Q, R, I);
      }
    }, U = new Proxy(k, c);
    return l.set(V, {
      proxy: U,
      stateVersion: p
    }), U;
  }
  return _(
    a.getState().getNestedState(t, [])
  );
}
function X(t) {
  return H(bt, { proxy: t });
}
function jt({
  proxy: t,
  rebuildStateShape: i
}) {
  const f = a().getNestedState(t._stateKey, t._path);
  return Array.isArray(f) ? i(
    f,
    t._path
  ).stateMapNoRender(
    (l, p, w, v, m) => t._mapFn(l, p, w, v, m)
  ) : null;
}
function bt({
  proxy: t
}) {
  const i = z(null), f = `${t._stateKey}-${t._path.join(".")}`;
  return K(() => {
    const u = i.current;
    if (!u || !u.parentElement) return;
    const l = u.parentElement, w = Array.from(l.childNodes).indexOf(u);
    let v = l.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, l.setAttribute("data-parent-id", v));
    const _ = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: w,
      effect: t._effect
    };
    a.getState().addSignalElement(f, _);
    const s = a.getState().getNestedState(t._stateKey, t._path);
    let e;
    if (t._effect)
      try {
        e = new Function(
          "state",
          `return (${t._effect})(state)`
        )(s);
      } catch (V) {
        console.error("Error evaluating effect function during mount:", V), e = s;
      }
    else
      e = s;
    e !== null && typeof e == "object" && (e = JSON.stringify(e));
    const I = document.createTextNode(String(e));
    u.replaceWith(I);
  }, [t._stateKey, t._path.join("."), t._effect]), H("span", {
    ref: i,
    style: { display: "none" },
    "data-signal-id": f
  });
}
function Jt(t) {
  const i = Et(
    (f) => {
      const u = a.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(t._stateKey, {
        forceUpdate: f,
        paths: /* @__PURE__ */ new Set([t._path.join(".")])
      }), () => u.components.delete(t._stateKey);
    },
    () => a.getState().getNestedState(t._stateKey, t._path)
  );
  return H("text", {}, String(i));
}
export {
  X as $cogsSignal,
  Jt as $cogsSignalStore,
  Wt as addStateOptions,
  qt as createCogsState,
  zt as notifyComponent,
  Ot as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
