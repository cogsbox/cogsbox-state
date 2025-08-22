import { jsx as w, Fragment as U } from "react/jsx-runtime";
import P, { memo as _, useState as V, useRef as j, useCallback as J, useEffect as A, useLayoutEffect as x } from "react";
import { getGlobalStore as p, formRefStore as Q } from "./store.js";
import { useInView as X } from "react-intersection-observer";
import { v4 as G } from "uuid";
import { isDeepEqual as Y } from "./utility.js";
const {
  getInitialOptions: Z,
  getShadowMetadata: H,
  setShadowMetadata: b,
  getShadowValue: R,
  registerComponent: K,
  unregisterComponent: ee,
  notifyPathSubscribers: te,
  subscribeToPath: re
} = p.getState();
function ne({
  formOpts: e,
  path: t,
  stateKey: n,
  children: o
}) {
  const { getInitialOptions: l, getShadowMetadata: a, getShadowValue: s } = p.getState(), f = l(n), g = a(n, t)?.validation, i = g?.status || "NOT_VALIDATED", S = (g?.errors || []).map((d) => ({
    ...d,
    path: t
  })), u = S.filter((d) => d.severity === "error").map((d) => d.message), c = S.filter((d) => d.severity === "warning").map((d) => d.message), L = u[0] || c[0], M = u.length > 0 ? "error" : c.length > 0 ? "warning" : void 0;
  return /* @__PURE__ */ w(U, { children: f?.formElements?.validation && !e?.validation?.disable ? f.formElements.validation({
    children: /* @__PURE__ */ w(P.Fragment, { children: o }, t.toString()),
    status: i,
    // Now passes the new ValidationStatus type
    message: e?.validation?.hideMessage ? "" : e?.validation?.message || L || "",
    severity: M,
    hasErrors: u.length > 0,
    hasWarnings: c.length > 0,
    allErrors: S,
    path: t,
    getData: () => s(n, t)
  }) : /* @__PURE__ */ w(P.Fragment, { children: o }, t.toString()) });
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
  rebuildStateShape: a,
  renderFn: s
}) {
  const [, f] = V({}), { ref: I, inView: g } = X(), i = j(null), S = ae(i), u = j(!1), c = [e, ...n].join(".");
  B(e, t, f);
  const L = J(
    (r) => {
      i.current = r, I(r);
    },
    [I]
  );
  A(() => {
    const r = re(c, (m) => {
      f({});
    });
    return () => r();
  }, [c]), A(() => {
    if (!g || !S || u.current)
      return;
    const r = i.current;
    if (r && r.offsetHeight > 0) {
      u.current = !0;
      const m = r.offsetHeight;
      b(e, n, {
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
  const M = R(e, n);
  if (M === void 0)
    return null;
  const d = a({
    currentState: M,
    path: n,
    componentId: t
  }), z = s(d, o, l);
  return /* @__PURE__ */ w("div", { ref: L, children: z });
}
function me({
  stateKey: e,
  path: t,
  rebuildStateShape: n,
  renderFn: o,
  formOpts: l,
  setState: a
}) {
  const [s] = V(() => G()), [, f] = V({}), I = [e, ...t].join(".");
  B(e, s, f);
  const g = R(e, t), [i, S] = V(g), u = j(!1), c = j(null);
  A(() => {
    !u.current && !Y(g, i) && S(g);
  }, [g]), A(() => {
    const r = p.getState().subscribeToPath(I, (m) => {
      !u.current && i !== m && f({});
    });
    return () => {
      r(), c.current && (clearTimeout(c.current), u.current = !1);
    };
  }, []);
  const L = J(
    (r) => {
      typeof g === "number" && typeof r == "string" && (r = r === "" ? 0 : Number(r)), S(r), u.current = !0, c.current && clearTimeout(c.current);
      const v = l?.debounceTime ?? 200;
      c.current = setTimeout(() => {
        if (u.current = !1, a(r, t, { updateType: "update" }), !p.getState().getShadowMetadata(e, [])?.features?.validationEnabled) return;
        const h = Z(e)?.validation, N = h?.zodSchemaV4 || h?.zodSchemaV3;
        if (N && h?.onChange) {
          const E = R(e, []), C = N.safeParse(E), y = H(e, t) || {};
          if (C.success)
            b(e, t, {
              ...y,
              validation: {
                status: "VALID",
                errors: [],
                lastValidated: Date.now(),
                validatedValue: r
              }
            });
          else {
            const W = ("issues" in C.error ? C.error.issues : C.error.errors).filter(
              (T) => JSON.stringify(T.path) === JSON.stringify(t)
            );
            W.length > 0 ? b(e, t, {
              ...y,
              validation: {
                status: "INVALID",
                errors: [
                  {
                    source: "client",
                    message: W[0]?.message,
                    severity: h?.onChange || "warning"
                  }
                ],
                lastValidated: Date.now(),
                validatedValue: r
              }
            }) : b(e, t, {
              ...y,
              validation: {
                status: "VALID",
                errors: [],
                lastValidated: Date.now(),
                validatedValue: r
              }
            });
          }
        }
      }, v), f({});
    },
    [a, t, l?.debounceTime, e]
  ), M = J(async () => {
    if (console.log("handleBlur triggered"), c.current && (clearTimeout(c.current), c.current = null, u.current = !1, a(i, t, { updateType: "update" })), !H(e, [])?.features?.validationEnabled) return;
    const { getInitialOptions: m } = p.getState(), v = m(e)?.validation, D = v?.zodSchemaV4 || v?.zodSchemaV3;
    if (!D || !v?.onBlur) return;
    const h = H(e, t);
    b(e, t, {
      ...h,
      validation: {
        status: "VALIDATING",
        errors: [],
        lastValidated: Date.now(),
        validatedValue: i
      }
    });
    const N = R(e, []), E = D.safeParse(N);
    if (E.success)
      b(e, t, {
        ...h,
        validation: {
          status: "VALID",
          errors: [],
          lastValidated: Date.now(),
          validatedValue: i
        }
      });
    else {
      const y = ("issues" in E.error ? E.error.issues : E.error.errors).filter((O) => {
        if (t.some((T) => T.startsWith("id:"))) {
          const T = t[0].startsWith("id:") ? [] : t.slice(0, -1), F = p.getState().getShadowMetadata(e, T);
          if (F?.arrayKeys) {
            const $ = [e, ...t.slice(0, -1)].join("."), q = F.arrayKeys.indexOf($), k = [...T, q, ...t.slice(-1)];
            return JSON.stringify(O.path) === JSON.stringify(k);
          }
        }
        return JSON.stringify(O.path) === JSON.stringify(t);
      });
      b(e, t, {
        ...h,
        validation: {
          status: "INVALID",
          errors: y.map((O) => ({
            source: "client",
            message: O.message,
            severity: v.onBlur
          })),
          lastValidated: Date.now(),
          validatedValue: i
        }
      });
    }
    f({});
  }, [e, t, i, a]), d = n({
    path: t,
    componentId: s,
    meta: void 0
  }), z = new Proxy(d, {
    get(r, m) {
      return m === "$inputProps" ? {
        value: i ?? "",
        onChange: (v) => {
          L(v.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: M,
        ref: Q.getState().getFormRef(e + "." + t.join("."))
      } : r[m];
    }
  });
  return /* @__PURE__ */ w(ne, { formOpts: l, path: t, stateKey: e, children: o(z) });
}
function B(e, t, n) {
  const o = `${e}////${t}`;
  x(() => (K(e, o, {
    forceUpdate: () => n({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    ee(e, o);
  }), [e, o]);
}
const ae = (e) => {
  const [t, n] = V(!1);
  return x(() => {
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
    const a = () => {
      l++, l === o.length && n(!0);
    };
    return o.forEach((s) => {
      s.complete ? a() : (s.addEventListener("load", a), s.addEventListener("error", a));
    }), () => {
      o.forEach((s) => {
        s.removeEventListener("load", a), s.removeEventListener("error", a);
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
  const [l] = V(() => G()), [, a] = V({}), s = [e, ...t].join(".");
  B(e, l, a), A(() => {
    const I = p.getState().subscribeToPath(s, () => {
      a({});
    });
    return () => I();
  }, [s]);
  const f = n({
    path: t,
    componentId: l,
    meta: void 0
  });
  return /* @__PURE__ */ w(U, { children: o(f) });
}
export {
  me as FormElementWrapper,
  ve as IsolatedComponentWrapper,
  oe as ListItemWrapper,
  ge as MemoizedCogsItemWrapper,
  ne as ValidationWrapper,
  B as useRegisterComponent
};
//# sourceMappingURL=Components.jsx.map
