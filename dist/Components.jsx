import { jsx as O, Fragment as $ } from "react/jsx-runtime";
import x, { memo as k, useState as A, useRef as C, useCallback as J, useEffect as j, useLayoutEffect as U } from "react";
import { getGlobalStore as p, formRefStore as _ } from "./store.js";
import { useInView as Q } from "react-intersection-observer";
import { v4 as X } from "uuid";
import { isDeepEqual as Y } from "./utility.js";
const {
  getInitialOptions: Z,
  getShadowMetadata: H,
  setShadowMetadata: h,
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
  const { getInitialOptions: f, getShadowMetadata: s, getShadowValue: c } = p.getState(), g = f(n), d = s(n, t)?.validation, a = d?.status || "NOT_VALIDATED", m = (d?.errors || []).map((i) => ({
    ...i,
    path: t
  })), u = m.filter((i) => i.severity === "error").map((i) => i.message), l = m.filter((i) => i.severity === "warning").map((i) => i.message), E = u[0] || l[0];
  return /* @__PURE__ */ O($, { children: g?.formElements?.validation && !e?.validation?.disable ? g.formElements.validation({
    children: /* @__PURE__ */ O(x.Fragment, { children: o }, t.toString()),
    status: a,
    // Now passes the new ValidationStatus type
    message: e?.validation?.hideMessage ? "" : e?.validation?.message || E || "",
    hasErrors: u.length > 0,
    hasWarnings: l.length > 0,
    allErrors: m,
    path: t,
    getData: () => c(n, t)
  }) : /* @__PURE__ */ O(x.Fragment, { children: o }, t.toString()) });
}
const ge = k(
  oe,
  (e, t) => e.itemPath.join(".") === t.itemPath.join(".") && e.stateKey === t.stateKey && e.itemComponentId === t.itemComponentId && e.localIndex === t.localIndex
);
function oe({
  stateKey: e,
  itemComponentId: t,
  itemPath: n,
  localIndex: o,
  arraySetter: f,
  rebuildStateShape: s,
  renderFn: c
}) {
  const [, g] = A({}), { ref: M, inView: d } = Q(), a = C(null), m = ae(a), u = C(!1), l = [e, ...n].join(".");
  B(e, t, g);
  const E = J(
    (r) => {
      a.current = r, M(r);
    },
    [M]
  );
  j(() => {
    re(l, (r) => {
      g({});
    });
  }, []), j(() => {
    if (!d || !m || u.current)
      return;
    const r = a.current;
    if (r && r.offsetHeight > 0) {
      u.current = !0;
      const S = r.offsetHeight;
      h(e, n, {
        virtualizer: {
          itemHeight: S,
          domRef: r
        }
      });
      const v = n.slice(0, -1), T = [e, ...v].join(".");
      te(T, {
        type: "ITEMHEIGHT",
        itemKey: n.join("."),
        ref: a.current
      });
    }
  }, [d, m, e, n]);
  const i = R(e, n);
  if (i === void 0)
    return null;
  const z = s({
    currentState: i,
    path: n,
    componentId: t
  }), y = c(z, o, f);
  return /* @__PURE__ */ O("div", { ref: E, children: y });
}
function me({
  stateKey: e,
  path: t,
  rebuildStateShape: n,
  renderFn: o,
  formOpts: f,
  setState: s
}) {
  const [c] = A(() => X()), [, g] = A({}), M = [e, ...t].join(".");
  B(e, c, g);
  const d = R(e, t), [a, m] = A(d), u = C(!1), l = C(null);
  j(() => {
    !u.current && !Y(d, a) && m(d);
  }, [d]), j(() => {
    const r = p.getState().subscribeToPath(M, (S) => {
      !u.current && a !== S && g({});
    });
    return () => {
      r(), l.current && (clearTimeout(l.current), u.current = !1);
    };
  }, []);
  const E = J(
    (r) => {
      typeof d === "number" && typeof r == "string" && (r = r === "" ? 0 : Number(r)), m(r), u.current = !0, l.current && clearTimeout(l.current);
      const v = f?.debounceTime ?? 200;
      l.current = setTimeout(() => {
        if (u.current = !1, s(r, t, { updateType: "update" }), !p.getState().getShadowMetadata(e, [])?.features?.validationEnabled) return;
        const I = Z(e)?.validation, N = I?.zodSchemaV4 || I?.zodSchemaV3;
        if (N) {
          const V = R(e, []), w = N.safeParse(V), L = H(e, t) || {};
          if (w.success)
            h(e, t, {
              ...L,
              validation: {
                status: "VALID",
                errors: [],
                lastValidated: Date.now(),
                validatedValue: r
              }
            });
          else {
            const W = ("issues" in w.error ? w.error.issues : w.error.errors).filter(
              (b) => JSON.stringify(b.path) === JSON.stringify(t)
            );
            W.length > 0 ? h(e, t, {
              ...L,
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
            }) : h(e, t, {
              ...L,
              validation: {
                status: "VALID",
                errors: [],
                lastValidated: Date.now(),
                validatedValue: r
              }
            });
          }
        }
      }, v), g({});
    },
    [s, t, f?.debounceTime, e]
  ), i = J(async () => {
    if (console.log("handleBlur triggered"), l.current && (clearTimeout(l.current), l.current = null, u.current = !1, s(a, t, { updateType: "update" })), !H(e, [])?.features?.validationEnabled) return;
    const { getInitialOptions: S } = p.getState(), v = S(e)?.validation, T = v?.zodSchemaV4 || v?.zodSchemaV3;
    if (!T) return;
    const I = H(e, t);
    h(e, t, {
      ...I,
      validation: {
        status: "VALIDATING",
        errors: [],
        lastValidated: Date.now(),
        validatedValue: a
      }
    });
    const N = R(e, []), V = T.safeParse(N);
    if (V.success)
      h(e, t, {
        ...I,
        validation: {
          status: "VALID",
          errors: [],
          lastValidated: Date.now(),
          validatedValue: a
        }
      });
    else {
      const L = ("issues" in V.error ? V.error.issues : V.error.errors).filter((D) => {
        if (t.some((b) => b.startsWith("id:"))) {
          const b = t[0].startsWith("id:") ? [] : t.slice(0, -1), F = p.getState().getShadowMetadata(e, b);
          if (F?.arrayKeys) {
            const G = [e, ...t.slice(0, -1)].join("."), P = F.arrayKeys.indexOf(G), q = [...b, P, ...t.slice(-1)];
            return JSON.stringify(D.path) === JSON.stringify(q);
          }
        }
        return JSON.stringify(D.path) === JSON.stringify(t);
      });
      h(e, t, {
        ...I,
        validation: {
          status: "INVALID",
          errors: L.map((D) => ({
            source: "client",
            message: D.message,
            severity: "error"
            // Hard error on blur
          })),
          lastValidated: Date.now(),
          validatedValue: a
        }
      });
    }
    g({});
  }, [e, t, a, s]), z = n({
    path: t,
    componentId: c
  }), y = new Proxy(z, {
    get(r, S) {
      return S === "inputProps" ? {
        value: a ?? "",
        onChange: (v) => {
          E(v.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: i,
        ref: _.getState().getFormRef(e + "." + t.join("."))
      } : r[S];
    }
  });
  return /* @__PURE__ */ O(ne, { formOpts: f, path: t, stateKey: e, children: o(y) });
}
function B(e, t, n) {
  const o = `${e}////${t}`;
  U(() => (K(e, o, {
    forceUpdate: () => n({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    ee(e, o);
  }), [e, o]);
}
const ae = (e) => {
  const [t, n] = A(!1);
  return U(() => {
    if (!e.current) {
      n(!0);
      return;
    }
    const o = Array.from(e.current.querySelectorAll("img"));
    if (o.length === 0) {
      n(!0);
      return;
    }
    let f = 0;
    const s = () => {
      f++, f === o.length && n(!0);
    };
    return o.forEach((c) => {
      c.complete ? s() : (c.addEventListener("load", s), c.addEventListener("error", s));
    }), () => {
      o.forEach((c) => {
        c.removeEventListener("load", s), c.removeEventListener("error", s);
      });
    };
  }, [e.current]), t;
};
export {
  me as FormElementWrapper,
  oe as ListItemWrapper,
  ge as MemoizedCogsItemWrapper,
  ne as ValidationWrapper,
  B as useRegisterComponent
};
//# sourceMappingURL=Components.jsx.map
