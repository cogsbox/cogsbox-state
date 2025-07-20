"use client";
import { jsx as st, Fragment as Ot } from "react/jsx-runtime";
import { memo as Ut, useState as et, useRef as G, useCallback as lt, useEffect as tt, useLayoutEffect as St, useMemo as ht, createElement as ut, startTransition as Rt } from "react";
import { createRoot as At } from "react-dom/client";
import { transformStateFunc as Nt, isFunction as at, isArray as Tt, getDifferences as _t, isDeepEqual as it } from "./utility.js";
import { ValidationWrapper as Ct } from "./Functions.jsx";
import Ft from "superjson";
import { v4 as rt } from "uuid";
import { getGlobalStore as e, formRefStore as vt } from "./store.js";
import { useCogsConfig as Pt } from "./CogsStateClient.jsx";
import { useInView as jt } from "react-intersection-observer";
function yt(t, a) {
  const h = e.getState().getInitialOptions, S = e.getState().setInitialStateOptions, m = h(t) || {};
  S(t, {
    ...m,
    ...a
  });
}
function Vt({
  stateKey: t,
  options: a,
  initialOptionsPart: h
}) {
  const S = nt(t) || {}, m = h[t] || {}, I = e.getState().setInitialStateOptions, E = { ...m, ...S };
  let u = !1;
  if (a)
    for (const d in a)
      E.hasOwnProperty(d) ? (d == "localStorage" && a[d] && E[d].key !== a[d]?.key && (u = !0, E[d] = a[d]), d == "defaultState" && a[d] && E[d] !== a[d] && !it(E[d], a[d]) && (u = !0, E[d] = a[d])) : (u = !0, E[d] = a[d]);
  u && I(t, E);
}
function ie(t, { formElements: a, validation: h }) {
  return { initialState: t, formElements: a, validation: h };
}
const Lt = (t, a) => {
  let h = t;
  const [S, m] = Nt(h);
  a?.__fromSyncSchema && a?.__syncNotifications && e.getState().setInitialStateOptions("__notifications", a.__syncNotifications), a?.__fromSyncSchema && a?.__apiParamsMap && e.getState().setInitialStateOptions("__apiParamsMap", a.__apiParamsMap), Object.keys(S).forEach((u) => {
    let d = m[u] || {};
    const k = {
      ...d
    };
    if (a?.formElements && (k.formElements = {
      ...a.formElements,
      ...d.formElements || {}
    }), a?.validation && (k.validation = {
      ...a.validation,
      ...d.validation || {}
    }, a.validation.key && !d.validation?.key && (k.validation.key = `${a.validation.key}.${u}`)), Object.keys(k).length > 0) {
      const T = nt(u);
      T ? e.getState().setInitialStateOptions(u, {
        ...T,
        ...k
      }) : e.getState().setInitialStateOptions(u, k);
    }
  }), Object.keys(S).forEach((u) => {
    e.getState().initializeShadowState(u, S[u]);
  });
  const I = (u, d) => {
    const [k] = et(d?.componentId ?? rt()), T = a?.__apiParamsMap?.[u], i = {
      ...d,
      apiParamsSchema: T
      // Add the schema here
    };
    Vt({
      stateKey: u,
      options: i,
      initialOptionsPart: m
    });
    const g = e.getState().getShadowValue(u) || S[u], V = d?.modifyState ? d.modifyState(g) : g;
    return zt(V, {
      stateKey: u,
      syncUpdate: d?.syncUpdate,
      componentId: k,
      localStorage: d?.localStorage,
      middleware: d?.middleware,
      reactiveType: d?.reactiveType,
      reactiveDeps: d?.reactiveDeps,
      defaultState: d?.defaultState,
      dependencies: d?.dependencies,
      serverState: d?.serverState,
      __useSync: d?.__useSync
    });
  };
  function E(u, d) {
    Vt({ stateKey: u, options: d, initialOptionsPart: m }), d.localStorage && xt(u, d), ct(u);
  }
  return { useCogsState: I, setCogsOptions: E };
};
function ce(t) {
  const a = t.schemas, h = {}, S = {};
  for (const m in a) {
    const I = a[m];
    h[m] = I?.schemas?.defaultValues || {}, I?.api?.queryData?._paramType && (S[m] = I.api.queryData._paramType);
  }
  return Lt(h, {
    __fromSyncSchema: !0,
    __syncNotifications: t.notifications,
    __apiParamsMap: S,
    __useSync: t.useSync
  });
}
const {
  getInitialOptions: nt,
  getValidationErrors: le,
  setStateLog: Wt,
  updateInitialStateGlobal: kt,
  addValidationError: pt,
  removeValidationError: ft
} = e.getState(), Ht = (t, a, h, S, m) => {
  h?.log && console.log(
    "saving to localstorage",
    a,
    h.localStorage?.key,
    S
  );
  const I = at(h?.localStorage?.key) ? h.localStorage?.key(t) : h?.localStorage?.key;
  if (I && S) {
    const E = `${S}-${a}-${I}`;
    let u;
    try {
      u = mt(E)?.lastSyncedWithServer;
    } catch {
    }
    const d = e.getState().getShadowMetadata(a, []), k = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: u,
      stateSource: d?.stateSource,
      baseServerState: d?.baseServerState
    }, T = Ft.serialize(k);
    window.localStorage.setItem(
      E,
      JSON.stringify(T.json)
    );
  }
}, mt = (t) => {
  if (!t) return null;
  try {
    const a = window.localStorage.getItem(t);
    return a ? JSON.parse(a) : null;
  } catch (a) {
    return console.error("Error loading from localStorage:", a), null;
  }
}, xt = (t, a) => {
  const h = e.getState().getShadowValue(t), { sessionId: S } = Pt(), m = at(a?.localStorage?.key) ? a.localStorage.key(h) : a?.localStorage?.key;
  if (m && S) {
    const I = mt(
      `${S}-${t}-${m}`
    );
    if (I && I.lastUpdated > (I.lastSyncedWithServer || 0))
      return ct(t), !0;
  }
  return !1;
}, ct = (t) => {
  const a = e.getState().getShadowMetadata(t, []);
  if (!a) return;
  const h = /* @__PURE__ */ new Set();
  a?.components?.forEach((S) => {
    (S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : null)?.includes("none") || h.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((S) => S());
  });
}, ue = (t, a) => {
  const h = e.getState().getShadowMetadata(t, []);
  if (h) {
    const S = `${t}////${a}`, m = h?.components?.get(S);
    if ((m ? Array.isArray(m.reactiveType) ? m.reactiveType : [m.reactiveType || "component"] : null)?.includes("none"))
      return;
    m && m.forceUpdate();
  }
};
function wt(t, a, h, S) {
  const m = e.getState(), I = m.getShadowMetadata(t, a);
  if (m.setShadowMetadata(t, a, {
    ...I,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: S || Date.now()
  }), Array.isArray(h)) {
    const E = m.getShadowMetadata(t, a);
    E?.arrayKeys && E.arrayKeys.forEach((u, d) => {
      const k = u.split(".").slice(1), T = h[d];
      T !== void 0 && wt(
        t,
        k,
        T,
        S
      );
    });
  } else h && typeof h == "object" && h.constructor === Object && Object.keys(h).forEach((E) => {
    const u = [...a, E], d = h[E];
    wt(t, u, d, S);
  });
}
function zt(t, {
  stateKey: a,
  localStorage: h,
  formElements: S,
  reactiveDeps: m,
  reactiveType: I,
  componentId: E,
  defaultState: u,
  syncUpdate: d,
  dependencies: k,
  serverState: T,
  __useSync: i,
  syncOptions: g
} = {}) {
  const [V, j] = et({}), { sessionId: N } = Pt();
  let z = !a;
  const [f] = et(a ?? rt()), L = e.getState().stateLog[f], B = G(/* @__PURE__ */ new Set()), y = G(E ?? rt()), Z = G(
    null
  );
  Z.current = nt(f) ?? null, tt(() => {
    if (d && d.stateKey === f && d.path?.[0]) {
      const n = `${d.stateKey}:${d.path.join(".")}`;
      e.getState().setSyncInfo(n, {
        timeStamp: d.timeStamp,
        userId: d.userId
      });
    }
  }, [d]);
  const K = lt(
    (n) => {
      const c = n ? { ...nt(f), ...n } : nt(f), w = c?.defaultState || u || t;
      if (c?.serverState?.status === "success" && c?.serverState?.data !== void 0)
        return {
          value: c.serverState.data,
          source: "server",
          timestamp: c.serverState.timestamp || Date.now()
        };
      if (c?.localStorage?.key && N) {
        const $ = at(c.localStorage.key) ? c.localStorage.key(w) : c.localStorage.key, C = mt(
          `${N}-${f}-${$}`
        );
        if (C && C.lastUpdated > (c?.serverState?.timestamp || 0))
          return {
            value: C.state,
            source: "localStorage",
            timestamp: C.lastUpdated
          };
      }
      return {
        value: w || t,
        source: "default",
        timestamp: Date.now()
      };
    },
    [f, u, t, N]
  );
  tt(() => {
    e.getState().setServerStateUpdate(f, T);
  }, [T, f]), tt(() => e.getState().subscribeToPath(f, (s) => {
    if (s?.type === "SERVER_STATE_UPDATE") {
      const c = s.serverState;
      if (c?.status === "success" && c.data !== void 0) {
        yt(f, { serverState: c });
        const M = typeof c.merge == "object" ? c.merge : c.merge === !0 ? {} : null, $ = e.getState().getShadowValue(f), C = c.data;
        if (M && Array.isArray($) && Array.isArray(C)) {
          const U = M.key || "id", W = new Set(
            $.map((x) => x[U])
          ), F = C.filter((x) => !W.has(x[U]));
          F.length > 0 && F.forEach((x) => {
            e.getState().insertShadowArrayElement(f, [], x);
            const Y = e.getState().getShadowMetadata(f, []);
            if (Y?.arrayKeys) {
              const J = Y.arrayKeys[Y.arrayKeys.length - 1];
              if (J) {
                const A = J.split(".").slice(1);
                e.getState().setShadowMetadata(f, A, {
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: c.timestamp || Date.now()
                });
                const O = e.getState().getShadowValue(J);
                O && typeof O == "object" && !Array.isArray(O) && Object.keys(O).forEach((p) => {
                  const v = [...A, p];
                  e.getState().setShadowMetadata(f, v, {
                    isDirty: !1,
                    stateSource: "server",
                    lastServerSync: c.timestamp || Date.now()
                  });
                });
              }
            }
          });
        } else
          e.getState().initializeShadowState(f, C), wt(
            f,
            [],
            C,
            c.timestamp
          );
        const _ = e.getState().getShadowMetadata(f, []);
        e.getState().setShadowMetadata(f, [], {
          ..._,
          stateSource: "server",
          lastServerSync: c.timestamp || Date.now(),
          isDirty: !1
        });
      }
    }
  }), [f, K]), tt(() => {
    const n = e.getState().getShadowMetadata(f, []);
    if (n && n.stateSource)
      return;
    const s = nt(f);
    if (s?.defaultState !== void 0 || u !== void 0) {
      const c = s?.defaultState || u;
      s?.defaultState || yt(f, {
        defaultState: c
      });
      const { value: w, source: M, timestamp: $ } = K();
      e.getState().initializeShadowState(f, w), e.getState().setShadowMetadata(f, [], {
        stateSource: M,
        lastServerSync: M === "server" ? $ : void 0,
        isDirty: !1,
        baseServerState: M === "server" ? w : void 0
      }), ct(f);
    }
  }, [f, ...k || []]), St(() => {
    z && yt(f, {
      formElements: S,
      defaultState: u,
      localStorage: h,
      middleware: Z.current?.middleware
    });
    const n = `${f}////${y.current}`, s = e.getState().getShadowMetadata(f, []), c = s?.components || /* @__PURE__ */ new Map();
    return c.set(n, {
      forceUpdate: () => j({}),
      reactiveType: I ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: m || void 0,
      deps: m ? m(e.getState().getShadowValue(f)) : [],
      prevDeps: m ? m(e.getState().getShadowValue(f)) : []
    }), e.getState().setShadowMetadata(f, [], {
      ...s,
      components: c
    }), j({}), () => {
      const w = e.getState().getShadowMetadata(f, []), M = w?.components?.get(n);
      M?.paths && M.paths.forEach(($) => {
        const _ = $.split(".").slice(1), U = e.getState().getShadowMetadata(f, _);
        U?.pathComponents && U.pathComponents.size === 0 && (delete U.pathComponents, e.getState().setShadowMetadata(f, _, U));
      }), w?.components && e.getState().setShadowMetadata(f, [], w);
    };
  }, []);
  const X = G(null), r = (n, s, c) => {
    const w = [f, ...s].join(".");
    if (Array.isArray(s)) {
      const A = `${f}-${s.join(".")}`;
      B.current.add(A);
    }
    const M = e.getState(), $ = M.getShadowMetadata(f, s), C = M.getShadowValue(w), _ = c.updateType === "insert" && at(n) ? n({ state: C, uuid: rt() }) : at(n) ? n(C) : n, W = {
      timeStamp: Date.now(),
      stateKey: f,
      path: s,
      updateType: c.updateType,
      status: "new",
      oldValue: C,
      newValue: _
    };
    switch (c.updateType) {
      case "insert": {
        M.insertShadowArrayElement(f, s, W.newValue), M.markAsDirty(f, s, { bubble: !0 });
        const A = M.getShadowMetadata(f, s);
        if (A?.arrayKeys) {
          const O = A.arrayKeys[A.arrayKeys.length - 1];
          if (O) {
            const p = O.split(".").slice(1);
            M.markAsDirty(f, p, { bubble: !1 });
          }
        }
        break;
      }
      case "cut": {
        const A = s.slice(0, -1);
        M.removeShadowArrayElement(f, s), M.markAsDirty(f, A, { bubble: !0 });
        break;
      }
      case "update": {
        M.updateShadowAtPath(f, s, W.newValue), M.markAsDirty(f, s, { bubble: !0 });
        break;
      }
    }
    if (c.sync !== !1 && X.current && X.current.connected && X.current.updateState({ operation: W }), $?.signals && $.signals.length > 0) {
      const A = c.updateType === "cut" ? null : _;
      $.signals.forEach(({ parentId: O, position: p, effect: v }) => {
        const b = document.querySelector(`[data-parent-id="${O}"]`);
        if (b) {
          const D = Array.from(b.childNodes);
          if (D[p]) {
            let P = A;
            if (v && A !== null)
              try {
                P = new Function(
                  "state",
                  `return (${v})(state)`
                )(A);
              } catch (R) {
                console.error("Error evaluating effect function:", R);
              }
            P != null && typeof P == "object" && (P = JSON.stringify(P)), D[p].textContent = String(P ?? "");
          }
        }
      });
    }
    if (c.updateType === "insert" && $?.mapWrappers && $.mapWrappers.length > 0) {
      const A = M.getShadowMetadata(f, s)?.arrayKeys || [], O = A[A.length - 1], p = M.getShadowValue(O), v = M.getShadowValue(
        [f, ...s].join(".")
      );
      if (!O || p === void 0) return;
      $.mapWrappers.forEach((b) => {
        let D = !0, P = -1;
        if (b.meta?.transforms && b.meta.transforms.length > 0) {
          for (const R of b.meta.transforms)
            if (R.type === "filter" && !R.fn(p, -1)) {
              D = !1;
              break;
            }
          if (D) {
            const R = It(
              f,
              s,
              b.meta.transforms
            ), Q = b.meta.transforms.find(
              (H) => H.type === "sort"
            );
            if (Q) {
              const H = R.map((q) => ({
                key: q,
                value: M.getShadowValue(q)
              }));
              H.push({ key: O, value: p }), H.sort((q, ot) => Q.fn(q.value, ot.value)), P = H.findIndex(
                (q) => q.key === O
              );
            } else
              P = R.length;
          }
        } else
          D = !0, P = A.length - 1;
        if (D && b.containerRef && b.containerRef.isConnected) {
          const R = document.createElement("div");
          R.setAttribute("data-item-path", O);
          const Q = Array.from(b.containerRef.children);
          P >= 0 && P < Q.length ? b.containerRef.insertBefore(
            R,
            Q[P]
          ) : b.containerRef.appendChild(R);
          const H = At(R), q = rt(), ot = O.split(".").slice(1), dt = b.rebuildStateShape({
            path: b.path,
            currentState: v,
            componentId: b.componentId,
            meta: b.meta
          });
          H.render(
            ut(Mt, {
              stateKey: f,
              itemComponentId: q,
              itemPath: ot,
              localIndex: P,
              arraySetter: dt,
              rebuildStateShape: b.rebuildStateShape,
              renderFn: b.mapFn
            })
          );
        }
      });
    }
    if (c.updateType === "cut") {
      const A = s.slice(0, -1), O = M.getShadowMetadata(f, A);
      O?.mapWrappers && O.mapWrappers.length > 0 && O.mapWrappers.forEach((p) => {
        if (p.containerRef && p.containerRef.isConnected) {
          const v = p.containerRef.querySelector(
            `[data-item-path="${w}"]`
          );
          v && v.remove();
        }
      });
    }
    const x = e.getState().getShadowValue(f), Y = e.getState().getShadowMetadata(f, []), J = /* @__PURE__ */ new Set();
    if (console.log(
      "rootMeta",
      f,
      e.getState().shadowStateStore
    ), !Y?.components)
      return x;
    if (c.updateType === "update") {
      let A = [...s];
      for (; ; ) {
        const O = M.getShadowMetadata(f, A);
        if (O?.pathComponents && O.pathComponents.forEach((p) => {
          if (J.has(p))
            return;
          const v = Y.components?.get(p);
          v && ((Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"]).includes("none") || (v.forceUpdate(), J.add(p)));
        }), A.length === 0)
          break;
        A.pop();
      }
      _ && typeof _ == "object" && !Tt(_) && C && typeof C == "object" && !Tt(C) && _t(_, C).forEach((p) => {
        const v = p.split("."), b = [...s, ...v], D = M.getShadowMetadata(f, b);
        D?.pathComponents && D.pathComponents.forEach((P) => {
          if (J.has(P))
            return;
          const R = Y.components?.get(P);
          R && ((Array.isArray(R.reactiveType) ? R.reactiveType : [R.reactiveType || "component"]).includes("none") || (R.forceUpdate(), J.add(P)));
        });
      });
    } else if (c.updateType === "insert" || c.updateType === "cut") {
      const A = c.updateType === "insert" ? s : s.slice(0, -1), O = M.getShadowMetadata(f, A);
      if (O?.signals && O.signals.length > 0) {
        const p = [f, ...A].join("."), v = M.getShadowValue(p);
        O.signals.forEach(({ parentId: b, position: D, effect: P }) => {
          const R = document.querySelector(
            `[data-parent-id="${b}"]`
          );
          if (R) {
            const Q = Array.from(R.childNodes);
            if (Q[D]) {
              let H = v;
              if (P)
                try {
                  H = new Function(
                    "state",
                    `return (${P})(state)`
                  )(v);
                } catch (q) {
                  console.error("Error evaluating effect function:", q), H = v;
                }
              H != null && typeof H == "object" && (H = JSON.stringify(H)), Q[D].textContent = String(H ?? "");
            }
          }
        });
      }
      O?.pathComponents && O.pathComponents.forEach((p) => {
        if (!J.has(p)) {
          const v = Y.components?.get(p);
          v && (v.forceUpdate(), J.add(p));
        }
      });
    }
    return Y.components.forEach((A, O) => {
      if (J.has(O))
        return;
      const p = Array.isArray(A.reactiveType) ? A.reactiveType : [A.reactiveType || "component"];
      if (p.includes("all")) {
        A.forceUpdate(), J.add(O);
        return;
      }
      if (p.includes("deps") && A.depsFunction) {
        const v = M.getShadowValue(f), b = A.depsFunction(v);
        let D = !1;
        b === !0 ? D = !0 : Array.isArray(b) && (it(A.prevDeps, b) || (A.prevDeps = b, D = !0)), D && (A.forceUpdate(), J.add(O));
      }
    }), J.clear(), Wt(f, (A) => {
      const O = [...A ?? [], W], p = /* @__PURE__ */ new Map();
      return O.forEach((v) => {
        const b = `${v.stateKey}:${JSON.stringify(v.path)}`, D = p.get(b);
        D ? (D.timeStamp = Math.max(D.timeStamp, v.timeStamp), D.newValue = v.newValue, D.oldValue = D.oldValue ?? v.oldValue, D.updateType = v.updateType) : p.set(b, { ...v });
      }), Array.from(p.values());
    }), Ht(
      _,
      f,
      Z.current,
      N
    ), Z.current?.middleware && Z.current.middleware({
      updateLog: L,
      update: W
    }), x;
  };
  e.getState().initialStateGlobal[f] || kt(f, t);
  const o = ht(() => Dt(
    f,
    r,
    y.current,
    N
  ), [f, N]), l = i;
  return l && (X.current = l(
    o,
    g ?? {}
  )), o;
}
function Bt(t) {
  return !t || t.length === 0 ? "" : t.map(
    (a) => (
      // Safely stringify dependencies. An empty array becomes '[]'.
      `${a.type}${JSON.stringify(a.dependencies || [])}`
    )
  ).join("");
}
const It = (t, a, h) => {
  let S = e.getState().getShadowMetadata(t, a)?.arrayKeys || [];
  if (!h || h.length === 0)
    return S;
  let m = S.map((I) => ({
    key: I,
    value: e.getState().getShadowValue(I)
  }));
  for (const I of h)
    I.type === "filter" ? m = m.filter(
      ({ value: E }, u) => I.fn(E, u)
    ) : I.type === "sort" && m.sort((E, u) => I.fn(E.value, u.value));
  return m.map(({ key: I }) => I);
}, Et = (t, a, h) => {
  const S = `${t}////${a}`, { addPathComponent: m, getShadowMetadata: I } = e.getState(), u = I(t, [])?.components?.get(S);
  !u || u.reactiveType === "none" || !(Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType]).includes("component") || m(t, h, S);
}, gt = (t, a, h) => {
  const S = e.getState(), m = S.getShadowMetadata(t, []), I = /* @__PURE__ */ new Set();
  m?.components && m.components.forEach((u, d) => {
    (Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"]).includes("all") && (u.forceUpdate(), I.add(d));
  }), S.getShadowMetadata(t, [...a, "getSelected"])?.pathComponents?.forEach((u) => {
    m?.components?.get(u)?.forceUpdate();
  });
  const E = S.getShadowMetadata(t, a);
  for (let u of E?.arrayKeys || []) {
    const d = u + ".selected", k = S.getShadowMetadata(
      t,
      d.split(".").slice(1)
    );
    u == h && k?.pathComponents?.forEach((T) => {
      m?.components?.get(T)?.forceUpdate();
    });
  }
};
function Dt(t, a, h, S) {
  const m = /* @__PURE__ */ new Map();
  let I = 0;
  const E = (T) => {
    const i = T.join(".");
    for (const [g] of m)
      (g === i || g.startsWith(i + ".")) && m.delete(g);
    I++;
  };
  function u({
    currentState: T,
    path: i = [],
    meta: g,
    componentId: V
  }) {
    const j = i.map(String).join("."), N = [t, ...i].join(".");
    T = e.getState().getShadowValue(N, g?.validIds);
    const z = function() {
      return e().getShadowValue(t, i);
    }, f = {
      apply(B, y, Z) {
      },
      get(B, y) {
        if (y === "_rebuildStateShape")
          return u;
        if (Object.getOwnPropertyNames(d).includes(y) && i.length === 0)
          return d[y];
        if (y === "getDifferences")
          return () => {
            const r = e.getState().getShadowMetadata(t, []), o = e.getState().getShadowValue(t);
            let l;
            return r?.stateSource === "server" && r.baseServerState ? l = r.baseServerState : l = e.getState().initialStateGlobal[t], _t(o, l);
          };
        if (y === "sync" && i.length === 0)
          return async function() {
            const r = e.getState().getInitialOptions(t), o = r?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const l = e.getState().getShadowValue(t, []), n = r?.validation?.key;
            try {
              const s = await o.action(l);
              if (s && !s.success && s.errors && n && (e.getState().removeValidationError(n), s.errors.forEach((c) => {
                const w = [n, ...c.path].join(".");
                e.getState().addValidationError(w, c.message);
              }), ct(t)), s?.success) {
                const c = e.getState().getShadowMetadata(t, []);
                e.getState().setShadowMetadata(t, [], {
                  ...c,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: l
                  // Update base server state
                }), o.onSuccess && o.onSuccess(s.data);
              } else !s?.success && o.onError && o.onError(s.error);
              return s;
            } catch (s) {
              return o.onError && o.onError(s), { success: !1, error: s };
            }
          };
        if (y === "_status" || y === "getStatus") {
          const r = () => {
            const o = e.getState().getShadowMetadata(t, i), l = e.getState().getShadowValue(N);
            return o?.isDirty === !0 ? "dirty" : o?.isDirty === !1 || o?.stateSource === "server" ? "synced" : o?.stateSource === "localStorage" ? "restored" : o?.stateSource === "default" ? "fresh" : e.getState().getShadowMetadata(t, [])?.stateSource === "server" && !o?.isDirty ? "synced" : l !== void 0 && !o ? "fresh" : "unknown";
          };
          return y === "_status" ? r() : r;
        }
        if (y === "removeStorage")
          return () => {
            const r = e.getState().initialStateGlobal[t], o = nt(t), l = at(o?.localStorage?.key) ? o.localStorage.key(r) : o?.localStorage?.key, n = `${S}-${t}-${l}`;
            n && localStorage.removeItem(n);
          };
        if (y === "showValidationErrors")
          return () => {
            const r = e.getState().getShadowMetadata(t, i);
            return r?.validation?.status === "VALIDATION_FAILED" && r.validation.message ? [r.validation.message] : [];
          };
        if (Array.isArray(T)) {
          if (y === "getSelected")
            return () => {
              const r = t + "." + i.join(".");
              Et(t, V, [
                ...i,
                "getSelected"
              ]);
              const o = e.getState().selectedIndicesMap;
              if (!o || !o.has(r))
                return;
              const l = o.get(r);
              if (g?.validIds && !g.validIds.includes(l))
                return;
              const n = e.getState().getShadowValue(l);
              if (n)
                return u({
                  currentState: n,
                  path: l.split(".").slice(1),
                  componentId: V
                });
            };
          if (y === "getSelectedIndex")
            return () => e.getState().getSelectedIndex(
              t + "." + i.join("."),
              g?.validIds
            );
          if (y === "clearSelected")
            return gt(t, i), () => {
              e.getState().clearSelectedIndex({
                arrayKey: t + "." + i.join(".")
              });
            };
          if (y === "useVirtualView")
            return (r) => {
              const {
                itemHeight: o = 50,
                overscan: l = 6,
                stickToBottom: n = !1,
                scrollStickTolerance: s = 75
              } = r, c = G(null), [w, M] = et({
                startIndex: 0,
                endIndex: 10
              }), [$, C] = et({}), _ = G(!0), U = G({
                isUserScrolling: !1,
                lastScrollTop: 0,
                scrollUpCount: 0,
                isNearBottom: !0
              }), W = G(
                /* @__PURE__ */ new Map()
              );
              St(() => {
                if (!n || !c.current || U.current.isUserScrolling)
                  return;
                const p = c.current;
                p.scrollTo({
                  top: p.scrollHeight,
                  behavior: _.current ? "instant" : "smooth"
                });
              }, [$, n]);
              const F = e.getState().getShadowMetadata(t, i)?.arrayKeys || [], { totalHeight: x, itemOffsets: Y } = ht(() => {
                let p = 0;
                const v = /* @__PURE__ */ new Map();
                return (e.getState().getShadowMetadata(t, i)?.arrayKeys || []).forEach((D) => {
                  const P = D.split(".").slice(1), R = e.getState().getShadowMetadata(t, P)?.virtualizer?.itemHeight || o;
                  v.set(D, {
                    height: R,
                    offset: p
                  }), p += R;
                }), W.current = v, { totalHeight: p, itemOffsets: v };
              }, [F.length, o]);
              St(() => {
                if (n && F.length > 0 && c.current && !U.current.isUserScrolling && _.current) {
                  const p = c.current, v = () => {
                    if (p.clientHeight > 0) {
                      const b = Math.ceil(
                        p.clientHeight / o
                      ), D = F.length - 1, P = Math.max(
                        0,
                        D - b - l
                      );
                      M({ startIndex: P, endIndex: D }), requestAnimationFrame(() => {
                        A("instant"), _.current = !1;
                      });
                    } else
                      requestAnimationFrame(v);
                  };
                  v();
                }
              }, [F.length, n, o, l]);
              const J = lt(() => {
                const p = c.current;
                if (!p) return;
                const v = p.scrollTop, { scrollHeight: b, clientHeight: D } = p, P = U.current, R = b - (v + D), Q = P.isNearBottom;
                P.isNearBottom = R <= s, v < P.lastScrollTop ? (P.scrollUpCount++, P.scrollUpCount > 3 && Q && (P.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : P.isNearBottom && (P.isUserScrolling = !1, P.scrollUpCount = 0), P.lastScrollTop = v;
                let H = 0;
                for (let q = 0; q < F.length; q++) {
                  const ot = F[q], dt = W.current.get(ot);
                  if (dt && dt.offset + dt.height > v) {
                    H = q;
                    break;
                  }
                }
                if (H !== w.startIndex) {
                  const q = Math.ceil(D / o);
                  M({
                    startIndex: Math.max(0, H - l),
                    endIndex: Math.min(
                      F.length - 1,
                      H + q + l
                    )
                  });
                }
              }, [
                F.length,
                w.startIndex,
                o,
                l,
                s
              ]);
              tt(() => {
                const p = c.current;
                if (!(!p || !n))
                  return p.addEventListener("scroll", J, {
                    passive: !0
                  }), () => {
                    p.removeEventListener("scroll", J);
                  };
              }, [J, n]);
              const A = lt(
                (p = "smooth") => {
                  const v = c.current;
                  if (!v) return;
                  U.current.isUserScrolling = !1, U.current.isNearBottom = !0, U.current.scrollUpCount = 0;
                  const b = () => {
                    const D = (P = 0) => {
                      if (P > 5) return;
                      const R = v.scrollHeight, Q = v.scrollTop, H = v.clientHeight;
                      Q + H >= R - 1 || (v.scrollTo({
                        top: R,
                        behavior: p
                      }), setTimeout(() => {
                        const q = v.scrollHeight, ot = v.scrollTop;
                        (q !== R || ot + H < q - 1) && D(P + 1);
                      }, 50));
                    };
                    D();
                  };
                  "requestIdleCallback" in window ? requestIdleCallback(b, { timeout: 100 }) : requestAnimationFrame(() => {
                    requestAnimationFrame(b);
                  });
                },
                []
              );
              return tt(() => {
                if (!n || !c.current) return;
                const p = c.current, v = U.current;
                let b;
                const D = () => {
                  clearTimeout(b), b = setTimeout(() => {
                    !v.isUserScrolling && v.isNearBottom && A(
                      _.current ? "instant" : "smooth"
                    );
                  }, 100);
                }, P = new MutationObserver(() => {
                  v.isUserScrolling || D();
                });
                P.observe(p, {
                  childList: !0,
                  subtree: !0,
                  attributes: !0,
                  attributeFilter: ["style", "class"]
                  // More specific than just 'height'
                });
                const R = (Q) => {
                  Q.target instanceof HTMLImageElement && !v.isUserScrolling && D();
                };
                return p.addEventListener("load", R, !0), _.current ? setTimeout(() => {
                  A("instant");
                }, 0) : D(), () => {
                  clearTimeout(b), P.disconnect(), p.removeEventListener("load", R, !0);
                };
              }, [n, F.length, A]), {
                virtualState: ht(() => {
                  const p = e.getState(), v = p.getShadowValue(
                    [t, ...i].join(".")
                  ), b = p.getShadowMetadata(t, i)?.arrayKeys || [], D = v.slice(
                    w.startIndex,
                    w.endIndex + 1
                  ), P = b.slice(
                    w.startIndex,
                    w.endIndex + 1
                  );
                  return u({
                    currentState: D,
                    path: i,
                    componentId: V,
                    meta: { ...g, validIds: P }
                  });
                }, [w.startIndex, w.endIndex, F.length]),
                virtualizerProps: {
                  outer: {
                    ref: c,
                    style: {
                      overflowY: "auto",
                      height: "100%",
                      position: "relative"
                    }
                  },
                  inner: {
                    style: {
                      height: `${x}px`,
                      position: "relative"
                    }
                  },
                  list: {
                    style: {
                      transform: `translateY(${W.current.get(
                        F[w.startIndex]
                      )?.offset || 0}px)`
                    }
                  }
                },
                scrollToBottom: A,
                scrollToIndex: (p, v = "smooth") => {
                  if (c.current && F[p]) {
                    const b = W.current.get(F[p])?.offset || 0;
                    c.current.scrollTo({ top: b, behavior: v });
                  }
                }
              };
            };
          if (y === "stateMap")
            return (r) => {
              const [o, l] = et(
                g?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys
              ), n = e.getState().getShadowValue(N, g?.validIds);
              if (!o)
                throw new Error("No array keys found for mapping");
              const s = u({
                currentState: n,
                path: i,
                componentId: V,
                meta: g
              });
              return n.map((c, w) => {
                const M = o[w]?.split(".").slice(1), $ = u({
                  currentState: c,
                  path: M,
                  componentId: V,
                  meta: g
                });
                return r(
                  $,
                  w,
                  s
                );
              });
            };
          if (y === "$stateMap")
            return (r) => ut(qt, {
              proxy: {
                _stateKey: t,
                _path: i,
                _mapFn: r,
                _meta: g
              },
              rebuildStateShape: u
            });
          if (y === "stateFind")
            return (r) => {
              const o = g?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (o)
                for (let l = 0; l < o.length; l++) {
                  const n = o[l];
                  if (!n) continue;
                  const s = e.getState().getShadowValue(n);
                  if (r(s, l)) {
                    const c = n.split(".").slice(1);
                    return u({
                      currentState: s,
                      path: c,
                      componentId: V,
                      meta: g
                      // Pass along meta for potential further chaining
                    });
                  }
                }
            };
          if (y === "stateFilter")
            return (r) => {
              const o = g?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (!o)
                throw new Error("No array keys found for filtering.");
              const l = [], n = T.filter(
                (s, c) => r(s, c) ? (l.push(o[c]), !0) : !1
              );
              return u({
                currentState: n,
                path: i,
                componentId: V,
                meta: {
                  validIds: l,
                  transforms: [
                    ...g?.transforms || [],
                    {
                      type: "filter",
                      fn: r
                    }
                  ]
                }
              });
            };
          if (y === "stateSort")
            return (r) => {
              const o = g?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (!o)
                throw new Error("No array keys found for sorting");
              const l = T.map((n, s) => ({
                item: n,
                key: o[s]
              }));
              return l.sort((n, s) => r(n.item, s.item)).filter(Boolean), u({
                currentState: l.map((n) => n.item),
                path: i,
                componentId: V,
                meta: {
                  validIds: l.map((n) => n.key),
                  transforms: [
                    ...g?.transforms || [],
                    { type: "sort", fn: r }
                  ]
                }
              });
            };
          if (y === "stream")
            return function(r = {}) {
              const {
                bufferSize: o = 100,
                flushInterval: l = 100,
                bufferStrategy: n = "accumulate",
                store: s,
                onFlush: c
              } = r;
              let w = [], M = !1, $ = null;
              const C = (x) => {
                if (!M) {
                  if (n === "sliding" && w.length >= o)
                    w.shift();
                  else if (n === "dropping" && w.length >= o)
                    return;
                  w.push(x), w.length >= o && _();
                }
              }, _ = () => {
                if (w.length === 0) return;
                const x = [...w];
                if (w = [], s) {
                  const Y = s(x);
                  Y !== void 0 && (Array.isArray(Y) ? Y : [Y]).forEach((A) => {
                    a(A, i, {
                      updateType: "insert"
                    });
                  });
                } else
                  x.forEach((Y) => {
                    a(Y, i, {
                      updateType: "insert"
                    });
                  });
                c?.(x);
              };
              l > 0 && ($ = setInterval(_, l));
              const U = rt(), W = e.getState().getShadowMetadata(t, i) || {}, F = W.streams || /* @__PURE__ */ new Map();
              return F.set(U, { buffer: w, flushTimer: $ }), e.getState().setShadowMetadata(t, i, {
                ...W,
                streams: F
              }), {
                write: (x) => C(x),
                writeMany: (x) => x.forEach(C),
                flush: () => _(),
                pause: () => {
                  M = !0;
                },
                resume: () => {
                  M = !1, w.length > 0 && _();
                },
                close: () => {
                  _(), $ && clearInterval($);
                  const x = e.getState().getShadowMetadata(t, i);
                  x?.streams && x.streams.delete(U);
                }
              };
            };
          if (y === "stateList")
            return (r) => /* @__PURE__ */ st(() => {
              const l = G(/* @__PURE__ */ new Map()), n = g?.transforms && g.transforms.length > 0 ? `${V}-${Bt(g.transforms)}` : `${V}-base`, [s, c] = et({}), { validIds: w, arrayValues: M } = ht(() => {
                const C = e.getState().getShadowMetadata(t, i)?.transformCaches?.get(n);
                let _;
                C && C.validIds ? _ = C.validIds : (_ = It(
                  t,
                  i,
                  g?.transforms
                ), e.getState().setTransformCache(t, i, n, {
                  validIds: _,
                  computedAt: Date.now(),
                  transforms: g?.transforms || []
                }));
                const U = e.getState().getShadowValue(N, _);
                return {
                  validIds: _,
                  arrayValues: U || []
                };
              }, [n, s]);
              if (tt(() => {
                const C = e.getState().subscribeToPath(N, (_) => {
                  if (_.type === "GET_SELECTED")
                    return;
                  const W = e.getState().getShadowMetadata(t, i)?.transformCaches;
                  if (W)
                    for (const F of W.keys())
                      F.startsWith(V) && W.delete(F);
                  (_.type === "INSERT" || _.type === "REMOVE" || _.type === "CLEAR_SELECTION") && c({});
                });
                return () => {
                  C();
                };
              }, [V, N]), !Array.isArray(M))
                return null;
              const $ = u({
                currentState: M,
                path: i,
                componentId: V,
                meta: {
                  ...g,
                  validIds: w
                }
              });
              return /* @__PURE__ */ st(Ot, { children: M.map((C, _) => {
                const U = w[_];
                if (!U)
                  return null;
                let W = l.current.get(U);
                W || (W = rt(), l.current.set(U, W));
                const F = U.split(".").slice(1);
                return ut(Mt, {
                  key: U,
                  stateKey: t,
                  itemComponentId: W,
                  itemPath: F,
                  localIndex: _,
                  arraySetter: $,
                  rebuildStateShape: u,
                  renderFn: r
                });
              }) });
            }, {});
          if (y === "stateFlattenOn")
            return (r) => {
              const o = T;
              m.clear(), I++;
              const l = o.flatMap(
                (n) => n[r] ?? []
              );
              return u({
                currentState: l,
                path: [...i, "[*]", r],
                componentId: V,
                meta: g
              });
            };
          if (y === "index")
            return (r) => {
              const l = e.getState().getShadowMetadata(t, i)?.arrayKeys?.filter(
                (c) => !g?.validIds || g?.validIds && g?.validIds?.includes(c)
              )?.[r];
              if (!l) return;
              const n = e.getState().getShadowValue(l, g?.validIds);
              return u({
                currentState: n,
                path: l.split(".").slice(1),
                componentId: V,
                meta: g
              });
            };
          if (y === "last")
            return () => {
              const r = e.getState().getShadowValue(t, i);
              if (r.length === 0) return;
              const o = r.length - 1, l = r[o], n = [...i, o.toString()];
              return u({
                currentState: l,
                path: n,
                componentId: V,
                meta: g
              });
            };
          if (y === "insert")
            return (r, o) => (a(r, i, { updateType: "insert" }), u({
              currentState: e.getState().getShadowValue(t, i),
              path: i,
              componentId: V,
              meta: g
            }));
          if (y === "uniqueInsert")
            return (r, o, l) => {
              const n = e.getState().getShadowValue(t, i), s = at(r) ? r(n) : r;
              let c = null;
              if (!n.some((M) => {
                const $ = o ? o.every(
                  (C) => it(M[C], s[C])
                ) : it(M, s);
                return $ && (c = M), $;
              }))
                E(i), a(s, i, { updateType: "insert" });
              else if (l && c) {
                const M = l(c), $ = n.map(
                  (C) => it(C, c) ? M : C
                );
                E(i), a($, i, {
                  updateType: "update"
                });
              }
            };
          if (y === "cut")
            return (r, o) => {
              const l = g?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (!l || l.length === 0) return;
              const n = r == -1 ? l.length - 1 : r !== void 0 ? r : l.length - 1, s = l[n];
              if (!s) return;
              const c = s.split(".").slice(1);
              a(T, c, {
                updateType: "cut"
              });
            };
          if (y === "cutSelected")
            return () => {
              const r = It(
                t,
                i,
                g?.transforms
              );
              if (!r || r.length === 0) return;
              const o = e.getState().selectedIndicesMap.get(N);
              let l = r.findIndex(
                (c) => c === o
              );
              const n = r[l == -1 ? r.length - 1 : l]?.split(".").slice(1);
              e.getState().clearSelectedIndex({ arrayKey: N });
              const s = n?.slice(0, -1);
              gt(t, s), a(T, n, {
                updateType: "cut"
              });
            };
          if (y === "cutByValue")
            return (r) => {
              const o = e.getState().getShadowMetadata(t, i), l = g?.validIds ?? o?.arrayKeys;
              if (!l) return;
              let n = null;
              for (const s of l)
                if (e.getState().getShadowValue(s) === r) {
                  n = s;
                  break;
                }
              if (n) {
                const s = n.split(".").slice(1);
                a(null, s, { updateType: "cut" });
              }
            };
          if (y === "toggleByValue")
            return (r) => {
              const o = e.getState().getShadowMetadata(t, i), l = g?.validIds ?? o?.arrayKeys;
              if (!l) return;
              let n = null;
              for (const s of l) {
                const c = e.getState().getShadowValue(s);
                if (console.log("itemValue sdasdasdasd", c), c === r) {
                  n = s;
                  break;
                }
              }
              if (console.log("itemValue keyToCut", n), n) {
                const s = n.split(".").slice(1);
                console.log("itemValue keyToCut", n), a(r, s, {
                  updateType: "cut"
                });
              } else
                a(r, i, { updateType: "insert" });
            };
          if (y === "findWith")
            return (r, o) => {
              const l = e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (!l)
                throw new Error("No array keys found for sorting");
              let n = null, s = [];
              for (const c of l) {
                let w = e.getState().getShadowValue(c, g?.validIds);
                if (w && w[r] === o) {
                  n = w, s = c.split(".").slice(1);
                  break;
                }
              }
              return u({
                currentState: n,
                path: s,
                componentId: V,
                meta: g
              });
            };
        }
        if (y === "cut") {
          let r = e.getState().getShadowValue(i.join("."));
          return () => {
            a(r, i, { updateType: "cut" });
          };
        }
        if (y === "get")
          return () => (Et(t, V, i), e.getState().getShadowValue(N, g?.validIds));
        if (y === "getState")
          return () => e.getState().getShadowValue(N, g?.validIds);
        if (y === "$derive")
          return (r) => bt({
            _stateKey: t,
            _path: i,
            _effect: r.toString(),
            _meta: g
          });
        if (y === "$get")
          return () => bt({ _stateKey: t, _path: i, _meta: g });
        if (y === "lastSynced") {
          const r = `${t}:${i.join(".")}`;
          return e.getState().getSyncInfo(r);
        }
        if (y == "getLocalStorage")
          return (r) => mt(S + "-" + t + "-" + r);
        if (y === "isSelected") {
          const r = [t, ...i].slice(0, -1);
          if (gt(t, i, void 0), Array.isArray(
            e.getState().getShadowValue(r.join("."), g?.validIds)
          )) {
            i[i.length - 1];
            const o = r.join("."), l = e.getState().selectedIndicesMap.get(o), n = t + "." + i.join(".");
            return l === n;
          }
          return;
        }
        if (y === "setSelected")
          return (r) => {
            const o = i.slice(0, -1), l = t + "." + o.join("."), n = t + "." + i.join(".");
            gt(t, o, void 0), e.getState().selectedIndicesMap.get(l), r && e.getState().setSelectedIndex(l, n);
          };
        if (y === "toggleSelected")
          return () => {
            const r = i.slice(0, -1), o = t + "." + r.join("."), l = t + "." + i.join(".");
            e.getState().selectedIndicesMap.get(o) === l ? e.getState().clearSelectedIndex({ arrayKey: o }) : e.getState().setSelectedIndex(o, l);
          };
        if (y === "_componentId")
          return V;
        if (i.length == 0) {
          if (y === "addValidation")
            return (r) => {
              const o = e.getState().getInitialOptions(t)?.validation;
              if (!o?.key) throw new Error("Validation key not found");
              ft(o.key), r.forEach((l) => {
                const n = [o.key, ...l.path].join(".");
                pt(n, l.message);
              }), ct(t);
            };
          if (y === "applyJsonPatch")
            return (r) => {
              const o = e.getState(), l = o.getShadowMetadata(t, []);
              if (!l?.components) return;
              const n = (c) => !c || c === "/" ? [] : c.split("/").slice(1).map((w) => w.replace(/~1/g, "/").replace(/~0/g, "~")), s = /* @__PURE__ */ new Set();
              for (const c of r) {
                const w = n(c.path);
                switch (c.op) {
                  case "add":
                  case "replace": {
                    const { value: M } = c;
                    o.updateShadowAtPath(t, w, M), o.markAsDirty(t, w, { bubble: !0 });
                    let $ = [...w];
                    for (; ; ) {
                      const C = o.getShadowMetadata(
                        t,
                        $
                      );
                      if (console.log("pathMeta", C), C?.pathComponents && C.pathComponents.forEach((_) => {
                        if (!s.has(_)) {
                          const U = l.components?.get(_);
                          U && (U.forceUpdate(), s.add(_));
                        }
                      }), $.length === 0) break;
                      $.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const M = w.slice(0, -1);
                    o.removeShadowArrayElement(t, w), o.markAsDirty(t, M, { bubble: !0 });
                    let $ = [...M];
                    for (; ; ) {
                      const C = o.getShadowMetadata(
                        t,
                        $
                      );
                      if (C?.pathComponents && C.pathComponents.forEach((_) => {
                        if (!s.has(_)) {
                          const U = l.components?.get(_);
                          U && (U.forceUpdate(), s.add(_));
                        }
                      }), $.length === 0) break;
                      $.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (y === "validateZodSchema")
            return () => {
              const r = e.getState().getInitialOptions(t)?.validation, o = r?.zodSchemaV4 || r?.zodSchemaV3;
              if (!o || !r?.key)
                throw new Error(
                  "Zod schema (v3 or v4) or validation key not found"
                );
              ft(r.key);
              const l = e.getState().getShadowValue(t), n = o.safeParse(l);
              return n.success ? !0 : ("issues" in n.error ? n.error.issues.forEach((s) => {
                const c = [r.key, ...s.path].join(".");
                pt(c, s.message);
              }) : n.error.errors.forEach((s) => {
                const c = [r.key, ...s.path].join(".");
                pt(c, s.message);
              }), ct(t), !1);
            };
          if (y === "getComponents")
            return () => e.getState().getShadowMetadata(t, [])?.components;
          if (y === "getAllFormRefs")
            return () => vt.getState().getFormRefsByStateKey(t);
        }
        if (y === "getFormRef")
          return () => vt.getState().getFormRef(t + "." + i.join("."));
        if (y === "validationWrapper")
          return ({
            children: r,
            hideMessage: o
          }) => /* @__PURE__ */ st(
            Ct,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: i,
              stateKey: t,
              children: r
            }
          );
        if (y === "_stateKey") return t;
        if (y === "_path") return i;
        if (y === "update")
          return (r) => (a(r, i, { updateType: "update" }), {
            /**
             * Marks this specific item, which was just updated, as 'synced' (not dirty).
             */
            synced: () => {
              const o = e.getState().getShadowMetadata(t, i);
              e.getState().setShadowMetadata(t, i, {
                ...o,
                isDirty: !1,
                // EXPLICITLY set to false, not just undefined
                stateSource: "server",
                // Mark as coming from server
                lastServerSync: Date.now()
                // Add timestamp
              });
              const l = [t, ...i].join(".");
              e.getState().notifyPathSubscribers(l, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (y === "toggle") {
          const r = e.getState().getShadowValue([t, ...i].join("."));
          if (console.log("currentValueAtPath", r), typeof T != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            a(!r, i, {
              updateType: "update"
            });
          };
        }
        if (y === "formElement")
          return (r, o) => /* @__PURE__ */ st(
            Zt,
            {
              stateKey: t,
              path: i,
              rebuildStateShape: u,
              setState: a,
              formOpts: o,
              renderFn: r
            }
          );
        const K = [...i, y], X = e.getState().getShadowValue(t, K);
        return u({
          currentState: X,
          path: K,
          componentId: V,
          meta: g
        });
      }
    }, L = new Proxy(z, f);
    return m.set(j, {
      proxy: L,
      stateVersion: I
    }), L;
  }
  const d = {
    removeValidation: (T) => {
      T?.validationKey && ft(T.validationKey);
    },
    revertToInitialState: (T) => {
      const i = e.getState().getInitialOptions(t)?.validation;
      i?.key && ft(i.key), T?.validationKey && ft(T.validationKey);
      const g = e.getState().getShadowMetadata(t, []);
      g?.stateSource === "server" && g.baseServerState ? g.baseServerState : e.getState().initialStateGlobal[t];
      const V = e.getState().initialStateGlobal[t];
      e.getState().clearSelectedIndexesForState(t), m.clear(), I++, e.getState().initializeShadowState(t, V), u({
        currentState: V,
        path: [],
        componentId: h
      });
      const j = nt(t), N = at(j?.localStorage?.key) ? j?.localStorage?.key(V) : j?.localStorage?.key, z = `${S}-${t}-${N}`;
      z && localStorage.removeItem(z);
      const f = e.getState().getShadowMetadata(t, []);
      return f && f?.components?.forEach((L) => {
        L.forceUpdate();
      }), V;
    },
    updateInitialState: (T) => {
      m.clear(), I++;
      const i = Dt(
        t,
        a,
        h,
        S
      ), g = e.getState().initialStateGlobal[t], V = nt(t), j = at(V?.localStorage?.key) ? V?.localStorage?.key(g) : V?.localStorage?.key, N = `${S}-${t}-${j}`;
      return localStorage.getItem(N) && localStorage.removeItem(N), Rt(() => {
        kt(t, T), e.getState().initializeShadowState(t, T);
        const z = e.getState().getShadowMetadata(t, []);
        z && z?.components?.forEach((f) => {
          f.forceUpdate();
        });
      }), {
        fetchId: (z) => i.get()[z]
      };
    }
  };
  return u({
    currentState: e.getState().getShadowValue(t, []),
    componentId: h,
    path: []
  });
}
function bt(t) {
  return ut(Gt, { proxy: t });
}
function qt({
  proxy: t,
  rebuildStateShape: a
}) {
  const h = G(null), S = G(`map-${crypto.randomUUID()}`), m = G(!1), I = G(/* @__PURE__ */ new Map());
  tt(() => {
    const u = h.current;
    if (!u || m.current) return;
    const d = setTimeout(() => {
      const k = e.getState().getShadowMetadata(t._stateKey, t._path) || {}, T = k.mapWrappers || [];
      T.push({
        instanceId: S.current,
        mapFn: t._mapFn,
        containerRef: u,
        rebuildStateShape: a,
        path: t._path,
        componentId: S.current,
        meta: t._meta
      }), e.getState().setShadowMetadata(t._stateKey, t._path, {
        ...k,
        mapWrappers: T
      }), m.current = !0, E();
    }, 0);
    return () => {
      if (clearTimeout(d), S.current) {
        const k = e.getState().getShadowMetadata(t._stateKey, t._path) || {};
        k.mapWrappers && (k.mapWrappers = k.mapWrappers.filter(
          (T) => T.instanceId !== S.current
        ), e.getState().setShadowMetadata(t._stateKey, t._path, k));
      }
      I.current.forEach((k) => k.unmount());
    };
  }, []);
  const E = () => {
    const u = h.current;
    if (!u) return;
    const d = e.getState().getShadowValue(
      [t._stateKey, ...t._path].join("."),
      t._meta?.validIds
    );
    if (!Array.isArray(d)) return;
    const k = t._meta?.validIds ?? e.getState().getShadowMetadata(t._stateKey, t._path)?.arrayKeys ?? [], T = a({
      currentState: d,
      path: t._path,
      componentId: S.current,
      meta: t._meta
    });
    d.forEach((i, g) => {
      const V = k[g];
      if (!V) return;
      const j = rt(), N = document.createElement("div");
      N.setAttribute("data-item-path", V), u.appendChild(N);
      const z = At(N);
      I.current.set(V, z);
      const f = V.split(".").slice(1);
      z.render(
        ut(Mt, {
          stateKey: t._stateKey,
          itemComponentId: j,
          itemPath: f,
          localIndex: g,
          arraySetter: T,
          rebuildStateShape: a,
          renderFn: t._mapFn
        })
      );
    });
  };
  return /* @__PURE__ */ st("div", { ref: h, "data-map-container": S.current });
}
function Gt({
  proxy: t
}) {
  const a = G(null), h = G(null), S = G(!1), m = `${t._stateKey}-${t._path.join(".")}`, I = e.getState().getShadowValue(
    [t._stateKey, ...t._path].join("."),
    t._meta?.validIds
  );
  return tt(() => {
    const E = a.current;
    if (!E || S.current) return;
    const u = setTimeout(() => {
      if (!E.parentElement) {
        console.warn("Parent element not found for signal", m);
        return;
      }
      const d = E.parentElement, T = Array.from(d.childNodes).indexOf(E);
      let i = d.getAttribute("data-parent-id");
      i || (i = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", i)), h.current = `instance-${crypto.randomUUID()}`;
      const g = e.getState().getShadowMetadata(t._stateKey, t._path) || {}, V = g.signals || [];
      V.push({
        instanceId: h.current,
        parentId: i,
        position: T,
        effect: t._effect
      }), e.getState().setShadowMetadata(t._stateKey, t._path, {
        ...g,
        signals: V
      });
      let j = I;
      if (t._effect)
        try {
          j = new Function(
            "state",
            `return (${t._effect})(state)`
          )(I);
        } catch (z) {
          console.error("Error evaluating effect function:", z);
        }
      j !== null && typeof j == "object" && (j = JSON.stringify(j));
      const N = document.createTextNode(String(j ?? ""));
      E.replaceWith(N), S.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(u), h.current) {
        const d = e.getState().getShadowMetadata(t._stateKey, t._path) || {};
        d.signals && (d.signals = d.signals.filter(
          (k) => k.instanceId !== h.current
        ), e.getState().setShadowMetadata(t._stateKey, t._path, d));
      }
    };
  }, []), ut("span", {
    ref: a,
    style: { display: "contents" },
    "data-signal-id": m
  });
}
const Mt = Ut(
  Yt,
  (t, a) => t.itemPath.join(".") === a.itemPath.join(".") && t.stateKey === a.stateKey && t.itemComponentId === a.itemComponentId && t.localIndex === a.localIndex
), Jt = (t) => {
  const [a, h] = et(!1);
  return St(() => {
    if (!t.current) {
      h(!0);
      return;
    }
    const S = Array.from(t.current.querySelectorAll("img"));
    if (S.length === 0) {
      h(!0);
      return;
    }
    let m = 0;
    const I = () => {
      m++, m === S.length && h(!0);
    };
    return S.forEach((E) => {
      E.complete ? I() : (E.addEventListener("load", I), E.addEventListener("error", I));
    }), () => {
      S.forEach((E) => {
        E.removeEventListener("load", I), E.removeEventListener("error", I);
      });
    };
  }, [t.current]), a;
};
function Yt({
  stateKey: t,
  itemComponentId: a,
  itemPath: h,
  localIndex: S,
  arraySetter: m,
  rebuildStateShape: I,
  renderFn: E
}) {
  const [, u] = et({}), { ref: d, inView: k } = jt(), T = G(null), i = Jt(T), g = G(!1), V = [t, ...h].join(".");
  $t(t, a, u);
  const j = lt(
    (B) => {
      T.current = B, d(B);
    },
    [d]
  );
  tt(() => {
    e.getState().subscribeToPath(V, (B) => {
      u({});
    });
  }, []), tt(() => {
    if (!k || !i || g.current)
      return;
    const B = T.current;
    if (B && B.offsetHeight > 0) {
      g.current = !0;
      const y = B.offsetHeight;
      e.getState().setShadowMetadata(t, h, {
        virtualizer: {
          itemHeight: y,
          domRef: B
        }
      });
      const Z = h.slice(0, -1), K = [t, ...Z].join(".");
      e.getState().notifyPathSubscribers(K, {
        type: "ITEMHEIGHT",
        itemKey: h.join("."),
        ref: T.current
      });
    }
  }, [k, i, t, h]);
  const N = [t, ...h].join("."), z = e.getState().getShadowValue(N);
  if (z === void 0)
    return null;
  const f = I({
    currentState: z,
    path: h,
    componentId: a
  }), L = E(f, S, m);
  return /* @__PURE__ */ st("div", { ref: j, children: L });
}
function Zt({
  stateKey: t,
  path: a,
  rebuildStateShape: h,
  renderFn: S,
  formOpts: m,
  setState: I
}) {
  const [E] = et(() => rt()), [, u] = et({}), d = [t, ...a].join(".");
  $t(t, E, u);
  const k = e.getState().getShadowValue(d), [T, i] = et(k), g = G(!1), V = G(null);
  tt(() => {
    !g.current && !it(k, T) && i(k);
  }, [k]), tt(() => {
    const L = e.getState().subscribeToPath(d, (B) => {
      !g.current && T !== B && u({});
    });
    return () => {
      L(), V.current && (clearTimeout(V.current), g.current = !1);
    };
  }, []);
  const j = lt(
    (L) => {
      typeof k === "number" && typeof L == "string" && (L = L === "" ? 0 : Number(L)), i(L), g.current = !0, V.current && clearTimeout(V.current);
      const y = m?.debounceTime ?? 200;
      V.current = setTimeout(() => {
        g.current = !1, I(L, a, { updateType: "update" });
        const { getInitialOptions: Z, setShadowMetadata: K, getShadowMetadata: X } = e.getState(), r = Z(t)?.validation, o = r?.zodSchemaV4 || r?.zodSchemaV3;
        if (o) {
          const l = e.getState().getShadowValue(t), n = o.safeParse(l), s = X(t, a) || {};
          if (n.success)
            K(t, a, {
              ...s,
              validation: {
                status: "VALID_LIVE",
                validatedValue: L
              }
            });
          else {
            const w = ("issues" in n.error ? n.error.issues : n.error.errors).filter(
              (M) => JSON.stringify(M.path) === JSON.stringify(a)
            );
            w.length > 0 ? K(t, a, {
              ...s,
              validation: {
                status: "INVALID_LIVE",
                message: w[0]?.message,
                validatedValue: L
              }
            }) : K(t, a, {
              ...s,
              validation: {
                status: "VALID_LIVE",
                validatedValue: L
              }
            });
          }
        }
      }, y), u({});
    },
    [I, a, m?.debounceTime, t]
  ), N = lt(async () => {
    console.log("handleBlur triggered"), V.current && (clearTimeout(V.current), V.current = null, g.current = !1, I(T, a, { updateType: "update" }));
    const { getInitialOptions: L } = e.getState(), B = L(t)?.validation, y = B?.zodSchemaV4 || B?.zodSchemaV3;
    if (!y) return;
    const Z = e.getState().getShadowMetadata(t, a);
    e.getState().setShadowMetadata(t, a, {
      ...Z,
      validation: {
        status: "DIRTY",
        validatedValue: T
      }
    });
    const K = e.getState().getShadowValue(t), X = y.safeParse(K);
    if (console.log("result ", X), X.success)
      e.getState().setShadowMetadata(t, a, {
        ...Z,
        validation: {
          status: "VALID_PENDING_SYNC",
          validatedValue: T
        }
      });
    else {
      const r = "issues" in X.error ? X.error.issues : X.error.errors;
      console.log("All validation errors:", r), console.log("Current blur path:", a);
      const o = r.filter((l) => {
        if (console.log("Processing error:", l), a.some((s) => s.startsWith("id:"))) {
          console.log("Detected array path with ULID");
          const s = a[0].startsWith("id:") ? [] : a.slice(0, -1);
          console.log("Parent path:", s);
          const c = e.getState().getShadowMetadata(t, s);
          if (console.log("Array metadata:", c), c?.arrayKeys) {
            const w = [t, ...a.slice(0, -1)].join("."), M = c.arrayKeys.indexOf(w);
            console.log("Item key:", w, "Index:", M);
            const $ = [...s, M, ...a.slice(-1)], C = JSON.stringify(l.path) === JSON.stringify($);
            return console.log("Zod path comparison:", {
              zodPath: $,
              errorPath: l.path,
              match: C
            }), C;
          }
        }
        const n = JSON.stringify(l.path) === JSON.stringify(a);
        return console.log("Direct path comparison:", {
          errorPath: l.path,
          currentPath: a,
          match: n
        }), n;
      });
      console.log("Filtered path errors:", o), e.getState().setShadowMetadata(t, a, {
        ...Z,
        validation: {
          status: "VALIDATION_FAILED",
          message: o[0]?.message,
          validatedValue: T
        }
      });
    }
    u({});
  }, [t, a, T, I]), z = h({
    currentState: k,
    path: a,
    componentId: E
  }), f = new Proxy(z, {
    get(L, B) {
      return B === "inputProps" ? {
        value: T ?? "",
        onChange: (y) => {
          j(y.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: N,
        ref: vt.getState().getFormRef(t + "." + a.join("."))
      } : L[B];
    }
  });
  return /* @__PURE__ */ st(Ct, { formOpts: m, path: a, stateKey: t, children: S(f) });
}
function $t(t, a, h) {
  const S = `${t}////${a}`;
  St(() => {
    const { registerComponent: m, unregisterComponent: I } = e.getState();
    return m(t, S, {
      forceUpdate: () => h({}),
      paths: /* @__PURE__ */ new Set(),
      reactiveType: ["component"]
    }), () => {
      I(t, S);
    };
  }, [t, S]);
}
export {
  bt as $cogsSignal,
  ie as addStateOptions,
  Lt as createCogsState,
  ce as createCogsStateFromSync,
  ue as notifyComponent,
  zt as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
