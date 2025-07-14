import { jsx as e, Fragment as c } from "react/jsx-runtime";
import r from "react";
import { getGlobalStore as v } from "./store.js";
function f({
  formOpts: t,
  path: a,
  stateKey: i,
  children: o,
  validIndices: S
}) {
  const { getInitialOptions: d, getShadowMetadata: l } = v.getState(), n = d(i), s = l(i, a)?.validation, g = s?.status || "PRISTINE", m = s?.message;
  return /* @__PURE__ */ e(c, { children: n?.formElements?.validation && !t?.validation?.disable ? n.formElements.validation({
    children: /* @__PURE__ */ e(r.Fragment, { children: o }, a.toString()),
    status: g,
    // Pass status instead of active
    message: t?.validation?.hideMessage ? "" : t?.validation?.message || m || "",
    path: a,
    stretch: t?.validation?.stretch
  }) : /* @__PURE__ */ e(r.Fragment, { children: o }, a.toString()) });
}
export {
  f as ValidationWrapper
};
//# sourceMappingURL=Functions.jsx.map
