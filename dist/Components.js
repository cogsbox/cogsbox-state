import { jsx as E, Fragment as q } from "react/jsx-runtime";
import { pluginStore as C } from "./pluginStore.js";
import { createScopedMetadataContext as J, toDeconstructedMethods as et } from "./plugins.js";
import j, { memo as Q, useState as R, useRef as P, useCallback as L, useEffect as W, useLayoutEffect as nt, useMemo as ot } from "react";
import { getGlobalStore as b } from "./store.js";
import { useInView as rt } from "react-intersection-observer";
import { v4 as X } from "uuid";
import { isDeepEqual as it } from "./utility.js";
import { runValidation as G } from "./validation.js";
const {
  getInitialOptions: at,
  getShadowMetadata: st,
  setShadowMetadata: Tt,
  getShadowValue: B,
  registerComponent: ct,
  unregisterComponent: ut,
  notifyPathSubscribers: wt,
  subscribeToPath: lt
} = b.getState(), { stateHandlers: At, notifyFormUpdate: $ } = C.getState();
function dt({
  formOpts: e,
  path: t,
  stateKey: o,
  children: u
}) {
  const { getInitialOptions: l, getShadowMetadata: p, getShadowValue: r } = b.getState(), c = l(o), h = p(o, t)?.validation, A = h?.status || "NOT_VALIDATED", m = (h?.errors || []).map((v) => ({
    ...v,
    path: t
  })), d = m.filter((v) => v.severity === "error").map((v) => v.message), a = m.filter((v) => v.severity === "warning").map((v) => v.message), T = d[0] || a[0], S = d.length > 0 ? "error" : a.length > 0 ? "warning" : void 0, s = C.getState().getRegisteredPluginsForState(o), y = {};
  return s.forEach((v) => {
    if (c && c.hasOwnProperty(v.name)) {
      const N = v.name, O = C.getState().getHookResult(o, N), k = J(
        o,
        N,
        t
      );
      y[N] = {
        hookData: O,
        getFieldMetaData: k.getFieldMetaData,
        setFieldMetaData: k.setFieldMetaData,
        removeFieldMetaData: k.removeFieldMetaData
      };
    }
  }), /* @__PURE__ */ E(q, { children: c?.formElements?.validation && !e?.validation?.disable ? c.formElements.validation({
    children: /* @__PURE__ */ E(j.Fragment, { children: u }, t.toString()),
    status: A,
    // Now passes the new ValidationStatus type
    message: e?.validation?.hideMessage ? "" : e?.validation?.message || T || "",
    severity: S,
    hasErrors: d.length > 0,
    hasWarnings: a.length > 0,
    allErrors: m,
    path: t,
    getData: () => r(o, t),
    plugins: y
  }) : /* @__PURE__ */ E(j.Fragment, { children: u }, t.toString()) });
}
const Dt = Q(
  gt,
  (e, t) => e.itemPath.join(".") === t.itemPath.join(".") && e.stateKey === t.stateKey && e.itemComponentId === t.itemComponentId && e.localIndex === t.localIndex
);
function gt({
  stateKey: e,
  itemComponentId: t,
  itemPath: o,
  localIndex: u,
  arraySetter: l,
  rebuildStateShape: p,
  renderFn: r
}) {
  const [, c] = R({}), { ref: f, inView: h } = rt(), A = P(null), m = [e, ...o].join(".");
  z(e, t, c);
  const d = L(
    (s) => {
      A.current = s, f(s);
    },
    [f]
  );
  W(() => {
    const s = lt(m, (y) => {
      c({});
    });
    return () => s();
  }, [m]);
  const a = B(e, o);
  if (a === void 0) return null;
  const T = p({
    currentState: a,
    path: o,
    componentId: t
  }), S = r(T, u, l);
  return j.isValidElement(S) ? j.cloneElement(S, {
    ref: (s) => {
      d(s);
      const { ref: y } = S;
      typeof y == "function" ? y(s) : y && "current" in y && (y.current = s);
    }
  }) : /* @__PURE__ */ E("div", { ref: d, children: S });
}
function It({
  stateKey: e,
  path: t,
  rebuildStateShape: o,
  renderFn: u,
  formOpts: l,
  setState: p
}) {
  const r = P(X()).current, [, c] = R({}), f = P(null), h = [e, ...t].join(".");
  z(e, r, c);
  const m = b.getState().getShadowNode(e, t)?._meta?.typeInfo, d = B(e, t), [a, T] = R(d), S = P(!1), s = P(null);
  W(() => {
    !S.current && !it(d, a) && T(d);
  }, [d]), W(() => {
    const { getShadowMetadata: n, setShadowMetadata: i } = b.getState(), g = n(e, t) || {};
    g.clientActivityState || (g.clientActivityState = { elements: /* @__PURE__ */ new Map() });
    const w = () => {
      const M = f.current;
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
    g.clientActivityState.elements.set(r, {
      domRef: f,
      elementType: w(),
      inputType: f.current?.type,
      mountedAt: Date.now()
    }), i(e, t, g);
    const D = b.getState().subscribeToPath(h, (M) => {
      !S.current && a !== M && c({});
    });
    return () => {
      D(), s.current && (clearTimeout(s.current), S.current = !1);
      const M = b.getState().getShadowMetadata(e, t);
      M?.clientActivityState?.elements && (M.clientActivityState.elements.delete(r), i(e, t, M));
    };
  }, [e, h, r]);
  const y = L(
    (n) => {
      const i = b.getState().getShadowNode(e, t)?._meta?.typeInfo ?? m;
      i ? i.type === "number" && typeof n == "string" ? n = n === "" ? i.nullable ? null : i.default ?? 0 : Number(n) : i.type === "boolean" && typeof n == "string" ? n = n === "true" || n === "1" : i.type === "date" && typeof n == "string" && (n = new Date(n)) : typeof d === "number" && typeof n == "string" && (n = n === "" ? 0 : Number(n)), T(n);
      const { getShadowMetadata: g, setShadowMetadata: w } = b.getState(), D = g(e, t);
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
      $({
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
      }, "onChange"), S.current = !0, s.current && clearTimeout(s.current);
      const F = l?.debounceTime ?? 200;
      s.current = setTimeout(() => {
        S.current = !1, p(n, t, {
          updateType: "update",
          validationTrigger: "onChange"
        });
      }, F);
    },
    [
      p,
      t,
      l?.debounceTime,
      m,
      d,
      e,
      r
    ]
  ), v = L(() => {
    const { getShadowMetadata: n, setShadowMetadata: i } = b.getState(), g = n(e, t);
    if (g?.clientActivityState?.elements?.has(r)) {
      const w = g.clientActivityState.elements.get(r);
      w.currentActivity = {
        type: "focus",
        startTime: Date.now(),
        details: {
          value: a,
          inputLength: typeof a == "string" ? a.length : void 0
        }
      }, i(e, t, g);
    }
    $({
      stateKey: e,
      activityType: "focus",
      // Changed from 'type'
      path: t,
      timestamp: Date.now(),
      details: {
        cursorPosition: f.current?.selectionStart
      }
    });
  }, [e, t, r, a]), N = L(() => {
    const { getShadowMetadata: n, setShadowMetadata: i } = b.getState();
    s.current && (clearTimeout(s.current), s.current = null, S.current = !1, p(a, t, { updateType: "update" }));
    const g = n(e, t);
    if (g?.clientActivityState?.elements?.has(r)) {
      const M = g.clientActivityState.elements.get(r);
      M.currentActivity = void 0, i(e, t, g);
    }
    const w = g?.clientActivityState?.elements?.get(r)?.currentActivity?.startTime;
    at(e)?.validation?.onBlur && G(
      {
        stateKey: e,
        path: t,
        newValue: a,
        updateType: "update"
      },
      "onBlur"
    ), $({
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
        onChange: (g) => {
          y(g.target.value);
        },
        onFocus: v,
        onBlur: N,
        ref: f
      } : i === "status" ? Y : i === "severity" ? V : i === "hasErrors" ? _.length > 0 : i === "hasWarnings" ? H.length > 0 : i === "allErrors" ? U : i === "message" ? Z : i === "getData" ? () => B(e, t) : n[i];
    }
  }), tt = u(K);
  return /* @__PURE__ */ E(dt, { formOpts: l, path: t, stateKey: e, children: tt });
}
function z(e, t, o, u = "component") {
  const l = `${e}////${t}`;
  nt(() => (ct(e, l, {
    forceUpdate: () => o({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: u
  }), () => {
    ut(e, l);
  }), [e, l, u]);
}
function Ct({
  stateKey: e,
  path: t,
  // The path of the parent node (e.g. ['form'])
  dependencies: o,
  // NEW: Optional array of Proxy objects or path arrays
  rebuildStateShape: u,
  renderFn: l
}) {
  const [p] = R(() => X()), [, r] = R({});
  z(
    e,
    p,
    r,
    o?.length ? "none" : "component"
  );
  const c = ot(() => o && o.length > 0 ? o.map((h) => [h.$_stateKey, ...h.$_path].join(".")) : [[e, ...t].join(".")], [e, t, o]);
  W(() => {
    const h = b.getState(), A = c.map((m) => h.subscribeToPath(m, () => {
      r({});
    }));
    return () => {
      A.forEach((m) => m());
    };
  }, [c]);
  const f = u({
    path: t,
    componentId: p,
    meta: void 0
  });
  return /* @__PURE__ */ E(q, { children: l(f) });
}
Q(function({
  children: t,
  stateKey: o,
  path: u,
  pluginName: l,
  wrapperDepth: p
}) {
  const [, r] = R({});
  W(() => {
    const T = [o, ...u].join(".");
    return b.getState().subscribeToPath(T, () => {
      r({});
    });
  }, [o, u]);
  const c = C.getState().getRegisteredPluginsForState(o).find((T) => T.name === l), f = C.getState().stateHandlers.get(o), h = b.getState().getShadowNode(o, u)?._meta?.typeInfo, A = C.getState().pluginOptions.get(o)?.get(l), m = C.getState().getHookResult(o, l);
  if (!c?.formWrapper || !f)
    return /* @__PURE__ */ E(q, { children: t });
  const d = et(f), a = J(
    o,
    c.name,
    u
  );
  return c.formWrapper({
    element: t,
    path: u,
    stateKey: o,
    pluginName: c.name,
    ...d,
    ...a,
    options: A,
    hookData: m,
    fieldType: h?.type,
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
