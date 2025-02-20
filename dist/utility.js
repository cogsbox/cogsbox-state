const a = (e) => e && typeof e == "object" && !Array.isArray(e) && e !== null, A = (e) => typeof e == "function", u = (e) => Array.isArray(e), g = (e, r, i = {}, n = []) => {
  if (a(e) && a(r)) {
    const t = Object.keys(e), l = Object.keys(r);
    if (t.length !== l.length)
      return !1;
    for (let f of t) {
      const o = e[f], s = r[f];
      if (!(f in e) || !(f in r))
        return !1;
      const c = [...n, f];
      if (!g(o, s, i, c))
        return !1;
    }
    return !0;
  } else if (u(e) && u(r)) {
    if (e.length !== r.length)
      return !1;
    for (let t = 0; t < e.length; t++)
      if (!g(e[t], r[t], i, [
        ...n,
        t.toString()
      ]))
        return !1;
    return !0;
  } else
    return e === r || Number.isNaN(e) && Number.isNaN(r);
};
function d(e, r, i) {
  if (!e || e.length === 0) return i;
  const n = e[0], t = e.slice(1);
  if (Array.isArray(r)) {
    const l = Number(n);
    if (!isNaN(l) && l >= 0 && l < r.length)
      return [
        ...r.slice(0, l),
        d(t, r[l], i),
        ...r.slice(l + 1)
      ];
    throw console.log("errorstate", r, e), new Error(
      `Invalid array index "${l}" in path "${e.join(".")}".`
    );
  } else if (typeof r == "object" && r !== null) {
    if (n && n in r)
      return {
        ...r,
        [n]: d(t, r[n], i)
      };
    throw console.log("Invalid property", n, t, e), new Error(
      `Invalid property "${n}" in path "${e.join(".")}".`
    );
  } else
    throw new Error(
      `Cannot update nested property at path "${e.join(".")}". The path does not exist.`
    );
}
function h(e, r) {
  if (!e || e.length === 0) return r;
  const i = e[0], n = e.slice(1);
  if (Array.isArray(r)) {
    const t = Number(i);
    if (!isNaN(t) && t >= 0 && t < r.length)
      return n.length === 0 ? [...r.slice(0, t), ...r.slice(t + 1)] : [
        ...r.slice(0, t),
        h(n, r[t]),
        ...r.slice(t + 1)
      ];
    throw new Error(
      `Invalid array index "${t}" in path "${e.join(".")}".`
    );
  } else if (typeof r == "object" && r !== null)
    if (n.length === 0) {
      const { [i]: t, ...l } = r;
      return l;
    } else {
      if (i in r)
        return {
          ...r,
          [i]: h(n, r[i])
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
function w(e, r) {
  let i = e;
  for (let n = 0; n < r.length; n++) {
    const t = r[n];
    if (!t)
      throw new Error("Invalid path");
    if (Array.isArray(i))
      i = i[parseInt(t)];
    else {
      if (!i)
        return;
      i = i[t];
    }
  }
  return i;
}
function y(e, r, i = "") {
  let n = [];
  if (typeof e == "function" && typeof r == "function")
    return n;
  if (e == null || r === null || r === void 0)
    return e !== r ? [i] : n;
  if (typeof e != "object" || typeof r != "object")
    return e !== r ? [i] : n;
  if (Array.isArray(e) && Array.isArray(r)) {
    e.length !== r.length && n.push(`${i}.length`);
    const o = Math.min(e.length, r.length);
    for (let s = 0; s < o; s++)
      e[s] !== r[s] && (n = n.concat(
        y(e[s], r[s], `${i}[${s}]`)
      ));
    if (e.length !== r.length) {
      const s = e.length > r.length ? e : r;
      for (let c = o; c < s.length; c++)
        n.push(`${i}[${c}]`);
    }
    return n;
  }
  const t = Object.keys(e), l = Object.keys(r);
  return Array.from(/* @__PURE__ */ new Set([...t, ...l])).forEach((o) => {
    const s = i ? `${i}.${o}` : o;
    n = n.concat(
      y(e[o], r[o], s)
    );
  }), n;
}
function $(e, r) {
  return y(e, r).map(
    (n) => n.replace(/\[(\w+)\]/g, ".$1").split(".").filter(Boolean)
  );
}
function p(e, r, i = "") {
  let n = [];
  if (e == null || r === null || r === void 0)
    return n;
  if (Array.isArray(e) && Array.isArray(r))
    e.length !== r.length && n.push(i);
  else if (typeof e == "object" && typeof r == "object") {
    const t = /* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(r)]);
    for (const l of t) {
      const f = i ? `${i}.${l}` : l;
      (Array.isArray(e[l]) || Array.isArray(r[l])) && (n = n.concat(
        p(e[l], r[l], f)
      ));
    }
  }
  return n;
}
function v(e, r) {
  return p(e, r).map(
    (n) => n.replace(/\[(\w+)\]/g, ".$1").split(".").filter(Boolean)
  );
}
function N(e) {
  const r = (l) => Object.values(l).some(
    (f) => f?.hasOwnProperty("initialState")
  );
  let i = {};
  const n = (l) => {
    const f = {};
    return Object.entries(l).forEach(([o, s]) => {
      s?.initialState ? (i = { ...i ?? {}, [o]: s }, f[o] = { ...s.initialState }) : f[o] = s;
    }), f;
  };
  return [r(e) ? n(e) : e, i];
}
export {
  h as deleteNestedProperty,
  p as getArrayLengthDifferences,
  v as getArrayLengthDifferencesArray,
  y as getDifferences,
  $ as getDifferencesArray,
  w as getNestedValue,
  u as isArray,
  g as isDeepEqual,
  A as isFunction,
  a as isObject,
  N as transformStateFunc,
  d as updateNestedProperty
};
//# sourceMappingURL=utility.js.map
