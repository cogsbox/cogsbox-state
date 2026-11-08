"use client";
import { jsx as Z, Fragment as Ie } from "react/jsx-runtime";
import { pluginStore as q } from "./pluginStore.js";
import { useState as K, useRef as J, useCallback as be, useEffect as te, useLayoutEffect as re, useMemo as pe, createElement as ge, startTransition as ke } from "react";
import { transformStateFunc as Te, isFunction as B, isDeepEqual as ee, isArray as De, getDifferences as Ce } from "./utility.js";
import { ValidationWrapper as Oe, IsolatedComponentWrapper as _e, FormElementWrapper as je, MemoizedCogsItemWrapper as Ne } from "./Components.js";
import ze from "superjson";
import { v4 as oe } from "uuid";
import { getGlobalStore as A, updateShadowTypeInfo as H, shadowStateStore as he } from "./store.js";
import { useCogsConfig as Me } from "./CogsStateClient.js";
import { runValidation as Fe } from "./validation.js";
const {
  getInitialOptions: F,
  updateInitialStateGlobal: ue,
  getShadowMetadata: E,
  setShadowMetadata: Ve,
  getShadowValue: z,
  initializeShadowState: ae,
  initializeAndMergeShadowState: Le,
  updateShadowAtPath: Ue,
  insertShadowArrayElement: Re,
  insertManyShadowArrayElements: We,
  removeShadowArrayElement: xe,
  setInitialStateOptions: Se,
  addPathComponent: Be,
  registerComponent: Ge,
  unregisterComponent: qe,
  clearSelectedIndexesForState: Je,
  addStateLog: He,
  clearSelectedIndex: Qe,
  notifyPathSubscribers: Pt,
  getPluginMetaDataMap: me,
  setPluginMetaData: ye,
  removePluginMetaData: we
} = A.getState(), { notifyUpdate: Ze } = q.getState();
function R(e, o, c) {
  const i = E(e, o);
  if (!!!i?.arrayKeys)
    return { isArray: !1, value: A.getState().getShadowValue(e, o), keys: [] };
  const u = o.length > 0 ? o.join(".") : "root", d = c?.arrayViews?.[u] ?? i.arrayKeys;
  return Array.isArray(d) && d.length === 0 ? { isArray: !0, value: [], keys: [] } : { isArray: !0, value: A.getState().getShadowValue(e, o, d), keys: d ?? [] };
}
function se(e, o, c) {
  for (let i = 0; i < e.length; i++)
    if (c(e[i], i)) {
      const f = o[i];
      if (f)
        return { key: f, index: i, value: e[i] };
    }
  return null;
}
function ve(e, o) {
  const i = {
    ...F(e) || {},
    ...o
  };
  (i.validation?.zodSchemaV4 || i.validation?.zodSchemaV3) && !i.validation?.onBlur && (i.validation.onBlur = "error"), Se(e, i);
}
function de({
  stateKey: e,
  options: o,
  initialOptionsPart: c
}) {
  const i = F(e) || {}, f = c[e] || {};
  let u = { ...f, ...i }, d = !1;
  if (o) {
    const w = (h, t) => {
      for (const n in t)
        t.hasOwnProperty(n) && (t[n] instanceof Object && !Array.isArray(t[n]) && h[n] instanceof Object ? ee(h[n], t[n]) || (w(h[n], t[n]), d = !0) : h[n] !== t[n] && (h[n] = t[n], d = !0));
      return h;
    };
    u = w(u, o);
  }
  if (u.validation && (o?.validation?.hasOwnProperty("onBlur") || i?.validation?.hasOwnProperty("onBlur") || f?.validation?.hasOwnProperty("onBlur") || (u.validation.onBlur = "error", d = !0)), d) {
    Se(e, u);
    const w = u.validation?.zodSchemaV4, h = u.validation?.zodSchemaV3;
    (w !== i?.validation?.zodSchemaV4 || h !== i?.validation?.zodSchemaV3) && (w || h) && (w ? H(e, w, "zod4") : h && H(e, h, "zod3"), U(e));
  }
  return u;
}
const Et = (e, o) => {
  o?.plugins && q.getState().setRegisteredPlugins(o.plugins);
  const c = {};
  if (o?.plugins)
    for (const t of o.plugins)
      typeof t.initialState == "function" && Object.assign(c, t.initialState());
  const i = { ...c, ...e }, [f, u] = Te(i);
  Object.keys(f).forEach((t) => {
    let n = {};
    o?.formElements && (n.formElements = o.formElements), n.validation = {
      onBlur: "error",
      ...o?.validation
    };
    const y = F(t), $ = y ? {
      ...y,
      formElements: o?.formElements,
      validation: {
        ...y.validation,
        ...n.validation
      }
    } : n;
    Object.keys($).length > 0 && Se(t, $);
  }), Object.keys(f).forEach((t) => {
    ae(t, f[t]);
  });
  const d = (t, n) => {
    const [y] = K(n?.componentId ?? oe()), $ = de({
      stateKey: t,
      options: n,
      initialOptionsPart: u
    }), b = J($);
    b.current = $;
    const O = z(t, []) || f[t], C = ct(O, {
      stateKey: t,
      componentId: y,
      localStorage: n?.localStorage,
      middleware: n?.middleware,
      reactiveType: n?.reactiveType,
      defaultState: n?.defaultState
    });
    return re(() => {
      q.getState().setPluginOptionsForState(
        t,
        n ?? b.current
      );
    }, [t, n]), re(() => q.getState().registerStateHandler(t, C), [t, C]), re(() => {
      const P = F(t)?.validation;
      P?.zodSchemaV4 ? H(
        t,
        P.zodSchemaV4,
        "zod4"
      ) : P?.zodSchemaV3 && H(
        t,
        P.zodSchemaV3,
        "zod3"
      );
    }), C;
  };
  function w(t, n) {
    if (de({ stateKey: t, options: n, initialOptionsPart: u }), n.localStorage && Xe(t, n), n.formElements) {
      const $ = q.getState().registeredPlugins.map((b) => n.formElements.hasOwnProperty(b.name) ? {
        ...b,
        formWrapper: n.formElements[b.name]
      } : b);
      q.getState().setRegisteredPlugins($);
    }
    U(t);
  }
  function h(t) {
    Object.keys(f).forEach((y) => {
      w(y, t);
    });
  }
  return {
    useCogsState: d,
    setCogsOptionsByKey: w,
    setCogsOptions: h
  };
}, Ye = (e, o, c, i, f) => {
  c?.log && console.log(
    "saving to localstorage",
    o,
    c.localStorage?.key,
    i
  );
  const u = B(c?.localStorage?.key) ? c.localStorage?.key(e) : c?.localStorage?.key;
  if (u && i) {
    const d = `${i}-${o}-${u}`;
    let w;
    try {
      w = ie(d)?.lastSyncedWithServer;
    } catch {
    }
    E(o, []);
    const h = {
      state: e,
      lastUpdated: Date.now(),
      lastSyncedWithServer: w
    }, t = ze.serialize(h);
    window.localStorage.setItem(
      d,
      JSON.stringify(t.json)
    );
  }
}, ie = (e) => {
  if (!e) return null;
  try {
    const o = window.localStorage.getItem(e);
    return o ? JSON.parse(o) : null;
  } catch (o) {
    return console.error("Error loading from localStorage:", o), null;
  }
}, ce = (e) => {
  if (e)
    try {
      typeof window < "u" && window.localStorage && window.localStorage.removeItem(e);
    } catch (o) {
      console.error("Error removing from localStorage:", o);
    }
}, Xe = (e, o) => {
  const c = z(e, []), { sessionId: i } = Me(), f = B(o?.localStorage?.key) ? o.localStorage.key(c) : o?.localStorage?.key;
  if (f && i) {
    const u = ie(
      `${i}-${e}-${f}`
    );
    if (u && u.lastUpdated > (u.lastSyncedWithServer || 0))
      return U(e), !0;
  }
  return !1;
}, U = (e) => {
  const o = E(e, []);
  if (!o) return;
  const c = /* @__PURE__ */ new Set();
  o?.components?.forEach((i) => {
    i.reactiveType !== "none" && c.add(() => i.forceUpdate());
  }), queueMicrotask(() => {
    c.forEach((i) => i());
  });
};
let Q = [], fe = !1;
function Ke() {
  fe || (fe = !0, queueMicrotask(() => {
    it();
  }));
}
function et(e, o) {
  e?.signals?.length && e.signals.forEach(
    ({ parentId: c, position: i, effect: f, dependencies: u }) => {
      const d = document.querySelector(`[data-parent-id="${c}"]`);
      if (!d) return;
      const w = Array.from(d.childNodes);
      if (!w[i]) return;
      const h = u?.length ? u.map(
        ({ stateKey: n, path: y }) => z(n, y)
      ) : o;
      let t = h;
      if (f && h !== null)
        try {
          t = new Function(
            "state",
            `return (${f})(state)`
          )(h);
        } catch (n) {
          console.error("Error evaluating effect function:", n);
        }
      t !== null && typeof t == "object" && (t = JSON.stringify(t)), w[i].textContent = String(t ?? "");
    }
  );
}
function tt(e, o, c) {
  const i = E(e, []);
  if (!i?.components)
    return /* @__PURE__ */ new Set();
  const f = /* @__PURE__ */ new Set();
  if (c.type === "update") {
    let u = [...o];
    for (; ; ) {
      const d = E(e, u);
      if (d?.pathComponents && d.pathComponents.forEach((w) => {
        const h = i.components?.get(w);
        h && h.reactiveType !== "none" && f.add(h);
      }), u.length === 0) break;
      u.pop();
    }
    c.newValue && typeof c.newValue == "object" && !De(c.newValue) && Ce(c.newValue, c.oldValue).forEach((w) => {
      const h = w.split("."), t = [...o, ...h], n = E(e, t);
      n?.pathComponents && n.pathComponents.forEach((y) => {
        const $ = i.components?.get(y);
        $ && $.reactiveType !== "none" && f.add($);
      });
    });
  } else if (c.type === "insert" || c.type === "cut" || c.type === "insert_many") {
    let d = [...c.type === "insert" ? o : o.slice(0, -1)];
    for (; ; ) {
      const w = E(e, d);
      if (w?.pathComponents && w.pathComponents.forEach((h) => {
        const t = i.components?.get(h);
        t && f.add(t);
      }), d.length === 0) break;
      d.pop();
    }
  }
  return f;
}
function nt(e, o, c) {
  const i = A.getState().getShadowValue(e, o), f = B(c) ? c(i) : c;
  if (ee(i, f))
    return null;
  Ue(e, o, f);
  const u = E(e, o);
  return {
    type: "update",
    oldValue: i,
    newValue: f,
    shadowMeta: u
  };
}
function rt(e, o, c) {
  We(e, o, c);
  const i = E(e, o);
  return {
    type: "insert_many",
    count: c.length,
    shadowMeta: i,
    path: o
  };
}
function ot(e, o, c, i, f) {
  let u;
  if (B(c)) {
    const { value: t } = L(e, o);
    u = c({ state: t });
  } else
    u = c;
  const d = Re(
    e,
    o,
    u,
    i,
    f
  ), w = E(e, o);
  let h;
  return w?.arrayKeys && i !== void 0 && i > 0 && (h = w.arrayKeys[i - 1]), {
    type: "insert",
    newValue: u,
    shadowMeta: w,
    path: o,
    itemId: d,
    insertAfterId: h
  };
}
function at(e, o) {
  const c = o.slice(0, -1), i = z(e, o);
  return xe(e, o), { type: "cut", oldValue: i, parentPath: c };
}
function it() {
  const e = Q;
  Q = [], fe = !1;
  const o = /* @__PURE__ */ new Set(), c = [], i = [];
  for (const f of e) {
    if (f.status && f.updateType) {
      i.push(f);
      continue;
    }
    const u = f, d = u.type === "cut" ? null : u.newValue;
    u.shadowMeta?.signals?.length > 0 && c.push({ shadowMeta: u.shadowMeta, displayValue: d }), tt(
      u.stateKey,
      u.path,
      u
    ).forEach((h) => {
      o.add(h);
    });
  }
  i.length > 0 && He(i), c.forEach(({ shadowMeta: f, displayValue: u }) => {
    et(f, u);
  }), o.forEach((f) => {
    f.forceUpdate();
  });
}
function st(e, o, c) {
  return (f, u, d) => {
    i(e, u, f, d);
  };
  function i(f, u, d, w) {
    let h;
    switch (w.updateType) {
      case "update":
        h = nt(f, u, d);
        break;
      case "insert":
        h = ot(
          f,
          u,
          d,
          w.index,
          w.itemId
        );
        break;
      case "insert_many":
        h = rt(f, u, d);
        break;
      case "cut":
        h = at(f, u);
        break;
    }
    if (h === null)
      return;
    h.stateKey = f, h.path = u, Q.push(h), Ke();
    const t = {
      timeStamp: Date.now(),
      stateKey: f,
      path: u,
      updateType: w.updateType,
      status: "new",
      oldValue: h.oldValue,
      newValue: h.newValue ?? null,
      itemId: h.itemId,
      insertAfterId: h.insertAfterId,
      metaData: w.metaData
    };
    Q.push(t), h.newValue !== void 0 && Ye(
      h.newValue,
      f,
      c.current,
      o
    ), c.current?.middleware && c.current.middleware({ update: t }), Fe(t, w.validationTrigger || "programmatic"), Ze(t);
  }
}
function ct(e, {
  stateKey: o,
  localStorage: c,
  formElements: i,
  reactiveType: f,
  componentId: u,
  defaultState: d
} = {}) {
  const [, w] = K({}), { sessionId: h } = Me(), [t] = K(!o), [n] = K(o ?? oe()), y = J(u ?? oe()), $ = J(
    null
  );
  $.current = F(n) ?? null;
  const b = be(
    (P) => {
      const _ = P ? { ...F(n), ...P } : F(n), T = _?.defaultState || d || e;
      if (_?.localStorage?.key && h) {
        const l = B(_.localStorage.key) ? _.localStorage.key(T) : _.localStorage.key, j = ie(
          `${h}-${n}-${l}`
        );
        if (j)
          return {
            value: j.state,
            source: "localStorage",
            timestamp: j.lastUpdated
          };
      }
      return {
        value: T || e,
        source: "default",
        timestamp: Date.now()
      };
    },
    [n, d, e, h]
  );
  te(() => {
    const P = F(n), k = {
      localStorageEnabled: !!P?.localStorage?.key
    };
    if (Ve(n, [], {
      features: k
    }), P?.defaultState !== void 0 || d !== void 0) {
      const l = P?.defaultState || d;
      P?.defaultState || ve(n, {
        defaultState: l
      });
    }
    const { value: _ } = b();
    ae(n, _);
    const T = F(n)?.validation;
    T?.zodSchemaV4 ? H(n, T.zodSchemaV4, "zod4") : T?.zodSchemaV3 && H(n, T.zodSchemaV3, "zod3"), U(n);
  }, [n]), re(() => {
    t && (n in A.getState().initialStateGlobal || ue(n, e), ve(n, {
      formElements: i,
      defaultState: d,
      localStorage: c,
      middleware: $.current?.middleware
    }));
    const P = `${n}////${y.current}`;
    return Ge(n, P, {
      forceUpdate: () => w({}),
      reactiveType: f ?? "component",
      paths: /* @__PURE__ */ new Set()
    }), w({}), () => {
      qe(n, P);
    };
  }, [n, f]), te(() => {
    if (t)
      return () => {
        he.delete(n), he.delete(`[${n}`), Q = Q.filter(
          (k) => k.stateKey !== n
        );
        const P = A.getState();
        for (const k of P.pathSubscribers.keys())
          (k === n || k.startsWith(n + ".")) && P.pathSubscribers.delete(k);
        A.setState((k) => {
          const _ = { ...k.initialStateGlobal }, T = { ...k.initialStateOptions }, l = new Map(k.stateLog), j = new Map(k.selectedIndicesMap);
          delete _[n], delete T[n], l.delete(n);
          for (const W of j.keys())
            (W === n || W.startsWith(n + ".")) && j.delete(W);
          return {
            initialStateGlobal: _,
            initialStateOptions: T,
            stateLog: l,
            selectedIndicesMap: j
          };
        });
      };
  }, [t, n]);
  const O = st(
    n,
    h,
    $
  );
  return !t && !A.getState().initialStateGlobal[n] && ue(n, e), pe(() => Ee(
    n,
    O,
    y.current,
    h
  ), [n, h]);
}
const lt = (e, o, c) => {
  let i = E(e, o)?.arrayKeys || [];
  const f = c?.transforms;
  if (!f || f.length === 0)
    return i;
  for (const u of f)
    if (u.type === "filter") {
      const d = [];
      i.forEach((w, h) => {
        const t = z(e, [...o, w]);
        u.fn(t, h) && d.push(w);
      }), i = d;
    } else u.type === "sort" && i.sort((d, w) => {
      const h = z(e, [...o, d]), t = z(e, [...o, w]);
      return u.fn(h, t);
    });
  return i;
}, Y = (e, o, c) => {
  const i = `${e}////${o}`, u = E(e, [])?.components?.get(i);
  !u || u.reactiveType === "none" || Be(e, c, i);
}, X = (e, o, c) => {
  const i = E(e, []);
  E(e, [
    ...o,
    "getSelected"
  ])?.pathComponents?.forEach((u) => {
    i?.components?.get(u)?.forceUpdate();
  });
  const f = E(e, o);
  for (let u of f?.arrayKeys || []) {
    const d = u + ".selected", w = E(e, d.split(".").slice(1));
    u == c && w?.pathComponents?.forEach((h) => {
      i?.components?.get(h)?.forceUpdate();
    });
  }
};
function L(e, o, c) {
  const i = E(e, o), f = o.length > 0 ? o.join(".") : "root", u = c?.arrayViews?.[f];
  if (Array.isArray(u) && u.length === 0)
    return {
      shadowMeta: i,
      value: [],
      arrayKeys: i?.arrayKeys
    };
  const d = z(e, o, u);
  return {
    shadowMeta: i,
    value: d,
    arrayKeys: i?.arrayKeys
  };
}
function ut(e, o) {
  return o ? e.length !== o.length ? !1 : o.every((c, i) => c === "*" || c === e[i]) : !0;
}
function dt(e, o) {
  return o === "any" ? !0 : o === "array" ? Array.isArray(e) : o === "boolean" ? typeof e == "boolean" : o === "object" ? e !== null && typeof e == "object" && !Array.isArray(e) : o === "primitive" ? e === null || typeof e != "object" && !Array.isArray(e) : !1;
}
function Ae(e, o) {
  const c = A.getState().getShadowMetadata(e, o);
  if (!c?.clientActivityState?.elements) return [];
  const i = [];
  return c.clientActivityState.elements.forEach((f) => {
    f.domRef?.current && i.push(f.domRef);
  }), i;
}
function $e(e, o) {
  return Ae(e, o).map((i) => i.current).filter(Boolean);
}
function ft(e, o, c) {
  $e(e, o).forEach((i) => {
    if ("disabled" in i) {
      i.disabled = c;
      return;
    }
    i.style.pointerEvents = c ? "none" : "", i.setAttribute("aria-disabled", String(c));
  });
}
function Pe(e, o, c = "default") {
  return [...e, "$pluginMeta", o, c];
}
function gt(e, o, c, i) {
  const f = E(e, []);
  E(
    e,
    Pe(o, c, i)
  )?.pathComponents?.forEach((d) => {
    f?.components?.get(d)?.forceUpdate();
  });
}
function Ee(e, o, c, i) {
  const f = /* @__PURE__ */ new Map(), u = 1e3;
  function d({
    path: t = [],
    meta: n,
    componentId: y
  }) {
    if (E(e, t)?.isRaw)
      return z(e, t);
    const b = n ? JSON.stringify(n.arrayViews || n.transforms) : "", O = t.join(".") + ":" + y + ":" + b;
    if (f.has(O)) {
      const T = f.get(O);
      return f.delete(O), f.set(O, T), T;
    }
    const C = [e, ...t].join("."), P = () => {
    }, k = {
      apply(T, l, j) {
        if (j.length === 0) {
          const r = t.length > 0 ? t.join(".") : "root", a = n?.arrayViews?.[r];
          return Y(e, y, t), z(e, t, a);
        }
        const W = j[0];
        return o(W, t, { updateType: "update" }), !0;
      },
      get(T, l, j) {
        if (l === Symbol.toPrimitive)
          return (r) => r === "number" ? NaN : r === "string" ? `[CogsState: ${t.join(".") || "root"}]` : null;
        if (l === Symbol.toStringTag)
          return "CogsState";
        if (l === Symbol.iterator) {
          const { value: r } = L(e, t, n);
          return Array.isArray(r) ? function* () {
            for (let a = 0; a < r.length; a++)
              yield r[a];
          } : void 0;
        }
        if (l === "call" || l === "apply" || l === "bind")
          return Reflect.get(T, l, j);
        if (typeof l != "string")
          return Reflect.get(T, l);
        if (t.length === 0 && l in w)
          return w[l];
        if (typeof l == "string" && !l.startsWith("$")) {
          const { value: r } = L(e, t, n);
          if (r !== null && typeof r == "object" && !Array.isArray(r) && Object.prototype.hasOwnProperty.call(r, l)) {
            const g = [...t, l];
            return d({
              path: g,
              componentId: y,
              meta: n
            });
          }
          const s = [...t, l];
          return d({
            path: s,
            componentId: y,
            meta: n
          });
        }
        if (typeof l == "string" && l.startsWith("$")) {
          const r = l.slice(1), { value: a } = L(e, t, n), s = q.getState().registeredPlugins;
          for (const g of s) {
            const S = g.chainMethods?.[r];
            if (S && ut(t, S.pathPattern) && dt(a, S.target))
              return (...m) => {
                const v = q.getState(), M = v.pluginOptions.get(e)?.get(g.name), p = v.getHookResult(e, g.name);
                return S.handler(
                  {
                    stateKey: e,
                    path: t,
                    pluginName: g.name,
                    options: M,
                    hookData: p,
                    $get: () => L(e, t, n).value,
                    $update: (V) => (o(V, t, {
                      updateType: "update"
                    }), {
                      syned: () => {
                      }
                    }),
                    $applyOperation: (V, I) => {
                      o(V.newValue, V.path, {
                        updateType: V.updateType,
                        itemId: V.itemId,
                        metaData: I
                      });
                    },
                    getFieldMetaData: () => me(e, t)?.get(g.name),
                    setFieldMetaData: (V) => ye(e, t, g.name, V),
                    removeFieldMetaData: () => we(e, t, g.name),
                    watchPluginMeta: (V) => Y(
                      e,
                      y,
                      Pe(t, g.name, V)
                    ),
                    notifyPluginMeta: (V) => gt(
                      e,
                      t,
                      g.name,
                      V
                    ),
                    getFieldRefs: () => Ae(e, t),
                    getFieldElements: () => $e(e, t),
                    setFieldDisabled: (V) => ft(e, t, V)
                  },
                  ...m
                );
              };
          }
        }
        if (l === "$_rebuildStateShape")
          return d;
        if (l === "$removeStorage")
          return () => {
            const r = A.getState().initialStateGlobal[e], a = F(e), s = B(a?.localStorage?.key) ? a.localStorage.key(r) : a?.localStorage?.key, g = i && s ? `${i}-${e}-${s}` : void 0;
            ce(g);
          };
        if (l === "$setRaw")
          return (r) => {
            const a = E(e, t) || {};
            Ve(e, t, { ...a, isRaw: !0 }), o(r, t, { updateType: "update" });
          };
        if (l === "$validate")
          return (r) => {
            const a = A.getState();
            if (r) {
              const v = r.map((M) => {
                const p = [...t, M], V = a.getShadowValue(e, p), I = a.getShadowMetadata(e, p) || {}, N = I.typeInfo?.schema;
                if (!N)
                  return {
                    key: M,
                    path: p,
                    success: !0,
                    data: V
                  };
                const D = N.safeParse(V), x = D.error?.issues || D.error?.errors || [];
                return a.setShadowMetadata(e, p, {
                  ...I,
                  validation: {
                    status: D.success ? "VALID" : "INVALID",
                    errors: D.success ? [] : [
                      {
                        source: "client",
                        message: x[0]?.message || "Invalid value",
                        severity: "error",
                        code: x[0]?.code
                      }
                    ],
                    lastValidated: Date.now(),
                    validatedValue: V
                  }
                }), a.notifyPathSubscribers(
                  [e, ...p].join("."),
                  {
                    type: "VALIDATION_UPDATE"
                  }
                ), {
                  key: M,
                  path: p,
                  success: D.success,
                  data: D.success ? D.data : void 0,
                  error: D.success ? void 0 : D.error
                };
              });
              return U(e), {
                success: v.every((M) => M.success),
                results: v
              };
            }
            const { value: s } = L(e, t, n), g = a.getInitialOptions(e), S = g?.validation?.zodSchemaV4 || g?.validation?.zodSchemaV3;
            if (!S)
              return { success: !0, data: s };
            const m = S.safeParse(s);
            if (m.success) {
              const v = a.getShadowMetadata(e, t) || {};
              a.setShadowMetadata(e, t, {
                ...v,
                validation: {
                  status: "VALID",
                  errors: [],
                  lastValidated: Date.now()
                }
              });
            } else
              (m.error?.issues || m.error?.errors || []).forEach((M) => {
                const p = [...t, ...M.path.map(String)], V = a.getShadowMetadata(e, p) || {};
                a.setShadowMetadata(e, p, {
                  ...V,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: "client",
                        message: M.message,
                        severity: "error",
                        code: M.code
                      }
                    ],
                    lastValidated: Date.now(),
                    validatedValue: a.getShadowValue(e, p)
                  }
                });
              });
            return U(e), m;
          };
        if (l === "$showValidationErrors")
          return () => {
            const { shadowMeta: r } = L(e, t, n);
            return r?.validation?.status === "INVALID" && r.validation.errors.length > 0 ? r.validation.errors.filter((a) => a.severity === "error").map((a) => a.message) : [];
          };
        if (l === "$validationErrors")
          return (r) => {
            const a = A.getState(), s = (S) => {
              const m = a.getShadowMetadata(
                e,
                S
              )?.validation, v = (m?.errors || []).map((I) => ({
                ...I,
                path: S
              })), M = v.filter(
                (I) => I.severity === "error"
              ), p = v.filter(
                (I) => I.severity === "warning"
              ), V = M.length > 0 ? "error" : p.length > 0 ? "warning" : void 0;
              return {
                status: m?.status || "NOT_VALIDATED",
                severity: V,
                hasErrors: M.length > 0,
                hasWarnings: p.length > 0,
                message: M[0]?.message || p[0]?.message || "",
                errors: M.map((I) => I.message),
                warnings: p.map((I) => I.message),
                allErrors: v,
                path: S,
                getData: () => a.getShadowValue(e, S)
              };
            };
            return (r ?? Object.keys(a.getShadowNode(e, t) ?? {}).filter(
              (S) => S !== "_meta"
            )).map((S) => s([...t, S]));
          };
        if (l === "$getSelected")
          return () => {
            const r = [e, ...t].join(".");
            Y(e, y, [
              ...t,
              "getSelected"
            ]);
            const a = A.getState().selectedIndicesMap.get(r);
            if (!a)
              return;
            const s = t.join("."), g = n?.arrayViews?.[s], S = a.split(".").pop();
            if (!(g && !g.includes(S) || z(
              e,
              a.split(".").slice(1)
            ) === void 0))
              return d({
                path: a.split(".").slice(1),
                componentId: y,
                meta: n
              });
          };
        if (l === "$getSelectedIndex")
          return () => {
            const r = e + "." + t.join(".");
            t.join(".");
            const a = A.getState().selectedIndicesMap.get(r);
            if (!a)
              return -1;
            const { keys: s } = R(e, t, n);
            if (!s)
              return -1;
            const g = a.split(".").pop();
            return s.indexOf(g);
          };
        if (l === "$clearSelected")
          return X(e, t), () => {
            Qe({
              arrayKey: e + "." + t.join(".")
            });
          };
        if (l === "$map")
          return (r) => {
            const { value: a, keys: s } = R(
              e,
              t,
              n
            );
            if (Y(e, y, t), !s || !Array.isArray(a))
              return [];
            const g = d({
              path: t,
              componentId: y,
              meta: n
            });
            return a.map((S, m) => {
              const v = s[m];
              if (!v) return;
              const M = [...t, v], p = d({
                path: M,
                // This now correctly points to the item in the shadow store.
                componentId: y,
                meta: n
              });
              return r(p, m, g);
            });
          };
        if (l === "$filter")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", { keys: s, value: g } = R(
              e,
              t,
              n
            );
            if (!Array.isArray(g))
              throw new Error("filter can only be used on arrays");
            const S = [];
            return g.forEach((m, v) => {
              if (r(m, v)) {
                const M = s[v];
                M && S.push(M);
              }
            }), d({
              path: t,
              componentId: y,
              meta: {
                ...n,
                arrayViews: {
                  ...n?.arrayViews || {},
                  [a]: S
                },
                transforms: [
                  ...n?.transforms || [],
                  { type: "filter", fn: r, path: t }
                ]
              }
            });
          };
        if (l === "$sort")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", { value: s, keys: g } = R(
              e,
              t,
              n
            );
            if (!Array.isArray(s) || !g)
              throw new Error("No array keys found for sorting");
            const S = s.map((v, M) => ({
              item: v,
              key: g[M]
            }));
            S.sort((v, M) => r(v.item, M.item));
            const m = S.map((v) => v.key);
            return d({
              path: t,
              componentId: y,
              meta: {
                ...n,
                arrayViews: {
                  ...n?.arrayViews || {},
                  [a]: m
                },
                transforms: [
                  ...n?.transforms || [],
                  { type: "sort", fn: r, path: t }
                ]
              }
            });
          };
        if (l === "$list")
          return (r) => /* @__PURE__ */ Z(() => {
            const s = J(/* @__PURE__ */ new Map()), [g, S] = K({}), m = t.length > 0 ? t.join(".") : "root", v = lt(e, t, n);
            te(() => {
              const N = new Set(v);
              for (const D of s.current.keys())
                N.has(D) || s.current.delete(D);
            });
            const M = pe(() => ({
              ...n,
              arrayViews: {
                ...n?.arrayViews || {},
                [m]: v
              }
            }), [n, m, v]), { value: p } = R(
              e,
              t,
              M
            );
            if (te(() => {
              const N = A.getState().subscribeToPath(C, (D) => {
                if (D.type === "GET_SELECTED")
                  return;
                const G = A.getState().getShadowMetadata(e, t)?.transformCaches;
                if (G)
                  for (const ne of G.keys())
                    ne.startsWith(y) && G.delete(ne);
                (D.type === "INSERT" || D.type === "INSERT_MANY" || D.type === "REMOVE" || D.type === "CLEAR_SELECTION") && S({});
              });
              return () => {
                N();
              };
            }, [y, C]), !Array.isArray(p))
              return null;
            const V = d({
              path: t,
              componentId: y,
              meta: M
              // Use updated meta here
            }), I = p.map((N, D) => {
              const x = v[D];
              if (!x)
                return null;
              let G = s.current.get(x);
              G || (G = oe(), s.current.set(x, G));
              const ne = [...t, x];
              return ge(Ne, {
                key: x,
                stateKey: e,
                itemComponentId: G,
                itemPath: ne,
                localIndex: D,
                arraySetter: V,
                rebuildStateShape: d,
                renderFn: r
              });
            });
            return /* @__PURE__ */ Z(Ie, { children: I });
          }, {});
        if (l === "$stateFlattenOn")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", s = n?.arrayViews?.[a], g = A.getState().getShadowValue(e, t, s);
            return Array.isArray(g) ? d({
              path: [...t, "[*]", r],
              componentId: y,
              meta: n
            }) : [];
          };
        if (l === "$index")
          return (r) => {
            const a = t.length > 0 ? t.join(".") : "root", s = n?.arrayViews?.[a];
            if (s) {
              const m = s[r];
              return m ? d({
                path: [...t, m],
                componentId: y,
                meta: n
              }) : void 0;
            }
            const g = E(e, t);
            if (!g?.arrayKeys) return;
            const S = g.arrayKeys[r];
            if (S)
              return d({
                path: [...t, S],
                componentId: y,
                meta: n
              });
          };
        if (l === "$last")
          return () => {
            const { keys: r } = R(e, t, n);
            if (!r || r.length === 0)
              return;
            const a = r[r.length - 1];
            if (!a)
              return;
            const s = [...t, a];
            return d({
              path: s,
              componentId: y,
              meta: n
            });
          };
        if (l === "$insert")
          return (r, a) => {
            o(r, t, {
              updateType: "insert",
              index: a
            });
          };
        if (l === "$insertMany")
          return (r) => {
            o(r, t, {
              updateType: "insert_many"
            });
          };
        if (l === "$uniqueInsert")
          return (r, a, s) => {
            const { value: g } = L(
              e,
              t,
              n
            ), S = B(r) ? r(g) : r;
            let m = null;
            if (!g.some((M) => {
              const p = a ? a.every(
                (V) => ee(M[V], S[V])
              ) : ee(M, S);
              return p && (m = M), p;
            }))
              o(S, t, { updateType: "insert" });
            else if (s && m) {
              const M = s(m), p = g.map(
                (V) => ee(V, m) ? M : V
              );
              o(p, t, {
                updateType: "update"
              });
            }
          };
        if (l === "$cut")
          return (r, a) => {
            const s = E(e, t);
            if (!s?.arrayKeys || s.arrayKeys.length === 0)
              return;
            const g = r === -1 ? s.arrayKeys.length - 1 : r !== void 0 ? r : s.arrayKeys.length - 1, S = s.arrayKeys[g];
            S && o(null, [...t, S], {
              updateType: "cut"
            });
          };
        if (l === "$cutSelected")
          return () => {
            const r = [e, ...t].join("."), { keys: a } = R(e, t, n);
            if (!a || a.length === 0)
              return;
            const s = A.getState().selectedIndicesMap.get(r);
            if (!s)
              return;
            const g = s.split(".").pop();
            if (!a.includes(g))
              return;
            const S = s.split(".").slice(1);
            A.getState().clearSelectedIndex({ arrayKey: r });
            const m = S.slice(0, -1);
            X(e, m), o(null, S, {
              updateType: "cut"
            });
          };
        if (l === "$cutByValue")
          return (r) => {
            const {
              isArray: a,
              value: s,
              keys: g
            } = R(e, t, n);
            if (!a) return;
            const S = se(s, g, (m) => m === r);
            S && o(null, [...t, S.key], {
              updateType: "cut"
            });
          };
        if (l === "$toggleByValue")
          return (r) => {
            const {
              isArray: a,
              value: s,
              keys: g
            } = R(e, t, n);
            if (!a) return;
            const S = se(s, g, (m) => m === r);
            if (S) {
              const m = [...t, S.key];
              o(null, m, {
                updateType: "cut"
              });
            } else
              o(r, t, { updateType: "insert" });
          };
        if (l === "$findWith")
          return (r, a) => {
            const { isArray: s, value: g, keys: S } = R(e, t, n);
            if (!s)
              throw new Error("findWith can only be used on arrays");
            const m = se(
              g,
              S,
              (v) => v?.[r] === a
            );
            return m ? d({
              path: [...t, m.key],
              componentId: y,
              meta: n
            }) : null;
          };
        if (l === "$cutThis") {
          const { value: r } = L(e, t, n), a = t.slice(0, -1);
          return X(e, a), () => {
            o(r, t, { updateType: "cut" });
          };
        }
        if (l === "$get")
          return () => {
            Y(e, y, t);
            const { value: r } = L(e, t, n);
            return r;
          };
        if (l === "$derive")
          return (r) => {
            if (typeof r != "function")
              throw new Error(
                "CogsState: $derive requires a selector function."
              );
            return r(
              d({
                path: t,
                componentId: y,
                meta: n
              })
            );
          };
        if (l === "$$derive")
          return (r, a) => {
            if (Array.isArray(r)) {
              if (typeof a != "function")
                throw new Error(
                  "CogsState: $$derive(dependencies, selector) requires a selector function."
                );
              return le({
                _stateKey: e,
                _path: t,
                _effect: a.toString(),
                _dependencies: r.map((s) => ({
                  stateKey: s.$_stateKey,
                  path: s.$_path
                })),
                _meta: n
              });
            }
            if (typeof r != "function")
              throw new Error(
                "CogsState: $$derive requires a selector function."
              );
            return le({
              _stateKey: e,
              _path: t,
              _effect: r.toString(),
              _meta: n
            });
          };
        if (l === "$$get")
          return () => le({ _stateKey: e, _path: t, _meta: n });
        if (l == "getLocalStorage")
          return (r) => ie(i + "-" + e + "-" + r);
        if (l === "$isSelected") {
          const r = t.slice(0, -1);
          if (E(e, r)?.arrayKeys) {
            const s = e + "." + r.join("."), g = A.getState().selectedIndicesMap.get(s), S = e + "." + t.join(".");
            return g === S;
          }
          return;
        }
        if (l === "$setSelected")
          return (r) => {
            const a = t.slice(0, -1), s = e + "." + a.join("."), g = e + "." + t.join(".");
            X(e, a, void 0), A.getState().selectedIndicesMap.get(s), r && A.getState().setSelectedIndex(s, g);
          };
        if (l === "$toggleSelected")
          return () => {
            const r = t.slice(0, -1), a = e + "." + r.join("."), s = e + "." + t.join(".");
            A.getState().selectedIndicesMap.get(a) === s ? A.getState().clearSelectedIndex({ arrayKey: a }) : A.getState().setSelectedIndex(a, s), X(e, r);
          };
        if (l === "$clearValidation")
          return (r) => {
            const a = r ? [...t, ...r] : t, s = A.getState(), g = s.getShadowNode(e, a);
            if (console.log("startNode ", g), !g) return;
            const S = [[g, a]];
            for (console.log("stack ", S); S.length > 0; ) {
              const [m, v] = S.pop();
              if (console.log("while (stack.length ", m, v), !m || typeof m != "object") continue;
              if (m._meta?.validation) {
                m._meta.validation = {
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
              const M = Object.keys(m);
              for (const p of M)
                p !== "_meta" && S.push([m[p], [...v, p]]);
            }
            U(e);
          };
        if (t.length == 0) {
          if (l === "$_componentId")
            return y;
          if (l === "$setOptions")
            return (r) => {
              de({ stateKey: e, options: r, initialOptionsPart: {} });
            };
          if (l === "$_applyUpdate")
            return (r, a, s = "update") => {
              o(r, a, { updateType: s });
            };
          if (l === "$_getEffectiveSetState")
            return o;
          if (l === "$getPluginMetaData")
            return (r) => me(e, t)?.get(r);
          if (l === "$addPluginMetaData")
            return (r, a) => ye(e, t, r, a);
          if (l === "$removePluginMetaData")
            return (r) => we(e, t, r);
          if (l === "$addZodValidation")
            return (r, a) => {
              const s = A.getState();
              r.forEach((g) => {
                const S = g.path.map(String), m = s.getShadowMetadata(e, S) || {};
                s.setShadowMetadata(e, S, {
                  ...m,
                  validation: {
                    status: "INVALID",
                    errors: [
                      {
                        source: a || "client",
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
              }), U(e);
            };
          if (l === "$clearZodValidationPaths")
            return (r) => {
              const a = A.getState();
              r.forEach((s) => {
                const g = a.getShadowMetadata(e, s) || {};
                g.validation && (a.setShadowMetadata(e, s, {
                  ...g,
                  validation: {
                    status: "NOT_VALIDATED",
                    errors: [],
                    lastValidated: Date.now(),
                    validatedValue: void 0
                  }
                }), a.notifyPathSubscribers(
                  [e, ...s].join("."),
                  { type: "VALIDATION_CLEAR" }
                ));
              }), U(e);
            };
          if (l === "$applyOperation")
            return (r, a) => {
              let s;
              if (r.insertAfterId && r.updateType === "insert") {
                const g = E(e, r.path);
                if (g?.arrayKeys) {
                  const S = g.arrayKeys.indexOf(
                    r.insertAfterId
                  );
                  S !== -1 && (s = S + 1);
                }
              }
              o(r.newValue, r.path, {
                updateType: r.updateType,
                itemId: r.itemId,
                index: s,
                // Pass the calculated index
                metaData: a
              });
            };
          if (l === "$applyJsonPatch")
            return (r) => {
              const a = A.getState(), s = a.getShadowMetadata(e, []);
              if (!s?.components) return;
              const g = (m) => !m || m === "/" ? [] : m.split("/").slice(1).map((v) => v.replace(/~1/g, "/").replace(/~0/g, "~")), S = /* @__PURE__ */ new Set();
              for (const m of r) {
                const v = g(m.path);
                switch (m.op) {
                  case "add":
                  case "replace": {
                    const { value: M } = m;
                    a.updateShadowAtPath(e, v, M);
                    let p = [...v];
                    for (; ; ) {
                      const V = a.getShadowMetadata(
                        e,
                        p
                      );
                      if (V?.pathComponents && V.pathComponents.forEach((I) => {
                        if (!S.has(I)) {
                          const N = s.components?.get(I);
                          N && (N.forceUpdate(), S.add(I));
                        }
                      }), p.length === 0) break;
                      p.pop();
                    }
                    break;
                  }
                  case "remove": {
                    const M = v.slice(0, -1);
                    a.removeShadowArrayElement(e, v);
                    let p = [...M];
                    for (; ; ) {
                      const V = a.getShadowMetadata(
                        e,
                        p
                      );
                      if (V?.pathComponents && V.pathComponents.forEach((I) => {
                        if (!S.has(I)) {
                          const N = s.components?.get(I);
                          N && (N.forceUpdate(), S.add(I));
                        }
                      }), p.length === 0) break;
                      p.pop();
                    }
                    break;
                  }
                }
              }
            };
          if (l === "$getComponents")
            return () => E(e, [])?.components;
        }
        if (l === "$validationWrapper")
          return ({
            children: r,
            hideMessage: a
          }) => /* @__PURE__ */ Z(
            Oe,
            {
              formOpts: a ? { validation: { message: "" } } : void 0,
              path: t,
              stateKey: e,
              children: r
            }
          );
        if (l === "$_stateKey") return e;
        if (l === "$_path") return t;
        if (l === "$update")
          return (r) => (o(r, t, { updateType: "update" }), {
            synced: () => {
            }
          });
        if (l === "$toggle") {
          const { value: r } = L(
            e,
            t,
            n
          );
          if (typeof r != "boolean")
            throw new Error("toggle() can only be used on boolean values");
          return () => {
            o(!r, t, {
              updateType: "update"
            });
          };
        }
        if (l === "$isolate")
          return (r, a) => {
            const s = Array.isArray(r), g = s ? r : void 0, S = s ? a : r;
            if (!S || typeof S != "function")
              throw new Error(
                "CogsState: $isolate requires a render function."
              );
            return /* @__PURE__ */ Z(
              _e,
              {
                stateKey: e,
                path: t,
                dependencies: g,
                rebuildStateShape: d,
                renderFn: S
              }
            );
          };
        if (l === "$formElement")
          return (r, a) => /* @__PURE__ */ Z(
            je,
            {
              stateKey: e,
              path: t,
              rebuildStateShape: d,
              setState: o,
              formOpts: a,
              renderFn: r
            }
          );
        const W = [...t, l];
        return d({
          path: W,
          componentId: y,
          meta: n
        });
      }
    }, _ = new Proxy(P, k);
    return f.size >= u && f.delete(f.keys().next().value), f.set(O, _), _;
  }
  const w = {
    $revertToInitialState: (t) => {
      const n = A.getState().initialStateGlobal[e];
      Je(e), ae(e, n), d({
        path: [],
        componentId: c
      });
      const y = F(e), $ = B(y?.localStorage?.key) ? y?.localStorage?.key(n) : y?.localStorage?.key, b = i && $ ? `${i}-${e}-${$}` : void 0;
      return ce(b), U(e), n;
    },
    $initializeAndMergeShadowState: (t) => {
      Le(e, t), U(e);
    },
    $updateInitialState: (t) => {
      const n = Ee(
        e,
        o,
        c,
        i
      ), y = A.getState().initialStateGlobal[e], $ = F(e), b = B($?.localStorage?.key) ? $?.localStorage?.key(y) : $?.localStorage?.key, O = i && b ? `${i}-${e}-${b}` : void 0;
      return ce(O), ke(() => {
        ue(e, t), ae(e, t);
        const C = A.getState().getShadowMetadata(e, []);
        C && C?.components?.forEach((P) => {
          P.reactiveType !== "none" && P.forceUpdate();
        });
      }), {
        fetchId: (C) => n.$get()[C]
      };
    }
  };
  return d({
    componentId: c,
    path: []
  });
}
function le(e) {
  return ge(St, { proxy: e });
}
function St({ proxy: e }) {
  const o = J(null), c = J(null), i = J(!1), u = (e._dependencies?.length ? e._dependencies : [{ stateKey: e._stateKey, path: e._path }]).filter(
    (n, y, $) => $.findIndex(
      (b) => b.stateKey === n.stateKey && b.path.join("\0") === n.path.join("\0")
    ) === y
  ), d = u.map(({ stateKey: n, path: y }) => `${n}-${y.join(".")}`).join("--"), w = e._path.length > 0 ? e._path.join(".") : "root", h = e._meta?.arrayViews?.[w], t = e._dependencies?.length ? u.map(
    ({ stateKey: n, path: y }) => z(n, y)
  ) : z(e._stateKey, e._path, h);
  return te(() => {
    const n = o.current;
    if (!n || i.current) return;
    const y = setTimeout(() => {
      if (!n.parentElement) {
        console.warn("Parent element not found for signal", d);
        return;
      }
      const $ = n.parentElement, O = Array.from($.childNodes).indexOf(n);
      let C = $.getAttribute("data-parent-id");
      C || (C = `parent-${crypto.randomUUID()}`, $.setAttribute("data-parent-id", C)), c.current = `instance-${crypto.randomUUID()}`;
      const P = {
        instanceId: c.current,
        parentId: C,
        position: O,
        effect: e._effect,
        dependencies: e._dependencies?.length ? u : void 0
      };
      u.forEach(({ stateKey: T, path: l }) => {
        const j = A.getState().getShadowMetadata(T, l) || {}, W = [...j.signals || [], P];
        A.getState().setShadowMetadata(T, l, {
          ...j,
          signals: W
        });
      });
      let k = t;
      if (e._effect)
        try {
          k = new Function(
            "state",
            `return (${e._effect})(state)`
          )(t);
        } catch (T) {
          console.error("Error evaluating effect function:", T);
        }
      k !== null && typeof k == "object" && (k = JSON.stringify(k));
      const _ = document.createTextNode(String(k ?? ""));
      n.replaceWith(_), i.current = !0;
    }, 0);
    return () => {
      clearTimeout(y), c.current && u.forEach(({ stateKey: $, path: b }) => {
        const O = A.getState().getShadowMetadata($, b) || {};
        if (O.signals) {
          const C = O.signals.filter(
            (P) => P.instanceId !== c.current
          );
          A.getState().setShadowMetadata($, b, {
            ...O,
            signals: C
          });
        }
      });
    };
  }, []), ge("span", {
    ref: o,
    style: { display: "contents" },
    "data-signal-id": d
  });
}
export {
  le as $cogsSignal,
  Et as createCogsState,
  ct as useCogsStateFn
};
//# sourceMappingURL=CogsState.js.map
