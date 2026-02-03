import { jsx as D, Fragment as P } from "react/jsx-runtime";
import { pluginStore as C } from "./pluginStore.js";
import { createScopedMetadataContext as _, toDeconstructedMethods as Q } from "./plugins.js";
import N, { memo as $, useState as L, useRef as R, useCallback as x, useEffect as H, useLayoutEffect as q, useMemo as X } from "react";
import { getGlobalStore as T } from "./store.js";
import { useInView as Y } from "react-intersection-observer";
import { v4 as z } from "uuid";
import { isDeepEqual as Z } from "./utility.js";
import { runValidation as B } from "./validation.js";
const {
  getInitialOptions: V,
  getShadowMetadata: St,
  setShadowMetadata: K,
  getShadowValue: G,
  registerComponent: tt,
  unregisterComponent: et,
  notifyPathSubscribers: nt,
  subscribeToPath: ot
} = T.getState(), { stateHandlers: vt, notifyFormUpdate: O } = C.getState();
function rt({
  formOpts: t,
  path: e,
  stateKey: n,
  children: a
}) {
  const { getInitialOptions: m, getShadowMetadata: c, getShadowValue: r } = T.getState(), l = m(n), S = c(n, e)?.validation, w = S?.status || "NOT_VALIDATED", s = (S?.errors || []).map((i) => ({
    ...i,
    path: e
  })), d = s.filter((i) => i.severity === "error").map((i) => i.message), u = s.filter((i) => i.severity === "warning").map((i) => i.message), A = d[0] || u[0], y = d.length > 0 ? "error" : u.length > 0 ? "warning" : void 0, { registeredPlugins: b } = C.getState(), E = {};
  return b.forEach((i) => {
    if (l && l.hasOwnProperty(i.name)) {
      const p = i.name, F = C.getState().getHookResult(n, p), k = _(
        n,
        p,
        e
      );
      E[p] = {
        hookData: F,
        getFieldMetaData: k.getFieldMetaData,
        setFieldMetaData: k.setFieldMetaData
      };
    }
  }), /* @__PURE__ */ D(P, { children: l?.formElements?.validation && !t?.validation?.disable ? l.formElements.validation({
    children: /* @__PURE__ */ D(N.Fragment, { children: a }, e.toString()),
    status: w,
    // Now passes the new ValidationStatus type
    message: t?.validation?.hideMessage ? "" : t?.validation?.message || A || "",
    severity: y,
    hasErrors: d.length > 0,
    hasWarnings: u.length > 0,
    allErrors: s,
    path: e,
    getData: () => r(n, e),
    plugins: E
  }) : /* @__PURE__ */ D(N.Fragment, { children: a }, e.toString()) });
}
const ht = $(
  it,
  (t, e) => t.itemPath.join(".") === e.itemPath.join(".") && t.stateKey === e.stateKey && t.itemComponentId === e.itemComponentId && t.localIndex === e.localIndex
);
function it({
  stateKey: t,
  itemComponentId: e,
  itemPath: n,
  localIndex: a,
  arraySetter: m,
  rebuildStateShape: c,
  renderFn: r
}) {
  const [, l] = L({}), { ref: f, inView: S } = Y(), w = R(null), s = at(w), d = R(!1), u = [t, ...n].join(".");
  U(t, e, l);
  const A = x(
    (i) => {
      w.current = i, f(i);
    },
    [f]
  );
  H(() => {
    const i = ot(u, (p) => {
      l({});
    });
    return () => i();
  }, [u]), H(() => {
    if (!S || !s || d.current)
      return;
    const i = w.current;
    if (i && i.offsetHeight > 0) {
      d.current = !0;
      const p = i.offsetHeight;
      K(t, n, {
        virtualizer: { itemHeight: p, domRef: i }
      });
      const F = n.slice(0, -1), k = [t, ...F].join(".");
      nt(k, {
        type: "ITEMHEIGHT",
        itemKey: n.join("."),
        ref: w.current
      });
    }
  }, [S, s, t, n]);
  const y = G(t, n);
  if (y === void 0) return null;
  const b = c({
    currentState: y,
    path: n,
    componentId: e
  }), E = r(b, a, m);
  return N.isValidElement(E) ? N.cloneElement(E, {
    ref: (i) => {
      A(i);
      const { ref: p } = E;
      typeof p == "function" ? p(i) : p && "current" in p && (p.current = i);
    }
  }) : /* @__PURE__ */ D("div", { ref: A, children: E });
}
function yt({
  stateKey: t,
  path: e,
  rebuildStateShape: n,
  renderFn: a,
  formOpts: m,
  setState: c
}) {
  const r = R(z()).current, [, l] = L({}), f = R(null), S = [t, ...e].join(".");
  U(t, r, l);
  const s = T.getState().getShadowNode(t, e)?._meta?.typeInfo, d = G(t, e), [u, A] = L(d), y = R(!1), b = R(null);
  H(() => {
    !y.current && !Z(d, u) && A(d);
  }, [d]), H(() => {
    const { getShadowMetadata: o, setShadowMetadata: I } = T.getState(), g = o(t, e) || {};
    g.clientActivityState || (g.clientActivityState = { elements: /* @__PURE__ */ new Map() });
    const v = () => {
      const h = f.current;
      if (!h) return "input";
      const j = h.tagName.toLowerCase();
      if (j === "textarea") return "textarea";
      if (j === "select") return "select";
      if (j === "input") {
        const M = h.type;
        if (M === "checkbox") return "checkbox";
        if (M === "radio") return "radio";
        if (M === "range") return "range";
        if (M === "file") return "file";
      }
      return "input";
    };
    g.clientActivityState.elements.set(r, {
      domRef: f,
      elementType: v(),
      inputType: f.current?.type,
      mountedAt: Date.now()
    }), I(t, e, g);
    const W = T.getState().subscribeToPath(S, (h) => {
      !y.current && u !== h && l({});
    });
    return () => {
      W(), b.current && (clearTimeout(b.current), y.current = !1);
      const h = T.getState().getShadowMetadata(t, e);
      h?.clientActivityState?.elements && (h.clientActivityState.elements.delete(r), I(t, e, h));
    };
  }, []);
  const E = x(
    (o) => {
      s ? s.type === "number" && typeof o == "string" ? o = o === "" ? s.nullable ? null : s.default ?? 0 : Number(o) : s.type === "boolean" && typeof o == "string" ? o = o === "true" || o === "1" : s.type === "date" && typeof o == "string" && (o = new Date(o)) : typeof d === "number" && typeof o == "string" && (o = o === "" ? 0 : Number(o)), A(o);
      const { getShadowMetadata: I, setShadowMetadata: g } = T.getState(), v = I(t, e);
      if (v?.clientActivityState?.elements?.has(r)) {
        const M = v.clientActivityState.elements.get(r);
        M && M.currentActivity?.type === "focus" && (M.currentActivity.details = {
          ...M.currentActivity.details,
          value: o,
          previousValue: M.currentActivity.details?.value || d,
          inputLength: typeof o == "string" ? o.length : void 0,
          keystrokeCount: (M.currentActivity.details?.keystrokeCount || 0) + 1
        }, g(t, e, v));
      }
      const W = v?.clientActivityState?.elements?.get(r);
      O({
        stateKey: t,
        activityType: "input",
        // Changed from 'type'
        path: e,
        timestamp: Date.now(),
        details: {
          value: o,
          inputLength: typeof o == "string" ? o.length : void 0,
          isComposing: !1,
          // You'd need to track this from the actual input event
          isPasting: !1,
          // You'd need to track this from paste events
          keystrokeCount: (W?.currentActivity?.details?.keystrokeCount || 0) + 1
        }
      }), B({
        stateKey: t,
        path: e,
        newValue: o,
        updateType: "update"
      }, "onChange"), y.current = !0, b.current && clearTimeout(b.current);
      const j = m?.debounceTime ?? 200;
      b.current = setTimeout(() => {
        y.current = !1, c(o, e, {
          updateType: "update",
          validationTrigger: "onChange"
        });
      }, j);
    },
    [
      c,
      e,
      m?.debounceTime,
      s,
      d,
      t,
      r
    ]
  ), i = x(() => {
    const { getShadowMetadata: o, setShadowMetadata: I } = T.getState(), g = o(t, e);
    if (g?.clientActivityState?.elements?.has(r)) {
      const v = g.clientActivityState.elements.get(r);
      v.currentActivity = {
        type: "focus",
        startTime: Date.now(),
        details: {
          value: u,
          inputLength: typeof u == "string" ? u.length : void 0
        }
      }, I(t, e, g);
    }
    O({
      stateKey: t,
      activityType: "focus",
      // Changed from 'type'
      path: e,
      timestamp: Date.now(),
      details: {
        cursorPosition: f.current?.selectionStart
      }
    });
  }, [t, e, r, u]), p = x(() => {
    const { getShadowMetadata: o, setShadowMetadata: I } = T.getState();
    b.current && (clearTimeout(b.current), b.current = null, y.current = !1, c(u, e, {
      updateType: "update",
      validationTrigger: "onBlur"
    }));
    const g = o(t, e);
    if (g?.clientActivityState?.elements?.has(r)) {
      const h = g.clientActivityState.elements.get(r);
      h.currentActivity = void 0, I(t, e, g);
    }
    const v = g?.clientActivityState?.elements?.get(r)?.currentActivity?.startTime;
    O({
      stateKey: t,
      activityType: "blur",
      // Changed from 'type'
      path: e,
      timestamp: Date.now(),
      duration: v ? Date.now() - v : void 0,
      details: {
        duration: v ? Date.now() - v : 0
      }
    }), V(t)?.validation?.onBlur && B({
      stateKey: t,
      path: e,
      newValue: u,
      updateType: "update"
    }, "onBlur");
  }, [u, c, e, t, r, d]), F = n({
    path: e,
    componentId: r,
    meta: void 0
  }), k = new Proxy(F, {
    get(o, I) {
      return I === "$inputProps" ? {
        value: u ?? "",
        onChange: (g) => {
          E(g.target.value);
        },
        onFocus: i,
        onBlur: p,
        ref: f
      } : o[I];
    }
  }), J = a(k);
  return /* @__PURE__ */ D(rt, { formOpts: m, path: e, stateKey: t, children: J });
}
function U(t, e, n) {
  const a = `${t}////${e}`;
  q(() => (tt(t, a, {
    forceUpdate: () => n({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    et(t, a);
  }), [t, a]);
}
const at = (t) => {
  const [e, n] = L(!1);
  return q(() => {
    if (!t.current) {
      n(!0);
      return;
    }
    const a = Array.from(t.current.querySelectorAll("img"));
    if (a.length === 0) {
      n(!0);
      return;
    }
    let m = 0;
    const c = () => {
      m++, m === a.length && n(!0);
    };
    return a.forEach((r) => {
      r.complete ? c() : (r.addEventListener("load", c), r.addEventListener("error", c));
    }), () => {
      a.forEach((r) => {
        r.removeEventListener("load", c), r.removeEventListener("error", c);
      });
    };
  }, [t.current]), e;
};
function bt({
  stateKey: t,
  path: e,
  // The path of the parent node (e.g. ['form'])
  dependencies: n,
  // NEW: Optional array of Proxy objects or path arrays
  rebuildStateShape: a,
  renderFn: m
}) {
  const [c] = L(() => z()), [, r] = L({});
  U(t, c, r);
  const l = X(() => n && n.length > 0 ? n.map((S) => [t, ...S.$_path].join(".")) : [[t, ...e].join(".")], [t, e, n]);
  H(() => {
    const S = T.getState(), w = l.map((s) => S.subscribeToPath(s, () => {
      r({});
    }));
    return () => {
      w.forEach((s) => s());
    };
  }, [l]);
  const f = a({
    path: e,
    componentId: c,
    meta: void 0
  });
  return /* @__PURE__ */ D(P, { children: m(f) });
}
$(function({
  children: e,
  stateKey: n,
  path: a,
  pluginName: m,
  wrapperDepth: c
}) {
  const [, r] = L({});
  H(() => {
    const A = [n, ...a].join(".");
    return T.getState().subscribeToPath(A, () => {
      r({});
    });
  }, [n, a]);
  const l = C.getState().registeredPlugins.find((A) => A.name === m), f = C.getState().stateHandlers.get(n), S = T.getState().getShadowNode(n, a)?._meta?.typeInfo, w = C.getState().pluginOptions.get(n)?.get(m), s = C.getState().getHookResult(n, m);
  if (!l?.formWrapper || !f)
    return /* @__PURE__ */ D(P, { children: e });
  const d = Q(f), u = _(
    n,
    l.name,
    a
  );
  return l.formWrapper({
    element: e,
    path: a,
    stateKey: n,
    pluginName: l.name,
    ...d,
    ...u,
    options: w,
    hookData: s,
    fieldType: S?.type,
    wrapperDepth: c
  });
});
export {
  yt as FormElementWrapper,
  bt as IsolatedComponentWrapper,
  it as ListItemWrapper,
  ht as MemoizedCogsItemWrapper,
  rt as ValidationWrapper,
  U as useRegisterComponent
};
//# sourceMappingURL=Components.jsx.map
