import { jsx as N, Fragment as X } from "react/jsx-runtime";
import Q, { memo as ne, useState as w, useRef as j, useCallback as F, useEffect as D, useLayoutEffect as Y } from "react";
import { getGlobalStore as I, shadowStateStore as oe, formRefStore as se } from "./store.js";
import { useInView as ie } from "react-intersection-observer";
import { v4 as Z } from "uuid";
import { isDeepEqual as ae } from "./utility.js";
const {
  getInitialOptions: ce,
  getShadowMetadata: le,
  setShadowMetadata: U,
  getShadowValue: x,
  registerComponent: ue,
  unregisterComponent: de,
  notifyPathSubscribers: fe,
  subscribeToPath: ge
} = I.getState();
function me({
  formOpts: t,
  path: e,
  stateKey: n,
  children: s
}) {
  const { getInitialOptions: l, getShadowMetadata: i, getShadowValue: a } = I.getState(), f = l(n), T = i(n, e)?.validation, c = T?.status || "NOT_VALIDATED", g = (T?.errors || []).map((o) => ({
    ...o,
    path: e
  })), u = g.filter((o) => o.severity === "error").map((o) => o.message), d = g.filter((o) => o.severity === "warning").map((o) => o.message), E = u[0] || d[0], m = u.length > 0 ? "error" : d.length > 0 ? "warning" : void 0;
  return /* @__PURE__ */ N(X, { children: f?.formElements?.validation && !t?.validation?.disable ? f.formElements.validation({
    children: /* @__PURE__ */ N(Q.Fragment, { children: s }, e.toString()),
    status: c,
    // Now passes the new ValidationStatus type
    message: t?.validation?.hideMessage ? "" : t?.validation?.message || E || "",
    severity: m,
    hasErrors: u.length > 0,
    hasWarnings: d.length > 0,
    allErrors: g,
    path: e,
    getData: () => a(n, e)
  }) : /* @__PURE__ */ N(Q.Fragment, { children: s }, e.toString()) });
}
const Ee = ne(
  Se,
  (t, e) => t.itemPath.join(".") === e.itemPath.join(".") && t.stateKey === e.stateKey && t.itemComponentId === e.itemComponentId && t.localIndex === e.localIndex
);
function Se({
  stateKey: t,
  itemComponentId: e,
  itemPath: n,
  localIndex: s,
  arraySetter: l,
  rebuildStateShape: i,
  renderFn: a
}) {
  const [, f] = w({}), { ref: p, inView: T } = ie(), c = j(null), g = he(c), u = j(!1), d = [t, ...n].join(".");
  $(t, e, f);
  const E = F(
    (S) => {
      c.current = S, p(S);
    },
    [p]
  );
  D(() => {
    const S = ge(d, (O) => {
      f({});
    });
    return () => S();
  }, [d]), D(() => {
    if (!T || !g || u.current)
      return;
    const S = c.current;
    if (S && S.offsetHeight > 0) {
      u.current = !0;
      const O = S.offsetHeight;
      U(t, n, {
        virtualizer: {
          itemHeight: O,
          domRef: S
        }
      });
      const J = n.slice(0, -1), V = [t, ...J].join(".");
      fe(V, {
        type: "ITEMHEIGHT",
        itemKey: n.join("."),
        ref: c.current
      });
    }
  }, [T, g, t, n]);
  const m = x(t, n);
  if (m === void 0)
    return null;
  const o = i({
    currentState: m,
    path: n,
    componentId: e
  }), M = a(o, s, l);
  return /* @__PURE__ */ N("div", { ref: E, children: M });
}
function Me({
  stateKey: t,
  path: e,
  rebuildStateShape: n,
  renderFn: s,
  formOpts: l,
  setState: i
}) {
  const a = j(Z()).current, [, f] = w({}), p = [t, ...e].join(".");
  $(t, a, f);
  const c = I.getState().getShadowNode(t, e)?._meta?.typeInfo, g = c?.schema, u = x(t, e), [d, E] = w(u), m = j(!1), o = j(null);
  D(() => {
    !m.current && !ae(u, d) && E(u);
  }, [u]), D(() => {
    const r = I.getState().subscribeToPath(p, (h) => {
      !m.current && d !== h && f({});
    });
    return () => {
      r(), o.current && (clearTimeout(o.current), m.current = !1);
    };
  }, []);
  const M = F(
    (r, h) => {
      if (!I.getState().getShadowMetadata(t, [])?.features?.validationEnabled) return;
      const b = ce(t)?.validation;
      if (!b) return;
      const A = le(t, e) || {}, K = A?.validation?.status;
      let C = !1, H;
      if (console.log("trigger", h, b), h === "onBlur" && b.onBlur ? (C = !0, H = b.onBlur ?? "error") : h === "onChange" && (b.onChange ? (C = !0, H = b.onChange) : K === "INVALID" && (C = !0, H = "warning")), !C) return;
      let v = null;
      if (console.log(
        "shouldValidate 33",
        e,
        g,
        C,
        r,
        typeof r
      ), g && C) {
        const y = g.safeParse(r);
        y.success ? v = { success: !0 } : v = {
          success: !1,
          message: ("issues" in y.error ? y.error.issues : y.error.errors)[0]?.message || "Invalid value"
        };
      } else {
        const y = b.zodSchemaV4 || b.zodSchemaV3;
        if (!y) return;
        const q = x(t, []), P = JSON.parse(JSON.stringify(q));
        let R = P;
        for (let L = 0; L < e.length - 1; L++)
          R[e[L]] || (R[e[L]] = {}), R = R[e[L]];
        e.length > 0 ? R[e[e.length - 1]] = r : Object.assign(P, r);
        const z = y.safeParse(P);
        if (z.success)
          v = { success: !0 };
        else {
          const G = ("issues" in z.error ? z.error.issues : z.error.errors).filter((_) => {
            if (e.some((B) => B.startsWith("id:"))) {
              const B = e[0].startsWith("id:") ? [] : e.slice(0, -1), k = I.getState().getShadowMetadata(t, B);
              if (k?.arrayKeys) {
                e.slice(0, -1).join(".");
                const ee = k.arrayKeys.findIndex(
                  (re) => re === e[e.length - 2]
                ), te = [...B, ee, ...e.slice(-1)];
                return JSON.stringify(_.path) === JSON.stringify(te);
              }
            }
            return JSON.stringify(_.path) === JSON.stringify(e);
          });
          G.length > 0 ? v = {
            success: !1,
            message: G[0]?.message
          } : v = { success: !0 };
        }
      }
      v && (v.success ? U(t, e, {
        ...A,
        validation: {
          status: "VALID",
          errors: [],
          lastValidated: Date.now(),
          validatedValue: r
        }
      }) : U(t, e, {
        ...A,
        validation: {
          status: "INVALID",
          errors: [
            {
              source: "client",
              message: v.message,
              severity: H
            }
          ],
          lastValidated: Date.now(),
          validatedValue: r
        }
      })), f({});
    },
    [t, e, g]
  ), S = F(
    (r) => {
      const h = I.getState().getShadowMetadata(t, []), W = oe.get(t);
      console.log("update root", h, W), c ? c.type === "number" && typeof r == "string" ? r = r === "" ? c.nullable ? null : c.default ?? 0 : Number(r) : c.type === "boolean" && typeof r == "string" ? r = r === "true" || r === "1" : c.type === "date" && typeof r == "string" && (r = new Date(r)) : typeof u === "number" && typeof r == "string" && (r = r === "" ? 0 : Number(r)), E(r), M(r, "onChange"), m.current = !0, o.current && clearTimeout(o.current);
      const b = l?.debounceTime ?? 200;
      o.current = setTimeout(() => {
        m.current = !1, i(r, e, { updateType: "update" });
      }, b);
    },
    [
      i,
      e,
      l?.debounceTime,
      M,
      c,
      u
    ]
  ), O = F(() => {
    o.current && (clearTimeout(o.current), o.current = null, m.current = !1, i(d, e, { updateType: "update" })), M(d, "onBlur");
  }, [d, i, e, M]), J = n({
    path: e,
    componentId: a,
    meta: void 0
  }), V = new Proxy(J, {
    get(r, h) {
      return h === "$inputProps" ? {
        value: d ?? "",
        onChange: (W) => {
          S(W.target.value);
        },
        onBlur: O,
        ref: se.getState().getFormRef(t + "." + e.join("."))
      } : r[h];
    }
  });
  return /* @__PURE__ */ N(me, { formOpts: l, path: e, stateKey: t, children: s(V) });
}
function $(t, e, n) {
  const s = `${t}////${e}`;
  Y(() => (ue(t, s, {
    forceUpdate: () => n({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    de(t, s);
  }), [t, s]);
}
const he = (t) => {
  const [e, n] = w(!1);
  return Y(() => {
    if (!t.current) {
      n(!0);
      return;
    }
    const s = Array.from(t.current.querySelectorAll("img"));
    if (s.length === 0) {
      n(!0);
      return;
    }
    let l = 0;
    const i = () => {
      l++, l === s.length && n(!0);
    };
    return s.forEach((a) => {
      a.complete ? i() : (a.addEventListener("load", i), a.addEventListener("error", i));
    }), () => {
      s.forEach((a) => {
        a.removeEventListener("load", i), a.removeEventListener("error", i);
      });
    };
  }, [t.current]), e;
};
function Ce({
  stateKey: t,
  path: e,
  rebuildStateShape: n,
  renderFn: s
}) {
  const [l] = w(() => Z()), [, i] = w({}), a = [t, ...e].join(".");
  $(t, l, i), D(() => {
    const p = I.getState().subscribeToPath(a, () => {
      i({});
    });
    return () => p();
  }, [a]);
  const f = n({
    path: e,
    componentId: l,
    meta: void 0
  });
  return /* @__PURE__ */ N(X, { children: s(f) });
}
export {
  Me as FormElementWrapper,
  Ce as IsolatedComponentWrapper,
  Se as ListItemWrapper,
  Ee as MemoizedCogsItemWrapper,
  me as ValidationWrapper,
  $ as useRegisterComponent
};
//# sourceMappingURL=Components.jsx.map
