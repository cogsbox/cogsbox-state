import { jsx as F, Fragment as K } from "react/jsx-runtime";
import { pluginStore as E } from "./pluginStore.js";
import { createMetadataContext as ge } from "./plugins.js";
import Z, { memo as me, useState as O, useRef as L, useCallback as J, useEffect as x, useLayoutEffect as ee, useMemo as Se } from "react";
import { getGlobalStore as p } from "./store.js";
import { useInView as pe } from "react-intersection-observer";
import { v4 as te } from "uuid";
import { isDeepEqual as ve } from "./utility.js";
const {
  getInitialOptions: he,
  getShadowMetadata: be,
  setShadowMetadata: U,
  getShadowValue: V,
  registerComponent: Ie,
  unregisterComponent: Me,
  notifyPathSubscribers: _,
  subscribeToPath: Ee
} = p.getState(), { getHookResult: We, pluginOptions: He } = E.getState();
function Te({
  formOpts: e,
  path: t,
  stateKey: n,
  children: s
}) {
  const { getInitialOptions: l, getShadowMetadata: i, getShadowValue: a } = p.getState(), m = l(n), T = i(n, t)?.validation, C = T?.status || "NOT_VALIDATED", c = (T?.errors || []).map((o) => ({
    ...o,
    path: t
  })), v = c.filter((o) => o.severity === "error").map((o) => o.message), d = c.filter((o) => o.severity === "warning").map((o) => o.message), f = v[0] || d[0], w = v.length > 0 ? "error" : d.length > 0 ? "warning" : void 0;
  return /* @__PURE__ */ F(K, { children: m?.formElements?.validation && !e?.validation?.disable ? m.formElements.validation({
    children: /* @__PURE__ */ F(Z.Fragment, { children: s }, t.toString()),
    status: C,
    // Now passes the new ValidationStatus type
    message: e?.validation?.hideMessage ? "" : e?.validation?.message || f || "",
    severity: w,
    hasErrors: v.length > 0,
    hasWarnings: d.length > 0,
    allErrors: c,
    path: t,
    getData: () => a(n, t)
  }) : /* @__PURE__ */ F(Z.Fragment, { children: s }, t.toString()) });
}
const Je = me(
  Ce,
  (e, t) => e.itemPath.join(".") === t.itemPath.join(".") && e.stateKey === t.stateKey && e.itemComponentId === t.itemComponentId && e.localIndex === t.localIndex
);
function Ce({
  stateKey: e,
  itemComponentId: t,
  itemPath: n,
  localIndex: s,
  arraySetter: l,
  rebuildStateShape: i,
  renderFn: a
}) {
  const [, m] = O({}), { ref: S, inView: T } = pe(), C = L(null), c = we(C), v = L(!1), d = [e, ...n].join(".");
  $(e, t, m);
  const f = J(
    (g) => {
      C.current = g, S(g);
    },
    [S]
  );
  x(() => {
    const g = Ee(d, (j) => {
      m({});
    });
    return () => g();
  }, [d]), x(() => {
    if (!T || !c || v.current)
      return;
    const g = C.current;
    if (g && g.offsetHeight > 0) {
      v.current = !0;
      const j = g.offsetHeight;
      U(e, n, {
        virtualizer: {
          itemHeight: j,
          domRef: g
        }
      });
      const R = n.slice(0, -1), B = [e, ...R].join(".");
      _(B, {
        type: "ITEMHEIGHT",
        itemKey: n.join("."),
        ref: C.current
      });
    }
  }, [T, c, e, n]);
  const w = V(e, n);
  if (w === void 0)
    return null;
  const o = i({
    currentState: w,
    path: n,
    componentId: t
  }), h = a(o, s, l);
  return /* @__PURE__ */ F("div", { ref: f, children: h });
}
function Ue({
  stateKey: e,
  path: t,
  rebuildStateShape: n,
  renderFn: s,
  formOpts: l,
  setState: i
}) {
  const a = L(te()).current, [, m] = O({}), S = L(null), T = [e, ...t].join(".");
  $(e, a, m);
  const c = p.getState().getShadowNode(e, t)?._meta?.typeInfo, v = c?.schema, d = V(e, t), [f, w] = O(d), o = L(!1), h = L(null), g = E.getState().stateHandlers.get(e), j = Se(() => E.getState().getPluginConfigsForState(e).filter((r) => typeof r.plugin.formWrapper == "function"), [e]);
  x(() => {
    !o.current && !ve(d, f) && w(d);
  }, [d]), x(() => {
    const { setShadowMetadata: r } = p.getState();
    r(e, t, { formRef: S });
    const u = p.getState().subscribeToPath(T, (b) => {
      !o.current && f !== b && m({});
    });
    return () => {
      u(), h.current && (clearTimeout(h.current), o.current = !1);
      const b = p.getState().getShadowMetadata(e, t);
      b && b.formRef && r(e, t, { formRef: void 0 });
    };
  }, []);
  const R = J(
    (r, u) => {
      if (!p.getState().getShadowMetadata(e, [])?.features?.validationEnabled) return;
      const I = he(e)?.validation;
      if (!I) return;
      const D = be(e, t) || {}, ue = D?.validation?.status;
      let W = !1, A;
      if (u === "onBlur" && I.onBlur ? (W = !0, A = I.onBlur ?? "error") : u === "onChange" && (I.onChange ? (W = !0, A = I.onChange) : ue === "INVALID" && (W = !0, A = "warning")), !W) return;
      let M = null;
      if (v && W) {
        const y = v.safeParse(r);
        y.success ? M = { success: !0 } : M = {
          success: !1,
          message: ("issues" in y.error ? y.error.issues : y.error.errors)[0]?.message || "Invalid value"
        };
      } else {
        const y = I.zodSchemaV4 || I.zodSchemaV3;
        if (!y) return;
        const G = V(e, []), k = JSON.parse(JSON.stringify(G));
        let H = k;
        for (let N = 0; N < t.length - 1; N++)
          H[t[N]] || (H[t[N]] = {}), H = H[t[N]];
        t.length > 0 ? H[t[t.length - 1]] = r : Object.assign(k, r);
        const P = y.safeParse(k);
        if (P.success)
          M = { success: !0 };
        else {
          const Q = ("issues" in P.error ? P.error.issues : P.error.errors).filter((X) => {
            if (t.some((z) => z.startsWith("id:"))) {
              const z = t[0].startsWith("id:") ? [] : t.slice(0, -1), Y = p.getState().getShadowMetadata(e, z);
              if (Y?.arrayKeys) {
                t.slice(0, -1).join(".");
                const le = Y.arrayKeys.findIndex(
                  (fe) => fe === t[t.length - 2]
                ), de = [...z, le, ...t.slice(-1)];
                return JSON.stringify(X.path) === JSON.stringify(de);
              }
            }
            return JSON.stringify(X.path) === JSON.stringify(t);
          });
          Q.length > 0 ? M = {
            success: !1,
            message: Q[0]?.message
          } : M = { success: !0 };
        }
      }
      M && (M.success ? U(e, t, {
        ...D,
        validation: {
          status: "VALID",
          errors: [],
          lastValidated: Date.now(),
          validatedValue: r
        }
      }) : U(e, t, {
        ...D,
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
    [e, t, v]
  ), B = J(
    (r) => {
      c ? c.type === "number" && typeof r == "string" ? r = r === "" ? c.nullable ? null : c.default ?? 0 : Number(r) : c.type === "boolean" && typeof r == "string" ? r = r === "true" || r === "1" : c.type === "date" && typeof r == "string" && (r = new Date(r)) : typeof d === "number" && typeof r == "string" && (r = r === "" ? 0 : Number(r)), w(r), E.getState().notifyFormUpdate({
        stateKey: e,
        type: "input",
        path: t.join("."),
        value: r
      }), R(r, "onChange"), o.current = !0, h.current && clearTimeout(h.current);
      const u = l?.debounceTime ?? 200;
      h.current = setTimeout(() => {
        o.current = !1, i(r, t, { updateType: "update" });
      }, u);
    },
    [
      i,
      t,
      l?.debounceTime,
      R,
      c,
      d
    ]
  ), q = `${e}.__focusedElement`, re = { path: t, ref: S }, ne = J(() => {
    const r = p.getState().getShadowMetadata(e, []) || {};
    U(e, [], {
      ...r,
      focusedElement: { path: t, ref: S }
    }), _(q, re), E.getState().notifyFormUpdate({
      stateKey: e,
      type: "focus",
      path: t.join("."),
      value: f
    });
  }, [e, t, S]), oe = J(() => {
    h.current && (clearTimeout(h.current), h.current = null, o.current = !1, i(f, t, { updateType: "update" })), queueMicrotask(() => {
      const r = p.getState().getShadowMetadata(e, []) || {};
      r.focusedElement && JSON.stringify(r.focusedElement.path) === JSON.stringify(t) && (U(e, [], {
        focusedElement: null
      }), _(q, null), E.getState().notifyFormUpdate({
        stateKey: e,
        type: "blur",
        path: t.join("."),
        value: f
      }));
    }), R(f, "onBlur");
  }, [f, i, t, R, e]), se = n({
    path: t,
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
  }), ae = s(ie), ce = j.reduceRight(
    (r, u) => {
      if (!g)
        return r;
      const b = ge(
        e,
        u.plugin.name
      ), I = E.getState().pluginOptions.get(e)?.get(u.plugin.name), D = E.getState().getHookResult(e, u.plugin.name);
      return u.plugin.formWrapper ? u.plugin.formWrapper({
        element: r,
        path: t,
        stateKey: e,
        cogsState: g,
        ...b,
        // Spread all the metadata functions
        options: I,
        hookData: D,
        fieldType: c?.type,
        wrapperDepth: j.indexOf(u)
      }) : r;
    },
    ae
  );
  return /* @__PURE__ */ F(Te, { formOpts: l, path: t, stateKey: e, children: ce });
}
function $(e, t, n) {
  const s = `${e}////${t}`;
  ee(() => (Ie(e, s, {
    forceUpdate: () => n({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    Me(e, s);
  }), [e, s]);
}
const we = (e) => {
  const [t, n] = O(!1);
  return ee(() => {
    if (!e.current) {
      n(!0);
      return;
    }
    const s = Array.from(e.current.querySelectorAll("img"));
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
  }, [e.current]), t;
};
function xe({
  stateKey: e,
  path: t,
  rebuildStateShape: n,
  renderFn: s
}) {
  const [l] = O(() => te()), [, i] = O({}), a = [e, ...t].join(".");
  $(e, l, i), x(() => {
    const S = p.getState().subscribeToPath(a, () => {
      i({});
    });
    return () => S();
  }, [a]);
  const m = n({
    path: t,
    componentId: l,
    meta: void 0
  });
  return /* @__PURE__ */ F(K, { children: s(m) });
}
export {
  Ue as FormElementWrapper,
  xe as IsolatedComponentWrapper,
  Ce as ListItemWrapper,
  Je as MemoizedCogsItemWrapper,
  Te as ValidationWrapper,
  $ as useRegisterComponent
};
//# sourceMappingURL=Components.jsx.map
