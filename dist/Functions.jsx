import { jsx as v, Fragment as I } from "react/jsx-runtime";
import "./CogsState.jsx";
import { getNestedValue as F, isFunction as B, updateNestedProperty as V } from "./utility.js";
import G, { useState as N, useRef as y, useEffect as b } from "react";
import { getGlobalStore as l, formRefStore as D } from "./store.js";
import { validateZodPathFunc as Y } from "./useValidateZodPath.js";
function Z(o, e, n, r) {
  o(
    (t) => {
      if (B(e)) {
        const s = e(F(t, n));
        let i = V(n, t, s);
        return typeof i == "string" && (i = i.trim()), i;
      } else {
        let s = !n || n.length == 0 ? e : V(n, t, e);
        return typeof s == "string" && (s = s.trim()), s;
      }
    },
    n,
    { updateType: "update" },
    r
  );
}
function ee(o, e, n, r, t) {
  const s = l.getState().getNestedState(r, n);
  o(
    (i) => {
      let u = !n || n.length == 0 ? i : F(i, [...n]), c = [...u];
      return c.splice(
        Number(t) == 0 ? t : u.length,
        0,
        B(e) ? e(u) : e
      ), n.length == 0 ? c : V([...n], i, c);
    },
    [
      ...n,
      (s.length - 1).toString()
    ],
    {
      updateType: "insert"
    }
  );
}
function te(o, e, n, r) {
  const t = l.getState().getNestedState(n, e);
  o(
    (s) => {
      const i = F(s, [...e]);
      if (r < 0 || r >= i?.length)
        throw new Error(`Index ${r} does not exist in the array.`);
      const u = r || Number(r) == 0 ? r : i.length - 1, c = [
        ...i.slice(0, u),
        ...i.slice(u + 1)
      ];
      return e.length == 0 ? c : V([...e], s, c);
    },
    [
      ...e,
      r || r === 0 ? r?.toString() : (t.length - 1).toString()
    ],
    { updateType: "cut" }
  );
}
const R = (o, e, n = (r, t) => JSON.stringify(r) === JSON.stringify(t)) => {
  const [r, t] = N(
    () => e(l.getState(), o)
  ), s = y(r), i = y(o);
  return b(() => {
    i.current = o, t(e(l.getState(), o));
    const u = (d) => {
      const a = e(d, i.current);
      n(s.current, a) || (s.current = a, t(a));
    }, c = l.subscribe(u);
    return () => {
      c();
    };
  }, [o]), r;
}, _ = (o, e, n) => {
  const r = o + "." + (e.length > 0 ? [e.join(".")] : []) + (n && n.length > 0 ? "." + n : "");
  return R(
    r,
    (s, i) => s.getValidationErrors(i) || []
  );
}, q = (o, e) => {
  const n = `${o}:${e.join(".")}`;
  return R(
    n,
    (r, t) => r.getSyncInfo(t)
  );
}, H = (o, e) => R(
  `${o}:${e.join(".")}`,
  (n, r) => n.getNestedState(o, e)
), ne = ({
  setState: o,
  path: e,
  child: n,
  formOpts: r,
  stateKey: t
}) => {
  const [s, i] = N({}), { registerFormRef: u, getFormRef: c } = D.getState(), d = t + "." + e.join("."), a = y(null), T = c(d);
  T || u(t + "." + e.join("."), a);
  const M = T || a, {
    getValidationErrors: U,
    addValidationError: z,
    getInitialOptions: A,
    removeValidationError: w
  } = l.getState(), E = H(t, e), [k, C] = N(
    l.getState().getNestedState(t, e)
  ), m = A(t);
  if (!m?.validation?.key)
    throw new Error(
      "Validation key not found. You need to set it in the options for the createCogsState function"
    );
  const f = m.validation.key;
  m.validation.onBlur, b(() => {
    C(E);
  }, [t, e.join("."), E]);
  const S = y();
  let $ = (g, O) => {
    C(g), S.current && clearTimeout(S.current), S.current = setTimeout(
      () => {
        Z(o, g, e, f);
      },
      r?.debounceTime ?? (typeof E == "boolean" ? 20 : 200)
    );
  };
  const J = async () => {
    if (m.validation?.zodSchema) {
      w(f + "." + e.join("."));
      try {
        const g = l.getState().getNestedState(t, e);
        await Y(
          f,
          m.validation.zodSchema,
          e,
          g
        ), i({});
      } catch (g) {
        console.error("Validation error:", g);
      }
    }
  };
  b(() => () => {
    S.current && clearTimeout(S.current);
  }, []);
  const j = q(t, e), P = j ? {
    ...j,
    date: new Date(j.timeStamp)
  } : null, W = n({
    get: () => k || l.getState().getNestedState(t, e),
    set: $,
    syncStatus: P,
    path: e,
    validationErrors: () => U(f + "." + e.join(".")),
    addValidationError: (g) => {
      w(f + "." + e.join(".")), z(f + "." + e.join("."), g ?? "");
    },
    inputProps: {
      value: k || l.getState().getNestedState(t, e) || "",
      onChange: (g) => $(g.target.value),
      onBlur: J,
      ref: M
    }
  });
  return /* @__PURE__ */ v(I, { children: /* @__PURE__ */ v(
    L,
    {
      formOpts: r,
      path: e,
      validationKey: f,
      stateKey: t,
      children: W
    }
  ) });
};
function L({
  formOpts: o,
  path: e,
  validationKey: n,
  stateKey: r,
  children: t,
  validIndices: s
}) {
  const { getInitialOptions: i } = l.getState(), u = _(
    n,
    e,
    s
  );
  console.log(
    "validationErrors ValidationWrapper",
    r,
    e,
    u
  );
  const c = [];
  if (u) {
    const a = u.join(", ");
    c.includes(a) || c.push(a);
  }
  const d = i(r);
  return /* @__PURE__ */ v(I, { children: d?.formElements?.validation && !o?.validation?.disable ? d.formElements.validation({
    children: /* @__PURE__ */ v(G.Fragment, { children: t }, e.toString()),
    active: u.length > 0,
    message: o?.validation?.hideMessage ? "" : o?.validation?.message ? o?.validation?.message : c.map((a) => a).join(", "),
    path: e,
    ...o?.key && { key: o?.key }
  }) : /* @__PURE__ */ v(G.Fragment, { children: t }, e.toString()) });
}
export {
  ne as FormControlComponent,
  L as ValidationWrapper,
  te as cutFunc,
  ee as pushFunc,
  Z as updateFn,
  H as useGetKeyState,
  q as useGetSyncInfo,
  _ as useGetValidationErrors,
  R as useStoreSubscription
};
//# sourceMappingURL=Functions.jsx.map
