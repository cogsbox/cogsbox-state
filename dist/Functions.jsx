import { jsx as m, Fragment as S } from "react/jsx-runtime";
import "./CogsState.jsx";
import d, { useState as v, useRef as f, useEffect as b } from "react";
import { getGlobalStore as l } from "./store.js";
const p = (t, e, r = (n, o) => JSON.stringify(n) === JSON.stringify(o)) => {
  const [n, o] = v(
    () => e(l.getState(), t)
  ), a = f(n), i = f(t);
  return b(() => {
    i.current = t, o(e(l.getState(), t));
    const g = (c) => {
      const s = e(c, i.current);
      r(a.current, s) || (a.current = s, o(s));
    }, u = l.subscribe(g);
    return () => {
      u();
    };
  }, [t]), n;
}, E = (t, e, r) => {
  const n = t + "." + (e.length > 0 ? [e.join(".")] : []) + (r && r.length > 0 ? "." + r : "");
  return p(
    n,
    (a, i) => a.getValidationErrors(i) || []
  );
};
function F({
  formOpts: t,
  path: e,
  stateKey: r,
  children: n,
  validIndices: o
}) {
  const { getInitialOptions: a } = l.getState(), i = a(r), g = i?.validation?.key ?? r, u = E(
    g,
    e,
    o
  ), c = [];
  if (u) {
    const s = u.join(", ");
    c.includes(s) || c.push(s);
  }
  return /* @__PURE__ */ m(S, { children: i?.formElements?.validation && !t?.validation?.disable ? i.formElements.validation({
    children: /* @__PURE__ */ m(d.Fragment, { children: n }, e.toString()),
    active: u.length > 0,
    message: t?.validation?.hideMessage ? "" : t?.validation?.message ? t?.validation?.message : c.map((s) => s).join(", "),
    path: e
  }) : /* @__PURE__ */ m(d.Fragment, { children: n }, e.toString()) });
}
export {
  F as ValidationWrapper,
  E as useGetValidationErrors,
  p as useStoreSubscription
};
//# sourceMappingURL=Functions.jsx.map
