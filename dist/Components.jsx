import { jsx as F, Fragment as K } from "react/jsx-runtime";
import { pluginStore as R } from "./pluginStore.js";
import Z, { memo as ge, useState as j, useRef as L, useCallback as O, useEffect as J, useLayoutEffect as ee, useMemo as me } from "react";
import { getGlobalStore as p } from "./store.js";
import { useInView as Se } from "react-intersection-observer";
import { v4 as te } from "uuid";
import { isDeepEqual as pe } from "./utility.js";
const {
  getInitialOptions: ve,
  getShadowMetadata: he,
  setShadowMetadata: H,
  getShadowValue: V,
  registerComponent: be,
  unregisterComponent: Ie,
  notifyPathSubscribers: _,
  subscribeToPath: Me
} = p.getState(), { getHookResult: Ee, pluginOptions: Te } = R.getState();
function ye({
  formOpts: t,
  path: e,
  stateKey: n,
  children: s
}) {
  const { getInitialOptions: l, getShadowMetadata: i, getShadowValue: a } = p.getState(), m = l(n), E = i(n, e)?.validation, T = E?.status || "NOT_VALIDATED", c = (E?.errors || []).map((o) => ({
    ...o,
    path: e
  })), v = c.filter((o) => o.severity === "error").map((o) => o.message), d = c.filter((o) => o.severity === "warning").map((o) => o.message), f = v[0] || d[0], y = v.length > 0 ? "error" : d.length > 0 ? "warning" : void 0;
  return /* @__PURE__ */ F(K, { children: m?.formElements?.validation && !t?.validation?.disable ? m.formElements.validation({
    children: /* @__PURE__ */ F(Z.Fragment, { children: s }, e.toString()),
    status: T,
    // Now passes the new ValidationStatus type
    message: t?.validation?.hideMessage ? "" : t?.validation?.message || f || "",
    severity: y,
    hasErrors: v.length > 0,
    hasWarnings: d.length > 0,
    allErrors: c,
    path: e,
    getData: () => a(n, e)
  }) : /* @__PURE__ */ F(Z.Fragment, { children: s }, e.toString()) });
}
const Oe = ge(
  we,
  (t, e) => t.itemPath.join(".") === e.itemPath.join(".") && t.stateKey === e.stateKey && t.itemComponentId === e.itemComponentId && t.localIndex === e.localIndex
);
function we({
  stateKey: t,
  itemComponentId: e,
  itemPath: n,
  localIndex: s,
  arraySetter: l,
  rebuildStateShape: i,
  renderFn: a
}) {
  const [, m] = j({}), { ref: S, inView: E } = Se(), T = L(null), c = Ce(T), v = L(!1), d = [t, ...n].join(".");
  $(t, e, m);
  const f = O(
    (g) => {
      T.current = g, S(g);
    },
    [S]
  );
  J(() => {
    const g = Me(d, (U) => {
      m({});
    });
    return () => g();
  }, [d]), J(() => {
    if (!E || !c || v.current)
      return;
    const g = T.current;
    if (g && g.offsetHeight > 0) {
      v.current = !0;
      const U = g.offsetHeight;
      H(t, n, {
        virtualizer: {
          itemHeight: U,
          domRef: g
        }
      });
      const C = n.slice(0, -1), B = [t, ...C].join(".");
      _(B, {
        type: "ITEMHEIGHT",
        itemKey: n.join("."),
        ref: T.current
      });
    }
  }, [E, c, t, n]);
  const y = V(t, n);
  if (y === void 0)
    return null;
  const o = i({
    currentState: y,
    path: n,
    componentId: e
  }), h = a(o, s, l);
  return /* @__PURE__ */ F("div", { ref: f, children: h });
}
function He({
  stateKey: t,
  path: e,
  rebuildStateShape: n,
  renderFn: s,
  formOpts: l,
  setState: i
}) {
  const a = L(te()).current, [, m] = j({}), S = L(null), E = [t, ...e].join(".");
  $(t, a, m);
  const c = p.getState().getShadowNode(t, e)?._meta?.typeInfo, v = c?.schema, d = V(t, e), [f, y] = j(d), o = L(!1), h = L(null), g = R.getState().stateHandlers.get(t), U = me(() => R.getState().getPluginConfigsForState(t).filter((r) => typeof r.plugin.formWrapper == "function"), [t]);
  J(() => {
    !o.current && !pe(d, f) && y(d);
  }, [d]), J(() => {
    const { setShadowMetadata: r } = p.getState();
    r(t, e, { formRef: S });
    const u = p.getState().subscribeToPath(E, (b) => {
      !o.current && f !== b && m({});
    });
    return () => {
      u(), h.current && (clearTimeout(h.current), o.current = !1);
      const b = p.getState().getShadowMetadata(t, e);
      b && b.formRef && r(t, e, { formRef: void 0 });
    };
  }, []);
  const C = O(
    (r, u) => {
      if (!p.getState().getShadowMetadata(t, [])?.features?.validationEnabled) return;
      const I = ve(t)?.validation;
      if (!I) return;
      const k = he(t, e) || {}, ue = k?.validation?.status;
      let D = !1, A;
      if (u === "onBlur" && I.onBlur ? (D = !0, A = I.onBlur ?? "error") : u === "onChange" && (I.onChange ? (D = !0, A = I.onChange) : ue === "INVALID" && (D = !0, A = "warning")), !D) return;
      let M = null;
      if (v && D) {
        const w = v.safeParse(r);
        w.success ? M = { success: !0 } : M = {
          success: !1,
          message: ("issues" in w.error ? w.error.issues : w.error.errors)[0]?.message || "Invalid value"
        };
      } else {
        const w = I.zodSchemaV4 || I.zodSchemaV3;
        if (!w) return;
        const G = V(t, []), x = JSON.parse(JSON.stringify(G));
        let W = x;
        for (let N = 0; N < e.length - 1; N++)
          W[e[N]] || (W[e[N]] = {}), W = W[e[N]];
        e.length > 0 ? W[e[e.length - 1]] = r : Object.assign(x, r);
        const P = w.safeParse(x);
        if (P.success)
          M = { success: !0 };
        else {
          const Q = ("issues" in P.error ? P.error.issues : P.error.errors).filter((X) => {
            if (e.some((z) => z.startsWith("id:"))) {
              const z = e[0].startsWith("id:") ? [] : e.slice(0, -1), Y = p.getState().getShadowMetadata(t, z);
              if (Y?.arrayKeys) {
                e.slice(0, -1).join(".");
                const le = Y.arrayKeys.findIndex(
                  (fe) => fe === e[e.length - 2]
                ), de = [...z, le, ...e.slice(-1)];
                return JSON.stringify(X.path) === JSON.stringify(de);
              }
            }
            return JSON.stringify(X.path) === JSON.stringify(e);
          });
          Q.length > 0 ? M = {
            success: !1,
            message: Q[0]?.message
          } : M = { success: !0 };
        }
      }
      M && (M.success ? H(t, e, {
        ...k,
        validation: {
          status: "VALID",
          errors: [],
          lastValidated: Date.now(),
          validatedValue: r
        }
      }) : H(t, e, {
        ...k,
        validation: {
          status: "INVALID",
          errors: [
            {
              source: "client",
              message: M.message,
              severity: A
            }
          ],
          lastValidated: Date.now(),
          validatedValue: r
        }
      })), m({});
    },
    [t, e, v]
  ), B = O(
    (r) => {
      c ? c.type === "number" && typeof r == "string" ? r = r === "" ? c.nullable ? null : c.default ?? 0 : Number(r) : c.type === "boolean" && typeof r == "string" ? r = r === "true" || r === "1" : c.type === "date" && typeof r == "string" && (r = new Date(r)) : typeof d === "number" && typeof r == "string" && (r = r === "" ? 0 : Number(r)), y(r), R.getState().notifyFormUpdate({
        stateKey: t,
        type: "input",
        path: e.join("."),
        value: r
      }), C(r, "onChange"), o.current = !0, h.current && clearTimeout(h.current);
      const u = l?.debounceTime ?? 200;
      h.current = setTimeout(() => {
        o.current = !1, i(r, e, { updateType: "update" });
      }, u);
    },
    [
      i,
      e,
      l?.debounceTime,
      C,
      c,
      d
    ]
  ), q = `${t}.__focusedElement`, re = { path: e, ref: S }, ne = O(() => {
    const r = p.getState().getShadowMetadata(t, []) || {};
    H(t, [], {
      ...r,
      focusedElement: { path: e, ref: S }
    }), _(q, re), R.getState().notifyFormUpdate({
      stateKey: t,
      type: "focus",
      path: e.join("."),
      value: f
    });
  }, [t, e, S]), oe = O(() => {
    h.current && (clearTimeout(h.current), h.current = null, o.current = !1, i(f, e, { updateType: "update" })), queueMicrotask(() => {
      const r = p.getState().getShadowMetadata(t, []) || {};
      r.focusedElement && JSON.stringify(r.focusedElement.path) === JSON.stringify(e) && (H(t, [], {
        focusedElement: null
      }), _(q, null), R.getState().notifyFormUpdate({
        stateKey: t,
        type: "blur",
        path: e.join("."),
        value: f
      }));
    }), C(f, "onBlur");
  }, [f, i, e, C, t]), se = n({
    path: e,
    componentId: a,
    meta: void 0
  }), ie = new Proxy(se, {
    get(r, u) {
      return u === "$inputProps" ? {
        value: f ?? "",
        onChange: (b) => {
          B(b.target.value);
        },
        onFocus: ne,
        onBlur: oe,
        ref: S
      } : r[u];
    }
  }), ae = s(ie), ce = U.reduceRight(
    (r, u) => {
      if (!g)
        return r;
      const b = Te.get(t)?.get(u.plugin.name), I = Ee(t, u.plugin.name);
      return u.plugin.formWrapper ? u.plugin.formWrapper(
        r,
        g,
        b,
        I
      ) : r;
    },
    ae
  );
  return /* @__PURE__ */ F(ye, { formOpts: l, path: e, stateKey: t, children: ce });
}
function $(t, e, n) {
  const s = `${t}////${e}`;
  ee(() => (be(t, s, {
    forceUpdate: () => n({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    Ie(t, s);
  }), [t, s]);
}
const Ce = (t) => {
  const [e, n] = j(!1);
  return ee(() => {
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
function Je({
  stateKey: t,
  path: e,
  rebuildStateShape: n,
  renderFn: s
}) {
  const [l] = j(() => te()), [, i] = j({}), a = [t, ...e].join(".");
  $(t, l, i), J(() => {
    const S = p.getState().subscribeToPath(a, () => {
      i({});
    });
    return () => S();
  }, [a]);
  const m = n({
    path: e,
    componentId: l,
    meta: void 0
  });
  return /* @__PURE__ */ F(K, { children: s(m) });
}
export {
  He as FormElementWrapper,
  Je as IsolatedComponentWrapper,
  we as ListItemWrapper,
  Oe as MemoizedCogsItemWrapper,
  ye as ValidationWrapper,
  $ as useRegisterComponent
};
//# sourceMappingURL=Components.jsx.map
