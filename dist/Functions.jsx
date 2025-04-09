import { jsx as j, Fragment as M } from "react/jsx-runtime";
import "./CogsState.jsx";
import { getNestedValue as w, isFunction as P, updateNestedProperty as y } from "./utility.js";
import G, { useState as R, useRef as E, useEffect as T } from "react";
import { getGlobalStore as l, formRefStore as Y } from "./store.js";
import { validateZodPathFunc as Z } from "./useValidateZodPath.js";
function _(o, t, e, r) {
  o(
    (n) => {
      if (P(t)) {
        const i = t(w(n, e));
        let s = y(e, n, i);
        return typeof s == "string" && (s = s.trim()), s;
      } else {
        let i = !e || e.length == 0 ? t : y(e, n, t);
        return typeof i == "string" && (i = i.trim()), i;
      }
    },
    e,
    { updateType: "update" },
    r
  );
}
function tt(o, t, e, r, n) {
  const i = l.getState().getNestedState(r, e);
  o(
    (s) => {
      let c = !e || e.length == 0 ? s : w(s, [...e]), u = [...c];
      return u.splice(
        Number(n) == 0 ? n : c.length,
        0,
        P(t) ? t(c) : t
      ), e.length == 0 ? u : y([...e], s, u);
    },
    [
      ...e,
      (i.length - 1).toString()
    ],
    {
      updateType: "insert"
    }
  );
}
function et(o, t, e, r) {
  const n = l.getState().getNestedState(e, t);
  o(
    (i) => {
      const s = w(i, [...t]);
      if (r < 0 || r >= s?.length)
        throw new Error(`Index ${r} does not exist in the array.`);
      const c = r || Number(r) == 0 ? r : s.length - 1, u = [
        ...s.slice(0, c),
        ...s.slice(c + 1)
      ];
      return t.length == 0 ? u : y([...t], i, u);
    },
    [
      ...t,
      r || r === 0 ? r?.toString() : (n.length - 1).toString()
    ],
    { updateType: "cut" }
  );
}
const v = (o, t, e = (r, n) => JSON.stringify(r) === JSON.stringify(n)) => {
  const [r, n] = R(
    () => t(l.getState(), o)
  ), i = E(r), s = E(o);
  return T(() => {
    s.current = o, n(t(l.getState(), o));
    const c = (a) => {
      const g = t(a, s.current);
      e(i.current, g) || (i.current = g, n(g));
    }, u = l.subscribe(c);
    return () => {
      u();
    };
  }, [o]), r;
}, q = (o, t, e) => {
  const r = o + "." + (t.length > 0 ? [t.join(".")] : []) + (e && e.length > 0 ? "." + e : "");
  return e?.length === 0 ? [] : v(
    r,
    (i, s) => i.getValidationErrors(s) || []
  );
}, H = (o, t) => {
  const e = `${o}:${t.join(".")}`;
  return v(
    e,
    (r, n) => r.getSyncInfo(n)
  );
}, I = (o, t) => v(
  `${o}:${t.join(".")}`,
  (e, r) => e.getNestedState(o, t)
), nt = ({
  setState: o,
  path: t,
  child: e,
  formOpts: r,
  stateKey: n
}) => {
  const [i, s] = R({}), { registerFormRef: c, getFormRef: u } = Y.getState(), a = n + "." + t.join("."), g = E(null), d = u(a);
  d || c(n + "." + t.join("."), g);
  const N = d || g, {
    getValidationErrors: U,
    addValidationError: z,
    getInitialOptions: A,
    removeValidationError: k
  } = l.getState(), b = I(n, t), [C, $] = R(
    l.getState().getNestedState(n, t)
  ), S = A(n);
  if (!S?.validation?.key)
    throw new Error(
      "Validation key not found. You need to set it in the options for the createCogsState function"
    );
  const m = S.validation.key;
  S.validation.onBlur, T(() => {
    $(b);
  }, [n, t.join("."), b]);
  const V = E();
  let B = (f, O) => {
    $(f), V.current && clearTimeout(V.current), V.current = setTimeout(
      () => {
        _(o, f, t, m);
      },
      r?.debounceTime ?? (typeof b == "boolean" ? 20 : 200)
    );
  };
  const J = async () => {
    if (S.validation?.zodSchema) {
      k(m + "." + t.join("."));
      try {
        const f = l.getState().getNestedState(n, t);
        await Z(
          m,
          S.validation.zodSchema,
          t,
          f
        ), s({});
      } catch (f) {
        console.error("Validation error:", f);
      }
    }
  };
  T(() => () => {
    V.current && clearTimeout(V.current);
  }, []);
  const F = H(n, t), D = F ? {
    ...F,
    date: new Date(F.timeStamp)
  } : null, W = e({
    get: () => C || l.getState().getNestedState(n, t),
    set: B,
    syncStatus: D,
    path: t,
    validationErrors: () => U(m + "." + t.join(".")),
    addValidationError: (f) => {
      k(m + "." + t.join(".")), z(m + "." + t.join("."), f ?? "");
    },
    inputProps: {
      value: C || l.getState().getNestedState(n, t) || "",
      onChange: (f) => B(f.target.value),
      onBlur: J,
      ref: N
    }
  });
  return /* @__PURE__ */ j(M, { children: /* @__PURE__ */ j(
    L,
    {
      formOpts: r,
      path: t,
      validationKey: m,
      stateKey: n,
      children: W
    }
  ) });
};
function L({
  formOpts: o,
  path: t,
  validationKey: e,
  stateKey: r,
  children: n,
  validIndices: i
}) {
  const { getInitialOptions: s } = l.getState(), c = e + "." + (t.length > 0 ? [t.join(".")] : []) + (i && i.length > 0 ? "." + i : "");
  v(
    c,
    (d, N) => d.getValidationErrors(N) || []
  );
  const u = q(
    e,
    t,
    i
  ), a = [];
  if (u) {
    const d = u.join(", ");
    a.includes(d) || a.push(d);
  }
  const g = s(r);
  return g?.validation?.onBlur && (a?.length > 0 ? a?.join(", ") : o?.validation?.message && o?.validation?.message), /* @__PURE__ */ j(M, { children: g?.formElements?.validation && !o?.validation?.disable ? g.formElements.validation({
    children: /* @__PURE__ */ j(G.Fragment, { children: n }, t.toString()),
    active: u.length > 0,
    message: o?.validation?.hideMessage ? "" : a.map((d) => d).join(", "),
    path: t,
    ...o?.key && { key: o?.key }
  }) : /* @__PURE__ */ j(G.Fragment, { children: n }, t.toString()) });
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
  v as useStoreSubscription
};
//# sourceMappingURL=Functions.jsx.map
