import "react";
import { ZodArray as y, ZodObject as w, ZodOptional as u, ZodNullable as f, ZodEffects as l } from "zod";
import { getGlobalStore as g } from "./store.js";
import { create as m } from "./node_modules/zustand/esm/react.js";
m((t, s) => ({
  results: {},
  request: {},
  getResultsByKey: (n) => s().results[n],
  setResults: (n) => (r) => {
    t((e) => ({
      results: {
        ...e.results,
        [n]: typeof r == "function" ? r(e.results[n]) : r
      }
    }));
  },
  setRequest: (n) => (r) => t((e) => ({
    request: {
      ...e.request,
      [n]: typeof r == "function" ? r(e.request[n]) : r
    }
  })),
  getRequestsByKey: (n) => s().request[n]
}));
async function h(t, s, n, r) {
  let e = s;
  const d = g.getState().addValidationError;
  for (const o of n)
    if (e = c(e), e instanceof y) {
      const i = Number(o);
      if (!isNaN(i))
        e = e.element;
      else
        throw new Error(`Invalid path: array index expected but got '${o}'.`);
    } else if (e instanceof w)
      if (o in e.shape)
        e = e.shape[o];
      else
        throw new Error(`Invalid path: key '${o}' not found in schema.`);
    else
      throw new Error(`Invalid path: key '${o}' not found in schema.`);
  e = c(e, !0);
  const a = await e.safeParseAsync(r);
  if (!a.success) {
    const o = a.error.issues.map((p) => p.message).join(", ");
    console.log("validateZodPathFunc", n.join("."), o);
    const i = [t, ...n].join(".");
    return d(i, o), { success: !1, message: o };
  }
  return { success: !0, message: void 0 };
}
function c(t, s = !1) {
  for (; t instanceof u || t instanceof f || !s && t instanceof l; )
    t instanceof u || t instanceof f ? t = t.unwrap() : t instanceof l && (t = t._def.schema);
  return t;
}
export {
  h as validateZodPathFunc
};
//# sourceMappingURL=useValidateZodPath.js.map
