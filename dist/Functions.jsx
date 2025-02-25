import { j as m } from "./node_modules/react/jsx-runtime.jsx";
import { getNestedValue as V, isFunction as T, updateNestedProperty as E } from "./utility.js";
import b, { r as d } from "./node_modules/react/index.js";
import { getGlobalStore as a } from "./store.js";
function R(o, e, t, n) {
  o(
    (r) => {
      if (T(e)) {
        const s = e(V(r, t));
        let i = E(t, r, s);
        return typeof i == "string" && (i = i.trim()), i;
      } else {
        let s = !t || t.length == 0 ? e : E(t, r, e);
        return typeof s == "string" && (s = s.trim()), s;
      }
    },
    t,
    { updateType: "update" },
    n
  );
}
function U(o, e, t, n, r) {
  const s = a.getState().getNestedState(n, t);
  o(
    (i) => {
      let c = !t || t.length == 0 ? i : V(i, [...t]), u = [...c];
      return u.splice(
        Number(r) == 0 ? r : c.length,
        0,
        T(e) ? e(c) : e
      ), t.length == 0 ? u : E([...t], i, u);
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
function D(o, e, t, n) {
  const r = a.getState().getNestedState(t, e);
  o(
    (s) => {
      const i = V(s, [...e]);
      if (n < 0 || n >= i?.length)
        throw new Error(`Index ${n} does not exist in the array.`);
      const c = n || Number(n) == 0 ? n : i.length - 1, u = [
        ...i.slice(0, c),
        ...i.slice(c + 1)
      ];
      return console.log(n), e.length == 0 ? u : E([...e], s, u);
    },
    [
      ...e,
      n || n === 0 ? n?.toString() : (r.length - 1).toString()
    ],
    { updateType: "cut" }
  );
}
const v = (o, e, t = (n, r) => JSON.stringify(n) === JSON.stringify(r)) => {
  const [n, r] = d.useState(
    () => e(a.getState(), o)
  ), s = d.useRef(n), i = d.useRef(o);
  return d.useEffect(() => {
    i.current = o, r(e(a.getState(), o));
    const c = (l) => {
      const g = e(l, i.current);
      t(s.current, g) || (s.current = g, r(g));
    }, u = a.subscribe(c);
    return () => {
      u();
    };
  }, [o]), n;
}, C = (o, e, t) => {
  const n = o + "." + (e.length > 0 ? [e.join(".")] : []) + (t && t.length > 0 ? "." + t : "");
  return t?.length === 0 ? [] : v(
    n,
    (r, s) => r.getValidationErrors(s) || []
  );
}, $ = (o, e) => {
  const t = `${o}:${e.join(".")}`;
  return v(
    t,
    (n, r) => n.getSyncInfo(r)
  );
}, k = (o, e) => v(
  `${o}:${e.join(".")}`,
  (t, n) => t.getNestedState(o, e)
), P = ({
  setState: o,
  path: e,
  child: t,
  formOpts: n,
  stateKey: r
}) => {
  const { getValidationErrors: s, getInitialOptions: i } = a.getState(), c = k(r, e), [u, l] = d.useState(
    a.getState().getNestedState(r, e)
  );
  e.includes("street") && console.log("d123123123", e, c, u);
  const g = i(r);
  if (!g?.validationKey)
    throw new Error(
      "Validation key not found. You need ot set it in the options for the createCogsState function"
    );
  const S = g.validationKey;
  d.useEffect(() => {
    l(c);
  }, [r, e.join("."), c]);
  const f = d.useRef();
  let N = (j, I) => {
    l(j), f.current && clearTimeout(f.current), f.current = setTimeout(() => {
      R(o, j, e, S);
    }, n?.debounceTime ?? 300);
  };
  d.useEffect(() => () => {
    f.current && clearTimeout(f.current);
  }, []);
  const y = $(r, e), w = y ? {
    ...y,
    date: new Date(y.timeStamp)
  } : null, F = t({
    get: () => u || a.getState().getNestedState(r, e),
    set: N,
    syncStatus: w,
    path: e,
    validationErrors: () => s(S + "." + e.join(".")),
    // Add default input props
    inputProps: {
      value: u || a.getState().getNestedState(r, e) || "",
      onChange: (j) => N(j.target.value)
    }
  });
  return /* @__PURE__ */ m.jsxs("div", { children: [
    e.join("."),
    /* @__PURE__ */ m.jsx(
      G,
      {
        formOpts: n,
        path: e,
        validationKey: S,
        stateKey: r,
        children: F
      }
    )
  ] }, "dsads" + e.join("."));
};
function G({
  formOpts: o,
  path: e,
  validationKey: t,
  stateKey: n,
  children: r,
  validIndices: s
}) {
  const { getInitialOptions: i, getValidationErrors: c } = a.getState(), u = C(
    t,
    e,
    s
  ), l = [];
  if (u) {
    const f = u.join(", ");
    l.includes(f) || l.push(f);
  }
  let g = l?.length > 0 ? l?.join(", ") : "";
  const S = i(n);
  return /* @__PURE__ */ m.jsx(m.Fragment, { children: S?.formElements?.validation && !o?.validation?.disable ? S.formElements.validation({
    children: /* @__PURE__ */ m.jsxs(b.Fragment, { children: [
      " ",
      e.toString(),
      r
    ] }, e.toString()),
    active: g != "",
    message: o?.validation?.message ? o?.validation?.message : o?.validation?.message == "" ? "" : g,
    path: e,
    ...o?.key && { key: o?.key }
  }) : /* @__PURE__ */ m.jsx(b.Fragment, { children: r }, e.toString()) });
}
export {
  P as FormControlComponent,
  G as ValidationWrapper,
  D as cutFunc,
  U as pushFunc,
  R as updateFn,
  k as useGetKeyState,
  $ as useGetSyncInfo,
  C as useGetValidationErrors,
  v as useStoreSubscription
};
//# sourceMappingURL=Functions.jsx.map
