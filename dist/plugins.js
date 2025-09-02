import { useState as d } from "react";
function p() {
  function n(o) {
    const e = (t, i, r) => ({
      name: o,
      useHook: t,
      transformState: i,
      onUpdate: r
    }), s = (t) => {
      const i = e(t);
      return Object.assign(i, {
        transformState(r) {
          const c = e(
            t,
            r
          );
          return Object.assign(c, {
            onUpdate(g) {
              return e(
                t,
                r,
                g
              );
            }
          });
        },
        onUpdate(r) {
          return e(
            t,
            void 0,
            r
          );
        }
      });
    }, u = e();
    return Object.assign(u, {
      useHook(t) {
        return s(t);
      },
      transformState(t) {
        const i = e(
          void 0,
          t
        );
        return Object.assign(i, {
          onUpdate(r) {
            return e(
              void 0,
              t,
              r
            );
          }
        });
      },
      onUpdate(t) {
        return e(void 0, void 0, t);
      }
    });
  }
  return { createPlugin: n };
}
const { createPlugin: a } = p();
a(
  "analyticsPlugin"
).transformState(({ stateKey: n, cogsState: o }, e) => {
  n === "user" && o.$update({ test: "This works!" }), n === "address" && o.$update({ city: "London", country: "UK" });
});
a("fullPlugin").useHook(({ stateKey: n, cogsState: o }, e) => {
  const [s, u] = d(0);
  return {
    count: s,
    increment: () => u((t) => t + 1)
  };
}).transformState(({ stateKey: n, cogsState: o }, e, s) => {
  s && console.log(
    `[Logger] RENDER: Key '${n}' has been updated ${s.count} times.`
  );
}).onUpdate(({ stateKey: n, cogsState: o }, e, s, u) => {
  u && (console.log(`[Logger] UPDATE: Key '${n}' just changed.`), u.increment());
});
a("hookOnly").useHook((n, o) => ({ id: "test" }));
a("empty");
export {
  p as createPluginContext
};
//# sourceMappingURL=plugins.js.map
