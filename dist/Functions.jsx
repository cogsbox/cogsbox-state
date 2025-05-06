import { jsx as V, Fragment as M } from "react/jsx-runtime";
import "./CogsState.jsx";
import { getNestedValue as R, isFunction as U, updateNestedProperty as F } from "./utility.js";
import G, { useRef as b, useState as z, useEffect as j } from "react";
import { getGlobalStore as d, formRefStore as O } from "./store.js";
import { validateZodPathFunc as W } from "./useValidateZodPath.js";
function I(n, e, t, r) {
  n(
    (o) => {
      if (U(e)) {
        const s = e(R(o, t));
        let i = F(t, o, s);
        return typeof i == "string" && (i = i.trim()), i;
      } else {
        let s = !t || t.length == 0 ? e : F(t, o, e);
        return typeof s == "string" && (s = s.trim()), s;
      }
    },
    t,
    { updateType: "update" },
    r
  );
}
function p(n, e, t, r, o) {
  const s = d.getState().getNestedState(r, t);
  n(
    (i) => {
      let u = !t || t.length == 0 ? i : R(i, [...t]), c = [...u];
      return c.splice(
        Number(o) == 0 ? o : u.length,
        0,
        U(e) ? e(u) : e
      ), t.length == 0 ? c : F([...t], i, c);
    },
    [
      ...t,
      (s.length - 1).toString()
    ],
    {
      updateType: "insert"
    }
  );
}
function ee(n, e, t, r) {
  const o = d.getState().getNestedState(t, e);
  n(
    (s) => {
      const i = R(s, [...e]);
      if (r < 0 || r >= i?.length)
        throw new Error(`Index ${r} does not exist in the array.`);
      const u = r || Number(r) == 0 ? r : i.length - 1, c = [
        ...i.slice(0, u),
        ...i.slice(u + 1)
      ];
      return e.length == 0 ? c : F([...e], s, c);
    },
    [
      ...e,
      r || r === 0 ? r?.toString() : (o.length - 1).toString()
    ],
    { updateType: "cut" }
  );
}
const N = (n, e, t = (r, o) => JSON.stringify(r) === JSON.stringify(o)) => {
  const [r, o] = z(
    () => e(d.getState(), n)
  ), s = b(r), i = b(n);
  return j(() => {
    i.current = n, o(e(d.getState(), n));
    const u = (f) => {
      const l = e(f, i.current);
      t(s.current, l) || (s.current = l, o(l));
    }, c = d.subscribe(u);
    return () => {
      c();
    };
  }, [n]), r;
}, Z = (n, e, t) => {
  const r = n + "." + (e.length > 0 ? [e.join(".")] : []) + (t && t.length > 0 ? "." + t : "");
  return N(
    r,
    (s, i) => s.getValidationErrors(i) || []
  );
}, q = (n, e) => {
  const t = `${n}:${e.join(".")}`;
  return N(
    t,
    (r, o) => r.getSyncInfo(o)
  );
}, H = (n, e) => N(
  `${n}:${e.join(".")}`,
  (t, r) => t.getNestedState(n, e)
), te = ({
  setState: n,
  // This is the real effectiveSetState from the hook
  path: e,
  child: t,
  formOpts: r,
  stateKey: o
}) => {
  const { registerFormRef: s, getFormRef: i } = O.getState(), {
    getValidationErrors: u,
    addValidationError: c,
    getInitialOptions: f,
    removeValidationError: l
  } = d.getState(), w = o + "." + e.join("."), k = b(null), C = i(w);
  C || s(w, k);
  const A = C || k, S = H(o, e), [E, $] = z(S), y = b(!1), m = b(null);
  j(() => {
    !y.current && S !== E && $(S);
  }, [S]), j(() => () => {
    m.current && (clearTimeout(m.current), y.current = !1);
  }, []);
  const B = (a) => {
    $(a), y.current = !0, m.current && clearTimeout(m.current), m.current = setTimeout(
      () => {
        y.current = !1, I(n, a, e, g);
      },
      r?.debounceTime ?? (typeof S == "boolean" ? 20 : 200)
    );
  }, v = f(o);
  if (!v?.validation?.key)
    throw new Error("Validation key not found.");
  const g = v.validation.key, D = v.validation.onBlur === !0, J = async () => {
    if (m.current && (clearTimeout(m.current), y.current = !1, I(n, E, e, g)), !(!v.validation?.zodSchema || !D)) {
      l(g + "." + e.join("."));
      try {
        const a = d.getState().getNestedState(o, e);
        await W(
          g,
          v.validation.zodSchema,
          e,
          a
        );
      } catch (a) {
        console.error("Validation error on blur:", a);
      }
    }
  }, T = q(o, e), P = T ? { ...T, date: new Date(T.timeStamp) } : null, L = t({
    // --- START CHANGES ---
    get: () => E,
    // Get should return the immediate local value
    set: B,
    // Use the new debounced updater
    // --- END CHANGES ---
    syncStatus: P,
    path: e,
    validationErrors: () => u(g + "." + e.join(".")),
    addValidationError: (a) => {
      l(g + "." + e.join(".")), c(g + "." + e.join("."), a ?? "");
    },
    inputProps: {
      // --- START CHANGES ---
      value: E ?? "",
      // Input value is always the local state
      onChange: (a) => B(a.target.value),
      // Use debounced updater
      // --- END CHANGES ---
      onBlur: J,
      ref: A
    }
  });
  return /* @__PURE__ */ V(M, { children: /* @__PURE__ */ V(Q, { formOpts: r, path: e, validationKey: g, stateKey: o, children: L }) });
};
function Q({
  formOpts: n,
  path: e,
  validationKey: t,
  stateKey: r,
  children: o,
  validIndices: s
}) {
  const { getInitialOptions: i } = d.getState(), u = Z(
    t,
    e,
    s
  ), c = [];
  if (u) {
    const l = u.join(", ");
    c.includes(l) || c.push(l);
  }
  const f = i(r);
  return /* @__PURE__ */ V(M, { children: f?.formElements?.validation && !n?.validation?.disable ? f.formElements.validation({
    children: /* @__PURE__ */ V(G.Fragment, { children: o }, e.toString()),
    active: u.length > 0,
    message: n?.validation?.hideMessage ? "" : n?.validation?.message ? n?.validation?.message : c.map((l) => l).join(", "),
    path: e,
    ...n?.key && { key: n?.key }
  }) : /* @__PURE__ */ V(G.Fragment, { children: o }, e.toString()) });
}
export {
  te as FormControlComponent,
  Q as ValidationWrapper,
  ee as cutFunc,
  p as pushFunc,
  I as updateFn,
  H as useGetKeyState,
  q as useGetSyncInfo,
  Z as useGetValidationErrors,
  N as useStoreSubscription
};
//# sourceMappingURL=Functions.jsx.map
