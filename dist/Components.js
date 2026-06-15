import { jsx as E, Fragment as q } from "react/jsx-runtime";
import { pluginStore as C } from "./pluginStore.js";
import { createScopedMetadataContext as J, toDeconstructedMethods as et } from "./plugins.js";
import j, { memo as Q, useState as R, useRef as W, useCallback as L, useEffect as P, useLayoutEffect as nt, useMemo as ot } from "react";
import { getGlobalStore as y } from "./store.js";
import { useInView as rt } from "react-intersection-observer";
import { v4 as X } from "uuid";
import { isDeepEqual as it } from "./utility.js";
import { runValidation as G } from "./validation.js";
const {
  getInitialOptions: at,
  getShadowMetadata: st,
  setShadowMetadata: Tt,
  getShadowValue: $,
  registerComponent: ct,
  unregisterComponent: ut,
  notifyPathSubscribers: wt,
  subscribeToPath: lt
} = y.getState(), { stateHandlers: At, notifyFormUpdate: B } = C.getState();
function dt({
  formOpts: e,
  path: t,
  stateKey: o,
  children: c
}) {
  const { getInitialOptions: v, getShadowMetadata: p, getShadowValue: r } = y.getState(), u = v(o), M = p(o, t)?.validation, A = M?.status || "NOT_VALIDATED", g = (M?.errors || []).map((S) => ({
    ...S,
    path: t
  })), l = g.filter((S) => S.severity === "error").map((S) => S.message), a = g.filter((S) => S.severity === "warning").map((S) => S.message), T = l[0] || a[0], f = l.length > 0 ? "error" : a.length > 0 ? "warning" : void 0, { registeredPlugins: s } = C.getState(), b = {};
  return s.forEach((S) => {
    if (u && u.hasOwnProperty(S.name)) {
      const N = S.name, O = C.getState().getHookResult(o, N), k = J(
        o,
        N,
        t
      );
      b[N] = {
        hookData: O,
        getFieldMetaData: k.getFieldMetaData,
        setFieldMetaData: k.setFieldMetaData,
        removeFieldMetaData: k.removeFieldMetaData
      };
    }
  }), /* @__PURE__ */ E(q, { children: u?.formElements?.validation && !e?.validation?.disable ? u.formElements.validation({
    children: /* @__PURE__ */ E(j.Fragment, { children: c }, t.toString()),
    status: A,
    // Now passes the new ValidationStatus type
    message: e?.validation?.hideMessage ? "" : e?.validation?.message || T || "",
    severity: f,
    hasErrors: l.length > 0,
    hasWarnings: a.length > 0,
    allErrors: g,
    path: t,
    getData: () => r(o, t),
    plugins: b
  }) : /* @__PURE__ */ E(j.Fragment, { children: c }, t.toString()) });
}
const Dt = Q(
  gt,
  (e, t) => e.itemPath.join(".") === t.itemPath.join(".") && e.stateKey === t.stateKey && e.itemComponentId === t.itemComponentId && e.localIndex === t.localIndex
);
function gt({
  stateKey: e,
  itemComponentId: t,
  itemPath: o,
  localIndex: c,
  arraySetter: v,
  rebuildStateShape: p,
  renderFn: r
}) {
  const [, u] = R({}), { ref: m, inView: M } = rt(), A = W(null), g = [e, ...o].join(".");
  z(e, t, u);
  const l = L(
    (s) => {
      A.current = s, m(s);
    },
    [m]
  );
  P(() => {
    const s = lt(g, (b) => {
      u({});
    });
    return () => s();
  }, [g]);
  const a = $(e, o);
  if (a === void 0) return null;
  const T = p({
    currentState: a,
    path: o,
    componentId: t
  }), f = r(T, c, v);
  return j.isValidElement(f) ? j.cloneElement(f, {
    ref: (s) => {
      l(s);
      const { ref: b } = f;
      typeof b == "function" ? b(s) : b && "current" in b && (b.current = s);
    }
  }) : /* @__PURE__ */ E("div", { ref: l, children: f });
}
function It({
  stateKey: e,
  path: t,
  rebuildStateShape: o,
  renderFn: c,
  formOpts: v,
  setState: p
}) {
  const r = W(X()).current, [, u] = R({}), m = W(null), M = [e, ...t].join(".");
  z(e, r, u);
  const g = y.getState().getShadowNode(e, t)?._meta?.typeInfo, l = $(e, t), [a, T] = R(l), f = W(!1), s = W(null);
  P(() => {
    !f.current && !it(l, a) && T(l);
  }, [l]), P(() => {
    const { getShadowMetadata: n, setShadowMetadata: i } = y.getState(), d = n(e, t) || {};
    d.clientActivityState || (d.clientActivityState = { elements: /* @__PURE__ */ new Map() });
    const w = () => {
      const h = m.current;
      if (!h) return "input";
      const x = h.tagName.toLowerCase();
      if (x === "textarea") return "textarea";
      if (x === "select") return "select";
      if (x === "input") {
        const F = h.type;
        if (F === "checkbox") return "checkbox";
        if (F === "radio") return "radio";
        if (F === "range") return "range";
        if (F === "file") return "file";
      }
      return "input";
    };
    d.clientActivityState.elements.set(r, {
      domRef: m,
      elementType: w(),
      inputType: m.current?.type,
      mountedAt: Date.now()
    }), i(e, t, d);
    const D = y.getState().subscribeToPath(M, (h) => {
      !f.current && a !== h && u({});
    });
    return () => {
      D(), s.current && (clearTimeout(s.current), f.current = !1);
      const h = y.getState().getShadowMetadata(e, t);
      h?.clientActivityState?.elements && (h.clientActivityState.elements.delete(r), i(e, t, h));
    };
  }, []);
  const b = L(
    (n) => {
      const i = y.getState().getShadowNode(e, t)?._meta?.typeInfo ?? g;
      i ? i.type === "number" && typeof n == "string" ? n = n === "" ? i.nullable ? null : i.default ?? 0 : Number(n) : i.type === "boolean" && typeof n == "string" ? n = n === "true" || n === "1" : i.type === "date" && typeof n == "string" && (n = new Date(n)) : typeof l === "number" && typeof n == "string" && (n = n === "" ? 0 : Number(n)), T(n);
      const { getShadowMetadata: d, setShadowMetadata: w } = y.getState(), D = d(e, t);
      if (D?.clientActivityState?.elements?.has(r)) {
        const I = D.clientActivityState.elements.get(r);
        I && I.currentActivity?.type === "focus" && (I.currentActivity.details = {
          ...I.currentActivity.details,
          value: n,
          previousValue: I.currentActivity.details?.value || l,
          inputLength: typeof n == "string" ? n.length : void 0,
          keystrokeCount: (I.currentActivity.details?.keystrokeCount || 0) + 1
        }, w(e, t, D));
      }
      const h = D?.clientActivityState?.elements?.get(r);
      B({
        stateKey: e,
        activityType: "input",
        // Changed from 'type'
        path: t,
        timestamp: Date.now(),
        details: {
          value: n,
          inputLength: typeof n == "string" ? n.length : void 0,
          isComposing: !1,
          // You'd need to track this from the actual input event
          isPasting: !1,
          // You'd need to track this from paste events
          keystrokeCount: (h?.currentActivity?.details?.keystrokeCount || 0) + 1
        }
      }), G({
        stateKey: e,
        path: t,
        newValue: n,
        updateType: "update"
      }, "onChange"), f.current = !0, s.current && clearTimeout(s.current);
      const F = v?.debounceTime ?? 200;
      s.current = setTimeout(() => {
        f.current = !1, p(n, t, {
          updateType: "update",
          validationTrigger: "onChange"
        });
      }, F);
    },
    [
      p,
      t,
      v?.debounceTime,
      g,
      l,
      e,
      r
    ]
  ), S = L(() => {
    const { getShadowMetadata: n, setShadowMetadata: i } = y.getState(), d = n(e, t);
    if (d?.clientActivityState?.elements?.has(r)) {
      const w = d.clientActivityState.elements.get(r);
      w.currentActivity = {
        type: "focus",
        startTime: Date.now(),
        details: {
          value: a,
          inputLength: typeof a == "string" ? a.length : void 0
        }
      }, i(e, t, d);
    }
    B({
      stateKey: e,
      activityType: "focus",
      // Changed from 'type'
      path: t,
      timestamp: Date.now(),
      details: {
        cursorPosition: m.current?.selectionStart
      }
    });
  }, [e, t, r, a]), N = L(() => {
    const { getShadowMetadata: n, setShadowMetadata: i } = y.getState();
    s.current && (clearTimeout(s.current), s.current = null, f.current = !1, p(a, t, { updateType: "update" }));
    const d = n(e, t);
    if (d?.clientActivityState?.elements?.has(r)) {
      const h = d.clientActivityState.elements.get(r);
      h.currentActivity = void 0, i(e, t, d);
    }
    const w = d?.clientActivityState?.elements?.get(r)?.currentActivity?.startTime;
    at(e)?.validation?.onBlur && G(
      {
        stateKey: e,
        path: t,
        newValue: a,
        updateType: "update"
      },
      "onBlur"
    ), B({
      stateKey: e,
      activityType: "blur",
      path: t,
      timestamp: Date.now(),
      duration: w ? Date.now() - w : void 0,
      details: {
        duration: w ? Date.now() - w : 0
      }
    });
  }, [a, p, t, e, r, l]), O = o({
    path: t,
    componentId: r,
    meta: void 0
  }), k = st(e, t)?.validation, Y = k?.status || "NOT_VALIDATED", U = (k?.errors || []).map((n) => ({
    ...n,
    path: t
  })), _ = U.filter((n) => n.severity === "error").map((n) => n.message), H = U.filter((n) => n.severity === "warning").map((n) => n.message), Z = _[0] || H[0] || "", V = _.length > 0 ? "error" : H.length > 0 ? "warning" : void 0, K = new Proxy(O, {
    get(n, i) {
      return i === "$inputProps" ? {
        value: a ?? "",
        onChange: (d) => {
          b(d.target.value);
        },
        onFocus: S,
        onBlur: N,
        ref: m
      } : i === "status" ? Y : i === "severity" ? V : i === "hasErrors" ? _.length > 0 : i === "hasWarnings" ? H.length > 0 : i === "allErrors" ? U : i === "message" ? Z : i === "getData" ? () => $(e, t) : n[i];
    }
  }), tt = c(K);
  return /* @__PURE__ */ E(dt, { formOpts: v, path: t, stateKey: e, children: tt });
}
function z(e, t, o) {
  const c = `${e}////${t}`;
  nt(() => (ct(e, c, {
    forceUpdate: () => o({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    ut(e, c);
  }), [e, c]);
}
function Ct({
  stateKey: e,
  path: t,
  // The path of the parent node (e.g. ['form'])
  dependencies: o,
  // NEW: Optional array of Proxy objects or path arrays
  rebuildStateShape: c,
  renderFn: v
}) {
  const [p] = R(() => X()), [, r] = R({});
  z(e, p, r);
  const u = ot(() => o && o.length > 0 ? o.map((M) => [e, ...M.$_path].join(".")) : [[e, ...t].join(".")], [e, t, o]);
  P(() => {
    const M = y.getState(), A = u.map((g) => M.subscribeToPath(g, () => {
      r({});
    }));
    return () => {
      A.forEach((g) => g());
    };
  }, [u]);
  const m = c({
    path: t,
    componentId: p,
    meta: void 0
  });
  return /* @__PURE__ */ E(q, { children: v(m) });
}
Q(function({
  children: t,
  stateKey: o,
  path: c,
  pluginName: v,
  wrapperDepth: p
}) {
  const [, r] = R({});
  P(() => {
    const T = [o, ...c].join(".");
    return y.getState().subscribeToPath(T, () => {
      r({});
    });
  }, [o, c]);
  const u = C.getState().registeredPlugins.find((T) => T.name === v), m = C.getState().stateHandlers.get(o), M = y.getState().getShadowNode(o, c)?._meta?.typeInfo, A = C.getState().pluginOptions.get(o)?.get(v), g = C.getState().getHookResult(o, v);
  if (!u?.formWrapper || !m)
    return /* @__PURE__ */ E(q, { children: t });
  const l = et(m), a = J(
    o,
    u.name,
    c
  );
  return u.formWrapper({
    element: t,
    path: c,
    stateKey: o,
    pluginName: u.name,
    ...l,
    ...a,
    options: A,
    hookData: g,
    fieldType: M?.type,
    wrapperDepth: p
  });
});
export {
  It as FormElementWrapper,
  Ct as IsolatedComponentWrapper,
  gt as ListItemWrapper,
  Dt as MemoizedCogsItemWrapper,
  dt as ValidationWrapper,
  z as useRegisterComponent
};
//# sourceMappingURL=Components.js.map
