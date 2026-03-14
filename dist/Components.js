import { jsx as I, Fragment as U } from "react/jsx-runtime";
import { pluginStore as C } from "./pluginStore.js";
import { createScopedMetadataContext as _, toDeconstructedMethods as J } from "./plugins.js";
import O, { memo as $, useState as E, useRef as W, useCallback as N, useEffect as P, useLayoutEffect as Q, useMemo as X } from "react";
import { getGlobalStore as h } from "./store.js";
import { useInView as Y } from "react-intersection-observer";
import { v4 as q } from "uuid";
import { isDeepEqual as Z } from "./utility.js";
import { runValidation as H } from "./validation.js";
const {
  getInitialOptions: V,
  getShadowMetadata: gt,
  setShadowMetadata: ft,
  getShadowValue: z,
  registerComponent: K,
  unregisterComponent: tt,
  notifyPathSubscribers: pt,
  subscribeToPath: et
} = h.getState(), { stateHandlers: St, notifyFormUpdate: L } = C.getState();
function nt({
  formOpts: e,
  path: t,
  stateKey: o,
  children: s
}) {
  const { getInitialOptions: p, getShadowMetadata: S, getShadowValue: r } = h.getState(), u = p(o), y = S(o, t)?.validation, D = y?.status || "NOT_VALIDATED", i = (y?.errors || []).map((f) => ({
    ...f,
    path: t
  })), d = i.filter((f) => f.severity === "error").map((f) => f.message), a = i.filter((f) => f.severity === "warning").map((f) => f.message), A = d[0] || a[0], g = d.length > 0 ? "error" : a.length > 0 ? "warning" : void 0, { registeredPlugins: c } = C.getState(), T = {};
  return c.forEach((f) => {
    if (u && u.hasOwnProperty(f.name)) {
      const k = f.name, j = C.getState().getHookResult(o, k), F = _(
        o,
        k,
        t
      );
      T[k] = {
        hookData: j,
        getFieldMetaData: F.getFieldMetaData,
        setFieldMetaData: F.setFieldMetaData,
        removeFieldMetaData: F.removeFieldMetaData
      };
    }
  }), /* @__PURE__ */ I(U, { children: u?.formElements?.validation && !e?.validation?.disable ? u.formElements.validation({
    children: /* @__PURE__ */ I(O.Fragment, { children: s }, t.toString()),
    status: D,
    // Now passes the new ValidationStatus type
    message: e?.validation?.hideMessage ? "" : e?.validation?.message || A || "",
    severity: g,
    hasErrors: d.length > 0,
    hasWarnings: a.length > 0,
    allErrors: i,
    path: t,
    getData: () => r(o, t),
    plugins: T
  }) : /* @__PURE__ */ I(O.Fragment, { children: s }, t.toString()) });
}
const vt = $(
  ot,
  (e, t) => e.itemPath.join(".") === t.itemPath.join(".") && e.stateKey === t.stateKey && e.itemComponentId === t.itemComponentId && e.localIndex === t.localIndex
);
function ot({
  stateKey: e,
  itemComponentId: t,
  itemPath: o,
  localIndex: s,
  arraySetter: p,
  rebuildStateShape: S,
  renderFn: r
}) {
  const [, u] = E({}), { ref: m, inView: y } = Y(), D = W(null), i = [e, ...o].join(".");
  B(e, t, u);
  const d = N(
    (c) => {
      D.current = c, m(c);
    },
    [m]
  );
  P(() => {
    const c = et(i, (T) => {
      u({});
    });
    return () => c();
  }, [i]);
  const a = z(e, o);
  if (a === void 0) return null;
  const A = S({
    currentState: a,
    path: o,
    componentId: t
  }), g = r(A, s, p);
  return O.isValidElement(g) ? O.cloneElement(g, {
    ref: (c) => {
      d(c);
      const { ref: T } = g;
      typeof T == "function" ? T(c) : T && "current" in T && (T.current = c);
    }
  }) : /* @__PURE__ */ I("div", { ref: d, children: g });
}
function bt({
  stateKey: e,
  path: t,
  rebuildStateShape: o,
  renderFn: s,
  formOpts: p,
  setState: S
}) {
  const r = W(q()).current, [, u] = E({}), m = W(null), y = [e, ...t].join(".");
  B(e, r, u);
  const i = h.getState().getShadowNode(e, t)?._meta?.typeInfo, d = z(e, t), [a, A] = E(d), g = W(!1), c = W(null);
  P(() => {
    !g.current && !Z(d, a) && A(d);
  }, [d]), P(() => {
    const { getShadowMetadata: n, setShadowMetadata: w } = h.getState();
    console.log("FormElementWrapper effect running for:", e, t);
    const l = n(e, t) || {};
    l.clientActivityState || (l.clientActivityState = { elements: /* @__PURE__ */ new Map() });
    const v = () => {
      const b = m.current;
      if (!b) return "input";
      const R = b.tagName.toLowerCase();
      if (R === "textarea") return "textarea";
      if (R === "select") return "select";
      if (R === "input") {
        const M = b.type;
        if (M === "checkbox") return "checkbox";
        if (M === "radio") return "radio";
        if (M === "range") return "range";
        if (M === "file") return "file";
      }
      return "input";
    };
    l.clientActivityState.elements.set(r, {
      domRef: m,
      elementType: v(),
      inputType: m.current?.type,
      mountedAt: Date.now()
    }), console.log("currentMeta", l), w(e, t, l);
    const x = h.getState().subscribeToPath(y, (b) => {
      !g.current && a !== b && u({});
    });
    return () => {
      x(), c.current && (clearTimeout(c.current), g.current = !1);
      const b = h.getState().getShadowMetadata(e, t);
      b?.clientActivityState?.elements && (b.clientActivityState.elements.delete(r), w(e, t, b));
    };
  }, []);
  const T = N(
    (n) => {
      i ? i.type === "number" && typeof n == "string" ? n = n === "" ? i.nullable ? null : i.default ?? 0 : Number(n) : i.type === "boolean" && typeof n == "string" ? n = n === "true" || n === "1" : i.type === "date" && typeof n == "string" && (n = new Date(n)) : typeof d === "number" && typeof n == "string" && (n = n === "" ? 0 : Number(n)), A(n);
      const { getShadowMetadata: w, setShadowMetadata: l } = h.getState(), v = w(e, t);
      if (v?.clientActivityState?.elements?.has(r)) {
        const M = v.clientActivityState.elements.get(r);
        M && M.currentActivity?.type === "focus" && (M.currentActivity.details = {
          ...M.currentActivity.details,
          value: n,
          previousValue: M.currentActivity.details?.value || d,
          inputLength: typeof n == "string" ? n.length : void 0,
          keystrokeCount: (M.currentActivity.details?.keystrokeCount || 0) + 1
        }, l(e, t, v));
      }
      const x = v?.clientActivityState?.elements?.get(r);
      L({
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
          keystrokeCount: (x?.currentActivity?.details?.keystrokeCount || 0) + 1
        }
      }), H({
        stateKey: e,
        path: t,
        newValue: n,
        updateType: "update"
      }, "onChange"), g.current = !0, c.current && clearTimeout(c.current);
      const R = p?.debounceTime ?? 200;
      c.current = setTimeout(() => {
        g.current = !1, S(n, t, {
          updateType: "update",
          validationTrigger: "onChange"
        });
      }, R);
    },
    [
      S,
      t,
      p?.debounceTime,
      i,
      d,
      e,
      r
    ]
  ), f = N(() => {
    const { getShadowMetadata: n, setShadowMetadata: w } = h.getState(), l = n(e, t);
    if (l?.clientActivityState?.elements?.has(r)) {
      const v = l.clientActivityState.elements.get(r);
      v.currentActivity = {
        type: "focus",
        startTime: Date.now(),
        details: {
          value: a,
          inputLength: typeof a == "string" ? a.length : void 0
        }
      }, w(e, t, l);
    }
    L({
      stateKey: e,
      activityType: "focus",
      // Changed from 'type'
      path: t,
      timestamp: Date.now(),
      details: {
        cursorPosition: m.current?.selectionStart
      }
    });
  }, [e, t, r, a]), k = N(() => {
    const { getShadowMetadata: n, setShadowMetadata: w } = h.getState();
    c.current && (clearTimeout(c.current), c.current = null, g.current = !1, S(a, t, {
      updateType: "update",
      validationTrigger: "onBlur"
    }));
    const l = n(e, t);
    if (l?.clientActivityState?.elements?.has(r)) {
      const b = l.clientActivityState.elements.get(r);
      b.currentActivity = void 0, w(e, t, l);
    }
    const v = l?.clientActivityState?.elements?.get(r)?.currentActivity?.startTime;
    L({
      stateKey: e,
      activityType: "blur",
      // Changed from 'type'
      path: t,
      timestamp: Date.now(),
      duration: v ? Date.now() - v : void 0,
      details: {
        duration: v ? Date.now() - v : 0
      }
    }), V(e)?.validation?.onBlur && H({
      stateKey: e,
      path: t,
      newValue: a,
      updateType: "update"
    }, "onBlur");
  }, [a, S, t, e, r, d]), j = o({
    path: t,
    componentId: r,
    meta: void 0
  }), F = new Proxy(j, {
    get(n, w) {
      return w === "$inputProps" ? {
        value: a ?? "",
        onChange: (l) => {
          T(l.target.value);
        },
        onFocus: f,
        onBlur: k,
        ref: m
      } : n[w];
    }
  }), G = s(F);
  return /* @__PURE__ */ I(nt, { formOpts: p, path: t, stateKey: e, children: G });
}
function B(e, t, o) {
  const s = `${e}////${t}`;
  Q(() => (K(e, s, {
    forceUpdate: () => o({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    tt(e, s);
  }), [e, s]);
}
function Mt({
  stateKey: e,
  path: t,
  // The path of the parent node (e.g. ['form'])
  dependencies: o,
  // NEW: Optional array of Proxy objects or path arrays
  rebuildStateShape: s,
  renderFn: p
}) {
  const [S] = E(() => q()), [, r] = E({});
  B(e, S, r);
  const u = X(() => o && o.length > 0 ? o.map((y) => [e, ...y.$_path].join(".")) : [[e, ...t].join(".")], [e, t, o]);
  P(() => {
    const y = h.getState(), D = u.map((i) => y.subscribeToPath(i, () => {
      r({});
    }));
    return () => {
      D.forEach((i) => i());
    };
  }, [u]);
  const m = s({
    path: t,
    componentId: S,
    meta: void 0
  });
  return /* @__PURE__ */ I(U, { children: p(m) });
}
$(function({
  children: t,
  stateKey: o,
  path: s,
  pluginName: p,
  wrapperDepth: S
}) {
  const [, r] = E({});
  P(() => {
    const A = [o, ...s].join(".");
    return h.getState().subscribeToPath(A, () => {
      r({});
    });
  }, [o, s]);
  const u = C.getState().registeredPlugins.find((A) => A.name === p), m = C.getState().stateHandlers.get(o), y = h.getState().getShadowNode(o, s)?._meta?.typeInfo, D = C.getState().pluginOptions.get(o)?.get(p), i = C.getState().getHookResult(o, p);
  if (!u?.formWrapper || !m)
    return /* @__PURE__ */ I(U, { children: t });
  const d = J(m), a = _(
    o,
    u.name,
    s
  );
  return u.formWrapper({
    element: t,
    path: s,
    stateKey: o,
    pluginName: u.name,
    ...d,
    ...a,
    options: D,
    hookData: i,
    fieldType: y?.type,
    wrapperDepth: S
  });
});
export {
  bt as FormElementWrapper,
  Mt as IsolatedComponentWrapper,
  ot as ListItemWrapper,
  vt as MemoizedCogsItemWrapper,
  nt as ValidationWrapper,
  B as useRegisterComponent
};
//# sourceMappingURL=Components.js.map
