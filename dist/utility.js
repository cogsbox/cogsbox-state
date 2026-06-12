const u = (e) => e && typeof e == "object" && !Array.isArray(e) && e !== null, $ = (e) => typeof e == "function", a = (e) => Array.isArray(e), g = (e, n, i = {}, r = []) => {
  if (u(e) && u(n)) {
    const l = Object.keys(e), t = Object.keys(n);
    if (l.length !== t.length)
      return !1;
    for (let o of l) {
      const s = e[o], f = n[o];
      if (!(o in e) || !(o in n))
        return !1;
      const c = [...r, o];
      if (!g(s, f, i, c))
        return !1;
    }
    return !0;
  } else if (a(e) && a(n)) {
    if (e.length !== n.length)
      return !1;
    for (let l = 0; l < e.length; l++)
      if (!g(e[l], n[l], i, [
        ...r,
        l.toString()
      ]))
        return !1;
    return !0;
  } else
    return e === n || Number.isNaN(e) && Number.isNaN(n);
};
function d(e, n, i) {
  if (!e || e.length === 0) return i;
  const r = e[0], l = e.slice(1);
  if (Array.isArray(n)) {
    const t = Number(r);
    if (!isNaN(t) && t >= 0 && t < n.length)
      return [
        ...n.slice(0, t),
        d(l, n[t], i),
        ...n.slice(t + 1)
      ];
    throw console.log("errorstate", n, e), new Error(
      `Invalid array index "${t}" in path "${e.join(".")}".`
    );
  } else if (typeof n == "object" && n !== null) {
    if (r && r in n)
      return {
        ...n,
        [r]: d(l, n[r], i)
      };
    throw console.log("Invalid property", r, l, e), new Error(
      `Invalid property "${r}" in path "${e.join(".")}".`
    );
  } else
    throw new Error(
      `Cannot update nested property at path "${e.join(".")}". The path does not exist.`
    );
}
function h(e, n) {
  if (!e || e.length === 0) return n;
  const i = e[0], r = e.slice(1);
  if (Array.isArray(n)) {
    const l = Number(i);
    if (!isNaN(l) && l >= 0 && l < n.length)
      return r.length === 0 ? [...n.slice(0, l), ...n.slice(l + 1)] : [
        ...n.slice(0, l),
        h(r, n[l]),
        ...n.slice(l + 1)
      ];
    throw new Error(
      `Invalid array index "${l}" in path "${e.join(".")}".`
    );
  } else if (typeof n == "object" && n !== null)
    if (r.length === 0) {
      const { [i]: l, ...t } = n;
      return t;
    } else {
      if (i in n)
        return {
          ...n,
          [i]: h(r, n[i])
        };
      throw new Error(
        `Invalid property "${i}" in path "${e.join(".")}".`
      );
    }
  else
    throw new Error(
      `Cannot delete nested property at path "${e.join(".")}". The path does not exist.`
    );
}
function y(e, n, i = "") {
  let r = [];
  if (typeof e == "function" && typeof n == "function")
    return r;
  if (e == null || n === null || n === void 0)
    return e !== n ? [i] : r;
  if (typeof e != "object" || typeof n != "object")
    return e !== n ? [i] : r;
  if (Array.isArray(e) && Array.isArray(n)) {
    e.length !== n.length && r.push(`${i}`);
    const s = Math.min(e.length, n.length);
    for (let f = 0; f < s; f++)
      e[f] !== n[f] && (r = r.concat(
        y(
          e[f],
          n[f],
          i ? `${i}.${f}` : `${f}`
        )
      ));
    if (e.length !== n.length) {
      const f = e.length > n.length ? e : n;
      for (let c = s; c < f.length; c++)
        r.push(i ? `${i}.${c}` : `${c}`);
    }
    return r;
  }
  const l = Object.keys(e), t = Object.keys(n);
  return Array.from(/* @__PURE__ */ new Set([...l, ...t])).forEach((s) => {
    const f = i ? `${i}.${s}` : s;
    r = r.concat(
      y(e[s], n[s], f)
    );
  }), r;
}
function A(e, n) {
  const i = { ...e };
  return u(e) && u(n) && Object.keys(n).forEach((r) => {
    u(n[r]) ? r in e ? i[r] = A(e[r], n[r]) : Object.assign(i, { [r]: n[r] }) : Object.assign(i, { [r]: n[r] });
  }), i;
}
function w(e, n) {
  return y(e, n).map(
    (r) => r.replace(/\[(\w+)\]/g, ".$1").split(".").filter(Boolean)
  );
}
function p(e, n, i = "") {
  let r = [];
  if (e == null || n === null || n === void 0)
    return r;
  if (Array.isArray(e) && Array.isArray(n))
    e.length !== n.length && r.push(i);
  else if (typeof e == "object" && typeof n == "object") {
    const l = /* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(n)]);
    for (const t of l) {
      const o = i ? `${i}.${t}` : t;
      (Array.isArray(e[t]) || Array.isArray(n[t])) && (r = r.concat(
        p(e[t], n[t], o)
      ));
    }
  }
  return r;
}
function v(e, n) {
  return p(e, n).map(
    (r) => r.replace(/\[(\w+)\]/g, ".$1").split(".").filter(Boolean)
  );
}
function N(e, n) {
  let i = null;
  const r = (...l) => {
    i && clearTimeout(i), i = setTimeout(() => e(...l), n);
  };
  return r.cancel = () => {
    i && (clearTimeout(i), i = null);
  }, r;
}
function m(e) {
  return [e, {}];
}
export {
  N as debounce,
  A as deepMerge,
  h as deleteNestedProperty,
  p as getArrayLengthDifferences,
  v as getArrayLengthDifferencesArray,
  y as getDifferences,
  w as getDifferencesArray,
  a as isArray,
  g as isDeepEqual,
  $ as isFunction,
  u as isObject,
  m as transformStateFunc,
  d as updateNestedProperty
};
//# sourceMappingURL=utility.js.map
