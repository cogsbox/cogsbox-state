import { jsx as v, Fragment as I } from "react/jsx-runtime";
import "./CogsState.jsx";
import { getNestedValue as F, isFunction as B, updateNestedProperty as V } from "./utility.js";
import G, { useState as N, useRef as y, useEffect as b } from "react";
import { getGlobalStore as l, formRefStore as D } from "./store.js";
import { validateZodPathFunc as W } from "./useValidateZodPath.js";
function Y(o, t, n, r) {
  o(
    (e) => {
      if (B(t)) {
        const s = t(F(e, n));
        let i = V(n, e, s);
        return typeof i == "string" && (i = i.trim()), i;
      } else {
        let s = !n || n.length == 0 ? t : V(n, e, t);
        return typeof s == "string" && (s = s.trim()), s;
      }
    },
    n,
    { updateType: "update" },
    r
  );
}
function tt(o, t, n, r, e) {
  const s = l.getState().getNestedState(r, n);
  o(
    (i) => {
      let u = !n || n.length == 0 ? i : F(i, [...n]), c = [...u];
      return c.splice(
        Number(e) == 0 ? e : u.length,
        0,
        B(t) ? t(u) : t
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
function et(o, t, n, r) {
  const e = l.getState().getNestedState(n, t);
  o(
    (s) => {
      const i = F(s, [...t]);
      if (r < 0 || r >= i?.length)
        throw new Error(`Index ${r} does not exist in the array.`);
      const u = r || Number(r) == 0 ? r : i.length - 1, c = [
        ...i.slice(0, u),
        ...i.slice(u + 1)
      ];
      return t.length == 0 ? c : V([...t], s, c);
    },
    [
      ...t,
      r || r === 0 ? r?.toString() : (e.length - 1).toString()
    ],
    { updateType: "cut" }
  );
}
const R = (o, t, n = (r, e) => JSON.stringify(r) === JSON.stringify(e)) => {
  const [r, e] = N(
    () => t(l.getState(), o)
  ), s = y(r), i = y(o);
  return b(() => {
    i.current = o, e(t(l.getState(), o));
    const u = (d) => {
      const a = t(d, i.current);
      n(s.current, a) || (s.current = a, e(a));
    }, c = l.subscribe(u);
    return () => {
      c();
    };
  }, [o]), r;
}, Z = (o, t, n) => {
  const r = o + "." + (t.length > 0 ? [t.join(".")] : []) + (n && n.length > 0 ? "." + n : "");
  return R(
    r,
    (s, i) => s.getValidationErrors(i) || []
  );
}, _ = (o, t) => {
  const n = `${o}:${t.join(".")}`;
  return R(
    n,
    (r, e) => r.getSyncInfo(e)
  );
}, q = (o, t) => R(
  `${o}:${t.join(".")}`,
  (n, r) => n.getNestedState(o, t)
), nt = ({
  setState: o,
  path: t,
  child: n,
  formOpts: r,
  stateKey: e
}) => {
  const [s, i] = N({}), { registerFormRef: u, getFormRef: c } = D.getState(), d = e + "." + t.join("."), a = y(null), w = c(d);
  w || u(e + "." + t.join("."), a);
  const M = w || a, {
    getValidationErrors: O,
    addValidationError: U,
    getInitialOptions: z,
    removeValidationError: T
  } = l.getState(), j = q(e, t), [$, k] = N(
    l.getState().getNestedState(e, t)
  ), m = z(e);
  if (!m?.validation?.key)
    throw new Error(
      "Validation key not found. You need to set it in the options for the createCogsState function"
    );
  const f = m.validation.key;
  m.validation.onBlur, b(() => {
    k(j);
  }, [e, t.join("."), j]);
  const S = y();
  let C = (g, L) => {
    k(g), S.current && clearTimeout(S.current), S.current = setTimeout(
      () => {
        Y(o, g, t, f);
      },
      r?.debounceTime ?? (typeof j == "boolean" ? 20 : 200)
    );
  };
  const A = async () => {
    if (m.validation?.zodSchema) {
      T(f + "." + t.join("."));
      try {
        const g = l.getState().getNestedState(e, t);
        await W(
          f,
          m.validation.zodSchema,
          t,
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
  const E = _(e, t), J = E ? {
    ...E,
    date: new Date(E.timeStamp)
  } : null, P = n({
    get: () => $ || l.getState().getNestedState(e, t),
    set: C,
    syncStatus: J,
    path: t,
    validationErrors: () => O(f + "." + t.join(".")),
    addValidationError: (g) => {
      T(f + "." + t.join(".")), U(f + "." + t.join("."), g ?? "");
    },
    inputProps: {
      value: $ || l.getState().getNestedState(e, t) || "",
      onChange: (g) => C(g.target.value),
      onBlur: A,
      ref: M
    }
  });
  return /* @__PURE__ */ v(I, { children: /* @__PURE__ */ v(
    H,
    {
      formOpts: r,
      path: t,
      validationKey: f,
      stateKey: e,
      children: P
    }
  ) });
};
function H({
  formOpts: o,
  path: t,
  validationKey: n,
  stateKey: r,
  children: e,
  validIndices: s
}) {
  const { getInitialOptions: i } = l.getState(), u = Z(
    n,
    t,
    s || []
  ), c = [];
  if (u) {
    const a = u.join(", ");
    c.includes(a) || c.push(a);
  }
  const d = i(r);
  return /* @__PURE__ */ v(I, { children: d?.formElements?.validation && !o?.validation?.disable ? d.formElements.validation({
    children: /* @__PURE__ */ v(G.Fragment, { children: e }, `validation-${t.toString()}`),
    active: u.length > 0,
    message: o?.validation?.hideMessage ? "" : c.map((a) => a).join(", "),
    path: t,
    key: o?.key || `validation-wrapper-${t.join("-")}`
    // Always provide a key
  }) : /* @__PURE__ */ v(G.Fragment, { children: e }, `no-validation-${t.toString()}`) });
}
export {
  nt as FormControlComponent,
  H as ValidationWrapper,
  et as cutFunc,
  tt as pushFunc,
  Y as updateFn,
  q as useGetKeyState,
  _ as useGetSyncInfo,
  Z as useGetValidationErrors,
  R as useStoreSubscription
};
//# sourceMappingURL=Functions.jsx.map
