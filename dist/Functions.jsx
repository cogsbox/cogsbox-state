import { jsx as V, Fragment as P } from "react/jsx-runtime";
import "./CogsState.jsx";
import { getNestedValue as k, isFunction as z, updateNestedProperty as y } from "./utility.js";
import M, { useState as T, useRef as N, useEffect as w } from "react";
import { getGlobalStore as v, formRefStore as Y } from "./store.js";
import { validateZodPathFunc as Z } from "./useValidateZodPath.js";
function _(r, t, n, o) {
  r(
    (e) => {
      if (z(t)) {
        const i = t(k(e, n));
        let s = y(n, e, i);
        return typeof s == "string" && (s = s.trim()), s;
      } else {
        let i = !n || n.length == 0 ? t : y(n, e, t);
        return typeof i == "string" && (i = i.trim()), i;
      }
    },
    n,
    { updateType: "update" },
    o
  );
}
function tt(r, t, n, o, e) {
  const i = v.getState().getNestedState(o, n);
  r(
    (s) => {
      let u = !n || n.length == 0 ? s : k(s, [...n]), l = [...u];
      return l.splice(
        Number(e) == 0 ? e : u.length,
        0,
        z(t) ? t(u) : t
      ), n.length == 0 ? l : y([...n], s, l);
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
  const e = v.getState().getNestedState(n, t);
  r(
    (i) => {
      const s = k(i, [...t]);
      if (o < 0 || o >= s?.length)
        throw new Error(`Index ${o} does not exist in the array.`);
      const u = o || Number(o) == 0 ? o : s.length - 1, l = [
        ...s.slice(0, u),
        ...s.slice(u + 1)
      ];
      return console.log(o), t.length == 0 ? l : y([...t], i, l);
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
    () => t(v.getState(), r)
  ), i = N(o), s = N(r);
  return w(() => {
    s.current = r, e(t(v.getState(), r));
    const u = (c) => {
      const a = t(c, s.current);
      n(i.current, a) || (i.current = a, e(a));
    }, l = v.subscribe(u);
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
  const [i, s] = T({}), { registerFormRef: u, getFormRef: l } = Y.getState(), c = e + "." + t.join("."), a = N(null), E = l(c);
  E || u(e + "." + t.join("."), a);
  const f = E || a, {
    getValidationErrors: F,
    addValidationError: U,
    getInitialOptions: A,
    removeValidationError: C
  } = v.getState(), j = I(e, t), [$, B] = T(
    v.getState().getNestedState(e, t)
  ), m = A(e);
  if (!m?.validation?.key)
    throw new Error(
      "Validation key not found. You need to set it in the options for the createCogsState function"
    );
  const d = m.validation.key;
  m.validation.onBlur, w(() => {
    B(j);
  }, [e, t.join("."), j]);
  const S = N();
  let G = (g, O) => {
    B(g), S.current && clearTimeout(S.current), S.current = setTimeout(
      () => {
        console.log(typeof j), _(r, g, t, d);
      },
      o?.debounceTime ?? (typeof j == "boolean" ? 20 : 200)
    );
  };
  const J = async () => {
    if (m.validation?.zodSchema) {
      C(d + "." + t.join("."));
      try {
        const g = v.getState().getNestedState(e, t);
        await Z(
          d,
          m.validation.zodSchema,
          t,
          g
        ), console.log(
          "Validation",
          e,
          m.validation.zodSchema,
          t,
          g
        ), s({});
      } catch (g) {
        console.error("Validation error:", g);
      }
    }
  };
  w(() => () => {
    S.current && clearTimeout(S.current);
  }, []);
  const R = H(e, t), D = R ? {
    ...R,
    date: new Date(R.timeStamp)
  } : null, W = n({
    get: () => $ || v.getState().getNestedState(e, t),
    set: G,
    syncStatus: D,
    path: t,
    validationErrors: () => F(d + "." + t.join(".")),
    addValidationError: (g) => {
      C(d + "." + t.join(".")), U(d + "." + t.join("."), g ?? "");
    },
    inputProps: {
      value: $ || v.getState().getNestedState(e, t) || "",
      onChange: (g) => G(g.target.value),
      onBlur: J,
      ref: f
    }
  });
  return /* @__PURE__ */ V(P, { children: /* @__PURE__ */ V(
    L,
    {
      formOpts: o,
      path: t,
      validationKey: d,
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
  const { getInitialOptions: s } = v.getState(), u = n + "." + (t.length > 0 ? [t.join(".")] : []) + (i && i.length > 0 ? "." + i : "");
  b(
    u,
    (f, F) => f.getValidationErrors(F) || []
  );
  const l = q(
    n,
    t,
    i
  ), c = [];
  if (l) {
    const f = l.join(", ");
    c.includes(f) || c.push(f);
  }
  const a = s(o);
  let E = a?.validation?.onBlur ? c?.length > 0 ? c?.join(", ") : r?.validation?.message ? r?.validation?.message : "" : "";
  return console.log(
    "vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv",
    c,
    l,
    a?.formElements,
    E
  ), /* @__PURE__ */ V(P, { children: a?.formElements?.validation && !r?.validation?.disable ? a.formElements.validation({
    children: /* @__PURE__ */ V(M.Fragment, { children: e }, t.toString()),
    active: l.length > 0,
    message: r?.validation?.hideMessage ? "" : c.map((f) => f).join(", "),
    path: t,
    ...r?.key && { key: r?.key }
  }) : /* @__PURE__ */ V(M.Fragment, { children: e }, t.toString()) });
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
