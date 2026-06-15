"use client";
import { jsx as H, Fragment as $e } from "react/jsx-runtime";
import { pluginStore as R } from "./pluginStore.js";
import { useState as te, useRef as G, useCallback as Ee, useEffect as ue, useLayoutEffect as K, useMemo as we, createElement as de, startTransition as Te } from "react";
import { transformStateFunc as Ie, isFunction as W, isDeepEqual as Y, isArray as be, getDifferences as ke } from "./utility.js";
import { ValidationWrapper as De, IsolatedComponentWrapper as Ce, FormElementWrapper as Oe, MemoizedCogsItemWrapper as _e } from "./Components.js";
import je from "superjson";
import { v4 as ne } from "uuid";
import { getGlobalStore as V, updateShadowTypeInfo as J } from "./store.js";
import { useCogsConfig as ve } from "./CogsStateClient.js";
import { runValidation as Ne } from "./validation.js";
const {
  getInitialOptions: _,
  updateInitialStateGlobal: pe,
  getShadowMetadata: $,
  setShadowMetadata: ee,
  getShadowValue: O,
  initializeShadowState: re,
  initializeAndMergeShadowState: Fe,
  updateShadowAtPath: ze,
  insertShadowArrayElement: Ue,
  insertManyShadowArrayElements: Le,
  removeShadowArrayElement: Re,
  setInitialStateOptions: fe,
  addPathComponent: We,
  clearSelectedIndexesForState: Be,
  addStateLog: Ge,
  clearSelectedIndex: qe,
  notifyPathSubscribers: At,
  getPluginMetaDataMap: ge,
  setPluginMetaData: Se,
  removePluginMetaData: me
} = V.getState(), { notifyUpdate: xe } = R.getState();
function U(e, r, c) {
  const a = $(e, r);
  if (!!!a?.arrayKeys)
    return { isArray: !1, value: V.getState().getShadowValue(e, r), keys: [] };
  const l = r.length > 0 ? r.join(".") : "root", h = c?.arrayViews?.[l] ?? a.arrayKeys;
  return Array.isArray(h) && h.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: V.getState().getShadowValue(e, r, h), keys: h ?? [] };
}
function ie(e, r, c) {
  for (let a = 0; a < e.length; a++)
    if (c(e[a], a)) {
      const f = r[a];
      if (f)
        return { key: f, index: a, value: e[a] };
    }
  return null;
}
function ye(e, r) {
  const a = {
    ..._(e) || {},
    ...r
  };
  (a.validation?.zodSchemaV4 || a.validation?.zodSchemaV3) && !a.validation?.onBlur && (a.validation.onBlur = "error"), fe(e, a);
}
function ce({
  stateKey: e,
  options: r,
  initialOptionsPart: c
}) {
  const a = _(e) || {}, f = c[e] || {};
  let l = { ...f, ...a }, h = !1;
  if (r) {
    const m = (t, o) => {
      for (const d in o)
        o.hasOwnProperty(d) && (o[d] instanceof Object && !Array.isArray(o[d]) && t[d] instanceof Object ? Y(t[d], o[d]) || (m(t[d], o[d]), h = !0) : t[d] !== o[d] && (t[d] = o[d], h = !0));
      return t;
    };
    l = m(l, r);
  }
  if (l.validation && (r?.validation?.hasOwnProperty("onBlur") || a?.validation?.hasOwnProperty("onBlur") || f?.validation?.hasOwnProperty("onBlur") || (l.validation.onBlur = "error", h = !0)), h) {
    fe(e, l);
    const m = l.validation?.zodSchemaV4, t = l.validation?.zodSchemaV3;
    (m !== a?.validation?.zodSchemaV4 || t !== a?.validation?.zodSchemaV3) && (m || t) && (m ? J(e, m, "zod4") : t && J(e, t, "zod3"), F(e));
  }
  return l;
}
const Mt = (e, r) => {
  r?.plugins && R.getState().setRegisteredPlugins(r.plugins);
  const c = {};
  if (r?.plugins)
    for (const o of r.plugins)
      typeof o.initialState == "function" && Object.assign(c, o.initialState());
  const a = { ...c, ...e }, [f, l] = Ie(a);
  Object.keys(f).forEach((o) => {
    let d = {};
    r?.formElements && (d.formElements = r.formElements), d.validation = {
      onBlur: "error",
      ...r?.validation
    };
    const P = _(o), E = P ? {
      ...P,
      formElements: r?.formElements,
      validation: {
        ...P.validation,
        ...d.validation
      }
    } : d;
    Object.keys(E).length > 0 && fe(o, E);
  }), Object.keys(f).forEach((o) => {
    re(o, f[o]);
  });
  const h = (o, d) => {
    const [P] = te(d?.componentId ?? ne()), E = ce({
      stateKey: o,
      options: d,
      initialOptionsPart: l
    }), w = G(E);
    w.current = E;
    const b = O(o, []) || f[o], D = at(b, {
      stateKey: o,
      componentId: P,
      localStorage: d?.localStorage,
      middleware: d?.middleware,
      reactiveType: d?.reactiveType,
      reactiveDeps: d?.reactiveDeps,
      defaultState: d?.defaultState,
      dependencies: d?.dependencies
    });
    return K(() => {
      d && R.getState().setPluginOptionsForState(o, d);
    }, [o, d]), K(() => (R.getState().registerStateHandler(o, D), () => {
      R.getState().unregisterStateHandler(o);
    }), [o, D]), K(() => {
      const k = _(o)?.validation;
      k?.zodSchemaV4 ? J(o, k.zodSchemaV4, "zod4") : k?.zodSchemaV3 && J(o, k.zodSchemaV3, "zod3");
    }), D;
  };
  function m(o, d) {
    if (ce({ stateKey: o, options: d, initialOptionsPart: l }), d.localStorage && He(o, d), d.formElements) {
      const E = R.getState().registeredPlugins.map((w) => d.formElements.hasOwnProperty(w.name) ? {
        ...w,
        formWrapper: d.formElements[w.name]
      } : w);
      R.getState().setRegisteredPlugins(E);
    }
    F(o);
  }
  function t(o) {
    Object.keys(f).forEach((P) => {
      m(P, o);
    });
  }
  return {
    useCogsState: h,
    setCogsOptionsByKey: m,
    setCogsOptions: t
  };
}, Je = (e, r, c, a, f) => {
  c?.log && console.log(
    "saving to localstorage",
    r,
    c.localStorage?.key,
    a
  );
  const l = W(c?.localStorage?.key) ? c.localStorage?.key(e) : c?.localStorage?.key;
  if (l && a) {
    const h = `${a}-${r}-${l}`;
    let m;
    try {
      m = oe(h)?.lastSyncedWithServer;
    } catch {
    }
    $(r, []);
    const t = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: m
    }, o = je.serialize(t);
    window.localStorage.setItem(
      h,
      JSON.stringify(o.json)
    );
  }
}, oe = (e) => {
  if (!e) return null;
  try {
    const r = window.localStorage.getItem(e);
    return r ? JSON.parse(r) : null;
  } catch (r) {
    return console.error("Error loading from localStorage:", r), null;
  }
}, se = (e) => {
  if (e)
    try {
      typeof window < "u" && window.localStorage && window.localStorage.removeItem(e);
    } catch (r) {
      console.error("Error removing from localStorage:", r);
    }
}, He = (e, r) => {
  const c = O(e, []), { sessionId: a } = ve(), f = W(r?.localStorage?.key) ? r.localStorage.key(c) : r?.localStorage?.key;
  if (f && a) {
    const l = oe(
      `${a}-${e}-${f}`
    );
    if (l && l.lastUpdated > (l.lastSyncedWithServer || 0))
      return F(e), !0;
  }
  return !1;
}, F = (e) => {
  const r = $(e, []);
  if (!r) return;
  const c = /* @__PURE__ */ new Set();
  r?.components?.forEach((a) => {
    (a ? Array.isArray(a.reactiveType) ? a.reactiveType : [a.reactiveType || "component"] : null)?.includes("none") || c.add(() => a.forceUpdate());
  }), queueMicrotask(() => {
    c.forEach((a) => a());
  });
};
let ae = [], le = !1;
function Qe() {
  le || (le = !0, queueMicrotask(() => {
    nt();
  }));
}
function Ze(e, r) {
  e?.signals?.length && e.signals.forEach(({ parentId: c, position: a, effect: f }) => {
    const l = document.querySelector(`[data-parent-id="${c}"]`);
    if (!l) return;
    const h = Array.from(l.childNodes);
    if (!h[a]) return;
    let m = r;
    if (f && r !== null)
      try {
        m = new Function("state", `return (${f})(state)`)(
          r
        );
      } catch (t) {
        console.error("Error evaluating effect function:", t);
      }
    m !== null && typeof m == "object" && (m = JSON.stringify(m)), h[a].textContent = String(m ?? "");
  });
}
function Ye(e, r, c) {
  const a = $(e, []);
  if (!a?.components)
    return /* @__PURE__ */ new Set();
  const f = /* @__PURE__ */ new Set();
  if (c.type === "update") {
    let l = [...r];
    for (; ; ) {
      const h = $(e, l);
      if (h?.pathComponents && h.pathComponents.forEach((m) => {
        const t = a.components?.get(m);
        t && ((Array.isArray(t.reactiveType) ? t.reactiveType : [t.reactiveType || "component"]).includes("none") || f.add(t));
      }), l.length === 0) break;
      l.pop();
    }
    c.newValue && typeof c.newValue == "object" && !be(c.newValue) && ke(c.newValue, c.oldValue).forEach((m) => {
      const t = m.split("."), o = [...r, ...t], d = $(e, o);
      d?.pathComponents && d.pathComponents.forEach((P) => {
        const E = a.components?.get(P);
        E && ((Array.isArray(E.reactiveType) ? E.reactiveType : [E.reactiveType || "component"]).includes("none") || f.add(E));
      });
    });
  } else if (c.type === "insert" || c.type === "cut" || c.type === "insert_many") {
    let h = [...c.type === "insert" ? r : r.slice(0, -1)];
    for (; ; ) {
      const m = $(e, h);
      if (m?.pathComponents && m.pathComponents.forEach((t) => {
        const o = a.components?.get(t);
        o && f.add(o);
      }), h.length === 0) break;
      h.pop();
    }
  }
  return f;
}
function Xe(e, r, c) {
  const a = V.getState().getShadowValue(e, r), f = W(c) ? c(a) : c;
  if (Y(a, f))
    return null;
  ze(e, r, f);
  const l = $(e, r);
  return {
    type: "update",
    oldValue: a,
    newValue: f,
    shadowMeta: l
  };
}
function Ke(e, r, c) {
  Le(e, r, c);
  const a = $(e, r);
  return {
    type: "insert_many",
    count: c.length,
    shadowMeta: a,
    path: r
  };
}
function et(e, r, c, a, f) {
  let l;
  if (W(c)) {
    const { value: o } = N(e, r);
    l = c({ state: o });
  } else
    l = c;
  const h = Ue(
    e,
    r,
    l,
    a,
    f
  ), m = $(e, r);
  let t;
  return m?.arrayKeys && a !== void 0 && a > 0 && (t = m.arrayKeys[a - 1]), {
    type: "insert",
    newValue: l,
    shadowMeta: m,
    path: r,
    itemId: h,
    insertAfterId: t
  };
}
function tt(e, r) {
  const c = r.slice(0, -1), a = O(e, r);
  return Re(e, r), { type: "cut", oldValue: a, parentPath: c };
}
function nt() {
  const e = /* @__PURE__ */ new Set(), r = [], c = [];
  for (const a of ae) {
    if (a.status && a.updateType) {
      c.push(a);
      continue;
    }
    const f = a, l = f.type === "cut" ? null : f.newValue;
    f.shadowMeta?.signals?.length > 0 && r.push({ shadowMeta: f.shadowMeta, displayValue: l }), Ye(
      f.stateKey,
      f.path,
      f
    ).forEach((m) => {
      e.add(m);
    });
  }
  c.length > 0 && Ge(c), r.forEach(({ shadowMeta: a, displayValue: f }) => {
    Ze(a, f);
  }), e.forEach((a) => {
    a.forceUpdate();
  }), ae = [], le = !1;
}
function rt(e, r, c) {
  return (f, l, h) => {
    a(e, l, f, h);
  };
  function a(f, l, h, m) {
    let t;
    switch (m.updateType) {
      case "update":
        t = Xe(f, l, h);
        break;
      case "insert":
        t = et(
          f,
          l,
          h,
          m.index,
          m.itemId
        );
        break;
      case "insert_many":
        t = Ke(f, l, h);
        break;
      case "cut":
        t = tt(f, l);
        break;
    }
    if (t === null)
      return;
    t.stateKey = f, t.path = l, ae.push(t), Qe();
    const o = {
      timeStamp: Date.now(),
      stateKey: f,
      path: l,
      updateType: m.updateType,
      status: "new",
      oldValue: t.oldValue,
      newValue: t.newValue ?? null,
      itemId: t.itemId,
      insertAfterId: t.insertAfterId,
      metaData: m.metaData
    };
    ae.push(o), t.newValue !== void 0 && Je(
      t.newValue,
      f,
      c.current,
      r
    ), c.current?.middleware && c.current.middleware({ update: o }), Ne(o, m.validationTrigger || "programmatic"), xe(o);
  }
}
function at(e, {
  stateKey: r,
  localStorage: c,
  formElements: a,
  reactiveDeps: f,
  reactiveType: l,
  componentId: h,
  defaultState: m,
  dependencies: t
} = {}) {
  const [o, d] = te({}), { sessionId: P } = ve();
  let E = !r;
  const [w] = te(r ?? ne()), b = G(h ?? ne()), D = G(
    null
  );
  D.current = _(w) ?? null;
  const k = Ee(
    (u) => {
      const C = u ? { ..._(w), ...u } : _(w), n = C?.defaultState || m || e;
      if (C?.localStorage?.key && P) {
        const i = W(C.localStorage.key) ? C.localStorage.key(n) : C.localStorage.key, s = oe(
          `${P}-${w}-${i}`
        );
        if (s)
          return {
            value: s.state,
            source: "localStorage",
            timestamp: s.lastUpdated
          };
      }
      return {
        value: n || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [w, m, e, P]
  );
  ue(() => {
    const u = _(w), z = {
      localStorageEnabled: !!u?.localStorage?.key
    };
    if (ee(w, [], {
      features: z
    }), u?.defaultState !== void 0 || m !== void 0) {
      const i = u?.defaultState || m;
      u?.defaultState || ye(w, {
        defaultState: i
      });
    }
    const { value: C } = k();
    re(w, C);
    const n = _(w)?.validation;
    n?.zodSchemaV4 ? J(w, n.zodSchemaV4, "zod4") : n?.zodSchemaV3 && J(w, n.zodSchemaV3, "zod3"), F(w);
  }, [w, ...t || []]), K(() => {
    E && ye(w, {
      formElements: a,
      defaultState: m,
      localStorage: c,
      middleware: D.current?.middleware
    });
    const u = `${w}////${b.current}`, z = $(w, []), C = z?.components || /* @__PURE__ */ new Map();
    return C.set(u, {
      forceUpdate: () => d({}),
      reactiveType: l ?? ["component"],
      paths: /* @__PURE__ */ new Set(),
      depsFunction: f || void 0,
      deps: f ? f(O(w, [])) : [],
      prevDeps: f ? f(O(w, [])) : []
    }), ee(w, [], {
      ...z,
      components: C
    }), d({}), () => {
      const n = $(w, []), i = n?.components?.get(u);
      i?.paths && i.paths.forEach((s) => {
        const S = s.split(".").slice(1), y = V.getState().getShadowMetadata(w, S);
        y?.pathComponents && y.pathComponents.size === 0 && (delete y.pathComponents, V.getState().setShadowMetadata(w, S, y));
      }), n?.components && ee(w, [], n);
    };
  }, []);
  const q = rt(
    w,
    P,
    D
  );
  return V.getState().initialStateGlobal[w] || pe(w, e), we(() => Pe(
    w,
    q,
    b.current,
    P
  ), [w, P]);
}
const ot = (e, r, c) => {
  let a = $(e, r)?.arrayKeys || [];
  const f = c?.transforms;
  if (!f || f.length === 0)
    return a;
  for (const l of f)
    if (l.type === "filter") {
      const h = [];
      a.forEach((m, t) => {
        const o = O(e, [...r, m]);
        l.fn(o, t) && h.push(m);
      }), a = h;
    } else l.type === "sort" && a.sort((h, m) => {
      const t = O(e, [...r, h]), o = O(e, [...r, m]);
      return l.fn(t, o);
    });
  return a;
}, Q = (e, r, c) => {
  const a = `${e}////${r}`, l = $(e, [])?.components?.get(a);
  !l || l.reactiveType === "none" || !(Array.isArray(l.reactiveType) ? l.reactiveType : [l.reactiveType]).includes("component") || We(e, c, a);
}, Z = (e, r, c) => {
  const a = $(e, []), f = /* @__PURE__ */ new Set();
  a?.components && a.components.forEach((h, m) => {
    (Array.isArray(h.reactiveType) ? h.reactiveType : [h.reactiveType || "component"]).includes("all") && (h.forceUpdate(), f.add(m));
  }), $(e, [
    ...r,
    "getSelected"
  ])?.pathComponents?.forEach((h) => {
    a?.components?.get(h)?.forceUpdate();
  });
  const l = $(e, r);
  for (let h of l?.arrayKeys || []) {
    const m = h + ".selected", t = $(e, m.split(".").slice(1));
    h == c && t?.pathComponents?.forEach((o) => {
      a?.components?.get(o)?.forceUpdate();
    });
  }
};
function N(e, r, c) {
  const a = $(e, r), f = r.length > 0 ? r.join(".") : "root", l = c?.arrayViews?.[f];
  if (Array.isArray(l) && l.length === 0)
    return {
      shadowMeta: a,
      value: [],
      arrayKeys: a?.arrayKeys
    };
  const h = O(e, r, l);
  return {
    shadowMeta: a,
    value: h,
    arrayKeys: a?.arrayKeys
  };
}
function it(e, r) {
  return r ? e.length !== r.length ? !1 : r.every((c, a) => c === "*" || c === e[a]) : !0;
}
function st(e, r) {
  return r === "any" ? !0 : r === "array" ? Array.isArray(e) : r === "boolean" ? typeof e == "boolean" : r === "object" ? e !== null && typeof e == "object" && !Array.isArray(e) : r === "primitive" ? e === null || typeof e != "object" && !Array.isArray(e) : !1;
}
function Ae(e, r) {
  const c = V.getState().getShadowMetadata(e, r);
  if (!c?.clientActivityState?.elements) return [];
  const a = [];
  return c.clientActivityState.elements.forEach((f) => {
    f.domRef?.current && a.push(f.domRef);
  }), a;
}
function Me(e, r) {
  return Ae(e, r).map((a) => a.current).filter(Boolean);
}
function ct(e, r, c) {
  Me(e, r).forEach((a) => {
    if ("disabled" in a) {
      a.disabled = c;
      return;
    }
    a.style.pointerEvents = c ? "none" : "", a.setAttribute("aria-disabled", String(c));
  });
}
function Ve(e, r, c = "default") {
  return [...e, "$pluginMeta", r, c];
}
function lt(e, r, c, a) {
  const f = $(e, []);
  $(
    e,
    Ve(r, c, a)
  )?.pathComponents?.forEach((h) => {
    f?.components?.get(h)?.forceUpdate();
  });
}
function Pe(e, r, c, a) {
  const f = /* @__PURE__ */ new Map();
  function l({
    path: t = [],
    meta: o,
    componentId: d
  }) {
    if ($(e, t)?.isRaw)
      return O(e, t);
    const E = o ? JSON.stringify(o.arrayViews || o.transforms) : "", w = t.join(".") + ":" + d + ":" + E;
    if (f.has(w))
      return f.get(w);
    const b = [e, ...t].join("."), D = () => {
    }, k = {
      apply(x, u, z) {
        if (z.length === 0) {
          const n = t.length > 0 ? t.join(".") : "root", i = o?.arrayViews?.[n];
          return Q(e, d, t), O(e, t, i);
        }
        const C = z[0];
        return r(C, t, { updateType: "update" }), !0;
      },
      get(x, u, z) {
        if (u === Symbol.toPrimitive)
          return (n) => n === "number" ? NaN : n === "string" ? `[CogsState: ${t.join(".") || "root"}]` : null;
        if (u === Symbol.toStringTag)
          return "CogsState";
        if (u === Symbol.iterator) {
          const { value: n } = N(e, t, o);
          return Array.isArray(n) ? function* () {
            for (let i = 0; i < n.length; i++)
              yield n[i];
          } : void 0;
        }
        if (u === "call" || u === "apply" || u === "bind")
          return Reflect.get(x, u, z);
        if (typeof u != "string")
          return Reflect.get(x, u);
        if (t.length === 0 && u in h)
          return h[u];
        if (typeof u == "string" && !u.startsWith("$")) {
          const { value: n } = N(e, t, o);
          if (n !== null && typeof n == "object" && !Array.isArray(n) && Object.prototype.hasOwnProperty.call(n, u)) {
            const g = [...t, u];
            return l({
              path: g,
              componentId: d,
              meta: o
            });
          }
          const s = [...t, u];
          return l({
            path: s,
            componentId: d,
            meta: o
          });
        }
        if (typeof u == "string" && u.startsWith("$")) {
          const n = u.slice(1), { value: i } = N(e, t, o), s = R.getState().registeredPlugins;
          for (const g of s) {
            const S = g.chainMethods?.[n];
            if (S && it(t, S.pathPattern) && st(i, S.target))
              return (...y) => {
                const v = R.getState(), A = v.pluginOptions.get(e)?.get(g.name), p = v.getHookResult(e, g.name);
                return S.handler(
                  {
                    stateKey: e,
                    path: t,
                    pluginName: g.name,
                    options: A,
                    hookData: p,
                    $get: () => N(e, t, o).value,
                    $update: (M) => (r(M, t, {
                      updateType: "update"
                    }), {
                      syned: () => {
                      }
                    }),
                    $applyOperation: (M, T) => {
                      r(M.newValue, M.path, {
                        updateType: M.updateType,
                        itemId: M.itemId,
                        metaData: T
                      });
                    },
                    getFieldMetaData: () => ge(e, t)?.get(g.name),
                    setFieldMetaData: (M) => Se(e, t, g.name, M),
                    removeFieldMetaData: () => me(e, t, g.name),
                    watchPluginMeta: (M) => Q(
                      e,
                      d,
                      Ve(t, g.name, M)
                    ),
                    notifyPluginMeta: (M) => lt(
                      e,
                      t,
                      g.name,
                      M
                    ),
                    getFieldRefs: () => Ae(e, t),
                    getFieldElements: () => Me(e, t),
                    setFieldDisabled: (M) => ct(e, t, M)
                  },
                  ...y
                );
              };
          }
        }
        if (u === "$_rebuildStateShape")
          return l;
        if (u === "$removeStorage")
          return () => {
            const n = V.getState().initialStateGlobal[e], i = _(e), s = W(i?.localStorage?.key) ? i.localStorage.key(n) : i?.localStorage?.key, g = a && s ? `${a}-${e}-${s}` : void 0;
            se(g);
          };
        if (u === "$setRaw")
          return (n) => {
            const i = $(e, t) || {};
            ee(e, t, { ...i, isRaw: !0 }), r(n, t, { updateType: "update" });
          };
        if (u === "$validate")
          return (n) => {
            const i = V.getState();
            if (n) {
              const v = n.map((A) => {
                const p = [...t, A], M = i.getShadowValue(e, p), T = i.getShadowMetadata(e, p) || {}, j = T.typeInfo?.schema;
                if (!j)
                  return {
                    key: A,
                    path: p,
                    success: !0,
                    data: M
                  };
                const I = j.safeParse(M), L = I.error?.issues || I.error?.errors || [];
                return i.setShadowMetadata(e, p, {
                  ...T,
                  validation: {
                    status: I.success ? "VALID" : "INVALID",
                    errors: I.success ? [] : [
                      {
                        source: "client",
                        message: L[0]?.message || "Invalid value",
                        severity: "error",
                        code: L[0]?.code
                      }
                    ],
                    lastValidated: Date.now(),
                    validatedValue: M
                  }
                }), i.notifyPathSubscribers([e, ...p].join("."), {
                  type: "VALIDATION_UPDATE"
                }), {
                  key: A,
                  path: p,
                  success: I.success,
                  data: I.success ? I.data : void 0,
                  error: I.success ? void 0 : I.error
                };
              });
              return F(e), {
                success: v.every((A) => A.success),
                results: v
              };
            }
            const { value: s } = N(e, t, o), g = i.getInitialOptions(e), S = g?.validation?.zodSchemaV4 || g?.validation?.zodSchemaV3;
            if (!S)
              return { success: !0, data: s };
            const y = S.safeParse(s);
            if (y.success) {
              const v = i.getShadowMetadata(e, t) || {};
              i.setShadowMetadata(e, t, {
                ...v,
                validation: {
                  status: "VALID",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            } else
              (y.error?.issues || y.error?.errors || []).forEach((A) => {
                const p = [...t, ...A.path.map(String)], M = i.getShadowMetadata(e, p) || {};
                i.setShadowMetadata(e, p, {
                  ...M,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: "client",
                        message: A.message,
                        severity: "error",
                        code: A.code
                      }
                    ],
                    lastValidated: Date.now(),
                    validatedValue: i.getShadowValue(e, p)
                  }
                });
              });
            return F(e), y;
          };
        if (u === "$showValidationErrors")
          return () => {
            const { shadowMeta: n } = N(e, t, o);
            return n?.validation?.status === "INVALID" && n.validation.errors.length > 0 ? n.validation.errors.filter((i) => i.severity === "error").map((i) => i.message) : [];
          };
        if (u === "$validationErrors")
          return (n) => {
            const i = V.getState(), s = (S) => {
              const y = i.getShadowMetadata(e, S)?.validation, v = (y?.errors || []).map((T) => ({
                ...T,
                path: S
              })), A = v.filter((T) => T.severity === "error"), p = v.filter(
                (T) => T.severity === "warning"
              ), M = A.length > 0 ? "error" : p.length > 0 ? "warning" : void 0;
              return {
                status: y?.status || "NOT_VALIDATED",
                severity: M,
                hasErrors: A.length > 0,
                hasWarnings: p.length > 0,
                message: A[0]?.message || p[0]?.message || "",
                errors: A.map((T) => T.message),
                warnings: p.map((T) => T.message),
                allErrors: v,
                path: S,
                getData: () => i.getShadowValue(e, S)
              };
            };
            return (n ?? Object.keys(i.getShadowNode(e, t) ?? {}).filter(
              (S) => S !== "_meta"
            )).map((S) => s([...t, S]));
          };
        if (u === "$getSelected")
          return () => {
            const n = [e, ...t].join(".");
            Q(e, d, [
              ...t,
              "getSelected"
            ]);
            const i = V.getState().selectedIndicesMap.get(n);
            if (!i)
              return;
            const s = t.join("."), g = o?.arrayViews?.[s], S = i.split(".").pop();
            if (!(g && !g.includes(S) || O(
              e,
              i.split(".").slice(1)
            ) === void 0))
              return l({
                path: i.split(".").slice(1),
                componentId: d,
                meta: o
              });
          };
        if (u === "$getSelectedIndex")
          return () => {
            const n = e + "." + t.join(".");
            t.join(".");
            const i = V.getState().selectedIndicesMap.get(n);
            if (!i)
              return -1;
            const { keys: s } = U(e, t, o);
            if (!s)
              return -1;
            const g = i.split(".").pop();
            return s.indexOf(g);
          };
        if (u === "$clearSelected")
          return Z(e, t), () => {
            qe({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (u === "$map")
          return (n) => {
            const { value: i, keys: s } = U(
              e,
              t,
              o
            );
            if (Q(e, d, t), !s || !Array.isArray(i))
              return [];
            const g = l({
              path: t,
              componentId: d,
              meta: o
            });
            return i.map((S, y) => {
              const v = s[y];
              if (!v) return;
              const A = [...t, v], p = l({
                path: A,
                // This now correctly points to the item in the shadow store.
                componentId: d,
                meta: o
              });
              return n(p, y, g);
            });
          };
        if (u === "$filter")
          return (n) => {
            const i = t.length > 0 ? t.join(".") : "root", { keys: s, value: g } = U(
              e,
              t,
              o
            );
            if (!Array.isArray(g))
              throw new Error("filter can only be used on arrays");
            const S = [];
            return g.forEach((y, v) => {
              if (n(y, v)) {
                const A = s[v];
                A && S.push(A);
              }
            }), l({
              path: t,
              componentId: d,
              meta: {
                ...o,
                arrayViews: {
                  ...o?.arrayViews || {},
                  [i]: S
                },
                transforms: [
                  ...o?.transforms || [],
                  { type: "filter", fn: n, path: t }
                ]
              }
            });
          };
        if (u === "$sort")
          return (n) => {
            const i = t.length > 0 ? t.join(".") : "root", { value: s, keys: g } = U(
              e,
              t,
              o
            );
            if (!Array.isArray(s) || !g)
              throw new Error("No array keys found for sorting");
            const S = s.map((v, A) => ({
              item: v,
              key: g[A]
            }));
            S.sort((v, A) => n(v.item, A.item));
            const y = S.map((v) => v.key);
            return l({
              path: t,
              componentId: d,
              meta: {
                ...o,
                arrayViews: {
                  ...o?.arrayViews || {},
                  [i]: y
                },
                transforms: [
                  ...o?.transforms || [],
                  { type: "sort", fn: n, path: t }
                ]
              }
            });
          };
        if (u === "$list")
          return (n) => /* @__PURE__ */ H(() => {
            const s = G(/* @__PURE__ */ new Map()), [g, S] = te({}), y = t.length > 0 ? t.join(".") : "root", v = ot(e, t, o), A = we(() => ({
              ...o,
              arrayViews: {
                ...o?.arrayViews || {},
                [y]: v
              }
            }), [o, y, v]), { value: p } = U(
              e,
              t,
              A
            );
            if (ue(() => {
              const j = V.getState().subscribeToPath(b, (I) => {
                if (I.type === "GET_SELECTED")
                  return;
                const B = V.getState().getShadowMetadata(e, t)?.transformCaches;
                if (B)
                  for (const X of B.keys())
                    X.startsWith(d) && B.delete(X);
                (I.type === "INSERT" || I.type === "INSERT_MANY" || I.type === "REMOVE" || I.type === "CLEAR_SELECTION") && S({});
              });
              return () => {
                j();
              };
            }, [d, b]), !Array.isArray(p))
              return null;
            const M = l({
              path: t,
              componentId: d,
              meta: A
              // Use updated meta here
            }), T = p.map((j, I) => {
              const L = v[I];
              if (!L)
                return null;
              let B = s.current.get(L);
              B || (B = ne(), s.current.set(L, B));
              const X = [...t, L];
              return de(_e, {
                key: L,
                stateKey: e,
                itemComponentId: B,
                itemPath: X,
                localIndex: I,
                arraySetter: M,
                rebuildStateShape: l,
                renderFn: n
              });
            });
            return /* @__PURE__ */ H($e, { children: T });
          }, {});
        if (u === "$stateFlattenOn")
          return (n) => {
            const i = t.length > 0 ? t.join(".") : "root", s = o?.arrayViews?.[i], g = V.getState().getShadowValue(e, t, s);
            return Array.isArray(g) ? l({
              path: [...t, "[*]", n],
              componentId: d,
              meta: o
            }) : [];
          };
        if (u === "$index")
          return (n) => {
            const i = t.length > 0 ? t.join(".") : "root", s = o?.arrayViews?.[i];
            if (s) {
              const y = s[n];
              return y ? l({
                path: [...t, y],
                componentId: d,
                meta: o
              }) : void 0;
            }
            const g = $(e, t);
            if (!g?.arrayKeys) return;
            const S = g.arrayKeys[n];
            if (S)
              return l({
                path: [...t, S],
                componentId: d,
                meta: o
              });
          };
        if (u === "$last")
          return () => {
            const { keys: n } = U(e, t, o);
            if (!n || n.length === 0)
              return;
            const i = n[n.length - 1];
            if (!i)
              return;
            const s = [...t, i];
            return l({
              path: s,
              componentId: d,
              meta: o
            });
          };
        if (u === "$insert")
          return (n, i) => {
            r(n, t, {
              updateType: "insert",
              index: i
            });
          };
        if (u === "$insertMany")
          return (n) => {
            r(n, t, {
              updateType: "insert_many"
            });
          };
        if (u === "$uniqueInsert")
          return (n, i, s) => {
            const { value: g } = N(
              e,
              t,
              o
            ), S = W(n) ? n(g) : n;
            let y = null;
            if (!g.some((A) => {
              const p = i ? i.every(
                (M) => Y(A[M], S[M])
              ) : Y(A, S);
              return p && (y = A), p;
            }))
              r(S, t, { updateType: "insert" });
            else if (s && y) {
              const A = s(y), p = g.map(
                (M) => Y(M, y) ? A : M
              );
              r(p, t, {
                updateType: "update"
              });
            }
          };
        if (u === "$cut")
          return (n, i) => {
            const s = $(e, t);
            if (!s?.arrayKeys || s.arrayKeys.length === 0)
              return;
            const g = n === -1 ? s.arrayKeys.length - 1 : n !== void 0 ? n : s.arrayKeys.length - 1, S = s.arrayKeys[g];
            S && r(null, [...t, S], {
              updateType: "cut"
            });
          };
        if (u === "$cutSelected")
          return () => {
            const n = [e, ...t].join("."), { keys: i } = U(e, t, o);
            if (!i || i.length === 0)
              return;
            const s = V.getState().selectedIndicesMap.get(n);
            if (!s)
              return;
            const g = s.split(".").pop();
            if (!i.includes(g))
              return;
            const S = s.split(".").slice(1);
            V.getState().clearSelectedIndex({ arrayKey: n });
            const y = S.slice(0, -1);
            Z(e, y), r(null, S, {
              updateType: "cut"
            });
          };
        if (u === "$cutByValue")
          return (n) => {
            const {
              isArray: i,
              value: s,
              keys: g
            } = U(e, t, o);
            if (!i) return;
            const S = ie(s, g, (y) => y === n);
            S && r(null, [...t, S.key], {
              updateType: "cut"
            });
          };
        if (u === "$toggleByValue")
          return (n) => {
            const {
              isArray: i,
              value: s,
              keys: g
            } = U(e, t, o);
            if (!i) return;
            const S = ie(s, g, (y) => y === n);
            if (S) {
              const y = [...t, S.key];
              r(null, y, {
                updateType: "cut"
              });
            } else
              r(n, t, { updateType: "insert" });
          };
        if (u === "$findWith")
          return (n, i) => {
            const { isArray: s, value: g, keys: S } = U(e, t, o);
            if (!s)
              throw new Error("findWith can only be used on arrays");
            const y = ie(
              g,
              S,
              (v) => v?.[n] === i
            );
            return y ? l({
              path: [...t, y.key],
              componentId: d,
              meta: o
            }) : null;
          };
        if (u === "$cutThis") {
          const { value: n } = N(e, t, o), i = t.slice(0, -1);
          return Z(e, i), () => {
            r(n, t, { updateType: "cut" });
          };
        }
        if (u === "$get")
          return () => {
            Q(e, d, t);
            const { value: n } = N(e, t, o);
            return n;
          };
        if (u === "$$derive")
          return (n) => he({
            _stateKey: e,
            _path: t,
            _effect: n.toString(),
            _meta: o
          });
        if (u === "$$get")
          return () => he({ _stateKey: e, _path: t, _meta: o });
        if (u == "getLocalStorage")
          return (n) => oe(a + "-" + e + "-" + n);
        if (u === "$isSelected") {
          const n = t.slice(0, -1);
          if ($(e, n)?.arrayKeys) {
            const s = e + "." + n.join("."), g = V.getState().selectedIndicesMap.get(s), S = e + "." + t.join(".");
            return g === S;
          }
          return;
        }
        if (u === "$setSelected")
          return (n) => {
            const i = t.slice(0, -1), s = e + "." + i.join("."), g = e + "." + t.join(".");
            Z(e, i, void 0), V.getState().selectedIndicesMap.get(s), n && V.getState().setSelectedIndex(s, g);
          };
        if (u === "$toggleSelected")
          return () => {
            const n = t.slice(0, -1), i = e + "." + n.join("."), s = e + "." + t.join(".");
            V.getState().selectedIndicesMap.get(i) === s ? V.getState().clearSelectedIndex({ arrayKey: i }) : V.getState().setSelectedIndex(i, s), Z(e, n);
          };
        if (u === "$clearValidation")
          return (n) => {
            const i = n ? [...t, ...n] : t, s = V.getState(), g = s.getShadowNode(e, i);
            if (console.log("startNode ", g), !g) return;
            const S = [[g, i]];
            for (console.log("stack ", S); S.length > 0; ) {
              const [y, v] = S.pop();
              if (console.log("while (stack.length ", y, v), !y || typeof y != "object") continue;
              if (y._meta?.validation) {
                y._meta.validation = {
                  status: "NOT_VALIDATED",
                  errors: [],
                  lastValidated: Date.now(),
                  validatedValue: void 0
                };
                const p = [e, ...v].join(".");
                s.notifyPathSubscribers(p, {
                  type: "VALIDATION_CLEAR"
                });
              }
              const A = Object.keys(y);
              for (const p of A)
                p !== "_meta" && S.push([y[p], [...v, p]]);
            }
            F(e);
          };
        if (t.length == 0) {
          if (u === "$_componentId")
            return d;
          if (u === "$setOptions")
            return (n) => {
              ce({ stateKey: e, options: n, initialOptionsPart: {} });
            };
          if (u === "$_applyUpdate")
            return (n, i, s = "update") => {
              r(n, i, { updateType: s });
            };
          if (u === "$_getEffectiveSetState")
            return r;
          if (u === "$getPluginMetaData")
            return (n) => ge(e, t)?.get(n);
          if (u === "$addPluginMetaData")
            return (n, i) => Se(e, t, n, i);
          if (u === "$removePluginMetaData")
            return (n) => me(e, t, n);
          if (u === "$addZodValidation")
            return (n, i) => {
              const s = V.getState();
              n.forEach((g) => {
                const S = g.path.map(String), y = s.getShadowMetadata(e, S) || {};
                s.setShadowMetadata(e, S, {
                  ...y,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: i || "client",
                        message: g.message,
                        severity: "error",
                        code: g.code
                      }
                    ],
                    lastValidated: Date.now(),
                    validatedValue: void 0
                  }
                }), s.notifyPathSubscribers(
                  [e, ...S].join("."),
                  { type: "VALIDATION_UPDATE" }
                );
              }), F(e);
            };
          if (u === "$clearZodValidationPaths")
            return (n) => {
              const i = V.getState();
              n.forEach((s) => {
                const g = i.getShadowMetadata(e, s) || {};
                g.validation && (i.setShadowMetadata(e, s, {
                  ...g,
                  validation: {
                    status: "NOT_VALIDATED",
                    errors: [],
                    lastValidated: Date.now(),
                    validatedValue: void 0
                  }
                }), i.notifyPathSubscribers(
                  [e, ...s].join("."),
                  { type: "VALIDATION_CLEAR" }
                ));
              }), F(e);
            };
          if (u === "$applyOperation")
            return (n, i) => {
              let s;
              if (n.insertAfterId && n.updateType === "insert") {
                const g = $(e, n.path);
                if (g?.arrayKeys) {
                  const S = g.arrayKeys.indexOf(
                    n.insertAfterId
                  );
                  S !== -1 && (s = S + 1);
                }
              }
              r(n.newValue, n.path, {
                updateType: n.updateType,
                itemId: n.itemId,
                index: s,
                // Pass the calculated index
                metaData: i
              });
            };
          if (u === "$applyJsonPatch")
            return (n) => {
              const i = V.getState(), s = i.getShadowMetadata(e, []);
              if (!s?.components) return;
              const g = (y) => !y || y === "/" ? [] : y.split("/").slice(1).map((v) => v.replace(/~1/g, "/").replace(/~0/g, "~")), S = /* @__PURE__ */ new Set();
              for (const y of n) {
                const v = g(y.path);
                switch (y.op) {
                  case "add":
                  case "replace": {
                    const { value: A } = y;
                    i.updateShadowAtPath(e, v, A);
                    let p = [...v];
                    for (; ; ) {
                      const M = i.getShadowMetadata(
                        e,
                        p
                      );
                      if (M?.pathComponents && M.pathComponents.forEach((T) => {
                        if (!S.has(T)) {
                          const j = s.components?.get(T);
                          j && (j.forceUpdate(), S.add(T));
                        }
                      }), p.length === 0) break;
                      p.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const A = v.slice(0, -1);
                    i.removeShadowArrayElement(e, v);
                    let p = [...A];
                    for (; ; ) {
                      const M = i.getShadowMetadata(
                        e,
                        p
                      );
                      if (M?.pathComponents && M.pathComponents.forEach((T) => {
                        if (!S.has(T)) {
                          const j = s.components?.get(T);
                          j && (j.forceUpdate(), S.add(T));
                        }
                      }), p.length === 0) break;
                      p.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (u === "$getComponents")
            return () => $(e, [])?.components;
        }
        if (u === "$validationWrapper")
          return ({
            children: n,
            hideMessage: i
          }) => /* @__PURE__ */ H(
            De,
            {
              formOpts: i ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: n
            }
          );
        if (u === "$_stateKey") return e;
        if (u === "$_path") return t;
        if (u === "$update")
          return (n) => (r(n, t, { updateType: "update" }), {
            synced: () => {
            }
          });
        if (u === "$toggle") {
          const { value: n } = N(
            e,
            t,
            o
          );
          if (typeof n != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            r(!n, t, {
              updateType: "update"
            });
          };
        }
        if (u === "$isolate")
          return (n, i) => {
            const s = Array.isArray(n), g = s ? n : void 0, S = s ? i : n;
            if (!S || typeof S != "function")
              throw new Error(
                "CogsState: $isolate requires a render function."
              );
            return /* @__PURE__ */ H(
              Ce,
              {
                stateKey: e,
                path: t,
                dependencies: g,
                rebuildStateShape: l,
                renderFn: S
              }
            );
          };
        if (u === "$formElement")
          return (n, i) => /* @__PURE__ */ H(
            Oe,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: l,
              setState: r,
              formOpts: i,
              renderFn: n
            }
          );
        const C = [...t, u];
        return l({
          path: C,
          componentId: d,
          meta: o
        });
      }
    }, q = new Proxy(D, k);
    return f.set(w, q), q;
  }
  const h = {
    $revertToInitialState: (t) => {
      const o = V.getState().initialStateGlobal[e];
      Be(e), re(e, o), l({
        path: [],
        componentId: c
      });
      const d = _(e), P = W(d?.localStorage?.key) ? d?.localStorage?.key(o) : d?.localStorage?.key, E = a && P ? `${a}-${e}-${P}` : void 0;
      return se(E), F(e), o;
    },
    $initializeAndMergeShadowState: (t) => {
      Fe(e, t), F(e);
    },
    $updateInitialState: (t) => {
      const o = Pe(
        e,
        r,
        c,
        a
      ), d = V.getState().initialStateGlobal[e], P = _(e), E = W(P?.localStorage?.key) ? P?.localStorage?.key(d) : P?.localStorage?.key, w = a && E ? `${a}-${e}-${E}` : void 0;
      return se(w), Te(() => {
        pe(e, t), re(e, t);
        const b = V.getState().getShadowMetadata(e, []);
        b && b?.components?.forEach((D) => {
          D.forceUpdate();
        });
      }), {
        fetchId: (b) => o.$get()[b]
      };
    }
  };
  return l({
    componentId: c,
    path: []
  });
}
function he(e) {
  return de(ut, { proxy: e });
}
function ut({
  proxy: e
}) {
  const r = G(null), c = G(null), a = G(!1), f = `${e._stateKey}-${e._path.join(".")}`, l = e._path.length > 0 ? e._path.join(".") : "root", h = e._meta?.arrayViews?.[l], m = O(e._stateKey, e._path, h);
  return ue(() => {
    const t = r.current;
    if (!t || a.current) return;
    const o = setTimeout(() => {
      if (!t.parentElement) {
        console.warn("Parent element not found for signal", f);
        return;
      }
      const d = t.parentElement, E = Array.from(d.childNodes).indexOf(t);
      let w = d.getAttribute("data-parent-id");
      w || (w = `parent-${crypto.randomUUID()}`, d.setAttribute("data-parent-id", w)), c.current = `instance-${crypto.randomUUID()}`;
      const b = V.getState().getShadowMetadata(e._stateKey, e._path) || {}, D = b.signals || [];
      D.push({
        instanceId: c.current,
        parentId: w,
        position: E,
        effect: e._effect
      }), V.getState().setShadowMetadata(e._stateKey, e._path, {
        ...b,
        signals: D
      });
      let k = m;
      if (e._effect)
        try {
          k = new Function(
            "state",
            `return (${e._effect})(state)`
          )(m);
        } catch (x) {
          console.error("Error evaluating effect function:", x);
        }
      k !== null && typeof k == "object" && (k = JSON.stringify(k));
      const q = document.createTextNode(String(k ?? ""));
      t.replaceWith(q), a.current = !0;
    }, 0);
    return () => {
      if (clearTimeout(o), c.current) {
        const d = V.getState().getShadowMetadata(e._stateKey, e._path) || {};
        d.signals && (d.signals = d.signals.filter(
          (P) => P.instanceId !== c.current
        ), V.getState().setShadowMetadata(e._stateKey, e._path, d));
      }
    };
  }, []), de("span", {
    ref: r,
    style: { display: "contents" },
    "data-signal-id": f
  });
}
export {
  he as $cogsSignal,
  Mt as createCogsState,
  at as useCogsStateFn
};
//# sourceMappingURL=CogsState.js.map
