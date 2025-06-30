import { jsx as V, Fragment as C } from "react/jsx-runtime";
import "./CogsState.jsx";
import { isFunction as G, getNestedValue as R, updateNestedPropertyIds as w } from "./utility.js";
import k, { useRef as b, useState as D, useEffect as T } from "react";
import { getGlobalStore as m, formRefStore as x } from "./store.js";
import { validateZodPathFunc as K } from "./useValidateZodPath.js";
import { ulid as L } from "ulid";
function F(n, e, t, r) {
  n(
    (i) => {
      if (G(e)) {
        const s = e(R(i, t));
        console.group("nestedValue", t, s);
        let o = w(t, i, s);
        return console.group("updateFn", o), typeof o == "string" && (o = o.trim()), o;
      } else {
        let s = !t || t.length == 0 ? e : w(t, i, e);
        return typeof s == "string" && (s = s.trim()), s;
      }
    },
    t,
    { updateType: "update" },
    r
  );
}
function te(n, e, t, r, i) {
  const s = m.getState().getNestedState(r, t) || [], o = G(e) ? e(s) : e;
  typeof o == "object" && o !== null && !o.id && (o.id = L());
  const f = o.id;
  n(
    (c) => {
      const u = [...R(c, [...t]) || []];
      return u.splice(u.length, 0, o), w([...t], c, u);
    },
    [...t, `id:${f}`],
    // Now we use the ID that is guaranteed to be correct.
    {
      updateType: "insert"
    }
  );
}
function ne(n, e, t, r) {
  const i = [t, ...e].join("."), o = m.getState().shadowStateStore.get(i)?.arrayKeys?.[r];
  if (!o)
    throw new Error(`No ID found for index ${r} in array`);
  n(
    (f) => {
      const c = R(f, [...e]);
      if (r < 0 || r >= c?.length)
        throw new Error(`Index ${r} does not exist in the array.`);
      const d = [
        ...c.slice(0, r),
        ...c.slice(r + 1)
      ];
      return e.length == 0 ? d : w([...e], f, d);
    },
    [...e, o],
    // Use the ID here!
    { updateType: "cut" }
  );
}
const I = (n, e, t = (r, i) => JSON.stringify(r) === JSON.stringify(i)) => {
  const [r, i] = D(
    () => e(m.getState(), n)
  ), s = b(r), o = b(n);
  return T(() => {
    o.current = n, i(e(m.getState(), n));
    const f = (d) => {
      const u = e(d, o.current);
      t(s.current, u) || (s.current = u, i(u));
    }, c = m.subscribe(f);
    return () => {
      c();
    };
  }, [n]), r;
}, W = (n, e, t) => {
  const r = n + "." + (e.length > 0 ? [e.join(".")] : []) + (t && t.length > 0 ? "." + t : "");
  return I(
    r,
    (s, o) => s.getValidationErrors(o) || []
  );
}, Z = (n, e) => {
  const t = `${n}:${e.join(".")}`;
  return I(
    t,
    (r, i) => r.getSyncInfo(i)
  );
}, p = (n, e) => I(
  `${n}:${e.join(".")}`,
  (t, r) => t.getNestedState(n, e)
), re = ({
  setState: n,
  // This is the real effectiveSetState from the hook
  path: e,
  child: t,
  formOpts: r,
  stateKey: i
}) => {
  const { registerFormRef: s, getFormRef: o } = x.getState(), {
    getValidationErrors: f,
    addValidationError: c,
    getInitialOptions: d,
    removeValidationError: u
  } = m.getState(), N = i + "." + e.join("."), $ = b(null), B = o(N);
  B || s(N, $);
  const O = B || $, y = p(i, e), [E, M] = D(y), S = b(!1), a = b(null);
  T(() => {
    !S.current && y !== E && M(y);
  }, [y]), T(() => () => {
    a.current && (clearTimeout(a.current), a.current = null, S.current = !1);
  }, []);
  const U = (l) => {
    if (M(l), S.current = !0, l === "") {
      a.current && (clearTimeout(a.current), a.current = null), F(n, l, e, g), S.current = !1;
      return;
    }
    a.current && clearTimeout(a.current), a.current = setTimeout(
      () => {
        S.current = !1, F(n, l, e, g);
      },
      r?.debounceTime ?? (typeof y == "boolean" ? 20 : 200)
    );
  }, v = d(i);
  if (!v?.validation?.key)
    throw new Error("Validation key not found.");
  const g = v.validation.key, z = v.validation.onBlur === !0, A = async () => {
    if (a.current && (clearTimeout(a.current), a.current = null, S.current = !1, F(n, E, e, g)), !(!v.validation?.zodSchema || !z)) {
      u(g + "." + e.join("."));
      try {
        const l = m.getState().getNestedState(i, e);
        await K(
          g,
          v.validation.zodSchema,
          e,
          l
        );
      } catch (l) {
        console.error("Validation error on blur:", l);
      }
    }
  }, j = Z(i, e), J = j ? { ...j, date: new Date(j.timeStamp) } : null, P = t({
    // --- START CHANGES ---
    get: () => E,
    // Get should return the immediate local value
    set: U,
    // Use the new debounced updater
    // --- END CHANGES ---
    syncStatus: J,
    path: e,
    validationErrors: () => f(g + "." + e.join(".")),
    addValidationError: (l) => {
      u(g + "." + e.join(".")), c(g + "." + e.join("."), l ?? "");
    },
    inputProps: {
      // --- START CHANGES ---
      value: E ?? "",
      // Input value is always the local state
      onChange: (l) => U(l.target.value),
      // Use debounced updater
      // --- END CHANGES ---
      onBlur: A,
      ref: O
    }
  });
  return /* @__PURE__ */ V(C, { children: /* @__PURE__ */ V(q, { formOpts: r, path: e, stateKey: i, children: P }) });
};
function q({
  formOpts: n,
  path: e,
  stateKey: t,
  children: r,
  validIndices: i
}) {
  const { getInitialOptions: s } = m.getState(), o = s(t), f = o?.validation?.key ?? t, c = W(
    f,
    e,
    i
  ), d = [];
  if (c) {
    const u = c.join(", ");
    d.includes(u) || d.push(u);
  }
  return /* @__PURE__ */ V(C, { children: o?.formElements?.validation && !n?.validation?.disable ? o.formElements.validation({
    children: /* @__PURE__ */ V(k.Fragment, { children: r }, e.toString()),
    active: c.length > 0,
    message: n?.validation?.hideMessage ? "" : n?.validation?.message ? n?.validation?.message : d.map((u) => u).join(", "),
    path: e
  }) : /* @__PURE__ */ V(k.Fragment, { children: r }, e.toString()) });
}
export {
  re as FormControlComponent,
  q as ValidationWrapper,
  ne as cutFunc,
  te as pushFunc,
  F as updateFn,
  p as useGetKeyState,
  Z as useGetSyncInfo,
  W as useGetValidationErrors,
  I as useStoreSubscription
};
//# sourceMappingURL=Functions.jsx.map
