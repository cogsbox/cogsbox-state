import { jsx as I, Fragment as U } from "react/jsx-runtime";
import { pluginStore as C } from "./pluginStore.js";
import { createScopedMetadataContext as _, toDeconstructedMethods as J } from "./plugins.js";
import O, { memo as $, useState as E, useRef as P, useCallback as N, useEffect as W, useLayoutEffect as Q, useMemo as X } from "react";
import { getGlobalStore as y } from "./store.js";
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
} = y.getState(), { stateHandlers: St, notifyFormUpdate: L } = C.getState();
function nt({
  formOpts: e,
  path: t,
  stateKey: o,
  children: c
}) {
  const { getInitialOptions: p, getShadowMetadata: S, getShadowValue: i } = y.getState(), u = p(o), M = S(o, t)?.validation, D = M?.status || "NOT_VALIDATED", r = (M?.errors || []).map((f) => ({
    ...f,
    path: t
  })), l = r.filter((f) => f.severity === "error").map((f) => f.message), a = r.filter((f) => f.severity === "warning").map((f) => f.message), A = l[0] || a[0], g = l.length > 0 ? "error" : a.length > 0 ? "warning" : void 0, { registeredPlugins: s } = C.getState(), T = {};
  return s.forEach((f) => {
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
    children: /* @__PURE__ */ I(O.Fragment, { children: c }, t.toString()),
    status: D,
    // Now passes the new ValidationStatus type
    message: e?.validation?.hideMessage ? "" : e?.validation?.message || A || "",
    severity: g,
    hasErrors: l.length > 0,
    hasWarnings: a.length > 0,
    allErrors: r,
    path: t,
    getData: () => i(o, t),
    plugins: T
  }) : /* @__PURE__ */ I(O.Fragment, { children: c }, t.toString()) });
}
const vt = $(
  ot,
  (e, t) => e.itemPath.join(".") === t.itemPath.join(".") && e.stateKey === t.stateKey && e.itemComponentId === t.itemComponentId && e.localIndex === t.localIndex
);
function ot({
  stateKey: e,
  itemComponentId: t,
  itemPath: o,
  localIndex: c,
  arraySetter: p,
  rebuildStateShape: S,
  renderFn: i
}) {
  const [, u] = E({}), { ref: m, inView: M } = Y(), D = P(null), r = [e, ...o].join(".");
  B(e, t, u);
  const l = N(
    (s) => {
      D.current = s, m(s);
    },
    [m]
  );
  W(() => {
    const s = et(r, (T) => {
      u({});
    });
    return () => s();
  }, [r]);
  const a = z(e, o);
  if (a === void 0) return null;
  const A = S({
    currentState: a,
    path: o,
    componentId: t
  }), g = i(A, c, p);
  return O.isValidElement(g) ? O.cloneElement(g, {
    ref: (s) => {
      l(s);
      const { ref: T } = g;
      typeof T == "function" ? T(s) : T && "current" in T && (T.current = s);
    }
  }) : /* @__PURE__ */ I("div", { ref: l, children: g });
}
function bt({
  stateKey: e,
  path: t,
  rebuildStateShape: o,
  renderFn: c,
  formOpts: p,
  setState: S
}) {
  const i = P(q()).current, [, u] = E({}), m = P(null), M = [e, ...t].join(".");
  B(e, i, u);
  const r = y.getState().getShadowNode(e, t)?._meta?.typeInfo, l = z(e, t), [a, A] = E(l), g = P(!1), s = P(null);
  W(() => {
    !g.current && !Z(l, a) && A(l);
  }, [l]), W(() => {
    const { getShadowMetadata: n, setShadowMetadata: w } = y.getState(), d = n(e, t) || {};
    d.clientActivityState || (d.clientActivityState = { elements: /* @__PURE__ */ new Map() });
    const v = () => {
      const b = m.current;
      if (!b) return "input";
      const R = b.tagName.toLowerCase();
      if (R === "textarea") return "textarea";
      if (R === "select") return "select";
      if (R === "input") {
        const h = b.type;
        if (h === "checkbox") return "checkbox";
        if (h === "radio") return "radio";
        if (h === "range") return "range";
        if (h === "file") return "file";
      }
      return "input";
    };
    d.clientActivityState.elements.set(i, {
      domRef: m,
      elementType: v(),
      inputType: m.current?.type,
      mountedAt: Date.now()
    }), w(e, t, d);
    const x = y.getState().subscribeToPath(M, (b) => {
      !g.current && a !== b && u({});
    });
    return () => {
      x(), s.current && (clearTimeout(s.current), g.current = !1);
      const b = y.getState().getShadowMetadata(e, t);
      b?.clientActivityState?.elements && (b.clientActivityState.elements.delete(i), w(e, t, b));
    };
  }, []);
  const T = N(
    (n) => {
      r ? r.type === "number" && typeof n == "string" ? n = n === "" ? r.nullable ? null : r.default ?? 0 : Number(n) : r.type === "boolean" && typeof n == "string" ? n = n === "true" || n === "1" : r.type === "date" && typeof n == "string" && (n = new Date(n)) : typeof l === "number" && typeof n == "string" && (n = n === "" ? 0 : Number(n)), A(n);
      const { getShadowMetadata: w, setShadowMetadata: d } = y.getState(), v = w(e, t);
      if (v?.clientActivityState?.elements?.has(i)) {
        const h = v.clientActivityState.elements.get(i);
        h && h.currentActivity?.type === "focus" && (h.currentActivity.details = {
          ...h.currentActivity.details,
          value: n,
          previousValue: h.currentActivity.details?.value || l,
          inputLength: typeof n == "string" ? n.length : void 0,
          keystrokeCount: (h.currentActivity.details?.keystrokeCount || 0) + 1
        }, d(e, t, v));
      }
      const x = v?.clientActivityState?.elements?.get(i);
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
      }, "onChange"), g.current = !0, s.current && clearTimeout(s.current);
      const R = p?.debounceTime ?? 200;
      s.current = setTimeout(() => {
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
      r,
      l,
      e,
      i
    ]
  ), f = N(() => {
    const { getShadowMetadata: n, setShadowMetadata: w } = y.getState(), d = n(e, t);
    if (d?.clientActivityState?.elements?.has(i)) {
      const v = d.clientActivityState.elements.get(i);
      v.currentActivity = {
        type: "focus",
        startTime: Date.now(),
        details: {
          value: a,
          inputLength: typeof a == "string" ? a.length : void 0
        }
      }, w(e, t, d);
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
  }, [e, t, i, a]), k = N(() => {
    const { getShadowMetadata: n, setShadowMetadata: w } = y.getState();
    s.current && (clearTimeout(s.current), s.current = null, g.current = !1, S(a, t, {
      updateType: "update",
      validationTrigger: "onBlur"
    }));
    const d = n(e, t);
    if (d?.clientActivityState?.elements?.has(i)) {
      const b = d.clientActivityState.elements.get(i);
      b.currentActivity = void 0, w(e, t, d);
    }
    const v = d?.clientActivityState?.elements?.get(i)?.currentActivity?.startTime;
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
  }, [a, S, t, e, i, l]), j = o({
    path: t,
    componentId: i,
    meta: void 0
  }), F = new Proxy(j, {
    get(n, w) {
      return w === "$inputProps" ? {
        value: a ?? "",
        onChange: (d) => {
          T(d.target.value);
        },
        onFocus: f,
        onBlur: k,
        ref: m
      } : n[w];
    }
  }), G = c(F);
  return /* @__PURE__ */ I(nt, { formOpts: p, path: t, stateKey: e, children: G });
}
function B(e, t, o) {
  const c = `${e}////${t}`;
  Q(() => (K(e, c, {
    forceUpdate: () => o({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    tt(e, c);
  }), [e, c]);
}
function ht({
  stateKey: e,
  path: t,
  // The path of the parent node (e.g. ['form'])
  dependencies: o,
  // NEW: Optional array of Proxy objects or path arrays
  rebuildStateShape: c,
  renderFn: p
}) {
  const [S] = E(() => q()), [, i] = E({});
  B(e, S, i);
  const u = X(() => o && o.length > 0 ? o.map((M) => [e, ...M.$_path].join(".")) : [[e, ...t].join(".")], [e, t, o]);
  W(() => {
    const M = y.getState(), D = u.map((r) => M.subscribeToPath(r, () => {
      i({});
    }));
    return () => {
      D.forEach((r) => r());
    };
  }, [u]);
  const m = c({
    path: t,
    componentId: S,
    meta: void 0
  });
  return /* @__PURE__ */ I(U, { children: p(m) });
}
$(function({
  children: t,
  stateKey: o,
  path: c,
  pluginName: p,
  wrapperDepth: S
}) {
  const [, i] = E({});
  W(() => {
    const A = [o, ...c].join(".");
    return y.getState().subscribeToPath(A, () => {
      i({});
    });
  }, [o, c]);
  const u = C.getState().registeredPlugins.find((A) => A.name === p), m = C.getState().stateHandlers.get(o), M = y.getState().getShadowNode(o, c)?._meta?.typeInfo, D = C.getState().pluginOptions.get(o)?.get(p), r = C.getState().getHookResult(o, p);
  if (!u?.formWrapper || !m)
    return /* @__PURE__ */ I(U, { children: t });
  const l = J(m), a = _(
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
    options: D,
    hookData: r,
    fieldType: M?.type,
    wrapperDepth: S
  });
});
export {
  bt as FormElementWrapper,
  ht as IsolatedComponentWrapper,
  ot as ListItemWrapper,
  vt as MemoizedCogsItemWrapper,
  nt as ValidationWrapper,
  B as useRegisterComponent
};
//# sourceMappingURL=Components.js.map
