import { useState as S } from "react";
function f() {
  function n(o) {
    const r = (e, s, i, u, c) => ({
      name: o,
      useHook: e,
      transformState: s,
      onUpdate: i,
      onFormUpdate: u,
      formWrapper: c
    });
    function t(e, s, i, u, c) {
      const y = r(
        e,
        s,
        i,
        u,
        c
      ), l = {};
      return s || (l.transformState = (g) => t(e, g, i, u, c)), i || (l.onUpdate = (g) => t(e, s, g, u, c)), u || (l.onFormUpdate = (g) => t(
        e,
        s,
        i,
        g,
        c
      )), c || (l.formWrapper = (g) => t(e, s, i, u, g)), Object.assign(y, l);
    }
    return Object.assign(
      t(),
      {
        useHook(e) {
          return t(e);
        }
      }
    );
  }
  return { createPlugin: n };
}
const { createPlugin: P } = f();
P("analyticsPlugin").transformState(
  ({ stateKey: n, cogsState: o }, r) => {
    n === "user" && o.$update({ test: "This works!" }), n === "address" && o.$update({ city: "London", country: "UK" });
  }
);
P("fullPlugin").useHook(({ stateKey: n, cogsState: o }, r) => {
  const [t, a] = S(0);
  return {
    count: t,
    increment: () => a((e) => e + 1)
  };
}).transformState(({ stateKey: n, cogsState: o }, r, t) => {
  t && console.log(
    `[Logger] RENDER: Key '${n}' has been updated ${t.count} times.`
  );
}).onUpdate(({ stateKey: n, cogsState: o }, r, t, a) => {
  a && (console.log(`[Logger] UPDATE: Key '${n}' just changed.`), a.increment());
});
P("hookOnly").useHook((n, o) => ({ id: "test" }));
P("empty");
export {
  f as createPluginContext
};
//# sourceMappingURL=plugins.js.map
