import { jsx as V, Fragment as M } from "react/jsx-runtime";
import "./CogsState.jsx";
import { getNestedValue as N, isFunction as O, updateNestedProperty as T } from "./utility.js";
import I, { useRef as b, useState as U, useEffect as R } from "react";
import { getGlobalStore as m, formRefStore as L } from "./store.js";
import { validateZodPathFunc as W } from "./useValidateZodPath.js";
function j(r, e, t, n) {
  r(
    (o) => {
      if (O(e)) {
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
    n
  );
}
function p(r, e, t, n, o) {
  const u = m.getState().getNestedState(n, t);
  r(
    (i) => {
      let c = !t || t.length == 0 ? i : N(i, [...t]), s = [...c];
      return s.splice(
        Number(o) == 0 ? o : c.length,
        0,
        O(e) ? e(c) : e
      ), t.length == 0 ? s : T([...t], i, s);
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
function ee(r, e, t, n) {
  const o = m.getState().getNestedState(t, e);
  r(
    (u) => {
      const i = N(u, [...e]);
      if (n < 0 || n >= i?.length)
        throw new Error(`Index ${n} does not exist in the array.`);
      const c = n || Number(n) == 0 ? n : i.length - 1, s = [
        ...i.slice(0, c),
        ...i.slice(c + 1)
      ];
      return e.length == 0 ? s : T([...e], u, s);
    },
    [
      ...e,
      n || n === 0 ? n?.toString() : (o.length - 1).toString()
    ],
    { updateType: "cut" }
  );
}
const w = (r, e, t = (n, o) => JSON.stringify(n) === JSON.stringify(o)) => {
  const [n, o] = U(
    () => e(m.getState(), r)
  ), u = b(n), i = b(r);
  return R(() => {
    i.current = r, o(e(m.getState(), r));
    const c = (f) => {
      const g = e(f, i.current);
      t(u.current, g) || (u.current = g, o(g));
    }, s = m.subscribe(c);
    return () => {
      s();
    };
  }, [r]), n;
}, Z = (r, e, t) => {
  const n = r + "." + (e.length > 0 ? [e.join(".")] : []) + (t && t.length > 0 ? "." + t : "");
  return w(
    n,
    (u, i) => u.getValidationErrors(i) || []
  );
}, q = (r, e) => {
  const t = `${r}:${e.join(".")}`;
  return w(
    t,
    (n, o) => n.getSyncInfo(o)
  );
}, H = (r, e) => w(
  `${r}:${e.join(".")}`,
  (t, n) => t.getNestedState(r, e)
), te = ({
  setState: r,
  // This is the real effectiveSetState from the hook
  path: e,
  child: t,
  formOpts: n,
  stateKey: o
}) => {
  const { registerFormRef: u, getFormRef: i } = L.getState(), {
    getValidationErrors: c,
    addValidationError: s,
    getInitialOptions: f,
    removeValidationError: g
  } = m.getState(), C = o + "." + e.join("."), $ = b(null), k = i(C);
  k || u(C, $);
  const z = k || $, v = H(o, e), [E, B] = U(v), S = b(!1), l = b(null);
  R(() => {
    !S.current && v !== E && B(v);
  }, [v]), R(() => () => {
    l.current && (clearTimeout(l.current), l.current = null, S.current = !1);
  }, []);
  const G = (a) => {
    if (B(a), S.current = !0, a === "") {
      l.current && (clearTimeout(l.current), l.current = null), j(r, a, e, d), S.current = !1;
      return;
    }
    l.current && clearTimeout(l.current), l.current = setTimeout(
      () => {
        S.current = !1, j(r, a, e, d);
      },
      n?.debounceTime ?? (typeof v == "boolean" ? 20 : 200)
    );
  }, y = f(o);
  if (!y?.validation?.key)
    throw new Error("Validation key not found.");
  const d = y.validation.key, A = y.validation.onBlur === !0, D = async () => {
    if (l.current && (clearTimeout(l.current), l.current = null, S.current = !1, j(r, E, e, d)), !(!y.validation?.zodSchema || !A)) {
      g(d + "." + e.join("."));
      try {
        const a = m.getState().getNestedState(o, e);
        await W(
          d,
          y.validation.zodSchema,
          e,
          a
        );
      } catch (a) {
        console.error("Validation error on blur:", a);
      }
    }
  }, F = q(o, e), J = F ? { ...F, date: new Date(F.timeStamp) } : null, P = t({
    // --- START CHANGES ---
    get: () => E,
    // Get should return the immediate local value
    set: G,
    // Use the new debounced updater
    // --- END CHANGES ---
    syncStatus: J,
    path: e,
    validationErrors: () => c(d + "." + e.join(".")),
    addValidationError: (a) => {
      g(d + "." + e.join(".")), s(d + "." + e.join("."), a ?? "");
    },
    inputProps: {
      // --- START CHANGES ---
      value: E ?? "",
      // Input value is always the local state
      onChange: (a) => G(a.target.value),
      // Use debounced updater
      // --- END CHANGES ---
      onBlur: D,
      ref: z
    }
  });
  return /* @__PURE__ */ V(M, { children: /* @__PURE__ */ V(Q, { formOpts: n, path: e, stateKey: o, children: P }) });
};
function Q({
  formOpts: r,
  path: e,
  stateKey: t,
  children: n,
  validIndices: o
}) {
  const { getInitialOptions: u } = m.getState(), i = u(t), c = i?.validation?.key ?? t, s = Z(
    c,
    e,
    o
  ), f = [];
  if (s) {
    const g = s.join(", ");
    f.includes(g) || f.push(g);
  }
  return /* @__PURE__ */ V(M, { children: i?.formElements?.validation && !r?.validation?.disable ? i.formElements.validation({
    children: /* @__PURE__ */ V(I.Fragment, { children: n }, e.toString()),
    active: s.length > 0,
    message: r?.validation?.hideMessage ? "" : r?.validation?.message ? r?.validation?.message : f.map((g) => g).join(", "),
    path: e
  }) : /* @__PURE__ */ V(I.Fragment, { children: n }, e.toString()) });
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
