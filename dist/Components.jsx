import { jsx as T, Fragment as _ } from "react/jsx-runtime";
import { pluginStore as R } from "./pluginStore.js";
import { createMetadataContext as te, toDeconstructedMethods as ne } from "./plugins.js";
import x, { memo as $, useState as w, useRef as L, useCallback as N, useEffect as D, useLayoutEffect as q, useMemo as re } from "react";
import { getGlobalStore as v } from "./store.js";
import { useInView as oe } from "react-intersection-observer";
import { v4 as V } from "uuid";
import { isDeepEqual as se } from "./utility.js";
const {
  getInitialOptions: ie,
  getShadowMetadata: ae,
  setShadowMetadata: j,
  getShadowValue: z,
  registerComponent: ce,
  unregisterComponent: ue,
  notifyPathSubscribers: O,
  subscribeToPath: le
} = v.getState(), { stateHandlers: Ce, notifyFormUpdate: U } = R.getState();
function de({
  formOpts: e,
  path: t,
  stateKey: r,
  children: o
}) {
  const { getInitialOptions: c, getShadowMetadata: s, getShadowValue: i } = v.getState(), d = c(r), I = s(r, t)?.validation, E = I?.status || "NOT_VALIDATED", u = (I?.errors || []).map((a) => ({
    ...a,
    path: t
  })), p = u.filter((a) => a.severity === "error").map((a) => a.message), g = u.filter((a) => a.severity === "warning").map((a) => a.message), l = p[0] || g[0], M = p.length > 0 ? "error" : g.length > 0 ? "warning" : void 0;
  return /* @__PURE__ */ T(_, { children: d?.formElements?.validation && !e?.validation?.disable ? d.formElements.validation({
    children: /* @__PURE__ */ T(x.Fragment, { children: o }, t.toString()),
    status: E,
    // Now passes the new ValidationStatus type
    message: e?.validation?.hideMessage ? "" : e?.validation?.message || l || "",
    severity: M,
    hasErrors: p.length > 0,
    hasWarnings: g.length > 0,
    allErrors: u,
    path: t,
    getData: () => i(r, t)
  }) : /* @__PURE__ */ T(x.Fragment, { children: o }, t.toString()) });
}
const we = $(
  fe,
  (e, t) => e.itemPath.join(".") === t.itemPath.join(".") && e.stateKey === t.stateKey && e.itemComponentId === t.itemComponentId && e.localIndex === t.localIndex
);
function fe({
  stateKey: e,
  itemComponentId: t,
  itemPath: r,
  localIndex: o,
  arraySetter: c,
  rebuildStateShape: s,
  renderFn: i
}) {
  const [, d] = w({}), { ref: m, inView: I } = oe(), E = L(null), u = ge(E), p = L(!1), g = [e, ...r].join(".");
  k(e, t, d);
  const l = N(
    (S) => {
      E.current = S, m(S);
    },
    [m]
  );
  D(() => {
    const S = le(g, (C) => {
      d({});
    });
    return () => S();
  }, [g]), D(() => {
    if (!I || !u || p.current)
      return;
    const S = E.current;
    if (S && S.offsetHeight > 0) {
      p.current = !0;
      const C = S.offsetHeight;
      j(e, r, {
        virtualizer: {
          itemHeight: C,
          domRef: S
        }
      });
      const A = r.slice(0, -1), P = [e, ...A].join(".");
      O(P, {
        type: "ITEMHEIGHT",
        itemKey: r.join("."),
        ref: E.current
      });
    }
  }, [I, u, e, r]);
  const M = z(e, r);
  if (M === void 0)
    return null;
  const a = s({
    currentState: M,
    path: r,
    componentId: t
  }), b = i(a, o, c);
  return /* @__PURE__ */ T("div", { ref: l, children: b });
}
function Re({
  stateKey: e,
  path: t,
  rebuildStateShape: r,
  renderFn: o,
  formOpts: c,
  setState: s
}) {
  const i = L(V()).current, [, d] = w({}), m = L(null), I = [e, ...t].join(".");
  k(e, i, d);
  const u = v.getState().getShadowNode(e, t)?._meta?.typeInfo, p = u?.schema, g = z(e, t), [l, M] = w(g), a = L(!1), b = L(null), S = re(() => R.getState().getPluginConfigsForState(e).filter((n) => typeof n.plugin.formWrapper == "function"), [e]);
  D(() => {
    !a.current && !se(g, l) && M(g);
  }, [g]), D(() => {
    const { setShadowMetadata: n } = v.getState();
    n(e, t, { formRef: m });
    const h = v.getState().subscribeToPath(I, (f) => {
      !a.current && l !== f && d({});
    });
    return () => {
      h(), b.current && (clearTimeout(b.current), a.current = !1);
      const f = v.getState().getShadowMetadata(e, t);
      f && f.formRef && n(e, t, { formRef: void 0 });
    };
  }, []);
  const C = N(
    (n, h) => {
      const f = ie(e)?.validation;
      if (!f) return;
      const y = ae(e, t) || {}, ee = y?.validation?.status;
      console.log("currentMeta", p, y, f);
      let W = !1, B;
      if (h === "onBlur" && f.onBlur ? (W = !0, B = f.onBlur ?? "error") : h === "onChange" && (f.onChange ? (W = !0, B = f.onChange) : ee === "INVALID" && (W = !0, B = "warning")), console.log(
        "fieldSchemafieldSchemafieldSchemafieldSchema shouldValidate",
        p,
        W
      ), !W || !p)
        return;
      let F = null;
      const H = p.safeParse(n);
      console.log("resultresultresultresultresultresult", H), H.success ? F = { success: !0 } : F = {
        success: !1,
        message: ("issues" in H.error ? H.error.issues : H.error.errors)[0]?.message || "Invalid value"
      }, F && (F.success ? j(e, t, {
        ...y,
        validation: {
          status: "VALID",
          errors: [],
          lastValidated: Date.now(),
          validatedValue: n
        }
      }) : j(e, t, {
        ...y,
        validation: {
          status: "INVALID",
          errors: [
            {
              source: "client",
              message: F.message,
              severity: B
            }
          ],
          lastValidated: Date.now(),
          validatedValue: n
        }
      })), d({});
    },
    [e, t, p]
  ), A = N(
    (n) => {
      u ? u.type === "number" && typeof n == "string" ? n = n === "" ? u.nullable ? null : u.default ?? 0 : Number(n) : u.type === "boolean" && typeof n == "string" ? n = n === "true" || n === "1" : u.type === "date" && typeof n == "string" && (n = new Date(n)) : typeof g === "number" && typeof n == "string" && (n = n === "" ? 0 : Number(n)), M(n), U({
        stateKey: e,
        type: "input",
        path: t,
        value: n
      }), C(n, "onChange"), a.current = !0, b.current && clearTimeout(b.current);
      const h = c?.debounceTime ?? 200;
      b.current = setTimeout(() => {
        a.current = !1, s(n, t, { updateType: "update" });
      }, h);
    },
    [
      s,
      t,
      c?.debounceTime,
      C,
      u,
      g
    ]
  ), P = `${e}.__focusedElement`, G = { path: t, ref: m }, J = N(() => {
    const n = v.getState().getShadowMetadata(e, []) || {};
    j(e, [], {
      ...n,
      focusedElement: { path: t, ref: m }
    }), O(P, G), U({
      stateKey: e,
      type: "focus",
      path: t,
      value: l
    });
  }, [e, t, m]), Q = N(() => {
    b.current && (clearTimeout(b.current), b.current = null, a.current = !1, s(l, t, { updateType: "update" })), console.log("handleBlur"), queueMicrotask(() => {
      const n = v.getState().getShadowMetadata(e, []) || {};
      n.focusedElement && JSON.stringify(n.focusedElement.path) === JSON.stringify(t) && (j(e, [], {
        focusedElement: null
      }), O(P, null), U({
        stateKey: e,
        type: "blur",
        path: t,
        value: l
      }));
    }), console.log("handleBlur", l), C(l, "onBlur");
  }, [l, s, t, C, e]), X = r({
    path: t,
    componentId: i,
    meta: void 0
  }), Y = new Proxy(X, {
    get(n, h) {
      return h === "$inputProps" ? {
        value: l ?? "",
        onChange: (f) => {
          A(f.target.value);
        },
        onFocus: J,
        onBlur: Q,
        ref: m
      } : n[h];
    }
  }), Z = o(Y), K = S.reduceRight(
    (n, h, f) => /* @__PURE__ */ T(
      me,
      {
        stateKey: e,
        path: t,
        pluginName: h.plugin.name,
        wrapperDepth: S.length - 1 - f,
        children: n
      }
    ),
    Z
  );
  return /* @__PURE__ */ T(de, { formOpts: c, path: t, stateKey: e, children: K });
}
function k(e, t, r) {
  const o = `${e}////${t}`;
  q(() => (ce(e, o, {
    forceUpdate: () => r({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    ue(e, o);
  }), [e, o]);
}
const ge = (e) => {
  const [t, r] = w(!1);
  return q(() => {
    if (!e.current) {
      r(!0);
      return;
    }
    const o = Array.from(e.current.querySelectorAll("img"));
    if (o.length === 0) {
      r(!0);
      return;
    }
    let c = 0;
    const s = () => {
      c++, c === o.length && r(!0);
    };
    return o.forEach((i) => {
      i.complete ? s() : (i.addEventListener("load", s), i.addEventListener("error", s));
    }), () => {
      o.forEach((i) => {
        i.removeEventListener("load", s), i.removeEventListener("error", s);
      });
    };
  }, [e.current]), t;
};
function Le({
  stateKey: e,
  path: t,
  rebuildStateShape: r,
  renderFn: o
}) {
  const [c] = w(() => V()), [, s] = w({}), i = [e, ...t].join(".");
  k(e, c, s), D(() => {
    const m = v.getState().subscribeToPath(i, () => {
      s({});
    });
    return () => m();
  }, [i]);
  const d = r({
    path: t,
    componentId: c,
    meta: void 0
  });
  return /* @__PURE__ */ T(_, { children: o(d) });
}
const me = $(function({
  children: t,
  stateKey: r,
  path: o,
  pluginName: c,
  wrapperDepth: s
}) {
  const [, i] = w({});
  D(() => {
    const l = [r, ...o].join(".");
    return v.getState().subscribeToPath(l, () => {
      i({});
    });
  }, [r, o]);
  const d = R.getState().registeredPlugins.find((l) => l.name === c), m = R.getState().stateHandlers.get(r), I = v.getState().getShadowNode(r, o)?._meta?.typeInfo, E = R.getState().pluginOptions.get(r)?.get(c), u = R.getState().getHookResult(r, c);
  if (!d?.formWrapper || !m)
    return /* @__PURE__ */ T(_, { children: t });
  const p = te(r, d.name), g = ne(m);
  return d.formWrapper({
    element: t,
    path: o,
    stateKey: r,
    pluginName: d.name,
    ...g,
    ...p,
    options: E,
    hookData: u,
    fieldType: I?.type,
    wrapperDepth: s
  });
});
export {
  Re as FormElementWrapper,
  Le as IsolatedComponentWrapper,
  fe as ListItemWrapper,
  we as MemoizedCogsItemWrapper,
  de as ValidationWrapper,
  k as useRegisterComponent
};
//# sourceMappingURL=Components.jsx.map
