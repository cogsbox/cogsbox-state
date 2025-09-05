import { jsx as L, Fragment as ee } from "react/jsx-runtime";
import { pluginStore as B } from "./pluginStore.js";
import { createMetadataContext as me } from "./plugins.js";
import K, { memo as Se, useState as j, useRef as y, useCallback as H, useEffect as x, useLayoutEffect as te, useMemo as pe } from "react";
import { getGlobalStore as p } from "./store.js";
import { useInView as ve } from "react-intersection-observer";
import { v4 as re } from "uuid";
import { isDeepEqual as he } from "./utility.js";
const {
  getInitialOptions: be,
  getShadowMetadata: Ie,
  setShadowMetadata: J,
  getShadowValue: _,
  registerComponent: Me,
  unregisterComponent: Ee,
  notifyPathSubscribers: $,
  subscribeToPath: Te
} = p.getState(), { stateHandlers: Ce, notifyFormUpdate: V } = B.getState();
function we({
  formOpts: e,
  path: t,
  stateKey: n,
  children: s
}) {
  const { getInitialOptions: l, getShadowMetadata: i, getShadowValue: a } = p.getState(), m = l(n), E = i(n, t)?.validation, T = E?.status || "NOT_VALIDATED", c = (E?.errors || []).map((o) => ({
    ...o,
    path: t
  })), v = c.filter((o) => o.severity === "error").map((o) => o.message), d = c.filter((o) => o.severity === "warning").map((o) => o.message), f = v[0] || d[0], C = v.length > 0 ? "error" : d.length > 0 ? "warning" : void 0;
  return /* @__PURE__ */ L(ee, { children: m?.formElements?.validation && !e?.validation?.disable ? m.formElements.validation({
    children: /* @__PURE__ */ L(K.Fragment, { children: s }, t.toString()),
    status: T,
    // Now passes the new ValidationStatus type
    message: e?.validation?.hideMessage ? "" : e?.validation?.message || f || "",
    severity: C,
    hasErrors: v.length > 0,
    hasWarnings: d.length > 0,
    allErrors: c,
    path: t,
    getData: () => a(n, t)
  }) : /* @__PURE__ */ L(K.Fragment, { children: s }, t.toString()) });
}
const Je = Se(
  Ne,
  (e, t) => e.itemPath.join(".") === t.itemPath.join(".") && e.stateKey === t.stateKey && e.itemComponentId === t.itemComponentId && e.localIndex === t.localIndex
);
function Ne({
  stateKey: e,
  itemComponentId: t,
  itemPath: n,
  localIndex: s,
  arraySetter: l,
  rebuildStateShape: i,
  renderFn: a
}) {
  const [, m] = j({}), { ref: S, inView: E } = ve(), T = y(null), c = Re(T), v = y(!1), d = [e, ...n].join(".");
  q(e, t, m);
  const f = H(
    (g) => {
      T.current = g, S(g);
    },
    [S]
  );
  x(() => {
    const g = Te(d, (D) => {
      m({});
    });
    return () => g();
  }, [d]), x(() => {
    if (!E || !c || v.current)
      return;
    const g = T.current;
    if (g && g.offsetHeight > 0) {
      v.current = !0;
      const D = g.offsetHeight;
      J(e, n, {
        virtualizer: {
          itemHeight: D,
          domRef: g
        }
      });
      const N = n.slice(0, -1), U = [e, ...N].join(".");
      $(U, {
        type: "ITEMHEIGHT",
        itemKey: n.join("."),
        ref: T.current
      });
    }
  }, [E, c, e, n]);
  const C = _(e, n);
  if (C === void 0)
    return null;
  const o = i({
    currentState: C,
    path: n,
    componentId: t
  }), h = a(o, s, l);
  return /* @__PURE__ */ L("div", { ref: f, children: h });
}
function xe({
  stateKey: e,
  path: t,
  rebuildStateShape: n,
  renderFn: s,
  formOpts: l,
  setState: i
}) {
  const a = y(re()).current, [, m] = j({}), S = y(null), E = [e, ...t].join(".");
  q(e, a, m);
  const c = p.getState().getShadowNode(e, t)?._meta?.typeInfo, v = c?.schema, d = _(e, t), [f, C] = j(d), o = y(!1), h = y(null), g = Ce.get(e), D = pe(() => B.getState().getPluginConfigsForState(e).filter((r) => typeof r.plugin.formWrapper == "function"), [e]);
  x(() => {
    !o.current && !he(d, f) && C(d);
  }, [d]), x(() => {
    const { setShadowMetadata: r } = p.getState();
    r(e, t, { formRef: S });
    const u = p.getState().subscribeToPath(E, (b) => {
      !o.current && f !== b && m({});
    });
    return () => {
      u(), h.current && (clearTimeout(h.current), o.current = !1);
      const b = p.getState().getShadowMetadata(e, t);
      b && b.formRef && r(e, t, { formRef: void 0 });
    };
  }, []);
  const N = H(
    (r, u) => {
      if (!p.getState().getShadowMetadata(e, [])?.features?.validationEnabled) return;
      const I = be(e)?.validation;
      if (!I) return;
      const O = Ie(e, t) || {}, le = O?.validation?.status;
      let W = !1, A;
      if (u === "onBlur" && I.onBlur ? (W = !0, A = I.onBlur ?? "error") : u === "onChange" && (I.onChange ? (W = !0, A = I.onChange) : le === "INVALID" && (W = !0, A = "warning")), !W) return;
      let M = null;
      if (v && W) {
        const w = v.safeParse(r);
        w.success ? M = { success: !0 } : M = {
          success: !1,
          message: ("issues" in w.error ? w.error.issues : w.error.errors)[0]?.message || "Invalid value"
        };
      } else {
        const w = I.zodSchemaV4 || I.zodSchemaV3;
        if (!w) return;
        const Q = _(e, []), k = JSON.parse(JSON.stringify(Q));
        let F = k;
        for (let R = 0; R < t.length - 1; R++)
          F[t[R]] || (F[t[R]] = {}), F = F[t[R]];
        t.length > 0 ? F[t[t.length - 1]] = r : Object.assign(k, r);
        const P = w.safeParse(k);
        if (P.success)
          M = { success: !0 };
        else {
          const X = ("issues" in P.error ? P.error.issues : P.error.errors).filter((Y) => {
            if (t.some((z) => z.startsWith("id:"))) {
              const z = t[0].startsWith("id:") ? [] : t.slice(0, -1), Z = p.getState().getShadowMetadata(e, z);
              if (Z?.arrayKeys) {
                t.slice(0, -1).join(".");
                const de = Z.arrayKeys.findIndex(
                  (ge) => ge === t[t.length - 2]
                ), fe = [...z, de, ...t.slice(-1)];
                return JSON.stringify(Y.path) === JSON.stringify(fe);
              }
            }
            return JSON.stringify(Y.path) === JSON.stringify(t);
          });
          X.length > 0 ? M = {
            success: !1,
            message: X[0]?.message
          } : M = { success: !0 };
        }
      }
      M && (M.success ? J(e, t, {
        ...O,
        validation: {
          status: "VALID",
          errors: [],
          lastValidated: Date.now(),
          validatedValue: r
        }
      }) : J(e, t, {
        ...O,
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
  ), U = H(
    (r) => {
      c ? c.type === "number" && typeof r == "string" ? r = r === "" ? c.nullable ? null : c.default ?? 0 : Number(r) : c.type === "boolean" && typeof r == "string" ? r = r === "true" || r === "1" : c.type === "date" && typeof r == "string" && (r = new Date(r)) : typeof d === "number" && typeof r == "string" && (r = r === "" ? 0 : Number(r)), C(r), V({
        stateKey: e,
        type: "input",
        path: t.join("."),
        value: r
      }), N(r, "onChange"), o.current = !0, h.current && clearTimeout(h.current);
      const u = l?.debounceTime ?? 200;
      h.current = setTimeout(() => {
        o.current = !1, i(r, t, { updateType: "update" });
      }, u);
    },
    [
      i,
      t,
      l?.debounceTime,
      N,
      c,
      d
    ]
  ), G = `${e}.__focusedElement`, ne = { path: t, ref: S }, oe = H(() => {
    const r = p.getState().getShadowMetadata(e, []) || {};
    J(e, [], {
      ...r,
      focusedElement: { path: t, ref: S }
    }), $(G, ne), V({
      stateKey: e,
      type: "focus",
      path: t.join("."),
      value: f
    });
  }, [e, t, S]), se = H(() => {
    h.current && (clearTimeout(h.current), h.current = null, o.current = !1, i(f, t, { updateType: "update" })), queueMicrotask(() => {
      const r = p.getState().getShadowMetadata(e, []) || {};
      r.focusedElement && JSON.stringify(r.focusedElement.path) === JSON.stringify(t) && (J(e, [], {
        focusedElement: null
      }), $(G, null), V({
        stateKey: e,
        type: "blur",
        path: t.join("."),
        value: f
      }));
    }), N(f, "onBlur");
  }, [f, i, t, N, e]), ie = n({
    path: t,
    componentId: a,
    meta: void 0
  }), ae = new Proxy(ie, {
    get(r, u) {
      return u === "$inputProps" ? {
        value: f ?? "",
        onChange: (b) => {
          U(b.target.value);
        },
        onFocus: oe,
        onBlur: se,
        ref: S
      } : r[u];
    }
  }), ce = s(ae), ue = D.reduceRight(
    (r, u) => {
      if (!g)
        return r;
      const b = me(
        e,
        u.plugin.name
      ), I = B.getState().pluginOptions.get(e)?.get(u.plugin.name), O = B.getState().getHookResult(e, u.plugin.name);
      return u.plugin.formWrapper ? u.plugin.formWrapper({
        element: r,
        path: t,
        stateKey: e,
        cogsState: g,
        ...b,
        // Spread all the metadata functions
        options: I,
        hookData: O,
        fieldType: c?.type,
        wrapperDepth: D.indexOf(u)
      }) : r;
    },
    ce
  );
  return /* @__PURE__ */ L(we, { formOpts: l, path: t, stateKey: e, children: ue });
}
function q(e, t, n) {
  const s = `${e}////${t}`;
  te(() => (Me(e, s, {
    forceUpdate: () => n({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    Ee(e, s);
  }), [e, s]);
}
const Re = (e) => {
  const [t, n] = j(!1);
  return te(() => {
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
function Ae({
  stateKey: e,
  path: t,
  rebuildStateShape: n,
  renderFn: s
}) {
  const [l] = j(() => re()), [, i] = j({}), a = [e, ...t].join(".");
  q(e, l, i), x(() => {
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
  return /* @__PURE__ */ L(ee, { children: s(m) });
}
export {
  xe as FormElementWrapper,
  Ae as IsolatedComponentWrapper,
  Ne as ListItemWrapper,
  Je as MemoizedCogsItemWrapper,
  we as ValidationWrapper,
  q as useRegisterComponent
};
//# sourceMappingURL=Components.jsx.map
