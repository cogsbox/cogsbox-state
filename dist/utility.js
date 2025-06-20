const a = (e) => e && typeof e == "object" && !Array.isArray(e) && e !== null, A = (e) => typeof e == "function", y = (e) => Array.isArray(e), d = (e, n, r = {}, i = []) => {
  if (a(e) && a(n)) {
    const t = Object.keys(e), l = Object.keys(n);
    if (t.length !== l.length)
      return !1;
    for (let f of t) {
      const o = e[f], s = n[f];
      if (!(f in e) || !(f in n))
        return !1;
      const c = [...i, f];
      if (!d(o, s, r, c))
        return !1;
    }
    return !0;
  } else if (y(e) && y(n)) {
    if (e.length !== n.length)
      return !1;
    for (let t = 0; t < e.length; t++)
      if (!d(e[t], n[t], r, [
        ...i,
        t.toString()
      ]))
        return !1;
    return !0;
  } else
    return e === n || Number.isNaN(e) && Number.isNaN(n);
};
function g(e, n, r) {
  if (!e || e.length === 0) return r;
  const i = e[0], t = e.slice(1);
  if (Array.isArray(n)) {
    const l = Number(i);
    if (!isNaN(l) && l >= 0 && l < n.length)
      return [
        ...n.slice(0, l),
        g(t, n[l], r),
        ...n.slice(l + 1)
      ];
    throw console.log("errorstate", n, e), new Error(
      `Invalid array index "${l}" in path "${e.join(".")}".`
    );
  } else if (typeof n == "object" && n !== null) {
    if (i && i in n)
      return {
        ...n,
        [i]: g(t, n[i], r)
      };
    throw console.log("Invalid property", i, t, e), new Error(
      `Invalid property "${i}" in path "${e.join(".")}".`
    );
  } else
    throw new Error(
      `Cannot update nested property at path "${e.join(".")}". The path does not exist.`
    );
}
function h(e, n) {
  if (!e || e.length === 0) return n;
  const r = e[0], i = e.slice(1);
  if (Array.isArray(n)) {
    const t = Number(r);
    if (!isNaN(t) && t >= 0 && t < n.length)
      return i.length === 0 ? [...n.slice(0, t), ...n.slice(t + 1)] : [
        ...n.slice(0, t),
        h(i, n[t]),
        ...n.slice(t + 1)
      ];
    throw new Error(
      `Invalid array index "${t}" in path "${e.join(".")}".`
    );
  } else if (typeof n == "object" && n !== null)
    if (i.length === 0) {
      const { [r]: t, ...l } = n;
      return l;
    } else {
      if (r in n)
        return {
          ...n,
          [r]: h(i, n[r])
        };
      throw new Error(
        `Invalid property "${r}" in path "${e.join(".")}".`
      );
    }
  else
    throw new Error(
      `Cannot delete nested property at path "${e.join(".")}". The path does not exist.`
    );
}
function $(e, n) {
  let r = e;
  for (let i = 0; i < n.length; i++) {
    const t = n[i];
    if (!t)
      throw new Error("Invalid path");
    if (Array.isArray(r))
      r = r[parseInt(t)];
    else {
      if (!r)
        return;
      r = r[t];
    }
  }
  return r;
}
function u(e, n, r = "") {
  let i = [];
  if (typeof e == "function" && typeof n == "function")
    return i;
  if (e == null || n === null || n === void 0)
    return e !== n ? [r] : i;
  if (typeof e != "object" || typeof n != "object")
    return e !== n ? [r] : i;
  if (Array.isArray(e) && Array.isArray(n)) {
    e.length !== n.length && i.push(`${r}`);
    const o = Math.min(e.length, n.length);
    for (let s = 0; s < o; s++)
      e[s] !== n[s] && (i = i.concat(
        u(
          e[s],
          n[s],
          r ? `${r}.${s}` : `${s}`
        )
      ));
    if (e.length !== n.length) {
      const s = e.length > n.length ? e : n;
      for (let c = o; c < s.length; c++)
        i.push(r ? `${r}.${c}` : `${c}`);
    }
    return i;
  }
  const t = Object.keys(e), l = Object.keys(n);
  return Array.from(/* @__PURE__ */ new Set([...t, ...l])).forEach((o) => {
    const s = r ? `${r}.${o}` : o;
    i = i.concat(
      u(e[o], n[o], s)
    );
  }), i;
}
function w(e, n) {
  return u(e, n).map(
    (i) => i.replace(/\[(\w+)\]/g, ".$1").split(".").filter(Boolean)
  );
}
function p(e, n, r = "") {
  let i = [];
  if (e == null || n === null || n === void 0)
    return i;
  if (Array.isArray(e) && Array.isArray(n))
    e.length !== n.length && i.push(r);
  else if (typeof e == "object" && typeof n == "object") {
    const t = /* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(n)]);
    for (const l of t) {
      const f = r ? `${r}.${l}` : l;
      (Array.isArray(e[l]) || Array.isArray(n[l])) && (i = i.concat(
        p(e[l], n[l], f)
      ));
    }
  }
  return i;
}
function m(e, n) {
  return p(e, n).map(
    (i) => i.replace(/\[(\w+)\]/g, ".$1").split(".").filter(Boolean)
  );
}
function v(e) {
  const n = (l) => Object.values(l).some(
    (f) => f?.hasOwnProperty("initialState")
  );
  let r = {};
  const i = (l) => {
    const f = {};
    return Object.entries(l).forEach(([o, s]) => {
      s?.initialState ? (r = { ...r ?? {}, [o]: s }, f[o] = s.initialState) : f[o] = s;
    }), f;
  };
  return [n(e) ? i(e) : e, r];
}
function N(e, n) {
  let r = null;
  const i = (...t) => {
    r && clearTimeout(r), r = setTimeout(() => e(...t), n);
  };
  return i.cancel = () => {
    r && (clearTimeout(r), r = null);
  }, i;
}
export {
  N as debounce,
  h as deleteNestedProperty,
  p as getArrayLengthDifferences,
  m as getArrayLengthDifferencesArray,
  u as getDifferences,
  w as getDifferencesArray,
  $ as getNestedValue,
  y as isArray,
  d as isDeepEqual,
  A as isFunction,
  a as isObject,
  v as transformStateFunc,
  g as updateNestedProperty
};
//# sourceMappingURL=utility.js.map
