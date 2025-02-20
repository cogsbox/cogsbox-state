import { j as S } from "./node_modules/react/jsx-runtime.jsx";
import { isFunction as F, getNestedValue as N, updateNestedProperty as j } from "./utility.js";
import v, { r as f } from "./node_modules/react/index.js";
import { getGlobalStore as g } from "./store.js";
function $(s, t, e, n) {
  s(
    (o) => {
      if (F(t)) {
        const r = t(N(o, e));
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
function P(s, t, e, n, o) {
  const r = g.getState().getNestedState(n, e);
  s(
    (u) => {
      let c = !e || e.length == 0 ? u : N(u, [...e]), i = [...c];
      return i.splice(
        Number(o) == 0 ? o : c.length,
        0,
        F(t) ? t(c) : t
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
function U(s, t, e, n) {
  const o = g.getState().getNestedState(e, t);
  s(
    (r) => {
      const u = N(r, [...t]);
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
const b = (s, t, e = (n, o) => JSON.stringify(n) === JSON.stringify(o)) => {
  const [n, o] = f.useState(
    () => t(g.getState(), s)
  ), r = f.useRef(n);
  return f.useEffect(() => {
    const u = g.subscribe((c) => {
      const i = t(c, s);
      e(r.current, i) || (r.current = i, o(i));
    });
    return () => u();
  }, [s]), n;
}, y = (s, t, e) => {
  const n = s + "." + (t.length > 0 ? [t.join(".")] : []) + (e && e.length > 0 ? "." + e : "");
  return e?.length === 0 ? [] : b(
    n,
    (o, r) => o.getValidationErrors(r) || []
  );
}, C = (s, t) => {
  const e = `${s}:${t.join(".")}`;
  return b(
    e,
    (n, o) => n.getSyncInfo(o)
  );
}, G = (s, t) => b(
  `${s}:${t.join(".")}`,
  (e, n) => e.getNestedState(s, t)
), D = ({
  setState: s,
  validationKey: t,
  path: e,
  child: n,
  formOpts: o,
  stateKey: r
}) => {
  const { getInitialOptions: u, getValidationErrors: c, removeValidationError: i } = g.getState();
  y(t, e), g.getState().serverSyncActions[r], g.getState().serverState[r];
  const l = G(r, e), [m, d] = f.useState(
    g.getState().getNestedState(r, e)
  );
  f.useEffect(() => {
    d(l);
  }, [r, e.join("."), l]);
  const a = f.useRef();
  let T = (E, I) => {
    d(E), a.current && clearTimeout(a.current), a.current = setTimeout(() => {
      $(s, E, e, t);
    }, o?.debounceTime ?? 300);
  };
  f.useEffect(() => () => {
    a.current && clearTimeout(a.current);
  }, []);
  const V = C(r, e), w = V ? {
    ...V,
    date: new Date(V.timeStamp)
  } : null, R = n({
    get: () => m || g.getState().getNestedState(r, e),
    set: T,
    syncStatus: w,
    path: e,
    validationErrors: () => c(t + "." + e.join(".")),
    // Add default input props
    inputProps: {
      value: m || g.getState().getNestedState(r, e) || "",
      onChange: (E) => T(E.target.value)
    }
  });
  return /* @__PURE__ */ S.jsx(S.Fragment, { children: /* @__PURE__ */ S.jsx(
    A,
    {
      formOpts: o,
      path: e,
      validationKey: t,
      stateKey: r,
      children: R
    }
  ) });
};
function A({
  formOpts: s,
  path: t,
  validationKey: e,
  stateKey: n,
  children: o,
  validIndices: r
}) {
  const { getInitialOptions: u, getValidationErrors: c } = g.getState(), i = y(
    e,
    t,
    r
  ), l = [];
  if (i) {
    const a = i.join(", ");
    l.includes(a) || l.push(a);
  }
  let m = l?.length > 0 ? l?.join(", ") : "";
  const d = u(n);
  return /* @__PURE__ */ S.jsx(S.Fragment, { children: d?.formElements?.validation && !s?.validation?.disable ? d.formElements.validation({
    children: /* @__PURE__ */ S.jsx(v.Fragment, { children: o }, t.toString()),
    active: m != "",
    message: s?.validation?.message ? s?.validation?.message : s?.validation?.message == "" ? "" : m,
    path: t,
    ...s?.key && { key: s?.key }
  }) : /* @__PURE__ */ S.jsx(v.Fragment, { children: o }, t.toString()) });
}
export {
  D as FormControlComponent,
  A as ValidationWrapper,
  U as cutFunc,
  P as pushFunc,
  $ as updateFn,
  G as useGetKeyState,
  C as useGetSyncInfo,
  y as useGetValidationErrors,
  b as useStoreSubscription
};
//# sourceMappingURL=updaterFunctions.jsx.map
