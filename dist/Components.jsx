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
  const { getInitialOptions: f, getShadowMetadata: s, getShadowValue: l } = p.getState(), g = f(n), d = s(n, t)?.validation, a = d?.status || "NOT_VALIDATED", S = (d?.errors || []).map((c) => ({
    ...c,
    path: t
  })), u = S.filter((c) => c.severity === "error").map((c) => c.message), i = S.filter((c) => c.severity === "warning").map((c) => c.message), E = u[0] || i[0];
  return /* @__PURE__ */ O($, { children: g?.formElements?.validation && !e?.validation?.disable ? g.formElements.validation({
    children: /* @__PURE__ */ O(x.Fragment, { children: o }, t.toString()),
    status: a,
    // Now passes the new ValidationStatus type
    message: e?.validation?.hideMessage ? "" : e?.validation?.message || E || "",
    hasErrors: u.length > 0,
    hasWarnings: i.length > 0,
    allErrors: S,
    path: t,
    getData: () => l(n, t)
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
  renderFn: l
}) {
  const [, g] = A({}), { ref: M, inView: d } = Q(), a = C(null), S = ae(a), u = C(!1), i = [e, ...n].join(".");
  B(e, t, g);
  const E = J(
    (r) => {
      a.current = r, M(r);
    },
    [M]
  );
  j(() => {
    const r = re(i, (m) => {
      g({});
    });
    return () => r();
  }, [i]), j(() => {
    if (!d || !S || u.current)
      return;
    const r = a.current;
    if (r && r.offsetHeight > 0) {
      u.current = !0;
      const m = r.offsetHeight;
      h(e, n, {
        virtualizer: {
          itemHeight: m,
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
  }, [d, S, e, n]);
  const c = R(e, n);
  if (c === void 0)
    return null;
  const z = s({
    currentState: c,
    path: n,
    componentId: t
  }), y = l(z, o, f);
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
  const [l] = A(() => X()), [, g] = A({}), M = [e, ...t].join(".");
  B(e, l, g);
  const d = R(e, t), [a, S] = A(d), u = C(!1), i = C(null);
  j(() => {
    !u.current && !Y(d, a) && S(d);
  }, [d]), j(() => {
    const r = p.getState().subscribeToPath(M, (m) => {
      !u.current && a !== m && g({});
    });
    return () => {
      r(), i.current && (clearTimeout(i.current), u.current = !1);
    };
  }, []);
  const E = J(
    (r) => {
      typeof d === "number" && typeof r == "string" && (r = r === "" ? 0 : Number(r)), S(r), u.current = !0, i.current && clearTimeout(i.current);
      const v = f?.debounceTime ?? 200;
      i.current = setTimeout(() => {
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
  ), c = J(async () => {
    if (console.log("handleBlur triggered"), i.current && (clearTimeout(i.current), i.current = null, u.current = !1, s(a, t, { updateType: "update" })), !H(e, [])?.features?.validationEnabled) return;
    const { getInitialOptions: m } = p.getState(), v = m(e)?.validation, T = v?.zodSchemaV4 || v?.zodSchemaV3;
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
    componentId: l
  }), y = new Proxy(z, {
    get(r, m) {
      return m === "inputProps" ? {
        value: a ?? "",
        onChange: (v) => {
          E(v.target.value);
        },
        // 5. Wire the new onBlur handler to the input props.
        onBlur: c,
        ref: _.getState().getFormRef(e + "." + t.join("."))
      } : r[m];
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
    return o.forEach((l) => {
      l.complete ? s() : (l.addEventListener("load", s), l.addEventListener("error", s));
    }), () => {
      o.forEach((l) => {
        l.removeEventListener("load", s), l.removeEventListener("error", s);
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
