import { jsx as o, Fragment as c } from "react/jsx-runtime";
import d from "react";
import { getGlobalStore as v } from "./store.js";
function M({
  formOpts: t,
  path: a,
  stateKey: i,
  children: n,
  validIndices: S
}) {
  const { getInitialOptions: g, getShadowMetadata: m } = v.getState(), s = g(i), e = m(i, a), l = e?.validation?.status === "VALIDATION_FAILED", r = e?.validation?.message;
  return console.log("ValidationWrapper shadow meta:", {
    stateKey: i,
    path: a,
    shadowMeta: e,
    hasValidationError: l,
    validationMessage: r
  }), /* @__PURE__ */ o(c, { children: s?.formElements?.validation && !t?.validation?.disable ? s.formElements.validation({
    children: /* @__PURE__ */ o(d.Fragment, { children: n }, a.toString()),
    active: l,
    message: t?.validation?.hideMessage ? "" : t?.validation?.message ? t?.validation?.message : r || "",
    path: a
  }) : /* @__PURE__ */ o(d.Fragment, { children: n }, a.toString()) });
}
export {
  M as ValidationWrapper
};
//# sourceMappingURL=Functions.jsx.map
