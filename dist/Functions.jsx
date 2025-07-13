import { jsx as m, Fragment as S } from "react/jsx-runtime";
import d, { useState as v, useRef as f, useEffect as b } from "react";
import { getGlobalStore as l } from "./store.js";
const E = (t, e, r = (n, o) => JSON.stringify(n) === JSON.stringify(o)) => {
  const [n, o] = v(
    () => e(l.getState(), t)
  ), a = f(n), s = f(t);
  return b(() => {
    s.current = t, o(e(l.getState(), t));
    const g = (c) => {
      const i = e(c, s.current);
      r(a.current, i) || (a.current = i, o(i));
    }, u = l.subscribe(g);
    return () => {
      u();
    };
  }, [t]), n;
}, V = (t, e, r) => {
  const n = t + "." + (e.length > 0 ? [e.join(".")] : []) + (r && r.length > 0 ? "." + r : "");
  return E(
    n,
    (a, s) => a.getValidationErrors(s) || []
  );
};
function y({
  formOpts: t,
  path: e,
  stateKey: r,
  children: n,
  validIndices: o
}) {
  const { getInitialOptions: a } = l.getState(), s = a(r), g = s?.validation?.key ?? r, u = V(
    g,
    e,
    o
  ), c = [];
  if (u) {
    const i = u.join(", ");
    c.includes(i) || c.push(i);
  }
  return /* @__PURE__ */ m(S, { children: s?.formElements?.validation && !t?.validation?.disable ? s.formElements.validation({
    children: /* @__PURE__ */ m(d.Fragment, { children: n }, e.toString()),
    active: u.length > 0,
    message: t?.validation?.hideMessage ? "" : t?.validation?.message ? t?.validation?.message : c.map((i) => i).join(", "),
    path: e
  }) : /* @__PURE__ */ m(d.Fragment, { children: n }, e.toString()) });
}
export {
  y as ValidationWrapper,
  V as useGetValidationErrors,
  E as useStoreSubscription
};
//# sourceMappingURL=Functions.jsx.map
