import { jsx as D, Fragment as L } from "react/jsx-runtime";
import { pluginStore as C } from "./pluginStore.js";
import { createScopedMetadataContext as _, toDeconstructedMethods as J } from "./plugins.js";
import B, { memo as $, useState as I, useRef as R, useCallback as O, useEffect as P, useLayoutEffect as Q, useMemo as X } from "react";
import { getGlobalStore as h } from "./store.js";
import { useInView as Y } from "react-intersection-observer";
import { v4 as q } from "uuid";
import { isDeepEqual as Z } from "./utility.js";
import { runValidation as H } from "./validation.js";
const {
  getInitialOptions: V,
  getShadowMetadata: mt,
  setShadowMetadata: ft,
  getShadowValue: z,
  registerComponent: K,
  unregisterComponent: tt,
  notifyPathSubscribers: pt,
  subscribeToPath: et
} = h.getState(), { stateHandlers: St, notifyFormUpdate: x } = C.getState();
function nt({
  formOpts: e,
  path: t,
  stateKey: o,
  children: s
}) {
  const { getInitialOptions: f, getShadowMetadata: p, getShadowValue: i } = h.getState(), c = f(o), y = p(o, t)?.validation, A = y?.status || "NOT_VALIDATED", r = (y?.errors || []).map((m) => ({
    ...m,
    path: t
  })), l = r.filter((m) => m.severity === "error").map((m) => m.message), a = r.filter((m) => m.severity === "warning").map((m) => m.message), w = l[0] || a[0], M = l.length > 0 ? "error" : a.length > 0 ? "warning" : void 0, { registeredPlugins: d } = C.getState(), k = {};
  return d.forEach((m) => {
    if (c && c.hasOwnProperty(m.name)) {
      const E = m.name, j = C.getState().getHookResult(o, E), W = _(
        o,
        E,
        t
      );
      k[E] = {
        hookData: j,
        getFieldMetaData: W.getFieldMetaData,
        setFieldMetaData: W.setFieldMetaData
      };
    }
  }), /* @__PURE__ */ D(L, { children: c?.formElements?.validation && !e?.validation?.disable ? c.formElements.validation({
    children: /* @__PURE__ */ D(B.Fragment, { children: s }, t.toString()),
    status: A,
    // Now passes the new ValidationStatus type
    message: e?.validation?.hideMessage ? "" : e?.validation?.message || w || "",
    severity: M,
    hasErrors: l.length > 0,
    hasWarnings: a.length > 0,
    allErrors: r,
    path: t,
    getData: () => i(o, t),
    plugins: k
  }) : /* @__PURE__ */ D(B.Fragment, { children: s }, t.toString()) });
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
  arraySetter: f,
  rebuildStateShape: p,
  renderFn: i
}) {
  const [, c] = I({}), { ref: g, inView: y } = Y(), A = R(null), r = [e, ...o].join(".");
  U(e, t, c);
  const l = O(
    (d) => {
      A.current = d, g(d);
    },
    [g]
  );
  P(() => {
    const d = et(r, (k) => {
      c({});
    });
    return () => d();
  }, [r]);
  const a = z(e, o);
  if (a === void 0)
    return null;
  const w = p({
    currentState: a,
    path: o,
    componentId: t
  }), M = i(w, s, f);
  return /* @__PURE__ */ D("div", { ref: l, children: M });
}
function bt({
  stateKey: e,
  path: t,
  rebuildStateShape: o,
  renderFn: s,
  formOpts: f,
  setState: p
}) {
  const i = R(q()).current, [, c] = I({}), g = R(null), y = [e, ...t].join(".");
  U(e, i, c);
  const r = h.getState().getShadowNode(e, t)?._meta?.typeInfo, l = z(e, t), [a, w] = I(l), M = R(!1), d = R(null);
  P(() => {
    !M.current && !Z(l, a) && w(l);
  }, [l]), P(() => {
    const { getShadowMetadata: n, setShadowMetadata: T } = h.getState(), u = n(e, t) || {};
    u.clientActivityState || (u.clientActivityState = { elements: /* @__PURE__ */ new Map() });
    const S = () => {
      const v = g.current;
      if (!v) return "input";
      const F = v.tagName.toLowerCase();
      if (F === "textarea") return "textarea";
      if (F === "select") return "select";
      if (F === "input") {
        const b = v.type;
        if (b === "checkbox") return "checkbox";
        if (b === "radio") return "radio";
        if (b === "range") return "range";
        if (b === "file") return "file";
      }
      return "input";
    };
    u.clientActivityState.elements.set(i, {
      domRef: g,
      elementType: S(),
      inputType: g.current?.type,
      mountedAt: Date.now()
    }), T(e, t, u);
    const N = h.getState().subscribeToPath(y, (v) => {
      !M.current && a !== v && c({});
    });
    return () => {
      N(), d.current && (clearTimeout(d.current), M.current = !1);
      const v = h.getState().getShadowMetadata(e, t);
      v?.clientActivityState?.elements && (v.clientActivityState.elements.delete(i), T(e, t, v));
    };
  }, []);
  const k = O(
    (n) => {
      r ? r.type === "number" && typeof n == "string" ? n = n === "" ? r.nullable ? null : r.default ?? 0 : Number(n) : r.type === "boolean" && typeof n == "string" ? n = n === "true" || n === "1" : r.type === "date" && typeof n == "string" && (n = new Date(n)) : typeof l === "number" && typeof n == "string" && (n = n === "" ? 0 : Number(n)), w(n);
      const { getShadowMetadata: T, setShadowMetadata: u } = h.getState(), S = T(e, t);
      if (S?.clientActivityState?.elements?.has(i)) {
        const b = S.clientActivityState.elements.get(i);
        b && b.currentActivity?.type === "focus" && (b.currentActivity.details = {
          ...b.currentActivity.details,
          value: n,
          previousValue: b.currentActivity.details?.value || l,
          inputLength: typeof n == "string" ? n.length : void 0,
          keystrokeCount: (b.currentActivity.details?.keystrokeCount || 0) + 1
        }, u(e, t, S));
      }
      const N = S?.clientActivityState?.elements?.get(i);
      x({
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
          keystrokeCount: (N?.currentActivity?.details?.keystrokeCount || 0) + 1
        }
      }), H({
        stateKey: e,
        path: t,
        newValue: n,
        updateType: "update"
      }, "onChange"), M.current = !0, d.current && clearTimeout(d.current);
      const F = f?.debounceTime ?? 200;
      d.current = setTimeout(() => {
        M.current = !1, p(n, t, {
          updateType: "update",
          validationTrigger: "onChange"
        });
      }, F);
    },
    [
      p,
      t,
      f?.debounceTime,
      r,
      l,
      e,
      i
    ]
  ), m = O(() => {
    const { getShadowMetadata: n, setShadowMetadata: T } = h.getState(), u = n(e, t);
    if (u?.clientActivityState?.elements?.has(i)) {
      const S = u.clientActivityState.elements.get(i);
      S.currentActivity = {
        type: "focus",
        startTime: Date.now(),
        details: {
          value: a,
          inputLength: typeof a == "string" ? a.length : void 0
        }
      }, T(e, t, u);
    }
    x({
      stateKey: e,
      activityType: "focus",
      // Changed from 'type'
      path: t,
      timestamp: Date.now(),
      details: {
        cursorPosition: g.current?.selectionStart
      }
    });
  }, [e, t, i, a]), E = O(() => {
    const { getShadowMetadata: n, setShadowMetadata: T } = h.getState();
    d.current && (clearTimeout(d.current), d.current = null, M.current = !1, p(a, t, {
      updateType: "update",
      validationTrigger: "onBlur"
    }));
    const u = n(e, t);
    if (u?.clientActivityState?.elements?.has(i)) {
      const v = u.clientActivityState.elements.get(i);
      v.currentActivity = void 0, T(e, t, u);
    }
    const S = u?.clientActivityState?.elements?.get(i)?.currentActivity?.startTime;
    x({
      stateKey: e,
      activityType: "blur",
      // Changed from 'type'
      path: t,
      timestamp: Date.now(),
      duration: S ? Date.now() - S : void 0,
      details: {
        duration: S ? Date.now() - S : 0
      }
    }), V(e)?.validation?.onBlur && H({
      stateKey: e,
      path: t,
      newValue: a,
      updateType: "update"
    }, "onBlur");
  }, [a, p, t, e, i, l]), j = o({
    path: t,
    componentId: i,
    meta: void 0
  }), W = new Proxy(j, {
    get(n, T) {
      return T === "$inputProps" ? {
        value: a ?? "",
        onChange: (u) => {
          k(u.target.value);
        },
        onFocus: m,
        onBlur: E,
        ref: g
      } : n[T];
    }
  }), G = s(W);
  return /* @__PURE__ */ D(nt, { formOpts: f, path: t, stateKey: e, children: G });
}
function U(e, t, o) {
  const s = `${e}////${t}`;
  Q(() => (K(e, s, {
    forceUpdate: () => o({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    tt(e, s);
  }), [e, s]);
}
function ht({
  stateKey: e,
  path: t,
  // The path of the parent node (e.g. ['form'])
  dependencies: o,
  // NEW: Optional array of Proxy objects or path arrays
  rebuildStateShape: s,
  renderFn: f
}) {
  const [p] = I(() => q()), [, i] = I({});
  U(e, p, i);
  const c = X(() => o && o.length > 0 ? o.map((y) => [e, ...y.$_path].join(".")) : [[e, ...t].join(".")], [e, t, o]);
  P(() => {
    const y = h.getState(), A = c.map((r) => y.subscribeToPath(r, () => {
      i({});
    }));
    return () => {
      A.forEach((r) => r());
    };
  }, [c]);
  const g = s({
    path: t,
    componentId: p,
    meta: void 0
  });
  return /* @__PURE__ */ D(L, { children: f(g) });
}
$(function({
  children: t,
  stateKey: o,
  path: s,
  pluginName: f,
  wrapperDepth: p
}) {
  const [, i] = I({});
  P(() => {
    const w = [o, ...s].join(".");
    return h.getState().subscribeToPath(w, () => {
      i({});
    });
  }, [o, s]);
  const c = C.getState().registeredPlugins.find((w) => w.name === f), g = C.getState().stateHandlers.get(o), y = h.getState().getShadowNode(o, s)?._meta?.typeInfo, A = C.getState().pluginOptions.get(o)?.get(f), r = C.getState().getHookResult(o, f);
  if (!c?.formWrapper || !g)
    return /* @__PURE__ */ D(L, { children: t });
  const l = J(g), a = _(
    o,
    c.name,
    s
  );
  return c.formWrapper({
    element: t,
    path: s,
    stateKey: o,
    pluginName: c.name,
    ...l,
    ...a,
    options: A,
    hookData: r,
    fieldType: y?.type,
    wrapperDepth: p
  });
});
export {
  bt as FormElementWrapper,
  ht as IsolatedComponentWrapper,
  ot as ListItemWrapper,
  vt as MemoizedCogsItemWrapper,
  nt as ValidationWrapper,
  U as useRegisterComponent
};
//# sourceMappingURL=Components.jsx.map
