import { jsx as E, Fragment as P } from "react/jsx-runtime";
import "./CogsState.jsx";
import { getNestedValue as k, isFunction as z, updateNestedProperty as j } from "./utility.js";
import M, { useState as T, useRef as N, useEffect as w } from "react";
import { getGlobalStore as g, formRefStore as Y } from "./store.js";
import { validateZodPathFunc as Z } from "./useValidateZodPath.js";
function _(r, t, n, o) {
  r(
    (e) => {
      if (z(t)) {
        const i = t(k(e, n));
        let s = j(n, e, i);
        return typeof s == "string" && (s = s.trim()), s;
      } else {
        let i = !n || n.length == 0 ? t : j(n, e, t);
        return typeof i == "string" && (i = i.trim()), i;
      }
    },
    n,
    { updateType: "update" },
    o
  );
}
function tt(r, t, n, o, e) {
  const i = g.getState().getNestedState(o, n);
  r(
    (s) => {
      let u = !n || n.length == 0 ? s : k(s, [...n]), l = [...u];
      return l.splice(
        Number(e) == 0 ? e : u.length,
        0,
        z(t) ? t(u) : t
      ), n.length == 0 ? l : j([...n], s, l);
    },
    [
      ...n,
      (i.length - 1).toString()
    ],
    {
      updateType: "insert"
    }
  );
}
function et(r, t, n, o) {
  const e = g.getState().getNestedState(n, t);
  r(
    (i) => {
      const s = k(i, [...t]);
      if (o < 0 || o >= s?.length)
        throw new Error(`Index ${o} does not exist in the array.`);
      const u = o || Number(o) == 0 ? o : s.length - 1, l = [
        ...s.slice(0, u),
        ...s.slice(u + 1)
      ];
      return console.log(o), t.length == 0 ? l : j([...t], i, l);
    },
    [
      ...t,
      o || o === 0 ? o?.toString() : (e.length - 1).toString()
    ],
    { updateType: "cut" }
  );
}
const b = (r, t, n = (o, e) => JSON.stringify(o) === JSON.stringify(e)) => {
  const [o, e] = T(
    () => t(g.getState(), r)
  ), i = N(o), s = N(r);
  return w(() => {
    s.current = r, e(t(g.getState(), r));
    const u = (v) => {
      const c = t(v, s.current);
      n(i.current, c) || (i.current = c, e(c));
    }, l = g.subscribe(u);
    return () => {
      l();
    };
  }, [r]), o;
}, q = (r, t, n) => {
  const o = r + "." + (t.length > 0 ? [t.join(".")] : []) + (n && n.length > 0 ? "." + n : "");
  if (console.log("fullPath", o), n?.length === 0)
    return [];
  const e = b(
    o,
    (i, s) => i.getValidationErrors(s) || []
  );
  return console.log("returnresult", e), e;
}, H = (r, t) => {
  const n = `${r}:${t.join(".")}`;
  return b(
    n,
    (o, e) => o.getSyncInfo(e)
  );
}, I = (r, t) => b(
  `${r}:${t.join(".")}`,
  (n, o) => n.getNestedState(r, t)
), nt = ({
  setState: r,
  path: t,
  child: n,
  formOpts: o,
  stateKey: e
}) => {
  const [i, s] = T({}), { registerFormRef: u, getFormRef: l } = Y.getState(), v = e + "." + t.join("."), c = N(null), d = l(v);
  d || u(e + "." + t.join("."), c);
  const m = d || c, {
    getValidationErrors: F,
    addValidationError: U,
    getInitialOptions: A,
    removeValidationError: C
  } = g.getState(), y = I(e, t), [$, B] = T(
    g.getState().getNestedState(e, t)
  ), S = A(e);
  if (!S?.validation?.key)
    throw new Error(
      "Validation key not found. You need to set it in the options for the createCogsState function"
    );
  const f = S.validation.key;
  S.validation.onBlur, w(() => {
    B(y);
  }, [e, t.join("."), y]);
  const V = N();
  let G = (a, O) => {
    B(a), V.current && clearTimeout(V.current), V.current = setTimeout(
      () => {
        console.log(typeof y), _(r, a, t, f);
      },
      o?.debounceTime ?? (typeof y == "boolean" ? 20 : 200)
    );
  };
  const J = async () => {
    if (S.validation?.zodSchema) {
      C(f + "." + t.join("."));
      try {
        const a = g.getState().getNestedState(e, t);
        await Z(
          f,
          S.validation.zodSchema,
          t,
          a
        ), console.log(
          "Validation",
          e,
          S.validation.zodSchema,
          t,
          a
        ), s({});
      } catch (a) {
        console.error("Validation error:", a);
      }
    }
  };
  w(() => () => {
    V.current && clearTimeout(V.current);
  }, []);
  const R = H(e, t), D = R ? {
    ...R,
    date: new Date(R.timeStamp)
  } : null, W = n({
    get: () => $ || g.getState().getNestedState(e, t),
    set: G,
    syncStatus: D,
    path: t,
    validationErrors: () => F(f + "." + t.join(".")),
    addValidationError: (a) => {
      C(f + "." + t.join(".")), U(f + "." + t.join("."), a ?? "");
    },
    inputProps: {
      value: $ || g.getState().getNestedState(e, t) || "",
      onChange: (a) => G(a.target.value),
      onBlur: J,
      ref: m
    }
  });
  return /* @__PURE__ */ E(P, { children: /* @__PURE__ */ E(
    L,
    {
      formOpts: o,
      path: t,
      validationKey: f,
      stateKey: e,
      children: W
    }
  ) });
};
function L({
  formOpts: r,
  path: t,
  validationKey: n,
  stateKey: o,
  children: e,
  validIndices: i
}) {
  const { getInitialOptions: s } = g.getState(), u = n + "." + (t.length > 0 ? [t.join(".")] : []) + (i && i.length > 0 ? "." + i : "");
  b(
    u,
    (m, F) => m.getValidationErrors(F) || []
  );
  const l = q(
    n,
    t,
    i
  ), v = [];
  if (l) {
    const m = l.join(", ");
    v.includes(m) || v.push(m);
  }
  const c = s(o);
  let d = c?.validation?.onBlur ? v?.length > 0 ? v?.join(", ") : r?.validation?.message ? r?.validation?.message : "" : "";
  return console.log(
    "vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv",
    l,
    c?.formElements,
    d
  ), /* @__PURE__ */ E(P, { children: c?.formElements?.validation && !r?.validation?.disable ? c.formElements.validation({
    children: /* @__PURE__ */ E(M.Fragment, { children: e }, t.toString()),
    active: d != "",
    message: r?.validation?.hideMessage ? "" : d,
    path: t,
    ...r?.key && { key: r?.key }
  }) : /* @__PURE__ */ E(M.Fragment, { children: e }, t.toString()) });
}
export {
  nt as FormControlComponent,
  L as ValidationWrapper,
  et as cutFunc,
  tt as pushFunc,
  _ as updateFn,
  I as useGetKeyState,
  H as useGetSyncInfo,
  q as useGetValidationErrors,
  b as useStoreSubscription
};
//# sourceMappingURL=Functions.jsx.map
