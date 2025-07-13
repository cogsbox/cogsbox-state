"use client";
import { jsx as ae, Fragment as ke } from "react/jsx-runtime";
import { memo as je, useState as Z, useRef as q, useCallback as ie, useEffect as Y, useLayoutEffect as ue, useMemo as fe, createElement as ce, startTransition as Re } from "react";
import { createRoot as Ce } from "react-dom/client";
import { transformStateFunc as Fe, isFunction as K, isArray as Te, getDifferences as Pe, isDeepEqual as se } from "./utility.js";
import { ValidationWrapper as Ve } from "./Functions.jsx";
import Oe from "superjson";
import { v4 as ee } from "uuid";
import { getGlobalStore as t, formRefStore as pe } from "./store.js";
import { useCogsConfig as _e } from "./CogsStateClient.jsx";
import { applyPatch as Le } from "fast-json-patch";
import { useInView as Ne } from "react-intersection-observer";
function he(e, s) {
  const f = t.getState().getInitialOptions, S = t.getState().setInitialStateOptions, h = f(e) || {};
  S(e, {
    ...h,
    ...s
  });
}
function Ee({
  stateKey: e,
  options: s,
  initialOptionsPart: f
}) {
  const S = te(e) || {}, h = f[e] || {}, p = t.getState().setInitialStateOptions, w = { ...h, ...S };
  let l = !1;
  if (s)
    for (const u in s)
      w.hasOwnProperty(u) ? (u == "localStorage" && s[u] && w[u].key !== s[u]?.key && (l = !0, w[u] = s[u]), u == "defaultState" && s[u] && w[u] !== s[u] && !se(w[u], s[u]) && (l = !0, w[u] = s[u])) : (l = !0, w[u] = s[u]);
  l && p(e, w);
}
function lt(e, { formElements: s, validation: f }) {
  return { initialState: e, formElements: s, validation: f };
}
const ut = (e, s) => {
  let f = e;
  const [S, h] = Fe(f);
  Object.keys(S).forEach((l) => {
    let u = h[l] || {};
    const A = {
      ...u
    };
    if (s?.formElements && (A.formElements = {
      ...s.formElements,
      ...u.formElements || {}
    }), s?.validation && (A.validation = {
      ...s.validation,
      ...u.validation || {}
    }, s.validation.key && !u.validation?.key && (A.validation.key = `${s.validation.key}.${l}`)), Object.keys(A).length > 0) {
      const T = te(l);
      T ? t.getState().setInitialStateOptions(l, {
        ...T,
        ...A
      }) : t.getState().setInitialStateOptions(l, A);
    }
  }), Object.keys(S).forEach((l) => {
    t.getState().initializeShadowState(l, S[l]);
  });
  const p = (l, u) => {
    const [A] = Z(u?.componentId ?? ee());
    Ee({
      stateKey: l,
      options: u,
      initialOptionsPart: h
    });
    const T = t.getState().getShadowValue(l) || S[l], o = u?.modifyState ? u.modifyState(T) : T;
    return qe(o, {
      stateKey: l,
      syncUpdate: u?.syncUpdate,
      componentId: A,
      localStorage: u?.localStorage,
      middleware: u?.middleware,
      reactiveType: u?.reactiveType,
      reactiveDeps: u?.reactiveDeps,
      defaultState: u?.defaultState,
      dependencies: u?.dependencies,
      serverState: u?.serverState
    });
  };
  function w(l, u) {
    Ee({ stateKey: l, options: u, initialOptionsPart: h }), u.localStorage && Be(l, u), oe(l);
  }
  return { useCogsState: p, setCogsOptions: w };
}, {
  getInitialOptions: te,
  getValidationErrors: We,
  setStateLog: He,
  updateInitialStateGlobal: $e,
  addValidationError: ve,
  removeValidationError: re
} = t.getState(), xe = (e, s, f, S, h) => {
  f?.log && console.log(
    "saving to localstorage",
    s,
    f.localStorage?.key,
    S
  );
  const p = K(f?.localStorage?.key) ? f.localStorage?.key(e) : f?.localStorage?.key;
  if (p && S) {
    const w = `${S}-${s}-${p}`;
    let l;
    try {
      l = Se(w)?.lastSyncedWithServer;
    } catch {
    }
    const u = t.getState().getShadowMetadata(s, []), A = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: l,
      stateSource: u?.stateSource,
      baseServerState: u?.baseServerState
    }, T = Oe.serialize(A);
    window.localStorage.setItem(
      w,
      JSON.stringify(T.json)
    );
  }
}, Se = (e) => {
  if (!e) return null;
  try {
    const s = window.localStorage.getItem(e);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, Be = (e, s) => {
  const f = t.getState().getShadowValue(e), { sessionId: S } = _e(), h = K(s?.localStorage?.key) ? s.localStorage.key(f) : s?.localStorage?.key;
  if (h && S) {
    const p = Se(
      `${S}-${e}-${h}`
    );
    if (p && p.lastUpdated > (p.lastSyncedWithServer || 0))
      return oe(e), !0;
  }
  return !1;
}, oe = (e) => {
  const s = t.getState().getShadowMetadata(e, []);
  if (!s) return;
  const f = /* @__PURE__ */ new Set();
  s?.components?.forEach((S) => {
    (S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : null)?.includes("none") || f.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    f.forEach((S) => S());
  });
}, dt = (e, s) => {
  const f = t.getState().getShadowMetadata(e, []);
  if (f) {
    const S = `${e}////${s}`, h = f?.components?.get(S);
    if ((h ? Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"] : null)?.includes("none"))
      return;
    h && h.forceUpdate();
  }
};
function we(e, s, f, S) {
  const h = t.getState(), p = h.getShadowMetadata(e, s);
  if (h.setShadowMetadata(e, s, {
    ...p,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: S || Date.now()
  }), Array.isArray(f)) {
    const w = h.getShadowMetadata(e, s);
    w?.arrayKeys && w.arrayKeys.forEach((l, u) => {
      const A = l.split(".").slice(1), T = f[u];
      T !== void 0 && we(
        e,
        A,
        T,
        S
      );
    });
  } else f && typeof f == "object" && f.constructor === Object && Object.keys(f).forEach((w) => {
    const l = [...s, w], u = f[w];
    we(e, l, u, S);
  });
}
function qe(e, {
  stateKey: s,
  localStorage: f,
  formElements: S,
  reactiveDeps: h,
  reactiveType: p,
  componentId: w,
  defaultState: l,
  syncUpdate: u,
  dependencies: A,
  serverState: T
} = {}) {
  const [o, g] = Z({}), { sessionId: I } = _e();
  let H = !s;
  const [c] = Z(s ?? ee()), x = t.getState().stateLog[c], J = q(/* @__PURE__ */ new Set()), G = q(w ?? ee()), F = q(
    null
  );
  F.current = te(c) ?? null, Y(() => {
    if (u && u.stateKey === c && u.path?.[0]) {
      const n = `${u.stateKey}:${u.path.join(".")}`;
      t.getState().setSyncInfo(n, {
        timeStamp: u.timeStamp,
        userId: u.userId
      });
    }
  }, [u]);
  const v = ie(
    (n) => {
      const r = n ? { ...te(c), ...n } : te(c), i = r?.defaultState || l || e;
      if (r?.serverState?.status === "success" && r?.serverState?.data !== void 0)
        return {
          value: r.serverState.data,
          source: "server",
          timestamp: r.serverState.timestamp || Date.now()
        };
      if (r?.localStorage?.key && I) {
        const d = K(r.localStorage.key) ? r.localStorage.key(i) : r.localStorage.key, V = Se(
          `${I}-${c}-${d}`
        );
        if (V && V.lastUpdated > (r?.serverState?.timestamp || 0))
          return {
            value: V.state,
            source: "localStorage",
            timestamp: V.lastUpdated
          };
      }
      return {
        value: i || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [c, l, e, I]
  );
  Y(() => {
    t.getState().setServerStateUpdate(c, T);
  }, [T, c]), Y(() => t.getState().subscribeToPath(c, (a) => {
    if (a?.type === "SERVER_STATE_UPDATE") {
      const r = a.serverState;
      if (r?.status === "success" && r.data !== void 0) {
        he(c, { serverState: r });
        const m = typeof r.merge == "object" ? r.merge : r.merge === !0 ? {} : null, d = t.getState().getShadowValue(c), V = r.data;
        if (m && Array.isArray(d) && Array.isArray(V)) {
          const $ = m.key || "id", B = new Set(
            d.map((U) => U[$])
          ), D = V.filter((U) => !B.has(U[$]));
          D.length > 0 && D.forEach((U) => {
            t.getState().insertShadowArrayElement(c, [], U);
            const W = t.getState().getShadowMetadata(c, []);
            if (W?.arrayKeys) {
              const j = W.arrayKeys[W.arrayKeys.length - 1];
              if (j) {
                const L = j.split(".").slice(1);
                t.getState().setShadowMetadata(c, L, {
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: r.timestamp || Date.now()
                });
                const E = t.getState().getShadowValue(j);
                E && typeof E == "object" && !Array.isArray(E) && Object.keys(E).forEach((b) => {
                  const k = [...L, b];
                  t.getState().setShadowMetadata(c, k, {
                    isDirty: !1,
                    stateSource: "server",
                    lastServerSync: r.timestamp || Date.now()
                  });
                });
              }
            }
          });
        } else
          t.getState().initializeShadowState(c, V), we(
            c,
            [],
            V,
            r.timestamp
          );
        const _ = t.getState().getShadowMetadata(c, []);
        t.getState().setShadowMetadata(c, [], {
          ..._,
          stateSource: "server",
          lastServerSync: r.timestamp || Date.now(),
          isDirty: !1
        });
      }
    }
  }), [c, v]), Y(() => {
    const n = t.getState().getShadowMetadata(c, []);
    if (n && n.stateSource)
      return;
    const a = te(c);
    if (a?.defaultState !== void 0 || l !== void 0) {
      const r = a?.defaultState || l;
      a?.defaultState || he(c, {
        defaultState: r
      });
      const { value: i, source: m, timestamp: d } = v();
      t.getState().initializeShadowState(c, i), t.getState().setShadowMetadata(c, [], {
        stateSource: m,
        lastServerSync: m === "server" ? d : void 0,
        isDirty: !1,
        baseServerState: m === "server" ? i : void 0
      }), oe(c);
    }
  }, [c, ...A || []]), ue(() => {
    H && he(c, {
      formElements: S,
      defaultState: l,
      localStorage: f,
      middleware: F.current?.middleware
    });
    const n = `${c}////${G.current}`, a = t.getState().getShadowMetadata(c, []), r = a?.components || /* @__PURE__ */ new Map();
    return r.set(n, {
      forceUpdate: () => g({}),
      reactiveType: p ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: h || void 0,
      deps: h ? h(t.getState().getShadowValue(c)) : [],
      prevDeps: h ? h(t.getState().getShadowValue(c)) : []
    }), t.getState().setShadowMetadata(c, [], {
      ...a,
      components: r
    }), g({}), () => {
      const i = t.getState().getShadowMetadata(c, []), m = i?.components?.get(n);
      m?.paths && m.paths.forEach((d) => {
        const _ = d.split(".").slice(1), $ = t.getState().getShadowMetadata(c, _);
        $?.pathComponents && $.pathComponents.size === 0 && (delete $.pathComponents, t.getState().setShadowMetadata(c, _, $));
      }), i?.components && t.getState().setShadowMetadata(c, [], i);
    };
  }, []);
  const le = (n, a, r, i) => {
    const m = [c, ...a].join(".");
    if (Array.isArray(a)) {
      const E = `${c}-${a.join(".")}`;
      J.current.add(E);
    }
    const d = t.getState(), V = d.getShadowMetadata(c, a), _ = d.getShadowValue(m), $ = r.updateType === "insert" && K(n) ? n({ state: _, uuid: ee() }) : K(n) ? n(_) : n, D = {
      timeStamp: Date.now(),
      stateKey: c,
      path: a,
      updateType: r.updateType,
      status: "new",
      oldValue: _,
      newValue: $
    };
    switch (r.updateType) {
      case "insert": {
        d.insertShadowArrayElement(c, a, D.newValue), d.markAsDirty(c, a, { bubble: !0 });
        const E = d.getShadowMetadata(c, a);
        if (E?.arrayKeys) {
          const b = E.arrayKeys[E.arrayKeys.length - 1];
          if (b) {
            const k = b.split(".").slice(1);
            d.markAsDirty(c, k, { bubble: !1 });
          }
        }
        break;
      }
      case "cut": {
        const E = a.slice(0, -1);
        d.removeShadowArrayElement(c, a), d.markAsDirty(c, E, { bubble: !0 });
        break;
      }
      case "update": {
        d.updateShadowAtPath(c, a, D.newValue), d.markAsDirty(c, a, { bubble: !0 });
        break;
      }
    }
    if (V?.signals && V.signals.length > 0) {
      const E = r.updateType === "cut" ? null : $;
      V.signals.forEach(({ parentId: b, position: k, effect: O }) => {
        const y = document.querySelector(`[data-parent-id="${b}"]`);
        if (y) {
          const M = Array.from(y.childNodes);
          if (M[k]) {
            let C = E;
            if (O && E !== null)
              try {
                C = new Function(
                  "state",
                  `return (${O})(state)`
                )(E);
              } catch (P) {
                console.error("Error evaluating effect function:", P);
              }
            C != null && typeof C == "object" && (C = JSON.stringify(C)), M[k].textContent = String(C ?? "");
          }
        }
      });
    }
    if (r.updateType === "insert" && V?.mapWrappers && V.mapWrappers.length > 0) {
      const E = d.getShadowMetadata(c, a)?.arrayKeys || [], b = E[E.length - 1], k = d.getShadowValue(b), O = d.getShadowValue(
        [c, ...a].join(".")
      );
      if (!b || k === void 0) return;
      V.mapWrappers.forEach((y) => {
        let M = !0, C = -1;
        if (y.meta?.transforms && y.meta.transforms.length > 0) {
          for (const P of y.meta.transforms)
            if (P.type === "filter" && !P.fn(k, -1)) {
              M = !1;
              break;
            }
          if (M) {
            const P = Ie(
              c,
              a,
              y.meta.transforms
            ), R = y.meta.transforms.find(
              (N) => N.type === "sort"
            );
            if (R) {
              const N = P.map((z) => ({
                key: z,
                value: d.getShadowValue(z)
              }));
              N.push({ key: b, value: k }), N.sort((z, Q) => R.fn(z.value, Q.value)), C = N.findIndex(
                (z) => z.key === b
              );
            } else
              C = P.length;
          }
        } else
          M = !0, C = E.length - 1;
        if (M && y.containerRef && y.containerRef.isConnected) {
          const P = document.createElement("div");
          P.setAttribute("data-item-path", b);
          const R = Array.from(y.containerRef.children);
          C >= 0 && C < R.length ? y.containerRef.insertBefore(
            P,
            R[C]
          ) : y.containerRef.appendChild(P);
          const N = Ce(P), z = ee(), Q = b.split(".").slice(1), X = y.rebuildStateShape({
            path: y.path,
            currentState: O,
            componentId: y.componentId,
            meta: y.meta
          });
          N.render(
            ce(Me, {
              stateKey: c,
              itemComponentId: z,
              itemPath: Q,
              localIndex: C,
              arraySetter: X,
              rebuildStateShape: y.rebuildStateShape,
              renderFn: y.mapFn
            })
          );
        }
      });
    }
    if (r.updateType === "cut") {
      const E = a.slice(0, -1), b = d.getShadowMetadata(c, E);
      b?.mapWrappers && b.mapWrappers.length > 0 && b.mapWrappers.forEach((k) => {
        if (k.containerRef && k.containerRef.isConnected) {
          const O = k.containerRef.querySelector(
            `[data-item-path="${m}"]`
          );
          O && O.remove();
        }
      });
    }
    r.updateType === "update" && (i || F.current?.validation?.key) && a && re(
      (i || F.current?.validation?.key) + "." + a.join(".")
    );
    const U = a.slice(0, a.length - 1);
    r.updateType === "cut" && F.current?.validation?.key && re(
      F.current?.validation?.key + "." + U.join(".")
    ), r.updateType === "insert" && F.current?.validation?.key && We(
      F.current?.validation?.key + "." + U.join(".")
    ).filter((b) => {
      let k = b?.split(".").length;
      const O = "";
      if (b == U.join(".") && k == U.length - 1) {
        let y = b + "." + U;
        re(b), ve(y, O);
      }
    });
    const W = d.getShadowValue(c), j = d.getShadowMetadata(c, []), L = /* @__PURE__ */ new Set();
    if (!j?.components)
      return W;
    if (r.updateType === "update")
      V?.pathComponents && V.pathComponents.forEach((E) => {
        if (L.has(E))
          return;
        const b = j.components?.get(E);
        b && ((Array.isArray(b.reactiveType) ? b.reactiveType : [b.reactiveType || "component"]).includes("none") || (b.forceUpdate(), L.add(E)));
      }), $ && typeof $ == "object" && !Te($) && _ && typeof _ == "object" && !Te(_) && Pe($, _).forEach((b) => {
        const k = b.split("."), O = [...a, ...k], y = d.getShadowMetadata(c, O);
        y?.pathComponents && y.pathComponents.forEach((M) => {
          if (L.has(M))
            return;
          const C = j.components?.get(M);
          C && ((Array.isArray(C.reactiveType) ? C.reactiveType : [C.reactiveType || "component"]).includes("none") || (C.forceUpdate(), L.add(M)));
        });
      });
    else if (r.updateType === "insert" || r.updateType === "cut") {
      const E = r.updateType === "insert" ? a : a.slice(0, -1), b = d.getShadowMetadata(c, E);
      if (b?.signals && b.signals.length > 0) {
        const k = [c, ...E].join("."), O = d.getShadowValue(k);
        b.signals.forEach(({ parentId: y, position: M, effect: C }) => {
          const P = document.querySelector(
            `[data-parent-id="${y}"]`
          );
          if (P) {
            const R = Array.from(P.childNodes);
            if (R[M]) {
              let N = O;
              if (C)
                try {
                  N = new Function(
                    "state",
                    `return (${C})(state)`
                  )(O);
                } catch (z) {
                  console.error("Error evaluating effect function:", z), N = O;
                }
              N != null && typeof N == "object" && (N = JSON.stringify(N)), R[M].textContent = String(N ?? "");
            }
          }
        });
      }
      b?.pathComponents && b.pathComponents.forEach((k) => {
        if (!L.has(k)) {
          const O = j.components?.get(k);
          O && (O.forceUpdate(), L.add(k));
        }
      });
    }
    return j.components.forEach((E, b) => {
      if (L.has(b))
        return;
      const k = Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"];
      if (k.includes("all")) {
        E.forceUpdate(), L.add(b);
        return;
      }
      if (k.includes("deps") && E.depsFunction) {
        const O = d.getShadowValue(c), y = E.depsFunction(O);
        let M = !1;
        y === !0 ? M = !0 : Array.isArray(y) && (se(E.prevDeps, y) || (E.prevDeps = y, M = !0)), M && (E.forceUpdate(), L.add(b));
      }
    }), L.clear(), He(c, (E) => {
      const b = [...E ?? [], D], k = /* @__PURE__ */ new Map();
      return b.forEach((O) => {
        const y = `${O.stateKey}:${JSON.stringify(O.path)}`, M = k.get(y);
        M ? (M.timeStamp = Math.max(M.timeStamp, O.timeStamp), M.newValue = O.newValue, M.oldValue = M.oldValue ?? O.oldValue, M.updateType = O.updateType) : k.set(y, { ...O });
      }), Array.from(k.values());
    }), xe(
      $,
      c,
      F.current,
      I
    ), F.current?.middleware && F.current.middleware({
      updateLog: x,
      update: D
    }), W;
  };
  t.getState().initialStateGlobal[c] || $e(c, e);
  const ne = fe(() => De(
    c,
    le,
    G.current,
    I
  ), [c, I]), de = F.current?.cogsSync;
  return de && de(ne), ne;
}
function Ge(e) {
  return !e || e.length === 0 ? "" : e.map(
    (s) => (
      // Safely stringify dependencies. An empty array becomes '[]'.
      `${s.type}${JSON.stringify(s.dependencies || [])}`
    )
  ).join("");
}
const Ie = (e, s, f) => {
  let S = t.getState().getShadowMetadata(e, s)?.arrayKeys || [];
  if (!f || f.length === 0)
    return S;
  let h = S.map((p) => ({
    key: p,
    value: t.getState().getShadowValue(p)
  }));
  for (const p of f)
    p.type === "filter" ? h = h.filter(
      ({ value: w }, l) => p.fn(w, l)
    ) : p.type === "sort" && h.sort((w, l) => p.fn(w.value, l.value));
  return h.map(({ key: p }) => p);
}, be = (e, s, f) => {
  const S = `${e}////${s}`, p = t.getState().getShadowMetadata(e, [])?.components?.get(S);
  if (!p || p.reactiveType == "none" || !(Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType]).includes("component"))
    return;
  const w = [e, ...f].join(".");
  p.paths.add(w);
  const l = t.getState().getShadowMetadata(e, f) || {}, u = l.pathComponents || /* @__PURE__ */ new Set();
  u.add(S), t.getState().setShadowMetadata(e, f, {
    ...l,
    pathComponents: u
  });
}, ye = (e, s, f) => {
  const S = t.getState(), h = S.getShadowMetadata(e, []), p = /* @__PURE__ */ new Set();
  h?.components && h.components.forEach((l, u) => {
    (Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType || "component"]).includes("all") && (l.forceUpdate(), p.add(u));
  }), S.getShadowMetadata(e, [...s, "getSelected"])?.pathComponents?.forEach((l) => {
    h?.components?.get(l)?.forceUpdate();
  });
  const w = S.getShadowMetadata(e, s);
  for (let l of w?.arrayKeys || []) {
    const u = l + ".selected", A = S.getShadowMetadata(
      e,
      u.split(".").slice(1)
    );
    l == f && A?.pathComponents?.forEach((T) => {
      h?.components?.get(T)?.forceUpdate();
    });
  }
};
function De(e, s, f, S) {
  const h = /* @__PURE__ */ new Map();
  let p = 0;
  const w = (T) => {
    const o = T.join(".");
    for (const [g] of h)
      (g === o || g.startsWith(o + ".")) && h.delete(g);
    p++;
  };
  function l({
    currentState: T,
    path: o = [],
    meta: g,
    componentId: I
  }) {
    const H = o.map(String).join("."), c = [e, ...o].join(".");
    T = t.getState().getShadowValue(c, g?.validIds);
    const x = function() {
      return t().getShadowValue(e, o);
    }, J = {
      apply(F, v, le) {
      },
      get(F, v) {
        if (v === "_rebuildStateShape")
          return l;
        if (Object.getOwnPropertyNames(u).includes(v) && o.length === 0)
          return u[v];
        if (v === "getDifferences")
          return () => {
            const n = t.getState().getShadowMetadata(e, []), a = t.getState().getShadowValue(e);
            let r;
            return n?.stateSource === "server" && n.baseServerState ? r = n.baseServerState : r = t.getState().initialStateGlobal[e], Pe(a, r);
          };
        if (v === "sync" && o.length === 0)
          return async function() {
            const n = t.getState().getInitialOptions(e), a = n?.sync;
            if (!a)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const r = t.getState().getShadowValue(e, []), i = n?.validation?.key;
            try {
              const m = await a.action(r);
              if (m && !m.success && m.errors && i && (t.getState().removeValidationError(i), m.errors.forEach((d) => {
                const V = [i, ...d.path].join(".");
                t.getState().addValidationError(V, d.message);
              }), oe(e)), m?.success) {
                const d = t.getState().getShadowMetadata(e, []);
                t.getState().setShadowMetadata(e, [], {
                  ...d,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: r
                  // Update base server state
                }), a.onSuccess && a.onSuccess(m.data);
              } else !m?.success && a.onError && a.onError(m.error);
              return m;
            } catch (m) {
              return a.onError && a.onError(m), { success: !1, error: m };
            }
          };
        if (v === "_status" || v === "getStatus") {
          const n = () => {
            const a = t.getState().getShadowMetadata(e, o), r = t.getState().getShadowValue(c);
            return a?.isDirty === !0 ? "dirty" : a?.isDirty === !1 || a?.stateSource === "server" ? "synced" : a?.stateSource === "localStorage" ? "restored" : a?.stateSource === "default" ? "fresh" : t.getState().getShadowMetadata(e, [])?.stateSource === "server" && !a?.isDirty ? "synced" : r !== void 0 && !a ? "fresh" : "unknown";
          };
          return v === "_status" ? n() : n;
        }
        if (v === "removeStorage")
          return () => {
            const n = t.getState().initialStateGlobal[e], a = te(e), r = K(a?.localStorage?.key) ? a.localStorage.key(n) : a?.localStorage?.key, i = `${S}-${e}-${r}`;
            i && localStorage.removeItem(i);
          };
        if (v === "showValidationErrors")
          return () => {
            const n = t.getState().getInitialOptions(e)?.validation;
            if (!n?.key) throw new Error("Validation key not found");
            return t.getState().getValidationErrors(n.key + "." + o.join("."));
          };
        if (Array.isArray(T)) {
          if (v === "getSelected")
            return () => {
              const n = e + "." + o.join(".");
              be(e, I, [
                ...o,
                "getSelected"
              ]);
              const a = t.getState().selectedIndicesMap;
              if (!a || !a.has(n))
                return;
              const r = a.get(n);
              if (g?.validIds && !g.validIds.includes(r))
                return;
              const i = t.getState().getShadowValue(r);
              if (i)
                return l({
                  currentState: i,
                  path: r.split(".").slice(1),
                  componentId: I
                });
            };
          if (v === "getSelectedIndex")
            return () => t.getState().getSelectedIndex(
              e + "." + o.join("."),
              g?.validIds
            );
          if (v === "clearSelected")
            return ye(e, o), () => {
              t.getState().clearSelectedIndex({
                arrayKey: e + "." + o.join(".")
              });
            };
          if (v === "useVirtualView")
            return (n) => {
              const {
                itemHeight: a = 50,
                overscan: r = 6,
                stickToBottom: i = !1,
                scrollStickTolerance: m = 75
              } = n, d = q(null), [V, _] = Z({
                startIndex: 0,
                endIndex: 10
              }), [$, B] = Z({}), D = q(!0), U = q({
                isUserScrolling: !1,
                lastScrollTop: 0,
                scrollUpCount: 0,
                isNearBottom: !0
              }), W = q(
                /* @__PURE__ */ new Map()
              );
              ue(() => {
                if (!i || !d.current || U.current.isUserScrolling)
                  return;
                const y = d.current;
                y.scrollTo({
                  top: y.scrollHeight,
                  behavior: D.current ? "instant" : "smooth"
                });
              }, [$, i]);
              const j = t.getState().getShadowMetadata(e, o)?.arrayKeys || [], { totalHeight: L, itemOffsets: E } = fe(() => {
                let y = 0;
                const M = /* @__PURE__ */ new Map();
                return (t.getState().getShadowMetadata(e, o)?.arrayKeys || []).forEach((P) => {
                  const R = P.split(".").slice(1), N = t.getState().getShadowMetadata(e, R)?.virtualizer?.itemHeight || a;
                  M.set(P, {
                    height: N,
                    offset: y
                  }), y += N;
                }), W.current = M, { totalHeight: y, itemOffsets: M };
              }, [j.length, a]);
              ue(() => {
                if (i && j.length > 0 && d.current && !U.current.isUserScrolling && D.current) {
                  const y = d.current, M = () => {
                    if (y.clientHeight > 0) {
                      const C = Math.ceil(
                        y.clientHeight / a
                      ), P = j.length - 1, R = Math.max(
                        0,
                        P - C - r
                      );
                      _({ startIndex: R, endIndex: P }), requestAnimationFrame(() => {
                        k("instant"), D.current = !1;
                      });
                    } else
                      requestAnimationFrame(M);
                  };
                  M();
                }
              }, [j.length, i, a, r]);
              const b = ie(() => {
                const y = d.current;
                if (!y) return;
                const M = y.scrollTop, { scrollHeight: C, clientHeight: P } = y, R = U.current, N = C - (M + P), z = R.isNearBottom;
                R.isNearBottom = N <= m, M < R.lastScrollTop ? (R.scrollUpCount++, R.scrollUpCount > 3 && z && (R.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : R.isNearBottom && (R.isUserScrolling = !1, R.scrollUpCount = 0), R.lastScrollTop = M;
                let Q = 0;
                for (let X = 0; X < j.length; X++) {
                  const ge = j[X], me = W.current.get(ge);
                  if (me && me.offset + me.height > M) {
                    Q = X;
                    break;
                  }
                }
                if (Q !== V.startIndex) {
                  const X = Math.ceil(P / a);
                  _({
                    startIndex: Math.max(0, Q - r),
                    endIndex: Math.min(
                      j.length - 1,
                      Q + X + r
                    )
                  });
                }
              }, [
                j.length,
                V.startIndex,
                a,
                r,
                m
              ]);
              Y(() => {
                const y = d.current;
                if (!(!y || !i))
                  return y.addEventListener("scroll", b, {
                    passive: !0
                  }), () => {
                    y.removeEventListener("scroll", b);
                  };
              }, [b, i]);
              const k = ie(
                (y = "smooth") => {
                  const M = d.current;
                  if (!M) return;
                  U.current.isUserScrolling = !1, U.current.isNearBottom = !0, U.current.scrollUpCount = 0;
                  const C = () => {
                    const P = (R = 0) => {
                      if (R > 5) return;
                      const N = M.scrollHeight, z = M.scrollTop, Q = M.clientHeight;
                      z + Q >= N - 1 || (M.scrollTo({
                        top: N,
                        behavior: y
                      }), setTimeout(() => {
                        const X = M.scrollHeight, ge = M.scrollTop;
                        (X !== N || ge + Q < X - 1) && P(R + 1);
                      }, 50));
                    };
                    P();
                  };
                  "requestIdleCallback" in window ? requestIdleCallback(C, { timeout: 100 }) : requestAnimationFrame(() => {
                    requestAnimationFrame(C);
                  });
                },
                []
              );
              return Y(() => {
                if (!i || !d.current) return;
                const y = d.current, M = U.current;
                let C;
                const P = () => {
                  clearTimeout(C), C = setTimeout(() => {
                    !M.isUserScrolling && M.isNearBottom && k(
                      D.current ? "instant" : "smooth"
                    );
                  }, 100);
                }, R = new MutationObserver(() => {
                  M.isUserScrolling || P();
                });
                R.observe(y, {
                  childList: !0,
                  subtree: !0,
                  attributes: !0,
                  attributeFilter: ["style", "class"]
                  // More specific than just 'height'
                });
                const N = (z) => {
                  z.target instanceof HTMLImageElement && !M.isUserScrolling && P();
                };
                return y.addEventListener("load", N, !0), D.current ? setTimeout(() => {
                  k("instant");
                }, 0) : P(), () => {
                  clearTimeout(C), R.disconnect(), y.removeEventListener("load", N, !0);
                };
              }, [i, j.length, k]), {
                virtualState: fe(() => {
                  const y = t.getState(), M = y.getShadowValue(
                    [e, ...o].join(".")
                  ), C = y.getShadowMetadata(e, o)?.arrayKeys || [], P = M.slice(
                    V.startIndex,
                    V.endIndex + 1
                  ), R = C.slice(
                    V.startIndex,
                    V.endIndex + 1
                  );
                  return l({
                    currentState: P,
                    path: o,
                    componentId: I,
                    meta: { ...g, validIds: R }
                  });
                }, [V.startIndex, V.endIndex, j.length]),
                virtualizerProps: {
                  outer: {
                    ref: d,
                    style: {
                      overflowY: "auto",
                      height: "100%",
                      position: "relative"
                    }
                  },
                  inner: {
                    style: {
                      height: `${L}px`,
                      position: "relative"
                    }
                  },
                  list: {
                    style: {
                      transform: `translateY(${W.current.get(
                        j[V.startIndex]
                      )?.offset || 0}px)`
                    }
                  }
                },
                scrollToBottom: k,
                scrollToIndex: (y, M = "smooth") => {
                  if (d.current && j[y]) {
                    const C = W.current.get(j[y])?.offset || 0;
                    d.current.scrollTo({ top: C, behavior: M });
                  }
                }
              };
            };
          if (v === "stateMap")
            return (n) => {
              const [a, r] = Z(
                g?.validIds ?? t.getState().getShadowMetadata(e, o)?.arrayKeys
              ), i = t.getState().getShadowValue(c, g?.validIds);
              if (!a)
                throw new Error("No array keys found for mapping");
              const m = l({
                currentState: i,
                path: o,
                componentId: I,
                meta: g
              });
              return i.map((d, V) => {
                const _ = a[V]?.split(".").slice(1), $ = l({
                  currentState: d,
                  path: _,
                  componentId: I,
                  meta: g
                });
                return n(
                  $,
                  V,
                  m
                );
              });
            };
          if (v === "$stateMap")
            return (n) => ce(ze, {
              proxy: {
                _stateKey: e,
                _path: o,
                _mapFn: n,
                _meta: g
              },
              rebuildStateShape: l
            });
          if (v === "stateFind")
            return (n) => {
              const a = g?.validIds ?? t.getState().getShadowMetadata(e, o)?.arrayKeys;
              if (a)
                for (let r = 0; r < a.length; r++) {
                  const i = a[r];
                  if (!i) continue;
                  const m = t.getState().getShadowValue(i);
                  if (n(m, r)) {
                    const d = i.split(".").slice(1);
                    return l({
                      currentState: m,
                      path: d,
                      componentId: I,
                      meta: g
                      // Pass along meta for potential further chaining
                    });
                  }
                }
            };
          if (v === "stateFilter")
            return (n) => {
              const a = g?.validIds ?? t.getState().getShadowMetadata(e, o)?.arrayKeys;
              if (!a)
                throw new Error("No array keys found for filtering.");
              const r = [], i = T.filter(
                (m, d) => n(m, d) ? (r.push(a[d]), !0) : !1
              );
              return l({
                currentState: i,
                path: o,
                componentId: I,
                meta: {
                  validIds: r,
                  transforms: [
                    ...g?.transforms || [],
                    {
                      type: "filter",
                      fn: n
                    }
                  ]
                }
              });
            };
          if (v === "stateSort")
            return (n) => {
              const a = g?.validIds ?? t.getState().getShadowMetadata(e, o)?.arrayKeys;
              if (!a)
                throw new Error("No array keys found for sorting");
              const r = T.map((i, m) => ({
                item: i,
                key: a[m]
              }));
              return r.sort((i, m) => n(i.item, m.item)).filter(Boolean), l({
                currentState: r.map((i) => i.item),
                path: o,
                componentId: I,
                meta: {
                  validIds: r.map((i) => i.key),
                  transforms: [
                    ...g?.transforms || [],
                    { type: "sort", fn: n }
                  ]
                }
              });
            };
          if (v === "stream")
            return function(n = {}) {
              const {
                bufferSize: a = 100,
                flushInterval: r = 100,
                bufferStrategy: i = "accumulate",
                store: m,
                onFlush: d
              } = n;
              let V = [], _ = !1, $ = null;
              const B = (L) => {
                if (!_) {
                  if (i === "sliding" && V.length >= a)
                    V.shift();
                  else if (i === "dropping" && V.length >= a)
                    return;
                  V.push(L), V.length >= a && D();
                }
              }, D = () => {
                if (V.length === 0) return;
                const L = [...V];
                if (V = [], m) {
                  const E = m(L);
                  E !== void 0 && (Array.isArray(E) ? E : [E]).forEach((k) => {
                    s(k, o, {
                      updateType: "insert"
                    });
                  });
                } else
                  L.forEach((E) => {
                    s(E, o, {
                      updateType: "insert"
                    });
                  });
                d?.(L);
              };
              r > 0 && ($ = setInterval(D, r));
              const U = ee(), W = t.getState().getShadowMetadata(e, o) || {}, j = W.streams || /* @__PURE__ */ new Map();
              return j.set(U, { buffer: V, flushTimer: $ }), t.getState().setShadowMetadata(e, o, {
                ...W,
                streams: j
              }), {
                write: (L) => B(L),
                writeMany: (L) => L.forEach(B),
                flush: () => D(),
                pause: () => {
                  _ = !0;
                },
                resume: () => {
                  _ = !1, V.length > 0 && D();
                },
                close: () => {
                  D(), $ && clearInterval($);
                  const L = t.getState().getShadowMetadata(e, o);
                  L?.streams && L.streams.delete(U);
                }
              };
            };
          if (v === "stateList")
            return (n) => /* @__PURE__ */ ae(() => {
              const r = q(/* @__PURE__ */ new Map()), i = g?.transforms && g.transforms.length > 0 ? `${I}-${Ge(g.transforms)}` : `${I}-base`, [m, d] = Z({}), { validIds: V, arrayValues: _ } = fe(() => {
                const B = t.getState().getShadowMetadata(e, o)?.transformCaches?.get(i);
                let D;
                B && B.validIds ? D = B.validIds : (D = Ie(
                  e,
                  o,
                  g?.transforms
                ), t.getState().setTransformCache(e, o, i, {
                  validIds: D,
                  computedAt: Date.now(),
                  transforms: g?.transforms || []
                }));
                const U = t.getState().getShadowValue(c, D);
                return {
                  validIds: D,
                  arrayValues: U || []
                };
              }, [i, m]);
              if (Y(() => {
                const B = t.getState().subscribeToPath(c, (D) => {
                  if (D.type === "GET_SELECTED")
                    return;
                  const W = t.getState().getShadowMetadata(e, o)?.transformCaches;
                  if (W)
                    for (const j of W.keys())
                      j.startsWith(I) && W.delete(j);
                  D.type === "INSERT" && d({});
                });
                return () => {
                  B();
                };
              }, [I, c]), !Array.isArray(_))
                return null;
              const $ = l({
                currentState: _,
                path: o,
                componentId: I,
                meta: {
                  ...g,
                  validIds: V
                }
              });
              return /* @__PURE__ */ ae(ke, { children: _.map((B, D) => {
                const U = V[D];
                if (!U)
                  return null;
                let W = r.current.get(U);
                W || (W = ee(), r.current.set(U, W));
                const j = U.split(".").slice(1);
                return ce(Me, {
                  key: U,
                  stateKey: e,
                  itemComponentId: W,
                  itemPath: j,
                  localIndex: D,
                  arraySetter: $,
                  rebuildStateShape: l,
                  renderFn: n
                });
              }) });
            }, {});
          if (v === "stateFlattenOn")
            return (n) => {
              const a = T;
              h.clear(), p++;
              const r = a.flatMap(
                (i) => i[n] ?? []
              );
              return l({
                currentState: r,
                path: [...o, "[*]", n],
                componentId: I,
                meta: g
              });
            };
          if (v === "index")
            return (n) => {
              const r = t.getState().getShadowMetadata(e, o)?.arrayKeys?.filter(
                (d) => !g?.validIds || g?.validIds && g?.validIds?.includes(d)
              )?.[n];
              if (!r) return;
              const i = t.getState().getShadowValue(r, g?.validIds);
              return l({
                currentState: i,
                path: r.split(".").slice(1),
                componentId: I,
                meta: g
              });
            };
          if (v === "last")
            return () => {
              const n = t.getState().getShadowValue(e, o);
              if (n.length === 0) return;
              const a = n.length - 1, r = n[a], i = [...o, a.toString()];
              return l({
                currentState: r,
                path: i,
                componentId: I,
                meta: g
              });
            };
          if (v === "insert")
            return (n, a) => (s(n, o, { updateType: "insert" }), l({
              currentState: t.getState().getShadowValue(e, o),
              path: o,
              componentId: I,
              meta: g
            }));
          if (v === "uniqueInsert")
            return (n, a, r) => {
              const i = t.getState().getShadowValue(e, o), m = K(n) ? n(i) : n;
              let d = null;
              if (!i.some((_) => {
                const $ = a ? a.every(
                  (B) => se(_[B], m[B])
                ) : se(_, m);
                return $ && (d = _), $;
              }))
                w(o), s(m, o, { updateType: "insert" });
              else if (r && d) {
                const _ = r(d), $ = i.map(
                  (B) => se(B, d) ? _ : B
                );
                w(o), s($, o, {
                  updateType: "update"
                });
              }
            };
          if (v === "cut")
            return (n, a) => {
              const r = g?.validIds ?? t.getState().getShadowMetadata(e, o)?.arrayKeys;
              if (!r || r.length === 0) return;
              const i = n == -1 ? r.length - 1 : n !== void 0 ? n : r.length - 1, m = r[i];
              if (!m) return;
              const d = m.split(".").slice(1);
              s(T, d, {
                updateType: "cut"
              });
            };
          if (v === "cutSelected")
            return () => {
              t.getState().getShadowMetadata(e, o)?.arrayKeys;
              const n = Ie(
                e,
                o,
                g?.transforms
              );
              if (console.log("validKeys", n), !n || n.length === 0) return;
              const a = t.getState().selectedIndicesMap.get(c);
              let r = n.findIndex(
                (m) => m === a
              );
              console.log("indexToCut", r);
              const i = n[r == -1 ? n.length - 1 : r]?.split(".").slice(1);
              console.log("pathForCut", i), s(T, i, {
                updateType: "cut"
              });
            };
          if (v === "cutByValue")
            return (n) => {
              const a = t.getState().getShadowMetadata(e, o), r = g?.validIds ?? a?.arrayKeys;
              if (!r) return;
              let i = null;
              for (const m of r)
                if (t.getState().getShadowValue(m) === n) {
                  i = m;
                  break;
                }
              if (i) {
                const m = i.split(".").slice(1);
                s(null, m, { updateType: "cut" });
              }
            };
          if (v === "toggleByValue")
            return (n) => {
              const a = t.getState().getShadowMetadata(e, o), r = g?.validIds ?? a?.arrayKeys;
              if (!r) return;
              let i = null;
              for (const m of r) {
                const d = t.getState().getShadowValue(m);
                if (console.log("itemValue sdasdasdasd", d), d === n) {
                  i = m;
                  break;
                }
              }
              if (console.log("itemValue keyToCut", i), i) {
                const m = i.split(".").slice(1);
                console.log("itemValue keyToCut", i), s(n, m, {
                  updateType: "cut"
                });
              } else
                s(n, o, { updateType: "insert" });
            };
          if (v === "findWith")
            return (n, a) => {
              const r = t.getState().getShadowMetadata(e, o)?.arrayKeys;
              if (!r)
                throw new Error("No array keys found for sorting");
              let i = null, m = [];
              for (const d of r) {
                let V = t.getState().getShadowValue(d, g?.validIds);
                if (V && V[n] === a) {
                  i = V, m = d.split(".").slice(1);
                  break;
                }
              }
              return l({
                currentState: i,
                path: m,
                componentId: I,
                meta: g
              });
            };
        }
        if (v === "cut") {
          let n = t.getState().getShadowValue(o.join("."));
          return () => {
            s(n, o, { updateType: "cut" });
          };
        }
        if (v === "get")
          return () => (be(e, I, o), t.getState().getShadowValue(c, g?.validIds));
        if (v === "$derive")
          return (n) => Ae({
            _stateKey: e,
            _path: o,
            _effect: n.toString(),
            _meta: g
          });
        if (v === "$get")
          return () => Ae({ _stateKey: e, _path: o, _meta: g });
        if (v === "lastSynced") {
          const n = `${e}:${o.join(".")}`;
          return t.getState().getSyncInfo(n);
        }
        if (v == "getLocalStorage")
          return (n) => Se(S + "-" + e + "-" + n);
        if (v === "isSelected") {
          const n = [e, ...o].slice(0, -1);
          if (ye(e, o, void 0), Array.isArray(
            t.getState().getShadowValue(n.join("."), g?.validIds)
          )) {
            o[o.length - 1];
            const a = n.join("."), r = t.getState().selectedIndicesMap.get(a), i = e + "." + o.join(".");
            return r === i;
          }
          return;
        }
        if (v === "setSelected")
          return (n) => {
            const a = o.slice(0, -1), r = e + "." + a.join("."), i = e + "." + o.join(".");
            ye(e, a, void 0), t.getState().selectedIndicesMap.get(r), n && t.getState().setSelectedIndex(r, i);
          };
        if (v === "toggleSelected")
          return () => {
            const n = o.slice(0, -1), a = e + "." + n.join("."), r = e + "." + o.join(".");
            t.getState().selectedIndicesMap.get(a) === r ? t.getState().clearSelectedIndex({ arrayKey: a }) : t.getState().setSelectedIndex(a, r);
          };
        if (v === "_componentId")
          return I;
        if (o.length == 0) {
          if (v === "addValidation")
            return (n) => {
              const a = t.getState().getInitialOptions(e)?.validation;
              if (!a?.key) throw new Error("Validation key not found");
              re(a.key), n.forEach((r) => {
                const i = [a.key, ...r.path].join(".");
                ve(i, r.message);
              }), oe(e);
            };
          if (v === "applyJsonPatch")
            return (n) => {
              const a = t.getState().getShadowValue(c, g?.validIds);
              Le(a, n).newDocument, oe(e);
            };
          if (v === "validateZodSchema")
            return () => {
              const n = t.getState().getInitialOptions(e)?.validation;
              if (!n?.zodSchema || !n?.key)
                throw new Error("Zod schema or validation key not found");
              re(n.key);
              const a = t.getState().getShadowValue(e), r = n.zodSchema.safeParse(a);
              return r.success ? !0 : (r.error.errors.forEach((i) => {
                const m = [n.key, ...i.path].join(".");
                ve(m, i.message);
              }), oe(e), !1);
            };
          if (v === "getComponents")
            return () => t.getState().getShadowMetadata(e, [])?.components;
          if (v === "getAllFormRefs")
            return () => pe.getState().getFormRefsByStateKey(e);
        }
        if (v === "getFormRef")
          return () => pe.getState().getFormRef(e + "." + o.join("."));
        if (v === "validationWrapper")
          return ({
            children: n,
            hideMessage: a
          }) => /* @__PURE__ */ ae(
            Ve,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: o,
              stateKey: e,
              children: n
            }
          );
        if (v === "_stateKey") return e;
        if (v === "_path") return o;
        if (v === "update")
          return (n) => (s(n, o, { updateType: "update" }), {
            /**
             * Marks this specific item, which was just updated, as 'synced' (not dirty).
             */
            synced: () => {
              const a = t.getState().getShadowMetadata(e, o);
              t.getState().setShadowMetadata(e, o, {
                ...a,
                isDirty: !1,
                // EXPLICITLY set to false, not just undefined
                stateSource: "server",
                // Mark as coming from server
                lastServerSync: Date.now()
                // Add timestamp
              });
              const r = [e, ...o].join(".");
              t.getState().notifyPathSubscribers(r, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (v === "toggle") {
          const n = t.getState().getShadowValue([e, ...o].join("."));
          if (console.log("currentValueAtPath", n), typeof T != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            s(!n, o, {
              updateType: "update"
            });
          };
        }
        if (v === "formElement")
          return (n, a) => /* @__PURE__ */ ae(
            Ve,
            {
              formOpts: a,
              path: o,
              stateKey: e,
              children: /* @__PURE__ */ ae(
                Qe,
                {
                  stateKey: e,
                  path: o,
                  rebuildStateShape: l,
                  setState: s,
                  formOpts: a,
                  renderFn: n
                }
              )
            }
          );
        const ne = [...o, v], de = t.getState().getShadowValue(e, ne);
        return l({
          currentState: de,
          path: ne,
          componentId: I,
          meta: g
        });
      }
    }, G = new Proxy(x, J);
    return h.set(H, {
      proxy: G,
      stateVersion: p
    }), G;
  }
  const u = {
    removeValidation: (T) => {
      T?.validationKey && re(T.validationKey);
    },
    revertToInitialState: (T) => {
      const o = t.getState().getInitialOptions(e)?.validation;
      o?.key && re(o.key), T?.validationKey && re(T.validationKey);
      const g = t.getState().getShadowMetadata(e, []);
      g?.stateSource === "server" && g.baseServerState ? g.baseServerState : t.getState().initialStateGlobal[e];
      const I = t.getState().initialStateGlobal[e];
      t.getState().clearSelectedIndexesForState(e), h.clear(), p++, t.getState().initializeShadowState(e, I), l({
        currentState: I,
        path: [],
        componentId: f
      });
      const H = te(e), c = K(H?.localStorage?.key) ? H?.localStorage?.key(I) : H?.localStorage?.key, x = `${S}-${e}-${c}`;
      x && localStorage.removeItem(x);
      const J = t.getState().getShadowMetadata(e, []);
      return J && J?.components?.forEach((G) => {
        G.forceUpdate();
      }), I;
    },
    updateInitialState: (T) => {
      h.clear(), p++;
      const o = De(
        e,
        s,
        f,
        S
      ), g = t.getState().initialStateGlobal[e], I = te(e), H = K(I?.localStorage?.key) ? I?.localStorage?.key(g) : I?.localStorage?.key, c = `${S}-${e}-${H}`;
      return localStorage.getItem(c) && localStorage.removeItem(c), Re(() => {
        $e(e, T), t.getState().initializeShadowState(e, T);
        const x = t.getState().getShadowMetadata(e, []);
        x && x?.components?.forEach((J) => {
          J.forceUpdate();
        });
      }), {
        fetchId: (x) => o.get()[x]
      };
    }
  };
  return l({
    currentState: t.getState().getShadowValue(e, []),
    componentId: f,
    path: []
  });
}
function Ae(e) {
  return ce(Je, { proxy: e });
}
function ze({
  proxy: e,
  rebuildStateShape: s
}) {
  const f = q(null), S = q(`map-${crypto.randomUUID()}`), h = q(!1), p = q(/* @__PURE__ */ new Map());
  Y(() => {
    const l = f.current;
    if (!l || h.current) return;
    const u = setTimeout(() => {
      const A = t.getState().getShadowMetadata(e._stateKey, e._path) || {}, T = A.mapWrappers || [];
      T.push({
        instanceId: S.current,
        mapFn: e._mapFn,
        containerRef: l,
        rebuildStateShape: s,
        path: e._path,
        componentId: S.current,
        meta: e._meta
      }), t.getState().setShadowMetadata(e._stateKey, e._path, {
        ...A,
        mapWrappers: T
      }), h.current = !0, w();
    }, 0);
    return () => {
      if (clearTimeout(u), S.current) {
        const A = t.getState().getShadowMetadata(e._stateKey, e._path) || {};
        A.mapWrappers && (A.mapWrappers = A.mapWrappers.filter(
          (T) => T.instanceId !== S.current
        ), t.getState().setShadowMetadata(e._stateKey, e._path, A));
      }
      p.current.forEach((A) => A.unmount());
    };
  }, []);
  const w = () => {
    const l = f.current;
    if (!l) return;
    const u = t.getState().getShadowValue(
      [e._stateKey, ...e._path].join("."),
      e._meta?.validIds
    );
    if (!Array.isArray(u)) return;
    const A = e._meta?.validIds ?? t.getState().getShadowMetadata(e._stateKey, e._path)?.arrayKeys ?? [], T = s({
      currentState: u,
      path: e._path,
      componentId: S.current,
      meta: e._meta
    });
    u.forEach((o, g) => {
      const I = A[g];
      if (!I) return;
      const H = ee(), c = document.createElement("div");
      c.setAttribute("data-item-path", I), l.appendChild(c);
      const x = Ce(c);
      p.current.set(I, x);
      const J = I.split(".").slice(1);
      x.render(
        ce(Me, {
          stateKey: e._stateKey,
          itemComponentId: H,
          itemPath: J,
          localIndex: g,
          arraySetter: T,
          rebuildStateShape: s,
          renderFn: e._mapFn
        })
      );
    });
  };
  return /* @__PURE__ */ ae("div", { ref: f, "data-map-container": S.current });
}
function Je({
  proxy: e
}) {
  const s = q(null), f = q(null), S = q(!1), h = `${e._stateKey}-${e._path.join(".")}`, p = t.getState().getShadowValue(
    [e._stateKey, ...e._path].join("."),
    e._meta?.validIds
  );
  return Y(() => {
    const w = s.current;
    if (!w || S.current) return;
    const l = setTimeout(() => {
      if (!w.parentElement) {
        console.warn("Parent element not found for signal", h);
        return;
      }
      const u = w.parentElement, T = Array.from(u.childNodes).indexOf(w);
      let o = u.getAttribute("data-parent-id");
      o || (o = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", o)), f.current = `instance-${crypto.randomUUID()}`;
      const g = t.getState().getShadowMetadata(e._stateKey, e._path) || {}, I = g.signals || [];
      I.push({
        instanceId: f.current,
        parentId: o,
        position: T,
        effect: e._effect
      }), t.getState().setShadowMetadata(e._stateKey, e._path, {
        ...g,
        signals: I
      });
      let H = p;
      if (e._effect)
        try {
          H = new Function(
            "state",
            `return (${e._effect})(state)`
          )(p);
        } catch (x) {
          console.error("Error evaluating effect function:", x);
        }
      H !== null && typeof H == "object" && (H = JSON.stringify(H));
      const c = document.createTextNode(String(H ?? ""));
      w.replaceWith(c), S.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(l), f.current) {
        const u = t.getState().getShadowMetadata(e._stateKey, e._path) || {};
        u.signals && (u.signals = u.signals.filter(
          (A) => A.instanceId !== f.current
        ), t.getState().setShadowMetadata(e._stateKey, e._path, u));
      }
    };
  }, []), ce("span", {
    ref: s,
    style: { display: "contents" },
    "data-signal-id": h
  });
}
const Me = je(
  Ze,
  (e, s) => e.itemPath.join(".") === s.itemPath.join(".") && e.stateKey === s.stateKey && e.itemComponentId === s.itemComponentId && e.localIndex === s.localIndex
), Ye = (e) => {
  const [s, f] = Z(!1);
  return ue(() => {
    if (!e.current) {
      f(!0);
      return;
    }
    const S = Array.from(e.current.querySelectorAll("img"));
    if (S.length === 0) {
      f(!0);
      return;
    }
    let h = 0;
    const p = () => {
      h++, h === S.length && f(!0);
    };
    return S.forEach((w) => {
      w.complete ? p() : (w.addEventListener("load", p), w.addEventListener("error", p));
    }), () => {
      S.forEach((w) => {
        w.removeEventListener("load", p), w.removeEventListener("error", p);
      });
    };
  }, [e.current]), s;
};
function Ze({
  stateKey: e,
  itemComponentId: s,
  itemPath: f,
  localIndex: S,
  arraySetter: h,
  rebuildStateShape: p,
  renderFn: w
}) {
  const [, l] = Z({}), { ref: u, inView: A } = Ne(), T = q(null), o = Ye(T), g = q(!1), I = [e, ...f].join(".");
  Ue(e, s, l);
  const H = ie(
    (F) => {
      T.current = F, u(F);
    },
    [u]
  );
  Y(() => {
    t.getState().subscribeToPath(I, (F) => {
      l({});
    });
  }, []), Y(() => {
    if (!A || !o || g.current)
      return;
    const F = T.current;
    if (F && F.offsetHeight > 0) {
      g.current = !0;
      const v = F.offsetHeight;
      t.getState().setShadowMetadata(e, f, {
        virtualizer: {
          itemHeight: v,
          domRef: F
        }
      });
      const le = f.slice(0, -1), ne = [e, ...le].join(".");
      t.getState().notifyPathSubscribers(ne, {
        type: "ITEMHEIGHT",
        itemKey: f.join("."),
        ref: T.current
      });
    }
  }, [A, o, e, f]);
  const c = [e, ...f].join("."), x = t.getState().getShadowValue(c);
  if (x === void 0)
    return null;
  const J = p({
    currentState: x,
    path: f,
    componentId: s
  }), G = w(J, S, h);
  return /* @__PURE__ */ ae("div", { ref: H, children: G });
}
function Qe({
  stateKey: e,
  path: s,
  rebuildStateShape: f,
  renderFn: S,
  formOpts: h,
  setState: p
}) {
  const [w] = Z(() => ee()), [, l] = Z({}), u = [e, ...s].join(".");
  Ue(e, w, l);
  const A = t.getState().getShadowValue(u), [T, o] = Z(A), g = q(!1), I = q(null);
  Y(() => {
    !g.current && !se(A, T) && o(A);
  }, [A]), Y(() => {
    const G = t.getState().subscribeToPath(u, (F) => {
      l({});
    });
    return () => {
      G(), I.current && (clearTimeout(I.current), g.current = !1);
    };
  }, []);
  const H = ie(
    (G) => {
      o(G), g.current = !0, I.current && clearTimeout(I.current);
      const F = h?.debounceTime ?? 200;
      I.current = setTimeout(() => {
        g.current = !1, p(G, s, { updateType: "update" });
      }, F);
    },
    [p, s, h?.debounceTime]
  ), c = ie(() => {
    I.current && (clearTimeout(I.current), g.current = !1, p(T, s, { updateType: "update" }));
  }, [p, s, T]), x = f({
    currentState: A,
    path: s,
    componentId: w
  }), J = new Proxy(x, {
    get(G, F) {
      return F === "inputProps" ? {
        value: T ?? "",
        onChange: (v) => {
          H(v.target.value);
        },
        onBlur: c,
        ref: pe.getState().getFormRef(e + "." + s.join("."))
      } : G[F];
    }
  });
  return /* @__PURE__ */ ae(ke, { children: S(J) });
}
function Ue(e, s, f) {
  const S = `${e}////${s}`;
  ue(() => {
    const h = t.getState().getShadowMetadata(e, []), p = h?.components || /* @__PURE__ */ new Map();
    return p.set(S, {
      forceUpdate: () => f({}),
      paths: /* @__PURE__ */ new Set(),
      reactiveType: ["component"]
    }), t.getState().setShadowMetadata(e, [], {
      ...h,
      components: p
    }), () => {
      const w = t.getState().getShadowMetadata(e, []);
      w?.components && w.components.delete(S);
    };
  }, [e, S]);
}
export {
  Ae as $cogsSignal,
  lt as addStateOptions,
  ut as createCogsState,
  dt as notifyComponent,
  qe as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
