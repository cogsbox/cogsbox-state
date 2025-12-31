import { jsx as E, Fragment as P } from "react/jsx-runtime";
import { pluginStore as C } from "./pluginStore.js";
import { createScopedMetadataContext as _, toDeconstructedMethods as Q } from "./plugins.js";
import U, { memo as $, useState as D, useRef as R, useCallback as N, useEffect as H, useLayoutEffect as q } from "react";
import { getGlobalStore as b } from "./store.js";
import { useInView as X } from "react-intersection-observer";
import { v4 as z } from "uuid";
import { isDeepEqual as Y } from "./utility.js";
import { runValidation as B } from "./validation.js";
const {
  getInitialOptions: Z,
  getShadowMetadata: pt,
  setShadowMetadata: V,
  getShadowValue: G,
  registerComponent: K,
  unregisterComponent: tt,
  notifyPathSubscribers: et,
  subscribeToPath: nt
} = b.getState(), { stateHandlers: St, notifyFormUpdate: O } = C.getState();
function ot({
  formOpts: t,
  path: e,
  stateKey: n,
  children: a
}) {
  const { getInitialOptions: u, getShadowMetadata: s, getShadowValue: r } = b.getState(), l = u(n), w = s(n, e)?.validation, A = w?.status || "NOT_VALIDATED", m = (w?.errors || []).map((i) => ({
    ...i,
    path: e
  })), d = m.filter((i) => i.severity === "error").map((i) => i.message), c = m.filter((i) => i.severity === "warning").map((i) => i.message), T = d[0] || c[0], v = d.length > 0 ? "error" : c.length > 0 ? "warning" : void 0, { registeredPlugins: h } = C.getState(), L = {};
  return h.forEach((i) => {
    if (l && l.hasOwnProperty(i.name)) {
      const I = i.name, F = C.getState().getHookResult(n, I), k = _(
        n,
        I,
        e
      );
      L[I] = {
        hookData: F,
        getFieldMetaData: k.getFieldMetaData,
        setFieldMetaData: k.setFieldMetaData
      };
    }
  }), /* @__PURE__ */ E(P, { children: l?.formElements?.validation && !t?.validation?.disable ? l.formElements.validation({
    children: /* @__PURE__ */ E(U.Fragment, { children: a }, e.toString()),
    status: A,
    // Now passes the new ValidationStatus type
    message: t?.validation?.hideMessage ? "" : t?.validation?.message || T || "",
    severity: v,
    hasErrors: d.length > 0,
    hasWarnings: c.length > 0,
    allErrors: m,
    path: e,
    getData: () => r(n, e),
    plugins: L
  }) : /* @__PURE__ */ E(U.Fragment, { children: a }, e.toString()) });
}
const vt = $(
  rt,
  (t, e) => t.itemPath.join(".") === e.itemPath.join(".") && t.stateKey === e.stateKey && t.itemComponentId === e.itemComponentId && t.localIndex === e.localIndex
);
function rt({
  stateKey: t,
  itemComponentId: e,
  itemPath: n,
  localIndex: a,
  arraySetter: u,
  rebuildStateShape: s,
  renderFn: r
}) {
  const [, l] = D({}), { ref: f, inView: w } = X(), A = R(null), m = it(A), d = R(!1), c = [t, ...n].join(".");
  x(t, e, l);
  const T = N(
    (i) => {
      A.current = i, f(i);
    },
    [f]
  );
  H(() => {
    const i = nt(c, (I) => {
      l({});
    });
    return () => i();
  }, [c]), H(() => {
    if (!w || !m || d.current)
      return;
    const i = A.current;
    if (i && i.offsetHeight > 0) {
      d.current = !0;
      const I = i.offsetHeight;
      V(t, n, {
        virtualizer: {
          itemHeight: I,
          domRef: i
        }
      });
      const F = n.slice(0, -1), k = [t, ...F].join(".");
      et(k, {
        type: "ITEMHEIGHT",
        itemKey: n.join("."),
        ref: A.current
      });
    }
  }, [w, m, t, n]);
  const v = G(t, n);
  if (v === void 0)
    return null;
  const h = s({
    currentState: v,
    path: n,
    componentId: e
  }), L = r(h, a, u);
  return /* @__PURE__ */ E("div", { ref: T, children: L });
}
function ht({
  stateKey: t,
  path: e,
  rebuildStateShape: n,
  renderFn: a,
  formOpts: u,
  setState: s
}) {
  const r = R(z()).current, [, l] = D({}), f = R(null), w = [t, ...e].join(".");
  x(t, r, l);
  const m = b.getState().getShadowNode(t, e)?._meta?.typeInfo, d = G(t, e), [c, T] = D(d), v = R(!1), h = R(null);
  H(() => {
    !v.current && !Y(d, c) && T(d);
  }, [d]), H(() => {
    const { getShadowMetadata: o, setShadowMetadata: M } = b.getState(), g = o(t, e) || {};
    g.clientActivityState || (g.clientActivityState = { elements: /* @__PURE__ */ new Map() });
    const p = () => {
      const S = f.current;
      if (!S) return "input";
      const W = S.tagName.toLowerCase();
      if (W === "textarea") return "textarea";
      if (W === "select") return "select";
      if (W === "input") {
        const y = S.type;
        if (y === "checkbox") return "checkbox";
        if (y === "radio") return "radio";
        if (y === "range") return "range";
        if (y === "file") return "file";
      }
      return "input";
    };
    g.clientActivityState.elements.set(r, {
      domRef: f,
      elementType: p(),
      inputType: f.current?.type,
      mountedAt: Date.now()
    }), M(t, e, g);
    const j = b.getState().subscribeToPath(w, (S) => {
      !v.current && c !== S && l({});
    });
    return () => {
      j(), h.current && (clearTimeout(h.current), v.current = !1);
      const S = b.getState().getShadowMetadata(t, e);
      S?.clientActivityState?.elements && (S.clientActivityState.elements.delete(r), M(t, e, S));
    };
  }, []);
  const L = N(
    (o) => {
      m ? m.type === "number" && typeof o == "string" ? o = o === "" ? m.nullable ? null : m.default ?? 0 : Number(o) : m.type === "boolean" && typeof o == "string" ? o = o === "true" || o === "1" : m.type === "date" && typeof o == "string" && (o = new Date(o)) : typeof d === "number" && typeof o == "string" && (o = o === "" ? 0 : Number(o)), T(o);
      const { getShadowMetadata: M, setShadowMetadata: g } = b.getState(), p = M(t, e);
      if (p?.clientActivityState?.elements?.has(r)) {
        const y = p.clientActivityState.elements.get(r);
        y && y.currentActivity?.type === "focus" && (y.currentActivity.details = {
          ...y.currentActivity.details,
          value: o,
          previousValue: y.currentActivity.details?.value || d,
          inputLength: typeof o == "string" ? o.length : void 0,
          keystrokeCount: (y.currentActivity.details?.keystrokeCount || 0) + 1
        }, g(t, e, p));
      }
      const j = p?.clientActivityState?.elements?.get(r);
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
          keystrokeCount: (j?.currentActivity?.details?.keystrokeCount || 0) + 1
        }
      }), B({
        stateKey: t,
        path: e,
        newValue: o,
        updateType: "update"
      }, "onChange"), v.current = !0, h.current && clearTimeout(h.current);
      const W = u?.debounceTime ?? 200;
      h.current = setTimeout(() => {
        v.current = !1, s(o, e, {
          updateType: "update",
          validationTrigger: "onChange"
        });
      }, W);
    },
    [
      s,
      e,
      u?.debounceTime,
      m,
      d,
      t,
      r
    ]
  ), i = N(() => {
    const { getShadowMetadata: o, setShadowMetadata: M } = b.getState(), g = o(t, e);
    if (g?.clientActivityState?.elements?.has(r)) {
      const p = g.clientActivityState.elements.get(r);
      p.currentActivity = {
        type: "focus",
        startTime: Date.now(),
        details: {
          value: c,
          inputLength: typeof c == "string" ? c.length : void 0
        }
      }, M(t, e, g);
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
  }, [t, e, r, c]), I = N(() => {
    const { getShadowMetadata: o, setShadowMetadata: M } = b.getState();
    h.current && (clearTimeout(h.current), h.current = null, v.current = !1, s(c, e, {
      updateType: "update",
      validationTrigger: "onBlur"
    }));
    const g = o(t, e);
    if (g?.clientActivityState?.elements?.has(r)) {
      const S = g.clientActivityState.elements.get(r);
      S.currentActivity = void 0, M(t, e, g);
    }
    const p = g?.clientActivityState?.elements?.get(r)?.currentActivity?.startTime;
    O({
      stateKey: t,
      activityType: "blur",
      // Changed from 'type'
      path: e,
      timestamp: Date.now(),
      duration: p ? Date.now() - p : void 0,
      details: {
        duration: p ? Date.now() - p : 0
      }
    }), Z(t)?.validation?.onBlur && B({
      stateKey: t,
      path: e,
      newValue: c,
      updateType: "update"
    }, "onBlur");
  }, [c, s, e, t, r, d]), F = n({
    path: e,
    componentId: r,
    meta: void 0
  }), k = new Proxy(F, {
    get(o, M) {
      return M === "$inputProps" ? {
        value: c ?? "",
        onChange: (g) => {
          L(g.target.value);
        },
        onFocus: i,
        onBlur: I,
        ref: f
      } : o[M];
    }
  }), J = a(k);
  return /* @__PURE__ */ E(ot, { formOpts: u, path: e, stateKey: t, children: J });
}
function x(t, e, n) {
  const a = `${t}////${e}`;
  q(() => (K(t, a, {
    forceUpdate: () => n({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    tt(t, a);
  }), [t, a]);
}
const it = (t) => {
  const [e, n] = D(!1);
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
    let u = 0;
    const s = () => {
      u++, u === a.length && n(!0);
    };
    return a.forEach((r) => {
      r.complete ? s() : (r.addEventListener("load", s), r.addEventListener("error", s));
    }), () => {
      a.forEach((r) => {
        r.removeEventListener("load", s), r.removeEventListener("error", s);
      });
    };
  }, [t.current]), e;
};
function yt({
  stateKey: t,
  path: e,
  rebuildStateShape: n,
  renderFn: a
}) {
  const [u] = D(() => z()), [, s] = D({}), r = [t, ...e].join(".");
  x(t, u, s), H(() => {
    const f = b.getState().subscribeToPath(r, () => {
      s({});
    });
    return () => f();
  }, [r]);
  const l = n({
    path: e,
    componentId: u,
    meta: void 0
  });
  return /* @__PURE__ */ E(P, { children: a(l) });
}
$(function({
  children: e,
  stateKey: n,
  path: a,
  pluginName: u,
  wrapperDepth: s
}) {
  const [, r] = D({});
  H(() => {
    const T = [n, ...a].join(".");
    return b.getState().subscribeToPath(T, () => {
      r({});
    });
  }, [n, a]);
  const l = C.getState().registeredPlugins.find((T) => T.name === u), f = C.getState().stateHandlers.get(n), w = b.getState().getShadowNode(n, a)?._meta?.typeInfo, A = C.getState().pluginOptions.get(n)?.get(u), m = C.getState().getHookResult(n, u);
  if (!l?.formWrapper || !f)
    return /* @__PURE__ */ E(P, { children: e });
  const d = Q(f), c = _(
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
    ...c,
    options: A,
    hookData: m,
    fieldType: w?.type,
    wrapperDepth: s
  });
});
export {
  ht as FormElementWrapper,
  yt as IsolatedComponentWrapper,
  rt as ListItemWrapper,
  vt as MemoizedCogsItemWrapper,
  ot as ValidationWrapper,
  x as useRegisterComponent
};
//# sourceMappingURL=Components.jsx.map
