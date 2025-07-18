"use client";
import { jsx as ot, Fragment as Ot } from "react/jsx-runtime";
import { memo as Ut, useState as K, useRef as q, useCallback as ct, useEffect as Z, useLayoutEffect as dt, useMemo as gt, createElement as lt, startTransition as Rt } from "react";
import { createRoot as At } from "react-dom/client";
import { transformStateFunc as Nt, isFunction as at, isArray as Tt, getDifferences as Ct, isDeepEqual as st } from "./utility.js";
import { ValidationWrapper as Pt } from "./Functions.jsx";
import Ft from "superjson";
import { v4 as rt } from "uuid";
import { getGlobalStore as e, formRefStore as vt } from "./store.js";
import { useCogsConfig as kt } from "./CogsStateClient.jsx";
import { useInView as jt } from "react-intersection-observer";
function yt(t, n) {
  const S = e.getState().getInitialOptions, g = e.getState().setInitialStateOptions, y = S(t) || {};
  g(t, {
    ...y,
    ...n
  });
}
function Et({
  stateKey: t,
  options: n,
  initialOptionsPart: S
}) {
  const g = nt(t) || {}, y = S[t] || {}, v = e.getState().setInitialStateOptions, M = { ...y, ...g };
  let c = !1;
  if (n)
    for (const f in n)
      M.hasOwnProperty(f) ? (f == "localStorage" && n[f] && M[f].key !== n[f]?.key && (c = !0, M[f] = n[f]), f == "defaultState" && n[f] && M[f] !== n[f] && !st(M[f], n[f]) && (c = !0, M[f] = n[f])) : (c = !0, M[f] = n[f]);
  c && v(t, M);
}
function ie(t, { formElements: n, validation: S }) {
  return { initialState: t, formElements: n, validation: S };
}
const Lt = (t, n) => {
  let S = t;
  const [g, y] = Nt(S);
  n?.__fromSyncSchema && n?.__syncNotifications && e.getState().setInitialStateOptions("__notifications", n.__syncNotifications), Object.keys(g).forEach((c) => {
    let f = y[c] || {};
    const A = {
      ...f
    };
    if (n?.formElements && (A.formElements = {
      ...n.formElements,
      ...f.formElements || {}
    }), n?.validation && (A.validation = {
      ...n.validation,
      ...f.validation || {}
    }, n.validation.key && !f.validation?.key && (A.validation.key = `${n.validation.key}.${c}`)), Object.keys(A).length > 0) {
      const I = nt(c);
      I ? e.getState().setInitialStateOptions(c, {
        ...I,
        ...A
      }) : e.getState().setInitialStateOptions(c, A);
    }
  }), Object.keys(g).forEach((c) => {
    e.getState().initializeShadowState(c, g[c]);
  });
  const v = (c, f) => {
    const [A] = K(f?.componentId ?? rt());
    Et({
      stateKey: c,
      options: f,
      initialOptionsPart: y
    });
    const I = e.getState().getShadowValue(c) || g[c], i = f?.modifyState ? f.modifyState(I) : I;
    return zt(i, {
      stateKey: c,
      syncUpdate: f?.syncUpdate,
      componentId: A,
      localStorage: f?.localStorage,
      middleware: f?.middleware,
      reactiveType: f?.reactiveType,
      reactiveDeps: f?.reactiveDeps,
      defaultState: f?.defaultState,
      dependencies: f?.dependencies,
      serverState: f?.serverState
    });
  };
  function M(c, f) {
    Et({ stateKey: c, options: f, initialOptionsPart: y }), f.localStorage && xt(c, f), it(c);
  }
  return { useCogsState: v, setCogsOptions: M };
};
function ce(t) {
  const n = t.schemas, S = {};
  for (const v in n) {
    const M = n[v];
    S[v] = M?.schemas?.defaultValues || {};
  }
  const g = Lt(S, {
    __fromSyncSchema: !0,
    __syncNotifications: t.notifications
  });
  return {
    useCogsState: (v, M) => {
      const c = n[v];
      if (c?.apiParamsSchema && M?.apiParams) {
        const f = c.apiParamsSchema.safeParse(M.apiParams);
        if (!f.success)
          throw new Error(
            `Invalid API params for ${String(v)}: ${f.error.message}`
          );
      }
      return g.useCogsState(v, M);
    },
    setCogsOptions: g.setCogsOptions
  };
}
const {
  getInitialOptions: nt,
  getValidationErrors: le,
  setStateLog: Wt,
  updateInitialStateGlobal: _t,
  addValidationError: pt,
  removeValidationError: ut
} = e.getState(), Ht = (t, n, S, g, y) => {
  S?.log && console.log(
    "saving to localstorage",
    n,
    S.localStorage?.key,
    g
  );
  const v = at(S?.localStorage?.key) ? S.localStorage?.key(t) : S?.localStorage?.key;
  if (v && g) {
    const M = `${g}-${n}-${v}`;
    let c;
    try {
      c = St(M)?.lastSyncedWithServer;
    } catch {
    }
    const f = e.getState().getShadowMetadata(n, []), A = {
      state: t,
      lastUpdated: Date.now(),
      lastSyncedWithServer: c,
      stateSource: f?.stateSource,
      baseServerState: f?.baseServerState
    }, I = Ft.serialize(A);
    window.localStorage.setItem(
      M,
      JSON.stringify(I.json)
    );
  }
}, St = (t) => {
  if (!t) return null;
  try {
    const n = window.localStorage.getItem(t);
    return n ? JSON.parse(n) : null;
  } catch (n) {
    return console.error("Error loading from localStorage:", n), null;
  }
}, xt = (t, n) => {
  const S = e.getState().getShadowValue(t), { sessionId: g } = kt(), y = at(n?.localStorage?.key) ? n.localStorage.key(S) : n?.localStorage?.key;
  if (y && g) {
    const v = St(
      `${g}-${t}-${y}`
    );
    if (v && v.lastUpdated > (v.lastSyncedWithServer || 0))
      return it(t), !0;
  }
  return !1;
}, it = (t) => {
  const n = e.getState().getShadowMetadata(t, []);
  if (!n) return;
  const S = /* @__PURE__ */ new Set();
  n?.components?.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || S.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    S.forEach((g) => g());
  });
}, ue = (t, n) => {
  const S = e.getState().getShadowMetadata(t, []);
  if (S) {
    const g = `${t}////${n}`, y = S?.components?.get(g);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
};
function wt(t, n, S, g) {
  const y = e.getState(), v = y.getShadowMetadata(t, n);
  if (y.setShadowMetadata(t, n, {
    ...v,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: g || Date.now()
  }), Array.isArray(S)) {
    const M = y.getShadowMetadata(t, n);
    M?.arrayKeys && M.arrayKeys.forEach((c, f) => {
      const A = c.split(".").slice(1), I = S[f];
      I !== void 0 && wt(
        t,
        A,
        I,
        g
      );
    });
  } else S && typeof S == "object" && S.constructor === Object && Object.keys(S).forEach((M) => {
    const c = [...n, M], f = S[M];
    wt(t, c, f, g);
  });
}
function zt(t, {
  stateKey: n,
  localStorage: S,
  formElements: g,
  reactiveDeps: y,
  reactiveType: v,
  componentId: M,
  defaultState: c,
  syncUpdate: f,
  dependencies: A,
  serverState: I
} = {}) {
  const [i, h] = K({}), { sessionId: T } = kt();
  let z = !n;
  const [l] = K(n ?? rt()), B = e.getState().stateLog[l], J = q(/* @__PURE__ */ new Set()), H = q(M ?? rt()), W = q(
    null
  );
  W.current = nt(l) ?? null, Z(() => {
    if (f && f.stateKey === l && f.path?.[0]) {
      const o = `${f.stateKey}:${f.path.join(".")}`;
      e.getState().setSyncInfo(o, {
        timeStamp: f.timeStamp,
        userId: f.userId
      });
    }
  }, [f]);
  const m = ct(
    (o) => {
      const a = o ? { ...nt(l), ...o } : nt(l), d = a?.defaultState || c || t;
      if (a?.serverState?.status === "success" && a?.serverState?.data !== void 0)
        return {
          value: a.serverState.data,
          source: "server",
          timestamp: a.serverState.timestamp || Date.now()
        };
      if (a?.localStorage?.key && T) {
        const p = at(a.localStorage.key) ? a.localStorage.key(d) : a.localStorage.key, V = St(
          `${T}-${l}-${p}`
        );
        if (V && V.lastUpdated > (a?.serverState?.timestamp || 0))
          return {
            value: V.state,
            source: "localStorage",
            timestamp: V.lastUpdated
          };
      }
      return {
        value: d || t,
        source: "default",
        timestamp: Date.now()
      };
    },
    [l, c, t, T]
  );
  Z(() => {
    e.getState().setServerStateUpdate(l, I);
  }, [I, l]), Z(() => e.getState().subscribeToPath(l, (r) => {
    if (r?.type === "SERVER_STATE_UPDATE") {
      const a = r.serverState;
      if (a?.status === "success" && a.data !== void 0) {
        yt(l, { serverState: a });
        const u = typeof a.merge == "object" ? a.merge : a.merge === !0 ? {} : null, p = e.getState().getShadowValue(l), V = a.data;
        if (u && Array.isArray(p) && Array.isArray(V)) {
          const O = u.key || "id", C = new Set(
            p.map((x) => x[O])
          ), F = V.filter((x) => !C.has(x[O]));
          F.length > 0 && F.forEach((x) => {
            e.getState().insertShadowArrayElement(l, [], x);
            const N = e.getState().getShadowMetadata(l, []);
            if (N?.arrayKeys) {
              const j = N.arrayKeys[N.arrayKeys.length - 1];
              if (j) {
                const b = j.split(".").slice(1);
                e.getState().setShadowMetadata(l, b, {
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: a.timestamp || Date.now()
                });
                const P = e.getState().getShadowValue(j);
                P && typeof P == "object" && !Array.isArray(P) && Object.keys(P).forEach((k) => {
                  const U = [...b, k];
                  e.getState().setShadowMetadata(l, U, {
                    isDirty: !1,
                    stateSource: "server",
                    lastServerSync: a.timestamp || Date.now()
                  });
                });
              }
            }
          });
        } else
          e.getState().initializeShadowState(l, V), wt(
            l,
            [],
            V,
            a.timestamp
          );
        const _ = e.getState().getShadowMetadata(l, []);
        e.getState().setShadowMetadata(l, [], {
          ..._,
          stateSource: "server",
          lastServerSync: a.timestamp || Date.now(),
          isDirty: !1
        });
      }
    }
  }), [l, m]), Z(() => {
    const o = e.getState().getShadowMetadata(l, []);
    if (o && o.stateSource)
      return;
    const r = nt(l);
    if (r?.defaultState !== void 0 || c !== void 0) {
      const a = r?.defaultState || c;
      r?.defaultState || yt(l, {
        defaultState: a
      });
      const { value: d, source: u, timestamp: p } = m();
      e.getState().initializeShadowState(l, d), e.getState().setShadowMetadata(l, [], {
        stateSource: u,
        lastServerSync: u === "server" ? p : void 0,
        isDirty: !1,
        baseServerState: u === "server" ? d : void 0
      }), it(l);
    }
  }, [l, ...A || []]), dt(() => {
    z && yt(l, {
      formElements: g,
      defaultState: c,
      localStorage: S,
      middleware: W.current?.middleware
    });
    const o = `${l}////${H.current}`, r = e.getState().getShadowMetadata(l, []), a = r?.components || /* @__PURE__ */ new Map();
    return a.set(o, {
      forceUpdate: () => h({}),
      reactiveType: v ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: y || void 0,
      deps: y ? y(e.getState().getShadowValue(l)) : [],
      prevDeps: y ? y(e.getState().getShadowValue(l)) : []
    }), e.getState().setShadowMetadata(l, [], {
      ...r,
      components: a
    }), h({}), () => {
      const d = e.getState().getShadowMetadata(l, []), u = d?.components?.get(o);
      u?.paths && u.paths.forEach((p) => {
        const _ = p.split(".").slice(1), O = e.getState().getShadowMetadata(l, _);
        O?.pathComponents && O.pathComponents.size === 0 && (delete O.pathComponents, e.getState().setShadowMetadata(l, _, O));
      }), d?.components && e.getState().setShadowMetadata(l, [], d);
    };
  }, []);
  const Y = q(null), Q = (o, r, a) => {
    const d = [l, ...r].join(".");
    if (Array.isArray(r)) {
      const b = `${l}-${r.join(".")}`;
      J.current.add(b);
    }
    const u = e.getState(), p = u.getShadowMetadata(l, r), V = u.getShadowValue(d), _ = a.updateType === "insert" && at(o) ? o({ state: V, uuid: rt() }) : at(o) ? o(V) : o, C = {
      timeStamp: Date.now(),
      stateKey: l,
      path: r,
      updateType: a.updateType,
      status: "new",
      oldValue: V,
      newValue: _
    };
    switch (a.updateType) {
      case "insert": {
        u.insertShadowArrayElement(l, r, C.newValue), u.markAsDirty(l, r, { bubble: !0 });
        const b = u.getShadowMetadata(l, r);
        if (b?.arrayKeys) {
          const P = b.arrayKeys[b.arrayKeys.length - 1];
          if (P) {
            const k = P.split(".").slice(1);
            u.markAsDirty(l, k, { bubble: !1 });
          }
        }
        break;
      }
      case "cut": {
        const b = r.slice(0, -1);
        u.removeShadowArrayElement(l, r), u.markAsDirty(l, b, { bubble: !0 });
        break;
      }
      case "update": {
        u.updateShadowAtPath(l, r, C.newValue), u.markAsDirty(l, r, { bubble: !0 });
        break;
      }
    }
    if (a.sync !== !1 && Y.current && Y.current.connected && Y.current.updateState({ operation: C }), p?.signals && p.signals.length > 0) {
      const b = a.updateType === "cut" ? null : _;
      p.signals.forEach(({ parentId: P, position: k, effect: U }) => {
        const w = document.querySelector(`[data-parent-id="${P}"]`);
        if (w) {
          const E = Array.from(w.childNodes);
          if (E[k]) {
            let $ = b;
            if (U && b !== null)
              try {
                $ = new Function(
                  "state",
                  `return (${U})(state)`
                )(b);
              } catch (D) {
                console.error("Error evaluating effect function:", D);
              }
            $ != null && typeof $ == "object" && ($ = JSON.stringify($)), E[k].textContent = String($ ?? "");
          }
        }
      });
    }
    if (a.updateType === "insert" && p?.mapWrappers && p.mapWrappers.length > 0) {
      const b = u.getShadowMetadata(l, r)?.arrayKeys || [], P = b[b.length - 1], k = u.getShadowValue(P), U = u.getShadowValue(
        [l, ...r].join(".")
      );
      if (!P || k === void 0) return;
      p.mapWrappers.forEach((w) => {
        let E = !0, $ = -1;
        if (w.meta?.transforms && w.meta.transforms.length > 0) {
          for (const D of w.meta.transforms)
            if (D.type === "filter" && !D.fn(k, -1)) {
              E = !1;
              break;
            }
          if (E) {
            const D = It(
              l,
              r,
              w.meta.transforms
            ), R = w.meta.transforms.find(
              (L) => L.type === "sort"
            );
            if (R) {
              const L = D.map((G) => ({
                key: G,
                value: u.getShadowValue(G)
              }));
              L.push({ key: P, value: k }), L.sort((G, tt) => R.fn(G.value, tt.value)), $ = L.findIndex(
                (G) => G.key === P
              );
            } else
              $ = D.length;
          }
        } else
          E = !0, $ = b.length - 1;
        if (E && w.containerRef && w.containerRef.isConnected) {
          const D = document.createElement("div");
          D.setAttribute("data-item-path", P);
          const R = Array.from(w.containerRef.children);
          $ >= 0 && $ < R.length ? w.containerRef.insertBefore(
            D,
            R[$]
          ) : w.containerRef.appendChild(D);
          const L = At(D), G = rt(), tt = P.split(".").slice(1), et = w.rebuildStateShape({
            path: w.path,
            currentState: U,
            componentId: w.componentId,
            meta: w.meta
          });
          L.render(
            lt(Mt, {
              stateKey: l,
              itemComponentId: G,
              itemPath: tt,
              localIndex: $,
              arraySetter: et,
              rebuildStateShape: w.rebuildStateShape,
              renderFn: w.mapFn
            })
          );
        }
      });
    }
    if (a.updateType === "cut") {
      const b = r.slice(0, -1), P = u.getShadowMetadata(l, b);
      P?.mapWrappers && P.mapWrappers.length > 0 && P.mapWrappers.forEach((k) => {
        if (k.containerRef && k.containerRef.isConnected) {
          const U = k.containerRef.querySelector(
            `[data-item-path="${d}"]`
          );
          U && U.remove();
        }
      });
    }
    const x = e.getState().getShadowValue(l), N = e.getState().getShadowMetadata(l, []), j = /* @__PURE__ */ new Set();
    if (console.log(
      "rootMeta",
      l,
      e.getState().shadowStateStore
    ), !N?.components)
      return x;
    if (a.updateType === "update") {
      let b = [...r];
      for (; ; ) {
        const P = u.getShadowMetadata(l, b);
        if (P?.pathComponents && P.pathComponents.forEach((k) => {
          if (j.has(k))
            return;
          const U = N.components?.get(k);
          U && ((Array.isArray(U.reactiveType) ? U.reactiveType : [U.reactiveType || "component"]).includes("none") || (U.forceUpdate(), j.add(k)));
        }), b.length === 0)
          break;
        b.pop();
      }
      _ && typeof _ == "object" && !Tt(_) && V && typeof V == "object" && !Tt(V) && Ct(_, V).forEach((k) => {
        const U = k.split("."), w = [...r, ...U], E = u.getShadowMetadata(l, w);
        E?.pathComponents && E.pathComponents.forEach(($) => {
          if (j.has($))
            return;
          const D = N.components?.get($);
          D && ((Array.isArray(D.reactiveType) ? D.reactiveType : [D.reactiveType || "component"]).includes("none") || (D.forceUpdate(), j.add($)));
        });
      });
    } else if (a.updateType === "insert" || a.updateType === "cut") {
      const b = a.updateType === "insert" ? r : r.slice(0, -1), P = u.getShadowMetadata(l, b);
      if (P?.signals && P.signals.length > 0) {
        const k = [l, ...b].join("."), U = u.getShadowValue(k);
        P.signals.forEach(({ parentId: w, position: E, effect: $ }) => {
          const D = document.querySelector(
            `[data-parent-id="${w}"]`
          );
          if (D) {
            const R = Array.from(D.childNodes);
            if (R[E]) {
              let L = U;
              if ($)
                try {
                  L = new Function(
                    "state",
                    `return (${$})(state)`
                  )(U);
                } catch (G) {
                  console.error("Error evaluating effect function:", G), L = U;
                }
              L != null && typeof L == "object" && (L = JSON.stringify(L)), R[E].textContent = String(L ?? "");
            }
          }
        });
      }
      P?.pathComponents && P.pathComponents.forEach((k) => {
        if (!j.has(k)) {
          const U = N.components?.get(k);
          U && (U.forceUpdate(), j.add(k));
        }
      });
    }
    return N.components.forEach((b, P) => {
      if (j.has(P))
        return;
      const k = Array.isArray(b.reactiveType) ? b.reactiveType : [b.reactiveType || "component"];
      if (k.includes("all")) {
        b.forceUpdate(), j.add(P);
        return;
      }
      if (k.includes("deps") && b.depsFunction) {
        const U = u.getShadowValue(l), w = b.depsFunction(U);
        let E = !1;
        w === !0 ? E = !0 : Array.isArray(w) && (st(b.prevDeps, w) || (b.prevDeps = w, E = !0)), E && (b.forceUpdate(), j.add(P));
      }
    }), j.clear(), Wt(l, (b) => {
      const P = [...b ?? [], C], k = /* @__PURE__ */ new Map();
      return P.forEach((U) => {
        const w = `${U.stateKey}:${JSON.stringify(U.path)}`, E = k.get(w);
        E ? (E.timeStamp = Math.max(E.timeStamp, U.timeStamp), E.newValue = U.newValue, E.oldValue = E.oldValue ?? U.oldValue, E.updateType = U.updateType) : k.set(w, { ...U });
      }), Array.from(k.values());
    }), Ht(
      _,
      l,
      W.current,
      T
    ), W.current?.middleware && W.current.middleware({
      updateLog: B,
      update: C
    }), x;
  };
  e.getState().initialStateGlobal[l] || _t(l, t);
  const X = gt(() => Dt(
    l,
    Q,
    H.current,
    T
  ), [l, T]), s = W.current?.cogsSync;
  return s && (Y.current = s(X)), X;
}
function Bt(t) {
  return !t || t.length === 0 ? "" : t.map(
    (n) => (
      // Safely stringify dependencies. An empty array becomes '[]'.
      `${n.type}${JSON.stringify(n.dependencies || [])}`
    )
  ).join("");
}
const It = (t, n, S) => {
  let g = e.getState().getShadowMetadata(t, n)?.arrayKeys || [];
  if (!S || S.length === 0)
    return g;
  let y = g.map((v) => ({
    key: v,
    value: e.getState().getShadowValue(v)
  }));
  for (const v of S)
    v.type === "filter" ? y = y.filter(
      ({ value: M }, c) => v.fn(M, c)
    ) : v.type === "sort" && y.sort((M, c) => v.fn(M.value, c.value));
  return y.map(({ key: v }) => v);
}, Vt = (t, n, S) => {
  const g = `${t}////${n}`, { addPathComponent: y, getShadowMetadata: v } = e.getState(), c = v(t, [])?.components?.get(g);
  !c || c.reactiveType === "none" || !(Array.isArray(c.reactiveType) ? c.reactiveType : [c.reactiveType]).includes("component") || y(t, S, g);
}, ft = (t, n, S) => {
  const g = e.getState(), y = g.getShadowMetadata(t, []), v = /* @__PURE__ */ new Set();
  y?.components && y.components.forEach((c, f) => {
    (Array.isArray(c.reactiveType) ? c.reactiveType : [c.reactiveType || "component"]).includes("all") && (c.forceUpdate(), v.add(f));
  }), g.getShadowMetadata(t, [...n, "getSelected"])?.pathComponents?.forEach((c) => {
    y?.components?.get(c)?.forceUpdate();
  });
  const M = g.getShadowMetadata(t, n);
  for (let c of M?.arrayKeys || []) {
    const f = c + ".selected", A = g.getShadowMetadata(
      t,
      f.split(".").slice(1)
    );
    c == S && A?.pathComponents?.forEach((I) => {
      y?.components?.get(I)?.forceUpdate();
    });
  }
};
function Dt(t, n, S, g) {
  const y = /* @__PURE__ */ new Map();
  let v = 0;
  const M = (I) => {
    const i = I.join(".");
    for (const [h] of y)
      (h === i || h.startsWith(i + ".")) && y.delete(h);
    v++;
  };
  function c({
    currentState: I,
    path: i = [],
    meta: h,
    componentId: T
  }) {
    const z = i.map(String).join("."), l = [t, ...i].join(".");
    I = e.getState().getShadowValue(l, h?.validIds);
    const B = function() {
      return e().getShadowValue(t, i);
    }, J = {
      apply(W, m, Y) {
      },
      get(W, m) {
        if (m === "_rebuildStateShape")
          return c;
        if (Object.getOwnPropertyNames(f).includes(m) && i.length === 0)
          return f[m];
        if (m === "getDifferences")
          return () => {
            const s = e.getState().getShadowMetadata(t, []), o = e.getState().getShadowValue(t);
            let r;
            return s?.stateSource === "server" && s.baseServerState ? r = s.baseServerState : r = e.getState().initialStateGlobal[t], Ct(o, r);
          };
        if (m === "sync" && i.length === 0)
          return async function() {
            const s = e.getState().getInitialOptions(t), o = s?.sync;
            if (!o)
              return console.error(`No mutation defined for state key "${t}"`), { success: !1, error: "No mutation defined" };
            const r = e.getState().getShadowValue(t, []), a = s?.validation?.key;
            try {
              const d = await o.action(r);
              if (d && !d.success && d.errors && a && (e.getState().removeValidationError(a), d.errors.forEach((u) => {
                const p = [a, ...u.path].join(".");
                e.getState().addValidationError(p, u.message);
              }), it(t)), d?.success) {
                const u = e.getState().getShadowMetadata(t, []);
                e.getState().setShadowMetadata(t, [], {
                  ...u,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: r
                  // Update base server state
                }), o.onSuccess && o.onSuccess(d.data);
              } else !d?.success && o.onError && o.onError(d.error);
              return d;
            } catch (d) {
              return o.onError && o.onError(d), { success: !1, error: d };
            }
          };
        if (m === "_status" || m === "getStatus") {
          const s = () => {
            const o = e.getState().getShadowMetadata(t, i), r = e.getState().getShadowValue(l);
            return o?.isDirty === !0 ? "dirty" : o?.isDirty === !1 || o?.stateSource === "server" ? "synced" : o?.stateSource === "localStorage" ? "restored" : o?.stateSource === "default" ? "fresh" : e.getState().getShadowMetadata(t, [])?.stateSource === "server" && !o?.isDirty ? "synced" : r !== void 0 && !o ? "fresh" : "unknown";
          };
          return m === "_status" ? s() : s;
        }
        if (m === "removeStorage")
          return () => {
            const s = e.getState().initialStateGlobal[t], o = nt(t), r = at(o?.localStorage?.key) ? o.localStorage.key(s) : o?.localStorage?.key, a = `${g}-${t}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (m === "showValidationErrors")
          return () => {
            const s = e.getState().getShadowMetadata(t, i);
            return s?.validation?.status === "VALIDATION_FAILED" && s.validation.message ? [s.validation.message] : [];
          };
        if (Array.isArray(I)) {
          if (m === "getSelected")
            return () => {
              const s = t + "." + i.join(".");
              Vt(t, T, [
                ...i,
                "getSelected"
              ]);
              const o = e.getState().selectedIndicesMap;
              if (!o || !o.has(s))
                return;
              const r = o.get(s);
              if (h?.validIds && !h.validIds.includes(r))
                return;
              const a = e.getState().getShadowValue(r);
              if (a)
                return c({
                  currentState: a,
                  path: r.split(".").slice(1),
                  componentId: T
                });
            };
          if (m === "getSelectedIndex")
            return () => e.getState().getSelectedIndex(
              t + "." + i.join("."),
              h?.validIds
            );
          if (m === "clearSelected")
            return ft(t, i), () => {
              e.getState().clearSelectedIndex({
                arrayKey: t + "." + i.join(".")
              });
            };
          if (m === "useVirtualView")
            return (s) => {
              const {
                itemHeight: o = 50,
                overscan: r = 6,
                stickToBottom: a = !1,
                scrollStickTolerance: d = 75
              } = s, u = q(null), [p, V] = K({
                startIndex: 0,
                endIndex: 10
              }), [_, O] = K({}), C = q(!0), F = q({
                isUserScrolling: !1,
                lastScrollTop: 0,
                scrollUpCount: 0,
                isNearBottom: !0
              }), x = q(
                /* @__PURE__ */ new Map()
              );
              dt(() => {
                if (!a || !u.current || F.current.isUserScrolling)
                  return;
                const w = u.current;
                w.scrollTo({
                  top: w.scrollHeight,
                  behavior: C.current ? "instant" : "smooth"
                });
              }, [_, a]);
              const N = e.getState().getShadowMetadata(t, i)?.arrayKeys || [], { totalHeight: j, itemOffsets: b } = gt(() => {
                let w = 0;
                const E = /* @__PURE__ */ new Map();
                return (e.getState().getShadowMetadata(t, i)?.arrayKeys || []).forEach((D) => {
                  const R = D.split(".").slice(1), L = e.getState().getShadowMetadata(t, R)?.virtualizer?.itemHeight || o;
                  E.set(D, {
                    height: L,
                    offset: w
                  }), w += L;
                }), x.current = E, { totalHeight: w, itemOffsets: E };
              }, [N.length, o]);
              dt(() => {
                if (a && N.length > 0 && u.current && !F.current.isUserScrolling && C.current) {
                  const w = u.current, E = () => {
                    if (w.clientHeight > 0) {
                      const $ = Math.ceil(
                        w.clientHeight / o
                      ), D = N.length - 1, R = Math.max(
                        0,
                        D - $ - r
                      );
                      V({ startIndex: R, endIndex: D }), requestAnimationFrame(() => {
                        k("instant"), C.current = !1;
                      });
                    } else
                      requestAnimationFrame(E);
                  };
                  E();
                }
              }, [N.length, a, o, r]);
              const P = ct(() => {
                const w = u.current;
                if (!w) return;
                const E = w.scrollTop, { scrollHeight: $, clientHeight: D } = w, R = F.current, L = $ - (E + D), G = R.isNearBottom;
                R.isNearBottom = L <= d, E < R.lastScrollTop ? (R.scrollUpCount++, R.scrollUpCount > 3 && G && (R.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : R.isNearBottom && (R.isUserScrolling = !1, R.scrollUpCount = 0), R.lastScrollTop = E;
                let tt = 0;
                for (let et = 0; et < N.length; et++) {
                  const ht = N[et], mt = x.current.get(ht);
                  if (mt && mt.offset + mt.height > E) {
                    tt = et;
                    break;
                  }
                }
                if (tt !== p.startIndex) {
                  const et = Math.ceil(D / o);
                  V({
                    startIndex: Math.max(0, tt - r),
                    endIndex: Math.min(
                      N.length - 1,
                      tt + et + r
                    )
                  });
                }
              }, [
                N.length,
                p.startIndex,
                o,
                r,
                d
              ]);
              Z(() => {
                const w = u.current;
                if (!(!w || !a))
                  return w.addEventListener("scroll", P, {
                    passive: !0
                  }), () => {
                    w.removeEventListener("scroll", P);
                  };
              }, [P, a]);
              const k = ct(
                (w = "smooth") => {
                  const E = u.current;
                  if (!E) return;
                  F.current.isUserScrolling = !1, F.current.isNearBottom = !0, F.current.scrollUpCount = 0;
                  const $ = () => {
                    const D = (R = 0) => {
                      if (R > 5) return;
                      const L = E.scrollHeight, G = E.scrollTop, tt = E.clientHeight;
                      G + tt >= L - 1 || (E.scrollTo({
                        top: L,
                        behavior: w
                      }), setTimeout(() => {
                        const et = E.scrollHeight, ht = E.scrollTop;
                        (et !== L || ht + tt < et - 1) && D(R + 1);
                      }, 50));
                    };
                    D();
                  };
                  "requestIdleCallback" in window ? requestIdleCallback($, { timeout: 100 }) : requestAnimationFrame(() => {
                    requestAnimationFrame($);
                  });
                },
                []
              );
              return Z(() => {
                if (!a || !u.current) return;
                const w = u.current, E = F.current;
                let $;
                const D = () => {
                  clearTimeout($), $ = setTimeout(() => {
                    !E.isUserScrolling && E.isNearBottom && k(
                      C.current ? "instant" : "smooth"
                    );
                  }, 100);
                }, R = new MutationObserver(() => {
                  E.isUserScrolling || D();
                });
                R.observe(w, {
                  childList: !0,
                  subtree: !0,
                  attributes: !0,
                  attributeFilter: ["style", "class"]
                  // More specific than just 'height'
                });
                const L = (G) => {
                  G.target instanceof HTMLImageElement && !E.isUserScrolling && D();
                };
                return w.addEventListener("load", L, !0), C.current ? setTimeout(() => {
                  k("instant");
                }, 0) : D(), () => {
                  clearTimeout($), R.disconnect(), w.removeEventListener("load", L, !0);
                };
              }, [a, N.length, k]), {
                virtualState: gt(() => {
                  const w = e.getState(), E = w.getShadowValue(
                    [t, ...i].join(".")
                  ), $ = w.getShadowMetadata(t, i)?.arrayKeys || [], D = E.slice(
                    p.startIndex,
                    p.endIndex + 1
                  ), R = $.slice(
                    p.startIndex,
                    p.endIndex + 1
                  );
                  return c({
                    currentState: D,
                    path: i,
                    componentId: T,
                    meta: { ...h, validIds: R }
                  });
                }, [p.startIndex, p.endIndex, N.length]),
                virtualizerProps: {
                  outer: {
                    ref: u,
                    style: {
                      overflowY: "auto",
                      height: "100%",
                      position: "relative"
                    }
                  },
                  inner: {
                    style: {
                      height: `${j}px`,
                      position: "relative"
                    }
                  },
                  list: {
                    style: {
                      transform: `translateY(${x.current.get(
                        N[p.startIndex]
                      )?.offset || 0}px)`
                    }
                  }
                },
                scrollToBottom: k,
                scrollToIndex: (w, E = "smooth") => {
                  if (u.current && N[w]) {
                    const $ = x.current.get(N[w])?.offset || 0;
                    u.current.scrollTo({ top: $, behavior: E });
                  }
                }
              };
            };
          if (m === "stateMap")
            return (s) => {
              const [o, r] = K(
                h?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys
              ), a = e.getState().getShadowValue(l, h?.validIds);
              if (!o)
                throw new Error("No array keys found for mapping");
              const d = c({
                currentState: a,
                path: i,
                componentId: T,
                meta: h
              });
              return a.map((u, p) => {
                const V = o[p]?.split(".").slice(1), _ = c({
                  currentState: u,
                  path: V,
                  componentId: T,
                  meta: h
                });
                return s(
                  _,
                  p,
                  d
                );
              });
            };
          if (m === "$stateMap")
            return (s) => lt(qt, {
              proxy: {
                _stateKey: t,
                _path: i,
                _mapFn: s,
                _meta: h
              },
              rebuildStateShape: c
            });
          if (m === "stateFind")
            return (s) => {
              const o = h?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (o)
                for (let r = 0; r < o.length; r++) {
                  const a = o[r];
                  if (!a) continue;
                  const d = e.getState().getShadowValue(a);
                  if (s(d, r)) {
                    const u = a.split(".").slice(1);
                    return c({
                      currentState: d,
                      path: u,
                      componentId: T,
                      meta: h
                      // Pass along meta for potential further chaining
                    });
                  }
                }
            };
          if (m === "stateFilter")
            return (s) => {
              const o = h?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (!o)
                throw new Error("No array keys found for filtering.");
              const r = [], a = I.filter(
                (d, u) => s(d, u) ? (r.push(o[u]), !0) : !1
              );
              return c({
                currentState: a,
                path: i,
                componentId: T,
                meta: {
                  validIds: r,
                  transforms: [
                    ...h?.transforms || [],
                    {
                      type: "filter",
                      fn: s
                    }
                  ]
                }
              });
            };
          if (m === "stateSort")
            return (s) => {
              const o = h?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (!o)
                throw new Error("No array keys found for sorting");
              const r = I.map((a, d) => ({
                item: a,
                key: o[d]
              }));
              return r.sort((a, d) => s(a.item, d.item)).filter(Boolean), c({
                currentState: r.map((a) => a.item),
                path: i,
                componentId: T,
                meta: {
                  validIds: r.map((a) => a.key),
                  transforms: [
                    ...h?.transforms || [],
                    { type: "sort", fn: s }
                  ]
                }
              });
            };
          if (m === "stream")
            return function(s = {}) {
              const {
                bufferSize: o = 100,
                flushInterval: r = 100,
                bufferStrategy: a = "accumulate",
                store: d,
                onFlush: u
              } = s;
              let p = [], V = !1, _ = null;
              const O = (j) => {
                if (!V) {
                  if (a === "sliding" && p.length >= o)
                    p.shift();
                  else if (a === "dropping" && p.length >= o)
                    return;
                  p.push(j), p.length >= o && C();
                }
              }, C = () => {
                if (p.length === 0) return;
                const j = [...p];
                if (p = [], d) {
                  const b = d(j);
                  b !== void 0 && (Array.isArray(b) ? b : [b]).forEach((k) => {
                    n(k, i, {
                      updateType: "insert"
                    });
                  });
                } else
                  j.forEach((b) => {
                    n(b, i, {
                      updateType: "insert"
                    });
                  });
                u?.(j);
              };
              r > 0 && (_ = setInterval(C, r));
              const F = rt(), x = e.getState().getShadowMetadata(t, i) || {}, N = x.streams || /* @__PURE__ */ new Map();
              return N.set(F, { buffer: p, flushTimer: _ }), e.getState().setShadowMetadata(t, i, {
                ...x,
                streams: N
              }), {
                write: (j) => O(j),
                writeMany: (j) => j.forEach(O),
                flush: () => C(),
                pause: () => {
                  V = !0;
                },
                resume: () => {
                  V = !1, p.length > 0 && C();
                },
                close: () => {
                  C(), _ && clearInterval(_);
                  const j = e.getState().getShadowMetadata(t, i);
                  j?.streams && j.streams.delete(F);
                }
              };
            };
          if (m === "stateList")
            return (s) => /* @__PURE__ */ ot(() => {
              const r = q(/* @__PURE__ */ new Map()), a = h?.transforms && h.transforms.length > 0 ? `${T}-${Bt(h.transforms)}` : `${T}-base`, [d, u] = K({}), { validIds: p, arrayValues: V } = gt(() => {
                const O = e.getState().getShadowMetadata(t, i)?.transformCaches?.get(a);
                let C;
                O && O.validIds ? C = O.validIds : (C = It(
                  t,
                  i,
                  h?.transforms
                ), e.getState().setTransformCache(t, i, a, {
                  validIds: C,
                  computedAt: Date.now(),
                  transforms: h?.transforms || []
                }));
                const F = e.getState().getShadowValue(l, C);
                return {
                  validIds: C,
                  arrayValues: F || []
                };
              }, [a, d]);
              if (Z(() => {
                const O = e.getState().subscribeToPath(l, (C) => {
                  if (C.type === "GET_SELECTED")
                    return;
                  const x = e.getState().getShadowMetadata(t, i)?.transformCaches;
                  if (x)
                    for (const N of x.keys())
                      N.startsWith(T) && x.delete(N);
                  (C.type === "INSERT" || C.type === "REMOVE" || C.type === "CLEAR_SELECTION") && u({});
                });
                return () => {
                  O();
                };
              }, [T, l]), !Array.isArray(V))
                return null;
              const _ = c({
                currentState: V,
                path: i,
                componentId: T,
                meta: {
                  ...h,
                  validIds: p
                }
              });
              return /* @__PURE__ */ ot(Ot, { children: V.map((O, C) => {
                const F = p[C];
                if (!F)
                  return null;
                let x = r.current.get(F);
                x || (x = rt(), r.current.set(F, x));
                const N = F.split(".").slice(1);
                return lt(Mt, {
                  key: F,
                  stateKey: t,
                  itemComponentId: x,
                  itemPath: N,
                  localIndex: C,
                  arraySetter: _,
                  rebuildStateShape: c,
                  renderFn: s
                });
              }) });
            }, {});
          if (m === "stateFlattenOn")
            return (s) => {
              const o = I;
              y.clear(), v++;
              const r = o.flatMap(
                (a) => a[s] ?? []
              );
              return c({
                currentState: r,
                path: [...i, "[*]", s],
                componentId: T,
                meta: h
              });
            };
          if (m === "index")
            return (s) => {
              const r = e.getState().getShadowMetadata(t, i)?.arrayKeys?.filter(
                (u) => !h?.validIds || h?.validIds && h?.validIds?.includes(u)
              )?.[s];
              if (!r) return;
              const a = e.getState().getShadowValue(r, h?.validIds);
              return c({
                currentState: a,
                path: r.split(".").slice(1),
                componentId: T,
                meta: h
              });
            };
          if (m === "last")
            return () => {
              const s = e.getState().getShadowValue(t, i);
              if (s.length === 0) return;
              const o = s.length - 1, r = s[o], a = [...i, o.toString()];
              return c({
                currentState: r,
                path: a,
                componentId: T,
                meta: h
              });
            };
          if (m === "insert")
            return (s, o) => (n(s, i, { updateType: "insert" }), c({
              currentState: e.getState().getShadowValue(t, i),
              path: i,
              componentId: T,
              meta: h
            }));
          if (m === "uniqueInsert")
            return (s, o, r) => {
              const a = e.getState().getShadowValue(t, i), d = at(s) ? s(a) : s;
              let u = null;
              if (!a.some((V) => {
                const _ = o ? o.every(
                  (O) => st(V[O], d[O])
                ) : st(V, d);
                return _ && (u = V), _;
              }))
                M(i), n(d, i, { updateType: "insert" });
              else if (r && u) {
                const V = r(u), _ = a.map(
                  (O) => st(O, u) ? V : O
                );
                M(i), n(_, i, {
                  updateType: "update"
                });
              }
            };
          if (m === "cut")
            return (s, o) => {
              const r = h?.validIds ?? e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (!r || r.length === 0) return;
              const a = s == -1 ? r.length - 1 : s !== void 0 ? s : r.length - 1, d = r[a];
              if (!d) return;
              const u = d.split(".").slice(1);
              n(I, u, {
                updateType: "cut"
              });
            };
          if (m === "cutSelected")
            return () => {
              const s = It(
                t,
                i,
                h?.transforms
              );
              if (!s || s.length === 0) return;
              const o = e.getState().selectedIndicesMap.get(l);
              let r = s.findIndex(
                (u) => u === o
              );
              const a = s[r == -1 ? s.length - 1 : r]?.split(".").slice(1);
              e.getState().clearSelectedIndex({ arrayKey: l });
              const d = a?.slice(0, -1);
              ft(t, d), n(I, a, {
                updateType: "cut"
              });
            };
          if (m === "cutByValue")
            return (s) => {
              const o = e.getState().getShadowMetadata(t, i), r = h?.validIds ?? o?.arrayKeys;
              if (!r) return;
              let a = null;
              for (const d of r)
                if (e.getState().getShadowValue(d) === s) {
                  a = d;
                  break;
                }
              if (a) {
                const d = a.split(".").slice(1);
                n(null, d, { updateType: "cut" });
              }
            };
          if (m === "toggleByValue")
            return (s) => {
              const o = e.getState().getShadowMetadata(t, i), r = h?.validIds ?? o?.arrayKeys;
              if (!r) return;
              let a = null;
              for (const d of r) {
                const u = e.getState().getShadowValue(d);
                if (console.log("itemValue sdasdasdasd", u), u === s) {
                  a = d;
                  break;
                }
              }
              if (console.log("itemValue keyToCut", a), a) {
                const d = a.split(".").slice(1);
                console.log("itemValue keyToCut", a), n(s, d, {
                  updateType: "cut"
                });
              } else
                n(s, i, { updateType: "insert" });
            };
          if (m === "findWith")
            return (s, o) => {
              const r = e.getState().getShadowMetadata(t, i)?.arrayKeys;
              if (!r)
                throw new Error("No array keys found for sorting");
              let a = null, d = [];
              for (const u of r) {
                let p = e.getState().getShadowValue(u, h?.validIds);
                if (p && p[s] === o) {
                  a = p, d = u.split(".").slice(1);
                  break;
                }
              }
              return c({
                currentState: a,
                path: d,
                componentId: T,
                meta: h
              });
            };
        }
        if (m === "cut") {
          let s = e.getState().getShadowValue(i.join("."));
          return () => {
            n(s, i, { updateType: "cut" });
          };
        }
        if (m === "get")
          return () => (Vt(t, T, i), e.getState().getShadowValue(l, h?.validIds));
        if (m === "getState")
          return () => e.getState().getShadowValue(l, h?.validIds);
        if (m === "$derive")
          return (s) => bt({
            _stateKey: t,
            _path: i,
            _effect: s.toString(),
            _meta: h
          });
        if (m === "$get")
          return () => bt({ _stateKey: t, _path: i, _meta: h });
        if (m === "lastSynced") {
          const s = `${t}:${i.join(".")}`;
          return e.getState().getSyncInfo(s);
        }
        if (m == "getLocalStorage")
          return (s) => St(g + "-" + t + "-" + s);
        if (m === "isSelected") {
          const s = [t, ...i].slice(0, -1);
          if (ft(t, i, void 0), Array.isArray(
            e.getState().getShadowValue(s.join("."), h?.validIds)
          )) {
            i[i.length - 1];
            const o = s.join("."), r = e.getState().selectedIndicesMap.get(o), a = t + "." + i.join(".");
            return r === a;
          }
          return;
        }
        if (m === "setSelected")
          return (s) => {
            const o = i.slice(0, -1), r = t + "." + o.join("."), a = t + "." + i.join(".");
            ft(t, o, void 0), e.getState().selectedIndicesMap.get(r), s && e.getState().setSelectedIndex(r, a);
          };
        if (m === "toggleSelected")
          return () => {
            const s = i.slice(0, -1), o = t + "." + s.join("."), r = t + "." + i.join(".");
            e.getState().selectedIndicesMap.get(o) === r ? e.getState().clearSelectedIndex({ arrayKey: o }) : e.getState().setSelectedIndex(o, r);
          };
        if (m === "_componentId")
          return T;
        if (i.length == 0) {
          if (m === "addValidation")
            return (s) => {
              const o = e.getState().getInitialOptions(t)?.validation;
              if (!o?.key) throw new Error("Validation key not found");
              ut(o.key), s.forEach((r) => {
                const a = [o.key, ...r.path].join(".");
                pt(a, r.message);
              }), it(t);
            };
          if (m === "applyJsonPatch")
            return (s) => {
              const o = e.getState(), r = o.getShadowMetadata(t, []);
              if (!r?.components) return;
              const a = (u) => !u || u === "/" ? [] : u.split("/").slice(1).map((p) => p.replace(/~1/g, "/").replace(/~0/g, "~")), d = /* @__PURE__ */ new Set();
              for (const u of s) {
                const p = a(u.path);
                switch (u.op) {
                  case "add":
                  case "replace": {
                    const { value: V } = u;
                    o.updateShadowAtPath(t, p, V), o.markAsDirty(t, p, { bubble: !0 });
                    let _ = [...p];
                    for (; ; ) {
                      const O = o.getShadowMetadata(
                        t,
                        _
                      );
                      if (console.log("pathMeta", O), O?.pathComponents && O.pathComponents.forEach((C) => {
                        if (!d.has(C)) {
                          const F = r.components?.get(C);
                          F && (F.forceUpdate(), d.add(C));
                        }
                      }), _.length === 0) break;
                      _.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const V = p.slice(0, -1);
                    o.removeShadowArrayElement(t, p), o.markAsDirty(t, V, { bubble: !0 });
                    let _ = [...V];
                    for (; ; ) {
                      const O = o.getShadowMetadata(
                        t,
                        _
                      );
                      if (O?.pathComponents && O.pathComponents.forEach((C) => {
                        if (!d.has(C)) {
                          const F = r.components?.get(C);
                          F && (F.forceUpdate(), d.add(C));
                        }
                      }), _.length === 0) break;
                      _.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (m === "validateZodSchema")
            return () => {
              const s = e.getState().getInitialOptions(t)?.validation, o = s?.zodSchemaV4 || s?.zodSchemaV3;
              if (!o || !s?.key)
                throw new Error(
                  "Zod schema (v3 or v4) or validation key not found"
                );
              ut(s.key);
              const r = e.getState().getShadowValue(t), a = o.safeParse(r);
              return a.success ? !0 : ("issues" in a.error ? a.error.issues.forEach((d) => {
                const u = [s.key, ...d.path].join(".");
                pt(u, d.message);
              }) : a.error.errors.forEach((d) => {
                const u = [s.key, ...d.path].join(".");
                pt(u, d.message);
              }), it(t), !1);
            };
          if (m === "getComponents")
            return () => e.getState().getShadowMetadata(t, [])?.components;
          if (m === "getAllFormRefs")
            return () => vt.getState().getFormRefsByStateKey(t);
        }
        if (m === "getFormRef")
          return () => vt.getState().getFormRef(t + "." + i.join("."));
        if (m === "validationWrapper")
          return ({
            children: s,
            hideMessage: o
          }) => /* @__PURE__ */ ot(
            Pt,
            {
              formOpts: o ? { validation: { message: "" } } : void 0,
              path: i,
              stateKey: t,
              children: s
            }
          );
        if (m === "_stateKey") return t;
        if (m === "_path") return i;
        if (m === "update")
          return (s) => (n(s, i, { updateType: "update" }), {
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
              const r = [t, ...i].join(".");
              e.getState().notifyPathSubscribers(r, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (m === "toggle") {
          const s = e.getState().getShadowValue([t, ...i].join("."));
          if (console.log("currentValueAtPath", s), typeof I != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            n(!s, i, {
              updateType: "update"
            });
          };
        }
        if (m === "formElement")
          return (s, o) => /* @__PURE__ */ ot(
            Zt,
            {
              stateKey: t,
              path: i,
              rebuildStateShape: c,
              setState: n,
              formOpts: o,
              renderFn: s
            }
          );
        const Q = [...i, m], X = e.getState().getShadowValue(t, Q);
        return c({
          currentState: X,
          path: Q,
          componentId: T,
          meta: h
        });
      }
    }, H = new Proxy(B, J);
    return y.set(z, {
      proxy: H,
      stateVersion: v
    }), H;
  }
  const f = {
    removeValidation: (I) => {
      I?.validationKey && ut(I.validationKey);
    },
    revertToInitialState: (I) => {
      const i = e.getState().getInitialOptions(t)?.validation;
      i?.key && ut(i.key), I?.validationKey && ut(I.validationKey);
      const h = e.getState().getShadowMetadata(t, []);
      h?.stateSource === "server" && h.baseServerState ? h.baseServerState : e.getState().initialStateGlobal[t];
      const T = e.getState().initialStateGlobal[t];
      e.getState().clearSelectedIndexesForState(t), y.clear(), v++, e.getState().initializeShadowState(t, T), c({
        currentState: T,
        path: [],
        componentId: S
      });
      const z = nt(t), l = at(z?.localStorage?.key) ? z?.localStorage?.key(T) : z?.localStorage?.key, B = `${g}-${t}-${l}`;
      B && localStorage.removeItem(B);
      const J = e.getState().getShadowMetadata(t, []);
      return J && J?.components?.forEach((H) => {
        H.forceUpdate();
      }), T;
    },
    updateInitialState: (I) => {
      y.clear(), v++;
      const i = Dt(
        t,
        n,
        S,
        g
      ), h = e.getState().initialStateGlobal[t], T = nt(t), z = at(T?.localStorage?.key) ? T?.localStorage?.key(h) : T?.localStorage?.key, l = `${g}-${t}-${z}`;
      return localStorage.getItem(l) && localStorage.removeItem(l), Rt(() => {
        _t(t, I), e.getState().initializeShadowState(t, I);
        const B = e.getState().getShadowMetadata(t, []);
        B && B?.components?.forEach((J) => {
          J.forceUpdate();
        });
      }), {
        fetchId: (B) => i.get()[B]
      };
    }
  };
  return c({
    currentState: e.getState().getShadowValue(t, []),
    componentId: S,
    path: []
  });
}
function bt(t) {
  return lt(Gt, { proxy: t });
}
function qt({
  proxy: t,
  rebuildStateShape: n
}) {
  const S = q(null), g = q(`map-${crypto.randomUUID()}`), y = q(!1), v = q(/* @__PURE__ */ new Map());
  Z(() => {
    const c = S.current;
    if (!c || y.current) return;
    const f = setTimeout(() => {
      const A = e.getState().getShadowMetadata(t._stateKey, t._path) || {}, I = A.mapWrappers || [];
      I.push({
        instanceId: g.current,
        mapFn: t._mapFn,
        containerRef: c,
        rebuildStateShape: n,
        path: t._path,
        componentId: g.current,
        meta: t._meta
      }), e.getState().setShadowMetadata(t._stateKey, t._path, {
        ...A,
        mapWrappers: I
      }), y.current = !0, M();
    }, 0);
    return () => {
      if (clearTimeout(f), g.current) {
        const A = e.getState().getShadowMetadata(t._stateKey, t._path) || {};
        A.mapWrappers && (A.mapWrappers = A.mapWrappers.filter(
          (I) => I.instanceId !== g.current
        ), e.getState().setShadowMetadata(t._stateKey, t._path, A));
      }
      v.current.forEach((A) => A.unmount());
    };
  }, []);
  const M = () => {
    const c = S.current;
    if (!c) return;
    const f = e.getState().getShadowValue(
      [t._stateKey, ...t._path].join("."),
      t._meta?.validIds
    );
    if (!Array.isArray(f)) return;
    const A = t._meta?.validIds ?? e.getState().getShadowMetadata(t._stateKey, t._path)?.arrayKeys ?? [], I = n({
      currentState: f,
      path: t._path,
      componentId: g.current,
      meta: t._meta
    });
    f.forEach((i, h) => {
      const T = A[h];
      if (!T) return;
      const z = rt(), l = document.createElement("div");
      l.setAttribute("data-item-path", T), c.appendChild(l);
      const B = At(l);
      v.current.set(T, B);
      const J = T.split(".").slice(1);
      B.render(
        lt(Mt, {
          stateKey: t._stateKey,
          itemComponentId: z,
          itemPath: J,
          localIndex: h,
          arraySetter: I,
          rebuildStateShape: n,
          renderFn: t._mapFn
        })
      );
    });
  };
  return /* @__PURE__ */ ot("div", { ref: S, "data-map-container": g.current });
}
function Gt({
  proxy: t
}) {
  const n = q(null), S = q(null), g = q(!1), y = `${t._stateKey}-${t._path.join(".")}`, v = e.getState().getShadowValue(
    [t._stateKey, ...t._path].join("."),
    t._meta?.validIds
  );
  return Z(() => {
    const M = n.current;
    if (!M || g.current) return;
    const c = setTimeout(() => {
      if (!M.parentElement) {
        console.warn("Parent element not found for signal", y);
        return;
      }
      const f = M.parentElement, I = Array.from(f.childNodes).indexOf(M);
      let i = f.getAttribute("data-parent-id");
      i || (i = `parent-${crypto.randomUUID()}`, f.setAttribute("data-parent-id", i)), S.current = `instance-${crypto.randomUUID()}`;
      const h = e.getState().getShadowMetadata(t._stateKey, t._path) || {}, T = h.signals || [];
      T.push({
        instanceId: S.current,
        parentId: i,
        position: I,
        effect: t._effect
      }), e.getState().setShadowMetadata(t._stateKey, t._path, {
        ...h,
        signals: T
      });
      let z = v;
      if (t._effect)
        try {
          z = new Function(
            "state",
            `return (${t._effect})(state)`
          )(v);
        } catch (B) {
          console.error("Error evaluating effect function:", B);
        }
      z !== null && typeof z == "object" && (z = JSON.stringify(z));
      const l = document.createTextNode(String(z ?? ""));
      M.replaceWith(l), g.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(c), S.current) {
        const f = e.getState().getShadowMetadata(t._stateKey, t._path) || {};
        f.signals && (f.signals = f.signals.filter(
          (A) => A.instanceId !== S.current
        ), e.getState().setShadowMetadata(t._stateKey, t._path, f));
      }
    };
  }, []), lt("span", {
    ref: n,
    style: { display: "contents" },
    "data-signal-id": y
  });
}
const Mt = Ut(
  Yt,
  (t, n) => t.itemPath.join(".") === n.itemPath.join(".") && t.stateKey === n.stateKey && t.itemComponentId === n.itemComponentId && t.localIndex === n.localIndex
), Jt = (t) => {
  const [n, S] = K(!1);
  return dt(() => {
    if (!t.current) {
      S(!0);
      return;
    }
    const g = Array.from(t.current.querySelectorAll("img"));
    if (g.length === 0) {
      S(!0);
      return;
    }
    let y = 0;
    const v = () => {
      y++, y === g.length && S(!0);
    };
    return g.forEach((M) => {
      M.complete ? v() : (M.addEventListener("load", v), M.addEventListener("error", v));
    }), () => {
      g.forEach((M) => {
        M.removeEventListener("load", v), M.removeEventListener("error", v);
      });
    };
  }, [t.current]), n;
};
function Yt({
  stateKey: t,
  itemComponentId: n,
  itemPath: S,
  localIndex: g,
  arraySetter: y,
  rebuildStateShape: v,
  renderFn: M
}) {
  const [, c] = K({}), { ref: f, inView: A } = jt(), I = q(null), i = Jt(I), h = q(!1), T = [t, ...S].join(".");
  $t(t, n, c);
  const z = ct(
    (W) => {
      I.current = W, f(W);
    },
    [f]
  );
  Z(() => {
    e.getState().subscribeToPath(T, (W) => {
      c({});
    });
  }, []), Z(() => {
    if (!A || !i || h.current)
      return;
    const W = I.current;
    if (W && W.offsetHeight > 0) {
      h.current = !0;
      const m = W.offsetHeight;
      e.getState().setShadowMetadata(t, S, {
        virtualizer: {
          itemHeight: m,
          domRef: W
        }
      });
      const Y = S.slice(0, -1), Q = [t, ...Y].join(".");
      e.getState().notifyPathSubscribers(Q, {
        type: "ITEMHEIGHT",
        itemKey: S.join("."),
        ref: I.current
      });
    }
  }, [A, i, t, S]);
  const l = [t, ...S].join("."), B = e.getState().getShadowValue(l);
  if (B === void 0)
    return null;
  const J = v({
    currentState: B,
    path: S,
    componentId: n
  }), H = M(J, g, y);
  return /* @__PURE__ */ ot("div", { ref: z, children: H });
}
function Zt({
  stateKey: t,
  path: n,
  rebuildStateShape: S,
  renderFn: g,
  formOpts: y,
  setState: v
}) {
  const [M] = K(() => rt()), [, c] = K({}), f = [t, ...n].join(".");
  $t(t, M, c);
  const A = e.getState().getShadowValue(f), [I, i] = K(A), h = q(!1), T = q(null);
  Z(() => {
    !h.current && !st(A, I) && i(A);
  }, [A]), Z(() => {
    const H = e.getState().subscribeToPath(f, (W) => {
      !h.current && I !== W && c({});
    });
    return () => {
      H(), T.current && (clearTimeout(T.current), h.current = !1);
    };
  }, []);
  const z = ct(
    (H) => {
      typeof A === "number" && typeof H == "string" && (H = H === "" ? 0 : Number(H)), i(H), h.current = !0, T.current && clearTimeout(T.current);
      const m = y?.debounceTime ?? 200;
      T.current = setTimeout(() => {
        h.current = !1, v(H, n, { updateType: "update" });
        const { getInitialOptions: Y, setShadowMetadata: Q, getShadowMetadata: X } = e.getState(), s = Y(t)?.validation, o = s?.zodSchemaV4 || s?.zodSchemaV3;
        if (o) {
          const r = e.getState().getShadowValue(t), a = o.safeParse(r), d = X(t, n) || {};
          if (a.success)
            Q(t, n, {
              ...d,
              validation: {
                status: "VALID_LIVE",
                validatedValue: H
              }
            });
          else {
            const p = ("issues" in a.error ? a.error.issues : a.error.errors).filter(
              (V) => JSON.stringify(V.path) === JSON.stringify(n)
            );
            p.length > 0 ? Q(t, n, {
              ...d,
              validation: {
                status: "INVALID_LIVE",
                message: p[0]?.message,
                validatedValue: H
              }
            }) : Q(t, n, {
              ...d,
              validation: {
                status: "VALID_LIVE",
                validatedValue: H
              }
            });
          }
        }
      }, m), c({});
    },
    [v, n, y?.debounceTime, t]
  ), l = ct(async () => {
    console.log("handleBlur triggered"), T.current && (clearTimeout(T.current), T.current = null, h.current = !1, v(I, n, { updateType: "update" }));
    const { getInitialOptions: H } = e.getState(), W = H(t)?.validation, m = W?.zodSchemaV4 || W?.zodSchemaV3;
    if (!m) return;
    const Y = e.getState().getShadowMetadata(t, n);
    e.getState().setShadowMetadata(t, n, {
      ...Y,
      validation: {
        status: "DIRTY",
        validatedValue: I
      }
    });
    const Q = e.getState().getShadowValue(t), X = m.safeParse(Q);
    if (console.log("result ", X), X.success)
      e.getState().setShadowMetadata(t, n, {
        ...Y,
        validation: {
          status: "VALID_PENDING_SYNC",
          validatedValue: I
        }
      });
    else {
      const s = "issues" in X.error ? X.error.issues : X.error.errors;
      console.log("All validation errors:", s), console.log("Current blur path:", n);
      const o = s.filter((r) => {
        if (console.log("Processing error:", r), n.some((d) => d.startsWith("id:"))) {
          console.log("Detected array path with ULID");
          const d = n[0].startsWith("id:") ? [] : n.slice(0, -1);
          console.log("Parent path:", d);
          const u = e.getState().getShadowMetadata(t, d);
          if (console.log("Array metadata:", u), u?.arrayKeys) {
            const p = [t, ...n.slice(0, -1)].join("."), V = u.arrayKeys.indexOf(p);
            console.log("Item key:", p, "Index:", V);
            const _ = [...d, V, ...n.slice(-1)], O = JSON.stringify(r.path) === JSON.stringify(_);
            return console.log("Zod path comparison:", {
              zodPath: _,
              errorPath: r.path,
              match: O
            }), O;
          }
        }
        const a = JSON.stringify(r.path) === JSON.stringify(n);
        return console.log("Direct path comparison:", {
          errorPath: r.path,
          currentPath: n,
          match: a
        }), a;
      });
      console.log("Filtered path errors:", o), e.getState().setShadowMetadata(t, n, {
        ...Y,
        validation: {
          status: "VALIDATION_FAILED",
          message: o[0]?.message,
          validatedValue: I
        }
      });
    }
    c({});
  }, [t, n, I, v]), B = S({
    currentState: A,
    path: n,
    componentId: M
  }), J = new Proxy(B, {
    get(H, W) {
      return W === "inputProps" ? {
        value: I ?? "",
        onChange: (m) => {
          z(m.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: l,
        ref: vt.getState().getFormRef(t + "." + n.join("."))
      } : H[W];
    }
  });
  return /* @__PURE__ */ ot(Pt, { formOpts: y, path: n, stateKey: t, children: g(J) });
}
function $t(t, n, S) {
  const g = `${t}////${n}`;
  dt(() => {
    const { registerComponent: y, unregisterComponent: v } = e.getState();
    return y(t, g, {
      forceUpdate: () => S({}),
      paths: /* @__PURE__ */ new Set(),
      reactiveType: ["component"]
    }), () => {
      v(t, g);
    };
  }, [t, g]);
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
