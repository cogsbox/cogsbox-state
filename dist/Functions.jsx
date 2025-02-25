import { j as d } from "./node_modules/react/jsx-runtime.jsx";
import { getNestedValue as N, isFunction as T, updateNestedProperty as j } from "./utility.js";
import v, { r as S } from "./node_modules/react/index.js";
import { getGlobalStore as l } from "./store.js";
function R(o, t, e, n) {
  o(
    (r) => {
      if (T(t)) {
        const s = t(N(r, e));
        let i = j(e, r, s);
        return typeof i == "string" && (i = i.trim()), i;
      } else {
        let s = !e || e.length == 0 ? t : j(e, r, t);
        return typeof s == "string" && (s = s.trim()), s;
      }
    },
    e,
    { updateType: "update" },
    n
  );
}
function U(o, t, e, n, r) {
  const s = l.getState().getNestedState(n, e);
  o(
    (i) => {
      let c = !e || e.length == 0 ? i : N(i, [...e]), u = [...c];
      return u.splice(
        Number(r) == 0 ? r : c.length,
        0,
        T(t) ? t(c) : t
      ), e.length == 0 ? u : j([...e], i, u);
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
function D(o, t, e, n) {
  const r = l.getState().getNestedState(e, t);
  o(
    (s) => {
      const i = N(s, [...t]);
      if (n < 0 || n >= i?.length)
        throw new Error(`Index ${n} does not exist in the array.`);
      const c = n || Number(n) == 0 ? n : i.length - 1, u = [
        ...i.slice(0, c),
        ...i.slice(c + 1)
      ];
      return console.log(n), t.length == 0 ? u : j([...t], s, u);
    },
    [
      ...t,
      n || n === 0 ? n?.toString() : (r.length - 1).toString()
    ],
    { updateType: "cut" }
  );
}
const b = (o, t, e = (n, r) => JSON.stringify(n) === JSON.stringify(r)) => {
  const [n, r] = S.useState(
    () => t(l.getState(), o)
  ), s = S.useRef(n), i = S.useRef(o);
  return S.useEffect(() => {
    i.current = o, r(t(l.getState(), o));
    const c = (a) => {
      const g = t(a, i.current);
      e(s.current, g) || (s.current = g, r(g));
    }, u = l.subscribe(c);
    return () => {
      u();
    };
  }, [o]), n;
}, k = (o, t, e) => {
  const n = o + "." + (t.length > 0 ? [t.join(".")] : []) + (e && e.length > 0 ? "." + e : "");
  return e?.length === 0 ? [] : b(
    n,
    (r, s) => r.getValidationErrors(s) || []
  );
}, C = (o, t) => {
  const e = `${o}:${t.join(".")}`;
  return b(
    e,
    (n, r) => n.getSyncInfo(r)
  );
}, $ = (o, t) => b(
  `${o}:${t.join(".")}`,
  (e, n) => e.getNestedState(o, t)
), O = ({
  setState: o,
  path: t,
  child: e,
  formOpts: n,
  stateKey: r
}) => {
  const { getValidationErrors: s, getInitialOptions: i } = l.getState(), c = $(r, t), [u, a] = S.useState(
    l.getState().getNestedState(r, t)
  ), g = i(r);
  if (!g?.validation?.key)
    throw new Error(
      "Validation key not found. You need ot set it in the options for the createCogsState function"
    );
  const m = g.validation?.key;
  S.useEffect(() => {
    a(c);
  }, [r, t.join("."), c]);
  const f = S.useRef();
  let E = (y, M) => {
    a(y), f.current && clearTimeout(f.current), f.current = setTimeout(() => {
      R(o, y, t, m);
    }, n?.debounceTime ?? 300);
  };
  S.useEffect(() => () => {
    f.current && clearTimeout(f.current);
  }, []);
  const V = C(r, t), F = V ? {
    ...V,
    date: new Date(V.timeStamp)
  } : null, w = e({
    get: () => u || l.getState().getNestedState(r, t),
    set: E,
    syncStatus: F,
    path: t,
    validationErrors: () => s(m + "." + t.join(".")),
    // Add default input props
    inputProps: {
      value: u || l.getState().getNestedState(r, t) || "",
      onChange: (y) => E(y.target.value)
    }
  });
  return /* @__PURE__ */ d.jsx(d.Fragment, { children: /* @__PURE__ */ d.jsx(
    G,
    {
      formOpts: n,
      path: t,
      validationKey: m,
      stateKey: r,
      children: w
    }
  ) });
};
function G({
  formOpts: o,
  path: t,
  validationKey: e,
  stateKey: n,
  children: r,
  validIndices: s
}) {
  const { getInitialOptions: i, getValidationErrors: c } = l.getState(), u = k(
    e,
    t,
    s
  ), a = [];
  if (u) {
    const E = u.join(", ");
    a.includes(E) || a.push(E);
  }
  let g = a?.length > 0 ? a?.join(", ") : "";
  const m = i(n), f = o?.validation?.message;
  return /* @__PURE__ */ d.jsx(d.Fragment, { children: m?.formElements?.validation && !o?.validation?.disable ? m.formElements.validation({
    children: /* @__PURE__ */ d.jsx(v.Fragment, { children: r }, t.toString()),
    active: g != "",
    message: f || (f == "" || o?.validation?.hideMessage ? "" : g),
    path: t,
    ...o?.key && { key: o?.key }
  }) : /* @__PURE__ */ d.jsx(v.Fragment, { children: r }, t.toString()) });
}
export {
  O as FormControlComponent,
  G as ValidationWrapper,
  D as cutFunc,
  U as pushFunc,
  R as updateFn,
  $ as useGetKeyState,
  C as useGetSyncInfo,
  k as useGetValidationErrors,
  b as useStoreSubscription
};
//# sourceMappingURL=Functions.jsx.map
