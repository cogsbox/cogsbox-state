import { jsx as e, Fragment as c } from "react/jsx-runtime";
import r from "react";
import { getGlobalStore as S } from "./store.js";
function h({
  formOpts: a,
  path: t,
  stateKey: o,
  children: i
}) {
  const { getInitialOptions: d, getShadowMetadata: l } = S.getState(), n = d(o), s = l(o, t)?.validation, m = s?.status || "PRISTINE", g = s?.message;
  return /* @__PURE__ */ e(c, { children: n?.formElements?.validation && !a?.validation?.disable ? n.formElements.validation({
    children: /* @__PURE__ */ e(r.Fragment, { children: i }, t.toString()),
    status: m,
    // Pass status instead of active
    message: a?.validation?.hideMessage ? "" : a?.validation?.message || g || "",
    path: t
  }) : /* @__PURE__ */ e(r.Fragment, { children: i }, t.toString()) });
}
export {
  h as ValidationWrapper
};
//# sourceMappingURL=Functions.jsx.map
