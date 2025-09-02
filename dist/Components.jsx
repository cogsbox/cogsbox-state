import { jsx as L, Fragment as X } from "react/jsx-runtime";
import Q, { memo as ne, useState as N, useRef as D, useCallback as z, useEffect as w, useLayoutEffect as Y } from "react";
import { getGlobalStore as y, formRefStore as oe } from "./store.js";
import { useInView as se } from "react-intersection-observer";
import { v4 as Z } from "uuid";
import { isDeepEqual as ie } from "./utility.js";
const {
  getInitialOptions: ae,
  getShadowMetadata: ce,
  setShadowMetadata: V,
  getShadowValue: x,
  registerComponent: ue,
  unregisterComponent: le,
  notifyPathSubscribers: de,
  subscribeToPath: fe
} = y.getState();
function ge({
  formOpts: t,
  path: e,
  stateKey: n,
  children: s
}) {
  const { getInitialOptions: u, getShadowMetadata: i, getShadowValue: a } = y.getState(), f = u(n), T = i(n, e)?.validation, c = T?.status || "NOT_VALIDATED", S = (T?.errors || []).map((o) => ({
    ...o,
    path: e
  })), l = S.filter((o) => o.severity === "error").map((o) => o.message), d = S.filter((o) => o.severity === "warning").map((o) => o.message), E = l[0] || d[0], g = l.length > 0 ? "error" : d.length > 0 ? "warning" : void 0;
  return /* @__PURE__ */ L(X, { children: f?.formElements?.validation && !t?.validation?.disable ? f.formElements.validation({
    children: /* @__PURE__ */ L(Q.Fragment, { children: s }, e.toString()),
    status: c,
    // Now passes the new ValidationStatus type
    message: t?.validation?.hideMessage ? "" : t?.validation?.message || E || "",
    severity: g,
    hasErrors: l.length > 0,
    hasWarnings: d.length > 0,
    allErrors: S,
    path: e,
    getData: () => a(n, e)
  }) : /* @__PURE__ */ L(Q.Fragment, { children: s }, e.toString()) });
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
  arraySetter: u,
  rebuildStateShape: i,
  renderFn: a
}) {
  const [, f] = N({}), { ref: v, inView: T } = se(), c = D(null), S = Se(c), l = D(!1), d = [t, ...n].join(".");
  $(t, e, f);
  const E = z(
    (m) => {
      c.current = m, v(m);
    },
    [v]
  );
  w(() => {
    const m = fe(d, (O) => {
      f({});
    });
    return () => m();
  }, [d]), w(() => {
    if (!T || !S || l.current)
      return;
    const m = c.current;
    if (m && m.offsetHeight > 0) {
      l.current = !0;
      const O = m.offsetHeight;
      V(t, n, {
        virtualizer: {
          itemHeight: O,
          domRef: m
        }
      });
      const B = n.slice(0, -1), F = [t, ...B].join(".");
      de(F, {
        type: "ITEMHEIGHT",
        itemKey: n.join("."),
        ref: c.current
      });
    }
  }, [T, S, t, n]);
  const g = x(t, n);
  if (g === void 0)
    return null;
  const o = i({
    currentState: g,
    path: n,
    componentId: e
  }), M = a(o, s, u);
  return /* @__PURE__ */ L("div", { ref: E, children: M });
}
function Ee({
  stateKey: t,
  path: e,
  rebuildStateShape: n,
  renderFn: s,
  formOpts: u,
  setState: i
}) {
  const a = D(Z()).current, [, f] = N({}), v = [t, ...e].join(".");
  $(t, a, f);
  const c = y.getState().getShadowNode(t, e)?._meta?.typeInfo, S = c?.schema, l = x(t, e), [d, E] = N(l), g = D(!1), o = D(null);
  w(() => {
    !g.current && !ie(l, d) && E(l);
  }, [l]), w(() => {
    const r = y.getState().subscribeToPath(v, (b) => {
      !g.current && d !== b && f({});
    });
    return () => {
      r(), o.current && (clearTimeout(o.current), g.current = !1);
    };
  }, []);
  const M = z(
    (r, b) => {
      if (!y.getState().getShadowMetadata(t, [])?.features?.validationEnabled) return;
      const I = ae(t)?.validation;
      if (!I) return;
      const P = ce(t, e) || {}, K = P?.validation?.status;
      let R = !1, W;
      if (b === "onBlur" && I.onBlur ? (R = !0, W = I.onBlur ?? "error") : b === "onChange" && (I.onChange ? (R = !0, W = I.onChange) : K === "INVALID" && (R = !0, W = "warning")), !R) return;
      let h = null;
      if (S && R) {
        const p = S.safeParse(r);
        p.success ? h = { success: !0 } : h = {
          success: !1,
          message: ("issues" in p.error ? p.error.issues : p.error.errors)[0]?.message || "Invalid value"
        };
      } else {
        const p = I.zodSchemaV4 || I.zodSchemaV3;
        if (!p) return;
        const q = x(t, []), U = JSON.parse(JSON.stringify(q));
        let j = U;
        for (let C = 0; C < e.length - 1; C++)
          j[e[C]] || (j[e[C]] = {}), j = j[e[C]];
        e.length > 0 ? j[e[e.length - 1]] = r : Object.assign(U, r);
        const A = p.safeParse(U);
        if (A.success)
          h = { success: !0 };
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
          G.length > 0 ? h = {
            success: !1,
            message: G[0]?.message
          } : h = { success: !0 };
        }
      }
      h && (h.success ? V(t, e, {
        ...P,
        validation: {
          status: "VALID",
          errors: [],
          lastValidated: Date.now(),
          validatedValue: r
        }
      }) : V(t, e, {
        ...P,
        validation: {
          status: "INVALID",
          errors: [
            {
              source: "client",
              message: h.message,
              severity: W
            }
          ],
          lastValidated: Date.now(),
          validatedValue: r
        }
      })), f({});
    },
    [t, e, S]
  ), m = z(
    (r) => {
      c ? c.type === "number" && typeof r == "string" ? r = r === "" ? c.nullable ? null : c.default ?? 0 : Number(r) : c.type === "boolean" && typeof r == "string" ? r = r === "true" || r === "1" : c.type === "date" && typeof r == "string" && (r = new Date(r)) : typeof l === "number" && typeof r == "string" && (r = r === "" ? 0 : Number(r)), E(r), M(r, "onChange"), g.current = !0, o.current && clearTimeout(o.current);
      const b = u?.debounceTime ?? 200;
      o.current = setTimeout(() => {
        g.current = !1, i(r, e, { updateType: "update" });
      }, b);
    },
    [
      i,
      e,
      u?.debounceTime,
      M,
      c,
      l
    ]
  ), O = z(() => {
    o.current && (clearTimeout(o.current), o.current = null, g.current = !1, i(d, e, { updateType: "update" })), M(d, "onBlur");
  }, [d, i, e, M]), B = n({
    path: e,
    componentId: a,
    meta: void 0
  }), F = new Proxy(B, {
    get(r, b) {
      return b === "$inputProps" ? {
        value: d ?? "",
        onChange: (J) => {
          m(J.target.value);
        },
        onBlur: O,
        ref: oe.getState().getFormRef(t + "." + e.join("."))
      } : r[b];
    }
  });
  return /* @__PURE__ */ L(ge, { formOpts: u, path: e, stateKey: t, children: s(F) });
}
function $(t, e, n) {
  const s = `${t}////${e}`;
  Y(() => (ue(t, s, {
    forceUpdate: () => n({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    le(t, s);
  }), [t, s]);
}
const Se = (t) => {
  const [e, n] = N(!1);
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
    let u = 0;
    const i = () => {
      u++, u === s.length && n(!0);
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
  const [u] = N(() => Z()), [, i] = N({}), a = [t, ...e].join(".");
  $(t, u, i), w(() => {
    const v = y.getState().subscribeToPath(a, () => {
      i({});
    });
    return () => v();
  }, [a]);
  const f = n({
    path: e,
    componentId: u,
    meta: void 0
  });
  return /* @__PURE__ */ L(X, { children: s(f) });
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
