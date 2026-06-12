import { jsx as E, Fragment as B } from "react/jsx-runtime";
import { pluginStore as C } from "./pluginStore.js";
import { createScopedMetadataContext as $, toDeconstructedMethods as Q } from "./plugins.js";
import j, { memo as q, useState as F, useRef as N, useCallback as O, useEffect as P, useLayoutEffect as X, useMemo as Y } from "react";
import { getGlobalStore as M } from "./store.js";
import { useInView as Z } from "react-intersection-observer";
import { v4 as z } from "uuid";
import { isDeepEqual as V } from "./utility.js";
import { runValidation as _ } from "./validation.js";
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
  const { getInitialOptions: v, getShadowMetadata: b, getShadowValue: r } = M.getState(), s = v(o), y = b(o, t)?.validation, A = y?.status || "NOT_VALIDATED", g = (y?.errors || []).map((p) => ({
    ...p,
    path: t
  })), l = g.filter((p) => p.severity === "error").map((p) => p.message), i = g.filter((p) => p.severity === "warning").map((p) => p.message), T = l[0] || i[0], f = l.length > 0 ? "error" : i.length > 0 ? "warning" : void 0, { registeredPlugins: a } = C.getState(), h = {};
  return a.forEach((p) => {
    if (s && s.hasOwnProperty(p.name)) {
      const R = p.name, L = C.getState().getHookResult(o, R), W = $(
        o,
        R,
        t
      );
      h[R] = {
        hookData: L,
        getFieldMetaData: W.getFieldMetaData,
        setFieldMetaData: W.setFieldMetaData,
        removeFieldMetaData: W.removeFieldMetaData
      };
    }
  }), /* @__PURE__ */ E(B, { children: s?.formElements?.validation && !e?.validation?.disable ? s.formElements.validation({
    children: /* @__PURE__ */ E(j.Fragment, { children: c }, t.toString()),
    status: A,
    // Now passes the new ValidationStatus type
    message: e?.validation?.hideMessage ? "" : e?.validation?.message || T || "",
    severity: f,
    hasErrors: l.length > 0,
    hasWarnings: i.length > 0,
    allErrors: g,
    path: t,
    getData: () => r(o, t),
    plugins: h
  }) : /* @__PURE__ */ E(j.Fragment, { children: c }, t.toString()) });
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
  arraySetter: v,
  rebuildStateShape: b,
  renderFn: r
}) {
  const [, s] = F({}), { ref: m, inView: y } = Z(), A = N(null), g = [e, ...o].join(".");
  H(e, t, s);
  const l = O(
    (a) => {
      A.current = a, m(a);
    },
    [m]
  );
  P(() => {
    const a = nt(g, (h) => {
      s({});
    });
    return () => a();
  }, [g]);
  const i = G(e, o);
  if (i === void 0) return null;
  const T = b({
    currentState: i,
    path: o,
    componentId: t
  }), f = r(T, c, v);
  return j.isValidElement(f) ? j.cloneElement(f, {
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
  formOpts: v,
  setState: b
}) {
  const r = N(z()).current, [, s] = F({}), m = N(null), y = [e, ...t].join(".");
  H(e, r, s);
  const g = M.getState().getShadowNode(e, t)?._meta?.typeInfo, l = G(e, t), [i, T] = F(l), f = N(!1), a = N(null);
  P(() => {
    !f.current && !V(l, i) && T(l);
  }, [l]), P(() => {
    const { getShadowMetadata: n, setShadowMetadata: d } = M.getState();
    console.log("FormElementWrapper effect running for:", e, t);
    const u = n(e, t) || {};
    u.clientActivityState || (u.clientActivityState = { elements: /* @__PURE__ */ new Map() });
    const w = () => {
      const S = m.current;
      if (!S) return "input";
      const x = S.tagName.toLowerCase();
      if (x === "textarea") return "textarea";
      if (x === "select") return "select";
      if (x === "input") {
        const k = S.type;
        if (k === "checkbox") return "checkbox";
        if (k === "radio") return "radio";
        if (k === "range") return "range";
        if (k === "file") return "file";
      }
      return "input";
    };
    u.clientActivityState.elements.set(r, {
      domRef: m,
      elementType: w(),
      inputType: m.current?.type,
      mountedAt: Date.now()
    }), console.log("currentMeta", u), d(e, t, u);
    const D = M.getState().subscribeToPath(y, (S) => {
      !f.current && i !== S && s({});
    });
    return () => {
      D(), a.current && (clearTimeout(a.current), f.current = !1);
      const S = M.getState().getShadowMetadata(e, t);
      S?.clientActivityState?.elements && (S.clientActivityState.elements.delete(r), d(e, t, S));
    };
  }, []);
  const h = O(
    (n) => {
      const d = M.getState().getShadowNode(e, t)?._meta?.typeInfo ?? g;
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
      const S = D?.clientActivityState?.elements?.get(r);
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
          keystrokeCount: (S?.currentActivity?.details?.keystrokeCount || 0) + 1
        }
      }), _({
        stateKey: e,
        path: t,
        newValue: n,
        updateType: "update"
      }, "onChange"), f.current = !0, a.current && clearTimeout(a.current);
      const k = v?.debounceTime ?? 200;
      a.current = setTimeout(() => {
        f.current = !1, b(n, t, {
          updateType: "update",
          validationTrigger: "onChange"
        });
      }, k);
    },
    [
      b,
      t,
      v?.debounceTime,
      g,
      l,
      e,
      r
    ]
  ), p = O(() => {
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
        cursorPosition: m.current?.selectionStart
      }
    });
  }, [e, t, r, i]), R = O(() => {
    const { getShadowMetadata: n, setShadowMetadata: d } = M.getState();
    a.current && (clearTimeout(a.current), a.current = null, f.current = !1, b(i, t, {
      updateType: "update",
      validationTrigger: "onBlur"
    }));
    const u = n(e, t);
    if (u?.clientActivityState?.elements?.has(r)) {
      const S = u.clientActivityState.elements.get(r);
      S.currentActivity = void 0, d(e, t, u);
    }
    const w = u?.clientActivityState?.elements?.get(r)?.currentActivity?.startTime;
    U({
      stateKey: e,
      activityType: "blur",
      // Changed from 'type'
      path: t,
      timestamp: Date.now(),
      duration: w ? Date.now() - w : void 0,
      details: {
        duration: w ? Date.now() - w : 0
      }
    }), K(e)?.validation?.onBlur && _({
      stateKey: e,
      path: t,
      newValue: i,
      updateType: "update"
    }, "onBlur");
  }, [i, b, t, e, r, l]), L = o({
    path: t,
    componentId: r,
    meta: void 0
  }), W = new Proxy(L, {
    get(n, d) {
      return d === "$inputProps" ? {
        value: i ?? "",
        onChange: (u) => {
          h(u.target.value);
        },
        onFocus: p,
        onBlur: R,
        ref: m
      } : n[d];
    }
  }), J = c(W);
  return /* @__PURE__ */ E(ot, { formOpts: v, path: t, stateKey: e, children: J });
}
function H(e, t, o) {
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
  renderFn: v
}) {
  const [b] = F(() => z()), [, r] = F({});
  H(e, b, r);
  const s = Y(() => o && o.length > 0 ? o.map((y) => [e, ...y.$_path].join(".")) : [[e, ...t].join(".")], [e, t, o]);
  P(() => {
    const y = M.getState(), A = s.map((g) => y.subscribeToPath(g, () => {
      r({});
    }));
    return () => {
      A.forEach((g) => g());
    };
  }, [s]);
  const m = c({
    path: t,
    componentId: b,
    meta: void 0
  });
  return /* @__PURE__ */ E(B, { children: v(m) });
}
q(function({
  children: t,
  stateKey: o,
  path: c,
  pluginName: v,
  wrapperDepth: b
}) {
  const [, r] = F({});
  P(() => {
    const T = [o, ...c].join(".");
    return M.getState().subscribeToPath(T, () => {
      r({});
    });
  }, [o, c]);
  const s = C.getState().registeredPlugins.find((T) => T.name === v), m = C.getState().stateHandlers.get(o), y = M.getState().getShadowNode(o, c)?._meta?.typeInfo, A = C.getState().pluginOptions.get(o)?.get(v), g = C.getState().getHookResult(o, v);
  if (!s?.formWrapper || !m)
    return /* @__PURE__ */ E(B, { children: t });
  const l = Q(m), i = $(
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
    hookData: g,
    fieldType: y?.type,
    wrapperDepth: b
  });
});
export {
  Mt as FormElementWrapper,
  yt as IsolatedComponentWrapper,
  rt as ListItemWrapper,
  bt as MemoizedCogsItemWrapper,
  ot as ValidationWrapper,
  H as useRegisterComponent
};
//# sourceMappingURL=Components.js.map
