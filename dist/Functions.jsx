import { j as f } from "./node_modules/react/jsx-runtime.jsx";
import { getNestedValue as V, isFunction as T, updateNestedProperty as y } from "./utility.js";
import b, { r as S } from "./node_modules/react/index.js";
import { getGlobalStore as a } from "./store.js";
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
function P(o, t, e, n, r) {
  const s = a.getState().getNestedState(n, e);
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
function U(o, t, e, n) {
  const r = a.getState().getNestedState(e, t);
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
    () => t(a.getState(), o)
  ), s = S.useRef(n);
  return S.useEffect(() => {
    const i = a.subscribe((c) => {
      const u = t(c, o);
      e(s.current, u) || (s.current = u, r(u));
    });
    return () => i();
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
}, G = (o, t) => v(
  `${o}:${t.join(".")}`,
  (e, n) => e.getNestedState(o, t)
), D = ({
  setState: o,
  path: t,
  child: e,
  formOpts: n,
  stateKey: r
}) => {
  const { getValidationErrors: s, getInitialOptions: i } = a.getState(), c = G(r, t), [u, l] = S.useState(
    a.getState().getNestedState(r, t)
  ), m = i(r);
  if (!m?.validationKey)
    throw new Error(
      "Validation key not found. You need ot set it in the options for the createCogsState function"
    );
  const d = m.validationKey;
  S.useEffect(() => {
    l(c);
  }, [r, t.join("."), c]);
  const g = S.useRef();
  let N = (E, I) => {
    l(E), g.current && clearTimeout(g.current), g.current = setTimeout(() => {
      R(o, E, t, d);
    }, n?.debounceTime ?? 300);
  };
  S.useEffect(() => () => {
    g.current && clearTimeout(g.current);
  }, []);
  const j = $(r, t), F = j ? {
    ...j,
    date: new Date(j.timeStamp)
  } : null, w = e({
    get: () => u || a.getState().getNestedState(r, t),
    set: N,
    syncStatus: F,
    path: t,
    validationErrors: () => s(d + "." + t.join(".")),
    // Add default input props
    inputProps: {
      value: u || a.getState().getNestedState(r, t) || "",
      onChange: (E) => N(E.target.value)
    }
  });
  return /* @__PURE__ */ f.jsx(f.Fragment, { children: /* @__PURE__ */ f.jsx(
    k,
    {
      formOpts: n,
      path: t,
      validationKey: d,
      stateKey: r,
      children: w
    }
  ) });
};
function k({
  formOpts: o,
  path: t,
  validationKey: e,
  stateKey: n,
  children: r,
  validIndices: s
}) {
  const { getInitialOptions: i, getValidationErrors: c } = a.getState(), u = C(
    e,
    t,
    s
  ), l = [];
  if (u) {
    const g = u.join(", ");
    l.includes(g) || l.push(g);
  }
  let m = l?.length > 0 ? l?.join(", ") : "";
  const d = i(n);
  return /* @__PURE__ */ f.jsx(f.Fragment, { children: d?.formElements?.validation && !o?.validation?.disable ? d.formElements.validation({
    children: /* @__PURE__ */ f.jsx(b.Fragment, { children: r }, t.toString()),
    active: m != "",
    message: o?.validation?.message ? o?.validation?.message : o?.validation?.message == "" ? "" : m,
    path: t,
    ...o?.key && { key: o?.key }
  }) : /* @__PURE__ */ f.jsx(b.Fragment, { children: r }, t.toString()) });
}
export {
  D as FormControlComponent,
  k as ValidationWrapper,
  U as cutFunc,
  P as pushFunc,
  R as updateFn,
  G as useGetKeyState,
  $ as useGetSyncInfo,
  C as useGetValidationErrors,
  v as useStoreSubscription
};
//# sourceMappingURL=Functions.jsx.map
