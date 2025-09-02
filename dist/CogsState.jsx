"use client";
import { jsx as oe, Fragment as Pe } from "react/jsx-runtime";
import { useState as te, useRef as L, useCallback as pe, useEffect as z, useLayoutEffect as le, useMemo as se, createElement as Ae, startTransition as Ce } from "react";
import { transformStateFunc as De, isFunction as Y, isDeepEqual as re } from "./utility.js";
import { ValidationWrapper as Ue, IsolatedComponentWrapper as Oe, FormElementWrapper as je, MemoizedCogsItemWrapper as Fe } from "./Components.jsx";
import Ne from "superjson";
import { v4 as K } from "uuid";
import { getGlobalStore as T, formRefStore as Ie } from "./store.js";
import { useCogsConfig as ke } from "./CogsStateClient.jsx";
const {
  getInitialOptions: G,
  updateInitialStateGlobal: Ve,
  getShadowMetadata: P,
  setShadowMetadata: Z,
  getShadowValue: B,
  initializeShadowState: ie,
  initializeAndMergeShadowState: Re,
  updateShadowAtPath: xe,
  insertShadowArrayElement: Le,
  insertManyShadowArrayElements: Be,
  removeShadowArrayElement: We,
  setInitialStateOptions: ue,
  setServerStateUpdate: Me,
  markAsDirty: Ee,
  addPathComponent: qe,
  clearSelectedIndexesForState: He,
  addStateLog: ze,
  setSyncInfo: wt,
  clearSelectedIndex: Ge,
  getSyncInfo: Je,
  notifyPathSubscribers: Ye
  // Note: The old functions are no longer imported under their original names
} = T.getState();
function H(e, r, g) {
  const i = P(e, r);
  if (!!!i?.arrayKeys)
    return { isArray: !1, value: T.getState().getShadowValue(e, r), keys: [] };
  const u = r.length > 0 ? r.join(".") : "root", l = g?.arrayViews?.[u] ?? i.arrayKeys;
  return Array.isArray(l) && l.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: T.getState().getShadowValue(e, r, l), keys: l ?? [] };
}
function he(e, r, g) {
  for (let i = 0; i < e.length; i++)
    if (g(e[i], i)) {
      const S = r[i];
      if (S)
        return { key: S, index: i, value: e[i] };
    }
  return null;
}
function ve(e, r) {
  const g = G(e) || {};
  ue(e, {
    ...g,
    ...r
  });
}
function $e({
  stateKey: e,
  options: r,
  initialOptionsPart: g
}) {
  const i = G(e) || {};
  let u = { ...g[e] || {}, ...i }, l = !1;
  if (r) {
    const c = (t, s) => {
      for (const f in s)
        s.hasOwnProperty(f) && (s[f] instanceof Object && !Array.isArray(s[f]) && t[f] instanceof Object ? re(t[f], s[f]) || (c(t[f], s[f]), l = !0) : t[f] !== s[f] && (t[f] = s[f], l = !0));
      return t;
    };
    u = c(u, r);
  }
  u.syncOptions && (!r || !r.hasOwnProperty("syncOptions")) && (l = !0), (u.validation && u?.validation?.zodSchemaV4 || u?.validation?.zodSchemaV3) && (r?.validation?.hasOwnProperty("onBlur") || i?.validation?.hasOwnProperty("onBlur") || (u.validation.onBlur = "error")), l && ue(e, u);
}
function pt(e, r) {
  return {
    ...r,
    initialState: e,
    _addStateOptions: !0
  };
}
const Ze = (e, r) => {
  const [g, i] = De(e);
  Object.keys(g).forEach((l) => {
    let c = i[l] || {};
    const t = {
      ...c
    };
    if (r?.formElements && (t.formElements = {
      ...r.formElements,
      ...c.formElements || {}
    }), r?.validation && (t.validation = {
      ...r.validation,
      ...c.validation || {}
    }, r.validation.key && !c.validation?.key && (t.validation.key = `${r.validation.key}.${l}`)), r?.__syncSchemas?.[l]?.schemas?.validation && (t.validation = {
      zodSchemaV4: r.__syncSchemas[l].schemas.validation,
      ...c.validation
    }), Object.keys(t).length > 0) {
      const s = G(l);
      s ? ue(l, {
        ...s,
        ...t
      }) : ue(l, t);
    }
  }), Object.keys(g).forEach((l) => {
    ie(l, g[l]);
  });
  const S = (l, c) => {
    const [t] = te(c?.componentId ?? K()), s = L(c);
    $e({
      stateKey: l,
      options: c,
      initialOptionsPart: i
    });
    const f = B(l, []) || g[l], b = L([]), D = it(f, {
      stateKey: l,
      syncUpdate: c?.syncUpdate,
      componentId: t,
      localStorage: c?.localStorage,
      middleware: c?.middleware,
      reactiveType: c?.reactiveType,
      reactiveDeps: c?.reactiveDeps,
      defaultState: c?.defaultState,
      dependencies: c?.dependencies,
      serverState: c?.serverState,
      syncOptions: c?.syncOptions,
      __useSync: r?.__useSync,
      __pluginDataRef: b
      // Pass the ref, not the data
    }), N = se(
      () => r?.plugins?.filter(($) => $.useHook) || [],
      []
      // Empty deps since plugins shouldn't change
    ).map(($) => {
      const o = c?.[$.name], O = {
        stateKey: l,
        cogsState: D
      };
      console.log("context", O);
      const n = $.useHook?.(
        O,
        o || {}
        // Pass empty object if no options
      );
      return { name: $.name, result: n, hasOptions: !!o };
    }), R = se(() => {
      const $ = /* @__PURE__ */ new Map();
      return N.forEach(({ name: o, result: O, hasOptions: n }) => {
        n && $.set(o, O);
      }), $;
    }, [N, c]);
    return z(() => {
      const $ = [];
      r?.plugins && r.plugins.forEach((o) => {
        const O = c?.[o.name];
        O && $.push({
          plugin: o,
          options: O,
          hookData: R.get(o.name)
        });
      }), b.current = $;
    }, [c, N]), z(() => {
      r?.plugins && (r.plugins.forEach(($) => {
        if ($.name in (c || {})) {
          const o = c?.[$.name];
          if (o && typeof o == "object" && !Array.isArray(o) && $.transformState) {
            const O = s.current?.[$.name];
            if (!O || typeof O == "object" && !Array.isArray(O) && !re(o, O)) {
              console.log(
                `▶️ Options changed for "${$.name}" on state "${String(l)}", running transformState...`
              );
              const n = R.get($.name), a = {
                stateKey: l,
                cogsState: D
              };
              $.transformState(
                a,
                o,
                n
              );
            }
          }
        }
      }), s.current = c);
    }, [c, l, D, N]), D;
  };
  function u(l, c) {
    $e({ stateKey: l, options: c, initialOptionsPart: i }), c.localStorage && Xe(l, c), ce(l);
  }
  return {
    useCogsState: S,
    setCogsOptions: u
  };
};
function Tt(e, r) {
  const g = e.schemas, i = {}, S = {};
  for (const u in g) {
    const l = g[u];
    l?.relations && l?.schemas?.defaults ? i[u] = l.schemas.defaults : i[u] = l?.schemas?.defaults || {}, console.log("initialState", i), l?.api?.queryData?._paramType && (S[u] = l.api.queryData._paramType);
  }
  return Ze(i, {
    __syncNotifications: e.notifications,
    __useSync: r,
    __syncSchemas: g
  });
}
const Qe = (e, r, g, i, S) => {
  g?.log && console.log(
    "saving to localstorage",
    r,
    g.localStorage?.key,
    i
  );
  const u = Y(g?.localStorage?.key) ? g.localStorage?.key(e) : g?.localStorage?.key;
  if (u && i) {
    const l = `${i}-${r}-${u}`;
    let c;
    try {
      c = ge(l)?.lastSyncedWithServer;
    } catch {
    }
    const t = P(r, []), s = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: c,
      stateSource: t?.stateSource,
      baseServerState: t?.baseServerState
    }, f = Ne.serialize(s);
    window.localStorage.setItem(
      l,
      JSON.stringify(f.json)
    );
  }
}, ge = (e) => {
  if (!e) return null;
  try {
    const r = window.localStorage.getItem(e);
    return r ? JSON.parse(r) : null;
  } catch (r) {
    return console.error("Error loading from localStorage:", r), null;
  }
}, Xe = (e, r) => {
  const g = B(e, []), { sessionId: i } = ke(), S = Y(r?.localStorage?.key) ? r.localStorage.key(g) : r?.localStorage?.key;
  if (S && i) {
    const u = ge(
      `${i}-${e}-${S}`
    );
    if (u && u.lastUpdated > (u.lastSyncedWithServer || 0))
      return ce(e), !0;
  }
  return !1;
}, ce = (e) => {
  const r = P(e, []);
  if (!r) return;
  const g = /* @__PURE__ */ new Set();
  r?.components?.forEach((i) => {
    (i ? Array.isArray(i.reactiveType) ? i.reactiveType : [i.reactiveType || "component"] : null)?.includes("none") || g.add(() => i.forceUpdate());
  }), queueMicrotask(() => {
    g.forEach((i) => i());
  });
};
function de(e, r, g, i) {
  const S = P(e, r);
  if (Z(e, r, {
    ...S,
    isDirty: !1,
    stateSource: "server",
    lastServerSync: i || Date.now()
  }), Array.isArray(g)) {
    const u = P(e, r);
    u?.arrayKeys && u.arrayKeys.forEach((l, c) => {
      const t = [...r, l], s = g[c];
      s !== void 0 && de(
        e,
        t,
        s,
        i
      );
    });
  } else g && typeof g == "object" && g.constructor === Object && Object.keys(g).forEach((u) => {
    const l = [...r, u], c = g[u];
    de(e, l, c, i);
  });
}
let fe = [], Te = !1;
function Ke() {
  Te || (Te = !0, queueMicrotask(at));
}
function et(e, r, g) {
  const i = T.getState().getShadowValue(e, r), S = Y(g) ? g(i) : g;
  xe(e, r, S), Ee(e, r, { bubble: !0 });
  const u = P(e, r);
  return {
    type: "update",
    oldValue: i,
    newValue: S,
    shadowMeta: u
  };
}
function tt(e, r) {
  e?.signals?.length && e.signals.forEach(({ parentId: g, position: i, effect: S }) => {
    const u = document.querySelector(`[data-parent-id="${g}"]`);
    if (!u) return;
    const l = Array.from(u.childNodes);
    if (!l[i]) return;
    let c = r;
    if (S && r !== null)
      try {
        c = new Function("state", `return (${S})(state)`)(
          r
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    c !== null && typeof c == "object" && (c = JSON.stringify(c)), l[i].textContent = String(c ?? "");
  });
}
function rt(e, r, g) {
  const i = P(e, []);
  if (!i?.components)
    return /* @__PURE__ */ new Set();
  const S = /* @__PURE__ */ new Set();
  let u = r;
  g.type === "insert" && g.itemId && (u = r);
  let l = [...u];
  for (; ; ) {
    const c = P(e, l);
    if (c?.pathComponents && c.pathComponents.forEach((t) => {
      const s = i.components?.get(t);
      s && ((Array.isArray(s.reactiveType) ? s.reactiveType : [s.reactiveType || "component"]).includes("none") || S.add(s));
    }), l.length === 0) break;
    l.pop();
  }
  return i.components.forEach((c, t) => {
    if (S.has(c))
      return;
    const s = Array.isArray(c.reactiveType) ? c.reactiveType : [c.reactiveType || "component"];
    if (s.includes("all"))
      S.add(c);
    else if (s.includes("deps") && c.depsFunction) {
      const f = B(e, []), b = c.depsFunction(f);
      (b === !0 || Array.isArray(b) && !re(c.prevDeps, b)) && (c.prevDeps = b, S.add(c));
    }
  }), S;
}
function nt(e, r, g, i, S) {
  let u;
  if (Y(g)) {
    const { value: s } = X(e, r);
    u = g({ state: s, uuid: K() });
  } else
    u = g;
  const l = Le(
    e,
    r,
    u,
    i,
    S
  );
  Ee(e, r, { bubble: !0 });
  const c = P(e, r);
  let t;
  return c?.arrayKeys, {
    type: "insert",
    newValue: u,
    shadowMeta: c,
    path: r,
    itemId: l,
    insertAfterId: t
  };
}
function ot(e, r) {
  const g = r.slice(0, -1), i = B(e, r);
  return We(e, r), Ee(e, g, { bubble: !0 }), { type: "cut", oldValue: i, parentPath: g };
}
function at() {
  const e = /* @__PURE__ */ new Set(), r = [], g = [];
  for (const i of fe) {
    if (i.status && i.updateType) {
      g.push(i);
      continue;
    }
    const S = i, u = S.type === "cut" ? null : S.newValue;
    S.shadowMeta?.signals?.length > 0 && r.push({ shadowMeta: S.shadowMeta, displayValue: u }), rt(
      S.stateKey,
      S.path,
      S
    ).forEach((c) => {
      e.add(c);
    });
  }
  g.length > 0 && ze(g), r.forEach(({ shadowMeta: i, displayValue: S }) => {
    tt(i, S);
  }), e.forEach((i) => {
    i.forceUpdate();
  }), fe = [], Te = !1;
}
function st(e, r, g, i, S) {
  return (l, c, t, s) => {
    u(e, c, l, t);
  };
  function u(l, c, t, s) {
    let f;
    switch (s.updateType) {
      case "update":
        f = et(l, c, t);
        break;
      case "insert":
        f = nt(
          l,
          c,
          t,
          void 0,
          s.itemId
        );
        break;
      case "cut":
        f = ot(l, c);
        break;
    }
    f.stateKey = l, f.path = c, fe.push(f), Ke();
    const b = {
      timeStamp: Date.now(),
      stateKey: l,
      path: c,
      updateType: s.updateType,
      status: "new",
      oldValue: f.oldValue,
      newValue: f.newValue ?? null,
      itemId: f.itemId,
      insertAfterId: f.insertAfterId
    };
    fe.push(b), f.newValue !== void 0 && Qe(
      f.newValue,
      l,
      i.current,
      g
    ), i.current?.middleware && i.current.middleware({ update: b }), S?.current && S.current.length > 0 && S.current.forEach((D) => {
      if (D.plugin.onUpdate)
        try {
          D.plugin.onUpdate(
            l,
            b,
            D.options,
            D.hookData
          );
        } catch (F) {
          console.error("Plugin onUpdate error:", F);
        }
    }), s.sync !== !1 && r.current?.connected && r.current.updateState({ operation: b });
  }
}
function it(e, {
  stateKey: r,
  localStorage: g,
  formElements: i,
  reactiveDeps: S,
  reactiveType: u,
  componentId: l,
  defaultState: c,
  syncUpdate: t,
  dependencies: s,
  serverState: f,
  __useSync: b,
  __pluginDataRef: D
} = {}) {
  const [F, N] = te({}), { sessionId: R } = ke();
  let $ = !r;
  const [o] = te(r ?? K()), O = L(l ?? K()), n = L(
    null
  );
  n.current = G(o) ?? null;
  const a = pe(
    (p) => {
      const w = p ? { ...G(o), ...p } : G(o), I = w?.defaultState || c || e;
      if (w?.serverState?.status === "success" && w?.serverState?.data !== void 0)
        return {
          value: w.serverState.data,
          source: "server",
          timestamp: w.serverState.timestamp || Date.now()
        };
      if (w?.localStorage?.key && R) {
        const k = Y(w.localStorage.key) ? w.localStorage.key(I) : w.localStorage.key, A = ge(
          `${R}-${o}-${k}`
        );
        if (A && A.lastUpdated > (w?.serverState?.timestamp || 0))
          return {
            value: A.state,
            source: "localStorage",
            timestamp: A.lastUpdated
          };
      }
      return {
        value: I || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [o, c, e, R]
  );
  z(() => {
    f && f.status === "success" && f.data !== void 0 && Me(o, f);
  }, [f, o]), z(() => T.getState().subscribeToPath(o, (E) => {
    if (E?.type === "SERVER_STATE_UPDATE") {
      const w = E.serverState;
      if (w?.status !== "success" || w.data === void 0)
        return;
      ve(o, { serverState: w });
      const I = typeof w.merge == "object" ? w.merge : w.merge === !0 ? { strategy: "append", key: "id" } : null, M = B(o, []), k = w.data;
      if (I && I.strategy === "append" && "key" in I && Array.isArray(M) && Array.isArray(k)) {
        const A = I.key;
        if (!A) {
          console.error(
            "CogsState: Merge strategy 'append' requires a 'key' field."
          );
          return;
        }
        const V = new Set(
          M.map((W) => W[A])
        ), U = k.filter(
          (W) => !V.has(W[A])
        );
        U.length > 0 && Be(o, [], U);
        const ee = B(o, []);
        de(
          o,
          [],
          ee,
          w.timestamp || Date.now()
        );
      } else
        ie(o, k), de(
          o,
          [],
          k,
          w.timestamp || Date.now()
        );
      ce(o);
    }
  }), [o]), z(() => {
    const p = T.getState().getShadowMetadata(o, []);
    if (p && p.stateSource)
      return;
    const E = G(o), w = {
      syncEnabled: !!h && !!v,
      validationEnabled: !!(E?.validation?.zodSchemaV4 || E?.validation?.zodSchemaV3),
      localStorageEnabled: !!E?.localStorage?.key
    };
    if (Z(o, [], {
      ...p,
      features: w
    }), E?.defaultState !== void 0 || c !== void 0) {
      const A = E?.defaultState || c;
      E?.defaultState || ve(o, {
        defaultState: A
      });
    }
    const { value: I, source: M, timestamp: k } = a();
    ie(o, I), Z(o, [], {
      stateSource: M,
      lastServerSync: M === "server" ? k : void 0,
      isDirty: M === "server" ? !1 : void 0,
      baseServerState: M === "server" ? I : void 0
    }), M === "server" && f && Me(o, f), ce(o);
  }, [o, ...s || []]), le(() => {
    $ && ve(o, {
      formElements: i,
      defaultState: c,
      localStorage: g,
      middleware: n.current?.middleware
    });
    const p = `${o}////${O.current}`, E = P(o, []), w = E?.components || /* @__PURE__ */ new Map();
    return w.set(p, {
      forceUpdate: () => N({}),
      reactiveType: u ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: S || void 0,
      deps: S ? S(B(o, [])) : [],
      prevDeps: S ? S(B(o, [])) : []
    }), Z(o, [], {
      ...E,
      components: w
    }), N({}), () => {
      const I = P(o, []), M = I?.components?.get(p);
      M?.paths && M.paths.forEach((k) => {
        const V = k.split(".").slice(1), U = T.getState().getShadowMetadata(o, V);
        U?.pathComponents && U.pathComponents.size === 0 && (delete U.pathComponents, T.getState().setShadowMetadata(o, V, U));
      }), I?.components && Z(o, [], I);
    };
  }, []);
  const d = L(null), y = st(
    o,
    d,
    R,
    n,
    D
  );
  T.getState().initialStateGlobal[o] || Ve(o, e);
  const m = se(() => _e(
    o,
    y,
    O.current,
    R
  ), [o, R]), h = b, v = n.current?.syncOptions;
  return h && (d.current = h(
    m,
    v ?? {}
  )), m;
}
const ct = (e, r, g) => {
  let i = P(e, r)?.arrayKeys || [];
  const S = g?.transforms;
  if (!S || S.length === 0)
    return i;
  for (const u of S)
    if (u.type === "filter") {
      const l = [];
      i.forEach((c, t) => {
        const s = B(e, [...r, c]);
        u.fn(s, t) && l.push(c);
      }), i = l;
    } else u.type === "sort" && i.sort((l, c) => {
      const t = B(e, [...r, l]), s = B(e, [...r, c]);
      return u.fn(t, s);
    });
  return i;
}, we = (e, r, g) => {
  const i = `${e}////${r}`, u = P(e, [])?.components?.get(i);
  !u || u.reactiveType === "none" || !(Array.isArray(u.reactiveType) ? u.reactiveType : [u.reactiveType]).includes("component") || qe(e, g, i);
}, ae = (e, r, g) => {
  const i = P(e, []), S = /* @__PURE__ */ new Set();
  i?.components && i.components.forEach((l, c) => {
    (Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType || "component"]).includes("all") && (l.forceUpdate(), S.add(c));
  }), P(e, [
    ...r,
    "getSelected"
  ])?.pathComponents?.forEach((l) => {
    i?.components?.get(l)?.forceUpdate();
  });
  const u = P(e, r);
  for (let l of u?.arrayKeys || []) {
    const c = l + ".selected", t = P(e, c.split(".").slice(1));
    l == g && t?.pathComponents?.forEach((s) => {
      i?.components?.get(s)?.forceUpdate();
    });
  }
};
function X(e, r, g) {
  const i = P(e, r), S = r.length > 0 ? r.join(".") : "root", u = g?.arrayViews?.[S];
  if (Array.isArray(u) && u.length === 0)
    return {
      shadowMeta: i,
      value: [],
      arrayKeys: i?.arrayKeys
    };
  const l = B(e, r, u);
  return {
    shadowMeta: i,
    value: l,
    arrayKeys: i?.arrayKeys
  };
}
function _e(e, r, g, i) {
  const S = /* @__PURE__ */ new Map();
  function u({
    path: t = [],
    meta: s,
    componentId: f
  }) {
    const b = s ? JSON.stringify(s.arrayViews || s.transforms) : "", D = t.join(".") + ":" + f + ":" + b;
    if (S.has(D))
      return S.get(D);
    const F = [e, ...t].join("."), N = {
      get($, o) {
        if (t.length === 0 && o in l)
          return l[o];
        if (!o.startsWith("$")) {
          const n = [...t, o];
          return u({
            path: n,
            componentId: f,
            meta: s
          });
        }
        if (o === "$_rebuildStateShape")
          return u;
        if (o === "$sync" && t.length === 0)
          return async function() {
            const n = T.getState().getInitialOptions(e), a = n?.sync;
            if (!a)
              return console.error(`No mutation defined for state key "${e}"`), { success: !1, error: "No mutation defined" };
            const d = T.getState().getShadowValue(e, []), y = n?.validation?.key;
            try {
              const m = await a.action(d);
              if (m && !m.success && m.errors, m?.success) {
                const h = T.getState().getShadowMetadata(e, []);
                Z(e, [], {
                  ...h,
                  isDirty: !1,
                  lastServerSync: Date.now(),
                  stateSource: "server",
                  baseServerState: d
                  // Update base server state
                }), a.onSuccess && a.onSuccess(m.data);
              } else !m?.success && a.onError && a.onError(m.error);
              return m;
            } catch (m) {
              return a.onError && a.onError(m), { success: !1, error: m };
            }
          };
        if (o === "$_status" || o === "$getStatus") {
          const n = () => {
            const { shadowMeta: a, value: d } = X(e, t, s);
            return console.log("getStatusFunc", t, a, d), a?.isDirty === !0 ? "dirty" : a?.stateSource === "server" || a?.isDirty === !1 ? "synced" : a?.stateSource === "localStorage" ? "restored" : a?.stateSource === "default" || d !== void 0 ? "fresh" : "unknown";
          };
          return o === "$_status" ? n() : n;
        }
        if (o === "$removeStorage")
          return () => {
            const n = T.getState().initialStateGlobal[e], a = G(e), d = Y(a?.localStorage?.key) ? a.localStorage.key(n) : a?.localStorage?.key, y = `${i}-${e}-${d}`;
            y && localStorage.removeItem(y);
          };
        if (o === "$showValidationErrors")
          return () => {
            const { shadowMeta: n } = X(e, t, s);
            return n?.validation?.status === "INVALID" && n.validation.errors.length > 0 ? n.validation.errors.filter((a) => a.severity === "error").map((a) => a.message) : [];
          };
        if (o === "$getSelected")
          return () => {
            const n = [e, ...t].join(".");
            we(e, f, [
              ...t,
              "getSelected"
            ]);
            const a = T.getState().selectedIndicesMap.get(n);
            if (!a)
              return;
            const d = t.join("."), y = s?.arrayViews?.[d], m = a.split(".").pop();
            if (!(y && !y.includes(m) || B(
              e,
              a.split(".").slice(1)
            ) === void 0))
              return u({
                path: a.split(".").slice(1),
                componentId: f,
                meta: s
              });
          };
        if (o === "$getSelectedIndex")
          return () => {
            const n = e + "." + t.join(".");
            t.join(".");
            const a = T.getState().selectedIndicesMap.get(n);
            if (!a)
              return -1;
            const { keys: d } = H(e, t, s);
            if (!d)
              return -1;
            const y = a.split(".").pop();
            return d.indexOf(y);
          };
        if (o === "$clearSelected")
          return ae(e, t), () => {
            Ge({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (o === "$useVirtualView")
          return (n) => {
            const {
              itemHeight: a = 50,
              overscan: d = 6,
              stickToBottom: y = !1,
              scrollStickTolerance: m = 75
            } = n, h = L(null), [v, p] = te({
              startIndex: 0,
              endIndex: 10
            }), [E, w] = te({}), I = L(!0);
            z(() => {
              const C = setInterval(() => {
                w({});
              }, 1e3);
              return () => clearInterval(C);
            }, []);
            const M = L({
              isUserScrolling: !1,
              lastScrollTop: 0,
              scrollUpCount: 0,
              isNearBottom: !0
            }), k = L(
              /* @__PURE__ */ new Map()
            ), { keys: A } = H(e, t, s);
            z(() => {
              const C = [e, ...t].join("."), _ = T.getState().subscribeToPath(C, (x) => {
                x.type !== "GET_SELECTED" && x.type;
              });
              return () => {
                _();
              };
            }, [f, e, t.join(".")]), le(() => {
              if (y && A.length > 0 && h.current && !M.current.isUserScrolling && I.current) {
                const C = h.current, _ = () => {
                  if (C.clientHeight > 0) {
                    const x = Math.ceil(
                      C.clientHeight / a
                    ), q = A.length - 1, j = Math.max(
                      0,
                      q - x - d
                    );
                    p({ startIndex: j, endIndex: q }), requestAnimationFrame(() => {
                      W("instant"), I.current = !1;
                    });
                  } else
                    requestAnimationFrame(_);
                };
                _();
              }
            }, [A.length, y, a, d]);
            const V = L(v);
            le(() => {
              V.current = v;
            }, [v]);
            const U = L(A);
            le(() => {
              U.current = A;
            }, [A]);
            const ee = pe(() => {
              const C = h.current;
              if (!C) return;
              const _ = C.scrollTop, { scrollHeight: x, clientHeight: q } = C, j = M.current, ne = x - (_ + q), Se = j.isNearBottom;
              j.isNearBottom = ne <= m, _ < j.lastScrollTop ? (j.scrollUpCount++, j.scrollUpCount > 3 && Se && (j.isUserScrolling = !0, console.log("User scrolled away from bottom"))) : j.isNearBottom && (j.isUserScrolling = !1, j.scrollUpCount = 0), j.lastScrollTop = _;
              let Q = 0;
              for (let J = 0; J < A.length; J++) {
                const ye = A[J], me = k.current.get(ye);
                if (me && me.offset + me.height > _) {
                  Q = J;
                  break;
                }
              }
              if (console.log(
                "hadnlescroll ",
                k.current,
                Q,
                v
              ), Q !== v.startIndex && v.startIndex != 0) {
                const J = Math.ceil(q / a);
                p({
                  startIndex: Math.max(0, Q - d),
                  endIndex: Math.min(
                    A.length - 1,
                    Q + J + d
                  )
                });
              }
            }, [
              A.length,
              v.startIndex,
              a,
              d,
              m
            ]);
            z(() => {
              const C = h.current;
              if (C)
                return C.addEventListener("scroll", ee, {
                  passive: !0
                }), () => {
                  C.removeEventListener("scroll", ee);
                };
            }, [ee, y]);
            const W = pe(
              (C = "smooth") => {
                const _ = h.current;
                if (!_) return;
                M.current.isUserScrolling = !1, M.current.isNearBottom = !0, M.current.scrollUpCount = 0;
                const x = () => {
                  const q = (j = 0) => {
                    if (j > 5) return;
                    const ne = _.scrollHeight, Se = _.scrollTop, Q = _.clientHeight;
                    Se + Q >= ne - 1 || (_.scrollTo({
                      top: ne,
                      behavior: C
                    }), setTimeout(() => {
                      const J = _.scrollHeight, ye = _.scrollTop;
                      (J !== ne || ye + Q < J - 1) && q(j + 1);
                    }, 50));
                  };
                  q();
                };
                "requestIdleCallback" in window ? requestIdleCallback(x, { timeout: 100 }) : requestAnimationFrame(() => {
                  requestAnimationFrame(x);
                });
              },
              []
            );
            return z(() => {
              if (!y || !h.current) return;
              const C = h.current, _ = M.current;
              let x;
              const q = () => {
                clearTimeout(x), x = setTimeout(() => {
                  !_.isUserScrolling && _.isNearBottom && W(
                    I.current ? "instant" : "smooth"
                  );
                }, 100);
              }, j = new MutationObserver(() => {
                _.isUserScrolling || q();
              });
              return j.observe(C, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["style", "class"]
              }), I.current ? setTimeout(() => {
                W("instant");
              }, 0) : q(), () => {
                clearTimeout(x), j.disconnect();
              };
            }, [y, A.length, W]), {
              virtualState: se(() => {
                const C = Array.isArray(A) ? A.slice(v.startIndex, v.endIndex + 1) : [], _ = t.length > 0 ? t.join(".") : "root";
                return u({
                  path: t,
                  componentId: f,
                  meta: {
                    ...s,
                    arrayViews: { [_]: C },
                    serverStateIsUpStream: !0
                  }
                });
              }, [v.startIndex, v.endIndex, A, s]),
              virtualizerProps: {
                outer: {
                  ref: h,
                  style: {
                    overflowY: "auto",
                    height: "100%",
                    position: "relative"
                  }
                },
                inner: {
                  style: {
                    position: "relative"
                  }
                },
                list: {
                  style: {
                    transform: `translateY(${k.current.get(A[v.startIndex])?.offset || 0}px)`
                  }
                }
              },
              scrollToBottom: W,
              scrollToIndex: (C, _ = "smooth") => {
                if (h.current && A[C]) {
                  const x = k.current.get(A[C])?.offset || 0;
                  h.current.scrollTo({ top: x, behavior: _ });
                }
              }
            };
          };
        if (o === "$stateMap")
          return (n) => {
            const { value: a, keys: d } = H(
              e,
              t,
              s
            );
            if (we(e, f, t), !d || !Array.isArray(a))
              return [];
            const y = u({
              path: t,
              componentId: f,
              meta: s
            });
            return a.map((m, h) => {
              const v = d[h];
              if (!v) return;
              const p = [...t, v], E = u({
                path: p,
                // This now correctly points to the item in the shadow store.
                componentId: f,
                meta: s
              });
              return n(E, h, y);
            });
          };
        if (o === "$stateFilter")
          return (n) => {
            const a = t.length > 0 ? t.join(".") : "root", { keys: d, value: y } = H(
              e,
              t,
              s
            );
            if (!Array.isArray(y))
              throw new Error("stateFilter can only be used on arrays");
            const m = [];
            return y.forEach((h, v) => {
              if (n(h, v)) {
                const p = d[v];
                p && m.push(p);
              }
            }), u({
              path: t,
              componentId: f,
              meta: {
                ...s,
                arrayViews: {
                  ...s?.arrayViews || {},
                  [a]: m
                },
                transforms: [
                  ...s?.transforms || [],
                  { type: "filter", fn: n, path: t }
                ]
              }
            });
          };
        if (o === "$stateSort")
          return (n) => {
            const a = t.length > 0 ? t.join(".") : "root", { value: d, keys: y } = H(
              e,
              t,
              s
            );
            if (!Array.isArray(d) || !y)
              throw new Error("No array keys found for sorting");
            const m = d.map((v, p) => ({
              item: v,
              key: y[p]
            }));
            m.sort((v, p) => n(v.item, p.item));
            const h = m.map((v) => v.key);
            return u({
              path: t,
              componentId: f,
              meta: {
                ...s,
                arrayViews: {
                  ...s?.arrayViews || {},
                  [a]: h
                },
                transforms: [
                  ...s?.transforms || [],
                  { type: "sort", fn: n, path: t }
                ]
              }
            });
          };
        if (o === "$stream")
          return function(n = {}) {
            const {
              bufferSize: a = 100,
              flushInterval: d = 100,
              bufferStrategy: y = "accumulate",
              store: m,
              onFlush: h
            } = n;
            let v = [], p = !1, E = null;
            const w = (V) => {
              if (!p) {
                if (y === "sliding" && v.length >= a)
                  v.shift();
                else if (y === "dropping" && v.length >= a)
                  return;
                v.push(V), v.length >= a && I();
              }
            }, I = () => {
              if (v.length === 0) return;
              const V = [...v];
              if (v = [], m) {
                const U = m(V);
                U !== void 0 && (Array.isArray(U) ? U : [U]).forEach((W) => {
                  r(W, t, {
                    updateType: "insert"
                  });
                });
              } else
                V.forEach((U) => {
                  r(U, t, {
                    updateType: "insert"
                  });
                });
              h?.(V);
            };
            d > 0 && (E = setInterval(I, d));
            const M = K(), k = P(e, t) || {}, A = k.streams || /* @__PURE__ */ new Map();
            return A.set(M, { buffer: v, flushTimer: E }), Z(e, t, {
              ...k,
              streams: A
            }), {
              write: (V) => w(V),
              writeMany: (V) => V.forEach(w),
              flush: () => I(),
              pause: () => {
                p = !0;
              },
              resume: () => {
                p = !1, v.length > 0 && I();
              },
              close: () => {
                I(), E && clearInterval(E);
                const V = T.getState().getShadowMetadata(e, t);
                V?.streams && V.streams.delete(M);
              }
            };
          };
        if (o === "$stateList")
          return (n) => /* @__PURE__ */ oe(() => {
            const d = L(/* @__PURE__ */ new Map()), [y, m] = te({}), h = t.length > 0 ? t.join(".") : "root", v = ct(e, t, s), p = se(() => ({
              ...s,
              arrayViews: {
                ...s?.arrayViews || {},
                [h]: v
              }
            }), [s, h, v]), { value: E } = H(
              e,
              t,
              p
            );
            if (z(() => {
              const M = T.getState().subscribeToPath(F, (k) => {
                if (k.type === "GET_SELECTED")
                  return;
                const V = T.getState().getShadowMetadata(e, t)?.transformCaches;
                if (V)
                  for (const U of V.keys())
                    U.startsWith(f) && V.delete(U);
                (k.type === "INSERT" || k.type === "INSERT_MANY" || k.type === "REMOVE" || k.type === "CLEAR_SELECTION" || k.type === "SERVER_STATE_UPDATE" && !s?.serverStateIsUpStream) && m({});
              });
              return () => {
                M();
              };
            }, [f, F]), !Array.isArray(E))
              return null;
            const w = u({
              path: t,
              componentId: f,
              meta: p
              // Use updated meta here
            }), I = E.map((M, k) => {
              const A = v[k];
              if (!A)
                return null;
              let V = d.current.get(A);
              V || (V = K(), d.current.set(A, V));
              const U = [...t, A];
              return Ae(Fe, {
                key: A,
                stateKey: e,
                itemComponentId: V,
                itemPath: U,
                localIndex: k,
                arraySetter: w,
                rebuildStateShape: u,
                renderFn: n
              });
            });
            return /* @__PURE__ */ oe(Pe, { children: I });
          }, {});
        if (o === "$stateFlattenOn")
          return (n) => {
            const a = t.length > 0 ? t.join(".") : "root", d = s?.arrayViews?.[a], y = T.getState().getShadowValue(e, t, d);
            return Array.isArray(y) ? u({
              path: [...t, "[*]", n],
              componentId: f,
              meta: s
            }) : [];
          };
        if (o === "$index")
          return (n) => {
            const a = t.length > 0 ? t.join(".") : "root", d = s?.arrayViews?.[a];
            if (d) {
              const h = d[n];
              return h ? u({
                path: [...t, h],
                componentId: f,
                meta: s
              }) : void 0;
            }
            const y = P(e, t);
            if (!y?.arrayKeys) return;
            const m = y.arrayKeys[n];
            if (m)
              return u({
                path: [...t, m],
                componentId: f,
                meta: s
              });
          };
        if (o === "$last")
          return () => {
            const { keys: n } = H(e, t, s);
            if (!n || n.length === 0)
              return;
            const a = n[n.length - 1];
            if (!a)
              return;
            const d = [...t, a];
            return u({
              path: d,
              componentId: f,
              meta: s
            });
          };
        if (o === "$insert")
          return (n, a) => {
            r(n, t, { updateType: "insert" });
          };
        if (o === "$uniqueInsert")
          return (n, a, d) => {
            const { value: y } = X(
              e,
              t,
              s
            ), m = Y(n) ? n(y) : n;
            let h = null;
            if (!y.some((p) => {
              const E = a ? a.every(
                (w) => re(p[w], m[w])
              ) : re(p, m);
              return E && (h = p), E;
            }))
              r(m, t, { updateType: "insert" });
            else if (d && h) {
              const p = d(h), E = y.map(
                (w) => re(w, h) ? p : w
              );
              r(E, t, {
                updateType: "update"
              });
            }
          };
        if (o === "$cut")
          return (n, a) => {
            const d = P(e, t);
            if (!d?.arrayKeys || d.arrayKeys.length === 0)
              return;
            const y = n === -1 ? d.arrayKeys.length - 1 : n !== void 0 ? n : d.arrayKeys.length - 1, m = d.arrayKeys[y];
            m && r(null, [...t, m], {
              updateType: "cut"
            });
          };
        if (o === "$cutSelected")
          return () => {
            const n = [e, ...t].join("."), { keys: a } = H(e, t, s);
            if (!a || a.length === 0)
              return;
            const d = T.getState().selectedIndicesMap.get(n);
            if (!d)
              return;
            const y = d.split(".").pop();
            if (!a.includes(y))
              return;
            const m = d.split(".").slice(1);
            T.getState().clearSelectedIndex({ arrayKey: n });
            const h = m.slice(0, -1);
            ae(e, h), r(null, m, {
              updateType: "cut"
            });
          };
        if (o === "$cutByValue")
          return (n) => {
            const {
              isArray: a,
              value: d,
              keys: y
            } = H(e, t, s);
            if (!a) return;
            const m = he(d, y, (h) => h === n);
            m && r(null, [...t, m.key], {
              updateType: "cut"
            });
          };
        if (o === "$toggleByValue")
          return (n) => {
            const {
              isArray: a,
              value: d,
              keys: y
            } = H(e, t, s);
            if (!a) return;
            const m = he(d, y, (h) => h === n);
            if (m) {
              const h = [...t, m.key];
              r(null, h, {
                updateType: "cut"
              });
            } else
              r(n, t, { updateType: "insert" });
          };
        if (o === "$findWith")
          return (n, a) => {
            const { isArray: d, value: y, keys: m } = H(e, t, s);
            if (!d)
              throw new Error("findWith can only be used on arrays");
            const h = he(
              y,
              m,
              (v) => v?.[n] === a
            );
            return u(h ? {
              path: [...t, h.key],
              componentId: f,
              meta: s
            } : {
              path: [...t, `not_found_${K()}`],
              componentId: f,
              meta: s
            });
          };
        if (o === "$cutThis") {
          const { value: n } = X(e, t, s), a = t.slice(0, -1);
          return ae(e, a), () => {
            r(n, t, { updateType: "cut" });
          };
        }
        if (o === "$get")
          return () => {
            we(e, f, t);
            const { value: n } = X(e, t, s);
            return n;
          };
        if (o === "$$derive")
          return (n) => be({
            _stateKey: e,
            _path: t,
            _effect: n.toString(),
            _meta: s
          });
        if (o === "$$get")
          return () => be({ _stateKey: e, _path: t, _meta: s });
        if (o === "$lastSynced") {
          const n = `${e}:${t.join(".")}`;
          return Je(n);
        }
        if (o == "getLocalStorage")
          return (n) => ge(i + "-" + e + "-" + n);
        if (o === "$isSelected") {
          const n = t.slice(0, -1);
          if (P(e, n)?.arrayKeys) {
            const d = e + "." + n.join("."), y = T.getState().selectedIndicesMap.get(d), m = e + "." + t.join(".");
            return y === m;
          }
          return;
        }
        if (o === "$setSelected")
          return (n) => {
            const a = t.slice(0, -1), d = e + "." + a.join("."), y = e + "." + t.join(".");
            ae(e, a, void 0), T.getState().selectedIndicesMap.get(d), n && T.getState().setSelectedIndex(d, y);
          };
        if (o === "$toggleSelected")
          return () => {
            const n = t.slice(0, -1), a = e + "." + n.join("."), d = e + "." + t.join(".");
            T.getState().selectedIndicesMap.get(a) === d ? T.getState().clearSelectedIndex({ arrayKey: a }) : T.getState().setSelectedIndex(a, d), ae(e, n);
          };
        if (o === "$_componentId")
          return f;
        if (t.length == 0) {
          if (o === "$addZodValidation")
            return (n, a) => {
              n.forEach((d) => {
                const y = T.getState().getShadowMetadata(e, d.path) || {};
                T.getState().setShadowMetadata(e, d.path, {
                  ...y,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: a || "client",
                        message: d.message,
                        severity: "error",
                        code: d.code
                      }
                    ],
                    lastValidated: Date.now(),
                    validatedValue: void 0
                  }
                });
              });
            };
          if (o === "$clearZodValidation")
            return (n) => {
              if (!n)
                throw new Error("clearZodValidation requires a path");
              const a = P(e, n) || {};
              Z(e, n, {
                ...a,
                validation: {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            };
          if (o === "$applyOperation")
            return (n) => {
              const a = n.validation || [];
              if (!n || !n.path) {
                console.error(
                  "Invalid operation received by $applyOperation:",
                  n
                );
                return;
              }
              const d = a.map((y) => ({
                source: "sync_engine",
                message: y.message,
                severity: "warning",
                code: y.code
              }));
              T.getState().setShadowMetadata(e, n.path, {
                validation: {
                  status: d.length > 0 ? "INVALID" : "VALID",
                  errors: d,
                  lastValidated: Date.now()
                }
              }), r(n.newValue, n.path, {
                updateType: n.updateType,
                sync: !1,
                itemId: n.itemId
              });
            };
          if (o === "$applyJsonPatch")
            return (n) => {
              const a = T.getState(), d = a.getShadowMetadata(e, []);
              if (!d?.components) return;
              const y = (h) => !h || h === "/" ? [] : h.split("/").slice(1).map((v) => v.replace(/~1/g, "/").replace(/~0/g, "~")), m = /* @__PURE__ */ new Set();
              for (const h of n) {
                const v = y(h.path);
                switch (h.op) {
                  case "add":
                  case "replace": {
                    const { value: p } = h;
                    a.updateShadowAtPath(e, v, p), a.markAsDirty(e, v, { bubble: !0 });
                    let E = [...v];
                    for (; ; ) {
                      const w = a.getShadowMetadata(
                        e,
                        E
                      );
                      if (w?.pathComponents && w.pathComponents.forEach((I) => {
                        if (!m.has(I)) {
                          const M = d.components?.get(I);
                          M && (M.forceUpdate(), m.add(I));
                        }
                      }), E.length === 0) break;
                      E.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const p = v.slice(0, -1);
                    a.removeShadowArrayElement(e, v), a.markAsDirty(e, p, { bubble: !0 });
                    let E = [...p];
                    for (; ; ) {
                      const w = a.getShadowMetadata(
                        e,
                        E
                      );
                      if (w?.pathComponents && w.pathComponents.forEach((I) => {
                        if (!m.has(I)) {
                          const M = d.components?.get(I);
                          M && (M.forceUpdate(), m.add(I));
                        }
                      }), E.length === 0) break;
                      E.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (o === "$getComponents")
            return () => P(e, [])?.components;
          if (o === "$getAllFormRefs")
            return () => Ie.getState().getFormRefsByStateKey(e);
        }
        if (o === "$getFormRef")
          return () => Ie.getState().getFormRef(e + "." + t.join("."));
        if (o === "$validationWrapper")
          return ({
            children: n,
            hideMessage: a
          }) => /* @__PURE__ */ oe(
            Ue,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: n
            }
          );
        if (o === "$_stateKey") return e;
        if (o === "$_path") return t;
        if (o === "$update")
          return (n) => (r(n, t, { updateType: "update" }), {
            synced: () => {
              const a = T.getState().getShadowMetadata(e, t);
              Z(e, t, {
                ...a,
                isDirty: !1,
                stateSource: "server",
                lastServerSync: Date.now()
              });
              const d = [e, ...t].join(".");
              Ye(d, {
                type: "SYNC_STATUS_CHANGE",
                isDirty: !1
              });
            }
          });
        if (o === "$toggle") {
          const { value: n } = X(
            e,
            t,
            s
          );
          if (typeof n != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            r(!n, t, {
              updateType: "update"
            });
          };
        }
        if (o === "$isolate")
          return (n) => /* @__PURE__ */ oe(
            Oe,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: u,
              renderFn: n
            }
          );
        if (o === "$formElement")
          return (n, a) => /* @__PURE__ */ oe(
            je,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: u,
              setState: r,
              formOpts: a,
              renderFn: n
            }
          );
        const O = [...t, o];
        return u({
          path: O,
          componentId: f,
          meta: s
        });
      }
    }, R = new Proxy({}, N);
    return S.set(D, R), R;
  }
  const l = {
    $revertToInitialState: (t) => {
      const s = T.getState().getShadowMetadata(e, []);
      let f;
      s?.stateSource === "server" && s.baseServerState ? f = s.baseServerState : f = T.getState().initialStateGlobal[e], He(e), ie(e, f), u({
        path: [],
        componentId: g
      });
      const b = G(e), D = Y(b?.localStorage?.key) ? b?.localStorage?.key(f) : b?.localStorage?.key, F = `${i}-${e}-${D}`;
      return F && localStorage.removeItem(F), ce(e), f;
    },
    $initializeAndMergeShadowState: (t) => {
      Re(e, t);
    },
    $updateInitialState: (t) => {
      const s = _e(
        e,
        r,
        g,
        i
      ), f = T.getState().initialStateGlobal[e], b = G(e), D = Y(b?.localStorage?.key) ? b?.localStorage?.key(f) : b?.localStorage?.key, F = `${i}-${e}-${D}`;
      return localStorage.getItem(F) && localStorage.removeItem(F), Ce(() => {
        Ve(e, t), ie(e, t);
        const N = T.getState().getShadowMetadata(e, []);
        N && N?.components?.forEach((R) => {
          R.forceUpdate();
        });
      }), {
        fetchId: (N) => s.$get()[N]
      };
    }
  };
  return u({
    componentId: g,
    path: []
  });
}
function be(e) {
  return Ae(lt, { proxy: e });
}
function lt({
  proxy: e
}) {
  const r = L(null), g = L(null), i = L(!1), S = `${e._stateKey}-${e._path.join(".")}`, u = e._path.length > 0 ? e._path.join(".") : "root", l = e._meta?.arrayViews?.[u], c = B(e._stateKey, e._path, l);
  return z(() => {
    const t = r.current;
    if (!t || i.current) return;
    const s = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", S);
        return;
      }
      const f = t.parentElement, D = Array.from(f.childNodes).indexOf(t);
      let F = f.getAttribute("data-parent-id");
      F || (F = `parent-${crypto.randomUUID()}`, f.setAttribute("data-parent-id", F)), g.current = `instance-${crypto.randomUUID()}`;
      const N = T.getState().getShadowMetadata(e._stateKey, e._path) || {}, R = N.signals || [];
      R.push({
        instanceId: g.current,
        parentId: F,
        position: D,
        effect: e._effect
      }), T.getState().setShadowMetadata(e._stateKey, e._path, {
        ...N,
        signals: R
      });
      let $ = c;
      if (e._effect)
        try {
          $ = new Function(
            "state",
            `return (${e._effect})(state)`
          )(c);
        } catch (O) {
          console.error("Error evaluating effect function:", O);
        }
      $ !== null && typeof $ == "object" && ($ = JSON.stringify($));
      const o = document.createTextNode(String($ ?? ""));
      t.replaceWith(o), i.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(s), g.current) {
        const f = T.getState().getShadowMetadata(e._stateKey, e._path) || {};
        f.signals && (f.signals = f.signals.filter(
          (b) => b.instanceId !== g.current
        ), T.getState().setShadowMetadata(e._stateKey, e._path, f));
      }
    };
  }, []), Ae("span", {
    ref: r,
    style: { display: "contents" },
    "data-signal-id": S
  });
}
export {
  be as $cogsSignal,
  pt as addStateOptions,
  Ze as createCogsState,
  Tt as createCogsStateFromSync,
  it as useCogsStateFn
};
//# sourceMappingURL=CogsState.jsx.map
