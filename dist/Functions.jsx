import { jsx as V, Fragment as I } from "react/jsx-runtime";
import "./CogsState.jsx";
import { getNestedValue as F, isFunction as B, updateNestedProperty as v } from "./utility.js";
import G, { useState as N, useRef as E, useEffect as b } from "react";
import { getGlobalStore as l, formRefStore as D } from "./store.js";
import { validateZodPathFunc as Y } from "./useValidateZodPath.js";
function Z(o, e, t, r) {
  o(
    (n) => {
      if (B(e)) {
        const s = e(F(n, t));
        let i = v(t, n, s);
        return typeof i == "string" && (i = i.trim()), i;
      } else {
        let s = !t || t.length == 0 ? e : v(t, n, e);
        return typeof s == "string" && (s = s.trim()), s;
      }
    },
    t,
    { updateType: "update" },
    r
  );
}
function ee(o, e, t, r, n) {
  const s = l.getState().getNestedState(r, t);
  o(
    (i) => {
      let u = !t || t.length == 0 ? i : F(i, [...t]), c = [...u];
      return c.splice(
        Number(n) == 0 ? n : u.length,
        0,
        B(e) ? e(u) : e
      ), t.length == 0 ? c : v([...t], i, c);
    },
    [
      ...t,
      (s.length - 1).toString()
    ],
    {
      updateType: "insert"
    }
  );
}
function te(o, e, t, r) {
  const n = l.getState().getNestedState(t, e);
  o(
    (s) => {
      const i = F(s, [...e]);
      if (r < 0 || r >= i?.length)
        throw new Error(`Index ${r} does not exist in the array.`);
      const u = r || Number(r) == 0 ? r : i.length - 1, c = [
        ...i.slice(0, u),
        ...i.slice(u + 1)
      ];
      return e.length == 0 ? c : v([...e], s, c);
    },
    [
      ...e,
      r || r === 0 ? r?.toString() : (n.length - 1).toString()
    ],
    { updateType: "cut" }
  );
}
const R = (o, e, t = (r, n) => JSON.stringify(r) === JSON.stringify(n)) => {
  const [r, n] = N(
    () => e(l.getState(), o)
  ), s = E(r), i = E(o);
  return b(() => {
    i.current = o, n(e(l.getState(), o));
    const u = (d) => {
      const a = e(d, i.current);
      t(s.current, a) || (s.current = a, n(a));
    }, c = l.subscribe(u);
    return () => {
      c();
    };
  }, [o]), r;
}, _ = (o, e, t) => {
  const r = o + "." + (e.length > 0 ? [e.join(".")] : []) + (t && t.length > 0 ? "." + t : "");
  return R(
    r,
    (s, i) => s.getValidationErrors(i) || []
  );
}, q = (o, e) => {
  const t = `${o}:${e.join(".")}`;
  return R(
    t,
    (r, n) => r.getSyncInfo(n)
  );
}, H = (o, e) => R(
  `${o}:${e.join(".")}`,
  (t, r) => t.getNestedState(o, e)
), ne = ({
  setState: o,
  path: e,
  child: t,
  formOpts: r,
  stateKey: n
}) => {
  const [s, i] = N({}), { registerFormRef: u, getFormRef: c } = D.getState(), d = n + "." + e.join("."), a = E(null), T = c(d);
  T || u(n + "." + e.join("."), a);
  const M = T || a, {
    getValidationErrors: U,
    addValidationError: z,
    getInitialOptions: A,
    removeValidationError: w
  } = l.getState(), y = H(n, e), [k, C] = N(
    l.getState().getNestedState(n, e)
  ), m = A(n);
  if (!m?.validation?.key)
    throw new Error(
      "Validation key not found. You need to set it in the options for the createCogsState function"
    );
  const f = m.validation.key;
  m.validation.onBlur, b(() => {
    C(y);
  }, [n, e.join("."), y]);
  const S = E();
  let $ = (g, O) => {
    C(g), S.current && clearTimeout(S.current), S.current = setTimeout(
      () => {
        Z(o, g, e, f);
      },
      r?.debounceTime ?? (typeof y == "boolean" ? 20 : 200)
    );
  };
  const J = async () => {
    if (m.validation?.zodSchema) {
      w(f + "." + e.join("."));
      try {
        const g = l.getState().getNestedState(n, e);
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
  const j = q(n, e), P = j ? {
    ...j,
    date: new Date(j.timeStamp)
  } : null, W = t({
    get: () => k || l.getState().getNestedState(n, e),
    set: $,
    syncStatus: P,
    path: e,
    validationErrors: () => U(f + "." + e.join(".")),
    addValidationError: (g) => {
      w(f + "." + e.join(".")), z(f + "." + e.join("."), g ?? "");
    },
    inputProps: {
      value: k || l.getState().getNestedState(n, e) || "",
      onChange: (g) => $(g.target.value),
      onBlur: J,
      ref: M
    }
  });
  return /* @__PURE__ */ V(I, { children: /* @__PURE__ */ V(
    L,
    {
      formOpts: r,
      path: e,
      validationKey: f,
      stateKey: n,
      children: W
    }
  ) });
};
function L({
  formOpts: o,
  path: e,
  validationKey: t,
  stateKey: r,
  children: n,
  validIndices: s
}) {
  const { getInitialOptions: i } = l.getState(), u = _(
    t,
    e,
    s
  );
  console.log(
    "validationErrors ValidationWrapper",
    r,
    t,
    e,
    u
  );
  const c = [];
  if (u) {
    const a = u.join(", ");
    c.includes(a) || c.push(a);
  }
  const d = i(r);
  return /* @__PURE__ */ V(I, { children: d?.formElements?.validation && !o?.validation?.disable ? d.formElements.validation({
    children: /* @__PURE__ */ V(G.Fragment, { children: n }, e.toString()),
    active: u.length > 0,
    message: o?.validation?.hideMessage ? "" : o?.validation?.message ? o?.validation?.message : c.map((a) => a).join(", "),
    path: e,
    ...o?.key && { key: o?.key }
  }) : /* @__PURE__ */ V(G.Fragment, { children: n }, e.toString()) });
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
