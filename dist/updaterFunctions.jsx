import { j as S } from "./node_modules/react/jsx-runtime.jsx";
import { isFunction as A, getNestedValue as b, updateNestedProperty as j } from "./utility.js";
import w, { r as g } from "./node_modules/react/index.js";
import { getGlobalStore as a } from "./store.js";
function M(s, t, e, r) {
  s(
    (o) => {
      if (A(t)) {
        const n = t(b(o, e));
        let i = j(e, o, n);
        return typeof i == "string" && (i = i.trim()), i;
      } else {
        let n = !e || e.length == 0 ? t : j(e, o, t);
        return typeof n == "string" && (n = n.trim()), n;
      }
    },
    e,
    { updateType: "update" },
    r
  );
}
function z(s, t, e, r, o) {
  const n = a.getState().getNestedState(r, e);
  s(
    (i) => {
      let c = !e || e.length == 0 ? i : b(i, [...e]), u = [...c];
      return u.splice(
        Number(o) == 0 ? o : c.length,
        0,
        A(t) ? t(c) : t
      ), e.length == 0 ? u : j([...e], i, u);
    },
    [
      ...e,
      (n.length - 1).toString()
    ],
    {
      updateType: "insert"
    }
  );
}
function B(s, t, e, r) {
  const o = a.getState().getNestedState(e, t);
  s(
    (n) => {
      const i = b(n, [...t]);
      if (r < 0 || r >= i?.length)
        throw new Error(`Index ${r} does not exist in the array.`);
      const c = r || Number(r) == 0 ? r : i.length - 1, u = [
        ...i.slice(0, c),
        ...i.slice(c + 1)
      ];
      return console.log(r), t.length == 0 ? u : j([...t], n, u);
    },
    [
      ...t,
      r || r === 0 ? r?.toString() : (o.length - 1).toString()
    ],
    { updateType: "cut" }
  );
}
const N = (s, t, e = (r, o) => JSON.stringify(r) === JSON.stringify(o)) => {
  const [r, o] = g.useState(
    () => t(a.getState(), s)
  ), n = g.useRef(r);
  return g.useEffect(() => {
    const i = a.subscribe((c) => {
      const u = t(c, s);
      e(n.current, u) || (n.current = u, o(u));
    });
    return () => i();
  }, [s]), r;
}, R = (s, t, e) => {
  const r = s + "." + (t.length > 0 ? [t.join(".")] : []) + (e && e.length > 0 ? "." + e : "");
  return e?.length === 0 ? [] : N(
    r,
    (o, n) => o.getValidationErrors(n) || []
  );
}, k = (s, t) => {
  const e = `${s}:${t.join(".")}`;
  return N(
    e,
    (r, o) => r.getSyncInfo(o)
  );
}, x = (s, t) => N(
  `${s}:${t.join(".")}`,
  (e, r) => e.getNestedState(s, t)
), H = ({
  setState: s,
  validationKey: t,
  path: e,
  child: r,
  formOpts: o,
  stateKey: n
}) => {
  const { getInitialOptions: i, getValidationErrors: c, removeValidationError: u } = a.getState();
  R(t, e);
  const l = a.getState().serverSyncActions[n], f = a.getState().serverState[n], [v, d] = g.useState(
    n && f?.serverSync?.debounce ? f.serverSync.debounce : 3e3
  );
  i(n);
  const T = x(n, e), [F, y] = g.useState(
    a.getState().getNestedState(n, e)
  );
  g.useEffect(() => {
    y(T);
  }, [n, e.join("."), T]);
  const m = g.useRef();
  let C = (E, J) => {
    y(E), m.current && clearTimeout(m.current), m.current = setTimeout(() => {
      o?.validation?.onChange?.clear && (Array.isArray(o.validation.onChange.clear[0]) ? o.validation.onChange.clear.forEach((I) => {
        u(
          t + "." + I.join(".")
        );
      }) : u(
        t + "." + o.validation.onChange.clear.join(".")
      )), M(s, E, e, t);
    }, o?.debounceTime ?? 300);
  };
  g.useEffect(() => () => {
    m.current && clearTimeout(m.current);
  }, []);
  const V = k(n, e), $ = V ? {
    ...V,
    date: new Date(V.timeStamp)
  } : null, G = r({
    get: () => F || a.getState().getNestedState(n, e),
    set: C,
    syncStatus: $,
    path: e,
    validationErrors: () => c(t + "." + e.join(".")),
    // Add default input props
    inputProps: {
      value: F || a.getState().getNestedState(n, e) || "",
      onChange: (E) => C(E.target.value)
    }
  });
  return g.useEffect(() => {
    !n || !l || d((l?.actionTimeStamp ?? 3e3) - Date.now());
  }, [l]), /* @__PURE__ */ S.jsx(S.Fragment, { children: /* @__PURE__ */ S.jsx(
    D,
    {
      formOpts: o,
      path: e,
      validationKey: t,
      stateKey: n,
      children: G
    }
  ) });
};
function D({
  formOpts: s,
  path: t,
  validationKey: e,
  stateKey: r,
  children: o,
  validIndices: n
}) {
  const { getInitialOptions: i, getValidationErrors: c } = a.getState(), u = R(
    e,
    t,
    n
  ), l = [];
  if (u) {
    const d = u.join(", ");
    l.includes(d) || l.push(d);
  }
  let f = l?.length > 0 ? l?.join(", ") : "";
  const v = i(r);
  return /* @__PURE__ */ S.jsx(S.Fragment, { children: v?.formElements?.validation && !s?.validation?.disable ? v.formElements.validation({
    children: /* @__PURE__ */ S.jsx(w.Fragment, { children: o }, t.toString()),
    active: f != "",
    message: s?.validation?.message ? s?.validation?.message : s?.validation?.message == "" ? "" : f,
    path: t,
    ...s?.key && { key: s?.key }
  }) : /* @__PURE__ */ S.jsx(w.Fragment, { children: o }, t.toString()) });
}
export {
  H as FormControlComponent,
  D as ValidationWrapper,
  B as cutFunc,
  z as pushFunc,
  M as updateFn,
  x as useGetKeyState,
  k as useGetSyncInfo,
  R as useGetValidationErrors,
  N as useStoreSubscription
};
//# sourceMappingURL=updaterFunctions.jsx.map
