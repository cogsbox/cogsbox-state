"use client";
import { jsx as it } from "react/jsx-runtime";
import { useState as Y, useRef as z, useEffect as K, useLayoutEffect as vt, useMemo as It, createElement as H, useSyncExternalStore as pt, startTransition as J } from "react";
import { transformStateFunc as Et, isFunction as ft, getNestedValue as L, isDeepEqual as G, debounce as _t } from "./utility.js";
import { pushFunc as st, updateFn as q, cutFunc as ct, ValidationWrapper as wt, FormControlComponent as Nt } from "./Functions.jsx";
import "zod";
import { getGlobalStore as a, formRefStore as lt } from "./store.js";
import { useCogsConfig as Vt } from "./CogsStateClient.jsx";
import tt from "./node_modules/uuid/dist/esm-browser/v4.js";
function dt(t, i) {
  const S = a.getState().getInitialOptions, u = a.getState().setInitialStateOptions, d = S(t) || {};
  u(t, {
    ...d,
    ...i
  });
}
function ut({
  stateKey: t,
  options: i,
  initialOptionsPart: S
}) {
  const u = et(t) || {}, d = S[t] || {}, E = a.getState().setInitialStateOptions, w = { ...d, ...u };
  let v = !1;
  if (i)
    for (const m in i)
      w.hasOwnProperty(m) || (v = !0, w[m] = i[m]);
  v && E(t, w);
}
function Wt(t, { formElements: i, validation: S }) {
  return { initialState: t, formElements: i, validation: S };
}
const qt = (t, i) => {
  let S = t;
  const [u, d] = Et(S);
  (i?.formElements || i?.validation) && Object.keys(d).forEach((v) => {
    d[v] = d[v] || {}, d[v].formElements = {
      ...i.formElements,
      // Global defaults first
      ...i?.validation,
      ...d[v].formElements || {}
      // State-specific overrides
    };
  }), a.getState().setInitialStates(u);
  const E = (v, m) => {
    const [_] = Y(m?.componentId ?? tt());
    ut({
      stateKey: v,
      options: m,
      initialOptionsPart: d
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
    ut({ stateKey: v, options: m, initialOptionsPart: d });
  }
  return { useCogsState: E, setCogsOptions: w };
}, {
  setUpdaterState: B,
  setState: x,
  getInitialOptions: et,
  getKeyState: gt,
  getValidationErrors: $t,
  setStateLog: ht,
  updateInitialStateGlobal: nt,
  addValidationError: Tt,
  removeValidationError: M,
  setServerSyncActions: At
} = a.getState(), St = (t) => {
  if (!t) return null;
  try {
    const i = window.localStorage.getItem(t);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Ct = (t, i, S, u) => {
  if (S.localStorage?.key && u) {
    const d = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: a.getState().serverSyncLog[i]?.[0]?.timeStamp,
      baseServerState: a.getState().serverState[i]
    }, E = `${u}-${i}-${S.localStorage?.key}`;
    window.localStorage.setItem(E, JSON.stringify(d));
  }
}, Ft = (t, i, S, u, d, E) => {
  const w = {
    initialState: i,
    updaterState: Z(
      t,
      u,
      d,
      E
    ),
    state: S
  };
  J(() => {
    nt(t, w.initialState), B(t, w.updaterState), x(t, w.state);
  });
}, mt = (t) => {
  const i = a.getState().stateComponents.get(t);
  if (!i) return;
  const S = /* @__PURE__ */ new Set();
  i.components.forEach((u) => {
    S.add(() => u.forceUpdate());
  }), queueMicrotask(() => {
    J(() => {
      S.forEach((u) => u());
    });
  });
}, zt = (t, i) => {
  const S = a.getState().stateComponents.get(t);
  if (S) {
    const u = `${t}////${i}`, d = S.components.get(u);
    d && d.forceUpdate();
  }
};
function Ot(t, {
  stateKey: i,
  serverSync: S,
  localStorage: u,
  formElements: d,
  middleware: E,
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
      initState: _,
      localStorage: u
    });
    let n = null;
    const r = $.current?.localStorage?.key, l = u?.key, f = r !== l ? l : r;
    f && (n = St(
      V + "-" + c + "-" + f
    ));
    let g = null;
    _?.initialState && (g = _?.initialState, n && n.lastUpdated > (n.lastSyncedWithServer || 0) && (g = n.state), Ft(
      c,
      _?.initialState,
      g,
      R,
      o.current,
      V
    ), mt(c), I({}));
  }, [u?.key, ..._?.dependencies || []]), vt(() => {
    k && dt(c, {
      serverSync: S,
      formElements: d,
      initState: _,
      localStorage: u,
      middleware: E
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
      const l = `${c}////${o.current}`;
      r && (r.components.delete(l), r.components.size === 0 && a.getState().stateComponents.delete(c));
    };
  }, []);
  const R = (n, r, l, f) => {
    if (Array.isArray(r)) {
      const g = `${c}-${r.join(".")}`;
      P.current.add(g);
    }
    x(c, (g) => {
      const p = ft(n) ? n(g) : n, O = `${c}-${r.join(".")}`;
      if (O) {
        let b = !1, y = a.getState().signalDomElements.get(O);
        if ((!y || y.size === 0) && (l.updateType === "insert" || l.updateType === "cut")) {
          const h = r.slice(0, -1), A = L(p, h);
          if (Array.isArray(A)) {
            b = !0;
            const N = `${c}-${h.join(".")}`;
            y = a.getState().signalDomElements.get(N);
          }
        }
        if (y) {
          const h = b ? L(p, r.slice(0, -1)) : L(p, r);
          y.forEach(({ parentId: A, position: N, effect: D }) => {
            const C = document.querySelector(
              `[data-parent-id="${A}"]`
            );
            if (C) {
              const ot = Array.from(C.childNodes);
              if (ot[N]) {
                const yt = D ? new Function("state", `return (${D})(state)`)(h) : h;
                ot[N].textContent = String(yt);
              }
            }
          });
        }
      }
      l.updateType === "update" && (f || $.current?.validationKey) && r && M(
        (f || $.current?.validationKey) + "." + r.join(".")
      );
      const T = r.slice(0, r.length - 1);
      l.updateType === "cut" && $.current?.validationKey && M(
        $.current?.validationKey + "." + T.join(".")
      ), l.updateType === "insert" && $.current?.validationKey && $t(
        $.current?.validationKey + "." + T.join(".")
      ).filter(([y, h]) => {
        let A = y?.split(".").length;
        if (y == T.join(".") && A == T.length - 1) {
          let N = y + "." + T;
          M(y), Tt(N, h);
        }
      });
      const j = L(g, r), F = L(p, r), W = l.updateType === "update" ? r.join(".") : [...r].slice(0, -1).join("."), rt = a.getState().stateComponents.get(c);
      if (rt)
        for (const [b, y] of rt.components.entries()) {
          let h = !1;
          const A = Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"];
          if (!A.includes("none")) {
            if (A.includes("all")) {
              y.forceUpdate();
              continue;
            }
            if (A.includes("component") && y.paths && (y.paths.has(W) || y.paths.has("")) && (h = !0), !h && A.includes("deps") && y.depsFunction) {
              const N = y.depsFunction(p);
              typeof N == "boolean" ? N && (h = !0) : G(y.deps, N) || (y.deps = N, h = !0);
            }
            h && y.forceUpdate();
          }
        }
      const at = {
        timeStamp: Date.now(),
        stateKey: c,
        path: r,
        updateType: l.updateType,
        status: "new",
        oldValue: j,
        newValue: F
      };
      if (ht(c, (b) => {
        const h = [...b ?? [], at].reduce((A, N) => {
          const D = `${N.stateKey}:${JSON.stringify(N.path)}`, C = A.get(D);
          return C ? (C.timeStamp = Math.max(C.timeStamp, N.timeStamp), C.newValue = N.newValue, C.oldValue = C.oldValue ?? N.oldValue, C.updateType = N.updateType) : A.set(D, { ...N }), A;
        }, /* @__PURE__ */ new Map());
        return Array.from(h.values());
      }), Ct(
        p,
        c,
        $.current,
        V
      ), E && E({
        updateLog: U,
        update: at
      }), $.current?.serverSync) {
        const b = a.getState().serverState[c], y = $.current?.serverSync;
        At(c, {
          syncKey: typeof y.syncKey == "string" ? y.syncKey : y.syncKey({ state: p }),
          rollBackState: b,
          actionTimeStamp: Date.now() + (y.debounce ?? 3e3),
          status: "waiting"
        });
      }
      return p;
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
function Z(t, i, S, u) {
  const d = /* @__PURE__ */ new Map();
  let E = 0;
  const w = (s) => {
    const e = s.join(".");
    for (const [I] of d)
      (I === e || I.startsWith(e + ".")) && d.delete(I);
    E++;
  }, v = /* @__PURE__ */ new Map(), m = {
    removeValidation: (s) => {
      s?.validationKey && M(s.validationKey);
    },
    revertToInitialState: (s) => {
      const e = a.getState().getInitialOptions(t)?.validation;
      e?.key && M(e?.key), s?.validationKey && M(s.validationKey);
      const I = a.getState().initialStateGlobal[t];
      d.clear(), E++;
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
      d.clear(), E++;
      const e = Z(
        t,
        i,
        S,
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
    d.get(V);
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
          const n = e.join("."), r = `${t}////${S}`, l = a.getState().stateComponents.get(t);
          if (l) {
            const f = l.components.get(r);
            f && (e.length > 0 || o === "get") && f.paths.add(n);
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
                (f) => f.join(".") === e.join(".")
              ), l = r ? s : a.getState().getNestedState(t, e);
              return o !== "stateMapNoRender" && (d.clear(), E++), l.map((f, g) => {
                const p = r && f.__origIndex ? f.__origIndex : g, O = _(
                  f,
                  [...e, p.toString()],
                  I
                );
                return n(
                  f,
                  O,
                  g,
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
              const l = I?.filtered?.some(
                (g) => g.join(".") === e.join(".")
              ) ? s : a.getState().getNestedState(t, e);
              d.clear(), E++;
              const f = l.flatMap(
                (g, p) => g[n] ?? []
              );
              return _(
                f,
                [...e, "[*]", n],
                I
              );
            };
          if (o === "findWith")
            return (n, r) => {
              const l = s.findIndex(
                (p) => p[n] === r
              );
              if (l === -1) return;
              const f = s[l], g = [...e, l.toString()];
              return d.clear(), E++, d.clear(), E++, _(f, g);
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
            return (n, r, l) => {
              const f = a.getState().getNestedState(t, e), g = ft(n) ? n(f) : n;
              let p = null;
              if (!f.some((T) => {
                if (r) {
                  const F = r.every(
                    (W) => G(T[W], g[W])
                  );
                  return F && (p = T), F;
                }
                const j = G(T, g);
                return j && (p = T), j;
              }))
                w(e), st(i, g, e, t);
              else if (l && p) {
                const T = l(p), j = f.map(
                  (F) => G(F, p) ? T : F
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
              const r = s.map((g, p) => ({
                ...g,
                __origIndex: p.toString()
              })), l = [], f = [];
              for (let g = 0; g < r.length; g++)
                n(r[g], g) && (l.push(g), f.push(r[g]));
              return d.clear(), E++, _(f, e, {
                filtered: [...I?.filtered || [], e],
                validIndices: l
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
          const n = e.slice(0, -1), r = n.join("."), l = a.getState().getNestedState(t, n);
          return Array.isArray(l) ? Number(e[e.length - 1]) === v.get(r) : void 0;
        }
        if (o == "getLocalStorage")
          return (n) => St(u + "-" + t + "-" + n);
        if (o === "setSelected")
          return (n) => {
            const r = e.slice(0, -1), l = Number(e[e.length - 1]), f = r.join(".");
            n ? v.set(f, l) : v.delete(f);
            const g = a.getState().getNestedState(t, [...r]);
            q(i, g, r), w(r);
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
              const l = a.getState().cogsStateStore[t];
              try {
                const f = a.getState().getValidationErrors(n.key);
                f && f.length > 0 && f.forEach(([p]) => {
                  p && p.startsWith(n.key) && M(p);
                });
                const g = n.zodSchema.safeParse(l);
                return g.success ? !0 : (g.error.errors.forEach((O) => {
                  const T = O.path, j = O.message, F = [n.key, ...T].join(".");
                  r(F, j);
                }), mt(t), !1);
              } catch (f) {
                return console.error("Zod schema validation failed", f), !1;
              }
            };
          if (o === "_componentId") return S;
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
                const l = a.getState().getNestedState(t, e);
                r?.afterUpdate && r.afterUpdate(l);
              }, r.debounce);
            else {
              q(i, n, e, "");
              const l = a.getState().getNestedState(t, e);
              r?.afterUpdate && r.afterUpdate(l);
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
    return d.set(V, {
      proxy: U,
      stateVersion: E
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
  const S = a().getNestedState(t._stateKey, t._path);
  return Array.isArray(S) ? i(
    S,
    t._path
  ).stateMapNoRender(
    (d, E, w, v, m) => t._mapFn(d, E, w, v, m)
  ) : null;
}
function bt({
  proxy: t
}) {
  const i = z(null), S = `${t._stateKey}-${t._path.join(".")}`;
  return K(() => {
    const u = i.current;
    if (!u || !u.parentElement) return;
    const d = u.parentElement, w = Array.from(d.childNodes).indexOf(u);
    let v = d.getAttribute("data-parent-id");
    v || (v = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", v));
    const _ = {
      instanceId: `instance-${crypto.randomUUID()}`,
      parentId: v,
      position: w,
      effect: t._effect
    };
    a.getState().addSignalElement(S, _);
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
    "data-signal-id": S
  });
}
function Jt(t) {
  const i = pt(
    (S) => {
      const u = a.getState().stateComponents.get(t._stateKey) || {
        components: /* @__PURE__ */ new Map()
      };
      return u.components.set(t._stateKey, {
        forceUpdate: S,
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
