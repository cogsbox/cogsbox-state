import { j as d } from "./node_modules/react/jsx-runtime.jsx";
import { getNestedValue as V, isFunction as T, updateNestedProperty as y } from "./utility.js";
import b, { r as S } from "./node_modules/react/index.js";
import { getGlobalStore as l } from "./store.js";
function R(o, t, e, n) {
  o(
    (r) => {
      if (T(t)) {
        const s = t(V(r, e));
        let i = y(e, r, s);
        return typeof i == "string" && (i = i.trim()), i;
      } else {
        let s = !e || e.length == 0 ? t : y(e, r, t);
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
      let c = !e || e.length == 0 ? i : V(i, [...e]), u = [...c];
      return u.splice(
        Number(r) == 0 ? r : c.length,
        0,
        T(t) ? t(c) : t
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
function D(o, t, e, n) {
  const r = l.getState().getNestedState(e, t);
  o(
    (s) => {
      const i = V(s, [...t]);
      if (n < 0 || n >= i?.length)
        throw new Error(`Index ${n} does not exist in the array.`);
      const c = n || Number(n) == 0 ? n : i.length - 1, u = [
        ...i.slice(0, c),
        ...i.slice(c + 1)
      ];
      return console.log(n), t.length == 0 ? u : y([...t], s, u);
    },
    [
      ...t,
      n || n === 0 ? n?.toString() : (r.length - 1).toString()
    ],
    { updateType: "cut" }
  );
}
const v = (o, t, e = (n, r) => JSON.stringify(n) === JSON.stringify(r)) => {
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
}, C = (o, t, e) => {
  const n = o + "." + (t.length > 0 ? [t.join(".")] : []) + (e && e.length > 0 ? "." + e : "");
  return e?.length === 0 ? [] : v(
    n,
    (r, s) => r.getValidationErrors(s) || []
  );
}, $ = (o, t) => {
  const e = `${o}:${t.join(".")}`;
  return v(
    e,
    (n, r) => n.getSyncInfo(r)
  );
}, k = (o, t) => v(
  `${o}:${t.join(".")}`,
  (e, n) => e.getNestedState(o, t)
), P = ({
  setState: o,
  path: t,
  child: e,
  formOpts: n,
  stateKey: r
}) => {
  const { getValidationErrors: s, getInitialOptions: i } = l.getState(), c = k(r, t), [u, a] = S.useState(
    l.getState().getNestedState(r, t)
  ), g = i(r);
  if (!g?.validationKey)
    throw new Error(
      "Validation key not found. You need ot set it in the options for the createCogsState function"
    );
  const m = g.validationKey;
  S.useEffect(() => {
    a(c);
  }, [r, t.join("."), c]);
  const f = S.useRef();
  let N = (E, I) => {
    a(E), f.current && clearTimeout(f.current), f.current = setTimeout(() => {
      R(o, E, t, m);
    }, n?.debounceTime ?? 300);
  };
  S.useEffect(() => () => {
    f.current && clearTimeout(f.current);
  }, []);
  const j = $(r, t), F = j ? {
    ...j,
    date: new Date(j.timeStamp)
  } : null, w = e({
    get: () => u || l.getState().getNestedState(r, t),
    set: N,
    syncStatus: F,
    path: t,
    validationErrors: () => s(m + "." + t.join(".")),
    // Add default input props
    inputProps: {
      value: u || l.getState().getNestedState(r, t) || "",
      onChange: (E) => N(E.target.value)
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
  const { getInitialOptions: i, getValidationErrors: c } = l.getState(), u = C(
    e,
    t,
    s
  ), a = [];
  if (u) {
    const f = u.join(", ");
    a.includes(f) || a.push(f);
  }
  let g = a?.length > 0 ? a?.join(", ") : "";
  const m = i(n);
  return /* @__PURE__ */ d.jsx(d.Fragment, { children: m?.formElements?.validation && !o?.validation?.disable ? m.formElements.validation({
    children: /* @__PURE__ */ d.jsx(b.Fragment, { children: r }, t.toString()),
    active: g != "",
    message: o?.validation?.message ? o?.validation?.message : o?.validation?.message == "" ? "" : g,
    path: t,
    ...o?.key && { key: o?.key }
  }) : /* @__PURE__ */ d.jsx(b.Fragment, { children: r }, t.toString()) });
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
