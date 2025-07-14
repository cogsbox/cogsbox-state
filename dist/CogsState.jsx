"use client";
import { jsx as oe, Fragment as ke } from "react/jsx-runtime";
import { memo as Re, useState as ee, useRef as q, useCallback as ue, useEffect as X, useLayoutEffect as ge, useMemo as Se, createElement as de, startTransition as je } from "react";
import { createRoot as Ce } from "react-dom/client";
import { transformStateFunc as Fe, isFunction as ae, isArray as Te, getDifferences as Pe, isDeepEqual as le } from "./utility.js";
import { ValidationWrapper as Ve } from "./Functions.jsx";
import Oe from "superjson";
import { v4 as re } from "uuid";
import { getGlobalStore as t, formRefStore as pe } from "./store.js";
import { useCogsConfig as _e } from "./CogsStateClient.jsx";
import { useInView as Ne } from "react-intersection-observer";
function ye(e, o) {
  const m = t.getState().getInitialOptions, h = t.getState().setInitialStateOptions, v = m(e) || {};
  h(e, {
    ...v,
    ...o
  });
}
function Ee({
  stateKey: e,
  options: o,
  initialOptionsPart: m
}) {
  const h = ne(e) || {}, v = m[e] || {}, M = t.getState().setInitialStateOptions, V = { ...v, ...h };
  let l = !1;
  if (o)
    for (const u in o)
      V.hasOwnProperty(u) ? (u == "localStorage" && o[u] && V[u].key !== o[u]?.key && (l = !0, V[u] = o[u]), u == "defaultState" && o[u] && V[u] !== o[u] && !le(V[u], o[u]) && (l = !0, V[u] = o[u])) : (l = !0, V[u] = o[u]);
  l && M(e, V);
}
function it(e, { formElements: o, validation: m }) {
  return { initialState: e, formElements: o, validation: m };
}
const ct = (e, o) => {
  let m = e;
  const [h, v] = Fe(m);
  Object.keys(h).forEach((l) => {
    let u = v[l] || {};
    const P = {
      ...u
    };
    if (o?.formElements && (P.formElements = {
      ...o.formElements,
      ...u.formElements || {}
    }), o?.validation && (P.validation = {
      ...o.validation,
      ...u.validation || {}
    }, o.validation.key && !u.validation?.key && (P.validation.key = `${o.validation.key}.${l}`)), Object.keys(P).length > 0) {
      const I = ne(l);
      I ? t.getState().setInitialStateOptions(l, {
        ...I,
        ...P
      }) : t.getState().setInitialStateOptions(l, P);
    }
  }), Object.keys(h).forEach((l) => {
    t.getState().initializeShadowState(l, h[l]);
  });
  const M = (l, u) => {
    const [P] = ee(u?.componentId ?? re());
    Ee({
      stateKey: l,
      options: u,
      initialOptionsPart: v
    });
    const I = t.getState().getShadowValue(l) || h[l], i = u?.modifyState ? u.modifyState(I) : I;
    return Be(i, {
      stateKey: l,
      syncUpdate: u?.syncUpdate,
      componentId: P,
      localStorage: u?.localStorage,
      middleware: u?.middleware,
      reactiveType: u?.reactiveType,
      reactiveDeps: u?.reactiveDeps,
      defaultState: u?.defaultState,
      dependencies: u?.dependencies,
      serverState: u?.serverState
    });
  };
  function V(l, u) {
    Ee({ stateKey: l, options: u, initialOptionsPart: v }), u.localStorage && xe(l, u), ce(l);
  }
  return { useCogsState: M, setCogsOptions: V };
}, {
  getInitialOptions: ne,
  getValidationErrors: Le,
  setStateLog: We,
  updateInitialStateGlobal: De,
  addValidationError: he,
  removeValidationError: se
} = t.getState(), He = (e, o, m, h, v) => {
  m?.log && console.log(
    "saving to localstorage",
    o,
    m.localStorage?.key,
    h
  );
  const M = ae(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (M && h) {
    const V = `${h}-${o}-${M}`;
    let l;
    try {
      l = me(V)?.lastSyncedWithServer;
    } catch {
    }
    const u = t.getState().getShadowMetadata(o, []), P = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: l,
      stateSource: u?.stateSource,
      baseServerState: u?.baseServerState
    }, I = Oe.serialize(P);
    window.localStorage.setItem(
      V,
      JSON.stringify(I.json)
    );
  }
}, me = (e) => {
  if (!e) return null;
  try {
    const o = window.localStorage.getItem(e);
    return o ? JSON.parse(o) : null;
  } catch (o) {
    return console.error("Error loading from localStorage:", o), null;
  }
}, xe = (e, o) => {
  const m = t.getState().getShadowValue(e), { sessionId: h } = _e(), v = ae(o?.localStorage?.key) ? o.localStorage.key(m) : o?.localStorage?.key;
  if (v && h) {
    const M = me(
      `${h}-${e}-${v}`
    );
    if (M && M.lastUpdated > (M.lastSyncedWithServer || 0))
      return ce(e), !0;
  }
  return !1;
}, ce = (e) => {
  const o = t.getState().getShadowMetadata(e, []);
  if (!o) return;
  const m = /* @__PURE__ */ new Set();
  o?.components?.forEach((h) => {
    (h ? Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"] : null)?.includes("none") || m.add(() => h.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((h) => h());
  });
}, lt = (e, o) => {
  const m = t.getState().getShadowMetadata(e, []);
  if (m) {
    const h = `${e}////${o}`, v = m?.components?.get(h);
    if ((v ? Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"] : null)?.includes("none"))
      return;
    v && v.forceUpdate();
  }
};
function we(e, o, m, h) {
  const v = t.getState(), M = v.getShadowMetadata(e, o);
  if (v.setShadowMetadata(e, o, {
    ...M,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: h || Date.now()
  }), Array.isArray(m)) {
    const V = v.getShadowMetadata(e, o);
    V?.arrayKeys && V.arrayKeys.forEach((l, u) => {
      const P = l.split(".").slice(1), I = m[u];
      I !== void 0 && we(
        e,
        P,
        I,
        h
      );
    });
  } else m && typeof m == "object" && m.constructor === Object && Object.keys(m).forEach((V) => {
    const l = [...o, V], u = m[V];
    we(e, l, u, h);
  });
}
function Be(e, {
  stateKey: o,
  localStorage: m,
  formElements: h,
  reactiveDeps: v,
  reactiveType: M,
  componentId: V,
  defaultState: l,
  syncUpdate: u,
  dependencies: P,
  serverState: I
} = {}) {
  const [i, g] = ee({}), { sessionId: T } = _e();
  let W = !o;
  const [c] = ee(o ?? re()), H = t.getState().stateLog[c], Z = q(/* @__PURE__ */ new Set()), G = q(V ?? re()), R = q(
    null
  );
  R.current = ne(c) ?? null, X(() => {
    if (u && u.stateKey === c && u.path?.[0]) {
      const n = `${u.stateKey}:${u.path.join(".")}`;
      t.getState().setSyncInfo(n, {
        timeStamp: u.timeStamp,
        userId: u.userId
      });
    }
  }, [u]);
  const y = ue(
    (n) => {
      const a = n ? { ...ne(c), ...n } : ne(c), d = a?.defaultState || l || e;
      if (a?.serverState?.status === "success" && a?.serverState?.data !== void 0)
        return {
          value: a.serverState.data,
          source: "server",
          timestamp: a.serverState.timestamp || Date.now()
        };
      if (a?.localStorage?.key && T) {
        const f = ae(a.localStorage.key) ? a.localStorage.key(d) : a.localStorage.key, k = me(
          `${T}-${c}-${f}`
        );
        if (k && k.lastUpdated > (a?.serverState?.timestamp || 0))
          return {
            value: k.state,
            source: "localStorage",
            timestamp: k.lastUpdated
          };
      }
      return {
        value: d || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [c, l, e, T]
  );
  X(() => {
    t.getState().setServerStateUpdate(c, I);
  }, [I, c]), X(() => t.getState().subscribeToPath(c, (r) => {
    if (r?.type === "SERVER_STATE_UPDATE") {
      const a = r.serverState;
      if (a?.status === "success" && a.data !== void 0) {
        ye(c, { serverState: a });
        const S = typeof a.merge == "object" ? a.merge : a.merge === !0 ? {} : null, f = t.getState().getShadowValue(c), k = a.data;
        if (S && Array.isArray(f) && Array.isArray(k)) {
          const _ = S.key || "id", U = new Set(
            f.map((L) => L[_])
          ), j = k.filter((L) => !U.has(L[_]));
          j.length > 0 && j.forEach((L) => {
            t.getState().insertShadowArrayElement(c, [], L);
            const O = t.getState().getShadowMetadata(c, []);
            if (O?.arrayKeys) {
              const x = O.arrayKeys[O.arrayKeys.length - 1];
              if (x) {
                const J = x.split(".").slice(1);
                t.getState().setShadowMetadata(c, J, {
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: a.timestamp || Date.now()
                });
                const B = t.getState().getShadowValue(x);
                B && typeof B == "object" && !Array.isArray(B) && Object.keys(B).forEach((b) => {
                  const D = [...J, b];
                  t.getState().setShadowMetadata(c, D, {
                    isDirty: !1,
                    stateSource: "server",
                    lastServerSync: a.timestamp || Date.now()
                  });
                });
              }
            }
          });
        } else
          t.getState().initializeShadowState(c, k), we(
            c,
            [],
            k,
            a.timestamp
          );
        const $ = t.getState().getShadowMetadata(c, []);
        t.getState().setShadowMetadata(c, [], {
          ...$,
          stateSource: "server",
          lastServerSync: a.timestamp || Date.now(),
          isDirty: !1
        });
      }
    }
  }), [c, y]), X(() => {
    const n = t.getState().getShadowMetadata(c, []);
    if (n && n.stateSource)
      return;
    const r = ne(c);
    if (r?.defaultState !== void 0 || l !== void 0) {
      const a = r?.defaultState || l;
      r?.defaultState || ye(c, {
        defaultState: a
      });
      const { value: d, source: S, timestamp: f } = y();
      t.getState().initializeShadowState(c, d), t.getState().setShadowMetadata(c, [], {
        stateSource: S,
        lastServerSync: S === "server" ? f : void 0,
        isDirty: !1,
        baseServerState: S === "server" ? d : void 0
      }), ce(c);
    }
  }, [c, ...P || []]), ge(() => {
    W && ye(c, {
      formElements: h,
      defaultState: l,
      localStorage: m,
      middleware: R.current?.middleware
    });
    const n = `${c}////${G.current}`, r = t.getState().getShadowMetadata(c, []), a = r?.components || /* @__PURE__ */ new Map();
    return a.set(n, {
      forceUpdate: () => g({}),
      reactiveType: M ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: v || void 0,
      deps: v ? v(t.getState().getShadowValue(c)) : [],
      prevDeps: v ? v(t.getState().getShadowValue(c)) : []
    }), t.getState().setShadowMetadata(c, [], {
      ...r,
      components: a
    }), g({}), () => {
      const d = t.getState().getShadowMetadata(c, []), S = d?.components?.get(n);
      S?.paths && S.paths.forEach((f) => {
        const $ = f.split(".").slice(1), _ = t.getState().getShadowMetadata(c, $);
        _?.pathComponents && _.pathComponents.size === 0 && (delete _.pathComponents, t.getState().setShadowMetadata(c, $, _));
      }), d?.components && t.getState().setShadowMetadata(c, [], d);
    };
  }, []);
  const Q = q(null), te = (n, r, a, d) => {
    const S = [c, ...r].join(".");
    if (Array.isArray(r)) {
      const b = `${c}-${r.join(".")}`;
      Z.current.add(b);
    }
    const f = t.getState(), k = f.getShadowMetadata(c, r), $ = f.getShadowValue(S), _ = a.updateType === "insert" && ae(n) ? n({ state: $, uuid: re() }) : ae(n) ? n($) : n, j = {
      timeStamp: Date.now(),
      stateKey: c,
      path: r,
      updateType: a.updateType,
      status: "new",
      oldValue: $,
      newValue: _
    };
    switch (a.updateType) {
      case "insert": {
        f.insertShadowArrayElement(c, r, j.newValue), f.markAsDirty(c, r, { bubble: !0 });
        const b = f.getShadowMetadata(c, r);
        if (b?.arrayKeys) {
          const D = b.arrayKeys[b.arrayKeys.length - 1];
          if (D) {
            const p = D.split(".").slice(1);
            f.markAsDirty(c, p, { bubble: !1 });
          }
        }
        break;
      }
      case "cut": {
        const b = r.slice(0, -1);
        f.removeShadowArrayElement(c, r), f.markAsDirty(c, b, { bubble: !0 });
        break;
      }
      case "update": {
        f.updateShadowAtPath(c, r, j.newValue), f.markAsDirty(c, r, { bubble: !0 });
        break;
      }
    }
    if (a.sync !== !1 && Q.current && Q.current.connected && Q.current.updateState({ operation: j }), k?.signals && k.signals.length > 0) {
      const b = a.updateType === "cut" ? null : _;
      k.signals.forEach(({ parentId: D, position: p, effect: w }) => {
        const E = document.querySelector(`[data-parent-id="${D}"]`);
        if (E) {
          const C = Array.from(E.childNodes);
          if (C[p]) {
            let A = b;
            if (w && b !== null)
              try {
                A = new Function(
                  "state",
                  `return (${w})(state)`
                )(b);
              } catch (F) {
                console.error("Error evaluating effect function:", F);
              }
            A != null && typeof A == "object" && (A = JSON.stringify(A)), C[p].textContent = String(A ?? "");
          }
        }
      });
    }
    if (a.updateType === "insert" && k?.mapWrappers && k.mapWrappers.length > 0) {
      const b = f.getShadowMetadata(c, r)?.arrayKeys || [], D = b[b.length - 1], p = f.getShadowValue(D), w = f.getShadowValue(
        [c, ...r].join(".")
      );
      if (!D || p === void 0) return;
      k.mapWrappers.forEach((E) => {
        let C = !0, A = -1;
        if (E.meta?.transforms && E.meta.transforms.length > 0) {
          for (const F of E.meta.transforms)
            if (F.type === "filter" && !F.fn(p, -1)) {
              C = !1;
              break;
            }
          if (C) {
            const F = Ie(
              c,
              r,
              E.meta.transforms
            ), Y = E.meta.transforms.find(
              (N) => N.type === "sort"
            );
            if (Y) {
              const N = F.map((z) => ({
                key: z,
                value: f.getShadowValue(z)
              }));
              N.push({ key: D, value: p }), N.sort((z, ie) => Y.fn(z.value, ie.value)), A = N.findIndex(
                (z) => z.key === D
              );
            } else
              A = F.length;
          }
        } else
          C = !0, A = b.length - 1;
        if (C && E.containerRef && E.containerRef.isConnected) {
          const F = document.createElement("div");
          F.setAttribute("data-item-path", D);
          const Y = Array.from(E.containerRef.children);
          A >= 0 && A < Y.length ? E.containerRef.insertBefore(
            F,
            Y[A]
          ) : E.containerRef.appendChild(F);
          const N = Ce(F), z = re(), ie = D.split(".").slice(1), fe = E.rebuildStateShape({
            path: E.path,
            currentState: w,
            componentId: E.componentId,
            meta: E.meta
          });
          N.render(
            de(Me, {
              stateKey: c,
              itemComponentId: z,
              itemPath: ie,
              localIndex: A,
              arraySetter: fe,
              rebuildStateShape: E.rebuildStateShape,
              renderFn: E.mapFn
            })
          );
        }
      });
    }
    if (a.updateType === "cut") {
      const b = r.slice(0, -1), D = f.getShadowMetadata(c, b);
      D?.mapWrappers && D.mapWrappers.length > 0 && D.mapWrappers.forEach((p) => {
        if (p.containerRef && p.containerRef.isConnected) {
          const w = p.containerRef.querySelector(
            `[data-item-path="${S}"]`
          );
          w && w.remove();
        }
      });
    }
    a.updateType === "update" && (d || R.current?.validation?.key) && r && se(
      (d || R.current?.validation?.key) + "." + r.join(".")
    );
    const O = r.slice(0, r.length - 1);
    a.updateType === "cut" && R.current?.validation?.key && se(
      R.current?.validation?.key + "." + O.join(".")
    ), a.updateType === "insert" && R.current?.validation?.key && Le(
      R.current?.validation?.key + "." + O.join(".")
    ).filter((D) => {
      let p = D?.split(".").length;
      const w = "";
      if (D == O.join(".") && p == O.length - 1) {
        let E = D + "." + O;
        se(D), he(E, w);
      }
    });
    const x = t.getState().getShadowValue(c), J = t.getState().getShadowMetadata(c, []), B = /* @__PURE__ */ new Set();
    if (console.log(
      "rootMeta",
      c,
      t.getState().shadowStateStore
    ), !J?.components)
      return x;
    if (a.updateType === "update") {
      let b = [...r];
      for (; ; ) {
        const D = f.getShadowMetadata(c, b);
        if (D?.pathComponents && D.pathComponents.forEach((p) => {
          if (B.has(p))
            return;
          const w = J.components?.get(p);
          w && ((Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"]).includes("none") || (w.forceUpdate(), B.add(p)));
        }), b.length === 0)
          break;
        b.pop();
      }
      _ && typeof _ == "object" && !Te(_) && $ && typeof $ == "object" && !Te($) && Pe(_, $).forEach((p) => {
        const w = p.split("."), E = [...r, ...w], C = f.getShadowMetadata(c, E);
        C?.pathComponents && C.pathComponents.forEach((A) => {
          if (B.has(A))
            return;
          const F = J.components?.get(A);
          F && ((Array.isArray(F.reactiveType) ? F.reactiveType : [F.reactiveType || "component"]).includes("none") || (F.forceUpdate(), B.add(A)));
        });
      });
    } else if (a.updateType === "insert" || a.updateType === "cut") {
      const b = a.updateType === "insert" ? r : r.slice(0, -1), D = f.getShadowMetadata(c, b);
      if (D?.signals && D.signals.length > 0) {
        const p = [c, ...b].join("."), w = f.getShadowValue(p);
        D.signals.forEach(({ parentId: E, position: C, effect: A }) => {
          const F = document.querySelector(
            `[data-parent-id="${E}"]`
          );
          if (F) {
            const Y = Array.from(F.childNodes);
            if (Y[C]) {
              let N = w;
              if (A)
                try {
                  N = new Function(
                    "state",
                    `return (${A})(state)`
                  )(w);
                } catch (z) {
                  console.error("Error evaluating effect function:", z), N = w;
                }
              N != null && typeof N == "object" && (N = JSON.stringify(N)), Y[C].textContent = String(N ?? "");
            }
          }
        });
      }
      D?.pathComponents && D.pathComponents.forEach((p) => {
        if (!B.has(p)) {
          const w = J.components?.get(p);
          w && (w.forceUpdate(), B.add(p));
        }
      });
    }
    return J.components.forEach((b, D) => {
      if (B.has(D))
        return;
      const p = Array.isArray(b.reactiveType) ? b.reactiveType : [b.reactiveType || "component"];
      if (p.includes("all")) {
        b.forceUpdate(), B.add(D);
        return;
      }
      if (p.includes("deps") && b.depsFunction) {
        const w = f.getShadowValue(c), E = b.depsFunction(w);
        let C = !1;
        E === !0 ? C = !0 : Array.isArray(E) && (le(b.prevDeps, E) || (b.prevDeps = E, C = !0)), C && (b.forceUpdate(), B.add(D));
      }
    }), B.clear(), We(c, (b) => {
      const D = [...b ?? [], j], p = /* @__PURE__ */ new Map();
      return D.forEach((w) => {
        const E = `${w.stateKey}:${JSON.stringify(w.path)}`, C = p.get(E);
        C ? (C.timeStamp = Math.max(C.timeStamp, w.timeStamp), C.newValue = w.newValue, C.oldValue = C.oldValue ?? w.oldValue, C.updateType = w.updateType) : p.set(E, { ...w });
      }), Array.from(p.values());
    }), He(
      _,
      c,
      R.current,
      T
    ), R.current?.middleware && R.current.middleware({
      updateLog: H,
      update: j
    }), x;
  };
  t.getState().initialStateGlobal[c] || De(c, e);
  const K = Se(() => $e(
    c,
    te,
    G.current,
    T
  ), [c, T]), s = R.current?.cogsSync;
  return s && (Q.current = s(K)), K;
}
function ze(e) {
  return !e || e.length === 0 ? "" : e.map(
    (o) => (
      // Safely stringify dependencies. An empty array becomes '[]'.
      `${o.type}${JSON.stringify(o.dependencies || [])}`
    )
  ).join("");
}
const Ie = (e, o, m) => {
  let h = t.getState().getShadowMetadata(e, o)?.arrayKeys || [];
  if (!m || m.length === 0)
    return h;
  let v = h.map((M) => ({
    key: M,
    value: t.getState().getShadowValue(M)
  }));
  for (const M of m)
    M.type === "filter" ? v = v.filter(
      ({ value: V }, l) => M.fn(V, l)
    ) : M.type === "sort" && v.sort((V, l) => M.fn(V.value, l.value));
  return v.map(({ key: M }) => M);
}, be = (e, o, m) => {
  const h = `${e}////${o}`, { addPathComponent: v, getShadowMetadata: M } = t.getState(), l = M(e, [])?.components?.get(h);
  !l || l.reactiveType === "none" || !(Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType]).includes("component") || v(e, m, h);
}, ve = (e, o, m) => {
  const h = t.getState(), v = h.getShadowMetadata(e, []), M = /* @__PURE__ */ new Set();
  v?.components && v.components.forEach((l, u) => {
    (Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType || "component"]).includes("all") && (l.forceUpdate(), M.add(u));
  }), h.getShadowMetadata(e, [...o, "getSelected"])?.pathComponents?.forEach((l) => {
    v?.components?.get(l)?.forceUpdate();
  });
  const V = h.getShadowMetadata(e, o);
  for (let l of V?.arrayKeys || []) {
    const u = l + ".selected", P = h.getShadowMetadata(
      e,
      u.split(".").slice(1)
    );
    l == m && P?.pathComponents?.forEach((I) => {
      v?.components?.get(I)?.forceUpdate();
    });
  }
};
function $e(e, o, m, h) {
  const v = /* @__PURE__ */ new Map();
  let M = 0;
  const V = (I) => {
    const i = I.join(".");
    for (const [g] of v)
      (g === i || g.startsWith(i + ".")) && v.delete(g);
    M++;
  };
  function l({
    currentState: I,
    path: i = [],
    meta: g,
    componentId: T
  }) {
    const W = i.map(String).join("."), c = [e, ...i].join(".");
    I = t.getState().getShadowValue(c, g?.validIds);
    const H = function() {
      return t().getShadowValue(e, i);
    }, Z = {
      apply(R, y, Q) {
      },
      get(R, y) {
        if (y === "_rebuildStateShape")
          return l;
        if (Object.getOwnPropertyNames(u).includes(y) && i.length === 0)
          return u[y];
        if (y === "getDifferences")
          return () => {
            const s = t.getState().getShadowMetadata(e, []), n = t.getState().getShadowValue(e);
            let r;
            return s?.stateSource === "server" && s.baseServerState ? r = s.baseServerState : r = t.getState().initialStateGlobal[e], Pe(n, r);
          };
        if (y === "sync" && i.length === 0)
          return async function() {
            const s = t.getState().getInitialOptions(e), n = s?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const r = t.getState().getShadowValue(e, []), a = s?.validation?.key;
            try {
              const d = await n.action(r);
              if (d && !d.success && d.errors && a && (t.getState().removeValidationError(a), d.errors.forEach((S) => {
                const f = [a, ...S.path].join(".");
                t.getState().addValidationError(f, S.message);
              }), ce(e)), d?.success) {
                const S = t.getState().getShadowMetadata(e, []);
                t.getState().setShadowMetadata(e, [], {
                  ...S,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: r
                  // Update base server state
                }), n.onSuccess && n.onSuccess(d.data);
              } else !d?.success && n.onError && n.onError(d.error);
              return d;
            } catch (d) {
              return n.onError && n.onError(d), { success: !1, error: d };
            }
          };
        if (y === "_status" || y === "getStatus") {
          const s = () => {
            const n = t.getState().getShadowMetadata(e, i), r = t.getState().getShadowValue(c);
            return n?.isDirty === !0 ? "dirty" : n?.isDirty === !1 || n?.stateSource === "server" ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" ? "fresh" : t.getState().getShadowMetadata(e, [])?.stateSource === "server" && !n?.isDirty ? "synced" : r !== void 0 && !n ? "fresh" : "unknown";
          };
          return y === "_status" ? s() : s;
        }
        if (y === "removeStorage")
          return () => {
            const s = t.getState().initialStateGlobal[e], n = ne(e), r = ae(n?.localStorage?.key) ? n.localStorage.key(s) : n?.localStorage?.key, a = `${h}-${e}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (y === "showValidationErrors")
          return () => {
            const s = t.getState().getShadowMetadata(e, i);
            return s?.validation?.status === "VALIDATION_FAILED" && s.validation.message ? [s.validation.message] : [];
          };
        if (Array.isArray(I)) {
          if (y === "getSelected")
            return () => {
              const s = e + "." + i.join(".");
              be(e, T, [
                ...i,
                "getSelected"
              ]);
              const n = t.getState().selectedIndicesMap;
              if (!n || !n.has(s))
                return;
              const r = n.get(s);
              if (g?.validIds && !g.validIds.includes(r))
                return;
              const a = t.getState().getShadowValue(r);
              if (a)
                return l({
                  currentState: a,
                  path: r.split(".").slice(1),
                  componentId: T
                });
            };
          if (y === "getSelectedIndex")
            return () => t.getState().getSelectedIndex(
              e + "." + i.join("."),
              g?.validIds
            );
          if (y === "clearSelected")
            return ve(e, i), () => {
              t.getState().clearSelectedIndex({
                arrayKey: e + "." + i.join(".")
              });
            };
          if (y === "useVirtualView")
            return (s) => {
              const {
                itemHeight: n = 50,
                overscan: r = 6,
                stickToBottom: a = !1,
                scrollStickTolerance: d = 75
              } = s, S = q(null), [f, k] = ee({
                startIndex: 0,
                endIndex: 10
              }), [$, _] = ee({}), U = q(!0), j = q({
                isUserScrolling: !1,
                lastScrollTop: 0,
                scrollUpCount: 0,
                isNearBottom: !0
              }), L = q(
                /* @__PURE__ */ new Map()
              );
              ge(() => {
                if (!a || !S.current || j.current.isUserScrolling)
                  return;
                const p = S.current;
                p.scrollTo({
                  top: p.scrollHeight,
                  behavior: U.current ? "instant" : "smooth"
                });
              }, [$, a]);
              const O = t.getState().getShadowMetadata(e, i)?.arrayKeys || [], { totalHeight: x, itemOffsets: J } = Se(() => {
                let p = 0;
                const w = /* @__PURE__ */ new Map();
                return (t.getState().getShadowMetadata(e, i)?.arrayKeys || []).forEach((C) => {
                  const A = C.split(".").slice(1), F = t.getState().getShadowMetadata(e, A)?.virtualizer?.itemHeight || n;
                  w.set(C, {
                    height: F,
                    offset: p
                  }), p += F;
                }), L.current = w, { totalHeight: p, itemOffsets: w };
              }, [O.length, n]);
              ge(() => {
                if (a && O.length > 0 && S.current && !j.current.isUserScrolling && U.current) {
                  const p = S.current, w = () => {
                    if (p.clientHeight > 0) {
                      const E = Math.ceil(
                        p.clientHeight / n
                      ), C = O.length - 1, A = Math.max(
                        0,
                        C - E - r
                      );
                      k({ startIndex: A, endIndex: C }), requestAnimationFrame(() => {
                        b("instant"), U.current = !1;
                      });
                    } else
                      requestAnimationFrame(w);
                  };
                  w();
                }
              }, [O.length, a, n, r]);
              const B = ue(() => {
                const p = S.current;
                if (!p) return;
                const w = p.scrollTop, { scrollHeight: E, clientHeight: C } = p, A = j.current, F = E - (w + C), Y = A.isNearBottom;
                A.isNearBottom = F <= d, w < A.lastScrollTop ? (A.scrollUpCount++, A.scrollUpCount > 3 && Y && (A.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : A.isNearBottom && (A.isUserScrolling = !1, A.scrollUpCount = 0), A.lastScrollTop = w;
                let N = 0;
                for (let z = 0; z < O.length; z++) {
                  const ie = O[z], fe = L.current.get(ie);
                  if (fe && fe.offset + fe.height > w) {
                    N = z;
                    break;
                  }
                }
                if (N !== f.startIndex) {
                  const z = Math.ceil(C / n);
                  k({
                    startIndex: Math.max(0, N - r),
                    endIndex: Math.min(
                      O.length - 1,
                      N + z + r
                    )
                  });
                }
              }, [
                O.length,
                f.startIndex,
                n,
                r,
                d
              ]);
              X(() => {
                const p = S.current;
                if (!(!p || !a))
                  return p.addEventListener("scroll", B, {
                    passive: !0
                  }), () => {
                    p.removeEventListener("scroll", B);
                  };
              }, [B, a]);
              const b = ue(
                (p = "smooth") => {
                  const w = S.current;
                  if (!w) return;
                  j.current.isUserScrolling = !1, j.current.isNearBottom = !0, j.current.scrollUpCount = 0;
                  const E = () => {
                    const C = (A = 0) => {
                      if (A > 5) return;
                      const F = w.scrollHeight, Y = w.scrollTop, N = w.clientHeight;
                      Y + N >= F - 1 || (w.scrollTo({
                        top: F,
                        behavior: p
                      }), setTimeout(() => {
                        const z = w.scrollHeight, ie = w.scrollTop;
                        (z !== F || ie + N < z - 1) && C(A + 1);
                      }, 50));
                    };
                    C();
                  };
                  "requestIdleCallback" in window ? requestIdleCallback(E, { timeout: 100 }) : requestAnimationFrame(() => {
                    requestAnimationFrame(E);
                  });
                },
                []
              );
              return X(() => {
                if (!a || !S.current) return;
                const p = S.current, w = j.current;
                let E;
                const C = () => {
                  clearTimeout(E), E = setTimeout(() => {
                    !w.isUserScrolling && w.isNearBottom && b(
                      U.current ? "instant" : "smooth"
                    );
                  }, 100);
                }, A = new MutationObserver(() => {
                  w.isUserScrolling || C();
                });
                A.observe(p, {
                  childList: !0,
                  subtree: !0,
                  attributes: !0,
                  attributeFilter: ["style", "class"]
                  // More specific than just 'height'
                });
                const F = (Y) => {
                  Y.target instanceof HTMLImageElement && !w.isUserScrolling && C();
                };
                return p.addEventListener("load", F, !0), U.current ? setTimeout(() => {
                  b("instant");
                }, 0) : C(), () => {
                  clearTimeout(E), A.disconnect(), p.removeEventListener("load", F, !0);
                };
              }, [a, O.length, b]), {
                virtualState: Se(() => {
                  const p = t.getState(), w = p.getShadowValue(
                    [e, ...i].join(".")
                  ), E = p.getShadowMetadata(e, i)?.arrayKeys || [], C = w.slice(
                    f.startIndex,
                    f.endIndex + 1
                  ), A = E.slice(
                    f.startIndex,
                    f.endIndex + 1
                  );
                  return l({
                    currentState: C,
                    path: i,
                    componentId: T,
                    meta: { ...g, validIds: A }
                  });
                }, [f.startIndex, f.endIndex, O.length]),
                virtualizerProps: {
                  outer: {
                    ref: S,
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
                      transform: `translateY(${L.current.get(
                        O[f.startIndex]
                      )?.offset || 0}px)`
                    }
                  }
                },
                scrollToBottom: b,
                scrollToIndex: (p, w = "smooth") => {
                  if (S.current && O[p]) {
                    const E = L.current.get(O[p])?.offset || 0;
                    S.current.scrollTo({ top: E, behavior: w });
                  }
                }
              };
            };
          if (y === "stateMap")
            return (s) => {
              const [n, r] = ee(
                g?.validIds ?? t.getState().getShadowMetadata(e, i)?.arrayKeys
              ), a = t.getState().getShadowValue(c, g?.validIds);
              if (!n)
                throw new Error("No array keys found for mapping");
              const d = l({
                currentState: a,
                path: i,
                componentId: T,
                meta: g
              });
              return a.map((S, f) => {
                const k = n[f]?.split(".").slice(1), $ = l({
                  currentState: S,
                  path: k,
                  componentId: T,
                  meta: g
                });
                return s(
                  $,
                  f,
                  d
                );
              });
            };
          if (y === "$stateMap")
            return (s) => de(qe, {
              proxy: {
                _stateKey: e,
                _path: i,
                _mapFn: s,
                _meta: g
              },
              rebuildStateShape: l
            });
          if (y === "stateFind")
            return (s) => {
              const n = g?.validIds ?? t.getState().getShadowMetadata(e, i)?.arrayKeys;
              if (n)
                for (let r = 0; r < n.length; r++) {
                  const a = n[r];
                  if (!a) continue;
                  const d = t.getState().getShadowValue(a);
                  if (s(d, r)) {
                    const S = a.split(".").slice(1);
                    return l({
                      currentState: d,
                      path: S,
                      componentId: T,
                      meta: g
                      // Pass along meta for potential further chaining
                    });
                  }
                }
            };
          if (y === "stateFilter")
            return (s) => {
              const n = g?.validIds ?? t.getState().getShadowMetadata(e, i)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for filtering.");
              const r = [], a = I.filter(
                (d, S) => s(d, S) ? (r.push(n[S]), !0) : !1
              );
              return l({
                currentState: a,
                path: i,
                componentId: T,
                meta: {
                  validIds: r,
                  transforms: [
                    ...g?.transforms || [],
                    {
                      type: "filter",
                      fn: s
                    }
                  ]
                }
              });
            };
          if (y === "stateSort")
            return (s) => {
              const n = g?.validIds ?? t.getState().getShadowMetadata(e, i)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for sorting");
              const r = I.map((a, d) => ({
                item: a,
                key: n[d]
              }));
              return r.sort((a, d) => s(a.item, d.item)).filter(Boolean), l({
                currentState: r.map((a) => a.item),
                path: i,
                componentId: T,
                meta: {
                  validIds: r.map((a) => a.key),
                  transforms: [
                    ...g?.transforms || [],
                    { type: "sort", fn: s }
                  ]
                }
              });
            };
          if (y === "stream")
            return function(s = {}) {
              const {
                bufferSize: n = 100,
                flushInterval: r = 100,
                bufferStrategy: a = "accumulate",
                store: d,
                onFlush: S
              } = s;
              let f = [], k = !1, $ = null;
              const _ = (x) => {
                if (!k) {
                  if (a === "sliding" && f.length >= n)
                    f.shift();
                  else if (a === "dropping" && f.length >= n)
                    return;
                  f.push(x), f.length >= n && U();
                }
              }, U = () => {
                if (f.length === 0) return;
                const x = [...f];
                if (f = [], d) {
                  const J = d(x);
                  J !== void 0 && (Array.isArray(J) ? J : [J]).forEach((b) => {
                    o(b, i, {
                      updateType: "insert"
                    });
                  });
                } else
                  x.forEach((J) => {
                    o(J, i, {
                      updateType: "insert"
                    });
                  });
                S?.(x);
              };
              r > 0 && ($ = setInterval(U, r));
              const j = re(), L = t.getState().getShadowMetadata(e, i) || {}, O = L.streams || /* @__PURE__ */ new Map();
              return O.set(j, { buffer: f, flushTimer: $ }), t.getState().setShadowMetadata(e, i, {
                ...L,
                streams: O
              }), {
                write: (x) => _(x),
                writeMany: (x) => x.forEach(_),
                flush: () => U(),
                pause: () => {
                  k = !0;
                },
                resume: () => {
                  k = !1, f.length > 0 && U();
                },
                close: () => {
                  U(), $ && clearInterval($);
                  const x = t.getState().getShadowMetadata(e, i);
                  x?.streams && x.streams.delete(j);
                }
              };
            };
          if (y === "stateList")
            return (s) => /* @__PURE__ */ oe(() => {
              const r = q(/* @__PURE__ */ new Map()), a = g?.transforms && g.transforms.length > 0 ? `${T}-${ze(g.transforms)}` : `${T}-base`, [d, S] = ee({}), { validIds: f, arrayValues: k } = Se(() => {
                const _ = t.getState().getShadowMetadata(e, i)?.transformCaches?.get(a);
                let U;
                _ && _.validIds ? U = _.validIds : (U = Ie(
                  e,
                  i,
                  g?.transforms
                ), t.getState().setTransformCache(e, i, a, {
                  validIds: U,
                  computedAt: Date.now(),
                  transforms: g?.transforms || []
                }));
                const j = t.getState().getShadowValue(c, U);
                return {
                  validIds: U,
                  arrayValues: j || []
                };
              }, [a, d]);
              if (console.log("freshValues", f, k), X(() => {
                const _ = t.getState().subscribeToPath(c, (U) => {
                  if (U.type === "GET_SELECTED")
                    return;
                  const L = t.getState().getShadowMetadata(e, i)?.transformCaches;
                  if (L)
                    for (const O of L.keys())
                      O.startsWith(T) && L.delete(O);
                  (U.type === "INSERT" || U.type === "REMOVE" || U.type === "CLEAR_SELECTION") && S({});
                });
                return () => {
                  _();
                };
              }, [T, c]), !Array.isArray(k))
                return null;
              const $ = l({
                currentState: k,
                path: i,
                componentId: T,
                meta: {
                  ...g,
                  validIds: f
                }
              });
              return console.log("sssssssssssssssssssssssssssss", $), /* @__PURE__ */ oe(ke, { children: k.map((_, U) => {
                const j = f[U];
                if (!j)
                  return null;
                let L = r.current.get(j);
                L || (L = re(), r.current.set(j, L));
                const O = j.split(".").slice(1);
                return de(Me, {
                  key: j,
                  stateKey: e,
                  itemComponentId: L,
                  itemPath: O,
                  localIndex: U,
                  arraySetter: $,
                  rebuildStateShape: l,
                  renderFn: s
                });
              }) });
            }, {});
          if (y === "stateFlattenOn")
            return (s) => {
              const n = I;
              v.clear(), M++;
              const r = n.flatMap(
                (a) => a[s] ?? []
              );
              return l({
                currentState: r,
                path: [...i, "[*]", s],
                componentId: T,
                meta: g
              });
            };
          if (y === "index")
            return (s) => {
              const r = t.getState().getShadowMetadata(e, i)?.arrayKeys?.filter(
                (S) => !g?.validIds || g?.validIds && g?.validIds?.includes(S)
              )?.[s];
              if (!r) return;
              const a = t.getState().getShadowValue(r, g?.validIds);
              return l({
                currentState: a,
                path: r.split(".").slice(1),
                componentId: T,
                meta: g
              });
            };
          if (y === "last")
            return () => {
              const s = t.getState().getShadowValue(e, i);
              if (s.length === 0) return;
              const n = s.length - 1, r = s[n], a = [...i, n.toString()];
              return l({
                currentState: r,
                path: a,
                componentId: T,
                meta: g
              });
            };
          if (y === "insert")
            return (s, n) => (o(s, i, { updateType: "insert" }), l({
              currentState: t.getState().getShadowValue(e, i),
              path: i,
              componentId: T,
              meta: g
            }));
          if (y === "uniqueInsert")
            return (s, n, r) => {
              const a = t.getState().getShadowValue(e, i), d = ae(s) ? s(a) : s;
              let S = null;
              if (!a.some((k) => {
                const $ = n ? n.every(
                  (_) => le(k[_], d[_])
                ) : le(k, d);
                return $ && (S = k), $;
              }))
                V(i), o(d, i, { updateType: "insert" });
              else if (r && S) {
                const k = r(S), $ = a.map(
                  (_) => le(_, S) ? k : _
                );
                V(i), o($, i, {
                  updateType: "update"
                });
              }
            };
          if (y === "cut")
            return (s, n) => {
              const r = g?.validIds ?? t.getState().getShadowMetadata(e, i)?.arrayKeys;
              if (!r || r.length === 0) return;
              const a = s == -1 ? r.length - 1 : s !== void 0 ? s : r.length - 1, d = r[a];
              if (!d) return;
              const S = d.split(".").slice(1);
              o(I, S, {
                updateType: "cut"
              });
            };
          if (y === "cutSelected")
            return () => {
              t.getState().getShadowMetadata(e, i)?.arrayKeys;
              const s = Ie(
                e,
                i,
                g?.transforms
              );
              if (console.log("validKeys", s), !s || s.length === 0) return;
              const n = t.getState().selectedIndicesMap.get(c);
              let r = s.findIndex(
                (d) => d === n
              );
              console.log("indexToCut", r);
              const a = s[r == -1 ? s.length - 1 : r]?.split(".").slice(1);
              console.log("pathForCut", a), o(I, a, {
                updateType: "cut"
              });
            };
          if (y === "cutByValue")
            return (s) => {
              const n = t.getState().getShadowMetadata(e, i), r = g?.validIds ?? n?.arrayKeys;
              if (!r) return;
              let a = null;
              for (const d of r)
                if (t.getState().getShadowValue(d) === s) {
                  a = d;
                  break;
                }
              if (a) {
                const d = a.split(".").slice(1);
                o(null, d, { updateType: "cut" });
              }
            };
          if (y === "toggleByValue")
            return (s) => {
              const n = t.getState().getShadowMetadata(e, i), r = g?.validIds ?? n?.arrayKeys;
              if (!r) return;
              let a = null;
              for (const d of r) {
                const S = t.getState().getShadowValue(d);
                if (console.log("itemValue sdasdasdasd", S), S === s) {
                  a = d;
                  break;
                }
              }
              if (console.log("itemValue keyToCut", a), a) {
                const d = a.split(".").slice(1);
                console.log("itemValue keyToCut", a), o(s, d, {
                  updateType: "cut"
                });
              } else
                o(s, i, { updateType: "insert" });
            };
          if (y === "findWith")
            return (s, n) => {
              const r = t.getState().getShadowMetadata(e, i)?.arrayKeys;
              if (!r)
                throw new Error("No array keys found for sorting");
              let a = null, d = [];
              for (const S of r) {
                let f = t.getState().getShadowValue(S, g?.validIds);
                if (f && f[s] === n) {
                  a = f, d = S.split(".").slice(1);
                  break;
                }
              }
              return l({
                currentState: a,
                path: d,
                componentId: T,
                meta: g
              });
            };
        }
        if (y === "cut") {
          let s = t.getState().getShadowValue(i.join("."));
          return () => {
            o(s, i, { updateType: "cut" });
          };
        }
        if (y === "get")
          return () => (be(e, T, i), t.getState().getShadowValue(c, g?.validIds));
        if (y === "getState")
          return () => t.getState().getShadowValue(c, g?.validIds);
        if (y === "$derive")
          return (s) => Ae({
            _stateKey: e,
            _path: i,
            _effect: s.toString(),
            _meta: g
          });
        if (y === "$get")
          return () => Ae({ _stateKey: e, _path: i, _meta: g });
        if (y === "lastSynced") {
          const s = `${e}:${i.join(".")}`;
          return t.getState().getSyncInfo(s);
        }
        if (y == "getLocalStorage")
          return (s) => me(h + "-" + e + "-" + s);
        if (y === "isSelected") {
          const s = [e, ...i].slice(0, -1);
          if (ve(e, i, void 0), Array.isArray(
            t.getState().getShadowValue(s.join("."), g?.validIds)
          )) {
            i[i.length - 1];
            const n = s.join("."), r = t.getState().selectedIndicesMap.get(n), a = e + "." + i.join(".");
            return r === a;
          }
          return;
        }
        if (y === "setSelected")
          return (s) => {
            const n = i.slice(0, -1), r = e + "." + n.join("."), a = e + "." + i.join(".");
            ve(e, n, void 0), t.getState().selectedIndicesMap.get(r), s && t.getState().setSelectedIndex(r, a);
          };
        if (y === "toggleSelected")
          return () => {
            const s = i.slice(0, -1), n = e + "." + s.join("."), r = e + "." + i.join(".");
            t.getState().selectedIndicesMap.get(n) === r ? t.getState().clearSelectedIndex({ arrayKey: n }) : t.getState().setSelectedIndex(n, r);
          };
        if (y === "_componentId")
          return T;
        if (i.length == 0) {
          if (y === "addValidation")
            return (s) => {
              const n = t.getState().getInitialOptions(e)?.validation;
              if (!n?.key) throw new Error("Validation key not found");
              se(n.key), s.forEach((r) => {
                const a = [n.key, ...r.path].join(".");
                he(a, r.message);
              }), ce(e);
            };
          if (y === "applyJsonPatch")
            return (s) => {
              const n = t.getState(), r = n.getShadowMetadata(e, []);
              if (!r?.components) return;
              const a = (S) => !S || S === "/" ? [] : S.split("/").slice(1).map((f) => f.replace(/~1/g, "/").replace(/~0/g, "~")), d = /* @__PURE__ */ new Set();
              for (const S of s) {
                const f = a(S.path);
                switch (S.op) {
                  case "add":
                  case "replace": {
                    const { value: k } = S;
                    n.updateShadowAtPath(e, f, k), n.markAsDirty(e, f, { bubble: !0 });
                    let $ = [...f];
                    for (; ; ) {
                      const _ = n.getShadowMetadata(
                        e,
                        $
                      );
                      if (console.log("pathMeta", _), _?.pathComponents && _.pathComponents.forEach((U) => {
                        if (!d.has(U)) {
                          const j = r.components?.get(U);
                          j && (j.forceUpdate(), d.add(U));
                        }
                      }), $.length === 0) break;
                      $.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const k = f.slice(0, -1);
                    n.removeShadowArrayElement(e, f), n.markAsDirty(e, k, { bubble: !0 });
                    let $ = [...k];
                    for (; ; ) {
                      const _ = n.getShadowMetadata(
                        e,
                        $
                      );
                      if (_?.pathComponents && _.pathComponents.forEach((U) => {
                        if (!d.has(U)) {
                          const j = r.components?.get(U);
                          j && (j.forceUpdate(), d.add(U));
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
              const s = t.getState().getInitialOptions(e)?.validation, n = s?.zodSchemaV4 || s?.zodSchemaV3;
              if (!n || !s?.key)
                throw new Error(
                  "Zod schema (v3 or v4) or validation key not found"
                );
              se(s.key);
              const r = t.getState().getShadowValue(e), a = n.safeParse(r);
              return a.success ? !0 : ("issues" in a.error ? a.error.issues.forEach((d) => {
                const S = [s.key, ...d.path].join(".");
                he(S, d.message);
              }) : a.error.errors.forEach((d) => {
                const S = [s.key, ...d.path].join(".");
                he(S, d.message);
              }), ce(e), !1);
            };
          if (y === "getComponents")
            return () => t.getState().getShadowMetadata(e, [])?.components;
          if (y === "getAllFormRefs")
            return () => pe.getState().getFormRefsByStateKey(e);
        }
        if (y === "getFormRef")
          return () => pe.getState().getFormRef(e + "." + i.join("."));
        if (y === "validationWrapper")
          return ({
            children: s,
            hideMessage: n
          }) => /* @__PURE__ */ oe(
            Ve,
            {
              formOpts: n ? { validation: { message: "" } } : void 0,
              path: i,
              stateKey: e,
              children: s
            }
          );
        if (y === "_stateKey") return e;
        if (y === "_path") return i;
        if (y === "update")
          return (s) => (o(s, i, { updateType: "update" }), {
            /**
             * Marks this specific item, which was just updated, as 'synced' (not dirty).
             */
            synced: () => {
              const n = t.getState().getShadowMetadata(e, i);
              t.getState().setShadowMetadata(e, i, {
                ...n,
                isDirty: !1,
                // EXPLICITLY set to false, not just undefined
                stateSource: "server",
                // Mark as coming from server
                lastServerSync: Date.now()
                // Add timestamp
              });
              const r = [e, ...i].join(".");
              t.getState().notifyPathSubscribers(r, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (y === "toggle") {
          const s = t.getState().getShadowValue([e, ...i].join("."));
          if (console.log("currentValueAtPath", s), typeof I != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            o(!s, i, {
              updateType: "update"
            });
          };
        }
        if (y === "formElement")
          return (s, n) => /* @__PURE__ */ oe(
            Ve,
            {
              formOpts: n,
              path: i,
              stateKey: e,
              children: /* @__PURE__ */ oe(
                Ze,
                {
                  stateKey: e,
                  path: i,
                  rebuildStateShape: l,
                  setState: o,
                  formOpts: n,
                  renderFn: s
                }
              )
            }
          );
        const te = [...i, y], K = t.getState().getShadowValue(e, te);
        return l({
          currentState: K,
          path: te,
          componentId: T,
          meta: g
        });
      }
    }, G = new Proxy(H, Z);
    return v.set(W, {
      proxy: G,
      stateVersion: M
    }), G;
  }
  const u = {
    removeValidation: (I) => {
      I?.validationKey && se(I.validationKey);
    },
    revertToInitialState: (I) => {
      const i = t.getState().getInitialOptions(e)?.validation;
      i?.key && se(i.key), I?.validationKey && se(I.validationKey);
      const g = t.getState().getShadowMetadata(e, []);
      g?.stateSource === "server" && g.baseServerState ? g.baseServerState : t.getState().initialStateGlobal[e];
      const T = t.getState().initialStateGlobal[e];
      t.getState().clearSelectedIndexesForState(e), v.clear(), M++, t.getState().initializeShadowState(e, T), l({
        currentState: T,
        path: [],
        componentId: m
      });
      const W = ne(e), c = ae(W?.localStorage?.key) ? W?.localStorage?.key(T) : W?.localStorage?.key, H = `${h}-${e}-${c}`;
      H && localStorage.removeItem(H);
      const Z = t.getState().getShadowMetadata(e, []);
      return Z && Z?.components?.forEach((G) => {
        G.forceUpdate();
      }), T;
    },
    updateInitialState: (I) => {
      v.clear(), M++;
      const i = $e(
        e,
        o,
        m,
        h
      ), g = t.getState().initialStateGlobal[e], T = ne(e), W = ae(T?.localStorage?.key) ? T?.localStorage?.key(g) : T?.localStorage?.key, c = `${h}-${e}-${W}`;
      return localStorage.getItem(c) && localStorage.removeItem(c), je(() => {
        De(e, I), t.getState().initializeShadowState(e, I);
        const H = t.getState().getShadowMetadata(e, []);
        H && H?.components?.forEach((Z) => {
          Z.forceUpdate();
        });
      }), {
        fetchId: (H) => i.get()[H]
      };
    }
  };
  return l({
    currentState: t.getState().getShadowValue(e, []),
    componentId: m,
    path: []
  });
}
function Ae(e) {
  return de(Ge, { proxy: e });
}
function qe({
  proxy: e,
  rebuildStateShape: o
}) {
  const m = q(null), h = q(`map-${crypto.randomUUID()}`), v = q(!1), M = q(/* @__PURE__ */ new Map());
  X(() => {
    const l = m.current;
    if (!l || v.current) return;
    const u = setTimeout(() => {
      const P = t.getState().getShadowMetadata(e._stateKey, e._path) || {}, I = P.mapWrappers || [];
      I.push({
        instanceId: h.current,
        mapFn: e._mapFn,
        containerRef: l,
        rebuildStateShape: o,
        path: e._path,
        componentId: h.current,
        meta: e._meta
      }), t.getState().setShadowMetadata(e._stateKey, e._path, {
        ...P,
        mapWrappers: I
      }), v.current = !0, V();
    }, 0);
    return () => {
      if (clearTimeout(u), h.current) {
        const P = t.getState().getShadowMetadata(e._stateKey, e._path) || {};
        P.mapWrappers && (P.mapWrappers = P.mapWrappers.filter(
          (I) => I.instanceId !== h.current
        ), t.getState().setShadowMetadata(e._stateKey, e._path, P));
      }
      M.current.forEach((P) => P.unmount());
    };
  }, []);
  const V = () => {
    const l = m.current;
    if (!l) return;
    const u = t.getState().getShadowValue(
      [e._stateKey, ...e._path].join("."),
      e._meta?.validIds
    );
    if (!Array.isArray(u)) return;
    const P = e._meta?.validIds ?? t.getState().getShadowMetadata(e._stateKey, e._path)?.arrayKeys ?? [], I = o({
      currentState: u,
      path: e._path,
      componentId: h.current,
      meta: e._meta
    });
    u.forEach((i, g) => {
      const T = P[g];
      if (!T) return;
      const W = re(), c = document.createElement("div");
      c.setAttribute("data-item-path", T), l.appendChild(c);
      const H = Ce(c);
      M.current.set(T, H);
      const Z = T.split(".").slice(1);
      H.render(
        de(Me, {
          stateKey: e._stateKey,
          itemComponentId: W,
          itemPath: Z,
          localIndex: g,
          arraySetter: I,
          rebuildStateShape: o,
          renderFn: e._mapFn
        })
      );
    });
  };
  return /* @__PURE__ */ oe("div", { ref: m, "data-map-container": h.current });
}
function Ge({
  proxy: e
}) {
  const o = q(null), m = q(null), h = q(!1), v = `${e._stateKey}-${e._path.join(".")}`, M = t.getState().getShadowValue(
    [e._stateKey, ...e._path].join("."),
    e._meta?.validIds
  );
  return X(() => {
    const V = o.current;
    if (!V || h.current) return;
    const l = setTimeout(() => {
      if (!V.parentElement) {
        console.warn("Parent element not found for signal", v);
        return;
      }
      const u = V.parentElement, I = Array.from(u.childNodes).indexOf(V);
      let i = u.getAttribute("data-parent-id");
      i || (i = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", i)), m.current = `instance-${crypto.randomUUID()}`;
      const g = t.getState().getShadowMetadata(e._stateKey, e._path) || {}, T = g.signals || [];
      T.push({
        instanceId: m.current,
        parentId: i,
        position: I,
        effect: e._effect
      }), t.getState().setShadowMetadata(e._stateKey, e._path, {
        ...g,
        signals: T
      });
      let W = M;
      if (e._effect)
        try {
          W = new Function(
            "state",
            `return (${e._effect})(state)`
          )(M);
        } catch (H) {
          console.error("Error evaluating effect function:", H);
        }
      W !== null && typeof W == "object" && (W = JSON.stringify(W));
      const c = document.createTextNode(String(W ?? ""));
      V.replaceWith(c), h.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(l), m.current) {
        const u = t.getState().getShadowMetadata(e._stateKey, e._path) || {};
        u.signals && (u.signals = u.signals.filter(
          (P) => P.instanceId !== m.current
        ), t.getState().setShadowMetadata(e._stateKey, e._path, u));
      }
    };
  }, []), de("span", {
    ref: o,
    style: { display: "contents" },
    "data-signal-id": v
  });
}
const Me = Re(
  Ye,
  (e, o) => e.itemPath.join(".") === o.itemPath.join(".") && e.stateKey === o.stateKey && e.itemComponentId === o.itemComponentId && e.localIndex === o.localIndex
), Je = (e) => {
  const [o, m] = ee(!1);
  return ge(() => {
    if (!e.current) {
      m(!0);
      return;
    }
    const h = Array.from(e.current.querySelectorAll("img"));
    if (h.length === 0) {
      m(!0);
      return;
    }
    let v = 0;
    const M = () => {
      v++, v === h.length && m(!0);
    };
    return h.forEach((V) => {
      V.complete ? M() : (V.addEventListener("load", M), V.addEventListener("error", M));
    }), () => {
      h.forEach((V) => {
        V.removeEventListener("load", M), V.removeEventListener("error", M);
      });
    };
  }, [e.current]), o;
};
function Ye({
  stateKey: e,
  itemComponentId: o,
  itemPath: m,
  localIndex: h,
  arraySetter: v,
  rebuildStateShape: M,
  renderFn: V
}) {
  const [, l] = ee({}), { ref: u, inView: P } = Ne(), I = q(null), i = Je(I), g = q(!1), T = [e, ...m].join(".");
  Ue(e, o, l);
  const W = ue(
    (R) => {
      I.current = R, u(R);
    },
    [u]
  );
  X(() => {
    t.getState().subscribeToPath(T, (R) => {
      l({});
    });
  }, []), X(() => {
    if (!P || !i || g.current)
      return;
    const R = I.current;
    if (R && R.offsetHeight > 0) {
      g.current = !0;
      const y = R.offsetHeight;
      t.getState().setShadowMetadata(e, m, {
        virtualizer: {
          itemHeight: y,
          domRef: R
        }
      });
      const Q = m.slice(0, -1), te = [e, ...Q].join(".");
      t.getState().notifyPathSubscribers(te, {
        type: "ITEMHEIGHT",
        itemKey: m.join("."),
        ref: I.current
      });
    }
  }, [P, i, e, m]);
  const c = [e, ...m].join("."), H = t.getState().getShadowValue(c);
  if (H === void 0)
    return null;
  const Z = M({
    currentState: H,
    path: m,
    componentId: o
  }), G = V(Z, h, v);
  return /* @__PURE__ */ oe("div", { ref: W, children: G });
}
function Ze({
  stateKey: e,
  path: o,
  rebuildStateShape: m,
  renderFn: h,
  formOpts: v,
  setState: M
}) {
  const [V] = ee(() => re()), [, l] = ee({}), u = [e, ...o].join(".");
  Ue(e, V, l);
  const P = t.getState().getShadowValue(u), [I, i] = ee(P), g = q(!1), T = q(null);
  X(() => {
    !g.current && !le(P, I) && i(P);
  }, [P]), X(() => {
    const G = t.getState().subscribeToPath(u, (R) => {
      !g.current && I !== R && l({});
    });
    return () => {
      G(), T.current && (clearTimeout(T.current), g.current = !1);
    };
  }, []);
  const W = ue(
    (G) => {
      i(G), g.current = !0, T.current && clearTimeout(T.current);
      const R = v?.debounceTime ?? 200;
      T.current = setTimeout(() => {
        if (g.current = !1, !(v?.sync?.allowInvalidValues ?? !1)) {
          M(G, o, { updateType: "update" });
          const { getInitialOptions: Q, getValidationErrors: te } = t.getState(), K = Q(e)?.validation?.key;
          if (K) {
            const s = K + "." + o.join(".");
            if (te(s).length > 0) {
              console.log("Validation failed, state updated but sync blocked");
              return;
            }
          }
        } else
          M(G, o, { updateType: "update" });
      }, R);
    },
    [
      M,
      o,
      v?.debounceTime,
      v?.sync?.allowInvalidValues,
      e
    ]
  ), c = ue(async () => {
    console.log("handleBlur triggered"), T.current && (clearTimeout(T.current), T.current = null, g.current = !1, M(I, o, { updateType: "update" }));
    const { getInitialOptions: G } = t.getState(), R = G(e)?.validation, y = R?.zodSchemaV4 || R?.zodSchemaV3;
    if (!y || !R?.onBlur) return;
    [e, ...o].join(".");
    const Q = t.getState().getShadowMetadata(e, o);
    t.getState().setShadowMetadata(e, o, {
      ...Q,
      validation: {
        status: "DIRTY",
        validatedValue: I
      }
    });
    const te = t.getState().getShadowValue(e), K = y.safeParse(te);
    if (K.success)
      t.getState().setShadowMetadata(e, o, {
        ...Q,
        validation: {
          status: "VALID_PENDING_SYNC",
          validatedValue: I
        }
      });
    else {
      const n = ("issues" in K.error ? K.error.issues : K.error.errors).filter((r) => {
        if (o.some((a) => a.startsWith("id:"))) {
          const a = o[0].startsWith("id:") ? [] : o.slice(0, -1), d = t.getState().getShadowMetadata(e, a);
          if (d?.arrayKeys) {
            const S = [e, ...o.slice(0, -1)].join("."), f = d.arrayKeys.indexOf(S), k = [...a, f, ...o.slice(-1)];
            return JSON.stringify(r.path) === JSON.stringify(k);
          }
        }
        return JSON.stringify(r.path) === JSON.stringify(o);
      });
      t.getState().setShadowMetadata(e, o, {
        ...Q,
        validation: {
          status: "VALIDATION_FAILED",
          message: n[0]?.message,
          validatedValue: I
        }
      });
    }
    ce(e);
  }, [e, o, I, M]), H = m({
    currentState: P,
    path: o,
    componentId: V
  }), Z = new Proxy(H, {
    get(G, R) {
      return R === "inputProps" ? {
        value: I ?? "",
        onChange: (y) => {
          W(y.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: c,
        ref: pe.getState().getFormRef(e + "." + o.join("."))
      } : G[R];
    }
  });
  return /* @__PURE__ */ oe(ke, { children: h(Z) });
}
function Ue(e, o, m) {
  const h = `${e}////${o}`;
  ge(() => {
    const { registerComponent: v, unregisterComponent: M } = t.getState();
    return v(e, h, {
      forceUpdate: () => m({}),
      paths: /* @__PURE__ */ new Set(),
      reactiveType: ["component"]
    }), () => {
      M(e, h);
    };
  }, [e, h]);
}
export {
  Ae as $cogsSignal,
  it as addStateOptions,
  ct as createCogsState,
  lt as notifyComponent,
  Be as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
