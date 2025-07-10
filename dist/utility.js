import { getGlobalStore as w } from "./store.js";
const c = (n) => n && typeof n == "object" && !Array.isArray(n) && n !== null, v = (n) => typeof n == "function", d = (n) => Array.isArray(n), g = (n, e, t = {}, r = []) => {
  if (c(n) && c(e)) {
    const i = Object.keys(n), s = Object.keys(e);
    if (i.length !== s.length)
      return !1;
    for (let o of i) {
      const f = n[o], l = e[o];
      if (!(o in n) || !(o in e))
        return !1;
      const a = [...r, o];
      if (!g(f, l, t, a))
        return !1;
    }
    return !0;
  } else if (d(n) && d(e)) {
    if (n.length !== e.length)
      return !1;
    for (let i = 0; i < n.length; i++)
      if (!g(n[i], e[i], t, [
        ...r,
        i.toString()
      ]))
        return !1;
    return !0;
  } else
    return n === e || Number.isNaN(n) && Number.isNaN(e);
};
function h(n, e, t) {
  if (!n || n.length === 0) return t;
  const r = n[0], i = n.slice(1);
  if (Array.isArray(e)) {
    const s = Number(r);
    if (!isNaN(s) && s >= 0 && s < e.length)
      return [
        ...e.slice(0, s),
        h(i, e[s], t),
        ...e.slice(s + 1)
      ];
    throw console.log("errorstate", e, n), new Error(
      `Invalid array index "${s}" in path "${n.join(".")}".`
    );
  } else if (typeof e == "object" && e !== null) {
    if (r && r in e)
      return {
        ...e,
        [r]: h(i, e[r], t)
      };
    throw console.log("Invalid property", r, i, n), new Error(
      `Invalid property "${r}" in path "${n.join(".")}".`
    );
  } else
    throw new Error(
      `Cannot update nested property at path "${n.join(".")}". The path does not exist.`
    );
}
function p(n, e) {
  if (!n || n.length === 0) return e;
  const t = n[0], r = n.slice(1);
  if (Array.isArray(e)) {
    const i = Number(t);
    if (!isNaN(i) && i >= 0 && i < e.length)
      return r.length === 0 ? [...e.slice(0, i), ...e.slice(i + 1)] : [
        ...e.slice(0, i),
        p(r, e[i]),
        ...e.slice(i + 1)
      ];
    throw new Error(
      `Invalid array index "${i}" in path "${n.join(".")}".`
    );
  } else if (typeof e == "object" && e !== null)
    if (r.length === 0) {
      const { [t]: i, ...s } = e;
      return s;
    } else {
      if (t in e)
        return {
          ...e,
          [t]: p(r, e[t])
        };
      throw new Error(
        `Invalid property "${t}" in path "${n.join(".")}".`
      );
    }
  else
    throw new Error(
      `Cannot delete nested property at path "${n.join(".")}". The path does not exist.`
    );
}
function N(n, e, t) {
  let r = n;
  for (let i = 0; i < e.length; i++) {
    const s = e[i];
    if (r == null)
      return;
    if (typeof s == "string" && s.startsWith("id:")) {
      if (!Array.isArray(r)) {
        console.error("Path segment with 'id:' requires an array.", {
          path: e,
          currentValue: r
        });
        return;
      }
      const o = e.slice(0, i), f = [t, ...o, s].join("."), l = [t, ...o].join("."), a = w.getState().shadowStateStore.get(l);
      if (!a?.arrayKeys) {
        console.error(
          "No arrayKeys found in shadow state for parent path:",
          l
        );
        return;
      }
      const y = a.arrayKeys.indexOf(f);
      if (y === -1) {
        console.error(
          `Item key ${f} not found in parent's arrayKeys:`,
          a.arrayKeys
        );
        return;
      }
      r = r[y];
    } else Array.isArray(r) ? r = r[parseInt(s)] : r = r[s];
  }
  return r;
}
function u(n, e, t = "") {
  let r = [];
  if (typeof n == "function" && typeof e == "function")
    return r;
  if (n == null || e === null || e === void 0)
    return n !== e ? [t] : r;
  if (typeof n != "object" || typeof e != "object")
    return n !== e ? [t] : r;
  if (Array.isArray(n) && Array.isArray(e)) {
    n.length !== e.length && r.push(`${t}`);
    const f = Math.min(n.length, e.length);
    for (let l = 0; l < f; l++)
      n[l] !== e[l] && (r = r.concat(
        u(
          n[l],
          e[l],
          t ? `${t}.${l}` : `${l}`
        )
      ));
    if (n.length !== e.length) {
      const l = n.length > e.length ? n : e;
      for (let a = f; a < l.length; a++)
        r.push(t ? `${t}.${a}` : `${a}`);
    }
    return r;
  }
  const i = Object.keys(n), s = Object.keys(e);
  return Array.from(/* @__PURE__ */ new Set([...i, ...s])).forEach((f) => {
    const l = t ? `${t}.${f}` : f;
    r = r.concat(
      u(n[f], e[f], l)
    );
  }), r;
}
function $(n, e) {
  const t = { ...n };
  return c(n) && c(e) && Object.keys(e).forEach((r) => {
    c(e[r]) ? r in n ? t[r] = $(n[r], e[r]) : Object.assign(t, { [r]: e[r] }) : Object.assign(t, { [r]: e[r] });
  }), t;
}
function S(n, e) {
  return u(n, e).map(
    (r) => r.replace(/\[(\w+)\]/g, ".$1").split(".").filter(Boolean)
  );
}
function A(n, e, t = "") {
  let r = [];
  if (n == null || e === null || e === void 0)
    return r;
  if (Array.isArray(n) && Array.isArray(e))
    n.length !== e.length && r.push(t);
  else if (typeof n == "object" && typeof e == "object") {
    const i = /* @__PURE__ */ new Set([...Object.keys(n), ...Object.keys(e)]);
    for (const s of i) {
      const o = t ? `${t}.${s}` : s;
      (Array.isArray(n[s]) || Array.isArray(e[s])) && (r = r.concat(
        A(n[s], e[s], o)
      ));
    }
  }
  return r;
}
function O(n, e) {
  return A(n, e).map(
    (r) => r.replace(/\[(\w+)\]/g, ".$1").split(".").filter(Boolean)
  );
}
function I(n) {
  const e = (s) => Object.values(s).some(
    (o) => o?.hasOwnProperty("initialState")
  );
  let t = {};
  const r = (s) => {
    const o = {};
    return Object.entries(s).forEach(([f, l]) => {
      l?.initialState ? (t = { ...t ?? {}, [f]: l }, o[f] = l.initialState) : o[f] = l;
    }), o;
  };
  return [e(n) ? r(n) : n, t];
}
function D(n, e) {
  let t = null;
  const r = (...i) => {
    t && clearTimeout(t), t = setTimeout(() => n(...i), e);
  };
  return r.cancel = () => {
    t && (clearTimeout(t), t = null);
  }, r;
}
export {
  D as debounce,
  $ as deepMerge,
  p as deleteNestedProperty,
  A as getArrayLengthDifferences,
  O as getArrayLengthDifferencesArray,
  u as getDifferences,
  S as getDifferencesArray,
  N as getNestedValue,
  d as isArray,
  g as isDeepEqual,
  v as isFunction,
  c as isObject,
  I as transformStateFunc,
  h as updateNestedProperty
};
//# sourceMappingURL=utility.js.map
