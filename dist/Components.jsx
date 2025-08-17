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
  const { getInitialOptions: l, getShadowMetadata: s, getShadowValue: a } = b.getState(), u = l(n), g = s(n, t)?.validation, i = g?.status || "NOT_VALIDATED", S = (g?.errors || []).map((f) => ({
    ...f,
    path: t
  })), d = S.filter((f) => f.severity === "error").map((f) => f.message), c = S.filter((f) => f.severity === "warning").map((f) => f.message), L = d[0] || c[0], V = d.length > 0 ? "error" : c.length > 0 ? "warning" : void 0;
  return /* @__PURE__ */ w(x, { children: u?.formElements?.validation && !e?.validation?.disable ? u.formElements.validation({
    children: /* @__PURE__ */ w(U.Fragment, { children: o }, t.toString()),
    status: i,
    // Now passes the new ValidationStatus type
    message: e?.validation?.hideMessage ? "" : e?.validation?.message || L || "",
    severity: V,
    hasErrors: d.length > 0,
    hasWarnings: c.length > 0,
    allErrors: S,
    path: t,
    getData: () => a(n, t)
  }) : /* @__PURE__ */ w(U.Fragment, { children: o }, t.toString()) });
}
const ge = _(
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
  const [, u] = p({}), { ref: h, inView: g } = X(), i = j(null), S = se(i), d = j(!1), c = [e, ...n].join(".");
  F(e, t, u);
  const L = J(
    (r) => {
      i.current = r, h(r);
    },
    [h]
  );
  C(() => {
    const r = re(c, (m) => {
      u({});
    });
    return () => r();
  }, [c]), C(() => {
    if (!g || !S || d.current)
      return;
    const r = i.current;
    if (r && r.offsetHeight > 0) {
      d.current = !0;
      const m = r.offsetHeight;
      I(e, n, {
        virtualizer: {
          itemHeight: m,
          domRef: r
        }
      });
      const v = n.slice(0, -1), D = [e, ...v].join(".");
      te(D, {
        type: "ITEMHEIGHT",
        itemKey: n.join("."),
        ref: i.current
      });
    }
  }, [g, S, e, n]);
  const V = R(e, n);
  if (V === void 0)
    return null;
  const f = s({
    currentState: V,
    path: n,
    componentId: t
  }), z = a(f, o, l);
  return /* @__PURE__ */ w("div", { ref: L, children: z });
}
function me({
  stateKey: e,
  path: t,
  rebuildStateShape: n,
  renderFn: o,
  formOpts: l,
  setState: s
}) {
  const [a] = p(() => G()), [, u] = p({}), h = [e, ...t].join(".");
  F(e, a, u);
  const g = R(e, t), [i, S] = p(g), d = j(!1), c = j(null);
  C(() => {
    !d.current && !Y(g, i) && S(g);
  }, [g]), C(() => {
    const r = b.getState().subscribeToPath(h, (m) => {
      !d.current && i !== m && u({});
    });
    return () => {
      r(), c.current && (clearTimeout(c.current), d.current = !1);
    };
  }, []);
  const L = J(
    (r) => {
      typeof g === "number" && typeof r == "string" && (r = r === "" ? 0 : Number(r)), S(r), d.current = !0, c.current && clearTimeout(c.current);
      const v = l?.debounceTime ?? 200;
      c.current = setTimeout(() => {
        if (d.current = !1, s(r, t, { updateType: "update" }), !b.getState().getShadowMetadata(e, [])?.features?.validationEnabled) return;
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
      }, v), u({});
    },
    [s, t, l?.debounceTime, e]
  ), V = J(async () => {
    if (console.log("handleBlur triggered"), c.current && (clearTimeout(c.current), c.current = null, d.current = !1, s(i, t, { updateType: "update" })), !H(e, [])?.features?.validationEnabled) return;
    const { getInitialOptions: m } = b.getState(), v = m(e)?.validation, D = v?.zodSchemaV4 || v?.zodSchemaV3;
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
    u({});
  }, [e, t, i, s]), f = n({
    path: t,
    componentId: a,
    meta: void 0
  }), z = new Proxy(f, {
    get(r, m) {
      return m === "inputProps" ? {
        value: i ?? "",
        onChange: (v) => {
          L(v.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: V,
        ref: Q.getState().getFormRef(e + "." + t.join("."))
      } : r[m];
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
function Se({
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
  const u = n({
    path: t,
    componentId: l,
    meta: void 0
  });
  return console.log("baseState", u?.$get()), /* @__PURE__ */ w(x, { children: o(u) });
}
export {
  me as FormElementWrapper,
  Se as IsolatedComponentWrapper,
  oe as ListItemWrapper,
  ge as MemoizedCogsItemWrapper,
  ne as ValidationWrapper,
  F as useRegisterComponent
};
//# sourceMappingURL=Components.jsx.map
