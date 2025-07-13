"use client";
import { jsx as oe, Fragment as Ae } from "react/jsx-runtime";
import { memo as Re, useState as X, useRef as z, useCallback as le, useEffect as Q, useLayoutEffect as fe, useMemo as ge, createElement as ue, startTransition as je } from "react";
import { createRoot as Ce } from "react-dom/client";
import { transformStateFunc as Fe, isFunction as te, isArray as Te, getDifferences as Pe, isDeepEqual as ce } from "./utility.js";
import { ValidationWrapper as Ee } from "./Functions.jsx";
import Oe from "superjson";
import { v4 as ae } from "uuid";
import { getGlobalStore as t, formRefStore as pe } from "./store.js";
import { useCogsConfig as _e } from "./CogsStateClient.jsx";
import { useInView as Ne } from "react-intersection-observer";
function me(e, i) {
  const h = t.getState().getInitialOptions, S = t.getState().setInitialStateOptions, p = h(e) || {};
  S(e, {
    ...p,
    ...i
  });
}
function Ve({
  stateKey: e,
  options: i,
  initialOptionsPart: h
}) {
  const S = re(e) || {}, p = h[e] || {}, I = t.getState().setInitialStateOptions, E = { ...p, ...S };
  let l = !1;
  if (i)
    for (const u in i)
      E.hasOwnProperty(u) ? (u == "localStorage" && i[u] && E[u].key !== i[u]?.key && (l = !0, E[u] = i[u]), u == "defaultState" && i[u] && E[u] !== i[u] && !ce(E[u], i[u]) && (l = !0, E[u] = i[u])) : (l = !0, E[u] = i[u]);
  l && I(e, E);
}
function it(e, { formElements: i, validation: h }) {
  return { initialState: e, formElements: i, validation: h };
}
const ct = (e, i) => {
  let h = e;
  const [S, p] = Fe(h);
  Object.keys(S).forEach((l) => {
    let u = p[l] || {};
    const A = {
      ...u
    };
    if (i?.formElements && (A.formElements = {
      ...i.formElements,
      ...u.formElements || {}
    }), i?.validation && (A.validation = {
      ...i.validation,
      ...u.validation || {}
    }, i.validation.key && !u.validation?.key && (A.validation.key = `${i.validation.key}.${l}`)), Object.keys(A).length > 0) {
      const T = re(l);
      T ? t.getState().setInitialStateOptions(l, {
        ...T,
        ...A
      }) : t.getState().setInitialStateOptions(l, A);
    }
  }), Object.keys(S).forEach((l) => {
    t.getState().initializeShadowState(l, S[l]);
  });
  const I = (l, u) => {
    const [A] = X(u?.componentId ?? ae());
    Ve({
      stateKey: l,
      options: u,
      initialOptionsPart: p
    });
    const T = t.getState().getShadowValue(l) || S[l], s = u?.modifyState ? u.modifyState(T) : T;
    return Be(s, {
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
  function E(l, u) {
    Ve({ stateKey: l, options: u, initialOptionsPart: p }), u.localStorage && xe(l, u), ie(l);
  }
  return { useCogsState: I, setCogsOptions: E };
}, {
  getInitialOptions: re,
  getValidationErrors: Le,
  setStateLog: We,
  updateInitialStateGlobal: $e,
  addValidationError: ve,
  removeValidationError: se
} = t.getState(), He = (e, i, h, S, p) => {
  h?.log && console.log(
    "saving to localstorage",
    i,
    h.localStorage?.key,
    S
  );
  const I = te(h?.localStorage?.key) ? h.localStorage?.key(e) : h?.localStorage?.key;
  if (I && S) {
    const E = `${S}-${i}-${I}`;
    let l;
    try {
      l = Se(E)?.lastSyncedWithServer;
    } catch {
    }
    const u = t.getState().getShadowMetadata(i, []), A = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: l,
      stateSource: u?.stateSource,
      baseServerState: u?.baseServerState
    }, T = Oe.serialize(A);
    window.localStorage.setItem(
      E,
      JSON.stringify(T.json)
    );
  }
}, Se = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, xe = (e, i) => {
  const h = t.getState().getShadowValue(e), { sessionId: S } = _e(), p = te(i?.localStorage?.key) ? i.localStorage.key(h) : i?.localStorage?.key;
  if (p && S) {
    const I = Se(
      `${S}-${e}-${p}`
    );
    if (I && I.lastUpdated > (I.lastSyncedWithServer || 0))
      return ie(e), !0;
  }
  return !1;
}, ie = (e) => {
  const i = t.getState().getShadowMetadata(e, []);
  if (!i) return;
  const h = /* @__PURE__ */ new Set();
  i?.components?.forEach((S) => {
    (S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : null)?.includes("none") || h.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    h.forEach((S) => S());
  });
}, lt = (e, i) => {
  const h = t.getState().getShadowMetadata(e, []);
  if (h) {
    const S = `${e}////${i}`, p = h?.components?.get(S);
    if ((p ? Array.isArray(p.reactiveType) ? p.reactiveType : [p.reactiveType || "component"] : null)?.includes("none"))
      return;
    p && p.forceUpdate();
  }
};
function we(e, i, h, S) {
  const p = t.getState(), I = p.getShadowMetadata(e, i);
  if (p.setShadowMetadata(e, i, {
    ...I,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: S || Date.now()
  }), Array.isArray(h)) {
    const E = p.getShadowMetadata(e, i);
    E?.arrayKeys && E.arrayKeys.forEach((l, u) => {
      const A = l.split(".").slice(1), T = h[u];
      T !== void 0 && we(
        e,
        A,
        T,
        S
      );
    });
  } else h && typeof h == "object" && h.constructor === Object && Object.keys(h).forEach((E) => {
    const l = [...i, E], u = h[E];
    we(e, l, u, S);
  });
}
function Be(e, {
  stateKey: i,
  localStorage: h,
  formElements: S,
  reactiveDeps: p,
  reactiveType: I,
  componentId: E,
  defaultState: l,
  syncUpdate: u,
  dependencies: A,
  serverState: T
} = {}) {
  const [s, g] = X({}), { sessionId: M } = _e();
  let W = !i;
  const [c] = X(i ?? ae()), x = t.getState().stateLog[c], Y = z(/* @__PURE__ */ new Set()), G = z(E ?? ae()), F = z(
    null
  );
  F.current = re(c) ?? null, Q(() => {
    if (u && u.stateKey === c && u.path?.[0]) {
      const n = `${u.stateKey}:${u.path.join(".")}`;
      t.getState().setSyncInfo(n, {
        timeStamp: u.timeStamp,
        userId: u.userId
      });
    }
  }, [u]);
  const y = le(
    (n) => {
      const a = n ? { ...re(c), ...n } : re(c), d = a?.defaultState || l || e;
      if (a?.serverState?.status === "success" && a?.serverState?.data !== void 0)
        return {
          value: a.serverState.data,
          source: "server",
          timestamp: a.serverState.timestamp || Date.now()
        };
      if (a?.localStorage?.key && M) {
        const f = te(a.localStorage.key) ? a.localStorage.key(d) : a.localStorage.key, C = Se(
          `${M}-${c}-${f}`
        );
        if (C && C.lastUpdated > (a?.serverState?.timestamp || 0))
          return {
            value: C.state,
            source: "localStorage",
            timestamp: C.lastUpdated
          };
      }
      return {
        value: d || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [c, l, e, M]
  );
  Q(() => {
    t.getState().setServerStateUpdate(c, T);
  }, [T, c]), Q(() => t.getState().subscribeToPath(c, (r) => {
    if (r?.type === "SERVER_STATE_UPDATE") {
      const a = r.serverState;
      if (a?.status === "success" && a.data !== void 0) {
        me(c, { serverState: a });
        const m = typeof a.merge == "object" ? a.merge : a.merge === !0 ? {} : null, f = t.getState().getShadowValue(c), C = a.data;
        if (m && Array.isArray(f) && Array.isArray(C)) {
          const $ = m.key || "id", U = new Set(
            f.map((O) => O[$])
          ), j = C.filter((O) => !U.has(O[$]));
          j.length > 0 && j.forEach((O) => {
            t.getState().insertShadowArrayElement(c, [], O);
            const N = t.getState().getShadowMetadata(c, []);
            if (N?.arrayKeys) {
              const L = N.arrayKeys[N.arrayKeys.length - 1];
              if (L) {
                const B = L.split(".").slice(1);
                t.getState().setShadowMetadata(c, B, {
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: a.timestamp || Date.now()
                });
                const V = t.getState().getShadowValue(L);
                V && typeof V == "object" && !Array.isArray(V) && Object.keys(V).forEach((b) => {
                  const R = [...B, b];
                  t.getState().setShadowMetadata(c, R, {
                    isDirty: !1,
                    stateSource: "server",
                    lastServerSync: a.timestamp || Date.now()
                  });
                });
              }
            }
          });
        } else
          t.getState().initializeShadowState(c, C), we(
            c,
            [],
            C,
            a.timestamp
          );
        const D = t.getState().getShadowMetadata(c, []);
        t.getState().setShadowMetadata(c, [], {
          ...D,
          stateSource: "server",
          lastServerSync: a.timestamp || Date.now(),
          isDirty: !1
        });
      }
    }
  }), [c, y]), Q(() => {
    const n = t.getState().getShadowMetadata(c, []);
    if (n && n.stateSource)
      return;
    const r = re(c);
    if (r?.defaultState !== void 0 || l !== void 0) {
      const a = r?.defaultState || l;
      r?.defaultState || me(c, {
        defaultState: a
      });
      const { value: d, source: m, timestamp: f } = y();
      t.getState().initializeShadowState(c, d), t.getState().setShadowMetadata(c, [], {
        stateSource: m,
        lastServerSync: m === "server" ? f : void 0,
        isDirty: !1,
        baseServerState: m === "server" ? d : void 0
      }), ie(c);
    }
  }, [c, ...A || []]), fe(() => {
    W && me(c, {
      formElements: S,
      defaultState: l,
      localStorage: h,
      middleware: F.current?.middleware
    });
    const n = `${c}////${G.current}`, r = t.getState().getShadowMetadata(c, []), a = r?.components || /* @__PURE__ */ new Map();
    return a.set(n, {
      forceUpdate: () => g({}),
      reactiveType: I ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: p || void 0,
      deps: p ? p(t.getState().getShadowValue(c)) : [],
      prevDeps: p ? p(t.getState().getShadowValue(c)) : []
    }), t.getState().setShadowMetadata(c, [], {
      ...r,
      components: a
    }), g({}), () => {
      const d = t.getState().getShadowMetadata(c, []), m = d?.components?.get(n);
      m?.paths && m.paths.forEach((f) => {
        const D = f.split(".").slice(1), $ = t.getState().getShadowMetadata(c, D);
        $?.pathComponents && $.pathComponents.size === 0 && (delete $.pathComponents, t.getState().setShadowMetadata(c, D, $));
      }), d?.components && t.getState().setShadowMetadata(c, [], d);
    };
  }, []);
  const ee = z(null), K = (n, r, a, d) => {
    const m = [c, ...r].join(".");
    if (Array.isArray(r)) {
      const V = `${c}-${r.join(".")}`;
      Y.current.add(V);
    }
    const f = t.getState(), C = f.getShadowMetadata(c, r), D = f.getShadowValue(m), $ = a.updateType === "insert" && te(n) ? n({ state: D, uuid: ae() }) : te(n) ? n(D) : n, j = {
      timeStamp: Date.now(),
      stateKey: c,
      path: r,
      updateType: a.updateType,
      status: "new",
      oldValue: D,
      newValue: $
    };
    switch (a.updateType) {
      case "insert": {
        f.insertShadowArrayElement(c, r, j.newValue), f.markAsDirty(c, r, { bubble: !0 });
        const V = f.getShadowMetadata(c, r);
        if (V?.arrayKeys) {
          const b = V.arrayKeys[V.arrayKeys.length - 1];
          if (b) {
            const R = b.split(".").slice(1);
            f.markAsDirty(c, R, { bubble: !1 });
          }
        }
        break;
      }
      case "cut": {
        const V = r.slice(0, -1);
        f.removeShadowArrayElement(c, r), f.markAsDirty(c, V, { bubble: !0 });
        break;
      }
      case "update": {
        f.updateShadowAtPath(c, r, j.newValue), f.markAsDirty(c, r, { bubble: !0 });
        break;
      }
    }
    if (ee.current && ee.current.connected && ee.current.updateState({ operation: j }), C?.signals && C.signals.length > 0) {
      const V = a.updateType === "cut" ? null : $;
      C.signals.forEach(({ parentId: b, position: R, effect: v }) => {
        const w = document.querySelector(`[data-parent-id="${b}"]`);
        if (w) {
          const P = Array.from(w.childNodes);
          if (P[R]) {
            let _ = V;
            if (v && V !== null)
              try {
                _ = new Function(
                  "state",
                  `return (${v})(state)`
                )(V);
              } catch (k) {
                console.error("Error evaluating effect function:", k);
              }
            _ != null && typeof _ == "object" && (_ = JSON.stringify(_)), P[R].textContent = String(_ ?? "");
          }
        }
      });
    }
    if (a.updateType === "insert" && C?.mapWrappers && C.mapWrappers.length > 0) {
      const V = f.getShadowMetadata(c, r)?.arrayKeys || [], b = V[V.length - 1], R = f.getShadowValue(b), v = f.getShadowValue(
        [c, ...r].join(".")
      );
      if (!b || R === void 0) return;
      C.mapWrappers.forEach((w) => {
        let P = !0, _ = -1;
        if (w.meta?.transforms && w.meta.transforms.length > 0) {
          for (const k of w.meta.transforms)
            if (k.type === "filter" && !k.fn(R, -1)) {
              P = !1;
              break;
            }
          if (P) {
            const k = Ie(
              c,
              r,
              w.meta.transforms
            ), q = w.meta.transforms.find(
              (H) => H.type === "sort"
            );
            if (q) {
              const H = k.map((J) => ({
                key: J,
                value: f.getShadowValue(J)
              }));
              H.push({ key: b, value: R }), H.sort((J, Z) => q.fn(J.value, Z.value)), _ = H.findIndex(
                (J) => J.key === b
              );
            } else
              _ = k.length;
          }
        } else
          P = !0, _ = V.length - 1;
        if (P && w.containerRef && w.containerRef.isConnected) {
          const k = document.createElement("div");
          k.setAttribute("data-item-path", b);
          const q = Array.from(w.containerRef.children);
          _ >= 0 && _ < q.length ? w.containerRef.insertBefore(
            k,
            q[_]
          ) : w.containerRef.appendChild(k);
          const H = Ce(k), J = ae(), Z = b.split(".").slice(1), de = w.rebuildStateShape({
            path: w.path,
            currentState: v,
            componentId: w.componentId,
            meta: w.meta
          });
          H.render(
            ue(Me, {
              stateKey: c,
              itemComponentId: J,
              itemPath: Z,
              localIndex: _,
              arraySetter: de,
              rebuildStateShape: w.rebuildStateShape,
              renderFn: w.mapFn
            })
          );
        }
      });
    }
    if (a.updateType === "cut") {
      const V = r.slice(0, -1), b = f.getShadowMetadata(c, V);
      b?.mapWrappers && b.mapWrappers.length > 0 && b.mapWrappers.forEach((R) => {
        if (R.containerRef && R.containerRef.isConnected) {
          const v = R.containerRef.querySelector(
            `[data-item-path="${m}"]`
          );
          v && v.remove();
        }
      });
    }
    a.updateType === "update" && (d || F.current?.validation?.key) && r && se(
      (d || F.current?.validation?.key) + "." + r.join(".")
    );
    const O = r.slice(0, r.length - 1);
    a.updateType === "cut" && F.current?.validation?.key && se(
      F.current?.validation?.key + "." + O.join(".")
    ), a.updateType === "insert" && F.current?.validation?.key && Le(
      F.current?.validation?.key + "." + O.join(".")
    ).filter((b) => {
      let R = b?.split(".").length;
      const v = "";
      if (b == O.join(".") && R == O.length - 1) {
        let w = b + "." + O;
        se(b), ve(w, v);
      }
    });
    const N = t.getState().getShadowValue(c), L = t.getState().getShadowMetadata(c, []), B = /* @__PURE__ */ new Set();
    if (console.log(
      "rootMeta",
      c,
      t.getState().shadowStateStore
    ), !L?.components)
      return N;
    if (a.updateType === "update") {
      let V = [...r];
      for (; ; ) {
        const b = f.getShadowMetadata(c, V);
        if (b?.pathComponents && b.pathComponents.forEach((R) => {
          if (B.has(R))
            return;
          const v = L.components?.get(R);
          v && ((Array.isArray(v.reactiveType) ? v.reactiveType : [v.reactiveType || "component"]).includes("none") || (v.forceUpdate(), B.add(R)));
        }), V.length === 0)
          break;
        V.pop();
      }
      $ && typeof $ == "object" && !Te($) && D && typeof D == "object" && !Te(D) && Pe($, D).forEach((R) => {
        const v = R.split("."), w = [...r, ...v], P = f.getShadowMetadata(c, w);
        P?.pathComponents && P.pathComponents.forEach((_) => {
          if (B.has(_))
            return;
          const k = L.components?.get(_);
          k && ((Array.isArray(k.reactiveType) ? k.reactiveType : [k.reactiveType || "component"]).includes("none") || (k.forceUpdate(), B.add(_)));
        });
      });
    } else if (a.updateType === "insert" || a.updateType === "cut") {
      const V = a.updateType === "insert" ? r : r.slice(0, -1), b = f.getShadowMetadata(c, V);
      if (b?.signals && b.signals.length > 0) {
        const R = [c, ...V].join("."), v = f.getShadowValue(R);
        b.signals.forEach(({ parentId: w, position: P, effect: _ }) => {
          const k = document.querySelector(
            `[data-parent-id="${w}"]`
          );
          if (k) {
            const q = Array.from(k.childNodes);
            if (q[P]) {
              let H = v;
              if (_)
                try {
                  H = new Function(
                    "state",
                    `return (${_})(state)`
                  )(v);
                } catch (J) {
                  console.error("Error evaluating effect function:", J), H = v;
                }
              H != null && typeof H == "object" && (H = JSON.stringify(H)), q[P].textContent = String(H ?? "");
            }
          }
        });
      }
      b?.pathComponents && b.pathComponents.forEach((R) => {
        if (!B.has(R)) {
          const v = L.components?.get(R);
          v && (v.forceUpdate(), B.add(R));
        }
      });
    }
    return L.components.forEach((V, b) => {
      if (B.has(b))
        return;
      const R = Array.isArray(V.reactiveType) ? V.reactiveType : [V.reactiveType || "component"];
      if (R.includes("all")) {
        V.forceUpdate(), B.add(b);
        return;
      }
      if (R.includes("deps") && V.depsFunction) {
        const v = f.getShadowValue(c), w = V.depsFunction(v);
        let P = !1;
        w === !0 ? P = !0 : Array.isArray(w) && (ce(V.prevDeps, w) || (V.prevDeps = w, P = !0)), P && (V.forceUpdate(), B.add(b));
      }
    }), B.clear(), We(c, (V) => {
      const b = [...V ?? [], j], R = /* @__PURE__ */ new Map();
      return b.forEach((v) => {
        const w = `${v.stateKey}:${JSON.stringify(v.path)}`, P = R.get(w);
        P ? (P.timeStamp = Math.max(P.timeStamp, v.timeStamp), P.newValue = v.newValue, P.oldValue = P.oldValue ?? v.oldValue, P.updateType = v.updateType) : R.set(w, { ...v });
      }), Array.from(R.values());
    }), He(
      $,
      c,
      F.current,
      M
    ), F.current?.middleware && F.current.middleware({
      updateLog: x,
      update: j
    }), N;
  };
  t.getState().initialStateGlobal[c] || $e(c, e);
  const ne = ge(() => De(
    c,
    K,
    G.current,
    M
  ), [c, M]), o = F.current?.cogsSync;
  return o && (ee.current = o(ne)), ne;
}
function qe(e) {
  return !e || e.length === 0 ? "" : e.map(
    (i) => (
      // Safely stringify dependencies. An empty array becomes '[]'.
      `${i.type}${JSON.stringify(i.dependencies || [])}`
    )
  ).join("");
}
const Ie = (e, i, h) => {
  let S = t.getState().getShadowMetadata(e, i)?.arrayKeys || [];
  if (!h || h.length === 0)
    return S;
  let p = S.map((I) => ({
    key: I,
    value: t.getState().getShadowValue(I)
  }));
  for (const I of h)
    I.type === "filter" ? p = p.filter(
      ({ value: E }, l) => I.fn(E, l)
    ) : I.type === "sort" && p.sort((E, l) => I.fn(E.value, l.value));
  return p.map(({ key: I }) => I);
}, be = (e, i, h) => {
  const S = `${e}////${i}`, { addPathComponent: p, getShadowMetadata: I } = t.getState(), l = I(e, [])?.components?.get(S);
  !l || l.reactiveType === "none" || !(Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType]).includes("component") || p(e, h, S);
}, ye = (e, i, h) => {
  const S = t.getState(), p = S.getShadowMetadata(e, []), I = /* @__PURE__ */ new Set();
  p?.components && p.components.forEach((l, u) => {
    (Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType || "component"]).includes("all") && (l.forceUpdate(), I.add(u));
  }), S.getShadowMetadata(e, [...i, "getSelected"])?.pathComponents?.forEach((l) => {
    p?.components?.get(l)?.forceUpdate();
  });
  const E = S.getShadowMetadata(e, i);
  for (let l of E?.arrayKeys || []) {
    const u = l + ".selected", A = S.getShadowMetadata(
      e,
      u.split(".").slice(1)
    );
    l == h && A?.pathComponents?.forEach((T) => {
      p?.components?.get(T)?.forceUpdate();
    });
  }
};
function De(e, i, h, S) {
  const p = /* @__PURE__ */ new Map();
  let I = 0;
  const E = (T) => {
    const s = T.join(".");
    for (const [g] of p)
      (g === s || g.startsWith(s + ".")) && p.delete(g);
    I++;
  };
  function l({
    currentState: T,
    path: s = [],
    meta: g,
    componentId: M
  }) {
    const W = s.map(String).join("."), c = [e, ...s].join(".");
    T = t.getState().getShadowValue(c, g?.validIds);
    const x = function() {
      return t().getShadowValue(e, s);
    }, Y = {
      apply(F, y, ee) {
      },
      get(F, y) {
        if (y === "_rebuildStateShape")
          return l;
        if (Object.getOwnPropertyNames(u).includes(y) && s.length === 0)
          return u[y];
        if (y === "getDifferences")
          return () => {
            const o = t.getState().getShadowMetadata(e, []), n = t.getState().getShadowValue(e);
            let r;
            return o?.stateSource === "server" && o.baseServerState ? r = o.baseServerState : r = t.getState().initialStateGlobal[e], Pe(n, r);
          };
        if (y === "sync" && s.length === 0)
          return async function() {
            const o = t.getState().getInitialOptions(e), n = o?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const r = t.getState().getShadowValue(e, []), a = o?.validation?.key;
            try {
              const d = await n.action(r);
              if (d && !d.success && d.errors && a && (t.getState().removeValidationError(a), d.errors.forEach((m) => {
                const f = [a, ...m.path].join(".");
                t.getState().addValidationError(f, m.message);
              }), ie(e)), d?.success) {
                const m = t.getState().getShadowMetadata(e, []);
                t.getState().setShadowMetadata(e, [], {
                  ...m,
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
          const o = () => {
            const n = t.getState().getShadowMetadata(e, s), r = t.getState().getShadowValue(c);
            return n?.isDirty === !0 ? "dirty" : n?.isDirty === !1 || n?.stateSource === "server" ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" ? "fresh" : t.getState().getShadowMetadata(e, [])?.stateSource === "server" && !n?.isDirty ? "synced" : r !== void 0 && !n ? "fresh" : "unknown";
          };
          return y === "_status" ? o() : o;
        }
        if (y === "removeStorage")
          return () => {
            const o = t.getState().initialStateGlobal[e], n = re(e), r = te(n?.localStorage?.key) ? n.localStorage.key(o) : n?.localStorage?.key, a = `${S}-${e}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (y === "showValidationErrors")
          return () => {
            const o = t.getState().getInitialOptions(e)?.validation;
            if (!o?.key) throw new Error("Validation key not found");
            return t.getState().getValidationErrors(o.key + "." + s.join("."));
          };
        if (Array.isArray(T)) {
          if (y === "getSelected")
            return () => {
              const o = e + "." + s.join(".");
              be(e, M, [
                ...s,
                "getSelected"
              ]);
              const n = t.getState().selectedIndicesMap;
              if (!n || !n.has(o))
                return;
              const r = n.get(o);
              if (g?.validIds && !g.validIds.includes(r))
                return;
              const a = t.getState().getShadowValue(r);
              if (a)
                return l({
                  currentState: a,
                  path: r.split(".").slice(1),
                  componentId: M
                });
            };
          if (y === "getSelectedIndex")
            return () => t.getState().getSelectedIndex(
              e + "." + s.join("."),
              g?.validIds
            );
          if (y === "clearSelected")
            return ye(e, s), () => {
              t.getState().clearSelectedIndex({
                arrayKey: e + "." + s.join(".")
              });
            };
          if (y === "useVirtualView")
            return (o) => {
              const {
                itemHeight: n = 50,
                overscan: r = 6,
                stickToBottom: a = !1,
                scrollStickTolerance: d = 75
              } = o, m = z(null), [f, C] = X({
                startIndex: 0,
                endIndex: 10
              }), [D, $] = X({}), U = z(!0), j = z({
                isUserScrolling: !1,
                lastScrollTop: 0,
                scrollUpCount: 0,
                isNearBottom: !0
              }), O = z(
                /* @__PURE__ */ new Map()
              );
              fe(() => {
                if (!a || !m.current || j.current.isUserScrolling)
                  return;
                const v = m.current;
                v.scrollTo({
                  top: v.scrollHeight,
                  behavior: U.current ? "instant" : "smooth"
                });
              }, [D, a]);
              const N = t.getState().getShadowMetadata(e, s)?.arrayKeys || [], { totalHeight: L, itemOffsets: B } = ge(() => {
                let v = 0;
                const w = /* @__PURE__ */ new Map();
                return (t.getState().getShadowMetadata(e, s)?.arrayKeys || []).forEach((_) => {
                  const k = _.split(".").slice(1), q = t.getState().getShadowMetadata(e, k)?.virtualizer?.itemHeight || n;
                  w.set(_, {
                    height: q,
                    offset: v
                  }), v += q;
                }), O.current = w, { totalHeight: v, itemOffsets: w };
              }, [N.length, n]);
              fe(() => {
                if (a && N.length > 0 && m.current && !j.current.isUserScrolling && U.current) {
                  const v = m.current, w = () => {
                    if (v.clientHeight > 0) {
                      const P = Math.ceil(
                        v.clientHeight / n
                      ), _ = N.length - 1, k = Math.max(
                        0,
                        _ - P - r
                      );
                      C({ startIndex: k, endIndex: _ }), requestAnimationFrame(() => {
                        b("instant"), U.current = !1;
                      });
                    } else
                      requestAnimationFrame(w);
                  };
                  w();
                }
              }, [N.length, a, n, r]);
              const V = le(() => {
                const v = m.current;
                if (!v) return;
                const w = v.scrollTop, { scrollHeight: P, clientHeight: _ } = v, k = j.current, q = P - (w + _), H = k.isNearBottom;
                k.isNearBottom = q <= d, w < k.lastScrollTop ? (k.scrollUpCount++, k.scrollUpCount > 3 && H && (k.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : k.isNearBottom && (k.isUserScrolling = !1, k.scrollUpCount = 0), k.lastScrollTop = w;
                let J = 0;
                for (let Z = 0; Z < N.length; Z++) {
                  const de = N[Z], he = O.current.get(de);
                  if (he && he.offset + he.height > w) {
                    J = Z;
                    break;
                  }
                }
                if (J !== f.startIndex) {
                  const Z = Math.ceil(_ / n);
                  C({
                    startIndex: Math.max(0, J - r),
                    endIndex: Math.min(
                      N.length - 1,
                      J + Z + r
                    )
                  });
                }
              }, [
                N.length,
                f.startIndex,
                n,
                r,
                d
              ]);
              Q(() => {
                const v = m.current;
                if (!(!v || !a))
                  return v.addEventListener("scroll", V, {
                    passive: !0
                  }), () => {
                    v.removeEventListener("scroll", V);
                  };
              }, [V, a]);
              const b = le(
                (v = "smooth") => {
                  const w = m.current;
                  if (!w) return;
                  j.current.isUserScrolling = !1, j.current.isNearBottom = !0, j.current.scrollUpCount = 0;
                  const P = () => {
                    const _ = (k = 0) => {
                      if (k > 5) return;
                      const q = w.scrollHeight, H = w.scrollTop, J = w.clientHeight;
                      H + J >= q - 1 || (w.scrollTo({
                        top: q,
                        behavior: v
                      }), setTimeout(() => {
                        const Z = w.scrollHeight, de = w.scrollTop;
                        (Z !== q || de + J < Z - 1) && _(k + 1);
                      }, 50));
                    };
                    _();
                  };
                  "requestIdleCallback" in window ? requestIdleCallback(P, { timeout: 100 }) : requestAnimationFrame(() => {
                    requestAnimationFrame(P);
                  });
                },
                []
              );
              return Q(() => {
                if (!a || !m.current) return;
                const v = m.current, w = j.current;
                let P;
                const _ = () => {
                  clearTimeout(P), P = setTimeout(() => {
                    !w.isUserScrolling && w.isNearBottom && b(
                      U.current ? "instant" : "smooth"
                    );
                  }, 100);
                }, k = new MutationObserver(() => {
                  w.isUserScrolling || _();
                });
                k.observe(v, {
                  childList: !0,
                  subtree: !0,
                  attributes: !0,
                  attributeFilter: ["style", "class"]
                  // More specific than just 'height'
                });
                const q = (H) => {
                  H.target instanceof HTMLImageElement && !w.isUserScrolling && _();
                };
                return v.addEventListener("load", q, !0), U.current ? setTimeout(() => {
                  b("instant");
                }, 0) : _(), () => {
                  clearTimeout(P), k.disconnect(), v.removeEventListener("load", q, !0);
                };
              }, [a, N.length, b]), {
                virtualState: ge(() => {
                  const v = t.getState(), w = v.getShadowValue(
                    [e, ...s].join(".")
                  ), P = v.getShadowMetadata(e, s)?.arrayKeys || [], _ = w.slice(
                    f.startIndex,
                    f.endIndex + 1
                  ), k = P.slice(
                    f.startIndex,
                    f.endIndex + 1
                  );
                  return l({
                    currentState: _,
                    path: s,
                    componentId: M,
                    meta: { ...g, validIds: k }
                  });
                }, [f.startIndex, f.endIndex, N.length]),
                virtualizerProps: {
                  outer: {
                    ref: m,
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
                      transform: `translateY(${O.current.get(
                        N[f.startIndex]
                      )?.offset || 0}px)`
                    }
                  }
                },
                scrollToBottom: b,
                scrollToIndex: (v, w = "smooth") => {
                  if (m.current && N[v]) {
                    const P = O.current.get(N[v])?.offset || 0;
                    m.current.scrollTo({ top: P, behavior: w });
                  }
                }
              };
            };
          if (y === "stateMap")
            return (o) => {
              const [n, r] = X(
                g?.validIds ?? t.getState().getShadowMetadata(e, s)?.arrayKeys
              ), a = t.getState().getShadowValue(c, g?.validIds);
              if (!n)
                throw new Error("No array keys found for mapping");
              const d = l({
                currentState: a,
                path: s,
                componentId: M,
                meta: g
              });
              return a.map((m, f) => {
                const C = n[f]?.split(".").slice(1), D = l({
                  currentState: m,
                  path: C,
                  componentId: M,
                  meta: g
                });
                return o(
                  D,
                  f,
                  d
                );
              });
            };
          if (y === "$stateMap")
            return (o) => ue(ze, {
              proxy: {
                _stateKey: e,
                _path: s,
                _mapFn: o,
                _meta: g
              },
              rebuildStateShape: l
            });
          if (y === "stateFind")
            return (o) => {
              const n = g?.validIds ?? t.getState().getShadowMetadata(e, s)?.arrayKeys;
              if (n)
                for (let r = 0; r < n.length; r++) {
                  const a = n[r];
                  if (!a) continue;
                  const d = t.getState().getShadowValue(a);
                  if (o(d, r)) {
                    const m = a.split(".").slice(1);
                    return l({
                      currentState: d,
                      path: m,
                      componentId: M,
                      meta: g
                      // Pass along meta for potential further chaining
                    });
                  }
                }
            };
          if (y === "stateFilter")
            return (o) => {
              const n = g?.validIds ?? t.getState().getShadowMetadata(e, s)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for filtering.");
              const r = [], a = T.filter(
                (d, m) => o(d, m) ? (r.push(n[m]), !0) : !1
              );
              return l({
                currentState: a,
                path: s,
                componentId: M,
                meta: {
                  validIds: r,
                  transforms: [
                    ...g?.transforms || [],
                    {
                      type: "filter",
                      fn: o
                    }
                  ]
                }
              });
            };
          if (y === "stateSort")
            return (o) => {
              const n = g?.validIds ?? t.getState().getShadowMetadata(e, s)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for sorting");
              const r = T.map((a, d) => ({
                item: a,
                key: n[d]
              }));
              return r.sort((a, d) => o(a.item, d.item)).filter(Boolean), l({
                currentState: r.map((a) => a.item),
                path: s,
                componentId: M,
                meta: {
                  validIds: r.map((a) => a.key),
                  transforms: [
                    ...g?.transforms || [],
                    { type: "sort", fn: o }
                  ]
                }
              });
            };
          if (y === "stream")
            return function(o = {}) {
              const {
                bufferSize: n = 100,
                flushInterval: r = 100,
                bufferStrategy: a = "accumulate",
                store: d,
                onFlush: m
              } = o;
              let f = [], C = !1, D = null;
              const $ = (L) => {
                if (!C) {
                  if (a === "sliding" && f.length >= n)
                    f.shift();
                  else if (a === "dropping" && f.length >= n)
                    return;
                  f.push(L), f.length >= n && U();
                }
              }, U = () => {
                if (f.length === 0) return;
                const L = [...f];
                if (f = [], d) {
                  const B = d(L);
                  B !== void 0 && (Array.isArray(B) ? B : [B]).forEach((b) => {
                    i(b, s, {
                      updateType: "insert"
                    });
                  });
                } else
                  L.forEach((B) => {
                    i(B, s, {
                      updateType: "insert"
                    });
                  });
                m?.(L);
              };
              r > 0 && (D = setInterval(U, r));
              const j = ae(), O = t.getState().getShadowMetadata(e, s) || {}, N = O.streams || /* @__PURE__ */ new Map();
              return N.set(j, { buffer: f, flushTimer: D }), t.getState().setShadowMetadata(e, s, {
                ...O,
                streams: N
              }), {
                write: (L) => $(L),
                writeMany: (L) => L.forEach($),
                flush: () => U(),
                pause: () => {
                  C = !0;
                },
                resume: () => {
                  C = !1, f.length > 0 && U();
                },
                close: () => {
                  U(), D && clearInterval(D);
                  const L = t.getState().getShadowMetadata(e, s);
                  L?.streams && L.streams.delete(j);
                }
              };
            };
          if (y === "stateList")
            return (o) => /* @__PURE__ */ oe(() => {
              const r = z(/* @__PURE__ */ new Map()), a = g?.transforms && g.transforms.length > 0 ? `${M}-${qe(g.transforms)}` : `${M}-base`, [d, m] = X({}), { validIds: f, arrayValues: C } = ge(() => {
                const $ = t.getState().getShadowMetadata(e, s)?.transformCaches?.get(a);
                let U;
                $ && $.validIds ? U = $.validIds : (U = Ie(
                  e,
                  s,
                  g?.transforms
                ), t.getState().setTransformCache(e, s, a, {
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
              if (console.log("freshValues", f, C), Q(() => {
                const $ = t.getState().subscribeToPath(c, (U) => {
                  if (U.type === "GET_SELECTED")
                    return;
                  const O = t.getState().getShadowMetadata(e, s)?.transformCaches;
                  if (O)
                    for (const N of O.keys())
                      N.startsWith(M) && O.delete(N);
                  (U.type === "INSERT" || U.type === "REMOVE" || U.type === "CLEAR_SELECTION") && m({});
                });
                return () => {
                  $();
                };
              }, [M, c]), !Array.isArray(C))
                return null;
              const D = l({
                currentState: C,
                path: s,
                componentId: M,
                meta: {
                  ...g,
                  validIds: f
                }
              });
              return console.log("sssssssssssssssssssssssssssss", D), /* @__PURE__ */ oe(Ae, { children: C.map(($, U) => {
                const j = f[U];
                if (!j)
                  return null;
                let O = r.current.get(j);
                O || (O = ae(), r.current.set(j, O));
                const N = j.split(".").slice(1);
                return ue(Me, {
                  key: j,
                  stateKey: e,
                  itemComponentId: O,
                  itemPath: N,
                  localIndex: U,
                  arraySetter: D,
                  rebuildStateShape: l,
                  renderFn: o
                });
              }) });
            }, {});
          if (y === "stateFlattenOn")
            return (o) => {
              const n = T;
              p.clear(), I++;
              const r = n.flatMap(
                (a) => a[o] ?? []
              );
              return l({
                currentState: r,
                path: [...s, "[*]", o],
                componentId: M,
                meta: g
              });
            };
          if (y === "index")
            return (o) => {
              const r = t.getState().getShadowMetadata(e, s)?.arrayKeys?.filter(
                (m) => !g?.validIds || g?.validIds && g?.validIds?.includes(m)
              )?.[o];
              if (!r) return;
              const a = t.getState().getShadowValue(r, g?.validIds);
              return l({
                currentState: a,
                path: r.split(".").slice(1),
                componentId: M,
                meta: g
              });
            };
          if (y === "last")
            return () => {
              const o = t.getState().getShadowValue(e, s);
              if (o.length === 0) return;
              const n = o.length - 1, r = o[n], a = [...s, n.toString()];
              return l({
                currentState: r,
                path: a,
                componentId: M,
                meta: g
              });
            };
          if (y === "insert")
            return (o, n) => (i(o, s, { updateType: "insert" }), l({
              currentState: t.getState().getShadowValue(e, s),
              path: s,
              componentId: M,
              meta: g
            }));
          if (y === "uniqueInsert")
            return (o, n, r) => {
              const a = t.getState().getShadowValue(e, s), d = te(o) ? o(a) : o;
              let m = null;
              if (!a.some((C) => {
                const D = n ? n.every(
                  ($) => ce(C[$], d[$])
                ) : ce(C, d);
                return D && (m = C), D;
              }))
                E(s), i(d, s, { updateType: "insert" });
              else if (r && m) {
                const C = r(m), D = a.map(
                  ($) => ce($, m) ? C : $
                );
                E(s), i(D, s, {
                  updateType: "update"
                });
              }
            };
          if (y === "cut")
            return (o, n) => {
              const r = g?.validIds ?? t.getState().getShadowMetadata(e, s)?.arrayKeys;
              if (!r || r.length === 0) return;
              const a = o == -1 ? r.length - 1 : o !== void 0 ? o : r.length - 1, d = r[a];
              if (!d) return;
              const m = d.split(".").slice(1);
              i(T, m, {
                updateType: "cut"
              });
            };
          if (y === "cutSelected")
            return () => {
              t.getState().getShadowMetadata(e, s)?.arrayKeys;
              const o = Ie(
                e,
                s,
                g?.transforms
              );
              if (console.log("validKeys", o), !o || o.length === 0) return;
              const n = t.getState().selectedIndicesMap.get(c);
              let r = o.findIndex(
                (d) => d === n
              );
              console.log("indexToCut", r);
              const a = o[r == -1 ? o.length - 1 : r]?.split(".").slice(1);
              console.log("pathForCut", a), i(T, a, {
                updateType: "cut"
              });
            };
          if (y === "cutByValue")
            return (o) => {
              const n = t.getState().getShadowMetadata(e, s), r = g?.validIds ?? n?.arrayKeys;
              if (!r) return;
              let a = null;
              for (const d of r)
                if (t.getState().getShadowValue(d) === o) {
                  a = d;
                  break;
                }
              if (a) {
                const d = a.split(".").slice(1);
                i(null, d, { updateType: "cut" });
              }
            };
          if (y === "toggleByValue")
            return (o) => {
              const n = t.getState().getShadowMetadata(e, s), r = g?.validIds ?? n?.arrayKeys;
              if (!r) return;
              let a = null;
              for (const d of r) {
                const m = t.getState().getShadowValue(d);
                if (console.log("itemValue sdasdasdasd", m), m === o) {
                  a = d;
                  break;
                }
              }
              if (console.log("itemValue keyToCut", a), a) {
                const d = a.split(".").slice(1);
                console.log("itemValue keyToCut", a), i(o, d, {
                  updateType: "cut"
                });
              } else
                i(o, s, { updateType: "insert" });
            };
          if (y === "findWith")
            return (o, n) => {
              const r = t.getState().getShadowMetadata(e, s)?.arrayKeys;
              if (!r)
                throw new Error("No array keys found for sorting");
              let a = null, d = [];
              for (const m of r) {
                let f = t.getState().getShadowValue(m, g?.validIds);
                if (f && f[o] === n) {
                  a = f, d = m.split(".").slice(1);
                  break;
                }
              }
              return l({
                currentState: a,
                path: d,
                componentId: M,
                meta: g
              });
            };
        }
        if (y === "cut") {
          let o = t.getState().getShadowValue(s.join("."));
          return () => {
            i(o, s, { updateType: "cut" });
          };
        }
        if (y === "get")
          return () => (be(e, M, s), t.getState().getShadowValue(c, g?.validIds));
        if (y === "getState")
          return () => t.getState().getShadowValue(c, g?.validIds);
        if (y === "$derive")
          return (o) => ke({
            _stateKey: e,
            _path: s,
            _effect: o.toString(),
            _meta: g
          });
        if (y === "$get")
          return () => ke({ _stateKey: e, _path: s, _meta: g });
        if (y === "lastSynced") {
          const o = `${e}:${s.join(".")}`;
          return t.getState().getSyncInfo(o);
        }
        if (y == "getLocalStorage")
          return (o) => Se(S + "-" + e + "-" + o);
        if (y === "isSelected") {
          const o = [e, ...s].slice(0, -1);
          if (ye(e, s, void 0), Array.isArray(
            t.getState().getShadowValue(o.join("."), g?.validIds)
          )) {
            s[s.length - 1];
            const n = o.join("."), r = t.getState().selectedIndicesMap.get(n), a = e + "." + s.join(".");
            return r === a;
          }
          return;
        }
        if (y === "setSelected")
          return (o) => {
            const n = s.slice(0, -1), r = e + "." + n.join("."), a = e + "." + s.join(".");
            ye(e, n, void 0), t.getState().selectedIndicesMap.get(r), o && t.getState().setSelectedIndex(r, a);
          };
        if (y === "toggleSelected")
          return () => {
            const o = s.slice(0, -1), n = e + "." + o.join("."), r = e + "." + s.join(".");
            t.getState().selectedIndicesMap.get(n) === r ? t.getState().clearSelectedIndex({ arrayKey: n }) : t.getState().setSelectedIndex(n, r);
          };
        if (y === "_componentId")
          return M;
        if (s.length == 0) {
          if (y === "addValidation")
            return (o) => {
              const n = t.getState().getInitialOptions(e)?.validation;
              if (!n?.key) throw new Error("Validation key not found");
              se(n.key), o.forEach((r) => {
                const a = [n.key, ...r.path].join(".");
                ve(a, r.message);
              }), ie(e);
            };
          if (y === "applyJsonPatch")
            return (o) => {
              const n = t.getState(), r = n.getShadowMetadata(e, []);
              if (!r?.components) return;
              const a = (m) => !m || m === "/" ? [] : m.split("/").slice(1).map((f) => f.replace(/~1/g, "/").replace(/~0/g, "~")), d = /* @__PURE__ */ new Set();
              for (const m of o) {
                const f = a(m.path);
                switch (m.op) {
                  case "add":
                  case "replace": {
                    const { value: C } = m;
                    n.updateShadowAtPath(e, f, C), n.markAsDirty(e, f, { bubble: !0 });
                    let D = [...f];
                    for (; ; ) {
                      const $ = n.getShadowMetadata(
                        e,
                        D
                      );
                      if (console.log("pathMeta", $), $?.pathComponents && $.pathComponents.forEach((U) => {
                        if (!d.has(U)) {
                          const j = r.components?.get(U);
                          j && (j.forceUpdate(), d.add(U));
                        }
                      }), D.length === 0) break;
                      D.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const C = f.slice(0, -1);
                    n.removeShadowArrayElement(e, f), n.markAsDirty(e, C, { bubble: !0 });
                    let D = [...C];
                    for (; ; ) {
                      const $ = n.getShadowMetadata(
                        e,
                        D
                      );
                      if ($?.pathComponents && $.pathComponents.forEach((U) => {
                        if (!d.has(U)) {
                          const j = r.components?.get(U);
                          j && (j.forceUpdate(), d.add(U));
                        }
                      }), D.length === 0) break;
                      D.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (y === "validateZodSchema")
            return () => {
              const o = t.getState().getInitialOptions(e)?.validation;
              if (!o?.zodSchema || !o?.key)
                throw new Error("Zod schema or validation key not found");
              se(o.key);
              const n = t.getState().getShadowValue(e), r = o.zodSchema.safeParse(n);
              return r.success ? !0 : (r.error.errors.forEach((a) => {
                const d = [o.key, ...a.path].join(".");
                ve(d, a.message);
              }), ie(e), !1);
            };
          if (y === "getComponents")
            return () => t.getState().getShadowMetadata(e, [])?.components;
          if (y === "getAllFormRefs")
            return () => pe.getState().getFormRefsByStateKey(e);
        }
        if (y === "getFormRef")
          return () => pe.getState().getFormRef(e + "." + s.join("."));
        if (y === "validationWrapper")
          return ({
            children: o,
            hideMessage: n
          }) => /* @__PURE__ */ oe(
            Ee,
            {
              formOpts: n ? { validation: { message: "" } } : void 0,
              path: s,
              stateKey: e,
              children: o
            }
          );
        if (y === "_stateKey") return e;
        if (y === "_path") return s;
        if (y === "update")
          return (o) => (i(o, s, { updateType: "update" }), {
            /**
             * Marks this specific item, which was just updated, as 'synced' (not dirty).
             */
            synced: () => {
              const n = t.getState().getShadowMetadata(e, s);
              t.getState().setShadowMetadata(e, s, {
                ...n,
                isDirty: !1,
                // EXPLICITLY set to false, not just undefined
                stateSource: "server",
                // Mark as coming from server
                lastServerSync: Date.now()
                // Add timestamp
              });
              const r = [e, ...s].join(".");
              t.getState().notifyPathSubscribers(r, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (y === "toggle") {
          const o = t.getState().getShadowValue([e, ...s].join("."));
          if (console.log("currentValueAtPath", o), typeof T != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            i(!o, s, {
              updateType: "update"
            });
          };
        }
        if (y === "formElement")
          return (o, n) => /* @__PURE__ */ oe(
            Ee,
            {
              formOpts: n,
              path: s,
              stateKey: e,
              children: /* @__PURE__ */ oe(
                Ze,
                {
                  stateKey: e,
                  path: s,
                  rebuildStateShape: l,
                  setState: i,
                  formOpts: n,
                  renderFn: o
                }
              )
            }
          );
        const K = [...s, y], ne = t.getState().getShadowValue(e, K);
        return l({
          currentState: ne,
          path: K,
          componentId: M,
          meta: g
        });
      }
    }, G = new Proxy(x, Y);
    return p.set(W, {
      proxy: G,
      stateVersion: I
    }), G;
  }
  const u = {
    removeValidation: (T) => {
      T?.validationKey && se(T.validationKey);
    },
    revertToInitialState: (T) => {
      const s = t.getState().getInitialOptions(e)?.validation;
      s?.key && se(s.key), T?.validationKey && se(T.validationKey);
      const g = t.getState().getShadowMetadata(e, []);
      g?.stateSource === "server" && g.baseServerState ? g.baseServerState : t.getState().initialStateGlobal[e];
      const M = t.getState().initialStateGlobal[e];
      t.getState().clearSelectedIndexesForState(e), p.clear(), I++, t.getState().initializeShadowState(e, M), l({
        currentState: M,
        path: [],
        componentId: h
      });
      const W = re(e), c = te(W?.localStorage?.key) ? W?.localStorage?.key(M) : W?.localStorage?.key, x = `${S}-${e}-${c}`;
      x && localStorage.removeItem(x);
      const Y = t.getState().getShadowMetadata(e, []);
      return Y && Y?.components?.forEach((G) => {
        G.forceUpdate();
      }), M;
    },
    updateInitialState: (T) => {
      p.clear(), I++;
      const s = De(
        e,
        i,
        h,
        S
      ), g = t.getState().initialStateGlobal[e], M = re(e), W = te(M?.localStorage?.key) ? M?.localStorage?.key(g) : M?.localStorage?.key, c = `${S}-${e}-${W}`;
      return localStorage.getItem(c) && localStorage.removeItem(c), je(() => {
        $e(e, T), t.getState().initializeShadowState(e, T);
        const x = t.getState().getShadowMetadata(e, []);
        x && x?.components?.forEach((Y) => {
          Y.forceUpdate();
        });
      }), {
        fetchId: (x) => s.get()[x]
      };
    }
  };
  return l({
    currentState: t.getState().getShadowValue(e, []),
    componentId: h,
    path: []
  });
}
function ke(e) {
  return ue(Ge, { proxy: e });
}
function ze({
  proxy: e,
  rebuildStateShape: i
}) {
  const h = z(null), S = z(`map-${crypto.randomUUID()}`), p = z(!1), I = z(/* @__PURE__ */ new Map());
  Q(() => {
    const l = h.current;
    if (!l || p.current) return;
    const u = setTimeout(() => {
      const A = t.getState().getShadowMetadata(e._stateKey, e._path) || {}, T = A.mapWrappers || [];
      T.push({
        instanceId: S.current,
        mapFn: e._mapFn,
        containerRef: l,
        rebuildStateShape: i,
        path: e._path,
        componentId: S.current,
        meta: e._meta
      }), t.getState().setShadowMetadata(e._stateKey, e._path, {
        ...A,
        mapWrappers: T
      }), p.current = !0, E();
    }, 0);
    return () => {
      if (clearTimeout(u), S.current) {
        const A = t.getState().getShadowMetadata(e._stateKey, e._path) || {};
        A.mapWrappers && (A.mapWrappers = A.mapWrappers.filter(
          (T) => T.instanceId !== S.current
        ), t.getState().setShadowMetadata(e._stateKey, e._path, A));
      }
      I.current.forEach((A) => A.unmount());
    };
  }, []);
  const E = () => {
    const l = h.current;
    if (!l) return;
    const u = t.getState().getShadowValue(
      [e._stateKey, ...e._path].join("."),
      e._meta?.validIds
    );
    if (!Array.isArray(u)) return;
    const A = e._meta?.validIds ?? t.getState().getShadowMetadata(e._stateKey, e._path)?.arrayKeys ?? [], T = i({
      currentState: u,
      path: e._path,
      componentId: S.current,
      meta: e._meta
    });
    u.forEach((s, g) => {
      const M = A[g];
      if (!M) return;
      const W = ae(), c = document.createElement("div");
      c.setAttribute("data-item-path", M), l.appendChild(c);
      const x = Ce(c);
      I.current.set(M, x);
      const Y = M.split(".").slice(1);
      x.render(
        ue(Me, {
          stateKey: e._stateKey,
          itemComponentId: W,
          itemPath: Y,
          localIndex: g,
          arraySetter: T,
          rebuildStateShape: i,
          renderFn: e._mapFn
        })
      );
    });
  };
  return /* @__PURE__ */ oe("div", { ref: h, "data-map-container": S.current });
}
function Ge({
  proxy: e
}) {
  const i = z(null), h = z(null), S = z(!1), p = `${e._stateKey}-${e._path.join(".")}`, I = t.getState().getShadowValue(
    [e._stateKey, ...e._path].join("."),
    e._meta?.validIds
  );
  return Q(() => {
    const E = i.current;
    if (!E || S.current) return;
    const l = setTimeout(() => {
      if (!E.parentElement) {
        console.warn("Parent element not found for signal", p);
        return;
      }
      const u = E.parentElement, T = Array.from(u.childNodes).indexOf(E);
      let s = u.getAttribute("data-parent-id");
      s || (s = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", s)), h.current = `instance-${crypto.randomUUID()}`;
      const g = t.getState().getShadowMetadata(e._stateKey, e._path) || {}, M = g.signals || [];
      M.push({
        instanceId: h.current,
        parentId: s,
        position: T,
        effect: e._effect
      }), t.getState().setShadowMetadata(e._stateKey, e._path, {
        ...g,
        signals: M
      });
      let W = I;
      if (e._effect)
        try {
          W = new Function(
            "state",
            `return (${e._effect})(state)`
          )(I);
        } catch (x) {
          console.error("Error evaluating effect function:", x);
        }
      W !== null && typeof W == "object" && (W = JSON.stringify(W));
      const c = document.createTextNode(String(W ?? ""));
      E.replaceWith(c), S.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(l), h.current) {
        const u = t.getState().getShadowMetadata(e._stateKey, e._path) || {};
        u.signals && (u.signals = u.signals.filter(
          (A) => A.instanceId !== h.current
        ), t.getState().setShadowMetadata(e._stateKey, e._path, u));
      }
    };
  }, []), ue("span", {
    ref: i,
    style: { display: "contents" },
    "data-signal-id": p
  });
}
const Me = Re(
  Ye,
  (e, i) => e.itemPath.join(".") === i.itemPath.join(".") && e.stateKey === i.stateKey && e.itemComponentId === i.itemComponentId && e.localIndex === i.localIndex
), Je = (e) => {
  const [i, h] = X(!1);
  return fe(() => {
    if (!e.current) {
      h(!0);
      return;
    }
    const S = Array.from(e.current.querySelectorAll("img"));
    if (S.length === 0) {
      h(!0);
      return;
    }
    let p = 0;
    const I = () => {
      p++, p === S.length && h(!0);
    };
    return S.forEach((E) => {
      E.complete ? I() : (E.addEventListener("load", I), E.addEventListener("error", I));
    }), () => {
      S.forEach((E) => {
        E.removeEventListener("load", I), E.removeEventListener("error", I);
      });
    };
  }, [e.current]), i;
};
function Ye({
  stateKey: e,
  itemComponentId: i,
  itemPath: h,
  localIndex: S,
  arraySetter: p,
  rebuildStateShape: I,
  renderFn: E
}) {
  const [, l] = X({}), { ref: u, inView: A } = Ne(), T = z(null), s = Je(T), g = z(!1), M = [e, ...h].join(".");
  Ue(e, i, l);
  const W = le(
    (F) => {
      T.current = F, u(F);
    },
    [u]
  );
  Q(() => {
    t.getState().subscribeToPath(M, (F) => {
      l({});
    });
  }, []), Q(() => {
    if (!A || !s || g.current)
      return;
    const F = T.current;
    if (F && F.offsetHeight > 0) {
      g.current = !0;
      const y = F.offsetHeight;
      t.getState().setShadowMetadata(e, h, {
        virtualizer: {
          itemHeight: y,
          domRef: F
        }
      });
      const ee = h.slice(0, -1), K = [e, ...ee].join(".");
      t.getState().notifyPathSubscribers(K, {
        type: "ITEMHEIGHT",
        itemKey: h.join("."),
        ref: T.current
      });
    }
  }, [A, s, e, h]);
  const c = [e, ...h].join("."), x = t.getState().getShadowValue(c);
  if (x === void 0)
    return null;
  const Y = I({
    currentState: x,
    path: h,
    componentId: i
  }), G = E(Y, S, p);
  return /* @__PURE__ */ oe("div", { ref: W, children: G });
}
function Ze({
  stateKey: e,
  path: i,
  rebuildStateShape: h,
  renderFn: S,
  formOpts: p,
  setState: I
}) {
  const [E] = X(() => ae()), [, l] = X({}), u = [e, ...i].join(".");
  Ue(e, E, l);
  const A = t.getState().getShadowValue(u), [T, s] = X(A), g = z(!1), M = z(null);
  Q(() => {
    !g.current && !ce(A, T) && s(A);
  }, [A]), Q(() => {
    const G = t.getState().subscribeToPath(u, (F) => {
      !g.current && T !== F && l({});
    });
    return () => {
      G(), M.current && (clearTimeout(M.current), g.current = !1);
    };
  }, []);
  const W = le(
    (G) => {
      s(G), g.current = !0, M.current && clearTimeout(M.current);
      const F = p?.debounceTime ?? 200;
      M.current = setTimeout(() => {
        g.current = !1, I(G, i, { updateType: "update" });
      }, F);
    },
    [I, i, p?.debounceTime]
  ), c = le(async () => {
    M.current && (clearTimeout(M.current), M.current = null, g.current = !1, I(T, i, { updateType: "update" }));
    const { getInitialOptions: G, removeValidationError: F, addValidationError: y } = t.getState(), K = G(e)?.validation;
    if (!K?.zodSchema || !K?.onBlur)
      return;
    const ne = K.key;
    if (!ne) return;
    const o = [ne, ...i].join(".");
    F(o);
    const n = t.getState().getShadowValue(e), r = K.zodSchema.safeParse(n);
    r.success || r.error.errors.forEach((a) => {
      if (JSON.stringify(a.path) === JSON.stringify(i)) {
        const d = [ne, ...a.path].join(".");
        y(d, a.message);
      }
    }), ie(e);
  }, [e, i, T, I]), x = h({
    currentState: A,
    path: i,
    componentId: E
  }), Y = new Proxy(x, {
    get(G, F) {
      return F === "inputProps" ? {
        value: T ?? "",
        onChange: (y) => {
          W(y.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: c,
        ref: pe.getState().getFormRef(e + "." + i.join("."))
      } : G[F];
    }
  });
  return /* @__PURE__ */ oe(Ae, { children: S(Y) });
}
function Ue(e, i, h) {
  const S = `${e}////${i}`;
  fe(() => {
    const { registerComponent: p, unregisterComponent: I } = t.getState();
    return p(e, S, {
      forceUpdate: () => h({}),
      paths: /* @__PURE__ */ new Set(),
      reactiveType: ["component"]
    }), () => {
      I(e, S);
    };
  }, [e, S]);
}
export {
  ke as $cogsSignal,
  it as addStateOptions,
  ct as createCogsState,
  lt as notifyComponent,
  Be as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
