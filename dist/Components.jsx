import { jsx as I, Fragment as x } from "react/jsx-runtime";
import { pluginStore as E } from "./pluginStore.js";
import { createMetadataContext as X, toDeconstructedMethods as Y } from "./plugins.js";
import U, { memo as _, useState as C, useRef as D, useCallback as j, useEffect as L, useLayoutEffect as $, useMemo as Z } from "react";
import { getGlobalStore as b } from "./store.js";
import { useInView as V } from "react-intersection-observer";
import { v4 as q } from "uuid";
import { isDeepEqual as K } from "./utility.js";
import { runValidation as B } from "./validation.js";
const {
  getInitialOptions: tt,
  getShadowMetadata: yt,
  setShadowMetadata: et,
  getShadowValue: z,
  registerComponent: nt,
  unregisterComponent: ot,
  notifyPathSubscribers: rt,
  subscribeToPath: it
} = b.getState(), { stateHandlers: bt, notifyFormUpdate: P } = E.getState();
function at({
  formOpts: t,
  path: e,
  stateKey: r,
  children: i
}) {
  const { getInitialOptions: l, getShadowMetadata: c, getShadowValue: o } = b.getState(), m = l(r), w = c(r, e)?.validation, A = w?.status || "NOT_VALIDATED", g = (w?.errors || []).map((a) => ({
    ...a,
    path: e
  })), d = g.filter((a) => a.severity === "error").map((a) => a.message), s = g.filter((a) => a.severity === "warning").map((a) => a.message), M = d[0] || s[0], h = d.length > 0 ? "error" : s.length > 0 ? "warning" : void 0;
  return /* @__PURE__ */ I(x, { children: m?.formElements?.validation && !t?.validation?.disable ? m.formElements.validation({
    children: /* @__PURE__ */ I(U.Fragment, { children: i }, e.toString()),
    status: A,
    // Now passes the new ValidationStatus type
    message: t?.validation?.hideMessage ? "" : t?.validation?.message || M || "",
    severity: h,
    hasErrors: d.length > 0,
    hasWarnings: s.length > 0,
    allErrors: g,
    path: e,
    getData: () => o(r, e)
  }) : /* @__PURE__ */ I(U.Fragment, { children: i }, e.toString()) });
}
const Tt = _(
  ct,
  (t, e) => t.itemPath.join(".") === e.itemPath.join(".") && t.stateKey === e.stateKey && t.itemComponentId === e.itemComponentId && t.localIndex === e.localIndex
);
function ct({
  stateKey: t,
  itemComponentId: e,
  itemPath: r,
  localIndex: i,
  arraySetter: l,
  rebuildStateShape: c,
  renderFn: o
}) {
  const [, m] = C({}), { ref: f, inView: w } = V(), A = D(null), g = st(A), d = D(!1), s = [t, ...r].join(".");
  O(t, e, m);
  const M = j(
    (T) => {
      A.current = T, f(T);
    },
    [f]
  );
  L(() => {
    const T = it(s, (W) => {
      m({});
    });
    return () => T();
  }, [s]), L(() => {
    if (!w || !g || d.current)
      return;
    const T = A.current;
    if (T && T.offsetHeight > 0) {
      d.current = !0;
      const W = T.offsetHeight;
      et(t, r, {
        virtualizer: {
          itemHeight: W,
          domRef: T
        }
      });
      const F = r.slice(0, -1), N = [t, ...F].join(".");
      rt(N, {
        type: "ITEMHEIGHT",
        itemKey: r.join("."),
        ref: A.current
      });
    }
  }, [w, g, t, r]);
  const h = z(t, r);
  if (h === void 0)
    return null;
  const a = c({
    currentState: h,
    path: r,
    componentId: e
  }), R = o(a, i, l);
  return /* @__PURE__ */ I("div", { ref: M, children: R });
}
function Mt({
  stateKey: t,
  path: e,
  rebuildStateShape: r,
  renderFn: i,
  formOpts: l,
  setState: c
}) {
  const o = D(q()).current, [, m] = C({}), f = D(null), w = [t, ...e].join(".");
  O(t, o, m);
  const g = b.getState().getShadowNode(t, e)?._meta?.typeInfo, d = z(t, e), [s, M] = C(d), h = D(!1), a = D(null), R = Z(() => E.getState().getPluginConfigsForState(t).filter((n) => typeof n.plugin.formWrapper == "function"), [t]);
  L(() => {
    !h.current && !K(d, s) && M(d);
  }, [d]), L(() => {
    const { getShadowMetadata: n, setShadowMetadata: p } = b.getState(), u = n(t, e) || {};
    u.clientActivityState || (u.clientActivityState = { elements: /* @__PURE__ */ new Map() });
    const S = () => {
      const v = f.current;
      if (!v) return "input";
      const k = v.tagName.toLowerCase();
      if (k === "textarea") return "textarea";
      if (k === "select") return "select";
      if (k === "input") {
        const y = v.type;
        if (y === "checkbox") return "checkbox";
        if (y === "radio") return "radio";
        if (y === "range") return "range";
        if (y === "file") return "file";
      }
      return "input";
    };
    u.clientActivityState.elements.set(o, {
      domRef: f,
      elementType: S(),
      inputType: f.current?.type,
      mountedAt: Date.now()
    }), p(t, e, u);
    const H = b.getState().subscribeToPath(w, (v) => {
      !h.current && s !== v && m({});
    });
    return () => {
      H(), a.current && (clearTimeout(a.current), h.current = !1);
      const v = b.getState().getShadowMetadata(t, e);
      v?.clientActivityState?.elements && (v.clientActivityState.elements.delete(o), p(t, e, v));
    };
  }, []);
  const T = j(
    (n) => {
      g ? g.type === "number" && typeof n == "string" ? n = n === "" ? g.nullable ? null : g.default ?? 0 : Number(n) : g.type === "boolean" && typeof n == "string" ? n = n === "true" || n === "1" : g.type === "date" && typeof n == "string" && (n = new Date(n)) : typeof d === "number" && typeof n == "string" && (n = n === "" ? 0 : Number(n)), M(n);
      const { getShadowMetadata: p, setShadowMetadata: u } = b.getState(), S = p(t, e);
      if (S?.clientActivityState?.elements?.has(o)) {
        const y = S.clientActivityState.elements.get(o);
        y && y.currentActivity?.type === "focus" && (y.currentActivity.details = {
          ...y.currentActivity.details,
          value: n,
          previousValue: y.currentActivity.details?.value || d,
          inputLength: typeof n == "string" ? n.length : void 0,
          keystrokeCount: (y.currentActivity.details?.keystrokeCount || 0) + 1
        }, u(t, e, S));
      }
      const H = S?.clientActivityState?.elements?.get(o);
      P({
        stateKey: t,
        activityType: "input",
        // Changed from 'type'
        path: e,
        timestamp: Date.now(),
        details: {
          value: n,
          inputLength: typeof n == "string" ? n.length : void 0,
          isComposing: !1,
          // You'd need to track this from the actual input event
          isPasting: !1,
          // You'd need to track this from paste events
          keystrokeCount: (H?.currentActivity?.details?.keystrokeCount || 0) + 1
        }
      }), B({
        stateKey: t,
        path: e,
        newValue: n,
        updateType: "update"
      }, "onChange"), h.current = !0, a.current && clearTimeout(a.current);
      const k = l?.debounceTime ?? 200;
      a.current = setTimeout(() => {
        h.current = !1, c(n, e, {
          updateType: "update",
          validationTrigger: "onChange"
        });
      }, k);
    },
    [
      c,
      e,
      l?.debounceTime,
      g,
      d,
      t,
      o
    ]
  ), W = j(() => {
    const { getShadowMetadata: n, setShadowMetadata: p } = b.getState(), u = n(t, e);
    if (u?.clientActivityState?.elements?.has(o)) {
      const S = u.clientActivityState.elements.get(o);
      S.currentActivity = {
        type: "focus",
        startTime: Date.now(),
        details: {
          value: s,
          inputLength: typeof s == "string" ? s.length : void 0
        }
      }, p(t, e, u);
    }
    P({
      stateKey: t,
      activityType: "focus",
      // Changed from 'type'
      path: e,
      timestamp: Date.now(),
      details: {
        cursorPosition: f.current?.selectionStart
      }
    });
  }, [t, e, o, s]), F = j(() => {
    const { getShadowMetadata: n, setShadowMetadata: p } = b.getState();
    a.current && (clearTimeout(a.current), a.current = null, h.current = !1, c(s, e, {
      updateType: "update",
      validationTrigger: "onBlur"
    }));
    const u = n(t, e);
    if (u?.clientActivityState?.elements?.has(o)) {
      const v = u.clientActivityState.elements.get(o);
      v.currentActivity = void 0, p(t, e, u);
    }
    const S = u?.clientActivityState?.elements?.get(o)?.currentActivity?.startTime;
    P({
      stateKey: t,
      activityType: "blur",
      // Changed from 'type'
      path: e,
      timestamp: Date.now(),
      duration: S ? Date.now() - S : void 0,
      details: {
        duration: S ? Date.now() - S : 0
      }
    }), tt(t)?.validation?.onBlur && B({
      stateKey: t,
      path: e,
      newValue: s,
      updateType: "update"
    }, "onBlur");
  }, [s, c, e, t, o, d]), N = r({
    path: e,
    componentId: o,
    meta: void 0
  }), G = new Proxy(N, {
    get(n, p) {
      return p === "$inputProps" ? {
        value: s ?? "",
        onChange: (u) => {
          T(u.target.value);
        },
        onFocus: W,
        onBlur: F,
        ref: f
      } : n[p];
    }
  }), J = i(G), Q = R.reduceRight(
    (n, p, u) => /* @__PURE__ */ I(
      ut,
      {
        stateKey: t,
        path: e,
        pluginName: p.plugin.name,
        wrapperDepth: R.length - 1 - u,
        children: n
      }
    ),
    J
  );
  return /* @__PURE__ */ I(at, { formOpts: l, path: e, stateKey: t, children: Q });
}
function O(t, e, r) {
  const i = `${t}////${e}`;
  $(() => (nt(t, i, {
    forceUpdate: () => r({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    ot(t, i);
  }), [t, i]);
}
const st = (t) => {
  const [e, r] = C(!1);
  return $(() => {
    if (!t.current) {
      r(!0);
      return;
    }
    const i = Array.from(t.current.querySelectorAll("img"));
    if (i.length === 0) {
      r(!0);
      return;
    }
    let l = 0;
    const c = () => {
      l++, l === i.length && r(!0);
    };
    return i.forEach((o) => {
      o.complete ? c() : (o.addEventListener("load", c), o.addEventListener("error", c));
    }), () => {
      i.forEach((o) => {
        o.removeEventListener("load", c), o.removeEventListener("error", c);
      });
    };
  }, [t.current]), e;
};
function wt({
  stateKey: t,
  path: e,
  rebuildStateShape: r,
  renderFn: i
}) {
  const [l] = C(() => q()), [, c] = C({}), o = [t, ...e].join(".");
  O(t, l, c), L(() => {
    const f = b.getState().subscribeToPath(o, () => {
      c({});
    });
    return () => f();
  }, [o]);
  const m = r({
    path: e,
    componentId: l,
    meta: void 0
  });
  return /* @__PURE__ */ I(x, { children: i(m) });
}
const ut = _(function({
  children: e,
  stateKey: r,
  path: i,
  pluginName: l,
  wrapperDepth: c
}) {
  const [, o] = C({});
  L(() => {
    const M = [r, ...i].join(".");
    return b.getState().subscribeToPath(M, () => {
      o({});
    });
  }, [r, i]);
  const m = E.getState().registeredPlugins.find((M) => M.name === l), f = E.getState().stateHandlers.get(r), w = b.getState().getShadowNode(r, i)?._meta?.typeInfo, A = E.getState().pluginOptions.get(r)?.get(l), g = E.getState().getHookResult(r, l);
  if (!m?.formWrapper || !f)
    return /* @__PURE__ */ I(x, { children: e });
  const d = X(r, m.name), s = Y(f);
  return m.formWrapper({
    element: e,
    path: i,
    stateKey: r,
    pluginName: m.name,
    ...s,
    ...d,
    options: A,
    hookData: g,
    fieldType: w?.type,
    wrapperDepth: c
  });
});
export {
  Mt as FormElementWrapper,
  wt as IsolatedComponentWrapper,
  ct as ListItemWrapper,
  Tt as MemoizedCogsItemWrapper,
  at as ValidationWrapper,
  O as useRegisterComponent
};
//# sourceMappingURL=Components.jsx.map
