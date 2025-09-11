import { jsx as C, Fragment as $ } from "react/jsx-runtime";
import { pluginStore as W } from "./pluginStore.js";
import { createMetadataContext as ge, toDeconstructedMethods as me } from "./plugins.js";
import Z, { memo as K, useState as R, useRef as D, useCallback as P, useEffect as O, useLayoutEffect as ee, useMemo as Se } from "react";
import { getGlobalStore as b } from "./store.js";
import { useInView as pe } from "react-intersection-observer";
import { v4 as te } from "uuid";
import { isDeepEqual as be } from "./utility.js";
const {
  getInitialOptions: he,
  getShadowMetadata: ve,
  setShadowMetadata: j,
  getShadowValue: _,
  registerComponent: Ie,
  unregisterComponent: Ee,
  notifyPathSubscribers: k,
  subscribeToPath: Me
} = b.getState(), { stateHandlers: Te, notifyFormUpdate: V } = W.getState();
function Ce({
  formOpts: t,
  path: e,
  stateKey: n,
  children: o
}) {
  const { getInitialOptions: l, getShadowMetadata: s, getShadowValue: i } = b.getState(), f = l(n), I = s(n, e)?.validation, E = I?.status || "NOT_VALIDATED", u = (I?.errors || []).map((a) => ({
    ...a,
    path: e
  })), S = u.filter((a) => a.severity === "error").map((a) => a.message), g = u.filter((a) => a.severity === "warning").map((a) => a.message), d = S[0] || g[0], M = S.length > 0 ? "error" : g.length > 0 ? "warning" : void 0;
  return /* @__PURE__ */ C($, { children: f?.formElements?.validation && !t?.validation?.disable ? f.formElements.validation({
    children: /* @__PURE__ */ C(Z.Fragment, { children: o }, e.toString()),
    status: E,
    // Now passes the new ValidationStatus type
    message: t?.validation?.hideMessage ? "" : t?.validation?.message || d || "",
    severity: M,
    hasErrors: S.length > 0,
    hasWarnings: g.length > 0,
    allErrors: u,
    path: e,
    getData: () => i(n, e)
  }) : /* @__PURE__ */ C(Z.Fragment, { children: o }, e.toString()) });
}
const He = K(
  we,
  (t, e) => t.itemPath.join(".") === e.itemPath.join(".") && t.stateKey === e.stateKey && t.itemComponentId === e.itemComponentId && t.localIndex === e.localIndex
);
function we({
  stateKey: t,
  itemComponentId: e,
  itemPath: n,
  localIndex: o,
  arraySetter: l,
  rebuildStateShape: s,
  renderFn: i
}) {
  const [, f] = R({}), { ref: m, inView: I } = pe(), E = D(null), u = Ne(E), S = D(!1), g = [t, ...n].join(".");
  q(t, e, f);
  const d = P(
    (p) => {
      E.current = p, m(p);
    },
    [m]
  );
  O(() => {
    const p = Me(g, (w) => {
      f({});
    });
    return () => p();
  }, [g]), O(() => {
    if (!I || !u || S.current)
      return;
    const p = E.current;
    if (p && p.offsetHeight > 0) {
      S.current = !0;
      const w = p.offsetHeight;
      j(t, n, {
        virtualizer: {
          itemHeight: w,
          domRef: p
        }
      });
      const U = n.slice(0, -1), H = [t, ...U].join(".");
      k(H, {
        type: "ITEMHEIGHT",
        itemKey: n.join("."),
        ref: E.current
      });
    }
  }, [I, u, t, n]);
  const M = _(t, n);
  if (M === void 0)
    return null;
  const a = s({
    currentState: M,
    path: n,
    componentId: e
  }), v = i(a, o, l);
  return /* @__PURE__ */ C("div", { ref: d, children: v });
}
function Be({
  stateKey: t,
  path: e,
  rebuildStateShape: n,
  renderFn: o,
  formOpts: l,
  setState: s
}) {
  const i = D(te()).current, [, f] = R({}), m = D(null), I = [t, ...e].join(".");
  q(t, i, f);
  const u = b.getState().getShadowNode(t, e)?._meta?.typeInfo, S = u?.schema;
  console.log("fieldSchema", S);
  const g = _(t, e), [d, M] = R(g), a = D(!1), v = D(null);
  Te.get(t);
  const p = Se(() => W.getState().getPluginConfigsForState(t).filter((r) => typeof r.plugin.formWrapper == "function"), [t]);
  O(() => {
    !a.current && !be(g, d) && M(g);
  }, [g]), O(() => {
    const { setShadowMetadata: r } = b.getState();
    r(t, e, { formRef: m });
    const h = b.getState().subscribeToPath(I, (c) => {
      !a.current && d !== c && f({});
    });
    return () => {
      h(), v.current && (clearTimeout(v.current), a.current = !1);
      const c = b.getState().getShadowMetadata(t, e);
      c && c.formRef && r(t, e, { formRef: void 0 });
    };
  }, []);
  const w = P(
    (r, h) => {
      const c = he(t)?.validation;
      if (console.log("validationOptions", c), !c) return;
      const x = ve(t, e) || {}, le = x?.validation?.status;
      let y = !1, B;
      if (h === "onBlur" && c.onBlur ? (y = !0, B = c.onBlur ?? "error") : h === "onChange" && (c.onChange ? (y = !0, B = c.onChange) : le === "INVALID" && (y = !0, B = "warning")), console.log("shouldValidate", y), !y) return;
      let T = null;
      if (S && y) {
        const N = S.safeParse(r);
        N.success ? T = { success: !0 } : T = {
          success: !1,
          message: ("issues" in N.error ? N.error.issues : N.error.errors)[0]?.message || "Invalid value"
        };
      } else {
        const N = c.zodSchemaV4 || c.zodSchemaV3;
        if (!N) return;
        const G = _(t, []), z = JSON.parse(JSON.stringify(G));
        let F = z;
        for (let L = 0; L < e.length - 1; L++)
          F[e[L]] || (F[e[L]] = {}), F = F[e[L]];
        e.length > 0 ? F[e[e.length - 1]] = r : Object.assign(z, r);
        const J = N.safeParse(z);
        if (J.success)
          T = { success: !0 };
        else {
          const Q = ("issues" in J.error ? J.error.issues : J.error.errors).filter((X) => {
            if (e.some((A) => A.startsWith("id:"))) {
              const A = e[0].startsWith("id:") ? [] : e.slice(0, -1), Y = b.getState().getShadowMetadata(t, A);
              if (Y?.arrayKeys) {
                e.slice(0, -1).join(".");
                const ue = Y.arrayKeys.findIndex(
                  (fe) => fe === e[e.length - 2]
                ), de = [...A, ue, ...e.slice(-1)];
                return JSON.stringify(X.path) === JSON.stringify(de);
              }
            }
            return JSON.stringify(X.path) === JSON.stringify(e);
          });
          Q.length > 0 ? T = {
            success: !1,
            message: Q[0]?.message
          } : T = { success: !0 };
        }
      }
      T && (T.success ? j(t, e, {
        ...x,
        validation: {
          status: "VALID",
          errors: [],
          lastValidated: Date.now(),
          validatedValue: r
        }
      }) : j(t, e, {
        ...x,
        validation: {
          status: "INVALID",
          errors: [
            {
              source: "client",
              message: T.message,
              severity: B
            }
          ],
          lastValidated: Date.now(),
          validatedValue: r
        }
      })), f({});
    },
    [t, e, S]
  ), U = P(
    (r) => {
      u ? u.type === "number" && typeof r == "string" ? r = r === "" ? u.nullable ? null : u.default ?? 0 : Number(r) : u.type === "boolean" && typeof r == "string" ? r = r === "true" || r === "1" : u.type === "date" && typeof r == "string" && (r = new Date(r)) : typeof g === "number" && typeof r == "string" && (r = r === "" ? 0 : Number(r)), M(r), V({
        stateKey: t,
        type: "input",
        path: e,
        value: r
      }), w(r, "onChange"), a.current = !0, v.current && clearTimeout(v.current);
      const h = l?.debounceTime ?? 200;
      v.current = setTimeout(() => {
        a.current = !1, s(r, e, { updateType: "update" });
      }, h);
    },
    [
      s,
      e,
      l?.debounceTime,
      w,
      u,
      g
    ]
  ), H = `${t}.__focusedElement`, re = { path: e, ref: m }, ne = P(() => {
    const r = b.getState().getShadowMetadata(t, []) || {};
    j(t, [], {
      ...r,
      focusedElement: { path: e, ref: m }
    }), k(H, re), V({
      stateKey: t,
      type: "focus",
      path: e,
      value: d
    });
  }, [t, e, m]), oe = P(() => {
    v.current && (clearTimeout(v.current), v.current = null, a.current = !1, s(d, e, { updateType: "update" })), console.log("handleBlur"), queueMicrotask(() => {
      const r = b.getState().getShadowMetadata(t, []) || {};
      r.focusedElement && JSON.stringify(r.focusedElement.path) === JSON.stringify(e) && (j(t, [], {
        focusedElement: null
      }), k(H, null), V({
        stateKey: t,
        type: "blur",
        path: e,
        value: d
      }));
    }), console.log("handleBlur", d), w(d, "onBlur");
  }, [d, s, e, w, t]), se = n({
    path: e,
    componentId: i,
    meta: void 0
  }), ie = new Proxy(se, {
    get(r, h) {
      return h === "$inputProps" ? {
        value: d ?? "",
        onChange: (c) => {
          U(c.target.value);
        },
        onFocus: ne,
        onBlur: oe,
        ref: m
      } : r[h];
    }
  }), ae = o(ie), ce = p.reduceRight(
    (r, h, c) => /* @__PURE__ */ C(
      Re,
      {
        stateKey: t,
        path: e,
        pluginName: h.plugin.name,
        wrapperDepth: p.length - 1 - c,
        children: r
      }
    ),
    ae
  );
  return /* @__PURE__ */ C(Ce, { formOpts: l, path: e, stateKey: t, children: ce });
}
function q(t, e, n) {
  const o = `${t}////${e}`;
  ee(() => (Ie(t, o, {
    forceUpdate: () => n({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    Ee(t, o);
  }), [t, o]);
}
const Ne = (t) => {
  const [e, n] = R(!1);
  return ee(() => {
    if (!t.current) {
      n(!0);
      return;
    }
    const o = Array.from(t.current.querySelectorAll("img"));
    if (o.length === 0) {
      n(!0);
      return;
    }
    let l = 0;
    const s = () => {
      l++, l === o.length && n(!0);
    };
    return o.forEach((i) => {
      i.complete ? s() : (i.addEventListener("load", s), i.addEventListener("error", s));
    }), () => {
      o.forEach((i) => {
        i.removeEventListener("load", s), i.removeEventListener("error", s);
      });
    };
  }, [t.current]), e;
};
function Je({
  stateKey: t,
  path: e,
  rebuildStateShape: n,
  renderFn: o
}) {
  const [l] = R(() => te()), [, s] = R({}), i = [t, ...e].join(".");
  q(t, l, s), O(() => {
    const m = b.getState().subscribeToPath(i, () => {
      s({});
    });
    return () => m();
  }, [i]);
  const f = n({
    path: e,
    componentId: l,
    meta: void 0
  });
  return /* @__PURE__ */ C($, { children: o(f) });
}
const Re = K(function({
  children: e,
  stateKey: n,
  path: o,
  pluginName: l,
  wrapperDepth: s
}) {
  const [, i] = R({});
  O(() => {
    const d = [n, ...o].join(".");
    return b.getState().subscribeToPath(d, () => {
      i({});
    });
  }, [n, o]);
  const f = W.getState().registeredPlugins.find((d) => d.name === l), m = W.getState().stateHandlers.get(n), I = b.getState().getShadowNode(n, o)?._meta?.typeInfo, E = W.getState().pluginOptions.get(n)?.get(l), u = W.getState().getHookResult(n, l);
  if (!f?.formWrapper || !m)
    return /* @__PURE__ */ C($, { children: e });
  const S = ge(n, f.name), g = me(m);
  return f.formWrapper({
    element: e,
    path: o,
    stateKey: n,
    pluginName: f.name,
    ...g,
    ...S,
    options: E,
    hookData: u,
    fieldType: I?.type,
    wrapperDepth: s
  });
});
export {
  Be as FormElementWrapper,
  Je as IsolatedComponentWrapper,
  we as ListItemWrapper,
  He as MemoizedCogsItemWrapper,
  Ce as ValidationWrapper,
  q as useRegisterComponent
};
//# sourceMappingURL=Components.jsx.map
