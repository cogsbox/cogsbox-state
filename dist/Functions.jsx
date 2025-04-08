import { jsx as V, Fragment as G } from "react/jsx-runtime";
import "./CogsState.jsx";
import { getNestedValue as R, isFunction as M, updateNestedProperty as E } from "./utility.js";
import B, { useState as b, useRef as j, useEffect as F } from "react";
import { getGlobalStore as a, formRefStore as W } from "./store.js";
import { validateZodPathFunc as Y } from "./useValidateZodPath.js";
function Z(r, e, n, o) {
  r(
    (t) => {
      if (M(e)) {
        const s = e(R(t, n));
        let i = E(n, t, s);
        return typeof i == "string" && (i = i.trim()), i;
      } else {
        let s = !n || n.length == 0 ? e : E(n, t, e);
        return typeof s == "string" && (s = s.trim()), s;
      }
    },
    n,
    { updateType: "update" },
    o
  );
}
function ee(r, e, n, o, t) {
  const s = a.getState().getNestedState(o, n);
  r(
    (i) => {
      let u = !n || n.length == 0 ? i : R(i, [...n]), l = [...u];
      return l.splice(
        Number(t) == 0 ? t : u.length,
        0,
        M(e) ? e(u) : e
      ), n.length == 0 ? l : E([...n], i, l);
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
function te(r, e, n, o) {
  const t = a.getState().getNestedState(n, e);
  r(
    (s) => {
      const i = R(s, [...e]);
      if (o < 0 || o >= i?.length)
        throw new Error(`Index ${o} does not exist in the array.`);
      const u = o || Number(o) == 0 ? o : i.length - 1, l = [
        ...i.slice(0, u),
        ...i.slice(u + 1)
      ];
      return console.log(o), e.length == 0 ? l : E([...e], s, l);
    },
    [
      ...e,
      o || o === 0 ? o?.toString() : (t.length - 1).toString()
    ],
    { updateType: "cut" }
  );
}
const T = (r, e, n = (o, t) => JSON.stringify(o) === JSON.stringify(t)) => {
  const [o, t] = b(
    () => e(a.getState(), r)
  ), s = j(o), i = j(r);
  return F(() => {
    i.current = r, t(e(a.getState(), r));
    const u = (d) => {
      const g = e(d, i.current);
      n(s.current, g) || (s.current = g, t(g));
    }, l = a.subscribe(u);
    return () => {
      l();
    };
  }, [r]), o;
}, _ = (r, e, n) => {
  const o = r + "." + (e.length > 0 ? [e.join(".")] : []) + (n && n.length > 0 ? "." + n : "");
  if (console.log("fullPath", o), n?.length === 0)
    return [];
  const t = T(
    o,
    (s, i) => s.getValidationErrors(i) || []
  );
  return console.log("returnresult", t), t;
}, q = (r, e) => {
  const n = `${r}:${e.join(".")}`;
  return T(
    n,
    (o, t) => o.getSyncInfo(t)
  );
}, H = (r, e) => T(
  `${r}:${e.join(".")}`,
  (n, o) => n.getNestedState(r, e)
), ne = ({
  setState: r,
  path: e,
  child: n,
  formOpts: o,
  stateKey: t
}) => {
  const [s, i] = b({}), { registerFormRef: u, getFormRef: l } = W.getState(), d = t + "." + e.join("."), g = j(null), S = l(d);
  S || u(t + "." + e.join("."), g);
  const z = S || g, {
    getValidationErrors: I,
    addValidationError: P,
    getInitialOptions: U,
    removeValidationError: w
  } = a.getState(), y = H(t, e), [k, C] = b(
    a.getState().getNestedState(t, e)
  ), m = U(t);
  if (!m?.validation?.key)
    throw new Error(
      "Validation key not found. You need to set it in the options for the createCogsState function"
    );
  const f = m.validation.key;
  m.validation.onBlur, F(() => {
    C(y);
  }, [t, e.join("."), y]);
  const v = j();
  let $ = (c, O) => {
    C(c), v.current && clearTimeout(v.current), v.current = setTimeout(
      () => {
        console.log(typeof y), Z(r, c, e, f);
      },
      o?.debounceTime ?? (typeof y == "boolean" ? 20 : 200)
    );
  };
  const A = async () => {
    if (m.validation?.zodSchema) {
      w(f + "." + e.join("."));
      try {
        const c = a.getState().getNestedState(t, e);
        await Y(
          f,
          m.validation.zodSchema,
          e,
          c
        ), console.log(
          "Validation",
          t,
          m.validation.zodSchema,
          e,
          c
        ), i({});
      } catch (c) {
        console.error("Validation error:", c);
      }
    }
  };
  F(() => () => {
    v.current && clearTimeout(v.current);
  }, []);
  const N = q(t, e), J = N ? {
    ...N,
    date: new Date(N.timeStamp)
  } : null, D = n({
    get: () => k || a.getState().getNestedState(t, e),
    set: $,
    syncStatus: J,
    path: e,
    validationErrors: () => I(f + "." + e.join(".")),
    addValidationError: (c) => {
      w(f + "." + e.join(".")), P(f + "." + e.join("."), c ?? "");
    },
    inputProps: {
      value: k || a.getState().getNestedState(t, e) || "",
      onChange: (c) => $(c.target.value),
      onBlur: A,
      ref: z
    }
  });
  return /* @__PURE__ */ V(G, { children: /* @__PURE__ */ V(
    L,
    {
      formOpts: o,
      path: e,
      validationKey: f,
      stateKey: t,
      children: D
    }
  ) });
};
function L({
  formOpts: r,
  path: e,
  validationKey: n,
  stateKey: o,
  children: t,
  validIndices: s
}) {
  const { getInitialOptions: i } = a.getState(), u = _(
    n,
    e,
    s
  ), l = [];
  if (u) {
    const S = u.join(", ");
    l.includes(S) || l.push(S);
  }
  const d = i(o);
  let g = d?.validation?.onBlur ? l?.length > 0 ? l?.join(", ") : r?.validation?.message ? r?.validation?.message : "" : "";
  return /* @__PURE__ */ V(G, { children: d?.formElements?.validation && !r?.validation?.disable ? d.formElements.validation({
    children: /* @__PURE__ */ V(B.Fragment, { children: t }, e.toString()),
    active: g != "",
    message: r?.validation?.hideMessage ? "" : g,
    path: e,
    ...r?.key && { key: r?.key }
  }) : /* @__PURE__ */ V(B.Fragment, { children: t }, e.toString()) });
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
  T as useStoreSubscription
};
//# sourceMappingURL=Functions.jsx.map
