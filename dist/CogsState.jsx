"use client";
import { jsx as oe, Fragment as ke } from "react/jsx-runtime";
import { memo as Re, useState as ee, useRef as q, useCallback as ue, useEffect as K, useLayoutEffect as ge, useMemo as Se, createElement as de, startTransition as je } from "react";
import { createRoot as Ce } from "react-dom/client";
import { transformStateFunc as Fe, isFunction as ae, isArray as Te, getDifferences as Pe, isDeepEqual as le } from "./utility.js";
import { ValidationWrapper as Ve } from "./Functions.jsx";
import Oe from "superjson";
import { v4 as re } from "uuid";
import { getGlobalStore as t, formRefStore as ve } from "./store.js";
import { useCogsConfig as De } from "./CogsStateClient.jsx";
import { useInView as Ne } from "react-intersection-observer";
function ye(e, o) {
  const m = t.getState().getInitialOptions, h = t.getState().setInitialStateOptions, p = m(e) || {};
  h(e, {
    ...p,
    ...o
  });
}
function Ee({
  stateKey: e,
  options: o,
  initialOptionsPart: m
}) {
  const h = ne(e) || {}, p = m[e] || {}, M = t.getState().setInitialStateOptions, V = { ...p, ...h };
  let l = !1;
  if (o)
    for (const d in o)
      V.hasOwnProperty(d) ? (d == "localStorage" && o[d] && V[d].key !== o[d]?.key && (l = !0, V[d] = o[d]), d == "defaultState" && o[d] && V[d] !== o[d] && !le(V[d], o[d]) && (l = !0, V[d] = o[d])) : (l = !0, V[d] = o[d]);
  l && M(e, V);
}
function it(e, { formElements: o, validation: m }) {
  return { initialState: e, formElements: o, validation: m };
}
const ct = (e, o) => {
  let m = e;
  const [h, p] = Fe(m);
  Object.keys(h).forEach((l) => {
    let d = p[l] || {};
    const P = {
      ...d
    };
    if (o?.formElements && (P.formElements = {
      ...o.formElements,
      ...d.formElements || {}
    }), o?.validation && (P.validation = {
      ...o.validation,
      ...d.validation || {}
    }, o.validation.key && !d.validation?.key && (P.validation.key = `${o.validation.key}.${l}`)), Object.keys(P).length > 0) {
      const I = ne(l);
      I ? t.getState().setInitialStateOptions(l, {
        ...I,
        ...P
      }) : t.getState().setInitialStateOptions(l, P);
    }
  }), Object.keys(h).forEach((l) => {
    t.getState().initializeShadowState(l, h[l]);
  });
  const M = (l, d) => {
    const [P] = ee(d?.componentId ?? re());
    Ee({
      stateKey: l,
      options: d,
      initialOptionsPart: p
    });
    const I = t.getState().getShadowValue(l) || h[l], i = d?.modifyState ? d.modifyState(I) : I;
    return Be(i, {
      stateKey: l,
      syncUpdate: d?.syncUpdate,
      componentId: P,
      localStorage: d?.localStorage,
      middleware: d?.middleware,
      reactiveType: d?.reactiveType,
      reactiveDeps: d?.reactiveDeps,
      defaultState: d?.defaultState,
      dependencies: d?.dependencies,
      serverState: d?.serverState
    });
  };
  function V(l, d) {
    Ee({ stateKey: l, options: d, initialOptionsPart: p }), d.localStorage && He(l, d), ce(l);
  }
  return { useCogsState: M, setCogsOptions: V };
}, {
  getInitialOptions: ne,
  getValidationErrors: Le,
  setStateLog: We,
  updateInitialStateGlobal: _e,
  addValidationError: he,
  removeValidationError: se
} = t.getState(), xe = (e, o, m, h, p) => {
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
    const d = t.getState().getShadowMetadata(o, []), P = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: l,
      stateSource: d?.stateSource,
      baseServerState: d?.baseServerState
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
}, He = (e, o) => {
  const m = t.getState().getShadowValue(e), { sessionId: h } = De(), p = ae(o?.localStorage?.key) ? o.localStorage.key(m) : o?.localStorage?.key;
  if (p && h) {
    const M = me(
      `${h}-${e}-${p}`
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
    const h = `${e}////${o}`, p = m?.components?.get(h);
    if ((p ? Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"] : null)?.includes("none"))
      return;
    p && p.forceUpdate();
  }
};
function we(e, o, m, h) {
  const p = t.getState(), M = p.getShadowMetadata(e, o);
  if (p.setShadowMetadata(e, o, {
    ...M,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: h || Date.now()
  }), Array.isArray(m)) {
    const V = p.getShadowMetadata(e, o);
    V?.arrayKeys && V.arrayKeys.forEach((l, d) => {
      const P = l.split(".").slice(1), I = m[d];
      I !== void 0 && we(
        e,
        P,
        I,
        h
      );
    });
  } else m && typeof m == "object" && m.constructor === Object && Object.keys(m).forEach((V) => {
    const l = [...o, V], d = m[V];
    we(e, l, d, h);
  });
}
function Be(e, {
  stateKey: o,
  localStorage: m,
  formElements: h,
  reactiveDeps: p,
  reactiveType: M,
  componentId: V,
  defaultState: l,
  syncUpdate: d,
  dependencies: P,
  serverState: I
} = {}) {
  const [i, S] = ee({}), { sessionId: T } = De();
  let W = !o;
  const [c] = ee(o ?? re()), x = t.getState().stateLog[c], Z = q(/* @__PURE__ */ new Set()), G = q(V ?? re()), j = q(
    null
  );
  j.current = ne(c) ?? null, K(() => {
    if (d && d.stateKey === c && d.path?.[0]) {
      const n = `${d.stateKey}:${d.path.join(".")}`;
      t.getState().setSyncInfo(n, {
        timeStamp: d.timeStamp,
        userId: d.userId
      });
    }
  }, [d]);
  const y = ue(
    (n) => {
      const a = n ? { ...ne(c), ...n } : ne(c), u = a?.defaultState || l || e;
      if (a?.serverState?.status === "success" && a?.serverState?.data !== void 0)
        return {
          value: a.serverState.data,
          source: "server",
          timestamp: a.serverState.timestamp || Date.now()
        };
      if (a?.localStorage?.key && T) {
        const f = ae(a.localStorage.key) ? a.localStorage.key(u) : a.localStorage.key, A = me(
          `${T}-${c}-${f}`
        );
        if (A && A.lastUpdated > (a?.serverState?.timestamp || 0))
          return {
            value: A.state,
            source: "localStorage",
            timestamp: A.lastUpdated
          };
      }
      return {
        value: u || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [c, l, e, T]
  );
  K(() => {
    t.getState().setServerStateUpdate(c, I);
  }, [I, c]), K(() => t.getState().subscribeToPath(c, (r) => {
    if (r?.type === "SERVER_STATE_UPDATE") {
      const a = r.serverState;
      if (a?.status === "success" && a.data !== void 0) {
        ye(c, { serverState: a });
        const g = typeof a.merge == "object" ? a.merge : a.merge === !0 ? {} : null, f = t.getState().getShadowValue(c), A = a.data;
        if (g && Array.isArray(f) && Array.isArray(A)) {
          const D = g.key || "id", U = new Set(
            f.map((L) => L[D])
          ), R = A.filter((L) => !U.has(L[D]));
          R.length > 0 && R.forEach((L) => {
            t.getState().insertShadowArrayElement(c, [], L);
            const O = t.getState().getShadowMetadata(c, []);
            if (O?.arrayKeys) {
              const H = O.arrayKeys[O.arrayKeys.length - 1];
              if (H) {
                const J = H.split(".").slice(1);
                t.getState().setShadowMetadata(c, J, {
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: a.timestamp || Date.now()
                });
                const B = t.getState().getShadowValue(H);
                B && typeof B == "object" && !Array.isArray(B) && Object.keys(B).forEach((b) => {
                  const $ = [...J, b];
                  t.getState().setShadowMetadata(c, $, {
                    isDirty: !1,
                    stateSource: "server",
                    lastServerSync: a.timestamp || Date.now()
                  });
                });
              }
            }
          });
        } else
          t.getState().initializeShadowState(c, A), we(
            c,
            [],
            A,
            a.timestamp
          );
        const _ = t.getState().getShadowMetadata(c, []);
        t.getState().setShadowMetadata(c, [], {
          ..._,
          stateSource: "server",
          lastServerSync: a.timestamp || Date.now(),
          isDirty: !1
        });
      }
    }
  }), [c, y]), K(() => {
    const n = t.getState().getShadowMetadata(c, []);
    if (n && n.stateSource)
      return;
    const r = ne(c);
    if (r?.defaultState !== void 0 || l !== void 0) {
      const a = r?.defaultState || l;
      r?.defaultState || ye(c, {
        defaultState: a
      });
      const { value: u, source: g, timestamp: f } = y();
      t.getState().initializeShadowState(c, u), t.getState().setShadowMetadata(c, [], {
        stateSource: g,
        lastServerSync: g === "server" ? f : void 0,
        isDirty: !1,
        baseServerState: g === "server" ? u : void 0
      }), ce(c);
    }
  }, [c, ...P || []]), ge(() => {
    W && ye(c, {
      formElements: h,
      defaultState: l,
      localStorage: m,
      middleware: j.current?.middleware
    });
    const n = `${c}////${G.current}`, r = t.getState().getShadowMetadata(c, []), a = r?.components || /* @__PURE__ */ new Map();
    return a.set(n, {
      forceUpdate: () => S({}),
      reactiveType: M ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: p || void 0,
      deps: p ? p(t.getState().getShadowValue(c)) : [],
      prevDeps: p ? p(t.getState().getShadowValue(c)) : []
    }), t.getState().setShadowMetadata(c, [], {
      ...r,
      components: a
    }), S({}), () => {
      const u = t.getState().getShadowMetadata(c, []), g = u?.components?.get(n);
      g?.paths && g.paths.forEach((f) => {
        const _ = f.split(".").slice(1), D = t.getState().getShadowMetadata(c, _);
        D?.pathComponents && D.pathComponents.size === 0 && (delete D.pathComponents, t.getState().setShadowMetadata(c, _, D));
      }), u?.components && t.getState().setShadowMetadata(c, [], u);
    };
  }, []);
  const Q = q(null), te = (n, r, a, u) => {
    const g = [c, ...r].join(".");
    if (Array.isArray(r)) {
      const b = `${c}-${r.join(".")}`;
      Z.current.add(b);
    }
    const f = t.getState(), A = f.getShadowMetadata(c, r), _ = f.getShadowValue(g), D = a.updateType === "insert" && ae(n) ? n({ state: _, uuid: re() }) : ae(n) ? n(_) : n, R = {
      timeStamp: Date.now(),
      stateKey: c,
      path: r,
      updateType: a.updateType,
      status: "new",
      oldValue: _,
      newValue: D
    };
    switch (a.updateType) {
      case "insert": {
        f.insertShadowArrayElement(c, r, R.newValue), f.markAsDirty(c, r, { bubble: !0 });
        const b = f.getShadowMetadata(c, r);
        if (b?.arrayKeys) {
          const $ = b.arrayKeys[b.arrayKeys.length - 1];
          if ($) {
            const v = $.split(".").slice(1);
            f.markAsDirty(c, v, { bubble: !1 });
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
        f.updateShadowAtPath(c, r, R.newValue), f.markAsDirty(c, r, { bubble: !0 });
        break;
      }
    }
    if (a.sync !== !1 && Q.current && Q.current.connected && Q.current.updateState({ operation: R }), A?.signals && A.signals.length > 0) {
      const b = a.updateType === "cut" ? null : D;
      A.signals.forEach(({ parentId: $, position: v, effect: w }) => {
        const E = document.querySelector(`[data-parent-id="${$}"]`);
        if (E) {
          const C = Array.from(E.childNodes);
          if (C[v]) {
            let k = b;
            if (w && b !== null)
              try {
                k = new Function(
                  "state",
                  `return (${w})(state)`
                )(b);
              } catch (F) {
                console.error("Error evaluating effect function:", F);
              }
            k != null && typeof k == "object" && (k = JSON.stringify(k)), C[v].textContent = String(k ?? "");
          }
        }
      });
    }
    if (a.updateType === "insert" && A?.mapWrappers && A.mapWrappers.length > 0) {
      const b = f.getShadowMetadata(c, r)?.arrayKeys || [], $ = b[b.length - 1], v = f.getShadowValue($), w = f.getShadowValue(
        [c, ...r].join(".")
      );
      if (!$ || v === void 0) return;
      A.mapWrappers.forEach((E) => {
        let C = !0, k = -1;
        if (E.meta?.transforms && E.meta.transforms.length > 0) {
          for (const F of E.meta.transforms)
            if (F.type === "filter" && !F.fn(v, -1)) {
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
              N.push({ key: $, value: v }), N.sort((z, ie) => Y.fn(z.value, ie.value)), k = N.findIndex(
                (z) => z.key === $
              );
            } else
              k = F.length;
          }
        } else
          C = !0, k = b.length - 1;
        if (C && E.containerRef && E.containerRef.isConnected) {
          const F = document.createElement("div");
          F.setAttribute("data-item-path", $);
          const Y = Array.from(E.containerRef.children);
          k >= 0 && k < Y.length ? E.containerRef.insertBefore(
            F,
            Y[k]
          ) : E.containerRef.appendChild(F);
          const N = Ce(F), z = re(), ie = $.split(".").slice(1), fe = E.rebuildStateShape({
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
              localIndex: k,
              arraySetter: fe,
              rebuildStateShape: E.rebuildStateShape,
              renderFn: E.mapFn
            })
          );
        }
      });
    }
    if (a.updateType === "cut") {
      const b = r.slice(0, -1), $ = f.getShadowMetadata(c, b);
      $?.mapWrappers && $.mapWrappers.length > 0 && $.mapWrappers.forEach((v) => {
        if (v.containerRef && v.containerRef.isConnected) {
          const w = v.containerRef.querySelector(
            `[data-item-path="${g}"]`
          );
          w && w.remove();
        }
      });
    }
    a.updateType === "update" && (u || j.current?.validation?.key) && r && se(
      (u || j.current?.validation?.key) + "." + r.join(".")
    );
    const O = r.slice(0, r.length - 1);
    a.updateType === "cut" && j.current?.validation?.key && se(
      j.current?.validation?.key + "." + O.join(".")
    ), a.updateType === "insert" && j.current?.validation?.key && Le(
      j.current?.validation?.key + "." + O.join(".")
    ).filter(($) => {
      let v = $?.split(".").length;
      const w = "";
      if ($ == O.join(".") && v == O.length - 1) {
        let E = $ + "." + O;
        se($), he(E, w);
      }
    });
    const H = t.getState().getShadowValue(c), J = t.getState().getShadowMetadata(c, []), B = /* @__PURE__ */ new Set();
    if (console.log(
      "rootMeta",
      c,
      t.getState().shadowStateStore
    ), !J?.components)
      return H;
    if (a.updateType === "update") {
      let b = [...r];
      for (; ; ) {
        const $ = f.getShadowMetadata(c, b);
        if ($?.pathComponents && $.pathComponents.forEach((v) => {
          if (B.has(v))
            return;
          const w = J.components?.get(v);
          w && ((Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"]).includes("none") || (w.forceUpdate(), B.add(v)));
        }), b.length === 0)
          break;
        b.pop();
      }
      D && typeof D == "object" && !Te(D) && _ && typeof _ == "object" && !Te(_) && Pe(D, _).forEach((v) => {
        const w = v.split("."), E = [...r, ...w], C = f.getShadowMetadata(c, E);
        C?.pathComponents && C.pathComponents.forEach((k) => {
          if (B.has(k))
            return;
          const F = J.components?.get(k);
          F && ((Array.isArray(F.reactiveType) ? F.reactiveType : [F.reactiveType || "component"]).includes("none") || (F.forceUpdate(), B.add(k)));
        });
      });
    } else if (a.updateType === "insert" || a.updateType === "cut") {
      const b = a.updateType === "insert" ? r : r.slice(0, -1), $ = f.getShadowMetadata(c, b);
      if ($?.signals && $.signals.length > 0) {
        const v = [c, ...b].join("."), w = f.getShadowValue(v);
        $.signals.forEach(({ parentId: E, position: C, effect: k }) => {
          const F = document.querySelector(
            `[data-parent-id="${E}"]`
          );
          if (F) {
            const Y = Array.from(F.childNodes);
            if (Y[C]) {
              let N = w;
              if (k)
                try {
                  N = new Function(
                    "state",
                    `return (${k})(state)`
                  )(w);
                } catch (z) {
                  console.error("Error evaluating effect function:", z), N = w;
                }
              N != null && typeof N == "object" && (N = JSON.stringify(N)), Y[C].textContent = String(N ?? "");
            }
          }
        });
      }
      $?.pathComponents && $.pathComponents.forEach((v) => {
        if (!B.has(v)) {
          const w = J.components?.get(v);
          w && (w.forceUpdate(), B.add(v));
        }
      });
    }
    return J.components.forEach((b, $) => {
      if (B.has($))
        return;
      const v = Array.isArray(b.reactiveType) ? b.reactiveType : [b.reactiveType || "component"];
      if (v.includes("all")) {
        b.forceUpdate(), B.add($);
        return;
      }
      if (v.includes("deps") && b.depsFunction) {
        const w = f.getShadowValue(c), E = b.depsFunction(w);
        let C = !1;
        E === !0 ? C = !0 : Array.isArray(E) && (le(b.prevDeps, E) || (b.prevDeps = E, C = !0)), C && (b.forceUpdate(), B.add($));
      }
    }), B.clear(), We(c, (b) => {
      const $ = [...b ?? [], R], v = /* @__PURE__ */ new Map();
      return $.forEach((w) => {
        const E = `${w.stateKey}:${JSON.stringify(w.path)}`, C = v.get(E);
        C ? (C.timeStamp = Math.max(C.timeStamp, w.timeStamp), C.newValue = w.newValue, C.oldValue = C.oldValue ?? w.oldValue, C.updateType = w.updateType) : v.set(E, { ...w });
      }), Array.from(v.values());
    }), xe(
      D,
      c,
      j.current,
      T
    ), j.current?.middleware && j.current.middleware({
      updateLog: x,
      update: R
    }), H;
  };
  t.getState().initialStateGlobal[c] || _e(c, e);
  const X = Se(() => $e(
    c,
    te,
    G.current,
    T
  ), [c, T]), s = j.current?.cogsSync;
  return s && (Q.current = s(X)), X;
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
  let p = h.map((M) => ({
    key: M,
    value: t.getState().getShadowValue(M)
  }));
  for (const M of m)
    M.type === "filter" ? p = p.filter(
      ({ value: V }, l) => M.fn(V, l)
    ) : M.type === "sort" && p.sort((V, l) => M.fn(V.value, l.value));
  return p.map(({ key: M }) => M);
}, be = (e, o, m) => {
  const h = `${e}////${o}`, { addPathComponent: p, getShadowMetadata: M } = t.getState(), l = M(e, [])?.components?.get(h);
  !l || l.reactiveType === "none" || !(Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType]).includes("component") || p(e, m, h);
}, pe = (e, o, m) => {
  const h = t.getState(), p = h.getShadowMetadata(e, []), M = /* @__PURE__ */ new Set();
  p?.components && p.components.forEach((l, d) => {
    (Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType || "component"]).includes("all") && (l.forceUpdate(), M.add(d));
  }), h.getShadowMetadata(e, [...o, "getSelected"])?.pathComponents?.forEach((l) => {
    p?.components?.get(l)?.forceUpdate();
  });
  const V = h.getShadowMetadata(e, o);
  for (let l of V?.arrayKeys || []) {
    const d = l + ".selected", P = h.getShadowMetadata(
      e,
      d.split(".").slice(1)
    );
    l == m && P?.pathComponents?.forEach((I) => {
      p?.components?.get(I)?.forceUpdate();
    });
  }
};
function $e(e, o, m, h) {
  const p = /* @__PURE__ */ new Map();
  let M = 0;
  const V = (I) => {
    const i = I.join(".");
    for (const [S] of p)
      (S === i || S.startsWith(i + ".")) && p.delete(S);
    M++;
  };
  function l({
    currentState: I,
    path: i = [],
    meta: S,
    componentId: T
  }) {
    const W = i.map(String).join("."), c = [e, ...i].join(".");
    I = t.getState().getShadowValue(c, S?.validIds);
    const x = function() {
      return t().getShadowValue(e, i);
    }, Z = {
      apply(j, y, Q) {
      },
      get(j, y) {
        if (y === "_rebuildStateShape")
          return l;
        if (Object.getOwnPropertyNames(d).includes(y) && i.length === 0)
          return d[y];
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
              const u = await n.action(r);
              if (u && !u.success && u.errors && a && (t.getState().removeValidationError(a), u.errors.forEach((g) => {
                const f = [a, ...g.path].join(".");
                t.getState().addValidationError(f, g.message);
              }), ce(e)), u?.success) {
                const g = t.getState().getShadowMetadata(e, []);
                t.getState().setShadowMetadata(e, [], {
                  ...g,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: r
                  // Update base server state
                }), n.onSuccess && n.onSuccess(u.data);
              } else !u?.success && n.onError && n.onError(u.error);
              return u;
            } catch (u) {
              return n.onError && n.onError(u), { success: !1, error: u };
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
              if (S?.validIds && !S.validIds.includes(r))
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
              S?.validIds
            );
          if (y === "clearSelected")
            return pe(e, i), () => {
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
                scrollStickTolerance: u = 75
              } = s, g = q(null), [f, A] = ee({
                startIndex: 0,
                endIndex: 10
              }), [_, D] = ee({}), U = q(!0), R = q({
                isUserScrolling: !1,
                lastScrollTop: 0,
                scrollUpCount: 0,
                isNearBottom: !0
              }), L = q(
                /* @__PURE__ */ new Map()
              );
              ge(() => {
                if (!a || !g.current || R.current.isUserScrolling)
                  return;
                const v = g.current;
                v.scrollTo({
                  top: v.scrollHeight,
                  behavior: U.current ? "instant" : "smooth"
                });
              }, [_, a]);
              const O = t.getState().getShadowMetadata(e, i)?.arrayKeys || [], { totalHeight: H, itemOffsets: J } = Se(() => {
                let v = 0;
                const w = /* @__PURE__ */ new Map();
                return (t.getState().getShadowMetadata(e, i)?.arrayKeys || []).forEach((C) => {
                  const k = C.split(".").slice(1), F = t.getState().getShadowMetadata(e, k)?.virtualizer?.itemHeight || n;
                  w.set(C, {
                    height: F,
                    offset: v
                  }), v += F;
                }), L.current = w, { totalHeight: v, itemOffsets: w };
              }, [O.length, n]);
              ge(() => {
                if (a && O.length > 0 && g.current && !R.current.isUserScrolling && U.current) {
                  const v = g.current, w = () => {
                    if (v.clientHeight > 0) {
                      const E = Math.ceil(
                        v.clientHeight / n
                      ), C = O.length - 1, k = Math.max(
                        0,
                        C - E - r
                      );
                      A({ startIndex: k, endIndex: C }), requestAnimationFrame(() => {
                        b("instant"), U.current = !1;
                      });
                    } else
                      requestAnimationFrame(w);
                  };
                  w();
                }
              }, [O.length, a, n, r]);
              const B = ue(() => {
                const v = g.current;
                if (!v) return;
                const w = v.scrollTop, { scrollHeight: E, clientHeight: C } = v, k = R.current, F = E - (w + C), Y = k.isNearBottom;
                k.isNearBottom = F <= u, w < k.lastScrollTop ? (k.scrollUpCount++, k.scrollUpCount > 3 && Y && (k.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : k.isNearBottom && (k.isUserScrolling = !1, k.scrollUpCount = 0), k.lastScrollTop = w;
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
                  A({
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
                u
              ]);
              K(() => {
                const v = g.current;
                if (!(!v || !a))
                  return v.addEventListener("scroll", B, {
                    passive: !0
                  }), () => {
                    v.removeEventListener("scroll", B);
                  };
              }, [B, a]);
              const b = ue(
                (v = "smooth") => {
                  const w = g.current;
                  if (!w) return;
                  R.current.isUserScrolling = !1, R.current.isNearBottom = !0, R.current.scrollUpCount = 0;
                  const E = () => {
                    const C = (k = 0) => {
                      if (k > 5) return;
                      const F = w.scrollHeight, Y = w.scrollTop, N = w.clientHeight;
                      Y + N >= F - 1 || (w.scrollTo({
                        top: F,
                        behavior: v
                      }), setTimeout(() => {
                        const z = w.scrollHeight, ie = w.scrollTop;
                        (z !== F || ie + N < z - 1) && C(k + 1);
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
              return K(() => {
                if (!a || !g.current) return;
                const v = g.current, w = R.current;
                let E;
                const C = () => {
                  clearTimeout(E), E = setTimeout(() => {
                    !w.isUserScrolling && w.isNearBottom && b(
                      U.current ? "instant" : "smooth"
                    );
                  }, 100);
                }, k = new MutationObserver(() => {
                  w.isUserScrolling || C();
                });
                k.observe(v, {
                  childList: !0,
                  subtree: !0,
                  attributes: !0,
                  attributeFilter: ["style", "class"]
                  // More specific than just 'height'
                });
                const F = (Y) => {
                  Y.target instanceof HTMLImageElement && !w.isUserScrolling && C();
                };
                return v.addEventListener("load", F, !0), U.current ? setTimeout(() => {
                  b("instant");
                }, 0) : C(), () => {
                  clearTimeout(E), k.disconnect(), v.removeEventListener("load", F, !0);
                };
              }, [a, O.length, b]), {
                virtualState: Se(() => {
                  const v = t.getState(), w = v.getShadowValue(
                    [e, ...i].join(".")
                  ), E = v.getShadowMetadata(e, i)?.arrayKeys || [], C = w.slice(
                    f.startIndex,
                    f.endIndex + 1
                  ), k = E.slice(
                    f.startIndex,
                    f.endIndex + 1
                  );
                  return l({
                    currentState: C,
                    path: i,
                    componentId: T,
                    meta: { ...S, validIds: k }
                  });
                }, [f.startIndex, f.endIndex, O.length]),
                virtualizerProps: {
                  outer: {
                    ref: g,
                    style: {
                      overflowY: "auto",
                      height: "100%",
                      position: "relative"
                    }
                  },
                  inner: {
                    style: {
                      height: `${H}px`,
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
                scrollToIndex: (v, w = "smooth") => {
                  if (g.current && O[v]) {
                    const E = L.current.get(O[v])?.offset || 0;
                    g.current.scrollTo({ top: E, behavior: w });
                  }
                }
              };
            };
          if (y === "stateMap")
            return (s) => {
              const [n, r] = ee(
                S?.validIds ?? t.getState().getShadowMetadata(e, i)?.arrayKeys
              ), a = t.getState().getShadowValue(c, S?.validIds);
              if (!n)
                throw new Error("No array keys found for mapping");
              const u = l({
                currentState: a,
                path: i,
                componentId: T,
                meta: S
              });
              return a.map((g, f) => {
                const A = n[f]?.split(".").slice(1), _ = l({
                  currentState: g,
                  path: A,
                  componentId: T,
                  meta: S
                });
                return s(
                  _,
                  f,
                  u
                );
              });
            };
          if (y === "$stateMap")
            return (s) => de(qe, {
              proxy: {
                _stateKey: e,
                _path: i,
                _mapFn: s,
                _meta: S
              },
              rebuildStateShape: l
            });
          if (y === "stateFind")
            return (s) => {
              const n = S?.validIds ?? t.getState().getShadowMetadata(e, i)?.arrayKeys;
              if (n)
                for (let r = 0; r < n.length; r++) {
                  const a = n[r];
                  if (!a) continue;
                  const u = t.getState().getShadowValue(a);
                  if (s(u, r)) {
                    const g = a.split(".").slice(1);
                    return l({
                      currentState: u,
                      path: g,
                      componentId: T,
                      meta: S
                      // Pass along meta for potential further chaining
                    });
                  }
                }
            };
          if (y === "stateFilter")
            return (s) => {
              const n = S?.validIds ?? t.getState().getShadowMetadata(e, i)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for filtering.");
              const r = [], a = I.filter(
                (u, g) => s(u, g) ? (r.push(n[g]), !0) : !1
              );
              return l({
                currentState: a,
                path: i,
                componentId: T,
                meta: {
                  validIds: r,
                  transforms: [
                    ...S?.transforms || [],
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
              const n = S?.validIds ?? t.getState().getShadowMetadata(e, i)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for sorting");
              const r = I.map((a, u) => ({
                item: a,
                key: n[u]
              }));
              return r.sort((a, u) => s(a.item, u.item)).filter(Boolean), l({
                currentState: r.map((a) => a.item),
                path: i,
                componentId: T,
                meta: {
                  validIds: r.map((a) => a.key),
                  transforms: [
                    ...S?.transforms || [],
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
                store: u,
                onFlush: g
              } = s;
              let f = [], A = !1, _ = null;
              const D = (H) => {
                if (!A) {
                  if (a === "sliding" && f.length >= n)
                    f.shift();
                  else if (a === "dropping" && f.length >= n)
                    return;
                  f.push(H), f.length >= n && U();
                }
              }, U = () => {
                if (f.length === 0) return;
                const H = [...f];
                if (f = [], u) {
                  const J = u(H);
                  J !== void 0 && (Array.isArray(J) ? J : [J]).forEach((b) => {
                    o(b, i, {
                      updateType: "insert"
                    });
                  });
                } else
                  H.forEach((J) => {
                    o(J, i, {
                      updateType: "insert"
                    });
                  });
                g?.(H);
              };
              r > 0 && (_ = setInterval(U, r));
              const R = re(), L = t.getState().getShadowMetadata(e, i) || {}, O = L.streams || /* @__PURE__ */ new Map();
              return O.set(R, { buffer: f, flushTimer: _ }), t.getState().setShadowMetadata(e, i, {
                ...L,
                streams: O
              }), {
                write: (H) => D(H),
                writeMany: (H) => H.forEach(D),
                flush: () => U(),
                pause: () => {
                  A = !0;
                },
                resume: () => {
                  A = !1, f.length > 0 && U();
                },
                close: () => {
                  U(), _ && clearInterval(_);
                  const H = t.getState().getShadowMetadata(e, i);
                  H?.streams && H.streams.delete(R);
                }
              };
            };
          if (y === "stateList")
            return (s) => /* @__PURE__ */ oe(() => {
              const r = q(/* @__PURE__ */ new Map()), a = S?.transforms && S.transforms.length > 0 ? `${T}-${ze(S.transforms)}` : `${T}-base`, [u, g] = ee({}), { validIds: f, arrayValues: A } = Se(() => {
                const D = t.getState().getShadowMetadata(e, i)?.transformCaches?.get(a);
                let U;
                D && D.validIds ? U = D.validIds : (U = Ie(
                  e,
                  i,
                  S?.transforms
                ), t.getState().setTransformCache(e, i, a, {
                  validIds: U,
                  computedAt: Date.now(),
                  transforms: S?.transforms || []
                }));
                const R = t.getState().getShadowValue(c, U);
                return {
                  validIds: U,
                  arrayValues: R || []
                };
              }, [a, u]);
              if (console.log("freshValues", f, A), K(() => {
                const D = t.getState().subscribeToPath(c, (U) => {
                  if (U.type === "GET_SELECTED")
                    return;
                  const L = t.getState().getShadowMetadata(e, i)?.transformCaches;
                  if (L)
                    for (const O of L.keys())
                      O.startsWith(T) && L.delete(O);
                  (U.type === "INSERT" || U.type === "REMOVE" || U.type === "CLEAR_SELECTION") && g({});
                });
                return () => {
                  D();
                };
              }, [T, c]), !Array.isArray(A))
                return null;
              const _ = l({
                currentState: A,
                path: i,
                componentId: T,
                meta: {
                  ...S,
                  validIds: f
                }
              });
              return console.log("sssssssssssssssssssssssssssss", _), /* @__PURE__ */ oe(ke, { children: A.map((D, U) => {
                const R = f[U];
                if (!R)
                  return null;
                let L = r.current.get(R);
                L || (L = re(), r.current.set(R, L));
                const O = R.split(".").slice(1);
                return de(Me, {
                  key: R,
                  stateKey: e,
                  itemComponentId: L,
                  itemPath: O,
                  localIndex: U,
                  arraySetter: _,
                  rebuildStateShape: l,
                  renderFn: s
                });
              }) });
            }, {});
          if (y === "stateFlattenOn")
            return (s) => {
              const n = I;
              p.clear(), M++;
              const r = n.flatMap(
                (a) => a[s] ?? []
              );
              return l({
                currentState: r,
                path: [...i, "[*]", s],
                componentId: T,
                meta: S
              });
            };
          if (y === "index")
            return (s) => {
              const r = t.getState().getShadowMetadata(e, i)?.arrayKeys?.filter(
                (g) => !S?.validIds || S?.validIds && S?.validIds?.includes(g)
              )?.[s];
              if (!r) return;
              const a = t.getState().getShadowValue(r, S?.validIds);
              return l({
                currentState: a,
                path: r.split(".").slice(1),
                componentId: T,
                meta: S
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
                meta: S
              });
            };
          if (y === "insert")
            return (s, n) => (o(s, i, { updateType: "insert" }), l({
              currentState: t.getState().getShadowValue(e, i),
              path: i,
              componentId: T,
              meta: S
            }));
          if (y === "uniqueInsert")
            return (s, n, r) => {
              const a = t.getState().getShadowValue(e, i), u = ae(s) ? s(a) : s;
              let g = null;
              if (!a.some((A) => {
                const _ = n ? n.every(
                  (D) => le(A[D], u[D])
                ) : le(A, u);
                return _ && (g = A), _;
              }))
                V(i), o(u, i, { updateType: "insert" });
              else if (r && g) {
                const A = r(g), _ = a.map(
                  (D) => le(D, g) ? A : D
                );
                V(i), o(_, i, {
                  updateType: "update"
                });
              }
            };
          if (y === "cut")
            return (s, n) => {
              const r = S?.validIds ?? t.getState().getShadowMetadata(e, i)?.arrayKeys;
              if (!r || r.length === 0) return;
              const a = s == -1 ? r.length - 1 : s !== void 0 ? s : r.length - 1, u = r[a];
              if (!u) return;
              const g = u.split(".").slice(1);
              o(I, g, {
                updateType: "cut"
              });
            };
          if (y === "cutSelected")
            return () => {
              t.getState().getShadowMetadata(e, i)?.arrayKeys;
              const s = Ie(
                e,
                i,
                S?.transforms
              );
              if (console.log("validKeys", s), !s || s.length === 0) return;
              const n = t.getState().selectedIndicesMap.get(c);
              let r = s.findIndex(
                (u) => u === n
              );
              console.log("indexToCut", r);
              const a = s[r == -1 ? s.length - 1 : r]?.split(".").slice(1);
              console.log("pathForCut", a), o(I, a, {
                updateType: "cut"
              });
            };
          if (y === "cutByValue")
            return (s) => {
              const n = t.getState().getShadowMetadata(e, i), r = S?.validIds ?? n?.arrayKeys;
              if (!r) return;
              let a = null;
              for (const u of r)
                if (t.getState().getShadowValue(u) === s) {
                  a = u;
                  break;
                }
              if (a) {
                const u = a.split(".").slice(1);
                o(null, u, { updateType: "cut" });
              }
            };
          if (y === "toggleByValue")
            return (s) => {
              const n = t.getState().getShadowMetadata(e, i), r = S?.validIds ?? n?.arrayKeys;
              if (!r) return;
              let a = null;
              for (const u of r) {
                const g = t.getState().getShadowValue(u);
                if (console.log("itemValue sdasdasdasd", g), g === s) {
                  a = u;
                  break;
                }
              }
              if (console.log("itemValue keyToCut", a), a) {
                const u = a.split(".").slice(1);
                console.log("itemValue keyToCut", a), o(s, u, {
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
              let a = null, u = [];
              for (const g of r) {
                let f = t.getState().getShadowValue(g, S?.validIds);
                if (f && f[s] === n) {
                  a = f, u = g.split(".").slice(1);
                  break;
                }
              }
              return l({
                currentState: a,
                path: u,
                componentId: T,
                meta: S
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
          return () => (be(e, T, i), t.getState().getShadowValue(c, S?.validIds));
        if (y === "getState")
          return () => t.getState().getShadowValue(c, S?.validIds);
        if (y === "$derive")
          return (s) => Ae({
            _stateKey: e,
            _path: i,
            _effect: s.toString(),
            _meta: S
          });
        if (y === "$get")
          return () => Ae({ _stateKey: e, _path: i, _meta: S });
        if (y === "lastSynced") {
          const s = `${e}:${i.join(".")}`;
          return t.getState().getSyncInfo(s);
        }
        if (y == "getLocalStorage")
          return (s) => me(h + "-" + e + "-" + s);
        if (y === "isSelected") {
          const s = [e, ...i].slice(0, -1);
          if (pe(e, i, void 0), Array.isArray(
            t.getState().getShadowValue(s.join("."), S?.validIds)
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
            pe(e, n, void 0), t.getState().selectedIndicesMap.get(r), s && t.getState().setSelectedIndex(r, a);
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
              const a = (g) => !g || g === "/" ? [] : g.split("/").slice(1).map((f) => f.replace(/~1/g, "/").replace(/~0/g, "~")), u = /* @__PURE__ */ new Set();
              for (const g of s) {
                const f = a(g.path);
                switch (g.op) {
                  case "add":
                  case "replace": {
                    const { value: A } = g;
                    n.updateShadowAtPath(e, f, A), n.markAsDirty(e, f, { bubble: !0 });
                    let _ = [...f];
                    for (; ; ) {
                      const D = n.getShadowMetadata(
                        e,
                        _
                      );
                      if (console.log("pathMeta", D), D?.pathComponents && D.pathComponents.forEach((U) => {
                        if (!u.has(U)) {
                          const R = r.components?.get(U);
                          R && (R.forceUpdate(), u.add(U));
                        }
                      }), _.length === 0) break;
                      _.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const A = f.slice(0, -1);
                    n.removeShadowArrayElement(e, f), n.markAsDirty(e, A, { bubble: !0 });
                    let _ = [...A];
                    for (; ; ) {
                      const D = n.getShadowMetadata(
                        e,
                        _
                      );
                      if (D?.pathComponents && D.pathComponents.forEach((U) => {
                        if (!u.has(U)) {
                          const R = r.components?.get(U);
                          R && (R.forceUpdate(), u.add(U));
                        }
                      }), _.length === 0) break;
                      _.pop();
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
              return a.success ? !0 : ("issues" in a.error ? a.error.issues.forEach((u) => {
                const g = [s.key, ...u.path].join(".");
                he(g, u.message);
              }) : a.error.errors.forEach((u) => {
                const g = [s.key, ...u.path].join(".");
                he(g, u.message);
              }), ce(e), !1);
            };
          if (y === "getComponents")
            return () => t.getState().getShadowMetadata(e, [])?.components;
          if (y === "getAllFormRefs")
            return () => ve.getState().getFormRefsByStateKey(e);
        }
        if (y === "getFormRef")
          return () => ve.getState().getFormRef(e + "." + i.join("."));
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
        const te = [...i, y], X = t.getState().getShadowValue(e, te);
        return l({
          currentState: X,
          path: te,
          componentId: T,
          meta: S
        });
      }
    }, G = new Proxy(x, Z);
    return p.set(W, {
      proxy: G,
      stateVersion: M
    }), G;
  }
  const d = {
    removeValidation: (I) => {
      I?.validationKey && se(I.validationKey);
    },
    revertToInitialState: (I) => {
      const i = t.getState().getInitialOptions(e)?.validation;
      i?.key && se(i.key), I?.validationKey && se(I.validationKey);
      const S = t.getState().getShadowMetadata(e, []);
      S?.stateSource === "server" && S.baseServerState ? S.baseServerState : t.getState().initialStateGlobal[e];
      const T = t.getState().initialStateGlobal[e];
      t.getState().clearSelectedIndexesForState(e), p.clear(), M++, t.getState().initializeShadowState(e, T), l({
        currentState: T,
        path: [],
        componentId: m
      });
      const W = ne(e), c = ae(W?.localStorage?.key) ? W?.localStorage?.key(T) : W?.localStorage?.key, x = `${h}-${e}-${c}`;
      x && localStorage.removeItem(x);
      const Z = t.getState().getShadowMetadata(e, []);
      return Z && Z?.components?.forEach((G) => {
        G.forceUpdate();
      }), T;
    },
    updateInitialState: (I) => {
      p.clear(), M++;
      const i = $e(
        e,
        o,
        m,
        h
      ), S = t.getState().initialStateGlobal[e], T = ne(e), W = ae(T?.localStorage?.key) ? T?.localStorage?.key(S) : T?.localStorage?.key, c = `${h}-${e}-${W}`;
      return localStorage.getItem(c) && localStorage.removeItem(c), je(() => {
        _e(e, I), t.getState().initializeShadowState(e, I);
        const x = t.getState().getShadowMetadata(e, []);
        x && x?.components?.forEach((Z) => {
          Z.forceUpdate();
        });
      }), {
        fetchId: (x) => i.get()[x]
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
  const m = q(null), h = q(`map-${crypto.randomUUID()}`), p = q(!1), M = q(/* @__PURE__ */ new Map());
  K(() => {
    const l = m.current;
    if (!l || p.current) return;
    const d = setTimeout(() => {
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
      }), p.current = !0, V();
    }, 0);
    return () => {
      if (clearTimeout(d), h.current) {
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
    const d = t.getState().getShadowValue(
      [e._stateKey, ...e._path].join("."),
      e._meta?.validIds
    );
    if (!Array.isArray(d)) return;
    const P = e._meta?.validIds ?? t.getState().getShadowMetadata(e._stateKey, e._path)?.arrayKeys ?? [], I = o({
      currentState: d,
      path: e._path,
      componentId: h.current,
      meta: e._meta
    });
    d.forEach((i, S) => {
      const T = P[S];
      if (!T) return;
      const W = re(), c = document.createElement("div");
      c.setAttribute("data-item-path", T), l.appendChild(c);
      const x = Ce(c);
      M.current.set(T, x);
      const Z = T.split(".").slice(1);
      x.render(
        de(Me, {
          stateKey: e._stateKey,
          itemComponentId: W,
          itemPath: Z,
          localIndex: S,
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
  const o = q(null), m = q(null), h = q(!1), p = `${e._stateKey}-${e._path.join(".")}`, M = t.getState().getShadowValue(
    [e._stateKey, ...e._path].join("."),
    e._meta?.validIds
  );
  return K(() => {
    const V = o.current;
    if (!V || h.current) return;
    const l = setTimeout(() => {
      if (!V.parentElement) {
        console.warn("Parent element not found for signal", p);
        return;
      }
      const d = V.parentElement, I = Array.from(d.childNodes).indexOf(V);
      let i = d.getAttribute("data-parent-id");
      i || (i = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", i)), m.current = `instance-${crypto.randomUUID()}`;
      const S = t.getState().getShadowMetadata(e._stateKey, e._path) || {}, T = S.signals || [];
      T.push({
        instanceId: m.current,
        parentId: i,
        position: I,
        effect: e._effect
      }), t.getState().setShadowMetadata(e._stateKey, e._path, {
        ...S,
        signals: T
      });
      let W = M;
      if (e._effect)
        try {
          W = new Function(
            "state",
            `return (${e._effect})(state)`
          )(M);
        } catch (x) {
          console.error("Error evaluating effect function:", x);
        }
      W !== null && typeof W == "object" && (W = JSON.stringify(W));
      const c = document.createTextNode(String(W ?? ""));
      V.replaceWith(c), h.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(l), m.current) {
        const d = t.getState().getShadowMetadata(e._stateKey, e._path) || {};
        d.signals && (d.signals = d.signals.filter(
          (P) => P.instanceId !== m.current
        ), t.getState().setShadowMetadata(e._stateKey, e._path, d));
      }
    };
  }, []), de("span", {
    ref: o,
    style: { display: "contents" },
    "data-signal-id": p
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
    let p = 0;
    const M = () => {
      p++, p === h.length && m(!0);
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
  arraySetter: p,
  rebuildStateShape: M,
  renderFn: V
}) {
  const [, l] = ee({}), { ref: d, inView: P } = Ne(), I = q(null), i = Je(I), S = q(!1), T = [e, ...m].join(".");
  Ue(e, o, l);
  const W = ue(
    (j) => {
      I.current = j, d(j);
    },
    [d]
  );
  K(() => {
    t.getState().subscribeToPath(T, (j) => {
      l({});
    });
  }, []), K(() => {
    if (!P || !i || S.current)
      return;
    const j = I.current;
    if (j && j.offsetHeight > 0) {
      S.current = !0;
      const y = j.offsetHeight;
      t.getState().setShadowMetadata(e, m, {
        virtualizer: {
          itemHeight: y,
          domRef: j
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
  const c = [e, ...m].join("."), x = t.getState().getShadowValue(c);
  if (x === void 0)
    return null;
  const Z = M({
    currentState: x,
    path: m,
    componentId: o
  }), G = V(Z, h, p);
  return /* @__PURE__ */ oe("div", { ref: W, children: G });
}
function Ze({
  stateKey: e,
  path: o,
  rebuildStateShape: m,
  renderFn: h,
  formOpts: p,
  setState: M
}) {
  const [V] = ee(() => re()), [, l] = ee({}), d = [e, ...o].join(".");
  Ue(e, V, l);
  const P = t.getState().getShadowValue(d), [I, i] = ee(P), S = q(!1), T = q(null);
  K(() => {
    !S.current && !le(P, I) && i(P);
  }, [P]), K(() => {
    const G = t.getState().subscribeToPath(d, (j) => {
      !S.current && I !== j && l({});
    });
    return () => {
      G(), T.current && (clearTimeout(T.current), S.current = !1);
    };
  }, []);
  const W = ue(
    (G) => {
      i(G), S.current = !0, T.current && clearTimeout(T.current);
      const j = p?.debounceTime ?? 200;
      T.current = setTimeout(() => {
        if (S.current = !1, !(p?.sync?.allowInvalidValues ?? !1)) {
          M(G, o, { updateType: "update" });
          const { getInitialOptions: Q, getValidationErrors: te } = t.getState(), X = Q(e)?.validation?.key;
          if (X) {
            const s = X + "." + o.join(".");
            if (te(s).length > 0) {
              console.log("Validation failed, state updated but sync blocked");
              return;
            }
          }
        } else
          M(G, o, { updateType: "update" });
      }, j);
    },
    [
      M,
      o,
      p?.debounceTime,
      p?.sync?.allowInvalidValues,
      e
    ]
  ), c = ue(async () => {
    console.log("handleBlur triggered"), T.current && (clearTimeout(T.current), T.current = null, S.current = !1, M(I, o, { updateType: "update" }));
    const { getInitialOptions: G } = t.getState(), j = G(e)?.validation, y = j?.zodSchemaV4 || j?.zodSchemaV3;
    if (!y) return;
    const Q = t.getState().getShadowMetadata(e, o);
    t.getState().setShadowMetadata(e, o, {
      ...Q,
      validation: {
        status: "DIRTY",
        validatedValue: I
      }
    });
    const te = t.getState().getShadowValue(e), X = y.safeParse(te);
    if (console.log("result ", X), X.success)
      t.getState().setShadowMetadata(e, o, {
        ...Q,
        validation: {
          status: "VALID_PENDING_SYNC",
          validatedValue: I
        }
      });
    else {
      const s = "issues" in X.error ? X.error.issues : X.error.errors;
      console.log("All validation errors:", s), console.log("Current blur path:", o);
      const n = s.filter((r) => {
        if (console.log("Processing error:", r), o.some((u) => u.startsWith("id:"))) {
          console.log("Detected array path with ULID");
          const u = o[0].startsWith("id:") ? [] : o.slice(0, -1);
          console.log("Parent path:", u);
          const g = t.getState().getShadowMetadata(e, u);
          if (console.log("Array metadata:", g), g?.arrayKeys) {
            const f = [e, ...o.slice(0, -1)].join("."), A = g.arrayKeys.indexOf(f);
            console.log("Item key:", f, "Index:", A);
            const _ = [...u, A, ...o.slice(-1)], D = JSON.stringify(r.path) === JSON.stringify(_);
            return console.log("Zod path comparison:", {
              zodPath: _,
              errorPath: r.path,
              match: D
            }), D;
          }
        }
        const a = JSON.stringify(r.path) === JSON.stringify(o);
        return console.log("Direct path comparison:", {
          errorPath: r.path,
          currentPath: o,
          match: a
        }), a;
      });
      console.log("Filtered path errors:", n), t.getState().setShadowMetadata(e, o, {
        ...Q,
        validation: {
          status: "VALIDATION_FAILED",
          message: n[0]?.message,
          validatedValue: I
        }
      });
    }
    ce(e);
  }, [e, o, I, M]), x = m({
    currentState: P,
    path: o,
    componentId: V
  }), Z = new Proxy(x, {
    get(G, j) {
      return j === "inputProps" ? {
        value: I ?? "",
        onChange: (y) => {
          W(y.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: c,
        ref: ve.getState().getFormRef(e + "." + o.join("."))
      } : G[j];
    }
  });
  return /* @__PURE__ */ oe(ke, { children: h(Z) });
}
function Ue(e, o, m) {
  const h = `${e}////${o}`;
  ge(() => {
    const { registerComponent: p, unregisterComponent: M } = t.getState();
    return p(e, h, {
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
