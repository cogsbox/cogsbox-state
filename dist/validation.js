import { getGlobalStore as g } from "./store.js";
import { isDeepEqual as v } from "./utility.js";
function w(c, n) {
  const {
    getInitialOptions: d,
    getShadowMetadata: f,
    setShadowMetadata: h,
    notifyPathSubscribers: p
  } = g.getState(), { stateKey: o, path: r, newValue: m, updateType: I } = c;
  if (I !== "update")
    return;
  const e = d(o)?.validation;
  if (!e) return;
  const s = f(o, r) || {}, l = s.typeInfo?.schema, V = s.validation?.status;
  let t = !1, a = "error";
  if (n === "onBlur" && e.onBlur ? (t = !0, a = e.onBlur) : n === "onChange" && e.onChange ? (t = !0, a = e.onChange) : n === "onChange" && V === "INVALID" ? (t = !0, a = "warning") : n === "programmatic" && (e.onBlur || e.onChange) && (t = !0, a = e.onBlur || e.onChange || "error"), !t || !l)
    return;
  const i = l.safeParse(m), u = {
    status: i.success ? "VALID" : "INVALID",
    errors: i.success ? [] : [
      {
        source: "client",
        message: i.error.issues[0]?.message || "Invalid value",
        severity: a
      }
    ],
    lastValidated: Date.now()
  };
  v(s.validation, u) || (h(o, r, {
    ...s,
    validation: u
  }), p([o, ...r].join("."), {
    type: "VALIDATION_UPDATE"
  }));
}
export {
  w as runValidation
};
//# sourceMappingURL=validation.js.map
