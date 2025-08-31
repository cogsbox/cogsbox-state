const u = (e) => e && typeof e == "object" && !Array.isArray(e) && e !== null, $ = (e) => typeof e == "function", y = (e) => Array.isArray(e), d = (e, n, i = {}, r = []) => {
  if (u(e) && u(n)) {
    const t = Object.keys(e), l = Object.keys(n);
    if (t.length !== l.length)
      return !1;
    for (let s of t) {
      const o = e[s], f = n[s];
      if (!(s in e) || !(s in n))
        return !1;
      const c = [...r, s];
      if (!d(o, f, i, c))
        return !1;
    }
    return !0;
  } else if (y(e) && y(n)) {
    if (e.length !== n.length)
      return !1;
    for (let t = 0; t < e.length; t++)
      if (!d(e[t], n[t], i, [
        ...r,
        t.toString()
      ]))
        return !1;
    return !0;
  } else
    return e === n || Number.isNaN(e) && Number.isNaN(n);
};
function g(e, n, i) {
  if (!e || e.length === 0) return i;
  const r = e[0], t = e.slice(1);
  if (Array.isArray(n)) {
    const l = Number(r);
    if (!isNaN(l) && l >= 0 && l < n.length)
      return [
        ...n.slice(0, l),
        g(t, n[l], i),
        ...n.slice(l + 1)
      ];
    throw console.log("errorstate", n, e), new Error(
      `Invalid array index "${l}" in path "${e.join(".")}".`
    );
  } else if (typeof n == "object" && n !== null) {
    if (r && r in n)
      return {
        ...n,
        [r]: g(t, n[r], i)
      };
    throw console.log("Invalid property", r, t, e), new Error(
      `Invalid property "${r}" in path "${e.join(".")}".`
    );
  } else
    throw new Error(
      `Cannot update nested property at path "${e.join(".")}". The path does not exist.`
    );
}
function p(e, n) {
  if (!e || e.length === 0) return n;
  const i = e[0], r = e.slice(1);
  if (Array.isArray(n)) {
    const t = Number(i);
    if (!isNaN(t) && t >= 0 && t < n.length)
      return r.length === 0 ? [...n.slice(0, t), ...n.slice(t + 1)] : [
        ...n.slice(0, t),
        p(r, n[t]),
        ...n.slice(t + 1)
      ];
    throw new Error(
      `Invalid array index "${t}" in path "${e.join(".")}".`
    );
  } else if (typeof n == "object" && n !== null)
    if (r.length === 0) {
      const { [i]: t, ...l } = n;
      return l;
    } else {
      if (i in n)
        return {
          ...n,
          [i]: p(r, n[i])
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
function a(e, n, i = "") {
  let r = [];
  if (typeof e == "function" && typeof n == "function")
    return r;
  if (e == null || n === null || n === void 0)
    return e !== n ? [i] : r;
  if (typeof e != "object" || typeof n != "object")
    return e !== n ? [i] : r;
  if (Array.isArray(e) && Array.isArray(n)) {
    e.length !== n.length && r.push(`${i}`);
    const o = Math.min(e.length, n.length);
    for (let f = 0; f < o; f++)
      e[f] !== n[f] && (r = r.concat(
        a(
          e[f],
          n[f],
          i ? `${i}.${f}` : `${f}`
        )
      ));
    if (e.length !== n.length) {
      const f = e.length > n.length ? e : n;
      for (let c = o; c < f.length; c++)
        r.push(i ? `${i}.${c}` : `${c}`);
    }
    return r;
  }
  const t = Object.keys(e), l = Object.keys(n);
  return Array.from(/* @__PURE__ */ new Set([...t, ...l])).forEach((o) => {
    const f = i ? `${i}.${o}` : o;
    r = r.concat(
      a(e[o], n[o], f)
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
  return a(e, n).map(
    (r) => r.replace(/\[(\w+)\]/g, ".$1").split(".").filter(Boolean)
  );
}
function h(e, n, i = "") {
  let r = [];
  if (e == null || n === null || n === void 0)
    return r;
  if (Array.isArray(e) && Array.isArray(n))
    e.length !== n.length && r.push(i);
  else if (typeof e == "object" && typeof n == "object") {
    const t = /* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(n)]);
    for (const l of t) {
      const s = i ? `${i}.${l}` : l;
      (Array.isArray(e[l]) || Array.isArray(n[l])) && (r = r.concat(
        h(e[l], n[l], s)
      ));
    }
  }
  return r;
}
function m(e, n) {
  return h(e, n).map(
    (r) => r.replace(/\[(\w+)\]/g, ".$1").split(".").filter(Boolean)
  );
}
function N(e) {
  const n = (l) => Object.values(l).some(
    (s) => s?.hasOwnProperty("initialState")
  );
  let i = {};
  const r = (l) => {
    const s = {};
    return Object.entries(l).forEach(([o, f]) => {
      f?.initialState ? (i = { ...i ?? {}, [o]: f }, s[o] = f.initialState) : s[o] = f;
    }), s;
  };
  return [n(e) ? r(e) : e, i];
}
function O(e, n) {
  let i = null;
  const r = (...t) => {
    i && clearTimeout(i), i = setTimeout(() => e(...t), n);
  };
  return r.cancel = () => {
    i && (clearTimeout(i), i = null);
  }, r;
}
export {
  O as debounce,
  A as deepMerge,
  p as deleteNestedProperty,
  h as getArrayLengthDifferences,
  m as getArrayLengthDifferencesArray,
  a as getDifferences,
  w as getDifferencesArray,
  y as isArray,
  d as isDeepEqual,
  $ as isFunction,
  u as isObject,
  N as transformStateFunc,
  g as updateNestedProperty
};
//# sourceMappingURL=utility.js.map
