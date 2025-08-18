import { jsx as w, Fragment as x } from "react/jsx-runtime";
import U, { memo as _, useState as p, useRef as j, useCallback as J, useEffect as C, useLayoutEffect as B } from "react";
import { getGlobalStore as b, formRefStore as Q } from "./store.js";
import { useInView as X } from "react-intersection-observer";
import { v4 as G } from "uuid";
import { isDeepEqual as Y } from "./utility.js";
const {
  getInitialOptions: Z,
  getShadowMetadata: H,
  setShadowMetadata: I,
  getShadowValue: R,
  registerComponent: K,
  unregisterComponent: ee,
  notifyPathSubscribers: te,
  subscribeToPath: re
} = b.getState();
function ne({
  formOpts: e,
  path: t,
  stateKey: n,
  children: o
}) {
  const { getInitialOptions: l, getShadowMetadata: s, getShadowValue: a } = b.getState(), f = l(n), m = s(n, t)?.validation, i = m?.status || "NOT_VALIDATED", v = (m?.errors || []).map((d) => ({
    ...d,
    path: t
  })), u = v.filter((d) => d.severity === "error").map((d) => d.message), c = v.filter((d) => d.severity === "warning").map((d) => d.message), L = u[0] || c[0], V = u.length > 0 ? "error" : c.length > 0 ? "warning" : void 0;
  return /* @__PURE__ */ w(x, { children: f?.formElements?.validation && !e?.validation?.disable ? f.formElements.validation({
    children: /* @__PURE__ */ w(U.Fragment, { children: o }, t.toString()),
    status: i,
    // Now passes the new ValidationStatus type
    message: e?.validation?.hideMessage ? "" : e?.validation?.message || L || "",
    severity: V,
    hasErrors: u.length > 0,
    hasWarnings: c.length > 0,
    allErrors: v,
    path: t,
    getData: () => a(n, t)
  }) : /* @__PURE__ */ w(U.Fragment, { children: o }, t.toString()) });
}
const me = _(
  oe,
  (e, t) => e.itemPath.join(".") === t.itemPath.join(".") && e.stateKey === t.stateKey && e.itemComponentId === t.itemComponentId && e.localIndex === t.localIndex
);
function oe({
  stateKey: e,
  itemComponentId: t,
  itemPath: n,
  localIndex: o,
  arraySetter: l,
  rebuildStateShape: s,
  renderFn: a
}) {
  const [, f] = p({}), { ref: h, inView: m } = X(), i = j(null), v = se(i), u = j(!1), c = [e, ...n].join(".");
  F(e, t, f);
  const L = J(
    (r) => {
      i.current = r, h(r);
    },
    [h]
  );
  C(() => {
    const r = re(c, (g) => {
      f({});
    });
    return () => r();
  }, [c]), C(() => {
    if (!m || !v || u.current)
      return;
    const r = i.current;
    if (r && r.offsetHeight > 0) {
      u.current = !0;
      const g = r.offsetHeight;
      I(e, n, {
        virtualizer: {
          itemHeight: g,
          domRef: r
        }
      });
      const S = n.slice(0, -1), D = [e, ...S].join(".");
      te(D, {
        type: "ITEMHEIGHT",
        itemKey: n.join("."),
        ref: i.current
      });
    }
  }, [m, v, e, n]);
  const V = R(e, n);
  if (V === void 0)
    return null;
  const d = s({
    currentState: V,
    path: n,
    componentId: t
  }), z = a(d, o, l);
  return /* @__PURE__ */ w("div", { ref: L, children: z });
}
function ge({
  stateKey: e,
  path: t,
  rebuildStateShape: n,
  renderFn: o,
  formOpts: l,
  setState: s
}) {
  const [a] = p(() => G()), [, f] = p({}), h = [e, ...t].join(".");
  F(e, a, f);
  const m = R(e, t), [i, v] = p(m), u = j(!1), c = j(null);
  C(() => {
    !u.current && !Y(m, i) && v(m);
  }, [m]), C(() => {
    const r = b.getState().subscribeToPath(h, (g) => {
      !u.current && i !== g && f({});
    });
    return () => {
      r(), c.current && (clearTimeout(c.current), u.current = !1);
    };
  }, []);
  const L = J(
    (r) => {
      typeof m === "number" && typeof r == "string" && (r = r === "" ? 0 : Number(r)), v(r), u.current = !0, c.current && clearTimeout(c.current);
      const S = l?.debounceTime ?? 200;
      c.current = setTimeout(() => {
        if (u.current = !1, s(r, t, { updateType: "update" }), !b.getState().getShadowMetadata(e, [])?.features?.validationEnabled) return;
        const M = Z(e)?.validation, N = M?.zodSchemaV4 || M?.zodSchemaV3;
        if (N) {
          const E = R(e, []), y = N.safeParse(E), O = H(e, t) || {};
          if (y.success)
            I(e, t, {
              ...O,
              validation: {
                status: "VALID",
                errors: [],
                lastValidated: Date.now(),
                validatedValue: r
              }
            });
          else {
            const W = ("issues" in y.error ? y.error.issues : y.error.errors).filter(
              (T) => JSON.stringify(T.path) === JSON.stringify(t)
            );
            W.length > 0 ? I(e, t, {
              ...O,
              validation: {
                status: "INVALID",
                errors: [
                  {
                    source: "client",
                    message: W[0]?.message,
                    severity: "warning"
                    // Gentle error during typing
                  }
                ],
                lastValidated: Date.now(),
                validatedValue: r
              }
            }) : I(e, t, {
              ...O,
              validation: {
                status: "VALID",
                errors: [],
                lastValidated: Date.now(),
                validatedValue: r
              }
            });
          }
        }
      }, S), f({});
    },
    [s, t, l?.debounceTime, e]
  ), V = J(async () => {
    if (console.log("handleBlur triggered"), c.current && (clearTimeout(c.current), c.current = null, u.current = !1, s(i, t, { updateType: "update" })), !H(e, [])?.features?.validationEnabled) return;
    const { getInitialOptions: g } = b.getState(), S = g(e)?.validation, D = S?.zodSchemaV4 || S?.zodSchemaV3;
    if (!D) return;
    const M = H(e, t);
    I(e, t, {
      ...M,
      validation: {
        status: "VALIDATING",
        errors: [],
        lastValidated: Date.now(),
        validatedValue: i
      }
    });
    const N = R(e, []), E = D.safeParse(N);
    if (E.success)
      I(e, t, {
        ...M,
        validation: {
          status: "VALID",
          errors: [],
          lastValidated: Date.now(),
          validatedValue: i
        }
      });
    else {
      const O = ("issues" in E.error ? E.error.issues : E.error.errors).filter((A) => {
        if (t.some((T) => T.startsWith("id:"))) {
          const T = t[0].startsWith("id:") ? [] : t.slice(0, -1), P = b.getState().getShadowMetadata(e, T);
          if (P?.arrayKeys) {
            const $ = [e, ...t.slice(0, -1)].join("."), q = P.arrayKeys.indexOf($), k = [...T, q, ...t.slice(-1)];
            return JSON.stringify(A.path) === JSON.stringify(k);
          }
        }
        return JSON.stringify(A.path) === JSON.stringify(t);
      });
      I(e, t, {
        ...M,
        validation: {
          status: "INVALID",
          errors: O.map((A) => ({
            source: "client",
            message: A.message,
            severity: "error"
            // Hard error on blur
          })),
          lastValidated: Date.now(),
          validatedValue: i
        }
      });
    }
    f({});
  }, [e, t, i, s]), d = n({
    path: t,
    componentId: a,
    meta: void 0
  }), z = new Proxy(d, {
    get(r, g) {
      return g === "$inputProps" ? {
        value: i ?? "",
        onChange: (S) => {
          L(S.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: V,
        ref: Q.getState().getFormRef(e + "." + t.join("."))
      } : r[g];
    }
  });
  return /* @__PURE__ */ w(ne, { formOpts: l, path: t, stateKey: e, children: o(z) });
}
function F(e, t, n) {
  const o = `${e}////${t}`;
  B(() => (K(e, o, {
    forceUpdate: () => n({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    ee(e, o);
  }), [e, o]);
}
const se = (e) => {
  const [t, n] = p(!1);
  return B(() => {
    if (!e.current) {
      n(!0);
      return;
    }
    const o = Array.from(e.current.querySelectorAll("img"));
    if (o.length === 0) {
      n(!0);
      return;
    }
    let l = 0;
    const s = () => {
      l++, l === o.length && n(!0);
    };
    return o.forEach((a) => {
      a.complete ? s() : (a.addEventListener("load", s), a.addEventListener("error", s));
    }), () => {
      o.forEach((a) => {
        a.removeEventListener("load", s), a.removeEventListener("error", s);
      });
    };
  }, [e.current]), t;
};
function ve({
  stateKey: e,
  path: t,
  rebuildStateShape: n,
  renderFn: o
}) {
  const [l] = p(() => G()), [, s] = p({}), a = [e, ...t].join(".");
  F(e, l, s), C(() => {
    const h = b.getState().subscribeToPath(a, () => {
      s({});
    });
    return () => h();
  }, [a]);
  const f = n({
    path: t,
    componentId: l,
    meta: void 0
  });
  return /* @__PURE__ */ w(x, { children: o(f) });
}
export {
  ge as FormElementWrapper,
  ve as IsolatedComponentWrapper,
  oe as ListItemWrapper,
  me as MemoizedCogsItemWrapper,
  ne as ValidationWrapper,
  F as useRegisterComponent
};
//# sourceMappingURL=Components.jsx.map
