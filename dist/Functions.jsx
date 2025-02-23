import { j as f } from "./node_modules/react/jsx-runtime.jsx";
import { getNestedValue as V, isFunction as y, updateNestedProperty as j } from "./utility.js";
import b, { r as S } from "./node_modules/react/index.js";
import { getGlobalStore as l } from "./store.js";
function v(s, t, e, n) {
  s(
    (o) => {
      if (y(t)) {
        const r = t(V(o, e));
        let u = j(e, o, r);
        return typeof u == "string" && (u = u.trim()), u;
      } else {
        let r = !e || e.length == 0 ? t : j(e, o, t);
        return typeof r == "string" && (r = r.trim()), r;
      }
    },
    e,
    { updateType: "update" },
    n
  );
}
function I(s, t, e, n, o) {
  const r = l.getState().getNestedState(n, e);
  s(
    (u) => {
      let c = !e || e.length == 0 ? u : V(u, [...e]), i = [...c];
      return i.splice(
        Number(o) == 0 ? o : c.length,
        0,
        y(t) ? t(c) : t
      ), e.length == 0 ? i : j([...e], u, i);
    },
    [
      ...e,
      (r.length - 1).toString()
    ],
    {
      updateType: "insert"
    }
  );
}
function J(s, t, e, n) {
  const o = l.getState().getNestedState(e, t);
  s(
    (r) => {
      const u = V(r, [...t]);
      if (n < 0 || n >= u?.length)
        throw new Error(`Index ${n} does not exist in the array.`);
      const c = n || Number(n) == 0 ? n : u.length - 1, i = [
        ...u.slice(0, c),
        ...u.slice(c + 1)
      ];
      return console.log(n), t.length == 0 ? i : j([...t], r, i);
    },
    [
      ...t,
      n || n === 0 ? n?.toString() : (o.length - 1).toString()
    ],
    { updateType: "cut" }
  );
}
const N = (s, t, e = (n, o) => JSON.stringify(n) === JSON.stringify(o)) => {
  const [n, o] = S.useState(
    () => t(l.getState(), s)
  ), r = S.useRef(n);
  return S.useEffect(() => {
    const u = l.subscribe((c) => {
      const i = t(c, s);
      e(r.current, i) || (r.current = i, o(i));
    });
    return () => u();
  }, [s]), n;
}, w = (s, t, e) => {
  const n = s + "." + (t.length > 0 ? [t.join(".")] : []) + (e && e.length > 0 ? "." + e : "");
  return e?.length === 0 ? [] : N(
    n,
    (o, r) => o.getValidationErrors(r) || []
  );
}, R = (s, t) => {
  const e = `${s}:${t.join(".")}`;
  return N(
    e,
    (n, o) => n.getSyncInfo(o)
  );
}, $ = (s, t) => N(
  `${s}:${t.join(".")}`,
  (e, n) => e.getNestedState(s, t)
), P = ({
  setState: s,
  validationKey: t,
  path: e,
  child: n,
  formOpts: o,
  stateKey: r
}) => {
  const { getValidationErrors: u } = l.getState(), c = $(r, e), [i, g] = S.useState(
    l.getState().getNestedState(r, e)
  );
  S.useEffect(() => {
    g(c);
  }, [r, e.join("."), c]);
  const a = S.useRef();
  let d = (E, G) => {
    g(E), a.current && clearTimeout(a.current), a.current = setTimeout(() => {
      v(s, E, e, t);
    }, o?.debounceTime ?? 300);
  };
  S.useEffect(() => () => {
    a.current && clearTimeout(a.current);
  }, []);
  const m = R(r, e), T = m ? {
    ...m,
    date: new Date(m.timeStamp)
  } : null, F = n({
    get: () => i || l.getState().getNestedState(r, e),
    set: d,
    syncStatus: T,
    path: e,
    validationErrors: () => u(t + "." + e.join(".")),
    // Add default input props
    inputProps: {
      value: i || l.getState().getNestedState(r, e) || "",
      onChange: (E) => d(E.target.value)
    }
  });
  return /* @__PURE__ */ f.jsx(f.Fragment, { children: /* @__PURE__ */ f.jsx(
    C,
    {
      formOpts: o,
      path: e,
      validationKey: t,
      stateKey: r,
      children: F
    }
  ) });
};
function C({
  formOpts: s,
  path: t,
  validationKey: e,
  stateKey: n,
  children: o,
  validIndices: r
}) {
  const { getInitialOptions: u, getValidationErrors: c } = l.getState(), i = w(
    e,
    t,
    r
  ), g = [];
  if (i) {
    const m = i.join(", ");
    g.includes(m) || g.push(m);
  }
  let a = g?.length > 0 ? g?.join(", ") : "";
  const d = u(n);
  return /* @__PURE__ */ f.jsx(f.Fragment, { children: d?.formElements?.validation && !s?.validation?.disable ? d.formElements.validation({
    children: /* @__PURE__ */ f.jsx(b.Fragment, { children: o }, t.toString()),
    active: a != "",
    message: s?.validation?.message ? s?.validation?.message : s?.validation?.message == "" ? "" : a,
    path: t,
    ...s?.key && { key: s?.key }
  }) : /* @__PURE__ */ f.jsx(b.Fragment, { children: o }, t.toString()) });
}
export {
  P as FormControlComponent,
  C as ValidationWrapper,
  J as cutFunc,
  I as pushFunc,
  v as updateFn,
  $ as useGetKeyState,
  R as useGetSyncInfo,
  w as useGetValidationErrors,
  N as useStoreSubscription
};
//# sourceMappingURL=Functions.jsx.map
