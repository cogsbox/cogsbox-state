import "react";
import { ZodArray as y, ZodObject as m, ZodOptional as f, ZodNullable as u, ZodEffects as l } from "zod";
import { create as w } from "zustand";
import "uuid";
import { getGlobalStore as g } from "./store.js";
w((t, o) => ({
  results: {},
  request: {},
  getResultsByKey: (r) => o().results[r],
  setResults: (r) => (n) => {
    t((e) => ({
      results: {
        ...e.results,
        [r]: typeof n == "function" ? n(e.results[r]) : n
      }
    }));
  },
  setRequest: (r) => (n) => t((e) => ({
    request: {
      ...e.request,
      [r]: typeof n == "function" ? n(e.request[r]) : n
    }
  })),
  getRequestsByKey: (r) => o().request[r]
}));
async function v(t, o, r, n) {
  let e = o;
  const d = g.getState().addValidationError;
  for (const s of r)
    if (e = c(e), e instanceof y) {
      const i = Number(s);
      if (!isNaN(i))
        e = e.element;
      else
        throw new Error(`Invalid path: array index expected but got '${s}'.`);
    } else if (e instanceof m)
      if (s in e.shape)
        e = e.shape[s];
      else
        throw new Error(`Invalid path: key '${s}' not found in schema.`);
    else
      throw new Error(`Invalid path: key '${s}' not found in schema.`);
  e = c(e, !0);
  const a = await e.safeParseAsync(n);
  if (!a.success) {
    const s = a.error.issues.map((p) => p.message).join(", "), i = [t, ...r].join(".");
    return d(i, s), { success: !1, message: s };
  }
  return { success: !0, message: void 0 };
}
function c(t, o = !1) {
  for (; t instanceof f || t instanceof u || !o && t instanceof l; )
    t instanceof f || t instanceof u ? t = t.unwrap() : t instanceof l && (t = t._def.schema);
  return t;
}
export {
  v as validateZodPathFunc
};
//# sourceMappingURL=useValidateZodPath.js.map
