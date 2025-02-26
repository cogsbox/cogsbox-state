import { j as V } from "./node_modules/react/jsx-runtime.jsx";
import "./CogsState.jsx";
import { getNestedValue as N, isFunction as w, updateNestedProperty as y } from "./utility.js";
import T, { r as S } from "./node_modules/react/index.js";
import { getGlobalStore as c } from "./store.js";
import { validateZodPathFunc as G } from "./useValidateZodPath.js";
function M(o, t, e, r) {
  o(
    (n) => {
      if (w(t)) {
        const s = t(N(n, e));
        let i = y(e, n, s);
        return typeof i == "string" && (i = i.trim()), i;
      } else {
        let s = !e || e.length == 0 ? t : y(e, n, t);
        return typeof s == "string" && (s = s.trim()), s;
      }
    },
    e,
    { updateType: "update" },
    r
  );
}
function Y(o, t, e, r, n) {
  const s = c.getState().getNestedState(r, e);
  o(
    (i) => {
      let a = !e || e.length == 0 ? i : N(i, [...e]), u = [...a];
      return u.splice(
        Number(n) == 0 ? n : a.length,
        0,
        w(t) ? t(a) : t
      ), e.length == 0 ? u : y([...e], i, u);
    },
    [
      ...e,
      (s.length - 1).toString()
    ],
    {
      updateType: "insert"
    }
  );
}
function Z(o, t, e, r) {
  const n = c.getState().getNestedState(e, t);
  o(
    (s) => {
      const i = N(s, [...t]);
      if (r < 0 || r >= i?.length)
        throw new Error(`Index ${r} does not exist in the array.`);
      const a = r || Number(r) == 0 ? r : i.length - 1, u = [
        ...i.slice(0, a),
        ...i.slice(a + 1)
      ];
      return console.log(r), t.length == 0 ? u : y([...t], s, u);
    },
    [
      ...t,
      r || r === 0 ? r?.toString() : (n.length - 1).toString()
    ],
    { updateType: "cut" }
  );
}
const b = (o, t, e = (r, n) => JSON.stringify(r) === JSON.stringify(n)) => {
  const [r, n] = S.useState(
    () => t(c.getState(), o)
  ), s = S.useRef(r), i = S.useRef(o);
  return S.useEffect(() => {
    i.current = o, n(t(c.getState(), o));
    const a = (l) => {
      const d = t(l, i.current);
      e(s.current, d) || (s.current = d, n(d));
    }, u = c.subscribe(a);
    return () => {
      u();
    };
  }, [o]), r;
}, z = (o, t, e) => {
  const r = o + "." + (t.length > 0 ? [t.join(".")] : []) + (e && e.length > 0 ? "." + e : "");
  return e?.length === 0 ? [] : b(
    r,
    (n, s) => n.getValidationErrors(s) || []
  );
}, I = (o, t) => {
  const e = `${o}:${t.join(".")}`;
  return b(
    e,
    (r, n) => r.getSyncInfo(n)
  );
}, U = (o, t) => b(
  `${o}:${t.join(".")}`,
  (e, r) => e.getNestedState(o, t)
), _ = ({
  setState: o,
  path: t,
  child: e,
  formOpts: r,
  stateKey: n
}) => {
  const [s, i] = S.useState({}), { getValidationErrors: a, getInitialOptions: u } = c.getState(), l = U(n, t), [d, E] = S.useState(
    c.getState().getNestedState(n, t)
  ), g = u(n);
  if (!g?.validation?.key)
    throw new Error(
      "Validation key not found. You need to set it in the options for the createCogsState function"
    );
  const m = g.validation.key, R = g.validation.onBlur === !0;
  S.useEffect(() => {
    E(l);
  }, [n, t.join("."), l]);
  const v = S.useRef();
  let F = (f, x) => {
    E(f), v.current && clearTimeout(v.current), v.current = setTimeout(() => {
      M(o, f, t, m);
    }, r?.debounceTime ?? 300);
  };
  const k = async () => {
    if (g.validation?.zodSchema)
      try {
        const f = c.getState().getNestedState(n, t);
        await G(
          m,
          g.validation.zodSchema,
          t,
          f
        ), console.log(
          "Validation",
          n,
          g.validation.zodSchema,
          t,
          f
        ), i({});
      } catch (f) {
        console.error("Validation error:", f);
      }
  }, B = () => {
    console.log("handleBlur"), R && (v.current && clearTimeout(v.current), k());
  };
  S.useEffect(() => () => {
    v.current && clearTimeout(v.current);
  }, []);
  const j = I(n, t), C = j ? {
    ...j,
    date: new Date(j.timeStamp)
  } : null, $ = e({
    get: () => d || c.getState().getNestedState(n, t),
    set: F,
    syncStatus: C,
    path: t,
    validationErrors: () => a(m + "." + t.join(".")),
    // Add default input props with blur handler
    inputProps: {
      value: d || c.getState().getNestedState(n, t) || "",
      onChange: (f) => F(f.target.value),
      onBlur: B
    }
  });
  return /* @__PURE__ */ V.jsx(V.Fragment, { children: /* @__PURE__ */ V.jsx(
    h,
    {
      formOpts: r,
      path: t,
      validationKey: m,
      stateKey: n,
      children: $
    }
  ) });
};
function h({
  formOpts: o,
  path: t,
  validationKey: e,
  stateKey: r,
  children: n,
  validIndices: s
}) {
  const { getInitialOptions: i, getValidationErrors: a } = c.getState(), u = z(
    e,
    t,
    s
  );
  console.log("renderValidationWrapper", u);
  const l = [];
  if (u) {
    const m = u.join(", ");
    l.includes(m) || l.push(m);
  }
  let d = l?.length > 0 ? l?.join(", ") : "";
  const E = i(r), g = o?.validation?.message;
  return /* @__PURE__ */ V.jsx(V.Fragment, { children: E?.formElements?.validation && !o?.validation?.disable ? E.formElements.validation({
    children: /* @__PURE__ */ V.jsx(T.Fragment, { children: n }, t.toString()),
    active: d != "",
    message: g || (g == "" || o?.validation?.hideMessage ? "" : d),
    path: t,
    ...o?.key && { key: o?.key }
  }) : /* @__PURE__ */ V.jsx(T.Fragment, { children: n }, t.toString()) });
}
export {
  _ as FormControlComponent,
  h as ValidationWrapper,
  Z as cutFunc,
  Y as pushFunc,
  M as updateFn,
  U as useGetKeyState,
  I as useGetSyncInfo,
  z as useGetValidationErrors,
  b as useStoreSubscription
};
//# sourceMappingURL=Functions.jsx.map
