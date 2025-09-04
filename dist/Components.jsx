import { jsx as L, Fragment as Y } from "react/jsx-runtime";
import X, { memo as ce, useState as R, useRef as C, useCallback as j, useEffect as W, useLayoutEffect as Z } from "react";
import { getGlobalStore as m } from "./store.js";
import { useInView as ue } from "react-intersection-observer";
import { v4 as K } from "uuid";
import { isDeepEqual as le } from "./utility.js";
const {
  getInitialOptions: de,
  getShadowMetadata: fe,
  setShadowMetadata: F,
  getShadowValue: x,
  registerComponent: ge,
  unregisterComponent: me,
  notifyPathSubscribers: _,
  subscribeToPath: Se
} = m.getState();
function he({
  formOpts: t,
  path: e,
  stateKey: n,
  children: s
}) {
  const { getInitialOptions: l, getShadowMetadata: i, getShadowValue: a } = m.getState(), f = l(n), M = i(n, e)?.validation, p = M?.status || "NOT_VALIDATED", c = (M?.errors || []).map((o) => ({
    ...o,
    path: e
  })), S = c.filter((o) => o.severity === "error").map((o) => o.message), d = c.filter((o) => o.severity === "warning").map((o) => o.message), h = S[0] || d[0], T = S.length > 0 ? "error" : d.length > 0 ? "warning" : void 0;
  return /* @__PURE__ */ L(Y, { children: f?.formElements?.validation && !t?.validation?.disable ? f.formElements.validation({
    children: /* @__PURE__ */ L(X.Fragment, { children: s }, e.toString()),
    status: p,
    // Now passes the new ValidationStatus type
    message: t?.validation?.hideMessage ? "" : t?.validation?.message || h || "",
    severity: T,
    hasErrors: S.length > 0,
    hasWarnings: d.length > 0,
    allErrors: c,
    path: e,
    getData: () => a(n, e)
  }) : /* @__PURE__ */ L(X.Fragment, { children: s }, e.toString()) });
}
const we = ce(
  ve,
  (t, e) => t.itemPath.join(".") === e.itemPath.join(".") && t.stateKey === e.stateKey && t.itemComponentId === e.itemComponentId && t.localIndex === e.localIndex
);
function ve({
  stateKey: t,
  itemComponentId: e,
  itemPath: n,
  localIndex: s,
  arraySetter: l,
  rebuildStateShape: i,
  renderFn: a
}) {
  const [, f] = R({}), { ref: g, inView: M } = ue(), p = C(null), c = be(p), S = C(!1), d = [t, ...n].join(".");
  $(t, e, f);
  const h = j(
    (u) => {
      p.current = u, g(u);
    },
    [g]
  );
  W(() => {
    const u = Se(d, (J) => {
      f({});
    });
    return () => u();
  }, [d]), W(() => {
    if (!M || !c || S.current)
      return;
    const u = p.current;
    if (u && u.offsetHeight > 0) {
      S.current = !0;
      const J = u.offsetHeight;
      F(t, n, {
        virtualizer: {
          itemHeight: J,
          domRef: u
        }
      });
      const A = n.slice(0, -1), P = [t, ...A].join(".");
      _(P, {
        type: "ITEMHEIGHT",
        itemKey: n.join("."),
        ref: p.current
      });
    }
  }, [M, c, t, n]);
  const T = x(t, n);
  if (T === void 0)
    return null;
  const o = i({
    currentState: T,
    path: n,
    componentId: e
  }), v = a(o, s, l);
  return /* @__PURE__ */ L("div", { ref: h, children: v });
}
function Ne({
  stateKey: t,
  path: e,
  rebuildStateShape: n,
  renderFn: s,
  formOpts: l,
  setState: i
}) {
  const a = C(K()).current, [, f] = R({}), g = C(null), M = [t, ...e].join(".");
  $(t, a, f);
  const c = m.getState().getShadowNode(t, e)?._meta?.typeInfo, S = c?.schema, d = x(t, e), [h, T] = R(d), o = C(!1), v = C(null);
  W(() => {
    !o.current && !le(d, h) && T(d);
  }, [d]), W(() => {
    const { setShadowMetadata: r } = m.getState();
    r(t, e, { formRef: g });
    const b = m.getState().subscribeToPath(M, (I) => {
      !o.current && h !== I && f({});
    });
    return () => {
      b(), v.current && (clearTimeout(v.current), o.current = !1);
      const I = m.getState().getShadowMetadata(t, e);
      I && I.formRef && r(t, e, { formRef: void 0 });
    };
  }, []);
  const u = j(
    (r, b) => {
      if (!m.getState().getShadowMetadata(t, [])?.features?.validationEnabled) return;
      const y = de(t)?.validation;
      if (!y) return;
      const U = fe(t, e) || {}, oe = U?.validation?.status;
      let D = !1, H;
      if (b === "onBlur" && y.onBlur ? (D = !0, H = y.onBlur ?? "error") : b === "onChange" && (y.onChange ? (D = !0, H = y.onChange) : oe === "INVALID" && (D = !0, H = "warning")), !D) return;
      let E = null;
      if (S && D) {
        const w = S.safeParse(r);
        w.success ? E = { success: !0 } : E = {
          success: !1,
          message: ("issues" in w.error ? w.error.issues : w.error.errors)[0]?.message || "Invalid value"
        };
      } else {
        const w = y.zodSchemaV4 || y.zodSchemaV3;
        if (!w) return;
        const q = x(t, []), V = JSON.parse(JSON.stringify(q));
        let O = V;
        for (let N = 0; N < e.length - 1; N++)
          O[e[N]] || (O[e[N]] = {}), O = O[e[N]];
        e.length > 0 ? O[e[e.length - 1]] = r : Object.assign(V, r);
        const z = w.safeParse(V);
        if (z.success)
          E = { success: !0 };
        else {
          const k = ("issues" in z.error ? z.error.issues : z.error.errors).filter((G) => {
            if (e.some((B) => B.startsWith("id:"))) {
              const B = e[0].startsWith("id:") ? [] : e.slice(0, -1), Q = m.getState().getShadowMetadata(t, B);
              if (Q?.arrayKeys) {
                e.slice(0, -1).join(".");
                const se = Q.arrayKeys.findIndex(
                  (ae) => ae === e[e.length - 2]
                ), ie = [...B, se, ...e.slice(-1)];
                return JSON.stringify(G.path) === JSON.stringify(ie);
              }
            }
            return JSON.stringify(G.path) === JSON.stringify(e);
          });
          k.length > 0 ? E = {
            success: !1,
            message: k[0]?.message
          } : E = { success: !0 };
        }
      }
      E && (E.success ? F(t, e, {
        ...U,
        validation: {
          status: "VALID",
          errors: [],
          lastValidated: Date.now(),
          validatedValue: r
        }
      }) : F(t, e, {
        ...U,
        validation: {
          status: "INVALID",
          errors: [
            {
              source: "client",
              message: E.message,
              severity: H
            }
          ],
          lastValidated: Date.now(),
          validatedValue: r
        }
      })), f({});
    },
    [t, e, S]
  ), J = j(
    (r) => {
      c ? c.type === "number" && typeof r == "string" ? r = r === "" ? c.nullable ? null : c.default ?? 0 : Number(r) : c.type === "boolean" && typeof r == "string" ? r = r === "true" || r === "1" : c.type === "date" && typeof r == "string" && (r = new Date(r)) : typeof d === "number" && typeof r == "string" && (r = r === "" ? 0 : Number(r)), T(r), u(r, "onChange"), o.current = !0, v.current && clearTimeout(v.current);
      const b = l?.debounceTime ?? 200;
      v.current = setTimeout(() => {
        o.current = !1, i(r, e, { updateType: "update" });
      }, b);
    },
    [
      i,
      e,
      l?.debounceTime,
      u,
      c,
      d
    ]
  ), A = `${t}.__focusedElement`, P = { path: e, ref: g }, ee = j(() => {
    const r = m.getState().getShadowMetadata(t, []) || {};
    F(t, [], {
      ...r,
      focusedElement: { path: e, ref: g }
    }), _(A, P);
  }, [t, e, g]), te = j(() => {
    v.current && (clearTimeout(v.current), v.current = null, o.current = !1, i(h, e, { updateType: "update" })), queueMicrotask(() => {
      const r = m.getState().getShadowMetadata(t, []) || {};
      r.focusedElement && JSON.stringify(r.focusedElement.path) === JSON.stringify(e) && (F(t, [], {
        focusedElement: null
      }), _(A, null));
    }), u(h, "onBlur");
  }, [h, i, e, u, t]), re = n({
    path: e,
    componentId: a,
    meta: void 0
  }), ne = new Proxy(re, {
    get(r, b) {
      return b === "$inputProps" ? {
        value: h ?? "",
        onChange: (I) => {
          J(I.target.value);
        },
        onFocus: ee,
        onBlur: te,
        ref: g
      } : r[b];
    }
  });
  return /* @__PURE__ */ L(he, { formOpts: l, path: e, stateKey: t, children: s(ne) });
}
function $(t, e, n) {
  const s = `${t}////${e}`;
  Z(() => (ge(t, s, {
    forceUpdate: () => n({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    me(t, s);
  }), [t, s]);
}
const be = (t) => {
  const [e, n] = R(!1);
  return Z(() => {
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
  const [l] = R(() => K()), [, i] = R({}), a = [t, ...e].join(".");
  $(t, l, i), W(() => {
    const g = m.getState().subscribeToPath(a, () => {
      i({});
    });
    return () => g();
  }, [a]);
  const f = n({
    path: e,
    componentId: l,
    meta: void 0
  });
  return /* @__PURE__ */ L(Y, { children: s(f) });
}
export {
  Ne as FormElementWrapper,
  Ce as IsolatedComponentWrapper,
  ve as ListItemWrapper,
  we as MemoizedCogsItemWrapper,
  he as ValidationWrapper,
  $ as useRegisterComponent
};
//# sourceMappingURL=Components.jsx.map
