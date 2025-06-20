import { jsx as V, Fragment as M } from "react/jsx-runtime";
import "./CogsState.jsx";
import { getNestedValue as N, isFunction as U, updateNestedProperty as T } from "./utility.js";
import I, { useRef as b, useState as z, useEffect as R } from "react";
import { formRefStore as O, getGlobalStore as d } from "./store.js";
import { validateZodPathFunc as W } from "./useValidateZodPath.js";
function j(n, e, t, r) {
  n(
    (o) => {
      if (U(e)) {
        const u = e(N(o, t));
        let i = T(t, o, u);
        return typeof i == "string" && (i = i.trim()), i;
      } else {
        let u = !t || t.length == 0 ? e : T(t, o, e);
        return typeof u == "string" && (u = u.trim()), u;
      }
    },
    t,
    { updateType: "update" },
    r
  );
}
function p(n, e, t, r, o) {
  const u = d.getState().getNestedState(r, t);
  n(
    (i) => {
      let s = !t || t.length == 0 ? i : N(i, [...t]), c = [...s];
      return c.splice(
        Number(o) == 0 ? o : s.length,
        0,
        U(e) ? e(s) : e
      ), t.length == 0 ? c : T([...t], i, c);
    },
    [
      ...t,
      (u.length - 1).toString()
    ],
    {
      updateType: "insert"
    }
  );
}
function ee(n, e, t, r) {
  const o = d.getState().getNestedState(t, e);
  n(
    (u) => {
      const i = N(u, [...e]);
      if (r < 0 || r >= i?.length)
        throw new Error(`Index ${r} does not exist in the array.`);
      const s = r || Number(r) == 0 ? r : i.length - 1, c = [
        ...i.slice(0, s),
        ...i.slice(s + 1)
      ];
      return e.length == 0 ? c : T([...e], u, c);
    },
    [
      ...e,
      r || r === 0 ? r?.toString() : (o.length - 1).toString()
    ],
    { updateType: "cut" }
  );
}
const w = (n, e, t = (r, o) => JSON.stringify(r) === JSON.stringify(o)) => {
  const [r, o] = z(
    () => e(d.getState(), n)
  ), u = b(r), i = b(n);
  return R(() => {
    i.current = n, o(e(d.getState(), n));
    const s = (m) => {
      const g = e(m, i.current);
      t(u.current, g) || (u.current = g, o(g));
    }, c = d.subscribe(s);
    return () => {
      c();
    };
  }, [n]), r;
}, Z = (n, e, t) => {
  const r = n + "." + (e.length > 0 ? [e.join(".")] : []) + (t && t.length > 0 ? "." + t : "");
  return w(
    r,
    (u, i) => u.getValidationErrors(i) || []
  );
}, q = (n, e) => {
  const t = `${n}:${e.join(".")}`;
  return w(
    t,
    (r, o) => r.getSyncInfo(o)
  );
}, H = (n, e) => w(
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
  const { registerFormRef: u, getFormRef: i } = O.getState(), {
    getValidationErrors: s,
    addValidationError: c,
    getInitialOptions: m,
    removeValidationError: g
  } = d.getState(), k = o + "." + e.join("."), C = b(null), $ = i(k);
  $ || u(k, C);
  const A = $ || C, y = H(o, e), [E, B] = z(y), S = b(!1), l = b(null);
  R(() => {
    !S.current && y !== E && B(y);
  }, [y]), R(() => () => {
    l.current && (clearTimeout(l.current), l.current = null, S.current = !1);
  }, []);
  const G = (a) => {
    if (B(a), S.current = !0, a === "") {
      l.current && (clearTimeout(l.current), l.current = null), j(n, a, e, f), S.current = !1;
      return;
    }
    l.current && clearTimeout(l.current), l.current = setTimeout(
      () => {
        S.current = !1, j(n, a, e, f);
      },
      r?.debounceTime ?? (typeof y == "boolean" ? 20 : 200)
    );
  }, v = m(o);
  if (!v?.validation?.key)
    throw new Error("Validation key not found.");
  const f = v.validation.key, D = v.validation.onBlur === !0, J = async () => {
    if (l.current && (clearTimeout(l.current), l.current = null, S.current = !1, j(n, E, e, f)), !(!v.validation?.zodSchema || !D)) {
      g(f + "." + e.join("."));
      try {
        const a = d.getState().getNestedState(o, e);
        await W(
          f,
          v.validation.zodSchema,
          e,
          a
        );
      } catch (a) {
        console.error("Validation error on blur:", a);
      }
    }
  }, F = q(o, e), P = F ? { ...F, date: new Date(F.timeStamp) } : null, L = t({
    // --- START CHANGES ---
    get: () => E,
    // Get should return the immediate local value
    set: G,
    // Use the new debounced updater
    // --- END CHANGES ---
    syncStatus: P,
    path: e,
    validationErrors: () => s(f + "." + e.join(".")),
    addValidationError: (a) => {
      g(f + "." + e.join(".")), c(f + "." + e.join("."), a ?? "");
    },
    inputProps: {
      // --- START CHANGES ---
      value: E ?? "",
      // Input value is always the local state
      onChange: (a) => G(a.target.value),
      // Use debounced updater
      // --- END CHANGES ---
      onBlur: J,
      ref: A
    }
  });
  return /* @__PURE__ */ V(M, { children: /* @__PURE__ */ V(Q, { formOpts: r, path: e, validationKey: f, stateKey: o, children: L }) });
};
function Q({
  formOpts: n,
  path: e,
  validationKey: t,
  stateKey: r,
  children: o,
  validIndices: u
}) {
  const { getInitialOptions: i } = d.getState(), s = Z(
    t,
    e,
    u
  ), c = [];
  if (s) {
    const g = s.join(", ");
    c.includes(g) || c.push(g);
  }
  const m = i(r);
  return /* @__PURE__ */ V(M, { children: m?.formElements?.validation && !n?.validation?.disable ? m.formElements.validation({
    children: /* @__PURE__ */ V(I.Fragment, { children: o }, e.toString()),
    active: s.length > 0,
    message: n?.validation?.hideMessage ? "" : n?.validation?.message ? n?.validation?.message : c.map((g) => g).join(", "),
    path: e,
    ...n?.key && { key: n?.key }
  }) : /* @__PURE__ */ V(I.Fragment, { children: o }, e.toString()) });
}
export {
  te as FormControlComponent,
  Q as ValidationWrapper,
  ee as cutFunc,
  p as pushFunc,
  j as updateFn,
  H as useGetKeyState,
  q as useGetSyncInfo,
  Z as useGetValidationErrors,
  w as useStoreSubscription
};
//# sourceMappingURL=Functions.jsx.map
