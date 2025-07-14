import { jsx as i, Fragment as v } from "react/jsx-runtime";
import g from "react";
import { getGlobalStore as S } from "./store.js";
function p({
  formOpts: a,
  path: t,
  stateKey: e,
  children: o,
  validIndices: h
}) {
  const { getInitialOptions: m, getShadowMetadata: c } = S.getState(), n = m(e), s = c(e, t), r = s?.validation, l = r?.status || "PRISTINE", d = r?.message;
  return console.log("ValidationWrapper shadow:", {
    stateKey: e,
    path: t,
    shadowMeta: s,
    status: l,
    message: d
  }), /* @__PURE__ */ i(v, { children: n?.formElements?.validation && !a?.validation?.disable ? n.formElements.validation({
    children: /* @__PURE__ */ i(g.Fragment, { children: o }, t.toString()),
    status: l,
    // Pass status instead of active
    message: a?.validation?.hideMessage ? "" : a?.validation?.message || d || "",
    path: t,
    stretch: a?.validation?.stretch
  }) : /* @__PURE__ */ i(g.Fragment, { children: o }, t.toString()) });
}
export {
  p as ValidationWrapper
};
//# sourceMappingURL=Functions.jsx.map
