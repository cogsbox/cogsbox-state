import { jsx as C, Fragment as x } from "react/jsx-runtime";
import { pluginStore as E } from "./pluginStore.js";
import { createScopedMetadataContext as _, toDeconstructedMethods as Q } from "./plugins.js";
import U, { memo as $, useState as D, useRef as R, useCallback as N, useEffect as H, useLayoutEffect as q, useMemo as X } from "react";
import { getGlobalStore as M } from "./store.js";
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
} = M.getState(), { stateHandlers: vt, notifyFormUpdate: O } = E.getState();
function rt({
  formOpts: t,
  path: e,
  stateKey: n,
  children: a
}) {
  const { getInitialOptions: m, getShadowMetadata: c, getShadowValue: r } = M.getState(), l = m(n), p = c(n, e)?.validation, T = p?.status || "NOT_VALIDATED", s = (p?.errors || []).map((i) => ({
    ...i,
    path: e
  })), d = s.filter((i) => i.severity === "error").map((i) => i.message), u = s.filter((i) => i.severity === "warning").map((i) => i.message), A = d[0] || u[0], h = d.length > 0 ? "error" : u.length > 0 ? "warning" : void 0, { registeredPlugins: y } = E.getState(), L = {};
  return y.forEach((i) => {
    if (l && l.hasOwnProperty(i.name)) {
      const I = i.name, F = E.getState().getHookResult(n, I), k = _(
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
  }), /* @__PURE__ */ C(x, { children: l?.formElements?.validation && !t?.validation?.disable ? l.formElements.validation({
    children: /* @__PURE__ */ C(U.Fragment, { children: a }, e.toString()),
    status: T,
    // Now passes the new ValidationStatus type
    message: t?.validation?.hideMessage ? "" : t?.validation?.message || A || "",
    severity: h,
    hasErrors: d.length > 0,
    hasWarnings: u.length > 0,
    allErrors: s,
    path: e,
    getData: () => r(n, e),
    plugins: L
  }) : /* @__PURE__ */ C(U.Fragment, { children: a }, e.toString()) });
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
  const [, l] = D({}), { ref: f, inView: p } = Y(), T = R(null), s = at(T), d = R(!1), u = [t, ...n].join(".");
  P(t, e, l);
  const A = N(
    (i) => {
      T.current = i, f(i);
    },
    [f]
  );
  H(() => {
    const i = ot(u, (I) => {
      l({});
    });
    return () => i();
  }, [u]), H(() => {
    if (!p || !s || d.current)
      return;
    const i = T.current;
    if (i && i.offsetHeight > 0) {
      d.current = !0;
      const I = i.offsetHeight;
      K(t, n, {
        virtualizer: {
          itemHeight: I,
          domRef: i
        }
      });
      const F = n.slice(0, -1), k = [t, ...F].join(".");
      nt(k, {
        type: "ITEMHEIGHT",
        itemKey: n.join("."),
        ref: T.current
      });
    }
  }, [p, s, t, n]);
  const h = G(t, n);
  if (h === void 0)
    return null;
  const y = c({
    currentState: h,
    path: n,
    componentId: e
  }), L = r(y, a, m);
  return /* @__PURE__ */ C("div", { ref: A, children: L });
}
function yt({
  stateKey: t,
  path: e,
  rebuildStateShape: n,
  renderFn: a,
  formOpts: m,
  setState: c
}) {
  const r = R(z()).current, [, l] = D({}), f = R(null), p = [t, ...e].join(".");
  P(t, r, l);
  const s = M.getState().getShadowNode(t, e)?._meta?.typeInfo, d = G(t, e), [u, A] = D(d), h = R(!1), y = R(null);
  H(() => {
    !h.current && !Z(d, u) && A(d);
  }, [d]), H(() => {
    const { getShadowMetadata: o, setShadowMetadata: w } = M.getState(), g = o(t, e) || {};
    g.clientActivityState || (g.clientActivityState = { elements: /* @__PURE__ */ new Map() });
    const S = () => {
      const v = f.current;
      if (!v) return "input";
      const j = v.tagName.toLowerCase();
      if (j === "textarea") return "textarea";
      if (j === "select") return "select";
      if (j === "input") {
        const b = v.type;
        if (b === "checkbox") return "checkbox";
        if (b === "radio") return "radio";
        if (b === "range") return "range";
        if (b === "file") return "file";
      }
      return "input";
    };
    g.clientActivityState.elements.set(r, {
      domRef: f,
      elementType: S(),
      inputType: f.current?.type,
      mountedAt: Date.now()
    }), w(t, e, g);
    const W = M.getState().subscribeToPath(p, (v) => {
      !h.current && u !== v && l({});
    });
    return () => {
      W(), y.current && (clearTimeout(y.current), h.current = !1);
      const v = M.getState().getShadowMetadata(t, e);
      v?.clientActivityState?.elements && (v.clientActivityState.elements.delete(r), w(t, e, v));
    };
  }, []);
  const L = N(
    (o) => {
      s ? s.type === "number" && typeof o == "string" ? o = o === "" ? s.nullable ? null : s.default ?? 0 : Number(o) : s.type === "boolean" && typeof o == "string" ? o = o === "true" || o === "1" : s.type === "date" && typeof o == "string" && (o = new Date(o)) : typeof d === "number" && typeof o == "string" && (o = o === "" ? 0 : Number(o)), A(o);
      const { getShadowMetadata: w, setShadowMetadata: g } = M.getState(), S = w(t, e);
      if (S?.clientActivityState?.elements?.has(r)) {
        const b = S.clientActivityState.elements.get(r);
        b && b.currentActivity?.type === "focus" && (b.currentActivity.details = {
          ...b.currentActivity.details,
          value: o,
          previousValue: b.currentActivity.details?.value || d,
          inputLength: typeof o == "string" ? o.length : void 0,
          keystrokeCount: (b.currentActivity.details?.keystrokeCount || 0) + 1
        }, g(t, e, S));
      }
      const W = S?.clientActivityState?.elements?.get(r);
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
      }, "onChange"), h.current = !0, y.current && clearTimeout(y.current);
      const j = m?.debounceTime ?? 200;
      y.current = setTimeout(() => {
        h.current = !1, c(o, e, {
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
  ), i = N(() => {
    const { getShadowMetadata: o, setShadowMetadata: w } = M.getState(), g = o(t, e);
    if (g?.clientActivityState?.elements?.has(r)) {
      const S = g.clientActivityState.elements.get(r);
      S.currentActivity = {
        type: "focus",
        startTime: Date.now(),
        details: {
          value: u,
          inputLength: typeof u == "string" ? u.length : void 0
        }
      }, w(t, e, g);
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
  }, [t, e, r, u]), I = N(() => {
    const { getShadowMetadata: o, setShadowMetadata: w } = M.getState();
    y.current && (clearTimeout(y.current), y.current = null, h.current = !1, c(u, e, {
      updateType: "update",
      validationTrigger: "onBlur"
    }));
    const g = o(t, e);
    if (g?.clientActivityState?.elements?.has(r)) {
      const v = g.clientActivityState.elements.get(r);
      v.currentActivity = void 0, w(t, e, g);
    }
    const S = g?.clientActivityState?.elements?.get(r)?.currentActivity?.startTime;
    O({
      stateKey: t,
      activityType: "blur",
      // Changed from 'type'
      path: e,
      timestamp: Date.now(),
      duration: S ? Date.now() - S : void 0,
      details: {
        duration: S ? Date.now() - S : 0
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
    get(o, w) {
      return w === "$inputProps" ? {
        value: u ?? "",
        onChange: (g) => {
          L(g.target.value);
        },
        onFocus: i,
        onBlur: I,
        ref: f
      } : o[w];
    }
  }), J = a(k);
  return /* @__PURE__ */ C(rt, { formOpts: m, path: e, stateKey: t, children: J });
}
function P(t, e, n) {
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
  const [c] = D(() => z()), [, r] = D({});
  P(t, c, r);
  const l = X(() => n && n.length > 0 ? n.map((p) => [t, ...p.$_path].join(".")) : [[t, ...e].join(".")], [t, e, n]);
  H(() => {
    const p = M.getState(), T = l.map((s) => p.subscribeToPath(s, () => {
      r({});
    }));
    return () => {
      T.forEach((s) => s());
    };
  }, [l]);
  const f = a({
    path: e,
    componentId: c,
    meta: void 0
  });
  return /* @__PURE__ */ C(x, { children: m(f) });
}
$(function({
  children: e,
  stateKey: n,
  path: a,
  pluginName: m,
  wrapperDepth: c
}) {
  const [, r] = D({});
  H(() => {
    const A = [n, ...a].join(".");
    return M.getState().subscribeToPath(A, () => {
      r({});
    });
  }, [n, a]);
  const l = E.getState().registeredPlugins.find((A) => A.name === m), f = E.getState().stateHandlers.get(n), p = M.getState().getShadowNode(n, a)?._meta?.typeInfo, T = E.getState().pluginOptions.get(n)?.get(m), s = E.getState().getHookResult(n, m);
  if (!l?.formWrapper || !f)
    return /* @__PURE__ */ C(x, { children: e });
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
    options: T,
    hookData: s,
    fieldType: p?.type,
    wrapperDepth: c
  });
});
export {
  yt as FormElementWrapper,
  bt as IsolatedComponentWrapper,
  it as ListItemWrapper,
  ht as MemoizedCogsItemWrapper,
  rt as ValidationWrapper,
  P as useRegisterComponent
};
//# sourceMappingURL=Components.jsx.map
