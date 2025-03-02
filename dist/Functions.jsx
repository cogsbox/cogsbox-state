import { j as S } from "./node_modules/react/jsx-runtime.jsx";
import "./CogsState.jsx";
import { getNestedValue as F, isFunction as $, updateNestedProperty as y } from "./utility.js";
import C, { r as g } from "./node_modules/react/index.js";
import { getGlobalStore as l, formRefStore as A } from "./store.js";
import { validateZodPathFunc as J } from "./useValidateZodPath.js";
function P(r, e, n, o) {
  r(
    (t) => {
      if ($(e)) {
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
function h(r, e, n, o, t) {
  const s = l.getState().getNestedState(o, n);
  r(
    (i) => {
      let a = !n || n.length == 0 ? i : F(i, [...n]), u = [...a];
      return u.splice(
        Number(t) == 0 ? t : a.length,
        0,
        $(e) ? e(a) : e
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
function p(r, e, n, o) {
  const t = l.getState().getNestedState(n, e);
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
    () => e(l.getState(), r)
  ), s = g.useRef(o), i = g.useRef(r);
  return g.useEffect(() => {
    i.current = r, t(e(l.getState(), r));
    const a = (d) => {
      const f = e(d, i.current);
      n(s.current, f) || (s.current = f, t(f));
    }, u = l.subscribe(a);
    return () => {
      u();
    };
  }, [r]), o;
}, D = (r, e, n) => {
  const o = r + "." + (e.length > 0 ? [e.join(".")] : []) + (n && n.length > 0 ? "." + n : "");
  return n?.length === 0 ? [] : N(
    o,
    (t, s) => t.getValidationErrors(s) || []
  );
}, W = (r, e) => {
  const n = `${r}:${e.join(".")}`;
  return N(
    n,
    (o, t) => o.getSyncInfo(t)
  );
}, Y = (r, e) => N(
  `${r}:${e.join(".")}`,
  (n, o) => n.getNestedState(r, e)
), K = ({
  setState: r,
  path: e,
  child: n,
  formOpts: o,
  stateKey: t
}) => {
  const [s, i] = g.useState({}), { registerFormRef: a, getFormRef: u } = A.getState(), d = t + "." + e.join("."), f = g.useRef(null), v = u(d);
  v || a(t + "." + e.join("."), f);
  const B = v || f, {
    getValidationErrors: G,
    addValidationError: M,
    getInitialOptions: x,
    removeValidationError: b
  } = l.getState(), E = Y(t, e), [T, w] = g.useState(
    l.getState().getNestedState(t, e)
  ), j = x(t);
  if (!j?.validation?.key)
    throw new Error(
      "Validation key not found. You need to set it in the options for the createCogsState function"
    );
  const m = j.validation.key;
  j.validation.onBlur, g.useEffect(() => {
    w(E);
  }, [t, e.join("."), E]);
  const V = g.useRef();
  let k = (c, _) => {
    w(c), V.current && clearTimeout(V.current), V.current = setTimeout(
      () => {
        console.log(typeof E), P(r, c, e, m);
      },
      o?.debounceTime ?? (typeof E == "boolean" ? 20 : 200)
    );
  };
  const z = async () => {
    if (j.validation?.zodSchema) {
      b(m + "." + e.join("."));
      try {
        const c = l.getState().getNestedState(t, e);
        await J(
          m,
          j.validation.zodSchema,
          e,
          c
        ), console.log(
          "Validation",
          t,
          j.validation.zodSchema,
          e,
          c
        ), i({});
      } catch (c) {
        console.error("Validation error:", c);
      }
    }
  };
  g.useEffect(() => () => {
    V.current && clearTimeout(V.current);
  }, []);
  const R = W(t, e), I = R ? {
    ...R,
    date: new Date(R.timeStamp)
  } : null, U = n({
    get: () => T || l.getState().getNestedState(t, e),
    set: k,
    syncStatus: I,
    path: e,
    validationErrors: () => G(m + "." + e.join(".")),
    addValidationError: (c) => {
      b(m + "." + e.join(".")), M(m + "." + e.join("."), c ?? "");
    },
    inputProps: {
      value: T || l.getState().getNestedState(t, e) || "",
      onChange: (c) => k(c.target.value),
      onBlur: z,
      ref: B
    }
  });
  return /* @__PURE__ */ S.jsx(S.Fragment, { children: /* @__PURE__ */ S.jsx(
    Z,
    {
      formOpts: o,
      path: e,
      validationKey: m,
      stateKey: t,
      children: U
    }
  ) });
};
function Z({
  formOpts: r,
  path: e,
  validationKey: n,
  stateKey: o,
  children: t,
  validIndices: s
}) {
  const { getInitialOptions: i } = l.getState(), a = D(
    n,
    e,
    s
  ), u = [];
  if (a) {
    const v = a.join(", ");
    u.includes(v) || u.push(v);
  }
  const d = i(o);
  let f = d?.validation?.onBlur ? u?.length > 0 ? u?.join(", ") : r?.validation?.message ? r?.validation?.message : "" : "";
  return /* @__PURE__ */ S.jsx(S.Fragment, { children: d?.formElements?.validation && !r?.validation?.disable ? d.formElements.validation({
    children: /* @__PURE__ */ S.jsx(C.Fragment, { children: t }, e.toString()),
    active: f != "",
    message: r?.validation?.hideMessage ? "" : f,
    path: e,
    ...r?.key && { key: r?.key }
  }) : /* @__PURE__ */ S.jsx(C.Fragment, { children: t }, e.toString()) });
}
export {
  K as FormControlComponent,
  Z as ValidationWrapper,
  p as cutFunc,
  h as pushFunc,
  P as updateFn,
  Y as useGetKeyState,
  W as useGetSyncInfo,
  D as useGetValidationErrors,
  N as useStoreSubscription
};
//# sourceMappingURL=Functions.jsx.map
