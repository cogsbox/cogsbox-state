import { jsx as o, Fragment as w } from "react/jsx-runtime";
import d from "react";
import { getGlobalStore as M } from "./store.js";
function F({
  formOpts: a,
  path: e,
  stateKey: s,
  children: n
}) {
  const { getInitialOptions: c, getShadowMetadata: v, getShadowValue: S } = M.getState(), i = c(s), g = v(s, e)?.validation, f = g?.status || "NOT_VALIDATED", r = (g?.errors || []).map((t) => ({
    ...t,
    path: e
  })), l = r.filter((t) => t.severity === "error").map((t) => t.message), m = r.filter((t) => t.severity === "warning").map((t) => t.message), h = l[0] || m[0];
  return /* @__PURE__ */ o(w, { children: i?.formElements?.validation && !a?.validation?.disable ? i.formElements.validation({
    children: /* @__PURE__ */ o(d.Fragment, { children: n }, e.toString()),
    status: f,
    // Now passes the new ValidationStatus type
    message: a?.validation?.hideMessage ? "" : a?.validation?.message || h || "",
    hasErrors: l.length > 0,
    hasWarnings: m.length > 0,
    allErrors: r,
    path: e,
    getData: () => S(s, e)
  }) : /* @__PURE__ */ o(d.Fragment, { children: n }, e.toString()) });
}
export {
  F as ValidationWrapper
};
//# sourceMappingURL=Functions.jsx.map
