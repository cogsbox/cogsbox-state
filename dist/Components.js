import { jsx as E, Fragment as H } from "react/jsx-runtime";
import { pluginStore as C } from "./pluginStore.js";
import { createScopedMetadataContext as $, toDeconstructedMethods as Q } from "./plugins.js";
import L, { memo as q, useState as F, useRef as N, useCallback as j, useEffect as P, useLayoutEffect as X, useMemo as Y } from "react";
import { getGlobalStore as M } from "./store.js";
import { useInView as Z } from "react-intersection-observer";
import { v4 as z } from "uuid";
import { isDeepEqual as V } from "./utility.js";
import { runValidation as B } from "./validation.js";
const {
  getInitialOptions: K,
  getShadowMetadata: ft,
  setShadowMetadata: pt,
  getShadowValue: G,
  registerComponent: tt,
  unregisterComponent: et,
  notifyPathSubscribers: St,
  subscribeToPath: nt
} = M.getState(), { stateHandlers: vt, notifyFormUpdate: U } = C.getState();
function ot({
  formOpts: e,
  path: t,
  stateKey: o,
  children: c
}) {
  const { getInitialOptions: S, getShadowMetadata: v, getShadowValue: r } = M.getState(), s = S(o), y = v(o, t)?.validation, A = y?.status || "NOT_VALIDATED", m = (y?.errors || []).map((p) => ({
    ...p,
    path: t
  })), l = m.filter((p) => p.severity === "error").map((p) => p.message), i = m.filter((p) => p.severity === "warning").map((p) => p.message), T = l[0] || i[0], f = l.length > 0 ? "error" : i.length > 0 ? "warning" : void 0, { registeredPlugins: a } = C.getState(), h = {};
  return a.forEach((p) => {
    if (s && s.hasOwnProperty(p.name)) {
      const R = p.name, O = C.getState().getHookResult(o, R), W = $(
        o,
        R,
        t
      );
      h[R] = {
        hookData: O,
        getFieldMetaData: W.getFieldMetaData,
        setFieldMetaData: W.setFieldMetaData,
        removeFieldMetaData: W.removeFieldMetaData
      };
    }
  }), /* @__PURE__ */ E(H, { children: s?.formElements?.validation && !e?.validation?.disable ? s.formElements.validation({
    children: /* @__PURE__ */ E(L.Fragment, { children: c }, t.toString()),
    status: A,
    // Now passes the new ValidationStatus type
    message: e?.validation?.hideMessage ? "" : e?.validation?.message || T || "",
    severity: f,
    hasErrors: l.length > 0,
    hasWarnings: i.length > 0,
    allErrors: m,
    path: t,
    getData: () => r(o, t),
    plugins: h
  }) : /* @__PURE__ */ E(L.Fragment, { children: c }, t.toString()) });
}
const bt = q(
  rt,
  (e, t) => e.itemPath.join(".") === t.itemPath.join(".") && e.stateKey === t.stateKey && e.itemComponentId === t.itemComponentId && e.localIndex === t.localIndex
);
function rt({
  stateKey: e,
  itemComponentId: t,
  itemPath: o,
  localIndex: c,
  arraySetter: S,
  rebuildStateShape: v,
  renderFn: r
}) {
  const [, s] = F({}), { ref: g, inView: y } = Z(), A = N(null), m = [e, ...o].join(".");
  _(e, t, s);
  const l = j(
    (a) => {
      A.current = a, g(a);
    },
    [g]
  );
  P(() => {
    const a = nt(m, (h) => {
      s({});
    });
    return () => a();
  }, [m]);
  const i = G(e, o);
  if (i === void 0) return null;
  const T = v({
    currentState: i,
    path: o,
    componentId: t
  }), f = r(T, c, S);
  return L.isValidElement(f) ? L.cloneElement(f, {
    ref: (a) => {
      l(a);
      const { ref: h } = f;
      typeof h == "function" ? h(a) : h && "current" in h && (h.current = a);
    }
  }) : /* @__PURE__ */ E("div", { ref: l, children: f });
}
function Mt({
  stateKey: e,
  path: t,
  rebuildStateShape: o,
  renderFn: c,
  formOpts: S,
  setState: v
}) {
  const r = N(z()).current, [, s] = F({}), g = N(null), y = [e, ...t].join(".");
  _(e, r, s);
  const m = M.getState().getShadowNode(e, t)?._meta?.typeInfo, l = G(e, t), [i, T] = F(l), f = N(!1), a = N(null);
  P(() => {
    !f.current && !V(l, i) && T(l);
  }, [l]), P(() => {
    const { getShadowMetadata: n, setShadowMetadata: d } = M.getState();
    console.log("FormElementWrapper effect running for:", e, t);
    const u = n(e, t) || {};
    u.clientActivityState || (u.clientActivityState = { elements: /* @__PURE__ */ new Map() });
    const w = () => {
      const b = g.current;
      if (!b) return "input";
      const x = b.tagName.toLowerCase();
      if (x === "textarea") return "textarea";
      if (x === "select") return "select";
      if (x === "input") {
        const k = b.type;
        if (k === "checkbox") return "checkbox";
        if (k === "radio") return "radio";
        if (k === "range") return "range";
        if (k === "file") return "file";
      }
      return "input";
    };
    u.clientActivityState.elements.set(r, {
      domRef: g,
      elementType: w(),
      inputType: g.current?.type,
      mountedAt: Date.now()
    }), console.log("currentMeta", u), d(e, t, u);
    const D = M.getState().subscribeToPath(y, (b) => {
      !f.current && i !== b && s({});
    });
    return () => {
      D(), a.current && (clearTimeout(a.current), f.current = !1);
      const b = M.getState().getShadowMetadata(e, t);
      b?.clientActivityState?.elements && (b.clientActivityState.elements.delete(r), d(e, t, b));
    };
  }, []);
  const h = j(
    (n) => {
      const d = M.getState().getShadowNode(e, t)?._meta?.typeInfo ?? m;
      d ? d.type === "number" && typeof n == "string" ? n = n === "" ? d.nullable ? null : d.default ?? 0 : Number(n) : d.type === "boolean" && typeof n == "string" ? n = n === "true" || n === "1" : d.type === "date" && typeof n == "string" && (n = new Date(n)) : typeof l === "number" && typeof n == "string" && (n = n === "" ? 0 : Number(n)), T(n);
      const { getShadowMetadata: u, setShadowMetadata: w } = M.getState(), D = u(e, t);
      if (D?.clientActivityState?.elements?.has(r)) {
        const I = D.clientActivityState.elements.get(r);
        I && I.currentActivity?.type === "focus" && (I.currentActivity.details = {
          ...I.currentActivity.details,
          value: n,
          previousValue: I.currentActivity.details?.value || l,
          inputLength: typeof n == "string" ? n.length : void 0,
          keystrokeCount: (I.currentActivity.details?.keystrokeCount || 0) + 1
        }, w(e, t, D));
      }
      const b = D?.clientActivityState?.elements?.get(r);
      U({
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
          keystrokeCount: (b?.currentActivity?.details?.keystrokeCount || 0) + 1
        }
      }), B({
        stateKey: e,
        path: t,
        newValue: n,
        updateType: "update"
      }, "onChange"), f.current = !0, a.current && clearTimeout(a.current);
      const k = S?.debounceTime ?? 200;
      a.current = setTimeout(() => {
        f.current = !1, v(n, t, {
          updateType: "update",
          validationTrigger: "onChange"
        });
      }, k);
    },
    [
      v,
      t,
      S?.debounceTime,
      m,
      l,
      e,
      r
    ]
  ), p = j(() => {
    const { getShadowMetadata: n, setShadowMetadata: d } = M.getState(), u = n(e, t);
    if (u?.clientActivityState?.elements?.has(r)) {
      const w = u.clientActivityState.elements.get(r);
      w.currentActivity = {
        type: "focus",
        startTime: Date.now(),
        details: {
          value: i,
          inputLength: typeof i == "string" ? i.length : void 0
        }
      }, d(e, t, u);
    }
    U({
      stateKey: e,
      activityType: "focus",
      // Changed from 'type'
      path: t,
      timestamp: Date.now(),
      details: {
        cursorPosition: g.current?.selectionStart
      }
    });
  }, [e, t, r, i]), R = j(() => {
    const { getShadowMetadata: n, setShadowMetadata: d } = M.getState();
    a.current && (clearTimeout(a.current), a.current = null, f.current = !1, v(i, t, { updateType: "update" }));
    const u = n(e, t);
    if (u?.clientActivityState?.elements?.has(r)) {
      const b = u.clientActivityState.elements.get(r);
      b.currentActivity = void 0, d(e, t, u);
    }
    const w = u?.clientActivityState?.elements?.get(r)?.currentActivity?.startTime;
    K(e)?.validation?.onBlur && B(
      {
        stateKey: e,
        path: t,
        newValue: i,
        updateType: "update"
      },
      "onBlur"
    ), U({
      stateKey: e,
      activityType: "blur",
      path: t,
      timestamp: Date.now(),
      duration: w ? Date.now() - w : void 0,
      details: {
        duration: w ? Date.now() - w : 0
      }
    });
  }, [i, v, t, e, r, l]), O = o({
    path: t,
    componentId: r,
    meta: void 0
  }), W = new Proxy(O, {
    get(n, d) {
      return d === "$inputProps" ? {
        value: i ?? "",
        onChange: (u) => {
          h(u.target.value);
        },
        onFocus: p,
        onBlur: R,
        ref: g
      } : n[d];
    }
  }), J = c(W);
  return /* @__PURE__ */ E(ot, { formOpts: S, path: t, stateKey: e, children: J });
}
function _(e, t, o) {
  const c = `${e}////${t}`;
  X(() => (tt(e, c, {
    forceUpdate: () => o({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    et(e, c);
  }), [e, c]);
}
function yt({
  stateKey: e,
  path: t,
  // The path of the parent node (e.g. ['form'])
  dependencies: o,
  // NEW: Optional array of Proxy objects or path arrays
  rebuildStateShape: c,
  renderFn: S
}) {
  const [v] = F(() => z()), [, r] = F({});
  _(e, v, r);
  const s = Y(() => o && o.length > 0 ? o.map((y) => [e, ...y.$_path].join(".")) : [[e, ...t].join(".")], [e, t, o]);
  P(() => {
    const y = M.getState(), A = s.map((m) => y.subscribeToPath(m, () => {
      r({});
    }));
    return () => {
      A.forEach((m) => m());
    };
  }, [s]);
  const g = c({
    path: t,
    componentId: v,
    meta: void 0
  });
  return /* @__PURE__ */ E(H, { children: S(g) });
}
q(function({
  children: t,
  stateKey: o,
  path: c,
  pluginName: S,
  wrapperDepth: v
}) {
  const [, r] = F({});
  P(() => {
    const T = [o, ...c].join(".");
    return M.getState().subscribeToPath(T, () => {
      r({});
    });
  }, [o, c]);
  const s = C.getState().registeredPlugins.find((T) => T.name === S), g = C.getState().stateHandlers.get(o), y = M.getState().getShadowNode(o, c)?._meta?.typeInfo, A = C.getState().pluginOptions.get(o)?.get(S), m = C.getState().getHookResult(o, S);
  if (!s?.formWrapper || !g)
    return /* @__PURE__ */ E(H, { children: t });
  const l = Q(g), i = $(
    o,
    s.name,
    c
  );
  return s.formWrapper({
    element: t,
    path: c,
    stateKey: o,
    pluginName: s.name,
    ...l,
    ...i,
    options: A,
    hookData: m,
    fieldType: y?.type,
    wrapperDepth: v
  });
});
export {
  Mt as FormElementWrapper,
  yt as IsolatedComponentWrapper,
  rt as ListItemWrapper,
  bt as MemoizedCogsItemWrapper,
  ot as ValidationWrapper,
  _ as useRegisterComponent
};
//# sourceMappingURL=Components.js.map
