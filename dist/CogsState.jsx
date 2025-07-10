"use client";
import { jsx as ae, Fragment as ke } from "react/jsx-runtime";
import { memo as Re, useState as Z, useRef as q, useCallback as ce, useEffect as Y, useLayoutEffect as ue, useMemo as de, createElement as le, startTransition as je } from "react";
import { createRoot as Ce } from "react-dom/client";
import { transformStateFunc as Fe, isFunction as K, isArray as Te, getDifferences as Ae, isDeepEqual as ie } from "./utility.js";
import { ValidationWrapper as Me } from "./Functions.jsx";
import De from "superjson";
import { v4 as ee } from "uuid";
import "zod";
import { getGlobalStore as t, formRefStore as ye } from "./store.js";
import { useCogsConfig as $e } from "./CogsStateClient.jsx";
import { applyPatch as Le } from "fast-json-patch";
import { useInView as Oe } from "react-intersection-observer";
function me(e, s) {
  const p = t.getState().getInitialOptions, g = t.getState().setInitialStateOptions, v = p(e) || {};
  g(e, {
    ...v,
    ...s
  });
}
function Ve({
  stateKey: e,
  options: s,
  initialOptionsPart: p
}) {
  const g = te(e) || {}, v = p[e] || {}, h = t.getState().setInitialStateOptions, V = { ...v, ...g };
  let u = !1;
  if (s)
    for (const l in s)
      V.hasOwnProperty(l) ? (l == "localStorage" && s[l] && V[l].key !== s[l]?.key && (u = !0, V[l] = s[l]), l == "defaultState" && s[l] && V[l] !== s[l] && !ie(V[l], s[l]) && (u = !0, V[l] = s[l])) : (u = !0, V[l] = s[l]);
  u && h(e, V);
}
function lt(e, { formElements: s, validation: p }) {
  return { initialState: e, formElements: s, validation: p };
}
const ut = (e, s) => {
  let p = e;
  const [g, v] = Fe(p);
  Object.keys(g).forEach((u) => {
    let l = v[u] || {};
    const E = {
      ...l
    };
    if (s?.formElements && (E.formElements = {
      ...s.formElements,
      ...l.formElements || {}
    }), s?.validation && (E.validation = {
      ...s.validation,
      ...l.validation || {}
    }, s.validation.key && !l.validation?.key && (E.validation.key = `${s.validation.key}.${u}`)), Object.keys(E).length > 0) {
      const T = te(u);
      T ? t.getState().setInitialStateOptions(u, {
        ...T,
        ...E
      }) : t.getState().setInitialStateOptions(u, E);
    }
  }), Object.keys(g).forEach((u) => {
    t.getState().initializeShadowState(u, g[u]);
  });
  const h = (u, l) => {
    const [E] = Z(l?.componentId ?? ee());
    Ve({
      stateKey: u,
      options: l,
      initialOptionsPart: v
    });
    const T = t.getState().getShadowValue(u) || g[u], o = l?.modifyState ? l.modifyState(T) : T;
    return Be(o, {
      stateKey: u,
      syncUpdate: l?.syncUpdate,
      componentId: E,
      localStorage: l?.localStorage,
      middleware: l?.middleware,
      reactiveType: l?.reactiveType,
      reactiveDeps: l?.reactiveDeps,
      defaultState: l?.defaultState,
      dependencies: l?.dependencies,
      serverState: l?.serverState
    });
  };
  function V(u, l) {
    Ve({ stateKey: u, options: l, initialOptionsPart: v }), l.localStorage && xe(u, l), re(u);
  }
  return { useCogsState: h, setCogsOptions: V };
}, {
  getInitialOptions: te,
  getValidationErrors: Ne,
  setStateLog: We,
  updateInitialStateGlobal: _e,
  addValidationError: pe,
  removeValidationError: ne
} = t.getState(), He = (e, s, p, g, v) => {
  p?.log && console.log(
    "saving to localstorage",
    s,
    p.localStorage?.key,
    g
  );
  const h = K(p?.localStorage?.key) ? p.localStorage?.key(e) : p?.localStorage?.key;
  if (h && g) {
    const V = `${g}-${s}-${h}`;
    let u;
    try {
      u = fe(V)?.lastSyncedWithServer;
    } catch {
    }
    const l = t.getState().getShadowMetadata(s, []), E = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: u,
      stateSource: l?.stateSource,
      baseServerState: l?.baseServerState
    }, T = De.serialize(E);
    window.localStorage.setItem(
      V,
      JSON.stringify(T.json)
    );
  }
}, fe = (e) => {
  if (!e) return null;
  try {
    const s = window.localStorage.getItem(e);
    return s ? JSON.parse(s) : null;
  } catch (s) {
    return console.error("Error loading from localStorage:", s), null;
  }
}, xe = (e, s) => {
  const p = t.getState().getShadowValue(e), { sessionId: g } = $e(), v = K(s?.localStorage?.key) ? s.localStorage.key(p) : s?.localStorage?.key;
  if (v && g) {
    const h = fe(
      `${g}-${e}-${v}`
    );
    if (h && h.lastUpdated > (h.lastSyncedWithServer || 0))
      return re(e), !0;
  }
  return !1;
}, re = (e) => {
  const s = t.getState().getShadowMetadata(e, []);
  if (!s) return;
  const p = /* @__PURE__ */ new Set();
  s?.components?.forEach((g) => {
    (g ? Array.isArray(g.reactiveType) ? g.reactiveType : [g.reactiveType || "component"] : null)?.includes("none") || p.add(() => g.forceUpdate());
  }), queueMicrotask(() => {
    p.forEach((g) => g());
  });
}, dt = (e, s) => {
  const p = t.getState().getShadowMetadata(e, []);
  if (p) {
    const g = `${e}////${s}`, v = p?.components?.get(g);
    if ((v ? Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"] : null)?.includes("none"))
      return;
    v && v.forceUpdate();
  }
};
function Be(e, {
  stateKey: s,
  serverSync: p,
  localStorage: g,
  formElements: v,
  reactiveDeps: h,
  reactiveType: V,
  componentId: u,
  defaultState: l,
  syncUpdate: E,
  dependencies: T,
  serverState: o
} = {}) {
  const [S, M] = Z({}), { sessionId: L } = $e();
  let N = !s;
  const [c] = Z(s ?? ee()), J = t.getState().stateLog[c], G = q(/* @__PURE__ */ new Set()), H = q(u ?? ee()), f = q(
    null
  );
  f.current = te(c) ?? null, Y(() => {
    if (E && E.stateKey === c && E.path?.[0]) {
      const a = `${E.stateKey}:${E.path.join(".")}`;
      t.getState().setSyncInfo(a, {
        timeStamp: E.timeStamp,
        userId: E.userId
      });
    }
  }, [E]);
  const oe = ce(
    (a) => {
      const r = a ? { ...te(c), ...a } : te(c), i = r?.defaultState || l || e;
      if (r?.serverState?.status === "success" && r?.serverState?.data !== void 0)
        return {
          value: r.serverState.data,
          source: "server",
          timestamp: r.serverState.timestamp || Date.now()
        };
      if (r?.localStorage?.key && L) {
        const d = K(r.localStorage.key) ? r.localStorage.key(i) : r.localStorage.key, I = fe(
          `${L}-${c}-${d}`
        );
        if (I && I.lastUpdated > (r?.serverState?.timestamp || 0))
          return {
            value: I.state,
            source: "localStorage",
            timestamp: I.lastUpdated
          };
      }
      return {
        value: i || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [c, l, e, L]
  );
  Y(() => {
    t.getState().setServerStateUpdate(c, o);
  }, [o, c]), Y(() => t.getState().subscribeToPath(c, (n) => {
    if (n?.type === "SERVER_STATE_UPDATE") {
      const r = n.serverState;
      if (r?.status === "success" && r.data !== void 0) {
        me(c, { serverState: r });
        const m = typeof r.merge == "object" ? r.merge : r.merge === !0 ? {} : null, d = t.getState().getShadowValue(c), I = r.data;
        if (m && Array.isArray(d) && Array.isArray(I)) {
          const U = m.key || "id", x = new Set(
            d.map((R) => R[U])
          ), _ = I.filter((R) => !x.has(R[U]));
          if (console.log("newUniqueItems", _), _.length > 0)
            _.forEach((R) => {
              t.getState().insertShadowArrayElement(c, [], R);
            });
          else
            return;
        } else
          t.getState().initializeShadowState(c, I);
        const P = t.getState().getShadowMetadata(c, []);
        t.getState().setShadowMetadata(c, [], {
          ...P,
          stateSource: "server",
          lastServerSync: r.timestamp || Date.now(),
          isDirty: !1
        });
      }
    }
  }), [c, oe]), Y(() => {
    const a = t.getState().getShadowMetadata(c, []);
    if (a && a.stateSource)
      return;
    const n = te(c);
    if (n?.defaultState !== void 0 || l !== void 0) {
      const r = n?.defaultState || l;
      n?.defaultState || me(c, {
        defaultState: r
      });
      const { value: i, source: m, timestamp: d } = oe();
      t.getState().initializeShadowState(c, i), t.getState().setShadowMetadata(c, [], {
        stateSource: m,
        lastServerSync: m === "server" ? d : void 0,
        isDirty: !1,
        baseServerState: m === "server" ? i : void 0
      }), re(c);
    }
  }, [c, ...T || []]), ue(() => {
    N && me(c, {
      serverSync: p,
      formElements: v,
      defaultState: l,
      localStorage: g,
      middleware: f.current?.middleware
    });
    const a = `${c}////${H.current}`, n = t.getState().getShadowMetadata(c, []), r = n?.components || /* @__PURE__ */ new Map();
    return r.set(a, {
      forceUpdate: () => M({}),
      reactiveType: V ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: h || void 0,
      deps: h ? h(t.getState().getShadowValue(c)) : [],
      prevDeps: h ? h(t.getState().getShadowValue(c)) : []
    }), t.getState().setShadowMetadata(c, [], {
      ...n,
      components: r
    }), M({}), () => {
      const i = t.getState().getShadowMetadata(c, []), m = i?.components?.get(a);
      m?.paths && m.paths.forEach((d) => {
        const P = d.split(".").slice(1), U = t.getState().getShadowMetadata(c, P);
        U?.pathComponents && U.pathComponents.size === 0 && (delete U.pathComponents, t.getState().setShadowMetadata(c, P, U));
      }), i?.components && t.getState().setShadowMetadata(c, [], i);
    };
  }, []);
  const se = (a, n, r, i) => {
    const m = [c, ...n].join(".");
    if (Array.isArray(n)) {
      const b = `${c}-${n.join(".")}`;
      G.current.add(b);
    }
    const d = t.getState(), I = d.getShadowMetadata(c, n), P = d.getShadowValue(m), U = r.updateType === "insert" && K(a) ? a({ state: P, uuid: ee() }) : K(a) ? a(P) : a, _ = {
      timeStamp: Date.now(),
      stateKey: c,
      path: n,
      updateType: r.updateType,
      status: "new",
      oldValue: P,
      newValue: U
    };
    switch (r.updateType) {
      case "insert": {
        d.insertShadowArrayElement(c, n, _.newValue), d.markAsDirty(c, n, { bubble: !0 });
        break;
      }
      case "cut": {
        const b = n.slice(0, -1);
        d.removeShadowArrayElement(c, n), d.markAsDirty(c, b, { bubble: !0 });
        break;
      }
      case "update": {
        d.updateShadowAtPath(c, n, _.newValue), d.markAsDirty(c, n, { bubble: !0 });
        break;
      }
    }
    if (I?.signals && I.signals.length > 0) {
      const b = r.updateType === "cut" ? null : U;
      I.signals.forEach(({ parentId: k, position: A, effect: F }) => {
        const y = document.querySelector(`[data-parent-id="${k}"]`);
        if (y) {
          const w = Array.from(y.childNodes);
          if (w[A]) {
            let C = b;
            if (F && b !== null)
              try {
                C = new Function(
                  "state",
                  `return (${F})(state)`
                )(b);
              } catch ($) {
                console.error("Error evaluating effect function:", $);
              }
            C != null && typeof C == "object" && (C = JSON.stringify(C)), w[A].textContent = String(C ?? "");
          }
        }
      });
    }
    if (r.updateType === "insert" && I?.mapWrappers && I.mapWrappers.length > 0) {
      const b = d.getShadowMetadata(c, n)?.arrayKeys || [], k = b[b.length - 1], A = d.getShadowValue(k), F = d.getShadowValue(
        [c, ...n].join(".")
      );
      if (!k || A === void 0) return;
      I.mapWrappers.forEach((y) => {
        let w = !0, C = -1;
        if (y.meta?.transforms && y.meta.transforms.length > 0) {
          for (const $ of y.meta.transforms)
            if ($.type === "filter" && !$.fn(A, -1)) {
              w = !1;
              break;
            }
          if (w) {
            const $ = ve(
              c,
              n,
              y.meta.transforms
            ), j = y.meta.transforms.find(
              (D) => D.type === "sort"
            );
            if (j) {
              const D = $.map((z) => ({
                key: z,
                value: d.getShadowValue(z)
              }));
              D.push({ key: k, value: A }), D.sort((z, Q) => j.fn(z.value, Q.value)), C = D.findIndex(
                (z) => z.key === k
              );
            } else
              C = $.length;
          }
        } else
          w = !0, C = b.length - 1;
        if (w && y.containerRef && y.containerRef.isConnected) {
          const $ = document.createElement("div");
          $.setAttribute("data-item-path", k);
          const j = Array.from(y.containerRef.children);
          C >= 0 && C < j.length ? y.containerRef.insertBefore(
            $,
            j[C]
          ) : y.containerRef.appendChild($);
          const D = Ce($), z = ee(), Q = k.split(".").slice(1), X = y.rebuildStateShape({
            path: y.path,
            currentState: F,
            componentId: y.componentId,
            meta: y.meta
          });
          D.render(
            le(we, {
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
      const b = n.slice(0, -1), k = d.getShadowMetadata(c, b);
      k?.mapWrappers && k.mapWrappers.length > 0 && k.mapWrappers.forEach((A) => {
        if (A.containerRef && A.containerRef.isConnected) {
          const F = A.containerRef.querySelector(
            `[data-item-path="${m}"]`
          );
          F && F.remove();
        }
      });
    }
    r.updateType === "update" && (i || f.current?.validation?.key) && n && ne(
      (i || f.current?.validation?.key) + "." + n.join(".")
    );
    const R = n.slice(0, n.length - 1);
    r.updateType === "cut" && f.current?.validation?.key && ne(
      f.current?.validation?.key + "." + R.join(".")
    ), r.updateType === "insert" && f.current?.validation?.key && Ne(
      f.current?.validation?.key + "." + R.join(".")
    ).filter((k) => {
      let A = k?.split(".").length;
      const F = "";
      if (k == R.join(".") && A == R.length - 1) {
        let y = k + "." + R;
        ne(k), pe(y, F);
      }
    });
    const B = d.getShadowValue(c), O = d.getShadowMetadata(c, []), W = /* @__PURE__ */ new Set();
    if (!O?.components)
      return B;
    if (r.updateType === "update")
      I?.pathComponents && I.pathComponents.forEach((b) => {
        if (W.has(b))
          return;
        const k = O.components?.get(b);
        k && ((Array.isArray(k.reactiveType) ? k.reactiveType : [k.reactiveType || "component"]).includes("none") || (k.forceUpdate(), W.add(b)));
      }), U && typeof U == "object" && !Te(U) && P && typeof P == "object" && !Te(P) && Ae(U, P).forEach((k) => {
        const A = k.split("."), F = [...n, ...A], y = d.getShadowMetadata(c, F);
        y?.pathComponents && y.pathComponents.forEach((w) => {
          if (W.has(w))
            return;
          const C = O.components?.get(w);
          C && ((Array.isArray(C.reactiveType) ? C.reactiveType : [C.reactiveType || "component"]).includes("none") || (C.forceUpdate(), W.add(w)));
        });
      });
    else if (r.updateType === "insert" || r.updateType === "cut") {
      const b = r.updateType === "insert" ? n : n.slice(0, -1), k = d.getShadowMetadata(c, b);
      if (k?.signals && k.signals.length > 0) {
        const A = [c, ...b].join("."), F = d.getShadowValue(A);
        k.signals.forEach(({ parentId: y, position: w, effect: C }) => {
          const $ = document.querySelector(
            `[data-parent-id="${y}"]`
          );
          if ($) {
            const j = Array.from($.childNodes);
            if (j[w]) {
              let D = F;
              if (C)
                try {
                  D = new Function(
                    "state",
                    `return (${C})(state)`
                  )(F);
                } catch (z) {
                  console.error("Error evaluating effect function:", z), D = F;
                }
              D != null && typeof D == "object" && (D = JSON.stringify(D)), j[w].textContent = String(D ?? "");
            }
          }
        });
      }
      k?.pathComponents && k.pathComponents.forEach((A) => {
        if (!W.has(A)) {
          const F = O.components?.get(A);
          F && (F.forceUpdate(), W.add(A));
        }
      });
    }
    return O.components.forEach((b, k) => {
      if (W.has(k))
        return;
      const A = Array.isArray(b.reactiveType) ? b.reactiveType : [b.reactiveType || "component"];
      if (A.includes("all")) {
        b.forceUpdate(), W.add(k);
        return;
      }
      if (A.includes("deps") && b.depsFunction) {
        const F = d.getShadowValue(c), y = b.depsFunction(F);
        let w = !1;
        y === !0 ? w = !0 : Array.isArray(y) && (ie(b.prevDeps, y) || (b.prevDeps = y, w = !0)), w && (b.forceUpdate(), W.add(k));
      }
    }), W.clear(), We(c, (b) => {
      const k = [...b ?? [], _], A = /* @__PURE__ */ new Map();
      return k.forEach((F) => {
        const y = `${F.stateKey}:${JSON.stringify(F.path)}`, w = A.get(y);
        w ? (w.timeStamp = Math.max(w.timeStamp, F.timeStamp), w.newValue = F.newValue, w.oldValue = w.oldValue ?? F.oldValue, w.updateType = F.updateType) : A.set(y, { ...F });
      }), Array.from(A.values());
    }), He(
      U,
      c,
      f.current,
      L
    ), f.current?.middleware && f.current.middleware({
      updateLog: J,
      update: _
    }), B;
  };
  return t.getState().initialStateGlobal[c] || _e(c, e), de(() => Pe(
    c,
    se,
    H.current,
    L
  ), [c, L]);
}
function qe(e) {
  return !e || e.length === 0 ? "" : e.map(
    (s) => (
      // Safely stringify dependencies. An empty array becomes '[]'.
      `${s.type}${JSON.stringify(s.dependencies || [])}`
    )
  ).join("");
}
const ve = (e, s, p) => {
  let g = t.getState().getShadowMetadata(e, s)?.arrayKeys || [];
  if (!p || p.length === 0)
    return g;
  let v = g.map((h) => ({
    key: h,
    value: t.getState().getShadowValue(h)
  }));
  for (const h of p)
    h.type === "filter" ? v = v.filter(
      ({ value: V }, u) => h.fn(V, u)
    ) : h.type === "sort" && v.sort((V, u) => h.fn(V.value, u.value));
  return v.map(({ key: h }) => h);
}, Ee = (e, s, p) => {
  const g = `${e}////${s}`, h = t.getState().getShadowMetadata(e, [])?.components?.get(g);
  if (!h || h.reactiveType == "none" || !(Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType]).includes("component"))
    return;
  const V = [e, ...p].join(".");
  h.paths.add(V);
  const u = t.getState().getShadowMetadata(e, p) || {}, l = u.pathComponents || /* @__PURE__ */ new Set();
  l.add(g), t.getState().setShadowMetadata(e, p, {
    ...u,
    pathComponents: l
  });
}, he = (e, s, p) => {
  const g = t.getState(), v = g.getShadowMetadata(e, []), h = /* @__PURE__ */ new Set();
  v?.components && v.components.forEach((u, l) => {
    (Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType || "component"]).includes("all") && (u.forceUpdate(), h.add(l));
  }), g.getShadowMetadata(e, [...s, "getSelected"])?.pathComponents?.forEach((u) => {
    v?.components?.get(u)?.forceUpdate();
  });
  const V = g.getShadowMetadata(e, s);
  for (let u of V?.arrayKeys || []) {
    const l = u + ".selected", E = g.getShadowMetadata(
      e,
      l.split(".").slice(1)
    );
    u == p && E?.pathComponents?.forEach((T) => {
      v?.components?.get(T)?.forceUpdate();
    });
  }
};
function Pe(e, s, p, g) {
  const v = /* @__PURE__ */ new Map();
  let h = 0;
  const V = (T) => {
    const o = T.join(".");
    for (const [S] of v)
      (S === o || S.startsWith(o + ".")) && v.delete(S);
    h++;
  };
  function u({
    currentState: T,
    path: o = [],
    meta: S,
    componentId: M
  }) {
    const L = o.map(String).join("."), N = [e, ...o].join(".");
    T = t.getState().getShadowValue(N, S?.validIds);
    const c = function() {
      return t().getShadowValue(e, o);
    }, J = {
      apply(H, f, oe) {
      },
      get(H, f) {
        if (f === "_rebuildStateShape")
          return u;
        if (Object.getOwnPropertyNames(l).includes(f) && o.length === 0)
          return l[f];
        if (f === "getDifferences")
          return () => {
            const a = t.getState().getShadowMetadata(e, []), n = t.getState().getShadowValue(e);
            let r;
            return a?.stateSource === "server" && a.baseServerState ? r = a.baseServerState : r = t.getState().initialStateGlobal[e], Ae(n, r);
          };
        if (f === "sync" && o.length === 0)
          return async function() {
            const a = t.getState().getInitialOptions(e), n = a?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const r = t.getState().getShadowValue(e, []), i = a?.validation?.key;
            try {
              const m = await n.action(r);
              if (m && !m.success && m.errors && i && (t.getState().removeValidationError(i), m.errors.forEach((d) => {
                const I = [i, ...d.path].join(".");
                t.getState().addValidationError(I, d.message);
              }), re(e)), m?.success) {
                const d = t.getState().getShadowMetadata(e, []);
                t.getState().setShadowMetadata(e, [], {
                  ...d,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: r
                  // Update base server state
                }), n.onSuccess && n.onSuccess(m.data);
              } else !m?.success && n.onError && n.onError(m.error);
              return m;
            } catch (m) {
              return n.onError && n.onError(m), { success: !1, error: m };
            }
          };
        if (f === "_status" || f === "getStatus") {
          const a = () => {
            const n = t.getState().getShadowMetadata(e, []);
            return n?.stateSource === "server" && !n.isDirty ? "synced" : n?.isDirty ? "dirty" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" ? "fresh" : "unknown";
          };
          return f === "_status" ? a() : a;
        }
        if (f === "removeStorage")
          return () => {
            const a = t.getState().initialStateGlobal[e], n = te(e), r = K(n?.localStorage?.key) ? n.localStorage.key(a) : n?.localStorage?.key, i = `${g}-${e}-${r}`;
            i && localStorage.removeItem(i);
          };
        if (f === "showValidationErrors")
          return () => {
            const a = t.getState().getInitialOptions(e)?.validation;
            if (!a?.key) throw new Error("Validation key not found");
            return t.getState().getValidationErrors(a.key + "." + o.join("."));
          };
        if (Array.isArray(T)) {
          if (f === "getSelected")
            return () => {
              const a = e + "." + o.join(".");
              Ee(e, M, [
                ...o,
                "getSelected"
              ]);
              const n = t.getState().selectedIndicesMap;
              if (!n || !n.has(a))
                return;
              const r = n.get(a);
              if (S?.validIds && !S.validIds.includes(r))
                return;
              const i = t.getState().getShadowValue(r);
              if (i)
                return u({
                  currentState: i,
                  path: r.split(".").slice(1),
                  componentId: M
                });
            };
          if (f === "getSelectedIndex")
            return () => t.getState().getSelectedIndex(
              e + "." + o.join("."),
              S?.validIds
            );
          if (f === "clearSelected")
            return he(e, o), () => {
              t.getState().clearSelectedIndex({
                arrayKey: e + "." + o.join(".")
              });
            };
          if (f === "useVirtualView")
            return (a) => {
              const {
                itemHeight: n = 50,
                overscan: r = 6,
                stickToBottom: i = !1,
                scrollStickTolerance: m = 75
              } = a, d = q(null), [I, P] = Z({
                startIndex: 0,
                endIndex: 10
              }), [U, x] = Z({}), _ = q(!0), R = q({
                isUserScrolling: !1,
                lastScrollTop: 0,
                scrollUpCount: 0,
                isNearBottom: !0
              }), B = q(
                /* @__PURE__ */ new Map()
              );
              ue(() => {
                if (!i || !d.current || R.current.isUserScrolling)
                  return;
                const y = d.current;
                y.scrollTo({
                  top: y.scrollHeight,
                  behavior: _.current ? "instant" : "smooth"
                });
              }, [U, i]);
              const O = t.getState().getShadowMetadata(e, o)?.arrayKeys || [], { totalHeight: W, itemOffsets: b } = de(() => {
                let y = 0;
                const w = /* @__PURE__ */ new Map();
                return (t.getState().getShadowMetadata(e, o)?.arrayKeys || []).forEach(($) => {
                  const j = $.split(".").slice(1), D = t.getState().getShadowMetadata(e, j)?.virtualizer?.itemHeight || n;
                  w.set($, {
                    height: D,
                    offset: y
                  }), y += D;
                }), B.current = w, { totalHeight: y, itemOffsets: w };
              }, [O.length, n]);
              ue(() => {
                if (i && O.length > 0 && d.current && !R.current.isUserScrolling && _.current) {
                  const y = d.current, w = () => {
                    if (y.clientHeight > 0) {
                      const C = Math.ceil(
                        y.clientHeight / n
                      ), $ = O.length - 1, j = Math.max(
                        0,
                        $ - C - r
                      );
                      P({ startIndex: j, endIndex: $ }), requestAnimationFrame(() => {
                        A("instant"), _.current = !1;
                      });
                    } else
                      requestAnimationFrame(w);
                  };
                  w();
                }
              }, [O.length, i, n, r]);
              const k = ce(() => {
                const y = d.current;
                if (!y) return;
                const w = y.scrollTop, { scrollHeight: C, clientHeight: $ } = y, j = R.current, D = C - (w + $), z = j.isNearBottom;
                j.isNearBottom = D <= m, w < j.lastScrollTop ? (j.scrollUpCount++, j.scrollUpCount > 3 && z && (j.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : j.isNearBottom && (j.isUserScrolling = !1, j.scrollUpCount = 0), j.lastScrollTop = w;
                let Q = 0;
                for (let X = 0; X < O.length; X++) {
                  const ge = O[X], Se = B.current.get(ge);
                  if (Se && Se.offset + Se.height > w) {
                    Q = X;
                    break;
                  }
                }
                if (Q !== I.startIndex) {
                  const X = Math.ceil($ / n);
                  P({
                    startIndex: Math.max(0, Q - r),
                    endIndex: Math.min(
                      O.length - 1,
                      Q + X + r
                    )
                  });
                }
              }, [
                O.length,
                I.startIndex,
                n,
                r,
                m
              ]);
              Y(() => {
                const y = d.current;
                if (!(!y || !i))
                  return y.addEventListener("scroll", k, {
                    passive: !0
                  }), () => {
                    y.removeEventListener("scroll", k);
                  };
              }, [k, i]);
              const A = ce(
                (y = "smooth") => {
                  const w = d.current;
                  if (!w) return;
                  R.current.isUserScrolling = !1, R.current.isNearBottom = !0, R.current.scrollUpCount = 0;
                  const C = () => {
                    const $ = (j = 0) => {
                      if (j > 5) return;
                      const D = w.scrollHeight, z = w.scrollTop, Q = w.clientHeight;
                      z + Q >= D - 1 || (w.scrollTo({
                        top: D,
                        behavior: y
                      }), setTimeout(() => {
                        const X = w.scrollHeight, ge = w.scrollTop;
                        (X !== D || ge + Q < X - 1) && $(j + 1);
                      }, 50));
                    };
                    $();
                  };
                  "requestIdleCallback" in window ? requestIdleCallback(C, { timeout: 100 }) : requestAnimationFrame(() => {
                    requestAnimationFrame(C);
                  });
                },
                []
              );
              return Y(() => {
                if (!i || !d.current) return;
                const y = d.current, w = R.current;
                let C;
                const $ = () => {
                  clearTimeout(C), C = setTimeout(() => {
                    !w.isUserScrolling && w.isNearBottom && A(
                      _.current ? "instant" : "smooth"
                    );
                  }, 100);
                }, j = new MutationObserver(() => {
                  w.isUserScrolling || $();
                });
                j.observe(y, {
                  childList: !0,
                  subtree: !0,
                  attributes: !0,
                  attributeFilter: ["style", "class"]
                  // More specific than just 'height'
                });
                const D = (z) => {
                  z.target instanceof HTMLImageElement && !w.isUserScrolling && $();
                };
                return y.addEventListener("load", D, !0), _.current ? setTimeout(() => {
                  A("instant");
                }, 0) : $(), () => {
                  clearTimeout(C), j.disconnect(), y.removeEventListener("load", D, !0);
                };
              }, [i, O.length, A]), {
                virtualState: de(() => {
                  const y = t.getState(), w = y.getShadowValue(
                    [e, ...o].join(".")
                  ), C = y.getShadowMetadata(e, o)?.arrayKeys || [], $ = w.slice(
                    I.startIndex,
                    I.endIndex + 1
                  ), j = C.slice(
                    I.startIndex,
                    I.endIndex + 1
                  );
                  return u({
                    currentState: $,
                    path: o,
                    componentId: M,
                    meta: { ...S, validIds: j }
                  });
                }, [I.startIndex, I.endIndex, O.length]),
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
                      height: `${W}px`,
                      position: "relative"
                    }
                  },
                  list: {
                    style: {
                      transform: `translateY(${B.current.get(
                        O[I.startIndex]
                      )?.offset || 0}px)`
                    }
                  }
                },
                scrollToBottom: A,
                scrollToIndex: (y, w = "smooth") => {
                  if (d.current && O[y]) {
                    const C = B.current.get(O[y])?.offset || 0;
                    d.current.scrollTo({ top: C, behavior: w });
                  }
                }
              };
            };
          if (f === "stateMap")
            return (a) => {
              const [n, r] = Z(
                S?.validIds ?? t.getState().getShadowMetadata(e, o)?.arrayKeys
              ), i = t.getState().getShadowValue(N, S?.validIds);
              if (!n)
                throw new Error("No array keys found for mapping");
              const m = u({
                currentState: i,
                path: o,
                componentId: M,
                meta: S
              });
              return i.map((d, I) => {
                const P = n[I]?.split(".").slice(1), U = u({
                  currentState: d,
                  path: P,
                  componentId: M,
                  meta: S
                });
                return a(
                  U,
                  I,
                  m
                );
              });
            };
          if (f === "$stateMap")
            return (a) => le(ze, {
              proxy: {
                _stateKey: e,
                _path: o,
                _mapFn: a,
                _meta: S
              },
              rebuildStateShape: u
            });
          if (f === "stateFilter")
            return (a) => {
              const n = S?.validIds ?? t.getState().getShadowMetadata(e, o)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for filtering.");
              const r = [], i = T.filter(
                (m, d) => a(m, d) ? (r.push(n[d]), !0) : !1
              );
              return u({
                currentState: i,
                path: o,
                componentId: M,
                meta: {
                  validIds: r,
                  transforms: [
                    ...S?.transforms || [],
                    {
                      type: "filter",
                      fn: a
                    }
                  ]
                }
              });
            };
          if (f === "stateSort")
            return (a) => {
              const n = S?.validIds ?? t.getState().getShadowMetadata(e, o)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for sorting");
              const r = T.map((i, m) => ({
                item: i,
                key: n[m]
              }));
              return r.sort((i, m) => a(i.item, m.item)).filter(Boolean), u({
                currentState: r.map((i) => i.item),
                path: o,
                componentId: M,
                meta: {
                  validIds: r.map((i) => i.key),
                  transforms: [
                    ...S?.transforms || [],
                    { type: "sort", fn: a }
                  ]
                }
              });
            };
          if (f === "stream")
            return function(a = {}) {
              const {
                bufferSize: n = 100,
                flushInterval: r = 100,
                bufferStrategy: i = "accumulate",
                store: m,
                onFlush: d
              } = a;
              let I = [], P = !1, U = null;
              const x = (W) => {
                if (!P) {
                  if (i === "sliding" && I.length >= n)
                    I.shift();
                  else if (i === "dropping" && I.length >= n)
                    return;
                  I.push(W), I.length >= n && _();
                }
              }, _ = () => {
                if (I.length === 0) return;
                const W = [...I];
                if (I = [], m) {
                  const b = m(W);
                  b !== void 0 && (Array.isArray(b) ? b : [b]).forEach((A) => {
                    s(A, o, {
                      updateType: "insert"
                    });
                  });
                } else
                  W.forEach((b) => {
                    s(b, o, {
                      updateType: "insert"
                    });
                  });
                d?.(W);
              };
              r > 0 && (U = setInterval(_, r));
              const R = ee(), B = t.getState().getShadowMetadata(e, o) || {}, O = B.streams || /* @__PURE__ */ new Map();
              return O.set(R, { buffer: I, flushTimer: U }), t.getState().setShadowMetadata(e, o, {
                ...B,
                streams: O
              }), {
                write: (W) => x(W),
                writeMany: (W) => W.forEach(x),
                flush: () => _(),
                pause: () => {
                  P = !0;
                },
                resume: () => {
                  P = !1, I.length > 0 && _();
                },
                close: () => {
                  _(), U && clearInterval(U);
                  const W = t.getState().getShadowMetadata(e, o);
                  W?.streams && W.streams.delete(R);
                }
              };
            };
          if (f === "stateList")
            return (a) => /* @__PURE__ */ ae(() => {
              const r = q(/* @__PURE__ */ new Map()), i = S?.transforms && S.transforms.length > 0 ? `${M}-${qe(S.transforms)}` : `${M}-base`, [m, d] = Z({}), { validIds: I, arrayValues: P } = de(() => {
                const x = t.getState().getShadowMetadata(e, o)?.transformCaches?.get(i);
                let _;
                x && x.validIds ? _ = x.validIds : (_ = ve(
                  e,
                  o,
                  S?.transforms
                ), t.getState().setTransformCache(e, o, i, {
                  validIds: _,
                  computedAt: Date.now(),
                  transforms: S?.transforms || []
                }));
                const R = t.getState().getShadowValue(N, _);
                return {
                  validIds: _,
                  arrayValues: R || []
                };
              }, [i, m]);
              if (Y(() => {
                const x = t.getState().subscribeToPath(N, (_) => {
                  if (console.log("statelsit subscribed to path", _), _.type === "GET_SELECTED")
                    return;
                  const B = t.getState().getShadowMetadata(e, o)?.transformCaches;
                  if (B)
                    for (const O of B.keys())
                      O.startsWith(M) && B.delete(O);
                  _.type === "INSERT" && d({});
                });
                return () => {
                  x();
                };
              }, [M, N]), !Array.isArray(P))
                return null;
              const U = u({
                currentState: P,
                path: o,
                componentId: M,
                meta: {
                  ...S,
                  validIds: I
                }
              });
              return /* @__PURE__ */ ae(ke, { children: P.map((x, _) => {
                const R = I[_];
                if (!R)
                  return null;
                let B = r.current.get(R);
                B || (B = ee(), r.current.set(R, B));
                const O = R.split(".").slice(1);
                return le(we, {
                  key: R,
                  stateKey: e,
                  itemComponentId: B,
                  itemPath: O,
                  localIndex: _,
                  arraySetter: U,
                  rebuildStateShape: u,
                  renderFn: a
                });
              }) });
            }, {});
          if (f === "stateFlattenOn")
            return (a) => {
              const n = T;
              v.clear(), h++;
              const r = n.flatMap(
                (i) => i[a] ?? []
              );
              return u({
                currentState: r,
                path: [...o, "[*]", a],
                componentId: M,
                meta: S
              });
            };
          if (f === "index")
            return (a) => {
              const r = t.getState().getShadowMetadata(e, o)?.arrayKeys?.filter(
                (d) => !S?.validIds || S?.validIds && S?.validIds?.includes(d)
              )?.[a];
              if (!r) return;
              const i = t.getState().getShadowValue(r, S?.validIds);
              return u({
                currentState: i,
                path: r.split(".").slice(1),
                componentId: M,
                meta: S
              });
            };
          if (f === "last")
            return () => {
              const a = t.getState().getShadowValue(e, o);
              if (a.length === 0) return;
              const n = a.length - 1, r = a[n], i = [...o, n.toString()];
              return u({
                currentState: r,
                path: i,
                componentId: M,
                meta: S
              });
            };
          if (f === "insert")
            return (a, n) => (s(a, o, { updateType: "insert" }), u({
              currentState: t.getState().getShadowValue(e, o),
              path: o,
              componentId: M,
              meta: S
            }));
          if (f === "uniqueInsert")
            return (a, n, r) => {
              const i = t.getState().getShadowValue(e, o), m = K(a) ? a(i) : a;
              let d = null;
              if (!i.some((P) => {
                const U = n ? n.every(
                  (x) => ie(P[x], m[x])
                ) : ie(P, m);
                return U && (d = P), U;
              }))
                V(o), s(m, o, { updateType: "insert" });
              else if (r && d) {
                const P = r(d), U = i.map(
                  (x) => ie(x, d) ? P : x
                );
                V(o), s(U, o, {
                  updateType: "update"
                });
              }
            };
          if (f === "cut")
            return (a, n) => {
              const r = S?.validIds ?? t.getState().getShadowMetadata(e, o)?.arrayKeys;
              if (!r || r.length === 0) return;
              const i = a == -1 ? r.length - 1 : a !== void 0 ? a : r.length - 1, m = r[i];
              if (!m) return;
              const d = m.split(".").slice(1);
              s(T, d, {
                updateType: "cut"
              });
            };
          if (f === "cutSelected")
            return () => {
              t.getState().getShadowMetadata(e, o)?.arrayKeys;
              const a = ve(
                e,
                o,
                S?.transforms
              );
              if (console.log("validKeys", a), !a || a.length === 0) return;
              const n = t.getState().selectedIndicesMap.get(N);
              let r = a.findIndex(
                (m) => m === n
              );
              console.log("indexToCut", r);
              const i = a[r == -1 ? a.length - 1 : r]?.split(".").slice(1);
              console.log("pathForCut", i), s(T, i, {
                updateType: "cut"
              });
            };
          if (f === "cutByValue")
            return (a) => {
              const n = t.getState().getShadowMetadata(e, o), r = S?.validIds ?? n?.arrayKeys;
              if (!r) return;
              let i = null;
              for (const m of r)
                if (t.getState().getShadowValue(m) === a) {
                  i = m;
                  break;
                }
              if (i) {
                const m = i.split(".").slice(1);
                s(null, m, { updateType: "cut" });
              }
            };
          if (f === "toggleByValue")
            return (a) => {
              const n = t.getState().getShadowMetadata(e, o), r = S?.validIds ?? n?.arrayKeys;
              if (!r) return;
              let i = null;
              for (const m of r) {
                const d = t.getState().getShadowValue(m);
                if (console.log("itemValue sdasdasdasd", d), d === a) {
                  i = m;
                  break;
                }
              }
              if (console.log("itemValue keyToCut", i), i) {
                const m = i.split(".").slice(1);
                console.log("itemValue keyToCut", i), s(a, m, {
                  updateType: "cut"
                });
              } else
                s(a, o, { updateType: "insert" });
            };
          if (f === "findWith")
            return (a, n) => {
              const r = t.getState().getShadowMetadata(e, o)?.arrayKeys;
              if (!r)
                throw new Error("No array keys found for sorting");
              let i = null, m = [];
              for (const d of r) {
                let I = t.getState().getShadowValue(d, S?.validIds);
                if (I && I[a] === n) {
                  i = I, m = d.split(".").slice(1);
                  break;
                }
              }
              return u({
                currentState: i,
                path: m,
                componentId: M,
                meta: S
              });
            };
        }
        if (f === "cut") {
          let a = t.getState().getShadowValue(o.join("."));
          return () => {
            s(a, o, { updateType: "cut" });
          };
        }
        if (f === "get")
          return () => (Ee(e, M, o), t.getState().getShadowValue(N, S?.validIds));
        if (f === "$derive")
          return (a) => be({
            _stateKey: e,
            _path: o,
            _effect: a.toString(),
            _meta: S
          });
        if (f === "$get")
          return () => be({ _stateKey: e, _path: o, _meta: S });
        if (f === "lastSynced") {
          const a = `${e}:${o.join(".")}`;
          return t.getState().getSyncInfo(a);
        }
        if (f == "getLocalStorage")
          return (a) => fe(g + "-" + e + "-" + a);
        if (f === "isSelected") {
          const a = [e, ...o].slice(0, -1);
          if (he(e, o, void 0), Array.isArray(
            t.getState().getShadowValue(a.join("."), S?.validIds)
          )) {
            o[o.length - 1];
            const n = a.join("."), r = t.getState().selectedIndicesMap.get(n), i = e + "." + o.join(".");
            return r === i;
          }
          return;
        }
        if (f === "setSelected")
          return (a) => {
            const n = o.slice(0, -1), r = e + "." + n.join("."), i = e + "." + o.join(".");
            he(e, n, void 0), t.getState().selectedIndicesMap.get(r), a && t.getState().setSelectedIndex(r, i);
          };
        if (f === "toggleSelected")
          return () => {
            const a = o.slice(0, -1), n = e + "." + a.join("."), r = e + "." + o.join(".");
            t.getState().selectedIndicesMap.get(n) === r ? t.getState().clearSelectedIndex({ arrayKey: n }) : t.getState().setSelectedIndex(n, r);
          };
        if (f === "_componentId")
          return M;
        if (o.length == 0) {
          if (f === "addValidation")
            return (a) => {
              const n = t.getState().getInitialOptions(e)?.validation;
              if (!n?.key) throw new Error("Validation key not found");
              ne(n.key), a.forEach((r) => {
                const i = [n.key, ...r.path].join(".");
                pe(i, r.message);
              }), re(e);
            };
          if (f === "applyJsonPatch")
            return (a) => {
              const n = t.getState().getShadowValue(N, S?.validIds);
              Le(n, a).newDocument, re(e);
            };
          if (f === "validateZodSchema")
            return () => {
              const a = t.getState().getInitialOptions(e)?.validation;
              if (!a?.zodSchema || !a?.key)
                throw new Error("Zod schema or validation key not found");
              ne(a.key);
              const n = t.getState().getShadowValue(e), r = a.zodSchema.safeParse(n);
              return r.success ? !0 : (r.error.errors.forEach((i) => {
                const m = [a.key, ...i.path].join(".");
                pe(m, i.message);
              }), re(e), !1);
            };
          if (f === "getComponents")
            return () => t.getState().getShadowMetadata(e, [])?.components;
          if (f === "getAllFormRefs")
            return () => ye.getState().getFormRefsByStateKey(e);
        }
        if (f === "getFormRef")
          return () => ye.getState().getFormRef(e + "." + o.join("."));
        if (f === "validationWrapper")
          return ({
            children: a,
            hideMessage: n
          }) => /* @__PURE__ */ ae(
            Me,
            {
              formOpts: n ? { validation: { message: "" } } : void 0,
              path: o,
              stateKey: e,
              children: a
            }
          );
        if (f === "_stateKey") return e;
        if (f === "_path") return o;
        if (f === "update")
          return (a) => {
            s(a, o, { updateType: "update" });
          };
        if (f === "toggle") {
          const a = t.getState().getShadowValue([e, ...o].join("."));
          if (console.log("currentValueAtPath", a), typeof T != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            s(!a, o, {
              updateType: "update"
            });
          };
        }
        if (f === "formElement")
          return (a, n) => /* @__PURE__ */ ae(
            Me,
            {
              formOpts: n,
              path: o,
              stateKey: e,
              children: /* @__PURE__ */ ae(
                Ze,
                {
                  stateKey: e,
                  path: o,
                  rebuildStateShape: u,
                  setState: s,
                  formOpts: n,
                  renderFn: a
                }
              )
            }
          );
        const se = [...o, f], Ie = t.getState().getShadowValue(e, se);
        return u({
          currentState: Ie,
          path: se,
          componentId: M,
          meta: S
        });
      }
    }, G = new Proxy(c, J);
    return v.set(L, {
      proxy: G,
      stateVersion: h
    }), G;
  }
  const l = {
    removeValidation: (T) => {
      T?.validationKey && ne(T.validationKey);
    },
    revertToInitialState: (T) => {
      const o = t.getState().getInitialOptions(e)?.validation;
      o?.key && ne(o.key), T?.validationKey && ne(T.validationKey);
      const S = t.getState().getShadowMetadata(e, []);
      S?.stateSource === "server" && S.baseServerState ? S.baseServerState : t.getState().initialStateGlobal[e];
      const M = t.getState().initialStateGlobal[e];
      t.getState().clearSelectedIndexesForState(e), v.clear(), h++, t.getState().initializeShadowState(e, M), u({
        currentState: M,
        path: [],
        componentId: p
      });
      const L = te(e), N = K(L?.localStorage?.key) ? L?.localStorage?.key(M) : L?.localStorage?.key, c = `${g}-${e}-${N}`;
      c && localStorage.removeItem(c);
      const J = t.getState().getShadowMetadata(e, []);
      return J && J?.components?.forEach((G) => {
        G.forceUpdate();
      }), M;
    },
    updateInitialState: (T) => {
      v.clear(), h++;
      const o = Pe(
        e,
        s,
        p,
        g
      ), S = t.getState().initialStateGlobal[e], M = te(e), L = K(M?.localStorage?.key) ? M?.localStorage?.key(S) : M?.localStorage?.key, N = `${g}-${e}-${L}`;
      return localStorage.getItem(N) && localStorage.removeItem(N), je(() => {
        _e(e, T), t.getState().initializeShadowState(e, T);
        const c = t.getState().getShadowMetadata(e, []);
        c && c?.components?.forEach((J) => {
          J.forceUpdate();
        });
      }), {
        fetchId: (c) => o.get()[c]
      };
    }
  };
  return u({
    currentState: t.getState().getShadowValue(e, []),
    componentId: p,
    path: []
  });
}
function be(e) {
  return le(Ge, { proxy: e });
}
function ze({
  proxy: e,
  rebuildStateShape: s
}) {
  const p = q(null), g = q(`map-${crypto.randomUUID()}`), v = q(!1), h = q(/* @__PURE__ */ new Map());
  Y(() => {
    const u = p.current;
    if (!u || v.current) return;
    const l = setTimeout(() => {
      const E = t.getState().getShadowMetadata(e._stateKey, e._path) || {}, T = E.mapWrappers || [];
      T.push({
        instanceId: g.current,
        mapFn: e._mapFn,
        containerRef: u,
        rebuildStateShape: s,
        path: e._path,
        componentId: g.current,
        meta: e._meta
      }), t.getState().setShadowMetadata(e._stateKey, e._path, {
        ...E,
        mapWrappers: T
      }), v.current = !0, V();
    }, 0);
    return () => {
      if (clearTimeout(l), g.current) {
        const E = t.getState().getShadowMetadata(e._stateKey, e._path) || {};
        E.mapWrappers && (E.mapWrappers = E.mapWrappers.filter(
          (T) => T.instanceId !== g.current
        ), t.getState().setShadowMetadata(e._stateKey, e._path, E));
      }
      h.current.forEach((E) => E.unmount());
    };
  }, []);
  const V = () => {
    const u = p.current;
    if (!u) return;
    const l = t.getState().getShadowValue(
      [e._stateKey, ...e._path].join("."),
      e._meta?.validIds
    );
    if (!Array.isArray(l)) return;
    const E = e._meta?.validIds ?? t.getState().getShadowMetadata(e._stateKey, e._path)?.arrayKeys ?? [], T = s({
      currentState: l,
      path: e._path,
      componentId: g.current,
      meta: e._meta
    });
    l.forEach((o, S) => {
      const M = E[S];
      if (!M) return;
      const L = ee(), N = document.createElement("div");
      N.setAttribute("data-item-path", M), u.appendChild(N);
      const c = Ce(N);
      h.current.set(M, c);
      const J = M.split(".").slice(1);
      c.render(
        le(we, {
          stateKey: e._stateKey,
          itemComponentId: L,
          itemPath: J,
          localIndex: S,
          arraySetter: T,
          rebuildStateShape: s,
          renderFn: e._mapFn
        })
      );
    });
  };
  return /* @__PURE__ */ ae("div", { ref: p, "data-map-container": g.current });
}
function Ge({
  proxy: e
}) {
  const s = q(null), p = q(null), g = q(!1), v = `${e._stateKey}-${e._path.join(".")}`, h = t.getState().getShadowValue(
    [e._stateKey, ...e._path].join("."),
    e._meta?.validIds
  );
  return Y(() => {
    const V = s.current;
    if (!V || g.current) return;
    const u = setTimeout(() => {
      if (!V.parentElement) {
        console.warn("Parent element not found for signal", v);
        return;
      }
      const l = V.parentElement, T = Array.from(l.childNodes).indexOf(V);
      let o = l.getAttribute("data-parent-id");
      o || (o = `parent-${crypto.randomUUID()}`, l.setAttribute("data-parent-id", o)), p.current = `instance-${crypto.randomUUID()}`;
      const S = t.getState().getShadowMetadata(e._stateKey, e._path) || {}, M = S.signals || [];
      M.push({
        instanceId: p.current,
        parentId: o,
        position: T,
        effect: e._effect
      }), t.getState().setShadowMetadata(e._stateKey, e._path, {
        ...S,
        signals: M
      });
      let L = h;
      if (e._effect)
        try {
          L = new Function(
            "state",
            `return (${e._effect})(state)`
          )(h);
        } catch (c) {
          console.error("Error evaluating effect function:", c);
        }
      L !== null && typeof L == "object" && (L = JSON.stringify(L));
      const N = document.createTextNode(String(L ?? ""));
      V.replaceWith(N), g.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(u), p.current) {
        const l = t.getState().getShadowMetadata(e._stateKey, e._path) || {};
        l.signals && (l.signals = l.signals.filter(
          (E) => E.instanceId !== p.current
        ), t.getState().setShadowMetadata(e._stateKey, e._path, l));
      }
    };
  }, []), le("span", {
    ref: s,
    style: { display: "contents" },
    "data-signal-id": v
  });
}
const we = Re(
  Ye,
  (e, s) => e.itemPath.join(".") === s.itemPath.join(".") && e.stateKey === s.stateKey && e.itemComponentId === s.itemComponentId && e.localIndex === s.localIndex
), Je = (e) => {
  const [s, p] = Z(!1);
  return ue(() => {
    if (!e.current) {
      p(!0);
      return;
    }
    const g = Array.from(e.current.querySelectorAll("img"));
    if (g.length === 0) {
      p(!0);
      return;
    }
    let v = 0;
    const h = () => {
      v++, v === g.length && p(!0);
    };
    return g.forEach((V) => {
      V.complete ? h() : (V.addEventListener("load", h), V.addEventListener("error", h));
    }), () => {
      g.forEach((V) => {
        V.removeEventListener("load", h), V.removeEventListener("error", h);
      });
    };
  }, [e.current]), s;
};
function Ye({
  stateKey: e,
  itemComponentId: s,
  itemPath: p,
  localIndex: g,
  arraySetter: v,
  rebuildStateShape: h,
  renderFn: V
}) {
  const [, u] = Z({}), { ref: l, inView: E } = Oe(), T = q(null), o = Je(T), S = q(!1), M = [e, ...p].join(".");
  Ue(e, s, u);
  const L = ce(
    (H) => {
      T.current = H, l(H);
    },
    [l]
  );
  Y(() => {
    t.getState().subscribeToPath(M, (H) => {
      u({});
    });
  }, []), Y(() => {
    if (!E || !o || S.current)
      return;
    const H = T.current;
    if (H && H.offsetHeight > 0) {
      S.current = !0;
      const f = H.offsetHeight;
      t.getState().setShadowMetadata(e, p, {
        virtualizer: {
          itemHeight: f,
          domRef: H
        }
      });
      const oe = p.slice(0, -1), se = [e, ...oe].join(".");
      t.getState().notifyPathSubscribers(se, {
        type: "ITEMHEIGHT",
        itemKey: p.join("."),
        ref: T.current
      });
    }
  }, [E, o, e, p]);
  const N = [e, ...p].join("."), c = t.getState().getShadowValue(N);
  if (c === void 0)
    return null;
  const J = h({
    currentState: c,
    path: p,
    componentId: s
  }), G = V(J, g, v);
  return /* @__PURE__ */ ae("div", { ref: L, children: G });
}
function Ze({
  stateKey: e,
  path: s,
  rebuildStateShape: p,
  renderFn: g,
  formOpts: v,
  setState: h
}) {
  const [V] = Z(() => ee()), [, u] = Z({}), l = [e, ...s].join(".");
  Ue(e, V, u);
  const E = t.getState().getShadowValue(l), [T, o] = Z(E), S = q(!1), M = q(null);
  Y(() => {
    !S.current && !ie(E, T) && o(E);
  }, [E]), Y(() => {
    const G = t.getState().subscribeToPath(l, (H) => {
      u({});
    });
    return () => {
      G(), M.current && (clearTimeout(M.current), S.current = !1);
    };
  }, []);
  const L = ce(
    (G) => {
      o(G), S.current = !0, M.current && clearTimeout(M.current);
      const H = v?.debounceTime ?? 200;
      M.current = setTimeout(() => {
        S.current = !1, h(G, s, { updateType: "update" });
      }, H);
    },
    [h, s, v?.debounceTime]
  ), N = ce(() => {
    M.current && (clearTimeout(M.current), S.current = !1, h(T, s, { updateType: "update" }));
  }, [h, s, T]), c = p({
    currentState: E,
    path: s,
    componentId: V
  }), J = new Proxy(c, {
    get(G, H) {
      return H === "inputProps" ? {
        value: T ?? "",
        onChange: (f) => {
          L(f.target.value);
        },
        onBlur: N,
        ref: ye.getState().getFormRef(e + "." + s.join("."))
      } : G[H];
    }
  });
  return /* @__PURE__ */ ae(ke, { children: g(J) });
}
function Ue(e, s, p) {
  const g = `${e}////${s}`;
  ue(() => {
    const v = t.getState().getShadowMetadata(e, []), h = v?.components || /* @__PURE__ */ new Map();
    return h.set(g, {
      forceUpdate: () => p({}),
      paths: /* @__PURE__ */ new Set(),
      reactiveType: ["component"]
    }), t.getState().setShadowMetadata(e, [], {
      ...v,
      components: h
    }), () => {
      const V = t.getState().getShadowMetadata(e, []);
      V?.components && V.components.delete(g);
    };
  }, [e, g]);
}
export {
  be as $cogsSignal,
  lt as addStateOptions,
  ut as createCogsState,
  dt as notifyComponent,
  Be as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
