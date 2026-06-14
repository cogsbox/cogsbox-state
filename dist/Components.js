import { jsx as C, Fragment as q } from "react/jsx-runtime";
import { pluginStore as E } from "./pluginStore.js";
import { createScopedMetadataContext as J, toDeconstructedMethods as et } from "./plugins.js";
import j, { memo as Q, useState as R, useRef as N, useCallback as L, useEffect as P, useLayoutEffect as nt, useMemo as ot } from "react";
import { getGlobalStore as b } from "./store.js";
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
  unregisterComponent: lt,
  notifyPathSubscribers: wt,
  subscribeToPath: ut
} = b.getState(), { stateHandlers: At, notifyFormUpdate: B } = E.getState();
function dt({
  formOpts: e,
  path: t,
  stateKey: o,
  children: c
}) {
  const { getInitialOptions: v, getShadowMetadata: p, getShadowValue: r } = b.getState(), l = v(o), h = p(o, t)?.validation, A = h?.status || "NOT_VALIDATED", g = (h?.errors || []).map((S) => ({
    ...S,
    path: t
  })), d = g.filter((S) => S.severity === "error").map((S) => S.message), a = g.filter((S) => S.severity === "warning").map((S) => S.message), T = d[0] || a[0], f = d.length > 0 ? "error" : a.length > 0 ? "warning" : void 0, { registeredPlugins: s } = E.getState(), y = {};
  return s.forEach((S) => {
    if (l && l.hasOwnProperty(S.name)) {
      const W = S.name, O = E.getState().getHookResult(o, W), k = J(
        o,
        W,
        t
      );
      y[W] = {
        hookData: O,
        getFieldMetaData: k.getFieldMetaData,
        setFieldMetaData: k.setFieldMetaData,
        removeFieldMetaData: k.removeFieldMetaData
      };
    }
  }), /* @__PURE__ */ C(q, { children: l?.formElements?.validation && !e?.validation?.disable ? l.formElements.validation({
    children: /* @__PURE__ */ C(j.Fragment, { children: c }, t.toString()),
    status: A,
    // Now passes the new ValidationStatus type
    message: e?.validation?.hideMessage ? "" : e?.validation?.message || T || "",
    severity: f,
    hasErrors: d.length > 0,
    hasWarnings: a.length > 0,
    allErrors: g,
    path: t,
    getData: () => r(o, t),
    plugins: y
  }) : /* @__PURE__ */ C(j.Fragment, { children: c }, t.toString()) });
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
  const [, l] = R({}), { ref: m, inView: h } = rt(), A = N(null), g = [e, ...o].join(".");
  z(e, t, l);
  const d = L(
    (s) => {
      A.current = s, m(s);
    },
    [m]
  );
  P(() => {
    const s = ut(g, (y) => {
      l({});
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
      d(s);
      const { ref: y } = f;
      typeof y == "function" ? y(s) : y && "current" in y && (y.current = s);
    }
  }) : /* @__PURE__ */ C("div", { ref: d, children: f });
}
function It({
  stateKey: e,
  path: t,
  rebuildStateShape: o,
  renderFn: c,
  formOpts: v,
  setState: p
}) {
  const r = N(X()).current, [, l] = R({}), m = N(null), h = [e, ...t].join(".");
  z(e, r, l);
  const g = b.getState().getShadowNode(e, t)?._meta?.typeInfo, d = $(e, t), [a, T] = R(d), f = N(!1), s = N(null);
  P(() => {
    !f.current && !it(d, a) && T(d);
  }, [d]), P(() => {
    const { getShadowMetadata: n, setShadowMetadata: i } = b.getState();
    console.log("FormElementWrapper effect running for:", e, t);
    const u = n(e, t) || {};
    u.clientActivityState || (u.clientActivityState = { elements: /* @__PURE__ */ new Map() });
    const w = () => {
      const M = m.current;
      if (!M) return "input";
      const x = M.tagName.toLowerCase();
      if (x === "textarea") return "textarea";
      if (x === "select") return "select";
      if (x === "input") {
        const F = M.type;
        if (F === "checkbox") return "checkbox";
        if (F === "radio") return "radio";
        if (F === "range") return "range";
        if (F === "file") return "file";
      }
      return "input";
    };
    u.clientActivityState.elements.set(r, {
      domRef: m,
      elementType: w(),
      inputType: m.current?.type,
      mountedAt: Date.now()
    }), console.log("currentMeta", u), i(e, t, u);
    const D = b.getState().subscribeToPath(h, (M) => {
      !f.current && a !== M && l({});
    });
    return () => {
      D(), s.current && (clearTimeout(s.current), f.current = !1);
      const M = b.getState().getShadowMetadata(e, t);
      M?.clientActivityState?.elements && (M.clientActivityState.elements.delete(r), i(e, t, M));
    };
  }, []);
  const y = L(
    (n) => {
      const i = b.getState().getShadowNode(e, t)?._meta?.typeInfo ?? g;
      i ? i.type === "number" && typeof n == "string" ? n = n === "" ? i.nullable ? null : i.default ?? 0 : Number(n) : i.type === "boolean" && typeof n == "string" ? n = n === "true" || n === "1" : i.type === "date" && typeof n == "string" && (n = new Date(n)) : typeof d === "number" && typeof n == "string" && (n = n === "" ? 0 : Number(n)), T(n);
      const { getShadowMetadata: u, setShadowMetadata: w } = b.getState(), D = u(e, t);
      if (D?.clientActivityState?.elements?.has(r)) {
        const I = D.clientActivityState.elements.get(r);
        I && I.currentActivity?.type === "focus" && (I.currentActivity.details = {
          ...I.currentActivity.details,
          value: n,
          previousValue: I.currentActivity.details?.value || d,
          inputLength: typeof n == "string" ? n.length : void 0,
          keystrokeCount: (I.currentActivity.details?.keystrokeCount || 0) + 1
        }, w(e, t, D));
      }
      const M = D?.clientActivityState?.elements?.get(r);
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
          keystrokeCount: (M?.currentActivity?.details?.keystrokeCount || 0) + 1
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
      d,
      e,
      r
    ]
  ), S = L(() => {
    const { getShadowMetadata: n, setShadowMetadata: i } = b.getState(), u = n(e, t);
    if (u?.clientActivityState?.elements?.has(r)) {
      const w = u.clientActivityState.elements.get(r);
      w.currentActivity = {
        type: "focus",
        startTime: Date.now(),
        details: {
          value: a,
          inputLength: typeof a == "string" ? a.length : void 0
        }
      }, i(e, t, u);
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
  }, [e, t, r, a]), W = L(() => {
    const { getShadowMetadata: n, setShadowMetadata: i } = b.getState();
    s.current && (clearTimeout(s.current), s.current = null, f.current = !1, p(a, t, { updateType: "update" }));
    const u = n(e, t);
    if (u?.clientActivityState?.elements?.has(r)) {
      const M = u.clientActivityState.elements.get(r);
      M.currentActivity = void 0, i(e, t, u);
    }
    const w = u?.clientActivityState?.elements?.get(r)?.currentActivity?.startTime;
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
  }, [a, p, t, e, r, d]), O = o({
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
        onChange: (u) => {
          y(u.target.value);
        },
        onFocus: S,
        onBlur: W,
        ref: m
      } : i === "status" ? Y : i === "severity" ? V : i === "hasErrors" ? _.length > 0 : i === "hasWarnings" ? H.length > 0 : i === "allErrors" ? U : i === "message" ? Z : i === "getData" ? () => $(e, t) : n[i];
    }
  }), tt = c(K);
  return /* @__PURE__ */ C(dt, { formOpts: v, path: t, stateKey: e, children: tt });
}
function z(e, t, o) {
  const c = `${e}////${t}`;
  nt(() => (ct(e, c, {
    forceUpdate: () => o({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    lt(e, c);
  }), [e, c]);
}
function Et({
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
  const l = ot(() => o && o.length > 0 ? o.map((h) => [e, ...h.$_path].join(".")) : [[e, ...t].join(".")], [e, t, o]);
  P(() => {
    const h = b.getState(), A = l.map((g) => h.subscribeToPath(g, () => {
      r({});
    }));
    return () => {
      A.forEach((g) => g());
    };
  }, [l]);
  const m = c({
    path: t,
    componentId: p,
    meta: void 0
  });
  return /* @__PURE__ */ C(q, { children: v(m) });
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
    return b.getState().subscribeToPath(T, () => {
      r({});
    });
  }, [o, c]);
  const l = E.getState().registeredPlugins.find((T) => T.name === v), m = E.getState().stateHandlers.get(o), h = b.getState().getShadowNode(o, c)?._meta?.typeInfo, A = E.getState().pluginOptions.get(o)?.get(v), g = E.getState().getHookResult(o, v);
  if (!l?.formWrapper || !m)
    return /* @__PURE__ */ C(q, { children: t });
  const d = et(m), a = J(
    o,
    l.name,
    c
  );
  return l.formWrapper({
    element: t,
    path: c,
    stateKey: o,
    pluginName: l.name,
    ...d,
    ...a,
    options: A,
    hookData: g,
    fieldType: h?.type,
    wrapperDepth: p
  });
});
export {
  It as FormElementWrapper,
  Et as IsolatedComponentWrapper,
  gt as ListItemWrapper,
  Dt as MemoizedCogsItemWrapper,
  dt as ValidationWrapper,
  z as useRegisterComponent
};
//# sourceMappingURL=Components.js.map
