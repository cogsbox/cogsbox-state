const y = (r) => r && typeof r == "object" && !Array.isArray(r) && r !== null, w = (r) => typeof r == "function", u = (r) => Array.isArray(r), d = (r, e, n = {}, i = []) => {
  if (y(r) && y(e)) {
    const t = Object.keys(r), s = Object.keys(e);
    if (t.length !== s.length)
      return !1;
    for (let f of t) {
      const l = r[f], o = e[f];
      if (!(f in r) || !(f in e))
        return !1;
      const a = [...i, f];
      if (!d(l, o, n, a))
        return !1;
    }
    return !0;
  } else if (u(r) && u(e)) {
    if (r.length !== e.length)
      return !1;
    for (let t = 0; t < r.length; t++)
      if (!d(r[t], e[t], n, [
        ...i,
        t.toString()
      ]))
        return !1;
    return !0;
  } else
    return r === e || Number.isNaN(r) && Number.isNaN(e);
};
function g(r, e, n) {
  if (!r || r.length === 0) return n;
  const i = r[0], t = r.slice(1);
  if (Array.isArray(e)) {
    const s = Number(i);
    if (!isNaN(s) && s >= 0 && s < e.length)
      return [
        ...e.slice(0, s),
        g(t, e[s], n),
        ...e.slice(s + 1)
      ];
    throw console.log("errorstate", e, r), new Error(
      `Invalid array index "${s}" in path "${r.join(".")}".`
    );
  } else if (typeof e == "object" && e !== null) {
    if (i && i in e)
      return {
        ...e,
        [i]: g(t, e[i], n)
      };
    throw console.log("Invalid property", i, t, r), new Error(
      `Invalid property "${i}" in path "${r.join(".")}".`
    );
  } else
    throw new Error(
      `Cannot update nested property at path "${r.join(".")}". The path does not exist.`
    );
}
function h(r, e) {
  if (!r || r.length === 0) return e;
  const n = r[0], i = r.slice(1);
  if (Array.isArray(e)) {
    const t = Number(n);
    if (!isNaN(t) && t >= 0 && t < e.length)
      return i.length === 0 ? [...e.slice(0, t), ...e.slice(t + 1)] : [
        ...e.slice(0, t),
        h(i, e[t]),
        ...e.slice(t + 1)
      ];
    throw new Error(
      `Invalid array index "${t}" in path "${r.join(".")}".`
    );
  } else if (typeof e == "object" && e !== null)
    if (i.length === 0) {
      const { [n]: t, ...s } = e;
      return s;
    } else {
      if (n in e)
        return {
          ...e,
          [n]: h(i, e[n])
        };
      throw new Error(
        `Invalid property "${n}" in path "${r.join(".")}".`
      );
    }
  else
    throw new Error(
      `Cannot delete nested property at path "${r.join(".")}". The path does not exist.`
    );
}
function $(r, e) {
  let n = r;
  for (let i = 0; i < e.length; i++) {
    const t = e[i];
    if (n == null)
      return;
    if (typeof t == "string" && t.startsWith("id:")) {
      if (!Array.isArray(n)) {
        console.error("Path segment with 'id:' requires an array.", {
          path: e,
          currentValue: n
        });
        return;
      }
      const s = t.split(":")[1];
      n = n.find((f) => String(f.id) === s);
    } else Array.isArray(n) ? n = n[parseInt(t)] : n = n[t];
  }
  return n;
}
function m(r, e, n) {
  if (r.length === 0)
    return n;
  const i = Array.isArray(e) ? [...e] : { ...e };
  let t = i;
  for (let f = 0; f < r.length - 1; f++) {
    const l = r[f];
    if (typeof l == "string" && l.startsWith("id:")) {
      if (!Array.isArray(t))
        throw new Error(
          `Path segment "${l}" requires an array, but got a non-array.`
        );
      const o = l.split(":")[1], a = t.findIndex(
        (p) => String(p.id) === o
      );
      if (a === -1)
        throw new Error(`Item with id "${o}" not found in array.`);
      t[a] = { ...t[a] }, t = t[a];
    } else
      t[l] = Array.isArray(t[l]) ? [...t[l]] : { ...t[l] }, t = t[l];
  }
  const s = r[r.length - 1];
  if (typeof s == "string" && s.startsWith("id:")) {
    if (!Array.isArray(t))
      throw new Error(
        `Final path segment "${s}" requires an array, but got a non-array.`
      );
    const f = s.split(":")[1], l = t.findIndex(
      (o) => String(o.id) === f
    );
    if (l === -1)
      throw new Error(
        `Item with id "${f}" not found in array to update.`
      );
    t[l] = n;
  } else
    t[s] = n;
  return i;
}
function c(r, e, n = "") {
  let i = [];
  if (typeof r == "function" && typeof e == "function")
    return i;
  if (r == null || e === null || e === void 0)
    return r !== e ? [n] : i;
  if (typeof r != "object" || typeof e != "object")
    return r !== e ? [n] : i;
  if (Array.isArray(r) && Array.isArray(e)) {
    r.length !== e.length && i.push(`${n}`);
    const l = Math.min(r.length, e.length);
    for (let o = 0; o < l; o++)
      r[o] !== e[o] && (i = i.concat(
        c(
          r[o],
          e[o],
          n ? `${n}.${o}` : `${o}`
        )
      ));
    if (r.length !== e.length) {
      const o = r.length > e.length ? r : e;
      for (let a = l; a < o.length; a++)
        i.push(n ? `${n}.${a}` : `${a}`);
    }
    return i;
  }
  const t = Object.keys(r), s = Object.keys(e);
  return Array.from(/* @__PURE__ */ new Set([...t, ...s])).forEach((l) => {
    const o = n ? `${n}.${l}` : l;
    i = i.concat(
      c(r[l], e[l], o)
    );
  }), i;
}
function I(r, e) {
  return c(r, e).map(
    (i) => i.replace(/\[(\w+)\]/g, ".$1").split(".").filter(Boolean)
  );
}
function A(r, e, n = "") {
  let i = [];
  if (r == null || e === null || e === void 0)
    return i;
  if (Array.isArray(r) && Array.isArray(e))
    r.length !== e.length && i.push(n);
  else if (typeof r == "object" && typeof e == "object") {
    const t = /* @__PURE__ */ new Set([...Object.keys(r), ...Object.keys(e)]);
    for (const s of t) {
      const f = n ? `${n}.${s}` : s;
      (Array.isArray(r[s]) || Array.isArray(e[s])) && (i = i.concat(
        A(r[s], e[s], f)
      ));
    }
  }
  return i;
}
function v(r, e) {
  return A(r, e).map(
    (i) => i.replace(/\[(\w+)\]/g, ".$1").split(".").filter(Boolean)
  );
}
function N(r) {
  const e = (s) => Object.values(s).some(
    (f) => f?.hasOwnProperty("initialState")
  );
  let n = {};
  const i = (s) => {
    const f = {};
    return Object.entries(s).forEach(([l, o]) => {
      o?.initialState ? (n = { ...n ?? {}, [l]: o }, f[l] = o.initialState) : f[l] = o;
    }), f;
  };
  return [e(r) ? i(r) : r, n];
}
function S(r, e) {
  let n = null;
  const i = (...t) => {
    n && clearTimeout(n), n = setTimeout(() => r(...t), e);
  };
  return i.cancel = () => {
    n && (clearTimeout(n), n = null);
  }, i;
}
export {
  S as debounce,
  h as deleteNestedProperty,
  A as getArrayLengthDifferences,
  v as getArrayLengthDifferencesArray,
  c as getDifferences,
  I as getDifferencesArray,
  $ as getNestedValue,
  u as isArray,
  d as isDeepEqual,
  w as isFunction,
  y as isObject,
  N as transformStateFunc,
  g as updateNestedProperty,
  m as updateNestedPropertyIds
};
//# sourceMappingURL=utility.js.map
