import { j as S } from "./node_modules/react/jsx-runtime.jsx";
import "./CogsState.jsx";
import { getNestedValue as F, isFunction as C, updateNestedProperty as y } from "./utility.js";
import B, { r as g } from "./node_modules/react/index.js";
import { getGlobalStore as c, formRefStore as J } from "./store.js";
import { validateZodPathFunc as P } from "./useValidateZodPath.js";
function D(r, e, n, o) {
  r(
    (t) => {
      if (C(e)) {
        const s = e(F(t, n));
        let i = y(n, t, s);
        return typeof i == "string" && (i = i.trim()), i;
      } else {
        let s = !n || n.length == 0 ? e : y(n, t, e);
        return typeof s == "string" && (s = s.trim()), s;
      }
    },
    n,
    { updateType: "update" },
    o
  );
}
function p(r, e, n, o, t) {
  const s = c.getState().getNestedState(o, n);
  r(
    (i) => {
      let a = !n || n.length == 0 ? i : F(i, [...n]), u = [...a];
      return u.splice(
        Number(t) == 0 ? t : a.length,
        0,
        C(e) ? e(a) : e
      ), n.length == 0 ? u : y([...n], i, u);
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
function K(r, e, n, o) {
  const t = c.getState().getNestedState(n, e);
  r(
    (s) => {
      const i = F(s, [...e]);
      if (o < 0 || o >= i?.length)
        throw new Error(`Index ${o} does not exist in the array.`);
      const a = o || Number(o) == 0 ? o : i.length - 1, u = [
        ...i.slice(0, a),
        ...i.slice(a + 1)
      ];
      return console.log(o), e.length == 0 ? u : y([...e], s, u);
    },
    [
      ...e,
      o || o === 0 ? o?.toString() : (t.length - 1).toString()
    ],
    { updateType: "cut" }
  );
}
const N = (r, e, n = (o, t) => JSON.stringify(o) === JSON.stringify(t)) => {
  const [o, t] = g.useState(
    () => e(c.getState(), r)
  ), s = g.useRef(o), i = g.useRef(r);
  return g.useEffect(() => {
    i.current = r, t(e(c.getState(), r));
    const a = (f) => {
      const d = e(f, i.current);
      n(s.current, d) || (s.current = d, t(d));
    }, u = c.subscribe(a);
    return () => {
      u();
    };
  }, [r]), o;
}, W = (r, e, n) => {
  const o = r + "." + (e.length > 0 ? [e.join(".")] : []) + (n && n.length > 0 ? "." + n : "");
  return n?.length === 0 ? [] : N(
    o,
    (t, s) => t.getValidationErrors(s) || []
  );
}, Y = (r, e) => {
  const n = `${r}:${e.join(".")}`;
  return N(
    n,
    (o, t) => o.getSyncInfo(t)
  );
}, Z = (r, e) => N(
  `${r}:${e.join(".")}`,
  (n, o) => n.getNestedState(r, e)
), ee = ({
  setState: r,
  path: e,
  child: n,
  formOpts: o,
  stateKey: t
}) => {
  const [s, i] = g.useState({}), { registerFormRef: a, getFormRef: u } = J.getState(), f = t + "." + e.join("."), d = g.useRef(null), j = u(f);
  j || a(t + "." + e.join("."), d);
  const $ = j || d, {
    getValidationErrors: G,
    addValidationError: M,
    getInitialOptions: x,
    removeValidationError: b
  } = c.getState(), E = Z(t, e), [T, w] = g.useState(
    c.getState().getNestedState(t, e)
  ), v = x(t);
  if (!v?.validation?.key)
    throw new Error(
      "Validation key not found. You need to set it in the options for the createCogsState function"
    );
  const m = v.validation.key;
  v.validation.onBlur, g.useEffect(() => {
    w(E);
  }, [t, e.join("."), E]);
  const V = g.useRef();
  let k = (l, q) => {
    w(l), V.current && clearTimeout(V.current), V.current = setTimeout(
      () => {
        console.log(typeof E), D(r, l, e, m);
      },
      o?.debounceTime ?? (typeof E == "boolean" ? 20 : 200)
    );
  };
  const z = async () => {
    if (v.validation?.zodSchema) {
      b(m + "." + e.join("."));
      try {
        const l = c.getState().getNestedState(t, e);
        await P(
          m,
          v.validation.zodSchema,
          e,
          l
        ), console.log(
          "Validation",
          t,
          v.validation.zodSchema,
          e,
          l
        ), i({});
      } catch (l) {
        console.error("Validation error:", l);
      }
    }
  }, I = () => {
    console.log("handleBlur"), z();
  };
  g.useEffect(() => () => {
    V.current && clearTimeout(V.current);
  }, []);
  const R = Y(t, e), U = R ? {
    ...R,
    date: new Date(R.timeStamp)
  } : null, A = n({
    get: () => T || c.getState().getNestedState(t, e),
    set: k,
    syncStatus: U,
    path: e,
    validationErrors: () => G(m + "." + e.join(".")),
    addValidationError: (l) => {
      b(m + "." + e.join(".")), M(m + "." + e.join("."), l ?? "");
    },
    inputProps: {
      value: T || c.getState().getNestedState(t, e) || "",
      onChange: (l) => k(l.target.value),
      onBlur: I,
      ref: $
    }
  });
  return /* @__PURE__ */ S.jsx(S.Fragment, { children: /* @__PURE__ */ S.jsx(
    _,
    {
      formOpts: o,
      path: e,
      validationKey: m,
      stateKey: t,
      children: A
    }
  ) });
};
function _({
  formOpts: r,
  path: e,
  validationKey: n,
  stateKey: o,
  children: t,
  validIndices: s
}) {
  const { getInitialOptions: i } = c.getState(), a = W(
    n,
    e,
    s
  ), u = [];
  if (a) {
    const j = a.join(", ");
    u.includes(j) || u.push(j);
  }
  const f = i(o);
  let d = f?.validation?.onBlur ? u?.length > 0 ? u?.join(", ") : r?.validation?.message ? r?.validation?.message : "" : "";
  return /* @__PURE__ */ S.jsx(S.Fragment, { children: f?.formElements?.validation && !r?.validation?.disable ? f.formElements.validation({
    children: /* @__PURE__ */ S.jsx(B.Fragment, { children: t }, e.toString()),
    active: d != "",
    message: r?.validation?.hideMessage ? "" : d,
    path: e,
    ...r?.key && { key: r?.key }
  }) : /* @__PURE__ */ S.jsx(B.Fragment, { children: t }, e.toString()) });
}
export {
  ee as FormControlComponent,
  _ as ValidationWrapper,
  K as cutFunc,
  p as pushFunc,
  D as updateFn,
  Z as useGetKeyState,
  Y as useGetSyncInfo,
  W as useGetValidationErrors,
  N as useStoreSubscription
};
//# sourceMappingURL=Functions.jsx.map
