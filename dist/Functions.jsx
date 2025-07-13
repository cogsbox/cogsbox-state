import { jsx as d, Fragment as S } from "react/jsx-runtime";
import m, { useState as v, useRef as f, useEffect as b } from "react";
import { getGlobalStore as g } from "./store.js";
const E = (t, e, n = (r, s) => JSON.stringify(r) === JSON.stringify(s)) => {
  const [r, s] = v(
    () => e(g.getState(), t)
  ), a = f(r), i = f(t);
  return b(() => {
    i.current = t, s(e(g.getState(), t));
    const u = (l) => {
      const o = e(l, i.current);
      n(a.current, o) || (a.current = o, s(o));
    }, c = g.subscribe(u);
    return () => {
      c();
    };
  }, [t]), r;
}, V = (t, e, n) => {
  const r = t + "." + (e.length > 0 ? [e.join(".")] : []) + (n && n.length > 0 ? "." + n : "");
  return E(
    r,
    (a, i) => a.getValidationErrors(i) || []
  );
};
function F({
  formOpts: t,
  path: e,
  stateKey: n,
  children: r,
  validIndices: s
}) {
  const { getInitialOptions: a } = g.getState(), i = a(n), u = i?.validation?.key ?? n, c = V(
    u,
    e,
    s
  );
  console.log(
    "validationErrors ValidationWrapper",
    n,
    u,
    e,
    c
  );
  const l = [];
  if (c) {
    const o = c.join(", ");
    l.includes(o) || l.push(o);
  }
  return /* @__PURE__ */ d(S, { children: i?.formElements?.validation && !t?.validation?.disable ? i.formElements.validation({
    children: /* @__PURE__ */ d(m.Fragment, { children: r }, e.toString()),
    active: c.length > 0,
    message: t?.validation?.hideMessage ? "" : t?.validation?.message ? t?.validation?.message : l.map((o) => o).join(", "),
    path: e
  }) : /* @__PURE__ */ d(m.Fragment, { children: r }, e.toString()) });
}
export {
  F as ValidationWrapper,
  V as useGetValidationErrors,
  E as useStoreSubscription
};
//# sourceMappingURL=Functions.jsx.map
