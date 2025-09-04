import { jsx as L, Fragment as Z } from "react/jsx-runtime";
import { pluginStore as V } from "./pluginStore.js";
import Y, { memo as ue, useState as R, useRef as C, useCallback as D, useEffect as W, useLayoutEffect as K } from "react";
import { getGlobalStore as S } from "./store.js";
import { useInView as le } from "react-intersection-observer";
import { v4 as ee } from "uuid";
import { isDeepEqual as de } from "./utility.js";
const {
  getInitialOptions: fe,
  getShadowMetadata: ge,
  setShadowMetadata: O,
  getShadowValue: _,
  registerComponent: me,
  unregisterComponent: Se,
  notifyPathSubscribers: $,
  subscribeToPath: ve
} = S.getState();
function he({
  formOpts: t,
  path: e,
  stateKey: n,
  children: s
}) {
  const { getInitialOptions: l, getShadowMetadata: i, getShadowValue: a } = S.getState(), g = l(n), E = i(n, e)?.validation, M = E?.status || "NOT_VALIDATED", c = (E?.errors || []).map((o) => ({
    ...o,
    path: e
  })), v = c.filter((o) => o.severity === "error").map((o) => o.message), d = c.filter((o) => o.severity === "warning").map((o) => o.message), f = v[0] || d[0], y = v.length > 0 ? "error" : d.length > 0 ? "warning" : void 0;
  return /* @__PURE__ */ L(Z, { children: g?.formElements?.validation && !t?.validation?.disable ? g.formElements.validation({
    children: /* @__PURE__ */ L(Y.Fragment, { children: s }, e.toString()),
    status: M,
    // Now passes the new ValidationStatus type
    message: t?.validation?.hideMessage ? "" : t?.validation?.message || f || "",
    severity: y,
    hasErrors: v.length > 0,
    hasWarnings: d.length > 0,
    allErrors: c,
    path: e,
    getData: () => a(n, e)
  }) : /* @__PURE__ */ L(Y.Fragment, { children: s }, e.toString()) });
}
const Ce = ue(
  be,
  (t, e) => t.itemPath.join(".") === e.itemPath.join(".") && t.stateKey === e.stateKey && t.itemComponentId === e.itemComponentId && t.localIndex === e.localIndex
);
function be({
  stateKey: t,
  itemComponentId: e,
  itemPath: n,
  localIndex: s,
  arraySetter: l,
  rebuildStateShape: i,
  renderFn: a
}) {
  const [, g] = R({}), { ref: m, inView: E } = le(), M = C(null), c = Ie(M), v = C(!1), d = [t, ...n].join(".");
  q(t, e, g);
  const f = D(
    (u) => {
      M.current = u, m(u);
    },
    [m]
  );
  W(() => {
    const u = ve(d, (J) => {
      g({});
    });
    return () => u();
  }, [d]), W(() => {
    if (!E || !c || v.current)
      return;
    const u = M.current;
    if (u && u.offsetHeight > 0) {
      v.current = !0;
      const J = u.offsetHeight;
      O(t, n, {
        virtualizer: {
          itemHeight: J,
          domRef: u
        }
      });
      const U = n.slice(0, -1), B = [t, ...U].join(".");
      $(B, {
        type: "ITEMHEIGHT",
        itemKey: n.join("."),
        ref: M.current
      });
    }
  }, [E, c, t, n]);
  const y = _(t, n);
  if (y === void 0)
    return null;
  const o = i({
    currentState: y,
    path: n,
    componentId: e
  }), h = a(o, s, l);
  return /* @__PURE__ */ L("div", { ref: f, children: h });
}
function Le({
  stateKey: t,
  path: e,
  rebuildStateShape: n,
  renderFn: s,
  formOpts: l,
  setState: i
}) {
  const a = C(ee()).current, [, g] = R({}), m = C(null), E = [t, ...e].join(".");
  q(t, a, g);
  const c = S.getState().getShadowNode(t, e)?._meta?.typeInfo, v = c?.schema, d = _(t, e), [f, y] = R(d), o = C(!1), h = C(null);
  W(() => {
    !o.current && !de(d, f) && y(d);
  }, [d]), W(() => {
    const { setShadowMetadata: r } = S.getState();
    r(t, e, { formRef: m });
    const b = S.getState().subscribeToPath(E, (I) => {
      !o.current && f !== I && g({});
    });
    return () => {
      b(), h.current && (clearTimeout(h.current), o.current = !1);
      const I = S.getState().getShadowMetadata(t, e);
      I && I.formRef && r(t, e, { formRef: void 0 });
    };
  }, []);
  const u = D(
    (r, b) => {
      if (!S.getState().getShadowMetadata(t, [])?.features?.validationEnabled) return;
      const T = fe(t)?.validation;
      if (!T) return;
      const P = ge(t, e) || {}, se = P?.validation?.status;
      let j = !1, A;
      if (b === "onBlur" && T.onBlur ? (j = !0, A = T.onBlur ?? "error") : b === "onChange" && (T.onChange ? (j = !0, A = T.onChange) : se === "INVALID" && (j = !0, A = "warning")), !j) return;
      let p = null;
      if (v && j) {
        const N = v.safeParse(r);
        N.success ? p = { success: !0 } : p = {
          success: !1,
          message: ("issues" in N.error ? N.error.issues : N.error.errors)[0]?.message || "Invalid value"
        };
      } else {
        const N = T.zodSchemaV4 || T.zodSchemaV3;
        if (!N) return;
        const k = _(t, []), x = JSON.parse(JSON.stringify(k));
        let F = x;
        for (let w = 0; w < e.length - 1; w++)
          F[e[w]] || (F[e[w]] = {}), F = F[e[w]];
        e.length > 0 ? F[e[e.length - 1]] = r : Object.assign(x, r);
        const H = N.safeParse(x);
        if (H.success)
          p = { success: !0 };
        else {
          const G = ("issues" in H.error ? H.error.issues : H.error.errors).filter((Q) => {
            if (e.some((z) => z.startsWith("id:"))) {
              const z = e[0].startsWith("id:") ? [] : e.slice(0, -1), X = S.getState().getShadowMetadata(t, z);
              if (X?.arrayKeys) {
                e.slice(0, -1).join(".");
                const ie = X.arrayKeys.findIndex(
                  (ce) => ce === e[e.length - 2]
                ), ae = [...z, ie, ...e.slice(-1)];
                return JSON.stringify(Q.path) === JSON.stringify(ae);
              }
            }
            return JSON.stringify(Q.path) === JSON.stringify(e);
          });
          G.length > 0 ? p = {
            success: !1,
            message: G[0]?.message
          } : p = { success: !0 };
        }
      }
      p && (p.success ? O(t, e, {
        ...P,
        validation: {
          status: "VALID",
          errors: [],
          lastValidated: Date.now(),
          validatedValue: r
        }
      }) : O(t, e, {
        ...P,
        validation: {
          status: "INVALID",
          errors: [
            {
              source: "client",
              message: p.message,
              severity: A
            }
          ],
          lastValidated: Date.now(),
          validatedValue: r
        }
      })), g({});
    },
    [t, e, v]
  ), J = D(
    (r) => {
      c ? c.type === "number" && typeof r == "string" ? r = r === "" ? c.nullable ? null : c.default ?? 0 : Number(r) : c.type === "boolean" && typeof r == "string" ? r = r === "true" || r === "1" : c.type === "date" && typeof r == "string" && (r = new Date(r)) : typeof d === "number" && typeof r == "string" && (r = r === "" ? 0 : Number(r)), y(r), V.getState().notifyFormUpdate({
        stateKey: t,
        type: "input",
        path: e.join("."),
        value: r
      }), u(r, "onChange"), o.current = !0, h.current && clearTimeout(h.current);
      const b = l?.debounceTime ?? 200;
      h.current = setTimeout(() => {
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
  ), U = `${t}.__focusedElement`, B = { path: e, ref: m }, te = D(() => {
    const r = S.getState().getShadowMetadata(t, []) || {};
    O(t, [], {
      ...r,
      focusedElement: { path: e, ref: m }
    }), $(U, B), V.getState().notifyFormUpdate({
      stateKey: t,
      type: "focus",
      path: e.join("."),
      value: f
    });
  }, [t, e, m]), re = D(() => {
    h.current && (clearTimeout(h.current), h.current = null, o.current = !1, i(f, e, { updateType: "update" })), queueMicrotask(() => {
      const r = S.getState().getShadowMetadata(t, []) || {};
      r.focusedElement && JSON.stringify(r.focusedElement.path) === JSON.stringify(e) && (O(t, [], {
        focusedElement: null
      }), $(U, null), V.getState().notifyFormUpdate({
        stateKey: t,
        type: "blur",
        path: e.join("."),
        value: f
      }));
    }), u(f, "onBlur");
  }, [f, i, e, u, t]), ne = n({
    path: e,
    componentId: a,
    meta: void 0
  }), oe = new Proxy(ne, {
    get(r, b) {
      return b === "$inputProps" ? {
        value: f ?? "",
        onChange: (I) => {
          J(I.target.value);
        },
        onFocus: te,
        onBlur: re,
        ref: m
      } : r[b];
    }
  });
  return /* @__PURE__ */ L(he, { formOpts: l, path: e, stateKey: t, children: s(oe) });
}
function q(t, e, n) {
  const s = `${t}////${e}`;
  K(() => (me(t, s, {
    forceUpdate: () => n({}),
    paths: /* @__PURE__ */ new Set(),
    reactiveType: ["component"]
  }), () => {
    Se(t, s);
  }), [t, s]);
}
const Ie = (t) => {
  const [e, n] = R(!1);
  return K(() => {
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
function Re({
  stateKey: t,
  path: e,
  rebuildStateShape: n,
  renderFn: s
}) {
  const [l] = R(() => ee()), [, i] = R({}), a = [t, ...e].join(".");
  q(t, l, i), W(() => {
    const m = S.getState().subscribeToPath(a, () => {
      i({});
    });
    return () => m();
  }, [a]);
  const g = n({
    path: e,
    componentId: l,
    meta: void 0
  });
  return /* @__PURE__ */ L(Z, { children: s(g) });
}
export {
  Le as FormElementWrapper,
  Re as IsolatedComponentWrapper,
  be as ListItemWrapper,
  Ce as MemoizedCogsItemWrapper,
  he as ValidationWrapper,
  q as useRegisterComponent
};
//# sourceMappingURL=Components.jsx.map
