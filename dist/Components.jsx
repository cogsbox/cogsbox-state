import { jsx as N, Fragment as X } from "react/jsx-runtime";
import Q, { memo as ne, useState as R, useRef as D, useCallback as z, useEffect as w, useLayoutEffect as Y } from "react";
import { getGlobalStore as y, formRefStore as oe } from "./store.js";
import { useInView as se } from "react-intersection-observer";
import { v4 as Z } from "uuid";
import { isDeepEqual as ie } from "./utility.js";
const {
  getInitialOptions: ae,
  getShadowMetadata: ce,
  setShadowMetadata: U,
  getShadowValue: x,
  registerComponent: le,
  unregisterComponent: ue,
  notifyPathSubscribers: de,
  subscribeToPath: fe
} = y.getState();
function ge({
  formOpts: t,
  path: e,
  stateKey: n,
  children: s
}) {
  const { getInitialOptions: l, getShadowMetadata: i, getShadowValue: a } = y.getState(), f = l(n), T = i(n, e)?.validation, c = T?.status || "NOT_VALIDATED", g = (T?.errors || []).map((o) => ({
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
const Te = ne(
  me,
  (t, e) => t.itemPath.join(".") === e.itemPath.join(".") && t.stateKey === e.stateKey && t.itemComponentId === e.itemComponentId && t.localIndex === e.localIndex
);
function me({
  stateKey: t,
  itemComponentId: e,
  itemPath: n,
  localIndex: s,
  arraySetter: l,
  rebuildStateShape: i,
  renderFn: a
}) {
  const [, f] = R({}), { ref: I, inView: T } = se(), c = D(null), g = Se(c), u = D(!1), d = [t, ...n].join(".");
  $(t, e, f);
  const E = z(
    (S) => {
      c.current = S, I(S);
    },
    [I]
  );
  w(() => {
    const S = fe(d, (O) => {
      f({});
    });
    return () => S();
  }, [d]), w(() => {
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
      const B = n.slice(0, -1), F = [t, ...B].join(".");
      de(F, {
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
function Ee({
  stateKey: t,
  path: e,
  rebuildStateShape: n,
  renderFn: s,
  formOpts: l,
  setState: i
}) {
  const a = D(Z()).current, [, f] = R({}), I = [t, ...e].join(".");
  $(t, a, f);
  const c = y.getState().getShadowNode(t, e)?._meta?.typeInfo, g = c?.schema, u = x(t, e), [d, E] = R(u), m = D(!1), o = D(null);
  w(() => {
    !m.current && !ie(u, d) && E(u);
  }, [u]), w(() => {
    const r = y.getState().subscribeToPath(I, (b) => {
      !m.current && d !== b && f({});
    });
    return () => {
      r(), o.current && (clearTimeout(o.current), m.current = !1);
    };
  }, []);
  const M = z(
    (r, b) => {
      if (!y.getState().getShadowMetadata(t, [])?.features?.validationEnabled) return;
      const h = ae(t)?.validation;
      if (!h) return;
      const V = ce(t, e) || {}, K = V?.validation?.status;
      let C = !1, W;
      if (console.log("trigger", b, h), b === "onBlur" && h.onBlur ? (C = !0, W = h.onBlur ?? "error") : b === "onChange" && (h.onChange ? (C = !0, W = h.onChange) : K === "INVALID" && (C = !0, W = "warning")), !C) return;
      let v = null;
      if (console.log(
        "shouldValidate 33",
        e,
        g,
        C,
        r,
        typeof r
      ), g && C) {
        const p = g.safeParse(r);
        p.success ? v = { success: !0 } : v = {
          success: !1,
          message: ("issues" in p.error ? p.error.issues : p.error.errors)[0]?.message || "Invalid value"
        };
      } else {
        const p = h.zodSchemaV4 || h.zodSchemaV3;
        if (!p) return;
        const q = x(t, []), P = JSON.parse(JSON.stringify(q));
        let j = P;
        for (let L = 0; L < e.length - 1; L++)
          j[e[L]] || (j[e[L]] = {}), j = j[e[L]];
        e.length > 0 ? j[e[e.length - 1]] = r : Object.assign(P, r);
        const A = p.safeParse(P);
        if (A.success)
          v = { success: !0 };
        else {
          const G = ("issues" in A.error ? A.error.issues : A.error.errors).filter((_) => {
            if (e.some((H) => H.startsWith("id:"))) {
              const H = e[0].startsWith("id:") ? [] : e.slice(0, -1), k = y.getState().getShadowMetadata(t, H);
              if (k?.arrayKeys) {
                e.slice(0, -1).join(".");
                const ee = k.arrayKeys.findIndex(
                  (re) => re === e[e.length - 2]
                ), te = [...H, ee, ...e.slice(-1)];
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
        ...V,
        validation: {
          status: "VALID",
          errors: [],
          lastValidated: Date.now(),
          validatedValue: r
        }
      }) : U(t, e, {
        ...V,
        validation: {
          status: "INVALID",
          errors: [
            {
              source: "client",
              message: v.message,
              severity: W
            }
          ],
          lastValidated: Date.now(),
          validatedValue: r
        }
      })), f({});
    },
    [t, e, g]
  ), S = z(
    (r) => {
      c ? c.type === "number" && typeof r == "string" ? r = r === "" ? c.nullable ? null : c.default ?? 0 : Number(r) : c.type === "boolean" && typeof r == "string" ? r = r === "true" || r === "1" : c.type === "date" && typeof r == "string" && (r = new Date(r)) : typeof u === "number" && typeof r == "string" && (r = r === "" ? 0 : Number(r)), E(r), M(r, "onChange"), m.current = !0, o.current && clearTimeout(o.current);
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
  ), O = z(() => {
    o.current && (clearTimeout(o.current), o.current = null, m.current = !1, i(d, e, { updateType: "update" })), M(d, "onBlur");
  }, [d, i, e, M]), B = n({
    path: e,
    componentId: a,
    meta: void 0
  }), F = new Proxy(B, {
    get(r, b) {
      return b === "$inputProps" ? {
        value: d ?? "",
        onChange: (J) => {
          S(J.target.value);
        },
        onBlur: O,
        ref: oe.getState().getFormRef(t + "." + e.join("."))
      } : r[b];
    }
  });
  return /* @__PURE__ */ N(ge, { formOpts: l, path: e, stateKey: t, children: s(F) });
}
function $(t, e, n) {
  const s = `${t}////${e}`;
  Y(() => (le(t, s, {
    forceUpdate: () => n({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    ue(t, s);
  }), [t, s]);
}
const Se = (t) => {
  const [e, n] = R(!1);
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
function Me({
  stateKey: t,
  path: e,
  rebuildStateShape: n,
  renderFn: s
}) {
  const [l] = R(() => Z()), [, i] = R({}), a = [t, ...e].join(".");
  $(t, l, i), w(() => {
    const I = y.getState().subscribeToPath(a, () => {
      i({});
    });
    return () => I();
  }, [a]);
  const f = n({
    path: e,
    componentId: l,
    meta: void 0
  });
  return /* @__PURE__ */ N(X, { children: s(f) });
}
export {
  Ee as FormElementWrapper,
  Me as IsolatedComponentWrapper,
  me as ListItemWrapper,
  Te as MemoizedCogsItemWrapper,
  ge as ValidationWrapper,
  $ as useRegisterComponent
};
//# sourceMappingURL=Components.jsx.map
