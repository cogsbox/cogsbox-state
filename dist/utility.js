const a = (e) => e && typeof e == "object" && !Array.isArray(e) && e !== null, A = (e) => typeof e == "function", y = (e) => Array.isArray(e), g = (e, r, n = {}, t = []) => {
  if (a(e) && a(r)) {
    const i = Object.keys(e), l = Object.keys(r);
    if (i.length !== l.length)
      return !1;
    for (let f of i) {
      const o = e[f], s = r[f];
      if (!(f in e) || !(f in r))
        return !1;
      const c = [...t, f];
      if (!g(o, s, n, c))
        return !1;
    }
    return !0;
  } else if (y(e) && y(r)) {
    if (e.length !== r.length)
      return !1;
    for (let i = 0; i < e.length; i++)
      if (!g(e[i], r[i], n, [
        ...t,
        i.toString()
      ]))
        return !1;
    return !0;
  } else
    return e === r || Number.isNaN(e) && Number.isNaN(r);
};
function d(e, r, n) {
  if (!e || e.length === 0) return n;
  const t = e[0], i = e.slice(1);
  if (Array.isArray(r)) {
    const l = Number(t);
    if (!isNaN(l) && l >= 0 && l < r.length)
      return [
        ...r.slice(0, l),
        d(i, r[l], n),
        ...r.slice(l + 1)
      ];
    throw console.log("errorstate", r, e), new Error(
      `Invalid array index "${l}" in path "${e.join(".")}".`
    );
  } else if (typeof r == "object" && r !== null) {
    if (t && t in r)
      return {
        ...r,
        [t]: d(i, r[t], n)
      };
    throw console.log("Invalid property", t, i, e), new Error(
      `Invalid property "${t}" in path "${e.join(".")}".`
    );
  } else
    throw new Error(
      `Cannot update nested property at path "${e.join(".")}". The path does not exist.`
    );
}
function h(e, r) {
  if (!e || e.length === 0) return r;
  const n = e[0], t = e.slice(1);
  if (Array.isArray(r)) {
    const i = Number(n);
    if (!isNaN(i) && i >= 0 && i < r.length)
      return t.length === 0 ? [...r.slice(0, i), ...r.slice(i + 1)] : [
        ...r.slice(0, i),
        h(t, r[i]),
        ...r.slice(i + 1)
      ];
    throw new Error(
      `Invalid array index "${i}" in path "${e.join(".")}".`
    );
  } else if (typeof r == "object" && r !== null)
    if (t.length === 0) {
      const { [n]: i, ...l } = r;
      return l;
    } else {
      if (n in r)
        return {
          ...r,
          [n]: h(t, r[n])
        };
      throw new Error(
        `Invalid property "${n}" in path "${e.join(".")}".`
      );
    }
  else
    throw new Error(
      `Cannot delete nested property at path "${e.join(".")}". The path does not exist.`
    );
}
function w(e, r) {
  let n = e;
  for (let t = 0; t < r.length; t++) {
    const i = r[t];
    if (!i)
      throw new Error("Invalid path");
    if (Array.isArray(n))
      n = n[parseInt(i)];
    else {
      if (!n)
        return;
      n = n[i];
    }
  }
  return n;
}
function u(e, r, n = "") {
  let t = [];
  if (typeof e == "function" && typeof r == "function")
    return t;
  if (e == null || r === null || r === void 0)
    return e !== r ? [n] : t;
  if (typeof e != "object" || typeof r != "object")
    return e !== r ? [n] : t;
  if (Array.isArray(e) && Array.isArray(r)) {
    e.length !== r.length && t.push(`${n}.length`);
    const o = Math.min(e.length, r.length);
    for (let s = 0; s < o; s++)
      e[s] !== r[s] && (t = t.concat(
        u(e[s], r[s], `${n}[${s}]`)
      ));
    if (e.length !== r.length) {
      const s = e.length > r.length ? e : r;
      for (let c = o; c < s.length; c++)
        t.push(`${n}[${c}]`);
    }
    return t;
  }
  const i = Object.keys(e), l = Object.keys(r);
  return Array.from(/* @__PURE__ */ new Set([...i, ...l])).forEach((o) => {
    const s = n ? `${n}.${o}` : o;
    t = t.concat(
      u(e[o], r[o], s)
    );
  }), t;
}
function $(e, r) {
  return u(e, r).map(
    (t) => t.replace(/\[(\w+)\]/g, ".$1").split(".").filter(Boolean)
  );
}
function p(e, r, n = "") {
  let t = [];
  if (e == null || r === null || r === void 0)
    return t;
  if (Array.isArray(e) && Array.isArray(r))
    e.length !== r.length && t.push(n);
  else if (typeof e == "object" && typeof r == "object") {
    const i = /* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(r)]);
    for (const l of i) {
      const f = n ? `${n}.${l}` : l;
      (Array.isArray(e[l]) || Array.isArray(r[l])) && (t = t.concat(
        p(e[l], r[l], f)
      ));
    }
  }
  return t;
}
function m(e, r) {
  return p(e, r).map(
    (t) => t.replace(/\[(\w+)\]/g, ".$1").split(".").filter(Boolean)
  );
}
function v(e) {
  const r = (l) => Object.values(l).some(
    (f) => f?.hasOwnProperty("initialState")
  );
  let n = {};
  const t = (l) => {
    const f = {};
    return Object.entries(l).forEach(([o, s]) => {
      s?.initialState ? (n = { ...n ?? {}, [o]: s }, f[o] = { ...s.initialState }) : f[o] = s;
    }), f;
  };
  return [r(e) ? t(e) : e, n];
}
function N(e, r) {
  let n = null;
  const t = (...i) => {
    n && clearTimeout(n), n = setTimeout(() => e(...i), r);
  };
  return t.cancel = () => {
    n && (clearTimeout(n), n = null);
  }, t;
}
export {
  N as debounce,
  h as deleteNestedProperty,
  p as getArrayLengthDifferences,
  m as getArrayLengthDifferencesArray,
  u as getDifferences,
  $ as getDifferencesArray,
  w as getNestedValue,
  y as isArray,
  g as isDeepEqual,
  A as isFunction,
  a as isObject,
  v as transformStateFunc,
  d as updateNestedProperty
};
//# sourceMappingURL=utility.js.map
