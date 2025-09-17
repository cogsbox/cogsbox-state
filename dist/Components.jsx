import { jsx as I, Fragment as N } from "react/jsx-runtime";
import { pluginStore as C } from "./pluginStore.js";
import { createMetadataContext as Q, toDeconstructedMethods as X } from "./plugins.js";
import U, { memo as _, useState as M, useRef as R, useCallback as y, useEffect as w, useLayoutEffect as k, useMemo as Y } from "react";
import { getGlobalStore as b } from "./store.js";
import { useInView as Z } from "react-intersection-observer";
import { v4 as x } from "uuid";
import { isDeepEqual as V } from "./utility.js";
import { runValidation as B } from "./validation.js";
const {
  getInitialOptions: K,
  getShadowMetadata: be,
  setShadowMetadata: j,
  getShadowValue: A,
  registerComponent: ee,
  unregisterComponent: te,
  notifyPathSubscribers: D,
  subscribeToPath: ne
} = b.getState(), { stateHandlers: ve, notifyFormUpdate: O } = C.getState();
function oe({
  formOpts: e,
  path: t,
  stateKey: o,
  children: r
}) {
  const { getInitialOptions: c, getShadowMetadata: a, getShadowValue: s } = b.getState(), d = c(o), E = a(o, t)?.validation, T = E?.status || "NOT_VALIDATED", u = (E?.errors || []).map((i) => ({
    ...i,
    path: t
  })), f = u.filter((i) => i.severity === "error").map((i) => i.message), l = u.filter((i) => i.severity === "warning").map((i) => i.message), v = f[0] || l[0], m = f.length > 0 ? "error" : l.length > 0 ? "warning" : void 0;
  return /* @__PURE__ */ I(N, { children: d?.formElements?.validation && !e?.validation?.disable ? d.formElements.validation({
    children: /* @__PURE__ */ I(U.Fragment, { children: r }, t.toString()),
    status: T,
    // Now passes the new ValidationStatus type
    message: e?.validation?.hideMessage ? "" : e?.validation?.message || v || "",
    severity: m,
    hasErrors: f.length > 0,
    hasWarnings: l.length > 0,
    allErrors: u,
    path: t,
    getData: () => s(o, t)
  }) : /* @__PURE__ */ I(U.Fragment, { children: r }, t.toString()) });
}
const he = _(
  re,
  (e, t) => e.itemPath.join(".") === t.itemPath.join(".") && e.stateKey === t.stateKey && e.itemComponentId === t.itemComponentId && e.localIndex === t.localIndex
);
function re({
  stateKey: e,
  itemComponentId: t,
  itemPath: o,
  localIndex: r,
  arraySetter: c,
  rebuildStateShape: a,
  renderFn: s
}) {
  const [, d] = M({}), { ref: g, inView: E } = Z(), T = R(null), u = ie(T), f = R(!1), l = [e, ...o].join(".");
  P(e, t, d);
  const v = y(
    (p) => {
      T.current = p, g(p);
    },
    [g]
  );
  w(() => {
    const p = ne(l, (W) => {
      d({});
    });
    return () => p();
  }, [l]), w(() => {
    if (!E || !u || f.current)
      return;
    const p = T.current;
    if (p && p.offsetHeight > 0) {
      f.current = !0;
      const W = p.offsetHeight;
      j(e, o, {
        virtualizer: {
          itemHeight: W,
          domRef: p
        }
      });
      const F = o.slice(0, -1), H = [e, ...F].join(".");
      D(H, {
        type: "ITEMHEIGHT",
        itemKey: o.join("."),
        ref: T.current
      });
    }
  }, [E, u, e, o]);
  const m = A(e, o);
  if (m === void 0)
    return null;
  const i = a({
    currentState: m,
    path: o,
    componentId: t
  }), L = s(i, r, c);
  return /* @__PURE__ */ I("div", { ref: v, children: L });
}
function Ee({
  stateKey: e,
  path: t,
  rebuildStateShape: o,
  renderFn: r,
  formOpts: c,
  setState: a
}) {
  const s = R(x()).current, [, d] = M({}), g = R(null), E = [e, ...t].join(".");
  P(e, s, d);
  const u = b.getState().getShadowNode(e, t)?._meta?.typeInfo;
  u?.schema;
  const f = A(e, t), [l, v] = M(f), m = R(!1), i = R(null), L = Y(() => C.getState().getPluginConfigsForState(e).filter((n) => typeof n.plugin.formWrapper == "function"), [e]);
  w(() => {
    !m.current && !V(f, l) && v(f);
  }, [f]), w(() => {
    const { setShadowMetadata: n } = b.getState();
    n(e, t, { formRef: g });
    const S = b.getState().subscribeToPath(E, (h) => {
      !m.current && l !== h && d({});
    });
    return () => {
      S(), i.current && (clearTimeout(i.current), m.current = !1);
      const h = b.getState().getShadowMetadata(e, t);
      h && h.formRef && n(e, t, { formRef: void 0 });
    };
  }, []);
  const p = y(
    (n) => {
      u ? u.type === "number" && typeof n == "string" ? n = n === "" ? u.nullable ? null : u.default ?? 0 : Number(n) : u.type === "boolean" && typeof n == "string" ? n = n === "true" || n === "1" : u.type === "date" && typeof n == "string" && (n = new Date(n)) : typeof f === "number" && typeof n == "string" && (n = n === "" ? 0 : Number(n)), v(n), O({
        stateKey: e,
        type: "input",
        path: t,
        value: n
      }), B({
        stateKey: e,
        path: t,
        newValue: n,
        updateType: "update"
      }, "onChange"), m.current = !0, i.current && clearTimeout(i.current);
      const h = c?.debounceTime ?? 200;
      i.current = setTimeout(() => {
        m.current = !1, a(n, t, {
          updateType: "update",
          validationTrigger: "onChange"
        });
      }, h);
    },
    [a, t, c?.debounceTime, u, f]
  ), W = `${e}.__focusedElement`, F = { path: t, ref: g }, H = y(() => {
    const n = b.getState().getShadowMetadata(e, []) || {};
    j(e, [], {
      ...n,
      focusedElement: { path: t, ref: g }
    }), D(W, F), O({
      stateKey: e,
      type: "focus",
      path: t,
      value: l
    });
  }, [e, t, g]), $ = y(() => {
    i.current && (clearTimeout(i.current), i.current = null, m.current = !1, a(l, t, {
      updateType: "update",
      validationTrigger: "onBlur"
    })), queueMicrotask(() => {
      const S = b.getState().getShadowMetadata(e, []) || {};
      S.focusedElement && JSON.stringify(S.focusedElement.path) === JSON.stringify(t) && (j(e, [], {
        focusedElement: null
      }), D(W, null), O({
        stateKey: e,
        type: "blur",
        path: t,
        value: l
      }));
    }), K(e)?.validation?.onBlur && B({
      stateKey: e,
      path: t,
      newValue: l,
      // Use the current value from the input's state
      updateType: "update"
    }, "onBlur");
  }, [l, a, t, e]), q = o({
    path: t,
    componentId: s,
    meta: void 0
  }), z = new Proxy(q, {
    get(n, S) {
      return S === "$inputProps" ? {
        value: l ?? "",
        onChange: (h) => {
          p(h.target.value);
        },
        onFocus: H,
        onBlur: $,
        ref: g
      } : n[S];
    }
  }), G = r(z), J = L.reduceRight(
    (n, S, h) => /* @__PURE__ */ I(
      ae,
      {
        stateKey: e,
        path: t,
        pluginName: S.plugin.name,
        wrapperDepth: L.length - 1 - h,
        children: n
      }
    ),
    G
  );
  return /* @__PURE__ */ I(oe, { formOpts: c, path: t, stateKey: e, children: J });
}
function P(e, t, o) {
  const r = `${e}////${t}`;
  k(() => (ee(e, r, {
    forceUpdate: () => o({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    te(e, r);
  }), [e, r]);
}
const ie = (e) => {
  const [t, o] = M(!1);
  return k(() => {
    if (!e.current) {
      o(!0);
      return;
    }
    const r = Array.from(e.current.querySelectorAll("img"));
    if (r.length === 0) {
      o(!0);
      return;
    }
    let c = 0;
    const a = () => {
      c++, c === r.length && o(!0);
    };
    return r.forEach((s) => {
      s.complete ? a() : (s.addEventListener("load", a), s.addEventListener("error", a));
    }), () => {
      r.forEach((s) => {
        s.removeEventListener("load", a), s.removeEventListener("error", a);
      });
    };
  }, [e.current]), t;
};
function Te({
  stateKey: e,
  path: t,
  rebuildStateShape: o,
  renderFn: r
}) {
  const [c] = M(() => x()), [, a] = M({}), s = [e, ...t].join(".");
  P(e, c, a), w(() => {
    const g = b.getState().subscribeToPath(s, () => {
      a({});
    });
    return () => g();
  }, [s]);
  const d = o({
    path: t,
    componentId: c,
    meta: void 0
  });
  return /* @__PURE__ */ I(N, { children: r(d) });
}
const ae = _(function({
  children: t,
  stateKey: o,
  path: r,
  pluginName: c,
  wrapperDepth: a
}) {
  const [, s] = M({});
  w(() => {
    const v = [o, ...r].join(".");
    return b.getState().subscribeToPath(v, () => {
      s({});
    });
  }, [o, r]);
  const d = C.getState().registeredPlugins.find((v) => v.name === c), g = C.getState().stateHandlers.get(o), E = b.getState().getShadowNode(o, r)?._meta?.typeInfo, T = C.getState().pluginOptions.get(o)?.get(c), u = C.getState().getHookResult(o, c);
  if (!d?.formWrapper || !g)
    return /* @__PURE__ */ I(N, { children: t });
  const f = Q(o, d.name), l = X(g);
  return d.formWrapper({
    element: t,
    path: r,
    stateKey: o,
    pluginName: d.name,
    ...l,
    ...f,
    options: T,
    hookData: u,
    fieldType: E?.type,
    wrapperDepth: a
  });
});
export {
  Ee as FormElementWrapper,
  Te as IsolatedComponentWrapper,
  re as ListItemWrapper,
  he as MemoizedCogsItemWrapper,
  oe as ValidationWrapper,
  P as useRegisterComponent
};
//# sourceMappingURL=Components.jsx.map
