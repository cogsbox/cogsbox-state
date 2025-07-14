"use client";
import { jsx as ne, Fragment as Ae } from "react/jsx-runtime";
import { memo as Re, useState as X, useRef as q, useCallback as ue, useEffect as Q, useLayoutEffect as ge, useMemo as Se, createElement as de, startTransition as je } from "react";
import { createRoot as Ce } from "react-dom/client";
import { transformStateFunc as Fe, isFunction as ee, isArray as Te, getDifferences as Pe, isDeepEqual as le } from "./utility.js";
import { ValidationWrapper as Ee } from "./Functions.jsx";
import Oe from "superjson";
import { v4 as te } from "uuid";
import { getGlobalStore as t, formRefStore as ve } from "./store.js";
import { useCogsConfig as _e } from "./CogsStateClient.jsx";
import { applyPatch as Ne } from "fast-json-patch";
import { useInView as Le } from "react-intersection-observer";
function ye(e, i) {
  const m = t.getState().getInitialOptions, S = t.getState().setInitialStateOptions, y = m(e) || {};
  S(e, {
    ...y,
    ...i
  });
}
function Ve({
  stateKey: e,
  options: i,
  initialOptionsPart: m
}) {
  const S = ae(e) || {}, y = m[e] || {}, I = t.getState().setInitialStateOptions, E = { ...y, ...S };
  let l = !1;
  if (i)
    for (const u in i)
      E.hasOwnProperty(u) ? (u == "localStorage" && i[u] && E[u].key !== i[u]?.key && (l = !0, E[u] = i[u]), u == "defaultState" && i[u] && E[u] !== i[u] && !le(E[u], i[u]) && (l = !0, E[u] = i[u])) : (l = !0, E[u] = i[u]);
  l && I(e, E);
}
function lt(e, { formElements: i, validation: m }) {
  return { initialState: e, formElements: i, validation: m };
}
const ut = (e, i) => {
  let m = e;
  const [S, y] = Fe(m);
  Object.keys(S).forEach((l) => {
    let u = y[l] || {};
    const P = {
      ...u
    };
    if (i?.formElements && (P.formElements = {
      ...i.formElements,
      ...u.formElements || {}
    }), i?.validation && (P.validation = {
      ...i.validation,
      ...u.validation || {}
    }, i.validation.key && !u.validation?.key && (P.validation.key = `${i.validation.key}.${l}`)), Object.keys(P).length > 0) {
      const M = ae(l);
      M ? t.getState().setInitialStateOptions(l, {
        ...M,
        ...P
      }) : t.getState().setInitialStateOptions(l, P);
    }
  }), Object.keys(S).forEach((l) => {
    t.getState().initializeShadowState(l, S[l]);
  });
  const I = (l, u) => {
    const [P] = X(u?.componentId ?? te());
    Ve({
      stateKey: l,
      options: u,
      initialOptionsPart: y
    });
    const M = t.getState().getShadowValue(l) || S[l], s = u?.modifyState ? u.modifyState(M) : M;
    return ze(s, {
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
  function E(l, u) {
    Ve({ stateKey: l, options: u, initialOptionsPart: y }), u.localStorage && Be(l, u), ie(l);
  }
  return { useCogsState: I, setCogsOptions: E };
}, {
  getInitialOptions: ae,
  getValidationErrors: We,
  setStateLog: He,
  updateInitialStateGlobal: $e,
  addValidationError: he,
  removeValidationError: oe
} = t.getState(), xe = (e, i, m, S, y) => {
  m?.log && console.log(
    "saving to localstorage",
    i,
    m.localStorage?.key,
    S
  );
  const I = ee(m?.localStorage?.key) ? m.localStorage?.key(e) : m?.localStorage?.key;
  if (I && S) {
    const E = `${S}-${i}-${I}`;
    let l;
    try {
      l = me(E)?.lastSyncedWithServer;
    } catch {
    }
    const u = t.getState().getShadowMetadata(i, []), P = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: l,
      stateSource: u?.stateSource,
      baseServerState: u?.baseServerState
    }, M = Oe.serialize(P);
    window.localStorage.setItem(
      E,
      JSON.stringify(M.json)
    );
  }
}, me = (e) => {
  if (!e) return null;
  try {
    const i = window.localStorage.getItem(e);
    return i ? JSON.parse(i) : null;
  } catch (i) {
    return console.error("Error loading from localStorage:", i), null;
  }
}, Be = (e, i) => {
  const m = t.getState().getShadowValue(e), { sessionId: S } = _e(), y = ee(i?.localStorage?.key) ? i.localStorage.key(m) : i?.localStorage?.key;
  if (y && S) {
    const I = me(
      `${S}-${e}-${y}`
    );
    if (I && I.lastUpdated > (I.lastSyncedWithServer || 0))
      return ie(e), !0;
  }
  return !1;
}, ie = (e) => {
  const i = t.getState().getShadowMetadata(e, []);
  if (!i) return;
  const m = /* @__PURE__ */ new Set();
  i?.components?.forEach((S) => {
    (S ? Array.isArray(S.reactiveType) ? S.reactiveType : [S.reactiveType || "component"] : null)?.includes("none") || m.add(() => S.forceUpdate());
  }), queueMicrotask(() => {
    m.forEach((S) => S());
  });
}, dt = (e, i) => {
  const m = t.getState().getShadowMetadata(e, []);
  if (m) {
    const S = `${e}////${i}`, y = m?.components?.get(S);
    if ((y ? Array.isArray(y.reactiveType) ? y.reactiveType : [y.reactiveType || "component"] : null)?.includes("none"))
      return;
    y && y.forceUpdate();
  }
};
function we(e, i, m, S) {
  const y = t.getState(), I = y.getShadowMetadata(e, i);
  if (y.setShadowMetadata(e, i, {
    ...I,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: S || Date.now()
  }), Array.isArray(m)) {
    const E = y.getShadowMetadata(e, i);
    E?.arrayKeys && E.arrayKeys.forEach((l, u) => {
      const P = l.split(".").slice(1), M = m[u];
      M !== void 0 && we(
        e,
        P,
        M,
        S
      );
    });
  } else m && typeof m == "object" && m.constructor === Object && Object.keys(m).forEach((E) => {
    const l = [...i, E], u = m[E];
    we(e, l, u, S);
  });
}
function ze(e, {
  stateKey: i,
  localStorage: m,
  formElements: S,
  reactiveDeps: y,
  reactiveType: I,
  componentId: E,
  defaultState: l,
  syncUpdate: u,
  dependencies: P,
  serverState: M
} = {}) {
  const [s, h] = X({}), { sessionId: T } = _e();
  let N = !i;
  const [c] = X(i ?? te()), H = t.getState().stateLog[c], Z = q(/* @__PURE__ */ new Set()), G = q(E ?? te()), O = q(
    null
  );
  O.current = ae(c) ?? null, Q(() => {
    if (u && u.stateKey === c && u.path?.[0]) {
      const n = `${u.stateKey}:${u.path.join(".")}`;
      t.getState().setSyncInfo(n, {
        timeStamp: u.timeStamp,
        userId: u.userId
      });
    }
  }, [u]);
  const p = ue(
    (n) => {
      const a = n ? { ...ae(c), ...n } : ae(c), d = a?.defaultState || l || e;
      if (a?.serverState?.status === "success" && a?.serverState?.data !== void 0)
        return {
          value: a.serverState.data,
          source: "server",
          timestamp: a.serverState.timestamp || Date.now()
        };
      if (a?.localStorage?.key && T) {
        const f = ee(a.localStorage.key) ? a.localStorage.key(d) : a.localStorage.key, A = me(
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
        value: d || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [c, l, e, T]
  );
  Q(() => {
    t.getState().setServerStateUpdate(c, M);
  }, [M, c]), Q(() => t.getState().subscribeToPath(c, (r) => {
    if (r?.type === "SERVER_STATE_UPDATE") {
      const a = r.serverState;
      if (a?.status === "success" && a.data !== void 0) {
        ye(c, { serverState: a });
        const g = typeof a.merge == "object" ? a.merge : a.merge === !0 ? {} : null, f = t.getState().getShadowValue(c), A = a.data;
        if (g && Array.isArray(f) && Array.isArray(A)) {
          const _ = g.key || "id", D = new Set(
            f.map((W) => W[_])
          ), R = A.filter((W) => !D.has(W[_]));
          R.length > 0 && R.forEach((W) => {
            t.getState().insertShadowArrayElement(c, [], W);
            const F = t.getState().getShadowMetadata(c, []);
            if (F?.arrayKeys) {
              const x = F.arrayKeys[F.arrayKeys.length - 1];
              if (x) {
                const J = x.split(".").slice(1);
                t.getState().setShadowMetadata(c, J, {
                  isDirty: !1,
                  stateSource: "server",
                  lastServerSync: a.timestamp || Date.now()
                });
                const B = t.getState().getShadowValue(x);
                B && typeof B == "object" && !Array.isArray(B) && Object.keys(B).forEach((b) => {
                  const U = [...J, b];
                  t.getState().setShadowMetadata(c, U, {
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
        const $ = t.getState().getShadowMetadata(c, []);
        t.getState().setShadowMetadata(c, [], {
          ...$,
          stateSource: "server",
          lastServerSync: a.timestamp || Date.now(),
          isDirty: !1
        });
      }
    }
  }), [c, p]), Q(() => {
    const n = t.getState().getShadowMetadata(c, []);
    if (n && n.stateSource)
      return;
    const r = ae(c);
    if (r?.defaultState !== void 0 || l !== void 0) {
      const a = r?.defaultState || l;
      r?.defaultState || ye(c, {
        defaultState: a
      });
      const { value: d, source: g, timestamp: f } = p();
      t.getState().initializeShadowState(c, d), t.getState().setShadowMetadata(c, [], {
        stateSource: g,
        lastServerSync: g === "server" ? f : void 0,
        isDirty: !1,
        baseServerState: g === "server" ? d : void 0
      }), ie(c);
    }
  }, [c, ...P || []]), ge(() => {
    N && ye(c, {
      formElements: S,
      defaultState: l,
      localStorage: m,
      middleware: O.current?.middleware
    });
    const n = `${c}////${G.current}`, r = t.getState().getShadowMetadata(c, []), a = r?.components || /* @__PURE__ */ new Map();
    return a.set(n, {
      forceUpdate: () => h({}),
      reactiveType: I ?? ["component", "deps"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: y || void 0,
      deps: y ? y(t.getState().getShadowValue(c)) : [],
      prevDeps: y ? y(t.getState().getShadowValue(c)) : []
    }), t.getState().setShadowMetadata(c, [], {
      ...r,
      components: a
    }), h({}), () => {
      const d = t.getState().getShadowMetadata(c, []), g = d?.components?.get(n);
      g?.paths && g.paths.forEach((f) => {
        const $ = f.split(".").slice(1), _ = t.getState().getShadowMetadata(c, $);
        _?.pathComponents && _.pathComponents.size === 0 && (delete _.pathComponents, t.getState().setShadowMetadata(c, $, _));
      }), d?.components && t.getState().setShadowMetadata(c, [], d);
    };
  }, []);
  const K = q(null), re = (n, r, a, d) => {
    const g = [c, ...r].join(".");
    if (Array.isArray(r)) {
      const b = `${c}-${r.join(".")}`;
      Z.current.add(b);
    }
    const f = t.getState(), A = f.getShadowMetadata(c, r), $ = f.getShadowValue(g), _ = a.updateType === "insert" && ee(n) ? n({ state: $, uuid: te() }) : ee(n) ? n($) : n, R = {
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
        f.insertShadowArrayElement(c, r, R.newValue), f.markAsDirty(c, r, { bubble: !0 });
        const b = f.getShadowMetadata(c, r);
        if (b?.arrayKeys) {
          const U = b.arrayKeys[b.arrayKeys.length - 1];
          if (U) {
            const v = U.split(".").slice(1);
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
    if (a.sync !== !1 && K.current && K.current.connected && K.current.updateState({ operation: R }), A?.signals && A.signals.length > 0) {
      const b = a.updateType === "cut" ? null : _;
      A.signals.forEach(({ parentId: U, position: v, effect: w }) => {
        const V = document.querySelector(`[data-parent-id="${U}"]`);
        if (V) {
          const C = Array.from(V.childNodes);
          if (C[v]) {
            let k = b;
            if (w && b !== null)
              try {
                k = new Function(
                  "state",
                  `return (${w})(state)`
                )(b);
              } catch (j) {
                console.error("Error evaluating effect function:", j);
              }
            k != null && typeof k == "object" && (k = JSON.stringify(k)), C[v].textContent = String(k ?? "");
          }
        }
      });
    }
    if (a.updateType === "insert" && A?.mapWrappers && A.mapWrappers.length > 0) {
      const b = f.getShadowMetadata(c, r)?.arrayKeys || [], U = b[b.length - 1], v = f.getShadowValue(U), w = f.getShadowValue(
        [c, ...r].join(".")
      );
      if (!U || v === void 0) return;
      A.mapWrappers.forEach((V) => {
        let C = !0, k = -1;
        if (V.meta?.transforms && V.meta.transforms.length > 0) {
          for (const j of V.meta.transforms)
            if (j.type === "filter" && !j.fn(v, -1)) {
              C = !1;
              break;
            }
          if (C) {
            const j = Ie(
              c,
              r,
              V.meta.transforms
            ), Y = V.meta.transforms.find(
              (L) => L.type === "sort"
            );
            if (Y) {
              const L = j.map((z) => ({
                key: z,
                value: f.getShadowValue(z)
              }));
              L.push({ key: U, value: v }), L.sort((z, se) => Y.fn(z.value, se.value)), k = L.findIndex(
                (z) => z.key === U
              );
            } else
              k = j.length;
          }
        } else
          C = !0, k = b.length - 1;
        if (C && V.containerRef && V.containerRef.isConnected) {
          const j = document.createElement("div");
          j.setAttribute("data-item-path", U);
          const Y = Array.from(V.containerRef.children);
          k >= 0 && k < Y.length ? V.containerRef.insertBefore(
            j,
            Y[k]
          ) : V.containerRef.appendChild(j);
          const L = Ce(j), z = te(), se = U.split(".").slice(1), fe = V.rebuildStateShape({
            path: V.path,
            currentState: w,
            componentId: V.componentId,
            meta: V.meta
          });
          L.render(
            de(Me, {
              stateKey: c,
              itemComponentId: z,
              itemPath: se,
              localIndex: k,
              arraySetter: fe,
              rebuildStateShape: V.rebuildStateShape,
              renderFn: V.mapFn
            })
          );
        }
      });
    }
    if (a.updateType === "cut") {
      const b = r.slice(0, -1), U = f.getShadowMetadata(c, b);
      U?.mapWrappers && U.mapWrappers.length > 0 && U.mapWrappers.forEach((v) => {
        if (v.containerRef && v.containerRef.isConnected) {
          const w = v.containerRef.querySelector(
            `[data-item-path="${g}"]`
          );
          w && w.remove();
        }
      });
    }
    a.updateType === "update" && (d || O.current?.validation?.key) && r && oe(
      (d || O.current?.validation?.key) + "." + r.join(".")
    );
    const F = r.slice(0, r.length - 1);
    a.updateType === "cut" && O.current?.validation?.key && oe(
      O.current?.validation?.key + "." + F.join(".")
    ), a.updateType === "insert" && O.current?.validation?.key && We(
      O.current?.validation?.key + "." + F.join(".")
    ).filter((U) => {
      let v = U?.split(".").length;
      const w = "";
      if (U == F.join(".") && v == F.length - 1) {
        let V = U + "." + F;
        oe(U), he(V, w);
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
        const U = f.getShadowMetadata(c, b);
        if (U?.pathComponents && U.pathComponents.forEach((v) => {
          if (B.has(v))
            return;
          const w = J.components?.get(v);
          w && ((Array.isArray(w.reactiveType) ? w.reactiveType : [w.reactiveType || "component"]).includes("none") || (w.forceUpdate(), B.add(v)));
        }), b.length === 0)
          break;
        b.pop();
      }
      _ && typeof _ == "object" && !Te(_) && $ && typeof $ == "object" && !Te($) && Pe(_, $).forEach((v) => {
        const w = v.split("."), V = [...r, ...w], C = f.getShadowMetadata(c, V);
        C?.pathComponents && C.pathComponents.forEach((k) => {
          if (B.has(k))
            return;
          const j = J.components?.get(k);
          j && ((Array.isArray(j.reactiveType) ? j.reactiveType : [j.reactiveType || "component"]).includes("none") || (j.forceUpdate(), B.add(k)));
        });
      });
    } else if (a.updateType === "insert" || a.updateType === "cut") {
      const b = a.updateType === "insert" ? r : r.slice(0, -1), U = f.getShadowMetadata(c, b);
      if (U?.signals && U.signals.length > 0) {
        const v = [c, ...b].join("."), w = f.getShadowValue(v);
        U.signals.forEach(({ parentId: V, position: C, effect: k }) => {
          const j = document.querySelector(
            `[data-parent-id="${V}"]`
          );
          if (j) {
            const Y = Array.from(j.childNodes);
            if (Y[C]) {
              let L = w;
              if (k)
                try {
                  L = new Function(
                    "state",
                    `return (${k})(state)`
                  )(w);
                } catch (z) {
                  console.error("Error evaluating effect function:", z), L = w;
                }
              L != null && typeof L == "object" && (L = JSON.stringify(L)), Y[C].textContent = String(L ?? "");
            }
          }
        });
      }
      U?.pathComponents && U.pathComponents.forEach((v) => {
        if (!B.has(v)) {
          const w = J.components?.get(v);
          w && (w.forceUpdate(), B.add(v));
        }
      });
    }
    return J.components.forEach((b, U) => {
      if (B.has(U))
        return;
      const v = Array.isArray(b.reactiveType) ? b.reactiveType : [b.reactiveType || "component"];
      if (v.includes("all")) {
        b.forceUpdate(), B.add(U);
        return;
      }
      if (v.includes("deps") && b.depsFunction) {
        const w = f.getShadowValue(c), V = b.depsFunction(w);
        let C = !1;
        V === !0 ? C = !0 : Array.isArray(V) && (le(b.prevDeps, V) || (b.prevDeps = V, C = !0)), C && (b.forceUpdate(), B.add(U));
      }
    }), B.clear(), He(c, (b) => {
      const U = [...b ?? [], R], v = /* @__PURE__ */ new Map();
      return U.forEach((w) => {
        const V = `${w.stateKey}:${JSON.stringify(w.path)}`, C = v.get(V);
        C ? (C.timeStamp = Math.max(C.timeStamp, w.timeStamp), C.newValue = w.newValue, C.oldValue = C.oldValue ?? w.oldValue, C.updateType = w.updateType) : v.set(V, { ...w });
      }), Array.from(v.values());
    }), xe(
      _,
      c,
      O.current,
      T
    ), O.current?.middleware && O.current.middleware({
      updateLog: H,
      update: R
    }), x;
  };
  t.getState().initialStateGlobal[c] || $e(c, e);
  const ce = Se(() => De(
    c,
    re,
    G.current,
    T
  ), [c, T]), o = O.current?.cogsSync;
  return o && (K.current = o(ce)), ce;
}
function qe(e) {
  return !e || e.length === 0 ? "" : e.map(
    (i) => (
      // Safely stringify dependencies. An empty array becomes '[]'.
      `${i.type}${JSON.stringify(i.dependencies || [])}`
    )
  ).join("");
}
const Ie = (e, i, m) => {
  let S = t.getState().getShadowMetadata(e, i)?.arrayKeys || [];
  if (!m || m.length === 0)
    return S;
  let y = S.map((I) => ({
    key: I,
    value: t.getState().getShadowValue(I)
  }));
  for (const I of m)
    I.type === "filter" ? y = y.filter(
      ({ value: E }, l) => I.fn(E, l)
    ) : I.type === "sort" && y.sort((E, l) => I.fn(E.value, l.value));
  return y.map(({ key: I }) => I);
}, be = (e, i, m) => {
  const S = `${e}////${i}`, { addPathComponent: y, getShadowMetadata: I } = t.getState(), l = I(e, [])?.components?.get(S);
  !l || l.reactiveType === "none" || !(Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType]).includes("component") || y(e, m, S);
}, pe = (e, i, m) => {
  const S = t.getState(), y = S.getShadowMetadata(e, []), I = /* @__PURE__ */ new Set();
  y?.components && y.components.forEach((l, u) => {
    (Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType || "component"]).includes("all") && (l.forceUpdate(), I.add(u));
  }), S.getShadowMetadata(e, [...i, "getSelected"])?.pathComponents?.forEach((l) => {
    y?.components?.get(l)?.forceUpdate();
  });
  const E = S.getShadowMetadata(e, i);
  for (let l of E?.arrayKeys || []) {
    const u = l + ".selected", P = S.getShadowMetadata(
      e,
      u.split(".").slice(1)
    );
    l == m && P?.pathComponents?.forEach((M) => {
      y?.components?.get(M)?.forceUpdate();
    });
  }
};
function De(e, i, m, S) {
  const y = /* @__PURE__ */ new Map();
  let I = 0;
  const E = (M) => {
    const s = M.join(".");
    for (const [h] of y)
      (h === s || h.startsWith(s + ".")) && y.delete(h);
    I++;
  };
  function l({
    currentState: M,
    path: s = [],
    meta: h,
    componentId: T
  }) {
    const N = s.map(String).join("."), c = [e, ...s].join(".");
    M = t.getState().getShadowValue(c, h?.validIds);
    const H = function() {
      return t().getShadowValue(e, s);
    }, Z = {
      apply(O, p, K) {
      },
      get(O, p) {
        if (p === "_rebuildStateShape")
          return l;
        if (Object.getOwnPropertyNames(u).includes(p) && s.length === 0)
          return u[p];
        if (p === "getDifferences")
          return () => {
            const o = t.getState().getShadowMetadata(e, []), n = t.getState().getShadowValue(e);
            let r;
            return o?.stateSource === "server" && o.baseServerState ? r = o.baseServerState : r = t.getState().initialStateGlobal[e], Pe(n, r);
          };
        if (p === "sync" && s.length === 0)
          return async function() {
            const o = t.getState().getInitialOptions(e), n = o?.sync;
            if (!n)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const r = t.getState().getShadowValue(e, []), a = o?.validation?.key;
            try {
              const d = await n.action(r);
              if (d && !d.success && d.errors && a && (t.getState().removeValidationError(a), d.errors.forEach((g) => {
                const f = [a, ...g.path].join(".");
                t.getState().addValidationError(f, g.message);
              }), ie(e)), d?.success) {
                const g = t.getState().getShadowMetadata(e, []);
                t.getState().setShadowMetadata(e, [], {
                  ...g,
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
        if (p === "_status" || p === "getStatus") {
          const o = () => {
            const n = t.getState().getShadowMetadata(e, s), r = t.getState().getShadowValue(c);
            return n?.isDirty === !0 ? "dirty" : n?.isDirty === !1 || n?.stateSource === "server" ? "synced" : n?.stateSource === "localStorage" ? "restored" : n?.stateSource === "default" ? "fresh" : t.getState().getShadowMetadata(e, [])?.stateSource === "server" && !n?.isDirty ? "synced" : r !== void 0 && !n ? "fresh" : "unknown";
          };
          return p === "_status" ? o() : o;
        }
        if (p === "removeStorage")
          return () => {
            const o = t.getState().initialStateGlobal[e], n = ae(e), r = ee(n?.localStorage?.key) ? n.localStorage.key(o) : n?.localStorage?.key, a = `${S}-${e}-${r}`;
            a && localStorage.removeItem(a);
          };
        if (p === "showValidationErrors")
          return () => {
            const o = t.getState().getInitialOptions(e)?.validation;
            if (!o?.key) throw new Error("Validation key not found");
            return t.getState().getValidationErrors(o.key + "." + s.join("."));
          };
        if (Array.isArray(M)) {
          if (p === "getSelected")
            return () => {
              const o = e + "." + s.join(".");
              be(e, T, [
                ...s,
                "getSelected"
              ]);
              const n = t.getState().selectedIndicesMap;
              if (!n || !n.has(o))
                return;
              const r = n.get(o);
              if (h?.validIds && !h.validIds.includes(r))
                return;
              const a = t.getState().getShadowValue(r);
              if (a)
                return l({
                  currentState: a,
                  path: r.split(".").slice(1),
                  componentId: T
                });
            };
          if (p === "getSelectedIndex")
            return () => t.getState().getSelectedIndex(
              e + "." + s.join("."),
              h?.validIds
            );
          if (p === "clearSelected")
            return pe(e, s), () => {
              t.getState().clearSelectedIndex({
                arrayKey: e + "." + s.join(".")
              });
            };
          if (p === "useVirtualView")
            return (o) => {
              const {
                itemHeight: n = 50,
                overscan: r = 6,
                stickToBottom: a = !1,
                scrollStickTolerance: d = 75
              } = o, g = q(null), [f, A] = X({
                startIndex: 0,
                endIndex: 10
              }), [$, _] = X({}), D = q(!0), R = q({
                isUserScrolling: !1,
                lastScrollTop: 0,
                scrollUpCount: 0,
                isNearBottom: !0
              }), W = q(
                /* @__PURE__ */ new Map()
              );
              ge(() => {
                if (!a || !g.current || R.current.isUserScrolling)
                  return;
                const v = g.current;
                v.scrollTo({
                  top: v.scrollHeight,
                  behavior: D.current ? "instant" : "smooth"
                });
              }, [$, a]);
              const F = t.getState().getShadowMetadata(e, s)?.arrayKeys || [], { totalHeight: x, itemOffsets: J } = Se(() => {
                let v = 0;
                const w = /* @__PURE__ */ new Map();
                return (t.getState().getShadowMetadata(e, s)?.arrayKeys || []).forEach((C) => {
                  const k = C.split(".").slice(1), j = t.getState().getShadowMetadata(e, k)?.virtualizer?.itemHeight || n;
                  w.set(C, {
                    height: j,
                    offset: v
                  }), v += j;
                }), W.current = w, { totalHeight: v, itemOffsets: w };
              }, [F.length, n]);
              ge(() => {
                if (a && F.length > 0 && g.current && !R.current.isUserScrolling && D.current) {
                  const v = g.current, w = () => {
                    if (v.clientHeight > 0) {
                      const V = Math.ceil(
                        v.clientHeight / n
                      ), C = F.length - 1, k = Math.max(
                        0,
                        C - V - r
                      );
                      A({ startIndex: k, endIndex: C }), requestAnimationFrame(() => {
                        b("instant"), D.current = !1;
                      });
                    } else
                      requestAnimationFrame(w);
                  };
                  w();
                }
              }, [F.length, a, n, r]);
              const B = ue(() => {
                const v = g.current;
                if (!v) return;
                const w = v.scrollTop, { scrollHeight: V, clientHeight: C } = v, k = R.current, j = V - (w + C), Y = k.isNearBottom;
                k.isNearBottom = j <= d, w < k.lastScrollTop ? (k.scrollUpCount++, k.scrollUpCount > 3 && Y && (k.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : k.isNearBottom && (k.isUserScrolling = !1, k.scrollUpCount = 0), k.lastScrollTop = w;
                let L = 0;
                for (let z = 0; z < F.length; z++) {
                  const se = F[z], fe = W.current.get(se);
                  if (fe && fe.offset + fe.height > w) {
                    L = z;
                    break;
                  }
                }
                if (L !== f.startIndex) {
                  const z = Math.ceil(C / n);
                  A({
                    startIndex: Math.max(0, L - r),
                    endIndex: Math.min(
                      F.length - 1,
                      L + z + r
                    )
                  });
                }
              }, [
                F.length,
                f.startIndex,
                n,
                r,
                d
              ]);
              Q(() => {
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
                  const V = () => {
                    const C = (k = 0) => {
                      if (k > 5) return;
                      const j = w.scrollHeight, Y = w.scrollTop, L = w.clientHeight;
                      Y + L >= j - 1 || (w.scrollTo({
                        top: j,
                        behavior: v
                      }), setTimeout(() => {
                        const z = w.scrollHeight, se = w.scrollTop;
                        (z !== j || se + L < z - 1) && C(k + 1);
                      }, 50));
                    };
                    C();
                  };
                  "requestIdleCallback" in window ? requestIdleCallback(V, { timeout: 100 }) : requestAnimationFrame(() => {
                    requestAnimationFrame(V);
                  });
                },
                []
              );
              return Q(() => {
                if (!a || !g.current) return;
                const v = g.current, w = R.current;
                let V;
                const C = () => {
                  clearTimeout(V), V = setTimeout(() => {
                    !w.isUserScrolling && w.isNearBottom && b(
                      D.current ? "instant" : "smooth"
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
                const j = (Y) => {
                  Y.target instanceof HTMLImageElement && !w.isUserScrolling && C();
                };
                return v.addEventListener("load", j, !0), D.current ? setTimeout(() => {
                  b("instant");
                }, 0) : C(), () => {
                  clearTimeout(V), k.disconnect(), v.removeEventListener("load", j, !0);
                };
              }, [a, F.length, b]), {
                virtualState: Se(() => {
                  const v = t.getState(), w = v.getShadowValue(
                    [e, ...s].join(".")
                  ), V = v.getShadowMetadata(e, s)?.arrayKeys || [], C = w.slice(
                    f.startIndex,
                    f.endIndex + 1
                  ), k = V.slice(
                    f.startIndex,
                    f.endIndex + 1
                  );
                  return l({
                    currentState: C,
                    path: s,
                    componentId: T,
                    meta: { ...h, validIds: k }
                  });
                }, [f.startIndex, f.endIndex, F.length]),
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
                      height: `${x}px`,
                      position: "relative"
                    }
                  },
                  list: {
                    style: {
                      transform: `translateY(${W.current.get(
                        F[f.startIndex]
                      )?.offset || 0}px)`
                    }
                  }
                },
                scrollToBottom: b,
                scrollToIndex: (v, w = "smooth") => {
                  if (g.current && F[v]) {
                    const V = W.current.get(F[v])?.offset || 0;
                    g.current.scrollTo({ top: V, behavior: w });
                  }
                }
              };
            };
          if (p === "stateMap")
            return (o) => {
              const [n, r] = X(
                h?.validIds ?? t.getState().getShadowMetadata(e, s)?.arrayKeys
              ), a = t.getState().getShadowValue(c, h?.validIds);
              if (!n)
                throw new Error("No array keys found for mapping");
              const d = l({
                currentState: a,
                path: s,
                componentId: T,
                meta: h
              });
              return a.map((g, f) => {
                const A = n[f]?.split(".").slice(1), $ = l({
                  currentState: g,
                  path: A,
                  componentId: T,
                  meta: h
                });
                return o(
                  $,
                  f,
                  d
                );
              });
            };
          if (p === "$stateMap")
            return (o) => de(Ge, {
              proxy: {
                _stateKey: e,
                _path: s,
                _mapFn: o,
                _meta: h
              },
              rebuildStateShape: l
            });
          if (p === "stateFind")
            return (o) => {
              const n = h?.validIds ?? t.getState().getShadowMetadata(e, s)?.arrayKeys;
              if (n)
                for (let r = 0; r < n.length; r++) {
                  const a = n[r];
                  if (!a) continue;
                  const d = t.getState().getShadowValue(a);
                  if (o(d, r)) {
                    const g = a.split(".").slice(1);
                    return l({
                      currentState: d,
                      path: g,
                      componentId: T,
                      meta: h
                      // Pass along meta for potential further chaining
                    });
                  }
                }
            };
          if (p === "stateFilter")
            return (o) => {
              const n = h?.validIds ?? t.getState().getShadowMetadata(e, s)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for filtering.");
              const r = [], a = M.filter(
                (d, g) => o(d, g) ? (r.push(n[g]), !0) : !1
              );
              return l({
                currentState: a,
                path: s,
                componentId: T,
                meta: {
                  validIds: r,
                  transforms: [
                    ...h?.transforms || [],
                    {
                      type: "filter",
                      fn: o
                    }
                  ]
                }
              });
            };
          if (p === "stateSort")
            return (o) => {
              const n = h?.validIds ?? t.getState().getShadowMetadata(e, s)?.arrayKeys;
              if (!n)
                throw new Error("No array keys found for sorting");
              const r = M.map((a, d) => ({
                item: a,
                key: n[d]
              }));
              return r.sort((a, d) => o(a.item, d.item)).filter(Boolean), l({
                currentState: r.map((a) => a.item),
                path: s,
                componentId: T,
                meta: {
                  validIds: r.map((a) => a.key),
                  transforms: [
                    ...h?.transforms || [],
                    { type: "sort", fn: o }
                  ]
                }
              });
            };
          if (p === "stream")
            return function(o = {}) {
              const {
                bufferSize: n = 100,
                flushInterval: r = 100,
                bufferStrategy: a = "accumulate",
                store: d,
                onFlush: g
              } = o;
              let f = [], A = !1, $ = null;
              const _ = (x) => {
                if (!A) {
                  if (a === "sliding" && f.length >= n)
                    f.shift();
                  else if (a === "dropping" && f.length >= n)
                    return;
                  f.push(x), f.length >= n && D();
                }
              }, D = () => {
                if (f.length === 0) return;
                const x = [...f];
                if (f = [], d) {
                  const J = d(x);
                  J !== void 0 && (Array.isArray(J) ? J : [J]).forEach((b) => {
                    i(b, s, {
                      updateType: "insert"
                    });
                  });
                } else
                  x.forEach((J) => {
                    i(J, s, {
                      updateType: "insert"
                    });
                  });
                g?.(x);
              };
              r > 0 && ($ = setInterval(D, r));
              const R = te(), W = t.getState().getShadowMetadata(e, s) || {}, F = W.streams || /* @__PURE__ */ new Map();
              return F.set(R, { buffer: f, flushTimer: $ }), t.getState().setShadowMetadata(e, s, {
                ...W,
                streams: F
              }), {
                write: (x) => _(x),
                writeMany: (x) => x.forEach(_),
                flush: () => D(),
                pause: () => {
                  A = !0;
                },
                resume: () => {
                  A = !1, f.length > 0 && D();
                },
                close: () => {
                  D(), $ && clearInterval($);
                  const x = t.getState().getShadowMetadata(e, s);
                  x?.streams && x.streams.delete(R);
                }
              };
            };
          if (p === "stateList")
            return (o) => /* @__PURE__ */ ne(() => {
              const r = q(/* @__PURE__ */ new Map()), a = h?.transforms && h.transforms.length > 0 ? `${T}-${qe(h.transforms)}` : `${T}-base`, [d, g] = X({}), { validIds: f, arrayValues: A } = Se(() => {
                const _ = t.getState().getShadowMetadata(e, s)?.transformCaches?.get(a);
                let D;
                _ && _.validIds ? D = _.validIds : (D = Ie(
                  e,
                  s,
                  h?.transforms
                ), t.getState().setTransformCache(e, s, a, {
                  validIds: D,
                  computedAt: Date.now(),
                  transforms: h?.transforms || []
                }));
                const R = t.getState().getShadowValue(c, D);
                return {
                  validIds: D,
                  arrayValues: R || []
                };
              }, [a, d]);
              if (console.log("freshValues", f, A), Q(() => {
                const _ = t.getState().subscribeToPath(c, (D) => {
                  if (D.type === "GET_SELECTED")
                    return;
                  const W = t.getState().getShadowMetadata(e, s)?.transformCaches;
                  if (W)
                    for (const F of W.keys())
                      F.startsWith(T) && W.delete(F);
                  (D.type === "INSERT" || D.type === "REMOVE" || D.type === "CLEAR_SELECTION") && g({});
                });
                return () => {
                  _();
                };
              }, [T, c]), !Array.isArray(A))
                return null;
              const $ = l({
                currentState: A,
                path: s,
                componentId: T,
                meta: {
                  ...h,
                  validIds: f
                }
              });
              return console.log("sssssssssssssssssssssssssssss", $), /* @__PURE__ */ ne(Ae, { children: A.map((_, D) => {
                const R = f[D];
                if (!R)
                  return null;
                let W = r.current.get(R);
                W || (W = te(), r.current.set(R, W));
                const F = R.split(".").slice(1);
                return de(Me, {
                  key: R,
                  stateKey: e,
                  itemComponentId: W,
                  itemPath: F,
                  localIndex: D,
                  arraySetter: $,
                  rebuildStateShape: l,
                  renderFn: o
                });
              }) });
            }, {});
          if (p === "stateFlattenOn")
            return (o) => {
              const n = M;
              y.clear(), I++;
              const r = n.flatMap(
                (a) => a[o] ?? []
              );
              return l({
                currentState: r,
                path: [...s, "[*]", o],
                componentId: T,
                meta: h
              });
            };
          if (p === "index")
            return (o) => {
              const r = t.getState().getShadowMetadata(e, s)?.arrayKeys?.filter(
                (g) => !h?.validIds || h?.validIds && h?.validIds?.includes(g)
              )?.[o];
              if (!r) return;
              const a = t.getState().getShadowValue(r, h?.validIds);
              return l({
                currentState: a,
                path: r.split(".").slice(1),
                componentId: T,
                meta: h
              });
            };
          if (p === "last")
            return () => {
              const o = t.getState().getShadowValue(e, s);
              if (o.length === 0) return;
              const n = o.length - 1, r = o[n], a = [...s, n.toString()];
              return l({
                currentState: r,
                path: a,
                componentId: T,
                meta: h
              });
            };
          if (p === "insert")
            return (o, n) => (i(o, s, { updateType: "insert" }), l({
              currentState: t.getState().getShadowValue(e, s),
              path: s,
              componentId: T,
              meta: h
            }));
          if (p === "uniqueInsert")
            return (o, n, r) => {
              const a = t.getState().getShadowValue(e, s), d = ee(o) ? o(a) : o;
              let g = null;
              if (!a.some((A) => {
                const $ = n ? n.every(
                  (_) => le(A[_], d[_])
                ) : le(A, d);
                return $ && (g = A), $;
              }))
                E(s), i(d, s, { updateType: "insert" });
              else if (r && g) {
                const A = r(g), $ = a.map(
                  (_) => le(_, g) ? A : _
                );
                E(s), i($, s, {
                  updateType: "update"
                });
              }
            };
          if (p === "cut")
            return (o, n) => {
              const r = h?.validIds ?? t.getState().getShadowMetadata(e, s)?.arrayKeys;
              if (!r || r.length === 0) return;
              const a = o == -1 ? r.length - 1 : o !== void 0 ? o : r.length - 1, d = r[a];
              if (!d) return;
              const g = d.split(".").slice(1);
              i(M, g, {
                updateType: "cut"
              });
            };
          if (p === "cutSelected")
            return () => {
              t.getState().getShadowMetadata(e, s)?.arrayKeys;
              const o = Ie(
                e,
                s,
                h?.transforms
              );
              if (console.log("validKeys", o), !o || o.length === 0) return;
              const n = t.getState().selectedIndicesMap.get(c);
              let r = o.findIndex(
                (d) => d === n
              );
              console.log("indexToCut", r);
              const a = o[r == -1 ? o.length - 1 : r]?.split(".").slice(1);
              console.log("pathForCut", a), i(M, a, {
                updateType: "cut"
              });
            };
          if (p === "cutByValue")
            return (o) => {
              const n = t.getState().getShadowMetadata(e, s), r = h?.validIds ?? n?.arrayKeys;
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
          if (p === "toggleByValue")
            return (o) => {
              const n = t.getState().getShadowMetadata(e, s), r = h?.validIds ?? n?.arrayKeys;
              if (!r) return;
              let a = null;
              for (const d of r) {
                const g = t.getState().getShadowValue(d);
                if (console.log("itemValue sdasdasdasd", g), g === o) {
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
          if (p === "findWith")
            return (o, n) => {
              const r = t.getState().getShadowMetadata(e, s)?.arrayKeys;
              if (!r)
                throw new Error("No array keys found for sorting");
              let a = null, d = [];
              for (const g of r) {
                let f = t.getState().getShadowValue(g, h?.validIds);
                if (f && f[o] === n) {
                  a = f, d = g.split(".").slice(1);
                  break;
                }
              }
              return l({
                currentState: a,
                path: d,
                componentId: T,
                meta: h
              });
            };
        }
        if (p === "cut") {
          let o = t.getState().getShadowValue(s.join("."));
          return () => {
            i(o, s, { updateType: "cut" });
          };
        }
        if (p === "get")
          return () => (be(e, T, s), t.getState().getShadowValue(c, h?.validIds));
        if (p === "getState")
          return () => t.getState().getShadowValue(c, h?.validIds);
        if (p === "$derive")
          return (o) => ke({
            _stateKey: e,
            _path: s,
            _effect: o.toString(),
            _meta: h
          });
        if (p === "$get")
          return () => ke({ _stateKey: e, _path: s, _meta: h });
        if (p === "lastSynced") {
          const o = `${e}:${s.join(".")}`;
          return t.getState().getSyncInfo(o);
        }
        if (p == "getLocalStorage")
          return (o) => me(S + "-" + e + "-" + o);
        if (p === "isSelected") {
          const o = [e, ...s].slice(0, -1);
          if (pe(e, s, void 0), Array.isArray(
            t.getState().getShadowValue(o.join("."), h?.validIds)
          )) {
            s[s.length - 1];
            const n = o.join("."), r = t.getState().selectedIndicesMap.get(n), a = e + "." + s.join(".");
            return r === a;
          }
          return;
        }
        if (p === "setSelected")
          return (o) => {
            const n = s.slice(0, -1), r = e + "." + n.join("."), a = e + "." + s.join(".");
            pe(e, n, void 0), t.getState().selectedIndicesMap.get(r), o && t.getState().setSelectedIndex(r, a);
          };
        if (p === "toggleSelected")
          return () => {
            const o = s.slice(0, -1), n = e + "." + o.join("."), r = e + "." + s.join(".");
            t.getState().selectedIndicesMap.get(n) === r ? t.getState().clearSelectedIndex({ arrayKey: n }) : t.getState().setSelectedIndex(n, r);
          };
        if (p === "_componentId")
          return T;
        if (s.length == 0) {
          if (p === "addValidation")
            return (o) => {
              const n = t.getState().getInitialOptions(e)?.validation;
              if (!n?.key) throw new Error("Validation key not found");
              oe(n.key), o.forEach((r) => {
                const a = [n.key, ...r.path].join(".");
                he(a, r.message);
              }), ie(e);
            };
          if (p === "applyJsonPatch")
            return (o) => {
              const n = t.getState(), r = n.getShadowMetadata(e, []);
              if (!r?.components) return;
              const a = (g) => !g || g === "/" ? [] : g.split("/").slice(1).map((f) => f.replace(/~1/g, "/").replace(/~0/g, "~")), d = /* @__PURE__ */ new Set();
              for (const g of o) {
                const f = a(g.path);
                switch (g.op) {
                  case "add":
                  case "replace": {
                    const { value: A } = g;
                    n.updateShadowAtPath(e, f, A), n.markAsDirty(e, f, { bubble: !0 });
                    let $ = [...f];
                    for (; ; ) {
                      const _ = n.getShadowMetadata(
                        e,
                        $
                      );
                      if (console.log("pathMeta", _), _?.pathComponents && _.pathComponents.forEach((D) => {
                        if (!d.has(D)) {
                          const R = r.components?.get(D);
                          R && (R.forceUpdate(), d.add(D));
                        }
                      }), $.length === 0) break;
                      $.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const A = f.slice(0, -1);
                    n.removeShadowArrayElement(e, f), n.markAsDirty(e, A, { bubble: !0 });
                    let $ = [...A];
                    for (; ; ) {
                      const _ = n.getShadowMetadata(
                        e,
                        $
                      );
                      if (_?.pathComponents && _.pathComponents.forEach((D) => {
                        if (!d.has(D)) {
                          const R = r.components?.get(D);
                          R && (R.forceUpdate(), d.add(D));
                        }
                      }), $.length === 0) break;
                      $.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (p === "validateZodSchema")
            return () => {
              const o = t.getState().getInitialOptions(e)?.validation, n = o?.zodSchemaV4 || o?.zodSchemaV3;
              if (!n || !o?.key)
                throw new Error(
                  "Zod schema (v3 or v4) or validation key not found"
                );
              oe(o.key);
              const r = t.getState().getShadowValue(e), a = n.safeParse(r);
              return a.success ? !0 : ("issues" in a.error ? a.error.issues.forEach((d) => {
                const g = [o.key, ...d.path].join(".");
                he(g, d.message);
              }) : a.error.errors.forEach((d) => {
                const g = [o.key, ...d.path].join(".");
                he(g, d.message);
              }), ie(e), !1);
            };
          if (p === "getComponents")
            return () => t.getState().getShadowMetadata(e, [])?.components;
          if (p === "getAllFormRefs")
            return () => ve.getState().getFormRefsByStateKey(e);
        }
        if (p === "getFormRef")
          return () => ve.getState().getFormRef(e + "." + s.join("."));
        if (p === "validationWrapper")
          return ({
            children: o,
            hideMessage: n
          }) => /* @__PURE__ */ ne(
            Ee,
            {
              formOpts: n ? { validation: { message: "" } } : void 0,
              path: s,
              stateKey: e,
              children: o
            }
          );
        if (p === "_stateKey") return e;
        if (p === "_path") return s;
        if (p === "update")
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
        if (p === "toggle") {
          const o = t.getState().getShadowValue([e, ...s].join("."));
          if (console.log("currentValueAtPath", o), typeof M != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            i(!o, s, {
              updateType: "update"
            });
          };
        }
        if (p === "formElement")
          return (o, n) => /* @__PURE__ */ ne(
            Ee,
            {
              formOpts: n,
              path: s,
              stateKey: e,
              children: /* @__PURE__ */ ne(
                Qe,
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
        const re = [...s, p], ce = t.getState().getShadowValue(e, re);
        return l({
          currentState: ce,
          path: re,
          componentId: T,
          meta: h
        });
      }
    }, G = new Proxy(H, Z);
    return y.set(N, {
      proxy: G,
      stateVersion: I
    }), G;
  }
  const u = {
    removeValidation: (M) => {
      M?.validationKey && oe(M.validationKey);
    },
    revertToInitialState: (M) => {
      const s = t.getState().getInitialOptions(e)?.validation;
      s?.key && oe(s.key), M?.validationKey && oe(M.validationKey);
      const h = t.getState().getShadowMetadata(e, []);
      h?.stateSource === "server" && h.baseServerState ? h.baseServerState : t.getState().initialStateGlobal[e];
      const T = t.getState().initialStateGlobal[e];
      t.getState().clearSelectedIndexesForState(e), y.clear(), I++, t.getState().initializeShadowState(e, T), l({
        currentState: T,
        path: [],
        componentId: m
      });
      const N = ae(e), c = ee(N?.localStorage?.key) ? N?.localStorage?.key(T) : N?.localStorage?.key, H = `${S}-${e}-${c}`;
      H && localStorage.removeItem(H);
      const Z = t.getState().getShadowMetadata(e, []);
      return Z && Z?.components?.forEach((G) => {
        G.forceUpdate();
      }), T;
    },
    updateInitialState: (M) => {
      y.clear(), I++;
      const s = De(
        e,
        i,
        m,
        S
      ), h = t.getState().initialStateGlobal[e], T = ae(e), N = ee(T?.localStorage?.key) ? T?.localStorage?.key(h) : T?.localStorage?.key, c = `${S}-${e}-${N}`;
      return localStorage.getItem(c) && localStorage.removeItem(c), je(() => {
        $e(e, M), t.getState().initializeShadowState(e, M);
        const H = t.getState().getShadowMetadata(e, []);
        H && H?.components?.forEach((Z) => {
          Z.forceUpdate();
        });
      }), {
        fetchId: (H) => s.get()[H]
      };
    }
  };
  return l({
    currentState: t.getState().getShadowValue(e, []),
    componentId: m,
    path: []
  });
}
function ke(e) {
  return de(Je, { proxy: e });
}
function Ge({
  proxy: e,
  rebuildStateShape: i
}) {
  const m = q(null), S = q(`map-${crypto.randomUUID()}`), y = q(!1), I = q(/* @__PURE__ */ new Map());
  Q(() => {
    const l = m.current;
    if (!l || y.current) return;
    const u = setTimeout(() => {
      const P = t.getState().getShadowMetadata(e._stateKey, e._path) || {}, M = P.mapWrappers || [];
      M.push({
        instanceId: S.current,
        mapFn: e._mapFn,
        containerRef: l,
        rebuildStateShape: i,
        path: e._path,
        componentId: S.current,
        meta: e._meta
      }), t.getState().setShadowMetadata(e._stateKey, e._path, {
        ...P,
        mapWrappers: M
      }), y.current = !0, E();
    }, 0);
    return () => {
      if (clearTimeout(u), S.current) {
        const P = t.getState().getShadowMetadata(e._stateKey, e._path) || {};
        P.mapWrappers && (P.mapWrappers = P.mapWrappers.filter(
          (M) => M.instanceId !== S.current
        ), t.getState().setShadowMetadata(e._stateKey, e._path, P));
      }
      I.current.forEach((P) => P.unmount());
    };
  }, []);
  const E = () => {
    const l = m.current;
    if (!l) return;
    const u = t.getState().getShadowValue(
      [e._stateKey, ...e._path].join("."),
      e._meta?.validIds
    );
    if (!Array.isArray(u)) return;
    const P = e._meta?.validIds ?? t.getState().getShadowMetadata(e._stateKey, e._path)?.arrayKeys ?? [], M = i({
      currentState: u,
      path: e._path,
      componentId: S.current,
      meta: e._meta
    });
    u.forEach((s, h) => {
      const T = P[h];
      if (!T) return;
      const N = te(), c = document.createElement("div");
      c.setAttribute("data-item-path", T), l.appendChild(c);
      const H = Ce(c);
      I.current.set(T, H);
      const Z = T.split(".").slice(1);
      H.render(
        de(Me, {
          stateKey: e._stateKey,
          itemComponentId: N,
          itemPath: Z,
          localIndex: h,
          arraySetter: M,
          rebuildStateShape: i,
          renderFn: e._mapFn
        })
      );
    });
  };
  return /* @__PURE__ */ ne("div", { ref: m, "data-map-container": S.current });
}
function Je({
  proxy: e
}) {
  const i = q(null), m = q(null), S = q(!1), y = `${e._stateKey}-${e._path.join(".")}`, I = t.getState().getShadowValue(
    [e._stateKey, ...e._path].join("."),
    e._meta?.validIds
  );
  return Q(() => {
    const E = i.current;
    if (!E || S.current) return;
    const l = setTimeout(() => {
      if (!E.parentElement) {
        console.warn("Parent element not found for signal", y);
        return;
      }
      const u = E.parentElement, M = Array.from(u.childNodes).indexOf(E);
      let s = u.getAttribute("data-parent-id");
      s || (s = `parent-${crypto.randomUUID()}`, u.setAttribute("data-parent-id", s)), m.current = `instance-${crypto.randomUUID()}`;
      const h = t.getState().getShadowMetadata(e._stateKey, e._path) || {}, T = h.signals || [];
      T.push({
        instanceId: m.current,
        parentId: s,
        position: M,
        effect: e._effect
      }), t.getState().setShadowMetadata(e._stateKey, e._path, {
        ...h,
        signals: T
      });
      let N = I;
      if (e._effect)
        try {
          N = new Function(
            "state",
            `return (${e._effect})(state)`
          )(I);
        } catch (H) {
          console.error("Error evaluating effect function:", H);
        }
      N !== null && typeof N == "object" && (N = JSON.stringify(N));
      const c = document.createTextNode(String(N ?? ""));
      E.replaceWith(c), S.current = !0;
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
    ref: i,
    style: { display: "contents" },
    "data-signal-id": y
  });
}
const Me = Re(
  Ze,
  (e, i) => e.itemPath.join(".") === i.itemPath.join(".") && e.stateKey === i.stateKey && e.itemComponentId === i.itemComponentId && e.localIndex === i.localIndex
), Ye = (e) => {
  const [i, m] = X(!1);
  return ge(() => {
    if (!e.current) {
      m(!0);
      return;
    }
    const S = Array.from(e.current.querySelectorAll("img"));
    if (S.length === 0) {
      m(!0);
      return;
    }
    let y = 0;
    const I = () => {
      y++, y === S.length && m(!0);
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
function Ze({
  stateKey: e,
  itemComponentId: i,
  itemPath: m,
  localIndex: S,
  arraySetter: y,
  rebuildStateShape: I,
  renderFn: E
}) {
  const [, l] = X({}), { ref: u, inView: P } = Le(), M = q(null), s = Ye(M), h = q(!1), T = [e, ...m].join(".");
  Ue(e, i, l);
  const N = ue(
    (O) => {
      M.current = O, u(O);
    },
    [u]
  );
  Q(() => {
    t.getState().subscribeToPath(T, (O) => {
      l({});
    });
  }, []), Q(() => {
    if (!P || !s || h.current)
      return;
    const O = M.current;
    if (O && O.offsetHeight > 0) {
      h.current = !0;
      const p = O.offsetHeight;
      t.getState().setShadowMetadata(e, m, {
        virtualizer: {
          itemHeight: p,
          domRef: O
        }
      });
      const K = m.slice(0, -1), re = [e, ...K].join(".");
      t.getState().notifyPathSubscribers(re, {
        type: "ITEMHEIGHT",
        itemKey: m.join("."),
        ref: M.current
      });
    }
  }, [P, s, e, m]);
  const c = [e, ...m].join("."), H = t.getState().getShadowValue(c);
  if (H === void 0)
    return null;
  const Z = I({
    currentState: H,
    path: m,
    componentId: i
  }), G = E(Z, S, y);
  return /* @__PURE__ */ ne("div", { ref: N, children: G });
}
function Qe({
  stateKey: e,
  path: i,
  rebuildStateShape: m,
  renderFn: S,
  formOpts: y,
  setState: I
}) {
  const [E] = X(() => te()), [, l] = X({}), u = [e, ...i].join(".");
  Ue(e, E, l);
  const P = t.getState().getShadowValue(u), [M, s] = X(P), h = q(!1), T = q(null);
  Q(() => {
    !h.current && !le(P, M) && s(P);
  }, [P]), Q(() => {
    const G = t.getState().subscribeToPath(u, (O) => {
      !h.current && M !== O && l({});
    });
    return () => {
      G(), T.current && (clearTimeout(T.current), h.current = !1);
    };
  }, []);
  const N = ue(
    (G) => {
      s(G), h.current = !0, T.current && clearTimeout(T.current);
      const O = y?.debounceTime ?? 200;
      T.current = setTimeout(() => {
        h.current = !1;
        const {
          getInitialOptions: p,
          getValidationErrors: K,
          addValidationError: re,
          removeValidationError: ce
        } = t.getState(), n = p(e)?.validation, r = n?.zodSchemaV4 || n?.zodSchemaV3;
        if (!(y?.sync?.allowInvalidValues ?? !1) && r && n?.key) {
          const d = t.getState().getShadowValue(e), g = Ne(
            JSON.parse(JSON.stringify(d)),
            // Deep copy
            [{ op: "replace", path: "/" + i.join("/"), value: G }]
          ).newDocument, f = r.safeParse(g), $ = n.key + "." + i.join(".");
          if (ce($), !f.success) {
            const _ = "issues" in f.error ? f.error.issues : f.error.errors;
            let D = !1;
            if (_.forEach((R) => {
              JSON.stringify(R.path) === JSON.stringify(i) && (re($, R.message), D = !0);
            }), D) {
              I(G, i, { updateType: "update", sync: !1 }), ie(e);
              return;
            }
          }
        }
        I(G, i, { updateType: "update", sync: !0 });
      }, O);
    },
    [
      I,
      i,
      y?.debounceTime,
      y?.sync?.allowInvalidValues,
      e
    ]
  ), c = ue(() => {
    T.current && (clearTimeout(T.current), N(M));
  }, [M, N]), H = m({
    currentState: P,
    path: i,
    componentId: E
  }), Z = new Proxy(H, {
    get(G, O) {
      return O === "inputProps" ? {
        value: M ?? "",
        onChange: (p) => {
          N(p.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: c,
        ref: ve.getState().getFormRef(e + "." + i.join("."))
      } : G[O];
    }
  });
  return /* @__PURE__ */ ne(Ae, { children: S(Z) });
}
function Ue(e, i, m) {
  const S = `${e}////${i}`;
  ge(() => {
    const { registerComponent: y, unregisterComponent: I } = t.getState();
    return y(e, S, {
      forceUpdate: () => m({}),
      paths: /* @__PURE__ */ new Set(),
      reactiveType: ["component"]
    }), () => {
      I(e, S);
    };
  }, [e, S]);
}
export {
  ke as $cogsSignal,
  lt as addStateOptions,
  ut as createCogsState,
  dt as notifyComponent,
  ze as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
