import { jsx as A, Fragment as O } from "react/jsx-runtime";
import { pluginStore as C } from "./pluginStore.js";
import { createMetadataContext as X, toDeconstructedMethods as Y } from "./plugins.js";
import U, { memo as _, useState as E, useRef as L, useCallback as k, useEffect as R, useLayoutEffect as $, useMemo as Z } from "react";
import { getGlobalStore as v } from "./store.js";
import { useInView as V } from "react-intersection-observer";
import { v4 as q } from "uuid";
import { isDeepEqual as K } from "./utility.js";
import { runValidation as B } from "./validation.js";
const {
  getInitialOptions: tt,
  getShadowMetadata: bt,
  setShadowMetadata: et,
  getShadowValue: z,
  registerComponent: nt,
  unregisterComponent: ot,
  notifyPathSubscribers: rt,
  subscribeToPath: it
} = v.getState(), { stateHandlers: yt, notifyFormUpdate: x } = C.getState();
function at({
  formOpts: t,
  path: e,
  stateKey: o,
  children: i
}) {
  const { getInitialOptions: l, getShadowMetadata: s, getShadowValue: r } = v.getState(), f = l(o), T = s(o, e)?.validation, w = T?.status || "NOT_VALIDATED", g = (T?.errors || []).map((c) => ({
    ...c,
    path: e
  })), d = g.filter((c) => c.severity === "error").map((c) => c.message), a = g.filter((c) => c.severity === "warning").map((c) => c.message), M = d[0] || a[0], S = d.length > 0 ? "error" : a.length > 0 ? "warning" : void 0;
  return /* @__PURE__ */ A(O, { children: f?.formElements?.validation && !t?.validation?.disable ? f.formElements.validation({
    children: /* @__PURE__ */ A(U.Fragment, { children: i }, e.toString()),
    status: w,
    // Now passes the new ValidationStatus type
    message: t?.validation?.hideMessage ? "" : t?.validation?.message || M || "",
    severity: S,
    hasErrors: d.length > 0,
    hasWarnings: a.length > 0,
    allErrors: g,
    path: e,
    getData: () => r(o, e)
  }) : /* @__PURE__ */ A(U.Fragment, { children: i }, e.toString()) });
}
const Mt = _(
  ct,
  (t, e) => t.itemPath.join(".") === e.itemPath.join(".") && t.stateKey === e.stateKey && t.itemComponentId === e.itemComponentId && t.localIndex === e.localIndex
);
function ct({
  stateKey: t,
  itemComponentId: e,
  itemPath: o,
  localIndex: i,
  arraySetter: l,
  rebuildStateShape: s,
  renderFn: r
}) {
  const [, f] = E({}), { ref: m, inView: T } = V(), w = L(null), g = st(w), d = L(!1), a = [t, ...o].join(".");
  P(t, e, f);
  const M = k(
    (h) => {
      w.current = h, m(h);
    },
    [m]
  );
  R(() => {
    const h = it(a, (H) => {
      f({});
    });
    return () => h();
  }, [a]), R(() => {
    if (!T || !g || d.current)
      return;
    const h = w.current;
    if (h && h.offsetHeight > 0) {
      d.current = !0;
      const H = h.offsetHeight;
      et(t, o, {
        virtualizer: {
          itemHeight: H,
          domRef: h
        }
      });
      const F = o.slice(0, -1), N = [t, ...F].join(".");
      rt(N, {
        type: "ITEMHEIGHT",
        itemKey: o.join("."),
        ref: w.current
      });
    }
  }, [T, g, t, o]);
  const S = z(t, o);
  if (S === void 0)
    return null;
  const c = s({
    currentState: S,
    path: o,
    componentId: e
  }), D = r(c, i, l);
  return /* @__PURE__ */ A("div", { ref: M, children: D });
}
function Tt({
  stateKey: t,
  path: e,
  rebuildStateShape: o,
  renderFn: i,
  formOpts: l,
  setState: s
}) {
  const r = L(q()).current, [, f] = E({}), m = L(null), T = [t, ...e].join(".");
  P(t, r, f);
  const g = v.getState().getShadowNode(t, e)?._meta?.typeInfo, d = z(t, e), [a, M] = E(d), S = L(!1), c = L(null), D = Z(() => C.getState().getPluginConfigsForState(t).filter((n) => typeof n.plugin.formWrapper == "function"), [t]);
  R(() => {
    !S.current && !K(d, a) && M(d);
  }, [d]), R(() => {
    const { getShadowMetadata: n, setShadowMetadata: p } = v.getState(), u = n(t, e) || {};
    u.clientActivityState || (u.clientActivityState = { elements: /* @__PURE__ */ new Map() });
    const I = () => {
      const b = m.current;
      if (!b) return "input";
      const y = b.tagName.toLowerCase();
      if (y === "textarea") return "textarea";
      if (y === "select") return "select";
      if (y === "input") {
        const j = b.type;
        if (j === "checkbox") return "checkbox";
        if (j === "radio") return "radio";
        if (j === "range") return "range";
        if (j === "file") return "file";
      }
      return "input";
    };
    u.clientActivityState.elements.set(r, {
      domRef: m,
      elementType: I(),
      inputType: m.current?.type,
      mountedAt: Date.now()
    }), p(t, e, u);
    const W = v.getState().subscribeToPath(T, (b) => {
      !S.current && a !== b && f({});
    });
    return () => {
      W(), c.current && (clearTimeout(c.current), S.current = !1);
      const b = v.getState().getShadowMetadata(t, e);
      b?.clientActivityState?.elements && (b.clientActivityState.elements.delete(r), p(t, e, b));
    };
  }, []);
  const h = k(
    (n) => {
      g ? g.type === "number" && typeof n == "string" ? n = n === "" ? g.nullable ? null : g.default ?? 0 : Number(n) : g.type === "boolean" && typeof n == "string" ? n = n === "true" || n === "1" : g.type === "date" && typeof n == "string" && (n = new Date(n)) : typeof d === "number" && typeof n == "string" && (n = n === "" ? 0 : Number(n)), M(n);
      const { getShadowMetadata: p, setShadowMetadata: u } = v.getState(), I = p(t, e);
      if (I?.clientActivityState?.elements?.has(r)) {
        const y = I.clientActivityState.elements.get(r);
        y && y.currentActivity?.type === "focus" && (y.currentActivity.details = {
          ...y.currentActivity.details,
          value: n,
          previousValue: y.currentActivity.details?.value || d,
          inputLength: typeof n == "string" ? n.length : void 0,
          keystrokeCount: (y.currentActivity.details?.keystrokeCount || 0) + 1
        }, u(t, e, I));
      }
      x({
        stateKey: t,
        type: "input",
        path: e,
        value: n
      }), B({
        stateKey: t,
        path: e,
        newValue: n,
        updateType: "update"
      }, "onChange"), S.current = !0, c.current && clearTimeout(c.current);
      const b = l?.debounceTime ?? 200;
      c.current = setTimeout(() => {
        S.current = !1, s(n, e, {
          updateType: "update",
          validationTrigger: "onChange"
        });
      }, b);
    },
    [
      s,
      e,
      l?.debounceTime,
      g,
      d,
      t,
      r
    ]
  ), H = k(() => {
    const { getShadowMetadata: n, setShadowMetadata: p } = v.getState(), u = n(t, e);
    if (u?.clientActivityState?.elements?.has(r)) {
      const I = u.clientActivityState.elements.get(r);
      I.currentActivity = {
        type: "focus",
        startTime: Date.now(),
        details: {
          value: a,
          inputLength: typeof a == "string" ? a.length : void 0
        }
      }, p(t, e, u);
    }
    x({
      stateKey: t,
      type: "focus",
      path: e,
      value: a
    });
  }, [t, e, r, a]), F = k(() => {
    const { getShadowMetadata: n, setShadowMetadata: p } = v.getState();
    c.current && (clearTimeout(c.current), c.current = null, S.current = !1, s(a, e, {
      updateType: "update",
      validationTrigger: "onBlur"
    }));
    const u = n(t, e);
    if (u?.clientActivityState?.elements?.has(r)) {
      const W = u.clientActivityState.elements.get(r);
      W.currentActivity = void 0, p(t, e, u);
    }
    x({
      stateKey: t,
      type: "blur",
      path: e,
      value: a
    }), tt(t)?.validation?.onBlur && B({
      stateKey: t,
      path: e,
      newValue: a,
      updateType: "update"
    }, "onBlur");
  }, [a, s, e, t, r, d]), N = o({
    path: e,
    componentId: r,
    meta: void 0
  }), G = new Proxy(N, {
    get(n, p) {
      return p === "$inputProps" ? {
        value: a ?? "",
        onChange: (u) => {
          h(u.target.value);
        },
        onFocus: H,
        onBlur: F,
        ref: m
      } : n[p];
    }
  }), J = i(G), Q = D.reduceRight(
    (n, p, u) => /* @__PURE__ */ A(
      ut,
      {
        stateKey: t,
        path: e,
        pluginName: p.plugin.name,
        wrapperDepth: D.length - 1 - u,
        children: n
      }
    ),
    J
  );
  return /* @__PURE__ */ A(at, { formOpts: l, path: e, stateKey: t, children: Q });
}
function P(t, e, o) {
  const i = `${t}////${e}`;
  $(() => (nt(t, i, {
    forceUpdate: () => o({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    ot(t, i);
  }), [t, i]);
}
const st = (t) => {
  const [e, o] = E(!1);
  return $(() => {
    if (!t.current) {
      o(!0);
      return;
    }
    const i = Array.from(t.current.querySelectorAll("img"));
    if (i.length === 0) {
      o(!0);
      return;
    }
    let l = 0;
    const s = () => {
      l++, l === i.length && o(!0);
    };
    return i.forEach((r) => {
      r.complete ? s() : (r.addEventListener("load", s), r.addEventListener("error", s));
    }), () => {
      i.forEach((r) => {
        r.removeEventListener("load", s), r.removeEventListener("error", s);
      });
    };
  }, [t.current]), e;
};
function wt({
  stateKey: t,
  path: e,
  rebuildStateShape: o,
  renderFn: i
}) {
  const [l] = E(() => q()), [, s] = E({}), r = [t, ...e].join(".");
  P(t, l, s), R(() => {
    const m = v.getState().subscribeToPath(r, () => {
      s({});
    });
    return () => m();
  }, [r]);
  const f = o({
    path: e,
    componentId: l,
    meta: void 0
  });
  return /* @__PURE__ */ A(O, { children: i(f) });
}
const ut = _(function({
  children: e,
  stateKey: o,
  path: i,
  pluginName: l,
  wrapperDepth: s
}) {
  const [, r] = E({});
  R(() => {
    const M = [o, ...i].join(".");
    return v.getState().subscribeToPath(M, () => {
      r({});
    });
  }, [o, i]);
  const f = C.getState().registeredPlugins.find((M) => M.name === l), m = C.getState().stateHandlers.get(o), T = v.getState().getShadowNode(o, i)?._meta?.typeInfo, w = C.getState().pluginOptions.get(o)?.get(l), g = C.getState().getHookResult(o, l);
  if (!f?.formWrapper || !m)
    return /* @__PURE__ */ A(O, { children: e });
  const d = X(o, f.name), a = Y(m);
  return f.formWrapper({
    element: e,
    path: i,
    stateKey: o,
    pluginName: f.name,
    ...a,
    ...d,
    options: w,
    hookData: g,
    fieldType: T?.type,
    wrapperDepth: s
  });
});
export {
  Tt as FormElementWrapper,
  wt as IsolatedComponentWrapper,
  ct as ListItemWrapper,
  Mt as MemoizedCogsItemWrapper,
  at as ValidationWrapper,
  P as useRegisterComponent
};
//# sourceMappingURL=Components.jsx.map
